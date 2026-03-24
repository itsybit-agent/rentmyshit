// Header (masthead) component
// Usage: Header.render({ tagline, actions }) => HTML string

window.Header = {
  // opts: { tagline?: string, actions?: string (inner HTML), logoHref?: string }
  render(opts = {}) {
    const tagline = opts.tagline || (window.RMS_BRAND && window.RMS_BRAND.tagline) || 'Trust-based peer rental';
    const logoHref = opts.logoHref || 'index.html';
    const actions = opts.actions || '';

    // Brand name rendering — supports parts array for styled split e.g. ['För', 'Råd']
    const brand = window.RMS_BRAND || { name: 'RentMyShit' };
    let logoInner;
    if (brand.parts && brand.parts.length === 2) {
      logoInner = `${brand.parts[0]}<span>${brand.parts[1]}</span>`;
    } else if (brand.parts && brand.parts.length === 3) {
      logoInner = `${brand.parts[0]}<span>${brand.parts[1]}</span>${brand.parts[2]}`;
    } else {
      logoInner = brand.name;
    }

    return `
      <header class="masthead">
        <div class="container">
          <div class="masthead-inner">
            <a href="${logoHref}" class="logo">
              <span class="logo-name">${logoInner}</span>
              <span class="logo-tagline">${tagline}</span>
            </a>
            <div class="masthead-actions">${actions}</div>
          </div>
        </div>
      </header>`;
  },
};
