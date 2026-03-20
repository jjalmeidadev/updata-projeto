import { findUser, createUser, findCompanyByDomain } from "../../data/repositories/user-repository.js"
import { UserEntity } from "../entities/user-entity.js"

interface AuthPayload {
  sub: string
  name?: string
  email?: string
}

interface UserRecord {
  user_id: string
  user_name: string
  user_email: string
  auth0_id: string
  company_id: string | null
}

// Ensures the authenticated user exists and is linked to a company when possible.

async function checkUser(
  payload: AuthPayload | undefined,
  traceId = "no-trace"
): Promise<UserRecord> {
  console.log(`[FLOW][${traceId}] service:start`)

  // Payload comes from JWT middleware; without it we cannot identify the user.
  if (!payload) {
    console.log(`[FLOW][${traceId}] service:missing_payload`)
    throw new Error("No payload found")
  }

  const auth0Id = payload.sub

  console.log(`[FLOW][${traceId}] service:find_user auth0Id=${auth0Id}`)

  const user = await findUser(auth0Id, traceId)

  // Return early when user already exists.
  if (user) {
    console.log(`[FLOW][${traceId}] service:user_found userId=${user.user_id}`)
    return user
  }

  const entity = new UserEntity(
    payload.sub,
    payload.name || "",
    payload.email || ""
  )

  const domain = entity.getEmailDomain()

  console.log(`[FLOW][${traceId}] service:domain_resolved domain=${domain || "empty"}`)

  const companyId = await findCompanyByDomain(domain, traceId)

  console.log(`[FLOW][${traceId}] service:company_lookup companyId=${companyId || "none"}`)

  // Create first-time user and link company by email domain.
  const newUser = await createUser({
    auth0_id: payload.sub,
    name: payload.name || "",
    email: payload.email || "",
    company_id: companyId || undefined
  }, traceId)

  console.log(`[FLOW][${traceId}] service:user_created userId=${newUser.user_id}`)

  return newUser

}

export { checkUser }