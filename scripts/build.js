const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const requiredFiles = [
  "assets/og-offer-en.png",
  "assets/og-offer-es.png",
  "index.html",
  "assets/styles.css",
  "assets/site.js",
  "assets/favicon.svg",
  "robots.txt",
  "sitemap.xml",
  "en/index.html",
  "en/start/index.html",
  "en/existing/index.html",
  "en/zero/index.html",
  "en/free-audit/index.html",
  "en/free-audit-existing/index.html",
  "en/free-audit-zero/index.html",
  "en/services/index.html",
  "en/about/index.html",
  "en/contact/index.html",
  "en/privacy/index.html",
  "en/terms/index.html",
  "en/resources/index.html",
  "en/projects/index.html",
  "es/index.html",
  "es/start/index.html",
  "es/existing/index.html",
  "es/zero/index.html",
  "es/free-audit/index.html",
  "es/free-audit-existing/index.html",
  "es/free-audit-zero/index.html",
  "es/services/index.html",
  "es/about/index.html",
  "es/contact/index.html",
  "es/privacy/index.html",
  "es/terms/index.html",
  "es/resources/index.html",
  "es/projects/index.html",
  "en/blog/index.html",
  "en/blog/what-is-a-local-lead-system/index.html",
  "en/blog/google-business-profile-new-storefront/index.html",
  "en/blog/cost-of-slow-lead-response/index.html",
  "en/blog/customers-buy-confidence/index.html",
  "en/blog/systems-beat-marketing/index.html",
  "es/blog/index.html",
  "es/blog/que-es-un-sistema-de-captacion-local/index.html",
  "es/blog/google-business-profile-nueva-vitrina/index.html",
  "es/blog/costo-de-responder-tarde/index.html",
  "es/blog/los-clientes-compran-confianza/index.html",
  "es/blog/sistemas-le-ganan-al-marketing/index.html",
  "blog/index.html",
  "public/images/blog/what-is-a-local-lead-system.jpg",
  "public/images/blog/google-business-profile-new-storefront.jpg",
  "public/images/blog/cost-of-slow-lead-response.jpg",
  "public/images/blog/customers-buy-confidence.jpg",
  "public/images/blog/systems-beat-marketing.jpg",
  "public/images/blog/blog-og.jpg",
  "public/images/projects/klinner.jpg",
  "public/images/projects/gladiadores.jpg",
  "public/images/projects/forge-demo.jpg",
  "public/images/demos/forge-hero.jpg",
  "public/images/demos/forge-train.jpg",
  "public/images/demos/forge-results.jpg",
  "public/images/projects/barber-demo.jpg",
  "public/images/demos/barber-hero.jpg",
  "public/images/demos/barber-tools.jpg",
  "public/images/demos/barber-cut.jpg",
  "demos/forge/index.html",
  "demos/forge/es/index.html",
  "demos/barber/index.html",
  "demos/barber/es/index.html",
  "free-audit/index.html",
  "services/index.html",
  "about/index.html",
  "projects/index.html",
  "contact/index.html",
  "privacy/index.html",
  "terms/index.html",
  "resources/index.html"
];

const requiredSnippets = new Map([
  ["index.html", [
    "Digital Solutions for Local Businesses",
    "BLYNX Systems",
    "Redirecting you to the best language version.",
    "English and Spanish support for local business growth.",
    "window.location.replace",
    "href=\"/en\"",
    "href=\"/es\"",
    "data-language-choice=\"en\"",
    "data-language-choice=\"es\""
  ]],
  ["en/start/index.html", [
    "What best describes your business?",
    "I already have a digital presence",
    "I’m starting from zero",
    "data-stage-choice=\"existing\"",
    "data-stage-choice=\"zero\"",
    "/en/existing",
    "/en/zero"
  ]],
  ["es/start/index.html", [
    "¿Qué describe mejor tu negocio?",
    "Ya tengo presencia digital",
    "Estoy empezando desde cero",
    "data-stage-choice=\"existing\"",
    "data-stage-choice=\"zero\"",
    "/es/existing",
    "/es/zero"
  ]],
  ["en/existing/index.html", [
    "Improve What You Already Have",
    "A Stronger Website",
    "Google Presence",
    "/en/free-audit-existing"
  ]],
  ["en/zero/index.html", [
    "Build Your Online Presence From Zero",
    "Professional Website",
    "Google Business Profile",
    "/en/free-audit-zero"
  ]],
  ["es/existing/index.html", [
    "Mejora lo que Ya Tienes",
    "Un Sitio Web Más Fuerte",
    "Presencia en Google",
    "/es/free-audit-existing"
  ]],
  ["es/zero/index.html", [
    "Construye tu Presencia en Línea Desde Cero",
    "Sitio Web Profesional",
    "Perfil de Empresa de Google",
    "/es/free-audit-zero"
  ]],
  ["en/index.html", [
    "Your Business.",
    "Stronger Online.",
    "Smarter with AI.",
    "Professional websites, automated customer follow-ups, and AI-powered content for local businesses.",
    "We build practical digital solutions that save you time and help your business operate more efficiently.",
    "Explore Our Services",
    "Request a Quote",
    "Three services. Clear prices.",
    "BLYNX Presence",
    "BLYNX Complete",
    "BLYNX Content",
    "Build Your Professional Online Presence.",
    "Your Website. Your Customers. Organized.",
    "Your Brand. Fresh Content. Every Month.",
    "What's included",
    "Starting at",
    "$1,500",
    "$2,500",
    "$300",
    "$600",
    "$750",
    "+$100/month",
    "$850",
    "Explore Content Plans",
    "HOW IT WORKS — CUSTOMER JOURNEY",
    "They find you",
    "Your Website. Ready in Approximately 2 Weeks.",
    "Week 1",
    "Week 2",
    "Landing Page",
    "$950",
    "$249",
    "Custom AI Solutions",
    "data-stage-banner",
    "/en/contact",
    "/en/services#blynx-presence",
    "/en/services#blynx-content",
    "/en/services#systems"
  ]],
  ["es/index.html", [
    "Tu negocio.",
    "Más fuerte en línea.",
    "Más inteligente con IA.",
    "Sitios web profesionales, seguimiento automático de clientes y contenido creado con IA para negocios locales.",
    "Conocer Nuestros Servicios",
    "Solicitar una Cotización",
    "Tres servicios. Precios claros.",
    "BLYNX Presence",
    "BLYNX Complete",
    "BLYNX Content",
    "Construye tu presencia profesional en línea.",
    "Tu sitio web. Tus clientes. Organizados.",
    "Tu marca. Contenido fresco. Cada mes.",
    "Qué incluye",
    "Desde",
    "$1,500",
    "$2,500",
    "$300",
    "$600",
    "$750",
    "+$100/mes",
    "$850",
    "Conocer los Planes de Content",
    "CÓMO FUNCIONA — RECORRIDO DEL CLIENTE",
    "Te encuentran",
    "Tu sitio web. Listo en aproximadamente 2 semanas.",
    "Semana 1",
    "Semana 2",
    "Landing Page",
    "$950",
    "$249",
    "Soluciones de IA a Medida",
    "data-stage-banner",
    "/es/contact",
    "/es/services#blynx-presence",
    "/es/services#blynx-content",
    "/es/services#systems"
  ]],
  ["en/free-audit/index.html", [
    "Request a Quote",
    "How It Works",
    "handleAuditSubmit",
    "Whether you need a website, customer follow-up or monthly content, this is the place to start.",
    "Website or Google Business Profile URL",
    "Add more business details",
    "name=\"businessStage\"",
    "data-business-stage-field",
    "name=\"preferredLanguage\"",
    "Privacy Policy",
    "Send My Quote Request"
  ]],
  ["en/free-audit-existing/index.html", [
    "Tell Us About Your Current Presence",
    "Website or Google Business Profile URL",
    "Service of Interest",
    "data-business-stage-default=\"existing\""
  ]],
  ["en/free-audit-zero/index.html", [
    "Plan Your Online Presence",
    "What do you need help with?",
    "name=\"mainGoal\"",
    "data-business-stage-default=\"zero\""
  ]],
  ["es/free-audit/index.html", [
    "Solicita una Cotización",
    "Cómo Funciona",
    "Impulsada por IA para mayor rapidez. Revisada por BLYNX para mayor calidad.",
    "handleAuditSubmit",
    "Ya sea que necesites un sitio web, seguimiento a clientes o contenido mensual, este es el lugar para empezar.",
    "Sitio web o enlace de Google Business Profile",
    "Agregar más detalles del negocio",
    "name=\"businessStage\"",
    "data-business-stage-field",
    "name=\"preferredLanguage\"",
    "Política de Privacidad",
    "Enviar mi Solicitud de Cotización",
    "Gracias. Hemos recibido tu solicitud de cotización."
  ]],
  ["en/services/index.html", [
    "BLYNX Presence",
    "Professional website, up to 5 pages",
    "Google Business Profile setup or basic optimization, subject to eligibility and access",
    "BLYNX Complete",
    "Everything in BLYNX Presence",
    "Automatic initial response to new inquiries",
    "BLYNX Content",
    "Content Images",
    "Content Videos",
    "Content Complete",
    "Everything included",
    "Estimated delivery",
    "Optional Website Care",
    "$99",
    "Optional Automation Support",
    "$350",
    "Add Instagram & Facebook Publishing",
    "$400",
    "$700",
    "$850",
    "Landing Page",
    "$950",
    "$249",
    "Custom AI Solutions",
    "Which service is right for my business?",
    "/en/contact"
  ]],
  ["es/services/index.html", [
    "BLYNX Presence",
    "Sitio web profesional de hasta 5 páginas",
    "Configuración u optimización básica del Perfil de Empresa de Google, sujeta a elegibilidad y acceso",
    "BLYNX Complete",
    "Todo lo de BLYNX Presence",
    "Respuesta automática inicial a nuevas solicitudes",
    "BLYNX Content",
    "Content Images",
    "Content Videos",
    "Content Complete",
    "Todo lo incluido",
    "Entrega estimada",
    "Website Care opcional",
    "$99",
    "Automation Support opcional",
    "$350",
    "Agrega publicación en Instagram y Facebook",
    "$400",
    "$700",
    "$850",
    "Landing Page",
    "$950",
    "$249",
    "Soluciones de IA a Medida",
    "¿Qué servicio es el adecuado para mi negocio?",
    "/es/contact"
  ]],
  ["es/free-audit-existing/index.html", [
    "Cuéntanos sobre tu Presencia Actual",
    "Sitio web o enlace de Google Business Profile",
    "Servicio de interés",
    "data-business-stage-default=\"existing\""
  ]],
  ["es/free-audit-zero/index.html", [
    "Planifica tu Presencia en Línea",
    "¿Con qué necesitas ayuda?",
    "name=\"mainGoal\"",
    "data-business-stage-default=\"zero\""
  ]],
  ["en/privacy/index.html", [
    "Privacy Policy",
    "Information We Collect",
    "BLYNX does not sell personal information"
  ]],
  ["es/privacy/index.html", [
    "Política de Privacidad",
    "Información que Recopilamos",
    "BLYNX no vende información personal"
  ]],
  ["en/terms/index.html", [
    "Terms of Service",
    "No Guarantee of Results",
    "Governing Law"
  ]],
  ["es/terms/index.html", [
    "Términos de Servicio",
    "Sin Garantía de Resultados",
    "Ley Aplicable"
  ]],
  ["en/resources/index.html", [
    "noindex",
    "/en/services"
  ]],
  ["es/resources/index.html", [
    "noindex",
    "/es/services"
  ]],
  ["en/blog/index.html", [
    "Practical Growth Systems for Local Businesses",
    "data-blog-filter=\"all\"",
    "Featured article",
    "min read",
    "/en/contact",
    "\"@type\":\"Blog\""
  ]],
  ["en/blog/what-is-a-local-lead-system/index.html", [
    "What Is a Local Lead System?",
    "\"@type\":\"BlogPosting\"",
    "data-blog-article=\"what-is-a-local-lead-system\"",
    "Request a Quote",
    "/en/contact",
    "Keep Reading",
    "article:published_time"
  ]],
  ["es/blog/index.html", [
    "Sistemas Prácticos de Crecimiento para Negocios Locales",
    "data-blog-filter=\"all\"",
    "Artículo destacado",
    "/es/contact",
    "hreflang=\"en\""
  ]],
  ["es/blog/que-es-un-sistema-de-captacion-local/index.html", [
    "¿Qué Es un Sistema de Captación Local?",
    "\"@type\":\"BlogPosting\"",
    "Solicitar una Cotización",
    "/en/blog/what-is-a-local-lead-system"
  ]],
  ["sitemap.xml", [
    "/en/blog</loc>",
    "/en/blog/what-is-a-local-lead-system</loc>",
    "/en/blog/systems-beat-marketing</loc>",
    "/es/blog</loc>",
    "/es/blog/que-es-un-sistema-de-captacion-local</loc>"
  ]],
  ["assets/site.js", [
    "blog_article_view",
    "blog_cta_click",
    "related_article_click",
    "blog_category_filter",
    "blynxPreferredLanguage",
    "preferredLanguage",
    "businessStage",
    "data-language-choice",
    "data-stage-choice",
    "trackEvent",
    "function handleAuditSubmit",
    "LEAD_WEBHOOK_URL"
  ]],
  ["en/projects/index.html", [
    "REAL BLYNX PROJECTS",
    "See the systems we have built.",
    "Klinner Cleaning & Maintenance",
    "Gladiadores App",
    "Fitness & Community Platform",
    "https://klinnercleaning.com",
    "Real Project",
    "View Live Project",
    "/public/images/projects/gladiadores.jpg"
  ]],
  ["es/projects/index.html", [
    "PROYECTOS REALES DE BLYNX",
    "Descubre los sistemas que hemos construido.",
    "Klinner Cleaning & Maintenance",
    "Gladiadores App",
    "Plataforma de Fitness y Comunidad",
    "https://klinnercleaning.com",
    "Proyecto real",
    "Ver proyecto",
    "/public/images/projects/gladiadores.jpg"
  ]]
]);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const file of requiredFiles) {
  const filePath = path.join(root, file);
  assert(fs.existsSync(filePath), `Missing required file: ${file}`);
}

// Runtime configuration checks. These are warnings, not failures, so a local build without
// secrets still works — but a production build missing either value is impossible to miss.
const leadWebhookUrl = (process.env.LEAD_WEBHOOK_URL || "").trim();
const ga4MeasurementId = (process.env.GA4_MEASUREMENT_ID || "").trim();
const warnings = [];

if (!leadWebhookUrl) {
  warnings.push(
    "LEAD_WEBHOOK_URL is not set. Lead forms will show their error state and NO lead will be captured."
  );
}
if (!ga4MeasurementId) {
  warnings.push("GA4_MEASUREMENT_ID is not set. Analytics will not be installed on the site.");
}

// When a value IS configured, prove it actually reached the generated HTML.
const auditPageHtml = fs.readFileSync(path.join(root, "en/free-audit/index.html"), "utf8");
assert(
  auditPageHtml.includes("window.BLYNX_CONFIG"),
  "Generated pages are missing the window.BLYNX_CONFIG runtime block."
);
if (leadWebhookUrl) {
  assert(
    auditPageHtml.includes(leadWebhookUrl),
    "LEAD_WEBHOOK_URL is set but did not reach the generated pages."
  );
}
if (ga4MeasurementId) {
  assert(
    auditPageHtml.includes(`googletagmanager.com/gtag/js?id=${ga4MeasurementId}`),
    "GA4_MEASUREMENT_ID is set but gtag.js did not reach the generated pages."
  );
  const gtagConfigCount = (auditPageHtml.match(/gtag\('config'/g) || []).length;
  assert(gtagConfigCount === 1, `GA4 must be initialised exactly once per page (found ${gtagConfigCount}).`);
}

for (const [file, snippets] of requiredSnippets.entries()) {
  const contents = fs.readFileSync(path.join(root, file), "utf8");
  for (const snippet of snippets) {
    assert(contents.includes(snippet), `Missing "${snippet}" in ${file}`);
  }
}

// Obsolete commercial claims that must not appear on any generated customer-facing page.
const obsoleteSnippets = [
  "$2,250",
  "$2,497",
  "$650",
  "+$850",
  "Free Audit",
  "Free audit",
  "free digital presence audit",
  "auditoría gratis de presencia digital",
  "free audit",
  "Auditoría Gratis",
  "Auditoría gratis",
  "auditoría gratis",
  "Digital Presence System",
  "Customer Requests &amp; ",
  "Customer Requests & ",
  "Best Value",
  "Mejor Valor",
  "Sistema de Presencia Digital",
  "System 1",
  "System 2",
  "System 3",
  "Sistema 1",
  "Sistema 2",
  "Sistema 3",
  "35% more jobs",
  "Social Media Management",
  // Content now includes 6 short videos/month and publishing is capped at 18 unique pieces.
  "4 short videos",
  "4 videos cortos",
  "up to 4 videos",
  "hasta 4 videos",
  "12 images + 4",
  "12 imágenes + 4",
  "up to 16",
  "hasta 16 piezas",
  "16 unique",
  "16 piezas únicas"
];
function listHtml(dir) {
  const out = [];
  const absolute = path.join(root, dir);
  if (!fs.existsSync(absolute)) return out;
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listHtml(relative));
    else if (entry.name.endsWith(".html")) out.push(relative);
  }
  return out;
}
for (const file of [...listHtml("en"), ...listHtml("es"), "index.html"]) {
  const contents = fs.readFileSync(path.join(root, file), "utf8");
  for (const snippet of obsoleteSnippets) {
    assert(!contents.includes(snippet), `Obsolete content "${snippet}" found in ${file}`);
  }
}

// Approved service images: each language page must reference only its own three
// files (never the other language's), and every derivative must exist on disk.
for (const [lang, other] of [["en", "es"], ["es", "en"]]) {
  for (const page of [`${lang}/index.html`, `${lang}/services/index.html`]) {
    const contents = fs.readFileSync(path.join(root, page), "utf8");
    for (const service of ["presence", "complete", "content"]) {
      const own = `blynx-service-${service}-${lang}`;
      assert(contents.includes(`/assets/images/${own}-1200-fallback.png`), `${page} must show ${own}`);
      assert(contents.includes(`/assets/images/${own}-1448.webp`), `${page} must link the enlarged ${own}`);
      assert(!contents.includes(`blynx-service-${service}-${other}`), `${page} must not reference the ${other.toUpperCase()} ${service} image`);
      for (const width of [480, 800, 1200, 1448]) {
        for (const ext of ["avif", "webp"]) {
          assert(fs.existsSync(path.join(root, "assets", "images", `${own}-${width}.${ext}`)), `Missing ${own}-${width}.${ext}`);
        }
      }
      assert(fs.existsSync(path.join(root, "assets", "images", `${own}-1200-fallback.png`)), `Missing ${own}-1200-fallback.png`);
    }
  }
}
// Approved extra-service images (Landing Page / Google Business Profile / Custom
// AI): same rule as above, plus the extra-service prices must stay as approved.
const extraImages = [
  { key: "landing-page", native: 1536 },
  { key: "google-business-profile", native: 1536 },
  { key: "custom-ai", native: 1672 }
];
for (const [lang, other, prices] of [
  ["en", "es", ["Starting at $950", "Starting at $249", "Custom quote"]],
  ["es", "en", ["Desde $950", "Desde $249", "Cotización personalizada"]]
]) {
  for (const page of [`${lang}/index.html`, `${lang}/services/index.html`]) {
    const contents = fs.readFileSync(path.join(root, page), "utf8");
    for (const { key, native } of extraImages) {
      const own = `blynx-extra-${key}-${lang}`;
      assert(contents.includes(`/assets/images/${own}-1200-fallback.png`), `${page} must show ${own}`);
      assert(contents.includes(`/assets/images/${own}-${native}.webp`), `${page} must link the enlarged ${own}`);
      assert(!contents.includes(`blynx-extra-${key}-${other}`), `${page} must not reference the ${other.toUpperCase()} ${key} image`);
      for (const width of [480, 800, 1200, native]) {
        for (const ext of ["avif", "webp"]) {
          assert(fs.existsSync(path.join(root, "assets", "images", `${own}-${width}.${ext}`)), `Missing ${own}-${width}.${ext}`);
        }
      }
      assert(fs.existsSync(path.join(root, "assets", "images", `${own}-1200-fallback.png`)), `Missing ${own}-1200-fallback.png`);
    }
    for (const price of prices) assert(contents.includes(price), `Extra service price "${price}" missing in ${page}`);
  }
}
// Content plan quantities: 6 videos / 18 unique pieces must read the same everywhere.
for (const [file, snippets] of [
  ["en/services/index.html", ["6 short videos monthly, up to 30 seconds each", "6 short videos, up to 30 seconds each", "up to 18 unique content pieces per month", "up to 12 images, up to 6 videos, or up to 18 pieces"]],
  ["es/services/index.html", ["6 videos cortos al mes, de hasta 30 segundos cada uno", "6 videos cortos, de hasta 30 segundos cada uno", "hasta 18 piezas de contenido únicas por mes", "hasta 12 imágenes, hasta 6 videos, o hasta 18 piezas"]],
  ["en/index.html", ["6 short videos", "12 images + 6 videos", "up to 18 unique pieces per month"]],
  ["es/index.html", ["6 videos cortos", "12 imágenes + 6 videos", "hasta 18 piezas únicas por mes"]]
]) {
  const contents = fs.readFileSync(path.join(root, file), "utf8");
  for (const snippet of snippets) assert(contents.includes(snippet), `Content quantities: missing "${snippet}" in ${file}`);
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

function copyRecursive(source, target) {
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      if (entry === "dist" || entry === "node_modules" || entry === ".git") continue;
      copyRecursive(path.join(source, entry), path.join(target, entry));
    }
    return;
  }

  fs.copyFileSync(source, target);
}

for (const entry of ["assets", "public", "en", "es", "demos", "blog", "free-audit", "services", "about", "contact", "privacy", "terms", "resources", "index.html", "404.html", "CNAME", "package.json", "robots.txt", "sitemap.xml"]) {
  const sourcePath = path.join(root, entry);
  if (!fs.existsSync(sourcePath)) continue;
  copyRecursive(sourcePath, path.join(dist, entry));
}

console.log("BLYNX static site build complete.");
console.log(`Output: ${path.relative(root, dist)}`);
console.log(`Lead endpoint: ${leadWebhookUrl ? "configured" : "MISSING"}`);
console.log(`GA4 analytics: ${ga4MeasurementId ? `configured (${ga4MeasurementId})` : "MISSING"}`);

for (const warning of warnings) {
  console.warn(`WARNING: ${warning}`);
}
