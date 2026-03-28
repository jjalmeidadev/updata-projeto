-- =====================================
-- rollback.sql
-- Rollback completo do banco de dados
-- =====================================
-- Este script reverte todas as mudanças feitas no banco durante Sprint 3-4
-- Executar SOMENTE em caso de necessidade de reverter para estado anterior
-- Data: 27 de março de 2026
-- Versão: 1.0

-- IMPORTANTE: Executar com cuidado! Dados serão perdidos.

SET search_path TO equiem;

-- =========================
-- DROP INDICES
-- =========================
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

-- =========================
-- DROP TABLES (em ordem reversa de dependência)
-- =========================

-- Tabelas de processamento
DROP TABLE IF EXISTS processing_chunk CASCADE;
DROP TABLE IF EXISTS processing_log CASCADE;
DROP TABLE IF EXISTS processing_job CASCADE;
DROP TABLE IF EXISTS onboarding_mapping CASCADE;
DROP TABLE IF EXISTS onboarding_payload CASCADE;
DROP TABLE IF EXISTS onboarding_batch CASCADE;
DROP TABLE IF EXISTS onboarding_instance CASCADE;

-- Tabelas de booking
DROP TABLE IF EXISTS booking CASCADE;

-- Tabelas de recurso
DROP TABLE IF EXISTS bookable_resource CASCADE;

-- Tabelas de user e profile
DROP TABLE IF EXISTS user_role CASCADE;
DROP TABLE IF EXISTS site_profile CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- Tabelas de hierarquia
DROP TABLE IF EXISTS level CASCADE;
DROP TABLE IF EXISTS space CASCADE;
DROP TABLE IF EXISTS building CASCADE;
DROP TABLE IF EXISTS site CASCADE;

-- Tabelas de configuração
DROP TABLE IF EXISTS role CASCADE;
DROP TABLE IF EXISTS "group" CASCADE;
DROP TABLE IF EXISTS interest CASCADE;
DROP TABLE IF EXISTS apartment CASCADE;
DROP TABLE IF EXISTS company CASCADE;
DROP TABLE IF EXISTS customer CASCADE;

-- =========================
-- DROP ENUMS
-- =========================
DROP TYPE IF EXISTS customer_status_enum CASCADE;
DROP TYPE IF EXISTS site_type_enum CASCADE;
DROP TYPE IF EXISTS ownership_type_enum CASCADE;
DROP TYPE IF EXISTS user_status_enum CASCADE;
DROP TYPE IF EXISTS user_type_enum CASCADE;
DROP TYPE IF EXISTS booking_status_enum CASCADE;
DROP TYPE IF EXISTS resource_status_enum CASCADE;
DROP TYPE IF EXISTS user_approval_enum CASCADE;
DROP TYPE IF EXISTS role_scope_enum CASCADE;

-- =========================
-- DROP SCHEMA (opcional - comentado por segurança)
-- =========================
-- DROP SCHEMA IF EXISTS equiem CASCADE;

-- =========================
-- CONFIRMAÇÃO
-- =========================
-- Após executar este script, o banco estará em estado vazio
-- Para restaurar, execute:
--   00_create_database.sql (ou versão correspondente)
--   00_initial_data.sql (para dados iniciais)
--
-- Verificar integridade:
--   SELECT * FROM information_schema.tables WHERE table_schema = 'equiem';

COMMIT;

-- Log de execução (descomentar se usar LOG TABLE)
-- INSERT INTO equiem.system_logs (action, executed_at, executed_by) 
-- VALUES ('ROLLBACK', NOW(), current_user);
