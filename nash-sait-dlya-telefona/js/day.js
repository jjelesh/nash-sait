// День Дарьи: приветствия, «квесты» на сегодня, расписание по часам, события на любую дату,
// клубничный фокус-таймер (живёт между страницами), приз в 23:00 и «Что мне делать?».
(function () {
  const D = window.discipline;
  const iso = (d) => (d || new Date()).toLocaleDateString('sv-SE');
  const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const plural = (n, one, few, many) => n % 10 === 1 && n % 100 !== 11 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many;
  const fmtMin = (m) => { m = Math.round(m); const hh = Math.floor(m / 60), mm = m % 60; return hh ? hh + ' ч' + (mm ? ' ' + mm + ' мин' : '') : mm + ' мин'; };

  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v == null || v === false) return;
      if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'class') el.className = v;
      else el.setAttribute(k, v === true ? '' : v);
    });
    kids.flat().forEach((c) => c != null && el.append(c.nodeType ? c : document.createTextNode(c)));
    return el;
  }
  const card = (w, ...body) => h('section', { class: 'card card-' + w.type }, h('h3', {}, w.title), ...body);

  // ---------- Приветствие ----------
  const NAMES = ['Дарьюшка', 'Дарьюша', 'Дарьюшка-солнышко', 'госпожа Дарья', 'моя госпожа', 'милая Дарья', 'принцесса', 'леди Дарья', 'звёздочка наша', 'Дарьюшка-умница', 'милая', 'наша госпожа'];
  function greeting() {
    const hr = new Date().getHours();
    const part = hr >= 5 && hr < 12 ? 0 : hr < 18 && hr >= 12 ? 1 : hr >= 18 && hr < 23 ? 2 : 3;
    const seed = new Date().getDate() * 7 + part * 3;
    const name = NAMES[seed % NAMES.length];
    const hello = ['Доброе утро', 'Добрый день', 'Добрый вечер', 'Доброй ночи'][part];
    const sub = [
      ['Начнём день с одной клубнички? 🍓', 'Сначала главный квест, потом всё остальное.', 'Утро — лучшее время для новых слов.'],
      ['Середина дня — самое время для клубнички.', 'Как там квесты? Мы следим ♥', 'Пара часов фокуса, и день засчитан.'],
      ['Вечер — время закрыть хвосты.', 'Ещё одна клубничка до сна?', 'Посмотрим, что осталось на сегодня.'],
      ['Уже ночь. Закрой ноутбук и выспись, завтра продолжим.', 'Сон — тоже часть учёбы. Спокойной ночи.', 'Пора спать, звёздочка.']
    ][part];
    return { hello, name, line: hello + ', ' + name, sub: sub[seed % sub.length], part };
  }

  // ---------- Обязательное каждый день ----------
  // auto: 'zh' / 'en' — галочка ставится сама, когда в тренажёре выучено нужное число слов.
  const DEFAULT_MUSTS = [
    { id: 'wake', t: 'Подъём в 6:00', time: '06:00', dur: 15 },
    { id: 'en25', t: '25 слов английского (тренажёр слов)', n: 25, auto: 'en' },
    { id: 'zh25', t: '25 слов китайского (тренажёр HSK)', n: 25, auto: 'zh' },
    { id: 'focus', t: 'Минимум 2 клубнички 🍓 (80 мин учёбы)', n: 2, auto: 'berries' },
    { id: 'run', t: 'Пробежка', time: '22:30', dur: 30 }
  ];
  const musts = () => store.get('musts:list', DEFAULT_MUSTS).map((m) => (m.id === 'en25' && !m.auto ? Object.assign({}, m, { auto: 'en', n: 25 }) : m));
  const mustsDone = (day) => store.get('musts:done:' + day, []);
  const wordsToday = (lang, day) => store.get('words:' + lang + ':' + (day || iso()), 0);
  function mustProgress(m, day) {
    if (m.auto === 'zh') return wordsToday('zh', day);
    if (m.auto === 'en') return wordsToday('en', day);
    if (m.auto === 'berries') return berries(day);
    return null;
  }
  function mustIsDone(m, day) {
    const p = mustProgress(m, day);
    return mustsDone(day).includes(m.id) || (p != null && p >= (m.n || 1));
  }
  function setMust(id, v, day) {
    const key = 'musts:done:' + (day || iso());
    const d = new Set(store.get(key, []));
    v ? d.add(id) : d.delete(id);
    store.set(key, [...d]);
  }

  // ---------- Задачи дня из всех источников ----------
  const events = () => store.get('events', {});
  function todayItems(date) {
    const day = date || iso();
    const out = [];
    musts().forEach((m) => {
      const p = mustProgress(m, day);
      out.push({ t: m.t + (p != null && p < (m.n || 1) ? ' · ' + p + '/' + m.n : ''), time: m.time, dur: m.dur, done: mustIsDone(m, day), tag: m.time || 'каждый день', must: true, set: (v) => setMust(m.id, v, day) });
    });
    const dObj = new Date(day + 'T12:00');
    const week = store.weekKey(dObj), wd = (dObj.getDay() + 6) % 7;
    (window.SECTIONS || []).forEach((s) => {
      const key = s.id + ':planner:' + week;
      const plan = store.get(key, null);
      if (!plan) return;
      plan[wd].forEach((it, i) => out.push({ t: it.t, done: it.done, tag: s.title, set: (v) => { const p = store.get(key); p[wd][i].done = v; store.set(key, p); } }));
    });
    const tm = store.get('plan:tomorrow', null);
    if (tm && tm.for === day) tm.items.forEach((it, i) => out.push({ t: it.t, done: it.done, tag: 'план', set: (v) => { const p = store.get('plan:tomorrow'); p.items[i].done = v; store.set('plan:tomorrow', p); } }));
    store.get('ddz:deadlines', []).forEach((it, i) => {
      if (it.date === day || (day === iso() && it.date < day && !it.done)) out.push({ t: it.t, done: it.done, tag: it.date < day ? 'просрочено' : 'дедлайн', hot: true, set: (v) => { const p = store.get('ddz:deadlines'); p[i].done = v; store.set('ddz:deadlines', p); } });
    });
    (events()[day] || []).forEach((it, i) => out.push({ t: it.t, time: it.time, dur: it.dur, done: it.done, tag: it.time || 'событие', ev: i, set: (v) => { const e = events(); e[day][i].done = v; store.set('events', e); } }));
    return out;
  }

  function addEvent(day, t, time, dur) {
    const e = events();
    (e[day] = e[day] || []).push({ t, time: time || '', dur: +dur || 60, done: false });
    e[day].sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));
    store.set('events', e);
    document.dispatchEvent(new CustomEvent('events'));
  }
  function removeEvent(day, i) {
    const e = events();
    e[day].splice(i, 1);
    if (!e[day].length) delete e[day];
    store.set('events', e);
    document.dispatchEvent(new CustomEvent('events'));
  }

  // ---------- Поцелуй 💋: всё обязательное и все дела дня выполнены ----------
  function dayComplete(day) {
    const items = todayItems(day);
    return items.length > 0 && items.every((i) => i.done);
  }
  function checkKiss() {
    const day = iso();
    const k = store.get('kisses', {});
    const done = dayComplete(day);
    if (done === !!k[day]) return;
    if (done) k[day] = true; else delete k[day];
    D.rawSet('kisses', k);
    try { localStorage.setItem('dasha-hub-ts', JSON.stringify(Object.assign(store.stamps(), { kisses: Date.now() }))); } catch (e) {}
    document.dispatchEvent(new CustomEvent('activity'));
    if (done) {
      const st = D.stats();
      const extra = { 3: ' Три дня подряд — Лелуш поцеловал тебе руку.', 7: ' Неделя подряд! Мальчики гордятся тобой.', 14: ' Две недели! Джошуа пишет о тебе стихи.', 30: ' Месяц подряд. Ты и есть сильная личность.' }[st.streak] || '';
      window.fx && fx.celebrate();
      D.toast(['elian', 'Всё на сегодня выполнено. Держи поцелуй 💋 (' + st.streak + ' подряд).' + extra], 9000, 'sweet');
    }
  }

  // ---------- Клубничный фокус ----------
  const MODES = [
    { id: 'focus40', label: 'Клубничка · 40 мин', min: 40, study: true },
    { id: 'focus120', label: 'Большая клубника · 2 часа', min: 120, study: true },
    { id: 'rest10', label: 'Отдых · 10 мин', min: 10 },
    { id: 'rest30', label: 'Отдых · 30 мин', min: 30 }
  ];
  const run = () => store.get('focus:run', null);
  const minutesToday = (day) => store.get('focus:min:' + (day || iso()), 0);
  const berries = (day) => Math.floor(minutesToday(day) / 40);

  function beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.3, 0.6, 1.2, 1.5].forEach((t) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = t > 1 ? 1046 : 880; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0.2, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.28);
        o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.3);
      });
    } catch (e) {}
  }

  function startFocus(modeId, what) {
    const m = MODES.find((x) => x.id === modeId);
    store.set('focus:run', { mode: m.id, min: m.min, study: !!m.study, end: Date.now() + m.min * 60000, started: Date.now(), what: what || '' });
    document.dispatchEvent(new CustomEvent('focusrun'));
  }
  function pauseFocus() {
    const r = run();
    if (!r) return;
    if (r.paused) { r.end = Date.now() + r.left; delete r.paused; delete r.left; }
    else { r.left = Math.max(0, r.end - Date.now()); r.paused = true; }
    store.set('focus:run', r);
    document.dispatchEvent(new CustomEvent('focusrun'));
  }
  // Засчитать учёбу (полностью или сколько успела, если закончила раньше).
  function finishFocus(early) {
    const r = run();
    if (!r) return;
    store.set('focus:run', null);
    const spent = early ? Math.floor(((r.paused ? r.min * 60000 - r.left : r.min * 60000 - Math.max(0, r.end - Date.now()))) / 60000) : r.min;
    if (r.study && spent > 0) {
      const day = iso(new Date(r.started));
      const before = minutesToday(day);
      store.set('focus:min:' + day, before + spent);
      store.set('plan:pomos:' + day, Math.floor((before + spent) / 40));
      if (!early) beep();
      const got = Math.floor((before + spent) / 40) - Math.floor(before / 40);
      prizeCheck(before, before + spent);
      D.toast(['elian', (got ? 'Держи ' + '🍓'.repeat(Math.min(got, 5)) + '. ' : '') + 'Сегодня уже ' + fmtMin(before + spent) + ' учёбы.'], 7000, 'sweet');
    } else if (!r.study && !early) {
      beep();
      D.toast(['kassian', r.mode === 'fun' ? 'Время «' + r.what + '» вышло. Закрывай и возвращайся, ' + greeting().name + '.' : 'Отдых окончен. Возвращайся, ' + greeting().name + '.'], 9000, 'smug');
    }
    document.dispatchEvent(new CustomEvent('focusrun'));
  }

  // ---------- Призы ----------
  const TIERS = [
    { min: 120, who: 'elian', text: 'Два часа учёбы! Джошуа целует тебе руку 💋 Продолжай, до большого приза осталось три часа.' },
    { min: 210, who: 'kassian', text: 'Три с половиной часа. Признаю, я впечатлён. Ещё полтора — и в 23:00 тебя ждёт сюрприз.' },
    { min: 300, who: 'elian', text: 'Пять часов! Ты сделала это. В 23:00 мы придём лично 💋' }
  ];
  function prizeCheck(before, after) {
    TIERS.forEach((t) => { if (before < t.min && after >= t.min) setTimeout(() => D.toast([t.who, t.text], 10000, 'sweet'), 1500); });
    if (after >= 300 && new Date().getHours() >= 23) setTimeout(() => grandPrize(), 3000);
  }

  function grandPrize(demo) {
    const day = new Date().getHours() < 5 ? iso(new Date(Date.now() - 864e5)) : iso();
    const mins = demo ? 320 : minutesToday(day);
    if (!demo) store.set('prize:' + day, true);
    const g = greeting();
    const wrap = h('div', { class: 'prize-wrap' });
    const cats = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5).slice(0, 3);
    wrap.append(
      h('img', { class: 'prize-boy left', src: 'assets/heroes/lelouch-cut-sweet.png', alt: '', onerror: function () { this.remove(); } }),
      h('img', { class: 'prize-boy right', src: 'assets/heroes/joshua-cut-sweet.png', alt: '', onerror: function () { this.remove(); } }),
      h('div', { class: 'prize-card' },
        h('p', { class: 'prize-kicker' }, 'Приз дня'),
        h('h2', {}, g.name.charAt(0).toUpperCase() + g.name.slice(1) + ', ты сделала это'),
        h('p', { class: 'prize-stats' }, fmtMin(mins) + ' учёбы · ' + '🍓'.repeat(Math.min(12, Math.floor(mins / 40))) + ' ' + Math.floor(mins / 40)),
        h('div', { class: 'prize-lines' },
          h('p', {}, h('b', {}, 'Лелуш: '), 'Пять часов. Я знал, что ты сильнее, чем думаешь. Сегодня ты заслужила всё.'),
          h('p', {}, h('b', {}, 'Джошуа: '), 'Иди сюда, наша умница. Целуем в макушку — и марш спать 💋'),
          h('p', {}, h('b', {}, 'Мяфка и Оливка: '), 'Мур-мур. (Перевод: мы тобой гордимся и ждём на подушке.)')),
        h('div', { class: 'polaroids' }, cats.map((n, i) => h('figure', { style: '--r:' + (i * 7 - 7) + 'deg' }, h('img', { src: 'assets/heroes/cats-photo-' + n + '.jpg', alt: '' }), h('figcaption', {}, ['наши звёзды', 'гордимся', 'мур'][i])))),
        h('button', { class: 'btn', onclick: () => { wrap.classList.add('out'); setTimeout(() => wrap.remove(), 500); } }, 'Спасибо, мальчики 💋')));
    document.body.append(wrap);
    let n = 0;
    const iv = setInterval(() => { window.fx && fx.celebrate(Math.random() * innerWidth, Math.random() * innerHeight * 0.6); if (++n > 8) clearInterval(iv); }, 450);
  }

  // ---------- Плавающий таймер на всех страницах ----------
  let floatEl = null;
  function tick() {
    const r = run();
    if (r && !r.paused && r.end <= Date.now()) finishFocus(false);
    const cur = run();
    if (!cur) { if (floatEl) { floatEl.remove(); floatEl = null; } return; }
    const left = cur.paused ? cur.left : Math.max(0, cur.end - Date.now());
    const s = Math.round(left / 1000);
    const txt = (cur.study ? '🍓 ' : '☕ ') + (s >= 3600 ? Math.floor(s / 3600) + ':' : '') + String(Math.floor(s / 60) % 60).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0') + (cur.paused ? ' ⏸' : '');
    if (!floatEl) {
      floatEl = h('a', { class: 'focus-float pill', href: 'section.html?s=plan', title: 'Открыть таймер' });
      document.body.append(floatEl);
    }
    floatEl.textContent = txt;
    document.querySelectorAll('[data-focus-clock]').forEach((el) => { el.textContent = txt.slice(2).replace(' ⏸', ''); });
  }

  // ---------- Виджеты ----------
  const X = {};

  // «Сегодня»: приветствие, кольцо прогресса и квесты.
  X.today = (w) => {
    const box = h('div', { class: 'today' });
    const render = () => {
      const g = greeting();
      const items = todayItems();
      const done = items.filter((i) => i.done).length;
      const pct = items.length ? done / items.length : 0;
      const mins = minutesToday();
      const toPrize = Math.max(0, 300 - mins);
      const mustItems = items.filter((i) => i.must);
      const other = items.filter((i) => !i.must);
      const mustsLeft = mustItems.filter((i) => !i.done).length;
      const main = other.find((i) => !i.done && !i.time);
      const timed = other.filter((i) => i.time).sort((a, b) => a.time.localeCompare(b.time));
      const rest = other.filter((i) => !i.time && i !== main);
      const kissed = !!store.get('kisses', {})[iso()];
      const row = (it, cls) => h('li', { class: (it.done ? 'done ' : '') + (it.hot ? 'hot ' : '') + (cls || '') },
        h('label', {}, h('input', { type: 'checkbox', checked: it.done, onchange: (e) => { it.set(e.target.checked); render(); } }), h('span', {}, it.t)),
        h('span', { class: 'tag' }, it.tag));
      box.replaceChildren(...[
        h('div', { class: 'today-head' },
          h('div', { class: 'ring', style: '--p:' + Math.round(pct * 100) }, h('b', {}, done + '/' + items.length)),
          h('div', {}, h('p', { class: 'hello' }, g.line), h('p', { class: 'muted' }, g.sub),
            h('p', { class: 'today-stats' }, '🍓 ' + berries() + ' · ⏱ ' + fmtMin(mins) + ' · ' + (toPrize ? 'до приза ' + fmtMin(toPrize) : 'приз в 23:00 💋')))),
        h('div', { class: 'add-today' }, h('p', { class: 'q-kicker' }, '＋ Добавить задачу на сегодня'), quickAdd(iso(), render)),
        h('p', { class: kissed ? 'all-done' : 'kiss-hint' }, kissed ? 'Всё выполнено — поцелуй дня твой 💋' : '💋 Поцелуй дня — когда выполнишь всё обязательное и все дела. Осталось: ' + (items.length - done)),
        h('div', { class: 'musts-box' },
          h('p', { class: 'mq-kicker' }, '♛ Обязательное каждый день' + (mustsLeft ? ' · осталось ' + mustsLeft : ' ✓')),
          h('ul', { class: 'quests' }, mustItems.map((i) => row(i, 'must'))),
          h('button', { class: 'btn-ghost small', onclick: editMusts }, 'Настроить обязательное')),
        main ? h('div', { class: 'main-quest' }, h('p', { class: 'mq-kicker' }, '♛ Главный квест'), h('ul', { class: 'quests' }, row(main))) : null,
        timed.length ? h('div', {}, h('p', { class: 'q-kicker' }, '⏰ По времени'), h('ul', { class: 'quests' }, timed.map((i) => row(i, 'timed')))) : null,
        rest.length ? h('div', {}, h('p', { class: 'q-kicker' }, '✦ Ещё квесты'), h('ul', { class: 'quests' }, rest.map((i) => row(i)))) : null,
        !other.length ? h('p', { class: 'muted' }, 'Других дел пока нет. Впиши задачу в поле сверху и нажми +, или «Что мне делать?».') : null].filter(Boolean));
    };
    render();
    ['events', 'activity', 'focusrun'].forEach((ev) => document.addEventListener(ev, render));
    return card(w, box);
  };

  function editMusts() {
    const wrap = h('div', { class: 'scold-wrap' });
    const list = musts().map((m) => Object.assign({}, m));
    const body = h('div', { class: 'scold-body' });
    const close = () => { wrap.classList.add('out'); setTimeout(() => wrap.remove(), 350); };
    const render = () => body.replaceChildren(
      h('p', { class: 'scold-kicker' }, 'Обязательное'),
      h('p', { class: 'muted' }, 'То, что ты делаешь КАЖДЫЙ день, без исключений. Время — по желанию: тогда пункт встанет в расписание.'),
      h('div', { class: 'musts-edit' }, list.map((m, i) => h('div', { class: 'add-row' },
        h('input', { type: 'text', value: m.t, oninput: (e) => { m.t = e.target.value; } }),
        h('input', { type: 'time', value: m.time || '', oninput: (e) => { m.time = e.target.value; } }),
        h('button', { class: 'x', title: 'Убрать', onclick: () => { list.splice(i, 1); render(); } }, '×')))),
      h('button', { class: 'btn-ghost', onclick: () => { list.push({ id: 'm' + Date.now(), t: 'Новое правило дня', dur: 30 }); render(); } }, '+ добавить пункт'),
      h('p', { class: 'muted' }, 'Идеи: 1 правило грамматики · 10 минут говорения по-английски · 20 страниц книги · без телефона после 23:00 · 2 литра воды.'),
      h('div', { class: 'scold-btns' },
        h('button', { class: 'btn', onclick: () => { store.set('musts:list', list.filter((m) => m.t.trim())); close(); document.dispatchEvent(new CustomEvent('events')); } }, 'Сохранить'),
        h('button', { class: 'btn-ghost', onclick: () => { list.splice(0, list.length, ...DEFAULT_MUSTS.map((m) => Object.assign({}, m))); render(); } }, 'Как было'),
        h('button', { class: 'btn-ghost', onclick: close }, 'Закрыть')));
    render();
    wrap.append(h('div', { class: 'scold sync-panel', role: 'dialog' }, body));
    document.body.append(wrap);
  }

  function quickAdd(day, after) {
    const t = h('input', { type: 'text', placeholder: 'Новый квест на ' + (day === iso() ? 'сегодня' : new Date(day + 'T12:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })) });
    const time = h('input', { type: 'time', title: 'Время (можно пусто)' });
    const dur = h('select', { title: 'Длительность' }, [[15, '15 мин'], [30, '30 мин'], [60, '1 ч'], [90, '1,5 ч'], [120, '2 ч'], [180, '3 ч']].map(([v, l]) => h('option', { value: v, selected: v === 60 }, l)));
    const add = () => { if (!t.value.trim()) return t.focus(); addEvent(day, t.value.trim(), time.value, dur.value); t.value = ''; after && after(); };
    t.addEventListener('keydown', (e) => e.key === 'Enter' && add());
    return h('div', { class: 'add-row add-event' }, t, time, dur, h('button', { class: 'btn', onclick: add }, '+'));
  }

  // Общая выбранная дата для календаря и расписания.
  const sel = { date: iso() };
  const selectDate = (d) => { sel.date = d; document.dispatchEvent(new CustomEvent('day-select')); };

  // Расписание дня по часам, как в календаре iPhone.
  X.dayview = (w) => {
    const HOUR = 46, FROM = 6, TO = 24;
    const head = h('div', { class: 'dv-head' });
    const untimed = h('div', { class: 'dv-untimed' });
    const grid = h('div', { class: 'dv-grid', style: 'height:' + (TO - FROM) * HOUR + 'px' });
    const scroller = h('div', { class: 'dv-scroll' }, grid);
    const addBox = h('div');
    const render = () => {
      const day = sel.date, isToday = day === iso();
      const dObj = new Date(day + 'T12:00');
      head.replaceChildren(...[
        h('button', { class: 'x', onclick: () => { dObj.setDate(dObj.getDate() - 1); selectDate(iso(dObj)); } }, '‹'),
        h('b', {}, (isToday ? 'Сегодня, ' : '') + dObj.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })),
        h('button', { class: 'x', onclick: () => { dObj.setDate(dObj.getDate() + 1); selectDate(iso(dObj)); } }, '›'),
        isToday ? null : h('button', { class: 'btn-ghost', onclick: () => selectDate(iso()) }, 'сегодня')].filter(Boolean));
      const items = todayItems(day);
      untimed.replaceChildren(...items.filter((i) => !i.time && !i.must).map((it) => h('span', { class: 'dv-chip' + (it.done ? ' done' : '') + (it.hot ? ' hot' : ''), onclick: () => { it.set(!it.done); render(); } }, (it.done ? '✓ ' : '') + it.t)));
      const rows = [];
      for (let hr = FROM; hr < TO; hr++) rows.push(h('div', { class: 'dv-hour', style: 'top:' + (hr - FROM) * HOUR + 'px' }, h('span', {}, String(hr).padStart(2, '0') + ':00')));
      (events()[day] || []).forEach((ev, i) => {
        if (!ev.time) return;
        const [hh, mm] = ev.time.split(':').map(Number);
        const top = Math.max(0, (hh - FROM) * HOUR + (mm / 60) * HOUR);
        const height = Math.max(24, (ev.dur / 60) * HOUR - 3);
        rows.push(h('div', { class: 'dv-event' + (ev.done ? ' done' : ''), style: `top:${top}px;height:${height}px` },
          h('label', {}, h('input', { type: 'checkbox', checked: ev.done, onchange: (e) => { const all = events(); all[day][i].done = e.target.checked; store.set('events', all); render(); } }),
            h('b', {}, ev.time), ' ', ev.t),
          h('button', { class: 'x', title: 'Удалить', onclick: () => removeEvent(day, i) }, '×')));
      });
      musts().forEach((m) => {
        if (!m.time) return;
        const [hh, mm] = m.time.split(':').map(Number);
        const top = Math.max(0, (hh - FROM) * HOUR + (mm / 60) * HOUR);
        const done = mustIsDone(m, day);
        rows.push(h('div', { class: 'dv-event must' + (done ? ' done' : ''), style: `top:${top}px;height:${Math.max(24, ((m.dur || 30) / 60) * HOUR - 3)}px` },
          h('label', {}, h('input', { type: 'checkbox', checked: done, onchange: (e) => { setMust(m.id, e.target.checked, day); render(); } }), h('b', {}, m.time), ' ♛ ' + m.t)));
      });
      if (isToday) {
        const now = new Date();
        const top = (now.getHours() - FROM) * HOUR + (now.getMinutes() / 60) * HOUR;
        if (top >= 0) rows.push(h('div', { class: 'dv-now', style: 'top:' + top + 'px' }));
      }
      grid.replaceChildren(...rows);
      addBox.replaceChildren(quickAdd(day, render));
    };
    render();
    ['events', 'day-select', 'activity'].forEach((ev) => document.addEventListener(ev, render));
    setTimeout(() => { const hr = Math.max(FROM, new Date().getHours() - 1); scroller.scrollTop = (hr - FROM) * HOUR; }, 50);
    setInterval(render, 60000);
    return card(w, head, untimed, scroller, addBox,
      h('p', { class: 'muted' }, 'Нажми на день в календаре — откроется его расписание. С временем — блоком на часах, без времени — сверху.'));
  };

  // Месячный календарь: дисциплина (сердечки/розы) + точки событий; нажми день, чтобы открыть.
  X.calendar = (w) => {
    let view = new Date();
    view.setDate(1);
    const head = h('div', { class: 'cal-head' });
    const grid = h('div', { class: 'cal' });
    const info = h('div', { class: 'cal-stats' });
    const render = () => {
      const a = D.activity(), s = D.stats(), today = iso(), ev = events(), kis = store.get('kisses', {});
      const y = view.getFullYear(), m = view.getMonth();
      head.replaceChildren(
        h('button', { class: 'x', onclick: () => { view.setMonth(m - 1); render(); } }, '‹'),
        h('b', {}, view.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })),
        h('button', { class: 'x', onclick: () => { view.setMonth(m + 1); render(); } }, '›'));
      const cells = DAYS.map((d) => h('span', { class: 'cal-dow' }, d));
      const lead = (new Date(y, m, 1).getDay() + 6) % 7;
      for (let i = 0; i < lead; i++) cells.push(h('span', {}));
      const len = new Date(y, m + 1, 0).getDate();
      let act = 0, miss = 0;
      for (let d = 1; d <= len; d++) {
        const day = iso(new Date(y, m, d, 12));
        const n = a[day] || 0, evs = (ev[day] || []).length;
        let cls = 'cal-day', mark = '';
        const kissed = !!kis[day];
        if (kissed) { cls += ' on lvl3 kissed'; mark = '💋'; act++; }
        else if (n) { cls += ' on lvl1'; mark = '♥'; act++; }
        else if (day < today && day >= s.started) { cls += ' missed'; mark = '🥀'; miss++; }
        if (day === today) cls += ' today';
        if (day === sel.date) cls += ' sel';
        cells.push(h('button', { class: cls, title: evs ? evs + ' ' + plural(evs, 'событие', 'события', 'событий') : '', onclick: () => selectDate(day) },
          h('i', {}, String(d)), h('em', {}, mark), evs ? h('small', { class: 'ev-dots' }, '•'.repeat(Math.min(evs, 3))) : null));
      }
      grid.replaceChildren(...cells);
      info.replaceChildren(
        h('span', {}, h('b', {}, '💋 ' + s.streak), ' подряд'),
        h('span', {}, h('b', {}, '★ ' + s.best), ' рекорд'),
        h('span', {}, h('b', {}, '💋 ' + Object.keys(kis).filter((k2) => k2.startsWith(view.toLocaleDateString('sv-SE').slice(0, 7))).length), ' поцелуев за месяц'),
        h('span', {}, h('b', {}, '🥀 ' + miss), ' пропусков'));
    };
    render();
    ['activity', 'events', 'day-select'].forEach((e) => document.addEventListener(e, render));
    return card(w, info, head, grid,
      h('p', { class: 'muted' }, 'Нажми на любой день, чтобы посмотреть или добавить событие. 💋 — выполнено всё, ♥ — что-то сделала, 🥀 — пропуск.'));
  };

  // Клубничный таймер.
  X.timer = (w) => {
    const box = h('div', { class: 'focus' });
    const what = h('input', { type: 'text', placeholder: 'Над чем работаю (необязательно)' });
    const render = () => {
      const r = run();
      const mins = minutesToday();
      box.replaceChildren(...[
        h('div', { class: 'clock', 'data-focus-clock': '' }, r ? '' : '40:00'),
        r ? h('p', { class: 'muted' }, (r.study ? 'Учёба' : 'Отдых') + (r.what ? ': ' + r.what : '') + ' · таймер идёт, даже если уйти на другую страницу') : what,
        r ? h('div', { class: 'timer-btns' },
          h('button', { class: 'btn', onclick: pauseFocus }, r.paused ? 'Дальше' : 'Пауза'),
          h('button', { class: 'btn-ghost', onclick: () => finishFocus(true) }, r.study ? 'Закончить и засчитать' : 'Хватит отдыхать'),
          h('button', { class: 'btn-ghost', onclick: () => { store.set('focus:run', null); document.dispatchEvent(new CustomEvent('focusrun')); } }, 'Сбросить'))
          : h('div', { class: 'modes' }, MODES.map((m) => h('button', { class: m.study ? 'btn' : 'btn-ghost', onclick: () => startFocus(m.id, what.value.trim()) }, m.label))),
        h('div', { class: 'berry-row' }, Array.from({ length: Math.max(8, berries() + 1) }, (_, i) => h('span', { class: i < berries() ? 'on' : '' }, '🍓'))),
        h('p', { class: 'today-stats' }, 'Сегодня: ' + fmtMin(mins) + ' · ' + berries() + ' 🍓 (одна клубничка = 40 минут учёбы)'),
        h('div', { class: 'tiers' }, TIERS.map((t) => h('span', { class: mins >= t.min ? 'on' : '' }, (mins >= t.min ? '✓ ' : '') + fmtMin(t.min)))),
        h('p', { class: 'muted' }, 'От 5 часов в день — в 23:00 большой приз от мальчиков на весь экран.'),
        null].filter(Boolean));
      tick();
    };
    render();
    document.addEventListener('focusrun', render);
    return card(w, box);
  };

  // ---------- «Что мне делать?» ----------
  const SPEAK = ['Расскажи по-английски, как прошёл твой день (2 минуты, без остановок).', 'Опиши по-английски свою комнату.', 'Объясни по-английски, зачем ты хочешь учиться за границей.', 'Перескажи по-английски последнюю серию или книгу.', 'Расскажи по-китайски о своей семье (家人).'];
  function suggestions() {
    const out = [];
    const today = iso();
    store.get('ddz:deadlines', []).filter((d) => !d.done && d.date <= iso(new Date(Date.now() + 2 * 864e5)))
      .forEach((d) => out.push({ t: 'Дедлайн ' + (d.date < today ? 'уже прошёл' : d.date === today ? 'сегодня' : 'скоро') + ': ' + d.t, why: 'Сначала то, что горит.', mode: 'focus40', w: 10 }));
    todayItems().filter((i) => !i.done && !i.hot).forEach((i) => out.push({ t: i.t, why: 'Это есть в твоём плане на сегодня.', mode: 'focus40', w: 6 }));
    const k = store.get('learned:hsk3', []).length;
    out.push(
      { t: 'Выучи 15 новых слов HSK в тренажёре (карточки, потом тест)', href: 'trainer.html?t=' + (k >= 450 ? 'hsk4' : 'hsk3'), why: 'Слова — фундамент HSK.', mode: 'focus40', w: 3 },
      { t: 'Разбери правило грамматики дня HSK и придумай 3 своих примера', href: 'grammar.html', why: 'Одно правило в день — 150 правил за полгода.', mode: 'focus40', w: 2 },
      { t: 'English: шаг дня на своём уровне (слова + грамматика + текст)', href: 'english.html', why: 'Путь A2 → C1 идёт маленькими шагами.', mode: 'focus40', w: 3 },
      { t: 'English: одна тема грамматики и упражнения из Мерфи', href: 'english.html#grammar', why: 'Синий Мерфи — твой лучший друг сейчас.', mode: 'focus40', w: 2 },
      { t: 'Пройди тест по неправильным глаголам до 10 правильных подряд', href: 'trainer.html?t=verbs', why: 'Без глаголов английский не поедет.', mode: 'focus40', w: 2 },
      { t: pick(SPEAK) + ' Запиши себя на диктофон.', href: 'english.html#speak', why: 'Говорить учатся, только говоря.', mode: 'rest10', w: 2 },
      { t: 'Большая клубника: 2 часа на самое трудное из ДЗ', href: 'section.html?s=ddz', why: 'Трудное лучше делать первым.', mode: 'focus120', w: 1 },
      { t: '20 страниц книги вместо телефона', href: 'section.html?s=reading', why: 'Мозг отдыхает и растёт.', mode: 'focus40', w: 1 }
    );
    return out;
  }
  function weighted(list) {
    const total = list.reduce((s, x) => s + x.w, 0);
    let r = Math.random() * total;
    return list.find((x) => (r -= x.w) < 0) || list[0];
  }
  function whatNow() {
    const wrap = h('div', { class: 'scold-wrap' });
    const body = h('div', { class: 'scold-body' });
    const show = () => {
      const s = weighted(suggestions());
      body.replaceChildren(
        h('p', { class: 'scold-kicker' }, 'Не знаешь, что делать?'),
        h('div', { class: 'scold-line' }, h('img', { class: 'portrait', src: 'assets/heroes/lelouch-smug.jpg', alt: '', onerror: function () { this.replaceWith(h('span', { class: 'portrait p-dark' })); } }),
          h('div', {}, h('b', {}, 'Лелуш'), h('p', {}, 'Я знаю. ' + s.why + ' Халтура не принимается.'))),
        h('div', { class: 'scold-pen' }, h('b', {}, 'Задание:'), h('p', { class: 'wn-task' }, s.t)),
        h('div', { class: 'scold-btns' },
          h('button', { class: 'btn', onclick: () => {
            startFocus(s.mode, s.t);
            const now = new Date();
            addEvent(iso(), s.t, String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'), MODES.find((m) => m.id === s.mode).min);
            close();
            if (s.href && !location.href.includes(s.href.split('#')[0])) setTimeout(() => { location.href = s.href; }, 500);
          } }, 'Беру! Запустить ' + (s.mode === 'focus120' ? '2 часа' : s.mode === 'rest10' ? '10 минут' : 'клубничку 40 мин')),
          h('button', { class: 'btn-ghost', onclick: show }, 'Другое задание'),
          h('button', { class: 'btn-ghost', onclick: close }, 'Закрыть')));
    };
    const close = () => { wrap.classList.add('out'); setTimeout(() => wrap.remove(), 350); };
    wrap.append(h('div', { class: 'scold', role: 'dialog' },
      h('div', { class: 'scold-figure clear' }, h('img', { src: 'assets/heroes/lelouch-cut-smug.png', alt: '', onerror: function () { this.parentNode.remove(); } })), body));
    show();
    document.body.append(wrap);
  }

  X.whatnow = (w) => card(w,
    h('p', { class: 'muted' }, 'Нажми, и Лелуш выдаст задание по твоим планам, дедлайнам и учёбе. Отказаться можно, халтурить — нет.'),
    h('button', { class: 'btn big', onclick: whatNow }, 'Что мне делать? ✦'));

  // ---------- SOS: «хочу залипнуть» ----------
  // Желание длится волной ~10 минут: пережди её, замени заданием или честно потрать заработанный отдых.
  const URGES = [
    { id: 'drama', label: 'Дорама', icon: '📺', who: 'kassian', text: 'Дорама подождёт. Она никуда не денется, а вот твой C1 сам не появится.' },
    { id: 'manhwa', label: 'Манхва', icon: '📖', who: 'elian', text: 'Опять манхва? Давай так: сначала одна клубничка, потом поговорим.' },
    { id: 'genshin', label: 'Genshin', icon: '🎮', who: 'kassian', text: 'Примогемы не дадут тебе стипендию. А 40 минут учёбы — дадут 15 минут игры честно.' },
    { id: 'social', label: 'TikTok / соцсети', icon: '📱', who: 'elian', text: 'Лента бесконечная, а вечер — нет. Отложи телефон экраном вниз.' },
    { id: 'other', label: 'Что-то другое', icon: '✦', who: 'tigra', text: 'Мяу. (Перевод: сначала дело, потом развлечения. Даже коты это знают.)' }
  ];
  const SWAPS = ['Выпей стакан воды', 'Встань и пройдись по комнате 2 минуты', 'Погладь Мяфку или Оливку', 'Сделай 10 приседаний', 'Выучи 5 слов HSK', 'Открой окно и подыши', 'Запиши в «Мысли», почему захотелось'];
  const FUN_PER_BERRY = 15;
  const funLeft = () => berries() * FUN_PER_BERRY - store.get('fun:spent:' + iso(), 0);

  function urge() {
    const wrap = h('div', { class: 'scold-wrap' });
    const body = h('div', { class: 'scold-body' });
    const close = () => { clearInterval(iv); wrap.classList.add('out'); setTimeout(() => wrap.remove(), 350); };
    let iv = null;
    const stats = () => h('p', { class: 'muted' }, 'Побед над залипанием: ' + store.get('urge:wins', 0) + ' · сдалась: ' + store.get('urge:fails', 0) + ' · честного отдыха сегодня: ' + Math.max(0, funLeft()) + ' мин');

    const choose = () => body.replaceChildren(
      h('p', { class: 'scold-kicker' }, 'Тянет залипнуть?'),
      h('p', {}, 'Это нормально. Желание приходит волной и проходит минут за 10. Что тянет?'),
      h('div', { class: 'urge-grid' }, URGES.map((u) => h('button', { class: 'trainer-btn', onclick: () => step(u) }, h('b', {}, u.icon + ' ' + u.label)))),
      stats(),
      h('div', { class: 'scold-btns' }, h('button', { class: 'btn-ghost', onclick: close }, 'Уже прошло')));

    const step = (u) => {
      const left = funLeft();
      body.replaceChildren(
        h('div', { class: 'scold-line' }, h('img', { class: 'portrait', src: 'assets/heroes/' + ({ kassian: 'lelouch', elian: 'joshua', tigra: 'myafka' })[u.who] + '-smug.jpg', alt: '', onerror: function () { this.replaceWith(h('span', { class: 'portrait p-dark' })); } }),
          h('div', {}, h('b', {}, ({ kassian: 'Лелуш', elian: 'Джошуа', tigra: 'Мяфка' })[u.who]), h('p', {}, u.text))),
        h('div', { class: 'scold-pen' }, h('b', {}, 'Выбери, что делаешь:'),
          h('ul', { class: 'frames' },
            h('li', {}, h('b', {}, 'Пережить волну'), ' — 10 минут дыхания и замен. Это победа.'),
            h('li', {}, h('b', {}, 'Заменить делом'), ' — Лелуш даст задание, и клубничка начнётся сразу.'),
            h('li', {}, h('b', {}, 'Честный отдых'), ' — у тебя ' + Math.max(0, left) + ' мин (каждая 🍓 = ' + FUN_PER_BERRY + ' мин развлечений).'))),
        h('div', { class: 'scold-btns' },
          h('button', { class: 'btn', onclick: () => wave(u) }, 'Пережить волну'),
          h('button', { class: 'btn-ghost', onclick: () => { close(); whatNow(); } }, 'Заменить делом'),
          h('button', { class: 'btn-ghost', onclick: () => honest(u) }, 'Честный отдых')));
    };

    const wave = (u) => {
      let sec = 600;
      const clock = h('div', { class: 'clock small' }, '10:00');
      const swap = h('p', { class: 'wn-task' }, pick(SWAPS));
      body.replaceChildren(
        h('p', { class: 'scold-kicker' }, 'Волна пройдёт'),
        h('div', { class: 'breath-ball' }, h('span', {}, 'вдох')),
        clock,
        h('p', { class: 'muted' }, 'Дыши вместе с кругом. Пока ждёшь — сделай что-нибудь маленькое:'),
        swap,
        h('div', { class: 'scold-btns' },
          h('button', { class: 'btn-ghost', onclick: () => { swap.textContent = pick(SWAPS); } }, 'Другое'),
          h('button', { class: 'btn', onclick: () => win(u) }, 'Желание прошло ✓')));
      const ball = body.querySelector('.breath-ball span');
      iv = setInterval(() => {
        sec--;
        clock.textContent = Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
        ball.textContent = ['вдох', 'держи', 'выдох', 'держи'][Math.floor((600 - sec) / 4) % 4];
        if (sec <= 0) win(u);
      }, 1000);
    };

    const win = () => {
      clearInterval(iv);
      store.set('urge:wins', store.get('urge:wins', 0) + 1);
      window.fx && fx.celebrate();
      close();
      D.toast(['elian', 'Ты победила желание. Это сильнее, чем кажется. Горжусь тобой 💋'], 8000, 'sweet');
    };

    const honest = (u) => {
      const left = funLeft();
      if (left >= 15) {
        const mins = Math.min(left, 30);
        body.replaceChildren(
          h('p', { class: 'scold-kicker' }, 'Заслужила'),
          h('p', {}, 'У тебя ' + left + ' мин честного отдыха. Бери ' + mins + ' минут на «' + u.label + '» без чувства вины — таймер напомнит вернуться.'),
          h('div', { class: 'scold-btns' }, h('button', { class: 'btn', onclick: () => {
            store.set('fun:spent:' + iso(), store.get('fun:spent:' + iso(), 0) + mins);
            store.set('focus:run', { mode: 'fun', min: mins, study: false, end: Date.now() + mins * 60000, started: Date.now(), what: u.label });
            document.dispatchEvent(new CustomEvent('focusrun'));
            close();
          } }, 'Отдыхаю ' + mins + ' мин'), h('button', { class: 'btn-ghost', onclick: close }, 'Передумала, учусь')));
      } else {
        const input = h('input', { type: 'text', class: 'search', placeholder: 'я выбираю ' + u.label.toLowerCase() + ' вместо мечты' });
        body.replaceChildren(
          h('p', { class: 'scold-kicker' }, 'Отдых не заработан'),
          h('p', {}, 'Сегодня ' + berries() + ' 🍓 — это ' + Math.max(0, left) + ' мин отдыха. Нужна ещё ' + Math.ceil((15 - Math.max(0, left)) / FUN_PER_BERRY) + ' клубничка.'),
          h('p', { class: 'muted' }, 'Если всё равно хочешь — напиши честно: «я выбираю ' + u.label.toLowerCase() + ' вместо мечты». Мальчики это запомнят.'),
          input,
          h('div', { class: 'scold-btns' },
            h('button', { class: 'btn', onclick: () => { close(); startFocus('focus40', 'заработать отдых'); } }, 'Ладно, сначала клубничка'),
            h('button', { class: 'btn-ghost', onclick: () => {
              if (input.value.trim().toLowerCase().replace(/ё/g, 'е') !== ('я выбираю ' + u.label.toLowerCase() + ' вместо мечты').replace(/ё/g, 'е')) { input.classList.add('shake'); setTimeout(() => input.classList.remove('shake'), 500); return; }
              store.set('urge:fails', store.get('urge:fails', 0) + 1);
              close();
              D.toast(['kassian', 'Твой выбор. Но завтра я спрошу, стоило ли оно того.'], 9000, 'angry');
            } }, 'Всё равно иду')));
      }
    };

    choose();
    wrap.append(h('div', { class: 'scold', role: 'dialog' },
      h('div', { class: 'scold-figure clear' }, h('img', { src: 'assets/heroes/joshua-cut-smug.png', alt: '', onerror: function () { this.parentNode.remove(); } })), body));
    document.body.append(wrap);
  }

  X.urge = (w) => card(w,
    h('p', { class: 'muted' }, 'Резко захотелось дораму, манхву, Genshin или ленту? Жми — помогут пережить волну или честно обменять клубнички на отдых.'),
    h('button', { class: 'btn big sos', onclick: urge }, 'SOS: хочу залипнуть'),
    h('p', { class: 'today-stats' }, 'Побед: ' + store.get('urge:wins', 0) + ' · честный отдых сегодня: ' + Math.max(0, funLeft()) + ' мин'));

  // =========================================================
  // Наблюдение: герои следят за днём и ругают за невыполненные дни
  // =========================================================
  const addDays = (day, n) => { const d = new Date(day + 'T12:00'); d.setDate(d.getDate() + n); return iso(d); };
  // Сколько дней подряд до сегодня закончились без поцелуя (не всё сделано).
  function failedDays() {
    const k = store.get('kisses', {}), started = store.get('started', iso());
    let n = 0, d = addDays(iso(), -1);
    while (d >= started && !k[d] && n < 60) { n++; d = addDays(d, -1); }
    return n;
  }

  function scoldUnfinished(n) {
    const yest = addDays(iso(), -1);
    const left = todayItems(yest).filter((i) => !i.done);
    const L = n >= 4 ? 'severe' : n >= 2 ? 'medium' : 'mild';
    const lines = {
      mild: [['kassian', 'Вчера ты не доделала день. Я всё видел: ' + left.length + ' ' + plural(left.length, 'пункт остался', 'пункта остались', 'пунктов остались') + '.'],
        ['elian', 'Без поцелуя вчера, Дарьюшка. Сегодня исправим?']],
      medium: [['kassian', n + ' ' + plural(n, 'день', 'дня', 'дней') + ' подряд без выполненного плана. Это уже не случайность, это привычка.'],
        ['elian', 'Я ждал вчера вечером. И позавчера. Поцелуи сами себя не заработают.']],
      severe: [['kassian', n + ' ' + plural(n, 'день', 'дней', 'дней') + ' без выполненного дня. «Уехать учиться за границу» — пока только красивая фраза. Докажи, что нет.'],
        ['tigra', 'Мяфка смотрит на тебя долгим взглядом и уходит спать на учебник. Демонстративно.']]
    }[L];
    const pens = D.PENALTIES.slice().sort(() => Math.random() - 0.5).slice(0, Math.min(3, n));
    const wrap = h('div', { class: 'scold-wrap' });
    const close = () => { wrap.classList.add('out'); setTimeout(() => wrap.remove(), 350); };
    const body = h('div', { class: 'scold-body' },
      h('p', { class: 'scold-kicker' }, n === 1 ? 'Вчера — без поцелуя' : n + ' ' + plural(n, 'день', 'дня', 'дней') + ' без поцелуя'),
      ...lines.map(([w, t]) => { const row = h('div', { class: 'scold-line' }); row.innerHTML = D.portrait(w, 'angry'); row.append(h('div', {}, h('b', {}, D.WHO[w].name), h('p', {}, t))); return row; }),
      left.length ? h('div', { class: 'scold-pen' }, h('b', {}, 'Не сделано вчера:'), h('ul', {}, left.slice(0, 8).map((i) => h('li', {}, '✗ ' + i.t.replace(/ · \d+\/\d+$/, ''))))) : null,
      h('div', { class: 'scold-pen' }, h('b', {}, 'Наказание на сегодня:'), h('ul', {}, pens.map((p) => h('li', {}, '⚔ ' + p)))),
      h('div', { class: 'scold-btns' },
        h('button', { class: 'btn', onclick: () => {
          const today = iso();
          left.filter((i) => !i.must).forEach((i) => addEvent(today, i.t, i.time || '', i.dur || 60));
          pens.forEach((p) => addEvent(today, '⚔ ' + p, '', 40));
          close();
          setTimeout(() => D.toast(['kassian', 'Хорошо. Хвосты и наказание — в плане на сегодня. Вечером проверю.'], 8000, 'smug'), 400);
        } }, 'Перенести хвосты и наказание на сегодня'),
        h('button', { class: 'btn-ghost', onclick: () => {
          store.set('scold:ignored:' + iso(), true);
          close();
          setTimeout(() => D.toast(['elian', 'Игнорировать меня — плохая идея. Я напомню снова через час.'], 8000, 'angry'), 400);
        } }, 'Потом')));
    const fig = h('div', {});
    fig.innerHTML = D.figure(lines[0][0]);
    wrap.append(h('div', { class: 'scold', role: 'dialog' }, fig.firstChild || '', body));
    document.body.append(wrap);
  }

  // Плавающий наблюдатель на каждой странице.
  const NAG = [
    { h: 10, who: 'elian', text: (n) => 'Доброе утро. Обязательного осталось ' + n + '. Начни с самого трудного.' },
    { h: 14, who: 'kassian', text: (n) => 'Уже середина дня, а обязательного ещё ' + n + '. Я считаю.' },
    { h: 18, who: 'kassian', text: (n) => 'Вечер близко. ' + n + ' ' + plural(n, 'пункт', 'пункта', 'пунктов') + ' не сделано. Поцелуй уходит.' },
    { h: 21, who: 'elian', text: (n) => 'Последний шанс на поцелуй сегодня: осталось ' + n + '. Давай, умница.' },
    { h: 23, who: 'kassian', text: (n) => 'День почти закрыт, а ' + n + ' ' + plural(n, 'пункт висит', 'пункта висят', 'пунктов висят') + '. Завтра поговорим.' }
  ];
  let watcherEl = null;
  function watcherState() {
    const items = todayItems();
    const musts_ = items.filter((i) => i.must), left = items.filter((i) => !i.done);
    const mLeft = musts_.filter((i) => !i.done).length;
    const hr = new Date().getHours();
    const kissed = !!store.get('kisses', {})[iso()];
    let who = 'elian', mood = 'sweet', text;
    if (kissed) text = 'Всё сделано. Поцелуй твой 💋';
    else if (!items.length) { who = 'kassian'; mood = 'smug'; text = 'План на сегодня пуст. Добавь задачи.'; }
    else if (hr >= 18 && mLeft) { who = 'kassian'; mood = 'angry'; text = 'Обязательного осталось ' + mLeft + '. Я жду.'; }
    else if (mLeft) { who = 'kassian'; mood = 'smug'; text = 'Обязательное: ' + (musts_.length - mLeft) + '/' + musts_.length + ' · всё: ' + (items.length - left.length) + '/' + items.length; }
    else { text = 'Обязательное сделано! Ещё дел: ' + left.length; }
    return { who, mood, text, items, left, mLeft };
  }
  function renderWatcher() {
    const st = watcherState();
    if (!watcherEl) {
      watcherEl = h('button', { class: 'watcher', onclick: openWatch, 'aria-label': 'Мой день: что осталось' });
      document.body.append(watcherEl);
    }
    watcherEl.className = 'watcher mood-' + st.mood;
    watcherEl.innerHTML = D.portrait(st.who, st.mood);
    watcherEl.append(h('span', { class: 'watcher-bubble' }, st.text));
  }
  function openWatch() {
    const wrap = h('div', { class: 'scold-wrap' });
    const close = () => { wrap.classList.add('out'); setTimeout(() => wrap.remove(), 350); renderWatcher(); };
    const body = h('div', { class: 'scold-body' });
    const render = () => {
      const st = watcherState();
      const row = (it) => h('li', { class: it.done ? 'done' : '' }, h('label', {}, h('input', { type: 'checkbox', checked: it.done, onchange: (e) => { it.set(e.target.checked); setTimeout(render, 50); } }), h('span', {}, it.t)), h('span', { class: 'tag' }, it.tag));
      const line = h('div', { class: 'scold-line' });
      line.innerHTML = D.portrait(st.who, st.mood);
      line.append(h('div', {}, h('b', {}, D.WHO[st.who].name), h('p', {}, st.text)));
      body.replaceChildren(
        h('p', { class: 'scold-kicker' }, greeting().line),
        line,
        h('p', { class: 'q-kicker' }, '＋ Добавить задачу на сегодня'),
        quickAdd(iso(), render),
        h('p', { class: 'q-kicker' }, '♛ Обязательное'),
        h('ul', { class: 'quests' }, st.items.filter((i) => i.must).map(row)),
        st.items.some((i) => !i.must) ? h('p', { class: 'q-kicker' }, '✦ Дела на сегодня') : null,
        h('ul', { class: 'quests' }, st.items.filter((i) => !i.must).map(row)),
        h('div', { class: 'scold-btns' },
          h('a', { class: 'btn', href: 'section.html?s=plan' }, 'Открыть мой день'),
          h('button', { class: 'btn-ghost', onclick: () => { close(); whatNow(); } }, 'Что мне делать?'),
          h('button', { class: 'btn-ghost', onclick: () => { close(); urge(); } }, 'SOS: залипаю'),
          h('button', { class: 'btn-ghost', onclick: close }, 'Закрыть')));
      const inp = body.querySelector('.add-event input[type=text]');
      if (inp) setTimeout(() => inp.focus(), 50);
    };
    render();
    wrap.append(h('div', { class: 'scold sync-panel watch-panel', role: 'dialog' }, body));
    wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
    document.body.append(wrap);
  }
  function nagCheck() {
    const st = watcherState();
    const hr = new Date().getHours();
    const n = NAG.filter((x) => hr >= x.h).pop();
    if (!n || !st.mLeft || store.get('kisses', {})[iso()]) return;
    const key = 'nag:' + iso() + ':' + n.h;
    if (store.get(key, false)) return;
    D.rawSet(key, true);
    D.toast([n.who, n.text(st.mLeft)], 12000, n.h >= 18 ? 'angry' : 'smug');
  }
  function scoldCheck() {
    const n = failedDays();
    const today = iso();
    if (!n || store.get('kisses', {})[today]) return;
    const shown = store.get('scold:shown:' + today, 0);
    const ignored = store.get('scold:ignored:' + today, false);
    // Показываем при первом открытии за день; если нажала «Потом» — снова через час.
    if (!shown || (ignored && Date.now() - shown > 3600000)) {
      D.rawSet('scold:shown:' + today, Date.now());
      D.rawSet('scold:ignored:' + today, false);
      scoldUnfinished(n);
    }
  }

  window.WIDGETS_EXTRA = X;
  window.day = { greeting, todayItems, editMusts, checkKiss, openWatch, failedDays, whatNow, urge, grandPrize, startFocus, addEvent, fmtMin, minutesToday, berries };

  // ---------- При загрузке любой страницы ----------
  function onLoad() {
    let kt = null;
    document.addEventListener('store-change', (e) => { if (e.detail === 'kisses') return; clearTimeout(kt); kt = setTimeout(checkKiss, 300); });
    setTimeout(checkKiss, 1200);
    setTimeout(() => { renderWatcher(); scoldCheck(); setTimeout(nagCheck, 4000); }, 900);
    ['activity', 'events', 'store-change'].forEach((ev) => document.addEventListener(ev, () => { clearTimeout(window.__wt); window.__wt = setTimeout(renderWatcher, 400); }));
    setInterval(() => { renderWatcher(); nagCheck(); scoldCheck(); }, 60000);
    tick();
    setInterval(tick, 1000);
    document.addEventListener('focusrun', tick);
    // Приз: в 23:00 и позже, если набрано 5 часов, один раз за день.
    const checkPrize = () => {
      const hr = new Date().getHours();
      if (!(hr >= 23 || hr < 4)) return;
      const day = hr < 4 ? iso(new Date(Date.now() - 864e5)) : iso();
      if (minutesToday(day) >= 300 && !store.get('prize:' + day, false)) grandPrize();
    };
    setTimeout(checkPrize, 2500);
    setInterval(checkPrize, 60000);
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', onLoad) : onLoad();
})();
