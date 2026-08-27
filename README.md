# Datayros — sitio web

Landing estática (HTML, CSS y JavaScript plano, sin frameworks) más una función
serverless que atiende el chat con la API de Anthropic. Desplegada en **Vercel**
(`www.datayros.com`) desde la rama `main`.

## Estructura

```
├── index.html            la one page completa
├── 404.html              página de error propia
├── css/style.css         estilos (temas día/noche con tokens)
├── js/
│   ├── main.js           contacto, tema, reveals, GSAP — la config de
│   │                     WhatsApp y correo está arriba del todo
│   └── chat-widget.js    interfaz del chat (habla con /api/chat)
├── api/
│   ├── chat.js           backend del chat — el único que ve la llave de API
│   └── _context.md       la memoria del asistente ← lo que más vas a editar
├── img/                  logos, favicon, og-image, iconos
├── vercel.json           redirecciones y cabeceras de seguridad
├── robots.txt · sitemap.xml · site.webmanifest
└── docs/                 notas internas (bloqueadas en producción)
```

## El chat

- `js/chat-widget.js` hace POST a `/api/chat`; `api/chat.js` llama a Anthropic
  (`claude-sonnet-4-6`, `max_tokens: 500`, system prompt cacheable).
  ⚠️ Si algún día subes el modelo a `claude-sonnet-5`, sube también
  `max_tokens`: el pensamiento extendido comparte ese presupuesto.
- **Requiere `ANTHROPIC_API_KEY`** en Vercel → *Settings → Environment
  Variables → Production* (márcala como Sensitive). Sin ella, el asistente
  responde con un mensaje que deriva a WhatsApp — no rompe, pero no conversa.
- Para cambiar lo que el asistente sabe, edita `api/_context.md` y despliega.
  Lo que no esté escrito ahí, el asistente dice que no lo sabe.
- El endpoint es público y trae topes de longitud; si llega tráfico real,
  añade un rate limit por IP (Vercel WAF o middleware).

## Desarrollo local

```bash
npx vercel dev        # sirve la estática y la función juntas
```

Abrir `index.html` a secas también funciona para ver la landing,
pero `/api/chat` solo existe bajo `vercel dev`.

## Deploy

Push a `main` → Vercel construye y publica solo (suele tardar menos de un
minuto). `vercel.json` bloquea `/docs`, `/preview` y demás archivos de trabajo,
y añade las cabeceras de seguridad.

## Contacto del sitio

Número de WhatsApp y correo viven en **un solo lugar**: las constantes de
arriba de `js/main.js`. Formato del número: internacional, solo dígitos
(`51933137048`) — con `+` o espacios, wa.me devuelve 404.
