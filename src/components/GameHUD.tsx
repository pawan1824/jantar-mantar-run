import React from 'react';
import { Volume2, VolumeX, ArrowLeft, Megaphone, Flag, Building2 } from 'lucide-react';
import { Character } from '../types';

interface GameHUDProps {
  character: Character;
  health: number;
  score: number;
  distance: number;
  totalDistance: number;
  time: number;
  vanCount: number;
  shoutEnergy: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onQuit: () => void;
  onTriggerShout: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  character,
  health,
  score,
  distance,
  totalDistance,
  time,
  vanCount,
  shoutEnergy,
  isMuted,
  onToggleMute,
  onQuit,
  onTriggerShout,
}) => {
  const progressRatio = Math.min(1, Math.max(0, distance / totalDistance));
  const remainingMeters = Math.max(0, Math.round(totalDistance - distance));

  // Health color
  const hpColor =
    health > 55
      ? 'from-emerald-500 to-green-600'
      : health > 25
      ? 'from-amber-400 to-yellow-500'
      : 'from-red-600 to-rose-700 animate-pulse';

  return (
    <div className="absolute top-0 left-0 right-0 p-2 sm:p-4 pointer-events-none z-30 select-none">
      <div className="max-w-6xl mx-auto flex flex-col gap-2">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Back Button & Score */}
          <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
            <button
              onClick={onQuit}
              className="flex items-center gap-1 font-comic text-xs sm:text-sm bg-black/80 hover:bg-black text-amber-300 border-2 border-white/20 px-2.5 py-1.5 rounded-lg transition"
              aria-label="Quit to character select"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>QUIT</span>
            </button>

            {/* Score Pill matching image Panel 3 */}
            <div className="bg-black/85 border-2 border-white/30 px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
              <span className="font-comic text-xs sm:text-sm text-gray-300">SCORE</span>
              <span className="font-comic text-lg sm:text-2xl text-amber-300 font-bold tabular-nums">
                {score}
              </span>
            </div>

            {/* Character Badge */}
            <div className="hidden md:flex items-center gap-1.5 bg-black/75 border border-white/20 px-2.5 py-1 rounded-lg text-xs">
              <span className="text-base">{character.avatarIcon}</span>
              <span className="font-comic text-white">{character.name}</span>
            </div>
          </div>

          {/* Center: Route Progress Track (Jantar Mantar -> Parliament) */}
          <div className="flex-1 max-w-sm sm:max-w-md mx-2 bg-black/85 border-2 border-white/25 rounded-xl px-3 py-1.5 shadow-md flex flex-col justify-center">
            <div className="flex justify-between items-center text-[10px] sm:text-xs font-comic text-gray-300 mb-1">
              <span className="flex items-center gap-1 text-amber-300">
                <Flag className="w-3 h-3 text-red-500" /> JANTAR MANTAR
              </span>
              <span className="font-mono text-white font-bold bg-white/10 px-1.5 py-0.2 rounded">
                {remainingMeters}m TO GO
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                PARLIAMENT <Building2 className="w-3 h-3 text-amber-400" />
              </span>
            </div>

            {/* Progress track bar */}
            <div className="relative w-full h-2.5 bg-gray-800 rounded-full border border-gray-600 overflow-visible">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-100"
                style={{ width: `${progressRatio * 100}%` }}
              />

              {/* Running avatar icon on track */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-amber-400 border-2 border-black flex items-center justify-center text-[10px] shadow-md transition-all duration-100"
                style={{ left: `${progressRatio * 100}%` }}
              >
                🏃
              </div>
            </div>
          </div>

          {/* Right: Time, Vans, Mute */}
          <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
            {/* Time */}
            <div className="bg-black/85 border-2 border-white/30 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-comic">
              <span className="text-gray-400 mr-1">TIME</span>
              <span className="text-white font-mono font-bold tabular-nums">
                {time.toFixed(1)}s
              </span>
            </div>

            {/* Van Count matching original image */}
            <div className="bg-black/85 border-2 border-blue-500/50 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-comic">
              <span className="text-blue-400 mr-1">VAN</span>
              <span className="text-amber-300 font-bold">×{vanCount}</span>
            </div>

            {/* Mute */}
            <button
              onClick={onToggleMute}
              className="bg-black/80 hover:bg-black border-2 border-white/20 p-1.5 rounded-lg text-amber-300 transition"
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Second Row: Health (जान) & Slogan Shout Meter */}
        <div className="flex items-center justify-between gap-4">
          {/* Health Bar (जान) */}
          <div className="flex items-center gap-2 bg-black/85 border-2 border-white/25 px-3 py-1.5 rounded-xl shadow-md pointer-events-auto min-w-[210px] sm:min-w-[260px]">
            <span className="font-hindi text-base sm:text-lg text-amber-300 font-bold">जान</span>
            <div className="flex-1 h-3.5 bg-gray-900 rounded-full border border-gray-600 overflow-hidden relative">
              <div
                className={`h-full bg-gradient-to-r ${hpColor} transition-all duration-150`}
                style={{ width: `${health}%` }}
              />
            </div>
            <span className="font-comic text-sm sm:text-base font-bold tabular-nums text-white w-12 text-right">
              {health}%
            </span>
          </div>

          {/* Slogan Shout Meter (Key X) */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={onTriggerShout}
              disabled={shoutEnergy < 50}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 font-comic text-xs sm:text-sm transition-all shadow-md ${
                shoutEnergy >= 50
                  ? 'bg-rose-600 hover:bg-rose-500 border-white text-white cursor-pointer active:scale-95 animate-pulse'
                  : 'bg-black/60 border-white/20 text-gray-400 cursor-not-allowed opacity-70'
              }`}
            >
              <Megaphone className="w-4 h-4 text-amber-300" />
              <span>SHOUT (X)</span>
              <span className="text-[10px] font-mono bg-black/40 px-1 py-0.5 rounded">
                {Math.round(shoutEnergy)}%
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
