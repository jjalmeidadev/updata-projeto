import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HomeComponent } from '../../../src/presentation/web/src/app/pages/home/home.component';
import { OnboardingInstanceService } from '../../../src/presentation/web/src/app/services/onboarding-instance.service';

describe('HomeComponent', () => {
  let component: HomeComponent;

  const routerMock = {
    navigate: vi.fn(),
  };

  const authMock = {
    user$: of({ name: 'Jane Doe', email: 'jane@example.com' }),
    logout: vi.fn(),
  };

  const onboardingServiceMock = {
    listInstances: vi.fn().mockReturnValue(of([])),
    completeEquiemReview: vi.fn().mockReturnValue(of({})),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authMock },
        { provide: OnboardingInstanceService, useValue: onboardingServiceMock },
      ],
    });

    const host = document.createElement('div');
    component = TestBed.runInInjectionContext(
      () => new HomeComponent({ nativeElement: host } as never),
    );
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('maps user initials from full name', async () => {
    const initials = await firstValueFrom(component.userInitials$);

    expect(initials).toBe('JD');
  });

  it('maps initials from email chunks and fallbacks', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: { user$: of({ email: 'john.doe@example.com' }), logout: vi.fn() } },
      ],
    });

    const host = document.createElement('div');
    const emailChunkComponent = TestBed.runInInjectionContext(
      () => new HomeComponent({ nativeElement: host } as never),
    );
    expect(await firstValueFrom(emailChunkComponent.userInitials$)).toBe('JD');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: { user$: of({ email: 'q@example.com' }), logout: vi.fn() } },
      ],
    });

    const singleHost = document.createElement('div');
    const shortEmailComponent = TestBed.runInInjectionContext(
      () => new HomeComponent({ nativeElement: singleHost } as never),
    );
    expect(await firstValueFrom(shortEmailComponent.userInitials$)).toBe('Q');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: { user$: of({}), logout: vi.fn() } },
      ],
    });

    const emptyHost = document.createElement('div');
    const emptyUserComponent = TestBed.runInInjectionContext(
      () => new HomeComponent({ nativeElement: emptyHost } as never),
    );
    expect(await firstValueFrom(emptyUserComponent.userInitials$)).toBe('U');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: { user$: of({ email: '.doe@example.com' }), logout: vi.fn() } },
      ],
    });

    const leadingDotHost = document.createElement('div');
    const leadingDotComponent = TestBed.runInInjectionContext(
      () => new HomeComponent({ nativeElement: leadingDotHost } as never),
    );
    expect(await firstValueFrom(leadingDotComponent.userInitials$)).toBe('.D');
  });

  it('navigates to module selector on createOnboarding()', () => {
    component.createOnboarding();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/module-selector']);
  });

  it('toggles profile menu and logs out with login return URL', () => {
    const event = { stopPropagation: vi.fn() } as unknown as MouseEvent;

    component.toggleProfileMenu(event);
    expect(component.profileMenuOpen).toBe(true);

    component.logout();

    expect(component.profileMenuOpen).toBe(false);
    expect(authMock.logout).toHaveBeenCalledWith({
      logoutParams: {
        returnTo: window.location.origin + '/login',
      },
    });
  });

  it('closes profile menu on outside document click', () => {
    component.profileMenuOpen = true;

    const outsideNode = document.createElement('div');
    component.onDocumentClick({ target: outsideNode } as unknown as MouseEvent);

    expect(component.profileMenuOpen).toBe(false);
  });

  it('keeps profile menu open when click is inside component', () => {
    const insideHost = document.createElement('div');
    const insideNode = document.createElement('span');
    insideHost.appendChild(insideNode);

    component = TestBed.runInInjectionContext(
      () => new HomeComponent({ nativeElement: insideHost } as never),
    );
    component.profileMenuOpen = true;

    component.onDocumentClick({ target: insideNode } as unknown as MouseEvent);

    expect(component.profileMenuOpen).toBe(true);
  });

  it('navigates to onboarding token in viewDetails() only for completed instances', () => {
    component.viewDetails({ status: 'in_progress', linkToken: 'abc' } as any);
    expect(routerMock.navigate).not.toHaveBeenCalled();

    component.viewDetails({ status: 'completed', linkToken: 'abc' } as any);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/onboarding', 'abc']);
  });

  it('covers optional-chain fallback when initials segment is empty', async () => {
    const originalSplit = String.prototype.split;
    const originalFilter = Array.prototype.filter;

    const splitSpy = vi
      .spyOn(String.prototype, 'split')
      .mockImplementation(function (
        this: string,
        separator: string | RegExp,
        limit?: number,
      ): string[] {
        if (this === 'Alice' && String(separator) === '/\\s+/' && limit === undefined) {
          return [''];
        }

        return originalSplit.call(this, separator as any, limit as any);
      });

    const filterSpy = vi
      .spyOn(Array.prototype, 'filter')
      .mockImplementation(function (
        this: unknown[],
        predicate: (value: unknown, index: number, array: unknown[]) => unknown,
        thisArg?: unknown,
      ): unknown[] {
        if (predicate === Boolean) {
          return this;
        }

        return originalFilter.call(this, predicate as any, thisArg as any);
      });

    try {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: Router, useValue: routerMock },
          { provide: AuthService, useValue: { user$: of({ name: 'Alice' }), logout: vi.fn() } },
        ],
      });

      const host = document.createElement('div');
      const localComponent = TestBed.runInInjectionContext(
        () => new HomeComponent({ nativeElement: host } as never),
      );

      expect(await firstValueFrom(localComponent.userInitials$)).toBe('');
    } finally {
      splitSpy.mockRestore();
      filterSpy.mockRestore();
    }
  });
});
