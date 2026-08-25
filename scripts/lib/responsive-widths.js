// Shared by scripts/optimize-images.js (which derivatives actually get
// generated) and scripts/generate-pages.js (which srcset descriptors get
// written). Keeping this in one place is the fix for the bug where a
// srcset advertised "1672w" for a file that withoutEnlargement had actually
// capped at 1448px — the two scripts must agree on real, on-disk widths.
const BASE_WIDTHS = [480, 800, 1200, 1672];

// Never advertise a width larger than the source's native width (that's
// upscaling a lie), and never skip straight past the native width to a
// smaller cap when the source could provide more — append the native width
// itself so the largest derivative is always the true source resolution.
function widthsForNative(nativeWidth) {
  const widths = BASE_WIDTHS.filter((w) => w <= nativeWidth);
  const maxWidth = widths.length ? Math.max(...widths) : 0;
  if (nativeWidth > maxWidth) widths.push(nativeWidth);
  return widths;
}

module.exports = { BASE_WIDTHS, widthsForNative };
