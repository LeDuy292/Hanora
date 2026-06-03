import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Shuffle, 
  Volume2, 
  Trash2, 
  Search, 
  Settings, 
  Info,
  BookOpen,
  FolderOpen,
  GraduationCap,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { useVocabularyStore } from '../store/vocabularyStore';
import { Flashcard } from '../components/vocabulary/Flashcard';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';

export function FlashcardPage() {
  const navigate = useNavigate();
  const { vocabList, removeWord } = useVocabularyStore();

  // Selected deck state (null means show selector, otherwise is the selected deck object)
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  // Search state inside active deck study
  const [searchQuery, setSearchQuery] = useState('');

  // Quizlet Player state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledList, setShuffledList] = useState([]);
  const [translationFirst, setTranslationFirst] = useState(false);

  // Generate study decks dynamically
  const getDecks = () => {
    const decks = [];

    // 1. All saved vocab
    decks.push({
      id: 'all',
      title: 'Tất cả từ vựng',
      description: 'Học toàn bộ từ vựng đã lưu trong sổ tay của bạn.',
      count: vocabList.length,
      type: 'system',
      icon: Layers,
      color: 'from-blue-600 to-sky-500',
      stackColor: 'bg-blue-100/60',
      stackColor2: 'bg-blue-50/70',
      getWords: () => vocabList
    });

    // 2. SRS Due vocab
    const todayStr = new Date().toISOString().split('T')[0];
    const dueWords = vocabList.filter(item => !item.nextReviewDate || item.nextReviewDate <= todayStr);
    if (dueWords.length > 0) {
      decks.push({
        id: 'due',
        title: 'Từ cần ôn tập hôm nay',
        description: 'Tập hợp các từ vựng đã đến lịch hẹn ôn tập theo Spaced Repetition.',
        count: dueWords.length,
        type: 'system',
        icon: Clock,
        color: 'from-amber-500 to-orange-500',
        stackColor: 'bg-amber-100/60',
        stackColor2: 'bg-amber-50/70',
        getWords: () => vocabList.filter(item => !item.nextReviewDate || item.nextReviewDate <= todayStr)
      });
    }

    // 3. Document Decks
    const docGroups = {};
    vocabList.forEach(item => {
      const docTitle = item.documentTitle || 'Từ vựng chung';
      if (!docGroups[docTitle]) {
        docGroups[docTitle] = [];
      }
      docGroups[docTitle].push(item);
    });

    Object.keys(docGroups).forEach((title, idx) => {
      decks.push({
        id: `doc-${idx}`,
        title: title,
        description: title === 'Từ vựng chung' 
          ? 'Các từ vựng chung hệ thống hoặc không thuộc tài liệu cụ thể nào.' 
          : `Học phần từ vựng trích xuất từ tài liệu "${title}".`,
        count: docGroups[title].length,
        type: 'document',
        icon: FolderOpen,
        color: 'from-slate-700 to-slate-550',
        stackColor: 'bg-slate-200/60',
        stackColor2: 'bg-slate-100/70',
        getWords: () => vocabList.filter(item => (item.documentTitle || 'Từ vựng chung') === title)
      });
    });

    // 4. HSK Decks
    const hsk1Words = vocabList.filter(item => item.hsk === 1);
    const hsk2Words = vocabList.filter(item => item.hsk === 2);
    const hsk3Words = vocabList.filter(item => item.hsk === 3);

    if (hsk1Words.length > 0) {
      decks.push({
        id: 'hsk-1',
        title: 'Từ vựng HSK 1',
        description: 'Các từ vựng sơ cấp thuộc khung chuẩn HSK cấp độ 1.',
        count: hsk1Words.length,
        type: 'hsk',
        icon: GraduationCap,
        color: 'from-emerald-500 to-teal-400',
        stackColor: 'bg-emerald-100/60',
        stackColor2: 'bg-emerald-50/70',
        getWords: () => vocabList.filter(item => item.hsk === 1)
      });
    }
    if (hsk2Words.length > 0) {
      decks.push({
        id: 'hsk-2',
        title: 'Từ vựng HSK 2',
        description: 'Các từ vựng trung cấp thuộc khung chuẩn HSK cấp độ 2.',
        count: hsk2Words.length,
        type: 'hsk',
        icon: GraduationCap,
        color: 'from-blue-500 to-indigo-400',
        stackColor: 'bg-blue-100/60',
        stackColor2: 'bg-blue-50/70',
        getWords: () => vocabList.filter(item => item.hsk === 2)
      });
    }
    if (hsk3Words.length > 0) {
      decks.push({
        id: 'hsk-3',
        title: 'Từ vựng HSK 3',
        description: 'Các từ vựng nâng cao thuộc khung chuẩn HSK cấp độ 3.',
        count: hsk3Words.length,
        type: 'hsk',
        icon: GraduationCap,
        color: 'from-purple-500 to-pink-400',
        stackColor: 'bg-purple-100/60',
        stackColor2: 'bg-purple-50/70',
        getWords: () => vocabList.filter(item => item.hsk === 3)
      });
    }

    return decks;
  };

  const decks = getDecks();

  // Auto-select the 'all' deck on initial mount
  useEffect(() => {
    if (!selectedDeck && !hasAutoSelected && vocabList.length > 0) {
      const defaultDeck = decks.find(d => d.id === 'all');
      if (defaultDeck) {
        setSelectedDeck(defaultDeck);
        setHasAutoSelected(true);
      }
    }
  }, [vocabList, selectedDeck, hasAutoSelected, decks]);

  // If a deck is selected, fetch its fresh words from the store dynamically
  const getSelectedDeckWords = () => {
    if (!selectedDeck) return [];
    const deckConfig = decks.find(d => d.id === selectedDeck.id);
    return deckConfig ? deckConfig.getWords() : [];
  };

  const selectedDeckWords = getSelectedDeckWords();

  // Filter words inside active study set based on search query
  const filteredList = selectedDeckWords.filter(item => {
    const matchesSearch = 
      item.text.includes(searchQuery) ||
      item.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.translation.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesSearch;
  });

  const activeList = isShuffled ? shuffledList : filteredList;
  const activeIndex = Math.min(currentIndex, Math.max(0, activeList.length - 1));

  // Reset indices and states on deck change
  const selectDeck = (deck) => {
    setSelectedDeck(deck);
    setSearchQuery('');
    setIsShuffled(false);
    setShuffledList([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsPlaying(false);
  };

  // Toggle shuffle deck order
  const toggleShuffle = () => {
    const nextShuffled = !isShuffled;
    setIsShuffled(nextShuffled);
    if (nextShuffled) {
      setShuffledList([...filteredList].sort(() => 0.5 - Math.random()));
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Handle deck navigation
  const handleNext = () => {
    setIsFlipped(false);
    if (activeList.length === 0) return;
    if (activeIndex < activeList.length - 1) {
      setCurrentIndex(activeIndex + 1);
    } else {
      setCurrentIndex(0); // loop back
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (activeList.length === 0) return;
    if (activeIndex > 0) {
      setCurrentIndex(activeIndex - 1);
    } else {
      setCurrentIndex(activeList.length - 1);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!selectedDeck) return;

    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, activeList.length, isFlipped, selectedDeck]);

  // Autoplay loop timer
  useEffect(() => {
    if (!isPlaying || activeList.length === 0 || !selectedDeck) return;
    const interval = setInterval(() => {
      if (!isFlipped) {
        setIsFlipped(true);
      } else {
        handleNext();
      }
    }, 3500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, isFlipped, activeIndex, activeList.length, selectedDeck]);

  const speakWord = (e, text) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const loadWordIntoPlayer = (wordText) => {
    const idx = activeList.findIndex(w => w.text === wordText);
    if (idx !== -1) {
      setCurrentIndex(idx);
      setIsFlipped(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getHskBadgeColor = (hsk) => {
    if (hsk === 1) return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (hsk === 2) return "bg-blue-50 text-blue-600 border-blue-100";
    return "bg-purple-50 text-purple-600 border-purple-100";
  };

  // --- VIEW 1: VOCABULARY NOTEBOOK EMPTY STATE ---
  if (vocabList.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 page-transition">
        <div className="text-center p-8 bg-white border border-slate-100 rounded-3xl space-y-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Sổ Tay Từ Vựng Trống</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Bạn chưa lưu bất kỳ từ vựng nào. Hãy đọc các tài liệu học tập trong Trình Đọc và click vào từ mới để lưu chúng vào đây.
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate('/reader')} className="w-full">
            Mở Trình Đọc
          </Button>
        </div>
      </div>
    );
  }

  // --- VIEW 2: DECK SELECTION SCREEN (DECK SELECTOR) ---
  if (!selectedDeck) {
    const systemDecks = decks.filter(d => d.type === 'system');
    const docDecks = decks.filter(d => d.type === 'document');
    const hskDecks = decks.filter(d => d.type === 'hsk');

    return (
      <div className="space-y-12 page-transition max-w-6xl mx-auto py-6">
        {/* Glowing Head Banner */}
        <div className="text-center space-y-3 relative py-6">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-24 bg-blue-400/5 blur-3xl rounded-full pointer-events-none"></div>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50/80 border border-blue-100/50 px-3 py-1 rounded-full uppercase tracking-wider">Học phần từ vựng</span>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display text-slate-850 tracking-tight">Thư viện Flashcard của bạn</h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto font-medium leading-relaxed">
            Chọn một bộ từ vựng dưới đây để bắt đầu bài học ghi nhớ lật thẻ. Các từ được phân nhóm tự động theo HSK hoặc tài liệu đọc của bạn.
          </p>
        </div>

        {/* SECTION 1: SYSTEM DECKS */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <Layers className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Học phần tổng hợp</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {systemDecks.map(deck => {
              const IconComp = deck.icon;
              return (
                <div key={deck.id} className="relative group cursor-pointer" onClick={() => selectDeck(deck)}>
                  {/* Decorative Deck Stacks */}
                  <div className={`absolute inset-0 ${deck.stackColor} rounded-3xl translate-x-2.5 translate-y-2.5 opacity-55 transition-all group-hover:translate-x-3.5 group-hover:translate-y-3.5 duration-300 shadow-sm`}></div>
                  <div className={`absolute inset-0 ${deck.stackColor2} rounded-3xl translate-x-1.5 translate-y-1.5 opacity-80 transition-all group-hover:translate-x-2 group-hover:translate-y-2 duration-300 shadow-sm`}></div>
                  
                  {/* Main Deck Card */}
                  <div className="relative bg-white border border-slate-100 rounded-3xl p-7 flex flex-col justify-between h-48 shadow-[0_4px_20px_rgba(15,23,42,0.02)] hover:shadow-[0_12px_30px_rgba(37,99,235,0.06)] hover:border-blue-200 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${deck.color} text-white flex items-center justify-center shadow-lg shadow-blue-500/10`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-lg font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">{deck.title}</h4>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm mt-1">{deck.description}</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-blue-600 bg-blue-50 border border-blue-100/50 px-3 py-1 rounded-xl">{deck.count} thẻ</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold group-hover:gap-2.5 transition-all mt-4">
                      <span>Bắt đầu ôn tập</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: DOCUMENT DECKS */}
        {docDecks.length > 0 && (
          <div className="space-y-5 pt-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <FolderOpen className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Học phần theo tài liệu</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {docDecks.map(deck => {
                const IconComp = deck.icon;
                return (
                  <div key={deck.id} className="relative group cursor-pointer" onClick={() => selectDeck(deck)}>
                    {/* Decorative Deck Stacks */}
                    <div className={`absolute inset-0 ${deck.stackColor} rounded-2xl translate-x-2 translate-y-2 opacity-50 transition-all group-hover:translate-x-3 group-hover:translate-y-3 duration-300 shadow-sm`}></div>
                    <div className={`absolute inset-0 ${deck.stackColor2} rounded-2xl translate-x-1 translate-y-1 opacity-70 transition-all group-hover:translate-x-1.5 group-hover:translate-y-1.5 duration-300 shadow-sm`}></div>
                    
                    {/* Main Deck Card */}
                    <div className="relative bg-white border border-slate-100 rounded-2xl p-6 flex flex-col justify-between h-44 shadow-[0_4px_20px_rgba(15,23,42,0.02)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] hover:border-blue-200 transition-all duration-300">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center">
                            <IconComp className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-lg">{deck.count} từ</span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{deck.title}</h4>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1 line-clamp-2">{deck.description}</p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold group-hover:gap-2.5 transition-all mt-3">
                        <span>Lật thẻ ngay</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 3: HSK DECKS */}
        {hskDecks.length > 0 && (
          <div className="space-y-5 pt-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <GraduationCap className="w-4.5 h-4.5 text-emerald-555" style={{ color: '#10b981' }} />
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Học phần theo cấp độ HSK</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hskDecks.map(deck => {
                const IconComp = deck.icon;
                return (
                  <div key={deck.id} className="relative group cursor-pointer" onClick={() => selectDeck(deck)}>
                    {/* Decorative Deck Stacks */}
                    <div className={`absolute inset-0 ${deck.stackColor} rounded-2xl translate-x-2 translate-y-2 opacity-50 transition-all group-hover:translate-x-3 group-hover:translate-y-3 duration-300 shadow-sm`}></div>
                    <div className={`absolute inset-0 ${deck.stackColor2} rounded-2xl translate-x-1 translate-y-1 opacity-70 transition-all group-hover:translate-x-1.5 group-hover:translate-y-1.5 duration-300 shadow-sm`}></div>

                    {/* Main Deck Card */}
                    <div className="relative bg-white border border-slate-100 rounded-2xl p-6 flex flex-col justify-between h-44 shadow-[0_4px_20px_rgba(15,23,42,0.02)] hover:shadow-[0_12px_24px_rgba(16,185,129,0.05)] hover:border-emerald-250 transition-all duration-300">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${deck.color} text-white flex items-center justify-center shadow-sm`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-550 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-lg">{deck.count} từ</span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-1">{deck.title}</h4>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1 line-clamp-2">{deck.description}</p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold group-hover:gap-2.5 transition-all mt-3">
                        <span>Học học phần</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW 3: STUDY PLAYBACK SCREEN (REARRANGED & BEAUTIFIED) ---
  const currentWord = activeList[activeIndex];
  const progressPercent = activeList.length > 0 ? ((activeIndex + 1) / activeList.length) * 100 : 0;

  return (
    <div className="space-y-8 page-transition max-w-4xl mx-auto py-2">
      
      {/* 1. Breadcrumbs Navigation / Header Title Section */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[0_2px_12px_rgba(15,23,42,0.01)]">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Thư viện</span>
            <span>/</span>
            <span>Flashcards</span>
            <span>/</span>
            <span className="text-blue-500 font-extrabold">{selectedDeck.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-850 font-display">{selectedDeck.title}</h2>
            <span className="text-[10px] font-extrabold text-blue-650 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/50">
              {selectedDeckWords.length} thẻ
            </span>
          </div>
        </div>
      </div>

      {/* 2. QUIZLET FLASHCARD PLAYER INTERFACE */}
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Top visual study side header toggle */}
        <div className="flex items-center justify-between bg-white border border-slate-100 px-5 py-3 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-655">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span>Tiến trình: {activeIndex + 1} / {activeList.length} thẻ</span>
          </div>
          
          <button 
            onClick={() => setTranslationFirst(!translationFirst)}
            className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-50 border border-blue-100/30 px-3.5 py-2 rounded-xl transition-colors"
            title="Đổi mặt thẻ hiển thị trước"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Mặt trước: {translationFirst ? 'Nghĩa' : 'Chữ Hán'}</span>
          </button>
        </div>

        {/* Dynamic Glowing Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner relative z-10 -mb-4">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-blue-500 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {activeList.length > 0 && currentWord ? (
          <div className="space-y-6">
            
            {/* The 3D Flashcard Component */}
            <div className="pt-2">
              <Flashcard 
                word={currentWord}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped(!isFlipped)}
                translationFirst={translationFirst}
              />
            </div>

            {/* Rearranged Controllers glass card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                {/* Shuffle Button */}
                <button
                  onClick={toggleShuffle}
                  className={`p-3 rounded-xl border transition-all ${
                    isShuffled 
                      ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-400 hover:text-slate-655 hover:bg-slate-50'
                  }`}
                  title={isShuffled ? "Hủy trộn" : "Trộn ngẫu nhiên"}
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                {/* Autoplay Play/Pause */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`p-3 rounded-xl border transition-all ${
                    isPlaying 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-400 hover:text-slate-655 hover:bg-slate-50'
                  }`}
                  title={isPlaying ? "Tạm dừng" : "Tự động chạy thẻ"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>

              {/* Central controls display count indicators */}
              <div className="text-center font-display text-xs font-bold text-slate-400">
                Thẻ {activeIndex + 1} / {activeList.length}
              </div>

              {/* Prev & Next arrows */}
              <div className="flex gap-2.5">
                <button
                  onClick={handlePrev}
                  className="p-3 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                  title="Thẻ trước"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-3 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                  title="Thẻ tiếp theo"
                >
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Keyboard shortcut helper bar */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex justify-center items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-slate-400" /> Phím tắt bàn phím:</span>
              <span>Space: lật thẻ</span>
              <span>&bull;</span>
              <span>← / →: chuyển thẻ</span>
            </div>

          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
            <p className="text-sm text-slate-500 font-bold">Không tìm thấy từ vựng nào khớp với bộ lọc tìm kiếm của bạn.</p>
          </div>
        )}
      </div>

      {/* 3. INTEGRATED VOCABULARY LIST SET SECTION */}
      <div className="space-y-6 pt-4">
        
        {/* Table/List section heading */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-slate-100 pt-8">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">Từ vựng trong học phần này ({filteredList.length})</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Click chuột vào từ bất kỳ để mở từ đó ngay trên Trình phát Flashcard phía trên</p>
          </div>
          
          <Button 
            variant="secondary"
            icon={BookOpen}
            onClick={() => navigate('/reader')}
            className="shadow-sm border-slate-200 hover:border-blue-200"
          >
            Mở Trình Đọc
          </Button>
        </div>

        {/* Search bar row */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm từ vựng, pinyin, nghĩa..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsShuffled(false);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Dynamic Card Rows for terms */}
        {activeList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeList.map((word) => {
              const isActive = currentWord && currentWord.text === word.text;
              return (
                <div
                  key={word.text}
                  onClick={() => loadWordIntoPlayer(word.text)}
                  className={`group flex items-center justify-between p-5 bg-white border rounded-2xl cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? 'border-blue-500 bg-blue-50/10 shadow-sm shadow-blue-500/5' 
                      : 'border-slate-100/90 hover:border-blue-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${getHskBadgeColor(word.hsk)}`}>
                      HSK {word.hsk}
                    </span>
                    
                    <div className="min-w-0 flex flex-col md:flex-row md:items-baseline gap-0.5 md:gap-3">
                      <h4 className="text-base font-extrabold text-slate-850 group-hover:text-blue-600 transition-colors select-text">
                        {word.text}
                      </h4>
                      <span className="text-xs text-blue-600 font-bold select-text">
                        [{word.pinyin}]
                      </span>
                      <span className="text-xs text-slate-500 font-medium truncate select-text">
                        &mdash; {word.translation}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* TTS Voice Readout */}
                    <button
                      onClick={(e) => speakWord(e, word.text)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {/* Remove term from notebook */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWord(word.text);
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Xóa từ vựng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="Không tìm thấy từ vựng nào"
            description="Hãy điều chỉnh từ khóa tìm kiếm để hiển thị từ vựng học phần."
            actionLabel="Đặt lại tìm kiếm"
            onAction={() => setSearchQuery('')}
          />
        )}
      </div>
    </div>
  );
}
export default FlashcardPage;
