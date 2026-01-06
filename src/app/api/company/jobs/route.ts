import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { jobSchema } from '@/lib/validations';
import { slugify } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'COMPANY') {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    const jobs = await prisma.job.findMany({
      where: { companyId: company.id },
      include: {
        area: true,
        cities: { include: { city: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error('Erro ao buscar vagas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'COMPANY') {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
      include: {
        subscription: { include: { plan: true } },
        _count: { select: { jobs: { where: { status: 'ACTIVE' } } } },
      },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Verificar limite de vagas
    const maxJobs = company.subscription?.plan.maxActiveJobs ?? 2;
    if (maxJobs !== -1 && company._count.jobs >= maxJobs) {
      return NextResponse.json(
        { success: false, error: `Limite de ${maxJobs} vagas ativas atingido. Atualize seu plano.` },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = jobSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Gerar slug único
    let slug = slugify(data.title);
    const existingSlug = await prisma.job.findFirst({
      where: { companyId: company.id, slug },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Criar vaga
    const job = await prisma.job.create({
      data: {
        companyId: company.id,
        title: data.title,
        slug,
        description: data.description,
        requirements: data.requirements || null,
        benefits: data.benefits || null,
        areaId: data.areaId,
        level: data.level as any,
        modality: data.modality as any,
        contractType: data.contractType as any,
        salaryMin: data.salaryMin || null,
        salaryMax: data.salaryMax || null,
        hideSalary: data.hideSalary || false,
        workSchedule: data.workSchedule || null,
        applyByPlatform: data.applyByPlatform ?? true,
        applyByWhatsapp: data.applyByWhatsapp || null,
        applyByEmail: data.applyByEmail || null,
        applyByUrl: data.applyByUrl || null,
        status: 'ACTIVE',
        publishedAt: new Date(),
        cities: {
          create: data.cityIds.map((cityId) => ({ cityId })),
        },
      },
      include: {
        cities: { include: { city: true } },
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_JOB',
        entity: 'Job',
        entityId: job.id,
        details: { title: job.title },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Vaga criada com sucesso!',
      data: job,
    });
  } catch (error) {
    console.error('Erro ao criar vaga:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
