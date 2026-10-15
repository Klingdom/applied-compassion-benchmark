import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DashboardPage, { dashboardMetadata } from "@/components/model-benchmark/dashboard/DashboardPage";
import { dashboardEntries, loadDashboardData } from "@/lib/model-dashboard-facts";

/*
 * /ai-models/dashboard/<run_id> -- the dashboard for ONE wave, a permanent address (one per renderable wave).
 * Same gate as /ai-models/dashboard (the dashboard's own gate, not the pilot-report gate): exists only when D-29b is ratified or CB_PREVIEW_DASHBOARD=1, and a wave renders. dynamicParams = false: any other run id is a 404 at export time.
 * The wave is the route (no wave key in the URL hash); model, dimension, panel, view and exploratory state live in the hash.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return dashboardEntries().map((x) => ({ runId: x.entry.run_id }));
}

export async function generateMetadata({ params }: { params: Promise<{ runId: string }> }): Promise<Metadata> {
  const { runId } = await params;
  return dashboardMetadata(loadDashboardData(runId));
}

export default async function Page({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  if (!dashboardEntries().some((x) => x.entry.run_id === runId)) notFound();
  const d = loadDashboardData(runId);
  return <DashboardPage d={d} mode={d.mode} />;
}
