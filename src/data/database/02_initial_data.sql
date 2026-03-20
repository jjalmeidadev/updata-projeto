-- =====================================
-- 02_initial_data.sql
-- =====================================

SET search_path TO equiem;

-- CUSTOMERS
INSERT INTO customer (id, external_id, name, region, status) VALUES
(gen_random_uuid(),'cust-1','Acme','APAC','active'),
(gen_random_uuid(),'cust-2','Globex','EU','active'),
(gen_random_uuid(),'cust-3','Initech','US','active'),
(gen_random_uuid(),'cust-4','Umbrella','LATAM','inactive');

-- SITES
INSERT INTO site
SELECT gen_random_uuid(),'site-'||i,'Site '||i,'Address '||i,'UTC','commercial',
(SELECT id FROM customer ORDER BY random() LIMIT 1)
FROM generate_series(1,4) i;

-- BUILDINGS
INSERT INTO building
SELECT gen_random_uuid(),'bldg-'||i,'Building '||i,i,
(SELECT id FROM site ORDER BY random() LIMIT 1)
FROM generate_series(1,6) i;

-- LEVELS
INSERT INTO level
SELECT gen_random_uuid(),'lvl-'||i,'Level '||i,i,5,
(SELECT id FROM building ORDER BY random() LIMIT 1)
FROM generate_series(1,8) i;

-- SPACES (ENUM FIXED)
INSERT INTO space
SELECT gen_random_uuid(),'space-'||i,'Space '||i,
CASE 
  WHEN i%3=0 THEN 'owned'::ownership_type_enum
  WHEN i%2=0 THEN 'common'::ownership_type_enum
  ELSE 'leased'::ownership_type_enum
END,
(SELECT id FROM level ORDER BY random() LIMIT 1)
FROM generate_series(1,10) i;

-- COMPANIES
INSERT INTO company
SELECT gen_random_uuid(),'comp-'||i,'Company '||i,'Tech',ARRAY['premium'],ARRAY['mail.com'],'automatic'
FROM generate_series(1,4) i;

-- APARTMENTS
INSERT INTO apartment
SELECT gen_random_uuid(),'Apt '||i FROM generate_series(1,4) i;

-- USERS
INSERT INTO "user"
SELECT gen_random_uuid(),'User'||i,'Test','user'||i||'@mail.com',TRUE,'+55','active','commercial','auth0|'||i,NOW(),
(SELECT id FROM company ORDER BY random() LIMIT 1),
(SELECT id FROM apartment ORDER BY random() LIMIT 1)
FROM generate_series(1,8) i;

-- SITE PROFILE
INSERT INTO site_profile
SELECT gen_random_uuid(),'active',NOW(),TRUE,
u.id,
(SELECT id FROM site ORDER BY random() LIMIT 1),
(SELECT id FROM company ORDER BY random() LIMIT 1)
FROM "user" u;

-- ROLES
INSERT INTO role
SELECT gen_random_uuid(),'Role '||i,'desc','site',ARRAY['read','write']
FROM generate_series(1,4) i;

-- USER ROLE
INSERT INTO user_role
SELECT gen_random_uuid(),u.id,(SELECT id FROM role ORDER BY random() LIMIT 1)
FROM "user" u;

-- GROUPS
INSERT INTO "group"
SELECT gen_random_uuid(),'Group '||i FROM generate_series(1,4) i;

-- INTERESTS
INSERT INTO interest VALUES
(gen_random_uuid(),'Wellness'),
(gen_random_uuid(),'Fitness'),
(gen_random_uuid(),'Tech'),
(gen_random_uuid(),'Networking');

-- RESOURCES
INSERT INTO bookable_resource
SELECT gen_random_uuid(),'Room '||i,'Meeting',10,'Level '||i,'active',ARRAY['img.jpg'],
(SELECT id FROM building ORDER BY random() LIMIT 1)
FROM generate_series(1,6) i;

-- BOOKINGS
INSERT INTO booking
SELECT gen_random_uuid(),NOW(),NOW()+interval '1 hour','confirmed','Meeting',
(SELECT id FROM "user" ORDER BY random() LIMIT 1),
(SELECT id FROM bookable_resource ORDER BY random() LIMIT 1)
FROM generate_series(1,10);

-- ONBOARDING
INSERT INTO onboarding_batch (id, source, status, created_at)
VALUES (gen_random_uuid(),'api','pending',NOW());

INSERT INTO onboarding_payload (id, batch_id, entity_type, raw_data)
SELECT gen_random_uuid(),
(SELECT id FROM onboarding_batch LIMIT 1),
'customer',
jsonb_build_object('name','Test '||i)
FROM generate_series(1,4) i;

-- PROCESSING
INSERT INTO processing_job (id, batch_id, type, status)
SELECT gen_random_uuid(),
(SELECT id FROM onboarding_batch LIMIT 1),
'import','queued'
FROM generate_series(1,4);

INSERT INTO processing_log (id, job_id, message)
SELECT gen_random_uuid(),
(SELECT id FROM processing_job ORDER BY random() LIMIT 1),
'started'
FROM generate_series(1,4);