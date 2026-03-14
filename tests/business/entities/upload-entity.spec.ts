import { describe, it, expect } from "vitest"
import { UploadEntity } from "../../../src/business/entities/upload-entity.js"

describe("UploadEntity", () => {
  describe("normalizeKeys", () => {
    it("aplica trim, lowercase e substitui espaços por underscore", () => {
      const row = { "  Building Name  ": "Tower A" }
      const entity = new UploadEntity(row)
      entity.fields = entity.normalizeKeys()
      expect(entity.fields).toEqual({ building_name: "Tower A" })
    })

    it("preserva valores das chaves", () => {
      const row = { Company: "Acme", "Size": 100 }
      const entity = new UploadEntity(row)
      entity.fields = entity.normalizeKeys()
      expect(entity.fields).toEqual({ company: "Acme", size: 100 })
    })

    it("mantém chaves já normalizadas corretas", () => {
      const row = { building_name: "Tower B" }
      const entity = new UploadEntity(row)
      entity.fields = entity.normalizeKeys()
      expect(entity.fields).toEqual({ building_name: "Tower B" })
    })
  })
})
