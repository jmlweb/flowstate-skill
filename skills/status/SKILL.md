---
name: status
description: Show backlog overview, health checks, and warnings
argument-hint: [summary]
allowed-tools: [Read, Bash, Glob, Grep]
model: haiku
---

# Backlog Status

Display the current state of the backlog with stats, active work, and health warnings.

## Arguments

$ARGUMENTS — ignored; this command takes no arguments.

## Prerequisites

Verify `.backlog/` exists. If not, tell the user to run `/flowstate:init`.

## Workflow

### 1. Recompute Stats from Disk

Do NOT trust the counts in `tasks/index.md`. Always recompute:

```bash
pending=$(ls .backlog/tasks/pending/ 2>/dev/null | grep -c '^TSK-')
active_all=$(ls .backlog/tasks/active/ 2>/dev/null | grep -c '^TSK-')
blocked=$(grep -rl '^status: blocked' .backlog/tasks/{pending,active}/ 2>/dev/null | wc -l)
active=$((active_all - blocked))
complete=$(ls .backlog/tasks/complete/ 2>/dev/null | grep -c '^TSK-')
plans_pending=$(ls .backlog/plans/pending/ 2>/dev/null | grep -c '^PLN-')
reports_pending=$(ls .backlog/reports/pending/ 2>/dev/null | grep -c '^RPT-')
learnings=$(ls -d .backlog/learnings/LRN-*/ 2>/dev/null | wc -l)
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

### 4. Quick Actions

```
/flowstate:next-task       — Get a recommendation
/flowstate:add-task        — Add new work
/flowstate:review-plan     — Review pending plans
/flowstate:triage-report   — Triage pending reports
```
