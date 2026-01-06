'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Search, Filter, X } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { JOB_LEVELS, JOB_MODALITIES, CONTRACT_TYPES } from '@/lib/utils';

interface SearchFiltersProps {
  cities: { value: string; label: string }[];
  areas: { value: string; label: string }[];
}

interface FilterForm {
  q: string;
  city: string;
  area: string;
  level: string;
  modality: string;
  contractType: string;
  salaryMin: string;
  salaryMax: string;
}

export function JobSearchFilters({ cities, areas }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { register, handleSubmit, reset, watch } = useForm<FilterForm>({
    defaultValues: {
      q: searchParams.get('q') || '',
      city: searchParams.get('city') || '',
      area: searchParams.get('area') || '',
      level: searchParams.get('level') || '',
      modality: searchParams.get('modality') || '',
      contractType: searchParams.get('contractType') || '',
      salaryMin: searchParams.get('salaryMin') || '',
      salaryMax: searchParams.get('salaryMax') || '',
    },
  });

  const onSubmit = (data: FilterForm) => {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(`/vagas?${params.toString()}`);
  };

  const clearFilters = () => {
    reset({
      q: '',
      city: '',
      area: '',
      level: '',
      modality: '',
      contractType: '',
      salaryMin: '',
      salaryMax: '',
    });
    router.push('/vagas');
  };

  const hasFilters = Object.values(watch()).some(v => v !== '');

  const levelOptions = Object.entries(JOB_LEVELS).map(([value, label]) => ({ value, label }));
  const modalityOptions = Object.entries(JOB_MODALITIES).map(([value, label]) => ({ value, label }));
  const contractOptions = Object.entries(CONTRACT_TYPES).map(([value, label]) => ({ value, label }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border p-6">
      {/* Busca principal */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            {...register('q')}
            type="text"
            placeholder="Buscar por cargo, empresa ou palavra-chave..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button type="submit" size="lg">
          Buscar
        </Button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Select
          {...register('city')}
          placeholder="Cidade"
          options={[{ value: '', label: 'Todas as cidades' }, ...cities]}
        />
        <Select
          {...register('area')}
          placeholder="Área"
          options={[{ value: '', label: 'Todas as áreas' }, ...areas]}
        />
        <Select
          {...register('level')}
          placeholder="Nível"
          options={[{ value: '', label: 'Todos os níveis' }, ...levelOptions]}
        />
        <Select
          {...register('modality')}
          placeholder="Modalidade"
          options={[{ value: '', label: 'Todas' }, ...modalityOptions]}
        />
        <Select
          {...register('contractType')}
          placeholder="Contrato"
          options={[{ value: '', label: 'Todos' }, ...contractOptions]}
        />
        
        {hasFilters && (
          <Button type="button" variant="ghost" onClick={clearFilters} className="flex items-center">
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>
    </form>
  );
}
