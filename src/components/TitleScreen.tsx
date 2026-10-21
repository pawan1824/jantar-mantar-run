import React from 'react';
import { CHARACTERS } from '../characters';
import { Volume2, VolumeX, Shield, Sparkles } from 'lucide-react';
import { sounds } from '../audio';

interface TitleScreenProps {
  onStart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, isMuted, onToggleMute }) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center bg-gradient-to-b from-[#1c2331] via-[#2c1f38] to-[#120a16] text-white p-4 sm:p-6 overflow-hidden select-none">
      {/* Background Delhi landmark silhouette */}
      <div className="absolute inset-0 opacity-20 pointer-events-none flex items-end justify-center">
        <svg viewBox="0 0 1200 400" className="w-full h-auto max-h-[50vh]">
          {/* India Gate / CP Colonnade silhouette */}
          <path
            d="M50 400 L50 240 L180 240 L180 400 M600 400 L520 220 L520 180 L540 180 L540 140 L570 140 L570 110 L630 110 L630 140 L660 140 L660 180 L680 180 L680 220 L600 400 M1000 400 L1000 240 L1150 240 L1150 400"
            fill="#e2e8f0"
          />
        </svg>
      </div>

      {/* Halftone texture overlay */}
      <div className="absolute inset-0 halftone-overlay opacity-30 pointer-events-none" />

      {/* Top Bar with Audio Toggle & Info */}
      <div className="w-full flex justify-between items-center z-20 max-w-5xl">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xs border border-white/20 px-3 py-1.5 rounded-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-teko text-lg tracking-wider text-amber-300">ROUTE: JANTAR MANTAR ➔ PARLIAMENT (1200M)</span>
        </div>

        <button
          onClick={onToggleMute}
          className="bg-black/60 hover:bg-black/80 border border-white/20 p-2 rounded-md transition text-amber-300 hover:text-white"
          aria-label="Toggle sound"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Center Title Lockup matching image Panel 1 */}
      <div className="flex flex-col items-center text-center z-20 my-auto max-w-4xl">
        {/* Subtitle tag */}
        <div className="bg-[#ffd23f] text-[#1d1424] font-comic px-4 py-1 text-sm sm:text-base uppercase tracking-wider border-2 border-black -rotate-1 shadow-md mb-2">
          THE MARCH TO PARLIAMENT • संसद मार्च
        </div>

        {/* Main Title Heading */}
        <div className="relative">
          <h1 className="font-comic text-5xl sm:text-7xl md:text-8xl tracking-tight text-white comic-shadow transform -rotate-1 leading-none">
            THE JANTAR MANTAR
          </h1>
          <div className="font-comic text-6xl sm:text-8xl md:text-9xl text-[#ef4444] comic-shadow-red font-black tracking-wider leading-none mt-1">
            RUN
          </div>
          <div className="font-hindi text-xl sm:text-2xl text-amber-300 mt-1 font-bold tracking-wide">
            द जंतर मंतर रन — Run for a Better Tomorrow
          </div>
        </div>

        {/* Character Lineup Preview (5 heroes as in the image) */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mt-6 mb-8">
          {CHARACTERS.map((char) => (
            <div
              key={char.id}
              className="flex flex-col items-center bg-black/50 border border-white/20 hover:border-amber-400 px-3 py-2 rounded-lg transition-transform hover:scale-105"
            >
              <div className="text-3xl mb-1">{char.avatarIcon}</div>
              <div className="font-comic text-sm sm:text-base text-amber-300">{char.name}</div>
              <div className="text-[10px] text-gray-300 font-medium">{char.subtitle}</div>
            </div>
          ))}
        </div>

        {/* Big PLAY Placard Button */}
        <button
          onClick={() => {
            sounds.playJump();
            onStart();
          }}
          className="placard-btn group relative px-12 sm:px-16 py-4 rounded-xl cursor-pointer shadow-2xl transition-all"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-red-600 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="font-comic text-4xl sm:text-5xl tracking-wider text-red-600 group-hover:scale-105 transition-transform inline-block">
              PLAY
            </span>
            <span className="font-hindi text-xl text-gray-800 font-bold ml-1">खेलें</span>
          </div>
        </button>

        <p className="mt-4 font-teko text-base sm:text-lg text-amber-200 tracking-wide">
          Choose Your Fighter • Run • Avoid Police • Reach Parliament (संसद भवन)
        </p>
      </div>

      {/* Footer Controls & Hints */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 z-20 max-w-5xl text-xs sm:text-sm text-gray-300 border-t border-white/10 pt-3">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="bg-black/60 border border-white/20 px-2 py-1 rounded font-mono text-amber-400">
            ↑ / SPACE : JUMP
          </span>
          <span className="bg-black/60 border border-white/20 px-2 py-1 rounded font-mono text-amber-400">
            ← → : MOVE
          </span>
          <span className="bg-black/60 border border-white/20 px-2 py-1 rounded font-mono text-amber-400">
            ↓ : DUCK
          </span>
          <span className="bg-black/60 border border-white/20 px-2 py-1 rounded font-mono text-amber-400">
            X : SLOGAN SHOUT
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-gray-400">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Mobile: Virtual Joystick & Tap Jump</span>
        </div>
      </div>
    </div>
  );
};
