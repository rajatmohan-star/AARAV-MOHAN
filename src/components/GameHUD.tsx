import React, { useState } from 'react';
import {
  Heart,
  Zap,
  Globe2,
  Volume2,
  VolumeX,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Flame,
} from 'lucide-react';
import { PlayerStats, WorldId } from '../types/game';
import { WORLDS_INFO } from '../game/worldData';
import { VirtualJoystick } from './VirtualJoystick';
import { soundManager } from '../audio/soundManager';

interface GameHUDProps {
  stats: PlayerStats;
  checkpointToast: string | null;
  onJumpStart: () => void;
  onJumpEnd: () => void;
  onJoystickMove: (x: number, y: number) => void;
  onOpenWorldSelect: () => void;
  onOpenHelp: () => void;
  onRespawn: () => void;
  onToggleMusic: () => void;
  isMusicOn: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  checkpointToast,
  onJumpStart,
  onJumpEnd,
  onJoystickMove,
  onOpenWorldSelect,
  onOpenHelp,
  onRespawn,
  onToggleMusic,
  isMusicOn,
}) => {
  const currentWorldInfo = WORLDS_INFO[stats.activeWorld];
  const [isJumpActive, setIsJumpActive] = useState(false);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none z-20">
      {/* ================= TOP ARCADE BAR ================= */}
      <div className="flex items-center justify-between gap-2 pointer-events-auto w-full max-w-5xl mx-auto">
        {/* Left: Player Profile Pill (Inspired by SpeedyWizard57 in reference screenshots) */}
        <div className="flex items-center gap-2 rounded-2xl bg-amber-950/80 border-2 border-amber-400/80 px-2.5 py-1.5 shadow-lg backdrop-blur-none text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 border border-white/40 shadow text-base font-black">
            🧙‍♂️
          </div>
          <div className="flex flex-col pr-1">
            <span className="text-xs font-black tracking-wide text-amber-200 leading-tight">
              SpeedyRunner
            </span>
            <span className="text-[10px] font-extrabold text-amber-400/90 leading-none">
              Level {stats.activeWorld * 12 + stats.currentCheckpoint * 4}
            </span>
          </div>
        </div>

        {/* Center: SPEED METER (Prominent arcade lightning gauge matching screenshot!) */}
        <div className="flex items-center gap-2 rounded-2xl bg-slate-900/90 border-2 border-yellow-400 px-3.5 py-1.5 shadow-xl">
          <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400 animate-pulse" />
          <div className="flex flex-col items-center">
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-slate-400">Speed</span>
              <span className="font-mono text-xl font-black text-yellow-300 tracking-wider">
                {stats.speed}
              </span>
              <span className="text-[10px] font-bold text-yellow-500 uppercase">km/h</span>
            </div>
          </div>
        </div>

        {/* Right: HEARTS COUNTER (5 Hearts matching reference screenshot: 5/5) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-2xl bg-rose-950/80 border-2 border-rose-400/80 px-3 py-1.5 shadow-lg text-white">
            <div className="flex items-center gap-0.5">
              {[...Array(stats.maxHearts)].map((_, i) => (
                <Heart
                  key={i}
                  className={`h-4 w-4 transition-all duration-300 ${
                    i < stats.hearts
                      ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)] scale-100'
                      : 'text-slate-600 fill-slate-700 scale-90 opacity-40'
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-xs font-black text-rose-200 ml-1">
              {stats.hearts}/{stats.maxHearts}
            </span>
          </div>

          {/* Quick Action Buttons: Music, Worlds, Help */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleMusic}
              title={isMusicOn ? 'Mute Music' : 'Play Music'}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/90 border border-slate-600 text-slate-200 hover:text-white hover:bg-slate-700 shadow active:scale-95 transition-all"
            >
              {isMusicOn ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
            </button>

            <button
              onClick={onOpenWorldSelect}
              title="Select World"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-700/90 border border-purple-400 text-white hover:bg-purple-600 shadow active:scale-95 transition-all"
            >
              <Globe2 className="h-4 w-4" />
            </button>

            <button
              onClick={onOpenHelp}
              title="How to play"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/90 border border-slate-600 text-slate-200 hover:text-white hover:bg-slate-700 shadow active:scale-95 transition-all"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MID SCREEN: CHECKPOINT TOAST & STREAK ================= */}
      <div className="flex flex-col items-center gap-2 pointer-events-none">
        {checkpointToast && (
          <div className="rounded-2xl bg-emerald-500/90 border-2 border-emerald-300 px-4 py-2 font-black text-white shadow-2xl animate-bounce flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-sm tracking-wide">{checkpointToast}</span>
          </div>
        )}

        {/* Streak Multiplier & Stage Title (Matching screenshot styling!) */}
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-orange-600/90 border border-orange-400/80 px-3 py-0.5 text-[11px] font-black text-white shadow flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            <span>Streak Multiplier: {stats.streakMultiplier.toFixed(2)}x</span>
          </div>
          <div className="mt-1 rounded-xl bg-slate-900/80 border border-white/20 px-3 py-0.5 text-xs font-bold text-yellow-300 tracking-wide shadow">
            {currentWorldInfo.subtitle}: {currentWorldInfo.name}
          </div>
        </div>
      </div>

      {/* ================= BOTTOM CONTROLS FOR MOBILE / IPAD ================= */}
      <div className="w-full flex items-end justify-between px-3 pb-2">
        {/* Left: Virtual Touch Joystick for Movement */}
        <div className="pointer-events-auto">
          <VirtualJoystick onMove={onJoystickMove} size={114} />
        </div>

        {/* Center: Stage Name / Respawn Button */}
        <div className="pointer-events-auto flex flex-col items-center mb-1">
          <button
            onClick={onRespawn}
            className="flex items-center gap-1.5 rounded-full bg-slate-800/80 border border-slate-600/70 px-3 py-1 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-700 shadow active:scale-95 transition-all"
          >
            <RotateCcw className="w-3 h-3 text-amber-400" />
            <span>Respawn at Safe Zone</span>
          </button>
        </div>

        {/* Right: Big Arcade Jump Button (Styled after the round purple jump icon in screenshot IMG_0842_f101e95f.jpeg!) */}
        <div className="pointer-events-auto">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              setIsJumpActive(true);
              onJumpStart();
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              setIsJumpActive(false);
              onJumpEnd();
            }}
            onPointerCancel={() => {
              setIsJumpActive(false);
              onJumpEnd();
            }}
            className={`relative flex h-20 w-20 items-center justify-center rounded-full border-4 shadow-2xl transition-all duration-75 select-none touch-none ${
              isJumpActive
                ? 'bg-gradient-to-tr from-fuchsia-600 to-purple-600 border-yellow-300 scale-95 shadow-purple-500/80'
                : 'bg-gradient-to-tr from-purple-700 to-fuchsia-500 border-white shadow-purple-900/70 active:scale-95'
            }`}
          >
            {/* Jumping runner icon */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl filter drop-shadow">🏃‍♂️</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-white drop-shadow">
                JUMP
              </span>
            </div>
            {/* Outer pulse ring */}
            <div className="absolute inset-0 rounded-full border-2 border-white/30 pointer-events-none" />
          </button>
        </div>
      </div>
    </div>
  );
};
