// One-off image derivative generator for the approved BLYNX product visuals.
// Reads the source PNGs in assets/images/ and writes responsive WebP/AVIF/PNG
// derivatives at fixed widths. Run manually with `node scripts/optimize-images.js`
// whenever a source asset changes (requires `npm install sharp --no-save`).
const sharp = require("sharp");
const path = require("path");

const DIR = path.join(__dirname, "..", "assets", "images");
const WIDTHS = [480, 800, 1200, 1672];

const SOURCES = [
  "blynx-connected-system-hero.png",
  "blynx-system-1-digital-presence.png",
  "blynx-system-2-capture-organization.png",
  "blynx-system-3-follow-up.png"
];

async function run() {
  for (const file of SOURCES) {
    const base = file.replace(/\.png$/, "");
    const src = path.join(DIR, file);
    for (const width of WIDTHS) {
      const img = sharp(src).resize({ width, withoutEnlargement: true });
      await img.clone().avif({ quality: 55, effort: 4 }).toFile(path.join(DIR, `${base}-${width}.avif`));
      await img.clone().webp({ quality: 72 }).toFile(path.join(DIR, `${base}-${width}.webp`));
    }
    // Single compressed PNG fallback for browsers without AVIF/WebP support.
    await sharp(src)
      .resize({ width: 1200, withoutEnlargement: true })
      .png({ compressionLevel: 9, palette: true })
      .toFile(path.join(DIR, `${base}-1200-fallback.png`));
    console.log(`done: ${file}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
