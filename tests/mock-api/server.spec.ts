import { describe, expect, it, vi } from 'vitest'
import type { Request, Response } from 'express'

describe('mock-api server', () => {
  it('registers handlers and listens on default port', async () => {
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
        callback?.()
      }),
    }

    const expressMock: Record<string, unknown> = vi.fn(() => app) as any
    ;(expressMock as any).json = vi.fn(() => "json-mw")

    vi.doMock('express', () => ({
      default: expressMock,
    }))

    await import('../../src/mock-api/server.ts')

    expect(app.get).toHaveBeenCalledWith('/health', expect.any(Function))
    expect(app.post).toHaveBeenCalledWith('/onboarding/intake', expect.any(Function))
    expect(app.listen).toHaveBeenCalledWith(4010, expect.any(Function))
  })

  it('returns 400 for invalid intake payload', async () => {
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
      listen: vi.fn((_port: number, callback?: () => void) => callback?.()),
    }

    const expressMock: Record<string, unknown> = vi.fn(() => app) as any
    ;(expressMock as any).json = vi.fn(() => "json-mw")

    vi.doMock('express', () => ({
      default: expressMock,
    }))

    await import('../../src/mock-api/server.ts')

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }

    handlers['POST /onboarding/intake']({ body: {} }, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Invalid payload. Expected records array.",
      }),
    )
  })

  it('returns 201 and valid mapping for valid building record', async () => {
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
      listen: vi.fn((_port: number, callback?: () => void) => callback?.()),
    }

    const expressMock: Record<string, unknown> = vi.fn(() => app) as any
    ;(expressMock as any).json = vi.fn(() => "json-mw")

    vi.doMock('express', () => ({
      default: expressMock,
    }))

    await import('../../src/mock-api/server.ts')

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }

    handlers['POST /onboarding/intake'](
      {
        body: {
          source: 'upload',
          traceId: 't1',
          fileName: 'a.csv',
          batchId: 'b1',
          records: [
            {
              entityType: 'building',
              rowNumber: 1,
              externalId: 'ext-1',
              name: 'Tower A',
              data: {
                name: 'Tower A',
                displayOrder: 1,
                siteId: 'site-123',
              },
            },
          ],
        },
      },
      res,
    )

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'accepted',
        receivedRecords: 1,
        validRecords: 1,
        invalidRecords: 0,
        mappings: [
          expect.objectContaining({
            entityType: 'building',
            externalId: 'ext-1',
            valid: true,
            internalId: expect.any(String),
            errors: [],
          }),
        ],
      }),
    )
  })
})
