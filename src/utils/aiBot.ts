import { BoardCard, CardDefinition, Faction, ZoneId, ZoneState } from '../types';
import { CARD_DEFINITIONS } from '../data/cards';

export interface AiActionDecision {
  actionType: 'PLAY_UNIT' | 'PLAY_TACTIC' | 'PASS';
  cardDef?: CardDefinition;
  targetZone?: ZoneId;
  playHidden?: boolean;
  // Specific tactic targeting parameters
  targetHiddenCardInstanceId?: string; // For Huey
  targetFaceUpCardInstanceId?: string; // For Artillery
  tunnelSourceZone?: ZoneId; // For Tunnel
  tunnelCardInstanceId?: string; // For Tunnel
  tunnelDestZone?: ZoneId; // For Tunnel
  reasoning: string;
}

export function computeAiMove(
  aiFaction: Faction,
  aiAmmo: number,
  aiHand: CardDefinition[],
  zones: Record<ZoneId, ZoneState>,
  opponentAmmo: number
): AiActionDecision {
  const zoneList: ZoneId[] = ['ZONE_A', 'ZONE_B', 'ZONE_C'];

  // Helper to evaluate zone attack differential
  const getZoneDifferential = (zoneId: ZoneId) => {
    const zone = zones[zoneId];
    const usPower = zone.usUnits.reduce((sum, u) => {
      const def = CARD_DEFINITIONS[u.cardDefId];
      return sum + (def?.attack || 0);
    }, 0);
    const nlfPower = zone.nlfUnits.reduce((sum, u) => {
      const def = CARD_DEFINITIONS[u.cardDefId];
      return sum + (def?.attack || 0);
    }, 0);

    return {
      usPower,
      nlfPower,
      diff: aiFaction === 'US' ? usPower - nlfPower : nlfPower - usPower,
    };
  };

  // Find most contested or critical zone for AI
  const sortedZones = [...zoneList].sort((a, b) => {
    const diffA = getZoneDifferential(a).diff;
    const diffB = getZoneDifferential(b).diff;
    // Prefer zones where AI is slightly behind (diff between -3 and 0) or uncommitted
    return diffA - diffB;
  });

  const bestTargetZone = sortedZones[0] || 'ZONE_A';

  // --- US AI LOGIC ---
  if (aiFaction === 'US') {
    // 1. Supply Drop if ammo <= 4
    const supplyCard = aiHand.find((c) => c.id === 'us_supply' && aiAmmo >= c.ammoCost);
    if (supplyCard && aiAmmo <= 4) {
      return {
        actionType: 'PLAY_TACTIC',
        cardDef: supplyCard,
        reasoning: 'Logistics resupply called: requisitioning +1 Ammo Token to sustain infantry operations.',
      };
    }

    // 2. Artillery Strike if there's a valuable face-up NLF unit
    const artilleryCard = aiHand.find((c) => c.id === 'us_artillery' && aiAmmo >= c.ammoCost);
    if (artilleryCard) {
      let highestValueTarget: { unit: BoardCard; zoneId: ZoneId } | null = null;
      let maxAtk = -1;

      for (const zId of zoneList) {
        for (const u of zones[zId].nlfUnits) {
          if (!u.isHidden) {
            const def = CARD_DEFINITIONS[u.cardDefId];
            if (def && (def.attack || 0) > maxAtk) {
              maxAtk = def.attack || 0;
              highestValueTarget = { unit: u, zoneId: zId };
            }
          }
        }
      }

      if (highestValueTarget && maxAtk >= 3) {
        return {
          actionType: 'PLAY_TACTIC',
          cardDef: artilleryCard,
          targetFaceUpCardInstanceId: highestValueTarget.unit.instanceId,
          targetZone: highestValueTarget.zoneId,
          reasoning: `Heavy artillery bombardment (2 Ammo) targeted against confirmed enemy combatant in ${zones[highestValueTarget.zoneId].name}.`,
        };
      }
    }

    // 3. Huey Chopper if there are hidden NLF cards
    const hueyCard = aiHand.find((c) => c.id === 'us_huey' && aiAmmo >= c.ammoCost);
    if (hueyCard) {
      let hiddenTarget: { unit: BoardCard; zoneId: ZoneId } | null = null;
      for (const zId of zoneList) {
        const hiddenUnit = zones[zId].nlfUnits.find((u) => u.isHidden);
        if (hiddenUnit) {
          hiddenTarget = { unit: hiddenUnit, zoneId: zId };
          break;
        }
      }

      return {
        actionType: 'PLAY_UNIT',
        cardDef: hueyCard,
        targetZone: bestTargetZone,
        playHidden: false,
        targetHiddenCardInstanceId: hiddenTarget?.unit.instanceId,
        reasoning: hiddenTarget
          ? `Deploying Air Cavalry recon into ${zones[bestTargetZone].name} and scanning suspected guerrilla positions.`
          : `Deploying Huey Chopper to provide air support in ${zones[bestTargetZone].name}.`,
      };
    }

    // 4. M60 Machine Gun if ammo >= 2
    const m60Card = aiHand.find((c) => c.id === 'us_m60' && aiAmmo >= c.ammoCost);
    if (m60Card) {
      return {
        actionType: 'PLAY_UNIT',
        cardDef: m60Card,
        targetZone: bestTargetZone,
        playHidden: false,
        reasoning: `Deploying heavy M60 machine gun squad to establish 5-firepower perimeter in ${zones[bestTargetZone].name}.`,
      };
    }

    // 5. M16 Rifleman if ammo >= 1
    const m16Card = aiHand.find((c) => c.id === 'us_m16' && aiAmmo >= c.ammoCost);
    if (m16Card) {
      return {
        actionType: 'PLAY_UNIT',
        cardDef: m16Card,
        targetZone: bestTargetZone,
        playHidden: false,
        reasoning: `Deploying frontline M16 patrol into ${zones[bestTargetZone].name}.`,
      };
    }
  }

  // --- NLF AI LOGIC ---
  if (aiFaction === 'NLF') {
    // 1. Ambush tactic if US has ammo >= 2
    const ambushCard = aiHand.find((c) => c.id === 'nlf_ambush' && aiAmmo >= c.ammoCost);
    if (ambushCard && opponentAmmo >= 2) {
      return {
        actionType: 'PLAY_TACTIC',
        cardDef: ambushCard,
        reasoning: 'Executing hit-and-run Ambush on US supply convoys to drain 2 of their Ammo Tokens.',
      };
    }

    // 2. Punji Trap if available and target zone has no NLF trap yet
    const punjiCard = aiHand.find((c) => c.id === 'nlf_punji' && aiAmmo >= c.ammoCost);
    if (punjiCard) {
      // Find a zone where US might enter
      const trapZone = zoneList.find((zId) => zones[zId].nlfUnits.length === 0) || bestTargetZone;
      return {
        actionType: 'PLAY_UNIT',
        cardDef: punjiCard,
        targetZone: trapZone,
        playHidden: true,
        reasoning: `Concealing Punji spike trap in ${zones[trapZone].name} to eliminate the next incoming US patrol.`,
      };
    }

    // 3. RPG Team (Play Face-Up with 4 Attack Power)
    const rpgCard = aiHand.find((c) => c.id === 'nlf_rpg' && aiAmmo >= c.ammoCost);
    if (rpgCard) {
      return {
        actionType: 'PLAY_UNIT',
        cardDef: rpgCard,
        targetZone: bestTargetZone,
        playHidden: false,
        reasoning: `Deploying RPG anti-armor squad into ${zones[bestTargetZone].name} with 4 Firepower.`,
      };
    }

    // 4. Tunnel Network tactic
    const tunnelCard = aiHand.find((c) => c.id === 'nlf_tunnel' && aiAmmo >= c.ammoCost);
    if (tunnelCard) {
      // Check if we have a unit in a zone with excess victory or empty, and another zone that needs help
      const sourceZoneId = zoneList.find((zId) => {
        const diff = getZoneDifferential(zId).diff;
        return diff > 3 && zones[zId].nlfUnits.length > 0;
      });

      if (sourceZoneId) {
        const movableUnit = zones[sourceZoneId].nlfUnits[0];
        const destZoneId = zoneList.find((zId) => zId !== sourceZoneId && getZoneDifferential(zId).diff < 0) || bestTargetZone;

        if (movableUnit && destZoneId !== sourceZoneId) {
          return {
            actionType: 'PLAY_TACTIC',
            cardDef: tunnelCard,
            tunnelSourceZone: sourceZoneId,
            tunnelCardInstanceId: movableUnit.instanceId,
            tunnelDestZone: destZoneId,
            reasoning: `Relocating guerrilla squad via underground Củ Chi tunnels from ${zones[sourceZoneId].name} to ${zones[destZoneId].name}.`,
          };
        }
      }
    }

    // 5. AK-47 Fighter (Play Face-Up)
    const akCard = aiHand.find((c) => c.id === 'nlf_ak47' && aiAmmo >= c.ammoCost);
    if (akCard) {
      return {
        actionType: 'PLAY_UNIT',
        cardDef: akCard,
        targetZone: bestTargetZone,
        playHidden: false,
        reasoning: `Deploying frontline AK-47 combatants into ${zones[bestTargetZone].name}.`,
      };
    }
  }

  // Fallback: Check if any playable card exists
  const anyPlayableCard = aiHand.find((c) => aiAmmo >= c.ammoCost);
  if (anyPlayableCard) {
    if (anyPlayableCard.type === 'TACTIC') {
      return {
        actionType: 'PLAY_TACTIC',
        cardDef: anyPlayableCard,
        reasoning: `Executing ${anyPlayableCard.name}.`,
      };
    } else {
      return {
        actionType: 'PLAY_UNIT',
        cardDef: anyPlayableCard,
        targetZone: bestTargetZone,
        playHidden: anyPlayableCard.canBeHidden,
        reasoning: `Deploying ${anyPlayableCard.name} into ${zones[bestTargetZone].name}.`,
      };
    }
  }

  // Default Pass
  return {
    actionType: 'PASS',
    reasoning: 'Commander elects to hold positions and conserve tactical resources. Passing turn.',
  };
}
