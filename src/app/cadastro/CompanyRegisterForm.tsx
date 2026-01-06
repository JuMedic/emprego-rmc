'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select } from '@/components/ui';
import { companyRegisterSchema, type CompanyRegisterInput } from '@/lib/validations';

export function CompanyRegisterForm() {
  const router = useRouter();
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);
  const [segments, setSegments] = useState<{ value: string; label: string }[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CompanyRegisterInput>({
    resolver: zodResolver(companyRegisterSchema),
    defaultValues: {
      acceptTerms: false,
      cityIds: [],
    },
  });

  const selectedCities = watch('cityIds') || [];

  useEffect(() => {
    Promise.all([
      fetch('/api/cities').then((res) => res.json()),
      fetch('/api/segments').then((res) => res.json()),
    ])
      .then(([citiesData, segmentsData]) => {
        if (citiesData.success) {
          setCities(citiesData.data.map((c: any) => ({ value: c.id, label: c.name })));
        }
        if (segmentsData.success) {
          setSegments(segmentsData.data.map((s: any) => ({ value: s.id, label: s.name })));
        }
      })
      .catch(console.error);
  }, []);

  const toggleCity = (cityId: string) => {
    const current = selectedCities;
    if (current.includes(cityId)) {
      setValue('cityIds', current.filter((id) => id !== cityId));
    } else {
      setValue('cityIds', [...current, cityId]);
    }
  };

  const onSubmit = async (data: CompanyRegisterInput) => {
    setError('');

    try {
      const response = await fetch('/api/auth/register/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao cadastrar');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar');
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Cadastro realizado!</h3>
        <p className="text-gray-600">Sua empresa será analisada em breve.</p>
        <p className="text-gray-500 text-sm mt-2">Redirecionando para o login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...register('legalName')}
          label="Razão Social *"
          placeholder="Nome jurídico da empresa"
          error={errors.legalName?.message}
        />
        <Input
          {...register('tradeName')}
          label="Nome Fantasia *"
          placeholder="Nome comercial"
          error={errors.tradeName?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...register('cnpj')}
          label="CNPJ *"
          placeholder="00.000.000/0000-00"
          error={errors.cnpj?.message}
        />
        <Input
          {...register('phone')}
          label="Telefone *"
          placeholder="(19) 99999-9999"
          error={errors.phone?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...register('email')}
          type="email"
          label="E-mail *"
          placeholder="contato@empresa.com"
          error={errors.email?.message}
        />
        <Select
          {...register('segmentId')}
          label="Segmento"
          placeholder="Selecione o segmento"
          options={[{ value: '', label: 'Selecione...' }, ...segments]}
        />
      </div>

      {/* Seleção de cidades */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cidades de atuação *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
          {cities.map((city) => (
            <label
              key={city.value}
              className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                selectedCities.includes(city.value)
                  ? 'bg-purple-100 text-purple-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedCities.includes(city.value)}
                onChange={() => toggleCity(city.value)}
                className="rounded border-gray-300 text-purple-600 mr-2"
              />
              <span className="text-sm">{city.label}</span>
            </label>
          ))}
        </div>
        {errors.cityIds && (
          <p className="text-sm text-red-600 mt-1">{errors.cityIds.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...register('password')}
          type="password"
          label="Senha *"
          placeholder="Mínimo 6 caracteres"
          error={errors.password?.message}
        />
        <Input
          {...register('confirmPassword')}
          type="password"
          label="Confirmar Senha *"
          placeholder="Repita a senha"
          error={errors.confirmPassword?.message}
        />
      </div>

      <div className="flex items-start">
        <input
          {...register('acceptTerms')}
          type="checkbox"
          id="acceptTermsCompany"
          className="rounded border-gray-300 text-purple-600 mt-1"
        />
        <label htmlFor="acceptTermsCompany" className="ml-2 text-sm text-gray-600">
          Li e aceito os{' '}
          <a href="/termos" target="_blank" className="text-purple-600 hover:underline">
            Termos de Uso
          </a>
          {' '}e a{' '}
          <a href="/privacidade" target="_blank" className="text-purple-600 hover:underline">
            Política de Privacidade
          </a>
        </label>
      </div>
      {errors.acceptTerms && (
        <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
      )}

      <Button 
        type="submit" 
        isLoading={isSubmitting} 
        className="w-full bg-purple-600 hover:bg-purple-700" 
        size="lg"
      >
        Criar Conta de Empresa
      </Button>
    </form>
  );
}
