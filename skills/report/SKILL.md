---
name: report
description: File a structured bug report, finding, improvement suggestion, or security issue. Use when the user discovers a bug, says "found a bug", "report issue", "file a finding", "security concern", or when something unexpected is observed during development. Guides through type classification, severity assessment, reproduction steps, and evidence gathering. Saved for later triage.
argument-hint: [report description]
allowed-tools: [Read, Write, Bash, Glob, Grep]
model: sonnet
---

# File Report

Generate a structured report for a bug, finding, improvement, or security issue.

## Arguments

Report description (optional): $ARGUMENTS

## Prerequisites

Verify `.backlog/` exists. If not, tell the user to run `/flowstate:init` first.

## Workflow

### 1. Determine Report Type

If `$ARGUMENTS` provided, infer the type. Otherwise ask:

| Type | When to use |
|------|-------------|
| bug | Something is broken or behaving incorrectly |
| finding | A discovery or observation worth documenting |
| improvement | An enhancement or optimization opportunity |
| security | A security vulnerability or concern |

### 2. Gather Details

**All types:** Title, Summary, Details

**Bug:** Steps to Reproduce, Expected vs Actual, Error messages/logs

**Finding:** Where found, Evidence, Impact

**Improvement:** Current behavior, Proposed change, Expected benefit

**Security:** Attack vector, Affected components, Severity

### 3. Determine Severity

| Severity | Criteria |
|----------|----------|
| critical | System broken, data loss, security breach |
| high | Major feature broken, significant impact |
| medium | Partially broken, workaround exists |
| low | Minor issue, cosmetic, edge case |

### 4. Generate Report via CLI

```bash
FLOWSTATE_CLI="node ~/.claude/plugins/flowstate/dist/bin/flowstate.js"
cat <<'BODY' | $FLOWSTATE_CLI report-create --title "{{TITLE}}" --type {{TYPE}} --severity {{SEVERITY}} --body -
{{REPORT_CONTENT}}
BODY
```

The CLI handles ID assignment, file creation, and placement in `reports/pending/`.

Omit sections that don't apply (e.g., no "Steps to Reproduce" for findings).

### 5. Confirm

```
Filed RPT-{{ID}}: {{TITLE}}
  Type: {{TYPE}} | Severity: {{SEVERITY}}
  File: .backlog/reports/pending/RPT-{{ID}}-{{slug}}.md

Next: /flowstate:triage-report RPT-{{ID}}
```
