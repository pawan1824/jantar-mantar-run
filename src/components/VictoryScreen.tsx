import React, { useState } from 'react';
import { Character } from '../types';
import { sounds } from '../audio';
import { Trophy, Share2, RotateCcw, Users, Check, Sparkles, Building2 } from 'lucide-react';

interface VictoryScreenProps {
  character: Character;
  stats: {
    time: number;
    score: number;
    vans: number;
    barricadesCleared: number;
  };
  onPlayAgain: () => void;
  onChangeCharacter: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  character,
  stats,
  onPlayAgain,
  onChangeCharacter,
}) => {
  const [copied, setCopied] = useState(false);

  const getRankTitle = () => {
    if (stats.score > 1200) return '🏆 Supreme Satyagrahi of the Republic';
    if (stats.score > 800) return '⭐ Fearless Constitutional Vanguard';
    return '✊ Undaunted People’s Voice';
  };

  const handleShare = () => {
    sounds.playChaiChime();
    const text = `🚩 I reached PARLIAMENT (संसद भवन) in The Jantar Mantar Run!
Protester: ${character.name} (${character.subtitle})
⏱️ Time: ${stats.time.toFixed(1)}s
🏆 Score: ${stats.score}
🚧 Barricades Cleared: ${stats.barricadesCleared}
🚌 Police Vans Dodged: ${stats.vans}
Rank: ${getRankTitle()}
Play the comic arcade protest run now!`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 z-40 select-none overflow-y-auto">
      <div className="relative max-w-xl w-full bg-gradient-to-b from-[#1b1c2b] via-[#24172f] to-[#140f1c] border-4 border-amber-400 rounded-3xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden">
        {/* Top Victory Banners matching image Panel 7 */}
        <div className="bg-amber-400 text-black font-comic text-xs sm:text-sm uppercase tracking-widest px-4 py-1 rounded-full border-2 border-black inline-block mb-3 font-bold">
          MARCH ACCOMPLISHED • 1200 METERS
        </div>

        <div className="relative">
          <h1 className="font-comic text-4xl sm:text-6xl text-white comic-shadow leading-tight">
            DESTINATION REACHED!
          </h1>
          <div className="font-hindi text-3xl sm:text-4xl text-amber-300 font-black mt-1">
            संसद भवन — PARLIAMENT 🏛️
          </div>
          <p className="font-comic text-base text-gray-300 mt-1">
            From Jantar Mantar down Sansad Marg, democracy perseveres!
          </p>
        </div>

        {/* Character Honor Spotlight */}
        <div className="my-5 p-4 bg-black/60 border-2 border-white/20 rounded-2xl flex items-center gap-4 text-left">
          <div className="text-5xl p-2.5 bg-amber-400/20 border-2 border-amber-400 rounded-xl">
            {character.avatarIcon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-comic text-2xl text-amber-300">{character.name}</span>
              <span className="text-xs bg-red-600/80 px-2 py-0.5 rounded font-mono text-white">
                {character.role}
              </span>
            </div>
            <div className="text-sm font-semibold text-emerald-400 mt-0.5">
              {getRankTitle()}
            </div>
            <div className="text-xs text-gray-300 italic mt-0.5">
              Placard carried: "{character.slogan}"
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
          <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
            <div className="text-[10px] font-comic text-gray-400">TIME</div>
            <div className="font-comic text-2xl text-white font-bold tabular-nums">
              {stats.time.toFixed(1)}s
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
            <div className="text-[10px] font-comic text-gray-400">SCORE</div>
            <div className="font-comic text-2xl text-amber-300 font-bold tabular-nums">
              {stats.score}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
            <div className="text-[10px] font-comic text-gray-400">BARRICADES</div>
            <div className="font-comic text-2xl text-emerald-400 font-bold tabular-nums">
              {stats.barricadesCleared}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
            <div className="text-[10px] font-comic text-gray-400">VAN RIDES</div>
            <div className="font-comic text-2xl text-blue-400 font-bold tabular-nums">
              {stats.vans}
            </div>
          </div>
        </div>

        {/* Action Buttons matching image Panel 7 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <button
            onClick={() => {
              sounds.playJump();
              onPlayAgain();
            }}
            className="w-full sm:w-auto placard-btn px-8 py-3 rounded-xl font-comic text-2xl text-red-600 cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={handleShare}
            className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-black font-comic text-2xl px-6 py-3 rounded-xl border-3 border-black cursor-pointer shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
            <span>{copied ? 'COPIED!' : 'SHARE'}</span>
          </button>
        </div>

        <button
          onClick={() => {
            sounds.playJump();
            onChangeCharacter();
          }}
          className="mt-4 text-xs font-mono text-gray-400 hover:text-amber-300 underline cursor-pointer transition"
        >
          Change character
        </button>
      </div>
    </div>
  );
};
