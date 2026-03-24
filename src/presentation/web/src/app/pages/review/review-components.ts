import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type ReviewFieldType =
	| 'text'
	| 'integer'
	| 'decimal'
	| 'textarea'
	| 'dropdown'
	| 'multi-select'
	| 'boolean'
	| 'time'
	| 'date'
	| 'file';

interface ReviewIssueInput {
	id: string;
	label: string;
	value: unknown;
	type?: ReviewFieldType;
	options?: string[];
	error?: string;
}

interface ReviewIssue {
	id: string;
	label: string;
	value: string;
	type: ReviewFieldType;
	options: string[];
	error: string;
}

@Component({
	selector: 'app-review-components',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './review-components.html',
	styleUrl: './review-components.css',
})
export class ReviewComponentsComponent implements OnInit {
	private readonly router = inject(Router);

	readonly issues = signal<ReviewIssue[]>([]);
	readonly pageMessage = signal<string | null>(null);

	readonly invalidCount = computed(() => this.issues().filter((issue: ReviewIssue) => issue.error).length);
	readonly hasIssues = computed(() => this.issues().length > 0);

	ngOnInit(): void {
		const fromState = this.normalizeIssues(history.state?.['reviewIssues']);
		const fromStorage = this.loadFromStorage();
		const loaded = fromState.length ? fromState : fromStorage;

		this.issues.set(loaded);
	}

	inputType(type: ReviewFieldType): 'text' | 'number' | 'date' | 'time' {
		if (type === 'integer' || type === 'decimal') {
			return 'number';
		}

		if (type === 'date') {
			return 'date';
		}

		if (type === 'time') {
			return 'time';
		}

		return 'text';
	}

	onValueChange(issueId: string, value: string): void {
		this.issues.update((current: ReviewIssue[]) =>
			current.map((issue: ReviewIssue) => {
				if (issue.id !== issueId) {
					return issue;
				}

				return {
					...issue,
					value,
					error: this.validateValue(value, issue.type),
				};
			})
		);
	}

	saveCorrections(): void {
		const validated = this.issues().map((issue: ReviewIssue) => ({
			...issue,
			error: this.validateValue(issue.value, issue.type),
		}));

		this.issues.set(validated);

		if (validated.some((issue: ReviewIssue) => Boolean(issue.error))) {
			this.pageMessage.set('Some fields still have errors. Please fix them before saving.');
			return;
		}

		const correctedValues = validated.reduce((acc: Record<string, string>, issue: ReviewIssue) => {
			acc[issue.id] = issue.value;
			return acc;
		}, {});

		sessionStorage.setItem('reviewCorrections', JSON.stringify(correctedValues));
		sessionStorage.removeItem('reviewIssues');
		this.pageMessage.set(null);
		this.router.navigate(['/form'], {
			queryParams: { fromReview: true },
			state: { correctedValues },
		});
	}

	goBack(): void {
		this.router.navigate(['/form']);
	}

	private loadFromStorage(): ReviewIssue[] {
		try {
			const raw = sessionStorage.getItem('reviewIssues');
			if (!raw) {
				return [];
			}

			return this.normalizeIssues(JSON.parse(raw));
		} catch {
			return [];
		}
	}

	private normalizeIssues(rawIssues: unknown): ReviewIssue[] {
		if (!Array.isArray(rawIssues)) {
			return [];
		}

		return rawIssues
			.filter((item: unknown): item is ReviewIssueInput => {
				return typeof item === 'object' && item !== null && 'id' in item && 'label' in item;
			})
			.map((item: ReviewIssueInput) => {
				const type = item.type ?? 'text';
				const options = Array.isArray(item.options) ? item.options : [];
				const rawValue = item.value;
				const value = Array.isArray(rawValue)
					? rawValue.join(', ')
					: rawValue === null || rawValue === undefined
						? ''
						: String(rawValue);

				return {
					id: item.id,
					label: item.label,
					value,
					type,
					options,
					error: item.error ?? this.validateValue(value, type),
				};
			});
	}

	private validateValue(value: string, type: ReviewFieldType): string {
		const trimmed = value.trim();

		if (!trimmed) {
			return 'This field is required. Please provide a valid value.';
		}

		if (type === 'integer' && !/^-?\d+$/.test(trimmed)) {
			return 'Please enter a valid integer.';
		}

		if (type === 'decimal' && !/^-?\d+([.,]\d+)?$/.test(trimmed)) {
			return 'Please enter a valid decimal number.';
		}

		if (type === 'date' && Number.isNaN(Date.parse(trimmed))) {
			return 'Please enter a valid date.';
		}

		if (type === 'time' && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(trimmed)) {
			return 'Please enter a valid time in HH:MM format.';
		}

		if (type === 'boolean') {
			const normalized = trimmed.toLowerCase();
			const accepted = ['true', 'false', 'yes', 'no'];
			if (!accepted.includes(normalized)) {
				return 'Use Yes/No or True/False.';
			}
		}

		return '';
	}
}
