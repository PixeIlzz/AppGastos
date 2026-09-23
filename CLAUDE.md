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
  `sw.js`** (`hucha-v3` → `hucha-v4`…), o los móviles se quedan con la versión vieja.
- Móvil primero: respeta `env(safe-area-inset-*)`, objetivos táctiles de 44 px mínimo,
  `prefers-color-scheme` y `prefers-reduced-motion`.

## Archivos
- `index.html` — la app entera. Secciones marcadas con comentarios: datos/persistencia,
  utilidades, cálculos, fijos mensuales, vistas, hoja inferior, eventos, arranque.
- `sw.js` — service worker. Red primero para la página (con 3 s de margen), caché si no hay
  conexión o la red va lenta.
- `manifest.webmanifest` (incluye los atajos de Android), `icon-192.png`, `icon-512.png`,
  `apple-touch-icon.png`, `shortcut-gasto.png`, `shortcut-ingreso.png`. Los iconos de atajo no
  van en `ASSETS` del service worker: si faltara uno, fallaría toda la instalación offline.

## Arquitectura
- Estado único `state` = `{ version, categories, tx, recurring, merchants, prefs }`, más `ui`
  para lo efímero (pestaña, mes visible, búsqueda, borrador de la hoja…). Esquema actual: 2.
- `render()` pinta la pestaña activa en `#view`. Las vistas son funciones puras que devuelven
  HTML como string. Todo texto de usuario pasa por `esc()`.
- Eventos por delegación en `document` con `data-action`. No pongas `onclick` inline.
- `categories`: `{ id, kind:'expense'|'income', name, emoji, limit, color }` (límite mensual,
  en céntimos, 0 = sin límite; `color` es un tono de `TONES`, que mapea a `--<tono>` y
  `--<tono>-soft` en el CSS).
- `tx`: `{ id, type, amount, categoryId, note, date, recurringId?, createdAt }`.
- `recurring`: fijos mensuales; `applyRecurring()` los apunta solos al abrir la app.
- `merchants`: mapa comercio → categoría, para autocompletar al pegar un pago de Apple Pay.
- `prefs`: `{ theme:'auto'|'light'|'dark', quickPaste:null|bool, lastBackup, lastPaste }`.
- La paleta entera está en variables CSS en `:root` (claro) y repetida para oscuro. No pongas
  colores sueltos fuera de ahí: los pasteles son rellenos y cada uno tiene su versión `-text`
  o `-ink` para texto con contraste suficiente.
- Hojas inferiores: `openSheet()` / `closeSheet()`. Abrir una hoja mete una entrada en el
  historial para que «atrás» en Android la cierre. Confirmaciones con `ask()`, nunca
  `confirm()`. Borrados con `withUndo()` (aviso con «Deshacer»).
- Entrada por URL: `?nuevo=gasto|ingreso` (atajos del icono) y
  `?importe=12,50&comercio=X[&tipo=ingreso]` (automatizaciones). El portapapeles acepta
  `GASTO|importe|comercio|fecha` (la automatización de Apple Pay) o un importe suelto.
- iOS no admite atajos en el icono ni abrir la app instalada desde Atajos con datos: por eso
  en iPhone el flujo es portapapeles + botón «Pegar pago».

## Estética que quiero
Clean, minimalista, cozy y tranquila. Pasteles suaves, fondo crema, gris pizarra en vez de
negro, esquinas redondeadas, mucho aire, poca negrita. Modo oscuro cálido, nunca negro puro.
Sin sombras duras ni animaciones llamativas: solo las que responden a un toque.

## Cómo probar
No hay tests. Abre la app en un servidor local y comprueba a mano, con el navegador en tamaño
móvil: crear un gasto y un ingreso, editarlos y borrarlos (y deshacer), límites por categoría,
fijos mensuales, cambio de mes, búsqueda, resumen por semana/mes/año, tema, `?nuevo=gasto`,
pegar pago, exportar e importar copia. Revisa la consola: no debe haber errores.

En este PC no hay Python: el servidor es Node, configurado en `.claude/launch.json`
(puerto 8765). Windows tiene activado el «Acceso controlado a carpetas» en Documentos: solo
el editor puede escribir en el proyecto; PowerShell/Node no pueden crear archivos aquí (los
PNG hay que generarlos fuera y copiarlos a mano).

## No hagas sin preguntar
Añadir cuentas de usuario, sincronización, backend, analíticas, anuncios o cualquier cosa que
saque datos del teléfono.
