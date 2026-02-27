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

This section defines the relationships between the conceptual classes using UML relationship types (Association, Aggregation, and Composition), along with their respective multiplicity constraints and concise real-world interpretations. Each relationship specifies how entities interact within the domain, clarifying structural dependencies, participation requirements, and business rules that govern organizational structure, operational workflows, booking logic, compliance control, and building-level configurations. These relationships establish the structural integrity of the conceptual model and ensure consistency with the subsequent logical data model.

### Company — Industry

Type: Association

Multiplicity:
Company → Industry: (1..1)
Industry → Company: (0..*)

Description:
Each company must be classified under exactly one industry, while an industry may classify multiple companies.

---

### Company — User

Type: Composition

Multiplicity:
Company → User: (0..*)
User → Company: (1..1)

Description:
A user cannot exist in the system without being associated with a company. A company may have one or more users.

---

### Company — Building (via Company_Building)

Type: Association

Multiplicity:
Company → Building: (0..*)
Building → Company: (0..*)

Description:
A company may operate in multiple buildings, and a building may host multiple companies.

---

### Building — Levels

Type: Composition

Multiplicity:
Building → Levels: (0..*)
Levels → Building: (1..1)

Description:
Levels represent floors within a building and cannot exist independently of it.

---

### Building — Group

Type: Aggregation

Multiplicity:
Building → Group: (0..*)
Group → Building: (1..1)

Description:
Groups are defined within a building to organize pricing, booking logic, and payment configurations.

---

### Building — Room

Type: Composition

Multiplicity:
Building → Room: (0..*)
Room → Building: (1..1)

Description:
A room is structurally dependent on a building and cannot exist outside a building context.

---

### Room — Levels

Type: Association

Multiplicity:
Room → Levels: (1..1)
Levels → Room: (0..*)

Description:
Each room must be located on exactly one level, while a level may contain multiple rooms.

---

### Room — Group

Type: Association

Multiplicity:
Room → Group: (0..1)
Group → Room: (0..*)

Description:
A room may optionally belong to a group to inherit pricing and booking rules.

---

### Group — Rates value

Type: Composition

Multiplicity:
Group → Rates value: (0..*)
Rates value → Group: (1..1)

Description:
Pricing rules are defined within the context of a group and cannot exist independently.

---

### Group — Payment

Type: Composition

Multiplicity:
Group → Payment: (0..*)
Payment → Group: (1..1)

Description:
Payment options are configured at the group level and depend on its existence.

---

### Group — Cancellation policy

Type: Composition

Multiplicity:
Group → Cancellation policy: (0..*)
Cancellation policy → Group: (1..1)

Description:
Cancellation rules are defined per group and cannot exist without it.

---

### Building — Shared Facilities

Type: Composition

Multiplicity:
Building → Shared Facilities: (0..*)
Shared Facilities → Building: (1..1)

Description:
Shared facilities belong to a specific building and are not independent entities.

---

### Building — Request_Management

Type: Composition

Multiplicity:
Building → Request_Management: (0..*)
Request_Management → Building: (1..1)

Description:
Every service request must be associated with a building and cannot exist independently.

---

### User — Request_Management

Type: Association

Multiplicity:
User → Request_Management: (0..*)
Request_Management → User: (1..1)

Description:
Each request must be created by one user, while a user may create multiple requests.

---

### Status_Type — Request_Management

Type: Association

Multiplicity:
Status_Type → Request_Management: (0..*)
Request_Management → Status_Type: (1..1)

Description:
Each request must have exactly one operational status classification.

---

### Building — Residential Details

Type: Composition

Multiplicity:
Building → Residential Details: (0..*)
Residential Details → Building: (1..1)

Description:
Residential details are defined within a building context and cannot exist independently.

---

### Residential Details — Is_There_A_Firewall

Type: Composition

Multiplicity:
Residential Details → Is_There_A_Firewall: (0..1)
Is_There_A_Firewall → Residential Details: (1..1)

Description:
Firewall configuration may exist only if residential details are defined.

---

### Building — Permits_Configurations

Type: Composition

Multiplicity:
Building → Permits_Configurations: (0..*)
Permits_Configurations → Building: (1..1)

Description:
Permit configuration rules are defined at the building level and depend on it.

---

### Building — Compliance Entities
(Working At Height, Electrical Works, Fire Alarm Isolation, Hot Works, Lone Working, Confined Spaces)

Type: Composition

Multiplicity:
Building → Compliance Entity: (0..*)
Compliance Entity → Building: (1..1)

Description:
Compliance and permit records must always be associated with a specific building and cannot exist independently.

---

# 5. Modeling Decisions

The conceptual model was constructed based on the spreadsheets provided by the company as part of the contractor onboarding process. We decided to include all entities to avoid omitting relevant business data and to ensure complete traceability between the existing onboarding workflow and the proposed structured data model. 

Relationships were classified according to structural dependency and lifecycle constraints. Composition was used when an entity cannot exist independently of its parent (e.g., Room within Building, User within Company, Compliance records within Building). Aggregation was applied when entities are logically grouped but maintain independent meaning (e.g., Group within Building). Association was used for relationships representing logical connections without strong ownership dependency (e.g., Company and Industry).

Multiplicity decisions were derived from real-world operational rules. Mandatory participation was defined when business logic requires the existence of a related entity (e.g., every User must belong to one Company; every Room must belong to one Building). Optional participation was applied when entities may exist independently under certain circumstances (e.g., a Building may exist before rooms are configured).

The level of abstraction chosen reflects a business-oriented conceptual model rather than a technical implementation model. The diagram captures domain entities and their structural relationships without including database-level details such as foreign keys or data types. This ensures proper separation between the conceptual and logical layers.

Several assumptions were made to support modeling clarity. It was assumed that users cannot exist without a company context, compliance records must always be linked to a building, and operational requests are always associated with both a building and a user. These assumptions are consistent with the onboarding documentation and the operational workflow described in the project requirements.

---

# 6. Conclusion

The Domain UML Class Diagram represents the main entities identified in the contractor onboarding and property management domain. It applies standard UML notation to describe associations, aggregations, compositions, and multiplicity constraints in a structured and consistent manner.

The model maintains a conceptual level of abstraction by focusing on domain entities and their relationships. The structure reflects the data extracted from the onboarding spreadsheets and aims to align with the operational context described in the project requirements.

