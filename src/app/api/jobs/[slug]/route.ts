import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const job = await prisma.job.findFirst({
      where: {
        slug: params.slug,
        status: 'ACTIVE',
      },
      include: {
        company: {
          select: {
            id: true,
            tradeName: true,
            legalName: true,
            logoUrl: true,
            description: true,
            website: true,
            segment: true,
            cities: { include: { city: true } },
          },
        },
        area: true,
        cities: { include: { city: true } },
        _count: {
          select: { applications: true, favorites: true },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Vaga não encontrada' },
        { status: 404 }
      );
    }

    // Incrementar visualizações
    await prisma.job.update({
      where: { id: job.id },
      data: { viewCount: { increment: 1 } },
    });

    // Verificar se usuário já candidatou
    const session = await getServerSession(authOptions);
    let hasApplied = false;
    let isFavorited = false;

    if (session?.user?.role === 'CANDIDATE') {
      const candidate = await prisma.candidate.findUnique({
        where: { userId: session.user.id },
      });

      if (candidate) {
        const [application, favorite] = await Promise.all([
          prisma.application.findUnique({
            where: {
              jobId_candidateId: {
                jobId: job.id,
                candidateId: candidate.id,
              },
            },
          }),
          prisma.favoriteJob.findUnique({
            where: {
              candidateId_jobId: {
                candidateId: candidate.id,
                jobId: job.id,
              },
            },
          }),
        ]);

        hasApplied = !!application;
        isFavorited = !!favorite;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...job,
        hasApplied,
        isFavorited,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar vaga:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
