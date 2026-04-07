import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  CompanyListResponse,
  CompanyOption,
  CreateOnboardingResponse,
  OnboardingInstance,
  OnboardingReviewData,
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

  getPublicReviewData(linkToken: string): Observable<OnboardingReviewData> {
    return this.http.get<OnboardingReviewData>(`/api/public/onboarding/${linkToken}/review-data`);
  }

  uploadFile(file: File, linkToken?: string, companyName?: string): Observable<{
    redirect: string;
    s3Key: string;
    fileName: string;
    traceId: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    if (linkToken) {
      formData.append('linkToken', linkToken);
    }

    let headers = new HttpHeaders();
    if (linkToken) {
      headers = headers.set('x-onboarding-link-token', linkToken);
    }
    if (companyName) {
      headers = headers.set('x-onboarding-company-name', companyName);
    }

    return this.http.post<{
      redirect: string;
      s3Key: string;
      fileName: string;
      traceId: string;
    }>('/api/upload', formData, { headers: headers.keys().length > 0 ? headers : undefined });
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
