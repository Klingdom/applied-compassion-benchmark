import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DashboardPage, { dashboardMetadata } from "@/components/model-benchmark/dashboard/DashboardPage";
import { latestRunId, loadDashboardData } from "@/lib/model-dashboard-facts";

/*
 * /ai-models/dashboard -- the AI Model Compassion Dashboard for the LATEST renderable wave.
 * Binding specs: docs/ai-dashboard/{PRD,UX_FLOWS,DATAVIZ}_AI_MODEL_DASHBOARD.md; DECISIONS.md D-29a (+ proposed D-29b).
 *
 * GATE. This file is a page only when "dashboard.tsx" is a page extension (next.config.ts adds it exactly when the dashboard's OWN gate is
 * open, D-29b ratified or CB_PREVIEW_DASHBOARD=1, and a dashboard wave renders; scripts/lib/dashboard-render-gate.mjs). It is NOT tied to
 * the pilot-report gate: ratified pilot reports do not publish the dashboard. Gate closed: the route does not exist and the sitemap has no entry.
 * Every wave is also a permanent page at /ai-models/dashboard/<run_id>; this one moves when a newer wave publishes.
 */

export function generateMetadata(): Metadata {
  const id = latestRunId();
  if (!id) notFound();
  return dashboardMetadata(loadDashboardData(id));
}

export default function Page() {
  const id = latestRunId();
  if (!id) notFound();
  const d = loadDashboardData(id);
  return <DashboardPage d={d} mode={d.mode} />;
}
