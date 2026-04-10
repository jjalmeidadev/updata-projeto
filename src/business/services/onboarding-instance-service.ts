import crypto from "node:crypto"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { s3Client } from "../../config/aws-clients.js"
import {
  createOnboardingInstance,
  deleteOnboardingInstanceByLinkToken,
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
  sendOnboardingInviteToAllowedEmails,
  sendOnboardingSubmissionMessageToAdmins,
} from "./onboarding-email-service.js"
import { isInternalEmail } from "../../shared/auth-constants.js"

import { findOnboardingBatchById } from "../../data/repositories/onboarding-repository.js"

interface CreateOnboardingInstanceInput {
  companyName: string
  selectedSections: string[]
  allowedEmails: string[]
  baseUrl: string
}

interface UpdateOnboardingInstanceInput {
  companyName: string
  selectedSections: string[]
  allowedEmails: string[]
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

type SectionDecision = "approved" | "rejected"

interface SectionReviewDecisionInput {
  linkToken: string
  sectionId: string
  decision: SectionDecision
  reason?: string
}

interface SnapshotReviewItem {
  rowNumber: number
  rawData: Record<string, unknown>
}

interface S3ReviewSnapshot {
  items?: SnapshotReviewItem[]
}

class OnboardingAccessDeniedError extends Error {
  constructor(message = "Access denied to this onboarding link") {
    super(message)
    this.name = "OnboardingAccessDeniedError"
  }
}

function isOnboardingAuthBypassed(): boolean {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}
  return env.DISABLE_ONBOARDING_AUTH === "true"
}

function normalizeEmailAddress(email: string): string {
  return email.trim().toLowerCase()
}

function ensureOnboardingAccess(record: OnboardingInstanceRecord, authenticatedEmail?: string): void {
  if (isOnboardingAuthBypassed()) {
    return
  }

  const normalizedEmail = authenticatedEmail ? normalizeEmailAddress(authenticatedEmail) : ""

  if (!normalizedEmail) {
    throw new OnboardingAccessDeniedError("Authenticated email is required to access this onboarding link")
  }

  const allowedEmails = record.allowed_emails.map(normalizeEmailAddress)

  if (!allowedEmails.includes(normalizedEmail)) {
    throw new OnboardingAccessDeniedError(
      `You are not allowed to access this onboarding link (authenticated as: ${normalizedEmail})`
    )
  }
}

function ensureInternalReviewAccess(authenticatedEmail?: string): void {
  if (isOnboardingAuthBypassed()) {
    return
  }

  const normalizedEmail = authenticatedEmail ? normalizeEmailAddress(authenticatedEmail) : ""

  if (!normalizedEmail) {
    throw new OnboardingAccessDeniedError("Authenticated email is required to access this review link")
  }

  if (!isInternalEmail(normalizedEmail)) {
    throw new OnboardingAccessDeniedError(
      `You are not allowed to access this review link (authenticated as: ${normalizedEmail})`
    )
  }
}

function normalizeSections(sections: string[]): string[] {
  return Array.from(new Set(sections.map((section) => String(section).trim()).filter(Boolean))).sort()
}

function normalizeAllowedEmails(emails: string[]): string[] {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const normalized = emails
    .map((email) => String(email).trim().toLowerCase())
    .filter((email) => email.length > 0)

  if (normalized.length === 0) {
    throw new Error("At least one allowed email must be provided")
  }

  const invalidEmail = normalized.find((email) => !emailPattern.test(email))

  if (invalidEmail) {
    throw new Error(`Invalid email address: ${invalidEmail}`)
  }

  return Array.from(new Set(normalized)).sort()
}

function haveSameEmails(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }

  return true
}

function toPublicLink(baseUrl: string, linkToken: string): string {
  return `${baseUrl.replace(/\/$/, "")}/onboarding/${linkToken}`
}

function toReviewLink(baseUrl: string, linkToken: string): string {
  return `${baseUrl.replace(/\/$/, "")}/equiem-review/${linkToken}`
}

function mapInstance(record: OnboardingInstanceRecord, baseUrl: string) {
  return {
    id: record.id,
    companyId: record.company_id,
    companyName: record.company_name,
    selectedSections: record.selected_sections,
    allowedEmails: record.allowed_emails,
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
    sectionReview: record.section_review ?? {},
    returnedSections: record.returned_sections ?? [],
    rejectionReason: record.rejection_reason,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

function normalizeSectionReview(input: unknown): Record<string, { status: SectionDecision; reason?: string; reviewedAt: string }> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {}
  }

  const result: Record<string, { status: SectionDecision; reason?: string; reviewedAt: string }> = {}

  for (const [sectionId, value] of Object.entries(input as Record<string, unknown>)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      continue
    }

    const status = (value as { status?: unknown }).status
    if (status !== "approved" && status !== "rejected") {
      continue
    }

    const reasonValue = (value as { reason?: unknown }).reason
    const reviewedAtValue = (value as { reviewedAt?: unknown }).reviewedAt

    result[sectionId] = {
      status,
      reason: typeof reasonValue === "string" ? reasonValue : undefined,
      reviewedAt: typeof reviewedAtValue === "string" ? reviewedAtValue : new Date().toISOString(),
    }
  }

  return result
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
  const allowedEmails = normalizeAllowedEmails(input.allowedEmails)

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

  if (reusable && haveSameEmails(reusable.allowed_emails.map(normalizeEmailAddress).sort(), allowedEmails)) {
    const inviteResult = await sendOnboardingInviteToAllowedEmails({
      companyName: reusable.company_name,
      onboardingLink: toPublicLink(input.baseUrl, reusable.link_token),
      selectedSections,
      allowedEmails,
    })

    const invitePayload = {
      ...(reusable.email_payload ?? {}),
      onboardingInvite: inviteResult,
    }

    const withInviteStatus = await updateOnboardingInstance(reusable.id, {
      emailStatus: inviteResult.sent ? "invite_sent" : "invite_failed",
      emailPayload: invitePayload,
    })

    const persistedReusable = withInviteStatus ?? reusable

    return {
      instance: mapInstance(persistedReusable, input.baseUrl),
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
    allowedEmails,
    linkToken,
    status: "draft",
    progressPercent: 0,
    emailStatus: "pending_manual_send",
    emailPayload,
  })

  const inviteResult = await sendOnboardingInviteToAllowedEmails({
    companyName: input.companyName.trim(),
    onboardingLink: linkUrl,
    selectedSections,
    allowedEmails,
  })

  const invitePayload = {
    ...(record.email_payload ?? {}),
    onboardingInvite: inviteResult,
  }

  const withInviteStatus = await updateOnboardingInstance(record.id, {
    emailStatus: inviteResult.sent ? "invite_sent" : "invite_failed",
    emailPayload: invitePayload,
  })

  const persistedRecord = withInviteStatus ?? record

  return {
    instance: mapInstance(persistedRecord, input.baseUrl),
    reusedExistingInstance: false,
    reuseRule: "A new onboarding instance is created when the previous cycle is completed and a new cycle starts.",
  }
}

async function updateOnboardingInstanceDetails(linkToken: string, input: UpdateOnboardingInstanceInput) {
  const existing = await findOnboardingInstanceByLinkToken(linkToken)

  if (!existing) {
    return null
  }

  const selectedSections = normalizeSections(input.selectedSections)
  const allowedEmails = normalizeAllowedEmails(input.allowedEmails)
  const companyName = input.companyName.trim()

  if (!companyName) {
    throw new Error("Company name is required")
  }

  if (selectedSections.length === 0) {
    throw new Error("At least one section must be selected")
  }

  const company = await findCompanyByName(companyName)
  const updated = await updateOnboardingInstance(existing.id, {
    companyId: company?.id ?? null,
    companyName: company?.name ?? companyName,
    selectedSections,
    allowedEmails,
    emailStatus: existing.email_status,
    emailPayload: existing.email_payload ?? {},
  })

  if (!updated) {
    return null
  }

  const inviteResult = await sendOnboardingInviteToAllowedEmails({
    companyName: updated.company_name,
    onboardingLink: toPublicLink(input.baseUrl, updated.link_token),
    selectedSections,
    allowedEmails,
  })

  const invitePayload = {
    ...(updated.email_payload ?? {}),
    onboardingInvite: inviteResult,
  }

  const withInviteStatus = await updateOnboardingInstance(updated.id, {
    emailStatus: inviteResult.sent ? "invite_sent" : "invite_failed",
    emailPayload: invitePayload,
  })

  const persisted = withInviteStatus ?? updated

  return mapInstance(persisted, input.baseUrl)
}

async function getOnboardingInstanceByLink(linkToken: string, baseUrl: string) {
  const record = await findOnboardingInstanceByLinkToken(linkToken)

  if (!record) {
    return null
  }

  return mapInstance(record, baseUrl)
}

async function getOnboardingInstanceByLinkForAuthenticatedUser(
  linkToken: string,
  baseUrl: string,
  authenticatedEmail?: string
) {
  const record = await findOnboardingInstanceByLinkToken(linkToken)

  if (!record) {
    return null
  }

  ensureOnboardingAccess(record, authenticatedEmail)

  return mapInstance(record, baseUrl)
}

async function getOnboardingInstanceByLinkForInternalReview(
  linkToken: string,
  baseUrl: string,
  authenticatedEmail?: string
) {
  const record = await findOnboardingInstanceByLinkToken(linkToken)

  if (!record) {
    return null
  }

  ensureInternalReviewAccess(authenticatedEmail)

  return mapInstance(record, baseUrl)
}

async function deleteOnboardingInstance(linkToken: string, baseUrl: string) {
  const record = await deleteOnboardingInstanceByLinkToken(linkToken)

  if (!record) {
    return null
  }

  return mapInstance(record, baseUrl)
}

async function getOnboardingReviewDataByLink(linkToken: string, authenticatedEmail?: string) {
  const record = await findOnboardingInstanceByLinkToken(linkToken)

  if (!record) {
    return null
  }

  ensureOnboardingAccess(record, authenticatedEmail)

  if (!record.batch_id) {
    return {
      linkToken: record.link_token,
      batchId: null,
      items: [],
    }
  }

  const batch = await findOnboardingBatchById(record.batch_id)
  const bucketName = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.AWS_S3_BUCKET

  if (!batch || !bucketName) {
    return {
      linkToken: record.link_token,
      batchId: record.batch_id,
      items: [],
    }
  }

  const snapshotKey = `${batch.s3Key}.parsed.json`
  let items: SnapshotReviewItem[] = []

  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: snapshotKey,
      })
    )

    const snapshotRaw = await response.Body?.transformToString()

    if (snapshotRaw) {
      const parsed = JSON.parse(snapshotRaw) as S3ReviewSnapshot
      items = Array.isArray(parsed.items)
        ? parsed.items.filter(
            (item): item is SnapshotReviewItem =>
              Boolean(item && typeof item.rowNumber === "number" && typeof item.rawData === "object" && item.rawData)
          )
        : []
    }
  } catch (error) {
    const errorName = (error as { name?: string })?.name

    if (errorName !== "NoSuchKey") {
      console.error("getOnboardingReviewDataByLink:s3_snapshot_read_error", error)
    }
  }

  return {
    linkToken: record.link_token,
    batchId: record.batch_id,
    items,
  }
}

async function saveOnboardingProgress(
  input: SaveOnboardingProgressInput,
  baseUrl: string,
  authenticatedEmail?: string
) {
  const record = await findOnboardingInstanceByLinkToken(input.linkToken)

  if (!record) {
    return null
  }

  ensureOnboardingAccess(record, authenticatedEmail)

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

async function submitOnboarding(
  linkToken: string,
  formData: Record<string, unknown>,
  baseUrl: string,
  authenticatedEmail?: string
) {
  const record = await findOnboardingInstanceByLinkToken(linkToken)

  if (!record) {
    return null
  }

  ensureOnboardingAccess(record, authenticatedEmail)

  const updated = await updateOnboardingInstance(record.id, {
    formData,
    progressPercent: 100,
    status: "equiem_review",
    submittedAt: new Date().toISOString(),
    sectionReview: {},
    returnedSections: [],
    rejectionReason: null,
  })

  if (!updated) {
    return null
  }

  const notificationResult = await sendOnboardingSubmissionMessageToAdmins({
    companyName: updated.company_name,
    reviewLink: toReviewLink(baseUrl, updated.link_token),
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

async function approveOnboardingInstance(linkToken: string, baseUrl: string) {
  const record = await findOnboardingInstanceByLinkToken(linkToken)

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

async function rejectOnboardingInstance(linkToken: string, reason: string, baseUrl: string) {
  const record = await findOnboardingInstanceByLinkToken(linkToken)

  if (!record) {
    return null
  }

  if (!reason?.trim()) {
    throw new Error("Rejection reason is required")
  }

  const timestamp = new Date().toISOString()
  const updated = await updateOnboardingInstance(record.id, {
    status: "rejected",
    reviewedAt: timestamp,
    rejectionReason: reason.trim(),
  })

  return updated ? mapInstance(updated, baseUrl) : null
}

async function reviewOnboardingSection(input: SectionReviewDecisionInput, baseUrl: string) {
  const record = await findOnboardingInstanceByLinkToken(input.linkToken)

  if (!record) {
    return null
  }

  const sectionId = String(input.sectionId || "").trim()
  if (!sectionId) {
    throw new Error("Section ID is required")
  }

  if (!record.selected_sections.includes(sectionId)) {
    throw new Error("Section does not belong to this onboarding instance")
  }

  if (input.decision === "rejected" && !input.reason?.trim()) {
    throw new Error("A reason is required when rejecting a section")
  }

  const timestamp = new Date().toISOString()
  const currentReview = normalizeSectionReview(record.section_review)
  const nextReview = {
    ...currentReview,
    [sectionId]: {
      status: input.decision,
      reason: input.decision === "rejected" ? input.reason?.trim() : undefined,
      reviewedAt: timestamp,
    },
  }

  const returnedSections = record.selected_sections.filter(
    (section) => nextReview[section]?.status === "rejected"
  )

  const allApproved = record.selected_sections.length > 0
    && record.selected_sections.every((section) => nextReview[section]?.status === "approved")

  const updatePayload: Parameters<typeof updateOnboardingInstance>[1] = {
    sectionReview: nextReview,
    returnedSections,
  }

  if (allApproved) {
    updatePayload.status = "completed"
    updatePayload.progressPercent = 100
    updatePayload.reviewedAt = timestamp
    updatePayload.completedAt = timestamp
    updatePayload.rejectionReason = null
  } else if (returnedSections.length > 0) {
    updatePayload.status = "in_progress"
    updatePayload.progressPercent = Math.min(record.progress_percent, 99)
    updatePayload.reviewedAt = timestamp
  } else {
    updatePayload.status = "equiem_review"
    updatePayload.reviewedAt = timestamp
  }

  const updated = await updateOnboardingInstance(record.id, updatePayload)
  return updated ? mapInstance(updated, baseUrl) : null
}

export {
  createOrReuseOnboardingInstance,
  getCompanies,
  getDashboardInstances,
  getOnboardingInstanceByLink,
  getOnboardingInstanceByLinkForAuthenticatedUser,
  getOnboardingInstanceByLinkForInternalReview,
  deleteOnboardingInstance,
  updateOnboardingInstanceDetails,
  getOnboardingReviewDataByLink,
  saveOnboardingProgress,
  submitOnboarding,
  completeEquiemReview,
  OnboardingAccessDeniedError,
  approveOnboardingInstance,
  rejectOnboardingInstance,
  reviewOnboardingSection,
}
