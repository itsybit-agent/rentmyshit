// Owner Incoming Orders — slice API
// Requires: slices/shared/api.js (apiFetch, RMS core)

async function getOwnerPage(slug) {
  const data = await RMS.apiFetch(`/pages/${encodeURIComponent(slug)}`);
  if (data && data.pendingBookings) {
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

function confirmBooking(bookingId) {
  return RMS.apiFetch(`/bookings/${encodeURIComponent(bookingId)}/accept`, { method: 'PUT' });
}

function declineBooking(bookingId, reason) {
  return RMS.apiFetch(`/bookings/${encodeURIComponent(bookingId)}/decline`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });
}

Object.assign(window.RMS, {
  getOwnerPage,
  confirmBooking,
  declineBooking,
});
