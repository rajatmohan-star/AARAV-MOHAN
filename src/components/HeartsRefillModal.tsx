import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Check, Delete } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface HeartsRefillModalProps {
  isOpen: boolean;
  onRefill: () => void;
}

export const HeartsRefillModal: React.FC<HeartsRefillModalProps> = ({ isOpen, onRefill }) => {
  const [numA, setNumA] = useState(7);
  const [numB, setNumB] = useState(8);
  const [answerInput, setAnswerInput] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');

  // Generate new quiz problem
  const generateProblem = () => {
    const a = Math.floor(Math.random() * 9) + 2;
    const b = Math.floor(Math.random() * 9) + 2;
    setNumA(a);
    setNumB(b);
    setAnswerInput('');
    setFeedback('idle');
  };

  useEffect(() => {
    if (isOpen) {
      generateProblem();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (num: number) => {
    if (answerInput.length < 4) {
      setAnswerInput((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setAnswerInput((prev) => prev.slice(0, -1));
  };

  const handleVerify = () => {
    const expected = numA * numB;
    if (parseInt(answerInput, 10) === expected) {
      soundManager.playQuizSuccess();
      setFeedback('correct');
      setTimeout(() => {
        onRefill();
      }, 500);
    } else {
      soundManager.playQuizFail();
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback('idle');
        setAnswerInput('');
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-pink-100 to-rose-200 p-5 text-slate-800 shadow-2xl border-4 border-pink-400 arcade-panel">
        {/* Top Header Badge */}
        <div className="mx-auto -mt-9 w-fit rounded-full bg-rose-500 px-6 py-1.5 text-center font-bold text-white shadow-md border-2 border-white flex items-center gap-2">
          <Heart className="w-5 h-5 fill-white" />
          <span>REFILL HEARTS</span>
        </div>

        <div className="mt-4 text-center">
          <h2 className="text-2xl font-black text-rose-900 tracking-wide">Hearts Quiz</h2>
          <p className="text-xs text-rose-700 font-semibold">Answer correctly to refill 5 hearts!</p>
        </div>

        {/* Math Question Box (homage to reference screenshot!) */}
        <div className="my-3 rounded-2xl bg-white p-3 shadow-inner border-2 border-rose-300 text-center">
          <div className="text-3xl font-black text-slate-900 tracking-wider">
            {numA} × {numB} = ?
          </div>
          <div
            className={`mt-2 flex h-10 w-full items-center justify-center rounded-xl border-2 font-mono text-2xl font-bold tracking-widest ${
              feedback === 'wrong'
                ? 'border-red-500 bg-red-100 text-red-700 animate-shake'
                : feedback === 'correct'
                ? 'border-green-500 bg-green-100 text-green-700'
                : 'border-slate-300 bg-slate-50 text-slate-800'
            }`}
          >
            {answerInput || <span className="text-slate-400 text-sm font-sans font-normal">Tap numbers below</span>}
          </div>
        </div>

        {/* Numeric Keypad (as seen in screenshot IMG_0835_8e516764.jpeg) */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handleKeyPress(n)}
              className="h-11 rounded-xl bg-white text-xl font-black text-sky-900 shadow-md border-2 border-sky-300 active:bg-sky-100 active:scale-95 transition-all"
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => handleKeyPress(0)}
            className="h-11 rounded-xl bg-white text-xl font-black text-sky-900 shadow-md border-2 border-sky-300 active:bg-sky-100 active:scale-95 transition-all"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-11 rounded-xl bg-rose-100 text-rose-800 font-bold shadow-md border-2 border-rose-300 flex items-center justify-center active:scale-95 transition-all"
          >
            <Delete className="w-5 h-5" />
          </button>
          <button
            onClick={handleVerify}
            className="h-11 rounded-xl bg-emerald-500 text-white font-black shadow-md border-2 border-emerald-600 flex items-center justify-center gap-1 active:scale-95 transition-all hover:bg-emerald-600"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>Go</span>
          </button>
        </div>

        {/* Free Instant Refill Button */}
        <div className="mt-4 pt-3 border-t border-rose-300/60 flex gap-2">
          <button
            onClick={onRefill}
            className="w-full rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black py-2.5 px-3 shadow-md border-2 border-amber-300 active:scale-95 transition-all flex items-center justify-center gap-1.5 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Instant Free Refill</span>
          </button>
        </div>
      </div>
    </div>
  );
};
