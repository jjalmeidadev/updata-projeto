import dotenv from "dotenv"
import { ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { s3Client, sqsClient } from "../../config/aws-clients.ts"
import Papa from "papaparse"

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
  s3Key: string
  fileName: string
}

async function processMessage(message: UploadJobMessage): Promise<void> {
  const traceId = message.traceId || `worker-${Date.now()}`

  if (!bucketName || !message.s3Key) {
    console.warn(`[FLOW][${traceId}] worker:invalid_payload`)
    return
  }

  try {
    // 1. Baixar CSV do S3
    console.log(`[FLOW][${traceId}] worker:s3_get_object s3Key=${message.s3Key}`)

    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: message.s3Key
    })

    const response = await s3Client.send(getCommand)
    const csvContent = await response.Body?.transformToString()

    if (!csvContent) {
      throw new Error("CSV content is empty")
    }

    console.log(`[FLOW][${traceId}] worker:csv_downloaded s3Key=${message.s3Key}`)

    // 2. Parse CSV com papaparse
    const rows: Record<string, unknown>[] = await new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data as Record<string, unknown>[]),
        error: (error: Error) => reject(error)
      })
    })

    console.log(`[FLOW][${traceId}] worker:csv_parsed rows=${rows.length}`)

    // 3. Validar e normalizar (exemplo básico)
    const validRows = rows.filter((row) => {
      const hasData = Object.values(row).some((v) => v !== "" && v !== null && v !== undefined)
      return hasData
    })

    console.log(`[FLOW][${traceId}] worker:csv_validated validRows=${validRows.length}`)

    // 4. Aqui você pode gravar no banco, fazer outras operações, etc.
    // Por enquanto, vamos só logar que processou com sucesso
    console.log(`[FLOW][${traceId}] worker:processing_complete`)

  } catch (error) {
    console.error(`[FLOW][${traceId}] worker:processing_error`, error)
    throw error // Re-throw para SQS retry
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

pollQueue().catch((error) => {
  console.error("[WORKER] Fatal error", error)
  process.exit(1)
})
