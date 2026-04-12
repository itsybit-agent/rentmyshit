// Tests for slices/borrower/booking-status/
// Covers the critical email-link flow and all status states.
const { test, expect } = require('@playwright/test');

const BASE_BOOKING = {
  bookingId: 'booking-123',
  startDate: '2026-04-20',
  endDate:   '2026-04-23',
  message:   'Can I borrow this please?',
  requestedAt: '2026-04-12T10:00:00Z',
  item: { itemId: 'item-1', name: 'Camping Tent', dailyRate: 100, photoUrl: null, pageSlug: 'sarah-k' },
  owner: { name: 'Sarah K' },
};

function mockView(page, urlPattern, body) {
  return page.route(urlPattern, route => route.fulfill({ json: body }));
}

test.describe('Booking status — email-link (token-only) flow', () => {
  test('loads booking via token when no bookingId in URL', async ({ page }) => {
    await mockView(page, '**/bookings/by-token/tok123/view', {
      ...BASE_BOOKING,
      status: 'pending',
    });

    await page.goto('/slices/borrower/booking-status/?token=tok123');

    await expect(page.locator('#statusTitle')).toHaveText('Request pending');
    await expect(page.locator('#detailRows')).toContainText('Camping Tent');
    await expect(page.locator('#detailRows')).toContainText('3 days');
    await expect(page.locator('#detailRows')).toContainText('300 kr');
  });

  test('loads booking via bookingId + token', async ({ page }) => {
    await mockView(page, '**/bookings/booking-123/view*', {
      ...BASE_BOOKING,
      status: 'pending',
    });

    await page.goto('/slices/borrower/booking-status/?id=booking-123&token=tok123');

    await expect(page.locator('#statusTitle')).toHaveText('Request pending');
  });

  test('end-to-end: /r/{token} routes to booking-status and renders', async ({ page }) => {
    await mockView(page, '**/bookings/by-token/tok-e2e/view', {
      ...BASE_BOOKING,
      status: 'pending',
    });

    await page.goto('/r/tok-e2e');

    await expect(page).toHaveURL(/booking-status/);
    await expect(page.locator('#statusTitle')).toHaveText('Request pending');
    await expect(page.locator('#detailRows')).toContainText('Camping Tent');
  });
});

test.describe('Booking status — status states', () => {
  async function renderWith(page, status, ownerExtra = {}) {
    const booking = { ...BASE_BOOKING, status, owner: { ...BASE_BOOKING.owner, ...ownerExtra } };
    await mockView(page, '**/bookings/by-token/*/view', booking);
    await page.goto('/slices/borrower/booking-status/?token=tok123');
    await page.waitForSelector('#statusTitle:not(:empty)');
    return page;
  }

  test('pending — shows pending title and action buttons', async ({ page }) => {
    await renderWith(page, 'pending');
    await expect(page.locator('#statusTitle')).toHaveText('Request pending');
    await expect(page.locator('#actionRow')).toContainText('Edit dates');
    await expect(page.locator('#actionRow')).toContainText('Cancel booking');
    await expect(page.locator('#contactInfo')).not.toBeVisible();
  });

  test('accepted — shows accepted title and owner contact info', async ({ page }) => {
    await renderWith(page, 'accepted', { swishNumber: '0701234567', location: 'Södermalm' });
    await expect(page.locator('#statusTitle')).toHaveText('Booking accepted!');
    await expect(page.locator('#contactInfo')).toBeVisible();
    await expect(page.locator('#contactDetails')).toContainText('0701234567');
    await expect(page.locator('#contactDetails')).toContainText('Södermalm');
    await expect(page.locator('#actionRow')).toContainText('Cancel booking');
  });

  test('declined — shows declined title and browse-again link', async ({ page }) => {
    await renderWith(page, 'declined');
    await expect(page.locator('#statusTitle')).toHaveText('Request declined');
    await expect(page.locator('#actionRow a')).toContainText('Try different dates');
    await expect(page.locator('#contactInfo')).not.toBeVisible();
  });

  test('cancelled — shows cancelled title with no action buttons', async ({ page }) => {
    await renderWith(page, 'cancelled');
    await expect(page.locator('#statusTitle')).toHaveText('Booking cancelled');
    await expect(page.locator('#actionRow')).toBeEmpty();
  });

  test('returned — shows returned title with no action buttons', async ({ page }) => {
    await renderWith(page, 'returned');
    await expect(page.locator('#statusTitle')).toHaveText('Item returned');
    await expect(page.locator('#actionRow')).toBeEmpty();
  });
});

test.describe('Booking status — actions', () => {
  test('cancel booking — calls API, shows toast, reloads', async ({ page }) => {
    let cancelCalled = false;
    await mockView(page, '**/bookings/by-token/*/view', { ...BASE_BOOKING, status: 'pending' });
    await page.route('**/bookings/booking-123', route => {
      if (route.request().method() === 'DELETE') {
        cancelCalled = true;
        route.fulfill({ json: { bookingId: 'booking-123', cancelled: true } });
      } else {
        route.continue();
      }
    });

    await page.goto('/slices/borrower/booking-status/?token=tok123');
    page.once('dialog', d => d.accept());
    await page.locator('#actionRow button:has-text("Cancel booking")').click();

    await expect(page.locator('#toast')).toContainText('Booking cancelled');
    expect(cancelCalled).toBe(true);
  });

  test('edit dates — submits new dates, shows toast', async ({ page }) => {
    let editCalled = false;
    await mockView(page, '**/bookings/by-token/*/view', { ...BASE_BOOKING, status: 'pending' });
    await page.route('**/bookings/booking-123', route => {
      if (route.request().method() === 'PUT') {
        editCalled = true;
        route.fulfill({ json: { bookingId: 'booking-123' } });
      } else {
        route.continue();
      }
    });

    await page.goto('/slices/borrower/booking-status/?token=tok123');
    await page.locator('#actionRow button:has-text("Edit dates")').click();
    await expect(page.locator('#editDatesForm')).toHaveClass(/visible/);

    await page.fill('#editStart', '2026-05-01');
    await page.fill('#editEnd', '2026-05-04');
    await page.locator('#editForm button[type="submit"]').click();

    await expect(page.locator('#toast')).toContainText('Dates updated');
    expect(editCalled).toBe(true);
  });

  test('shows error state when API fails', async ({ page }) => {
    await page.route('**/bookings/by-token/*/view', route =>
      route.fulfill({ status: 404, json: {} })
    );

    await page.goto('/slices/borrower/booking-status/?token=badtoken');

    await expect(page.locator('#statusTitle')).toContainText('Could not load booking');
  });

  test('shows no-booking message when no token or id', async ({ page }) => {
    await page.goto('/slices/borrower/booking-status/');
    await expect(page.locator('#statusTitle')).toContainText('No booking found');
  });
});
