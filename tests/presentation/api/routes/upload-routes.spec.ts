import { beforeEach, describe, expect, it, vi } from "vitest"
import express from "express"

const routerPostMock = vi.fn()
const routerMock = { post: routerPostMock }

const handleUploadMock = vi.fn()

vi.mock("express", () => ({
  default: {
    Router: vi.fn(() => routerMock),
  },
}))

vi.mock("../../../../src/presentation/api/controllers/upload-controller.ts", () => ({
  handleUpload: handleUploadMock,
}))

describe("upload-routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it("registers POST /api/upload with only the upload controller (no auth middleware)", async () => {
    // Arrange

    // Act
    const module = await import("../../../../src/presentation/api/routes/upload-routes.js")

    // Assert
    expect(express.Router).toHaveBeenCalledTimes(1)
    expect(routerPostMock).toHaveBeenCalledTimes(1)
    expect(routerPostMock).toHaveBeenCalledWith("/api/upload", handleUploadMock)
    expect(routerPostMock.mock.calls[0]).toHaveLength(2)
    expect(module.default).toBe(routerMock)
  })
})
