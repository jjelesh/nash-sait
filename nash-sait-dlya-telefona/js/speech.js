// Произношение: голос браузера (на iPhone и Mac есть английский и китайский).
(function () {
  const LANGS = { en: 'en-US', zh: 'zh-CN' };
  let voices = [];
  const load = () => { try { voices = speechSynthesis.getVoices(); } catch (e) {} };
  if ('speechSynthesis' in window) { load(); speechSynthesis.onvoiceschanged = load; }

  function pickVoice(code) {
    const pref = code === 'zh-CN' ? ['Tingting', 'Ting-Ting', 'Lili', 'Meijia', 'Google 普通话'] : ['Samantha', 'Karen', 'Daniel', 'Google US English'];
    const same = voices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(code.slice(0, 2).toLowerCase()));
    return pref.map((n) => same.find((v) => v.name.includes(n))).find(Boolean) || same.find((v) => v.lang.replace('_', '-') === code) || same[0] || null;
  }

  window.say = function (text, lang, rate) {
    if (!('speechSynthesis' in window) || !text) return;
    const code = LANGS[lang] || lang || 'en-US';
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/___/g, ' '));
    u.lang = code;
    const v = pickVoice(code);
    if (v) u.voice = v;
    u.rate = rate || (code === 'zh-CN' ? 0.8 : 0.9);
    speechSynthesis.speak(u);
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
    return b;
  };
})();
