# CB-MODEL release watch — candidate source registry proposal

**Date:** 2026-09-18
**Proposal file:** `research/model-index/proposed-sources-2026-09-18.json`
**Target store (NOT modified by this work):** `site/src/data/model-benchmark/release-sources-v1.json`
**Status:** awaiting founder ratification. Nothing here is registered.

## What this is, in one paragraph

The L1 detector has never run. `site/src/data/model-benchmark/release-sources-v1.json` holds 0 sources by design, because the store's own rule is "A source is added by a human from a verified URL, never inferred." The newest scan record, `research/model-index/release-watch/scan-2026-09-16-001.json`, says `status: "not-run"` and `blocked_by: "no-sources-registered"`. This document does the verification work so that adding sources becomes a yes-or-no decision. Every URL below was fetched on 2026-09-18 and I recorded the HTTP status, the final URL after redirects, the page or feed title, whether a machine-readable feed exists, and at least one dated item quoted from the bytes that came back. Anything I could not fetch, or that returned no dated item, is excluded and listed as rejected.

**Counts: 31 candidate sources attempted, across 61 distinct URL fetches (including feed-path probes). 14 verified and proposed. 17 rejected, each with a recorded reason.** Of the 14 proposed, 13 are on the developer's own domain and 1 is not.

## How I verified

Every fetch used `curl` with redirects followed, a 25-30 second timeout and a browser User-Agent. For each URL I captured `%{http_code}`, `%{url_effective}`, `%{content_type}` and `%{size_download}`, extracted `<title>`, and grepped the returned HTML for every `<link rel="alternate">` tag. Per rule V8, I never record "no feed exists" from assumption: for each feedless source the notes name the specific paths I probed and the status each returned. For feeds I parsed item title, `pubDate` and `link` directly. For HTML pages I stripped tags and quoted the visible dated text.

Verification fetches are recorded in the notes but `last_retrieved_at` stays `null` on every row, because that field means "the last time the L1 scanner fetched this", and the scanner still has not run.

---

## Verified sources (proposed)

| # | Provider | Type | URL (final, after redirects) | Feed or HTML | Most recent item | First-party | Tier |
|---|---|---|---|---|---|---|---|
| 1 | Anthropic | announcement | `https://www.anthropic.com/news` | HTML (no feed) | Sep 17, 2026 | yes | primary |
| 2 | OpenAI | announcement | `https://openai.com/news/rss.xml` | **RSS** | 17 Sep 2026 12:00 GMT | yes | primary |
| 3 | OpenAI | api_changelog | `https://developers.openai.com/api/docs/changelog` | HTML | Sep 15, 2026 | yes | primary |
| 4 | Google DeepMind | announcement | `https://blog.google/innovation-and-ai/models-and-research/google-deepmind/rss/` | **RSS** | 09 Sep 2026 16:00 +0000 | yes | primary |
| 5 | Meta | announcement | `https://ai.meta.com/blog/` | HTML (no feed) | Jul 27, 2026 | yes | primary |
| 6 | Mistral AI | announcement | `https://mistral.ai/news/rss` | **RSS** | 16 Sep 2026 12:00 GMT | yes | primary |
| 7 | xAI | announcement | `https://x.ai/news` | HTML (no feed) | Sep 16, 2026 | yes | primary |
| 8 | DeepSeek | api_changelog | `https://api-docs.deepseek.com/updates/` | HTML | 2026-09-10 | yes | primary |
| 9 | Cohere | api_changelog | `https://docs.cohere.com/v2/changelog` | HTML (feed advertised, unreachable) | Sep 9, 2026 | yes | primary |
| 10 | Amazon | product_release_notes | `https://docs.aws.amazon.com/bedrock/latest/userguide/bedrock-ug-doc-history.html` | HTML | Sep 15, 2026 | yes | primary |
| 11 | AI21 Labs | announcement | `https://www.ai21.com/blog/` | HTML (no feed) | Aug 19, 2026 | yes | secondary |
| 12 | Allen Institute for AI | announcement | `https://allenai.org/research` | HTML (no feed) | Sep 1, 2026 | yes | secondary |
| 13 | Alibaba Qwen | model_registry | `https://huggingface.co/api/models?author=Qwen&sort=createdAt&direction=-1&limit=50` | **JSON** | 2026-08-27T08:14:27Z | **no** | secondary |
| 14 | Microsoft | announcement | `https://www.microsoft.com/en-us/research/feed/` | **RSS** | 31 Aug 2026 16:00 +0000 | yes | secondary |

Five of the fourteen are machine-readable feeds or JSON. That is worth stating plainly, because the brief prefers feeds and the reality is that most frontier labs publish no feed at all for their release page.

### Release-announcement proof, quoted per source

Each quote below is text I read in the response body, next to the date shown.

1. **Anthropic** — "Introducing Claude Fable 5.1 and Claude Mythos 5.1" / Announcements / **Sep 1, 2026** / "Our most advanced models for coding and knowledge work."
2. **OpenAI news RSS** — `<title>Introducing Astra for Law` / `<pubDate>Thu, 17 Sep 2026 00:00:00 GMT` / `<link>https://openai.com/index/astra-for-law`.
3. **OpenAI changelog** — under the `September, 2026` heading: "**Sep 10** / Feature / `gpt-live-1` / `v1/live/sessions` / GPT-Live 1 is now generally available in the API."
4. **Google DeepMind** — `<title>AlphaGenome Atlas: a high-resolution map of human DNA` / `<pubDate>Tue, 08 Sep 2026 14:00:00 +0000` / `<link>https://blog.google/innovation-and-ai/models-and-research/google-deepmind/alphagenome-atlas/`.
5. **Meta** — "Introducing Muse Spark 1.1" / **July 9, 2026**, and "Introducing Muse Image and Muse Video" / **Jul 7, 2026**.
6. **Mistral AI** — `<title>Mistral and Mozilla are bringing open, private and multilingual AI to your web browser` / `<pubDate>Wed, 16 Sep 2026 12:00:00 GMT`.
7. **xAI** — "Introducing Grok 4.6" / **Aug 14, 2026** / "Grok 4.6 builds on Grok 4.5 with a particular focus on long-running agents and more ambitious interactive and visual work."
8. **DeepSeek** — "Date: **2026-09-10**" / "we have decided to continue providing API services for DeepSeek V4 Pro after September 14, 2026, with the billing method remaining unchanged."
9. **Cohere** — **September 9, 2026** / "Announcing Cohere's North Small Translate ... an open-weights mixture-of-experts model purpose-built for machine translation across more than 50 languages" / "Model name: `north-small-translate-1-0`" / "Context length: 16K" / "218 billion total parameters with 25 billion active parameters."
10. **Amazon** — dated rows **September 15, 2026**, September 1, 2026, August 24, 2026, August 19, 2026, with `bedrock-mantle`, "Models at a glance" and "Thinking block binding (beta)" in the adjacent cells.
11. **AI21 Labs** — "You don't need a frontier model. You need a verifier." / **Aug 19, 2026**. This is commentary, not a release. See the caveat below.
12. **Allen Institute for AI** — "OlmoEarth v1.1: A more efficient family of models" / **May 19, 2026**. Newest item overall is "BenchMIRT: What are LLM benchmarks actually measuring?" / September 1, 2026.
13. **Alibaba Qwen** — `{"id":"Qwen/Qwen-Drive-1.0-4B", ..., "createdAt":"2026-08-27T08:14:27.000Z"}` and `{"id":"Qwen/Qwen3.8-Flash-Next", ...}`.
14. **Microsoft** — `<title>GigaPath-Flash and GigaTIME-Flash: Toward population-scale discovery with efficient pathology foundation models` / `<pubDate>Mon, 31 Aug 2026 16:00:00 +0000`.

Two of these fourteen do not carry a clean model-release item and are tiered `secondary` for that reason: AI21 Labs (eight newest items are all research commentary) and Microsoft (research models, not product models).

### Feed discovery: exactly what I checked

I do not report "no feed" without naming the probe.

| Provider | `<link rel="alternate">` in HTML? | Paths probed | Result |
|---|---|---|---|
| Anthropic | none | `/rss.xml`, `/news/rss.xml`, `/feed.xml`, `/news.rss` | all **404** |
| OpenAI (news) | not checked — HTML listing returned **403** | `/news/rss.xml` | **200**, `text/xml` — feed used |
| OpenAI (changelog) | yes → `https://developers.openai.com/rss.xml` | that feed | **200** but wrong content: docs pages, non-chronological dates |
| Google DeepMind | none on `deepmind.google/blog/` | `blog.google/technology/google-deepmind/rss/` | **200**, redirects to the new path, 20 dated items |
| Meta | none | `https://ai.meta.com/blog/rss/` | **400** |
| Mistral AI | only `hreflang` language alternates | `/rss.xml` | **200**, redirects to `/news/rss` |
| xAI | none | `/rss.xml`, `/news/rss` | both **404** |
| DeepSeek | none | `/rss.xml` | **200 but catch-all** — identical body to the docs home page |
| Cohere | none in HTML; a "Subscribe via RSS" control is client-rendered | `/changelog/rss`, `/changelog/rss.xml`, `/v2/changelog/rss`, `/v2/changelog/rss.xml`, `/rss.xml` | all **404** |
| AI21 Labs | only WordPress oEmbed endpoints | `/feed/` | **200 but redirects to the homepage** |
| Allen Institute | none | — | HTML only |
| Microsoft | n/a | `/en-us/research/feed/` | **200**, `application/rss+xml` |
| Amazon | none on the doc-history page | `/blogs/machine-learning/feed/` | **200** but wrong content (see rejections) |

---

## Rejected candidates, with the reason

Rejections split into two kinds, and the distinction matters: **could not fetch** versus **fetched fine but does not announce model releases**.

### Could not fetch, or fetched with no usable dated item — UNVERIFIED, excluded

| Candidate | URL attempted | Result |
|---|---|---|
| Google Gemini API changelog | `https://ai.google.dev/gemini-api/docs/changelog` | **302 to `accounts.google.com/o/oauth2/v2/auth`** — requires a signed-in Google account. Not retrievable by an anonymous http-get. **UNVERIFIED.** |
| Google DeepMind blog (HTML) | `https://deepmind.google/discover/blog/` → `https://deepmind.google/blog/` | 200, title "News — Google DeepMind", but the server HTML contained **zero date strings**. An http-get cannot date its items. |
| Alibaba Qwen (first-party) | `https://qwen.ai/blog`, `https://qwen.ai/research`, `https://qwen.ai/rss.xml` | All 200 but all returned the **identical 94,358-byte** client-rendered shell; `/rss.xml` redirected to `/`. No items in the bytes. |
| Alibaba Qwen (legacy) | `https://qwenlm.github.io/blog/`, `https://qwenlm.github.io/index.xml` | Blog page serves `<meta http-equiv=refresh content="5; url=https://qwen.ai/research">`; `index.xml` **404**. |
| Zhipu AI / Z.ai | `https://z.ai/blog` | **404 Not Found** (555 bytes). **UNVERIFIED.** |
| Moonshot AI | `https://moonshotai.github.io/` | 200 but **883 bytes titled "Redirecting..."** — no content, no items. **UNVERIFIED.** |
| Stability AI | `https://stability.ai/news` → `https://stability.ai/news-updates` | 200, title "News & Updates — Stability AI", but **no dated visible text** in the returned HTML (Squarespace client rendering). |
| IBM | `https://www.ibm.com/new/feed` → `https://www.ibm.com/new` | 200, title "What's New | IBM", but the only dates in the body were JSON-LD `datePublished`/`dateModified`, not item dates. |
| Meta research | `https://ai.meta.com/research/publications/` | **HTTP 500.** |
| Meta AI tag feed | `https://about.fb.com/news/tag/meta-ai/` | **404.** |
| DeepSeek "news" | `https://api-docs.deepseek.com/news/` | 200 but the body is the **catch-all** "Your First API Call" page — the path does not exist. |
| Anthropic feeds | 4 paths (above) | all **404**. |
| xAI feeds | 2 paths (above) | both **404**. |
| Cohere changelog feed | 5 paths (above) | all **404**. |

### Fetched successfully but rejected on relevance

| Candidate | URL | Status | Why rejected |
|---|---|---|---|
| Microsoft Foundry what's-new | `https://learn.microsoft.com/en-us/azure/ai-foundry/whats-new-azure-ai-foundry` → `.../azure/foundry/whats-new-foundry` | 200, `ms.date` `2026-09-01` | Its only headings are "New articles" and "Updated articles". It tracks **documentation changes**, not model releases. It would generate a steady stream of false positives. |
| Azure blog | `https://azure.microsoft.com/en-us/blog/feed/` | 200 RSS | Four newest items: a Gartner Magic Quadrant award, an agent-governance ROI post, an infrastructure-resiliency post, an availability-zone design post. Zero model releases. |
| AWS Machine Learning blog | `https://aws.amazon.com/blogs/machine-learning/feed/` | 200 RSS | Four newest items: SageMaker HyperPod Inference Gateway, Amazon Connect Talent, a vector-store selection guide, a QuickSight dashboard. Zero model releases. |
| AWS "recent announcements" | `https://aws.amazon.com/about-aws/whats-new/recent/feed/` | 200 RSS | An all-of-AWS firehose: Transfer Family, HealthOmics, AWS Batch, EC2 T8i. Signal-to-noise far too low. |
| Meta corporate newsroom | `https://about.fb.com/feed/` | 200 RSS, newest 16 Sep 2026 | Newest items were bionic prosthetics, Threads podcast tools, Threads parental supervision, and a French-language subscription launch. Corporate PR, not model releases. Superseded by `ai.meta.com/blog/`. |
| Apple machine learning | `https://machinelearning.apple.com/rss.xml` | 200 RSS, newest 17 Sep 2026 | Pure research-paper feed (REVERSAL-BENCH, DACA-GRPO, Glyph). Apple does not announce model releases here. |
| NVIDIA blog | `https://blogs.nvidia.com/feed/` | 200 RSS, newest 17 Sep 2026 | Newest items: GeForce NOW game launch, MLPerf results, a data-centre alliance, an air-pollution research story. Hardware and partnerships, not model releases. |
| Google Research blog | `https://research.google/blog/rss/` | 200, `application/rss+xml`, title "The latest research from Google" | Fetch verified, but I did not extract item dates, so I cannot claim it announces releases. Held back rather than asserted. |
| Hugging Face blog | `https://huggingface.co/blog/feed.xml` | 200, `application/rss+xml`, title "Hugging Face - Blog" | Same: status and title verified, item dates not extracted. Also third-party. Held back. |
| Cohere blog | `https://cohere.com/blog` | 200, title "The Cohere Blog" | Fetch verified, dated items not confirmed. The changelog is the stronger surface and is already proposed. |
| DeepSeek homepage | `https://www.deepseek.com/` | 200 | No dated item list. |
| Meta developer site | `https://www.llama.com/` → `https://developer.meta.com/ai/` | 200 | Redirect target not examined for dated items. Not asserted. |

---

## Coverage limits: developers with no verifiable first-party source

This is the honest cost of the set, and the `coverageClaim` depends on it.

**Covered by a first-party source (11 developers):** Anthropic, OpenAI, Google DeepMind, Meta, Mistral AI, xAI, DeepSeek, Cohere, Amazon, AI21 Labs, Allen Institute for AI. Microsoft is covered only by its research feed, which is why it is `secondary`.

**No verifiable first-party source:**

- **Alibaba Qwen** — every first-party surface is client-rendered or gone. Covered only through the Hugging Face API, on a third-party domain.
- **Microsoft (product models)** — no first-party page that announces product model releases could be verified. The Foundry what's-new page tracks documentation, and the Azure blog is marketing.
- **Zhipu AI / Z.ai** — `z.ai/blog` returns 404. No verified source.
- **Moonshot AI** — `moonshotai.github.io` returns an empty redirect stub. No verified source.
- **Stability AI, IBM** — pages fetch but render no dated items to an http-get.
- **Apple, NVIDIA** — sources fetch cleanly but publish research and hardware news, not model releases.
- **Not attempted at all:** Baidu, ByteDance Seed, Tencent Hunyuan, Reka, Liquid AI, Nous Research, and the Chinese-language surfaces of the labs above. Their absence is a gap in this proposal, not a finding about them.

So this registry can see roughly a dozen developers. It cannot see the Chinese open-weight ecosystem beyond DeepSeek and Qwen, and its Qwen coverage depends on a third party.

---

## Recommendation 1: quorum

**Recommended `meta.quorumRequired` = 8**, against the 10 tier-primary sources proposed.

The validator caps this value at the number of tier-primary sources that actually exist, so the legal range is 0-10. I recommend 8 for reasons taken from how these sources behaved during verification, not from theory:

- **Retrieval failure is routine, not exceptional.** Two of the ten primary sources failed on my first attempt and succeeded on a second: `https://ai.meta.com/blog/` returned **HTTP 400** to a Chrome-style User-Agent and **HTTP 200** to a Safari-style one, and `https://openai.com/news/` returned **HTTP 403** to a direct GET while its RSS feed returned 200. A quorum of 10 would let one bot-detection rule void the institution's coverage claim for the day.
- **But the failure budget must be small, because the set is small.** Two of the ten primaries (Anthropic, OpenAI) cover the two most-watched developers. A quorum of 5 or 6 would permit a "covered" scan in which half the field, potentially including both, went unread. That is the kind of claim the `coverageThrough` field exists to prevent.
- **8 of 10 tolerates exactly two simultaneous failures.** That matches the observed failure rate of 2 in 10 on a single day's verification run, and it forces a third failure to be visible as a coverage gap rather than absorbed silently.

**Separately — how many sources must corroborate a release before promotion?** Keep the existing T3 rule in `docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` §2.5: two evidence entries, **or** one where `publisher === developer`. This verification supports that rule rather than changing it. All 13 first-party rows publish the developer's own announcement, so a single item from them satisfies `publisher === developer` and needs no second source. The Hugging Face row is the only one where the host is not the developer, so a Qwen release detected there should require a second source before promotion.

**One hard condition on corroboration:** corroborating sources must be de-duplicated by `(developer, snapshot_label)` before they count. The xAI listing alone shows why. It carried four separate dated items naming the same snapshot — "Grok 4.6 in GitHub Copilot" (Aug 14), "Grok 4.6 on Amazon Bedrock" (Aug 19), "Grok 4.6 on Gemini Enterprise Agent Platform" (Aug 21), "Grok 4.6 on Microsoft Foundry" (Aug 26) — alongside the actual release, "Introducing Grok 4.6" (Aug 14). Counted naively, one model release plus its availability posts would satisfy any quorum you set.

## Recommendation 2: `coverageClaim`

**Recommended value: `declared-sources` — but only after a scan actually completes with `quorum.met === true`. Until then it stays `none`.**

The store's own vocabulary makes this the right word. `docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` §2.7 ties `partial` to **L0**, where open-ended search is used and can never be exhaustive, and ties `declared-sources` to **L1**, described as "the strongest *honest* claim available, and the only one that is verifiable". This proposal is pure L1: a published, enumerable list that a reader can check line by line. Calling it `partial` would be wrong in the other direction — it would imply the open search that L0 performs and this design does not.

Two conditions attach to the claim, both of which follow from the coverage limits above:

1. **The claim must render the provider list beside it.** "Declared sources" is honest only when the declaration is visible. A reader must be able to see that Zhipu, Moonshot, Baidu, ByteDance and Tencent are not in the list.
2. **Do not advance `coverageThrough` on this proposal alone.** Registering sources does not constitute coverage. The first completed scan that meets quorum does.

Also note the existing guardrail at §2.7/§4: no commercial call-to-action while `coverageClaim === "none"`. Ratifying this proposal does not by itself change that flag, so that guardrail stays in force until a scan runs.

## Recommendation 3: false-positive filtering L1 must implement

Ranked by how much noise each source will actually generate.

| Source | Failure mode | What L1 must do |
|---|---|---|
| **xAI** `x.ai/news` | Re-announces one snapshot across platform-availability posts (four for Grok 4.6 alone). Also mixes in product posts ("Grok Bot for Enterprise", "Memory in Grok Build") and company posts ("Biosecurity at the frontier"). | De-duplicate on `(developer, snapshot_label)`. Classify "X on Y platform" as `new_deployment`, not `new_model`. Use the page's own category label — items render as "Product ·", "Company ·" — as a negative signal. |
| **DeepSeek** `api-docs.deepseek.com` | The host serves a **catch-all HTTP 200**: `/news/` and `/rss.xml` both returned the same 46,114-byte "Your First API Call" page. A 200 proves nothing here. | Assert the page title contains "Change Log" **and** the body contains a `Date:` token. Treat a 200 without both as a `sources_failed` entry, not as an empty scan. |
| **Mistral AI** `mistral.ai/news/rss` | Partnerships, funding rounds and case studies dominate. Top four items on the verification run contained no model release. | Require a model-name or version token in the title before classifying as `new_model`. Content-type is `text/plain` despite being RSS — parse on body shape, never on the header. |
| **OpenAI** `openai.com/news/rss.xml` | Mixes customer stories ("How Cooley is accelerating IPO work with ChatGPT") and policy posts with launches. | Cross-check candidates against the changelog source, which carries exact snapshot ids such as `gpt-live-1`. |
| **Alibaba Qwen** Hugging Face API | Lists every upload, including quantisations and fine-tunes: `Qwen3.8-Flash-Next-FP8` appeared alongside `Qwen3.8-Flash-Next`, and `Qwen-Drive-1.0-4B` carries `base_model:finetune:Qwen/Qwen3.5-4B`. | Collapse derivative repos using the `base_model:*` and `base_model:quantized:*` tags before counting a release. Never promote a derivative as a new model. |
| **Google DeepMind** RSS | Each item embeds staff job titles in title-adjacent markup ("Google DeepMind engineer", "VP Science, Google DeepMind & Chief Scientist, Google Cloud"). | Parse strictly within `<item>` boundaries and take only the first `<title>`. A loose regex will report bylines as releases. |
| **Amazon** Bedrock doc history | A documentation-history page, so it lags the announcement. | Use as corroboration, not first detection. Do not let its date become `announced_date`. |
| **Microsoft** research feed | Research models, not product models. | Expect `classification: new_model` with `product_scope: model-index` only rarely; most items are `non_material`. |
| **Anthropic**, **Meta**, **AI21**, **Ai2** | Mix announcements, threat reports, safety posts and research commentary. | Standard title/classifier filter. Anthropic exposes its own category label ("Announcements") in the listing, which is a usable positive signal. |

## Other operational notes for whoever builds the fetcher

- **Send a browser User-Agent and an `Accept: text/html` header.** Two of ten primaries refuse a bare request. A default library User-Agent will produce phantom outages and, worse, phantom "no releases this week" results.
- **Record the final URL, not the configured one.** Six of the fourteen redirect: OpenAI changelog (`platform.openai.com` → `developers.openai.com`), DeepMind RSS (path renamed under `blog.google`), Mistral (`/rss.xml` → `/news/rss`), Cohere (`/changelog` → `/v2/changelog`), Amazon (`doc-history.html` → `bedrock-ug-doc-history.html`), Ai2 (`/blog` → `/research`). Some of these will keep moving.
- **Treat "200 with the wrong body" as a failure.** DeepSeek's catch-all and AI21's `/feed/` → homepage redirect both return 200 while delivering nothing useful. Status-code-only health checks will call both healthy.
- **Item windows are short.** Ai2 renders only nine items server-side. A gap longer than a source's visible window loses releases permanently, which is an argument for scanning on a cadence well inside `staleAfterDays: 14`.
- **Staleness is already visible and should stay visible.** Meta's newest item was Jul 27, 2026 — roughly seven weeks before this proposal. That is a fact about Meta's publishing cadence, not a defect in the registry, and the scan record should show it rather than hide it.

## What ratification requires

1. Decide which of the 14 rows to accept. Rejecting rows 11-14 (the four `secondary` rows) leaves 10 primary sources and still supports a quorum of 8.
2. Replace every `added_by` value. Each currently reads `UNRATIFIED-PROPOSAL-2026-09-18 (ratifying human must replace this value)`, which is deliberately unusable as-is.
3. Copy the accepted rows into `site/src/data/model-benchmark/release-sources-v1.json`, set `meta.sourceCount` to the accepted count, set `meta.quorumRequired`, and replace the empty-registry `meta.note`.
4. Drop the proposal-only `meta` keys (`status`, `quorumNote`, `coverageClaimRecommendation`, `coverageClaimNote`, `companionDocument`, `verifiedBy`, `targetStore`) if the live store should keep the minimal shape from §2.7.
5. Run `node site/scripts/validate-model-sources.mjs`. The proposal file as written already passes the shared validator: 14 sources, 33 checks, 0 failures, 0 warnings, with all 14 `source_id` values matching their deterministic derivation.

## Limits of this work

This is a desk verification carried out on a single day, 2026-09-18, from one network location, with anonymous requests. It establishes that each proposed URL was reachable and carried dated items at that moment. It does not establish reliability over time, nor that a page's structure is stable enough for a parser, and for three sources (Cohere, DeepSeek, Google DeepMind) I have recorded specific uncertainty about structure rather than smoothing it over. `content_selector` is `null` on every row because I did not verify any stable CSS selector. I did not write to any file under `site/src/data/`, and the live registry still contains 0 sources.
