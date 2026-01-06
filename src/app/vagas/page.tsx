import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { JobSearchFilters } from '@/components/jobs/JobSearchFilters';
import { JobCard } from '@/components/jobs/JobCard';
import { Button } from '@/components/ui';
import Link from 'next/link';

interface PageProps {
  searchParams: {
    q?: string;
    city?: string;
    area?: string;
    level?: string;
    modality?: string;
    contractType?: string;
    salaryMin?: string;
    salaryMax?: string;
    page?: string;
    orderBy?: string;
  };
}

async function getCities() {
  const cities = await prisma.city.findMany({ orderBy: { name: 'asc' } });
  return cities.map((c) => ({ value: c.slug, label: c.name }));
}

async function getAreas() {
  const areas = await prisma.jobArea.findMany({ orderBy: { name: 'asc' } });
  return areas.map((a) => ({ value: a.slug, label: a.name }));
}

async function getJobs(searchParams: PageProps['searchParams']) {
  const page = parseInt(searchParams.page || '1');
  const limit = 20;

  const where: any = { status: 'ACTIVE' };

  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q, mode: 'insensitive' } },
      { description: { contains: searchParams.q, mode: 'insensitive' } },
      { company: { tradeName: { contains: searchParams.q, mode: 'insensitive' } } },
    ];
  }

  if (searchParams.city) {
    where.cities = { some: { city: { slug: searchParams.city } } };
  }

  if (searchParams.area) {
    where.area = { slug: searchParams.area };
  }

  if (searchParams.level) {
    where.level = searchParams.level;
  }

  if (searchParams.modality) {
    where.modality = searchParams.modality;
  }

  if (searchParams.contractType) {
    where.contractType = searchParams.contractType;
  }

  const orderByField = searchParams.orderBy === 'salary' 
    ? { salaryMax: 'desc' as const }
    : { publishedAt: 'desc' as const };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        company: true,
        area: true,
        cities: { include: { city: true } },
        _count: { select: { applications: true } },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { isHighlighted: 'desc' },
        orderByField,
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job.count({ where }),
  ]);

  return { jobs, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export const metadata = {
  title: 'Vagas de Emprego',
  description: 'Encontre vagas de emprego na Região Metropolitana de Campinas',
};

export default async function VagasPage({ searchParams }: PageProps) {
  const [cities, areas, { jobs, total, page, totalPages }] = await Promise.all([
    getCities(),
    getAreas(),
    getJobs(searchParams),
  ]);

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Vagas de Emprego na RMC
        </h1>
        <p className="text-gray-600">
          {total} {total === 1 ? 'vaga encontrada' : 'vagas encontradas'}
        </p>
      </div>

      <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-xl" />}>
        <JobSearchFilters cities={cities} areas={areas} />
      </Suspense>

      <div className="mt-8 space-y-4">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard key={job.id} job={job as any} />
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-xl">
            <p className="text-gray-500 mb-4">Nenhuma vaga encontrada com esses filtros.</p>
            <Link href="/vagas">
              <Button variant="outline">Limpar filtros</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={{
                pathname: '/vagas',
                query: { ...searchParams, page: page - 1 },
              }}
            >
              <Button variant="outline">Anterior</Button>
            </Link>
          )}
          <span className="flex items-center px-4 text-gray-600">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={{
                pathname: '/vagas',
                query: { ...searchParams, page: page + 1 },
              }}
            >
              <Button variant="outline">Próxima</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
