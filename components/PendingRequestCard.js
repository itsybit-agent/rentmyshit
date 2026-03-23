// PendingRequestCard component
// Renders a booking request card for the owner dashboard
//
// Usage: PendingRequestCard.render(booking)
// booking: { id, item_name, borrower_name, borrower_email, start_date, end_date, days, total, message, is_new }

window.PendingRequestCard = {
  render(booking) {
    const newClass = booking.is_new ? ' new' : '';
    const emailIcon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
    const dates = `${booking.start_date} \u2013 ${booking.end_date}`;
    const meta = `<strong>${this._esc(booking.borrower_name)}</strong> \u00b7 ${dates} \u00b7 ${booking.days} days \u00b7 <strong>${booking.total} kr</strong>`;
    const email = booking.borrower_email
      ? `<span style="display:inline-flex;align-items:center;gap:4px;margin-left:8px;font-size:0.75rem;color:var(--muted);font-weight:400;">${emailIcon} <a href="mailto:${this._esc(booking.borrower_email)}" style="color:var(--muted);text-decoration:none;">${this._esc(booking.borrower_email)}</a></span>`
      : '';
    const message = booking.message
      ? `<div class="request-message">"${this._esc(booking.message)}"</div>`
      : '';

    return `
      <div class="request-card${newClass}" data-booking-id="${booking.id}">
        <div class="request-thumb">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </div>
        <div class="request-info">
          <div class="request-item-name">${this._esc(booking.item_name)}</div>
          <div class="request-meta">${meta}${email}</div>
          ${message}
          <div class="request-actions">
            <button class="btn btn-primary btn-sm" onclick="window.dispatchEvent(new CustomEvent('booking:accept',{detail:'${booking.id}'}))">Accept</button>
            <button class="btn btn-outline btn-sm" onclick="window.dispatchEvent(new CustomEvent('booking:decline',{detail:'${booking.id}'}))">Decline</button>
            <a href="item-detail.html?id=${encodeURIComponent(booking.item_id || '')}" class="btn btn-ghost btn-sm">View item</a>
          </div>
        </div>
      </div>`;
  },

  _esc(str) {
    const el = document.createElement('span');
    el.textContent = str || '';
    return el.innerHTML;
  },
};
