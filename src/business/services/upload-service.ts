import { UploadEntity } from "../entities/upload-entity.ts"
import { UploadRowDto } from "../dto/upload-row-dto.ts"


// Creates normalized upload entities from parsed spreadsheet rows.

function mapRowsToEntities(
  rows: UploadRowDto[],
  traceId = "no-trace"
): UploadEntity[] {

  console.log(`[FLOW][${traceId}] service:start rows=${rows.length}`)

  // Guard clause prevents from running with invalid input.
  if (!rows || rows.length === 0) {
    console.log(`[FLOW][${traceId}] service:empty_rows`)
    throw new Error("No rows received")
  }

  const entities = rows.map((row) => {
    const entity = new UploadEntity(row)
    entity.fields = entity.normalizeKeys()
    return entity
  })

  console.log(`[FLOW][${traceId}] service:entities_created count=${entities.length}`)

  return entities
}

export { mapRowsToEntities }