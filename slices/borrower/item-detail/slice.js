// Borrower Item Detail — slice.js

const urlParams = new URLSearchParams(window.location.search);
const listingId = urlParams.get('id');
const slug = urlParams.get('slug') || '';
const shareToken = urlParams.get('t') || '';

let itemData = null;
let ownerName = '';

function esc(str) {
  const el = document.createElement('span');
  el.textContent = str || '';
  return el.innerHTML;
}

async function loadItem() {
  try {
    itemData = await RMS.getListing(slug, listingId);
    renderItem(itemData);
  } catch (err) {
    console.error('Failed to load item:', err);
    Toast.show('Could not load item details');
  }
}

function renderItem(data) {
  ownerName = data.ownerName || 'the owner';
  const initials = ownerName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const rate = data.dailyRate || 0;
  const status = data.status || 'available';
  const isBooked = status === 'booked';

  document.title = `${data.name} — RentMyShit`;

  // Header
  const backHref = slug ? `../browse/?slug=${encodeURIComponent(slug)}${shareToken ? '&t=' + encodeURIComponent(shareToken) : ''}` : '../browse/';
  document.getElementById('headerMount').innerHTML = Header.render({
    tagline: `Shared by ${ownerName}`,
    logoHref: backHref,
    actions: `<a href="${backHref}" class="btn btn-ghost btn-sm">&larr; All items</a>`,
  });
  document.getElementById('footerMount').innerHTML = Footer.render();

  // Breadcrumb
  document.getElementById('breadcrumbBack').href = backHref;
  document.getElementById('breadcrumbBack').textContent = `${ownerName}'s stuff`;
  document.getElementById('breadcrumbItem').textContent = data.name;

  // Hero image
  if (data.image_url) {
    document.getElementById('itemHero').innerHTML = `<img src="${esc(data.image_url)}" alt="${esc(data.name)}">`;
  }

  // Title + rate
  document.getElementById('itemName').textContent = data.name;
  document.getElementById('itemRate').innerHTML = `${rate} <small>kr/day</small>`;
  document.getElementById('formRate').textContent = `${rate} kr/day`;

  // Status row
  document.getElementById('itemStatusRow').innerHTML = `
    ${StatusBadge.render(status)}
    <span class="dot">&middot;</span>
    <div class="owner-chip">
      <div class="avatar-xs">${initials}</div>
      ${esc(ownerName)}
    </div>
    ${data.location ? `<span class="dot">&middot;</span><span style="font-size:0.82rem;color:var(--muted);">${esc(data.location)}</span>` : ''}
  `;

  // Description
  const desc = data.description || '';
  document.getElementById('itemDesc').innerHTML = desc.split('\n\n').map(p => `<p>${esc(p)}</p>`).join('');

  // Availability
  const availClass = isBooked ? ' booked' : '';
  const availLabel = isBooked ? 'Currently booked' : 'Available now';
  const availColor = isBooked ? 'var(--booked)' : 'var(--available)';
  document.getElementById('availabilityBlock').innerHTML = `
    <div class="availability-block${availClass}">
      <div class="avail-dot"></div>
      <div class="avail-text">
        <strong style="color:${availColor};">${availLabel}</strong>
        ${data.next_booked ? `<span>Next booked period: ${esc(data.next_booked)}</span>` : ''}
      </div>
    </div>`;

  // Conditions
  if (data.condition_notes) {
    document.getElementById('conditionsSection').style.display = '';
    const notes = Array.isArray(data.condition_notes) ? data.condition_notes : data.condition_notes.split('\n');
    document.getElementById('conditionList').innerHTML = notes.map(n => `<li>${esc(n)}</li>`).join('');
  }

  // Contact
  if (data.swishNumber || data.phone) {
    document.getElementById('contactSection').style.display = '';
    document.getElementById('contactBlock').innerHTML = `
      <div class="contact-block">
        <div class="contact-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
        </div>
        <div class="contact-text">
          <strong>Phone / Swish</strong>
          <a href="tel:${esc(data.swishNumber || data.phone)}">${esc(data.swishNumber || data.phone)}</a>
        </div>
      </div>`;
  }

  // Booking form
  document.getElementById('bookingFormMount').innerHTML = BookingForm.render({
    ownerName,
    dailyRate: rate,
    mode: 'sidebar',
    formId: 'bookingForm',
    listingId: listingId,
  });
  BookingForm.init('bookingForm');
}

if (listingId) loadItem();
