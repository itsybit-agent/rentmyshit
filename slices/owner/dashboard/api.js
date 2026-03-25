// Owner Dashboard — slice API
// Requires: slices/shared/api.js (apiFetch, RMS core)

async function getOwnerPage(slug) {
  const data = await RMS.apiFetch(`/pages/${encodeURIComponent(slug)}`);
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

function createListing(data) {
  const { pageSlug, ...body } = data;
  return RMS.apiFetch(`/pages/${encodeURIComponent(pageSlug)}/items`, { method: 'POST', body: JSON.stringify(body) });
}

function deleteListing(slug, id) {
  return RMS.apiFetch(`/pages/${encodeURIComponent(slug)}/items/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

async function uploadListingImage(slug, id, file) {
  if (!window.ImageUpload) throw new Error('ImageUpload library not loaded');
  const publicUrl = await ImageUpload.compressAndUpload(file, id);
  await RMS.apiFetch(`/pages/${encodeURIComponent(slug)}/items/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ photoUrl: publicUrl }),
  });
  return { url: publicUrl };
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

function getPageEvents(slug) {
  return RMS.apiFetch(`/pages/${encodeURIComponent(slug)}/events`);
}

Object.assign(window.RMS, {
  getOwnerPage,
  createListing,
  deleteListing,
  uploadListingImage,
  confirmBooking,
  declineBooking,
  getPageEvents,
});
