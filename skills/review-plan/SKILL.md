---
name: review-plan
description: Review a pending plan and decide its fate (approve, discard, revise)
argument-hint: [plan ID]
allowed-tools: [Read, Write, Bash, Glob, Grep]
model: sonnet
---

# Review Plan

Review a pending plan and decide whether to approve (convert to task), discard, or revise it.

## Arguments

Plan identifier (optional): $ARGUMENTS — accepts `PLN-001`, `001`, or `1`.

## Prerequisites

Verify `.backlog/plans/pending/` has plans. If empty, inform the user.

## Workflow

### 1. Identify Plan

If `$ARGUMENTS` provided, find in `.backlog/plans/pending/`.

If no argument, list pending plans and ask which to review.

### 2. Present Summary

Read the full plan file and present:

```
## PLN-{{ID}}: {{TITLE}}
Complexity: {{COMPLEXITY}} | Created: {{DATE}}

### Goal
{{summary}}

### Approach ({{N}} steps)
1. ...

### Files to Modify
...

### Risks
...
```

### 3. Ask for Decision

1. **Approve** — Convert this plan into a backlog task
2. **Discard** — This plan is not needed
3. **Revise** — The plan needs changes

### 4a. Approve

1. Create new task following the add-task template:
   - Title from the plan
   - Acceptance criteria from the Approach steps
   - `source: plan/PLN-{{ID}}`
   - Priority: ask user or suggest based on complexity

2. Update plan frontmatter: `status: approved`, add `reviewed: {{TODAY}}`, `task-id: TSK-{{NEW_ID}}`

3. Move plan to `plans/complete/`

4. Update `tasks/index.md`

5. Confirm:
   ```
   Plan PLN-{{ID}} approved → TSK-{{NEW_ID}}: {{TITLE}}
   /flowstate:start-task TSK-{{NEW_ID}} to begin
   ```

### 4b. Discard

1. Update plan: `status: discarded`, add `reviewed: {{TODAY}}`
2. Move to `plans/complete/`
3. Confirm

### 4c. Revise

1. Discuss needed changes with the user
2. Edit plan in-place (stays in `plans/pending/`)
3. Add revision note:
   ```markdown
   ## Revision History
   - [{{TODAY}}] {{what changed}}
   ```
