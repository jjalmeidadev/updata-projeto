# Domain UML Class Diagram

## Table of Contents
1. [Overview](#1-overview)  
2. [Domain Class Diagram](#2-domain-class-diagram)  
3. [Domain Classes](#3-domain-classes)  
4. [Relationships and Multiplicities](#4-relationships-and-multiplicities)  
5. [Modeling Decisions](#5-modeling-decisions)  
6. [Conclusion](#6-conclusion)

---

# 1. Overview

This document presents the **Domain UML Class Diagram** for the project.

The objective of this artifact is to model the **conceptual classes** that exist in the problem domain, representing real-world entities and their relationships, rather than software implementation details.

This diagram:

- Identifies the main domain classes
- Defines their relevant attributes
- Establishes relationships with correct multiplicities
- Applies association, aggregation, and composition where appropriate

The model is purely conceptual and independent of programming language or database implementation.

---

# 2. Domain Class Diagram


<div align="center">
<sub>FIGURE X – [Insert Diagram Name Here]</sub><br>
  <img src="../assets/[filename].png" width="100%" alt="[Same as diagram name]">
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

The diagram must include:

- Domain classes
- Attributes (no data types required if purely conceptual)
- Multiplicities (e.g., 1, 0..1, 1..*, 0..*)
- Association types (association, aggregation, composition)
- Clear and consistent UML notation

---

# 3. Domain Classes

This section defines the conceptual classes identified in the problem domain, extracted from the spreadsheets provided by the company as part of the onboarding process for new clients. These entities represent the core business data that must be structured and persisted to support property management, booking operations, request workflows, residential configurations, media management, and permit control. For each class, only essential attributes and the primary key are specified, establishing a clear and consistent foundation for the subsequent logical data model.

## Core Organizational Domain

This section defines the core structural entities that represent organizations, users, buildings, and their primary relationships within the system.

| Class Name | Description | Attributes |
|------------|------------|------------|
| Company | Represents an organization (contractor) operating within one or more buildings managed by the platform. | company_id (PK), name, registration_number, industry_id |
| Industry | Defines the industry classification associated with a company. | industry_id (PK), name |
| Attribute | Represents descriptive characteristics associated with a company. | attribute_id (PK), company_id, name, value |
| User | Represents a platform user, such as a tenant, administrator, or property manager. | user_id (PK), name, email, company_id |
| IsEquiem | Identifies whether a user belongs to the internal Equiem team. | is_equiem_id (PK), user_id, is_internal |
| Building | Represents the primary operational entity where tenants operate and services are configured. | building_id (PK), name, address, status |
| Company_Building | Represents the association between companies and buildings, allowing one company to operate in multiple buildings. | company_building_id (PK), company_id, building_id |
| Levels | Represents the floors within a building. | level_id (PK), building_id, level_number |
| Group | Logical entity within a building used to organize pricing structures, payment options, and facilities. | group_id (PK), building_id, name |
| Media | Represents multimedia assets linked to buildings or other related entities. | media_id (PK), building_id, file_url, media_type |

## Booking and Amenities Domain

This section models bookable spaces, scheduling logic, pricing structures, and associated facilities.

| Class Name | Description | Attributes |
|------------|------------|------------|
| Scheduling_type | Defines the scheduling logic applied to bookings (e.g., flexible or slot-based). | scheduling_type_id (PK), name, description |
| Rates value | Represents pricing rules applied to bookable resources. | rate_id (PK), group_id, scheduling_type_id, price |
| Payment | Defines the payment options available for bookings. | payment_id (PK), group_id, payment_type |
| Cancellation policy | Defines cancellation rules and any associated penalties or fees. | cancellation_policy_id (PK), group_id, cancellation_window, penalty |
| Shared Facilities | Represents shared amenities available within buildings. | facility_id (PK), building_id, name |
| Room | Represents spaces available for booking within a building. | room_id (PK), building_id, level_id, group_id, name, capacity |
| Room configuration | Defines layout variations available for a room (e.g., theatre, U-shaped). | room_configuration_id (PK), room_id, configuration_type |
| Room features | Represents standard features included in a room. | room_feature_id (PK), room_id, feature_name |
| Room extra features | Represents optional add-on features that may incur additional cost. | room_extra_feature_id (PK), room_id, feature_name |
| Required_information | Defines mandatory information required during the room booking process. | required_information_id (PK), group_id, field_name, is_required |

## 3 — Request Management Domain

This section defines entities responsible for service request handling and workflow management.

| Class Name | Description | Attributes |
|------------|------------|------------|
| Request_Management | Represents help desk or service request configuration and tracking. | request_id (PK), building_id, user_id, status_type_id, created_at |
| Status_Type | Defines operational or workflow status classifications. | status_type_id (PK), name |
| Configuration | Represents configuration settings linking companies and buildings within operational workflows. | configuration_id (PK), company_id, building_id, setting_name |

## 4 — Residential Domain

This section captures residential unit details and associated security configurations.

| Class Name | Description | Attributes |
|------------|------------|------------|
| Residential Details | Represents residential unit details associated with a building. | residential_id (PK), building_id, residential_type |
| Is_There_A_Firewall | Indicates the presence of firewall or security infrastructure within a residential context. | firewall_id (PK), residential_id, is_present |

## 5 — Permits and Compliance Domain

This section models safety compliance and permit-related records required for regulated operational activities.

| Class Name | Description | Attributes |
|------------|------------|------------|
| Permits_Configurations | Defines configuration settings established by Equiem’s team for contractor onboarding workflows. | permit_config_id (PK), building_id, permit_type, approval_required |
| Working at Height | Represents safety compliance records for height-related work activities. | working_height_id (PK), building_id, safety_plan_required |
| Eletrical Works | Represents compliance and permit records for electrical activities. | electrical_work_id (PK), building_id, voltage_level |
| Fire Alarm Isolation | Represents compliance records for fire alarm isolation procedures. | fire_alarm_id (PK), building_id, isolation_duration |
| Hot Works | Represents permit records for high-risk heat-based operational activities. | hot_work_id (PK), building_id, fire_watch_required |
| Lone Working | Represents compliance records for individuals performing work alone. | lone_work_id (PK), building_id, supervision_required |
| Confined_Spaces | Represents compliance records for operations conducted within confined spaces. | confined_space_id (PK), building_id, ventilation_required |

---

# 4. Relationships and Multiplicities

Describe the relationships between domain classes.

---

### Relationship 1: `<Class_A>` — `<Class_B>`

**Type:**  
- Association  
- Aggregation  
- Composition  

**Multiplicity:**

- `<Class_A>` → `<Class_B>`: (1 to 0)  
- `<Class_B>` → `<Class_A>`: (1 to 1)

**Description:**  
Explain what this relationship represents in the real world.

---

### Relationship 2: `<Class_X>` — `<Class_Y>`

**Type:**  
**Multiplicity:**  
**Description:**

---

# 5. Modeling Decisions

Provide a brief explanation of the key modeling decisions made when constructing the diagram.

Discuss:

- Why certain domain classes were included
- Why some concepts were excluded (if applicable)
- Why specific relationships were modeled as association, aggregation, or composition
- Justification for multiplicities
- The level of abstraction chosen
- Any assumptions made about the problem domain

This section should clearly demonstrate:

- Appropriate conceptual abstraction
- Correct use of UML notation
- Alignment with the real-world domain being modeled

---

# 6. Conclusion

The Domain UML Class Diagram:

- Models real-world entities relevant to the problem domain
- Uses proper UML notation
- Correctly represents relationships and multiplicities
- Maintains conceptual abstraction (no implementation details)
- Aligns with project requirements
