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
CREATE TYPE user_status_enum AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE user_type_enum AS ENUM ('commercial', 'residential', 'visitor');

-- =========================
-- CORE TABLES
-- =========================

CREATE TABLE company (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  approved_domains TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
  company_id UUID REFERENCES company(id) ON DELETE SET NULL
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_onboarding_batch_status
    CHECK (status IN ('pending', 'queued', 'processing', 'finalizing', 'completed', 'failed', 'invalid'))
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
  finished_at TIMESTAMPTZ,
  CONSTRAINT chk_processing_job_status
    CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'invalid'))
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
  batch_id UUID REFERENCES onboarding_batch(id) ON DELETE SET NULL,
  company_id UUID REFERENCES company(id) ON DELETE SET NULL,
  company_name VARCHAR(255) NOT NULL,
  selected_sections TEXT[] NOT NULL DEFAULT '{}',
  allowed_emails TEXT[] NOT NULL DEFAULT '{}',
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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_onboarding_instance_status
    CHECK (status IN ('draft', 'in_progress', 'equiem_review', 'completed', 'rejected'))
);

-- =========================
-- INDICES FOR PERFORMANCE
-- =========================

-- Onboarding batch lookups
CREATE INDEX idx_onboarding_batch_trace_id ON onboarding_batch(trace_id);

-- Onboarding instance lookups
CREATE INDEX idx_onboarding_instance_batch_id ON onboarding_instance(batch_id);
CREATE INDEX idx_onboarding_instance_company_id ON onboarding_instance(company_id);
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

-- Onboarding instance queries
CREATE INDEX idx_onboarding_instance_link_token ON onboarding_instance(link_token);
CREATE INDEX idx_onboarding_instance_status ON onboarding_instance(status);
CREATE INDEX idx_onboarding_instance_emails ON onboarding_instance(allowed_emails);
CREATE INDEX idx_onboarding_instance_status_submitted ON onboarding_instance(status, submitted_at DESC);
CREATE INDEX idx_onboarding_instance_returned_sections ON onboarding_instance USING GIN(returned_sections);

-- Company lookups
CREATE INDEX idx_company_name ON company(name);
CREATE INDEX idx_company_approved_domains ON company USING GIN(approved_domains);
