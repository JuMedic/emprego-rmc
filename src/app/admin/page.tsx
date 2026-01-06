import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { 
  Users, Briefcase, Building2, TrendingUp, 
  MapPin, BarChart3, Settings, Shield, AlertTriangle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import { formatDate } from '@/lib/utils';

async function getAdminStats() {
  const [
    totalUsers,
    totalCandidates,
    totalCompanies,
    pendingCompanies,
    totalJobs,
    activeJobs,
    totalApplications,
    jobsByCity,
    jobsByArea,
    recentJobs,
    recentCompanies,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.candidate.count(),
    prisma.company.count(),
    prisma.company.count({ where: { isVerified: false } }),
    prisma.job.count(),
    prisma.job.count({ where: { status: 'ACTIVE' } }),
    prisma.application.count(),
    prisma.jobCity.groupBy({
      by: ['cityId'],
      _count: true,
      orderBy: { _count: { cityId: 'desc' } },
      take: 10,
    }),
    prisma.job.groupBy({
      by: ['areaId'],
      _count: true,
      orderBy: { _count: { areaId: 'desc' } },
      take: 10,
    }),
    prisma.job.findMany({
      include: { company: true, cities: { include: { city: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.company.findMany({
      include: { cities: { include: { city: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  // Buscar nomes das cidades e áreas
  const cityIds = jobsByCity.map((j) => j.cityId);
  const areaIds = jobsByArea.map((j) => j.areaId);

  const [cities, areas] = await Promise.all([
    prisma.city.findMany({ where: { id: { in: cityIds } } }),
    prisma.jobArea.findMany({ where: { id: { in: areaIds } } }),
  ]);

  return {
    totalUsers,
    totalCandidates,
    totalCompanies,
    pendingCompanies,
    totalJobs,
    activeJobs,
    totalApplications,
    jobsByCity: jobsByCity.map((j) => ({
      city: cities.find((c) => c.id === j.cityId)?.name || 'Desconhecida',
      count: j._count,
    })),
    jobsByArea: jobsByArea.map((j) => ({
      area: areas.find((a) => a.id === j.areaId)?.name || 'Desconhecida',
      count: j._count,
    })),
    recentJobs,
    recentCompanies,
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const stats = await getAdminStats();

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
        <p className="text-gray-600">Gerencie o portal Empregos RMC</p>
      </div>

      {/* Alertas */}
      {stats.pendingCompanies > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <span className="text-yellow-800">
            {stats.pendingCompanies} empresa(s) aguardando aprovação
          </span>
          <Link href="/admin/empresas?status=pending" className="ml-auto">
            <Button size="sm" variant="outline">Revisar</Button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card variant="bordered" className="text-center">
          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.totalCandidates}</div>
          <div className="text-sm text-gray-500">Candidatos</div>
        </Card>
        <Card variant="bordered" className="text-center">
          <Building2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</div>
          <div className="text-sm text-gray-500">Empresas</div>
        </Card>
        <Card variant="bordered" className="text-center">
          <Briefcase className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.activeJobs}</div>
          <div className="text-sm text-gray-500">Vagas Ativas</div>
        </Card>
        <Card variant="bordered" className="text-center">
          <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.totalApplications}</div>
          <div className="text-sm text-gray-500">Candidaturas</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vagas por Cidade */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Vagas por Cidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.jobsByCity.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-700">{item.city}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(item.count / stats.activeJobs) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vagas por Área */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Vagas por Área
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.jobsByArea.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-700">{item.area}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(item.count / stats.activeJobs) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Jobs */}
          <Card variant="bordered">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Vagas Recentes</CardTitle>
                <Link href="/admin/vagas">
                  <Button variant="ghost" size="sm">Ver todas</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500">
                        {job.company.tradeName} • {job.cities.map(c => c.city.name).join(', ')}
                      </p>
                    </div>
                    <Badge variant={job.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                      {job.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/admin/usuarios"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <Users className="h-5 w-5 text-blue-600" />
                <span>Gerenciar Usuários</span>
              </Link>
              <Link
                href="/admin/empresas"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <Building2 className="h-5 w-5 text-purple-600" />
                <span>Gerenciar Empresas</span>
              </Link>
              <Link
                href="/admin/vagas"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <Briefcase className="h-5 w-5 text-green-600" />
                <span>Moderar Vagas</span>
              </Link>
              <Link
                href="/admin/planos"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <span>Planos e Pagamentos</span>
              </Link>
              <Link
                href="/admin/logs"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <Shield className="h-5 w-5 text-gray-600" />
                <span>Logs de Auditoria</span>
              </Link>
              <Link
                href="/admin/configuracoes"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <Settings className="h-5 w-5 text-gray-600" />
                <span>Configurações</span>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Companies */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Empresas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentCompanies.map((company) => (
                  <div key={company.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 text-sm">{company.tradeName}</p>
                      {company.isVerified ? (
                        <Badge variant="success" size="sm">Verificada</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">Pendente</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {company.cities.map(c => c.city.name).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
