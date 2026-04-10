-- =====================================
-- 02_initial_data.sql
-- =====================================

SET search_path TO equiem;

BEGIN;

-- Idempotent seed: clear only the tables currently used in this environment.
DO $$
DECLARE
  target_tables text[] := ARRAY[
    'processing_log',
    'processing_job',
    'onboarding_mapping',
    'onboarding_payload',
    'onboarding_instance',
    'onboarding_batch',
    'company',
    'user'
  ];
  existing_tables text;
BEGIN
  SELECT string_agg(format('%I.%I', 'equiem', t), ', ')
  INTO existing_tables
  FROM unnest(target_tables) AS t
  WHERE to_regclass(format('equiem.%I', t)) IS NOT NULL;

  IF existing_tables IS NOT NULL THEN
    EXECUTE 'TRUNCATE TABLE ' || existing_tables || ' CASCADE';
  END IF;
END
$$;

-- USERS
INSERT INTO company (id, name, approved_domains)
VALUES
  (gen_random_uuid(), 'Acme Towers', ARRAY['acme.com']),
  (gen_random_uuid(), 'Globex Offices', ARRAY['globex.com']),
  (gen_random_uuid(), 'Initech Campus', ARRAY['initech.com']),
  (gen_random_uuid(), 'Umbrella Business Park', ARRAY['umbrella.com']),
  (gen_random_uuid(), 'Nova Square', ARRAY['novasquare.com']);

-- USERS
INSERT INTO "user" (
  id,
  first_name,
  last_name,
  email,
  email_verified,
  status,
  user_type,
  auth0_id,
  member_since,
  company_id
)
VALUES
  (gen_random_uuid(), 'Alice', 'Johnson', 'alice@acme.com', true, 'active', 'commercial', 'auth0|seed-alice', NOW() - interval '180 days', (SELECT id FROM company WHERE name = 'Acme Towers' LIMIT 1)),
  (gen_random_uuid(), 'Bruno', 'Silva', 'bruno@globex.com', true, 'active', 'commercial', 'auth0|seed-bruno', NOW() - interval '120 days', (SELECT id FROM company WHERE name = 'Globex Offices' LIMIT 1)),
  (gen_random_uuid(), 'Camila', 'Mendes', 'camila@initech.com', true, 'pending', 'commercial', 'auth0|seed-camila', NOW() - interval '45 days', (SELECT id FROM company WHERE name = 'Initech Campus' LIMIT 1)),
  (gen_random_uuid(), 'Diego', 'Ferreira', 'diego@umbrella.com', false, 'inactive', 'commercial', 'auth0|seed-diego', NOW() - interval '20 days', (SELECT id FROM company WHERE name = 'Umbrella Business Park' LIMIT 1));

-- ONBOARDING BATCHES (examples covering key statuses)
INSERT INTO onboarding_batch (id, source, status, trace_id, file_name, s3_key, created_at, processed_at, error_message)
VALUES
  (gen_random_uuid(), 'api', 'pending',    'seed-trace-pending',    'pending-upload.xlsx',    'seed/onboarding/pending-upload.xlsx',    NOW() - interval '6 hours', NULL, NULL),
  (gen_random_uuid(), 'api', 'processing', 'seed-trace-processing', 'processing-upload.xlsx', 'seed/onboarding/processing-upload.xlsx', NOW() - interval '4 hours', NULL, NULL),
  (gen_random_uuid(), 'api', 'completed',  'seed-trace-completed',  'completed-upload.xlsx',  'seed/onboarding/completed-upload.xlsx',  NOW() - interval '3 days', NOW() - interval '2 days 23 hours', NULL),
  (gen_random_uuid(), 'api', 'failed',     'seed-trace-failed',     'failed-upload.xlsx',     'seed/onboarding/failed-upload.xlsx',     NOW() - interval '1 day', NOW() - interval '22 hours', 'Invalid required fields in 12 rows'),
  (gen_random_uuid(), 'api', 'invalid',    'seed-trace-invalid',    'invalid-upload.csv',     'seed/onboarding/invalid-upload.csv',     NOW() - interval '12 hours', NOW() - interval '11 hours', 'Unsupported file structure');

-- PAYLOADS (mix of valid and invalid data)
INSERT INTO onboarding_payload (id, batch_id, row_number, entity_type, raw_data, is_valid, validation_errors)
VALUES
  (gen_random_uuid(), (SELECT id FROM onboarding_batch WHERE trace_id = 'seed-trace-completed' LIMIT 1), 1, 'building', '{"external_id":"b-001","name":"Tower A","display_order":1}'::jsonb, true, '[]'::jsonb),
  (gen_random_uuid(), (SELECT id FROM onboarding_batch WHERE trace_id = 'seed-trace-completed' LIMIT 1), 2, 'company',  '{"external_id":"c-001","name":"Acme Towers","industry":"Real Estate"}'::jsonb, true, '[]'::jsonb),
  (gen_random_uuid(), (SELECT id FROM onboarding_batch WHERE trace_id = 'seed-trace-failed' LIMIT 1), 1, 'building', '{"external_id":"b-002","name":"","display_order":"first"}'::jsonb, false, '["missing required field: name", "display_order must be number"]'::jsonb),
  (gen_random_uuid(), (SELECT id FROM onboarding_batch WHERE trace_id = 'seed-trace-invalid' LIMIT 1), 1, 'site', '{"raw":"unexpected headers"}'::jsonb, false, '["schema mismatch"]'::jsonb);

-- MAPPINGS (successful external->internal linkage examples)
INSERT INTO onboarding_mapping (id, entity_type, external_id, internal_id, created_at)
VALUES
  (gen_random_uuid(), 'building', 'b-001', gen_random_uuid(), NOW() - interval '2 days 22 hours'),
  (gen_random_uuid(), 'tenant', 't-001', gen_random_uuid(), NOW() - interval '2 days 21 hours');

-- PROCESSING JOBS (covering queue lifecycle)
INSERT INTO processing_job (id, batch_id, type, status, external_reference, error_message, started_at, finished_at)
VALUES
  (gen_random_uuid(), (SELECT id FROM onboarding_batch WHERE trace_id = 'seed-trace-pending' LIMIT 1), 'import', 'queued', NULL, NULL, NOW() - interval '6 hours', NULL),
  (gen_random_uuid(), (SELECT id FROM onboarding_batch WHERE trace_id = 'seed-trace-processing' LIMIT 1), 'import', 'processing', 'job-ref-002', NULL, NOW() - interval '3 hours 50 minutes', NULL),
  (gen_random_uuid(), (SELECT id FROM onboarding_batch WHERE trace_id = 'seed-trace-completed' LIMIT 1), 'import', 'completed', 'job-ref-003', NULL, NOW() - interval '2 days 23 hours', NOW() - interval '2 days 22 hours'),
  (gen_random_uuid(), (SELECT id FROM onboarding_batch WHERE trace_id = 'seed-trace-failed' LIMIT 1), 'import', 'failed', 'job-ref-004', 'Failed to map natural identifiers', NOW() - interval '23 hours', NOW() - interval '22 hours 30 minutes'),
  (gen_random_uuid(), (SELECT id FROM onboarding_batch WHERE trace_id = 'seed-trace-invalid' LIMIT 1), 'import', 'invalid', 'job-ref-005', 'Validation contract failed', NOW() - interval '11 hours 30 minutes', NOW() - interval '11 hours');

-- PROCESSING LOGS
INSERT INTO processing_log (id, job_id, level, message, created_at)
VALUES
  (gen_random_uuid(), (SELECT id FROM processing_job WHERE external_reference = 'job-ref-002' LIMIT 1), 'info',  'Chunk processing started', NOW() - interval '3 hours 49 minutes'),
  (gen_random_uuid(), (SELECT id FROM processing_job WHERE external_reference = 'job-ref-003' LIMIT 1), 'info',  'Batch finalized successfully', NOW() - interval '2 days 22 hours'),
  (gen_random_uuid(), (SELECT id FROM processing_job WHERE external_reference = 'job-ref-004' LIMIT 1), 'error', 'Duplicate natural identifier detected', NOW() - interval '22 hours 35 minutes'),
  (gen_random_uuid(), (SELECT id FROM processing_job WHERE external_reference = 'job-ref-005' LIMIT 1), 'error', 'File format not recognized', NOW() - interval '11 hours 5 minutes');

-- ONBOARDING INSTANCES (dashboard-ready examples for all major statuses)
INSERT INTO onboarding_instance (
  id,
  batch_id,
  company_id,
  company_name,
  selected_sections,
  allowed_emails,
  status,
  progress_percent,
  link_token,
  form_data,
  email_status,
  email_payload,
  submitted_at,
  reviewed_at,
  completed_at,
  section_review,
  returned_sections,
  rejection_reason,
  created_at,
  updated_at
)
VALUES
  (
    gen_random_uuid(),
    (SELECT id FROM onboarding_batch WHERE trace_id = 'seed-trace-pending' LIMIT 1),
    (SELECT id FROM company WHERE name = 'Acme Towers' LIMIT 1),
    'Acme Towers',
    ARRAY['company-details', 'building-setup', 'amenity-settings'],
    ARRAY['owner@acme.com', 'ops@acme.com'],
    'draft',
    10,
    'seed-acme-draft',
    '{"company-details":{"legal_name":"Acme Towers"}}'::jsonb,
    'pending_manual_send',
    '{"onboardingInvite":{"sent":false,"reason":"manual trigger required"}}'::jsonb,
    NULL,
    NULL,
    NULL,
    '{}'::jsonb,
    '{}'::text[],
    NULL,
    NOW() - interval '8 hours',
    NOW() - interval '2 hours'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM onboarding_batch WHERE trace_id = 'seed-trace-processing' LIMIT 1),
    (SELECT id FROM company WHERE name = 'Globex Offices' LIMIT 1),
    'Globex Offices',
    ARRAY['company-details', 'building-setup', 'residential-details'],
    ARRAY['project@globex.com'],
    'in_progress',
    55,
    'seed-globex-in-progress',
    '{"building-setup":{"building_name":"Globex HQ","timezone":"UTC"}}'::jsonb,
    'invite_sent',
    '{"onboardingInvite":{"sent":true,"provider":"smtp"}}'::jsonb,
    NULL,
    NULL,
    NULL,
    '{}'::jsonb,
    '{}'::text[],
    NULL,
    NOW() - interval '2 days',
    NOW() - interval '20 minutes'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM onboarding_batch WHERE trace_id = 'seed-trace-completed' LIMIT 1),
    (SELECT id FROM company WHERE name = 'Initech Campus' LIMIT 1),
    'Initech Campus',
    ARRAY['company-details', 'building-setup', 'amenity-settings'],
    ARRAY['admin@initech.com', 'manager@initech.com'],
    'equiem_review',
    100,
    'seed-initech-review',
    '{"company-details":{"industry":"Technology"},"amenity-settings":{"gym":true}}'::jsonb,
    'admin_submission_message_sent',
    '{"submissionNotification":{"sent":true}}'::jsonb,
    NOW() - interval '1 day',
    NULL,
    NULL,
    '{"company-details":{"status":"approved","reviewedAt":"2026-04-08T09:00:00Z"}}'::jsonb,
    '{}'::text[],
    NULL,
    NOW() - interval '4 days',
    NOW() - interval '1 day'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM onboarding_batch WHERE trace_id = 'seed-trace-failed' LIMIT 1),
    (SELECT id FROM company WHERE name = 'Umbrella Business Park' LIMIT 1),
    'Umbrella Business Park',
    ARRAY['company-details', 'building-setup', 'amenity-settings'],
    ARRAY['coordinator@umbrella.com'],
    'rejected',
    78,
    'seed-umbrella-rejected',
    '{"building-setup":{"building_name":"Umbrella One"}}'::jsonb,
    'admin_submission_message_failed',
    '{"submissionNotification":{"sent":false,"error":"smtp timeout"}}'::jsonb,
    NOW() - interval '2 days',
    NOW() - interval '36 hours',
    NULL,
    '{"building-setup":{"status":"rejected","reason":"Missing floor mapping","reviewedAt":"2026-04-07T13:00:00Z"}}'::jsonb,
    ARRAY['building-setup'],
    'Missing required floor mapping and duplicate room names.',
    NOW() - interval '5 days',
    NOW() - interval '35 hours'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM onboarding_batch WHERE trace_id = 'seed-trace-completed' LIMIT 1),
    (SELECT id FROM company WHERE name = 'Nova Square' LIMIT 1),
    'Nova Square',
    ARRAY['company-details', 'building-setup', 'amenity-settings'],
    ARRAY['owner@novasquare.com', 'ops@novasquare.com'],
    'completed',
    100,
    'seed-nova-completed',
    '{"company-details":{"legal_name":"Nova Square"},"building-setup":{"building_name":"Nova Tower"}}'::jsonb,
    'admin_submission_message_sent',
    '{"submissionNotification":{"sent":true,"provider":"smtp"}}'::jsonb,
    NOW() - interval '6 days',
    NOW() - interval '5 days 20 hours',
    NOW() - interval '5 days 18 hours',
    '{"company-details":{"status":"approved","reviewedAt":"2026-04-03T10:00:00Z"},"building-setup":{"status":"approved","reviewedAt":"2026-04-03T10:30:00Z"},"amenity-settings":{"status":"approved","reviewedAt":"2026-04-03T11:00:00Z"}}'::jsonb,
    '{}'::text[],
    NULL,
    NOW() - interval '8 days',
    NOW() - interval '5 days 18 hours'
  );

COMMIT;
