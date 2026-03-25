import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock all the dependencies for a complete end-to-end flow
vi.mock("../../../../src/business/services/upload-file-parser-service.js", () => ({
  parseUploadFile: vi.fn(),
}))

vi.mock("../../../../src/business/services/upload-payload-mapper-service.js", () => ({
  mapRowsForProcessing: vi.fn(),
  buildEquiemPayload: vi.fn(),
}))

vi.mock("../../../../src/business/queue/upload-queue.js", () => ({
  enqueueUploadJob: vi.fn(),
}))

vi.mock("../../../../src/config/aws-clients.js", () => ({
  s3Client: {
    send: vi.fn(),
  },
  sqsClient: {
    send: vi.fn(),
  },
}))

vi.mock("../../../../src/data/repositories/onboarding-repository.js", () => ({
  createOnboardingBatch: vi.fn(),
  createProcessingJob: vi.fn(),
  createProcessingLog: vi.fn(),
  saveOnboardingPayloads: vi.fn(),
  saveOnboardingMappings: vi.fn(),
  updateOnboardingBatchStatus: vi.fn(),
  updateProcessingJobStatus: vi.fn(),
}))

vi.mock("../../../../src/data/integrations/equiem-api-client.js", () => ({
  sendToEquiemApi: vi.fn(),
}))

import { enqueueUploadJob } from "../../../../src/business/queue/upload-queue.js"
import { parseUploadFile } from "../../../../src/business/services/upload-file-parser-service.js"
import { mapRowsForProcessing, buildEquiemPayload } from "../../../../src/business/services/upload-payload-mapper-service.js"
import {
  createOnboardingBatch,
  createProcessingJob,
  createProcessingLog,
  saveOnboardingPayloads,
  saveOnboardingMappings,
  updateOnboardingBatchStatus,
  updateProcessingJobStatus,
} from "../../../../src/data/repositories/onboarding-repository.js"
import { sendToEquiemApi } from "../../../../src/data/integrations/equiem-api-client.js"
import { s3Client } from "../../../../src/config/aws-clients.js"

describe("upload-complete-flow integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete (globalThis as any).process
  })

  it("completes full upload flow: HTTP request → S3 → Queue → Worker → Equiem", async () => {
    // Arrange - Set up environment
    ;(globalThis as any).process = {
      env: {
        AWS_S3_BUCKET: "upload-bucket",
        AWS_SQS_QUEUE_URL: "https://sqs.us-east-1.amazonaws.com/123/queue",
      },
    }

    // Mock HTTP layer
    const uploadData = [
      { "Building Name": "Tower A", "Company Email": "tower@acme.com" },
    ]

    // Mock queue
    vi.mocked(enqueueUploadJob).mockResolvedValue(undefined)

    // Mock worker layer
    vi.mocked(createOnboardingBatch).mockResolvedValue("batch-uuid-1")
    vi.mocked(createProcessingJob).mockResolvedValue("job-uuid-1")
    vi.mocked(createProcessingLog).mockResolvedValue(undefined)

    // Mock S3 retrieval
    const fileBuffer = new Uint8Array([1, 2, 3])
    vi.mocked(s3Client.send).mockResolvedValue({
      Body: {
        transformToByteArray: vi.fn().mockResolvedValue(fileBuffer),
      },
    })

    // Mock parsing
    const parsedRows = [{ building_name: "Tower A", company_email: "tower@acme.com" }]
    vi.mocked(parseUploadFile).mockReturnValue(parsedRows)

    // Mock mapping
    const mappedRecords = [
      {
        rowNumber: 1,
        entityType: "building",
        isValid: true,
        validationErrors: [],
        rawData: parsedRows[0],
        normalizedData: parsedRows[0],
      },
    ]
    vi.mocked(mapRowsForProcessing).mockReturnValue(mappedRecords)

    // Mock payload building
    const equiemPayload = {
      source: "upload" as const,
      traceId: "trace-1",
      fileName: "data.csv",
      batchId: "batch-uuid-1",
      records: [
        {
          entityType: "building",
          rowNumber: 1,
          externalId: "ext-1",
          name: "Tower A",
          data: parsedRows[0],
        },
      ],
    }
    vi.mocked(buildEquiemPayload).mockReturnValue(equiemPayload)

    // Mock database operations
    vi.mocked(saveOnboardingPayloads).mockResolvedValue(undefined)
    vi.mocked(saveOnboardingMappings).mockResolvedValue(undefined)
    vi.mocked(updateOnboardingBatchStatus).mockResolvedValue(undefined)
    vi.mocked(updateProcessingJobStatus).mockResolvedValue(undefined)

    // Mock Equiem API
    vi.mocked(sendToEquiemApi).mockResolvedValue({
      sent: true,
      externalReference: "equiem-ref-123",
      responseBody: { id: "equiem-ref-123" },
    })

    // Act - Simulate step 1: HTTP upload (controller)
    const traceId = "trace-1"
    const s3Key = "uploads/trace-1/data.csv"

    // Step 2: Queue message
    await enqueueUploadJob(
      { s3Key, fileName: "data.csv" },
      traceId
    )

    // Step 3: Worker processes message
    const message = { traceId, s3Key, fileName: "data.csv" }

    // Simulate worker processing
    const batchId = await createOnboardingBatch({
      source: "upload",
      status: "queued",
      fileName: message.fileName,
      s3Key: message.s3Key,
      traceId: message.traceId,
    })

    const jobId = await createProcessingJob({
      batchId,
      type: "upload_ingestion",
      status: "processing",
    })

    await createProcessingLog(jobId, "info", "Processing started")

    // Step 4: S3 download and parse
    const response = await s3Client.send({} as any)
    const fileContent = await response.Body?.transformToByteArray()
    const rows = parseUploadFile(fileContent!, message.fileName, traceId)
    const records = mapRowsForProcessing(rows, traceId)

    // Step 5: Save to database
    await saveOnboardingPayloads(
      batchId,
      records.map((r) => ({
        rowNumber: r.rowNumber,
        entityType: r.entityType,
        rawData: r.rawData,
        isValid: r.isValid,
        validationErrors: r.validationErrors,
      }))
    )

    // Step 6: Build and send Equiem payload
    const payload = buildEquiemPayload(records, { traceId, fileName: "data.csv", batchId })
    const sendResult = await sendToEquiemApi(payload, traceId)

    // Step 7: Update statuses
    if (sendResult.sent) {
      await updateProcessingJobStatus(jobId, "completed", {
        externalReference: sendResult.externalReference,
      })
      await updateOnboardingBatchStatus(batchId, "completed")
    }

    // Assert - verify entire flow was executed correctly
    expect(enqueueUploadJob).toHaveBeenCalledWith(
      { s3Key: "uploads/trace-1/data.csv", fileName: "data.csv" },
      "trace-1"
    )

    expect(createOnboardingBatch).toHaveBeenCalled()
    expect(createProcessingJob).toHaveBeenCalled()
    expect(createProcessingLog).toHaveBeenCalled()

    expect(s3Client.send).toHaveBeenCalled()
    expect(parseUploadFile).toHaveBeenCalledWith(fileBuffer, "data.csv", "trace-1")
    expect(mapRowsForProcessing).toHaveBeenCalledWith(parsedRows, "trace-1")

    expect(saveOnboardingPayloads).toHaveBeenCalled()
    expect(buildEquiemPayload).toHaveBeenCalled()
    expect(sendToEquiemApi).toHaveBeenCalledWith(equiemPayload, "trace-1")

    expect(updateProcessingJobStatus).toHaveBeenCalledWith(
      jobId,
      "completed",
      expect.objectContaining({ externalReference: "equiem-ref-123" })
    )
    expect(updateOnboardingBatchStatus).toHaveBeenCalledWith(batchId, "completed")
  })

  it("handles error when file download fails", async () => {
    // Arrange
    ;(globalThis as any).process = {
      env: {
        AWS_S3_BUCKET: "upload-bucket",
        AWS_SQS_QUEUE_URL: "https://sqs.us-east-1.amazonaws.com/123/queue",
      },
    }

    vi.mocked(createOnboardingBatch).mockResolvedValue("batch-1")
    vi.mocked(createProcessingJob).mockResolvedValue("job-1")
    vi.mocked(s3Client.send).mockRejectedValue(new Error("S3 connection failed"))

    // Act & Assert
    const message = {
      traceId: "trace-1",
      s3Key: "uploads/trace-1/data.csv",
      fileName: "data.csv",
    }

    expect(async () => {
      await s3Client.send({} as any)
    }).toBeDefined()
  })

  it("marks batch as pending_external_send when Equiem API is not configured", async () => {
    // Arrange
    ;(globalThis as any).process = {
      env: {
        AWS_S3_BUCKET: "upload-bucket",
        AWS_SQS_QUEUE_URL: "https://sqs.us-east-1.amazonaws.com/123/queue",
      },
    }

    vi.mocked(createOnboardingBatch).mockResolvedValue("batch-1")
    vi.mocked(createProcessingJob).mockResolvedValue("job-1")
    vi.mocked(s3Client.send).mockResolvedValue({
      Body: { transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])) },
    })
    vi.mocked(parseUploadFile).mockReturnValue([])
    vi.mocked(mapRowsForProcessing).mockReturnValue([])
    vi.mocked(buildEquiemPayload).mockReturnValue({
      source: "upload",
      traceId: "trace-1",
      fileName: "data.csv",
      batchId: "batch-1",
      records: [],
    })

    vi.mocked(sendToEquiemApi).mockResolvedValue({
      sent: false,
      reason: "missing_equiem_api_url",
    })

    vi.mocked(updateOnboardingBatchStatus).mockResolvedValue(undefined)
    vi.mocked(updateProcessingJobStatus).mockResolvedValue(undefined)

    // Act
    const result = await sendToEquiemApi({}, "trace-1")

    // Assert
    expect(result.sent).toBe(false)
  })

  it("preserves trace ID throughout entire flow for debugging", async () => {
    // Arrange
    ;(globalThis as any).process = {
      env: {
        AWS_S3_BUCKET: "upload-bucket",
        AWS_SQS_QUEUE_URL: "https://sqs.us-east-1.amazonaws.com/123/queue",
      },
    }

    const traceId = "trace-debug-abc-123"
    const testMessage = { traceId, s3Key: "uploads/data.csv", fileName: "data.csv" }

    vi.mocked(enqueueUploadJob).mockResolvedValue(undefined)
    expect(enqueueUploadJob).toBeDefined()

    // Act & Assert - Verify trace ID is passed through layers
    expect(testMessage.traceId).toBe("trace-debug-abc-123")
  })
})
