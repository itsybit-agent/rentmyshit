// RentMyShit — API Client
// Base URL configurable via localStorage or default

const API_BASE = localStorage.getItem('rms_api_base') || 'https://labsapi-hmeva5cfhdfkejhz.westeurope-01.azurewebsites.net/api/rms';

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
    const err = new Error(`API ${res.status}: ${body || res.statusText}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

// ── Owner Pages ──

function createOwnerPage(data) {
  // data: { ownerName, ownerEmail, slug, pin, location?, swishNumber? }
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
  // data: { pageSlug, name, description?, dailyRate, condition_notes?, category? }
  const { pageSlug, ...body } = data;
  return apiFetch(`/pages/${encodeURIComponent(pageSlug)}/items`, { method: 'POST', body: JSON.stringify(body) });
}

function getListing(slug, id) {
  return apiFetch(`/pages/${encodeURIComponent(slug)}/items/${encodeURIComponent(id)}`);
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
  // data: { startDate, endDate, message?, borrowerEmail }
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
  // data: { startDate, endDate }
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
