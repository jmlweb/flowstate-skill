#!/usr/bin/env node

import { init } from "../commands/init.js";
import { nextId } from "../commands/next-id.js";
import { taskCreate } from "../commands/task-create.js";
import { taskList } from "../commands/task-list.js";
import { taskMove } from "../commands/task-move.js";
import { taskUpdate } from "../commands/task-update.js";
import { taskUnblock } from "../commands/task-unblock.js";
import { stats } from "../commands/stats.js";
import { indexRebuild } from "../commands/index-rebuild.js";
import { planCreate } from "../commands/plan-create.js";
import { planMove } from "../commands/plan-move.js";
import { reportCreate } from "../commands/report-create.js";
import { reportMove } from "../commands/report-move.js";
import { learningCreate } from "../commands/learning-create.js";
import type { EntityType, TaskStatus } from "../core/types.js";
import { validatePriority, validateComplexity, validateReportType, validateSeverity } from "../core/types.js";

const cwd = process.cwd();

function parseArgs(args: readonly string[]): {
  flags: Record<string, string>;
  flagArrays: Record<string, string[]>;
  positional: string[];
} {
  const flags: Record<string, string> = {};
  const flagArrays: Record<string, string[]> = {};
  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        (flagArrays[key] ??= []).push(next);
        i++;
      } else {
        flags[key] = "true";
        (flagArrays[key] ??= []).push("true");
      }
    } else {
      positional.push(arg);
    }
  }

  return { flags, flagArrays, positional };
}

function required(flags: Record<string, string>, key: string): string {
  const val = flags[key];
  if (!val) {
    console.error(`Missing required flag: --${key}`);
    process.exit(1);
  }
  return val;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

async function getBody(flags: Record<string, string>): Promise<string> {
  const body = flags["body"];
  if (body === "-") return readStdin();
  return body ?? "";
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);

  if (!command) {
    console.error(
      "Usage: flowstate <command> [args]\n\nCommands: init, next-id, task-create, task-list, task-move, task-update, task-unblock, stats, index-rebuild, plan-create, plan-move, report-create, report-move, learning-create",
    );
    process.exit(1);
  }

  const { flags, flagArrays, positional } = parseArgs(rest);
  const json = flags["json"] === "true";

  try {
    switch (command) {
      case "init": {
        const name = flags["project-name"] ?? "Project";
        const root = await init(cwd, name);
        output({ root }, json);
        break;
      }

      case "next-id": {
        const type = positional[0] as EntityType | undefined;
        if (!type) {
          console.error("Usage: flowstate next-id <task|plan|report|learning>");
          process.exit(1);
        }
        const id = await nextId(cwd, type);
        output({ id }, json);
        break;
      }

      case "task-create": {
        const body = await getBody(flags);
        const result = await taskCreate(cwd, {
          title: required(flags, "title"),
          priority: validatePriority(required(flags, "priority")),
          tags: flags["tags"] ? flags["tags"].split(",").map((t) => t.trim()) : [],
          description: body || flags["description"] || "",
          criteria: flags["criteria"] ? JSON.parse(flags["criteria"]) as string[] : [],
          source: flags["source"] ?? "manual",
          dependsOn: flags["depends-on"]
            ? flags["depends-on"].split(",").map((t) => t.trim())
            : [],
        });
        output(result, json);
        break;
      }

      case "task-list": {
        const status = flags["status"] as TaskStatus | undefined;
        const items = await taskList(cwd, status);
        output(items, json);
        break;
      }

      case "task-move": {
        const id = positional[0];
        if (!id) {
          console.error("Usage: flowstate task-move <id> --to <active|complete|pending>");
          process.exit(1);
        }
        const to = required(flags, "to") as "active" | "complete" | "pending";
        const result = await taskMove(cwd, id, to);
        output(result, json);
        break;
      }

      case "task-update": {
        const id = positional[0];
        if (!id) {
          console.error("Usage: flowstate task-update <id> --set key=value [--log msg]");
          process.exit(1);
        }
        const updates: Record<string, string> = {};
        const sets = flagArrays["set"] ?? [];
        for (const pair of sets) {
          const eqIdx = pair.indexOf("=");
          if (eqIdx !== -1) {
            updates[pair.slice(0, eqIdx).trim()] = pair.slice(eqIdx + 1).trim();
          }
        }
        const result = await taskUpdate(cwd, id, updates, flags["log"]);
        output(result, json);
        break;
      }

      case "task-unblock": {
        const id = positional[0];
        if (!id) {
          console.error("Usage: flowstate task-unblock <id> [--resolution text]");
          process.exit(1);
        }
        const result = await taskUnblock(cwd, id, flags["resolution"]);
        output(result, json);
        break;
      }

      case "stats": {
        const result = await stats(cwd);
        output(result, json);
        break;
      }

      case "index-rebuild": {
        const type = (flags["type"] ?? "all") as "tasks" | "learnings" | "all";
        await indexRebuild(cwd, type);
        output({ rebuilt: type }, json);
        break;
      }

      case "plan-create": {
        const body = await getBody(flags);
        const result = await planCreate(cwd, {
          title: required(flags, "title"),
          complexity: validateComplexity(required(flags, "complexity")),
          body,
        });
        output(result, json);
        break;
      }

      case "plan-move": {
        const id = positional[0];
        if (!id) {
          console.error("Usage: flowstate plan-move <id> --status <approved|discarded>");
          process.exit(1);
        }
        const result = await planMove(
          cwd,
          id,
          required(flags, "status") as "approved" | "discarded",
          flags["task-id"],
        );
        output(result, json);
        break;
      }

      case "report-create": {
        const body = await getBody(flags);
        const result = await reportCreate(cwd, {
          title: required(flags, "title"),
          type: validateReportType(required(flags, "type")),
          severity: validateSeverity(required(flags, "severity")),
          body,
        });
        output(result, json);
        break;
      }

      case "report-move": {
        const id = positional[0];
        if (!id) {
          console.error("Usage: flowstate report-move <id> --status <triaged|discarded>");
          process.exit(1);
        }
        const result = await reportMove(
          cwd,
          id,
          required(flags, "status") as "triaged" | "discarded",
          flags["task-id"],
        );
        output(result, json);
        break;
      }

      case "learning-create": {
        const body = await getBody(flags);
        const result = await learningCreate(cwd, {
          title: required(flags, "title"),
          tags: flags["tags"] ? flags["tags"].split(",").map((t) => t.trim()) : [],
          body,
          task: flags["task"],
        });
        output(result, json);
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (json) {
      console.error(JSON.stringify({ error: message }));
    } else {
      console.error(`Error: ${message}`);
    }
    process.exit(1);
  }
}

function output(data: unknown, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(data, null, 2));
  } else if (typeof data === "object" && data !== null) {
    if (Array.isArray(data)) {
      for (const item of data) {
        if (typeof item === "object" && item !== null) {
          const record = item as Record<string, unknown>;
          console.log(
            Object.values(record)
              .filter((v) => v !== undefined)
              .join("\t"),
          );
        }
      }
    } else {
      const record = data as Record<string, unknown>;
      for (const [key, value] of Object.entries(record)) {
        console.log(`${key}: ${value}`);
      }
    }
  } else {
    console.log(data);
  }
}

main();
