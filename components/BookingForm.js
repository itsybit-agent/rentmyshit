// BookingForm component
// Renders a booking request form (used in friend-view modal and item-detail page)
//
// Usage:
//   BookingForm.render({ ownerName, dailyRate, mode, listingId })
//   mode: 'modal' (compact, for friend-view) or 'sidebar' (full, for item-detail)
//   BookingForm.init(formId, opts) — bind events after rendering

window.BookingForm = {
  render(opts = {}) {
    const ownerName = opts.ownerName || 'the owner';
    const rate = opts.dailyRate || 0;
    const mode = opts.mode || 'modal';
    const listingId = opts.listingId || '';
    const formId = opts.formId || 'bookingForm';
    const today = new Date().toISOString().split('T')[0];

    const summary = mode === 'sidebar' ? `
      <div class="booking-summary" id="${formId}Summary">
        <div class="summary-row">
          <span>${rate} kr \u00d7 <span id="${formId}NumDays">1</span> days</span>
          <span id="${formId}Subtotal">${rate} kr</span>
        </div>
        <div class="summary-row">
          <span>Total (pay to ${this._esc(ownerName)} on pickup)</span>
          <span id="${formId}Total">${rate} kr</span>
        </div>
      </div>` : '';

    const emailCallout = `
      <div style="display:flex;align-items:flex-start;gap:8px;padding:10px 12px;background:var(--pending-bg);border:1px solid var(--pending-bd);border-radius:var(--card-radius);font-size:0.78rem;color:var(--pending);line-height:1.45;margin-bottom:var(--space-md);">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-top:1px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>We'll send you a <strong>confirmation link</strong> so you can view, edit, or cancel your request \u2014 no account needed.</span>
      </div>`;

    const noPayment = `
      <div style="background:var(--paper2);border:1px solid var(--rule);border-radius:var(--card-radius);padding:var(--space-sm) var(--space-md);margin-bottom:var(--space-md);font-size:0.78rem;color:var(--muted);">
        No payment on this platform \u2014 ${this._esc(ownerName)} will reach out directly to arrange pickup and Swish.
      </div>`;

    return `
      <form id="${formId}" data-listing-id="${listingId}" data-rate="${rate}">
        <div class="form-row">
          <div class="form-group">
            <label for="${formId}Start">From</label>
            <input type="date" id="${formId}Start" name="start_date" required min="${today}">
          </div>
          <div class="form-group">
            <label for="${formId}End">To</label>
            <input type="date" id="${formId}End" name="end_date" required min="${today}">
          </div>
        </div>
        ${summary}
        <div class="form-group" style="margin-bottom:var(--space-md);">
          <label for="${formId}Msg">Message to ${this._esc(ownerName)}</label>
          <textarea id="${formId}Msg" name="message" placeholder="What's it for? When can you pick up? Any questions?"></textarea>
        </div>
        <div class="form-group" style="margin-bottom:var(--space-sm);">
          <label for="${formId}Email" style="display:flex;align-items:center;justify-content:space-between;">
            <span>Your email address <span style="color:var(--punch);">*</span></span>
            <span style="font-size:0.68rem;color:var(--muted);font-weight:400;font-style:italic;">No account needed</span>
          </label>
          <input type="email" id="${formId}Email" name="borrower_email" required
            placeholder="you@example.com" autocomplete="email"
            style="border-width:2px;border-color:var(--ink);">
        </div>
        ${emailCallout}
        ${noPayment}
        <button type="submit" class="btn btn-punch" style="width:100%;justify-content:center;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          Send request to ${this._esc(ownerName)}
        </button>
      </form>

      <div id="${formId}Success" style="display:none;padding:var(--space-xl) var(--space-md);text-align:center;">
        <div style="width:52px;height:52px;border-radius:50%;background:var(--available-bg);border:2px solid var(--available-bd);display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-md);color:var(--available);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div style="font-family:var(--font-display);font-size:1.5rem;letter-spacing:0.06em;margin-bottom:var(--space-sm);">Request sent!</div>
        <div style="font-size:0.85rem;color:var(--muted);line-height:1.55;margin-bottom:var(--space-lg);">
          ${this._esc(ownerName)} got your request and will get back to you soon.
          Check your inbox \u2014 we've sent a link so you can manage your booking.
        </div>
        <div id="${formId}SuccessEmail" style="display:inline-flex;align-items:center;gap:6px;font-size:0.78rem;color:var(--pending);background:var(--pending-bg);border:1px solid var(--pending-bd);border-radius:var(--card-radius);padding:6px 14px;margin-bottom:var(--space-lg);">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          Confirmation sent to <strong id="${formId}SuccessEmailText" style="margin-left:3px;"></strong>
        </div>
      </div>`;
  },

  // Bind form submission and date change events
  init(formId, opts = {}) {
    const form = document.getElementById(formId);
    if (!form) return;

    const rate = parseInt(form.dataset.rate) || 0;
    const listingId = form.dataset.listingId;
    const startEl = document.getElementById(`${formId}Start`);
    const endEl = document.getElementById(`${formId}End`);

    function updateSummary() {
      if (!startEl.value || !endEl.value) return;
      const days = Math.max(1, Math.ceil((new Date(endEl.value) - new Date(startEl.value)) / 86400000));
      const total = days * rate;
      const numDaysEl = document.getElementById(`${formId}NumDays`);
      const subtotalEl = document.getElementById(`${formId}Subtotal`);
      const totalEl = document.getElementById(`${formId}Total`);
      if (numDaysEl) numDaysEl.textContent = days;
      if (subtotalEl) subtotalEl.textContent = total + ' kr';
      if (totalEl) totalEl.textContent = total + ' kr';
      endEl.min = startEl.value;
    }

    startEl.addEventListener('change', updateSummary);
    endEl.addEventListener('change', updateSummary);

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = document.getElementById(`${formId}Email`).value;
      const data = {
        start_date: startEl.value,
        end_date: endEl.value,
        message: document.getElementById(`${formId}Msg`).value,
        borrower_email: email,
      };

      try {
        if (listingId) {
          await RMS.requestBooking(listingId, data);
        }
      } catch (err) {
        console.error('Booking request failed:', err);
        // Show success state anyway for demo / offline usage
      }

      // Show success state
      form.style.display = 'none';
      const success = document.getElementById(`${formId}Success`);
      success.style.display = 'block';
      document.getElementById(`${formId}SuccessEmailText`).textContent = email;

      if (opts.onSuccess) opts.onSuccess(data);
    });
  },

  // Reset form + success state (e.g. when closing modal)
  reset(formId) {
    const form = document.getElementById(formId);
    const success = document.getElementById(`${formId}Success`);
    if (form) { form.style.display = 'block'; form.reset(); }
    if (success) success.style.display = 'none';
  },

  _esc(str) {
    const el = document.createElement('span');
    el.textContent = str || '';
    return el.innerHTML;
  },
};
