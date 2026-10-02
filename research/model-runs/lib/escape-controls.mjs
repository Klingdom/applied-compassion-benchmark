/**
 * escape-controls.mjs — lossless repair of raw U+0000-U+001F inside JSON string
 * literals. See bin/merge-parts.mjs --escape-raw-controls for the policy.
 */
const BS = String.fromCharCode(92);
const DQ = String.fromCharCode(34);
/** Escape raw U+0000-U+001F found inside JSON string literals. Returns [text, count]. */
export function escapeRawControlsInStrings(s) {
  let out = "";
  let n = 0;
  let inStr = false;
  let esc = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const code = c.charCodeAt(0);
    if (inStr) {
      if (esc) { esc = false; out += c; continue; }
      if (c === BS) { esc = true; out += c; continue; }
      if (c === DQ) { inStr = false; out += c; continue; }
      if (code < 0x20) {
        out += BS + "u" + code.toString(16).padStart(4, "0");
        n++;
        continue;
      }
      out += c;
    } else {
      if (c === DQ) inStr = true;
      out += c;
    }
  }
  return [out, n];
}
