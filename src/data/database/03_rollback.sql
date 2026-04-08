-- =====================================
-- rollback.sql
-- Full database rollback
-- =====================================
-- Reverts all database changes from Sprint 3–4.
-- WARNING: Running this script will permanently delete data.

SET search_path TO equiem;

-- Drop indices
DROP INDEX IF EXISTS idx_onboarding_batch_trace_id CASCADE;
DROP INDEX IF EXISTS idx_onboarding_batch_status CASCADE;
DROP INDEX IF EXISTS idx_onboarding_batch_created_at CASCADE;
DROP INDEX IF EXISTS idx_onboarding_payload_batch_id CASCADE;
DROP INDEX IF EXISTS idx_onboarding_payload_entity_type CASCADE;
DROP INDEX IF EXISTS idx_onboarding_payload_is_valid CASCADE;
DROP INDEX IF EXISTS idx_onboarding_mapping_entity_external CASCADE;
DROP INDEX IF EXISTS idx_onboarding_mapping_internal_id CASCADE;
DROP INDEX IF EXISTS idx_processing_job_batch_id CASCADE;
DROP INDEX IF EXISTS idx_processing_job_status CASCADE;
DROP INDEX IF EXISTS idx_processing_chunk_batch_status CASCADE;
DROP INDEX IF EXISTS idx_processing_chunk_status CASCADE;
DROP INDEX IF EXISTS idx_onboarding_instance_link_token CASCADE;
DROP INDEX IF EXISTS idx_onboarding_instance_company_id CASCADE;
DROP INDEX IF EXISTS idx_onboarding_instance_status CASCADE;
DROP INDEX IF EXISTS idx_onboarding_instance_emails CASCADE;

-- Drop tables (reverse dependency order)

-- Processing tables
DROP TABLE IF EXISTS processing_chunk CASCADE;
DROP TABLE IF EXISTS processing_log CASCADE;
DROP TABLE IF EXISTS processing_job CASCADE;
DROP TABLE IF EXISTS onboarding_mapping CASCADE;
DROP TABLE IF EXISTS onboarding_payload CASCADE;
DROP TABLE IF EXISTS onboarding_batch CASCADE;
DROP TABLE IF EXISTS onboarding_instance CASCADE;

-- Booking
DROP TABLE IF EXISTS booking CASCADE;

-- Resources
DROP TABLE IF EXISTS bookable_resource CASCADE;

-- Users and profiles
DROP TABLE IF EXISTS user_role CASCADE;
DROP TABLE IF EXISTS site_profile CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- Hierarchy
DROP TABLE IF EXISTS level CASCADE;
DROP TABLE IF EXISTS space CASCADE;
DROP TABLE IF EXISTS building CASCADE;
DROP TABLE IF EXISTS site CASCADE;

-- Configuration tables
DROP TABLE IF EXISTS role CASCADE;
DROP TABLE IF EXISTS "group" CASCADE;
DROP TABLE IF EXISTS interest CASCADE;
DROP TABLE IF EXISTS apartment CASCADE;
DROP TABLE IF EXISTS company CASCADE;
DROP TABLE IF EXISTS customer CASCADE;

-- Drop enums
DROP TYPE IF EXISTS customer_status_enum CASCADE;
DROP TYPE IF EXISTS site_type_enum CASCADE;
DROP TYPE IF EXISTS ownership_type_enum CASCADE;
DROP TYPE IF EXISTS user_status_enum CASCADE;
DROP TYPE IF EXISTS user_type_enum CASCADE;
DROP TYPE IF EXISTS booking_status_enum CASCADE;
DROP TYPE IF EXISTS resource_status_enum CASCADE;
DROP TYPE IF EXISTS user_approval_enum CASCADE;
DROP TYPE IF EXISTS role_scope_enum CASCADE;

-- Optional: remove schema
-- DROP SCHEMA IF EXISTS equiem CASCADE;

COMMIT;

-- Optional execution log
-- INSERT INTO equiem.system_logs (action, executed_at, executed_by) 
-- VALUES ('ROLLBACK', NOW(), current_user);