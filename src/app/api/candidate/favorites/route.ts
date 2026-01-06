import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Listar favoritos do candidato
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { userId: session.user.id },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidato não encontrado' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      prisma.favoriteJob.findMany({
        where: {
          candidateId: candidate.id,
        },
        include: {
          job: {
            include: {
              company: {
                select: {
                  tradeName: true,
                  logoUrl: true,
                },
              },
              cities: {
                include: {
                  city: true,
                },
              },
              area: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.favoriteJob.count({
        where: {
          candidateId: candidate.id,
        },
      }),
    ]);

    return NextResponse.json({
      favorites,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
