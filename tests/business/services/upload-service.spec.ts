import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../../src/config/aws-clients.ts", () => ({
  s3Client: {
    send: vi.fn(),
  },
}))

vi.mock("../../../src/business/queue/upload-queue.ts", () => ({
  enqueueUploadJob: vi.fn(),
}))

import { s3Client } from "../../../src/config/aws-clients.js"
import { enqueueUploadJob } from "../../../src/business/queue/upload-queue.js"
import { mapRowsToEntities, processUploadFile } from "../../../src/business/services/upload-service.js"

describe("upload-service", () => {
  beforeEach(() => {
    vi.mocked(s3Client.send).mockReset()
    vi.mocked(enqueueUploadJob).mockReset()
  })

  describe("mapRowsToEntities", () => {
    it("throws when rows is null", () => {
      expect(() => mapRowsToEntities(null as unknown as never[], "trace-1")).toThrow("No rows received")
    })

    it("throws when rows is an empty array", () => {
      expect(() => mapRowsToEntities([], "trace-1")).toThrow("No rows received")
    })

    it("throws when rows is not an array", () => {
      expect(() => mapRowsToEntities({} as unknown as never[], "trace-1")).toThrow("No rows received")
    })

    it("returns entities with normalized fields for valid rows", () => {
      const rows = [
        { "Building Name": "Tower A", Company: "Acme" },
        { "Building Name": "Tower B", Company: "Beta" },
      ]
      const entities = mapRowsToEntities(rows, "trace-1")
      expect(entities).toHaveLength(2)
      expect(entities[0].fields).toEqual({ building_name: "Tower A", company: "Acme" })
      expect(entities[1].fields).toEqual({ building_name: "Tower B", company: "Beta" })
    })

    it("returns correct count of entities", () => {
      const rows = [
        { name: "Building A" },
        { name: "Building B" },
        { name: "Building C" },
      ]
      const entities = mapRowsToEntities(rows, "trace-1")
      expect(entities).toHaveLength(3)
    })

    it("preserves row order in entities", () => {
      const rows = [
        { id: "1", name: "First" },
        { id: "2", name: "Second" },
        { id: "3", name: "Third" },
      ]
      const entities = mapRowsToEntities(rows, "trace-1")
      expect(entities[0].fields).toEqual({ id: "1", name: "First" })
      expect(entities[1].fields).toEqual({ id: "2", name: "Second" })
      expect(entities[2].fields).toEqual({ id: "3", name: "Third" })
    })

    it("handles single row", () => {
      const rows = [{ "Building Name": "Tower A" }]
      const entities = mapRowsToEntities(rows, "trace-1")
      expect(entities).toHaveLength(1)
      expect(entities[0].fields).toEqual({ building_name: "Tower A" })
    })

    it("normalizes each entity independently", () => {
      const rows = [
        { "  FIELD ONE  ": "value1" },
        { "  FIELD TWO  ": "value2" },
      ]
      const entities = mapRowsToEntities(rows, "trace-1")
      expect(entities[0].fields).toEqual({ field_one: "value1" })
      expect(entities[1].fields).toEqual({ field_two: "value2" })
    })
  })

  describe("processUploadFile", () => {
    it("uploads file to S3 and enqueues metadata", async () => {
      const file = {
        originalname: "data.csv",
        buffer: Buffer.from("csv,data"),
      }

      vi.mocked(s3Client.send).mockResolvedValue({} as never)
      vi.mocked(enqueueUploadJob).mockResolvedValue(undefined)

      const result = await processUploadFile(file, "trace-1")

      expect(vi.mocked(s3Client.send)).toHaveBeenCalledTimes(1)
      expect(vi.mocked(enqueueUploadJob)).toHaveBeenCalledWith(
        {
          s3Key: "uploads/trace-1/data.csv",
          fileName: "data.csv",
        },
        "trace-1"
      )
      expect(result).toEqual({
        s3Key: "uploads/trace-1/data.csv",
        fileName: "data.csv",
      })
    })

    it("uses csv content type", async () => {
      const file = {
        originalname: "input.csv",
        buffer: Buffer.from("data"),
      }

      vi.mocked(s3Client.send).mockResolvedValue({} as never)
      vi.mocked(enqueueUploadJob).mockResolvedValue(undefined)

      await processUploadFile(file, "trace-csv")

      const command = vi.mocked(s3Client.send).mock.calls[0][0] as any
      expect(command.input.ContentType).toBe("text/csv")
    })

    it("uses xlsx content type", async () => {
      const file = {
        originalname: "input.xlsx",
        buffer: Buffer.from("data"),
      }

      vi.mocked(s3Client.send).mockResolvedValue({} as never)
      vi.mocked(enqueueUploadJob).mockResolvedValue(undefined)

      await processUploadFile(file, "trace-xlsx")

      const command = vi.mocked(s3Client.send).mock.calls[0][0] as any
      expect(command.input.ContentType).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    })

    it("uses xls content type", async () => {
      const file = {
        originalname: "input.xls",
        buffer: Buffer.from("data"),
      }

      vi.mocked(s3Client.send).mockResolvedValue({} as never)
      vi.mocked(enqueueUploadJob).mockResolvedValue(undefined)

      await processUploadFile(file, "trace-xls")

      const command = vi.mocked(s3Client.send).mock.calls[0][0] as any
      expect(command.input.ContentType).toBe("application/vnd.ms-excel")
    })

    it("uses octet-stream for unknown extension", async () => {
      const file = {
        originalname: "blob.bin",
        buffer: Buffer.from("data"),
      }

      vi.mocked(s3Client.send).mockResolvedValue({} as never)
      vi.mocked(enqueueUploadJob).mockResolvedValue(undefined)

      await processUploadFile(file, "trace-bin")

      const command = vi.mocked(s3Client.send).mock.calls[0][0] as any
      expect(command.input.ContentType).toBe("application/octet-stream")
    })
  })
})
