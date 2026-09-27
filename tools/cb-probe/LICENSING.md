# Licensing — cb-probe

**RESOLVED 2026-09-27: MIT.** Founder decision, recorded in `DECISIONS.md` as **D-42**.

This package is covered by the repository's `LICENSE` (MIT). Use it, fork it, ship it commercially, no
permission required. Keep the copyright notice.

Two things MIT does not do, both covered in `/NOTICE.md`:

- It grants **no trademark rights** in the name "Compassion Benchmark". Run the tool freely; do not present
  output you generated as a Compassion Benchmark result.
- It does not change what a score from the **public** task bank means. Every item ships with its answer key,
  so a model trained since publication may have memorised the questions and the target behaviours. The tool
  marks this structurally — `official: false` cannot be set true, and scoring is blocked until the
  contamination probe has run.

---

## What this file said before, kept for the record

This file previously stated that distribution terms were unresolved and that the coordinator would not choose
them. That was correct at the time and is preserved here rather than deleted, because the reasoning still
applies to future licensing questions:

> This repository carries no `LICENSE` file, so the distribution terms for this package are undefined. A
> licence is a founder decision with legal consequence. Nothing was assumed, and no terms were invented on
> anyone's behalf.

The decision has now been made. The reasoning for not inventing it stands.
