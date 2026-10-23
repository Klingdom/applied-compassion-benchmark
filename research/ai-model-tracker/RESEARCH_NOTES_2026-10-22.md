# AI model tracker: research notes, 2026-10-22

Files: `catalog-2026-10-22.json` (63 models, 18 providers) and `releases-2026-10-22.json` (1 item, window 2026-10-17 to 2026-10-22, six days inclusive).

This is a factual registry. It does not rate, rank or score any model.

## Result in one paragraph

The six-day window logged one release that has a primary source: DeepSeek-V4.1-Flash-1017 (2026-10-17). No other provider in the catalog published a new general-purpose LLM, a model deprecation or a model system card dated 2026-10-17..2026-10-22 on any page I could read. The list is short because we found little, not because we trimmed it. `heldOut` is empty: no in-window item was found that had only secondary sources.

## Method

Catalog `catalog-2026-10-22.json` was made by a Node script that parses `catalog-2026-10-16.json` and writes it back out. Four rows were changed through the script (listed below). All other rows are byte-identical to the 2026-10-16 file, and their `accessed` dates are still 2026-10-16, because they were not re-verified this session.

The 18 providers in the 2026-10-16 catalog, and what was checked for each:

| Provider (as in catalog) | Pages opened this session (WebFetch unless noted) | In-window finding |
|---|---|---|
| OpenAI | https://developers.openai.com/api/docs/changelog ; https://developers.openai.com/api/docs/deprecations ; https://developers.openai.com/api/docs/models ; HF API `author=openai` (curl) | Changelog entries for Oct 20 (12-hour prompt caching) and Oct 21 (project service-tier limits) are platform features, not models. No new model, and no deprecation dated in the window. |
| Anthropic | https://www.anthropic.com/news ; https://platform.claude.com/docs/en/about-claude/model-deprecations | Newsroom posts dated Oct 18 ("Investing in the public benefit") and Oct 21 (Christopher Stubbs joins the Long-Term Benefit Trust) are not model items. The deprecations table has no new entry after 2026-09-30. See "Not logged" for the API-version parameter removal. |
| Google DeepMind | https://ai.google.dev/gemini-api/docs/changelog ; https://ai.google.dev/gemini-api/docs/models ; https://ai.google.dev/gemma/docs/releases ; https://blog.google/technology/ai/ ; https://blog.google/innovation-and-ai/products/gemini-app/gemini-4-argon-availability/ ; HF API `author=google` | Latest changelog entry is Oct 13; models page "Last updated 2026-10-21" with no per-model dates; latest Gemma entry is EmbeddingGemma 2 (Oct 6, excluded type). Nothing in window. The Gemini-app post (dated Oct 13) was used for a catalog field update. |
| Meta | https://ai.meta.com/blog/ ; https://research.meta.ai/blog/ ; HF API `author=meta-llama`, `meta-models`, `facebook` | Newest research.meta.ai post is Oct 15. No Muse Wonder safety report listed yet. Nothing in window. |
| Mistral AI | https://mistral.ai/news ; https://mistral.ai/news/mistral-large-4 ; https://mistral.ai/news/mistral-nvidia-ai-for-industrial-engineering/ ; HF API `author=mistralai` | Oct 20 "Voxtral 3" (speech, excluded type; not opened). Oct 21 NVIDIA engineering post repeats that Large 4 weights are "planned for release at the end of October". The Large 4 post still says weights are not released. Nothing logged. |
| xAI (SpaceXAI) | https://docs.x.ai/docs/models ; https://docs.x.ai/docs/release-notes ; https://x.ai/news (403) ; HF API `author=xai-org` | Models page lists no model newer than grok-4.7. October release notes cover only Grok Voice items (voice, excluded type; no day given). Nothing in window. |
| DeepSeek | https://api-docs.deepseek.com/news/news260910 (sidebar) ; https://api-docs.deepseek.com/news/news261017 ; https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017 ; HF API `author=deepseek-ai` and `/api/models/deepseek-ai/DeepSeek-V4.1-Flash-1017` (curl) | **DeepSeek-V4.1-Flash-1017, 2026/10/17.** Logged. |
| Alibaba (Qwen) | https://qwen.ai/research (renders client-side; empty) ; HF API `author=Qwen` ; web search | No HF repo created since 2026-10-10. Search found only secondary reports that Qwen 4 has no release date. Nothing in window. |
| Microsoft | https://microsoft.ai/news/ ; https://microsoft.ai/news/introducing-mai-thinking-1/ ; https://microsoft.ai/news/frontier-pre-training-at-microsoft-ai/ ; HF API `author=microsoft` | News index has no day-level dates. The "Frontier Pre-training" post is dated Oct 15 (prior window). It says MAI-Base-2 is still in post-training, so it is not a release. HF `microsoft/Sentiment-Analysis-7B` was created 2026-10-17, but it is a narrow task model and was judged not notable. The MAI-Thinking-1 post was used for a catalog update. |
| Amazon | https://aws.amazon.com/about-aws/whats-new/recent/feed/ (read in three parts) ; HF API `author=amazon` | No Nova item in the window. An Oct 19 item, "Amazon Bedrock Grok 4.7 in AWS GovCloud (US)" (https://aws.amazon.com/about-aws/whats-new/2026/10/amazon-bedrock-grok-4-7-govcloud/), is a regional availability expansion of an existing third-party model. It was not opened directly, and it was not logged (see below). |
| Cohere | https://docs.cohere.com/changelog ; https://docs.cohere.com/llms.txt ; HF API `author=CohereLabs` ; web search | Changelog index shows no dates. No CohereLabs HF repo created since 2026-10-10. Nothing in window found. |
| IBM | https://www.ibm.com/new/announcements (client-side; empty) ; HF API `author=ibm-granite` | The newest ibm-granite repos are dated 2026-10-14 (Granite Switch 4.1, already logged). Nothing in window. |
| Allen Institute for AI (Ai2) | https://allenai.org/news ; HF API `author=allenai` | The October items carry month-level dates only: AstaBrief open-sourced, a Bolmo paper in Nature, and Olmo-core 3 training infrastructure. None is a general Olmo LLM, and none can be dated inside the window. |
| NVIDIA | https://blogs.nvidia.com/blog/category/generative-ai/ ; https://blogs.nvidia.com/blog/open-models-europe-industry/ ; HF API `author=nvidia` (60 newest) | Oct 21 posts restate Nemotron 3.5 Super VL / Bolt (released Oct 15) and say "Nemotron 3.5 Bolt E4B 4GB is expected to be available on Friday, Oct. 23", which is outside the window. In-window HF repos are Cosmos robotics/video (excluded types). Nothing logged. |
| Moonshot AI | https://platform.kimi.ai/blog (newest post 2026-02-25) ; HF API `author=moonshotai` | Nothing in window. |
| Zhipu AI (Z.ai) | https://docs.z.ai/release-notes/new-released ; HF API `author=zai-org` | Newest release note is 2026-08-26. Nothing in window. |
| Technology Innovation Institute (TII) | https://falcon-lm.github.io/blog/ ; HF API `author=tiiuae` | Newest posts are dated Oct 6 (Falcon OCR Arabic, Falcon-Emirati), before the window. Nothing in window. |
| LG AI Research | https://www.lgresearch.ai/news (client-side; empty) ; HF API `author=LGAI-EXAONE` | No LGAI-EXAONE repo created since 2026-10-10. Nothing in window found. |

The HF API listing `GET /api/models?author=<org>&sort=createdAt&direction=-1` was run via curl for these orgs: Qwen, google, meta-llama, meta-models, facebook, mistralai, microsoft, ibm-granite, allenai, nvidia, moonshotai, zai-org, tiiuae, LGAI-EXAONE, CohereLabs, openai, amazon, xai-org, ai21labs and deepseek-ai. I recorded every repo created on or after 2026-10-10.

Web searches (secondary, used only to look for leads; nothing was logged from them):
- "new AI model released October 2026 Qwen OR Kimi OR GLM OR Grok OR MAI"
- "AI model launch "October 20, 2026" OR "October 21, 2026" OR "October 19, 2026" OR "October 22, 2026""
- "Cohere new model announcement October 2026"
- "Alibaba Qwen release October 2026"
- "xAI Grok new model October 2026"

None of these surfaced a dated in-window release for any catalog provider.

## Release logged (1)

1. **2026-10-17, DeepSeek, DeepSeek-V4.1-Flash-1017, kind `update`.**
   - DeepSeek's news page is dated 2026/10/17. It says the release is live on the API, app and website, with weights on Hugging Face and ModelScope.
   - The HF card calls it "a minor update to DeepSeek-V4.1-Flash", licensed MIT, with a 1M-token context in its sampling table. The HF repo was created 2026-10-17T02:40Z.
   - The announcement does not state an API model name, licence, context length or parameter count. Those catalog fields come from the HF card and the HF safetensors total.
   - The announcement's performance claims ("stronger benchmark performance…") were deliberately not restated (MW-L2).
   - No safety statement appears in the announcement, so `safetyOrWelfareRelevant` is false.
   - The kind is `update`, not `new-version` or `open-weights-release`, because DeepSeek itself calls it a minor update.

## Catalog changes (1 added, 3 changed)

1. **Added `deepseek-v4-1-flash-1017`.**
   - Sources: news261017 and the HF card. Fields: access `both` (API plus open weights); licence MIT; modalities text and image (HF tag Image-Text-to-Text; card mentions interleaved image content); context 1,000,000 (card: "1M tokens").
   - parameterCount is "763B (HF safetensors count)", because the card states no parameter count. This follows the 2026-10-16 convention. The 2026-10-16 fact-check noted that the V4.1-Flash safetensors total of 763B includes Engram/vision parameters and that the card there gives a "552B backbone".
2. **`deepseek-v4-1-flash`: status `current` → `superseded`.** The note now records the 1017 update, and news261017 is added as a source. Caveat for the fact-checker: DeepSeek does not say the older checkpoint is withdrawn from the API. "Superseded" rests on the card's "minor update to" wording and on the announcement calling V4.1-Flash "the previous version".
3. **`google-gemini-4-argon`: access `api` → `both`.** Google's post "Gemini 4 is now available in the Gemini app", dated Oct 13, 2026, says it is available to "Google AI Pro and Ultra subscribers". The note and source were added. The importer's licence rule resolves `both` + Proprietary to api + consumer-app, which matches this source. The post predates the window, so no release-log row is added.
4. **`microsoft-mai-thinking-1`: first primary source added**, https://microsoft.ai/news/introducing-mai-thinking-1/. The post is dated August 12, 2026.
   - **Context window:** Microsoft says "256k token window", recorded as 262144 under the N×1024 convention.
   - **Parameters:** Microsoft says "35B-active, ~1T-total parameters, sparse Mixture of Experts". This resolves the conflict the 2026-10-16 notes recorded.
   - **Status:** the post says "now available in public preview" (Foundry), so status stays `preview`.
   - **releaseDate is left at 2026-06-02**, the Build 2026 announcement date from secondary reports. Microsoft's own post is dated 2026-08-12 and says the public preview is "now available".
   - **Open question for the fact-check:** keep the Build date, or change it to the primary 2026-08-12 date? Microsoft's post does not mention the June announcement.

## Held out

None. `heldOut: []`.

## Not logged, and why (for the fact-checker and the edition author)

- **Out of window, missed by the 2026-10-16 log.** The OpenAI deprecations page lists two announcements dated before this window that the 2026-10-16 release log does not contain:
  - **2026-10-14:** GPT-4o, GPT-4o mini, GPT-4.1 and GPT-4.1 mini snapshots, shutdown 2027-01-14, replacement `gpt-6-luna`.
  - **2026-10-01:** `gpt-5.3-codex`, `gpt-5.1` and `gpt-5.4-nano`, removal 2027-04-01. A text-to-speech deprecation of the same date is an excluded type.
  - They are dated outside 2026-10-17..2026-10-22, so they are not in this file. Whether to backfill them is the coordinator's call. The data model allows a backfilled log, but a row added now cannot enter the already-published 2026-10-16 edition.
- **Anthropic API parameter removal.** The deprecations page says `temperature`, `top_p` and `top_k` are "Removed in API version `2026-10-21`", returning a 400 error. This is an API-version parameter change, not a model release or a model deprecation, and the 2026-10-16 log had no precedent for such items, so it was not logged. The removal date comes from the version string; I did not open the linked migration page.
- **Grok 4.7 on Amazon Bedrock GovCloud (US), Oct 19.** This is a regional availability expansion on a third-party platform, seen only in the AWS feed summary, and the item page was not opened. It was not logged.
- **Nemotron 3.5 Bolt E4B.** NVIDIA's Oct 21 post says it is "expected to be available on Friday, Oct. 23", after the window. Check it next edition.
- **Mistral Large 4 weights.** Mistral says they will be released by end of October and they are not released as of Oct 21. Check them next edition.
- **MAI-Base-2 (Microsoft, Oct 15).** Pre-training is finished and post-training is under way. The model is not released, and the post is in the prior window.
- **Excluded model types seen in window:** Voxtral 3 (speech, Mistral, Oct 20); NVIDIA Cosmos3 robotics and video repos (Oct 19); Veo 3.1 shutdown on Oct 22 (video, from the Gemini models page).

## Providers not checked, or checked only partly (honest coverage gaps)

- **x.ai/news** returned 403 again. xAI coverage rests on the docs models page and release notes, which give no day-level dates for October.
- **qwen.ai, ibm.com/new/announcements and lgresearch.ai/news** render client-side and returned no listings. For these three, coverage rests on HF org listings plus one web search (Qwen). An API-only Qwen, IBM or LG release with no HF repo could have been missed.
- **Cohere:** the changelog index shows no dates, so an API-only Cohere release in the window could have been missed. The HF org shows nothing new.
- **Microsoft:** the microsoft.ai news index has no day-level dates. Only two posts were opened. An MAI post dated in the window cannot be ruled out, although none appeared on the index with an October image path apart from the two noted.
- **Allen Institute for AI:** news dates are month-level only. AstaBrief (October 2026) cannot be placed in or out of the window and is a specialised model in any case, so it stays excluded as in 2026-10-16.
- **Moonshot AI:** platform.kimi.ai/blog has not been updated since February 2026, so it is a weak signal. Coverage is effectively the HF org listing only.
- **Google blog:** the AI index page shows no dates. blog.google/feed was not opened.
- **OpenAI:** openai.com/index was not tried, because it returned 403 on 2026-10-16. Coverage rests on the API changelog, the deprecations page and the models page.
- **The 59 unchanged catalog rows were not re-verified this session.** Their `accessed` dates remain 2026-10-16.
- **Providers outside the catalog** were not scanned systematically. These include AI21, Liquid AI, Reflection and IFM/Jais, some of which appeared in search results. The catalog's provider list is unchanged.

## Uncertainty

- DeepSeek-V4.1-Flash `superseded`: this is an inference from DeepSeek's "minor update" and "previous version" wording, not an explicit statement. It is flagged above.
- MAI-Thinking-1 releaseDate: the primary date (2026-08-12) and the secondary Build date (2026-06-02) differ. It is flagged above.
- DeepSeek-V4.1-Flash-1017 parameter count is the HF safetensors total, not a provider-stated figure.
