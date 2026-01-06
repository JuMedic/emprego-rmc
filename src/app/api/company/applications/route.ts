import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Listar candidaturas recebidas nas vagas da empresa
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'COMPANY') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
    });

    if (!company) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {
      job: {
        companyId: company.id,
      },
    };

    if (jobId) {
      where.jobId = jobId;
    }

    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          candidate: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              residenceCityId: true,
              resumeUrl: true,
              salaryMin: true,
              salaryMax: true,
              residenceCity: {
                select: {
                  name: true,
                },
              },
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: [
          { matchScore: 'desc' },
          { createdAt: 'desc' },
        ],
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

// PATCH - Atualizar status da candidatura
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'COMPANY') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId, status, feedback } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'ID da candidatura e status são obrigatórios' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'VIEWED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'HIRED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
    });

    if (!company) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        job: {
          companyId: company.id,
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Candidatura não encontrada' }, { status: 404 });
    }

    const updateData: any = {
      status,
    };

    if (status === 'VIEWED' && !application.viewedAt) {
      updateData.viewedAt = new Date();
    }

    if (feedback) {
      updateData.feedback = feedback;
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: updateData,
    });

    return NextResponse.json({ application: updatedApplication });
  } catch (error) {
    console.error('Erro ao atualizar candidatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
