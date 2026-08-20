import React from 'react';
import { CardDefinition, Faction, CardType } from '../types';
import { CARD_DEFINITIONS } from '../data/cards';
import { 
  Shield, 
  Zap, 
  Navigation, 
  Target, 
  PackagePlus, 
  Trees, 
  Flame, 
  Skull, 
  Compass, 
  AlertTriangle,
  Eye,
  EyeOff,
  Crosshair
} from 'lucide-react';

interface CardItemProps {
  cardDef?: CardDefinition;
  cardDefId?: string;
  isHidden?: boolean;
  canViewHiddenDetails?: boolean;
  isTargetable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showBonusBadge?: boolean;
  revealedInCombat?: boolean;
}

export const CardItem: React.FC<CardItemProps> = ({
  cardDef: directDef,
  cardDefId,
  isHidden = false,
  canViewHiddenDetails = false,
  isTargetable = false,
  isSelected = false,
  onClick,
  size = 'md',
  showBonusBadge = false,
  revealedInCombat = false,
  className = '',
}) => {
  const cardDef = directDef || (cardDefId ? CARD_DEFINITIONS[cardDefId] : undefined);

  if (!cardDef && isHidden && !canViewHiddenDetails) {
    // Pure hidden unknown card
    return (
      <div
        onClick={onClick}
        className={`card-item-container relative rounded border cursor-pointer transition-all select-none overflow-hidden ${
          size === 'sm' ? 'w-20 h-28' : size === 'lg' ? 'w-44 h-64' : 'w-28 h-40'
        } ${
          isTargetable
            ? 'border-red-400 ring-2 ring-red-500/80 animate-bounce'
            : isSelected
            ? 'border-amber-400 ring-2 ring-amber-400'
            : 'border-white/10 hover:border-green-400/60'
        } bg-[#0c140e] shadow-lg flex flex-col items-center justify-center p-2 text-center ${className}`}
      >
        <div className="w-7 h-7 rounded bg-green-950/40 border border-green-500/30 flex items-center justify-center mb-1">
          <EyeOff className="w-3.5 h-3.5 text-green-400" />
        </div>
        <span className="stencil text-[9px] font-bold text-green-400 tracking-wider">
          Concealed
        </span>
        <span className="text-[8px] text-white/40 font-mono mt-0.5">
          NLF Trap / Ambush
        </span>
        {isTargetable && (
          <span className="absolute bottom-1 bg-red-600 text-[8px] font-mono uppercase font-bold text-white px-1 py-0.5 rounded">
            Target
          </span>
        )}
      </div>
    );
  }

  if (!cardDef) return null;

  const isUS = cardDef.faction === 'US';

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield': return <Shield className="w-3.5 h-3.5 text-blue-300" />;
      case 'Zap': return <Zap className="w-3.5 h-3.5 text-yellow-300" />;
      case 'Navigation': return <Navigation className="w-3.5 h-3.5 text-sky-300" />;
      case 'Target': return <Target className="w-3.5 h-3.5 text-rose-300" />;
      case 'PackagePlus': return <PackagePlus className="w-3.5 h-3.5 text-emerald-300" />;
      case 'Trees': return <Trees className="w-3.5 h-3.5 text-emerald-300" />;
      case 'Flame': return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case 'Skull': return <Skull className="w-3.5 h-3.5 text-red-400" />;
      case 'Compass': return <Compass className="w-3.5 h-3.5 text-teal-300" />;
      case 'AlertTriangle': return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      default: return <Shield className="w-3.5 h-3.5" />;
    }
  };

  const getTypeLabel = (type: CardType) => {
    switch (type) {
      case 'INFANTRY': return 'Infantry';
      case 'HEAVY_WEAPON': return 'Heavy Wpn';
      case 'RECON_SUPPORT': return 'Recon / Air';
      case 'TACTIC': return 'Tactic';
      case 'TRAP': return 'Trap';
    }
  };

  const isHiddenOverlay = isHidden && canViewHiddenDetails;

  return (
    <div
      onClick={onClick}
      className={`card-item-container group relative rounded border transition-all duration-150 select-none overflow-hidden flex flex-col justify-between p-2 shadow-md ${
        size === 'sm' ? 'w-22 h-30 text-[10px]' : size === 'lg' ? 'w-44 h-64 text-xs' : 'w-28 h-40 text-xs'
      } ${
        isTargetable
          ? 'border-red-400 ring-2 ring-red-500/80 scale-105 cursor-pointer animate-pulse'
          : isSelected
          ? 'border-amber-400 ring-2 ring-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)] cursor-pointer'
          : isUS
          ? 'bg-[#0e1420] border-blue-500/30 hover:border-blue-400/80'
          : 'bg-[#0d1810] border-green-500/30 hover:border-green-400/80'
      } ${onClick ? 'cursor-pointer active:scale-95' : ''} ${className}`}
    >
      {/* Top Bar: Name & Cost */}
      <div className="relative z-10 flex items-start justify-between gap-1">
        <div className="flex flex-col">
          <span className="stencil font-bold text-[11px] leading-tight text-white line-clamp-1">
            {cardDef.name}
          </span>
          <span className="text-[8px] font-mono text-white/40 uppercase">
            {getTypeLabel(cardDef.type)}
          </span>
        </div>

        {/* Ammo Cost Badge */}
        <div
          title={`Costs ${cardDef.ammoCost} Ammo Token`}
          className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono font-bold text-amber-300"
        >
          <span>{cardDef.ammoCost}</span>
          <span className="text-[7px] text-white/40">AP</span>
        </div>
      </div>

      {/* Center Art / Icon & Attack Power */}
      <div className="relative z-10 my-0.5 flex flex-col items-center justify-center flex-1">
        <div
          className={`w-7 h-7 rounded flex items-center justify-center border ${
            isUS
              ? 'bg-blue-900/20 border-blue-500/30'
              : 'bg-green-900/20 border-green-500/30'
          }`}
        >
          {getIcon(cardDef.iconName)}
        </div>

        {/* Attack Power badge */}
        {cardDef.attack !== null ? (
          <div className="mt-1 flex items-center gap-1">
            <span className="text-[8px] uppercase font-mono text-white/40">ATK</span>
            <span
              className={`font-mono text-xs font-bold ${
                isUS ? 'us-accent' : 'nlf-accent'
              }`}
            >
              {revealedInCombat && cardDef.id === 'nlf_rpg'
                ? 6
                : cardDef.attack}
            </span>
            {cardDef.id === 'nlf_rpg' && (
              <span className="text-[8px] font-mono text-amber-300" title="+2 if hidden!">
                (+2)
              </span>
            )}
          </div>
        ) : (
          <div className="mt-1 text-[8px] font-mono text-white/40 uppercase">
            {cardDef.type === 'TRAP' ? 'Lethal Trap' : 'Tactic'}
          </div>
        )}
      </div>

      {/* Bottom Text / Effect */}
      <div className="relative z-10 text-[8px] text-white/70 leading-tight bg-black/50 rounded p-1 border border-white/5 line-clamp-2">
        {cardDef.description}
      </div>

      {/* Hidden Status Tag Overlay */}
      {isHiddenOverlay && (
        <div className="absolute top-1 right-1 z-20 px-1 py-0.5 rounded bg-green-950/90 border border-green-500 text-[7px] font-mono text-green-300 flex items-center gap-0.5">
          <Eye className="w-2 h-2 text-green-400" />
          <span>HIDDEN</span>
        </div>
      )}

      {/* Target indicator */}
      {isTargetable && (
        <div className="absolute inset-0 bg-red-950/40 z-20 flex items-center justify-center pointer-events-none">
          <div className="bg-red-600 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1 shadow-lg">
            <Crosshair className="w-2.5 h-2.5" />
            <span>Select</span>
          </div>
        </div>
      )}
    </div>
  );
};
