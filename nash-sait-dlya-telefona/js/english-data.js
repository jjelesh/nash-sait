// Путь English A2 → C1. Грамматика: [название, объяснение, пример, перевод].
window.ENGLISH = [
  {
    id: 'A2', title: 'A2 → крепкий A2', months: '1–2 месяца', book: 'Синий Мерфи, юниты 1–60',
    goal: 'Говорить простыми фразами о себе, понимать медленную речь, писать короткие сообщения.',
    words: { goal: 1000, note: 'Самые частые слова: семья, еда, дом, учёба, время, погода, покупки.' },
    grammar: [
      ['Present Simple', 'Привычки и факты: I work, she works (+s для he/she/it). Вопрос — do/does, отрицание — don’t/doesn’t.', 'She studies Chinese every day.', 'Она учит китайский каждый день.'],
      ['Present Continuous', 'То, что происходит сейчас или в этот период: am/is/are + -ing.', 'I am reading a book right now.', 'Я сейчас читаю книгу.'],
      ['Simple vs Continuous', 'Simple — всегда, обычно. Continuous — сейчас, временно. Глаголы чувств (like, know, want) обычно без -ing.', 'I usually walk, but today I am taking a taxi.', 'Обычно я хожу пешком, но сегодня еду на такси.'],
      ['Past Simple', 'Закончилось в прошлом: worked / went (2-я форма). Вопрос и отрицание — did / didn’t + 1-я форма.', 'I didn’t go to school yesterday.', 'Вчера я не ходила в школу.'],
      ['Past Continuous', 'Длилось в момент прошлого: was/were + -ing. Часто с when.', 'I was sleeping when you called.', 'Я спала, когда ты позвонил.'],
      ['Present Perfect', 'Опыт или результат к сейчас: have/has + 3-я форма. ever, never, already, yet, just.', 'Have you ever been to China?', 'Ты когда-нибудь была в Китае?'],
      ['Perfect vs Past Simple', 'Есть точное время в прошлом (yesterday, in 2020) — Past Simple. Нет времени, важен результат — Present Perfect.', 'I have lost my keys. I lost them yesterday.', 'Я потеряла ключи. Потеряла вчера.'],
      ['Будущее: will / going to', 'will — решение сейчас, обещание, прогноз. going to — план, уже решила.', 'I’m going to study abroad. — I’ll help you!', 'Я собираюсь учиться за границей. — Я помогу!'],
      ['Present Continuous для планов', 'Договорённость на ближайшее будущее с временем.', 'I’m meeting my teacher at five.', 'Я встречаюсь с учителем в пять.'],
      ['Модальные can / must / have to', 'can — могу, must — должна (сама так считаю), have to — приходится (правило).', 'I have to wear a uniform. I must sleep more.', 'Мне приходится носить форму. Мне надо больше спать.'],
      ['should', 'Совет: should + глагол.', 'You should read every day.', 'Тебе стоит читать каждый день.'],
      ['Артикли a / an / the', 'a/an — один из многих, впервые. the — конкретный, уже известный. Без артикля — вообще (I like music).', 'I saw a cat. The cat was white.', 'Я увидела кошку. Кошка была белая.'],
      ['Исчисляемые и неисчисляемые', 'many/few — исчисляемые, much/little — неисчисляемые, a lot of — все.', 'How much time? How many words?', 'Сколько времени? Сколько слов?'],
      ['some / any', 'some — в утверждениях и просьбах, any — в вопросах и отрицаниях.', 'Do you have any questions? I have some.', 'Есть вопросы? У меня есть несколько.'],
      ['Сравнение прилагательных', 'Короткие: -er / the -est. Длинные: more / the most. good → better → the best.', 'Chinese is harder than English.', 'Китайский сложнее английского.'],
      ['Предлоги времени in / on / at', 'at — часы (at 5), on — дни и даты (on Monday), in — месяцы, годы, части дня (in May, in the morning).', 'See you on Friday at 7 in the evening.', 'Увидимся в пятницу в 7 вечера.'],
      ['Порядок слов в вопросе', 'Вопросительное слово + вспомогательный глагол + подлежащее + глагол.', 'Where do you live? What are you doing?', 'Где ты живёшь? Что ты делаешь?'],
      ['There is / there are', '«Есть, находится» что-то где-то.', 'There are two cats in my room.', 'В моей комнате две кошки.']
    ],
    read: [
      ['News in Levels · уровень 1–2', 'https://www.newsinlevels.com'],
      ['LearnEnglish · Reading A2', 'https://learnenglish.britishcouncil.org/skills/reading/a2-reading'],
      ['Breaking News English (простые уровни)', 'https://breakingnewsenglish.com']
    ],
    listen: [
      ['LearnEnglish · Listening A2', 'https://learnenglish.britishcouncil.org/skills/listening/a2-listening'],
      ['BBC Learning English · English In A Minute', 'https://www.bbc.co.uk/learningenglish/english/features/english-in-a-minute'],
      ['YouGlish — как звучит слово', 'https://youglish.com']
    ],
    write: [
      ['Опиши свой обычный день (60–80 слов).', 80],
      ['Напиши письмо другу о своих выходных (60–80 слов).', 80],
      ['Опиши своих кошек: внешность, характер, привычки (60–80 слов).', 80],
      ['Что ты делала вчера? Используй Past Simple (60–80 слов).', 80]
    ],
    speak: [
      'Расскажи о себе: имя, возраст, где учишься, что любишь (1 минута).',
      'Опиши свою комнату.',
      'Что ты делала вчера вечером?',
      'Какие у тебя планы на выходные? (going to)'
    ],
    frames: [
      'I think… / I like… because…',
      'First… Then… After that… Finally…',
      'For example, …',
      'I’m not sure, but…'
    ],
    milestones: ['Прошла юниты 1–60 Синего Мерфи', '1000 слов в Quizlet', 'Знаю все неправильные глаголы с листка', 'Могу 1 минуту рассказать о себе', 'Написала 5 текстов по 80 слов', 'Прочитала 10 текстов A2']
  },
  {
    id: 'B1', title: 'B1 · уверенный средний', months: '3–4 месяца', book: 'Синий Мерфи 61–114 + Intermediate 1–60',
    goal: 'Объясняться в большинстве ситуаций, понимать главное в речи и текстах, писать связный текст на знакомую тему.',
    words: { goal: 2000, note: 'Oxford 3000: уровни A2 и B1. Учи словами в контексте, по 15–20 в день.' },
    grammar: [
      ['Present Perfect Continuous', 'Длится до сейчас: have been + -ing, с for / since.', 'I have been learning Chinese for two years.', 'Я учу китайский уже два года.'],
      ['Past Perfect', 'Раньше другого прошлого: had + 3-я форма.', 'When I arrived, the lesson had started.', 'Когда я пришла, урок уже начался.'],
      ['used to', 'Привычка в прошлом, которой больше нет.', 'I used to read manhwa every night.', 'Раньше я каждый вечер читала манхву.'],
      ['First Conditional', 'Реальное условие: If + Present, will + глагол.', 'If I study hard, I will pass the exam.', 'Если буду усердно учиться, сдам экзамен.'],
      ['Second Conditional', 'Нереальное сейчас: If + Past, would + глагол.', 'If I lived in China, I would speak better.', 'Если бы я жила в Китае, говорила бы лучше.'],
      ['Zero Conditional', 'Всегда верно: If + Present, Present.', 'If you heat ice, it melts.', 'Если нагреть лёд, он тает.'],
      ['Passive (настоящее и прошлое)', 'be + 3-я форма: важно действие, а не кто сделал.', 'This book was written in 1990.', 'Эта книга была написана в 1990 году.'],
      ['Модальные вероятности', 'must — наверняка, might / may — возможно, can’t — точно нет.', 'She must be tired. He might come later.', 'Она, наверное, устала. Он, может, придёт позже.'],
      ['Герундий или инфинитив', 'enjoy / finish / avoid + -ing; want / decide / hope + to.', 'I enjoy reading, but I decided to sleep.', 'Я люблю читать, но решила поспать.'],
      ['Относительные придаточные', 'who — люди, which — вещи, that — оба, where — места.', 'The girl who sits next to me is from Korea.', 'Девушка, которая сидит рядом, из Кореи.'],
      ['Косвенная речь (основы)', 'Время сдвигается назад: said that + Past.', 'She said that she was busy.', 'Она сказала, что занята.'],
      ['Косвенные вопросы', 'Порядок прямой: Can you tell me where the station is?', 'Do you know what time it starts?', 'Не знаешь, во сколько начинается?'],
      ['so / such', 'so + прилагательное, such + (a) + прилагательное + существительное.', 'It was such a good film! It was so good!', 'Это был такой хороший фильм! Так хорошо!'],
      ['too / enough', 'too — слишком, enough — достаточно (после прилагательного).', 'It’s too late. I’m not old enough.', 'Слишком поздно. Я недостаточно взрослая.'],
      ['Фразовые глаголы (база)', 'Глагол + частица меняет смысл: give up, look for, find out, put off.', 'Don’t give up! Find out the answer.', 'Не сдавайся! Узнай ответ.'],
      ['Вопросы-хвостики', 'Утверждение + отрицательный хвостик и наоборот.', 'You’re tired, aren’t you?', 'Ты устала, да?'],
      ['Связки причины и контраста', 'because / so / although / however / but.', 'Although it was hard, I finished it.', 'Хотя было трудно, я закончила.'],
      ['Количество: few / a few, little / a little', 'a few / a little — немного (хорошо), few / little — мало (плохо).', 'I have a few friends here.', 'У меня здесь есть несколько друзей.']
    ],
    read: [
      ['News in Levels · уровень 3', 'https://www.newsinlevels.com'],
      ['LearnEnglish · Reading B1', 'https://learnenglish.britishcouncil.org/skills/reading/b1-reading'],
      ['Breaking News English', 'https://breakingnewsenglish.com'],
      ['Oxford 3000 по уровням (список слов)', 'https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000']
    ],
    listen: [
      ['BBC 6 Minute English', 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english'],
      ['LearnEnglish · Listening B1', 'https://learnenglish.britishcouncil.org/skills/listening/b1-listening'],
      ['All Ears English (подкаст)', 'https://www.allearsenglish.com']
    ],
    write: [
      ['Почему я хочу учиться за границей? (120–150 слов)', 150],
      ['Плюсы и минусы соцсетей для студентов (120–150 слов).', 150],
      ['Опиши человека, который тебя вдохновляет (120–150 слов).', 150],
      ['Расскажи историю о трудном дне, который закончился хорошо. Используй Past Perfect (150 слов).', 150]
    ],
    speak: [
      'Объясни, почему ты учишь китайский (2 минуты).',
      'Расскажи о фильме или книге, которая тебе понравилась.',
      'Что бы ты сделала, если бы выиграла миллион? (Second Conditional)',
      'Опиши свой идеальный день.'
    ],
    frames: [
      'PREP: Point (моё мнение) → Reason (почему) → Example (пример) → Point (вывод).',
      'In my opinion… The main reason is… For instance… That’s why…',
      'On the one hand… On the other hand…',
      'What I mean is… / In other words…'
    ],
    milestones: ['Синий Мерфи пройден целиком', 'Intermediate юниты 1–60', '2000 слов', 'Понимаю 6 Minute English без субтитров', 'Говорю 2 минуты по PREP без пауз', '10 эссе по 150 слов']
  },
  {
    id: 'B2', title: 'B2 · свободно в учёбе', months: '5–6 месяцев', book: 'Intermediate Grammar in Use 61–145',
    goal: 'Спорить и аргументировать, понимать лекции и статьи, писать эссе — здесь уже можно начинать IELTS.',
    words: { goal: 4000, note: 'Oxford 3000 B2 + Oxford 5000 B2: учёба, общество, технологии, экология.' },
    grammar: [
      ['Third Conditional', 'Нереальное прошлое: If + had + 3-я форма, would have + 3-я форма.', 'If I had studied, I would have passed.', 'Если бы я училась, я бы сдала.'],
      ['Смешанные условные', 'Прошлое влияет на сейчас: If I had…, I would be…', 'If I had slept, I wouldn’t be tired now.', 'Если бы я поспала, сейчас не была бы уставшей.'],
      ['wish / if only', 'wish + Past — жалею о настоящем, wish + had + 3-я форма — о прошлом.', 'I wish I spoke Chinese fluently.', 'Жаль, что я не говорю по-китайски свободно.'],
      ['Future Continuous и Future Perfect', 'will be doing — буду в процессе; will have done — уже сделаю к моменту.', 'By June I will have finished the course.', 'К июню я уже закончу курс.'],
      ['Passive во всех временах', 'is being done, has been done, will be done, can be done.', 'The results will be announced tomorrow.', 'Результаты объявят завтра.'],
      ['Каузатив have something done', 'Кто-то делает для тебя.', 'I had my hair cut.', 'Я подстриглась (в салоне).'],
      ['Модальные в прошлом', 'should have — зря не сделала; must have — наверняка было; might have — возможно было.', 'I should have started earlier.', 'Надо было начать раньше.'],
      ['Косвенная речь (полностью)', 'Сдвиг времён, вопросы, просьбы: asked me to…, told me not to…', 'He asked me where I was from.', 'Он спросил, откуда я.'],
      ['Неопределяющие придаточные', 'Доп. информация через запятую, без that.', 'My sister, who lives in Moscow, is a doctor.', 'Моя сестра, которая живёт в Москве, врач.'],
      ['Причастные обороты', 'Сокращение придаточных: -ing / -ed.', 'Feeling tired, I went to bed.', 'Чувствуя усталость, я пошла спать.'],
      ['Связки эссе', 'Moreover, furthermore, nevertheless, whereas, consequently.', 'Moreover, it saves time.', 'Более того, это экономит время.'],
      ['Конструкции с it', 'It is said that… / It seems that… / It is worth + -ing.', 'It is worth learning Chinese.', 'Китайский стоит учить.'],
      ['Gerund после предлогов', 'После предлога — только -ing.', 'I’m interested in studying abroad.', 'Мне интересно учиться за границей.'],
      ['Фразовые глаголы B2', 'come up with, carry out, figure out, look forward to.', 'I look forward to hearing from you.', 'Жду ответа.'],
      ['Устойчивые сочетания (collocations)', 'make a decision, do research, take a risk, pay attention.', 'We need to make a decision.', 'Нам нужно принять решение.'],
      ['Эмфаза: do / does / did', 'Усиление: I do want — я правда хочу.', 'I do understand you.', 'Я правда тебя понимаю.'],
      ['Артикли (тонкости)', 'Без артикля с общими понятиями, the — с уникальными и конкретными группами.', 'Education is important. The education system in China…', 'Образование важно. Система образования в Китае…'],
      ['Порядок прилагательных', 'мнение → размер → возраст → форма → цвет → происхождение → материал.', 'a beautiful small old Chinese vase', 'красивая маленькая старинная китайская ваза']
    ],
    read: [
      ['LearnEnglish · Reading B2', 'https://learnenglish.britishcouncil.org/skills/reading/b2-reading'],
      ['BBC News (короткие статьи)', 'https://www.bbc.com/news'],
      ['Oxford 5000 (список слов)', 'https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000']
    ],
    listen: [
      ['LearnEnglish · Listening B2', 'https://learnenglish.britishcouncil.org/skills/listening/b2-listening'],
      ['Luke’s English Podcast', 'https://teacherluke.co.uk'],
      ['TED Talks (с английскими субтитрами)', 'https://www.ted.com/talks']
    ],
    write: [
      ['Some people think university should be free. Discuss both views and give your opinion (250 слов).', 250],
      ['Is it better to study abroad or in your home country? (250 слов)', 250],
      ['Technology makes students less independent. Agree or disagree? (250 слов)', 250],
      ['Describe a problem in your city and suggest solutions (200 слов).', 200]
    ],
    speak: [
      'Аргументируй: онлайн-учёба лучше очной? (3 минуты)',
      'Расскажи о трудном решении, которое ты приняла.',
      'Что изменилось бы, если бы не было интернета?',
      'Опиши культурные различия между Россией и Китаем.'
    ],
    frames: [
      'It could be argued that… However, I believe…',
      'There are several reasons for this. Firstly… Secondly…',
      'A good example of this is…',
      'Taking everything into account, …'
    ],
    milestones: ['Intermediate Grammar in Use пройден', '4000 слов', 'Понимаю TED-доклад с английскими субтитрами', 'Пишу эссе 250 слов за 40 минут', '20 эссе проверены в Write & Improve', 'Первый пробник IELTS']
  },
  {
    id: 'C1', title: 'C1 · продвинутый', months: '6+ месяцев', book: 'Advanced Grammar in Use (купить позже) + много чтения',
    goal: 'Говорить гибко и точно, понимать сложные тексты и намёки, писать академично — IELTS 7+.',
    words: { goal: 8000, note: 'Oxford 5000 C1 + Academic Word List: academic vocabulary, идиомы, синонимы.' },
    grammar: [
      ['Инверсия', 'Для усиления: Never have I…, Not only… but also…, Hardly had… when…', 'Never have I seen such a beautiful city.', 'Никогда я не видела такого красивого города.'],
      ['Cleft sentences', 'Выделение: What I need is…, It was… that…', 'What I really want is to study in Beijing.', 'Чего я правда хочу — это учиться в Пекине.'],
      ['Условия без if', 'Should you need help… / Had I known… / Were I you…', 'Had I known, I would have come.', 'Знай я, я бы пришла.'],
      ['Сослагательное наклонение', 'It’s essential that he be… / I suggest that she study…', 'The teacher insisted that we be on time.', 'Учитель настоял, чтобы мы были вовремя.'],
      ['Модальные для гибкости', 'would rather, had better, needn’t have, could well.', 'You’d better start now.', 'Тебе лучше начать сейчас.'],
      ['Номинализация', 'Академичный стиль: глагол → существительное. decide → decision.', 'The reduction of costs led to growth.', 'Снижение расходов привело к росту.'],
      ['Hedging (смягчение)', 'Осторожные утверждения: tends to, it appears that, arguably.', 'This tends to be true for young people.', 'Это, как правило, верно для молодёжи.'],
      ['Сложные пассивы', 'He is said to be…, She is believed to have…', 'He is believed to have left the country.', 'Считается, что он уехал из страны.'],
      ['Эллипсис и замена', 'Избегаем повторов: so, not, do so, one(s).', 'I hope so. I’d like to, but I can’t.', 'Надеюсь. Хотела бы, но не могу.'],
      ['Продвинутые связки', 'notwithstanding, albeit, insofar as, given that.', 'It worked, albeit slowly.', 'Это сработало, хоть и медленно.'],
      ['Идиомы и выражения', 'Естественная речь: a piece of cake, hit the books, on the fence.', 'I need to hit the books tonight.', 'Сегодня мне надо засесть за учебники.'],
      ['Регистр: формально и разговорно', 'request ↔ ask, obtain ↔ get, commence ↔ start.', 'Please do not hesitate to contact me.', 'Пожалуйста, свяжитесь со мной.'],
      ['Фразовые глаголы C1', 'bring about, account for, rule out, put forward.', 'This accounts for the difference.', 'Это объясняет разницу.'],
      ['Точная модальность прошлого', 'can’t have, needn’t have, would have liked to.', 'She can’t have forgotten — she wrote it down.', 'Она не могла забыть — она записала.'],
      ['Фронтирование', 'Вынос части предложения вперёд для акцента.', 'Strange as it may seem, I love grammar.', 'Как ни странно, я люблю грамматику.'],
      ['Сложные сравнения', 'the more…, the more…; far / considerably / slightly + comparative.', 'The more you read, the better you write.', 'Чем больше читаешь, тем лучше пишешь.'],
      ['Порядок наречий и акценты', 'only, even, just, still меняют смысл по месту.', 'Only I saw him. I only saw him.', 'Только я видела его. Я его только видела.'],
      ['Академическое эссе', 'Тезис → аргументы → контраргумент → вывод; без «I think» в каждом предложении.', 'It is widely accepted that… Nevertheless…', 'Широко признаётся, что… Тем не менее…']
    ],
    read: [
      ['LearnEnglish · Reading C1', 'https://learnenglish.britishcouncil.org/skills/reading/c1-reading'],
      ['The Guardian / BBC Future', 'https://www.bbc.com/future'],
      ['Academic Word List (Victoria Univ.)', 'https://www.wgtn.ac.nz/lals/resources/academicwordlist']
    ],
    listen: [
      ['LearnEnglish · Listening C1', 'https://learnenglish.britishcouncil.org/skills/listening/c1-listening'],
      ['TED Talks без субтитров', 'https://www.ted.com/talks'],
      ['BBC Radio 4 · подкасты', 'https://www.bbc.co.uk/sounds']
    ],
    write: [
      ['To what extent should governments fund international students? (280 слов)', 280],
      ['Analyse the impact of AI on education (300 слов).', 300],
      ['Personal statement: why this university, why this programme (400 слов).', 400],
      ['Motivation letter for a scholarship (350 слов).', 350]
    ],
    speak: [
      'Обсуди спорную тему 4 минуты: should exams be abolished?',
      'Объясни сложную идею из своей учёбы простыми словами.',
      'Проведи мини-презентацию о своём проекте.',
      'Интервью на стипендию: ответь на «Tell me about yourself».'
    ],
    frames: [
      'While it is true that…, it is equally important to…',
      'This raises the question of whether…',
      'From my perspective, the crux of the matter is…',
      'To put it another way, …'
    ],
    milestones: ['8000 слов', 'Читаю статьи без словаря', 'Personal statement написан', 'Пробник IELTS 7+', 'Говорю 4 минуты на сложную тему', 'Письмо на стипендию отправлено']
  }
];
