import React from 'react';
import { Faction } from '../types';
import { EyeOff, ArrowRight } from 'lucide-react';

interface PassDeviceModalProps {
  nextPlayerFaction: Faction;
  onConfirmReady: () => void;
}

export const PassDeviceModal: React.FC<PassDeviceModalProps> = ({
  nextPlayerFaction,
  onConfirmReady,
}) => {
  const isUS = nextPlayerFaction === 'US';

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md bg-[#0c0d0c] border rounded-lg p-6 sm:p-8 shadow-2xl text-[#d1d5db] text-center ${
          isUS ? 'border-blue-500/60' : 'border-green-500/60'
        }`}
      >
        <div
          className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-3 border ${
            isUS
              ? 'bg-blue-950/60 border-blue-400 text-blue-300 shadow-[0_0_15px_rgba(96,165,250,0.5)]'
              : 'bg-green-950/60 border-green-400 text-green-300 shadow-[0_0_15px_rgba(74,222,128,0.5)]'
          }`}
        >
          <EyeOff className="w-7 h-7" />
        </div>

        <h2 className="stencil text-2xl font-bold uppercase tracking-wider text-white mb-1">
          Pass Device to {isUS ? 'US Forces' : 'NLF Guerrilla'}
        </h2>

        <p className="text-xs text-white/50 font-mono mb-6 leading-relaxed">
          Tactical confidentiality active. Please pass the device so your opponent cannot view concealed units or strategic hand reserves.
        </p>

        <button
          onClick={onConfirmReady}
          className={`w-full py-3 px-4 rounded font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
            isUS
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-green-600 hover:bg-green-500 text-white'
          }`}
        >
          <span>I Am Ready &bull; Reveal Hand</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
