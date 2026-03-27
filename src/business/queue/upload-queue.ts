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

function getEnv(name: string): string | undefined {
  return (globalThis as any).process?.env?.[name] as string | undefined
}

async function sendEnvelope<T>(queueUrl: string, envelope: QueueEnvelope<T>): Promise<void> {
  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(envelope),
  })

  await sqsClient.send(command)
}

async function enqueueStage1UploadJob(
  metadata: { s3Key: string; fileName: string },
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
  }

  const envelope: QueueEnvelope<Stage1Payload> = {
    version: "v1",
    type: "upload.stage1",
    emittedAt: new Date().toISOString(),
    traceId,
    payload,
  }

  console.log(`[FLOW][${traceId}] queue:send_stage1 queueUrl=${queueUrl}`)
  await sendEnvelope(queueUrl, envelope)
  console.log(`[FLOW][${traceId}] queue:stage1_enqueued`)
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
  }

  console.log(`[FLOW][${message.traceId}] queue:send_stage2 chunkIndex=${message.chunkIndex} queueUrl=${queueUrl}`)
  await sendEnvelope(queueUrl, envelope)
  console.log(`[FLOW][${message.traceId}] queue:stage2_enqueued chunkIndex=${message.chunkIndex}`)
}

// Compatibilidade com o controller atual
async function enqueueUploadJob(
  metadata: { s3Key: string; fileName: string },
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
