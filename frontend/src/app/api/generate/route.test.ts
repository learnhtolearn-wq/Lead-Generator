/**
 * @jest-environment node
 */
import { POST } from "./route";
import { NextRequest } from "next/server";

jest.mock("@trigger.dev/sdk/v3", () => ({
  tasks: { trigger: jest.fn() },
}));

import { tasks } from "@trigger.dev/sdk/v3";
const mockTrigger = jest.mocked(tasks.trigger);

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/generate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TRIGGER_SECRET_KEY = "tr_dev_test_secret";
  });

  it("returns 400 when description is missing", async () => {
    const req = makeRequest({ niche: "restaurant tech", geography: "" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/description/i);
  });

  it("returns 400 when niche is missing", async () => {
    const req = makeRequest({ description: "SaaS for restaurants", geography: "" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/niche/i);
  });

  it("triggers the job and returns runId on valid input", async () => {
    mockTrigger.mockResolvedValueOnce({ id: "run_abc123" } as never);
    const req = makeRequest({ description: "SaaS tools for restaurants", niche: "restaurant tech", geography: "United States" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.runId).toBe("run_abc123");
    expect(mockTrigger).toHaveBeenCalledWith("generate-leads", {
      description: "SaaS tools for restaurants",
      niche: "restaurant tech",
      geography: "United States",
    });
  });

  it("returns 500 when trigger throws", async () => {
    mockTrigger.mockRejectedValueOnce(new Error("Trigger.dev unreachable"));
    const req = makeRequest({ description: "SaaS tools", niche: "tech", geography: "" });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/failed/i);
  });
});
