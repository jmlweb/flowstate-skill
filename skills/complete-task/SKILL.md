---
name: complete-task
description: Mark a task as completed and move it to done. Use when the user finishes work, says "done with task", "complete task", "mark as done", or when all acceptance criteria are met.
argument-hint: [task ID or number]
allowed-tools: [Read, Write, Bash, Glob, Grep]
model: haiku
---

# Complete Task

Mark a task as completed, move it to the complete directory, and handle learnings.

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

### 3b. Prompt for Learnings

If the task file has NO "Learnings" section or the section is empty, ask:

```
Any insights worth capturing? (gotchas, patterns that worked, things to avoid)
- yes → gather a one-line title and 2-3 sentences, then run /flowstate:add-learning
- no → proceed
```

### 4. Complete Task via CLI

```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/bin/flowstate.js" task-move {{ID}} --to complete
```

The CLI updates frontmatter (`status: complete`, `completed: today`), adds a progress log entry, moves the file to `tasks/complete/`, and updates `tasks/index.md` automatically.

### 5. Confirm Completion

```
Completed TSK-{{ID}}: {{TITLE}}
Learnings captured: {{N}} items
{{PENDING_COUNT}} tasks remaining.

/flowstate:next-task — Get a recommendation
```
