import dotenv from "dotenv"
import { ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { s3Client, sqsClient } from "../../config/aws-clients.ts"
import { parseUploadFile } from "../services/upload-file-parser-service.ts"
import { mapRowsForProcessing, buildEquiemPayload } from "../services/upload-payload-mapper-service.ts"
import {
  createOnboardingBatch,
  createProcessingJob,
  createProcessingLog,
  saveOnboardingPayloads,
  saveOnboardingMappings,
  updateOnboardingBatchStatus,
  updateProcessingJobStatus,
} from "../../data/repositories/onboarding-repository.js"
import { sendToEquiemApi } from "../../data/integrations/equiem-api-client.js"

dotenv.config({ path: "config/.env" })

const env = process.env as Record<string, string | undefined>

const queueUrl = env.AWS_SQS_QUEUE_URL
const bucketName = env.AWS_S3_BUCKET

if (!queueUrl) {
  console.error("[WORKER] AWS_SQS_QUEUE_URL is not set; worker cannot start.")
}

if (!bucketName) {
  console.error("[WORKER] AWS_S3_BUCKET is not set; worker cannot start.")
}

interface UploadJobMessage {
  traceId: string
  s3Key: string
  fileName: string
}

interface EquiemResponseRecord {
  entityType: string
  externalId: string
  internalId: string
}

export async function processMessage(message: UploadJobMessage): Promise<void> {
  const traceId = message.traceId || `worker-${Date.now()}`
  let batchId = ""
  let jobId = ""

  if (!bucketName || !message.s3Key) {
    console.warn(`[FLOW][${traceId}] worker:invalid_payload`)
    return
  }

  try {
    batchId = await createOnboardingBatch({
      source: "upload",
      status: "queued",
      fileName: message.fileName,
      s3Key: message.s3Key,
      traceId,
    })

    jobId = await createProcessingJob({
      batchId,
      type: "upload_ingestion",
      status: "processing",
    })

    await createProcessingLog(jobId, "info", "Upload message received by worker")
    await updateOnboardingBatchStatus(batchId, "processing")

    console.log(`[FLOW][${traceId}] worker:s3_get_object s3Key=${message.s3Key}`)

    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: message.s3Key
    })

    const response = await s3Client.send(getCommand)
    const fileContent = await response.Body?.transformToByteArray()

    if (!fileContent || fileContent.length === 0) {
      throw new Error("Uploaded file content is empty")
    }

    console.log(`[FLOW][${traceId}] worker:file_downloaded s3Key=${message.s3Key}`)
    await createProcessingLog(jobId, "info", "File downloaded from S3")

    const rows = parseUploadFile(fileContent, message.fileName, traceId)

    if (rows.length === 0) {
      throw new Error("No data rows found in uploaded file")
    }

    const records = mapRowsForProcessing(rows, traceId)

    await saveOnboardingPayloads(
      batchId,
      records.map((record) => ({
        rowNumber: record.rowNumber,
        entityType: record.entityType,
        rawData: record.rawData,
        isValid: record.isValid,
        validationErrors: record.validationErrors,
      }))
    )

    const validRecords = records.filter((record) => record.isValid)
    const invalidRecords = records.filter((record) => !record.isValid)

    await createProcessingLog(
      jobId,
      "info",
      `Rows mapped. valid=${validRecords.length} invalid=${invalidRecords.length}`
    )

    if (validRecords.length === 0) {
      await updateProcessingJobStatus(jobId, "invalid", {
        errorMessage: "No valid rows after validation",
      })
      await updateOnboardingBatchStatus(batchId, "invalid", "No valid rows after validation")
      await createProcessingLog(jobId, "error", "Processing finished with no valid rows")
      return
    }

    const equiemPayload = buildEquiemPayload(validRecords, {
      traceId,
      fileName: message.fileName,
      batchId,
    })

    const equiemResult = await sendToEquiemApi(equiemPayload, traceId)

    if (!equiemResult.sent) {
      await updateProcessingJobStatus(jobId, "pending_external_send", {
        errorMessage: equiemResult.reason || "Equiem endpoint not configured",
      })
      await updateOnboardingBatchStatus(batchId, "pending_external_send", equiemResult.reason)
      await createProcessingLog(jobId, "warn", "Payload prepared but external send was skipped")
      console.log(`[FLOW][${traceId}] worker:pending_external_send`)
      return
    }

    const mappingCandidates = (
      (equiemResult.responseBody as { mappings?: EquiemResponseRecord[] } | undefined)?.mappings || []
    ).filter((item) => Boolean(item.entityType && item.externalId && item.internalId))

    await saveOnboardingMappings(
      mappingCandidates.map((item) => ({
        entityType: item.entityType,
        externalId: item.externalId,
        internalId: item.internalId,
      }))
    )

    await updateProcessingJobStatus(jobId, "completed", {
      externalReference: equiemResult.externalReference,
    })
    await updateOnboardingBatchStatus(batchId, "completed")

    await createProcessingLog(jobId, "info", "Processing completed and payload sent to Equiem")

    console.log(`[FLOW][${traceId}] worker:processing_complete`)

  } catch (error) {
    console.error(`[FLOW][${traceId}] worker:processing_error`, error)
    const errorMessage = error instanceof Error ? error.message : "Unknown processing error"

    if (jobId) {
      await updateProcessingJobStatus(jobId, "failed", {
        errorMessage,
      })
      await createProcessingLog(jobId, "error", errorMessage)
    }

    if (batchId) {
      await updateOnboardingBatchStatus(batchId, "failed", errorMessage)
    }

    throw error // Re-throw para SQS retry
  }
}

export async function pollQueue(maxCycles = Number.POSITIVE_INFINITY): Promise<void> {
  if (!queueUrl) {
    console.error("[WORKER] Queue URL not set, cannot start polling")
    return
  }

  console.log(`[WORKER] Starting SQS long polling on ${queueUrl}`)

  let cycle = 0

  while (cycle < maxCycles) {
    cycle += 1
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 5,
        WaitTimeSeconds: 20
      })

      const response = await sqsClient.send(command)
      const messages = response.Messages || []

      if (messages.length === 0) {
        continue
      }

      for (const msg of messages) {
        const receiptHandle = msg.ReceiptHandle
        const body = msg.Body

        if (!body || !receiptHandle) {
          continue
        }

        let parsed: UploadJobMessage

        try {
          parsed = JSON.parse(body) as UploadJobMessage
        } catch (error) {
          console.error("[WORKER] Failed to parse message body", error)
          continue
        }

        try {
          await processMessage(parsed)

          const deleteCmd = new DeleteMessageCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: receiptHandle
          })

          await sqsClient.send(deleteCmd)
          console.log(`[FLOW][${parsed.traceId}] worker:message_deleted`)
        } catch (error) {
          console.error(`[WORKER] Error processing message`, error)
          // Em produção: usar dead-letter queue ou retry logic
        }
      }
    } catch (error) {
      console.error("[WORKER] Error polling SQS", error)
      // Backoff exponencial em produção
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
}

if (process.env.NODE_ENV !== "test") {
  pollQueue().catch((error) => {
    console.error("[WORKER] Fatal error", error)
    process.exit(1)
  })
}
