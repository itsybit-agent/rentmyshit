// Header (masthead) component
// Usage: Header.render({ tagline, actions }) => HTML string

window.Header = {
  // opts: { tagline?: string, actions?: string (inner HTML), logoHref?: string }
  render(opts = {}) {
    const tagline = opts.tagline || 'Trust-based peer rental';
    const logoHref = opts.logoHref || 'index.html';
    const actions = opts.actions || '';
    return `
      <header class="masthead">
        <div class="container">
          <div class="masthead-inner">
            <a href="${logoHref}" class="logo">
              <span class="logo-name">Rent<span>My</span>Shit</span>
              <span class="logo-tagline">${tagline}</span>
            </a>
            <div class="masthead-actions">${actions}</div>
          </div>
        </div>
      </header>`;
  },
};
