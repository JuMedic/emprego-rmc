import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { 
  Briefcase, Users, Eye, Plus, Settings, 
  TrendingUp, Clock, CheckCircle, BarChart3 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import { formatDate, JOB_LEVELS, APPLICATION_STATUS } from '@/lib/utils';

async function getCompanyData(userId: string) {
  const company = await prisma.company.findUnique({
    where: { userId },
    include: {
      user: true,
      segment: true,
      cities: { include: { city: true } },
      jobs: {
        include: {
          area: true,
          cities: { include: { city: true } },
          _count: { select: { applications: true } },
          applications: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
              candidate: {
                include: { residenceCity: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      subscription: {
        include: { plan: true },
      },
    },
  });

  return company;
}

export default async function EmpresaDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'COMPANY') {
    redirect('/login');
  }

  const company = await getCompanyData(session.user.id);

  if (!company) {
    redirect('/login');
  }

  const activeJobs = company.jobs.filter((j) => j.status === 'ACTIVE');
  const totalApplications = company.jobs.reduce((acc, job) => acc + job._count.applications, 0);
  const totalViews = company.jobs.reduce((acc, job) => acc + job.viewCount, 0);
  const recentApplications = company.jobs.flatMap((j) => 
    j.applications.map((a) => ({ ...a, job: j }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="container-app py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {company.tradeName}
          </h1>
          <p className="text-gray-600">
            Dashboard da empresa • Plano {company.subscription?.plan.name || 'Gratuito'}
          </p>
        </div>
        <Link href="/empresa/vagas/nova">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Vaga
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card variant="bordered" className="text-center">
          <Briefcase className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{activeJobs.length}</div>
          <div className="text-sm text-gray-500">Vagas Ativas</div>
        </Card>
        <Card variant="bordered" className="text-center">
          <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{totalApplications}</div>
          <div className="text-sm text-gray-500">Candidaturas</div>
        </Card>
        <Card variant="bordered" className="text-center">
          <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{totalViews}</div>
          <div className="text-sm text-gray-500">Visualizações</div>
        </Card>
        <Card variant="bordered" className="text-center">
          <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {totalApplications > 0 ? Math.round((totalApplications / totalViews) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-500">Conversão</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Jobs List */}
          <Card variant="bordered">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Suas Vagas</CardTitle>
                <Link href="/empresa/vagas">
                  <Button variant="ghost" size="sm">Ver todas</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {company.jobs.length > 0 ? (
                <div className="space-y-3">
                  {company.jobs.slice(0, 5).map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/empresa/vagas/${job.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600"
                          >
                            {job.title}
                          </Link>
                          <Badge
                            variant={
                              job.status === 'ACTIVE'
                                ? 'success'
                                : job.status === 'PAUSED'
                                ? 'warning'
                                : 'default'
                            }
                            size="sm"
                          >
                            {job.status === 'ACTIVE' ? 'Ativa' : job.status === 'PAUSED' ? 'Pausada' : job.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {job.cities.map(c => c.city.name).join(', ')} • {JOB_LEVELS[job.level]}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job._count.applications}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {job.viewCount}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Você ainda não publicou nenhuma vaga</p>
                  <Link href="/empresa/vagas/nova">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Vaga
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card variant="bordered">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Candidaturas Recentes</CardTitle>
                <Link href="/empresa/candidatos">
                  <Button variant="ghost" size="sm">Ver todas</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentApplications.length > 0 ? (
                <div className="space-y-3">
                  {recentApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {app.candidate.fullName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {app.job.title} • {app.candidate.residenceCity.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            app.status === 'CONTACTED'
                              ? 'success'
                              : app.status === 'REJECTED'
                              ? 'danger'
                              : 'default'
                          }
                          size="sm"
                        >
                          {APPLICATION_STATUS[app.status]}
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(app.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Nenhuma candidatura recebida
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Info */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Dados da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Nome Fantasia</p>
                <p className="font-medium">{company.tradeName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Razão Social</p>
                <p className="font-medium">{company.legalName}</p>
              </div>
              {company.segment && (
                <div>
                  <p className="text-sm text-gray-500">Segmento</p>
                  <p className="font-medium">{company.segment.name}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Cidades de Atuação</p>
                <p className="font-medium">
                  {company.cities.map((c) => c.city.name).join(', ')}
                </p>
              </div>
              <Link href="/empresa/perfil">
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Editar Dados
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Plan Info */}
          <Card variant="bordered" className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader>
              <CardTitle>Seu Plano</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {company.subscription?.plan.name || 'Gratuito'}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {company.subscription?.plan.maxActiveJobs === -1
                  ? 'Vagas ilimitadas'
                  : `${company.subscription?.plan.maxActiveJobs || 2} vagas ativas`}
              </p>
              <Link href="/planos">
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Ver Planos
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/empresa/vagas/nova"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <Plus className="h-5 w-5 text-blue-600" />
                <span>Publicar Vaga</span>
              </Link>
              <Link
                href="/empresa/candidatos"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <Users className="h-5 w-5 text-green-600" />
                <span>Ver Candidatos</span>
              </Link>
              <Link
                href="/empresa/relatorios"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span>Relatórios</span>
              </Link>
              <Link
                href="/empresa/configuracoes"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <Settings className="h-5 w-5 text-gray-600" />
                <span>Configurações</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
