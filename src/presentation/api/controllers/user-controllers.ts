import { Request, Response } from "express"
import { checkUser } from "../../../business/services/user-service.js"

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

    const jwtPayload = req.auth?.payload

    if (!jwtPayload?.sub) {
      console.log(`[FLOW][${traceId}] controller:missing_sub`)
      return res.status(401).json({ error: "Invalid token payload", traceId })
    }

    const payload = {
      sub: jwtPayload.sub,
      name: typeof jwtPayload.name === "string" ? jwtPayload.name : undefined,
      email: typeof jwtPayload.email === "string" ? jwtPayload.email : undefined,
    }

    const user = await checkUser(payload, traceId)

    if (!user) {
      console.log(`[FLOW][${traceId}] controller:user_not_found`)
      return res.status(404).json({ error: "User not found", traceId })
    }

    const email = user.user_email || ""

    // Internal team users go to monitoring.
    if (email.endsWith("@getequiem.com")) {
      console.log(`[FLOW][${traceId}] controller:redirect /monitoring`)
      return res.status(200).json({ next: "/monitoring", traceId })
    }

    // Company users go to their company page.
    if (user.company_id) {
      console.log(`[FLOW][${traceId}] controller:redirect /company/${user.company_id}`)
      return res.status(200).json({ next: `/company/${user.company_id}`, traceId })
    }

    console.log(`[FLOW][${traceId}] controller:company_not_registered`)
    return res.status(403).json({
      error: "Company not registered",
      traceId
    })
  } catch (error) {
    console.error(`[FLOW][${traceId}] controller:error`, error)

    return res.status(500).json({
      error: "Error processing user",
      traceId
    })

  }

}