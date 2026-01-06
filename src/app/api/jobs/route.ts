import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parâmetros de busca
    const q = searchParams.get('q') || '';
    const city = searchParams.get('city') || '';
    const area = searchParams.get('area') || '';
    const level = searchParams.get('level') || '';
    const modality = searchParams.get('modality') || '';
    const contractType = searchParams.get('contractType') || '';
    const salaryMin = searchParams.get('salaryMin');
    const salaryMax = searchParams.get('salaryMax');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const orderBy = searchParams.get('orderBy') || 'recent';

    // Construir filtros
    const where: Prisma.JobWhereInput = {
      status: 'ACTIVE',
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { company: { tradeName: { contains: q, mode: 'insensitive' } } },
      ];
    }

    if (city) {
      where.cities = {
        some: { city: { slug: city } },
      };
    }

    if (area) {
      where.area = { slug: area };
    }

    if (level) {
      where.level = level as any;
    }

    if (modality) {
      where.modality = modality as any;
    }

    if (contractType) {
      where.contractType = contractType as any;
    }

    if (salaryMin) {
      where.salaryMin = { gte: parseFloat(salaryMin) };
    }

    if (salaryMax) {
      where.salaryMax = { lte: parseFloat(salaryMax) };
    }

    // Ordenação
    let orderByClause: Prisma.JobOrderByWithRelationInput = { publishedAt: 'desc' };
    if (orderBy === 'salary') {
      orderByClause = { salaryMax: 'desc' };
    } else if (orderBy === 'applications') {
      orderByClause = { applications: { _count: 'desc' } };
    }

    // Buscar vagas
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              tradeName: true,
              logoUrl: true,
            },
          },
          area: true,
          cities: {
            include: { city: true },
          },
          _count: {
            select: { applications: true, favorites: true },
          },
        },
        orderBy: [
          { isFeatured: 'desc' }, // Destaque primeiro
          { isHighlighted: 'desc' },
          orderByClause,
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar vagas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
