import { describe, it, expect, beforeEach, vi } from "vitest"
import { parseUploadFile } from "../../../src/business/services/upload-file-parser-service.js"

// Mock Papa and XLSX
vi.mock("papaparse", () => ({
  default: {
    parse: vi.fn(),
  },
}))

vi.mock("xlsx", () => ({
  default: {
    read: vi.fn(),
    utils: {
      sheet_to_json: vi.fn(),
    },
  },
}))

import Papa from "papaparse"
import XLSX from "xlsx"

describe("upload-file-parser-service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("parseUploadFile", () => {
    it("parses CSV files by extension", () => {
      // Arrange
      const csvContent = "name,email\nJohn,john@example.com"
      const fileBuffer = new TextEncoder().encode(csvContent)
      const fileName = "data.csv"
      const traceId = "trace-1"

      vi.mocked(Papa.parse).mockReturnValue({
        data: [{ name: "John", email: "john@example.com" }],
        errors: [],
      } as never)

      // Act
      const result = parseUploadFile(fileBuffer, fileName, traceId)

      // Assert
      expect(Papa.parse).toHaveBeenCalledWith(
        csvContent,
        expect.objectContaining({ header: true, skipEmptyLines: true })
      )
      expect(result).toEqual([{ name: "John", email: "john@example.com" }])
    })

    it("parses XLSX files (.xlsx extension)", () => {
      // Arrange
      const fileBuffer = new Uint8Array([1, 2, 3])
      const fileName = "data.xlsx"
      const traceId = "trace-1"

      const mockWorkbook = {
        SheetNames: ["Sheet1"],
        Sheets: { Sheet1: { A1: { v: "name" }, B1: { v: "email" } } },
      }

      vi.mocked(XLSX.read).mockReturnValue(mockWorkbook as never)
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([
        { name: "John", email: "john@example.com" },
      ] as never)

      // Act
      const result = parseUploadFile(fileBuffer, fileName, traceId)

      // Assert
      expect(XLSX.read).toHaveBeenCalledWith(fileBuffer, { type: "array" })
      expect(XLSX.utils.sheet_to_json).toHaveBeenCalledWith(
        mockWorkbook.Sheets["Sheet1"],
        { defval: "" }
      )
      expect(result).toEqual([{ name: "John", email: "john@example.com" }])
    })

    it("parses XLS files (.xls extension)", () => {
      // Arrange
      const fileBuffer = new Uint8Array([1, 2, 3])
      const fileName = "data.xls"
      const traceId = "trace-1"

      const mockWorkbook = {
        SheetNames: ["Sheet1"],
        Sheets: { Sheet1: {} },
      }

      vi.mocked(XLSX.read).mockReturnValue(mockWorkbook as never)
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([
        { name: "Alice", email: "alice@example.com" },
      ] as never)

      // Act
      const result = parseUploadFile(fileBuffer, fileName, traceId)

      // Assert
      expect(XLSX.read).toHaveBeenCalledWith(fileBuffer, { type: "array" })
      expect(result).toEqual([{ name: "Alice", email: "alice@example.com" }])
    })

    it("throws error for unsupported file formats", () => {
      // Arrange
      const fileBuffer = new Uint8Array([1, 2, 3])
      const fileName = "data.pdf"
      const traceId = "trace-1"

      // Act & Assert
      expect(() => parseUploadFile(fileBuffer, fileName, traceId)).toThrow(
        "Unsupported file format. Supported formats: .csv, .xlsx, .xls"
      )
    })

    it("throws unsupported format when file has no extension", () => {
      // Arrange
      const fileBuffer = new Uint8Array([1, 2, 3])

      // Act / Assert
      expect(() => parseUploadFile(fileBuffer, "upload", "trace-1")).toThrow(
        "Unsupported file format. Supported formats: .csv, .xlsx, .xls"
      )
    })

    it("throws error when CSV parsing fails", () => {
      // Arrange
      const fileBuffer = new TextEncoder().encode("invalid csv")
      const fileName = "data.csv"
      const traceId = "trace-1"

      vi.mocked(Papa.parse).mockReturnValue({
        data: [],
        errors: [{ message: "CSV error" }],
      } as never)

      // Act & Assert
      expect(() => parseUploadFile(fileBuffer, fileName, traceId)).toThrow(
        "CSV parse error: CSV error"
      )
    })

    it("handles empty workbook in XLSX", () => {
      // Arrange
      const fileBuffer = new Uint8Array([1, 2, 3])
      const fileName = "empty.xlsx"
      const traceId = "trace-1"

      const mockWorkbook = {
        SheetNames: [],
        Sheets: {},
      }

      vi.mocked(XLSX.read).mockReturnValue(mockWorkbook as never)

      // Act
      const result = parseUploadFile(fileBuffer, fileName, traceId)

      // Assert
      expect(result).toEqual([])
    })

    it("returns empty array when first sheet is missing from workbook map", () => {
      // Arrange
      const fileBuffer = new Uint8Array([1, 2, 3])
      const fileName = "missing-sheet.xlsx"
      const traceId = "trace-1"

      vi.mocked(XLSX.read).mockReturnValue({
        SheetNames: ["Sheet1"],
        Sheets: {},
      } as never)

      // Act
      const result = parseUploadFile(fileBuffer, fileName, traceId)

      // Assert
      expect(result).toEqual([])
    })

    it("is case-insensitive for file extensions", () => {
      // Arrange
      const csvContent = "name\nJohn"
      const fileBuffer = new TextEncoder().encode(csvContent)
      const fileName = "data.CSV"
      const traceId = "trace-1"

      vi.mocked(Papa.parse).mockReturnValue({
        data: [{ name: "John" }],
        errors: [],
      } as never)

      // Act
      const result = parseUploadFile(fileBuffer, fileName, traceId)

      // Assert
      expect(Papa.parse).toHaveBeenCalled()
      expect(result).toEqual([{ name: "John" }])
    })
  })
})
