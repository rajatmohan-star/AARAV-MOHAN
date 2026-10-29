import React from 'react';
import { X, Lock, Flame, Snowflake, Ghost, ArrowRight, CheckCircle2 } from 'lucide-react';
import { WorldId } from '../types/game';
import { WORLDS_INFO } from '../game/worldData';

interface WorldSelectModalProps {
  isOpen: boolean;
  activeWorld: WorldId;
  unlockedWorlds: number[];
  onSelectWorld: (worldId: WorldId) => void;
  onClose: () => void;
}

export const WorldSelectModal: React.FC<WorldSelectModalProps> = ({
  isOpen,
  activeWorld,
  unlockedWorlds,
  onSelectWorld,
  onClose,
}) => {
  if (!isOpen) return null;

  const worlds: { id: WorldId; icon: React.ReactNode; bg: string; border: string }[] = [
    {
      id: 1,
      icon: <Flame className="w-6 h-6 text-orange-400" />,
      bg: 'from-orange-950/80 to-purple-950/90',
      border: 'border-orange-500/60',
    },
    {
      id: 2,
      icon: <Snowflake className="w-6 h-6 text-sky-300" />,
      bg: 'from-blue-950/80 to-cyan-950/90',
      border: 'border-sky-400/60',
    },
    {
      id: 3,
      icon: <Ghost className="w-6 h-6 text-purple-300" />,
      bg: 'from-purple-950/80 to-indigo-950/90',
      border: 'border-purple-500/60',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border-4 border-fuchsia-500/80 p-5 text-white shadow-2xl arcade-panel">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪐</span>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-300">
              Select World
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-800 p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* World List (exactly matching the 3 worlds in prompt) */}
        <div className="mt-4 space-y-3">
          {worlds.map((w) => {
            const info = WORLDS_INFO[w.id];
            const isUnlocked = unlockedWorlds.includes(w.id);
            const isCurrent = activeWorld === w.id;

            return (
              <div
                key={w.id}
                className={`relative overflow-hidden rounded-2xl border-2 p-3.5 transition-all bg-gradient-to-r ${w.bg} ${w.border} ${
                  isCurrent ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-950' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/40 border border-white/20 shadow-inner">
                      {w.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg tracking-wide text-white">{info.name}</span>
                        {isCurrent && (
                          <span className="rounded-full bg-yellow-400/20 px-2 py-0.5 text-[10px] font-extrabold text-yellow-300 border border-yellow-400/40">
                            YOU&apos;RE HERE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 font-medium line-clamp-1">{info.description}</p>
                    </div>
                  </div>

                  <div>
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-purple-600/80 px-3 py-1.5 text-xs font-black text-white border border-purple-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => {
                          onSelectWorld(w.id);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-3.5 py-1.5 text-xs font-black text-white shadow-md border border-emerald-400 active:scale-95 transition-all"
                      >
                        <span>Teleport</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 rounded-xl bg-slate-800/90 px-3 py-1.5 text-xs font-bold text-slate-400 border border-slate-700">
                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Locked</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
          Complete Stage 1 to unlock World 2 • Complete Stage 2 to unlock World 3!
        </div>
      </div>
    </div>
  );
};
