import { Eye, RefreshCcw } from 'lucide-react';

export function Flashcard({ word, isFlipped, onFlip, translationFirst = false }) {
  // Setup light theme colors for HSK badges
  const getHskColor = (hsk) => {
    if (hsk === 1) return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (hsk === 2) return "bg-blue-50 text-blue-600 border-blue-100";
    return "bg-purple-50 text-purple-600 border-purple-100";
  };

  const hskLabel = `HSK ${word.hsk}`;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto select-none">
      {/* 3D Flip Card Container */}
      <div 
        className="w-full h-80 perspective-1000 cursor-pointer"
        onClick={onFlip}
      >
        <div 
          className={`w-full h-full relative transform-style-3d transition-transform duration-500 rounded-3xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT FACE */}
          <div className="absolute inset-0 w-full h-full bg-white border border-slate-150 rounded-3xl p-8 flex flex-col justify-between items-center backface-hidden shadow-md">
            <div className="w-full flex justify-between items-center">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getHskColor(word.hsk)}`}>
                {hskLabel}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {translationFirst ? 'Mặt Trước (Nghĩa)' : 'Mặt Trước (Chữ Hán)'}
              </span>
            </div>
            
            <div className="text-center px-4">
              <h2 className={`font-bold font-display text-slate-800 mb-2 select-text ${
                translationFirst ? 'text-3xl font-semibold leading-snug' : 'text-6xl'
              }`}>
                {translationFirst ? word.translation : word.text}
              </h2>
              <span className="text-slate-400 text-xs font-semibold animate-pulse block mt-4">
                Click vào thẻ hoặc nhấn Space để lật
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-100">
              <Eye className="w-3.5 h-3.5" />
              <span>Xem mặt sau</span>
            </div>
          </div>

          {/* BACK FACE */}
          <div className="absolute inset-0 w-full h-full bg-white border-2 border-blue-500/20 rounded-3xl p-8 flex flex-col justify-between items-center backface-hidden rotate-y-180 shadow-md shadow-blue-500/5">
            <div className="w-full flex justify-between items-center">
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Đáp án</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {translationFirst ? 'Mặt Sau (Chữ Hán)' : 'Mặt Sau (Nghĩa)'}
              </span>
            </div>
            
            <div className="text-center w-full flex-1 flex flex-col justify-center items-center px-2">
              <h3 className="text-4xl font-bold text-slate-800 font-display mb-1 select-text">
                {word.text}
              </h3>
              <p className="text-lg font-bold text-blue-600 tracking-wide select-text">
                [{word.pinyin}]
              </p>
              
              <div className="w-12 h-[1px] bg-slate-150 my-2.5"></div>
              
              <p className="text-sm text-slate-650 font-medium italic select-text mb-1 max-h-12 overflow-y-auto">
                "{word.translation}"
              </p>

              {/* Context Example Sentence */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl w-full text-left max-w-sm">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Ví dụ</span>
                <p className="text-[13px] font-semibold text-slate-800 select-text leading-tight">
                  我正在<span className="text-blue-600 font-bold">{word.text}</span>汉语。
                </p>
                <p className="text-[11px] text-blue-500 font-bold mt-0.5 select-text">
                  Wǒ zhèngzài <span className="underline">{word.pinyin}</span> Hànyǔ.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-100 mt-2">
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>Xem mặt trước</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Flashcard;
