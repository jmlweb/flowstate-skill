---
name: complete-task
description: Mark a task as completed and move it to done. Use when the user finishes work, says "done with task", "complete task", "mark as done", or when all acceptance criteria are met. Verifies criteria, extracts learnings, updates frontmatter with completion date, and suggests the next task to work on.
argument-hint: [task ID or number]
allowed-tools: [Read, Write, Bash, Glob, Grep]
model: haiku
---

# Complete Task

Mark a task as completed, move it to the complete directory, and handle learnings.

## CLI Usage

```bash
FLOWSTATE_CLI="node ~/.claude/plugins/flowstate/dist/bin/flowstate.js"
```

## Arguments

Task identifier (optional): $ARGUMENTS — accepts `TSK-001`, `001`, or `1`.

## Prerequisites

Verify `.backlog/` exists.

## Workflow

### 1. Identify Task

If `$ARGUMENTS` provided, find matching file in `.backlog/tasks/active/`.

If no argument, list active tasks and ask which to complete.

### 2. Verify Acceptance Criteria

Read the task file and check acceptance criteria:

- If all are checked `[x]`, proceed
- If unchecked criteria exist, warn the user:

```
TSK-{{ID}} has unchecked acceptance criteria:
- [ ] Criterion 3

Options:
1. Mark as complete anyway (criteria no longer relevant)
2. Continue working (abort completion)
3. Update criteria (remove/modify items)
```

### 3. Extract Learnings

Check the task's **Learnings** section. If it contains entries, offer to create full learning entries via `/flowstate:add-learning`.

### 4. Complete Task via CLI

```bash
$FLOWSTATE_CLI task-move {{ID}} --to complete
```

The CLI updates frontmatter (`status: complete`, `completed: today`), adds a progress log entry, moves the file to `tasks/complete/`, and updates `tasks/index.md` automatically.

### 5. Suggest Next Task

```
Completed TSK-{{ID}}: {{TITLE}}
Learnings extracted: {{N}} items

## Pending Tasks (by priority)
| ID | Title | Priority |
|----|-------|----------|

/flowstate:start-task  — Begin next task
/flowstate:next-task   — Get a recommendation
```
