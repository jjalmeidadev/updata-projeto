# Configuration Management

## Table of Contents
1. [Software Configuration Management Strategy](#1-software-configuration-management-strategy)
2. [GitFlow Implementation](#2-gitflow-implementation)
3. [Branch Creation Procedures](#3-branch-creation-procedures)
4. [Branch Creation Policies](#4-branch-creation-policies)
5. [Configuration Management Practices](#5-configuration-management-practices)

## 1. Software Configuration Management Strategy

This document describes how Software Configuration Management (SCM) is implemented in this project.
Our team adopts **GitFlow** as the branching strategy together with **Conventional Commits** to ensure traceability, standardization, and organized collaboration throughout the software lifecycle.

This approach allows us to manage features, documentation, releases, and hotfixes in a controlled and scalable manner.


## 2. GitFlow Implementation

The repository is structured according to the GitFlow model, with the following branches:

### Main Branches

### `main`

* Contains production-ready code only
* Always stable

### `develop`

* Integration branch for ongoing development
* Receives completed features

### Supporting Branches

### `feature/`

* Used for developing new features
* Created from: `develop`
* Merged back into: `develop`

Example:

```
feature/user-authentication
```

---

### `docs/`

* Used for documentation creation or updates
* Created from: `develop`
* Merged back into: `develop`

Example:

```
docs/update-onboarding-guide
```

---

### `chore/`

* Used for maintenance tasks and small improvements that are not new features
* Examples: repository cleanup, tooling updates, refactors, formatting, dependency updates
* Created from: `develop`
* Merged back into: `develop`

Example:

```
chore/update-files-structure
```

---

### `release/`

* Used to prepare a new production version
* A new release branch is created for each version
* Created from: `develop`
* Merged into: `main` and `develop`

Example:

```
release/1.2.0
```

---

### `hotfix/`

* Used for urgent production fixes
* Created from: `main`
* Merged into: `main` and `develop`

Example:

```
hotfix/login-critical-fix
```

All release and hotfix integrations follow the full GitFlow lifecycle:

```
creation → stabilization → MR into main → merge-back into develop → version tagging → branch deletion
```

## 3. Branch Creation Procedures

Branches can be created using an IDE interface or via the terminal. Since the terminal approach can be used across different environments, the procedures below describe how to manage branches through the command line.

### Create a branch

```
git checkout develop
git checkout -b <branch-name>
```

Example:

```
git checkout -b feature/payment-integration
```

### Delete a branch

Local deletion:

```
git branch -d <branch-name>
```

Remote deletion:

```
git push origin --delete <branch-name>
```

### Merge a branch

Local merges via terminal are not allowed for integration into protected branches.

All integrations into `develop` and `main` must occur exclusively through GitLab Merge Requests.

## 4. Branch Creation Policies

To maintain organization and follow GitFlow standards, branch naming conventions are mandatory.

### Naming Pattern

```
<tag>/<short-description>
```

Descriptions must:

* Be written in English
* Use hyphens instead of spaces
* Clearly describe the change

---

### Available Tags

### `feature`

Creation of new system features.

Example:

```
feature/user-dashboard
```

---

### `chore`

Minor maintenance tasks that do not directly impact business logic.

Examples:

* Dependency updates
* Config adjustments
* Refactoring without behavior change

Example:

```
chore/update-eslint-config
```

---

### `docs`

Documentation creation or updates.

Examples:

* ProjectManagement.md updates
* README improvements
* Process documentation

Example:

```
docs/expand-business-flow
```

## 5. Configuration Management Practices

To ensure evolutionary project management and configuration control, the team adopts the following practices:

### Version Control

- All code and documentation are stored in GitLab
- Changes must occur through branches
- Direct commits to `main` and `develop` are prohibited

### Merge Requests (MR)

All integrations must occur through Merge Requests (MR) in GitLab.

- Mandatory for merges into:
  - `develop`
  - `main`

Each MR must include:

- Description of changes
- Linked task or issue
- Evidence of completion (artifact, diagram, or document update)

At least one reviewer approval is required before merge.

### Commit Standard

We follow **Conventional Commits** and require clear, descriptive messages.

Guidelines:

* Always use a valid **type tag** (e.g., `feat`, `fix`, `docs`, `chore`, `refactor`, `test`).
* Write a short description that clearly states *what changed* (imperative mood).

Examples:

```
feat: add onboarding validation
fix: correct login error
docs: update project documentation
chore: update dependencies
```

This ensures traceability and readable history.

### Release and Hotfix Lifecycle

#### Release Flow

- Release branches are created from `develop`

Example: release/1.0.0


- Used only for stabilization:
  - Minor fixes
  - Documentation adjustments

- A Merge Request is opened targeting:

  - `main`
  - `develop` (merge-back)

After approval:

- Merged into `main`
- Version tag created

Example: v1.0.0


- Merged back into `develop`
- Release branch deleted

---

#### Hotfix Flow

- Hotfix branches are created from `main`

Example: hotfix/login-fix


- Fix implemented
- Merge Request opened targeting:

  - `main`
  - `develop`

After approval:

- Merged into `main`
- Patch version tag created

Example: v1.0.1

- Merged back into `develop`
- Hotfix branch deleted

#### Version Tagging

All releases and hotfixes are versioned using semantic versioning.

## 6. Conclusion

By adopting GitFlow, Conventional Commits, and structured branch policies, the team ensures:

* Organized development flow
* Safe production releases
* Clear documentation management
* Scalable collaboration practices

This model supports both technical delivery and academic project governance requirements, making sure our project is aligned with project management requirements.

---
