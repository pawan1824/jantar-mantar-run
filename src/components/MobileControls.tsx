import React, { useRef, useState, useEffect } from 'react';

interface MobileControlsProps {
  onJoystickMove: (x: number, y: number) => void;
  onJump: () => void;
  onShout: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ onJoystickMove, onJump, onShout }) => {
  const stickRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  const maxRadius = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsDragging(true);
    updateKnob(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateKnob(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsDragging(false);
        setKnobPos({ x: 0, y: 0 });
        onJoystickMove(0, 0);
        break;
      }
    }
  };

  const updateKnob = (clientX: number, clientY: number) => {
    if (!stickRef.current) return;
    const rect = stickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setKnobPos({ x: dx, y: dy });
    onJoystickMove(dx / maxRadius, dy / maxRadius);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none flex justify-between items-end p-4 sm:p-6 pb-6">
      {/* Virtual Joystick (Bottom Left) matching original game */}
      <div
        ref={stickRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="pointer-events-auto relative w-28 h-28 rounded-full bg-black/60 border-3 border-amber-400/60 shadow-xl flex items-center justify-center backdrop-blur-xs touch-none"
      >
        {/* Direction arrows */}
        <div className="absolute top-1.5 text-xs text-amber-400/60 font-bold">▲</div>
        <div className="absolute right-1.5 text-xs text-amber-400/60 font-bold">▶</div>
        <div className="absolute bottom-1.5 text-xs text-amber-400/60 font-bold">▼</div>
        <div className="absolute left-1.5 text-xs text-amber-400/60 font-bold">◀</div>

        {/* Joystick center knob */}
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-black shadow-lg transition-transform ${
            isDragging ? 'scale-110' : ''
          }`}
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        />
      </div>

      {/* Action Buttons (Bottom Right) */}
      <div className="pointer-events-auto flex flex-col items-center gap-3">
        {/* Slogan Shout Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onShout();
          }}
          onClick={onShout}
          className="w-16 h-16 rounded-full bg-rose-600 active:bg-rose-700 border-3 border-white text-white font-comic text-xs flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform"
          aria-label="Slogan shout"
        >
          <span className="text-base">📢</span>
          <span>SHOUT</span>
        </button>

        {/* Large JUMP Button matching original code */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onJump();
          }}
          onClick={onJump}
          className="w-22 h-22 rounded-full bg-[#ffd23f] active:bg-[#e6bd35] border-4 border-black text-[#1d1424] font-comic text-2xl font-black flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
          aria-label="Jump"
        >
          JUMP
        </button>
      </div>
    </div>
  );
};
