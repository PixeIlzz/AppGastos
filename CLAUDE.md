# Hucha — app de control de gastos

## Qué es
PWA local de gastos personales, en español, para uso propio (mi pareja). Se instala desde el
navegador (Añadir a pantalla de inicio / Instalar app). Publicada con GitHub Pages.

## Reglas duras
- **Sin backend, sin dependencias, sin build.** Todo vive en `index.html` (HTML + CSS + JS en
  un solo archivo). Nada de React, Tailwind, npm ni CDNs. Si algo necesita una librería,
  proponlo antes en vez de instalarlo.
- **Los datos son del usuario.** `localStorage`, clave `hucha:v1`. Cualquier cambio de esquema
  pasa por la función `migrate()` y sube `SCHEMA_VERSION`. Nunca rompas datos existentes.
- **Importes en céntimos** (enteros). Nunca floats para dinero.
- **Fechas `YYYY-MM-DD` en hora local.** Prohibido `toISOString()` (desplaza el día por UTC).
- **Rutas relativas** (`./`), porque Pages sirve desde un subdirectorio.
- Al tocar `index.html`, `manifest.webmanifest` o los iconos, **sube la constante `CACHE` de
  `sw.js`** (`hucha-v1` → `hucha-v2`), o los móviles se quedan con la versión vieja.
- Móvil primero: respeta `env(safe-area-inset-*)`, objetivos táctiles de 44 px mínimo,
  `prefers-color-scheme` y `prefers-reduced-motion`.

## Archivos
- `index.html` — la app entera. Secciones marcadas con comentarios: datos/persistencia,
  utilidades, cálculos, fijos mensuales, vistas, hoja inferior, eventos, arranque.
- `sw.js` — service worker. Red primero para la página, caché si no hay conexión.
- `manifest.webmanifest`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`.

## Arquitectura
- Estado único `state` = `{ version, categories, tx, recurring, merchants }`, más `ui` para lo
  efímero (pestaña, mes visible, borrador de la hoja).
- `render()` pinta la pestaña activa en `#view`. Las vistas son funciones puras que devuelven
  HTML como string. Todo texto de usuario pasa por `esc()`.
- Eventos por delegación en `document` con `data-action`. No pongas `onclick` inline.
- `categories`: `{ id, kind:'expense'|'income', name, emoji, limit }` (límite mensual, en
  céntimos, 0 = sin límite).
- `tx`: `{ id, type, amount, categoryId, note, date, recurringId?, createdAt }`.
- `recurring`: fijos mensuales; `applyRecurring()` los apunta solos al abrir la app.
- `merchants`: mapa comercio → categoría, para autocompletar al pegar un pago de Apple Pay.

## Estética que quiero
Clean, minimalista, cozy y tranquila. Pasteles suaves, fondo crema, gris pizarra en vez de
negro, esquinas redondeadas, mucho aire, poca negrita. Modo oscuro cálido, nunca negro puro.
Sin sombras duras ni animaciones llamativas: solo las que responden a un toque.

## Cómo probar
No hay tests. Abre la app en un servidor local (`python3 -m http.server`) y comprueba a mano,
con el navegador en tamaño móvil: crear un gasto y un ingreso, editarlos y borrarlos, límites
por categoría, fijos mensuales, cambio de mes, resumen por semana/mes/año, exportar e importar
copia. Revisa la consola: no debe haber errores.

## No hagas sin preguntar
Añadir cuentas de usuario, sincronización, backend, analíticas, anuncios o cualquier cosa que
saque datos del teléfono.
