// Footer component
// Usage: Footer.render({ note }) => HTML string

window.Footer = {
  render(opts = {}) {
    const note = opts.note || 'No payment on platform. Transactions happen offline. Trust your friends.';
    return `
      <footer class="site-footer">
        <div class="container">
          <div class="site-footer-inner">
            <span class="footer-logo">Rent<span>My</span>Shit</span>
            <span class="footer-note">${note}</span>
          </div>
        </div>
      </footer>`;
  },
};
