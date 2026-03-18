import { Request, Response } from "express"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { s3Client } from "../../../config/aws-clients.ts"
import { enqueueUploadJob } from "../../../business/queue/upload-queue.ts"

function isUploadRowArray(payload: unknown): payload is UploadRowDto[] {

  if (!Array.isArray(payload)) {
    return false
  }

  return payload.every(
    (row) => typeof row === "object" && row !== null && !Array.isArray(row)
  )

}

export const handleUpload = async (
  req: Request,
  res: Response
): Promise<Response> => {

  const traceId = String(req.headers["x-debug-trace-id"] || `server-${Date.now()}`)
  res.setHeader("x-debug-trace-id", traceId)

  console.log(`[FLOW][${traceId}] controller:start upload`)

  try {

    const file = (req as any).file  // multer middleware

    if (!file) {
      return res.status(400).json({
        error: "Missing CSV file",
        traceId
      })
    }

    // Salvar CSV original no S3
    const s3Key = `uploads/${traceId}/${file.originalname}`
    
    const putCommand = new PutObjectCommand({
      Bucket: (globalThis as any).process?.env?.AWS_S3_BUCKET,
      Key: s3Key,
      Body: file.buffer,  // arquivo binário
      ContentType: "text/csv"
    })

    await s3Client.send(putCommand)
    console.log(`[FLOW][${traceId}] controller:s3_upload s3Key=${s3Key}`)

    // Enfileirar S3 key (não mais o JSON)
    await enqueueUploadJob(
      { s3Key, fileName: file.originalname },  // apenas metadados
      traceId
    )

    return res.json({
      redirect: "/form",
      s3Key,
      fileName: file.originalname,
      traceId
    })

  } catch (error) {
    console.error(`[FLOW][${traceId}] controller:error`, error)
    return res.status(500).json({
      error: "Error processing upload",
      traceId
    })
  }

}