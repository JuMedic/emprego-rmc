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
        { success: false, error: 'Apenas candidatos podem favoritar' },
        { status: 403 }
      );
    }

    const candidate = await prisma.candidate.findUnique({
      where: { userId: session.user.id },
    });

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Perfil de candidato não encontrado' },
        { status: 404 }
      );
    }

    const job = await prisma.job.findFirst({
      where: { slug: params.slug },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Vaga não encontrada' },
        { status: 404 }
      );
    }

    // Toggle favorito
    const existingFavorite = await prisma.favoriteJob.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: candidate.id,
          jobId: job.id,
        },
      },
    });

    if (existingFavorite) {
      await prisma.favoriteJob.delete({
        where: {
          candidateId_jobId: {
            candidateId: candidate.id,
            jobId: job.id,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Vaga removida dos favoritos',
        data: { isFavorited: false },
      });
    } else {
      await prisma.favoriteJob.create({
        data: {
          candidateId: candidate.id,
          jobId: job.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Vaga adicionada aos favoritos',
        data: { isFavorited: true },
      });
    }
  } catch (error) {
    console.error('Erro ao favoritar:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
