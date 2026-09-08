const legacySlug = new URLSearchParams(window.location.search).get('article');
if (legacySlug && /^[a-z0-9-]+$/.test(legacySlug)) {
  window.location.replace(`research/${encodeURIComponent(legacySlug)}.html`);
}
