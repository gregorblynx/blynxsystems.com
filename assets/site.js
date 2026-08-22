function setStoredPreferredLanguage(language) {
  if (language !== "en" && language !== "es") return;
  localStorage.setItem("preferredLanguage", language);
  localStorage.setItem("blynxPreferredLanguage", language);
}

function getStoredPreferredLanguage() {
  const language = localStorage.getItem("preferredLanguage") || localStorage.getItem("blynxPreferredLanguage");
  return language === "en" || language === "es" ? language : "";
}

function setStoredBusinessStage(stage) {
  if (stage !== "existing" && stage !== "zero") return;
  localStorage.setItem("businessStage", stage);
}

function getStoredBusinessStage() {
  const stage = localStorage.getItem("businessStage");
  return stage === "existing" || stage === "zero" ? stage : "";
}

function pageLanguage() {
  if (document.documentElement.lang === "es" || window.location.pathname.startsWith("/es")) return "es";
  if (document.documentElement.lang === "en" || window.location.pathname.startsWith("/en")) return "en";
  return "";
}

function languageLabel(language) {
  const currentPageLanguage = pageLanguage();
  if (language === "es") return currentPageLanguage === "es" ? "Español" : "Spanish";
  if (language === "en") return currentPageLanguage === "es" ? "Inglés" : "English";
  return "";
}

function populateAuditContextFields(form) {
  const preferredLanguageField = form.querySelector("[data-preferred-language-field]");
  const businessStageField = form.querySelector("[data-business-stage-field]");
  const language = getStoredPreferredLanguage() || pageLanguage();
  const stage = getStoredBusinessStage();

  if (preferredLanguageField && !preferredLanguageField.value) {
    const label = languageLabel(language);
    if (label) preferredLanguageField.value = label;
  }

  if (businessStageField) {
    const defaultStage = businessStageField.dataset.businessStageDefault;
    if (defaultStage === "existing" || defaultStage === "zero") {
      setStoredBusinessStage(defaultStage);
    }
    businessStageField.value = defaultStage || stage || "";
  }
}

// Analytics provider: Google Analytics 4 only (gtag.js is injected in the page <head> by
// scripts/generate-pages.js when GA4_MEASUREMENT_ID is configured). If no Measurement ID is
// configured, gtag is simply absent and every trackEvent call is a no-op — nothing else is
// silently swallowed here.
//
// PII guard: analytics parameters are allow-listed, never denied one by one. Anything not on
// this list is dropped before it can reach GA4, so form values (name, email, phone, message,
// URLs, free text) can never leak into analytics even if a caller passes them by mistake.
const ANALYTICS_PARAM_ALLOWLIST = [
  "formType",
  "businessStage",
  "language",
  "page",
  "stage",
  "slug",
  "from",
  "category",
  "cta_name",
  "cta_target",
  "project_name",
  "project_domain"
];

function analyticsParams(data = {}) {
  const safeData = {};
  ANALYTICS_PARAM_ALLOWLIST.forEach((key) => {
    const value = data[key];
    if (value === undefined || value === null || value === "") return;
    safeData[key] = typeof value === "string" ? value.slice(0, 100) : value;
  });
  return safeData;
}

function trackEvent(eventName, data = {}) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, {
    page: window.location.pathname,
    language: pageLanguage() || "unknown",
    ...analyticsParams(data)
  });
}

(function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-site-nav]");
  const params = new URLSearchParams(window.location.search);
  const stageFromQuery = params.get("stage");
  if (stageFromQuery === "existing" || stageFromQuery === "zero") {
    setStoredBusinessStage(stageFromQuery);
  }

  const savedLanguage = getStoredPreferredLanguage();
  const savedLanguageNotice = document.querySelector("[data-saved-language]");
  const stageBanner = document.querySelector("[data-stage-banner]");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        document.body.classList.remove("menu-open");
      });
    });
  }

  if (header) {
    const syncHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
  }

  document.querySelectorAll("[data-language-choice]").forEach((choice) => {
    choice.addEventListener("click", () => {
      setStoredPreferredLanguage(choice.dataset.languageChoice);
      trackEvent("language_switch", { language: choice.dataset.languageChoice });
    });
  });

  document.querySelectorAll("[data-language-switch]").forEach((switchLink) => {
    switchLink.addEventListener("click", () => {
      setStoredPreferredLanguage(switchLink.dataset.languageSwitch);
      trackEvent("language_switch", { language: switchLink.dataset.languageSwitch });
    });
  });

  document.querySelectorAll("[data-stage-choice]").forEach((stageChoice) => {
    stageChoice.addEventListener("click", () => {
      setStoredBusinessStage(stageChoice.dataset.stageChoice);
      trackEvent("starting_point_click", { stage: stageChoice.dataset.stageChoice });
    });
  });

  document.querySelectorAll("[data-analytics-event]").forEach((element) => {
    element.addEventListener("click", () => {
      trackEvent(element.dataset.analyticsEvent);
    });
  });

  document.querySelectorAll('a[href*="free-audit"]').forEach((link) => {
    // Skip links that already declare their own event, otherwise they would report twice.
    if (link.hasAttribute("data-analytics-event")) return;
    link.addEventListener("click", () => {
      trackEvent("free_audit_cta_click");
    });
  });

  // Primary CTA clicks and outbound project clicks are tracked by delegation so no markup
  // has to change. A link is reported as exactly one of the two, never both.
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!target || typeof target.closest !== "function") return;
    const link = target.closest("a[href]");
    if (!link) return;

    const projectCard = link.closest(".project-card");
    const isExternal = link.hostname && link.hostname !== window.location.hostname;

    if (projectCard && isExternal) {
      const projectName = projectCard.querySelector(".project-name");
      trackEvent("project_outbound_click", {
        project_name: projectName ? projectName.textContent.trim() : "",
        project_domain: link.hostname
      });
      return;
    }

    if (link.classList.contains("btn-primary")) {
      trackEvent("primary_cta_click", {
        cta_name: link.textContent.trim().replace(/\s+/g, " "),
        cta_target: link.getAttribute("href") || ""
      });
    }
  });

  if (savedLanguageNotice && (savedLanguage === "en" || savedLanguage === "es")) {
    savedLanguageNotice.hidden = false;
    savedLanguageNotice.textContent =
      savedLanguage === "en"
        ? "Saved preference: English. Choose a language below to continue or change it."
        : "Preferencia guardada: Español. Elige un idioma abajo para continuar o cambiarlo.";
  }

  if (stageBanner) {
    const stage = getStoredBusinessStage();
    const message = stage === "existing" ? stageBanner.dataset.existingMessage : stage === "zero" ? stageBanner.dataset.zeroMessage : "";
    if (message) {
      stageBanner.textContent = message;
      stageBanner.hidden = false;
    }
  }

  document.querySelectorAll("form").forEach((form) => {
    populateAuditContextFields(form);
    form.querySelectorAll("[data-flexible-url]").forEach((field) => {
      field.addEventListener("input", () => {
        field.setCustomValidity(isValidFlexibleUrl(field.value) ? "" : flexibleUrlErrorMessage());
      });
    });
    let hasStarted = false;
    form.addEventListener("focusin", () => {
      if (hasStarted) return;
      hasStarted = true;
      const isAudit = String(form.getAttribute("onsubmit") || "").includes("handleAuditSubmit");
      if (isAudit) trackEvent("free_audit_form_start");
    });
  });
})();

(function () {
  const article = document.querySelector("[data-blog-article]");
  if (article) {
    trackEvent("blog_article_view", {
      slug: article.dataset.blogArticle,
      category: article.dataset.blogCategory || ""
    });
  }

  document.querySelectorAll("[data-blog-cta]").forEach((cta) => {
    cta.addEventListener("click", () => {
      trackEvent("blog_cta_click", {
        slug: article ? article.dataset.blogArticle : "blog-index"
      });
    });
  });

  document.querySelectorAll("[data-related-article]").forEach((link) => {
    link.addEventListener("click", () => {
      trackEvent("related_article_click", {
        slug: link.dataset.relatedArticle,
        from: article ? article.dataset.blogArticle : ""
      });
    });
  });

  const filterButtons = document.querySelectorAll("[data-blog-filter]");
  const blogCards = document.querySelectorAll("[data-blog-card]");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.blogFilter;
      filterButtons.forEach((other) => {
        other.classList.toggle("is-active", other === button);
        other.setAttribute("aria-pressed", String(other === button));
      });
      blogCards.forEach((card) => {
        card.hidden = category !== "all" && card.dataset.blogCategory !== category;
      });
      trackEvent("blog_category_filter", { category });
    });
  });
})();

// Lead endpoint: Google Apps Script Web App (see integrations/google-apps-script.gs), which
// appends each lead to the "BLYNX Leads" spreadsheet and emails hello@blynxsystems.com.
//
// The URL is NOT hardcoded here. It is injected into every page as window.BLYNX_CONFIG by
// scripts/generate-pages.js, which reads the LEAD_WEBHOOK_URL environment variable at build
// time. Redeploying the Apps Script Web App therefore only requires updating one environment
// variable and rebuilding — no source edit, no risk of the endpoint drifting between files.
const SITE_CONFIG = window.BLYNX_CONFIG || {};
const LEAD_WEBHOOK_URL = SITE_CONFIG.leadWebhookUrl || "";

function sanitizeValue(value) {
  if (Array.isArray(value)) return value.map(sanitizeValue);
  return String(value).replace(/[<>]/g, "").trim();
}

function buildFlexibleUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  return /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isValidFlexibleUrl(value) {
  const candidate = buildFlexibleUrl(value);
  if (!candidate) return true;

  try {
    const url = new URL(candidate);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      !/\s/.test(candidate) &&
      (url.hostname.includes(".") || url.hostname === "localhost")
    );
  } catch (error) {
    return false;
  }
}

function flexibleUrlErrorMessage() {
  return pageLanguage() === "es"
    ? "Escribe una URL válida, por ejemplo cleaner.com, www.cleaner.com o https://cleaner.com."
    : "Enter a valid URL, for example cleaner.com, www.cleaner.com, or https://cleaner.com.";
}

function validateFlexibleUrlFields(form) {
  const fields = form.querySelectorAll("[data-flexible-url]");
  let isValid = true;

  fields.forEach((field) => {
    field.setCustomValidity("");
    if (!isValidFlexibleUrl(field.value)) {
      field.setCustomValidity(flexibleUrlErrorMessage());
      isValid = false;
    }
  });

  return isValid;
}

function formToObject(form) {
  const formData = new FormData(form);
  const data = {};
  const urlFields = new Set(["websiteUrl", "googleBusinessProfileLink", "additionalUrl"]);

  for (const [key, value] of formData.entries()) {
    const sanitizedValue = sanitizeValue(urlFields.has(key) ? buildFlexibleUrl(value) : value);
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      data[key] = Array.isArray(data[key]) ? data[key].concat(sanitizedValue) : [data[key], sanitizedValue];
    } else {
      data[key] = sanitizedValue;
    }
  }

  return data;
}

function showFormSuccess(form, message) {
  const status = form.querySelector("[data-form-status]");
  if (!status) return;

  status.classList.remove("is-error");
  status.textContent = message;
  status.hidden = false;
  status.focus();
}

function showFormError(form, message) {
  const status = form.querySelector("[data-form-status]");
  if (!status) return;

  status.classList.add("is-error");
  status.textContent = message;
  status.hidden = false;
  status.focus();
}

async function submitLead(formType, payload) {
  // Fail closed. A missing endpoint means the lead cannot be stored anywhere, so the visitor
  // must see the error state (which offers the direct email address) instead of a success
  // message for a lead that was never captured. Never report success we cannot verify.
  if (!LEAD_WEBHOOK_URL) {
    console.error("BLYNX lead endpoint is not configured (window.BLYNX_CONFIG.leadWebhookUrl is empty).");
    return false;
  }

  try {
    // Content-Type is text/plain (not application/json) on purpose: Google Apps Script Web
    // Apps don't handle CORS preflight requests, and a JSON content type would trigger one.
    // text/plain is a CORS-safelisted content type, so the browser sends this as a simple
    // request. Apps Script still reads the raw body and JSON.parses it server-side.
    const response = await fetch(LEAD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ formType, submittedAt: new Date().toISOString(), ...payload })
    });

    if (!response.ok) {
      // Status only — never the payload, which holds the visitor's personal data.
      console.error(`BLYNX lead submission rejected by the endpoint (HTTP ${response.status}).`);
      return false;
    }

    // The Apps Script Web App answers HTTP 200 even when it refuses the submission, returning
    // {"result":"error"} in the body (missing fields, invalid email, script exception). Trusting
    // response.ok alone would show a success message for a lead that was never stored.
    const body = await response.text();
    let result;
    try {
      result = JSON.parse(body);
    } catch (parseError) {
      // Endpoint reachable but the body is not the JSON contract we expect (for example an
      // HTML sign-in or error page from Google). Treat that as a failure, not a success.
      console.error("BLYNX lead endpoint returned an unexpected non-JSON response.");
      return false;
    }

    if (result && result.result === "success") return true;

    console.error(
      `BLYNX lead endpoint reported an error: ${(result && result.message) || "unknown reason"}`
    );
    return false;
  } catch (error) {
    // Network failure, CORS failure or offline. Log the reason, never the payload.
    console.error(`BLYNX lead submission failed to reach the endpoint: ${error && error.message}`);
    return false;
  }
}

async function submitForm(form, formType) {
  // In-flight guard (double click) and post-success guard (already captured).
  if (form.dataset.submitting === "true" || form.dataset.submitted === "true") return;
  validateFlexibleUrlFields(form);
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const honeypot = form.querySelector('input[name="companyWebsiteExtra"]');
  if (honeypot && honeypot.value) {
    showFormSuccess(form, form.dataset.successMessage || "Thank you. Your request has been received.");
    form.reset();
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton ? submitButton.textContent : "";
  form.dataset.submitting = "true";
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = form.dataset.loadingLabel || originalButtonText;
  }

  const data = formToObject(form);
  const ok = await submitLead(formType, data);

  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
  form.dataset.submitting = "false";

  if (ok) {
    showFormSuccess(
      form,
      form.dataset.successMessage || "Thank you. Your request has been received."
    );
    // Conversion events fire only here — after the backend has confirmed the lead was stored.
    trackEvent(formType === "contact" ? "contact_form_submit" : "free_audit_submit", {
      formType,
      businessStage: data.businessStage || ""
    });
    form.reset();
    // Duplicate protection after a confirmed submission: the lead is already stored, so keep
    // the submit button disabled instead of letting an impatient second click send it twice.
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-disabled", "true");
    }
    form.dataset.submitted = "true";
  } else {
    showFormError(
      form,
      form.dataset.errorMessage || "Something went wrong sending your request. Please try again."
    );
  }
}

function handleAuditSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  populateAuditContextFields(form);
  submitForm(form, "free audit");
}

function handleContactSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  submitForm(form, "contact");
}
