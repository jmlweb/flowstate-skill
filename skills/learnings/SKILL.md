---
name: learnings
description: Browse and search the learnings index for relevant past insights. Use when the user says "check learnings", "what did we learn about", "search knowledge", or at the start of a work session to review insights.
argument-hint: [search term or tag]
allowed-tools: [Read, Bash, Glob, Grep]
model: haiku
---

# Browse Learnings

View the learnings index and search for relevant past insights.

## Arguments

Search term (optional): $ARGUMENTS

## Prerequisites

Verify `.backlog/learnings/` exists.

## Workflow

### 1. Read Index

Read `.backlog/learnings/index.md`.

### 2. If Search Term Provided

Search using the CLI for deterministic, scored results:

```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/bin/flowstate.js" learning-search --query "{{SEARCH_TERM}}" --limit 10 --json true
```

Present matches:

```
## Search Results for "{{TERM}}"

| ID | Title | Tags | Score | Date |
|----|-------|------|-------|------|

Enter a learning ID to read the full document.
```

### 3. If No Search Term

Display the full index:

```
## Learnings Index ({{N}} entries)

| ID | Title | Tags | Status | Date |
|----|-------|------|--------|------|

Enter a learning ID to read the full document, or a search term to filter.
```

### 4. Drill Down

When user selects a learning ID:
- Read the full `LRN-XXX-slug/index.md`
- Display the content
- List attachments in the directory

```
## LRN-{{ID}}: {{TITLE}}

### Context
...

### Insight
...

### Application
...

### Attachments
- screenshot.png
```

## Usage Tips

- Run `/flowstate:learnings` at the start of a work session to review recent insights
- Search by tag to find relevant learnings for your current task
