import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockPool } = vi.hoisted(() => ({
  mockPool: {
    query: vi.fn(),
  },
}));

vi.mock('../../../../src/presentation/api/database/index-table.js', () => ({
  default: mockPool,
}));

import {
  createUser,
  findCompanyByDomain,
  findUser,
} from '../../../../src/presentation/api/routes/user-repository.ts';

describe('presentation api routes user-repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPool.query.mockReset();
  });

  it('findUser returns null when no rows', async () => {
    mockPool.query.mockResolvedValue({ rows: [] });

    const result = await findUser('auth0|x', 'trace-r1');

    expect(result).toBeNull();
  });

  it('findUser returns first row when found', async () => {
    const row = {
      user_id: 11,
      user_name: 'Row User',
      user_email: 'row@acme.com',
      auth0_id: 'auth0|row',
      company_id: 9,
    };
    mockPool.query.mockResolvedValue({ rows: [row] });

    const result = await findUser('auth0|row', 'trace-r1b');

    expect(result).toEqual(row);
  });

  it('findCompanyByDomain returns company id when found', async () => {
    mockPool.query.mockResolvedValue({ rows: [{ company_id: 3 }] });

    const result = await findCompanyByDomain('acme.com', 'trace-r2');

    expect(result).toBe(3);
  });

  it('findCompanyByDomain returns null when no rows', async () => {
    mockPool.query.mockResolvedValue({ rows: [] });

    const result = await findCompanyByDomain('none.test', 'trace-r2b');

    expect(result).toBeNull();
  });

  it('findCompanyByDomain handles empty domain input', async () => {
    mockPool.query.mockResolvedValue({ rows: [] });

    const result = await findCompanyByDomain('', 'trace-r2c');

    expect(result).toBeNull();
    expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), ['']);
  });

  it('createUser inserts and returns created row', async () => {
    const row = {
      user_id: 1,
      user_name: 'Jane',
      user_email: 'jane@acme.com',
      auth0_id: 'auth0|1',
      company_id: null,
    };

    mockPool.query.mockResolvedValue({ rows: [row] });

    const result = await createUser(
      {
        auth0_id: 'auth0|1',
        name: 'Jane',
        email: 'jane@acme.com',
      },
      'trace-r3',
    );

    expect(result).toEqual(row);
  });

  it('createUser sends null company id when not provided', async () => {
    const row = {
      user_id: 2,
      user_name: 'John',
      user_email: 'john@acme.com',
      auth0_id: 'auth0|2',
      company_id: null,
    };

    mockPool.query.mockResolvedValue({ rows: [row] });

    await createUser(
      {
        auth0_id: 'auth0|2',
        name: 'John',
        email: 'john@acme.com',
      },
      'trace-r4',
    );

    expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [
      'John',
      'john@acme.com',
      'auth0|2',
      null,
    ]);
  });

  it('createUser still returns first row when user_id is missing', async () => {
    const row = {
      user_name: 'NoId',
      user_email: 'noid@acme.com',
      auth0_id: 'auth0|3',
      company_id: null,
    };

    mockPool.query.mockResolvedValue({ rows: [row] });

    const result = await createUser(
      {
        auth0_id: 'auth0|3',
        name: 'NoId',
        email: 'noid@acme.com',
      },
      'trace-r5',
    );

    expect(result).toEqual(row);
  });
});
