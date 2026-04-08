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
  submittedAt?: string | null
  reviewedAt?: string | null
  completedAt?: string | null
  emailStatus?: string
  emailPayload?: Record<string, unknown>
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
      submitted_at = CASE WHEN $5::timestamptz IS NULL THEN submitted_at ELSE $5::timestamptz END,
      reviewed_at = CASE WHEN $6::timestamptz IS NULL THEN reviewed_at ELSE $6::timestamptz END,
      completed_at = CASE WHEN $7::timestamptz IS NULL THEN completed_at ELSE $7::timestamptz END,
      email_status = COALESCE($8, email_status),
      email_payload = COALESCE($9::jsonb, email_payload),
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
      created_at,
      updated_at
  `

  const result = await pool.query(query, [
    instanceId,
    input.formData ? JSON.stringify(input.formData) : null,
    input.progressPercent ?? null,
    input.status ?? null,
    input.submittedAt ?? null,
    input.reviewedAt ?? null,
    input.completedAt ?? null,
    input.emailStatus ?? null,
    input.emailPayload ? JSON.stringify(input.emailPayload) : null,
  ])

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
  linkBatchToOnboardingInstanceByLinkToken,
}
