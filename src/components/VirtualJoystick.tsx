import React, { useRef, useState, useCallback, useEffect } from 'react';

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
  size?: number;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove, size = 110 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);

  const radius = size / 2;
  const maxDistance = radius * 0.75;

  const handleTouch = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      let clampedX = deltaX;
      let clampedY = deltaY;

      if (distance > maxDistance) {
        clampedX = (deltaX / distance) * maxDistance;
        clampedY = (deltaY / distance) * maxDistance;
      }

      setKnobPos({ x: clampedX, y: clampedY });

      // Normalized output (-1 to 1)
      const normX = clampedX / maxDistance;
      const normY = clampedY / maxDistance;
      onMove(normX, normY);
    },
    [maxDistance, onMove]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (touchIdRef.current === null && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      touchIdRef.current = touch.identifier;
      setActive(true);
      handleTouch(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (touchIdRef.current !== null) {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchIdRef.current) {
          handleTouch(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
          break;
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (touchIdRef.current !== null) {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchIdRef.current) {
          touchIdRef.current = null;
          setActive(false);
          setKnobPos({ x: 0, y: 0 });
          onMove(0, 0);
          break;
        }
      }
    }
  };

  // Mouse fallback for testing
  const handleMouseDown = (e: React.MouseEvent) => {
    setActive(true);
    handleTouch(e.clientX, e.clientY);

    const onMouseMove = (moveEvent: MouseEvent) => {
      handleTouch(moveEvent.clientX, moveEvent.clientY);
    };

    const onMouseUp = () => {
      setActive(false);
      setKnobPos({ x: 0, y: 0 });
      onMove(0, 0);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  useEffect(() => {
    return () => {
      onMove(0, 0);
    };
  }, [onMove]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      style={{
        width: size,
        height: size,
      }}
      className="relative rounded-full bg-slate-900/60 border-4 border-slate-700/80 shadow-2xl flex items-center justify-center select-none touch-none backdrop-blur-none cursor-pointer"
    >
      {/* Outer directional ticks */}
      <div className="absolute inset-2 rounded-full border-2 border-dashed border-slate-500/40 pointer-events-none" />

      {/* Center knob */}
      <div
        className={`w-12 h-12 rounded-full shadow-lg transition-transform pointer-events-none flex items-center justify-center ${
          active
            ? 'bg-gradient-to-tr from-emerald-500 to-lime-300 scale-110 shadow-emerald-500/50'
            : 'bg-gradient-to-tr from-slate-400 to-slate-200'
        }`}
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
        }}
      >
        <div className="w-5 h-5 rounded-full bg-white/40 shadow-inner" />
      </div>
    </div>
  );
};
