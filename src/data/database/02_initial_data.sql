-- 02_initial_data.sql

SET search_path TO equiem;

-- =========
-- INDUSTRY
-- =========
INSERT INTO industry (industry_type)
VALUES ('Real Estate'), ('Hospitality');

-- =========
-- CUSTOMER
-- =========
INSERT INTO customer (customer_name, customer_email, region, status)
VALUES ('Demo Customer', 'customer@demo.com', 'APAC', 'active');

-- =========
-- SITE
-- =========
INSERT INTO site (customer_id, site_name, address, timezone, site_type)
SELECT customer_id, 'Demo Site', '100 Collins Street', 'Australia/Melbourne', 'office'
FROM customer
WHERE customer_name = 'Demo Customer';

-- =========
-- BUILDING
-- =========
INSERT INTO building (site_id, building_name, display_order, occupants, footfall, area)
SELECT s.site_id, 'Demo Building A', 1, 250, 1200, '15000 m2'
FROM site s
WHERE s.site_name = 'Demo Site';

-- =========
-- LEVELS
-- =========
INSERT INTO levels (building_id, level_name, level_type, level_number, display_order, space_count)
SELECT b.building_id, 'Level 1', 'Floor', 1, 1, 10
FROM building b
WHERE b.building_name = 'Demo Building A';

-- =========
-- SPACE
-- =========
INSERT INTO space (space_name, ownership_type, levels_id)
SELECT 'Suite 101', 'leased', l.levels_id
FROM levels l
JOIN building b ON b.building_id = l.building_id
WHERE b.building_name = 'Demo Building A';

-- =========
-- GROUP
-- =========
INSERT INTO "group" (building_id, group_type)
SELECT b.building_id, 'Tower A'
FROM building b
WHERE b.building_name = 'Demo Building A';

-- =========
-- PAYMENT
-- =========
INSERT INTO payment (group_id, credit_card, invoice, credits)
SELECT g.group_id, TRUE, TRUE, FALSE
FROM "group" g
JOIN building b ON b.building_id = g.building_id
WHERE b.building_name = 'Demo Building A';

-- =========
-- RATES
-- =========
INSERT INTO rates (group_id, hourly_rate, half_day_rate, full_day_rate, out_of_hours_hourly_rate, weekend_hourly_rate, start_business_hours, end_business_hours, half_day_duration)
SELECT g.group_id, 50.00, 180.00, 320.00, 80.00, 90.00, 9, 18, 4
FROM "group" g
JOIN building b ON b.building_id = g.building_id
WHERE b.building_name = 'Demo Building A';

-- =========
-- CANCELLATION POLICY
-- =========
INSERT INTO cancellation_policy (policy, fee, group_id)
SELECT 'Free cancellation up to 24h', 0.00, g.group_id
FROM "group" g
JOIN building b ON b.building_id = g.building_id
WHERE b.building_name = 'Demo Building A';

-- =========
-- SCHEDULING TYPE
-- =========
INSERT INTO scheduling_type (type, group_id)
SELECT TRUE, g.group_id
FROM "group" g
JOIN building b ON b.building_id = g.building_id
WHERE b.building_name = 'Demo Building A';

-- =========
-- COMPANY
-- =========
INSERT INTO company (
  site_id, company_name, company_email, industry_id,
  approved_domains, user_approval, level, n_f_employees
)
SELECT s.site_id, 'Demo Company', 'contact@demo.com', i.industry_id,
       ARRAY['demo.com'], 'automatic', 1, 42
FROM industry i
JOIN site s ON s.site_name = 'Demo Site'
WHERE i.industry_type = 'Real Estate';

-- =========
-- ATTRIBUTE
-- =========
INSERT INTO attribute (attribute_type, company_id)
SELECT 'Tenant', c.company_id
FROM company c
WHERE c.company_name = 'Demo Company';

-- =========
-- COMPANY_BUILDING
-- =========
INSERT INTO company_building (company_id, building_id)
SELECT c.company_id, b.building_id
FROM company c
JOIN building b ON b.building_name = 'Demo Building A'
WHERE c.company_name = 'Demo Company';

-- =========
-- USER + ISEQUIEM
-- =========
WITH inserted_user AS (
  INSERT INTO "user" (
    first_name, last_name, user_name,
    user_email, email_verified, mobile_number,
    auth0_id, user_status, user_type,
    company_id
  )
  SELECT
    'Admin', 'User', 'Admin User',
    'admin@demo.com', TRUE, '+61400000000',
    'auth0|demo_admin', 'active', 'commercial',
    c.company_id
  FROM company c
  WHERE c.company_name = 'Demo Company'
  RETURNING user_id
)
INSERT INTO isequiem (equiem_type, user_id)
SELECT TRUE, user_id FROM inserted_user;

-- =========
-- ROLE
-- =========
INSERT INTO role (role_name, description, scope_level, permissions)
VALUES ('Property Manager', 'Manages site', 'site', ARRAY['read:users', 'write:content']);

-- =========
-- SITE PROFILE
-- =========
INSERT INTO site_profile (user_id, site_id, company_id, status, is_active)
SELECT u.user_id, s.site_id, c.company_id, 'active', TRUE
FROM "user" u
JOIN company c ON u.company_id = c.company_id
JOIN site s ON s.site_id = c.site_id
WHERE u.user_email = 'admin@demo.com';

-- =========
-- ROOM
-- =========
INSERT INTO room (
  amenity_title, amenity_type, capacity, description,
  levels_id, space_id,
  available_from, available_to,
  approval_required_for_bookings,
  invite_visitors_to_bookings,
  are_recurring_bookings_allowed,
  scheduling_type_id, rates_id, cancellation_policy_id, building_id
)
SELECT
  'Meeting Room 1', 'meeting', 10, 'Demo room',
  l.levels_id, sp.space_id,
  NOW(), NOW() + interval '30 days',
  TRUE, TRUE, TRUE,
  st.scheduling_type_id, r.rates_id, cp.cancellation_policy_id, b.building_id
FROM building b
JOIN levels l ON l.building_id = b.building_id
JOIN space sp ON sp.levels_id = l.levels_id
JOIN "group" g ON g.building_id = b.building_id
JOIN scheduling_type st ON st.group_id = g.group_id
JOIN rates r ON r.group_id = g.group_id
JOIN cancellation_policy cp ON cp.group_id = g.group_id
WHERE b.building_name = 'Demo Building A'
LIMIT 1;

-- =========
-- BOOKABLE RESOURCE
-- =========
INSERT INTO bookable_resource (room_id, name, description, capacity, location, status, building_id)
SELECT rm.room_id, 'Board Room 1', 'Main boardroom', 12, 'Level 1', 'active', rm.building_id
FROM room rm
WHERE rm.amenity_title = 'Meeting Room 1';

-- =========
-- BOOKING
-- =========
INSERT INTO booking (start_time, end_time, status, notes, user_id, bookable_resource_id)
SELECT
  NOW(), NOW() + interval '1 hour', 'pending', 'Demo booking',
  u.user_id, br.bookable_resource_id
FROM "user" u
JOIN bookable_resource br ON TRUE
WHERE u.user_email = 'admin@demo.com'
LIMIT 1;

-- =========
-- ROOM CONFIG
-- =========
INSERT INTO room_configuration (room_name, room_id)
SELECT 'Default Layout', rm.room_id
FROM room rm;

-- =========
-- REQUIRED INFO
-- =========
INSERT INTO required_information (membership, number, room_id)
SELECT TRUE, TRUE, rm.room_id
FROM room rm;

-- =========
-- REQUEST MANAGEMENT
-- =========
INSERT INTO request_management (user_id, questions)
SELECT u.user_id, 'Demo request questions'
FROM "user" u
WHERE u.user_email = 'admin@demo.com';

-- =========
-- PERMITS CONFIG
-- =========
INSERT INTO permits_configurations (
  building_id, user_id,
  template_source_selection, permit_type_question_mapping,
  default_template_selection_state, is_comment_mandatory,
  is_car_registration_captured, digital_sign_off_details,
  is_document_upload_required, minimum_permit_notice_period,
  maximum_permit_duration, is_contractor_phone_mandatory,
  has_essential_documents_attached,
  permit_notification_recipients,
  property_management_training_and_approval_levels
)
SELECT
  b.building_id,
  u.user_id,
  'default', 'mapping_v1',
  'enabled', TRUE,
  TRUE, 'digital_sign_v1',
  TRUE, '24h',
  '8h', TRUE,
  'docs attached',
  'admin@demo.com',
  'level_1'
FROM building b
JOIN "user" u ON u.user_email = 'admin@demo.com'
WHERE b.building_name = 'Demo Building A';