const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const requiredFiles = [
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
  "free-audit/index.html",
  "services/index.html",
  "about/index.html",
  "contact/index.html",
  "privacy/index.html",
  "terms/index.html",
  "resources/index.html"
];

const requiredSnippets = new Map([
  ["index.html", [
    "Digital Systems for Local Businesses",
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
    "Improve the Lead System You Already Have",
    "Visibility Tune-Up",
    "Lead Capture Review",
    "/en/free-audit-existing"
  ]],
  ["en/zero/index.html", [
    "Start From Zero With a Simple Lead System",
    "Google Business Profile Setup",
    "Conversion Landing Page",
    "/en/free-audit-zero"
  ]],
  ["es/existing/index.html", [
    "Mejora el Sistema de Captación que Ya Tienes",
    "Mejora de Visibilidad",
    "Revisión de Captación",
    "/es/free-audit-existing"
  ]],
  ["es/zero/index.html", [
    "Empieza Desde Cero con un Sistema Simple de Captación",
    "Configuración de Google Business Profile",
    "Landing Page de Conversión",
    "/es/free-audit-zero"
  ]],
  ["en/index.html", [
    "Digital systems built to help",
    "Most Local Businesses Lose Leads Without Realizing It",
    "Two systems. One clear goal.",
    "Digital Presence System",
    "Local Lead System",
    "Optional Add-On: Social Media Support",
    "Which system does your business need?",
    "What Your Lead System Can Connect",
    "LEAD CAPTURE FLOW EXAMPLE",
    "How a search becomes a real opportunity.",
    "They find you",
    "data-stage-banner",
    "/en/free-audit",
    "/en/services#systems"
  ]],
  ["es/index.html", [
    "Sistemas digitales creados para ayudar a crecer",
    "Muchos Negocios Locales Pierden Oportunidades Sin Darse Cuenta",
    "Dos sistemas. Un objetivo claro.",
    "Sistema de Presencia Digital",
    "Sistema Local de Captación y Seguimiento",
    "Complemento Opcional: Apoyo para Redes Sociales",
    "¿Qué sistema necesita tu negocio?",
    "Lo que Puede Conectar tu Sistema de Captación",
    "EJEMPLO DE FLUJO DE CAPTACIÓN",
    "Así se convierte una búsqueda en una oportunidad.",
    "Te encuentran",
    "data-stage-banner",
    "/es/free-audit",
    "/es/services#systems"
  ]],
  ["en/free-audit/index.html", [
    "Request Your Digital Audit",
    "handleAuditSubmit",
    "This audit works whether you already have a digital presence or you are starting from zero.",
    "Website or Google Business Profile URL",
    "Add more business details",
    "name=\"businessStage\"",
    "data-business-stage-field",
    "name=\"preferredLanguage\"",
    "Privacy Policy",
    "Submit My Free Audit Request"
  ]],
  ["en/free-audit-existing/index.html", [
    "Audit Your Current Digital Presence",
    "Website or Google Business Profile URL",
    "Main Goal",
    "data-business-stage-default=\"existing\""
  ]],
  ["en/free-audit-zero/index.html", [
    "Plan Your Digital Foundation",
    "What do you need help setting up?",
    "name=\"mainGoal\"",
    "data-business-stage-default=\"zero\""
  ]],
  ["es/free-audit/index.html", [
    "Solicita tu Auditoría Digital",
    "Impulsada por IA para mayor rapidez. Revisada por BLYNX para mayor calidad.",
    "handleAuditSubmit",
    "Esta auditoría funciona tanto si ya tienes presencia digital como si estás empezando desde cero.",
    "Sitio web o enlace de Google Business Profile",
    "Agregar más detalles del negocio",
    "name=\"businessStage\"",
    "data-business-stage-field",
    "name=\"preferredLanguage\"",
    "Política de Privacidad",
    "Enviar Solicitud de Auditoría Gratis",
    "Gracias. Hemos recibido tu solicitud de auditoría gratis."
  ]],
  ["en/services/index.html", [
    "Digital Presence System",
    "New website, landing page, or improvement of the existing website",
    "Local Lead System",
    "Everything included in the Digital Presence System, plus:",
    "Optional Add-On: Social Media Support",
    "Does social media management come included?",
    "/en/free-audit",
    "/en/contact"
  ]],
  ["es/services/index.html", [
    "Sistema de Presencia Digital",
    "Nuevo sitio web, landing page o mejora del sitio existente",
    "Sistema Local de Captación y Seguimiento",
    "Todo lo incluido en el Sistema de Presencia Digital, más:",
    "Complemento Opcional: Apoyo para Redes Sociales",
    "¿El manejo de redes sociales está incluido?",
    "/es/free-audit",
    "/es/contact"
  ]],
  ["es/free-audit-existing/index.html", [
    "Audita tu Presencia Digital Actual",
    "Sitio web o enlace de Google Business Profile",
    "Objetivo principal",
    "data-business-stage-default=\"existing\""
  ]],
  ["es/free-audit-zero/index.html", [
    "Planifica tu Base Digital",
    "¿Qué necesitas configurar?",
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
    "/en/free-audit",
    "\"@type\":\"Blog\""
  ]],
  ["en/blog/what-is-a-local-lead-system/index.html", [
    "What Is a Local Lead System?",
    "\"@type\":\"BlogPosting\"",
    "data-blog-article=\"what-is-a-local-lead-system\"",
    "Get Your Free Audit",
    "/en/free-audit",
    "Keep Reading",
    "article:published_time"
  ]],
  ["es/blog/index.html", [
    "Sistemas Prácticos de Crecimiento para Negocios Locales",
    "data-blog-filter=\"all\"",
    "Artículo destacado",
    "/es/free-audit",
    "hreflang=\"en\""
  ]],
  ["es/blog/que-es-un-sistema-de-captacion-local/index.html", [
    "¿Qué Es un Sistema de Captación Local?",
    "\"@type\":\"BlogPosting\"",
    "Solicitar Auditoría Gratis",
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

for (const [file, snippets] of requiredSnippets.entries()) {
  const contents = fs.readFileSync(path.join(root, file), "utf8");
  for (const snippet of snippets) {
    assert(contents.includes(snippet), `Missing "${snippet}" in ${file}`);
  }
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

for (const entry of ["assets", "public", "en", "es", "blog", "free-audit", "services", "about", "contact", "privacy", "terms", "resources", "index.html", "404.html", "CNAME", "package.json", "robots.txt", "sitemap.xml"]) {
  const sourcePath = path.join(root, entry);
  if (!fs.existsSync(sourcePath)) continue;
  copyRecursive(sourcePath, path.join(dist, entry));
}

console.log("BLYNX static site build complete.");
console.log(`Output: ${path.relative(root, dist)}`);
