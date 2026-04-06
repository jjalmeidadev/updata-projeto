import {
  findUser,
  findUserByEmail,
  createUser,
  findCompanyByDomain,
  linkUserToAuth0ByEmail,
  updateUserByAuth0Id,
} from "../../data/repositories/user-repository.js"
import { UserEntity } from "../entities/user-entity.js"
import { isInternalEmail } from "../../shared/auth-constants.js"

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

function isInternalUserEmail(email: string): boolean {
  return isInternalEmail(email)
}

function buildSyntheticEmailFromSub(sub: string): string {
  const normalizedSub = sub.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "_")
  return `${normalizedSub || "unknown_user"}@auth0.local`
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
  const nameFromToken = (payload.name || "").trim()
  const emailFromToken = (payload.email || "").trim().toLowerCase()
  const hasRealEmail = emailFromToken.length > 0
  const resolvedEmail = hasRealEmail ? emailFromToken : buildSyntheticEmailFromSub(auth0Id)

  console.log(`[FLOW][${traceId}] service:find_user auth0Id=${auth0Id}`)

  const user = await findUser(auth0Id, traceId)

  if (user) {
    console.log(`[FLOW][${traceId}] service:user_found userId=${user.user_id}`)

    // Keep DB profile in sync when token now includes richer user attributes.
    const currentEmail = (user.user_email || "").trim().toLowerCase()
    const currentName = (user.user_name || "").trim().toLowerCase()
    const shouldSyncName = nameFromToken.length > 0 && currentName !== nameFromToken.toLowerCase()
    const shouldSyncEmail = hasRealEmail && currentEmail !== emailFromToken
    const shouldSyncCompany = hasRealEmail && !user.company_id

    if (shouldSyncName || shouldSyncEmail || shouldSyncCompany) {
      let companyId: string | null = null

      if (hasRealEmail && (shouldSyncEmail || shouldSyncCompany)) {
        companyId = await findCompanyByDomain(
          new UserEntity(payload.sub, payload.name || "", emailFromToken).getEmailDomain(),
          traceId
        )

        console.log(`[FLOW][${traceId}] service:user_sync companyId=${companyId || "none"} emailChanged=${shouldSyncEmail} nameChanged=${shouldSyncName}`)
      } else {
        console.log(`[FLOW][${traceId}] service:user_sync companyLookupSkipped emailChanged=${shouldSyncEmail} nameChanged=${shouldSyncName}`)
      }

      const syncedUser = await updateUserByAuth0Id(
        {
          auth0_id: payload.sub,
          name: nameFromToken,
          email: shouldSyncEmail ? emailFromToken : currentEmail,
          company_id: companyId || undefined,
        },
        traceId
      )

      if (syncedUser) {
        console.log(`[FLOW][${traceId}] service:user_synced userId=${syncedUser.user_id}`)
        return syncedUser
      }
    }

    return user
  }

  const companyId = hasRealEmail
    ? await findCompanyByDomain(new UserEntity(payload.sub, payload.name || "", resolvedEmail).getEmailDomain(), traceId)
    : null

  if (hasRealEmail) {
    console.log(`[FLOW][${traceId}] service:company_lookup companyId=${companyId || "none"}`)
  } else {
    console.log(`[FLOW][${traceId}] service:company_lookup skipped_missing_email syntheticEmail=${resolvedEmail}`)
  }

  // Reconcile pre-existing DB users by email before creating a new row.
  const email = emailFromToken

  if (email) {
    const existingByEmail = await findUserByEmail(email, traceId)

    if (existingByEmail) {
      console.log(`[FLOW][${traceId}] service:user_found_by_email userId=${existingByEmail.user_id}`)

      if (existingByEmail.auth0_id === auth0Id) {
        return existingByEmail
      }

      const linkedUser = await linkUserToAuth0ByEmail(
        {
          auth0_id: payload.sub,
          name: payload.name || "",
          email,
          company_id: companyId || undefined,
        },
        traceId
      )

      if (linkedUser) {
        console.log(`[FLOW][${traceId}] service:user_linked_to_auth0 userId=${linkedUser.user_id}`)
        return linkedUser
      }
    }
  }

  // Create first-time user and link company by email domain.
  const newUser = await createUser({
    auth0_id: payload.sub,
    name: payload.name || "",
    email: resolvedEmail,
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

  if (isInternalUserEmail(email)) {
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