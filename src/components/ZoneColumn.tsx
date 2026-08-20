import React from 'react';
import { BoardCard, CardDefinition, Faction, ZoneId, ZoneState } from '../types';
import { CARD_DEFINITIONS } from '../data/cards';
import { CardItem } from './CardItem';
import { Flag, Compass, Crosshair, Swords } from 'lucide-react';

interface ZoneColumnProps {
  zone: ZoneState;
  activePlayer: Faction;
  isDeployTarget: boolean;
  isTunnelSource: boolean;
  isTunnelDest: boolean;
  isArtilleryTargetZone: boolean;
  isHueyTargetZone: boolean;
  selectedCardInHand?: CardDefinition | null;
  viewerFaction: Faction; // Used to reveal own hidden cards in Pass & Play or Solo
  onDeployToZone: (zoneId: ZoneId) => void;
  onCardClick: (card: BoardCard, zoneId: ZoneId) => void;
  onSelectZoneForAction?: (zoneId: ZoneId) => void;
  targetableCards?: string[]; // instanceIds of targetable cards
}

export const ZoneColumn: React.FC<ZoneColumnProps> = ({
  zone,
  activePlayer,
  isDeployTarget,
  isTunnelSource,
  isTunnelDest,
  isArtilleryTargetZone,
  isHueyTargetZone,
  selectedCardInHand,
  viewerFaction,
  onDeployToZone,
  onCardClick,
  onSelectZoneForAction,
  targetableCards = [],
}) => {
  // Calculate US attack total
  const usAttack = zone.usUnits.reduce((sum, u) => {
    const def = CARD_DEFINITIONS[u.cardDefId];
    return sum + (def?.attack || 0);
  }, 0);

  // Calculate NLF attack total (revealed + estimated)
  let nlfVisibleAttack = 0;
  let nlfHiddenCount = 0;

  zone.nlfUnits.forEach((u) => {
    const def = CARD_DEFINITIONS[u.cardDefId];
    if (u.isHidden) {
      nlfHiddenCount++;
      if (viewerFaction === 'NLF') {
        nlfVisibleAttack += (def?.attack || 0) + (def?.id === 'nlf_rpg' ? 2 : 0);
      }
    } else {
      nlfVisibleAttack += def?.attack || 0;
    }
  });

  const getSectorCode = (id: ZoneId) => {
    switch (id) {
      case 'ZONE_A': return '001 // SECTOR';
      case 'ZONE_B': return '002 // SECTOR';
      case 'ZONE_C': return '003 // SECTOR';
    }
  };

  const getZoneShortName = (id: ZoneId) => {
    switch (id) {
      case 'ZONE_A': return 'ZONE A';
      case 'ZONE_B': return 'ZONE B';
      case 'ZONE_C': return 'ZONE C';
    }
  };

  const handleZoneClick = (e: React.MouseEvent) => {
    // If clicking on an actual card inside the zone, don't double trigger zone deploy
    if ((e.target as HTMLElement).closest('.card-item-container')) {
      return;
    }
    if (isDeployTarget) {
      onDeployToZone(zone.id);
    } else if (isTunnelDest && onSelectZoneForAction) {
      onSelectZoneForAction(zone.id);
    }
  };

  return (
    <div
      onClick={handleZoneClick}
      className={`panel-bg relative flex flex-col justify-between rounded-lg transition-all overflow-hidden min-h-[490px] shadow-2xl ${
        isDeployTarget
          ? 'ring-2 ring-amber-400 bg-[#161a15] cursor-pointer hover:border-amber-300 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]'
          : isTunnelDest
          ? 'ring-2 ring-teal-400 bg-[#131b1a] cursor-pointer hover:border-teal-300 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)]'
          : zone.controller === 'US'
          ? 'border-blue-500/40 bg-[#0d131e]/70'
          : zone.controller === 'NLF'
          ? 'border-green-500/40 bg-[#0d1a12]/70'
          : 'border-white/10'
      }`}
    >
      {/* Top Hairline Gradient Accent */}
      <div
        className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${
          zone.controller === 'US'
            ? 'via-blue-500/60'
            : zone.controller === 'NLF'
            ? 'via-green-500/60'
            : 'via-white/30'
        } to-transparent`}
      />

      {/* Zone Header Bar */}
      <div className="p-3.5 border-b border-white/10 flex items-start justify-between">
        <div>
          <span className="text-[10px] text-white/30 font-mono block tracking-wider">
            {getSectorCode(zone.id)}
          </span>
          <div className="flex items-center gap-2">
            <h3 className="stencil text-xl font-bold text-white tracking-wide">
              {getZoneShortName(zone.id)}
            </h3>
            {zone.controller && (
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase flex items-center gap-1 ${
                  zone.controller === 'US'
                    ? 'bg-blue-900/40 border-blue-500/60 text-blue-300'
                    : 'bg-green-900/40 border-green-500/60 text-green-300'
                }`}
              >
                <Flag className="w-2.5 h-2.5" />
                {zone.controller}
              </span>
            )}
          </div>
          <span className="text-[10px] text-white/50 font-sans line-clamp-1 mt-0.5">
            {zone.regionName} &bull; {zone.terrain}
          </span>
        </div>

        {/* Action button if target */}
        {isDeployTarget && (
          <button
            onClick={() => onDeployToZone(zone.id)}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs rounded uppercase tracking-wider shadow-lg flex items-center gap-1 animate-pulse cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5" />
            Deploy
          </button>
        )}

        {isTunnelDest && onSelectZoneForAction && (
          <button
            onClick={() => onSelectZoneForAction(zone.id)}
            className="px-3 py-1.5 bg-teal-400 hover:bg-teal-300 text-black font-mono font-bold text-xs rounded uppercase tracking-wider shadow-lg flex items-center gap-1 animate-pulse cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            Tunnel
          </button>
        )}
      </div>

      {/* TOP SECTION: NLF GUERRILLA FORCES DEPLOYMENT */}
      <div className="flex-1 p-3 flex flex-col justify-start border-b border-white/5 bg-gradient-to-b from-green-950/20 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] font-mono font-bold uppercase nlf-accent tracking-wider">
              NLF Deployment ({zone.nlfUnits.length})
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-xs">
            <span className="text-white/40 text-[10px]">ATK:</span>
            <span className="font-bold text-green-400">
              {viewerFaction === 'NLF' ? (
                nlfVisibleAttack
              ) : nlfHiddenCount > 0 ? (
                <span>
                  {nlfVisibleAttack} <span className="text-amber-400 font-normal">(+{nlfHiddenCount}?)</span>
                </span>
              ) : (
                nlfVisibleAttack
              )}
            </span>
          </div>
        </div>

        {/* NLF Units Container with card-slot aesthetic */}
        <div className="card-slot flex flex-wrap gap-2 items-start min-h-[96px] p-2 bg-black/40">
          {zone.nlfUnits.length === 0 ? (
            <div className="w-full h-20 flex flex-col items-center justify-center text-white/20 text-[10px] font-mono uppercase tracking-widest">
              <span>NLF Deployment Slot</span>
            </div>
          ) : (
            zone.nlfUnits.map((card) => {
              const isTargetable = targetableCards.includes(card.instanceId);
              return (
                <CardItem
                  key={card.instanceId}
                  cardDefId={card.cardDefId}
                  isHidden={card.isHidden}
                  canViewHiddenDetails={viewerFaction === 'NLF'}
                  isTargetable={isTargetable}
                  size="sm"
                  onClick={() => onCardClick(card, zone.id)}
                  revealedInCombat={card.revealedInCombat}
                />
              );
            })
          )}
        </div>
      </div>

      {/* CENTER DIVIDER: COMBAT POWER DIFFERENTIAL */}
      <div className="px-3.5 py-2 bg-black/60 border-y border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="w-3.5 h-3.5 text-white/40" />
          <span className="text-[10px] font-mono uppercase text-white/50 tracking-wider">
            Sector Power
          </span>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-xs">
          <span className="text-green-400 font-bold">NLF: {nlfVisibleAttack}</span>
          <span className="text-white/20 font-normal">|</span>
          <span className="text-blue-400 font-bold">US: {usAttack}</span>
          {usAttack > nlfVisibleAttack ? (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300 font-bold uppercase border border-blue-500/40">
              US +{usAttack - nlfVisibleAttack}
            </span>
          ) : nlfVisibleAttack > usAttack ? (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-900/50 text-green-300 font-bold uppercase border border-green-500/40">
              NLF +{nlfVisibleAttack - usAttack}
            </span>
          ) : (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 font-bold uppercase">
              Tied
            </span>
          )}
        </div>
      </div>

      {/* BOTTOM SECTION: US MECHANICAL FORCES DEPLOYMENT */}
      <div className="flex-1 p-3 flex flex-col justify-start bg-gradient-to-t from-blue-950/20 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] font-mono font-bold uppercase us-accent tracking-wider">
              US Deployment ({zone.usUnits.length})
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-xs">
            <span className="text-white/40 text-[10px]">ATK:</span>
            <span className="font-bold text-blue-400">{usAttack}</span>
          </div>
        </div>

        {/* US Units Container with card-slot aesthetic */}
        <div className="card-slot flex flex-wrap gap-2 items-start min-h-[96px] p-2 bg-black/40">
          {zone.usUnits.length === 0 ? (
            <div className="w-full h-20 flex flex-col items-center justify-center text-white/20 text-[10px] font-mono uppercase tracking-widest">
              <span>US Deployment Slot</span>
            </div>
          ) : (
            zone.usUnits.map((card) => {
              const isTargetable = targetableCards.includes(card.instanceId);
              return (
                <CardItem
                  key={card.instanceId}
                  cardDefId={card.cardDefId}
                  isHidden={false}
                  isTargetable={isTargetable}
                  size="sm"
                  onClick={() => onCardClick(card, zone.id)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Bottom status dots indicator */}
      <div className="p-2 border-t border-white/5 flex items-center justify-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${zone.controller === 'US' ? 'bg-blue-400' : 'bg-white/10'}`} />
        <div className={`w-1.5 h-1.5 rounded-full ${zone.controller === 'NLF' ? 'bg-green-400' : 'bg-white/10'}`} />
      </div>
    </div>
  );
};
