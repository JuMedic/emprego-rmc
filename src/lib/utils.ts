import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return 'A combinar';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR');
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function calculateMatchScore(candidateSkills: string[], jobRequirements: string[]): number {
  if (!candidateSkills.length || !jobRequirements.length) return 0;
  
  const normalizedCandidateSkills = candidateSkills.map(s => s.toLowerCase());
  const normalizedJobRequirements = jobRequirements.map(r => r.toLowerCase());
  
  let matches = 0;
  for (const skill of normalizedCandidateSkills) {
    if (normalizedJobRequirements.some(req => req.includes(skill) || skill.includes(req))) {
      matches++;
    }
  }
  
  return Math.round((matches / normalizedJobRequirements.length) * 100);
}

export const JOB_LEVELS = {
  INTERN: 'Estágio',
  APPRENTICE: 'Aprendiz',
  JUNIOR: 'Júnior',
  MID: 'Pleno',
  SENIOR: 'Sênior',
} as const;

export const JOB_MODALITIES = {
  ONSITE: 'Presencial',
  HYBRID: 'Híbrido',
  REMOTE: 'Remoto',
} as const;

export const CONTRACT_TYPES = {
  CLT: 'CLT',
  PJ: 'PJ',
  TEMPORARY: 'Temporário',
  INTERNSHIP: 'Estágio',
  APPRENTICE: 'Aprendiz',
  FREELANCER: 'Freelancer',
} as const;

export const APPLICATION_STATUS = {
  PENDING: 'Em análise',
  VIEWED: 'Visualizado',
  CONTACTED: 'Chamado',
  REJECTED: 'Reprovado',
  HIRED: 'Contratado',
} as const;

export const EDUCATION_LEVELS = {
  FUNDAMENTAL: 'Ensino Fundamental',
  MEDIO: 'Ensino Médio',
  TECNICO: 'Técnico',
  SUPERIOR_INCOMPLETO: 'Superior Incompleto',
  SUPERIOR: 'Superior Completo',
  POS_GRADUACAO: 'Pós-graduação',
  MESTRADO: 'Mestrado',
  DOUTORADO: 'Doutorado',
} as const;
