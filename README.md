# Rioplatense — Entrenador de verbos

App web estática y mobile-first para practicar **español rioplatense** (el que se habla en
Uruguay y Buenos Aires), con estética **retrowave**. Toda la interfaz está en español, con
voseo: *"Aprendé", "Escribí", "Mirá"*. La única excepción son las traducciones del
infinitivo (inglés · ruso), que se muestran como glosa del verbo.

Hoy tiene **dos pantallas**:

1. **Inicio** — logo (escudo con la bandera de Uruguay), título, subtítulo y el botón
   *"Aprendé los 100 verbos más útiles"*.
2. **Entrenador de verbos** — muestra un infinitivo con su traducción (inglés · ruso)
   y cinco campos (`yo`, `vos`, `él / ella / usted`, `nosotros`, `ellos / ellas / ustedes`)
   para escribir el presente del indicativo.

---

## Cómo ejecutarla

### Opción 1: abrir el archivo directamente

```bash
xdg-open index.html      # Linux
open index.html          # macOS
start index.html         # Windows
```

Funciona con `file://` porque **no hay módulos ES, ni build, ni dependencias**.

### Opción 2: servidor local (recomendado)

```bash
python3 -m http.server 8000
# después abrí http://localhost:8000/
```

El servidor local es útil si querés que la pronunciación por voz y los `mp3` propios
funcionen sin restricciones del navegador.

---

## Estructura

```
index.html            estructura de las pantallas + logo SVG inline
manifest.webmanifest  PWA: nombre, colores, iconos, modo standalone
sw.js                 service worker (sin conexión)
css/styles.css        estilos retrowave (fondo, tipografía, animaciones)
js/verbs.js           los 100 verbos (única fuente de verdad)
js/audio-map.js       overrides opcionales de audio (mp3)
js/audio.js           pronunciación: mp3 -> Web Speech API -> nada
js/app.js             router de pantallas + juego de verbos + progreso + PWA
icons/                iconos de la PWA (192/512 + maskable + apple-touch)
assets/audio/         acá van los mp3 (vacío por defecto)
```

Sin frameworks, sin npm, sin paso de compilación. Solo `<script>` clásicos.

---

## Cómo se juega

1. Debajo del infinitivo aparece su traducción en **inglés y ruso** (`to speak · говорить`),
   por si no conocés el verbo. Es lo único que no está en español: el resto de la interfaz
   sí lo está.
2. Escribí las **cinco** formas y tocá **Aceptar**.
3. Los campos quedan **bloqueados**. Los correctos se marcan en verde con un **✓ compacto**
   en su columna derecha (no agregan ninguna línea de texto); los incorrectos van en **rojo
   con la respuesta correcta debajo**.
4. El botón se transforma en **Siguiente**, deshabilitado durante **3 segundos**, con un
   **anillo y un número** que muestran la cuenta regresiva.
5. Cuando se habilita, tocás **Siguiente** y aparece otro verbo.

El verbo va en **una sola línea centrada**: `[infinitivo] [altavoz] [irregular]`. Cada campo
es una fila: la etiqueta en blanco a la izquierda (`él / ella / usted` y
`ellos / ellas / ustedes` entran en una columna angosta y se parten en dos o tres líneas), el
input en el medio y —a la derecha— el **✓** de acierto y el icono de audio, que aparecen solo
cuando el campo está bloqueado. La columna de la derecha tiene ancho reservado, así que los
**cinco inputs quedan alineados exactamente igual** en todos los estados. La corrección
(`✗ Correcto: …`) aparece en una línea propia, debajo del input, **solo en los campos
equivocados**: aceptar con todo bien no cambia la altura de la pantalla. El resumen de la
jugada (`¡Perfecto!…` / `Casi. Revisá: …`) se sigue generando y anunciando, pero vive en un
contenedor recortado (solo para lectores de pantalla): no ocupa alto ni ancho.

### Verbos irregulares

- Si el verbo es irregular, a la derecha del altavoz aparece —**antes** de responder— un
  **distintivo amarillo compacto** con un icono de aviso y la palabra *irregular*.
- Si el verbo es regular, no se muestra el distintivo.
- No se muestra ninguna explicación de la irregularidad: la regla vive solo en los datos
  (`irregular_note`), que la app **no renderiza** en ningún lado.

### Validación

- Ignora mayúsculas, espacios sobrantes y **acentos**: `esta` vale por `está`.
  Igual, la respuesta que se muestra siempre está **bien acentuada**.
- Cada campo tiene **una sola** respuesta correcta. La 3ª del singular y la 3ª del plural
  son formas distintas y se piden por separado: `él / ella / usted` → **habla**;
  `ellos / ellas / ustedes` → **hablan**. (`usted` comparte la forma de `él`/`ella` y
  `ustedes` la de `ellos`/`ellas`: por eso cada campo cubre tres pronombres con una forma.)
  Si te equivocás, debajo del campo rojo aparece la forma correcta completa.

### Selección de palabras

- Se guardan en `localStorage` los **últimos 20 verbos** mostrados y no se repiten
  mientras sigan en esa ventana.
- Cuando quedan menos de 20 vistos, elige al azar entre el resto de los 100.
- Si el `localStorage` está corrupto, vacío o bloqueado (modo privado), arranca en blanco
  sin romperse: el historial vive también en memoria.
- Nunca repite el verbo que está en pantalla.

### Puntos e historial

- **Puntos:** al aceptar, cada forma vale **2 puntos** si está correcta **con la tilde
  correcta**, **1 punto** si es correcta pero sin la tilde, y **0** si está mal. Máximo por
  palabra: **10**. El total acumulado se ve arriba a la derecha (`Puntos 37`).
- **Historial:** se guardan las últimas **10** jugadas (verbo, `puntos / 10` y cuándo), con la
  **más reciente arriba**. La **racha** (actual y mejor) se muestra ahí.
- El **botón central** de la barra superior (icono de reloj) abre el historial. Su **Volver**
  regresa al juego **tal como estaba**: la palabra y su resultado siguen en pantalla, no se
  reinicia la jugada.
- Claves de `localStorage`: `rpl.verbs.history.v1` (últimos 20 verbos, sin repetir),
  `rpl.verbs.streak.v1` (racha), `rpl.verbs.points.v1` (puntos) y `rpl.verbs.log.v1`
  (historial). Si están corruptas o bloqueadas, la app arranca en blanco sin romperse.

---

## Pronunciación

1. **Primero el mp3**: si el texto está en `js/audio-map.js`, se reproduce ese archivo.
2. **Si no, la Web Speech API** (`speechSynthesis`), eligiendo la mejor voz instalada
   para `es-AR` → `es-UY` → `es-MX` → `es` cualquiera.
3. **Si el navegador no soporta voz**, no pasa nada: la app funciona igual y muestra una
   aclaración discreta.

Qué se pronuncia:

- Tocá el **infinitivo** (el título grande) → dice el infinitivo.
- Tocá un **campo ya aceptado** → dice la forma conjugada correcta.

### Agregar tus propios audios (mp3)

1. Copiá el archivo a `assets/audio/`, por ejemplo `assets/audio/ser.mp3`.
2. Registralo en `js/audio-map.js` (la clave es exactamente el texto que se pronuncia):

```js
window.RPL_AUDIO_MAP = {
  'ser': 'assets/audio/ser.mp3',
  'soy': 'assets/audio/soy.mp3'
};
```

Funciona para infinitivos (`ser`, `oír`) y para formas conjugadas (`soy`, `hablás`).
Lo que no esté en el mapa se sigue diciendo con la voz del sistema. Si un mp3 falta o
falla, cae automáticamente a TTS.

> El nombre tiene que coincidir **exacto**: `vivís` con tilde es distinto de `vivis`.

---

## PWA (instalable y sin conexión)

- **Instalable:** `manifest.webmanifest` (modo `standalone`, orientación vertical, colores
  de la app) + iconos 192/512, **maskable** (para Android) y `apple-touch-icon` (para iOS).
  El navegador ofrece "Agregar a la pantalla de inicio"; en el inicio aparece un botón
  **Instalar la app** solo cuando el navegador ofrece la instalación.
- **Sin conexión:** `sw.js` guarda la app en caché. Estrategia **network-first**: con conexión
  siempre se sirve lo último (una publicación nueva se ve enseguida) y sin conexión se
  responde desde la caché.
- **Al publicar cambios, subí `CACHE_VERSION`** en `sw.js` (`rioplatense-v1` → `v2`) para
  descartar la caché vieja.
- El service worker solo se registra bajo `http/https`; abriendo el archivo con `file://`
  no existe y la app funciona igual.
- Los iconos se generan desde un SVG con Chromium headless (ver `icons/`).

---

## Decisiones de diseño

- **Lenguaje de la interfaz**: español rioplatense con voseo, en toda la app.
- **Un solo layout**: mobile-first; en escritorio la app se centra con un ancho máximo de
  **500px** y sigue usando el layout de móvil, sin vistas alternativas.
- **Sin dependencias**: todo es autocontenido (SVG inline, gradientes CSS). Las tipografías
  Orbitron/Rajdhani de Google Fonts son **opcionales**: si no hay internet, se usan las
  fuentes del sistema y la app se ve igual.
- **Logo**: la bandera de Uruguay se dibuja en SVG puro —9 franjas alternadas, cantón
  blanco y Sol de Mayo de 16 rayos con cara— dentro de un escudo con borde degradé
  magenta→violeta→cian. Se mantiene reconocible a 130px.
- **Accesibilidad**: campos con `label` asociado, foco visible, `aria-live` para el
  resultado (en un contenedor recortado, así no ocupa espacio), botones de 44px+ de alto,
  contraste alto sobre fondo oscuro y respeto por `prefers-reduced-motion`.
- **Código preparado para crecer**: el router de pantallas y el inicio no saben nada de
  verbos. Cada práctica es un módulo con `mount()/start()/teardown()` registrado en
  `MODULES` dentro de `js/app.js`; agregar otro (por ejemplo, preposiciones) es sumar un
  objeto, sin tocar el resto.
- **Forma de los datos**: cada verbo está ordenado por `rank` y se guarda como
  `{ rank, infinitive, meaning_en, meaning_ru, irregular, irregular_note, yo, vos, nosotros, el_ella_usted, ellos_ellas_ustedes }`.
  Las cinco claves de forma son la única forma de cada campo: `el_ella_usted` es la 3ª del
  singular (él / ella / usted) y `ellos_ellas_ustedes` la 3ª del plural (ellos / ellas /
  ustedes). No hay sinónimos ni respuestas alternativas por campo. `irregular` (booleano) es
  lo único que alimenta el distintivo *irregular*; `irregular_note` (español) se conserva en
  los datos pero **la interfaz ya no lo muestra**.
  `meaning_en` + `meaning_ru` son la **única** excepción al español en la interfaz: se
  muestran juntos, como `to speak · говорить`, debajo del infinitivo, y en ningún otro lado.
- **Todo entra sin scroll en 660px de alto** con las **cinco** filas: la fila del infinitivo
  (`[infinitivo] [altavoz] [irregular]`) es una sola línea centrada que no desborda ni a
  320px de ancho con el infinitivo más largo; las etiquetas largas se parten en la columna
  angosta, la columna de iconos de la derecha tiene ancho reservado (los cinco inputs miden
  lo mismo en todos los estados), los campos correctos se marcan con un ✓ sin agregar
  ninguna línea y solo los incorrectos agregan la corrección debajo. El resumen de la jugada
  vive en un contenedor recortado (solo `aria-live`): no ocupa alto. Medido con Chromium
  headless a 320×660 y 500×660 (con y sin las tipografías de Google): `scrollHeight` ≤ 660px
  en todos los estados, con 30px de margen en el peor caso (5 formas mal + aviso de tilde).
- **Solo voseo**: no se enseña la 2ª persona del singular del español general; todas las
  formas de 2ª persona del singular son de voseo rioplatense.
- **Sin auto-foco en móvil**: en escritorio el primer campo recibe el foco para poder
  tipear y saltar con Enter; en táctil no, para no abrir el teclado de golpe.

---

## Verificación de los datos

`js/verbs.js` es la lista **investigada por frecuencia** de los 100 verbos más útiles
(CORPES XXI + CREA + OpenSubtitles, ponderada hacia el habla conversacional), en presente
del indicativo y con voseo rioplatense. Se validó forma por forma contra tablas de
conjugación de referencia.

Chequeo automático de la integridad del dataset:

- **100 entradas, 100 infinitivos únicos**; `rank` 1..100, sin huecos ni repetidos.
- Todos los campos obligatorios no vacíos (`meaning_en` y `meaning_ru` incluidos);
  `irregular_note` presente **solo** cuando `irregular === true`.
- **43 irregulares / 57 regulares.**
- Las dos formas de 3ª persona están siempre presentes y son distintas:
  `el_ella_usted` (3ª sing.) ≠ `ellos_ellas_ustedes` (3ª pl.). La regla derivada de la
  conjugación se chequea además forma por forma (500 formas: `yo`, `vos`, `nosotros`,
  `el_ella_usted`, `ellos_ellas_ustedes`).
- Ninguna forma de 2ª persona del singular es una forma del español general; las 5 que
  coinciden de verdad (`ver`, `dar`, `ir`, `estar`, `haber`) están contempladas.

Si tocás los datos, podés repetir la parte básica con `node`:

```bash
node -e "global.window=global; require('./js/verbs.js');
const v = global.RPL_VERBS;
console.log(v.length, new Set(v.map(x=>x.infinitive)).size,
  v.every(x => x.infinitive && x.meaning_en && x.meaning_ru && x.yo && x.vos && x.nosotros && x.el_ella_usted && x.ellos_ellas_ustedes),
  v.filter(x => x.irregular).length,
  v.filter(x => x.el_ella_usted === x.ellos_ellas_ustedes).length);
// -> 100 100 true 43 0"
```
