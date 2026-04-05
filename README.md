# Flowstate

> Backlog management for Claude Code — tasks, plans, reports, and learnings, all in plain files.

Flowstate adds a structured, file-based backlog to any project. Everything lives in a `.backlog/` directory that you can read, edit, and commit alongside your code. Claude understands the system and can manage the full lifecycle: triage → plan → implement → learn.

---

## Why Flowstate?

- **Zero friction.** One command to initialize. No external services, no databases.
- **Git-native.** The entire backlog is markdown files — diff it, review it, revert it.
- **Claude-aware.** Claude proactively suggests filing reports, capturing learnings, and reviewing plans.
- **Smart prioritization.** `/flowstate:next-task` scores pending tasks by priority, dependencies, and history.
- **Parallel execution.** Run independent tasks simultaneously in isolated git worktrees.

---

## Installation

### From the marketplace (recommended)

Add the jmlweb marketplace and install Flowstate:

```bash
claude plugin marketplace add jmlweb/claude-plugins
claude plugin install flowstate@jmlweb
```

### Team setup

To share the marketplace with your team, add it to your project's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": ["jmlweb/claude-plugins"]
}
```

Then each team member only needs:

```bash
claude plugin install flowstate@jmlweb
```

### Manual installation

No build step needed — `dist/` is included in the repo.

```bash
# Clone the repo
git clone https://github.com/jmlweb/flowstate-skill.git ~/.claude/plugins/flowstate

# Or add it as a submodule in your project
git submodule add https://github.com/jmlweb/flowstate-skill.git .claude/plugins/flowstate
```

### Getting started

Once installed, run in your project:

```
/flowstate:init
```

This creates the `.backlog/` directory structure and you're ready to go.

---

## Commands

| Command | Description |
|---------|-------------|
| `/flowstate:init` | Initialize `.backlog/` in the current project |
| `/flowstate:status` | Show backlog overview, health warnings, and stats |
| `/flowstate:add-task` | Add a new task interactively |
| `/flowstate:start-task` | Move a task from pending to active |
| `/flowstate:complete-task` | Mark a task done and extract learnings |
| `/flowstate:check-task` | Verify task status matches actual implementation |
| `/flowstate:block-task` | Block a task with a documented reason |
| `/flowstate:next-task` | Get a smart recommendation for what to work on next |
| `/flowstate:plan` | Generate a detailed implementation plan |
| `/flowstate:review-plan` | Review a pending plan (approve / discard / revise) |
| `/flowstate:report` | File a bug report or finding |
| `/flowstate:triage-report` | Triage a pending report and convert it to a task |
| `/flowstate:parallel` | Execute multiple independent tasks in parallel |
| `/flowstate:add-learning` | Document an insight or lesson learned |
| `/flowstate:learnings` | Browse and search the learnings index |

---

## Backlog Structure

```
.backlog/
├── tasks/
│   ├── pending/          # Not yet started
│   ├── active/           # In progress
│   ├── complete/         # Finished
│   └── index.md          # Registry with stats
├── plans/
│   ├── pending/          # Awaiting review
│   └── complete/         # Approved or discarded
├── reports/
│   ├── pending/          # Awaiting triage
│   └── complete/         # Processed
└── learnings/
    ├── index.md          # Learning registry
    └── LRN-XXX-slug/     # Individual learning entries
```

### ID format

| Type | Format | Example |
|------|--------|---------|
| Task | `TSK-XXX` | `TSK-001` |
| Plan | `PLN-XXX` | `PLN-003` |
| Report | `RPT-XXX` | `RPT-007` |
| Learning | `LRN-XXX` | `LRN-002` |

---

## Typical Workflow

```
# 1. Start fresh
/flowstate:init

# 2. Plan a feature
/flowstate:plan
/flowstate:review-plan

# 3. Work the backlog
/flowstate:next-task        # what should I do next?
/flowstate:start-task       # begin work
/flowstate:complete-task    # done — learnings extracted automatically

# 4. Handle issues as they come up
/flowstate:report           # found a bug
/flowstate:triage-report    # convert to task

# 5. Run independent tasks in parallel
/flowstate:parallel TSK-004,TSK-005,TSK-006
```

---

## Task Lifecycle

```
pending → active → complete
            ↓
         blocked  (stays in place, reason documented)
```

### Priority levels

| Level | Meaning |
|-------|---------|
| P1 | Critical — blocking other work |
| P2 | High priority — do next |
| P3 | Normal backlog |
| P4 | Nice to have |

---

## Proactive Behavior

Claude will automatically suggest Flowstate commands when relevant:

- Discovers a bug while working → suggests `/flowstate:report`
- Learns something non-obvious → suggests `/flowstate:add-learning`
- Starting a complex feature → suggests `/flowstate:plan`
- Finishing work → checks for matching active tasks, suggests `/flowstate:complete-task`
- Before starting work → reads `learnings/index.md` to avoid repeating past mistakes

---

## License

MIT — see [LICENSE](LICENSE).

---

Made by [jmlweb](https://github.com/jmlweb).
