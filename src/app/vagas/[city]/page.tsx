import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { JobCard } from '@/components/jobs/JobCard';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

interface PageProps {
  params: { city: string };
  searchParams: { page?: string };
}

async function getCity(slug: string) {
  return prisma.city.findUnique({ where: { slug } });
}

async function getJobs(citySlug: string, page: number) {
  const limit = 20;

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where: {
        status: 'ACTIVE',
        cities: { some: { city: { slug: citySlug } } },
      },
      include: {
        company: true,
        area: true,
        cities: { include: { city: true } },
        _count: { select: { applications: true } },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { publishedAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job.count({
      where: {
        status: 'ACTIVE',
        cities: { some: { city: { slug: citySlug } } },
      },
    }),
  ]);

  return { jobs, total, totalPages: Math.ceil(total / limit) };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const city = await getCity(params.city);
  
  if (!city) {
    return { title: 'Cidade não encontrada' };
  }

  return {
    title: `Vagas em ${city.name}`,
    description: `Encontre vagas de emprego em ${city.name}. Oportunidades de trabalho na Região Metropolitana de Campinas.`,
  };
}

export async function generateStaticParams() {
  const cities = await prisma.city.findMany({ select: { slug: true } });
  return cities.map((city) => ({ city: city.slug }));
}

export default async function CityJobsPage({ params, searchParams }: PageProps) {
  const city = await getCity(params.city);

  if (!city) {
    notFound();
  }

  const page = parseInt(searchParams.page || '1');
  const { jobs, total, totalPages } = await getJobs(params.city, page);

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <Link href="/vagas" className="hover:text-blue-600">Vagas</Link>
          <span>/</span>
          <span className="text-gray-900">{city.name}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <MapPin className="h-8 w-8 text-blue-600" />
          Vagas em {city.name}
        </h1>
        <p className="text-gray-600">
          {total} {total === 1 ? 'vaga encontrada' : 'vagas encontradas'} em {city.name}
        </p>
      </div>

      <div className="space-y-4">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard key={job.id} job={job as any} />
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-xl">
            <p className="text-gray-500 mb-4">Nenhuma vaga disponível em {city.name} no momento.</p>
            <Link href="/vagas">
              <Button variant="outline">Ver todas as vagas</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <Link href={`/vagas/${params.city}?page=${page - 1}`}>
              <Button variant="outline">Anterior</Button>
            </Link>
          )}
          <span className="flex items-center px-4 text-gray-600">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/vagas/${params.city}?page=${page + 1}`}>
              <Button variant="outline">Próxima</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
