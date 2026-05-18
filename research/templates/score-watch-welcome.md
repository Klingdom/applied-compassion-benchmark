# Score-Watch Welcome Email Template

**Template name in Listmonk:** `score-watch-welcome`  
**Subject:** `Score-Watch active: {{ .Data.entity_name }}`  
**From:** `alerts@compassionbenchmark.com`  
**Type:** Transactional (not a campaign — sent individually per purchase)

---

## HTML Body

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Score-Watch active: {{ .Data.entity_name }}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0b1220; color: #e2e8f0; margin: 0; padding: 0; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
    .header { border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 28px; }
    .logo { font-size: 13px; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase; }
    h1 { font-size: 22px; font-weight: 700; color: #7dd3fc; margin: 8px 0 0; }
    .meta-grid { background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 20px; margin: 24px 0; }
    .meta-row { display: flex; gap: 16px; margin-bottom: 10px; font-size: 14px; }
    .meta-row:last-child { margin-bottom: 0; }
    .meta-label { color: #64748b; min-width: 110px; font-variant: small-caps; font-size: 12px; padding-top: 1px; }
    .meta-value { color: #e2e8f0; font-weight: 500; }
    .section { margin: 24px 0; }
    .section h2 { font-size: 11px; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 10px; }
    ul { margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 14px; line-height: 1.8; }
    .note { background: rgba(125,211,252,0.06); border-left: 3px solid rgba(125,211,252,0.3); padding: 14px 16px; border-radius: 0 8px 8px 0; font-size: 13px; color: #94a3b8; margin: 24px 0; }
    .footer { border-top: 1px solid #1e293b; padding-top: 20px; margin-top: 40px; font-size: 12px; color: #475569; }
    .footer a { color: #7dd3fc; text-decoration: none; }
    a { color: #7dd3fc; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">Compassion Benchmark</div>
      <h1>Score-Watch active: {{ .Data.entity_name }}</h1>
    </div>

    <p style="color: #94a3b8; font-size: 15px; margin: 0 0 24px;">
      Your Score-Watch Alert is active. You will receive an email whenever
      {{ .Data.entity_name }}&rsquo;s compassion score changes.
    </p>

    <div class="meta-grid">
      <div class="meta-row">
        <span class="meta-label">Entity</span>
        <span class="meta-value">{{ .Data.entity_name }}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Watch period</span>
        <span class="meta-value">{{ .Data.started_at }} &ndash; {{ .Data.expires_at }}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Alert type</span>
        <span class="meta-value">Email on every score change, overnight Mon&ndash;Sat</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Order</span>
        <span class="meta-value">{{ .Data.gumroad_sale_id }}</span>
      </div>
    </div>

    <div class="section">
      <h2>What you&rsquo;ll receive</h2>
      <ul>
        <li>Composite score delta (e.g. 61.2 &rarr; 58.8, &minus;2.4 pts)</li>
        <li>Band change flag (e.g. Functional &rarr; Developing) when applicable</li>
        <li>Headline evidence (1&ndash;3 bullet points from the research pipeline)</li>
        <li>Link to the full entity assessment on compassionbenchmark.com</li>
      </ul>
    </div>

    <div class="note">
      <strong>Independence note:</strong> Your subscription purchase does not affect
      {{ .Data.entity_name }}&rsquo;s score. Scoring is determined by the independent
      overnight research pipeline only. Scores are published and alerting is triggered
      without any awareness of who has a watch active for which entity.
    </div>

    <div class="section">
      <h2>Managing your subscription</h2>
      <ul>
        <li>To add another entity, return to its detail page on <a href="https://compassionbenchmark.com">compassionbenchmark.com</a> and subscribe again.</li>
        <li>To change the watched entity: cancel this subscription and subscribe to the new entity. Watched entity changes require a new subscription.</li>
        <li>To cancel: use the Gumroad cancellation link below or email <a href="mailto:alerts@compassionbenchmark.com">alerts@compassionbenchmark.com</a>.</li>
      </ul>
    </div>

    <div class="section">
      <h2>Refund policy</h2>
      <p style="font-size: 14px; color: #94a3b8; margin: 0;">
        Full refund if requested within 14 days of purchase and no alert has been delivered.
        Pro-rated refund (unused months &times; $6.58/mo) if requested after first alert, up to 90 days.
        No refund after 90 days. Request at
        <a href="mailto:alerts@compassionbenchmark.com">alerts@compassionbenchmark.com</a>.
      </p>
    </div>

    <div class="footer">
      <p>
        <a href="{{ .Data.gumroad_manage_url }}">Manage subscription (Gumroad)</a> &middot;
        <a href="{{ .Data.unsubscribe_url }}">Unsubscribe from {{ .Data.entity_name }} alerts</a>
      </p>
      <p>
        Compassion Benchmark &middot; <a href="https://compassionbenchmark.com">compassionbenchmark.com</a><br>
        <a href="https://compassionbenchmark.com/methodology">Methodology</a> &middot;
        <a href="https://compassionbenchmark.com/about">About</a>
      </p>
      <p style="margin-top: 12px;">
        You are receiving this because you purchased a Score-Watch Alert for {{ .Data.entity_name }}.
        This is a transactional email; standard newsletter unsubscribe does not suppress alert emails.
        To stop alerts for this entity, use the entity-specific unsubscribe link above.
      </p>
    </div>
  </div>
</body>
</html>
```

---

## Plain Text Body

```
Compassion Benchmark — Score-Watch Alert Active

Your Score-Watch Alert is active.

Entity:       {{ .Data.entity_name }}
Watch period: {{ .Data.started_at }} – {{ .Data.expires_at }}
Alert type:   Email on every score change, overnight Mon–Sat
Order:        {{ .Data.gumroad_sale_id }}

WHAT YOU'LL RECEIVE
- Composite score delta (e.g. 61.2 → 58.8, –2.4 pts)
- Band change flag (e.g. Functional → Developing) when applicable
- Headline evidence (1–3 bullet points from the research pipeline)
- Link to the full entity assessment on compassionbenchmark.com

INDEPENDENCE NOTE
Your subscription purchase does not affect {{ .Data.entity_name }}'s score.
Scoring is determined by the independent overnight research pipeline only.

MANAGING YOUR SUBSCRIPTION
To add another entity: return to its detail page and subscribe again.
To cancel: use the Gumroad cancellation link below or email alerts@compassionbenchmark.com.
To change the watched entity: cancel this subscription and subscribe to the new entity.

REFUND POLICY
Full refund if requested within 14 days of purchase and no alert has been delivered.
Pro-rated refund (unused months × $6.58/mo) up to 90 days after first alert.
No refund after 90 days. Request at alerts@compassionbenchmark.com.

---
Manage subscription: {{ .Data.gumroad_manage_url }}
Unsubscribe from {{ .Data.entity_name }} alerts: {{ .Data.unsubscribe_url }}

Compassion Benchmark · compassionbenchmark.com
```

---

## Required template data fields

These fields must be passed in the `data` object when calling Listmonk's `/api/tx` endpoint:

| Field | Type | Example |
|---|---|---|
| `entity_name` | string | `"Apple Inc."` |
| `entity_slug` | string | `"apple-inc"` |
| `index_slug` | string | `"fortune-500"` |
| `started_at` | string (date) | `"2026-05-17"` |
| `expires_at` | string (date) | `"2027-05-17"` |
| `gumroad_sale_id` | string | `"abc123xyz"` |
| `gumroad_manage_url` | string | `"https://app.gumroad.com/library"` |
| `unsubscribe_url` | string | `"https://api.compassionbenchmark.com/unsubscribe?..."` |
