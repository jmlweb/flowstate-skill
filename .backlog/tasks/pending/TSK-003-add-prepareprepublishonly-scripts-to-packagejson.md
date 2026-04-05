---
id: TSK-003
title: Add prepare/prepublishonly scripts to package.json
status: pending
priority: P3
tags: [build, distribution]
created: 2026-04-05
source: manual
depends-on: []
---

# Add prepare/prepublishonly scripts to package.json

## Description

Add prepare script to package.json so the CLI builds automatically after npm install:

```json
"prepare": "pnpm build"
```

Also add prepublishonly for future npm publishing.


## Acceptance Criteria



## Notes

## Learnings

## Progress Log

- [2026-04-05] Created