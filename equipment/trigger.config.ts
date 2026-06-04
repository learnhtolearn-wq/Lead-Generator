import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_flqfekpkchhtjrncdmzv",
  runtime: "node",
  logLevel: "log",
  maxDuration: 300,
  dirs: ["./src/trigger"],
  build: {
    external: ["@mendable/firecrawl-js"],
  },
});
