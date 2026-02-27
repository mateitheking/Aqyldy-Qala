# Architecture — Gov Smart City (Smart Citizen MVP)

This document describes the MVP architecture for a **Smart Citizen reporting system** built as a **Telegram Bot + Web form**, backed by **Google Sheets**, with **Apps Script notifications** and optional **AI classification**.

---

## 1) Components

### 1.1 Citizen Interfaces
- **Telegram Bot**
  - Main channel for submitting and tracking requests.
  - Captures description, location (geo or manual address), optional photo.
- **Web Form (optional)**
  - Same fields as Telegram.
  - Sends requests to the same backend endpoint.

### 1.2 Storage / Operator Console
- **Google Sheets**
  - Single source of truth for all requests.
  - Operators (Akimat/dispatch) edit status, assignment, and comments directly.
  - Multiple operators can work simultaneously.

### 1.3 Automation / Backend Glue
- **Google Apps Script**
  - Provides an HTTP endpoint (Web App) for creating new rows in Sheets.
  - Sends Telegram notifications to citizens when request status changes (trigger).

### 1.4 Optional Intelligence Layer
- **AI Classification**
  - Categorizes requests and sets priority from free-text description.
  - Adds `confidence` score and `tags`.
  - Low-confidence requests are flagged as `Unsorted`.

---

## 2) Data Model (Google Sheets)

The main worksheet tab is `Requests`.

**Required fields for MVP:**
- `request_id`
- `created_at`
- `chat_id`
- `description`
- `status`

**Recommended fields:**
- `category`, `priority`, `confidence`
- `lat`, `lng`, `address_text`
- `photo_file_id`
- `assigned_to`
- `public_comment`
- `status_updated_at`

> The bot uses `chat_id` to show "My requests" and to send notifications.

---

## 3) Core Flows

### 3.1 Flow A — Citizen creates a request (Telegram)
1. User taps **Send new request**
2. Bot asks for **description**
3. Bot asks for **location** (two options):
   - Share **geolocation**
   - Enter **address manually**
4. Bot asks for **photo** (optional) or Skip
5. Bot shows **confirmation card**
6. User confirms
7. Bot sends request payload to **Apps Script Web App**
8. Apps Script writes a new row to **Google Sheets**
9. Bot replies: **“Request accepted”** + `request_id`

**Payload (example):**
```json
{
  "chat_id": 123456789,
  "description": "Big pothole near school",
  "lat": 54.87,
  "lng": 69.15,
  "address_text": "Petropavl, Abay st 10",
  "photo_file_id": "AgACAgIAAxkBAA...",
  "user_name": "Ami"
}
