import { SendMessageCommand } from "@aws-sdk/client-sqs"
import { sqsClient } from "../../config/aws-clients.ts"

type MessageVersion = "v1"
type MessageType = "upload.stage1" | "upload.stage2.chunk"

interface QueueEnvelope<T> {
  version: MessageVersion
  type: MessageType
  emittedAt: string
  traceId: string
  payload: T
  retryAttempt?: number
  retryDeadline?: string
}

interface Stage1Payload {
  traceId: string
  s3Key: string
  fileName: string
  linkToken?: string
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

const MAX_RETRY_ATTEMPTS = 3

function getEnv(name: string): string | undefined {
  return (globalThis as any).process?.env?.[name] as string | undefined
}

// Retry com exponential backoff: 1s, 3s, 9s
function getRetryDelayMs(attemptNumber: number): number {
  if (attemptNumber <= 0) return 0
  return Math.pow(3, attemptNumber - 1) * 1000
}

async function sendEnvelope<T>(queueUrl: string, envelope: QueueEnvelope<T>, retryAttempt = 0, traceId = "no-trace"): Promise<void> {
  if (retryAttempt > MAX_RETRY_ATTEMPTS) {
    console.error(`[FLOW][${traceId}] queue:max_retries_exceeded attempts=${retryAttempt}`)
    return
  }

  try {
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(envelope),
      // DelaySeconds configura o backoff nativo do SQS
      DelaySeconds: Math.min(900, Math.ceil(getRetryDelayMs(retryAttempt) / 1000)), // max 900s no SQS
    })

    await sqsClient.send(command)
    console.log(`[FLOW][${traceId}] queue:message_sent attempt=${retryAttempt + 1}/${MAX_RETRY_ATTEMPTS + 1}`)
  } catch (err) {
    const delay = getRetryDelayMs(retryAttempt + 1)
    console.warn(`[FLOW][${traceId}] queue:send_failed attempt=${retryAttempt + 1} nextRetryMs=${delay}`, err)

    if (retryAttempt < MAX_RETRY_ATTEMPTS) {
      // Retry automático local
      await new Promise((resolve) => setTimeout(resolve, delay))
      console.log(`[FLOW][${traceId}] queue:retry_attempt=${retryAttempt + 2}`)
      await sendEnvelope(queueUrl, envelope, retryAttempt + 1, traceId)
    } else {
      console.error(`[FLOW][${traceId}] queue:final_failure message_will_be_lost payload=${JSON.stringify(envelope)}`)
      throw err // Deixa falhar para DLQ capturar se SQS DLQ estiver configurado
    }
  }
}

async function enqueueStage1UploadJob(
  metadata: { s3Key: string; fileName: string; linkToken?: string },
  traceId = "no-trace"
): Promise<void> {
  const queueUrl = getEnv("AWS_SQS_QUEUE_URL")

  if (!queueUrl) {
    console.warn(`[FLOW][${traceId}] queue:missing_queue_url AWS_SQS_QUEUE_URL not set`)
    return
  }

  const payload: Stage1Payload = {
    traceId,
    s3Key: metadata.s3Key,
    fileName: metadata.fileName,
    linkToken: metadata.linkToken,
  }

  const envelope: QueueEnvelope<Stage1Payload> = {
    version: "v1",
    type: "upload.stage1",
    emittedAt: new Date().toISOString(),
    traceId,
    payload,
    retryAttempt: 0,
    retryDeadline: new Date(Date.now() + 300000).toISOString(), // 5 min deadline
  }

  console.log(`[FLOW][${traceId}] queue:enqueue_stage1 queueUrl=${queueUrl}`)
  await sendEnvelope(queueUrl, envelope, 0, traceId)
}

async function enqueueStage2ChunkJob(message: Stage2ChunkPayload): Promise<void> {
  const queueUrl = getEnv("AWS_SQS_CHUNK_QUEUE_URL") || getEnv("AWS_SQS_QUEUE_URL")

  if (!queueUrl) {
    console.warn(`[FLOW][${message.traceId}] queue:missing_chunk_queue_url`)
    return
  }

  const envelope: QueueEnvelope<Stage2ChunkPayload> = {
    version: "v1",
    type: "upload.stage2.chunk",
    emittedAt: new Date().toISOString(),
    traceId: message.traceId,
    payload: message,
    retryAttempt: 0,
    retryDeadline: new Date(Date.now() + 600000).toISOString(), // 10 min deadline
  }

  console.log(`[FLOW][${message.traceId}] queue:enqueue_stage2 chunkIndex=${message.chunkIndex} queueUrl=${queueUrl}`)
  await sendEnvelope(queueUrl, envelope, 0, message.traceId)
  console.log(`[FLOW][${message.traceId}] queue:stage2_enqueued chunkIndex=${message.chunkIndex}`)
}

// Compatibilidade com o controller atual
async function enqueueUploadJob(
  metadata: { s3Key: string; fileName: string; linkToken?: string },
  traceId = "no-trace"
): Promise<void> {
  await enqueueStage1UploadJob(metadata, traceId)
}

export {
  enqueueUploadJob,
  enqueueStage1UploadJob,
  enqueueStage2ChunkJob,
}
export type { Stage2ChunkPayload }
