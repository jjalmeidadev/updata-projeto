# Project Management

This document describes the project management practices adopted by the team, including sprint analysis, sprint planning, and development workflow policies.

---

# 1. Current Sprint Analysis

## Strengths

- The team maintained good communication during development.
- Tasks were well distributed, allowing better visibility of sprint progress.
- Pull Requests were properly reviewed and commented on before being merged, improving code quality.

## Weaknesses

- Some tasks were started without a fully defined scope.
- Integration tasks took longer than expected.
- The team did not maintain good organization within the GitLab Kanban board.

## Improvement Actions

To improve the next sprint, the team will adopt the following actions:

- Ensure that all tasks meet the **Definition of Ready (DoR)** before starting development.
- Assign clear responsibilities for each task.
- Standardize task descriptions and move them across the board at the correct time.

## Risk Analysis

| Risk | Impact | Mitigation Strategy |
|-----|-----|-----|
| Delay in screen integration | High | Assign a responsible developer and test early |
| Poor communication between team members | Medium | Maintain daily meetings |
| Code conflicts in the repository | Medium | Enforce Pull Request reviews |

## Risk Tracking Mechanism

Risks will be tracked using the project management board and reviewed during sprint planning meetings.

# 2. Next Sprint Planning

The next sprint will focus on the incremental development of the software solution, including backend and frontend implementation, database evolution, testing, and documentation. The team will follow the **T-shirt sizing method** to estimate the complexity and effort required for each task.

| Task | Description | Type | Size | Definition of Ready | Definition of Done |
|-----|-----|-----|-----|-----|-----|
| Coding Architecture Documentation | Define and document the system architecture and directory structure of the project | Documentation | M | Project structure defined | Architecture documented in Projeto.md with structure explanation |
| Backend Feature Development | Implement backend functionalities using Node.js and TypeScript | Feature | L | Requirements defined and endpoints planned | Backend features implemented and integrated |
| Frontend Feature Development | Implement frontend components using Angular and TypeScript | Feature | L | UI requirements defined | Components implemented and integrated with backend |
| Auth0 Authentication Integration | Implement login functionality using Auth0 service | Feature | M | Auth0 credentials configured | Authentication working correctly in the application |
| Unit Test Implementation | Create unit tests for critical backend services | Test | M | Core functionalities implemented | Tests executed successfully with passing results |
| Database Evolution | Update database scripts including create_database.sql, initial_data.sql, and rollback.sql | Database | M | Database changes defined | Scripts updated and stored in src/database |
| Data Dictionary Update | Update the data dictionary with new tables, relationships, and constraints | Documentation | S | Database schema defined | Dictionary updated and documented |
| Deployment and Configuration Documentation | Document database setup and deployment instructions | Documentation | S | Database scripts finalized | Deployment instructions added to README.md |
| Coding Standards Documentation | Define coding standards and design patterns used in the project | Documentation | S | Team agreement on coding standards | Standards documented in GuiaPadroesDesenvolvimento.md |
| Functional and NFR Testing | Execute functional and non-functional tests according to the test plan | Test | M | Features implemented | Tests executed and results documented |
| Usability Testing | Conduct usability tests with external users and document feedback | Test | S | Interface ready for testing | Results and improvements documented in Projeto.md |
| Video Evidence of Execution | Record a video showing the application running and the VSCode console | Documentation | XS | Application running locally | Video recorded and added as evidence |

## Definition of Ready (DoR)

A task is considered ready when:

- Requirements are clearly defined  
- Dependencies are identified  
- Acceptance criteria are documented  

## Definition of Done (DoD)

A task is considered completed when:

- Code is implemented  
- Code is reviewed through a Pull Request  
- Tests are passing  
- Documentation is updated when necessary  

# 3. Group Development Process Management

## Daily Meetings

Daily meetings are conducted to maintain team alignment and identify blockers.

Each team member answers:

- What did I do yesterday?
- What will I do today?
- Is there any blocker?

The daily meeting lasts approximately **10–15 minutes**.

---

## GitHub Usage Policy

The team follows the following rules for repository management:

- No direct commits to the **main** branch
- All changes must be submitted through **Pull Requests**
- At least one team member must review the Pull Request before merging
- Code must be functional before approval

---

## Commit Policy

The project adopts **Conventional Commits** to standardize commit messages.

## Format:

type(scope): description


## Examples:


- feat(api): add user registration endpoint
- fix(auth): resolve login validation bug
- docs(readme): update project documentation
- test(api): add unit tests for service layer


#### This approach improves readability of the commit history and facilitates project tracking.