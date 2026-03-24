// Landing page — dual purpose:
// 1. Owner PIN login → dashboard
// 2. Friend access request → emails owner

const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug') || '';

if (!slug) {
  window.location.replace('../../owner/create-page/');
}

// Header + footer
document.getElementById('headerMount').innerHTML = Header.render({ logoHref: './' });
document.getElementById('footerMount').innerHTML = Footer.render();

// Load owner name for display
async function loadOwnerInfo() {
  try {
    // Use the browse endpoint (no auth needed for owner name)
    const res = await fetch(
      `${RMS.API_BASE}/pages/${encodeURIComponent(slug)}/browse`,
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (res.ok) {
      const data = await res.json();
      const name = data.ownerName || slug;
      const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      document.getElementById('ownerAvatar').textContent = initials;
      document.getElementById('ownerName').textContent = name;
      document.getElementById('ownerSub').textContent = `${data.items?.length || 0} item${(data.items?.length || 0) !== 1 ? 's' : ''} to borrow`;
      document.title = `${name} — RentMyStuff`;
    } else {
      // Page exists but is private — still show slug-based info
      document.getElementById('ownerAvatar').textContent = slug[0].toUpperCase();
      document.getElementById('ownerName').textContent = slug;
      document.getElementById('ownerSub').textContent = 'Private listing';
    }
  } catch (e) {
    document.getElementById('ownerAvatar').textContent = slug[0].toUpperCase();
    document.getElementById('ownerName').textContent = slug;
  }
}

loadOwnerInfo();

// PIN form → dashboard
document.getElementById('pinForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const pin = document.getElementById('pinInput').value;
  const errorEl = document.getElementById('pinError');
  errorEl.style.display = 'none';

  RMS.setOwnerSlug(slug);
  RMS.setOwnerPin(pin);

  try {
    await RMS.getOwnerPage(slug);
    // PIN correct — go to dashboard
    window.location.replace(`/slices/owner/dashboard/?slug=${encodeURIComponent(slug)}`);
  } catch (err) {
    RMS.setOwnerSlug('');
    RMS.setOwnerPin('');
    errorEl.textContent = err.status === 401 ? 'Incorrect PIN' : 'Could not connect — try again';
    errorEl.style.display = '';
  }
});

// Access request form → emails owner
document.getElementById('requestForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const email = document.getElementById('requestEmail').value;
  const message = document.getElementById('requestMsg').value;
  const errorEl = document.getElementById('requestError');
  errorEl.style.display = 'none';

  try {
    await RMS.requestAccess(slug, { email, message: message || null });
    document.getElementById('requestForm').style.display = 'none';
    document.getElementById('requestSuccess').style.display = '';
  } catch (err) {
    errorEl.textContent = err.status === 404 ? 'Page not found.' : 'Something went wrong — try again.';
    errorEl.style.display = '';
  }
});
