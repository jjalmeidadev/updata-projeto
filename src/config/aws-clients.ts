import dotenv from "dotenv"
import { S3Client } from "@aws-sdk/client-s3"
import { SQSClient } from "@aws-sdk/client-sqs"

dotenv.config({ path: "config/.env" })

const env = ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}) as Record<
  string,
  string | undefined
>

const awsRegion = env.AWS_REGION || "us-east-1"

console.log("AWS_REGION:", awsRegion)
console.log("AWS_S3_BUCKET:", env.AWS_S3_BUCKET)
console.log("AWS_SQS_QUEUE_URL:", env.AWS_SQS_QUEUE_URL)

const s3Client = new S3Client({
  region: awsRegion
})

const sqsClient = new SQSClient({
  region: awsRegion
})

export { s3Client, sqsClient }
