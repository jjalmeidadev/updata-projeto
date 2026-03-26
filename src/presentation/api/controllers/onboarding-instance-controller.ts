import { Request, Response } from "express"
import {
  completeEquiemReview,
  createOrReuseOnboardingInstance,
  getCompanies,
  getDashboardInstances,
  getOnboardingInstanceByLink,
  saveOnboardingProgress,
  submitOnboarding,
} from "../../../business/services/onboarding-instance-service.js"

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

    const result = await createOrReuseOnboardingInstance({
      companyName,
      selectedSections,
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
    const instance = await getOnboardingInstanceByLink(
      linkToken,
      resolveBaseUrl(req)
    )

    if (!instance) {
      return res.status(404).json({ error: "Onboarding instance not found" })
    }

    return res.status(200).json(instance)
  } catch (error) {
    console.error("getOnboardingByLinkHandler", error)
    return res.status(500).json({ error: "Failed to load onboarding instance" })
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

    const instance = await saveOnboardingProgress(
      {
        linkToken,
        formData,
        progressPercent,
      },
      resolveBaseUrl(req)
    )

    if (!instance) {
      return res.status(404).json({ error: "Onboarding instance not found" })
    }

    return res.status(200).json(instance)
  } catch (error) {
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

    const instance = await submitOnboarding(
      linkToken,
      formData,
      resolveBaseUrl(req)
    )

    if (!instance) {
      return res.status(404).json({ error: "Onboarding instance not found" })
    }

    return res.status(200).json(instance)
  } catch (error) {
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
