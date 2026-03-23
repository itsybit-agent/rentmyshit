// RentMyShit — API Client
// Base URL configurable via localStorage or default

const API_BASE = localStorage.getItem('rms_api_base') || 'https://api.itsybit.se/rms';

function getOwnerPin() {
  return localStorage.getItem('rms_owner_pin') || '';
}

function setOwnerPin(pin) {
  localStorage.setItem('rms_owner_pin', pin);
}

function getOwnerSlug() {
  return localStorage.getItem('rms_owner_slug') || '';
}

function setOwnerSlug(slug) {
  localStorage.setItem('rms_owner_slug', slug);
}

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const pin = getOwnerPin();
  if (pin) {
    headers['X-Owner-Pin'] = pin;
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ── Owner Pages ──

function createOwnerPage(data) {
  // data: { owner_name, owner_email, slug, pin, location?, swish_number? }
  return apiFetch('/pages', { method: 'POST', body: JSON.stringify(data) });
}

function getOwnerPage(slug) {
  return apiFetch(`/pages/${encodeURIComponent(slug)}`);
}

function updateOwnerPage(slug, data) {
  return apiFetch(`/pages/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── Listings ──

function createListing(data) {
  // data: { page_slug, name, description?, daily_rate, condition_notes?, category? }
  return apiFetch('/listings', { method: 'POST', body: JSON.stringify(data) });
}

function getListing(id) {
  return apiFetch(`/listings/${encodeURIComponent(id)}`);
}

function updateListing(id, data) {
  return apiFetch(`/listings/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

function deleteListing(id) {
  return apiFetch(`/listings/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

function uploadListingImage(id, file) {
  const formData = new FormData();
  formData.append('image', file);
  const pin = getOwnerPin();
  const headers = {};
  if (pin) headers['X-Owner-Pin'] = pin;
  return fetch(`${API_BASE}/listings/${encodeURIComponent(id)}/image`, {
    method: 'POST',
    headers,
    body: formData,
  }).then(res => {
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json();
  });
}

// ── Bookings ──

function requestBooking(listingId, data) {
  // data: { start_date, end_date, message?, borrower_email }
  return apiFetch(`/listings/${encodeURIComponent(listingId)}/bookings`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

function getBooking(bookingId, token) {
  const params = token ? `?token=${encodeURIComponent(token)}` : '';
  return apiFetch(`/bookings/${encodeURIComponent(bookingId)}${params}`);
}

function confirmBooking(bookingId) {
  return apiFetch(`/bookings/${encodeURIComponent(bookingId)}/confirm`, { method: 'PUT' });
}

function declineBooking(bookingId, reason) {
  return apiFetch(`/bookings/${encodeURIComponent(bookingId)}/decline`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });
}

function cancelBooking(bookingId, token) {
  return apiFetch(`/bookings/${encodeURIComponent(bookingId)}/cancel`, {
    method: 'PUT',
    body: JSON.stringify({ token }),
  });
}

function editBooking(bookingId, token, data) {
  // data: { start_date, end_date }
  return apiFetch(`/bookings/${encodeURIComponent(bookingId)}`, {
    method: 'PUT',
    body: JSON.stringify({ token, ...data }),
  });
}

function getListingAvailability(listingId) {
  return apiFetch(`/listings/${encodeURIComponent(listingId)}/availability`);
}

// ── Export as global ──
window.RMS = {
  API_BASE,
  getOwnerPin,
  setOwnerPin,
  getOwnerSlug,
  setOwnerSlug,
  createOwnerPage,
  getOwnerPage,
  updateOwnerPage,
  createListing,
  getListing,
  updateListing,
  deleteListing,
  uploadListingImage,
  requestBooking,
  getBooking,
  confirmBooking,
  declineBooking,
  cancelBooking,
  editBooking,
  getListingAvailability,
};
