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
export const LINKEDIN_URL = ""; // TODO(Moisés): URL real del perfil.

/* TODO(Moisés) — fuera del alcance de este código, pero pendiente:
   · Crear contacto@datayros.com sobre el dominio propio y reemplazar EMAIL
     (hoy tairosgraph@gmail.com — un Gmail con la marca antigua resta seriedad
     B2B, pero no se cambia hasta que el buzón exista).
   · Instalar Vercel Web Analytics (un script, cero LCP) para que todos estos
     cambios sean medibles. */

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
  /* data-wa-msg deja que cada fila de la franja llegue ya etiquetada: sabes
     por qué puerta entró la persona antes de contestarle. */
  const href = el.dataset.waMsg ? whatsappUrl(el.dataset.waMsg) : waHref;
  el.setAttribute("href", href || emailUrl());
  if (href) {
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  }
});

document.querySelectorAll("[data-email]").forEach((el) => {
  el.setAttribute("href", emailUrl());
});

/* LinkedIn sin enlaces muertos: con la constante vacía, el cite de la carta
   vuelve a texto plano y la línea del footer desaparece — jamás se publica
   un enlace que no lleva a ningún lado. */
document.querySelectorAll("[data-linkedin]").forEach((el) => {
  if (LINKEDIN_URL) {
    el.setAttribute("href", LINKEDIN_URL);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  } else if (el.classList.contains("footer-line")) {
    el.hidden = true;
  } else {
    const t = document.createTextNode(el.textContent);
    el.replaceWith(t);
  }
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

    const nameField = document.getElementById("fullName");
    if (!name) {
      if (formStatus) {
        formStatus.textContent = "Escribe tu nombre para empezar";
        formStatus.classList.remove("ok");
      }
      nameField?.setAttribute("aria-invalid", "true");
      nameField?.focus();
      return;
    }
    nameField?.removeAttribute("aria-invalid");

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
    /* Recompensa del envío: el estado (que ya se pone verde con .ok) late al
       entrar y el botón rebota apenas — confirmación física de que el gesto
       llegó. Gateado por animate, como todo el movimiento. */
    if (animate) {
      gsap.fromTo("#formStatus", { opacity: 0, y: 4 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
      gsap.fromTo("#submitBtn", { scale: 0.97 },
        { scale: 1, duration: 0.35, ease: "back.out(1.7)" });
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
    /* Los chips de magnitud entran en la misma cascada que el resto de la
       fila: el encendido de color lo hace el CSS solo. */
    gsap.from(".compare-row .mag", {
      opacity: 0, duration: 0.3, ease: "power2.out",
      stagger: 0.055, overwrite: "auto", clearProps: "opacity",
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
   se condensa, la línea de progreso avanza y el botón del chat entra pasado
   el hero. Las cruces de registro del fondo quedan quietas a propósito. */
const nav = document.querySelector("nav");
const navProgress = document.getElementById("navProgress");
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

/* El subrayado del acento del H1 se dibuja al terminar la entrada. Sin JS la
   regla base del CSS lo deja ya dibujado; con reduced-motion el nuke global
   lo hace casi instantáneo. */
const heroAccent = document.querySelector(".hero h1 .accent");
if (heroAccent) {
  if (animate) setTimeout(() => heroAccent.classList.add("drawn"), 900);
  else heroAccent.classList.add("drawn");
}

/* ── La franja de oficios ─────────────────────────────────────────────────────
   Los tres nombres se imprimen de izquierda a derecha, uno tras otro: es el
   mismo gesto de la prensa que dibujaba la escena anterior, ahora hecho con
   las palabras que había que leer. Corre UNA vez, sin bucles. Al ser
   gsap.from, si el observador nunca dispara la franja se ve completa. */
const capRows = document.querySelector("[data-cap-rows]");
if (capRows && animate) {
  if (window.matchMedia("(max-width:820px)").matches) {
    /* En el teléfono la franja apilada mide más de una pantalla: animarla
       agrupada dejaría las filas 02–04 imprimiéndose fuera de vista. Cada
       fila se imprime al entrar ella misma en pantalla — mismo gesto, y
       todo transform/opacity: cero costo de maquetación. */
    const ioCap = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        ioCap.unobserve(e.target);
        const cap = e.target;
        gsap.from(cap.querySelector(".cap-title"), {
          clipPath: "inset(0 100% 0 0)", duration: 0.62, ease: "power3.out",
          clearProps: "clipPath",
        });
        gsap.from(cap.querySelectorAll(".cap-n,.cap-tag,.cap-sub,.cap-go"), {
          opacity: 0, y: 10, duration: 0.5, ease: "power2.out",
          stagger: 0.03, delay: 0.12,
        });
      });
    }, { threshold: 0.35, rootMargin: "0px 0px -8% 0px" });
    capRows.querySelectorAll(".cap").forEach((c) => ioCap.observe(c));
  } else {
    /* Escritorio: la franja entera cabe en pantalla y los nombres se
       imprimen de izquierda a derecha, uno tras otro. */
    const io3 = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io3.unobserve(e.target);
        gsap.from(capRows.querySelectorAll(".cap-title"), {
          clipPath: "inset(0 100% 0 0)", duration: 0.62, ease: "power3.out",
          stagger: 0.09, clearProps: "clipPath",
        });
        gsap.from(capRows.querySelectorAll(".cap-n, .cap-tag, .cap-sub, .cap-go"), {
          opacity: 0, y: 10, duration: 0.5, ease: "power2.out",
          stagger: 0.03, delay: 0.12,
        });
      });
    }, { threshold: 0.2 });
    io3.observe(capRows);
  }
}

/* ── La prueba (#demo): el hilo se escribe solo ───────────────────────────────
   El guion completo vive en el HTML: sin GSAP o con reduced-motion el ticket
   se lee entero y quieto, sin typing. Con animación, cada burbuja entra en
   orden y antes de cada respuesta del asistente se asoma un "escribiendo…"
   temporal (~6s en total, UNA sola vez). autoAlpha y no display: cada
   burbuja oculta conserva su altura — cero saltos de maquetación. */
const demoLog = document.querySelector("#demo .ticket-log");
if (demoLog && animate) {
  const items = [...demoLog.children];
  gsap.set(items, { autoAlpha: 0, y: 8 });
  const ioDemo = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      ioDemo.unobserve(e.target);
      const tl = gsap.timeline();
      items.forEach((item) => {
        if (item.classList.contains("chat-msg-note")) {
          tl.to(item, { autoAlpha: 1, y: 0, duration: 0.3 }, "+=0.35");
        } else if (item.classList.contains("chat-msg-bot")) {
          /* Burbuja temporal de typing: los puntos ya existen en el CSS del
             chat (.chat-typing). Se inserta, respira .7s y se retira antes
             de que entre la respuesta real. */
          let typing = null;
          tl.call(() => {
            typing = document.createElement("div");
            typing.className = "chat-msg chat-msg-bot";
            typing.innerHTML =
              '<div class="who">Asistente</div><div class="body">' +
              '<span class="chat-typing"><i></i><i></i><i></i></span></div>';
            demoLog.insertBefore(typing, item);
          });
          tl.to({}, { duration: 0.7 });
          tl.call(() => { if (typing) typing.remove(); });
          tl.to(item, { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" });
        } else {
          tl.to(item, { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" }, "+=0.5");
        }
      });
    });
  }, { threshold: 0.35 });
  ioDemo.observe(demoLog);
}

/* El enlace bajo el ticket abre el chat vivo de la página. Aquí solo se
   despacha el evento: quién lo escucha y cómo abre el panel es asunto de
   chat-widget.js — main.js no toca el widget. */
const demoOpenChat = document.querySelector(".demo-open-chat");
if (demoOpenChat) {
  demoOpenChat.addEventListener("click", (ev) => {
    ev.preventDefault();
    document.dispatchEvent(new CustomEvent("dy:open-chat"));
  });
}

/* ── Firma de la carta ────────────────────────────────────────────────────────
   El trazo se dibuja al entrar en pantalla, como quien firma delante de ti.
   El dash SOLO se aplica dentro del bloque animate: sin GSAP o con
   reduced-motion la firma nace completa. */
const signPath = document.querySelector(".sign-path");
if (signPath && animate) {
  const signLen = signPath.getTotalLength();
  gsap.set(signPath, { strokeDasharray: signLen, strokeDashoffset: signLen });
  /* Se observa el <svg> contenedor, no el <path>: mismo umbral, mejor soporte. */
  const signSvg = signPath.closest("svg") || signPath;
  const ioSign = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      ioSign.unobserve(e.target);
      gsap.to(signPath, { strokeDashoffset: 0, duration: 1.2, ease: "power2.out" });
    });
  }, { threshold: 0.5 });
  ioSign.observe(signSvg);
}

/* ── El método: la línea de producción se tiende ──────────────────────────────
   La regla se estira (scaleX en escritorio, scaleY en la columna móvil) y los
   cuatro pasos se cuelgan de ella en cascada corta — UNA sola pasada, sin
   bucles: la demo (#demo) sigue siendo la única pieza con timeline larga.
   gsap.from + estado final en CSS: sin GSAP o con reduced-motion la línea y
   los pasos nacen completos y quietos. */
const mRow = document.querySelector(".method-row");
if (mRow && animate) {
  const rule = mRow.querySelector(".method-rule");
  const vertical = window.matchMedia("(max-width:860px)").matches;
  const ioMethod = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      ioMethod.unobserve(e.target);
      gsap.from(rule, vertical
        ? { scaleY: 0, duration: 0.8, ease: "power3.out" }
        : { scaleX: 0, duration: 0.8, ease: "power3.out" });
      gsap.from(mRow.querySelectorAll(".method-step"), {
        opacity: 0, y: 10, duration: 0.5, ease: "power2.out", stagger: 0.12, delay: 0.15,
      });
    });
  }, { threshold: 0.25 });
  ioMethod.observe(mRow);
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
