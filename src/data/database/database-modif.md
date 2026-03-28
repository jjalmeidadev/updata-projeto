# THIS DOCUMENT WILL BE DELETED AFTER REVIEW :

# Summary of Database Changes

This document explains the main additions and modifications made to the database schema in order to better align the internal model with the Equiem Platform Data Model API, while preserving the existing project structure as much as possible.

---

## General approach

The schema was updated with the following principles:

- keep the current structure whenever possible  
- add missing fields required by the Equiem API  
- add missing entities only when necessary  
- avoid breaking the existing project model  
- prepare the database for future API integration  

The goal was not to redesign the entire database from scratch, but to extend it so it can support the external Equiem model more accurately.

---

## 1. Added missing fields to the location hierarchy

The Equiem API defines the following hierarchy:

**Customer -> Site -> Building -> Level -> Space**

Our previous schema already included `customer`, `site`, `building`, and `levels`, but several required fields from the Equiem API were missing.

### Added to `customer`
- `region`
- `status`

### Added to `site`
- `address`
- `timezone`
- `site_type`

### Added to `building`
- `display_order`

### Added to `levels`
- `level_name`
- `display_order`
- `space_count`

### Why
These fields are required or strongly implied by the Equiem API payloads.  
Without them, the integration layer would need to invent values or leave required fields empty.

---

## 2. Added a new `space` entity

A dedicated `space` table was added:

- `space_name`
- `ownership_type`
- `levels_id`

### Why
The Equiem model includes `Space` as a distinct entity in the physical hierarchy.  
Our previous schema did not include a true `space` entity.

The existing `room` table is not exactly the same thing:
- `space` represents physical hierarchy  
- `room` represents a reservable amenity/resource  

For this reason, both entities were kept separate.

---

## 3. Extended the `company` table

The Equiem `CompanyInput` includes:
- `name`
- `industry`
- `attributes`
- `approvedDomains`
- `userApproval`

Our schema already supported:
- `company_name`
- `industry`
- `attribute`

The following were added to `company`:
- `approved_domains`
- `user_approval`

### Why
These fields are explicitly required by the Equiem company payload and were not stored previously.

---

## 4. Extended the `user` table

The Equiem `UserInput` includes:
- `firstName`
- `lastName`
- `email`
- `emailVerified`
- `mobileNumber`
- `status`
- `userType`
- `uuid`
- `auth0Id`
- `memberSince`

Our schema already supported:
- `user_name`
- `user_email`
- `auth0_id`
- `user_type`
- `user_id`
- `created_at`

The following fields were added:
- `first_name`
- `last_name`
- `email_verified`
- `mobile_number`
- `user_status`

### Why
The previous schema only stored a full name and basic identity data.  
To support the Equiem API more accurately, the schema now stores separate first and last names, email verification state, phone number, and explicit user status.

### Important note
The existing `user_name` field was kept to avoid breaking the current application structure.

---

## 5. Updated `user_type`

The `user_type_enum` was changed to match the values used by the Equiem API:

- `commercial`
- `residential`
- `visitor`

### Why
The previous enum also included `admin`, but in the Equiem model, administration is better represented through roles rather than through the user type itself.

---

## 6. Extended the `site_profile` table

The Equiem `SiteProfileInput` includes:
- `status`
- `joinedAt`
- `isActive`
- `userId`
- `siteId`
- `companyId`

Our schema already had:
- `status`
- `joined_at`
- `user_id`
- `site_id`
- `company_id`

The following field was added:
- `is_active`

### Why
`isActive` exists explicitly in the Equiem API and should not be inferred only from the status field.

---

## 7. Extended the `role` table

The Equiem `RoleInput` includes:
- `name`
- `description`
- `scopeLevel`
- `permissions`

Our schema previously only had:
- `role_name`

The following were added:
- `description`
- `scope_level`
- `permissions`

### Why
Without these fields, the system would not be able to represent or validate Equiem-compatible role payloads.

---

## 8. Added a new `interest` entity

A dedicated `interest` table was added:
- `interest_id`
- `name`

### Why
The Equiem API includes an `Interest` entity, and our previous schema had no equivalent structure.

---

## 9. Added a new `identity_group` entity

A new table called `identity_group` was added.

### Why
This was necessary because our current `"group"` table does **not** represent the same concept as the `Group` entity in the Equiem Identity & Access model.

Current internal `"group"`:
- building subdivision  
- booking / facility organization  

Equiem `Group`:
- user/identity grouping concept  

To avoid mixing two different meanings, the current `"group"` table was preserved and a separate `identity_group` entity was introduced.

---

## 10. Added a new `bookable_resource` entity

A dedicated `bookable_resource` table was added with fields such as:
- `name`
- `description`
- `capacity`
- `location`
- `status`
- `photos`
- `building_id`
- optional `room_id`

### Why
The Equiem API includes a `BookableResource` entity.  
Our existing `room` table is close to this concept, but not a perfect match.

Instead of replacing `room`, a separate `bookable_resource` entity was introduced so that:
- the current room model remains valid  
- the Equiem object can be represented explicitly  
- the integration layer becomes cleaner  

---

## 11. Added a new `booking` entity

A dedicated `booking` table was added with:
- `start_time`
- `end_time`
- `status`
- `notes`
- `user_id`
- `bookable_resource_id`

### Why
The Equiem API includes a `Booking` entity, but the previous schema did not contain any table for bookings.

This was a real structural gap in the database.

---

## 12. Added supporting indexes

Additional indexes were added on key foreign keys and integration-related relationships, including:
- `site.customer_id`
- `building.site_id`
- `space.levels_id`
- `site_profile.user_id`
- `site_profile.site_id`
- `user_role.user_id`
- `bookable_resource.building_id`
- `booking.user_id`
- `booking.bookable_resource_id`

### Why
These indexes improve query performance and support common joins without changing the business model.

---

## Important choices that were intentionally not made

### 1. Primary keys were not converted globally to UUID
Although the Equiem examples often use UUID-like values in payloads, the internal database still uses integer keys for most entities.

### Why
Changing all primary keys to UUID would:
- significantly increase migration complexity  
- create many breaking changes  
- introduce unnecessary risk at this stage  

Instead, the internal schema remains stable and UUID/string mapping can be handled later in the integration layer.

---

### 2. The existing `room` table was not removed

### Why
The project already uses `room` as a core entity.  
Replacing it entirely would create unnecessary disruption.

---

### 3. The existing `"group"` table was not reused as Equiem `Group`

### Why
The meaning of the two concepts appears to be different.  
Reusing the same table for both concepts would likely create semantic confusion and lead to incorrect mappings.

---

## Final result

The updated schema now:

- aligns more closely with the Equiem Platform Data Model API  
- preserves the existing project structure  
- adds missing required fields  
- introduces missing entities only where necessary  
- prepares the database for future integration work without forcing a full redesign  

This approach makes the schema more integration-ready while keeping the project stable and easier to maintain.