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

### Rationale for Domain Separation

The domain model was intentionally decomposed into five distinct UML diagrams: Core Organizational, Booking and Amenities, Request Management, Residential, and Permits and Compliance.

This separation was adopted to reduce structural complexity and ensure conceptual clarity. Each domain encapsulates a cohesive subset of business rules and responsibilities aligned with specific operational processes within the system. By isolating functional areas into dedicated diagrams, the model avoids excessive visual density.

## Necessity of the Domain Integration Diagram

Although the domains were modeled independently for clarity, the system operates as a unified environment. For this reason, a high-level Domain Integration Diagram was introduced.

The integration diagram provides a systemic view of how the domains relate to one another without reintroducing diagrammatic complexity. It establishes cross-domain structural dependencies and ensures that the model reflects the interconnected nature of real-world operations. This step guarantees that modularization does not imply isolation, but rather structured abstraction.

## Central Entity of the System

The Building entity was identified as the primary operational anchor of the model.

Most domain entities — including rooms, groups, service requests, residential units, and permit configurations — are structurally dependent on a building context. This reflects the real-world structure in which operations, services, compliance processes, and tenant activities are organized around physical sites.

## Improvement in Abstraction and Conceptual Clarity

The combination of domain-level diagrams and an integration diagram enhances abstraction by separating detailed structural modeling from high-level systemic representation.

This layered modeling strategy improves readability, maintains UML consistency, and avoids implementation bias. It allows stakeholders to analyze specific operational domains independently while preserving an accurate representation of the system as a whole.

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

This section defines the relationships between the conceptual classes using UML relationship types (Association, Aggregation, and Composition), along with their respective multiplicity constraints and concise real-world interpretations. Each relationship specifies how entities interact within the domain, clarifying structural dependencies, participation requirements, and business rules that govern organizational structure, operational workflows, booking logic, compliance control, and building-level configurations. 

# Section 4 — Relationships and Multiplicity

This section consolidates all relationships defined in the Domain UML Class Diagram.  
Each relationship specifies its type, multiplicity (bidirectional), and a concise explanation aligned with the operational domain.

---
## Building – Group

Type: Composition

Multiplicity:
Building → Group: (1..*)
Group → Building: (1..1)

Description:
A building is composed of one or more groups used to organize pricing structures, facilities, and booking logic. Groups depend on the building for existence.

---

## Building – Lone_Working

Type: Association

Multiplicity:
Building → Lone_Working: (1..1)
Lone_Working → Building: (1..1)

Description:
Each building maintains a single lone working compliance configuration record, and that record exists exclusively within the context of one building.

---

## Building – Permits_Configurations

Type: Association

Multiplicity:
Building → Permits_Configurations: (1..1)
Permits_Configurations → Building: (1..1)

Description:
Permit configuration rules are defined at the building level and are uniquely associated with that building.

---

## Building – Hot_Works

Type: Association

Multiplicity:
Building → Hot_Works: (1..1)
Hot_Works → Building: (1..1)

Description:
Each building maintains one hot works compliance configuration governing high-risk heat-based activities.

---

## Building – Confined_Spaces

Type: Association

Multiplicity:
Building → Confined_Spaces: (1..1)
Confined_Spaces → Building: (1..1)

Description:
Each building has a single confined spaces compliance configuration linked exclusively to it.

---

## Building – Working_At_Height

Type: Association

Multiplicity:
Building → Working_At_Height: (1..1)
Working_At_Height → Building: (1..1)

Description:
Working-at-height compliance rules are defined per building and are uniquely associated with that building.

---

## Building – Fire_Alarm_Isolation

Type: Association

Multiplicity:
Building → Fire_Alarm_Isolation: (1..*)
Fire_Alarm_Isolation → Building: (1..1)

Description:
A building may register multiple fire alarm isolation records, each tied to a single building context.

---

## Building – Electrical_Works

Type: Association

Multiplicity:
Building → Electrical_Works: (1..1)
Electrical_Works → Building: (1..1)

Description:
Each building maintains one electrical works compliance configuration.

---

## Building – Media

Type: Association

Multiplicity:
Building → Media: (0..*)
Media → Building: (1..1)

Description:
A building may be associated with multiple multimedia assets, each asset belonging to one building.

---

## Building – Residential_Details

Type: Composition

Multiplicity:
Building → Residential_Details: (0..*)
Residential_Details → Building: (1..1)

Description:
Residential units are structurally contained within a building and cannot exist independently of it.

---

## Residential_Details – Is_There_A_Firewall

Type: Association

Multiplicity:
Residential_Details → Is_There_A_Firewall: (1..1)
Is_There_A_Firewall → Residential_Details: (1..1)

Description:
Each residential unit has one associated firewall/security indicator record.

---

## Building – Company_Building

Type: Association

Multiplicity:
Building → Company_Building: (1..*)
Company_Building → Building: (1..1)

Description:
A building may be linked to multiple company-building association records.

---

## Company – Company_Building

Type: Association

Multiplicity:
Company → Company_Building: (1..*)
Company_Building → Company: (1..1)

Description:
A company may operate in multiple buildings through company-building association records.

---

## Company – Industry

Type: Association

Multiplicity:
Company → Industry: (1..1)
Industry → Company: (0..*)

Description:
Each company belongs to one industry classification, while an industry may classify multiple companies.

---

## Company – Attribute

Type: Composition

Multiplicity:
Company → Attribute: (0..*)
Attribute → Company: (1..1)

Description:
A company is composed of multiple descriptive attributes that cannot exist independently of it.

---

## User – IsEquiem

Type: Composition

Multiplicity:
User → IsEquiem: (1..1)
IsEquiem → User: (1..1)

Description:
Each user has exactly one internal identification status indicating whether they belong to the Equiem team.

---

## User – Company

Type: Composition

Multiplicity:
User → Company: (1..1)
Company → User: (0..*)

Description:
Each user belongs to one company, while a company may have multiple users associated with it.

---

## Request_Management – User

Type: Association

Multiplicity:
Request_Management → User: (1..*)
User → Request_Management: (0..*)

Description:
Service requests may involve one or more users, and a user may be associated with multiple requests.

---

## Room – Room_Configuration

Type: Composition

Multiplicity:
Room → Room_Configuration: (1..1)
Room_Configuration → Room: (1..1)

Description:
Each room has exactly one primary configuration definition.

---

## Room – Room_Features

Type: Composition

Multiplicity:
Room → Room_Features: (0..*)
Room_Features → Room: (1..1)

Description:
A room may include multiple standard features that are structurally part of the room.

---

## Room – Status_Type

Type: Association

Multiplicity:
Room → Status_Type: (1..1)
Status_Type → Room: (0..*)

Description:
Each room is associated with one operational status classification, while a status type may apply to multiple rooms.

---

## Room – Room_Extra_Features

Type: Association

Multiplicity:
Room → Room_Extra_Features: (0..*)
Room_Extra_Features → Room: (1..1)

Description:
A room may offer multiple optional add-on features, each linked to a specific room.

---

## Group – Room

Type: Composition

Multiplicity:
Group → Room: (0..*)
Room → Group: (1..1)

Description:
A group contains multiple rooms within the same pricing and booking structure.

---

## Group – Payment

Type: Association

Multiplicity:
Group → Payment: (1..1)
Payment → Group: (0..*)

Description:
Each group defines one payment configuration, while a payment method may be reused across multiple groups.

---

## Group – Shared_Facilities

Type: Association

Multiplicity:
Group → Shared_Facilities: (0..*)
Shared_Facilities → Group: (1..1)

Description:
A group may provide access to multiple shared facilities.

---

## Group – Scheduling_Type

Type: Association

Multiplicity:
Group → Scheduling_Type: (1..1)
Scheduling_Type → Group: (0..*)

Description:
Each group operates under one scheduling logic, which may be reused across different groups.

---

## Group – Levels

Type: Composition

Multiplicity:
Group → Levels: (1..1)
Levels → Group: (0..*)

Description:
Each group is associated with one building level, while a level may contain multiple groups.

---

## Group – Rates Value

Type: Association

Multiplicity:
Group → Rates Value: (1..1)
Rates Value → Group: (0..*)

Description:
Each group has one pricing structure, which may be applied across multiple groups if required.

---

## Group – Required_Information

Type: Association

Multiplicity:
Group → Required_Information: (1..1)
Required_Information → Group: (0..*)

Description:
Each group defines one set of mandatory booking information requirements.

---

## Group – Room_BookingPolicy

Type: Composition

Multiplicity:
Group → Room_BookingPolicy: (1..1)
Room_BookingPolicy → Group: (1..1)

Description:
Each group includes one booking policy configuration that is structurally dependent on it.

---

## Group – Cancellation_Policy

Type: Composition

Multiplicity:
Group → Cancellation_Policy: (1..1)
Cancellation_Policy → Group: (1..1)

Description:
Each group defines one cancellation policy that depends on the group for existence.

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

