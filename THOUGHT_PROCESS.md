# 💭 Thought Process Sheet — ExpiryAlert '26

## Problem Understanding

The core problem isn't document storage — it's **decision latency**. When a compliance certificate expires, the damage isn't in the expiry itself; it's in the days or weeks nobody noticed. Organizations with hundreds of documents need a system that surfaces the right information at the right time, without requiring anyone to actively search for it.

## My Solution Approach

### What I chose NOT to build
- A document storage platform (the brief explicitly said don't build this)
- A complex workflow engine
- Email-only notification system

### What I built instead
A **status dashboard** — one screen that tells you instantly:
1. What's expired (red, urgent)
2. What's expiring within 30 days (yellow, plan ahead)
3. What's fine (green, no action needed)
4. What needs a human decision today (critical priority)

## Architecture Decisions

### MERN Stack
- **MongoDB**: Flexible document schema lets us add fields per record type without migrations
- **Express + Node**: Fast to build, easy to add scheduled jobs via node-cron
- **React**: Component-based UI makes the dashboard composable
- **JWT auth**: Stateless, works with mobile + web

### Key Design: Auto-Status Computation
Records have status computed on-the-fly from their expiry date. This means:
- No stale data (a record that was "active" yesterday is "expiring_soon" today automatically)
- No background jobs needed for status updates
- The virtual `daysUntilExpiry` field in Mongoose drives everything

### Cron Job for Notifications
A daily cron at 8am checks for records expiring in 7, 14, or 30 days and creates in-app notifications. This is configurable per user.

## UI/UX Decisions

### Dark Mode
Chosen because:
1. Managers reviewing dashboards often work in low-light environments
2. Status colors (red/yellow/green) pop more on dark backgrounds
3. More distinctive than the standard white SaaS dashboard

### Information Hierarchy
The dashboard answers questions in order of urgency:
1. Banner alerts (expired / expiring in 7 days) — unmissable
2. Stat cards — numbers at a glance
3. "Needs Immediate Action" panel — actionable list
4. Charts — trend understanding
5. Recent activity — awareness

### Color Coding
- 🔴 Red = Expired or expiring in ≤7 days
- 🟡 Yellow = Expiring in 8-30 days
- 🟢 Green = Expiring in 30+ days

This is consistent across every view: stat cards, table rows, badges, pills.

## Trade-offs Made

| Decision | Alternative | Why I chose this |
|----------|-------------|-----------------|
| In-app notifications | Email notifications | Email requires SMTP config; in-app works immediately |
| Page-level filters | Advanced query builder | Simpler UX, covers 95% of use cases |
| MongoDB Atlas ready | PostgreSQL | Faster to set up, no schema migrations |
| Virtual status | Stored status | Always accurate, no sync issues |

## What I'd Add With More Time

1. **Email notifications** via Nodemailer with HTML templates
2. **CSV/Excel import** for bulk migration from spreadsheets
3. **Role-based access** (viewer vs editor vs admin per team)
4. **Mobile app** via React Native reusing the same API
5. **Audit trail** for compliance (who viewed/changed what when)
6. **Analytics** — renewal cost forecasting, category trends over time
7. **Integrations** — Slack alerts, Google Calendar sync

## Why This Submission is Strong

The problem statement says: "A manager should not have to search through spreadsheets to understand what needs attention."

Every design decision in this submission serves that one sentence. The dashboard, the alert banners, the color system, the sidebar quick filters — everything is optimized for the moment a manager opens the app and needs to know: **what do I need to do today?**
