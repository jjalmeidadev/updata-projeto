import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OnboardingInstanceService } from '../../services/onboarding-instance.service';
import { OnboardingInstance } from '../../models/onboarding-instance.model';

@Component({
  standalone: true,
  selector: 'app-equiem-review',
  imports: [CommonModule],
  templateUrl: './equiem-review.component.html',
  styleUrls: ['./equiem-review.component.css']
})
export class EquiemReviewComponent implements OnInit {

  private service = inject(OnboardingInstanceService);
  private router = inject(Router);

  instances = signal<OnboardingInstance[]>([]);
  loading = signal(true);
  feedback = signal('');

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);

    this.service.listInstances().subscribe({
      next: data => {
        this.instances.set(
          data.filter(i => i.status === 'equiem_review')
        );
        this.loading.set(false);
      }
    });
  }

open(instance: OnboardingInstance) {
  this.router.navigate(['/equiem-review', instance.linkToken]);
}

  approve(instance: OnboardingInstance) {
    this.service.approveInstance(instance.linkToken)
      .subscribe(() => {
        this.feedback.set(`Approved ${instance.companyName}`);
        this.load();
      });
  }

  reject(instance: OnboardingInstance) {

    const reason = prompt('Reason for rejection:');

    if (!reason) return;

    this.service.rejectInstance(instance.linkToken, reason)
      .subscribe(() => {
        this.feedback.set(`Rejected ${instance.companyName}`);
        this.load();
      });
  }
}