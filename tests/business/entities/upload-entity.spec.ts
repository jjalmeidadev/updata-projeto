import { describe, it, expect } from "vitest"
import { UploadEntity } from "../../../src/business/entities/upload-entity.js"

describe("UploadEntity", () => {
  describe("normalizeKeys", () => {
    it("applies trim, lowercase, and replaces spaces with underscore", () => {
      const row = { "  Building Name  ": "Tower A" }
      const entity = new UploadEntity(row)
      entity.fields = entity.normalizeKeys()
      expect(entity.fields).toEqual({ building_name: "Tower A" })
    })

    it("preserves key values", () => {
      const row = { Company: "Acme", "Size": 100 }
      const entity = new UploadEntity(row)
      entity.fields = entity.normalizeKeys()
      expect(entity.fields).toEqual({ company: "Acme", size: 100 })
    })

    it("keeps already normalized keys unchanged", () => {
      const row = { building_name: "Tower B" }
      const entity = new UploadEntity(row)
      entity.fields = entity.normalizeKeys()
      expect(entity.fields).toEqual({ building_name: "Tower B" })
    })

    it("handles multiple consecutive spaces", () => {
      const row = { "Building   Name": "Tower A" }
      const entity = new UploadEntity(row)
      entity.fields = entity.normalizeKeys()
      expect(entity.fields).toEqual({ building_name: "Tower A" })
    })

    it("preserves null and undefined values", () => {
      const row = { building_name: null, company_name: undefined, size: 0 }
      const entity = new UploadEntity(row)
      entity.fields = entity.normalizeKeys()
      expect(entity.fields).toEqual({ building_name: null, company_name: undefined, size: 0 })
    })

    it("handles empty object", () => {
      const row = {}
      const entity = new UploadEntity(row)
      entity.fields = entity.normalizeKeys()
      expect(entity.fields).toEqual({})
    })

    it("handles tab and newline characters in key names", () => {
      const row = { "Building\tName": "Tower A", "Company\nEmail": "test@acme.com" }
      const entity = new UploadEntity(row)
      entity.fields = entity.normalizeKeys()
      // Tabs and newlines should be treated as spaces and converted to underscores
      expect(entity.fields["building_name"]).toBe("Tower A")
      expect(entity.fields["company_email"]).toBe("test@acme.com")
    })

    it("preserves numeric values as-is", () => {
      const row = { "Building ID": 123, "Company Size": 45.67, "Is Active": true }
      const entity = new UploadEntity(row)
      entity.fields = entity.normalizeKeys()
      expect(entity.fields).toEqual({
        building_id: 123,
        company_size: 45.67,
        is_active: true,
      })
    })
  })
})
