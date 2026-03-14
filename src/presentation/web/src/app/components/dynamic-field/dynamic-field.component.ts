import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Question } from '../../models/question.model';
import { SOURCE_OPTIONS } from '../../services/question.service';

@Component({
  selector: 'app-dynamic-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './dynamic-field.component.html',
  styleUrl: './dynamic-field.component.css',
})
export class DynamicFieldComponent {
  @Input() question!: Question;
  @Input() control!: FormControl;

  get resolvedOptions(): string[] {
    if (this.question.options?.length) return this.question.options;
    if (this.question.source) return SOURCE_OPTIONS[this.question.source] ?? [];
    return [];
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.control.setValue(input.files ? Array.from(input.files) : []);
  }
}