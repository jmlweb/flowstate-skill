---
name: plan
description: Generate a detailed implementation plan for a feature or change before coding begins. Use when the user describes a complex feature, says "plan this", "how should we implement", "design approach", or when a task needs architectural thinking before implementation. Explores the codebase, identifies files to modify, assesses risks, and saves the plan for review.
argument-hint: [feature description]
allowed-tools: [Read, Write, Bash, Glob, Grep]
model: sonnet
---

# Generate Plan

Create a detailed implementation plan for a feature or change, saved for later review.

## Arguments

Feature description (optional): $ARGUMENTS

## Prerequisites

Verify `.backlog/` exists. If not, tell the user to run `/flowstate:init` first.

## Workflow

### 1. Gather Context

If `$ARGUMENTS` provided, use it as the starting point. Otherwise ask:

1. **What do you want to build or change?**
2. **Why is this needed?**
3. **Any constraints?** (deadlines, compatibility, etc.)

### 2. Load Context

Before exploring code, gather backlog context:

1. **Learnings**: Read `.backlog/learnings/index.md`. Filter entries by keyword match against the feature description. Read the full content of matching learnings (up to 3 most relevant). These may reveal past decisions, gotchas, or proven patterns that should inform the plan.
2. **Active tasks**: Read `.backlog/tasks/active/` — the plan should account for work already in progress to avoid conflicts or duplication.
3. **Pending reports**: Scan `.backlog/reports/pending/` for related bugs or findings that the plan should address or acknowledge.

If no matches found, skip silently.

### 3. Explore the Codebase

Based on the description:
- Search for relevant files that would need changes
- Understand existing patterns and architecture
- Identify dependencies and potential conflicts
- Incorporate insights from learnings found in Step 2

### 4. Generate Plan via CLI

```bash
FLOWSTATE_CLI="node ${CLAUDE_PLUGIN_ROOT}/dist/bin/flowstate.js"
cat <<'BODY' | $FLOWSTATE_CLI plan-create --title "{{TITLE}}" --complexity {{COMPLEXITY}} --body -
{{PLAN_CONTENT}}
BODY
```

The CLI handles ID assignment, file creation, and placement in `plans/pending/`.

**Complexity guidelines:**
- **low**: Single file or small change, clear path
- **medium**: Multiple files, some decisions needed
- **high**: Architectural change, many files, unknowns

### 5. Confirm

```
Created PLN-{{ID}}: {{TITLE}}
  Complexity: {{COMPLEXITY}}
  File: .backlog/plans/pending/PLN-{{ID}}-{{slug}}.md

Next: /flowstate:review-plan PLN-{{ID}}  — Approve, discard, or revise
```
