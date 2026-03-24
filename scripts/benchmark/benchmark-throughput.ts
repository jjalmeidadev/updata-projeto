import dotenv from "dotenv"
import { spawn, type ChildProcess } from "node:child_process"
import { promises as fs } from "node:fs"
import path from "node:path"
import pool from "../../src/data/database/index-table.ts"

dotenv.config({ path: "config/.env" })

interface BenchmarkRunResult {
  traceId: string
  batchSize: number
  workerCount: number
  runIndex: number
  status: string
  rowCount: number
  elapsedSeconds: number
  throughputRowsPerSec: number
  startedAt: string
  finishedAt: string
}

interface TraceMetrics {
  status: string
  rowCount: number
  elapsedSeconds: number | null
  startedAt: Date | null
  finishedAt: Date | null
}

const apiUploadUrl = process.env.BENCHMARK_API_UPLOAD_URL || "http://localhost:3000/api/upload"
const datasetPath = process.env.BENCHMARK_DATASET_PATH || "benchmark-data/onboarding_50000.csv"
const workerWarmupMs = Number.parseInt(process.env.BENCHMARK_WORKER_WARMUP_MS || "3000", 10)
const pollIntervalMs = Number.parseInt(process.env.BENCHMARK_POLL_INTERVAL_MS || "1000", 10)
const timeoutMs = Number.parseInt(process.env.BENCHMARK_TIMEOUT_MS || "600000", 10)
const runsPerCombination = Number.parseInt(process.env.BENCHMARK_RUNS_PER_COMBINATION || "1", 10)
const skipExternalSend = process.env.BENCHMARK_SKIP_EXTERNAL_SEND || "true"

const batchSizes = (process.env.BENCHMARK_BATCH_SIZES || "1,3,5,10")
  .split(",")
  .map((value) => Number.parseInt(value.trim(), 10))
  .filter((value) => Number.isInteger(value) && value >= 1 && value <= 10)

const workerCounts = (process.env.BENCHMARK_WORKER_COUNTS || "1,2,4")
  .split(",")
  .map((value) => Number.parseInt(value.trim(), 10))
  .filter((value) => Number.isInteger(value) && value >= 1)

if (batchSizes.length === 0 || workerCounts.length === 0) {
  throw new Error("Invalid BENCHMARK_BATCH_SIZES or BENCHMARK_WORKER_COUNTS.")
}

const csvHeader = [
  "trace_id",
  "batch_size",
  "worker_count",
  "run_index",
  "status",
  "row_count",
  "elapsed_seconds",
  "throughput_rows_per_sec",
  "started_at",
  "finished_at",
]

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function nowIsoCompact(): string {
  return new Date().toISOString().replace(/[.:]/g, "-")
}

function spawnWorker(batchSize: number, index: number): ChildProcess {
  const command = "npm run worker:upload"

  const worker = spawn(command, [], {
    shell: true,
    windowsHide: true,
    cwd: process.cwd(),
    env: {
      ...process.env,
      WORKER_BATCH_SIZE: String(batchSize),
      BENCHMARK_SKIP_EXTERNAL_SEND: skipExternalSend,
    },
    stdio: ["ignore", "pipe", "pipe"],
  })

  worker.stdout?.on("data", (chunk) => {
    const output = String(chunk).trim()
    if (output.length > 0) {
      console.log(`[worker-${index}] ${output}`)
    }
  })

  worker.stderr?.on("data", (chunk) => {
    const output = String(chunk).trim()
    if (output.length > 0) {
      console.error(`[worker-${index}] ${output}`)
    }
  })

  return worker
}

async function stopWorkers(workers: ChildProcess[]): Promise<void> {
  for (const worker of workers) {
    if (!worker.killed) {
      worker.kill("SIGTERM")
    }
  }

  await sleep(1200)

  for (const worker of workers) {
    if (!worker.killed) {
      worker.kill("SIGKILL")
    }
  }
}

async function uploadDataset(traceId: string): Promise<void> {
  const absoluteDatasetPath = path.resolve(datasetPath)
  const fileBuffer = await fs.readFile(absoluteDatasetPath)

  const form = new FormData()
  const blob = new Blob([fileBuffer], { type: "text/csv" })
  form.append("file", blob, path.basename(absoluteDatasetPath))

  const response = await fetch(apiUploadUrl, {
    method: "POST",
    headers: {
      "x-debug-trace-id": traceId,
    },
    body: form,
  })

  const responseText = await response.text()

  if (!response.ok) {
    throw new Error(`Upload failed. status=${response.status} body=${responseText}`)
  }

  try {
    const json = JSON.parse(responseText) as { traceId?: string }
    if (json.traceId && json.traceId !== traceId) {
      console.warn(`TraceId mismatch: sent=${traceId}, response=${json.traceId}`)
    }
  } catch {
    // Endpoint may return non-JSON in edge cases; ignore parse errors.
  }
}

async function fetchTraceMetrics(traceId: string): Promise<TraceMetrics | null> {
  const query = `
    SELECT
      ob.status,
      COUNT(op.id)::int AS row_count,
      EXTRACT(EPOCH FROM (pj.finished_at - pj.started_at))::double precision AS elapsed_seconds,
      pj.started_at,
      pj.finished_at
    FROM equiem.onboarding_batch ob
    LEFT JOIN equiem.processing_job pj ON pj.batch_id = ob.id
    LEFT JOIN equiem.onboarding_payload op ON op.batch_id = ob.id
    WHERE ob.trace_id = $1
    GROUP BY ob.status, pj.started_at, pj.finished_at
    ORDER BY pj.started_at DESC NULLS LAST
    LIMIT 1
  `

  const result = await pool.query(query, [traceId])

  if (result.rows.length === 0) {
    return null
  }

  const row = result.rows[0] as {
    status: string
    row_count: number
    elapsed_seconds: number | null
    started_at: Date | null
    finished_at: Date | null
  }

  return {
    status: row.status,
    rowCount: row.row_count,
    elapsedSeconds: row.elapsed_seconds,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
  }
}

function isTerminalStatus(status: string): boolean {
  return ["completed", "failed", "invalid", "pending_external_send"].includes(status)
}

async function waitForCompletion(traceId: string): Promise<TraceMetrics> {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const metrics = await fetchTraceMetrics(traceId)

    if (!metrics) {
      await sleep(pollIntervalMs)
      continue
    }

    if (isTerminalStatus(metrics.status)) {
      return metrics
    }

    await sleep(pollIntervalMs)
  }

  throw new Error(`Timeout waiting for completion. traceId=${traceId}`)
}

function toCsvLine(result: BenchmarkRunResult): string {
  return [
    result.traceId,
    result.batchSize,
    result.workerCount,
    result.runIndex,
    result.status,
    result.rowCount,
    result.elapsedSeconds.toFixed(6),
    result.throughputRowsPerSec.toFixed(6),
    result.startedAt,
    result.finishedAt,
  ].join(",")
}

async function ensureOutputFile(outputPath: string): Promise<void> {
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, `${csvHeader.join(",")}\n`, "utf8")
}

async function appendResult(outputPath: string, result: BenchmarkRunResult): Promise<void> {
  await fs.appendFile(outputPath, `${toCsvLine(result)}\n`, "utf8")
}

async function runBenchmark(): Promise<void> {
  const outputFile = path.resolve(`benchmark-results/throughput-${nowIsoCompact()}.csv`)
  const datasetAbsolutePath = path.resolve(datasetPath)

  await fs.access(datasetAbsolutePath)
  await ensureOutputFile(outputFile)

  console.log("Benchmark started")
  console.log(`- upload endpoint: ${apiUploadUrl}`)
  console.log(`- dataset: ${datasetAbsolutePath}`)
  console.log(`- batch sizes: ${batchSizes.join(",")}`)
  console.log(`- worker counts: ${workerCounts.join(",")}`)
  console.log(`- runs per combination: ${runsPerCombination}`)
  console.log(`- output: ${outputFile}`)

  const totalRuns = batchSizes.length * workerCounts.length * runsPerCombination
  let completedRuns = 0

  for (const batchSize of batchSizes) {
    for (const workerCount of workerCounts) {
      const workers: ChildProcess[] = []

      try {
        console.log(`\n[combo] B=${batchSize} W=${workerCount}`)

        for (let i = 0; i < workerCount; i += 1) {
          workers.push(spawnWorker(batchSize, i + 1))
        }

        await sleep(workerWarmupMs)

        for (let runIndex = 1; runIndex <= runsPerCombination; runIndex += 1) {
          const traceId = `bench-${batchSize}-${workerCount}-${runIndex}-${Date.now()}`
          console.log(`[run] traceId=${traceId}`)

          await uploadDataset(traceId)
          const metrics = await waitForCompletion(traceId)

          if (!metrics.startedAt || !metrics.finishedAt || !metrics.elapsedSeconds || metrics.elapsedSeconds <= 0) {
            throw new Error(
              `Missing timing metrics for traceId=${traceId} status=${metrics.status}. ` +
                "Verify worker completion and processing_job timestamps."
            )
          }

          const throughputRowsPerSec = metrics.rowCount / metrics.elapsedSeconds

          const result: BenchmarkRunResult = {
            traceId,
            batchSize,
            workerCount,
            runIndex,
            status: metrics.status,
            rowCount: metrics.rowCount,
            elapsedSeconds: metrics.elapsedSeconds,
            throughputRowsPerSec,
            startedAt: metrics.startedAt.toISOString(),
            finishedAt: metrics.finishedAt.toISOString(),
          }

          await appendResult(outputFile, result)
          completedRuns += 1

          console.log(
            `[ok] ${completedRuns}/${totalRuns} | rows=${result.rowCount} elapsed=${result.elapsedSeconds.toFixed(2)}s throughput=${result.throughputRowsPerSec.toFixed(2)} rec/s`
          )
        }
      } finally {
        await stopWorkers(workers)
      }
    }
  }

  await pool.end()

  console.log("\nBenchmark completed")
  console.log(`CSV generated at: ${outputFile}`)
}

runBenchmark().catch(async (error) => {
  console.error("Benchmark failed", error)
  await pool.end()
  process.exit(1)
})
