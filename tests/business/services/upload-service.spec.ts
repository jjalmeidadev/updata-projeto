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

    it("throws when rows is not an array", () => {
      expect(() => mapRowsToEntities({} as unknown as never[], "trace-1")).toThrow("No rows received")
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

    it("returns correct count of entities", () => {
      const rows = [
        { name: "Building A" },
        { name: "Building B" },
        { name: "Building C" },
      ]
      const entities = mapRowsToEntities(rows, "trace-1")
      expect(entities).toHaveLength(3)
    })

    it("preserves row order in entities", () => {
      const rows = [
        { id: "1", name: "First" },
        { id: "2", name: "Second" },
        { id: "3", name: "Third" },
      ]
      const entities = mapRowsToEntities(rows, "trace-1")
      expect(entities[0].fields).toEqual({ id: "1", name: "First" })
      expect(entities[1].fields).toEqual({ id: "2", name: "Second" })
      expect(entities[2].fields).toEqual({ id: "3", name: "Third" })
    })

    it("handles single row", () => {
      const rows = [{ "Building Name": "Tower A" }]
      const entities = mapRowsToEntities(rows, "trace-1")
      expect(entities).toHaveLength(1)
      expect(entities[0].fields).toEqual({ building_name: "Tower A" })
    })

    it("normalizes each entity independently", () => {
      const rows = [
        { "  FIELD ONE  ": "value1" },
        { "  FIELD TWO  ": "value2" },
      ]
      const entities = mapRowsToEntities(rows, "trace-1")
      expect(entities[0].fields).toEqual({ field_one: "value1" })
      expect(entities[1].fields).toEqual({ field_two: "value2" })
    })
  })
})
