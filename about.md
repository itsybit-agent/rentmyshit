# FörRåd — Lend your stuff to friends. Not strangers.

You know that pressure washer in the garage? The camping tent you use twice a year? The projector collecting dust on a shelf? Your friends need these things sometimes, and you'd happily lend them out — but coordinating it is a mess. WhatsApp threads spiral, nobody remembers who has what, and you definitely don't want to list your stuff on some marketplace for strangers.

I built FörRåd because I wanted something stupidly simple. You create a page, add your stuff with daily rates, and share a private link with friends. They browse, pick dates, enter their email, and you get notified. You accept or decline from your dashboard, and the borrower gets a confirmation with your Swish number and pickup location. No accounts, no payment processing, no middleman. Money and logistics happen offline, the way it should between friends.

**Features:**
- Owner pages with a custom slug and PIN-based access — no login or account needed
- Add, edit, and delete items with daily rates, categories, photos, and condition notes
- Client-side image compression and upload to Supabase Storage
- Shareable private link — only people with the link can browse your stuff
- Borrowers request items by picking dates and entering their email
- Email-driven flow: confirmation links let borrowers view, edit dates, or cancel
- Owner dashboard with stats: items listed, pending requests, items currently out
- Accept or decline requests with automatic email notifications
- Booking history per item so you know who borrowed what and when
- Event log panel showing the full event stream for debugging and transparency

**Tech:**
- Vanilla HTML/CSS/JS — zero build step, no framework, no bundler
- Slice-based architecture: each feature is a self-contained folder
- Event-sourced backend via shared .NET API (FileEventStore)
- Supabase Storage for item photos (client-side compressed)
- PIN + email token auth — no sessions, no cookies, no OAuth
- Newspaper-inspired design system: Bebas Neue + Space Grotesk, warm paper tones
