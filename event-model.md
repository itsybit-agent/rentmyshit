# RentMyShit — Event Model

Zero-accounts, email-driven peer rental. No payment on platform.

---

## Core Concept

Owner creates a shareable link → Shares it with trusted friends → Friends browse and request → Email loop handles confirmation → Logistics (pickup, Swish) happen offline.

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
| `AcceptRequest` | Owner | `{ request_id }` |
| `DeclineRequest` | Owner | `{ request_id, reason? }` |
| `CancelRequest` | Friend | `{ request_token }` (from email link) |
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
| `BorrowingRequested` | `RequestBorrowing` | Generates `request_token` (unguessable UUID for email link) |
| `RequestConfirmationSent` | system | Email → borrower with manage-link |
| `OwnerNotified` | system | Email → owner: "[Name] wants to borrow [Item]" |
| `RequestAccepted` | `AcceptRequest` | |
| `AcceptanceEmailSent` | system | Email → borrower: "Sarah accepted! Pick up at…" |
| `RequestDeclined` | `DeclineRequest` | |
| `DeclineEmailSent` | system | Email → borrower: "Request declined (optional reason)" |
| `RequestCancelled` | `CancelRequest` | Via token from email |
| `CancellationEmailSent` | system | Email → owner: "[Name] cancelled" |
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

## Slices (Given / When / Then)

### Slice 1 — Friend requests to borrow

```
Given: Item "Camping tent" is available for 25–28 March
When: Friend submits RequestBorrowing { start: 25 Mar, end: 28 Mar, email: "alex@example.com" }
Then:
  - BorrowingRequested event recorded
  - Item status = "pending" (visible on dashboard)
  - Email → alex@example.com: "Your request is in! Here's your manage link: rentmyshit.app/r/{token}"
  - Email → owner: "Alex wants to borrow your Camping tent (25–28 Mar)"
```

### Slice 2 — Owner accepts

```
Given: BorrowingRequested for Camping tent, 25–28 Mar
When: Owner clicks "Accept" in their dashboard
Then:
  - RequestAccepted event recorded
  - Item status = "booked" for that date range
  - Email → borrower: "Sarah accepted! Arrange pickup via Swish +46 76 000 00 00"
```

### Slice 3 — Friend cancels via email link

```
Given: BorrowingRequested with token abc-123
When: Friend opens rentmyshit.app/r/abc-123 and clicks "Cancel"
Then:
  - RequestCancelled event recorded
  - Item becomes available again
  - Email → owner: "Alex cancelled their request for Camping tent"
```

### Slice 4 — Owner declines

```
Given: Pending request for Camping tent
When: Owner clicks "Decline" with optional reason "Already lent to someone else"
Then:
  - RequestDeclined event recorded
  - Email → borrower: "Sarah couldn't do it this time. Reason: Already lent to someone else"
```

---

## Email Templates

### → Borrower: Request received
```
Subject: Your request is in — Camping tent (4-person)

Hi! Sarah got your request.

Item: Camping tent (4-person)
Dates: 25–28 March (3 days · 450 kr)
Your message: "Going to Tyresta…"

Manage your request → rentmyshit.app/r/{token}
(You can edit or cancel from this link)

No account needed — bookmark this link.
```

### → Owner: New request
```
Subject: Alex wants to borrow your Camping tent

Alex (alex@example.com) wants to borrow:
Camping tent (4-person)
25–28 March · 3 days · 450 kr

Their message: "Going to Tyresta…"

Accept → rentmyshit.app/owner/{page}/requests/{id}/accept
Decline → rentmyshit.app/owner/{page}/requests/{id}/decline

Or manage all requests → rentmyshit.app/owner/{page}
```

### → Borrower: Accepted
```
Subject: ✓ Booking confirmed — Camping tent

Sarah accepted your request!

Dates: 25–28 March
Contact Sarah to arrange pickup:
  Phone / Swish: +46 76 000 00 00
  Location: Fisksätra, Nacka

Remember to return it clean and dry.
Manage your booking → rentmyshit.app/r/{token}
```

---

## Architecture Notes

- **No database required for v1** — events written to append-only JSON files or SQLite
- **Auth = email tokens** — request tokens are UUIDs; owner page is protected by a setup token sent to owner's email
- **No payment** — platform is coordination only; money changes hands via Swish
- **Privacy by design** — item lists only accessible via share link (slug + optional passphrase v2)

---

## What's NOT in scope (v1)

- Payment processing
- User accounts / social graph
- Reviews / ratings
- Push notifications (email only)
- Multi-owner marketplaces
- Insurance / damage claims
