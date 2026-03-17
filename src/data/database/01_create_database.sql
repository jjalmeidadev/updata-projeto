-- 01_create_database.sql (PostgreSQL 14+)

DROP SCHEMA IF EXISTS equiem CASCADE;
CREATE SCHEMA equiem;
SET search_path TO equiem;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========
-- ENUMS
-- =========

CREATE TYPE customer_status_enum AS ENUM ('active', 'inactive');
CREATE TYPE user_approval_enum AS ENUM ('automatic', 'manual');
CREATE TYPE user_type_enum AS ENUM ('commercial', 'residential', 'visitor');
CREATE TYPE user_status_enum AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE site_profile_status_enum AS ENUM ('active', 'inactive');
CREATE TYPE role_scope_level_enum AS ENUM ('site', 'building', 'company');
CREATE TYPE bookable_resource_status_enum AS ENUM ('active', 'inactive');
CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE space_ownership_type_enum AS ENUM ('leased', 'owned', 'common');

-- ===============
-- CORE STRUCTURE
-- ===============

CREATE TABLE IF NOT EXISTS customer (
  customer_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  region VARCHAR(100) NOT NULL,
  status customer_status_enum NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS site (
  site_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id INT NOT NULL,
  site_name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  timezone VARCHAR(100) NOT NULL,
  site_type VARCHAR(50) NOT NULL,

  CONSTRAINT fk_site_customer
    FOREIGN KEY (customer_id)
    REFERENCES customer(customer_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS building (
  building_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  site_id INT NOT NULL,
  building_name VARCHAR(255) NOT NULL,
  display_order INT NOT NULL DEFAULT 1,
  occupants INT,
  footfall INT,
  area VARCHAR(255),

  CONSTRAINT fk_building_site
    FOREIGN KEY (site_id)
    REFERENCES site(site_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS levels (
  levels_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  building_id INT NOT NULL,
  level_name VARCHAR(255) NOT NULL,
  level_type VARCHAR(255),
  level_number INT NOT NULL,
  display_order INT NOT NULL,
  space_count INT NOT NULL DEFAULT 0,

  CONSTRAINT fk_levels_building
    FOREIGN KEY (building_id)
    REFERENCES building(building_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS space (
  space_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  space_name VARCHAR(255) NOT NULL,
  ownership_type space_ownership_type_enum NOT NULL,
  levels_id INT NOT NULL,

  CONSTRAINT fk_space_levels
    FOREIGN KEY (levels_id)
    REFERENCES levels(levels_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

-- Internal booking/building subdivision entity
CREATE TABLE IF NOT EXISTS "group" (
  group_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  building_id INT NOT NULL,
  group_type VARCHAR(255) NOT NULL,

  CONSTRAINT fk_group_building
    FOREIGN KEY (building_id)
    REFERENCES building(building_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS payment (
  payment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id INT NOT NULL UNIQUE,
  credit_card BOOLEAN NOT NULL,
  invoice BOOLEAN NOT NULL,
  credits BOOLEAN NOT NULL,

  CONSTRAINT fk_payment_group
    FOREIGN KEY (group_id)
    REFERENCES "group"(group_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS rates (
  rates_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id INT NOT NULL,
  hourly_rate NUMERIC(12,2) NOT NULL,
  half_day_rate NUMERIC(12,2),
  full_day_rate NUMERIC(12,2),
  out_of_hours_hourly_rate NUMERIC(12,2),
  weekend_hourly_rate NUMERIC(12,2),
  start_business_hours DOUBLE PRECISION,
  end_business_hours DOUBLE PRECISION,
  half_day_duration DOUBLE PRECISION,

  CONSTRAINT fk_rates_group
    FOREIGN KEY (group_id)
    REFERENCES "group"(group_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS shared_facilities (
  shared_facilities_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,

  CONSTRAINT fk_shared_facilities_group
    FOREIGN KEY (group_id)
    REFERENCES "group"(group_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS cancellation_policy (
  cancellation_policy_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  policy VARCHAR(255) NOT NULL,
  fee NUMERIC(12,2) NOT NULL,
  group_id INT NOT NULL,

  CONSTRAINT fk_cancellation_policy_group
    FOREIGN KEY (group_id)
    REFERENCES "group"(group_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS scheduling_type (
  scheduling_type_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type BOOLEAN NOT NULL,
  group_id INT NOT NULL,

  CONSTRAINT fk_scheduling_type_group
    FOREIGN KEY (group_id)
    REFERENCES "group"(group_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

-- ===============
-- ROOM DOMAIN
-- ===============

CREATE TABLE IF NOT EXISTS room (
  room_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  amenity_title VARCHAR(255) NOT NULL,
  amenity_type VARCHAR(255),
  capacity INT NOT NULL,
  description VARCHAR(500),
  levels_id INT NOT NULL,
  space_id INT,
  start_date_end_date TIMESTAMP,
  prep_time_before VARCHAR(255),
  prep_time_after VARCHAR(255),
  minimum_notice_before_booking VARCHAR(255),
  maximum_time_before_booking VARCHAR(255),
  days_available VARCHAR(255),
  available_from TIMESTAMP NOT NULL,
  available_to TIMESTAMP NOT NULL,
  minimum_booking_length VARCHAR(255),
  maximum_booking_length VARCHAR(255),
  approval_required_for_bookings BOOLEAN NOT NULL,
  invite_visitors_to_bookings BOOLEAN NOT NULL,
  who_can_book_this_resource VARCHAR(255),
  is_there_a_different_rate VARCHAR(255),
  are_recurring_bookings_allowed BOOLEAN NOT NULL,
  is_dependent_on_other_resources VARCHAR(255),
  notice_required_for_cancellation VARCHAR(255),

  scheduling_type_id INT NOT NULL,
  rates_id INT NOT NULL,
  cancellation_policy_id INT,
  building_id INT NOT NULL,

  CONSTRAINT fk_room_scheduling_type
    FOREIGN KEY (scheduling_type_id)
    REFERENCES scheduling_type(scheduling_type_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT fk_room_rates
    FOREIGN KEY (rates_id)
    REFERENCES rates(rates_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT fk_room_cancellation_policy
    FOREIGN KEY (cancellation_policy_id)
    REFERENCES cancellation_policy(cancellation_policy_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  CONSTRAINT fk_room_building
    FOREIGN KEY (building_id)
    REFERENCES building(building_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT fk_room_levels
    FOREIGN KEY (levels_id)
    REFERENCES levels(levels_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT fk_room_space
    FOREIGN KEY (space_id)
    REFERENCES space(space_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS room_configuration (
  room_configuration_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_name VARCHAR(255) NOT NULL,
  room_id INT NOT NULL UNIQUE,

  CONSTRAINT fk_room_configuration_room
    FOREIGN KEY (room_id)
    REFERENCES room(room_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS room_features (
  features_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_name VARCHAR(255) NOT NULL,
  room_id INT NOT NULL,

  CONSTRAINT fk_room_features_room
    FOREIGN KEY (room_id)
    REFERENCES room(room_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS room_extra_features (
  extra_features_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  extra_name VARCHAR(255) NOT NULL,
  fee NUMERIC(12,2),
  room_id INT NOT NULL,

  CONSTRAINT fk_room_extra_features_room
    FOREIGN KEY (room_id)
    REFERENCES room(room_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS required_information (
  required_information_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  membership BOOLEAN,
  number BOOLEAN,
  room_id INT NOT NULL UNIQUE,

  CONSTRAINT fk_required_information_room
    FOREIGN KEY (room_id)
    REFERENCES room(room_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS apartment (
  apartment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  apartment_name VARCHAR(255) NOT NULL,
  building_id INT NOT NULL,

  CONSTRAINT fk_apartment_building
    FOREIGN KEY (building_id)
    REFERENCES building(building_id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS apartment_levels (
  apartment_levels_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  apartment_id INT NOT NULL,
  levels_id INT NOT NULL,

  CONSTRAINT fk_apartment_levels_apartment
    FOREIGN KEY (apartment_id)
    REFERENCES apartment(apartment_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_apartment_levels_levels
    FOREIGN KEY (levels_id)
    REFERENCES levels(levels_id)
    ON DELETE CASCADE,

  CONSTRAINT uq_apartment_level UNIQUE (apartment_id, levels_id)
);

-- ==================
-- COMPANY / USERS
-- ==================

CREATE TABLE IF NOT EXISTS industry (
  industry_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  industry_type VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS company (
  company_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  site_id INT NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  company_email VARCHAR(255),
  industry_id INT,
  approved_domains TEXT[],
  user_approval user_approval_enum NOT NULL DEFAULT 'manual',
  level INT NOT NULL,
  n_f_employees INT NOT NULL,

  CONSTRAINT fk_company_site
    FOREIGN KEY (site_id)
    REFERENCES site(site_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT fk_company_industry
    FOREIGN KEY (industry_id)
    REFERENCES industry(industry_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS attribute (
  attribute_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  attribute_type VARCHAR(255) NOT NULL,
  company_id INT NOT NULL,

  CONSTRAINT fk_attribute_company
    FOREIGN KEY (company_id)
    REFERENCES company(company_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS company_building (
  company_building_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_id INT NOT NULL,
  building_id INT NOT NULL,

  CONSTRAINT fk_company_building_company
    FOREIGN KEY (company_id)
    REFERENCES company(company_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT fk_company_building_building
    FOREIGN KEY (building_id)
    REFERENCES building(building_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT uq_company_building UNIQUE (company_id, building_id)
);

CREATE TABLE IF NOT EXISTS configuration (
  configuration_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_building_id INT NOT NULL UNIQUE,
  status_type_id INT,

  CONSTRAINT fk_configuration_company_building
    FOREIGN KEY (company_building_id)
    REFERENCES company_building(company_building_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS status_type (
  status_type_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  configuration_id INT,

  CONSTRAINT fk_status_type_configuration
    FOREIGN KEY (configuration_id)
    REFERENCES configuration(configuration_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

ALTER TABLE configuration
  ADD CONSTRAINT fk_configuration_status_type
  FOREIGN KEY (status_type_id)
  REFERENCES status_type(status_type_id)
  ON UPDATE CASCADE
  ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS sub_statuses (
  sub_status_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  status_type_id INT NOT NULL,

  CONSTRAINT fk_sub_statuses_status_type
    FOREIGN KEY (status_type_id)
    REFERENCES status_type(status_type_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "user" (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  user_name VARCHAR(255) NOT NULL,

  user_email VARCHAR(255) NOT NULL UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  mobile_number VARCHAR(30),

  password VARCHAR(255),
  auth0_id TEXT UNIQUE,

  user_status user_status_enum NOT NULL DEFAULT 'pending',
  user_type user_type_enum NOT NULL,

  company_id INT,
  apartment_id INT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_user_company
    FOREIGN KEY (company_id)
    REFERENCES company(company_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  CONSTRAINT fk_user_apartment
    FOREIGN KEY (apartment_id)
    REFERENCES apartment(apartment_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS role (
  role_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  role_name VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  scope_level role_scope_level_enum NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS user_role (
  user_role_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL,
  role_id INT NOT NULL,
  building_id INT,
  company_id INT,

  CONSTRAINT fk_user_role_user
    FOREIGN KEY (user_id)
    REFERENCES "user"(user_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_user_role_role
    FOREIGN KEY (role_id)
    REFERENCES role(role_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_user_role_building
    FOREIGN KEY (building_id)
    REFERENCES building(building_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_user_role_company
    FOREIGN KEY (company_id)
    REFERENCES company(company_id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS site_profile (
  site_profile_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL,
  site_id INT NOT NULL,
  company_id INT,
  joined_at TIMESTAMP DEFAULT NOW(),
  status site_profile_status_enum NOT NULL DEFAULT 'active',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  CONSTRAINT uq_user_site UNIQUE (user_id, site_id),

  CONSTRAINT fk_site_profile_user
    FOREIGN KEY (user_id)
    REFERENCES "user"(user_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_site_profile_site
    FOREIGN KEY (site_id)
    REFERENCES site(site_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_site_profile_company
    FOREIGN KEY (company_id)
    REFERENCES company(company_id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS isequiem (
  isequiem_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  equiem_type BOOLEAN NOT NULL,
  user_id UUID NOT NULL UNIQUE,

  CONSTRAINT fk_isequiem_user
    FOREIGN KEY (user_id)
    REFERENCES "user"(user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

-- Identity/user grouping concept matching Equiem GroupInput
CREATE TABLE IF NOT EXISTS identity_group (
  identity_group_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS interest (
  interest_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- ==================
-- BOOKINGS
-- ==================

CREATE TABLE IF NOT EXISTS bookable_resource (
  bookable_resource_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id INT UNIQUE,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(500),
  capacity INT NOT NULL,
  location VARCHAR(255) NOT NULL,
  status bookable_resource_status_enum NOT NULL DEFAULT 'active',
  photos TEXT[],
  building_id INT NOT NULL,

  CONSTRAINT fk_bookable_resource_room
    FOREIGN KEY (room_id)
    REFERENCES room(room_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  CONSTRAINT fk_bookable_resource_building
    FOREIGN KEY (building_id)
    REFERENCES building(building_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS booking (
  booking_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status booking_status_enum NOT NULL DEFAULT 'pending',
  notes VARCHAR(500),
  user_id UUID NOT NULL,
  bookable_resource_id INT NOT NULL,

  CONSTRAINT fk_booking_user
    FOREIGN KEY (user_id)
    REFERENCES "user"(user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT fk_booking_bookable_resource
    FOREIGN KEY (bookable_resource_id)
    REFERENCES bookable_resource(bookable_resource_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

-- ==================
-- REQUESTS + EXAMPLES
-- ==================

CREATE TABLE IF NOT EXISTS request_management (
  request_management_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL,
  questions VARCHAR(255),

  CONSTRAINT fk_request_management_user
    FOREIGN KEY (user_id)
    REFERENCES "user"(user_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS example_categories (
  example_category_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  status_type_id INT NOT NULL,
  access_security VARCHAR(100),
  building_fabric VARCHAR(100),
  cleaning VARCHAR(100),
  customer_service VARCHAR(100),
  emergency VARCHAR(100),
  fire_safety VARCHAR(100),
  furniture_equipment VARCHAR(100),
  general_maintenance VARCHAR(100),
  heating_cooling VARCHAR(100),
  landscaping VARCHAR(100),
  lifts VARCHAR(100),
  lighting VARCHAR(100),
  mechanical_electrical VARCHAR(100),
  miscellaneous VARCHAR(100),
  pest_control VARCHAR(100),
  plumbing_drainage VARCHAR(100),
  waste_recycling VARCHAR(100),

  CONSTRAINT fk_example_categories_status_type
    FOREIGN KEY (status_type_id)
    REFERENCES status_type(status_type_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS example_spaces (
  example_space_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  status_type_id INT NOT NULL,
  example_category_id INT NOT NULL,
  ground VARCHAR(255) NOT NULL,
  level_1 VARCHAR(255) NOT NULL,
  level_2 VARCHAR(255) NOT NULL,
  level_3 VARCHAR(255) NOT NULL,
  level_4 VARCHAR(255) NOT NULL,

  CONSTRAINT fk_example_spaces_status_type
    FOREIGN KEY (status_type_id)
    REFERENCES status_type(status_type_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT fk_example_spaces_example_category
    FOREIGN KEY (example_category_id)
    REFERENCES example_categories(example_category_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

-- ==================
-- MEDIA + RESIDENTIAL
-- ==================

CREATE TABLE IF NOT EXISTS media (
  media_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  building_id INT NOT NULL,
  images BYTEA,
  videos BYTEA,

  CONSTRAINT fk_media_building
    FOREIGN KEY (building_id)
    REFERENCES building(building_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS residential_details (
  residential_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  apartment_name VARCHAR(255) NOT NULL,
  building_id INT NOT NULL,
  level VARCHAR(50) NOT NULL,

  CONSTRAINT fk_residential_details_building
    FOREIGN KEY (building_id)
    REFERENCES building(building_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS is_there_a_firewall (
  is_there_a_firewall_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  firewall_presence BOOLEAN NOT NULL,
  residential_id INT NOT NULL UNIQUE,

  CONSTRAINT fk_firewall_residential
    FOREIGN KEY (residential_id)
    REFERENCES residential_details(residential_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

-- ==================
-- COMPLIANCE
-- ==================

CREATE TABLE IF NOT EXISTS working_at_height (
  working_at_height_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  inspections_up_to_date BOOLEAN NOT NULL,
  certified_safety BOOLEAN NOT NULL,
  has_fall_protection BOOLEAN NOT NULL,
  rescue_readiness_confirmed BOOLEAN NOT NULL,
  is_fragile_surface_secured BOOLEAN NOT NULL,
  has_suitable_communication BOOLEAN NOT NULL,
  has_trained_personnel BOOLEAN NOT NULL,
  is_weather_suitable BOOLEAN NOT NULL,
  is_area_cordoned BOOLEAN NOT NULL,
  building_id INT NOT NULL UNIQUE,

  CONSTRAINT fk_working_at_height_building
    FOREIGN KEY (building_id)
    REFERENCES building(building_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS electrical_works (
  electrical_works_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  building_id INT NOT NULL UNIQUE,
  has_bs921_rubber_matting BOOLEAN NOT NULL,
  comment_question_1 VARCHAR(255) NOT NULL,
  has_bs_en_61111_2009_matting BOOLEAN NOT NULL,
  comment_question_2 VARCHAR(255) NOT NULL,
  is_reg14_live_work_compliant BOOLEAN NOT NULL,
  comment_question_3 VARCHAR(255) NOT NULL,
  is_switching_schedule_attached BOOLEAN NOT NULL,
  comment_question_4 VARCHAR(255) NOT NULL,
  is_dead_proof_verified BOOLEAN NOT NULL,
  comment_question_5 VARCHAR(255) NOT NULL,
  is_earth_connection_verified BOOLEAN NOT NULL,
  comment_question_6 VARCHAR(255) NOT NULL,
  is_warning_notices_provided BOOLEAN NOT NULL,
  comment_question_7 VARCHAR(255) NOT NULL,
  has_padlock_references_stored BOOLEAN NOT NULL,
  comment_question_8 VARCHAR(255) NOT NULL,

  CONSTRAINT fk_electrical_works_building
    FOREIGN KEY (building_id)
    REFERENCES building(building_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fire_alarm_isolation (
  fire_alarm_isolation_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  building_id INT NOT NULL,
  has_fire_risk_assessment_conducted BOOLEAN NOT NULL,
  comment_question_1 VARCHAR(255) NOT NULL,
  is_hot_works_permit_completed BOOLEAN NOT NULL,
  comment_question_2 VARCHAR(255) NOT NULL,
  is_smoke_detector_capping_managed BOOLEAN NOT NULL,
  comment_question_3 VARCHAR(255) NOT NULL,
  is_isolation_duration_indicated BOOLEAN NOT NULL,
  comment_question_4 VARCHAR(255) NOT NULL,
  is_manual_call_points_active BOOLEAN NOT NULL,
  comment_question_5 VARCHAR(255) NOT NULL,
  is_isolation_area_type_indicated BOOLEAN NOT NULL,
  comment_question_6 VARCHAR(255) NOT NULL,
  is_emergency_exit_protection_ready BOOLEAN NOT NULL,
  comment_question_7 VARCHAR(255) NOT NULL,
  is_reinstatement_time_indicated BOOLEAN NOT NULL,
  comment_question_8 VARCHAR(255) NOT NULL,
  is_de_isolation_manual_compliant BOOLEAN NOT NULL,
  comment_question_9 VARCHAR(255) NOT NULL,
  is_isolated_device_count_indicated BOOLEAN NOT NULL,
  comment_question_10 VARCHAR(255) NOT NULL,
  is_sprinkler_coverage_sufficient BOOLEAN NOT NULL,
  comment_question_11 VARCHAR(255) NOT NULL,
  is_manual_fire_watch_active BOOLEAN NOT NULL,
  comment_question_12 VARCHAR(255) NOT NULL,
  has_fire_alarm_means_provided BOOLEAN NOT NULL,
  comment_question_13 VARCHAR(255) NOT NULL,

  CONSTRAINT fk_fire_alarm_isolation_building
    FOREIGN KEY (building_id)
    REFERENCES building(building_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hot_works (
  hot_works_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  building_id INT NOT NULL UNIQUE,
  is_flammable_substances_secured BOOLEAN NOT NULL,
  comment_question_1 VARCHAR(255) NOT NULL,
  is_isolation_agreed_with_management BOOLEAN NOT NULL,
  comment_question_2 VARCHAR(255) NOT NULL,
  is_sprinkler_isolation_authorized BOOLEAN NOT NULL,
  comment_question_3 VARCHAR(255) NOT NULL,
  is_fire_protection_prepared BOOLEAN NOT NULL,
  comment_question_4 VARCHAR(255) NOT NULL,
  is_comm_device_tested_and_issued BOOLEAN NOT NULL,
  comment_question_5 VARCHAR(255) NOT NULL,
  is_operative_medical_fitness_verified BOOLEAN NOT NULL,
  comment_question_6 VARCHAR(255) NOT NULL,
  is_rescue_procedures_and_training_ready BOOLEAN NOT NULL,
  comment_question_7 VARCHAR(255) NOT NULL,

  CONSTRAINT fk_hot_works_building
    FOREIGN KEY (building_id)
    REFERENCES building(building_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lone_working (
  lone_working_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  building_id INT NOT NULL UNIQUE,
  has_lone_working_risk_assessment BOOLEAN NOT NULL,
  comment_question_1 VARCHAR(255) NOT NULL,
  is_lone_worker_inducted BOOLEAN NOT NULL,
  comment_question_2 VARCHAR(255) NOT NULL,
  is_lone_working_procedures_explained BOOLEAN NOT NULL,
  comment_question_3 VARCHAR(255) NOT NULL,
  is_security_comm_log_active BOOLEAN NOT NULL,
  comment_question_4 VARCHAR(255) NOT NULL,
  is_comm_device_tested_and_issued BOOLEAN NOT NULL,
  comment_question_5 VARCHAR(255) NOT NULL,
  is_medical_fitness_controls_verified BOOLEAN NOT NULL,
  comment_question_6 VARCHAR(255) NOT NULL,
  is_emergency_rescue_prepared BOOLEAN NOT NULL,
  comment_question_7 VARCHAR(255) NOT NULL,

  CONSTRAINT fk_lone_working_building
    FOREIGN KEY (building_id)
    REFERENCES building(building_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS confined_spaces (
  confined_spaces_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  building_id INT NOT NULL UNIQUE,
  is_incoming_services_isolated BOOLEAN NOT NULL,
  is_gas_monitoring_prepared_and_trained BOOLEAN NOT NULL,
  is_rpe_prepared_and_trained BOOLEAN NOT NULL,
  is_additional_fire_protection_prepared_and_trained BOOLEAN NOT NULL,
  is_powered_equipment_isolated BOOLEAN NOT NULL,
  is_safety_belt_and_lifeline_prepared_and_trained BOOLEAN NOT NULL,
  is_supervision_and_emergency_contact_provided BOOLEAN NOT NULL,
  is_emergency_rescue_trained BOOLEAN NOT NULL,
  is_lighting_equipment_prepared BOOLEAN NOT NULL,

  CONSTRAINT fk_confined_spaces_building
    FOREIGN KEY (building_id)
    REFERENCES building(building_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS permits_configurations (
  permits_configuration_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  building_id INT NOT NULL,
  user_id UUID NOT NULL,
  template_source_selection VARCHAR(255) NOT NULL,
  permit_type_question_mapping VARCHAR(255) NOT NULL,
  default_template_selection_state VARCHAR(255) NOT NULL,
  is_comment_mandatory BOOLEAN NOT NULL,
  is_car_registration_captured BOOLEAN NOT NULL,
  digital_sign_off_details VARCHAR(200) NOT NULL,
  is_document_upload_required BOOLEAN NOT NULL,
  minimum_permit_notice_period VARCHAR(255) NOT NULL,
  maximum_permit_duration VARCHAR(255) NOT NULL,
  is_contractor_phone_mandatory BOOLEAN NOT NULL,
  has_essential_documents_attached TEXT NOT NULL,
  permit_notification_recipients VARCHAR(255) NOT NULL,
  property_management_training_and_approval_levels VARCHAR(255) NOT NULL,

  CONSTRAINT fk_permits_configurations_building
    FOREIGN KEY (building_id)
    REFERENCES building(building_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT fk_permits_configurations_user
    FOREIGN KEY (user_id)
    REFERENCES "user"(user_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

-- =========
-- INDEXES
-- =========

CREATE INDEX IF NOT EXISTS idx_site_customer_id ON site(customer_id);
CREATE INDEX IF NOT EXISTS idx_building_site_id ON building(site_id);
CREATE INDEX IF NOT EXISTS idx_levels_building_id ON levels(building_id);
CREATE INDEX IF NOT EXISTS idx_space_levels_id ON space(levels_id);
CREATE INDEX IF NOT EXISTS idx_group_building_id ON "group"(building_id);
CREATE INDEX IF NOT EXISTS idx_room_building_id ON room(building_id);
CREATE INDEX IF NOT EXISTS idx_room_levels_id ON room(levels_id);
CREATE INDEX IF NOT EXISTS idx_room_space_id ON room(space_id);
CREATE INDEX IF NOT EXISTS idx_room_scheduling_type_id ON room(scheduling_type_id);
CREATE INDEX IF NOT EXISTS idx_room_rates_id ON room(rates_id);
CREATE INDEX IF NOT EXISTS idx_company_site_id ON company(site_id);
CREATE INDEX IF NOT EXISTS idx_company_building_building_id ON company_building(building_id);
CREATE INDEX IF NOT EXISTS idx_company_building_company_id ON company_building(company_id);
CREATE INDEX IF NOT EXISTS idx_site_profile_user_id ON site_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_site_profile_site_id ON site_profile(site_id);
CREATE INDEX IF NOT EXISTS idx_user_role_user_id ON user_role(user_id);
CREATE INDEX IF NOT EXISTS idx_bookable_resource_building_id ON bookable_resource(building_id);
CREATE INDEX IF NOT EXISTS idx_booking_user_id ON booking(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_bookable_resource_id ON booking(bookable_resource_id);
CREATE INDEX IF NOT EXISTS idx_request_management_user_id ON request_management(user_id);
CREATE INDEX IF NOT EXISTS idx_permits_configurations_user_id ON permits_configurations(user_id);