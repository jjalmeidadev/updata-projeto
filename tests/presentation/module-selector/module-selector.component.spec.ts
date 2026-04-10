import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ModuleSelectorComponent } from '../../../src/presentation/web/src/app/pages/module-selector/module-selector.component';
import { OnboardingInstanceService } from '../../../src/presentation/web/src/app/services/onboarding-instance.service';
import { QuestionService } from '../../../src/presentation/web/src/app/services/question.service';

async function resolveAngularResources(): Promise<void> {
  const core = await import('@angular/core');
  const resolver = (core as Record<string, unknown>)['\u0275resolveComponentResources'] as
    | ((loader: (url: string) => Promise<string>) => Promise<void>)
    | undefined;

  if (typeof resolver === 'function') {
    await resolver(async () => '');
  }
}

describe('ModuleSelectorComponent', () => {
  let component: ModuleSelectorComponent;

  const routerMock = {
    navigate: vi.fn(),
  };

  const activatedRouteMock = {
    snapshot: {
      paramMap: {
        get: vi.fn().mockReturnValue(null),
      },
    },
  };

  const questionServiceMock = {
    getQuestions: vi.fn(),
    getSections: vi.fn(),
  };

  const onboardingServiceMock = {
    listCompanies: vi.fn(),
    listInstances: vi.fn(),
    createInstance: vi.fn(),
  };

  const mockQuestions = [
    { id: 'q1', sectionId: 'building-setup', order: 1 },
    { id: 'q2', sectionId: 'company-details', order: 2 },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();

    activatedRouteMock.snapshot.paramMap.get.mockReturnValue(null);

    questionServiceMock.getQuestions.mockReturnValue(of(mockQuestions));
    questionServiceMock.getSections.mockReturnValue(['building-setup', 'company-details']);
    onboardingServiceMock.listCompanies.mockReturnValue(of([]));
    onboardingServiceMock.listInstances.mockReturnValue(of([]));

    await resolveAngularResources();

    await TestBed.configureTestingModule({
      imports: [ModuleSelectorComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: QuestionService, useValue: questionServiceMock },
        { provide: OnboardingInstanceService, useValue: onboardingServiceMock },
        { provide: AuthService, useValue: { user$: of({ email: 'user@test.com', name: 'Test User' }), logout: vi.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ModuleSelectorComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('selects all sections by default when no saved selection exists', () => {
    component.ngOnInit();

    expect(component.sections()).toEqual(['building-setup', 'company-details']);
    expect(Array.from(component.selectedSections())).toEqual(['building-setup', 'company-details']);
    expect(component.loading()).toBe(false);
  });

  it('restores valid saved selected sections from localStorage', () => {
    localStorage.setItem('selectedSections', JSON.stringify(['company-details', 'invalid']));

    component.ngOnInit();

    expect(Array.from(component.selectedSections())).toEqual(['company-details']);
  });

  it('toggles selected section membership', () => {
    component.ngOnInit();

    component.toggleSection('building-setup');
    expect(component.isSelected('building-setup')).toBe(false);

    component.toggleSection('building-setup');
    expect(component.isSelected('building-setup')).toBe(true);
  });

  it('persists selection and navigates on continueLegacyFlow()', () => {
    component.ngOnInit();
    component.clearAll();
    component.toggleSection('company-details');

    component.continueLegacyFlow();

    expect(localStorage.getItem('selectedSections')).toBe(JSON.stringify(['company-details']));
    expect(routerMock.navigate).toHaveBeenCalledWith(['/input-method']);
  });

  it('does not navigate on continueLegacyFlow() when nothing is selected', () => {
    component.ngOnInit();
    component.clearAll();

    component.continueLegacyFlow();

    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('navigates to /monitoring on goBackToMonitoring()', () => {
    component.goBackToMonitoring();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/monitoring']);
  });

  it('loads existing onboarding data when editing', () => {
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue('token-1');
    onboardingServiceMock.listInstances.mockReturnValueOnce(of([
      {
        linkToken: 'token-1',
        companyName: 'Acme',
        allowedEmails: ['admin@acme.com'],
        selectedSections: ['company-details'],
      },
    ]));

    component.ngOnInit();

    expect(component.editLinkToken()).toBe('token-1');
    expect(component.companyName()).toBe('Acme');
    expect(component.allowedEmailsText()).toBe('admin@acme.com');
    expect(Array.from(component.selectedSections())).toEqual(['company-details']);
    expect(component.loading()).toBe(false);
  });

  it('sets loading=false when getQuestions fails', () => {
    questionServiceMock.getQuestions.mockReturnValue(throwError(() => new Error('load failed')));

    component.ngOnInit();

    expect(component.loading()).toBe(false);
  });

  it('handles malformed/non-array saved selection and selectAll()', () => {
    localStorage.setItem('selectedSections', '{bad-json');

    component.ngOnInit();
    expect(Array.from(component.selectedSections())).toEqual(['building-setup', 'company-details']);

    component.clearAll();
    expect(component.canContinueLegacy()).toBe(false);
    component.selectAll();
    expect(component.canContinueLegacy()).toBe(true);

    localStorage.setItem('selectedSections', JSON.stringify({ foo: 'bar' }));
    component.ngOnInit();
    expect(Array.from(component.selectedSections())).toEqual(['building-setup', 'company-details']);
  });
});
