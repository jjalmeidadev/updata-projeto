import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { Subject, of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginComponent } from '../../../src/presentation/web/src/app/pages/login/login.component';

async function resolveAngularResources(): Promise<void> {
  const core = await import('@angular/core');
  const resolver = (core as Record<string, unknown>)['\u0275resolveComponentResources'] as
    | ((loader: (url: string) => Promise<string>) => Promise<void>)
    | undefined;

  if (typeof resolver === 'function') {
    await resolver(async () => '');
  }
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let authState$: Subject<boolean>;

  let authMock: {
    isAuthenticated$: Subject<boolean>;
    loginWithRedirect: ReturnType<typeof vi.fn>;
  };

  let httpMock: {
    get: ReturnType<typeof vi.fn>;
  };

  let routerMock: {
    navigateByUrl: ReturnType<typeof vi.fn>;
  };

  const setUrlSearch = (search: string) => {
    const target = search ? `/login${search}` : '/login';
    window.history.pushState({}, '', target);
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    authState$ = new Subject<boolean>();

    authMock = {
      isAuthenticated$: authState$,
      loginWithRedirect: vi.fn(),
    };

    httpMock = {
      get: vi.fn(),
    };

    routerMock = {
      navigateByUrl: vi.fn(),
    };

    await resolveAngularResources();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: HttpClient, useValue: httpMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('does not resolve user flow when URL is not an Auth0 callback', () => {
    // Arrange
    setUrlSearch('');

    // Act
    component.ngOnInit();
    authState$.next(true);

    // Assert
    expect(httpMock.get).not.toHaveBeenCalled();
    expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
  });

  it('resolves user flow on callback and navigates to API next route', () => {
    // Arrange
    setUrlSearch('?code=abc&state=xyz');
    httpMock.get.mockReturnValue(of({ next: '/company/7' }));

    // Act
    component.ngOnInit();
    authState$.next(true);

    // Assert
    expect(httpMock.get).toHaveBeenCalledWith('/api/users');
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/company/7');
  });

  it('navigates to /home when API returns empty next', () => {
    // Arrange
    setUrlSearch('?code=abc&state=xyz');
    httpMock.get.mockReturnValue(of({ next: '' }));

    // Act
    component.ngOnInit();
    authState$.next(true);

    // Assert
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/home');
  });

  it('navigates to /home when API responds with 403', () => {
    // Arrange
    setUrlSearch('?code=abc&state=xyz');
    httpMock.get.mockReturnValue(throwError(() => ({ status: 403 })));

    // Act
    component.ngOnInit();
    authState$.next(true);

    // Assert
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/home');
  });

  it('navigates to /signup when API responds with 404', () => {
    // Arrange
    setUrlSearch('?code=abc&state=xyz');
    httpMock.get.mockReturnValue(throwError(() => ({ status: 404 })));

    // Act
    component.ngOnInit();
    authState$.next(true);

    // Assert
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/signup');
  });

  it('navigates to /home on generic API error', () => {
    // Arrange
    setUrlSearch('?code=abc&state=xyz');
    httpMock.get.mockReturnValue(throwError(() => ({ status: 500 })));

    // Act
    component.ngOnInit();
    authState$.next(true);

    // Assert
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/home');
  });

  it('calls loginWithRedirect when login() is executed', () => {
    // Arrange
    // (no extra setup needed)

    // Act
    component.login();

    // Assert
    expect(authMock.loginWithRedirect).toHaveBeenCalled();
  });

  it('calls loginWithRedirect with Google connection on loginWithGoogle()', () => {
    // Arrange
    // (no extra setup needed)

    // Act
    component.loginWithGoogle();

    // Assert
    expect(authMock.loginWithRedirect).toHaveBeenCalledWith({
      authorizationParams: { connection: 'google-oauth2' },
    });
  });

  it('calls loginWithRedirect with signup parameters on signup()', () => {
    // Arrange
    // (no extra setup needed)

    // Act
    component.signup();

    // Assert
    expect(authMock.loginWithRedirect).toHaveBeenCalledWith({
      authorizationParams: {
        screen_hint: 'signup',
        prompt: 'login',
      },
    });
  });
});