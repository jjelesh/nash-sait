// Всё хранится в браузере под префиксом, плюс копия в файл и обратно.
(function () {
  const P = 'dasha-hub:';

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
    importFile(file) {
      return file.text().then((text) => {
        const parsed = JSON.parse(text);
        if (parsed.app !== 'dasha-hub') throw new Error('not ours');
        Object.entries(parsed.data).forEach(([k, v]) => store.set(k, v));
      });
    }
  };

  // Понедельник текущей недели, чтобы трекеры сами обнулялись каждую неделю.
  store.weekKey = function (date) {
    const d = new Date(date || Date.now());
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - (d.getDay() + 6) % 7);
    return d.toLocaleDateString('sv-SE');
  };

  store.todayIndex = () => (new Date().getDay() + 6) % 7;

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
