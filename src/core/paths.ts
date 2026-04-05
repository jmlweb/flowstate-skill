import { join } from "node:path";
import type { EntityType, TaskStatus } from "./types.js";

export function backlogRoot(cwd: string): string {
  return join(cwd, ".backlog");
}

export function taskDir(cwd: string, status: TaskStatus | "all"): string {
  if (status === "blocked") return taskDir(cwd, "active");
  if (status === "all") return join(backlogRoot(cwd), "tasks");
  return join(backlogRoot(cwd), "tasks", status);
}

export function planDir(
  cwd: string,
  status: "pending" | "complete",
): string {
  return join(backlogRoot(cwd), "plans", status);
}

export function reportDir(
  cwd: string,
  status: "pending" | "complete",
): string {
  return join(backlogRoot(cwd), "reports", status);
}

export function learningsDir(cwd: string): string {
  return join(backlogRoot(cwd), "learnings");
}

export function taskIndexPath(cwd: string): string {
  return join(backlogRoot(cwd), "tasks", "index.md");
}

export function learningsIndexPath(cwd: string): string {
  return join(backlogRoot(cwd), "learnings", "index.md");
}

export const TASK_DIRS: readonly TaskStatus[] = [
  "pending",
  "active",
  "complete",
];

export const ENTITY_DIRS: Record<
  EntityType,
  readonly { readonly dir: string; readonly status: string }[]
> = {
  task: [
    { dir: "tasks/pending", status: "pending" },
    { dir: "tasks/active", status: "active" },
    { dir: "tasks/complete", status: "complete" },
  ],
  plan: [
    { dir: "plans/pending", status: "pending" },
    { dir: "plans/complete", status: "complete" },
  ],
  report: [
    { dir: "reports/pending", status: "pending" },
    { dir: "reports/complete", status: "complete" },
  ],
  learning: [{ dir: "learnings", status: "" }],
};
