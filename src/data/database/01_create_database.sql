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
  source VARCHAR(50),
  status VARCHAR(50),
  trace_id VARCHAR(120),
  file_name VARCHAR(255),
  s3_key TEXT,
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE onboarding_payload (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES onboarding_batch(id) ON DELETE CASCADE,
  row_number INT,
  entity_type VARCHAR(50),
  raw_data JSONB,
  is_valid BOOLEAN DEFAULT TRUE,
  validation_errors JSONB DEFAULT '[]'::jsonb
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