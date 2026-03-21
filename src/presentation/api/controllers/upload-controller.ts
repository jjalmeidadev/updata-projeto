import { Request, Response } from "express"
import { UploadRowDto } from "../../../business/dto/upload-row-dto.js"
import { mapRowsToEntities } from "../../../business/services/upload-service.js"

function isUploadRowArray(payload: unknown): payload is UploadRowDto[] {

  if (!Array.isArray(payload)) {
    return false
  }

  return payload.every(
    (row) => typeof row === "object" && row !== null && !Array.isArray(row)
  )

}


// Validates upload payload and returns normalized rows for the next onboarding step.

export const handleUpload = async (
  req: Request,
  res: Response
): Promise<Response> => {

  // Every request gets a trace id so logs from controller and service can be correlated.
  const traceId = String(req.headers["x-debug-trace-id"] || `server-${Date.now()}`)
  res.setHeader("x-debug-trace-id", traceId)

  console.log(`[FLOW][${traceId}] controller:start upload`)

  try {

    // Expected contract: { rows: [...] }
    const rows = req.body?.rows as unknown

    // Reject early when the request body does not satisfy the upload contract.
    if (!isUploadRowArray(rows) || rows.length === 0) {
      console.log(`[FLOW][${traceId}] controller:missing_rows`)
      return res.status(400).json({
        error: "Missing rows payload",
        traceId
      })
    }

    const entities = mapRowsToEntities(rows, traceId)

    console.log(`[FLOW][${traceId}] controller:entities_processed count=${entities.length}`)

    // Only normalized field payload is returned to the UI for the next step.
    return res.json({
      redirect: "/form",
      data: entities.map((entity) => entity.fields),
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