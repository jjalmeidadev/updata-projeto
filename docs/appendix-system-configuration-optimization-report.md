# Appendix A: System Configuration and Optimization Report

## 1. Objective
This appendix determines the optimal values of:
- Batch Size (B): rows processed per transaction chunk
- Worker Count (W): number of parallel worker consumers

Optimization target: maximize measured throughput T in records/second.

## 2. Benchmark Setup
- Dataset: fixed file with approximately 50,000 rows
- API endpoint: POST /api/upload
- Queue: AWS SQS
- Worker mode: benchmark mode can skip external send to isolate ingestion and persistence throughput
- Measurement source: PostgreSQL tables `onboarding_batch`, `processing_job`, and `onboarding_payload`

Environment values used:
- BENCHMARK_BATCH_SIZES=
- BENCHMARK_WORKER_COUNTS=
- BENCHMARK_RUNS_PER_COMBINATION=
- BENCHMARK_DATASET_PATH=
- BENCHMARK_API_UPLOAD_URL=

## 3. Test Matrix and Raw Results
Run at least 12 combinations:
- Suggested default matrix: B in {1, 3, 5, 10}, W in {1, 2, 4}

Generated raw file:
- benchmark-results/throughput-YYYY-MM-DDTHH-MM-SS-sssZ.csv

Paste a summary table (one line per run):
| B | W | run | row_count | elapsed_seconds | throughput_records_per_sec |
|---|---|-----|-----------|-----------------|----------------------------|
|   |   |     |           |                 |                            |

## 4. Quadratic Regression Model
Model fitted to real benchmark data:
T(B, W) = a + bB + cW + dB^2 + eBW + fW^2

Estimated coefficients from script output:
- a =
- b =
- c =
- d =
- e =
- f =
- R2 =

## 5. Multivariable Calculus Optimization
Partial derivatives:
- dT/dB = b + 2dB + eW
- dT/dW = c + eB + 2fW

Critical point is found by solving:
- b + 2dB + eW = 0
- c + eB + 2fW = 0

From script result:
- B* =
- W* =
- Hessian determinant (4df - e^2) =
- Classification (max/min/saddle) =

## 6. Engineering Decision
Recommended production configuration (bounded by tested range and operational constraints):
- Batch Size (B) =
- Worker Count (W) =

Justification:
- Predicted throughput at recommendation =
- Observed throughput around recommendation =
- Stability considerations (lock contention, memory, queue drain behavior) =

## 7. Reproducibility Commands
1. Run API and infrastructure (S3/SQS/DB) according to project setup.
2. Execute benchmarks:

```bash
npm run benchmark:throughput
```

3. Fit model and derive optimum:

```bash
npm run benchmark:optimize
```

4. Attach both generated files to project documentation:
- throughput CSV in benchmark-results
- optimization markdown report in benchmark-results

## 8. Risks and Validity Notes
- Throughput may vary with CPU contention and cloud latency.
- If external API is included in measurement, isolate this in discussion because it can dominate ingestion throughput.
- Re-run matrix and compare confidence if variance is high.
