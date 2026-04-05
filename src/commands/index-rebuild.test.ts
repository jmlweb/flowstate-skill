import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { indexRebuild } from "./index-rebuild.js";
import { taskCreate } from "./task-create.js";
import { taskMove } from "./task-move.js";
import { init } from "./init.js";

let tmp: string;

beforeEach(async () => {
  tmp = await mkdtemp(join(tmpdir(), "flowstate-test-"));
  await init(tmp, "Test");
});

afterEach(async () => {
  await rm(tmp, { recursive: true, force: true });
});

describe("indexRebuild", () => {
  it("rebuilds task index from disk state", async () => {
    await taskCreate(tmp, { title: "A", priority: "P1", tags: ["api"], description: "", criteria: [], source: "manual", dependsOn: [] });
    await taskCreate(tmp, { title: "B", priority: "P2", tags: [], description: "", criteria: [], source: "manual", dependsOn: [] });
    await taskMove(tmp, "TSK-001", "active");

    await indexRebuild(tmp, "tasks");

    const index = await readFile(
      join(tmp, ".backlog", "tasks", "index.md"),
      "utf-8",
    );
    expect(index).toContain("| Pending | 1 |");
    expect(index).toContain("| Active | 1 |");
    expect(index).toContain("| TSK-002 | B | P2 |");
  });

  it("handles empty backlog", async () => {
    await indexRebuild(tmp, "tasks");

    const index = await readFile(
      join(tmp, ".backlog", "tasks", "index.md"),
      "utf-8",
    );
    expect(index).toContain("| Pending | 0 |");
    expect(index).toContain("| Active | 0 |");
  });
});
