// Borrower Item Detail — slice API
// Requires: slices/shared/api.js (apiFetch, RMS core)

async function getListing(slug, id) {
  const data = await RMS.apiFetch(`/pages/${encodeURIComponent(slug)}/items/${encodeURIComponent(id)}`);
  if (data) {
    data.condition_notes = data.conditionNotes;
    data.next_booked = data.nextAvailableDate
      ? `until ${data.nextAvailableDate}`
      : null;
  }
  return data;
}

function requestBooking(itemId, data) {
  return RMS.apiFetch(`/items/${encodeURIComponent(itemId)}/bookings`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

function getListingAvailability(listingId) {
  return RMS.apiFetch(`/listings/${encodeURIComponent(listingId)}/availability`);
}

Object.assign(window.RMS, {
  getListing,
  requestBooking,
  getListingAvailability,
});
