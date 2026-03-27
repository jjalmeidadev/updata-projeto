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

    vi.doMock('../../../src/presentation/web/src/app/pages/login/login.component', () => ({ LoginComponent: class {} }))
    vi.doMock('../../../src/presentation/web/src/app/pages/signup/signup.component', () => ({ SignupComponent: class {} }))
    vi.doMock('../../../src/presentation/web/src/app/pages/home/home.component', () => ({ HomeComponent: class {} }))
    vi.doMock('../../../src/presentation/web/src/app/onboarding-form/onboarding-form.component', () => ({ OnboardingFormComponent: class {} }))
    vi.doMock('../../../src/presentation/web/src/app/pages/upload/upload.component', () => ({ UploadComponent: class {} }))
    vi.doMock('../../../src/presentation/web/src/app/pages/module-selector/module-selector.component', () => ({ ModuleSelectorComponent: class {} }))
    vi.doMock('../../../src/presentation/web/src/app/pages/review/review-components', () => ({ ReviewComponentsComponent: class {} }))
    vi.doMock('../../../src/presentation/web/src/app/pages/input-method/input-method.component', () => ({ InputMethodComponent: class {} }))

    const { routes } = await import('../../../src/presentation/web/src/app/app.routes.ts')

    const paths = routes.map((r: RouteConfig) => r.path)
    expect(paths).toEqual([
      '',
      'login',
      'signup',
      'home',
      'form',
      'upload',
      'review',
      'module-selector',
      'input-method',
      '**',
    ]);

    expect(routes.find((r: RouteConfig) => r.path === '**')?.redirectTo).toBe('/login')
    expect(routes.find((r: RouteConfig) => r.path === 'home')?.canActivate).toEqual(['guard'])
  });
});
