import { Request, Response } from "express"
import { resolveUserNavigation } from "../../../business/services/user-service.js"

const claimNamespaces = [
  "https://updata.app",
  "https://api.updata.com",
]

function readStringClaim(payload: Record<string, unknown>, key: string): string | undefined {
  const direct = payload[key]

  if (typeof direct === "string") {
    const normalized = direct.trim()
    return normalized.length > 0 ? normalized : undefined
  }

  for (const namespace of claimNamespaces) {
    const namespaced = payload[`${namespace}/${key}`]

    if (typeof namespaced === "string") {
      const normalized = namespaced.trim()
      return normalized.length > 0 ? normalized : undefined
    }
  }

  const suffix = `/${key}`
  for (const claimKey of Object.keys(payload)) {
    if (!claimKey.endsWith(suffix)) {
      continue
    }

    const namespaced = payload[claimKey]
    if (typeof namespaced === "string") {
      const normalized = namespaced.trim()
      if (normalized.length > 0) {
        return normalized
      }
    }
  }

  return undefined
}

function resolveNameClaim(payload: Record<string, unknown>): string | undefined {
  const directName = readStringClaim(payload, "name")
  if (directName) {
    return directName
  }

  const givenName = readStringClaim(payload, "given_name")
  const familyName = readStringClaim(payload, "family_name")

  if (givenName && familyName) {
    return `${givenName} ${familyName}`.trim()
  }

  return givenName || familyName || readStringClaim(payload, "nickname") || readStringClaim(payload, "preferred_username")
}

function resolveEmailClaim(payload: Record<string, unknown>): string | undefined {
  return readStringClaim(payload, "email") || readStringClaim(payload, "upn")
}

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
    const name = resolveNameClaim(safeClaims) || (headerProfileName && headerProfileName.length > 0 ? headerProfileName : undefined)
    const email = resolveEmailClaim(safeClaims)

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