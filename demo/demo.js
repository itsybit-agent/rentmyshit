// FörRåd — Demo Mode
// Loads fake data, no backend calls. Used for marketing/preview.

window.RMS_PATHS = {
  itemDetail: '#', // No item-detail in demo, links go nowhere
};

// ── Mock data ──────────────────────────────────────────────────────────────────

const DEMO_OWNER = {
  name: 'Anna Lindqvist',
  location: 'Södermalm, Stockholm',
};

const DEMO_ITEMS = [
  {
    id: 'demo-1',
    itemId: 'demo-1',
    name: 'Coleman 3-person tent',
    category: 'outdoors',
    dailyRate: 120,
    status: 'available',
    emoji: '⛺',
    description: 'Roomy family tent, fits 3 comfortably. Includes tent pegs and carry bag. Used twice.',
  },
  {
    id: 'demo-2',
    itemId: 'demo-2',
    name: 'Kayak paddle (double)',
    category: 'outdoors',
    dailyRate: 80,
    status: 'available',
    emoji: '🛶',
    description: 'Adjustable aluminium double paddle, 220 cm. Grab it and go.',
  },
  {
    id: 'demo-3',
    itemId: 'demo-3',
    name: 'Primus camping stove',
    category: 'outdoors',
    dailyRate: 60,
    status: 'booked',
    emoji: '🔥',
    description: 'Compact backpacking stove. Gas not included.',
  },
  {
    id: 'demo-4',
    itemId: 'demo-4',
    name: 'Bosch cordless drill',
    category: 'tools',
    dailyRate: 100,
    status: 'available',
    emoji: '🔧',
    description: '18V, two batteries included. Great for IKEA days.',
  },
  {
    id: 'demo-5',
    itemId: 'demo-5',
    name: 'Aluminium step ladder (3m)',
    category: 'tools',
    dailyRate: 75,
    status: 'available',
    emoji: '🪜',
    description: 'Sturdy 3-step ladder, folds flat. Perfect for painting or changing bulbs.',
  },
  {
    id: 'demo-6',
    itemId: 'demo-6',
    name: 'Raclette + fondue set',
    category: 'kitchen',
    dailyRate: 90,
    status: 'available',
    emoji: '🧀',
    description: 'Electric raclette grill with 8 pans, converts to fondue. Feeds 6-8.',
  },
  {
    id: 'demo-7',
    itemId: 'demo-7',
    name: 'Punch bowl set (glass)',
    category: 'kitchen',
    dailyRate: 50,
    status: 'available',
    emoji: '🥂',
    description: 'Large glass bowl with 12 matching cups and ladle. Party essential.',
  },
  {
    id: 'demo-8',
    itemId: 'demo-8',
    name: 'Waffle iron (heart shape)',
    category: 'kitchen',
    dailyRate: 40,
    status: 'available',
    emoji: '🧇',
    description: 'Makes 4 heart-shaped waffles at a time. Because regular waffles are boring.',
  },
  {
    id: 'demo-9',
    itemId: 'demo-9',
    name: 'Projector + 80" screen',
    category: 'tech',
    dailyRate: 200,
    status: 'available',
    emoji: '🎥',
    description: 'Epson 1080p + pull-down screen. HDMI, great for movie nights or presentations.',
  },
  {
    id: 'demo-10',
    itemId: 'demo-10',
    name: 'Massage gun (Theragun)',
    category: 'tech',
    dailyRate: 80,
    status: 'booked',
    emoji: '💪',
    description: 'Theragun Mini, 3 attachments. Your muscles will thank you.',
  },
];

// ── Fake ItemCard photo override ───────────────────────────────────────────────

// Patch ItemCard to use emoji placeholders instead of broken img tags
const _originalRender = window.ItemCard.render.bind(window.ItemCard);
window.ItemCard.render = function(item, opts) {
  // Inject emoji into item so the card renderer can pick it up
  const enriched = { ...item, _demoEmoji: item.emoji };
  const html = _originalRender(enriched, opts);
  // Replace the SVG placeholder with our emoji one
  return html.replace(
    /<div class="photo-placeholder">[\s\S]*?<\/div>/,
    `<div class="photo-placeholder">${item.emoji || '📦'}<span>${item.category || ''}</span></div>`
  );
};

// ── Intercept API calls ────────────────────────────────────────────────────────

// Override requestBooking to be a no-op (success always)
window.RMS = window.RMS || {};
Object.assign(window.RMS, {
  requestBooking: async function() {
    // Simulate slight network delay
    await new Promise(r => setTimeout(r, 600));
    return { success: true };
  },
  apiFetch: async function() {
    // Block any real API calls in demo
    throw new Error('Demo mode — no backend');
  },
});

// ── Render ─────────────────────────────────────────────────────────────────────

let activeFilter = 'all';

function renderDemo() {
  const name = DEMO_OWNER.name;
  const slug = 'demo';
  const token = '';

  // Header
  document.getElementById('headerMount').innerHTML = Header.render({
    logoHref: '/demo/',
    tagline: `Shared by ${name}`,
    actions: `<a href="/slices/owner/create-page/" class="btn btn-ghost btn-sm">Create your own</a>`,
  });

  // Footer
  document.getElementById('footerMount').innerHTML = Footer.render({
    note: `Like what you see? <a href="/slices/owner/create-page/" style="color:var(--punch);text-decoration:none;">Create your free FörRåd page →</a>`,
  });

  // Item grid
  const grid = document.getElementById('itemGrid');
  grid.innerHTML = '';
  DEMO_ITEMS.forEach(item => {
    grid.insertAdjacentHTML('beforeend', ItemCard.render(item, { mode: 'friend', slug, token }));
  });
  updateCount();

  // Booking form in modal
  document.getElementById('requestFormMount').innerHTML = BookingForm.render({
    ownerName: name,
    mode: 'modal',
    formId: 'requestForm',
  });
  BookingForm.init('requestForm', {
    onSuccess() {
      // nothing extra needed — BookingForm already shows success state
    },
  });

  Modal.init();
}

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
    const nameEl = card.querySelector('.item-name');
    const nameText = nameEl ? nameEl.textContent.toLowerCase() : '';
    const category = card.dataset.category || '';
    const available = card.dataset.available === 'true';
    const matchesSearch = !search || nameText.includes(search);
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'available' && available) ||
      category === activeFilter;
    card.style.display = (matchesSearch && matchesFilter) ? '' : 'none';
  });
  updateCount();
}

function updateCount() {
  const visible = document.querySelectorAll('#itemGrid .item-card:not([style*="display: none"])').length;
  document.getElementById('itemCount').textContent = `${visible} item${visible !== 1 ? 's' : ''}`;
}

// Item request event — open modal
window.addEventListener('item:request', function(e) {
  const { id, name } = e.detail;
  document.getElementById('requestModalTitle').textContent = `Borrow "${name}"`;
  const form = document.getElementById('requestForm');
  if (form) form.dataset.listingId = id;
  Modal.open('requestModal');
});

// Boot
renderDemo();
