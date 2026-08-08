/* ============================================================================
   Tairos — comportamiento de la landing.
   Migrado sin cambios desde el <script> del HTML original, más la
   configuración de contacto centralizada.
   ========================================================================== */

/* ── Configuración de contacto ────────────────────────────────────────────────
   ⚠️ TODO: los dos únicos valores que tienes que editar en todo el proyecto.

   WHATSAPP_NUMBER — formato internacional, solo dígitos: sin +, sin espacios,
   sin guiones ni paréntesis. Ejemplo para +51 987 654 321 → "51987654321".
   Si dejas el + o los espacios, wa.me devuelve un 404.

   Se usan aquí (botones del CTA y del hero) y en chat-widget.js. Un solo lugar.
*/
export const WHATSAPP_NUMBER = "";              // ← TODO: pon tu número aquí
export const WHATSAPP_MESSAGE =
  "Hola Tairos, vi su sitio y quiero contarles qué proceso me quita más tiempo.";
export const EMAIL = "hola@tairos.com";         // ← TODO: pon tu correo real
export const EMAIL_SUBJECT = "Consulta desde el sitio de Tairos";

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

/* ── Scroll reveal (original) ─────────────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
}, { threshold:0.12 });
revealEls.forEach(el=>io.observe(el));

/* ── Bitácora en vivo del hero (original) ─────────────────────────────────── */
// ledger memory feed — signature element
const entries = [
  { t:'09:12', text:'Nueva cotización calculada para <b>pedido #452</b>.' },
  { t:'11:30', text:'Registrado criterio de precio para clientes recurrentes.' },
  { t:'14:05', text:'Ingreso registrado por voz — sin planilla.' },
  { t:'16:48', text:'Recordatorio de cobranza enviado automáticamente.' },
  { t:'—', text:'Este conocimiento ya no depende de una sola persona.' }
];
const body = document.getElementById('ledgerBody');
let i = 0;
function addEntry(){
  if(i >= entries.length) return;
  const row = document.createElement('div');
  row.className = 'ledger-entry';
  row.style.animationDelay = '0s';
  row.innerHTML = '<div class="ledger-time">'+entries[i].t+'</div><div class="ledger-text">'+entries[i].text+'</div>';
  body.appendChild(row);
  i++;
  setTimeout(addEntry, 900);
}
setTimeout(addEntry, 500);
