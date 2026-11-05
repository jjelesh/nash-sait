// Тренировка грамматики сериями по 10 вопросов. Вопрос: { q, sub, options, answer, explain, optClass }.
(function () {
  const iso = () => new Date().toLocaleDateString('sv-SE');
  const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);

  // makeQuestion() возвращает новый вопрос; key — где хранить статистику (например 'en' или 'zh').
  window.practiceQuiz = function (box, makeQuestion, key, title) {
    let n = 0, right = 0, wrongList = [];
    const statKey = 'practice:' + key + ':' + iso();
    const header = () => {
      const st = store.get(statKey, { done: 0, right: 0 });
      return h('p', { class: 'today-stats' }, 'Сегодня: ' + st.done + ' ' + 'упражнений, верно ' + st.right + (st.done ? ' (' + Math.round(st.right / st.done * 100) + '%)' : ''));
    };
    const next = () => {
      if (n >= 10) return finish();
      const q = makeQuestion();
      const fb = h('p', { class: 'feedback' });
      let answered = false;
      const btns = q.options.map((o, i) => h('button', { class: q.optClass || '', onclick: (e) => {
        if (answered) return;
        answered = true;
        n++;
        const ok = i === q.answer;
        if (ok) right++; else wrongList.push(q);
        btns[q.answer].classList.add('right');
        if (!ok) e.currentTarget.classList.add('wrong');
        fb.textContent = (ok ? 'Верно ♥ ' : 'Неверно. ') + (q.explain || '');
        const st = store.get(statKey, { done: 0, right: 0 });
        st.done++; if (ok) st.right++;
        store.set(statKey, st);
        if (ok && window.fx) fx.burst(e.clientX, e.clientY);
        const nb = h('button', { class: 'btn', onclick: next }, n >= 10 ? 'Итог ›' : 'Дальше ›');
        box.querySelector('.quiz').append(nb);
        nb.focus();
      } }, o));
      box.replaceChildren(header(), h('div', { class: 'quiz practice' },
        h('p', { class: 'muted' }, title + ' · вопрос ' + (n + 1) + ' из 10' + (q.sub ? ' · ' + q.sub : '')),
        h('p', { class: 'q-text ' + (q.qClass || '') }, q.q),
        h('div', { class: 'options' }, btns), fb));
    };
    const finish = () => {
      const msg = right >= 9 ? 'Блестяще! Джошуа аплодирует 💋' : right >= 7 ? 'Хорошо. Ещё серия — и будет идеально.' : 'Лелуш недоволен. Повтори правила и попробуй снова.';
      if (right >= 9 && window.fx) fx.celebrate();
      box.replaceChildren(header(), h('div', { class: 'quiz practice' },
        h('p', { class: 'q' }, right + ' / 10'),
        h('p', {}, msg),
        wrongList.length ? h('div', { class: 'scold-pen' }, h('b', {}, 'Разбор ошибок:'), h('ul', {}, wrongList.map((q) => h('li', {}, q.q.replace('___', '[' + q.options[q.answer] + ']') + (q.explain ? ' — ' + q.explain : ''))))) : null,
        h('button', { class: 'btn', onclick: () => { n = 0; right = 0; wrongList = []; next(); } }, 'Ещё 10 вопросов')));
    };
    next();
  };
  window.practiceShuffle = shuffle;
})();
