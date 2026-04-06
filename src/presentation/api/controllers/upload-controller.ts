import { Request, Response } from "express"
import { processUploadFile } from "../../../business/services/upload-service.js"

export const handleUpload = async (
  req: Request,
  res: Response
): Promise<Response> => {

  const traceId = String(req.headers["x-debug-trace-id"] || `server-${Date.now()}`)
  res.setHeader("x-debug-trace-id", traceId)

  console.log(`[FLOW][${traceId}] controller:start upload`)

  try {

    const file = req.file
    const linkTokenHeader = req.headers["x-onboarding-link-token"]
    const linkTokenFromHeader = typeof linkTokenHeader === "string" ? linkTokenHeader.trim() : ""
    const linkTokenFromBody = typeof req.body?.linkToken === "string" ? req.body.linkToken.trim() : ""
    const linkToken = linkTokenFromBody || linkTokenFromHeader || undefined

    const companyNameHeader = req.headers["x-onboarding-company-name"]
    const companyName = typeof companyNameHeader === "string" ? companyNameHeader.trim() : undefined

    if (!file) {
      return res.status(400).json({
        error: "Missing upload file",
        traceId
      })
    }

    const result = await processUploadFile(file, traceId, { linkToken, companyName })

    return res.json({
      redirect: "/form",
      s3Key: result.s3Key,
      fileName: result.fileName,
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