import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';

import { DynamicFieldComponent } from '../../../src/presentation/web/src/app/components/dynamic-field/dynamic-field.component';

describe('DynamicFieldComponent', () => {
  it('returns explicit options when question.options exists', () => {
    const component = new DynamicFieldComponent();
    component.control = new FormControl('');
    component.question = {
      id: 'q1',
      moduleId: 'onboarding',
      sectionId: 'company-details',
      question: 'Industry',
      type: 'dropdown',
      options: ['Tech', 'Finance'],
      order: 1,
    };

    expect(component.resolvedOptions).toEqual(['Tech', 'Finance']);
  });

  it('falls back to source options when explicit options are missing', () => {
    const component = new DynamicFieldComponent();
    component.control = new FormControl('');
    component.question = {
      id: 'q2',
      moduleId: 'onboarding',
      sectionId: 'company-details',
      question: 'Industry',
      type: 'dropdown',
      source: 'industry',
      order: 2,
    };

    expect(component.resolvedOptions.length).toBeGreaterThan(0);
  });

  it('sets selected files on control in onFileChange', () => {
    const component = new DynamicFieldComponent();
    component.control = new FormControl([]);
    component.question = {
      id: 'q3',
      moduleId: 'onboarding',
      sectionId: 'building-setup',
      question: 'Attachment',
      type: 'file',
      order: 3,
    };

    const file = new File(['a'], 'doc.txt');
    const event = {
      target: {
        files: [file],
      },
    } as unknown as Event;

    component.onFileChange(event);

    expect(component.control.value).toEqual([file]);
  });

  it('returns empty options when source key is unknown or missing', () => {
    const component = new DynamicFieldComponent();
    component.control = new FormControl('');
    component.question = {
      id: 'q4',
      moduleId: 'onboarding',
      sectionId: 'company-details',
      question: 'Unknown Source',
      type: 'dropdown',
      source: 'unknown-source' as never,
      order: 4,
    };

    expect(component.resolvedOptions).toEqual([]);

    component.question = {
      id: 'q5',
      moduleId: 'onboarding',
      sectionId: 'company-details',
      question: 'No source',
      type: 'dropdown',
      order: 5,
    } as never;

    expect(component.resolvedOptions).toEqual([]);
  });

  it('sets empty array when file input has no files', () => {
    const component = new DynamicFieldComponent();
    component.control = new FormControl(['x']);
    component.question = {
      id: 'q6',
      moduleId: 'onboarding',
      sectionId: 'building-setup',
      question: 'Attachment',
      type: 'file',
      order: 6,
    };

    component.onFileChange({ target: { files: null } } as unknown as Event);

    expect(component.control.value).toEqual([]);
  });
});
