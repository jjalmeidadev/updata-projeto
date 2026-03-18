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
  })
})
