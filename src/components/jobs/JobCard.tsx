import Link from 'next/link';
import { MapPin, Building2, Clock, Banknote, Heart, Users } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { formatCurrency, JOB_LEVELS, JOB_MODALITIES, CONTRACT_TYPES } from '@/lib/utils';
import type { JobWithRelations } from '@/types';

interface JobCardProps {
  job: JobWithRelations;
  showFavorite?: boolean;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
}

export function JobCard({ job, showFavorite = false, isFavorited = false, onToggleFavorite }: JobCardProps) {
  const cities = job.cities.map(c => c.city.name).join(', ');
  const salary = job.hideSalary 
    ? 'A combinar' 
    : job.salaryMin && job.salaryMax 
      ? `${formatCurrency(Number(job.salaryMin))} - ${formatCurrency(Number(job.salaryMax))}`
      : job.salaryMin 
        ? `A partir de ${formatCurrency(Number(job.salaryMin))}`
        : 'A combinar';

  const modalityColors = {
    ONSITE: 'default',
    HYBRID: 'info',
    REMOTE: 'success',
  } as const;

  return (
    <Card variant="bordered" className="hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant={modalityColors[job.modality]} size="sm">
              {JOB_MODALITIES[job.modality]}
            </Badge>
            <Badge variant="outline" size="sm">
              {CONTRACT_TYPES[job.contractType]}
            </Badge>
            <Badge variant="outline" size="sm">
              {JOB_LEVELS[job.level]}
            </Badge>
            {job.isFeatured && (
              <Badge variant="warning" size="sm">
                ⭐ Destaque
              </Badge>
            )}
          </div>

          {/* Título */}
          <Link href={`/vagas/${job.cities[0]?.city.slug}/${job.slug}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              {job.title}
            </h3>
          </Link>

          {/* Empresa */}
          <div className="flex items-center text-gray-600 mt-1">
            <Building2 className="h-4 w-4 mr-1" />
            <span className="text-sm">{job.company.tradeName}</span>
          </div>

          {/* Info */}
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {cities}
            </div>
            <div className="flex items-center">
              <Banknote className="h-4 w-4 mr-1" />
              {salary}
            </div>
            {job._count?.applications !== undefined && (
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {job._count.applications} candidatos
              </div>
            )}
          </div>

          {/* Área */}
          <div className="mt-3">
            <span className="text-xs text-gray-400">{job.area.name}</span>
          </div>
        </div>

        {/* Favoritar */}
        {showFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite?.();
            }}
            className={`p-2 rounded-full transition-colors ${
              isFavorited 
                ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-gray-400">
          <Clock className="h-3 w-3 inline mr-1" />
          {job.publishedAt ? new Date(job.publishedAt).toLocaleDateString('pt-BR') : 'Rascunho'}
        </span>
        <Link href={`/vagas/${job.cities[0]?.city.slug}/${job.slug}`}>
          <Button size="sm">Ver Vaga</Button>
        </Link>
      </div>
    </Card>
  );
}
