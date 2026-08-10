# img/

## `favicon.svg` ✅

Punto índigo + "T" en Newsreader sobre papel, igual que el logo del nav.

## `moises-escobar.jpg` ✅

Retrato del fundador, dentro del recuadro de la sección "Quién te escribe".

Procesada desde el original `201.jpg` (que quedó de respaldo en
`TAIROS_WEB01/201-original-moises.jpg`, fuera del repositorio):

| | Antes | Después |
|---|---|---|
| Peso | 612.4 KB | **27.4 KB** (−95.5%) |
| Dimensiones | 422 × 414 | 422 × 414 (sin cambios) |
| Nitidez | — | máscara de enfoque (a = 0.30) |

**Cómo queda encuadrada.** La foto es casi cuadrada (proporción 1.019) y el
marco es vertical (1/1.15), así que `object-fit: cover` la ajusta a lo alto y
recorta **8.6% por cada lado** — justo lo que saca la ventana del fondo. No hay
recorte vertical: la persona se ve completa.

**Límite de nitidez conocido.** En escritorio el recuadro mide unos 317 px de
ancho, así que 422 px se reducen y se ven nítidos. En pantallas retina (2×)
harían falta ~634 px de origen; con 422 el navegador amplía y se percibe algo
suave. Si aparece el original en mayor resolución, reemplazar el archivo mejora
esto sin tocar código — el CSS no depende del tamaño.

**Si se reemplaza:** basta con sobrescribir `moises-escobar.jpg`. Si el archivo
llegara a faltar, `js/main.js` retira la imagen y la tarjeta vuelve sola a las
iniciales "M.E." sobre papel, sin ícono de imagen rota.

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
