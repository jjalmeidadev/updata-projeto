import pool from "../database/index-table.js"

interface BatchCreateInput {
  source: string
  status: string
  fileName: string
  s3Key: string
  traceId: string
}

interface ProcessingJobCreateInput {
  batchId: string
  type: string
  status: string
}

interface OnboardingPayloadInput {
  rowNumber: number
  entityType: string
  rawData: Record<string, unknown>
  isValid: boolean
  validationErrors: string[]
}

interface OnboardingMappingInput {
  entityType: string
  externalId: string
  internalId: string
}

async function createOnboardingBatch(input: BatchCreateInput): Promise<string> {
  const query = `
    INSERT INTO equiem.onboarding_batch (source, status, file_name, s3_key, trace_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `

  const values = [input.source, input.status, input.fileName, input.s3Key, input.traceId]
  const result = await pool.query(query, values)

  return result.rows[0].id as string
}

async function updateOnboardingBatchStatus(
  batchId: string,
  status: string,
  errorMessage?: string
): Promise<void> {
  const query = `
    UPDATE equiem.onboarding_batch
    SET status = $2::varchar,
        processed_at = CASE WHEN $3::varchar IN ('completed', 'failed', 'invalid') THEN NOW() ELSE processed_at END,
        error_message = $4
    WHERE id = $1
  `

  await pool.query(query, [batchId, status, status, errorMessage || null])
}

async function createProcessingJob(input: ProcessingJobCreateInput): Promise<string> {
  const query = `
    INSERT INTO equiem.processing_job (batch_id, type, status, started_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING id
  `

  const values = [input.batchId, input.type, input.status]
  const result = await pool.query(query, values)

  return result.rows[0].id as string
}

async function updateProcessingJobStatus(
  jobId: string,
  status: string,
  options?: { errorMessage?: string; externalReference?: string }
): Promise<void> {
  const query = `
    UPDATE equiem.processing_job
    SET status = $2::varchar,
        finished_at = CASE WHEN $3::varchar IN ('completed', 'failed', 'invalid') THEN NOW() ELSE finished_at END,
        error_message = $4,
        external_reference = $5
    WHERE id = $1
  `

  await pool.query(query, [
    jobId,
    status,
    status,
    options?.errorMessage || null,
    options?.externalReference || null,
  ])
}

async function createProcessingLog(jobId: string, level: string, message: string): Promise<void> {
  const query = `
    INSERT INTO equiem.processing_log (job_id, level, message)
    VALUES ($1, $2, $3)
  `

  await pool.query(query, [jobId, level, message])
}

async function saveOnboardingPayloads(batchId: string, payloads: OnboardingPayloadInput[]): Promise<void> {
  if (payloads.length === 0) {
    return
  }

  for (const payload of payloads) {
    const query = `
      INSERT INTO equiem.onboarding_payload (batch_id, row_number, entity_type, raw_data, is_valid, validation_errors)
      VALUES ($1, $2, $3, $4::jsonb, $5, $6::jsonb)
    `

    await pool.query(query, [
      batchId,
      payload.rowNumber,
      payload.entityType,
      JSON.stringify(payload.rawData),
      payload.isValid,
      JSON.stringify(payload.validationErrors),
    ])
  }
}

async function saveOnboardingMappings(mappings: OnboardingMappingInput[]): Promise<void> {
  if (mappings.length === 0) {
    return
  }

  for (const mapping of mappings) {
    const query = `
      INSERT INTO equiem.onboarding_mapping (entity_type, external_id, internal_id)
      VALUES ($1, $2, $3)
    `

    await pool.query(query, [mapping.entityType, mapping.externalId, mapping.internalId])
  }
}

export {
  createOnboardingBatch,
  updateOnboardingBatchStatus,
  createProcessingJob,
  updateProcessingJobStatus,
  createProcessingLog,
  saveOnboardingPayloads,
  saveOnboardingMappings,
}