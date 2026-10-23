# AI model tracker: independent fact-check, 2026-10-22

Files checked:
- `releases-2026-10-22.json`: 1 item, window 2026-10-17..2026-10-22.
- `catalog-2026-10-22.json`: 63 models, 18 providers.
- `RESEARCH_NOTES_2026-10-22.md`.

The JSON files were not edited.

**Method.**
- **Catalog diff.** I diffed `catalog-2026-10-22.json` against `catalog-2026-10-16.json` with a Node script rather than relying on the notes. The script compares every field of every row, matched by `id`.
  - Result: 1 row added (`deepseek-v4-1-flash-1017`), 3 rows changed (`deepseek-v4-1-flash`, `google-gemini-4-argon`, `microsoft-mai-thinking-1`) and 0 rows removed.
  - The only top-level changes are `asOf` and `factCheck`. This matches the notes.
- **Sources.** I opened every source this session:
  - pages with WebFetch;
  - Hugging Face metadata with curl (`/api/models/<id>?expand[]=safetensors&expand[]=createdAt`) and raw model cards;
  - feeds (AWS What's New, the Google blog RSS and the Anthropic newsroom HTML) with curl.
- **Search.** Web searches were used for leads only.

Verdicts used: `confirmed`, `corrected-value: X`, `unverifiable`, `wrong`.

## 1. Release (1 of 1)

| # | Date | Item | Verdict | Notes | Evidence |
|---|---|---|---|---|---|
| 1 | 2026-10-17 | DeepSeek: DeepSeek-V4.1-Flash-1017 (`update`) | confirmed | Details below. | https://api-docs.deepseek.com/news/news261017 ; https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017 ; https://api-docs.deepseek.com/quick_start/pricing |

**Checks on release 1:**
- **Date.**
  - The news page is dated "2026/10/17", and the sidebar lists "DeepSeek-V4.1-Flash-1017 Release 2026/10/17".
  - The Hugging Face repo was created at 2026-10-17T02:40:38Z.
  - The date falls inside the window and is no more precise than the source.
- **Sources.** Both are genuinely primary: DeepSeek's own docs and the deepseek-ai Hugging Face organisation.
- **Summary.** Every phrase is supported:
  - "live on our website, app, and API" (announcement);
  - Hugging Face and ModelScope weights (announcement);
  - "a minor update to DeepSeek-V4.1-Flash" (Hugging Face card);
  - MIT licence (card and `license:mit` tag).
  - The wording is neutral. The announcement's benchmark claims are not restated.
- **Kind.** `update` fits DeepSeek's own "minor update" wording.
- **Safety flag.** The announcement contains no safety statement, so `false` / `null` is correct.
- **Recommended, non-blocking.** Add the pricing page as a third primary source. It shows that the API model name `deepseek-flash` now has "MODEL VERSION: DeepSeek-V4.1-Flash-1017". That is the fact that makes the API part of the summary concrete.

## 2. Catalog rows (21 checked: 4 added or changed, plus 17 unchanged)

### 2a. Added and changed rows (all 4), field by field

| id | Verdict | Field findings | Evidence |
|---|---|---|---|
| deepseek-v4-1-flash-1017 (added) | confirmed, with one note fix (MUST FIX 3) | Details below. | https://api-docs.deepseek.com/news/news261017 ; https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017 ; https://api-docs.deepseek.com/quick_start/pricing |
| deepseek-v4-1-flash (changed) | `status` confirmed; **`access` and `notes` wrong** (MUST FIX 1, 2) | Details below. | https://api-docs.deepseek.com/quick_start/pricing ; https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash |
| google-gemini-4-argon (changed) | confirmed | Details below. | https://blog.google/innovation-and-ai/products/gemini-app/gemini-4-argon-availability/ |
| microsoft-mai-thinking-1 (changed) | values confirmed; **`notes` wrong and `sources` incomplete** (MUST FIX 4, 5) | Details below. | https://microsoft.ai/news/introducing-mai-thinking-1/ ; https://microsoft.ai/news/building-a-hillclimbing-machine-launching-seven-new-mai-models/ ; https://microsoft.ai/news/microsoft-build-2026-mai-keynote-transcript/ |

**deepseek-v4-1-flash-1017 (added)**
- **Confirmed fields:**
  - name, provider and family;
  - releaseDate 2026-10-17;
  - status current;
  - access `both`: API, app and web, plus weights;
  - licence MIT;
  - modalities text and image: the Hugging Face pipeline tag is `image-text-to-text`, the card mentions "interleaved image content", and the pricing page lists Vision "Supported" for `deepseek-flash`;
  - contextWindowTokens 1000000: the card's table says "1M tokens" and the pricing page says "1M".
- **parameterCount `"763B (HF safetensors count)"`** is allowed. See open question (c).
- **Notes.**
  - "API model name not stated in the announcement" is literally true, but DeepSeek's pricing page states it. See MUST FIX 3.
  - "Tuned for DeepSeek Harness, Tencent CodeBuddy and WorkBuddy" is supported by the announcement.

**deepseek-v4-1-flash (changed)**
- `status` → `superseded` is supported. See open question (a).
- After this change, `access: "both"` and the note "Open weights plus API (deepseek-flash)" are false. The `deepseek-flash` API name now serves V4.1-Flash-1017, and no API model name serves the original V4.1-Flash checkpoint.
- The added sentence about the 1017 update is correct.

**google-gemini-4-argon (changed)**
- Google's post is dated "Oct 13, 2026" and titled "Gemini 4 Argon comes to the Gemini app". It says "Google AI Pro and Ultra subscribers can now access Gemini 4 Argon".
- access `api` → `both` is correct.
- The new note sentence matches the source.
- The post predates the window, so no log row is correct. See open question (d).

**microsoft-mai-thinking-1 (changed)**
- The primary post (Aug 12, 2026) supports the new fields:
  - "256k token window" gives 262144;
  - "35B-active, ~1T-total parameters, sparse Mixture of Experts";
  - "now available in public preview" on Foundry gives status `preview` and access `api`.
- The note says the 2 June date "is from secondary reports". This is **wrong**: Microsoft's own posts dated June 2, 2026 announce the model. See open question (b).

### 2b. Answers to the open questions

**(a) Is `deepseek-v4-1-flash` "superseded"? Yes, keep it.**
- The data model (`model-watch-core.mjs`, documented extension) defines `superseded` only as "a verifiable lifecycle fact, never a quality judgement".
- The catalog's own usage gives the working definition: the provider has put a newer model in the same line, and the older model is still obtainable. Examples:
  - `openai-gpt-6-sol`, after GPT-6.1 Sol;
  - `anthropic-claude-fable-5`, "legacy, still available";
  - `google-gemma-3-4b`, with weights still downloadable.
- DeepSeek's wording fits that definition:
  - the card calls 1017 "a minor update to DeepSeek-V4.1-Flash";
  - the announcement calls V4.1-Flash "the previous version";
  - the pricing page maps the API name `deepseek-flash` to DeepSeek-V4.1-Flash-1017.
- The researcher's caveat ("DeepSeek does not say the older checkpoint is withdrawn from the API") is answered by the pricing page: the API name now serves the new checkpoint.
- `retired` would be wrong, because the original weights remain public on Hugging Face (repo live, last modified 2026-10-16).
- The consequence is that the row's API access is gone, which is MUST FIX 1 and 2.

**(b) MAI-Thinking-1 releaseDate. Keep 2026-06-02, but it is now primary-sourced.**
- Microsoft's own post "Building a hill-climbing machine: Launching seven new MAI models" is dated **June 2, 2026**. It introduces MAI-Thinking-1 as "Microsoft AI's flagship reasoning model".
- The "Microsoft Build 2026: MAI keynote transcript" post is also dated **June 2, 2026**. It says "Next up is our text foundation model, MAI-Thinking-1, our first reasoning model … a 35B active parameter MoE with a 256K context window."
- The data model requires primary over secondary and dates no more precise than the source. Both rules are met by 2026-06-02 with these primary sources.
- The catalog's convention is the announcement date. For example, `google-gemini-4-argon` uses the 2026-09-30 announcement, not the 13 Oct GA date.
- The Aug 12 post is the public-preview availability date and belongs in `notes`.
- The researcher could not find the June primary because the microsoft.ai news index shows no day-level dates.

**(c) `deepseek-v4-1-flash-1017` parameterCount "763B (HF safetensors count)". Allowed; do not null it.**
- The data model defines `parameterCount` as "disclosed text". The catalog already uses a labelled Hugging Face safetensors count in five rows: `openai-gpt-oss-120b`, `openai-gpt-oss-20b`, `google-gemma-3-4b`, `google-gemma-2-9b`, and the Granite 4.2 rows in parenthesis.
- The figure is correct: the Hugging Face API safetensors total is 763,205,315,794.
- **Recommended, non-blocking.** The parent row gives DeepSeek's stated "552B backbone". The 763B total includes the Engram and vision parameters (fact-check 2026-10-16), so the two rows read as if the model grew by 38%. Add a note clause to the 1017 row, such as "the card states no parameter count; the parent card gives a 552B backbone". Alternatively, use the same "552B backbone" wording only if a DeepSeek source for 1017 states it. None that I opened does.

**(d) `google-gemini-4-argon` access change. Confirmed.** See section 2a.

### 2c. Unchanged rows sampled (17, one or more per provider)

| id | Verdict | Field findings | Evidence |
|---|---|---|---|
| openai-gpt-6-luna | confirmed | 2026-09-22 (changelog). 1.05M context gives 1050000. $0.10/$0.50. Text and image input. "Our most efficient model for focused, high-volume tasks." | https://developers.openai.com/api/docs/models ; https://developers.openai.com/api/docs/changelog |
| anthropic-claude-haiku-5-5 | confirmed | 2026-10-07, 1M, "From $0.10 / input MTok, From $0.50 / output MTok", "first Haiku-class model to come with an adjustable effort setting". Active in the deprecations table. | https://www.anthropic.com/news/claude-haiku-5-5 ; https://platform.claude.com/docs/en/docs/about-claude/models/overview |
| google-gemini-3-8-flash | confirmed | Changelog Sep 2, 2026. Input limit 1,048,576 and output 65,536. Text, image, video, audio and PDF in. Stable. | https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash ; https://ai.google.dev/gemini-api/docs/changelog |
| meta-muse-wonder | confirmed | Oct 12, 2026. Meta Model API plus Muse Code; Wonder Full is for Muse Code subscribers. Licence, context and parameters are not stated, so null is right. "A full report with additional safety evaluations will be available soon", still unpublished. | https://research.meta.ai/blog/muse-wonder |
| mistral-small-4 | confirmed | "119B parameters, with 6.5B activated per token". 256k gives 262144. Apache 2.0. Docs version v26.03, which matches 2026-03. | https://huggingface.co/mistralai/Mistral-Small-4-119B-2603 ; https://docs.mistral.ai/getting-started/models/models_overview/ |
| xai-grok-4-7 | confirmed (date secondary) | 500,000 context. Text and image in, text out. Docs: "The knowledge cut-off date of Grok 4.7 is May 2026." No newer model is listed. | https://docs.x.ai/developers/models/grok-4.7 ; https://docs.x.ai/docs/models |
| deepseek-v4-pro | **corrected-value: access `both`** (MUST FIX 6) | Details below. | https://api-docs.deepseek.com/quick_start/pricing ; https://api-docs.deepseek.com/news/news260910 ; https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813 |
| qwen-qwen3-8-flash-next | confirmed (date unverifiable) | Details below. | https://huggingface.co/Qwen/Qwen3.8-Flash-Next |
| microsoft-phi-4-reasoning-vision-15b | confirmed | Card: "March 4, 2026", 15B, 16,384 context, MIT, text and image input. | https://huggingface.co/microsoft/Phi-4-reasoning-vision-15B |
| amazon-nova-2-pro | confirmed | Dec 2, 2025. "Preview", with early access for Nova Forge customers. 1M context. | https://aws.amazon.com/about-aws/whats-new/2025/12/nova-2-foundation-models-amazon-bedrock |
| cohere-command-a-plus | confirmed | `command-a-plus-05-2026`, "our first Mixture of Experts (MoE) model", 218B total and 25B active, 128K in / 64K out, Apache 2.0, vision input. The Cohere blog listing is dated May 20, 2026. | https://docs.cohere.com/changelog/command-a-plus-05-2026 ; https://huggingface.co/CohereLabs/command-a-plus-05-2026-bf16 ; https://cohere.com/blog/command-a-plus |
| ibm-granite-4-2-30b | confirmed | Card: release August 25, 2026. 30B (safetensors 29.28B). "Natively Supports 128K (Long-context extension to 512K)". Apache 2.0. Dense, with a thinking switch. | https://huggingface.co/ibm-granite/granite-4.2-30b |
| ai2-olmo-3-1-32b-think | confirmed | Apache 2.0. 32B (safetensors 32.23B). Hugging Face repo created 2025-12-10, consistent with 2025-12. Context null is acceptable; config `max_position_embeddings` is 65536, which could optionally be added. | https://huggingface.co/allenai/Olmo-3.1-32B-Think |
| nvidia-nemotron-3-5-bolt-74b | confirmed (modalities incomplete) | Details below. | https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 ; https://blogs.nvidia.com/blog/nemotron-3-5-super-vl/ |
| zhipu-glm-5-3-flash | confirmed | "320B total parameters", "18B active", MIT, image-text-to-text, "first natively multimodal model in the GLM-5 series", sparse/linear hybrid attention. Hugging Face repo created 2026-08-25, consistent with 2026-08. | https://huggingface.co/zai-org/GLM-5.3-Flash |
| tii-falcon-h1r-7b | confirmed | Blog dated January 5, 2026. 7B. "Falcon LLM license" (Hugging Face `falcon-llm-license`). Context not stated, so null is right. | https://falcon-lm.github.io/blog/falcon-h1r-7b ; https://huggingface.co/tiiuae/Falcon-H1R-7B |
| lg-k-exaone-2-0 | confirmed | July 31, 2026. Card table: 750B total, 37B active, context 262,144. Apache 2.0. Second model under the Sovereign AI Foundation Model Project. | https://www.lgresearch.ai/news/view?seq=678 ; https://huggingface.co/LGAI-EXAONE/K-EXAONE-2.0-750B-A37B |

**deepseek-v4-pro**
- The pricing page, updated after Oct 17 because it names 1017, lists `deepseek-v4-pro` with "MODEL VERSION DeepSeek-V4-Pro-0813". It has its own Pro prices and concurrency limit (500) and no routing footnote.
- So V4-Pro is a live API model, and `access: "open-weights"` is wrong. The note's "being phased out in the API" is a real Sep 10 quote ("We're phasing out V4-Pro"), so status `deprecated` can stay.
- The Sep 10 routing statement (Pro requests go to V4.1-Flash "until V4.1-Pro launches") is no longer reflected on the pricing page.
- Other fields are unchanged and plausible: MIT; 1.6T total and 49B active from a secondary source (Hugging Face safetensors gives 1.65T); 1M context.

**qwen-qwen3-8-flash-next**
- Card: "125B with 6B activated, plus 51B n-gram embedding and 4B MTP". 262,144 native context, extendable to 1M. Licence `qwen-community-1.0`. "Experimental preview of the architecture that will underpin Qwen4."
- The day-level releaseDate 2026-08-28 is not on the card. The Hugging Face repo was created 2026-08-24, and the only other source is secondary (yottalabs). Not re-verified.
- The card also lists video input. Optional.

**nvidia-nemotron-3-5-bolt-74b**
- Card: "74B (9B active)", "Up to 256K tokens", OpenMDW-1.1, release 10/15/2026. The blog says 24GB with 2-bit quantisation and Bolt E4B on Oct 23.
- The card lists input as "Text, images, and video", but the row has only `["text","image"]`. Recommended: add `"video"`.

Total catalog rows checked: **21**: 4 added or changed, and 17 unchanged across 17 of the 18 providers. The Technology Innovation Institute, IBM, LG, Cohere, Amazon, Ai2, Zhipu, NVIDIA and Microsoft rows are all included. Moonshot is the one provider not sampled; Kimi K3 was checked on 2026-10-16.

## MUST FIX

1. **`deepseek-v4-1-flash` / `access`**
   - Current value: `"both"`.
   - Correct value: `"open-weights"`.
   - Why: the API name `deepseek-flash` now serves DeepSeek-V4.1-Flash-1017, and no listed API model serves the original V4.1-Flash. The legacy names `deepseek-v4-flash` and `deepseek-v4-flash-vision-exp` are also "served by DeepSeek-V4.1-Flash-1017".
   - Source: https://api-docs.deepseek.com/quick_start/pricing
2. **`deepseek-v4-1-flash` / `notes`**
   - Current value: "Open weights plus API (deepseek-flash). …"
   - Correct value: say it was served on the API as `deepseek-flash` until DeepSeek-V4.1-Flash-1017 replaced it under that name. Keep the 17 Oct sentence and the historical 14 Sep routing sentence.
   - Add the pricing page to `sources`.
   - Source: https://api-docs.deepseek.com/quick_start/pricing
3. **`deepseek-v4-1-flash-1017` / `notes` and `sources`**
   - Current value: "API model name not stated in the announcement."
   - Correct value: "Served on the DeepSeek API as `deepseek-flash` (pricing page)." Add https://api-docs.deepseek.com/quick_start/pricing as a primary source.
   - The current sentence is literally true, but it implies the name is unknown when DeepSeek's own docs state it.
   - Source: https://api-docs.deepseek.com/quick_start/pricing
4. **`microsoft-mai-thinking-1` / `notes`**
   - Current value: "…Build 2026 announcement date (2 Jun) is from secondary reports…"
   - Correct value: the 2 Jun Build 2026 announcement is from Microsoft's own posts, and the public preview on Microsoft Foundry was announced in Microsoft's 12 Aug 2026 post. The 256K context and ~1T-total / 35B-active parameter count stay as they are.
   - Sources: https://microsoft.ai/news/building-a-hillclimbing-machine-launching-seven-new-mai-models/ (dated June 2, 2026) and https://microsoft.ai/news/microsoft-build-2026-mai-keynote-transcript/ (dated June 2, 2026).
5. **`microsoft-mai-thinking-1` / `sources`**
   - Current value: one primary source (the Aug 12 post) plus three secondary sources.
   - Correct value: add the two June 2 Microsoft posts as primary sources (URLs in item 4).
   - **`releaseDate` stays `2026-06-02`.** It is now primary-sourced and follows the catalog's announcement-date convention.
6. **`deepseek-v4-pro` / `access`** (unchanged row; it will receive `lastVerifiedOn = 2026-10-22` on import, so it must be correct)
   - Current value: `"open-weights"`.
   - Correct value: `"both"`.
   - Why: the pricing page lists API model `deepseek-v4-pro` with MODEL VERSION DeepSeek-V4-Pro-0813, its own prices and a concurrency limit of 500.
   - Add a note that the page no longer shows the Sep 14 routing to V4.1-Flash, and add the pricing page to `sources`.
   - Source: https://api-docs.deepseek.com/quick_start/pricing

### Recommended, non-blocking

- **`deepseek-v4-1-flash-1017` / `notes`:** add that the card states no parameter count and that the parent card gives a "552B backbone". Without this, 763B and 552B read as a size change. See open question (c).
- **releases[0] / `sources`:** add https://api-docs.deepseek.com/quick_start/pricing as a third primary source.
- **`nvidia-nemotron-3-5-bolt-74b` / `modalities`:** add `"video"`. The card says "Text, images, and video".
- **`ai2-olmo-3-1-32b-think` / `contextWindowTokens`:** could be 65536 (config `max_position_embeddings`). Null is acceptable.

## SHOULD DROP

None.
- The single release row has two genuine primary sources and is correct.
- No catalog row rests on a source that fails or contradicts it.
- The secondary-only facts are labelled as secondary: the Grok 4.7 date and the V4-Pro 1.6T/49B figure.

## MISSED ITEMS

**In the window (2026-10-17..2026-10-22): none found from the 18 catalog providers.** What I checked:
- **OpenAI.**
  - openai.com/news returned **403**.
  - The API changelog has no Oct 22 entries. Oct 20 (12-hour prompt caching) and Oct 21 (project service-tier settings) are platform features.
  - The deprecations page has no announcement dated after 2026-10-14.
- **xAI.**
  - x.ai/news returned **403**.
  - docs.x.ai/docs/models lists nothing newer than grok-4.7.
  - The October release notes are voice-only: Grok Voice 3.0, a voice/transcribe deprecation.
  - AWS feed, 19 Oct: "Grok 4.7 is now available on Amazon Bedrock in AWS GovCloud (US)". This is a third-party regional expansion; I agree it is not logged.
- **Qwen.**
  - Alibaba Cloud Model Studio's dated "newly released models" page is primary for API-only Qwen releases. It lists only `deepseek-v4.1-flash-1017` (2026-10-17) and PixVerse video models (2026-10-22) in the window. The last Qwen entries are image models dated 2026-10-09 and 2026-10-02.
  - The Hugging Face Qwen org has no repo created since 2026-10-09.
  - An aggregator lead, "Qwen3.6 27B, October 21, 2026" (llmgateway.io), is **not** a release: Hugging Face `Qwen/Qwen3.6-27B` was created 2026-04-21.
- **IBM, LG, Cohere, Moonshot and Zhipu.**
  - No Hugging Face repos were created since 2026-10-16 for `ibm-granite`, `LGAI-EXAONE`, `CohereLabs`, `moonshotai` or `zai-org`.
  - Web searches found no dated October release for any of them.
- **Anthropic.** The newsroom HTML has these dates in the window:
  - Oct 18 "Investing in the public benefit";
  - Oct 20 research post "How Claude designed protein binders against scorpion neurotoxins";
  - Oct 21 LTBT appointment.
  - None is a model item.
  - The deprecations table has no new model entries.
- **Google.** The blog RSS for Oct 17-22 has no model release. The Gemini changelog's latest entry is Oct 13.
- **Amazon.** The What's New feed for Oct 17-22 has no Nova item.
- **Hugging Face orgs created since 2026-10-16.** For the 20 organisations the researcher listed:
  - Microsoft: `Sentiment-Analysis-7B`, a narrow Mistral fine-tune; agree it is excluded.
  - NVIDIA: Cosmos3 robotics and video repos (excluded types).
  - DeepSeek: the 1017 repo.
  - NVIDIA also has the Dory repos, covered below.

**Out of window, for coordinator awareness (cannot enter this log or the published 2026-10-16 edition):**
- **NVIDIA Nemotron-Labs-Dory1.0-4B.** The card says "Release Date: October 16, 2026". It is a general-purpose 4B looped LLM, OpenMDW-1.1, "ready for commercial or non-commercial use".
  - Repos were created 2026-10-16 in BF16, NVFP4, MXFP8 and GGUF.
  - Oct 16 falls in the 2026-10-16 edition's window, but that log does not contain it.
  - It is a backfill candidate if the coordinator wants one.
  - Source: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- **OpenAI deprecations announced 2026-10-14 and 2026-10-01**, already noted by the researcher. I confirm both on https://developers.openai.com/api/docs/deprecations.

**Not catalog providers (for information only):**
- MiniMax M3.1 Flash, aggregator date Oct 19, not verified;
- Reflection "Beam" on SageMaker JumpStart, AWS feed Oct 21.

## VERIFIED (rows checked)

- **Release:** 2026-10-17 DeepSeek-V4.1-Flash-1017.
- **Catalog, added or changed (4):**
  - deepseek-v4-1-flash-1017
  - deepseek-v4-1-flash
  - google-gemini-4-argon
  - microsoft-mai-thinking-1
- **Catalog, unchanged sample (17):**
  - openai-gpt-6-luna
  - anthropic-claude-haiku-5-5
  - google-gemini-3-8-flash
  - meta-muse-wonder
  - mistral-small-4
  - xai-grok-4-7
  - deepseek-v4-pro
  - qwen-qwen3-8-flash-next
  - microsoft-phi-4-reasoning-vision-15b
  - amazon-nova-2-pro
  - cohere-command-a-plus
  - ibm-granite-4-2-30b
  - ai2-olmo-3-1-32b-think
  - nvidia-nemotron-3-5-bolt-74b
  - zhipu-glm-5-3-flash
  - tii-falcon-h1r-7b
  - lg-k-exaone-2-0
- **Total:** 21 catalog rows and 1 release.

| Scope | confirmed | corrected-value | unverifiable | wrong |
|---|---|---|---|---|
| Release (1) | 1 | 0 | 0 | 0 |
| Catalog (21) | 17 | 4 (V4.1-Flash access and notes; V4.1-Flash-1017 notes and source; MAI-Thinking-1 notes and sources; V4-Pro access) | 0 (one releaseDate, Qwen3.8-Flash-Next, is not re-verified at day level) | 0 |

## Verdict

**Publishable after the six MUST FIX items are applied through the parser. No SHOULD DROP.**
- The release log is correct.
- The researcher's judgement calls hold:
  - V4.1-Flash `superseded` is supported, and DeepSeek's pricing page shows it more directly than the notes argued.
  - The 763B safetensors count follows catalog precedent.
  - The Gemini 4 Argon `both` change is correct.
  - MAI-Thinking-1 keeps 2026-06-02, now on Microsoft's own June 2 posts.
- The fixes are the stale API facts that follow from the 1017 swap (V4.1-Flash and V4-Pro access) and the note that wrongly calls the June date secondary-only.
- I found no missed in-window release from the 18 catalog providers. openai.com/news and x.ai/news remained 403, so `coverage.notScanned` should still say so.


---

## Coordinator note (2026-10-22): how the corrections were applied

Applied by parser (S8), script `mwfix1022.mjs` in the session scratchpad.

- **MUST FIX 1, 2, 3 and 6 (DeepSeek):** applied as written. The coordinator re-fetched
  https://api-docs.deepseek.com/quick_start/pricing and found DeepSeek-V4.1-Flash-1017, deepseek-flash,
  deepseek-v4-pro and DeepSeek-V4-Pro-0813 on it.
- **MUST FIX 4 and 5 (MAI-Thinking-1): narrowed.** Both June 2 Microsoft URLs returned 403 to the coordinator.
  A reader-proxy fetch of the keynote transcript confirmed that Microsoft's Build 2026 keynote announces
  MAI-Thinking-1, but the page shows no date. The proxy reported the hill-climbing post's published time as
  2026-10-22, which conflicts with the June 2 date given above. So the coordinator added only the keynote
  transcript as a primary source. The note still says that the 2 Jun date comes from secondary reports.
  `releaseDate` stays 2026-06-02, as published on 2026-10-16.
- **Recommended items applied:** the parameter-count note on the 1017 row, the pricing page on the release row,
  and "video" on nvidia-nemotron-3-5-bolt-74b (the coordinator re-read the model card README: "Text, images, and video").
- **Not applied:** the ai2-olmo-3-1-32b-think context value (null is acceptable). The out-of-window items
  (the OpenAI deprecations of 2026-10-01 and 2026-10-14, and NVIDIA Nemotron-Labs-Dory1.0-4B on 2026-10-16) are
  backlog row MW-BACKFILL. They are not part of this edition, because its log covers only the window.
