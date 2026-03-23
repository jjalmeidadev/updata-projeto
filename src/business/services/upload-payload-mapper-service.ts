import { UploadRowDto } from "../dto/upload-row-dto.ts"

interface ParsedUploadRecord {
  rowNumber: number
  entityType: string
  isValid: boolean
  validationErrors: string[]
  rawData: Record<string, unknown>
  normalizedData: Record<string, unknown>
}

interface EquiemOnboardingPayload {
  source: "upload"
  traceId: string
  fileName: string
  batchId: string
  records: Array<{
    entityType: string
    rowNumber: number
    externalId: string
    name: string
    data: Record<string, unknown>
  }>
}

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/\s+/g, "_")
}

function normalizeRow(row: UploadRowDto): Record<string, unknown> {
  const normalized: Record<string, unknown> = {}

  Object.keys(row).forEach((key) => {
    normalized[normalizeKey(key)] = row[key]
  })

  return normalized
}

function pickString(data: Record<string, unknown>, candidates: string[]): string {
  for (const candidate of candidates) {
    const value = data[candidate]
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim()
    }
    if (typeof value === "number") {
      return String(value)
    }
  }

  return ""
}

function resolveEntityType(normalizedRow: Record<string, unknown>): string {
  const explicit = pickString(normalizedRow, ["entity_type", "entity"])
  if (explicit) {
    return explicit.toLowerCase()
  }

  if (normalizedRow.building_name || normalizedRow.site_name) {
    return "building"
  }

  if (normalizedRow.company_name || normalizedRow.company_email) {
    return "company"
  }

  if (normalizedRow.user_email || normalizedRow.auth0_id) {
    return "user"
  }

  return "generic"
}

function validateRecord(entityType: string, normalizedRow: Record<string, unknown>): string[] {
  const errors: string[] = []

  const externalId = pickString(normalizedRow, ["external_id", "id", `${entityType}_id`])
  const name = pickString(normalizedRow, ["name", `${entityType}_name`, "title"])

  if (!externalId) {
    errors.push("Missing required field: external_id")
  }

  if (!name && entityType !== "user") {
    errors.push("Missing required field: name")
  }

  if (entityType === "user") {
    const email = pickString(normalizedRow, ["email", "user_email"])
    if (!email) {
      errors.push("Missing required field: user_email")
    }
  }

  return errors
}

function mapRowsForProcessing(rows: UploadRowDto[], traceId = "no-trace"): ParsedUploadRecord[] {
  console.log(`[FLOW][${traceId}] mapper:start rows=${rows.length}`)

  const records = rows.map((row, index) => {
    const normalizedData = normalizeRow(row)
    const entityType = resolveEntityType(normalizedData)
    const validationErrors = validateRecord(entityType, normalizedData)

    return {
      rowNumber: index + 1,
      entityType,
      isValid: validationErrors.length === 0,
      validationErrors,
      rawData: row as Record<string, unknown>,
      normalizedData,
    }
  })

  const validCount = records.filter((record) => record.isValid).length
  const invalidCount = records.length - validCount

  console.log(`[FLOW][${traceId}] mapper:finished valid=${validCount} invalid=${invalidCount}`)

  return records
}

function buildEquiemPayload(
  records: ParsedUploadRecord[],
  context: { traceId: string; fileName: string; batchId: string }
): EquiemOnboardingPayload {
  const mappedRecords = records
    .filter((record) => record.isValid)
    .map((record) => {
      const externalId = pickString(record.normalizedData, ["external_id", "id", `${record.entityType}_id`])
      const name = pickString(record.normalizedData, ["name", `${record.entityType}_name`, "title", "user_email"])

      return {
        entityType: record.entityType,
        rowNumber: record.rowNumber,
        externalId,
        name,
        data: record.normalizedData,
      }
    })

  return {
    source: "upload",
    traceId: context.traceId,
    fileName: context.fileName,
    batchId: context.batchId,
    records: mappedRecords,
  }
}

export { buildEquiemPayload, mapRowsForProcessing }
export type { ParsedUploadRecord, EquiemOnboardingPayload }