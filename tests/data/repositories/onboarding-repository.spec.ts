import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  createOnboardingBatch,
  updateOnboardingBatchStatus,
  createProcessingJob,
  updateProcessingJobStatus,
  createProcessingLog,
  saveOnboardingPayloads,
  saveOnboardingMappings,
} from "../../../src/data/repositories/onboarding-repository.js"

const { mockPool } = vi.hoisted(() => ({
  mockPool: {
    query: vi.fn(),
  },
}))

vi.mock("../../../src/data/database/index-table.js", () => ({
  default: mockPool,
}))

describe("onboarding-repository", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPool.query.mockReset()
  })

  describe("createOnboardingBatch", () => {
    it("inserts batch record and returns ID", async () => {
      // Arrange
      const input = {
        source: "upload",
        status: "queued",
        fileName: "data.csv",
        s3Key: "uploads/trace-1/data.csv",
        traceId: "trace-1",
      }
      const batchId = "batch-uuid-123"

      mockPool.query.mockResolvedValue({
        rows: [{ id: batchId }],
      })

      // Act
      const result = await createOnboardingBatch(input)

      // Assert
      expect(result).toBe(batchId)
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO equiem.onboarding_batch"),
        [input.source, input.status, input.fileName, input.s3Key, input.traceId]
      )
    })

    it("includes trace ID in batch creation", async () => {
      // Arrange
      const input = {
        source: "upload",
        status: "queued",
        fileName: "data.csv",
        s3Key: "uploads/data.csv",
        traceId: "trace-abc-123",
      }

      mockPool.query.mockResolvedValue({ rows: [{ id: "batch-1" }] })

      // Act
      await createOnboardingBatch(input)

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(expect.anything(), [
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        "trace-abc-123",
      ])
    })
  })

  describe("updateOnboardingBatchStatus", () => {
    it("updates batch status", async () => {
      // Arrange
      const batchId = "batch-1"
      const status = "processing"

      mockPool.query.mockResolvedValue({})

      // Act
      await updateOnboardingBatchStatus(batchId, status)

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE equiem.onboarding_batch"),
        [batchId, status, status, null]
      )
    })

    it("includes error message when provided", async () => {
      // Arrange
      const batchId = "batch-1"
      const status = "failed"
      const errorMessage = "File parsing failed"

      mockPool.query.mockResolvedValue({})

      // Act
      await updateOnboardingBatchStatus(batchId, status, errorMessage)

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.anything(),
        [batchId, status, status, errorMessage]
      )
    })

    it("sets processed_at timestamp for terminal statuses", async () => {
      // Arrange
      mockPool.query.mockResolvedValue({})

      // Act
      await updateOnboardingBatchStatus("batch-1", "completed")

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("processed_at = CASE WHEN"),
        expect.anything()
      )
    })
  })

  describe("createProcessingJob", () => {
    it("inserts processing job and returns ID", async () => {
      // Arrange
      const input = {
        batchId: "batch-1",
        type: "upload_ingestion",
        status: "processing",
      }
      const jobId = "job-uuid-456"

      mockPool.query.mockResolvedValue({
        rows: [{ id: jobId }],
      })

      // Act
      const result = await createProcessingJob(input)

      // Assert
      expect(result).toBe(jobId)
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO equiem.processing_job"),
        [input.batchId, input.type, input.status]
      )
    })

    it("sets started_at to current timestamp", async () => {
      // Arrange
      const input = {
        batchId: "batch-1",
        type: "upload_ingestion",
        status: "processing",
      }

      mockPool.query.mockResolvedValue({ rows: [{ id: "job-1" }] })

      // Act
      await createProcessingJob(input)

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("NOW()"),
        expect.anything()
      )
    })
  })

  describe("updateProcessingJobStatus", () => {
    it("updates job status", async () => {
      // Arrange
      const jobId = "job-1"
      const status = "completed"

      mockPool.query.mockResolvedValue({})

      // Act
      await updateProcessingJobStatus(jobId, status)

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE equiem.processing_job"),
        [jobId, status, status, null, null]
      )
    })

    it("includes error message and external reference in options", async () => {
      // Arrange
      const jobId = "job-1"
      const status = "completed"
      const options = {
        errorMessage: "API error",
        externalReference: "equiem-ref-123",
      }

      mockPool.query.mockResolvedValue({})

      // Act
      await updateProcessingJobStatus(jobId, status, options)

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.anything(),
        [jobId, status, status, "API error", "equiem-ref-123"]
      )
    })

    it("sets finished_at for terminal statuses", async () => {
      // Arrange
      mockPool.query.mockResolvedValue({})

      // Act
      await updateProcessingJobStatus("job-1", "failed")

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("finished_at = CASE WHEN"),
        expect.anything()
      )
    })
  })

  describe("createProcessingLog", () => {
    it("inserts processing log entry", async () => {
      // Arrange
      const jobId = "job-1"
      const level = "info"
      const message = "Processing started"

      mockPool.query.mockResolvedValue({})

      // Act
      await createProcessingLog(jobId, level, message)

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO equiem.processing_log"),
        [jobId, level, message]
      )
    })

    it("handles different log levels", async () => {
      // Arrange
      mockPool.query.mockResolvedValue({})

      // Act
      await Promise.all([
        createProcessingLog("job-1", "info", "Info message"),
        createProcessingLog("job-1", "warn", "Warning message"),
        createProcessingLog("job-1", "error", "Error message"),
      ])

      // Assert
      expect(mockPool.query).toHaveBeenCalledTimes(3)
      expect(mockPool.query).toHaveBeenNthCalledWith(1, expect.anything(), [
        "job-1",
        "info",
        "Info message",
      ])
      expect(mockPool.query).toHaveBeenNthCalledWith(2, expect.anything(), [
        "job-1",
        "warn",
        "Warning message",
      ])
      expect(mockPool.query).toHaveBeenNthCalledWith(3, expect.anything(), [
        "job-1",
        "error",
        "Error message",
      ])
    })
  })

  describe("saveOnboardingPayloads", () => {
    it("returns early without querying when payload list is empty", async () => {
      await saveOnboardingPayloads("batch-1", [])

      expect(mockPool.query).not.toHaveBeenCalled()
    })

    it("inserts each payload row with serialized JSON fields", async () => {
      mockPool.query.mockResolvedValue({})

      await saveOnboardingPayloads("batch-1", [
        {
          rowNumber: 1,
          entityType: "building",
          rawData: { external_id: "b-1", name: "Tower A" },
          isValid: true,
          validationErrors: [],
        },
        {
          rowNumber: 2,
          entityType: "company",
          rawData: { external_id: "c-1", name: "Acme" },
          isValid: false,
          validationErrors: ["Missing field"],
        },
      ])

      expect(mockPool.query).toHaveBeenCalledTimes(1)
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO equiem.onboarding_payload"),
        [
          "batch-1",
          [1, 2],
          ["building", "company"],
          [
            JSON.stringify({ external_id: "b-1", name: "Tower A" }),
            JSON.stringify({ external_id: "c-1", name: "Acme" }),
          ],
          [true, false],
          [JSON.stringify([]), JSON.stringify(["Missing field"])],
        ]
      )
    })
  })

  describe("saveOnboardingMappings", () => {
    it("returns early without querying when mapping list is empty", async () => {
      await saveOnboardingMappings([])

      expect(mockPool.query).not.toHaveBeenCalled()
    })

    it("inserts each mapping entry", async () => {
      mockPool.query.mockResolvedValue({})

      await saveOnboardingMappings([
        { entityType: "building", externalId: "b-1", internalId: "uuid-1" },
        { entityType: "company", externalId: "c-1", internalId: "uuid-2" },
      ])

      expect(mockPool.query).toHaveBeenCalledTimes(2)
      expect(mockPool.query).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("INSERT INTO equiem.onboarding_mapping"),
        ["building", "b-1", "uuid-1"]
      )
      expect(mockPool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("INSERT INTO equiem.onboarding_mapping"),
        ["company", "c-1", "uuid-2"]
      )
    })
  })
})
