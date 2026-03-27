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

vi.mock("../../../../src/presentation/api/controllers/upload-controller.js", () => ({
  handleUpload: handleUploadMock,
}))

describe("upload-routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it("registers POST /api/upload with multer middleware and upload controller", async () => {
    // Arrange

    // Act
    const module = await import("../../../../src/presentation/api/routes/upload-routes.js")

    // Assert
    expect(express.Router).toHaveBeenCalledTimes(1)
    expect(routerPostMock).toHaveBeenCalledTimes(1)
    expect(routerPostMock.mock.calls[0][0]).toBe("/api/upload")
    expect(typeof routerPostMock.mock.calls[0][1]).toBe("function")
    expect(routerPostMock.mock.calls[0][2]).toBe(handleUploadMock)
    expect(routerPostMock.mock.calls[0]).toHaveLength(3)
    expect(module.default).toBe(routerMock)
  })
})
