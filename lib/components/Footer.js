// Footer component
// Usage: Footer.render({ note }) => HTML string

window.Footer = {
  render(opts = {}) {
    const note = opts.note || 'No payment on platform. Transactions happen offline. Trust your friends.';
    const brand = window.RMS_BRAND || { name: 'FörRåd' };
    let logoInner;
    if (brand.parts && brand.parts.length === 2) {
      logoInner = `${brand.parts[0]}<span>${brand.parts[1]}</span>`;
    } else {
      logoInner = brand.name;
    }
    return `
      <footer class="site-footer">
        <div class="container">
          <div class="site-footer-inner">
            <span class="footer-logo">${logoInner}</span>
            <span class="footer-note">${note}</span>
          </div>
        </div>
      </footer>`;
  },
};
