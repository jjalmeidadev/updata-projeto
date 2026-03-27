import { UploadEntity } from "../entities/upload-entity.ts"
import { UploadRowDto } from "../dto/upload-row-dto.ts"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { s3Client } from "../../config/aws-clients.ts"
import { enqueueUploadJob } from "../queue/upload-queue.ts"


// Creates normalized upload entities from parsed spreadsheet rows.

function mapRowsToEntities(
  rows: UploadRowDto[],
  traceId = "no-trace"
): UploadEntity[] {

  // Guard clause prevents from running with invalid input.
  if (rows == null || !Array.isArray(rows) || rows.length === 0) {
    console.log(`[FLOW][${traceId}] service:empty_rows`)
    throw new Error("No rows received")
  }

  console.log(`[FLOW][${traceId}] service:start rows=${rows.length}`)

  const entities = rows.map((row) => {
    const entity = new UploadEntity(row)
    entity.fields = entity.normalizeKeys()
    return entity
  })

  console.log(`[FLOW][${traceId}] service:entities_created count=${entities.length}`)

  return entities
}

interface UploadRequestFile {
  originalname: string
  buffer: Buffer
}

interface UploadProcessResult {
  s3Key: string
  fileName: string
}

function getContentType(fileName: string): string {
  const extension = fileName.toLowerCase().split(".").pop() || ""

  if (extension === "csv") {
    return "text/csv"
  }

  if (extension === "xlsx") {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  }

  if (extension === "xls") {
    return "application/vnd.ms-excel"
  }

  return "application/octet-stream"
}

async function processUploadFile(
  file: UploadRequestFile,
  traceId = "no-trace"
): Promise<UploadProcessResult> {
  const bucketName = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.AWS_S3_BUCKET

  const s3Key = `uploads/${traceId}/${file.originalname}`

  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: file.buffer,
    ContentType: getContentType(file.originalname),
  })

  await s3Client.send(putCommand)
  console.log(`[FLOW][${traceId}] service:s3_upload s3Key=${s3Key}`)

  await enqueueUploadJob(
    { s3Key, fileName: file.originalname },
    traceId
  )

  return {
    s3Key,
    fileName: file.originalname,
  }
}

export { mapRowsToEntities, processUploadFile }
export type { UploadRequestFile, UploadProcessResult }