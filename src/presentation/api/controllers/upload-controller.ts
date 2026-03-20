import { Request, Response } from "express"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { s3Client } from "../../../config/aws-clients.ts"
import { enqueueUploadJob } from "../../../business/queue/upload-queue.ts"

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
        error: "Missing upload file",
        traceId
      })
    }

    // Salvar arquivo original no S3 para processamento assíncrono.
    const s3Key = `uploads/${traceId}/${file.originalname}`
    
    const putCommand = new PutObjectCommand({
      Bucket: (globalThis as any).process?.env?.AWS_S3_BUCKET,
      Key: s3Key,
      Body: file.buffer,
      ContentType: getContentType(file.originalname)
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