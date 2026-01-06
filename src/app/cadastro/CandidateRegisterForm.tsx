'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select } from '@/components/ui';
import { candidateRegisterSchema, type CandidateRegisterInput } from '@/lib/validations';

export function CandidateRegisterForm() {
  const router = useRouter();
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CandidateRegisterInput>({
    resolver: zodResolver(candidateRegisterSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  useEffect(() => {
    fetch('/api/cities')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCities(data.data.map((c: any) => ({ value: c.id, label: c.name })));
        }
      })
      .catch(console.error);
  }, []);

  const onSubmit = async (data: CandidateRegisterInput) => {
    setError('');

    try {
      const response = await fetch('/api/auth/register/candidate', {
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
        <p className="text-gray-600">Redirecionando para o login...</p>
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

      <Input
        {...register('fullName')}
        label="Nome Completo *"
        placeholder="Seu nome completo"
        error={errors.fullName?.message}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...register('email')}
          type="email"
          label="E-mail *"
          placeholder="seu@email.com"
          error={errors.email?.message}
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
          {...register('cpf')}
          label="CPF (opcional)"
          placeholder="000.000.000-00"
          error={errors.cpf?.message}
          helperText="Protegido conforme LGPD"
        />
        <Select
          {...register('residenceCityId')}
          label="Cidade *"
          placeholder="Selecione sua cidade"
          options={cities}
          error={errors.residenceCityId?.message}
        />
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
          id="acceptTerms"
          className="rounded border-gray-300 text-blue-600 mt-1"
        />
        <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-600">
          Li e aceito os{' '}
          <a href="/termos" target="_blank" className="text-blue-600 hover:underline">
            Termos de Uso
          </a>
          {' '}e a{' '}
          <a href="/privacidade" target="_blank" className="text-blue-600 hover:underline">
            Política de Privacidade
          </a>
        </label>
      </div>
      {errors.acceptTerms && (
        <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
      )}

      <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
        Criar Conta de Candidato
      </Button>
    </form>
  );
}
