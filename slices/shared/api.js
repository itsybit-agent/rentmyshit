// RentMyShit — API Client
// Requires: auth.js loaded first (sets up window.RMS with auth helpers)

const API_BASE = localStorage.getItem('rms_api_base') || 'https://labsapi-hmeva5cfhdfkejhz.westeurope-01.azurewebsites.net/api/rms';
const SITE_BASE = localStorage.getItem('rms_site_base') || 'https://rentmystuff.itsybit.se';
const SUPABASE_URL = 'https://qalzmunlszchouocfruz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbHptdW5sc3pjaG91b2NmcnV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNjE5MTgsImV4cCI6MjA4NzgzNzkxOH0.EUkps4XTR2-Ec1Yh5ZkpbnoWRry88vAbMJJIOiLSxQ0';

const API_ERROR_MESSAGES = {
  400: 'Something looks wrong with that request.',
  401: 'Incorrect PIN — please check and try again.',
  403: 'This link is invalid or has expired.',
  404: 'Not found.',
  409: 'Already exists — try a different value.',
  429: 'Too many requests — slow down a bit.',
  500: 'Server error — try again in a moment.',
};

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const pin = RMS.getOwnerPin();
  if (pin) {
    headers['X-Owner-Pin'] = pin;
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`API ${res.status}: ${body || res.statusText}`);
    err.status = res.status;
    err.body = body;
    // Auto-toast for common errors unless caller handles it
    if (window.Toast && !options.silent) {
      const msg = API_ERROR_MESSAGES[res.status] || `Something went wrong (${res.status}).`;
      Toast.show(msg, 'error');
    }
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

// ── Owner Pages ──

function createOwnerPage(data) {
  return apiFetch('/pages', { method: 'POST', body: JSON.stringify(data), silent: true }); // caller handles 409
}

function requestAccess(slug, data) {
  return apiFetch(`/pages/${encodeURIComponent(slug)}/access-requests`, {
    method: 'POST',
    body: JSON.stringify(data),
    silent: true,
  });
}

async function getOwnerPage(slug) {
  const data = await apiFetch(`/pages/${encodeURIComponent(slug)}`);
  if (data && data.pendingBookings) {
    // Normalize pendingBookings for PendingRequestCard component
    data.pendingBookings = data.pendingBookings.map(b => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      const days = Math.max(1, Math.ceil((end - start) / 86400000));
      return {
        ...b,
        id: b.bookingId,
        itemName: b.itemName,
        item_id: b.itemId,
        borrowerName: b.borrowerEmail?.split('@')[0] || 'Someone',
        days,
        total: days * (b.dailyRate || 0),
      };
    });
  }
  return data;
}

function getBrowsePage(slug, token) {
  // Use /browse endpoint when available (requires token); fall back to public /pages/{slug}
  const path = token
    ? `/pages/${encodeURIComponent(slug)}/browse?t=${encodeURIComponent(token)}`
    : `/pages/${encodeURIComponent(slug)}`;
  return apiFetch(path);
}

function rotateShareToken(slug) {
  return apiFetch(`/pages/${encodeURIComponent(slug)}/rotate-token`, { method: 'POST' });
}

function updateOwnerPage(slug, data) {
  return apiFetch(`/pages/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── Listings ──

function createListing(data) {
  const { pageSlug, ...body } = data;
  return apiFetch(`/pages/${encodeURIComponent(pageSlug)}/items`, { method: 'POST', body: JSON.stringify(body) });
}

async function getListing(slug, id) {
  const data = await apiFetch(`/pages/${encodeURIComponent(slug)}/items/${encodeURIComponent(id)}`);
  if (data) {
    data.condition_notes = data.conditionNotes;
    data.next_booked = data.nextAvailableDate
      ? `until ${data.nextAvailableDate}`
      : null;
  }
  return data;
}

function updateListing(slug, id, data) {
  return apiFetch(`/pages/${encodeURIComponent(slug)}/items/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

function deleteListing(slug, id) {
  return apiFetch(`/pages/${encodeURIComponent(slug)}/items/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

async function uploadListingImage(slug, id, file) {
  if (!window.ImageUpload) throw new Error('ImageUpload library not loaded');
  const publicUrl = await ImageUpload.compressAndUpload(file, id);
  // Persist the photo URL on the item in the backend
  await updateListing(slug, id, { photoUrl: publicUrl });
  return { url: publicUrl };
}

// ── Bookings ──

function requestBooking(itemId, data) {
  return apiFetch(`/items/${encodeURIComponent(itemId)}/bookings`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

function getBooking(bookingId, token) {
  const params = token ? `?token=${encodeURIComponent(token)}` : '';
  return apiFetch(`/bookings/${encodeURIComponent(bookingId)}${params}`);
}

function getBookingView(bookingId, token) {
  const params = token ? `?token=${encodeURIComponent(token)}` : '';
  return apiFetch(`/bookings/${encodeURIComponent(bookingId)}/view${params}`);
}

function getBookingViewByToken(token) {
  return apiFetch(`/bookings/by-token/${encodeURIComponent(token)}/view`);
}
}

function confirmBooking(bookingId) {
  return apiFetch(`/bookings/${encodeURIComponent(bookingId)}/accept`, { method: 'PUT' });
}

function declineBooking(bookingId, reason) {
  return apiFetch(`/bookings/${encodeURIComponent(bookingId)}/decline`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });
}

function cancelBooking(bookingId, token) {
  return apiFetch(`/bookings/${encodeURIComponent(bookingId)}`, {
    method: 'DELETE',
    body: JSON.stringify({ token }),
  });
}

function editBooking(bookingId, token, data) {
  return apiFetch(`/bookings/${encodeURIComponent(bookingId)}`, {
    method: 'PUT',
    body: JSON.stringify({ token, ...data }),
  });
}

function getListingAvailability(listingId) {
  return apiFetch(`/listings/${encodeURIComponent(listingId)}/availability`);
}

function getPageEvents(slug) {
  return apiFetch(`/pages/${encodeURIComponent(slug)}/events`);
}

// ── PIN Reset ──

function requestPinReset(slug, email) {
  return apiFetch(`/pages/${encodeURIComponent(slug)}/reset-pin`, {
    method: 'POST',
    body: JSON.stringify({ ownerEmail: email }),
  });
}

function confirmPinReset(slug, token, newPin) {
  return apiFetch(`/pages/${encodeURIComponent(slug)}/confirm-pin-reset`, {
    method: 'POST',
    body: JSON.stringify({ resetToken: token, newPin }),
  });
}

// ── Export ──
Object.assign(window.RMS, {
  API_BASE,
  SITE_BASE,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  createOwnerPage,
  getOwnerPage,
  getBrowsePage,
  rotateShareToken,
  updateOwnerPage,
  createListing,
  getListing,
  updateListing,
  deleteListing,
  uploadListingImage,
  requestBooking,
  getBooking,
  getBookingView,
  getBookingViewByToken,
  confirmBooking,
  declineBooking,
  cancelBooking,
  editBooking,
  getListingAvailability,
  getPageEvents,
  requestPinReset,
  confirmPinReset,
  requestAccess,
});
