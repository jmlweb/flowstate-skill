import { join } from "node:path";
import type { Complexity } from "../core/types.js";
import { today } from "../core/date.js";
import { titleToSlug } from "../core/slug.js";
import { planDir } from "../core/paths.js";
import { writeEntity } from "../core/fs.js";
import { nextId } from "./next-id.js";

export interface PlanCreateInput {
  readonly title: string;
  readonly complexity: Complexity;
  readonly body: string;
}

export async function planCreate(
  cwd: string,
  input: PlanCreateInput,
): Promise<{ id: string; path: string }> {
  const id = await nextId(cwd, "plan");
  const slug = titleToSlug(input.title);
  const filename = `${id}-${slug}.md`;
  const dir = planDir(cwd, "pending");
  const filePath = join(dir, filename);

  const frontmatter: Record<string, unknown> = {
    id,
    title: input.title,
    status: "pending",
    created: today(),
    complexity: input.complexity,
  };

  await writeEntity(filePath, frontmatter, `\n${input.body}`);
  return { id, path: filePath };
}
