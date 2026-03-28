import Papa from "papaparse"
import XLSX from "xlsx"
import { UploadRowDto } from "../dto/upload-row-dto.ts"

function parseCsvRows(content: string, traceId = "no-trace"): UploadRowDto[] {
  try {
    const parsed = Papa.parse<Record<string, unknown>>(content, {
      header: true,
      skipEmptyLines: true,
    })

    if (parsed.errors.length > 0) {
      console.warn(`[FLOW][${traceId}] parser:csv_warning errors=${parsed.errors.length}`, parsed.errors[0])
      // Continue com dados parciais em vez de quebrar
    }

    return parsed.data as UploadRowDto[]
  } catch (err) {
    console.error(`[FLOW][${traceId}] parser:csv_error`, err)
    return []
  }
}

function parseXlsxRows(fileBuffer: Uint8Array, traceId = "no-trace"): UploadRowDto[] {
  try {
    const workbook = XLSX.read(fileBuffer, { type: "array" })
    const firstSheetName = workbook.SheetNames[0]

    if (!firstSheetName) {
      console.warn(`[FLOW][${traceId}] parser:xlsx_warning no_sheets_found`)
      return []
    }

    const sheet = workbook.Sheets[firstSheetName]

    if (!sheet) {
      console.warn(`[FLOW][${traceId}] parser:xlsx_warning sheet_not_found`)
      return []
    }

    return XLSX.utils.sheet_to_json<UploadRowDto>(sheet, {
      defval: "",
    })
  } catch (err) {
    console.error(`[FLOW][${traceId}] parser:xlsx_error`, err)
    return []
  }
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

  try {
    if (extension === "csv") {
      const csvContent = new TextDecoder("utf-8").decode(fileBuffer)
      const rows = parseCsvRows(csvContent, traceId)
      console.log(`[FLOW][${traceId}] parser:csv_rows count=${rows.length}`)
      return rows
    }

    if (extension === "xlsx" || extension === "xls") {
      const rows = parseXlsxRows(fileBuffer, traceId)
      console.log(`[FLOW][${traceId}] parser:xlsx_rows count=${rows.length}`)
      return rows
    }

    console.error(`[FLOW][${traceId}] parser:unsupported_format extension=${extension}`)
    return []
  } catch (err) {
    console.error(`[FLOW][${traceId}] parser:fatal_error`, err)
    return []
  }
}

export { parseUploadFile }