import { describe, it, expect } from "vitest"
import { mapRowsToEntities } from "../../../src/business/services/upload-service.js"

describe("upload-service", () => {
  describe("mapRowsToEntities", () => {
    it("lança quando rows é null", () => {
      expect(() => mapRowsToEntities(null as unknown as never[], "trace-1")).toThrow("No rows received")
    })

    it("lança quando rows é array vazio", () => {
      expect(() => mapRowsToEntities([], "trace-1")).toThrow("No rows received")
    })

    it("retorna entidades com fields normalizados para rows válidos", () => {
      const rows = [
        { "Building Name": "Tower A", Company: "Acme" },
        { "Building Name": "Tower B", Company: "Beta" },
      ]
      const entities = mapRowsToEntities(rows, "trace-1")
      expect(entities).toHaveLength(2)
      expect(entities[0].fields).toEqual({ building_name: "Tower A", company: "Acme" })
      expect(entities[1].fields).toEqual({ building_name: "Tower B", company: "Beta" })
    })
  })
})
