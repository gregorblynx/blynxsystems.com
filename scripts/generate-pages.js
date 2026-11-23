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
const OG_IMAGE = `${SITE_URL}/assets/og-offer-en.png`;
// Approved per-language social share cards for the two homepages (and the
// root language-gate, which defaults to the EN card since it's the
// x-default/English-flavored entry point). Not used elsewhere — every other
// page keeps the generic OG_IMAGE above.
const OG_IMAGE_EN = `${SITE_URL}/assets/og-offer-en.png`;
const OG_IMAGE_ES = `${SITE_URL}/assets/og-offer-es.png`;

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
const LEGAL_EFFECTIVE_DATE = "November 19, 2026";
const LEGAL_EFFECTIVE_DATE_ES = "19 de noviembre de 2026";
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
      ? "BLYNX crea sitios web profesionales, organiza las solicitudes de clientes y produce contenido mensual con IA para negocios locales."
      : "BLYNX builds professional websites, organizes customer requests and creates AI-powered content for local businesses.";
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
        image: lang === "es" ? OG_IMAGE_ES : OG_IMAGE_EN,
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
      services: "Services",
      howItWorks: "How It Works",
      about: "About",
      projects: "Projects",
      resources: "Resources",
      contact: "Contact",
      blog: "Blog",
      audit: "Request a Quote",
      privacy: "Privacy Policy",
      terms: "Terms of Service"
    },
    blogPage: {
      title: "Practical Growth Systems for Local Businesses | BLYNX Blog",
      description: "Practical guides on getting found, building trust, capturing opportunities, and following up faster — written for local service business owners.",
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
      aboutText: "BLYNX builds professional websites, organizes customer requests and creates monthly AI-powered content for local businesses.",
      aboutLink: "Learn more about BLYNX",
      ctaTitle: "Ready to strengthen your business online?",
      ctaText: "Tell us about your business and we’ll send you a clear quote.",
      ctaButton: "Request a Quote"
    },
    cta: {
      audit: "Request a Quote",
      auditLong: "Request Your Quote",
      auditShort: "Request a Quote",
      findSystem: "Request a Quote",
      services: "Explore Our Services",
      contact: "Contact BLYNX"
    },
    home: {
      title: "Websites, Follow-Up & AI Content for Local Businesses | BLYNX Systems",
      description: "Professional websites, automated customer follow-ups, and AI-powered content for local businesses. BLYNX Presence from $1,500, BLYNX Complete from $2,500, BLYNX Content from $300/month.",
      ogTitle: "Your Business. Stronger Online. Smarter with AI. | BLYNX",
      ogDescription: "Professional websites, automated customer follow-ups, and AI-powered content for local businesses.",
      ogImage: OG_IMAGE_EN,
      ogImageWidth: 1200,
      ogImageHeight: 630,
      ogImageAlt: "BLYNX Systems: Your Business. Stronger Online. Smarter with AI. BLYNX Presence, BLYNX Complete and BLYNX Content.",
      eyebrow: "Digital solutions for local businesses",
      headline: 'Your Business.<br>Stronger Online.<br><span class="text-gold">Smarter with AI.</span>',
      subtitle: [
        "Professional websites, automated customer follow-ups, and AI-powered content for local businesses.",
        "We build practical digital solutions that save you time and help your business operate more efficiently."
      ],
      stageBanner: {
        existing: "You already have a digital presence? We can improve it or build on it — request a quote and tell us what you need.",
        zero: "Starting from zero? We can build your website and Google presence — request a quote and tell us what you need."
      },
      heroCaption: "Illustrative example. Not a real client or verified result.",
      aboutEyebrow: "About BLYNX",
      aboutTitle: "Built for Local Businesses",
      aboutCopy: "BLYNX builds practical digital solutions for local businesses: professional websites, organized customer follow-up and monthly AI-powered content — explained in plain language.",
      aboutBullets: [
        "Based in Nashville, Tennessee.",
        "Serving local businesses across the United States.",
        "English and Spanish support available."
      ],
      statItems: [
        ["Practical", "Simple solutions, explained in plain language."],
        ["Transparent", "Clear starting prices and a defined scope for every service."],
        ["Direct", "You work directly with the founder."]
      ],
      finalTitle: "Ready to strengthen your business online?",
      finalSubtitle: "Tell us about your business and we’ll send you a clear quote."
    },
    auditPage: {
      title: "Request a Quote | BLYNX Systems",
      description: "Request a quote for a professional website, customer follow-up or monthly AI-powered content from BLYNX.",
      eyebrow: "Request a quote",
      h1: "Request a Quote",
      subtitle: "Tell us about your business and the service you are interested in. We’ll review it and get back to you with the next steps.",
      trust: "AI-powered for speed. Human-reviewed for quality.",
      flowTitle: "How It Works",
      flowSubtitle: "From your request to a clear quote.",
      introTitle: "Tell us what you need.",
      introCopy: "Share a few details about your business and we’ll recommend the right service and quote it clearly.",
      fitLine: "Whether you need a website, customer follow-up or monthly content, this is the place to start.",
      bullets: [
        "A professional website and Google presence.",
        "Organized customer requests with automatic responses.",
        "Monthly images and videos for your brand."
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
        mainGoal: "Service of Interest",
        improvements: "What do you want to improve?",
        timeline: "How soon do you want to start?",
        message: "Message / Notes"
      },
      placeholders: {
        businessType: "Home services, dental, med spa, restaurant...",
        gbp: "https://g.page/...",
        message: "Share anything useful about your business, your goals or the service you are interested in."
      },
      improvements: [
        "Professional website",
        "Google Business Profile",
        "Customer inquiry organization and follow-up",
        "Monthly images and videos",
        "Landing page",
        "Custom AI solution",
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
      submit: "Send My Quote Request",
      loading: "Submitting...",
      note: "Your information is only used to respond to your request — no spam, ever.",
      success: "Thank you. Your quote request has been received. We’ll review your information and contact you with the next steps.",
      error: `Something went wrong sending your request. Please try again, or email us directly at ${BUSINESS.email}.`
    },
    servicesPage: {
      title: "Services & Prices | BLYNX Systems",
      description: "BLYNX Presence from $1,500, BLYNX Complete from $2,500 and BLYNX Content subscriptions from $300/month — professional websites, customer follow-up and AI-powered content for local businesses.",
      eyebrow: "BLYNX Services",
      h1: "Three services. Clear prices.",
      subtitle: "Professional websites, organized customer follow-up and monthly AI-powered content — each with a clear scope and starting price.",
      ctaTitle: "Not sure which service fits?",
      ctaSubtitle: "Tell us about your business and we’ll recommend the right one and send you a clear quote."
    },
    aboutPage: {
      title: "About | BLYNX Systems",
      description: "BLYNX helps local businesses in the United States with professional websites, organized customer follow-up and monthly AI-powered content.",
      eyebrow: "About",
      h1: "Practical digital solutions for local businesses.",
      subtitle: "BLYNX builds professional websites, organizes customer requests and creates monthly content with AI-powered tools.",
      cards: [
        ["Who BLYNX Helps", "BLYNX serves local businesses across the United States that rely on calls, quote requests, bookings, inquiries, and customer trust to grow."],
        ["What BLYNX Offers", "Three services: BLYNX Presence for your website and Google presence, BLYNX Complete to organize customer requests, and BLYNX Content for monthly images and videos."],
        ["Why It Matters", "Local customers compare businesses quickly. A professional online presence and a clear way to reach you help you stay visible and respond on time."]
      ],
      positionEyebrow: "Our approach",
      positionTitle: "Practical, not complicated.",
      positionCopy: "BLYNX is based in Nashville, Tennessee and supports local businesses nationwide. We use AI to work efficiently, but we sell practical solutions — not technology that is hard to understand.",
      bullets: [
        "Professional websites and Google presence that help customers find you.",
        "Organized customer requests with automatic responses and follow-up reminders.",
        "Monthly images and videos created with AI-powered creative tools.",
        "Clear starting prices and a defined scope for every service."
      ],
      stats: [
        ["Nashville", "Based in Tennessee and serving local businesses across the United States."],
        ["Practical", "Clear solutions for owners who want results, not technical confusion."],
        ["Focused", "Three core services: Presence, Complete and Content. Secondary services are available for specific needs."]
      ],
      founder: {
        eyebrow: "Founder-led",
        title: "Direct Strategy and Implementation",
        name: "Gregor Silva",
        role: "Founder of BLYNX",
        body:
          "BLYNX was created from firsthand experience with the digital problems local service businesses face: incomplete online profiles, websites that do not generate clear actions, scattered customer requests and slow follow-up.\n\nGregor works directly on strategy and implementation, combining practical digital systems with AI-assisted processes to help business owners operate with more clarity, consistency and speed.",
        support:
          "You work directly with the person responsible for the strategy — without being passed between departments.",
        alt: "Gregor Silva, founder of BLYNX"
      },
      ctaTitle: "Ready to strengthen your business online?",
      ctaSubtitle: "Request a quote and we’ll get back to you with the next steps."
    },
    contactPage: {
      title: "Contact & Request a Quote | BLYNX Systems",
      description: "Contact BLYNX Systems or request a quote for a professional website, customer follow-up or monthly AI-powered content.",
      eyebrow: "Contact",
      h1: "Let’s talk about your business.",
      subtitle: "Tell us which service you’re interested in and we’ll get back to you with a clear quote.",
      emailTitle: "Email",
      phoneTitle: "Phone",
      locationTitle: "Based in",
      serviceAreaTitle: "Service area",
      instagramTitle: "Instagram",
      auditTitle: "Want to share more details?",
      auditCopy: "Use our detailed quote request form to tell us more about your business and your online presence.",
      auditButton: "Detailed Quote Request",
      languageTitle: "Language support",
      languageCopy: "English and Spanish support is available.",
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
        "BLYNX Presence — Website & Google presence",
        "BLYNX Complete — Website + customer follow-up",
        "BLYNX Content — Monthly images & videos",
        "Landing Page",
        "Google Business Profile",
        "Custom AI Solution",
        "Not sure"
      ],
      languageOptions: ["English", "Spanish"],
      consentPrefix: "By submitting this form, you agree to our",
      consentPrivacy: "Privacy Policy",
      consentMiddle: "and",
      consentTerms: "Terms of Service",
      submit: "Request a Quote",
      loading: "Sending...",
      success: "Thank you. Your message has been received. BLYNX will follow up with the next steps.",
      error: `Something went wrong sending your message. Please try again, or email us directly at ${BUSINESS.email}.`
    },
    resourcesPage: {
      title: "Resources | BLYNX Systems",
      description: "Practical resources for handling customer requests, staying organized, and following up.",
      eyebrow: "Resources",
      h1: "Practical growth resources for local business owners.",
      subtitle: "Use these starting points to think through how customers find you, contact you, and receive follow-up before you request a quote.",
      cards: [
        ["Customer Request Process Checklist", "Review the basics that help customers find your business, trust it, and take the next step.", "Request a quote", "/contact"],
        ["Customer Request Readiness", "Check whether your website and contact flow make it easy for customers to reach you.", "Explore the services", "/services"],
        ["Follow-Up Basics", "Understand how simple confirmations, reminders, and organization reduce missed opportunities.", "Ask a question", "/contact"]
      ]
    },
    projectsPage: {
      title: "Projects | BLYNX Systems",
      description: "Explore practical digital solutions and founder-led projects demonstrating websites, customer experiences, and business systems.",
      eyebrow: "OUR WORK",
      h1: "Selected Work & Digital Projects",
      subtitle:
        "Explore practical digital solutions and founder-led projects demonstrating websites, customer experiences, and business systems.",
      realBadge: "Founder Project",
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
        headline: "Selected Work & Digital Projects",
        copy: "Explore practical digital solutions and founder-led projects demonstrating websites, customer experiences, and business systems.",
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
      services: "Servicios",
      howItWorks: "Cómo Funciona",
      about: "Nosotros",
      projects: "Proyectos",
      resources: "Recursos",
      contact: "Contacto",
      blog: "Blog",
      audit: "Solicitar Cotización",
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
      aboutText: "BLYNX crea sitios web profesionales, organiza las solicitudes de clientes y produce contenido mensual con IA para negocios locales.",
      aboutLink: "Conoce más sobre BLYNX",
      ctaTitle: "¿Listo para fortalecer tu negocio en línea?",
      ctaText: "Cuéntanos sobre tu negocio y te enviamos una cotización clara.",
      ctaButton: "Solicitar una Cotización"
    },
    cta: {
      audit: "Solicitar una Cotización",
      auditLong: "Solicita tu Cotización",
      auditShort: "Cotización",
      findSystem: "Solicitar una Cotización",
      services: "Conocer Nuestros Servicios",
      contact: "Contactar a BLYNX"
    },
    home: {
      title: "Sitios web, seguimiento y contenido con IA para negocios locales | BLYNX Systems",
      description: "Sitios web profesionales, seguimiento automático de clientes y contenido creado con IA para negocios locales. BLYNX Presence desde $1,500, BLYNX Complete desde $2,500, BLYNX Content desde $300/mes.",
      ogTitle: "Tu negocio. Más fuerte en línea. Más inteligente con IA. | BLYNX",
      ogDescription: "Sitios web profesionales, seguimiento automático de clientes y contenido creado con IA para negocios locales.",
      ogImage: OG_IMAGE_ES,
      ogImageWidth: 1200,
      ogImageHeight: 630,
      ogImageAlt: "BLYNX Systems: Tu negocio. Más fuerte en línea. Más inteligente con IA. BLYNX Presence, BLYNX Complete y BLYNX Content.",
      eyebrow: "Soluciones digitales para negocios locales",
      headline: 'Tu negocio.<br>Más fuerte en línea.<br><span class="text-gold">Más inteligente con IA.</span>',
      subtitle: [
        "Sitios web profesionales, seguimiento automático de clientes y contenido creado con IA para negocios locales.",
        "Creamos soluciones digitales prácticas que te ahorran tiempo y ayudan a tu negocio a operar con más eficiencia."
      ],
      stageBanner: {
        existing: "¿Ya tienes presencia digital? Podemos mejorarla o construir sobre ella — solicita una cotización y cuéntanos qué necesitas.",
        zero: "¿Empiezas desde cero? Podemos construir tu sitio web y tu presencia en Google — solicita una cotización y cuéntanos qué necesitas."
      },
      heroCaption: "Ejemplo ilustrativo. No representa un cliente real ni resultados verificados.",
      aboutEyebrow: "Sobre BLYNX",
      aboutTitle: "Creado para Negocios Locales",
      aboutCopy: "BLYNX crea soluciones digitales prácticas para negocios locales: sitios web profesionales, seguimiento organizado de clientes y contenido mensual creado con IA — explicado en lenguaje sencillo.",
      aboutBullets: [
        "Basados en Nashville, Tennessee.",
        "Servimos a negocios locales en todo Estados Unidos.",
        "Soporte disponible en inglés y español."
      ],
      statItems: [
        ["Práctico", "Soluciones simples, explicadas en lenguaje sencillo."],
        ["Transparente", "Precios iniciales claros y un alcance definido para cada servicio."],
        ["Directo", "Trabajas directamente con el fundador."]
      ],
      finalTitle: "¿Listo para fortalecer tu negocio en línea?",
      finalSubtitle: "Cuéntanos sobre tu negocio y te enviamos una cotización clara."
    },
    auditPage: {
      title: "Solicita una Cotización | BLYNX Systems",
      description: "Solicita una cotización para un sitio web profesional, seguimiento a clientes o contenido mensual creado con IA de BLYNX.",
      eyebrow: "Solicitar cotización",
      h1: "Solicita una Cotización",
      subtitle: "Cuéntanos sobre tu negocio y el servicio que te interesa. Lo revisaremos y te responderemos con los próximos pasos.",
      trust: "Impulsada por IA para mayor rapidez. Revisada por BLYNX para mayor calidad.",
      flowTitle: "Cómo Funciona",
      flowSubtitle: "De tu solicitud a una cotización clara.",
      introTitle: "Cuéntanos qué necesitas.",
      introCopy: "Comparte algunos datos de tu negocio y te recomendamos el servicio adecuado y lo cotizamos con claridad.",
      fitLine: "Ya sea que necesites un sitio web, seguimiento a clientes o contenido mensual, este es el lugar para empezar.",
      bullets: [
        "Un sitio web profesional y presencia en Google.",
        "Solicitudes de clientes organizadas con respuestas automáticas.",
        "Imágenes y videos mensuales para tu marca."
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
        mainGoal: "Servicio de interés",
        improvements: "¿Qué quieres mejorar?",
        timeline: "¿Qué tan pronto quieres comenzar?",
        message: "Mensaje / Notas"
      },
      placeholders: {
        businessType: "Servicios del hogar, dental, med spa, restaurante...",
        gbp: "https://g.page/...",
        message: "Comparte cualquier detalle útil sobre tu negocio, tus metas o el servicio que te interesa."
      },
      improvements: [
        "Sitio web profesional",
        "Perfil de Empresa de Google",
        "Organización y seguimiento de solicitudes de clientes",
        "Imágenes y videos mensuales",
        "Landing page",
        "Solución de IA a medida",
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
      submit: "Enviar mi Solicitud de Cotización",
      loading: "Enviando...",
      note: "Tu información solo se usa para responder a tu solicitud — nada de spam.",
      success: "Gracias. Hemos recibido tu solicitud de cotización. Revisaremos tu información y te contactaremos con los próximos pasos.",
      error: `Ocurrió un error al enviar tu solicitud. Inténtalo de nuevo o escríbenos directamente a ${BUSINESS.email}.`
    },
    servicesPage: {
      title: "Servicios y Precios | BLYNX Systems",
      description: "BLYNX Presence desde $1,500, BLYNX Complete desde $2,500 y suscripciones de BLYNX Content desde $300/mes — sitios web profesionales, seguimiento a clientes y contenido creado con IA para negocios locales.",
      eyebrow: "Servicios de BLYNX",
      h1: "Tres servicios. Precios claros.",
      subtitle: "Sitios web profesionales, seguimiento organizado de clientes y contenido mensual creado con IA — cada uno con un alcance claro y un precio inicial.",
      ctaTitle: "¿No sabes qué servicio te conviene?",
      ctaSubtitle: "Cuéntanos sobre tu negocio y te recomendamos el adecuado y te enviamos una cotización clara."
    },
    aboutPage: {
      title: "Nosotros | BLYNX Systems",
      description: "BLYNX ayuda a negocios locales en Estados Unidos con sitios web profesionales, seguimiento organizado de clientes y contenido mensual creado con IA.",
      eyebrow: "Nosotros",
      h1: "Soluciones digitales prácticas para negocios locales.",
      subtitle: "BLYNX crea sitios web profesionales, organiza las solicitudes de clientes y produce contenido mensual con herramientas impulsadas por IA.",
      cards: [
        ["A Quién Ayuda BLYNX", "BLYNX sirve a negocios locales en Estados Unidos que dependen de llamadas, solicitudes de cotización, reservas, consultas y confianza del cliente para crecer."],
        ["Qué Ofrece BLYNX", "Tres servicios: BLYNX Presence para tu sitio web y tu presencia en Google, BLYNX Complete para organizar las solicitudes de clientes, y BLYNX Content para imágenes y videos mensuales."],
        ["Por Qué Importa", "Los clientes locales comparan negocios rápidamente. Una presencia profesional en línea y una forma clara de contactarte te ayudan a mantenerte visible y a responder a tiempo."]
      ],
      positionEyebrow: "Nuestro enfoque",
      positionTitle: "Práctico, no complicado.",
      positionCopy: "BLYNX está basado en Nashville, Tennessee y apoya a negocios locales en todo Estados Unidos. Usamos IA para trabajar con eficiencia, pero vendemos soluciones prácticas — no tecnología difícil de entender.",
      bullets: [
        "Sitios web profesionales y presencia en Google que ayudan a los clientes a encontrarte.",
        "Solicitudes de clientes organizadas con respuestas automáticas y recordatorios de seguimiento.",
        "Imágenes y videos mensuales creados con herramientas creativas impulsadas por IA.",
        "Precios iniciales claros y un alcance definido para cada servicio."
      ],
      stats: [
        ["Nashville", "Basados en Tennessee y sirviendo a negocios locales en todo Estados Unidos."],
        ["Práctico", "Soluciones claras para dueños que quieren resultados, no confusión técnica."],
        ["Enfocado", "Tres servicios principales: Presence, Complete y Content. Hay servicios secundarios para necesidades específicas."]
      ],
      founder: {
        eyebrow: "Dirigido por su fundador",
        title: "Estrategia e Implementación Directa",
        name: "Gregor Silva",
        role: "Fundador de BLYNX",
        body:
          "BLYNX nació de la experiencia directa con los problemas digitales que enfrentan los negocios locales: perfiles incompletos, sitios web sin acciones claras, solicitudes dispersas y seguimiento lento.\n\nGregor trabaja directamente en la estrategia y la implementación, combinando sistemas digitales prácticos con procesos apoyados por inteligencia artificial para ayudar a los dueños a operar con mayor claridad, consistencia y rapidez.",
        support:
          "Trabajas directamente con la persona responsable de la estrategia, sin pasar entre diferentes departamentos.",
        alt: "Gregor Silva, fundador de BLYNX"
      },
      ctaTitle: "¿Listo para fortalecer tu negocio en línea?",
      ctaSubtitle: "Solicita una cotización y te responderemos con los próximos pasos."
    },
    contactPage: {
      title: "Contacto y Cotización | BLYNX Systems",
      description: "Contacta a BLYNX Systems o solicita una cotización para un sitio web profesional, seguimiento a clientes o contenido mensual creado con IA.",
      eyebrow: "Contacto",
      h1: "Hablemos de tu negocio.",
      subtitle: "Cuéntanos qué servicio te interesa y te responderemos con una cotización clara.",
      emailTitle: "Correo",
      phoneTitle: "Teléfono",
      locationTitle: "Ubicación",
      serviceAreaTitle: "Área de servicio",
      instagramTitle: "Instagram",
      auditTitle: "¿Quieres compartir más detalles?",
      auditCopy: "Usa nuestro formulario detallado de cotización para contarnos más sobre tu negocio y tu presencia en línea.",
      auditButton: "Cotización Detallada",
      languageTitle: "Soporte de idioma",
      languageCopy: "Hay soporte disponible en inglés y español.",
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
        "BLYNX Presence — Sitio web y presencia en Google",
        "BLYNX Complete — Sitio web + seguimiento a clientes",
        "BLYNX Content — Imágenes y videos mensuales",
        "Landing Page",
        "Perfil de Empresa de Google",
        "Solución de IA a medida",
        "No estoy seguro"
      ],
      languageOptions: ["Inglés", "Español"],
      consentPrefix: "Al enviar este formulario, aceptas nuestra",
      consentPrivacy: "Política de Privacidad",
      consentMiddle: "y nuestros",
      consentTerms: "Términos de Servicio",
      submit: "Solicitar una Cotización",
      loading: "Enviando...",
      success: "Gracias. Hemos recibido tu mensaje. BLYNX te contactará con los próximos pasos.",
      error: `Ocurrió un error al enviar tu mensaje. Inténtalo de nuevo o escríbenos directamente a ${BUSINESS.email}.`
    },
    resourcesPage: {
      title: "Recursos | BLYNX Systems",
      description: "Recursos prácticos para recibir solicitudes, mantenerlas organizadas y dar seguimiento.",
      eyebrow: "Recursos",
      h1: "Recursos prácticos de crecimiento para dueños de negocios locales.",
      subtitle: "Usa estos puntos de partida para revisar cómo los clientes te encuentran, te contactan y reciben seguimiento antes de solicitar una cotización.",
      cards: [
        ["Checklist del Proceso de Solicitudes", "Revisa lo básico que ayuda a los clientes a encontrar tu negocio, confiar y tomar el siguiente paso.", "Solicitar una cotización", "/contact"],
        ["Preparación para Recibir Solicitudes", "Revisa si tu sitio web y tu flujo de contacto hacen fácil que los clientes te contacten.", "Explorar los servicios", "/services"],
        ["Bases de Seguimiento", "Entiende cómo confirmaciones, recordatorios y organización simple reducen oportunidades perdidas.", "Hacer una pregunta", "/contact"]
      ]
    },
    projectsPage: {
      title: "Proyectos | BLYNX Systems",
      description:
        "Explora soluciones digitales prácticas y proyectos del fundador que muestran sitios web, experiencias de usuario y sistemas para negocios.",
      eyebrow: "NUESTRO TRABAJO",
      h1: "Trabajos Seleccionados y Proyectos Digitales",
      subtitle:
        "Explora soluciones digitales prácticas y proyectos del fundador que muestran sitios web, experiencias de usuario y sistemas para negocios.",
      realBadge: "Proyecto del fundador",
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
        headline: "Trabajos Seleccionados y Proyectos Digitales",
        copy: "Explora soluciones digitales prácticas y proyectos del fundador que muestran sitios web, experiencias de usuario y sistemas para negocios.",
        cta: "Ver proyectos"
      }
    }
  }
};

// Commercial offer — single source of truth for the three core services, the
// optional Content publishing add-on, the compact secondary services and the
// FAQ. Both languages are rendered from this one object and checked for parity
// by validateCommercialOfferParity() below, so EN and ES can never advertise
// different services, quantities or prices.
const commercialOffer = {
  en: {
    eyebrow: "Our services",
    title: "Three services. Clear prices.",
    intro: "Build your online presence, organize your customer requests, or keep your brand active with fresh content every month.",
    priceLabel: "Starting at",
    plansTitle: "Choose a plan",
    bestForLabel: "Best for",
    includedTitle: "What's included",
    fullIncludedTitle: "Everything included",
    deliveryLabel: "Estimated delivery",
    detailsLink: "See full details",
    publishingToggle: "Publishing details and limits",
    externalCostsNote: "Domain registration, hosting, paid licenses and third-party services may have separate recurring costs.",
    services: [
      {
        id: "blynx-presence",
        legacyIds: ["digital-presence-system"],
        number: "Service 01",
        name: "BLYNX Presence",
        kind: "setup",
        headline: "Build Your Professional Online Presence.",
        description:
          "A professional website and Google presence that make it easy for customers to find information about your business and contact you.",
        bestFor: "Businesses that need a professional website and a clear way for customers to reach them.",
        startingPrice: 1500,
        priceUnit: "One-time setup",
        priceNote: "One-time project. No mandatory monthly service contract. Optional support available after launch.",
        deliveryShort: "Ready in about 2 weeks",
        delivery: "Approximately 2 weeks (10 business days)",
        highlights: [
          "Professional website, up to 5 pages",
          "Mobile-friendly design",
          "Google Business Profile setup or basic optimization",
          "Contact forms and new inquiry notifications",
          "Basic local SEO and Google review link"
        ],
        included: [
          "Professional website, up to 5 pages",
          "Mobile-friendly design",
          "Google Business Profile setup or basic optimization, subject to eligibility and access",
          "Contact forms and contact buttons",
          "New inquiry notifications",
          "Basic local SEO",
          "Google review link",
          "Basic launch guidance",
          "Two rounds of revisions"
        ],
        care: {
          name: "Optional Website Care",
          price: 99,
          priceUnit: "/month",
          description: "Basic maintenance, technical oversight and up to 30 minutes of minor changes per month. Optional and contracted separately."
        },
        notes: ["Domain registration, hosting, paid licenses and third-party services may have separate recurring costs."],
        cardCta: "Request a Quote",
        cta: "Request a Quote",
        ctaTarget: "contact"
      },
      {
        id: "blynx-complete",
        legacyIds: ["lead-capture-organization", "lead-capture-follow-up", "local-lead-system"],
        number: "Service 02",
        name: "BLYNX Complete",
        kind: "setup",
        headline: "Your Website. Your Customers. Organized.",
        description:
          "Everything in Presence, plus automatic responses and an organized way to keep track of customer requests and follow-ups.",
        bestFor: "Businesses that receive customer requests and want to respond and follow up on time.",
        startingPrice: 2500,
        priceUnit: "One-time setup",
        priceNote: "One-time project. No mandatory monthly service contract. Optional support available after launch.",
        deliveryShort: "Ready in 2–3 weeks",
        delivery: "2–3 weeks (10–15 business days)",
        highlights: [
          "Everything in BLYNX Presence",
          "Customer requests organized in one place",
          "Automatic first response to new inquiries",
          "Follow-up reminders and request status tracking",
          "Simple contact and request dashboard"
        ],
        included: [
          "Everything in BLYNX Presence",
          "Centralized customer inquiry organization",
          "Automatic initial response to new inquiries",
          "Follow-up reminders",
          "Simple contact and request dashboard",
          "Basic request status tracking",
          "Connection of one standard inquiry channel",
          "System configuration and testing",
          "Basic customer training"
        ],
        care: {
          name: "Optional Automation Support",
          price: 350,
          pricePrefix: "Starting at ",
          priceUnit: "/month",
          description: "Limited technical monitoring, support and minor adjustments to existing automations, within the contracted scope. Optional and contracted separately."
        },
        notes: [
          "Advanced AI assistants, complex integrations and unlimited automations are not included.",
          "Domain registration, hosting, paid licenses and third-party services may have separate recurring costs."
        ],
        cardCta: "Request a Quote",
        cta: "Request a Quote",
        ctaTarget: "contact"
      },
      {
        id: "blynx-content",
        legacyIds: [],
        number: "Service 03",
        name: "BLYNX Content",
        kind: "subscription",
        headline: "Your Brand. Fresh Content. Every Month.",
        description: "Professional images, videos and captions created every month with AI-powered creative tools.",
        bestFor: "Businesses that want fresh images and videos every month, with or without a BLYNX website.",
        subscriptionLabel: "Monthly subscription",
        independentNote: "Independent service — no BLYNX website required.",
        plans: [
          {
            name: "BLYNX Content Images",
            price: 300,
            publishingPrice: 400,
            summary: "12 branded images",
            items: [
              "12 branded single-image designs monthly",
              "Captions and content ideas",
              "Suggested publishing calendar",
              "One consolidated revision round"
            ]
          },
          {
            name: "BLYNX Content Videos",
            price: 600,
            publishingPrice: 700,
            summary: "6 short videos",
            items: [
              "6 short videos monthly, up to 30 seconds each",
              "Creative ideas and scripts",
              "AI-assisted editing and production",
              "Captions",
              "One consolidated revision round"
            ]
          },
          {
            name: "BLYNX Content Plus",
            price: 750,
            publishingPrice: 850,
            summary: "12 images + 6 videos",
            items: [
              "12 branded images",
              "6 short videos, up to 30 seconds each",
              "Scripts, captions and monthly content calendar",
              "One consolidated revision round"
            ]
          }
        ],
        perMonth: "/month",
        publishingLine: "Optional: add Instagram & Facebook publishing for +$100/month — $400, $700 or $850 with publishing.",
        notes: [
          "Content subscriptions are billed monthly in advance.",
          "Content does not require a BLYNX website.",
          "Complex carousels, on-site filming and advanced productions are outside standard scope."
        ],
        cardCta: "Explore Content Plans",
        cta: "Request a Quote",
        ctaTarget: "services#blynx-content"
      }
    ],
    publishing: {
      eyebrow: "Optional add-on for BLYNX Content",
      name: "Add Instagram & Facebook Publishing",
      price: 100,
      priceUnit: "/month",
      priceLead: "+",
      summary: "We schedule and publish your approved content on Instagram and Facebook.",
      includedTitle: "Included",
      included: [
        "Scheduling and publishing up to 18 unique content pieces per month",
        "Publishing approved pieces on Instagram and Facebook",
        "Client approval before publication",
        "Basic monthly publishing calendar",
        "Use of Meta Business Suite or an appropriate scheduling tool"
      ],
      tableTitle: "Monthly price with publishing",
      tableHead: ["Plan", "Content only", "With publishing"],
      limitsTitle: "Limits",
      limits: [
        "Each unique content piece may be published on both platforms.",
        "Publishing cannot exceed the content included in your plan: up to 12 images, up to 6 videos, or up to 18 pieces with BLYNX Content Plus."
      ],
      notIncludedTitle: "Not included",
      notIncluded: [
        "Responding to comments",
        "Answering messages",
        "Daily account management",
        "Advertising campaigns",
        "Community management"
      ]
    },
    secondary: {
      eyebrow: "Also available",
      title: "More ways to work with BLYNX",
      items: [
        {
          name: "Landing Page",
          imageKey: "landing-page",
          price: 950,
          priceText: "Starting at $950",
          description: "Single-page professional website.",
          meta: "Estimated delivery: 5–7 business days."
        },
        {
          name: "Google Business Profile",
          imageKey: "google-business-profile",
          price: 249,
          priceText: "Starting at $249",
          description: "Basic setup or optimization for eligible businesses.",
          meta: "Google controls verification and approval."
        },
        {
          name: "Custom AI Solutions",
          imageKey: "custom-ai",
          price: null,
          priceText: "Custom quote",
          description:
            "AI chatbots, virtual assistants, booking automations, custom business integrations, advanced automated workflows, and digital tools and applications.",
          meta: "Each custom project requires individual evaluation and pricing."
        }
      ],
      cta: "Request a Quote",
      ctaTarget: "contact"
    },
    faq: {
      eyebrow: "Frequently asked questions",
      title: "Clear answers before you choose",
      items: [
        [
          "Which service is right for my business?",
          "BLYNX Presence is the starting point if you need a professional website and a Google presence. BLYNX Complete adds automatic responses and an organized way to track customer requests and follow-ups. BLYNX Content creates images and videos every month, with or without a BLYNX website. Not sure? Request a quote and we will recommend the best fit."
        ],
        [
          "How long does a website take?",
          "BLYNX Presence takes approximately 2 weeks (10 business days) and BLYNX Complete takes 2–3 weeks (10–15 business days). The schedule starts after we receive all required information, materials and access. Timelines are estimates, not guaranteed deadlines, and Google Business Profile verification depends on Google."
        ],
        [
          "Do I need a BLYNX website to subscribe to BLYNX Content?",
          "No. BLYNX Content is an independent monthly subscription. You can subscribe with or without a BLYNX website."
        ],
        [
          "What does Instagram & Facebook publishing include?",
          "For +$100/month we schedule and publish up to 18 unique pieces per month on Instagram and Facebook, after you approve each one. Publishing cannot exceed the content in your plan: up to 12 images, up to 6 videos, or up to 18 pieces with BLYNX Content Plus. It does not include responding to comments, answering messages, daily account management, advertising campaigns or community management."
        ],
        [
          "Are there ongoing costs after my website is built?",
          "BLYNX Presence and BLYNX Complete are one-time projects with no mandatory monthly service contract. Optional monthly support is available separately: Website Care at $99/month and Automation Support starting at $350/month. Domain registration, hosting, paid licenses and third-party services may have separate recurring costs."
        ],
        [
          "What is not included?",
          "BLYNX Complete does not include advanced AI assistants, complex integrations or unlimited automations. BLYNX Content does not include complex carousels, on-site filming or advanced productions. Anything beyond these scopes, including custom AI solutions, is evaluated and quoted individually."
        ],
        [
          "Does BLYNX guarantee more customers?",
          "No. BLYNX builds the website, systems and content that help your business look professional and respond to customers efficiently. Results also depend on market demand, your offer, pricing, competition, reputation, response speed and customer service."
        ],
        [
          "How does payment work?",
          "One-time setups are paid in three parts: 50% to begin, 30% after approval of the build and 20% before launch. Content subscriptions and optional monthly plans are billed monthly in advance."
        ]
      ]
    }
  },
  es: {
    eyebrow: "Nuestros servicios",
    title: "Tres servicios. Precios claros.",
    intro: "Construye tu presencia en línea, organiza las solicitudes de tus clientes o mantén tu marca activa con contenido fresco cada mes.",
    priceLabel: "Desde",
    plansTitle: "Elige un plan",
    bestForLabel: "Ideal para",
    includedTitle: "Qué incluye",
    fullIncludedTitle: "Todo lo incluido",
    deliveryLabel: "Entrega estimada",
    detailsLink: "Ver todos los detalles",
    publishingToggle: "Detalles y límites de la publicación",
    externalCostsNote: "El registro del dominio, el hosting, las licencias de pago y los servicios de terceros pueden tener costos recurrentes independientes.",
    services: [
      {
        id: "blynx-presence",
        legacyIds: ["sistema-presencia-digital"],
        number: "Servicio 01",
        name: "BLYNX Presence",
        kind: "setup",
        headline: "Construye tu presencia profesional en línea.",
        description:
          "Un sitio web profesional y presencia en Google para que tus clientes encuentren fácilmente información sobre tu negocio y te contacten.",
        bestFor: "Negocios que necesitan un sitio web profesional y una forma clara de que los clientes los contacten.",
        startingPrice: 1500,
        priceUnit: "Configuración única",
        priceNote: "Proyecto de pago único. Sin contrato mensual de servicio obligatorio. Soporte opcional disponible después del lanzamiento.",
        deliveryShort: "Listo en unas 2 semanas",
        delivery: "Aproximadamente 2 semanas (10 días hábiles)",
        highlights: [
          "Sitio web profesional de hasta 5 páginas",
          "Diseño adaptado a celulares",
          "Configuración u optimización básica del Perfil de Empresa de Google",
          "Formularios de contacto y avisos de nuevas solicitudes",
          "SEO local básico y enlace para reseñas de Google"
        ],
        included: [
          "Sitio web profesional de hasta 5 páginas",
          "Diseño adaptado a celulares",
          "Configuración u optimización básica del Perfil de Empresa de Google, sujeta a elegibilidad y acceso",
          "Formularios y botones de contacto",
          "Avisos de nuevas solicitudes",
          "SEO local básico",
          "Enlace para reseñas de Google",
          "Orientación básica para el lanzamiento",
          "Dos rondas de revisiones"
        ],
        care: {
          name: "Website Care opcional",
          price: 99,
          priceUnit: "/mes",
          description: "Mantenimiento básico, supervisión técnica y hasta 30 minutos mensuales de cambios menores. Opcional y se contrata por separado."
        },
        notes: ["El registro del dominio, el hosting, las licencias de pago y los servicios de terceros pueden tener costos recurrentes independientes."],
        cardCta: "Solicitar una Cotización",
        cta: "Solicitar una Cotización",
        ctaTarget: "contact"
      },
      {
        id: "blynx-complete",
        legacyIds: ["sistema-captacion-organizacion", "sistema-captacion-seguimiento", "sistema-local-captacion"],
        number: "Servicio 02",
        name: "BLYNX Complete",
        kind: "setup",
        headline: "Tu sitio web. Tus clientes. Organizados.",
        description:
          "Todo lo de Presence, más respuestas automáticas y una forma organizada de dar seguimiento a las solicitudes de tus clientes.",
        bestFor: "Negocios que reciben solicitudes de clientes y quieren responder y dar seguimiento a tiempo.",
        startingPrice: 2500,
        priceUnit: "Configuración única",
        priceNote: "Proyecto de pago único. Sin contrato mensual de servicio obligatorio. Soporte opcional disponible después del lanzamiento.",
        deliveryShort: "Listo en 2–3 semanas",
        delivery: "2–3 semanas (10–15 días hábiles)",
        highlights: [
          "Todo lo de BLYNX Presence",
          "Solicitudes de clientes organizadas en un solo lugar",
          "Respuesta automática inicial a nuevas solicitudes",
          "Recordatorios de seguimiento y estado de cada solicitud",
          "Panel simple de contactos y solicitudes"
        ],
        included: [
          "Todo lo de BLYNX Presence",
          "Organización centralizada de las solicitudes de clientes",
          "Respuesta automática inicial a nuevas solicitudes",
          "Recordatorios de seguimiento",
          "Panel simple de contactos y solicitudes",
          "Seguimiento básico del estado de cada solicitud",
          "Conexión de un canal estándar de solicitudes",
          "Configuración y pruebas del sistema",
          "Capacitación básica para el cliente"
        ],
        care: {
          name: "Automation Support opcional",
          price: 350,
          pricePrefix: "Desde ",
          priceUnit: "/mes",
          description: "Supervisión técnica limitada, soporte y ajustes menores de las automatizaciones existentes, dentro del alcance contratado. Opcional y se contrata por separado."
        },
        notes: [
          "No incluye asistentes de IA avanzados, integraciones complejas ni automatizaciones ilimitadas.",
          "El registro del dominio, el hosting, las licencias de pago y los servicios de terceros pueden tener costos recurrentes independientes."
        ],
        cardCta: "Solicitar una Cotización",
        cta: "Solicitar una Cotización",
        ctaTarget: "contact"
      },
      {
        id: "blynx-content",
        legacyIds: [],
        number: "Servicio 03",
        name: "BLYNX Content",
        kind: "subscription",
        headline: "Tu marca. Contenido fresco. Cada mes.",
        description: "Imágenes, videos y textos profesionales creados cada mes con herramientas creativas impulsadas por IA.",
        bestFor: "Negocios que quieren imágenes y videos nuevos cada mes, con o sin un sitio web de BLYNX.",
        subscriptionLabel: "Suscripción mensual",
        independentNote: "Servicio independiente — no requiere un sitio web de BLYNX.",
        plans: [
          {
            name: "BLYNX Content Images",
            price: 300,
            publishingPrice: 400,
            summary: "12 imágenes de marca",
            items: [
              "12 diseños de imagen única con tu marca cada mes",
              "Textos para publicaciones e ideas de contenido",
              "Calendario de publicación sugerido",
              "Una ronda de revisión consolidada"
            ]
          },
          {
            name: "BLYNX Content Videos",
            price: 600,
            publishingPrice: 700,
            summary: "6 videos cortos",
            items: [
              "6 videos cortos al mes, de hasta 30 segundos cada uno",
              "Ideas creativas y guiones",
              "Edición y producción asistidas por IA",
              "Textos para publicaciones",
              "Una ronda de revisión consolidada"
            ]
          },
          {
            name: "BLYNX Content Plus",
            price: 750,
            publishingPrice: 850,
            summary: "12 imágenes + 6 videos",
            items: [
              "12 imágenes con tu marca",
              "6 videos cortos, de hasta 30 segundos cada uno",
              "Guiones, textos para publicaciones y calendario mensual de contenido",
              "Una ronda de revisión consolidada"
            ]
          }
        ],
        perMonth: "/mes",
        publishingLine: "Opcional: agrega publicación en Instagram y Facebook por +$100/mes — $400, $700 o $850 con publicación.",
        notes: [
          "Las suscripciones de Content se cobran mensualmente por adelantado.",
          "Content no requiere un sitio web de BLYNX.",
          "Los carruseles complejos, la grabación en sitio y las producciones avanzadas quedan fuera del alcance estándar."
        ],
        cardCta: "Conocer los Planes de Content",
        cta: "Solicitar una Cotización",
        ctaTarget: "services#blynx-content"
      }
    ],
    publishing: {
      eyebrow: "Complemento opcional para BLYNX Content",
      name: "Agrega publicación en Instagram y Facebook",
      price: 100,
      priceUnit: "/mes",
      priceLead: "+",
      summary: "Programamos y publicamos tu contenido aprobado en Instagram y Facebook.",
      includedTitle: "Incluye",
      included: [
        "Programación y publicación de hasta 18 piezas de contenido únicas por mes",
        "Publicación de las piezas aprobadas en Instagram y Facebook",
        "Aprobación del cliente antes de publicar",
        "Calendario mensual básico de publicación",
        "Uso de Meta Business Suite o una herramienta de programación adecuada"
      ],
      tableTitle: "Precio mensual con publicación",
      tableHead: ["Plan", "Solo contenido", "Con publicación"],
      limitsTitle: "Límites",
      limits: [
        "Cada pieza de contenido única puede publicarse en ambas plataformas.",
        "La publicación no puede superar el contenido incluido en tu plan: hasta 12 imágenes, hasta 6 videos, o hasta 18 piezas con BLYNX Content Plus."
      ],
      notIncludedTitle: "No incluye",
      notIncluded: [
        "Responder comentarios",
        "Contestar mensajes",
        "Gestión diaria de cuentas",
        "Campañas publicitarias",
        "Gestión de comunidad"
      ]
    },
    secondary: {
      eyebrow: "También disponible",
      title: "Más formas de trabajar con BLYNX",
      items: [
        {
          name: "Landing Page",
          imageKey: "landing-page",
          price: 950,
          priceText: "Desde $950",
          description: "Sitio web profesional de una sola página.",
          meta: "Entrega estimada: 5–7 días hábiles."
        },
        {
          name: "Perfil de Empresa de Google",
          imageKey: "google-business-profile",
          price: 249,
          priceText: "Desde $249",
          description: "Configuración u optimización básica para negocios elegibles.",
          meta: "Google controla la verificación y la aprobación."
        },
        {
          name: "Soluciones de IA a Medida",
          imageKey: "custom-ai",
          price: null,
          priceText: "Cotización personalizada",
          description:
            "Chatbots de IA, asistentes virtuales, automatizaciones de reservas, integraciones personalizadas para el negocio, flujos de trabajo automatizados avanzados, y herramientas y aplicaciones digitales.",
          meta: "Cada proyecto a medida requiere evaluación y precio individuales."
        }
      ],
      cta: "Solicitar una Cotización",
      ctaTarget: "contact"
    },
    faq: {
      eyebrow: "Preguntas frecuentes",
      title: "Respuestas claras antes de elegir",
      items: [
        [
          "¿Qué servicio es el adecuado para mi negocio?",
          "BLYNX Presence es el punto de partida si necesitas un sitio web profesional y presencia en Google. BLYNX Complete agrega respuestas automáticas y una forma organizada de dar seguimiento a las solicitudes de tus clientes. BLYNX Content crea imágenes y videos cada mes, con o sin un sitio web de BLYNX. ¿No estás seguro? Solicita una cotización y te recomendamos la mejor opción."
        ],
        [
          "¿Cuánto tarda un sitio web?",
          "BLYNX Presence tarda aproximadamente 2 semanas (10 días hábiles) y BLYNX Complete tarda de 2 a 3 semanas (10–15 días hábiles). El calendario comienza después de recibir toda la información, los materiales y los accesos necesarios. Los plazos son estimados, no fechas límite garantizadas, y la verificación del Perfil de Empresa de Google depende de Google."
        ],
        [
          "¿Necesito un sitio web de BLYNX para suscribirme a BLYNX Content?",
          "No. BLYNX Content es una suscripción mensual independiente. Puedes suscribirte con o sin un sitio web de BLYNX."
        ],
        [
          "¿Qué incluye la publicación en Instagram y Facebook?",
          "Por +$100/mes programamos y publicamos hasta 18 piezas únicas por mes en Instagram y Facebook, después de que apruebes cada una. La publicación no puede superar el contenido de tu plan: hasta 12 imágenes, hasta 6 videos, o hasta 18 piezas con BLYNX Content Plus. No incluye responder comentarios, contestar mensajes, gestión diaria de cuentas, campañas publicitarias ni gestión de comunidad."
        ],
        [
          "¿Hay costos continuos después de construir mi sitio web?",
          "BLYNX Presence y BLYNX Complete son proyectos de pago único, sin contrato mensual de servicio obligatorio. El soporte mensual opcional se contrata por separado: Website Care a $99/mes y Automation Support desde $350/mes. El registro del dominio, el hosting, las licencias de pago y los servicios de terceros pueden tener costos recurrentes independientes."
        ],
        [
          "¿Qué no está incluido?",
          "BLYNX Complete no incluye asistentes de IA avanzados, integraciones complejas ni automatizaciones ilimitadas. BLYNX Content no incluye carruseles complejos, grabación en sitio ni producciones avanzadas. Cualquier cosa fuera de estos alcances, incluidas las soluciones de IA a medida, se evalúa y se cotiza de forma individual."
        ],
        [
          "¿BLYNX garantiza más clientes?",
          "No. BLYNX construye el sitio web, los sistemas y el contenido que ayudan a tu negocio a verse profesional y a responder a los clientes con eficiencia. Los resultados también dependen de la demanda del mercado, tu oferta, tus precios, la competencia, tu reputación, la velocidad de respuesta y el servicio al cliente."
        ],
        [
          "¿Cómo funciona el pago?",
          "Las configuraciones únicas se pagan en tres partes: 50% para comenzar, 30% después de la aprobación de la construcción y 20% antes del lanzamiento. Las suscripciones de Content y los planes mensuales opcionales se cobran mensualmente por adelantado."
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
  const samePrice = (left, right, label) => {
    if (left !== right) throw new Error(`Bilingual offer mismatch: ${label}`);
  };

  // --- Exactly three core services, same order, kind, id, CTA target ---
  if (en.services.length !== 3 || es.services.length !== 3) {
    throw new Error("Bilingual offer mismatch: expected exactly 3 services in each language");
  }
  en.services.forEach((service, index) => {
    const translated = es.services[index];
    const label = `service ${index + 1}`;
    samePrice(service.id, translated.id, `${label} id`);
    samePrice(service.kind, translated.kind, `${label} kind`);
    samePrice(service.ctaTarget, translated.ctaTarget, `${label} CTA destination`);
    sameLength(service.legacyIds, translated.legacyIds, `${label} legacy anchors`);
    sameLength(service.notes, translated.notes, `${label} notes`);
    if (service.kind === "setup") {
      samePrice(service.startingPrice, translated.startingPrice, `${label} price`);
      sameLength(service.highlights, translated.highlights, `${label} highlights`);
      sameLength(service.included, translated.included, `${label} included`);
      samePrice(service.care.price, translated.care.price, `${label} care price`);
      if (!service.priceNote || !translated.priceNote) throw new Error(`Bilingual offer mismatch: ${label} one-time price note`);
      samePrice(service.care.priceUnit.startsWith("/"), translated.care.priceUnit.startsWith("/"), `${label} care unit`);
    } else {
      sameLength(service.plans, translated.plans, `${label} plans`);
      service.plans.forEach((plan, planIndex) => {
        const other = translated.plans[planIndex];
        samePrice(plan.price, other.price, `${label} plan ${planIndex + 1} price`);
        samePrice(plan.publishingPrice, other.publishingPrice, `${label} plan ${planIndex + 1} publishing price`);
        // Publishing is always the plan price + $100 — never let the two drift apart.
        samePrice(plan.publishingPrice, plan.price + en.publishing.price, `${label} plan ${planIndex + 1} publishing math`);
        sameLength(plan.items, other.items, `${label} plan ${planIndex + 1} items`);
      });
    }
  });

  // --- Publishing add-on ---
  samePrice(en.publishing.price, es.publishing.price, "publishing price");
  sameLength(en.publishing.included, es.publishing.included, "publishing included");
  sameLength(en.publishing.limits, es.publishing.limits, "publishing limits");
  sameLength(en.publishing.notIncluded, es.publishing.notIncluded, "publishing exclusions");
  sameLength(en.publishing.tableHead, es.publishing.tableHead, "publishing table");

  // --- Secondary services ---
  sameLength(en.secondary.items, es.secondary.items, "secondary services");
  en.secondary.items.forEach((item, index) => {
    samePrice(item.price, es.secondary.items[index].price, `secondary service ${index + 1} price`);
  });
  samePrice(en.secondary.ctaTarget, es.secondary.ctaTarget, "secondary CTA destination");

  // --- FAQ ---
  sameLength(en.faq.items, es.faq.items, "FAQ topics");
}

validateCommercialOfferParity();

const implementationPlan = {
  en: {
    eyebrow: "Delivery timeline",
    title: "Your Website. Ready in Approximately 2 Weeks.",
    steps: [
      {
        label: "Week 1",
        title: "Design & Development",
        copy: "Initial website development, responsive design, contact configuration and first presentation."
      },
      {
        label: "Week 2",
        title: "Revisions & Launch",
        copy: "Client feedback, included corrections, testing and publication."
      }
    ],
    conditionsTitle: "Good to know",
    conditions: [
      "The schedule starts after we receive all required information, materials and access.",
      "Estimated timelines are not guaranteed deadlines.",
      "Delayed client responses or additional requirements may extend delivery.",
      "Google Business Profile verification depends on Google.",
      "More complex implementations have individually confirmed timelines."
    ]
  },
  es: {
    eyebrow: "Plazo de entrega",
    title: "Tu sitio web. Listo en aproximadamente 2 semanas.",
    steps: [
      {
        label: "Semana 1",
        title: "Diseño y desarrollo",
        copy: "Desarrollo inicial del sitio, diseño adaptable, configuración de contacto y primera presentación."
      },
      {
        label: "Semana 2",
        title: "Revisiones y lanzamiento",
        copy: "Comentarios del cliente, correcciones incluidas, pruebas y publicación."
      }
    ],
    conditionsTitle: "Es bueno saber",
    conditions: [
      "El calendario comienza después de recibir toda la información, los materiales y los accesos necesarios.",
      "Los plazos estimados no son fechas límite garantizadas.",
      "Las respuestas tardías del cliente o los requisitos adicionales pueden extender la entrega.",
      "La verificación del Perfil de Empresa de Google depende de Google.",
      "Las implementaciones más complejas tienen plazos confirmados individualmente."
    ]
  }
};

const stagePages = {
  en: {
    title: "Choose Your Starting Point | BLYNX",
    description: "Choose whether your business already has a digital presence or is starting from zero.",
    aria: "Choose business stage",
    eyebrow: "Digital Solutions for Local Businesses",
    h1: "What best describes your business?",
    subtitle: "Choose where your business is today so we can show you the clearest next step.",
    skip: "Skip for now",
    cards: [
      {
        value: "existing",
        title: "I already have a digital presence",
        copy: "You already have a website, Google profile, or some online presence — and you want to improve it, organize your customer requests, or add monthly content.",
        bullets: ["Improve your website or Google presence", "Organize customer requests", "Add automatic responses and reminders", "Create monthly content"],
        cta: "Continue"
      },
      {
        value: "zero",
        title: "I’m starting from zero",
        copy: "You do not have a website or Google Business Profile yet. BLYNX can build the professional foundation customers expect to find.",
        bullets: ["Professional website", "Google Business Profile setup", "Contact forms and notifications", "Basic local SEO", "Monthly content, if you want it"],
        cta: "Continue"
      }
    ]
  },
  es: {
    title: "Elige tu Punto de Partida | BLYNX",
    description: "Elige si tu negocio ya tiene presencia digital o está empezando desde cero.",
    aria: "Elegir etapa del negocio",
    eyebrow: "Soluciones Digitales para Negocios Locales",
    h1: "¿Qué describe mejor tu negocio?",
    subtitle: "Elige en qué punto está tu negocio para mostrarte el siguiente paso más claro.",
    skip: "Saltar por ahora",
    cards: [
      {
        value: "existing",
        title: "Ya tengo presencia digital",
        copy: "Ya tienes sitio web, Perfil de Empresa de Google o alguna presencia en línea — y quieres mejorarla, organizar las solicitudes de tus clientes o agregar contenido mensual.",
        bullets: ["Mejorar tu sitio web o tu presencia en Google", "Organizar las solicitudes de clientes", "Agregar respuestas automáticas y recordatorios", "Crear contenido mensual"],
        cta: "Continuar"
      },
      {
        value: "zero",
        title: "Estoy empezando desde cero",
        copy: "Todavía no tienes sitio web ni Perfil de Empresa de Google. BLYNX puede construir la base profesional que los clientes esperan encontrar.",
        bullets: ["Sitio web profesional", "Configuración del Perfil de Empresa de Google", "Formularios de contacto y avisos", "SEO local básico", "Contenido mensual, si lo quieres"],
        cta: "Continuar"
      }
    ]
  }
};

const stageLandingPages = {
  en: {
    existing: {
      title: "Improve What You Already Have | BLYNX",
      description: "Improve your website, Google presence, customer follow-up or monthly content with BLYNX.",
      eyebrow: "Existing digital presence",
      h1: "Improve What You Already Have",
      subtitle: "For businesses that already have a website, Google profile, or online presence. Tell us what you want to improve and we’ll recommend the right BLYNX service.",
      cards: [
        ["A Stronger Website", "Improve or rebuild your website so customers can find information and contact you easily."],
        ["Google Presence", "Optimize your Google Business Profile and basic local SEO, subject to eligibility and access."],
        ["Organized Customer Requests", "Keep every inquiry in one place, with automatic responses and follow-up reminders (BLYNX Complete)."],
        ["Fresh Monthly Content", "Professional images and videos created every month (BLYNX Content)."]
      ],
      processTitle: "How It Works",
      steps: ["Tell us about your business", "We review what you have", "Get a clear quote", "Start improving"],
      ctaTitle: "Ready to improve what you already have?",
      ctaSubtitle: "Tell us what you need and we’ll send you a clear quote.",
      cta: "Request a Quote",
      auditSlug: "free-audit-existing"
    },
    zero: {
      title: "Build Your Online Presence From Zero | BLYNX",
      description: "Build the professional website and Google presence your local business needs to be found and contacted.",
      eyebrow: "Starting from zero",
      h1: "Build Your Online Presence From Zero",
      subtitle: "For businesses that don’t yet have a website or Google Business Profile. Tell us about your business and we’ll recommend the right BLYNX service.",
      cards: [
        ["Professional Website", "Up to 5 pages, mobile-friendly, with contact forms."],
        ["Google Business Profile", "Setup or basic optimization, subject to eligibility and access."],
        ["Easy Contact", "Contact forms, contact buttons and new inquiry notifications."],
        ["Basic Local SEO", "Help customers in your area find you, plus a Google review link."],
        ["Organized Customer Requests", "Add BLYNX Complete to track requests and follow up on time."],
        ["Monthly Content", "Add BLYNX Content for fresh images and videos every month."]
      ],
      processTitle: "What BLYNX Builds First",
      steps: ["Plan your website and Google presence", "Design and build your website", "Review, revise and launch", "Add follow-up or content, if you want"],
      ctaTitle: "Starting from zero?",
      ctaSubtitle: "Tell us about your business and we’ll send you a clear quote.",
      cta: "Request a Quote",
      auditSlug: "free-audit-zero"
    }
  },
  es: {
    existing: {
      title: "Mejora lo que Ya Tienes | BLYNX",
      description: "Mejora tu sitio web, tu presencia en Google, el seguimiento a clientes o tu contenido mensual con BLYNX.",
      eyebrow: "Presencia digital existente",
      h1: "Mejora lo que Ya Tienes",
      subtitle: "Para negocios que ya tienen sitio web, Perfil de Empresa de Google o presencia en línea. Cuéntanos qué quieres mejorar y te recomendamos el servicio de BLYNX adecuado.",
      cards: [
        ["Un Sitio Web Más Fuerte", "Mejoramos o reconstruimos tu sitio web para que los clientes encuentren información y te contacten fácilmente."],
        ["Presencia en Google", "Optimizamos tu Perfil de Empresa de Google y el SEO local básico, sujeto a elegibilidad y acceso."],
        ["Solicitudes de Clientes Organizadas", "Cada solicitud en un solo lugar, con respuestas automáticas y recordatorios de seguimiento (BLYNX Complete)."],
        ["Contenido Fresco Cada Mes", "Imágenes y videos profesionales creados cada mes (BLYNX Content)."]
      ],
      processTitle: "Cómo Funciona",
      steps: ["Cuéntanos sobre tu negocio", "Revisamos lo que tienes", "Recibe una cotización clara", "Empieza a mejorar"],
      ctaTitle: "¿Listo para mejorar lo que ya tienes?",
      ctaSubtitle: "Cuéntanos qué necesitas y te enviamos una cotización clara.",
      cta: "Solicitar una Cotización",
      auditSlug: "free-audit-existing"
    },
    zero: {
      title: "Construye tu Presencia en Línea Desde Cero | BLYNX",
      description: "Construye el sitio web profesional y la presencia en Google que tu negocio local necesita para que lo encuentren y lo contacten.",
      eyebrow: "Empezando desde cero",
      h1: "Construye tu Presencia en Línea Desde Cero",
      subtitle: "Para negocios que todavía no tienen sitio web ni Perfil de Empresa de Google. Cuéntanos sobre tu negocio y te recomendamos el servicio de BLYNX adecuado.",
      cards: [
        ["Sitio Web Profesional", "Hasta 5 páginas, adaptado a celulares y con formularios de contacto."],
        ["Perfil de Empresa de Google", "Configuración u optimización básica, sujeta a elegibilidad y acceso."],
        ["Contacto Fácil", "Formularios y botones de contacto, y avisos de nuevas solicitudes."],
        ["SEO Local Básico", "Ayudamos a que los clientes de tu zona te encuentren, y agregamos un enlace para reseñas de Google."],
        ["Solicitudes de Clientes Organizadas", "Agrega BLYNX Complete para controlar las solicitudes y dar seguimiento a tiempo."],
        ["Contenido Mensual", "Agrega BLYNX Content para tener imágenes y videos nuevos cada mes."]
      ],
      processTitle: "Qué Construye BLYNX Primero",
      steps: ["Planificar tu sitio web y tu presencia en Google", "Diseñar y construir tu sitio web", "Revisar, ajustar y lanzar", "Agregar seguimiento o contenido, si lo quieres"],
      ctaTitle: "¿Estás empezando desde cero?",
      ctaSubtitle: "Cuéntanos sobre tu negocio y te enviamos una cotización clara.",
      cta: "Solicitar una Cotización",
      auditSlug: "free-audit-zero"
    }
  }
};

const stageAuditPages = {
  en: {
    existing: {
      title: "Request a Quote | Existing Digital Presence | BLYNX",
      description: "Request a quote to improve your existing website, Google presence, customer follow-up or monthly content.",
      eyebrow: "Request a quote",
      h1: "Tell Us About Your Current Presence",
      subtitle: "Show us what you already have and we’ll recommend the right service and send you a clear quote.",
      introTitle: "For businesses that already have something online.",
      introCopy: "We review your current website or landing page, Google presence and contact points before quoting.",
      bullets: ["Website and Google presence.", "Contact points and customer requests.", "Follow-up and content needs."],
      fields: {
        website: "Website URL",
        gbp: "Google Business Profile Link",
        improvements: "What do you want to improve?",
        timeline: "How soon do you want to start?",
        message: "Message / Notes"
      },
      improvements: [
        "Professional website",
        "Google Business Profile",
        "Customer inquiry organization and follow-up",
        "Monthly images and videos",
        "Landing page",
        "Custom AI solution",
        "Not sure"
      ],
      timelines: ["Immediately", "This month", "Next 2–3 months", "Just researching"],
      submit: "Send My Quote Request",
      hiddenLanguage: "English",
      success: "Thank you. Your quote request has been received. We’ll review your information and contact you with the next steps.",
      error: `Something went wrong sending your request. Please try again, or email us directly at ${BUSINESS.email}.`
    },
    zero: {
      title: "Request a Quote | Starting From Zero | BLYNX",
      description: "Request a quote for a professional website and Google presence for a local business starting from zero.",
      eyebrow: "Request a quote",
      h1: "Plan Your Online Presence",
      subtitle: "Tell us about your business and we’ll recommend the right first steps and send you a clear quote.",
      introTitle: "For businesses starting from zero.",
      introCopy: "You don’t need a website or Google profile yet. Tell us what your business needs and we’ll quote it clearly.",
      bullets: ["Professional website.", "Google Business Profile setup.", "Organized customer requests and monthly content."],
      fields: {
        needs: "What do you need help with?",
        timeline: "How soon do you want to start?",
        message: "Message / Notes"
      },
      needs: [
        "Professional website",
        "Google Business Profile",
        "Customer inquiry organization and follow-up",
        "Monthly images and videos",
        "Landing page",
        "Custom AI solution",
        "Not sure"
      ],
      timelines: ["Immediately", "This month", "Next 2–3 months", "Just researching"],
      submit: "Send My Quote Request",
      hiddenLanguage: "English",
      success: "Thank you. Your quote request has been received. We’ll review your information and contact you with the next steps.",
      error: `Something went wrong sending your request. Please try again, or email us directly at ${BUSINESS.email}.`
    }
  },
  es: {
    existing: {
      title: "Solicita una Cotización | Presencia Digital Existente | BLYNX",
      description: "Solicita una cotización para mejorar tu sitio web, tu presencia en Google, el seguimiento a clientes o tu contenido mensual.",
      eyebrow: "Solicitar cotización",
      h1: "Cuéntanos sobre tu Presencia Actual",
      subtitle: "Muéstranos lo que ya tienes y te recomendamos el servicio adecuado y te enviamos una cotización clara.",
      introTitle: "Para negocios que ya tienen algo en línea.",
      introCopy: "Revisamos tu sitio web o landing page actual, tu presencia en Google y tus puntos de contacto antes de cotizar.",
      bullets: ["Sitio web y presencia en Google.", "Puntos de contacto y solicitudes de clientes.", "Necesidades de seguimiento y contenido."],
      fields: {
        website: "Sitio web",
        gbp: "Enlace del Perfil de Empresa de Google",
        improvements: "¿Qué quieres mejorar?",
        timeline: "¿Qué tan pronto quieres comenzar?",
        message: "Mensaje / Notas"
      },
      improvements: [
        "Sitio web profesional",
        "Perfil de Empresa de Google",
        "Organización y seguimiento de solicitudes de clientes",
        "Imágenes y videos mensuales",
        "Landing page",
        "Solución de IA a medida",
        "No estoy seguro"
      ],
      timelines: ["Inmediatamente", "Este mes", "En los próximos 2–3 meses", "Solo estoy investigando"],
      submit: "Enviar mi Solicitud de Cotización",
      hiddenLanguage: "Spanish",
      success: "Gracias. Hemos recibido tu solicitud de cotización. Revisaremos tu información y te contactaremos con los próximos pasos.",
      error: `Ocurrió un error al enviar tu solicitud. Inténtalo de nuevo o escríbenos directamente a ${BUSINESS.email}.`
    },
    zero: {
      title: "Solicita una Cotización | Desde Cero | BLYNX",
      description: "Solicita una cotización para un sitio web profesional y presencia en Google para un negocio local que empieza desde cero.",
      eyebrow: "Solicitar cotización",
      h1: "Planifica tu Presencia en Línea",
      subtitle: "Cuéntanos sobre tu negocio y te recomendamos los primeros pasos y te enviamos una cotización clara.",
      introTitle: "Para negocios que empiezan desde cero.",
      introCopy: "Todavía no necesitas un sitio web ni un perfil de Google. Cuéntanos qué necesita tu negocio y lo cotizamos con claridad.",
      bullets: ["Sitio web profesional.", "Configuración del Perfil de Empresa de Google.", "Solicitudes de clientes organizadas y contenido mensual."],
      fields: {
        needs: "¿Con qué necesitas ayuda?",
        timeline: "¿Qué tan pronto quieres comenzar?",
        message: "Mensaje / Notas"
      },
      needs: [
        "Sitio web profesional",
        "Perfil de Empresa de Google",
        "Organización y seguimiento de solicitudes de clientes",
        "Imágenes y videos mensuales",
        "Landing page",
        "Solución de IA a medida",
        "No estoy seguro"
      ],
      timelines: ["Inmediatamente", "Este mes", "En los próximos 2–3 meses", "Solo estoy investigando"],
      submit: "Enviar mi Solicitud de Cotización",
      hiddenLanguage: "Spanish",
      success: "Gracias. Hemos recibido tu solicitud de cotización. Revisaremos tu información y te contactaremos con los próximos pasos.",
      error: `Ocurrió un error al enviar tu solicitud. Inténtalo de nuevo o escríbenos directamente a ${BUSINESS.email}.`
    }
  }
};

const auditFlow = {
  en: [
    ["Tell us about your business", "Share your business, the service you are interested in and how to reach you."],
    ["We review your request", "BLYNX reviews your information and your current online presence."],
    ["Get a clear quote", "You receive a proposal with scope, price and estimated timeline."],
    ["Start your project", "Once you approve the quote, we get to work."]
  ],
  es: [
    ["Cuéntanos sobre tu negocio", "Comparte tu negocio, el servicio que te interesa y cómo contactarte."],
    ["Revisamos tu solicitud", "BLYNX revisa tu información y tu presencia actual en línea."],
    ["Recibe una cotización clara", "Recibes una propuesta con alcance, precio y plazo estimado."],
    ["Comienza tu proyecto", "Cuando apruebas la cotización, nos ponemos a trabajar."]
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
        ["Information Submitted Through Forms", "Quote request and contact forms may ask for information needed to understand your business, respond to your request, prepare a quote, route communications and maintain internal records. Some fields may be optional, but submitting incomplete information may limit how useful our response can be."],
        ["How We Use Information", "We use information to respond to requests, prepare quotes, provide services, maintain related communications, improve the website, understand performance and keep operational records."],
        ["Communications", "When you submit a form, BLYNX may contact you about that request, your quote or related service needs. Promotional communications require an appropriate basis and opt-out option when applicable."],
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
        ["Description of Services", "BLYNX provides professional websites and Google presence setup, customer inquiry organization and follow-up systems, monthly AI-powered content creation, and related custom digital solutions for local businesses."],
        ["Quotes and Informational Materials", "Quotes, website content, recommendations and informational materials are provided for general business evaluation. They are not a guarantee of rankings, leads, sales, revenue or any specific outcome."],
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
      effective: `Fecha de vigencia: ${LEGAL_EFFECTIVE_DATE_ES}`,
      sections: [
        ["Introducción", "Esta Política de Privacidad explica cómo BLYNX Systems recopila, utiliza y protege la información enviada a través de este sitio web y la información generada por el uso normal del sitio. Al usar el sitio o enviar un formulario, reconoces las prácticas descritas aquí."],
        ["Información que Recopilamos", "Podemos recopilar información que proporcionas directamente, incluyendo nombre completo, nombre del negocio, correo, teléfono, sitio web, ciudad y estado, tipo de negocio, URL de Google Business Profile, objetivos del negocio, mensajes y notas. También podemos recopilar información técnica generada por el uso normal del sitio, como tipo de navegador, información del dispositivo, páginas visitadas e información general de rendimiento."],
        ["Información Enviada en Formularios", "Los formularios de solicitud de cotización y contacto pueden solicitar información necesaria para entender tu negocio, responder a tu solicitud, preparar una cotización, dirigir comunicaciones y mantener registros internos. Algunos campos pueden ser opcionales, pero enviar información incompleta puede limitar la utilidad de nuestra respuesta."],
        ["Cómo Usamos la Información", "Usamos la información para responder solicitudes, preparar cotizaciones, prestar servicios, mantener comunicaciones relacionadas, mejorar el sitio, entender el rendimiento y conservar registros operativos."],
        ["Comunicaciones", "Cuando envías un formulario, BLYNX puede contactarte sobre esa solicitud, tu cotización o necesidades de servicio relacionadas. Las comunicaciones promocionales requieren una base adecuada y opción de exclusión cuando corresponda."],
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
      effective: `Fecha de vigencia: ${LEGAL_EFFECTIVE_DATE_ES}`,
      sections: [
        ["Aceptación de los Términos", "Al acceder a este sitio, enviar un formulario o usar materiales de BLYNX, aceptas estos Términos de Servicio. Si no estás de acuerdo, no uses el sitio."],
        ["Descripción de los Servicios", "BLYNX ofrece sitios web profesionales y configuración de presencia en Google, sistemas de organización y seguimiento de solicitudes de clientes, creación mensual de contenido con IA, y soluciones digitales a medida relacionadas para negocios locales."],
        ["Cotizaciones y Materiales Informativos", "Las cotizaciones, el contenido del sitio, las recomendaciones y los materiales informativos se proporcionan para evaluación general del negocio. No garantizan rankings, leads, ventas, ingresos ni resultados específicos."],
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
  const ogImage = meta.ogImage || (lang === "es" ? OG_IMAGE_ES : OG_IMAGE_EN);
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
    // Approved hero (fictional restaurant "El Sabor Latino", no logo baked in).
    // Both languages are natively 1672x941 — width/height here must stay in
    // sync with the actual files for 0 CLS. The originals live in the owner's
    // Drive; scripts/optimize-service-images.js hero writes the derivatives.
    en: { base: "blynx-hero-restaurant-en", width: 1672, height: 941 },
    es: { base: "blynx-hero-restaurant-es", width: 1672, height: 941 },
    alt: {
      en: "Illustrative example with a fictional restaurant, El Sabor Latino: digital systems that help a business grow. A Google profile on a phone, a website with a Book Now button, a new booking with request, CRM and follow-up, and AI-made food images and video, shown as digital presence, automation and AI content.",
      es: "Ejemplo ilustrativo con un restaurante ficticio, El Sabor Latino: sistemas digitales que hacen crecer un negocio. Un perfil de Google en un teléfono, un sitio web con un botón Reservar, una nueva reserva con solicitud, CRM y seguimiento, e imágenes y video de comida creados con IA, presentados como presencia digital, automatización y contenido con IA."
    },
    enlarge: { en: "View larger image", es: "Ver imagen ampliada" },
    // Phones (<= 480px) get their own vertical version of the hero (9:16,
    // 941x1672, one approved file per language) instead of the wide image.
    // It already carries the headline, the three pillars and the illustrative
    // notice, so nothing is repeated around it on phones. Derivatives come from
    // scripts/optimize-service-images.js hero (blynx-hero-mobile-*).
    mobile: {
      maxWidth: 480,
      en: { base: "blynx-hero-mobile-en" },
      es: { base: "blynx-hero-mobile-es" },
      width: 941,
      height: 1672,
      fallbackWidth: 800
    }
  }
};

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
  const mobile = entry.mobile;
  const mobileSources = mobile
    ? (() => {
        const mBase = `/assets/images/${mobile[lang].base}`;
        const mWidths = widthsForNative(mobile.width);
        const mSrcset = (ext) => mWidths.map((w) => `${mBase}-${w}.${ext} ${w}w`).join(", ");
        const media = `(max-width: ${mobile.maxWidth}px)`;
        return `<source media="${media}" type="image/avif" srcset="${mSrcset("avif")}" sizes="100vw">
                <source media="${media}" type="image/webp" srcset="${mSrcset("webp")}" sizes="100vw">
                <source media="${media}" srcset="${mBase}-${mobile.fallbackWidth}-fallback.png">
                `;
      })()
    : "";
  const picture = `<picture>
                ${mobileSources}<source type="image/avif" srcset="${srcset("avif")}" sizes="${sizes}">
                <source type="image/webp" srcset="${srcset("webp")}" sizes="${sizes}">
                <img src="${base}-1200-fallback.png" width="${variant.width}" height="${variant.height}" alt="${escapeAttr(entry.alt[lang])}" loading="${priority ? "eager" : "lazy"}" decoding="async"${priority ? ' fetchpriority="high"' : ""}>
              </picture>`;
  // Images that carry small baked-in text can be opened full size (native webp,
  // pinch-zoomable on phones) from a plain link around the picture.
  // When the picture swaps to a vertical phone version, the link carries that
  // file in data-mobile-href; assets/site.js points the link at it on phones so
  // a tap enlarges the vertical image (never the wide one).
  const mobileHref = mobile ? ` data-mobile-href="/assets/images/${mobile[lang].base}-${mobile.width}.webp" data-mobile-max="${mobile.maxWidth}"` : "";
  const content =
    entry.enlarge && entry.enlarge[lang]
      ? `<a class="product-visual-link" href="${base}-${variant.width}.webp"${mobileHref} target="_blank" rel="noopener" aria-label="${escapeAttr(entry.enlarge[lang])}">
              ${picture}
              </a>`
      : picture;
  return `
            <div class="product-visual${className ? " " + className : ""}">
              ${content}
            </div>`;
}

function money(amount) {
  return `$${Number(amount).toLocaleString("en-US")}`;
}

// Old section ids (from the previous three-system structure) stay in the page as
// invisible anchors so any saved/shared link to /services#<old-id> still lands on
// the closest matching service instead of the top of the page.
function legacyAnchors(service) {
  return (service.legacyIds || []).map((id) => `<span id="${id}" class="legacy-anchor" aria-hidden="true"></span>`).join("");
}

// Approved commercial images: one per service and language. Each one
// illustrates the service with a fictional business (Riverstone Cleaning Co.)
// and is captioned on the page as an illustrative example, never as a real
// client or a verified result. EN and ES are separate files chosen from the
// page language at build time, so an English image can never appear on a
// Spanish page (or the reverse). The originals live in the owner's Drive;
// scripts/optimize-service-images.js writes the AVIF/WebP/PNG derivatives.
// All six are natively 1448x1086, so width/height here must match the files.
const SERVICE_IMAGES = {
  width: 1448,
  height: 1086,
  items: {
    "blynx-presence": {
      base: { en: "blynx-service-presence-en", es: "blynx-service-presence-es" },
      alt: {
        en: "BLYNX Presence shown with a fictional cleaning company, Riverstone Cleaning Co.: a professional website on a laptop, its Google Business Profile on a phone, and a quote request form.",
        es: "BLYNX Presence mostrado con una empresa de limpieza ficticia, Riverstone Cleaning Co.: un sitio web profesional en una laptop, su Perfil de Empresa de Google en un teléfono y un formulario para solicitar un presupuesto."
      }
    },
    "blynx-complete": {
      base: { en: "blynx-service-complete-en", es: "blynx-service-complete-es" },
      alt: {
        en: "BLYNX Complete shown with a fictional cleaning company, Riverstone Cleaning Co.: a quote request website, a list of customer requests with their status on a phone, and a panel of follow-up reminders.",
        es: "BLYNX Complete mostrado con una empresa de limpieza ficticia, Riverstone Cleaning Co.: un sitio web para solicitar cotizaciones, una lista de solicitudes de clientes con su estado en un teléfono y un panel de recordatorios de seguimiento."
      }
    },
    "blynx-content": {
      base: { en: "blynx-service-content-en", es: "blynx-service-content-es" },
      alt: {
        en: "BLYNX Content shown with a fictional cleaning company, Riverstone Cleaning Co.: a monthly content calendar on a laptop, a social media profile on a phone, and cards for 12 branded images and 6 short videos.",
        es: "BLYNX Content mostrado con una empresa de limpieza ficticia, Riverstone Cleaning Co.: un calendario mensual de contenido en una laptop, un perfil de redes sociales en un teléfono y tarjetas con 12 imágenes de marca y 6 videos cortos."
      }
    }
  },
  caption: {
    en: "Illustrative example with a fictional business (Riverstone Cleaning Co.). Not a real client or a verified result. Click or tap to enlarge.",
    es: "Ejemplo ilustrativo con una empresa ficticia (Riverstone Cleaning Co.). No es un cliente real ni un resultado comprobado. Haz clic o toca para ampliar."
  },
  enlarge: { en: "View larger image", es: "Ver imagen ampliada" }
};

function serviceImage(service, lang, sizes = "(max-width: 760px) 100vw, (max-width: 1120px) 50vw, 380px") {
  const entry = SERVICE_IMAGES.items[service.id];
  if (!entry) throw new Error("No approved image for service " + service.id);
  const base = `/assets/images/${entry.base[lang]}`;
  const widths = widthsForNative(SERVICE_IMAGES.width);
  const srcset = (ext) => widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(", ");
  const alt = escapeAttr(entry.alt[lang]);
  return `
              <figure class="service-figure">
                <a class="service-figure-link" href="${base}-${SERVICE_IMAGES.width}.webp" target="_blank" rel="noopener" aria-label="${escapeAttr(SERVICE_IMAGES.enlarge[lang])}: ${escapeAttr(service.name)}">
                  <picture>
                    <source type="image/avif" srcset="${srcset("avif")}" sizes="${sizes}">
                    <source type="image/webp" srcset="${srcset("webp")}" sizes="${sizes}">
                    <img src="${base}-1200-fallback.png" width="${SERVICE_IMAGES.width}" height="${SERVICE_IMAGES.height}" alt="${alt}" loading="lazy" decoding="async">
                  </picture>
                </a>
                <figcaption>${SERVICE_IMAGES.caption[lang]}</figcaption>
              </figure>`;
}

function servicePriceHtml(offer, service) {
  if (service.kind === "subscription") {
    return `<span class="system-price">${service.subscriptionLabel}</span>`;
  }
  return `<span class="system-price">${offer.priceLabel} ${money(service.startingPrice)}</span><span class="system-price-unit">${service.priceUnit}</span>`;
}

function planListHtml(offer, service) {
  return `<ul class="plan-list">${service.plans
    .map(
      (plan) =>
        `<li><span class="plan-name">${plan.name}</span><span class="plan-summary">${plan.summary}</span><span class="plan-price">${money(plan.price)}<small>${service.perMonth}</small></span></li>`
    )
    .join("")}</ul>`;
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
          </div>
          <div class="system-offer-grid system-offer-grid-overview">
            ${offer.services
              .map(
                (service) => `
            <article class="system-offer-card" id="${service.id}">
              ${legacyAnchors(service)}
              <div class="system-offer-topline"><span class="service-number">${service.number}</span></div>
              <h3>${service.name}</h3>
              <p class="service-headline">${service.headline}</p>
              ${serviceImage(service, lang)}
              <p class="service-description">${service.description}</p>
              <div class="system-included">
                ${
                  service.kind === "subscription"
                    ? `<h4 class="system-included-title">${offer.plansTitle}</h4>
                ${planListHtml(offer, service)}
                <p class="plan-note">${service.publishingLine}</p>`
                    : `<h4 class="system-included-title">${offer.includedTitle}</h4>
                ${offerList(service.highlights)}`
                }
              </div>
              <p class="service-bestfor"><strong>${offer.bestForLabel}:</strong> ${service.bestFor}</p>
              <p class="system-price-line">${servicePriceHtml(offer, service)}${
                  service.kind === "setup" ? `<span class="system-delivery">${service.deliveryShort}</span><span class="system-delivery">${service.priceNote}</span>` : `<span class="system-delivery">${service.independentNote}</span>`
                }</p>
              <div class="system-card-actions">
                <a class="btn btn-primary" href="${localizedHref(lang, `/${service.ctaTarget}`)}">${service.cardCta}</a>
                <a class="system-details-link" href="${pagePath(lang, "services")}#${service.id}">${offer.detailsLink}</a>
              </div>
            </article>`
              )
              .join("")}
          </div>
          <p class="service-fine systems-footnote">${offer.externalCostsNote}</p>
        </div>
      </section>`;
}

function serviceDetailCard(lang, offer, service) {
  const isSubscription = service.kind === "subscription";
  return `
            <article class="system-offer-card system-offer-card-full" id="${service.id}">
              ${legacyAnchors(service)}
              <div class="system-offer-topline"><span class="service-number">${service.number}</span></div>
              <h3>${service.name}</h3>
              <p class="service-headline">${service.headline}</p>
              ${serviceImage(service, lang)}
              <p class="service-description">${service.description}</p>
              <p class="system-price-line">${servicePriceHtml(offer, service)}</p>
              ${service.priceNote ? `<p class="service-fine">${service.priceNote}</p>` : ""}
              <p class="service-bestfor"><strong>${offer.bestForLabel}:</strong> ${service.bestFor}</p>
              ${
                isSubscription
                  ? `<div class="plan-stack">
                ${service.plans
                  .map(
                    (plan) => `
                <section class="plan-card">
                  <div class="plan-card-head">
                    <h4>${plan.name}</h4>
                    <span class="plan-card-price">${money(plan.price)}<small>${service.perMonth}</small></span>
                  </div>
                  ${offerList(plan.items)}
                </section>`
                  )
                  .join("")}
              </div>`
                  : `<section class="system-card-section">
                <h4>${offer.fullIncludedTitle}</h4>
                ${offerList(service.included)}
              </section>
              <section class="system-card-section">
                <h4>${offer.deliveryLabel}</h4>
                <p class="service-fine">${service.delivery}</p>
              </section>
              <section class="system-card-section service-care">
                <h4>${service.care.name}</h4>
                <p class="service-care-price">${service.care.pricePrefix || ""}${money(service.care.price)}${service.care.priceUnit}</p>
                <p class="service-fine">${service.care.description}</p>
              </section>`
              }
              <section class="system-card-section">
                ${offerList(service.notes, "exclusion-list")}
              </section>
              <div class="system-card-actions">
                <a class="btn btn-primary" href="${localizedHref(lang, `/${service.ctaTarget === "services#blynx-content" ? "contact" : service.ctaTarget}`)}">${service.cta}</a>
              </div>
            </article>`;
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
          </div>
          <div class="system-offer-grid">
            ${offer.services.map((service) => serviceDetailCard(lang, offer, service)).join("")}
          </div>
        </div>
      </section>`;
}

function publishingSection(lang) {
  const offer = commercialOffer[lang];
  const pub = offer.publishing;
  const content = offer.services.find((service) => service.kind === "subscription");
  return `
      <section class="section section-soft" id="publishing">
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">${pub.eyebrow}</p>
            <h2>${pub.name} <span class="text-gold">${pub.priceLead}${money(pub.price)}${pub.priceUnit}</span></h2>
            <p>${pub.summary}</p>
          </div>
          <div class="publishing-panel">
            <div class="publishing-col">
              <h3>${pub.includedTitle}</h3>
              ${offerList(pub.included)}
            </div>
            <div class="publishing-col">
              <h3>${pub.tableTitle}</h3>
              <div class="comparison-scroller">
                <table class="comparison-table publishing-table">
                  <thead>
                    <tr>${pub.tableHead.map((name) => `<th scope="col">${name}</th>`).join("")}</tr>
                  </thead>
                  <tbody>
                    ${content.plans
                      .map(
                        (plan) =>
                          `<tr><th scope="row">${plan.name}</th><td>${money(plan.price)}</td><td><strong>${money(plan.publishingPrice)}</strong></td></tr>`
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
              <details class="system-full-scope">
                <summary>${offer.publishingToggle}</summary>
                <section class="system-card-section">
                  <h4>${pub.limitsTitle}</h4>
                  ${offerList(pub.limits)}
                </section>
                <section class="system-card-section">
                  <h4>${pub.notIncludedTitle}</h4>
                  ${offerList(pub.notIncluded, "exclusion-list")}
                </section>
              </details>
            </div>
          </div>
        </div>
      </section>`;
}

// Approved commercial images for the three extra services, one per language.
// Each one is a fictional-business example and is captioned on the page as an
// illustrative example, never as a real client or a verified result. EN and ES
// are separate files picked from the page language at build time, so an English
// image can never appear on a Spanish page (or the reverse). The originals live
// in the owner's Drive; scripts/optimize-service-images.js extras writes the
// AVIF/WebP/PNG derivatives. width/height must match the source files.
const EXTRA_IMAGES = {
  "landing-page": {
    width: 1536,
    height: 1024,
    base: { en: "blynx-extra-landing-page-en", es: "blynx-extra-landing-page-es" },
    alt: {
      en: "BLYNX Landing Page extra service shown with a fictional cleaning company, Riverstone Cleaning Co.: a professional single-page website on a laptop with a quote request button, next to a list of what is included.",
      es: "Servicio extra Landing Page de BLYNX mostrado con una empresa de limpieza ficticia, Riverstone Cleaning Co.: un sitio web profesional de una sola página en una laptop con un botón para solicitar cotización, junto a una lista de lo que incluye."
    }
  },
  "google-business-profile": {
    width: 1536,
    height: 1024,
    base: { en: "blynx-extra-google-business-profile-en", es: "blynx-extra-google-business-profile-es" },
    alt: {
      en: "BLYNX Google Business Profile extra service shown with a fictional cleaning company, Riverstone Cleaning Co.: a sample Google Business Profile on a phone with photos, call, directions, website and share buttons, and business information.",
      es: "Servicio extra Perfil de Empresa de Google de BLYNX mostrado con una empresa de limpieza ficticia, Riverstone Cleaning Co.: un perfil de empresa de ejemplo en un teléfono con fotos, botones para llamar, cómo llegar, sitio web y compartir, e información del negocio."
    }
  },
  "custom-ai": {
    width: 1672,
    height: 941,
    base: { en: "blynx-extra-custom-ai-en", es: "blynx-extra-custom-ai-es" },
    alt: {
      en: "BLYNX Custom AI Solutions extra service shown with a fictional business, Riverstone Home Services: a customer request system with automated steps and connected tools on a laptop, and an AI assistant chat on a phone.",
      es: "Servicio extra Soluciones de IA a Medida de BLYNX mostrado con un negocio ficticio, Riverstone Home Services: un sistema de solicitudes de clientes con pasos automáticos y herramientas conectadas en una laptop, y un chat con asistente de IA en un teléfono."
    }
  }
};

const EXTRA_IMAGE_TEXT = {
  caption: {
    en: "Illustrative example with a fictional business. Not a real client or a verified result. Click or tap to enlarge.",
    es: "Ejemplo ilustrativo con un negocio ficticio. No es un cliente real ni un resultado comprobado. Haz clic o toca para ampliar."
  },
  enlarge: { en: "View larger image", es: "Ver imagen ampliada" }
};

function extraServiceImage(item, lang) {
  const entry = EXTRA_IMAGES[item.imageKey];
  if (!entry) throw new Error("No approved image for extra service " + item.imageKey);
  const base = `/assets/images/${entry.base[lang]}`;
  const widths = widthsForNative(entry.width);
  const srcset = (ext) => widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(", ");
  const sizes = "(max-width: 900px) 100vw, 700px";
  return `
              <figure class="service-figure extra-figure">
                <a class="service-figure-link" href="${base}-${entry.width}.webp" target="_blank" rel="noopener" aria-label="${escapeAttr(EXTRA_IMAGE_TEXT.enlarge[lang])}: ${escapeAttr(item.name)}">
                  <picture>
                    <source type="image/avif" srcset="${srcset("avif")}" sizes="${sizes}">
                    <source type="image/webp" srcset="${srcset("webp")}" sizes="${sizes}">
                    <img src="${base}-1200-fallback.png" width="${entry.width}" height="${entry.height}" alt="${escapeAttr(entry.alt[lang])}" loading="lazy" decoding="async">
                  </picture>
                </a>
                <figcaption>${EXTRA_IMAGE_TEXT.caption[lang]}</figcaption>
              </figure>`;
}

function secondaryServicesSection(lang, soft = true) {
  const s = commercialOffer[lang].secondary;
  return `
      <section class="section${soft ? " section-soft" : ""}" id="more-services">
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">${s.eyebrow}</p>
            <h2>${s.title}</h2>
          </div>
          <div class="monthly-grid secondary-grid">
            ${s.items
              .map(
                (item) => `
            <article class="monthly-card monthly-card-extra">
              <h3>${item.name}</h3>${extraServiceImage(item, lang)}
              <p class="monthly-price secondary-price">${item.priceText}</p>
              <p class="monthly-note">${item.description}</p>
              <p class="monthly-note secondary-meta">${item.meta}</p>
            </article>`
              )
              .join("")}
          </div>
          <p class="compare-link-line"><a class="btn btn-secondary" href="${pagePath(lang, s.ctaTarget)}">${s.cta}</a></p>
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
              <span class="impl-milestone">${step.label}</span>
              <h3>${step.title}</h3>
              <p class="impl-copy">${step.copy}</p>
            </div>
            ${index < plan.steps.length - 1 ? `<span class="impl-arrow">${icon("arrowRight")}</span>` : ""}`
              )
              .join("")}
          </div>
          <div class="timeline-conditions">
            <h3>${plan.conditionsTitle}</h3>
            ${offerList(plan.conditions)}
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
    headline: "From a Google search to an organized customer request.",
    supporting:
      "A customer finds your business and sends a request. With BLYNX Complete, they receive an automatic response and your team follows up from one place.",
    stageLabels: ["They find you", "You capture the opportunity", "You respond and follow up"],
    exampleNote: "Example business shown for illustration only.",
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
    headline: "De una búsqueda en Google a una solicitud de cliente organizada.",
    supporting:
      "Un cliente encuentra tu negocio y envía una solicitud. Con BLYNX Complete, recibe una respuesta automática y tu equipo da seguimiento desde un solo lugar.",
    stageLabels: ["Te encuentran", "Captas la oportunidad", "Respondes y das seguimiento"],
    exampleNote: "Negocio de ejemplo mostrado solo a modo de ilustración.",
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
                          `<li class="${index === 0 ? "is-active" : ""}"><span class="flow-result-pin" aria-hidden="true"></span><span class="flow-result-name">${name}</span></li>`
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
          <p class="flow-example-note">${c.exampleNote}</p>
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
    badgeLabel: { en: "Founder-Owned Case Study", es: "Caso de Estudio del Fundador" },
    image: "/public/images/projects/klinner.jpg",
    imageAlt: {
      en: "Homepage of the Klinner Cleaning & Maintenance website showing its hero section and main navigation",
      es: "Página de inicio del sitio web de Klinner Cleaning & Maintenance mostrando su sección principal y su navegación"
    },
    industry: { en: "Cleaning & Property Services", es: "Limpieza y servicios para propiedades" },
    summary: {
      en: "Klinner Cleaning & Maintenance is an independently operated Nashville service business owned by BLYNX’s founder. Its website demonstrates professional service presentation, responsive design, and a clear customer quote pathway.",
      es: "Klinner Cleaning & Maintenance es un negocio independiente de Nashville perteneciente al fundador de BLYNX. Su sitio web demuestra una presentación profesional de servicios, diseño adaptable y una forma clara de solicitar cotizaciones."
    },
    business: {
      en: "A cleaning and property-services business based in Nashville, Tennessee. It is independently operated and owned by BLYNX’s founder; it is not an external client of BLYNX.",
      es: "Un negocio de limpieza y servicios para propiedades con sede en Nashville, Tennessee. Es independiente y pertenece al fundador de BLYNX; no es un cliente externo de BLYNX."
    },
    need: {
      en: "As a founder-owned service business, it needed a professional way to present its services and make requesting a quote simple on any device.",
      es: "Como negocio de servicios del fundador, necesitaba una forma profesional de presentar sus servicios y facilitar la solicitud de cotizaciones desde cualquier dispositivo."
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
    badgeLabel: { en: "Founder-Built Project", es: "Proyecto del Fundador" },
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
      en: "An independent digital fitness and community platform developed by BLYNX’s founder, built to guide members through training, habits and personal progress in one connected experience.",
      es: "Una plataforma digital independiente de fitness y comunidad desarrollada por el fundador de BLYNX, creada para guiar a sus miembros a través del entrenamiento, los hábitos y su progreso personal en una experiencia conectada."
    },
    business: {
      en: "A fitness and community product developed by BLYNX’s founder, independent from BLYNX and not an external client.",
      es: "Un producto de fitness y comunidad desarrollado por el fundador de BLYNX, independiente de BLYNX y no un cliente externo."
    },
    need: {
      en: "The platform was designed so members can follow guided training, build habits, and track personal progress from their phone.",
      es: "La plataforma fue diseñada para que los miembros puedan seguir entrenamiento guiado, construir hábitos y monitorear su progreso personal desde el teléfono."
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
      en: "A concept landing page for a fitness transformation brand — built to turn attention into applications with a bold offer, a clear program, and an application flow. Fictional brand, illustrative content.",
      es: "Una landing de concepto para una marca de transformación fitness — creada para convertir la atención en aplicaciones con una oferta potente, un programa claro y un flujo de aplicación. Marca ficticia, contenido ilustrativo."
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
        "Application-focused hero",
        "Program in 4 pillars",
        "12-week timeline",
        "Program tiers",
        "Application form",
        "Bilingual (EN/ES)",
        "Mobile optimized"
      ],
      es: [
        "Hero enfocado en aplicaciones",
        "Programa en 4 pilares",
        "Línea de tiempo de 12 semanas",
        "Niveles de programa",
        "Formulario de aplicación",
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
                <span class="project-badge${isDemo ? " is-demo" : ""}">${isDemo ? p.demoBadge : project.badgeLabel ? project.badgeLabel[lang] : p.realBadge}</span>
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
  const reals = portfolioProjects.filter((project) => project.type === "real");
  const p = t.projectsPage;
  const body = `
    <main id="main">
      <section class="hero hero-home" id="home">
        <div class="container">
          <div class="hero-grid hero-grid-solo">
            ${productImage("hero", lang, { priority: true, sizes: "(max-width: 1024px) 100vw, 1180px", className: "product-visual-hero" })}
            <p class="visual-caption">${h.heroCaption}</p>
            <div class="hero-copy">
              <h1>${h.headline}</h1>
              <div class="hero-supporting-copy">
                ${h.subtitle.map((paragraph) => `<p>${paragraph}</p>`).join("")}
              </div>
              <div class="hero-actions hero-actions-stacked">
                <a class="btn btn-primary btn-full" href="#systems">${t.cta.services} <span aria-hidden="true">&rarr;</span></a>
                <a class="btn btn-secondary btn-full" href="${pagePath(lang, "contact")}">${t.cta.findSystem} <span aria-hidden="true">&rarr;</span></a>
              </div>
              <div class="stage-banner" hidden data-stage-banner data-existing-message="${h.stageBanner.existing}" data-zero-message="${h.stageBanner.zero}"></div>
            </div>
          </div>
        </div>
      </section>

      ${systemsOverviewSection(lang)}

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

      ${secondaryServicesSection(lang)}

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
              <a class="btn btn-secondary" href="#systems">${t.cta.services}</a>
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
          <div class="audit-flow" aria-label="${p.flowTitle}">
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
            <a class="btn btn-secondary" href="#stage-process">${p.processTitle}</a>
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

      ${publishingSection(lang)}

      ${secondaryServicesSection(lang, false)}

      ${faqSection(lang)}

      <section class="section section-soft">
        <div class="container">
          <div class="cta-panel">
            <h2>${p.ctaTitle}</h2>
            <p>${p.ctaSubtitle}</p>
            <div class="cta-actions">
              <a class="btn btn-primary" href="${pagePath(lang, "contact")}">${t.cta.findSystem}</a>
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
              <a class="btn btn-primary" href="${pagePath(lang, "contact")}">${t.cta.findSystem}</a>
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
              <p><a class="btn btn-secondary" href="${pagePath(lang, "free-audit")}" data-analytics-event="free_audit_cta_click">${p.auditButton}</a></p>
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
    <meta property="og:image" content="${lang === "es" ? OG_IMAGE_ES : OG_IMAGE_EN}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${p.title}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${p.title}">
    <meta name="twitter:description" content="${p.description}">
    <meta name="twitter:image" content="${lang === "es" ? OG_IMAGE_ES : OG_IMAGE_EN}">
    <meta name="twitter:image:alt" content="${p.title}">
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
    <title>BLYNX Systems | Websites, Follow-Up & AI Content for Local Businesses</title>
    <meta name="description" content="Professional websites, automated customer follow-ups, and AI-powered content for local businesses.">
    <link rel="canonical" href="${SITE_URL}/">
    <link rel="alternate" hreflang="en" href="${SITE_URL}/en">
    <link rel="alternate" hreflang="es" href="${SITE_URL}/es">
    <link rel="alternate" hreflang="x-default" href="${SITE_URL}/">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${BUSINESS.displayName}">
    <meta property="og:title" content="${BUSINESS.displayName}">
    <meta property="og:description" content="Professional websites, automated customer follow-ups, and AI-powered content for local businesses.">
    <meta property="og:url" content="${SITE_URL}/">
    <meta property="og:image" content="${OG_IMAGE_EN}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="BLYNX Systems: Your Business. Stronger Online. Smarter with AI. BLYNX Presence, BLYNX Complete and BLYNX Content.">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${BUSINESS.displayName}">
    <meta name="twitter:description" content="Professional websites, automated customer follow-ups, and AI-powered content for local businesses.">
    <meta name="twitter:image" content="${OG_IMAGE_EN}">
    <meta name="twitter:image:alt" content="BLYNX Systems: Your Business. Stronger Online. Smarter with AI. BLYNX Presence, BLYNX Complete and BLYNX Content.">
    ${structuredData("en", "BLYNX Systems | Websites, Follow-Up & AI Content for Local Businesses", "Professional websites, automated customer follow-ups, and AI-powered content for local businesses.", `${SITE_URL}/`)}
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
        <h1>Digital Solutions for Local Businesses</h1>
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
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${meta.title}">${articleOgTags}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${meta.title}">
    <meta name="twitter:description" content="${meta.description}">
    <meta name="twitter:image" content="${ogImage}">
    <meta name="twitter:image:alt" content="${meta.title}">
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
              <a class="btn btn-primary" href="${pagePath(lang, "contact")}" data-blog-cta>${b.ctaButton}</a>
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
            <a class="btn btn-primary" href="${pagePath(lang, "contact")}" data-blog-cta>${b.ctaButton}</a>
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
