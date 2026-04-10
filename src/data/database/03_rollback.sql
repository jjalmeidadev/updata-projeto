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
DROP INDEX IF EXISTS idx_onboarding_instance_link_token CASCADE;
DROP INDEX IF EXISTS idx_onboarding_instance_status CASCADE;
DROP INDEX IF EXISTS idx_onboarding_instance_emails CASCADE;
DROP INDEX IF EXISTS idx_onboarding_instance_batch_id CASCADE;
DROP INDEX IF EXISTS idx_onboarding_instance_company_id CASCADE;
DROP INDEX IF EXISTS idx_onboarding_instance_status_submitted CASCADE;
DROP INDEX IF EXISTS idx_onboarding_instance_returned_sections CASCADE;
DROP INDEX IF EXISTS idx_company_name CASCADE;
DROP INDEX IF EXISTS idx_company_approved_domains CASCADE;

-- Drop tables (reverse dependency order)

-- Processing tables
DROP TABLE IF EXISTS processing_log CASCADE;
DROP TABLE IF EXISTS processing_job CASCADE;
DROP TABLE IF EXISTS onboarding_mapping CASCADE;
DROP TABLE IF EXISTS onboarding_payload CASCADE;
DROP TABLE IF EXISTS onboarding_batch CASCADE;
DROP TABLE IF EXISTS onboarding_instance CASCADE;

-- User table
DROP TABLE IF EXISTS "user" CASCADE;

-- Company table
DROP TABLE IF EXISTS company CASCADE;

-- Drop enums
DROP TYPE IF EXISTS user_status_enum CASCADE;
DROP TYPE IF EXISTS user_type_enum CASCADE;

-- Optional: remove schema
-- DROP SCHEMA IF EXISTS equiem CASCADE;

COMMIT;

-- Optional execution log
-- INSERT INTO equiem.system_logs (action, executed_at, executed_by) 
-- VALUES ('ROLLBACK', NOW(), current_user);