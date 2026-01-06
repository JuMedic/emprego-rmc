import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { 
  Briefcase, Heart, Bell, FileText, Settings, 
  TrendingUp, Clock, CheckCircle, XCircle 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import { APPLICATION_STATUS, formatDate } from '@/lib/utils';

async function getCandidateData(userId: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { userId },
    include: {
      user: true,
      residenceCity: true,
      area: true,
      applications: {
        include: {
          job: {
            include: {
              company: true,
              cities: { include: { city: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      favoriteJobs: {
        include: {
          job: {
            include: {
              company: true,
              cities: { include: { city: true } },
            },
          },
        },
        take: 5,
      },
      _count: {
        select: {
          applications: true,
          favoriteJobs: true,
          alerts: true,
        },
      },
    },
  });

  return candidate;
}

export default async function CandidatoDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'CANDIDATE') {
    redirect('/login');
  }

  const candidate = await getCandidateData(session.user.id);

  if (!candidate) {
    redirect('/login');
  }

  const stats = {
    applications: candidate._count.applications,
    favorites: candidate._count.favoriteJobs,
    alerts: candidate._count.alerts,
    pending: candidate.applications.filter((a) => a.status === 'PENDING').length,
  };

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {candidate.fullName.split(' ')[0]}!
        </h1>
        <p className="text-gray-600">
          Gerencie suas candidaturas e encontre novas oportunidades
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card variant="bordered" className="text-center">
          <Briefcase className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.applications}</div>
          <div className="text-sm text-gray-500">Candidaturas</div>
        </Card>
        <Card variant="bordered" className="text-center">
          <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
          <div className="text-sm text-gray-500">Em Análise</div>
        </Card>
        <Card variant="bordered" className="text-center">
          <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.favorites}</div>
          <div className="text-sm text-gray-500">Favoritos</div>
        </Card>
        <Card variant="bordered" className="text-center">
          <Bell className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.alerts}</div>
          <div className="text-sm text-gray-500">Alertas</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Applications */}
          <Card variant="bordered">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Candidaturas Recentes</CardTitle>
                <Link href="/candidato/candidaturas">
                  <Button variant="ghost" size="sm">Ver todas</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {candidate.applications.length > 0 ? (
                <div className="space-y-4">
                  {candidate.applications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <Link
                          href={`/vagas/${app.job.cities[0]?.city.slug}/${app.job.slug}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {app.job.title}
                        </Link>
                        <p className="text-sm text-gray-500">{app.job.company.tradeName}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            app.status === 'CONTACTED'
                              ? 'success'
                              : app.status === 'REJECTED'
                              ? 'danger'
                              : app.status === 'VIEWED'
                              ? 'info'
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
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Você ainda não se candidatou a nenhuma vaga</p>
                  <Link href="/vagas">
                    <Button>Buscar Vagas</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Favorites */}
          <Card variant="bordered">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Vagas Favoritas</CardTitle>
                <Link href="/candidato/favoritos">
                  <Button variant="ghost" size="sm">Ver todas</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {candidate.favoriteJobs.length > 0 ? (
                <div className="space-y-3">
                  {candidate.favoriteJobs.map((fav) => (
                    <Link
                      key={fav.jobId}
                      href={`/vagas/${fav.job.cities[0]?.city.slug}/${fav.job.slug}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{fav.job.title}</p>
                        <p className="text-sm text-gray-500">{fav.job.company.tradeName}</p>
                      </div>
                      <Heart className="h-5 w-5 text-red-500 fill-current" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Nenhuma vaga favorita
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Seu Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Nome</p>
                <p className="font-medium">{candidate.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cidade</p>
                <p className="font-medium">{candidate.residenceCity.name}</p>
              </div>
              {candidate.desiredPosition && (
                <div>
                  <p className="text-sm text-gray-500">Cargo Desejado</p>
                  <p className="font-medium">{candidate.desiredPosition}</p>
                </div>
              )}
              {candidate.area && (
                <div>
                  <p className="text-sm text-gray-500">Área</p>
                  <p className="font-medium">{candidate.area.name}</p>
                </div>
              )}
              <Link href="/candidato/perfil">
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <FileText className="h-4 w-4 mr-2" />
                  Editar Perfil
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
                href="/vagas"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <Briefcase className="h-5 w-5 text-blue-600" />
                <span>Buscar Vagas</span>
              </Link>
              <Link
                href="/candidato/curriculo"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <FileText className="h-5 w-5 text-green-600" />
                <span>Atualizar Currículo</span>
              </Link>
              <Link
                href="/candidato/alertas"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <Bell className="h-5 w-5 text-purple-600" />
                <span>Gerenciar Alertas</span>
              </Link>
              <Link
                href="/candidato/configuracoes"
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
