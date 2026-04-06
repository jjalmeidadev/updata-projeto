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
    user$: ReturnType<typeof of>;
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
      user$: of({ name: 'Auth Profile Name' }),
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

  it('does not resolve user flow when user is not authenticated', () => {
    // Arrange
    setUrlSearch('');
    httpMock.get.mockReturnValue(of({ next: '/company/7' }));

    // Act
    component.ngOnInit();
    authState$.next(false);

    // Assert
    expect(httpMock.get).not.toHaveBeenCalled();
    expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
  });

  it('resolves user flow when already authenticated even without callback params', () => {
    // Arrange
    setUrlSearch('');
    httpMock.get.mockReturnValue(of({ next: '/company/9' }));

    // Act
    component.ngOnInit();
    authState$.next(true);

    // Assert
    expect(httpMock.get).toHaveBeenCalledWith('/api/users', expect.objectContaining({
      headers: expect.anything(),
    }));
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/company/9');
  });

  it('returns to stored onboarding link target after authentication', () => {
    // Arrange
    setUrlSearch('');
    sessionStorage.setItem('post_login_link_target', '/onboarding/token-abc/form');

    // Act
    component.ngOnInit();
    authState$.next(true);

    // Assert
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/onboarding/token-abc/form');
    expect(httpMock.get).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('post_login_link_target')).toBeNull();
  });

  it('resolves user flow on callback and navigates to API next route', () => {
    // Arrange
    setUrlSearch('?code=abc&state=xyz');
    httpMock.get.mockReturnValue(of({ next: '/company/7' }));

    // Act
    component.ngOnInit();
    authState$.next(true);

    // Assert
    expect(httpMock.get).toHaveBeenCalledWith('/api/users', expect.objectContaining({
      headers: expect.anything(),
    }));
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/company/7');
  });

  it('navigates to /login when API responds with 401', () => {
    // Arrange
    setUrlSearch('?code=abc&state=xyz');
    httpMock.get.mockReturnValue(throwError(() => ({ status: 401 })));

    // Act
    component.ngOnInit();
    authState$.next(true);

    // Assert
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');
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

  it('navigates to /onboarding-intro when API responds with 403', () => {
    // Arrange
    setUrlSearch('?code=abc&state=xyz');
    httpMock.get.mockReturnValue(throwError(() => ({ status: 403 })));

    // Act
    component.ngOnInit();
    authState$.next(true);

    // Assert
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/onboarding-intro');
  });

  it('navigates to /monitoring when API responds with 403 for internal test email profile', async () => {
    // Arrange
    setUrlSearch('?code=abc&state=xyz');
    httpMock.get.mockReturnValue(throwError(() => ({ status: 403 })));

    authMock.user$ = of({
      name: 'Yudi Test',
      email: 'yudi@equiem.com',
    });

    TestBed.resetTestingModule();
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

    // Act
    component.ngOnInit();
    authState$.next(true);

    // Assert
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/monitoring');
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
    expect(authMock.loginWithRedirect).toHaveBeenCalledWith({
      authorizationParams: {
        audience: 'https://api.updata.com',
        scope: 'openid profile email',
      },
    });
  });

  it('calls loginWithRedirect with Google connection on loginWithGoogle()', () => {
    // Arrange
    // (no extra setup needed)

    // Act
    component.loginWithGoogle();

    // Assert
    expect(authMock.loginWithRedirect).toHaveBeenCalledWith({
      authorizationParams: {
        audience: 'https://api.updata.com',
        scope: 'openid profile email',
        connection: 'google-oauth2',
      },
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
        audience: 'https://api.updata.com',
        scope: 'openid profile email',
        screen_hint: 'signup',
        prompt: 'login',
      },
    });
  });
});