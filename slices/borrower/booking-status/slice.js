// Borrower Booking Status — slice.js
// URL: /r/{token} → 404.html → /slices/borrower/booking-status/?token={token}
//      or /slices/borrower/booking-status/?id={bookingId}&token={token}

const urlParams = new URLSearchParams(window.location.search);
const bookingId = urlParams.get('id') || urlParams.get('booking');
const token = urlParams.get('token') || '';

let bookingData = null;

document.getElementById('headerMount').innerHTML = Header.render({
  logoHref: '/',
  tagline: 'Your booking',
  actions: '',
});
document.getElementById('footerMount').innerHTML = Footer.render();

function esc(str) {
  const el = document.createElement('span');
  el.textContent = str || '';
  return el.innerHTML;
}

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function loadBooking() {
  try {
    if (bookingId) {
      bookingData = await RMS.getBookingView(bookingId, token);
    } else if (token) {
      bookingData = await RMS.getBookingViewByToken(token);
    } else {
      document.getElementById('statusTitle').textContent = 'No booking found';
      document.getElementById('statusSubtitle').textContent = 'Check the link from your email.';
      return;
    }
    renderBooking(bookingData);
  } catch (err) {
    console.error('Failed to load booking:', err);
    document.getElementById('statusTitle').textContent = 'Could not load booking';
    document.getElementById('statusSubtitle').textContent = 'The link may have expired or be invalid.';
  }
}

function renderBooking(data) {
  const status = data.status || 'pending';
  const ownerName = data.owner?.name || 'the owner';
  const itemName = data.item?.name;

  document.title = `${itemName || 'Booking'} — FörRåd`;

  // Status icon
  const iconEl = document.getElementById('statusIcon');
  iconEl.className = `status-icon ${status}`;

  const icons = {
    pending:   '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    accepted:  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    returned:  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    declined:  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    cancelled: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  };
  iconEl.innerHTML = icons[status] || icons.pending;

  const titles = {
    pending:   'Request pending',
    accepted:  'Booking accepted!',
    returned:  'Item returned',
    declined:  'Request declined',
    cancelled: 'Booking cancelled',
  };
  document.getElementById('statusTitle').textContent = titles[status] || status;

  const subtitles = {
    pending:   `Waiting for ${ownerName} to respond`,
    accepted:  `${ownerName} confirmed your request — arrange pickup below`,
    returned:  'Thanks for borrowing — hope it was useful!',
    declined:  `${ownerName} couldn't do it this time`,
    cancelled: 'You cancelled this booking',
  };
  document.getElementById('statusSubtitle').textContent = subtitles[status] || '';

  // Detail rows
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const days = Math.max(1, Math.ceil((end - start) / 86400000));
  const total = (data.item?.dailyRate || 0) * days;

  document.getElementById('detailRows').innerHTML = `
    <div class="detail-row"><span class="detail-label">Item</span><span class="detail-value">${esc(itemName)}</span></div>
    <div class="detail-row"><span class="detail-label">Dates</span><span class="detail-value">${esc(fmt(data.startDate))} – ${esc(fmt(data.endDate))}</span></div>
    <div class="detail-row"><span class="detail-label">Duration</span><span class="detail-value">${days} day${days !== 1 ? 's' : ''}</span></div>
    <div class="detail-row"><span class="detail-label">Rate</span><span class="detail-value">${data.item?.dailyRate || 0} kr/day</span></div>
    <div class="detail-row"><span class="detail-label">Total</span><span class="detail-value" style="font-weight:700;">${total} kr</span></div>
    <div class="detail-row"><span class="detail-label">Owner</span><span class="detail-value">${esc(ownerName)}</span></div>
  `;

  // Borrower message
  if (data.message) {
    document.getElementById('messageBlock').style.display = '';
    document.getElementById('messageBlock').textContent = `"${data.message}"`;
  }

  // Contact info (accepted only — backend only includes these fields when accepted)
  if (status === 'accepted' && (data.owner?.swishNumber || data.owner?.location)) {
    document.getElementById('contactInfo').style.display = '';
    const parts = [];
    if (data.owner.swishNumber) parts.push(`Swish: ${data.owner.swishNumber}`);
    if (data.owner.location) parts.push(`Pickup: ${data.owner.location}`);
    document.getElementById('contactDetails').textContent = parts.join(' · ');
  }

  // Actions
  const actionRow = document.getElementById('actionRow');
  actionRow.innerHTML = '';

  if (status === 'pending' || status === 'accepted') {
    actionRow.innerHTML += `<button class="btn btn-outline btn-sm" onclick="toggleEditDates()">Edit dates</button>`;
    actionRow.innerHTML += `<button class="btn btn-ghost btn-sm" style="color:var(--punch);" onclick="handleCancel()">Cancel booking</button>`;
  }

  if (status === 'declined') {
    const pageSlug = data.item?.pageSlug;
    const browseHref = pageSlug ? `/slices/borrower/browse/?slug=${encodeURIComponent(pageSlug)}` : '/';
    actionRow.innerHTML += `<a href="${browseHref}" class="btn btn-primary btn-sm">&larr; Try different dates</a>`;
  }

  // Pre-fill edit form
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
  const bid = bookingData?.bookingId || bookingId;
  try {
    await RMS.editBooking(bid, token, { startDate: newStart, endDate: newEnd });
    Toast.show('Dates updated — owner notified');
    document.getElementById('editDatesForm').classList.remove('visible');
    loadBooking();
  } catch (err) {
    console.error('Edit failed:', err);
    Toast.show('Could not update dates — try again', 'error');
  }
});

async function handleCancel() {
  if (!confirm('Cancel this booking? This cannot be undone.')) return;
  const bid = bookingData?.bookingId || bookingId;
  try {
    await RMS.cancelBooking(bid, token);
    Toast.show('Booking cancelled');
    loadBooking();
  } catch (err) {
    console.error('Cancel failed:', err);
    Toast.show('Could not cancel — try again', 'error');
  }
}

loadBooking();
