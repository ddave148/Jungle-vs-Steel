import React from 'react';
import { Faction, GameMode, ZoneId, ZoneState } from '../types';
import { Trophy, RotateCcw, Swords, Shield, Users, Bot, CheckCircle2 } from 'lucide-react';

interface GameOverModalProps {
  winner: Faction | 'TIE';
  usScore: number;
  nlfScore: number;
  roundsPlayed: number;
  roundHistory: Array<{ round: number; zoneWinners: Record<ZoneId, Faction | 'TIE'> }>;
  zones: Record<ZoneId, ZoneState>;
  onRestart: () => void;
  onSelectGameMode?: (mode: GameMode) => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  usScore,
  nlfScore,
  roundsPlayed,
  roundHistory,
  zones,
  onRestart,
  onSelectGameMode,
}) => {
  const isUS = winner === 'US';
  const isNLF = winner === 'NLF';
  const isDraw = winner === 'TIE';

  const zoneKeys: ZoneId[] = ['ZONE_A', 'ZONE_B', 'ZONE_C'];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className={`w-full max-w-2xl bg-[#0c0d0c] border rounded-lg p-6 sm:p-8 shadow-2xl text-[#d1d5db] text-center my-auto ${
          isUS
            ? 'border-blue-500/60'
            : isNLF
            ? 'border-green-500/60'
            : 'border-amber-500/60'
        }`}
      >
        {/* Victory / Draw Icon */}
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 border ${
            isUS
              ? 'bg-blue-950/60 border-blue-400 text-blue-300 shadow-[0_0_20px_rgba(96,165,250,0.6)]'
              : isNLF
              ? 'bg-green-950/60 border-green-400 text-green-300 shadow-[0_0_20px_rgba(74,222,128,0.6)]'
              : 'bg-amber-950/50 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.4)]'
          }`}
        >
          {isDraw ? <Swords className="w-8 h-8" /> : <Trophy className="w-8 h-8" />}
        </div>

        {/* Victory / Draw Headline */}
        <h2 className="stencil text-3xl font-bold uppercase tracking-wider text-white mb-1">
          {isUS
            ? 'US Forces Decisive Victory!'
            : isNLF
            ? 'NLF Guerrilla Decisive Victory!'
            : 'Campaign Ended in a Draw!'}
        </h2>

        <p className="text-xs text-white/60 font-mono mb-5 max-w-lg mx-auto">
          {isUS
            ? 'Superior firepower, air cavalry mobility, and logistical dominance secured decisive sector control across Vietnam.'
            : isNLF
            ? 'Insurgency tactics, subterranean tunnel mastery, and lethal ambushes overwhelmed conventional superiority.'
            : 'Operational Stalemate — Both forces fought to an exact tactical deadlock with equal campaign markers.'}
        </p>

        {/* Score Card Box */}
        <div className="panel-bg p-4 rounded-lg border border-white/10 max-w-md mx-auto mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
              Final Campaign Standings ({roundsPlayed} Rounds)
            </span>
            {isDraw && (
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                Draw
              </span>
            )}
          </div>
          <div className="flex items-center justify-around font-mono">
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase text-blue-300 font-bold flex items-center gap-1">
                <Shield className="w-3 h-3" /> US Forces
              </span>
              <span className="text-3xl font-bold us-accent">{usScore}</span>
              <span className="text-[9px] text-white/40">Zone Markers Won</span>
            </div>
            <span className="text-white/20 text-xl font-thin">VS</span>
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase text-green-300 font-bold flex items-center gap-1">
                <Shield className="w-3 h-3" /> NLF Guerrilla
              </span>
              <span className="text-3xl font-bold nlf-accent">{nlfScore}</span>
              <span className="text-[9px] text-white/40">Zone Markers Won</span>
            </div>
          </div>
        </div>

        {/* Round by Round Battle Breakdown */}
        {roundHistory.length > 0 && (
          <div className="panel-bg p-3 rounded-lg border border-white/10 max-w-md mx-auto mb-6 text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-2 text-center">
              Campaign Sector Log
            </span>
            <div className="space-y-1.5 font-mono text-[11px]">
              {roundHistory.map((hist) => (
                <div
                  key={`hist-round-${hist.round}`}
                  className="flex items-center justify-between bg-black/40 px-2.5 py-1.5 rounded border border-white/5"
                >
                  <span className="text-white/70 font-bold">Round {hist.round}</span>
                  <div className="flex items-center gap-2">
                    {zoneKeys.map((zId) => {
                      const zw = hist.zoneWinners[zId];
                      return (
                        <span
                          key={zId}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                            zw === 'US'
                              ? 'bg-blue-950/60 border-blue-500/60 text-blue-300'
                              : zw === 'NLF'
                              ? 'bg-green-950/60 border-green-500/60 text-green-300'
                              : 'bg-white/5 border-white/10 text-white/40'
                          }`}
                        >
                          {zones[zId]?.name?.split(' ')[0] || zId}: {zw || 'TIE'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onRestart}
            className="w-full sm:w-auto px-6 py-2.5 rounded bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Launch New Simulation</span>
          </button>

          {onSelectGameMode && (
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center">
              <button
                onClick={() => onSelectGameMode('VS_AI_AS_US')}
                className="px-3 py-2 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] font-mono font-bold uppercase text-blue-300 flex items-center gap-1 cursor-pointer"
                title="Play as US Forces vs AI Bot"
              >
                <Bot className="w-3 h-3" /> US vs AI
              </button>
              <button
                onClick={() => onSelectGameMode('VS_AI_AS_NLF')}
                className="px-3 py-2 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] font-mono font-bold uppercase text-green-300 flex items-center gap-1 cursor-pointer"
                title="Play as NLF Guerrilla vs AI Bot"
              >
                <Bot className="w-3 h-3" /> NLF vs AI
              </button>
              <button
                onClick={() => onSelectGameMode('PASS_AND_PLAY')}
                className="px-3 py-2 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] font-mono font-bold uppercase text-amber-300 flex items-center gap-1 cursor-pointer"
                title="2-Player Local Pass & Play"
              >
                <Users className="w-3 h-3" /> 2P Pass
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

