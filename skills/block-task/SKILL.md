---
name: block-task
description: Mark a task as blocked with a reason
argument-hint: [task ID] [reason]
allowed-tools: [Read, Write, Bash, Glob, Grep]
model: haiku
---

# Block Task

Mark a task as blocked, document the reason, and suggest alternatives.

## Arguments

$ARGUMENTS — First word is the task ID, rest is the block reason. Both optional.

## Prerequisites

Verify `.backlog/` exists.

## Workflow

### 1. Identify Task

Parse `$ARGUMENTS` for task ID (first word if it matches TSK-XXX, XXX, or a number).

If no ID, check for active tasks and ask which to block. Look in both `tasks/active/` and `tasks/pending/`.

### 2. Get Block Reason

If reason provided in `$ARGUMENTS` (words after the ID), use it. Otherwise ask.

Suggest common categories:
- **Dependency**: "Waiting for TSK-XXX to complete"
- **External**: "Waiting for API credentials / third-party response"
- **Technical**: "Discovered a technical limitation"
- **Clarification**: "Requirements are unclear, need user input"

### 3. Update Task Frontmatter

Change `status:` to `status: blocked` and add `blocked-by: {{REASON}}`.

The task file **stays in its current directory** (pending or active). Only frontmatter changes.

### 4. Add Progress Log Entry

```markdown
- [{{TODAY}}] Blocked: {{REASON}}
```

### 5. Update tasks/index.md

Increment Blocked count in Stats. Mark the task with `BLOCKED` in its current table.

### 6. Suggest Alternatives

Show unblocked pending/active tasks as alternatives.

### 7. If Technical Blocker

```
This appears to be a technical blocker. Would you like to:
1. Document a learning (/flowstate:add-learning)
2. Create a report (/flowstate:report)
3. Continue without documenting
```

## Unblocking

To unblock: change `status` back to `pending` or `active`, remove `blocked-by`, add progress log entry `Unblocked: {{resolution}}`. Then use `/flowstate:start-task` if needed.
