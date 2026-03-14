-- 02_initial_data.sql

SET search_path TO equiem;

-- INDUSTRY
INSERT INTO industry (industry_type)
VALUES ('Real Estate'), ('Hospitality');

-- CUSTOMER
INSERT INTO customer (customer_name, customer_email)
VALUES ('Demo Customer', 'customer@demo.com');

-- SITE
INSERT INTO site (customer_id, site_name)
SELECT customer_id, 'Demo Site'
FROM customer
WHERE customer_name = 'Demo Customer';

-- BUILDING
INSERT INTO building (site_id, building_name, occupants, footfall, area)
SELECT s.site_id, 'Demo Building A', 250, 1200, '15000 m2'
FROM site s
WHERE s.site_name = 'Demo Site';

-- LEVELS
INSERT INTO levels (building_id, level_type, level_number)
SELECT b.building_id, 'Floor', 1
FROM building b
WHERE b.building_name = 'Demo Building A';

-- GROUP
INSERT INTO "group" (building_id, group_type)
SELECT b.building_id, 'Tower A'
FROM building b
WHERE b.building_name = 'Demo Building A';

-- PAYMENT
INSERT INTO payment (group_id, credit_card, invoice, credits)
SELECT g.group_id, TRUE, TRUE, FALSE
FROM "group" g
JOIN building b ON b.building_id = g.building_id
WHERE b.building_name = 'Demo Building A';

-- RATES
INSERT INTO rates (group_id, hourly_rate, half_day_rate, full_day_rate, out_of_hours_hourly_rate, weekend_hourly_rate, start_business_hours, end_business_hours, half_day_duration)
SELECT g.group_id, 50.00, 180.00, 320.00, 80.00, 90.00, 9, 18, 4
FROM "group" g
JOIN building b ON b.building_id = g.building_id
WHERE b.building_name = 'Demo Building A';

-- CANCELLATION POLICY
INSERT INTO cancellation_policy (policy, fee, group_id)
SELECT 'Free cancellation up to 24h', 0.00, g.group_id
FROM "group" g
JOIN building b ON b.building_id = g.building_id
WHERE b.building_name = 'Demo Building A';

-- SCHEDULING TYPE
INSERT INTO scheduling_type (type, group_id)
SELECT TRUE, g.group_id
FROM "group" g
JOIN building b ON b.building_id = g.building_id
WHERE b.building_name = 'Demo Building A';

-- COMPANY
INSERT INTO company (site_id, company_name, company_email, industry_id, level, n_f_employees)
SELECT s.site_id, 'Demo Company', 'contact@demo.com', i.industry_id, 1, 42
FROM industry i
JOIN site s ON s.site_name = 'Demo Site'
WHERE i.industry_type = 'Real Estate';

-- ATTRIBUTE
INSERT INTO attribute (attribute_type, company_id)
SELECT 'Tenant', c.company_id
FROM company c
WHERE c.company_name = 'Demo Company';

-- COMPANY_BUILDING
INSERT INTO company_building (company_id, building_id)
SELECT c.company_id, b.building_id
FROM company c
JOIN building b ON b.building_name = 'Demo Building A'
WHERE c.company_name = 'Demo Company';

-- USER (UUID) + capture generated UUID
WITH inserted_user AS (
  INSERT INTO "user" (user_name, user_email, password, auth0_id, company_id, user_type)
  SELECT 'Admin User', 'admin@demo.com', NULL, 'auth0|demo_admin', c.company_id, 'commercial'
  FROM company c
  WHERE c.company_name = 'Demo Company'
  RETURNING user_id
)
INSERT INTO isequiem (equiem_type, user_id)
SELECT TRUE, user_id
FROM inserted_user;

-- ROOM
INSERT INTO room (
  amenity_title, amenity_type, capacity, description, levels_id, start_date_end_date,
  prep_time_before, prep_time_after, minimum_notice_before_booking, maximum_time_before_booking,
  days_available, available_from, available_to, minimum_booking_length, maximum_booking_length,
  approval_required_for_bookings, invite_visitors_to_bookings, who_can_book_this_resource,
  is_there_a_different_rate, are_recurring_bookings_allowed, is_dependent_on_other_resources,
  notice_required_for_cancellation,
  scheduling_type_id, rates_id, cancellation_policy_id, building_id
)
SELECT
  'Meeting Room 1', 'meeting', 10, 'Demo room', l.levels_id, NULL,
  '10m', '10m', '1h', '30d',
  'Mon-Fri', NOW(), NOW() + interval '30 days', '30m', '8h',
  TRUE, TRUE, 'all', 'no', TRUE, NULL,
  '24h',
  st.scheduling_type_id, r.rates_id, cp.cancellation_policy_id, b.building_id
FROM building b
JOIN levels l ON l.building_id = b.building_id
JOIN "group" g ON g.building_id = b.building_id
JOIN scheduling_type st ON st.group_id = g.group_id
JOIN rates r ON r.group_id = g.group_id
JOIN cancellation_policy cp ON cp.group_id = g.group_id
WHERE b.building_name = 'Demo Building A'
LIMIT 1;

INSERT INTO site_profile (user_id, site_id, company_id, status)
SELECT u.user_id, s.site_id, c.company_id, 'active'
FROM "user" u
JOIN company c ON u.company_id = c.company_id
JOIN site s ON s.site_id = c.site_id
WHERE u.user_email = 'admin@demo.com';

-- ROOM CONFIG (1:1)
INSERT INTO room_configuration (room_name, room_id)
SELECT 'Default Layout', rm.room_id
FROM room rm
WHERE rm.amenity_title = 'Meeting Room 1';

-- REQUIRED INFO (1:1)
INSERT INTO required_information (membership, number, room_id)
SELECT TRUE, TRUE, rm.room_id
FROM room rm
WHERE rm.amenity_title = 'Meeting Room 1';

-- REQUEST_MANAGEMENT (UUID FK)
INSERT INTO request_management (user_id, questions)
SELECT u.user_id, 'Demo request questions'
FROM "user" u
WHERE u.user_email = 'admin@demo.com';

-- PERMITS_CONFIGURATIONS (UUID FK)
INSERT INTO permits_configurations (
  building_id, user_id, template_source_selection, permit_type_question_mapping,
  default_template_selection_state, is_comment_mandatory, is_car_registration_captured,
  digital_sign_off_details, is_document_upload_required, minimum_permit_notice_period,
  maximum_permit_duration, is_contractor_phone_mandatory, has_essential_documents_attached,
  permit_notification_recipients, property_management_training_and_approval_levels
)
SELECT
  b.building_id,
  u.user_id,
  'default', 'mapping_v1',
  'enabled', TRUE, TRUE,
  'digital_sign_v1', TRUE, '24h',
  '8h', TRUE, 'docs attached',
  'admin@demo.com', 'level_1'
FROM building b
JOIN "user" u ON u.user_email = 'admin@demo.com'
WHERE b.building_name = 'Demo Building A';