const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const SITE_URL = "https://www.blynxsystems.com";
const OG_IMAGE = `${SITE_URL}/assets/og-image.png`;

function structuredData(lang, title, description, canonicalUrl) {
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
        name: "BLYNX AIMA AGENCY",
        description: orgDescription,
        url: `${SITE_URL}/`,
        email: "hello@blynxsystems.com",
        image: OG_IMAGE,
        logo: OG_IMAGE,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Nashville",
          addressRegion: "TN",
          addressCountry: "US"
        },
        areaServed: { "@type": "Country", name: "United States" },
        knowsLanguage: ["en", "es"]
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: "BLYNX AIMA AGENCY",
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
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

const copy = {
  en: {
    code: "en",
    htmlLang: "en",
    titleSuffix: "BLYNX AIMA AGENCY",
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
      audit: "Free Audit"
    },
    cta: {
      audit: "Get a Free Audit",
      auditLong: "Get Your Free Audit",
      auditShort: "Get a Free Audit",
      services: "See How It Works",
      contact: "Contact BLYNX"
    },
    home: {
      title: "BLYNX AIMA AGENCY | Local Lead Systems for Service Businesses",
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
      auditSubtitle: "AI-powered for speed. Human-reviewed for quality.",
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
        website: "Website URL",
        cityState: "City / State",
        businessType: "Business Type",
        gbp: "Google Business Profile Link",
        websiteStatus: "Do you currently have a website?",
        gbpStatus: "Do you have a Google Business Profile?",
        language: "Preferred Language",
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
      timelines: ["Immediately", "This month", "Next 2–3 months", "Just researching"],
      submit: "Submit My Free Audit Request",
      note: "No paid AI API is connected yet. Your request is currently logged locally for setup testing.",
      success: "Thank you. Your free audit request has been received. We\u2019ll review your business and contact you with the next steps.",
      error: "Something went wrong sending your request. Please try again, or email us directly at hello@blynxsystems.com."
    },
    servicesPage: {
      title: "Local Lead System | BLYNX AIMA AGENCY",
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
      title: "About | BLYNX AIMA AGENCY",
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
      ctaTitle: "See what your business may be missing online.",
      ctaSubtitle: "The free audit is the simplest first step."
    },
    contactPage: {
      title: "Contact | BLYNX AIMA AGENCY",
      description: "Contact BLYNX AIMA AGENCY for local lead flow, lead capture, and faster follow-up support.",
      eyebrow: "Contact",
      h1: "Talk with BLYNX about your local lead flow.",
      subtitle: "Use the form below or start with the free audit if you want to see where leads may be getting lost.",
      emailTitle: "Email",
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
      submit: "Send Message",
      success: "Thank you. Your message has been received. BLYNX will follow up with the next steps.",
      error: "Something went wrong sending your message. Please try again, or email us directly at hello@blynxsystems.com."
    },
    resourcesPage: {
      title: "Resources | BLYNX AIMA AGENCY",
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
    titleSuffix: "BLYNX AIMA AGENCY",
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
      audit: "Auditoría Gratis"
    },
    cta: {
      audit: "Solicitar Auditoría Gratis",
      auditLong: "Solicitar tu Auditoría Gratis",
      auditShort: "Auditoría Gratis",
      services: "Ver Cómo Funciona",
      contact: "Contactar a BLYNX"
    },
    home: {
      title: "BLYNX AIMA AGENCY | Sistemas de Captación para Negocios Locales",
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
      auditSubtitle: "Impulsada por IA para mayor rapidez. Revisada por BLYNX para mayor calidad.",
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
        email: "Email",
        phone: "Teléfono",
        website: "Sitio web",
        cityState: "Ciudad / Estado",
        businessType: "Tipo de negocio",
        gbp: "Link de Google Business Profile",
        websiteStatus: "¿Actualmente tienes sitio web?",
        gbpStatus: "¿Tienes Google Business Profile?",
        language: "Idioma preferido",
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
      timelines: ["Inmediatamente", "Este mes", "En los próximos 2–3 meses", "Solo estoy investigando"],
      submit: "Enviar Solicitud de Auditoría Gratis",
      note: "Todavía no hay una API de IA pagada conectada. Por ahora la solicitud se registra localmente para pruebas.",
      success: "Gracias. Hemos recibido tu solicitud de auditoría gratis. Revisaremos tu negocio y te contactaremos con los próximos pasos.",
      error: "Ocurrió un error al enviar tu solicitud. Inténtalo de nuevo o escríbenos directamente a hello@blynxsystems.com."
    },
    servicesPage: {
      title: "Sistema de Captación | BLYNX AIMA AGENCY",
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
      title: "Nosotros | BLYNX AIMA AGENCY",
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
      ctaTitle: "Descubre qué oportunidades puede estar perdiendo tu negocio en internet.",
      ctaSubtitle: "La auditoría gratis es el primer paso más simple."
    },
    contactPage: {
      title: "Contacto | BLYNX AIMA AGENCY",
      description: "Contacta a BLYNX AIMA AGENCY para mejorar tu flujo de captación y seguimiento.",
      eyebrow: "Contacto",
      h1: "Habla con BLYNX sobre tu sistema de captación.",
      subtitle: "Usa el formulario de abajo o empieza con la auditoría gratis si quieres ver dónde se pueden estar perdiendo oportunidades.",
      emailTitle: "Email",
      auditTitle: "Empieza con una auditoría",
      auditCopy: "¿No estás seguro de qué necesitas? Solicita primero una auditoría gratis de presencia digital.",
      languageTitle: "Soporte de idioma",
      languageCopy: "El soporte para leads en inglés y español puede solicitarse durante el proceso de auditoría o contacto.",
      fields: {
        name: "Nombre completo",
        business: "Nombre del negocio",
        email: "Email",
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
      submit: "Enviar Mensaje",
      success: "Gracias. Hemos recibido tu mensaje. BLYNX te contactará con los próximos pasos.",
      error: "Ocurrió un error al enviar tu mensaje. Inténtalo de nuevo o escríbenos directamente a hello@blynxsystems.com."
    },
    resourcesPage: {
      title: "Recursos | BLYNX AIMA AGENCY",
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
    ["AI Snapshot Scan", "Google Business Profile, reviews, visibility, and lead flow signals are checked."],
    ["Human Review", "BLYNX reviews the findings and adds personalized recommendations."],
    ["Audit Delivered + Book a Call", "You receive your audit summary and can book a strategy call."]
  ],
  es: [
    ["Haz clic en Auditoría Gratis", "Inicia tu solicitud de auditoría gratis en nuestro sitio."],
    ["Elige Idioma", "Soporte disponible en inglés o español."],
    ["Responde el Formulario", "Comparte tu negocio, metas, contacto y presencia actual en internet."],
    ["Revisión Inicial con IA", "Se revisan señales de Google Business Profile, reseñas, visibilidad y flujo de captación."],
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

const testimonials = {
  en: [
    ["BLYNX helped us clean up our online presence and turn more visitors into real inquiries.", "Local Service Business Owner"],
    ["The follow-up system made it easier to respond to leads without losing track of potential customers.", "Home Services Business Owner"]
  ],
  es: [
    ["BLYNX nos ayudó a ordenar nuestra presencia digital y convertir más visitantes en solicitudes reales.", "Dueño de Negocio de Servicios Locales"],
    ["El sistema de seguimiento hizo más fácil responder a leads sin perder oportunidades.", "Dueño de Negocio de Servicios del Hogar"]
  ]
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

function languageSwitcher(lang, switchPath) {
  const pathPart = switchPath ? `/${switchPath}` : "";
  const enHref = `/en${pathPart}`;
  const esHref = `/es${pathPart}`;
  const t = copy[lang];

  return `
    <div class="language-switcher" aria-label="${t.switchAria}">
      <a class="${lang === "en" ? "is-active" : ""}" href="${enHref}" data-language-switch="en">EN</a>
      <span aria-hidden="true">|</span>
      <a class="${lang === "es" ? "is-active" : ""}" href="${esHref}" data-language-switch="es">ES</a>
    </div>`;
}

function header(lang, active, switchPath = "", auditSlug = "free-audit") {
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
          <a href="${auditHref}">${t.nav.audit}</a>
        </nav>
        <div class="header-actions">
          ${languageSwitcher(lang, switchPath)}
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
  return `
    <footer class="footer">
      <div class="container footer-inner">
        <span>&copy; 2026 BLYNX AIMA AGENCY. ${t.footer}</span>
        <div class="footer-links">
          <a href="${pagePath(lang, "services")}">${t.nav.services}</a>
          <a href="${pagePath(lang, "about")}">${t.nav.about}</a>
          <a href="${pagePath(lang, "resources")}">${t.nav.resources}</a>
          <a href="${pagePath(lang, "contact")}">${t.nav.contact}</a>
          <a href="${pagePath(lang, auditSlug)}">${t.nav.audit}</a>
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
    <meta property="og:site_name" content="BLYNX AIMA AGENCY">
    <meta property="og:title" content="${meta.title}">
    <meta property="og:description" content="${meta.description}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:locale" content="${lang === "es" ? "es_ES" : "en_US"}">
    <meta property="og:locale:alternate" content="${lang === "es" ? "en_US" : "es_ES"}">
    <meta property="og:image" content="${OG_IMAGE}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${OG_IMAGE}">
    ${structuredData(lang, meta.title, meta.description, canonicalUrl)}
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
          <div class="results-grid">
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
            <article class="offer-path-card">
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

          <div class="testimonial-grid" aria-label="Testimonials">
            ${testimonials[lang]
              .map(
                ([quote, name]) => `
            <article class="testimonial-card">
              <blockquote>&ldquo;${quote}&rdquo;</blockquote>
              <cite>${name}</cite>
            </article>`
              )
              .join("")}
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

          <form class="form-card" onsubmit="handleAuditSubmit(event)" data-success-message="${p.success}" data-error-message="${p.error}">
            <input type="hidden" name="businessStage" data-business-stage-field>
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
                <label for="phone">${p.fields.phone}</label>
                <input id="phone" name="phone" type="tel" autocomplete="tel" required>
              </div>
              <div class="field">
                <label for="website-url">${p.fields.website}</label>
                <input id="website-url" name="websiteUrl" type="url" placeholder="https://example.com">
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
                <label for="gbp-link">${p.fields.gbp}</label>
                <input id="gbp-link" name="googleBusinessProfileLink" type="url" placeholder="${p.placeholders.gbp}">
              </div>
              <div class="field">
                <label for="website-status">${p.fields.websiteStatus}</label>
                <select id="website-status" name="websiteStatus" required>
                  <option value="">${p.fields.websiteStatus}</option>
                  ${p.websiteStatusOptions.map((item) => `<option>${item}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <label for="gbp-status">${p.fields.gbpStatus}</label>
                <select id="gbp-status" name="googleBusinessProfileStatus" required>
                  <option value="">${p.fields.gbpStatus}</option>
                  ${p.gbpStatusOptions.map((item) => `<option>${item}</option>`).join("")}
                </select>
              </div>
              <div class="field field-full">
                <label for="audit-language">${p.fields.language}</label>
                <select id="audit-language" name="preferredLanguage" required data-preferred-language-field>
                  <option value="">${p.fields.language}</option>
                  ${p.languageOptions.map((item) => `<option>${item}</option>`).join("")}
                </select>
              </div>
              <fieldset class="field field-full">
                <legend>${p.fields.improvements}</legend>
                <div class="choice-grid">
                  ${p.improvements
                    .map((item) => `<label class="choice"><input type="checkbox" name="improvements" value="${item}"> ${item}</label>`)
                    .join("")}
                </div>
              </fieldset>
              <div class="field field-full">
                <label for="timeline">${p.fields.timeline}</label>
                <select id="timeline" name="timeline" required>
                  <option value="">${p.fields.timeline}</option>
                  ${p.timelines.map((item) => `<option>${item}</option>`).join("")}
                </select>
              </div>
              <div class="field field-full">
                <label for="message">${p.fields.message}</label>
                <textarea id="message" name="message" placeholder="${p.placeholders.message}"></textarea>
              </div>
            </div>
            <div class="form-actions">
              <button class="btn btn-primary btn-full" type="submit">${p.submit}</button>
              <p class="form-note">${p.note}</p>
              <div class="form-status" tabindex="-1" hidden data-form-status></div>
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
                <label for="${lang}-${stage}-website-url">${p.fields.website}</label>
                <input id="${lang}-${stage}-website-url" name="websiteUrl" type="url" placeholder="https://example.com">
              </div>
              <div class="field">
                <label for="${lang}-${stage}-gbp-link">${p.fields.gbp}</label>
                <input id="${lang}-${stage}-gbp-link" name="googleBusinessProfileLink" type="url" placeholder="${base.placeholders.gbp}">
              </div>`
      : "";
  const stageChoices =
    stage === "existing"
      ? `
              <fieldset class="field field-full">
                <legend>${p.fields.improvements}</legend>
                <div class="choice-grid">
                  ${p.improvements
                    .map((item) => `<label class="choice"><input type="checkbox" name="improvements" value="${item}"> ${item}</label>`)
                    .join("")}
                </div>
              </fieldset>`
      : `
              <fieldset class="field field-full">
                <legend>${p.fields.needs}</legend>
                <div class="choice-grid">
                  ${p.needs
                    .map((item) => `<label class="choice"><input type="checkbox" name="foundationNeeds" value="${item}"> ${item}</label>`)
                    .join("")}
                </div>
              </fieldset>`;
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

          <form class="form-card" onsubmit="handleAuditSubmit(event)" data-success-message="${p.success}" data-error-message="${p.error}">
            <input type="hidden" name="businessStage" value="${stage}" data-business-stage-field data-business-stage-default="${stage}">
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
                <input id="${lang}-${stage}-phone" name="phone" type="tel" autocomplete="tel" required>
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
              <div class="field field-full">
                <label for="${lang}-${stage}-audit-language">${commonLabels.language}</label>
                <select id="${lang}-${stage}-audit-language" name="preferredLanguage" required data-preferred-language-field>
                  <option value="">${commonLabels.language}</option>
                  ${base.languageOptions.map((item) => `<option>${item}</option>`).join("")}
                </select>
              </div>
              ${stageChoices}
              <div class="field field-full">
                <label for="${lang}-${stage}-timeline">${p.fields.timeline}</label>
                <select id="${lang}-${stage}-timeline" name="timeline" required>
                  <option value="">${p.fields.timeline}</option>
                  ${p.timelines.map((item) => `<option>${item}</option>`).join("")}
                </select>
              </div>
              <div class="field field-full">
                <label for="${lang}-${stage}-message">${p.fields.message}</label>
                <textarea id="${lang}-${stage}-message" name="message" placeholder="${base.placeholders.message}"></textarea>
              </div>
            </div>
            <div class="form-actions">
              <button class="btn btn-primary btn-full" type="submit">${p.submit}</button>
              <p class="form-note">${base.note}</p>
              <div class="form-status" tabindex="-1" hidden data-form-status></div>
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
              <p>hello@blynxsystems.com</p>
            </div>
            <div class="contact-card">
              <h3>${p.auditTitle}</h3>
              <p>${p.auditCopy}</p>
              <p><a class="btn btn-secondary" href="${pagePath(lang, "free-audit")}">${t.cta.audit}</a></p>
            </div>
            <div class="contact-card">
              <h3>${p.languageTitle}</h3>
              <p>${p.languageCopy}</p>
            </div>
          </aside>

          <form class="form-card" onsubmit="handleContactSubmit(event)" data-success-message="${p.success}" data-error-message="${p.error}">
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
                <label for="contact-language">${p.fields.language}</label>
                <select id="contact-language" name="preferredLanguage" required>
                  <option value="">${p.fields.language}</option>
                  ${p.languageOptions.map((item) => `<option>${item}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <label for="contact-topic">${p.fields.topic}</label>
                <select id="contact-topic" name="topic" required>
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
              <div class="form-status" tabindex="-1" hidden data-form-status></div>
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
    <meta property="og:site_name" content="BLYNX AIMA AGENCY">
    <meta property="og:title" content="${p.title}">
    <meta property="og:description" content="${p.description}">
    <meta property="og:url" content="${lang === "es" ? esUrl : enUrl}">
    <meta property="og:locale" content="${lang === "es" ? "es_ES" : "en_US"}">
    <meta property="og:locale:alternate" content="${lang === "es" ? "en_US" : "es_ES"}">
    <meta property="og:image" content="${OG_IMAGE}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
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
          <article class="stage-card">
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
    <title>BLYNX AIMA AGENCY | Local Lead Systems in English & Spanish</title>
    <meta name="description" content="BLYNX builds local lead systems for service businesses: get found on Google, capture qualified leads, and follow up faster. Available in English and Spanish.">
    <link rel="canonical" href="${SITE_URL}/">
    <link rel="alternate" hreflang="en" href="${SITE_URL}/en/start">
    <link rel="alternate" hreflang="es" href="${SITE_URL}/es/start">
    <link rel="alternate" hreflang="x-default" href="${SITE_URL}/">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="BLYNX AIMA AGENCY">
    <meta property="og:title" content="BLYNX AIMA AGENCY | Local Lead Systems in English & Spanish">
    <meta property="og:description" content="BLYNX builds local lead systems for service businesses: get found on Google, capture qualified leads, and follow up faster. Available in English and Spanish.">
    <meta property="og:url" content="${SITE_URL}/">
    <meta property="og:image" content="${OG_IMAGE}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${OG_IMAGE}">
    ${structuredData("en", "BLYNX AIMA AGENCY | Local Lead Systems in English & Spanish", "BLYNX builds local lead systems for service businesses: get found on Google, capture qualified leads, and follow up faster. Available in English and Spanish.", `${SITE_URL}/`)}
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
    <link rel="stylesheet" href="/assets/styles.css">
    <script src="/assets/site.js" defer></script>
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
        <p class="eyebrow">BLYNX AIMA Agency</p>
        <h1>Local Lead Systems for Service Businesses</h1>
        <p>Choose your preferred language to continue.</p>
        <div class="language-actions">
          <a class="btn btn-primary" href="/en/start" data-language-choice="en">English</a>
          <a class="btn btn-secondary" href="/es/start" data-language-choice="es">Español</a>
        </div>
        <p class="language-support">English and Spanish support for local business growth.</p>
        <p class="saved-language" hidden data-saved-language></p>
      </section>
    </main>
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
  write(`${lang}/resources/index.html`, resourcesPage(lang));
}

for (const slug of ["free-audit", "services", "about", "contact", "resources"]) {
  write(`${slug}/index.html`, redirectPage(slug));
}

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
  "resources"
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
  .concat([{ loc: `${SITE_URL}/`, enLoc: `${SITE_URL}/en/start`, esLoc: `${SITE_URL}/es/start` }]);

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapUrls
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${entry.enLoc}"/>
    <xhtml:link rel="alternate" hreflang="es" href="${entry.esLoc}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${entry.enLoc}"/>
  </url>`
  )
  .join("\n")}
</urlset>`;

write("sitemap.xml", sitemapXml);
write(
  "robots.txt",
  `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`
);

console.log("Generated bilingual BLYNX pages.");
