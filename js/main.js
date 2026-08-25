/* ============================================================================
   Datayros — comportamiento de la landing.

   Todo el movimiento es *mejora*: si GSAP no carga o el JS falla, la página
   queda completa y legible. Nada se esconde detrás de una animación.
   ========================================================================== */

/* ── Configuración de contacto ────────────────────────────────────────────────
   ⚠️ Los dos únicos valores de contacto de todo el proyecto.

   WHATSAPP_NUMBER — formato internacional, solo dígitos: sin +, sin espacios,
   sin guiones ni paréntesis. Ejemplo para +51 987 654 321 → "51987654321".
   Si dejas el + o los espacios, wa.me devuelve un 404.

   Se usan aquí (botones del CTA y del hero) y en chat-widget.js. Un solo lugar.
*/
export const WHATSAPP_NUMBER = "51933137048";
export const WHATSAPP_MESSAGE =
  "Hola Datayros, me gustaría recibir más información sobre sus productos y servicios.";
export const EMAIL = "tairosgraph@gmail.com";
export const EMAIL_SUBJECT = "Consulta desde el sitio de Datayros";

/** Construye el enlace de WhatsApp. Si falta el número, devuelve null. */
export function whatsappUrl(message = WHATSAPP_MESSAGE) {
  if (!WHATSAPP_NUMBER) return null;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function emailUrl() {
  return `mailto:${EMAIL}?subject=${encodeURIComponent(EMAIL_SUBJECT)}`;
}

/* Rellena todos los botones marcados con data-whatsapp / data-email.
   Mientras el número esté vacío, los botones de WhatsApp caen al correo para
   que ningún enlace quede muerto en producción por un olvido. */
const waHref = whatsappUrl();

document.querySelectorAll("[data-whatsapp]").forEach((el) => {
  el.setAttribute("href", waHref || emailUrl());
  if (waHref) {
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  }
});

document.querySelectorAll("[data-email]").forEach((el) => {
  el.setAttribute("href", emailUrl());
});

/* ── Preferencias de movimiento ──────────────────────────────────────────── */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGsap = typeof window.gsap !== "undefined";
/** Solo animamos si hay librería y el visitante no pidió menos movimiento. */
const animate = hasGsap && !reduceMotion;

/* ── Tema día / noche ─────────────────────────────────────────────────────────
   El <head> ya eligió el tema antes de pintar (por hora, o por lo que el
   visitante haya guardado). Aquí solo queda el conmutador manual. */
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");

function setTheme(theme) {
  if (theme === "night") root.setAttribute("data-theme", "night");
  else root.removeAttribute("data-theme");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "night" ? "#141310" : "#F4F1E8");
  try { localStorage.setItem("dy-theme", theme); } catch (e) {}
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    setTheme(root.getAttribute("data-theme") === "night" ? "day" : "night");
  });
}

/* ── Respaldo de las fotos ────────────────────────────────────────────────────
   Si una foto no existe o falla al cargar, la quitamos del DOM. El CSS de cada
   una está condicionado con :has(), así que al retirarla el contenedor vuelve
   solo a su estado anterior —iniciales sobre papel en la ficha del fundador,
   rayas diagonales en el marco de Atlantis— sin ícono de imagen rota. */
document.querySelectorAll(".founder-photo, .showroom-photo").forEach((img) => {
  img.addEventListener("error", () => img.remove(), { once: true });
});

/* ── Reveal al hacer scroll ───────────────────────────────────────────────────
   IntersectionObserver nativo, sin librería: el bloque se revela una vez y se
   queda. Los contenedores marcados con data-stagger escalonan además a sus
   hijos, que en CSS ya están visibles — GSAP solo los trae desde abajo. */
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.classList.add("in");
    io.unobserve(el);

    if (animate && el.hasAttribute("data-stagger")) {
      gsap.from(el.children, {
        opacity: 0, y: 10, duration: 0.4, ease: "power2.out", stagger: 0.05,
      });
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
revealEls.forEach((el) => io.observe(el));

/* ── Entrada del hero ─────────────────────────────────────────────────────────
   Un solo momento orquestado en lugar de efectos sueltos. El remate es la
   marca de registro: las cruces llegan desde fuera y los aros cierran — que es
   literalmente lo que hace una prensa antes de imprimir limpio. */
/* Partimos el titular en palabras para poder escalonarlas. Tiene que ocurrir
   ANTES de construir la línea de tiempo, porque GSAP resuelve los selectores
   en ese momento. Solo se trocea si de verdad vamos a animar. */
function splitHeadline() {
  const h = document.getElementById("heroTitle");
  if (!h) return;
  h.innerHTML = h.innerHTML.replace(
    /(<em>.*?<\/em>|[^\s<]+)/g,
    (m) => '<span class="w">' + m + "</span>"
  );
}

if (animate) {
  splitHeadline();

  gsap.timeline({ defaults: { ease: "power3.out" } })
    .from("nav", { opacity: 0, y: -10, duration: 0.45 })
    .from(".trim", { opacity: 0, duration: 0.4, stagger: 0.05 }, "-=0.2")
    .from(".hero-meta", { opacity: 0, y: 10, duration: 0.45 }, "-=0.25")
    .from(".hero h1 .w", { opacity: 0, y: 22, duration: 0.5, stagger: 0.026 }, "-=0.25")
    .from(".hero .lead", { opacity: 0, y: 14, duration: 0.5 }, "-=0.45")
    .from(".hero-ctas", { opacity: 0, y: 14, duration: 0.45 }, "-=0.42")
    .from(".hero-proof", { opacity: 0, y: 14, duration: 0.45 }, "-=0.4")
    .from(".ledger", { opacity: 0, y: 18, duration: 0.55 }, "-=0.6")
    .from("#regMark .ring", { scale: 1.6, opacity: 0, duration: 0.6, transformOrigin: "center" }, "-=0.5")
    .from("#regMark .ring-2", { scale: 0.4, opacity: 0, duration: 0.6, transformOrigin: "center" }, "-=0.5")
    .from("#regMark .ln-t", { y: -30, opacity: 0, duration: 0.5 }, "-=0.45")
    .from("#regMark .ln-b", { y: 30, opacity: 0, duration: 0.5 }, "-=0.5")
    .from("#regMark .ln-l", { x: -30, opacity: 0, duration: 0.5 }, "-=0.5")
    .from("#regMark .ln-r", { x: 30, opacity: 0, duration: 0.5 }, "-=0.5")
    .from(".control-note", { opacity: 0, duration: 0.4 }, "-=0.3")
    .from("#inkbar i", { scaleY: 0, duration: 0.4, stagger: 0.04, ease: "power2.out" }, "-=0.35");
}

/* ── Contador del sello de Atlantis ──────────────────────────────────────────
   Los "18 años" suben al entrar en pantalla. Es un dato, no un adorno: el
   número es la prueba y merece que la vista se detenga en él un instante. */
const counter = document.querySelector("[data-count-to]");
if (counter && animate) {
  const target = Number(counter.dataset.countTo);
  const io2 = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io2.unobserve(e.target);
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.1, ease: "power2.out",
        onUpdate: () => { counter.textContent = Math.round(obj.v); },
      });
    });
  }, { threshold: 0.6 });
  io2.observe(counter);
}

/* ── Bitácora en vivo del hero ───────────────────────────────────────────────
   La memoria de la organización se escribe sola: es la firma de la marca y
   demuestra el argumento en vez de explicarlo. */
const entries = [
  { t: "09:12", text: "Nueva cotización calculada para <b>pedido #452</b>." },
  { t: "11:30", text: "Registrado criterio de precio para clientes recurrentes." },
  { t: "14:05", text: "Ingreso registrado por voz — sin planilla." },
  { t: "16:48", text: "Recordatorio de cobranza enviado automáticamente." },
  { t: "—", text: "Este conocimiento ya no depende de una sola persona." },
];
const body = document.getElementById("ledgerBody");
let i = 0;
function addEntry() {
  if (!body) return;
  body.querySelectorAll(".caret").forEach((c) => c.remove());
  if (i >= entries.length) return;
  const row = document.createElement("div");
  row.className = "ledger-entry";
  row.innerHTML =
    '<div class="ledger-time">' + entries[i].t + "</div>" +
    '<div class="ledger-text">' + entries[i].text + '<span class="caret"></span></div>';
  body.appendChild(row);
  if (animate) gsap.from(row, { opacity: 0, y: 8, duration: 0.32, ease: "power1.out" });
  i++;
  setTimeout(addEntry, reduceMotion ? 120 : 900);
}
setTimeout(addEntry, reduceMotion ? 0 : 700);
