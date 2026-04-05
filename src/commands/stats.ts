import { taskDir } from "../core/paths.js";
import { listFiles, readEntity } from "../core/fs.js";
import { join } from "node:path";

export interface BacklogStats {
  readonly pending: number;
  readonly active: number;
  readonly blocked: number;
  readonly complete: number;
}

export async function stats(cwd: string): Promise<BacklogStats> {
  let pending = 0;
  let active = 0;
  let blocked = 0;
  let complete = 0;

  const counts = await Promise.all(
    (["pending", "active", "complete"] as const).map(async (status) => {
      const dir = taskDir(cwd, status);
      const files = await listFiles(dir);
      const filtered = files.filter((f) => f.name !== "index.md");

      if (status === "active") {
        // Separate active from blocked
        let activeCount = 0;
        let blockedCount = 0;
        for (const file of filtered) {
          const doc = await readEntity(join(dir, file.name));
          const fm = doc.frontmatter as Record<string, unknown>;
          if (fm["blocked-by"]) {
            blockedCount++;
          } else {
            activeCount++;
          }
        }
        return { status, active: activeCount, blocked: blockedCount, count: 0 };
      }

      return { status, count: filtered.length, active: 0, blocked: 0 };
    }),
  );

  for (const c of counts) {
    if (c.status === "pending") pending = c.count;
    else if (c.status === "active") {
      active = c.active;
      blocked = c.blocked;
    } else if (c.status === "complete") complete = c.count;
  }

  return { pending, active, blocked, complete };
}
