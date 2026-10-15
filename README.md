# Rioplatense — Entrenador de verbos

App web estática y mobile-first para practicar **español rioplatense** (el que se habla en
Uruguay y Buenos Aires), con estética **retrowave**. Toda la interfaz está en español, con
voseo: *"Aprendé", "Escribí", "Mirá"*. La única excepción son las traducciones del
infinitivo (inglés · ruso), que se muestran como glosa del verbo.

Hoy tiene **dos pantallas**:

1. **Inicio** — logo (escudo con la bandera de Uruguay), título, subtítulo y el botón
   *"Aprendé los 100 verbos más útiles"*.
2. **Entrenador de verbos** — muestra un infinitivo con su traducción (inglés · ruso)
   y cuatro campos (`yo`, `vos`, `nosotros`, `él / ella / usted / ustedes`) para
   escribir el presente del indicativo.

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
index.html            estructura de las dos pantallas + logo SVG inline
css/styles.css        estilos retrowave (fondo, tipografía, animaciones)
js/verbs.js           los 100 verbos (única fuente de verdad)
js/audio-map.js       overrides opcionales de audio (mp3)
js/audio.js           pronunciación: mp3 -> Web Speech API -> nada
js/app.js             router de pantallas + juego de verbos
assets/audio/         acá van los mp3 (vacío por defecto)
```

Sin frameworks, sin npm, sin paso de compilación. Solo `<script>` clásicos.

---

## Cómo se juega

1. Debajo del infinitivo aparece su traducción en **inglés y ruso** (`to speak · говорить`),
   por si no conocés el verbo. Es lo único que no está en español: el resto de la interfaz
   sí lo está.
2. Escribí las cuatro formas y tocá **Aceptar**.
3. Los campos quedan **bloqueados**. Los correctos se marcan en verde; los incorrectos en
   **rojo con la respuesta correcta al lado**.
4. El botón se transforma en **Siguiente**, deshabilitado durante **3 segundos**, con un
   **anillo y un número** que muestran la cuenta regresiva.
5. Cuando se habilita, tocás **Siguiente** y aparece otro verbo.

Cada campo es una fila: la etiqueta a la izquierda (`él / ella / usted / ustedes` entra en
una columna angosta y se parte en varias líneas), el input en el medio y —solo cuando el
campo está bloqueado— el icono de audio a la derecha. La devolución (`✓ ¡bien!`,
`✗ Correcto: …`) ocupa todo el ancho de la fila, debajo del input.

### Verbos irregulares

- Si el verbo es irregular, al lado del infinitivo aparece —**antes** de responder— un
  **distintivo amarillo** con un icono de aviso y la palabra *irregular*.
- Después de tocar **Aceptar**, debajo del infinitivo se agrega la explicación en español
  (`irregular_note`): p. ej. *"Diptongación o→ue (puedo, puede, pueden)."*
- Si el verbo es regular, no se muestra ni el distintivo ni la nota.

### Validación

- Ignora mayúsculas, espacios sobrantes y **acentos**: `esta` vale por `está`.
  Igual, la respuesta que se muestra siempre está **bien acentuada**.
- El 4º campo acepta **las tres** formas del singular y la del plural: `él/ella`,
  `usted` y `ustedes` (por ejemplo `habla` **y** `hablan`). `usted` usa la misma 3ª
  del singular que `él/ella`, así que no hace falta ningún dato extra. Si te equivocás,
  se muestra la de **ustedes**, que es la forma rioplatense que pedimos, con la
  aclaración *(también: habla)*.

### Selección de palabras

- Se guardan en `localStorage` los **últimos 20 verbos** mostrados y no se repiten
  mientras sigan en esa ventana.
- Cuando quedan menos de 20 vistos, elige al azar entre el resto de los 100.
- Si el `localStorage` está corrupto, vacío o bloqueado (modo privado), arranca en blanco
  sin romperse: el historial vive también en memoria.
- Nunca repite el verbo que está en pantalla.

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
  resultado, botones de 44px+ de alto, contraste alto sobre fondo oscuro y respeto por
  `prefers-reduced-motion`.
- **Código preparado para crecer**: el router de pantallas y el inicio no saben nada de
  verbos. Cada práctica es un módulo con `mount()/start()/teardown()` registrado en
  `MODULES` dentro de `js/app.js`; agregar otro (por ejemplo, preposiciones) es sumar un
  objeto, sin tocar el resto.
- **Forma de los datos**: cada verbo está ordenado por `rank` y se guarda como
  `{ rank, infinitive, meaning_en, meaning_ru, irregular, irregular_note, yo, vos, nosotros, el_ella, el_ella_ustedes }`.
  La clave `el_ella_ustedes` es la **canónica** del 4º campo (la de *ustedes*), y `el_ella`
  existe aparte para poder aceptar también la 3ª del singular (`él`, `ella`, `usted`) sin
  dejar de mostrar la de ustedes cuando hay error. `irregular` (booleano) e
  `irregular_note` (español) alimentan el distintivo y la explicación del verbo irregular.
  `meaning_en` + `meaning_ru` son la **única** excepción al español en la interfaz: se
  muestran juntos, como `to speak · говорить`, debajo del infinitivo, y en ningún otro lado.
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
- El 4º campo distingue siempre `el_ella` (3ª sing.) de `el_ella_ustedes` (3ª pl.).
- Ninguna forma de 2ª persona del singular es una forma del español general; las 5 que
  coinciden de verdad (`ver`, `dar`, `ir`, `estar`, `haber`) están contempladas.

Si tocás los datos, podés repetir la parte básica con `node`:

```bash
node -e "global.window=global; require('./js/verbs.js');
const v = global.RPL_VERBS;
console.log(v.length, new Set(v.map(x=>x.infinitive)).size,
  v.every(x => x.infinitive && x.meaning_en && x.meaning_ru && x.yo && x.vos && x.nosotros && x.el_ella && x.el_ella_ustedes),
  v.filter(x => x.irregular).length);
// -> 100 100 true 43"
```
