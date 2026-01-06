import type {
  User,
  Candidate,
  Company,
  Job,
  City,
  JobArea,
  Segment,
  Application,
  Plan,
} from '@prisma/client';

// Types with relations
export type UserWithRelations = User & {
  candidate?: CandidateWithRelations | null;
  company?: CompanyWithRelations | null;
};

export type CandidateWithRelations = Candidate & {
  user: User;
  residenceCity: City;
  area?: JobArea | null;
  workCities?: { city: City }[];
};

export type CompanyWithRelations = Company & {
  user: User;
  segment?: Segment | null;
  cities?: { city: City }[];
};

export type JobWithRelations = Job & {
  company: CompanyWithRelations;
  area: JobArea;
  cities: { city: City }[];
  _count?: {
    applications: number;
    favorites: number;
  };
};

export type ApplicationWithRelations = Application & {
  job: JobWithRelations;
  candidate: CandidateWithRelations;
};

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Stats types
export interface DashboardStats {
  totalJobs: number;
  totalCandidates: number;
  totalCompanies: number;
  totalApplications: number;
  jobsByCity: { city: string; count: number }[];
  jobsByArea: { area: string; count: number }[];
  recentJobs: JobWithRelations[];
}

export interface CompanyDashboardStats {
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  viewsThisMonth: number;
  applicationsByJob: { jobTitle: string; count: number }[];
  recentApplications: ApplicationWithRelations[];
}

export interface CandidateDashboardStats {
  totalApplications: number;
  pendingApplications: number;
  viewedApplications: number;
  favoriteJobs: number;
  matchingJobs: JobWithRelations[];
  recentApplications: ApplicationWithRelations[];
}

// Search types
export interface JobSearchFilters {
  q?: string;
  city?: string;
  area?: string;
  level?: string;
  modality?: string;
  contractType?: string;
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  limit?: number;
  orderBy?: 'recent' | 'salary' | 'applications';
}

// Form types
export interface SelectOption {
  value: string;
  label: string;
}
