---
name: add-task
description: Groom and add a new task to the backlog
argument-hint: [task description]
allowed-tools: [Read, Write, Bash, Glob, Grep]
model: sonnet
---

# Add Task

Interactively groom a new task and add it to the backlog.

## Arguments

Task description (optional): $ARGUMENTS

## Prerequisites

Verify `.backlog/` exists. If not, tell the user to run `/flowstate:init` first.

## Workflow

### 1. Read Current State

Read `.backlog/tasks/index.md` to understand the current backlog.

### 2. Determine Next ID

```bash
next_id=$(ls .backlog/tasks/{pending,active,complete}/ 2>/dev/null | grep -oP 'TSK-\K\d+' | sort -n | tail -1)
next_id=$(printf "%03d" $(( ${next_id:-0} + 1 )))
```

### 3. Gather Task Information

If `$ARGUMENTS` is provided, use it as the title. Otherwise ask.

Collect interactively:

1. **Title** — Short, descriptive (e.g., "Add user authentication", "Fix pagination bug")
2. **Description** — What needs to be done and why
3. **Acceptance Criteria** — Ask iteratively: "What else needs to be true for this to be complete?" Aim for 3-6 specific, testable criteria as checkboxes
4. **Priority** — Suggest based on description:

   | Priority | When to use |
   |----------|-------------|
   | P1 | Critical / blocking other work |
   | P2 | High priority, should be done next |
   | P3 | Normal backlog item |
   | P4 | Nice-to-have, future consideration |

5. **Tags** — Freeform labels (e.g., `backend`, `auth`, `ui`, `performance`). Suggest based on description
6. **Dependencies** — Show pending tasks and ask if this depends on any

### 4. Generate Task File

Create `.backlog/tasks/pending/TSK-{{ID}}-{{slug}}.md` following the template in `references/templates.md`.

Set `source: manual` in frontmatter.

**Slug**: lowercase, hyphen-separated, max 5 words from the title.

### 5. Update tasks/index.md

Add a row to the **Pending Tasks** table and increment the Pending count in Stats.

### 6. Confirm

```
Created TSK-{{ID}}: {{TITLE}}
  Priority: {{PRIORITY}}
  Tags: {{TAGS}}
  File: .backlog/tasks/pending/TSK-{{ID}}-{{slug}}.md

Next steps:
  /flowstate:start-task TSK-{{ID}}  — Start working on it
  /flowstate:status                 — View updated backlog
```
