// Owner Manage Items — slice API
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

function createListing(data) {
  const { pageSlug, ...body } = data;
  return RMS.apiFetch(`/pages/${encodeURIComponent(pageSlug)}/items`, { method: 'POST', body: JSON.stringify(body) });
}

function updateListing(slug, id, data) {
  return RMS.apiFetch(`/pages/${encodeURIComponent(slug)}/items/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

function deleteListing(slug, id) {
  return RMS.apiFetch(`/pages/${encodeURIComponent(slug)}/items/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

async function uploadListingImage(slug, id, file) {
  if (!window.ImageUpload) throw new Error('ImageUpload library not loaded');
  const publicUrl = await ImageUpload.compressAndUpload(file, id);
  await updateListing(slug, id, { photoUrl: publicUrl });
  return { url: publicUrl };
}

Object.assign(window.RMS, {
  getOwnerPage,
  createListing,
  updateListing,
  deleteListing,
  uploadListingImage,
});
