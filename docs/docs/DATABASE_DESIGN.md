# Database Design

## Table of Contents
1. [Overview](#1-overview)  
2. [Conceptual Data Model](#2-conceptual-data-model)  
   2.1 [Entity-Relationship Diagram (ERD)](#21-entity-relationship-diagram-erd)  
   2.2 [Entity Identification](#22-entity-identification)  
   2.3 [Attribute Definition](#23-attribute-definition)  
   2.4 [Relationships](#24-relationships)  
   2.5 [Business Rules and Constraints](#25-business-rules-and-constraints)  
   2.6 [Complete Textual Description](#26-complete-textual-description)  
3. [Logical Data Model](#3-logical-data-model)  
   3.1 [Logical Schema Diagram](#31-logical-schema-diagram)  
   3.2 [Table Definitions](#32-table-definitions)  
   3.3 [Normalization (Up to 3NF)](#33-normalization-up-to-3nf)  
   3.4 [Referential Integrity](#34-referential-integrity)  
   3.5 [Transformation from Conceptual to Logical Model](#35-transformation-from-conceptual-to-logical-model)  
4. [Conclusion](#4-conclusion)

---

# 1. Overview

This document presents the **Database Design** for the project.

The objective of this document is to:

- Identify and structure the data that must be stored and manipulated.
- Develop a complete Conceptual Data Model.
- Transform the conceptual model into a Logical Data Model.
- Ensure data integrity, normalization, and traceability.

Briefly describe the system and its purpose here.

---

# 2. Conceptual Data Model

The conceptual model describes the structure of the system at a high level, focusing on entities, attributes, relationships, and business rules.

---

## 2.1 Entity-Relationship Diagram (ERD)

> Insert the conceptual ERD image below (Crow’s Foot or Chen notation).

<div align="center">
<sub>FIGURE X – [Insert Diagram Name Here]</sub><br>
  <img src="../assets/[filename].png" width="100%" alt="[Same as diagram name]">
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

The diagram must include:

- All entities
- Primary keys
- Attributes
- Relationship names
- Cardinality
- Participation constraints

---

## 2.2 Entity Identification

Identify all entities relevant to the problem domain.

### Entity 1: `<Entity_Name>`

Description:  
Explain what this entity represents in the system and why it exists.

---

### Entity 2: `<Entity_Name>`

Description:  
Explain its role in the system.

---

### Entity 3: `<Entity_Name>`

Description:  
Explain its purpose.

---

## 2.3 Attribute Definition

For each identified entity, specify its essential attributes and identify primary keys.

### `<Entity_Name>`

| Attribute Name | Description | Primary Key? |
|---------------|------------|--------------|
| id | Unique identifier | Yes |
| attribute_1 | Description | No |
| attribute_2 | Description | No |

---

### `<Entity_Name>`

| Attribute Name | Description | Primary Key? |
|---------------|------------|--------------|
| id | Unique identifier | Yes |
| attribute_1 | Description | No |
| attribute_2 | Description | No |

---

## 2.4 Relationships

Determine how entities relate to one another.

### Relationship 1: `<Relationship_Name>`

Entities involved:  
`<Entity_A>` — `<Entity_B>`

**Cardinality:**  
- One-to-One (1:1)  
- One-to-Many (1:N)  
- Many-to-Many (N:M)

**Participation Constraints:**  
- Mandatory  
- Optional  

**Description:**  
Explain the meaning and purpose of this relationship.

---

### Relationship 2: `<Relationship_Name>`

Entities involved:  
`<Entity_X>` — `<Entity_Y>`

**Cardinality:**  
**Participation:**  
**Description:**

---

## 2.5 Business Rules and Constraints

Document any business rules that constrain the data model.

Examples:

1. Maximum allowed value or quantity constraint.
2. Time-based restriction (e.g., deadlines, duration limits).
3. Status restrictions (allowed states).
4. Mandatory participation constraints.
5. Uniqueness requirements.
6. Validation rules for specific attributes.

Ensure all business rules described here will be enforced in the logical model.

---

## 2.6 Complete Textual Description

Provide a detailed explanation of:

- Each entity and its purpose.
- Each attribute and its relevance.
- Each relationship and its meaning.
- How the conceptual model satisfies the project requirements.

This section should clearly demonstrate alignment between requirements and the conceptual model.

---

# 3. Logical Data Model

The logical model transforms the conceptual model into a structure suitable for implementation in a relational database.

Entities become tables.  
Attributes become columns with appropriate data types.  
Relationships become foreign keys.

---

## 3.1 Logical Schema Diagram

> Insert the logical schema diagram below.

<div align="center">
<sub>FIGURE X – [Insert Diagram Name Here]</sub><br>
  <img src="../assets/[filename].png" width="100%" alt="[Same as diagram name]">
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

The diagram must include:

- Tables
- Columns
- Primary Keys
- Foreign Keys
- Relationship links

---

## 3.2 Table Definitions

Define the relational structure of each table.

---

### Table: `<table_name>`

| Column Name | Data Type | Constraints |
|------------|-----------|------------|
| id | INT | PRIMARY KEY |
| column_1 | VARCHAR(100) | NOT NULL |
| column_2 | DATE |  |
| foreign_id | INT | FOREIGN KEY REFERENCES other_table(id) |

---

### Table: `<junction_table_name>` (if applicable)

Used to resolve many-to-many relationships.

| Column Name | Data Type | Constraints |
|------------|-----------|------------|
| entityA_id | INT | FOREIGN KEY REFERENCES entityA(id) |
| entityB_id | INT | FOREIGN KEY REFERENCES entityB(id) |
| additional_attribute | VARCHAR(100) |  |

Primary Key: (entityA_id, entityB_id)


---

## 3.3 Normalization (Up to 3NF)

The logical model must achieve at least Third Normal Form (3NF).

### First Normal Form (1NF)

- All attributes are atomic.
- No repeating groups.
- Each table has a primary key.

### Second Normal Form (2NF)

- No partial dependency on composite keys.
- All non-key attributes depend on the entire primary key.

### Third Normal Form (3NF)

- No transitive dependencies.
- Non-key attributes depend only on the primary key.

Document:

- Any decompositions performed.
- How redundancy was eliminated.
- How integrity was improved.

---

## 3.4 Referential Integrity

Define foreign key relationships and constraints.

Examples:

- `ON DELETE CASCADE`
- `ON DELETE RESTRICT`
- `ON DELETE SET NULL`
- `ON UPDATE CASCADE`

Explain:

- Why each constraint was chosen.
- How referential integrity enforces business rules.

---

## 3.5 Transformation from Conceptual to Logical Model

Ensure traceability between models.

Explain:

- How each conceptual entity was mapped to a table.
- How attributes became columns with data types.
- How relationships were implemented using foreign keys.
- How many-to-many relationships were resolved.
- How business rules were enforced structurally.

You may use a mapping table:

| Conceptual Element | Logical Representation |
|--------------------|-----------------------|
| Entity: X | Table: x |
| Relationship: A–B | FK in table |
| N:M Relationship | Junction table |

---

# 4. Conclusion

Summarize how the database design:

- Identifies all relevant entities.
- Defines essential attributes with appropriate primary keys.
- Establishes relationships with accurate cardinality.
- Documents business rules and constraints.
- Achieves at least Third Normal Form (3NF).
- Ensures referential integrity.
- Maintains coherence between conceptual and logical models.
