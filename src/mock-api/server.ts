import express, { Request, Response } from "express"

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

const app = express()
app.use(express.json({ limit: "5mb" }))

app.get("/health", (_req: Request, res: Response) => {
  return res.status(200).json({ status: "ok" })
})

app.post("/onboarding/intake", (req: Request, res: Response) => {
  const payload = req.body as EquiemOnboardingPayload

  if (!payload || !Array.isArray(payload.records)) {
    return res.status(400).json({
      error: "Invalid payload. Expected records array.",
    })
  }

  const mappings = payload.records.map((record) => ({
    entityType: record.entityType,
    externalId: record.externalId,
    internalId: crypto.randomUUID(),
  }))

  return res.status(201).json({
    id: `mock-job-${Date.now()}`,
    status: "accepted",
    receivedRecords: payload.records.length,
    mappings,
  })
})

const port = Number(process.env.MOCK_EQUIEM_PORT || "4010")

app.listen(port, () => {
  console.log(`[MOCK-EQUIEM] running on port ${port}`)
})