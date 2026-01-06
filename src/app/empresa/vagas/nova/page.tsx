'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select, Textarea, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { jobSchema, type JobInput } from '@/lib/validations';
import { JOB_LEVELS, JOB_MODALITIES, CONTRACT_TYPES } from '@/lib/utils';

export default function NovaVagaPage() {
  const router = useRouter();
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);
  const [areas, setAreas] = useState<{ value: string; label: string }[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<JobInput>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      cityIds: [],
      hideSalary: false,
      applyByPlatform: true,
    },
  });

  const selectedCities = watch('cityIds') || [];
  const hideSalary = watch('hideSalary');

  useEffect(() => {
    Promise.all([
      fetch('/api/cities').then((res) => res.json()),
      fetch('/api/areas').then((res) => res.json()),
    ])
      .then(([citiesData, areasData]) => {
        if (citiesData.success) {
          setCities(citiesData.data.map((c: any) => ({ value: c.id, label: c.name })));
        }
        if (areasData.success) {
          setAreas(areasData.data.map((a: any) => ({ value: a.id, label: a.name })));
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

  const levelOptions = Object.entries(JOB_LEVELS).map(([value, label]) => ({ value, label }));
  const modalityOptions = Object.entries(JOB_MODALITIES).map(([value, label]) => ({ value, label }));
  const contractOptions = Object.entries(CONTRACT_TYPES).map(([value, label]) => ({ value, label }));

  const onSubmit = async (data: JobInput) => {
    setError('');

    try {
      const response = await fetch('/api/company/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar vaga');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/empresa/vagas');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar vaga');
    }
  };

  if (success) {
    return (
      <div className="container-app py-8">
        <Card variant="bordered" className="max-w-2xl mx-auto text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Vaga criada com sucesso!</h3>
          <p className="text-gray-600">Redirecionando...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Publicar Nova Vaga</h1>
          <p className="text-gray-600">Preencha os detalhes da vaga</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {/* Informações Básicas */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                {...register('title')}
                label="Título da Vaga *"
                placeholder="Ex: Desenvolvedor Full Stack"
                error={errors.title?.message}
              />

              <Textarea
                {...register('description')}
                label="Descrição da Vaga *"
                placeholder="Descreva as responsabilidades e atividades do cargo..."
                error={errors.description?.message}
                className="min-h-[150px]"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  {...register('areaId')}
                  label="Área *"
                  placeholder="Selecione a área"
                  options={areas}
                  error={errors.areaId?.message}
                />
                <Select
                  {...register('level')}
                  label="Nível *"
                  placeholder="Selecione o nível"
                  options={levelOptions}
                  error={errors.level?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  {...register('modality')}
                  label="Modalidade *"
                  placeholder="Selecione"
                  options={modalityOptions}
                  error={errors.modality?.message}
                />
                <Select
                  {...register('contractType')}
                  label="Tipo de Contrato *"
                  placeholder="Selecione"
                  options={contractOptions}
                  error={errors.contractType?.message}
                />
              </div>
            </CardContent>
          </Card>

          {/* Localização */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Localização</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cidades da Vaga *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {cities.map((city) => (
                  <label
                    key={city.value}
                    className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                      selectedCities.includes(city.value)
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCities.includes(city.value)}
                      onChange={() => toggleCity(city.value)}
                      className="rounded border-gray-300 text-blue-600 mr-2"
                    />
                    <span className="text-sm">{city.label}</span>
                  </label>
                ))}
              </div>
              {errors.cityIds && (
                <p className="text-sm text-red-600 mt-1">{errors.cityIds.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Salário */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Remuneração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <input
                  {...register('hideSalary')}
                  type="checkbox"
                  id="hideSalary"
                  className="rounded border-gray-300 text-blue-600 mr-2"
                />
                <label htmlFor="hideSalary" className="text-sm text-gray-700">
                  Salário a combinar (não exibir valores)
                </label>
              </div>

              {!hideSalary && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    {...register('salaryMin', { valueAsNumber: true })}
                    type="number"
                    label="Salário Mínimo (R$)"
                    placeholder="0,00"
                    error={errors.salaryMin?.message}
                  />
                  <Input
                    {...register('salaryMax', { valueAsNumber: true })}
                    type="number"
                    label="Salário Máximo (R$)"
                    placeholder="0,00"
                    error={errors.salaryMax?.message}
                  />
                </div>
              )}

              <Input
                {...register('workSchedule')}
                label="Horário de Trabalho"
                placeholder="Ex: Segunda a Sexta, 08h às 17h"
              />
            </CardContent>
          </Card>

          {/* Detalhes */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Detalhes Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                {...register('requirements')}
                label="Requisitos"
                placeholder="Liste os requisitos e qualificações desejadas..."
              />

              <Textarea
                {...register('benefits')}
                label="Benefícios"
                placeholder="Liste os benefícios oferecidos..."
              />
            </CardContent>
          </Card>

          {/* Como Receber Candidaturas */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Como Receber Candidaturas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <input
                  {...register('applyByPlatform')}
                  type="checkbox"
                  id="applyByPlatform"
                  className="rounded border-gray-300 text-blue-600 mr-2"
                />
                <label htmlFor="applyByPlatform" className="text-sm text-gray-700">
                  Receber pela plataforma (recomendado)
                </label>
              </div>

              <Input
                {...register('applyByWhatsapp')}
                label="WhatsApp (opcional)"
                placeholder="(19) 99999-9999"
              />

              <Input
                {...register('applyByEmail')}
                type="email"
                label="E-mail (opcional)"
                placeholder="rh@empresa.com"
                error={errors.applyByEmail?.message}
              />

              <Input
                {...register('applyByUrl')}
                label="Link Externo (opcional)"
                placeholder="https://..."
                error={errors.applyByUrl?.message}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              Publicar Vaga
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
