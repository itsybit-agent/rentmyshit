# RentMyShit — Implementation Plan

> Trust-based peer rental platform. Share your stuff with friends. No middleman. No accounts. Just email.

## Architecture

**Frontend:** Static HTML/CSS/JS (this repo) — deployed to GitHub Pages  
**Backend:** [event-store-api](https://github.com/itsybit-agent/event-store-api) — modular .NET API, RentMyShit added as a new module alongside Chorus  
**Events:** FileEventStore (same as Chorus)  
**Email:** [Resend](https://resend.com) — simple transactional email API, generous free tier  
**Images:** Supabase Storage (free tier, reuse existing itsybit.se project)

---

## Phase 1 — Backend: RentMyShit Module

Add `RentMyShit` project to `event-store-api` solution, following the Chorus module pattern.

### Vertical Slices

#### Listing Management
- [ ] `CreateListing` — `POST /rms/listings` — creates a new listing, returns `listingId` + owner PIN
- [ ] `GetListing` — `GET /rms/listings/{id}` — public read model (item details, availability)
- [ ] `UpdateListing` — `PUT /rms/listings/{id}` — owner only (PIN required)
- [ ] `DeleteListing` — `DELETE /rms/listings/{id}` — owner only
- [ ] `UploadImage` — `POST /rms/listings/{id}/image` — stores to Supabase, appends `Listing/ImageUploaded` event

#### Owner Page
- [ ] `CreateOwnerPage` — `POST /rms/pages` — creates a "lender profile" with multiple listings + owner email
- [ ] `GetOwnerPage` — `GET /rms/pages/{slug}` — public view of all listings for a lender
- [ ] `UpdateOwnerPage` — `PUT /rms/pages/{slug}` — owner PIN required

#### Booking Flow
- [ ] `RequestBooking` — `POST /rms/listings/{id}/bookings` — friend submits dates + their email
  - Appends `Booking/Requested` event
  - Sends confirmation email to borrower (with edit/cancel link)
  - Sends notification email to owner
- [ ] `ConfirmBooking` — `PUT /rms/bookings/{id}/confirm` — owner PIN required
  - Sends confirmation email to borrower
- [ ] `DeclineBooking` — `PUT /rms/bookings/{id}/decline` — owner PIN required
- [ ] `CancelBooking` — `PUT /rms/bookings/{id}/cancel` — borrower token (from email link)
- [ ] `EditBooking` — `PUT /rms/bookings/{id}` — borrower token (from email link), change dates
- [ ] `GetBooking` — `GET /rms/bookings/{id}?token={token}` — borrower view via email link
- [ ] `GetAvailability` — `GET /rms/listings/{id}/availability` — list of booked date ranges

### Events
```
Listing/Created
Listing/Updated
Listing/Deleted
Listing/ImageUploaded

Page/Created
Page/Updated

Booking/Requested
Booking/Confirmed
Booking/Declined
Booking/Cancelled
Booking/Edited
Booking/Completed
```

### Email Templates (via Resend)
| Trigger | Recipient | Subject |
|---------|-----------|---------|
| `Booking/Requested` | Borrower | "Your request for [item] — confirm or edit" |
| `Booking/Requested` | Owner | "[Name] wants to borrow your [item]" |
| `Booking/Confirmed` | Borrower | "Booked! [item] is yours [dates]" |
| `Booking/Declined` | Borrower | "Sorry, [item] isn't available those dates" |
| `Booking/Cancelled` | Owner | "[Name] cancelled their booking" |

---

## Phase 2 — Frontend

All pages are static HTML. No framework. Same design system as cv.work.

### Pages

#### `index.html` — Owner Dashboard ✅ (mockup done)
- View all your listings + their booking status
- Accept/decline pending requests
- Copy invite link
- Notification email shown

#### `friend-view.html` — Borrower's View ✅ (mockup done)
- Browse owner's items
- Click item → booking modal with email + dates

#### `item-detail.html` — Item + Booking ✅ (mockup done)
- Full item details
- Booking form with email field
- Availability display

#### `booking-status.html` — Borrower's Booking Page (TODO)
- Accessed via email link (token in URL)
- Shows booking status (pending/confirmed/declined)
- Edit dates button
- Cancel button

#### `setup.html` — Owner Onboarding (TODO)
- Create your page: name, slug, notification email, PIN
- Add first item

#### `manage.html` — Owner Item Management (TODO)
- Add/edit/delete listings
- Upload images
- View booking history per item

### API Integration
All pages call `https://api.itsybit.se/rms/...` (or local dev at `http://localhost:5000/rms/...`)

---

## Phase 3 — Infrastructure

- [ ] Deploy `event-store-api` with RentMyShit module to Azure (alongside Chorus)
- [ ] Configure Resend API key in Azure env vars
- [ ] Configure Supabase bucket for images
- [ ] Set up `rentmystuff.itsybit.se` subdomain pointing to GitHub Pages
- [ ] Add `VITE_API_URL` or just hardcode API base URL in JS

---

## Nice to Have (Post-MVP)

- [ ] iCal export for bookings (add to phone calendar)
- [ ] WhatsApp/SMS notification option alongside email
- [ ] Item condition field (Like new / Good / Well-loved)
- [ ] Classified-ad style restyle (see design notes)
- [ ] Multiple images per item
- [ ] Rating/review after return
- [ ] Friend group — shared pool where everyone lists their stuff

---

## Dev Setup

```bash
# Clone both repos
git clone git@github.com:itsybit-agent/rentmyshit.git
git clone git@github.com:itsybit-agent/event-store-api.git

# Run backend locally
cd event-store-api
dotnet run --project src/EventStore.Host

# Frontend — just open index.html in browser
# or serve locally:
npx serve .
```

---

## Decisions

| Question | Decision | Why |
|----------|----------|-----|
| Auth | PIN (owner) + email token (borrower) | No accounts = lower friction |
| Payments | Off-platform | Removes complexity, legal risk, fees |
| Images | Supabase Storage | Already set up for itsybit.se |
| Email | Resend | Simple API, free tier, great DX |
| Hosting | GitHub Pages (frontend) + Azure (API) | Same as Chorus |
| DB | FileEventStore | Consistent with rest of itsyBIT stack |
