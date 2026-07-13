const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(root, "content", "blog");
const WORDS_PER_MINUTE = 220;

const CATEGORIES = {
  "get-found": { en: "Get Found", es: "Ser Encontrado" },
  "build-trust": { en: "Build Trust", es: "Generar Confianza" },
  "capture-leads": { en: "Capture Leads", es: "Capturar Oportunidades" },
  "follow-up": { en: "Follow-Up", es: "Seguimiento" },
  "local-business-systems": { en: "Local Business Systems", es: "Sistemas para Negocios Locales" }
};

function parseFrontmatter(raw, file) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`Missing frontmatter block in ${file}`);
  }
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (/^(true|false)$/i.test(value)) value = value.toLowerCase() === "true";
    meta[key] = value;
  }
  return { meta, body: match[2].trim() };
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderInline(text) {
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

// Supports the subset of Markdown used by BLYNX articles:
// ## / ### headings, paragraphs, - lists, 1. lists, **bold**, *italic*, [text](url).
function renderMarkdown(markdown) {
  const blocks = [];
  let paragraph = [];
  let listType = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };
  const closeList = () => {
    if (listType) {
      blocks.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      closeList();
      continue;
    }
    const h3 = line.match(/^###\s+(.+)$/);
    const h2 = line.match(/^##\s+(.+)$/);
    const unordered = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);

    if (h3) {
      flushParagraph();
      closeList();
      blocks.push(`<h3>${renderInline(h3[1])}</h3>`);
    } else if (h2) {
      flushParagraph();
      closeList();
      blocks.push(`<h2>${renderInline(h2[1])}</h2>`);
    } else if (unordered) {
      flushParagraph();
      if (listType !== "ul") {
        closeList();
        blocks.push("<ul>");
        listType = "ul";
      }
      blocks.push(`<li>${renderInline(unordered[1])}</li>`);
    } else if (ordered) {
      flushParagraph();
      if (listType !== "ol") {
        closeList();
        blocks.push("<ol>");
        listType = "ol";
      }
      blocks.push(`<li>${renderInline(ordered[1])}</li>`);
    } else {
      paragraph.push(line);
    }
  }
  flushParagraph();
  closeList();
  return blocks.join("\n");
}

function readingTimeMinutes(markdown) {
  const words = markdown
    .replace(/[#*\-\[\]()]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function formatDate(isoDate, lang) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  });
}

function loadArticles(lang) {
  const dir = path.join(CONTENT_DIR, lang);
  if (!fs.existsSync(dir)) return [];

  const articles = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { meta, body } = parseFrontmatter(raw, `content/blog/${lang}/${file}`);
      const slug = path.basename(file, ".md");

      for (const field of ["title", "description", "publicationDate", "category", "heroImage", "heroImageAlt"]) {
        if (!meta[field]) throw new Error(`Missing "${field}" in content/blog/${lang}/${file}`);
      }
      if (!CATEGORIES[meta.category]) {
        throw new Error(`Unknown category "${meta.category}" in content/blog/${lang}/${file}`);
      }

      return {
        slug,
        locale: lang,
        title: meta.title,
        description: meta.description,
        publicationDate: meta.publicationDate,
        updatedDate: meta.updatedDate || "",
        author: meta.author || "BLYNX",
        category: meta.category,
        categoryLabel: CATEGORIES[meta.category][lang] || CATEGORIES[meta.category].en,
        tags: (meta.tags || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        heroImage: meta.heroImage,
        heroImageAlt: meta.heroImageAlt,
        featured: meta.featured === true,
        readingTime: readingTimeMinutes(body),
        contentHtml: renderMarkdown(body),
        wordCount: body.split(/\s+/).filter(Boolean).length
      };
    })
    .sort((a, b) => (a.publicationDate < b.publicationDate ? 1 : -1));

  const slugs = new Set();
  for (const article of articles) {
    if (slugs.has(article.slug)) throw new Error(`Duplicate blog slug: ${article.slug}`);
    slugs.add(article.slug);
  }
  return articles;
}

module.exports = { loadArticles, formatDate, CATEGORIES };
