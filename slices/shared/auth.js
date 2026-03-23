// RentMyShit — Auth helpers (localStorage)
// Load before api.js

function getOwnerPin() {
  return localStorage.getItem('rms_owner_pin') || '';
}

function setOwnerPin(pin) {
  localStorage.setItem('rms_owner_pin', pin);
}

function getOwnerSlug() {
  return localStorage.getItem('rms_owner_slug') || '';
}

function setOwnerSlug(slug) {
  localStorage.setItem('rms_owner_slug', slug);
}

window.RMS = window.RMS || {};
Object.assign(window.RMS, { getOwnerPin, setOwnerPin, getOwnerSlug, setOwnerSlug });
