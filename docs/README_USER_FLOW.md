# User Flow README

## 1. Directory Structure

The user flow is implemented across the following files and folders:

```text
g05/
├── config/
│   └── .env
├── src/
│   ├── server.ts
│   ├── business/
│   │   ├── entities/
│   │   │   └── user-entity.ts
│   │   └── services/
│   │       └── user-service.ts
│   ├── data/
│   │   ├── database/
│   │   │   └── index-table.ts
│   │   └── repositories/
│   │       └── user-repository.ts
│   └── presentation/
│       ├── api/
│       │   ├── controllers/
│       │   │   └── user-controllers.ts
│       │   ├── middleware/
│       │   │   └── auth-middleware.ts
│       │   └── routes/
│       │       └── user-routes.ts
│       └── web/
│           ├── pages/
│           │   └── user-mock-auth.html
│           └── scripts/
│               └── user-mock-listener.js
└── docs/
  └── README_USER_FLOW.md
```

## 2. Purpose

This document explains the complete user authentication flow for the `/api/users` feature.
It describes:

- The end-to-end request lifecycle
- The responsibility of each file involved in the flow
- The dependencies and environment configuration required to run the feature correctly
- How to validate and debug the flow

## 3. Feature Scope

This flow starts when a user submits a JWT token in the mock web page and ends when the backend returns one of the expected outcomes:

- Redirect to `/monitoring` for internal users (`@getequiem.com`)
- Redirect to `/company/:company_id` for users linked to a company
- `403` when the user exists but has no company
- `404` when no user is found
- `500` when an unexpected processing error occurs

## 4. End-to-End Flow

1. User opens `user-mock-auth.html` and enters a token.
2. On click, frontend JS reads the token and calls `GET /api/users` with `Authorization: Bearer <token>`.
3. Express route `/api/users` applies JWT middleware first.
4. If the token is valid, controller reads `req.auth.payload` and delegates to service.
5. Service checks if user already exists by `auth0_id`.
6. If user does not exist, service extracts email domain and tries to resolve `company_id`.
7. Service creates the user if needed.
8. Controller decides the response:
   - internal email -> `/monitoring`
   - has `company_id` -> `/company/:company_id`
   - no company -> `403`

## 5. File Responsibilities

### Presentation Layer

- `src/presentation/web/pages/user-mock-auth.html`
  - Provides the mock UI for token input and request trigger.

- `src/presentation/web/scripts/user-mock-listener.js`
  - Captures button click.
  - Reads token.
  - Calls backend endpoint `/api/users`.
  - Logs API response or request error in browser console.

- `src/presentation/api/routes/user-routes.ts`
  - Declares route `GET /api/users`.
  - Enforces middleware order: `authMiddleware` then `getPayload`.

- `src/presentation/api/middleware/auth-middleware.ts`
  - Validates Bearer JWT using Auth0 issuer and API audience.

- `src/presentation/api/controllers/user-controllers.ts`
  - Entry point after auth.
  - Reads JWT payload.
  - Calls business service (`checkUser`).
  - Applies routing decision rules (`/monitoring`, `/company/:id`, `403`, `404`, `500`).

### Business Layer

- `src/business/services/user-service.ts`
  - Orchestrates user lookup and creation logic.
  - Uses entity to derive email domain.
  - Connects payload data to repository operations.

- `src/business/entities/user-entity.ts`
  - Domain helper to extract and normalize email domain.

### Data Layer

- `src/data/repositories/user-repository.ts`
  - Performs persistence operations:
    - `findUser(auth0Id)`
    - `findCompanyByDomain(domain)`
    - `createUser(user)`

- `src/data/database/index-table.ts`
  - Loads environment variables.
  - Creates and exports PostgreSQL connection pool.

### App Entry Point

- `src/server.ts`
  - Creates Express app.
  - Registers JSON parser and routes.
  - Starts HTTP server on port `3000`.

## 6. Required Dependencies

Install the following runtime dependencies:

```bash
npm install express express-oauth2-jwt-bearer dotenv pg
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

Create or update `config/.env` with valid values:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_DATABASE=postgres
DB_SSL=false
```

Important notes:

- `DB_PORT` must be numeric.
- `DB_SSL=true` enables SSL mode in the database pool.
- Empty DB values will break repository queries at runtime.

## 8. Auth Middleware Configuration

Current JWT validation config is in:

- `src/presentation/api/middleware/auth-middleware.ts`

Expected meaning:

- `issuerBaseURL`: Auth0 tenant issuer URL
- `audience`: API identifier expected in token `aud`

Ensure these values match your Auth0 API configuration, otherwise valid tokens can be rejected.

## 9. How To Run

Run server (TypeScript) with:

```bash
npx tsx src/server.ts
```

Open mock page from a local static server or your frontend host and test the button flow.

## 10. How To Validate The Flow Quickly

1. Start backend server.
2. Open the mock page.
3. Paste a valid JWT.
4. Click `Send Mocked Token`.
5. Confirm one of the expected outcomes:
   - Browser receives redirect
   - Browser receives `403`/`404`
   - Backend logs flow events (`[FLOW][traceId] ...`)

## 11. Common Failure Points

- Missing NPM dependencies (`express`, `pg`, `dotenv`, `express-oauth2-jwt-bearer`)
- Invalid Auth0 issuer/audience values
- Empty or incorrect DB credentials in `config/.env`
- Token without required claims (`sub`, optional `email`, `name`)
- Route called without `Authorization: Bearer <token>` header

## 12. Outcome

When configured correctly, this feature guarantees:

- Authenticated access to `/api/users`
- Deterministic user creation/lookup behavior
- Clear route outcome based on user email and company linkage
- Traceable logs across controller, service, and repository
