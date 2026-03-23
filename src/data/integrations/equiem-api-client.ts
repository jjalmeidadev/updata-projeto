interface EquiemSendResult {
  sent: boolean
  reason?: string
  externalReference?: string
  responseBody?: unknown
}

function getEnv(): Record<string, string | undefined> {
  return ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}) as Record<
    string,
    string | undefined
  >
}

async function sendToEquiemApi(payload: unknown, traceId = "no-trace"): Promise<EquiemSendResult> {
  const env = getEnv()
  const baseUrl = env.EQUIEM_API_URL
  const endpoint = env.EQUIEM_ONBOARDING_ENDPOINT || "/onboarding/intake"
  const apiKey = env.EQUIEM_API_KEY
  const timeoutMs = Number(env.EQUIEM_API_TIMEOUT_MS || "15000")

  if (!baseUrl) {
    console.warn(`[FLOW][${traceId}] equiem:skipped missing EQUIEM_API_URL`)
    return { sent: false, reason: "missing_equiem_api_url" }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-trace-id": traceId,
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    const rawBody = await response.text()
    let parsedBody: unknown = rawBody

    if (rawBody) {
      try {
        parsedBody = JSON.parse(rawBody)
      } catch {
        parsedBody = rawBody
      }
    }

    if (!response.ok) {
      throw new Error(`Equiem API error (${response.status}): ${rawBody}`)
    }

    const externalReference =
      typeof parsedBody === "object" && parsedBody !== null && "id" in parsedBody
        ? String((parsedBody as { id: unknown }).id)
        : undefined

    console.log(`[FLOW][${traceId}] equiem:sent status=${response.status}`)

    return {
      sent: true,
      externalReference,
      responseBody: parsedBody,
    }
  } finally {
    clearTimeout(timeout)
  }
}

export { sendToEquiemApi }
export type { EquiemSendResult }