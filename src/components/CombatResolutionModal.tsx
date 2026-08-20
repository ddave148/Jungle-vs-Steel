import React from 'react';
import { Faction, RoundResult, ZoneId, ZoneState } from '../types';
import { Swords, Flag, Award, ArrowRight } from 'lucide-react';

interface CombatResolutionModalProps {
  roundResult: RoundResult;
  zones: Record<ZoneId, ZoneState>;
  usScore: number;
  nlfScore: number;
  targetMarkers: number;
  currentRound: number;
  maxRounds: number;
  isGameOver: boolean;
  gameWinner: Faction | 'TIE' | null;
  onProceedNextRound: () => void;
}

export const CombatResolutionModal: React.FC<CombatResolutionModalProps> = ({
  roundResult,
  zones,
  usScore,
  nlfScore,
  targetMarkers,
  currentRound,
  maxRounds,
  isGameOver,
  gameWinner,
  onProceedNextRound,
}) => {
  const zoneKeys: ZoneId[] = ['ZONE_A', 'ZONE_B', 'ZONE_C'];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0c0d0c] border border-white/15 rounded-lg p-5 sm:p-7 shadow-2xl text-[#d1d5db] flex flex-col">
        {/* Header */}
        <div className="text-center pb-4 border-b border-white/10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-[#141614] border border-white/10 mb-2">
            <Swords className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="stencil text-2xl font-bold uppercase tracking-wider text-white">
            Round {roundResult.roundNumber} Combat Resolution
          </h2>
          <p className="text-xs text-white/50 font-mono">
            Hidden units revealed &bull; Ambush bonuses calculated &bull; Zone dominance assessed
          </p>
        </div>

        {/* 3 Zone Results Breakdown */}
        <div className="py-5 space-y-3">
          {zoneKeys.map((zId) => {
            const winner = roundResult.zoneWinners[zId];
            const usPwr = roundResult.usAttack[zId] ?? 0;
            const nlfPwr = roundResult.nlfAttack[zId] ?? 0;
            const zoneInfo = zones[zId];

            const isUsWinner = winner === 'US';
            const isNlfWinner = winner === 'NLF';
            const isTie = winner === 'TIE' || !winner;

            return (
              <div
                key={zId}
                className={`panel-bg p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isUsWinner
                    ? 'border-blue-500/40 bg-blue-950/20'
                    : isNlfWinner
                    ? 'border-green-500/40 bg-green-950/20'
                    : 'border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="stencil text-base font-bold text-white">
                      {zoneInfo?.name || zId}
                    </h4>
                    {!isTie && (
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${
                          isUsWinner
                            ? 'bg-blue-900/40 border-blue-500 text-blue-300'
                            : 'bg-green-900/40 border-green-500 text-green-300'
                        }`}
                      >
                        <Flag className="w-2.5 h-2.5" />
                        Zone Awarded
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/50 font-mono mt-1">
                    US Firepower: <strong className="text-blue-400 font-bold">{usPwr} ATK</strong> &bull; NLF Insurgency: <strong className="text-green-400 font-bold">{nlfPwr} ATK</strong>
                    {roundResult.rpgBonusUnits.length > 0 && zId === 'ZONE_A' && (
                      <span className="text-amber-400 block text-[10px] mt-0.5">
                        * RPG Ambush bonuses included (+2 ATK on reveal)
                      </span>
                    )}
                  </p>
                </div>

                {/* Outcome Badge */}
                <div className="text-right flex items-center gap-2 justify-end">
                  {isTie ? (
                    <span className="text-xs font-mono font-bold text-white/40 uppercase px-2.5 py-1 rounded bg-white/5 border border-white/10">
                      Stalemate (No Marker)
                    </span>
                  ) : isUsWinner ? (
                    <span className="text-xs font-mono font-bold us-accent uppercase px-2.5 py-1 rounded bg-blue-950/50 border border-blue-500/50 shadow-[0_0_8px_rgba(96,165,250,0.4)]">
                      US Forces Victory (+1 Marker)
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-bold nlf-accent uppercase px-2.5 py-1 rounded bg-green-950/50 border border-green-500/50 shadow-[0_0_8px_rgba(74,222,128,0.4)]">
                      NLF Victory (+1 Marker)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Match Standing */}
        <div className="panel-bg p-4 rounded-lg border border-white/10 flex items-center justify-between my-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="stencil text-xs font-bold text-white uppercase">
              Campaign Score
            </span>
          </div>

          <div className="flex items-center gap-6 font-mono text-sm font-bold">
            <span className="us-accent">US Forces: {usScore} / {targetMarkers}</span>
            <span className="text-white/20">|</span>
            <span className="nlf-accent">NLF Guerrilla: {nlfScore} / {targetMarkers}</span>
          </div>
        </div>

        {/* Footer Button */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onProceedNextRound}
            className="px-5 py-2 rounded bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <span>{isGameOver ? 'View Final Campaign Outcome' : `Advance to Round ${currentRound + 1}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
