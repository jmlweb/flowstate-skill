import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const CLI = join(import.meta.dirname, "../../dist/bin/flowstate.js");
let tmp: string;

function run(
  ...args: string[]
): string {
  return execFileSync("node", [CLI, ...args], {
    cwd: tmp,
    encoding: "utf-8",
    timeout: 10000,
  }).trim();
}

function runJson(...args: string[]): unknown {
  const out = run(...args, "--json", "true");
  return JSON.parse(out);
}

beforeEach(async () => {
  tmp = await mkdtemp(join(tmpdir(), "flowstate-int-"));
});

afterEach(async () => {
  await rm(tmp, { recursive: true, force: true });
});

describe("CLI integration", () => {
  it("init creates .backlog structure", () => {
    run("init", "--project-name", "IntTest");
    const result = runJson("stats") as Record<string, number>;
    expect(result).toEqual({ pending: 0, active: 0, blocked: 0, complete: 0 });
  });

  it("full task lifecycle: create -> start -> complete", () => {
    run("init", "--project-name", "IntTest");

    const created = runJson(
      "task-create",
      "--title", "Integration test task",
      "--priority", "P2",
      "--tags", "test,integration",
      "--description", "Testing the CLI",
      "--criteria", '["It works","No errors"]',
    ) as { id: string; path: string };

    expect(created.id).toBe("TSK-001");

    // Start
    run("task-move", "TSK-001", "--to", "active");

    // Check stats
    const afterStart = runJson("stats") as Record<string, number>;
    expect(afterStart).toEqual({ pending: 0, active: 1, blocked: 0, complete: 0 });

    // Complete
    run("task-move", "TSK-001", "--to", "complete");

    const afterComplete = runJson("stats") as Record<string, number>;
    expect(afterComplete).toEqual({ pending: 0, active: 0, blocked: 0, complete: 1 });
  });

  it("task-list returns items", () => {
    run("init", "--project-name", "IntTest");
    run("task-create", "--title", "A", "--priority", "P1", "--description", "test");
    run("task-create", "--title", "B", "--priority", "P3", "--description", "test");

    const list = runJson("task-list") as unknown[];
    expect(list).toHaveLength(2);
  });

  it("next-id returns correct ID", () => {
    run("init", "--project-name", "IntTest");
    const result = runJson("next-id", "task") as { id: string };
    expect(result.id).toBe("TSK-001");

    run("task-create", "--title", "A", "--priority", "P2", "--description", "");
    const result2 = runJson("next-id", "task") as { id: string };
    expect(result2.id).toBe("TSK-002");
  });

  it("plan lifecycle: create -> approve", () => {
    run("init", "--project-name", "IntTest");

    const plan = runJson(
      "plan-create",
      "--title", "Refactor auth",
      "--complexity", "high",
      "--body", "The plan body",
    ) as { id: string };

    expect(plan.id).toBe("PLN-001");

    run("plan-move", "PLN-001", "--status", "approved", "--task-id", "TSK-001");

    // Verify moved to complete
    const entries = execFileSync("ls", [join(tmp, ".backlog/plans/complete")], {
      encoding: "utf-8",
    }).trim();
    expect(entries).toContain("PLN-001");
  });

  it("report lifecycle: create -> triage", () => {
    run("init", "--project-name", "IntTest");

    const report = runJson(
      "report-create",
      "--title", "Auth bug",
      "--type", "bug",
      "--severity", "high",
      "--body", "Details here",
    ) as { id: string };

    expect(report.id).toBe("RPT-001");

    run("report-move", "RPT-001", "--status", "triaged", "--task-id", "TSK-001");
  });

  it("learning-create creates directory", () => {
    run("init", "--project-name", "IntTest");

    const learning = runJson(
      "learning-create",
      "--title", "Always test first",
      "--tags", "tdd,testing",
      "--body", "Content here",
    ) as { id: string };

    expect(learning.id).toBe("LRN-001");
  });

  it("index-rebuild regenerates index", () => {
    run("init", "--project-name", "IntTest");
    run("task-create", "--title", "A", "--priority", "P1", "--description", "test");
    run("task-create", "--title", "B", "--priority", "P2", "--description", "test");
    run("task-move", "TSK-001", "--to", "active");

    run("index-rebuild", "--type", "tasks");

    const index = execFileSync(
      "cat",
      [join(tmp, ".backlog/tasks/index.md")],
      { encoding: "utf-8" },
    );
    expect(index).toContain("| Pending | 1 |");
    expect(index).toContain("| Active | 1 |");
  });
});
