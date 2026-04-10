import { describe, expect, it, vi } from 'vitest';

describe('index-table', () => {
  it('creates pool with ssl disabled when DB_SSL is not true', async () => {
    vi.resetModules();

    process.env.DB_USER = 'u';
    process.env.DB_HOST = 'h';
    process.env.DB_DATABASE = 'd';
    process.env.DB_PASSWORD = 'p';
    process.env.DB_PORT = '5432';
    process.env.DB_SSL = 'false';

    const poolInstance = { on: vi.fn(), query: vi.fn() };
    const poolCtor = vi.fn(() => poolInstance);

    vi.doMock('dotenv', () => ({
      default: { config: vi.fn() },
    }));

    vi.doMock('pg', () => ({ Pool: poolCtor }));

    await import('../../../src/data/database/index-table.ts');

    expect(poolCtor).toHaveBeenCalledWith(
      expect.objectContaining({
        user: 'u',
        host: 'h',
        database: 'd',
        password: 'p',
        port: 5432,
        ssl: false,
      }),
    );
    expect(poolInstance.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('creates pool with ssl object when DB_SSL is true', async () => {
    vi.resetModules();

    process.env.DB_SSL = 'true';
    process.env.DB_PORT = '5433';

    const poolInstance = { on: vi.fn(), query: vi.fn() };
    const poolCtor = vi.fn(() => poolInstance);

    vi.doMock('dotenv', () => ({ default: { config: vi.fn() } }));
    vi.doMock('pg', () => ({ Pool: poolCtor }));

    await import('../../../src/data/database/index-table.ts');

    expect(poolCtor).toHaveBeenCalledWith(
      expect.objectContaining({
        port: 5433,
        ssl: { rejectUnauthorized: false },
      }),
    );
    expect(poolInstance.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('falls back safely when global process.env is undefined', async () => {
    vi.resetModules();

    const originalProcess = globalThis.process;
    Object.defineProperty(globalThis, 'process', {
      value: { env: undefined },
      configurable: true,
      writable: true,
    });

    const poolInstance = { on: vi.fn(), query: vi.fn() };
    const poolCtor = vi.fn(() => poolInstance);

    vi.doMock('dotenv', () => ({ default: { config: vi.fn() } }));
    vi.doMock('pg', () => ({ Pool: poolCtor }));

    try {
      await import('../../../src/data/database/index-table.ts');
    } finally {
      Object.defineProperty(globalThis, 'process', {
        value: originalProcess,
        configurable: true,
        writable: true,
      });
    }

    expect(poolCtor).toHaveBeenCalled();
    expect(poolInstance.on).toHaveBeenCalledWith('error', expect.any(Function));
  });
});
