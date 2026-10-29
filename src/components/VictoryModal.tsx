import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { WorldId } from '../types/game';
import { WORLDS_INFO } from '../game/worldData';

interface VictoryModalProps {
  isOpen: boolean;
  completedWorld: WorldId;
  gameTime: number;
  maxSpeed: number;
  onNextWorld: () => void;
  onReplay: () => void;
  onOpenWorldSelect: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  completedWorld,
  gameTime,
  maxSpeed,
  onNextWorld,
  onReplay,
  onOpenWorldSelect,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Confetti burst
      const count = 200;
      const defaults = {
        origin: { y: 0.65 },
        zIndex: 100,
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentInfo = WORLDS_INFO[completedWorld];
  const hasNext = completedWorld < 3;
  const nextInfo = hasNext ? WORLDS_INFO[(completedWorld + 1) as WorldId] : null;

  const minutes = Math.floor(gameTime / 60);
  const seconds = Math.floor(gameTime % 60);
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-indigo-900 via-purple-950 to-slate-950 border-4 border-yellow-400 p-6 text-center text-white shadow-2xl arcade-panel">
        {/* Trophy icon */}
        <div className="mx-auto -mt-12 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-xl border-4 border-white">
          <Trophy className="h-10 w-10 text-amber-950" />
        </div>

        <h2 className="mt-3 text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-orange-400">
          STAGE CLEAR!
        </h2>
        <p className="text-sm font-bold text-yellow-300/90">{currentInfo.name} Completed</p>

        {/* 3 Stars */}
        <div className="my-3 flex justify-center gap-2">
          {[1, 2, 3].map((star) => (
            <Star key={star} className="h-7 w-7 text-yellow-400 fill-yellow-400 drop-shadow" />
          ))}
        </div>

        {/* Stats card */}
        <div className="my-3 grid grid-cols-2 gap-2 rounded-2xl bg-black/40 p-3 border border-white/10">
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">Time</div>
            <div className="text-lg font-black text-white">{timeFormatted}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">Peak Speed</div>
            <div className="text-lg font-black text-amber-400">{maxSpeed} km/h</div>
          </div>
        </div>

        {/* Unlocked message */}
        {hasNext && nextInfo ? (
          <div className="my-3 rounded-xl bg-emerald-950/80 p-2.5 border border-emerald-500/60 flex items-center justify-center gap-2 text-emerald-300 font-black text-xs">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Unlocked: {nextInfo.name}!</span>
          </div>
        ) : (
          <div className="my-3 rounded-xl bg-amber-950/80 p-2.5 border border-amber-500/60 text-amber-300 font-black text-xs">
            🎉 All 3 Worlds Conquered! You are a Speed Master!
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-4 flex flex-col gap-2">
          {hasNext ? (
            <button
              onClick={onNextWorld}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3 font-black text-white shadow-lg border-2 border-emerald-300 active:scale-95 transition-all text-base"
            >
              <span>Play {nextInfo?.name}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={onOpenWorldSelect}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-black text-white shadow-lg border-2 border-purple-300 active:scale-95 transition-all text-base"
            >
              <span>World Select</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={onReplay}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 py-2 text-xs font-bold text-slate-200 border border-slate-600 active:scale-95 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Play Again</span>
            </button>
            <button
              onClick={onOpenWorldSelect}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 py-2 text-xs font-bold text-slate-200 border border-slate-600 active:scale-95 transition-all"
            >
              <span>Worlds</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
