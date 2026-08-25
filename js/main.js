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

   Se usan aquí (botones, formulario del hero) y en chat-widget.js. Un solo lugar.
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
  if (meta) meta.setAttribute("content", theme === "night" ? "#141310" : "#FAFAF7");
  try { localStorage.setItem("dy-theme", theme); } catch (e) {}
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    setTheme(root.getAttribute("data-theme") === "night" ? "day" : "night");
  });
}

/* ── Formulario del hero → WhatsApp ──────────────────────────────────────────
   Sin backend que mantener: al enviar se abre WhatsApp con el mensaje ya
   armado con lo que la persona llenó. El campo señuelo (website) frena a los
   bots — una persona nunca lo ve ni lo llena. */
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm) {
  contactForm.addEventListener("submit", (ev) => {
    ev.preventDefault();

    const hp = contactForm.querySelector('[name="website"]');
    if (hp && hp.value) return; // bot: silencio y a otra cosa

    const name = (document.getElementById("fullName")?.value || "").trim();
    const company = (document.getElementById("company")?.value || "").trim();
    const category = (document.getElementById("category")?.value || "").trim();
    const message = (document.getElementById("message")?.value || "").trim();

    if (!name) {
      if (formStatus) {
        formStatus.textContent = "Escribe tu nombre para empezar";
        formStatus.classList.remove("ok");
      }
      document.getElementById("fullName")?.focus();
      return;
    }

    const lines = [
      "Hola Datayros, quiero evaluar un proceso.",
      `*Nombre:* ${name}`,
      company ? `*Empresa:* ${company}` : null,
      `*Proceso:* ${category}`,
      message ? `*Mensaje:* ${message}` : null,
    ].filter(Boolean);

    const url = whatsappUrl(lines.join("\n"));
    if (formStatus) {
      formStatus.textContent = "Abriendo WhatsApp con tu mensaje…";
      formStatus.classList.add("ok");
    }
    window.open(url, "_blank", "noopener");
  });
}

/* ── Comparador "una semana cualquiera" ───────────────────────────────────────
   El control segmentado invita de tres formas: se ve como botón, brilla
   suave hasta el primer toque, y la sección se demuestra sola una vez al
   entrar en pantalla — cambia a "Con Datayros" dos segundos y regresa, para
   que el visitante vea el premio antes de tocar nada. Al cambiar, las filas
   entran en cascada. El estado vive en el checkbox oculto: el CSS y el
   teclado siguen funcionando aunque nada de esto corra. */
const cmpInput = document.getElementById("compareToggle");
const cmpSeg = document.getElementById("compareSeg");
const segHint = document.getElementById("segHint");

if (cmpInput && cmpSeg) {
  let cmpTouched = false;
  const segOff = cmpSeg.querySelector(".seg-off");
  const segOn = cmpSeg.querySelector(".seg-on");

  const markTouched = () => {
    if (cmpTouched) return;
    cmpTouched = true;
    cmpSeg.classList.remove("seg-glow");
    if (segHint) segHint.classList.add("off");
  };

  const swapAnim = () => {
    if (!animate) return;
    gsap.from(".compare-row .state-txt", {
      opacity: 0, x: -10, duration: 0.3, ease: "power2.out",
      stagger: 0.055, overwrite: "auto", clearProps: "opacity,x",
    });
    gsap.from(".compare-row .st-ico", {
      scale: 0.5, duration: 0.35, ease: "back.out(2)",
      stagger: 0.055, overwrite: "auto", transformOrigin: "center",
      clearProps: "scale",
    });
  };

  const setCompare = (on, byUser) => {
    if (byUser) markTouched();
    if (cmpInput.checked === on) return;
    cmpInput.checked = on;
    swapAnim();
  };

  /* Clic por lado: tocar el lado ya activo no des-activa nada. */
  cmpSeg.addEventListener("click", (ev) => {
    ev.preventDefault();
    if (segOn.contains(ev.target)) setCompare(true, true);
    else if (segOff.contains(ev.target)) setCompare(false, true);
    else setCompare(!cmpInput.checked, true);
  });
  /* Teclado sobre el checkbox oculto: espacio sigue alternando. */
  cmpInput.addEventListener("change", () => { markTouched(); swapAnim(); });

  /* Demostración única + brillo, al entrar el control en pantalla. */
  if (animate) {
    const ioCmp = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        ioCmp.unobserve(e.target);
        cmpSeg.classList.add("seg-glow");
        setTimeout(() => { if (!cmpTouched) setCompare(true, false); }, 1100);
        setTimeout(() => { if (!cmpTouched) setCompare(false, false); }, 3400);
      });
    }, { threshold: 0.8 });
    ioCmp.observe(cmpSeg);
  }
}

/* ── Respaldo de las fotos ────────────────────────────────────────────────────
   Si una foto no existe o falla al cargar, la quitamos del DOM. El CSS de cada
   una está condicionado con :has(), así que al retirarla el contenedor vuelve
   solo a su estado anterior sin ícono de imagen rota. */
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
        opacity: 0, y: 12, duration: 0.45, ease: "power2.out", stagger: 0.06,
      });
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
revealEls.forEach((el) => io.observe(el));

/* ── Comportamiento al hacer scroll ───────────────────────────────────────────
   Una sola lectura del scroll por fotograma (requestAnimationFrame): la barra
   se condensa, la línea de progreso avanza, el botón del chat entra pasado el
   hero, y la decoración del fondo se desplaza a otro ritmo (parallax suave). */
const nav = document.querySelector("nav");
const navProgress = document.getElementById("navProgress");
const bgRing = document.querySelector(".bg-ring");
const bgDots = document.querySelector(".bg-dots");
let ticking = false;

function onScrollFrame() {
  const y = window.scrollY;
  if (nav) nav.classList.toggle("is-scrolled", y > 24);
  root.classList.toggle("past-hero", y > window.innerHeight * 0.6);
  if (!reduceMotion) {
    if (navProgress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(y / max, 1) : 0;
      navProgress.style.transform = "scaleX(" + p.toFixed(4) + ")";
    }
    /* Parallax: el aro y los puntos pertenecen al fondo, así que se quedan
       un poco atrás cuando la página avanza. Profundidad sin estridencia. */
    if (bgRing) bgRing.style.transform = "translateY(" + (y * -0.12).toFixed(1) + "px)";
    if (bgDots) bgDots.style.transform = "translateY(" + (y * -0.05).toFixed(1) + "px)";
  }
  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScrollFrame); }
}, { passive: true });
onScrollFrame();

/* ── Entrada del hero ─────────────────────────────────────────────────────────
   El fadeUp escalonado de las landings profesionales: cada pieza del pitch
   sube en orden de lectura y la tarjeta del formulario aterriza al final,
   apenas después — es la protagonista y se nota sin gritarlo. */
if (animate) {
  gsap.from("nav", { opacity: 0, y: -10, duration: 0.45, ease: "power2.out" });
  gsap.from("[data-fade]", {
    opacity: 0, y: 18, duration: 0.7, ease: "power3.out",
    stagger: 0.09, delay: 0.1,
  });
  gsap.from("[data-fade-card]", {
    opacity: 0, y: 26, duration: 0.8, ease: "power3.out", delay: 0.35,
  });
}

/* ── Escena de la línea ───────────────────────────────────────────────────────
   El ciclo que cuenta la historia sin palabras: la prensa imprime la hoja,
   la hoja viaja, cruza la marca de registro y se vuelve un mensaje que llega
   solo al teléfono. El SVG está dibujado en su cuadro final (hoja en camino,
   mensaje entregado), así que sin GSAP o con movimiento reducido la escena
   queda compuesta y completa — solo que quieta. */
if (animate && document.getElementById("lineScene")) {
  /* Maquinaria de fondo: rodillos y bobina girando, banda avanzando. */
  gsap.to("#sceneSpokeA", { rotation: 360, svgOrigin: "112 90", repeat: -1, ease: "none", duration: 3.6 });
  gsap.to("#sceneSpokeB", { rotation: -360, svgOrigin: "158 90", repeat: -1, ease: "none", duration: 3.6 });
  gsap.to("#sceneSpokeRoll", { rotation: 360, svgOrigin: "44 74", repeat: -1, ease: "none", duration: 5.2 });
  gsap.fromTo("#sceneBelt", { strokeDashoffset: 0 }, { strokeDashoffset: -12, repeat: -1, ease: "none", duration: 1.1 });

  /* La estela de píxeles del logo: se desprenden de la hoja recién impresa. */
  [["#scenePx1", 0], ["#scenePx2", 0.9], ["#scenePx3", 1.7]].forEach(([sel, delay]) => {
    gsap.to(sel, {
      keyframes: [
        { opacity: 0.15, y: 0, duration: 0 },
        { opacity: 1, y: -7, duration: 1.1, ease: "sine.out" },
        { opacity: 0.15, y: -14, duration: 1.1, ease: "sine.in" },
      ],
      repeat: -1, delay,
    });
  });

  /* El viaje: hoja → marca de registro → mensaje → entregado. */
  const cycle = gsap.timeline({ repeat: -1, repeatDelay: 1.0, defaults: { ease: "power1.inOut" } });
  cycle
    .set("#sceneSheet", { x: 216, opacity: 0, scale: 1 })
    .set("#sceneBubble", { x: 560, y: 112, opacity: 0, scale: 0.55 })
    .set("#sceneCheck", { opacity: 0, scale: 0.4, svgOrigin: "1022 134" })
    .to("#sceneSheet", { opacity: 1, duration: 0.35 })
    .to("#sceneSheet", { x: 560, duration: 2.1 }, "<")
    .to("#sceneRing", { scale: 1.13, duration: 0.22, yoyo: true, repeat: 1, svgOrigin: "560 112" }, ">-0.2")
    .to("#sceneSheet", { opacity: 0, scale: 0.5, duration: 0.3 }, "<")
    .to("#sceneBubble", { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }, "<0.12")
    .to("#sceneBubble", { x: 1022, y: 96, duration: 2.0 }, ">0.1")
    .to("#sceneBubble", { scale: 0.85, duration: 0.25 }, ">")
    .to("#sceneCheck", { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, ">-0.05")
    .to({}, { duration: 1.1 })
    .to(["#sceneBubble", "#sceneCheck"], { opacity: 0, duration: 0.5 });
}

/* ── Contador del sello de Atlantis ──────────────────────────────────────────
   Los "18 años" suben al entrar en pantalla. Es un dato, no un adorno. */
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
