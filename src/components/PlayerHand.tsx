import React from 'react';
import { CardDefinition, Faction } from '../types';
import { CardItem } from './CardItem';
import { AmmoDisplay } from './AmmoDisplay';
import { EyeOff, Play, SkipForward, Layers, Trash2 } from 'lucide-react';

interface PlayerHandProps {
  faction: Faction;
  playerName: string;
  hand: CardDefinition[];
  ammo: number;
  deckCount: number;
  discardCount: number;
  selectedCard: CardDefinition | null;
  playAsHidden: boolean;
  onSelectCard: (card: CardDefinition, playHidden?: boolean) => void;
  onCancelSelection: () => void;
  onPassTurn: () => void;
  isCurrentTurn: boolean;
  isAiTurn: boolean;
  pendingTargetingText?: string | null;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  faction,
  playerName,
  hand,
  ammo,
  deckCount,
  discardCount,
  selectedCard,
  playAsHidden,
  onSelectCard,
  onCancelSelection,
  onPassTurn,
  isCurrentTurn,
  isAiTurn,
  pendingTargetingText,
}) => {
  const isUS = faction === 'US';

  return (
    <div
      className={`panel-bg w-full rounded-lg p-3 sm:p-4 transition-all shadow-2xl ${
        isUS
          ? 'border-l-4 border-blue-500'
          : 'border-l-4 border-green-500'
      } ${
        isCurrentTurn ? 'ring-1 ring-white/20' : 'opacity-80'
      }`}
    >
      {/* Hand Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isUS ? 'bg-blue-400 shadow-[0_0_8px_#60a5fa]' : 'bg-green-400 shadow-[0_0_8px_#4ade80]'
              }`}
            />
            <h2 className={`stencil text-base font-bold tracking-wide ${isUS ? 'us-accent' : 'nlf-accent'}`}>
              {playerName}
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60">
              {isUS ? 'US Forces Commander' : 'NLF Guerrilla Cell'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-white/40">
            <div className="flex items-center gap-1" title="Cards remaining in draw pile">
              <Layers className="w-3.5 h-3.5" />
              <span>Deck: {deckCount}</span>
            </div>
            <span>&bull;</span>
            <div className="flex items-center gap-1" title="Cards in discard pile">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Discard: {discardCount}</span>
            </div>
          </div>
        </div>

        {/* Ammo Display + Pass Turn button */}
        <div className="flex items-center gap-3">
          <AmmoDisplay faction={faction} ammo={ammo} isCurrentPlayer={isCurrentTurn} />

          {isCurrentTurn && !isAiTurn && (
            <button
              onClick={onPassTurn}
              className="px-3.5 py-1.5 rounded bg-white/10 hover:bg-white/20 text-xs font-mono uppercase font-bold text-white border border-white/20 hover:border-amber-400 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Pass your action turn for this round"
            >
              <SkipForward className="w-3.5 h-3.5 text-amber-400" />
              <span>Pass</span>
            </button>
          )}
        </div>
      </div>

      {/* Pending Targeting Banner or Active Selection Banner */}
      {pendingTargetingText ? (
        <div className="my-2.5 p-2.5 rounded bg-amber-500/15 border border-amber-400/40 flex items-center justify-between text-xs font-mono text-amber-200 animate-pulse">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            {pendingTargetingText}
          </span>
          <button
            onClick={onCancelSelection}
            className="px-2.5 py-1 rounded bg-black/70 hover:bg-black text-white/90 hover:text-white text-[10px] uppercase font-bold border border-white/20 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      ) : selectedCard && selectedCard.type !== 'TACTIC' ? (
        <div className="my-2.5 p-2.5 rounded bg-blue-950/40 border border-blue-400/50 flex items-center justify-between text-xs font-mono text-blue-200 animate-pulse shadow-lg">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>
              <strong>{selectedCard.name}</strong> selected ({playAsHidden ? 'Hidden' : 'Face-Up'}). Click any <strong>Zone A, B, or C</strong> column above to deploy!
            </span>
          </span>
          <button
            onClick={onCancelSelection}
            className="px-2.5 py-1 rounded bg-black/70 hover:bg-black text-white/90 hover:text-white text-[10px] uppercase font-bold border border-white/20 cursor-pointer"
          >
            Cancel Selection
          </button>
        </div>
      ) : null}

      {/* Hand Cards List */}
      <div className="mt-3.5">
        {hand.length === 0 ? (
          <div className="py-6 text-center text-white/30 font-mono text-xs">
            Hand is empty. Awaiting Combat Phase resolution or next round draw.
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            {hand.map((card, idx) => {
              const canAfford = ammo >= card.ammoCost;
              const isSelected = selectedCard?.id === card.id && !pendingTargetingText;

              const handleCardClickDirect = () => {
                if (!isCurrentTurn || isAiTurn || !canAfford) return;
                if (isSelected) {
                  onCancelSelection();
                } else {
                  if (card.type === 'TACTIC') {
                    onSelectCard(card, false);
                  } else if (card.canBeHidden) {
                    onSelectCard(card, true);
                  } else {
                    onSelectCard(card, false);
                  }
                }
              };

              return (
                <div
                  key={`hand-${card.id}-${idx}`}
                  className="flex flex-col items-center gap-1.5"
                >
                  <CardItem
                    cardDef={card}
                    isSelected={isSelected}
                    size="md"
                    onClick={handleCardClickDirect}
                    className={`${
                      !canAfford ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer hover:scale-105'
                    }`}
                  />

                  {/* Play Action Buttons */}
                  {isCurrentTurn && !isAiTurn && (
                    <div className="flex flex-col gap-1 w-full">
                      {card.type === 'TACTIC' ? (
                        <button
                          disabled={!canAfford}
                          onClick={() => onSelectCard(card, false)}
                          className={`w-full py-1 px-1.5 rounded font-mono text-[9px] font-bold uppercase transition-all ${
                            canAfford
                              ? 'bg-amber-400 hover:bg-amber-300 text-black cursor-pointer active:scale-95'
                              : 'bg-white/5 text-white/20 cursor-not-allowed'
                          }`}
                        >
                          Use Tactic ({card.ammoCost > 0 ? `${card.ammoCost} AP` : 'Free'})
                        </button>
                      ) : card.canBeHidden ? (
                        // Traps: Played Face-Down
                        <button
                          disabled={!canAfford}
                          onClick={() => {
                            if (isSelected) {
                              onCancelSelection();
                            } else {
                              onSelectCard(card, true);
                            }
                          }}
                          className={`w-full py-1 px-1.5 rounded font-mono text-[9px] font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                            canAfford
                              ? isSelected
                                ? 'bg-green-400 text-black ring-2 ring-green-300 font-bold'
                                : 'bg-green-700 hover:bg-green-600 text-white cursor-pointer active:scale-95'
                              : 'bg-white/5 text-white/20 cursor-not-allowed'
                          }`}
                        >
                          <EyeOff className="w-2.5 h-2.5" />
                          <span>{isSelected ? 'Cancel / Pick Zone' : `Conceal Trap (${card.ammoCost} AP)`}</span>
                        </button>
                      ) : (
                        // Regular Units / Weapons: Played Face-Up
                        <button
                          disabled={!canAfford}
                          onClick={() => {
                            if (isSelected) {
                              onCancelSelection();
                            } else {
                              onSelectCard(card, false);
                            }
                          }}
                          className={`w-full py-1 px-1.5 rounded font-mono text-[9px] font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                            canAfford
                              ? isSelected
                                ? 'bg-amber-400 text-black ring-2 ring-amber-300 font-bold'
                                : isUS
                                ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-95'
                                : 'bg-green-800 hover:bg-green-700 text-white cursor-pointer active:scale-95'
                              : 'bg-white/5 text-white/20 cursor-not-allowed'
                          }`}
                        >
                          <Play className="w-2.5 h-2.5" />
                          <span>{isSelected ? 'Cancel / Pick Zone' : `Deploy (${card.ammoCost} AP)`}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
