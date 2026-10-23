#!/usr/bin/env node
// inspect-structure.mjs: prints the SHAPE of the pilot files (keys, types, array lengths), never a value.
// Used before PREREGISTRATION.md was written, so that field names were checked without reading any rating.
// Usage: node inspect-structure.mjs <file> [<file> ...]
import { readFileSync } from "node:fs";

function shape(v, depth) {
  if (Array.isArray(v)) {
    if (v.length === 0) return "[] (len 0)";
    return { "[array]": `len ${v.length}`, first: depth > 0 ? shape(v[0], depth - 1) : "..." };
  }
  if (v === null) return "null";
  if (typeof v === "object") {
    const keys = Object.keys(v);
    if (keys.length > 40) return `{object with ${keys.length} keys, e.g. ${keys.slice(0, 5).map((k) => k.length > 30 ? "<long>" : k).join(", ")}}`;
    const o = {};
    for (const k of keys) o[k] = depth > 0 ? shape(v[k], depth - 1) : typeof v[k];
    return o;
  }
  return typeof v;
}

const depth = Number(process.env.DEPTH ?? 4);
for (const f of process.argv.slice(2)) {
  const j = JSON.parse(readFileSync(f, "utf8"));
  console.log("=== " + f);
  console.log(JSON.stringify(shape(j, depth), null, 1));
}
