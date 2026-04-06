---
name: next-task
description: Analyze the backlog and recommend the best task to start next. Use when the user asks "what should I work on?", "next task", "what's the priority?", or needs help deciding between multiple pending items.
allowed-tools: [Read, Bash, Glob, Grep]
model: haiku
---

# Next Task

Analyze the backlog and recommend the best task to start next.

## Prerequisites

Verify `.backlog/` exists.

## Workflow

### 1. Read State

```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/bin/flowstate.js" task-list --status pending --json true
node "${CLAUDE_PLUGIN_ROOT}/dist/bin/flowstate.js" task-list --status active --json true
```

### 2. Score Candidates

For each pending non-blocked task:

| Factor | Weight | Criteria |
|--------|--------|----------|
| Priority | High | P1 > P2 > P3 > P4 |
| Unblocked | High | No `blocked-by` field |
| Unblocks others | Medium | Other tasks list this in `depends-on` |
| Tag affinity | Low | Shares tags with recently completed tasks |
| Age | Low | Older tasks get slight preference |

### 3. Load Context for Top Pick

Once the top candidate is identified:

1. **Learnings**: Search for relevant learnings using the CLI. Pass the task's tags and its title + description for maximum keyword coverage:
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/dist/bin/flowstate.js" learning-search --tags "{{TOP_PICK_TAGS}}" --query "{{TOP_PICK_TITLE}} {{TOP_PICK_DESCRIPTION_FIRST_LINE}}" --limit 3 --body true --json true
   ```
   The CLI returns only active learnings, scored by tag match and keyword relevance. These help the user decide if the task is ready or if past issues should be considered first.
2. **Pending reports**: Scan `.backlog/reports/pending/` for anything related to the top pick's scope.

If no matches, skip silently.

### 4. Present

```
## Next Task Recommendation

### Top Pick: TSK-{{ID}}
**{{TITLE}}** ({{PRIORITY}}, tags: {{TAGS}})
Why: {{REASONING}}

### Relevant Learnings          ← only if matches found
- LRN-XXX: {{TITLE}} — {{key insight}}

### Alternatives
| ID | Title | Priority | Notes |
|----|-------|----------|-------|

Start TSK-{{ID}}? (yes / no / other number)
```

### 5. Handle Response

- **yes**: Move the task to active (same as `/flowstate:start-task`)
- **no**: "OK, use /flowstate:start-task when ready"
- **number/ID**: Start that task instead

## Edge Cases

- **All blocked**: Show blockers, suggest resolving or `/flowstate:add-task`
- **No pending**: Suggest `/flowstate:add-task`
- **Many same-priority**: Rank by secondary factors, explain reasoning
