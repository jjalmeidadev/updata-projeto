import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OnboardingInstanceService } from '../../services/onboarding-instance.service';
import { OnboardingInstance } from '../../models/onboarding-instance.model';
import { RejectReasonModalComponent } from '../../components/reject-reason-modal/reject-reason-modal.component';
import { Question, QuestionType } from '../../models/question.model';
import { QuestionService, SECTION_LABELS } from '../../services/question.service';

type ReviewState = 'pending' | 'approved' | 'rejected';

interface SectionQuestionView {
  id: string;
  label: string;
  value: unknown;
  type: QuestionType;
}

interface ReviewSection {
  id: string;
  label: string;
  status: ReviewState;
  reason?: string;
  questions: SectionQuestionView[];
}

@Component({
  selector: 'app-equiem-review-detail',
  standalone: true,
  imports: [CommonModule, RejectReasonModalComponent],
  templateUrl: './equiem-review-detail.component.html',
  styleUrls: ['./equiem-review-detail.component.css']
})
export class EquiemReviewDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly service = inject(OnboardingInstanceService);
  private readonly questionService = inject(QuestionService);

  readonly instance = signal<OnboardingInstance | null>(null);
  readonly loading = signal(true);
  readonly feedback = signal('');
  readonly feedbackType = signal<'success' | 'error' | ''>('');
  readonly isProcessing = signal(false);
  readonly showRejectModal = signal(false);
  readonly sectionToReject = signal<ReviewSection | null>(null);
  readonly selectedSectionId = signal<string | null>(null);
  readonly sectionSearch = signal('');
  readonly statusFilter = signal<'all' | ReviewState>('all');

  sections = signal<ReviewSection[]>([]);
  allQuestions = signal<Question[]>([]);
  readonly filteredSections = computed(() => {
    const search = this.sectionSearch().trim().toLowerCase();
    const filter = this.statusFilter();

    return this.sections().filter((section) => {
      const matchesSearch = !search || section.label.toLowerCase().includes(search);
      const matchesFilter = filter === 'all' || section.status === filter;
      return matchesSearch && matchesFilter;
    });
  });
  readonly selectedSection = computed(() => {
    const selectedId = this.selectedSectionId();
    if (!selectedId) return null;
    return this.sections().find((section) => section.id === selectedId) ?? null;
  });
  readonly progressSummary = computed(() => {
    const sections = this.sections();
    const approved = sections.filter((section) => section.status === 'approved').length;
    const rejected = sections.filter((section) => section.status === 'rejected').length;
    const pending = sections.filter((section) => section.status === 'pending').length;
    return {
      total: sections.length,
      approved,
      rejected,
      pending,
    };
  });

  ngOnInit(): void {
    const linkToken = this.route.snapshot.paramMap.get('linkToken');
    if (!linkToken) {
      this.loading.set(false);
      return;
    }

    this.service.getReviewInstance(linkToken).subscribe({
      next: (found) => {
        this.instance.set(found);

        this.questionService.getQuestions().subscribe({
          next: (questions) => {
            this.allQuestions.set(questions);
            this.buildSectionReview(found, questions);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.instance.set(null);
        this.loading.set(false);
      }
    });
  }

  backToReviewList(): void {
    this.router.navigate(['/equiem-review']);
  }

  private buildSectionReview(instance: OnboardingInstance, questions: Question[]): void {
    const formData = instance.formData ?? {};
    const sectionReview = instance.sectionReview ?? {};

    const nextSections: ReviewSection[] = instance.selectedSections.map((sectionId) => {
      const sectionQuestions = questions.filter((question) => question.sectionId === sectionId);
      const questionsView: SectionQuestionView[] = sectionQuestions.map((question) => ({
        id: question.id,
        label: question.question,
        value: formData[question.id],
        type: question.type,
      }));

      const reviewEntry = sectionReview[sectionId];
      const status: ReviewState = reviewEntry?.status ?? 'pending';

      return {
        id: sectionId,
        label: SECTION_LABELS[sectionId] ?? sectionId,
        status,
        reason: reviewEntry?.reason,
        questions: questionsView,
      };
    });

    this.sections.set(nextSections);

    const currentSelected = this.selectedSectionId();
    if (currentSelected && nextSections.some((section) => section.id === currentSelected)) {
      return;
    }

    this.selectedSectionId.set(nextSections[0]?.id ?? null);
  }

  setSelectedSection(sectionId: string): void {
    this.selectedSectionId.set(sectionId);
  }

  setStatusFilter(value: 'all' | ReviewState): void {
    this.statusFilter.set(value);

    const filtered = this.filteredSections();
    const selected = this.selectedSection();
    if (!selected || !filtered.some((section) => section.id === selected.id)) {
      this.selectedSectionId.set(filtered[0]?.id ?? null);
    }
  }

  onSectionSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.sectionSearch.set(target?.value ?? '');

    const filtered = this.filteredSections();
    const selected = this.selectedSection();
    if (!selected || !filtered.some((section) => section.id === selected.id)) {
      this.selectedSectionId.set(filtered[0]?.id ?? null);
    }
  }

  goToNextPending(): void {
    const currentId = this.selectedSectionId();
    const pendingSections = this.sections().filter((section) => section.status === 'pending');
    if (pendingSections.length === 0) {
      return;
    }

    const currentIndex = pendingSections.findIndex((section) => section.id === currentId);
    const nextIndex = currentIndex >= 0 && currentIndex < pendingSections.length - 1 ? currentIndex + 1 : 0;
    this.selectedSectionId.set(pendingSections[nextIndex]?.id ?? pendingSections[0].id);
  }

  approveSection(section: ReviewSection): void {
    const current = this.instance();
    if (!current) return;

    this.isProcessing.set(true);
    this.service.reviewSection({
      linkToken: current.linkToken,
      sectionId: section.id,
      decision: 'approved',
    }).subscribe({
      next: () => {
        this.feedback.set(`Section \"${section.label}\" approved.`);
        this.feedbackType.set('success');
        this.isProcessing.set(false);
        this.reloadCurrentInstance();
      },
      error: (err) => {
        this.feedback.set(`Failed to approve section: ${err?.error?.error || 'Try again'}`);
        this.feedbackType.set('error');
        this.isProcessing.set(false);
      }
    });
  }

  openRejectSection(section: ReviewSection): void {
    this.sectionToReject.set(section);
    this.showRejectModal.set(true);
  }

  onRejectConfirm(reason: string): void {
    const current = this.instance();
    const section = this.sectionToReject();
    if (!current) return;
    if (!section) return;

    this.isProcessing.set(true);

    this.service.reviewSection({
      linkToken: current.linkToken,
      sectionId: section.id,
      decision: 'rejected',
      reason,
    }).subscribe({
      next: () => {
        this.feedback.set(`Section \"${section.label}\" was returned for refill.`);
        this.feedbackType.set('success');
        this.showRejectModal.set(false);
        this.sectionToReject.set(null);
        this.isProcessing.set(false);
        this.reloadCurrentInstance();
      },
      error: (err) => {
        this.feedback.set(`Failed to reject section: ${err?.error?.error || 'Try again'}`);
        this.feedbackType.set('error');
        this.showRejectModal.set(false);
        this.sectionToReject.set(null);
        this.isProcessing.set(false);
      }
    });
  }

  onRejectCancel(): void {
    this.showRejectModal.set(false);
    this.sectionToReject.set(null);
  }

  private reloadCurrentInstance(): void {
    const current = this.instance();
    if (!current) return;

    this.service.getReviewInstance(current.linkToken).subscribe({
      next: (found) => {
        this.instance.set(found);
        this.buildSectionReview(found, this.allQuestions());
      }
    });
  }

  getSectionBadgeClass(status: ReviewState): string {
    if (status === 'approved') return 'section-status-approved';
    if (status === 'rejected') return 'section-status-rejected';
    return 'section-status-pending';
  }

  getSectionBadgeLabel(status: ReviewState): string {
    if (status === 'approved') return 'Approved';
    if (status === 'rejected') return 'Returned';
    return 'Pending';
  }

  formatValue(value: unknown, type: QuestionType): string {
    if (value === null || value === undefined) return 'N/A';

    switch (type) {
      case 'boolean':
        return value === true ? 'Yes' : 'No';
      case 'date':
        try {
          const date = new Date(String(value));
          return date.toLocaleDateString('en-GB');
        } catch {
          return String(value);
        }
      case 'multi-select':
        return this.toArray(value).join(', ');
      default:
        return String(value);
    }
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

  toArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }
}