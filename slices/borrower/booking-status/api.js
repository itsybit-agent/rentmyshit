// Borrower Booking Status — slice API
// Requires: slices/shared/api.js (apiFetch, RMS core)

function getBooking(bookingId, token) {
  const params = token ? `?token=${encodeURIComponent(token)}` : '';
  return RMS.apiFetch(`/bookings/${encodeURIComponent(bookingId)}${params}`);
}

function editBooking(bookingId, token, data) {
  return RMS.apiFetch(`/bookings/${encodeURIComponent(bookingId)}`, {
    method: 'PUT',
    body: JSON.stringify({ token, ...data }),
  });
}

function cancelBooking(bookingId, token) {
  return RMS.apiFetch(`/bookings/${encodeURIComponent(bookingId)}`, {
    method: 'DELETE',
    body: JSON.stringify({ token }),
  });
}

Object.assign(window.RMS, {
  getBooking,
  editBooking,
  cancelBooking,
});
