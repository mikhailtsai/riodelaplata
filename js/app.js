/* =============================================================================
 * app.js — router de pantallas, pantalla de inicio y entrenador de verbos
 * -----------------------------------------------------------------------------
 * Organización pensada para crecer: cada "tipo de práctica" es un módulo.
 * Hoy hay un solo módulo (`verbTrainer`); agregar otro es sumar un objeto con
 * `mount()` y registrarlo en MODULES. El router y el inicio no cambian.
 * ========================================================================== */
(function (global) {
  'use strict';

  var VERBS = Array.isArray(global.RPL_VERBS) ? global.RPL_VERBS : [];
  var Audio = global.RPLAudio || { speak: function () { return false; }, cancel: function () {}, available: false };

  var HISTORY_KEY = 'rpl.verbs.history.v1';
  var STREAK_KEY = 'rpl.verbs.streak.v1';
  var HISTORY_LIMIT = 20;   // últimos 20 verbos que no se pueden repetir
  var COUNTDOWN_MS = 3000;
  var RING_CIRCUMFERENCE = 2 * Math.PI * 11; // r=11 en el SVG del anillo

  /* -------------------------------------------------------------- helpers -- */
  function $(id) { return document.getElementById(id); }

  /** minúsculas, sin acentos, sin espacios de más. " ESTÁ " === "esta". */
  function normalize(value) {
    return String(value == null ? '' : value)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // quita tildes (y convierte ñ -> n)
  }

  /** Igual que normalize pero conserva tildes/ñ: para comparar la escritura exacta. */
  function normalizeExact(value) {
    return String(value == null ? '' : value)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }

  function randomIndex(length) { return Math.floor(Math.random() * length); }

  function safeGet(key) {
    try { return global.localStorage.getItem(key); } catch (e) { return null; }
  }

  function safeSet(key, value) {
    try { global.localStorage.setItem(key, value); } catch (e) { /* modo privado, etc. */ }
  }

  /* ---------------------------------------------------------------- router -- */
  var SCREENS = ['home', 'game', 'history'];

  function showScreen(name) {
    SCREENS.forEach(function (key) {
      var el = $('screen-' + key);
      if (!el) return;
      var active = key === name;
      el.hidden = !active;
      el.classList.toggle('is-active', active);
    });
    if (name !== 'game') Audio.cancel();
    global.scrollTo(0, 0);
  }

  /* ==========================================================================
   * Progreso: puntos acumulados + historial de las últimas jugadas (localStorage)
   * ======================================================================== */
  var POINTS_KEY = 'rpl.verbs.points.v1';
  var LOG_KEY = 'rpl.verbs.log.v1';
  var LOG_LIMIT = 10;               // el historial muestra las 10 últimas
  var POINTS_EXACT = 2;             // forma correcta, con la tilde correcta
  var POINTS_TILDE = 1;             // correcta pero con la tilde mal

  var progress = (function () {
    var points = 0;
    var log = [];                   // más reciente primero

    function load() {
      var saved = Number(safeGet(POINTS_KEY));
      points = isFinite(saved) && saved > 0 ? Math.floor(saved) : 0;

      var raw = safeGet(LOG_KEY);
      if (!raw) { log = []; return; }
      var parsed;
      try { parsed = JSON.parse(raw); } catch (e) { log = []; return; } // corrupto
      if (!Array.isArray(parsed)) { log = []; return; }
      log = parsed.filter(function (item) {
        return item && typeof item === 'object' && typeof item.verb === 'string';
      }).slice(0, LOG_LIMIT);
    }

    function save() {
      safeSet(POINTS_KEY, String(points));
      safeSet(LOG_KEY, JSON.stringify(log.slice(0, LOG_LIMIT)));
    }

    function record(entry) {
      points += Math.max(0, Number(entry.points) || 0);
      log.unshift(entry);
      if (log.length > LOG_LIMIT) log = log.slice(0, LOG_LIMIT);
      save();
      paint();
    }

    function entries() { return log.slice(); }

    function paint() {
      var pv = $('points-value');
      if (pv) pv.textContent = String(points);
      var hp = $('history-points');
      if (hp) hp.textContent = String(points);
    }

    return { load: load, record: record, entries: entries, paint: paint, points: function () { return points; } };
  })();

  /** "hace 3 min" — tiempo relativo, sin dependencias. */
  function relativeTime(ts) {
    var diff = Date.now() - Number(ts || 0);
    if (!isFinite(diff) || diff < 0) diff = 0;
    var s = Math.floor(diff / 1000);
    if (s < 60) return 'recién';
    var m = Math.floor(s / 60);
    if (m < 60) return 'hace ' + m + ' min';
    var h = Math.floor(m / 60);
    if (h < 24) return 'hace ' + h + ' h';
    return 'hace ' + Math.floor(h / 24) + ' d';
  }

  /** Pinta el historial: la última jugada arriba, el resto debajo. */
  function renderHistory() {
    var list = $('history-list');
    var empty = $('history-empty');
    if (!list) return;

    var items = progress.entries();
    list.innerHTML = '';
    if (empty) empty.hidden = items.length > 0;
    progress.paint();

    items.forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'history__item';

      var verb = document.createElement('span');
      verb.className = 'history__verb';
      verb.textContent = item.verb;

      var score = document.createElement('span');
      score.className = 'history__score';
      score.textContent = (Number(item.points) || 0) + ' / ' + (Number(item.max) || 0);
      if (Number(item.points) === Number(item.max)) score.classList.add('is-perfect');

      var when = document.createElement('time');
      when.className = 'history__when';
      when.textContent = relativeTime(item.at);

      li.appendChild(verb);
      li.appendChild(score);
      li.appendChild(when);
      list.appendChild(li);
    });
  }

  /* ==========================================================================
   * Módulo: entrenador de verbos
   * ======================================================================== */
  // Cinco formas verbales, cinco campos. Cada campo tiene UNA sola respuesta
  // correcta: la 3ª del singular (él / ella / usted -> habla) y la 3ª del
  // plural (ellos / ellas / ustedes -> hablan) son formas distintas.
  var FIELDS = [
    { key: 'yo', label: 'yo' },
    { key: 'vos', label: 'vos' },
    { key: 'nosotros', label: 'nosotros' },
    { key: 'el_ella_usted', label: 'él / ella / usted' },
    { key: 'ellos_ellas_ustedes', label: 'ellos / ellas / ustedes' }
  ];

  var verbTrainer = (function () {
    var els = {};
    var inputs = {};
    var fieldEls = {};
    var recent = [];              // últimos verbos vistos (se persiste)
    var streak = 0;
    var best = 0;
    var verb = null;
    var accepted = false;
    var endTimer = null;
    var tickTimer = null;
    var mounted = false;

    /* ----------------------------------------------------- persistencia -- */
    function loadHistory() {
      var raw = safeGet(HISTORY_KEY);
      if (!raw) return [];
      var parsed;
      try { parsed = JSON.parse(raw); } catch (e) { return []; } // corrupto -> se ignora
      if (!Array.isArray(parsed)) return [];
      var known = VERBS.map(function (v) { return v.infinitive; });
      return parsed
        .filter(function (item) { return typeof item === 'string' && known.indexOf(item) !== -1; })
        .slice(-HISTORY_LIMIT);
    }

    function saveHistory() {
      safeSet(HISTORY_KEY, JSON.stringify(recent.slice(-HISTORY_LIMIT)));
    }

    function remember(infinitive) {
      recent.push(infinitive);
      if (recent.length > HISTORY_LIMIT) recent = recent.slice(-HISTORY_LIMIT);
      saveHistory();
    }

    function loadStreak() {
      var raw = safeGet(STREAK_KEY);
      if (!raw) return;
      try {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          streak = Number(parsed.streak) >= 0 ? Math.floor(Number(parsed.streak)) : 0;
          best = Number(parsed.best) >= 0 ? Math.floor(Number(parsed.best)) : 0;
        }
      } catch (e) { streak = 0; best = 0; }
    }

    function saveStreak() {
      safeSet(STREAK_KEY, JSON.stringify({ streak: streak, best: best }));
    }

    /* -------------------------------------------------------- selección -- */
    /** Elige un verbo al azar evitando los últimos HISTORY_LIMIT mostrados. */
    function pickVerb() {
      if (!VERBS.length) return null;

      var banned = recent.slice(-HISTORY_LIMIT);
      var candidates = VERBS.filter(function (v) {
        return banned.indexOf(v.infinitive) === -1;
      });

      // Ciclo completo o datos raros: se reinicia el pool.
      if (!candidates.length) candidates = VERBS.slice();

      // Nunca repetir el verbo que está en pantalla.
      if (verb && candidates.length > 1) {
        var withoutCurrent = candidates.filter(function (v) {
          return v.infinitive !== verb.infinitive;
        });
        if (withoutCurrent.length) candidates = withoutCurrent;
      }

      return candidates[randomIndex(candidates.length)];
    }

    /* -------------------------------------------------------------- DOM -- */
    function buildFields() {
      els.fields.innerHTML = '';
      FIELDS.forEach(function (field, index) {
        var wrap = document.createElement('div');
        wrap.className = 'field';
        wrap.setAttribute('data-key', field.key);

        var label = document.createElement('label');
        label.className = 'field__label';
        label.setAttribute('for', 'input-' + field.key);
        label.textContent = field.label;

        var speakIcon = document.createElement('span');
        speakIcon.className = 'field__speak';
        speakIcon.setAttribute('aria-hidden', 'true');
        speakIcon.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h3l4 4V5L7 9H4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>';

        // Visto compacto: reemplaza a la línea "✓ ¡bien!" para que aceptar un
        // campo correcto no agregue ninguna línea ni cambie la altura.
        // role="img" + aria-label: el acierto se sigue anunciando aunque no
        // haya texto visible en la fila.
        var checkIcon = document.createElement('span');
        checkIcon.className = 'field__check';
        checkIcon.setAttribute('role', 'img');
        checkIcon.setAttribute('aria-label', 'correcto');
        checkIcon.textContent = '\u2713';

        var rightCol = document.createElement('span');
        rightCol.className = 'field__right';
        rightCol.appendChild(checkIcon);
        rightCol.appendChild(speakIcon);

        var input = document.createElement('input');
        input.className = 'field__input';
        input.id = 'input-' + field.key;
        input.type = 'text';
        input.autocomplete = 'off';
        input.autocorrect = 'off';
        input.autocapitalize = 'none';
        input.spellcheck = false;
        input.placeholder = '...';
        input.setAttribute('enterkeyhint', index === FIELDS.length - 1 ? 'send' : 'next');
        input.setAttribute('aria-describedby', 'status-' + field.key);
        input.dataset.key = field.key;

        var status = document.createElement('p');
        status.className = 'field__status';
        status.id = 'status-' + field.key;

        wrap.appendChild(label);
        wrap.appendChild(input);
        wrap.appendChild(rightCol);
        wrap.appendChild(status);
        els.fields.appendChild(wrap);

        inputs[field.key] = input;
        fieldEls[field.key] = wrap;

        // Teclado del móvil: "siguiente" salta al campo siguiente y sólo el
        // último campo envía. (El texto del botón lo fija enterkeyhint.)
        input.addEventListener('keydown', function (event) {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          if (accepted) {
            if (!els.actionBtn.disabled) next();
            return;
          }
          if (index < FIELDS.length - 1) {
            var nextInput = inputs[FIELDS[index + 1].key];
            if (nextInput) nextInput.focus();
          } else {
            accept();
          }
        });

        // Ya aceptado: tocar el campo vuelve a pronunciar la forma correcta.
        input.addEventListener('click', function () {
          if (accepted && verb) Audio.speak(verb[field.key]);
        });
        speakIcon.addEventListener('click', function () {
          if (accepted && verb) Audio.speak(verb[field.key]);
        });
      });
    }

    function setStatus(field, kind, canonical, accentOnly) {
      var status = fieldEls[field.key].querySelector('.field__status');
      status.innerHTML = '';

      // Campo correcto: sin línea de texto (el ✓ va en la columna derecha),
      // salvo el aviso suave de tildes, que sí conviene explicar.
      if (kind === 'correct') {
        if (!accentOnly) return;

        var tilde = document.createElement('span');
        tilde.className = 'field__tilde';
        tilde.textContent = 'se escribe \u00ab' + canonical + '\u00bb';
        status.appendChild(tilde);
        return;
      }

      var mark = document.createElement('span');
      mark.className = 'field__mark';
      mark.textContent = '\u2717 ';
      status.appendChild(mark);

      var intro = document.createElement('span');
      intro.textContent = 'Correcto: ';
      status.appendChild(intro);

      var answer = document.createElement('span');
      answer.className = 'field__answer';
      answer.textContent = canonical;
      status.appendChild(answer);
    }

    function clearStatus(field) {
      var status = fieldEls[field.key].querySelector('.field__status');
      status.innerHTML = '';
    }

    function resetActionButton() {
      els.actionBtn.disabled = false;
      els.actionBtn.classList.remove('is-counting');
      els.actionLabel.textContent = 'Aceptar';
      els.ringProgress.style.transition = 'none';
      els.ringProgress.style.strokeDashoffset = '0';
    }

    function clearTimers() {
      if (endTimer) { clearTimeout(endTimer); endTimer = null; }
      if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
    }

    // La racha ya no vive en la barra superior (ahí van el historial y los
    // puntos): se muestra como subtítulo en la pantalla de historial.
    function updateStreakUI() {
      var el = $('history-streak');
      if (!el) return;
      el.textContent = 'Racha actual: ' + streak + ' \u00b7 Mejor: ' + best;
    }

    /* ------------------------------------------------------ ciclo del juego -- */
    function loadVerb(next) {
      verb = next;
      accepted = false;
      clearTimers();
      resetActionButton();

      els.infinitive.textContent = verb.infinitive;
      // Único texto EN/RU de la interfaz: la traducción del infinitivo.
      els.translation.textContent = [verb.meaning_en, verb.meaning_ru]
        .filter(Boolean)
        .join(' \u00b7 ');
      var isIrregular = verb.irregular === true;
      els.infinitiveBtn.setAttribute(
        'aria-label',
        'Escuchar "' + verb.infinitive + '"' + (isIrregular ? ' (verbo irregular)' : '')
      );
      // El aviso de irregularidad se ve antes de responder; ya no hay nota.
      els.irregularBadge.hidden = !isIrregular;
      els.feedback.textContent = '';
      els.feedback.className = 'feedback';
      els.verbCard.classList.remove('is-shaking');

      FIELDS.forEach(function (field) {
        var input = inputs[field.key];
        input.value = '';
        input.readOnly = false;
        fieldEls[field.key].classList.remove('is-correct', 'is-wrong', 'is-locked', 'is-shaking');
        clearStatus(field);
      });

      remember(verb.infinitive);

      // Al abrir el juego o al pasar de palabra, el primer campo (yo) queda
      // enfocado y el teclado se abre listo para escribir.
      if (inputs.yo) {
        try { inputs.yo.focus({ preventScroll: true }); } catch (e) { inputs.yo.focus(); }
      }
    }

    function evaluate(field) {
      var input = inputs[field.key];
      var canonical = verb[field.key];
      // Escritura exacta (con tildes): distingue voseo de tuteo.
      var typed = normalize(input.value);
      var typedExact = normalizeExact(input.value);
      var correct = typed !== '' && typed === normalize(canonical);
      return {
        field: field,
        canonical: canonical,
        correct: correct,
        // Correcto solo tras quitar tildes: falta la escritura exacta.
        accentOnly: correct && typedExact !== normalizeExact(canonical)
      };
    }

    function accept() {
      if (!verb || accepted) return;
      accepted = true;

      // Se cierra el teclado: los campos quedan bloqueados y hay que ver el
      // resultado (las correcciones quedarían tapadas por el teclado).
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }

      var results = FIELDS.map(evaluate);
      var wrong = results.filter(function (r) { return !r.correct; });
      var gained = 0;

      results.forEach(function (result) {
        var input = inputs[result.field.key];
        var wrap = fieldEls[result.field.key];
        input.readOnly = true;                 // queda bloqueado
        wrap.classList.add('is-locked');
        if (result.correct) {
          // 2 puntos si la tilde está bien; 1 si acierta pero sin la tilde.
          gained += result.accentOnly ? POINTS_TILDE : POINTS_EXACT;
          wrap.classList.add('is-correct');
          setStatus(result.field, 'correct', result.canonical, result.accentOnly);
        } else {
          wrap.classList.add('is-wrong');
          setStatus(result.field, 'wrong', result.canonical);
        }
      });

      // El resultado se anuncia por `aria-live`, pero el texto vive en un
      // contenedor recortado (sr-only): la devolución visual son los colores
      // de cada campo y la corrección debajo del campo equivocado. Así la
      // línea de resumen no ocupa alto y las cinco filas entran sin scroll.
      if (wrong.length) {
        els.feedback.className = 'feedback is-bad';
        var names = wrong.map(function (result) { return result.field.label; }).join(', ');
        els.feedback.textContent = 'Casi. Revisá: ' + names + '.';
        els.verbCard.classList.remove('is-shaking');
        void els.verbCard.offsetWidth; // reinicia la animación
        els.verbCard.classList.add('is-shaking');

        streak = 0;
      } else {
        els.feedback.className = 'feedback is-good';
        els.feedback.textContent = '\u00a1Perfecto! Las cinco formas est\u00e1n bien.';
        streak += 1;
        if (streak > best) best = streak;
      }
      saveStreak();
      updateStreakUI();

      // Historial + puntos (localStorage): una entrada por palabra jugada.
      progress.record({
        verb: verb.infinitive,
        points: gained,
        max: FIELDS.length * POINTS_EXACT,
        correct: results.length - wrong.length,
        total: results.length,
        at: Date.now()
      });

      startCountdown();
    }

    /** "Siguiente" deshabilitado 3 s con anillo + número. */
    function startCountdown() {
      els.actionLabel.textContent = 'Siguiente';
      els.actionBtn.disabled = true;
      els.actionBtn.classList.add('is-counting');

      var remaining = COUNTDOWN_MS / 1000;
      els.ringNum.textContent = String(remaining);

      els.ringProgress.style.transition = 'none';
      els.ringProgress.style.strokeDashoffset = '0';
      void els.ringProgress.getBoundingClientRect(); // fuerza reflow
      els.ringProgress.style.transition = 'stroke-dashoffset ' + (COUNTDOWN_MS / 1000) + 's linear';
      els.ringProgress.style.strokeDashoffset = String(RING_CIRCUMFERENCE);

      tickTimer = setInterval(function () {
        remaining -= 1;
        if (remaining >= 1) els.ringNum.textContent = String(remaining);
      }, 1000);

      endTimer = setTimeout(function () {
        clearTimers();
        els.actionBtn.disabled = false;
        els.actionBtn.classList.remove('is-counting');
        els.ringProgress.style.transition = 'none';
        els.ringProgress.style.strokeDashoffset = '0';
      }, COUNTDOWN_MS);
    }

    function next() {
      if (els.actionBtn.disabled) return;
      loadVerb(pickVerb());
    }

    /* --------------------------------------------------------------- init -- */
    function mount() {
      if (mounted) return;
      mounted = true;

      els = {
        verbCard: $('verb-card'),
        infinitive: $('infinitive'),
        infinitiveBtn: $('infinitive-btn'),
        translation: $('verb-translation'),
        irregularBadge: $('irregular-badge'),
        fields: $('fields'),
        feedback: $('feedback'),
        actionBtn: $('action-btn'),
        actionLabel: $('action-label'),
        ringProgress: $('ring-progress'),
        ringNum: $('ring-num')
      };

      recent = loadHistory();
      loadStreak();
      updateStreakUI();
      buildFields();

      els.actionBtn.addEventListener('click', function () {
        if (accepted) next();
        else accept();
      });

      els.infinitiveBtn.addEventListener('click', function () {
        if (!verb) return;
        var spoke = Audio.speak(verb.infinitive);
        if (spoke) {
          els.infinitiveBtn.classList.add('is-speaking');
          setTimeout(function () { els.infinitiveBtn.classList.remove('is-speaking'); }, 900);
        }
      });
    }

    function teardown() {
      clearTimers();
      Audio.cancel();
    }

    function start() {
      mount();
      loadVerb(pickVerb());
    }

    return { mount: mount, start: start, teardown: teardown };
  })();

  /* Registro de módulos de práctica (hoy uno solo). */
  var MODULES = { verbs: verbTrainer };

  /* ------------------------------------------------------------ inicio ---- */
  function initHome() {
    var startBtn = $('start-btn');
    var hint = $('home-audio-hint');

    if (!Audio.available) {
      if (hint) hint.textContent = 'Este navegador no puede reproducir la pronunciación.';
    } else if (!Audio.ttsAvailable) {
      if (hint) hint.textContent = 'Los audios se reproducen desde los archivos mp3 incluidos.';
    }

    startBtn.addEventListener('click', function () {
      showScreen('game');
      MODULES.verbs.start();
    });
  }

  function initGame() {
    var backBtn = $('back-btn');
    backBtn.addEventListener('click', function () {
      MODULES.verbs.teardown();
      showScreen('home');
    });

    var historyBtn = $('history-btn');
    if (historyBtn) {
      historyBtn.addEventListener('click', function () {
        renderHistory();
        showScreen('history');
      });
    }
  }

  function initHistory() {
    var backBtn = $('history-back-btn');
    if (!backBtn) return;
    // "Volver" regresa al juego tal como estaba: la palabra y su resultado
    // siguen en pantalla, no se reinicia la jugada.
    backBtn.addEventListener('click', function () {
      showScreen('game');
    });
  }

  function init() {
    if (!VERBS.length) {
      var card = document.getElementById('fields');
      if (card) card.innerHTML = '<p class="hint hint--warn">No se pudieron cargar los verbos (js/verbs.js).</p>';
      return;
    }
    MODULES.verbs.mount();
    initHome();
    initGame();
    initHistory();
    progress.load();
    progress.paint();
    showScreen('home');
  }

  /* ------------------------------------------------- fondo estable (móvil) --
   * Al abrir el teclado el viewport se encoge y el navegador desplaza la
   * página para mostrar el campo enfocado: un fondo "fixed" se veía saltar
   * hacia arriba. Congelamos la altura del fondo (--bg-h): sólo crece, o se
   * recalcula al girar el teléfono / cambiar el ancho. El fondo queda
   * siempre anclado arriba y no se mueve mientras se escribe. */
  (function freezeBackdrop() {
    var root = document.documentElement;
    var frozen = 0;
    var lastWidth = 0;

    function sync() {
      var vv = global.visualViewport;
      var h = Math.max(global.innerHeight || 0, (vv && vv.height) || 0);
      var w = global.innerWidth || 0;
      if (!h) return;
      if (w !== lastWidth || h > frozen) {
        frozen = h;
        lastWidth = w;
        root.style.setProperty('--bg-h', h + 'px');
      }
    }

    sync();
    global.addEventListener('resize', sync);
    global.addEventListener('orientationchange', sync);
    if (global.visualViewport) global.visualViewport.addEventListener('resize', sync);
  })();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : globalThis);
