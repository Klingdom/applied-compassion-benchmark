// research/model-runs/lib/ollama.mjs
//
// Minimal client for the local Ollama HTTP API. No dependencies: global fetch only. `fetchImpl` is
// injectable so tests never need Ollama running.
//
//   GET  /api/version  -> { version }
//   GET  /api/tags     -> { models: [{ name, digest, ... }] }   (digest verification)
//   POST /api/chat     -> non-streaming; one request, one JSON reply

import { HarnessError } from "./common.mjs";

export class OllamaError extends Error {}

export const DEFAULT_OLLAMA_HOST = "http://localhost:11434";

export function normaliseDigest(d) {
  return String(d ?? "").trim().toLowerCase().replace(/^sha256:/, "");
}

export function createOllamaClient({ host = DEFAULT_OLLAMA_HOST, fetchImpl = globalThis.fetch, timeoutMs = 600000 } = {}) {
  const base = String(host).replace(/\/+$/, "");

  async function call(method, pathname, body) {
    let res;
    try {
      res = await fetchImpl(`${base}${pathname}`, {
        method,
        headers: body === undefined ? undefined : { "content-type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (e) {
      throw new OllamaError(`${method} ${pathname} failed: ${e && e.cause && e.cause.code ? e.cause.code : e.message}`);
    }
    const text = await res.text();
    if (!res.ok) throw new OllamaError(`${method} ${pathname} -> HTTP ${res.status}: ${text.slice(0, 300)}`);
    try {
      return JSON.parse(text);
    } catch {
      throw new OllamaError(`${method} ${pathname}: response is not JSON: ${text.slice(0, 200)}`);
    }
  }

  return {
    host: base,
    async version() {
      const r = await call("GET", "/api/version");
      if (!r || typeof r.version !== "string") throw new OllamaError("/api/version returned no version string");
      return r.version;
    },
    async listModels() {
      const r = await call("GET", "/api/tags");
      if (!r || !Array.isArray(r.models)) throw new OllamaError("/api/tags returned no models array");
      return r.models;
    },
    /** One non-streaming chat call. `options` is passed through unchanged (the caller decides, and records, it). */
    async chat({ model, messages, options }) {
      return call("POST", "/api/chat", { model, messages, options, stream: false });
    },
  };
}

/**
 * Refuse unless the live digest of `tag` equals the pinned one. Returns the live digest (normalised).
 * A missing model, a missing digest, or any difference refuses: the run describes the pinned build only.
 */
export async function verifyPinnedDigest(client, { tag, digest }) {
  const models = await client.listModels();
  const m = models.find((x) => x && (x.name === tag || x.model === tag));
  if (!m) throw new HarnessError(`model "${tag}" is not installed in Ollama (/api/tags lists: ${models.map((x) => x.name).join(", ") || "nothing"}).`);
  const live = normaliseDigest(m.digest);
  const pinned = normaliseDigest(digest);
  if (!pinned) throw new HarnessError(`no pinned digest for "${tag}" in the run config; refusing.`);
  if (live !== pinned) {
    throw new HarnessError(
      `digest mismatch for "${tag}": live ${live || "(none)"} but the pre-registration pins ${pinned}. ` +
        "The run describes the pinned build only; refusing to call the model."
    );
  }
  return live;
}
