// Borrower Browse — slice.js

// Configure paths for components
window.RMS_PATHS = {
  itemDetail: '../item-detail/',
};

// Get slug + token from query params
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug') || '';
const shareToken = urlParams.get('t') || '';

let pageData = null;
let activeFilter = 'all';
let ownerName = '';

async function loadPage() {
  try {
    pageData = await RMS.getBrowsePage(slug, shareToken);
    ownerName = pageData.ownerName || 'the owner';
    renderPage(pageData);
  } catch (err) {
    console.error('Failed to load page:', err);
    if (err.status === 403) {
      const msg = shareToken
        ? '<h2>This link is invalid or has expired</h2><p>Ask the owner for a new share link.</p>'
        : '<h2>Private listing</h2><p>You need a share link from the owner to view their stuff.</p>';
      document.getElementById('itemGrid').innerHTML =
        `<div style="text-align:center;padding:3rem;color:var(--muted);grid-column:1/-1;">${msg}</div>`;
      return;
    }
    Toast.show('Could not load this page');
  }
}

function renderPage(data) {
  const name = data.ownerName || 'Someone';
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const listings = data.items || [];
  const available = listings.filter(l => l.status !== 'booked').length;

  // Header
  const cleanBase = window.location.origin + '/' + encodeURIComponent(slug);
  document.getElementById('headerMount').innerHTML = Header.render({
    logoHref: cleanBase + (shareToken ? '?t=' + encodeURIComponent(shareToken) : ''),
    tagline: `Shared by ${name}`,
    actions: `<a href="${cleanBase}/admin" class="btn btn-ghost btn-sm">Admin login</a>`,
  });

  // Footer
  document.getElementById('footerMount').innerHTML = Footer.render({
    note: `Got your own stuff to share? <a href="../../owner/create-page/" style="color:var(--punch);text-decoration:none;">Get your own link &rarr;</a>`,
  });

  // Owner banner
  document.getElementById('ownerAvatar').textContent = initials;
  document.getElementById('ownerTitle').textContent = `${name}'s stuff`;
  document.getElementById('ownerSubtitle').textContent =
    `${data.location || ''} \u00b7 ${available} items available \u00b7 Transactions offline \u2014 arrange directly with ${name}`;

  // Trust note
  document.querySelector('#trustNote span').innerHTML =
    `${name} shared this list with you personally. <strong>No payment on this platform</strong> \u2014 agree on terms directly. Only people with the link can see this.`;

  // Category filter buttons (from actual data)
  const categories = [...new Set(listings.map(l => l.category).filter(Boolean))];
  const filterRow = document.getElementById('filterRow');
  filterRow.querySelectorAll('[data-dynamic]').forEach(el => el.remove());
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.setAttribute('data-dynamic', '');
    btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    btn.onclick = function () { setFilter(this, cat); };
    filterRow.appendChild(btn);
  });

  // Render items
  const grid = document.getElementById('itemGrid');
  grid.innerHTML = '';
  listings.forEach(item => {
    grid.insertAdjacentHTML('beforeend', ItemCard.render(item, { mode: 'friend', slug, token: shareToken }));
  });
  updateCount();

  // Mount booking form in modal
  document.getElementById('requestFormMount').innerHTML = BookingForm.render({
    ownerName: name,
    mode: 'modal',
    formId: 'requestForm',
  });
  BookingForm.init('requestForm', {
    onSuccess() {
      document.getElementById('pendingBanner').style.display = 'flex';
    },
  });

  Modal.init();
}

// Item request event — open modal and set listing ID
window.addEventListener('item:request', function (e) {
  const { id, name } = e.detail;
  document.getElementById('requestModalTitle').textContent = `Borrow "${name}"`;
  const form = document.getElementById('requestForm');
  if (form) form.dataset.listingId = id;
  Modal.open('requestModal');
});

// Filter / search
function setFilter(btn, filter) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeFilter = filter;
  filterItems();
}

function filterItems() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const cards = document.querySelectorAll('#itemGrid .item-card');
  cards.forEach(card => {
    const name = card.querySelector('.item-name').textContent.toLowerCase();
    const category = card.dataset.category || '';
    const available = card.dataset.available === 'true';
    const matchesSearch = !search || name.includes(search);
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'available' && available) ||
      category.includes(activeFilter);
    card.style.display = (matchesSearch && matchesFilter) ? '' : 'none';
  });
  updateCount();
}

function updateCount() {
  const visible = document.querySelectorAll('#itemGrid .item-card:not([style*="display: none"])').length;
  document.getElementById('itemCount').textContent = `${visible} item${visible !== 1 ? 's' : ''}`;
}

// Init
if (slug) loadPage();
