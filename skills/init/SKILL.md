---
name: init
description: Initialize the .backlog/ directory structure in the current project
argument-hint: [project name]
allowed-tools: [Bash, Read, Write, Glob]
model: haiku
---

# Initialize Backlog

Set up the `.backlog/` directory structure in the current project.

## Arguments

Project name (optional): $ARGUMENTS

## Workflow

### 1. Check Existing State

- If `.backlog/` already exists, check which subdirectories/files are missing and only create those
- If it doesn't exist, create everything from scratch

### 2. Project Name

If `$ARGUMENTS` is provided, use it as the project name. Otherwise, infer from the current directory name or ask the user.

### 3. Create Directory Structure

```bash
mkdir -p .backlog/plans/{pending,complete}
mkdir -p .backlog/reports/{pending,complete}
mkdir -p .backlog/tasks/{pending,active,complete}
mkdir -p .backlog/learnings
```

### 4. Create Index Files (only if they don't exist)

**`.backlog/tasks/index.md`:**

```markdown
# {{PROJECT_NAME}} - Task Index

## Stats

| Status | Count |
|--------|-------|
| Pending | 0 |
| Active | 0 |
| Blocked | 0 |
| Complete | 0 |

## Active Tasks

_No active tasks._

## Pending Tasks

| ID | Title | Priority | Tags | Created |
|----|-------|----------|------|---------|

## Recently Completed

| ID | Title | Completed |
|----|-------|-----------|
```

**`.backlog/learnings/index.md`:**

```markdown
# {{PROJECT_NAME}} - Learnings Index

> Consult a learning's full document before starting related work.

| ID | Title | Tags | Date |
|----|-------|------|------|
```

Replace `{{PROJECT_NAME}}` with the actual project name.

### 5. Confirm

Report what was created:

```
Initialized .backlog/ for {{PROJECT_NAME}}

Structure:
  .backlog/plans/{pending,complete}/
  .backlog/reports/{pending,complete}/
  .backlog/tasks/{pending,active,complete}/
  .backlog/tasks/index.md
  .backlog/learnings/index.md

Available commands:
  /flowstate:add-task    — Add a new task
  /flowstate:plan        — Generate an implementation plan
  /flowstate:report      — File a bug report or finding
  /flowstate:status      — View backlog overview
```

## Idempotency

This command is safe to run multiple times. It will:
- Create missing directories without affecting existing ones
- Create missing index files without overwriting existing ones
- Never delete or modify existing content
