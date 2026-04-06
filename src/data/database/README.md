# Equiem Database Implementation

## 1. Overview

This folder contains the physical database implementation of the Equiem Onboarding Middleware System.

The purpose of this database implementation is to:

- Provide a complete PostgreSQL schema representing the Equiem domain.
- Allow the database to be recreated from scratch using SQL scripts.
- Insert initial data for testing and validation.
- Provide documentation explaining how the database is structured and deployed.

The database structure implemented in the SQL scripts follows the conceptual and logical models defined in the project documentation.

For the full database design, including:

- Conceptual Data Model
- Logical Data Model
- Entity descriptions
- Relationships and cardinalities
- Business rules
- Normalization

please refer to the database design documentation located at:

`docs/database-design.md`

This document contains the full data dictionary and detailed explanation of the data model.

---

## 2. Database Technology

The database system used in this project is PostgreSQL

PostgreSQL was chosen because it provides:

- strong relational integrity
- advanced constraint management
- support for complex queries
- extensibility through extensions
- reliable transaction management

---

## 3. Database Schema

All tables created in this project are stored inside the schema named **equiem**

This schema groups all entities related to the Equiem system.

The schema contains entities related to:

- building management
- tenant companies
- users
- room booking
- operational configuration
- permit and compliance systems
- service request management
- media storage

The detailed structure of these entities is documented in `docs/database-design.md`

---

## 3.1 Implementation of Equiem Model Improvements

Following feedback from Equiem, several structural improvements were incorporated into the database schema to better reflect how the real platform organizes data and permissions.

### Customer → Site → Building Hierarchy

The original model started at the **Building** entity.
To align with the Equiem platform architecture, the hierarchy was extended by introducing the entities **Customer** and **Site**.

The resulting hierarchy is:

Customer → Site → Building → Levels → Rooms

This structure allows buildings to be grouped under specific sites, which are managed by customers.
It also supports permission management and administration at higher organizational levels.

### SiteProfile (User–Site Relationship)

Users in the Equiem platform are **global entities**, meaning they are not owned by a single site.

To represent this correctly, a **SiteProfile** join entity was introduced between **User** and **Site**.

The SiteProfile table stores:

* the user assigned to a site
* the site they belong to
* optional company association
* the date the user joined the site
* the user's status within that site

This design allows a user to belong to multiple sites while maintaining site-specific metadata.

### User–Company Relationship Adjustment

The relationship between **User** and **Company** was revised to reflect the real system behavior.

Only **Commercial users** belong to a company.
Other user types follow different associations:

* Commercial users → associated with a Company
* Residential users → associated with an Apartment
* Visitors → not linked to either Company or Apartment

This behavior is represented in the schema using:

* an optional `company_id` in the `user` table
* an optional `apartment_id` for residential users
* a `user_type` ENUM that defines the user category

### Apartment and Residential Users

The **Apartment** entity represents residential units within buildings.

Apartments can be linked to multiple levels through the **apartment_levels** table, allowing flexible building layouts.

Residential users may optionally be associated with an apartment through the `apartment_id` attribute in the `user` table.

### Role Scoping

User roles were designed to support scoped permissions across different organizational levels.

The `user_role` table allows roles to be assigned in relation to:

* a specific **Building**
* a specific **Company**

This structure enables permissions to be restricted to certain parts of the system rather than applying globally.

These modifications ensure the database schema more accurately reflects the operational structure of the Equiem platform while maintaining strong relational integrity and normalization.


## 4. SQL Scripts

This directory contains SQL scripts used to build, populate, and maintain the database.

### 4.1 01_create_database.sql

This script creates the entire database structure.

It performs the following operations:

- Drops the schema if it already exists
- Creates the schema `equiem`
- Creates all tables
- Defines primary keys
- Defines foreign key relationships
- Defines constraints
- Creates indexes when necessary

Running this script recreates the database structure from scratch.

---

### 4.2 02_initial_data.sql

This script inserts initial data into the database.

The inserted data is used to:

- test foreign key relationships
- verify database structure
- demonstrate system functionality

Example data may include:

- buildings
- levels
- companies
- users
- configuration entries

This script must be executed only after running `01_create_database.sql`.

---

### 4.3 03_fix_user_email_placeholders.sql

This maintenance script updates invalid placeholder user emails created during early authentication integration.

It performs the following operations:

- Finds users with empty/placeholder emails (`''` or `EMPTY`)
- Generates deterministic fallback emails from `auth0_id`
- Avoids collisions by appending a short user-id suffix when needed

Use this script in existing environments where old rows still have invalid emails.

---

## 5. Deployment Instructions

### 5.1 Install PostgreSQL

Download and install PostgreSQL from the official website:

https://www.postgresql.org/download/

You may interact with the database using:

- pgAdmin
- psql command line
- any PostgreSQL-compatible client

---

### 5.2 Create the Database

After installing PostgreSQL, create a new database.

Example:

CREATE DATABASE equiem_db;

---

### 5.3 Run the Database Creation Script

Open PostgreSQL (for example using pgAdmin Query Tool) and execute:

src/data/database/01_create_database.sql

This script will create the schema and all required tables.

---

### 5.4 Insert Initial Data

After the schema has been created, execute:

src/data/database/02_initial_data.sql

This will populate the database with example data used for testing.

---

## 6. Testing the Database

To verify that the database was created successfully, execute a simple query such as:

SELECT * FROM equiem.building;

If records are returned, the database has been correctly initialized.

Tables can also be inspected through pgAdmin:

Schemas → equiem → Tables

---

## 7. Resetting the Database

During development it may be necessary to recreate the database.

The creation script includes the instruction:

**DROP SCHEMA IF EXISTS equiem CASCADE;**

This ensures that the database can always be rebuilt from a clean state.

Simply run the creation script again to reset the entire schema.

---

## 8. Data Dictionary

The complete Data Dictionary and entity documentation are available in `docs/database-design.md`

This document contains:

- entity descriptions
- attribute definitions
- relationships
- referential integrity rules
- normalization analysis

---

## 9. Conclusion

This database implementation provides a structured PostgreSQL schema for the Equiem onboarding middleware system.

The design ensures:

- strong referential integrity
- normalized relational structure
- clear separation of system domains
- scalable configuration management

The provided SQL scripts allow the entire database to be recreated and populated easily, supporting development, testing, and deployment of the system.

---

## 10. Sprint 3 Updates (27 de março de 2026) ⭐

### 10.1 Novas Tabelas & Melhorias

#### ✅ Tabela Nova: `processing_chunk`

Adicionada para suportar processamento paralelo de chunks durante Stage 2 do onboarding.

```sql
CREATE TABLE equiem.processing_chunk (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES equiem.onboarding_batch(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  offset INTEGER NOT NULL,
  size INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  retries INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(batch_id, chunk_index)
);
```

**Propósito:** Permite que chunks sejam processados em paralelo (via Worker), com retry automático até 3x.

#### ✅ Constraints Reforçadas

Adicionadas `NOT NULL` em colunas críticas de `onboarding_batch`:

```sql
ALTER TABLE equiem.onboarding_batch 
  ALTER COLUMN source SET NOT NULL,
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN trace_id SET NOT NULL,
  ALTER COLUMN file_name SET NOT NULL,
  ALTER COLUMN s3_key SET NOT NULL;
```

**Propósito:** Garantir integridade de dados e rastreabilidade (trace_id).

#### ✅ Índices de Performance (13 novos)

Adicionados índices para otimizar queries frequentes:

```sql
-- Rastreamento
CREATE INDEX idx_onboarding_batch_trace_id ON equiem.onboarding_batch(trace_id);
CREATE INDEX idx_onboarding_batch_status ON equiem.onboarding_batch(status);
CREATE INDEX idx_onboarding_batch_created_at ON equiem.onboarding_batch(created_at);

-- Processamento de payloads
CREATE INDEX idx_onboarding_payload_batch_id ON equiem.onboarding_payload(batch_id);
CREATE INDEX idx_onboarding_payload_entity_type ON equiem.onboarding_payload(entity_type);
CREATE INDEX idx_onboarding_payload_is_valid ON equiem.onboarding_payload(is_valid);

-- Mapeamentos
CREATE INDEX idx_onboarding_mapping_entity_external ON equiem.onboarding_mapping(external_id);
CREATE INDEX idx_onboarding_mapping_internal_id ON equiem.onboarding_mapping(internal_id);

-- Jobs assíncronos
CREATE INDEX idx_processing_job_batch_id ON equiem.processing_job(batch_id);
CREATE INDEX idx_processing_job_status ON equiem.processing_job(status);
CREATE INDEX idx_processing_chunk_batch_status ON equiem.processing_chunk(batch_id, status);
CREATE INDEX idx_processing_chunk_status ON equiem.processing_chunk(status);

-- Instances
CREATE INDEX idx_onboarding_instance_link_token ON equiem.onboarding_instance(link_token);
CREATE INDEX idx_onboarding_instance_company_id ON equiem.onboarding_instance(company_id);
CREATE INDEX idx_onboarding_instance_status ON equiem.onboarding_instance(status);
```

**Impacto:** Queries como `SELECT * FROM processing_chunk WHERE status = 'PENDING' ORDER BY chunk_index` passam de O(n) para O(log n).

### 10.2 Migrações & Versionamento

Arquivo de versionamento: `database-modif.md` (ver conteúdo para changelog completo)

Padrão de nomenclatura:
- `01_create_database.sql` → Schema inicial
- `02_initial_data.sql` → Bootstrap
- `03_rollback.sql` → ⭐ NOVO: Reverter tudo
- `04_migration_V2.sql` → (Futuro) Sprint 4+

### 10.3 Rollback & Recuperação

Script de rollback disponível em: **`03_rollback.sql`**

Executar em case de emergência:

```bash
# Backup primeiro!
pg_dump -d equiem > backup-before-rollback-$(date +%s).sql

# Rollback
psql -d equiem < 03_rollback.sql

# Validar
psql -d equiem -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'equiem';"
# Esperado: 0 ou índices antigos (antes do Sprint 3)
```

### 10.4 Monitoramento & Diagnostics

#### Validar Índices Foram Criados

```bash
psql -d equiem -c "
  SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'equiem';
"
# Esperado: 23+ índices
```

#### Verificar Tamanho do Banco

```bash
psql -d equiem -c "
  SELECT 
    pg_size_pretty(pg_database_size('equiem')) as size,
    (SELECT count(*) FROM equiem.onboarding_batch) as batches,
    (SELECT count(*) FROM equiem.processing_chunk) as chunks;
"
```

#### Auditar uma Requisição Completa

```bash
psql -d equiem -c "
  SELECT 
    'batch' as entity, id, trace_id, status
  FROM equiem.onboarding_batch
  WHERE trace_id = 'req-2026-03-27-001-abc123'
  
  UNION ALL
  
  SELECT 
    'chunk' as entity, id, batch_id::text, status
  FROM equiem.processing_chunk
  WHERE batch_id = (
    SELECT id FROM equiem.onboarding_batch 
    WHERE trace_id = 'req-2026-03-27-001-abc123'
  )
  ORDER BY entity;
"
```

### 10.5 Data Dictionary Completo

Documentação detalhada disponível em: **`data-dictionary.md`** ⭐ NOVO

Inclui:
- Descrição de cada tabela
- Tipos de dados, constraints, defaults
- Relacionamentos e cardinalidades
- Exemplos de JSON para JSONB
- ENUMs disponíveis
- Estratégia de índices

### 10.6 Deployment Checklist para Sprint 3

- [ ] Executar `01_create_database.sql`
- [ ] Executar `02_initial_data.sql`
- [ ] Validar contagem de tabelas: `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'equiem'` → Esperado: 18+
- [ ] Validar contagem de índices: `SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'equiem'` → Esperado: 23+
- [ ] Testar rastreamento: `SELECT * FROM equiem.onboarding_batch LIMIT 1`
- [ ] Testar chunks: `SELECT * FROM equiem.processing_chunk LIMIT 1`
- [ ] Confirmar backend consegue se conectar: `npm run db:validate` (se script existir)

### 10.7 Performance Improvements

| Operação | Antes | Depois |
|----------|-------|--------|
| Busca por trace_id | O(n) full scan | O(log n) index |
| Job polling (`status='PENDING'`) | O(n) | O(log n) |
| Listar chunks ativos | O(n) | O(log n) com composite index |
| Validar duplicatas (internal_id) | O(n) | O(log n) |

**Redução esperada:** 50-70% em query times para operações de onboarding.

---

## 11. Recursos Relacionados

- **Data Dictionary Completo:** [data-dictionary.md](./data-dictionary.md)
- **Rollback Script:** [03_rollback.sql](./03_rollback.sql)
- **Database Design:** [docs/database-design.md](../../docs/database-design.md)
- **Changelog:** [database-modif.md](./database-modif.md)
- **Migration Helper:** [index-table.ts](./index-table.ts)

---

**Última revisão:** 27 de março de 2026  
**Status:** ✅ Sprint 3 completo | 📋 Sprint 4 preparado  
**Próxima revisão:** Fim de Sprint 4