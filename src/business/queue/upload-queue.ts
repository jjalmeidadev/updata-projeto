import { SendMessageCommand } from "@aws-sdk/client-sqs"
import { sqsClient } from "../../config/aws-clients.ts"

interface UploadJobMessage {
  traceId: string
  s3Key: string
  fileName: string
}

// Enfileira um job de processamento de upload na AWS SQS.
// A fila é configurada via variável de ambiente AWS_SQS_QUEUE_URL.

async function enqueueUploadJob(
  metadata: { s3Key: string; fileName: string },
  traceId = "no-trace"
): Promise<void> {
  const queueUrl = (globalThis as any).process?.env?.AWS_SQS_QUEUE_URL as string | undefined

  if (!queueUrl) {
    console.warn(`[FLOW][${traceId}] queue:missing_queue_url AWS_SQS_QUEUE_URL not set`)
    return
  }

  const payload: UploadJobMessage = {
    traceId,
    s3Key: metadata.s3Key,
    fileName: metadata.fileName
  }

  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(payload)
  })

  console.log(`[FLOW][${traceId}] queue:send_message queueUrl=${queueUrl}`)

  await sqsClient.send(command)

  console.log(`[FLOW][${traceId}] queue:message_enqueued`)
}

export { enqueueUploadJob }
