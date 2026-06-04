import { runs } from "@trigger.dev/sdk/v3";

export async function pollRun(
  runId: string,
  onStatus: (status: string) => void,
  intervalMs = 3000
): Promise<{ output: { leads: unknown[] }; status: string }> {
  while (true) {
    const run = await runs.retrieve(runId);
    onStatus(run.status);

    const terminalStatuses = ["COMPLETED", "FAILED", "CANCELED", "CRASHED", "TIMED_OUT"];
    if (terminalStatuses.includes(run.status)) {
      return run as { output: { leads: unknown[] }; status: string };
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}
