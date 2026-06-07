import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { description, niche, geography } = body as Record<string, unknown>;

  if (!description || typeof description !== "string" || description.trim() === "") {
    return NextResponse.json(
      { error: "description is required and must be a non-empty string" },
      { status: 400 }
    );
  }

  if (!niche || typeof niche !== "string" || niche.trim() === "") {
    return NextResponse.json(
      { error: "niche is required and must be a non-empty string" },
      { status: 400 }
    );
  }

  try {
    const handle = await tasks.trigger("generate-leads", {
      description: description.trim(),
      niche: niche.trim(),
      geography:
        typeof geography === "string" && geography.trim() !== ""
          ? geography.trim()
          : undefined,
    });

    return NextResponse.json({ runId: handle.id }, { status: 200 });
  } catch (err) {
    console.error("[generate] tasks.trigger failed", {
      endpoint: "trigger.dev/tasks.trigger",
      payload: { task: "generate-leads", description, niche, geography },
      timestamp: new Date().toISOString(),
      error: String(err),
    });
    return NextResponse.json(
      { error: "Failed to start lead generation job" },
      { status: 500 }
    );
  }
}
