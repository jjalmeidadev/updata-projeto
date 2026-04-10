# Inteli - Institute of Technology and Leadership

<p align="center">
<a href= "https://www.inteli.edu.br/"><img src="docs/assets/inteli.png" alt="Inteli - Institute of Technology and Leadership" border="0"></a>
</p>

# Project Name: Updata

## Group Name: Updaters

## 🧑‍🎓 Team Members: 
<table align="center">
  <tr>
    <td align="center">
      <a href="https://www.linkedin.com/in/ana-cristina-jardim/">
        <img src="docs/assets/ana.jpeg"
        style="width:120px; height:120px; object-fit:cover; border-radius:8px;"
        alt="Ana Cristina Jardim"/><br>
        <sub><b>Ana Cristina Jardim</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://www.linkedin.com/in/debora-pereira-nogueira/">
        <img src="docs/assets/debs.jpg"
        style="width:120px; height:120px; object-fit:cover; border-radius:8px;"
        alt="Débora Pereira Nogueira"/><br>
        <sub><b>Débora Pereira Nogueira</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://www.linkedin.com/in/jaimeandradedealmeida/">
        <img src="docs/assets/jaime.jpg"
        style="width:120px; height:120px; object-fit:cover; border-radius:8px;"
        alt="Jaime Andrade de Almeida"/><br>
        <sub><b>Jaime Andrade de Almeida</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://www.linkedin.com/in/matheusferreirads-/">
        <img src="docs/assets/matheus.jpg"
        style="width:120px; height:120px; object-fit:cover; border-radius:8px;"
        alt="Matheus Ferreira da Silva"/><br>
        <sub><b>Matheus Ferreira da Silva</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://www.linkedin.com/in/owen-paimba-sail-5b7ba1327/">
        <img src="docs/assets/owen.jpg"
        style="width:120px; height:120px; object-fit:cover; border-radius:8px;"
        alt="Owen Ahmed Paimba-sail"/><br>
        <sub><b>Owen Ahmed Paimba-sail</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://www.linkedin.com/in/vitor-ribeiro-ms/">
        <img src="docs/assets/vitor.png"
        style="width:120px; height:120px; object-fit:cover; border-radius:8px;"
        alt="Vitor Ribeiro de Mattos"/><br>
        <sub><b>Vitor Ribeiro de Mattos</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://www.linkedin.com/in/yudi-omaki/">
        <img src="docs/assets/yudi.jpg"
        style="width:120px; height:120px; object-fit:cover; border-radius:8px;"
        alt="Yudi Trevisani Omaki"/><br>
        <sub><b>Yudi Trevisani Omaki</b></sub>
      </a>
    </td>
  </tr>
</table>

## 🧑‍🏫 Faculty:
### Supervisor 
- <a href="https://www.linkedin.com/in/hermano-peixoto-1091796/">Hermano Peixoto</a>

### Instructors
- <a href="https://www.linkedin.com/in/jefferson-o-silva/">Jefferson Silva</a>  
- <a href="https://www.linkedin.com/in/ovidio-netto/">Ovidio Netto</a> 
- <a href="https://www.linkedin.com/in/vanunes/">Vanessa Nunes</a> 
- <a href="https://www.linkedin.com/in/henrique-mohallem-paiva-6854b460/">Henrique Paiva</a>
- <a href="https://www.linkedin.com/in/heloisacandello/">Heloisa Candello</a> 
- <a href="https://www.linkedin.com/in/filipe-gon%C3%A7alves-08a55015b/">Filipe Golçalves</a> 
- <a href="https://www.linkedin.com/in/lisane-valdo/">Lisane Valdo</a>

## 📑 Table of Contents

- [📝 Description](#-description)
- [☁️ Cloud Deployment](#link-of-cloud-deploy-on-render)
- [📁 Project Structure](#-project-structure)
  - [1. src](#1-src)
    - [1.1 Presentation Layer](#11-presentation-layer)
      - [1.1.1 web/](#111-web)
      - [1.1.2 api/](#112-api)
    - [1.2 Business Layer](#12-business-layer)
    - [1.3 Data Layer](#13-data-layer)
    - [1.4 Mock Layer](#14-mock-layer)
    - [1.5 Configuration Layer](#15-configuration-layer)
  - [2. tests/](#2-tests)
  - [3. docs/](#3-docs)
  - [4. config/](#4-config)
  - [5. appendix-math/](#5-appendix-math)
- [📛 Naming Conventions](#naming-conventions)
- [🏗 Architectural Rationale](#architectural-rationale)
- [▶️ Running the Application Locally](#️-running-the-application-locally)
  - [Quick Start with Docker](#quick-start-with-docker-recommended)
  - [Manual Local Development](#manual-local-development)
  - [Resetting the Database](#resetting-the-database)
- [🗃 Release History](#-release-history)
- [📋 License](#-license)

## 📝 Description

This project presents the Business Analysis and Requirements Specification for an onboarding intake platform aimed at optimizing customer onboarding within Equiem’s SaaS ecosystem. It documents the problem space, defines functional and non-functional requirements, and outlines an MVP-aligned solution focused on automating data collection, improving validation, and reducing operational friction in the onboarding lifecycle.

## Link of Cloud Deploy on Render

https://g05-frontend.onrender.com

## 📁 Project Structure

This project follows a **Three-Tier Architecture (Presentation, Business, Data)** to ensure clear separation of concerns, maintainability, and scalability.

```
├── appendix-math/
├── config/
├── docs/
├── src/
│   ├── business/
│   ├── config/
│   ├── data/
│   ├── mock-api/
│   ├── presentation/
│   └── server.ts
├── tests/
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── Dockerfile.dev
├── Dockerfile.prod
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
└── vitest.config.ts
```

## 1. src/

The `src/` directory contains all application source code.

```
src/
├── business/
├── config/
├── data/
├── mock-api/
├── presentation/
└── server.ts
```

### 1.1. Presentation Layer

Responsible for handling user interaction and HTTP requests.

```
presentation/
├── api/
└── web/
```

#### 1.1.1. web/

Contains the Angular frontend application.

```
web/
├── src/
│   ├── app/
│   │   ├── animations/
│   │   ├── components/
│   │   ├── models/
│   │   ├── onboarding-form/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── app.config.ts
│   │   ├── app.css
│   │   ├── app.html
│   │   ├── app.routes.ts
│   │   └── app.ts
│   ├── controllers/
│   ├── types/
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── assets/
├── public/
├── angular.json
├── package.json
├── tsconfig.app.json
└── tsconfig.json
```

- **components/** – Reusable UI components.  
- **pages/** – Application routes and views. 
- **assets/** – UI-specific static resources.  

#### 1.1.2. api/

Handles incoming API requests.

```
api/
├── controllers/
├── middleware/
└── routes/      
```

- **controllers/** – Request handlers (entry points for API requests).
- **middleware/** – Cross-cutting request logic (validation, auth, error handling, etc.).
- **routes/** – Route definitions and endpoint mapping.

### 1.2. Business Layer

Contains the core business logic of the middleware.

```
business/
├── dto/
├── entities/
├── queue/
├── services/
├── validators/
└── workers/
```

- **dto/** – Data Transfer Objects  
- **entities/** – Domain entities and business state representation.
- **queue/** – Job publishing logic. 
- **services/** – Orchestrate onboarding workflows.
- **validators/** – Data validation and conflict detection.
- **workers/** – Background processors for asynchronous tasks.

This layer is independent from both the UI and database implementation.

### 1.3. Data Layer

Responsible for data persistence and external integrations.

```
data/
├── database/
├── integrations/
├── models/
└── repositories/    
```

- **database/** –  SQL scripts and database structure/configuration.
- **integrations/** – External API clients (Equiem integration) .
- **models/** – Persistence models. 
- **repositories/** – Data access logic.


### 1.4. Mock Layer

Simulated Equiem API used for safe integration testing.

```
mock-api/
└── server.ts
```

- **server.ts** – Local mock server bootstrap.

### 1.5. Configuration Layer

Responsible for centralized infrastructure and provider configuration used by the application.

```
config/
└── aws-clients.ts
```

- **aws-clients.ts** – Initializes and exports AWS clients (S3 and SQS) using environment variables and shared region setup.

## 2. tests/

Contains unit and integration tests organized by layer.

```
tests/
├── business/                  # Unit tests for entities, queue, services, and workers
├── config/                    # Configuration tests (e.g., AWS clients)
├── data/                      # Tests for repositories, database utilities, and integrations
├── e2e/                       # End-to-end flow tests/scripts
├── mock-api/                  # Tests for the mock API server
├── mocks/                     # Shared mocks and test doubles
├── presentation/              # API and frontend-related tests
├── setup/                     # Shared test setup utilities
└── tsconfig.json              # TypeScript config for test compilation/tooling
```

**Unit tests (backend):** run from the project root with `npm test`. Coverage: `npm run test:coverage`. Strategy, implementation, and coverage are documented in [docs/project.md](docs/project.md) (section 21.1).

## 3. docs/

Contains project documentation, including architecture, standards, data modeling, and project management artifacts.

```
docs/
├── assets/
├── coding-standards.md
├── configuration-management.md
├── database-design.md
├── domain-class.md
├── project-management.md
├── project.md
└── service-blueprint.md
```
 

- **assets/** – Documentation images and visual artifacts.
- **coding-standards.md** – Development and code quality standards.
- **configuration-management.md** – Versioning, branching, and environment management practices.
- **database-design.md** – Database design decisions and structure.
- **domain-class.md** – Domain model and core business classes.
- **project-management.md** – Planning, execution, and management artifacts.
- **project.md** – Overall system and project overview.
- **service-blueprint.md** – Service blueprint and flow mapping.

## 4. config/

Contains application configuration files, because separating configuration from business logic improves flexibility and maintainability.

## 5. appendix-math/

Contains datasets and scripts used for throughput benchmarking, synthetic data generation, and mathematical analysis experiments.

```
appendix-math/
├── csv/
└── scripts/
```

- **csv/** – Input and output datasets used in benchmark and optimization runs.
-**scripts/** – Utilities for data generation, throughput measurement, optimization, and visualization

## Naming Conventions

To ensure consistency, readability, and maintainability across the project, the following naming conventions were adopted.

- Kebab-case is used for all folder and file names (e.g., user-controller.ts, mock-api/);

- Folder names are strictly descriptive and responsibility-based;

- File names reflect their architectural layers or functional roles.

## Architectural Rationale

This directory structure was designed to:

- Enforce separation of concerns;  
- Support scalability and modular growth; 
- Enable clear dependency flow;  
- Facilitate testing and maintainability; 
- Align with Three-Tier architectural principles.  

The exact dependency flow of the src/ directory is:

```
Presentation Layer → Business Layer → Data Layer
```

### ▶️ Running the Application Locally

Follow the steps below to run the full application on your machine.

---

### Quick Start with Docker (Recommended)

### Prerequisites
- Docker Desktop
- Docker Compose

1. **Clone and open the project root**

```bash
git clone https://git.inteli.edu.br/graduacao/2026-1a/t17/g05.git
cd g05
```

2. **Configure environment variables**

Create `config/.env` using `config/.env.example` as reference and fill all required values (`DB_*`, `AWS_*`, `FRONTEND_BASE_URL`, and optional `EQUIEM_*` / SMTP values).

Important for this project:
- You must set `AWS_SESSION_TOKEN=` in `config/.env`.
- Set `FRONTEND_BASE_URL` to the public URL used by the frontend so onboarding links are generated correctly.
- If you want onboarding invite emails to be sent automatically, configure the SMTP variables (`ONBOARDING_SMTP_*` and `ONBOARDING_EMAIL_FROM`).
- This project uses AWS Academy Lab (free learning environment), which provides temporary AWS credentials and some service limitations.
- Because credentials are temporary, refresh `AWS_SESSION_TOKEN` when it expires.

3. **Start the development stack**
```sh
npm run stage:up:dev
```

Note: the first startup can take a few minutes while Docker pulls images and initializes the containers. If the services or environment values do not appear immediately, wait a bit and refresh before assuming something is broken.

4. **Open the application**
- http://localhost:4200/login

5. **Run the upload worker** (required for upload/background flows). Open a separate terminal:
```sh
docker compose -f docker-compose.dev.yml exec backend npm run worker:upload
```

6. **Stop the containers**
Only run this command after you are done using the system. This step stops and removes the containers that were started earlier.
```sh
docker compose -f docker-compose.dev.yml down
```

- Dev stack config: docker-compose.dev.yml
- Production stack config: docker-compose.prod.yml
- Helper scripts: package.json

---

### Manual Local Development

Prerequisites:

  - Node.js (recommended LTS)
  - npm
  - PostgreSQL
  - Available ports: 3000 (API) and 4200 (Frontend)

1. **Clone and open the project root**
    ```sh
    git clone https://git.inteli.edu.br/graduacao/2026-1a/t17/g05.git

    cd g05
    ```
2. **Install backend dependencies (project root)**
    ```sh
    npm install
    ```
3. **Install frontend dependencies**
   ```sh
    cd src/presentation/web
    npm install
    cd ../../..
   ```
4. **Configure environment variables**

- Create `config/.env` using `config/.env.example` as reference.
- Set all required values (`DB_*`, `AWS_*`, `FRONTEND_BASE_URL`, and optional `EQUIEM_*` / SMTP values).
- Required for upload and background processing: set `AWS_SESSION_TOKEN=`.
- Set `FRONTEND_BASE_URL` to the public frontend URL if you want onboarding links to be generated without `localhost`.
- Configure the SMTP variables if you want automatic invitation emails to be sent to the allowed recipients.
- This value is mandatory because the project uses AWS Academy Lab, where credentials are temporary and must be renewed periodically.

5. **Configure and start PostgreSQL**
- Create a database matching `DB_DATABASE` from `config/.env`.
- Run:
    - [01_create_database.sql](./src/data/database/01_create_database.sql)
    - [02_initial_data.sql](./src/data/database/02_initial_data.sql)

6. **Start backend API (terminal 1, project root)**
   ```sh
    npm run dev
   ```

7. **Start Angular frontend (terminal 2)**
   ```sh
   cd src/presentation/web
   npm start
   ```
Frontend will run at:
- http://localhost:4200/login

8. **Start upload worker (terminal 3, project root)**
```sh
npm run worker:upload
```

The worker is required for upload/background processing flows.

Notes:

- Keep all three processes running: backend, frontend, and worker.
- If something fails, first check dependency installation and port availability.

For test runs:
- Backend unit tests: npm test
- Backend coverage: npm run test:coverage
- Frontend tests:

```sh
cd src/presentation/web
npm test
```

### Resetting the Database

If you need to reset the schema:

- Run [03_rollback.sql](./src/data/database/03_rollback.sql)
- Then run [01_create_database.sql](./src/data/database/01_create_database.sql)
- Then run [02_initial_data.sql](./src/data/database/02_initial_data.sql)


## 🗃 Release History

* 1.0.0 - 10/04/2026 
    * Project Development And Test Execution
    * Evolutionary Project Management
    * Project Finalization And Final Presentation
* 0.6.0 - 27/03/2026 
    * Project Development
    * Test Execution And Analysis
    * Evolutionary Project Management And Financial Viability Analysis
    * Analytic Optimization Of System Throughput
* 0.3.1 - 13/03/2026  
    * Technical Infrastructure And Deployment Mapping
    * Database Implementation
    * Project Development
    * Test Planning
    * Evolutionary Project Management
* 0.2.7 - 27/02/2026 
    * Technical Solution (Design)
    * Data Modeling
    * Solution Visual Design
    * Evolutionary Project Management
* 0.1.3 - 13/02/2026 
    * Project And Business Understanding
    * Functional And Non-Functional Requirements Specification
    * Evolutionary Project Management And Configuration Management
    
## 📋 License

<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"><p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/">**PROJECT NAME** by </a><a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https://github.com/Intelihub">Inteli</a>, <a href="https://www.linkedin.com/in/ana-cristina-jardim/">Ana Cristina</a>, <a href="https://www.linkedin.com/in/debora-pereira-nogueira/">Débora Pereira Nogueira</a>, <a href="https://www.linkedin.com/in/jaimeandradedealmeida/">Jaime Andrade de Almeida</a>, <a href="https://www.linkedin.com/in/vitor-ribeiro-ms/">Vitor Ribeiro</a>, <a href="https://www.linkedin.com/in/matheusferreirads-/">Matheus Ferreira da Silva</a>, <a href="https://www.linkedin.com/in/owen-paimba-sail-5b7ba1327/">Owen Ahmed Robert Paimba-sail</a>, </a> is licensed under <a href="http://creativecommons.org/licenses/by/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">Attribution 4.0 International</a>.</p>
