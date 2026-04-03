
SET search_path TO equiem;

BEGIN;

-- Normalize invalid placeholder emails generated during early auth integration.
-- This prevents unique email collisions and keeps one deterministic fallback per auth0_id.
WITH target_rows AS (
  SELECT
    u.id,
    u.auth0_id,
    LOWER(REGEXP_REPLACE(COALESCE(u.auth0_id, ''), '[^a-zA-Z0-9._-]+', '_', 'g')) AS normalized_auth0
  FROM equiem."user" u
  WHERE
    COALESCE(TRIM(u.email), '') = ''
    OR UPPER(TRIM(u.email)) = 'EMPTY'
),
candidate_updates AS (
  SELECT
    t.id,
    CASE
      WHEN t.normalized_auth0 = '' THEN 'unknown_user_' || SUBSTRING(t.id::text, 1, 8) || '@auth0.local'
      ELSE t.normalized_auth0 || '@auth0.local'
    END AS candidate_email
  FROM target_rows t
),
deduplicated_updates AS (
  SELECT
    c.id,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM equiem."user" u2
        WHERE LOWER(u2.email) = LOWER(c.candidate_email)
          AND u2.id <> c.id
      ) THEN
        SPLIT_PART(c.candidate_email, '@', 1) || '_' || SUBSTRING(c.id::text, 1, 8) || '@auth0.local'
      ELSE
        c.candidate_email
    END AS resolved_email
  FROM candidate_updates c
)
UPDATE equiem."user" u
SET email = d.resolved_email
FROM deduplicated_updates d
WHERE u.id = d.id;

COMMIT;

-- Optional check:
-- SELECT id, email, auth0_id FROM equiem."user" ORDER BY id DESC LIMIT 20;
