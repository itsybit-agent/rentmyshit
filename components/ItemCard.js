// ItemCard component
// Renders an item card for both owner dashboard and friend browse views
//
// Usage:
//   ItemCard.render(item, { mode: 'owner' | 'friend', slug? })
//   item: { id, name, daily_rate, status, category?, image_url?, description? }

window.ItemCard = {
  render(item, opts = {}) {
    const mode = opts.mode || 'friend';
    const slug = opts.slug || '';
    const status = item.status || 'available';
    const isBooked = status === 'booked';
    const bookedClass = isBooked ? ' booked' : '';
    const badge = StatusBadge.render(status);
    const detailHref = `item-detail.html?id=${encodeURIComponent(item.id)}${slug ? '&slug=' + encodeURIComponent(slug) : ''}`;

    const photo = item.image_url
      ? `<img src="${item.image_url}" alt="${this._esc(item.name)}">`
      : `<div class="photo-placeholder">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
           <span>${this._esc(item.name)}</span>
         </div>`;

    if (mode === 'owner') {
      return `
        <a href="${detailHref}" class="item-card${bookedClass}" data-id="${item.id}">
          <div class="item-photo">
            ${photo}
            <div class="item-card-edit-overlay">
              <button class="edit-btn" title="Edit" onclick="event.preventDefault();event.stopPropagation();window.dispatchEvent(new CustomEvent('item:edit',{detail:'${item.id}'}))">&#9998;</button>
              <button class="edit-btn" title="Delete" onclick="event.preventDefault();event.stopPropagation();window.dispatchEvent(new CustomEvent('item:delete',{detail:'${item.id}'}))">&#128465;</button>
            </div>
          </div>
          <div class="item-body">
            <div class="item-name">${this._esc(item.name)}</div>
            <div class="item-meta">
              <div class="item-rate">${item.daily_rate} <span>kr/day</span></div>
              ${badge}
            </div>
          </div>
        </a>`;
    }

    // friend mode
    const btnText = isBooked ? 'Currently booked' : 'Request to borrow';
    const btnDisabled = isBooked ? ' disabled' : '';
    return `
      <div class="item-card${bookedClass}" data-id="${item.id}" data-category="${this._esc(item.category || '')}" data-available="${!isBooked}">
        <a href="${detailHref}">
          <div class="item-photo">${photo}</div>
          <div class="item-body">
            <div class="item-name">${this._esc(item.name)}</div>
            <div class="item-meta">
              <div class="item-rate">${item.daily_rate} <span>kr/day</span></div>
              ${badge}
            </div>
          </div>
        </a>
        <div class="item-card-footer">
          <button class="item-request-btn"${btnDisabled} onclick="window.dispatchEvent(new CustomEvent('item:request',{detail:{id:'${item.id}',name:'${this._esc(item.name)}'}}))">${btnText}</button>
        </div>
      </div>`;
  },

  _esc(str) {
    const el = document.createElement('span');
    el.textContent = str || '';
    return el.innerHTML;
  },
};
