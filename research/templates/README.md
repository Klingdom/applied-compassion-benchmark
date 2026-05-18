# Email Template Import Guide

This directory contains Markdown source files for the Listmonk transactional email templates
used by the Score-Watch Alert fulfillment pipeline.

---

## Templates

| File | Template name in Listmonk | Used by |
|---|---|---|
| `score-watch-welcome.md` | `score-watch-welcome` | Worker: sent on purchase |
| `score-watch-alert.md` | `score-watch-alert` | `send-alerts.mjs`: sent on score change |

---

## How to import into Listmonk

Listmonk does not have a bulk import feature. Each template must be created manually via the admin UI.

### Step 1: Create the welcome template

1. Open your Listmonk admin at `https://lists.compassionbenchmark.com`
2. Navigate to **Campaigns → Templates**
3. Click **New template**
4. Set:
   - **Name:** `score-watch-welcome`
   - **Type:** Transactional
5. Copy the HTML body from `score-watch-welcome.md` (the block between the first pair of ` ```html ` fences) into the **HTML body** field
6. Copy the plain text body (the block between the second ` ``` ` fences) into the **Plain text** field
7. Set the **Subject** to: `Score-Watch active: {{ .Data.entity_name }}`
8. Click **Save**
9. Note the template ID (visible in the URL: `/templates/3` → ID is `3`)
10. Set this ID as the `LISTMONK_WELCOME_TEMPLATE_ID` Worker secret:
    ```bash
    cd worker && npx wrangler secret put LISTMONK_WELCOME_TEMPLATE_ID
    ```

### Step 2: Create the alert template

1. Navigate to **Campaigns → Templates → New template**
2. Set:
   - **Name:** `score-watch-alert`
   - **Type:** Transactional
3. Copy the HTML body from `score-watch-alert.md`
4. Copy the plain text body
5. Set the **Subject** to: `Score change: {{ .Data.entity_name }} | {{ .Data.old_score }} → {{ .Data.new_score }} ({{ .Data.delta_formatted }})`
6. Click **Save**
7. Note the template ID
8. Set this ID as the `LISTMONK_ALERT_TEMPLATE_ID` environment variable used by `send-alerts.mjs`:
    ```bash
    export LISTMONK_ALERT_TEMPLATE_ID=<id>
    # Or add to your nightly pipeline .env file
    ```

---

## Required placeholders

Listmonk uses Go's `text/template` syntax (`{{ .Data.field_name }}`). All placeholders
listed in the template files must be populated by the `data` object passed to `/api/tx`.

If a placeholder is missing from the `data` object, Listmonk renders it as empty.
It does NOT error — so test carefully.

### Test a transactional email send

From the Listmonk admin UI:
1. Campaigns → Templates → click the template → **Preview**
2. Provide a sample `data` JSON object (copy the "Required template data fields" table from the .md file)

Or via curl:

```bash
curl -u admin:PASSWORD -X POST https://lists.compassionbenchmark.com/api/tx \
  -H "Content-Type: application/json" \
  -d '{
    "subscriber_email": "your-test-email@example.com",
    "template_id": 3,
    "data": {
      "entity_name": "Apple Inc.",
      "entity_slug": "apple-inc",
      "index_slug": "fortune-500",
      "started_at": "2026-05-17",
      "expires_at": "2027-05-17",
      "gumroad_sale_id": "test-sale-001",
      "gumroad_manage_url": "https://app.gumroad.com/library",
      "unsubscribe_url": "https://api.compassionbenchmark.com/unsubscribe?email=test%40example.com&entity=apple-inc&token=TESTTOKEN"
    }
  }'
```

---

## Admin alert template (optional but recommended)

The Worker sends operational error notifications to `ADMIN_NOTIFY_EMAIL` via Listmonk.
Create a third template for this:

1. **Name:** `admin-alert`
2. **Type:** Transactional
3. **HTML body:**
   ```html
   <p><strong>Compassion Benchmark Worker Alert</strong></p>
   <p>{{ .Data.message }}</p>
   <p style="color: #64748b; font-size: 12px;">{{ .Data.timestamp }}</p>
   ```
4. **Subject:** `[CB Worker] Alert`
5. Note the template ID and update the `notifyAdmin()` function in `worker/src/index.ts`:
   ```typescript
   template_id: YOUR_ADMIN_TEMPLATE_ID,
   ```

---

## Deliverability checklist (before first live send)

- [ ] `alerts@compassionbenchmark.com` exists as a Listmonk sender identity
- [ ] SPF record includes the Listmonk server IP
- [ ] DKIM is configured for `compassionbenchmark.com` in Listmonk
- [ ] DMARC record is set to `p=none` initially; upgrade to `p=quarantine` after warm-up
- [ ] Send a test to a Gmail and a Protonmail address; check spam placement
- [ ] Verify the From name shows as "Compassion Benchmark Alerts" not the raw email
