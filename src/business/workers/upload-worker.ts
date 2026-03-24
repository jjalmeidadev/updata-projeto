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
  createProcessingChunks,
  claimProcessingChunk,
  completeProcessingChunk,
  failProcessingChunk,
  getChunkSummary,
  markBatchAsFinalizing,
  listBatchRawRows,
  getLatestProcessingJobIdByBatch,
} from "../../data/repositories/onboarding-repository.js"
import { sendToEquiemApi } from "../../data/integrations/equiem-api-client.js"
import { enqueueStage2ChunkJob } from "../queue/upload-queue.ts"

dotenv.config({ path: "config/.env" })

const env = ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}) as Record<
  string,
  string | undefined
>

const queueUrl = env.AWS_SQS_QUEUE_URL
const bucketName = env.AWS_S3_BUCKET
const processingBatchSize = Math.max(1, Number(env.PROCESSING_BATCH_SIZE || "500"))
const processingBatchSizeVersion = env.PROCESSING_BATCH_SIZE_VERSION || "pbs-v1"

if (!queueUrl) {
  console.error("[WORKER] AWS_SQS_QUEUE_URL is not set; worker cannot start.")
}

if (!bucketName) {
  console.error("[WORKER] AWS_S3_BUCKET is not set; worker cannot start.")
}

interface IncomingEnvelope {
  version: string
  type: string
  emittedAt?: string
  traceId?: string
  payload?: unknown
}

interface Stage1Payload {
  traceId: string
  s3Key: string
  fileName: string
}

interface Stage2ChunkPayload {
  batchId: string
  traceId: string
  s3Key: string
  fileName: string
  chunkIndex: number
  offset: number
  size: number
  processingBatchSizeVersion: string
}

interface EquiemResponseRecord {
  entityType: string
  externalId: string
  internalId: string
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isStage1Payload(value: unknown): value is Stage1Payload {
  return Boolean(
    isObject(value) &&
      typeof value.traceId === "string" &&
      typeof value.s3Key === "string" &&
      typeof value.fileName === "string"
  )
}

function isStage2ChunkPayload(value: unknown): value is Stage2ChunkPayload {
  return Boolean(
    isObject(value) &&
      typeof value.batchId === "string" &&
      typeof value.traceId === "string" &&
      typeof value.s3Key === "string" &&
      typeof value.fileName === "string" &&
      typeof value.chunkIndex === "number" &&
      typeof value.offset === "number" &&
      typeof value.size === "number" &&
      typeof value.processingBatchSizeVersion === "string"
  )
}

function parseIncomingMessage(raw: string): IncomingEnvelope {
  const parsed = JSON.parse(raw)

  // backward compatibility: mensagem legada sem envelope
  if (isStage1Payload(parsed)) {
    return {
      version: "v1",
      type: "upload.stage1",
      emittedAt: new Date().toISOString(),
      traceId: parsed.traceId,
      payload: parsed,
    }
  }

  if (!isObject(parsed) || typeof parsed.version !== "string" || typeof parsed.type !== "string") {
    throw new Error("Invalid message format")
  }

  return {
    version: parsed.version,
    type: parsed.type,
    emittedAt: typeof parsed.emittedAt === "string" ? parsed.emittedAt : undefined,
    traceId: typeof parsed.traceId === "string" ? parsed.traceId : undefined,
    payload: parsed.payload,
  }
}

function buildChunks(totalRows: number, batchSize: number): Array<{ chunkIndex: number; offset: number; size: number }> {
  const chunks: Array<{ chunkIndex: number; offset: number; size: number }> = []
  let chunkIndex = 0

  for (let offset = 0; offset < totalRows; offset += batchSize) {
    const size = Math.min(batchSize, totalRows - offset)
    chunks.push({ chunkIndex, offset, size })
    chunkIndex += 1
  }

  return chunks
}

async function processStage1Splitter(message: Stage1Payload): Promise<void> {
  const traceId = message.traceId || `worker-${Date.now()}`
  let batchId = ""
  let jobId = ""

  if (!bucketName || !message.s3Key) {
    console.warn(`[FLOW][${traceId}] worker:invalid_stage1_payload`)
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

    await createProcessingLog(jobId, "info", "Stage1 received by splitter")
    await updateOnboardingBatchStatus(batchId, "processing")

    console.log(`[FLOW][${traceId}] splitter:s3_get_object s3Key=${message.s3Key}`)

    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: message.s3Key,
    })

    const response = await s3Client.send(getCommand)
    const fileContent = await response.Body?.transformToByteArray()

    if (!fileContent || fileContent.length === 0) {
      throw new Error("Uploaded file content is empty")
    }

    const rows = parseUploadFile(fileContent, message.fileName, traceId)
    if (rows.length === 0) {
      throw new Error("No data rows found in uploaded file")
    }

    const chunks = buildChunks(rows.length, processingBatchSize)
    await createProcessingChunks(batchId, chunks)

    for (const chunk of chunks) {
      await enqueueStage2ChunkJob({
        batchId,
        traceId,
        s3Key: message.s3Key,
        fileName: message.fileName,
        chunkIndex: chunk.chunkIndex,
        offset: chunk.offset,
        size: chunk.size,
        processingBatchSizeVersion,
      })
    }

    await createProcessingLog(
      jobId,
      "info",
      `Splitter queued chunks totalRows=${rows.length} totalChunks=${chunks.length} batchSize=${processingBatchSize}`
    )

    console.log(`[FLOW][${traceId}] splitter:chunks_enqueued total=${chunks.length}`)
  } catch (error) {
    console.error(`[FLOW][${traceId}] splitter:error`, error)
    const errorMessage = error instanceof Error ? error.message : "Unknown splitter error"

    if (jobId) {
      await updateProcessingJobStatus(jobId, "failed", { errorMessage })
      await createProcessingLog(jobId, "error", errorMessage)
    }

    if (batchId) {
      await updateOnboardingBatchStatus(batchId, "failed", errorMessage)
    }

    throw error
  }
}

async function finalizeBatchIfTerminal(input: {
  batchId: string
  traceId: string
  fileName: string
}): Promise<void> {
  const summary = await getChunkSummary(input.batchId)

  if (summary.totalChunks === 0) {
    return
  }

  const isTerminal = summary.completedChunks + summary.failedChunks === summary.totalChunks
  if (!isTerminal) {
    return
  }

  const acquired = await markBatchAsFinalizing(input.batchId)
  if (!acquired) {
    return
  }

  const jobId = await getLatestProcessingJobIdByBatch(input.batchId)

  if (summary.failedChunks > 0) {
    const msg = `Chunk processing finished with failures completed=${summary.completedChunks} failed=${summary.failedChunks}`
    if (jobId) {
      await updateProcessingJobStatus(jobId, "failed", { errorMessage: msg })
      await createProcessingLog(jobId, "error", msg)
    }
    await updateOnboardingBatchStatus(input.batchId, "failed", msg)
    return
  }

  const rawRows = await listBatchRawRows(input.batchId)
  const rowsForMapper = rawRows.map((row) => row.rawData)

  const records = mapRowsForProcessing(rowsForMapper, `${input.traceId}-finalize`)
  const validRecords = records.filter((record) => record.isValid)

  if (validRecords.length === 0) {
    if (jobId) {
      await updateProcessingJobStatus(jobId, "invalid", { errorMessage: "No valid rows after chunk processing" })
      await createProcessingLog(jobId, "error", "No valid rows after chunk processing")
    }
    await updateOnboardingBatchStatus(input.batchId, "invalid", "No valid rows after chunk processing")
    return
  }

  const equiemPayload = buildEquiemPayload(validRecords, {
    traceId: input.traceId,
    fileName: input.fileName,
    batchId: input.batchId,
  })

  const equiemResult = await sendToEquiemApi(equiemPayload, `${input.traceId}-finalize`)

  if (!equiemResult.sent) {
    if (jobId) {
      await updateProcessingJobStatus(jobId, "pending_external_send", {
        errorMessage: equiemResult.reason || "Equiem endpoint not configured",
      })
      await createProcessingLog(jobId, "warn", "Final payload prepared but external send was skipped")
    }
    await updateOnboardingBatchStatus(input.batchId, "pending_external_send", equiemResult.reason)
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

  if (jobId) {
    await updateProcessingJobStatus(jobId, "completed", { externalReference: equiemResult.externalReference })
    await createProcessingLog(jobId, "info", "Finalization completed and payload sent once")
  }
  await updateOnboardingBatchStatus(input.batchId, "completed")
}

async function processChunkMessage(message: Stage2ChunkPayload): Promise<void> {
  const traceId = `${message.traceId}-chunk-${message.chunkIndex}`

  if (!bucketName) {
    console.warn(`[FLOW][${traceId}] worker:missing_bucket`)
    return
  }

  const claimed = await claimProcessingChunk(message.batchId, message.chunkIndex)
  if (!claimed) {
    console.log(`[FLOW][${traceId}] worker:chunk_not_claimed batchId=${message.batchId} chunkIndex=${message.chunkIndex}`)
    return
  }

  try {
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: message.s3Key,
    })

    const response = await s3Client.send(getCommand)
    const fileContent = await response.Body?.transformToByteArray()

    if (!fileContent || fileContent.length === 0) {
      throw new Error("Uploaded file content is empty")
    }

    const rows = parseUploadFile(fileContent, message.fileName, traceId)
    const slicedRows = rows.slice(message.offset, message.offset + message.size)

    if (slicedRows.length === 0) {
      throw new Error(`Chunk slice empty offset=${message.offset} size=${message.size}`)
    }

    const records = mapRowsForProcessing(slicedRows, traceId)

    await saveOnboardingPayloads(
      message.batchId,
      records.map((record) => ({
        rowNumber: record.rowNumber + message.offset,
        entityType: record.entityType,
        rawData: record.rawData,
        isValid: record.isValid,
        validationErrors: record.validationErrors,
      }))
    )

    await completeProcessingChunk(message.batchId, message.chunkIndex)

    const jobId = await getLatestProcessingJobIdByBatch(message.batchId)
    if (jobId) {
      const validCount = records.filter((record) => record.isValid).length
      const invalidCount = records.length - validCount
      await createProcessingLog(
        jobId,
        "info",
        `Chunk completed chunkIndex=${message.chunkIndex} offset=${message.offset} size=${message.size} valid=${validCount} invalid=${invalidCount}`
      )
    }

    await finalizeBatchIfTerminal({
      batchId: message.batchId,
      traceId: message.traceId,
      fileName: message.fileName,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown chunk error"
    await failProcessingChunk(message.batchId, message.chunkIndex, errorMessage)

    const jobId = await getLatestProcessingJobIdByBatch(message.batchId)
    if (jobId) {
      await createProcessingLog(jobId, "error", `Chunk failed chunkIndex=${message.chunkIndex} error=${errorMessage}`)
    }

    await finalizeBatchIfTerminal({
      batchId: message.batchId,
      traceId: message.traceId,
      fileName: message.fileName,
    })

    throw error
  }
}

async function pollQueue(): Promise<void> {
  if (!queueUrl) {
    console.error("[WORKER] Queue URL not set, cannot start polling")
    return
  }

  console.log(`[WORKER] Starting SQS long polling on ${queueUrl}`)

  while (true) {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 5,
        WaitTimeSeconds: 20,
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

        let envelope: IncomingEnvelope

        try {
          envelope = parseIncomingMessage(body)
        } catch (error) {
          console.error("[WORKER] Failed to parse message body", error)
          continue
        }

        const traceId = typeof envelope.traceId === "string" ? envelope.traceId : "no-trace"

        try {
          if (envelope.version !== "v1") {
            console.warn(`[FLOW][${traceId}] worker:unsupported_version version=${String(envelope.version)}`)
            continue
          }

          if (envelope.type === "upload.stage1") {
            if (!isStage1Payload(envelope.payload)) {
              console.warn(`[FLOW][${traceId}] worker:invalid_stage1_payload`)
              continue
            }
            await processStage1Splitter(envelope.payload)
          } else if (envelope.type === "upload.stage2.chunk") {
            if (!isStage2ChunkPayload(envelope.payload)) {
              console.warn(`[FLOW][${traceId}] worker:invalid_stage2_payload`)
              continue
            }
            await processChunkMessage(envelope.payload)
          } else {
            console.warn(`[FLOW][${traceId}] worker:unknown_type type=${String(envelope.type)}`)
            continue
          }

          const deleteCmd = new DeleteMessageCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: receiptHandle,
          })

          await sqsClient.send(deleteCmd)
          console.log(`[FLOW][${traceId}] worker:message_deleted`)
        } catch (error) {
          console.error(`[WORKER] Error processing message traceId=${traceId}`, error)
        }
      }
    } catch (error) {
      console.error("[WORKER] Error polling SQS", error)
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
}

pollQueue().catch((error) => {
  console.error("[WORKER] Fatal error", error)
  process.exit(1)
})
