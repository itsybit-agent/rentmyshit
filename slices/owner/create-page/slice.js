// Owner Create Page — slice.js

let createdSlug = '';

document.getElementById('headerMount').innerHTML = Header.render({
  logoHref: '../dashboard/',
  tagline: 'Get started',
  actions: '<a href="../dashboard/" class="btn btn-ghost btn-sm">Already have a page? &rarr;</a>',
});
document.getElementById('footerMount').innerHTML = Footer.render();

// Slug preview
function generateSlug(name) {
  const parts = name.trim().toLowerCase().split(/\s+/);
  const base = parts.length > 1
    ? parts[0] + '-' + parts[parts.length - 1][0]
    : parts[0];
  const clean = base.replace(/[^a-z0-9\-]/g, '');
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${clean}-${suffix}`;
}

let slugManuallyEdited = false;
document.getElementById('ownerName').addEventListener('input', function () {
  if (slugManuallyEdited) return;
  const slug = generateSlug(this.value);
  document.getElementById('pageSlug').value = slug;
  document.getElementById('slugPreview').textContent = `${RMS.SITE_BASE}/${slug}`;
});

document.getElementById('pageSlug').addEventListener('input', function () {
  slugManuallyEdited = true;
  const val = this.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
  this.value = val;
  document.getElementById('slugPreview').textContent = val ? `${RMS.SITE_BASE}/${val}` : `${RMS.SITE_BASE}/...`;
});

// Step 1: Create page
document.getElementById('createPageForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const slug = document.getElementById('pageSlug').value;
  const pin = document.getElementById('ownerPin').value;
  const data = {
    ownerName: document.getElementById('ownerName').value,
    ownerEmail: document.getElementById('ownerEmail').value,
    slug,
    ownerPin: pin,
    location: document.getElementById('ownerLocation').value,
    swishNumber: document.getElementById('ownerSwish').value,
  };

  try {
    await RMS.createOwnerPage(data);
  } catch (err) {
    console.error('Create page failed:', err);
    if (err.status === 409 || (err.message && err.message.includes('already taken'))) {
      Toast.show('That URL is already taken — please choose a different one.', 'error');
    } else {
      Toast.show('Something went wrong. Please try again.', 'error');
    }
    return;
  }

  // Store credentials locally
  RMS.setOwnerSlug(slug);
  RMS.setOwnerPin(pin);
  createdSlug = slug;

  // Advance to step 2
  document.getElementById('step1Card').style.display = 'none';
  document.getElementById('step2Card').style.display = '';
  document.getElementById('step1Dot').className = 'step-dot done';
  document.getElementById('step1Dot').innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
  document.getElementById('step1Line').className = 'step-line done';
  document.getElementById('step2Dot').className = 'step-dot active';

  Toast.show('Page created!');
});

// Step 2: Add first item
document.getElementById('addFirstItemForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const data = {
    pageSlug: createdSlug,
    name: document.getElementById('firstItemName').value,
    dailyRate: parseInt(document.getElementById('firstItemRate').value) || 0,
    description: document.getElementById('firstItemDesc').value,
    category: document.getElementById('firstItemCategory').value,
  };

  try {
    const result = await RMS.createListing(data);
    const fileInput = document.getElementById('firstItemPhoto');
    if (fileInput.files[0] && result && result.id) {
      await RMS.uploadListingImage(createdSlug, result.id, fileInput.files[0]);
    }
  } catch (err) {
    console.error('Add item failed:', err);
    Toast.show('Could not add item — you can add it from the dashboard.', 'error');
    finishSetup();
    return;
  }

  Toast.show('Item added!');
  finishSetup();
});

function finishSetup() {
  document.getElementById('step2Card').style.display = 'none';
  document.getElementById('step2Dot').className = 'step-dot done';
  document.getElementById('step2Dot').innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';

  const link = RMS.SITE_BASE + '/slices/borrower/browse/?slug=' + encodeURIComponent(createdSlug);
  document.getElementById('successLink').textContent = link;
  document.getElementById('successView').classList.add('visible');

  document.getElementById('copySuccessLink').addEventListener('click', function () {
    navigator.clipboard.writeText(link)
      .then(() => Toast.show('Link copied!'))
      .catch(() => Toast.show('Link: ' + link));
  });
}
