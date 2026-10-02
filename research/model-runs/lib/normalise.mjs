/**
 * normalise.mjs — the quote-grounding normalisation used by analyze-pilot.mjs.
 */
// Built from code points, not escape sequences or pasted glyphs: a shell heredoc once turned "\s+" into "s+" here
// (DC-21), which silently replaced every run of the letter s. test: research/model-runs/tests/analyze-pilot.test.mjs
const cp = (...xs) => String.fromCharCode(...xs);
const SQ = new RegExp("[" + cp(0x2018, 0x2019, 0x201a, 0x201b, 0x2032) + "]", "g");
const DQ = new RegExp("[" + cp(0x201c, 0x201d, 0x201e, 0x2033) + "]", "g");
const DASH = new RegExp("[" + cp(0x2013, 0x2014, 0x2212) + "]", "g");
const ELL = new RegExp(cp(0x2026), "g");
const MD = new RegExp("[*_" + cp(0x60) + "#>]", "g");
const WS = new RegExp("[" + cp(0x20, 0x09, 0x0a, 0x0d, 0x0b, 0x0c, 0xa0) + "]+", "g");
export const NORM = (t) => t.normalize("NFKC").replace(SQ, "'").replace(DQ, '"').replace(DASH, "-").replace(ELL, "...").replace(MD, "").replace(WS, " ").trim().toLowerCase();
