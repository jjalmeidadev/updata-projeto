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

## 4. SQL Scripts

This directory contains two SQL scripts used to build and populate the database.

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