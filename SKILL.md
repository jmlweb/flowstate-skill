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

## CLI Tool

Flowstate includes a CLI for deterministic CRUD operations. All skills use this variable:

```bash
FLOWSTATE_CLI="node ${CLAUDE_PLUGIN_ROOT}/dist/bin/flowstate.js"
```

Define it once at the start of any Bash block. Sub-skill docs may omit it — use this definition.

All commands support `--json true` for structured output. Use `--body -` to pipe content via stdin.

### CLI Commands

| Command | Description |
|---------|-------------|
| `$FLOWSTATE_CLI init --project-name <name>` | Create .backlog/ structure |
| `$FLOWSTATE_CLI task-create --title <t> --priority <P> --tags <csv> --body -` | Create task |
| `$FLOWSTATE_CLI task-move <id> --to <active\|complete\|pending>` | Move task between states |
| `$FLOWSTATE_CLI task-update <id> --set <key=value> --log <msg>` | Update task fields |
| `$FLOWSTATE_CLI task-unblock <id> --resolution <text>` | Unblock a task |
| `$FLOWSTATE_CLI task-list [--status <s>] [--json true]` | List tasks |
| `$FLOWSTATE_CLI stats [--json true]` | Get backlog stats |
| `$FLOWSTATE_CLI index-rebuild [--type <tasks\|learnings\|all>]` | Rebuild indexes |
| `$FLOWSTATE_CLI plan-create --title <t> --complexity <c> --body -` | Create plan |
| `$FLOWSTATE_CLI plan-move <id> --status <approved\|discarded> [--task-id <TSK-XXX>]` | Move plan |
| `$FLOWSTATE_CLI report-create --title <t> --type <t> --severity <s> --body -` | Create report |
| `$FLOWSTATE_CLI report-move <id> --status <triaged\|discarded> [--task-id <TSK-XXX>]` | Move report |
| `$FLOWSTATE_CLI learning-create --title <t> --tags <csv> --body - [--task <TSK-XXX>]` | Create learning |
| `$FLOWSTATE_CLI next-id <task\|plan\|report\|learning>` | Get next sequential ID |

## Available Slash Commands

| Command | Description |
|---------|-------------|
| `/flowstate:init` | Initialize `.backlog/` in the current project (uses CLI) |
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

## Context Loading

Skills that involve starting or planning work (`start-task`, `next-task`, `plan`, `parallel`) automatically load relevant backlog context before acting. This includes:

1. **Learnings** — filtered by tag overlap or keyword match with the task/feature being worked on. Past insights, gotchas, and proven patterns are surfaced inline so they inform decisions without the user having to remember to check.
2. **Active tasks** — listed to show current workload and spot potential overlaps or conflicts.
3. **Pending reports** — scanned for known bugs or findings related to the current scope.

This context is loaded silently — if nothing relevant is found, the skill proceeds without mentioning the absence. The goal is zero-effort awareness: the backlog informs the work automatically.

For ad-hoc browsing outside a skill workflow, use `/flowstate:learnings` to search and drill down into the full learnings index.

## Proactive Behavior

- When you discover a bug or issue while working, suggest `/flowstate:report`
- When you learn something non-obvious, suggest `/flowstate:add-learning`
- Before starting a complex feature, suggest `/flowstate:plan`
- When completing work, check if there are active tasks that match and suggest `/flowstate:complete-task`
