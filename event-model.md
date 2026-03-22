# RentMyShit — Event Model

Zero-accounts, email-driven peer rental. No payment on platform.

---

## Core Concept

Owner creates a page → Adds items → Shares link with trusted friends → Friends browse and request → Email loop handles confirmation → Logistics (pickup, Swish) happen offline.

**No accounts. No logins. Just email links.**

---

## Commands

| Command | Actor | Payload |
|---|---|---|
| `CreateOwnerPage` | Owner | `{ owner_name, owner_email, swish_number?, location }` |
| `AddItem` | Owner | `{ name, description, daily_rate, photo?, condition_notes }` |
| `EditItem` | Owner | `{ item_id, ...changes }` |
| `RemoveItem` | Owner | `{ item_id }` |
| `ShareList` | Owner | — (generates shareable slug) |
| `RequestBorrowing` | Friend | `{ item_id, start_date, end_date, message, borrower_email }` |
| `EditRequest` | Friend | `{ request_token, start_date, end_date }` |
| `CancelRequest` | Friend | `{ request_token }` (from email link) |
| `AcceptRequest` | Owner | `{ request_id }` |
| `DeclineRequest` | Owner | `{ request_id, reason? }` |
| `MarkReturned` | Owner | `{ request_id }` |

---

## Events

| Event | Triggered by | Notes |
|---|---|---|
| `OwnerPageCreated` | `CreateOwnerPage` | Generates `page_slug` (e.g. `sarah-k-x7f2`) |
| `ItemAdded` | `AddItem` | |
| `ItemEdited` | `EditItem` | |
| `ItemRemoved` | `RemoveItem` | Soft delete |
| `ListShared` | `ShareList` | Records `shared_at` timestamp |
| `BorrowingRequested` | `RequestBorrowing` | Generates `request_token` (UUID for email link) |
| `RequestEdited` | `EditRequest` | Friend changed dates |
| `RequestCancelled` | `CancelRequest` | Via token from email |
| `RequestAccepted` | `AcceptRequest` | |
| `RequestDeclined` | `DeclineRequest` | |
| `ItemReturned` | `MarkReturned` | Clears booked period, item available again |

---

## Read Models

| Read Model | Feeds | Built from |
|---|---|---|
| `OwnerDashboard` | `index.html` | All item & request events for owner |
| `FriendItemList` | `friend-view.html` | Items + current availability windows |
| `ItemDetail` | `item-detail.html` | Single item + next available dates |
| `BorrowerRequestView` | Email link → manage page | Request state (pending/accepted/declined/cancelled) |
| `PendingRequestsList` | Owner dashboard sidebar | `BorrowingRequested` events not yet actioned |
| `ItemAvailabilityCalendar` | Item detail | Accepted requests → blocked date ranges |

---

## Slices — Chronological Flow

### Slice 1 — Owner creates their page

```
Given: No page exists yet
When: Owner submits CreateOwnerPage { name: "Sarah", email: "sarah@...", swish: "+46 76..." }
Then:
  - OwnerPageCreated event recorded
  - Unique slug generated (e.g. sarah-k-x7f2)
  - Setup confirmation email → owner: "Your page is live: rentmystuff.itsybit.se/sarah-k-x7f2"
  - Owner PIN included in email for managing the page
```

### Slice 2 — Owner adds an item

```
Given: Owner page exists (slug: sarah-k-x7f2)
When: Owner submits AddItem { name: "Camping tent", daily_rate: 150, description: "4-person..." }
Then:
  - ItemAdded event recorded
  - Item visible on owner dashboard
  - Item visible on friend view when shared
```

### Slice 3 — Owner shares the list

```
Given: Owner has items on their page
When: Owner clicks "Share my list" button
Then:
  - ListShared event recorded with timestamp
  - Shareable URL copied to clipboard: rentmystuff.itsybit.se/sarah-k-x7f2
  - Friends can now browse items at that URL
```

### Slice 4 — Friend requests to borrow

```
Given: Item "Camping tent" is available for 25–28 March
When: Friend submits RequestBorrowing { start: 25 Mar, end: 28 Mar, email: "alex@..." }
Then:
  - BorrowingRequested event recorded
  - Item status = "pending" (visible on dashboard)
  - Email → alex@...: "Your request is in! Manage link: rentmystuff.itsybit.se/r/{token}"
  - Email → owner: "Alex wants to borrow your Camping tent (25–28 Mar)"
```

### Slice 5 — Friend edits their request

```
Given: BorrowingRequested with token abc-123, status = pending
When: Friend opens manage link and submits new dates
Then:
  - RequestEdited event recorded
  - Email → owner: "Alex changed their request: now 27–30 March"
  - Email → friend: "Request updated — owner will be notified"
```

### Slice 6 — Owner accepts

```
Given: Pending BorrowingRequested for Camping tent, 25–28 Mar
When: Owner clicks "Accept" on the dashboard
Then:
  - RequestAccepted event recorded
  - Item blocked for 25–28 Mar (unavailable to other requesters)
  - Email → borrower: "Sarah accepted! Arrange pickup: Swish +46 76... / Fisksätra"
```

### Slice 7 — Owner declines

```
Given: Pending request for Camping tent
When: Owner clicks "Decline" with optional reason
Then:
  - RequestDeclined event recorded
  - Item remains available for other requests
  - Email → borrower: "Sorry, not available those dates. Reason: Already lent out"
```

### Slice 8 — Friend cancels via email link

```
Given: BorrowingRequested with token abc-123 (any status)
When: Friend opens manage link and clicks "Cancel"
Then:
  - RequestCancelled event recorded
  - If was accepted: item becomes available again
  - Email → owner: "Alex cancelled their request for Camping tent"
```

### Slice 9 — Owner marks item returned

```
Given: RequestAccepted, item has been picked up and used
When: Owner clicks "Mark as returned" on their dashboard
Then:
  - ItemReturned event recorded
  - Booking period cleared — item available again
  - Request moves to history
```

---

## Email Templates

### → Borrower: Request received
```
Subject: Your request is in — Camping tent

Hi! Sarah got your request.

Item: Camping tent (4-person)
Dates: 25–28 March (3 days · 450 kr)
Your message: "Going to Tyresta…"

Manage your request (edit / cancel):
rentmystuff.itsybit.se/r/{token}

No account needed — bookmark this link.
```

### → Owner: New request
```
Subject: Alex wants to borrow your Camping tent

Alex (alex@example.com) wants to borrow:
Camping tent (4-person)
25–28 March · 3 days · 450 kr

Message: "Going to Tyresta…"

Accept → [link]
Decline → [link]

Or manage all requests: rentmystuff.itsybit.se/owner/{slug}
```

### → Borrower: Accepted
```
Subject: ✓ Booking confirmed — Camping tent

Sarah accepted your request!

Dates: 25–28 March
Contact Sarah to arrange pickup:
  Swish: +46 76 000 00 00
  Location: Fisksätra, Nacka

Manage your booking: rentmystuff.itsybit.se/r/{token}
```

### → Borrower: Declined
```
Subject: Request update — Camping tent

Sarah couldn't do it this time.
Reason: Already lent to someone else

You can try different dates:
rentmystuff.itsybit.se/sarah-k-x7f2
```

### → Owner: Cancellation
```
Subject: Alex cancelled their booking

Alex cancelled their request for Camping tent (25–28 March).

The item is available again.
Manage your page: rentmystuff.itsybit.se/owner/{slug}
```

---

## Architecture Notes

- **No database required for v1** — events written via FileEventStore (same as Chorus)
- **Auth = email tokens** — request tokens are UUIDs; owner manages via PIN sent to email
- **No payment** — platform is coordination only; money via Swish offline
- **Privacy by design** — item lists only accessible via share link (slug)

---

## What's NOT in scope (v1)

- Payment processing
- User accounts / social graph
- Reviews / ratings
- Push notifications (email only)
- Multi-owner marketplaces
- Insurance / damage claims
