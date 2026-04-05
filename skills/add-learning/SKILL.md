---
name: add-learning
description: Document a learning, insight, or lesson discovered during development
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

### 3. Determine Next ID

```bash
next_id=$(ls .backlog/learnings/ 2>/dev/null | grep -oP 'LRN-\K\d+' | sort -n | tail -1)
next_id=$(printf "%03d" $(( ${next_id:-0} + 1 )))
```

### 4. Create Learning Directory and File

```bash
mkdir -p .backlog/learnings/LRN-{{ID}}-{{slug}}/
```

Create `.backlog/learnings/LRN-{{ID}}-{{slug}}/index.md` following the template in `references/templates.md`.

### 5. Update Learnings Index

Append a row to `.backlog/learnings/index.md`:

```markdown
| [LRN-{{ID}}](LRN-{{ID}}-{{slug}}/) | {{TITLE}} | {{TAGS}} | {{TODAY}} |
```

### 6. Link to Task (if applicable)

If linked to an active task, append to its **Learnings** section:

```markdown
- LRN-{{ID}}: {{TITLE}} (see [full learning](../learnings/LRN-{{ID}}-{{slug}}/))
```

### 7. Confirm

```
Added LRN-{{ID}}: {{TITLE}}
  Tags: {{TAGS}}
  Linked to: TSK-{{XXX}} (or "No active task")
  Directory: .backlog/learnings/LRN-{{ID}}-{{slug}}/

Tip: Add screenshots or attachments directly to the learning directory.
```
