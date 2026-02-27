# gov-smart-city
Telegram bot + Site + Webview app for Android/iOS (Kazakhstan Government smart city system)

# Gov Smart City — Smart Citizen MVP (Telegram Bot + Web + WebView)

MVP “Single citizen app” for reporting city issues (roads, lighting, trash, etc.) via **Telegram bot** and **web form**, storing requests in **Google Sheets**, with optional **AI classification** and **status notifications**.

---

## Features (MVP)
### Citizen (Telegram Bot)
- Create a new request:
  - Problem description
  - Location: **either** share geolocation **or** type address manually
  - Optional photo
  - Confirmation step (preview + Confirm/Cancel)
- “My requests”:
  - List of user’s requests with `request_id` and `status`
- Profile (optional):
  - Basic user info (name/phone) if needed

### Operator (Akimat / Dispatcher)
- Works directly in **Google Sheets**:
  - Update `status` (New / In progress / Need info / Done / Rejected)
  - Add `public_comment` for the citizen
  - Assign request to department (optional)

### Notifications
- **Google Apps Script onEdit trigger** sends Telegram message when `status` changes.

### AI Classification (Optional for MVP)
- Auto-detect:
  - `category` (Roads / Lighting / Trash / …)
  - `priority` (Low/Medium/High)
  - `confidence` score
- Fallback: if low confidence → `category = Unsorted` for manual review.

---

## Architecture (Simple)
1. Citizen submits request in Telegram (or on Web).
2. Backend writes a row into Google Sheets (`Requests` sheet).
3. (Optional) AI classifies the request and fills `category/priority/confidence`.
4. Operator updates `status` and `public_comment` in Google Sheets.
5. Apps Script trigger detects the edit and notifies the citizen in Telegram.

---

## Google Sheets Structure
Create a Google Sheet with a tab named **`Requests`** and these columns:

| Column | Description |
|---|---|
| request_id | Unique short ID |
| created_at | Timestamp |
| chat_id | Telegram chat id (used for notifications + “My requests”) |
| user_name | Optional |
| phone | Optional |
| description | Issue description |
| category | Roads / Lighting / Trash / Unsorted |
| priority | Low / Medium / High |
| confidence | 0–1 |
| lat | Latitude (optional) |
| lng | Longitude (optional) |
| address_text | Manual address (optional) |
| photo_file_id | Telegram `file_id` (optional) |
| status | New / In progress / Need info / Done / Rejected |
| assigned_to | Optional |
| public_comment | Message visible to the citizen |
| status_updated_at | Timestamp |

**Tip:** Use dropdown lists for `status/category/priority` and conditional formatting for urgency.

---

## Repo Structure (Suggested)
/
bot/ # Telegram bot
web/ # Simple web form (optional)
scripts/ # Google Apps Script / utilities
docs/ # Short docs, screenshots
.env.example
README.md

---
```bash
TELEGRAM_BOT_TOKEN=
GOOGLE_SHEET_ID=
GOOGLE_SERVICE_ACCOUNT_JSON=   # (if using service account) OR use Apps Script WebApp endpoint
OPENAI_API_KEY=                # optional (for AI classification)
