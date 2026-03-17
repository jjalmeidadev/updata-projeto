import dotenv from "dotenv"
import { ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { s3Client, sqsClient } from "../../config/aws-clients.ts"

// Worker simples que consome mensagens da SQS e grava um snapshot
// do payload normalizado em um bucket S3 para processamento assíncrono.

dotenv.config({ path: "config/.env" })

const env = ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}) as Record<
  string,
  string | undefined
>

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
  rows: Record<string, unknown>[]
}

async function processMessage(message: UploadJobMessage): Promise<void> {
  const traceId = message.traceId || `worker-${Date.now()}`

  if (!bucketName) {
    console.warn(`[FLOW][${traceId}] worker:missing_bucket AWS_S3_BUCKET not set`)
    return
  }

  const key = `uploads/${traceId}-${Date.now()}.json`
  const body = JSON.stringify({
    traceId,
    rows: message.rows
  })

  console.log(`[FLOW][${traceId}] worker:s3_put_object bucket=${bucketName} key=${key}`)

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: "application/json"
  })

  await s3Client.send(command)

  console.log(`[FLOW][${traceId}] worker:s3_put_object_success`)
}

async function pollQueue(): Promise<void> {
  if (!queueUrl) {
    return
  }

  console.log(`[WORKER] Starting SQS long polling on ${queueUrl}`)

  // Loop simples; em produção, considerar backoff/exponencial e sinais de parada.
  // Aqui é suficiente para demonstração do fluxo assíncrono.

  // eslint-disable-next-line no-constant-condition
  while (true) {
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
        } catch (error) {
          console.error("[WORKER] Error processing message", error)
        }
      }
    } catch (error) {
      console.error("[WORKER] Error polling SQS", error)
    }
  }
}

// Inicia o worker sempre que este arquivo é executado via `tsx`.
pollQueue().catch((error) => {
  console.error("[WORKER] Fatal error", error)
  process.exit(1)
})
