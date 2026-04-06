# CODING_STANDARDS.md

## Summary

- [Introduction](#1-introduction)
- [Architectural Principles (Middleware Pattern)](#2-architectural-principles-middleware-pattern)
- [Naming Conventions](#3-naming-conventions)
- [Code Formatting](#4-code-formatting)
- [TypeScript Standards (Strict Mode Required)](#5-typescript-standards-strict-mode-required)
- [GraphQL Standards (Apollo)](#6-graphql-standards-apollo)
- [Asynchronous Processing Standards](#7-asynchronous-processing-standards)
- [Database & TypeORM Standards](#8-database-typeorm-standards)
- [AWS & Infrastructure Standards](#9-aws-infrastructure-standards)
- [Error Handling](#10-error-handling)
- [React & Next.js Standards](#11-react-nextjs-standards)
- [Comments & Documentation](#12-comments-documentation)
- [Testing Standards](#13-testing-standards)
- [Version Control & Git Practices](#14-version-control-git-practices)
- [Enforcement](#15-enforcement)

## 1. Introduction

This document defines the official coding standards for the Onboarding Automation Middleware project developed for Equiem.

The purpose of this document is to:

- Ensure consistency across backend and frontend codebases
- Improve readability and maintainability
- Reduce bugs through strong typing and structure
- Align with Equiem’s architectural and technology standards
- Establish enforceable rules for code reviews

These standards are mandatory for all contributors.

---

## 2. Architectural Principles (Middleware Pattern)

This project follows the Middleware Pattern described by Equiem.

The system must:

1. Ingest external files (CSV, Excel)
2. Process data asynchronously
3. Push validated data to Equiem’s GraphQL APIs

### Architecture Rules

- Controllers MUST NOT contain business logic.
- Controllers MUST NOT access the database directly.
- Services contain business logic and orchestration.
- Repositories are responsible only for persistence.
- Workers are responsible for asynchronous processing.
- GraphQL operations must be isolated in dedicated modules.

### Required Folder Structure 

```
│
├── config/
│ ├── .env
│ └── .env.example
├── docs/
├── src/
│ ├── business/
│ ├── config/
│ ├── data/
│ ├── mock-api/
│ ├── presentation/
│ └── server.ts
│
├── tests/
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── Dockerfile.dev
├── Dockerfile.prod
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
└── vitest.config.ts

```

---

## 3. Naming Conventions

### General Rules

- Use English for all code.
- Use descriptive names.
- Avoid abbreviations unless universally known (e.g., API, ID, URL).

### Variables

Use camelCase.

Correct:

```ts
const fileUploadQueue = ...
```

Incorrect:

```ts
const FileUploadQueue = ...
const fuQ = ...
```

### Functions

Use camelCase and start with a verb.

Correct:

```ts
processFile()
validateUserData()
createBuildingRecord()
```

Incorrect:

```ts
fileProcessor()
userValidation()
```

### Classes

Use PascalCase.

Correct:

```ts
class ImportService {}
class UserRepository {}
```

Incorrect:

```ts
class importService {}
```

### Interfaces & Types

Use PascalCase and descriptive names.

Correct:

```ts
interface CreateUserInput {}
type ImportStatus = 'PENDING' | 'SUCCESS' | 'FAILED'
```

Incorrect:

```ts
interface data {}
```

### Files

- kebab-case for files
- PascalCase for React components

Correct:

```
import-service.ts
user-repository.ts
FileUploader.tsx
```

---

## 4. Code Formatting

Formatting is enforced via ESLint + Prettier.

### Indentation

- 2 spaces
- No tabs

### Line Length

- Maximum 100 characters

### Braces

Opening braces must be on the same line.

Correct:

```ts
if (isValid) {
  processData()
}
```

Incorrect:

```ts
if (isValid)
{
  processData()
}
```

---

## 5. TypeScript Standards (Strict Mode Required)

The project MUST use:

```json
"strict": true
```

in tsconfig.json.

### Strong Typing

- Never use `any`
- Never use `@ts-ignore`
- Never use `as any`
- All function return types must be explicit

Correct:

```ts
function processFile(data: ImportDTO): Promise<ImportResult> {
  ...
}
```

Incorrect:

```ts
function processFile(data) {
  ...
}
```

### DTOs

All external data must be mapped to DTOs before processing.

---

## 6. GraphQL Standards (Apollo)

This project communicates with Equiem via GraphQL.

### Rules

- GraphQL queries/mutations MUST be stored in `/graphql`
- Never inline GraphQL strings inside services
- Always type responses
- Use `gql` template literals

Correct:

```ts
export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
    }
  }
`
```

Incorrect:

```ts
apolloClient.mutate({
  mutation: `mutation { createUser(...) }`
})
```

---

## 7. Asynchronous Processing Standards

Large files (e.g., 50,000 rows) MUST NOT be processed synchronously.

### Rules

- All heavy processing must go through SQS or BullMQ
- No blocking operations in HTTP request lifecycle
- Workers must be isolated
- Retry strategy must be implemented
- Processing must be idempotent

Incorrect:

```ts
app.post('/upload', async (req, res) => {
  await processEntireFile(req.file)
})
```

Correct:

```ts
app.post('/upload', async (req, res) => {
  await queue.add('process-file', { fileKey })
  res.status(202).send()
})
```

---

## 8. Database & TypeORM Standards

- Use TypeORM entities
- Do not write raw SQL unless absolutely necessary
- Entities must reflect database schema accurately
- Migrations must be versioned and committed

Correct:

```ts
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  email: string
}
```

---

## 9. AWS & Infrastructure Standards

Infrastructure must be defined using AWS CDK (TypeScript).

### Rules

- No manual resource creation in AWS Console
- All infrastructure defined as code
- Separate stacks for environments (dev, staging)

Use consistent naming convention:

```
onboarding-middleware-dev
onboarding-middleware-staging
```

---

## 10. Error Handling

### Rules

- Never swallow errors
- Always log structured errors
- Use custom error classes
- Do not expose internal stack traces

Incorrect:

```ts
catch (e) {}
```

Correct:

```ts
catch (error) {
  logger.error('File processing failed', { error })
  throw new ImportProcessingError()
}
```

---

## 11. React & Next.js Standards

- Functional components only
- No class components
- Props must be typed
- Hooks must start with `use`
- API logic must be isolated in service files

Correct:

```ts
interface FileUploaderProps {
  onUpload: (file: File) => void
}

export function FileUploader({ onUpload }: FileUploaderProps) {
  ...
}
```

---

## 12. Comments & Documentation

### When to Comment

- Explain WHY, not WHAT
- Complex business rules
- Workarounds

### Docstring Format

Use JSDoc for public functions.

```ts
/**
 * Processes an uploaded CSV file and enqueues records.
 * @param fileKey - S3 file reference
 * @returns Import job identifier
 */
```

---

## 13. Testing Standards

- Unit tests required for services
- Mock external APIs
- Do not test against Equiem production
- Minimum coverage: 70%

---

## 14. Version Control & Git Practices

For detailed guidelines regarding branching strategy, commit conventions, pull request workflow, and repository governance, contributors MUST consult:

`docs/ConfigurationManagement.md`

This document provides the complete and authoritative reference for Version Control & Git Practices.

### Summary Rules

- Branch naming must follow: feature/, fix/, chore/, /docs, /release or hotfix/
- Commit messages must follow Conventional Commits
- Pull requests must include description and linked task
- Lint and tests must pass before merge
- At least one reviewer approval is required

---

## 15. Enforcement

These standards are enforced through:

- ESLint
- Prettier
- TypeScript strict mode
- CI pipeline validation
- Code review checklist

Compliance with this document ensures architectural consistency, maintainability, and long-term scalability of the Onboarding Automation Middleware project.