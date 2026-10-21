/**
 * model-watch-queue.mjs -- pure queue snapshot builder (docs/DATA_MODEL_AI_MODEL_WATCH.md section 7).
 */
import { sha256Text } from "./model-watch-core.mjs";

/** Pure: build the snapshot object from the QUEUE.json text. */
export function buildQueueSnapshot(queueText) {
  const q = JSON.parse(queueText);
  if (!Array.isArray(q.entries) || typeof q.updated_at !== "string") throw new Error("QUEUE.json needs updated_at and entries[]");
  return {
    updated_at: q.updated_at,
    sourceSha256: sha256Text(queueText),
    entries: q.entries
      .map((e) => ({ tag: e.tag, developer: e.developer, status: e.status }))
      .sort((a, b) => (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0)),
  };
}
