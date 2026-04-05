import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { init } from "./init.js";

let tmp: string;

beforeEach(async () => {
  tmp = await mkdtemp(join(tmpdir(), "flowstate-test-"));
});

afterEach(async () => {
  await rm(tmp, { recursive: true, force: true });
});

describe("init", () => {
  it("creates .backlog directory structure", async () => {
    await init(tmp, "Test Project");

    const backlog = join(tmp, ".backlog");
    const entries = await readdir(backlog);
    expect(entries.sort()).toEqual(["learnings", "plans", "reports", "tasks"]);

    const tasks = await readdir(join(backlog, "tasks"));
    expect(tasks.sort()).toEqual(["active", "complete", "index.md", "pending"]);

    const plans = await readdir(join(backlog, "plans"));
    expect(plans.sort()).toEqual(["complete", "pending"]);

    const reports = await readdir(join(backlog, "reports"));
    expect(reports.sort()).toEqual(["complete", "pending"]);
  });

  it("creates index files with project name", async () => {
    await init(tmp, "My Cool Project");

    const taskIndex = await readFile(
      join(tmp, ".backlog", "tasks", "index.md"),
      "utf-8",
    );
    expect(taskIndex).toContain("# My Cool Project - Task Index");
    expect(taskIndex).toContain("| Pending | 0 |");

    const learningsIndex = await readFile(
      join(tmp, ".backlog", "learnings", "index.md"),
      "utf-8",
    );
    expect(learningsIndex).toContain("# My Cool Project - Learnings Index");
  });

  it("is idempotent", async () => {
    await init(tmp, "Project");
    await init(tmp, "Project");

    const entries = await readdir(join(tmp, ".backlog", "tasks"));
    expect(entries).toContain("index.md");
  });
});
