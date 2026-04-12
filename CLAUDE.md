# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

FörRåd (RentMyShit) is a zero-friction peer rental frontend. No build step, no framework, no package manager — pure vanilla HTML/CSS/JS deployed as static files via FTP to a managed host (Unoeuro/IIS).

The backend is a separate .NET repo (`event-store-api`) with a `RentMyStuff` module. The API base is `https://labsapi-hmeva5cfhdfkejhz.westeurope-01.azurewebsites.net/api/rms`. This can be overridden in the browser via `localStorage.setItem('rms_api_base', '...')`.

## Running locally

```bash
npx serve .
```

Then navigate to slices directly, e.g. `http://localhost:3000/slices/owner/create-page/`.

## Deploy

Push to `main` → GitHub Actions FTP-deploys to the host. Markdown docs and `.github/` are excluded.

## Architecture

### Slice structure

Every feature is a self-contained slice with three files:

```
slices/
  owner/
    create-page/     index.html  slice.js  api.js
    dashboard/       index.html  slice.js  api.js
    incoming-orders/ index.html  slice.js  api.js
    landing/         index.html  slice.js  api.js
    manage-items/    index.html  slice.js  api.js
    reset-pin/       index.html  slice.js  api.js
  borrower/
    browse/          index.html  slice.js  api.js
    item-detail/     index.html  slice.js  api.js
    booking-status/  index.html  slice.js  api.js
  shared/
    api.js     — apiFetch wrapper, auto-injects X-Owner-Pin header, auto-toasts API errors
    auth.js    — localStorage helpers (rms_owner_pin, rms_owner_slug)
    brand.js   — brand constants
    styles.css — full design system (CSS variables, layout utilities, components)
```

`slice.js` pattern: check auth → render header/footer → load from API → render → bind events.

`api.js` pattern: thin wrappers over `RMS.apiFetch()` that `Object.assign` onto `window.RMS`.

### Shared components (`lib/components/`)

Vanilla JS objects with `.render()` (returns HTML string) and `.init()` (binds events after mount). Loaded via `<script>` tags. Key ones: `Header`, `Footer`, `Toast`, `BookingForm`, `ItemCard`, `PendingRequestCard`, `Modal`, `StatusBadge`.

### Routing

`404.html` is the router — IIS serves it for any unmatched path. It inspects the URL and redirects:

| URL pattern | Destination |
|---|---|
| `/r/{token}` | `/slices/borrower/booking-status/?token={token}` |
| `/{slug}/admin` | `/slices/owner/dashboard/?slug={slug}` |
| `/{slug}?t={token}` | `/slices/borrower/browse/?slug={slug}&t={token}` |
| `/{slug}` | `/slices/owner/landing/?slug={slug}` |

### Auth

- **Owner:** PIN stored in `localStorage` as `rms_owner_pin`. Sent as `X-Owner-Pin` header by `apiFetch`.
- **Borrower:** UUID token in URL query param (`?token=`). Passed explicitly to API calls.

## Backend API conventions

All endpoints are under `/api/rms`. Status values from the backend: `pending | accepted | declined | cancelled | returned`.

Booking view responses (`/bookings/{id}/view`) return nested objects:
```
{ bookingId, status, startDate, endDate, message, requestedAt,
  item: { itemId, name, dailyRate, photoUrl, pageSlug },
  owner: { name, swishNumber?, location? }  ← contact fields only included when accepted
}
```

## Design system

CSS variables in `slices/shared/styles.css`: `--ink`, `--paper`, `--paper2`, `--punch` (accent/CTA), `--rule`, `--muted`.

Fonts: **Bebas Neue** (display/headings) + **Space Grotesk** (body). Aesthetic: newspaper ledger.
