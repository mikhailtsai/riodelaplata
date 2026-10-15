/* =============================================================================
 * audio.js — pronunciación
 * -----------------------------------------------------------------------------
 * Estrategia:
 *   1. Si el texto está en `window.RPL_AUDIO_MAP` (js/audio-map.js) -> reproduce
 *      ese mp3.
 *   2. Si no, o si el mp3 falla -> Web Speech API (speechSynthesis) con la mejor
 *      voz instalada para es-AR / es-UY / es-MX / es.
 *   3. Si el navegador no soporta speechSynthesis -> no hace nada (sin errores).
 *
 * API: window.RPLAudio.speak(texto) / .cancel() / .available
 * ========================================================================== */
(function (global) {
  'use strict';

  var LANG_PREFERENCE = ['es-AR', 'es-UY', 'es-MX', 'es'];

  var map = (global.RPL_AUDIO_MAP && typeof global.RPL_AUDIO_MAP === 'object')
    ? global.RPL_AUDIO_MAP
    : {};

  var synth = global.speechSynthesis || null;
  var Utterance = global.SpeechSynthesisUtterance || null;
  var ttsSupported = !!(synth && Utterance);

  var voices = [];
  var currentAudio = null;
  var lastError = false;

  /* ---------------------------------------------------------------- voces -- */
  function normalizeLang(lang) {
    return String(lang || '').replace('_', '-').toLowerCase();
  }

  function refreshVoices() {
    if (!synth || typeof synth.getVoices !== 'function') return;
    try {
      voices = synth.getVoices() || [];
    } catch (e) {
      voices = [];
    }
  }
  refreshVoices();

  if (synth) {
    if (typeof synth.addEventListener === 'function') {
      synth.addEventListener('voiceschanged', refreshVoices);
    } else {
      synth.onvoiceschanged = refreshVoices;
    }
  }

  /** Mejor voz disponible según la preferencia rioplatense. */
  function pickVoice() {
    refreshVoices();
    for (var i = 0; i < LANG_PREFERENCE.length; i++) {
      var wanted = LANG_PREFERENCE[i].toLowerCase();
      for (var j = 0; j < voices.length; j++) {
        if (normalizeLang(voices[j].lang) === wanted) return voices[j];
      }
    }
    for (var k = 0; k < voices.length; k++) {
      if (/^es\b/.test(normalizeLang(voices[k].lang))) return voices[k];
    }
    return null;
  }

  /* ------------------------------------------------------------------ tts -- */
  function speakTTS(text) {
    if (!ttsSupported) return false;
    try {
      synth.cancel(); // evita que se encolen varias voces
      var utterance = new Utterance(text);
      var voice = pickVoice();
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = LANG_PREFERENCE[0];
      }
      utterance.rate = 0.92; // un toque más lento, se entiende mejor
      utterance.pitch = 1;
      utterance.volume = 1;
      synth.speak(utterance);
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ----------------------------------------------------------------- mp3 -- */
  function lookup(text) {
    if (Object.prototype.hasOwnProperty.call(map, text)) return map[text];
    var loose = text.trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(map, loose)) return map[loose];
    return null;
  }

  function stopAudio() {
    if (!currentAudio) return;
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) { /* ignorado */ }
    currentAudio = null;
  }

  function playMp3(src, text) {
    var usedFallback = false;
    function fallback() {
      if (usedFallback) return;
      usedFallback = true;
      speakTTS(text);
    }
    try {
      stopAudio();
      var audio = new global.Audio(src);
      currentAudio = audio;
      audio.addEventListener('error', fallback);
      var promise = audio.play();
      if (promise && typeof promise.catch === 'function') promise.catch(fallback);
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ----------------------------------------------------------------- api --- */
  function speak(text) {
    if (typeof text !== 'string' || !text.trim()) return false;
    lastError = false;

    var src = lookup(text);
    if (src) {
      if (playMp3(src, text)) return true;
    }
    var ok = speakTTS(text);
    if (!ok) lastError = true;
    return ok;
  }

  function cancel() {
    stopAudio();
    if (synth) {
      try { synth.cancel(); } catch (e) { /* ignorado */ }
    }
  }

  global.RPLAudio = {
    speak: speak,
    cancel: cancel,
    /** true si hay alguna forma de reproducir audio */
    get available() {
      return ttsSupported || Object.keys(map).length > 0;
    },
    /** true si el navegador tiene síntesis de voz */
    get ttsAvailable() {
      return ttsSupported;
    },
    /** último intento falló (por ejemplo, TTS bloqueado) */
    get failed() {
      return lastError;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
