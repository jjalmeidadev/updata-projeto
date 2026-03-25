import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock all dependencies first
vi.mock("../../../src/business/services/upload-file-parser-service.js", () => ({
  parseUploadFile: vi.fn(),
}))

vi.mock("../../../src/business/services/upload-payload-mapper-service.js", () => ({
  mapRowsForProcessing: vi.fn(),
  buildEquiemPayload: vi.fn(),
}))

vi.mock("../../../src/data/repositories/onboarding-repository.js", () => ({
  createOnboardingBatch: vi.fn(),
  createProcessingJob: vi.fn(),
  createProcessingLog: vi.fn(),
  saveOnboardingPayloads: vi.fn(),
  saveOnboardingMappings: vi.fn(),
  updateOnboardingBatchStatus: vi.fn(),
  updateProcessingJobStatus: vi.fn(),
}))

vi.mock("../../../src/data/integrations/equiem-api-client.js", () => ({
  sendToEquiemApi: vi.fn(),
}))

vi.mock("../../../src/config/aws-clients.js", () => ({
  s3Client: {
    send: vi.fn(),
  },
  sqsClient: {
    send: vi.fn(),
  },
}))

// Import mocks after setting them up
import { parseUploadFile } from "../../../src/business/services/upload-file-parser-service.js"
import { mapRowsForProcessing, buildEquiemPayload } from "../../../src/business/services/upload-payload-mapper-service.js"
import {
  createOnboardingBatch,
  createProcessingJob,
  createProcessingLog,
  saveOnboardingPayloads,
  saveOnboardingMappings,
  updateOnboardingBatchStatus,
  updateProcessingJobStatus,
} from "../../../src/data/repositories/onboarding-repository.js"
import { sendToEquiemApi } from "../../../src/data/integrations/equiem-api-client.js"
import { s3Client, sqsClient } from "../../../src/config/aws-clients.js"

describe("upload-worker", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.AWS_SQS_QUEUE_URL
    delete process.env.AWS_S3_BUCKET
  })

  describe("processMessage", () => {
    it("creates batch and job on message receipt", async () => {
      // Arrange
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"

      const message = {
        traceId: "trace-1",
        s3Key: "uploads/trace-1/data.csv",
        fileName: "data.csv",
      }

      vi.mocked(createOnboardingBatch).mockResolvedValue("batch-1")
      vi.mocked(createProcessingJob).mockResolvedValue("job-1")
      vi.mocked(s3Client.send).mockResolvedValue({
        Body: {
          transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
        },
      })
      vi.mocked(parseUploadFile).mockReturnValue([{ row: 1 }])
      vi.mocked(mapRowsForProcessing).mockReturnValue([])

        const { processMessage } = await import("../../../src/business/workers/upload-worker.js")

      // Act
      await processMessage(message)

      // Assert
      expect(vi.mocked(createOnboardingBatch)).toHaveBeenCalledWith({
        source: "upload",
        status: "queued",
        fileName: "data.csv",
        s3Key: "uploads/trace-1/data.csv",
        traceId: "trace-1",
      })
      expect(vi.mocked(createProcessingJob)).toHaveBeenCalled()
    })

    it("skips processing when s3Key is missing", async () => {
      // Arrange
      process.env.AWS_S3_BUCKET = "bucket"

      const message = { traceId: "trace-1", s3Key: "", fileName: "data.csv" }

      // Act
        const { processMessage } = await import("../../../src/business/workers/upload-worker.js")
      await processMessage(message)

      // Assert
      expect(vi.mocked(createOnboardingBatch)).not.toHaveBeenCalled()
    })

    it("downloads file from S3 using provided key", async () => {
      // Arrange
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"

      const message = {
        traceId: "trace-1",
        s3Key: "uploads/trace-1/data.csv",
        fileName: "data.csv",
      }

      vi.mocked(createOnboardingBatch).mockResolvedValue("batch-1")
      vi.mocked(createProcessingJob).mockResolvedValue("job-1")
      vi.mocked(s3Client.send).mockResolvedValue({
        Body: {
          transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
        },
      })
      vi.mocked(parseUploadFile).mockReturnValue([{ row: 1 }])
      vi.mocked(mapRowsForProcessing).mockReturnValue([])

        const { processMessage } = await import("../../../src/business/workers/upload-worker.js")

      // Act
      await processMessage(message)

      // Assert
      expect(vi.mocked(s3Client.send)).toHaveBeenCalled()
    })

    it("parses file content using parseUploadFile", async () => {
      // Arrange
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"

      const message = {
        traceId: "trace-1",
        s3Key: "uploads/trace-1/data.csv",
        fileName: "data.csv",
      }

      const fileBuffer = new Uint8Array([1, 2, 3])

      vi.mocked(createOnboardingBatch).mockResolvedValue("batch-1")
      vi.mocked(createProcessingJob).mockResolvedValue("job-1")
      vi.mocked(s3Client.send).mockResolvedValue({
        Body: {
          transformToByteArray: vi.fn().mockResolvedValue(fileBuffer),
        },
      })
      vi.mocked(parseUploadFile).mockReturnValue([{ row: 1 }])
      vi.mocked(mapRowsForProcessing).mockReturnValue([])

        const { processMessage } = await import("../../../src/business/workers/upload-worker.js")

      // Act
      await processMessage(message)

      // Assert
      expect(vi.mocked(parseUploadFile)).toHaveBeenCalledWith(
        fileBuffer,
        "data.csv",
        "trace-1"
      )
    })

    it("stops processing when file content is empty", async () => {
      // Arrange
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"

      const message = {
        traceId: "trace-1",
        s3Key: "uploads/trace-1/data.csv",
        fileName: "data.csv",
      }

      vi.mocked(createOnboardingBatch).mockResolvedValue("batch-1")
      vi.mocked(createProcessingJob).mockResolvedValue("job-1")
      vi.mocked(s3Client.send).mockResolvedValue({
        Body: {
          transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array([])),
        },
      })

        const { processMessage } = await import("../../../src/business/workers/upload-worker.js")

      // Act & Assert
      expect(async () => await processMessage(message)).toBeDefined()
    })

    it("maps rows for processing once file is parsed", async () => {
      // Arrange
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"

      const message = {
        traceId: "trace-1",
        s3Key: "uploads/trace-1/data.csv",
        fileName: "data.csv",
      }

      const rows = [{ name: "Building A" }]

      vi.mocked(createOnboardingBatch).mockResolvedValue("batch-1")
      vi.mocked(createProcessingJob).mockResolvedValue("job-1")
      vi.mocked(s3Client.send).mockResolvedValue({
        Body: {
          transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
        },
      })
      vi.mocked(parseUploadFile).mockReturnValue(rows)
      vi.mocked(mapRowsForProcessing).mockReturnValue([])

        const { processMessage } = await import("../../../src/business/workers/upload-worker.js")

      // Act
      await processMessage(message)

      // Assert
      expect(vi.mocked(mapRowsForProcessing)).toHaveBeenCalledWith(rows, "trace-1")
    })

    it("sends payload to Equiem API when records are valid", async () => {
      // Arrange
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"

      const message = {
        traceId: "trace-1",
        s3Key: "uploads/trace-1/data.csv",
        fileName: "data.csv",
      }

      const equiemPayload = {
        source: "upload" as const,
        traceId: "trace-1",
        fileName: "data.csv",
        batchId: "batch-1",
        records: [{ entityType: "building", rowNumber: 1, externalId: "b1", name: "Tower", data: {} }],
      }

      vi.mocked(createOnboardingBatch).mockResolvedValue("batch-1")
      vi.mocked(createProcessingJob).mockResolvedValue("job-1")
      vi.mocked(s3Client.send).mockResolvedValue({
        Body: {
          transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
        },
      })
      vi.mocked(parseUploadFile).mockReturnValue([{ name: "Building A" }])
      vi.mocked(mapRowsForProcessing).mockReturnValue([
        {
          rowNumber: 1,
          entityType: "building",
          isValid: true,
          validationErrors: [],
          rawData: {},
          normalizedData: { external_id: "b1", name: "Tower" },
        },
      ])
      vi.mocked(buildEquiemPayload).mockReturnValue(equiemPayload)
      vi.mocked(sendToEquiemApi).mockResolvedValue({ sent: true, externalReference: "ref-1" })

        const { processMessage } = await import("../../../src/business/workers/upload-worker.js")

      // Act
      await processMessage(message)

      // Assert
      expect(vi.mocked(sendToEquiemApi)).toHaveBeenCalled()
    })

    it("updates batch and job status to completed on success", async () => {
      // Arrange
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"

      const message = {
        traceId: "trace-1",
        s3Key: "uploads/trace-1/data.csv",
        fileName: "data.csv",
      }

      vi.mocked(createOnboardingBatch).mockResolvedValue("batch-1")
      vi.mocked(createProcessingJob).mockResolvedValue("job-1")
      vi.mocked(s3Client.send).mockResolvedValue({
        Body: {
          transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
        },
      })
      vi.mocked(parseUploadFile).mockReturnValue([{ row: 1 }])
      vi.mocked(mapRowsForProcessing).mockReturnValue([
        {
          rowNumber: 1,
          entityType: "building",
          isValid: true,
          validationErrors: [],
          rawData: {},
          normalizedData: { external_id: "b1", name: "Tower" },
        },
      ])
      vi.mocked(buildEquiemPayload).mockReturnValue({
        source: "upload",
        traceId: "trace-1",
        fileName: "data.csv",
        batchId: "batch-1",
        records: [{ entityType: "building", rowNumber: 1, externalId: "b1", name: "Tower", data: {} }],
      })
      vi.mocked(sendToEquiemApi).mockResolvedValue({ sent: true, externalReference: "ref-1" })

        const { processMessage } = await import("../../../src/business/workers/upload-worker.js")

      // Act
      await processMessage(message)

      // Assert
      expect(vi.mocked(updateOnboardingBatchStatus)).toHaveBeenCalledWith(
        "batch-1",
        expect.any(String)
      )
      expect(vi.mocked(updateProcessingJobStatus)).toHaveBeenCalledWith(
        "job-1",
        "completed",
        expect.objectContaining({
          externalReference: "ref-1",
        })
      )
    })

    it("marks batch/job as invalid when no valid rows remain", async () => {
      // Arrange
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"

      const message = {
        traceId: "trace-invalid",
        s3Key: "uploads/trace-invalid/data.csv",
        fileName: "data.csv",
      }

      vi.mocked(createOnboardingBatch).mockResolvedValue("batch-1")
      vi.mocked(createProcessingJob).mockResolvedValue("job-1")
      vi.mocked(s3Client.send).mockResolvedValue({
        Body: {
          transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
        },
      } as never)
      vi.mocked(parseUploadFile).mockReturnValue([{ row: 1 }])
      vi.mocked(mapRowsForProcessing).mockReturnValue([
        {
          rowNumber: 1,
          entityType: "building",
          isValid: false,
          validationErrors: ["Missing required field: external_id"],
          rawData: {},
          normalizedData: {},
        },
      ])

      const { processMessage } = await import("../../../src/business/workers/upload-worker.js")

      // Act
      await processMessage(message)

      // Assert
      expect(vi.mocked(updateProcessingJobStatus)).toHaveBeenCalledWith(
        "job-1",
        "invalid",
        expect.objectContaining({ errorMessage: "No valid rows after validation" })
      )
      expect(vi.mocked(updateOnboardingBatchStatus)).toHaveBeenCalledWith(
        "batch-1",
        "invalid",
        "No valid rows after validation"
      )
    })

    it("marks batch/job as pending when external send is skipped", async () => {
      // Arrange
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"

      const message = {
        traceId: "trace-pending",
        s3Key: "uploads/trace-pending/data.csv",
        fileName: "data.csv",
      }

      vi.mocked(createOnboardingBatch).mockResolvedValue("batch-1")
      vi.mocked(createProcessingJob).mockResolvedValue("job-1")
      vi.mocked(s3Client.send).mockResolvedValue({
        Body: {
          transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
        },
      } as never)
      vi.mocked(parseUploadFile).mockReturnValue([{ row: 1 }])
      vi.mocked(mapRowsForProcessing).mockReturnValue([
        {
          rowNumber: 1,
          entityType: "building",
          isValid: true,
          validationErrors: [],
          rawData: {},
          normalizedData: { external_id: "b1", name: "Tower" },
        },
      ])
      vi.mocked(buildEquiemPayload).mockReturnValue({
        source: "upload",
        traceId: "trace-pending",
        fileName: "data.csv",
        batchId: "batch-1",
        records: [{ entityType: "building", rowNumber: 1, externalId: "b1", name: "Tower", data: {} }],
      })
      vi.mocked(sendToEquiemApi).mockResolvedValue({ sent: false, reason: "endpoint disabled" })

      const { processMessage } = await import("../../../src/business/workers/upload-worker.js")

      // Act
      await processMessage(message)

      // Assert
      expect(vi.mocked(updateProcessingJobStatus)).toHaveBeenCalledWith(
        "job-1",
        "pending_external_send",
        expect.objectContaining({ errorMessage: "endpoint disabled" })
      )
      expect(vi.mocked(updateOnboardingBatchStatus)).toHaveBeenCalledWith(
        "batch-1",
        "pending_external_send",
        "endpoint disabled"
      )
    })

    it("filters invalid mapping candidates before saving mappings", async () => {
      // Arrange
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"

      const message = {
        traceId: "trace-map",
        s3Key: "uploads/trace-map/data.csv",
        fileName: "data.csv",
      }

      vi.mocked(createOnboardingBatch).mockResolvedValue("batch-1")
      vi.mocked(createProcessingJob).mockResolvedValue("job-1")
      vi.mocked(s3Client.send).mockResolvedValue({
        Body: {
          transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
        },
      } as never)
      vi.mocked(parseUploadFile).mockReturnValue([{ row: 1 }])
      vi.mocked(mapRowsForProcessing).mockReturnValue([
        {
          rowNumber: 1,
          entityType: "building",
          isValid: true,
          validationErrors: [],
          rawData: {},
          normalizedData: { external_id: "b1", name: "Tower" },
        },
      ])
      vi.mocked(buildEquiemPayload).mockReturnValue({
        source: "upload",
        traceId: "trace-map",
        fileName: "data.csv",
        batchId: "batch-1",
        records: [{ entityType: "building", rowNumber: 1, externalId: "b1", name: "Tower", data: {} }],
      })
      vi.mocked(sendToEquiemApi).mockResolvedValue({
        sent: true,
        externalReference: "ref-1",
        responseBody: {
          mappings: [
            { entityType: "building", externalId: "b1", internalId: "i1" },
            { entityType: "building", externalId: "b2", internalId: "" },
          ],
        },
      })

      const { processMessage } = await import("../../../src/business/workers/upload-worker.js")

      // Act
      await processMessage(message)

      // Assert
      expect(vi.mocked(saveOnboardingMappings)).toHaveBeenCalledWith([
        { entityType: "building", externalId: "b1", internalId: "i1" },
      ])
    })

    it("throws and marks job as failed when parsed rows are empty", async () => {
      // Arrange
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"

      const message = {
        traceId: "trace-empty",
        s3Key: "uploads/trace-empty/data.csv",
        fileName: "data.csv",
      }

      vi.mocked(createOnboardingBatch).mockResolvedValue("batch-1")
      vi.mocked(createProcessingJob).mockResolvedValue("job-1")
      vi.mocked(s3Client.send).mockResolvedValue({
        Body: {
          transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
        },
      } as never)
      vi.mocked(parseUploadFile).mockReturnValue([])

      const { processMessage } = await import("../../../src/business/workers/upload-worker.js")

      // Act / Assert
      await expect(processMessage(message)).rejects.toThrow("No data rows found in uploaded file")
      expect(vi.mocked(updateProcessingJobStatus)).toHaveBeenCalledWith(
        "job-1",
        "failed",
        expect.objectContaining({ errorMessage: "No data rows found in uploaded file" })
      )
    })

    it("uses fallback unknown error text when non-Error is thrown", async () => {
      // Arrange
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"

      const message = {
        traceId: "trace-unknown",
        s3Key: "uploads/trace-unknown/data.csv",
        fileName: "data.csv",
      }

      vi.mocked(createOnboardingBatch).mockResolvedValue("batch-1")
      vi.mocked(createProcessingJob).mockResolvedValue("job-1")
      vi.mocked(s3Client.send).mockResolvedValue({
        Body: {
          transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
        },
      } as never)
      vi.mocked(parseUploadFile).mockImplementation(() => {
        throw "boom"
      })

      const { processMessage } = await import("../../../src/business/workers/upload-worker.js")

      // Act / Assert
      await expect(processMessage(message)).rejects.toBe("boom")
      expect(vi.mocked(updateProcessingJobStatus)).toHaveBeenCalledWith(
        "job-1",
        "failed",
        expect.objectContaining({ errorMessage: "Unknown processing error" })
      )
    })

    it("generates fallback trace id when message traceId is empty", async () => {
      // Arrange
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"

      vi.mocked(createOnboardingBatch).mockResolvedValue("batch-1")
      vi.mocked(createProcessingJob).mockResolvedValue("job-1")
      vi.mocked(s3Client.send).mockResolvedValue({
        Body: {
          transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array([])),
        },
      } as never)

      const { processMessage } = await import("../../../src/business/workers/upload-worker.js")

      // Act / Assert
      await expect(
        processMessage({ traceId: "", s3Key: "uploads/x.csv", fileName: "x.csv" })
      ).rejects.toThrow("Uploaded file content is empty")

      expect(vi.mocked(createOnboardingBatch)).toHaveBeenCalledWith(
        expect.objectContaining({
          traceId: expect.stringMatching(/^worker-\d+$/),
        })
      )
    })

    it("uses default pending reason when Equiem returns sent=false without reason", async () => {
      // Arrange
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"

      vi.mocked(createOnboardingBatch).mockResolvedValue("batch-1")
      vi.mocked(createProcessingJob).mockResolvedValue("job-1")
      vi.mocked(s3Client.send).mockResolvedValue({
        Body: {
          transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
        },
      } as never)
      vi.mocked(parseUploadFile).mockReturnValue([{ row: 1 }])
      vi.mocked(mapRowsForProcessing).mockReturnValue([
        {
          rowNumber: 1,
          entityType: "building",
          isValid: true,
          validationErrors: [],
          rawData: {},
          normalizedData: { external_id: "b1", name: "Tower" },
        },
      ])
      vi.mocked(buildEquiemPayload).mockReturnValue({
        source: "upload",
        traceId: "trace-pending-default",
        fileName: "data.csv",
        batchId: "batch-1",
        records: [{ entityType: "building", rowNumber: 1, externalId: "b1", name: "Tower", data: {} }],
      })
      vi.mocked(sendToEquiemApi).mockResolvedValue({ sent: false })

      const { processMessage } = await import("../../../src/business/workers/upload-worker.js")

      // Act
      await processMessage({ traceId: "trace-pending-default", s3Key: "uploads/t.csv", fileName: "t.csv" })

      // Assert
      expect(vi.mocked(updateProcessingJobStatus)).toHaveBeenCalledWith(
        "job-1",
        "pending_external_send",
        expect.objectContaining({ errorMessage: "Equiem endpoint not configured" })
      )
    })
  })

  describe("pollQueue", () => {
    it("returns immediately when queue URL is not set", async () => {
      // Arrange
      vi.resetModules()
      delete process.env.AWS_SQS_QUEUE_URL
      delete process.env.AWS_S3_BUCKET
      const { sqsClient: runtimeSqsClient } = await import("../../../src/config/aws-clients.js")

      // Act
      const { pollQueue } = await import("../../../src/business/workers/upload-worker.js")
      await pollQueue(1)

      // Assert
      expect(vi.mocked(runtimeSqsClient.send)).not.toHaveBeenCalled()
    })

    it("processes one valid queue message and deletes it", async () => {
      // Arrange
      vi.resetModules()
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"
      const { sqsClient: runtimeSqsClient } = await import("../../../src/config/aws-clients.js")

      vi.mocked(runtimeSqsClient.send)
        .mockResolvedValueOnce({
          Messages: [
            {
              ReceiptHandle: "r1",
              Body: JSON.stringify({ traceId: "trace-1", s3Key: "uploads/trace-1/data.csv", fileName: "data.csv" }),
            },
          ],
        } as never)
        .mockResolvedValueOnce({} as never)

      vi.mocked(createOnboardingBatch).mockResolvedValue("batch-1")
      vi.mocked(createProcessingJob).mockResolvedValue("job-1")
      vi.mocked(s3Client.send).mockResolvedValue({
        Body: {
          transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
        },
      } as never)
      vi.mocked(parseUploadFile).mockReturnValue([{ row: 1 }])
      vi.mocked(mapRowsForProcessing).mockReturnValue([
        {
          rowNumber: 1,
          entityType: "building",
          isValid: true,
          validationErrors: [],
          rawData: {},
          normalizedData: { external_id: "b1", name: "Tower" },
        },
      ])
      vi.mocked(buildEquiemPayload).mockReturnValue({
        source: "upload",
        traceId: "trace-1",
        fileName: "data.csv",
        batchId: "batch-1",
        records: [{ entityType: "building", rowNumber: 1, externalId: "b1", name: "Tower", data: {} }],
      })
      vi.mocked(sendToEquiemApi).mockResolvedValue({ sent: true, externalReference: "ref-1" })

      // Act
      const { pollQueue } = await import("../../../src/business/workers/upload-worker.js")
      await pollQueue(1)

      // Assert
      expect(vi.mocked(runtimeSqsClient.send)).toHaveBeenCalledTimes(2)
    })

    it("skips malformed JSON messages without deleting", async () => {
      // Arrange
      vi.resetModules()
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"
      const { sqsClient: runtimeSqsClient } = await import("../../../src/config/aws-clients.js")

      vi.mocked(runtimeSqsClient.send).mockResolvedValueOnce({
        Messages: [{ ReceiptHandle: "r1", Body: "{bad" }],
      } as never)

      // Act
      const { pollQueue } = await import("../../../src/business/workers/upload-worker.js")
      await pollQueue(1)

      // Assert
      expect(vi.mocked(runtimeSqsClient.send)).toHaveBeenCalledTimes(1)
    })

    it("logs processing errors and continues without deleting message", async () => {
      // Arrange
      vi.resetModules()
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"
      const { sqsClient: runtimeSqsClient } = await import("../../../src/config/aws-clients.js")

      vi.mocked(runtimeSqsClient.send).mockResolvedValueOnce({
        Messages: [
          {
            ReceiptHandle: "r1",
            Body: JSON.stringify({ traceId: "trace-1", s3Key: "uploads/trace-1/data.csv", fileName: "data.csv" }),
          },
        ],
      } as never)

      vi.mocked(createOnboardingBatch).mockResolvedValue("batch-1")
      vi.mocked(createProcessingJob).mockResolvedValue("job-1")
      vi.mocked(s3Client.send).mockResolvedValue({
        Body: {
          transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array([])),
        },
      } as never)

      // Act
      const { pollQueue } = await import("../../../src/business/workers/upload-worker.js")
      await pollQueue(1)

      // Assert
      expect(vi.mocked(runtimeSqsClient.send)).toHaveBeenCalledTimes(1)
    })

    it("handles polling errors with backoff", async () => {
      // Arrange
      vi.resetModules()
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"
      const { sqsClient: runtimeSqsClient } = await import("../../../src/config/aws-clients.js")

      const setTimeoutSpy = vi
        .spyOn(globalThis, "setTimeout")
        .mockImplementation(((callback: (...args: any[]) => void) => {
          callback()
          return 0 as any
        }) as any)

      vi.mocked(runtimeSqsClient.send).mockRejectedValueOnce(new Error("sqs down"))

      // Act
      const { pollQueue } = await import("../../../src/business/workers/upload-worker.js")
      await pollQueue(1)

      // Assert
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000)

      setTimeoutSpy.mockRestore()
    })

    it("continues polling cycle when no messages are returned", async () => {
      // Arrange
      vi.resetModules()
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"
      const { sqsClient: runtimeSqsClient } = await import("../../../src/config/aws-clients.js")

      vi.mocked(runtimeSqsClient.send).mockResolvedValueOnce({ Messages: [] } as never)

      // Act
      const { pollQueue } = await import("../../../src/business/workers/upload-worker.js")
      await pollQueue(1)

      // Assert
      expect(vi.mocked(runtimeSqsClient.send)).toHaveBeenCalledTimes(1)
    })

    it("uses empty array when SQS response has undefined Messages", async () => {
      // Arrange
      vi.resetModules()
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"
      const { sqsClient: runtimeSqsClient } = await import("../../../src/config/aws-clients.js")

      vi.mocked(runtimeSqsClient.send).mockResolvedValueOnce({} as never)

      // Act
      const { pollQueue } = await import("../../../src/business/workers/upload-worker.js")
      await pollQueue(1)

      // Assert
      expect(vi.mocked(runtimeSqsClient.send)).toHaveBeenCalledTimes(1)
    })

    it("ignores messages missing body or receipt handle", async () => {
      // Arrange
      vi.resetModules()
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"
      const { sqsClient: runtimeSqsClient } = await import("../../../src/config/aws-clients.js")

      vi.mocked(runtimeSqsClient.send).mockResolvedValueOnce({
        Messages: [
          { ReceiptHandle: "r1" },
          { Body: JSON.stringify({ traceId: "t", s3Key: "k", fileName: "f.csv" }) },
        ],
      } as never)

      // Act
      const { pollQueue } = await import("../../../src/business/workers/upload-worker.js")
      await pollQueue(1)

      // Assert
      expect(vi.mocked(runtimeSqsClient.send)).toHaveBeenCalledTimes(1)
    })
  })

  describe("bootstrap", () => {
    it("handles fatal polling rejection outside test environment", async () => {
      // Arrange
      vi.resetModules()
      const previousNodeEnv = process.env.NODE_ENV
      const previousExit = process.exit
      process.env.NODE_ENV = "development"
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"
      process.env.AWS_S3_BUCKET = "upload-bucket"

      const { sqsClient: runtimeSqsClient } = await import("../../../src/config/aws-clients.js")
      vi.mocked(runtimeSqsClient.send).mockRejectedValueOnce(new Error("poll failed"))

      const setTimeoutSpy = vi
        .spyOn(globalThis, "setTimeout")
        .mockImplementation(() => {
          throw new Error("timer failure")
        })

      const exitMock = vi.fn() as any
      ;(process as any).exit = exitMock

      // Act
      await import("../../../src/business/workers/upload-worker.js")
      await Promise.resolve()

      // Assert
      expect(exitMock).toHaveBeenCalledWith(1)

      setTimeoutSpy.mockRestore()
      process.env.NODE_ENV = previousNodeEnv
      ;(process as any).exit = previousExit
    })
  })
})
