import React from 'react';
import { Faction } from '../types';

interface AmmoDisplayProps {
  faction: Faction;
  ammo: number;
  maxAmmo?: number;
  label?: string;
  isCurrentPlayer?: boolean;
}

export const AmmoDisplay: React.FC<AmmoDisplayProps> = ({
  faction,
  ammo,
  maxAmmo = 5,
  label = 'Ammo Tokens',
  isCurrentPlayer = false,
}) => {
  const isUS = faction === 'US';
  const tokens = Array.from({ length: maxAmmo });

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all ${
        isUS
          ? isCurrentPlayer
            ? 'bg-blue-950/40 border-blue-500/60 shadow-[0_0_12px_rgba(96,165,250,0.3)]'
            : 'bg-black/40 border-white/10'
          : isCurrentPlayer
          ? 'bg-green-950/40 border-green-500/60 shadow-[0_0_12px_rgba(74,222,128,0.3)]'
          : 'bg-black/40 border-white/10'
      }`}
    >
      <div className="flex flex-col">
        <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">
          {label}
        </span>
        <div className="flex items-center gap-1">
          <span
            className={`font-mono text-sm font-bold ${
              isUS ? 'us-accent' : 'nlf-accent'
            }`}
          >
            {ammo}
          </span>
          <span className="text-[9px] font-mono text-white/30">/ {maxAmmo}</span>
        </div>
      </div>

      {/* Cartridge/Coin Tokens */}
      <div className="flex items-center gap-1 ml-2">
        {tokens.map((_, index) => {
          const isFilled = index < ammo;
          return (
            <div
              key={`ammo-${faction}-${index}`}
              title={`Ammo Token ${index + 1} (${isFilled ? 'Active' : 'Expended'})`}
              className={`relative w-3.5 h-5 rounded-xs border transition-all duration-200 flex items-center justify-center ${
                isFilled
                  ? isUS
                    ? 'bg-gradient-to-b from-blue-400 via-blue-600 to-blue-800 border-blue-300 shadow-[0_0_8px_rgba(96,165,250,0.8)]'
                    : 'bg-gradient-to-b from-green-400 via-green-600 to-green-800 border-green-300 shadow-[0_0_8px_rgba(74,222,128,0.8)]'
                  : 'bg-white/5 border-white/10 opacity-30 scale-90'
              }`}
            >
              {isFilled && (
                <div className="w-1 h-1 rounded-full bg-white/80" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
