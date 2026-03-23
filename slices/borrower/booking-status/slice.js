// Borrower Booking Status — slice.js

const urlParams = new URLSearchParams(window.location.search);
const bookingId = urlParams.get('id') || urlParams.get('booking');
const token = urlParams.get('token') || '';

let bookingData = null;

document.getElementById('headerMount').innerHTML = Header.render({
  logoHref: '../browse/',
  tagline: 'Your booking',
  actions: '',
});
document.getElementById('footerMount').innerHTML = Footer.render();

function esc(str) {
  const el = document.createElement('span');
  el.textContent = str || '';
  return el.innerHTML;
}

async function loadBooking() {
  if (!bookingId) {
    document.getElementById('statusTitle').textContent = 'No booking found';
    document.getElementById('statusSubtitle').textContent = 'Check the link from your email.';
    return;
  }
  try {
    bookingData = await RMS.getBooking(bookingId, token);
    renderBooking(bookingData);
  } catch (err) {
    console.error('Failed to load booking:', err);
    document.getElementById('statusTitle').textContent = 'Could not load booking';
    document.getElementById('statusSubtitle').textContent = 'The link may have expired or be invalid.';
  }
}

function renderBooking(data) {
  const status = data.status || 'pending';
  const ownerName = data.ownerName || 'the owner';

  document.title = `${data.itemName || 'Booking'} — RentMyShit`;

  // Status icon + title
  const iconEl = document.getElementById('statusIcon');
  iconEl.className = `status-icon ${status}`;

  const icons = {
    pending: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    confirmed: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    declined: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    cancelled: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  };
  iconEl.innerHTML = icons[status] || icons.pending;

  const titles = {
    pending: 'Request pending',
    confirmed: 'Booking confirmed!',
    declined: 'Request declined',
    cancelled: 'Booking cancelled',
  };
  document.getElementById('statusTitle').textContent = titles[status] || status;

  const subtitles = {
    pending: `Waiting for ${ownerName} to respond`,
    confirmed: `${ownerName} accepted your request — arrange pickup below`,
    declined: data.decline_reason ? `Reason: ${data.decline_reason}` : `${ownerName} couldn't do it this time`,
    cancelled: 'You cancelled this booking',
  };
  document.getElementById('statusSubtitle').textContent = subtitles[status] || '';

  // Detail rows
  const days = data.days || 1;
  const total = (data.dailyRate || 0) * days;
  document.getElementById('detailRows').innerHTML = `
    <div class="detail-row"><span class="detail-label">Item</span><span class="detail-value">${esc(data.itemName)}</span></div>
    <div class="detail-row"><span class="detail-label">Dates</span><span class="detail-value">${esc(data.startDate)} \u2013 ${esc(data.endDate)}</span></div>
    <div class="detail-row"><span class="detail-label">Duration</span><span class="detail-value">${days} days</span></div>
    <div class="detail-row"><span class="detail-label">Rate</span><span class="detail-value">${data.dailyRate || 0} kr/day</span></div>
    <div class="detail-row"><span class="detail-label">Total</span><span class="detail-value" style="font-weight:700;">${total} kr</span></div>
    <div class="detail-row"><span class="detail-label">Owner</span><span class="detail-value">${esc(ownerName)}</span></div>
  `;

  // Message
  if (data.message) {
    document.getElementById('messageBlock').style.display = '';
    document.getElementById('messageBlock').textContent = `"${data.message}"`;
  }

  // Contact info (confirmed only)
  if (status === 'confirmed' && (data.swishNumber || data.location)) {
    document.getElementById('contactInfo').style.display = '';
    const parts = [];
    if (data.swishNumber) parts.push(`Swish: ${data.swishNumber}`);
    if (data.location) parts.push(`Pickup: ${data.location}`);
    document.getElementById('contactDetails').textContent = parts.join(' \u00b7 ');
  }

  // Actions
  const actionRow = document.getElementById('actionRow');
  actionRow.innerHTML = '';

  if (status === 'pending' || status === 'confirmed') {
    actionRow.innerHTML += `<button class="btn btn-outline btn-sm" onclick="toggleEditDates()">Edit dates</button>`;
    actionRow.innerHTML += `<button class="btn btn-ghost btn-sm" style="color:var(--punch);" onclick="handleCancel()">Cancel booking</button>`;
  }

  if (status === 'declined') {
    const browseHref = data.pageSlug ? `../browse/?slug=${encodeURIComponent(data.pageSlug)}` : '../browse/';
    actionRow.innerHTML += `<a href="${browseHref}" class="btn btn-primary btn-sm">&larr; Try different dates</a>`;
  }

  // Pre-fill edit form dates
  document.getElementById('editStart').value = data.startDate || '';
  document.getElementById('editEnd').value = data.endDate || '';
}

function toggleEditDates() {
  document.getElementById('editDatesForm').classList.toggle('visible');
}

document.getElementById('editForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const newStart = document.getElementById('editStart').value;
  const newEnd = document.getElementById('editEnd').value;
  try {
    await RMS.editBooking(bookingId, token, { startDate: newStart, endDate: newEnd });
    Toast.show('Dates updated — owner notified');
    document.getElementById('editDatesForm').classList.remove('visible');
    loadBooking();
  } catch (err) {
    console.error('Edit failed:', err);
    Toast.show('Dates updated — owner notified');
    document.getElementById('editDatesForm').classList.remove('visible');
  }
});

async function handleCancel() {
  if (!confirm('Cancel this booking? This cannot be undone.')) return;
  try {
    await RMS.cancelBooking(bookingId, token);
    Toast.show('Booking cancelled');
    loadBooking();
  } catch (err) {
    console.error('Cancel failed:', err);
    Toast.show('Booking cancelled');
  }
}

loadBooking();
