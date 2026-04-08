-- =====================================
-- 01_create_database.sql
-- =====================================

DROP SCHEMA IF EXISTS equiem CASCADE;
CREATE SCHEMA equiem;
SET search_path TO equiem;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- ENUMS
-- =========================
CREATE TYPE customer_status_enum AS ENUM ('active', 'inactive');
CREATE TYPE site_type_enum AS ENUM ('commercial', 'residential', 'mixed');
CREATE TYPE ownership_type_enum AS ENUM ('leased', 'owned', 'common');
CREATE TYPE user_status_enum AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE user_type_enum AS ENUM ('commercial', 'residential', 'visitor');
CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE resource_status_enum AS ENUM ('active', 'inactive');
CREATE TYPE user_approval_enum AS ENUM ('automatic', 'manual');
CREATE TYPE role_scope_enum AS ENUM ('site', 'building', 'company');

-- =========================
-- CORE TABLES
-- =========================

CREATE TABLE customer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100) UNIQUE,
  name VARCHAR(255) NOT NULL,
  region VARCHAR(100) NOT NULL,
  status customer_status_enum NOT NULL
);

CREATE TABLE site (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  timezone VARCHAR(100) NOT NULL,
  site_type site_type_enum NOT NULL,
  customer_id UUID NOT NULL REFERENCES customer(id) ON DELETE CASCADE
);

CREATE TABLE building (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  display_order INT NOT NULL,
  site_id UUID NOT NULL REFERENCES site(id) ON DELETE CASCADE
);

CREATE TABLE level (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  display_order INT NOT NULL,
  space_count INT NOT NULL,
  building_id UUID NOT NULL REFERENCES building(id) ON DELETE CASCADE
);

CREATE TABLE space (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  ownership_type ownership_type_enum NOT NULL,
  level_id UUID NOT NULL REFERENCES level(id) ON DELETE CASCADE
);

CREATE TABLE company (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(255),
  attributes TEXT[],
  approved_domains TEXT[],
  user_approval user_approval_enum NOT NULL
);

CREATE TABLE apartment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL
);

CREATE TABLE "user" (
  id UUID PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN NOT NULL,
  mobile_number VARCHAR(30),
  status user_status_enum NOT NULL,
  user_type user_type_enum NOT NULL,
  auth0_id TEXT,
  member_since TIMESTAMPTZ,
  company_id UUID REFERENCES company(id) ON DELETE SET NULL,
  apartment_id UUID REFERENCES apartment(id) ON DELETE SET NULL
);

CREATE TABLE site_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status user_status_enum NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES site(id) ON DELETE CASCADE,
  company_id UUID REFERENCES company(id) ON DELETE SET NULL,
  UNIQUE (user_id, site_id)
);

CREATE TABLE role (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  scope_level role_scope_enum NOT NULL,
  permissions TEXT[] NOT NULL
);

CREATE TABLE user_role (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES role(id) ON DELETE CASCADE
);

CREATE TABLE "group" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL
);

CREATE TABLE interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE bookable_resource (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  capacity INT NOT NULL,
  location VARCHAR(255) NOT NULL,
  status resource_status_enum NOT NULL,
  photos TEXT[],
  building_id UUID NOT NULL REFERENCES building(id) ON DELETE CASCADE
);

CREATE TABLE booking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status booking_status_enum NOT NULL,
  notes TEXT,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES bookable_resource(id) ON DELETE CASCADE
);

-- =========================
-- ONBOARDING + PROCESSING
-- =========================

CREATE TABLE onboarding_batch (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  trace_id VARCHAR(120) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  s3_key TEXT NOT NULL,
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE onboarding_payload (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES onboarding_batch(id) ON DELETE CASCADE,
  row_number INT NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  raw_data JSONB NOT NULL,
  is_valid BOOLEAN DEFAULT TRUE,
  validation_errors JSONB DEFAULT '[]'::jsonb,
  UNIQUE (batch_id, row_number)
);

CREATE TABLE onboarding_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50),
  external_id VARCHAR(100),
  internal_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE processing_job (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES onboarding_batch(id) ON DELETE CASCADE,
  type VARCHAR(50),
  status VARCHAR(50),
  external_reference VARCHAR(255),
  error_message TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

CREATE TABLE processing_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES processing_job(id) ON DELETE CASCADE,
  level VARCHAR(20) DEFAULT 'info',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE onboarding_instance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES company(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES onboarding_batch(id) ON DELETE SET NULL,
  company_name VARCHAR(255) NOT NULL,
  selected_sections TEXT[] NOT NULL DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  progress_percent INT NOT NULL DEFAULT 0,
  link_token VARCHAR(120) NOT NULL UNIQUE,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  email_status VARCHAR(50) NOT NULL DEFAULT 'pending_manual_send',
  email_payload JSONB,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  section_review JSONB NOT NULL DEFAULT '{}'::jsonb,
  returned_sections TEXT[] NOT NULL DEFAULT '{}',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- PROCESSING CHUNKS (Parallel processing for large batches)
-- =========================

CREATE TABLE processing_chunk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES onboarding_batch(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  "offset" INT NOT NULL,
  "size" INT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'queued',
  retries INT DEFAULT 0,
  error TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (batch_id, chunk_index)
);

-- =========================
-- INDICES FOR PERFORMANCE
-- =========================

-- Onboarding batch lookups
CREATE INDEX idx_onboarding_batch_trace_id ON onboarding_batch(trace_id);

-- Onboarding instance lookups
CREATE INDEX idx_onboarding_instance_batch_id ON onboarding_instance(batch_id);
CREATE INDEX idx_onboarding_batch_status ON onboarding_batch(status);
CREATE INDEX idx_onboarding_batch_created_at ON onboarding_batch(created_at DESC);

-- Onboarding payload queries
CREATE INDEX idx_onboarding_payload_batch_id ON onboarding_payload(batch_id);
CREATE INDEX idx_onboarding_payload_entity_type ON onboarding_payload(entity_type);
CREATE INDEX idx_onboarding_payload_is_valid ON onboarding_payload(batch_id, is_valid);

-- Onboarding mapping lookups
CREATE INDEX idx_onboarding_mapping_entity_external ON onboarding_mapping(entity_type, external_id);
CREATE INDEX idx_onboarding_mapping_internal_id ON onboarding_mapping(internal_id);

-- Processing job tracking
CREATE INDEX idx_processing_job_batch_id ON processing_job(batch_id);
CREATE INDEX idx_processing_job_status ON processing_job(status);

-- Processing chunk processing
CREATE INDEX idx_processing_chunk_batch_status ON processing_chunk(batch_id, status);
CREATE INDEX idx_processing_chunk_status ON processing_chunk(status);

-- Onboarding instance queries
CREATE INDEX idx_onboarding_instance_link_token ON onboarding_instance(link_token);
CREATE INDEX idx_onboarding_instance_company_id ON onboarding_instance(company_id);
CREATE INDEX idx_onboarding_instance_status ON onboarding_instance(status);
CREATE INDEX idx_onboarding_instance_status_submitted ON onboarding_instance(status, submitted_at DESC);
CREATE INDEX idx_onboarding_instance_returned_sections ON onboarding_instance USING GIN(returned_sections);
