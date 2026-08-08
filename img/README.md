# img/

## `favicon.svg` ✅

Listo. Punto índigo + "T" en Newsreader sobre papel, igual que el logo del nav.
Reemplázalo si tienes una marca definitiva.

## `og-image.png` ⚠️ falta generarlo

Es la miniatura que se ve cuando alguien comparte el enlace en WhatsApp,
LinkedIn, Slack o X. **Sin ella, el enlace se comparte como un bloque de texto
gris** — que es exactamente el primer contacto que no quieres dar.

`index.html` ya la referencia en `og:image` y `twitter:image`.

### Cómo generarla

Tienes `og-image.svg` en esta carpeta como plantilla, ya en la dirección visual
del cuaderno. Ábrela en Figma, Illustrator o Inkscape y expórtala como PNG:

- **Tamaño exacto:** 1200 × 630 px (relación 1.91:1).
- **Peso:** por debajo de 300 KB; algunas plataformas descartan imágenes pesadas.
- **Formato:** PNG o JPG. **WebP no** — varios lectores de Open Graph aún no lo
  soportan y mostrarían el enlace sin imagen.

Si las tipografías Newsreader y Space Grotesk no están instaladas en tu
máquina, conviértelas a trazos antes de exportar o el PNG saldrá con la fuente
de reemplazo.

### Qué debe contener

- El logo de Tairos (punto índigo + nombre en Newsreader itálica).
- El titular, corto y legible en miniatura — se ve a ~400 px de ancho en el
  teléfono, así que nada por debajo de ~40 px de altura tipográfica.
- Fondo papel `#F6F3EC`, acento índigo `#2B3F6B`.
- **Sin referencias geográficas** — el posicionamiento de Tairos es global.
- Sin cifras que no puedas sostener: lo que va en esta imagen es lo primero que
  se lee, y se comparte fuera de contexto.

### Comprobarlo antes de publicar

Pega la URL del sitio en el depurador de LinkedIn
(`linkedin.com/post-inspector`) o en el de Facebook
(`developers.facebook.com/tools/debug`) para forzar el refresco de caché y ver
cómo queda de verdad.
