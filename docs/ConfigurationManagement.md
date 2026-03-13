# Configuration Management

This document defines the configuration management practices adopted in the project repository.

---

# Branching Strategy

The project follows a **GitFlow-inspired branching strategy** to organize development activities.

## Branch Structure

| Branch | Purpose |
|------|------|
| main | Stable production-ready version |
| develop | Integration branch for development |
| feature/* | Development of new features |
| release/* | Preparation of a new release |
| hotfix/* | Urgent fixes in production |

##### Feature branches are created from **develop** and merged back through Pull Requests after review.
---

# Branch Naming Convention

Currently, the project does not follow a strict naming convention for branches. Branches are created according to the needs of the tasks being developed by the team.

However, it is recommended that branch names be descriptive to make it easier to identify the functionality or fix implemented.




---

# Branch Creation Workflow

The workflow used by the team to create new branches is:

1. Update the local **develop** branch.
2. Create a new branch from **develop**.
3. Implement the feature or fix.
4. Open a **Pull Request** for review.
5. After approval, merge the branch into **develop**.

### Example:


- git checkout develop
- git pull origin develop
- git checkout -b new-feature


---

# Pull Request and Merge Process

All code changes must follow the Pull Request workflow.

Steps:

1. A developer creates a new branch from **develop**
2. The feature or fix is implemented
3. A **Pull Request** is opened
4. Another team member performs **code review**
5. After approval, the branch is merged into **develop**

---

# Branch Deletion

After a successful merge, the branch used can be removed to keep the repository organized.

### Example:


- git branch -d branch-name
- git push origin --delete branch-name


---

# Documentation Storage

All management and configuration documents are stored in the **docs** folder of the repository to facilitate access and organization of the project.