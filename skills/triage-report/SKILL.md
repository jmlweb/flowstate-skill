---
name: triage-report
description: Triage a pending report (convert to task, discard, or request more info)
argument-hint: [report ID]
allowed-tools: [Read, Write, Bash, Glob, Grep]
model: sonnet
---

# Triage Report

Review a pending report and decide: convert to task, discard, or request more info.

## Arguments

Report identifier (optional): $ARGUMENTS — accepts `RPT-001`, `001`, or `1`.

## Prerequisites

Verify `.backlog/reports/pending/` has reports. If empty, inform the user.

## Workflow

### 1. Identify Report

If `$ARGUMENTS` provided, find in `.backlog/reports/pending/`.

If no argument, list pending reports and ask which to triage.

### 2. Present Summary

```
## RPT-{{ID}}: {{TITLE}}
Type: {{TYPE}} | Severity: {{SEVERITY}} | Created: {{DATE}}

### Summary
...

### Key Details
...
```

### 3. Ask for Decision

1. **Convert to task** — Create a backlog task from this report
2. **Discard** — Not actionable
3. **Needs more info** — Keep pending, note what's missing

### 4a. Convert to Task

1. Create task:
   - Title: prefix with "Fix: " for bugs
   - Acceptance criteria from the report (e.g., "Bug no longer reproduces")
   - Priority: suggest from severity (critical→P1, high→P2, medium→P3, low→P4)
   - `source: report/RPT-{{ID}}`

2. Update report: `status: triaged`, add `triaged: {{TODAY}}`, `task-id: TSK-{{NEW_ID}}`

3. Move report to `reports/complete/`

4. Update `tasks/index.md`

5. Confirm:
   ```
   RPT-{{ID}} triaged → TSK-{{NEW_ID}}: {{TITLE}}
   /flowstate:start-task TSK-{{NEW_ID}} to begin
   ```

### 4b. Discard

1. Update report: `status: discarded`, add `triaged: {{TODAY}}`
2. Move to `reports/complete/`

### 4c. Needs More Info

1. Ask what's missing
2. Add to the report:
   ```markdown
   ## Missing Information
   - [{{TODAY}}] {{what's needed}}
   ```
3. Keep in `reports/pending/`
