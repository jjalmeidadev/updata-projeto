import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Request, Response } from "express"
import { handleUpload } from "../../../../src/presentation/api/controllers/upload-controller.js"

vi.mock("../../../../src/config/aws-clients.ts", () => ({
  s3Client: {
    send: vi.fn(),
  },
}))

vi.mock("../../../../src/business/queue/upload-queue.js", () => ({
  enqueueUploadJob: vi.fn(),
}))

import { s3Client } from "../../../../src/config/aws-clients.js"
import { enqueueUploadJob } from "../../../../src/business/queue/upload-queue.js"

function mockRes(): Response {
  const res = {} as Response
  res.setHeader = vi.fn().mockReturnValue(res)
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe("upload-controller", () => {
  beforeEach(() => {
    vi.mocked(s3Client.send).mockReset()
    vi.mocked(enqueueUploadJob).mockReset()
    delete (globalThis as any).process
  })

  describe("handleUpload", () => {
    it("returns 400 when file is missing", async () => {
      // Arrange
      ;(globalThis as any).process = { env: {} }
      const req = { headers: {}, file: undefined } as any as Request
      const res = mockRes()

      // Act
      await handleUpload(req, res)

      // Assert
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Missing upload file" })
      )
      expect(vi.mocked(s3Client.send)).not.toHaveBeenCalled()
    })

    it("uploads file to S3 with correct key format", async () => {
      // Arrange
      ;(globalThis as any).process = {
        env: { AWS_S3_BUCKET: "upload-bucket" },
      }

      const file = {
        originalname: "data.csv",
        buffer: Buffer.from("csv,data"),
      }

      const req = { headers: {}, file: file as any } as any as Request
      const res = mockRes()

      vi.mocked(s3Client.send).mockResolvedValue({})
      vi.mocked(enqueueUploadJob).mockResolvedValue(undefined)

      // Act
      await handleUpload(req, res)

      // Assert
      expect(vi.mocked(s3Client.send)).toHaveBeenCalled()
      expect(vi.mocked(enqueueUploadJob)).toHaveBeenCalled()
    })

    it("enqueues upload job with S3 metadata", async () => {
      // Arrange
      ;(globalThis as any).process = {
        env: { AWS_S3_BUCKET: "upload-bucket" },
      }

      const file = {
        originalname: "data.csv",
        buffer: Buffer.from("csv,data"),
      }

      const req = { headers: { "x-debug-trace-id": "trace-123" }, file: file as any } as any as Request
      const res = mockRes()

      vi.mocked(s3Client.send).mockResolvedValue({})
      vi.mocked(enqueueUploadJob).mockResolvedValue(undefined)

      // Act
      await handleUpload(req, res)

      // Assert
      expect(vi.mocked(enqueueUploadJob)).toHaveBeenCalledWith(
        expect.objectContaining({
          s3Key: expect.stringContaining("trace-123"),
          fileName: "data.csv",
        }),
        "trace-123"
      )
    })

    it("returns 200 with redirect URL on successful upload", async () => {
      // Arrange
      ;(globalThis as any).process = {
        env: { AWS_S3_BUCKET: "upload-bucket" },
      }

      const file = {
        originalname: "data.csv",
        buffer: Buffer.from("csv,data"),
      }

      const req = { headers: {}, file: file as any } as any as Request
      const res = mockRes()

      vi.mocked(s3Client.send).mockResolvedValue({})
      vi.mocked(enqueueUploadJob).mockResolvedValue(undefined)

      // Act
      await handleUpload(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          redirect: "/form",
          s3Key: expect.any(String),
          fileName: "data.csv",
          traceId: expect.any(String),
        })
      )
    })

    it("generates traceId when x-debug-trace-id header is missing", async () => {
      // Arrange
      ;(globalThis as any).process = {
        env: { AWS_S3_BUCKET: "upload-bucket" },
      }

      const file = {
        originalname: "data.csv",
        buffer: Buffer.from("csv,data"),
      }

      const req = { headers: {}, file: file as any } as any as Request
      const res = mockRes()

      vi.mocked(s3Client.send).mockResolvedValue({})
      vi.mocked(enqueueUploadJob).mockResolvedValue(undefined)

      // Act
      await handleUpload(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          traceId: expect.stringMatching(/^server-\d+$/),
        })
      )
    })

    it("sets x-debug-trace-id response header", async () => {
      // Arrange
      ;(globalThis as any).process = {
        env: { AWS_S3_BUCKET: "upload-bucket" },
      }

      const file = {
        originalname: "data.csv",
        buffer: Buffer.from("csv,data"),
      }

      const req = { headers: { "x-debug-trace-id": "trace-abc" }, file: file as any } as any as Request
      const res = mockRes()

      vi.mocked(s3Client.send).mockResolvedValue({})
      vi.mocked(enqueueUploadJob).mockResolvedValue(undefined)

      // Act
      await handleUpload(req, res)

      // Assert
      expect(res.setHeader).toHaveBeenCalledWith("x-debug-trace-id", "trace-abc")
    })

    it("returns 500 when S3 upload fails", async () => {
      // Arrange
      ;(globalThis as any).process = {
        env: { AWS_S3_BUCKET: "upload-bucket" },
      }

      const file = {
        originalname: "data.csv",
        buffer: Buffer.from("csv,data"),
      }

      const req = { headers: {}, file: file as any } as any as Request
      const res = mockRes()

      vi.mocked(s3Client.send).mockRejectedValue(new Error("S3 connection failed"))

      // Act
      await handleUpload(req, res)

      // Assert
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Error processing upload" })
      )
    })

    it("returns 500 when queue enqueue fails", async () => {
      // Arrange
      ;(globalThis as any).process = {
        env: { AWS_S3_BUCKET: "upload-bucket" },
      }

      const file = {
        originalname: "data.csv",
        buffer: Buffer.from("csv,data"),
      }

      const req = { headers: {}, file: file as any } as any as Request
      const res = mockRes()

      vi.mocked(s3Client.send).mockResolvedValue({})
      vi.mocked(enqueueUploadJob).mockRejectedValue(new Error("Queue error"))

      // Act
      await handleUpload(req, res)

      // Assert
      expect(res.status).toHaveBeenCalledWith(500)
    })

    it("includes trace ID in error response", async () => {
      // Arrange
      ;(globalThis as any).process = {
        env: { AWS_S3_BUCKET: "upload-bucket" },
      }

      const file = {
        originalname: "data.csv",
        buffer: Buffer.from("csv,data"),
      }

      const req = { headers: { "x-debug-trace-id": "trace-error" }, file: file as any } as any as Request
      const res = mockRes()

      vi.mocked(s3Client.send).mockRejectedValue(new Error("S3 failed"))

      // Act
      await handleUpload(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ traceId: "trace-error" })
      )
    })

    it("handles .xlsx file uploads", async () => {
      // Arrange
      ;(globalThis as any).process = {
        env: { AWS_S3_BUCKET: "upload-bucket" },
      }

      const file = {
        originalname: "data.xlsx",
        buffer: Buffer.from("xlsx,data"),
      }

      const req = { headers: {}, file: file as any } as any as Request
      const res = mockRes()

      vi.mocked(s3Client.send).mockResolvedValue({})
      vi.mocked(enqueueUploadJob).mockResolvedValue(undefined)

      // Act
      await handleUpload(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ fileName: "data.xlsx" })
      )
    })

    it("uses xls content type for .xls uploads", async () => {
      // Arrange
      ;(globalThis as any).process = {
        env: { AWS_S3_BUCKET: "upload-bucket" },
      }

      const file = {
        originalname: "legacy.xls",
        buffer: Buffer.from("xls,data"),
      }

      const req = { headers: {}, file: file as any } as any as Request
      const res = mockRes()

      vi.mocked(s3Client.send).mockResolvedValue({} as never)
      vi.mocked(enqueueUploadJob).mockResolvedValue(undefined)

      // Act
      await handleUpload(req, res)

      // Assert
      const command = vi.mocked(s3Client.send).mock.calls[0][0] as any
      expect(command.input.ContentType).toBe("application/vnd.ms-excel")
    })

    it("uses octet-stream content type for unknown extension", async () => {
      // Arrange
      ;(globalThis as any).process = {
        env: { AWS_S3_BUCKET: "upload-bucket" },
      }

      const file = {
        originalname: "blob.bin",
        buffer: Buffer.from("bin,data"),
      }

      const req = { headers: {}, file: file as any } as any as Request
      const res = mockRes()

      vi.mocked(s3Client.send).mockResolvedValue({} as never)
      vi.mocked(enqueueUploadJob).mockResolvedValue(undefined)

      // Act
      await handleUpload(req, res)

      // Assert
      const command = vi.mocked(s3Client.send).mock.calls[0][0] as any
      expect(command.input.ContentType).toBe("application/octet-stream")
    })

    it("uses octet-stream when file has no extension", async () => {
      // Arrange
      ;(globalThis as any).process = {
        env: { AWS_S3_BUCKET: "upload-bucket" },
      }

      const file = {
        originalname: "payload",
        buffer: Buffer.from("raw,data"),
      }

      const req = { headers: {}, file: file as any } as any as Request
      const res = mockRes()

      vi.mocked(s3Client.send).mockResolvedValue({} as never)
      vi.mocked(enqueueUploadJob).mockResolvedValue(undefined)

      // Act
      await handleUpload(req, res)

      // Assert
      const command = vi.mocked(s3Client.send).mock.calls[0][0] as any
      expect(command.input.ContentType).toBe("application/octet-stream")
    })

    it("uses octet-stream when filename ends with dot", async () => {
      // Arrange
      ;(globalThis as any).process = {
        env: { AWS_S3_BUCKET: "upload-bucket" },
      }

      const file = {
        originalname: "payload.",
        buffer: Buffer.from("raw,data"),
      }

      const req = { headers: {}, file: file as any } as any as Request
      const res = mockRes()

      vi.mocked(s3Client.send).mockResolvedValue({} as never)
      vi.mocked(enqueueUploadJob).mockResolvedValue(undefined)

      // Act
      await handleUpload(req, res)

      // Assert
      const command = vi.mocked(s3Client.send).mock.calls[0][0] as any
      expect(command.input.ContentType).toBe("application/octet-stream")
    })
  })
})
