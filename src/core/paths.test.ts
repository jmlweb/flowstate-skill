import { describe, it, expect } from "vitest";
import { backlogRoot, taskDir, planDir, reportDir, taskIndexPath } from "./paths.js";

describe("paths", () => {
  const cwd = "/project";

  it("backlogRoot", () => {
    expect(backlogRoot(cwd)).toBe("/project/.backlog");
  });

  it("taskDir for each status", () => {
    expect(taskDir(cwd, "pending")).toBe("/project/.backlog/tasks/pending");
    expect(taskDir(cwd, "active")).toBe("/project/.backlog/tasks/active");
    expect(taskDir(cwd, "complete")).toBe("/project/.backlog/tasks/complete");
  });

  it("taskDir for blocked maps to active", () => {
    expect(taskDir(cwd, "blocked")).toBe("/project/.backlog/tasks/active");
  });

  it("planDir", () => {
    expect(planDir(cwd, "pending")).toBe("/project/.backlog/plans/pending");
    expect(planDir(cwd, "complete")).toBe("/project/.backlog/plans/complete");
  });

  it("reportDir", () => {
    expect(reportDir(cwd, "pending")).toBe("/project/.backlog/reports/pending");
  });

  it("taskIndexPath", () => {
    expect(taskIndexPath(cwd)).toBe("/project/.backlog/tasks/index.md");
  });
});
