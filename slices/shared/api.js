// RentMyShit — API Core
// Provides: apiFetch, constants, error messages.
// Slice-specific functions live in each slice's api.js.
// Requires: auth.js loaded first (sets up window.RMS with auth helpers)

const API_BASE = localStorage.getItem('rms_api_base') || 'https://labsapi-hmeva5cfhdfkejhz.westeurope-01.azurewebsites.net/api/rms';
const SITE_BASE = localStorage.getItem('rms_site_base') || 'https://rentmystuff.itsybit.se';
const SUPABASE_URL = 'https://qalzmunlszchouocfruz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbHptdW5sc3pjaG91b2NmcnV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNjE5MTgsImV4cCI6MjA4NzgzNzkxOH0.EUkps4XTR2-Ec1Yh5ZkpbnoWRry88vAbMJJIOiLSxQ0';

const API_ERROR_MESSAGES = {
  400: 'Something looks wrong with that request.',
  401: 'Incorrect PIN — please check and try again.',
  403: 'This link is invalid or has expired.',
  404: 'Not found.',
  409: 'Already exists — try a different value.',
  429: 'Too many requests — slow down a bit.',
  500: 'Server error — try again in a moment.',
};

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const pin = RMS.getOwnerPin();
  if (pin) {
    headers['X-Owner-Pin'] = pin;
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`API ${res.status}: ${body || res.statusText}`);
    err.status = res.status;
    err.body = body;
    // Auto-toast for common errors unless caller handles it
    if (window.Toast && !options.silent) {
      const msg = API_ERROR_MESSAGES[res.status] || `Something went wrong (${res.status}).`;
      Toast.show(msg, 'error');
    }
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

// ── Export core ──
Object.assign(window.RMS, {
  API_BASE,
  SITE_BASE,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  apiFetch,
});
