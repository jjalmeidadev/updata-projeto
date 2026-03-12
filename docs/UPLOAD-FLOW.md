# Upload Flow README

## 1. Directory Structure

The upload flow is implemented across the following files and folders:

```text
g05/
├── config/
│   └── .env
├── src/
│   ├── server.ts
│   ├── business/
│   │   ├── dto/
│   │   │   └── upload-row-dto.ts
│   │   ├── entities/
│   │   │   └── upload-entity.ts
│   │   └── services/
│   │       └── upload-service.ts
│   └── presentation/
│       ├── api/
│       │   ├── controllers/
│       │   │   └── upload-controller.ts
│       │   └── routes/
│       │       └── upload-routes.ts
│       └── web/
│           ├── pages/
│           │   └── upload-page.html
│           └── scripts/
│               └── upload-listener.ts
└── docs/
   └── docs/
      └── UPLOAD-FLOW.md
```

## 2. Purpose

This document explains the complete spreadsheet upload flow for the `/api/upload` feature.
It describes:

- The end-to-end request lifecycle
- The responsibility of each file involved in the upload path
- The dependencies and configuration required to run the feature correctly
- How to validate and debug the flow quickly

## 3. Feature Scope

This flow starts when a user selects an `.xlsx` file in the upload page and ends when the backend returns one of the expected outcomes:

- `200` with normalized row data and `redirect` destination
- `400` when `rows` payload is missing or invalid
- `500` when processing fails unexpectedly

The current API response contract is:

```json
{
  "redirect": "/form",
  "data": [{ "normalized_key": "value" }],
  "traceId": "server-..."
}
```

## 4. End-to-End Flow

1. User opens `upload-page.html` and chooses an `.xlsx` file.
2. Frontend listener reads the file in browser memory (`FileReader`).
3. SheetJS parses the first worksheet into JSON rows.
4. Frontend sends `POST /api/upload` with body `{ rows: [...] }`.
5. Express route `/api/upload` forwards request to `handleUpload`.
6. Controller validates payload shape and creates/propagates `traceId`.
7. Controller delegates row normalization to business service.
8. Service maps rows to entities and normalizes field keys.
9. Controller returns normalized rows plus redirect target.
10. Frontend stores returned data in `sessionStorage` and navigates to redirect path.

## 5. File Responsibilities

### Presentation Layer

- `src/presentation/web/pages/upload-page.html`
  - Provides the upload html (file picker + manual button).
  - Loads SheetJS from CDN and calls upload script.

- `src/presentation/web/scripts/upload-listener.ts`
  - Reads selected `.xlsx` file.
  - Converts worksheet data to JSON rows.
  - Calls backend endpoint `/api/upload`.
  - Persists returned data in `sessionStorage` before redirect.

- `src/presentation/api/routes/upload-routes.ts`
  - Declares route `POST /api/upload`.
  - Binds route to controller entrypoint.

- `src/presentation/api/controllers/upload-controller.ts`
  - Validates request payload (`rows`).
  - Creates and returns `traceId` for observability.
  - Calls business service (`mapRowsToEntities`).
  - Returns normalized data and redirect metadata.

### Business Layer

- `src/business/dto/upload-row-dto.ts`
  - Defines input row contract used across upload modules.

- `src/business/services/upload-service.ts`
  - Orchestrates row-to-entity mapping.
  - Enforces guard clause for empty input.
  - Logs processing lifecycle using `traceId`.

- `src/business/entities/upload-entity.ts`
  - Encapsulates header normalization behavior.
  - Converts spreadsheet keys to normalized snake_case-like keys.

### App Entry Point

- `src/server.ts`
  - Creates Express app.
  - Registers JSON parser and routes.
  - Starts HTTP server on port `3000`.

## 6. Required Dependencies

Install the following runtime dependencies:

```bash
npm install express
```

Install the following development dependencies:

```bash
npm install -D typescript tsx @types/node @types/express
```

If there is no `package.json` yet, initialize first:

```bash
npm init -y
```

## 7. Environment Configuration

Create or update `config/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_DATABASE=postgres
DB_SSL=false
```

Notes:

- Upload endpoint itself does not query the database in the current implementation.
- Keep these values configured because the project includes DB modules that may be loaded by other routes.

## 8. Upload Parser Configuration

Spreadsheet parsing is configured in:

- `src/presentation/web/scripts/upload-listener.ts`

Current parsing behavior:

- Uses SheetJS `XLSX.read(..., { type: "array" })`
- Reads only the first worksheet (`workbook.SheetNames[0]`)
- Uses `XLSX.utils.sheet_to_json` to produce row objects

Operational implications:

- Header quality directly affects normalized output keys.
- Empty or malformed first sheets will produce empty or invalid payloads.
- Large files are currently processed synchronously in the request path.

## 9. How To Run

Run server (TypeScript) with:

```bash
npx tsx src/server.ts
```

Open the upload page from your frontend host and test file upload.

## 10. How To Validate The Flow Quickly

1. Start backend server.
2. Open the upload page.
3. Select a valid `.xlsx` file with headers and data.
4. Confirm request to `POST /api/upload` returns `200`.
5. Confirm response includes `redirect`, `data`, and `traceId`.
6. Confirm backend logs include `[FLOW][traceId]` entries for controller and service.

## 11. Common Failure Points

- Missing dependencies (`express`, `@types/express`, `tsx`, `typescript`)
- Route import issues in `src/server.ts` (wrong absolute paths or missing files)
- Frontend loading `.ts` directly in browser without bundling/transpilation
- Missing SheetJS CDN access in offline/restricted network environments
- Invalid payload shape (`rows` absent, non-array, or empty)
- Redirect path returned by API not implemented in frontend routes (for example `/form`)

## 12. Outcome

When configured correctly, this feature guarantees:

- Deterministic upload request handling through `/api/upload`
- Typed and validated payload flow from controller to service
- Consistent key normalization for spreadsheet-derived objects
- Traceable logs across upload modules using `traceId`
- Predictable API response contract for UI integration
