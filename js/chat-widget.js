/* ============================================================================
   Datayros — widget de chat.

   Solo interfaz: abrir/cerrar, burbujas, "escribiendo…" y la llamada al
   endpoint propio. No sabe nada de Anthropic ni de la llave — eso vive en
   functions/chat.js. JavaScript plano, sin dependencias.
   ========================================================================== */

import { whatsappUrl, emailUrl } from "./main.js";

/* En Cloudflare Pages, functions/chat.js se publica en /chat.
   Si mueves la función a functions/api/chat.js, cambia esto por "/api/chat". */
const ENDPOINT = "/chat";

const MAX_HISTORY = 12; // turnos que reenviamos (el backend topa igual)

const WELCOME =
  "Hola, soy el asistente de Datayros. Puedo ayudarte a identificar dónde se " +
  "frena tu operación, contarte cómo validamos soluciones en Atlantis o " +
  "derivarte al equipo por WhatsApp.";

const root = document.getElementById("chatRoot");
if (root) mount(root);

function mount(root) {
  const contactHref =
    whatsappUrl("Hola Datayros, estaba en su sitio y quiero hacerles una consulta.") ||
    emailUrl();
  const contactLabel = whatsappUrl() ? "Abrir WhatsApp" : "Escribir un correo";

  root.innerHTML = `
    <button class="chat-fab" type="button" data-fab aria-haspopup="dialog">
      <span class="fab-dot" aria-hidden="true"></span> Pregúntale a Datayros
    </button>

    <div class="chat-panel" data-panel role="dialog" aria-label="Asistente de Datayros" hidden>
      <div class="chat-head">
        <div>
          <h3>Pregúntale a Datayros</h3>
          <div class="chat-sub">Asistente del sitio</div>
        </div>
        <button class="chat-close" type="button" data-close aria-label="Cerrar el chat">&times;</button>
      </div>

      <div class="chat-wa">
        <span>¿Prefieres hablar con una persona?</span>
        <a href="${contactHref}" target="_blank" rel="noopener">${contactLabel}</a>
      </div>

      <div class="chat-log" data-log role="log" aria-live="polite"></div>

      <form class="chat-form" data-form>
        <textarea class="chat-input" data-input rows="1" aria-label="Tu mensaje"
                  placeholder="Escribe tu pregunta…" maxlength="1500"></textarea>
        <button class="chat-send" type="submit" data-send>Enviar</button>
      </form>
    </div>
  `;

  const fab = root.querySelector("[data-fab]");
  const panel = root.querySelector("[data-panel]");
  const log = root.querySelector("[data-log]");
  const form = root.querySelector("[data-form]");
  const input = root.querySelector("[data-input]");
  const sendBtn = root.querySelector("[data-send]");

  /* Historial en memoria. Se pierde al recargar, y está bien: el visitante
     empieza limpio y no guardamos nada suyo en ningún lado. */
  const history = [];
  let busy = false;
  let opened = false;

  /* ── Abrir / cerrar ─────────────────────────────────────────────────────── */

  function open() {
    panel.hidden = false;
    fab.hidden = true;
    if (!opened) {
      addMessage("bot", WELCOME);
      opened = true;
    }
    input.focus();
  }

  function close() {
    panel.hidden = true;
    fab.hidden = false;
    fab.focus();
  }

  fab.addEventListener("click", open);
  root.querySelector("[data-close]").addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) close();
  });

  /* ── Composición del mensaje ────────────────────────────────────────────── */

  // El textarea crece con el texto hasta el tope que fija el CSS.
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = `${input.scrollHeight}px`;
  });

  // Enter envía; Shift+Enter hace salto de línea.
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || busy) return;
    input.value = "";
    input.style.height = "auto";
    send(text);
  });

  /* ── Burbujas ───────────────────────────────────────────────────────────── */

  /**
   * Construye una burbuja. Usamos textContent y no innerHTML: el texto viene
   * de un modelo de lenguaje y del propio visitante, así que nunca lo tratamos
   * como HTML.
   */
  function addMessage(who, text) {
    const el = document.createElement("div");
    el.className = `chat-msg chat-msg-${who}`;

    const label = document.createElement("div");
    label.className = "who";
    label.textContent = who === "bot" ? "Datayros" : "Tú";

    const body = document.createElement("div");
    body.className = "body";
    for (const chunk of String(text).split(/\n{2,}/)) {
      const p = document.createElement("p");
      p.textContent = chunk.replace(/\n/g, " ");
      body.appendChild(p);
    }

    el.append(label, body);
    log.appendChild(el);
    scrollDown();
    return el;
  }

  function addTyping() {
    const el = document.createElement("div");
    el.className = "chat-msg chat-msg-bot";
    el.innerHTML = `
      <div class="who">Datayros</div>
      <div class="body">
        <span class="chat-typing" role="status" aria-label="Escribiendo">
          <i></i><i></i><i></i>
        </span>
      </div>`;
    log.appendChild(el);
    scrollDown();
    return el;
  }

  function scrollDown() {
    log.scrollTop = log.scrollHeight;
  }

  function setBusy(value) {
    busy = value;
    sendBtn.disabled = value;
    input.disabled = value;
    if (!value) input.focus();
  }

  /* ── Envío ──────────────────────────────────────────────────────────────── */

  async function send(text) {
    setBusy(true);
    addMessage("user", text);

    const typing = addTyping();

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: history.slice(-MAX_HISTORY),
        }),
      });

      // El backend siempre devuelve { reply } con un mensaje presentable,
      // incluso cuando la API de Anthropic falló. Solo tratamos como error
      // lo que ni siquiera trae JSON.
      const data = await res.json().catch(() => null);
      const reply = data?.reply?.trim();

      typing.remove();

      if (!reply) throw new Error("respuesta vacía");

      addMessage("bot", reply);

      // El turno solo entra al historial cuando hubo ida y vuelta completa,
      // para no reenviar preguntas que quedaron sin responder.
      history.push({ role: "user", content: text });
      history.push({ role: "assistant", content: reply });
    } catch {
      typing.remove();
      addMessage(
        "bot",
        "Se me cortó la conexión. Intenta de nuevo en un momento, o escríbenos " +
          "por WhatsApp con el botón de arriba y te responde el equipo.",
      );
    } finally {
      setBusy(false);
    }
  }
}
