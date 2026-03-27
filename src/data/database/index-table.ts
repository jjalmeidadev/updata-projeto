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

const processSafe = (globalThis as { process?: { argv?: string[] } }).process
const argvFlat = Array.isArray(processSafe?.argv) ? processSafe.argv.join(" ").replace(/\\/g, "/") : ""
const isUploadWorkerProcess = argvFlat.includes("upload-worker")
const isBenchmarkThroughputProcess = argvFlat.includes("benchmark-throughput")

function resolvePoolMax(): number {
  const raw = env.DB_POOL_MAX?.trim()
  const parsed = raw !== undefined && raw !== "" ? Number.parseInt(raw, 10) : Number.NaN
  const explicit = Number.isFinite(parsed) && parsed >= 1 ? parsed : undefined

  if (isUploadWorkerProcess) {
    // One Node worker = one DB session; avoids exhausting Supabase Session pooler (port 5432)
    // when many workers run. Queries in processMessage are sequential; a larger pool only adds connections.
    return 1
  }

  if (isBenchmarkThroughputProcess) {
    return explicit ?? 1
  }

  return explicit ?? 10
}

const poolMax = resolvePoolMax()
console.log("DB_POOL_MAX:", poolMax, `(upload-worker=${isUploadWorkerProcess}, benchmark=${isBenchmarkThroughputProcess})`)

const pool = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  database: env.DB_DATABASE,
  password: env.DB_PASSWORD,
  port: Number(env.DB_PORT),
  ssl: env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  max: poolMax,
})

export default pool