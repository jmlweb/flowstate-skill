---
name: review-plan
description: Review a pending implementation plan and decide its fate — approve (convert to task), discard, or revise. Use when the user says "review plan", "approve plan", "check the plan", or after generating a plan with /flowstate:plan. Presents the plan summary, approach, risks, and asks for a decision. Approved plans become backlog tasks automatically.
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

```bash
FLOWSTATE_CLI="node ~/.claude/plugins/flowstate/dist/bin/flowstate.js"

# Create task from plan
$FLOWSTATE_CLI task-create --title "{{TITLE}}" --priority {{P}} --source "plan/PLN-{{ID}}" --criteria '{{CRITERIA}}' --body -

# Move plan to complete
$FLOWSTATE_CLI plan-move PLN-{{ID}} --status approved --task-id TSK-{{NEW_ID}}
```

The CLI handles frontmatter updates, file moves, and index updates.

- Priority: ask user or suggest based on complexity
- Acceptance criteria: derive from the Approach steps

Confirm:
```
Plan PLN-{{ID}} approved → TSK-{{NEW_ID}}: {{TITLE}}
/flowstate:start-task TSK-{{NEW_ID}} to begin
```

### 4b. Discard

```bash
FLOWSTATE_CLI="node ~/.claude/plugins/flowstate/dist/bin/flowstate.js"
$FLOWSTATE_CLI plan-move PLN-{{ID}} --status discarded
```

Confirm to the user.

### 4c. Revise

1. Discuss needed changes with the user
2. Edit plan in-place (stays in `plans/pending/`)
3. Add revision note:
   ```markdown
   ## Revision History
   - [{{TODAY}}] {{what changed}}
   ```
