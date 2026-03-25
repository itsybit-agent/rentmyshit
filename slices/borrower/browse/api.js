// Borrower Browse — slice API
// Requires: slices/shared/api.js (apiFetch, RMS core)

function getBrowsePage(slug, token) {
  // Use /browse endpoint when available (requires token); fall back to public /pages/{slug}
  const path = token
    ? `/pages/${encodeURIComponent(slug)}/browse?t=${encodeURIComponent(token)}`
    : `/pages/${encodeURIComponent(slug)}`;
  return RMS.apiFetch(path);
}

function requestBooking(itemId, data) {
  return RMS.apiFetch(`/items/${encodeURIComponent(itemId)}/bookings`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

Object.assign(window.RMS, {
  getBrowsePage,
  requestBooking,
});
