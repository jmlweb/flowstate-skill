---
name: start-task
description: Start working on a task (move to active)
argument-hint: [task ID or number]
allowed-tools: [Read, Write, Bash, Glob, Grep]
model: haiku
---

# Start Task

Mark a task as in-progress and move it to the active directory.

## CLI Usage

```bash
FLOWSTATE_CLI="node ~/.claude/plugins/flowstate/dist/bin/flowstate.js"
```

## Arguments

Task identifier (optional): $ARGUMENTS — accepts `TSK-001`, `001`, or `1`.

## Prerequisites

Verify `.backlog/` exists. If not, tell the user to run `/flowstate:init` first.

## Workflow

### 1. Identify Task

If `$ARGUMENTS` provided, find the matching file in `.backlog/tasks/pending/`.

If no argument, list all pending non-blocked tasks and ask which to start.

### 2. Validate

- Task must exist in `tasks/pending/`
- Task must NOT have `status: blocked` in frontmatter
- If blocked, show the reason and suggest resolving it first

### 3. Move Task to Active

```bash
$FLOWSTATE_CLI task-move {{ID}} --to active
```

The CLI moves the file, updates frontmatter (`status: active`, `started: today`), adds a progress log entry, and updates `tasks/index.md` automatically.

### 4. Show Task Summary

```
Started TSK-{{ID}}: {{TITLE}}

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

Reminders:
  /flowstate:add-learning   — Document insights as you work
  /flowstate:block-task      — If you hit a blocker
  /flowstate:complete-task   — When all criteria are met
```

## Notes

- Multiple tasks can be active simultaneously
- Starting a task does NOT block other tasks from being started
- Check `learnings/index.md` for relevant past learnings before beginning work
