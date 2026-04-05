---
name: flowstate
description: Activate when the project has a .backlog/ directory, or when the user discusses tasks, backlog, plans, reports, bugs, or learnings. Provides contextual awareness of the flowstate backlog management system.
version: 1.0.0
---

# Flowstate - Backlog Management System

This project uses **Flowstate** for backlog management. All data lives in `.backlog/`.

## Structure

```
.backlog/
├── plans/pending/         # Implementation plans awaiting review
├── plans/complete/        # Approved or discarded plans
├── reports/pending/       # Bug reports, findings awaiting triage
├── reports/complete/      # Processed reports
├── tasks/pending/         # Tasks to do
├── tasks/active/          # Tasks in progress (multiple allowed)
├── tasks/complete/        # Completed tasks
├── tasks/index.md         # Task index with stats
├── learnings/index.md     # Learnings index
└── learnings/LRN-XXX-*/   # Individual learning directories
```

## Available Commands

| Command | Description |
|---------|-------------|
| `/flowstate:init` | Initialize `.backlog/` in the current project |
| `/flowstate:status` | Show backlog overview and health |
| `/flowstate:add-task` | Add a new task to the backlog |
| `/flowstate:start-task` | Start working on a task |
| `/flowstate:complete-task` | Mark a task as complete |
| `/flowstate:block-task` | Block a task with a reason |
| `/flowstate:check-task` | Verify task status vs implementation |
| `/flowstate:next-task` | Get a recommendation for what to work on next |
| `/flowstate:plan` | Generate an implementation plan |
| `/flowstate:review-plan` | Review and decide on a pending plan |
| `/flowstate:report` | File a bug report or finding |
| `/flowstate:triage-report` | Triage a pending report |
| `/flowstate:parallel` | Run multiple tasks in parallel |
| `/flowstate:add-learning` | Document an insight or lesson learned |
| `/flowstate:learnings` | Browse the learnings index |

## ID Format

- Tasks: `TSK-XXX` (e.g., TSK-001)
- Plans: `PLN-XXX`
- Reports: `RPT-XXX`
- Learnings: `LRN-XXX`

## Proactive Behavior

- When you discover a bug or issue while working, suggest `/flowstate:report`
- When you learn something non-obvious, suggest `/flowstate:add-learning`
- Before starting a complex feature, suggest `/flowstate:plan`
- When completing work, check if there are active tasks that match and suggest `/flowstate:complete-task`
- Read `learnings/index.md` before starting work to avoid repeating past mistakes
