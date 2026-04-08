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
  sectionReview: Record<string, {
    status: 'approved' | 'rejected';
    reason?: string;
    reviewedAt: string;
  }>;
  returnedSections: string[];
  rejectionReason: string | null;
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

export interface ReviewDataItem {
  rowNumber: number;
  rawData: Record<string, unknown>;
}

export interface OnboardingReviewData {
  linkToken: string;
  batchId: string | null;
  items: ReviewDataItem[];
}

// Equiem Review specific interfaces
export interface ReviewListFilters {
  searchQuery?: string;
  status?: OnboardingStatus;
  sortBy?: 'company' | 'submitted' | 'updated';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedReviewList {
  items: OnboardingInstance[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface RejectReasonInput {
  reason: string;
  linkToken: string;
}

export interface SectionDecisionInput {
  linkToken: string;
  sectionId: string;
  decision: 'approved' | 'rejected';
  reason?: string;
}

export interface DataSnapshot {
  timestamp: string;
  data: Record<string, unknown>;
}

export interface DataComparison {
  linkToken: string;
  previous: DataSnapshot | null;
  current: DataSnapshot;
  changes: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
}
