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

### 2. Explore the Codebase

Based on the description:
- Search for relevant files that would need changes
- Understand existing patterns and architecture
- Identify dependencies and potential conflicts
- Check `.backlog/learnings/index.md` for related past insights

### 3. Generate Plan via CLI

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

### 4. Confirm

```
Created PLN-{{ID}}: {{TITLE}}
  Complexity: {{COMPLEXITY}}
  File: .backlog/plans/pending/PLN-{{ID}}-{{slug}}.md

Next: /flowstate:review-plan PLN-{{ID}}  — Approve, discard, or revise
```
