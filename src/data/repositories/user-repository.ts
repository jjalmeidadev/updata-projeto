import pool from "../database/index-table.js"

interface UserInsert {
  auth0_id: string
  name: string
  email: string
  company_id?: string
}

interface UserRecord {
  user_id: string
  user_name: string
  user_email: string
  auth0_id: string
  company_id: string | null
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim()
  if (!trimmed) {
    return { firstName: "Unknown", lastName: "User" }
  }

  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "User" }
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  }
}


// Finds a user by Auth0 id to avoid duplicate onboarding records.

async function findUser(auth0Id: string, traceId = "no-trace"): Promise<UserRecord | null> {
  console.log(`[FLOW][${traceId}] repository:find_user auth0Id=${auth0Id}`)

  // Lookup user by Auth0 id to avoid duplicate records.
  const query = `
    SELECT 
      id AS user_id,
      CONCAT_WS(' ', first_name, last_name) AS user_name,
      email AS user_email,
      auth0_id,
      company_id
    FROM equiem."user"
    WHERE auth0_id = $1
  `

  const result = await pool.query(query, [auth0Id])

  console.log(`[FLOW][${traceId}] repository:find_user rows=${result.rows.length}`)

  if (result.rows.length === 0) {
    return null
  }

  return result.rows[0] as UserRecord
}

// Finds an existing user by email to reconcile first login against pre-seeded records.
async function findUserByEmail(email: string, traceId = "no-trace"): Promise<UserRecord | null> {
  console.log(`[FLOW][${traceId}] repository:find_user_by_email email=${email || "empty"}`)

  const query = `
    SELECT
      id AS user_id,
      CONCAT_WS(' ', first_name, last_name) AS user_name,
      email AS user_email,
      auth0_id,
      company_id
    FROM equiem."user"
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1
  `

  const result = await pool.query(query, [email])

  console.log(`[FLOW][${traceId}] repository:find_user_by_email rows=${result.rows.length}`)

  if (result.rows.length === 0) {
    return null
  }

  return result.rows[0] as UserRecord
}


//Resolves a company id from the email domain used during login.

async function findCompanyByDomain(domain: string, traceId = "no-trace"): Promise<string | null> {
  console.log(`[FLOW][${traceId}] repository:find_company_by_domain domain=${domain || "empty"}`)

  // Resolve company by the domain part of the registered company email.
  const query = `
    SELECT id AS company_id
    FROM equiem.company
    WHERE EXISTS (
      SELECT 1
      FROM unnest(approved_domains) AS domain_value
      WHERE LOWER(domain_value) = LOWER($1)
    )
    LIMIT 1
  `

  const result = await pool.query(query, [domain])

  console.log(`[FLOW][${traceId}] repository:find_company_by_domain rows=${result.rows.length}`)

  if (result.rows.length === 0) {
    return null
  }

  return result.rows[0].company_id
}

// Creates a first-time authenticated user in the local database.
async function createUser(user: UserInsert, traceId = "no-trace"): Promise<UserRecord> {
  console.log(`[FLOW][${traceId}] repository:create_user auth0Id=${user.auth0_id}`)

  const { firstName, lastName } = splitName(user.name)

  // Insert first-time authenticated user into local database.
  const query = `
    INSERT INTO equiem."user"
    (
      id,
      first_name,
      last_name,
      email,
      email_verified,
      status,
      user_type,
      auth0_id,
      company_id
    )
    VALUES (gen_random_uuid(), $1, $2, $3, false, 'pending', 'commercial', $4, $5)
    RETURNING
      id AS user_id,
      CONCAT_WS(' ', first_name, last_name) AS user_name,
      email AS user_email,
      auth0_id,
      company_id
  `

  const values = [
    firstName,
    lastName,
    user.email,
    user.auth0_id,
    user.company_id || null
  ]

  const result = await pool.query(query, values)

  console.log(`[FLOW][${traceId}] repository:create_user createdUserId=${result.rows[0]?.user_id || "unknown"}`)

  return result.rows[0] as UserRecord
}

// Links an existing DB user (matched by email) with Auth0 id and optional company mapping.
async function linkUserToAuth0ByEmail(user: UserInsert, traceId = "no-trace"): Promise<UserRecord | null> {
  console.log(`[FLOW][${traceId}] repository:link_user_by_email email=${user.email || "empty"} auth0Id=${user.auth0_id}`)

  const { firstName, lastName } = splitName(user.name)

  const query = `
    UPDATE equiem."user"
    SET
      auth0_id = $1,
      first_name = CASE
        WHEN $2 = 'Unknown' AND $3 = 'User' THEN first_name
        ELSE $2
      END,
      last_name = CASE
        WHEN $2 = 'Unknown' AND $3 = 'User' THEN last_name
        ELSE $3
      END,
      company_id = COALESCE(company_id, $4)
    WHERE LOWER(email) = LOWER($5)
    RETURNING
      id AS user_id,
      CONCAT_WS(' ', first_name, last_name) AS user_name,
      email AS user_email,
      auth0_id,
      company_id
  `

  const values = [
    user.auth0_id,
    firstName,
    lastName,
    user.company_id || null,
    user.email,
  ]

  const result = await pool.query(query, values)

  console.log(`[FLOW][${traceId}] repository:link_user_by_email rows=${result.rows.length}`)

  if (result.rows.length === 0) {
    return null
  }

  return result.rows[0] as UserRecord
}

// Updates an existing DB user identified by auth0_id with fresher profile fields from token claims.
async function updateUserByAuth0Id(user: UserInsert, traceId = "no-trace"): Promise<UserRecord | null> {
  console.log(`[FLOW][${traceId}] repository:update_user_by_auth0 auth0Id=${user.auth0_id}`)

  const { firstName, lastName } = splitName(user.name)

  const query = `
    UPDATE equiem."user"
    SET
      email = $2,
      first_name = CASE
        WHEN $3 = 'Unknown' AND $4 = 'User' THEN first_name
        ELSE $3
      END,
      last_name = CASE
        WHEN $3 = 'Unknown' AND $4 = 'User' THEN last_name
        ELSE $4
      END,
      company_id = COALESCE(company_id, $5)
    WHERE auth0_id = $1
    RETURNING
      id AS user_id,
      CONCAT_WS(' ', first_name, last_name) AS user_name,
      email AS user_email,
      auth0_id,
      company_id
  `

  const values = [
    user.auth0_id,
    user.email,
    firstName,
    lastName,
    user.company_id || null,
  ]

  const result = await pool.query(query, values)

  console.log(`[FLOW][${traceId}] repository:update_user_by_auth0 rows=${result.rows.length}`)

  if (result.rows.length === 0) {
    return null
  }

  return result.rows[0] as UserRecord
}

export {
  findUser,
  findUserByEmail,
  createUser,
  findCompanyByDomain,
  linkUserToAuth0ByEmail,
  updateUserByAuth0Id,
}