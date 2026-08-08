# Tairos — sitio web

Landing estática (HTML, CSS y JavaScript plano, sin frameworks) más una función
serverless que atiende el chat con la API de Anthropic.

## Estructura

```
tairos-web/
├── index.html                  landing (solo marcado)
├── css/style.css               estilos del sitio + del widget de chat
├── js/
│   ├── main.js                 config de contacto, scroll-reveal, bitácora del hero
│   └── chat-widget.js          interfaz del chat
├── functions/chat.js           backend — el único que ve la llave de API
├── knowledge/tairos-context.md la memoria del asistente ← lo que más vas a editar
├── img/
│   ├── favicon.svg             listo
│   ├── og-image.svg            plantilla para exportar
│   └── (og-image.png)          falta — ver img/README.md
├── .env.example
├── .gitignore
├── robots.txt
├── sitemap.xml
└── README.md
```

## Antes de publicar

Cuatro `TODO` reales, todos en un solo lugar cada uno:

| Qué | Dónde |
|---|---|
| Número de WhatsApp y correo | `js/main.js`, arriba del todo |
| Dominio (`tairos.com`) | `index.html`, `robots.txt`, `sitemap.xml` |
| `og-image.png` | ver `img/README.md` |
| Llave de API | panel de Cloudflare (abajo) |

**El número de WhatsApp va en formato internacional, solo dígitos**: sin `+`,
sin espacios ni guiones. Para +51 987 654 321 → `"51987654321"`. Con el `+` o
con espacios, `wa.me` devuelve 404. Mientras esté vacío, los botones de WhatsApp
caen al correo automáticamente para que ningún enlace quede muerto.

## Correr el proyecto localmente

El sitio es estático, pero el chat necesita que la función se ejecute. Con
Wrangler (viene con Node):

```bash
cd tairos-web
echo "ANTHROPIC_API_KEY=sk-ant-..." > .dev.vars    # ignorado por git
npx wrangler pages dev .
```

Abre la URL que imprime (normalmente `http://localhost:8788`). Ahí conviven el
HTML estático y la función en `/chat`.

Ojo: **abrir `index.html` con doble clic no sirve** para probar el chat — no hay
backend y las peticiones a `/chat` fallan. El resto de la landing sí se ve bien.

Wrangler lee la llave de `.dev.vars`, no de `.env`. `.env.example` está como
referencia de qué variable hace falta; ambos archivos están en `.gitignore`.

## Desplegar en Cloudflare Pages

1. Sube el repo a GitHub y **verifica que `.env` y `.dev.vars` no aparezcan** en
   el commit.
2. En Cloudflare: *Workers & Pages → Create → Pages → Connect to Git*.
3. Configuración de build:
   - **Framework preset:** None
   - **Build command:** *(vacío)*
   - **Build output directory:** `/`
4. *Settings → Environment variables → Production* → añade
   `ANTHROPIC_API_KEY` con tu llave de [console.anthropic.com](https://console.anthropic.com).
   Márcala como **Secret** para que quede encriptada y no se pueda volver a leer.
   Cloudflare no lee tu `.dev.vars` local: hay que declararla aquí.
5. Repite el paso 4 en el entorno *Preview* si quieres que el chat funcione en
   las ramas de prueba.
6. Deploy. Cloudflare detecta `functions/` solo, sin configuración extra.

### La ruta del endpoint

En Cloudflare Pages, `functions/chat.js` se publica en **`/chat`** — el
directorio `functions/` es convención de build, no parte de la URL. Si prefieres
`/api/chat`, mueve el archivo a `functions/api/chat.js` y cambia `ENDPOINT` en
`js/chat-widget.js`.

### Si prefieres Netlify

Funciona con dos cambios:

1. Añade un `netlify.toml` con `[build] publish = "." ` y
   `functions = "functions"`.
2. En `functions/chat.js`, cambia la firma `export async function onRequestPost({ request, env })`
   por `export default async (req, context) => {}`, lee la llave de
   `process.env.ANTHROPIC_API_KEY` en vez de `env.ANTHROPIC_API_KEY`, y
   reemplaza `env.ASSETS.fetch(...)` por una lectura con `node:fs` más
   `included_files = ["knowledge/**"]` en el toml.

La variable de entorno se declara igual, en *Site settings → Environment variables*.

## Cómo cambiar lo que responde el chat

Edita `knowledge/tairos-context.md` y vuelve a desplegar. Ese archivo se
convierte en el system prompt: **lo que no esté escrito ahí, el asistente no lo
sabe**, y está instruido para decirlo en vez de inventarlo.

No hace falta tocar `functions/chat.js` para cambiar servicios, objeciones o
tono. El código solo cambia si quieres alterar el comportamiento técnico.

Las instrucciones de tono (no fingir ser humano, no inventar cifras, derivar a
WhatsApp cuando hay intención de compra) están en la constante
`TONE_INSTRUCTIONS` de `functions/chat.js`.

## Notas técnicas

- **La llave nunca llega al navegador.** El front habla con `/chat`; solo la
  función habla con Anthropic.
- **Modelo:** `claude-sonnet-4-6`, `max_tokens: 500`.
  ⚠️ Si algún día lo cambias a `claude-sonnet-5`, sube también `max_tokens`. En
  Sonnet 5 el pensamiento extendido viene activado por defecto y comparte ese
  presupuesto con la respuesta: con 500 se lo consumiría razonando y el
  visitante recibiría una respuesta cortada a media frase.
- **Caché del prompt.** El system prompt va marcado como cacheable, así que
  desde la segunda llamada su costo de entrada baja ~90%. Se invalida cada vez
  que editas el `.md` — es lo esperado.
- **`knowledge/tairos-context.md` es público.** La función lo lee como asset
  estático del propio sitio (Workers no tiene sistema de archivos), así que
  queda accesible en `tudominio.com/knowledge/tairos-context.md`. Es copy de
  marketing, no un secreto, y está bloqueado en `robots.txt`. Aun así: no
  escribas ahí nada que no publicarías.
- **El endpoint es público.** Ya trae topes de longitud de mensaje e historial.
  No trae límite por IP: si el sitio recibe tráfico real, añade una regla de
  *Rate Limiting* en Cloudflare (Security → WAF) sobre la ruta `/chat`. Se
  configura en el panel, sin tocar código.
- **Sin dependencias.** El backend usa `fetch` nativo del runtime de Workers y
  el widget es JavaScript plano. No hay `package.json` ni `npm install`.
