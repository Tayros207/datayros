/**
 * Datayros — backend del chat (Cloudflare Pages Function).
 *
 * Es el único punto del proyecto que habla con la API de Anthropic, y por lo
 * tanto el único que ve la llave. El navegador nunca la toca.
 *
 * Ruta pública: POST /chat
 *   En Cloudflare Pages, `functions/chat.js` se publica en `/chat`. El
 *   directorio `functions/` es convención de build, no parte de la URL.
 *   Si quieres `/api/chat`, mueve este archivo a `functions/api/chat.js` y
 *   actualiza ENDPOINT en js/chat-widget.js.
 *
 * Entrada:  { message: string, history?: [{ role: "user"|"assistant", content: string }] }
 * Salida:   { reply: string }
 *
 * Requiere la variable de entorno ANTHROPIC_API_KEY (ver README).
 */

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 500;
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

const CONTEXT_PATH = "/knowledge/tairos-context.md";

// Topes de entrada. El endpoint es público: sin ellos, cualquiera puede gastar
// la cuota mandando conversaciones enormes.
const MAX_MESSAGE_CHARS = 1500;
const MAX_HISTORY_TURNS = 12;
const MAX_TOTAL_CHARS = 12000;

/** Lo que respondemos cuando la API falla. Nunca dejamos al visitante sin salida. */
const FALLBACK_REPLY =
  "Ahora mismo no puedo responderte por aquí. Escríbenos por WhatsApp con el " +
  "botón de arriba y te contesta directamente alguien del equipo de Datayros.";

const TONE_INSTRUCTIONS = `Eres el asistente del sitio web de Datayros. Conversas con visitantes que están conociendo Datayros, normalmente dueños o responsables de una pyme.

Cómo respondes:
- En español, con calidez y de forma directa, sin tecnicismos. Habla de "tú".
- Como alguien que entiende el negocio del visitante, no como un folleto. Preguntas breves para entender qué proceso le quita tiempo funcionan mejor que discursos.
- Respuestas cortas: dos o tres frases bastan casi siempre. Esto es un widget de chat, no un documento.
- Nada de listas largas ni de encabezados. Prosa conversacional.

Límites que no cruzas:
- Nunca finjas ser una persona. Si te preguntan si eres humano, dilo con naturalidad: eres el asistente de Datayros, y el equipo humano está a un mensaje de WhatsApp.
- Nunca inventes precios, porcentajes de ahorro, plazos, casos de éxito ni ninguna cifra que no esté en el contexto de abajo. Si te preguntan por precio, explica que Datayros cobra por resultado y que el monto depende del proceso puntual, e invita a conversarlo con el equipo.
- Todo lo que sabes sobre Datayros está en el contexto de abajo. Si te preguntan algo que no está ahí, dilo sin rodeos y ofrece el WhatsApp.
- Si te preguntan algo ajeno a Datayros, responde brevemente y vuelve al tema.

Cuando cerrar hacia el equipo humano:
- Si el visitante muestra intención real (pregunta precios, pide una demo, deja su número o su correo, o describe un problema concreto que quiere resolver ya), invítalo a seguir la conversación por WhatsApp con el equipo de Datayros. No intentes cerrar tú la venta ni pedirle datos de contacto: tu trabajo es que llegue bien informado a esa conversación.
- Invita una vez, con naturalidad, y sigue conversando. No insistas en cada mensaje.

A continuación, el contexto de la empresa. Es tu única fuente de verdad:`;

/**
 * El .md se sirve como asset estático del sitio, así que lo leemos por
 * env.ASSETS y lo cacheamos en el módulo: es idéntico en cada petición y
 * releerlo sería desperdicio. Se refresca en cada despliegue.
 */
let cachedContext = null;

async function loadContext(env, requestUrl) {
  if (cachedContext !== null) return cachedContext;

  const res = await env.ASSETS.fetch(new URL(CONTEXT_PATH, requestUrl));
  if (!res.ok) {
    throw new Error(`No se pudo leer ${CONTEXT_PATH} (HTTP ${res.status})`);
  }
  cachedContext = await res.text();
  return cachedContext;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

/**
 * Deja pasar solo lo que necesitamos: turnos user/assistant con texto plano.
 * Cualquier otra cosa se rechaza antes de gastar un token.
 */
function buildMessages(payload) {
  const message = typeof payload?.message === "string" ? payload.message.trim() : "";
  if (!message) return { error: "Escribe un mensaje para continuar." };
  if (message.length > MAX_MESSAGE_CHARS) {
    return { error: "Ese mensaje es muy largo. ¿Puedes resumirlo un poco?" };
  }

  const rawHistory = Array.isArray(payload?.history) ? payload.history : [];
  const messages = [];
  let total = message.length;

  // Solo los turnos más recientes: el resto no aporta y encarece cada llamada.
  for (const turn of rawHistory.slice(-MAX_HISTORY_TURNS)) {
    if (turn?.role !== "user" && turn?.role !== "assistant") continue;
    if (typeof turn.content !== "string") continue;
    const content = turn.content.trim();
    if (!content) continue;
    total += content.length;
    if (total > MAX_TOTAL_CHARS) break;
    messages.push({ role: turn.role, content });
  }

  // La API exige que el primer turno sea del usuario y que no haya dos
  // seguidos del mismo rol al final.
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (messages.length && messages[messages.length - 1].role === "user") messages.pop();

  messages.push({ role: "user", content: message });
  return { messages };
}

export async function onRequestPost({ request, env }) {
  if (!env.ANTHROPIC_API_KEY) {
    console.error("Falta ANTHROPIC_API_KEY en las variables de entorno.");
    return json({ reply: FALLBACK_REPLY });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ reply: "No entendí ese mensaje. ¿Lo escribes de nuevo?" }, 400);
  }

  const { messages, error } = buildMessages(payload);
  if (error) return json({ reply: error }, 400);

  try {
    const context = await loadContext(env, request.url);

    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        // El system prompt es idéntico en cada llamada. Marcarlo como cacheable
        // hace que a partir de la segunda petición se cobre ~10% de su costo de
        // entrada. Se invalida solo cuando editas el .md — que es lo esperado.
        system: [
          {
            type: "text",
            text: `${TONE_INSTRUCTIONS}\n\n---\n\n${context}`,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages,
      }),
    });

    if (!res.ok) {
      // Cuota agotada, llave inválida, sobrecarga… El visitante no necesita
      // el detalle, pero nosotros sí lo queremos en los logs.
      const detail = await res.text().catch(() => "");
      console.error(`Anthropic respondió ${res.status}:`, detail.slice(0, 500));
      return json({ reply: FALLBACK_REPLY });
    }

    const data = await res.json();

    // Claude puede declinar una petición: llega HTTP 200 con stop_reason
    // "refusal" y content vacío. Hay que mirar stop_reason antes que content.
    if (data.stop_reason === "refusal") {
      return json({
        reply:
          "Prefiero no responder a eso. ¿Te cuento cómo trabajamos o qué " +
          "procesos solemos resolver?",
      });
    }

    const reply = (data.content || [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    return json({ reply: reply || FALLBACK_REPLY });
  } catch (err) {
    console.error("Error llamando a la API de Anthropic:", err);
    return json({ reply: FALLBACK_REPLY });
  }
}
