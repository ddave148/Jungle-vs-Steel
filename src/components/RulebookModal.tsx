import React, { useState } from 'react';
import { CARD_DEFINITIONS } from '../data/cards';
import { CardItem } from './CardItem';
import { BookOpen, X, Shield, Trees, HelpCircle, Layers, Swords, Zap } from 'lucide-react';

interface RulebookModalProps {
  onClose: () => void;
}

export const RulebookModal: React.FC<RulebookModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PHASES' | 'US_CARDS' | 'NLF_CARDS' | 'FAQ'>('OVERVIEW');

  const usCards = Object.values(CARD_DEFINITIONS).filter((c) => c.faction === 'US');
  const nlfCards = Object.values(CARD_DEFINITIONS).filter((c) => c.faction === 'NLF');

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#0c0d0c] border border-white/15 rounded-lg p-5 sm:p-7 shadow-2xl text-[#d1d5db] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#141614] border border-white/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="stencil text-xl font-bold uppercase tracking-wider text-white">
                Official Rulebook & Field Manual
              </h2>
              <p className="text-xs text-white/50 font-mono">
                Jungle vs. Steel &bull; Field Manual v1.02 &bull; 2-Player Asymmetrical Strategy
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 border-b border-white/10">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3.5 py-1.5 rounded font-mono text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'bg-amber-400 text-black shadow'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            Overview & Setup
          </button>
          <button
            onClick={() => setActiveTab('PHASES')}
            className={`px-3.5 py-1.5 rounded font-mono text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'PHASES'
                ? 'bg-amber-400 text-black shadow'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            Turn & Combat Phases
          </button>
          <button
            onClick={() => setActiveTab('US_CARDS')}
            className={`px-3.5 py-1.5 rounded font-mono text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'US_CARDS'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            US Forces Deck (10)
          </button>
          <button
            onClick={() => setActiveTab('NLF_CARDS')}
            className={`px-3.5 py-1.5 rounded font-mono text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'NLF_CARDS'
                ? 'bg-green-600 text-white shadow'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            NLF Guerrilla Deck (10)
          </button>
          <button
            onClick={() => setActiveTab('FAQ')}
            className={`px-3.5 py-1.5 rounded font-mono text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'FAQ'
                ? 'bg-amber-400 text-black shadow'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            Tactical FAQ
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2 text-sm leading-relaxed text-white/80">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              <div className="panel-bg p-4 rounded-lg border-l-4 border-amber-400">
                <h3 className="stencil text-base font-bold text-amber-300 mb-1">
                  Core Objective & Dynamics
                </h3>
                <p className="text-xs text-white/80 leading-normal">
                  <strong className="text-white">Jungle vs. Steel</strong> is a 2-player asymmetrical strategy card game simulating the military dynamics of the Vietnam War. One player commands the heavy firepower of the <strong>US Forces</strong>, while the other controls the stealth and subterranean mobility of the <strong>NLF (National Liberation Front / Guerrilla)</strong>.
                </p>
                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/10 text-center font-mono text-xs">
                  <div className="bg-black/40 p-2 rounded">
                    <span className="text-white/40 block text-[10px]">ROUNDS</span>
                    <strong className="text-white">Up to 3</strong>
                  </div>
                  <div className="bg-black/40 p-2 rounded">
                    <span className="text-white/40 block text-[10px]">BATTLE ZONES</span>
                    <strong className="text-white">3 (A, B, C)</strong>
                  </div>
                  <div className="bg-black/40 p-2 rounded">
                    <span className="text-white/40 block text-[10px]">WIN CONDITION</span>
                    <strong className="text-white">2 of 3 Zones</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="panel-bg p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="stencil text-sm font-bold us-accent mb-1 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-400" />
                    US Forces (Steel)
                  </h4>
                  <ul className="text-xs space-y-1.5 text-white/80">
                    <li>&bull; <strong>Mechanized Might:</strong> Heavy firepower, artillery strikes, and air cavalry support.</li>
                    <li>&bull; <strong>Open Logistics:</strong> All US units are played face-up on the battlefield.</li>
                    <li>&bull; <strong>Deck Composition:</strong> 10 Cards (4x Rifleman, 2x M60 Gun, 2x Huey Chopper, 1x Artillery, 1x Supply Drop).</li>
                  </ul>
                </div>

                <div className="panel-bg p-4 rounded-lg border-r-4 border-green-500">
                  <h4 className="stencil text-sm font-bold nlf-accent mb-1 flex items-center gap-1.5">
                    <Trees className="w-4 h-4 text-green-400" />
                    NLF Forces (Jungle)
                  </h4>
                  <ul className="text-xs space-y-1.5 text-white/80">
                    <li>&bull; <strong>Weapons & Troops:</strong> AK-47 fighters and RPG teams deploy face-up with direct combat power.</li>
                    <li>&bull; <strong>Concealed Traps:</strong> Punji Traps are placed face-down (Hidden) to ambush invading US patrols.</li>
                    <li>&bull; <strong>Subterranean Mobility:</strong> Relocate units freely across zones via Tunnel Networks.</li>
                    <li>&bull; <strong>Deck Composition:</strong> 10 Cards (3x AK-47, 2x RPG Team, 2x Punji Trap, 2x Tunnel, 1x Ambush).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PHASES' && (
            <div className="space-y-4 text-xs">
              <div className="panel-bg p-4 rounded-lg border-l-4 border-amber-400">
                <h3 className="stencil text-sm font-bold text-amber-300 mb-2">
                  Phase 1: Action Phase (Alternating Turns)
                </h3>
                <p className="text-white/80 mb-2">
                  US Forces always take the first action of each round. On your turn, choose <strong>exactly 1</strong> action:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                  <div className="bg-black/40 p-2.5 rounded border border-white/5">
                    <strong className="text-white block mb-1">1. Deploy Unit / Trap</strong>
                    <span>Pay ammo cost. Place into Zone A, B, or C. All weapon units deploy face-up; Traps deploy concealed face-down.</span>
                  </div>
                  <div className="bg-black/40 p-2.5 rounded border border-white/5">
                    <strong className="text-white block mb-1">2. Use Tactic</strong>
                    <span>Pay ammo cost. Execute effect (Artillery bombardment, Supply surge, Tunnel shift, Ambush).</span>
                  </div>
                  <div className="bg-black/40 p-2.5 rounded border border-white/5">
                    <strong className="text-white block mb-1">3. Pass Turn</strong>
                    <span>Conserve ammo. If both players pass consecutively, the Action Phase ends immediately.</span>
                  </div>
                </div>
              </div>

              <div className="panel-bg p-4 rounded-lg border-l-4 border-red-500">
                <h3 className="stencil text-sm font-bold text-red-400 mb-2">
                  Phase 2: Combat & Resolution Phase
                </h3>
                <ol className="space-y-2 text-white/80 list-decimal list-inside">
                  <li><strong>Reveal Concealed Units:</strong> All face-down NLF cards on the board are flipped face-up.</li>
                  <li><strong>Apply Ambush Bonuses:</strong> Any revealed RPG Teams gain +2 Attack Power (4 &rarr; 6).</li>
                  <li><strong>Calculate Zone Power:</strong> Sum the total Attack Power of all remaining units in each zone.</li>
                  <li><strong>Award Zone Markers:</strong> The player with the highest total power in a zone wins that zone and receives a Zone Control Marker. If tied, no marker is awarded.</li>
                  <li><strong>Check Victory:</strong> If any player controls 2 of the 3 zones or earns 3 Zone Control Markers, they immediately win the war!</li>
                  <li><strong>Round Reset:</strong> If neither player wins, all units on the board are discarded. Both players draw 3 cards from their draw deck and replenish their supply back to 5 Ammo Tokens.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'US_CARDS' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {usCards.map((card) => (
                <div key={card.id} className="panel-bg p-3 rounded-lg border border-blue-500/20 flex gap-3 items-center">
                  <CardItem cardDef={card} size="sm" />
                  <div className="flex-1 text-xs">
                    <h5 className="font-bold text-white stencil">{card.name}</h5>
                    <span className="text-[10px] text-blue-300 font-mono block mb-1">
                      Qty: {card.countInDeck} &bull; Cost: {card.ammoCost} AP {card.attack ? `• ATK: ${card.attack}` : ''}
                    </span>
                    <p className="text-[11px] text-white/70 leading-tight">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'NLF_CARDS' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {nlfCards.map((card) => (
                <div key={card.id} className="panel-bg p-3 rounded-lg border border-green-500/20 flex gap-3 items-center">
                  <CardItem cardDef={card} size="sm" />
                  <div className="flex-1 text-xs">
                    <h5 className="font-bold text-white stencil">{card.name}</h5>
                    <span className="text-[10px] text-green-300 font-mono block mb-1">
                      Qty: {card.countInDeck} &bull; Cost: {card.ammoCost} AP {card.attack ? `• ATK: ${card.attack}` : ''}
                    </span>
                    <p className="text-[11px] text-white/70 leading-tight">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'FAQ' && (
            <div className="space-y-3 text-xs">
              <div className="panel-bg p-3 rounded border border-white/10">
                <strong className="text-amber-300 block mb-1">Q: What happens when a US unit enters a zone with a Punji Trap?</strong>
                <p className="text-white/70">The entering US unit is instantly destroyed along with the Punji Trap itself. Both cards are discarded immediately.</p>
              </div>
              <div className="panel-bg p-3 rounded border border-white/10">
                <strong className="text-amber-300 block mb-1">Q: Does the Huey Chopper reveal face-down NLF cards?</strong>
                <p className="text-white/70">Yes. When deployed, the US player can choose 1 hidden NLF card on the board to scout and flip face-up, negating surprise ambush bonuses.</p>
              </div>
              <div className="panel-bg p-3 rounded border border-white/10">
                <strong className="text-amber-300 block mb-1">Q: Can Artillery Strike hit face-down cards?</strong>
                <p className="text-white/70">No. Artillery bombardment requires confirmed visual intelligence and can only target face-up enemy units.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
