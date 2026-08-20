import { CardDefinition, Faction } from '../types';

export const CARD_DEFINITIONS: Record<string, CardDefinition> = {
  // --- US FORCES DECK (10 cards) ---
  'us_m16': {
    id: 'us_m16',
    name: 'M16 Rifleman',
    faction: 'US',
    type: 'INFANTRY',
    attack: 3,
    ammoCost: 1,
    description: 'Standard frontline infantry unit.',
    effectDetails: 'Deploys directly into selected zone with 3 Attack Power.',
    canBeHidden: false,
    historicalNote: 'The Colt M16 was the standard service rifle for US forces, firing 5.56×45mm rounds with rapid rate of fire in dense jungle combat.',
    countInDeck: 4,
    iconName: 'Shield',
  },
  'us_m60': {
    id: 'us_m60',
    name: 'M60 Machine Gun',
    faction: 'US',
    type: 'HEAVY_WEAPON',
    attack: 5,
    ammoCost: 2,
    description: 'Sustained suppression fire.',
    effectDetails: 'Requires 2 Ammo tokens to deploy. Provides a formidable 5 Attack Power.',
    canBeHidden: false,
    historicalNote: 'Known as "The Pig", the belt-fed M60 provided squad-level heavy fire superiority to suppress entrenched combatants.',
    countInDeck: 2,
    iconName: 'Zap',
  },
  'us_huey': {
    id: 'us_huey',
    name: 'Huey Chopper',
    faction: 'US',
    type: 'RECON_SUPPORT',
    attack: 2,
    ammoCost: 1,
    description: 'Reconnaissance & air cavalry escort.',
    effectDetails: 'Deploys with 2 Attack Power. On deploy, choose 1 hidden NLF card in any zone to flip face-up.',
    canBeHidden: false,
    historicalNote: 'The UH-1 Iroquois "Huey" defined airmobility in Vietnam, inserting troops and spotting hidden positions across the canopy.',
    countInDeck: 2,
    iconName: 'Navigation',
  },
  'us_artillery': {
    id: 'us_artillery',
    name: 'Artillery Strike',
    faction: 'US',
    type: 'TACTIC',
    attack: null,
    ammoCost: 2,
    description: 'Heavy 105mm howitzer bombardment.',
    effectDetails: 'Requires 2 Ammo tokens. Target and immediately destroy 1 face-up enemy unit in any zone. Discard this card.',
    canBeHidden: false,
    historicalNote: 'Forward fire support bases (FSBs) maintained continuous coordinate grids to drop lethal high-explosive barrages on identified targets.',
    countInDeck: 1,
    iconName: 'Target',
  },
  'us_supply': {
    id: 'us_supply',
    name: 'Supply Drop',
    faction: 'US',
    type: 'TACTIC',
    attack: null,
    ammoCost: 0,
    description: 'Logistics resupply via C-130 airdrop.',
    effectDetails: 'Free to play (0 Ammo). Immediately grants +1 Ammo Token to your stockpile. Discard this card.',
    canBeHidden: false,
    historicalNote: 'Unmatched US logistics and aerial cargo drops kept remote jungle garrisons and combat teams continually stocked with ammunition.',
    countInDeck: 1,
    iconName: 'PackagePlus',
  },

  // --- NLF / GUERRILLA DECK (10 cards) ---
  'nlf_ak47': {
    id: 'nlf_ak47',
    name: 'AK-47 Fighter',
    faction: 'NLF',
    type: 'INFANTRY',
    attack: 3,
    ammoCost: 1,
    description: 'Disciplined guerrilla insurgent.',
    effectDetails: 'Deploys Face-Up into any zone with 3 Attack Power for 1 Ammo.',
    canBeHidden: false,
    historicalNote: 'Renowned for rugged reliability in mud and monsoon water, the Type 56 / AK-47 gave NLF fighters dependable close-range lethality.',
    countInDeck: 3,
    iconName: 'Trees',
  },
  'nlf_rpg': {
    id: 'nlf_rpg',
    name: 'RPG Team',
    faction: 'NLF',
    type: 'HEAVY_WEAPON',
    attack: 4,
    ammoCost: 1,
    description: 'Rocket-propelled anti-armor squad.',
    effectDetails: 'Deploys Face-Up with 4 formidable Attack Power into any zone for 1 Ammo.',
    canBeHidden: false,
    historicalNote: 'RPG-7 teams targeted US armor, bunkers, and forward command perimeters with devastating shaped-charge warheads.',
    countInDeck: 2,
    iconName: 'Flame',
  },
  'nlf_punji': {
    id: 'nlf_punji',
    name: 'Punji Trap',
    faction: 'NLF',
    type: 'TRAP',
    attack: null,
    ammoCost: 1,
    description: 'Concealed sharpened bamboo spikes.',
    effectDetails: 'Must be played Face-Down (Hidden Trap). Triggers instantly when an enemy unit enters this zone: destroys that enemy unit and discards itself!',
    canBeHidden: true,
    mustBeHidden: true,
    historicalNote: 'Simple yet lethal camouflaged pits filled with sharpened fire-hardened bamboo inflicted severe psychological stress and halted patrol momentum.',
    countInDeck: 2,
    iconName: 'Skull',
  },
  'nlf_tunnel': {
    id: 'nlf_tunnel',
    name: 'Tunnel Network',
    faction: 'NLF',
    type: 'TACTIC',
    attack: null,
    ammoCost: 1,
    description: 'Subterranean transit routes (Củ Chi).',
    effectDetails: 'Relocate 1 of your deployed units (face-up or hidden) from any zone to any other zone instantly. Discard this card.',
    canBeHidden: false,
    historicalNote: 'Hundreds of miles of multi-level underground tunnels housed hospitals, barracks, and command bunkers right beneath allied bases.',
    countInDeck: 2,
    iconName: 'Compass',
  },
  'nlf_ambush': {
    id: 'nlf_ambush',
    name: 'Ambush',
    faction: 'NLF',
    type: 'TACTIC',
    attack: null,
    ammoCost: 1,
    description: 'Hit-and-run sabotage of supply lines.',
    effectDetails: 'Force the US player to immediately discard 2 Ammo Tokens (down to minimum 0). Discard this card.',
    canBeHidden: false,
    historicalNote: 'Guerrilla units engaged US patrols at point-blank range ("hugging the belt") before quickly vanishing, causing ammunition exhaustion.',
    countInDeck: 1,
    iconName: 'AlertTriangle',
  },
};

/**
 * Builds the official 10-card deck for a given faction
 */
export function buildStartingDeck(faction: Faction): CardDefinition[] {
  const cards: CardDefinition[] = [];
  Object.values(CARD_DEFINITIONS).forEach((def) => {
    if (def.faction === faction) {
      for (let i = 0; i < def.countInDeck; i++) {
        cards.push({ ...def });
      }
    }
  });
  // Shuffle deck
  return shuffleDeck(cards);
}

export function shuffleDeck<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const INITIAL_ZONES_CONFIG = [
  {
    id: 'ZONE_A' as const,
    name: 'Zone A: Hill 875',
    regionName: 'Central Highlands',
    terrain: 'Dense jungle ridges and entrenched bunker perimeters.',
  },
  {
    id: 'ZONE_B' as const,
    name: 'Zone B: Iron Triangle',
    regionName: 'Bình Dương Sector',
    terrain: 'Vast underground complex covered in bamboo thickets.',
  },
  {
    id: 'ZONE_C' as const,
    name: 'Zone C: Mekong Delta',
    regionName: 'Southern Waterways',
    terrain: 'Mangrove swamps, tidal canals, and river ambush corridors.',
  },
];
