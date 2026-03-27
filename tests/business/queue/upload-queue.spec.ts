import { describe, it, expect, beforeEach, vi } from "vitest"
import { enqueueUploadJob } from "../../../src/business/queue/upload-queue.js"

vi.mock("../../../src/config/aws-clients.js", () => ({
  sqsClient: {
    send: vi.fn(),
  },
}))

import { sqsClient } from "../../../src/config/aws-clients.js"

describe("upload-queue", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.AWS_SQS_QUEUE_URL
  })

  describe("enqueueUploadJob", () => {
    it("sends message to SQS with correct payload structure", async () => {
      // Arrange
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/upload-queue"

      const metadata = { s3Key: "uploads/trace-1/data.csv", fileName: "data.csv" }
      const traceId = "trace-1"

      // Act
      await enqueueUploadJob(metadata, traceId)

      // Assert
      expect(vi.mocked(sqsClient.send)).toHaveBeenCalledTimes(1)
      const command = vi.mocked(sqsClient.send).mock.calls[0][0]
      expect(command).toBeDefined()
    })

    it("warns and returns early when AWS_SQS_QUEUE_URL is not set", async () => {
      // Arrange
      delete process.env.AWS_SQS_QUEUE_URL
      const metadata = { s3Key: "uploads/trace-1/data.csv", fileName: "data.csv" }
      const traceId = "trace-1"

      // Act
      await enqueueUploadJob(metadata, traceId)

      // Assert
      expect(vi.mocked(sqsClient.send)).not.toHaveBeenCalled()
    })

    it("uses default trace ID when not provided", async () => {
      // Arrange
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"

      const metadata = { s3Key: "uploads/data.csv", fileName: "data.csv" }

      // Act
      await enqueueUploadJob(metadata)

      // Assert
      expect(vi.mocked(sqsClient.send)).toHaveBeenCalledTimes(1)
    })

    it("includes metadata in SQS message payload", async () => {
      // Arrange
      process.env.AWS_SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/queue"

      const metadata = { s3Key: "uploads/trace-1/data.csv", fileName: "data.csv" }
      const traceId = "trace-1"

      // Act
      await enqueueUploadJob(metadata, traceId)

      // Assert
      expect(vi.mocked(sqsClient.send)).toHaveBeenCalled()
    })
  })
})
