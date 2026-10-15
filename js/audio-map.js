/* =============================================================================
 * audio-map.js — overrides de audio (mp3) para la pronunciación
 * -----------------------------------------------------------------------------
 * ¿PARA QUÉ SIRVE?
 *   Por defecto la app pronuncia con la Web Speech API (voces del sistema).
 *   Si querés una grabación propia (mejor calidad, voz humana, acento exacto),
 *   agregás el archivo .mp3 en `assets/audio/` y lo registrás acá.
 *
 * CÓMO AGREGAR UN AUDIO
 *   1. Copiá el archivo, por ejemplo `assets/audio/ser.mp3`.
 *   2. Agregá una entrada en el mapa de abajo:
 *
 *          ser: 'assets/audio/ser.mp3',
 *          soy: 'assets/audio/soy.mp3',
 *
 *   3. La clave es EXACTAMENTE el texto que se va a pronunciar:
 *        - el infinitivo tal como está en `js/verbs.js`  -> 'ser', 'hablar', 'oír'
 *        - o una forma conjugada                        -> 'soy', 'hablás', 'oigo'
 *      Se busca primero la clave exacta y después la misma clave en minúsculas
 *      y sin espacios sobrantes.
 *
 *   Las formas que no estén en el mapa se siguen pronunciando con TTS.
 *   Si un mp3 no existe o falla al reproducirse, se usa TTS automáticamente.
 *
 * El formato esperado es mp3 (cualquier navegador moderno lo reproduce).
 * ========================================================================== */

window.RPL_AUDIO_MAP = {
  /* Vacío a propósito: todo se pronuncia con la voz del sistema.
     Ejemplos (descomentá y agregá los archivos en assets/audio/):

  'ser': 'assets/audio/ser.mp3',
  'estar': 'assets/audio/estar.mp3',
  'soy': 'assets/audio/soy.mp3',
  'sos': 'assets/audio/sos.mp3',
  'hablo': 'assets/audio/hablo.mp3',

  */
};
