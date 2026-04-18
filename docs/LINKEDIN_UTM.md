# LinkedIn UTM Convention

**Purpose:** Every LinkedIn post that links back to compassionbenchmark.com must carry UTM parameters so Umami can attribute the visit, the newsletter signup, the Gumroad click, and the contact-sales inquiry back to the post.

Without UTMs, LinkedIn engagement is permanent attribution loss. This is the load-bearing measurement discipline for the daily-update flywheel.

---

## The convention

Append to every link shared on LinkedIn:

```
?utm_source=linkedin&utm_medium=social&utm_campaign=daily-briefing&utm_content={entity-or-topic-slug}
```

- **utm_source**: always `linkedin`
- **utm_medium**: always `social`
- **utm_campaign**: the post format — one of:
  - `daily-briefing` (default — an excerpt of the day's overnight assessment)
  - `weekly-briefing` (Monday newsletter excerpt)
  - `entity-spotlight` (deep dive on a single entity)
  - `sector-trend` (healthcare / AI / Fortune 500 DEI etc.)
  - `methodology` (framework or process posts)
- **utm_content**: short kebab-case identifier — the entity slug for entity posts (`openai`, `target`, `iran`, `new-york-city`), or the topic slug for thematic posts (`dei-rollback`, `ai-safety-downgrades`)

---

## Examples

**Entity post — Target DEI rollback:**
```
https://compassionbenchmark.com/fortune-500?utm_source=linkedin&utm_medium=social&utm_campaign=daily-briefing&utm_content=target
```

**Entity post — OpenAI downgrade (once entity pages ship):**
```
https://compassionbenchmark.com/ai-lab/openai?utm_source=linkedin&utm_medium=social&utm_campaign=daily-briefing&utm_content=openai
```

**Weekly newsletter excerpt:**
```
https://compassionbenchmark.com/updates?utm_source=linkedin&utm_medium=social&utm_campaign=weekly-briefing&utm_content=2026-w16
```

**Sector trend post:**
```
https://compassionbenchmark.com/updates?utm_source=linkedin&utm_medium=social&utm_campaign=sector-trend&utm_content=dei-rollback
```

---

## What to measure in Umami

Once tagged posts are live, the following queries become possible:

1. **Visits by post** — filter by `utm_content` to see which entities/topics drove traffic
2. **Funnel from LinkedIn** — visits with `utm_source=linkedin` → `newsletter_subscribed` events → `gumroad_click` events → `contact_sales_submitted` events
3. **Campaign lift** — compare `daily-briefing` vs `weekly-briefing` vs `entity-spotlight` engagement and conversion
4. **Entity demand signal** — `utm_content` values that produce disproportionate traffic or conversion should be prioritized for future research and potential entity pages

Umami preserves UTM parameters in the referrer/session record by default — no additional instrumentation needed.

---

## Operational checklist

Before publishing a LinkedIn post that links to the site:

- [ ] URL contains all four UTM parameters
- [ ] `utm_content` matches the entity slug or topic slug in the post
- [ ] If new campaign type needed, add it to this doc first (campaigns must be stable for comparison over time)

---

## Anti-patterns — do NOT do

- ❌ Sharing a naked `compassionbenchmark.com` URL — attribution lost
- ❌ Using `utm_campaign=test` or other free-form values — breaks campaign comparison
- ❌ Changing an existing `utm_campaign` name retroactively — splits historical data
- ❌ Using UTMs on internal site links — they only belong on inbound links from external sources
