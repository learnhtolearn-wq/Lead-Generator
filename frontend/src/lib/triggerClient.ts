export async function pollRun(
  runId: string,
  onStatus: (status: string) => void,
  intervalMs = 3000
): Promise<{ output: { leads: unknown[] }; status: string }> {
  const terminalStatuses = ["COMPLETED", "FAILED", "CANCELED", "CRASHED", "TIMED_OUT"];

  while (true) {
    const res = await fetch(`/api/status/${runId}`);
    const data = (await res.json()) as { status: string; output: { leads: unknown[] } | null };

    onStatus(data.status);

    if (terminalStatuses.includes(data.status)) {
      return { status: data.status, output: data.output ?? { leads: [] } };
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}
