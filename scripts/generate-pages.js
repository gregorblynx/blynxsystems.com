const fs = require("fs");
const path = require("path");
const { loadArticles, formatDate, CATEGORIES } = require("./blog");
const { widthsForNative } = require("./lib/responsive-widths");

const root = path.resolve(__dirname, "..");

// Spanish articles can be added later under content/blog/es/ — the blog nav link,
// pages, and sitemap entries for a language only appear once articles exist for it.
const blogArticles = {
  en: loadArticles("en"),
  es: loadArticles("es")
};

const SITE_URL = "https://www.blynxsystems.com";
const OG_IMAGE = `${SITE_URL}/assets/og-image.jpg`;
// Approved per-language social share cards for the two homepages (and the
// root language-gate, which defaults to the EN card since it's the
// x-default/English-flavored entry point). Not used elsewhere — every other
// page keeps the generic OG_IMAGE above.
const OG_IMAGE_EN = `${SITE_URL}/assets/og-image-en.png`;
const OG_IMAGE_ES = `${SITE_URL}/assets/og-image-es.png`;

// Runtime configuration, read from the environment at build time so that neither the lead
// endpoint nor the analytics ID is hardcoded across source files. Set both in the Vercel
// project (Settings -> Environment Variables) and locally in .env for local builds.
//
//   LEAD_WEBHOOK_URL    Google Apps Script Web App /exec URL that stores the leads.
//   GA4_MEASUREMENT_ID  Google Analytics 4 Measurement ID, format G-XXXXXXXXXX.
//
// When a value is absent, the corresponding feature is simply not emitted: no fake endpoint,
// no fake analytics. assets/site.js then fails closed and shows the form error state.
const LEAD_WEBHOOK_URL = (process.env.LEAD_WEBHOOK_URL || "").trim();
const GA4_MEASUREMENT_ID = (process.env.GA4_MEASUREMENT_ID || "").trim();

if (GA4_MEASUREMENT_ID && !/^G-[A-Z0-9]{6,}$/.test(GA4_MEASUREMENT_ID)) {
  throw new Error(
    `GA4_MEASUREMENT_ID must look like G-XXXXXXXXXX (received: ${GA4_MEASUREMENT_ID})`
  );
}

if (LEAD_WEBHOOK_URL && !/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(LEAD_WEBHOOK_URL)) {
  throw new Error(
    "LEAD_WEBHOOK_URL must be a Google Apps Script Web App URL ending in /exec."
  );
}

// Emitted in <head> on every real page: the runtime config for assets/site.js, plus gtag.js
// when — and only when — a GA4 Measurement ID is configured. GA4 is initialised exactly once
// per page here, so no other file may call gtag('config', ...) again.
function runtimeHead() {
  const config = `<script>window.BLYNX_CONFIG={leadWebhookUrl:${JSON.stringify(
    LEAD_WEBHOOK_URL
  )},ga4MeasurementId:${JSON.stringify(GA4_MEASUREMENT_ID)}};</script>`;

  if (!GA4_MEASUREMENT_ID) return config;

  return `${config}
    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA4_MEASUREMENT_ID}');
    </script>`;
}
const LEGAL_EFFECTIVE_DATE = "July 9, 2026";
const BUSINESS = {
  legalName: "BLYNX Systems",
  displayName: "BLYNX Systems",
  shortName: "BLYNX",
  email: "hello@blynxsystems.com",
  phone: "",
  location: "Tennessee, United States",
  city: "Nashville",
  region: "TN",
  country: "US",
  serviceArea: "United States",
  instagramHandle: "",
  instagramUrl: ""
};

function phoneDigits() {
  return String(BUSINESS.phone || "").replace(/\D/g, "");
}

function hasConfiguredPhone() {
  const value = String(BUSINESS.phone || "").trim();
  return Boolean(value && !value.includes("[BLYNX_PHONE]") && phoneDigits().length >= 10);
}

function phoneDisplay() {
  const digits = phoneDigits();
  if (!hasConfiguredPhone()) return "";
  const normalized = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (normalized.length !== 10) return BUSINESS.phone;
  return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
}

function phoneHref() {
  const digits = phoneDigits();
  if (!hasConfiguredPhone()) return "";
  return `tel:+${digits.length === 10 ? `1${digits}` : digits}`;
}

// Centralized escaping for dynamic HTML attribute values (alt text, aria
// labels, etc.) — anything interpolated straight into a double-quoted
// attribute must go through this or a literal " in the source string (e.g.
// a quoted tagline) truncates the attribute and corrupts the markup.
function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function emailLink(label = BUSINESS.email) {
  return `<a href="mailto:${BUSINESS.email}" data-analytics-event="email_click">${label}</a>`;
}

function phoneLink() {
  if (!hasConfiguredPhone()) return "";
  return `<a href="${phoneHref()}" data-analytics-event="phone_click">${phoneDisplay()}</a>`;
}

function instagramLink(label = `@${BUSINESS.instagramHandle}`) {
  if (!BUSINESS.instagramUrl || BUSINESS.instagramUrl.includes("[INSTAGRAM_URL]")) return "";
  return `<a href="${BUSINESS.instagramUrl}" target="_blank" rel="noopener noreferrer" data-analytics-event="instagram_click">${label}</a>`;
}

const contactIcons = {
  email:
    '<svg viewBox="0 0 24 24" focusable="false"><path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/></svg>',
  phone:
    '<svg viewBox="0 0 24 24" focusable="false"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.91.32 1.8.59 2.65a2 2 0 0 1-.45 2.11L8.09 9.64a16 16 0 0 0 6.27 6.27l1.16-1.16a2 2 0 0 1 2.11-.45c.85.27 1.74.47 2.65.59A2 2 0 0 1 22 16.92z"/></svg>',
  location:
    '<svg viewBox="0 0 24 24" focusable="false"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  serviceArea:
    '<svg viewBox="0 0 24 24" focusable="false"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/></svg>',
  instagram:
    '<svg viewBox="0 0 24 24" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>'
};

function contactLine(icon, content) {
  if (!content) return "";
  return `<span class="contact-line"><span class="contact-icon" aria-hidden="true">${contactIcons[icon]}</span><span>${content}</span></span>`;
}

function structuredData(lang, title, description, canonicalUrl, breadcrumbs = []) {
  const orgDescription =
    lang === "es"
      ? "BLYNX crea sistemas digitales que ayudan a negocios locales a ser encontrados, generar confianza, captar oportunidades y dar seguimiento más rápido."
      : "BLYNX builds digital systems that help local businesses get found, build trust, capture opportunities, and follow up faster.";
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#organization`,
        name: BUSINESS.legalName,
        description: orgDescription,
        url: `${SITE_URL}/`,
        email: BUSINESS.email,
        image: OG_IMAGE,
        logo: OG_IMAGE,
        ...(hasConfiguredPhone() ? { telephone: phoneHref().replace("tel:", "") } : {}),
        address: {
          "@type": "PostalAddress",
          addressLocality: BUSINESS.city,
          addressRegion: BUSINESS.region,
          addressCountry: BUSINESS.country
        },
        areaServed: { "@type": "Country", name: BUSINESS.serviceArea },
        knowsLanguage: ["en", "es"]
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: BUSINESS.displayName,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: lang === "es" ? "es" : "en"
      },
      {
        "@type": "WebPage",
        "@id": canonicalUrl,
        url: canonicalUrl,
        name: title,
        description: description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        inLanguage: lang === "es" ? "es" : "en"
      }
    ]
  };
  if (breadcrumbs.length) {
    data["@graph"].push({
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    });
  }
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

const copy = {
  en: {
    code: "en",
    htmlLang: "en",
    titleSuffix: "BLYNX Systems",
    skip: "Skip to content",
    brandAria: "BLYNX home",
    navAria: "Primary navigation",
    openMenu: "Open menu",
    switchAria: "Language switcher",
    footer: "Built for local business growth.",
    nav: {
      home: "Home",
      services: "Systems",
      howItWorks: "How It Works",
      about: "About",
      projects: "Projects",
      resources: "Resources",
      contact: "Contact",
      blog: "Blog",
      audit: "Free Audit",
      privacy: "Privacy Policy",
      terms: "Terms of Service"
    },
    blogPage: {
      title: "Practical Growth Systems for Local Businesses | BLYNX Blog",
      description: "Practical guides on getting found, building trust, capturing leads, and following up faster — written for local service business owners.",
      eyebrow: "BLYNX Blog",
      h1: "Practical Growth Systems for Local Businesses",
      subtitle: "Learn how to get found, build trust, capture more opportunities, and follow up before potential customers choose someone else.",
      featuredLabel: "Featured article",
      latestTitle: "Latest Articles",
      filterLabel: "Filter articles by category",
      allLabel: "All",
      minRead: "min read",
      updatedLabel: "Updated",
      breadcrumbHome: "Home",
      breadcrumbBlog: "Blog",
      relatedTitle: "Keep Reading",
      aboutTitle: "BLYNX",
      aboutText: "BLYNX builds practical local lead systems that help service businesses get found, build trust, capture opportunities, and follow up faster.",
      aboutLink: "Learn more about BLYNX",
      ctaTitle: "Not sure what your business is missing online?",
      ctaText: "Get a free digital presence audit and see where your business may be losing visibility, trust, or qualified opportunities.",
      ctaButton: "Get Your Free Audit"
    },
    cta: {
      audit: "Request a Free Audit",
      auditLong: "Request Your Free Audit",
      auditShort: "Free Audit",
      findSystem: "Find the Right System",
      services: "Explore Our Systems",
      contact: "Contact BLYNX"
    },
    home: {
      title: "Digital Systems for Local Businesses | BLYNX Systems",
      description: "BLYNX builds digital systems that help local businesses get found, build trust, capture opportunities, organize them, and follow up. Three systems, starting at $1,500.",
      ogTitle: "Digital Systems for Local Businesses | BLYNX",
      ogDescription: "BLYNX connects digital presence, inquiries, organization and follow-up in one clear system for local businesses.",
      ogImage: OG_IMAGE_EN,
      ogImageWidth: 1774,
      ogImageHeight: 887,
      ogImageAlt: "BLYNX five-step system: Be Found, Build Trust, Receive Inquiries, Organize Opportunities, Follow Up.",
      eyebrow: "Digital systems for local businesses",
      headline: 'Get found.<br>Get contacted.<br><span class="text-gold">Stay organized.</span>',
      subtitle: [
        "BLYNX connects your digital presence, inquiries and follow-up in one clear system built for local businesses."
      ],
      trust: ["Be Found", "Build Trust", "Capture", "Organize", "Follow Up"],
      problemEyebrow: "The real problem",
      problemTitle: "The opportunity arrives. Then what?",
      problemCopy: "Most local businesses don’t only have a visibility problem — they have a handoff problem. The work was there. It just wasn’t tracked.",
      beforeAfter: {
        beforeLabel: "Before BLYNX",
        afterLabel: "After BLYNX",
        before: ["Scattered inquiries", "Unclear digital presence", "No visible next step", "Missed opportunities", "Inconsistent follow-up"],
        after: ["Professional presence", "Clear contact path", "Organized opportunities", "Visible status and next step", "Defined follow-up process"]
      },
      stageBanner: {
        existing: "You already have a digital presence. Any of our three systems can apply — we’ll help you find the right one.",
        zero: "Starting from zero? Any of our three systems can apply — we’ll help you find the right one."
      },
      aboutEyebrow: "About BLYNX",
      aboutTitle: "Built for Local Service Businesses",
      aboutCopy: "BLYNX builds practical digital systems focused on visibility, trust, organized opportunities, and follow-up — not disconnected marketing services.",
      aboutBullets: [
        "Based in Nashville, Tennessee.",
        "Serving local businesses across the United States.",
        "English and Spanish support available."
      ],
      statItems: [
        ["Be Found", "Google visibility, reviews, local trust signals, and clearer online presence."],
        ["Capture & Organize", "Smart forms and an organized record for every opportunity."],
        ["Follow Up", "Confirmations, reminders, and review requests that keep opportunities moving."]
      ],
      finalTitle: "Not sure which system fits?",
      finalSubtitle: "That’s what the first conversation is for. Tell us where your business is today, and we’ll tell you which of the three systems makes sense — and which one doesn’t."
    },
    auditPage: {
      title: "Request Your Free Audit | BLYNX Systems",
      description: "Request a free audit to identify what your local business should keep, improve, or build next.",
      eyebrow: "Free audit",
      h1: "Request Your Free Audit",
      subtitle: "See what your business can keep, what needs improvement, and which of the three BLYNX systems fits best.",
      trust: "AI-powered for speed. Human-reviewed for quality.",
      flowTitle: "How the Free Audit Works",
      flowSubtitle: "AI-assisted for speed. Human-reviewed for quality.",
      introTitle: "A practical snapshot of your digital system.",
      introCopy: "This audit reviews your website or landing page, Google presence, business information, trust signals, lead capture process, and follow-up opportunities.",
      fitLine: "This audit works whether you already have a digital presence or you are starting from zero.",
      bullets: [
        "Digital presence, website, and Google opportunities.",
        "Business information, reviews, and local trust signals.",
        "Lead capture, organization, and follow-up opportunities."
      ],
      fields: {
        fullName: "Full Name",
        businessName: "Business Name",
        email: "Email",
        phone: "Phone",
        website: "Website or Google Business Profile URL",
        additionalUrl: "Additional URL",
        cityState: "City and State",
        businessType: "Business Type",
        gbp: "Google Business Profile Link",
        websiteStatus: "Do you currently have a website?",
        gbpStatus: "Do you have a Google Business Profile?",
        language: "Preferred Language",
        mainGoal: "Main Goal",
        improvements: "What do you want to improve?",
        timeline: "How soon do you want to improve this?",
        message: "Message / Notes"
      },
      placeholders: {
        businessType: "Home services, dental, med spa, restaurant...",
        gbp: "https://g.page/...",
        message: "Share anything useful about your current goals, challenges, or online presence."
      },
      improvements: [
        "More calls",
        "More website leads",
        "Better Google visibility",
        "More reviews",
        "Better landing page",
        "Follow-up automation",
        "Not sure"
      ],
      websiteStatusOptions: ["Yes", "No", "I have one, but it needs improvement"],
      gbpStatusOptions: ["Yes", "No", "Not sure"],
      languageOptions: ["English", "Spanish"],
      detailsSummary: "Add more business details",
      timelines: ["Immediately", "This month", "Next 2–3 months", "Just researching"],
      consentPrefix: "By submitting this form, you agree to our",
      consentPrivacy: "Privacy Policy",
      consentMiddle: "and",
      consentTerms: "Terms of Service",
      submit: "Submit My Free Audit Request",
      loading: "Submitting...",
      note: "Your information is only used to prepare your free audit — no spam, ever.",
      success: "Thank you. Your free audit request has been received. We\u2019ll review your business and contact you with the next steps.",
      error: "Something went wrong sending your request. Please try again, or email us directly at hello@blynxsystems.com."
    },
    servicesPage: {
      title: "Three Digital Systems for Local Businesses | BLYNX Systems",
      description: "Compare the three BLYNX systems for local businesses — Digital Presence, Lead Capture & Organization, and Lead Capture & Follow-Up — including full implementation scope, starting prices, exclusions, and FAQs.",
      eyebrow: "BLYNX Systems",
      h1: "Choose how far your system goes.",
      subtitle: "Every system includes the digital foundation your business needs to be found and trusted. What changes is how much of the work after that first contact we build for you.",
      ctaTitle: "Not sure which system fits?",
      ctaSubtitle: "Tell us where your business is today and we'll help you find the right system."
    },
    aboutPage: {
      title: "About | BLYNX Systems",
      description: "BLYNX helps local service businesses get found, capture qualified leads, organize every opportunity, and follow up faster.",
      eyebrow: "About",
      h1: "Built for local businesses that need a clearer digital system.",
      subtitle: "BLYNX builds digital presence and lead systems that improve visibility, trust, opportunity capture, organization, and follow-up.",
      cards: [
        ["Who BLYNX Helps", "BLYNX serves local businesses across the United States that rely on calls, quote requests, bookings, inquiries, and customer trust to grow."],
        ["What BLYNX Builds", "We build three levels of the same connected system: Digital Presence, Lead Capture & Organization, and Lead Capture & Follow-Up."],
        ["Why It Matters", "Local customers compare businesses quickly. A clearer lead flow helps reduce missed calls, forgotten forms, and lost sales opportunities."]
      ],
      positionEyebrow: "Positioning",
      positionTitle: "Three systems built around practical growth.",
      positionCopy: "BLYNX is based in Nashville, Tennessee and supports local businesses nationwide. The focus is practical digital infrastructure: visibility, trust, clear contact pathways, organized opportunities, and follow-up.",
      bullets: [
        "Local visibility improvements that help customers find the business.",
        "Focused landing pages that help visitors take the next step.",
        "Lead organization that keeps every opportunity in one clear flow.",
        "Simple follow-up support that helps owners respond faster."
      ],
      stats: [
        ["Nashville", "Based in Tennessee and serving local businesses across the United States."],
        ["Practical", "Clear systems for owners who want outcomes, not technical confusion."],
        ["Focused", "Three system levels are the core offers. Monthly maintenance and social media support are available only as separate add-ons."]
      ],
      founder: {
        eyebrow: "Founder-led",
        title: "Direct Strategy and Implementation",
        name: "Gregor Silva",
        role: "Founder of BLYNX",
        body:
          "BLYNX was created from firsthand experience with the digital problems local service businesses face: incomplete online profiles, websites that do not generate clear actions, scattered leads and slow follow-up.\n\nGregor works directly on strategy and implementation, combining practical digital systems with AI-assisted workflows to help business owners operate with more clarity, consistency and speed.",
        support:
          "You work directly with the person responsible for the strategy — without being passed between departments.",
        alt: "Gregor Silva, founder of BLYNX"
      },
      ctaTitle: "See what your business may be missing online.",
      ctaSubtitle: "The free audit is the simplest first step."
    },
    contactPage: {
      title: "Contact | BLYNX Systems",
      description: "Contact BLYNX Systems about digital presence, lead capture, opportunity organization, and follow-up support.",
      eyebrow: "Contact",
      h1: "Talk with BLYNX about your local lead flow.",
      subtitle: "Use the form below or start with the free audit if you want to see where leads may be getting lost.",
      emailTitle: "Email",
      phoneTitle: "Phone",
      locationTitle: "Based in",
      serviceAreaTitle: "Service area",
      instagramTitle: "Instagram",
      auditTitle: "Start with an audit",
      auditCopy: "Not sure what you need yet? Request a free digital presence audit first.",
      languageTitle: "Language support",
      languageCopy: "English and Spanish lead support can be requested through the audit or contact process.",
      fields: {
        name: "Full Name",
        business: "Business Name",
        email: "Email",
        phone: "Phone",
        language: "Preferred Language",
        topic: "What can we help with?",
        message: "Message"
      },
      topics: [
        "System 1 — Digital Presence",
        "System 2 — Lead Capture & Organization",
        "System 3 — Lead Capture & Follow-Up",
        "Free audit",
        "Monthly maintenance / social media",
        "Not sure"
      ],
      languageOptions: ["English", "Spanish"],
      consentPrefix: "By submitting this form, you agree to our",
      consentPrivacy: "Privacy Policy",
      consentMiddle: "and",
      consentTerms: "Terms of Service",
      submit: "Send Message",
      loading: "Sending...",
      success: "Thank you. Your message has been received. BLYNX will follow up with the next steps.",
      error: "Something went wrong sending your message. Please try again, or email us directly at hello@blynxsystems.com."
    },
    resourcesPage: {
      title: "Resources | BLYNX Systems",
      description: "Practical resources for local lead flow, lead capture, and follow-up.",
      eyebrow: "Resources",
      h1: "Practical growth resources for local business owners.",
      subtitle: "Use these starting points to think through how customers find you, contact you, and receive follow-up before your free audit.",
      cards: [
        ["Local Lead Flow Checklist", "Review the basics that help customers find your business, trust it, and take the next step.", "Request a free audit", "/free-audit"],
        ["Lead Capture Readiness", "Check whether your landing page and contact flow make it easy for qualified prospects to reach you.", "Explore the lead system", "/services"],
        ["Follow-Up Basics", "Understand how simple confirmations, reminders, and organization reduce missed opportunities.", "Ask a question", "/contact"]
      ]
    },
    projectsPage: {
      title: "Projects | BLYNX Systems",
      description: "Explore real BLYNX projects created for local service businesses and e-commerce brands.",
      eyebrow: "REAL BLYNX PROJECTS",
      h1: "See the systems we have built.",
      subtitle:
        "Explore real projects created to help businesses strengthen their digital presence, communicate their value clearly, and create a better customer journey.",
      realBadge: "Real Project",
      demoBadge: "Demo · Concept",
      industryLabel: "Industry",
      viewLive: "View Live Project",
      viewDemo: "View live demo",
      screenshotPending: "Screenshot pending",
      demoSectionTitle: "Concept demos",
      demoSectionNote: "Concept sites we build to show what's possible — these are demonstrations, not client work. Brands and content are fictional.",
      detailsToggle: "Project details",
      detail: {
        business: "The business",
        need: "The digital need",
        built: "What BLYNX built",
        elements: "Main elements implemented",
        journey: "Customer journey"
      },
      homeEntry: {
        label: "OUR WORK",
        headline: "Explore real BLYNX projects.",
        copy: "See how we have built digital experiences for service businesses and e-commerce brands.",
        cta: "View Projects"
      }
    }
  },
  es: {
    code: "es",
    htmlLang: "es",
    titleSuffix: "BLYNX Systems",
    skip: "Saltar al contenido",
    brandAria: "Inicio de BLYNX",
    navAria: "Navegación principal",
    openMenu: "Abrir menú",
    switchAria: "Selector de idioma",
    footer: "Creado para el crecimiento de negocios locales.",
    nav: {
      home: "Inicio",
      services: "Sistemas",
      howItWorks: "Cómo Funciona",
      about: "Nosotros",
      projects: "Proyectos",
      resources: "Recursos",
      contact: "Contacto",
      blog: "Blog",
      audit: "Auditoría Gratis",
      privacy: "Política de Privacidad",
      terms: "Términos de Servicio"
    },
    blogPage: {
      title: "Sistemas Prácticos de Crecimiento para Negocios Locales | Blog BLYNX",
      description: "Guías prácticas sobre visibilidad, confianza, captación de oportunidades y seguimiento — escritas para dueños de negocios locales.",
      eyebrow: "Blog de BLYNX",
      h1: "Sistemas Prácticos de Crecimiento para Negocios Locales",
      subtitle: "Aprende a ser encontrado, generar confianza, capturar más oportunidades y dar seguimiento antes de que el cliente elija a otro negocio.",
      featuredLabel: "Artículo destacado",
      latestTitle: "Últimos Artículos",
      filterLabel: "Filtrar artículos por categoría",
      allLabel: "Todos",
      minRead: "min de lectura",
      updatedLabel: "Actualizado",
      breadcrumbHome: "Inicio",
      breadcrumbBlog: "Blog",
      relatedTitle: "Sigue Leyendo",
      aboutTitle: "BLYNX",
      aboutText: "BLYNX construye sistemas prácticos de captación que ayudan a negocios locales a ser encontrados, generar confianza, capturar oportunidades y dar seguimiento más rápido.",
      aboutLink: "Conoce más sobre BLYNX",
      ctaTitle: "¿No sabes qué le falta a tu negocio en internet?",
      ctaText: "Solicita una auditoría gratis de presencia digital y descubre dónde tu negocio puede estar perdiendo visibilidad, confianza u oportunidades calificadas.",
      ctaButton: "Solicitar Auditoría Gratis"
    },
    cta: {
      audit: "Solicita una Auditoría Gratis",
      auditLong: "Solicita tu Auditoría Gratis",
      auditShort: "Auditoría Gratis",
      findSystem: "Encuentra tu Sistema",
      services: "Conocer Nuestros Sistemas",
      contact: "Contactar a BLYNX"
    },
    home: {
      title: "Sistemas digitales para negocios locales | BLYNX Systems",
      description: "BLYNX construye sistemas digitales que ayudan a negocios locales a ser encontrados, generar confianza, captar oportunidades, organizarlas y darles seguimiento. Tres sistemas, desde $1,500.",
      ogTitle: "Sistemas Digitales para Negocios Locales | BLYNX",
      ogDescription: "BLYNX conecta presencia digital, contactos, organización y seguimiento en un sistema claro para negocios locales.",
      ogImage: OG_IMAGE_ES,
      ogImageWidth: 1774,
      ogImageHeight: 887,
      ogImageAlt: "Sistema de cinco pasos de BLYNX: Te encuentran, Generas confianza, Recibes contactos, Organizas oportunidades, Das seguimiento.",
      eyebrow: "Sistemas digitales para negocios locales",
      headline: 'Que te encuentren.<br>Que te contacten.<br><span class="text-gold">Organiza tus oportunidades.</span>',
      subtitle: [
        "BLYNX conecta tu presencia digital, tus solicitudes y el seguimiento en un sistema claro para negocios locales."
      ],
      trust: ["Ser Encontrado", "Generar Confianza", "Captar", "Organizar", "Dar Seguimiento"],
      problemEyebrow: "El problema real",
      problemTitle: "La oportunidad llega. ¿Y después?",
      problemCopy: "La mayoría de los negocios locales no solo tiene un problema de visibilidad, sino de continuidad. El trabajo estaba; solo faltó darle seguimiento.",
      beforeAfter: {
        beforeLabel: "Antes de BLYNX",
        afterLabel: "Después de BLYNX",
        before: ["Solicitudes dispersas", "Presencia digital poco clara", "Sin siguiente paso visible", "Oportunidades perdidas", "Seguimiento inconsistente"],
        after: ["Presencia profesional", "Camino de contacto claro", "Oportunidades organizadas", "Estado y siguiente paso visibles", "Proceso de seguimiento definido"]
      },
      stageBanner: {
        existing: "Ya tienes presencia digital. Cualquiera de nuestros tres sistemas puede aplicar — te ayudamos a encontrar el correcto.",
        zero: "¿Estás empezando desde cero? Cualquiera de nuestros tres sistemas puede aplicar — te ayudamos a encontrar el correcto."
      },
      aboutEyebrow: "Sobre BLYNX",
      aboutTitle: "Creado para Negocios Locales",
      aboutCopy: "BLYNX crea sistemas digitales prácticos enfocados en visibilidad, confianza, oportunidades organizadas y seguimiento, no en servicios de marketing desconectados.",
      aboutBullets: [
        "Basados en Nashville, Tennessee.",
        "Servimos a negocios locales en todo Estados Unidos.",
        "Soporte disponible en inglés y español."
      ],
      statItems: [
        ["Ser Encontrado", "Visibilidad en Google, reseñas, confianza local y presencia en internet más clara."],
        ["Captar y Organizar", "Formularios inteligentes y un registro organizado para cada oportunidad."],
        ["Dar Seguimiento", "Confirmaciones, recordatorios y solicitudes de reseña que mueven cada oportunidad."]
      ],
      finalTitle: "¿No sabes cuál sistema te conviene?",
      finalSubtitle: "Para eso es la primera conversación. Cuéntanos cómo está tu negocio hoy y te decimos cuál de los tres sistemas tiene sentido — y cuál no."
    },
    auditPage: {
      title: "Solicita tu Auditoría Gratis | BLYNX Systems",
      description: "Solicita una auditoría gratis para identificar qué debe conservar, mejorar o construir tu negocio local.",
      eyebrow: "Auditoría gratis",
      h1: "Solicita tu Auditoría Gratis",
      subtitle: "Descubre qué puede conservar tu negocio, qué necesita mejorarse y cuál de los tres sistemas de BLYNX te conviene más.",
      trust: "Impulsada por IA para mayor rapidez. Revisada por BLYNX para mayor calidad.",
      flowTitle: "Cómo Funciona la Auditoría Gratis",
      flowSubtitle: "Apoyada por IA para mayor rapidez. Revisada por BLYNX para mayor calidad.",
      introTitle: "Una revisión práctica de tu sistema digital.",
      introCopy: "Esta auditoría revisa tu sitio o landing page, presencia en Google, información comercial, señales de confianza, proceso de captación y oportunidades de seguimiento.",
      fitLine: "Esta auditoría funciona tanto si ya tienes presencia digital como si estás empezando desde cero.",
      bullets: [
        "Oportunidades de presencia digital, sitio web y Google.",
        "Información comercial, reseñas y señales de confianza local.",
        "Oportunidades de captación, organización y seguimiento."
      ],
      fields: {
        fullName: "Nombre completo",
        businessName: "Nombre del negocio",
        email: "Correo",
        phone: "Teléfono",
        website: "Sitio web o enlace de Google Business Profile",
        additionalUrl: "URL adicional",
        cityState: "Ciudad y estado",
        businessType: "Tipo de negocio",
        gbp: "Link de Google Business Profile",
        websiteStatus: "¿Actualmente tienes sitio web?",
        gbpStatus: "¿Tienes Google Business Profile?",
        language: "Idioma preferido",
        mainGoal: "Objetivo principal",
        improvements: "¿Qué quieres mejorar?",
        timeline: "¿Qué tan pronto quieres mejorar esto?",
        message: "Mensaje / Notas"
      },
      placeholders: {
        businessType: "Servicios del hogar, dental, med spa, restaurante...",
        gbp: "https://g.page/...",
        message: "Comparte cualquier detalle útil sobre tus metas, retos o presencia digital actual."
      },
      improvements: [
        "Más llamadas",
        "Más solicitudes desde la web",
        "Mejor visibilidad en Google",
        "Más reseñas",
        "Mejor landing page",
        "Automatización / seguimiento",
        "No estoy seguro"
      ],
      websiteStatusOptions: ["Sí", "No", "Tengo uno, pero necesita mejorar"],
      gbpStatusOptions: ["Sí", "No", "No estoy seguro"],
      languageOptions: ["Inglés", "Español"],
      detailsSummary: "Agregar más detalles del negocio",
      timelines: ["Inmediatamente", "Este mes", "En los próximos 2–3 meses", "Solo estoy investigando"],
      consentPrefix: "Al enviar este formulario, aceptas nuestra",
      consentPrivacy: "Política de Privacidad",
      consentMiddle: "y nuestros",
      consentTerms: "Términos de Servicio",
      submit: "Enviar Solicitud de Auditoría Gratis",
      loading: "Enviando...",
      note: "Tu información solo se usa para preparar tu auditoría gratis — nada de spam.",
      success: "Gracias. Hemos recibido tu solicitud de auditoría gratis. Revisaremos tu negocio y te contactaremos con los próximos pasos.",
      error: "Ocurrió un error al enviar tu solicitud. Inténtalo de nuevo o escríbenos directamente a hello@blynxsystems.com."
    },
    servicesPage: {
      title: "Tres Sistemas Digitales para Negocios Locales | BLYNX Systems",
      description: "Compara los tres sistemas de BLYNX para negocios locales — Presencia Digital, Captación y Organización, y Captación y Seguimiento — con alcance completo, precios iniciales, exclusiones y preguntas frecuentes.",
      eyebrow: "BLYNX Systems",
      h1: "Elige hasta dónde llega tu sistema.",
      subtitle: "Todos los sistemas incluyen la base digital que tu negocio necesita para que lo encuentren y confíen en él. Lo que cambia es cuánto del trabajo posterior a ese primer contacto construimos por ti.",
      ctaTitle: "¿No sabes cuál sistema te conviene?",
      ctaSubtitle: "Cuéntanos cómo está tu negocio hoy y te ayudamos a encontrar el sistema correcto."
    },
    aboutPage: {
      title: "Nosotros | BLYNX Systems",
      description: "BLYNX ayuda a negocios locales a ser encontrados en internet, capturar oportunidades, organizar leads y dar seguimiento más rápido.",
      eyebrow: "Nosotros",
      h1: "Creado para negocios locales que necesitan un sistema digital más claro.",
      subtitle: "BLYNX crea sistemas de presencia digital y captación que mejoran visibilidad, confianza, captación, organización y seguimiento.",
      cards: [
        ["A Quién Ayuda BLYNX", "BLYNX sirve a negocios locales en Estados Unidos que dependen de llamadas, solicitudes de cotización, reservas, consultas y confianza del cliente para crecer."],
        ["Qué Construye BLYNX", "Construimos tres niveles de un mismo sistema conectado: Presencia Digital, Captación y Organización, y Captación y Seguimiento."],
        ["Por Qué Importa", "Los clientes locales comparan negocios rápidamente. Un flujo más claro ayuda a reducir llamadas perdidas, formularios olvidados y posibles clientes perdidos."]
      ],
      positionEyebrow: "Posicionamiento",
      positionTitle: "Tres sistemas creados para un crecimiento práctico.",
      positionCopy: "BLYNX está basado en Nashville, Tennessee y apoya a negocios locales en todo Estados Unidos. El enfoque es infraestructura digital práctica: visibilidad, confianza, rutas claras de contacto, oportunidades organizadas y seguimiento.",
      bullets: [
        "Mejoras de visibilidad local que ayudan a los clientes a encontrar el negocio.",
        "Landing pages enfocadas que ayudan al visitante a tomar el siguiente paso.",
        "Organización de leads que mantiene cada oportunidad en un flujo claro.",
        "Soporte simple de seguimiento que ayuda a responder más rápido."
      ],
      stats: [
        ["Nashville", "Basados en Tennessee y sirviendo a negocios locales en todo Estados Unidos."],
        ["Práctico", "Sistemas claros para dueños que quieren resultados, no confusión técnica."],
        ["Enfocado", "Los tres niveles de sistema son las ofertas principales. El mantenimiento mensual y el apoyo para redes sociales son complementos aparte."]
      ],
      founder: {
        eyebrow: "Dirigido por su fundador",
        title: "Estrategia e Implementación Directa",
        name: "Gregor Silva",
        role: "Fundador de BLYNX",
        body:
          "BLYNX nació de la experiencia directa con los problemas digitales que enfrentan los negocios locales: perfiles incompletos, sitios web sin acciones claras, leads dispersos y seguimiento lento.\n\nGregor trabaja directamente en la estrategia y la implementación, combinando sistemas digitales prácticos con procesos apoyados por inteligencia artificial para ayudar a los dueños a operar con mayor claridad, consistencia y rapidez.",
        support:
          "Trabajas directamente con la persona responsable de la estrategia, sin pasar entre diferentes departamentos.",
        alt: "Gregor Silva, fundador de BLYNX"
      },
      ctaTitle: "Descubre qué oportunidades puede estar perdiendo tu negocio en internet.",
      ctaSubtitle: "La auditoría gratis es el primer paso más simple."
    },
    contactPage: {
      title: "Contacto | BLYNX Systems",
      description: "Contacta a BLYNX Systems sobre presencia digital, captación, organización de oportunidades y seguimiento.",
      eyebrow: "Contacto",
      h1: "Habla con BLYNX sobre tu sistema de captación.",
      subtitle: "Usa el formulario de abajo o empieza con la auditoría gratis si quieres ver dónde se pueden estar perdiendo oportunidades.",
      emailTitle: "Correo",
      phoneTitle: "Teléfono",
      locationTitle: "Ubicación",
      serviceAreaTitle: "Área de servicio",
      instagramTitle: "Instagram",
      auditTitle: "Empieza con una auditoría",
      auditCopy: "¿No estás seguro de qué necesitas? Solicita primero una auditoría gratis de presencia digital.",
      languageTitle: "Soporte de idioma",
      languageCopy: "El soporte para leads en inglés y español puede solicitarse durante el proceso de auditoría o contacto.",
      fields: {
        name: "Nombre completo",
        business: "Nombre del negocio",
        email: "Correo",
        phone: "Teléfono",
        language: "Idioma preferido",
        topic: "¿En qué podemos ayudarte?",
        message: "Mensaje"
      },
      topics: [
        "Sistema 1 — Presencia Digital",
        "Sistema 2 — Captación y Organización",
        "Sistema 3 — Captación y Seguimiento",
        "Auditoría gratis",
        "Mantenimiento mensual / redes sociales",
        "No estoy seguro"
      ],
      languageOptions: ["Inglés", "Español"],
      consentPrefix: "Al enviar este formulario, aceptas nuestra",
      consentPrivacy: "Política de Privacidad",
      consentMiddle: "y nuestros",
      consentTerms: "Términos de Servicio",
      submit: "Enviar Mensaje",
      loading: "Enviando...",
      success: "Gracias. Hemos recibido tu mensaje. BLYNX te contactará con los próximos pasos.",
      error: "Ocurrió un error al enviar tu mensaje. Inténtalo de nuevo o escríbenos directamente a hello@blynxsystems.com."
    },
    resourcesPage: {
      title: "Recursos | BLYNX Systems",
      description: "Recursos prácticos para captación, organización de leads y seguimiento.",
      eyebrow: "Recursos",
      h1: "Recursos prácticos de crecimiento para dueños de negocios locales.",
      subtitle: "Usa estos puntos de partida para revisar cómo los clientes te encuentran, te contactan y reciben seguimiento antes de tu auditoría gratis.",
      cards: [
        ["Checklist de Captación Local", "Revisa lo básico que ayuda a los clientes a encontrar tu negocio, confiar y tomar el siguiente paso.", "Solicitar auditoría gratis", "/free-audit"],
        ["Preparación para Capturar Oportunidades", "Revisa si tu landing page y flujo de contacto hacen fácil que prospectos calificados te contacten.", "Explorar el sistema", "/services"],
        ["Bases de Seguimiento", "Entiende cómo confirmaciones, recordatorios y organización simple reducen oportunidades perdidas.", "Hacer una pregunta", "/contact"]
      ]
    },
    projectsPage: {
      title: "Proyectos | BLYNX Systems",
      description:
        "Explora proyectos reales de BLYNX creados para negocios de servicios locales y marcas de comercio electrónico.",
      eyebrow: "PROYECTOS REALES DE BLYNX",
      h1: "Descubre los sistemas que hemos construido.",
      subtitle:
        "Explora proyectos reales creados para ayudar a negocios a fortalecer su presencia digital, comunicar claramente su valor y construir un mejor recorrido para sus clientes.",
      realBadge: "Proyecto real",
      demoBadge: "Demo · Concepto",
      industryLabel: "Industria",
      viewLive: "Ver proyecto",
      viewDemo: "Ver demo en vivo",
      screenshotPending: "Captura pendiente",
      demoSectionTitle: "Demos de concepto",
      demoSectionNote: "Sitios de concepto que creamos para mostrar lo que es posible — son demostraciones, no trabajo de clientes. Las marcas y el contenido son ficticios.",
      detailsToggle: "Detalles del proyecto",
      detail: {
        business: "El negocio",
        need: "La necesidad digital",
        built: "Lo que construyó BLYNX",
        elements: "Elementos principales implementados",
        journey: "Recorrido del cliente"
      },
      homeEntry: {
        label: "NUESTRO TRABAJO",
        headline: "Explora proyectos reales de BLYNX.",
        copy: "Descubre cómo hemos construido experiencias digitales para negocios de servicios y marcas de comercio electrónico.",
        cta: "Ver proyectos"
      }
    }
  }
};

const commercialOffer = {
  en: {
    eyebrow: "Three digital systems",
    title: "Three systems. Choose how far yours goes.",
    intro: "Every system includes the digital foundation. What changes is how much of the work after that first contact we build for you.",
    priceLabel: "Starting at",
    whoTitle: "Choose this if you",
    implementationTitle: "What we implement",
    resultTitle: "What this system helps you do",
    exclusionsTitle: "Not included",
    detailsLink: "See full implementation scope",
    compareLink: "Compare all three systems",
    leadCaptureDefinition:
      "“Lead capture” means receiving and organizing the inquiries and opportunities that come from your website, Google, referrals, advertising, prospecting or other channels.",
    systems: [
      {
        id: "digital-presence-system",
        name: "Digital Presence System",
        startingPrice: 1500,
        badge: null,
        resultChain: ["Be found", "Build trust", "Receive inquiries"],
        positioning:
          "The digital foundation customers use to find your business, understand what you offer, and trust it enough to reach out.",
        ideal: [
          "Need people to find you online and understand what you offer",
          "Want a clear, professional way for customers to reach you",
          "Are comfortable receiving and handling inquiries yourself",
          "Need stronger trust signals and a simple contact path",
          "Want a solid digital foundation other marketing can build on"
        ],
        implementationLead: "",
        implementation: [
          "Brief diagnosis or digital audit, depending on your starting point",
          "New website, landing page, or improvement of the existing website",
          "Mobile-friendly customer experience",
          "Clear service and value proposition",
          "Contact and quote buttons",
          "Basic contact or quote form",
          "Google Business Profile setup or optimization",
          "Core business information cleanup",
          "Basic local SEO structure",
          "Google Analytics and website tracking",
          "Review-generation foundation",
          "Connection to your primary communication channels",
          "Testing and launch"
        ],
        exclusions: [
          "No qualification fields on the contact form",
          "No opportunity records, stages or owners",
          "No automated follow-up"
        ],
        benefits: [
          "Be easier to find",
          "Look more professional",
          "Build customer confidence",
          "Explain your services clearly",
          "Give customers a simple next step"
        ],
        cta: "Start with System 1",
        ctaTarget: "contact",
        pricingNote:
          "Investment depends on the condition of the existing digital presence and the approved project scope."
      },
      {
        id: "lead-capture-organization",
        name: "Lead Capture & Organization System",
        startingPrice: 2250,
        badge: null,
        resultChain: ["Receive", "Classify", "Organize"],
        positioning:
          "Everything in the Digital Presence System, plus a way to know exactly who contacted you, what they need, and where every request stands.",
        ideal: [
          "Already receive inquiries but lose track of who asked for what",
          "Handle requests from more than one channel: calls, forms, messages",
          "Need every opportunity classified, staged, and assigned to someone",
          "Want a confirmation and internal notification the moment a request arrives",
          "Need real organization, not automated follow-up yet"
        ],
        implementationLead: "Everything in the Digital Presence System, plus:",
        implementation: [
          "Smart contact and quote forms with qualification fields",
          "Service, location, urgency, preferred date and budget fields",
          "Centralized record for every opportunity",
          "Simple stages: New → Contacted → Quoted → Pending → Won/Lost",
          "Owner and next action on every opportunity",
          "Instant confirmation message to the customer",
          "Internal notification when a new opportunity arrives",
          "Full system testing"
        ],
        exclusions: [
          "No follow-up workflows or reminder sequences",
          "No message templates or team training",
          "No unattended-opportunity reminders"
        ],
        benefits: [
          "Know who contacted you and what they need",
          "See the status of every opportunity at a glance",
          "Give every request an owner and a next step",
          "Respond with the right context, faster",
          "Keep the whole team working from the same record"
        ],
        cta: "Start with System 2",
        ctaTarget: "contact",
        pricingNote:
          "Investment depends on the number of channels, qualification fields, and the approved project scope."
      },
      {
        id: "lead-capture-follow-up",
        legacyId: "local-lead-system",
        name: "Lead Capture & Follow-Up System",
        startingPrice: 2500,
        badge: "Best Value",
        resultChain: ["Receive", "Organize", "Follow up"],
        positioning:
          "Everything in Systems 1 and 2, plus the follow-up layer that catches the opportunities other systems let go quiet.",
        ideal: [
          "Lose opportunities to slow or forgotten follow-up",
          "Send quotes that go unanswered with no reminder process",
          "Need appointment confirmations and reminders",
          "Want review requests sent automatically after the job is done",
          "Need the complete system: capture, organization and follow-up together"
        ],
        implementationLead: "Everything in Systems 1 and 2, plus 5 core automations:",
        implementation: [
          "New Inquiry Confirmation — record created, customer confirmed, business notified",
          "Unattended Opportunity Reminder — alerts the responsible person",
          "Quote Follow-Up — reminder plus one or two approved customer messages",
          "Appointment Confirmation / Reminder, when applicable",
          "Review Request after the service is completed, with a direct link",
          "Communication, confirmation and follow-up message templates",
          "Remote training for your team on statuses and next actions",
          "Simple process documentation",
          "Full system testing"
        ],
        exclusions: [
          "Not unlimited automation — the 5 workflows above are the approved scope",
          "Additional workflows require separately approved scope",
          "Third-party costs (SMS, WhatsApp, paid CRM plans) are separate when applicable"
        ],
        benefits: [
          "Nothing goes quiet after the first message",
          "Quotes get a real follow-up process, not hope",
          "Appointments are confirmed and reminded automatically",
          "Reviews get requested consistently after every job",
          "Your team knows exactly what happens next, every time"
        ],
        cta: "Start with System 3",
        ctaTarget: "contact",
        pricingNote:
          "Investment depends on the number of workflows, communication channels, integrations, and the approved project scope."
      }
    ],
    comparison: {
      eyebrow: "System comparison",
      title: "Compare the three systems",
      columns: ["Digital Presence", "Capture & Organization", "Capture & Follow-Up"],
      rows: [
        { label: "Diagnosis or audit of current presence", values: ["Yes", "Yes", "Yes"] },
        { label: "Website / landing page built or improved", values: ["Yes", "Yes", "Yes"] },
        { label: "Mobile optimization", values: ["Yes", "Yes", "Yes"] },
        { label: "Google Business Profile + basic local SEO", values: ["Yes", "Yes", "Yes"] },
        { label: "Google Analytics", values: ["Yes", "Yes", "Yes"] },
        { label: "Review-generation foundation", values: ["Yes", "Yes", "Yes"] },
        { label: "Contact / quote form", values: ["Basic", "Smart + qualification", "Smart + qualification"] },
        { label: "Service, location, urgency, date, budget fields", values: ["—", "Yes", "Yes"] },
        { label: "Centralized opportunity records", values: ["—", "Yes", "Yes"] },
        { label: "Stages, owner and next action", values: ["—", "Yes", "Yes"] },
        { label: "Instant confirmation + internal notification", values: ["—", "Yes", "Yes"] },
        { label: "Unattended-opportunity reminder", values: ["—", "—", "Yes"] },
        { label: "Quote follow-up reminders", values: ["—", "—", "Yes"] },
        { label: "Appointment confirmation + reminder", values: ["—", "—", "Yes"] },
        { label: "Review request after service", values: ["—", "—", "Yes"] },
        { label: "Message and confirmation templates", values: ["—", "—", "Yes"] },
        { label: "Remote team training", values: ["—", "—", "Yes"] },
        { label: "Testing and launch", values: ["Yes", "Yes", "Yes"] }
      ],
      recommendationTitle: "Not sure which one fits your business?",
      recommendation:
        "Any of the three systems can be built for a business starting from zero or one that already has a website and a Google profile. Your current setup changes how we diagnose you — not which system fits.",
      cta: "Find the Right System",
      ctaTarget: "contact"
    },
    monthly: {
      eyebrow: "After launch",
      title: "Keep the system running — and, if you want, keep it visible",
      intro:
        "Optional, and separate from the project price. Available once your system is live.",
      maintenance: {
        name: "Digital System Maintenance",
        price: "$650",
        priceUnit: "/month",
        inclusions: [
          "Minor website updates (up to 4 per month)",
          "Business information updates",
          "Form monitoring",
          "Automation monitoring",
          "Analytics review",
          "Backups and system checks",
          "Simple monthly summary",
          "Minor technical corrections"
        ]
      },
      socialAddOn: {
        name: "Social Media Management Add-On",
        price: "+$850",
        priceUnit: "/month",
        note: "Added to the $650 monthly maintenance.",
        inclusions: [
          "Monthly content planning and calendar",
          "Up to 8 content pieces",
          "Static designs and carousels",
          "Up to 2 simple reels using footage you provide",
          "Captions",
          "Instagram / Facebook adaptation",
          "Scheduling and publishing",
          "Basic monthly report"
        ],
        exclusions: [
          "Unlimited posting or revisions",
          "Intensive community management or daily DM responses",
          "Professional photography or videography",
          "Paid advertising or ad budget"
        ]
      },
      comboPrice: "$1,500",
      comboPriceUnit: "/month",
      comboLabel: "Both together",
      customNote: "Larger social media requirements receive a custom quote.",
      cta: "Ask About Monthly Support",
      ctaTarget: "contact"
    },
    faq: {
      eyebrow: "Frequently asked questions",
      title: "Clear answers before you choose a system",
      items: [
        [
          "Do I need to start from zero?",
          "No. Any of the three systems can be built for a business starting from zero or one that already has a website and a Google profile. We begin with a short diagnosis or a free audit to see what exists and recommend the right system."
        ],
        [
          "What if I already have a website?",
          "We evaluate what can be kept, improved, or rebuilt. Existing digital assets do not automatically make the project smaller; correcting an outdated or poorly structured system can require more work than starting clean. Projects begin at the listed starting price, and the final investment depends on the approved scope."
        ],
        [
          "What is the difference between the three systems?",
          "System 1 builds the digital foundation customers use to find and trust you. System 2 adds smart forms and organizes every opportunity with a status and an owner. System 3 adds the follow-up layer — confirmations, reminders and review requests — so nothing goes quiet."
        ],
        [
          "Does BLYNX guarantee more customers or leads?",
          "No. BLYNX builds the infrastructure and process that helps your business receive and manage opportunities professionally. Results also depend on market demand, your offer, pricing, competition, reputation, sales ability, response speed, customer service and execution."
        ],
        [
          "Does social media management come included?",
          "No. Social media support is a separate monthly add-on to maintenance, quoted at a fixed rate for the scope described, with a custom quote for larger requirements."
        ],
        [
          "Are automations included, and are they unlimited?",
          "System 3 includes 5 core follow-up automations in the approved scope: new inquiry confirmation, unattended opportunity reminders, quote follow-up, appointment confirmation/reminders, and review requests. This is not unlimited automation — additional workflows require separately approved scope."
        ],
        [
          "How is the final price determined?",
          "Final pricing depends on the current digital setup, approved project scope, number of workflows, communication channels, integrations, and any separately approved add-ons."
        ],
        [
          "How does payment work?",
          "50% to begin, 30% after approval of the build, and 20% before launch. Monthly services are billed in advance."
        ]
      ]
    }
  },
  es: {
    eyebrow: "Tres sistemas digitales",
    title: "Tres sistemas. Elige hasta dónde llega el tuyo.",
    intro: "Todos los sistemas incluyen la base digital. Lo que cambia es cuánto del trabajo posterior a ese primer contacto construimos por ti.",
    priceLabel: "Desde",
    whoTitle: "Elige este sistema si",
    implementationTitle: "Qué implementamos",
    resultTitle: "Qué te ayuda a lograr este sistema",
    exclusionsTitle: "No incluye",
    detailsLink: "Ver el alcance completo de implementación",
    compareLink: "Comparar los tres sistemas",
    leadCaptureDefinition:
      "“La captación” se refiere a recibir y organizar las solicitudes y oportunidades que llegan desde el sitio web, Google, referencias, publicidad, prospección u otros canales.",
    systems: [
      {
        id: "sistema-presencia-digital",
        name: "Sistema de Presencia Digital",
        startingPrice: 1500,
        badge: null,
        resultChain: ["Ser encontrado", "Generar confianza", "Recibir solicitudes"],
        positioning:
          "La base digital que tus clientes usan para encontrar tu negocio, entender qué ofreces y confiar lo suficiente como para contactarte.",
        ideal: [
          "Necesitas que te encuentren en internet y entiendan qué ofreces",
          "Quieres una forma clara y profesional de que los clientes te contacten",
          "Te sientes cómodo recibiendo y atendiendo las solicitudes tú mismo",
          "Necesitas más señales de confianza y un camino simple de contacto",
          "Quieres una base digital sólida sobre la que construir tu marketing"
        ],
        implementationLead: "",
        implementation: [
          "Diagnóstico breve o auditoría digital, según tu punto de partida",
          "Nuevo sitio web, landing page o mejora del sitio existente",
          "Experiencia optimizada para dispositivos móviles",
          "Presentación clara de los servicios y la propuesta de valor",
          "Botones de contacto y cotización",
          "Formulario básico de contacto o cotización",
          "Creación u optimización del Perfil de Empresa de Google",
          "Corrección de la información principal del negocio",
          "Estructura básica de SEO local",
          "Google Analytics y medición del sitio",
          "Base para generar reseñas",
          "Conexión con tus principales canales de comunicación",
          "Pruebas y lanzamiento"
        ],
        exclusions: [
          "El formulario de contacto no incluye campos de clasificación",
          "No incluye registros de oportunidades, estados ni responsables",
          "No incluye seguimiento automático"
        ],
        benefits: [
          "Ser más fácil de encontrar",
          "Proyectar una imagen más profesional",
          "Generar confianza",
          "Explicar claramente tus servicios",
          "Facilitar el siguiente paso al cliente"
        ],
        cta: "Empezar con el Sistema 1",
        ctaTarget: "contact",
        pricingNote:
          "La inversión depende del estado de la presencia digital existente y del alcance aprobado del proyecto."
      },
      {
        id: "sistema-captacion-organizacion",
        name: "Sistema de Captación y Organización",
        startingPrice: 2250,
        badge: null,
        resultChain: ["Recibir", "Clasificar", "Organizar"],
        positioning:
          "Todo lo incluido en el Sistema de Presencia Digital, más una forma de saber exactamente quién te contactó, qué necesita y en qué punto está cada solicitud.",
        ideal: [
          "Ya recibes solicitudes pero pierdes el control de quién pidió qué",
          "Atiendes solicitudes de más de un canal: llamadas, formularios, mensajes",
          "Necesitas que cada oportunidad tenga clasificación, estado y responsable",
          "Quieres una confirmación y notificación interna apenas llega una solicitud",
          "Necesitas organización real, todavía no seguimiento automático"
        ],
        implementationLead: "Todo lo incluido en el Sistema de Presencia Digital, más:",
        implementation: [
          "Formularios inteligentes con campos de clasificación",
          "Campos de servicio, ubicación, urgencia, fecha preferida y presupuesto",
          "Registro centralizado de cada oportunidad",
          "Estados simples: Nueva → Contactada → Cotizada → Pendiente → Ganada/Perdida",
          "Responsable y siguiente acción en cada oportunidad",
          "Mensaje de confirmación instantánea al cliente",
          "Notificación interna cuando llega una nueva oportunidad",
          "Pruebas completas del sistema"
        ],
        exclusions: [
          "No incluye flujos de seguimiento ni secuencias de recordatorios",
          "No incluye plantillas de mensajes ni capacitación del equipo",
          "No incluye recordatorios de oportunidades sin atender"
        ],
        benefits: [
          "Saber quién te contactó y qué necesita",
          "Ver el estado de cada oportunidad de un vistazo",
          "Darle a cada solicitud un responsable y un siguiente paso",
          "Responder con el contexto correcto, más rápido",
          "Mantener a todo el equipo trabajando con el mismo registro"
        ],
        cta: "Empezar con el Sistema 2",
        ctaTarget: "contact",
        pricingNote:
          "La inversión depende de la cantidad de canales, campos de clasificación y del alcance aprobado del proyecto."
      },
      {
        id: "sistema-captacion-seguimiento",
        legacyId: "sistema-local-captacion",
        name: "Sistema de Captación y Seguimiento",
        startingPrice: 2500,
        badge: "Mejor Valor",
        resultChain: ["Recibir", "Organizar", "Dar seguimiento"],
        positioning:
          "Todo lo incluido en los Sistemas 1 y 2, más la capa de seguimiento que rescata las oportunidades que otros sistemas dejan enfriar.",
        ideal: [
          "Pierdes oportunidades por un seguimiento lento u olvidado",
          "Mandas cotizaciones que quedan sin respuesta y sin recordatorio",
          "Necesitas confirmaciones y recordatorios de citas",
          "Quieres que se pidan reseñas automáticamente al terminar el trabajo",
          "Necesitas el sistema completo: captación, organización y seguimiento juntos"
        ],
        implementationLead: "Todo lo incluido en los Sistemas 1 y 2, más 5 automatizaciones principales:",
        implementation: [
          "Confirmación de Nueva Solicitud — registro creado, cliente confirmado, negocio notificado",
          "Recordatorio de Oportunidad sin Atender — alerta al responsable",
          "Seguimiento de Cotización — recordatorio más uno o dos mensajes aprobados al cliente",
          "Confirmación y Recordatorio de Cita, cuando aplica",
          "Solicitud de Reseña al terminar el servicio, con enlace directo",
          "Plantillas de comunicación, confirmación y seguimiento",
          "Capacitación remota para tu equipo sobre estados y siguientes acciones",
          "Documentación simple del proceso",
          "Pruebas completas del sistema"
        ],
        exclusions: [
          "No es automatización ilimitada — las 5 anteriores son el alcance aprobado",
          "Flujos adicionales requieren alcance aprobado por separado",
          "Los costos de terceros (SMS, WhatsApp, planes de CRM pagos) son aparte cuando aplican"
        ],
        benefits: [
          "Nada se queda en el aire después del primer mensaje",
          "Las cotizaciones tienen un proceso real de seguimiento, no solo esperanza",
          "Las citas se confirman y recuerdan automáticamente",
          "Se piden reseñas de forma consistente después de cada trabajo",
          "Tu equipo sabe exactamente qué sigue, siempre"
        ],
        cta: "Empezar con el Sistema 3",
        ctaTarget: "contact",
        pricingNote:
          "La inversión depende de la cantidad de procesos, canales de comunicación, integraciones y del alcance aprobado del proyecto."
      }
    ],
    comparison: {
      eyebrow: "Comparación de sistemas",
      title: "Compara los tres sistemas",
      columns: ["Presencia Digital", "Captación y Organización", "Captación y Seguimiento"],
      rows: [
        { label: "Diagnóstico o auditoría de la presencia actual", values: ["Sí", "Sí", "Sí"] },
        { label: "Sitio web / landing page creado o mejorado", values: ["Sí", "Sí", "Sí"] },
        { label: "Optimización móvil", values: ["Sí", "Sí", "Sí"] },
        { label: "Perfil de Empresa de Google + SEO local básico", values: ["Sí", "Sí", "Sí"] },
        { label: "Google Analytics", values: ["Sí", "Sí", "Sí"] },
        { label: "Base para generar reseñas", values: ["Sí", "Sí", "Sí"] },
        { label: "Formulario de contacto o cotización", values: ["Básico", "Inteligente + clasificación", "Inteligente + clasificación"] },
        { label: "Campos de servicio, ubicación, urgencia, fecha, presupuesto", values: ["—", "Sí", "Sí"] },
        { label: "Registro centralizado de oportunidades", values: ["—", "Sí", "Sí"] },
        { label: "Estados, responsable y siguiente acción", values: ["—", "Sí", "Sí"] },
        { label: "Confirmación instantánea + notificación interna", values: ["—", "Sí", "Sí"] },
        { label: "Recordatorio de oportunidad sin atender", values: ["—", "—", "Sí"] },
        { label: "Recordatorios de seguimiento de cotización", values: ["—", "—", "Sí"] },
        { label: "Confirmación y recordatorio de cita", values: ["—", "—", "Sí"] },
        { label: "Solicitud de reseña tras el servicio", values: ["—", "—", "Sí"] },
        { label: "Plantillas de mensajes y confirmación", values: ["—", "—", "Sí"] },
        { label: "Capacitación remota del equipo", values: ["—", "—", "Sí"] },
        { label: "Pruebas y lanzamiento", values: ["Sí", "Sí", "Sí"] }
      ],
      recommendationTitle: "¿No sabes cuál necesita tu negocio?",
      recommendation:
        "Cualquiera de los tres sistemas se puede construir para un negocio que empieza de cero o para uno que ya tiene sitio web y perfil de Google. Tu punto de partida cambia cómo te diagnosticamos, no cuál sistema te conviene.",
      cta: "Encuentra tu Sistema",
      ctaTarget: "contact"
    },
    monthly: {
      eyebrow: "Después del lanzamiento",
      title: "Mantén el sistema funcionando — y, si quieres, manténlo visible",
      intro:
        "Opcional, y aparte del precio del proyecto. Disponible una vez que tu sistema esté en funcionamiento.",
      maintenance: {
        name: "Mantenimiento del Sistema Digital",
        price: "$650",
        priceUnit: "/mes",
        inclusions: [
          "Actualizaciones menores del sitio web (hasta 4 al mes)",
          "Actualizaciones de información del negocio",
          "Monitoreo de formularios",
          "Monitoreo de automatizaciones",
          "Revisión de Analytics",
          "Respaldos y revisiones del sistema",
          "Resumen mensual simple",
          "Correcciones técnicas menores"
        ]
      },
      socialAddOn: {
        name: "Complemento de Redes Sociales",
        price: "+$850",
        priceUnit: "/mes",
        note: "Se agrega al mantenimiento mensual de $650.",
        inclusions: [
          "Planificación y calendario mensual de contenido",
          "Hasta 8 piezas de contenido",
          "Diseños estáticos y carruseles",
          "Hasta 2 reels simples con material que tú aportes",
          "Textos para publicaciones",
          "Adaptación para Instagram / Facebook",
          "Programación y publicación",
          "Reporte mensual básico"
        ],
        exclusions: [
          "Publicaciones o revisiones ilimitadas",
          "Gestión intensiva de comunidad o respuesta diaria de mensajes",
          "Fotografía o videografía profesional",
          "Publicidad pagada o presupuesto de anuncios"
        ]
      },
      comboPrice: "$1,500",
      comboPriceUnit: "/mes",
      comboLabel: "Los dos juntos",
      customNote: "Las necesidades más grandes de redes sociales reciben una cotización personalizada.",
      cta: "Consultar Soporte Mensual",
      ctaTarget: "contact"
    },
    faq: {
      eyebrow: "Preguntas frecuentes",
      title: "Respuestas claras antes de elegir un sistema",
      items: [
        [
          "¿Necesito comenzar desde cero?",
          "No. Cualquiera de los tres sistemas se puede construir para un negocio que empieza de cero o para uno que ya tiene sitio web y perfil de Google. Comenzamos con un diagnóstico breve o una auditoría gratis para ver qué existe y recomendarte el sistema correcto."
        ],
        [
          "¿Qué ocurre si ya tengo un sitio web?",
          "Evaluamos qué se puede conservar, mejorar o reconstruir. Tener activos digitales no significa automáticamente que el proyecto sea más pequeño; corregir un sistema desactualizado o mal estructurado puede requerir más trabajo que comenzar desde cero. Los proyectos comienzan desde el precio indicado y la inversión final depende del alcance aprobado."
        ],
        [
          "¿Cuál es la diferencia entre los tres sistemas?",
          "El Sistema 1 construye la base digital que tus clientes usan para encontrarte y confiar en ti. El Sistema 2 agrega formularios inteligentes y organiza cada oportunidad con estado y responsable. El Sistema 3 agrega la capa de seguimiento — confirmaciones, recordatorios y solicitudes de reseña — para que nada se quede en el aire."
        ],
        [
          "¿BLYNX garantiza más clientes o más leads?",
          "No. BLYNX construye la infraestructura y el proceso que ayuda a tu negocio a recibir y gestionar oportunidades de forma profesional. Los resultados también dependen de la demanda del mercado, tu oferta, tus precios, la competencia, tu reputación, tu capacidad de venta, la velocidad de respuesta, el servicio al cliente y la ejecución."
        ],
        [
          "¿El manejo de redes sociales está incluido?",
          "No. El apoyo para redes sociales es un complemento mensual aparte del mantenimiento, cotizado a una tarifa fija para el alcance descrito, con cotización personalizada para necesidades mayores."
        ],
        [
          "¿Las automatizaciones están incluidas y son ilimitadas?",
          "El Sistema 3 incluye 5 automatizaciones principales de seguimiento en el alcance aprobado: confirmación de nueva solicitud, recordatorios de oportunidades sin atender, seguimiento de cotización, confirmación/recordatorio de citas y solicitudes de reseña. No es automatización ilimitada — los flujos adicionales requieren alcance aprobado por separado."
        ],
        [
          "¿Cómo se determina el precio final?",
          "El precio final depende de la configuración digital actual, el alcance aprobado, la cantidad de procesos, los canales de comunicación, las integraciones y cualquier complemento aprobado por separado."
        ],
        [
          "¿Cómo funciona el pago?",
          "50% para comenzar, 30% después de la aprobación de la construcción y 20% antes del lanzamiento. Los servicios mensuales se pagan por adelantado."
        ]
      ]
    }
  }
};

function validateCommercialOfferParity() {
  const en = commercialOffer.en;
  const es = commercialOffer.es;
  const sameLength = (left, right, label) => {
    if (left.length !== right.length) throw new Error(`Bilingual offer mismatch: ${label}`);
  };

  // --- Systems: exactly 3, in both languages ---
  if (en.systems.length !== 3 || es.systems.length !== 3) {
    throw new Error("Bilingual offer mismatch: expected exactly 3 systems in each language");
  }
  sameLength(en.systems, es.systems, "systems");

  let badgeIndexEn = -1;
  let badgeIndexEs = -1;
  let legacyIndexEn = -1;
  let legacyIndexEs = -1;

  en.systems.forEach((system, index) => {
    const translated = es.systems[index];
    if (system.startingPrice !== translated.startingPrice || system.ctaTarget !== translated.ctaTarget) {
      throw new Error(`Bilingual offer mismatch: system ${index + 1} price or CTA`);
    }
    if (!system.id || !translated.id) {
      throw new Error(`Bilingual offer mismatch: system ${index + 1} missing id`);
    }
    sameLength(system.ideal, translated.ideal, `system ${index + 1} audience`);
    sameLength(system.implementation, translated.implementation, `system ${index + 1} implementation`);
    sameLength(system.exclusions, translated.exclusions, `system ${index + 1} exclusions`);
    sameLength(system.benefits, translated.benefits, `system ${index + 1} benefits`);
    sameLength(system.resultChain, translated.resultChain, `system ${index + 1} result chain`);
    if (system.badge) badgeIndexEn = index;
    if (translated.badge) badgeIndexEs = index;
    if (system.legacyId) legacyIndexEn = index;
    if (translated.legacyId) legacyIndexEs = index;
  });

  // Exactly one system carries the Best Value badge, at the same index in both languages.
  if (badgeIndexEn === -1 || badgeIndexEn !== badgeIndexEs) {
    throw new Error("Bilingual offer mismatch: badge must appear on exactly one system, at the same index, in both languages");
  }
  // Exactly one system (the renamed former Local Lead System) carries a legacy anchor, same index both languages.
  if (legacyIndexEn === -1 || legacyIndexEn !== legacyIndexEs) {
    throw new Error("Bilingual offer mismatch: legacyId must appear on exactly one system, at the same index, in both languages");
  }

  if (!en.priceLabel || !es.priceLabel) {
    throw new Error("Bilingual offer mismatch: priceLabel missing");
  }

  // --- Comparison table ---
  sameLength(en.comparison.columns, es.comparison.columns, "comparison columns");
  if (en.comparison.columns.length !== 3) {
    throw new Error("Bilingual offer mismatch: comparison table must have 3 columns");
  }
  sameLength(en.comparison.rows, es.comparison.rows, "comparison rows");
  en.comparison.rows.forEach((row, index) => {
    sameLength(row.values, es.comparison.rows[index].values, `comparison row ${index + 1} values`);
    if (row.values.length !== 3 || es.comparison.rows[index].values.length !== 3) {
      throw new Error(`Bilingual offer mismatch: comparison row ${index + 1} must have 3 values`);
    }
  });
  if (en.comparison.ctaTarget !== es.comparison.ctaTarget) {
    throw new Error("Bilingual offer mismatch: comparison CTA destination");
  }

  // --- Monthly services ---
  // Only the numeric price string must match across languages (e.g. "$650").
  // The unit suffix ("/month" vs "/mes") is a legitimate translation, not a mismatch.
  if (en.monthly.maintenance.price !== es.monthly.maintenance.price) {
    throw new Error("Bilingual offer mismatch: maintenance price");
  }
  if (en.monthly.socialAddOn.price !== es.monthly.socialAddOn.price) {
    throw new Error("Bilingual offer mismatch: social add-on price");
  }
  if (en.monthly.comboPrice !== es.monthly.comboPrice) {
    throw new Error("Bilingual offer mismatch: combo price");
  }
  sameLength(en.monthly.maintenance.inclusions, es.monthly.maintenance.inclusions, "maintenance inclusions");
  sameLength(en.monthly.socialAddOn.inclusions, es.monthly.socialAddOn.inclusions, "social add-on inclusions");
  sameLength(en.monthly.socialAddOn.exclusions, es.monthly.socialAddOn.exclusions, "social add-on exclusions");
  if (en.monthly.ctaTarget !== es.monthly.ctaTarget) {
    throw new Error("Bilingual offer mismatch: monthly CTA destination");
  }

  // --- FAQ ---
  sameLength(en.faq.items, es.faq.items, "FAQ topics");
}

validateCommercialOfferParity();

const pillars = {
  en: {
    eyebrow: "What we build",
    title: "Five parts. One connected system.",
    items: [
      { label: "Be found", result: "People searching for your service actually reach you." },
      { label: "Build trust", result: "What they see makes them comfortable contacting you." },
      { label: "Capture", result: "The request arrives complete, not as a missed call." },
      { label: "Organize", result: "Every opportunity has a status, an owner and a next step." },
      { label: "Follow up", result: "Nothing goes quiet because everyone got busy." }
    ]
  },
  es: {
    eyebrow: "Lo que construimos",
    title: "Cinco partes. Un solo sistema conectado.",
    items: [
      { label: "Ser encontrado", result: "Quien busca tu servicio llega hasta ti." },
      { label: "Generar confianza", result: "Lo que ve le da seguridad para contactarte." },
      { label: "Captar", result: "La solicitud llega completa, no como una llamada perdida." },
      { label: "Organizar", result: "Cada oportunidad tiene estado, responsable y siguiente paso." },
      { label: "Dar seguimiento", result: "Nada se queda en el aire porque todos estaban ocupados." }
    ]
  }
};

const routes = {
  en: {
    eyebrow: "How we decide together",
    title: "Find the Right System",
    intro:
      "Any of the three systems can be built for a business starting from zero or one that already has a website and a Google profile. Your current setup changes the diagnosis — not the recommendation.",
    cards: [
      {
        label: "Route A",
        title: "Starting from zero",
        copy: "A short diagnosis call: what you sell, who you serve, how people reach you today.",
        result: "We recommend System 1, 2 or 3.",
        cta: "Start a Diagnosis",
        ctaTarget: "contact"
      },
      {
        label: "Route B",
        title: "You already have something",
        copy: "A free audit of what exists: what works, what's missing, what's disconnected.",
        result: "We recommend System 1, 2 or 3.",
        cta: "Request a Free Audit",
        ctaTarget: "free-audit"
      }
    ]
  },
  es: {
    eyebrow: "Cómo lo decidimos juntos",
    title: "Encuentra tu Sistema",
    intro:
      "Cualquiera de los tres sistemas se puede construir para un negocio que empieza de cero o para uno que ya tiene web y perfil de Google. Tu punto de partida cambia el diagnóstico, no la recomendación.",
    cards: [
      {
        label: "Ruta A",
        title: "Empiezas de cero",
        copy: "Una llamada corta de diagnóstico: qué vendes, a quién y cómo te contactan hoy.",
        result: "Te recomendamos el Sistema 1, 2 o 3.",
        cta: "Iniciar Diagnóstico",
        ctaTarget: "contact"
      },
      {
        label: "Ruta B",
        title: "Ya tienes algo armado",
        copy: "Auditoría gratis de lo que existe: qué funciona, qué falta y qué está desconectado.",
        result: "Te recomendamos el Sistema 1, 2 o 3.",
        cta: "Solicitar Auditoría Gratis",
        ctaTarget: "free-audit"
      }
    ]
  }
};

const implementationPlan = {
  en: {
    eyebrow: "What happens if you say yes",
    title: "Three steps. One milestone each.",
    steps: [
      {
        label: "Step 1",
        title: "Diagnosis & Scope",
        copy: "Short call or free audit. We agree on the system and the scope.",
        milestone: "50% to begin"
      },
      {
        label: "Step 2",
        title: "Design, Build & Approval",
        copy: "Presence, forms, records and workflows for the approved level, reviewed with you.",
        milestone: "30% after approval"
      },
      {
        label: "Step 3",
        title: "Testing & Launch",
        copy: "Everything tested end to end, then launched live.",
        milestone: "20% before launch"
      }
    ],
    note: "The final 20% is received before production launch. Monthly services are billed in advance. Third-party platform costs are separate when they apply."
  },
  es: {
    eyebrow: "Qué pasa si dices que sí",
    title: "Tres pasos. Un hito cada uno.",
    steps: [
      {
        label: "Paso 1",
        title: "Diagnóstico y Alcance",
        copy: "Llamada corta o auditoría gratis. Acordamos sistema y alcance.",
        milestone: "50% para comenzar"
      },
      {
        label: "Paso 2",
        title: "Diseño, Construcción y Aprobación",
        copy: "Presencia, formularios, registros y flujos del nivel aprobado, revisados contigo.",
        milestone: "30% después de la aprobación"
      },
      {
        label: "Paso 3",
        title: "Pruebas y Lanzamiento",
        copy: "Todo probado de principio a fin y luego puesto en marcha.",
        milestone: "20% antes del lanzamiento"
      }
    ],
    note: "El 20% final se recibe antes del lanzamiento a producción. Los servicios mensuales se pagan por adelantado. Los costos de plataformas externas son aparte cuando aplican."
  }
};

const stagePages = {
  en: {
    title: "Choose Your Starting Point | BLYNX",
    description: "Choose whether your business already has a digital presence or is starting from zero.",
    aria: "Choose business stage",
    eyebrow: "Local Lead System for Service Businesses",
    h1: "What best describes your business?",
    subtitle: "Choose where your business is today so we can show you the clearest next step.",
    skip: "Skip for now",
    cards: [
      {
        value: "existing",
        title: "I already have a digital presence",
        copy: "You already have a website, Google profile, or some online presence — but you need better visibility, more qualified leads, faster follow-up, and better control.",
        bullets: ["Improve visibility", "Capture more qualified leads", "Organize opportunities", "Follow up faster"],
        cta: "Continue"
      },
      {
        value: "zero",
        title: "I’m starting from zero",
        copy: "You do not have a website, Google Business Profile, or lead system yet. BLYNX can build the digital foundation needed to get found, receive opportunities, and follow up professionally.",
        bullets: ["Google Business Profile setup", "Conversion landing page", "Smart lead form", "Basic lead tracking", "Follow-up automation"],
        cta: "Continue"
      }
    ]
  },
  es: {
    title: "Elige tu Punto de Partida | BLYNX",
    description: "Elige si tu negocio ya tiene presencia digital o está empezando desde cero.",
    aria: "Elegir etapa del negocio",
    eyebrow: "Sistema de Captación para Negocios Locales",
    h1: "¿Qué describe mejor tu negocio?",
    subtitle: "Elige en qué punto está tu negocio para mostrarte el siguiente paso más claro.",
    skip: "Saltar por ahora",
    cards: [
      {
        value: "existing",
        title: "Ya tengo presencia digital",
        copy: "Ya tienes sitio web, Google Business Profile o alguna presencia online — pero necesitas mejor visibilidad, más oportunidades calificadas, seguimiento más rápido y mayor control.",
        bullets: ["Mejorar visibilidad", "Capturar más oportunidades calificadas", "Organizar leads", "Dar seguimiento rápido"],
        cta: "Continuar"
      },
      {
        value: "zero",
        title: "Estoy empezando desde cero",
        copy: "Todavía no tienes sitio web, Google Business Profile o sistema de captación. BLYNX puede construir la base digital necesaria para ser encontrado, recibir oportunidades y dar seguimiento profesional.",
        bullets: ["Configuración de Google Business Profile", "Landing page de conversión", "Formulario inteligente", "Control básico de leads", "Automatización de seguimiento"],
        cta: "Continuar"
      }
    ]
  }
};

const stageLandingPages = {
  en: {
    existing: {
      title: "Improve What You Already Have | BLYNX",
      description: "Improve visibility, lead capture, follow-up, and lead control for an existing local business presence.",
      eyebrow: "Existing digital presence",
      h1: "Improve What You Already Have",
      subtitle: "For businesses that already have a website, Google profile, or online presence. We start with a free audit — any of BLYNX's three systems can apply, depending on what your business needs, not just what you already have.",
      cards: [
        ["Visibility Tune-Up", "Improve local signals that help qualified customers find and trust your business."],
        ["Lead Capture Review", "Make your current website, landing page, or profile easier to turn into calls and requests."],
        ["Opportunity Tracking", "Organize incoming leads so every inquiry has a clear place and next action."],
        ["Faster Follow-Up", "Add simple confirmations, alerts, and reminders so fewer leads get missed."]
      ],
      processTitle: "What BLYNX Improves",
      steps: ["Audit current presence", "Find lead flow gaps", "Improve capture points", "Connect follow-up"],
      ctaTitle: "Ready to improve what you already have?",
      ctaSubtitle: "Start with a free audit and see where your current presence may be losing opportunities.",
      cta: "Get a Free Audit",
      auditSlug: "free-audit-existing"
    },
    zero: {
      title: "Build Your Digital Foundation From Zero | BLYNX",
      description: "Build the digital foundation local service businesses need to get found, receive opportunities, and follow up professionally.",
      eyebrow: "Starting from zero",
      h1: "Build Your Digital Foundation From Zero",
      subtitle: "For businesses that don't yet have a website, Google Business Profile, or a way to organize inquiries. We start with a short diagnosis — any of BLYNX's three systems can apply, depending on what your business needs.",
      cards: [
        ["Google Business Profile Setup", "Create the local presence customers expect to find when they search for your business."],
        ["Conversion Landing Page", "A focused page designed to explain the service and help visitors call, request a quote, or book the next step."],
        ["Smart Lead Form", "A clean form that collects the right information without making the process complicated."],
        ["Basic Lead Tracking", "A simple place to organize new opportunities and keep track of next steps."],
        ["Follow-Up Automation", "Basic email, SMS, or WhatsApp follow-up so new opportunities do not get lost."],
        ["Review Request System", "A simple flow to start requesting and organizing customer reviews."]
      ],
      processTitle: "What BLYNX Builds First",
      steps: ["Set up local visibility", "Create a conversion landing page", "Connect lead capture", "Add follow-up"],
      ctaTitle: "Starting from zero?",
      ctaSubtitle: "Start with a free audit so we can map the clearest digital foundation for your business.",
      cta: "Start With a Free Audit",
      auditSlug: "free-audit-zero"
    }
  },
  es: {
    existing: {
      title: "Mejora lo que Ya Tienes | BLYNX",
      description: "Mejora visibilidad, captación, seguimiento y control de leads para un negocio local que ya tiene presencia digital.",
      eyebrow: "Presencia digital existente",
      h1: "Mejora lo que Ya Tienes",
      subtitle: "Para negocios que ya tienen sitio web, Google Business Profile o presencia online. Empezamos con una auditoría gratis — cualquiera de los tres sistemas de BLYNX puede aplicar, según lo que tu negocio necesite, no solo lo que ya tengas.",
      cards: [
        ["Mejora de Visibilidad", "Mejoramos señales locales que ayudan a clientes calificados a encontrar y confiar en tu negocio."],
        ["Revisión de Captación", "Hacemos que tu sitio, landing page o perfil actual sea más claro para generar llamadas y solicitudes."],
        ["Organización de Oportunidades", "Ordenamos los leads entrantes para que cada solicitud tenga un lugar y una próxima acción."],
        ["Seguimiento Más Rápido", "Agregamos confirmaciones, avisos y recordatorios simples para que menos oportunidades se pierdan."]
      ],
      processTitle: "Qué Mejora BLYNX",
      steps: ["Auditar presencia actual", "Encontrar fallos en el flujo", "Mejorar puntos de captación", "Conectar seguimiento"],
      ctaTitle: "¿Listo para mejorar lo que ya tienes?",
      ctaSubtitle: "Empieza con una auditoría gratis y descubre dónde tu presencia actual puede estar perdiendo oportunidades.",
      cta: "Solicitar Auditoría Gratis",
      auditSlug: "free-audit-existing"
    },
    zero: {
      title: "Construye tu Base Digital Desde Cero | BLYNX",
      description: "Construye la base digital que un negocio local necesita para ser encontrado, recibir oportunidades y dar seguimiento profesional.",
      eyebrow: "Empezando desde cero",
      h1: "Construye tu Base Digital Desde Cero",
      subtitle: "Para negocios que todavía no tienen sitio web, Google Business Profile o una forma de organizar solicitudes. Empezamos con un diagnóstico breve — cualquiera de los tres sistemas de BLYNX puede aplicar, según lo que tu negocio necesite.",
      cards: [
        ["Configuración de Google Business Profile", "Creamos la presencia local que los clientes esperan encontrar cuando buscan tu negocio."],
        ["Landing Page de Conversión", "Una página enfocada para explicar el servicio y ayudar al visitante a llamar, pedir cotización o agendar el siguiente paso."],
        ["Formulario Inteligente", "Un formulario claro que recoge la información correcta sin complicar el proceso."],
        ["Control Básico de Leads", "Un lugar simple para organizar nuevas oportunidades y dar seguimiento a los próximos pasos."],
        ["Automatización de Seguimiento", "Seguimiento básico por email, SMS o WhatsApp para que las nuevas oportunidades no se pierdan."],
        ["Sistema para Pedir Reseñas", "Un flujo simple para empezar a pedir y organizar reseñas de clientes."]
      ],
      processTitle: "Qué Construye BLYNX Primero",
      steps: ["Configurar visibilidad local", "Crear landing page de conversión", "Conectar captura de leads", "Agregar seguimiento"],
      ctaTitle: "¿Estás empezando desde cero?",
      ctaSubtitle: "Empieza con una auditoría gratis para mapear la base digital más clara para tu negocio.",
      cta: "Empezar con Auditoría Gratis",
      auditSlug: "free-audit-zero"
    }
  }
};

const stageAuditPages = {
  en: {
    existing: {
      title: "Free Audit for Existing Digital Presence | BLYNX",
      description: "Request a free audit for your existing local digital presence and lead flow.",
      eyebrow: "Free audit",
      h1: "Audit Your Current Digital Presence",
      subtitle: "Show us what you already have and we’ll look for ways to improve visibility, capture more qualified leads, and follow up faster.",
      introTitle: "For businesses that already have something online.",
      introCopy: "This audit reviews your current website or landing page, Google presence, lead capture points, reviews, and follow-up flow.",
      bullets: ["Visibility and trust gaps.", "Lead capture and conversion opportunities.", "Follow-up and organization improvements."],
      fields: {
        website: "Website URL",
        gbp: "Google Business Profile Link",
        improvements: "What do you want to improve?",
        timeline: "How soon do you want to improve this?",
        message: "Message / Notes"
      },
      improvements: ["More calls", "More website leads", "Better Google visibility", "More reviews", "Better landing page", "Follow-up automation", "Not sure"],
      timelines: ["Immediately", "This month", "Next 2–3 months", "Just researching"],
      submit: "Submit My Free Audit Request",
      hiddenLanguage: "English",
      success: "Thank you. Your free audit request has been received. We\u2019ll review your business and contact you with the next steps.",
      error: "Something went wrong sending your request. Please try again, or email us directly at hello@blynxsystems.com."
    },
    zero: {
      title: "Free Digital Foundation Audit | BLYNX",
      description: "Request a free audit for a local business starting from zero.",
      eyebrow: "Free audit",
      h1: "Plan Your Digital Foundation",
      subtitle: "Tell us about your business and we’ll map the clearest first steps to get found, receive opportunities, and follow up professionally.",
      introTitle: "For businesses starting from zero.",
      introCopy: "This audit does not assume you already have a website or Google profile. We review what your business needs first to create a practical digital foundation and lead system.",
      bullets: ["Google Business Profile setup path.", "Conversion landing page needs.", "Lead capture, tracking, follow-up, and review basics."],
      fields: {
        needs: "What do you need help setting up?",
        timeline: "How soon do you want to launch this?",
        message: "Message / Notes"
      },
      needs: ["Google Business Profile setup", "Conversion landing page", "Smart lead form", "Basic lead tracking", "Follow-up automation", "Review request system", "Not sure"],
      timelines: ["Immediately", "This month", "Next 2–3 months", "Just researching"],
      submit: "Start My Free Audit",
      hiddenLanguage: "English",
      success: "Thank you. Your free audit request has been received. We\u2019ll review your business and contact you with the next steps.",
      error: "Something went wrong sending your request. Please try again, or email us directly at hello@blynxsystems.com."
    }
  },
  es: {
    existing: {
      title: "Auditoría Gratis para Presencia Digital Existente | BLYNX",
      description: "Solicita una auditoría gratis para mejorar tu presencia digital y flujo de captación actual.",
      eyebrow: "Auditoría gratis",
      h1: "Audita tu Presencia Digital Actual",
      subtitle: "Muéstranos lo que ya tienes y revisaremos formas de mejorar visibilidad, capturar más oportunidades calificadas y dar seguimiento más rápido.",
      introTitle: "Para negocios que ya tienen algo en internet.",
      introCopy: "Esta auditoría revisa tu sitio o landing page actual, presencia en Google, puntos de captación, reseñas y flujo de seguimiento.",
      bullets: ["Brechas de visibilidad y confianza.", "Oportunidades de captación y conversión.", "Mejoras de seguimiento y organización."],
      fields: {
        website: "Sitio web",
        gbp: "Link de Google Business Profile",
        improvements: "¿Qué quieres mejorar?",
        timeline: "¿Qué tan pronto quieres mejorar esto?",
        message: "Mensaje / Notas"
      },
      improvements: ["Más llamadas", "Más solicitudes desde la web", "Mejor visibilidad en Google", "Más reseñas", "Mejor landing page", "Automatización / seguimiento", "No estoy seguro"],
      timelines: ["Inmediatamente", "Este mes", "En los próximos 2–3 meses", "Solo estoy investigando"],
      submit: "Enviar Solicitud de Auditoría Gratis",
      hiddenLanguage: "Spanish",
      success: "Gracias. Hemos recibido tu solicitud de auditoría gratis. Revisaremos tu negocio y te contactaremos con los próximos pasos.",
      error: "Ocurrió un error al enviar tu solicitud. Inténtalo de nuevo o escríbenos directamente a hello@blynxsystems.com."
    },
    zero: {
      title: "Auditoría Gratis para Base Digital | BLYNX",
      description: "Solicita una auditoría gratis para un negocio local que empieza desde cero.",
      eyebrow: "Auditoría gratis",
      h1: "Planifica tu Base Digital",
      subtitle: "Cuéntanos sobre tu negocio y trazaremos los primeros pasos más claros para ser encontrado, recibir oportunidades y dar seguimiento profesional.",
      introTitle: "Para negocios que empiezan desde cero.",
      introCopy: "Esta auditoría no asume que ya tienes sitio web o perfil de Google. Revisamos qué necesita primero tu negocio para crear una base digital práctica y un sistema de captación.",
      bullets: ["Ruta para configurar Google Business Profile.", "Necesidades de landing page de conversión.", "Bases de captura, control, seguimiento y reseñas."],
      fields: {
        needs: "¿Qué necesitas configurar?",
        timeline: "¿Qué tan pronto quieres lanzar esto?",
        message: "Mensaje / Notas"
      },
      needs: ["Configuración de Google Business Profile", "Landing page de conversión", "Formulario inteligente", "Control básico de leads", "Automatización de seguimiento", "Sistema para pedir reseñas", "No estoy seguro"],
      timelines: ["Inmediatamente", "Este mes", "En los próximos 2–3 meses", "Solo estoy investigando"],
      submit: "Empezar mi Auditoría Gratis",
      hiddenLanguage: "Spanish",
      success: "Gracias. Hemos recibido tu solicitud de auditoría gratis. Revisaremos tu negocio y te contactaremos con los próximos pasos.",
      error: "Ocurrió un error al enviar tu solicitud. Inténtalo de nuevo o escríbenos directamente a hello@blynxsystems.com."
    }
  }
};

const auditFlow = {
  en: [
    ["Click Free Audit", "Start your free audit request on our website."],
    ["Choose Language", "English or Spanish support available."],
    ["Answer Smart Form", "Share your business, goals, contact information, and current online presence."],
    ["Initial Digital Snapshot", "Your current presence and lead flow details are organized for review."],
    ["Human Review", "BLYNX reviews the findings and adds personalized recommendations."],
    ["Audit Delivered + Book a Call", "You receive your audit summary and can book a strategy call."]
  ],
  es: [
    ["Haz clic en Auditoría Gratis", "Inicia tu solicitud de auditoría gratis en nuestro sitio."],
    ["Elige Idioma", "Soporte disponible en inglés o español."],
    ["Responde el Formulario", "Comparte tu negocio, metas, contacto y presencia actual en internet."],
    ["Revisión Digital Inicial", "La información de tu presencia actual y flujo de captación se organiza para revisión."],
    ["Revisión de BLYNX", "BLYNX revisa los hallazgos y agrega recomendaciones personalizadas."],
    ["Auditoría Entregada + Agenda una Llamada", "Recibes el resumen de tu auditoría y puedes agendar una llamada estratégica."]
  ]
};


const legalPages = {
  en: {
    privacy: {
      title: "Privacy Policy | BLYNX",
      description: "Privacy Policy for BLYNX Systems.",
      eyebrow: "Privacy",
      h1: "Privacy Policy",
      effective: `Effective date: ${LEGAL_EFFECTIVE_DATE}`,
      sections: [
        ["Introduction", "This Privacy Policy explains how BLYNX Systems collects, uses and protects information submitted through this website and normal website use. By using the website or submitting a form, you acknowledge the practices described here."],
        ["Information We Collect", "We may collect information you provide directly, including full name, business name, email, phone, website, city and state, business type, Google Business Profile URL, business goals, messages and notes. We may also collect technical information produced by normal website use, such as browser type, device information, pages visited and general performance information."],
        ["Information Submitted Through Forms", "Free audit and contact forms may ask for information needed to understand your business, respond to your request, prepare an audit, route communications and maintain internal records. Some fields may be optional, but submitting incomplete information may limit how useful our response can be."],
        ["How We Use Information", "We use information to respond to requests, prepare free audits, provide services, maintain related communications, improve the website, understand performance and keep operational records."],
        ["Communications", "When you submit a form, BLYNX may contact you about that request, your audit or related service needs. Promotional communications require an appropriate basis and opt-out option when applicable."],
        ["Service Providers and Third-Party Tools", "Information may be processed by trusted service providers used to operate the website, deliver forms, send messages, maintain records, analyze performance or provide requested services. BLYNX does not sell personal information."],
        ["Cookies and Analytics", "The website may use basic cookies, analytics or performance tools to understand website use and improve the experience. Analytics events should not include names, email addresses, phone numbers, private messages or other personal information."],
        ["Data Retention", "We keep information for as long as reasonably needed to respond to requests, provide services, maintain records, comply with obligations and resolve disputes. Retention periods may vary based on operational needs."],
        ["Data Security", "We use reasonable safeguards appropriate for a small business website and lead intake process. No website, storage system or transmission method can guarantee absolute security."],
        ["Your Choices", `You may request correction or deletion of information by contacting ${BUSINESS.email}. We may need to retain limited information where required for legitimate business, legal or security reasons.`],
        ["Children’s Privacy", "This website is intended for business owners and adults. It is not directed to children, and we do not knowingly collect information from children."],
        ["Changes to This Policy", "We may update this Privacy Policy as the website, services or operational tools change. The effective date will be updated when material changes are made."],
        ["Contact Information", `Questions about this Privacy Policy can be sent to ${BUSINESS.legalName} at ${BUSINESS.email}.`]
      ]
    },
    terms: {
      title: "Terms of Service | BLYNX",
      description: "Terms of Service for BLYNX Systems.",
      eyebrow: "Terms",
      h1: "Terms of Service",
      effective: `Effective date: ${LEGAL_EFFECTIVE_DATE}`,
      sections: [
        ["Acceptance of Terms", "By accessing this website, submitting a form or using BLYNX materials, you agree to these Terms of Service. If you do not agree, do not use the website."],
        ["Description of Services", "BLYNX provides practical local lead system support for service businesses, including local visibility, focused landing pages, lead capture, lead organization, follow-up workflows, review strategy and related reporting or advisory work."],
        ["Free Audits and Informational Materials", "Free audits, website content, recommendations and informational materials are provided for general business evaluation. A free audit is not a guarantee of rankings, leads, sales, revenue or any specific outcome."],
        ["No Guarantee of Results", "BLYNX does not guarantee search rankings, number of leads, sales, revenue, advertising results, customer reviews, platform approvals or other business outcomes. Results depend on many factors outside BLYNX’s control."],
        ["AI-Assisted Processes", "BLYNX may use AI-assisted workflows to organize information, speed up review and support implementation. Important final recommendations and client-facing decisions receive human review."],
        ["Client Responsibilities", "Recommendations and implementation may require accurate information, timely approvals, account access, platform permissions, client cooperation and follow-through. Delays or incomplete information can affect timelines and results."],
        ["Third-Party Platforms", "Google, Apple, Bing, Meta, CRM platforms, email/SMS tools, hosting providers and other third-party services maintain their own rules, availability and approval processes. BLYNX does not control ranking decisions, suspensions, approvals, outages or platform changes."],
        ["Intellectual Property", "The BLYNX website, content, design, processes and materials are protected by applicable intellectual property laws, except for materials owned by clients or third parties."],
        ["Paid Services, Proposals and Agreements", "Paid projects are subject to separate proposal, scope, price, timeline and agreement terms. Website information does not create a paid engagement by itself."],
        ["Prohibited Use", "You may not use this website to submit false information, interfere with website operations, attempt unauthorized access, scrape content in a harmful way or use BLYNX materials for unlawful purposes."],
        ["Disclaimer of Warranties", "The website and informational materials are provided on an as-is and as-available basis. BLYNX disclaims warranties to the fullest extent permitted by law."],
        ["Limitation of Liability", "To the fullest extent permitted by law, BLYNX will not be liable for indirect, incidental, special, consequential or punitive damages, or for lost profits, lost revenue or lost data arising from website use or informational materials."],
        ["Termination", "BLYNX may restrict or discontinue access to the website or communications where misuse, security risk or violation of these Terms is suspected."],
        ["Changes to These Terms", "BLYNX may update these Terms as services, tools or operations change. Continued website use after updates means you accept the revised Terms."],
        ["Governing Law", "These Terms are governed by the laws of Tennessee, United States, without regard to conflict of law rules."],
        ["Contact Information", `Questions about these Terms can be sent to ${BUSINESS.legalName} at ${BUSINESS.email}.`]
      ]
    }
  },
  es: {
    privacy: {
      title: "Política de Privacidad | BLYNX",
      description: "Política de Privacidad de BLYNX Systems.",
      eyebrow: "Privacidad",
      h1: "Política de Privacidad",
      effective: `Fecha de vigencia: ${LEGAL_EFFECTIVE_DATE}`,
      sections: [
        ["Introducción", "Esta Política de Privacidad explica cómo BLYNX Systems recopila, utiliza y protege la información enviada a través de este sitio web y la información generada por el uso normal del sitio. Al usar el sitio o enviar un formulario, reconoces las prácticas descritas aquí."],
        ["Información que Recopilamos", "Podemos recopilar información que proporcionas directamente, incluyendo nombre completo, nombre del negocio, correo, teléfono, sitio web, ciudad y estado, tipo de negocio, URL de Google Business Profile, objetivos del negocio, mensajes y notas. También podemos recopilar información técnica generada por el uso normal del sitio, como tipo de navegador, información del dispositivo, páginas visitadas e información general de rendimiento."],
        ["Información Enviada en Formularios", "Los formularios de auditoría gratis y contacto pueden solicitar información necesaria para entender tu negocio, responder a tu solicitud, preparar una auditoría, dirigir comunicaciones y mantener registros internos. Algunos campos pueden ser opcionales, pero enviar información incompleta puede limitar la utilidad de nuestra respuesta."],
        ["Cómo Usamos la Información", "Usamos la información para responder solicitudes, preparar auditorías gratis, prestar servicios, mantener comunicaciones relacionadas, mejorar el sitio, entender el rendimiento y conservar registros operativos."],
        ["Comunicaciones", "Cuando envías un formulario, BLYNX puede contactarte sobre esa solicitud, tu auditoría o necesidades de servicio relacionadas. Las comunicaciones promocionales requieren una base adecuada y opción de exclusión cuando corresponda."],
        ["Proveedores de Servicios y Herramientas de Terceros", "La información puede ser procesada por proveedores de confianza utilizados para operar el sitio, entregar formularios, enviar mensajes, mantener registros, analizar rendimiento o prestar servicios solicitados. BLYNX no vende información personal."],
        ["Cookies y Analítica", "El sitio puede usar cookies básicas, analítica o herramientas de rendimiento para entender el uso del sitio y mejorar la experiencia. Los eventos de analítica no deben incluir nombres, correos, teléfonos, mensajes privados u otra información personal."],
        ["Retención de Datos", "Conservamos la información durante el tiempo razonablemente necesario para responder solicitudes, prestar servicios, mantener registros, cumplir obligaciones y resolver disputas. Los periodos de retención pueden variar según necesidades operativas."],
        ["Seguridad de Datos", "Usamos medidas razonables para un sitio de pequeña empresa y proceso de recepción de leads. Ningún sitio web, sistema de almacenamiento o método de transmisión puede garantizar seguridad absoluta."],
        ["Tus Opciones", `Puedes solicitar corrección o eliminación de información contactando a ${BUSINESS.email}. Es posible que debamos conservar información limitada por razones legítimas de negocio, legales o de seguridad.`],
        ["Privacidad de Menores", "Este sitio está dirigido a dueños de negocios y adultos. No está dirigido a menores y no recopilamos intencionalmente información de menores."],
        ["Cambios a Esta Política", "Podemos actualizar esta Política de Privacidad cuando cambien el sitio, los servicios o las herramientas operativas. La fecha de vigencia se actualizará cuando haya cambios importantes."],
        ["Información de Contacto", `Las preguntas sobre esta Política de Privacidad pueden enviarse a ${BUSINESS.legalName} en ${BUSINESS.email}.`]
      ]
    },
    terms: {
      title: "Términos de Servicio | BLYNX",
      description: "Términos de Servicio de BLYNX Systems.",
      eyebrow: "Términos",
      h1: "Términos de Servicio",
      effective: `Fecha de vigencia: ${LEGAL_EFFECTIVE_DATE}`,
      sections: [
        ["Aceptación de los Términos", "Al acceder a este sitio, enviar un formulario o usar materiales de BLYNX, aceptas estos Términos de Servicio. Si no estás de acuerdo, no uses el sitio."],
        ["Descripción de los Servicios", "BLYNX ofrece soporte práctico para sistemas de captación local para negocios de servicios, incluyendo visibilidad local, landing pages enfocadas, captura de leads, organización de oportunidades, flujos de seguimiento, estrategia de reseñas y reportes o asesoría relacionada."],
        ["Auditorías Gratis y Materiales Informativos", "Las auditorías gratis, contenido del sitio, recomendaciones y materiales informativos se proporcionan para evaluación general del negocio. Una auditoría gratis no garantiza rankings, leads, ventas, ingresos ni resultados específicos."],
        ["Sin Garantía de Resultados", "BLYNX no garantiza posiciones en buscadores, cantidad de leads, ventas, ingresos, resultados publicitarios, reseñas de clientes, aprobaciones de plataformas u otros resultados de negocio. Los resultados dependen de muchos factores fuera del control de BLYNX."],
        ["Procesos Apoyados por IA", "BLYNX puede usar procesos apoyados por inteligencia artificial para organizar información, acelerar revisiones y apoyar la implementación. Las recomendaciones finales importantes y decisiones orientadas al cliente reciben revisión humana."],
        ["Responsabilidades del Cliente", "Las recomendaciones e implementación pueden requerir información correcta, aprobaciones oportunas, acceso a cuentas, permisos de plataformas, cooperación del cliente y seguimiento de tareas. Los retrasos o información incompleta pueden afectar tiempos y resultados."],
        ["Plataformas de Terceros", "Google, Apple, Bing, Meta, plataformas CRM, herramientas de email/SMS, proveedores de hosting y otros servicios externos mantienen sus propias reglas, disponibilidad y procesos de aprobación. BLYNX no controla decisiones de rankings, suspensiones, aprobaciones, fallas o cambios de plataformas."],
        ["Propiedad Intelectual", "El sitio, contenido, diseño, procesos y materiales de BLYNX están protegidos por leyes aplicables de propiedad intelectual, excepto materiales que pertenezcan a clientes o terceros."],
        ["Servicios Pagados, Propuestas y Acuerdos", "Los proyectos pagados estarán sujetos a propuesta, alcance, precio, tiempos y condiciones independientes. La información del sitio no crea por sí sola una contratación pagada."],
        ["Uso Prohibido", "No puedes usar este sitio para enviar información falsa, interferir con operaciones del sitio, intentar acceso no autorizado, extraer contenido de forma dañina o usar materiales de BLYNX con fines ilegales."],
        ["Descargo de Garantías", "El sitio y materiales informativos se proporcionan tal como están y según disponibilidad. BLYNX rechaza garantías en la medida máxima permitida por la ley."],
        ["Limitación de Responsabilidad", "En la medida máxima permitida por la ley, BLYNX no será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos, ni por pérdida de ganancias, ingresos o datos derivados del uso del sitio o materiales informativos."],
        ["Terminación", "BLYNX puede restringir o discontinuar el acceso al sitio o comunicaciones cuando sospeche uso indebido, riesgo de seguridad o violación de estos Términos."],
        ["Cambios a Estos Términos", "BLYNX puede actualizar estos Términos cuando cambien los servicios, herramientas u operaciones. El uso continuo del sitio después de actualizaciones significa que aceptas los Términos revisados."],
        ["Ley Aplicable", "Estos Términos se rigen por las leyes de Tennessee, Estados Unidos, sin considerar normas de conflicto de leyes."],
        ["Información de Contacto", `Las preguntas sobre estos Términos pueden enviarse a ${BUSINESS.legalName} en ${BUSINESS.email}.`]
      ]
    }
  }
};

function write(file, contents) {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const normalized = contents.replace(/[ \t]+$/gm, "").trim();
  fs.writeFileSync(target, `${normalized}\n`, "utf8");
}

function pagePath(lang, slug = "") {
  return `/${lang}${slug ? `/${slug}` : ""}`;
}

function localizedHref(lang, href) {
  if (href.startsWith("/#")) return `/${lang}${href}`;
  if (href.startsWith("/")) return `/${lang}${href}`;
  return href;
}

function founderMedia(lang) {
  const imageCandidates = [
    { file: "public/images/gregor-silva.webp", src: "/public/images/gregor-silva.webp" },
    { file: "public/images/gregor-silva.png", src: "/public/images/gregor-silva.png" }
  ];
  const alt = copy[lang].aboutPage.founder.alt;
  const image = imageCandidates.find((candidate) => fs.existsSync(path.join(root, candidate.file)));
  if (image) {
    return `<img src="${image.src}" alt="${escapeAttr(alt)}" width="520" height="620" loading="lazy" decoding="async">`;
  }
  return `
    <div class="founder-placeholder" role="img" aria-label="${alt}">
      <span class="brand-mark" aria-hidden="true">BX</span>
      <strong>Gregor Silva</strong>
      <span>${copy[lang].aboutPage.founder.role}</span>
    </div>`;
}

function languageSwitcher(lang, switchPath, switchPaths = null) {
  const enPath = switchPaths ? switchPaths.en : switchPath;
  const esPath = switchPaths ? switchPaths.es : switchPath;
  const enHref = `/en${enPath ? `/${enPath}` : ""}`;
  const esHref = `/es${esPath ? `/${esPath}` : ""}`;
  const t = copy[lang];

  return `
    <div class="language-switcher" aria-label="${t.switchAria}">
      <a class="${lang === "en" ? "is-active" : ""}" href="${enHref}" data-language-switch="en">EN</a>
      <span aria-hidden="true">|</span>
      <a class="${lang === "es" ? "is-active" : ""}" href="${esHref}" data-language-switch="es">ES</a>
    </div>`;
}

function header(lang, active, switchPath = "", auditSlug = "free-audit", switchPaths = null) {
  const t = copy[lang];
  const home = pagePath(lang);
  const systemHref = `${pagePath(lang, "services")}#systems`;
  const journeyHref = `${home}#journey`;
  const aboutHref = pagePath(lang, "about");
  const auditHref = pagePath(lang, auditSlug);
  const contactHref = pagePath(lang, "contact");

  const activeClass = (name) => (active === name ? ' class="is-active"' : "");

  return `
    <a class="skip-link" href="#main">${t.skip}</a>
    <header class="site-header" aria-label="${t.navAria}">
      <div class="container header-shell">
        <a class="brand" href="${home}" aria-label="${t.brandAria}">
          <span class="brand-mark" aria-hidden="true">BX</span>
          <span class="brand-text">
            <span class="brand-name">BLYNX</span>
            <span class="brand-subtitle">Systems</span>
          </span>
        </a>
        <nav class="site-nav" data-site-nav>
          <a${activeClass("home")} href="${home}">${t.nav.home}</a>
          <a href="${systemHref}">${t.nav.services}</a>
          <a href="${journeyHref}">${t.nav.howItWorks}</a>
          <a${activeClass("about")} href="${aboutHref}">${t.nav.about}</a>
          <a${activeClass("projects")} href="${pagePath(lang, "projects")}">${t.nav.projects}</a>
          ${blogArticles[lang].length ? `<a${activeClass("blog")} href="${pagePath(lang, "blog")}">${t.nav.blog}</a>` : ""}
          <a class="nav-audit-link" href="${auditHref}">${t.nav.audit}</a>
        </nav>
        <div class="header-actions">
          ${languageSwitcher(lang, switchPath, switchPaths)}
          <a class="btn btn-primary" href="${contactHref}">${t.cta.findSystem}</a>
          <button class="menu-toggle" type="button" aria-label="${t.openMenu}" aria-expanded="false" data-menu-toggle>
            <span class="menu-toggle-lines" aria-hidden="true"></span>
          </button>
        </div>
      </div>
    </header>`;
}

function footer(lang, auditSlug = "free-audit") {
  const t = copy[lang];
  const serviceAreaLabel =
    lang === "es" ? "Negocios en Estados Unidos" : `Serving businesses across the ${BUSINESS.serviceArea}`;
  return `
    <footer class="footer">
      <div class="container footer-grid">
        <div class="footer-brand">
          <a class="brand" href="${pagePath(lang)}" aria-label="${t.brandAria}">
            <span class="brand-mark" aria-hidden="true">BX</span>
            <span class="brand-text"><span class="brand-name">BLYNX</span><span class="brand-subtitle">Systems</span></span>
          </a>
          <p>${t.footer}</p>
          <span>&copy; 2026 ${BUSINESS.legalName}.</span>
        </div>
        <div class="footer-links">
          <a href="${pagePath(lang, "services")}">${t.nav.services}</a>
          <a href="${pagePath(lang, "about")}">${t.nav.about}</a>
          <a href="${pagePath(lang, "projects")}">${t.nav.projects}</a>
          <a href="${pagePath(lang, "contact")}">${t.nav.contact}</a>
          ${blogArticles[lang].length ? `<a href="${pagePath(lang, "blog")}">${t.nav.blog}</a>` : ""}
          <a href="${pagePath(lang, auditSlug)}">${t.nav.audit}</a>
        </div>
        <div class="footer-links">
          <a href="${pagePath(lang, "privacy")}">${t.nav.privacy}</a>
          <a href="${pagePath(lang, "terms")}">${t.nav.terms}</a>
        </div>
        <div class="footer-contact">
          ${contactLine("email", emailLink())}
          ${hasConfiguredPhone() ? contactLine("phone", phoneLink()) : ""}
          ${contactLine("location", BUSINESS.location)}
          ${contactLine("serviceArea", serviceAreaLabel)}
          ${instagramLink() ? contactLine("instagram", instagramLink()) : ""}
        </div>
      </div>
    </footer>`;
}

function shell(lang, meta, active, switchPath, body) {
  const t = copy[lang];
  const pathPart = switchPath ? `/${switchPath}` : "";
  const enUrl = `${SITE_URL}/en${pathPart}`;
  const esUrl = `${SITE_URL}/es${pathPart}`;
  const canonicalUrl = lang === "es" ? esUrl : enUrl;
  const breadcrumbs = pathPart
    ? [
        { name: t.nav.home, url: `${SITE_URL}/${lang}` },
        { name: meta.h1 || meta.title, url: canonicalUrl }
      ]
    : [];
  // Optional per-page overrides for the social-share card only — everything
  // else (the <title> tag, meta description used for SEO) keeps using
  // meta.title/meta.description untouched. Falls back to the generic
  // sitewide card when a page (nearly all of them) doesn't set these.
  const ogTitle = meta.ogTitle || meta.title;
  const ogDescription = meta.ogDescription || meta.description;
  const ogImage = meta.ogImage || OG_IMAGE;
  const ogImageWidth = meta.ogImageWidth || 1200;
  const ogImageHeight = meta.ogImageHeight || 630;
  const ogImageAlt = meta.ogImageAlt || ogTitle;
  return `<!doctype html>
<html lang="${t.htmlLang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}">
    <link rel="canonical" href="${canonicalUrl}">
    <link rel="alternate" hreflang="en" href="${enUrl}">
    <link rel="alternate" hreflang="es" href="${esUrl}">
    <link rel="alternate" hreflang="x-default" href="${enUrl}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${BUSINESS.displayName}">
    <meta property="og:title" content="${ogTitle}">
    <meta property="og:description" content="${ogDescription}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:locale" content="${lang === "es" ? "es_ES" : "en_US"}">
    <meta property="og:locale:alternate" content="${lang === "es" ? "en_US" : "es_ES"}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:width" content="${ogImageWidth}">
    <meta property="og:image:height" content="${ogImageHeight}">
    <meta property="og:image:alt" content="${ogImageAlt}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${ogTitle}">
    <meta name="twitter:description" content="${ogDescription}">
    <meta name="twitter:image" content="${ogImage}">
    <meta name="twitter:image:alt" content="${ogImageAlt}">
    ${structuredData(lang, meta.title, meta.description, canonicalUrl, breadcrumbs)}
    ${runtimeHead()}
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="/assets/styles.css">
    <script src="/assets/site.js" defer></script>
  </head>
  <body>
    ${header(lang, active, switchPath, meta.auditSlug || "free-audit")}
    ${body}
    ${footer(lang, meta.auditSlug || "free-audit")}
  </body>
</html>`;
}

const SITE_MEDIA_ALTS = {
  existing: {
    en: "Storefront half in shadow, half glowing with warm golden light as it is being renewed",
    es: "Local comercial mitad en sombra, mitad brillando con luz dorada cálida mientras se renueva"
  },
  zero: {
    en: "Golden blueprint wireframe of a small storefront rising from dark ground, its entrance already lit",
    es: "Plano dorado de un pequeño local surgiendo de la oscuridad, con la entrada ya iluminada"
  },
  services: {
    en: "Six golden spheres connected by threads of light converging into one bright stream",
    es: "Seis esferas doradas conectadas por hilos de luz que convergen en una sola corriente brillante"
  },
  nashville: {
    en: "Nashville, Tennessee skyline at dusk with warm golden window lights",
    es: "Skyline de Nashville, Tennessee al atardecer con luces doradas en las ventanas"
  }
};

function stageCardMedia(stage) {
  return `
              <div class="card-media" aria-hidden="true">
                <img src="/public/images/site/path-${stage}.jpg" alt="" width="1200" height="630" loading="lazy" decoding="async">
              </div>`;
}

function pageMediaBand(src, alt, wide = false) {
  return `
      <section class="page-media">
        <div class="container">
          <img src="${src}" alt="${escapeAttr(alt)}" width="1200" height="${wide ? 510 : 630}" loading="lazy" decoding="async"${wide ? ' class="is-wide"' : ""}>
        </div>
      </section>`;
}

function offerList(items, className = "check-list") {
  return `<ul class="${className}">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

// Approved product photography (see docs/plans/blynx-homepage-restructure.md).
// v2 assets are per-language (each language's screenshot has its own baked-in
// UI text, so EN and ES use different source files and — since they were
// produced separately — different native dimensions). Source PNGs live in
// assets/images/; responsive AVIF/WebP/PNG derivatives at 480/800/1200/1672w
// are generated by scripts/optimize-images.js and are not regenerated by the
// page build. The v1 (single-file, language-neutral-ish) assets are kept on
// disk as a rollback fallback but are no longer referenced here.
const PRODUCT_IMAGES = {
  hero: {
    en: { base: "blynx-connected-system-hero-en", width: 1672, height: 941 },
    es: { base: "blynx-connected-system-hero-es", width: 1672, height: 941 },
    alt: {
      en: "The BLYNX connected system: discovery, website, reviews, inquiry, CRM and follow-up shown as one flow for an example business.",
      es: "El sistema conectado BLYNX: descubrimiento, sitio web, reseñas, solicitud, CRM y seguimiento mostrados como un solo flujo para un negocio de ejemplo."
    }
  },
  system1: {
    en: { base: "blynx-system-1-digital-presence-en", width: 1448, height: 1086 },
    es: { base: "blynx-system-1-digital-presence-es", width: 1672, height: 941 },
    alt: {
      en: "System 1 in action: a mobile business listing, a business website, a customer review, and a contact form.",
      es: "Sistema 1 en acción: una ficha de negocio en el móvil, un sitio web de negocio, una reseña de cliente y un formulario de contacto."
    }
  },
  system2: {
    en: { base: "blynx-system-2-capture-organization-en", width: 1448, height: 1086 },
    es: { base: "blynx-system-2-capture-organization-es", width: 1672, height: 941 },
    alt: {
      en: "System 2 in action: a new contact request captured and organized into lead cards and a sales pipeline board.",
      es: "Sistema 2 en acción: una nueva solicitud de contacto captada y organizada en tarjetas de lead y un tablero de pipeline de ventas."
    }
  },
  system3: {
    en: { base: "blynx-system-3-follow-up-en", width: 1448, height: 1086 },
    es: { base: "blynx-system-3-follow-up-es", width: 1672, height: 941 },
    alt: {
      en: "System 3 in action: automatic reply, reminder, quote follow-up, appointment reminder, review request and confirmed booking.",
      es: "Sistema 3 en acción: respuesta automática, recordatorio, seguimiento de cotización, recordatorio de cita, solicitud de reseña y reserva confirmada."
    }
  }
};

const SYSTEM_IMAGE_KEYS = ["system1", "system2", "system3"];

function productImage(key, lang, { priority = false, sizes = "(max-width: 760px) 100vw, 800px", className = "" } = {}) {
  const entry = PRODUCT_IMAGES[key];
  const variant = entry[lang];
  const base = `/assets/images/${variant.base}`;
  // Widths actually generated on disk for THIS asset's native resolution —
  // never a fixed list. An EN system shot (native 1448px) and an ES one
  // (native 1672px) get different srcset descriptors, matching what
  // scripts/optimize-images.js really wrote for each (see lib/responsive-widths).
  const widths = widthsForNative(variant.width);
  const srcset = (ext) => widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(", ");
  return `
            <div class="product-visual${className ? " " + className : ""}">
              <picture>
                <source type="image/avif" srcset="${srcset("avif")}" sizes="${sizes}">
                <source type="image/webp" srcset="${srcset("webp")}" sizes="${sizes}">
                <img src="${base}-1200-fallback.png" width="${variant.width}" height="${variant.height}" alt="${escapeAttr(entry.alt[lang])}" loading="${priority ? "eager" : "lazy"}" decoding="async"${priority ? ' fetchpriority="high"' : ""}>
              </picture>
            </div>`;
}

function systemPriceDisplay(offer, system) {
  return `${offer.priceLabel} $${system.startingPrice.toLocaleString("en-US")}`;
}

function legacyAnchor(system) {
  return system.legacyId ? `<span id="${system.legacyId}" aria-hidden="true"></span>` : "";
}

function comparisonDetails(lang) {
  const offer = commercialOffer[lang];
  const comparison = offer.comparison;
  return `
          <details class="comparison-details" id="compare">
            <summary>${offer.compareLink}</summary>
            <div class="comparison-scroller">
              <table class="comparison-table">
                <thead>
                  <tr>
                    <th scope="col"></th>
                    ${comparison.columns.map((name) => `<th scope="col">${name}</th>`).join("")}
                  </tr>
                </thead>
                <tbody>
                  ${comparison.rows
                    .map(
                      (row) => `
                  <tr>
                    <th scope="row">${row.label}</th>
                    ${row.values.map((value) => `<td${value === "—" ? ' class="is-empty"' : ""}>${value}</td>`).join("")}
                  </tr>`
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          </details>
          <div class="system-recommendation">
            <h3>${comparison.recommendationTitle}</h3>
            <p>${comparison.recommendation}</p>
            <a class="btn btn-primary" href="${pagePath(lang, comparison.ctaTarget)}">${comparison.cta}</a>
          </div>`;
}

function priceCompareStrip(lang) {
  // Mobile-only, non-sticky compact comparison shown immediately before the
  // stacked system cards. Scrolls away normally like any other section — no
  // position:sticky, no fixed overlay.
  const offer = commercialOffer[lang];
  return `
          <div class="price-compare" aria-label="${offer.title}">
            ${offer.systems
              .map(
                (system) => `
            <a class="price-compare-cell${system.badge ? " is-complete" : ""}" href="#${system.id}">
              <span class="price-compare-badge-slot">${system.badge ? `<span class="system-badge">${system.badge}</span>` : ""}</span>
              <span class="price-compare-name">${system.resultChain[system.resultChain.length - 1]}</span>
              <span class="price-compare-value">$${system.startingPrice.toLocaleString("en-US")}</span>
            </a>`
              )
              .join("")}
          </div>`;
}

function systemsOverviewSection(lang) {
  const offer = commercialOffer[lang];
  return `
      <section class="section" id="systems">
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">${offer.eyebrow}</p>
            <h2>${offer.title}</h2>
            <p>${offer.intro}</p>
            <p class="lead-capture-definition">${offer.leadCaptureDefinition}</p>
          </div>
          ${priceCompareStrip(lang)}
          <div class="system-offer-grid system-offer-grid-overview">
            ${offer.systems
              .map(
                (system, index) => `
            <article class="system-offer-card${system.badge ? " is-complete" : ""}" id="${system.id}">
              ${legacyAnchor(system)}
              ${system.badge ? `<div class="system-offer-topline"><span class="system-badge">${system.badge}</span></div>` : ""}
              <h3>${system.name}</h3>
              <p class="system-result-chain">${system.resultChain.join(" → ")}</p>
              ${productImage(SYSTEM_IMAGE_KEYS[index], lang, { sizes: "(max-width: 760px) 100vw, 420px" })}
              <p class="system-price-line"><span class="system-price">${systemPriceDisplay(offer, system)}</span></p>
              <div class="system-card-actions">
                <a class="btn btn-primary" href="${pagePath(lang, system.ctaTarget)}">${system.cta}</a>
              </div>
              <details class="system-summary-toggle">
                <summary>${offer.detailsLink}</summary>
                <div class="system-summary-block">
                  <h4>${offer.whoTitle}</h4>
                  ${offerList(system.ideal.slice(0, 2))}
                </div>
                <div class="system-summary-block">
                  <h4>${offer.resultTitle}</h4>
                  ${offerList(system.benefits.slice(0, 3))}
                </div>
                <a class="system-details-link" href="${pagePath(lang, "services")}#${system.id}">${offer.detailsLink}</a>
              </details>
            </article>`
              )
              .join("")}
          </div>
          <p class="compare-link-line"><a class="system-details-link" href="${pagePath(lang, "services")}#compare">${offer.compareLink}</a></p>
        </div>
      </section>`;
}

function systemsDetailSection(lang) {
  const offer = commercialOffer[lang];
  return `
      <section class="section" id="systems">
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">${offer.eyebrow}</p>
            <h2>${offer.title}</h2>
            <p>${offer.intro}</p>
            <p class="lead-capture-definition">${offer.leadCaptureDefinition}</p>
          </div>
          <div class="system-offer-grid">
            ${offer.systems
              .map(
                (system, index) => `
            <article class="system-offer-card system-offer-card-full${system.badge ? " is-complete" : ""}" id="${system.id}">
              ${legacyAnchor(system)}
              ${system.badge ? `<div class="system-offer-topline"><span class="system-badge">${system.badge}</span></div>` : ""}
              <h3>${system.name}</h3>
              <p class="system-result-chain">${system.resultChain.join(" → ")}</p>
              ${productImage(SYSTEM_IMAGE_KEYS[index], lang, { sizes: "(max-width: 760px) 100vw, 420px" })}
              <p class="system-price-line"><span class="system-price">${systemPriceDisplay(offer, system)}</span></p>
              <div class="system-card-actions">
                <a class="btn btn-primary" href="${pagePath(lang, system.ctaTarget)}">${system.cta}</a>
              </div>
              <p class="pricing-note">${system.pricingNote}</p>
              <details class="system-full-scope">
                <summary>${offer.implementationTitle}</summary>
                <p class="system-positioning">${system.positioning}</p>
                <section class="system-card-section" aria-labelledby="${system.id}-who">
                  <h4 id="${system.id}-who">${offer.whoTitle}</h4>
                  ${offerList(system.ideal)}
                </section>
                <section class="system-card-section" aria-labelledby="${system.id}-implementation">
                  <h4 id="${system.id}-implementation">${offer.implementationTitle}</h4>
                  ${system.implementationLead ? `<p class="implementation-lead">${system.implementationLead}</p>` : ""}
                  ${offerList(system.implementation)}
                </section>
                <section class="system-card-section" aria-labelledby="${system.id}-exclusions">
                  <h4 id="${system.id}-exclusions">${offer.exclusionsTitle}</h4>
                  ${offerList(system.exclusions, "exclusion-list")}
                </section>
                <section class="system-card-section" aria-labelledby="${system.id}-results">
                  <h4 id="${system.id}-results">${offer.resultTitle}</h4>
                  ${offerList(system.benefits)}
                </section>
              </details>
            </article>`
              )
              .join("")}
          </div>
          ${comparisonDetails(lang)}
        </div>
      </section>`;
}

const PILLAR_ICONS = ["search", "star", "form", "pipeline", "bell"];

function fivePillarsSection(lang) {
  const p = pillars[lang];
  return `
      <section class="section section-soft" id="pillars">
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">${p.eyebrow}</p>
            <h2>${p.title}</h2>
          </div>
          <div class="pillars-strip">
            ${p.items
              .map(
                (item, index) => `
            <div class="pillar-node">
              <span class="pillar-icon">${icon(PILLAR_ICONS[index])}</span>
              <div class="pillar-text">
                <h3 class="pillar-label">${item.label}</h3>
                <p class="pillar-result">${item.result}</p>
              </div>
            </div>
            ${index < p.items.length - 1 ? `<span class="pillar-connector" aria-hidden="true">${icon("arrowRight")}</span>` : ""}`
              )
              .join("")}
          </div>
        </div>
      </section>`;
}

const ROUTE_ICONS = ["route", "monitor"];

function routeSelectorSection(lang) {
  const r = routes[lang];
  return `
      <section class="section" id="choose">
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">${r.eyebrow}</p>
            <h2>${r.title}</h2>
          </div>
          <div class="route-grid">
            ${r.cards
              .map(
                (card, index) => `
            <article class="route-card">
              <div class="route-card-top">
                <span class="route-icon">${icon(ROUTE_ICONS[index])}</span>
                <div>
                  <span class="route-label">${card.label}</span>
                  <h3>${card.title}</h3>
                </div>
              </div>
              <p>${card.copy}</p>
              <a class="btn btn-secondary" href="${pagePath(lang, card.ctaTarget)}">${card.cta}</a>
            </article>`
              )
              .join("")}
          </div>
          <p class="route-outcome">${r.intro}</p>
        </div>
      </section>`;
}

function implementationSection(lang) {
  const plan = implementationPlan[lang];
  return `
      <section class="section section-soft" id="implementation">
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">${plan.eyebrow}</p>
            <h2>${plan.title}</h2>
          </div>
          <div class="impl-timeline">
            ${plan.steps
              .map(
                (step, index) => `
            <div class="impl-step">
              <span class="impl-step-dot">0${index + 1}</span>
              <h3>${step.title}</h3>
              <span class="impl-milestone">${step.milestone}</span>
            </div>
            ${index < plan.steps.length - 1 ? `<span class="impl-arrow">${icon("arrowRight")}</span>` : ""}`
              )
              .join("")}
          </div>
          <p class="section-disclaimer">${plan.note}</p>
        </div>
      </section>`;
}

function monthlyServicesSection(lang, soft = true, compact = false) {
  const m = commercialOffer[lang].monthly;
  const maintenanceItems = compact ? m.maintenance.inclusions.slice(0, 3) : m.maintenance.inclusions;
  const socialItems = compact ? m.socialAddOn.inclusions.slice(0, 3) : m.socialAddOn.inclusions;
  return `
      <section class="section${soft ? " section-soft" : ""}" id="monthly">
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">${m.eyebrow}</p>
            <h2>${m.title}</h2>
            ${compact ? "" : `<p>${m.intro}</p>`}
          </div>
          <div class="monthly-grid">
            <article class="monthly-card">
              <h3>${m.maintenance.name}</h3>
              <p class="monthly-price">${m.maintenance.price}<span class="monthly-unit">${m.maintenance.priceUnit}</span></p>
              ${offerList(maintenanceItems)}
            </article>
            <article class="monthly-card">
              <h3>${m.socialAddOn.name}</h3>
              <p class="monthly-price">${m.socialAddOn.price}<span class="monthly-unit">${m.socialAddOn.priceUnit}</span></p>
              ${compact ? "" : `<p class="monthly-note">${m.socialAddOn.note}</p>`}
              ${offerList(socialItems)}
              ${compact ? "" : offerList(m.socialAddOn.exclusions, "exclusion-list")}
            </article>
            <article class="monthly-card monthly-card-combo">
              <h3>${m.comboLabel}</h3>
              <p class="monthly-price">${m.comboPrice}<span class="monthly-unit">${m.comboPriceUnit}</span></p>
              <p class="monthly-note">${m.customNote}</p>
              <a class="btn btn-secondary" href="${pagePath(lang, m.ctaTarget)}">${m.cta}</a>
            </article>
          </div>
        </div>
      </section>`;
}

function faqSection(lang, limit = null) {
  const faq = commercialOffer[lang].faq;
  const items = limit ? faq.items.slice(0, limit) : faq.items;
  return `
      <section class="section section-soft" id="faq">
        <div class="container faq-layout">
          <div class="faq-heading">
            <p class="eyebrow">${faq.eyebrow}</p>
            <h2>${faq.title}</h2>
          </div>
          <div class="faq-list">
            ${items
              .map(
                ([question, answer]) => `
            <details class="faq-item">
              <summary>${question}</summary>
              <p>${answer}</p>
            </details>`
              )
              .join("")}
          </div>
        </div>
      </section>`;
}

function preferredLanguageValue(lang) {
  return lang === "es" ? "Spanish" : "English";
}

function consentNotice(lang) {
  const p = copy[lang].auditPage;
  return `<p class="form-consent">${p.consentPrefix} <a href="${pagePath(lang, "privacy")}">${p.consentPrivacy}</a> ${p.consentMiddle} <a href="${pagePath(lang, "terms")}">${p.consentTerms}</a>.</p>`;
}

function honeypotField(lang) {
  const label = String(lang).startsWith("es") ? "Deja este campo vacío" : "Leave this field empty";
  return `
            <div class="field honeypot-field" aria-hidden="true">
              <label for="${lang}-company-website-extra">${label}</label>
              <input id="${lang}-company-website-extra" name="companyWebsiteExtra" type="text" tabindex="-1" autocomplete="off">
            </div>`;
}

// Which business example the lead-capture flow renders. Swap this value to
// "restaurant", "spa", "flower" or "cleaning" to change the whole visual story.
const ACTIVE_FLOW_EXAMPLE = "barber";

const FLOW_CHANNELS = { en: ["Google", "Maps", "Reviews"], es: ["Google", "Maps", "Reseñas"] };
const FLOW_FOLLOWUP = {
  en: ["New request", "Contacted", "Confirmed"],
  es: ["Nueva solicitud", "Contactado", "Confirmado"]
};
const FLOW_CUSTOMER_CHANNEL = { en: "Customer · SMS", es: "Cliente · SMS" };
const FLOW_BUSINESS_TAG = { en: "Business", es: "Negocio" };

const captureFlowExamples = {
  barber: {
    category: { en: "Barber shop", es: "Barbería" },
    search: { en: "Barber shop near me", es: "Barbería cerca de mí" },
    rating: "4.9",
    results: {
      en: ["Fade & Co Barber", "Kings Barber Studio", "Downtown Fades"],
      es: ["Fade & Co Barber", "Kings Barber Studio", "Cortes Centro"]
    },
    channels: FLOW_CHANNELS,
    action: { en: "Book an appointment", es: "Reservar una cita" },
    request: {
      en: {
        title: "New booking request",
        fields: [["Name", "Michael"], ["Service", "Haircut"], ["Preferred time", "Friday · 4:00 PM"]],
        status: "New request"
      },
      es: {
        title: "Nueva solicitud de reserva",
        fields: [["Nombre", "Michael"], ["Servicio", "Corte de cabello"], ["Horario preferido", "Viernes · 4:00 PM"]],
        status: "Nueva solicitud"
      }
    },
    customerChannel: FLOW_CUSTOMER_CHANNEL,
    customerMsg: {
      en: "Thanks, Michael. We received your appointment request. A team member will confirm your time shortly.",
      es: "Gracias, Michael. Recibimos tu solicitud de cita. Un miembro del equipo confirmará tu horario en breve."
    },
    businessTag: FLOW_BUSINESS_TAG,
    businessMsg: { en: "New appointment request received", es: "Nueva solicitud de cita recibida" },
    followup: FLOW_FOLLOWUP
  },
  restaurant: {
    category: { en: "Restaurant", es: "Restaurante" },
    search: { en: "Restaurants near me", es: "Restaurantes cerca de mí" },
    rating: "4.8",
    results: {
      en: ["Bella Vita Trattoria", "Harbor Grill", "Sabor Latino"],
      es: ["Bella Vita Trattoria", "Harbor Grill", "Sabor Latino"]
    },
    channels: FLOW_CHANNELS,
    action: { en: "Reserve a table", es: "Reservar una mesa" },
    request: {
      en: {
        title: "New reservation request",
        fields: [["Name", "Michael"], ["Guests", "4 people"], ["Preferred time", "Friday · 8:00 PM"]],
        status: "New request"
      },
      es: {
        title: "Nueva solicitud de reserva",
        fields: [["Nombre", "Michael"], ["Personas", "4 personas"], ["Horario preferido", "Viernes · 8:00 PM"]],
        status: "Nueva solicitud"
      }
    },
    customerChannel: FLOW_CUSTOMER_CHANNEL,
    customerMsg: {
      en: "Thanks, Michael. We received your table reservation request. We'll confirm your booking shortly.",
      es: "Gracias, Michael. Recibimos tu solicitud de reserva de mesa. Confirmaremos tu reserva en breve."
    },
    businessTag: FLOW_BUSINESS_TAG,
    businessMsg: { en: "New reservation request received", es: "Nueva solicitud de reserva recibida" },
    followup: FLOW_FOLLOWUP
  },
  spa: {
    category: { en: "Massage spa", es: "Spa de masajes" },
    search: { en: "Massage spa near me", es: "Spa de masajes cerca de mí" },
    rating: "4.9",
    results: {
      en: ["Serenity Massage Spa", "Zen Wellness", "Urban Retreat"],
      es: ["Serenity Spa de Masajes", "Zen Wellness", "Urban Retreat"]
    },
    channels: FLOW_CHANNELS,
    action: { en: "Request an appointment", es: "Solicitar una cita" },
    request: {
      en: {
        title: "New appointment request",
        fields: [["Name", "Michael"], ["Service", "Deep tissue massage"], ["Preferred time", "Saturday · 11:00 AM"]],
        status: "New request"
      },
      es: {
        title: "Nueva solicitud de cita",
        fields: [["Nombre", "Michael"], ["Servicio", "Masaje de tejido profundo"], ["Horario preferido", "Sábado · 11:00 AM"]],
        status: "Nueva solicitud"
      }
    },
    customerChannel: FLOW_CUSTOMER_CHANNEL,
    customerMsg: {
      en: "Thanks, Michael. We received your appointment request. We'll confirm your session time shortly.",
      es: "Gracias, Michael. Recibimos tu solicitud de cita. Confirmaremos el horario de tu sesión en breve."
    },
    businessTag: FLOW_BUSINESS_TAG,
    businessMsg: { en: "New appointment request received", es: "Nueva solicitud de cita recibida" },
    followup: FLOW_FOLLOWUP
  },
  flower: {
    category: { en: "Flower shop", es: "Floristería" },
    search: { en: "Flower delivery near me", es: "Floristería cerca de mí" },
    rating: "4.9",
    results: {
      en: ["Petals & Co Florist", "Bloom Studio", "Rose Garden"],
      es: ["Petals & Co Floristería", "Bloom Studio", "Jardín de Rosas"]
    },
    channels: FLOW_CHANNELS,
    action: { en: "Request a bouquet or delivery", es: "Solicitar un ramo o entrega" },
    request: {
      en: {
        title: "New order request",
        fields: [["Name", "Michael"], ["Order", "Birthday bouquet"], ["Delivery", "Friday · Downtown"]],
        status: "New request"
      },
      es: {
        title: "Nueva solicitud de pedido",
        fields: [["Nombre", "Michael"], ["Pedido", "Ramo de cumpleaños"], ["Entrega", "Viernes · Centro"]],
        status: "Nueva solicitud"
      }
    },
    customerChannel: FLOW_CUSTOMER_CHANNEL,
    customerMsg: {
      en: "Thanks, Michael. We received your order request. We'll confirm the details and delivery shortly.",
      es: "Gracias, Michael. Recibimos tu solicitud de pedido. Confirmaremos los detalles y la entrega en breve."
    },
    businessTag: FLOW_BUSINESS_TAG,
    businessMsg: { en: "New order request received", es: "Nuevo pedido recibido" },
    followup: FLOW_FOLLOWUP
  },
  cleaning: {
    category: { en: "Cleaning company", es: "Empresa de limpieza" },
    search: { en: "House cleaning near me", es: "Limpieza de casas cerca de mí" },
    rating: "4.8",
    results: {
      en: ["Brightside Cleaning Co", "Sparkle Home", "Fresh Spaces"],
      es: ["Brightside Limpieza", "Sparkle Home", "Espacios Frescos"]
    },
    channels: FLOW_CHANNELS,
    action: { en: "Request a quote", es: "Solicitar una cotización" },
    request: {
      en: {
        title: "New quote request",
        fields: [["Name", "Michael"], ["Property", "3-bedroom home"], ["Service", "Move-out cleaning"]],
        status: "New request"
      },
      es: {
        title: "Nueva solicitud de cotización",
        fields: [["Nombre", "Michael"], ["Propiedad", "Casa de 3 habitaciones"], ["Servicio", "Limpieza de mudanza"]],
        status: "Nueva solicitud"
      }
    },
    customerChannel: FLOW_CUSTOMER_CHANNEL,
    customerMsg: {
      en: "Thanks, Michael. We received your quote request. We'll send your estimate shortly.",
      es: "Gracias, Michael. Recibimos tu solicitud de cotización. Te enviaremos tu presupuesto en breve."
    },
    businessTag: FLOW_BUSINESS_TAG,
    businessMsg: { en: "New quote request received", es: "Nueva solicitud de cotización recibida" },
    followup: FLOW_FOLLOWUP
  }
};

const captureFlowCopy = {
  en: {
    label: "HOW IT WORKS — CUSTOMER JOURNEY",
    headline: "From a search to an organized opportunity.",
    supporting:
      "A customer finds the business, submits a request or booking, the system records the opportunity, and an immediate response is triggered.",
    stageLabels: ["They find you", "You capture the opportunity", "You respond and follow up"],
    ui: { foundOn: "Found on", customerReceives: "Customer receives", businessReceives: "Business receives" },
    summary: [
      "They find you",
      "They request or book",
      "The opportunity is recorded",
      "They receive confirmation",
      "The business follows up"
    ]
  },
  es: {
    label: "CÓMO FUNCIONA — RECORRIDO DEL CLIENTE",
    headline: "De una búsqueda a una oportunidad organizada.",
    supporting:
      "Una persona encuentra el negocio, solicita información o reserva, el sistema registra la oportunidad y activa una respuesta inmediata.",
    stageLabels: ["Te encuentran", "Captas la oportunidad", "Respondes y das seguimiento"],
    ui: { foundOn: "Encontrado en", customerReceives: "El cliente recibe", businessReceives: "El negocio recibe" },
    summary: [
      "Te encuentran",
      "Solicitan o reservan",
      "La oportunidad queda registrada",
      "Reciben confirmación",
      "El negocio da seguimiento"
    ]
  }
};

const FLOW_ICON_SEARCH =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>';
const FLOW_ICON_ACTION =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M8 2.5v4M16 2.5v4M3 10h18"/></svg>';
const FLOW_ARROW =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';

// Shared compact icon set. Purpose-built line icons (no photography, no stock
// imagery) reused across the hero visual, the five pillars, and the three
// per-system mini-diagrams so the whole site speaks one visual language.
const ICONS = {
  search:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>',
  pin:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  monitor:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4" width="19" height="13" rx="1.5"/><path d="M8 21h8M12 17v4"/></svg>',
  star:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l2.6 5.4 5.9.7-4.3 4.1 1.1 5.9L12 16.7l-5.3 2.9 1.1-5.9-4.3-4.1 5.9-.7z"/></svg>',
  form:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  inbox:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12h5l1.5 3h4l1.5-3h5"/><path d="M5 4.5h14L21 12v6a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18v-6z"/></svg>',
  pipeline:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="6.5" height="15" rx="1.2"/><rect x="9.5" y="4.5" width="6.5" height="9" rx="1.2"/><rect x="16" y="4.5" width="4.5" height="5" rx="1.2"/></svg>',
  bell:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 3h16z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>',
  check:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l5 5L19 7"/></svg>',
  cross:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  clock:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  calendar:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>',
  arrowRight:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
  arrowDown:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v15M6 13l6 6 6-6"/></svg>',
  scale:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M7 21h10"/><path d="M4 8l4-2 4 2-4 8zM16 8l4-2 4 2-4 8z" transform="translate(-2 0) scale(0.9)"/></svg>',
  route:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M5 8v3a4 4 0 0 0 4 4h6a4 4 0 0 1 4 3"/></svg>'
};

function icon(name, cls = "") {
  return `<span class="mini-icon${cls ? " " + cls : ""}" aria-hidden="true">${ICONS[name]}</span>`;
}

function captureFlowSection(lang) {
  const c = captureFlowCopy[lang];
  const ex = captureFlowExamples[ACTIVE_FLOW_EXAMPLE];
  const results = ex.results[lang];
  const channels = ex.channels[lang];
  const req = ex.request[lang];
  const followup = ex.followup[lang];

  return `
      <section class="section capture-flow" id="journey" aria-label="${c.label}">
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">${c.label}</p>
            <h2>${c.headline}</h2>
            <p>${c.supporting}</p>
          </div>

          <div class="flow-stages">
            <article class="flow-stage">
              <div class="flow-stage-head">
                <span class="flow-stage-num">01</span>
                <h3 class="flow-stage-label">${c.stageLabels[0]}</h3>
              </div>
              <div class="flow-card">
                <div class="flow-phone">
                  <div class="flow-search">
                    <span class="flow-search-icon">${FLOW_ICON_SEARCH}</span>
                    <span>${ex.search[lang]}</span>
                  </div>
                  <ul class="flow-results">
                    ${results
                      .map(
                        (name, index) =>
                          `<li class="${index === 0 ? "is-active" : ""}"><span class="flow-result-pin" aria-hidden="true"></span><span class="flow-result-name">${name}</span>${
                            index === 0 ? `<span class="flow-stars">★ ${ex.rating}</span>` : ""
                          }</li>`
                      )
                      .join("")}
                  </ul>
                </div>
                <div class="flow-chips" aria-label="${c.ui.foundOn}">
                  ${channels.map((ch) => `<span class="flow-chip">${ch}</span>`).join("")}
                </div>
              </div>
            </article>

            <div class="flow-arrow" aria-hidden="true">${FLOW_ARROW}</div>

            <article class="flow-stage">
              <div class="flow-stage-head">
                <span class="flow-stage-num">02</span>
                <h3 class="flow-stage-label">${c.stageLabels[1]}</h3>
              </div>
              <div class="flow-card">
                <div class="flow-action"><span class="flow-action-icon">${FLOW_ICON_ACTION}</span>${ex.action[lang]}</div>
                <div class="request-card">
                  <span class="request-title">${req.title}</span>
                  <dl class="request-fields">
                    ${req.fields
                      .map(([key, value]) => `<div class="request-row"><dt>${key}</dt><dd>${value}</dd></div>`)
                      .join("")}
                  </dl>
                  <span class="request-status">${req.status}</span>
                </div>
              </div>
            </article>

            <div class="flow-arrow" aria-hidden="true">${FLOW_ARROW}</div>

            <article class="flow-stage">
              <div class="flow-stage-head">
                <span class="flow-stage-num">03</span>
                <h3 class="flow-stage-label">${c.stageLabels[2]}</h3>
              </div>
              <div class="flow-card">
                <div class="msg-bubble is-customer">
                  <span class="msg-tag">${ex.customerChannel[lang]}</span>
                  <p>${ex.customerMsg[lang]}</p>
                </div>
                <div class="msg-bubble is-business">
                  <span class="msg-tag">${ex.businessTag[lang]}</span>
                  <p>${ex.businessMsg[lang]}</p>
                </div>
                <div class="followup-track">
                  ${followup
                    .map(
                      (step, index) =>
                        `<span class="followup-step ${index === 0 ? "is-done" : ""}">${step}</span>`
                    )
                    .join('<span class="followup-sep" aria-hidden="true"></span>')}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>`;
}

// Portfolio data. `type: "real"` publishes now; `type: "demo"` is supported by
// the structure for the future but is intentionally not rendered yet.
const portfolioProjects = [
  {
    id: "klinner",
    type: "real",
    name: "Klinner Cleaning & Maintenance",
    url: "https://klinnercleaning.com",
    image: "/public/images/projects/klinner.jpg",
    imageAlt: {
      en: "Homepage of the Klinner Cleaning & Maintenance website showing its hero section and main navigation",
      es: "Página de inicio del sitio web de Klinner Cleaning & Maintenance mostrando su sección principal y su navegación"
    },
    industry: { en: "Cleaning & Property Services", es: "Limpieza y servicios para propiedades" },
    summary: {
      en: "A professional digital presence created for a Nashville cleaning and property-services company, designed to explain its services clearly, build trust, improve local visibility, and make requesting a quote easier.",
      es: "Una presencia digital profesional creada para una empresa de limpieza y servicios para propiedades en Nashville, diseñada para explicar sus servicios claramente, generar confianza, mejorar la visibilidad local y facilitar la solicitud de cotizaciones."
    },
    business: {
      en: "A cleaning and property-services company based in Nashville, Tennessee.",
      es: "Una empresa de limpieza y servicios para propiedades con sede en Nashville, Tennessee."
    },
    need: {
      en: "The company needed a professional way to present its services, build trust with local customers, and make requesting a quote simple on any device.",
      es: "La empresa necesitaba una forma profesional de presentar sus servicios, generar confianza con clientes locales y facilitar la solicitud de cotizaciones desde cualquier dispositivo."
    },
    built: {
      en: "A responsive website that presents the company clearly, explains its services, provides a direct quote pathway, and lays an SEO foundation for local visibility.",
      es: "Un sitio web responsive que presenta a la empresa con claridad, explica sus servicios, ofrece una ruta directa para solicitar cotizaciones y establece una base SEO para la visibilidad local."
    },
    elements: {
      en: [
        "Responsive website",
        "Service presentation",
        "Quote & contact pathway",
        "Mobile optimization",
        "Local service information",
        "Trust elements",
        "SEO foundation"
      ],
      es: [
        "Sitio web responsive",
        "Presentación de servicios",
        "Ruta de cotización y contacto",
        "Optimización móvil",
        "Información de servicio local",
        "Elementos de confianza",
        "Base SEO"
      ]
    },
    journey: {
      en: ["Find the business", "Review services", "Build trust", "Request a quote", "Business receives the request"],
      es: ["Encuentra el negocio", "Revisa los servicios", "Genera confianza", "Solicita una cotización", "El negocio recibe la solicitud"]
    }
  },
  {
    id: "gladiadores",
    type: "real",
    name: "Gladiadores App",
    url: "https://gladiadores.app",
    ctaLabel: { en: "View Live Project", es: "Ver Proyecto en Vivo" },
    image: "/public/images/projects/gladiadores.jpg",
    // The source cover is 1280x720 (16:9); the shared project-shot box is
    // 1200x750 (1.6:1), which is narrower than the source — object-fit:cover
    // crops horizontally. Centered (the default for every other project
    // card) clips the leading "G" of "GLADIADORES". Pin the crop to the
    // left edge so the wordmark stays fully intact; the only thing lost off
    // the right is background gym equipment, not a subject or text.
    imagePosition: "left center",
    imageAlt: {
      en: "Gladiadores Training brand cover — two athletes training, with the tagline \"Your transformation starts today\"",
      es: "Portada de marca de Gladiadores Training — dos atletas entrenando, con el lema \"Tu transformación empieza hoy\""
    },
    industry: { en: "Fitness & Community Platform", es: "Plataforma de Fitness y Comunidad" },
    summary: {
      en: "A digital fitness and community platform built to guide members through training, habits and personal progress in one connected experience.",
      es: "Una plataforma digital de fitness y comunidad creada para guiar a sus miembros a través del entrenamiento, los hábitos y su progreso personal en una experiencia conectada."
    },
    business: {
      en: "A fitness and community platform built to keep members engaged through structured training and shared progress.",
      es: "Una plataforma de fitness y comunidad creada para mantener a sus miembros comprometidos mediante entrenamiento estructurado y progreso compartido."
    },
    need: {
      en: "The team needed a connected experience where members could follow guided training, build habits, and track personal progress from their phone.",
      es: "El equipo necesitaba una experiencia conectada donde los miembros pudieran seguir entrenamiento guiado, construir hábitos y monitorear su progreso personal desde el teléfono."
    },
    built: {
      en: "A mobile-first fitness and community platform that guides members through training, habit-building and progress tracking in one connected experience.",
      es: "Una plataforma de fitness y comunidad mobile-first que guía a los miembros a través del entrenamiento, la construcción de hábitos y el seguimiento de progreso en una experiencia conectada."
    },
    elements: {
      en: ["Fitness platform", "Guided training", "Member experience", "Progress system", "Mobile-first experience"],
      es: ["Plataforma fitness", "Entrenamiento guiado", "Experiencia de miembros", "Sistema de progreso", "Experiencia mobile-first"]
    },
    journey: {
      en: ["Join the community", "Start guided training", "Build habits", "Track progress", "Stay engaged"],
      es: ["Únete a la comunidad", "Comienza el entrenamiento guiado", "Construye hábitos", "Sigue tu progreso", "Mantente conectado"]
    }
  },
  {
    id: "forge",
    type: "demo",
    name: "FORGE Fitness Coaching",
    url: { en: "/demos/forge", es: "/demos/forge/es" },
    image: "/public/images/projects/forge-demo.jpg",
    imageAlt: {
      en: "Hero of the FORGE Fitness Coaching demo site — a bold 12-week transformation challenge landing page",
      es: "Portada del sitio demo FORGE Fitness Coaching — una landing potente de reto de transformación de 12 semanas"
    },
    industry: { en: "Fitness Coaching (Demo)", es: "Coaching fitness (Demo)" },
    summary: {
      en: "A concept landing page for a fitness transformation brand — built to turn attention into applications with a bold offer, a clear program, and a lead-capture flow. Fictional brand, illustrative content.",
      es: "Una landing de concepto para una marca de transformación fitness — creada para convertir la atención en aplicaciones con una oferta potente, un programa claro y un flujo de captación. Marca ficticia, contenido ilustrativo."
    },
    business: {
      en: "FORGE is a fictional fitness-coaching brand offering a 12-week body-transformation challenge. This is a concept demo, not a real client.",
      es: "FORGE es una marca ficticia de coaching fitness que ofrece un reto de transformación corporal de 12 semanas. Es un demo de concepto, no un cliente real."
    },
    need: {
      en: "A transformation coach needs a page that sells the program at a glance, builds belief, and captures qualified applicants — not just a link in a bio.",
      es: "Un coach de transformación necesita una página que venda el programa de un vistazo, genere creencia y capte aplicantes calificados — no solo un link en la bio."
    },
    built: {
      en: "A bold, energetic single-page site: a strong offer, the program broken into pillars and a weekly timeline, sample results and testimonials, clear program tiers, and an application form — bilingual (EN/ES).",
      es: "Un sitio de una página potente y enérgico: una oferta clara, el programa dividido en pilares y una línea de tiempo semanal, resultados y testimonios de muestra, niveles de programa claros y un formulario de aplicación — bilingüe (EN/ES)."
    },
    elements: {
      en: [
        "Conversion-focused hero",
        "Program in 4 pillars",
        "12-week timeline",
        "Program tiers",
        "Application / lead capture",
        "Bilingual (EN/ES)",
        "Mobile optimized"
      ],
      es: [
        "Hero enfocado en conversión",
        "Programa en 4 pilares",
        "Línea de tiempo de 12 semanas",
        "Niveles de programa",
        "Aplicación / captación",
        "Bilingüe (EN/ES)",
        "Optimizado para móvil"
      ]
    },
    journey: {
      en: ["Land on the offer", "Understand the program", "See the results", "Choose a level", "Apply for the challenge"],
      es: ["Llega a la oferta", "Entiende el programa", "Ve los resultados", "Elige un nivel", "Aplica al reto"]
    }
  },
  {
    id: "barber",
    type: "demo",
    name: "THE FADE ROOM",
    url: { en: "/demos/barber", es: "/demos/barber/es" },
    image: "/public/images/projects/barber-demo.jpg",
    imageAlt: {
      en: "Hero of THE FADE ROOM demo site — a classic barbershop landing page with online booking",
      es: "Portada del sitio demo THE FADE ROOM — una landing de barbería clásica con reserva en línea"
    },
    industry: { en: "Barbershop (Demo)", es: "Barbería (Demo)" },
    summary: {
      en: "A concept site for a classic barbershop — built so a walk-in-only shop can be found on Google, show its services and prices clearly, and take bookings around the clock. Fictional brand, illustrative content.",
      es: "Un sitio de concepto para una barbería clásica — creado para que una barbería que solo recibe sin cita sea encontrada en Google, muestre sus servicios y precios con claridad y reciba reservas a toda hora. Marca ficticia, contenido ilustrativo."
    },
    business: {
      en: "THE FADE ROOM is a fictional classic barbershop offering cuts, beard work and hot towel shaves. This is a concept demo, not a real client.",
      es: "THE FADE ROOM es una barbería clásica ficticia con cortes, trabajo de barba y afeitados con toalla caliente. Es un demo de concepto, no un cliente real."
    },
    need: {
      en: "Most local barbershops live on social media alone: no website, no prices online, and every booking handled by phone or walk-in — so after-hours customers are simply lost.",
      es: "La mayoría de las barberías locales viven solo en redes: sin web, sin precios en línea y con cada reserva por teléfono o sin cita — así se pierden los clientes que buscan fuera del horario."
    },
    built: {
      en: "A classic, premium single-page site: a clear service and price list, the shop's craft and story, a 60-second booking flow, sample reviews, hours and location — bilingual (EN/ES).",
      es: "Un sitio de una página clásico y premium: lista clara de servicios y precios, el oficio y la historia de la barbería, un flujo de reserva de 60 segundos, reseñas de muestra, horario y ubicación — bilingüe (EN/ES)."
    },
    elements: {
      en: [
        "Service & price list",
        "Online booking flow",
        "Hours & location",
        "Reviews section",
        "Mobile optimized",
        "Bilingual (EN/ES)",
        "Local SEO foundation"
      ],
      es: [
        "Lista de servicios y precios",
        "Flujo de reserva en línea",
        "Horario y ubicación",
        "Sección de reseñas",
        "Optimizado para móvil",
        "Bilingüe (EN/ES)",
        "Base de SEO local"
      ]
    },
    journey: {
      en: ["Search for a barber", "Find the shop", "Check services & prices", "Book a chair", "Shop receives the booking"],
      es: ["Busca una barbería", "Encuentra el local", "Revisa servicios y precios", "Reserva una silla", "La barbería recibe la reserva"]
    }
  }
];

function projectCard(lang, project, p) {
  const elements = project.elements[lang];
  const journey = project.journey[lang];
  const isDemo = project.type === "demo";
  const url = project.url ? (typeof project.url === "string" ? project.url : project.url[lang]) : null;
  // Falls back to the shared viewLive/viewDemo copy every other project
  // uses (unchanged); only set project.ctaLabel when a project needs its
  // own exact wording.
  const ctaLabel = project.ctaLabel ? project.ctaLabel[lang] : isDemo ? p.viewDemo : p.viewLive;
  // The wrapper below is always aria-hidden="true" (the project name/summary
  // text carries the accessible content), so this image is decorative to
  // assistive tech regardless of language — alt="" is the correct value, not
  // a long description that a screen reader will never reach anyway. That
  // also sidesteps embedding quoted taglines (e.g. Gladiadores') into an
  // attribute value.
  const shotImg = project.image
    ? `<img src="${project.image}" alt="" width="1200" height="750" loading="lazy" decoding="async"${project.imagePosition ? ` style="object-position: ${project.imagePosition}"` : ""}>`
    : `<span>${p.screenshotPending}</span>`;
  const shot = url
    ? `<a class="project-shot${project.image ? "" : " project-shot-placeholder"}" href="${url}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">
              ${shotImg}
            </a>`
    : `<div class="project-shot${project.image ? "" : " project-shot-placeholder"}" aria-hidden="true">
              ${shotImg}
            </div>`;
  return `
          <article class="project-card">
            ${shot}
            <div class="project-body">
              <div class="project-top">
                <span class="project-badge${isDemo ? " is-demo" : ""}">${isDemo ? p.demoBadge : p.realBadge}</span>
                <span class="project-industry">${project.industry[lang]}</span>
              </div>
              <h2 class="project-name">${project.name}</h2>
              <p class="project-summary">${project.summary[lang]}</p>
              <ul class="project-tags">
                ${elements.slice(0, 3).map((item) => `<li>${item}</li>`).join("")}
              </ul>
              <details class="project-details">
                <summary>${p.detailsToggle}</summary>
                <div class="project-detail-inner">
                  <div class="project-detail-block">
                    <h3>${p.detail.business}</h3>
                    <p>${project.business[lang]}</p>
                  </div>
                  <div class="project-detail-block">
                    <h3>${p.detail.need}</h3>
                    <p>${project.need[lang]}</p>
                  </div>
                  <div class="project-detail-block">
                    <h3>${p.detail.built}</h3>
                    <p>${project.built[lang]}</p>
                  </div>
                  <div class="project-detail-block">
                    <h3>${p.detail.elements}</h3>
                    ${offerList(elements)}
                  </div>
                  <div class="project-detail-block">
                    <h3>${p.detail.journey}</h3>
                    <div class="project-journey">
                      ${journey
                        .map((step) => `<span class="journey-step">${step}</span>`)
                        .join('<span class="journey-arrow" aria-hidden="true">›</span>')}
                    </div>
                  </div>
                </div>
              </details>
              ${
                url
                  ? `<div class="project-actions">
                <a class="btn btn-primary" href="${url}" target="_blank" rel="noopener noreferrer">${ctaLabel}</a>
              </div>`
                  : ""
              }
            </div>
          </article>`;
}

function projectsPage(lang) {
  const p = copy[lang].projectsPage;
  const reals = portfolioProjects.filter((project) => project.type === "real");
  const demos = portfolioProjects.filter((project) => project.type === "demo");
  const demoSection = demos.length
    ? `
      <section class="section section-tight" id="demos">
        <div class="container">
          <div class="section-heading demos-heading">
            <h2>${p.demoSectionTitle}</h2>
            <p>${p.demoSectionNote}</p>
          </div>
          <div class="project-grid">
            ${demos.map((project) => projectCard(lang, project, p)).join("")}
          </div>
        </div>
      </section>`
    : "";
  const body = `
    <main id="main">
      <section class="page-hero">
        <div class="container page-hero-inner">
          <p class="eyebrow">${p.eyebrow}</p>
          <h1>${p.h1}</h1>
          <p>${p.subtitle}</p>
        </div>
      </section>

      <section class="section section-tight">
        <div class="container project-grid">
          ${reals.map((project) => projectCard(lang, project, p)).join("")}
        </div>
      </section>
${demoSection}
    </main>`;

  return shell(lang, p, "projects", "projects", body);
}

function homePage(lang) {
  const t = copy[lang];
  const h = t.home;
  const ba = h.beforeAfter;
  const reals = portfolioProjects.filter((project) => project.type === "real");
  const p = t.projectsPage;
  const body = `
    <main id="main">
      <section class="hero hero-home" id="home">
        <div class="container">
          <div class="hero-eyebrow-top">
            <p class="eyebrow">${h.eyebrow}</p>
          </div>
          <div class="hero-grid hero-grid-solo">
            ${productImage("hero", lang, { priority: true, sizes: "(max-width: 900px) 100vw, 900px", className: "product-visual-hero" })}
            <div class="hero-copy">
              <h1>${h.headline}</h1>
              <div class="hero-supporting-copy">
                ${h.subtitle.map((paragraph) => `<p>${paragraph}</p>`).join("")}
              </div>
              <div class="hero-actions hero-actions-stacked">
                <a class="btn btn-primary btn-full" href="${pagePath(lang, "contact")}">${t.cta.findSystem} <span aria-hidden="true">&rarr;</span></a>
                <a class="btn btn-secondary btn-full" href="${pagePath(lang, "free-audit")}">${t.cta.audit} <span aria-hidden="true">&rarr;</span></a>
              </div>
              <div class="stage-banner" hidden data-stage-banner data-existing-message="${h.stageBanner.existing}" data-zero-message="${h.stageBanner.zero}"></div>
            </div>
          </div>
        </div>
      </section>

      <section class="section section-soft" id="problem">
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">${h.problemEyebrow}</p>
            <h2>${h.problemTitle}</h2>
            <p>${h.problemCopy}</p>
          </div>
          <div class="before-after-panel">
            <div class="before-after-heads">
              <span class="before-after-head is-before">${icon("cross")}${ba.beforeLabel}</span>
              <span class="before-after-head is-after">${icon("check")}${ba.afterLabel}</span>
            </div>
            ${ba.before
              .slice(0, 3)
              .map(
                (item, i) => `
            <div class="before-after-row">
              <span class="before-after-item is-before">${icon("cross")}<span>${item}</span></span>
              <span class="before-after-row-arrow">${icon("arrowRight")}</span>
              <span class="before-after-item is-after">${icon("check")}<span>${ba.after[i]}</span></span>
            </div>`
              )
              .join("")}
          </div>
        </div>
      </section>

      ${fivePillarsSection(lang)}

      ${systemsOverviewSection(lang)}

      ${routeSelectorSection(lang)}

${captureFlowSection(lang)}

      <section class="section section-tight our-work" aria-label="${p.homeEntry.label}">
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">${p.homeEntry.label}</p>
            <h2>${p.homeEntry.headline}</h2>
            <p>${p.homeEntry.copy}</p>
          </div>
          <div class="project-grid">
            ${reals.map((project) => projectCard(lang, project, p)).join("")}
          </div>
          <div class="our-work-panel our-work-panel-cta">
            <a class="btn btn-secondary" href="${pagePath(lang, "projects")}">${p.homeEntry.cta}</a>
          </div>
        </div>
      </section>

      ${implementationSection(lang)}

      ${monthlyServicesSection(lang, true, true)}

      <section class="section section-soft" id="about-preview">
        <div class="container about-band">
          <div class="about-copy">
            <p class="eyebrow">${h.aboutEyebrow}</p>
            <h2>${h.aboutTitle}</h2>
            <p>${h.aboutCopy}</p>
            <ul class="check-list">
              ${h.aboutBullets.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </div>
          <div class="stats-panel" aria-label="BLYNX focus areas">
            ${h.statItems
              .map(
                ([title, text]) => `
            <div class="stat-item">
              <strong>${title}</strong>
              <span>${text}</span>
            </div>`
              )
              .join("")}
          </div>
        </div>
      </section>

      ${faqSection(lang, 4)}

      <section class="section" id="final-cta">
        <div class="container">
          <div class="cta-panel">
            <h2>${h.finalTitle}</h2>
            <p>${h.finalSubtitle}</p>
            <div class="cta-actions">
              <a class="btn btn-primary" href="${pagePath(lang, "contact")}">${t.cta.findSystem}</a>
              <a class="btn btn-secondary" href="${pagePath(lang, "free-audit")}">${t.cta.audit}</a>
            </div>
          </div>
        </div>
      </section>
    </main>`;

  return shell(lang, h, "home", "", body);
}

function auditPage(lang) {
  const t = copy[lang];
  const p = t.auditPage;
  const requiredUrlLabel = p.fields.website;
  const additionalUrlLabel = p.fields.additionalUrl;
  const body = `
    <main id="main">
      <section class="page-hero">
        <div class="container page-hero-inner">
          <p class="eyebrow">${p.eyebrow}</p>
          <h1>${p.h1}</h1>
          <p>${p.subtitle}</p>
          <span class="trust-line">${p.trust}</span>
        </div>
      </section>

      <section class="section section-soft" id="audit-flow">
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">${p.eyebrow}</p>
            <h2>${p.flowTitle}</h2>
            <p>${p.flowSubtitle}</p>
          </div>
          <div class="audit-flow" aria-label="Free audit flow">
            ${auditFlow[lang]
              .map(
                ([title, text], index) => `
            <article class="audit-step">
              <div class="step-number">${index + 1}</div>
              <h3>${title}</h3>
              <p>${text}</p>
            </article>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="section section-tight">
        <div class="container form-layout">
          <aside class="form-intro">
            <h2>${p.introTitle}</h2>
            <p>${p.introCopy}</p>
            <p class="form-fit-line">${p.fitLine}</p>
            <ul class="check-list">
              ${p.bullets.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </aside>

          <form class="form-card" onsubmit="handleAuditSubmit(event)" data-success-message="${p.success}" data-error-message="${p.error}" data-loading-label="${p.loading}">
            <input type="hidden" name="businessStage" data-business-stage-field>
            <input type="hidden" name="preferredLanguage" value="${preferredLanguageValue(lang)}" data-preferred-language-field>
            ${honeypotField(lang)}
            <div class="form-grid">
              <div class="field">
                <label for="full-name">${p.fields.fullName}</label>
                <input id="full-name" name="fullName" type="text" autocomplete="name" required>
              </div>
              <div class="field">
                <label for="business-name">${p.fields.businessName}</label>
                <input id="business-name" name="businessName" type="text" autocomplete="organization" required>
              </div>
              <div class="field">
                <label for="email">${p.fields.email}</label>
                <input id="email" name="email" type="email" autocomplete="email" required>
              </div>
              <div class="field">
                <label for="city-state">${p.fields.cityState}</label>
                <input id="city-state" name="cityState" type="text" autocomplete="address-level2" required>
              </div>
              <div class="field">
                <label for="business-type">${p.fields.businessType}</label>
                <input id="business-type" name="businessType" type="text" placeholder="${p.placeholders.businessType}" required>
              </div>
              <div class="field">
                <label for="website-url">${requiredUrlLabel}</label>
                <input id="website-url" name="websiteUrl" type="text" inputmode="url" autocomplete="url" autocapitalize="none" spellcheck="false" data-flexible-url placeholder="example.com" required>
              </div>
              <div class="field">
                <label for="main-goal">${p.fields.mainGoal}</label>
                <select id="main-goal" name="mainGoal" required>
                  <option value="">${p.fields.mainGoal}</option>
                  ${p.improvements.map((item) => `<option>${item}</option>`).join("")}
                </select>
              </div>
            </div>
            <details class="form-details">
              <summary>${p.detailsSummary}</summary>
              <div class="form-grid">
                <div class="field">
                  <label for="phone">${p.fields.phone}</label>
                  <input id="phone" name="phone" type="tel" autocomplete="tel">
                </div>
                <div class="field">
                  <label for="gbp-link">${additionalUrlLabel}</label>
                  <input id="gbp-link" name="googleBusinessProfileLink" type="text" inputmode="url" autocomplete="url" autocapitalize="none" spellcheck="false" data-flexible-url placeholder="${p.placeholders.gbp}">
                </div>
                <div class="field">
                  <label for="website-status">${p.fields.websiteStatus}</label>
                  <select id="website-status" name="websiteStatus">
                    <option value="">${p.fields.websiteStatus}</option>
                    ${p.websiteStatusOptions.map((item) => `<option>${item}</option>`).join("")}
                  </select>
                </div>
                <div class="field">
                  <label for="gbp-status">${p.fields.gbpStatus}</label>
                  <select id="gbp-status" name="googleBusinessProfileStatus">
                    <option value="">${p.fields.gbpStatus}</option>
                    ${p.gbpStatusOptions.map((item) => `<option>${item}</option>`).join("")}
                  </select>
                </div>
                <div class="field field-full">
                  <label for="timeline">${p.fields.timeline}</label>
                  <select id="timeline" name="timeline">
                    <option value="">${p.fields.timeline}</option>
                    ${p.timelines.map((item) => `<option>${item}</option>`).join("")}
                  </select>
                </div>
                <div class="field field-full">
                  <label for="message">${p.fields.message}</label>
                  <textarea id="message" name="message" placeholder="${p.placeholders.message}"></textarea>
                </div>
              </div>
            </details>
            <div class="form-actions">
              <button class="btn btn-primary btn-full" type="submit">${p.submit}</button>
              ${consentNotice(lang)}
              <p class="form-note">${p.note}</p>
              <div class="form-status" role="status" aria-live="polite" tabindex="-1" hidden data-form-status></div>
            </div>
          </form>
        </div>
      </section>
    </main>`;

  return shell(lang, p, "", "free-audit", body);
}

function stageLandingPage(lang, stage) {
  const p = stageLandingPages[lang][stage];
  const auditHref = pagePath(lang, p.auditSlug);
  const body = `
    <main id="main">
      <section class="page-hero">
        <div class="container page-hero-inner">
          <p class="eyebrow">${p.eyebrow}</p>
          <h1>${p.h1}</h1>
          <p>${p.subtitle}</p>
          <div class="hero-actions centered-actions">
            <a class="btn btn-primary" href="${auditHref}" data-stage-choice="${stage}">${p.cta}</a>
            <a class="btn btn-secondary" href="#stage-process">${copy[lang].cta.services}</a>
          </div>
        </div>
      </section>
${pageMediaBand(`/public/images/site/path-${stage}.jpg`, SITE_MEDIA_ALTS[stage][lang])}
      <section class="section section-tight">
        <div class="container feature-grid">
          ${p.cards
            .map(
              ([title, text], index) => `
          <article class="feature-card">
            <div class="feature-icon">${String(index + 1).padStart(2, "0")}</div>
            <h3>${title}</h3>
            <p>${text}</p>
          </article>`
            )
            .join("")}
        </div>
      </section>

      <section class="section section-soft" id="stage-process">
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">${p.eyebrow}</p>
            <h2>${p.processTitle}</h2>
          </div>
          <div class="process-grid">
            ${p.steps
              .map(
                (step, index) => `
          <article class="process-card">
            <div class="step-number">${index + 1}</div>
            <h3>${step}</h3>
          </article>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="cta-panel">
            <h2>${p.ctaTitle}</h2>
            <p>${p.ctaSubtitle}</p>
            <div class="cta-actions">
              <a class="btn btn-primary" href="${auditHref}" data-stage-choice="${stage}">${p.cta}</a>
            </div>
          </div>
        </div>
      </section>
    </main>`;

  return shell(lang, p, "", stage, body);
}

function stageAuditPage(lang, stage) {
  const base = copy[lang].auditPage;
  const p = stageAuditPages[lang][stage];
  const auditSlug = `free-audit-${stage}`;
  const meta = { ...p, auditSlug };
  const commonLabels = base.fields;
  const presenceFields =
    stage === "existing"
      ? `
              <div class="field">
                <label for="${lang}-${stage}-website-url">${base.fields.website}</label>
                <input id="${lang}-${stage}-website-url" name="websiteUrl" type="text" inputmode="url" autocomplete="url" autocapitalize="none" spellcheck="false" data-flexible-url placeholder="example.com" required>
              </div>`
      : "";
  const stageGoalLabel = stage === "existing" ? base.fields.mainGoal : p.fields.needs;
  const stageGoalOptions = stage === "existing" ? p.improvements : p.needs;
  const optionalPresenceFields =
    stage === "existing"
      ? `
                <div class="field">
                  <label for="${lang}-${stage}-gbp-link">${base.fields.additionalUrl}</label>
                  <input id="${lang}-${stage}-gbp-link" name="googleBusinessProfileLink" type="text" inputmode="url" autocomplete="url" autocapitalize="none" spellcheck="false" data-flexible-url placeholder="${base.placeholders.gbp}">
                </div>
                <div class="field">
                  <label for="${lang}-${stage}-website-status">${base.fields.websiteStatus}</label>
                  <select id="${lang}-${stage}-website-status" name="websiteStatus">
                    <option value="">${base.fields.websiteStatus}</option>
                    ${base.websiteStatusOptions.map((item) => `<option>${item}</option>`).join("")}
                  </select>
                </div>
                <div class="field">
                  <label for="${lang}-${stage}-gbp-status">${base.fields.gbpStatus}</label>
                  <select id="${lang}-${stage}-gbp-status" name="googleBusinessProfileStatus">
                    <option value="">${base.fields.gbpStatus}</option>
                    ${base.gbpStatusOptions.map((item) => `<option>${item}</option>`).join("")}
                  </select>
                </div>`
      : "";
  const body = `
    <main id="main">
      <section class="page-hero">
        <div class="container page-hero-inner">
          <p class="eyebrow">${p.eyebrow}</p>
          <h1>${p.h1}</h1>
          <p>${p.subtitle}</p>
          <span class="trust-line">${base.trust}</span>
        </div>
      </section>

      <section class="section section-tight">
        <div class="container form-layout">
          <aside class="form-intro">
            <h2>${p.introTitle}</h2>
            <p>${p.introCopy}</p>
            <ul class="check-list">
              ${p.bullets.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </aside>

          <form class="form-card" onsubmit="handleAuditSubmit(event)" data-success-message="${p.success}" data-error-message="${p.error}" data-loading-label="${base.loading}">
            <input type="hidden" name="businessStage" value="${stage}" data-business-stage-field data-business-stage-default="${stage}">
            <input type="hidden" name="preferredLanguage" value="${preferredLanguageValue(lang)}" data-preferred-language-field>
            ${honeypotField(`${lang}-${stage}`)}
            <div class="form-grid">
              <div class="field">
                <label for="${lang}-${stage}-full-name">${commonLabels.fullName}</label>
                <input id="${lang}-${stage}-full-name" name="fullName" type="text" autocomplete="name" required>
              </div>
              <div class="field">
                <label for="${lang}-${stage}-business-name">${commonLabels.businessName}</label>
                <input id="${lang}-${stage}-business-name" name="businessName" type="text" autocomplete="organization" required>
              </div>
              <div class="field">
                <label for="${lang}-${stage}-email">${commonLabels.email}</label>
                <input id="${lang}-${stage}-email" name="email" type="email" autocomplete="email" required>
              </div>
              <div class="field">
                <label for="${lang}-${stage}-phone">${commonLabels.phone}</label>
                <input id="${lang}-${stage}-phone" name="phone" type="tel" autocomplete="tel">
              </div>
              ${presenceFields}
              <div class="field">
                <label for="${lang}-${stage}-city-state">${commonLabels.cityState}</label>
                <input id="${lang}-${stage}-city-state" name="cityState" type="text" autocomplete="address-level2" required>
              </div>
              <div class="field">
                <label for="${lang}-${stage}-business-type">${commonLabels.businessType}</label>
                <input id="${lang}-${stage}-business-type" name="businessType" type="text" placeholder="${base.placeholders.businessType}" required>
              </div>
              <div class="field">
                <label for="${lang}-${stage}-main-goal">${stageGoalLabel}</label>
                <select id="${lang}-${stage}-main-goal" name="mainGoal" required>
                  <option value="">${stageGoalLabel}</option>
                  ${stageGoalOptions.map((item) => `<option>${item}</option>`).join("")}
                </select>
              </div>
            </div>
            <details class="form-details">
              <summary>${base.detailsSummary}</summary>
              <div class="form-grid">
                ${optionalPresenceFields}
                <div class="field field-full">
                  <label for="${lang}-${stage}-timeline">${p.fields.timeline}</label>
                  <select id="${lang}-${stage}-timeline" name="timeline">
                    <option value="">${p.fields.timeline}</option>
                    ${p.timelines.map((item) => `<option>${item}</option>`).join("")}
                  </select>
                </div>
                <div class="field field-full">
                  <label for="${lang}-${stage}-message">${p.fields.message}</label>
                  <textarea id="${lang}-${stage}-message" name="message" placeholder="${base.placeholders.message}"></textarea>
                </div>
              </div>
            </details>
            <div class="form-actions">
              <button class="btn btn-primary btn-full" type="submit">${p.submit}</button>
              ${consentNotice(lang)}
              <p class="form-note">${base.note}</p>
              <div class="form-status" role="status" aria-live="polite" tabindex="-1" hidden data-form-status></div>
            </div>
          </form>
        </div>
      </section>
    </main>`;

  return shell(lang, meta, "", auditSlug, body);
}

function servicesPage(lang) {
  const t = copy[lang];
  const p = t.servicesPage;
  const body = `
    <main id="main">
      <section class="page-hero">
        <div class="container page-hero-inner">
          <p class="eyebrow">${p.eyebrow}</p>
          <h1>${p.h1}</h1>
          <p>${p.subtitle}</p>
        </div>
      </section>

${pageMediaBand("/public/images/site/services-flow.jpg", SITE_MEDIA_ALTS.services[lang])}
      ${systemsDetailSection(lang)}

      ${monthlyServicesSection(lang)}

      ${faqSection(lang)}

      <section class="section section-soft">
        <div class="container">
          <div class="cta-panel">
            <h2>${p.ctaTitle}</h2>
            <p>${p.ctaSubtitle}</p>
            <div class="cta-actions">
              <a class="btn btn-primary" href="${pagePath(lang, "contact")}">${t.cta.findSystem}</a>
              <a class="btn btn-secondary" href="${pagePath(lang, "free-audit")}">${t.cta.audit}</a>
            </div>
          </div>
        </div>
      </section>
    </main>`;

  return shell(lang, p, "services", "services", body);
}

function aboutPage(lang) {
  const t = copy[lang];
  const p = t.aboutPage;
  const body = `
    <main id="main">
      <section class="page-hero">
        <div class="container page-hero-inner">
          <p class="eyebrow">${p.eyebrow}</p>
          <h1>${p.h1}</h1>
          <p>${p.subtitle}</p>
        </div>
      </section>

      <section class="section section-tight">
        <div class="container feature-grid">
          ${p.cards
            .map(
              ([title, text], index) => `
          <article class="feature-card">
            <div class="feature-icon">${String(index + 1).padStart(2, "0")}</div>
            <h3>${title}</h3>
            <p>${text}</p>
          </article>`
            )
            .join("")}
        </div>
      </section>

      <section class="section section-soft">
        <div class="container about-band">
          <div class="about-copy">
            <p class="eyebrow">${p.positionEyebrow}</p>
            <h2>${p.positionTitle}</h2>
            <p>${p.positionCopy}</p>
            <ul class="check-list">
              ${p.bullets.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </div>
          <div class="stats-panel">
            ${p.stats
              .map(
                ([title, text]) => `
            <div class="stat-item">
              <strong>${title}</strong>
              <span>${text}</span>
            </div>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container founder-band">
          <div class="founder-media">
            ${founderMedia(lang)}
          </div>
          <div class="about-copy">
            <p class="eyebrow">${p.founder.eyebrow}</p>
            <h2>${p.founder.title}</h2>
            <p class="founder-name"><strong>${p.founder.name}</strong><span>${p.founder.role}</span></p>
            ${p.founder.body
              .split("\n\n")
              .map((paragraph) => `<p>${paragraph}</p>`)
              .join("")}
            <p class="form-fit-line">${p.founder.support}</p>
          </div>
        </div>
      </section>

      <section class="scene-band" aria-label="Nashville, Tennessee">
        <div class="container">
          <img src="/public/images/site/nashville.jpg" alt="${escapeAttr(SITE_MEDIA_ALTS.nashville[lang])}" width="1200" height="510" loading="lazy" decoding="async">
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="cta-panel">
            <h2>${p.ctaTitle}</h2>
            <p>${p.ctaSubtitle}</p>
            <div class="cta-actions">
              <a class="btn btn-primary" href="${pagePath(lang, "free-audit")}">${t.cta.audit}</a>
            </div>
          </div>
        </div>
      </section>
    </main>`;

  return shell(lang, p, "about", "about", body);
}

function contactPage(lang) {
  const t = copy[lang];
  const p = t.contactPage;
  const serviceAreaText =
    lang === "es" ? "Negocios locales en Estados Unidos" : `Serving businesses across the ${BUSINESS.serviceArea}`;
  const body = `
    <main id="main">
      <section class="page-hero">
        <div class="container page-hero-inner">
          <p class="eyebrow">${p.eyebrow}</p>
          <h1>${p.h1}</h1>
          <p>${p.subtitle}</p>
        </div>
      </section>

      <section class="section section-tight">
        <div class="container contact-layout">
          <aside class="contact-stack">
            <div class="contact-card">
              <h3>${p.emailTitle}</h3>
              <p>${contactLine("email", emailLink())}</p>
            </div>
            ${
              hasConfiguredPhone()
                ? `<div class="contact-card">
              <h3>${p.phoneTitle}</h3>
              <p>${contactLine("phone", phoneLink())}</p>
            </div>`
                : ""
            }
            <div class="contact-card">
              <h3>${p.locationTitle}</h3>
              <p>${contactLine("location", BUSINESS.location)}</p>
            </div>
            <div class="contact-card">
              <h3>${p.serviceAreaTitle}</h3>
              <p>${contactLine("serviceArea", serviceAreaText)}</p>
            </div>
            ${
              instagramLink()
                ? `<div class="contact-card">
              <h3>${p.instagramTitle}</h3>
              <p>${contactLine("instagram", instagramLink())}</p>
            </div>`
                : ""
            }
            <div class="contact-card">
              <h3>${p.auditTitle}</h3>
              <p>${p.auditCopy}</p>
              <p><a class="btn btn-secondary" href="${pagePath(lang, "free-audit")}" data-analytics-event="free_audit_cta_click">${t.cta.audit}</a></p>
            </div>
          </aside>

          <form class="form-card" onsubmit="handleContactSubmit(event)" data-success-message="${p.success}" data-error-message="${p.error}" data-loading-label="${p.loading}">
            <input type="hidden" name="preferredLanguage" value="${preferredLanguageValue(lang)}">
            ${honeypotField(`contact-${lang}`)}
            <div class="form-grid">
              <div class="field">
                <label for="contact-name">${p.fields.name}</label>
                <input id="contact-name" name="fullName" type="text" autocomplete="name" required>
              </div>
              <div class="field">
                <label for="contact-business">${p.fields.business}</label>
                <input id="contact-business" name="businessName" type="text" autocomplete="organization">
              </div>
              <div class="field">
                <label for="contact-email">${p.fields.email}</label>
                <input id="contact-email" name="email" type="email" autocomplete="email" required>
              </div>
              <div class="field">
                <label for="contact-phone">${p.fields.phone}</label>
                <input id="contact-phone" name="phone" type="tel" autocomplete="tel">
              </div>
              <div class="field">
                <label for="contact-topic">${p.fields.topic}</label>
                <select id="contact-topic" name="topic">
                  <option value="">${p.fields.topic}</option>
                  ${p.topics.map((item) => `<option>${item}</option>`).join("")}
                </select>
              </div>
              <div class="field field-full">
                <label for="contact-message">${p.fields.message}</label>
                <textarea id="contact-message" name="message" required></textarea>
              </div>
            </div>
            <div class="form-actions">
              <button class="btn btn-primary btn-full" type="submit">${p.submit}</button>
              ${consentNotice(lang)}
              <div class="form-status" role="status" aria-live="polite" tabindex="-1" hidden data-form-status></div>
            </div>
          </form>
        </div>
      </section>
    </main>`;

  return shell(lang, p, "", "contact", body);
}

function resourcesPage(lang) {
  const t = copy[lang];
  const p = t.resourcesPage;
  const body = `
    <main id="main">
      <section class="page-hero">
        <div class="container page-hero-inner">
          <p class="eyebrow">${p.eyebrow}</p>
          <h1>${p.h1}</h1>
          <p>${p.subtitle}</p>
        </div>
      </section>

      <section class="section section-tight">
        <div class="container resource-grid">
          ${p.cards
            .map(
              ([title, text, linkText, href]) => `
          <article class="resource-card">
            <h3>${title}</h3>
            <p>${text}</p>
            <a href="${localizedHref(lang, href)}">${linkText}</a>
          </article>`
            )
            .join("")}
        </div>
      </section>
    </main>`;

  return shell(lang, p, "resources", "resources", body);
}

function legalPage(lang, type) {
  const p = legalPages[lang][type];
  const body = `
    <main id="main">
      <section class="page-hero">
        <div class="container page-hero-inner">
          <p class="eyebrow">${p.eyebrow}</p>
          <h1>${p.h1}</h1>
          <p>${p.description}</p>
          <span class="trust-line">${p.effective}</span>
        </div>
      </section>

      <section class="section section-tight">
        <div class="container legal-content">
          ${p.sections
            .map(
              ([heading, text]) => `
          <section class="legal-section">
            <h2>${heading}</h2>
            <p>${text}</p>
          </section>`
            )
            .join("")}
        </div>
      </section>
    </main>`;

  return shell(lang, p, "", type, body);
}

function stagePage(lang) {
  const t = copy[lang];
  const p = stagePages[lang];
  const enUrl = `${SITE_URL}/en/start`;
  const esUrl = `${SITE_URL}/es/start`;

  return `<!doctype html>
<html lang="${t.htmlLang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${p.title}</title>
    <meta name="description" content="${p.description}">
    <link rel="canonical" href="${lang === "es" ? esUrl : enUrl}">
    <link rel="alternate" hreflang="en" href="${enUrl}">
    <link rel="alternate" hreflang="es" href="${esUrl}">
    <link rel="alternate" hreflang="x-default" href="${enUrl}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${BUSINESS.displayName}">
    <meta property="og:title" content="${p.title}">
    <meta property="og:description" content="${p.description}">
    <meta property="og:url" content="${lang === "es" ? esUrl : enUrl}">
    <meta property="og:locale" content="${lang === "es" ? "es_ES" : "en_US"}">
    <meta property="og:locale:alternate" content="${lang === "es" ? "en_US" : "es_ES"}">
    <meta property="og:image" content="${OG_IMAGE}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${p.title}">
    <meta name="twitter:description" content="${p.description}">
    <meta name="twitter:image" content="${OG_IMAGE}">
    ${structuredData(lang, p.title, p.description, lang === "es" ? esUrl : enUrl)}
    ${runtimeHead()}
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="/assets/styles.css">
    <script src="/assets/site.js" defer></script>
  </head>
  <body>
    <main id="main" class="language-gate stage-gate">
      <section class="language-panel stage-panel" aria-label="${p.aria}">
        <a class="brand language-brand" href="/" aria-label="${t.brandAria}">
          <span class="brand-mark" aria-hidden="true">BX</span>
          <span class="brand-text">
            <span class="brand-name">BLYNX</span>
          </span>
        </a>
        <p class="eyebrow">${p.eyebrow}</p>
        <h1>${p.h1}</h1>
        <p>${p.subtitle}</p>
        <div class="stage-card-grid">
          ${p.cards
            .map(
              (card, index) => `
          <article class="stage-card">${stageCardMedia(card.value)}
            <div class="feature-icon">${String(index + 1).padStart(2, "0")}</div>
            <h2>${card.title}</h2>
            <p>${card.copy}</p>
            <ul class="check-list">
              ${card.bullets.map((item) => `<li>${item}</li>`).join("")}
            </ul>
            <a class="btn btn-primary" href="${pagePath(lang, card.value)}" data-language-choice="${lang}" data-stage-choice="${card.value}">${card.cta}</a>
          </article>`
            )
            .join("")}
        </div>
        <a class="stage-skip" href="${pagePath(lang)}" data-language-choice="${lang}">${p.skip}</a>
      </section>
    </main>
  </body>
</html>`;
}

function languageGate() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>BLYNX Systems | Digital Systems for Local Businesses</title>
    <meta name="description" content="BLYNX builds digital presence and lead systems that help local businesses get found, build trust, capture opportunities, and follow up faster.">
    <link rel="canonical" href="${SITE_URL}/">
    <link rel="alternate" hreflang="en" href="${SITE_URL}/en">
    <link rel="alternate" hreflang="es" href="${SITE_URL}/es">
    <link rel="alternate" hreflang="x-default" href="${SITE_URL}/">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${BUSINESS.displayName}">
    <meta property="og:title" content="${BUSINESS.displayName}">
    <meta property="og:description" content="Digital presence and lead systems for local businesses: visibility, trust, opportunity capture, organization, and faster follow-up.">
    <meta property="og:url" content="${SITE_URL}/">
    <meta property="og:image" content="${OG_IMAGE_EN}">
    <meta property="og:image:width" content="1774">
    <meta property="og:image:height" content="887">
    <meta property="og:image:alt" content="BLYNX five-step system: Be Found, Build Trust, Receive Inquiries, Organize Opportunities, Follow Up.">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${BUSINESS.displayName}">
    <meta name="twitter:description" content="Digital presence and lead systems for local businesses: visibility, trust, opportunity capture, organization, and faster follow-up.">
    <meta name="twitter:image" content="${OG_IMAGE_EN}">
    <meta name="twitter:image:alt" content="BLYNX five-step system: Be Found, Build Trust, Receive Inquiries, Organize Opportunities, Follow Up.">
    ${structuredData("en", "BLYNX Systems | Digital Systems for Local Businesses", "BLYNX builds digital presence and lead systems that help local businesses get found, build trust, capture opportunities, and follow up faster.", `${SITE_URL}/`)}
    ${runtimeHead()}
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="/assets/styles.css">
    <script>
      (function () {
        var saved = "";
        try {
          saved = localStorage.getItem("preferredLanguage") || localStorage.getItem("blynxPreferredLanguage") || "";
        } catch (error) {
          saved = "";
        }
        var browserLanguage = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
        var language = saved === "en" || saved === "es" ? saved : browserLanguage.toLowerCase().indexOf("es") === 0 ? "es" : "en";
        window.location.replace("/" + language);
      })();
    </script>
  </head>
  <body>
    <main id="main" class="language-gate">
      <section class="language-panel" aria-label="Choose language">
        <a class="brand language-brand" href="/" aria-label="BLYNX language selection">
          <span class="brand-mark" aria-hidden="true">BX</span>
          <span class="brand-text">
            <span class="brand-name">BLYNX</span>
          </span>
        </a>
        <p class="eyebrow">BLYNX Systems</p>
        <h1>Digital Systems for Local Businesses</h1>
        <p>Redirecting you to the best language version. You can choose manually below.</p>
        <div class="language-actions">
          <a class="btn btn-primary" href="/en" data-language-choice="en">English</a>
          <a class="btn btn-secondary" href="/es" data-language-choice="es">Español</a>
        </div>
        <p class="language-support">English and Spanish support for local business growth.</p>
        <p class="saved-language" hidden data-saved-language></p>
      </section>
    </main>
    <script src="/assets/site.js"></script>
  </body>
</html>`;
}

function redirectPage(slug) {
  const targetPath = slug ? `/${slug}` : "";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>BLYNX | Redirecting</title>
    <meta name="robots" content="noindex">
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="/assets/styles.css">
    <script>
      (function () {
        var language = localStorage.getItem("preferredLanguage") || localStorage.getItem("blynxPreferredLanguage");
        if (language === "en" || language === "es") {
          window.location.replace("/" + language + "${targetPath}");
        } else {
          window.location.replace("/");
        }
      })();
    </script>
  </head>
  <body>
    <main class="language-gate">
      <section class="language-panel">
        <a class="brand language-brand" href="/" aria-label="BLYNX language selection">
          <span class="brand-mark" aria-hidden="true">BX</span>
          <span class="brand-text">
            <span class="brand-name">BLYNX</span>
          </span>
        </a>
        <h1>Choose your language</h1>
        <p>Select a language to continue.</p>
        <div class="language-actions">
          <a class="btn btn-primary" href="/en${targetPath}" data-language-choice="en">English</a>
          <a class="btn btn-secondary" href="/es${targetPath}" data-language-choice="es">Español</a>
        </div>
      </section>
    </main>
    <script src="/assets/site.js"></script>
  </body>
</html>`;
}

function permanentRedirectPage(targetPath, lang = "en") {
  const isSpanish = lang === "es";
  return `<!doctype html>
<html lang="${isSpanish ? "es" : "en"}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>BLYNX | Redirecting</title>
    <meta name="robots" content="noindex">
    <meta http-equiv="refresh" content="0; url=${targetPath}">
    <link rel="canonical" href="${SITE_URL}${targetPath}">
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="/assets/styles.css">
    <script>window.location.replace("${targetPath}");</script>
  </head>
  <body>
    <main class="language-gate">
      <section class="language-panel">
        <h1>${isSpanish ? "Redirigiendo" : "Redirecting"}</h1>
        <p><a class="btn btn-primary" href="${targetPath}">${isSpanish ? "Continuar" : "Continue"}</a></p>
      </section>
    </main>
  </body>
</html>`;
}

function blogStructuredData(lang, meta, article = null) {
  const t = copy[lang];
  const b = t.blogPage;
  const blogUrl = `${SITE_URL}${pagePath(lang, "blog")}`;
  const graph = [
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#organization`,
      name: BUSINESS.legalName,
      url: `${SITE_URL}/`,
      email: BUSINESS.email,
      image: OG_IMAGE,
      logo: OG_IMAGE
    },
    {
      "@type": "Blog",
      "@id": `${blogUrl}#blog`,
      url: blogUrl,
      name: b.h1,
      description: b.description,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: lang
    }
  ];
  const breadcrumbItems = [
    { name: b.breadcrumbHome, url: `${SITE_URL}/${lang}` },
    { name: b.breadcrumbBlog, url: blogUrl }
  ];

  if (article) {
    graph.push({
      "@type": "BlogPosting",
      "@id": meta.canonicalUrl,
      mainEntityOfPage: meta.canonicalUrl,
      url: meta.canonicalUrl,
      headline: article.title,
      description: article.description,
      image: `${SITE_URL}${article.heroImage}`,
      datePublished: article.publicationDate,
      dateModified: article.updatedDate || article.publicationDate,
      author: { "@type": "Organization", name: article.author, url: `${SITE_URL}/` },
      publisher: { "@id": `${SITE_URL}/#organization` },
      isPartOf: { "@id": `${blogUrl}#blog` },
      articleSection: article.categoryLabel,
      keywords: article.tags.join(", "),
      wordCount: article.wordCount,
      inLanguage: lang
    });
    breadcrumbItems.push({ name: article.title, url: meta.canonicalUrl });
  }

  graph.push({
    "@type": "BreadcrumbList",
    "@id": `${meta.canonicalUrl}#breadcrumb`,
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  });

  return `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>`;
}

// Blog pages get their own shell: hreflang alternates are only emitted when the same
// content exists in the other language, and articles use Open Graph "article" metadata.
function blogShell(lang, meta, body, article = null) {
  const t = copy[lang];
  const otherLang = lang === "en" ? "es" : "en";
  let otherPath = null;
  if (article) {
    const translation = blogArticles[otherLang].find((entry) => entry.translationKey === article.translationKey);
    if (translation) otherPath = `blog/${translation.slug}`;
  } else if (blogArticles[otherLang].length) {
    otherPath = "blog";
  }
  const switchPaths = otherPath ? { [lang]: meta.switchPath, [otherLang]: otherPath } : null;
  const enPath = lang === "en" ? meta.switchPath : otherPath;
  const esPath = lang === "es" ? meta.switchPath : otherPath;
  const hreflangTags = otherPath
    ? `
    <link rel="alternate" hreflang="en" href="${SITE_URL}/en/${enPath}">
    <link rel="alternate" hreflang="es" href="${SITE_URL}/es/${esPath}">
    <link rel="alternate" hreflang="x-default" href="${SITE_URL}/en/${enPath}">`
    : "";
  const ogImage = article ? `${SITE_URL}${article.heroImage}` : `${SITE_URL}/public/images/blog/blog-og.jpg`;
  const articleOgTags = article
    ? `
    <meta property="article:published_time" content="${article.publicationDate}">
    <meta property="article:modified_time" content="${article.updatedDate || article.publicationDate}">
    <meta property="article:author" content="${article.author}">
    <meta property="article:section" content="${article.categoryLabel}">
    ${article.tags.map((tag) => `<meta property="article:tag" content="${tag}">`).join("\n    ")}`
    : "";

  return `<!doctype html>
<html lang="${t.htmlLang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}">
    <link rel="canonical" href="${meta.canonicalUrl}">${hreflangTags}
    <meta property="og:type" content="${article ? "article" : "website"}">
    <meta property="og:site_name" content="${BUSINESS.displayName}">
    <meta property="og:title" content="${meta.title}">
    <meta property="og:description" content="${meta.description}">
    <meta property="og:url" content="${meta.canonicalUrl}">
    <meta property="og:locale" content="${lang === "es" ? "es_ES" : "en_US"}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">${articleOgTags}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${meta.title}">
    <meta name="twitter:description" content="${meta.description}">
    <meta name="twitter:image" content="${ogImage}">
    ${blogStructuredData(lang, meta, article)}
    ${runtimeHead()}
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="/assets/styles.css">
    <script src="/assets/site.js" defer></script>
  </head>
  <body>
    ${header(lang, "blog", switchPaths ? meta.switchPath : "", "free-audit", switchPaths)}
    ${body}
    ${footer(lang)}
  </body>
</html>`;
}

function blogMetaLine(lang, article, options = {}) {
  const b = copy[lang].blogPage;
  const parts = [];
  if (options.author) parts.push(`<span>${article.author}</span>`);
  parts.push(`<time datetime="${article.publicationDate}">${formatDate(article.publicationDate, lang)}</time>`);
  if (article.updatedDate) {
    parts.push(`<span>${b.updatedLabel} <time datetime="${article.updatedDate}">${formatDate(article.updatedDate, lang)}</time></span>`);
  }
  parts.push(`<span>${article.readingTime} ${b.minRead}</span>`);
  return `<div class="blog-meta">${parts.join('<span aria-hidden="true">·</span>')}</div>`;
}

function blogCard(lang, article, options = {}) {
  const href = pagePath(lang, `blog/${article.slug}`);
  const relatedAttr = options.related ? ` data-related-article="${article.slug}"` : "";
  const filterAttrs = options.filterable ? ` data-blog-card data-blog-category="${article.category}"` : "";
  return `
          <article class="blog-card"${filterAttrs}>
            <a class="blog-card-media" href="${href}" tabindex="-1" aria-hidden="true"${relatedAttr}>
              <img src="${article.heroImage}" alt="" width="1200" height="630" loading="lazy" decoding="async">
            </a>
            <div class="blog-card-body">
              <span class="blog-kicker">${article.categoryLabel}</span>
              <h3><a href="${href}"${relatedAttr}>${article.title}</a></h3>
              <p>${article.description}</p>
              ${blogMetaLine(lang, article)}
            </div>
          </article>`;
}

function blogIndexPage(lang) {
  const t = copy[lang];
  const b = t.blogPage;
  const articles = blogArticles[lang];
  const featured = articles.find((article) => article.featured) || articles[0];
  const usedCategories = [...new Set(articles.map((article) => article.category))];
  const featuredHref = pagePath(lang, `blog/${featured.slug}`);

  const body = `
    <main id="main">
      <section class="page-hero">
        <div class="container page-hero-inner">
          <p class="eyebrow">${b.eyebrow}</p>
          <h1>${b.h1}</h1>
          <p>${b.subtitle}</p>
        </div>
      </section>

      <section class="section section-tight">
        <div class="container">
          <article class="blog-featured">
            <a class="blog-featured-media" href="${featuredHref}" tabindex="-1" aria-hidden="true">
              <img src="${featured.heroImage}" alt="" width="1200" height="630" decoding="async">
            </a>
            <div class="blog-featured-body">
              <span class="blog-kicker">${b.featuredLabel}</span>
              <h2><a href="${featuredHref}">${featured.title}</a></h2>
              <p>${featured.description}</p>
              ${blogMetaLine(lang, featured)}
            </div>
          </article>

          <h2 class="visually-hidden">${b.latestTitle}</h2>
          <div class="blog-filters" role="group" aria-label="${b.filterLabel}">
            <button class="blog-filter is-active" type="button" data-blog-filter="all" aria-pressed="true">${b.allLabel}</button>
            ${usedCategories
              .map(
                (category) =>
                  `<button class="blog-filter" type="button" data-blog-filter="${category}" aria-pressed="false">${CATEGORIES[category][lang]}</button>`
              )
              .join("\n            ")}
          </div>

          <div class="blog-grid">
            ${articles.map((article) => blogCard(lang, article, { filterable: true })).join("")}
          </div>
        </div>
      </section>

      <section class="section-tight section-soft">
        <div class="container">
          <div class="cta-panel">
            <h2>${b.ctaTitle}</h2>
            <p>${b.ctaText}</p>
            <div class="cta-actions">
              <a class="btn btn-primary" href="${pagePath(lang, "free-audit")}" data-blog-cta>${b.ctaButton}</a>
            </div>
          </div>
        </div>
      </section>
    </main>`;

  const meta = {
    title: b.title,
    description: b.description,
    canonicalUrl: `${SITE_URL}${pagePath(lang, "blog")}`,
    switchPath: "blog"
  };
  return blogShell(lang, meta, body);
}

function relatedArticles(lang, current) {
  const others = blogArticles[lang].filter((article) => article.slug !== current.slug);
  const sameCategory = others.filter((article) => article.category === current.category);
  const rest = others.filter((article) => article.category !== current.category);
  return sameCategory.concat(rest).slice(0, 3);
}

function blogArticlePage(lang, article) {
  const t = copy[lang];
  const b = t.blogPage;
  const canonicalUrl = `${SITE_URL}${pagePath(lang, `blog/${article.slug}`)}`;
  const related = relatedArticles(lang, article);

  const body = `
    <main id="main">
      <article class="article-page" data-blog-article="${article.slug}" data-blog-category="${article.category}">
        <div class="article-container">
          <nav class="article-breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><a href="${pagePath(lang)}">${b.breadcrumbHome}</a></li>
              <li><a href="${pagePath(lang, "blog")}">${b.breadcrumbBlog}</a></li>
              <li aria-current="page">${article.title}</li>
            </ol>
          </nav>
          <header class="article-header">
            <span class="blog-kicker">${article.categoryLabel}</span>
            <h1>${article.title}</h1>
            ${blogMetaLine(lang, article, { author: true })}
          </header>
          <figure class="article-hero">
            <img src="${article.heroImage}" alt="${escapeAttr(article.heroImageAlt)}" width="1200" height="630" decoding="async">
          </figure>
          <div class="article-body">
            ${article.contentHtml}
          </div>
          <aside class="article-cta">
            <h2>${b.ctaTitle}</h2>
            <p>${b.ctaText}</p>
            <a class="btn btn-primary" href="${pagePath(lang, "free-audit")}" data-blog-cta>${b.ctaButton}</a>
          </aside>
          <aside class="article-author">
            <span class="brand-mark" aria-hidden="true">BX</span>
            <div>
              <strong>${b.aboutTitle}</strong>
              <p>${b.aboutText} <a href="${pagePath(lang, "about")}">${b.aboutLink}</a>.</p>
            </div>
          </aside>
        </div>
        ${
          related.length
            ? `
        <div class="container related-section">
          <h2>${b.relatedTitle}</h2>
          <div class="blog-grid">
            ${related.map((entry) => blogCard(lang, entry, { related: true })).join("")}
          </div>
        </div>`
            : ""
        }
      </article>
    </main>`;

  const meta = {
    title: `${article.title} | BLYNX`,
    description: article.description,
    canonicalUrl,
    switchPath: `blog/${article.slug}`
  };
  return blogShell(lang, meta, body, article);
}

write("index.html", languageGate());

for (const lang of ["en", "es"]) {
  write(`${lang}/index.html`, homePage(lang));
  write(`${lang}/start/index.html`, stagePage(lang));
  write(`${lang}/existing/index.html`, stageLandingPage(lang, "existing"));
  write(`${lang}/zero/index.html`, stageLandingPage(lang, "zero"));
  write(`${lang}/free-audit/index.html`, auditPage(lang));
  write(`${lang}/free-audit-existing/index.html`, stageAuditPage(lang, "existing"));
  write(`${lang}/free-audit-zero/index.html`, stageAuditPage(lang, "zero"));
  write(`${lang}/services/index.html`, servicesPage(lang));
  write(`${lang}/about/index.html`, aboutPage(lang));
  write(`${lang}/projects/index.html`, projectsPage(lang));
  write(`${lang}/contact/index.html`, contactPage(lang));
  write(`${lang}/privacy/index.html`, legalPage(lang, "privacy"));
  write(`${lang}/terms/index.html`, legalPage(lang, "terms"));
  write(`${lang}/resources/index.html`, permanentRedirectPage(pagePath(lang, "services"), lang));

  if (blogArticles[lang].length) {
    write(`${lang}/blog/index.html`, blogIndexPage(lang));
    for (const article of blogArticles[lang]) {
      write(`${lang}/blog/${article.slug}/index.html`, blogArticlePage(lang, article));
    }
  }
}

write("blog/index.html", redirectPage("blog"));

for (const slug of ["free-audit", "services", "about", "projects", "contact", "privacy", "terms"]) {
  write(`${slug}/index.html`, redirectPage(slug));
}

write("resources/index.html", redirectPage("services"));

const sitemapRoutes = [
  "",
  "start",
  "existing",
  "zero",
  "free-audit",
  "free-audit-existing",
  "free-audit-zero",
  "services",
  "about",
  "projects",
  "contact",
  "privacy",
  "terms"
];

const sitemapUrls = sitemapRoutes
  .flatMap((slug) => {
    const enLoc = `${SITE_URL}${pagePath("en", slug)}`;
    const esLoc = `${SITE_URL}${pagePath("es", slug)}`;
    return [
      { loc: enLoc, enLoc, esLoc },
      { loc: esLoc, enLoc, esLoc }
    ];
  })
  .concat([{ loc: `${SITE_URL}/`, enLoc: `${SITE_URL}/en`, esLoc: `${SITE_URL}/es` }]);

// Blog URLs: hreflang alternates only when the translation actually exists.
for (const lang of ["en", "es"]) {
  if (!blogArticles[lang].length) continue;
  const otherLang = lang === "en" ? "es" : "en";
  const indexAlternates = blogArticles[otherLang].length
    ? { enLoc: `${SITE_URL}/en/blog`, esLoc: `${SITE_URL}/es/blog` }
    : {};
  sitemapUrls.push({ loc: `${SITE_URL}${pagePath(lang, "blog")}`, ...indexAlternates });
  for (const article of blogArticles[lang]) {
    const translation = blogArticles[otherLang].find((entry) => entry.translationKey === article.translationKey);
    const articleAlternates = translation
      ? {
          enLoc: `${SITE_URL}/en/blog/${lang === "en" ? article.slug : translation.slug}`,
          esLoc: `${SITE_URL}/es/blog/${lang === "es" ? article.slug : translation.slug}`
        }
      : {};
    sitemapUrls.push({
      loc: `${SITE_URL}${pagePath(lang, `blog/${article.slug}`)}`,
      lastmod: article.updatedDate || article.publicationDate,
      ...articleAlternates
    });
  }
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapUrls
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""}${
      entry.enLoc
        ? `
    <xhtml:link rel="alternate" hreflang="en" href="${entry.enLoc}"/>
    <xhtml:link rel="alternate" hreflang="es" href="${entry.esLoc}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${entry.enLoc}"/>`
        : ""
    }
  </url>`
  )
  .join("\n")}
</urlset>`;

write("sitemap.xml", sitemapXml);
write(
  "robots.txt",
  `User-agent: *
Allow: /
Disallow: /dist/
Disallow: /en/resources
Disallow: /es/resources

Sitemap: ${SITE_URL}/sitemap.xml`
);

console.log("Generated bilingual BLYNX pages.");
