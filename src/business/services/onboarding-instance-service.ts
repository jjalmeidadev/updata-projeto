import crypto from "node:crypto"
import {
  createOnboardingInstance,
  findCompanyByName,
  findOnboardingInstanceByLinkToken,
  findReusableOnboardingInstance,
  listCompanies,
  listOnboardingInstances,
  OnboardingInstanceRecord,
  updateOnboardingInstance,
} from "../../data/repositories/onboarding-instance-repository.js"
import {
  buildOnboardingEmailDraft,
  sendOnboardingSubmissionMessageToAdmins,
} from "./onboarding-email-service.js"

interface CreateOnboardingInstanceInput {
  companyName: string
  selectedSections: string[]
  baseUrl: string
}

interface SaveOnboardingProgressInput {
  linkToken: string
  formData: Record<string, unknown>
  progressPercent: number
}

interface ReviewDecisionInput {
  linkToken: string
}

function normalizeSections(sections: string[]): string[] {
  return Array.from(new Set(sections.map((section) => String(section).trim()).filter(Boolean))).sort()
}

function toPublicLink(baseUrl: string, linkToken: string): string {
  return `${baseUrl.replace(/\/$/, "")}/onboarding/${linkToken}`
}

function mapInstance(record: OnboardingInstanceRecord, baseUrl: string) {
  return {
    id: record.id,
    companyId: record.company_id,
    companyName: record.company_name,
    selectedSections: record.selected_sections,
    status: record.status,
    progressPercent: record.progress_percent,
    linkToken: record.link_token,
    linkUrl: toPublicLink(baseUrl, record.link_token),
    formData: record.form_data ?? {},
    emailStatus: record.email_status,
    emailPayload: record.email_payload,
    submittedAt: record.submitted_at,
    reviewedAt: record.reviewed_at,
    completedAt: record.completed_at,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

async function getDashboardInstances(baseUrl: string) {
  const records = await listOnboardingInstances()
  return records.map((record: OnboardingInstanceRecord) => mapInstance(record, baseUrl))
}

async function getCompanies() {
  return listCompanies()
}

async function createOrReuseOnboardingInstance(input: CreateOnboardingInstanceInput) {
  const selectedSections = normalizeSections(input.selectedSections)

  if (!input.companyName.trim()) {
    throw new Error("Company name is required")
  }

  if (selectedSections.length === 0) {
    throw new Error("At least one section must be selected")
  }

  const reusable = await findReusableOnboardingInstance({
    companyName: input.companyName.trim(),
    selectedSections,
  })

  if (reusable) {
    return {
      instance: mapInstance(reusable, input.baseUrl),
      reusedExistingInstance: true,
      reuseRule: "An existing non-terminal onboarding instance was reused for the same company and section set.",
    }
  }

  const company = await findCompanyByName(input.companyName.trim())
  const linkToken = crypto.randomUUID()
  const linkUrl = toPublicLink(input.baseUrl, linkToken)
  const emailPayload = buildOnboardingEmailDraft({
    companyName: input.companyName.trim(),
    onboardingLink: linkUrl,
    selectedSections,
  })

  const record = await createOnboardingInstance({
    companyId: company?.id ?? null,
    companyName: company?.name ?? input.companyName.trim(),
    selectedSections,
    linkToken,
    status: "draft",
    progressPercent: 0,
    emailStatus: "pending_manual_send",
    emailPayload,
  })

  return {
    instance: mapInstance(record, input.baseUrl),
    reusedExistingInstance: false,
    reuseRule: "A new onboarding instance is created when the previous cycle is completed and a new cycle starts.",
  }
}

async function getOnboardingInstanceByLink(linkToken: string, baseUrl: string) {
  const record = await findOnboardingInstanceByLinkToken(linkToken)

  if (!record) {
    return null
  }

  return mapInstance(record, baseUrl)
}

async function saveOnboardingProgress(input: SaveOnboardingProgressInput, baseUrl: string) {
  const record = await findOnboardingInstanceByLinkToken(input.linkToken)

  if (!record) {
    return null
  }

  const nextStatus =
    record.status === "equiem_review" || record.status === "completed"
      ? record.status
      : input.progressPercent > 0
        ? "in_progress"
        : record.status
  const updated = await updateOnboardingInstance(record.id, {
    formData: input.formData,
    progressPercent: Math.max(0, Math.min(100, input.progressPercent)),
    status: nextStatus === "completed" ? "completed" : nextStatus,
  })

  return updated ? mapInstance(updated, baseUrl) : null
}

async function submitOnboarding(linkToken: string, formData: Record<string, unknown>, baseUrl: string) {
  const record = await findOnboardingInstanceByLinkToken(linkToken)

  if (!record) {
    return null
  }

  const updated = await updateOnboardingInstance(record.id, {
    formData,
    progressPercent: 100,
    status: "equiem_review",
    submittedAt: new Date().toISOString(),
  })

  if (!updated) {
    return null
  }

  const notificationResult = await sendOnboardingSubmissionMessageToAdmins({
    companyName: updated.company_name,
    onboardingLink: toPublicLink(baseUrl, updated.link_token),
    selectedSections: updated.selected_sections,
    submittedAt: updated.submitted_at ?? new Date().toISOString(),
  })

  const mergedPayload = {
    ...(updated.email_payload ?? {}),
    adminSubmissionMessage: notificationResult,
  }

  const withNotification = await updateOnboardingInstance(updated.id, {
    emailStatus: notificationResult.sent ? "admin_submission_message_sent" : "admin_submission_message_failed",
    emailPayload: mergedPayload,
  })

  return mapInstance(withNotification ?? updated, baseUrl)
}

async function completeEquiemReview(input: ReviewDecisionInput, baseUrl: string) {
  const record = await findOnboardingInstanceByLinkToken(input.linkToken)

  if (!record) {
    return null
  }

  const timestamp = new Date().toISOString()
  const updated = await updateOnboardingInstance(record.id, {
    status: "completed",
    progressPercent: 100,
    reviewedAt: timestamp,
    completedAt: timestamp,
  })

  return updated ? mapInstance(updated, baseUrl) : null
}

export {
  createOrReuseOnboardingInstance,
  getCompanies,
  getDashboardInstances,
  getOnboardingInstanceByLink,
  saveOnboardingProgress,
  submitOnboarding,
  completeEquiemReview,
}
