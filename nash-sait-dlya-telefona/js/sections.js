// Разделы-лепестки. Чтобы добавить ссылку навсегда, допиши её сюда
// (или просто нажми «+ ссылка» на сайте).
window.SECTIONS = [
  {
    id: 'english',
    petal: 'English · IELTS',
    title: 'English',
    subtitle: 'подготовка к IELTS',
    motto: 'Every word today is a door abroad tomorrow.',
    left: [
      { type: 'trainer', title: 'Тренажёры', items: [
        { href: 'trainer.html?t=verbs', label: 'Неправильные глаголы', note: 'твой листок: таблица, карточки, тест' }
      ] },
      { type: 'links', title: 'Мои Quizlet', items: [
        { label: 'Quizlet: папка слов №1', href: 'https://quizlet.com/user/m9cbjfh2gn/folders/jjj' },
        { label: 'Quizlet: папка слов №2', href: 'https://quizlet.com/user/m9cbjfh2gn/folders/193461996' }
      ] },
      { type: 'links', title: 'Подготовка к IELTS', items: [
        { label: 'IELTS Liz', note: 'советы и разборы всех частей', href: 'https://ieltsliz.com' },
        { label: 'Take IELTS · British Council', note: 'официальная подготовка', href: 'https://takeielts.britishcouncil.org/take-ielts/prepare' },
        { label: 'IELTS.org · ресурсы', note: 'официальные примеры заданий', href: 'https://ielts.org/take-a-test/preparation-resources' },
        { label: 'IELTS Online Tests', note: 'пробники на время', href: 'https://ieltsonlinetests.com' },
        { label: 'BBC Learning English', href: 'https://www.bbc.co.uk/learningenglish' },
        { label: 'LearnEnglish · British Council', href: 'https://learnenglish.britishcouncil.org' },
        { label: 'YouGlish', note: 'как слово звучит у носителей', href: 'https://youglish.com' }
      ] },
      { type: 'files', title: 'Мои учебники', items: [
        { label: 'Синий Мерфи (Essential Grammar in Use)', href: 'materials/murphy-blue.pdf' },
        { label: 'Intermediate Grammar in Use', href: 'materials/intermediate-grammar-in-use.pdf' },
        { label: 'Голицынский, грамматика, 7-е изд.', href: 'materials/golitsynsky.pdf' }
      ] }
    ],
    right: [
      { type: 'progress', title: 'Мой IELTS', items: [
        { label: 'Listening, балл', max: 9, step: 0.5 },
        { label: 'Reading, балл', max: 9, step: 0.5 },
        { label: 'Writing, балл', max: 9, step: 0.5 },
        { label: 'Speaking, балл', max: 9, step: 0.5 },
        { label: 'Пробников сделано', max: 20, step: 1 },
        { label: 'Эссе написано', max: 30, step: 1 }
      ] },
      { type: 'units', title: 'Синий Мерфи: юниты', count: 114 },
      { type: 'units', title: 'Intermediate: юниты', count: 145, key: 'units-inter' },
      { type: 'planner', title: 'Планер недели' },
      { type: 'notes', title: 'Заметки' }
    ]
  },
  {
    id: 'chinese',
    petal: '中文 · HSK 3–4',
    title: '中文',
    subtitle: 'подготовка к HSK 3 и 4',
    motto: '千里之行，始于足下 · путь в тысячу ли начинается с первого шага',
    left: [
      { type: 'trainer', title: 'Тренажёры слов', items: [
        { href: 'trainer.html?t=hsk3', label: 'HSK 3 · 500 слов', note: 'из твоего словаря HSK 3.0' },
        { href: 'trainer.html?t=hsk4', label: 'HSK 4 · 975 слов', note: 'из твоего словаря HSK 4 3.0' },
        { href: 'grammar.html', label: 'Грамматика HSK 1–5', note: '151 правило с примерами, правило дня' }
      ] },
      { type: 'files', title: 'Мои материалы', items: [
        { label: 'Словарь HSK 3 (3.0)', href: 'materials/hsk3-slovar.pdf' },
        { label: 'Словарь HSK 4 (3.0)', href: 'materials/hsk4-slovar.pdf' },
        { label: 'HSK 3.0, большой файл', href: 'materials/hsk-3.0-uchebnik.pdf' },
        { label: 'Презентация «для 414» (урок 手机丢了)', href: 'materials/dlya-414.pptx', note: 'откроется в PowerPoint или Keynote' }
      ] },
      { type: 'links', title: 'Сайты', items: [
        { label: 'Chinese Test (официальный HSK)', href: 'https://www.chinesetest.cn' },
        { label: 'Chinese Grammar Wiki', note: 'грамматика по уровням', href: 'https://resources.allsetlearning.com/chinese/grammar/' },
        { label: 'Hanzii', note: 'словарь и порядок черт', href: 'https://hanzii.net' },
        { label: 'MDBG', note: 'быстрый словарь', href: 'https://www.mdbg.net/chinese/dictionary' },
        { label: 'Pleco', note: 'словарь на телефон', href: 'https://www.pleco.com' },
        { label: 'Du Chinese', note: 'тексты по уровням', href: 'https://www.duchinese.net' },
        { label: 'Hacking Chinese', note: 'как учить умнее', href: 'https://www.hackingchinese.com' }
      ] }
    ],
    right: [
      { type: 'progress', title: 'Мой прогресс', items: [
        { label: 'Уроков учебника пройдено', max: 20, step: 1 },
        { label: 'Пробников HSK 3', max: 10, step: 1 },
        { label: 'Пробников HSK 4', max: 10, step: 1 },
        { label: 'Часов аудирования', max: 50, step: 1 }
      ], auto: [
        { label: 'Слов HSK 3 выучено', from: 'learned:hsk3', max: 500 },
        { label: 'Слов HSK 4 выучено', from: 'learned:hsk4', max: 975 },
        { label: 'Правил грамматики знаю', from: 'grammar:known', max: 151 }
      ] },
      { type: 'planner', title: 'Планер недели' },
      { type: 'notes', title: 'Заметки и грамматика' }
    ]
  },
  {
    id: 'ddz',
    petal: 'ДЗ',
    title: 'ДЗ',
    subtitle: 'домашка, дедлайны, ссылки',
    motto: 'Сделано лучше, чем идеально.',
    left: [
      { type: 'deadlines', title: 'Задания и дедлайны' },
      { type: 'links', title: 'Ссылки по предметам', items: [
        { label: 'Google Classroom', href: 'https://classroom.google.com' },
        { label: 'Google Диск', href: 'https://drive.google.com' }
      ] }
    ],
    right: [
      { type: 'planner', title: 'Планер недели' },
      { type: 'notes', title: 'Заметки по парам' }
    ]
  },
  {
    id: 'abroad',
    petal: 'Возможности',
    title: 'Возможности',
    subtitle: 'конференции, стажировки, гранты, учёба за границей',
    motto: 'Портфолио собирается по одной строчке. Подавайся.',
    left: [
      { type: 'links', title: 'Где искать', items: [
        { label: 'Opportunity Desk', note: 'конференции, конкурсы, гранты', href: 'https://opportunitydesk.org' },
        { label: 'Youth Opportunities', note: 'обмены и программы для молодёжи', href: 'https://www.youthop.com' },
        { label: 'Campus China (CSC)', note: 'стипендии в Китай', href: 'https://www.campuschina.org' },
        { label: 'DAAD', note: 'учёба и стипендии в Германии', href: 'https://www.daad.de/en/' },
        { label: 'Erasmus Mundus', note: 'магистратуры Европы со стипендией', href: 'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en' },
        { label: 'Chevening', note: 'стипендия в Великобританию', href: 'https://www.chevening.org' },
        { label: 'Mastersportal', note: 'поиск программ по миру', href: 'https://www.mastersportal.com' },
        { label: 'LinkedIn Jobs', note: 'стажировки', href: 'https://www.linkedin.com/jobs/' }
      ] },
      { type: 'checklist', title: 'Портфолио', items: [
        'Резюме на английском (CV)', 'Мотивационное письмо, черновик', 'Сертификат IELTS', 'Сертификат HSK',
        'Профиль LinkedIn', '2 рекомендательных письма', 'Участие в конференции', 'Стажировка или волонтёрство',
        'Проект или исследование', 'Загранпаспорт'
      ] }
    ],
    right: [
      { type: 'board', title: 'Мои заявки', key: 'apps', columns: ['Нашла', 'Готовлю', 'Подала', 'Ответ'], placeholder: 'Название программы и дедлайн' },
      { type: 'notes', title: 'Идеи и контакты' }
    ]
  },
  {
    id: 'ai',
    petal: 'ИИ и поиск',
    title: 'ИИ и поиск',
    subtitle: 'интернет только по делу',
    motto: 'Сначала зачем, потом куда.',
    left: [
      { type: 'gate', title: 'Открыть с намерением', items: [
        { label: 'DeepSeek', href: 'https://chat.deepseek.com' },
        { label: 'Google Scholar', href: 'https://scholar.google.com' },
        { label: 'DeepL', href: 'https://www.deepl.com/translator' },
        { label: 'Reverso Context', href: 'https://context.reverso.net' },
        { label: 'Google Переводчик', href: 'https://translate.google.com' },
        { label: 'Google', href: 'https://www.google.com' }
      ] },
      { type: 'tip', title: 'Чтобы правда не залипать', text: 'Сайт не может закрыть весь интернет сам. Поставь в браузер бесплатное расширение LeechBlock NG (Chrome, Firefox) или программу Cold Turkey и внеси туда сайты с манхвой и соцсети. А этот сайт сделай стартовой страницей.' }
    ],
    right: [
      { type: 'log', title: 'Зачем я заходила', key: 'gate-log' },
      { type: 'notes', title: 'Хорошие запросы для DeepSeek' }
    ]
  },
  {
    id: 'reading',
    petal: 'Чтение',
    title: 'Чтение',
    subtitle: 'книги вместо манхвы',
    motto: 'Читать 20 страниц в день, это 30 книг в год.',
    left: [
      { type: 'board', title: 'Мои книги', key: 'books', columns: ['Хочу', 'Читаю', 'Прочитала'], placeholder: 'Название и автор' },
      { type: 'links', title: 'Где брать', items: [
        { label: 'LiveLib', note: 'подборки и отзывы', href: 'https://www.livelib.ru' },
        { label: 'Литрес', href: 'https://www.litres.ru' },
        { label: 'Goodreads', note: 'книги на английском', href: 'https://www.goodreads.com' }
      ] }
    ],
    right: [
      { type: 'progress', title: 'Счётчик', items: [
        { label: 'Книг за год', max: 30, step: 1 },
        { label: 'Страниц за неделю', max: 140, step: 10 }
      ] },
      { type: 'notes', title: 'Цитаты и мысли' }
    ]
  },
  {
    id: 'plan',
    petal: 'План и энергия',
    title: 'План и энергия',
    subtitle: 'завтра, неделя, сон, вода, спорт',
    motto: 'Сильная личность, это просто человек, который делает план и выполняет его.',
    left: [
      { type: 'calendar', title: 'Календарь дисциплины' },
      { type: 'tomorrow', title: 'План на завтра' },
      { type: 'allweek', title: 'Неделя из всех разделов' }
    ],
    right: [
      { type: 'timer', title: 'Фокус-таймер' },
      { type: 'habits', title: 'Энергия недели', items: ['Сон 8 часов', '2 литра воды', 'Спорт или прогулка', 'Без манхвы', 'Лечь до 23:30'] },
      { type: 'notes', title: 'Мысли' }
    ]
  },
  {
    id: 'popular',
    petal: 'Популярность',
    title: 'Популярность',
    subtitle: 'TikTok и Instagram',
    motto: 'Покажи путь, по которому идёшь. Люди подпишутся на путь.',
    left: [
      { type: 'ideas', title: 'Генератор идей' },
      { type: 'links', title: 'Инструменты', items: [
        { label: 'CapCut', note: 'монтаж', href: 'https://www.capcut.com' },
        { label: 'Canva', note: 'обложки и сторис', href: 'https://www.canva.com' },
        { label: 'TikTok Creative Center', note: 'что сейчас в тренде', href: 'https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en' },
        { label: 'Pinterest', note: 'эстетика и референсы', href: 'https://www.pinterest.com' }
      ] }
    ],
    right: [
      { type: 'board', title: 'Банк идей', key: 'content', columns: ['Идея', 'Снято', 'Выложено'], placeholder: 'Идея ролика или поста' },
      { type: 'planner', title: 'Контент-календарь' },
      { type: 'notes', title: 'Хуки и подписи' }
    ]
  }
];
