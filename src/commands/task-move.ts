import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { TaskStatus } from "../core/types.js";
import { taskDir, taskIndexPath } from "../core/paths.js";
import { findEntityFile, readEntity, writeEntity, moveFile } from "../core/fs.js";
import { today } from "../core/date.js";
import { addTableRow, removeTableRow } from "../core/markdown.js";
import { EntityNotFoundError } from "../core/errors.js";

const STATUS_TO_DIR: Record<string, TaskStatus> = {
  active: "active",
  complete: "complete",
  pending: "pending",
};

const SEARCH_DIRS: readonly TaskStatus[] = ["pending", "active", "complete"];

export async function taskMove(
  cwd: string,
  id: string,
  to: "active" | "complete" | "pending",
): Promise<{ path: string }> {
  // Find the task in any directory
  let sourcePath: string | undefined;
  let sourceDir: string | undefined;
  let fileName: string | undefined;

  for (const status of SEARCH_DIRS) {
    const dir = taskDir(cwd, status);
    const found = await findEntityFile(dir, id);
    if (found) {
      sourcePath = join(dir, found);
      sourceDir = dir;
      fileName = found;
      break;
    }
  }

  if (!sourcePath || !sourceDir || !fileName) {
    throw new EntityNotFoundError(id, "tasks/{pending,active,complete}");
  }

  const doc = await readEntity(sourcePath);
  const fm = { ...(doc.frontmatter as Record<string, unknown>) };
  const date = today();
  const oldStatus = String(fm["status"] ?? "pending");

  // Update frontmatter based on target
  fm["status"] = to === "active" && fm["blocked-by"] ? "blocked" : to;

  if (to === "active" && !fm["started"]) {
    fm["started"] = date;
  }
  if (to === "complete") {
    fm["completed"] = date;
    if (!fm["started"]) fm["started"] = date;
  }

  // Add progress log entry
  const actionMap: Record<string, string> = {
    active: "Started",
    complete: "Completed",
    pending: "Returned to pending",
  };
  const logEntry = `- [${date}] ${actionMap[to] ?? to}`;
  const body = appendProgressLog(doc.body, logEntry);

  const destDir = taskDir(cwd, STATUS_TO_DIR[to]!);
  const destPath = join(destDir, fileName);

  await writeEntity(sourcePath, fm, body);

  if (sourcePath !== destPath) {
    await moveFile(sourcePath, destPath);
  }

  // Update index
  await updateIndex(cwd, id, fm, oldStatus, to, date);

  return { path: destPath };
}

function appendProgressLog(body: string, entry: string): string {
  const lines = body.split("\n");
  // Find last non-empty line (progress log entries are at the end)
  let insertIndex = lines.length;
  // Just append at end
  while (insertIndex > 0 && lines[insertIndex - 1]!.trim() === "") {
    insertIndex--;
  }
  lines.splice(insertIndex, 0, entry);
  return lines.join("\n");
}

async function updateIndex(
  cwd: string,
  id: string,
  fm: Record<string, unknown>,
  oldStatus: string,
  newStatus: string,
  date: string,
): Promise<void> {
  const indexPath = taskIndexPath(cwd);
  let content = await readFile(indexPath, "utf-8");

  // Remove from Pending Tasks table if it was pending
  if (oldStatus === "pending") {
    content = removeTableRow(content, "Pending Tasks", (row) =>
      row.includes(id),
    );
    content = decrementStat(content, "Pending");
  }

  // Remove from Active Tasks section if it was active/blocked
  if (oldStatus === "active" || oldStatus === "blocked") {
    // Active tasks are listed as markdown list items, not table rows
    const lines = content.split("\n");
    const filtered = lines.filter((line) => !line.includes(id));
    content = filtered.join("\n");

    if (oldStatus === "blocked") {
      content = decrementStat(content, "Blocked");
    } else {
      content = decrementStat(content, "Active");
    }
  }

  // Add to new section
  if (newStatus === "active") {
    content = incrementStat(content, fm["blocked-by"] ? "Blocked" : "Active");
  } else if (newStatus === "complete") {
    content = incrementStat(content, "Complete");
    const completedRow = `| ${id} | ${fm["title"]} | ${date} |`;
    content = addTableRow(content, "Recently Completed", completedRow);
  } else if (newStatus === "pending") {
    content = incrementStat(content, "Pending");
    const tags = Array.isArray(fm["tags"]) ? (fm["tags"] as string[]).join(", ") : "";
    const pendingRow = `| ${id} | ${fm["title"]} | ${fm["priority"]} | ${tags} | ${fm["created"]} |`;
    content = addTableRow(content, "Pending Tasks", pendingRow);
  }

  await writeFile(indexPath, content, "utf-8");
}

function incrementStat(content: string, label: string): string {
  const pattern = new RegExp(`\\| ${label} \\| (\\d+) \\|`);
  const match = content.match(pattern);
  if (!match) return content;
  const current = parseInt(match[1]!, 10);
  return content.replace(pattern, `| ${label} | ${current + 1} |`);
}

function decrementStat(content: string, label: string): string {
  const pattern = new RegExp(`\\| ${label} \\| (\\d+) \\|`);
  const match = content.match(pattern);
  if (!match) return content;
  const current = parseInt(match[1]!, 10);
  return content.replace(pattern, `| ${label} | ${Math.max(0, current - 1)} |`);
}
