import { Request, Response } from "express"
import { UploadRowDto } from "../../../business/dto/upload-row-dto.ts"
import { mapRowsToEntities } from "../../../business/services/upload-service.ts"
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

    const rows = req.body?.rows as unknown

    if (!isUploadRowArray(rows) || rows.length === 0) {
      console.log(`[FLOW][${traceId}] controller:missing_rows`)
      return res.status(400).json({
        error: "Missing rows payload",
        traceId
      })
    }

    const entities = mapRowsToEntities(rows, traceId)

    console.log(`[FLOW][${traceId}] controller:entities_processed count=${entities.length}`)

    const normalizedRows = entities.map((entity) => entity.fields)

    try {
      await enqueueUploadJob(normalizedRows, traceId)
    } catch (queueError) {
      console.error(`[FLOW][${traceId}] controller:queue_error`, queueError)
    }

    return res.json({
      redirect: "/form",
      data: normalizedRows,
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