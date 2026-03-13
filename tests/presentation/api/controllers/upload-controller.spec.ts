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
    it("retorna 400 quando body.rows está ausente", async () => {
      const req = { body: {}, headers: {} } as Request
      const res = mockRes()

      await handleUpload(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Missing rows payload" })
      )
      expect(mapRowsToEntities).not.toHaveBeenCalled()
    })

    it("retorna 400 quando rows não é array", async () => {
      const req = { body: { rows: "not-an-array" }, headers: {} } as Request
      const res = mockRes()

      await handleUpload(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(mapRowsToEntities).not.toHaveBeenCalled()
    })

    it("retorna 400 quando rows é array vazio", async () => {
      const req = { body: { rows: [] }, headers: {} } as Request
      const res = mockRes()

      await handleUpload(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(mapRowsToEntities).not.toHaveBeenCalled()
    })

    it("retorna 200 com redirect, data e traceId quando payload é válido", async () => {
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

    it("retorna 500 quando mapRowsToEntities lança", async () => {
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
