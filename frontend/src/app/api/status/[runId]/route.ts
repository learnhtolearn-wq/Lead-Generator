import { NextRequest, NextResponse } from "next/server";
import { runs } from "@trigger.dev/sdk/v3";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
): Promise<NextResponse> {
  const { runId } = await params;

  try {
    const run = await runs.retrieve(runId);
    return NextResponse.json({ status: run.status, output: run.output ?? null });
  } catch (err) {
    console.error("[status] runs.retrieve failed", {
      endpoint: "trigger.dev/runs.retrieve",
      payload: { runId },
      timestamp: new Date().toISOString(),
      error: String(err),
    });
    return NextResponse.json({ error: "Failed to retrieve run status" }, { status: 500 });
  }
}
