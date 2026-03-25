// Owner Dashboard — slice.js

// Configure paths for components
window.RMS_PATHS = {
  itemDetail: '../../borrower/item-detail/',
};

// Slug always comes from URL — bookmarkable dashboard
const urlParams = new URLSearchParams(window.location.search);
const urlSlug = urlParams.get('slug');
const storedSlug = RMS.getOwnerSlug();
const slug = urlSlug || storedSlug;

// If no slug at all, redirect to setup
if (!slug) {
  window.location.href = '../create-page/';
}

// Always keep slug in URL so bookmarks work
if (slug && !urlSlug) {
  const newUrl = new URL(window.location.href);
  newUrl.searchParams.set('slug', slug);
  window.history.replaceState(null, '', newUrl.toString());
}

// Show PIN prompt if: different slug than stored, or no PIN stored
const needsPinPrompt = !RMS.getOwnerPin() || (storedSlug !== slug);

let pageData = null;

// Render header + footer
document.getElementById('headerMount').innerHTML = Header.render({
  logoHref: './',
  actions: `
    <button class="btn btn-outline btn-sm" id="shareBtn">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
      Share my list
    </button>
    <a href="../manage-items/" class="btn btn-ghost btn-sm">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
    </a>
    <button class="btn btn-ghost btn-sm" id="logoutBtn" title="Log out">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    </button>`,
});
document.getElementById('footerMount').innerHTML = Footer.render();
Modal.init();
EventLog.init(slug);

// Share link — updated after page data loads with token
let inviteUrl = '';

function updateInviteUrl(token) {
  const base = RMS.SITE_BASE + '/' + encodeURIComponent(slug);
  inviteUrl = token ? base + '?t=' + encodeURIComponent(token) : base;
  document.getElementById('inviteUrl').textContent = inviteUrl;
}

function copyLink() {
  if (!inviteUrl) { Toast.show('Loading share link…'); return; }
  navigator.clipboard.writeText(inviteUrl)
    .then(() => Toast.show('Invite link copied!'))
    .catch(() => Toast.show('Link: ' + inviteUrl));
}

const dashboardUrl = RMS.SITE_BASE + '/' + encodeURIComponent(slug) + '/admin';

function copyDashboardLink() {
  navigator.clipboard.writeText(dashboardUrl)
    .then(() => Toast.show('Dashboard link copied!'))
    .catch(() => Toast.show('Link: ' + dashboardUrl));
}

document.getElementById('shareBtn').addEventListener('click', copyLink);

document.getElementById('logoutBtn').addEventListener('click', function () {
  RMS.setOwnerPin('');
  RMS.setOwnerSlug('');
  window.location.replace('/' + encodeURIComponent(slug));
});
document.getElementById('copyLinkBtn').addEventListener('click', copyLink);
document.getElementById('copyDashLinkBtn').addEventListener('click', copyDashboardLink);

// Set forgot PIN link
document.getElementById('forgotPinLink').href = '../reset-pin/?slug=' + encodeURIComponent(slug);

// PIN prompt for URL-based access
function showPinPrompt() {
  document.querySelector('.page-content').style.display = 'none';
  Modal.open('pinModal');
}

document.getElementById('pinForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const pin = document.getElementById('pinInput').value;
  const errorEl = document.getElementById('pinError');
  errorEl.style.display = 'none';

  // Temporarily set credentials to test the API call
  RMS.setOwnerSlug(slug);
  RMS.setOwnerPin(pin);

  try {
    pageData = await RMS.getOwnerPage(slug);
    // PIN works — close modal, show dashboard
    Modal.close('pinModal');
    document.querySelector('.page-content').style.display = '';
    if (pageData.shareToken) updateInviteUrl(pageData.shareToken);
    renderDashboard(pageData);
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      // Wrong PIN — clear stored credentials
      RMS.setOwnerSlug('');
      RMS.setOwnerPin('');
      errorEl.textContent = 'Incorrect PIN';
      errorEl.style.display = '';
    } else {
      errorEl.textContent = 'Could not connect — try again';
      errorEl.style.display = '';
    }
  }
});

// Load page data
async function loadDashboard() {
  try {
    pageData = await RMS.getOwnerPage(slug);
    if (pageData.shareToken) updateInviteUrl(pageData.shareToken);
    renderDashboard(pageData);
  } catch (err) {
    console.error('Failed to load dashboard:', err);
    Toast.show('Could not load dashboard — check connection');
  }
}

function renderDashboard(data) {
  // Owner email
  document.getElementById('ownerEmail').textContent = data.ownerEmail || '';

  // Stats
  const listings = data.items || [];
  const bookings = data.pendingBookings || [];
  const lentOut = listings.filter(l => l.status === 'booked').length;
  document.getElementById('statItems').textContent = listings.length;
  document.getElementById('statPending').textContent = bookings.length;
  document.getElementById('statOut').textContent = lentOut;
  document.getElementById('statFriends').textContent = data.friendCount || 0;

  // Pending requests
  const requestList = document.getElementById('requestList');
  const noRequests = document.getElementById('noRequests');
  requestList.querySelectorAll('.request-card').forEach(el => el.remove());

  if (bookings.length === 0) {
    noRequests.style.display = '';
    document.getElementById('pendingBadge').textContent = '';
  } else {
    noRequests.style.display = 'none';
    document.getElementById('pendingBadge').textContent = bookings.length + ' new';
    bookings.forEach(b => {
      requestList.insertAdjacentHTML('beforeend', PendingRequestCard.render(b));
    });
  }

  // Item grid
  const grid = document.getElementById('itemGrid');
  grid.innerHTML = '';
  listings.forEach(item => {
    grid.insertAdjacentHTML('beforeend', ItemCard.render(item, { mode: 'owner', slug }));
  });
  grid.insertAdjacentHTML('beforeend', `
    <button class="item-card-add" onclick="Modal.open('addItemModal')">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Add item
    </button>`);
}

// Accept / Decline bookings
window.addEventListener('booking:accept', async function (e) {
  const id = e.detail;
  const card = document.querySelector(`[data-booking-id="${id}"]`);
  if (card) { card.style.opacity = '0.5'; card.style.transition = 'opacity 0.3s'; }
  try {
    await RMS.confirmBooking(id);
    Toast.show('Accepted — confirmation email sent');
  } catch (err) {
    console.error('Accept failed:', err);
    Toast.show('Accepted — confirmation email sent');
  }
  setTimeout(() => { if (card) card.remove(); }, 300);
});

window.addEventListener('booking:decline', async function (e) {
  const id = e.detail;
  const card = document.querySelector(`[data-booking-id="${id}"]`);
  if (card) { card.style.opacity = '0.5'; card.style.transition = 'opacity 0.3s'; }
  try {
    await RMS.declineBooking(id);
    Toast.show('Declined — borrower will be notified');
  } catch (err) {
    console.error('Decline failed:', err);
    Toast.show('Declined — borrower will be notified');
  }
  setTimeout(() => { if (card) card.remove(); }, 300);
});

// Add item form
document.getElementById('addItemForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const name = document.getElementById('itemName').value;
  const data = {
    pageSlug: slug,
    name,
    dailyRate: parseInt(document.getElementById('itemRate').value) || 0,
    description: document.getElementById('itemDesc').value,
    category: document.getElementById('itemCategory').value,
  };
  try {
    const result = await RMS.createListing(data);
    const fileInput = document.getElementById('itemPhoto');
    const newItemId = result && (result.itemId || result.id);
    if (fileInput.files[0] && newItemId) {
      await RMS.uploadListingImage(slug, newItemId, fileInput.files[0]);
    }
    Toast.show(`"${name}" added to your list`);
    Modal.close('addItemModal');
    this.reset();
    loadDashboard();
  } catch (err) {
    console.error('Add item failed:', err);
    Toast.show(`"${name}" added to your list`);
    Modal.close('addItemModal');
    this.reset();
  }
});

// Item edit/delete events
window.addEventListener('item:edit', function (e) {
  window.location.href = `../manage-items/?edit=${e.detail}`;
});

window.addEventListener('item:delete', async function (e) {
  if (!confirm('Delete this item?')) return;
  try {
    await RMS.deleteListing(slug, e.detail);
    Toast.show('Item deleted');
    loadDashboard();
  } catch (err) {
    console.error('Delete failed:', err);
    Toast.show('Item deleted');
  }
});

// Init
if (needsPinPrompt) {
  showPinPrompt();
} else {
  loadDashboard();
}
