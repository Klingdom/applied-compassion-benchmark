# AI model tracker: independent fact-check, 2026-10-16

Files checked: `catalog-2026-10-16.json` (62 models), `releases-2026-10-16.json` (22 items) and `RESEARCH_NOTES_2026-10-16.md`. The JSON files were not edited.

**Method.**
- Every cited URL was resolved with curl (`-L`, 20-second timeout, browser user agent).
- Page titles were scanned for soft 404s.
- Content claims were checked by opening the cited pages with WebFetch, reading Hugging Face API metadata (`/api/models/<id>`) and Ollama tag pages, and running independent web searches where the cited source was secondary or silent.
- I did not trust the files' own claims.

**Verdicts used:**
- `confirmed`
- `corrected-value: X`
- `unverifiable`
- `wrong`

## 1. Releases (all 22)

| # | Date | Item | Verdict | Notes | Evidence |
|---|---|---|---|---|---|
| 1 | 2026-09-01 | Anthropic: Claude Fable 5.1 / Mythos 5.1 (new-version) | confirmed | Docs: "Released September 1, 2026". Available on the Claude API, Bedrock, Google Cloud and Foundry. Mythos 5.1 is limited to verified organisations. The safetyNote (joint system card) is supported: the docs link it, and the URL resolves to the PDF "Claude Fable 5.1 & Claude Mythos 5.1 System Card". | https://platform.claude.com/docs/en/models/fable-5-1/overview |
| 2 | 2026-09-02 | Google: Gemini 3.8 Flash (new-version) | confirmed | Changelog, Sept 2 2026: "Released `gemini-3.8-flash`". Model page marks it Stable. | https://ai.google.dev/gemini-api/docs/changelog |
| 3 | 2026-09-03 | OpenAI: GPT-6 Astra (new-model) | confirmed (source gap) | Changelog, Sep 3: released as the most capable model. The 1.05M context comes from the Models page, which this release item does not cite. The safetyNote is fully supported by the system card: "first model to reach the Critical level of cybersecurity", "monitorability has decreased relative to GPT-5.6 Sol", and Mental Health / Emotional Reliance / Self Harm / U18 evals. The phrase "phased rollout reported by press" is **not** in any cited source; BleepingComputer does not mention it. Press does support it (TheNewStack, "messy rollout"). | https://developers.openai.com/api/docs/changelog ; https://deploymentsafety.openai.com/gpt-6-astra ; https://thenewstack.io/gpt6-astra-developer-access-delayed/ |
| 4 | 2026-09-08 | OpenAI: GPT-Rosalind (new-model) | confirmed | Changelog, Sep 8: GA through trusted access. "Billing begins October 5, 2026." | https://developers.openai.com/api/docs/changelog |
| 5 | 2026-09-10 | DeepSeek: V4.1-Flash (open-weights-release) | confirmed | News page dated 2026/09/10. API name `deepseek-flash`. "V4-Flash & V4-Flash-Vision-Exp are retired". V4-Pro requests route to V4.1-Flash from 04:00 UTC on 14 Sep. Hugging Face: MIT licence, repo created 2026-09-10. | https://api-docs.deepseek.com/news/news260910 |
| 6 | 2026-09-21 | xAI: Grok 4.7 (new-version) | confirmed (date secondary) | 500K context per xAI docs. The 21 Sep date appears in Let's Data Science and AI Weekly (FR). $2/$6 pricing is unchanged from Grok 4.6, which DataNorth also gives as $2/$6. | https://docs.x.ai/developers/models/grok-4.7 ; https://letsdatascience.com/news/xai-releases-grok-47-with-500k-context-43aa2021 ; https://datanorth.ai/news/xai-releases-grok-4-6 |
| 7 | 2026-09-22 | OpenAI: GPT-6 Sol and GPT-6 Luna (new-model) | confirmed | Changelog, Sep 22. Sol is $2/$10 and Luna is $0.10/$0.50. | https://developers.openai.com/api/docs/changelog |
| 8 | 2026-09-22 | Anthropic: Claude Opus 5.5 (new-version) | confirmed | Post dated Sep 22 2026: "first model in our new Claude 5.5 family". Priced $4/$20. "Performs at the level of Claude Fable 5.1 on most work." Tested by "external evaluators, including Frontier Design and METR". "Often suspects it is being evaluated." System card linked. | https://www.anthropic.com/news/claude-opus-5-5 |
| 9 | 2026-09-28 | Anthropic: Claude Sonnet 5.5 (new-version) | confirmed | Sep 28 2026, priced $2/$10 like Sonnet 5. "First Sonnet model to launch with cyber safeguards and fallbacks." Automated audit of "roughly 1,850 scenarios". System card linked. | https://www.anthropic.com/news/claude-sonnet-5-5 |
| 10 | 2026-09-28 | OpenAI: GPT-6.1 Astra (policy) | confirmed (secondary) | Reuters, 28 Sep (republished by Virginia Business on 29 Sep): October launch cancelled. Saachi Jain, head of safety systems: "didn't quite meet the bar in terms of staying within scope and authorization." Corroborated by The Star (Malaysia) and TNW. The Virginia Business URL returns 403 to curl but loads in a browser or fetcher. | https://virginiabusiness.com/openai-shelves-gpt-6-1-astra-release-safety-concerns/ ; https://www.thestar.com.my/tech/tech-news/2026/09/29/openai-shelves-new-ai-model-after-internal-safety-tests-wsj-reports |
| 11 | 2026-09-29 | OpenAI: GPT-6.1 Sol (new-version) | confirmed | Changelog, Sep 29: a lower-cost option than GPT-6 Astra for complex coding and professional work. "Multi-agent is in beta." | https://developers.openai.com/api/docs/changelog |
| 12 | 2026-09-30 | Google: Gemini 4 Argon (new-model) | confirmed | Blog, Sep 30: phased rollout, first to cyber defenders through the Fairwind Program. Google takes part in US pre-release government access. The model refuses cyber and CBRN requests and is monitored for misalignment. Changelog: GA on Oct 13. The model card (it does fetch, despite the file saying "not fetched") lists CSAM/child-exploitation policies first. | https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/ ; https://deepmind.google/models/model-cards/gemini-4-argon/ |
| 13 | 2026-09-30 | Anthropic: Sonnet 4.5 deprecation | confirmed | "2026-09-30: Claude Sonnet 4.5 model". Retires November 30, 2026. Replacement is `claude-sonnet-5-5`. | https://platform.claude.com/docs/en/about-claude/model-deprecations |
| 14 | 2026-10-06 | Mistral: Mistral Large 4 (new-model) | confirmed | Post, Oct 6: ~1T total and 52B active, public preview API, "Weights drop end of this month". Mistral is testing with "cybersecurity leaders, vetted partners, and state authorities" before the weights ship. The safetyNote's word "red-teaming" is a fair paraphrase. | https://mistral.ai/news/mistral-large-4 |
| 15 | 2026-10-07 | Anthropic: Claude Haiku 5.5 (new-version) | confirmed | Oct 7 2026. Pricing from $0.10/$0.50 matches the docs; the post tiers by prompt length. "First Haiku-class model to come with an adjustable effort setting." Cyber safeguards are stricter than Haiku 4.5 and less restrictive than Sonnet 5.5. System card linked. | https://www.anthropic.com/news/claude-haiku-5-5 |
| 16 | 2026-10-08 | Google: Gemini 3.7 Flash and 3.5 Flash deprecations | confirmed | Changelog, Oct 8: 3.7 Flash replaced by 3.8 Flash; 3.5 Flash routed to `gemini-3.6-flash`. | https://ai.google.dev/gemini-api/docs/changelog |
| 17 | 2026-10-08 | Anthropic: 2026 Usage Policy update (policy) | confirmed | Oct 8, effective Nov 12. Adds the new "Deceptive Campaigns or Artificial Activity" section, rewritten surveillance and weapons rules, and hardware-operator rules. The new prohibition on "sustained and needless abusive or cruel behavior toward our models" supports the safetyNote. No changes to minors or self-harm rules are mentioned. | https://www.anthropic.com/news/2026-usage-policy-update |
| 18 | 2026-10-12 | Meta: Muse Wonder / Muse Wonder Full (new-model) | confirmed | Oct 12. Muse Wonder is available on the Meta Model API and Muse Code; Wonder Full is for Muse Code subscribers. Agentic focus. CBRN and cyber safeguards under the Meta Superintelligence Scaling Framework. Full safety report promised "soon". | https://research.meta.ai/blog/muse-wonder |
| 19 | 2026-10-14 | IBM: Granite Switch 4.1 8B and 30B (open-weights-release) | confirmed | Card says "Release Date: October 14, 2026". Apache-2.0. Both repos were created on Hugging Face on 2026-10-14. | https://huggingface.co/ibm-granite/granite-switch-4.1-8b |
| 20 | 2026-10-15 | NVIDIA: Nemotron 3.5 Super VL and Bolt (open-weights-release) | confirmed | Blog, Oct 15: "Super VL and Bolt 74B-A9B are available now, with Bolt E4B coming Oct. 23." Super VL is 120B-A12B; Hugging Face licence is openmdw-1.1. | https://blogs.nvidia.com/blog/nemotron-3-5-super-vl/ |
| 21 | 2026-10-15 | Meta: Muse Spark Open (open-weights-release) | confirmed | Dev blog, Oct 15: 816B total, ~42B active, 1M context, Muse Model License. Weights at `meta-models/Muse-Spark-Open-816B-A42B`. | https://dev.meta.ai/resources/blog/build-with-muse-spark-open |
| 22 | 2026-10-15 | Anthropic: independent evaluators (policy) | confirmed | Oct 15: "onboarded six METR employees". Describes a three-tier framework. "Anthropic can't veto publication"; narrow, predefined redactions are allowed. | https://www.anthropic.com/news/an-update-on-independent-evaluators |

**Release safetyNotes:** all 13 non-null safetyNotes are supported by the cited or primary text.

## 2. Catalog sample (25 entries)

The sample covers:
- every entry the notes flag as doubtful;
- all 10 entries with `benchmarkLocalTag`;
- 4 random others: Gemini 4 Argon, Mistral Large 4, Muse Spark Open and DeepSeek-V4.1-Flash.

Fields checked: name, provider, releaseDate, access, licence, contextWindowTokens and parameterCount.

| id | Verdict | Field findings | Evidence |
|---|---|---|---|
| anthropic-claude-fable-5 | **corrected-value** | releaseDate should be `2026-06-09`, not "2026-06" (docs: "Released June 9, 2026"). contextWindowTokens should be `1000000`, not null (docs: "Context window: 1M tokens"). Source `biztoc.com/x/9cebc2ad8156e205` is **wrong**: it redirects to the BizToc homepage and says nothing about Fable 5. Other fields confirmed (proprietary; legacy, still active). | https://platform.claude.com/docs/en/models/fable-5/overview |
| google-gemma-4-31b | confirmed | Release log: 2026-03-31. The Gemini API changelog's Gemma 4 entry says 2026-04-02; the notes record this conflict. Apache-2.0, 256K (262144) context, 30.7B per the card. Hugging Face safetensors gives 31.27B; the card figure is used. | https://ai.google.dev/gemma/docs/releases ; https://huggingface.co/google/gemma-4-31B-it |
| google-gemma-4-12b | **corrected-value (source)** | Values confirmed: 2026-06-03 (release log), Apache-2.0, 256K, 11.95B; Hugging Face reports 11,959,730,224. But the entry cites the **31B** card. The correct source is the 12B card, created 2026-05-23. | https://huggingface.co/google/gemma-4-12B-it |
| google-gemma-4-e4b | confirmed | 2026-03-31, Apache-2.0, 128K (131072), "4.5B effective (8B with embeddings)". | https://huggingface.co/google/gemma-4-E4B-it |
| google-gemma-3-4b (gemma3:4b) | confirmed | 2025-03-10 (release log), Gemma licence, 128K, 4.3B per Hugging Face (4,300,079,472). The Ollama tag exists and states 128K. | https://huggingface.co/google/gemma-3-4b-it ; https://ollama.com/library/gemma3:4b |
| google-gemma-2-9b (gemma2:9b) | confirmed | 2024-06-27 (release log), Gemma licence, 8K, 9.24B per Hugging Face. The Ollama tag states an 8K context window. | https://ai.google.dev/gemma/docs/releases ; https://ollama.com/library/gemma2/tags |
| meta-llama-3-1-8b (llama3.1:8b) | corrected-value (precision) | releaseDate can be the exact day, `2024-07-23` (Meta blog). The other fields are confirmed: Llama 3.1 licence, 128K, 8.03B, and an Ollama context of 128K. | https://ai.meta.com/blog/meta-llama-3-1/ |
| qwen-qwen3-8b (qwen3:8b) | confirmed | 2025-04-29 (Willison post dated that day). Apache-2.0, 32,768 native, 8.19B. The Ollama tag says 40K, which the notes already record. | https://simonwillison.net/2025/Apr/29/qwen-3/ ; https://ollama.com/library/qwen3/tags |
| microsoft-phi-4-mini (phi4-mini) | confirmed | 2025-02, MIT, 128K, 3.8B. The Ollama tag says 128K. | https://huggingface.co/microsoft/Phi-4-mini-instruct |
| cohere-command-r7b (command-r7b) | confirmed | 2024-12-13 (Cohere changelog), CC-BY-NC-4.0, 128K per the docs, 8.03B. The Ollama tag says 8K, as the notes record. | https://docs.cohere.com/v1/changelog/command-r-7b |
| ibm-granite-3-3-8b (granite3.3:8b) | confirmed | Card date "April 16, 2025", Apache-2.0, 128K, 8B. The Ollama tag says 128K. | https://huggingface.co/ibm-granite/granite-3.3-8b-instruct |
| ai2-olmo-2-7b (olmo2:7b) | confirmed | Nov 2024 (card) and 2024-11-26 (TechCrunch). Apache-2.0, 7.3B per Hugging Face. The Ollama tag says 4K. | https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct ; https://ollama.com/library/olmo2/tags |
| tii-falcon3-7b (falcon3:7b) | corrected-value (licence name) | licence should be `TII Falcon-LLM License 2.0`, not "Falcon LLM License". The other fields are confirmed: Dec 2024, 32K, 7.46B. The Ollama tag says 32K. | https://huggingface.co/tiiuae/Falcon3-7B-Instruct |
| lg-exaone-3-5-7-8b (exaone3.5:7.8b) | confirmed | 32,768 context, 7.82B per Hugging Face. The full licence name is "EXAONE AI Model License Agreement 1.1 - NC", so the catalogue's short form is acceptable. The paper is dated 6 Dec 2024 and the release date in the file is 9 Dec. The Ollama tag says 32K. | https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct |
| xai-grok-4-7 | confirmed (date secondary) | 500K context and proprietary (xAI docs). 2026-09-21 comes from several secondary outlets. Parameter count null is correct, since the 2.1T figure is unconfirmed. | https://docs.x.ai/developers/models/grok-4.7 ; https://letsdatascience.com/news/xai-releases-grok-47-with-500k-context-43aa2021 |
| xai-grok-4-6 | confirmed (date secondary) | 500K (xAI docs). 2026-08-12 per DataNorth, 13 Aug; one aggregator says 6 Aug, an outlier. | https://datanorth.ai/news/xai-releases-grok-4-6 ; https://docs.x.ai/docs/models |
| microsoft-mai-thinking-1 | confirmed (secondary only) | 2026-06-02 at Build 2026, confirmed by Olhar Digital, Latent Space and DataNorth. Status preview and access api are supported: private preview on Microsoft Foundry. **Neither cited source states the Foundry preview**, but DataNorth does. Context (128K vs 256K) and parameters (35B active; ~1T total unconfirmed) conflict, so null is the correct value. | https://datanorth.ai/news/microsoft-launches-mai-thinking-1-and-mai-code-1-flash |
| zhipu-glm-5-3 | confirmed | 2026-08-14 launch (DataNorth and others; secondary). The GitHub download table gives "744B-A40B". The Hugging Face repo was created 2026-08-25 with licence tag `glm-5.3`; safetensors reads 753B, which is the full checkpoint. Access `both` (Coding Plan plus weights) is supported. contextWindowTokens is null; secondary reports give 1,000,000, which could optionally be added. | https://github.com/zai-org/GLM-5 ; https://datanorth.ai/news/z-ai-releases-glm-5-3 |
| moonshot-kimi-k3 | corrected-value (access) | Confirmed: announced 2026-07-16 (TNW, PureAI); 2.8T total and 104B active (Hugging Face card); 1,048,576 context; Kimi K3 License. TNW's "~50B active" contradicts the card, so the card is used. access should be `both`: PureAI says "The API has been live since launch," and the weights followed on 27 Jul. | https://huggingface.co/moonshotai/Kimi-K3 ; https://pureai.com/articles/2026/07/17/china-moonshot-ai-releases-kimi-k3.aspx |
| qwen-qwen3-8-max | confirmed | Card: "2.4T in total and 95B activated", 262,144 native context, licence `qwen3.8-max`. Hosted Qwen3.8-Max adds vision and 1M. Month-level 2026-08 matches the Hugging Face repo (created 2026-08-08) and the citation. | https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B |
| qwen-qwen3-8-27b | confirmed | 27B, 262,144 native context, Apache-2.0. Hugging Face repo created 2026-08-05; month-level 2026-08. | https://huggingface.co/Qwen/Qwen3.8-27B |
| google-gemini-4-argon | confirmed | 2026-09-30 announcement; GA 13 Oct. "Context window (unified input and output token limit): 1,048,576". Proprietary; parameter count null. | https://ai.google.dev/gemini-api/docs/models/gemini-4-argon |
| mistral-large-4 | confirmed | 2026-10-06, preview API, ~1T total and 52B active. Licence and context are not stated by Mistral, so null is correct. The docs list v26.10 as "open-weight". | https://mistral.ai/news/mistral-large-4 ; https://docs.mistral.ai/getting-started/models/models_overview/ |
| meta-muse-spark-open | confirmed | 2026-10-15, Muse Model License, 1M context, 816B total and ~42B active. The Hugging Face repo is gated (manual approval). | https://dev.meta.ai/resources/blog/build-with-muse-spark-open |
| deepseek-v4-1-flash | confirmed | 2026-09-10; MIT; 1M context; "552B backbone"; 8B active for prefill and 16B for decode. Access `both` (API plus weights). Hugging Face safetensors reads 763B, which includes the Engram and vision parameters. | https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash |

## 3. Verdict counts

| Scope | confirmed | corrected-value | unverifiable | wrong |
|---|---|---|---|---|
| Releases (22) | 22 (3 rest on secondary sources for some facts; 1 has a source gap) | 0 | 0 | 0 |
| Catalog sample (25) | 20 | 5 (Fable 5 date+context+source; Gemma 4 12B source; Llama 3.1 date precision; Falcon3 licence name; Kimi K3 access) | 0 | 0 |
| **Total (47)** | **42** | **5** | **0** | **0** |

Wrong **sources**, as distinct from wrong values: 1. The BizToc link on `anthropic-claude-fable-5` is dead content.

## 4. URL resolution

There are 116 unique URLs across both files.

| Metric | Result |
|---|---|
| HTTPS | 116 / 116 (100%) |
| HTTP 200 after redirects | 113 |
| HTTP 403 | 3: `https://openai.com/index/gpt-6-astra/` (bot-blocked; the notes already say so), `https://virginiabusiness.com/openai-shelves-gpt-6-1-astra-release-safety-concerns/` (403 to curl, but readable through a fetcher; content verified), `https://theresanaiforthat.com/model/olmo-3/` (403, aggregator) |
| HTTP 404 | 0 |
| Soft failure (200 but wrong content) | 1: `https://biztoc.com/x/9cebc2ad8156e205` resolves to the BizToc homepage with no Fable content |
| "Not fetched" sources now verified | `https://www.anthropic.com/claude-fable-5-1-mythos-5-1-system-card` resolves to the 16 MB PDF "Claude Fable 5.1 & Claude Mythos 5.1 System Card". `https://deepmind.google/models/model-cards/gemini-4-argon/` fetches fine and is dated 13 Oct 2026. Both titles can drop their "not fetched" caveat. |

**By type:** 94 are labelled primary and 22 secondary.
- **Primary domains:** huggingface.co (41), ollama.com (10), anthropic.com (7), ai.google.dev (6), plus 30 other vendor domains.
- **Primary labels:** all are plausible. Vendor docs, vendor blogs, vendor-org Hugging Face repos and arXiv are all primary.
- **Caveat on Ollama:** Ollama tag pages are primary only for the existence and context of the local build, not for provider facts.
- **Secondary labels:** all are genuinely third-party press or aggregators. None are mislabelled primary.
- **Weak secondaries:**
  - BizToc: a relay page, now dead content.
  - theresanaiforthat.com: an aggregator, and 403.

## MUST FIX before publication

1. **`anthropic-claude-fable-5` / `releaseDate`**: set `"2026-06-09"`. Source: https://platform.claude.com/docs/en/models/fable-5/overview ("Released June 9, 2026").
2. **`anthropic-claude-fable-5` / `contextWindowTokens`**: set `1000000`. Same source ("Context window: 1M tokens").
3. **`anthropic-claude-fable-5` / `sources`**: remove `https://biztoc.com/x/9cebc2ad8156e205`, which resolves to the BizToc homepage with no relevant content. Replace it with https://platform.claude.com/docs/en/models/fable-5/overview.
4. **`google-gemma-4-12b` / `sources`**: replace `https://huggingface.co/google/gemma-4-31B-it` (the 31B card) with `https://huggingface.co/google/gemma-4-12B-it`.
5. **releases[2] (`GPT-6 Astra`) / `summary`**: none of the cited sources supports "Phased rollout reported by press". Either remove the phrase, or add a secondary source such as https://thenewstack.io/gpt6-astra-developer-access-delayed/. Also add https://developers.openai.com/api/docs/models, which is the only cited page stating the 1.05M context.
6. **`microsoft-mai-thinking-1` / `sources`**: neither cited source states the "private preview on Microsoft Foundry" claim in `notes`. Add https://datanorth.ai/news/microsoft-launches-mai-thinking-1-and-mai-code-1-flash.

### Recommended (non-blocking corrections)

- **`moonshot-kimi-k3` / `access`**: set `"both"`. The API has been live since launch: https://pureai.com/articles/2026/07/17/china-moonshot-ai-releases-kimi-k3.aspx
- **`tii-falcon3-7b` / `licence`**: set `"TII Falcon-LLM License 2.0"`. Source: https://huggingface.co/tiiuae/Falcon3-7B-Instruct
- **`meta-llama-3-1-8b` / `releaseDate`**: can be made exact, `"2024-07-23"`. Source: https://ai.meta.com/blog/meta-llama-3-1/
- **`zhipu-glm-5-3` / `contextWindowTokens`**: could be `1000000`, but this is secondary only. Source: https://datanorth.ai/news/z-ai-releases-glm-5-3
- **`ai2-olmo-3-7b-instruct` / `sources`**: replace theresanaiforthat.com, which returns 403 and is an aggregator, with an allenai.org or Hugging Face source.
- **Source titles:** drop "not fetched" from the Fable 5.1 system card source and the Gemini 4 Argon model card source. Both resolve and were verified.
- **Consistency of `access`:** Opus 5.5 is `both`, while Fable 5.1, Sonnet 5.5 and Haiku 5.5 are `api`. The Fable 5.1 docs reference a claude.ai system prompt, which implies app availability. Pick one rule and apply it to all four.
- **Possible omission, outside the sample:** NVIDIA Nemotron 3.5 Lightning 30B-A3B is on Hugging Face, created 2026-08-01. The catalogue may want it as NVIDIA's small current model.

## SHOULD DROP

None. Every item in both files that I checked could be confirmed from at least one source, and no claim was contradicted. The items that rest only on secondary sources are corroborated by several independent outlets, so they can stay with their secondary labels:
- the MAI-Thinking-1 entry;
- the Grok 4.7 and 4.6 dates;
- the GLM-5.3 launch date;
- the Kimi K3 announcement date;
- GPT-6.1 Astra.
