// Виджеты разворота. Каждый получает (описание, id раздела) и возвращает карточку.
(function () {
  const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

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

  function card(w, ...body) {
    return h('section', { class: 'card card-' + w.type }, h('h3', {}, w.title), ...body);
  }

  // Строка «поле + кнопка», общая для всех списков.
  function addRow(placeholder, onAdd, extra) {
    const input = h('input', { type: 'text', placeholder });
    const submit = () => {
      const v = input.value.trim();
      if (!v) return;
      onAdd(v, extra && extra.value);
      input.value = '';
      input.focus();
    };
    input.addEventListener('keydown', (e) => e.key === 'Enter' && submit());
    return h('div', { class: 'add-row' }, input, extra || null, h('button', { class: 'btn', onclick: submit }, '+'));
  }

  function fmtDate(iso) {
    return new Date(iso + 'T00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  }

  function todayISO(offset) {
    const d = new Date();
    d.setDate(d.getDate() + (offset || 0));
    return d.toLocaleDateString('sv-SE');
  }

  function linkItem(item, onRemove) {
    return h('li', {},
      h('a', { href: item.href, target: '_blank', rel: 'noopener' },
        h('span', { class: 'link-label' }, item.label),
        item.note ? h('span', { class: 'link-note' }, item.note) : null),
      onRemove ? h('button', { class: 'x', title: 'Убрать', onclick: onRemove }, '×') : null);
  }

  const W = {};

  W.links = (w, sid) => {
    const key = sid + ':links:' + w.title;
    const list = h('ul', { class: 'links' });
    const render = () => {
      const s = store.get(key, { added: [], hidden: [] });
      list.replaceChildren(
        ...w.items.filter((i) => !s.hidden.includes(i.href)).map((i) => linkItem(i, () => { s.hidden.push(i.href); store.set(key, s); render(); })),
        ...s.added.map((i, n) => linkItem(i, () => { s.added.splice(n, 1); store.set(key, s); render(); }))
      );
    };
    render();
    const url = h('input', { type: 'url', placeholder: 'https://…' });
    const row = addRow('Название', (label, href) => {
      if (!href) return;
      if (!/^https?:\/\//.test(href)) href = 'https://' + href;
      const s = store.get(key, { added: [], hidden: [] });
      s.added.push({ label, href });
      store.set(key, s);
      url.value = '';
      render();
    }, url);
    row.hidden = true;
    const toggle = h('button', { class: 'btn-ghost', onclick: () => { row.hidden = !row.hidden; } }, '+ ссылка');
    return card(w, list, row, toggle);
  };

  // Учебники лежат только в папке на компьютере. В онлайн-версии их не видно,
  // зато на эту полку можно добавить ссылки на те же файлы в облаке.
  const ONLINE = /^https?:$/.test(location.protocol) && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  W.files = (w, sid) => {
    const el = W.links(Object.assign({}, w, { items: ONLINE ? [] : w.items }), sid);
    el.querySelector('ul').classList.add('files');
    if (ONLINE) {
      el.querySelector('ul').before(h('p', { class: 'muted' },
        'Файлы учебников открываются в версии на компьютере. Здесь загрузи их в Google Диск или iCloud и добавь ссылки кнопкой «+ ссылка».'));
    }
    return el;
  };

  W.trainer = (w) => card(w, h('div', { class: 'trainers' }, w.items.map((i) =>
    h('a', { class: 'trainer-btn', href: i.href }, h('b', {}, i.label), h('span', {}, i.note)))));

  W.tip = (w) => card(w, h('p', { class: 'tip' }, w.text));

  W.notes = (w, sid) => {
    const key = sid + ':notes:' + w.title;
    const ta = h('textarea', { placeholder: 'Пиши сюда, всё сохраняется само…', rows: 6 });
    ta.value = store.get(key, '');
    let t;
    ta.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => store.set(key, ta.value), 300); });
    return card(w, ta);
  };

  function bar(value, max) {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    return h('div', { class: 'bar' }, h('i', { style: 'width:' + pct + '%' }));
  }

  W.progress = (w, sid) => {
    const key = sid + ':progress';
    const box = h('div', { class: 'progress' });
    const render = () => {
      const s = store.get(key, {});
      const rows = w.items.map((it) => {
        const v = s[it.label] || 0;
        const set = (nv) => { s[it.label] = Math.max(0, Math.min(it.max, +nv.toFixed(1))); store.set(key, s); render(); };
        return h('div', { class: 'prog-row' },
          h('div', { class: 'prog-head' }, h('span', {}, it.label),
            h('span', { class: 'stepper' },
              h('button', { onclick: () => set(v - it.step) }, '−'),
              h('b', {}, String(v)), h('small', {}, '/' + it.max),
              h('button', { onclick: () => set(v + it.step) }, '+'))),
          bar(v, it.max));
      });
      const autos = (w.auto || []).map((a) => {
        const v = store.get(a.from, []).length;
        return h('div', { class: 'prog-row' },
          h('div', { class: 'prog-head' }, h('span', {}, a.label), h('span', { class: 'stepper' }, h('b', {}, String(v)), h('small', {}, '/' + a.max))),
          bar(v, a.max));
      });
      box.replaceChildren(...autos, ...rows);
    };
    render();
    return card(w, box);
  };

  W.units = (w, sid) => {
    const key = sid + ':' + (w.key || 'units');
    const grid = h('div', { class: 'units' });
    const count = h('span', { class: 'count' });
    const render = () => {
      const done = store.get(key, []);
      count.textContent = done.length + ' из ' + w.count;
      grid.replaceChildren(...Array.from({ length: w.count }, (_, i) => i + 1).map((n) =>
        h('button', { class: done.includes(n) ? 'on' : '', onclick: () => {
          const d = store.get(key, []);
          const at = d.indexOf(n);
          at >= 0 ? d.splice(at, 1) : d.push(n);
          store.set(key, d);
          render();
        } }, String(n))));
    };
    render();
    const el = card(w, count, grid);
    el.classList.add('collapsible');
    el.querySelector('h3').addEventListener('click', () => el.classList.toggle('open'));
    return el;
  };

  function taskList(getItems, saveItems, opts) {
    const ul = h('ul', { class: 'tasks' });
    const render = () => {
      const items = getItems();
      ul.replaceChildren(...items.map((it, n) => h('li', { class: it.done ? 'done' : '' },
        h('label', {}, h('input', { type: 'checkbox', checked: it.done, onchange: () => { items[n].done = !items[n].done; saveItems(items); render(); } }),
          h('span', {}, it.t)),
        opts && opts.badge ? opts.badge(it) : null,
        h('button', { class: 'x', onclick: () => { items.splice(n, 1); saveItems(items); render(); } }, '×'))));
    };
    render();
    return { ul, render };
  }

  W.planner = (w, sid) => {
    const key = sid + ':planner:' + store.weekKey();
    const load = () => store.get(key, DAYS.map(() => []));
    let day = store.todayIndex();
    const tabs = h('div', { class: 'day-tabs' });
    const holder = h('div');
    const render = () => {
      const all = load();
      tabs.replaceChildren(...DAYS.map((d, i) => h('button', {
        class: (i === day ? 'on ' : '') + (i === store.todayIndex() ? 'today' : ''),
        onclick: () => { day = i; render(); }
      }, d, all[i].length ? h('sup', {}, String(all[i].filter((x) => !x.done).length || '✓')) : null)));
      const list = taskList(() => load()[day], (items) => { const a = load(); a[day] = items; store.set(key, a); renderTabs(); });
      holder.replaceChildren(list.ul, addRow('Задача на ' + DAYS[day], (t) => { const a = load(); a[day].push({ t, done: false }); store.set(key, a); render(); }));
    };
    const renderTabs = () => render();
    render();
    return card(w, tabs, holder);
  };

  W.tomorrow = (w) => {
    const key = 'plan:tomorrow';
    const dateEl = h('p', { class: 'muted' });
    const load = () => store.get(key, { for: todayISO(1), items: [] });
    const save = (items) => store.set(key, Object.assign(load(), { items }));
    const list = taskList(() => load().items, save);
    const head = () => {
      const s = load();
      const label = s.for === todayISO() ? 'на сегодня (составлен вчера)' : s.for < todayISO() ? 'старый план от ' + fmtDate(s.for) : 'на ' + fmtDate(s.for);
      dateEl.textContent = 'План ' + label;
    };
    head();
    const fresh = h('button', { class: 'btn-ghost', onclick: () => {
      const left = load().items.filter((i) => !i.done);
      store.set(key, { for: todayISO(1), items: left });
      head(); list.render();
    } }, 'Новый план на завтра (невыполненное переносится)');
    return card(w, dateEl, list.ul, addRow('Что сделать завтра', (t) => { const s = load(); s.items.push({ t, done: false }); store.set(key, s); list.render(); }), fresh);
  };

  W.allweek = (w) => {
    const week = store.weekKey();
    const today = store.todayIndex();
    const box = h('div', { class: 'allweek' });
    const order = [0, 1, 2, 3, 4, 5, 6].map((i) => (today + i) % 7);
    order.forEach((d) => {
      const rows = [];
      window.SECTIONS.forEach((s) => {
        store.get(s.id + ':planner:' + week, DAYS.map(() => []))[d].forEach((it) => rows.push(h('li', { class: it.done ? 'done' : '' }, h('span', { class: 'tag' }, s.title), it.t)));
      });
      store.get('ddz:deadlines', []).forEach((it) => {
        const dt = new Date(it.date + 'T00:00');
        if (store.weekKey(dt) === week && (dt.getDay() + 6) % 7 === d) rows.push(h('li', { class: it.done ? 'done' : 'deadline' }, h('span', { class: 'tag' }, 'дедлайн'), it.t));
      });
      box.append(h('div', { class: 'aw-day' + (d === today ? ' today' : '') },
        h('h4', {}, d === today ? DAYS[d] + ' · сегодня' : DAYS[d]),
        rows.length ? h('ul', {}, rows) : h('p', { class: 'muted' }, 'пусто')));
    });
    return card(w, h('p', { class: 'muted' }, 'Задачи из планеров всех лепестков. Добавлять их можно в самих разделах.'), box);
  };

  W.deadlines = (w, sid) => {
    const key = sid + ':deadlines';
    const date = h('input', { type: 'date', value: todayISO(1) });
    const list = taskList(
      () => store.get(key, []).sort((a, b) => a.date.localeCompare(b.date)),
      (items) => store.set(key, items),
      { badge: (it) => {
        const days = Math.round((new Date(it.date + 'T00:00') - new Date(todayISO() + 'T00:00')) / 864e5);
        const cls = it.done ? '' : days < 0 ? 'late' : days <= 2 ? 'soon' : '';
        const txt = days === 0 ? 'сегодня' : days === 1 ? 'завтра' : days < 0 ? 'просрочено' : fmtDate(it.date);
        return h('span', { class: 'due ' + cls }, txt);
      } });
    return card(w, list.ul, addRow('Предмет: задание', (t, d) => {
      const items = store.get(key, []);
      items.push({ t, date: d || todayISO(1), done: false });
      store.set(key, items);
      list.render();
    }, date));
  };

  W.checklist = (w, sid) => {
    const key = sid + ':check:' + w.title;
    const ul = h('ul', { class: 'tasks' });
    const count = h('span', { class: 'count' });
    const render = () => {
      const on = store.get(key, []);
      count.textContent = on.length + ' из ' + w.items.length;
      ul.replaceChildren(...w.items.map((t) => h('li', { class: on.includes(t) ? 'done' : '' }, h('label', {},
        h('input', { type: 'checkbox', checked: on.includes(t), onchange: () => {
          const s = store.get(key, []);
          const i = s.indexOf(t);
          i >= 0 ? s.splice(i, 1) : s.push(t);
          store.set(key, s);
          render();
        } }), h('span', {}, t)))));
    };
    render();
    return card(w, count, ul);
  };

  W.board = (w, sid) => {
    const key = sid + ':board:' + w.key;
    const cols = h('div', { class: 'board' });
    const render = () => {
      const items = store.get(key, []);
      const save = () => { store.set(key, items); render(); };
      cols.replaceChildren(...w.columns.map((c, ci) => h('div', { class: 'col' },
        h('h4', {}, c, h('small', {}, ' ' + items.filter((i) => i.col === ci).length)),
        ...items.map((it, n) => it.col !== ci ? null : h('div', { class: 'chip' },
          h('span', {}, it.t),
          h('span', { class: 'chip-btns' },
            ci > 0 ? h('button', { title: 'Назад', onclick: () => { it.col--; save(); } }, '‹') : null,
            ci < w.columns.length - 1 ? h('button', { title: 'Дальше', onclick: () => { it.col++; save(); } }, '›') : null,
            h('button', { title: 'Удалить', onclick: () => { items.splice(n, 1); save(); } }, '×')))))));
    };
    render();
    W.board.add = W.board.add || {};
    W.board.add[key] = (t) => { const items = store.get(key, []); items.push({ t, col: 0 }); store.set(key, items); render(); };
    return card(w, addRow(w.placeholder, W.board.add[key]), cols);
  };

  // Таймер, общий для фокуса и для «намеренного» входа в интернет.
  function beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.35, 0.7].forEach((t) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0.2, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.3);
        o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.3);
      });
    } catch (e) {}
  }

  function countdown(display, onEnd) {
    let end = 0, left = 0, iv = null;
    const show = () => {
      const s = Math.max(0, Math.round(left / 1000));
      display.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    };
    const tick = () => {
      left = end - Date.now();
      show();
      if (left <= 0) { clearInterval(iv); iv = null; beep(); onEnd && onEnd(); }
    };
    return {
      start(ms) { if (ms) left = ms; end = Date.now() + left; clearInterval(iv); iv = setInterval(tick, 250); tick(); },
      pause() { clearInterval(iv); iv = null; },
      set(ms) { this.pause(); left = ms; show(); },
      get running() { return !!iv; }
    };
  }

  W.timer = (w) => {
    const display = h('div', { class: 'clock' }, '25:00');
    const doneKey = 'plan:pomos:' + todayISO();
    const doneEl = h('p', { class: 'muted' });
    const showDone = () => { doneEl.textContent = 'Помидорок сегодня: ' + store.get(doneKey, 0) + ' 🍅'; };
    let mode = 25;
    const t = countdown(display, () => {
      if (mode >= 25) store.set(doneKey, store.get(doneKey, 0) + 1);
      showDone();
      startBtn.textContent = 'Старт';
      document.title = 'Время вышло!';
    });
    t.set(25 * 60000);
    showDone();
    const startBtn = h('button', { class: 'btn', onclick: () => {
      if (t.running) { t.pause(); startBtn.textContent = 'Дальше'; } else { t.start(); startBtn.textContent = 'Пауза'; }
    } }, 'Старт');
    const modes = h('div', { class: 'modes' }, [[25, 'Фокус 25'], [50, 'Глубоко 50'], [5, 'Отдых 5']].map(([m, l]) =>
      h('button', { class: 'btn-ghost', onclick: () => { mode = m; t.set(m * 60000); startBtn.textContent = 'Старт'; } }, l)));
    return card(w, display, h('div', { class: 'timer-btns' }, startBtn), modes, doneEl);
  };

  W.habits = (w) => {
    const key = 'plan:habits:' + store.weekKey();
    const table = h('table', { class: 'habits' });
    const render = () => {
      const s = store.get(key, {});
      table.replaceChildren(
        h('tr', {}, h('th', {}, ''), DAYS.map((d, i) => h('th', { class: i === store.todayIndex() ? 'today' : '' }, d))),
        ...w.items.map((hb) => h('tr', {}, h('td', {}, hb), DAYS.map((_, i) => {
          const on = (s[hb] || []).includes(i);
          return h('td', {}, h('button', { class: 'dot' + (on ? ' on' : ''), 'aria-label': hb + ' ' + DAYS[i], onclick: () => {
            const a = s[hb] || (s[hb] = []);
            const at = a.indexOf(i);
            at >= 0 ? a.splice(at, 1) : a.push(i);
            store.set(key, s);
            render();
          } }, on ? '♥' : ''));
        }))));
    };
    render();
    return card(w, h('div', { class: 'scroll-x' }, table));
  };

  W.gate = (w) => {
    const why = h('input', { type: 'text', placeholder: 'Зачем я открываю? (например: перевести эссе)' });
    const mins = h('select', {}, [10, 15, 25].map((m) => h('option', { value: m, selected: m === 15 }, m + ' мин')));
    const display = h('div', { class: 'clock small' });
    const status = h('p', { class: 'muted' }, 'Выбери сайт, когда напишешь, зачем.');
    const t = countdown(display, () => { status.textContent = 'Время вышло. Закрой вкладку и вернись к плану ♥'; document.title = 'Время вышло!'; });
    const open = (item) => {
      const reason = why.value.trim();
      if (reason.length < 4) { why.focus(); why.classList.add('shake'); setTimeout(() => why.classList.remove('shake'), 500); status.textContent = 'Сначала напиши, зачем, хотя бы пару слов.'; return; }
      const log = store.get('ai:gate-log', []);
      log.unshift({ at: new Date().toISOString(), site: item.label, why: reason, min: +mins.value });
      store.set('ai:gate-log', log.slice(0, 200));
      window.open(item.href, '_blank', 'noopener');
      t.start(+mins.value * 60000);
      status.textContent = item.label + ': ' + reason;
      why.value = '';
      document.dispatchEvent(new CustomEvent('gate-log'));
    };
    return card(w, why, h('div', { class: 'gate-row' }, mins, display),
      h('div', { class: 'gate-sites' }, w.items.map((i) => h('button', { class: 'trainer-btn', onclick: () => open(i) }, h('b', {}, i.label)))), status);
  };

  W.log = (w) => {
    const ul = h('ul', { class: 'log' });
    const render = () => {
      const log = store.get(w.key.startsWith('ai:') ? w.key : 'ai:' + w.key, []);
      ul.replaceChildren(...(log.length ? log.slice(0, 30).map((l) => h('li', {},
        h('span', { class: 'tag' }, new Date(l.at).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })),
        h('b', {}, l.site), ' · ', l.why)) : [h('li', { class: 'muted' }, 'Пока пусто.')]));
    };
    render();
    document.addEventListener('gate-log', render);
    return card(w, ul);
  };

  W.ideas = () => {
    const topics = ['подготовка к IELTS', 'китайский с нуля до HSK 4', 'мой учебный день', 'как я не прокрастинирую', 'мой учебный сайт в розовом стиле',
      'переезд и учёба за границей', 'стажировки и конференции', 'книга недели', 'утренняя рутина', 'неправильные глаголы', '10 иероглифов за минуту',
      'эстетика рабочего стола', 'мои конспекты', 'как я учу слова', 'спорт и энергия для учёбы', 'отказ от манхвы на месяц', 'моё портфолио'];
    const formats = ['study with me (таймлапс)', 'день из жизни', '3 ошибки, которые я делала', 'до и после', 'POV', 'туториал за 30 секунд',
      'мини-влог', 'карусель из 5 слайдов', 'мой прогресс за неделю', 'реакция на свои старые конспекты', 'челлендж на 30 дней', 'ответ на вопрос подписчика'];
    const hooks = ['«Я учила это неправильно целый год…»', '«Если ты готовишься к экзамену, сохрани это»', '«Как я учу 20 слов за 10 минут»', '«Не листай, если хочешь уехать учиться»',
      '«Вот что я сделала вместо манхвы»', '«Неделя, которая всё изменила»', '«Это скучно, но работает»'];
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const out = h('div', { class: 'idea' });
    let cur = '';
    const gen = () => {
      const topic = pick(topics), format = pick(formats), hook = pick(hooks);
      cur = format + ': ' + topic;
      out.replaceChildren(h('p', { class: 'idea-main' }, cur), h('p', { class: 'muted' }, 'Хук для начала: ' + hook));
    };
    gen();
    const save = h('button', { class: 'btn-ghost', onclick: () => {
      const add = W.board.add && W.board.add['popular:board:content'];
      if (add) { add(cur); save.textContent = 'Добавлено ✓'; setTimeout(() => (save.textContent = 'В банк идей'), 1200); }
    } }, 'В банк идей');
    const ask = h('button', { class: 'btn-ghost', onclick: () => {
      const prompt = 'Я студентка, учу английский (IELTS) и китайский (HSK 3–4), хочу учиться за границей. Придумай 10 идей для TikTok и Instagram Reels на тему «' + cur + '». Для каждой: хук на первые 2 секунды, план кадров, подпись и 5 хештегов.';
      navigator.clipboard && navigator.clipboard.writeText(prompt).catch(() => {});
      window.open('https://chat.deepseek.com', '_blank', 'noopener');
      ask.textContent = 'Запрос скопирован, вставь в DeepSeek';
      setTimeout(() => (ask.textContent = 'Спросить DeepSeek'), 3000);
    } }, 'Спросить DeepSeek');
    return card({ type: 'ideas', title: 'Генератор идей' }, out, h('div', { class: 'idea-btns' }, h('button', { class: 'btn', onclick: gen }, 'Дай идею ✦'), save, ask));
  };

  window.renderWidget = (w, sid) => (W[w.type] ? W[w.type](w, sid) : card(w, '…'));
  window.h = h;
})();
