---
name: plan
description: Generate an implementation plan for a feature or change
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

### 3. Determine Next ID

```bash
next_id=$(ls .backlog/plans/{pending,complete}/ 2>/dev/null | grep -oP 'PLN-\K\d+' | sort -n | tail -1)
next_id=$(printf "%03d" $(( ${next_id:-0} + 1 )))
```

### 4. Generate Plan File

Create `.backlog/plans/pending/PLN-{{ID}}-{{slug}}.md` following the template in `references/templates.md`.

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
