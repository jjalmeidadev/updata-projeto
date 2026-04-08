import { Request, Response } from "express"
import {
  approveOnboardingInstance,
  completeEquiemReview,
  createOrReuseOnboardingInstance,
  getCompanies,
  getDashboardInstances,
  getOnboardingReviewDataByLink,
  getOnboardingInstanceByLinkForAuthenticatedUser,
  rejectOnboardingInstance,
  reviewOnboardingSection,
  saveOnboardingProgress,
  submitOnboarding,
} from "../../../business/services/onboarding-instance-service.js"
import { findUser } from "../../../data/repositories/user-repository.js"
import { resolveEmailClaim } from "../auth-claims.js"

function isOnboardingAccessDeniedError(error: unknown): boolean {
  return error instanceof Error && error.name === "OnboardingAccessDeniedError"
}

function resolveBaseUrl(req: Request): string {
  const envBaseUrl = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.FRONTEND_BASE_URL

  if (envBaseUrl) {
    return envBaseUrl
  }

  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http"
  const host = req.headers["x-forwarded-host"] || req.get("host") || "localhost:4200"

  return `${protocol}://${host}`.replace(":3000", ":4200")
}

async function resolveAuthenticatedEmail(req: Request): Promise<string | undefined> {
  const jwtPayload = req.auth?.payload as Record<string, unknown> | undefined
  const claimEmail = resolveEmailClaim(jwtPayload ?? {})

  if (claimEmail) {
    return claimEmail
  }

  const subject = typeof jwtPayload?.sub === "string" ? jwtPayload.sub.trim() : ""

  if (!subject) {
    return undefined
  }

  const user = await findUser(subject, "onboarding-link-auth")
  const databaseEmail = (user?.user_email || "").trim()

  return databaseEmail || undefined
}

export async function listOnboardingInstancesHandler(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const instances = await getDashboardInstances(resolveBaseUrl(req))
    return res.status(200).json({ items: instances })
  } catch (error) {
    console.error("listOnboardingInstancesHandler", error)
    return res.status(500).json({ error: "Failed to load onboarding instances" })
  }
}

export async function listCompaniesHandler(_req: Request, res: Response): Promise<Response> {
  try {
    const companies = await getCompanies()
    return res.status(200).json({ items: companies })
  } catch (error) {
    console.error("listCompaniesHandler", error)
    return res.status(500).json({ error: "Failed to load companies" })
  }
}

export async function createOnboardingInstanceHandler(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const companyName = String(req.body?.companyName || "")
    const selectedSections = Array.isArray(req.body?.selectedSections) ? req.body.selectedSections : []
    const allowedEmailsInput = req.body?.allowedEmails

    if (allowedEmailsInput !== undefined) {
      if (
        !Array.isArray(allowedEmailsInput) ||
        !allowedEmailsInput.every((email) => typeof email === "string")
      ) {
        return res.status(400).json({ error: "allowedEmails must be an array of strings" })
      }
    }

    const result = await createOrReuseOnboardingInstance({
      companyName,
      selectedSections,
      allowedEmails: Array.isArray(allowedEmailsInput) ? allowedEmailsInput : [],
      baseUrl: resolveBaseUrl(req),
    })

    return res.status(result.reusedExistingInstance ? 200 : 201).json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create onboarding"
    return res.status(400).json({ error: message })
  }
}

export async function getOnboardingByLinkHandler(req: Request, res: Response): Promise<Response> {
  try {
    const linkToken = String(req.params["linkToken"] || "")
    const authenticatedEmail = await resolveAuthenticatedEmail(req)
    const instance = await getOnboardingInstanceByLinkForAuthenticatedUser(
      linkToken,
      resolveBaseUrl(req),
      authenticatedEmail
    )

    if (!instance) {
      return res.status(404).json({ error: "Onboarding instance not found" })
    }

    return res.status(200).json(instance)
  } catch (error) {
    if (isOnboardingAccessDeniedError(error)) {
      const message = error instanceof Error ? error.message : "Access denied to this onboarding link"
      return res.status(403).json({ error: message })
    }

    console.error("getOnboardingByLinkHandler", error)
    return res.status(500).json({ error: "Failed to load onboarding instance" })
  }
}

export async function getOnboardingReviewDataHandler(req: Request, res: Response): Promise<Response> {
  try {
    const linkToken = String(req.params["linkToken"] || "")
    const authenticatedEmail = await resolveAuthenticatedEmail(req)
    const reviewData = await getOnboardingReviewDataByLink(linkToken, authenticatedEmail)

    if (!reviewData) {
      return res.status(404).json({ error: "Onboarding instance not found" })
    }

    return res.status(200).json(reviewData)
  } catch (error) {
    if (isOnboardingAccessDeniedError(error)) {
      const message = error instanceof Error ? error.message : "Access denied to this onboarding link"
      return res.status(403).json({ error: message })
    }

    console.error("getOnboardingReviewDataHandler", error)
    return res.status(500).json({ error: "Failed to load onboarding review data" })
  }
}

export async function saveOnboardingProgressHandler(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const linkToken = String(req.params["linkToken"] || "")
    const formData =
      req.body?.formData && typeof req.body.formData === "object" && !Array.isArray(req.body.formData)
        ? req.body.formData
        : {}

    const progressPercent = Number(req.body?.progressPercent || 0)
    const authenticatedEmail = await resolveAuthenticatedEmail(req)

    const instance = await saveOnboardingProgress(
      {
        linkToken,
        formData,
        progressPercent,
      },
      resolveBaseUrl(req),
      authenticatedEmail
    )

    if (!instance) {
      return res.status(404).json({ error: "Onboarding instance not found" })
    }

    return res.status(200).json(instance)
  } catch (error) {
    if (isOnboardingAccessDeniedError(error)) {
      const message = error instanceof Error ? error.message : "Access denied to this onboarding link"
      return res.status(403).json({ error: message })
    }

    console.error("saveOnboardingProgressHandler", error)
    return res.status(500).json({ error: "Failed to save onboarding progress" })
  }
}

export async function submitOnboardingHandler(req: Request, res: Response): Promise<Response> {
  try {
    const linkToken = String(req.params["linkToken"] || "")
    const formData =
      req.body?.formData && typeof req.body.formData === "object" && !Array.isArray(req.body.formData)
        ? req.body.formData
        : {}
    const authenticatedEmail = await resolveAuthenticatedEmail(req)

    const instance = await submitOnboarding(
      linkToken,
      formData,
      resolveBaseUrl(req),
      authenticatedEmail
    )

    if (!instance) {
      return res.status(404).json({ error: "Onboarding instance not found" })
    }

    return res.status(200).json(instance)
  } catch (error) {
    if (isOnboardingAccessDeniedError(error)) {
      const message = error instanceof Error ? error.message : "Access denied to this onboarding link"
      return res.status(403).json({ error: message })
    }

    console.error("submitOnboardingHandler", error)
    return res.status(500).json({ error: "Failed to submit onboarding" })
  }
}

export async function completeEquiemReviewHandler(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const linkToken = String(req.params["linkToken"] || "")
    const instance = await completeEquiemReview(
      { linkToken },
      resolveBaseUrl(req)
    )

    if (!instance) {
      return res.status(404).json({ error: "Onboarding instance not found" })
    }

    return res.status(200).json(instance)
  } catch (error) {
    console.error("completeEquiemReviewHandler", error)
    return res.status(500).json({ error: "Failed to complete Equiem review" })
  }
}

export async function approveOnboardingInstanceHandler(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const linkToken = String(req.params["linkToken"] || "")
    const instance = await approveOnboardingInstance(
      linkToken,
      resolveBaseUrl(req)
    )

    if (!instance) {
      return res.status(404).json({ error: "Onboarding instance not found" })
    }

    return res.status(200).json(instance)
  } catch (error) {
    console.error("approveOnboardingInstanceHandler", error)
    return res.status(500).json({ error: "Failed to approve onboarding instance" })
  }
}

export async function rejectOnboardingInstanceHandler(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const linkToken = String(req.params["linkToken"] || "")
    const reason = String(req.body?.reason || "").trim()

    if (!reason) {
      return res.status(400).json({ error: "Rejection reason is required" })
    }

    const instance = await rejectOnboardingInstance(
      linkToken,
      reason,
      resolveBaseUrl(req)
    )

    if (!instance) {
      return res.status(404).json({ error: "Onboarding instance not found" })
    }

    return res.status(200).json(instance)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reject onboarding instance"
    console.error("rejectOnboardingInstanceHandler", error)
    return res.status(400).json({ error: message })
  }
}

export async function reviewOnboardingSectionHandler(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const linkToken = String(req.params["linkToken"] || "")
    const sectionId = String(req.params["sectionId"] || "")
    const decision = String(req.body?.decision || "") as "approved" | "rejected"
    const reason = String(req.body?.reason || "").trim()

    if (decision !== "approved" && decision !== "rejected") {
      return res.status(400).json({ error: "Decision must be 'approved' or 'rejected'" })
    }

    const instance = await reviewOnboardingSection(
      {
        linkToken,
        sectionId,
        decision,
        reason,
      },
      resolveBaseUrl(req)
    )

    if (!instance) {
      return res.status(404).json({ error: "Onboarding instance not found" })
    }

    return res.status(200).json(instance)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to review onboarding section"
    console.error("reviewOnboardingSectionHandler", error)
    return res.status(400).json({ error: message })
  }
}
