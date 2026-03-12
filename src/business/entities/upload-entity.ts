import { UploadRowDto } from "../dto/upload-row-dto.ts"

class UploadEntity {

  fields: UploadRowDto

  constructor(fields: UploadRowDto) {
    this.fields = fields
  }

  // Normalize keys coming from spreadsheet headers
  normalizeKeys(): UploadRowDto {

    const normalized: UploadRowDto = {}

    Object.keys(this.fields).forEach((key) => {
      const cleanKey = key.trim().toLowerCase().replace(/\s+/g, "_")
      normalized[cleanKey] = this.fields[key]
    })

    return normalized

  }

}

export { UploadEntity }