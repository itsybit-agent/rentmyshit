// Borrower booking status page
// URL: /r/{token} → routed here via 404.html

const urlParams = new URLSearchParams(window.location.search);

// Token comes from path: /r/abc123 → path = /r/abc123
const pathParts = window.location.pathname.replace(/^\/r\/?/, '').split('/');
const token = pathParts[0] || urlParams.get('token') || '';
const bookingId = urlParams.get('id') || '';

document.getElementById('headerMount').innerHTML = Header.render({ logoHref: '/' });
document.getElementById('footerMount').innerHTML = Footer.render();

if (!token && !bookingId) {
  showError();
} else {
  loadBooking();
}

async function loadBooking() {
  try {
    // Try to get booking by token — need bookingId too
    // First try via ?id= param, then fall back to token-only lookup
    let data;
    if (bookingId) {
      data = await RMS.getBookingView(bookingId, token);
    } else {
      // Look up bookingId from token
      data = await RMS.getBookingViewByToken(token);
    }
    renderBooking(data);
  } catch (err) {
    console.error('Failed to load booking:', err);
    showError();
  }
}

function renderBooking(data) {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('bookingContent').style.display = '';
  document.title = `Your booking — ${data.item.name}`;

  // Status
  const status = data.status;
  const statusConfig = {
    pending:   { label: 'Waiting for response', icon: 'clock',  cls: 'pending',   sub: `${data.owner.name} will get back to you soon.` },
    accepted:  { label: 'Accepted! 🎉',         icon: 'check',  cls: 'accepted',  sub: `${data.owner.name} confirmed your request.` },
    declined:  { label: 'Declined',             icon: 'x',      cls: 'declined',  sub: `${data.owner.name} couldn't do it this time.` },
    cancelled: { label: 'Cancelled',            icon: 'x',      cls: 'cancelled', sub: 'This request was cancelled.' },
    returned:  { label: 'Returned ✓',           icon: 'check',  cls: 'accepted',  sub: 'Item returned. Thanks for using RentMyStuff!' },
  }[status] || { label: status, icon: 'clock', cls: 'pending', sub: '' };

  document.getElementById('statusTitle').textContent = statusConfig.label;
  document.getElementById('statusSub').textContent = statusConfig.sub;
  const iconEl = document.getElementById('statusIcon');
  iconEl.className = `status-icon ${statusConfig.cls}`;
  iconEl.innerHTML = statusConfig.icon === 'check'
    ? `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
    : statusConfig.icon === 'x'
    ? `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
    : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

  // Item
  document.getElementById('itemName').textContent = data.item.name;
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const days = Math.max(1, Math.ceil((end - start) / 86400000));
  document.getElementById('itemDates').textContent = `${fmt(start)} – ${fmt(end)} · ${days} day${days !== 1 ? 's' : ''} · ${days * data.item.dailyRate} kr`;

  if (data.item.photoUrl) {
    document.getElementById('itemThumb').outerHTML = `<img class="item-thumb" src="${esc(data.item.photoUrl)}" alt="${esc(data.item.name)}">`;
  }

  // Detail rows
  const rows = [
    ['From', fmt(start)],
    ['To', fmt(end)],
    ['Total', `${days * data.item.dailyRate} kr`],
    ['Status', statusConfig.label],
    ...(data.message ? [['Your message', data.message]] : []),
    ['Requested', new Date(data.requestedAt).toLocaleDateString('sv-SE')],
  ];
  document.getElementById('detailRows').innerHTML = rows.map(([label, value]) => `
    <div class="detail-row">
      <span class="detail-label">${esc(label)}</span>
      <span class="detail-value">${esc(value)}</span>
    </div>`).join('');

  // Contact box (accepted only)
  if (status === 'accepted' && (data.owner.swishNumber || data.owner.location)) {
    document.getElementById('contactBox').style.display = '';
    document.getElementById('contactDetails').innerHTML = [
      data.owner.swishNumber ? `<div class="detail-row"><span class="detail-label">Swish</span><span class="detail-value">${esc(data.owner.swishNumber)}</span></div>` : '',
      data.owner.location ? `<div class="detail-row"><span class="detail-label">Location</span><span class="detail-value">${esc(data.owner.location)}</span></div>` : '',
    ].join('');
  }

  // Cancel button — only for active bookings
  if (['cancelled', 'declined', 'returned'].includes(status)) {
    document.getElementById('cancelSection').style.display = 'none';
  } else {
    document.getElementById('cancelBtn').addEventListener('click', async () => {
      if (!confirm('Cancel this request?')) return;
      try {
        await RMS.cancelBooking(data.bookingId, token);
        Toast.show('Request cancelled');
        // Reload
        setTimeout(() => location.reload(), 800);
      } catch (err) {
        Toast.show('Could not cancel — try again', 'error');
      }
    });
  }
}

function showError() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('errorState').style.display = '';
}

function fmt(date) {
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function esc(str) {
  const el = document.createElement('span');
  el.textContent = str || '';
  return el.innerHTML;
}
