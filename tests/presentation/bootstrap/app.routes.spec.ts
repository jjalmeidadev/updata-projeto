import { describe, expect, it, vi } from 'vitest'

interface RouteConfig {
  path?: string
  redirectTo?: string
  canActivate?: string[]
}

describe('app.routes', () => {
  it('declares expected route paths and wildcard redirect', async () => {
    vi.resetModules()

    vi.doMock('@auth0/auth0-angular', () => ({ authGuardFn: 'guard' }))
    vi.doMock('../../../src/presentation/web/src/app/guards/internal-user.guard', () => ({
      internalUserGuard: 'internalGuard',
    }))
    vi.doMock('../../../src/presentation/web/src/app/guards/instance-link-auth.guard', () => ({
      instanceLinkAuthGuard: 'instanceLinkGuard',
    }))

    vi.doMock('../../../src/presentation/web/src/app/pages/login/login.component', () => ({ LoginComponent: class {} }))
    vi.doMock('../../../src/presentation/web/src/app/pages/signup/signup.component', () => ({ SignupComponent: class {} }))
    vi.doMock('../../../src/presentation/web/src/app/pages/home/home.component', () => ({ HomeComponent: class {} }))
    vi.doMock('../../../src/presentation/web/src/app/onboarding-form/onboarding-form.component', () => ({ OnboardingFormComponent: class {} }))
    vi.doMock('../../../src/presentation/web/src/app/pages/upload/upload.component', () => ({ UploadComponent: class {} }))
    vi.doMock('../../../src/presentation/web/src/app/pages/module-selector/module-selector.component', () => ({ ModuleSelectorComponent: class {} }))
    vi.doMock('../../../src/presentation/web/src/app/pages/review/review-components', () => ({ ReviewComponentsComponent: class {} }))
    vi.doMock('../../../src/presentation/web/src/app/pages/input-method/input-method.component', () => ({ InputMethodComponent: class {} }))
    vi.doMock('../../../src/presentation/web/src/app/pages/onboarding-intro/onboarding-intro.component', () => ({ OnboardingIntroComponent: class {} }))

    const { routes } = await import('../../../src/presentation/web/src/app/app.routes.ts')

    const paths = routes.map((r: RouteConfig) => r.path)
    expect(paths).toEqual([
      '',
      'login',
      'onboarding-intro',
      'signup',
      'home',
      'monitoring',
      'company/:companyId',
      'module-selector/:linkToken',
      'form',
      'upload',
      'review',
      'module-selector',
      'input-method',
      'onboarding/:linkToken',
      'onboarding/:linkToken/input-method',
      'onboarding/:linkToken/form',
      'onboarding/:linkToken/upload',
      'onboarding/:linkToken/review',
      'equiem-review',
      'equiem-review/:linkToken',
      '**',
    ]);

    expect(routes.find((r: RouteConfig) => r.path === '**')?.redirectTo).toBe('/login')
    expect(routes.find((r: RouteConfig) => r.path === 'home')?.canActivate).toEqual(['guard', 'internalGuard'])
    expect(routes.find((r: RouteConfig) => r.path === 'module-selector/:linkToken')?.canActivate).toEqual(['guard', 'internalGuard'])
    expect(routes.find((r: RouteConfig) => r.path === 'onboarding/:linkToken')?.canActivate).toEqual(['instanceLinkGuard'])
    expect(routes.find((r: RouteConfig) => r.path === 'onboarding/:linkToken/form')?.canActivate).toEqual(['instanceLinkGuard'])
  }, 15000);
});
