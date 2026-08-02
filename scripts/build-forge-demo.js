// Genera el demo standalone "FORGE Fitness Coaching" (EN + ES).
// Es un DEMO de BLYNX — marca ficticia, contenido ilustrativo. Estética propia
// (oscuro + naranja fuego), independiente del sitio BLYNX.
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

const C = {
  en: {
    lang: "en",
    other: "/demos/forge/es",
    self: "/demos/forge",
    title: "FORGE Fitness Coaching — 12-Week Transformation Challenge (Demo)",
    desc: "FORGE Fitness Coaching — a 12-week transformation challenge with personalized training, nutrition and weekly coaching. (Demo site by BLYNX Systems.)",
    ribbon: "Demo site built by BLYNX Systems",
    ribbonCta: "See who built this",
    nav: { program: "The Challenge", how: "How it works", results: "Results", pricing: "Programs", apply: "Apply now" },
    hero: {
      badge: "Next round starts soon · Only 12 spots",
      h1a: "Transform your body in",
      h1b: "12 weeks.",
      sub: "A complete transformation system — personalized training, nutrition, and a coach in your corner every week. No guesswork. Just results.",
      cta: "Apply for the challenge",
      cta2: "See how it works"
    },
    stats: [["12", "Week system"], ["4", "Pillars"], ["1:1", "Weekly coaching"], ["100%", "Personalized"]],
    pillarsTitle: "Everything you need to actually change.",
    pillarsSub: "Most programs give you a workout and wish you luck. FORGE builds the full system around you.",
    pillars: [
      ["Training", "A plan built around your body, schedule and equipment — adjusted every week as you get stronger."],
      ["Nutrition", "Simple, flexible nutrition targets you can actually live with. No starvation, no crash diets."],
      ["Accountability", "Weekly check-ins with your coach. We track progress, fix what's off, and keep you moving."],
      ["Mindset", "The habits and mindset that make the results stick long after the 12 weeks end."]
    ],
    includedTitle: "What's inside the 12 weeks",
    included: [
      "Personalized training plan (gym or home)",
      "Custom nutrition targets & guidance",
      "Weekly 1:1 check-in with your coach",
      "Training app with video demos",
      "Private member community",
      "Progress tracking & adjustments"
    ],
    howTitle: "How the 12 weeks work",
    how: [
      ["Week 1", "Assessment", "We map your starting point — goals, body, schedule and habits — and build your plan."],
      ["Weeks 2–5", "Build", "You start training and eating on your plan. Weekly check-ins dial everything in."],
      ["Weeks 6–10", "Push", "Intensity climbs as you get stronger. This is where the visible change happens."],
      ["Weeks 11–12", "Peak", "We push to your best result and lock in the habits so it lasts."]
    ],
    resultsTitle: "Real transformation, engineered.",
    resultsSub: "Sample results shown for this demo — every FORGE journey is different.",
    results: [
      ["−18 lbs", "Fat lost", "12 weeks · sample"],
      ["+9 lbs", "Lean muscle", "12 weeks · sample"],
      ["4×/wk", "Consistent training", "from zero · sample"]
    ],
    testiTitle: "What members say",
    testiNote: "Sample testimonials — demo content.",
    testi: [
      ["“I've tried everything. This is the first plan I actually stuck to — because someone was in my corner every week.”", "Sample member"],
      ["“The nutrition was simple enough to keep up with a full-time job and two kids. Down two sizes.”", "Sample member"],
      ["“Strongest and leanest I've been in a decade. The weekly check-ins changed everything.”", "Sample member"]
    ],
    pricingTitle: "Choose your level",
    pricingSub: "Limited spots each round so every member gets real coaching attention.",
    pricing: [
      ["Self-Guided", "$149", "one-time", ["12-week training plan", "Nutrition guidelines", "Training app access", "Community access"], "Start self-guided", false],
      ["Coached", "$399", "for 12 weeks", ["Everything in Self-Guided", "Fully personalized plan", "Weekly 1:1 check-ins", "Plan adjustments", "Direct message support"], "Apply for coaching", true],
      ["1:1 Elite", "$899", "for 12 weeks", ["Everything in Coached", "2× weekly video calls", "Daily message access", "Fully custom nutrition", "Priority everything"], "Apply for Elite", false]
    ],
    popular: "Most popular",
    faqTitle: "Questions, answered",
    faq: [
      ["Do I need a gym?", "No. Your plan is built around what you have — full gym, home setup, or minimal equipment."],
      ["I'm a total beginner. Is this for me?", "Yes. Every plan starts from your level and progresses at your pace, with video demos for every exercise."],
      ["What if I fall behind?", "That's what the weekly check-ins are for. We adjust the plan to your real life instead of quitting."],
      ["How much time per week?", "Most members train 3–4 times per week, 45–60 minutes per session."]
    ],
    finalTitle: "Your 12 weeks start now.",
    finalSub: "Applications for the next round are open. Only 12 coached spots.",
    form: { name: "Your name", email: "Email", goal: "Your main goal", goalOpts: ["Lose fat", "Build muscle", "Get stronger", "Feel healthier"], level: "Current level", levelOpts: ["Beginner", "Some experience", "Advanced"], submit: "Apply for the challenge", note: "Demo form — in a real site this sends the application straight to the coach.", ok: "Thanks! In a real FORGE site, your application would now be with the coaching team. (This is a demo.)" },
    footNote: "FORGE Fitness Coaching is a fictional brand created as a demonstration. All content, results and testimonials are illustrative.",
    builtBy: "Demo designed & built by",
    backToBlynx: "blynxsystems.com"
  },
  es: {
    lang: "es",
    other: "/demos/forge",
    self: "/demos/forge/es",
    title: "FORGE Fitness Coaching — Reto de Transformación de 12 Semanas (Demo)",
    desc: "FORGE Fitness Coaching — un reto de transformación de 12 semanas con entrenamiento personalizado, nutrición y coaching semanal. (Sitio demo de BLYNX Systems.)",
    ribbon: "Sitio demo creado por BLYNX Systems",
    ribbonCta: "Ver quién lo construyó",
    nav: { program: "El Reto", how: "Cómo funciona", results: "Resultados", pricing: "Programas", apply: "Aplica ahora" },
    hero: {
      badge: "Próxima ronda muy pronto · Solo 12 cupos",
      h1a: "Transforma tu cuerpo en",
      h1b: "12 semanas.",
      sub: "Un sistema de transformación completo — entrenamiento personalizado, nutrición y un coach a tu lado cada semana. Sin adivinar. Solo resultados.",
      cta: "Aplica al reto",
      cta2: "Ver cómo funciona"
    },
    stats: [["12", "Semanas"], ["4", "Pilares"], ["1:1", "Coaching semanal"], ["100%", "Personalizado"]],
    pillarsTitle: "Todo lo que necesitas para cambiar de verdad.",
    pillarsSub: "La mayoría te da una rutina y te desea suerte. FORGE construye el sistema completo a tu alrededor.",
    pillars: [
      ["Entrenamiento", "Un plan hecho a tu cuerpo, horario y equipo — ajustado cada semana a medida que te haces más fuerte."],
      ["Nutrición", "Objetivos de nutrición simples y flexibles con los que sí puedes vivir. Sin pasar hambre ni dietas extremas."],
      ["Seguimiento", "Check-ins semanales con tu coach. Medimos el progreso, corregimos lo que falla y te mantenemos avanzando."],
      ["Mentalidad", "Los hábitos y la mentalidad que hacen que los resultados duren mucho después de las 12 semanas."]
    ],
    includedTitle: "Qué incluye las 12 semanas",
    included: [
      "Plan de entrenamiento personalizado (gym o casa)",
      "Objetivos y guía de nutrición a tu medida",
      "Check-in 1:1 semanal con tu coach",
      "App de entrenamiento con videos",
      "Comunidad privada de miembros",
      "Seguimiento de progreso y ajustes"
    ],
    howTitle: "Cómo funcionan las 12 semanas",
    how: [
      ["Semana 1", "Evaluación", "Mapeamos tu punto de partida — metas, cuerpo, horario y hábitos — y armamos tu plan."],
      ["Semanas 2–5", "Construcción", "Empiezas a entrenar y comer según tu plan. Los check-ins semanales lo afinan todo."],
      ["Semanas 6–10", "Empuje", "La intensidad sube a medida que te haces más fuerte. Aquí ocurre el cambio visible."],
      ["Semanas 11–12", "Pico", "Empujamos a tu mejor resultado y fijamos los hábitos para que dure."]
    ],
    resultsTitle: "Transformación real, diseñada.",
    resultsSub: "Resultados de muestra para este demo — cada proceso FORGE es distinto.",
    results: [
      ["−8 kg", "Grasa perdida", "12 semanas · muestra"],
      ["+4 kg", "Músculo magro", "12 semanas · muestra"],
      ["4×/sem", "Entreno constante", "desde cero · muestra"]
    ],
    testiTitle: "Lo que dicen los miembros",
    testiNote: "Testimonios de muestra — contenido demo.",
    testi: [
      ["“He probado de todo. Este es el primer plan que de verdad seguí — porque alguien estuvo conmigo cada semana.”", "Miembro de muestra"],
      ["“La nutrición fue lo bastante simple para llevarla con trabajo de tiempo completo y dos hijos. Bajé dos tallas.”", "Miembro de muestra"],
      ["“Más fuerte y definido que en una década. Los check-ins semanales lo cambiaron todo.”", "Miembro de muestra"]
    ],
    pricingTitle: "Elige tu nivel",
    pricingSub: "Cupos limitados cada ronda para que cada miembro reciba atención real de coaching.",
    pricing: [
      ["Autoguiado", "$149", "pago único", ["Plan de 12 semanas", "Guías de nutrición", "Acceso a la app", "Acceso a la comunidad"], "Empezar autoguiado", false],
      ["Con Coach", "$399", "por 12 semanas", ["Todo lo de Autoguiado", "Plan 100% personalizado", "Check-ins 1:1 semanales", "Ajustes del plan", "Soporte por mensaje directo"], "Aplica con coach", true],
      ["1:1 Elite", "$899", "por 12 semanas", ["Todo lo de Con Coach", "2 videollamadas/semana", "Acceso por mensaje diario", "Nutrición 100% a medida", "Prioridad en todo"], "Aplica a Elite", false]
    ],
    popular: "Más popular",
    faqTitle: "Preguntas, resueltas",
    faq: [
      ["¿Necesito gimnasio?", "No. Tu plan se arma con lo que tengas — gimnasio completo, equipo en casa o mínimo."],
      ["Soy principiante total. ¿Es para mí?", "Sí. Cada plan empieza desde tu nivel y progresa a tu ritmo, con videos de cada ejercicio."],
      ["¿Y si me atraso?", "Para eso son los check-ins semanales. Ajustamos el plan a tu vida real en vez de abandonar."],
      ["¿Cuánto tiempo por semana?", "La mayoría entrena 3–4 veces por semana, 45–60 minutos por sesión."]
    ],
    finalTitle: "Tus 12 semanas empiezan ahora.",
    finalSub: "Las aplicaciones para la próxima ronda están abiertas. Solo 12 cupos con coach.",
    form: { name: "Tu nombre", email: "Email", goal: "Tu objetivo principal", goalOpts: ["Perder grasa", "Ganar músculo", "Ponerme más fuerte", "Sentirme más sano"], level: "Nivel actual", levelOpts: ["Principiante", "Algo de experiencia", "Avanzado"], submit: "Aplica al reto", note: "Formulario demo — en un sitio real esto envía la aplicación directo al coach.", ok: "¡Gracias! En un sitio FORGE real, tu aplicación estaría ya con el equipo de coaching. (Esto es un demo.)" },
    footNote: "FORGE Fitness Coaching es una marca ficticia creada como demostración. Todo el contenido, resultados y testimonios son ilustrativos.",
    builtBy: "Demo diseñado y construido por",
    backToBlynx: "blynxsystems.com"
  }
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function render(t) {
  const stat = (s) => `<div class="stat"><b>${esc(s[0])}</b><span>${esc(s[1])}</span></div>`;
  const pillar = (p, i) => `<article class="pillar"><span class="pnum">0${i + 1}</span><h3>${esc(p[0])}</h3><p>${esc(p[1])}</p></article>`;
  const step = (s, i) => `<div class="step"><div class="step-k">${esc(s[0])}</div><h4>${esc(s[1])}</h4><p>${esc(s[2])}</p>${i < 3 ? '<span class="step-arrow" aria-hidden="true">→</span>' : ""}</div>`;
  const res = (r) => `<div class="rescard"><b>${esc(r[0])}</b><span class="reslabel">${esc(r[1])}</span><span class="ressub">${esc(r[2])}</span></div>`;
  const testi = (x) => `<figure class="quote"><blockquote>${esc(x[0])}</blockquote><figcaption>— ${esc(x[1])}</figcaption></figure>`;
  const price = (p) => `<article class="plan${p[5] ? " is-featured" : ""}">${p[5] ? `<span class="plan-tag">${esc(t.popular)}</span>` : ""}<h3>${esc(p[0])}</h3><div class="plan-price"><b>${esc(p[1])}</b><span>${esc(p[2])}</span></div><ul>${p[3].map((f) => `<li>${esc(f)}</li>`).join("")}</ul><a class="btn ${p[5] ? "btn-fire" : "btn-ghost"}" href="#apply">${esc(p[4])}</a></article>`;
  const faq = (f) => `<details class="faq"><summary>${esc(f[0])}</summary><p>${esc(f[1])}</p></details>`;

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
<meta property="og:image" content="https://www.blynxsystems.com/public/images/demos/forge-hero.jpg">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0a0908;--bg2:#121010;--card:#17130f;--line:rgba(255,255,255,.1);--txt:#f4efe9;--mut:#a89f95;--fire:#ff5a1f;--fire2:#ff8a3d;--ember:#ffb066}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--txt);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.55;-webkit-font-smoothing:antialiased}
img{max-width:100%;height:auto;display:block}
a{color:inherit;text-decoration:none}
.wrap{width:min(100% - 2rem,1160px);margin-inline:auto}
h1,h2,h3,h4{line-height:1.05;letter-spacing:-.01em}
.k{font-family:"Arial Black",Impact,sans-serif;text-transform:uppercase;letter-spacing:.02em}
.fire{color:var(--fire)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;font-weight:800;border-radius:8px;padding:.9rem 1.5rem;font-size:1rem;cursor:pointer;border:2px solid transparent;transition:transform .15s ease,box-shadow .15s ease}
.btn:hover{transform:translateY(-2px)}
.btn-fire{background:linear-gradient(120deg,var(--fire),var(--fire2));color:#160a03;box-shadow:0 10px 30px rgba(255,90,31,.35)}
.btn-ghost{background:transparent;border-color:var(--line);color:var(--txt)}
.btn-ghost:hover{border-color:var(--fire)}
.eyebrow{color:var(--fire);font-weight:900;letter-spacing:.16em;font-size:.72rem;text-transform:uppercase}
section{padding:5rem 0}
.sec-h{max-width:720px;margin-bottom:2.6rem}
.sec-h h2{font-size:clamp(1.9rem,4.4vw,3rem);text-transform:uppercase;margin:.5rem 0}
.sec-h p{color:var(--mut);font-size:1.05rem}
/* ribbon */
.ribbon{background:linear-gradient(90deg,var(--fire),var(--fire2));color:#160a03;font-weight:800;font-size:.82rem;text-align:center;padding:.5rem 1rem;display:flex;gap:.6rem;justify-content:center;align-items:center;flex-wrap:wrap}
.ribbon a{text-decoration:underline;font-weight:900}
/* header */
header.nav{position:sticky;top:0;z-index:50;background:rgba(10,9,8,.86);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.navrow{display:flex;align-items:center;gap:1.2rem;padding:.9rem 0}
.logo{font-size:1.35rem;font-weight:900;letter-spacing:.14em}
.logo span{color:var(--fire)}
.navlinks{display:flex;gap:1.4rem;margin-left:auto;font-weight:700;font-size:.92rem}
.navlinks a{color:var(--mut)}.navlinks a:hover{color:var(--txt)}
.navcta{display:flex;align-items:center;gap:.8rem}
.lang{font-size:.8rem;font-weight:800;color:var(--mut);border:1px solid var(--line);border-radius:999px;padding:.25rem .6rem}
.lang a.on{color:var(--fire)}
@media(max-width:860px){.navlinks{display:none}}
/* hero */
.hero{position:relative;min-height:88vh;display:flex;align-items:center;overflow:hidden}
.hero-img{position:absolute;inset:0}
.hero-img img{width:100%;height:100%;object-fit:cover;object-position:center}
.hero-img::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,9,8,.94) 0%,rgba(10,9,8,.7) 45%,rgba(10,9,8,.35) 100%)}
.hero-in{position:relative;z-index:2;padding:5rem 0}
.hbadge{display:inline-flex;align-items:center;gap:.5rem;background:rgba(255,90,31,.14);border:1px solid rgba(255,90,31,.4);color:var(--ember);font-weight:800;font-size:.82rem;padding:.4rem .9rem;border-radius:999px}
.hbadge::before{content:"";width:.5rem;height:.5rem;border-radius:999px;background:var(--fire);box-shadow:0 0 12px var(--fire)}
.hero h1{font-size:clamp(2.8rem,8vw,6rem);text-transform:uppercase;margin:1.2rem 0}
.hero h1 .fire{display:block}
.hero p.sub{color:#e9e1d8;font-size:clamp(1.05rem,2vw,1.3rem);max-width:44ch}
.hero-cta{display:flex;gap:.9rem;flex-wrap:wrap;margin-top:2rem}
/* stats bar */
.statbar{background:var(--bg2);border-block:1px solid var(--line)}
.statbar .wrap{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;padding:1.8rem 0}
.stat{text-align:center}.stat b{display:block;font-size:2.1rem;color:var(--fire);font-weight:900;line-height:1}.stat span{color:var(--mut);font-size:.82rem;text-transform:uppercase;letter-spacing:.05em}
/* pillars */
.pillars{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
.pillar{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:1.4rem}
.pillar .pnum{color:var(--fire);font-weight:900;font-size:.9rem}
.pillar h3{text-transform:uppercase;font-size:1.15rem;margin:.5rem 0}.pillar p{color:var(--mut);font-size:.92rem}
/* included */
.inc{display:grid;grid-template-columns:1.05fr .95fr;gap:2.2rem;align-items:center}
.inc-img{border-radius:14px;overflow:hidden;border:1px solid var(--line)}
.inc ul{list-style:none;display:grid;gap:.7rem}
.inc li{display:flex;gap:.7rem;align-items:flex-start;font-weight:600;font-size:1.02rem}
.inc li::before{content:"";flex:0 0 auto;width:1.4rem;height:1.4rem;margin-top:.1rem;border-radius:6px;background:linear-gradient(120deg,var(--fire),var(--fire2));-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M9 16.2l-3.5-3.5L4 14.2 9 19.2 20 8.2l-1.5-1.5z'/%3E%3C/svg%3E") center/contain no-repeat}
/* how */
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
.step{position:relative;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:1.4rem}
.step-k{color:var(--fire);font-weight:900;text-transform:uppercase;font-size:.82rem;letter-spacing:.05em}
.step h4{text-transform:uppercase;margin:.4rem 0;font-size:1.2rem}.step p{color:var(--mut);font-size:.9rem}
.step-arrow{position:absolute;right:-.85rem;top:50%;transform:translateY(-50%);color:var(--fire);font-weight:900;z-index:2}
/* results */
.results{background:linear-gradient(180deg,var(--bg2),var(--bg))}
.res-grid{display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:center}
.res-img{border-radius:14px;overflow:hidden;border:1px solid var(--line)}
.rescards{display:grid;gap:1rem}
.rescard{background:var(--card);border:1px solid var(--line);border-left:3px solid var(--fire);border-radius:10px;padding:1.1rem 1.3rem;display:flex;flex-direction:column}
.rescard b{font-size:2rem;color:var(--txt);font-weight:900;line-height:1}
.reslabel{font-weight:800;text-transform:uppercase;font-size:.9rem}.ressub{color:var(--mut);font-size:.78rem}
/* testimonials */
.quotes{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
.quote{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:1.4rem}
.quote blockquote{font-size:1rem;color:#eae3da}.quote figcaption{margin-top:.9rem;color:var(--fire);font-weight:800;font-size:.85rem}
.note-inline{color:var(--mut);font-size:.8rem;margin-top:1rem;font-style:italic}
/* pricing */
.plans{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem;align-items:start}
.plan{position:relative;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:1.6rem}
.plan.is-featured{border-color:var(--fire);box-shadow:0 20px 60px rgba(255,90,31,.18)}
.plan-tag{position:absolute;top:-.8rem;left:1.6rem;background:linear-gradient(120deg,var(--fire),var(--fire2));color:#160a03;font-weight:900;font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;padding:.25rem .7rem;border-radius:999px}
.plan h3{text-transform:uppercase;font-size:1.3rem}
.plan-price{margin:.6rem 0 1rem}.plan-price b{font-size:2.4rem;font-weight:900}.plan-price span{color:var(--mut);font-size:.9rem}
.plan ul{list-style:none;display:grid;gap:.55rem;margin-bottom:1.4rem}
.plan li{color:var(--mut);font-size:.92rem;padding-left:1.3rem;position:relative}
.plan li::before{content:"›";position:absolute;left:0;color:var(--fire);font-weight:900}
.plan .btn{width:100%}
/* faq */
.faqs{display:grid;gap:.7rem;max-width:820px}
.faq{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:.3rem 1.1rem}
.faq summary{cursor:pointer;font-weight:800;padding:.9rem 0;list-style:none}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";float:right;color:var(--fire);font-weight:900}
.faq[open] summary::after{content:"–"}
.faq p{color:var(--mut);padding-bottom:1rem}
/* apply */
.apply{background:linear-gradient(180deg,var(--bg),#1a0d06)}
.apply-in{display:grid;grid-template-columns:1fr 1fr;gap:2.4rem;align-items:center}
.apply h2{font-size:clamp(2rem,5vw,3.4rem);text-transform:uppercase}
.apply .badge2{display:inline-flex;gap:.5rem;align-items:center;color:var(--ember);font-weight:800;margin-top:1rem}
form.applyform{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:1.6rem;display:grid;gap:.8rem}
form.applyform input,form.applyform select{width:100%;background:var(--bg2);border:1px solid var(--line);border-radius:8px;padding:.85rem 1rem;color:var(--txt);font-size:1rem;font-family:inherit}
form.applyform input::placeholder{color:#7d746a}
form.applyform .row2{display:grid;grid-template-columns:1fr 1fr;gap:.8rem}
.formnote{color:var(--mut);font-size:.78rem;text-align:center}
.formok{display:none;background:rgba(255,90,31,.12);border:1px solid rgba(255,90,31,.4);color:var(--ember);border-radius:10px;padding:1rem;font-weight:700;text-align:center}
/* footer */
footer.f{border-top:1px solid var(--line);background:var(--bg2)}
footer.f .wrap{padding:2.4rem 0}
.f-top{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;align-items:center}
.f-logo{font-size:1.2rem;font-weight:900;letter-spacing:.14em}.f-logo span{color:var(--fire)}
.built{display:flex;align-items:center;gap:.5rem;font-weight:700}
.built a{color:var(--fire);text-decoration:underline}
.f-note{color:var(--mut);font-size:.78rem;margin-top:1.4rem;border-top:1px solid var(--line);padding-top:1.2rem}
@media(max-width:860px){.pillars,.steps{grid-template-columns:1fr 1fr}.inc,.res-grid,.apply-in{grid-template-columns:1fr}.quotes,.plans{grid-template-columns:1fr}.statbar .wrap{grid-template-columns:1fr 1fr}.step-arrow{display:none}.res-img{order:-1}}
</style>
</head>
<body>
<div class="ribbon">⚡ ${esc(t.ribbon)} · <a href="https://www.blynxsystems.com" target="_blank" rel="noopener">${esc(t.ribbonCta)} →</a></div>

<header class="nav"><div class="wrap navrow">
  <div class="logo k">FOR<span>GE</span></div>
  <nav class="navlinks">
    <a href="#program">${esc(t.nav.program)}</a>
    <a href="#how">${esc(t.nav.how)}</a>
    <a href="#results">${esc(t.nav.results)}</a>
    <a href="#pricing">${esc(t.nav.pricing)}</a>
  </nav>
  <div class="navcta">
    <span class="lang"><a href="${t.self}" class="${t.lang === "en" ? "on" : ""}">EN</a> / <a href="${t.other}" class="${t.lang === "es" ? "on" : ""}">ES</a></span>
    <a class="btn btn-fire" href="#apply">${esc(t.nav.apply)}</a>
  </div>
</div></header>

<section class="hero">
  <div class="hero-img"><img src="/public/images/demos/forge-hero.jpg" alt="Athlete training in a dark gym with dramatic fire-orange lighting" width="1344" height="768"></div>
  <div class="wrap hero-in">
    <span class="hbadge">${esc(t.hero.badge)}</span>
    <h1 class="k">${esc(t.hero.h1a)} <span class="fire">${esc(t.hero.h1b)}</span></h1>
    <p class="sub">${esc(t.hero.sub)}</p>
    <div class="hero-cta">
      <a class="btn btn-fire" href="#apply">${esc(t.hero.cta)}</a>
      <a class="btn btn-ghost" href="#how">${esc(t.hero.cta2)}</a>
    </div>
  </div>
</section>

<div class="statbar"><div class="wrap">${t.stats.map(stat).join("")}</div></div>

<section id="program"><div class="wrap">
  <div class="sec-h"><p class="eyebrow">${esc(t.nav.program)}</p><h2 class="k">${esc(t.pillarsTitle)}</h2><p>${esc(t.pillarsSub)}</p></div>
  <div class="pillars">${t.pillars.map(pillar).join("")}</div>
</div></section>

<section style="background:var(--bg2)"><div class="wrap">
  <div class="inc">
    <div class="inc-img"><img src="/public/images/demos/forge-train.jpg" alt="Hands gripping a loaded barbell with chalk dust" width="896" height="1152"></div>
    <div>
      <p class="eyebrow">${esc(t.includedTitle)}</p>
      <h2 class="k" style="font-size:clamp(1.8rem,4vw,2.6rem);text-transform:uppercase;margin:.5rem 0 1.4rem">${esc(t.includedTitle)}</h2>
      <ul>${t.included.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    </div>
  </div>
</div></section>

<section id="how"><div class="wrap">
  <div class="sec-h"><p class="eyebrow">${esc(t.nav.how)}</p><h2 class="k">${esc(t.howTitle)}</h2></div>
  <div class="steps">${t.how.map(step).join("")}</div>
</div></section>

<section id="results" class="results"><div class="wrap">
  <div class="sec-h"><p class="eyebrow">${esc(t.nav.results)}</p><h2 class="k">${esc(t.resultsTitle)}</h2><p>${esc(t.resultsSub)}</p></div>
  <div class="res-grid">
    <div class="res-img"><img src="/public/images/demos/forge-results.jpg" alt="Athlete slamming battle ropes in a dark gym" width="896" height="1152"></div>
    <div class="rescards">${t.results.map(res).join("")}</div>
  </div>
  <div class="sec-h" style="margin-top:3.5rem;margin-bottom:1.4rem"><h2 class="k" style="font-size:clamp(1.6rem,3.5vw,2.2rem)">${esc(t.testiTitle)}</h2></div>
  <div class="quotes">${t.testi.map(testi).join("")}</div>
  <p class="note-inline">${esc(t.testiNote)}</p>
</div></section>

<section id="pricing"><div class="wrap">
  <div class="sec-h"><p class="eyebrow">${esc(t.nav.pricing)}</p><h2 class="k">${esc(t.pricingTitle)}</h2><p>${esc(t.pricingSub)}</p></div>
  <div class="plans">${t.pricing.map(price).join("")}</div>
</div></section>

<section style="background:var(--bg2)"><div class="wrap">
  <div class="sec-h"><p class="eyebrow">FAQ</p><h2 class="k">${esc(t.faqTitle)}</h2></div>
  <div class="faqs">${t.faq.map(faq).join("")}</div>
</div></section>

<section id="apply" class="apply"><div class="wrap apply-in">
  <div>
    <p class="eyebrow">${esc(t.nav.apply)}</p>
    <h2 class="k">${esc(t.finalTitle)}</h2>
    <p style="color:var(--mut);font-size:1.1rem;margin-top:.8rem">${esc(t.finalSub)}</p>
    <span class="badge2">🔥 ${esc(t.hero.badge)}</span>
  </div>
  <form class="applyform" onsubmit="return forgeApply(event)">
    <input type="text" placeholder="${esc(t.form.name)}" required>
    <input type="email" placeholder="${esc(t.form.email)}" required>
    <div class="row2">
      <select required><option value="" disabled selected>${esc(t.form.goal)}</option>${t.form.goalOpts.map((o) => `<option>${esc(o)}</option>`).join("")}</select>
      <select required><option value="" disabled selected>${esc(t.form.level)}</option>${t.form.levelOpts.map((o) => `<option>${esc(o)}</option>`).join("")}</select>
    </div>
    <button type="submit" class="btn btn-fire">${esc(t.form.submit)}</button>
    <p class="formnote">${esc(t.form.note)}</p>
    <div class="formok" id="forgeok">${esc(t.form.ok)}</div>
  </form>
</div></section>

<footer class="f"><div class="wrap">
  <div class="f-top">
    <div class="f-logo k">FOR<span>GE</span> · Fitness Coaching</div>
    <div class="built">${esc(t.builtBy)} <a href="https://www.blynxsystems.com" target="_blank" rel="noopener">BLYNX Systems ↗</a></div>
  </div>
  <p class="f-note">${esc(t.footNote)}</p>
</div></footer>

<script>
function forgeApply(e){e.preventDefault();var ok=document.getElementById('forgeok');ok.style.display='block';e.target.querySelector('button').style.display='none';ok.scrollIntoView({behavior:'smooth',block:'center'});return false;}
</script>
</body>
</html>`;
}

fs.mkdirSync(path.join(root, "demos/forge/es"), { recursive: true });
fs.writeFileSync(path.join(root, "demos/forge/index.html"), render(C.en));
fs.writeFileSync(path.join(root, "demos/forge/es/index.html"), render(C.es));
console.log("FORGE demo generado: demos/forge/index.html (EN) + demos/forge/es/index.html (ES)");
