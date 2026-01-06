import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Você precisa estar logado' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'CANDIDATE') {
      return NextResponse.json(
        { success: false, error: 'Apenas candidatos podem se candidatar' },
        { status: 403 }
      );
    }

    // Buscar candidato
    const candidate = await prisma.candidate.findUnique({
      where: { userId: session.user.id },
    });

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Perfil de candidato não encontrado' },
        { status: 404 }
      );
    }

    // Buscar vaga
    const job = await prisma.job.findFirst({
      where: {
        slug: params.slug,
        status: 'ACTIVE',
      },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Vaga não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se já candidatou
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId: job.id,
          candidateId: candidate.id,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'Você já se candidatou a esta vaga' },
        { status: 400 }
      );
    }

    // Dados opcionais do body
    const body = await request.json().catch(() => ({}));

    // Calcular match score (simplificado)
    let matchScore = 0;
    if (candidate.skills && candidate.skills.length > 0) {
      // Extrair palavras-chave da descrição da vaga
      const jobKeywords = job.description.toLowerCase().split(/\s+/);
      const candidateSkills = candidate.skills.map(s => s.toLowerCase());
      
      let matches = 0;
      for (const skill of candidateSkills) {
        if (jobKeywords.some(kw => kw.includes(skill) || skill.includes(kw))) {
          matches++;
        }
      }
      matchScore = Math.min(Math.round((matches / candidateSkills.length) * 100), 100);
    }

    // Criar candidatura
    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        candidateId: candidate.id,
        coverLetter: body.coverLetter || null,
        matchScore,
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'APPLY',
        entity: 'Application',
        entityId: application.id,
        details: { jobId: job.id, jobTitle: job.title },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Candidatura enviada com sucesso!',
      data: application,
    });
  } catch (error) {
    console.error('Erro ao candidatar:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
