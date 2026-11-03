// Синхронизация телефона и ноутбука через твой GitHub: все записи лежат в одном секретном gist.
// Ключ доступа хранится только в этом браузере и сам никуда не синхронизируется.
// Для каждой записи берётся самая свежая версия (по времени изменения).
(function () {
  const TOKEN = 'dasha-sync-token', GIST = 'dasha-sync-gist', LAST = 'dasha-sync-last', USER = 'dasha-sync-user';
  const FILE = 'dasha-hub.json', DESC = 'dasha-hub-sync (Наш сайт для Дарьи)';
  const SKIP = new Set(['fx']);
  const ls = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} }
  };
  let busy = false, status = '', pillEl = null;

  const api = (path, opts) => fetch('https://api.github.com' + path, Object.assign({}, opts, {
    headers: { Authorization: 'Bearer ' + ls.get(TOKEN), Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' }
  })).then((r) => {
    if (r.status === 401) throw new Error('auth');
    if (!r.ok) throw new Error('http ' + r.status);
    return r.json();
  });

  function snapshot() {
    const data = {}, ts = store.stamps(), outTs = {};
    store.keys().forEach((k) => { if (!SKIP.has(k)) { data[k] = store.get(k); outTs[k] = ts[k] || 0; } });
    return { app: 'dasha-hub', saved: Date.now(), data, ts: outTs };
  }

  async function findOrCreateGist() {
    let id = ls.get(GIST);
    if (id) return id;
    for (let page = 1; page <= 5 && !id; page++) {
      const list = await api('/gists?per_page=100&page=' + page);
      const g = list.find((x) => x.description === DESC && x.files[FILE]);
      if (g) id = g.id;
      if (list.length < 100) break;
    }
    if (!id) {
      const g = await api('/gists', { method: 'POST', body: JSON.stringify({ description: DESC, public: false, files: { [FILE]: { content: JSON.stringify(snapshot()) } } }) });
      id = g.id;
    }
    ls.set(GIST, id);
    return id;
  }

  async function pull(id) {
    const g = await api('/gists/' + id);
    const f = g.files[FILE];
    if (!f) return null;
    const text = f.truncated ? await fetch(f.raw_url).then((r) => r.text()) : f.content;
    try { return JSON.parse(text); } catch (e) { return null; }
  }

  // Возвращает true, если на этом устройстве что-то поменялось из облака.
  async function sync() {
    if (!ls.get(TOKEN) || busy) return false;
    busy = true;
    paint('☁ …');
    try {
      const id = await findOrCreateGist();
      const remote = await pull(id);
      let changedHere = false, needPush = !remote;
      if (remote && remote.data) {
        const localTs = store.stamps();
        const keys = new Set([...store.keys(), ...Object.keys(remote.data)]);
        keys.forEach((k) => {
          if (SKIP.has(k)) return;
          const lt = localTs[k] || 0, rt = (remote.ts || {})[k] || 0;
          const lv = store.get(k, undefined), rv = remote.data[k];
          const inRemote = k in remote.data;
          if (!inRemote) { if (lv !== undefined) needPush = true; return; }
          if (lv === undefined) { store.setRemote(k, rv, rt || Date.now()); changedHere = true; return; }
          if (JSON.stringify(lv) === JSON.stringify(rv)) return;
          if (!lt && !rt) {
            // Старые записи без времени (до синхронизации) — склеиваем обе копии.
            const merged = store.merge(lv, rv, k);
            store.setRemote(k, merged, Date.now());
            changedHere = changedHere || JSON.stringify(merged) !== JSON.stringify(lv);
            needPush = true;
          } else if (rt > lt) { store.setRemote(k, rv, rt); changedHere = true; }
          else needPush = true;
        });
      }
      if (needPush) await api('/gists/' + id, { method: 'PATCH', body: JSON.stringify({ files: { [FILE]: { content: JSON.stringify(snapshot()) } } }) });
      ls.set(LAST, String(Date.now()));
      status = '';
      paint();
      return changedHere;
    } catch (e) {
      status = e.message === 'auth' ? 'ключ не подходит' : navigator.onLine === false ? 'нет интернета' : 'ошибка, попробую позже';
      if (e.message === 'auth') ls.set(GIST, null);
      paint();
      return false;
    } finally {
      busy = false;
    }
  }

  function paint(text) {
    if (!pillEl) return;
    const last = +ls.get(LAST) || 0;
    pillEl.textContent = text || (!ls.get(TOKEN) ? '☁ Синхронизация' : status ? '☁ ' + status : '☁ ✓ ' + (last ? new Date(last).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''));
    pillEl.classList.toggle('sync-bad', !!status);
  }

  // Перезагрузить страницу, если пришли данные с другого устройства (не чаще раза в 20 секунд).
  async function syncAndRefresh() {
    const changed = await sync();
    if (!changed) return;
    let lastReload = 0;
    try { lastReload = +sessionStorage.getItem('dasha-sync-reload') || 0; } catch (e) {}
    if (Date.now() - lastReload > 20000) {
      try { sessionStorage.setItem('dasha-sync-reload', String(Date.now())); } catch (e) {}
      location.reload();
    }
  }

  // ---------- Окно настройки ----------
  function openPanel() {
    const wrap = document.createElement('div');
    wrap.className = 'scold-wrap';
    const connected = !!ls.get(TOKEN);
    wrap.innerHTML = '<div class="scold sync-panel" role="dialog"><div class="scold-body">' +
      '<p class="scold-kicker">Синхронизация</p>' +
      (connected
        ? '<p>Подключено' + (ls.get(USER) ? ' к GitHub <b>' + ls.get(USER) + '</b>' : '') + '. Телефон и ноутбук обмениваются записями сами: при открытии сайта, после изменений и раз в полторы минуты.</p>' +
          '<p class="muted" data-status></p>' +
          '<div class="scold-btns"><button class="btn" data-now>Синхронизировать сейчас</button><button class="btn-ghost" data-off>Отключить на этом устройстве</button><button class="btn-ghost" data-close>Закрыть</button></div>'
        : '<p>Записи будут храниться в секретном gist на твоём GitHub, и все устройства увидят одно и то же.</p>' +
          '<ol class="sync-steps"><li>На github.com: фото профиля → <b>Settings</b> → внизу слева <b>Developer settings</b> → <b>Personal access tokens</b> → <b>Tokens (classic)</b> → <b>Generate new token (classic)</b>.</li>' +
          '<li>Note: <i>nash-sait sync</i>. Expiration: <i>No expiration</i>. Галочку поставь <b>только</b> на <b>gist</b>. Внизу <b>Generate token</b>.</li>' +
          '<li>Скопируй ключ (начинается с <i>ghp_</i>) и вставь сюда. Так же — один раз на телефоне.</li></ol>' +
          '<input type="password" class="search" placeholder="ghp_…" data-token autocomplete="off">' +
          '<p class="muted" data-status>Ключ хранится только в этом браузере. Никому его не отправляй.</p>' +
          '<div class="scold-btns"><button class="btn" data-connect>Подключить</button><button class="btn-ghost" data-close>Закрыть</button></div>') +
      '</div></div>';
    const close = () => { wrap.classList.add('out'); setTimeout(() => wrap.remove(), 350); };
    const st = (t) => { const el = wrap.querySelector('[data-status]'); if (el) el.textContent = t; };
    wrap.querySelectorAll('[data-close]').forEach((b) => (b.onclick = close));
    const off = wrap.querySelector('[data-off]');
    if (off) off.onclick = () => { [TOKEN, GIST, LAST, USER].forEach((k) => ls.set(k, null)); paint(); close(); };
    const now = wrap.querySelector('[data-now]');
    if (now) {
      const last = +ls.get(LAST) || 0;
      st(status ? 'Проблема: ' + status : last ? 'Последний раз: ' + new Date(last).toLocaleString('ru-RU') : '');
      now.onclick = async () => { st('Синхронизирую…'); const ch = await sync(); st(status ? 'Проблема: ' + status : ch ? 'Готово, пришли новые записи — обновляю страницу.' : 'Готово, всё совпадает ✓'); if (ch) setTimeout(() => location.reload(), 900); };
    }
    const connect = wrap.querySelector('[data-connect]');
    if (connect) connect.onclick = async () => {
      const t = wrap.querySelector('[data-token]').value.trim();
      if (!t) return st('Вставь ключ.');
      ls.set(TOKEN, t);
      st('Проверяю ключ…');
      try {
        const u = await api('/user');
        ls.set(USER, u.login);
        st('Ключ подходит, ищу или создаю хранилище…');
        const ch = await sync();
        if (status) throw new Error(status);
        st('Подключено ✓ ' + (ch ? 'Пришли записи с другого устройства — обновляю.' : ''));
        setTimeout(() => (ch ? location.reload() : close()), 1200);
      } catch (e) {
        ls.set(TOKEN, null);
        st(e.message === 'auth' ? 'GitHub не принял ключ. Проверь, что скопировала его целиком и отметила «gist».' : 'Не получилось: ' + e.message);
      }
    };
    document.body.appendChild(wrap);
  }

  function onLoad() {
    const bar = document.querySelector('.home-bar, .foot');
    if (bar) {
      pillEl = document.createElement('button');
      pillEl.className = 'pill sync-pill';
      pillEl.onclick = openPanel;
      bar.appendChild(pillEl);
      paint();
    }
    if (!ls.get(TOKEN)) return;
    setTimeout(syncAndRefresh, 600);
    let t = null;
    document.addEventListener('store-change', () => { clearTimeout(t); t = setTimeout(sync, 4000); });
    setInterval(syncAndRefresh, 90000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncAndRefresh(); else sync(); });
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', onLoad) : onLoad();

  window.cloudSync = { sync, openPanel };
})();
