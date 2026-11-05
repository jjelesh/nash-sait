// Дисциплина: каждое полезное действие отмечает день как рабочий.
// Пропустила день — герои с картинки ругают и выдают «наказание» на сегодня.
// Вечером, если день пустой, предупреждают. Первая галочка дня — хвалят.
(function () {
  // Какие сохранения считаются учёбой (а не просто сменой настроек).
  const ACT = /(:planner:|:deadlines|:check:|:units|:progress|^learned:|^miss:|^plan:pomos|^plan:habits|^plan:tomorrow|:board:|^grammar:known|^events$|^focus:min:|^en:|^musts:done:|^practice:)/;
  const day = (d) => (d || new Date()).toLocaleDateString('sv-SE');
  const addDays = (iso, n) => { const d = new Date(iso + 'T12:00'); d.setDate(d.getDate() + n); return day(d); };
  const rawSet = store.set;

  if (!store.get('started')) rawSet('started', day());

  const activity = () => store.get('activity', {});

  function stats() {
    const a = activity(), t = day(), started = store.get('started', t);
    // Поцелуй 💋 — только за день, где выполнено всё: обязательное и все дела дня.
    const k = store.get('kisses', {});
    let streak = 0, d = k[t] ? t : addDays(t, -1);
    while (k[d]) { streak++; d = addDays(d, -1); }
    // Пропущено подряд до сегодняшнего дня (не раньше даты начала).
    let missed = 0;
    d = addDays(t, -1);
    while (d >= started && !a[d]) { missed++; d = addDays(d, -1); }
    let best = 0, run = 0;
    Object.keys(k).filter((x) => k[x]).sort().forEach((k, i, arr) => {
      run = i && addDays(arr[i - 1], 1) === k ? run + 1 : 1;
      best = Math.max(best, run);
    });
    return { streak, missed, best, today: a[t] || 0, started, kissedToday: !!k[t] };
  }

  store.set = function (key, value) {
    const m = /^learned:(hsk3|hsk4|verbs|en-a2|en-b1)$/.exec(key);
    if (m && Array.isArray(value)) {
      const before = (store.get(key, []) || []).length;
      const grew = value.length - before;
      if (grew > 0) {
        const wk = 'words:' + (/^(verbs|en-)/.test(m[1]) ? 'en' : 'zh') + ':' + day();
        rawSet(wk, store.get(wk, 0) + grew);
      }
    }
    rawSet(key, value);
    if (!ACT.test(key)) return;
    const a = activity(), t = day();
    const first = !a[t];
    const before = first ? stats() : null;
    a[t] = (a[t] || 0) + 1;
    rawSet('activity', a);
    document.dispatchEvent(new CustomEvent('activity'));
    if (first) praise(before);
  };

  // ---------- Герои ----------
  const WHO = {
    kassian: { name: 'Лелуш', cls: 'p-dark', img: 'lelouch', full: true },
    elian: { name: 'Джошуа', cls: 'p-light', img: 'joshua', full: true },
    tigra: { name: 'Мяфка', cls: 'p-tabby', img: 'myafka' },
    snow: { name: 'Оливка', cls: 'p-white', img: 'olivka' }
  };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const fill = (s, n) => s.replace(/\{n\}/g, n).replace(/\{d\}/g, n % 10 === 1 && n % 100 !== 11 ? 'день' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'дня' : 'дней');

  const SCOLD = {
    mild: [
      ['kassian', 'Вчера ты не открыла ни одного лепестка. Я заметил. Я всегда замечаю.'],
      ['elian', 'Один пропуск — случайность. Два — уже привычка. Не давай мне повода сказать «привычка».'],
      ['kassian', 'Вчера манхва получила твоё внимание, а HSK — нет. Странный выбор для будущей студентки в Китае.'],
      ['elian', 'Вчерашний день ушёл пустым. Значит, сегодняшний должен быть вдвое полнее.'],
      ['tigra', 'Мяу. (Перевод: я весь вечер сидела на учебнике, чтобы ты его открыла. Ты не открыла.)']
    ],
    medium: [
      ['kassian', '{n} {d} тишины. Слова HSK уже начали забывать тебя первыми.'],
      ['elian', 'Я заварил чай, открыл учебник и ждал. {n} {d}. Чай остыл, Дарья.'],
      ['tigra', 'Мяу-мяу. (Перевод: даже я выучила больше иероглифов за эти {n} {d}, чем ты.)'],
      ['kassian', 'IELTS не сдаётся сам. Я проверял. {n} {d} подряд проверял.']
    ],
    severe: [
      ['kassian', '{n} {d}. Я начинаю думать, что «уехать учиться за границу» — просто красивая фраза. Докажи, что нет.'],
      ['elian', 'Цветок без воды вянет за {n} {d}. Мечта — тоже. Полей её сегодня, хотя бы чуть-чуть.'],
      ['snow', 'Оливка смотрит на тебя долгим взглядом, тяжело вздыхает и демонстративно отворачивается.'],
      ['kassian', 'Ты пропала на {n} {d}. Сильные личности не исчезают. Они возвращаются и делают вдвое больше.']
    ]
  };
  const PENALTIES = [
    '+15 слов HSK сверху нормы', '1 тест по неправильным глаголам', '+1 клубничка фокуса (25 минут)',
    '2 новых правила грамматики', '5 предложений с новыми словами', '1 эссе-абзац на английском',
    '10 минут аудирования без субтитров', '20 страниц книги'
  ];
  const PRAISE_BACK = [
    ['elian', 'Вернулась. Хорошо. Больше не исчезай так надолго.'],
    ['kassian', 'Наконец-то. Я почти перестал ждать. Почти.']
  ];
  const PRAISE = [
    ['elian', 'Первая галочка дня. Вот так и становятся сильными.'],
    ['kassian', 'Неплохо. Продолжай, я смотрю.'],
    ['tigra', 'Мур. (Перевод: горжусь.)'],
    ['snow', 'Оливка одобрительно моргнула. Это высшая награда.']
  ];
  const EVENING = [
    ['kassian', 'Уже вечер, а сегодня пусто. У тебя ещё есть время, но его всё меньше.'],
    ['elian', 'День почти закончился. Хотя бы одна клубничка, хотя бы десять слов?'],
    ['tigra', 'Мяу! (Перевод: сегодня ни одной галочки. Я начинаю волноваться.)']
  ];

  // Портрет из assets/heroes/<герой>-<настроение>.jpg; если файла нет — лицо из общей картинки.
  // Настроение: angry — ругает, sweet — хвалит, smug — ехидничает.
  function portrait(who, mood) {
    const fallback = '<span class="portrait ' + WHO[who].cls + '"></span>';
    return '<img class="portrait" alt="" src="assets/heroes/' + WHO[who].img + '-' + (mood || 'angry') + '.jpg" onerror="this.outerHTML=this.dataset.fb" data-fb="' + fallback.replace(/"/g, '&quot;') + '">';
  }
  function figure(who) {
    const src = WHO[who].full ? 'assets/heroes/' + WHO[who].img + '-cut-angry.png' : 'assets/heroes/cats-full.jpg';
    return '<div class="scold-figure"><img alt="" src="' + src + '" onerror="this.parentNode.remove()"></div>';
  }

  // ---------- Всплывашка внизу экрана ----------
  function toast([who, text], ms, mood) {
    const el = document.createElement('div');
    el.className = 'hero-toast';
    el.innerHTML = portrait(who, mood || 'sweet') + '<div><b>' + WHO[who].name + '</b><p></p></div><button class="x" aria-label="Закрыть">×</button>';
    el.querySelector('p').textContent = text;
    const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 400); };
    el.querySelector('button').onclick = close;
    document.body.appendChild(el);
    setTimeout(close, ms || 6500);
  }

  function praise(before) {
    const s = stats();
    const milestone = null;
    setTimeout(() => toast(milestone ? ['elian', milestone] : before && before.missed ? pick(PRAISE_BACK) : pick(PRAISE)), 600);
  }

  // ---------- Строгое окно при пропуске ----------
  function scoldModal(s) {
    const level = s.missed >= 4 ? 'severe' : s.missed >= 2 ? 'medium' : 'mild';
    const shuffled = SCOLD[level].slice().sort(() => Math.random() - 0.5);
    const lines = [shuffled[0], shuffled.find((l) => l[0] !== shuffled[0][0]) || shuffled[1]];
    const pens = PENALTIES.slice().sort(() => Math.random() - 0.5).slice(0, Math.min(3, s.missed));
    const wrap = document.createElement('div');
    wrap.className = 'scold-wrap';
    wrap.innerHTML = '<div class="scold" role="dialog" aria-modal="true">' + figure(lines[0][0]) + '<div class="scold-body">' +
      '<p class="scold-kicker">' + (s.missed === 1 ? 'Вчера — пусто' : 'Пропущено: ' + fill('{n} {d}', s.missed)) + '</p>' +
      lines.map(([w, t]) => '<div class="scold-line">' + portrait(w, 'angry') + '<div><b>' + WHO[w].name + '</b><p>' + fill(t, s.missed) + '</p></div></div>').join('') +
      '<div class="scold-pen"><b>Наказание на сегодня:</b><ul>' + pens.map((p) => '<li>⚔ ' + p + '</li>').join('') + '</ul></div>' +
      '<div class="scold-btns"><button class="btn" data-accept>Принимаю, добавить в план</button><button class="btn-ghost" data-later>Я просто посмотреть</button></div>' +
      '</div></div>';
    const close = () => { wrap.classList.add('out'); setTimeout(() => wrap.remove(), 350); };
    wrap.querySelector('[data-accept]').onclick = () => {
      // В планер «План и энергия» на сегодня, без отметки дня как рабочего.
      const key = 'plan:planner:' + store.weekKey();
      const plan = store.get(key, [[], [], [], [], [], [], []]);
      pens.forEach((p) => plan[store.todayIndex()].push({ t: '⚔ ' + p, done: false }));
      rawSet(key, plan);
      close();
      setTimeout(() => toast(['kassian', 'Правильный выбор. Наказание в плане на сегодня. Я проверю.'], 0, 'smug'), 400);
    };
    wrap.querySelector('[data-later]').onclick = () => {
      close();
      setTimeout(() => toast(['elian', '«Просто посмотреть» — так и начинается прокрастинация. Я запомнил.'], 0, 'smug'), 400);
    };
    document.body.appendChild(wrap);
  }

  // Выговоры за невыполненные дни и наблюдение за днём теперь в day.js (там видно задачи).
  function onLoad() {}
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', onLoad) : onLoad();

  // Посмотреть, как герои ругают и хвалят, не пропуская дни.
  function demo() {
    scoldModal(Object.assign(stats(), { missed: 1 + Math.floor(Math.random() * 6) }));
  }

  window.discipline = { stats, activity, day, addDays, demo, toast, PRAISE, rawSet, portrait, figure, fill, SCOLD, PENALTIES, WHO };
})();
