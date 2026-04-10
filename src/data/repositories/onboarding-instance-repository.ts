import pool from "../database/index-table.js"

interface OnboardingInstanceCreateInput {
  companyId?: string | null
  companyName: string
  selectedSections: string[]
  allowedEmails: string[]
  linkToken: string
  status: string
  progressPercent: number
  emailStatus: string
  emailPayload: Record<string, unknown>
}

interface OnboardingInstanceUpdateInput {
  formData?: Record<string, unknown>
  progressPercent?: number
  status?: string
  companyId?: string | null
  companyName?: string
  selectedSections?: string[]
  allowedEmails?: string[]
  submittedAt?: string | null
  reviewedAt?: string | null
  completedAt?: string | null
  emailStatus?: string
  emailPayload?: Record<string, unknown>
  sectionReview?: Record<string, unknown>
  returnedSections?: string[]
  rejectionReason?: string | null
}

export interface OnboardingInstanceRecord {
  id: string
  company_id: string | null
  batch_id: string | null
  company_name: string
  selected_sections: string[]
  allowed_emails: string[]
  status: string
  progress_percent: number
  link_token: string
  form_data: Record<string, unknown>
  email_status: string
  email_payload: Record<string, unknown> | null
  submitted_at: string | null
  reviewed_at: string | null
  completed_at: string | null
  section_review: Record<string, unknown> | null
  returned_sections: string[]
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

interface ReviewableInstanceLookup {
  companyName: string
  selectedSections: string[]
}

async function listOnboardingInstances(): Promise<OnboardingInstanceRecord[]> {
  const query = `
    SELECT
      id,
      company_id,
      batch_id,
      company_name,
      selected_sections,
      allowed_emails,
      status,
      progress_percent,
      link_token,
      form_data,
      email_status,
      email_payload,
      submitted_at,
      reviewed_at,
      completed_at,
      section_review,
      returned_sections,
      rejection_reason,
      created_at,
      updated_at
    FROM equiem.onboarding_instance
    ORDER BY updated_at DESC, created_at DESC
  `

  const result = await pool.query(query)
  return result.rows as OnboardingInstanceRecord[]
}

async function findOnboardingInstanceByLinkToken(
  linkToken: string
): Promise<OnboardingInstanceRecord | null> {
  const query = `
    SELECT
      id,
      company_id,
      batch_id,
      company_name,
      selected_sections,
      allowed_emails,
      status,
      progress_percent,
      link_token,
      form_data,
      email_status,
      email_payload,
      submitted_at,
      reviewed_at,
      completed_at,
      section_review,
      returned_sections,
      rejection_reason,
      created_at,
      updated_at
    FROM equiem.onboarding_instance
    WHERE link_token = $1
    LIMIT 1
  `

  const result = await pool.query(query, [linkToken])
  return (result.rows[0] as OnboardingInstanceRecord | undefined) ?? null
}

async function findReusableOnboardingInstance(
  input: ReviewableInstanceLookup
): Promise<OnboardingInstanceRecord | null> {
  const query = `
    SELECT
      id,
      company_id,
      batch_id,
      company_name,
      selected_sections,
      allowed_emails,
      status,
      progress_percent,
      link_token,
      form_data,
      email_status,
      email_payload,
      submitted_at,
      reviewed_at,
      completed_at,
      section_review,
      returned_sections,
      rejection_reason,
      created_at,
      updated_at
    FROM equiem.onboarding_instance
    WHERE LOWER(company_name) = LOWER($1)
      AND selected_sections = $2::text[]
      AND status IN ('draft', 'in_progress', 'equiem_review')
    ORDER BY updated_at DESC
    LIMIT 1
  `

  const result = await pool.query(query, [input.companyName, input.selectedSections])
  return (result.rows[0] as OnboardingInstanceRecord | undefined) ?? null
}

async function findCompanyByName(companyName: string): Promise<{ id: string; name: string } | null> {
  const query = `
    SELECT id, name
    FROM equiem.company
    WHERE LOWER(name) = LOWER($1)
    LIMIT 1
  `

  const result = await pool.query(query, [companyName])
  return (result.rows[0] as { id: string; name: string } | undefined) ?? null
}

async function listCompanies(): Promise<Array<{ id: string; name: string }>> {
  const query = `
    SELECT id, name
    FROM equiem.company
    ORDER BY name ASC
  `

  const result = await pool.query(query)
  return result.rows as Array<{ id: string; name: string }>
}

async function createOnboardingInstance(
  input: OnboardingInstanceCreateInput
): Promise<OnboardingInstanceRecord> {
  const query = `
    INSERT INTO equiem.onboarding_instance (
      company_id,
      batch_id,
      company_name,
      selected_sections,
      allowed_emails,
      status,
      progress_percent,
      link_token,
      email_status,
      email_payload
    )
    VALUES ($1, NULL, $2, $3::text[], $4::text[], $5, $6, $7, $8, $9::jsonb)
    RETURNING
      id,
      company_id,
      batch_id,
      company_name,
      selected_sections,
      allowed_emails,
      status,
      progress_percent,
      link_token,
      form_data,
      email_status,
      email_payload,
      submitted_at,
      reviewed_at,
      completed_at,
      section_review,
      returned_sections,
      rejection_reason,
      created_at,
      updated_at
  `

  const result = await pool.query(query, [
    input.companyId || null,
    input.companyName,
    input.selectedSections,
    input.allowedEmails,
    input.status,
    input.progressPercent,
    input.linkToken,
    input.emailStatus,
    JSON.stringify(input.emailPayload),
  ])

  return result.rows[0] as OnboardingInstanceRecord
}

async function updateOnboardingInstance(
  instanceId: string,
  input: OnboardingInstanceUpdateInput
): Promise<OnboardingInstanceRecord | null> {
  const query = `
    UPDATE equiem.onboarding_instance
    SET
      form_data = COALESCE($2::jsonb, form_data),
      progress_percent = COALESCE($3, progress_percent),
      status = COALESCE($4, status),
      company_id = COALESCE($5::uuid, company_id),
      company_name = COALESCE($6::text, company_name),
      selected_sections = COALESCE($7::text[], selected_sections),
      allowed_emails = COALESCE($8::text[], allowed_emails),
      submitted_at = CASE WHEN $9::timestamptz IS NULL THEN submitted_at ELSE $9::timestamptz END,
      reviewed_at = CASE WHEN $10::timestamptz IS NULL THEN reviewed_at ELSE $10::timestamptz END,
      completed_at = CASE WHEN $11::timestamptz IS NULL THEN completed_at ELSE $11::timestamptz END,
      email_status = COALESCE($12, email_status),
      email_payload = COALESCE($13::jsonb, email_payload),
      rejection_reason = CASE WHEN $14::text IS NULL THEN rejection_reason ELSE $14::text END,
      section_review = COALESCE($15::jsonb, section_review),
      returned_sections = COALESCE($16::text[], returned_sections),
      updated_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      company_id,
      batch_id,
      company_name,
      selected_sections,
      allowed_emails,
      status,
      progress_percent,
      link_token,
      form_data,
      email_status,
      email_payload,
      submitted_at,
      reviewed_at,
      completed_at,
      section_review,
      returned_sections,
      rejection_reason,
      created_at,
      updated_at
  `

  const result = await pool.query(query, [
    instanceId,
    input.formData ? JSON.stringify(input.formData) : null,
    input.progressPercent ?? null,
    input.status ?? null,
    input.companyId ?? null,
    input.companyName ?? null,
    input.selectedSections ?? null,
    input.allowedEmails ?? null,
    input.submittedAt ?? null,
    input.reviewedAt ?? null,
    input.completedAt ?? null,
    input.emailStatus ?? null,
    input.emailPayload ? JSON.stringify(input.emailPayload) : null,
    input.rejectionReason ?? null,
    input.sectionReview ? JSON.stringify(input.sectionReview) : null,
    input.returnedSections ?? null,
  ])

  return (result.rows[0] as OnboardingInstanceRecord | undefined) ?? null
}

async function deleteOnboardingInstanceByLinkToken(
  linkToken: string
): Promise<OnboardingInstanceRecord | null> {
  const query = `
    DELETE FROM equiem.onboarding_instance
    WHERE link_token = $1
    RETURNING
      id,
      company_id,
      batch_id,
      company_name,
      selected_sections,
      allowed_emails,
      status,
      progress_percent,
      link_token,
      form_data,
      email_status,
      email_payload,
      submitted_at,
      reviewed_at,
      completed_at,
      section_review,
      returned_sections,
      rejection_reason,
      created_at,
      updated_at
  `

  const result = await pool.query(query, [linkToken])
  return (result.rows[0] as OnboardingInstanceRecord | undefined) ?? null
}

async function linkBatchToOnboardingInstanceByLinkToken(
  linkToken: string,
  batchId: string
): Promise<OnboardingInstanceRecord | null> {
  const query = `
    UPDATE equiem.onboarding_instance
    SET
      batch_id = $2,
      updated_at = NOW()
    WHERE link_token = $1
    RETURNING
      id,
      company_id,
      batch_id,
      company_name,
      selected_sections,
      allowed_emails,
      status,
      progress_percent,
      link_token,
      form_data,
      email_status,
      email_payload,
      submitted_at,
      reviewed_at,
      completed_at,
      section_review,
      returned_sections,
      rejection_reason,
      created_at,
      updated_at
  `

  const result = await pool.query(query, [linkToken, batchId])
  return (result.rows[0] as OnboardingInstanceRecord | undefined) ?? null
}

export {
  listOnboardingInstances,
  findOnboardingInstanceByLinkToken,
  findReusableOnboardingInstance,
  findCompanyByName,
  listCompanies,
  createOnboardingInstance,
  updateOnboardingInstance,
  deleteOnboardingInstanceByLinkToken,
  linkBatchToOnboardingInstanceByLinkToken,
}
