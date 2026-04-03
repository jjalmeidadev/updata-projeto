# Equiem Database Implementation

## 1. Overview

This folder contains the physical database implementation of the Equiem Onboarding Middleware System.

The purpose of this database implementation is to:

- Provide a complete PostgreSQL schema representing the Equiem domain.
- Allow the database to be recreated from scratch using SQL scripts.
- Insert initial data for testing and validation.
- Provide documentation explaining how the database is structured and deployed.

The database structure implemented in the SQL scripts follows the conceptual and logical models defined in the project documentation.

For the full database design, including:

- Conceptual Data Model
- Logical Data Model
- Entity descriptions
- Relationships and cardinalities
- Business rules
- Normalization

please refer to the database design documentation located at:

`docs/database-design.md`

This document contains the full data dictionary and detailed explanation of the data model.

---

## 2. Database Technology

The database system used in this project is PostgreSQL

PostgreSQL was chosen because it provides:

- strong relational integrity
- advanced constraint management
- support for complex queries
- extensibility through extensions
- reliable transaction management

---

## 3. Database Schema

All tables created in this project are stored inside the schema named **equiem**

This schema groups all entities related to the Equiem system.

The schema contains entities related to:

- building management
- tenant companies
- users
- room booking
- operational configuration
- permit and compliance systems
- service request management
- media storage

The detailed structure of these entities is documented in `docs/database-design.md`

---

## 3.1 Implementation of Equiem Model Improvements

Following feedback from Equiem, several structural improvements were incorporated into the database schema to better reflect how the real platform organizes data and permissions.

### Customer → Site → Building Hierarchy

The original model started at the **Building** entity.
To align with the Equiem platform architecture, the hierarchy was extended by introducing the entities **Customer** and **Site**.

The resulting hierarchy is:

Customer → Site → Building → Levels → Rooms

This structure allows buildings to be grouped under specific sites, which are managed by customers.
It also supports permission management and administration at higher organizational levels.

### SiteProfile (User–Site Relationship)

Users in the Equiem platform are **global entities**, meaning they are not owned by a single site.

To represent this correctly, a **SiteProfile** join entity was introduced between **User** and **Site**.

The SiteProfile table stores:

* the user assigned to a site
* the site they belong to
* optional company association
* the date the user joined the site
* the user's status within that site

This design allows a user to belong to multiple sites while maintaining site-specific metadata.

### User–Company Relationship Adjustment

The relationship between **User** and **Company** was revised to reflect the real system behavior.

Only **Commercial users** belong to a company.
Other user types follow different associations:

* Commercial users → associated with a Company
* Residential users → associated with an Apartment
* Visitors → not linked to either Company or Apartment

This behavior is represented in the schema using:

* an optional `company_id` in the `user` table
* an optional `apartment_id` for residential users
* a `user_type` ENUM that defines the user category

### Apartment and Residential Users

The **Apartment** entity represents residential units within buildings.

Apartments can be linked to multiple levels through the **apartment_levels** table, allowing flexible building layouts.

Residential users may optionally be associated with an apartment through the `apartment_id` attribute in the `user` table.

### Role Scoping

User roles were designed to support scoped permissions across different organizational levels.

The `user_role` table allows roles to be assigned in relation to:

* a specific **Building**
* a specific **Company**

This structure enables permissions to be restricted to certain parts of the system rather than applying globally.

These modifications ensure the database schema more accurately reflects the operational structure of the Equiem platform while maintaining strong relational integrity and normalization.


## 4. SQL Scripts

This directory contains SQL scripts used to build, populate, and maintain the database.

### 4.1 01_create_database.sql

This script creates the entire database structure.

It performs the following operations:

- Drops the schema if it already exists
- Creates the schema `equiem`
- Creates all tables
- Defines primary keys
- Defines foreign key relationships
- Defines constraints
- Creates indexes when necessary

Running this script recreates the database structure from scratch.

---

### 4.2 02_initial_data.sql

This script inserts initial data into the database.

The inserted data is used to:

- test foreign key relationships
- verify database structure
- demonstrate system functionality

Example data may include:

- buildings
- levels
- companies
- users
- configuration entries

This script must be executed only after running `01_create_database.sql`.

---

### 4.3 03_fix_user_email_placeholders.sql

This maintenance script updates invalid placeholder user emails created during early authentication integration.

It performs the following operations:

- Finds users with empty/placeholder emails (`''` or `EMPTY`)
- Generates deterministic fallback emails from `auth0_id`
- Avoids collisions by appending a short user-id suffix when needed

Use this script in existing environments where old rows still have invalid emails.

---

## 5. Deployment Instructions

### 5.1 Install PostgreSQL

Download and install PostgreSQL from the official website:

https://www.postgresql.org/download/

You may interact with the database using:

- pgAdmin
- psql command line
- any PostgreSQL-compatible client

---

### 5.2 Create the Database

After installing PostgreSQL, create a new database.

Example:

CREATE DATABASE equiem_db;

---

### 5.3 Run the Database Creation Script

Open PostgreSQL (for example using pgAdmin Query Tool) and execute:

src/data/database/01_create_database.sql

This script will create the schema and all required tables.

---

### 5.4 Insert Initial Data

After the schema has been created, execute:

src/data/database/02_initial_data.sql

This will populate the database with example data used for testing.

---

## 6. Testing the Database

To verify that the database was created successfully, execute a simple query such as:

SELECT * FROM equiem.building;

If records are returned, the database has been correctly initialized.

Tables can also be inspected through pgAdmin:

Schemas → equiem → Tables

---

## 7. Resetting the Database

During development it may be necessary to recreate the database.

The creation script includes the instruction:

**DROP SCHEMA IF EXISTS equiem CASCADE;**

This ensures that the database can always be rebuilt from a clean state.

Simply run the creation script again to reset the entire schema.

---

## 8. Data Dictionary

The complete Data Dictionary and entity documentation are available in `docs/database-design.md`

This document contains:

- entity descriptions
- attribute definitions
- relationships
- referential integrity rules
- normalization analysis

---

## 9. Conclusion

This database implementation provides a structured PostgreSQL schema for the Equiem onboarding middleware system.

The design ensures:

- strong referential integrity
- normalized relational structure
- clear separation of system domains
- scalable configuration management

The provided SQL scripts allow the entire database to be recreated and populated easily, supporting development, testing, and deployment of the system.