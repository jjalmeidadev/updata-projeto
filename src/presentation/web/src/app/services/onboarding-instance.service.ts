import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  CompanyListResponse,
  CompanyOption,
  CreateOnboardingResponse,
  OnboardingInstance,
  OnboardingListResponse,
} from '../models/onboarding-instance.model';

@Injectable({ providedIn: 'root' })
export class OnboardingInstanceService {
  private readonly http = inject(HttpClient);

  listCompanies(): Observable<CompanyOption[]> {
    return this.http.get<CompanyListResponse>('/api/companies').pipe(
      map((response: CompanyListResponse) => response.items)
    );
  }

  listInstances(): Observable<OnboardingInstance[]> {
    return this.http.get<OnboardingListResponse>('/api/onboarding-instances').pipe(
      map((response: OnboardingListResponse) => response.items)
    );
  }

  createInstance(payload: {
    companyName: string;
    selectedSections: string[];
  }): Observable<CreateOnboardingResponse> {
    return this.http.post<CreateOnboardingResponse>('/api/onboarding-instances', payload);
  }

  getPublicInstance(linkToken: string): Observable<OnboardingInstance> {
    return this.http.get<OnboardingInstance>(`/api/public/onboarding/${linkToken}`);
  }

  saveProgress(linkToken: string, payload: {
    formData: Record<string, unknown>;
    progressPercent: number;
  }): Observable<OnboardingInstance> {
    return this.http.patch<OnboardingInstance>(
      `/api/public/onboarding/${linkToken}/progress`,
      payload
    );
  }

  submit(linkToken: string, payload: {
    formData: Record<string, unknown>;
  }): Observable<OnboardingInstance> {
    return this.http.post<OnboardingInstance>(
      `/api/public/onboarding/${linkToken}/submit`,
      payload
    );
  }

  completeEquiemReview(linkToken: string): Observable<OnboardingInstance> {
    return this.http.post<OnboardingInstance>(
      `/api/onboarding-instances/${linkToken}/review/complete`,
      {}
    );
  }

approveInstance(linkToken: string) {
  return this.http.post<OnboardingInstance>(
    `/api/onboarding-instances/${linkToken}/approve`,
    {}
  );
}

rejectInstance(linkToken: string, reason: string) {
  return this.http.post<OnboardingInstance>(
    `/api/onboarding-instances/${linkToken}/reject`,
    { reason }
  );
}
}
