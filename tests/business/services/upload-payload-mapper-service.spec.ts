import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  mapRowsForProcessing,
  buildEquiemPayload,
} from "../../../src/business/services/upload-payload-mapper-service.js"
import type { ParsedUploadRecord, EquiemOnboardingPayload } from "../../../src/business/services/upload-payload-mapper-service.js"

describe("upload-payload-mapper-service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("mapRowsForProcessing", () => {
    it("normalizes row keys to lowercase with underscores", () => {
      // Arrange
      const rows = [
        { "Building Name": "Tower A", "Company Email": "test@acme.com" },
      ]
      const traceId = "trace-1"

      // Act
      const records = mapRowsForProcessing(rows, traceId)

      // Assert
      expect(records).toHaveLength(1)
      expect(records[0].normalizedData).toEqual({
        building_name: "Tower A",
        company_email: "test@acme.com",
      })
    })

    it("resolves entity type from building_name field", () => {
      // Arrange
      const rows = [{ building_name: "Tower A", site_name: "Downtown" }]
      const traceId = "trace-1"

      // Act
      const records = mapRowsForProcessing(rows, traceId)

      // Assert
      expect(records[0].entityType).toBe("building")
    })

    it("resolves entity type from company_name field", () => {
      // Arrange
      const rows = [{ company_name: "Acme Inc", company_email: "contact@acme.com" }]
      const traceId = "trace-1"

      // Act
      const records = mapRowsForProcessing(rows, traceId)

      // Assert
      expect(records[0].entityType).toBe("company")
    })

    it("resolves entity type from user_email field", () => {
      // Arrange
      const rows = [{ user_email: "john@example.com", auth0_id: "auth0|123" }]
      const traceId = "trace-1"

      // Act
      const records = mapRowsForProcessing(rows, traceId)

      // Assert
      expect(records[0].entityType).toBe("user")
    })

    it("resolves entity type from explicit entity_type field", () => {
      // Arrange
      const rows = [{ entity_type: "COMPANY", external_id: "c1", name: "Acme" }]

      // Act
      const records = mapRowsForProcessing(rows, "trace-1")

      // Assert
      expect(records[0].entityType).toBe("company")
    })

    it("resolves entity type from company_email when company_name is absent", () => {
      // Arrange
      const rows = [{ company_email: "ops@acme.com", external_id: "c1", name: "Acme" }]

      // Act
      const records = mapRowsForProcessing(rows, "trace-1")

      // Assert
      expect(records[0].entityType).toBe("company")
    })

    it("resolves entity type to generic when no matcher found", () => {
      // Arrange
      const rows = [{ random_field: "no match" }]
      const traceId = "trace-1"

      // Act
      const records = mapRowsForProcessing(rows, traceId)

      // Assert
      expect(records[0].entityType).toBe("generic")
    })

    it("validates building records with external_id and name", () => {
      // Arrange
      const rows = [
        { external_id: "b1", name: "Building A", building_name: "Tower A" },
      ]
      const traceId = "trace-1"

      // Act
      const records = mapRowsForProcessing(rows, traceId)

      // Assert
      expect(records[0].isValid).toBe(true)
      expect(records[0].validationErrors).toEqual([])
    })

    it("marks record invalid when external_id is missing", () => {
      // Arrange
      const rows = [{ name: "Building A", building_name: "Tower A" }]
      const traceId = "trace-1"

      // Act
      const records = mapRowsForProcessing(rows, traceId)

      // Assert
      expect(records[0].isValid).toBe(false)
      expect(records[0].validationErrors).toContain(
        "Missing required field: external_id"
      )
    })

    it("marks user record invalid when user_email is missing", () => {
      // Arrange
      const rows = [{ external_id: "u1", user_email: "", auth0_id: "auth0|1" }]
      const traceId = "trace-1"

      // Act
      const records = mapRowsForProcessing(rows, traceId)

      // Assert
      expect(records[0].isValid).toBe(false)
      expect(records[0].validationErrors).toContain(
        "Missing required field: user_email"
      )
    })

    it("maps multiple rows with correct row numbers", () => {
      // Arrange
      const rows = [
        { external_id: "b1", name: "Building A", building_name: "Tower" },
        { external_id: "b2", name: "Building B", building_name: "Tower B" },
        { external_id: "b3", name: "Building C", building_name: "Tower C" },
      ]
      const traceId = "trace-1"

      // Act
      const records = mapRowsForProcessing(rows, traceId)

      // Assert
      expect(records).toHaveLength(3)
      expect(records[0].rowNumber).toBe(1)
      expect(records[1].rowNumber).toBe(2)
      expect(records[2].rowNumber).toBe(3)
    })

    it("counts valid and invalid records correctly", () => {
      // Arrange
      const rows = [
        { external_id: "b1", name: "Valid", building_name: "Tower" },
        { name: "Invalid", building_name: "Tower" },
        { external_id: "b3", name: "Valid", building_name: "Tower" },
      ]
      const traceId = "trace-1"

      // Act
      const records = mapRowsForProcessing(rows, traceId)

      // Assert
      const validCount = records.filter((r) => r.isValid).length
      const invalidCount = records.filter((r) => !r.isValid).length
      expect(validCount).toBe(2)
      expect(invalidCount).toBe(1)
    })
  })

  describe("buildEquiemPayload", () => {
    it("filters out invalid records from payload", () => {
      // Arrange
      const records: ParsedUploadRecord[] = [
        {
          rowNumber: 1,
          entityType: "building",
          isValid: true,
          validationErrors: [],
          rawData: { name: "Tower A" },
          normalizedData: { external_id: "b1", name: "Tower A" },
        },
        {
          rowNumber: 2,
          entityType: "building",
          isValid: false,
          validationErrors: ["Missing external_id"],
          rawData: { name: "Tower B" },
          normalizedData: { name: "Tower B" },
        },
      ]
      const context = { traceId: "trace-1", fileName: "data.csv", batchId: "batch-1" }

      // Act
      const payload = buildEquiemPayload(records, context)

      // Assert
      expect(payload.records).toHaveLength(1)
      expect(payload.records[0].name).toBe("Tower A")
    })

    it("includes context in payload", () => {
      // Arrange
      const records: ParsedUploadRecord[] = [
        {
          rowNumber: 1,
          entityType: "building",
          isValid: true,
          validationErrors: [],
          rawData: {},
          normalizedData: { external_id: "b1", name: "Tower A" },
        },
      ]
      const context = {
        traceId: "trace-abc",
        fileName: "upload.csv",
        batchId: "batch-xyz",
      }

      // Act
      const payload = buildEquiemPayload(records, context)

      // Assert
      expect(payload.traceId).toBe("trace-abc")
      expect(payload.fileName).toBe("upload.csv")
      expect(payload.batchId).toBe("batch-xyz")
      expect(payload.source).toBe("upload")
    })

    it("extracts externalId and name from normalized data", () => {
      // Arrange
      const records: ParsedUploadRecord[] = [
        {
          rowNumber: 1,
          entityType: "building",
          isValid: true,
          validationErrors: [],
          rawData: {},
          normalizedData: {
            external_id: "ext-123",
            building_name: "Main Tower",
          },
        },
      ]
      const context = { traceId: "trace-1", fileName: "data.csv", batchId: "b1" }

      // Act
      const payload = buildEquiemPayload(records, context)

      // Assert
      expect(payload.records[0].externalId).toBe("ext-123")
      expect(payload.records[0].name).toBe("Main Tower")
    })

    it("uses fallback name when primary name field missing", () => {
      // Arrange
      const records: ParsedUploadRecord[] = [
        {
          rowNumber: 1,
          entityType: "building",
          isValid: true,
          validationErrors: [],
          rawData: {},
          normalizedData: { external_id: "b1", title: "Secondary Title" },
        },
      ]
      const context = { traceId: "trace-1", fileName: "data.csv", batchId: "b1" }

      // Act
      const payload = buildEquiemPayload(records, context)

      // Assert
      expect(payload.records[0].name).toBe("Secondary Title")
    })

    it("coerces numeric external id to string in payload", () => {
      // Arrange
      const records: ParsedUploadRecord[] = [
        {
          rowNumber: 1,
          entityType: "building",
          isValid: true,
          validationErrors: [],
          rawData: {},
          normalizedData: { external_id: 1234, name: "Tower A" },
        },
      ]

      // Act
      const payload = buildEquiemPayload(records, {
        traceId: "trace-1",
        fileName: "data.csv",
        batchId: "batch-1",
      })

      // Assert
      expect(payload.records[0].externalId).toBe("1234")
    })

    it("includes normalized data in payload record", () => {
      // Arrange
      const normalizedData = {
        external_id: "b1",
        name: "Tower A",
        location: "NYC",
      }
      const records: ParsedUploadRecord[] = [
        {
          rowNumber: 1,
          entityType: "building",
          isValid: true,
          validationErrors: [],
          rawData: {},
          normalizedData,
        },
      ]
      const context = { traceId: "trace-1", fileName: "data.csv", batchId: "b1" }

      // Act
      const payload = buildEquiemPayload(records, context)

      // Assert
      expect(payload.records[0].data).toEqual(normalizedData)
    })
  })
})
