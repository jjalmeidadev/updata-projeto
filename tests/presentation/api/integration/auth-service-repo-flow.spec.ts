import express from "express"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mockPool = {
  query: vi.fn(),
}

vi.mock("../../../../src/data/database/index-table.js", () => ({
  default: mockPool,
}))

const authMiddlewareMock = vi.fn()

vi.mock("../../../../src/presentation/api/middleware/auth-middleware.js", () => ({
  authMiddleware: (req: any, res: any, next: any) => authMiddlewareMock(req, res, next),
}))

function startServer(router: express.Router): Promise<any> {
  const app = express()
  app.use(router)

  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server))
  })
}

function stopServer(server: any): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error: unknown) => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })
}

async function getJson(
  server: any,
  path: string,
  headers: Record<string, string> = {}
): Promise<{ status: number; body: unknown }> {
  const address = server.address()

  if (!address || typeof address === "string") {
    throw new Error("Could not resolve server address")
  }

  const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
    method: "GET",
    headers,
  })

  const body = await response.json()

  return {
    status: response.status,
    body,
  }
}

describe("auth-service-repo-flow integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockPool.query.mockReset()
  })

  it("reconciles first-login user and links them to company through existing email", async () => {
    authMiddlewareMock.mockImplementation((req: any, _res: any, next: any) => {
      req.auth = {
        payload: {
          sub: "auth0|new",
          name: "Jane Doe",
          email: "jane@acme.com",
        },
      }

      next()
    })

    mockPool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ company_id: "c-77" }] })
      .mockResolvedValueOnce({
        rows: [
          {
            user_id: "u-77",
            user_name: "Jane Doe",
            user_email: "jane@acme.com",
            auth0_id: "auth0|new",
            company_id: "c-77",
          },
        ],
      })

    const { default: userRoutes } = await import("../../../../src/presentation/api/routes/user-routes.js")
    const server = await startServer(userRoutes)

    const response = await getJson(server, "/api/users", {
      Authorization: "Bearer valid-token",
      "x-debug-trace-id": "trace-service-repo-create",
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ next: "/company/c-77", traceId: "trace-service-repo-create" })

    expect(mockPool.query).toHaveBeenCalledTimes(3)
    expect(mockPool.query.mock.calls[0][0]).toContain("WHERE auth0_id = $1")
    expect(mockPool.query.mock.calls[0][1]).toEqual(["auth0|new"])
    expect(mockPool.query.mock.calls[1][0]).toContain("unnest(approved_domains)")
    expect(mockPool.query.mock.calls[1][1]).toEqual(["acme.com"])
    expect(mockPool.query.mock.calls[2][0]).toContain("WHERE LOWER(email) = LOWER($1)")
    expect(mockPool.query.mock.calls[2][1]).toEqual(["jane@acme.com"])

    await stopServer(server)
  })

  it("short-circuits when existing user is found", async () => {
    authMiddlewareMock.mockImplementation((req: any, _res: any, next: any) => {
      req.auth = {
        payload: {
          sub: "auth0|existing",
          email: "existing@client.com",
        },
      }

      next()
    })

    mockPool.query.mockResolvedValueOnce({
      rows: [
        {
          user_id: "u-existing",
          user_name: "Existing User",
          user_email: "existing@client.com",
          auth0_id: "auth0|existing",
          company_id: "c-12",
        },
      ],
    })

    const { default: userRoutes } = await import("../../../../src/presentation/api/routes/user-routes.js")
    const server = await startServer(userRoutes)

    const response = await getJson(server, "/api/users", {
      Authorization: "Bearer valid-token",
      "x-debug-trace-id": "trace-service-repo-existing",
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ next: "/company/c-12", traceId: "trace-service-repo-existing" })
    expect(mockPool.query).toHaveBeenCalledTimes(1)

    await stopServer(server)
  })

  it("returns 403 when user is created without company mapping", async () => {
    authMiddlewareMock.mockImplementation((req: any, _res: any, next: any) => {
      req.auth = {
        payload: {
          sub: "auth0|no-company",
          name: "No Company",
          email: "user@unknown.org",
        },
      }

      next()
    })

    mockPool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            user_id: "u-no-company",
            user_name: "No Company",
            user_email: "user@unknown.org",
            auth0_id: "auth0|no-company",
            company_id: null,
          },
        ],
      })

    const { default: userRoutes } = await import("../../../../src/presentation/api/routes/user-routes.js")
    const server = await startServer(userRoutes)

    const response = await getJson(server, "/api/users", {
      Authorization: "Bearer valid-token",
      "x-debug-trace-id": "trace-service-repo-403",
    })

    expect(response.status).toBe(403)
    expect(response.body).toEqual({ error: "Company not registered", traceId: "trace-service-repo-403" })

    await stopServer(server)
  })

  it("returns 500 when repository query fails", async () => {
    authMiddlewareMock.mockImplementation((req: any, _res: any, next: any) => {
      req.auth = {
        payload: {
          sub: "auth0|error",
          email: "error@company.com",
        },
      }

      next()
    })

    mockPool.query.mockRejectedValueOnce(new Error("db down"))

    const { default: userRoutes } = await import("../../../../src/presentation/api/routes/user-routes.js")
    const server = await startServer(userRoutes)

    const response = await getJson(server, "/api/users", {
      Authorization: "Bearer valid-token",
      "x-debug-trace-id": "trace-service-repo-500",
    })

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: "Error processing user", traceId: "trace-service-repo-500" })

    await stopServer(server)
  })
})
