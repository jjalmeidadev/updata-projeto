import { promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type DataPoint = {
  batchSize: number
  workerCount: number
  throughput: number
}

type AggregatedPoint = DataPoint & {
  observedRuns: number
  usedRuns: number
  imputedRuns: number
}

type RawRun = {
  batchSize: number
  workerCount: number
  runIndex: number
  throughput: number
}

type Coefficients = {
  a: number
  b: number
  c: number
  d: number
  e: number
  f: number
}

function parseCsvRuns(content: string): RawRun[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length < 2) {
    return []
  }

  const header = lines[0].split(",")
  const batchIndex = header.indexOf("batch_size")
  const workerIndex = header.indexOf("worker_count")
  const runIndex = header.indexOf("run_index")
  const throughputIndex = header.indexOf("throughput_rows_per_sec")

  if (batchIndex < 0 || workerIndex < 0 || runIndex < 0 || throughputIndex < 0) {
    throw new Error("CSV must contain batch_size, worker_count, run_index, throughput_rows_per_sec columns.")
  }

  const runs: RawRun[] = []

  for (let i = 1; i < lines.length; i += 1) {
    const cols = lines[i].split(",")
    const batchSize = Number.parseFloat(cols[batchIndex] || "")
    const workerCount = Number.parseFloat(cols[workerIndex] || "")
    const runIdx = Number.parseInt(cols[runIndex] || "", 10)
    const throughput = Number.parseFloat(cols[throughputIndex] || "")

    if (!Number.isFinite(batchSize) || !Number.isFinite(workerCount) || !Number.isFinite(runIdx) || !Number.isFinite(throughput)) {
      continue
    }

    runs.push({ batchSize, workerCount, runIndex: runIdx, throughput })
  }

  return runs
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function aggregateByCombination(runs: RawRun[], expectedRunsPerCombo: number, imputeMissingWithMean: boolean): AggregatedPoint[] {
  const grouped = new Map<string, RawRun[]>()

  for (const run of runs) {
    const key = `${run.batchSize},${run.workerCount}`
    const arr = grouped.get(key) ?? []
    arr.push(run)
    grouped.set(key, arr)
  }

  const points: AggregatedPoint[] = []

  for (const [key, comboRuns] of grouped.entries()) {
    const [batchSize, workerCount] = key.split(",").map(Number)
    const throughputs = comboRuns
      .sort((a, b) => a.runIndex - b.runIndex)
      .map((run) => run.throughput)
    const observedRuns = throughputs.length

    if (throughputs.length === 0) {
      continue
    }

    if (imputeMissingWithMean && throughputs.length < expectedRunsPerCombo) {
      const comboMean = mean(throughputs)
      while (throughputs.length < expectedRunsPerCombo) {
        throughputs.push(comboMean)
      }
    }

    points.push({
      batchSize,
      workerCount,
      throughput: mean(throughputs),
      observedRuns,
      usedRuns: throughputs.length,
      imputedRuns: Math.max(0, throughputs.length - observedRuns),
    })
  }

  return points.sort((a, b) => a.batchSize - b.batchSize || a.workerCount - b.workerCount)
}

async function writeCombinationMeansCsv(inputCsvPath: string, points: AggregatedPoint[]): Promise<string> {
  const outputPath = inputCsvPath.replace(/\.csv$/i, "-combination-means.csv")
  const lines = [
    "batch_size,worker_count,observed_runs,used_runs,imputed_runs,mean_throughput_rows_per_sec",
    ...points.map((point) =>
      [
        point.batchSize,
        point.workerCount,
        point.observedRuns,
        point.usedRuns,
        point.imputedRuns,
        point.throughput.toFixed(6),
      ].join(",")
    ),
  ]
  await fs.writeFile(outputPath, lines.join("\n") + "\n", "utf8")
  return outputPath
}

function makeFeatures(point: DataPoint): number[] {
  const B = point.batchSize
  const W = point.workerCount
  return [1, B, W, B * B, B * W, W * W]
}

function solveLinearSystem(matrix: number[][], vector: number[]): number[] {
  const n = matrix.length
  const a = matrix.map((row) => [...row])
  const b = [...vector]

  for (let i = 0; i < n; i += 1) {
    let pivot = i
    for (let row = i + 1; row < n; row += 1) {
      if (Math.abs(a[row][i]) > Math.abs(a[pivot][i])) {
        pivot = row
      }
    }

    if (Math.abs(a[pivot][i]) < 1e-12) {
      throw new Error("Singular matrix during regression fit. Collect more diverse benchmark points.")
    }

    if (pivot !== i) {
      ;[a[i], a[pivot]] = [a[pivot], a[i]]
      ;[b[i], b[pivot]] = [b[pivot], b[i]]
    }

    const pivotValue = a[i][i]
    for (let col = i; col < n; col += 1) {
      a[i][col] /= pivotValue
    }
    b[i] /= pivotValue

    for (let row = 0; row < n; row += 1) {
      if (row === i) {
        continue
      }
      const factor = a[row][i]
      for (let col = i; col < n; col += 1) {
        a[row][col] -= factor * a[i][col]
      }
      b[row] -= factor * b[i]
    }
  }

  return b
}

function fitQuadraticModel(points: DataPoint[]): Coefficients {
  const p = 6
  const xtx: number[][] = Array.from({ length: p }, () => Array.from({ length: p }, () => 0))
  const xty: number[] = Array.from({ length: p }, () => 0)

  for (const point of points) {
    const x = makeFeatures(point)
    for (let i = 0; i < p; i += 1) {
      xty[i] += x[i] * point.throughput
      for (let j = 0; j < p; j += 1) {
        xtx[i][j] += x[i] * x[j]
      }
    }
  }

  const [a, b, c, d, e, f] = solveLinearSystem(xtx, xty)
  return { a, b, c, d, e, f }
}

function predict(coefficients: Coefficients, B: number, W: number): number {
  return (
    coefficients.a +
    coefficients.b * B +
    coefficients.c * W +
    coefficients.d * B * B +
    coefficients.e * B * W +
    coefficients.f * W * W
  )
}

function calculateR2(points: DataPoint[], coefficients: Coefficients): number {
  const mean = points.reduce((acc, point) => acc + point.throughput, 0) / points.length
  const sst = points.reduce((acc, point) => acc + (point.throughput - mean) ** 2, 0)
  const sse = points.reduce((acc, point) => {
    const residual = point.throughput - predict(coefficients, point.batchSize, point.workerCount)
    return acc + residual * residual
  }, 0)

  if (sst === 0) {
    return 1
  }

  return 1 - sse / sst
}

function computeCriticalPoint(coefficients: Coefficients): { batchSize: number; workerCount: number; determinant: number } {
  const { b, c, d, e, f } = coefficients
  const determinant = 4 * d * f - e * e

  if (Math.abs(determinant) < 1e-12) {
    throw new Error("Hessian determinant is near zero. Critical point is unstable.")
  }

  const batchSize = (-2 * f * b + e * c) / determinant
  const workerCount = (e * b - 2 * d * c) / determinant

  return { batchSize, workerCount, determinant }
}

function classifyCriticalPoint(coefficients: Coefficients): "max" | "min" | "saddle" {
  const { d, e, f } = coefficients
  const determinant = 4 * d * f - e * e

  if (determinant <= 0) {
    return "saddle"
  }

  if (d < 0 && f < 0) {
    return "max"
  }

  return "min"
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function roundToInt(value: number): number {
  return Math.max(1, Math.round(value))
}

function buildReport(
  csvPath: string,
  points: DataPoint[],
  coefficients: Coefficients,
  r2: number,
  criticalPoint: { batchSize: number; workerCount: number; determinant: number },
  expectedRunsPerCombo: number,
  imputeMissingWithMean: boolean
): string {
  const classification = classifyCriticalPoint(coefficients)

  const minBatch = Math.min(...points.map((point) => point.batchSize))
  const maxBatch = Math.max(...points.map((point) => point.batchSize))
  const minWorker = Math.min(...points.map((point) => point.workerCount))
  const maxWorker = Math.max(...points.map((point) => point.workerCount))

  const batchSuggested = clamp(roundToInt(criticalPoint.batchSize), minBatch, maxBatch)
  const workerSuggested = clamp(roundToInt(criticalPoint.workerCount), minWorker, maxWorker)
  const predictedSuggested = predict(coefficients, batchSuggested, workerSuggested)

  return [
    "# Throughput Optimization Report",
    "",
    `Input CSV: ${csvPath}`,
    `Data points: ${points.length}`,
    `Expected runs/combo: ${expectedRunsPerCombo}`,
    `Missing runs imputed with combo mean: ${imputeMissingWithMean ? "yes" : "no"}`,
    `R2: ${r2.toFixed(6)}`,
    "",
    "Model:",
    "T(B, W) = a + bB + cW + dB^2 + eBW + fW^2",
    `a=${coefficients.a.toFixed(6)}`,
    `b=${coefficients.b.toFixed(6)}`,
    `c=${coefficients.c.toFixed(6)}`,
    `d=${coefficients.d.toFixed(6)}`,
    `e=${coefficients.e.toFixed(6)}`,
    `f=${coefficients.f.toFixed(6)}`,
    "",
    "Critical point from gradient:",
    `B*=${criticalPoint.batchSize.toFixed(6)}`,
    `W*=${criticalPoint.workerCount.toFixed(6)}`,
    `Hessian determinant (4df - e^2)=${criticalPoint.determinant.toFixed(6)}`,
    `Classification=${classification}`,
    "",
    "Practical recommendation (clamped to tested ranges):",
    `Batch size=${batchSuggested}`,
    `Worker count=${workerSuggested}`,
    `Predicted throughput=${predictedSuggested.toFixed(6)} records/sec`,
    `Tested range B=[${minBatch}, ${maxBatch}] W=[${minWorker}, ${maxWorker}]`,
  ].join("\n")
}

// Use the directory of this script as the default artifact directory
const DEFAULT_ARTIFACT_DIR = path.resolve(__dirname)

function isThroughputDetailCsv(fileName: string): boolean {
  if (!fileName.endsWith(".csv")) {
    return false
  }
  if (!fileName.startsWith("throughput-")) {
    return false
  }
  return !fileName.includes("-summary") && !fileName.includes("-combination-means")
}

async function findLatestThroughputCsv(): Promise<string> {
  const legacyDir = path.resolve("appendix-math/csv")
  const dirs = [DEFAULT_ARTIFACT_DIR, legacyDir]

  let bestPath: string | null = null
  let bestMtime = 0

  for (const dir of dirs) {
    let files: string[]
    try {
      files = await fs.readdir(dir)
    } catch {
      continue
    }

    for (const file of files) {
      if (!isThroughputDetailCsv(file)) {
        continue
      }
      const full = path.join(dir, file)
      try {
        const stat = await fs.stat(full)
        if (stat.mtimeMs >= bestMtime) {
          bestMtime = stat.mtimeMs
          bestPath = full
        }
      } catch {
        continue
      }
    }
  }

  if (!bestPath) {
    throw new Error(`No throughput-*.csv detail file found in ${DEFAULT_ARTIFACT_DIR} or ${legacyDir}.`)
  }

  return bestPath
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const positionalCsvArg = args.find((arg) => !arg.startsWith("--"))
  const expectedRunsPerComboArg = args.find((arg) => arg.startsWith("--expected-runs="))
  const imputeMissingWithMean = args.includes("--impute-missing-with-mean")

  const expectedRunsPerCombo = expectedRunsPerComboArg
    ? Number.parseInt(expectedRunsPerComboArg.split("=")[1] || "", 10)
    : 3

  if (!Number.isFinite(expectedRunsPerCombo) || expectedRunsPerCombo < 1) {
    throw new Error("Invalid --expected-runs value. Use integer >= 1.")
  }

  const inputCsvPath = positionalCsvArg ? path.resolve(positionalCsvArg) : await findLatestThroughputCsv()
  const csvContent = await fs.readFile(inputCsvPath, "utf8")
  const runs = parseCsvRuns(csvContent)
  const points = aggregateByCombination(runs, expectedRunsPerCombo, imputeMissingWithMean)

  if (points.length < 12) {
    throw new Error("At least 12 benchmark points are required for this artifact.")
  }

  const coefficients = fitQuadraticModel(points)
  const r2 = calculateR2(points, coefficients)
  const criticalPoint = computeCriticalPoint(coefficients)
  const report = buildReport(
    inputCsvPath,
    points,
    coefficients,
    r2,
    criticalPoint,
    expectedRunsPerCombo,
    imputeMissingWithMean
  )

  const meansCsvPath = await writeCombinationMeansCsv(inputCsvPath, points)

  console.log(report)
  console.log(`Combination means CSV: ${meansCsvPath}`)
}

main().catch((error) => {
  console.error("Optimization script failed", error)
  process.exit(1)
})
