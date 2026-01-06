import Link from 'next/link';
import { Search, MapPin, Briefcase, Building2, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { prisma } from '@/lib/prisma';

const cities = [
  { name: 'Campinas', slug: 'campinas' },
  { name: 'Americana', slug: 'americana' },
  { name: 'Sumaré', slug: 'sumare' },
  { name: 'Hortolândia', slug: 'hortolandia' },
  { name: 'Indaiatuba', slug: 'indaiatuba' },
  { name: 'Valinhos', slug: 'valinhos' },
  { name: 'Vinhedo', slug: 'vinhedo' },
  { name: 'Paulínia', slug: 'paulinia' },
  { name: 'Jaguariúna', slug: 'jaguariuna' },
];

async function getStats() {
  const [totalJobs, totalCompanies, totalCandidates] = await Promise.all([
    prisma.job.count({ where: { status: 'ACTIVE' } }),
    prisma.company.count({ where: { isActive: true } }),
    prisma.candidate.count(),
  ]);

  return { totalJobs, totalCompanies, totalCandidates };
}

async function getRecentJobs() {
  return prisma.job.findMany({
    where: { status: 'ACTIVE' },
    include: {
      company: true,
      area: true,
      cities: { include: { city: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { publishedAt: 'desc' },
    take: 6,
  });
}

export default async function HomePage() {
  const stats = await getStats();
  const recentJobs = await getRecentJobs();

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="container-app py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Encontre seu próximo emprego na{' '}
              <span className="text-yellow-400">RMC</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              O maior portal de empregos da Região Metropolitana de Campinas. 
              Conectamos você às melhores oportunidades em 18 cidades.
            </p>

            {/* Search Box */}
            <div className="bg-white rounded-xl p-4 shadow-2xl">
              <form action="/vagas" method="GET" className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Cargo, empresa ou palavra-chave..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative md:w-48">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    name="city"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-gray-900 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todas as cidades</option>
                    {cities.map((city) => (
                      <option key={city.slug} value={city.slug}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" size="lg" className="md:w-auto">
                  Buscar Vagas
                </Button>
              </form>
            </div>

            {/* Quick Stats */}
            <div className="flex justify-center gap-8 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                <span><strong>{stats.totalJobs}</strong> vagas ativas</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <span><strong>{stats.totalCompanies}</strong> empresas</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span><strong>{stats.totalCandidates}</strong> candidatos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="section-padding bg-white">
        <div className="container-app">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Vagas por Cidade
            </h2>
            <p className="text-gray-600">
              Explore oportunidades em toda a Região Metropolitana de Campinas
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`/vagas/${city.slug}`}
                className="flex items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors group"
              >
                <MapPin className="h-4 w-4 text-gray-400 group-hover:text-blue-500 mr-2" />
                <span className="font-medium text-gray-700 group-hover:text-blue-600">
                  {city.name}
                </span>
              </Link>
            ))}
            <Link
              href="/vagas"
              className="flex items-center justify-center p-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Ver todas as cidades →
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Jobs Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-app">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Vagas Recentes
              </h2>
              <p className="text-gray-600">
                Confira as últimas oportunidades publicadas
              </p>
            </div>
            <Link href="/vagas">
              <Button variant="outline">Ver todas</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <Card key={job.id} variant="bordered" className="card-hover">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="info" size="sm">
                      {job.area.name}
                    </Badge>
                    {job.isFeatured && (
                      <Badge variant="warning" size="sm">⭐ Destaque</Badge>
                    )}
                  </div>
                  <Link href={`/vagas/${job.cities[0]?.city.slug}/${job.slug}`}>
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm mt-1">{job.company.tradeName}</p>
                  <div className="flex items-center text-gray-500 text-sm mt-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.cities.map(c => c.city.name).join(', ')}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link href={`/vagas/${job.cities[0]?.city.slug}/${job.slug}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Ver Vaga
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">Nenhuma vaga disponível no momento.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-white">
        <div className="container-app">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Para Candidatos */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="text-center md:text-left">
                <Users className="h-12 w-12 text-blue-600 mb-4 mx-auto md:mx-0" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Para Candidatos
                </h3>
                <ul className="space-y-2 text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Cadastre seu currículo gratuitamente
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Receba alertas de vagas personalizados
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Candidate-se com um clique
                  </li>
                </ul>
                <Link href="/cadastro?tipo=candidato">
                  <Button size="lg">Cadastrar Currículo</Button>
                </Link>
              </div>
            </Card>

            {/* Para Empresas */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="text-center md:text-left">
                <Building2 className="h-12 w-12 text-purple-600 mb-4 mx-auto md:mx-0" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Para Empresas
                </h3>
                <ul className="space-y-2 text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Publique vagas gratuitamente
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Acesse currículos qualificados
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Gestão completa de candidatos
                  </li>
                </ul>
                <Link href="/cadastro?tipo=empresa">
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                    Cadastrar Empresa
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="container-app">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">18</div>
              <div className="text-gray-400">Cidades atendidas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">{stats.totalJobs}+</div>
              <div className="text-gray-400">Vagas ativas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">{stats.totalCompanies}+</div>
              <div className="text-gray-400">Empresas cadastradas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">{stats.totalCandidates}+</div>
              <div className="text-gray-400">Candidatos</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
