import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Request, Response } from "express"
import { handleUpload } from "../../../../src/presentation/api/controllers/upload-controller.js"

vi.mock("../../../../src/business/services/upload-service.js", () => ({
  processUploadFile: vi.fn(),
}))

import { processUploadFile } from "../../../../src/business/services/upload-service.js"

function mockRes(): Response {
  const res = {} as Response
  res.setHeader = vi.fn().mockReturnValue(res)
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe("upload-controller", () => {
  beforeEach(() => {
    vi.mocked(processUploadFile).mockReset()
  })

  describe("handleUpload", () => {
    it("returns 400 when file is missing", async () => {
      const req = { headers: {}, file: undefined } as unknown as Request
      const res = mockRes()

      await handleUpload(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Missing upload file" })
      )
      expect(vi.mocked(processUploadFile)).not.toHaveBeenCalled()
    })

    it("calls service and returns redirect payload", async () => {
      const file = {
        originalname: "data.csv",
        buffer: Buffer.from("csv,data"),
      }

      const req = { headers: { "x-debug-trace-id": "trace-123" }, file: file as any } as unknown as Request
      const res = mockRes()

      vi.mocked(processUploadFile).mockResolvedValue({
        s3Key: "uploads/trace-123/data.csv",
        fileName: "data.csv",
      })

      await handleUpload(req, res)

      expect(vi.mocked(processUploadFile)).toHaveBeenCalledWith(file, "trace-123")
      expect(res.json).toHaveBeenCalledWith({
        redirect: "/form",
        s3Key: "uploads/trace-123/data.csv",
        fileName: "data.csv",
        traceId: "trace-123",
      })
    })

    it("generates traceId when header is missing", async () => {
      const file = {
        originalname: "data.csv",
        buffer: Buffer.from("csv,data"),
      }

      const req = { headers: {}, file: file as any } as unknown as Request
      const res = mockRes()

      vi.mocked(processUploadFile).mockResolvedValue({
        s3Key: "uploads/server-1/data.csv",
        fileName: "data.csv",
      })

      await handleUpload(req, res)

      const traceId = (vi.mocked(processUploadFile).mock.calls[0] || [])[1]
      expect(traceId).toEqual(expect.stringMatching(/^server-\d+$/))
      expect(res.setHeader).toHaveBeenCalledWith("x-debug-trace-id", traceId)
    })

    it("returns 500 when service throws", async () => {
      const file = {
        originalname: "data.csv",
        buffer: Buffer.from("csv,data"),
      }

      const req = { headers: { "x-debug-trace-id": "trace-error" }, file: file as any } as unknown as Request
      const res = mockRes()

      vi.mocked(processUploadFile).mockRejectedValue(new Error("service failed"))

      await handleUpload(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Error processing upload",
          traceId: "trace-error",
        })
      )
    })
  })
})
