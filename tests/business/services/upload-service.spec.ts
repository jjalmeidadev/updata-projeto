import { describe, it, expect } from "vitest"
import { mapRowsToEntities } from "../../../src/business/services/upload-service.js"

describe("upload-service", () => {
  describe("mapRowsToEntities", () => {
    it("throws when rows is null", () => {
      expect(() => mapRowsToEntities(null as unknown as never[], "trace-1")).toThrow("No rows received")
    })

    it("throws when rows is an empty array", () => {
      expect(() => mapRowsToEntities([], "trace-1")).toThrow("No rows received")
    })

    it("returns entities with normalized fields for valid rows", () => {
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
