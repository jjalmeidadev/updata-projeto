import express, { Request, Response, NextFunction } from "express"
import { Server } from "http"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../../../../src/business/services/user-service.js", () => ({
  checkUser: vi.fn(),
}))

const authMiddlewareMock = vi.fn()

vi.mock("../../../../src/presentation/api/middleware/auth-middleware.js", () => ({
  authMiddleware: (req: Request, res: Response, next: NextFunction) => authMiddlewareMock(req, res, next),
}))

import { checkUser } from "../../../../src/business/services/user-service.js"

function startServer(router: express.Router): Promise<Server> {
  const app = express()
  app.use(router)

  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server))
  })
}

function stopServer(server: Server): Promise<void> {
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
  server: Server,
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

describe("auth-complete-flow integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it("returns 401 from middleware when Authorization header is missing", async () => {
    authMiddlewareMock.mockImplementation((req: Request, res: Response, next: NextFunction) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      return next()
    })

    const { default: userRoutes } = await import("../../../../src/presentation/api/routes/user-routes.js")
    const server = await startServer(userRoutes)

    const response = await getJson(server, "/api/users")

    expect(response.status).toBe(401)
    expect(response.body).toEqual({ error: "Unauthorized" })
    expect(checkUser).not.toHaveBeenCalled()

    await stopServer(server)
  })

  it("returns 401 from middleware when token is invalid", async () => {
    authMiddlewareMock.mockImplementation((req: Request, res: Response, next: NextFunction) => {
      if (req.headers.authorization !== "Bearer valid-token") {
        return res.status(401).json({ error: "Unauthorized" })
      }

      req.auth = {
        payload: {
          sub: "auth0|invalid",
          name: "Invalid",
          email: "invalid@company.com",
        },
      }

      return next()
    })

    const { default: userRoutes } = await import("../../../../src/presentation/api/routes/user-routes.js")
    const server = await startServer(userRoutes)

    const response = await getJson(server, "/api/users", {
      Authorization: "Bearer REDACTED_FOR_PUBLIC_RELEASE",
    })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({ error: "Unauthorized" })
    expect(checkUser).not.toHaveBeenCalled()

    await stopServer(server)
  })

  it("returns 200 /monitoring for internal users when token is valid", async () => {
    authMiddlewareMock.mockImplementation((req: Request, _res: Response, next: NextFunction) => {
      req.auth = {
        payload: {
          sub: "auth0|internal",
          name: "Internal User",
          email: "internal@getequiem.com",
        },
      }

      next()
    })

    vi.mocked(checkUser).mockResolvedValue({
      user_id: "1",
      user_name: "Internal User",
      user_email: "internal@getequiem.com",
      auth0_id: "auth0|internal",
      company_id: null,
    })

    const { default: userRoutes } = await import("../../../../src/presentation/api/routes/user-routes.js")
    const server = await startServer(userRoutes)

    const response = await getJson(server, "/api/users", {
      Authorization: "Bearer valid-token",
      "x-debug-trace-id": "trace-internal",
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ next: "/monitoring", traceId: "trace-internal" })
    expect(checkUser).toHaveBeenCalledWith(
      {
        sub: "auth0|internal",
        name: "Internal User",
        email: "internal@getequiem.com",
      },
      "trace-internal"
    )

    await stopServer(server)
  })

  it("returns 200 /company/:id for external users linked to a company", async () => {
    authMiddlewareMock.mockImplementation((req: any, _res: any, next: any) => {
      req.auth = {
        payload: {
          sub: "auth0|company",
          email: "owner@client.com",
        },
      }

      next()
    })

    vi.mocked(checkUser).mockResolvedValue({
      user_id: "2",
      user_name: "Company User",
      user_email: "owner@client.com",
      auth0_id: "auth0|company",
      company_id: "77",
    })

    const { default: userRoutes } = await import("../../../../src/presentation/api/routes/user-routes.js")
    const server = await startServer(userRoutes)

    const response = await getJson(server, "/api/users", {
      Authorization: "Bearer valid-token",
      "x-debug-trace-id": "trace-company",
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ next: "/company/77", traceId: "trace-company" })
    expect(checkUser).toHaveBeenCalledWith(
      {
        sub: "auth0|company",
        name: undefined,
        email: "owner@client.com",
      },
      "trace-company"
    )

    await stopServer(server)
  })

  it("returns 401 when middleware allows request but payload has no sub", async () => {
    authMiddlewareMock.mockImplementation((req: any, _res: any, next: any) => {
      req.auth = {
        payload: {
          email: "nosub@company.com",
        },
      }

      next()
    })

    const { default: userRoutes } = await import("../../../../src/presentation/api/routes/user-routes.js")
    const server = await startServer(userRoutes)

    const response = await getJson(server, "/api/users", {
      Authorization: "Bearer valid-token",
      "x-debug-trace-id": "trace-no-sub",
    })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({ error: "Invalid token payload", traceId: "trace-no-sub" })
    expect(checkUser).not.toHaveBeenCalled()

    await stopServer(server)
  })

  it("returns 404 when user resolution returns null", async () => {
    authMiddlewareMock.mockImplementation((req: any, _res: any, next: any) => {
      req.auth = {
        payload: {
          sub: "auth0|404",
          email: "missing@company.com",
        },
      }

      next()
    })

    vi.mocked(checkUser).mockResolvedValue(null as never)

    const { default: userRoutes } = await import("../../../../src/presentation/api/routes/user-routes.js")
    const server = await startServer(userRoutes)

    const response = await getJson(server, "/api/users", {
      Authorization: "Bearer valid-token",
      "x-debug-trace-id": "trace-404",
    })

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: "User not found", traceId: "trace-404" })

    await stopServer(server)
  })

  it("returns 403 when user has no company and is not internal", async () => {
    authMiddlewareMock.mockImplementation((req: any, _res: any, next: any) => {
      req.auth = {
        payload: {
          sub: "auth0|no-company",
          email: "user@unknown.com",
        },
      }

      next()
    })

    vi.mocked(checkUser).mockResolvedValue({
      user_id: "3",
      user_name: "No Company",
      user_email: "user@unknown.com",
      auth0_id: "auth0|no-company",
      company_id: null,
    })

    const { default: userRoutes } = await import("../../../../src/presentation/api/routes/user-routes.js")
    const server = await startServer(userRoutes)

    const response = await getJson(server, "/api/users", {
      Authorization: "Bearer valid-token",
      "x-debug-trace-id": "trace-403",
    })

    expect(response.status).toBe(403)
    expect(response.body).toEqual({ error: "Company not registered", traceId: "trace-403" })

    await stopServer(server)
  })

  it("returns 500 when user service throws", async () => {
    authMiddlewareMock.mockImplementation((req: any, _res: any, next: any) => {
      req.auth = {
        payload: {
          sub: "auth0|500",
          email: "user@company.com",
        },
      }

      next()
    })

    vi.mocked(checkUser).mockRejectedValue(new Error("database unavailable"))

    const { default: userRoutes } = await import("../../../../src/presentation/api/routes/user-routes.js")
    const server = await startServer(userRoutes)

    const response = await getJson(server, "/api/users", {
      Authorization: "Bearer valid-token",
      "x-debug-trace-id": "trace-500",
    })

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: "Error processing user", traceId: "trace-500" })

    await stopServer(server)
  })
})
