// Всё хранится в браузере под префиксом, плюс копия в файл и обратно.
(function () {
  const P = 'dasha-hub:';
  // Когда менялась каждая запись — нужно синхронизации, чтобы брать самую свежую версию.
  const TS = 'dasha-hub-ts';
  const stamps = () => { try { return JSON.parse(localStorage.getItem(TS) || '{}'); } catch (e) { return {}; } };
  const stamp = (key, t) => { try { const s = stamps(); s[key] = t || Date.now(); localStorage.setItem(TS, JSON.stringify(s)); } catch (e) {} };

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(P + key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem(P + key, JSON.stringify(value)); } catch (e) {}
      stamp(key);
      document.dispatchEvent(new CustomEvent('store-change', { detail: key }));
    },
    exportAll() {
      const data = {};
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k.startsWith(P)) data[k.slice(P.length)] = JSON.parse(localStorage.getItem(k));
        }
      } catch (e) {}
      const blob = new Blob([JSON.stringify({ app: 'dasha-hub', saved: new Date().toISOString(), data }, null, 1)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'moy-sait-kopiya-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    },
    // Загрузка копии СКЛЕИВАЕТ данные с тем, что уже есть на этом устройстве:
    // задачи из обеих копий остаются, галочки сохраняются, счётчики берут большее.
    importFile(file) {
      return file.text().then((text) => {
        const parsed = JSON.parse(text);
        if (parsed.app !== 'dasha-hub') throw new Error('not ours');
        Object.entries(parsed.data).forEach(([k, v]) => {
          if (k === 'fx') return;
          const local = store.get(k, undefined);
          const merged = local === undefined ? v : merge(local, v, k);
          try { localStorage.setItem(P + k, JSON.stringify(merged)); } catch (e) {}
          stamp(k);
        });
      });
    }
  };

  const itemKey = (x) => x && typeof x === 'object' && !Array.isArray(x) && 't' in x ? 't:' + x.t + '|' + (x.date || '') + '|' + (x.time || '') : JSON.stringify(x);
  function merge(a, b, key) {
    if (a === null || b === null) return a === null ? b : a;
    if (Array.isArray(a) && Array.isArray(b)) {
      // Планер недели: 7 списков по дням — склеиваем по дням.
      if (a.length && Array.isArray(a[0]) && b.length && Array.isArray(b[0])) return a.map((day, i) => merge(day, b[i] || [], key));
      const out = a.slice();
      const seen = new Map(out.map((x, i) => [itemKey(x), i]));
      b.forEach((x) => {
        const k = itemKey(x);
        if (!seen.has(k)) { seen.set(k, out.length); out.push(x); }
        else if (x && typeof x === 'object' && 'done' in x) out[seen.get(k)] = Object.assign({}, out[seen.get(k)], { done: out[seen.get(k)].done || x.done });
      });
      return out;
    }
    if (typeof a === 'object' && typeof b === 'object') {
      const out = Object.assign({}, a);
      Object.keys(b).forEach((k) => { out[k] = k in a ? merge(a[k], b[k], k) : b[k]; });
      return out;
    }
    if (typeof a === 'number' && typeof b === 'number') return Math.max(a, b);
    if (typeof a === 'string' && typeof b === 'string') {
      if (a === b || a.includes(b)) return a;
      if (b.includes(a)) return b;
      if (key === 'started') return a < b ? a : b;
      if (/^\d{4}-\d\d-\d\d$/.test(a)) return a > b ? a : b;
      return a + '\n\n— с другого устройства —\n' + b;
    }
    return b;
  }

  // Понедельник текущей недели, чтобы трекеры сами обнулялись каждую неделю.
  store.weekKey = function (date) {
    const d = new Date(date || Date.now());
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - (d.getDay() + 6) % 7);
    return d.toLocaleDateString('sv-SE');
  };

  store.todayIndex = () => (new Date().getDay() + 6) % 7;

  store.merge = merge;
  store.stamps = stamps;
  store.keys = () => {
    const out = [];
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(P)) out.push(k.slice(P.length)); } } catch (e) {}
    return out;
  };
  // Запись без отметки времени и без события — для данных, пришедших с другого устройства.
  store.setRemote = (key, value, t) => {
    try { value === null ? localStorage.removeItem(P + key) : localStorage.setItem(P + key, JSON.stringify(value)); } catch (e) {}
    stamp(key, t);
  };
  window.store = store;

  // Кнопки «сохранить копию / загрузить копию» в подвале любой страницы.
  document.addEventListener('DOMContentLoaded', () => {
    const exp = document.querySelector('[data-export]');
    const imp = document.querySelector('[data-import]');
    if (exp) exp.addEventListener('click', () => store.exportAll());
    if (imp) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';
      input.addEventListener('change', () => {
        if (!input.files[0]) return;
        store.importFile(input.files[0])
          .then(() => location.reload())
          .catch(() => alert('Этот файл не похож на копию сайта.'));
      });
      imp.addEventListener('click', () => input.click());
    }
  });
})();
