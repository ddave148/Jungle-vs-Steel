export type Faction = 'US' | 'NLF';

export type ZoneId = 'ZONE_A' | 'ZONE_B' | 'ZONE_C';

export type CardType = 'INFANTRY' | 'HEAVY_WEAPON' | 'RECON_SUPPORT' | 'TACTIC' | 'TRAP';

export interface CardDefinition {
  id: string;
  name: string;
  faction: Faction;
  type: CardType;
  attack: number | null; // null for Tactics/Traps
  ammoCost: number; // 1 standard, 2 for M60
  description: string;
  effectDetails: string;
  canBeHidden: boolean; // NLF infantry, heavy weapon, trap
  mustBeHidden?: boolean; // Punji Trap
  historicalNote: string;
  countInDeck: number;
  iconName: string;
}

export interface BoardCard {
  instanceId: string;
  cardDefId: string;
  faction: Faction;
  isHidden: boolean; // Face-down
  revealedInCombat?: boolean; // For RPG +2 bonus
  wasScoutedByHuey?: boolean; // If revealed by Huey Chopper
  enteredThisTurn?: boolean;
}

export interface PlayerState {
  faction: Faction;
  name: string;
  ammo: number; // Max/replenished to 5
  hand: CardDefinition[];
  deck: CardDefinition[];
  discard: CardDefinition[];
  hasPassed: boolean;
  isAi: boolean;
}

export type GamePhase = 
  | 'ACTION' 
  | 'COMBAT_REVEAL' 
  | 'COMBAT_CALC' 
  | 'ROUND_RESOLVED' 
  | 'GAME_OVER';

export type GameMode = 'VS_AI_AS_US' | 'VS_AI_AS_NLF' | 'PASS_AND_PLAY';

export interface ZoneState {
  id: ZoneId;
  name: string;
  regionName: string;
  terrain: string;
  controller: Faction | null; // null if unowned or tied
  usUnits: BoardCard[];
  nlfUnits: BoardCard[];
}

export interface PendingTargeting {
  type: 'HUEY_TARGET' | 'ARTILLERY_TARGET' | 'TUNNEL_SELECT_UNIT' | 'TUNNEL_SELECT_DEST';
  cardDef?: CardDefinition;
  sourceZone?: ZoneId;
  selectedUnitId?: string;
  promptText: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  round: number;
  faction: Faction | 'SYSTEM';
  message: string;
  type: 'DEPLOY' | 'TACTIC' | 'TRAP' | 'RECON' | 'COMBAT' | 'ZONE_CLAIM' | 'PASS' | 'AMMO';
  highlight?: boolean;
}

export interface RoundResult {
  roundNumber: number;
  zoneWinners: Record<ZoneId, Faction | 'TIE'>;
  usAttack: Record<ZoneId, number>;
  nlfAttack: Record<ZoneId, number>;
  rpgBonusUnits: string[];
}
