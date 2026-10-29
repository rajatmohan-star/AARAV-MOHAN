import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/gameEngine';
import { PlayerStats, WorldId } from './types/game';
import { GameHUD } from './components/GameHUD';
import { WorldSelectModal } from './components/WorldSelectModal';
import { HeartsRefillModal } from './components/HeartsRefillModal';
import { VictoryModal } from './components/VictoryModal';
import { ControlsGuideModal } from './components/ControlsGuideModal';
import { soundManager } from './audio/soundManager';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [stats, setStats] = useState<PlayerStats>({
    speed: 0,
    hearts: 5,
    maxHearts: 5,
    currentCheckpoint: 0,
    stageCompleted: false,
    gameTime: 0,
    streakMultiplier: 1.0,
    unlockedWorlds: [1],
    activeWorld: 1,
  });

  const [checkpointToast, setCheckpointToast] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [isWorldSelectOpen, setIsWorldSelectOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(false);

  // Initialize Game Engine on mount
  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new GameEngine(mountRef.current, {
      onStatsUpdate: (newStats) => {
        setStats(newStats);
      },
      onCheckpointTrigger: (name) => {
        setCheckpointToast(`Checkpoint Reached: ${name}!`);
        setTimeout(() => {
          setCheckpointToast(null);
        }, 2500);
      },
      onStageComplete: () => {
        setIsVictory(true);
      },
      onGameOver: () => {
        setIsGameOver(true);
      },
    });

    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Joystick move handler
  const handleJoystickMove = useCallback((x: number, y: number) => {
    if (engineRef.current) {
      engineRef.current.setJoystick(x, y);
    }
  }, []);

  // Jump handlers
  const handleJumpStart = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.triggerJump(true);
    }
  }, []);

  const handleJumpEnd = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.triggerJump(false);
    }
  }, []);

  // World select handler
  const handleSelectWorld = useCallback((worldId: WorldId) => {
    if (engineRef.current) {
      engineRef.current.loadWorld(worldId);
      setIsVictory(false);
      setIsGameOver(false);
    }
  }, []);

  // Hearts refill handler
  const handleRefillHearts = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.refillHearts();
      setIsGameOver(false);
    }
  }, []);

  // Next world after victory
  const handleNextWorld = useCallback(() => {
    const nextWorld = (stats.activeWorld + 1) as WorldId;
    if (nextWorld <= 3 && engineRef.current) {
      engineRef.current.loadWorld(nextWorld);
      setIsVictory(false);
    }
  }, [stats.activeWorld]);

  // Replay stage
  const handleReplay = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.loadWorld(stats.activeWorld);
      setIsVictory(false);
    }
  }, [stats.activeWorld]);

  // Respawn at safe zone
  const handleRespawn = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.respawnPlayer();
    }
  }, []);

  // Toggle background music
  const handleToggleMusic = useCallback(() => {
    soundManager.toggleMusic(!isMusicOn);
    setIsMusicOn(!isMusicOn);
  }, [isMusicOn]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-['Fredoka',sans-serif]">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Arcade HUD Overlay */}
      <GameHUD
        stats={stats}
        checkpointToast={checkpointToast}
        onJumpStart={handleJumpStart}
        onJumpEnd={handleJumpEnd}
        onJoystickMove={handleJoystickMove}
        onOpenWorldSelect={() => setIsWorldSelectOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onRespawn={handleRespawn}
        onToggleMusic={handleToggleMusic}
        isMusicOn={isMusicOn}
      />

      {/* World Select Portal Modal */}
      <WorldSelectModal
        isOpen={isWorldSelectOpen}
        activeWorld={stats.activeWorld}
        unlockedWorlds={stats.unlockedWorlds}
        onSelectWorld={handleSelectWorld}
        onClose={() => setIsWorldSelectOpen(false)}
      />

      {/* Hearts Refill Quiz Modal (When hearts reach 0) */}
      <HeartsRefillModal
        isOpen={isGameOver}
        onRefill={handleRefillHearts}
      />

      {/* Stage Victory Modal (When reaching finish line) */}
      <VictoryModal
        isOpen={isVictory}
        completedWorld={stats.activeWorld}
        gameTime={stats.gameTime}
        maxSpeed={stats.speed}
        onNextWorld={handleNextWorld}
        onReplay={handleReplay}
        onOpenWorldSelect={() => {
          setIsVictory(false);
          setIsWorldSelectOpen(true);
        }}
      />

      {/* Controls & Parkour Help Modal */}
      <ControlsGuideModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
