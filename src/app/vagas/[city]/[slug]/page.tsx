import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { 
  MapPin, Building2, Clock, Banknote, Briefcase, 
  Heart, Share2, ExternalLink, MessageCircle, Mail 
} from 'lucide-react';
import { Button, Badge, Card } from '@/components/ui';
import { 
  formatCurrency, formatDate, 
  JOB_LEVELS, JOB_MODALITIES, CONTRACT_TYPES 
} from '@/lib/utils';
import { ApplyButton } from './ApplyButton';

interface PageProps {
  params: { city: string; slug: string };
}

async function getJob(slug: string) {
  const job = await prisma.job.findFirst({
    where: { slug, status: 'ACTIVE' },
    include: {
      company: {
        include: {
          segment: true,
          cities: { include: { city: true } },
        },
      },
      area: true,
      cities: { include: { city: true } },
      _count: { select: { applications: true } },
    },
  });

  if (job) {
    await prisma.job.update({
      where: { id: job.id },
      data: { viewCount: { increment: 1 } },
    });
  }

  return job;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const job = await prisma.job.findFirst({
    where: { slug: params.slug },
    include: { company: true, cities: { include: { city: true } } },
  });

  if (!job) {
    return { title: 'Vaga não encontrada' };
  }

  const cities = job.cities.map(c => c.city.name).join(', ');

  return {
    title: `${job.title} - ${job.company.tradeName}`,
    description: job.description.substring(0, 160),
    openGraph: {
      title: `${job.title} em ${cities}`,
      description: job.description.substring(0, 160),
      type: 'website',
    },
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const job = await getJob(params.slug);

  if (!job) {
    notFound();
  }

  const cities = job.cities.map(c => c.city.name).join(', ');
  const salary = job.hideSalary
    ? 'A combinar'
    : job.salaryMin && job.salaryMax
      ? `${formatCurrency(Number(job.salaryMin))} - ${formatCurrency(Number(job.salaryMax))}`
      : job.salaryMin
        ? `A partir de ${formatCurrency(Number(job.salaryMin))}`
        : 'A combinar';

  // Schema.org para SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.publishedAt?.toISOString(),
    validThrough: job.expiresAt?.toISOString(),
    employmentType: job.contractType,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company.tradeName,
      sameAs: job.company.website,
    },
    jobLocation: job.cities.map(c => ({
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: c.city.name,
        addressRegion: 'SP',
        addressCountry: 'BR',
      },
    })),
    baseSalary: !job.hideSalary && job.salaryMin ? {
      '@type': 'MonetaryAmount',
      currency: 'BRL',
      value: {
        '@type': 'QuantitativeValue',
        minValue: Number(job.salaryMin),
        maxValue: job.salaryMax ? Number(job.salaryMax) : undefined,
        unitText: 'MONTH',
      },
    } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-app py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-600 text-sm mb-6">
          <Link href="/vagas" className="hover:text-blue-600">Vagas</Link>
          <span>/</span>
          <Link href={`/vagas/${params.city}`} className="hover:text-blue-600">
            {job.cities[0]?.city.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900 truncate">{job.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card variant="bordered">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant={job.modality === 'REMOTE' ? 'success' : job.modality === 'HYBRID' ? 'info' : 'default'}>
                  {JOB_MODALITIES[job.modality]}
                </Badge>
                <Badge variant="outline">{CONTRACT_TYPES[job.contractType]}</Badge>
                <Badge variant="outline">{JOB_LEVELS[job.level]}</Badge>
                {job.isFeatured && <Badge variant="warning">⭐ Destaque</Badge>}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {job.title}
              </h1>

              <Link 
                href={`/empresas/${job.company.id}`}
                className="text-lg text-gray-600 hover:text-blue-600 flex items-center gap-2"
              >
                <Building2 className="h-5 w-5" />
                {job.company.tradeName}
              </Link>

              <div className="flex flex-wrap gap-4 mt-4 text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {cities}
                </div>
                <div className="flex items-center gap-1">
                  <Banknote className="h-4 w-4" />
                  {salary}
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {job.area.name}
                </div>
              </div>

              {job.workSchedule && (
                <div className="flex items-center gap-1 mt-2 text-gray-500">
                  <Clock className="h-4 w-4" />
                  {job.workSchedule}
                </div>
              )}
            </Card>

            {/* Description */}
            <Card variant="bordered">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Descrição da Vaga</h2>
              <div className="prose prose-gray max-w-none">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card variant="bordered">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requisitos</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-wrap">{job.requirements}</p>
                </div>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && (
              <Card variant="bordered">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefícios</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-wrap">{job.benefits}</p>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card variant="elevated" className="sticky top-24">
              <div className="space-y-4">
                <ApplyButton jobSlug={job.slug} />

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Heart className="h-4 w-4 mr-2" />
                    Favoritar
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>

                {/* Outras formas de candidatura */}
                <div className="pt-4 border-t space-y-2">
                  {job.applyByWhatsapp && (
                    <a
                      href={`https://wa.me/55${job.applyByWhatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Candidatar via WhatsApp
                    </a>
                  )}
                  {job.applyByEmail && (
                    <a
                      href={`mailto:${job.applyByEmail}?subject=Candidatura: ${job.title}`}
                      className="flex items-center justify-center gap-2 w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      Enviar por E-mail
                    </a>
                  )}
                  {job.applyByUrl && (
                    <a
                      href={job.applyByUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Site da Empresa
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t text-sm text-gray-500 space-y-1">
                <p>Publicada em: {job.publishedAt ? formatDate(job.publishedAt) : '-'}</p>
                <p>{job._count.applications} candidatos</p>
                <p>{job.viewCount} visualizações</p>
              </div>
            </Card>

            {/* Company Info */}
            <Card variant="bordered">
              <h3 className="font-semibold text-gray-900 mb-3">Sobre a Empresa</h3>
              {job.company.logoUrl && (
                <img 
                  src={job.company.logoUrl} 
                  alt={job.company.tradeName}
                  className="h-16 mb-3"
                />
              )}
              <p className="font-medium text-gray-900">{job.company.tradeName}</p>
              {job.company.segment && (
                <p className="text-sm text-gray-500">{job.company.segment.name}</p>
              )}
              {job.company.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                  {job.company.description}
                </p>
              )}
              <Link href={`/empresas/${job.company.id}`}>
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  Ver perfil da empresa
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
