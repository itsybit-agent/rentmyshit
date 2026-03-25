// Owner Reset PIN — slice API
// Requires: slices/shared/api.js (apiFetch, RMS core)

function requestPinReset(slug, email) {
  return RMS.apiFetch(`/pages/${encodeURIComponent(slug)}/reset-pin`, {
    method: 'POST',
    body: JSON.stringify({ ownerEmail: email }),
  });
}

function confirmPinReset(slug, token, newPin) {
  return RMS.apiFetch(`/pages/${encodeURIComponent(slug)}/confirm-pin-reset`, {
    method: 'POST',
    body: JSON.stringify({ resetToken: token, newPin }),
  });
}

Object.assign(window.RMS, {
  requestPinReset,
  confirmPinReset,
});
