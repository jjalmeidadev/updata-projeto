// Sheet row type (generic spreadsheet row)
type SheetRow = Record<string, unknown>

declare const XLSX: {
  read: (data: Uint8Array, options: { type: string }) => {
    SheetNames: string[]
    Sheets: Record<string, unknown>
  }
  utils: {
    sheet_to_json: <T>(sheet: unknown) => T[]
  }
}

// API response type
interface UploadResponse {
  redirect: string
  data: SheetRow[]
  traceId?: string
}

// DOM elements
const fileInput = document.getElementById("fileInput") as HTMLInputElement | null
const manualButton = document.getElementById("manualButton") as HTMLButtonElement | null
const statusMessage = document.getElementById("statusMessage") as HTMLParagraphElement | null


function setStatus(message: string): void {

  if (statusMessage) {
    statusMessage.textContent = message
  }

}


function redirectToForm(data: SheetRow[] | null = null): void {

  // Persist parsed data client-side so the next page can hydrate immediately.
  if (data) {
    sessionStorage.setItem("uploadedData", JSON.stringify(data))
  }

  window.location.href = "/form"

}


async function sendParsedData(rows: SheetRow[]): Promise<UploadResponse> {

  // Backend receives already-parsed rows; file binary never leaves the browser.
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ rows })
  })

  if (!response.ok) {
    throw new Error(`Upload failed ${response.status}`)
  }

  return response.json()

}


async function handleUpload(event: Event): Promise<void> {

  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    setStatus("Select a file before uploading.")
    return
  }

  const formData = new FormData()
  formData.append("file", file)

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData  // ← CSV como binary, não JSON
    })
    
    const result = await response.json()
    console.log("Upload processed:", result)
    redirectToForm(result.data)
  } catch (error) {
    console.error("Upload error:", error)
  }

}


// Event listeners
if (fileInput) {
  fileInput.addEventListener("change", handleUpload)
}

if (manualButton) {
  manualButton.addEventListener("click", () => {
    redirectToForm()
  })
}