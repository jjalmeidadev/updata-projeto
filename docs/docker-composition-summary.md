# Docker Composition Summary

## Purpose
This document summarizes the current Docker composition structure for the project, explains the function of each Docker and Compose file, and clarifies the rationale behind image choices under constrained resources (128 MB RAM and 0.5 vCPU per service).

## Compose Files

### Development
Defined in [src/docker-compose.dev.yml](src/docker-compose.dev.yml).

1. backend: built from [src/business/docker-file.dev](src/business/docker-file.dev), mapped to port 3000.
2. frontend: built from [src/presentation/docker-file.dev](src/presentation/docker-file.dev), mapped to port 4200.
3. postgres: postgres 16 alpine image, mapped to 5432.
4. Volumes: source and node_modules mounts for live development behavior.
5. Limits: mem_limit 128m and cpus 0.50 on all services.

### Staging
Defined in [src/docker-compose.stag.yml](src/docker-compose.stag.yml).

1. backend: built from [src/business/docker-file.stag](src/business/docker-file.stag).
2. frontend: built from [src/presentation/docker-file.stag](src/presentation/docker-file.stag).
3. postgres: internal staging database with persistent volume.
4. Limits: mem_limit 128m and cpus 0.50 on all services.

### Production
Defined in [src/docker-compose.prod.yml](src/docker-compose.prod.yml).

1. backend: built from [src/business/docker-file.prod](src/business/docker-file.prod).
2. frontend: built from [src/presentation/docker-file.prod](src/presentation/docker-file.prod).
3. postgres: activated by profile.
4. Limits: mem_limit 128m and cpus 0.50 on all services.

### Test
Defined in [src/docker-compose.test.yml](src/docker-compose.test.yml).

1. tests: built from [src/business/docker-file.dev](src/business/docker-file.dev), runs npm run test (Vitest through root package script).
2. postgres: isolated test database.
3. Purpose: reproducible test runs.
4. Limits: mem_limit 128m and cpus 0.50 on both services.

## Backend Dockerfiles

### Development Backend
File: [src/business/docker-file.dev](src/business/docker-file.dev).

1. Base image: node 20 alpine.
2. Installs dependencies with npm ci.
3. Copies source and runs development command.
4. Sets NODE_OPTIONS memory cap and runs as non-root node user.
5. Includes healthcheck.

### Staging Backend
File: [src/business/docker-file.stag](src/business/docker-file.stag).

1. Multi-stage structure: deps stage and runtime stage.
2. Installs runtime dependencies with npm ci omit dev.
3. Adds tsx to execute TypeScript entrypoint directly.
4. Copies only required runtime files into final stage.
5. Runs as non-root with healthcheck and memory cap.

### Production Backend
File: [src/business/docker-file.prod](src/business/docker-file.prod).

1. Multi-stage structure regarding staging.
2. Runtime dependencies only, plus tsx for TypeScript entrypoint execution.
3. Non-root runtime, healthcheck, and memory cap.

## Frontend Dockerfiles

### Development Frontend
File: [src/presentation/docker-file.dev](src/presentation/docker-file.dev).

1. Base image: node 20 alpine.
2. Installs frontend dependencies in container.
3. Runs Angular dev server on 4200.
4. Enables memory cap for stable containerized behavior.

### Staging Frontend
File: [src/presentation/docker-file.stag](src/presentation/docker-file.stag).

1. Multi-stage build with node 20 alpine for build stage.
2. Runtime stage uses nginx 1.27 alpine.

### Production Frontend
File: [src/presentation/docker-file.prod](src/presentation/docker-file.prod).

1. Same build and runtime pattern as staging.
2. Uses nginx alpine runtime for lightweight static serving.
3. Includes healthcheck endpoint for orchestration monitoring.

## Docker Ignore Strategy
Defined in [/.dockerignore](.dockerignore).

1. Excludes non-runtime directories and files such as docs, tests, coverage, local logs, editor artifacts, and local env files.
2. Reduces build context size and improves build speed.
3. Helps reduce unnecessary memory use during build in constrained environments.

## Image Choice Line of Thought

1. node 20 alpine for backend and frontend build stages:
- small load compared to full Linux variants.
- fast startup.

2. nginx alpine for frontend runtime:
- lower runtime resource usage for assets than running a Node web server.

3. postgres 16 alpine:
- smaller variant for local, staging, and test DB use.
- consistent behavior across environments with minimal image size.

## Operational Notes

1. All compose files enforce limits of 128 MB RAM and 0.5 vCPU.
2. Frontend container build requires package.json and package-lock.json in [src/presentation/web](src/presentation/web).
3. Test stack uses tmpfs for postgres data to keep tests ephemeral.
