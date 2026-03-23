import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Request, Response } from "express"
import { handleUpload } from "../../../../src/presentation/api/controllers/upload-controller.js"

vi.mock("../../../../src/business/services/upload-service.js", () => ({
  mapRowsToEntities: vi.fn(),
}))

import { mapRowsToEntities } from "../../../../src/business/services/upload-service.js"

function mockRes(): Response {
  const res = {} as Response
  res.setHeader = vi.fn().mockReturnValue(res)
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe("upload-controller", () => {
  beforeEach(() => {
    vi.mocked(mapRowsToEntities).mockReset()
  })

  describe("handleUpload", () => {
    it("returns 400 when body.rows is missing", async () => {
      const req = { body: {}, headers: {} } as Request
      const res = mockRes()

      await handleUpload(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Missing rows payload" })
      )
      expect(mapRowsToEntities).not.toHaveBeenCalled()
    })

    it("returns 400 when rows is not an array", async () => {
      const req = { body: { rows: "not-an-array" }, headers: {} } as Request
      const res = mockRes()

      await handleUpload(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(mapRowsToEntities).not.toHaveBeenCalled()
    })

    it("returns 400 when rows is an empty array", async () => {
      const req = { body: { rows: [] }, headers: {} } as Request
      const res = mockRes()

      await handleUpload(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(mapRowsToEntities).not.toHaveBeenCalled()
    })

    it("returns 200 with redirect, data, and traceId when payload is valid", async () => {
      const rows = [{ Name: "Tower A" }]
      const entities = [
        { fields: { name: "Tower A" } },
      ]
      vi.mocked(mapRowsToEntities).mockReturnValue(entities as never)

      const req = { body: { rows }, headers: { "x-debug-trace-id": "trace-1" } } as Request
      const res = mockRes()

      await handleUpload(req, res)

      expect(mapRowsToEntities).toHaveBeenCalledWith(rows, "trace-1")
      expect(res.status).not.toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith({
        redirect: "/form",
        data: [{ name: "Tower A" }],
        traceId: "trace-1",
      })
    })

    it("returns 500 when mapRowsToEntities throws", async () => {
      vi.mocked(mapRowsToEntities).mockImplementation(() => {
        throw new Error("No rows received")
      })

      const req = { body: { rows: [{ x: 1 }] }, headers: {} } as Request
      const res = mockRes()

      await handleUpload(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Error processing upload" })
      )
    })
  })
})
