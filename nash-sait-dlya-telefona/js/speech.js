// Произношение. Английские слова — живые записи носителей из открытого словаря (dictionaryapi.dev),
// если записи нет или это фраза — лучший естественный голос устройства (его можно выбрать).
(function () {
  const LANGS = { en: 'en-US', zh: 'zh-CN' };
  // Голоса-«приколы» macOS/iOS, которые звучат страшно.
  const NOVELTY = /Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Fred|Jester|Junior|Kathy|Organ|Ralph|Trinoids|Whisper|Zarvox|Wobble|Good News|Superstar|Grandma|Grandpa|Eddy|Flo|Reed|Rocko|Sandy|Shelley|Deranged|Hysterical|Pipe Organ/i;
  let voices = [];
  const load = () => { try { voices = speechSynthesis.getVoices(); } catch (e) {} };
  if ('speechSynthesis' in window) { load(); speechSynthesis.onvoiceschanged = load; }

  const langVoices = (code) => voices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(code.slice(0, 2)) && !NOVELTY.test(v.name));
  function score(v, code) {
    let s = 0;
    if (/premium|enhanced|natural|neural/i.test(v.name + v.voiceURI)) s += 50;
    if (code === 'en-US' && /Ava|Samantha|Allison|Susan|Zoe|Nicky|Evan|Tom|Google US English|Aria|Jenny/i.test(v.name)) s += 20;
    if (code === 'zh-CN' && /Tingting|Ting-Ting|Lili|Yu-shu|Meijia|Google 普通话|Xiaoxiao/i.test(v.name)) s += 20;
    if (v.lang.replace('_', '-') === code) s += 10;
    if (v.localService) s += 2;
    return s;
  }
  function pickVoice(code) {
    const chosen = store.get('voice:' + code, '');
    const list = langVoices(code);
    return list.find((v) => v.name === chosen) || list.sort((a, b) => score(b, code) - score(a, code))[0] || null;
  }

  function tts(text, code, rate) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = code;
    const v = pickVoice(code);
    if (v) u.voice = v;
    u.rate = rate || (code === 'zh-CN' ? 0.8 : 0.95);
    speechSynthesis.speak(u);
  }

  const isWord = (t) => /^[a-z][a-z'-]*( [a-z]+)?$/i.test(t);
  // Записи для видимых кнопок 🔊 ищутся заранее, по одной.
  const queue = [];
  let busy = false;
  const pump = async () => {
    if (busy || !queue.length) return;
    busy = true;
    const w = queue.shift();
    if (!(w in store.get(AUDIO, {}))) await recordingFor(w);
    busy = false;
    pump();
  };
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((ents) => ents.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const w = e.target.dataset.word;
    if (w && !(w in store.get(AUDIO, {}))) { queue.push(w); pump(); }
  })) : null;

  // Ссылки на записи слов храним, чтобы не искать повторно ('' — записи нет).
  const AUDIO = 'audio:en';
  let player = null;
  async function recordingFor(word) {
    const cache = store.get(AUDIO, {});
    if (word in cache) return cache[word];
    let url = '';
    try {
      const ctl = new AbortController();
      setTimeout(() => ctl.abort(), 2500);
      const r = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word), { signal: ctl.signal });
      if (r.ok) {
        const ph = (await r.json()).flatMap((e) => e.phonetics || []).filter((p) => p.audio);
        url = ((ph.find((p) => /-us\.mp3$/.test(p.audio)) || ph.find((p) => /-uk\.mp3$/.test(p.audio)) || ph[0]) || {}).audio || '';
      } else if (r.status !== 404) return null;
    } catch (e) { return null; }
    const c = store.get(AUDIO, {});
    c[word] = url;
    try { localStorage.setItem('dasha-hub:' + AUDIO, JSON.stringify(c)); } catch (e) {}
    return url;
  }

  window.say = function (text, lang, rate) {
    if (!text) return;
    text = String(text).replace(/___/g, ' ').trim();
    const code = LANGS[lang] || lang || 'en-US';
    if (player) { player.pause(); player = null; }
    // На iPhone звук можно включить только сразу после нажатия, поэтому без ожидания сети:
    // запись берём из уже найденных, а если её ещё нет — говорит голос, а запись ищется на следующий раз.
    if (code === 'en-US' && store.get('voice:en-US', '') === '' && isWord(text)) {
      const w = text.toLowerCase(), cache = store.get(AUDIO, {});
      if (cache[w]) {
        try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {}
        player = new Audio(cache[w]);
        const p = player.play();
        if (p && p.catch) p.catch(() => tts(text, code, rate));
        return;
      }
      if (!(w in cache)) recordingFor(w);
    }
    tts(text, code, rate);
  };

  // Кнопка 🔊; нажатие не переворачивает карточку и не выбирает вариант.
  window.sayBtn = function (text, lang) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'say-btn';
    b.title = 'Прослушать';
    b.setAttribute('aria-label', 'Прослушать произношение');
    b.textContent = '🔊';
    b.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); say(typeof text === 'function' ? text() : text, lang); });
    if (lang === 'en' && typeof text === 'string' && isWord(text) && io) { b.dataset.word = text.toLowerCase(); io.observe(b); }
    return b;
  };

  // Выбор голоса: «живые записи» (только англ.) или один из нормальных голосов устройства.
  window.voicePicker = function (lang) {
    const code = LANGS[lang];
    const sel = document.createElement('select');
    sel.className = 'voice-pick';
    sel.title = 'Голос';
    const fill = () => {
      const cur = store.get('voice:' + code, '');
      const list = langVoices(code).sort((a, b) => score(b, code) - score(a, code));
      sel.innerHTML = '';
      const def = document.createElement('option');
      def.value = '';
      def.textContent = lang === 'en' ? '🎙 живые записи + лучший голос' : '🎙 лучший голос';
      sel.append(def);
      list.forEach((v) => { const o = document.createElement('option'); o.value = v.name; o.textContent = v.name.replace(/\s*\(.*\)/, '') + (/premium|enhanced/i.test(v.name) ? ' ★' : ''); o.selected = v.name === cur; sel.append(o); });
    };
    fill();
    if ('speechSynthesis' in window) speechSynthesis.addEventListener('voiceschanged', fill);
    sel.addEventListener('change', () => { store.set('voice:' + code, sel.value); say(lang === 'en' ? 'Hello, this is my voice.' : '你好，我会说中文。', lang); });
    return sel;
  };
})();
