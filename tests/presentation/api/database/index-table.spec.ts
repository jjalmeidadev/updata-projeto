import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../../src/data/database/index-table.js', () => ({
  default: { query: vi.fn() },
}));

describe('presentation api database index-table shim', () => {
  it('re-exports default pool from data layer', async () => {
    const module = await import('../../../../src/presentation/api/database/index-table.ts');

    expect(module.default).toBeTruthy();
    expect(typeof module.default).toBe('object');
  });
});
