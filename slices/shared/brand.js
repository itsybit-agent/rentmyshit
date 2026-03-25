// Brand config — change the name here and it updates everywhere
// Can also be overridden via localStorage('rms_brand_name') for testing

window.RMS_BRAND = {
  name: localStorage.getItem('rms_brand_name') || 'FörRåd',
  tagline: localStorage.getItem('rms_brand_tagline') || 'Grejer du har. Folk du litar på.',
  // Split rendering — e.g. ['För', 'Råd'] → styled parts
  parts: JSON.parse(localStorage.getItem('rms_brand_parts') || 'null') || ['För', 'Råd'],
};
