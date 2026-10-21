import React, { useEffect, useState } from 'react';
import { Character } from '../types';
import { sounds } from '../audio';
import { Siren, Users, ShieldAlert, Sparkles } from 'lucide-react';

interface DetainedScreenProps {
  character: Character;
  vanCount: number;
  onRelease: () => void;
}

const VAN_STORIES = [
  'Sharing Parle-G biscuits and hot tea with fellow activists.',
  'Explaining Article 19 (Right to Freedom of Speech) to the Sub-Inspector.',
  'Singing "Hum Dekhenge" and revolutionary poems in chorus!',
  'Fact-checking the police wireless messages with live data.',
  'Someone started a spontaneous democratic assembly on the back seat!',
  'The constable quietly admitted: "Hamari bhi pension ka issue solve karwa do."',
];

export const DetainedScreen: React.FC<DetainedScreenProps> = ({ character, vanCount, onRelease }) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [story] = useState<string>(() => VAN_STORIES[Math.floor(Math.random() * VAN_STORIES.length)]);

  useEffect(() => {
    sounds.playSiren();
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onRelease();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onRelease]);

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 z-40 select-none">
      {/* Flashing Police Siren Glow */}
      <div className="absolute top-8 flex items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-red-600 animate-ping opacity-75"></div>
        <div className="w-12 h-12 rounded-full bg-blue-600 animate-ping opacity-75"></div>
      </div>

      <div className="relative max-w-xl w-full bg-[#1b1c2b] border-4 border-black rounded-2xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden siren-active">
        {/* Police caution tape header */}
        <div className="caution-stripes h-4 -mx-8 -mt-8 mb-6 border-b-2 border-black"></div>

        {/* Big comic badge */}
        <div className="inline-block bg-red-600 text-white font-comic text-4xl sm:text-5xl px-6 py-2 rounded-xl border-3 border-black transform -rotate-1 shadow-lg mb-3">
          YOU GOT DETAINED!
        </div>

        <p className="font-hindi text-xl sm:text-2xl text-amber-300 font-bold mb-1">
          दिल्ली पुलिस की फ्री वैन सेवा
        </p>
        <p className="font-comic text-sm text-gray-300">
          Dilli Police Bus Ride #{vanCount} • Next Stop: Parliament / Jantar Mantar
        </p>

        {/* Bus Interior Scene / Character Vignette */}
        <div className="my-5 p-4 bg-black/60 border-2 border-white/20 rounded-xl text-left flex items-start gap-3">
          <div className="text-4xl p-2 bg-blue-900/40 border border-blue-500/40 rounded-lg">
            🚌
          </div>
          <div>
            <div className="font-comic text-amber-300 text-sm flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>INSIDE THE POLICE BUS:</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-200 mt-1 italic leading-relaxed">
              "{story}"
            </p>
            <div className="mt-2 text-[11px] font-mono text-emerald-400">
              {character.name} encourages everyone: "{character.slogan}"
            </div>
          </div>
        </div>

        {/* Big Siren Countdown */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="text-xs font-comic text-gray-400 uppercase tracking-widest mb-1">
            Released in...
          </div>
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 border-4 border-white flex items-center justify-center shadow-lg animate-bounce">
            <span className="font-comic text-5xl text-white font-black">{countdown}</span>
          </div>
        </div>

        <p className="font-comic text-sm text-amber-200 mt-2">
          Don't worry, the fight continues...
        </p>

        {/* Instant Release Button */}
        <button
          onClick={() => {
            sounds.playJump();
            onRelease();
          }}
          className="mt-4 placard-btn px-8 py-2.5 rounded-xl font-comic text-xl text-red-600 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
        >
          <span>JUMP OUT OF VAN NOW ➔</span>
        </button>
      </div>
    </div>
  );
};
