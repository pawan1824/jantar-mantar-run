import React from 'react';
import { Character } from '../types';
import { sounds } from '../audio';
import { RotateCcw, ShieldX, Navigation } from 'lucide-react';

interface GameOverScreenProps {
  character: Character;
  reason: string;
  score: number;
  distance: number;
  totalDistance: number;
  time: number;
  onRetry: () => void;
  onChangeCharacter: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  character,
  reason,
  score,
  distance,
  totalDistance,
  time,
  onRetry,
  onChangeCharacter,
}) => {
  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 z-40 select-none">
      <div className="relative max-w-md w-full bg-[#1e1526] border-4 border-red-600 rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 mx-auto flex items-center justify-center text-red-500 mb-4 animate-bounce">
          <ShieldX className="w-8 h-8" />
        </div>

        <h2 className="font-comic text-4xl sm:text-5xl text-red-500 comic-shadow leading-tight">
          GAME OVER
        </h2>
        <div className="font-hindi text-lg text-amber-300 font-bold mt-1">
          हिम्मत मत हारो!
        </div>

        <p className="text-xs sm:text-sm text-gray-300 my-3 leading-relaxed">
          {reason}
        </p>

        {/* Run progress bar */}
        <div className="bg-black/60 p-3 rounded-xl border border-white/10 my-4 text-left">
          <div className="flex justify-between text-xs font-comic text-gray-300 mb-1.5">
            <span>DISTANCE REACHED</span>
            <span className="text-amber-400 font-mono font-bold">
              {Math.round(distance)}m / {totalDistance}m
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${Math.min(100, (distance / totalDistance) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs text-gray-400 mt-2 font-mono">
            <span>Score: <b className="text-white">{score}</b></span>
            <span>Time: <b className="text-white">{time.toFixed(1)}s</b></span>
          </div>
        </div>

        {/* Retry Button */}
        <div className="flex flex-col gap-3 mt-5">
          <button
            onClick={() => {
              sounds.playJump();
              onRetry();
            }}
            className="placard-btn py-3 px-6 rounded-xl font-comic text-2xl text-red-600 cursor-pointer flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-transform"
          >
            <RotateCcw className="w-5 h-5" />
            <span>TRY AGAIN</span>
          </button>

          <button
            onClick={() => {
              sounds.playJump();
              onChangeCharacter();
            }}
            className="text-xs font-mono text-gray-400 hover:text-amber-300 underline cursor-pointer transition py-1"
          >
            Change character ({character.name})
          </button>
        </div>
      </div>
    </div>
  );
};
