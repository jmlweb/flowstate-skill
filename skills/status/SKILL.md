---
name: status
description: Show a comprehensive backlog overview with stats, active work, and health warnings. Use when the user asks "backlog status", "what's going on", "show tasks", "project overview", or wants to see the state of all tasks, plans, reports, and learnings. Recomputes stats from disk, detects stale active tasks, blocked items, priority imbalances, and index drift.
argument-hint: [summary]
allowed-tools: [Read, Bash, Glob, Grep]
model: haiku
---

# Backlog Status

Display the current state of the backlog with stats, active work, and health warnings.

## CLI Usage

```bash
FLOWSTATE_CLI="node ${CLAUDE_PLUGIN_ROOT}/dist/bin/flowstate.js"
```

## Arguments

$ARGUMENTS — ignored; this command takes no arguments.

## Prerequisites

Verify `.backlog/` exists. If not, tell the user to run `/flowstate:init`.

## Workflow

### 1. Fetch Stats and Task Data

```bash
$FLOWSTATE_CLI stats --json true
$FLOWSTATE_CLI task-list --json true
```

### 2. Display

```
## {{PROJECT}} - Backlog Status

### Quick Stats
| Metric | Count |
|--------|-------|
| Pending | {{N}} |
| Active | {{N}} |
| Blocked | {{N}} |
| Complete | {{N}} |
| Plans (pending) | {{N}} |
| Reports (pending) | {{N}} |
| Learnings | {{N}} |

### Active Tasks
| ID | Title | Started | Tags |
|----|-------|---------|------|

### Pending Tasks (by priority)
| ID | Title | Priority | Tags | Created |
|----|-------|----------|------|---------|

### Pending Plans
| ID | Title | Complexity | Created |
|----|-------|------------|---------|

### Pending Reports
| ID | Title | Type | Severity | Created |
|----|-------|------|----------|---------|

### Recently Completed (last 5)
| ID | Title | Completed |
|----|-------|-----------|
```

### 3. Warnings

**Stale active tasks** (active > 3 days):
```
WARNING: TSK-XXX active since YYYY-MM-DD (N days)
  /flowstate:check-task TSK-XXX or /flowstate:block-task TSK-XXX
```

**Blocked tasks**: List with reasons.

**Priority imbalance** (> 3 P1/P2 tasks):
```
NOTE: {{N}} high-priority tasks — consider reprioritizing
```

**Index drift** (counts don't match disk): Offer to rewrite `tasks/index.md`.

### 4. Rebuild Index

After displaying, rebuild indexes to fix any drift:

```bash
$FLOWSTATE_CLI index-rebuild
```

### 5. Quick Actions

```
/flowstate:next-task       — Get a recommendation
/flowstate:add-task        — Add new work
/flowstate:review-plan     — Review pending plans
/flowstate:triage-report   — Triage pending reports
```
