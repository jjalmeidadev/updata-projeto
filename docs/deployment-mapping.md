<!-- omit in toc -->
# Deployment Architecture

## Table of Contents

- [1. Overview](#1-overview)
- [2. System Infrastructure](#2-system-infrastructure)
- [3. Frontend Deployment](#3-frontend-deployment)
- [4. Backend Deployment](#4-backend-deployment)
- [5. Messaging Infrastructure](#5-messaging-infrastructure)
- [6. Worker Processing Layer](#6-worker-processing-layer)
- [7. Database Layer](#7-database-layer)
- [8. Authentication Service](#8-authentication-service)
- [9. Communication Protocols](#9-communication-protocols)
- [10. Deployment Rationale](#10-deployment-rationale)
- [11. Performance Considerations](#11-performance-considerations)
- [12. Security Considerations](#12-security-considerations)

# 1. Overview

The deployment diagram represents the **target production architecture** of the onboarding automation platform developed in partnership with Equiem.

The diagram illustrates how the system components are distributed across cloud infrastructure resources and how different services interact within the production environment. It presents the servers, middleware, services, and databases required to operate the system, as well as the communication protocols used between them.

The architecture follows a **distributed cloud-based deployment model**, separating the system into distinct layers responsible for presentation, application logic, asynchronous processing, and data persistence.

The main components of the architecture include:

- Web browser interface used by onboarding specialists
- Frontend web application deployed on cloud infrastructure
- Backend API services responsible for business logic
- Messaging infrastructure supporting asynchronous processing
- Worker services responsible for data processing tasks
- Managed relational database infrastructure
- External authentication services

This architecture reflects the intended deployment of the system in a production environment, supporting scalability, modularity, and maintainability.

Figure 1 illustrates the deployment architecture of the onboarding automation platform.

For better visualization, please access the following [link](https://drive.google.com/file/d/1jHnyVEm3KI1-ERu1pNhjq-7KT3i-hlVW/view?usp=sharing).

<div align="center">
<sub>FIGURE 1 – Deployment Architecture Diagram</sub><br>
  <img src="assets/deployment_map.svg" width="100%" alt="Deployment Architecture Diagram"><br>
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

# 2. System Infrastructure

The system is deployed using cloud infrastructure services provided by **Amazon Web Services (AWS)**.

Different infrastructure nodes are used to host specific components of the system, allowing the architecture to remain modular and scalable.

The main infrastructure elements are:

| Infrastructure Component | Description |
|--|-|
| AWS EC2 (Frontend) | Hosts the web application frontend |
| AWS EC2 (Backend) | Hosts backend API services |
| AWS EC2 (Worker) | Hosts background worker services responsible for asynchronous processing |
| Amazon RDS | Managed relational database service used for persistent storage |
| Amazon SQS | Messaging middleware responsible for asynchronous job processing |
| Auth0 Cloud Service | External authentication and identity management provider |

All application services are deployed using **Docker containers**, ensuring consistent runtime environments and simplifying deployment and infrastructure management.

# 3. Frontend Deployment

The frontend application is deployed on an **AWS EC2 instance** within a Docker container environment.

The frontend is implemented using **Angular and TypeScript**, forming a single-page application responsible for presenting the onboarding interface used by administrators and onboarding specialists.

The frontend node contains the following components:

| Component | Description |
|-|-|
| Angular + TypeScript | Core frontend application responsible for rendering the onboarding UI |
| Static Assets | Compiled JavaScript files, stylesheets, and other UI resources |

Users interact with the system through a web browser. Requests are sent through the internet to the frontend server using **secure HTTPS connections**.

The frontend communicates with backend services through HTTPS API requests.

# 4. Backend Deployment

The backend application is deployed on a dedicated **AWS EC2 instance**, also running within a Docker container.

The backend follows a **layered architecture** that separates responsibilities into logical modules responsible for handling API requests, business logic, and database interaction.

The backend node includes the following components:

| Component | Responsibility |
|-|-|
| Controller Layer | Handles incoming HTTP requests and exposes REST API endpoints |
| Service Layer | Implements business logic and system workflows |
| Repository Layer | Handles database access and persistence operations |
| HubSpot Integration Module | Retrieves deal information and enabled modules |
| Equiem Integration Module | Prepares structured onboarding data for system integration |
| Queue Publisher | Sends asynchronous processing jobs to Amazon SQS |

This layered design improves maintainability, separation of concerns, and long-term system extensibility.

# 5. Messaging Infrastructure

The system incorporates **Amazon Simple Queue Service (SQS)** as a messaging middleware to support asynchronous processing.

When operations require heavy data processing, such as parsing uploaded onboarding files or validating large configuration datasets, the backend publishes job messages to the SQS queue.

The queue acts as a decoupling mechanism between the API layer and background processing services.

Using a messaging infrastructure provides several architectural benefits:

- decoupling between system components
- improved system scalability
- support for asynchronous workflows
- improved system reliability through retry mechanisms

This architecture prevents long-running operations from blocking API responses and improves overall system responsiveness.


# 6. Worker Processing Layer

The architecture includes a **worker processing layer** responsible for executing asynchronous data processing tasks.

Worker services are deployed on a separate AWS EC2 node within Docker containers.

These worker services consume messages from the SQS queue and execute the necessary processing tasks.

The worker node includes the following components:

| Component | Responsibility |
|-|-|
| Job Consumer | Retrieves job messages from the SQS queue |
| File Processor | Parses uploaded CSV or XLSX onboarding files |
| Data Standardizer | Transforms and standardizes onboarding data structures |

This architecture allows heavy processing operations to be handled independently from the main application services.

Separating the processing layer from the API layer improves system scalability and ensures that the main application remains responsive even when processing large onboarding datasets.


# 7. Database Layer

The system uses **Amazon Relational Database Service (RDS)** as the primary database infrastructure.

The database is responsible for storing all persistent system data, including:

- onboarding configuration data
- uploaded dataset information
- validation results
- processing states
- system metadata

The backend communicates with the database using **TCP/IP connections**, following standard relational database communication protocols.

Using a managed database service provides operational advantages such as:

- automated backups
- improved reliability
- built-in monitoring
- simplified infrastructure management

# 8. Authentication Service

User authentication and identity management are handled by **Auth0**, a cloud-based authentication platform.

Auth0 provides identity services using **OAuth 2.0 and OpenID Connect protocols**.

When a user attempts to access the onboarding platform, the frontend redirects the authentication request to Auth0. After successful authentication, Auth0 returns a secure token used by the frontend to authenticate API requests.

The backend validates authentication tokens using **JWT validation**, ensuring that only authorized users can access protected system endpoints.

This architecture eliminates the need to implement custom authentication mechanisms while maintaining a high level of security.

# 9. Communication Protocols

System components communicate using secure and reliable communication protocols.

| Source | Destination | Protocol | Purpose |
|--------|-------------|----------|---------|
| User Browser | Internet / Frontend Server | HTTPS | Access to the onboarding web interface |
| Frontend Application | Backend API | HTTPS | Communication with backend services |
| Frontend Application | Auth0 | HTTPS (OAuth2 / OpenID Connect) | User authentication and login flow |
| Backend API | Auth0 | HTTPS (JWT Validation) | Verification of authentication tokens |
| Backend API | Amazon SQS | HTTPS (AWS SDK) | Publishing asynchronous processing jobs |
| Worker Service | Amazon SQS | HTTPS (AWS SDK Polling) | Consuming background processing jobs |
| Backend API | Amazon RDS | TCP/IP | Database communication |

All external communications use HTTPS to ensure encrypted data transmission.

# 10. Deployment Rationale

- The deployment architecture was designed to ensure scalability, modularity, and long-term maintainability of the onboarding automation platform.
- Separating frontend, backend, and worker services into independent infrastructure nodes allows the system to scale horizontally as demand increases.
- Containerization using Docker ensures consistent execution environments across development, testing, and production environments.
- The use of Amazon SQS enables asynchronous processing of heavy workloads, preventing computationally intensive operations from blocking the main application workflow.
- Amazon RDS provides a reliable and managed database environment that reduces operational overhead while maintaining high availability and durability.
- External authentication services such as Auth0 provide secure identity management while reducing development complexity.

# 11. Performance Considerations

- The deployment architecture addresses performance-related non-functional requirements by separating processing responsibilities across multiple components.
- The asynchronous processing model enabled by Amazon SQS allows the system to process large onboarding datasets without impacting API responsiveness.
- Worker services handle computationally intensive tasks independently, allowing the backend API to remain responsive to user interactions.
- Additionally, containerized services allow horizontal scaling of backend and worker nodes when processing demand increases.
- This architecture ensures efficient handling of onboarding workflows even when large datasets are uploaded.

# 12. Security Considerations

- Security is a fundamental aspect of the deployment architecture.
- All communication between system components occurs through **HTTPS**, ensuring encrypted data transmission across the network.
- Authentication and identity management are handled through Auth0 using OAuth 2.0 and OpenID Connect protocols.
- The backend validates JWT tokens to ensure that only authenticated users can access system functionality.
- Using managed AWS infrastructure also provides additional security mechanisms, including network isolation, access policies, and infrastructure-level protections.