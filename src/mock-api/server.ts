import express, { Request, Response } from "express"
import { randomUUID } from "crypto"

interface EquiemRecord {
  entityType: string
  rowNumber: number
  externalId: string
  name: string
  data: Record<string, unknown>
}

interface EquiemOnboardingPayload {
  source: string
  traceId: string
  fileName: string
  batchId: string
  records: EquiemRecord[]
}

interface ValidationResult {
  valid: boolean
  errors: string[]
  internalId?: string
}

const app = express()
app.use(express.json({ limit: "5mb" }))

const validators: Record<string, (record: EquiemRecord) => ValidationResult> = {
  customer: (record) => {
    const errors: string[] = []
    const { data } = record

    if (!data.name || typeof data.name !== "string") {
      errors.push("Customer: missing or invalid 'name'")
    }
    if (!data.region || typeof data.region !== "string") {
      errors.push("Customer: missing or invalid 'region' (expected: APAC, EMEA, AMERICAS)")
    }

    return {
      valid: errors.length === 0,
      errors,
      internalId: errors.length === 0 ? `cust-${randomUUID()}` : undefined,
    }
  },

  site: (record) => {
    const errors: string[] = []
    const { data } = record

    if (!data.name || typeof data.name !== "string") {
      errors.push("Site: missing or invalid 'name'")
    }
    if (!data.address || typeof data.address !== "string") {
      errors.push("Site: missing or invalid 'address'")
    }
    if (!data.timezone || typeof data.timezone !== "string") {
      errors.push("Site: missing or invalid 'timezone' (e.g., Australia/Melbourne)")
    }
    if (!data.customerId && typeof data.customerId !== "string") {
      errors.push("Site: missing or invalid 'customerId'")
    }

    return {
      valid: errors.length === 0,
      errors,
      internalId: errors.length === 0 ? `site-${randomUUID()}` : undefined,
    }
  },

  building: (record) => {
    const errors: string[] = []
    const { data } = record

    if (!data.name || typeof data.name !== "string") {
      errors.push("Building: missing or invalid 'name'")
    }
    if (typeof data.displayOrder !== "number") {
      errors.push("Building: missing or invalid 'displayOrder' (expected: number)")
    }
    if (!data.siteId || typeof data.siteId !== "string") {
      errors.push("Building: missing or invalid 'siteId'")
    }

    return {
      valid: errors.length === 0,
      errors,
      internalId: errors.length === 0 ? `bldg-${randomUUID()}` : undefined,
    }
  },

  level: (record) => {
    const errors: string[] = []
    const { data } = record

    if (!data.name || typeof data.name !== "string") {
      errors.push("Level: missing or invalid 'name'")
    }
    if (typeof data.displayOrder !== "number") {
      errors.push("Level: missing or invalid 'displayOrder' (expected: number)")
    }
    if (!data.buildingId || typeof data.buildingId !== "string") {
      errors.push("Level: missing or invalid 'buildingId'")
    }

    return {
      valid: errors.length === 0,
      errors,
      internalId: errors.length === 0 ? `lvl-${randomUUID()}` : undefined,
    }
  },

  space: (record) => {
    const errors: string[] = []
    const { data } = record

    if (!data.name || typeof data.name !== "string") {
      errors.push("Space: missing or invalid 'name'")
    }
    if (!data.levelId || typeof data.levelId !== "string") {
      errors.push("Space: missing or invalid 'levelId'")
    }
    if (!data.ownershipType || typeof data.ownershipType !== "string") {
      errors.push("Space: missing or invalid 'ownershipType' (leased, owned, etc)")
    }

    return {
      valid: errors.length === 0,
      errors,
      internalId: errors.length === 0 ? `spc-${randomUUID()}` : undefined,
    }
  },

  company: (record) => {
    const errors: string[] = []
    const { data } = record

    if (!data.name || typeof data.name !== "string") {
      errors.push("Company: missing or invalid 'name'")
    }
    if (!data.industry || typeof data.industry !== "string") {
      errors.push("Company: missing or invalid 'industry'")
    }

    return {
      valid: errors.length === 0,
      errors,
      internalId: errors.length === 0 ? `comp-${randomUUID()}` : undefined,
    }
  },

  apartment: (record) => {
    const errors: string[] = []
    const { data } = record

    if (!data.name || typeof data.name !== "string") {
      errors.push("Apartment: missing or invalid 'name'")
    }

    return {
      valid: errors.length === 0,
      errors,
      internalId: errors.length === 0 ? `apt-${randomUUID()}` : undefined,
    }
  },

  user: (record) => {
    const errors: string[] = []
    const { data } = record

    if (!data.firstName || typeof data.firstName !== "string") {
      errors.push("User: missing or invalid 'firstName'")
    }
    if (!data.lastName || typeof data.lastName !== "string") {
      errors.push("User: missing or invalid 'lastName'")
    }
    if (!data.email || typeof data.email !== "string" || !data.email.includes("@")) {
      errors.push("User: missing or invalid 'email'")
    }

    // memberSince: gerado automaticamente (hoje)
    // uuid: gerado automaticamente
    // auth0Id: pode vir ou é gerado

    return {
      valid: errors.length === 0,
      errors,
      internalId: errors.length === 0 ? `user-${randomUUID()}` : undefined,
    }
  },
}

app.get("/health", (_req: Request, res: Response) => {
  return res.status(200).json({ status: "ok" })
})

app.post("/onboarding/intake", (req: Request, res: Response) => {
  const payload = req.body as EquiemOnboardingPayload

  if (!payload || !Array.isArray(payload.records)) {
    return res.status(400).json({
      error: "Invalid payload. Expected records array.",
      traceId: payload?.traceId,
    })
  }

  console.log(
    `[MOCK-EQUIEM] Received intake for batchId=${payload.batchId}, records=${payload.records.length}, fileName=${payload.fileName}`
  )

  const mappings: Array<{
    entityType: string
    externalId: string
    internalId: string | null
    valid: boolean
    errors: string[]
  }> = []
  let validCount = 0
  let invalidCount = 0

  // Processa cada record com seu validador específico
  for (const record of payload.records) {
    const validator = validators[record.entityType]

    if (!validator) {
      console.warn(`[MOCK-EQUIEM] Unknown entityType: ${record.entityType}`)
      mappings.push({
        entityType: record.entityType,
        externalId: record.externalId,
        internalId: null,
        valid: false,
        errors: [`Unknown entityType: ${record.entityType}`],
      })
      invalidCount++
      continue
    }

    const result = validator(record)

    if (result.valid) {
      validCount++
      console.log(
        `[MOCK-EQUIEM] ✓ ${record.entityType} ${record.externalId} → ${result.internalId}`
      )
    } else {
      invalidCount++
      console.warn(`[MOCK-EQUIEM] ✗ ${record.entityType} ${record.externalId}:`, result.errors)
    }

    mappings.push({
      entityType: record.entityType,
      externalId: record.externalId,
      internalId: result.internalId ?? null,
      valid: result.valid,
      errors: result.errors,
    })
  }

  return res.status(201).json({
    id: `mock-job-${Date.now()}`,
    status: "accepted",
    traceId: payload.traceId,
    batchId: payload.batchId,
    fileName: payload.fileName,
    receivedRecords: payload.records.length,
    validRecords: validCount,
    invalidRecords: invalidCount,
    mappings,
  })
})

// Endpoints individuais para testes (opcional)
app.post("/customers", (req: Request, res: Response) => {
  const { name, region } = req.body
  if (!name || !region) {
    return res.status(400).json({ error: "Missing required fields: name, region" })
  }
  return res.status(201).json({
    id: `cust-${randomUUID()}`,
    name,
    region,
    status: "active",
  })
})

app.post("/users", (req: Request, res: Response) => {
  const { firstName, lastName, email } = req.body
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: "Missing required fields: firstName, lastName, email" })
  }
  return res.status(201).json({
    uuid: `user-${randomUUID()}`,
    firstName,
    lastName,
    email,
    emailVerified: true,
    status: "active",
    userType: "commercial",
    memberSince: new Date().toISOString(), // Gerado automaticamente
    auth0Id: `auth0|${randomUUID()}`,
  })
})

app.post("/companies", (req: Request, res: Response) => {
  const { name, industry } = req.body
  if (!name || !industry) {
    return res.status(400).json({ error: "Missing required fields: name, industry" })
  }
  return res.status(201).json({
    id: `comp-${randomUUID()}`,
    name,
    industry,
    attributes: [],
    approvedDomains: [],
    userApproval: "automatic",
  })
})

const port = Number(process.env.MOCK_EQUIEM_PORT || "4010")

app.listen(port, () => {
  console.log(`[MOCK-EQUIEM] running on port ${port}`)
  console.log(`[MOCK-EQUIEM] POST http://localhost:${port}/onboarding/intake`)
})