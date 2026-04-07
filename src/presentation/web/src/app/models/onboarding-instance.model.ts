export interface OnboardingInstance {
  id: string;
  companyId: string | null;
  companyName: string;
  selectedSections: string[];
  status: OnboardingStatus;
  progressPercent: number;
  linkToken: string;
  linkUrl: string;
  formData: Record<string, unknown>;
  emailStatus: string;
  emailPayload: Record<string, unknown> | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyOption {
  id: string;
  name: string;
}

export interface OnboardingListResponse {
  items: OnboardingInstance[];
}

export interface CompanyListResponse {
  items: CompanyOption[];
}

export interface CreateOnboardingResponse {
  instance: OnboardingInstance;
  reusedExistingInstance: boolean;
  reuseRule: string;
}
export type OnboardingStatus =
  | 'draft'
  | 'in_progress'
  | 'equiem_review'
  | 'completed'
  | 'rejected';

export interface OnboardingInstance {
  id: string;
  companyId: string | null;
  companyName: string;
  selectedSections: string[];
  status: OnboardingStatus;
  progressPercent: number;
  linkToken: string;
  linkUrl: string;
  formData: Record<string, unknown>;
  emailStatus: string;
  emailPayload: Record<string, unknown> | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}