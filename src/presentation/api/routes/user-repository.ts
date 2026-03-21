import pool from "../../../data/database/index-table.js"

interface UserInsert {
  auth0_id: string
  name: string
  email: string
  company_id?: number
}

interface UserRecord {
  user_id: number
  user_name: string
  user_email: string
  auth0_id: string
  company_id: number | null
}


// Finds a user by Auth0 id to avoid duplicate onboarding records.

async function findUser(auth0Id: string, traceId = "no-trace"): Promise<UserRecord | null> {
  console.log(`[FLOW][${traceId}] repository:find_user auth0Id=${auth0Id}`)

  // Lookup user by Auth0 id to avoid duplicate records.
  const query = `
    SELECT 
      user_id,
      user_name,
      user_email,
      auth0_id,
      company_id
    FROM "user"
    WHERE auth0_id = $1
  `

  const result = await pool.query(query, [auth0Id])

  console.log(`[FLOW][${traceId}] repository:find_user rows=${result.rows.length}`)

  if (result.rows.length === 0) {
    return null
  }

  return result.rows[0] as UserRecord
}


//Resolves a company id from the email domain used during login.

async function findCompanyByDomain(domain: string, traceId = "no-trace"): Promise<number | null> {
  console.log(`[FLOW][${traceId}] repository:find_company_by_domain domain=${domain || "empty"}`)

  // Resolve company by the domain part of the registered company email.
  const query = `
    SELECT company_id
    FROM company
    WHERE LOWER(split_part(company_email, '@', 2)) = LOWER($1)
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

  // Insert first-time authenticated user into local database.
  const query = `
    INSERT INTO "user"
    (
      user_name,
      user_email,
      auth0_id,
      company_id
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      user_id,
      user_name,
      user_email,
      auth0_id,
      company_id
  `

  const values = [
    user.name,
    user.email,
    user.auth0_id,
    user.company_id || null
  ]

  const result = await pool.query(query, values)

  console.log(`[FLOW][${traceId}] repository:create_user createdUserId=${result.rows[0]?.user_id || "unknown"}`)

  return result.rows[0] as UserRecord
}

export {
  findUser,
  createUser,
  findCompanyByDomain
}