import { Request, Response } from "express"
import { resolveUserNavigation } from "../../../business/services/user-service.js"
import { resolveEmailClaim, resolveNameClaim } from "../auth-claims.js"

 // Handles authenticated user routing based on user email and company association.
export const getPayload = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // Use one trace id to correlate browser request logs with backend logs.
  const traceId = String(req.headers["x-debug-trace-id"] || `server-${Date.now()}`)
  const authHeader = req.headers.authorization || ""
  res.setHeader("x-debug-trace-id", traceId)

  console.log(`[FLOW][${traceId}] controller:start authHeaderPresent=${Boolean(authHeader)}`)

  try {

    const jwtPayload = req.auth?.payload as Record<string, unknown> | undefined

    const sub = typeof jwtPayload?.sub === "string" ? jwtPayload.sub : undefined

    if (!sub) {
      console.log(`[FLOW][${traceId}] controller:missing_sub`)
      return res.status(401).json({ error: "Invalid token payload", traceId })
    }

    const safeClaims = jwtPayload ?? {}
    const headerProfileName = typeof req.headers["x-profile-name"] === "string"
      ? req.headers["x-profile-name"].trim()
      : undefined
    const headerProfileEmail = typeof req.headers["x-profile-email"] === "string"
      ? req.headers["x-profile-email"].trim().toLowerCase()
      : undefined
    const name = resolveNameClaim(safeClaims) || (headerProfileName && headerProfileName.length > 0 ? headerProfileName : undefined)
    const claimEmail = resolveEmailClaim(safeClaims)
    const email = claimEmail || (headerProfileEmail && headerProfileEmail.includes("@") ? headerProfileEmail : undefined)

    console.log(
      `[FLOW][${traceId}] controller:claims keys=${Object.keys(safeClaims).slice(0, 12).join(",")} hasName=${Boolean(name)} hasEmail=${Boolean(email)}`
    )

    const payload = {
      sub,
      name,
      email,
    }

    const result = await resolveUserNavigation(payload, traceId)

    if (result.outcome === "monitoring") {
      return res.status(200).json({
        next: "/monitoring",
        traceId,
      })
    }

    if (result.outcome === "company" && result.companyId) {
      return res.status(200).json({
        next: `/company/${result.companyId}`,
        traceId,
      })
    }

    if (result.outcome === "not_found") {
      return res.status(404).json({
        error: "User not found",
        traceId,
      })
    }

    return res.status(403).json({
      error: "Company not registered",
      traceId,
    })
  } catch (error) {
    console.error(`[FLOW][${traceId}] controller:error`, error)

    return res.status(500).json({
      error: "Error processing user",
      traceId
    })

  }

}