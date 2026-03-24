import express from "express"
import { beforeEach, describe, expect, it, vi } from "vitest"

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

describe("auth-flow integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it("returns 401 and does not execute controller when Authorization header is missing", async () => {
    // Arrange
    const getPayloadMock = vi.fn((_req: any, res: any) => res.status(200).json({ next: "/company/1" }))
    const authMiddlewareMock = vi.fn((req: any, res: any, next: any) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      return next()
    })

    vi.doMock("../../../../src/presentation/api/middleware/auth-middleware.js", () => ({
      authMiddleware: authMiddlewareMock,
    }))

    vi.doMock("../../../../src/presentation/api/controllers/user-controllers.js", () => ({
      getPayload: getPayloadMock,
    }))

    const { default: userRoutes } = await import("../../../../src/presentation/api/routes/user-routes.js")
    const server = await startServer(userRoutes)

    // Act
    const response = await getJson(server, "/api/users")

    // Assert
    expect(response.status).toBe(401)
    expect(response.body).toEqual({ error: "Unauthorized" })
    expect(authMiddlewareMock).toHaveBeenCalledTimes(1)
    expect(getPayloadMock).not.toHaveBeenCalled()

    await stopServer(server)
  })

  it("returns 401 and does not execute controller when token is invalid", async () => {
    // Arrange
    const getPayloadMock = vi.fn((_req: any, res: any) => res.status(200).json({ next: "/company/1" }))
    const authMiddlewareMock = vi.fn((req: any, res: any, next: any) => {
      if (req.headers.authorization !== "Bearer valid-token") {
        return res.status(401).json({ error: "Unauthorized" })
      }

      return next()
    })

    vi.doMock("../../../../src/presentation/api/middleware/auth-middleware.js", () => ({
      authMiddleware: authMiddlewareMock,
    }))

    vi.doMock("../../../../src/presentation/api/controllers/user-controllers.js", () => ({
      getPayload: getPayloadMock,
    }))

    const { default: userRoutes } = await import("../../../../src/presentation/api/routes/user-routes.js")
    const server = await startServer(userRoutes)

    // Act
    const response = await getJson(server, "/api/users", {
      Authorization: "Bearer REDACTED_FOR_PUBLIC_RELEASE",
    })

    // Assert
    expect(response.status).toBe(401)
    expect(response.body).toEqual({ error: "Unauthorized" })
    expect(authMiddlewareMock).toHaveBeenCalledTimes(1)
    expect(getPayloadMock).not.toHaveBeenCalled()

    await stopServer(server)
  })

  it("returns 200 and executes controller when token is accepted", async () => {
    // Arrange
    const getPayloadMock = vi.fn((_req: any, res: any) => res.status(200).json({ next: "/company/1" }))
    const authMiddlewareMock = vi.fn((req: any, res: any, next: any) => {
      if (req.headers.authorization !== "Bearer valid-token") {
        return res.status(401).json({ error: "Unauthorized" })
      }

      return next()
    })

    vi.doMock("../../../../src/presentation/api/middleware/auth-middleware.js", () => ({
      authMiddleware: authMiddlewareMock,
    }))

    vi.doMock("../../../../src/presentation/api/controllers/user-controllers.js", () => ({
      getPayload: getPayloadMock,
    }))

    const { default: userRoutes } = await import("../../../../src/presentation/api/routes/user-routes.js")
    const server = await startServer(userRoutes)

    // Act
    const response = await getJson(server, "/api/users", {
      Authorization: "Bearer valid-token",
    })

    // Assert
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ next: "/company/1" })
    expect(authMiddlewareMock).toHaveBeenCalledTimes(1)
    expect(getPayloadMock).toHaveBeenCalledTimes(1)

    await stopServer(server)
  })
})
