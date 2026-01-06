'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, MapPin, Phone, Briefcase, Save, Shield
} from 'lucide-react';
import { 
  Card, CardHeader, CardTitle, CardContent, 
  Button, Input, Textarea, Select 
} from '@/components/ui';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Nome é obrigatório'),
  phone: z.string().optional(),
  residenceCityId: z.string().optional(),
  desiredPosition: z.string().optional(),
  level: z.string().optional(),
  experienceYears: z.number().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  isPublicProfile: z.boolean(),
  receiveAlerts: z.boolean(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

async function fetchProfile() {
  const res = await fetch('/api/candidate/profile');
  if (!res.ok) throw new Error('Erro ao buscar perfil');
  return res.json();
}

async function fetchCities() {
  const res = await fetch('/api/cities');
  if (!res.ok) throw new Error('Erro ao buscar cidades');
  return res.json();
}

export default function PerfilPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'privacy'>('profile');

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['candidateProfile'],
    queryFn: fetchProfile,
    enabled: !!session,
  });

  const { data: citiesData } = useQuery({
    queryKey: ['cities'],
    queryFn: fetchCities,
  });

  const candidate = profileData?.candidate;
  const cities = citiesData?.cities || [];

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: candidate?.fullName || '',
      phone: candidate?.phone || '',
      residenceCityId: candidate?.residenceCityId || '',
      desiredPosition: candidate?.desiredPosition || '',
      level: candidate?.level || '',
      experienceYears: candidate?.experienceYears ?? undefined,
      salaryMin: candidate?.salaryMin ? Number(candidate.salaryMin) : undefined,
      salaryMax: candidate?.salaryMax ? Number(candidate.salaryMax) : undefined,
      isPublicProfile: candidate?.isPublicProfile ?? false,
      receiveAlerts: candidate?.receiveAlerts ?? true,
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const res = await fetch('/api/candidate/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      alert('Perfil atualizado com sucesso!');
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordForm) => {
      const res = await fetch('/api/candidate/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }
      return res.json();
    },
    onSuccess: () => {
      passwordForm.reset();
      alert('Senha alterada com sucesso!');
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="container-app py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meu Perfil</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="inline h-4 w-4 mr-2" />
          Dados Pessoais
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'password'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Shield className="inline h-4 w-4 mr-2" />
          Segurança
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'privacy'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Privacidade
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={profileForm.handleSubmit((data) => updateProfileMutation.mutate(data))}>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Nome completo"
                      error={profileForm.formState.errors.fullName?.message}
                      {...profileForm.register('fullName')}
                    />
                    <Input
                      label="Telefone"
                      placeholder="(00) 00000-0000"
                      {...profileForm.register('phone')}
                    />
                  </div>
                  <Select
                    label="Cidade"
                    {...profileForm.register('residenceCityId')}
                  >
                    <option value="">Selecione uma cidade</option>
                    {cities.map((city: { id: string; name: string }) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </Select>
                </CardContent>
              </Card>

              <Card variant="bordered">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Informações Profissionais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Cargo desejado"
                      placeholder="Ex: Desenvolvedor Full Stack"
                      {...profileForm.register('desiredPosition')}
                    />
                    <Select
                      label="Nível"
                      {...profileForm.register('level')}
                    >
                      <option value="">Selecione</option>
                      <option value="INTERN">Estágio</option>
                      <option value="APPRENTICE">Aprendiz</option>
                      <option value="JUNIOR">Júnior</option>
                      <option value="MID">Pleno</option>
                      <option value="SENIOR">Sênior</option>
                    </Select>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Input
                      label="Anos de experiência"
                      type="number"
                      {...profileForm.register('experienceYears', { valueAsNumber: true })}
                    />
                    <Input
                      label="Salário mínimo (R$)"
                      type="number"
                      placeholder="3000"
                      {...profileForm.register('salaryMin', { valueAsNumber: true })}
                    />
                    <Input
                      label="Salário máximo (R$)"
                      type="number"
                      placeholder="5000"
                      {...profileForm.register('salaryMax', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded"
                        {...profileForm.register('isPublicProfile')}
                      />
                      <span className="text-sm text-gray-700">
                        Perfil visível para recrutadores
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded"
                        {...profileForm.register('receiveAlerts')}
                      />
                      <span className="text-sm text-gray-700">
                        Receber alertas de vagas por e-mail
                      </span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card variant="bordered">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{candidate?.fullName}</h3>
                    <p className="text-sm text-gray-500">{session?.user?.email}</p>
                    {candidate?.residenceCity && (
                      <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {candidate.residenceCity.name}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card variant="bordered">
                <CardHeader>
                  <CardTitle className="text-base">Completude do Perfil</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: '60%' }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">60% completo</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Perfis completos têm 3x mais chances de serem vistos
                  </p>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full"
                isLoading={updateProfileMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="max-w-md">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
            </CardHeader>
            <CardContent>
              <form 
                onSubmit={passwordForm.handleSubmit((data) => updatePasswordMutation.mutate(data))}
                className="space-y-4"
              >
                <Input
                  label="Senha atual"
                  type="password"
                  error={passwordForm.formState.errors.currentPassword?.message}
                  {...passwordForm.register('currentPassword')}
                />
                <Input
                  label="Nova senha"
                  type="password"
                  error={passwordForm.formState.errors.newPassword?.message}
                  {...passwordForm.register('newPassword')}
                />
                <Input
                  label="Confirmar nova senha"
                  type="password"
                  error={passwordForm.formState.errors.confirmPassword?.message}
                  {...passwordForm.register('confirmPassword')}
                />
                <Button 
                  type="submit" 
                  isLoading={updatePasswordMutation.isPending}
                >
                  Alterar Senha
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="max-w-2xl space-y-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Seus Dados (LGPD)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Você tem direito a acessar, corrigir e excluir seus dados pessoais 
                conforme a Lei Geral de Proteção de Dados (LGPD).
              </p>
              <div className="flex gap-4">
                <Button variant="outline">
                  Exportar Meus Dados
                </Button>
                <Button variant="danger">
                  Excluir Minha Conta
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Visibilidade do Currículo</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                <span className="text-sm text-gray-700">
                  Permitir que empresas encontrem meu currículo na busca
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Se desativado, apenas empresas para as quais você se candidatou poderão ver seu perfil
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
