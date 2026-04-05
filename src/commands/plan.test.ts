import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { planCreate } from "./plan-create.js";
import { planMove } from "./plan-move.js";
import { init } from "./init.js";
import { readEntity } from "../core/fs.js";

let tmp: string;

beforeEach(async () => {
  tmp = await mkdtemp(join(tmpdir(), "flowstate-test-"));
  await init(tmp, "Test");
});

afterEach(async () => {
  await rm(tmp, { recursive: true, force: true });
});

describe("planCreate", () => {
  it("creates a plan in plans/pending/", async () => {
    const result = await planCreate(tmp, {
      title: "Refactor auth module",
      complexity: "medium",
      body: "# Refactor auth module\n\n## Goal\n\nClean up auth.",
    });

    expect(result.id).toBe("PLN-001");
    const doc = await readEntity(result.path);
    const fm = doc.frontmatter as Record<string, unknown>;
    expect(fm["complexity"]).toBe("medium");
    expect(fm["status"]).toBe("pending");
    expect(doc.body).toContain("## Goal");
  });
});

describe("planMove", () => {
  it("moves plan to complete/ with approved status", async () => {
    const { id } = await planCreate(tmp, {
      title: "Refactor auth",
      complexity: "high",
      body: "Plan body",
    });

    const result = await planMove(tmp, id, "approved", "TSK-001");

    expect(result.path).toContain("plans/complete/");
    const doc = await readEntity(result.path);
    const fm = doc.frontmatter as Record<string, unknown>;
    expect(fm["status"]).toBe("approved");
    expect(fm["reviewed"]).toBeTruthy();
    expect(fm["task-id"]).toBe("TSK-001");
  });

  it("moves plan to complete/ with discarded status", async () => {
    const { id } = await planCreate(tmp, {
      title: "Bad plan",
      complexity: "low",
      body: "Nope",
    });

    const result = await planMove(tmp, id, "discarded");
    const doc = await readEntity(result.path);
    const fm = doc.frontmatter as Record<string, unknown>;
    expect(fm["status"]).toBe("discarded");
    expect(fm["task-id"]).toBeUndefined();
  });

  it("throws for non-existent plan", async () => {
    await expect(planMove(tmp, "PLN-999", "approved")).rejects.toThrow("not found");
  });
});
