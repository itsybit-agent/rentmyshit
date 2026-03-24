// Brand config — change the name here and it updates everywhere
// Can also be overridden via localStorage('rms_brand_name') for testing

window.RMS_BRAND = {
  name: localStorage.getItem('rms_brand_name') || 'RentMyShit',
  tagline: localStorage.getItem('rms_brand_tagline') || 'Your stuff. Their use.',
  // Split rendering — e.g. ['Rent', 'My', 'Shit'] → first/last plain, middle accented
  // Or just use name as a single string
  parts: JSON.parse(localStorage.getItem('rms_brand_parts') || 'null') || null,
};
