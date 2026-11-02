// Карточка правила и «правило дня» — общие для страницы грамматики и тренажёра HSK.
(function () {
  const KEY = 'grammar:known';
  const id = (r) => r[0] + ':' + r[1];
  const known = () => new Set(store.get(KEY, []));
  const toggleKnown = (r) => {
    const s = known();
    s.has(id(r)) ? s.delete(id(r)) : s.add(id(r));
    store.set(KEY, [...s]);
    return s.has(id(r));
  };

  function ruleBody(r) {
    return [
      h('p', { class: 'rule-pattern' }, r[2]),
      h('p', { class: 'rule-text' }, r[3]),
      h('div', { class: 'rule-examples' }, r[4].map(([zh, py, ru]) => h('div', { class: 'ex' },
        h('div', { class: 'ex-zh' }, zh), h('div', { class: 'ex-py' }, py), h('div', { class: 'ex-ru' }, ru))))
    ];
  }

  function knowBtn(r, onChange) {
    const b = h('button', { class: 'btn-ghost know' });
    const paint = () => { const on = known().has(id(r)); b.textContent = on ? '✓ знаю' : 'отметить: знаю'; b.classList.toggle('on', on); };
    b.addEventListener('click', (e) => { e.stopPropagation(); toggleKnown(r); paint(); onChange && onChange(); });
    paint();
    return b;
  }

  // Раскрывающаяся строка правила для списка.
  function ruleRow(r, onChange) {
    const row = h('div', { class: 'rule' + (known().has(id(r)) ? ' known' : '') });
    const head = h('button', { class: 'rule-head', onclick: () => row.classList.toggle('open') },
      h('span', { class: 'lvl' }, 'HSK ' + r[0]), h('b', {}, r[1]), h('span', { class: 'rule-pattern small' }, r[2]));
    row.append(head, h('div', { class: 'rule-more' }, ...ruleBody(r), knowBtn(r, () => { row.classList.toggle('known', known().has(id(r))); onChange && onChange(); })));
    return row;
  }

  // Правило дня: меняется каждый день, сначала из невыученных; кнопка «ещё» листает дальше.
  function ruleOfDay(levels, onChange) {
    const pool = () => {
      const k = known();
      const all = GRAMMAR.filter((r) => levels.includes(r[0]));
      const fresh = all.filter((r) => !k.has(id(r)));
      return fresh.length ? fresh : all;
    };
    const day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 864e5);
    let shift = 0;
    const box = h('div', { class: 'rule-day' });
    const render = () => {
      const p = pool();
      const r = p[(day * 7 + shift) % p.length];
      box.replaceChildren(
        h('p', { class: 'muted' }, 'HSK ' + r[0] + ' · правило дня'),
        h('h4', { class: 'rule-title' }, r[1]),
        ...ruleBody(r),
        h('div', { class: 'idea-btns' }, knowBtn(r, () => { onChange && onChange(); }),
          h('button', { class: 'btn', onclick: () => { shift++; render(); } }, 'Ещё правило ›')));
    };
    render();
    return box;
  }

  window.grammarUI = { ruleRow, ruleOfDay, known, id };
})();
