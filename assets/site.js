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
    });
  });

  document.querySelectorAll("[data-language-switch]").forEach((switchLink) => {
    switchLink.addEventListener("click", () => {
      setStoredPreferredLanguage(switchLink.dataset.languageSwitch);
    });
  });

  document.querySelectorAll("[data-stage-choice]").forEach((stageChoice) => {
    stageChoice.addEventListener("click", () => {
      setStoredBusinessStage(stageChoice.dataset.stageChoice);
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
  });
})();

// TODO: set this to the live endpoint that should receive lead submissions
// (a Google Apps Script Web App URL, n8n/Make/Zapier webhook, or a custom API
// route — see integrations/google-apps-script.gs). Leave empty to keep
// logging submissions to the console only.
const LEAD_WEBHOOK_URL = "";

function formToObject(form) {
  const formData = new FormData(form);
  const data = {};

  for (const [key, value] of formData.entries()) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      data[key] = Array.isArray(data[key]) ? data[key].concat(value) : [data[key], value];
    } else {
      data[key] = value;
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
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;

  const data = formToObject(form);
  const ok = await submitLead(formType, data);

  if (submitButton) submitButton.disabled = false;

  if (ok) {
    showFormSuccess(
      form,
      form.dataset.successMessage || "Thank you. Your request has been received."
    );
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
