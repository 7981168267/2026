import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Tabs,
  Tab,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  IconButton,
  TextField
} from '@mui/material';
import {
  Language as LanguageIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayIcon,
  Close as CloseIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

/**
 * Language Learning Component
 * Multi-language learning with daily lessons, basic/advanced levels
 * Uses open source and advanced learning resources
 */

const LANGUAGES = {
  spanish: {
    name: 'Spanish',
    flag: '🇪🇸',
    code: 'es',
    difficulty: 'Medium',
    speakers: '580M',
    resources: {
      basic: [
        { title: 'Greetings & Basics', content: 'Hola (Hello), Adiós (Goodbye), Gracias (Thank you), Por favor (Please)' },
        { title: 'Numbers 1-20', content: 'Uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez...' },
        { title: 'Common Phrases', content: '¿Cómo estás? (How are you?), ¿Dónde está? (Where is?), Me llamo... (My name is...)' },
        { title: 'Days of Week', content: 'Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo' },
        { title: 'Colors', content: 'Rojo (red), Azul (blue), Verde (green), Amarillo (yellow), Blanco (white)' }
      ],
      advanced: [
        { title: 'Verb Conjugations', content: 'Ser (to be): soy, eres, es, somos, sois, son. Estar (to be): estoy, estás, está...' },
        { title: 'Past Tense', content: 'Regular -ar verbs: hablé (I spoke), hablaste, habló, hablamos, hablasteis, hablaron' },
        { title: 'Subjunctive Mood', content: 'Espero que vengas (I hope you come). Quiero que estudies (I want you to study)' },
        { title: 'Complex Sentences', content: 'Aunque llueva, iré (Even if it rains, I will go). Si tuviera tiempo, viajaría (If I had time, I would travel)' },
        { title: 'Idiomatic Expressions', content: 'Estar en las nubes (to be daydreaming), Ser pan comido (to be a piece of cake)' }
      ]
    },
    dailyGoal: 5,
    openSourceLinks: [
      { name: 'Duolingo Spanish', url: 'https://www.duolingo.com/course/es/en/Learn-Spanish' },
      { name: 'SpanishDict', url: 'https://www.spanishdict.com/' },
      { name: 'Memrise Spanish', url: 'https://www.memrise.com/courses/english/spanish/' }
    ]
  },
  french: {
    name: 'French',
    flag: '🇫🇷',
    code: 'fr',
    difficulty: 'Medium',
    speakers: '280M',
    resources: {
      basic: [
        { title: 'Greetings & Basics', content: 'Bonjour (Hello), Au revoir (Goodbye), Merci (Thank you), S\'il vous plaît (Please)' },
        { title: 'Numbers 1-20', content: 'Un, deux, trois, quatre, cinq, six, sept, huit, neuf, dix...' },
        { title: 'Common Phrases', content: 'Comment allez-vous? (How are you?), Où est? (Where is?), Je m\'appelle... (My name is...)' },
        { title: 'Days of Week', content: 'Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi, Dimanche' },
        { title: 'Colors', content: 'Rouge (red), Bleu (blue), Vert (green), Jaune (yellow), Blanc (white)' }
      ],
      advanced: [
        { title: 'Verb Conjugations', content: 'Être (to be): suis, es, est, sommes, êtes, sont. Avoir (to have): ai, as, a, avons, avez, ont' },
        { title: 'Past Tense (Passé Composé)', content: 'J\'ai parlé (I spoke), Tu as mangé (You ate), Il a fini (He finished)' },
        { title: 'Subjunctive Mood', content: 'Il faut que tu viennes (You must come). Je veux que tu étudies (I want you to study)' },
        { title: 'Complex Sentences', content: 'Bien que je sois fatigué, je vais sortir (Although I am tired, I will go out)' },
        { title: 'Idiomatic Expressions', content: 'Avoir le cafard (to feel down), C\'est la vie (that\'s life), Bon appétit (enjoy your meal)' }
      ]
    },
    dailyGoal: 5,
    openSourceLinks: [
      { name: 'Duolingo French', url: 'https://www.duolingo.com/course/fr/en/Learn-French' },
      { name: 'FrenchPod101', url: 'https://www.frenchpod101.com/' },
      { name: 'Memrise French', url: 'https://www.memrise.com/courses/english/french/' }
    ]
  },
  german: {
    name: 'German',
    flag: '🇩🇪',
    code: 'de',
    difficulty: 'Hard',
    speakers: '130M',
    resources: {
      basic: [
        { title: 'Greetings & Basics', content: 'Hallo (Hello), Auf Wiedersehen (Goodbye), Danke (Thank you), Bitte (Please)' },
        { title: 'Numbers 1-20', content: 'Eins, zwei, drei, vier, fünf, sechs, sieben, acht, neun, zehn...' },
        { title: 'Common Phrases', content: 'Wie geht es dir? (How are you?), Wo ist? (Where is?), Ich heiße... (My name is...)' },
        { title: 'Days of Week', content: 'Montag, Dienstag, Mittwoch, Donnerstag, Freitag, Samstag, Sonntag' },
        { title: 'Colors', content: 'Rot (red), Blau (blue), Grün (green), Gelb (yellow), Weiß (white)' }
      ],
      advanced: [
        { title: 'Verb Conjugations', content: 'Sein (to be): bin, bist, ist, sind, seid, sind. Haben (to have): habe, hast, hat, haben, habt, haben' },
        { title: 'Cases (Nominative, Accusative, Dative)', content: 'Der Mann (the man), Den Mann (accusative), Dem Mann (dative)' },
        { title: 'Past Tense (Perfekt)', content: 'Ich habe gesprochen (I spoke), Du hast gegessen (You ate), Er ist gekommen (He came)' },
        { title: 'Complex Sentences', content: 'Obwohl es regnet, gehe ich (Even though it rains, I go). Wenn ich Zeit hätte, würde ich reisen (If I had time, I would travel)' },
        { title: 'Idiomatic Expressions', content: 'Das ist nicht mein Bier (That\'s not my problem), Alles klar (All clear/OK)' }
      ]
    },
    dailyGoal: 5,
    openSourceLinks: [
      { name: 'Duolingo German', url: 'https://www.duolingo.com/course/de/en/Learn-German' },
      { name: 'Deutsche Welle', url: 'https://www.dw.com/en/learn-german/s-2469' },
      { name: 'Memrise German', url: 'https://www.memrise.com/courses/english/german/' }
    ]
  },
  japanese: {
    name: 'Japanese',
    flag: '🇯🇵',
    code: 'ja',
    difficulty: 'Hard',
    speakers: '125M',
    resources: {
      basic: [
        { title: 'Greetings & Basics', content: 'こんにちは (Konnichiwa - Hello), さようなら (Sayonara - Goodbye), ありがとう (Arigatou - Thank you)' },
        { title: 'Hiragana Basics', content: 'あ (a), い (i), う (u), え (e), お (o), か (ka), き (ki), く (ku)...' },
        { title: 'Numbers 1-20', content: '一 (ichi), 二 (ni), 三 (san), 四 (shi/yon), 五 (go), 六 (roku)...' },
        { title: 'Common Phrases', content: 'お元気ですか? (Ogenki desu ka? - How are you?), 名前は...です (Namae wa... desu - My name is...)' },
        { title: 'Days of Week', content: '月曜日 (Getsuyoubi - Monday), 火曜日 (Kayoubi - Tuesday), 水曜日 (Suiyoubi - Wednesday)...' }
      ],
      advanced: [
        { title: 'Kanji Characters', content: '人 (person), 日 (day/sun), 月 (month/moon), 水 (water), 火 (fire), 木 (tree)' },
        { title: 'Verb Conjugations', content: '食べる (taberu - to eat): 食べます, 食べました, 食べたい, 食べられる' },
        { title: 'Particles', content: 'は (wa - topic), が (ga - subject), を (wo - object), に (ni - direction/time), で (de - location/method)' },
        { title: 'Polite Forms (Keigo)', content: '尊敬語 (sonkeigo - respectful), 謙譲語 (kenjougo - humble), 丁寧語 (teineigo - polite)' },
        { title: 'Complex Sentences', content: '雨が降っても、行きます (Even if it rains, I will go). 時間があれば、旅行します (If I have time, I will travel)' }
      ]
    },
    dailyGoal: 5,
    openSourceLinks: [
      { name: 'Duolingo Japanese', url: 'https://www.duolingo.com/course/ja/en/Learn-Japanese' },
      { name: 'Tae Kim\'s Guide', url: 'https://www.guidetojapanese.org/learn/' },
      { name: 'Memrise Japanese', url: 'https://www.memrise.com/courses/english/japanese/' }
    ]
  },
  mandarin: {
    name: 'Mandarin Chinese',
    flag: '🇨🇳',
    code: 'zh',
    difficulty: 'Hard',
    speakers: '1.1B',
    resources: {
      basic: [
        { title: 'Greetings & Basics', content: '你好 (Nǐ hǎo - Hello), 再见 (Zàijiàn - Goodbye), 谢谢 (Xièxie - Thank you)' },
        { title: 'Pinyin Basics', content: 'a, o, e, i, u, ü. Tones: mā (mother), má (hemp), mǎ (horse), mà (scold)' },
        { title: 'Numbers 1-20', content: '一 (yī), 二 (èr), 三 (sān), 四 (sì), 五 (wǔ), 六 (liù)...' },
        { title: 'Common Phrases', content: '你好吗? (Nǐ hǎo ma? - How are you?), 我叫... (Wǒ jiào... - My name is...)' },
        { title: 'Basic Characters', content: '人 (rén - person), 大 (dà - big), 小 (xiǎo - small), 好 (hǎo - good)' }
      ],
      advanced: [
        { title: 'Complex Characters', content: '学 (xué - learn), 生 (shēng - life/student), 学校 (xuéxiào - school)' },
        { title: 'Grammar Patterns', content: '是...的 (shì...de - emphasis), 把 (bǎ - object marker), 被 (bèi - passive)' },
        { title: 'Measure Words', content: '个 (gè - general), 本 (běn - books), 张 (zhāng - paper), 只 (zhī - animals)' },
        { title: 'Tones & Pronunciation', content: 'Master 4 tones + neutral tone. Practice tone combinations and tone sandhi' },
        { title: 'Idiomatic Expressions', content: '马马虎虎 (mǎmǎhūhū - so-so), 加油 (jiāyóu - come on/good luck)' }
      ]
    },
    dailyGoal: 5,
    openSourceLinks: [
      { name: 'Duolingo Chinese', url: 'https://www.duolingo.com/course/zh/en/Learn-Chinese' },
      { name: 'ChinesePod', url: 'https://www.chinesepod.com/' },
      { name: 'Memrise Chinese', url: 'https://www.memrise.com/courses/english/chinese/' }
    ]
  },
  italian: {
    name: 'Italian',
    flag: '🇮🇹',
    code: 'it',
    difficulty: 'Medium',
    speakers: '85M',
    resources: {
      basic: [
        { title: 'Greetings & Basics', content: 'Ciao (Hello/Goodbye), Arrivederci (Goodbye), Grazie (Thank you), Per favore (Please)' },
        { title: 'Numbers 1-20', content: 'Uno, due, tre, quattro, cinque, sei, sette, otto, nove, dieci...' },
        { title: 'Common Phrases', content: 'Come stai? (How are you?), Dove è? (Where is?), Mi chiamo... (My name is...)' },
        { title: 'Days of Week', content: 'Lunedì, Martedì, Mercoledì, Giovedì, Venerdì, Sabato, Domenica' },
        { title: 'Colors', content: 'Rosso (red), Blu (blue), Verde (green), Giallo (yellow), Bianco (white)' }
      ],
      advanced: [
        { title: 'Verb Conjugations', content: 'Essere (to be): sono, sei, è, siamo, siete, sono. Avere (to have): ho, hai, ha, abbiamo, avete, hanno' },
        { title: 'Past Tense (Passato Prossimo)', content: 'Ho parlato (I spoke), Hai mangiato (You ate), Ha finito (He finished)' },
        { title: 'Subjunctive Mood', content: 'Spero che tu venga (I hope you come). Voglio che tu studi (I want you to study)' },
        { title: 'Complex Sentences', content: 'Anche se piove, esco (Even if it rains, I go out). Se avessi tempo, viaggerei (If I had time, I would travel)' },
        { title: 'Idiomatic Expressions', content: 'In bocca al lupo (Good luck), Buon appetito (Enjoy your meal), A presto (See you soon)' }
      ]
    },
    dailyGoal: 5,
    openSourceLinks: [
      { name: 'Duolingo Italian', url: 'https://www.duolingo.com/course/it/en/Learn-Italian' },
      { name: 'Memrise Italian', url: 'https://www.memrise.com/courses/english/italian/' }
    ]
  },
  portuguese: {
    name: 'Portuguese',
    flag: '🇵🇹',
    code: 'pt',
    difficulty: 'Medium',
    speakers: '260M',
    resources: {
      basic: [
        { title: 'Greetings & Basics', content: 'Olá (Hello), Tchau (Goodbye), Obrigado/a (Thank you), Por favor (Please)' },
        { title: 'Numbers 1-20', content: 'Um, dois, três, quatro, cinco, seis, sete, oito, nove, dez...' },
        { title: 'Common Phrases', content: 'Como está? (How are you?), Onde está? (Where is?), Me chamo... (My name is...)' },
        { title: 'Days of Week', content: 'Segunda-feira, Terça-feira, Quarta-feira, Quinta-feira, Sexta-feira, Sábado, Domingo' },
        { title: 'Colors', content: 'Vermelho (red), Azul (blue), Verde (green), Amarelo (yellow), Branco (white)' }
      ],
      advanced: [
        { title: 'Verb Conjugations', content: 'Ser (to be): sou, és, é, somos, sois, são. Estar (to be): estou, estás, está, estamos, estais, estão' },
        { title: 'Past Tense', content: 'Falei (I spoke), Falaste, Falou, Falamos, Falastes, Falaram' },
        { title: 'Subjunctive Mood', content: 'Espero que você venha (I hope you come). Quero que você estude (I want you to study)' },
        { title: 'Complex Sentences', content: 'Mesmo que chova, vou sair (Even if it rains, I will go out)' },
        { title: 'Idiomatic Expressions', content: 'Quebrar o gelo (to break the ice), Estar na lua (to be daydreaming)' }
      ]
    },
    dailyGoal: 5,
    openSourceLinks: [
      { name: 'Duolingo Portuguese', url: 'https://www.duolingo.com/course/pt/en/Learn-Portuguese' },
      { name: 'Memrise Portuguese', url: 'https://www.memrise.com/courses/english/portuguese/' }
    ]
  },
  korean: {
    name: 'Korean',
    flag: '🇰🇷',
    code: 'ko',
    difficulty: 'Hard',
    speakers: '80M',
    resources: {
      basic: [
        { title: 'Greetings & Basics', content: '안녕하세요 (Annyeonghaseyo - Hello), 안녕히 가세요 (Annyeonghi gaseyo - Goodbye), 감사합니다 (Gamsahamnida - Thank you)' },
        { title: 'Hangul Basics', content: 'ㄱ (g/k), ㄴ (n), ㄷ (d/t), ㄹ (r/l), ㅁ (m), ㅂ (b/p), ㅅ (s), ㅇ (ng), ㅈ (j), ㅊ (ch)...' },
        { title: 'Numbers 1-20', content: '일 (il), 이 (i), 삼 (sam), 사 (sa), 오 (o), 육 (yuk)...' },
        { title: 'Common Phrases', content: '어떻게 지내세요? (Eotteoke jinaeseyo? - How are you?), 제 이름은...입니다 (Je ireumeun...imnida - My name is...)' },
        { title: 'Days of Week', content: '월요일 (Woryoil - Monday), 화요일 (Hwayoil - Tuesday), 수요일 (Suyoil - Wednesday)...' }
      ],
      advanced: [
        { title: 'Honorifics & Politeness', content: 'Formal: -습니다/-ㅂ니다, Polite: -아요/-어요, Casual: -아/-어' },
        { title: 'Verb Conjugations', content: '가다 (gada - to go): 가요, 갑니다, 갔어요, 갈 거예요' },
        { title: 'Particles', content: '은/는 (topic), 이/가 (subject), 을/를 (object), 에 (location/time), 에서 (from/at)' },
        { title: 'Complex Sentences', content: '비가 와도 갈 거예요 (Even if it rains, I will go). 시간이 있으면 여행할 거예요 (If I have time, I will travel)' },
        { title: 'Idiomatic Expressions', content: '눈이 높다 (to have high standards), 귀가 가렵다 (ears are itchy - someone is talking about you)' }
      ]
    },
    dailyGoal: 5,
    openSourceLinks: [
      { name: 'Duolingo Korean', url: 'https://www.duolingo.com/course/ko/en/Learn-Korean' },
      { name: 'Talk To Me In Korean', url: 'https://talktomeinkorean.com/' },
      { name: 'Memrise Korean', url: 'https://www.memrise.com/courses/english/korean/' }
    ]
  },
  arabic: {
    name: 'Arabic',
    flag: '🇸🇦',
    code: 'ar',
    difficulty: 'Hard',
    speakers: '420M',
    resources: {
      basic: [
        { title: 'Greetings & Basics', content: 'مرحبا (Marhaba - Hello), مع السلامة (Ma\'a as-salama - Goodbye), شكرا (Shukran - Thank you)' },
        { title: 'Arabic Alphabet', content: 'ا (alif), ب (ba), ت (ta), ث (tha), ج (jim), ح (ha), خ (kha)...' },
        { title: 'Numbers 1-20', content: 'واحد (wahid), اثنان (ithnan), ثلاثة (thalatha), أربعة (arba\'a), خمسة (khamsa)...' },
        { title: 'Common Phrases', content: 'كيف حالك? (Kayf halak? - How are you?), أين هو? (Ayna huwa? - Where is he?)' },
        { title: 'Days of Week', content: 'الاثنين (al-ithnayn - Monday), الثلاثاء (al-thulatha - Tuesday), الأربعاء (al-arba\'a - Wednesday)...' }
      ],
      advanced: [
        { title: 'Root System', content: 'كتب (k-t-b - write): كاتب (writer), كتاب (book), مكتبة (library), مكتب (office)' },
        { title: 'Verb Conjugations', content: 'كتب (kataba - he wrote): كتبت (katabtu - I wrote), كتبت (katabta - you wrote)' },
        { title: 'Cases & Declension', content: 'Nominative: -u, Accusative: -a, Genitive: -i' },
        { title: 'Complex Sentences', content: 'على الرغم من المطر، سأذهب (Even though it rains, I will go)' },
        { title: 'Idiomatic Expressions', content: 'في نفس القارب (in the same boat), بين عشية وضحاها (overnight)' }
      ]
    },
    dailyGoal: 5,
    openSourceLinks: [
      { name: 'Duolingo Arabic', url: 'https://www.duolingo.com/course/ar/en/Learn-Arabic' },
      { name: 'Memrise Arabic', url: 'https://www.memrise.com/courses/english/arabic/' }
    ]
  }
};

const LanguageLearning = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [level, setLevel] = useState('basic'); // basic or advanced
  const [currentLesson, setCurrentLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [streak, setStreak] = useState(0);
  const [dailyProgress, setDailyProgress] = useState(0);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    // Load saved progress from localStorage
    const savedProgress = localStorage.getItem('languageLearningProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setCompletedLessons(progress.completedLessons || []);
      setStreak(progress.streak || 0);
      setDailyProgress(progress.dailyProgress || 0);
    }
  }, []);

  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
    setCurrentLesson(0);
    setLevel('basic');
  };

  const handleLessonClick = (lesson, index) => {
    setSelectedLesson({ ...lesson, index, language: selectedLanguage, level });
    setLessonDialogOpen(true);
  };

  const handleCompleteLesson = () => {
    const lessonKey = `${selectedLanguage}-${level}-${selectedLesson.index}`;
    if (!completedLessons.includes(lessonKey)) {
      const newCompleted = [...completedLessons, lessonKey];
      setCompletedLessons(newCompleted);
      setDailyProgress(prev => Math.min(prev + 1, 5));
      
      // Save to localStorage
      const progress = {
        completedLessons: newCompleted,
        streak: dailyProgress === 4 ? streak + 1 : streak, // Increment streak if completed daily goal
        dailyProgress: dailyProgress + 1
      };
      localStorage.setItem('languageLearningProgress', JSON.stringify(progress));
      
      if (dailyProgress === 4) {
        setStreak(prev => prev + 1);
      }
    }
    setLessonDialogOpen(false);
  };

  const getLanguageData = () => {
    return selectedLanguage ? LANGUAGES[selectedLanguage] : null;
  };

  const getCurrentLessons = () => {
    const langData = getLanguageData();
    if (!langData) return [];
    return level === 'basic' ? langData.resources.basic : langData.resources.advanced;
  };

  const getProgress = () => {
    const lessons = getCurrentLessons();
    const completed = lessons.filter((_, index) => 
      completedLessons.includes(`${selectedLanguage}-${level}-${index}`)
    ).length;
    return lessons.length > 0 ? (completed / lessons.length) * 100 : 0;
  };

  return (
    <Box>
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2d3748', mb: 0.5 }}>
            Language Learning
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Learn multiple languages with daily lessons - Basic to Advanced levels
          </Typography>
        </Box>

        {!selectedLanguage ? (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
              Select a Language to Start Learning
            </Typography>
            <Grid container spacing={3}>
              {Object.entries(LANGUAGES).map(([code, lang]) => (
                <Grid item xs={12} sm={6} md={4} key={code}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '2px solid transparent',
                      '&:hover': {
                        boxShadow: 8,
                        transform: 'translateY(-4px)',
                        borderColor: '#667eea',
                      },
                    }}
                    onClick={() => handleLanguageSelect(code)}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Typography variant="h2" sx={{ mb: 2 }}>
                        {lang.flag}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        {lang.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 2 }}>
                        <Chip
                          label={lang.difficulty}
                          size="small"
                          color={lang.difficulty === 'Easy' ? 'success' : lang.difficulty === 'Medium' ? 'warning' : 'error'}
                        />
                        <Chip
                          label={`${lang.speakers} speakers`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {lang.resources.basic.length} Basic Lessons
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {lang.resources.advanced.length} Advanced Lessons
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          <Box>
            {/* Language Header */}
            <Box
              sx={{
                mb: 4,
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba205 100%)',
                border: '2px solid #667eea40',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
              }}
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ fontSize: '2rem' }}>{getLanguageData().flag}</span>
                  {getLanguageData().name}
                </Typography>
                <Button
                  size="small"
                  onClick={() => setSelectedLanguage(null)}
                  sx={{ mt: 1 }}
                >
                  Change Language
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea' }}>
                    {streak}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Day Streak
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    {dailyProgress}/{getLanguageData().dailyGoal}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today's Progress
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Level Selector */}
            <Tabs value={level === 'basic' ? 0 : 1} onChange={(e, newValue) => setLevel(newValue === 0 ? 'basic' : 'advanced')} sx={{ mb: 3 }}>
              <Tab icon={<SchoolIcon />} label="Basic Level" />
              <Tab icon={<TrendingUpIcon />} label="Advanced Level" />
            </Tabs>

            {/* Progress Bar */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {level === 'basic' ? 'Basic' : 'Advanced'} Level Progress
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(getProgress())}% Complete
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={getProgress()}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  },
                }}
              />
            </Box>

            {/* Lessons Grid */}
            <Grid container spacing={3}>
              {getCurrentLessons().map((lesson, index) => {
                const lessonKey = `${selectedLanguage}-${level}-${index}`;
                const isCompleted = completedLessons.includes(lessonKey);
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: isCompleted ? '2px solid #4caf50' : '2px solid transparent',
                        '&:hover': {
                          boxShadow: 6,
                          transform: 'translateY(-4px)',
                        },
                      }}
                      onClick={() => handleLessonClick(lesson, index)}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Lesson {index + 1}
                          </Typography>
                          {isCompleted && (
                            <CheckCircleIcon sx={{ color: '#4caf50' }} />
                          )}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#667eea' }}>
                          {lesson.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {lesson.content.substring(0, 100)}...
                        </Typography>
                        <Chip
                          label={level === 'basic' ? 'Basic' : 'Advanced'}
                          size="small"
                          color={level === 'basic' ? 'primary' : 'secondary'}
                        />
                      </CardContent>
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button
                          size="small"
                          startIcon={<PlayIcon />}
                          variant={isCompleted ? 'outlined' : 'contained'}
                          fullWidth
                          sx={{
                            background: isCompleted ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: isCompleted ? '#4caf50' : 'white',
                            borderColor: isCompleted ? '#4caf50' : 'transparent',
                          }}
                        >
                          {isCompleted ? 'Review Lesson' : 'Start Lesson'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {/* Open Source Resources */}
            <Divider sx={{ my: 4 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                📚 Open Source Learning Resources
              </Typography>
              <Grid container spacing={2}>
                {getLanguageData().openSourceLinks.map((resource, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {resource.name}
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          fullWidth
                        >
                          Visit Resource
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Lesson Detail Dialog */}
      <Dialog
        open={lessonDialogOpen}
        onClose={() => setLessonDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }
        }}
      >
        {selectedLesson && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {selectedLesson.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={LANGUAGES[selectedLesson.language].name}
                      size="small"
                      sx={{ backgroundColor: '#667eea', color: 'white' }}
                    />
                    <Chip
                      label={selectedLesson.level === 'basic' ? 'Basic' : 'Advanced'}
                      size="small"
                      color={selectedLesson.level === 'basic' ? 'primary' : 'secondary'}
                    />
                  </Box>
                </Box>
                <IconButton onClick={() => setLessonDialogOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: '#f5f5f5',
                  mb: 3,
                  border: '1px solid #e0e0e0'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2d3748' }}>
                  Lesson Content:
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, color: '#2d3748' }}>
                  {selectedLesson.content}
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>💡 Learning Tip:</strong> Practice speaking these words/phrases out loud. 
                  Repeat them multiple times to improve pronunciation and memory retention.
                </Typography>
              </Alert>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Practice Exercises:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="1. Read the lesson content out loud 3 times"
                      secondary="Focus on correct pronunciation"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="2. Write down the key phrases"
                      secondary="Practice writing helps with memory"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="3. Try to use these phrases in sentences"
                      secondary="Create your own examples"
                    />
                  </ListItem>
                </List>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2 }}>
              <Button onClick={() => setLessonDialogOpen(false)}>
                Close
              </Button>
              <Button
                variant="contained"
                onClick={handleCompleteLesson}
                startIcon={<CheckCircleIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Mark as Complete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default LanguageLearning;

