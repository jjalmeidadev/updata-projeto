# Database Design

## Table of Contents
1. [Overview](#1-overview)  
2. [Conceptual Data Model](#2-conceptual-data-model)  
   2.1 [Entity-Relationship Diagram (ERD)](#21-entity-relationship-diagram-erd)  
   2.2 [Entity Identification](#22-entity-identification)  
   2.3 [Entity Descriptions and Attributes](#23-entity-descriptions-and-attributes)  
   2.4 [Relationships and Cardinalities](#24-relationships-and-cardinalities)  
   2.5 [Business Rules and Constraints](#25-business-rules-and-constraints)  
3. [Logical Data Model](#3-logical-data-model)  
   3.1 [Logical Schema Diagram](#31-logical-schema-diagram)  
   3.2 [Complete Table Definitions](#32-complete-table-definitions)  
   3.3 [Normalization (Up to 3NF)](#33-normalization-up-to-3nf)  
   3.4 [Referential Integrity Rules](#34-referential-integrity-rules)  
   3.5 [Conceptual to Logical Transformation](#35-conceptual-to-logical-transformation)  
   3.6 [Schema Evolution Update (V2 - Current Physical Database)](#36-schema-evolution-update-v2---current-physical-database)
4. [Conclusion](#4-conclusion)

---

# 1. Overview

This document presents the complete **Database Design** for the Equiem Onboarding Middleware System.

The objective is to:

- Identify all domain entities required for onboarding buildings and platform configuration.
- Define their attributes and relationships.
- Establish business rules and constraints.
- Transform the conceptual model into a fully normalized relational schema (3NF).
- Ensure traceability and referential integrity.

This document includes **all 35 entities** required in the domain.

---

# 2. Conceptual Data Model

The conceptual model describes the structure of the system at a high level, focusing on entities, attributes, 
relationships, and business rules:

## 2.1 Entity-Relationship Diagram (ERD)

<div align="center">
<sub>FIGURE 1 – Conceptual Diagram</sub><br>
  <img src="assets/conceptualdiagrampreview.png" width="100%" alt="Conceptual Diagram">
  <sup>Source: Material produced by the authors, 2026.</sup>

</div>

<div align="center">
[See Full PDF](assets/conceptualdatabase.drawio.pdf)
</div>

For better visualization, please access the following [link.](https://drive.google.com/file/d/1a-Kao1kniOMmbktFXLu1YoaF_dwFhOGL/view?usp=sharing)

---

## 2.2 Entity Identification

The system includes the following 35 entities:

1. Building  
2. Levels  
3. Group  
4. Room  
5. Company  
6. User  
7. Industry  
8. Company_Building  
9. Configuration  
10. Status_Type  
11. Sub_Statuses  
12. Room_Configuration  
13. Room_Features  
14. Room_Extra_Features  
15. Required_Information  
16. Scheduling_Type  
17. Rates  
18. Cancellation_Policy  
19. Shared_Facilities  
20. Payment  
21. Residential_Details  
22. Is_There_A_Firewall  
23. Working_At_Height  
24. Electrical_Works  
25. Fire_Alarm_Isolation  
26. Hot_Works  
27. Lone_Working  
28. Confined_Spaces  
29. Permits_Configurations  
30. Request_Management  
31. Example_Categories  
32. Example_Spaces  
33. Attribute  
34. Media  
35. IsEquiem  

---

## 2.3 Entity Descriptions and Attributes

Below are full conceptual descriptions:

### 1. Building

The **Building** entity represents a commercial property managed within the Equiem platform. A building is the primary organizational 
unit in the system and serves as the central point to which many other entities are related, such as rooms, tenants, configurations, 
and compliance processes.

Each building stores general information describing its physical and operational characteristics. Attributes such as the number of 
occupants, footfall metrics, and building area help administrators understand building usage and operational capacity.

Buildings are connected to tenant companies through the **Company_Building** entity and are divided internally into **Levels**, 
which represent floors or structural divisions. Buildings also contain **Rooms**, which represent bookable resources or amenities 
available to tenants.

Attributes:
- building_id (PK)
- building_name
- levels_id  
- occupants
- footfall
- area
- company_building_id  
- group_id  

---

### 2. Levels

The **Levels** entity represents the floors or structural divisions within a building. Each level provides spatial organization, 
allowing rooms, offices, and other resources to be associated with specific areas within a building.

Levels help structure the building hierarchy and enable location-based management of spaces and facilities. For example, meeting 
rooms or amenities may be located on different levels of the building.


Attributes:
- levels_id (PK)
- building_id  
- level_type
- level_number

---

### 3. Group

The **Group** entity represents different sections of building's sites, being able to be divided within towers, blocks and
directional sections.


Attributes:
- group_id (PK)
- building_id  
- group_type

---

### 4. Room

The **Room** entity represents bookable amenities or spaces inside a building, such as meeting rooms, auditoriums, or 
collaboration areas. This entity stores the most detailed configuration related to bookings.

Rooms define capacity, scheduling rules, booking constraints, availability windows, and additional policies. 
They may also include optional features, configurations, and booking restrictions.


Attributes:
- room_id (PK)
- amenity_title
- amenity_type
- capacity
- description
- level
- start_date_end_date
- Prep_time_before
- Prep_time_after
- Minimum_Notice_Before_Booking
- Maximum_Time_Before_Booking
- Days_available
- Available_from
- Available_to
- Minimum_booking_length
- Maximum_booking_length
- Approval_required_for_bookings
- Invite_visitors_to_bookings
- Who_can_book_this_resource
- Is_there_a_different_rate
- Are_recurring_bookings_allowed
- Is_dependent_on_other_resources
- Notice_required_for_cancellation
- scheduling_type_id  
- features_id  
- extra_features_id  
- room_configuration_id  
- rates_id  
- required_information_id  
- cancellation_policy_id  
- building_id  

---

### 5. Company

The **Company** entity represents tenant organizations operating within buildings managed by Equiem.

Attributes:
- company_id (PK)
- company_name
- company_email
- industry_id  
- attribute_id  
- company_building_id  
- level
- n_f_employees

---

### 6. User

The **User** entity represents individuals interacting with the platform. Users may belong to tenant companies or internal Equiem staff.

Attributes:
- user_id (PK)
- user_name
- user_email
- password
- isequiem_id  
- company_id  

---

### 7. Industry

Represents industry classification of companies.

Attributes:
- industry_id (PK)
- industry_type
- company_id  

---

### 8. Company_Building

Junction table resolving Company–Building N:M relationship.

Attributes:
- company_building_id (PK)
- company_id  
- building_id  
- configuration_id  

---

### 9. Configuration

Stores general building configuration settings.

Attributes:
- configuration_id (PK)
- company_building_id  
- status_type_id  

---

### 10. Status_Type

Defines high-level workflow status categories used in operational management.

Attributes:
- status_type_id (PK)
- name
- configuration_id  

---

### 11. Sub_Statuses

Defines specific statuses under Status_Type.

Attributes:
- sub_status_id (PK)
- name
- status_type_id  

---

### 12. Room_Configuration

Defines layout configurations for rooms.

Attributes:
- room_configuration_id (PK)
- room_name
- room_id  

---

### 13. Room_Features

Core features of a room. Examples may include projectors, whiteboards, or desks.

Attributes:
- features_id (PK)
- room_name
- room_id  

---

### 14. Room_Extra_Features

Represents additional resources that can be included during room bookings.

Attributes:
- extra_features_id (PK)
- extra_name
- fee
- room_id  

---

### 15. Required_Information

Information required during booking.

Attributes:
- required_information_id (PK)
- membership
- number
- room_id  

---

### 16. Scheduling_Type

The **Scheduling_Type** entity defines the booking logic associated with a resource. 
It determines how reservations are scheduled and whether booking rules apply to specific groups.

Attributes:
- scheduling_type_id (PK)
- type
- group_id  

---

### 17. Rates

The **Rates** entity defines pricing rules associated with bookable amenities or resources. 
These rates determine the cost of reserving rooms or shared facilities and may vary depending
on time, duration, or scheduling conditions.

Attributes:
- rates_id (PK)
- group_id  
- hourly_rate
- half_day_rate
- full_day_rate
- out_of_hours_hourly_rate
- weekend_hourly_rate
- start_business_hours
- end_business_hours
- half_day_duration

---

### 18. Cancellation_Policy

The **Cancellation_Policy** entity defines the rules applied when a booking is canceled. These
rules specify conditions such as fees or penalties applied depending on the cancellation timing.

Attributes:
- cancellation_policy_id (PK)
- policy
- fee
- group_id  

---

### 19. Shared_Facilities

The **Shared_Facilities** entity represents amenities or resources shared among tenants within a building.
Examples may include conference rooms, lounges or event spaces, for instance.

Attributes:
- shared_facilities_id (PK)
- group_id  
- name

---

### 20. Payment

The **Payment** entity defines the available payment methods and billing configurations associated with a 
tenant group. This allows the system to control which payment methods are accepted for room bookings or services.

Attributes:
- payment_id (PK)
- group_id  
- credit_card
- invoice
- credits

---

### 21. Residential_Details

Represents residential information related to buildings.

Attributes:
- residential_id (PK)
- apartment_name
- building_id  
- level
- is_there_a_firewall_id  

---

### 22. Is_There_A_Firewall

Represents firewall configuration information related to residential areas.

Attributes:
- is_there_a_firewall_id (PK)
- firewall_presence
- residential_id  

---

### 23. Working_At_Height

Represents compliance checks for maintenance activities performed at height within buildings.
Attributes include safety confirmations related to inspections, personnel training, environmental 
conditions, and safety equipment.

Attributes:
- working_at_height_id (PK)
- inspections_up_to_date
- Certified_safety
- has_fall_protection
- rescue_readiness_confirmed
- is_fragile_surface_secured
- has_suitable_communication
- has_trained_personnel
- is_weather_suitable
- is_area_cordoned
- building_id  

---

### 24. Electrical_Works

Represents compliance documentation and safety checks related to electrical maintenance tasks.

Attributes:
- electrical_works_id (PK)
- building_id  
- has_bs921_rubber_matting
- comment_question_1
- has_bs_en_61111_2009_matting
- comment_question_2
- is_reg14_live_work_compliant
- comment_question_3
- is_switching_schedule_attached
- comment_question_4
- is_dead_proof_verified
- comment_question_5
- is_earth_connection_verified
- comment_question_6
- is_warning_notices_provided
- comment_question_7
- has_padlock_references_stored
- comment_question_8

---

### 25. Fire_Alarm_Isolation

Represents operational procedures for isolating fire alarm systems during maintenance activities.

Attributes:
- fire_alarm_isolation_id (PK)
- building_id  
- has_fire_risk_assessment_conducted
- comment_question_1
- is_hot_works_permit_completed
- comment_question_2
- is_smoke_detector_capping_managed
- comment_question_3
- is_isolation_duration_indicated
- comment_question_4
- is_manual_call_points_active
- comment_question_5
- is_isolation_area_type_indicated
- comment_question_6
- is_emergency_exit_protection_ready
- comment_question_7
- is_reinstatement_time_indicated
- comment_question_8
- is_de_isolation_manual_compliant
- comment_question_9
- is_isolated_device_count_indicated
- comment_question_10
- is_sprinkler_coverage_sufficient
- comment_question_11
- is_manual_fire_watch_active
- comment_question_12
- has_fire_alarm_means_provided
- comment_question_13

---

### 26. Hot_Works

Represents safety procedures required when performing activities involving heat.

Attributes:
- hot_works_id (PK)
- building_id  
- is_flammable_substances_secured
- comment_question_1
- is_isolation_agreed_with_management
- comment_question_2
- is_sprinkler_isolation_authorized
- comment_question_3
- is_fire_protection_prepared
- comment_question_4
- is_comm_device_tested_and_issued
- comment_question_5
- is_operative_medical_fitness_verified
- comment_question_6
- is_rescue_procedures_and_training_ready
- comment_question_7

---

### 27. Lone_Working

Represents safety management procedures for employees working alone within building spaces.

Attributes:
- lone_working_id (PK)
- building_id  
- has_lone_working_risk_assessment
- comment_question_1
- is_lone_worker_inducted
- comment_question_2
- is_lone_working_procedures_explained
- comment_question_3
- is_security_comm_log_active
- comment_question_4
- is_comm_device_tested_and_issued
- comment_question_5
- is_medical_fitness_controls_verified
- comment_question_6
- is_emergency_rescue_prepared
- comment_question_7

---

### 28. Confined_Spaces

Represents safety checks and compliance requirements for work performed within confined spaces inside buildings.

Attributes:
- confined_spaces_id (PK)
- building_id  
- is_incoming_services_isolated
- is_gas_monitoring_prepared_and_trained
- is_rpe_prepared_and_trained
- is_additional_fire_protection_prepared_and_trained
- is_powered_equipment_isolated
- is_safety_belt_and_lifeline_prepared_and_trained
- is_supervision_and_emergency_contact_provided
- is_emergency_rescue_trained
- is_lighting_equipment_prepared

---

### 29. Permits_Configurations

Defines configuration settings for managing operational permits required for maintenance activities.

Attributes:
- permits_configuration_id (PK)
- building_id  
- user_id  
- template_source_selection
- permit_type_question_mapping
- default_template_selection_state
- is_comment_mandatory
- is_car_registration_captured
- digital_sign_off_details
- is_document_upload_required
- minimum_permit_notice_period
- maximum_permit_duration
- is_contractor_phone_mandatory
- has_essential_documents_attached
- permit_notification_recipients
- property_management_training_and_approval_levels

---

### 30. Request_Management

Handles operational service requests submitted by users.

Attributes:
- request_management_id (PK)
- user_id  
- questions

---

### 31. Example_Categories

Represents categories used to classify maintenance or service requests.
These categories help organize operational issues such as cleaning, security,
mechanical systems, or emergency responses.

Attributes:
- example_category_id (PK)
- status_type_id  
- access_security
- building_fabric
- cleaning
- customer_service
- emergency
- fire_safety
- furniture_equipment
- general_maintenance
- heating_cooling
- landscaping
- lifts
- lighting
- mechanical_electrical
- miscellaneous
- pest_control
- plumbing_drainage
- waste_recycling

---

### 32. Example_Spaces

Defines spatial classifications associated with service categories within buildings.
Attributes include references to building levels or areas.

Attributes:
- example_space_id (PK)
- status_type_id  
- example_category_id  
- ground
- level_1
- level_2
- level_3
- level_4

---

### 33. Attribute

Represents classification associated with a company.

Attributes:
- attribute_id (PK)
- attribute_type
- company_id  

---

### 34. Media

Stores multimedia content associated with buildings, such as images or promotional videos.

Attributes:
- media_id (PK)
- building_id  
- images
- videos

---

### 35. IsEquiem

Identifies whether a user belongs to the Equiem organization or represents an external tenant.

Attributes:
- isequiem_id (PK)
- equiem_type
- user_id  
---

## 2.4 Relationships

This section describes all relationships derived from foreign key constraints.

---

### Building Relationships

- Building **1:N** Levels  
- Building **1:N** Group  
- Building **1:N** Room  
- Building **1:N** Media  
- Building **1:N** Residential_Details  
- Building **1:N** Working_At_Height  
- Building **1:N** Electrical_Works  
- Building **1:N** Fire_Alarm_Isolation  
- Building **1:N** Hot_Works  
- Building **1:N** Lone_Working  
- Building **1:N** Confined_Spaces  
- Building **1:N** Permits_Configurations  

---

### Company Relationships

- Company **1:N** User  
- Company **1:N** Attribute  
- Company **N:M** Building via **Company_Building**

---

### Company_Building Relationships

- Company_Building **N:1** Company  
- Company_Building **N:1** Building  
- Company_Building **1:1** Configuration  

---

### Industry Relationships

- Industry **1:N** Company  

---

### Group Relationships

- Group **1:1** Payment  
- Group **1:N** Rates  
- Group **1:N** Shared_Facilities  
- Group **1:N** Scheduling_Type  
- Group **1:N** Cancellation_Policy  

---

### Room Relationships

- Room **1:N** Room_Configuration  
- Room **1:N** Room_Features  
- Room **1:N** Room_Extra_Features  
- Room **1:1** Required_Information  

---

### Room Configuration Relationships

- Scheduling_Type **1:N** Room  
- Rates **1:N** Room  
- Cancellation_Policy **1:N** Room  

---

### Status Relationships

- Status_Type **1:N** Sub_Statuses  
- Status_Type **1:N** Example_Categories  
- Example_Categories **1:N** Example_Spaces  

---

### Residential Relationships

- Residential_Details **1:1** Is_There_A_Firewall  

---

### User Relationships

- User **1:N** Request_Management  
- User **1:N** Permits_Configurations  

---

## 2.5 Business Rules and Constraints

The following business rules define how data relationships must behave within the system:

- A Building may contain multiple Levels, Rooms, Groups, and Configuration entries.
- A Room must belong to exactly one Building.
- A Group must belong to one Building.
- A Company may belong to multiple Buildings through the Company_Building relationship.
- Each User must belong to exactly one Company.
- Each Rate must belong to exactly one Group.
- Each Payment configuration must belong to one Group.
- Each Room must reference exactly one Scheduling_Type.
- Each Room must reference exactly one Cancellation Policy.
- A Room may have multiple features and configurations.
- Each Required_Information entry must belong to exactly one Room.
- Compliance entities (Working_At_Height, Electrical_Works, Fire_Alarm_Isolation, Hot_Works, Lone_Working, 
Confined_Spaces, Permits_Configurations) must reference exactly one Building.
- A Residential_Details filled spot must belong to one Building.
- A firewall configuration must belong to one Residential_Details spot.
- Status_Type must exist before Sub_Statuses can be defined.
- Request_Management records must reference valid categories and statuses.
- All foreign keys enforce referential integrity between related entities.
- Deleting a Building should restrict deletion if dependent entities exist.

---

# 3. Logical Data Model

The logical model transforms the conceptual model into a structure suitable for implementation in a relational database:

## 3.1 Logical Schema Diagram

<div align="center">
<sub>FIGURE 2 – Logical Diagram</sub><br>
  <img src="assets/logicaldiagrampreview.png" width="100%" alt="Logical Diagram">
  <sup>Source: Material produced by the authors, 2026.</sup>
 
</div>

<div align="center">
[See Full PDF](assets/logicaldiagram.pdf) 
</div>

For better visualization, please access the following [link.](https://dbdiagram.io/d/6812e36d1ca52373f50e75bf)


---

## 3.2 Table Definitions

## Building

``` 
Table Building {
Building_id int [pk, not null]
building_name varchar(255) [not null]
levels_id int [not null]
occupants int
footfall int
area varchar(255)
company_building_id int [not null]
group_id int [not null]
}
``` 


---

## Levels

``` 
Table Levels {
levels_id int [pk, not null]
building_id int [not null]
level_type varchar(255)
level_number int [not null]
}
``` 

---

## Group

``` 
Table Group {
group_id int [pk, not null]
building_id int [not null]
group_type varchar(255) [not null]
}
``` 

---

## Payment

``` 
Table Payment {
payment_id int [pk, not null]
group_id int [not null]
credit_card boolean [not null]
invoice boolean [not null]
credits boolean [not null]
}
``` 

---

## Rates

``` 
Table Rates {
rates_id int [pk, not null]
group_id int [not null]
hourly_rate float [not null]
half_day_rate float
full_day_rate float
out_of_hours_hourly_rate float
weekend_hourly_rate float
start_business_hours float
end_business_hours float
half_day_duration float
}
``` 

---

## Shared_Facilities

``` 
Table Shared_Facilities {
shared_facilities_id int [pk, not null]
group_id int [not null]
name varchar(255) [not null]
}
``` 

---

## Cancellation_Policy

``` 
Table Cancellation_Policy {
cancellation_policy_id int [pk, not null]
policy varchar(255) [not null]
fee decimal [not null]
group_id int [not null]
}
``` 

---

## Scheduling_Type

``` 
Table Scheduling_Type {
scheduling_type_id int [pk, not null]
type boolean [not null]
group_id int [not null]
}
``` 

---

## Room

``` 
Table Room {
room_id int [pk, not null]
amenity_title varchar(255) [not null]
amenity_type varchar(255)
capacity int [not null]
description varchar(500)
level int
start_date_end_date timestamp
Prep_time_before varchar(255)
Prep_time_after varchar(255)
Minimum_Notice_Before_Booking varchar(255)
Maximum_Time_Before_Booking varchar(255)
Days_available varchar(255)
Available_from timestamp [not null]
Available_to timestamp [not null]
Minimum_booking_length varchar(255)
Maximum_booking_length varchar(255)
Approval_required_for_bookings boolean [not null]
Invite_visitors_to_bookings boolean [not null]
Who_can_book_this_resource varchar(255)
Is_there_a_different_rate varchar(255)
Are_recurring_bookings_allowed boolean [not null]
Is_dependent_on_other_resources varchar(255)
Notice_required_for_cancellation varchar(255)
scheduling_type_id int [not null]
features_id int
extra_features_id int
room_configuration_id int
rates_id int [not null]
required_information_id int
cancellation_policy_id int
building_id int [not null]
}
``` 

---

## Room_Configuration

``` 
Table Room_Configuration {
room_configuration_id int [pk, not null]
room_name varchar(255) [not null]
room_id int [not null]
}
``` 

---

## Room_Features

``` 
Table Room_Features {
features_id int [pk, not null]
room_name varchar(255) [not null]
room_id int [not null]
}
``` 

---

## Room_Extra_Features

``` 
Table Room_Extra_Features {
extra_features_id int [pk, not null]
extra_name varchar(255) [not null]
fee float
room_id int [not null]
}
``` 

---

## Required_Information

``` 
Table Required_Information {
required_information_id int [pk, not null]
membership boolean
number boolean
room_id int [not null]
}
``` 

---

## User

``` 
Table User {
user_id int [pk, not null]
user_name varchar(255) [not null]
user_email varchar(255) [not null]
password varchar(255) [not null]
isequiem_id int [not null]
company_id int
}
``` 

---

## IsEquiem

``` 
Table IsEquiem {
isequiem_id int [pk, not null]
equiem_type boolean [not null]
user_id int [not null]
}
``` 

---

## Company

``` 
Table Company {
company_id int [pk, not null]
company_name varchar(255) [not null]
company_email varchar(255)
industry_id int
attribute_id int [not null]
company_building_id int [not null]
level int [not null]
n_f_employees int [not null]
}
``` 

---

## Attribute

``` 
Table Attribute {
attribute_id int [pk, not null]
attribute_type varchar(255) [not null]
company_id int [not null]
}
``` 

---

## Company_Building

``` 
Table Company_Building {
company_building_id int [pk, not null]
company_id int [not null]
building_id int [not null]
configuration_id int [not null]
}
``` 

---

## Industry

``` 
Table Industry {
industry_id int [pk, not null]
industry_type varchar(255) [not null]
company_id int [not null]
}
``` 

---

## Residential_Details

``` 
Table Residential_Details {
residential_id int [pk, not null]
apartment_name varchar(255) [not null]
building_id int [not null]
level varchar(50) [not null]
is_there_a_firewall_id int [not null]
}
``` 

---

## Is_There_A_Firewall

``` 
Table Is_There_A_Firewall {
is_there_a_firewall_id int [pk, not null]
firewall_presence boolean [not null]
residential_id int [not null]
}
``` 

---

## Configuration

``` 
Table Configuration {
configuration_id int [pk, not null]
company_building_id int [not null]
status_type_id int [not null]
}
``` 

---

## Status_Type

``` 
Table Status_Type {
status_type_id int [pk, not null]
name varchar(255) [not null]
configuration_id int [not null]
}
``` 

---

## Sub_Statuses

``` 
Table Sub_Statuses {
sub_status_id int [pk, not null]
name varchar(255) [not null]
status_type_id int [not null]
}
``` 

---

## Media

``` 
Table Media {
media_id int [pk, not null]
building_id int [not null]
images blob
videos bytea
}
``` 

---

## Working_At_Height

``` 
Table Working_At_Height {
working_at_height_id int [pk, not null]
inspections_up_to_date boolean [not null]
Certified_safety boolean [not null]
has_fall_protection boolean [not null]
rescue_readiness_confirmed boolean [not null]
is_fragile_surface_secured boolean [not null]
has_suitable_communication boolean [not null]
has_trained_personnel boolean [not null]
is_weather_suitable boolean [not null]
is_area_cordoned boolean [not null]
building_id int [not null]
}
``` 

---

## Request_Management

``` 
Table Request_Management {
request_management_id int [pk, not null]
user_id int [not null]
questions varchar (255)
}
``` 

---

## Example_Categories

``` 
Table Example_Categories {
example_category_id int [pk, not null]
status_type_id int [not null]
access_security varchar(100)
building_fabric varchar(100)
cleaning varchar(100)
customer_service varchar(100)
emergency varchar(100)
fire_safety varchar(100)
furniture_equipment varchar(100)
general_maintenance varchar(100)
heating_cooling varchar(100)
landscaping varchar(100)
lifts varchar(100)
lighting varchar(100)
mechanical_electrical varchar(100)
miscellaneous varchar(100)
pest_control varchar(100)
plumbing_drainage varchar(100)
waste_recycling varchar(100)
}
``` 

---

## Example_Spaces

``` 
Table Example_Spaces {
example_space_id int [pk, not null]
status_type_id int [not null]
example_category_id int [not null]
ground varchar(255) [not null]
level_1 varchar(255) [not null]
level_2 varchar(255) [not null]
level_3 varchar(255) [not null]
level_4 varchar(255) [not null]
}
``` 

---

## Electrical_Works

``` 
Table Electrical_Works {
electrical_works_id int [pk, not null]
building_id int [not null]
has_bs921_rubber_matting boolean [not null]
comment_question_1 varchar(255) [not null]
has_bs_en_61111_2009_matting boolean [not null]
comment_question_2 varchar(255) [not null]
is_reg14_live_work_compliant boolean [not null]
comment_question_3 varchar(255) [not null]
is_switching_schedule_attached boolean [not null]
comment_question_4 varchar(255) [not null]
is_dead_proof_verified boolean [not null]
comment_question_5 varchar(255) [not null]
is_earth_connection_verified boolean [not null]
comment_question_6 varchar(255) [not null]
is_warning_notices_provided boolean [not null]
comment_question_7 varchar [not null]
has_padlock_references_stored boolean [not null]
comment_question_8 varchar [not null]
}
``` 

---

## Fire_Alarm_Isolation

``` 
Table Fire_Alarm_Isolation {
fire_alarm_isolation_id int [pk, not null]
building_id int [not null]
has_fire_risk_assessment_conducted boolean [not null]
comment_question_1 varchar(255) [not null]
is_hot_works_permit_completed boolean [not null]
comment_question_2 varchar(255) [not null]
is_smoke_detector_capping_managed boolean [not null]
comment_question_3 varchar(255) [not null]
is_isolation_duration_indicated boolean [not null]
comment_question_4 varchar(255) [not null]
is_manual_call_points_active boolean [not null]
comment_question_5 varchar(255) [not null]
is_isolation_area_type_indicated boolean [not null]
comment_question_6 varchar(255) [not null]
is_emergency_exit_protection_ready boolean [not null]
comment_question_7 varchar(255) [not null]
is_reinstatement_time_indicated boolean [not null]
comment_question_8 varchar(255) [not null]
is_de_isolation_manual_compliant boolean [not null]
comment_question_9 varchar(255) [not null]
is_isolated_device_count_indicated boolean [not null]
comment_question_10 varchar(255) [not null]
is_sprinkler_coverage_sufficient boolean [not null]
comment_question_11 varchar(255) [not null]
is_manual_fire_watch_active boolean [not null]
comment_question_12 varchar(255) [not null]
has_fire_alarm_means_provided boolean [not null]
comment_question_13 varchar(255) [not null]
}
``` 

---

## Hot_Works

``` 
Table Hot_Works {
hot_works_id int [pk, not null]
building_id int [not null]
is_flammable_substances_secured boolean [not null]
comment_question_1 varchar(255) [not null]
is_isolation_agreed_with_management boolean [not null]
comment_question_2 varchar(255) [not null]
is_sprinkler_isolation_authorized boolean [not null]
comment_question_3 varchar(255) [not null]
is_fire_protection_prepared boolean [not null]
comment_question_4 varchar(255) [not null]
is_comm_device_tested_and_issued boolean [not null]
comment_question_5 varchar(255) [not null]
is_operative_medical_fitness_verified boolean [not null]
comment_question_6 varchar(255) [not null]
is_rescue_procedures_and_training_ready boolean [not null]
comment_question_7 varchar(255) [not null]
}
``` 

---

## Lone_Working

``` 
Table Lone_Working {
lone_working_id int [pk, not null]
building_id int [not null]
has_lone_working_risk_assessment boolean [not null]
comment_question_1 varchar(255) [not null]
is_lone_worker_inducted boolean [not null]
comment_question_2 varchar(255) [not null]
is_lone_working_procedures_explained boolean [not null]
comment_question_3 varchar(255) [not null]
is_security_comm_log_active boolean [not null]
comment_question_4 varchar(255) [not null]
is_comm_device_tested_and_issued boolean [not null]
comment_question_5 varchar(255) [not null]
is_medical_fitness_controls_verified boolean [not null]
comment_question_6 varchar(255) [not null]
is_emergency_rescue_prepared boolean [not null]
comment_question_7 varchar(255) [not null]
}
``` 

---

## Permits_Configurations

``` 
Table Permits_Configurations {
permits_configuration_id int [pk, not null]
building_id int [not null]
user_id int [not null]
template_source_selection varchar [not null]
permit_type_question_mapping varchar [not null]
default_template_selection_state varchar [not null]
is_comment_mandatory boolean [not null]
is_car_registration_captured boolean [not null]
digital_sign_off_details varchar(200) [not null]
is_document_upload_required boolean [not null]
minimum_permit_notice_period varchar [not null]
maximum_permit_duration varchar [not null]
is_contractor_phone_mandatory boolean [not null]
has_essential_documents_attached text [not null]
permit_notification_recipients varchar [not null]
property_management_training_and_approval_levels varchar [not null]
}
``` 

---

## Confined_Spaces

``` 
Table Confined_Spaces {
confined_spaces_id int [pk, not null]
building_id int [not null]
is_incoming_services_isolated boolean [not null]
is_gas_monitoring_prepared_and_trained boolean [not null]
is_rpe_prepared_and_trained boolean [not null]
is_additional_fire_protection_prepared_and_trained boolean [not null]
is_powered_equipment_isolated boolean [not null]
is_safety_belt_and_lifeline_prepared_and_trained boolean [not null]
is_supervision_and_emergency_contact_provided boolean [not null]
is_emergency_rescue_trained boolean [not null]
is_lighting_equipment_prepared boolean [not null]
}
``` 

---

## 3.3 Normalization (Up to 3NF)

### First Normal Form (1NF)

All relations satisfy 1NF because:

- Every attribute contains atomic values.
- There are no repeating groups.
- All tables have defined primary keys.

- Room features are separated into **Room_Features**.
- Extra room features are separated into **Room_Extra_Features**.
- Compliance checklists are separated into individual permit tables.

---

### Second Normal Form (2NF)

All non-key attributes only functionally depend on their primary key:

- **Rates** attributes depend only on `rates_id`.
- **Electrical_Works** checklist fields depend only on `electrical_works_id`.
- **Example_Spaces** attributes depend on `example_space_id`.

---

### Third Normal Form (3NF)

All non-key attributes depend **only on the primary key** and not on other non-key attributes:

- **Industry** was separated from Company to avoid repeated industry data.
- **Attribute** was separated from Company to store extensible company metadata.
- **Company_Building** resolves the many-to-many relationship between companies and buildings.
- **Status_Type** and **Sub_Statuses** avoid hierarchical redundancy.
- **Room_Configuration**, **Room_Features**, and **Room_Extra_Features** remove repeating attributes from Room.
- Compliance systems such as **Working_At_Height**, **Hot_Works**, and **Fire_Alarm_Isolation** are separated to prevent large multi-purpose tables with nullable fields.

This design eliminates redundancy and ensures update, insert, and delete anomalies are avoided.


---

## 3.4 Referential Integrity

Referential integrity is enforced through foreign key constraints.

### Building Domain

- Levels.building_id -> Building.Building_id  
- Room.building_id -> Building.Building_id  
- Media.building_id -> Building.Building_id  
- Residential_Details.building_id -> Building.Building_id  
- Electrical_Works.building_id -> Building.Building_id  
- Fire_Alarm_Isolation.building_id -> Building.Building_id  
- Hot_Works.building_id -> Building.Building_id  
- Lone_Working.building_id -> Building.Building_id  
- Confined_Spaces.building_id -> Building.Building_id  
- Working_At_Height.building_id -> Building.Building_id  

---

### Group Domain

- Payment.group_id -> Group.group_id  
- Rates.group_id -> Group.group_id  
- Shared_Facilities.group_id -> Group.group_id  
- Cancellation_Policy.group_id -> Group.group_id  
- Scheduling_Type.group_id -> Group.group_id  

---

### Room Domain

- Room.scheduling_type_id -> Scheduling_Type.scheduling_type_id  
- Room.features_id -> Room_Features.features_id  
- Room.extra_features_id -> Room_Extra_Features.extra_features_id  
- Room.room_configuration_id -> Room_Configuration.room_configuration_id  
- Room.rates_id -> Rates.rates_id  
- Room.required_information_id -> Required_Information.required_information_id  
- Room.cancellation_policy_id -> Cancellation_Policy.cancellation_policy_id  

---

### Room Subcomponents

- Room_Configuration.room_id -> Room.room_id  
- Room_Features.room_id -> Room.room_id  
- Room_Extra_Features.room_id -> Room.room_id  
- Required_Information.room_id -> Room.room_id  

---

### Company Domain

- User.company_id -> Company.company_id  
- Attribute.company_id -> Company.company_id  
- Company.industry_id -> Industry.industry_id  

---

### Company–Building Bridge

- Company_Building.company_id -> Company.company_id  
- Company_Building.building_id -> Building.Building_id  

---

### Status Domain

- Configuration.status_type_id -> Status_Type.status_type_id  
- Sub_Statuses.status_type_id -> Status_Type.status_type_id  
- Example_Categories.status_type_id -> Status_Type.status_type_id  
- Example_Spaces.status_type_id -> Status_Type.status_type_id  
- Example_Spaces.example_category_id -> Example_Categories.example_category_id  

---

### Residential Domain

- Is_There_A_Firewall.residential_id -> Residential_Details.residential_id  

---

### User Operations

- Request_Management.user_id -> User.user_id  
- Permits_Configurations.user_id -> User.user_id  

---

### Integrity Enforcement

To preserve integrity:

- Parent records must exist before child records.
- Deletion of parent records should use **RESTRICT or CASCADE** policies depending on business rules.
- Updates of primary keys propagate via **ON UPDATE CASCADE**.

These constraints guarantee structural consistency across the full Equiem data model.

---

## 3.5 Transformation from Conceptual to Logical Model

All conceptual entities -> tables  
All attributes -> columns
All 1:N -> foreign keys  
All N:M -> junction tables  
All business rules -> constraints 

---

## 3.6 Schema Evolution Update (V2 - Current Physical Database)

This subsection preserves the legacy logical model above and adds a versioned update aligned with the current physical schema implemented in:

- `src/data/database/01_create_database.sql`
- `src/data/database/data-dictionary.md`

### 3.6.1 Evolution Context

The original logical model (35 entities) represented a broad domain scope for building operations and compliance.

The current production-oriented schema (V2) was intentionally reduced to support the MVP ingestion pipeline with stronger operational focus on:

- Upload lifecycle control
- Row-level staging and validation feedback
- Processing jobs and observability
- Onboarding instance collaboration and review state

This means the project now uses a bounded persistence model optimized for the delivered onboarding flow.

### 3.6.2 Current Logical Model (V2) - Active Tables

The current logical model contains 7 active tables in schema `equiem`:

1. `user`
2. `onboarding_batch`
3. `onboarding_payload`
4. `onboarding_mapping`
5. `processing_job`
6. `processing_log`
7. `onboarding_instance`

### 3.6.3 V2 Logical Definitions (Aligned with Physical Schema)

#### user

```
Table user {
   id UUID [pk]
   first_name VARCHAR(100) [not null]
   last_name VARCHAR(100) [not null]
   email VARCHAR(255) [unique, not null]
   email_verified BOOLEAN [not null]
   mobile_number VARCHAR(30)
   status user_status_enum [not null]
   user_type user_type_enum [not null]
   auth0_id TEXT
   member_since TIMESTAMPTZ
}
```

#### onboarding_batch

```
Table onboarding_batch {
   id UUID [pk, default: gen_random_uuid()]
   source VARCHAR(50) [not null]
   status VARCHAR(50) [not null]
   trace_id VARCHAR(120) [not null]
   file_name VARCHAR(255) [not null]
   s3_key TEXT [not null]
   error_message TEXT
   processed_at TIMESTAMPTZ
   created_at TIMESTAMPTZ [default: now()]
}
```

#### onboarding_payload

```
Table onboarding_payload {
   id UUID [pk, default: gen_random_uuid()]
   batch_id UUID [not null, ref: > onboarding_batch.id]
   row_number INT [not null]
   entity_type VARCHAR(50) [not null]
   raw_data JSONB [not null]
   is_valid BOOLEAN [default: true]
   validation_errors JSONB [default: '[]']

   indexes {
      (batch_id, row_number) [unique]
   }
}
```

#### onboarding_mapping

```
Table onboarding_mapping {
   id UUID [pk, default: gen_random_uuid()]
   entity_type VARCHAR(50)
   external_id VARCHAR(100)
   internal_id UUID
   created_at TIMESTAMPTZ [default: now()]
}
```

#### processing_job

```
Table processing_job {
   id UUID [pk, default: gen_random_uuid()]
   batch_id UUID [ref: > onboarding_batch.id]
   type VARCHAR(50)
   status VARCHAR(50)
   external_reference VARCHAR(255)
   error_message TEXT
   started_at TIMESTAMPTZ
   finished_at TIMESTAMPTZ
}
```

#### processing_log

```
Table processing_log {
   id UUID [pk, default: gen_random_uuid()]
   job_id UUID [ref: > processing_job.id]
   level VARCHAR(20) [default: 'info']
   message TEXT
   created_at TIMESTAMPTZ [default: now()]
}
```

#### onboarding_instance

```
Table onboarding_instance {
   id UUID [pk, default: gen_random_uuid()]
   batch_id UUID [ref: > onboarding_batch.id]
   company_name VARCHAR(255) [not null]
   selected_sections TEXT[] [not null, default: '{}']
   allowed_emails TEXT[] [not null, default: '{}']
   status VARCHAR(50) [not null, default: 'draft']
   progress_percent INT [not null, default: 0]
   link_token VARCHAR(120) [unique, not null]
   form_data JSONB [not null, default: '{}']
   email_status VARCHAR(50) [not null, default: 'pending_manual_send']
   email_payload JSONB
   submitted_at TIMESTAMPTZ
   reviewed_at TIMESTAMPTZ
   completed_at TIMESTAMPTZ
   section_review JSONB [not null, default: '{}']
   returned_sections TEXT[] [not null, default: '{}']
   rejection_reason TEXT
   created_at TIMESTAMPTZ [default: now()]
   updated_at TIMESTAMPTZ [default: now()]
}
```

### 3.6.4 V2 Referential Integrity (Current)

Current foreign key graph:

- `onboarding_payload.batch_id -> onboarding_batch.id` (ON DELETE CASCADE)
- `processing_job.batch_id -> onboarding_batch.id` (ON DELETE CASCADE)
- `processing_log.job_id -> processing_job.id` (ON DELETE CASCADE)
- `onboarding_instance.batch_id -> onboarding_batch.id` (ON DELETE SET NULL)

### 3.6.5 Legacy-to-V2 Mapping Summary

The table below clarifies how the legacy broad model evolved into the current MVP-focused schema.

| Legacy Model Scope | V2 Current Status |
|---|---|
| Building/Room/Group/Permits operational entities | Not persisted in the current MVP physical schema |
| Company_Building/Configuration/Status_Type hierarchy | Replaced by onboarding workflow state in `onboarding_instance` |
| User + IsEquiem split | Simplified to a single `user` table with typed status/profile |
| Full operational request management domain | Out of current persistence scope |
| New onboarding ingestion lifecycle | Implemented via `onboarding_batch`, `onboarding_payload`, `onboarding_mapping`, `processing_job`, `processing_log`, `onboarding_instance` |

### 3.6.6 Documentation Policy for Future Changes

To preserve traceability while avoiding historical loss:

- Keep Sections 2 and 3.1-3.5 as legacy reference baseline.
- Treat Section 3.6 as the authoritative logical model for current implementation.
- Update Section 3.6 whenever `01_create_database.sql` changes.
- Keep `data-dictionary.md` synchronized with all schema updates.

### 3.6.7 Persistence Strategy (Current Implementation)

The current ingestion flow intentionally uses a hybrid persistence strategy across object storage and relational staging.

1. Original file persistence (binary source)
- The uploaded CSV/XLS/XLSX file is stored in Amazon S3.
- The S3 object key is persisted in `onboarding_batch.s3_key`.
- This object is the immutable source for re-download and reproducibility of parsing operations.

2. Structured staging persistence (queryable source)
- During worker processing, rows are parsed and normalized.
- Each parsed row is persisted in `onboarding_payload.raw_data` (JSONB), along with `is_valid` and `validation_errors`.
- This layer is the queryable source for validation status, row-level inspection, and future deterministic reprocessing.

3. Review snapshot persistence (optimized read model)
- After row mapping, the worker writes a review snapshot JSON to S3 at `<original_s3_key>.parsed.json`.
- The review endpoint currently reads this S3 snapshot for UI consumption.

### 3.6.8 Source-of-Truth Rules and Operational Rationale

To avoid ambiguity, the system adopts explicit source roles:

- Canonical raw upload: original object in S3 (`onboarding_batch.s3_key`).
- Canonical normalized staging: `onboarding_payload.raw_data` in PostgreSQL.
- Review transport artifact: S3 snapshot (`.parsed.json`) for efficient frontend read.

Rationale:

- S3 is optimized for large binary/object retention.
- PostgreSQL is optimized for indexed row-level validation and lifecycle tracking.
- The snapshot reduces transformation overhead on read paths for review screens.

Current limitation (important for traceability):

- The review endpoint currently prioritizes S3 snapshot reads and returns an empty list if snapshot is missing/unavailable.
- There is no active DB fallback in this path yet, even though normalized rows exist in `onboarding_payload`.

### 3.6.9 Consistency and Versioning Notes

- Each upload cycle creates a new `onboarding_batch` record linked to one S3 source key.
- Parsed rows are linked by `onboarding_payload.batch_id`.
- Onboarding instance linkage is done by `onboarding_instance.batch_id` after worker association by link token.
- Processing and failure visibility are captured through `processing_job` and `processing_log`.

This model enables auditable lineage: `link_token -> batch_id -> s3_key + payload rows + processing logs`.

---

# 4. Conclusion

This database design:

- Identifies all required onboarding entities.
- Defines structured attributes and primary keys.
- Establishes correct cardinalities and relationships.
- Documents business rules clearly.
- Achieves Third Normal Form (3NF).
- Ensures strong referential integrity.
- Maintains traceability between conceptual and logical models.

