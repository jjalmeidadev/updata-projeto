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

interface ProcessingChunkCreateInput {
  chunkIndex: number
  offset: number
  size: number
}

interface ChunkSummary {
  totalChunks: number
  completedChunks: number
  failedChunks: number
  processingChunks: number
  queuedChunks: number
}

interface BatchRawRow {
  rowNumber: number
  rawData: Record<string, unknown>
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

async function getLatestProcessingJobIdByBatch(batchId: string): Promise<string | null> {
  const query = `
    SELECT id
    FROM equiem.processing_job
    WHERE batch_id = $1
    ORDER BY started_at DESC NULLS LAST
    LIMIT 1
  `

  const result = await pool.query(query, [batchId])
  if (result.rowCount === 0) {
    return null
  }

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

async function createProcessingChunks(batchId: string, chunks: ProcessingChunkCreateInput[]): Promise<void> {
  if (chunks.length === 0) {
    return
  }

  const query = `
    INSERT INTO equiem.processing_chunk (batch_id, chunk_index, "offset", "size", status)
    VALUES ($1, $2, $3, $4, 'queued')
    ON CONFLICT (batch_id, chunk_index) DO NOTHING
  `

  for (const chunk of chunks) {
    await pool.query(query, [batchId, chunk.chunkIndex, chunk.offset, chunk.size])
  }
}

async function claimProcessingChunk(batchId: string, chunkIndex: number): Promise<boolean> {
  const query = `
    UPDATE equiem.processing_chunk
    SET status = 'processing',
        started_at = NOW(),
        updated_at = NOW()
    WHERE batch_id = $1
      AND chunk_index = $2
      AND status IN ('queued', 'failed')
    RETURNING id
  `

  const result = await pool.query(query, [batchId, chunkIndex])
  return (result.rowCount ?? 0) > 0
}

async function completeProcessingChunk(batchId: string, chunkIndex: number): Promise<void> {
  const query = `
    UPDATE equiem.processing_chunk
    SET status = 'completed',
        finished_at = NOW(),
        error = NULL,
        updated_at = NOW()
    WHERE batch_id = $1
      AND chunk_index = $2
  `
  await pool.query(query, [batchId, chunkIndex])
}

async function failProcessingChunk(batchId: string, chunkIndex: number, errorMessage: string): Promise<void> {
  const query = `
    UPDATE equiem.processing_chunk
    SET status = 'failed',
        retries = retries + 1,
        finished_at = NOW(),
        error = $3,
        updated_at = NOW()
    WHERE batch_id = $1
      AND chunk_index = $2
  `
  await pool.query(query, [batchId, chunkIndex, errorMessage])
}

async function getChunkSummary(batchId: string): Promise<ChunkSummary> {
  const query = `
    SELECT
      COUNT(*)::int AS total_chunks,
      COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_chunks,
      COUNT(*) FILTER (WHERE status = 'failed')::int AS failed_chunks,
      COUNT(*) FILTER (WHERE status = 'processing')::int AS processing_chunks,
      COUNT(*) FILTER (WHERE status = 'queued')::int AS queued_chunks
    FROM equiem.processing_chunk
    WHERE batch_id = $1
  `

  const result = await pool.query(query, [batchId])
  const row = result.rows[0] || {}

  return {
    totalChunks: Number(row.total_chunks || 0),
    completedChunks: Number(row.completed_chunks || 0),
    failedChunks: Number(row.failed_chunks || 0),
    processingChunks: Number(row.processing_chunks || 0),
    queuedChunks: Number(row.queued_chunks || 0),
  }
}

async function markBatchAsFinalizing(batchId: string): Promise<boolean> {
  const query = `
    UPDATE equiem.onboarding_batch
    SET status = 'finalizing'
    WHERE id = $1
      AND status = 'processing'
    RETURNING id
  `
  const result = await pool.query(query, [batchId])
  return (result.rowCount ?? 0) > 0
}

async function listBatchRawRows(batchId: string): Promise<BatchRawRow[]> {
  const query = `
    SELECT row_number, raw_data
    FROM equiem.onboarding_payload
    WHERE batch_id = $1
      AND is_valid = TRUE
    ORDER BY row_number ASC
  `
  const result = await pool.query(query, [batchId])

  return result.rows.map((row) => ({
    rowNumber: Number(row.row_number),
    rawData: (row.raw_data || {}) as Record<string, unknown>,
  }))
}

export {
  createOnboardingBatch,
  updateOnboardingBatchStatus,
  createProcessingJob,
  getLatestProcessingJobIdByBatch,
  updateProcessingJobStatus,
  createProcessingLog,
  saveOnboardingPayloads,
  saveOnboardingMappings,
  createProcessingChunks,
  claimProcessingChunk,
  completeProcessingChunk,
  failProcessingChunk,
  getChunkSummary,
  markBatchAsFinalizing,
  listBatchRawRows,
}