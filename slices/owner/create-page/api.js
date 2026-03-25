// Owner Create Page — slice API
// Requires: slices/shared/api.js (apiFetch, RMS core)

function createOwnerPage(data) {
  return RMS.apiFetch('/pages', { method: 'POST', body: JSON.stringify(data), silent: true }); // caller handles 409
}

function createListing(data) {
  const { pageSlug, ...body } = data;
  return RMS.apiFetch(`/pages/${encodeURIComponent(pageSlug)}/items`, { method: 'POST', body: JSON.stringify(body) });
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

Object.assign(window.RMS, {
  createOwnerPage,
  createListing,
  uploadListingImage,
});
