// Reset PIN — slice.js

document.getElementById('headerMount').innerHTML = Header.render({ logoHref: '../../' });
document.getElementById('footerMount').innerHTML = Footer.render();

const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');
const token = params.get('t');

// If we have both slug and token, show the "set new PIN" form
if (slug && token) {
  document.getElementById('requestForm').style.display = 'none';
  document.getElementById('newPinForm').style.display = '';
}

// State 1: Request reset — submit email
document.getElementById('emailForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const email = document.getElementById('emailInput').value;
  const errorEl = document.getElementById('requestError');
  errorEl.style.display = 'none';

  const pageSlug = slug || params.get('slug');
  if (!pageSlug) {
    errorEl.textContent = 'Missing page slug — use the link from your dashboard.';
    errorEl.style.display = '';
    return;
  }

  try {
    await RMS.requestPinReset(pageSlug, email);
    document.getElementById('requestForm').style.display = 'none';
    document.getElementById('checkEmail').style.display = '';
  } catch (err) {
    errorEl.textContent = 'Something went wrong — please try again.';
    errorEl.style.display = '';
  }
});

// State 3: Set new PIN — submit form
document.getElementById('pinForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const newPin = document.getElementById('newPinInput').value;
  const errorEl = document.getElementById('confirmError');
  errorEl.style.display = 'none';

  if (!newPin) {
    errorEl.textContent = 'Please enter a new PIN.';
    errorEl.style.display = '';
    return;
  }

  try {
    await RMS.confirmPinReset(slug, token, newPin);
    document.getElementById('newPinForm').style.display = 'none';
    document.getElementById('resetSuccess').style.display = '';

    // Store new PIN and redirect to dashboard
    RMS.setOwnerSlug(slug);
    RMS.setOwnerPin(newPin);

    setTimeout(function () {
      window.location.href = '../dashboard/?slug=' + encodeURIComponent(slug);
    }, 2000);
  } catch (err) {
    if (err.status === 400) {
      errorEl.textContent = 'This reset link is invalid or has expired. Please request a new one.';
    } else {
      errorEl.textContent = 'Something went wrong — please try again.';
    }
    errorEl.style.display = '';
  }
});
