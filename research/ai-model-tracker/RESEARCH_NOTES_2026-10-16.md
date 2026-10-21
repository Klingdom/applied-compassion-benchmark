# AI model tracker: research notes, 2026-10-16

Files: `catalog-2026-10-16.json` (62 models, 18 providers) and `releases-2026-10-16.json` (22 items, 2026-09-01 to 2026-10-16).

This is a factual registry. It does not rate, rank or score any model.

## Method

1. **Provider primary pages, fetched directly.** These were:
   - Claude docs: models overview, model deprecations and the Fable 5.1 page.
   - Anthropic newsroom, plus the Opus 5.5, Sonnet 5.5 and Haiku 5.5 posts, "independent evaluators" and the 2026 Usage Policy update.
   - OpenAI API docs: models and changelog, and the GPT-6 Astra system card on deploymentsafety.openai.com.
   - Gemini API docs: models list, changelog, and the Gemini 4 Argon, 3.8 Flash and 3.5 Flash-Lite pages.
   - Google blog post on Gemini 4 Argon, and the Gemma releases log.
   - Mistral newsroom, the Mistral Large 4 post and the Mistral models overview.
   - xAI docs: models page and the Grok 4.7 page.
   - DeepSeek API news post of 2026-09-10.
   - Meta: the Muse Wonder blog and the "Build with Muse Spark Open" page.
   - NVIDIA blog post on Nemotron 3.5.
   - Cohere: models page and the Command A+ changelog.
   - AWS: Nova 2 What's New post and the Nova 2 user guide.
   - LG AI Research news post on K-EXAONE 2.0, and the Falcon H1R blog.
   - Ai2 news listing.
2. **Hugging Face API.** I listed each provider org newest-first (`/api/models?author=<org>&sort=createdAt`). For licence and parameter metadata I used `/api/models/<id>`. I then downloaded the model-card READMEs and read them for release date, context length and parameter counts. The orgs covered were deepseek-ai, Qwen, google, meta-llama, meta-models, facebook, mistralai, microsoft, ibm-granite, allenai, nvidia, moonshotai, zai-org, tiiuae, LGAI-EXAONE, CohereLabs, openai, amazon, xai-org and ai21labs.
3. **Ollama library tag pages** for the 10 local builds, to confirm each tag exists and read the context length it declares.
4. **Web searches**, used to find announcements and dates where a primary page was blocked or rendered client-side. The queries were:
   - "OpenAI new model release October 2026"; "openai.com GPT-6 Astra introducing"; "GPT-6.1 Sol OR GPT-6 Luna release date"
   - "Anthropic Claude new model announcement September 2026"; "Claude Fable 5.1 introducing September 1 2026"
   - "Google Gemini latest model release 2026"; "Gemini 4 Argon Google blog announcement"; "Gemini 4 Argon blog.google launch October 2026"
   - "Gemini 3.8 Flash launch Google blog September 2026"; "Gemma 4 release Google DeepMind open model"; "Gemma 4 blog.google OR deepmind.google announcement"
   - "Meta Llama latest model release 2026"; "Meta Muse Spark Open open weights release"; "Meta Muse Spark open weights released September 2026"; "Meta Muse Wonder introduced October 2026"
   - "Mistral AI new model release September 2026"; "xAI Grok latest model release 2026"; "xAI Grok 4.7 release announced"
   - "DeepSeek V4 release open weights 2026"; "DeepSeek V4.1 release September 2026"; "Qwen new model release September 2026 Alibaba"; "Qwen3.8 release qwen.ai blog August 2026"
   - "Moonshot AI Kimi K3 release"; "Z.ai GLM-5.3 release date"; "LG AI Research K-EXAONE 2.0 release"
   - "NVIDIA Nemotron 3.5 Super release October 2026"; "NVIDIA Nemotron 3.5 Super Bolt announcement blog"
   - "IBM Granite 4.2 announcement"; "Ai2 OLMo latest model release 2026"; "TII Falcon new model release 2026"
   - "Amazon Nova latest model 2026"; "Microsoft Phi new model 2026 OR MAI model release"; "microsoft.ai MAI-Thinking-1 announcement Build 2026"; "Cohere Command A+ release"
   - "gpt-oss OpenAI open-weight model latest 2026"; "OpenAI GPT-6 Astra system card Preparedness Framework"; "OpenAI ChatGPT teen safety OR mental health update September 2026"; "Developing Gemini 4 Argon responsibly"
   - Date checks for older models: Llama 4, Gemma 2 and 3, Llama 3.1, Command R7B, EXAONE 3.5, OLMo 2 and Qwen3.

**What counts as notable:**
- For each named provider, the current flagship and the current small or efficient general-purpose LLM or multimodal assistant.
- Models that the in-window release log refers to, including superseded or deprecated ones.
- The 10 local Ollama builds the benchmark uses.

Image, video, speech, embedding, time-series and cyber-only models are left out. That excludes, for example, GPT-Image-2.5, Nano Banana 2.1, Timestral, EmbeddingGemma 2 and Gemini 3.8 Flash Cyber.

**Context-window convention:** where a source gives an exact figure, that figure is used. Where a source says "NK", the value is recorded as N×1024. Where it says "1M", the value is 1,000,000, except where the source gives 1,048,576 (Gemini).

**`access: "both"`** means open weights or a consumer app *in addition to* an API, and only where that was verified.

## Could not verify (set to null, marked secondary, or excluded)

- **OpenAI, Gemini, xAI, Meta Muse Wonder:** no parameter counts are disclosed. These fields are null.
- **Parameter-count source:** where a model card did not state the parameter count, I used the Hugging Face safetensors total and labelled it "HF safetensors count".
- **openai.com:** returned 403, so I could not read the GPT-6 Astra announcement directly. Dates come from the OpenAI API changelog and the system card, both primary.
- **GPT-6 Astra access:** whether it is in ChatGPT was not confirmed, so access is recorded as `api`.
- **x.ai/news:** returned 403. The Grok 4.7 date (2026-09-21) and Grok 4.6 date (2026-08-12) come from secondary coverage. xAI's docs list the models but give no dates. No current small xAI model could be identified.
- **qwen.ai and z.ai blogs:** both render client-side, so they returned empty.
  - Qwen3.8 dates come from Hugging Face repo dates plus secondary reports, and are recorded at month level.
  - The GLM-5.3 launch date (2026-08-14) is secondary. The Hugging Face weights are dated 2026-08-25.
- **Kimi K3:** the 2026-07-16 announcement date is secondary. Moonshot's GitHub README does not give a date. No current small Kimi model was verified.
- **Microsoft MAI-Thinking-1:** the only catalogue entry backed solely by secondary sources (dated 2026-06-02, Build 2026). Context window and parameter count conflict across reports (128K vs 256K; "35B" vs "~1T total / 35B active"), so both are null.
- **Mistral Medium 3.5:** the release date is null. The docs version label is 26.04, the Hugging Face repo is dated 2026-03-31, and a newsroom summary placed it in May 2026.
- **Mistral Large 4:** the licence is null. The post says weights come "by end of month", and the docs say only "open weight".
- **Muse Wonder:** licence, context window and modalities are not stated in Meta's post.
- **Muse Spark Open:** the Hugging Face card is access-gated, so I could not read it. Specs come from Meta's dev page.
- **Amazon:** no Nova model newer than Nova 2 was verified. Press reports that Amazon is winding down some Nova lines and planning a new flagship are unconfirmed and not included. Nova 2 Pro still appears as preview, based on the Dec 2025 post, and is absent from the current user-guide table.
- **Ai2 and TII:** no new general flagship LLM was found in 2026. Ai2's 2026 releases are specialised (AstaBrief 8B, Bolmo, FlexOlmo, Olmo Hybrid). TII's newest general LLM found is Falcon H1R 7B (2026-01-05).
- **Llama 3.1 exact day:** not verified, so the date is month-level (2024-07).
- **Release-log exclusions** (date or substance not verified from a usable source):
  - Alibaba's Qwen 4 preview at Apsara (reported as 2026-09-22). It is single-site, aggregator-sourced, and has no release.
  - Reports of an Anthropic model to "counter GPT-6 Astra".
  - Gemini 4 timing rumours.
  - OpenAI teen and mental-health safeguard articles. These describe the 2025 announcements, not the 2026 window.
  - Ai2's AstaBrief 8B. The Ai2 listing gives the month only.
  - Microsoft FrogNano-4B. Its card says 22-SEP-2026, but it is a narrow coding-agent model and was judged not notable.

## Conflicts between sources

1. **GPT-6 Astra: "shelved" vs "released".** Reuters (2026-09-28) reports that OpenAI dropped a planned October release of **GPT-6.1 Astra** for safety reasons. Aggregator search summaries collapsed this into "the October model was shelved", but GPT-6 **Astra** itself was released on 2026-09-03 (OpenAI changelog and system card). These are different models, and both facts are recorded.
2. **Gemini 4 Argon.** Google's blog announced it on 2026-09-30 with restricted (Fairwind) access. Third-party router blogs said no API model ID existed at that point. The Gemini changelog shows `gemini-4-argon` GA on 2026-10-13. The catalogue uses the announcement date and the notes record the GA date.
3. **Gemma release dates.** The Gemma releases log says Gemma 4 came out on 2026-03-31; secondary coverage and the Gemini API changelog's Gemma entry say 2026-04-02. Gemma 3 has the same pattern: the log says 2025-03-10, while blog coverage says 2025-03-12. The catalogue uses the release-log (primary) dates.
4. **Command R7B context window.** Cohere's docs say 128K, while the Ollama `command-r7b` tag page lists 8K. The catalogue records 128K (provider), but the local build may be configured at 8K.
5. **Qwen3-8B context window.** The card says 32,768 native (131,072 with YaRN), while the Ollama tag says 40K. The catalogue records 32,768.
6. **Qwen3.8 dates.** Secondary sources give a 2026-07-19 WAIC unveiling, a 2026-08-03 Max announcement and a 2026-08-14 date for the 27B weights. The Hugging Face repos were created 2026-08-05 (27B) and 2026-08-08 (2.4T). The catalogue records month level only.
7. **Kimi K3 weights date.** Sources differ: 2026-07-26 (US time) vs 2026-07-27. The Hugging Face repo was created 2026-06-13, privately, before the announcement.
8. **Grok 4.7 parameter count.** A pre-release press figure of ~2.1T was never confirmed by xAI, so the field is null.
9. **Granite 4.2 sizes.** IBM names the models 3B/8B/30B. The safetensors totals are about 3.7B, 8.8B and 29.3B, and one secondary source lists 4B/9B/29B. The catalogue uses IBM's names and notes the safetensors totals.
10. **Llama "4.1" / Llama 5.** Several low-quality sites claim a Llama 5 launch (April 2026) or a Llama 4.1. No Meta or Hugging Face evidence was found, so neither is included. The newest meta-llama Hugging Face LLM is Llama 4 (April 2025). Meta's 2026 models are Muse-branded.
11. **Muse Spark Open naming.** PyTorch's blog calls it "Muse Spark 1.2", while Meta's dev page says "Muse Spark Open". Some coverage, written before the 2026-10-15 release, still described the weights as upcoming.

## Benchmark local builds

All 10 Ollama tags exist on ollama.com and are linked to catalogue entries through `benchmarkLocalTag`. All are `superseded` except two:
- `phi4-mini` is `current`: Phi-4-mini is still Microsoft's small Phi model.
- `command-r7b` is `current`: it is still live in Cohere's model list.

`gemma2:9b` is the reference build.
