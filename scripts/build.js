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
  "es/resources/index.html",
  "free-audit/index.html",
  "services/index.html",
  "about/index.html",
  "contact/index.html",
  "resources/index.html"
];

const requiredSnippets = new Map([
  ["index.html", [
    "Local Lead Systems for Service Businesses",
    "Choose your preferred language to continue.",
    "English and Spanish support for local business growth.",
    "href=\"/en/start\"",
    "href=\"/es/start\"",
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
    "Local Lead Systems for Service Businesses",
    "Most Local Businesses Lose Leads Without Realizing It",
    "The System We Build",
    "Two Ways We Can Help",
    "Digital Foundation",
    "Start From Zero",
    "data-stage-banner",
    "Track Opportunities",
    "/en/free-audit",
    "/en#process"
  ]],
  ["es/index.html", [
    "Sistemas de Captación para Negocios Locales",
    "Muchos Negocios Locales Pierden Oportunidades Sin Darse Cuenta",
    "El Sistema que Construimos",
    "Base Digital + Sistema de Captación",
    "Dos Formas en que Podemos Ayudarte",
    "Empezar Desde Cero",
    "data-stage-banner",
    "Organizar Leads",
    "/es/free-audit",
    "/es#process"
  ]],
  ["en/free-audit/index.html", [
    "Get Your Free Lead System Audit",
    "handleAuditSubmit",
    "This audit works whether you already have a digital presence or you are starting from zero.",
    "Do you currently have a website?",
    "Do you have a Google Business Profile?",
    "name=\"businessStage\"",
    "data-business-stage-field",
    "Preferred Language",
    "Submit My Free Audit Request"
  ]],
  ["en/free-audit-existing/index.html", [
    "Audit Your Current Digital Presence",
    "Website URL",
    "Google Business Profile Link",
    "What do you want to improve?",
    "data-business-stage-default=\"existing\""
  ]],
  ["en/free-audit-zero/index.html", [
    "Plan Your Digital Foundation",
    "What do you need help setting up?",
    "Conversion landing page",
    "name=\"foundationNeeds\"",
    "data-business-stage-default=\"zero\""
  ]],
  ["es/free-audit/index.html", [
    "Solicita tu Auditoría Gratis del Sistema de Captación",
    "Impulsada por IA para mayor rapidez. Revisada por BLYNX para mayor calidad.",
    "handleAuditSubmit",
    "Esta auditoría funciona tanto si ya tienes presencia digital como si estás empezando desde cero.",
    "¿Actualmente tienes sitio web?",
    "¿Tienes Google Business Profile?",
    "name=\"businessStage\"",
    "data-business-stage-field",
    "Idioma preferido",
    "Enviar Solicitud de Auditoría Gratis",
    "Gracias. Hemos recibido tu solicitud de auditoría gratis."
  ]],
  ["es/free-audit-existing/index.html", [
    "Audita tu Presencia Digital Actual",
    "Sitio web",
    "Link de Google Business Profile",
    "¿Qué quieres mejorar?",
    "data-business-stage-default=\"existing\""
  ]],
  ["es/free-audit-zero/index.html", [
    "Planifica tu Base Digital",
    "¿Qué necesitas configurar?",
    "Landing page de conversión",
    "name=\"foundationNeeds\"",
    "data-business-stage-default=\"zero\""
  ]],
  ["assets/site.js", [
    "blynxPreferredLanguage",
    "preferredLanguage",
    "businessStage",
    "data-language-choice",
    "data-stage-choice",
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

for (const entry of ["assets", "en", "es", "free-audit", "services", "about", "contact", "resources", "index.html", "404.html", "CNAME", "package.json", "robots.txt", "sitemap.xml"]) {
  const sourcePath = path.join(root, entry);
  if (!fs.existsSync(sourcePath)) continue;
  copyRecursive(sourcePath, path.join(dist, entry));
}

console.log("BLYNX static site build complete.");
console.log(`Output: ${path.relative(root, dist)}`);
