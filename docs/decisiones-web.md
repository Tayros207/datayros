# Decisiones del sitio web de Tairos

*Documento vivo · última actualización: 8 de agosto de 2026*

Registro de qué se decidió, por qué, y qué queda pendiente. El objetivo es no
volver a discutir lo ya resuelto y no perder el contexto entre sesiones de
trabajo.

---

## 1. Estado actual

El sitio está **construido y verificado localmente, sin publicar.**

| Pieza | Estado |
|---|---|
| Landing (HTML/CSS/JS) | Lista. Migrada desde `6-8-26tairos_landing.html` sin cambiar copy ni diseño |
| Widget de chat | Construido y probado; **pendiente de decisión** si se publica |
| Backend del chat | Funciona. Verificado hasta la llamada real a la API de Anthropic |
| Favicon | Listo |
| Imagen de compartir (`og-image.png`) | Falta exportar desde `img/og-image.svg` |
| Analítica | No instalada |
| Dominio | No definido |

Verificaciones hechas en la migración: CSS idéntico regla por regla (188/188),
copy idéntico bloque por bloque (124/124), cero referencias geográficas,
sintaxis de los tres módulos JS validada, consola del navegador limpia.

---

## 2. Hallazgos del análisis de mercado

Investigación hecha el 7 de agosto de 2026. Fuentes al final.

**El chatbot que salta solo está contraindicado.** El 55% de los consumidores
descarta herramientas de IA que interrumpen la navegación. Las invitaciones
proactivas inmediatas se describen como "un extraño demasiado amigable invadiendo
tu espacio personal". Sí funcionan (3-5× más interacción) *cuando se disparan por
intención real*: tiempo en página, sección de precios, permanencia en un artículo.

**Un chatbot ya no diferencia.** El mercado de constructores web con IA llega a
$6.3 mil millones en 2026 y el resultado es un océano de sitios idénticos
—gradiente morado, tipografía Inter, cuatro tarjetas en grilla—, lo que la
industria llama *AI slop*. Un widget de chat entró en esa categoría: cualquiera
lo conecta en una tarde.

**El diseño actual ya es la respuesta a ese problema.** La dirección "cuaderno de
memoria" (papel crema, Newsreader serif, índigo, reglas punteadas, la bitácora en
vivo del hero) es lo opuesto exacto del patrón saturado. Diferencia más que un bot,
y ya está construida.

**Lo que los compradores B2B verifican en 2026:**

| Señal | Dato |
|---|---|
| Personas reales verificables | Se revisan más las páginas de equipo **precisamente por la proliferación de personas corporativas generadas con IA** |
| Casos con resultados nombrados | Contenido más influyente, citado por el 42% de compradores |
| Validación de terceros | Sin presencia externa (LinkedIn, reseñas) cuesta más confiar |
| Señal de precio | Su ausencia se interpreta como "no soy relevante para mi presupuesto" |
| Actividad reciente | Sin nada fechado en 12 meses, el sitio lee como abandonado |
| Velocidad | Un sitio lento señala inmadurez operativa |

**Consecuencia:** la carta del fundador (Moisés, 26 años, Atlantis como taller
real) es el activo más fuerte del sitio. Es lo único que un competidor no puede
copiar ni generar con IA.

**Referencias de conversión:** mediana en landing SaaS 3.8%. Un solo CTA convierte
13.5% frente a 10.5% con varios. Objetivo de LCP por debajo de 2.5s. Más de la
mitad de la investigación B2B ocurre en móvil.

---

## 3. El punto de partida: son dos problemas, no uno

**Problema A —** un cliente pregunta "¿cómo te ubico?" y no hay qué responder.
Urgente. Lo resuelve una URL que exista y se vea seria.

**Problema B —** demostrar capacidad de construir software con IA. No urgente, y
un chatbot es prueba débil.

Mezclarlos convierte una tarea de una semana en un proyecto de tres meses que
nunca se publica.

**Además, el sitio no es para captar clientes fríos: es para confirmar
legitimidad después de una reunión.** El tráfico viene de LinkedIn (Motor A) y
WhatsApp (Motor B), no de buscadores. Eso define lo que el sitio debe hacer bien:
cargar rápido, mostrar personas reales, dar un contacto que funcione.

---

## 4. Las tres opciones

| | Qué es | Tiempo | Riesgo | Resuelve |
|---|---|---|---|---|
| **A** | Tarjeta de presentación | 1-2 días | Ninguno | Problema A |
| **B** | A + asistente discreto | +2-3 días | Bajo | A + algo de B |
| **C** | A + demo real | 2-3 semanas | Alto (no salir nunca) | Prueba fuerte de B |

**A — Tarjeta de presentación.** La landing ya construida, sin el chat conectado.
Falta: WhatsApp real, dominio, imagen de compartir, analítica.

**B — Landing con asistente discreto.** A, más el chat ya construido, pero sin
popup automático: botón flotante, o invitación tras señal de interés real
(pasar la sección de preguntas, 40 s en página), una vez por sesión y descartable
para siempre.

**C — Landing con demo real.** A, más *una* micro-herramienta de la lista propia
de Tairos: auditor de páginas web, cotizador rápido, o convertidor de medidas a
troquel. Prueba de capacidad que nadie puede fingir y sirve de imán de contactos.

**Recomendación: A ahora, B después, C solo cuando el método 1-1-1 defina el
producto ganador.** Es la misma secuencia que defiende el documento
`Tairos_Landing_vs_Sitio_vs_Portafolio`.

**Decisión tomada:** ⬜ pendiente

---

## 5. Decisiones ya cerradas

| Decisión | Razón |
|---|---|
| Landing única, no sitio multipágina ni portafolio | La oferta sigue en validación (método 1-1-1); un portafolio con líneas sin validar es la sobre-promesa que el método existe para evitar |
| HTML estático, sin framework | Un solo mensaje, cambios pocas veces al año. Migrar a Astro el día que hagan falta 3+ landings |
| Cloudflare Pages | Gratis, SSL automático, funciones serverless incluidas, sin `npm install` |
| `claude-sonnet-4-6` en el chat | Suficiente para preguntas frecuentes; latencia y costo bajos |
| Sin referencias geográficas en el copy | Posicionamiento global deliberado. **Ver tensión abierta en §7** |
| "IA" aparece una sola vez y en segundo plano | Del addendum de posicionamiento: el mensaje va a resultados, no a tecnología |
| El contexto del asistente vive en un `.md`, no en código | Cambiar lo que el bot sabe no debe requerir tocar código ni redesplegar lógica |

---

## 6. Pendientes bloqueantes

Ninguno se puede resolver sin decisión de Moisés:

1. ~~**Número de WhatsApp**~~ — ✅ resuelto: `51933137048` en `js/main.js`.
2. **Dominio** — ¿registrado o hay que comprarlo? Aparece en `index.html`,
   `robots.txt` y `sitemap.xml`.
3. ~~**Correo real**~~ — ✅ resuelto: `tairosgraph@gmail.com` en `js/main.js`.
4. **Llave de API** — solo si se elige la opción B.

No bloqueantes pero baratos y de alto valor, según los hallazgos de §2:

- Analítica (Cloudflare Web Analytics: gratis, sin cookies, sin peso)
- Enlace a LinkedIn (validación de terceros)
- Señal de precio: no publicar tarifas, sí el modelo ("cobramos por resultado")
- Algo fechado, para que el sitio no lea como abandonado

---

## 7. Tensiones abiertas

**Geografía.** El copy no menciona ningún lugar, por decisión de posicionamiento
global. Pero el comprador descrito es una empresa industrial peruana a la que se
visita en persona, y el addendum sitúa a Tairos en Huancayo. Para ese comprador,
no saber dónde estás puede restar confianza en vez de sumar alcance.

Vale separar dos cosas: *el mensaje* puede ser global y aun así el pie de página
puede decir dónde estás. Hoy se está pagando el costo de ambas decisiones a la vez.

**Estado:** sin resolver, decisión de Moisés.

---

## 8. Riesgos conocidos si se elige B

1. **Compromisos inventados** — el bot da un precio o plazo que no existe, delante
   del cliente que preguntó "cómo te ubico". Riesgo comercial, no técnico.
   Mitigado en el prompt del sistema, no eliminado.
2. **Abuso de costo** — endpoint público sin límite por IP. Se resuelve con una
   regla de *Rate Limiting* en Cloudflare (Security → WAF) sobre `/chat`, desde el
   panel y sin tocar código.
3. **Captura de pantalla** — alguien lo hace decir algo tonto y lo comparte. Para
   una empresa que vende IA el daño es desproporcionado.
4. **Mantenimiento** — un bot roto o desactualizado es peor que no tener bot.

---

## 9. Notas técnicas heredadas

- **`knowledge/tairos-context.md` es público.** La función lo lee como asset
  estático del propio sitio (Workers no tiene sistema de archivos), así que queda
  accesible en el dominio. Es copy de marketing, no un secreto, y está bloqueado
  en `robots.txt`. Regla práctica: no escribir ahí nada que no se publicaría.
- **Esta carpeta `docs/` no se publica**, gracias a la regla `/docs/*` en el
  archivo `_redirects`. Cloudflare Pages no tiene forma de excluir archivos en
  despliegues desde git, así que la redirección es el mecanismo.
- **La ruta del chat es `/chat`, no `/functions/chat`.** En Cloudflare Pages el
  directorio `functions/` es convención de build, no parte de la URL.
- **Si algún día se cambia a `claude-sonnet-5`, hay que subir `max_tokens`.** En
  Sonnet 5 el pensamiento extendido viene activado por defecto y comparte
  presupuesto con la respuesta: con 500 se lo consumiría razonando y el visitante
  recibiría una respuesta cortada.

---

## Fuentes del análisis de mercado

- [WhosOn — buenas prácticas de invitaciones proactivas al chat](https://www.whoson.com/live-chat-best-practice/best-practice-proactive-chat-invitations/)
- [Oscar Chat — popups sin molestar (2026)](https://www.oscarchat.ai/blog/how-to-use-popups-without-annoying-visitors/)
- [LowCode — qué esperan los compradores B2B en 2026](https://www.lowcode.agency/blog/what-b2b-buyers-expect-on-a-vendor-website-in-2026)
- [Search Engine Journal — el déficit de confianza B2B](https://www.searchenginejournal.com/addressing-the-b2b-trust-deficit-how-to-win-buyers-in-2026/559267/)
- [925 Studios — guía de AI slop web design](https://www.925studios.co/blog/ai-slop-web-design-guide)
- [Shuffle — por qué los sitios generados con IA se parecen](https://shuffle.dev/blog/2026/01/why-do-most-ai-generated-websites-look-the-same/)
- [DevTk — self-hosting LLM vs API, costos reales 2026](https://devtk.ai/en/blog/self-hosting-llm-vs-api-cost-2026/)
- [Alpacked — guía de LLM autoalojado](https://alpacked.io/blog/self-hosted-llm-guide/)
- [Orbix — benchmarks de conversión B2B SaaS 2026](https://www.orbix.studio/blogs/b2b-saas-conversion-rate-benchmarks)
- [KlientBoost — errores comunes en landing pages](https://www.klientboost.com/landing-pages/landing-page-mistakes/)
