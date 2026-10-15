/* =============================================================================
 * verbs.js — 100 verbos más útiles del español rioplatense
 * -----------------------------------------------------------------------------
 * Presente del indicativo, con voseo rioplatense (Uruguay / Buenos Aires).
 * Lista investigada por frecuencia (CORPES XXI + CREA + OpenSubtitles, ponderada
 * hacia lo conversacional) y validada forma por forma.
 *
 * Cada entrada tiene estas claves:
 *   rank              -> posición en la lista de frecuencia (1..100)
 *   infinitive        -> infinitivo ("hablar")
 *   meaning_en        -> significado en inglés (gloss corto, sin cláusulas)
 *   meaning_ru        -> significado en ruso (mismo gloss que meaning_en)
 *   irregular         -> true si el presente del indicativo es irregular
 *   irregular_note    -> explicación en español de por qué es irregular ("" si es regular)
 *   yo                -> 1ª persona del singular ("hablo")
 *   vos               -> 2ª persona del singular, voseo ("hablás")
 *   nosotros          -> 1ª persona del plural ("hablamos")
 *   el_ella           -> 3ª persona del singular ("habla")
 *   el_ella_ustedes   -> forma CANÓNICA del 4º campo: "ustedes" ("hablan")
 *
 * `meaning_en` + `meaning_ru` son la ÚNICA excepción al español en la interfaz:
 * se muestran juntos, como "to speak · говорить", debajo del infinitivo.
 *
 * El 4º campo del juego acepta tanto `el_ella` como `el_ella_ustedes`,
 * pero cuando el usuario se equivoca se muestra `el_ella_ustedes`
 * (la forma rioplatense de "ustedes"), que es la que pedimos como respuesta.
 * `el_ella` cubre también "usted", que usa la misma 3ª del singular.
 *
 * Todas las formas de 2ª persona del singular son de voseo rioplatense.
 *
 * Este archivo es JS plano (no es un módulo ES) para que funcione con file://.
 * ========================================================================== */
(function (global) {
  'use strict';

  global.RPL_VERBS = [
    { rank: 1, infinitive: 'ser', meaning_en: 'to be (identity, essence)', meaning_ru: 'быть (сущность)', irregular: true, irregular_note: 'Totalmente irregular: soy, sos, es, son.', yo: 'soy', vos: 'sos', nosotros: 'somos', el_ella: 'es', el_ella_ustedes: 'son' },
    { rank: 2, infinitive: 'estar', meaning_en: 'to be (state, location)', meaning_ru: 'быть (состояние)', irregular: true, irregular_note: 'Irregular: estoy; estás, está y están con acento.', yo: 'estoy', vos: 'estás', nosotros: 'estamos', el_ella: 'está', el_ella_ustedes: 'están' },
    { rank: 3, infinitive: 'ir', meaning_en: 'to go', meaning_ru: 'идти', irregular: true, irregular_note: 'Totalmente irregular: voy, vas, va, van.', yo: 'voy', vos: 'vas', nosotros: 'vamos', el_ella: 'va', el_ella_ustedes: 'van' },
    { rank: 4, infinitive: 'tener', meaning_en: 'to have', meaning_ru: 'иметь', irregular: true, irregular_note: 'Irregular: tengo; e→ie en él/ustedes (tiene, tienen).', yo: 'tengo', vos: 'tenés', nosotros: 'tenemos', el_ella: 'tiene', el_ella_ustedes: 'tienen' },
    { rank: 5, infinitive: 'haber', meaning_en: 'to have (auxiliary); hay = there is/are', meaning_ru: 'иметь (вспомогательный)', irregular: true, irregular_note: 'Auxiliar irregular: he, has, ha, han; voseo culto rioplatense: vos has.', yo: 'he', vos: 'has', nosotros: 'hemos', el_ella: 'ha', el_ella_ustedes: 'han' },
    { rank: 6, infinitive: 'poder', meaning_en: 'to be able to, can', meaning_ru: 'мочь', irregular: true, irregular_note: 'Diptongación o→ue (puedo, puede, pueden).', yo: 'puedo', vos: 'podés', nosotros: 'podemos', el_ella: 'puede', el_ella_ustedes: 'pueden' },
    { rank: 7, infinitive: 'hacer', meaning_en: 'to do, to make', meaning_ru: 'делать', irregular: true, irregular_note: 'Irregular en yo (hago).', yo: 'hago', vos: 'hacés', nosotros: 'hacemos', el_ella: 'hace', el_ella_ustedes: 'hacen' },
    { rank: 8, infinitive: 'saber', meaning_en: 'to know (facts, how to)', meaning_ru: 'знать', irregular: true, irregular_note: 'Irregular en yo (sé).', yo: 'sé', vos: 'sabés', nosotros: 'sabemos', el_ella: 'sabe', el_ella_ustedes: 'saben' },
    { rank: 9, infinitive: 'decir', meaning_en: 'to say, to tell', meaning_ru: 'говорить', irregular: true, irregular_note: 'Irregular: digo; e→i en él/ustedes (dice, dicen).', yo: 'digo', vos: 'decís', nosotros: 'decimos', el_ella: 'dice', el_ella_ustedes: 'dicen' },
    { rank: 10, infinitive: 'ver', meaning_en: 'to see', meaning_ru: 'видеть', irregular: true, irregular_note: 'Irregular: veo, ve, ven.', yo: 'veo', vos: 'ves', nosotros: 'vemos', el_ella: 've', el_ella_ustedes: 'ven' },
    { rank: 11, infinitive: 'querer', meaning_en: 'to want, to love', meaning_ru: 'хотеть, любить', irregular: true, irregular_note: 'Diptongación e→ie (quiero, quiere, quieren).', yo: 'quiero', vos: 'querés', nosotros: 'queremos', el_ella: 'quiere', el_ella_ustedes: 'quieren' },
    { rank: 12, infinitive: 'pasar', meaning_en: 'to pass, to happen; to spend (time)', meaning_ru: 'проходить; случаться', irregular: false, irregular_note: '', yo: 'paso', vos: 'pasás', nosotros: 'pasamos', el_ella: 'pasa', el_ella_ustedes: 'pasan' },
    { rank: 13, infinitive: 'deber', meaning_en: 'must, to have to; to owe', meaning_ru: 'быть должным', irregular: false, irregular_note: '', yo: 'debo', vos: 'debés', nosotros: 'debemos', el_ella: 'debe', el_ella_ustedes: 'deben' },
    { rank: 14, infinitive: 'dar', meaning_en: 'to give', meaning_ru: 'давать', irregular: true, irregular_note: 'Irregular en yo (doy); vos das.', yo: 'doy', vos: 'das', nosotros: 'damos', el_ella: 'da', el_ella_ustedes: 'dan' },
    { rank: 15, infinitive: 'creer', meaning_en: 'to believe, to think', meaning_ru: 'верить, думать', irregular: false, irregular_note: '', yo: 'creo', vos: 'creés', nosotros: 'creemos', el_ella: 'cree', el_ella_ustedes: 'creen' },
    { rank: 16, infinitive: 'parecer', meaning_en: 'to seem, to look (like)', meaning_ru: 'казаться', irregular: true, irregular_note: 'Irregular en yo (-zco: parezco).', yo: 'parezco', vos: 'parecés', nosotros: 'parecemos', el_ella: 'parece', el_ella_ustedes: 'parecen' },
    { rank: 17, infinitive: 'hablar', meaning_en: 'to speak, to talk', meaning_ru: 'говорить', irregular: false, irregular_note: '', yo: 'hablo', vos: 'hablás', nosotros: 'hablamos', el_ella: 'habla', el_ella_ustedes: 'hablan' },
    { rank: 18, infinitive: 'sentir', meaning_en: 'to feel; to be sorry', meaning_ru: 'чувствовать; сожалеть', irregular: true, irregular_note: 'Diptongación e→ie (siento, siente, sienten); vos sentís.', yo: 'siento', vos: 'sentís', nosotros: 'sentimos', el_ella: 'siente', el_ella_ustedes: 'sienten' },
    { rank: 19, infinitive: 'dejar', meaning_en: 'to leave, to let; to stop (doing)', meaning_ru: 'оставлять; позволять', irregular: false, irregular_note: '', yo: 'dejo', vos: 'dejás', nosotros: 'dejamos', el_ella: 'deja', el_ella_ustedes: 'dejan' },
    { rank: 20, infinitive: 'pensar', meaning_en: 'to think; to plan', meaning_ru: 'думать; планировать', irregular: true, irregular_note: 'Diptongación e→ie (pienso, piensa, piensan).', yo: 'pienso', vos: 'pensás', nosotros: 'pensamos', el_ella: 'piensa', el_ella_ustedes: 'piensan' },
    { rank: 21, infinitive: 'esperar', meaning_en: 'to wait (for); to hope', meaning_ru: 'ждать; надеяться', irregular: false, irregular_note: '', yo: 'espero', vos: 'esperás', nosotros: 'esperamos', el_ella: 'espera', el_ella_ustedes: 'esperan' },
    { rank: 22, infinitive: 'mirar', meaning_en: 'to look at, to watch', meaning_ru: 'смотреть', irregular: false, irregular_note: '', yo: 'miro', vos: 'mirás', nosotros: 'miramos', el_ella: 'mira', el_ella_ustedes: 'miran' },
    { rank: 23, infinitive: 'llamar', meaning_en: 'to call; to name', meaning_ru: 'звать; называть', irregular: false, irregular_note: '', yo: 'llamo', vos: 'llamás', nosotros: 'llamamos', el_ella: 'llama', el_ella_ustedes: 'llaman' },
    { rank: 24, infinitive: 'seguir', meaning_en: 'to follow; to continue', meaning_ru: 'следовать; продолжать', irregular: true, irregular_note: 'Irregular: sigo; e→i en él/ustedes (sigue, siguen).', yo: 'sigo', vos: 'seguís', nosotros: 'seguimos', el_ella: 'sigue', el_ella_ustedes: 'siguen' },
    { rank: 25, infinitive: 'tratar', meaning_en: 'to try; to treat; to deal with', meaning_ru: 'пытаться; обращаться', irregular: false, irregular_note: '', yo: 'trato', vos: 'tratás', nosotros: 'tratamos', el_ella: 'trata', el_ella_ustedes: 'tratan' },
    { rank: 26, infinitive: 'venir', meaning_en: 'to come', meaning_ru: 'приходить', irregular: true, irregular_note: 'Irregular: vengo; e→ie en él/ustedes (viene, vienen).', yo: 'vengo', vos: 'venís', nosotros: 'venimos', el_ella: 'viene', el_ella_ustedes: 'vienen' },
    { rank: 27, infinitive: 'encontrar', meaning_en: 'to find', meaning_ru: 'находить', irregular: true, irregular_note: 'Diptongación o→ue (encuentro, encuentra, encuentran).', yo: 'encuentro', vos: 'encontrás', nosotros: 'encontramos', el_ella: 'encuentra', el_ella_ustedes: 'encuentran' },
    { rank: 28, infinitive: 'llevar', meaning_en: 'to carry, to take; to wear', meaning_ru: 'носить; брать', irregular: false, irregular_note: '', yo: 'llevo', vos: 'llevás', nosotros: 'llevamos', el_ella: 'lleva', el_ella_ustedes: 'llevan' },
    { rank: 29, infinitive: 'conocer', meaning_en: 'to know (people, places); to meet', meaning_ru: 'знать; знакомиться', irregular: true, irregular_note: 'Irregular en yo (-zco: conozco).', yo: 'conozco', vos: 'conocés', nosotros: 'conocemos', el_ella: 'conoce', el_ella_ustedes: 'conocen' },
    { rank: 30, infinitive: 'trabajar', meaning_en: 'to work', meaning_ru: 'работать', irregular: false, irregular_note: '', yo: 'trabajo', vos: 'trabajás', nosotros: 'trabajamos', el_ella: 'trabaja', el_ella_ustedes: 'trabajan' },
    { rank: 31, infinitive: 'volver', meaning_en: 'to return, to come back', meaning_ru: 'возвращаться', irregular: true, irregular_note: 'Diptongación o→ue (vuelvo, vuelve, vuelven).', yo: 'vuelvo', vos: 'volvés', nosotros: 'volvemos', el_ella: 'vuelve', el_ella_ustedes: 'vuelven' },
    { rank: 32, infinitive: 'tomar', meaning_en: 'to take; to drink', meaning_ru: 'брать; пить', irregular: false, irregular_note: '', yo: 'tomo', vos: 'tomás', nosotros: 'tomamos', el_ella: 'toma', el_ella_ustedes: 'toman' },
    { rank: 33, infinitive: 'llegar', meaning_en: 'to arrive, to reach', meaning_ru: 'приходить; доезжать', irregular: false, irregular_note: '', yo: 'llego', vos: 'llegás', nosotros: 'llegamos', el_ella: 'llega', el_ella_ustedes: 'llegan' },
    { rank: 34, infinitive: 'quedar', meaning_en: 'to stay, to remain; to fit', meaning_ru: 'оставаться; подходить', irregular: false, irregular_note: '', yo: 'quedo', vos: 'quedás', nosotros: 'quedamos', el_ella: 'queda', el_ella_ustedes: 'quedan' },
    { rank: 35, infinitive: 'poner', meaning_en: 'to put, to place', meaning_ru: 'класть, ставить', irregular: true, irregular_note: 'Irregular en yo (pongo).', yo: 'pongo', vos: 'ponés', nosotros: 'ponemos', el_ella: 'pone', el_ella_ustedes: 'ponen' },
    { rank: 36, infinitive: 'vivir', meaning_en: 'to live', meaning_ru: 'жить', irregular: false, irregular_note: '', yo: 'vivo', vos: 'vivís', nosotros: 'vivimos', el_ella: 'vive', el_ella_ustedes: 'viven' },
    { rank: 37, infinitive: 'salir', meaning_en: 'to go out, to leave', meaning_ru: 'выходить', irregular: true, irregular_note: 'Irregular en yo (salgo).', yo: 'salgo', vos: 'salís', nosotros: 'salimos', el_ella: 'sale', el_ella_ustedes: 'salen' },
    { rank: 38, infinitive: 'necesitar', meaning_en: 'to need', meaning_ru: 'нуждаться', irregular: false, irregular_note: '', yo: 'necesito', vos: 'necesitás', nosotros: 'necesitamos', el_ella: 'necesita', el_ella_ustedes: 'necesitan' },
    { rank: 39, infinitive: 'entender', meaning_en: 'to understand', meaning_ru: 'понимать', irregular: true, irregular_note: 'Diptongación e→ie (entiendo, entiende, entienden).', yo: 'entiendo', vos: 'entendés', nosotros: 'entendemos', el_ella: 'entiende', el_ella_ustedes: 'entienden' },
    { rank: 40, infinitive: 'buscar', meaning_en: 'to look for, to search', meaning_ru: 'искать', irregular: false, irregular_note: '', yo: 'busco', vos: 'buscás', nosotros: 'buscamos', el_ella: 'busca', el_ella_ustedes: 'buscan' },
    { rank: 41, infinitive: 'morir', meaning_en: 'to die', meaning_ru: 'умирать', irregular: true, irregular_note: 'Diptongación o→ue (muero, muere, mueren).', yo: 'muero', vos: 'morís', nosotros: 'morimos', el_ella: 'muere', el_ella_ustedes: 'mueren' },
    { rank: 42, infinitive: 'gustar', meaning_en: 'to like, to please (me gusta)', meaning_ru: 'нравиться', irregular: false, irregular_note: '', yo: 'gusto', vos: 'gustás', nosotros: 'gustamos', el_ella: 'gusta', el_ella_ustedes: 'gustan' },
    { rank: 43, infinitive: 'acabar', meaning_en: 'to finish; acabar de = to have just', meaning_ru: 'заканчивать', irregular: false, irregular_note: '', yo: 'acabo', vos: 'acabás', nosotros: 'acabamos', el_ella: 'acaba', el_ella_ustedes: 'acaban' },
    { rank: 44, infinitive: 'suponer', meaning_en: 'to suppose, to assume', meaning_ru: 'предполагать', irregular: true, irregular_note: 'Como poner: irregular en yo (supongo).', yo: 'supongo', vos: 'suponés', nosotros: 'suponemos', el_ella: 'supone', el_ella_ustedes: 'suponen' },
    { rank: 45, infinitive: 'recordar', meaning_en: 'to remember; to remind', meaning_ru: 'помнить; напоминать', irregular: true, irregular_note: 'Diptongación o→ue (recuerdo, recuerda, recuerdan).', yo: 'recuerdo', vos: 'recordás', nosotros: 'recordamos', el_ella: 'recuerda', el_ella_ustedes: 'recuerdan' },
    { rank: 46, infinitive: 'perder', meaning_en: 'to lose; to miss (a bus)', meaning_ru: 'терять; опаздывать', irregular: true, irregular_note: 'Diptongación e→ie (pierdo, pierde, pierden).', yo: 'pierdo', vos: 'perdés', nosotros: 'perdemos', el_ella: 'pierde', el_ella_ustedes: 'pierden' },
    { rank: 47, infinitive: 'preguntar', meaning_en: 'to ask (a question)', meaning_ru: 'спрашивать', irregular: false, irregular_note: '', yo: 'pregunto', vos: 'preguntás', nosotros: 'preguntamos', el_ella: 'pregunta', el_ella_ustedes: 'preguntan' },
    { rank: 48, infinitive: 'oír', meaning_en: 'to hear', meaning_ru: 'слышать', irregular: true, irregular_note: 'Irregular: oigo, oye, oyen; oís y oímos con acento.', yo: 'oigo', vos: 'oís', nosotros: 'oímos', el_ella: 'oye', el_ella_ustedes: 'oyen' },
    { rank: 49, infinitive: 'pedir', meaning_en: 'to ask for, to request; to order', meaning_ru: 'просить; заказывать', irregular: true, irregular_note: 'e→i en yo/él/ustedes (pido, pide, piden); vos pedís.', yo: 'pido', vos: 'pedís', nosotros: 'pedimos', el_ella: 'pide', el_ella_ustedes: 'piden' },
    { rank: 50, infinitive: 'empezar', meaning_en: 'to begin, to start', meaning_ru: 'начинать', irregular: true, irregular_note: 'Diptongación e→ie (empiezo, empieza, empiezan).', yo: 'empiezo', vos: 'empezás', nosotros: 'empezamos', el_ella: 'empieza', el_ella_ustedes: 'empiezan' },
    { rank: 51, infinitive: 'formar', meaning_en: 'to form, to shape; to train', meaning_ru: 'формировать', irregular: false, irregular_note: '', yo: 'formo', vos: 'formás', nosotros: 'formamos', el_ella: 'forma', el_ella_ustedes: 'forman' },
    { rank: 52, infinitive: 'entrar', meaning_en: 'to enter, to go in', meaning_ru: 'входить', irregular: false, irregular_note: '', yo: 'entro', vos: 'entrás', nosotros: 'entramos', el_ella: 'entra', el_ella_ustedes: 'entran' },
    { rank: 53, infinitive: 'escuchar', meaning_en: 'to listen (to)', meaning_ru: 'слушать', irregular: false, irregular_note: '', yo: 'escucho', vos: 'escuchás', nosotros: 'escuchamos', el_ella: 'escucha', el_ella_ustedes: 'escuchan' },
    { rank: 54, infinitive: 'jugar', meaning_en: 'to play (a game, sport)', meaning_ru: 'играть', irregular: true, irregular_note: 'Diptongación u→ue (juego, juega, juegan).', yo: 'juego', vos: 'jugás', nosotros: 'jugamos', el_ella: 'juega', el_ella_ustedes: 'juegan' },
    { rank: 55, infinitive: 'abrir', meaning_en: 'to open', meaning_ru: 'открывать', irregular: false, irregular_note: '', yo: 'abro', vos: 'abrís', nosotros: 'abrimos', el_ella: 'abre', el_ella_ustedes: 'abren' },
    { rank: 56, infinitive: 'cambiar', meaning_en: 'to change', meaning_ru: 'менять', irregular: false, irregular_note: '', yo: 'cambio', vos: 'cambiás', nosotros: 'cambiamos', el_ella: 'cambia', el_ella_ustedes: 'cambian' },
    { rank: 57, infinitive: 'terminar', meaning_en: 'to finish, to end', meaning_ru: 'заканчивать', irregular: false, irregular_note: '', yo: 'termino', vos: 'terminás', nosotros: 'terminamos', el_ella: 'termina', el_ella_ustedes: 'terminan' },
    { rank: 58, infinitive: 'intentar', meaning_en: 'to try, to attempt', meaning_ru: 'пытаться', irregular: false, irregular_note: '', yo: 'intento', vos: 'intentás', nosotros: 'intentamos', el_ella: 'intenta', el_ella_ustedes: 'intentan' },
    { rank: 59, infinitive: 'contar', meaning_en: 'to count; to tell (a story)', meaning_ru: 'считать; рассказывать', irregular: true, irregular_note: 'Diptongación o→ue (cuento, cuenta, cuentan).', yo: 'cuento', vos: 'contás', nosotros: 'contamos', el_ella: 'cuenta', el_ella_ustedes: 'cuentan' },
    { rank: 60, infinitive: 'ocurrir', meaning_en: 'to happen, to occur', meaning_ru: 'происходить', irregular: false, irregular_note: '', yo: 'ocurro', vos: 'ocurrís', nosotros: 'ocurrimos', el_ella: 'ocurre', el_ella_ustedes: 'ocurren' },
    { rank: 61, infinitive: 'comenzar', meaning_en: 'to begin, to start', meaning_ru: 'начинать', irregular: true, irregular_note: 'Diptongación e→ie (comienzo, comienza, comienzan).', yo: 'comienzo', vos: 'comenzás', nosotros: 'comenzamos', el_ella: 'comienza', el_ella_ustedes: 'comienzan' },
    { rank: 62, infinitive: 'ayudar', meaning_en: 'to help', meaning_ru: 'помогать', irregular: false, irregular_note: '', yo: 'ayudo', vos: 'ayudás', nosotros: 'ayudamos', el_ella: 'ayuda', el_ella_ustedes: 'ayudan' },
    { rank: 63, infinitive: 'existir', meaning_en: 'to exist', meaning_ru: 'существовать', irregular: false, irregular_note: '', yo: 'existo', vos: 'existís', nosotros: 'existimos', el_ella: 'existe', el_ella_ustedes: 'existen' },
    { rank: 64, infinitive: 'ganar', meaning_en: 'to win; to earn', meaning_ru: 'побеждать; зарабатывать', irregular: false, irregular_note: '', yo: 'gano', vos: 'ganás', nosotros: 'ganamos', el_ella: 'gana', el_ella_ustedes: 'ganan' },
    { rank: 65, infinitive: 'recibir', meaning_en: 'to receive, to get', meaning_ru: 'получать', irregular: false, irregular_note: '', yo: 'recibo', vos: 'recibís', nosotros: 'recibimos', el_ella: 'recibe', el_ella_ustedes: 'reciben' },
    { rank: 66, infinitive: 'escribir', meaning_en: 'to write', meaning_ru: 'писать', irregular: false, irregular_note: '', yo: 'escribo', vos: 'escribís', nosotros: 'escribimos', el_ella: 'escribe', el_ella_ustedes: 'escriben' },
    { rank: 67, infinitive: 'conseguir', meaning_en: 'to get, to obtain; to manage to', meaning_ru: 'доставать; добиваться', irregular: true, irregular_note: 'Irregular: consigo; e→i en él/ustedes (consigue, consiguen).', yo: 'consigo', vos: 'conseguís', nosotros: 'conseguimos', el_ella: 'consigue', el_ella_ustedes: 'consiguen' },
    { rank: 68, infinitive: 'permitir', meaning_en: 'to allow, to permit', meaning_ru: 'разрешать', irregular: false, irregular_note: '', yo: 'permito', vos: 'permitís', nosotros: 'permitimos', el_ella: 'permite', el_ella_ustedes: 'permiten' },
    { rank: 69, infinitive: 'leer', meaning_en: 'to read', meaning_ru: 'читать', irregular: false, irregular_note: '', yo: 'leo', vos: 'leés', nosotros: 'leemos', el_ella: 'lee', el_ella_ustedes: 'leen' },
    { rank: 70, infinitive: 'crear', meaning_en: 'to create', meaning_ru: 'создавать', irregular: false, irregular_note: '', yo: 'creo', vos: 'creás', nosotros: 'creamos', el_ella: 'crea', el_ella_ustedes: 'crean' },
    { rank: 71, infinitive: 'usar', meaning_en: 'to use', meaning_ru: 'использовать', irregular: false, irregular_note: '', yo: 'uso', vos: 'usás', nosotros: 'usamos', el_ella: 'usa', el_ella_ustedes: 'usan' },
    { rank: 72, infinitive: 'bajar', meaning_en: 'to go down; to lower; to download', meaning_ru: 'спускаться; скачивать', irregular: false, irregular_note: '', yo: 'bajo', vos: 'bajás', nosotros: 'bajamos', el_ella: 'baja', el_ella_ustedes: 'bajan' },
    { rank: 73, infinitive: 'presentar', meaning_en: 'to present; to introduce', meaning_ru: 'представлять', irregular: false, irregular_note: '', yo: 'presento', vos: 'presentás', nosotros: 'presentamos', el_ella: 'presenta', el_ella_ustedes: 'presentan' },
    { rank: 74, infinitive: 'resultar', meaning_en: 'to turn out (to be); to result', meaning_ru: 'оказываться', irregular: false, irregular_note: '', yo: 'resulto', vos: 'resultás', nosotros: 'resultamos', el_ella: 'resulta', el_ella_ustedes: 'resultan' },
    { rank: 75, infinitive: 'mostrar', meaning_en: 'to show', meaning_ru: 'показывать', irregular: true, irregular_note: 'Diptongación o→ue (muestro, muestra, muestran).', yo: 'muestro', vos: 'mostrás', nosotros: 'mostramos', el_ella: 'muestra', el_ella_ustedes: 'muestran' },
    { rank: 76, infinitive: 'sacar', meaning_en: 'to take out; to get (a grade); to remove', meaning_ru: 'вынимать; получать', irregular: false, irregular_note: '', yo: 'saco', vos: 'sacás', nosotros: 'sacamos', el_ella: 'saca', el_ella_ustedes: 'sacan' },
    { rank: 77, infinitive: 'convertir', meaning_en: 'to convert; to turn (into)', meaning_ru: 'превращать', irregular: true, irregular_note: 'Diptongación e→ie (convierto, convierte, convierten).', yo: 'convierto', vos: 'convertís', nosotros: 'convertimos', el_ella: 'convierte', el_ella_ustedes: 'convierten' },
    { rank: 78, infinitive: 'considerar', meaning_en: 'to consider', meaning_ru: 'считать, рассматривать', irregular: false, irregular_note: '', yo: 'considero', vos: 'considerás', nosotros: 'consideramos', el_ella: 'considera', el_ella_ustedes: 'consideran' },
    { rank: 79, infinitive: 'mantener', meaning_en: 'to keep, to maintain', meaning_ru: 'поддерживать', irregular: true, irregular_note: 'Como tener: irregular en yo (mantengo); e→ie en él/ustedes (mantiene, mantienen).', yo: 'mantengo', vos: 'mantenés', nosotros: 'mantenemos', el_ella: 'mantiene', el_ella_ustedes: 'mantienen' },
    { rank: 80, infinitive: 'pagar', meaning_en: 'to pay', meaning_ru: 'платить', irregular: false, irregular_note: '', yo: 'pago', vos: 'pagás', nosotros: 'pagamos', el_ella: 'paga', el_ella_ustedes: 'pagan' },
    { rank: 81, infinitive: 'suceder', meaning_en: 'to happen; to succeed (a person)', meaning_ru: 'происходить', irregular: false, irregular_note: '', yo: 'sucedo', vos: 'sucedés', nosotros: 'sucedemos', el_ella: 'sucede', el_ella_ustedes: 'suceden' },
    { rank: 82, infinitive: 'caer', meaning_en: 'to fall', meaning_ru: 'падать', irregular: true, irregular_note: 'Irregular en yo (caigo).', yo: 'caigo', vos: 'caés', nosotros: 'caemos', el_ella: 'cae', el_ella_ustedes: 'caen' },
    { rank: 83, infinitive: 'sentar', meaning_en: 'to seat; to sit (someone) down', meaning_ru: 'сажать', irregular: true, irregular_note: 'Diptongación e→ie (siento, sienta, sientan).', yo: 'siento', vos: 'sentás', nosotros: 'sentamos', el_ella: 'sienta', el_ella_ustedes: 'sientan' },
    { rank: 84, infinitive: 'decidir', meaning_en: 'to decide', meaning_ru: 'решать', irregular: false, irregular_note: '', yo: 'decido', vos: 'decidís', nosotros: 'decidimos', el_ella: 'decide', el_ella_ustedes: 'deciden' },
    { rank: 85, infinitive: 'traer', meaning_en: 'to bring', meaning_ru: 'приносить', irregular: true, irregular_note: 'Irregular en yo (traigo).', yo: 'traigo', vos: 'traés', nosotros: 'traemos', el_ella: 'trae', el_ella_ustedes: 'traen' },
    { rank: 86, infinitive: 'cerrar', meaning_en: 'to close, to shut', meaning_ru: 'закрывать', irregular: true, irregular_note: 'Diptongación e→ie (cierro, cierra, cierran).', yo: 'cierro', vos: 'cerrás', nosotros: 'cerramos', el_ella: 'cierra', el_ella_ustedes: 'cierran' },
    { rank: 87, infinitive: 'servir', meaning_en: 'to serve; to be useful', meaning_ru: 'служить; годиться', irregular: true, irregular_note: 'e→i en yo/él/ustedes (sirvo, sirve, sirven); vos servís.', yo: 'sirvo', vos: 'servís', nosotros: 'servimos', el_ella: 'sirve', el_ella_ustedes: 'sirven' },
    { rank: 88, infinitive: 'correr', meaning_en: 'to run', meaning_ru: 'бегать', irregular: false, irregular_note: '', yo: 'corro', vos: 'corrés', nosotros: 'corremos', el_ella: 'corre', el_ella_ustedes: 'corren' },
    { rank: 89, infinitive: 'significar', meaning_en: 'to mean, to signify', meaning_ru: 'значить', irregular: false, irregular_note: '', yo: 'significo', vos: 'significás', nosotros: 'significamos', el_ella: 'significa', el_ella_ustedes: 'significan' },
    { rank: 90, infinitive: 'comer', meaning_en: 'to eat', meaning_ru: 'есть', irregular: false, irregular_note: '', yo: 'como', vos: 'comés', nosotros: 'comemos', el_ella: 'come', el_ella_ustedes: 'comen' },
    { rank: 91, infinitive: 'olvidar', meaning_en: 'to forget', meaning_ru: 'забывать', irregular: false, irregular_note: '', yo: 'olvido', vos: 'olvidás', nosotros: 'olvidamos', el_ella: 'olvida', el_ella_ustedes: 'olvidan' },
    { rank: 92, infinitive: 'tocar', meaning_en: 'to touch; to play (an instrument)', meaning_ru: 'трогать; играть', irregular: false, irregular_note: '', yo: 'toco', vos: 'tocás', nosotros: 'tocamos', el_ella: 'toca', el_ella_ustedes: 'tocan' },
    { rank: 93, infinitive: 'importar', meaning_en: 'to matter, to be important; to import', meaning_ru: 'иметь значение; импортировать', irregular: false, irregular_note: '', yo: 'importo', vos: 'importás', nosotros: 'importamos', el_ella: 'importa', el_ella_ustedes: 'importan' },
    { rank: 94, infinitive: 'dormir', meaning_en: 'to sleep', meaning_ru: 'спать', irregular: true, irregular_note: 'Diptongación o→ue (duermo, duerme, duermen); vos dormís.', yo: 'duermo', vos: 'dormís', nosotros: 'dormimos', el_ella: 'duerme', el_ella_ustedes: 'duermen' },
    { rank: 95, infinitive: 'subir', meaning_en: 'to go up; to upload; to raise', meaning_ru: 'подниматься; загружать', irregular: false, irregular_note: '', yo: 'subo', vos: 'subís', nosotros: 'subimos', el_ella: 'sube', el_ella_ustedes: 'suben' },
    { rank: 96, infinitive: 'comprar', meaning_en: 'to buy', meaning_ru: 'покупать', irregular: false, irregular_note: '', yo: 'compro', vos: 'comprás', nosotros: 'compramos', el_ella: 'compra', el_ella_ustedes: 'compran' },
    { rank: 97, infinitive: 'caminar', meaning_en: 'to walk', meaning_ru: 'ходить', irregular: false, irregular_note: '', yo: 'camino', vos: 'caminás', nosotros: 'caminamos', el_ella: 'camina', el_ella_ustedes: 'caminan' },
    { rank: 98, infinitive: 'aprender', meaning_en: 'to learn', meaning_ru: 'учить', irregular: false, irregular_note: '', yo: 'aprendo', vos: 'aprendés', nosotros: 'aprendemos', el_ella: 'aprende', el_ella_ustedes: 'aprenden' },
    { rank: 99, infinitive: 'amar', meaning_en: 'to love', meaning_ru: 'любить', irregular: false, irregular_note: '', yo: 'amo', vos: 'amás', nosotros: 'amamos', el_ella: 'ama', el_ella_ustedes: 'aman' },
    { rank: 100, infinitive: 'beber', meaning_en: 'to drink', meaning_ru: 'пить', irregular: false, irregular_note: '', yo: 'bebo', vos: 'bebés', nosotros: 'bebemos', el_ella: 'bebe', el_ella_ustedes: 'beben' },
  ];
})(typeof window !== 'undefined' ? window : globalThis);
