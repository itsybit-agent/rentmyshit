// Owner Incoming Orders — slice.js

// Configure paths for components
window.RMS_PATHS = {
  itemDetail: '../../borrower/item-detail/',
};

const slug = RMS.getOwnerSlug();
if (!slug) window.location.href = '../create-page/';

document.getElementById('headerMount').innerHTML = Header.render({
  logoHref: '../dashboard/',
  actions: `<a href="../dashboard/" class="btn btn-ghost btn-sm">&larr; Dashboard</a>`,
});
document.getElementById('footerMount').innerHTML = Footer.render();

async function loadOrders() {
  try {
    const data = await RMS.getOwnerPage(slug);
    renderOrders(data.pendingBookings || []);
  } catch (err) {
    console.error('Failed to load orders:', err);
    Toast.show('Could not load orders');
  }
}

function renderOrders(bookings) {
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

loadOrders();
