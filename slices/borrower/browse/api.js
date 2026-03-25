// Borrower Browse — slice API
// Requires: slices/shared/api.js (apiFetch, RMS core)

function getBrowsePage(slug, token) {
  // Browse always uses /browse — requires share token
  // No token = 403, caller handles that state
  const path = token
    ? `/pages/${encodeURIComponent(slug)}/browse?t=${encodeURIComponent(token)}`
    : `/pages/${encodeURIComponent(slug)}/browse`;
  return RMS.apiFetch(path, { silent: true });
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
