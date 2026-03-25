// Brand config — change the name here and it updates everywhere
// Can also be overridden via localStorage('rms_brand_name') for testing

window.RMS_BRAND = {
  name: localStorage.getItem('rms_brand_name') || 'FörRåd',
  tagline: localStorage.getItem('rms_brand_tagline') || 'For the things between keeping and selling.',
  explainer: 'You bought it, loved it, now it lives in a corner. You\'re not ready to sell it — but it doesn\'t have to just sit there. Lend your stuff to people you actually know.',
  // Split rendering — e.g. ['För', 'Råd'] → styled parts
  parts: JSON.parse(localStorage.getItem('rms_brand_parts') || 'null') || ['För', 'Råd'],
};
