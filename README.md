# Inteli - Institute of Technology and Leadership

<p align="center">
<a href= "https://www.inteli.edu.br/"><img src="docs/assets/inteli.png" alt="Inteli - Institute of Technology and Leadership" border="0"></a>
</p>

# Project Name

## Group Name

## 🧑‍🎓 Team Members: 
- <a href="https://www.linkedin.com/in/ana-cristina-jardim/">Ana Cristina Alves Jardim</a>
- <a href="https://www.linkedin.com/in/debora-pereira-nogueira/">Débora Pereira Nogueira</a>
- <a href="https://www.linkedin.com/in/jaimeandradedealmeida/">Jaime Andrade de Almeida</a>
- <a href="https://www.linkedin.com/in/matheusferreirads-/">Matheus Ferreira da Silva</a>
- <a href="https://www.linkedin.com/in/owen-paimba-sail-5b7ba1327/">Owen Ahmed Robert Paimba-sail</a>
- <a href="https://www.linkedin.com/in/vitor-ribeiro-ms/">Vitor Ribeiro de Mattos</a>
- <a href="https://www.linkedin.com/in/yudi-omaki/">Yudi Nakamura Trevisani Omaki</a>

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

## 📝 Description

This project presents the Business Analysis and Requirements Specification for an onboarding intake platform aimed at optimizing customer onboarding within Equiem’s SaaS ecosystem. It documents the problem space, defines functional and non-functional requirements, and outlines an MVP-aligned solution focused on automating data collection, improving validation, and reducing operational friction in the onboarding lifecycle.

## 📁 Project Structure

This project follows a **Three-Tier Architecture (Presentation, Business, Data)** to ensure clear separation of concerns, maintainability, and scalability.

```
│
├── src/
│ ├── presentation/
│ ├── business/
│ ├── data/
│ └── mock-api/
|
├── tests/
├── docs/
├── config/
└── README.md
```

## 1. src/

The `src/` directory contains all application source code.

```
src/
├── presentation/
├── business/
├── data/
└── mock-api/
```

### 1.1. Presentation Layer

Responsible for handling user interaction and HTTP/GraphQL requests.

```
presentation/
├── web/
└── api/
```

#### 1.1.1. web/

Contains the **Next.js frontend application**.

```
web/
├── components/  
├── pages/        
└── assets/     
```

- **components/** – Reusable UI components  
- **pages/** – Application routes and views  
- **assets/** – UI-specific static resources  

#### 1.1.2. api/

Handles incoming API requests.

```
api/
├── controllers/     
└── routes/         
```

- **controllers/** – Request handlers (entry points for HTTP/GraphQL requests)  
- **routes/** – Route definitions and endpoint mapping  

### 1.2. Business Layer

Contains the core business logic of the middleware.

```
business/
├── services/      
├── validators/  
├── queue/        
├── workers/      
└── dto/           
```

- **services/** – Orchestrate onboarding workflows  
- **validators/** – Data validation and conflict detection  
- **queue/** – Job publishing logic  
- **workers/** – Background processors for asynchronous tasks  
- **dto/** – Data Transfer Objects  

This layer is independent from both the UI and database implementation.


### 1.3. Data Layer

Responsible for data persistence and external integrations.

```
data/
├── models/            
├── repositories/       
├── database/           
└── integrations/      
```

- **models/** – TypeORM entities  
- **repositories/** – Data access logic  
- **database/** – Database configuration and connection setup  
- **integrations/** – External API clients (Equiem integration)  


### 1.4. mock-api/

Simulated Equiem GraphQL server used for safe integration testing.

```
mock-api/
├── schema/
└── resolvers/
```

- **schema/** – GraphQL type definitions that simulate the external Equiem API structure.

- **resolvers/** – Mock implementation logic for queries and mutations, returning simulated responses.

## 2. tests/

Contains unit and integration tests organized by layer.

```
tests/
├── presentation/
├── business/
└── data/
```

## 3. docs/

Contains project documentation.

```
docs/
├── assets/                         
├── Project.md
├── ProjectManagement.md
└── ConfigurationManagement.md
```
 
- **assets/** – Documentation images
- **Project.md** – System overview
- **ProjectManagement.md** – Sprint planning and analysis
- **ConfigurationManagement.md** – Versioning strategy, branching model, and environment configuration  

## 4. config/

Contains application configuration files, because separating configuration from business logic improves flexibility and maintainability.

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
