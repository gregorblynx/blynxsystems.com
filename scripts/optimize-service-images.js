// Generates responsive AVIF/WebP/PNG derivatives for the approved commercial
// images, EN + ES:
//   services -> BLYNX Presence / Complete / Content   (blynx-service-*)
//   extras   -> Landing Page / Google Business Profile / Custom AI Solutions
//               (blynx-extra-*)
//   hero     -> Home hero illustration (blynx-hero-restaurant-*), natively 1672x941
//
// The originals (BLYNX_<Name>_<LANG>.png) live in the owner's Google Drive and
// are intentionally NOT stored in the repository: assets/ is deployed as-is, so
// keeping several MB of PNGs there would only be shipped to visitors' CDN for
// nothing. Only the optimized copies are committed.
//
// Usage: node scripts/optimize-service-images.js <directory-with-the-PNGs> [services|extras|hero|all]
// (requires `npm install sharp --no-save`). Default set: all.
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { widthsForNative } = require("./lib/responsive-widths");

const OUT = path.join(__dirname, "..", "assets", "images");
const LANGS = ["EN", "ES"];

// source file stem -> output base name (without the -<lang> suffix)
const SETS = {
  services: [
    { file: "Presence", base: "blynx-service-presence" },
    { file: "Complete", base: "blynx-service-complete" },
    { file: "Content", base: "blynx-service-content" }
  ],
  extras: [
    { file: "Landing_Page", base: "blynx-extra-landing-page" },
    { file: "Google_Business_Profile", base: "blynx-extra-google-business-profile" },
    { file: "Custom_AI_Solutions", base: "blynx-extra-custom-ai" }
  ],
  hero: [{ file: "Hero_Restaurant_NoLogo", base: "blynx-hero-restaurant" }]
};

async function run() {
  const srcDir = process.argv[2];
  const which = process.argv[3] || "all";
  if (!srcDir || (which !== "all" && !SETS[which])) {
    console.error("Usage: node scripts/optimize-service-images.js <directory-with-the-PNGs> [services|extras|hero|all]");
    process.exit(1);
  }
  const items = which === "all" ? [...SETS.services, ...SETS.extras, ...SETS.hero] : SETS[which];
  for (const item of items) {
    for (const lang of LANGS) {
      const src = path.join(srcDir, `BLYNX_${item.file}_${lang}.png`);
      if (!fs.existsSync(src)) throw new Error(`Missing approved source: ${src}`);
      const base = `${item.base}-${lang.toLowerCase()}`;
      const meta = await sharp(src).metadata();
      const widths = widthsForNative(meta.width);
      for (const width of widths) {
        const img = sharp(src).resize({ width, withoutEnlargement: true });
        // Higher quality than the hero set: these images carry small UI text.
        await img.clone().avif({ quality: 68, effort: 5 }).toFile(path.join(OUT, `${base}-${width}.avif`));
        await img.clone().webp({ quality: 82 }).toFile(path.join(OUT, `${base}-${width}.webp`));
      }
      await sharp(src)
        .resize({ width: 1200, withoutEnlargement: true })
        .png({ compressionLevel: 9, palette: true, quality: 90 })
        .toFile(path.join(OUT, `${base}-1200-fallback.png`));
      console.log(`done: ${base} (native ${meta.width}x${meta.height}; widths ${widths.join(", ")})`);
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
