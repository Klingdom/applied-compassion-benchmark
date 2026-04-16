/**
 * Dynamic import helper for daily briefing JSON files.
 * Each file is imported on-demand at build time via Next.js static export.
 */
export async function getDailyData(date: string): Promise<unknown | null> {
  try {
    // Dynamic import — Next.js resolves this at build time for all dates
    // returned by generateStaticParams in the [date] route.
    const data = await import(`./${date}.json`);
    return data.default;
  } catch {
    return null;
  }
}
