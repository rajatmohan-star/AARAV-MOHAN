import React from 'react';
import { X, Gamepad2, Smartphone, Keyboard, Flame, Compass } from 'lucide-react';

interface ControlsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsGuideModal: React.FC<ControlsGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border-4 border-amber-400/80 p-5 text-white shadow-2xl arcade-panel">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-black text-white">How To Play</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-800 p-1.5 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          {/* Desktop Controls */}
          <div className="rounded-2xl bg-slate-800/80 p-3 border border-slate-700">
            <div className="flex items-center gap-2 font-bold text-amber-300 mb-1.5">
              <Keyboard className="w-4 h-4" />
              <span>Computer Keyboard</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• <span className="font-bold text-white">W, A, S, D / Arrows:</span> Run</li>
              <li>• <span className="font-bold text-white">Spacebar:</span> Jump</li>
              <li>• <span className="font-bold text-white">Shift:</span> Sprint / Speed boost</li>
              <li>• <span className="font-bold text-white">Mouse Drag:</span> Rotate 360° Camera</li>
            </ul>
          </div>

          {/* Mobile / iPad Controls */}
          <div className="rounded-2xl bg-slate-800/80 p-3 border border-slate-700">
            <div className="flex items-center gap-2 font-bold text-sky-300 mb-1.5">
              <Smartphone className="w-4 h-4" />
              <span>iPad & Mobile Touch</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• <span className="font-bold text-white">Left Joystick:</span> Move in any direction</li>
              <li>• <span className="font-bold text-white">Right Big Button:</span> Jump</li>
              <li>• <span className="font-bold text-white">Touch & Drag Screen:</span> Rotate Camera angle</li>
            </ul>
          </div>

          {/* Objectives */}
          <div className="rounded-2xl bg-slate-800/80 p-3 border border-slate-700">
            <div className="flex items-center gap-2 font-bold text-emerald-300 mb-1.5">
              <Compass className="w-4 h-4" />
              <span>Speed Parkour Tips</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• <span className="font-bold text-purple-300">Purple Platforms:</span> Jump along safe yellow-edged tracks.</li>
              <li>• <span className="font-bold text-yellow-300">Round Jump Pads:</span> Step on them for massive upward and forward launches!</li>
              <li>• <span className="font-bold text-orange-400">Orange Lava:</span> Falling in lava takes 1 heart.</li>
              <li>• <span className="font-bold text-emerald-400">Green Safe Zones:</span> Save your progress checkpoints!</li>
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-2xl bg-amber-400 hover:bg-amber-500 py-2.5 font-black text-amber-950 active:scale-95 transition-all text-sm"
        >
          Got It! Let&apos;s Run!
        </button>

        <div className="mt-3 text-center text-[11px] font-bold text-slate-400">
          AM3X3-speed escape • Created with pride by <span className="text-yellow-400 font-extrabold">Aarav Mohan</span>
        </div>
      </div>
    </div>
  );
};

