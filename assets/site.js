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

function trackEvent(eventName, data = {}) {
  const safeData = { ...data };
  delete safeData.fullName;
  delete safeData.email;
  delete safeData.phone;
  delete safeData.message;
  delete safeData.websiteUrl;
  delete safeData.googleBusinessProfileLink;

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, safeData);
  }
  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", eventName, safeData);
  }
  if (typeof window.plausible === "function") {
    window.plausible(eventName, { props: safeData });
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...safeData });
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
    link.addEventListener("click", () => {
      trackEvent("free_audit_cta_click");
    });
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

// Google Apps Script Web App (see integrations/google-apps-script.gs):
// appends each lead to the "BLYNX Leads" spreadsheet and emails hello@blynxsystems.com.
const LEAD_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbxQhYyBg_WIMmItlMU_tNusDLgAcpgC0vRtmhzx3ie4kaoR_g044V9nP2bxJm2B0zYp/exec";

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
  if (!LEAD_WEBHOOK_URL) {
    console.log(`BLYNX ${formType} request (no webhook configured yet):`, payload);
    return true;
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
    return response.ok;
  } catch (error) {
    console.error(`BLYNX ${formType} submission failed:`, error);
    return false;
  }
}

async function submitForm(form, formType) {
  if (form.dataset.submitting === "true") return;
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
    trackEvent(formType === "contact" ? "contact_form_submit" : "free_audit_form_submit", {
      formType,
      businessStage: data.businessStage || ""
    });
    form.reset();
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
