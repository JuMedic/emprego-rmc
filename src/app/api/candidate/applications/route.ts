import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Listar candidaturas do candidato
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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {
      candidateId: candidate.id,
    };

    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
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
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar candidaturas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar candidatura
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('id');

    if (!applicationId) {
      return NextResponse.json({ error: 'ID da candidatura é obrigatório' }, { status: 400 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { userId: session.user.id },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidato não encontrado' }, { status: 404 });
    }

    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        candidateId: candidate.id,
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Candidatura não encontrada' }, { status: 404 });
    }

    if (application.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Só é possível cancelar candidaturas pendentes' },
        { status: 400 }
      );
    }

    await prisma.application.delete({
      where: { id: applicationId },
    });

    return NextResponse.json({ message: 'Candidatura cancelada com sucesso' });
  } catch (error) {
    console.error('Erro ao cancelar candidatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
