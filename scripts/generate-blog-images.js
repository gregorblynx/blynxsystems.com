// Generates blog hero images with the Gemini image API ("Nano Banana").
// The API key is never stored in the repo — pass it per run:
//   GEMINI_API_KEY="..." node scripts/generate-blog-images.js [slug ...]
// With no arguments it generates every image; pass slugs to regenerate specific ones.
// Raw PNGs land in .image-work/ (gitignored); scripts/optimize-blog-images.sh
// converts them to compressed 1200x630 JPEGs in public/images/blog/.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const OUT_DIR = path.join(root, ".image-work");
const MODEL = process.env.IMAGE_MODEL || "gemini-3-pro-image";
const API_KEY = process.env.GEMINI_API_KEY;

const STYLE = [
  "Premium dark editorial illustration for a high-end business publication.",
  "Deep charcoal near-black background (#0d0d0d), warm gold (#f5b849) and amber (#c98925) as the only accent colors,",
  "soft cinematic rim lighting, subtle film grain, generous negative space, minimal elegant composition,",
  "conceptual and metaphorical rather than literal, painterly with fine detail.",
  "Absolutely no text, no words, no letters, no numbers, no logos, no watermarks, no user interface screenshots."
].join(" ");

const IMAGES = {
  "what-is-a-local-lead-system": `A glowing golden path of connected luminous nodes flowing left to right across a dark landscape at night, like a well-lit route through a city seen from above; each node a small warm beacon; the path ends at a bright open doorway radiating warm light. Conveys: an organized system guiding customers step by step. ${STYLE}`,
  "google-business-profile-new-storefront": `A charming small storefront glowing with warm golden light at dusk, seen framed inside the silhouette of a giant translucent map pin hovering above it; soft bokeh city darkness around; five small golden stars floating like fireflies near the pin. Conveys: your online profile is your storefront. ${STYLE}`,
  "cost-of-slow-lead-response": `A large elegant hourglass with luminous golden sand almost run out, and beside it a paper airplane made of warm glowing light flying away into darkness, leaving a fading gold trail; a subtle clock face ghosted in the dark background. Conveys: opportunity slipping away with time. ${STYLE}`,
  "customers-buy-confidence": `Two hands about to shake, sculpted from warm golden light against deep darkness, with a subtle protective arc of soft gold light above them like a shield; tiny stars drifting around the arc. Conveys: trust and confidence before hiring. ${STYLE}`,
  "systems-beat-marketing": `A large elegant glass funnel glowing with streams of golden water pouring in from above; the funnel channels every drop into a small radiant vessel below without spilling; in the dark background, faint ghostly droplets falling past unused. Conveys: a system that captures everything instead of leaking. ${STYLE}`,
  "og-image": `A wide cinematic composition: a dark cityscape at night where one small business storefront glows with intense warm golden light, connected by a rising luminous golden thread to a constellation of small lights above it. Premium, aspirational, calm. ${STYLE}`,
  "site-path-existing": `A modest small-business storefront on a dark quiet street, its left half still dim and worn, its right half radiating fresh warm golden light as if being restored and polished; fine golden light-lines tracing upgrades around the glowing half. Conveys: improving and strengthening what already exists. ${STYLE}`,
  "site-path-zero": `Luminous golden architectural blueprint lines rising out of dark empty ground, sketching the glowing wireframe of a small storefront; the entrance portion already solid, warm and lit while the rest is still elegant glowing outline. Conveys: building a digital foundation from zero. ${STYLE}`,
  "site-services-flow": `An elegant constellation of six small glowing golden spheres, each linked by fine threads of light, converging into one single bright flowing stream that pours toward a warm radiant glow at the right edge. Conveys: separate pieces connected into one working system. ${STYLE}`,
  "site-nashville": `A very wide panoramic silhouette of the Nashville Tennessee skyline at dusk, deep charcoal buildings with scattered warm golden window lights, a soft amber glow on the horizon behind the skyline, calm and premium. ${STYLE}`
};

const ASPECTS = { "site-nashville": "21:9" };

async function generate(slug, prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": API_KEY },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["IMAGE"],
          imageConfig: { aspectRatio: ASPECTS[slug] || "16:9" }
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`${slug}: HTTP ${response.status} ${await response.text()}`);
  }
  const data = await response.json();
  const part = (data.candidates?.[0]?.content?.parts || []).find((p) => p.inlineData);
  if (!part) {
    throw new Error(`${slug}: no image in response: ${JSON.stringify(data).slice(0, 400)}`);
  }
  const file = path.join(OUT_DIR, `${slug}.png`);
  fs.writeFileSync(file, Buffer.from(part.inlineData.data, "base64"));
  console.log(`OK ${slug} -> ${path.relative(root, file)}`);
}

async function main() {
  if (!API_KEY) {
    console.error("Set GEMINI_API_KEY. Example: GEMINI_API_KEY=... node scripts/generate-blog-images.js");
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const requested = process.argv.slice(2);
  const slugs = requested.length ? requested : Object.keys(IMAGES);
  for (const slug of slugs) {
    if (!IMAGES[slug]) {
      console.error(`Unknown slug: ${slug}. Valid: ${Object.keys(IMAGES).join(", ")}`);
      process.exit(1);
    }
    await generate(slug, IMAGES[slug]);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
