// Generates responsive AVIF/WebP/PNG derivatives for the six approved service
// images (BLYNX Presence / Complete / Content, EN + ES).
//
// The originals (BLYNX_<Service>_<LANG>.png, 1448x1086) live in the owner's
// Google Drive and are intentionally NOT stored in the repository: assets/ is
// deployed as-is, so keeping ~11MB of PNGs there would only be shipped to
// visitors' CDN for nothing. Only the optimized copies are committed.
//
// Usage: node scripts/optimize-service-images.js <directory-with-the-six-PNGs>
// (requires `npm install sharp --no-save`).
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { widthsForNative } = require("./lib/responsive-widths");

const OUT = path.join(__dirname, "..", "assets", "images");
const SERVICES = ["Presence", "Complete", "Content"];
const LANGS = ["EN", "ES"];

async function run() {
  const srcDir = process.argv[2];
  if (!srcDir) {
    console.error("Usage: node scripts/optimize-service-images.js <directory-with-the-six-PNGs>");
    process.exit(1);
  }
  for (const service of SERVICES) {
    for (const lang of LANGS) {
      const src = path.join(srcDir, `BLYNX_${service}_${lang}.png`);
      if (!fs.existsSync(src)) throw new Error(`Missing approved source: ${src}`);
      const base = `blynx-service-${service.toLowerCase()}-${lang.toLowerCase()}`;
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
