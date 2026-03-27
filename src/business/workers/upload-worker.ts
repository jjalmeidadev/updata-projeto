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
const parsedWorkerBatchSize = Number.parseInt(env.WORKER_BATCH_SIZE || "5", 10)
const workerBatchSize = Number.isInteger(parsedWorkerBatchSize) && parsedWorkerBatchSize >= 1 && parsedWorkerBatchSize <= 10
  ? parsedWorkerBatchSize
  : 5
const benchmarkSkipExternalSend = env.BENCHMARK_SKIP_EXTERNAL_SEND === "true"

if (!Number.isInteger(parsedWorkerBatchSize) || parsedWorkerBatchSize < 1 || parsedWorkerBatchSize > 10) {
  console.error("[WORKER] WORKER_BATCH_SIZE must be an integer between 1 and 10.")
}

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

interface QueueEnvelope {
  version?: string
  type?: string
  emittedAt?: string
  traceId?: string
  payload?: unknown
}

interface EquiemResponseRecord {
  entityType: string
  externalId: string
  internalId: string
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isUploadJobMessage(value: unknown): value is UploadJobMessage {
  return Boolean(
    isObject(value) &&
      typeof value.traceId === "string" &&
      typeof value.s3Key === "string" &&
      typeof value.fileName === "string"
  )
}

function parseIncomingUploadMessage(body: string): UploadJobMessage | null {
  const parsed = JSON.parse(body) as unknown

  // Formato legado: payload direto
  if (isUploadJobMessage(parsed)) {
    return parsed
  }

  // Formato novo: envelope v1
  if (isObject(parsed)) {
    const envelope = parsed as QueueEnvelope

    if (envelope.version === "v1" && envelope.type === "upload.stage1" && isUploadJobMessage(envelope.payload)) {
      return envelope.payload
    }
  }

  return null
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

    if (benchmarkSkipExternalSend) {
      await updateProcessingJobStatus(jobId, "completed")
      await updateOnboardingBatchStatus(batchId, "completed")
      await createProcessingLog(jobId, "warn", "Benchmark mode: external send skipped")
      console.log(`[FLOW][${traceId}] worker:benchmark_skip_external_send`)
    } else {
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
    }

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
        MaxNumberOfMessages: workerBatchSize,
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

        let parsed: UploadJobMessage | null = null

        try {
          parsed = parseIncomingUploadMessage(body)
        } catch (error) {
          console.error("[WORKER] Failed to parse message body", error)
          continue
        }

        if (!parsed) {
          console.warn("[WORKER] Unsupported/invalid message format")
          continue
        }

        try {
          await processMessage(parsed)
          await sqsClient.send(
            new DeleteMessageCommand({
              QueueUrl: queueUrl,
              ReceiptHandle: receiptHandle,
            })
          )
          console.log(`[FLOW][${parsed.traceId || "no-trace"}] worker:message_deleted`)
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
