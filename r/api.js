// Redirect / Booking View — slice API
// Requires: slices/shared/api.js (apiFetch, RMS core)

function getBookingView(bookingId, token) {
  const params = token ? `?token=${encodeURIComponent(token)}` : '';
  return RMS.apiFetch(`/bookings/${encodeURIComponent(bookingId)}/view${params}`);
}

function getBookingViewByToken(token) {
  return RMS.apiFetch(`/bookings/by-token/${encodeURIComponent(token)}/view`);
}

function cancelBooking(bookingId, token) {
  return RMS.apiFetch(`/bookings/${encodeURIComponent(bookingId)}`, {
    method: 'DELETE',
    body: JSON.stringify({ token }),
  });
}

Object.assign(window.RMS, {
  getBookingView,
  getBookingViewByToken,
  cancelBooking,
});
