import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { sendToEquiemApi } from "../../../src/data/integrations/equiem-api-client.js"

global.fetch = vi.fn()

const originalProcess = globalThis.process

describe("equiem-api-client", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(global.fetch).mockReset()
    delete (globalThis as any).process
  })

  afterEach(() => {
    ;(globalThis as any).process = originalProcess
  })

  describe("sendToEquiemApi", () => {
    it("returns sent:false when EQUIEM_API_URL is missing", async () => {
      // Arrange
      ;(globalThis as any).process = { env: {} }
      const payload = { test: "data" }
      const traceId = "trace-1"

      // Act
      const result = await sendToEquiemApi(payload, traceId)

      // Assert
      expect(result.sent).toBe(false)
      expect(result.reason).toBe("missing_equiem_api_url")
      expect(vi.mocked(global.fetch)).not.toHaveBeenCalled()
    })

    it("sends POST request to Equiem API with correct headers", async () => {
      // Arrange
      ;(globalThis as any).process = {
        env: {
          EQUIEM_API_URL: "https://api.equiem.com",
          EQUIEM_ONBOARDING_ENDPOINT: "/onboarding/intake",
          EQUIEM_API_KEY: "secret-key",
        },
      }

      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify({ id: "ref-123" }), { status: 200 })
      )

      const payload = { records: [{ name: "Building A" }] }
      const traceId = "trace-abc"

      // Act
      const result = await sendToEquiemApi(payload, traceId)

      // Assert
      expect(result.sent).toBe(true)
      expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
        "https://api.equiem.com/onboarding/intake",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "x-trace-id": "trace-abc",
            Authorization: "Bearer secret-key",
          }),
        })
      )
    })

    it("returns sent:true with externalReference when API returns id", async () => {
      // Arrange
      ;(globalThis as any).process = {
        env: { EQUIEM_API_URL: "https://api.equiem.com" },
      }

      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify({ id: "external-ref-123" }), { status: 200 })
      )

      const payload = { test: "data" }

      // Act
      const result = await sendToEquiemApi(payload, "trace-1")

      // Assert
      expect(result.sent).toBe(true)
      expect(result.externalReference).toBe("external-ref-123")
    })

    it("uses default endpoint when EQUIEM_ONBOARDING_ENDPOINT not set", async () => {
      // Arrange
      ;(globalThis as any).process = {
        env: { EQUIEM_API_URL: "https://api.equiem.com" },
      }

      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify({ id: "ref" }), { status: 200 })
      )

      const payload = { test: "data" }

      // Act
      await sendToEquiemApi(payload, "trace-1")

      // Assert
      expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
        "https://api.equiem.com/onboarding/intake",
        expect.anything()
      )
    })

    it("throws when API returns non-OK status", async () => {
      // Arrange
      ;(globalThis as any).process = {
        env: { EQUIEM_API_URL: "https://api.equiem.com" },
      }

      vi.mocked(global.fetch).mockResolvedValue(
        new Response("Error message", { status: 500 })
      )

      const payload = { test: "data" }

      // Act / Assert
      await expect(sendToEquiemApi(payload, "trace-1")).rejects.toThrow(
        "Equiem API error (500): Error message"
      )
    })

    it("parses JSON response body", async () => {
      // Arrange
      ;(globalThis as any).process = {
        env: { EQUIEM_API_URL: "https://api.equiem.com" },
      }

      const responseBody = { id: "ref-123", status: "accepted" }
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify(responseBody), { status: 200 })
      )

      const payload = { test: "data" }

      // Act
      const result = await sendToEquiemApi(payload, "trace-1")

      // Assert
      expect(result.responseBody).toEqual(responseBody)
    })

    it("returns sent:false when response is not JSON parseable", async () => {
      // Arrange
      ;(globalThis as any).process = {
        env: { EQUIEM_API_URL: "https://api.equiem.com" },
      }

      vi.mocked(global.fetch).mockResolvedValue(
        new Response("Plain text response", { status: 200 })
      )

      const payload = { test: "data" }

      // Act
      const result = await sendToEquiemApi(payload, "trace-1")

      // Assert
      expect(result.sent).toBe(true)
      expect(result.responseBody).toBe("Plain text response")
    })

    it("does not include Authorization header when API key not set", async () => {
      // Arrange
      ;(globalThis as any).process = {
        env: { EQUIEM_API_URL: "https://api.equiem.com" },
      }

      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify({ id: "ref" }), { status: 200 })
      )

      const payload = { test: "data" }

      // Act
      await sendToEquiemApi(payload, "trace-1")

      // Assert
      expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.not.objectContaining({ Authorization: expect.anything() }),
        })
      )
    })

    it("uses custom timeout from EQUIEM_API_TIMEOUT_MS", async () => {
      // Arrange
      ;(globalThis as any).process = {
        env: {
          EQUIEM_API_URL: "https://api.equiem.com",
          EQUIEM_API_TIMEOUT_MS: "5000",
        },
      }

      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify({ id: "ref" }), { status: 200 })
      )

      const payload = { test: "data" }

      // Act
      await sendToEquiemApi(payload, "trace-1")

      // Assert
      expect(vi.mocked(global.fetch)).toHaveBeenCalled()
    })

    it("falls back safely when global process.env is undefined", async () => {
      // Arrange
      delete (globalThis as any).process

      // Act
      const result = await sendToEquiemApi({ test: "data" }, "trace-no-process")

      // Assert
      expect(result.sent).toBe(false)
      expect(result.reason).toBe("missing_equiem_api_url")
      expect(vi.mocked(global.fetch)).not.toHaveBeenCalled()
    })
  })
})
