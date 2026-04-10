import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reject-reason-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reject-reason-modal.component.html',
  styleUrls: ['./reject-reason-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RejectReasonModalComponent {
  @Input() isOpen = false;
  @Input() companyName = '';
  @Input() isLoading = false;
  
  @Output() onConfirm = new EventEmitter<string>();
  @Output() onCancel = new EventEmitter<void>();

  reason = '';
  errorMessage = '';

  confirm(): void {
    const trimmedReason = this.reason.trim();
    
    if (!trimmedReason) {
      this.errorMessage = 'Please provide a rejection reason.';
      return;
    }

    if (trimmedReason.length < 10) {
      this.errorMessage = 'The reason must be at least 10 characters.';
      return;
    }

    if (trimmedReason.length > 500) {
      this.errorMessage = 'The reason cannot exceed 500 characters.';
      return;
    }

    this.errorMessage = '';
    this.onConfirm.emit(trimmedReason);
    this.resetForm();
  }

  cancel(): void {
    this.onCancel.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.reason = '';
    this.errorMessage = '';
  }

  get charCount(): number {
    return this.reason.length;
  }

  get charRemaining(): number {
    return Math.max(0, 500 - this.reason.length);
  }
}
