# Data Dictionary - Equiem Database

**Created:** March 27, 2026
**Version:** 1.0
**Schema:** `equiem`
**Database:** PostgreSQL 13+

---

## Table of Contents

1. [Configuration Tables](#configuration-tables)
2. [Hierarchy & Space Tables](#hierarchy--space-tables)
3. [User & Authentication Tables](#user--authentication-tables)
4. [Resource Tables](#resource-tables)
5. [Booking Tables](#booking-tables)
6. [Processing Tables (Onboarding)](#processing-tables-onboarding)
7. [Async Job Tables](#async-job-tables)
8. [ENUMS](#enums)
9. [Indexes & Performance](#indexes--performance)
10. [Versioning Strategy](#versioning-strategy)

---

## Configuration Tables

### `company`

Represents a company registered in the system.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | ✘ | uuid_v4() | Unique company ID |
| domain | VARCHAR(255) | ✘ | - | Email domain (e.g., `company.com`) |
| name | VARCHAR(255) | ✘ | - | Company name |
| status | customer_status_enum | ✘ | 'ACTIVE' | Account status (`ACTIVE`, `INACTIVE`, `SUSPENDED`) |
| metadata | JSONB | ✔ | NULL | Custom metadata |
| created_at | TIMESTAMP | ✘ | NOW() | Creation date |
| updated_at | TIMESTAMP | ✘ | NOW() | Last update date |

**Constraints:**
- PRIMARY KEY: `id`
- UNIQUE: `domain`
- FK: None (root table)

**Indexes:**
- `idx_company_domain` (for login by domain)
- `idx_company_status` (for activation filters)

**Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "domain": "company.com",
  "name": "XYZ Company",
  "status": "ACTIVE",
  "metadata": { "phone": "+1 555 987-6543", "industry": "Tech" },
  "created_at": "2026-03-01T10:00:00Z",
  "updated_at": "2026-03-27T15:30:00Z"
}
```

---

### `customer`

Specific customer within a company (e.g., branch, regional office).

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | ✘ | uuid_v4() | Unique customer ID |
| company_id | UUID | ✘ | - | Company ID (FK) |
| name | VARCHAR(255) | ✘ | - | Customer name |
| status | customer_status_enum | ✘ | 'ACTIVE' | Status (`ACTIVE`, `INACTIVE`) |
| created_at | TIMESTAMP | ✘ | NOW() | Creation date |
| updated_at | TIMESTAMP | ✘ | NOW() | Last update date |

**Constraints:**
- PRIMARY KEY: `id`
- FK: `company_id` → `company.id` (ON DELETE CASCADE)

**Indexes:**
- `idx_customer_company_id` (to list customers by company)

---

### `role`

Permission type in the system (e.g., Admin, User, Manager).

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | ✘ | uuid_v4() | Unique role ID |
| name | VARCHAR(100) | ✘ | - | Role name (e.g., `ADMIN`, `USER`) |
| scope | role_scope_enum | ✘ | - | Scope (`SYSTEM`, `CUSTOMER`, `SITE`) |
| permissions | JSONB | ✔ | NULL | Permissions array (e.g., `["read:user", "write:booking"]`) |

**Constraints:**
- PRIMARY KEY: `id`
- UNIQUE: `name`

---

### `group`

User grouping for organizational purposes.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | ✘ | uuid_v4() | Unique group ID |
| name | VARCHAR(255) | ✘ | - | Group name (e.g., `Sales Team`) |
| company_id | UUID | ✘ | - | Company ID (FK) |

**Constraints:**
- PRIMARY KEY: `id`
- FK: `company_id` → `company.id` (ON DELETE CASCADE)

---

### `interest`

User interest or interest center (e.g., sports, networking).

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | ✘ | uuid_v4() | Unique interest ID |
| name | VARCHAR(100) | ✘ | - | Interest name |

---

### `apartment`

Apartment or unit (e.g., meeting room, workspace).

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | ✘ | uuid_v4() | Unique ID |
| name | VARCHAR(100) | ✘ | - | Property name |
| space_id | UUID | ✘ | - | Space ID where it is located (FK) |
| capacity | INTEGER | ✔ | NULL | People capacity |

**Constraints:**
- PRIMARY KEY: `id`
- FK: `space_id` → `space.id` (ON DELETE CASCADE)

---

## Hierarchy & Space Tables

### `site`

Physical location (e.g., group of buildings in a neighborhood).

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | ✘ | uuid_v4() | Unique site ID |
| customer_id | UUID | ✘ | - | Customer ID (FK) |
| name | VARCHAR(255) | ✘ | - | Site name |
| type | site_type_enum | ✘ | - | Type (`OFFICE`, `RESIDENTIAL`, `COMMERCIAL`) |
| created_at | TIMESTAMP | ✘ | NOW() | Creation date |
| updated_at | TIMESTAMP | ✘ | NOW() | Last update date |

**Constraints:**
- PRIMARY KEY: `id`
- FK: `customer_id` → `customer.id` (ON DELETE CASCADE)

**Indexes:**
- `idx_site_customer_id` (to list sites by customer)

---

### `building`

Building within a site.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | ✘ | uuid_v4() | Unique building ID |
| site_id | UUID | ✘ | - | Site ID (FK) |
| name | VARCHAR(100) | ✘ | - | Building name |

**Constraints:**
- PRIMARY KEY: `id`
- FK: `site_id` → `site.id` (ON DELETE CASCADE)

---

### `space`

Space within a building (e.g., floor, department).

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | ✘ | uuid_v4() | Unique space ID |
| building_id | UUID | ✘ | - | Building ID (FK) |
| name | VARCHAR(100) | ✘ | - | Space name |

**Constraints:**
- PRIMARY KEY: `id`
- FK: `building_id` → `building.id` (ON DELETE CASCADE)

---

### `level`

Custom hierarchy level.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | ✘ | uuid_v4() | Unique ID |
| space_id | UUID | ✘ | - | Space ID (FK) |
| name | VARCHAR(100) | ✘ | - | Level name |

**Constraints:**
- PRIMARY KEY: `id`
- FK: `space_id` → `space.id` (ON DELETE CASCADE)

---

## User & Authentication Tables

### `user`

System user.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | ✘ | uuid_v4() | Unique user ID |
| auth0_id | VARCHAR(255) | ✔ | NULL | External Auth0 ID for authentication |
| email | VARCHAR(255) | ✘ | - | User email |
| name | VARCHAR(255) | ✘ | - | Full name |
| type | user_type_enum | ✘ | 'USER' | Type (`USER`, `ADMIN`, `SYSTEM`) |
| status | user_status_enum | ✘ | 'PENDING' | Status (`PENDING`, `ACTIVE`, `INACTIVE`) |
| company_id | UUID | ✔ | NULL | Company ID (FK, can be NULL for admins) |
| approval_status | user_approval_enum | ✘ | 'PENDING' | Approval (`PENDING`, `APPROVED`, `REJECTED`) |
| created_at | TIMESTAMP | ✘ | NOW() | Creation date |
| updated_at | TIMESTAMP | ✘ | NOW() | Last update date |

**Constraints:**
- PRIMARY KEY: `id`
- UNIQUE: `email`, `auth0_id`
- FK: `company_id` → `company.id` (ON DELETE SET NULL)

**Indexes:**
- `idx_user_email` (for login)
- `idx_user_company_id` (for company filters)
- `idx_user_status` (for status filters)

---

### `site_profile`

User profile specific to a site (local roles and permissions).

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | ✘ | uuid_v4() | Unique ID |
| user_id | UUID | ✘ | - | User ID (FK) |
| site_id | UUID | ✘ | - | Site ID (FK) |
| role_id | UUID | ✘ | - | Role ID (FK) |

**Constraints:**
- PRIMARY KEY: `id`
- UNIQUE: `(user_id, site_id)` (user has one role per site)
- FK: `user_id` → `user.id` (ON DELETE CASCADE)
- FK: `site_id` → `site.id` (ON DELETE CASCADE)
- FK: `role_id` → `role.id` (ON DELETE CASCADE)

---

### `user_role`

Many-to-many relationship: a user can have multiple roles.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| user_id | UUID | ✘ | - | User ID (FK) |
| role_id | UUID | ✘ | - | Role ID (FK) |

**Constraints:**
- PRIMARY KEY: `(user_id, role_id)`
- FK: `user_id` → `user.id` (ON DELETE CASCADE)
- FK: `role_id` → `role.id` (ON DELETE CASCADE)

---

## Resource Tables

### `bookable_resource`

Resource that can be booked (e.g., meeting room, parking).

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | ✘ | uuid_v4() | Unique ID |
| site_id | UUID | ✘ | - | Site ID (FK) |
| name | VARCHAR(255) | ✘ | - | Resource name |
| type | VARCHAR(100) | ✘ | - | Type (e.g., `MEETING_ROOM`, `PARKING`) |
| capacity | INTEGER | ✔ | NULL | Capacity (people or units) |
| status | resource_status_enum | ✘ | 'ACTIVE' | Status (`ACTIVE`, `INACTIVE`, `MAINTENANCE`) |
| metadata | JSONB | ✔ | NULL | Equipment, amenities, etc. |
| created_at | TIMESTAMP | ✘ | NOW() | Creation date |
| updated_at | TIMESTAMP | ✘ | NOW() | Last update date |

**Constraints:**
- PRIMARY KEY: `id`
- FK: `site_id` → `site.id` (ON DELETE CASCADE)

**Indexes:**
- `idx_resource_site_id` (to list resources by site)
- `idx_resource_status` (for availability filters)

---

## Booking Tables

### `booking`

Reservation of a resource by a user for a given period.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | ✘ | uuid_v4() | Unique booking ID |
| user_id | UUID | ✘ | - | User ID (FK) |
| resource_id | UUID | ✘ | - | Resource ID (FK) |
| start_date | TIMESTAMP | ✘ | - | Booking start |
| end_date | TIMESTAMP | ✘ | - | Booking end |
| status | booking_status_enum | ✘ | 'CONFIRMED' | Status (`PENDING`, `CONFIRMED`, `CANCELLED`) |
| notes | TEXT | ✔ | NULL | Additional notes |
| created_at | TIMESTAMP | ✘ | NOW() | Creation date |
| updated_at | TIMESTAMP | ✘ | NOW() | Last update date |

**Constraints:**
- PRIMARY KEY: `id`
- FK: `user_id` → `user.id` (ON DELETE CASCADE)
- FK: `resource_id` → `bookable_resource.id` (ON DELETE CASCADE)
- CHECK: `end_date > start_date`

**Indexes:**
- `idx_booking_user_id` (to list user bookings)
- `idx_booking_resource_id` (to list resource bookings)
- `idx_booking_status` (for status filters)
- `idx_booking_start_date` (for calendars)

---

## Processing Tables (Onboarding)

These tables manage the user import pipeline via CSV/XLSX.

### `onboarding_batch`

File batch submitted for processing.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | ✘ | uuid_v4() | Unique batch ID |
| trace_id | VARCHAR(36) | ✘ | - | Correlational request ID (for tracing) |
| company_id | UUID | ✘ | - | ID of the company that submitted (FK) |
| source | VARCHAR(50) | ✘ | - | Origin (`COMMON`, `EQUIEM`) |
| file_name | VARCHAR(255) | ✘ | - | Original file name |
| s3_key | VARCHAR(500) | ✘ | - | Path in S3 |
| status | VARCHAR(50) | ✘ | 'PENDING' | Status (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`) |
| total_rows | INTEGER | ✔ | NULL | Total rows read |
| valid_rows | INTEGER | ✔ | NULL | Valid rows after processing |
| invalid_rows | INTEGER | ✔ | NULL | Rows with errors |
| created_at | TIMESTAMP | ✘ | NOW() | Creation date |
| updated_at | TIMESTAMP | ✘ | NOW() | Last update date |
| completed_at | TIMESTAMP | ✔ | NULL | Processing completion date |

**Constraints:**
- PRIMARY KEY: `id`
- FK: `company_id` → `company.id` (ON DELETE CASCADE)
- UNIQUE: `trace_id` (each request has a unique trace)
- NOT NULL: `trace_id`, `company_id`, `source`, `file_name`, `s3_key`, `status`

**Indexes:**
- `idx_onboarding_batch_trace_id` (for tracing)
- `idx_onboarding_batch_status` (for processing filters)
- `idx_onboarding_batch_company_id` (to list batches by company)
- `idx_onboarding_batch_created_at` (for history)

**Example:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "trace_id": "req-2026-03-27-001-abc123",
  "company_id": "550e8400-e29b-41d4-a716-446655440000",
  "source": "COMMON",
  "file_name": "users_margo.csv",
  "s3_key": "uploads/2026/03/27/users_margo.csv",
  "status": "PROCESSING",
  "total_rows": 150,
  "valid_rows": 145,
  "invalid_rows": 5,
  "created_at": "2026-03-27T10:00:00Z",
  "updated_at": "2026-03-27T10:05:30Z",
  "completed_at": null
}
```

---

### `onboarding_payload`

Individual row from the file (one user to be created).

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | ✘ | uuid_v4() | Unique ID |
| batch_id | UUID | ✘ | - | Batch ID (FK) |
| row_number | INTEGER | ✘ | - | Row number in the original file |
| entity_type | VARCHAR(50) | ✘ | - | Type (`USER`, `RESOURCE`, etc.) |
| raw_data | JSONB | ✘ | - | Raw row data (before mapping) |
| is_valid | BOOLEAN | ✘ | true | Row passed validation |
| validation_errors | JSONB | ✔ | NULL | Array of errors found |
| validation_severity | VARCHAR(20) | ✔ | NULL | `critical`, `minor`, `none` |
| validation_score | NUMERIC(5,2) | ✔ | 100 | Validation score (0-100%) |
| processed | BOOLEAN | ✘ | false | Row was processed to DB |
| created_at | TIMESTAMP | ✘ | NOW() | Creation date |
| updated_at | TIMESTAMP | ✘ | NOW() | Last update date |

**Constraints:**
- PRIMARY KEY: `id`
- FK: `batch_id` → `onboarding_batch.id` (ON DELETE CASCADE)
- UNIQUE: `(batch_id, row_number)` (each row is unique within a batch)
- NOT NULL: `batch_id`, `row_number`, `entity_type`, `raw_data`

**Indexes:**
- `idx_onboarding_payload_batch_id` (to list payloads by batch)
- `idx_onboarding_payload_entity_type` (for type filters)
- `idx_onboarding_payload_is_valid` (for processed vs error rows)

**Example with error:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "batch_id": "660e8400-e29b-41d4-a716-446655440001",
  "row_number": 42,
  "entity_type": "USER",
  "raw_data": {
    "email": "john@company.com",
    "name": "John Smith",
    "type": "USER",
    "company_id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "is_valid": true,
  "validation_errors": [
    {
      "field": "email",
      "message": "Email from unauthorized domain",
      "severity": "warning"
    }
  ],
  "validation_severity": "minor",
  "validation_score": 85.5,
  "processed": false,
  "created_at": "2026-03-27T10:00:15Z",
  "updated_at": "2026-03-27T10:00:15Z"
}
```

---

### `onboarding_mapping`

Final mapping between imported data and created user.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | ✘ | uuid_v4() | Unique ID |
| payload_id | UUID | ✘ | - | Payload ID (FK) |
| entity_type | VARCHAR(50) | ✘ | - | Created entity type |
| internal_id | UUID | ✔ | NULL | Generated internal ID (e.g., user.id) |
| external_id | VARCHAR(255) | ✔ | NULL | External ID (e.g., Equiem person_id) |
| mapping_status | VARCHAR(50) | ✘ | 'PENDING' | Status (`PENDING`, `MAPPED`, `FAILED`) |
| error_message | TEXT | ✔ | NULL | Error message if failed |
| created_at | TIMESTAMP | ✘ | NOW() | Creation date |
| updated_at | TIMESTAMP | ✘ | NOW() | Last update date |

**Constraints:**
- PRIMARY KEY: `id`
- FK: `payload_id` → `onboarding_payload.id` (ON DELETE CASCADE)
- UNIQUE: `payload_id` (each payload maps to 1 entity)

**Indexes:**
- `idx_onboarding_mapping_payload_id` (to list mappings)
- `idx_onboarding_mapping_internal_id` (to validate duplicates)
- `idx_onboarding_mapping_entity_external` (for Equiem sync)

---

## Async Job Tables

These tables track batch and chunk processing for SQS.

### `processing_job`

Processing job for an entire batch.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | ✘ | uuid_v4() | Unique ID |
| batch_id | UUID | ✘ | - | Batch ID (FK) |
| job_type | VARCHAR(50) | ✘ | - | Type (`STAGE_1_UPLOAD`, `STAGE_2_CHUNK`) |
| status | VARCHAR(50) | ✘ | 'PENDING' | Status (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `FAILED`) |
| message_id | VARCHAR(255) | ✔ | NULL | SQS message ID |
| error_message | TEXT | ✔ | NULL | Error if failed |
| retry_count | INTEGER | ✘ | 0 | Number of attempts |
| max_retries | INTEGER | ✘ | 3 | Maximum attempts |
| started_at | TIMESTAMP | ✔ | NULL | Processing start |
| completed_at | TIMESTAMP | ✔ | NULL | Processing end |
| created_at | TIMESTAMP | ✘ | NOW() | Creation date |
| updated_at | TIMESTAMP | ✘ | NOW() | Last update date |

**Constraints:**
- PRIMARY KEY: `id`
- FK: `batch_id` → `onboarding_batch.id` (ON DELETE CASCADE)

**Indexes:**
- `idx_processing_job_batch_id` (to list jobs by batch)
- `idx_processing_job_status` (for status filters)

---

### `processing_chunk`

Processing chunk (slice) within a Stage 2 job.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | ✘ | uuid_v4() | Unique ID |
| batch_id | UUID | ✘ | - | Batch ID (FK) |
| chunk_index | INTEGER | ✘ | - | Chunk index (0, 1, 2, ...) |
| offset | INTEGER | ✘ | - | Start position in payload |
| size | INTEGER | ✘ | - | Chunk size (number of records) |
| status | VARCHAR(50) | ✘ | 'PENDING' | Status (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `FAILED`) |
| retries | INTEGER | ✘ | 0 | Number of attempts |
| error | TEXT | ✔ | NULL | Error message |
| started_at | TIMESTAMP | ✔ | NULL | Processing start |
| finished_at | TIMESTAMP | ✔ | NULL | Processing end |
| updated_at | TIMESTAMP | ✘ | NOW() | Last update date |

**Constraints:**
- PRIMARY KEY: `id`
- FK: `batch_id` → `onboarding_batch.id` (ON DELETE CASCADE)
- UNIQUE: `(batch_id, chunk_index)` (one chunk per index per batch)

**Indexes:**
- `idx_processing_chunk_batch_status` (for batch/status filters)
- `idx_processing_chunk_status` (for job scheduler)

**Example:**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "batch_id": "660e8400-e29b-41d4-a716-446655440001",
  "chunk_index": 0,
  "offset": 0,
  "size": 50,
  "status": "COMPLETED",
  "retries": 1,
  "error": null,
  "started_at": "2026-03-27T10:00:20Z",
  "finished_at": "2026-03-27T10:00:45Z",
  "updated_at": "2026-03-27T10:00:45Z"
}
```

---

### `processing_log`

Detailed log of each operation during processing.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | ✘ | uuid_v4() | Unique ID |
| trace_id | VARCHAR(36) | ✘ | - | Correlational ID (from onboarding_batch) |
| batch_id | UUID | ✔ | NULL | Batch ID (FK) |
| level | VARCHAR(20) | ✘ | - | Level (`DEBUG`, `INFO`, `WARN`, `ERROR`) |
| message | TEXT | ✘ | - | Log message |
| context | JSONB | ✔ | NULL | Additional context (e.g., tested values) |
| created_at | TIMESTAMP | ✘ | NOW() | Log date |

**Constraints:**
- PRIMARY KEY: `id`
- FK: `batch_id` → `onboarding_batch.id` (ON DELETE SET NULL)

**Indexes:**
- `idx_processing_log_trace_id` (to audit a request)
- `idx_processing_log_batch_id` (for logs by batch)

**Example:**
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "trace_id": "req-2026-03-27-001-abc123",
  "batch_id": "660e8400-e29b-41d4-a716-446655440001",
  "level": "WARN",
  "message": "Parser found 5 rows with errors. Returning empty array for fallback.",
  "context": {
    "fileName": "users_margo.csv",
    "errorType": "MalformedCSV",
    "rowsWithError": [1, 3, 7]
  },
  "created_at": "2026-03-27T10:00:16Z"
}
```

---

## ENUMS

Enumerated data types in the database.

### `customer_status_enum`
```
'ACTIVE'    → Customer is active
'INACTIVE'  → Customer deactivated
'SUSPENDED' → Customer suspended due to non-payment
```

### `site_type_enum`
```
'OFFICE'      → Commercial office
'RESIDENTIAL' → Residential
'COMMERCIAL'  → Mixed commercial
```

### `ownership_type_enum`
```
'OWNED'   → Owned property
'LEASED'  → Leased property
'SHARED'  → Shared property
```

### `user_status_enum`
```
'PENDING'  → Awaiting approval
'ACTIVE'   → Active user in the system
'INACTIVE' → Deactivated user
```

### `user_type_enum`
```
'USER'   → Regular user
'ADMIN'  → Administrator
'SYSTEM' → System/bot
```

### `booking_status_enum`
```
'PENDING'    → Awaiting confirmation
'CONFIRMED'  → Confirmed
'CANCELLED'  → Cancelled
```

### `resource_status_enum`
```
'ACTIVE'       → Resource available
'INACTIVE'     → Resource deactivated
'MAINTENANCE'  → Under maintenance
```

### `user_approval_enum`
```
'PENDING'   → Awaiting approval
'APPROVED'  → Approved
'REJECTED'  → Rejected
```

### `role_scope_enum`
```
'SYSTEM'   → Valid across the entire system
'CUSTOMER' → Valid for a customer
'SITE'     → Valid for a specific site
```

---

## Indexes & Performance

### Frequent Search Indexes

| Index | Table | Column(s) | Use Case |
|-------|-------|-----------|----------|
| `idx_company_domain` | company | domain | Login by email domain |
| `idx_user_email` | user | email | User search by email |
| `idx_user_company_id` | user | company_id | List users by company |
| `idx_site_customer_id` | site | customer_id | List sites by customer |
| `idx_resource_site_id` | bookable_resource | site_id | List resources by site |
| `idx_resource_status` | bookable_resource | status | Filter active resources |
| `idx_booking_user_id` | booking | user_id | User booking history |
| `idx_booking_resource_id` | booking | resource_id | Check availability |
| `idx_booking_start_date` | booking | start_date | Booking calendar |

### Processing Indexes (Onboarding)

| Index | Table | Column(s) | Purpose |
|-------|-------|-----------|---------|
| `idx_onboarding_batch_trace_id` | onboarding_batch | trace_id | Correlational tracing |
| `idx_onboarding_batch_status` | onboarding_batch | status | Job scheduler (find PENDING) |
| `idx_onboarding_batch_created_at` | onboarding_batch | created_at | Upload history |
| `idx_onboarding_payload_batch_id` | onboarding_payload | batch_id | List payloads by batch |
| `idx_onboarding_payload_is_valid` | onboarding_payload | is_valid | Retries (reprocess invalid) |
| `idx_onboarding_mapping_internal_id` | onboarding_mapping | internal_id | Validate duplicates |
| `idx_onboarding_mapping_entity_external` | onboarding_mapping | external_id | Equiem sync |
| `idx_processing_job_status` | processing_job | status | Worker polling |
| `idx_processing_chunk_batch_status` | processing_chunk | batch_id, status | Monitor parallel chunks |
| `idx_processing_chunk_status` | processing_chunk | status | Find chunks to process |

### Performance Tips

1. **Always use trace_id in queries** for auditing to correlate the full flow:
   ```sql
   SELECT * FROM equiem.processing_log WHERE trace_id = 'req-2026-03-27-001-abc123';
   ```

2. **Batching in parallel processing:**
   ```sql
   SELECT * FROM equiem.processing_chunk 
   WHERE status = 'PENDING' AND batch_id = $1 
   ORDER BY chunk_index 
   LIMIT 3;
   ```

3. **Archive old history** (chunks completed more than 30 days ago) to keep indexes lean.

4. **Monitor JSONB size** in `onboarding_payload.raw_data` and `onboarding_payload.validation_errors` (can grow quickly in large batches).

---

## Versioning Strategy

### Script Naming Convention

```
01_create_database.sql    → Initial schema creation
02_initial_data.sql       → Bootstrap data (roles, basic groups)
03_rollback.sql           → Rollback script (complete)
04_migration_V2.sql       → (Future) V2 changes
...
```

### Changelog

Maintain a `database-modif.md` file with history:

```markdown
## Sprint 3 (March 27, 2026)

- ✅ Added: `processing_chunk` table for chunk parallelization
- ✅ Added: 13 performance indexes
- ✅ Modified: `onboarding_batch` with NOT NULL constraints (source, status, trace_id, file_name, s3_key)
- ✅ Modified: `onboarding_payload` with UNIQUE(batch_id, row_number)
- ✅ Created: `03_rollback.sql` to revert all changes

## Sprint 4 (Planned)

- TODO: Archive completed chunks (partition strategy)
- TODO: Add `company_id` column to analytics tables for multi-tenancy
```

### Rollback Procedure

In case of production error:
1. Backup current database: `pg_dump -d equiem > backup-2026-03-27.sql`
2. Run rollback: `psql -d equiem -f 03_rollback.sql`
3. Restore data (if needed): Recover from previous backup
4. Communicate root cause to the team

---
