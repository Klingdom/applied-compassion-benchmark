#!/bin/bash
set -e
C="chapters"
OUT="compassion-benchmark-funder-prospectus.md"

# Title block
cat > "$OUT" <<'HDR'
# Compassion Benchmark

## Building the Global Standard for Measuring Institutional Compassion

### A Strategic Vision, Research Prospectus, and Funding Opportunity

*Confidential draft for review. 2026-06-28.*

---

HDR

emit() { echo "" >> "$OUT"; cat "$C/$1" >> "$OUT"; echo "" >> "$OUT"; echo "" >> "$OUT"; }
divider() { echo "" >> "$OUT"; echo "---" >> "$OUT"; echo "" >> "$OUT"; echo "# $1" >> "$OUT"; echo "" >> "$OUT"; }

# Front matter
for f in fm-01-cover-copy fm-02-inside-cover fm-03-mission-vision-core-belief fm-04-founder-letter fm-05-executive-summary fm-06-how-to-read; do emit "$f.md"; done

divider "Part I: Why Compassion Needs a Standard"
for f in ch-01-the-decisions-we-never-see ch-02-not-that-institutions-do-not-care ch-03-we-measure-almost-everything-except-this ch-04-why-existing-frameworks-fall-short; do emit "$f.md"; done

divider "Part II: The Standard"
for f in ch-05-what-compassion-benchmark-measures ch-06-the-eight-dimensions ch-07-evidence-before-assertion ch-08-how-assessment-works ch-09-from-score-to-improvement; do emit "$f.md"; done

divider "Part III: Research Foundation"
for f in ch-10-compassion-as-observable-institutional-behavior ch-11-the-science-behind-the-framework ch-12-why-systems-matter-more-than-intentions ch-13-pressure-tests-maturity-gates-and-character-over-time; do emit "$f.md"; done

divider "Part IV: Applications"
for f in ch-14-ai-and-robotics ch-15-healthcare-and-human-services ch-16-government-and-public-service ch-17-corporations-and-employers ch-18-nonprofits-humanitarian-and-civil-society; do emit "$f.md"; done

divider "Part V: Public Benefit"
for f in ch-19-a-shared-language-for-institutional-accountability ch-20-public-indexes-and-open-research ch-21-journalists-policymakers-researchers-communities ch-22-theory-of-change ch-23-measuring-impact; do emit "$f.md"; done

divider "Part VI: Building the Institution"
for f in ch-24-progress-to-date ch-25-technology-platform ch-26-governance-and-independence ch-27-roadmap ch-28-financial-sustainability ch-29-funding-opportunities ch-30-closing-vision; do emit "$f.md"; done

divider "Appendices"
for f in appendix-A-dimensions appendix-B-evidence-hierarchy appendix-C-assessment-lifecycle appendix-D-governance-safeguards appendix-E-example-funding-packages appendix-F-graphics-and-layout-system; do emit "$f.md"; done

# Consolidated claims-to-verify
CL="claims-to-verify.md"
cat > "$CL" <<'CHDR'
# Claims to Verify

Consolidated register of claims in the funder prospectus that require citation, legal/tax review, methodology validation, or softer wording before external release. Organized by Part. Each entry: claim, location, why verification is needed, suggested fix.

CHDR
for p in partI partII partIII partIV partV partVI; do
  echo "" >> "$CL"; echo "## ${p}" >> "$CL"; echo "" >> "$CL"; cat "$C/claims/$p.md" >> "$CL"; echo "" >> "$CL";
done

echo "ASSEMBLED:"; wc -w "$OUT" "$CL"
