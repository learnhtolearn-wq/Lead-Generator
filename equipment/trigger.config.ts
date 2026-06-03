import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF ?? "proj_your_project_ref_here",
  runtime: "node",
  logLevel: "log",
  dirs: ["./src/jobs"],
});
