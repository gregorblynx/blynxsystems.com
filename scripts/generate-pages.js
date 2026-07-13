const fs = require("fs");
const path = require("path");
const { loadArticles, formatDate, CATEGORIES } = require("./blog");

const root = path.resolve(__dirname, "..");

// Spanish articles can be added later under content/blog/es/ — the blog nav link,
// pages, and sitemap entries for a language only appear once articles exist for it.
const blogArticles = {
  en: loadArticles("en"),
  es: loadArticles("es")
};

const SITE_URL = "https://www.blynxsystems.com";
const OG_IMAGE = `${SITE_URL}/assets/og-image.jpg`;
const LEGAL_EFFECTIVE_DATE = "July 9, 2026";
const BUSINESS = {
  legalName: "BLYNX AIMA AGENCY",
  displayName: "BLYNX - AIMA",
  shortName: "BLYNX",
  email: "hello@blynxsystems.com",
  phone: "6452469219",
  location: "Nashville, Tennessee",
  city: "Nashville",
  region: "TN",
  country: "US",
  serviceArea: "United States",
  instagramHandle: "blynx.ai",
  instagramUrl: "https://www.instagram.com/blynx.ai/"
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
      ? "BLYNX ayuda a negocios locales de servicios a aparecer en Google, captar más leads calificados y hacer seguimiento más rápido."
      : "BLYNX helps local service businesses get found online, capture more qualified leads, and follow up faster.";
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
    titleSuffix: "BLYNX - AIMA",
    skip: "Skip to content",
    brandAria: "BLYNX home",
    navAria: "Primary navigation",
    openMenu: "Open menu",
    switchAria: "Language switcher",
    footer: "Built for local business growth.",
    nav: {
      home: "Home",
      services: "System",
      process: "Process",
      results: "Results",
      about: "About",
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
      audit: "Get a Free Audit",
      auditLong: "Get Your Free Audit",
      auditShort: "Get a Free Audit",
      services: "See How It Works",
      contact: "Contact BLYNX"
    },
    home: {
      title: "BLYNX - AIMA | Local Lead Systems for Service Businesses",
      description: "BLYNX helps local service businesses get found online, capture more qualified leads, follow up faster, and stop losing sales opportunities.",
      eyebrow: "Local Lead System for Service Businesses",
      headline: 'Local Lead Systems for Service Businesses. <span class="text-gold">Stop Losing Sales Opportunities.</span>',
      subtitle: "We help local businesses get found online, capture more qualified leads, follow up faster, and keep better control of every opportunity.",
      trust: ["Get Found", "Capture Leads", "Follow Up Faster", "Track Opportunities"],
      visual: {
        aria: "Landing page, Google Business Profile, lead capture, and follow-up preview",
        profile: "Local Business Profile",
        open: "Open today | Nashville, TN",
        rating: "4.8 rating | 126 reviews",
        call: "Call Now",
        demoLabel: "Example Lead Flow",
        leadLabel: "Lead System",
        leadTitle: "New Lead Captured",
        leadDetail: "Smart form submitted for a service quote.",
        automationLabel: "Follow-Up",
        automationTitle: "Automation Started",
        steps: ["Instant confirmation", "Owner notification", "Lead organized"]
      },
      problemEyebrow: "The problem",
      problemTitle: "Most Local Businesses Lose Leads Without Realizing It",
      problemCopy: "People visit your website, Google profile, or landing page — but if there is no clear system to capture, organize, and follow up with them, those opportunities disappear.",
      servicesEyebrow: "The system",
      servicesTitle: "The System We Build",
      servicesSubtitle: "A simple lead flow built to help service businesses get found, capture leads, track opportunities, follow up faster, and build trust.",
      pathsEyebrow: "Digital Foundation + Lead System",
      pathsTitle: "Two Ways We Can Help",
      pathsSubtitle: "Whether you already have an online presence or you are starting from zero, BLYNX builds a simple lead system to help your business get found, capture opportunities, and follow up faster.",
      pathsSupport: "Not sure where your business stands? Start with a free audit and we\u2019ll show you the clearest next step.",
      stageBanner: {
        existing: "You already have a digital presence. We\u2019ll help you improve visibility, capture more qualified leads, and follow up faster.",
        zero: "Starting from zero? We\u2019ll help you build the digital foundation needed to get found, receive opportunities, and follow up professionally."
      },
      auditEyebrow: "Free audit",
      auditTitle: "How the Free Audit Works",
      auditSubtitle: "AI-assisted for speed. Human-reviewed for quality.",
      processEyebrow: "Process",
      processTitle: "How the Local Lead System Comes Together",
      resultsEyebrow: "Results",
      resultsTitle: "Built to Stop Missed Sales Opportunities",
      aboutEyebrow: "About BLYNX",
      aboutTitle: "Built for Local Service Businesses",
      aboutCopy: "BLYNX helps local businesses build practical lead systems that are simple, trackable, and focused on real opportunities — not complicated marketing services.",
      aboutBullets: [
        "Based in Nashville, Tennessee.",
        "Serving local businesses across the United States.",
        "English and Spanish support available."
      ],
      statItems: [
        ["Get Found", "Google visibility, reviews, local trust signals, and clearer online presence."],
        ["Capture", "A focused landing page, smart forms, and organized lead collection."],
        ["Follow Up", "Simple lead organization and reminders that keep opportunities moving."]
      ],
      finalTitle: "Ready to Stop Losing Sales Opportunities?",
      finalSubtitle: "Start with a free audit and see where your business may be missing leads, trust, and follow-up opportunities."
    },
    auditPage: {
      title: "Get Your Free Lead System Audit | BLYNX",
      description: "Request a free lead system audit from BLYNX for your local business.",
      eyebrow: "Free audit",
      h1: "Get Your Free Lead System Audit",
      subtitle: "See where your business may be losing opportunities and discover how to capture, organize, and follow up with more qualified leads.",
      trust: "AI-powered for speed. Human-reviewed for quality.",
      introTitle: "A simple snapshot of your current lead flow.",
      introCopy: "This free audit gives you a simple snapshot of your current lead flow. We review your website or landing page, Google presence, lead capture process, reviews, and follow-up opportunities.",
      fitLine: "This audit works whether you already have a digital presence or you are starting from zero.",
      bullets: [
        "Website or landing page opportunities.",
        "Google presence, reviews, and local trust signals.",
        "Lead capture process and follow-up opportunities."
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
      title: "Local Lead System | BLYNX - AIMA",
      description: "A simple local lead system that helps service businesses get found, capture qualified leads, organize every opportunity, and follow up faster.",
      eyebrow: "Local Lead System",
      h1: "One practical lead flow for local service businesses.",
      subtitle: "BLYNX builds the pieces that help a local business turn online interest into organized opportunities: visibility, trust, capture, follow-up, reviews, and clear reporting.",
      optionalTitle: "Optional Add-On",
      optionalCopy: "Social media support can be added only when it supports local trust and follow-up. It is not the main BLYNX service.",
      ctaTitle: "Start with the free audit.",
      ctaSubtitle: "See where your current lead flow is losing opportunities before deciding what to improve."
    },
    aboutPage: {
      title: "About | BLYNX - AIMA",
      description: "BLYNX helps local service businesses get found, capture qualified leads, organize every opportunity, and follow up faster.",
      eyebrow: "About",
      h1: "Built for service businesses that need a clearer lead flow.",
      subtitle: "BLYNX helps local businesses get found online, capture leads, and follow up faster without adding complicated tools to their day.",
      cards: [
        ["Who BLYNX Helps", "BLYNX serves local businesses across the United States that rely on calls, quote requests, bookings, inquiries, and customer trust to grow."],
        ["What BLYNX Builds", "We build a simple local lead system: get found, capture the lead, organize the opportunity, and follow up faster."],
        ["Why It Matters", "Local customers compare businesses quickly. A clearer lead flow helps reduce missed calls, forgotten forms, and lost sales opportunities."]
      ],
      positionEyebrow: "Positioning",
      positionTitle: "One clear outcome: better lead flow.",
      positionCopy: "BLYNX is based in Nashville, Tennessee and supports local service businesses nationwide. The focus is practical growth infrastructure: clearer local visibility, easier lead capture, better organization, and faster follow-up.",
      bullets: [
        "Local visibility improvements that help customers find the business.",
        "Focused landing pages that help visitors take the next step.",
        "Lead organization that keeps every opportunity in one clear flow.",
        "Simple follow-up support that helps owners respond faster."
      ],
      stats: [
        ["Nashville", "Based in Tennessee and serving local businesses across the United States."],
        ["Practical", "Clear systems for owners who want outcomes, not technical confusion."],
        ["Focused", "Not a social media-first agency. Social content is available only as an optional add-on."]
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
      title: "Contact | BLYNX - AIMA",
      description: "Contact BLYNX AIMA AGENCY for local lead flow, lead capture, and faster follow-up support.",
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
        "Local lead system",
        "Google Business Profile",
        "Focused landing page",
        "Lead capture",
        "Follow-up",
        "Review strategy",
        "Reporting",
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
      title: "Resources | BLYNX - AIMA",
      description: "Practical resources for local lead flow, lead capture, and follow-up.",
      eyebrow: "Resources",
      h1: "Practical growth resources for local business owners.",
      subtitle: "Use these starting points to think through how customers find you, contact you, and receive follow-up before your free audit.",
      cards: [
        ["Local Lead Flow Checklist", "Review the basics that help customers find your business, trust it, and take the next step.", "Request a free audit", "/free-audit"],
        ["Lead Capture Readiness", "Check whether your landing page and contact flow make it easy for qualified prospects to reach you.", "Explore the lead system", "/services"],
        ["Follow-Up Basics", "Understand how simple confirmations, reminders, and organization reduce missed opportunities.", "Ask a question", "/contact"]
      ]
    }
  },
  es: {
    code: "es",
    htmlLang: "es",
    titleSuffix: "BLYNX - AIMA",
    skip: "Saltar al contenido",
    brandAria: "Inicio de BLYNX",
    navAria: "Navegación principal",
    openMenu: "Abrir menú",
    switchAria: "Selector de idioma",
    footer: "Creado para el crecimiento de negocios locales.",
    nav: {
      home: "Inicio",
      services: "Sistema",
      process: "Proceso",
      results: "Resultados",
      about: "Nosotros",
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
      audit: "Solicitar Auditoría Gratis",
      auditLong: "Solicitar tu Auditoría Gratis",
      auditShort: "Auditoría Gratis",
      services: "Ver Cómo Funciona",
      contact: "Contactar a BLYNX"
    },
    home: {
      title: "BLYNX - AIMA | Sistemas de Captación para Negocios Locales",
      description: "BLYNX ayuda a negocios locales a ser encontrados en internet, capturar más oportunidades, dar seguimiento más rápido y no perder posibles clientes.",
      eyebrow: "Sistemas de Captación para Negocios Locales",
      headline: 'Sistemas de Captación para Negocios Locales. <span class="text-gold">No Pierdas Posibles Clientes.</span>',
      subtitle: "Ayudamos a negocios locales a ser encontrados en internet, capturar más oportunidades, dar seguimiento más rápido y no perder posibles clientes.",
      trust: ["Ser Encontrado", "Capturar Oportunidades", "Dar Seguimiento Rápido", "Organizar Leads"],
      visual: {
        aria: "Vista previa de landing page, Google Business Profile, captación y seguimiento",
        profile: "Perfil de Negocio Local",
        open: "Abierto hoy | Nashville, TN",
        rating: "4.8 calificación | 126 reseñas",
        call: "Llamar Ahora",
        demoLabel: "Ejemplo de Flujo de Captación",
        leadLabel: "Sistema de Captación",
        leadTitle: "Nueva Oportunidad Capturada",
        leadDetail: "Formulario enviado para solicitar una cotización.",
        automationLabel: "Seguimiento",
        automationTitle: "Seguimiento Iniciado",
        steps: ["Confirmación inmediata", "Aviso al negocio", "Lead organizado"]
      },
      problemEyebrow: "El problema",
      problemTitle: "Muchos Negocios Locales Pierden Oportunidades Sin Darse Cuenta",
      problemCopy: "Las personas visitan tu sitio, perfil de Google o landing page, pero si no hay un sistema claro para capturar, organizar y dar seguimiento, esas oportunidades desaparecen.",
      servicesEyebrow: "El sistema",
      servicesTitle: "El Sistema que Construimos",
      servicesSubtitle: "Un flujo simple de captación creado para ayudar a negocios locales a ser encontrados, capturar oportunidades, organizar leads, dar seguimiento rápido y generar confianza.",
      pathsEyebrow: "Base Digital + Sistema de Captación",
      pathsTitle: "Dos Formas en que Podemos Ayudarte",
      pathsSubtitle: "Ya sea que tengas presencia en internet o estés empezando desde cero, BLYNX construye un sistema simple de captación para ayudar a tu negocio a ser encontrado, capturar oportunidades y dar seguimiento más rápido.",
      pathsSupport: "¿No estás seguro en qué punto está tu negocio? Empieza con una auditoría gratis y te mostraremos el siguiente paso más claro.",
      stageBanner: {
        existing: "Ya tienes presencia digital. Te ayudamos a mejorar visibilidad, capturar más oportunidades calificadas y dar seguimiento rápido.",
        zero: "¿Estás empezando desde cero? Te ayudamos a construir la base digital necesaria para ser encontrado, recibir oportunidades y dar seguimiento profesional."
      },
      auditEyebrow: "Auditoría gratis",
      auditTitle: "Cómo Funciona la Auditoría Gratis",
      auditSubtitle: "Apoyada por IA para mayor rapidez. Revisada por BLYNX para mayor calidad.",
      processEyebrow: "Proceso",
      processTitle: "Cómo se Construye tu Sistema de Captación",
      resultsEyebrow: "Resultados",
      resultsTitle: "Creado para Reducir Oportunidades Perdidas",
      aboutEyebrow: "Sobre BLYNX",
      aboutTitle: "Creado para Negocios Locales",
      aboutCopy: "BLYNX ayuda a negocios locales a crear sistemas prácticos de captación que son simples, medibles y enfocados en oportunidades reales, no en servicios de marketing complicados.",
      aboutBullets: [
        "Basados en Nashville, Tennessee.",
        "Servimos a negocios locales en todo Estados Unidos.",
        "Soporte disponible en inglés y español."
      ],
      statItems: [
        ["Ser Encontrado", "Visibilidad en Google, reseñas, confianza local y presencia en internet más clara."],
        ["Capturar", "Landing page enfocada, formularios simples y captación organizada."],
        ["Seguimiento", "Organización simple de leads y recordatorios para mover cada oportunidad."]
      ],
      finalTitle: "¿Listo para Dejar de Perder Posibles Clientes?",
      finalSubtitle: "Empieza con una auditoría gratis y descubre dónde tu negocio puede estar perdiendo oportunidades, confianza y seguimiento."
    },
    auditPage: {
      title: "Solicitar Auditoría Digital Gratis | BLYNX",
      description: "Solicita una auditoría gratis del flujo de captación de tu negocio local.",
      eyebrow: "Auditoría gratis",
      h1: "Solicita tu Auditoría Gratis del Sistema de Captación",
      subtitle: "Descubre dónde tu negocio puede estar perdiendo oportunidades y cómo capturar, organizar y dar seguimiento a más posibles clientes.",
      trust: "Impulsada por IA para mayor rapidez. Revisada por BLYNX para mayor calidad.",
      introTitle: "Una revisión simple de tu flujo actual de captación.",
      introCopy: "Esta auditoría gratis te da una revisión simple de tu flujo actual de captación. Revisamos tu sitio o landing page, presencia en Google, proceso para recibir leads, reseñas y oportunidades de seguimiento.",
      fitLine: "Esta auditoría funciona tanto si ya tienes presencia digital como si estás empezando desde cero.",
      bullets: [
        "Oportunidades en tu sitio o landing page.",
        "Presencia en Google, reseñas y señales de confianza.",
        "Proceso para recibir leads y oportunidades de seguimiento."
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
      title: "Sistema de Captación | BLYNX - AIMA",
      description: "Un sistema de captación que ayuda a negocios locales a ser encontrados, capturar oportunidades, organizar leads y dar seguimiento rápido.",
      eyebrow: "Sistema de Captación",
      h1: "Un flujo práctico de captación para negocios locales.",
      subtitle: "BLYNX construye las piezas que ayudan a convertir el interés en internet en oportunidades organizadas: visibilidad, confianza, captación, seguimiento, reseñas y reportes claros.",
      optionalTitle: "Enfoque Simple",
      optionalCopy: "BLYNX se enfoca en sistemas prácticos de captación y seguimiento para oportunidades reales. Mantenemos el proceso simple, claro y fácil de manejar.",
      ctaTitle: "Empieza con la auditoría gratis.",
      ctaSubtitle: "Descubre dónde tu flujo actual de captación puede estar perdiendo oportunidades antes de decidir qué mejorar."
    },
    aboutPage: {
      title: "Nosotros | BLYNX - AIMA",
      description: "BLYNX ayuda a negocios locales a ser encontrados en internet, capturar oportunidades, organizar leads y dar seguimiento más rápido.",
      eyebrow: "Nosotros",
      h1: "Creado para negocios locales que necesitan un flujo de captación más claro.",
      subtitle: "BLYNX ayuda a negocios locales a ser encontrados en internet, capturar oportunidades y dar seguimiento rápido sin agregar herramientas complicadas al día a día.",
      cards: [
        ["A Quién Ayuda BLYNX", "BLYNX sirve a negocios locales en Estados Unidos que dependen de llamadas, solicitudes de cotización, reservas, consultas y confianza del cliente para crecer."],
        ["Qué Construye BLYNX", "Construimos un sistema de captación simple: ser encontrado, capturar la oportunidad, organizar el lead y dar seguimiento rápido."],
        ["Por Qué Importa", "Los clientes locales comparan negocios rápidamente. Un flujo más claro ayuda a reducir llamadas perdidas, formularios olvidados y posibles clientes perdidos."]
      ],
      positionEyebrow: "Posicionamiento",
      positionTitle: "Un resultado claro: mejor flujo de captación.",
      positionCopy: "BLYNX está basado en Nashville, Tennessee y apoya a negocios locales en todo Estados Unidos. El enfoque es infraestructura práctica de crecimiento: visibilidad local más clara, captación más fácil, mejor organización y seguimiento más rápido.",
      bullets: [
        "Mejoras de visibilidad local que ayudan a los clientes a encontrar el negocio.",
        "Landing pages enfocadas que ayudan al visitante a tomar el siguiente paso.",
        "Organización de leads que mantiene cada oportunidad en un flujo claro.",
        "Soporte simple de seguimiento que ayuda a responder más rápido."
      ],
      stats: [
        ["Nashville", "Basados en Tennessee y sirviendo a negocios locales en todo Estados Unidos."],
        ["Práctico", "Sistemas claros para dueños que quieren resultados, no confusión técnica."],
        ["Enfocado", "No somos una agencia general de marketing. Nos enfocamos en captación, organización y seguimiento."]
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
      title: "Contacto | BLYNX - AIMA",
      description: "Contacta a BLYNX AIMA AGENCY para mejorar tu flujo de captación y seguimiento.",
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
        "Sistema de captación",
        "Google Business Profile",
        "Landing page enfocada",
        "Captura de oportunidades",
        "Seguimiento",
        "Estrategia de reseñas",
        "Reportes",
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
      title: "Recursos | BLYNX - AIMA",
      description: "Recursos prácticos para captación, organización de leads y seguimiento.",
      eyebrow: "Recursos",
      h1: "Recursos prácticos de crecimiento para dueños de negocios locales.",
      subtitle: "Usa estos puntos de partida para revisar cómo los clientes te encuentran, te contactan y reciben seguimiento antes de tu auditoría gratis.",
      cards: [
        ["Checklist de Captación Local", "Revisa lo básico que ayuda a los clientes a encontrar tu negocio, confiar y tomar el siguiente paso.", "Solicitar auditoría gratis", "/free-audit"],
        ["Preparación para Capturar Oportunidades", "Revisa si tu landing page y flujo de contacto hacen fácil que prospectos calificados te contacten.", "Explorar el sistema", "/services"],
        ["Bases de Seguimiento", "Entiende cómo confirmaciones, recordatorios y organización simple reducen oportunidades perdidas.", "Hacer una pregunta", "/contact"]
      ]
    }
  }
};

const services = {
  en: [
    ["Lead Flow Audit", "Review how customers find the business, take action, and move into follow-up."],
    ["Google Visibility Tune-Up", "Improve local visibility, trust signals, business information, photos, reviews, and call opportunities."],
    ["Focused Lead Page", "A simple page designed to turn visitors into calls, quote requests, or booked appointments."],
    ["Lead Capture & Organization", "Smart forms, contact buttons, quote request flow, and organized lead collection."],
    ["Fast Follow-Up", "Basic email, SMS, or WhatsApp follow-up so qualified leads do not get lost."],
    ["Review Request Flow", "A simple system to help the business request, organize, and improve customer reviews."],
    ["Monthly Lead Report", "A clear monthly report showing what improved, what leads came in, and what should be optimized next."]
  ],
  es: [
    ["Auditoría del Flujo de Captación", "Revisión de cómo los clientes encuentran el negocio, toman acción y pasan al seguimiento."],
    ["Ajuste de Visibilidad en Google", "Mejoras de visibilidad local, confianza, información del negocio, fotos, reseñas y oportunidades de llamada."],
    ["Página Enfocada en Oportunidades", "Una página simple diseñada para convertir visitantes en llamadas, cotizaciones o citas agendadas."],
    ["Captura y Organización de Leads", "Formularios simples, botones de contacto, flujo de cotización y captación organizada."],
    ["Seguimiento Rápido", "Seguimiento básico por email, SMS o WhatsApp para que las oportunidades no se pierdan."],
    ["Flujo para Pedir Reseñas", "Un sistema simple para pedir, organizar y mejorar las reseñas de clientes."],
    ["Reporte Mensual de Captación", "Reporte mensual claro sobre qué mejoró, qué oportunidades llegaron y qué se debe optimizar después."]
  ]
};

const problemCards = {
  en: [
    ["No Clear Lead Flow", "Visitors may be interested, but there is no simple path from discovery to contact to follow-up."],
    ["Slow Follow-Up", "When responses take too long, qualified prospects keep searching and choose another business."],
    ["Leads Get Lost", "Calls, forms, messages, and notes get scattered when there is no organized place to track opportunities."]
  ],
  es: [
    ["No Hay un Flujo Claro", "Los visitantes pueden estar interesados, pero no hay un camino simple desde encontrar el negocio hasta contactar y recibir seguimiento."],
    ["Seguimiento Lento", "Cuando la respuesta tarda demasiado, los prospectos calificados siguen buscando y eligen otro negocio."],
    ["Los Leads se Pierden", "Llamadas, formularios, mensajes y notas quedan dispersos cuando no hay un lugar organizado para rastrear oportunidades."]
  ]
};

const systemBlocks = {
  en: [
    ["Get Found", "Improve the local signals that help qualified customers find and trust your business."],
    ["Capture Leads", "Give visitors a clear path to call, request a quote, or book the next step."],
    ["Track Opportunities", "Organize new leads so each opportunity has a place and a next action."],
    ["Follow Up Faster", "Use simple confirmations, notifications, and reminders to respond while interest is high."],
    ["Build Trust", "Strengthen reviews, proof, and local credibility so more prospects feel ready to reach out."]
  ],
  es: [
    ["Ser Encontrado", "Mejora las señales locales que ayudan a clientes calificados a encontrar y confiar en tu negocio."],
    ["Capturar Oportunidades", "Dale a los visitantes un camino claro para llamar, pedir cotización o agendar el siguiente paso."],
    ["Organizar Leads", "Organiza nuevos leads para que cada oportunidad tenga un lugar y una próxima acción."],
    ["Dar Seguimiento Rápido", "Usa confirmaciones, notificaciones y recordatorios simples para responder mientras el interés está alto."],
    ["Generar Confianza", "Fortalece reseñas, prueba social y credibilidad local para que más prospectos se animen a contactarte."]
  ]
};

const offerPaths = {
  en: [
    {
      stage: "existing",
      auditSlug: "free-audit-existing",
      title: "Improve What You Already Have",
      copy: "For businesses that already have a website, Google profile, or online presence — but are not getting enough qualified leads or follow-up.",
      bullets: ["Improve visibility", "Capture more qualified leads", "Organize opportunities", "Follow up faster"],
      cta: "Get a Free Audit"
    },
    {
      stage: "zero",
      auditSlug: "free-audit-zero",
      title: "Start From Zero",
      copy: "For businesses without a website, Google Business Profile, or lead system. We build the digital foundation needed to get found, receive opportunities, and follow up professionally.",
      bullets: ["Google Business Profile setup", "Conversion landing page", "Smart lead form", "Basic lead tracking", "Follow-up automation", "Review request system"],
      cta: "Start With a Free Audit"
    }
  ],
  es: [
    {
      stage: "existing",
      auditSlug: "free-audit-existing",
      title: "Mejorar lo que Ya Tienes",
      copy: "Para negocios que ya tienen un sitio, perfil de Google o presencia en internet, pero no reciben suficientes oportunidades calificadas o seguimiento claro.",
      bullets: ["Mejorar visibilidad", "Capturar más oportunidades calificadas", "Organizar oportunidades", "Dar seguimiento más rápido"],
      cta: "Solicitar Auditoría Gratis"
    },
    {
      stage: "zero",
      auditSlug: "free-audit-zero",
      title: "Empezar Desde Cero",
      copy: "Para negocios sin sitio web, Google Business Profile o sistema de captación. Construimos la base digital necesaria para ser encontrado, recibir oportunidades y dar seguimiento de forma profesional.",
      bullets: ["Configuración de Google Business Profile", "Landing page de conversión", "Formulario inteligente", "Seguimiento básico de leads", "Automatización de seguimiento", "Sistema para pedir reseñas"],
      cta: "Empezar con Auditoría Gratis"
    }
  ]
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
      title: "Improve Your Local Lead System | BLYNX",
      description: "Improve visibility, lead capture, follow-up, and lead control for an existing local business presence.",
      eyebrow: "Existing digital presence",
      h1: "Improve the Lead System You Already Have",
      subtitle: "For service businesses that already have a website, Google profile, or online presence, but need more qualified opportunities and better follow-up.",
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
      title: "Digital Foundation + Lead System | BLYNX",
      description: "Build the digital foundation local service businesses need to get found, receive opportunities, and follow up professionally.",
      eyebrow: "Digital Foundation + Lead System",
      h1: "Start From Zero With a Simple Lead System",
      subtitle: "For service businesses that do not yet have a website, Google Business Profile, or lead capture system. BLYNX builds the foundation needed to look professional, get found, and receive opportunities.",
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
      title: "Mejora tu Sistema de Captación | BLYNX",
      description: "Mejora visibilidad, captación, seguimiento y control de leads para un negocio local que ya tiene presencia digital.",
      eyebrow: "Presencia digital existente",
      h1: "Mejora el Sistema de Captación que Ya Tienes",
      subtitle: "Para negocios de servicios que ya tienen sitio web, Google Business Profile o presencia online, pero necesitan más oportunidades calificadas y mejor seguimiento.",
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
      title: "Base Digital + Sistema de Captación | BLYNX",
      description: "Construye la base digital que un negocio local necesita para ser encontrado, recibir oportunidades y dar seguimiento profesional.",
      eyebrow: "Base Digital + Sistema de Captación",
      h1: "Empieza Desde Cero con un Sistema Simple de Captación",
      subtitle: "Para negocios de servicios que todavía no tienen sitio web, Google Business Profile o sistema de captación. BLYNX construye la base necesaria para verse profesional, ser encontrado y recibir oportunidades.",
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

const processSteps = {
  en: [
    ["Audit", "We review where leads currently come from, what happens next, and where opportunities may be getting lost."],
    ["Build", "We create the focused lead flow: local visibility, lead page, forms, trust signals, and tracking."],
    ["Connect", "We connect the capture points, notifications, organization, and follow-up steps into one simple system."],
    ["Improve", "We review what is working, what leads came in, and what should be adjusted next."]
  ],
  es: [
    ["Auditoría", "Revisamos de dónde llegan las oportunidades, qué pasa después y dónde se pueden estar perdiendo posibles clientes."],
    ["Construcción", "Creamos el flujo de captación: visibilidad local, página enfocada, formularios, confianza y organización."],
    ["Conexión", "Conectamos los puntos de captación, notificaciones, organización y seguimiento en un sistema simple."],
    ["Mejora", "Revisamos qué está funcionando, qué oportunidades llegaron y qué se debe ajustar después."]
  ]
};

const results = {
  en: [
    ["More Qualified Opportunities", "A clearer lead flow can help more of the right prospects take the next step.", "More qualified opportunities"],
    ["Faster Response Time", "Notifications and reminders help the business respond while interest is still high.", "Faster response time"],
    ["Better Lead Organization", "Each opportunity has a clearer place, status, and next action.", "Better lead organization"],
    ["Improved Online Trust", "Reviews, local visibility, and focused proof help prospects feel safer reaching out.", "Improved online trust"]
  ],
  es: [
    ["Más Oportunidades Calificadas", "Un flujo de captación más claro puede ayudar a que más prospectos correctos tomen el siguiente paso.", "Más oportunidades calificadas"],
    ["Respuesta Más Rápida", "Notificaciones y recordatorios ayudan al negocio a responder mientras el interés sigue alto.", "Respuesta más rápida"],
    ["Mejor Organización de Leads", "Cada oportunidad tiene un lugar, estado y próxima acción más claros.", "Mejor organización de leads"],
    ["Más Confianza en Internet", "Reseñas, visibilidad local y prueba enfocada ayudan a que los prospectos se sientan más seguros al contactar.", "Más confianza en internet"]
  ]
};

const connectedInfrastructure = {
  en: {
    eyebrow: "Connected infrastructure",
    title: "What Your Lead System Can Connect",
    intro:
      "Every business starts from a different place. BLYNX connects the pieces needed to create a clearer path from online discovery to organized follow-up.",
    cards: [
      ["Local Visibility", "Google Business Profile, Apple Business Connect, Bing Places, local listings, business information and trust signals."],
      ["Website or Landing Page", "A focused digital experience that clearly explains the service and gives visitors an obvious next step."],
      ["Smart Lead Capture", "Quote forms, contact buttons, booking options and structured information collection."],
      ["Lead Organization", "A simple CRM or organized pipeline that gives every opportunity a status and next action."],
      ["Faster Follow-Up", "Confirmations, owner notifications, email, SMS or WhatsApp workflows based on the business needs."],
      ["Review Strategy", "A practical process for requesting reviews, strengthening trust and improving local credibility."]
    ],
    disclaimer: "The final system depends on the needs, current setup and approved scope of each business."
  },
  es: {
    eyebrow: "Infraestructura conectada",
    title: "Lo que Puede Conectar tu Sistema de Captación",
    intro:
      "Cada negocio comienza desde un punto diferente. BLYNX conecta las piezas necesarias para crear un camino más claro desde que un cliente encuentra el negocio hasta que recibe seguimiento.",
    cards: [
      ["Visibilidad Local", "Google Business Profile, Apple Business Connect, Bing Places, directorios locales, información comercial y señales de confianza."],
      ["Sitio Web o Landing Page", "Una experiencia digital enfocada que explica claramente el servicio y ofrece al visitante un siguiente paso evidente."],
      ["Captura Inteligente", "Formularios de cotización, botones de contacto, opciones de reserva y recopilación organizada de información."],
      ["Organización de Leads", "Un CRM simple o pipeline organizado que asigna a cada oportunidad un estado y una próxima acción."],
      ["Seguimiento Más Rápido", "Confirmaciones, notificaciones al negocio y flujos de email, SMS o WhatsApp según las necesidades."],
      ["Estrategia de Reseñas", "Un proceso práctico para solicitar reseñas, aumentar la confianza y mejorar la credibilidad local."]
    ],
    disclaimer: "El sistema final depende de las necesidades, configuración actual y alcance aprobado de cada negocio."
  }
};

const legalPages = {
  en: {
    privacy: {
      title: "Privacy Policy | BLYNX",
      description: "Privacy Policy for BLYNX AIMA AGENCY.",
      eyebrow: "Privacy",
      h1: "Privacy Policy",
      effective: `Effective date: ${LEGAL_EFFECTIVE_DATE}`,
      sections: [
        ["Introduction", "This Privacy Policy explains how BLYNX AIMA AGENCY collects, uses and protects information submitted through this website and normal website use. By using the website or submitting a form, you acknowledge the practices described here."],
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
      description: "Terms of Service for BLYNX AIMA AGENCY.",
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
      description: "Política de Privacidad de BLYNX AIMA AGENCY.",
      eyebrow: "Privacidad",
      h1: "Política de Privacidad",
      effective: `Fecha de vigencia: ${LEGAL_EFFECTIVE_DATE}`,
      sections: [
        ["Introducción", "Esta Política de Privacidad explica cómo BLYNX AIMA AGENCY recopila, utiliza y protege la información enviada a través de este sitio web y la información generada por el uso normal del sitio. Al usar el sitio o enviar un formulario, reconoces las prácticas descritas aquí."],
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
      description: "Términos de Servicio de BLYNX AIMA AGENCY.",
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
  fs.writeFileSync(target, `${contents.trim()}\n`, "utf8");
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
    return `<img src="${image.src}" alt="${alt}" width="520" height="620" loading="lazy" decoding="async">`;
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
  const systemHref = `${home}#system`;
  const aboutHref = pagePath(lang, "about");
  const auditHref = pagePath(lang, auditSlug);

  const activeClass = (name) => (active === name ? ' class="is-active"' : "");

  return `
    <a class="skip-link" href="#main">${t.skip}</a>
    <header class="site-header" aria-label="${t.navAria}">
      <div class="container header-shell">
        <a class="brand" href="${home}" aria-label="${t.brandAria}">
          <span class="brand-mark" aria-hidden="true">BX</span>
          <span class="brand-text">
            <span class="brand-name">BLYNX</span>
          </span>
        </a>
        <nav class="site-nav" data-site-nav>
          <a${activeClass("home")} href="${home}">${t.nav.home}</a>
          <a href="${systemHref}">${t.nav.services}</a>
          <a href="${home}#process">${t.nav.process}</a>
          <a href="${home}#results">${t.nav.results}</a>
          <a${activeClass("about")} href="${aboutHref}">${t.nav.about}</a>
          ${blogArticles[lang].length ? `<a${activeClass("blog")} href="${pagePath(lang, "blog")}">${t.nav.blog}</a>` : ""}
          <a href="${auditHref}">${t.nav.audit}</a>
        </nav>
        <div class="header-actions">
          ${languageSwitcher(lang, switchPath, switchPaths)}
          <a class="btn btn-primary" href="${auditHref}">${t.cta.audit}</a>
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
            <span class="brand-text"><span class="brand-name">BLYNX</span></span>
          </a>
          <p>${t.footer}</p>
          <span>&copy; 2026 ${BUSINESS.legalName}.</span>
        </div>
        <div class="footer-links">
          <a href="${pagePath(lang, "services")}">${t.nav.services}</a>
          <a href="${pagePath(lang, "about")}">${t.nav.about}</a>
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
    <meta property="og:title" content="${meta.title}">
    <meta property="og:description" content="${meta.description}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:locale" content="${lang === "es" ? "es_ES" : "en_US"}">
    <meta property="og:locale:alternate" content="${lang === "es" ? "en_US" : "es_ES"}">
    <meta property="og:image" content="${OG_IMAGE}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${meta.title}">
    <meta name="twitter:description" content="${meta.description}">
    <meta name="twitter:image" content="${OG_IMAGE}">
    ${structuredData(lang, meta.title, meta.description, canonicalUrl, breadcrumbs)}
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
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
          <img src="${src}" alt="${alt}" width="1200" height="${wide ? 510 : 630}" loading="lazy" decoding="async"${wide ? ' class="is-wide"' : ""}>
        </div>
      </section>`;
}

function serviceCards(lang, cardClass = "service-card", iconClass = "service-icon") {
  return services[lang]
    .map(
      ([title, text], index) => `
            <article class="${cardClass}">
              <div class="${iconClass}">${String(index + 1).padStart(2, "0")}</div>
              <h3>${title}</h3>
              <p>${text}</p>
            </article>`
    )
    .join("");
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

function homePage(lang) {
  const t = copy[lang];
  const h = t.home;
  const body = `
    <main id="main">
      <section class="hero" id="home">
        <div class="container hero-grid">
          <div class="hero-copy">
            <p class="eyebrow">${h.eyebrow}</p>
            <h1>${h.headline}</h1>
            <p>${h.subtitle}</p>
            <div class="hero-actions">
              <a class="btn btn-primary" href="${pagePath(lang, "free-audit")}">${t.cta.audit}</a>
              <a class="btn btn-secondary" href="${pagePath(lang)}#process">${t.cta.services}</a>
            </div>
            <div class="stage-banner" hidden data-stage-banner data-existing-message="${h.stageBanner.existing}" data-zero-message="${h.stageBanner.zero}"></div>
            <div class="trust-pills" aria-label="BLYNX benefits">
              ${h.trust.map((item) => `<span class="trust-pill">${item}</span>`).join("")}
            </div>
          </div>

          <div class="hero-visual" aria-label="${h.visual.aria}">
            <div class="visual-stage">
              <img class="stage-backdrop" src="/public/images/site/hero-flow.jpg" alt="" width="1000" height="1000" decoding="async" aria-hidden="true">
              <span class="demo-label">${h.visual.demoLabel}</span>
              <div class="laptop-mockup">
                <div class="laptop-frame">
                  <div class="laptop-screen">
                    <div class="browser-bar" aria-hidden="true">
                      <span class="browser-dot"></span>
                      <span class="browser-dot"></span>
                      <span class="browser-dot"></span>
                    </div>
                    <div class="site-preview">
                      <div class="preview-copy" aria-hidden="true">
                        <span class="preview-line long"></span>
                        <span class="preview-line medium"></span>
                        <span class="preview-line short"></span>
                        <span class="preview-button"></span>
                      </div>
                      <div class="preview-panel" aria-hidden="true">
                        <span class="preview-tile is-gold"></span>
                        <span class="preview-tile"></span>
                        <span class="preview-tile"></span>
                        <span class="preview-tile is-gold"></span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="laptop-base" aria-hidden="true"></div>
              </div>

              <div class="phone-mockup">
                <div class="phone-screen">
                  <div class="gbp-header" aria-hidden="true"></div>
                  <div class="gbp-title">${h.visual.profile}</div>
                  <div class="gbp-meta">${h.visual.open}</div>
                  <div class="gbp-rating">${h.visual.rating}</div>
                  <div class="gbp-action">${h.visual.call}</div>
                </div>
              </div>

              <div class="floating-card">
                <div class="mini-label">${h.visual.leadLabel}</div>
                <div class="mini-title">${h.visual.leadTitle}</div>
                <div class="mini-detail">${h.visual.leadDetail}</div>
              </div>

              <div class="automation-card">
                <div class="mini-label">${h.visual.automationLabel}</div>
                <div class="mini-title">${h.visual.automationTitle}</div>
                <div class="automation-steps">
                  ${h.visual.steps.map((step) => `<span class="automation-step">${step}</span>`).join("")}
                </div>
              </div>
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
          <div class="results-grid problem-grid">
            ${problemCards[lang]
              .map(
                ([title, text], index) => `
            <article class="result-card">
              <div class="result-icon">${String(index + 1).padStart(2, "0")}</div>
              <h3>${title}</h3>
              <p>${text}</p>
            </article>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="section" id="system">
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">${h.servicesEyebrow}</p>
            <h2>${h.servicesTitle}</h2>
            <p>${h.servicesSubtitle}</p>
          </div>
          <div class="card-grid five-card-grid">
            ${systemBlocks[lang]
              .map(
                ([title, text], index) => `
            <article class="service-card">
              <div class="service-icon">${String(index + 1).padStart(2, "0")}</div>
              <h3>${title}</h3>
              <p>${text}</p>
            </article>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="section section-soft" id="offer-paths">
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">${h.pathsEyebrow}</p>
            <h2>${h.pathsTitle}</h2>
            <p>${h.pathsSubtitle}</p>
          </div>
          <div class="offer-path-grid">
            ${offerPaths[lang]
              .map(
                (pathItem, index) => `
            <article class="offer-path-card">${stageCardMedia(pathItem.stage)}
              <div class="feature-icon">${String(index + 1).padStart(2, "0")}</div>
              <h3>${pathItem.title}</h3>
              <p>${pathItem.copy}</p>
              <ul class="check-list">
                ${pathItem.bullets.map((item) => `<li>${item}</li>`).join("")}
              </ul>
              <a class="btn btn-primary" href="${pagePath(lang, pathItem.auditSlug)}" data-stage-choice="${pathItem.stage}">${pathItem.cta}</a>
            </article>`
              )
              .join("")}
          </div>
          <p class="offer-path-support">${h.pathsSupport}</p>
        </div>
      </section>

      <section class="section" id="free-audit-flow">
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">${h.auditEyebrow}</p>
            <h2>${h.auditTitle}</h2>
            <p>${h.auditSubtitle}</p>
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

      <section class="section section-soft" id="process">
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">${h.processEyebrow}</p>
            <h2>${h.processTitle}</h2>
          </div>
          <div class="process-grid">
            ${processSteps[lang]
              .map(
                ([title, text], index) => `
            <article class="process-card">
              <div class="step-number">${index + 1}</div>
              <h3>${title}</h3>
              <p>${text}</p>
            </article>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="section" id="results">
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">${h.resultsEyebrow}</p>
            <h2>${h.resultsTitle}</h2>
          </div>
          <div class="results-grid">
            ${results[lang]
              .map(
                ([title, text, metric], index) => `
            <article class="result-card">
              <div class="result-icon">${String(index + 1).padStart(2, "0")}</div>
              <h3>${title}</h3>
              <p>${text}</p>
              <div class="metric">${metric}</div>
            </article>`
              )
              .join("")}
          </div>

          <div class="connected-system">
            <div class="section-heading">
              <p class="eyebrow">${connectedInfrastructure[lang].eyebrow}</p>
              <h2>${connectedInfrastructure[lang].title}</h2>
              <p>${connectedInfrastructure[lang].intro}</p>
            </div>
            <div class="feature-grid">
              ${connectedInfrastructure[lang].cards
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
            <p class="section-disclaimer">${connectedInfrastructure[lang].disclaimer}</p>
          </div>
        </div>
      </section>

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

      <section class="scene-band" aria-label="Nashville, Tennessee">
        <div class="container">
          <img src="/public/images/site/nashville.jpg" alt="${SITE_MEDIA_ALTS.nashville[lang]}" width="1200" height="510" loading="lazy" decoding="async">
        </div>
      </section>

      <section class="section" id="final-cta">
        <div class="container">
          <div class="cta-panel">
            <h2>${h.finalTitle}</h2>
            <p>${h.finalSubtitle}</p>
            <div class="cta-actions">
              <a class="btn btn-primary" href="${pagePath(lang, "free-audit")}">${t.cta.auditLong}</a>
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
      <section class="section section-tight">
        <div class="container feature-grid">
          ${serviceCards(lang, "feature-card", "feature-icon")}
          <article class="feature-card">
            <div class="feature-icon">+</div>
            <h3>${p.optionalTitle}</h3>
            <p>${p.optionalCopy}</p>
          </article>
        </div>
      </section>

      <section class="section section-soft">
        <div class="container">
          <div class="cta-panel">
            <h2>${p.ctaTitle}</h2>
            <p>${p.ctaSubtitle}</p>
            <div class="cta-actions">
              <a class="btn btn-primary" href="${pagePath(lang, "free-audit")}">${t.cta.audit}</a>
              <a class="btn btn-secondary" href="${pagePath(lang, "contact")}">${t.cta.contact}</a>
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
          <img src="/public/images/site/nashville.jpg" alt="${SITE_MEDIA_ALTS.nashville[lang]}" width="1200" height="510" loading="lazy" decoding="async">
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
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
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
    <title>BLYNX - AIMA | Local Lead Systems in English & Spanish</title>
    <meta name="description" content="BLYNX builds local lead systems for service businesses: get found on Google, capture qualified leads, and follow up faster. Available in English and Spanish.">
    <link rel="canonical" href="${SITE_URL}/">
    <link rel="alternate" hreflang="en" href="${SITE_URL}/en">
    <link rel="alternate" hreflang="es" href="${SITE_URL}/es">
    <link rel="alternate" hreflang="x-default" href="${SITE_URL}/">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${BUSINESS.displayName}">
    <meta property="og:title" content="${BUSINESS.displayName}">
    <meta property="og:description" content="Local lead systems for service businesses: websites, Google Business Profile, automation and AI.">
    <meta property="og:url" content="${SITE_URL}/">
    <meta property="og:image" content="${OG_IMAGE}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${BUSINESS.displayName}">
    <meta name="twitter:description" content="Local lead systems for service businesses: websites, Google Business Profile, automation and AI.">
    <meta name="twitter:image" content="${OG_IMAGE}">
    ${structuredData("en", "BLYNX - AIMA | Local Lead Systems in English & Spanish", "BLYNX builds local lead systems for service businesses: get found on Google, capture qualified leads, and follow up faster. Available in English and Spanish.", `${SITE_URL}/`)}
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
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
        <p class="eyebrow">AIMA</p>
        <h1>Local Lead Systems for Service Businesses</h1>
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
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
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
            <img src="${article.heroImage}" alt="${article.heroImageAlt}" width="1200" height="630" decoding="async">
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

for (const slug of ["free-audit", "services", "about", "contact", "privacy", "terms"]) {
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
