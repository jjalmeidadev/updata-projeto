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

type UserNavigationOutcome = "monitoring" | "company" | "unregistered" | "not_found"

interface UserNavigationResult {
  outcome: UserNavigationOutcome
  companyId?: string
}

// Ensures the authenticated user exists and is linked to a company when possible.

async function checkUser(
  payload: AuthPayload | undefined,
  traceId = "no-trace"
): Promise<UserRecord | null> {
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

  if (!newUser) {
    console.log(`[FLOW][${traceId}] service:user_not_found_after_create`)
    return null
  }

  console.log(`[FLOW][${traceId}] service:user_created userId=${newUser.user_id}`)

  return newUser

}

async function resolveUserNavigation(
  payload: AuthPayload | undefined,
  traceId = "no-trace"
): Promise<UserNavigationResult> {
  const user = await checkUser(payload, traceId)

  if (!user) {
    console.log(`[FLOW][${traceId}] service:navigation user_not_found`)
    return {
      outcome: "not_found",
    }
  }

  const email = user.user_email || ""

  if (email.endsWith("@getequiem.com")) {
    console.log(`[FLOW][${traceId}] service:navigation next=/monitoring`)
    return {
      outcome: "monitoring",
    }
  }

  if (user.company_id) {
    console.log(`[FLOW][${traceId}] service:navigation next=/company/${user.company_id}`)
    return {
      outcome: "company",
      companyId: user.company_id,
    }
  }

  console.log(`[FLOW][${traceId}] service:navigation company_not_registered`)
  return {
    outcome: "unregistered",
  }
}

export { checkUser, resolveUserNavigation }
export type { AuthPayload, UserNavigationResult }