import dotenv from "dotenv"
import { Pool } from "pg"

dotenv.config({ path: "config/.env" })

const env = ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}) as Record<
  string,
  string | undefined
>;

console.log("DB_HOST:", env.DB_HOST)
console.log("DB_PORT:", env.DB_PORT)
console.log("DB_USER:", env.DB_USER)
console.log("DB_DATABASE:", env.DB_DATABASE)
console.log("DB_SSL:", env.DB_SSL)

const pool = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  database: env.DB_DATABASE,
  password: env.DB_PASSWORD,
  port: Number(env.DB_PORT),
  ssl: env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
})

export default pool