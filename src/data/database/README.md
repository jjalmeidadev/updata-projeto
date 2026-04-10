# Equiem Database Implementation

This folder contains the physical database scripts used by the onboarding backend.

## 📑 Table of Contents

- [1. Overview](#1-overview)
- [2. Technology](#2-technology)
- [3. Current Schema](#3-current-schema)
- [4. SQL Scripts](#4-sql-scripts)
- [5. Local Setup](#5-local-setup)
- [6. Validation Queries](#6-validation-queries)
- [7. Reset Database](#7-reset-database)
- [8. Related Files](#8-related-files)

---

## 1. Overview

The database is organized under schema `equiem` and currently uses a focused model with **7 active tables**:

- `user`
- `onboarding_batch`
- `onboarding_payload`
- `onboarding_mapping`
- `processing_job`
- `processing_log`
- `onboarding_instance`

This model supports onboarding upload lifecycle, payload persistence, processing tracking, and onboarding form/review state.

---

## 2. Technology

- PostgreSQL 13+
- Extension: `pgcrypto` (for `gen_random_uuid()`)

---

## 3. Current Schema

The source of truth for schema creation is:

- [01_create_database.sql](./01_create_database.sql)

The source of truth for initial sample data is:

- [02_initial_data.sql](./02_initial_data.sql)

The source of truth for complete rollback is:

- [03_rollback.sql](./03_rollback.sql)

For field-level details, constraints, enums, and indexes:

- [data-dictionary.md](./data-dictionary.md)

---

## 4. SQL Scripts

### 4.1 01_create_database.sql

Creates the schema from scratch.

What it does:

- Drops schema `equiem` if it exists
- Recreates schema `equiem`
- Creates enums
- Creates the 7 active tables
- Creates indexes used by the current flow

### 4.2 02_initial_data.sql

Loads idempotent sample data for development/testing.

What it does:

- Clears current data from active tables (if they exist)
- Inserts sample users
- Inserts onboarding batches/payloads/mappings
- Inserts processing jobs/logs
- Inserts onboarding instances with realistic statuses

### 4.3 03_fix_user_email_placeholders.sql (optional)

Maintenance script for legacy environments only.

Use only if you already have old users with invalid placeholder emails (empty or `EMPTY`).

### 4.4 03_rollback.sql

Removes all current schema objects related to the 7-table model.

---

## 5. Local Setup

1. Create database (example):

```sql
CREATE DATABASE equiem_db;
```

2. Run schema creation:

- [01_create_database.sql](./01_create_database.sql)

3. Run initial data:

- [02_initial_data.sql](./02_initial_data.sql)

4. (Optional, legacy only) Run user email fix:

- [03_fix_user_email_placeholders.sql](./03_fix_user_email_placeholders.sql)

---

## 6. Validation Queries

Check active tables in schema:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'equiem'
ORDER BY table_name;
```

Expected table names:

- `onboarding_batch`
- `onboarding_instance`
- `onboarding_mapping`
- `onboarding_payload`
- `processing_job`
- `processing_log`
- `user`

Quick row count check:

```sql
SELECT
  (SELECT COUNT(*) FROM equiem."user") AS users_count,
  (SELECT COUNT(*) FROM equiem.onboarding_batch) AS batch_count,
  (SELECT COUNT(*) FROM equiem.onboarding_payload) AS payload_count,
  (SELECT COUNT(*) FROM equiem.onboarding_mapping) AS mapping_count,
  (SELECT COUNT(*) FROM equiem.processing_job) AS job_count,
  (SELECT COUNT(*) FROM equiem.processing_log) AS log_count,
  (SELECT COUNT(*) FROM equiem.onboarding_instance) AS instance_count;
```

---

## 7. Reset Database

To reset everything:

1. Run [03_rollback.sql](./03_rollback.sql)
2. Run [01_create_database.sql](./01_create_database.sql)
3. Run [02_initial_data.sql](./02_initial_data.sql)

---

## 8. Related Files

- [data-dictionary.md](./data-dictionary.md)
- [database-modif.md](./database-modif.md)
- [index-table.ts](./index-table.ts)
- [database-design.md](../../../docs/database-design.md)
