import { z } from 'zod';

// Validação de CPF
function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (parseInt(cpf.charAt(9)) !== digit) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (parseInt(cpf.charAt(10)) !== digit) return false;
  
  return true;
}

// Validação de CNPJ
function isValidCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]/g, '');
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights1[i];
  }
  let digit = sum % 11;
  digit = digit < 2 ? 0 : 11 - digit;
  if (parseInt(cnpj.charAt(12)) !== digit) return false;
  
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights2[i];
  }
  digit = sum % 11;
  digit = digit < 2 ? 0 : 11 - digit;
  if (parseInt(cnpj.charAt(13)) !== digit) return false;
  
  return true;
}

// Schemas de validação

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const candidateRegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().optional().refine((val) => !val || isValidCPF(val), 'CPF inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  residenceCityId: z.string().min(1, 'Selecione sua cidade'),
  acceptTerms: z.boolean().refine((val) => val === true, 'Você deve aceitar os termos'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export const companyRegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  legalName: z.string().min(3, 'Razão social deve ter pelo menos 3 caracteres'),
  tradeName: z.string().min(2, 'Nome fantasia deve ter pelo menos 2 caracteres'),
  cnpj: z.string().refine(isValidCNPJ, 'CNPJ inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  segmentId: z.string().optional(),
  cityIds: z.array(z.string()).min(1, 'Selecione pelo menos uma cidade'),
  acceptTerms: z.boolean().refine((val) => val === true, 'Você deve aceitar os termos'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export const candidateProfileSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
  residenceCityId: z.string().min(1, 'Selecione sua cidade'),
  desiredPosition: z.string().optional(),
  level: z.enum(['INTERN', 'APPRENTICE', 'JUNIOR', 'MID', 'SENIOR']).optional(),
  areaId: z.string().optional(),
  experienceYears: z.number().min(0).max(50).optional(),
  education: z.enum([
    'FUNDAMENTAL', 'MEDIO', 'TECNICO', 'SUPERIOR_INCOMPLETO',
    'SUPERIOR', 'POS_GRADUACAO', 'MESTRADO', 'DOUTORADO'
  ]).optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  workCityIds: z.array(z.string()).optional(),
  isPublicProfile: z.boolean().optional(),
  receiveAlerts: z.boolean().optional(),
});

export const jobSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  description: z.string().min(50, 'Descrição deve ter pelo menos 50 caracteres'),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  areaId: z.string().min(1, 'Selecione uma área'),
  level: z.enum(['INTERN', 'APPRENTICE', 'JUNIOR', 'MID', 'SENIOR']),
  modality: z.enum(['ONSITE', 'HYBRID', 'REMOTE']),
  contractType: z.enum(['CLT', 'PJ', 'TEMPORARY', 'INTERNSHIP', 'APPRENTICE', 'FREELANCER']),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  hideSalary: z.boolean().optional(),
  workSchedule: z.string().optional(),
  cityIds: z.array(z.string()).min(1, 'Selecione pelo menos uma cidade'),
  applyByPlatform: z.boolean().optional(),
  applyByWhatsapp: z.string().optional(),
  applyByEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  applyByUrl: z.string().url('URL inválida').optional().or(z.literal('')),
});

export const jobSearchSchema = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  level: z.string().optional(),
  modality: z.string().optional(),
  contractType: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(50).optional().default(20),
  orderBy: z.enum(['recent', 'salary', 'applications']).optional().default('recent'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CandidateRegisterInput = z.infer<typeof candidateRegisterSchema>;
export type CompanyRegisterInput = z.infer<typeof companyRegisterSchema>;
export type CandidateProfileInput = z.infer<typeof candidateProfileSchema>;
export type JobInput = z.infer<typeof jobSchema>;
export type JobSearchInput = z.infer<typeof jobSearchSchema>;
