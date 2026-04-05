import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { taskUpdate } from "./task-update.js";
import { taskCreate } from "./task-create.js";
import { init } from "./init.js";
import { readEntity } from "../core/fs.js";

let tmp: string;

beforeEach(async () => {
  tmp = await mkdtemp(join(tmpdir(), "flowstate-test-"));
  await init(tmp, "Test");
  await taskCreate(tmp, {
    title: "Fix bug",
    priority: "P2",
    tags: [],
    description: "Desc",
    criteria: [],
    source: "manual",
    dependsOn: [],
  });
});

afterEach(async () => {
  await rm(tmp, { recursive: true, force: true });
});

describe("taskUpdate", () => {
  it("updates frontmatter fields", async () => {
    const result = await taskUpdate(tmp, "TSK-001", {
      status: "blocked",
      "blocked-by": "waiting for API",
    });

    const doc = await readEntity(result.path);
    const fm = doc.frontmatter as Record<string, unknown>;
    expect(fm["status"]).toBe("blocked");
    expect(fm["blocked-by"]).toBe("waiting for API");
  });

  it("adds a progress log entry", async () => {
    const result = await taskUpdate(
      tmp,
      "TSK-001",
      { status: "blocked" },
      "Blocked: waiting for API credentials",
    );

    const doc = await readEntity(result.path);
    expect(doc.body).toContain("Blocked: waiting for API credentials");
  });

  it("throws for non-existent task", async () => {
    await expect(
      taskUpdate(tmp, "TSK-999", { status: "blocked" }),
    ).rejects.toThrow("not found");
  });
});
