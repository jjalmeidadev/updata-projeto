import Papa from "papaparse"
import XLSX from "xlsx"
import { UploadRowDto } from "../dto/upload-row-dto.ts"

function parseCsvRows(content: string): UploadRowDto[] {
  const parsed = Papa.parse<Record<string, unknown>>(content, {
    header: true,
    skipEmptyLines: true,
  })

  if (parsed.errors.length > 0) {
    throw new Error(`CSV parse error: ${parsed.errors[0].message}`)
  }

  return parsed.data as UploadRowDto[]
}

function parseXlsxRows(fileBuffer: Uint8Array): UploadRowDto[] {
  const workbook = XLSX.read(fileBuffer, { type: "array" })
  const firstSheetName = workbook.SheetNames[0]

  if (!firstSheetName) {
    return []
  }

  const sheet = workbook.Sheets[firstSheetName]

  if (!sheet) {
    return []
  }

  return XLSX.utils.sheet_to_json<UploadRowDto>(sheet, {
    defval: "",
  })
}

function getFileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split(".")
  return parts.length > 1 ? parts[parts.length - 1] : ""
}

function parseUploadFile(
  fileBuffer: Uint8Array,
  fileName: string,
  traceId = "no-trace"
): UploadRowDto[] {
  const extension = getFileExtension(fileName)

  console.log(`[FLOW][${traceId}] parser:start extension=${extension || "unknown"}`)

  if (extension === "csv") {
    const csvContent = new TextDecoder("utf-8").decode(fileBuffer)
    const rows = parseCsvRows(csvContent)
    console.log(`[FLOW][${traceId}] parser:csv_rows count=${rows.length}`)
    return rows
  }

  if (extension === "xlsx" || extension === "xls") {
    const rows = parseXlsxRows(fileBuffer)
    console.log(`[FLOW][${traceId}] parser:xlsx_rows count=${rows.length}`)
    return rows
  }

  throw new Error("Unsupported file format. Supported formats: .csv, .xlsx, .xls")
}

export { parseUploadFile }