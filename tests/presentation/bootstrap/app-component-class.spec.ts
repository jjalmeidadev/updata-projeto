import { describe, expect, it, vi } from 'vitest';

describe('App class signal', () => {
  it('keeps default title value', async () => {
    vi.resetModules();
    vi.doMock('@angular/router', () => ({ RouterOutlet: class {} }));

    const { App } = await import('../../../src/presentation/web/src/app/app.ts');
    const app = new App();

    expect((app as any).title()).toBe('meu-app');
  });
});
