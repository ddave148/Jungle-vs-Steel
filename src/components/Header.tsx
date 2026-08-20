import React from 'react';
import { Faction, GameMode } from '../types';
import { soundManager } from '../utils/audio';
import { 
  BookOpen, 
  History, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Swords,
  Bot
} from 'lucide-react';

interface HeaderProps {
  currentRound: number;
  maxRounds: number;
  activePlayer: Faction;
  gameMode: GameMode;
  usZoneMarkers: number;
  nlfZoneMarkers: number;
  targetMarkers: number;
  onSelectGameMode: (mode: GameMode) => void;
  onOpenRulebook: () => void;
  onOpenHistory: () => void;
  onResetGame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isAiThinking: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRound,
  maxRounds,
  activePlayer,
  gameMode,
  usZoneMarkers,
  nlfZoneMarkers,
  targetMarkers,
  onSelectGameMode,
  onOpenRulebook,
  onOpenHistory,
  onResetGame,
  soundEnabled,
  onToggleSound,
  isAiThinking,
}) => {
  return (
    <header className="w-full bg-[#0c0d0c] border-b border-white/10 px-4 sm:px-6 py-3.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Title / Stencil Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#151815] border border-white/10 flex items-center justify-center shadow-inner">
            <Swords className="w-5 h-5 text-white/80" />
          </div>
          <div>
            <h1 className="stencil text-2xl sm:text-3xl font-bold tracking-tighter text-white">
              Jungle <span className="text-white/30 font-normal">vs.</span> Steel
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-white/50 font-mono">
              Tactical Asymmetry Simulation &bull; Field Manual v1.02
            </p>
          </div>
        </div>

        {/* Center: Objective & Engagement / Zone Score Status */}
        <div className="flex items-center gap-5 bg-[#141614]/90 border border-white/10 px-4 py-2 rounded-lg shadow-inner">
          {/* US Score */}
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono font-bold uppercase us-accent tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_8px_#60a5fa]" />
                US Forces
              </span>
              <span className="text-[11px] font-mono text-white/60">
                {usZoneMarkers} / {targetMarkers} Zones
              </span>
            </div>
            <div className="flex gap-1">
              {[...Array(targetMarkers)].map((_, i) => (
                <div
                  key={`us-marker-${i}`}
                  className={`w-3.5 h-5 rounded-xs border transition-all ${
                    i < usZoneMarkers
                      ? 'bg-blue-600 border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]'
                      : 'bg-white/5 border-white/10'
                  }`}
                  title={`US Zone Marker ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Round Divider */}
          <div className="px-3 py-1 rounded bg-black/50 border border-white/10 text-center min-w-[76px]">
            <div className="text-[9px] uppercase tracking-widest font-mono text-white/40">Round</div>
            <div className="text-sm font-mono font-bold text-white">
              {currentRound} <span className="text-white/30 font-normal">/ {maxRounds}</span>
            </div>
          </div>

          {/* NLF Score */}
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1">
              {[...Array(targetMarkers)].map((_, i) => (
                <div
                  key={`nlf-marker-${i}`}
                  className={`w-3.5 h-5 rounded-xs border transition-all ${
                    i < nlfZoneMarkers
                      ? 'bg-green-600 border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]'
                      : 'bg-white/5 border-white/10'
                  }`}
                  title={`NLF Zone Marker ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-mono font-bold uppercase nlf-accent tracking-wider flex items-center gap-1.5">
                NLF Guerrilla
                <span className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_8px_#4ade80]" />
              </span>
              <span className="text-[11px] font-mono text-white/60">
                {nlfZoneMarkers} / {targetMarkers} Zones
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions & Mode Selector */}
        <div className="flex items-center gap-2">
          {/* Game Mode Dropdown */}
          <div className="relative inline-block">
            <select
              value={gameMode}
              onChange={(e) => onSelectGameMode(e.target.value as GameMode)}
              className="bg-[#141614] text-xs font-mono text-white/80 border border-white/10 rounded px-2.5 py-1.5 focus:outline-none focus:border-white/40 cursor-pointer"
            >
              <option value="VS_AI_AS_US">VS AI (You: US Forces)</option>
              <option value="VS_AI_AS_NLF">VS AI (You: NLF Guerrilla)</option>
              <option value="PASS_AND_PLAY">2P Pass & Play</option>
            </select>
          </div>

          {/* Rulebook */}
          <button
            onClick={onOpenRulebook}
            title="Field Manual & Card Intel"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs font-mono uppercase text-white/80 border border-white/10 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Manual</span>
          </button>

          {/* History Dossier */}
          <button
            onClick={onOpenHistory}
            title="Historical Asymmetry Dossier"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs font-mono uppercase text-white/80 border border-white/10 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Dossier</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              if (!soundEnabled) soundManager.playTurnChime();
            }}
            title={soundEnabled ? 'Mute Audio FX' : 'Enable Audio FX'}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-white/30" />
            )}
          </button>

          {/* Reset */}
          <button
            onClick={onResetGame}
            title="Reset Simulation"
            className="p-1.5 rounded bg-white/5 hover:bg-red-950/60 text-white/80 hover:text-red-400 border border-white/10 hover:border-red-500/40 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-bar / Initiative telemetry */}
      <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-mono">
          <span className="text-white/40 uppercase text-[10px] tracking-wider">Current Initiative:</span>
          {activePlayer === 'US' ? (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-900/30 border border-blue-500/50 us-accent flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              US Forces Turn
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-green-900/30 border border-green-500/50 nlf-accent flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              NLF Guerrilla Turn
            </span>
          )}

          {isAiThinking && (
            <span className="flex items-center gap-1.5 text-[11px] text-amber-300 ml-3">
              <Bot className="w-3.5 h-3.5 animate-spin" />
              <span className="opacity-80">Calculating tactical move...</span>
            </span>
          )}
        </div>

        <div className="hidden md:flex items-center gap-6 text-[10px] font-mono text-white/40 uppercase">
          <span>Objective: Win 2/3 Zones</span>
          <span>&bull;</span>
          <span>1 Action / Pass per turn</span>
          <span>&bull;</span>
          <span>Consecutive passes trigger Combat</span>
        </div>
      </div>
    </header>
  );
};
