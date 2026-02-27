# codex.md — Project Context & Implementation Guide (Smart Citizen MVP)

This file is written for Codex (AI pair programmer) to continue building the **backend glue** for the hackathon MVP.

**Goal:** deliver an end-to-end working MVP in hackathon conditions:
- Telegram Bot + (optional) Web Form
- Google Sheets as the operator console (Akimat)
- Google Apps Script as the backend + notification engine
- Optional AI classification (category/priority/confidence)

**Hard constraint:** keep it simple, reliable, demo-friendly. Prefer Apps Script over running extra servers.

---

## 0) High-level product concept (what we’re building)

**Problem:** Citizens don’t know where to report city issues (roads, street lights, trash, hazards).  
**MVP:** A citizen reports an issue via Telegram (and optionally website). The report is stored in Google Sheets. Operators update status in Sheets. Citizen receives Telegram notifications instantly when status changes.

### Citizen UX (Telegram bot)
Menu:
- **Send new request**
- **My requests** (list only this user’s own requests)
- **Profile** (optional)

Send new request flow:
1) Ask for **description**
2) Ask for **location** with choice:
   - Share **geolocation** OR
   - Enter **address manually**
3) Ask for optional **photo** (or skip)
4) Show **confirmation card** (preview)
5) Confirm → create request in Google Sheets → return `request_id`

### Operator UX (Google Sheets)
Operators work directly in Google Sheets:
- Change `status` via dropdown
- Fill `public_comment` (citizen-visible)
- Optionally fill `assigned_to`, override category/priority
When `status` changes, citizen gets Telegram notification.

---

## 1) Architecture (minimal and hackathon-proof)

**Recommended approach:** *No dedicated backend server*. Use **Google Apps Script Web App** + **Google Sheets**.

### Components
- Telegram Bot (runs locally or on VPS)
- Google Sheets (single source of truth)
- Google Apps Script:
  - Web App endpoint: bot/web → Apps Script → append to sheet
  - Installable trigger `onEdit`: status change → Telegram notify

### Data flow
1) Bot collects request data.
2) Bot calls Apps Script Web App endpoint `/exec` with JSON payload.
3) Apps Script validates secret, rate-limits, generates `request_id`, appends row to `Requests` sheet.
4) Operator edits `status` in that row.
5) Apps Script `onEdit` trigger sees status change, sets `status_updated_at`, sends Telegram message using `chat_id`.
6) Bot "My requests" fetches user rows by `chat_id` via Apps Script endpoint.

---

## 2) Repository state (already present)
Repo already contains:
- `.gitignore`
- `LICENSE` (MIT)
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/ENVIRONMENT.md`
- `docs/SHEET_SCHEMA.md`
- `CONTRIBUTING.md`
- `.editorconfig`
- `docs/DEMO_SCRIPT.md`
- `.env.example`

**Missing / to be implemented now:**
- `scripts/apps-script-webapp.gs` (create request + query requests)
- `scripts/apps-script-notify.gs` (onEdit trigger: status change notification)
- (optional) minimal web form later

---

## 3) Environment variables (contract)
These env vars exist in `.env.example` and must be respected by bot (and used to configure Apps Script):

### Required for demo
- `TELEGRAM_BOT_TOKEN`
- `GOOGLE_SHEET_ID`
- `REQUESTS_SHEET_NAME` (default: `Requests`)
- `APPS_SCRIPT_WEBAPP_URL` (Apps Script deployment `/exec`)
- `APPS_SCRIPT_SHARED_SECRET` (shared secret for endpoint)

### Optional
- `OPENAI_API_KEY`
- `AI_ENABLED` (true/false)
- `AI_CONFIDENCE_THRESHOLD` (default 0.6)

**Hard rule:** never commit secrets.

---

## 4) Google Sheets schema (hard contract)
See `docs/SHEET_SCHEMA.md`. Column names and enum values must match.

### Mandatory enums
**status**:
- `New`
- `In progress`
- `Need info`
- `Done`
- `Rejected`

**category** (MVP):
- `Roads`
- `Lighting`
- `Trash`
- `Utilities` (optional)
- `Safety`
- `Unsorted` (must exist)

**priority**:
- `Low`
- `Medium`
- `High`

### Minimum validation for new requests
A request is valid only if:
- `description` is non-empty AND
- location is provided:
  - (`lat` AND `lng`) OR `address_text`

### Photo storage (MVP)
Store `photo_file_id` (Telegram `file_id`) in the sheet. No Drive upload required for MVP.

---

## 5) Backend responsibilities (Codex should implement)

### 5.1 Apps Script Web App: create and query requests
Implement a single Web App endpoint (Apps Script) with:
- `doPost(e)` for creating requests
- `doGet(e)` for reading requests

#### Authentication
Use a shared secret:
- Bot includes `secret` in payload or query
- Apps Script rejects if secret mismatches `APPS_SCRIPT_SHARED_SECRET`

Where to store the secret in Apps Script:
- `PropertiesService.getScriptProperties()`  
  Keys:
  - `SHARED_SECRET`
  - `REQUESTS_SHEET_NAME` (optional)
  - `TELEGRAM_BOT_TOKEN` (for notifications script)

**Do not hardcode tokens.** Use Script Properties.

#### POST /create request
**Input JSON payload (example):**
```json
{
  "secret": "xxxx",
  "chat_id": 123456789,
  "telegram_user_id": 987654321,
  "user_name": "Ami",
  "phone": "+77001234567",
  "description": "яма, выбоина, асфальт",
  "lat": 54.87,
  "lng": 69.15,
  "address_text": "Петропавл, ул. Абая 10",
  "photo_file_id": "AgACAgIAAxkBAA..."
}
```
**Fields (contract):**

| Field | Type | Required | Example | Notes |
|---|---|---:|---|---|
| secret | string | ✅ | `xxxx` | Must match Script Property `SHARED_SECRET` |
| chat_id | number/string | ✅ | `123456789` | Used for notifications + "My requests" |
| telegram_user_id | number/string | ⛔ | `987654321` | Optional |
| user_name | string | ⛔ | `Ami` | Optional profile |
| phone | string | ⛔ | `+77001234567` | Optional profile |
| description | string | ✅ | `яма, выбоина, асфальт` | Non-empty, trimmed |
| lat | number | ⚠️ | `54.87` | Required if `address_text` is empty |
| lng | number | ⚠️ | `69.15` | Required if `address_text` is empty |
| address_text | string | ⚠️ | `Петропавл, ул. Абая 10` | Required if `lat/lng` missing |
| photo_file_id | string | ⛔ | `AgACAg...` | Telegram file_id for MVP |
| category | string (enum) | ⛔ | `Roads` | Optional (if AI already ran in bot) |
| priority | string (enum) | ⛔ | `High` | Optional (if AI already ran in bot) |
| confidence | number (0–1) | ⛔ | `0.74` | Optional (AI output) |
| tags | string | ⛔ | `pothole;asphalt` | Optional (AI output) |

⚠️ **Location rule:** request is valid if `description` exists AND (`lat`+`lng` OR `address_text`).

---

**Validation rules (must implement):**
- Reject if `secret` is missing/invalid → `UNAUTHORIZED`
- Reject if `chat_id` missing → `MISSING_CHAT_ID`
- Reject if `description` missing/empty → `MISSING_DESCRIPTION`
- Reject if location missing (no geo and no address) → `MISSING_LOCATION`
- Apply rate limit (MVP): max **3 requests / 10 minutes / chat_id** → `RATE_LIMITED`

---

**Defaults (if bot did not send AI fields):**
- `category = "Unsorted"`
- `priority = "Medium"`
- `confidence = ""` (blank)
- `tags = ""` (blank)
- `status = "New"`
- `public_comment = ""`
- `assigned_to = ""`
- `status_updated_at = ""`
- `last_notified_status = ""`
- `created_at = now (ISO, GMT+5)`

---

**Google Sheets mapping (Requests tab):**
Apps Script must append a row using header-name mapping (do NOT rely on fixed column indexes).
Write these values:

- `request_id`: generated by script (format: `SC-` + short unique)
- `created_at`: ISO timestamp now
- `chat_id`: from payload
- `telegram_user_id`: from payload (optional)
- `user_name`: from payload (optional)
- `phone`: from payload (optional)
- `description`: from payload
- `category`: payload.category OR default `Unsorted`
- `priority`: payload.priority OR default `Medium`
- `confidence`: payload.confidence OR blank
- `tags`: payload.tags OR blank
- `lat`: payload.lat OR blank
- `lng`: payload.lng OR blank
- `address_text`: payload.address_text OR blank
- `photo_file_id`: payload.photo_file_id OR blank
- `status`: `"New"`
- `assigned_to`: blank
- `public_comment`: blank
- `status_updated_at`: blank
- `last_notified_status`: blank

---

**Response (success):**
```json
{ "ok": true, "request_id": "SC-1042" }
```

Response (error):

{ "ok": false, "error": "MISSING_LOCATION" }

Error codes (fixed list):

UNAUTHORIZED

MISSING_CHAT_ID

MISSING_DESCRIPTION

MISSING_LOCATION

RATE_LIMITED

SHEET_NOT_FOUND

INTERNAL_ERROR
