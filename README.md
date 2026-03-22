# RentMyShit

> **Your stuff. Your friends. No middleman.**

A zero-friction peer rental platform for trusted circles. No accounts, no payment processing, no marketplace. Just a shareable link and email-based coordination.

---

## The Problem

You have a projector, a camping tent, a pressure washer. Your friends need these things occasionally. You'd happily lend them — but coordinating is messy. Who's got it right now? When's it free? Who asked first?

WhatsApp threads spiral. Nobody wants another app. And you definitely don't want to trust strangers on a marketplace.

## The Solution

RentMyShit is stupidly simple:

1. **Owner creates a page** — adds their stuff with daily rates, provides their email for notifications
2. **Owner shares a private link** — only people with the link can see the list
3. **Friend browses and requests** — picks dates, writes a message, enters their email
4. **Email loop closes the deal** — both sides get emails; booking managed via unguessable links
5. **Logistics happen offline** — pickup, Swish payment, return — all direct with the owner

No logins. No accounts. No payment on platform.

---

## How the Email Flow Works

```
Friend clicks "Request to borrow"
         ↓
Fills in dates + message + their email
         ↓
[System] → Email to friend: "Request received. Manage link: rentmyshit.app/r/{token}"
[System] → Email to owner: "Alex wants to borrow your Camping tent (25–28 Mar)"
         ↓
Owner clicks Accept / Decline in their dashboard (or via email link)
         ↓
[System] → Email to friend: "Sarah accepted! Contact her at +46 76..."
         — or —
[System] → Email to friend: "Sarah couldn't do it this time."
```

Friends can **view, edit, or cancel** their request anytime via the link in their confirmation email. No login ever needed.

---

## Pages

| Page | File | Description |
|---|---|---|
| Owner dashboard | `index.html` | Manage items, see pending requests, share link |
| Friend view | `friend-view.html` | Browse items, request to borrow |
| Item detail + booking | `item-detail.html` | Full item info + booking form with email |

---

## Tech Stack (Proposed)

| Layer | Choice | Why |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JS | No build step, zero deps, fast |
| Styles | Custom CSS (newspaper aesthetic) | Space Grotesk + Bebas Neue |
| Backend | Node.js / Hono | Lightweight, edge-deployable |
| Database | SQLite (or Turso for edge) | Simple, no infra |
| Email | Resend or Postmark | Transactional, reliable |
| Hosting | Cloudflare Pages + Workers | Free tier covers v1 |
| Auth | Email tokens (UUIDs) | No session management needed |

---

## Design System

Shared palette (`styles.css`):

| Var | Value | Use |
|---|---|---|
| `--ink` | `#1a1a18` | Primary text |
| `--paper` | `#f5f0e8` | Background (warm off-white) |
| `--paper2` | `#ede8dc` | Card backgrounds |
| `--punch` | `#e8401c` | CTA, accent |
| `--rule` | `#c8c2b4` | Borders, dividers |
| `--muted` | `#7a7568` | Secondary text |

Fonts: **Bebas Neue** (headings) + **Space Grotesk** (body)

Aesthetic: newspaper ledger — structured, readable, slightly editorial. Deliberately not "startup SaaS."

---

## Event Model

See [`event-model.md`](./event-model.md) for the full command/event/read-model breakdown and Given/When/Then scenarios.

---

## Status

This is a **design mockup** — HTML/CSS prototype of the full user flow. No backend yet.

**Pages complete:**
- [x] Owner dashboard (`index.html`)
- [x] Friend view (`friend-view.html`)
- [x] Item detail + booking form (`item-detail.html`)

**Next steps:**
- [ ] Owner setup page (enter email, create first item)
- [ ] `confirm.html` — borrower manage page (from email link)
- [ ] Backend: SQLite + Resend email
- [ ] Deploy to Cloudflare Pages

---

## Philosophy

**Private by default.** Your list is only visible to people you sent the link to.

**Offline money.** We don't touch payments. Swish between friends is fine.

**No lock-in.** Export your list as CSV anytime. No platform dependency.

**Small is beautiful.** This tool should work for one person with 5 items and 10 friends. It doesn't need to scale to a marketplace.
