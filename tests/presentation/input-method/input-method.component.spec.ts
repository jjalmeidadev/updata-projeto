import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InputMethodComponent } from '../../../src/presentation/web/src/app/pages/input-method/input-method.component';

async function resolveAngularResources(): Promise<void> {
  const core = await import('@angular/core');
  const resolver = (core as Record<string, unknown>)['\u0275resolveComponentResources'] as
    | ((loader: (url: string) => Promise<string>) => Promise<void>)
    | undefined;

  if (typeof resolver === 'function') {
    await resolver(async () => '');
  }
}

describe('InputMethodComponent', () => {
  let component: InputMethodComponent;

  const routerMock = {
    navigate: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();

    await resolveAngularResources();

    await TestBed.configureTestingModule({
      imports: [InputMethodComponent],
      providers: [{ provide: Router, useValue: routerMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(InputMethodComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('stores upload method and navigates to upload page', () => {
    component.choose('upload');

    expect(localStorage.getItem('onboardingInputMethod')).toBe('upload');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/upload']);
  });

  it('stores manual method and navigates to form page', () => {
    component.choose('manual');

    expect(localStorage.getItem('onboardingInputMethod')).toBe('manual');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/form']);
  });
});
