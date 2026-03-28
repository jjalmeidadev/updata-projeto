import { describe, expect, it, vi } from 'vitest'
import express, { Express } from 'express'

describe('server bootstrap', () => {
  it('registers json middleware, mounts routes and starts listening on port 3000', async () => {
    vi.resetModules()

    const app = {
      use: vi.fn(),
      listen: vi.fn((port: number, callback?: () => void) => {
        callback?.()
      }),
    }

    const jsonMiddleware = { name: 'json-middleware' }
    const expressMock: typeof express = vi.fn(() => app) as any
    ;(expressMock as any).json = vi.fn(() => jsonMiddleware)

    const userRoutes = { name: 'user-routes' };
    const uploadRoutes = { name: 'upload-routes' };
    const onboardingInstanceRoutes = { name: 'onboarding-instance-routes' };

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    vi.doMock('express', () => ({ default: expressMock }));
    vi.doMock('../../../src/presentation/api/routes/user-routes.ts', () => ({ default: userRoutes }));
    vi.doMock('../../../src/presentation/api/routes/upload-routes.ts', () => ({ default: uploadRoutes }));
    vi.doMock('../../../src/presentation/api/routes/onboarding-instance-routes.ts', () => ({ default: onboardingInstanceRoutes }));

    await import('../../../src/server.ts');

    expect(expressMock.json).toHaveBeenCalled();
    expect(app.use).toHaveBeenCalledWith(jsonMiddleware);
    expect(app.use).toHaveBeenCalledWith(userRoutes);
    expect(app.use).toHaveBeenCalledWith(uploadRoutes);
    expect(app.use).toHaveBeenCalledWith(onboardingInstanceRoutes);
    expect(app.listen).toHaveBeenCalledWith(3000, expect.any(Function));
    expect(logSpy).toHaveBeenCalledWith('Server running on port 3000');
  });
});
