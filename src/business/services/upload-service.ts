import { UploadEntity } from "../entities/upload-entity.js"
import { UploadRowDto } from "../dto/upload-row-dto.js"


// Creates normalized upload entities from parsed spreadsheet rows.

function mapRowsToEntities(
  rows: UploadRowDto[],
  traceId = "no-trace"
): UploadEntity[] {

  // Guard clause prevents from running with invalid input.
  if (rows == null || !Array.isArray(rows) || rows.length === 0) {
    console.log(`[FLOW][${traceId}] service:empty_rows`)
    throw new Error("No rows received")
  }

  console.log(`[FLOW][${traceId}] service:start rows=${rows.length}`)

  const entities = rows.map((row) => {
    const entity = new UploadEntity(row)
    entity.fields = entity.normalizeKeys()
    return entity
  })

  console.log(`[FLOW][${traceId}] service:entities_created count=${entities.length}`)

  return entities
}

export { mapRowsToEntities }