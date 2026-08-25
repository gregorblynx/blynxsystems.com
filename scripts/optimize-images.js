// One-off image derivative generator for the approved BLYNX product visuals.
// Reads the source PNGs in assets/images/ and writes responsive WebP/AVIF/PNG
// derivatives. Run manually with `node scripts/optimize-images.js` whenever a
// source asset changes (requires `npm install sharp --no-save`).
const sharp = require("sharp");
const path = require("path");
const { widthsForNative } = require("./lib/responsive-widths");

const DIR = path.join(__dirname, "..", "assets", "images");

const SOURCES = [
  // v1 source files and derivatives were removed (unreferenced, ~9MB) once
  // the v2 per-language set fully replaced them — see git history if a
  // rollback is ever needed.
  "blynx-connected-system-hero-en.png",
  "blynx-connected-system-hero-es.png",
  "blynx-system-1-digital-presence-en.png",
  "blynx-system-1-digital-presence-es.png",
  "blynx-system-2-capture-organization-en.png",
  "blynx-system-2-capture-organization-es.png",
  "blynx-system-3-follow-up-en.png",
  "blynx-system-3-follow-up-es.png"
];

async function run() {
  for (const file of SOURCES) {
    const base = file.replace(/\.png$/, "");
    const src = path.join(DIR, file);
    const metadata = await sharp(src).metadata();
    const widths = widthsForNative(metadata.width);
    for (const width of widths) {
      // width <= metadata.width is guaranteed by widthsForNative, so this
      // never enlarges — withoutEnlargement is a belt-and-suspenders check,
      // not a silent-cap: every generated file's filename now matches its
      // real pixel width.
      const img = sharp(src).resize({ width, withoutEnlargement: true });
      await img.clone().avif({ quality: 55, effort: 4 }).toFile(path.join(DIR, `${base}-${width}.avif`));
      await img.clone().webp({ quality: 72 }).toFile(path.join(DIR, `${base}-${width}.webp`));
    }
    // Single compressed PNG fallback for browsers without AVIF/WebP support.
    await sharp(src)
      .resize({ width: 1200, withoutEnlargement: true })
      .png({ compressionLevel: 9, palette: true })
      .toFile(path.join(DIR, `${base}-1200-fallback.png`));
    console.log(`done: ${file} (native ${metadata.width}px, generated ${widths.join(", ")})`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
