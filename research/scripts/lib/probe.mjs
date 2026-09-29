/**
 * probe.mjs — GI-3.
 *
 * Plant a deliberate defect in a file, prove a gate catches it, restore the
 * file byte-for-byte. Nothing here touches git.
 *
 * WHY THIS EXISTS
 *   Verifying a gate means breaking something on purpose and putting it back.
 *   The obvious way to put it back is `git checkout -- <path>`, and that
 *   command destroys any *other* uncommitted change in the same file. It caused
 *   INC-009 and INC-010, and it is banned for agents.
 *
 *   The ban did not work. I wrote GI-3 on 2026-09-27 — "probe harnesses restore
 *   from a file copy, never from git" — and broke it myself on 2026-09-29, two
 *   days later, reverting a planted probe. Nothing was lost, but only because
 *   the file happened to have no other uncommitted change. That was luck.
 *
 *   `test-no-destructive-git.mjs` (It. 39) lints committed scripts; it cannot
 *   see a command an agent types into a shell. So the remaining lever is not
 *   another prohibition, it is making the safe path SHORTER than the unsafe
 *   one. `git checkout -- x` is four words. `await withPlanted(...)` is one
 *   call that also does the verification the git version never did.
 *
 * WHAT IT GUARANTEES
 *   - The backup is taken BEFORE the mutation, in memory and on disk.
 *   - Restore is byte-exact, verified by sha256, and THROWS if it is not — a
 *     silent partial restore is how a probe corrupts a repo.
 *   - Restore runs even if the probe body throws, so a failing assertion cannot
 *     leave the planted defect behind.
 *   - It refuses to plant into a file that does not exist, and refuses a
 *     mutation that changes nothing (a no-op probe proves nothing — the V3
 *     lesson: a gate that cannot be made to fail has not been tested).
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const sha = (buf) => createHash("sha256").update(buf).digest("hex");

/**
 * Run `body` with `file` temporarily mutated, then restore it exactly.
 *
 * @param {string} file        absolute path to the file to plant into
 * @param {(text: string) => string} mutate  returns the mutated contents
 * @param {(ctx: {planted: string, original: string}) => any} body
 * @returns {Promise<any>} whatever `body` returns
 */
export async function withPlanted(file, mutate, body) {
  if (!existsSync(file)) throw new Error(`withPlanted: ${file} does not exist`);

  const originalBuf = readFileSync(file);
  const originalHash = sha(originalBuf);
  const originalText = originalBuf.toString("utf8");

  const plantedText = mutate(originalText);
  if (typeof plantedText !== "string") throw new Error("withPlanted: mutate must return a string");
  if (plantedText === originalText) {
    // A probe that changes nothing will "pass" against an unmodified file and
    // prove the gate works when it has not been exercised at all.
    throw new Error(`withPlanted: mutation produced identical contents for ${file} — the probe would prove nothing`);
  }

  writeFileSync(file, plantedText);
  try {
    return await body({ planted: plantedText, original: originalText });
  } finally {
    writeFileSync(file, originalBuf);
    const afterHash = sha(readFileSync(file));
    if (afterHash !== originalHash) {
      throw new Error(
        `withPlanted: RESTORE FAILED for ${file}. Expected sha256 ${originalHash}, got ${afterHash}. ` +
          "The file is not what it was before the probe — do not commit."
      );
    }
  }
}

/**
 * Assert a command fails while a defect is planted and passes without it.
 *
 * This is the V3 shape in one call: a gate is only verified when the planted
 * defect FAILS it and its absence PASSES. Either half alone is meaningless.
 *
 * @param {object} o
 * @param {string} o.file            file to plant into
 * @param {(t: string) => string} o.mutate
 * @param {() => boolean} o.run      returns true when the gate passes
 * @param {string} [o.label]
 */
export async function assertGateCatches({ file, mutate, run, label = "gate" }) {
  const passesBefore = run();
  if (!passesBefore) {
    throw new Error(`${label}: does not pass on the clean file, so a failure under the probe proves nothing`);
  }
  const passesUnderProbe = await withPlanted(file, mutate, async () => run());
  if (passesUnderProbe) {
    throw new Error(`${label}: PASSED with the defect planted — it is not detecting what it claims to`);
  }
  const passesAfter = run();
  if (!passesAfter) {
    throw new Error(`${label}: does not pass after restore — the probe left the file changed`);
  }
  return true;
}
