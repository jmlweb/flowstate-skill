---
name: add-learning
description: Document a learning, insight, or lesson discovered during development. Use when the user says "learned something", "TIL", "note this", "remember this for next time", or when a non-obvious discovery is made while working. Captures context, insight, and application. Links to the active task if applicable. Prevents repeating past mistakes by building a searchable knowledge base.
argument-hint: [learning description]
allowed-tools: [Read, Write, Bash, Glob, Grep]
model: haiku
---

# Add Learning

Document an insight, mistake, or discovery so it can be referenced in future work.

## Arguments

Learning description (optional): $ARGUMENTS

## Prerequisites

Verify `.backlog/` exists. If not, tell the user to run `/flowstate:init` first.

## Workflow

### 1. Gather Information

If `$ARGUMENTS` provided, use it as the title. Otherwise ask:

1. **What did you learn?** — Brief title
2. **Context** — What were you doing when you discovered this?
3. **Insight** — Why is this important? What's the non-obvious part?
4. **Application** — What should you do (or avoid) in the future?
5. **Tags** — Freeform labels (e.g., `database`, `testing`, `deployment`)

### 2. Link to Active Task

Check `.backlog/tasks/active/` for active tasks:
- If one or more are active, ask which (if any) this relates to
- If only one is active, suggest linking to it

### 3. Create Learning via CLI

```bash
FLOWSTATE_CLI="node ${CLAUDE_PLUGIN_ROOT}/dist/bin/flowstate.js"
cat <<'BODY' | $FLOWSTATE_CLI learning-create --title "{{TITLE}}" --tags "{{TAGS}}" --task {{TSK_ID}} --body -
{{LEARNING_CONTENT}}
BODY
```

The CLI handles ID assignment, directory creation, index update, and task linking automatically.

Omit `--task` if no active task is linked.

### 4. Confirm

```
Added LRN-{{ID}}: {{TITLE}}
  Tags: {{TAGS}}
  Linked to: TSK-{{XXX}} (or "No active task")
  Directory: .backlog/learnings/LRN-{{ID}}-{{slug}}/

Tip: Add screenshots or attachments directly to the learning directory.
```
