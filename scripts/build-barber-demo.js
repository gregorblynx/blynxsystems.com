// Genera el demo standalone "THE FADE ROOM" (EN + ES).
// Es un DEMO de BLYNX — marca ficticia, contenido ilustrativo. Estética propia
// (clásico premium: negro + latón, cuero y madera), centrada en reservar cita.
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

const SHOP = { phone: "(555) 014-2200", address: "118 Main Street · Downtown", rating: "4.9", reviews: "212" };

const C = {
  en: {
    lang: "en",
    self: "/demos/barber",
    other: "/demos/barber/es",
    title: "THE FADE ROOM — Classic Barbershop | Book Your Cut (Demo)",
    desc: "THE FADE ROOM — a classic barbershop offering precision cuts, beard work and hot towel shaves. Book your appointment online. (Demo site by BLYNX Systems.)",
    ribbon: "Demo site built by BLYNX Systems",
    ribbonCta: "See who built this",
    nav: { services: "Services", prices: "Prices", shop: "The Shop", reviews: "Reviews", book: "Book a chair" },
    hero: {
      badge: "Open today · Walk-ins welcome",
      h1a: "Look sharp.",
      h1b: "Feel sharp.",
      sub: "Precision cuts, clean fades, and classic hot towel shaves — booked in under a minute.",
      cta: "Book your appointment",
      cta2: "See prices"
    },
    quick: [["Open today", "9am – 7pm"], [`${SHOP.rating} ★`, `${SHOP.reviews} reviews`], ["Walk-ins", "Welcome"], ["Downtown", "Free parking"]],
    servicesTitle: "The cut you came for.",
    servicesSub: "Every service finished with a hot towel and a straight-razor neck line.",
    services: [
      ["Haircut", "Classic cut, fade or scissor work, finished clean.", "$30", "30 min"],
      ["Haircut + Beard", "Full cut paired with a shaped, lined-up beard.", "$45", "50 min"],
      ["Beard Trim & Shape", "Shaped, lined and conditioned with hot towel.", "$20", "20 min"],
      ["Hot Towel Shave", "Traditional straight-razor shave, start to finish.", "$35", "40 min"],
      ["Line-Up / Edge-Up", "Sharp edges between cuts. In and out.", "$15", "15 min"],
      ["Kids Cut (12 & under)", "Patient, quick and done right.", "$22", "25 min"]
    ],
    bandLine: "No rushed fades. No “good enough.” Just your best cut, every time.",
    craftTitle: "Old-school craft. Modern precision.",
    craftCopy: "Straight razors, hot towels and clippers that never rush a fade. Our barbers cut with the patience the old shops had — and the precision you expect today.",
    craft: [
      "Licensed, experienced barbers",
      "Hot towel finish on every service",
      "Straight-razor neck and edge work",
      "Clean shop, sanitized tools, every chair"
    ],
    howTitle: "Booking takes 60 seconds.",
    how: [
      ["01", "Pick your service", "Choose the cut, beard work or shave you want."],
      ["02", "Pick your time", "See what's open and grab the chair that fits your day."],
      ["03", "Get confirmed", "You get an instant confirmation — and a reminder before your cut."]
    ],
    reviewsTitle: "What the chair says",
    reviewsNote: "Sample reviews — demo content.",
    reviews: [
      ["“Best fade in town, hands down. Booked online in a minute and was in the chair on time.”", "Sample customer"],
      ["“They actually listen. First shop in years that got my beard shape right the first try.”", "Sample customer"],
      ["“Old-school hot towel shave. Felt like a reset button. Bringing my son next week.”", "Sample customer"]
    ],
    bookTitle: "Grab your chair.",
    bookSub: "Book online anytime — or walk in and we'll fit you in when we can.",
    form: {
      name: "Your name",
      phone: "Phone number",
      service: "Service",
      serviceOpts: ["Haircut — $30", "Haircut + Beard — $45", "Beard Trim & Shape — $20", "Hot Towel Shave — $35", "Line-Up / Edge-Up — $15", "Kids Cut — $22"],
      when: "Preferred day",
      whenOpts: ["Today", "Tomorrow", "This week", "Next week"],
      time: "Preferred time",
      timeOpts: ["Morning", "Afternoon", "Evening"],
      submit: "Book my appointment",
      note: "Demo form — on a real site this books the chair and texts a confirmation.",
      ok: "You're booked! On a real THE FADE ROOM site, you'd now get a text confirmation and a reminder before your cut. (This is a demo.)"
    },
    visitTitle: "Visit the shop",
    hoursTitle: "Hours",
    hours: [["Mon – Fri", "9am – 7pm"], ["Saturday", "9am – 5pm"], ["Sunday", "Closed"]],
    findTitle: "Find us",
    footNote: "THE FADE ROOM is a fictional brand created as a demonstration. All content, prices and reviews are illustrative.",
    builtBy: "Demo designed & built by"
  },
  es: {
    lang: "es",
    self: "/demos/barber/es",
    other: "/demos/barber",
    title: "THE FADE ROOM — Barbería Clásica | Reserva tu Corte (Demo)",
    desc: "THE FADE ROOM — una barbería clásica con cortes de precisión, trabajo de barba y afeitados con toalla caliente. Reserva tu cita en línea. (Sitio demo de BLYNX Systems.)",
    ribbon: "Sitio demo creado por BLYNX Systems",
    ribbonCta: "Ver quién lo construyó",
    nav: { services: "Servicios", prices: "Precios", shop: "La Barbería", reviews: "Reseñas", book: "Reservar silla" },
    hero: {
      badge: "Abierto hoy · Sin cita también",
      h1a: "Luce impecable.",
      h1b: "Siéntete impecable.",
      sub: "Cortes de precisión, fades limpios y afeitados clásicos con toalla caliente — reserva en menos de un minuto.",
      cta: "Reserva tu cita",
      cta2: "Ver precios"
    },
    quick: [["Abierto hoy", "9am – 7pm"], [`${SHOP.rating} ★`, `${SHOP.reviews} reseñas`], ["Sin cita", "Bienvenido"], ["Centro", "Parking gratis"]],
    servicesTitle: "El corte que viniste a buscar.",
    servicesSub: "Cada servicio termina con toalla caliente y perfilado a navaja.",
    services: [
      ["Corte de cabello", "Corte clásico, fade o tijera, terminado limpio.", "$30", "30 min"],
      ["Corte + Barba", "Corte completo con barba perfilada y definida.", "$45", "50 min"],
      ["Perfilado de Barba", "Definida, perfilada y acondicionada con toalla caliente.", "$20", "20 min"],
      ["Afeitado con Toalla Caliente", "Afeitado tradicional a navaja, de principio a fin.", "$35", "40 min"],
      ["Perfilado / Line-Up", "Bordes definidos entre cortes. Rápido y listo.", "$15", "15 min"],
      ["Corte Niños (12 y menores)", "Con paciencia, rápido y bien hecho.", "$22", "25 min"]
    ],
    bandLine: "Sin fades apurados. Sin “ya está bien”. Solo tu mejor corte, siempre.",
    craftTitle: "Oficio de siempre. Precisión de hoy.",
    craftCopy: "Navajas, toallas calientes y máquinas que nunca apuran un fade. Nuestros barberos cortan con la paciencia de las barberías de antes — y la precisión que esperas hoy.",
    craft: [
      "Barberos con licencia y experiencia",
      "Toalla caliente en cada servicio",
      "Perfilado de cuello y bordes a navaja",
      "Barbería limpia y herramientas sanitizadas"
    ],
    howTitle: "Reservar toma 60 segundos.",
    how: [
      ["01", "Elige tu servicio", "Escoge el corte, el trabajo de barba o el afeitado que quieres."],
      ["02", "Elige tu horario", "Mira lo disponible y toma la silla que encaje con tu día."],
      ["03", "Recibe confirmación", "Te llega confirmación al instante — y un recordatorio antes de tu corte."]
    ],
    reviewsTitle: "Lo que dicen desde la silla",
    reviewsNote: "Reseñas de muestra — contenido demo.",
    reviews: [
      ["“El mejor fade de la ciudad, sin duda. Reservé en un minuto y entré a la silla a tiempo.”", "Cliente de muestra"],
      ["“De verdad escuchan. La primera barbería en años que me dejó la barba bien al primer intento.”", "Cliente de muestra"],
      ["“Afeitado con toalla caliente de los de antes. Como apretar el botón de reinicio. Vuelvo con mi hijo.”", "Cliente de muestra"]
    ],
    bookTitle: "Aparta tu silla.",
    bookSub: "Reserva en línea cuando quieras — o llega sin cita y te acomodamos en cuanto podamos.",
    form: {
      name: "Tu nombre",
      phone: "Teléfono",
      service: "Servicio",
      serviceOpts: ["Corte de cabello — $30", "Corte + Barba — $45", "Perfilado de Barba — $20", "Afeitado con Toalla Caliente — $35", "Perfilado / Line-Up — $15", "Corte Niños — $22"],
      when: "Día preferido",
      whenOpts: ["Hoy", "Mañana", "Esta semana", "La próxima semana"],
      time: "Horario preferido",
      timeOpts: ["Mañana", "Tarde", "Noche"],
      submit: "Reservar mi cita",
      note: "Formulario demo — en un sitio real esto reserva la silla y envía confirmación por mensaje.",
      ok: "¡Reservado! En un sitio real de THE FADE ROOM, ahora recibirías confirmación por mensaje y un recordatorio antes de tu corte. (Esto es un demo.)"
    },
    visitTitle: "Visita la barbería",
    hoursTitle: "Horario",
    hours: [["Lun – Vie", "9am – 7pm"], ["Sábado", "9am – 5pm"], ["Domingo", "Cerrado"]],
    findTitle: "Encuéntranos",
    footNote: "THE FADE ROOM es una marca ficticia creada como demostración. Todo el contenido, precios y reseñas son ilustrativos.",
    builtBy: "Demo diseñado y construido por"
  }
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function render(t) {
  const svc = (s) => `<article class="svc">
      <div class="svc-head"><h3>${esc(s[0])}</h3><span class="svc-price">${esc(s[2])}</span></div>
      <p>${esc(s[1])}</p>
      <span class="svc-time">${esc(s[3])}</span>
    </article>`;
  const stepC = (s) => `<div class="step"><span class="step-n">${esc(s[0])}</span><h4>${esc(s[1])}</h4><p>${esc(s[2])}</p></div>`;
  const rev = (r) => `<figure class="rev"><div class="stars" aria-hidden="true">★★★★★</div><blockquote>${esc(r[0])}</blockquote><figcaption>— ${esc(r[1])}</figcaption></figure>`;
  const hr = (h) => `<div class="hrow"><span>${esc(h[0])}</span><b>${esc(h[1])}</b></div>`;
  const quick = (q) => `<div class="q"><b>${esc(q[0])}</b><span>${esc(q[1])}</span></div>`;

  return `<!doctype html>
<html lang="${t.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t.title)}</title>
<meta name="description" content="${esc(t.desc)}">
<meta name="robots" content="noindex">
<meta property="og:title" content="${esc(t.title)}">
<meta property="og:description" content="${esc(t.desc)}">
<meta property="og:image" content="https://www.blynxsystems.com/public/images/demos/barber-hero.jpg">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0b0907;--bg2:#12100c;--card:#191510;--line:rgba(226,200,150,.16);--txt:#f3ece0;--mut:#a89b86;--brass:#c8a253;--brass2:#e6c88b;--deep:#080706}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--txt);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}
a{color:inherit;text-decoration:none}
.wrap{width:min(100% - 2rem,1140px);margin-inline:auto}
h1,h2,h3,h4{font-family:Georgia,"Times New Roman",serif;line-height:1.12;font-weight:700}
.sc{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;text-transform:uppercase;letter-spacing:.22em;font-size:.72rem;font-weight:800;color:var(--brass)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;font-weight:700;border-radius:2px;padding:.95rem 1.7rem;font-size:.95rem;cursor:pointer;border:1px solid transparent;transition:all .2s ease;letter-spacing:.04em;text-transform:uppercase}
.btn-brass{background:linear-gradient(160deg,var(--brass2),var(--brass));color:#20180a;box-shadow:0 8px 26px rgba(200,162,83,.28)}
.btn-brass:hover{filter:brightness(1.08);transform:translateY(-1px)}
.btn-out{border-color:var(--line);color:var(--txt)}
.btn-out:hover{border-color:var(--brass);color:var(--brass2)}
section{padding:5.5rem 0}
.head{max-width:640px;margin-bottom:3rem}
.head h2{font-size:clamp(2rem,4.4vw,2.9rem);margin:.7rem 0}
.head p{color:var(--mut);font-size:1.05rem}
.rule{width:52px;height:2px;background:var(--brass);margin-bottom:1.4rem}
/* ribbon */
.ribbon{background:var(--deep);border-bottom:1px solid var(--line);color:var(--brass2);font-size:.78rem;text-align:center;padding:.55rem 1rem;letter-spacing:.04em}
.ribbon a{color:var(--brass);text-decoration:underline;font-weight:700}
/* nav */
header.nav{position:sticky;top:0;z-index:50;background:rgba(11,9,7,.93);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.navrow{display:flex;align-items:center;gap:1.4rem;padding:1rem 0}
.logo{font-family:Georgia,serif;font-size:1.3rem;letter-spacing:.06em}
.logo b{color:var(--brass2)}
.logo small{display:block;font-family:-apple-system,sans-serif;font-size:.58rem;letter-spacing:.34em;color:var(--mut);text-transform:uppercase;margin-top:.15rem}
.navlinks{display:flex;gap:1.5rem;margin-left:auto;font-size:.82rem;text-transform:uppercase;letter-spacing:.1em;font-weight:600}
.navlinks a{color:var(--mut)}.navlinks a:hover{color:var(--brass2)}
.navcta{display:flex;align-items:center;gap:.9rem}
.lang{font-size:.72rem;letter-spacing:.08em;color:var(--mut);border:1px solid var(--line);padding:.3rem .55rem}
.lang a.on{color:var(--brass2);font-weight:800}
@media(max-width:940px){.navlinks{display:none}}
/* hero */
.hero{position:relative;min-height:86vh;display:flex;align-items:center;overflow:hidden}
.hero-bg{position:absolute;inset:0}
.hero-bg img{width:100%;height:100%;object-fit:cover}
.hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,7,6,.95) 0%,rgba(8,7,6,.78) 48%,rgba(8,7,6,.42) 100%)}
.hero-in{position:relative;z-index:2;padding:5rem 0;max-width:640px}
.hbadge{display:inline-flex;align-items:center;gap:.5rem;border:1px solid var(--line);color:var(--brass2);font-size:.76rem;letter-spacing:.1em;text-transform:uppercase;padding:.42rem .9rem;font-weight:700}
.hbadge::before{content:"";width:.45rem;height:.45rem;border-radius:999px;background:#7fd69a;box-shadow:0 0 10px #7fd69a}
.hero h1{font-size:clamp(2.7rem,6.4vw,4.6rem);margin:1.4rem 0 1rem}
.hero h1 em{display:block;font-style:italic;color:var(--brass2)}
.hero p.sub{color:#e4dbcc;font-size:clamp(1.02rem,1.9vw,1.2rem);max-width:46ch}
.hero-cta{display:flex;gap:.8rem;flex-wrap:wrap;margin-top:2.2rem}
/* quick bar */
.qbar{background:var(--bg2);border-block:1px solid var(--line)}
.qbar .wrap{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;padding:1.6rem 0}
.q{text-align:center;border-right:1px solid var(--line)}
.q:last-child{border-right:0}
.q b{display:block;font-family:Georgia,serif;font-size:1.25rem;color:var(--brass2)}
.q span{color:var(--mut);font-size:.82rem}
/* services */
.svcs{display:grid;grid-template-columns:repeat(2,1fr);gap:0}
.svc{border-top:1px solid var(--line);padding:1.5rem 0;padding-right:2.5rem}
.svc:nth-child(2n){padding-right:0;padding-left:2.5rem;border-left:1px solid var(--line)}
.svc-head{display:flex;align-items:baseline;gap:1rem}
.svc-head h3{font-size:1.28rem}
.svc-price{margin-left:auto;font-family:Georgia,serif;font-size:1.4rem;color:var(--brass2)}
.svc p{color:var(--mut);font-size:.94rem;margin:.35rem 0 .5rem}
.svc-time{font-size:.74rem;text-transform:uppercase;letter-spacing:.12em;color:#8a7f6d}
.svc-note{margin-top:2.4rem;color:var(--mut);font-size:.86rem;font-style:italic}
/* craft */
.craft{background:var(--bg2)}
.craft-in{display:grid;grid-template-columns:.95fr 1.05fr;gap:3rem;align-items:center}
.craft-img{position:relative;border:1px solid var(--line)}
.craft-img img{height:clamp(360px,46vw,520px);object-fit:cover}
.craft-img::after{content:"";position:absolute;inset:10px;border:1px solid rgba(226,200,150,.22);pointer-events:none}
/* band */
.band{position:relative;height:clamp(240px,32vw,380px);overflow:hidden;border-block:1px solid var(--line)}
.band img{width:100%;height:100%;object-fit:cover;object-position:center 40%}
.band::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,7,6,.86),rgba(8,7,6,.25) 55%,rgba(8,7,6,.7))}
.band-txt{position:absolute;inset:0;z-index:2;display:flex;align-items:center}
.band-txt p{font-family:Georgia,serif;font-size:clamp(1.3rem,3vw,2.1rem);font-style:italic;color:var(--brass2);max-width:22ch;line-height:1.3}
.craft ul{list-style:none;display:grid;gap:.85rem;margin-top:1.6rem}
.craft li{display:flex;gap:.8rem;align-items:flex-start;font-size:1rem}
.craft li::before{content:"✦";color:var(--brass);flex:0 0 auto}
/* how */
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem}
.step{border-top:2px solid var(--brass);padding-top:1.2rem}
.step-n{font-family:Georgia,serif;font-size:1.5rem;color:var(--brass2)}
.step h4{font-size:1.24rem;margin:.35rem 0 .5rem}
.step p{color:var(--mut);font-size:.95rem}
/* reviews */
.reviews{background:var(--bg2)}
.revs{display:grid;grid-template-columns:repeat(3,1fr);gap:1.4rem}
.rev{background:var(--card);border:1px solid var(--line);padding:1.6rem;position:relative}
.stars{color:var(--brass);letter-spacing:.2em;font-size:.86rem;margin-bottom:.8rem}
.rev blockquote{font-family:Georgia,serif;font-size:1.02rem;line-height:1.6;color:#ebe3d5}
.rev figcaption{margin-top:1rem;color:var(--mut);font-size:.84rem;text-transform:uppercase;letter-spacing:.08em}
.revnote{color:var(--mut);font-size:.8rem;font-style:italic;margin-top:1.4rem}
/* booking */
.book{background:linear-gradient(180deg,var(--bg),#17110a)}
.book-in{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:start}
.book h2{font-size:clamp(2rem,4.6vw,3rem);margin:.7rem 0}
.book-side p{color:var(--mut);margin-bottom:2rem}
.visit{border:1px solid var(--line);padding:1.4rem;background:rgba(0,0,0,.25)}
.visit h3{font-size:1.05rem;margin-bottom:.9rem;letter-spacing:.02em}
.hrow{display:flex;justify-content:space-between;padding:.45rem 0;border-bottom:1px solid rgba(226,200,150,.1);font-size:.92rem}
.hrow:last-child{border-bottom:0}
.hrow b{color:var(--brass2);font-weight:600}
.addr{margin-top:1.2rem;color:var(--mut);font-size:.92rem;line-height:1.7}
.addr a{color:var(--brass2)}
form.bk{background:var(--card);border:1px solid var(--line);padding:1.8rem;display:grid;gap:.85rem}
form.bk input,form.bk select{width:100%;background:var(--bg);border:1px solid var(--line);border-radius:2px;padding:.9rem 1rem;color:var(--txt);font-size:.98rem;font-family:inherit}
form.bk input::placeholder{color:#776d5d}
form.bk .row2{display:grid;grid-template-columns:1fr 1fr;gap:.85rem}
.bknote{color:var(--mut);font-size:.78rem;text-align:center}
.bkok{display:none;border:1px solid var(--brass);background:rgba(200,162,83,.1);color:var(--brass2);padding:1.1rem;text-align:center;font-weight:600}
/* footer */
footer.f{background:var(--deep);border-top:1px solid var(--line);padding:2.6rem 0}
.f-top{display:flex;justify-content:space-between;gap:1.4rem;flex-wrap:wrap;align-items:center}
.built a{color:var(--brass2);text-decoration:underline;font-weight:700}
.f-note{color:#7d7364;font-size:.78rem;margin-top:1.6rem;border-top:1px solid rgba(226,200,150,.1);padding-top:1.3rem}
@media(max-width:900px){.svcs{grid-template-columns:1fr}.svc:nth-child(2n){padding-left:0;border-left:0}.craft-in,.book-in{grid-template-columns:1fr}.steps,.revs{grid-template-columns:1fr}.qbar .wrap{grid-template-columns:1fr 1fr}.q:nth-child(2n){border-right:0}.craft-img{order:-1}}
</style>
</head>
<body>
<div class="ribbon">${esc(t.ribbon)} · <a href="https://www.blynxsystems.com" target="_blank" rel="noopener">${esc(t.ribbonCta)} →</a></div>

<header class="nav"><div class="wrap navrow">
  <div class="logo">THE <b>FADE</b> ROOM<small>Barbershop</small></div>
  <nav class="navlinks">
    <a href="#services">${esc(t.nav.services)}</a>
    <a href="#services">${esc(t.nav.prices)}</a>
    <a href="#shop">${esc(t.nav.shop)}</a>
    <a href="#reviews">${esc(t.nav.reviews)}</a>
  </nav>
  <div class="navcta">
    <span class="lang"><a href="${t.self}" class="${t.lang === "en" ? "on" : ""}">EN</a> · <a href="${t.other}" class="${t.lang === "es" ? "on" : ""}">ES</a></span>
    <a class="btn btn-brass" href="#book">${esc(t.nav.book)}</a>
  </div>
</div></header>

<section class="hero">
  <div class="hero-bg"><img src="/public/images/demos/barber-hero.jpg" alt="Classic barbershop interior with leather chairs, dark wood panelling and warm brass lighting" width="1344" height="768"></div>
  <div class="wrap hero-in">
    <span class="hbadge">${esc(t.hero.badge)}</span>
    <h1>${esc(t.hero.h1a)}<em>${esc(t.hero.h1b)}</em></h1>
    <p class="sub">${esc(t.hero.sub)}</p>
    <div class="hero-cta">
      <a class="btn btn-brass" href="#book">${esc(t.hero.cta)}</a>
      <a class="btn btn-out" href="#services">${esc(t.hero.cta2)}</a>
    </div>
  </div>
</section>

<div class="qbar"><div class="wrap">${t.quick.map(quick).join("")}</div></div>

<section id="services"><div class="wrap">
  <div class="head"><div class="rule"></div><p class="sc">${esc(t.nav.services)} &amp; ${esc(t.nav.prices)}</p><h2>${esc(t.servicesTitle)}</h2><p>${esc(t.servicesSub)}</p></div>
  <div class="svcs">${t.services.map(svc).join("")}</div>
</div></section>

<section id="shop" class="craft"><div class="wrap craft-in">
  <div class="craft-img"><img src="/public/images/demos/barber-tools.jpg" alt="Straight razor, scissors, leather strop and shaving brush on dark wood" width="880" height="1100"></div>
  <div>
    <div class="rule"></div><p class="sc">${esc(t.nav.shop)}</p>
    <h2 style="font-size:clamp(1.9rem,4.2vw,2.7rem);margin:.7rem 0">${esc(t.craftTitle)}</h2>
    <p style="color:var(--mut);font-size:1.05rem">${esc(t.craftCopy)}</p>
    <ul>${t.craft.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
  </div>
</div></section>

<section><div class="wrap">
  <div class="head"><div class="rule"></div><p class="sc">${esc(t.nav.book)}</p><h2>${esc(t.howTitle)}</h2></div>
  <div class="steps">${t.how.map(stepC).join("")}</div>
</div></section>

<div class="band">
  <img src="/public/images/demos/barber-cut.jpg" alt="Barber using clippers to shape a precise fade" width="880" height="1100">
  <div class="band-txt"><div class="wrap"><p>${esc(t.bandLine)}</p></div></div>
</div>

<section id="reviews" class="reviews"><div class="wrap">
  <div class="head"><div class="rule"></div><p class="sc">${esc(t.nav.reviews)}</p><h2>${esc(t.reviewsTitle)}</h2></div>
  <div class="revs">${t.reviews.map(rev).join("")}</div>
  <p class="revnote">${esc(t.reviewsNote)}</p>
</div></section>

<section id="book" class="book"><div class="wrap book-in">
  <div class="book-side">
    <div class="rule"></div><p class="sc">${esc(t.nav.book)}</p>
    <h2>${esc(t.bookTitle)}</h2>
    <p>${esc(t.bookSub)}</p>
    <div class="visit">
      <h3>${esc(t.hoursTitle)}</h3>
      ${t.hours.map(hr).join("")}
      <div class="addr"><strong style="color:var(--txt)">${esc(t.findTitle)}</strong><br>${esc(SHOP.address)}<br><a href="tel:5550142200">${esc(SHOP.phone)}</a></div>
    </div>
  </div>
  <form class="bk" onsubmit="return bookNow(event)">
    <input type="text" placeholder="${esc(t.form.name)}" required>
    <input type="tel" placeholder="${esc(t.form.phone)}" required>
    <select required><option value="" disabled selected>${esc(t.form.service)}</option>${t.form.serviceOpts.map((o) => `<option>${esc(o)}</option>`).join("")}</select>
    <div class="row2">
      <select required><option value="" disabled selected>${esc(t.form.when)}</option>${t.form.whenOpts.map((o) => `<option>${esc(o)}</option>`).join("")}</select>
      <select required><option value="" disabled selected>${esc(t.form.time)}</option>${t.form.timeOpts.map((o) => `<option>${esc(o)}</option>`).join("")}</select>
    </div>
    <button type="submit" class="btn btn-brass">${esc(t.form.submit)}</button>
    <p class="bknote">${esc(t.form.note)}</p>
    <div class="bkok" id="bkok">${esc(t.form.ok)}</div>
  </form>
</div></section>

<footer class="f"><div class="wrap">
  <div class="f-top">
    <div class="logo">THE <b>FADE</b> ROOM<small>Barbershop</small></div>
    <div class="built">${esc(t.builtBy)} <a href="https://www.blynxsystems.com" target="_blank" rel="noopener">BLYNX Systems ↗</a></div>
  </div>
  <p class="f-note">${esc(t.footNote)}</p>
</div></footer>

<script>
function bookNow(e){e.preventDefault();var ok=document.getElementById('bkok');ok.style.display='block';e.target.querySelector('button').style.display='none';ok.scrollIntoView({behavior:'smooth',block:'center'});return false;}
</script>
</body>
</html>`;
}

fs.mkdirSync(path.join(root, "demos/barber/es"), { recursive: true });
fs.writeFileSync(path.join(root, "demos/barber/index.html"), render(C.en));
fs.writeFileSync(path.join(root, "demos/barber/es/index.html"), render(C.es));
console.log("Barber demo generado: demos/barber/index.html (EN) + demos/barber/es/index.html (ES)");
