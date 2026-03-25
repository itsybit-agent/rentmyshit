// PendingRequestCard component
// Renders a collapsible booking request card for the owner dashboard
//
// Usage: PendingRequestCard.render(booking)
// booking: { id, itemName, borrowerName, borrowerEmail, startDate, endDate, days, total, message, is_new, item_id }

window.PendingRequestCard = {
  render(booking) {
    const newClass = booking.is_new ? ' new' : '';
    const detailBase = (window.RMS_PATHS && window.RMS_PATHS.itemDetail) || 'item-detail.html';
    const emailIcon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
    const dates = `${booking.startDate} \u2013 ${booking.endDate}`;
    const message = booking.message
      ? `<div class="request-message">"${this._esc(booking.message)}"</div>`
      : '';
    const thumb = booking.itemPhoto
      ? `<img src="${this._esc(booking.itemPhoto)}" style="width:36px;height:36px;object-fit:cover;border-radius:4px;flex-shrink:0;">`
      : `<div style="width:36px;height:36px;background:var(--rule);border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--faint);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;

    return `
      <details class="request-card${newClass}" data-booking-id="${booking.id}">
        <summary class="request-summary">
          ${thumb}
          <div class="request-summary-info">
            <span class="request-item-name">${this._esc(booking.itemName)}</span>
            <span class="request-summary-meta">${this._esc(booking.borrowerName)} · ${dates} · ${booking.total} kr</span>
          </div>
          <svg class="request-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </summary>
        <div class="request-body">
          <div class="request-meta-full">
            ${emailIcon} <a href="mailto:${this._esc(booking.borrowerEmail)}" style="color:var(--muted);text-decoration:none;font-size:0.78rem;">${this._esc(booking.borrowerEmail)}</a>
            &nbsp;·&nbsp; <span style="font-size:0.78rem;color:var(--muted);">${booking.days} day${booking.days !== 1 ? 's' : ''}</span>
          </div>
          ${message}
          <div class="request-actions">
            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();window.dispatchEvent(new CustomEvent('booking:accept',{detail:'${booking.id}'}))">Accept</button>
            <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();window.dispatchEvent(new CustomEvent('booking:decline',{detail:'${booking.id}'}))">Decline</button>
            <a href="${detailBase}?id=${this._esc(booking.item_id || '')}" class="btn btn-ghost btn-sm">View item</a>
          </div>
        </div>
      </details>`;
  },

  _esc(str) {
    const el = document.createElement('span');
    el.textContent = str || '';
    return el.innerHTML;
  },
};
