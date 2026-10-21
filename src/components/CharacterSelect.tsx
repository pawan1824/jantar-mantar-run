import React, { useState } from 'react';
import { Character } from '../types';
import { CHARACTERS } from '../characters';
import { sounds } from '../audio';
import { ArrowLeft, Check, Shield, Zap, Sparkles, Navigation } from 'lucide-react';

interface CharacterSelectProps {
  onSelectCharacter: (char: Character) => void;
  onBack: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelectCharacter, onBack }) => {
  const [selectedId, setSelectedId] = useState<string>(CHARACTERS[0].id);

  const activeChar = CHARACTERS.find((c) => c.id === selectedId) || CHARACTERS[0];

  const handleConfirm = () => {
    sounds.playJump();
    onSelectCharacter(activeChar);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-gradient-to-b from-[#181a24] via-[#20182b] to-[#110d18] text-white p-3 sm:p-6 overflow-y-auto select-none">
      {/* Halftone texture */}
      <div className="absolute inset-0 halftone-overlay opacity-25 pointer-events-none" />

      {/* Top Header */}
      <div className="w-full flex items-center justify-between max-w-6xl mx-auto z-10 border-b border-white/10 pb-3">
        <button
          onClick={() => {
            sounds.playJump();
            onBack();
          }}
          className="flex items-center gap-1.5 font-comic text-base sm:text-lg bg-black/60 hover:bg-black/90 border border-white/30 px-3 py-1.5 rounded-lg text-amber-300 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>BACK</span>
        </button>

        <div className="text-center">
          <h2 className="font-hindi text-2xl sm:text-3xl text-amber-300 font-bold">कौन चलेगा?</h2>
          <p className="font-comic text-base sm:text-lg text-gray-300 tracking-wider">PICK YOUR PROTESTER</p>
        </div>

        <div className="hidden sm:block text-xs font-mono text-gray-400 bg-black/40 px-3 py-1 rounded border border-white/10">
          DESTINATION: PARLIAMENT (1200M)
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 my-auto py-4 z-10">
        {/* Left Side: Character Cards Grid (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {CHARACTERS.map((char) => {
              const isSelected = char.id === selectedId;
              return (
                <button
                  key={char.id}
                  onClick={() => {
                    sounds.playClearBarricade();
                    setSelectedId(char.id);
                  }}
                  className={`relative flex flex-col items-center p-3 rounded-xl border-3 transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'border-amber-400 bg-gradient-to-b from-amber-500/20 to-black/80 scale-[1.03] shadow-lg shadow-amber-500/20'
                      : 'border-white/15 bg-black/40 hover:border-white/40 hover:bg-black/60'
                  }`}
                >
                  {/* Selected check badge */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 bg-amber-400 text-black p-0.5 rounded-full">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}

                  <div className="text-4xl my-2 p-2 bg-white/5 rounded-full border border-white/10">
                    {char.avatarIcon}
                  </div>

                  <div className="font-comic text-lg sm:text-xl text-center leading-tight text-white mt-1">
                    {char.name}
                  </div>
                  <div className="text-[11px] text-amber-300 font-semibold text-center mt-0.5">
                    {char.subtitle}
                  </div>

                  {/* Character special badge */}
                  <div className="mt-2 text-[10px] bg-white/10 border border-white/15 px-1.5 py-0.5 rounded text-center text-gray-300 w-full truncate">
                    {char.role}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Character Detail Spotlight Box */}
          <div className="bg-black/60 border-2 border-white/20 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 mt-1">
            <div className="text-5xl p-3 bg-amber-400/10 border-2 border-amber-400/40 rounded-2xl flex-shrink-0">
              {activeChar.avatarIcon}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="font-comic text-2xl sm:text-3xl text-amber-300">{activeChar.name}</h3>
                <span className="font-hindi text-base text-gray-300">({activeChar.hindiName})</span>
                <span className="bg-red-600/80 text-white font-comic text-xs px-2 py-0.5 rounded">
                  {activeChar.role}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 mt-1">{activeChar.description}</p>

              {/* Trait & Placard */}
              <div className="mt-2.5 flex flex-wrap gap-2 justify-center sm:justify-start">
                <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-400/40 px-2.5 py-1 rounded text-xs text-amber-200">
                  <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>{activeChar.trait}</span>
                </div>
                <div className="flex items-center gap-1 bg-white/10 border border-white/20 px-2.5 py-1 rounded text-xs text-gray-200 font-mono">
                  <span>Placard:</span>
                  <span className="text-red-400 font-bold">"{activeChar.slogan}"</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Controls & Legend (4 cols, matching image Panel 2) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3">
          {/* Controls Box */}
          <div className="bg-black/70 border-2 border-white/20 p-4 rounded-xl">
            <div className="font-comic text-xl text-amber-300 border-b border-white/20 pb-2 mb-3 flex items-center justify-between">
              <span>CONTROLS</span>
              <span className="text-xs font-mono text-gray-400">DESKTOP & MOBILE</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                <div className="font-bold text-amber-400 mb-1.5 flex items-center gap-1">
                  <span>KEYBOARD</span>
                </div>
                <div className="space-y-1 font-mono text-gray-300">
                  <div><kbd className="bg-gray-800 px-1 py-0.5 rounded text-white border border-gray-600">↑</kbd> / <kbd className="bg-gray-800 px-1 py-0.5 rounded text-white border border-gray-600">Space</kbd> = Jump</div>
                  <div><kbd className="bg-gray-800 px-1 py-0.5 rounded text-white border border-gray-600">←</kbd> <kbd className="bg-gray-800 px-1 py-0.5 rounded text-white border border-gray-600">→</kbd> = Move / Sprint</div>
                  <div><kbd className="bg-gray-800 px-1 py-0.5 rounded text-white border border-gray-600">↓</kbd> = Duck Slide</div>
                  <div><kbd className="bg-gray-800 px-1 py-0.5 rounded text-white border border-gray-600">X</kbd> = Slogan Blast</div>
                </div>
              </div>

              <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                <div className="font-bold text-amber-400 mb-1.5 flex items-center gap-1">
                  <span>TOUCH / MOBILE</span>
                </div>
                <div className="space-y-1 text-gray-300">
                  <div>🕹️ Virtual Joystick</div>
                  <div>Drag to Move & Sprint</div>
                  <div>Tap <b className="text-amber-400">JUMP</b> button</div>
                  <div>Tap <b className="text-red-400">SHOUT</b> button</div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend Box matching the user HTML & image */}
          <div className="bg-black/70 border-2 border-white/20 p-3.5 rounded-xl space-y-2 text-xs">
            <div className="font-comic text-base text-gray-300">HAZARD LEGEND</div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-500 flex-shrink-0"></span>
              <span><b className="text-blue-400">Delhi Police Bus</b> = 5 sec van ride</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 flex-shrink-0"></span>
              <span><b className="text-red-400">Stick squad (Lathi)</b> = −50% जान</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 flex-shrink-0"></span>
              <span><b className="text-amber-300">Barricades</b> = Jump or Ram it!</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
              <span><b className="text-emerald-400">Garam Cutting Chai</b> = +25% जान</span>
            </div>
          </div>

          {/* Big Yellow SELECT Button matching image Panel 2 */}
          <button
            onClick={handleConfirm}
            className="w-full bg-[#ffd23f] hover:bg-[#ffe066] text-[#1d1424] font-comic text-3xl py-3.5 px-6 rounded-xl border-3 border-black shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>SELECT & RUN</span>
            <Navigation className="w-6 h-6 rotate-90" />
          </button>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="w-full text-center text-xs text-gray-400 font-mono z-10 pt-2 border-t border-white/10">
        March from Jantar Mantar (0m) down Sansad Marg to Indian Parliament (1200m)
      </div>
    </div>
  );
};
