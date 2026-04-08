import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OnboardingInstanceService } from '../../services/onboarding-instance.service';
import { OnboardingInstance } from '../../models/onboarding-instance.model';
import { RejectReasonModalComponent } from '../../components/reject-reason-modal/reject-reason-modal.component';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  standalone: true,
  selector: 'app-equiem-review',
  imports: [CommonModule, FormsModule, RejectReasonModalComponent, ConfirmModalComponent],
  templateUrl: './equiem-review.component.html',
  styleUrls: ['./equiem-review.component.css']
})
export class EquiemReviewComponent implements OnInit {

  private service = inject(OnboardingInstanceService);
  private router = inject(Router);

  allInstances = signal<OnboardingInstance[]>([]);
  displayedInstances = signal<OnboardingInstance[]>([]);
  loading = signal(true);
  feedback = signal('');
  feedbackType = signal<'success' | 'error' | ''>('');
  searchQuery = signal('');
  sortBy = signal<'company' | 'submitted' | 'updated'>('updated');
  sortOrder = signal<'asc' | 'desc'>('desc');
  
  // Paginação
  currentPage = signal(1);
  pageSize = signal(10);
  
  // Modal de rejeição
  rejectModalOpen = signal(false);
  selectedInstanceForReject = signal<OnboardingInstance | null>(null);
  rejectingInstanceId = signal<string | null>(null);
  approveModalOpen = signal(false);
  selectedInstanceForApprove = signal<OnboardingInstance | null>(null);
  approvingInstanceId = signal<string | null>(null);

  ngOnInit() {
    this.load();
  }

  backToMonitoring() {
    this.router.navigate(['/monitoring']);
  }

  load() {
    this.loading.set(true);

    this.service.listInstances().subscribe({
      next: data => {
        this.allInstances.set(
          data.filter(i => i.status === 'equiem_review')
        );
        this.applyFiltersAndSort();
      }
    });
  }

  private applyFiltersAndSort() {
    let filtered = this.allInstances();

    // Aplicar busca
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(i =>
        i.companyName.toLowerCase().includes(query) ||
        i.linkToken.toLowerCase().includes(query)
      );
    }

    // Aplicar ordenação
    const sortBy = this.sortBy();
    const sortOrder = this.sortOrder() === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortBy) {
        case 'company':
          aVal = a.companyName.toLowerCase();
          bVal = b.companyName.toLowerCase();
          break;
        case 'submitted':
          aVal = a.submittedAt || '';
          bVal = b.submittedAt || '';
          break;
        case 'updated':
        default:
          aVal = a.updatedAt;
          bVal = b.updatedAt;
      }

      if (aVal < bVal) return -1 * sortOrder;
      if (aVal > bVal) return 1 * sortOrder;
      return 0;
    });

    // Paginação
    this.currentPage.set(1);
    this.updateDisplayedInstances(filtered);
    this.loading.set(false);
  }

  private updateDisplayedInstances(filtered: OnboardingInstance[]) {
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    const end = start + size;

    this.displayedInstances.set(filtered.slice(start, end));
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
    this.applyFiltersAndSort();
  }

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    this.onSearchChange(target?.value ?? '');
  }

  onSortChange(by: 'company' | 'submitted' | 'updated') {
    if (this.sortBy() === by) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(by);
      this.sortOrder.set('desc');
    }
    this.applyFiltersAndSort();
  }

  goToPage(page: number) {
    const maxPage = Math.ceil(this.allInstances().length / this.pageSize());
    if (page < 1 || page > maxPage) return;
    
    this.currentPage.set(page);
    const filtered = this.applyCurrentFilters();
    this.updateDisplayedInstances(filtered);
  }

  private applyCurrentFilters(): OnboardingInstance[] {
    let filtered = this.allInstances();
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(i =>
        i.companyName.toLowerCase().includes(query) ||
        i.linkToken.toLowerCase().includes(query)
      );
    }
    return filtered;
  }

  open(instance: OnboardingInstance) {
    this.router.navigate(['/equiem-review', instance.linkToken]);
  }

  openRejectModal(instance: OnboardingInstance) {
    this.selectedInstanceForReject.set(instance);
    this.rejectModalOpen.set(true);
  }

  openApproveModal(instance: OnboardingInstance): void {
    this.selectedInstanceForApprove.set(instance);
    this.approveModalOpen.set(true);
  }

  onRejectConfirm(reason: string) {
    const instance = this.selectedInstanceForReject();
    if (!instance) return;

    this.rejectingInstanceId.set(instance.id);

    this.service.rejectInstance(instance.linkToken, reason)
      .subscribe({
        next: () => {
          this.feedback.set(`Onboarding for ${instance.companyName} was rejected.`);
          this.feedbackType.set('success');
          this.rejectModalOpen.set(false);
          this.selectedInstanceForReject.set(null);
          this.rejectingInstanceId.set(null);
          setTimeout(() => this.load(), 1500);
        },
        error: (err) => {
          this.feedback.set(`Failed to reject: ${err?.error?.error || 'Try again'}`);
          this.feedbackType.set('error');
          this.rejectingInstanceId.set(null);
        }
      });
  }

  onRejectCancel() {
    this.rejectModalOpen.set(false);
    this.selectedInstanceForReject.set(null);
  }

  approve(instance: OnboardingInstance) {
    this.openApproveModal(instance);
  }

  onApproveConfirm(): void {
    const instance = this.selectedInstanceForApprove();
    if (!instance) return;

    this.approvingInstanceId.set(instance.id);

    this.service.approveInstance(instance.linkToken)
      .subscribe({
        next: () => {
          this.feedback.set(`Onboarding for ${instance.companyName} was approved.`);
          this.feedbackType.set('success');
          this.approveModalOpen.set(false);
          this.selectedInstanceForApprove.set(null);
          this.approvingInstanceId.set(null);
          setTimeout(() => this.load(), 1500);
        },
        error: (err) => {
          this.feedback.set(`Failed to approve: ${err?.error?.error || 'Try again'}`);
          this.feedbackType.set('error');
          this.approvingInstanceId.set(null);
        }
      });
  }

  onApproveCancel(): void {
    this.approveModalOpen.set(false);
    this.selectedInstanceForApprove.set(null);
  }

  get totalPages(): number {
    return Math.ceil(this.allInstances().length / this.pageSize());
  }

  get hasNextPage(): boolean {
    return this.currentPage() < this.totalPages;
  }

  get hasPrevPage(): boolean {
    return this.currentPage() > 1;
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}