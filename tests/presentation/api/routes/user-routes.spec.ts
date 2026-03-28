import { beforeEach, describe, expect, it, vi } from "vitest"
import express from "express"

const routerGetMock = vi.fn()
const routerMock = { get: routerGetMock }

const authMiddlewareMock = vi.fn()
const getPayloadMock = vi.fn()

vi.mock("express", () => ({
  default: {
    Router: vi.fn(() => routerMock),
  },
}))

vi.mock("../../../../src/presentation/api/middleware/auth-middleware.js", () => ({
  authMiddleware: authMiddlewareMock,
}))

vi.mock("../../../../src/presentation/api/controllers/user-controllers.js", () => ({
  getPayload: getPayloadMock,
}))

describe("user-routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it("registers GET /api/users as a protected route with authMiddleware before the controller", async () => {
    // Arrange

    // Act
    const module = await import("../../../../src/presentation/api/routes/user-routes.js")

    // Assert
    expect(express.Router).toHaveBeenCalledTimes(1)
    expect(routerGetMock).toHaveBeenCalledTimes(1)
    expect(routerGetMock).toHaveBeenCalledWith("/api/users", authMiddlewareMock, getPayloadMock)
    expect(module.default).toBe(routerMock)
  })
})
