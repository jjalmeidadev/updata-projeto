import { describe, expect, it } from 'vitest';

describe('web vitest config module', () => {
  it('exports a config object with resolve aliases', async () => {
    const module = await import('../../../src/presentation/web/vitest.config.ts');
    const config = module.default as any;

    expect(config).toBeTruthy();
    expect(config.resolve).toBeTruthy();
    expect(Array.isArray(config.resolve.alias)).toBe(true);
    expect(config.resolve.alias.length).toBeGreaterThan(0);
  });
});
