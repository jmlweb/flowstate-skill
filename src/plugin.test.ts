import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;

describe("plugin manifest", () => {
  it("plugin.json version matches package.json version", async () => {
    const [pkg, plugin] = await Promise.all([
      readFile(join(root, "package.json"), "utf-8").then(JSON.parse),
      readFile(join(root, ".claude-plugin/plugin.json"), "utf-8").then(JSON.parse),
    ]);
    expect(plugin.version).toBe(pkg.version);
  });
});
