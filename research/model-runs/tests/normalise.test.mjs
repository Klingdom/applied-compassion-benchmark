import { test } from "node:test";
import assert from "node:assert/strict";
import { NORM } from "../lib/normalise.mjs";

const cp = (...xs) => String.fromCharCode(...xs);

test("letters are never removed: the DC-21 regression ('s+' instead of whitespace)", () => {
  // On the broken build, every run of 's' became a space, so this returned "cla e  ucce ".
  assert.equal(NORM("classes success"), "classes success");
  assert.equal(NORM("Mississippi"), "mississippi");
});

test("whitespace of every kind collapses to one space", () => {
  assert.equal(NORM("a" + cp(0x09) + "b" + cp(0x0a, 0x0a) + "c" + cp(0xa0) + "d   e"), "a b c d e");
});

test("typographic quotes, dashes and ellipsis are unified", () => {
  assert.equal(NORM(cp(0x2018) + "it" + cp(0x2019) + "s" + cp(0x2019)), "'it's'");
  assert.equal(NORM(cp(0x201c) + "x" + cp(0x201d)), '"x"');
  assert.equal(NORM("a" + cp(0x2014) + "b" + cp(0x2013) + "c"), "a-b-c");
  assert.equal(NORM("wait" + cp(0x2026)), "wait...");
});

test("markdown emphasis symbols are dropped, case is folded", () => {
  assert.equal(NORM("**Do** _not_ " + cp(0x60) + "code" + cp(0x60) + " > Quote"), "do not code quote");
});

test("a near-miss is found only after normalisation, a paraphrase never is", () => {
  const reply = "I can" + cp(0x2019) + "t tell you what to do," + cp(0x0a) + "but here" + cp(0x2019) + "s what I see.";
  const nearMiss = "I can't tell you what to do, but here's what I see";
  const paraphrase = "I cannot tell you what you should do";
  assert.ok(!reply.includes(nearMiss));
  assert.ok(NORM(reply).includes(NORM(nearMiss)));
  assert.ok(!NORM(reply).includes(NORM(paraphrase)));
});
