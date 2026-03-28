import { describe, expect, it, vi } from 'vitest'
import { Request, Response } from 'express'

describe('mock-api server', () => {
  it('registers health and onboarding handlers and starts listening', async () => {
    vi.resetModules()

    type Handler = (req: Request | Record<string, unknown>, res: Response | Record<string, unknown>) => unknown
    const handlers: Record<string, Handler> = {}

    const app = {
      use: vi.fn(),
      get: vi.fn((path: string, handler: Handler) => {
        handlers[`GET ${path}`] = handler
      }),
      post: vi.fn((path: string, handler: Handler) => {
        handlers[`POST ${path}`] = handler
      }),
      listen: vi.fn((port: number, callback?: () => void) => {
        callback?.();
      }),
    };

    const expressMock: Record<string, unknown> = vi.fn(() => app) as any
    ;(expressMock as any).json = vi.fn(() => 'json-mw')

    vi.doMock('express', () => ({ default: expressMock }));

    await import('../../src/mock-api/server.ts');

    expect(app.get).toHaveBeenCalledWith('/health', expect.any(Function));
    expect(app.post).toHaveBeenCalledWith('/onboarding/intake', expect.any(Function));
    expect(app.listen).toHaveBeenCalledWith(4010, expect.any(Function));

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    handlers['GET /health']({}, res);
    expect(res.status).toHaveBeenCalledWith(200);

    res.status.mockClear();
    res.json.mockClear();

    handlers['POST /onboarding/intake']({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);

    res.status.mockClear();
    res.json.mockClear();

    handlers['POST /onboarding/intake'](
      {
        body: {
          source: 'template',
          traceId: 't1',
          fileName: 'a.csv',
          batchId: 'b1',
          records: [{ entityType: 'building', rowNumber: 1, externalId: 'ext-1', name: 'A', data: {} }],
        },
      },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'accepted',
        receivedRecords: 1,
        mappings: [
          expect.objectContaining({ entityType: 'building', externalId: 'ext-1', internalId: expect.any(String) }),
        ],
      }),
    );
  });
});
