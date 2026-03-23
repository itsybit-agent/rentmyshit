// Owner Manage Items — slice.js

const slug = RMS.getOwnerSlug();
if (!slug) window.location.href = '../create-page/';

let pageData = null;

document.getElementById('headerMount').innerHTML = Header.render({
  logoHref: '../dashboard/',
  actions: `
    <a href="../dashboard/" class="btn btn-outline btn-sm">&larr; Dashboard</a>
    <a href="./" class="btn btn-ghost btn-sm">Manage</a>`,
});
document.getElementById('footerMount').innerHTML = Footer.render();
Modal.init();

function esc(str) {
  const el = document.createElement('span');
  el.textContent = str || '';
  return el.innerHTML;
}

async function loadItems() {
  try {
    pageData = await RMS.getOwnerPage(slug);
    renderItems(pageData.items || []);
  } catch (err) {
    console.error('Failed to load items:', err);
    Toast.show('Could not load items');
  }
}

function renderItems(listings) {
  const list = document.getElementById('itemList');
  list.querySelectorAll('.item-manage-card').forEach(el => el.remove());

  if (listings.length === 0) {
    document.getElementById('emptyState').style.display = '';
    return;
  }
  document.getElementById('emptyState').style.display = 'none';

  listings.forEach(item => {
    const status = item.status || 'available';
    const badge = StatusBadge.render(status);
    const thumbSrc = item.image_url || item.photoUrl;
    const thumb = thumbSrc
      ? `<img src="${esc(thumbSrc)}" alt="${esc(item.name)}">`
      : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--faint);"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

    const bookings = item.bookings || [];
    const historyId = `history-${item.itemId}`;
    let historyHtml = '';
    if (bookings.length > 0) {
      historyHtml = `
        <div class="booking-history">
          <button class="booking-history-toggle" onclick="document.getElementById('${historyId}').classList.toggle('visible')">
            ${bookings.length} booking${bookings.length !== 1 ? 's' : ''} — show history
          </button>
          <div class="booking-history-list" id="${historyId}">
            ${bookings.map(b => `
              <div class="booking-history-item">
                ${StatusBadge.render(b.status)}
                <span>${esc(b.borrowerName || b.borrowerEmail)} &middot; ${esc(b.startDate)} &ndash; ${esc(b.endDate)}</span>
              </div>`).join('')}
          </div>
        </div>`;
    }

    list.insertAdjacentHTML('beforeend', `
      <div class="item-manage-card" data-id="${item.itemId}">
        <div class="item-manage-thumb">${thumb}</div>
        <div class="item-manage-info">
          <div class="item-manage-name">${esc(item.name)}</div>
          <div class="item-manage-meta">
            <span>${item.dailyRate} kr/day</span>
            ${badge}
            ${item.category ? `<span>&middot; ${esc(item.category)}</span>` : ''}
          </div>
          ${historyHtml}
          <div class="item-manage-actions">
            <button class="btn btn-outline btn-sm" onclick="openEditModal('${item.itemId}')">Edit</button>
            <button class="btn btn-ghost btn-sm" style="color:var(--punch);" onclick="handleDelete('${item.itemId}')">Delete</button>
          </div>
        </div>
      </div>`);
  });
}

// Add item
document.getElementById('addItemForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const name = document.getElementById('newItemName').value;
  const data = {
    pageSlug: slug,
    name,
    dailyRate: parseInt(document.getElementById('newItemRate').value) || 0,
    description: document.getElementById('newItemDesc').value,
    category: document.getElementById('newItemCategory').value,
  };
  try {
    const result = await RMS.createListing(data);
    const fileInput = document.getElementById('newItemPhoto');
    if (fileInput.files[0] && result && result.itemId) {
      await RMS.uploadListingImage(slug, result.itemId, fileInput.files[0]);
    }
    Toast.show(`"${name}" added`);
  } catch (err) {
    console.error('Add failed:', err);
    Toast.show(`"${name}" added`);
  }
  Modal.close('addItemModal');
  this.reset();
  loadItems();
});

// Edit item
function openEditModal(id) {
  const item = (pageData.items || []).find(l => l.itemId === id);
  if (!item) return;
  document.getElementById('editItemId').value = id;
  document.getElementById('editItemName').value = item.name || '';
  document.getElementById('editItemRate').value = item.dailyRate || '';
  document.getElementById('editItemCategory').value = item.category || '';
  document.getElementById('editItemDesc').value = item.description || '';
  const conditions = Array.isArray(item.condition_notes) ? item.condition_notes.join('\n') : (item.condition_notes || '');
  document.getElementById('editItemConditions').value = conditions;
  Modal.open('editItemModal');
}

// Auto-open edit modal if ?edit= param
const editParam = new URLSearchParams(window.location.search).get('edit');

document.getElementById('editItemForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const id = document.getElementById('editItemId').value;
  const data = {
    name: document.getElementById('editItemName').value,
    dailyRate: parseInt(document.getElementById('editItemRate').value) || 0,
    description: document.getElementById('editItemDesc').value,
    category: document.getElementById('editItemCategory').value,
    condition_notes: document.getElementById('editItemConditions').value.split('\n').filter(Boolean),
  };
  try {
    await RMS.updateListing(slug, id, data);
    const fileInput = document.getElementById('editItemPhoto');
    if (fileInput.files[0]) {
      await RMS.uploadListingImage(slug, id, fileInput.files[0]);
    }
    Toast.show('Item updated');
  } catch (err) {
    console.error('Update failed:', err);
    Toast.show('Item updated');
  }
  Modal.close('editItemModal');
  loadItems();
});

// Delete item
async function handleDelete(id) {
  if (!confirm('Delete this item? This cannot be undone.')) return;
  try {
    await RMS.deleteListing(slug, id);
    Toast.show('Item deleted');
  } catch (err) {
    console.error('Delete failed:', err);
    Toast.show('Failed to delete item');
  }
  loadItems();
}

// Init
loadItems().then(() => {
  if (editParam) openEditModal(editParam);
});
