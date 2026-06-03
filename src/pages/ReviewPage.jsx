import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Award, 
  Calendar, 
  Sparkles, 
  ArrowLeft,
  ArrowRight, 
  Volume2,
  Flame
} from 'lucide-react';
import { useVocabularyStore } from '../store/vocabularyStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/common/Button';
import confetti from 'canvas-confetti';

const TOPICS = [
  {
    id: 'greetings',
    title: "Chủ đề 1: Chào hỏi & Giao tiếp",
    desc: "Học cách chào hỏi, cảm ơn, xin lỗi và giới thiệu bản thân.",
    words: [
      { text: "你好", pinyin: "nǐ hǎo", translation: "Xin chào" },
      { text: "谢谢", pinyin: "xièxie", translation: "Cảm ơn" },
      { text: "再见", pinyin: "zàijiàn", translation: "Tạm biệt" },
      { text: "对不起", pinyin: "duìbuqǐ", translation: "Xin lỗi" },
      { text: "没关系", pinyin: "méi guānxi", translation: "Không sao đâu" },
    ]
  },
  {
    id: 'family',
    title: "Chủ đề 2: Gia đình & Bạn bè",
    desc: "Các từ vựng về thành viên gia đình và các mối quan hệ xã hội.",
    words: [
      { text: "爸爸", pinyin: "bàba", translation: "Bố / Cha" },
      { text: "妈妈", pinyin: "māma", translation: "Mẹ" },
      { text: "哥哥", pinyin: "gēge", translation: "Anh trai" },
      { text: "姐姐", pinyin: "jiějie", translation: "Chị gái" },
      { text: "朋友", pinyin: "péngyou", translation: "Bạn bè" },
    ]
  },
  {
    id: 'food',
    title: "Chủ đề 3: Ẩm thực & Ăn uống",
    desc: "Cách gọi tên các món ăn, đồ uống quen thuộc hằng ngày.",
    words: [
      { text: "米饭", pinyin: "mǐfàn", translation: "Cơm" },
      { text: "咖啡", pinyin: "kāfēi", translation: "Cà phê" },
      { text: "茶", pinyin: "chá", translation: "Trà" },
      { text: "苹果", pinyin: "píngguǒ", translation: "Quả táo" },
      { text: "喜欢", pinyin: "xǐhuan", translation: "Thích" },
    ]
  },
  {
    id: 'weather',
    title: "Chủ đề 4: Thời tiết & Địa điểm",
    desc: "Hỏi và trả lời về thời tiết, các địa điểm trong thành phố.",
    words: [
      { text: "今天", pinyin: "jīntiān", translation: "Hôm nay" },
      { text: "下雨", pinyin: "xiàyǔ", translation: "Mưa" },
      { text: "学校", pinyin: "xuéxiào", translation: "Trường học" },
      { text: "商店", pinyin: "shāngdiàn", translation: "Cửa hàng" },
      { text: "北京", pinyin: "Běijīng", translation: "Bắc Kinh" },
    ]
  }
];

export function ReviewPage() {
  const navigate = useNavigate();
  const { vocabList, reviewWord, getReviewQueue } = useVocabularyStore();
  const { user, addXp, updateProfile } = useAuthStore();

  // Review System State
  const [activeSession, setActiveSession] = useState(null); // 'srs' or 'writing' or 'topic-review'
  const [sessionQueue, setSessionQueue] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isAnswerShown, setIsAnswerShown] = useState(false);
  const [writingInput, setWritingInput] = useState('');
  const [writingResult, setWritingResult] = useState(null); // 'correct' or 'incorrect' or null
  const [sessionXpEarned, setSessionXpEarned] = useState(0);

  // Topic Progress State
  const [activeTopic, setActiveTopic] = useState(null);
  const [completedWords, setCompletedWords] = useState([]);
  const [topicProgress, setTopicProgress] = useState(() => {
    const saved = localStorage.getItem('hanora_topic_progress');
    return saved ? JSON.parse(saved) : { greetings: 0, family: 0, food: 0, weather: 0 };
  });

  useEffect(() => {
    localStorage.setItem('hanora_topic_progress', JSON.stringify(topicProgress));
  }, [topicProgress]);

  // Topic Test State
  const [testTopic, setTestTopic] = useState(null);
  const [testStep, setTestStep] = useState(0); // 0 to 4 for questions, 5 for grading results
  const [testQuestions, setTestQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({}); // { 0: '...', 1: '...', 2: '...', 3: '...' }
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]); // array of matched wordIdx
  const [mismatchedPair, setMismatchedPair] = useState(null); // [leftCardId, rightCardId]
  const [matchingErrors, setMatchingErrors] = useState(0);
  const [topicTestScores, setTopicTestScores] = useState(() => {
    const saved = localStorage.getItem('hanora_topic_test_scores');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('hanora_topic_test_scores', JSON.stringify(topicTestScores));
  }, [topicTestScores]);

  // Motivational Quotes
  const quotes = [
    "Học một ngoại ngữ mới là có thêm một cửa sổ để nhìn ngắm thế giới.",
    "Hành trình vạn dặm bắt đầu từ một bước chân nhỏ bé.",
    "Ôn cũ biết mới, có thể làm thầy người khác vậy. (Khổng Tử)",
    "Học tập như bơi thuyền ngược dòng, không tiến ắt sẽ lùi.",
    "Mỗi ngày tích lũy thêm một ít từ vựng, thành công sẽ tự đến gõ cửa."
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * quotes.length));
  }, []);

  // Keyboard navigation for review sessions
  useEffect(() => {
    if (activeSession !== 'srs' && activeSession !== 'topic-review') return;
    
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!isAnswerShown) {
          setIsAnswerShown(true);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (isAnswerShown) {
          if (activeSession === 'srs') handleSrsReviewRate(false);
          else if (activeSession === 'topic-review') handleTopicReviewRate(false);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (!isAnswerShown) {
          setIsAnswerShown(true);
        } else {
          if (activeSession === 'srs') handleSrsReviewRate(true);
          else if (activeSession === 'topic-review') handleTopicReviewRate(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSession, isAnswerShown, sessionQueue, currentIdx, completedWords]);

  // SRS States
  const dueList = getReviewQueue();
  const masteredCount = vocabList.filter(w => w.srsLevel >= 3).length;
  const learningCount = vocabList.filter(w => w.srsLevel < 3).length;

  // Spaced Repetition Session Handlers
  const startSrsReview = () => {
    const queue = [...dueList];
    if (queue.length === 0) return;
    setSessionQueue(queue);
    setCurrentIdx(0);
    setIsAnswerShown(false);
    setActiveSession('srs');
    setSessionXpEarned(0);
  };

  const handleSrsReviewRate = (remembered) => {
    const currentWord = sessionQueue[currentIdx];
    
    if (remembered) {
      reviewWord(currentWord.text, 'easy');
      addXp(10);
      setSessionXpEarned(prev => prev + 10);
      
      if (currentIdx < sessionQueue.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setIsAnswerShown(false);
      } else {
        // Finished all reviews!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setActiveSession('finished-srs');
      }
    } else {
      reviewWord(currentWord.text, 'hard');
      addXp(2); // Small XP for trying
      setSessionXpEarned(prev => prev + 2);
      
      // Append word to the end of the queue to study again!
      const updatedQueue = [...sessionQueue, currentWord];
      setSessionQueue(updatedQueue);
      
      setCurrentIdx(currentIdx + 1);
      setIsAnswerShown(false);
    }
  };

  // Writing Test Game Handlers
  const startWritingQuiz = () => {
    // Pick 5 random words from the vocabulary list
    const shuffled = [...vocabList].sort(() => 0.5 - Math.random());
    const queue = shuffled.slice(0, 5);
    setSessionQueue(queue);
    setCurrentIdx(0);
    setWritingInput('');
    setWritingResult(null);
    setActiveSession('writing');
    setSessionXpEarned(0);
  };

  const handleCheckWriting = (e) => {
    e.preventDefault();
    if (!writingInput.trim()) return;

    const currentWord = sessionQueue[currentIdx];
    const isCorrect = writingInput.trim() === currentWord.text;
    
    if (isCorrect) {
      setWritingResult('correct');
      addXp(10);
      setSessionXpEarned(prev => prev + 10);
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.8 }
      });
    } else {
      setWritingResult('incorrect');
    }
  };

  const handleNextWriting = () => {
    if (currentIdx < sessionQueue.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setWritingInput('');
      setWritingResult(null);
    } else {
      setActiveSession('finished-writing');
    }
  };

  const startTopicSession = (topic) => {
    setActiveTopic(topic);
    const progress = topicProgress[topic.id] || 0;
    const startIdx = progress >= topic.words.length ? 0 : progress;
    
    // Initialize completedWords with the words before startIdx
    const initialCompleted = topic.words.slice(0, startIdx).map(w => w.text);
    setCompletedWords(initialCompleted);

    setSessionQueue(topic.words);
    setCurrentIdx(startIdx);
    setIsAnswerShown(false);
    setActiveSession('topic-review');
    setSessionXpEarned(0);
  };

  const handleTopicReviewRate = (remembered) => {
    const currentWord = sessionQueue[currentIdx];
    
    if (remembered) {
      addXp(10);
      setSessionXpEarned(prev => prev + 10);
      
      // Track unique completed words in this session
      const nextCompleted = completedWords.includes(currentWord.text) 
        ? completedWords 
        : [...completedWords, currentWord.text];
      setCompletedWords(nextCompleted);

      // Unique count from activeTopic
      const uniqueCompletedCount = activeTopic.words.filter(w => 
        nextCompleted.includes(w.text)
      ).length;
      
      setTopicProgress(prev => ({
        ...prev,
        [activeTopic.id]: Math.max(prev[activeTopic.id] || 0, uniqueCompletedCount)
      }));
  
      if (currentIdx < sessionQueue.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setIsAnswerShown(false);
      } else {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setActiveSession('finished-topic');
      }
    } else {
      addXp(2); // Small XP for trying
      setSessionXpEarned(prev => prev + 2);
      
      // Append word to study again
      const updatedQueue = [...sessionQueue, currentWord];
      setSessionQueue(updatedQueue);
      
      setCurrentIdx(currentIdx + 1);
      setIsAnswerShown(false);
    }
  };

  const resetTopicProgress = (topicId, e) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa tiến trình của chủ đề này và học lại từ đầu?")) {
      setTopicProgress(prev => ({
        ...prev,
        [topicId]: 0
      }));
    }
  };

  const generateTopicTest = (topic) => {
    const words = topic.words; // 5 words
    
    // Q1: Multiple choice (meaning of words[0])
    const q1Correct = words[0].translation;
    const q1WrongOptions = words.slice(1).map(w => w.translation);
    const q1Options = [q1Correct, ...q1WrongOptions].sort(() => Math.random() - 0.5);

    // Q2: Multiple choice (Hanzi of words[1])
    const q2Correct = words[1].text;
    const q2WrongOptions = [words[0], ...words.slice(2)].map(w => w.text);
    const q2Options = [q2Correct, ...q2WrongOptions].sort(() => Math.random() - 0.5);

    // Q3: FIB (Hanzi of words[2])
    const q3Correct = words[2].text;

    // Q4: FIB (Hanzi of words[3])
    const q4Correct = words[3].text;

    // Q5: Matching (Words 0, 1, 2)
    const matchingWords = [words[0], words[1], words[2]];
    const leftCards = matchingWords.map((w, idx) => ({ id: `left-${idx}`, text: w.text, wordIdx: idx })).sort(() => Math.random() - 0.5);
    const rightCards = matchingWords.map((w, idx) => ({ id: `right-${idx}`, text: w.translation, wordIdx: idx })).sort(() => Math.random() - 0.5);

    return [
      {
        type: 'mc-translation',
        word: words[0],
        prompt: `Nghĩa của từ "${words[0].text}" (${words[0].pinyin}) là gì?`,
        options: q1Options,
        correct: q1Correct
      },
      {
        type: 'mc-hanzi',
        word: words[1],
        prompt: `Chữ Hán nào tương ứng với nghĩa "${words[1].translation}" (${words[1].pinyin})?`,
        options: q2Options,
        correct: q2Correct
      },
      {
        type: 'fib-hanzi',
        word: words[2],
        prompt: `Điền chữ Hán tương ứng với nghĩa: "${words[2].translation}" (${words[2].pinyin})`,
        correct: q3Correct
      },
      {
        type: 'fib-hanzi',
        word: words[3],
        prompt: `Điền chữ Hán tương ứng với nghĩa: "${words[3].translation}" (${words[3].pinyin})`,
        correct: q4Correct
      },
      {
        type: 'matching',
        words: matchingWords,
        leftCards,
        rightCards
      }
    ];
  };

  const startTopicTest = (topic) => {
    setTestTopic(topic);
    const questions = generateTopicTest(topic);
    setTestQuestions(questions);
    setTestStep(0);
    setUserAnswers({});
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedPairs([]);
    setMismatchedPair(null);
    setMatchingErrors(0);
    setSessionXpEarned(0);
    setActiveSession('topic-test');
  };

  const handleSelectOption = (option) => {
    setUserAnswers(prev => ({
      ...prev,
      [testStep]: option
    }));
  };

  const handleFibChange = (val) => {
    setUserAnswers(prev => ({
      ...prev,
      [testStep]: val
    }));
  };

  const checkMatch = (left, right) => {
    if (left.wordIdx === right.wordIdx) {
      // Correct Match
      setMatchedPairs(prev => [...prev, left.wordIdx]);
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      // Incorrect Match
      setMatchingErrors(prev => prev + 1);
      setMismatchedPair([left.id, right.id]);
      setTimeout(() => {
        setMismatchedPair(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 800);
    }
  };

  const handleLeftCardClick = (card) => {
    if (mismatchedPair) return;
    if (matchedPairs.includes(card.wordIdx)) return;

    if (selectedLeft?.id === card.id) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(card);
      if (selectedRight) {
        checkMatch(card, selectedRight);
      }
    }
  };

  const handleRightCardClick = (card) => {
    if (mismatchedPair) return;
    if (matchedPairs.includes(card.wordIdx)) return;

    if (selectedRight?.id === card.id) {
      setSelectedRight(null);
    } else {
      setSelectedRight(card);
      if (selectedLeft) {
        checkMatch(selectedLeft, card);
      }
    }
  };

  const calculateTestScore = () => {
    if (testQuestions.length === 0) return 0;
    
    // Q1 - Q4: 1 point each
    let score = 0;
    if (userAnswers[0] === testQuestions[0].correct) score += 1;
    if (userAnswers[1] === testQuestions[1].correct) score += 1;
    if (userAnswers[2]?.trim() === testQuestions[2].correct) score += 1;
    if (userAnswers[3]?.trim() === testQuestions[3].correct) score += 1;

    // Q5 (Matching): 1 point if 0 errors, 0.5 points if 1 error, 0 points if > 1 error
    if (matchingErrors === 0) {
      score += 1.0;
    } else if (matchingErrors === 1) {
      score += 0.5;
    }

    return score;
  };

  const finishTopicTest = () => {
    const score = calculateTestScore();
    const currentMax = topicTestScores[testTopic.id] || 0;
    if (score > currentMax) {
      setTopicTestScores(prev => ({
        ...prev,
        [testTopic.id]: score
      }));
    }

    // Award XP: score * 10
    const xpAwarded = Math.round(score * 10);
    addXp(xpAwarded);
    setSessionXpEarned(xpAwarded);

    if (score >= 4) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    setTestStep(5); // Show results screen
  };

  const speakWord = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Study reminder is automated at fixed 20:00 time website-wide

  const getWeekDays = () => {
    return [
      { value: 1, label: "T2" },
      { value: 2, label: "T3" },
      { value: 3, label: "T4" },
      { value: 4, label: "T5" },
      { value: 5, label: "T6" },
      { value: 6, label: "T7" },
      { value: 0, label: "CN" }
    ];
  };

  // --- STATE 1: SRS SESSION VIEW ---
  if (activeSession === 'srs') {
    const currentWord = sessionQueue[currentIdx];
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6 page-transition">
        <div className="flex justify-between items-center bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Ôn tập Spaced Repetition
            </span>
            <h3 className="text-base font-extrabold text-slate-800 mt-1">Đang ôn tập từ vựng</h3>
          </div>
          <button 
            onClick={() => setActiveSession(null)}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg"
          >
            Thoát
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentIdx) / sessionQueue.length) * 100}%` }}
          ></div>
        </div>

        {/* Card Canvas */}
        <div className="bg-white border border-slate-100 rounded-3xl p-10 shadow-lg flex flex-col items-center justify-center min-h-[350px] text-center relative overflow-hidden">
          <span className="absolute top-5 right-5 text-xs font-bold text-slate-400">
            Từ {currentIdx + 1} / {sessionQueue.length}
          </span>

          {!isAnswerShown ? (
            <div className="space-y-6 flex flex-col items-center">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Nghĩa tiếng Anh</span>
              <p className="text-3xl font-extrabold text-slate-800 font-display px-4">
                {currentWord.translation}
              </p>
              <button
                onClick={() => setIsAnswerShown(true)}
                className="mt-6 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold px-6 py-3 rounded-xl transition-all shadow-md active:scale-95"
              >
                Hiển thị đáp án (Chữ Hán & Pinyin)
              </button>
            </div>
          ) : (
            <div className="space-y-6 flex flex-col items-center w-full">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Từ vựng tương ứng</span>
              
              <div className="space-y-2">
                <p className="text-5xl font-black text-slate-900 font-display">
                  {currentWord.text}
                </p>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-sm font-bold text-blue-600">[{currentWord.pinyin}]</span>
                  <button 
                    onClick={() => speakWord(currentWord.text)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-500 font-medium max-w-sm mt-1">{currentWord.translation}</p>

              {/* Assessment triggers - Left / Right Arrow buttons */}
              <div className="mt-8 pt-6 border-t border-slate-100 w-full space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleSrsReviewRate(false)}
                    className="group bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-2xl py-3.5 px-4 text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm hover:shadow"
                  >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                    <span>Chưa nhớ (Học lại)</span>
                  </button>
                  <button
                    onClick={() => handleSrsReviewRate(true)}
                    className="group bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-600 rounded-2xl py-3.5 px-4 text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm hover:shadow"
                  >
                    <span>Đã nhớ (Xong)</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 font-semibold text-center flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-100 py-2.5 rounded-xl px-4 leading-relaxed">
                  <span>💡 Mẹo: Nhấn phím</span>
                  <kbd className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-black text-[9px] shadow-sm">← Trái</kbd>
                  <span>hoặc</span>
                  <kbd className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-black text-[9px] shadow-sm">Phải →</kbd>
                  <span>trên bàn phím để chọn nhanh!</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- STATE 2: FINISHED SRS SESSION VIEW ---
  if (activeSession === 'finished-srs') {
    return (
      <div className="max-w-md mx-auto py-12 page-transition">
        <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-6 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-md">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800">Hoàn thành buổi học hôm nay!</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">Hệ thống đã điều chỉnh khoảng cách lịch hẹn lặp lại.</p>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-4 inline-flex items-center gap-1.5 text-xs text-slate-600 font-bold">
              Bạn nhận được <span className="text-emerald-600">+{sessionXpEarned} XP</span> tích lũy!
            </div>
          </div>
          <Button variant="primary" onClick={() => setActiveSession(null)} className="w-full">
            Quay lại bảng điều khiển
          </Button>
        </div>
      </div>
    );
  }

  // --- STATE 3: WRITING PRACTICE QUIZ VIEW ---
  if (activeSession === 'writing') {
    const currentWord = sessionQueue[currentIdx];
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6 page-transition">
        <div className="flex justify-between items-center bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Luyện viết chữ Hán
            </span>
            <h3 className="text-base font-extrabold text-slate-800 mt-1">Điền đúng chữ Hán</h3>
          </div>
          <button 
            onClick={() => setActiveSession(null)}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg"
          >
            Thoát
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(currentIdx / sessionQueue.length) * 100}%` }}
          ></div>
        </div>

        {/* Card Canvas */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-lg flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden">
          <span className="absolute top-5 right-5 text-xs font-bold text-slate-400">
            Câu {currentIdx + 1} / {sessionQueue.length}
          </span>

          <div className="w-full max-w-md space-y-6 text-center flex flex-col items-center">
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-widest block">Gợi ý từ vựng</span>
              <p className="text-lg font-bold text-slate-700 select-text">&ldquo;{currentWord.translation}&rdquo;</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-base text-blue-600 font-extrabold">[{currentWord.pinyin}]</span>
                <button 
                  onClick={() => speakWord(currentWord.text)}
                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Answer feedback panel */}
            {writingResult === null ? (
              <form onSubmit={handleCheckWriting} className="w-full space-y-4">
                <input
                  type="text"
                  placeholder="Gõ chữ Hán của từ này..."
                  value={writingInput}
                  onChange={(e) => setWritingInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-center text-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-display transition-all"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setWritingInput(currentWord.text);
                      setWritingResult('incorrect'); // mark as helper reveal
                    }}
                    className="flex-1 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl py-3 text-xs font-bold transition-colors"
                  >
                    Xem đáp án
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-xs font-extrabold transition-all shadow-md"
                  >
                    Kiểm tra
                  </button>
                </div>
              </form>
            ) : (
              <div className="w-full space-y-6 text-center">
                {writingResult === 'correct' ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-600 space-y-1">
                    <CheckCircle className="w-7 h-7 mx-auto text-emerald-500" />
                    <p className="text-sm font-extrabold">Chính xác!</p>
                    <p className="text-xs text-emerald-500/80 font-bold">+10 XP Nhận được</p>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-600 space-y-2">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Đáp án đúng là</p>
                    <p className="text-3xl font-black text-red-700 font-display">{currentWord.text}</p>
                    <p className="text-xs text-red-500 font-medium">Bản gõ của bạn: &quot;{writingInput || 'Trống'}&quot;</p>
                  </div>
                )}

                <button
                  onClick={handleNextWriting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Tiếp tục câu sau</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- STATE 4: FINISHED WRITING SESSION VIEW ---
  if (activeSession === 'finished-writing') {
    return (
      <div className="max-w-md mx-auto py-12 page-transition">
        <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-6 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800">Hoàn thành bài viết Hán tự!</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">Chữ Hán được ghi nhớ tốt hơn khi luyện gõ/viết thủ công.</p>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-4 inline-flex items-center gap-1.5 text-xs text-slate-650 font-bold">
              Cộng tổng <span className="text-blue-600">+{sessionXpEarned} XP</span> vào hồ sơ!
            </div>
          </div>
          <Button variant="primary" onClick={() => setActiveSession(null)} className="w-full">
            Quay lại bảng điều khiển
          </Button>
        </div>
      </div>
    );
  }

  // --- STATE 5: TOPIC REVIEW SESSION VIEW ---
  if (activeSession === 'topic-review') {
    const currentWord = sessionQueue[currentIdx];
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6 page-transition">
        <div className="flex justify-between items-center bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              {activeTopic?.title}
            </span>
            <h3 className="text-base font-extrabold text-slate-800 mt-1">Đang ôn tập từ vựng</h3>
          </div>
          <button 
            onClick={() => setActiveSession(null)}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg"
          >
            Thoát
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(currentIdx / sessionQueue.length) * 100}%` }}
          ></div>
        </div>

        {/* Card Canvas */}
        <div className="bg-white border border-slate-100 rounded-3xl p-10 shadow-lg flex flex-col items-center justify-center min-h-[350px] text-center relative overflow-hidden">
          <span className="absolute top-5 right-5 text-xs font-bold text-slate-400">
            Từ {currentIdx + 1} / {sessionQueue.length}
          </span>

          {!isAnswerShown ? (
            <div className="space-y-6 flex flex-col items-center">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Nghĩa tiếng Việt</span>
              <p className="text-3xl font-extrabold text-slate-800 font-display px-4">
                {currentWord.translation}
              </p>
              <button
                onClick={() => setIsAnswerShown(true)}
                className="mt-6 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold px-6 py-3 rounded-xl transition-all shadow-md active:scale-95"
              >
                Hiển thị đáp án (Chữ Hán & Pinyin)
              </button>
            </div>
          ) : (
            <div className="space-y-6 flex flex-col items-center w-full">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Từ vựng tương ứng</span>
              
              <div className="space-y-2">
                <p className="text-5xl font-black text-slate-900 font-display">
                  {currentWord.text}
                </p>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-sm font-bold text-blue-600">[{currentWord.pinyin}]</span>
                  <button 
                    onClick={() => speakWord(currentWord.text)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-500 font-medium max-w-sm mt-1">{currentWord.translation}</p>

              {/* Assessment triggers - Left / Right Arrow buttons */}
              <div className="mt-8 pt-6 border-t border-slate-100 w-full space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleTopicReviewRate(false)}
                    className="group bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-2xl py-3.5 px-4 text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm hover:shadow"
                  >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                    <span>Chưa nhớ (Học lại)</span>
                  </button>
                  <button
                    onClick={() => handleTopicReviewRate(true)}
                    className="group bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-600 rounded-2xl py-3.5 px-4 text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm hover:shadow"
                  >
                    <span>Đã nhớ (Xong)</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 font-semibold text-center flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-100 py-2.5 rounded-xl px-4 leading-relaxed">
                  <span>💡 Mẹo: Nhấn phím</span>
                  <kbd className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-black text-[9px] shadow-sm">← Trái</kbd>
                  <span>hoặc</span>
                  <kbd className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-black text-[9px] shadow-sm">Phải →</kbd>
                  <span>trên bàn phím để chọn nhanh!</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- STATE 6: FINISHED TOPIC SESSION VIEW ---
  if (activeSession === 'finished-topic') {
    return (
      <div className="max-w-md mx-auto py-12 page-transition">
        <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-6 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-md">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800">Hoàn thành chủ đề học tập!</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">Chúc mừng bạn đã hoàn thành xuất sắc tất cả từ vựng trong &ldquo;{activeTopic?.title}&rdquo;.</p>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-4 inline-flex items-center gap-1.5 text-xs text-slate-600 font-bold">
              Bạn nhận được thêm <span className="text-emerald-600">+{sessionXpEarned} XP</span> tích lũy!
            </div>
          </div>
          <Button variant="primary" onClick={() => setActiveSession(null)} className="w-full">
            Quay lại lộ trình chủ đề
          </Button>
        </div>
      </div>
    );
  }

  // --- STATE 7: TOPIC TEST SESSION VIEW ---
  if (activeSession === 'topic-test') {
    const score = calculateTestScore();
    const isMatchingStep = testQuestions[testStep]?.type === 'matching';
    const canProceed = isMatchingStep 
      ? matchedPairs.length === 3 
      : (userAnswers[testStep] !== undefined && userAnswers[testStep]?.trim() !== '');

    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6 page-transition">
        {/* Style block for shake animation */}
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-4px); }
            40%, 80% { transform: translateX(4px); }
          }
          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }
        `}</style>

        {testStep < 5 ? (
          <>
            {/* Header */}
            <div className="flex justify-between items-center bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  Bài kiểm tra: {testTopic?.title}
                </span>
                <h3 className="text-base font-extrabold text-slate-800 mt-1">Đang đánh giá kiến thức</h3>
              </div>
              <button 
                onClick={() => {
                  if (window.confirm("Bạn có chắc chắn muốn hủy bài kiểm tra này? Tiến trình làm bài sẽ không được lưu.")) {
                    setActiveSession(null);
                  }
                }}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg"
              >
                Hủy bỏ
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-450 px-1">
                <span>Tiến độ bài làm</span>
                <span>Câu {testStep + 1} / 5</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-violet-500 transition-all duration-300"
                  style={{ width: `${((testStep + (isMatchingStep ? matchedPairs.length / 3 : 0)) / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Card Canvas */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-lg flex flex-col justify-center min-h-[380px] relative overflow-hidden">
              <span className="absolute top-5 right-5 text-xs font-bold text-slate-400">
                {isMatchingStep ? "Ghép các cặp từ" : `Câu hỏi ${testStep + 1}`}
              </span>

              <div className="space-y-6">
                {!isMatchingStep && (
                  <div className="text-center space-y-2">
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-widest block">Câu hỏi</span>
                    <p className="text-xl font-extrabold text-slate-800 font-display max-w-lg mx-auto">
                      {testQuestions[testStep]?.prompt}
                    </p>
                  </div>
                )}

                {/* MCQ Question View */}
                {(testQuestions[testStep]?.type === 'mc-translation' || testQuestions[testStep]?.type === 'mc-hanzi') && (
                  <div className="space-y-3 w-full max-w-md mx-auto">
                    {testQuestions[testStep].options.map((option, oIdx) => {
                      const letter = ['A', 'B', 'C', 'D'][oIdx];
                      const isSelected = userAnswers[testStep] === option;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectOption(option)}
                          className={`w-full text-left px-5 py-4 rounded-2xl border text-sm font-semibold transition-all flex items-center gap-4 ${
                            isSelected 
                              ? 'bg-violet-50 border-violet-500 text-violet-750 ring-2 ring-violet-500/10' 
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            isSelected 
                              ? 'bg-violet-600 text-white shadow-sm' 
                              : 'bg-slate-100 text-slate-550'
                          }`}>
                            {letter}
                          </span>
                          <span className="font-medium">{option}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Fill-in-the-blank Question View */}
                {testQuestions[testStep]?.type === 'fib-hanzi' && (
                  <div className="w-full max-w-md mx-auto space-y-4">
                    <input
                      type="text"
                      placeholder="Gõ đáp án chữ Hán..."
                      value={userAnswers[testStep] || ''}
                      onChange={(e) => handleFibChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-center text-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 font-display transition-all"
                      autoFocus
                    />
                    <p className="text-[11px] text-slate-400 text-center font-medium leading-relaxed">
                      💡 Mẹo: Sử dụng bàn phím pinyin tiếng Trung để gõ chính xác chữ Hán của từ vựng này.
                    </p>
                  </div>
                )}

                {/* Word Matching Question View */}
                {isMatchingStep && (
                  <div className="w-full max-w-lg mx-auto space-y-6">
                    <div className="text-center space-y-1">
                      <span className="text-xs text-slate-400 uppercase font-bold tracking-widest block">Câu 5: Nối từ tương ứng</span>
                      <p className="text-sm text-slate-500 font-medium">Ghép nối các chữ Hán với nghĩa tiếng Việt thích hợp</p>
                      <p className="text-[10px] text-red-500 font-bold bg-red-50 border border-red-100 rounded-lg py-1 px-3 inline-block">
                        Số lỗi sai hiện tại: {matchingErrors} lỗi
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-2">
                      {/* Left Column (Hanzi) */}
                      <div className="space-y-3">
                        <div className="text-[10px] text-slate-400 font-bold text-center border-b border-slate-100 pb-1">Chữ Hán</div>
                        {testQuestions[testStep].leftCards.map((card) => {
                          const isMatched = matchedPairs.includes(card.wordIdx);
                          const isSelected = selectedLeft?.id === card.id;
                          const isMismatched = mismatchedPair?.includes(card.id);
                          
                          let cardStyle = "bg-white border-slate-200 text-slate-700 hover:border-violet-300 hover:bg-slate-50";
                          if (isMatched) {
                            cardStyle = "bg-emerald-50 border-emerald-250 text-emerald-700 pointer-events-none opacity-60";
                          } else if (isSelected) {
                            cardStyle = "bg-violet-50 border-violet-500 text-violet-700 ring-2 ring-violet-500/20";
                          } else if (isMismatched) {
                            cardStyle = "bg-rose-50 border-rose-350 text-rose-700 animate-shake";
                          }

                          return (
                            <button
                              key={card.id}
                              onClick={() => handleLeftCardClick(card)}
                              className={`w-full py-4 px-4 rounded-2xl border text-center text-lg font-bold font-display shadow-sm transition-all active:scale-[0.98] ${cardStyle}`}
                            >
                              {card.text}
                            </button>
                          );
                        })}
                      </div>

                      {/* Right Column (Translation) */}
                      <div className="space-y-3">
                        <div className="text-[10px] text-slate-400 font-bold text-center border-b border-slate-100 pb-1">Nghĩa dịch</div>
                        {testQuestions[testStep].rightCards.map((card) => {
                          const isMatched = matchedPairs.includes(card.wordIdx);
                          const isSelected = selectedRight?.id === card.id;
                          const isMismatched = mismatchedPair?.includes(card.id);

                          let cardStyle = "bg-white border-slate-200 text-slate-700 hover:border-violet-300 hover:bg-slate-50";
                          if (isMatched) {
                            cardStyle = "bg-emerald-50 border-emerald-250 text-emerald-700 pointer-events-none opacity-60";
                          } else if (isSelected) {
                            cardStyle = "bg-violet-50 border-violet-500 text-violet-700 ring-2 ring-violet-500/20";
                          } else if (isMismatched) {
                            cardStyle = "bg-rose-50 border-rose-350 text-rose-700 animate-shake";
                          }

                          return (
                            <button
                              key={card.id}
                              onClick={() => handleRightCardClick(card)}
                              className={`w-full py-4 px-4 rounded-2xl border text-center text-xs font-semibold shadow-sm transition-all active:scale-[0.98] h-[60px] flex items-center justify-center ${cardStyle}`}
                            >
                              {card.text}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions inside Card */}
              <div className="mt-8 pt-6 border-t border-slate-150 flex justify-end">
                {testStep < 4 ? (
                  <button
                    onClick={() => setTestStep(testStep + 1)}
                    disabled={!canProceed}
                    className={`px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                      canProceed 
                        ? 'bg-violet-600 hover:bg-violet-500 text-white active:scale-95' 
                        : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Tiếp tục</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={finishTopicTest}
                    disabled={!canProceed}
                    className={`px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                      canProceed 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95' 
                        : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Xem kết quả</span>
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Results Screen */
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-lg space-y-8 text-center max-w-xl mx-auto">
            <div className="space-y-4">
              {/* Score Circular Badge */}
              <div className={`w-28 h-28 rounded-full flex flex-col items-center justify-center mx-auto shadow-md border-4 ${
                score >= 4.5 
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-600' 
                  : score >= 3 
                    ? 'bg-blue-50 border-blue-500 text-blue-600' 
                    : 'bg-amber-50 border-amber-500 text-amber-600'
              }`}>
                <span className="text-3xl font-black">{score}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">/ 5 Điểm</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-800">Hoàn thành bài kiểm tra!</h3>
                <p className="text-xs text-slate-450 font-semibold uppercase tracking-wider">
                  Chủ đề: {testTopic?.title}
                </p>
                <p className="text-sm font-semibold text-slate-650 px-6 pt-1 leading-relaxed">
                  {score >= 4.5 
                    ? "🎉 Xuất sắc! Bạn đã ghi nhớ rất tốt các từ vựng của chủ đề này." 
                    : score >= 3 
                      ? "👍 Khá tốt! Bạn đã nắm được phần lớn từ vựng, hãy phát huy nhé." 
                      : "💪 Đừng nản lòng! Hãy ôn tập thêm các từ chưa thuộc và làm lại bài thi nhé."}
                </p>
              </div>

              {/* XP Awarded */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 inline-flex items-center gap-1.5 text-xs text-slate-650 font-bold">
                Bạn nhận được <span className="text-emerald-600 font-extrabold">+{sessionXpEarned} XP</span> tích lũy!
              </div>
            </div>

            {/* Detailed Question Review */}
            <div className="text-left space-y-4 border-t border-slate-100 pt-6">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-slate-400" />
                Chi tiết bài làm của bạn
              </h4>
              
              <div className="space-y-3.5">
                {testQuestions.map((q, idx) => {
                  if (q.type === 'matching') {
                    const matchingScore = matchingErrors === 0 ? 1.0 : matchingErrors === 1 ? 0.5 : 0;
                    return (
                      <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-500">Câu 5: Nối 3 cặp từ vựng</p>
                          <p className="text-xs text-slate-450 font-medium">Số lỗi sai: <span className="font-bold text-slate-600">{matchingErrors} lỗi</span></p>
                        </div>
                        <div className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
                          matchingScore === 1.0 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : matchingScore === 0.5
                              ? 'bg-blue-50 text-blue-600 border border-blue-100'
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          +{matchingScore} / 1.0đ
                        </div>
                      </div>
                    );
                  }

                  const isCorrect = q.type.startsWith('fib') 
                    ? userAnswers[idx]?.trim() === q.correct
                    : userAnswers[idx] === q.correct;

                  return (
                    <div key={idx} className={`border rounded-2xl p-4 flex justify-between items-start gap-4 ${
                      isCorrect 
                        ? 'bg-emerald-50/30 border-emerald-100' 
                        : 'bg-rose-50/30 border-rose-100'
                    }`}>
                      <div className="space-y-1.5">
                        <p className="text-xs font-bold text-slate-700">Câu {idx + 1}: {q.prompt}</p>
                        <p className="text-xs text-slate-500 font-medium">
                          Đáp án của bạn: <span className={`font-bold ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {userAnswers[idx] || '(Bỏ trống)'}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-xs text-slate-450 font-semibold">
                            Đáp án đúng: <span className="text-slate-650 font-bold">{q.correct}</span>
                          </p>
                        )}
                      </div>

                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                        isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}>
                        {isCorrect ? '✓' : '✗'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-4 border-t border-slate-100 pt-6">
              <button
                onClick={() => startTopicTest(testTopic)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold py-3.5 px-6 rounded-2xl transition-all active:scale-[0.98] shadow-sm"
              >
                Làm lại bài thi
              </button>
              <button
                onClick={() => setActiveSession(null)}
                className="flex-1 bg-violet-600 hover:bg-violet-500 text-white text-xs font-extrabold py-3.5 px-6 rounded-2xl transition-all active:scale-[0.98] shadow-md"
              >
                Quay lại bảng điều khiển
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW 5: MAIN REVIEW PAGE DASHBOARD (DEFAULT VIEW) ---
  return (
    <div className="space-y-8 page-transition max-w-4xl mx-auto py-6">
      
      {/* 1. Dashboard Header Banner */}
      <div className="relative bg-white border border-slate-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_8px_30px_rgba(15,23,42,0.015)] overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-blue-500/5 blur-2xl rounded-full"></div>
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/5 blur-2xl rounded-full"></div>

        <div className="space-y-1.5 relative z-10">
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100/50 px-3 py-1 rounded-full uppercase tracking-wider">
            Trung tâm Ôn tập
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-display">Luyện tập & Ôn tập từ vựng</h2>
          <p className="text-xs text-slate-500 font-medium max-w-2xl leading-relaxed">
            Ôn luyện từ vựng của bạn theo phương pháp lặp lại ngắt quãng (SRS) và thực hành viết chữ Hán. Hệ thống sẽ tự động nhắc học trên website lúc 20:00 hằng ngày.
          </p>
        </div>
        
        {/* Current XP Indicator badge */}
        {user && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shrink-0 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-orange-500/10" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Chuỗi ngày học</p>
              <p className="text-sm font-extrabold text-slate-850">{user.streak} Ngày liên tục</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-8">
          
          {/* Section: Học tập & Ôn tập theo Chủ đề */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Award className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Học tập & Ôn tập theo Chủ đề</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TOPICS.map((topic) => {
                const progress = topicProgress[topic.id] || 0;
                const total = topic.words.length;
                const percent = Math.round((progress / total) * 100);
                const isCompleted = progress >= total;
                const highScore = topicTestScores[topic.id];

                return (
                  <div 
                    key={topic.id}
                    className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[190px] hover:shadow-md hover:border-blue-150 transition-all duration-300 relative overflow-hidden group"
                  >
                    {/* Top Right Badges */}
                    <div className="absolute top-0 right-0 flex items-center gap-1.5 z-10">
                      {isCompleted && (
                        <div className="bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm">
                          ✓ Học xong
                        </div>
                      )}
                      {highScore !== undefined && (
                        <div className={`${isCompleted ? 'rounded-b-lg' : 'rounded-bl-xl'} bg-violet-600 text-white text-[9px] font-black px-3 py-1 uppercase tracking-wider shadow-sm`}>
                          Thi: {highScore}/5
                        </div>
                      )}
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <h4 className="text-base font-extrabold text-slate-850 group-hover:text-blue-600 transition-colors">
                          {topic.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                          {topic.desc}
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-450">
                          <span>Tiến trình học</span>
                          <span className={isCompleted ? "text-emerald-600" : "text-blue-600"}>
                            {progress}/{total} từ ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-355 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-slate-50 w-full gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => startTopicSession(topic)}
                          className="text-[11px] font-extrabold text-blue-600 hover:text-blue-500 flex items-center gap-1 hover:underline transition-colors animate-none"
                        >
                          {progress === 0 ? "Bắt đầu học" : isCompleted ? "Học lại" : "Học tiếp"}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        {progress > 0 && (
                          <button
                            onClick={(e) => resetTopicProgress(topic.id, e)}
                            className="text-[10px] text-slate-400 hover:text-red-500 font-bold hover:underline transition-colors border-l border-slate-200 pl-3"
                            title="Xóa tiến trình chủ đề này"
                          >
                            Xóa
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => startTopicTest(topic)}
                        className="text-[11px] font-extrabold text-violet-650 hover:text-violet-550 flex items-center gap-1 hover:underline transition-colors"
                      >
                        <span>Làm bài thi</span>
                        <Award className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

      </div>
    </div>
  );
}
export default ReviewPage;
