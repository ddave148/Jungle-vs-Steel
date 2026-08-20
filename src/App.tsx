import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BoardCard,
  CardDefinition,
  Faction,
  GameMode,
  GamePhase,
  LogEntry,
  PendingTargeting,
  PlayerState,
  RoundResult,
  ZoneId,
  ZoneState,
} from './types';
import { CARD_DEFINITIONS, INITIAL_ZONES_CONFIG, buildStartingDeck, shuffleDeck } from './data/cards';
import { computeAiMove } from './utils/aiBot';
import { soundManager } from './utils/audio';
import { Header } from './components/Header';
import { ZoneColumn } from './components/ZoneColumn';
import { PlayerHand } from './components/PlayerHand';
import { ActionLog } from './components/ActionLog';
import { CombatResolutionModal } from './components/CombatResolutionModal';
import { RulebookModal } from './components/RulebookModal';
import { HistoricalDossierModal } from './components/HistoricalDossierModal';
import { GameOverModal } from './components/GameOverModal';
import { PassDeviceModal } from './components/PassDeviceModal';
import { Shield, Trees, Info, AlertCircle } from 'lucide-react';

const MAX_ROUNDS = 3;
const TARGET_ZONE_MARKERS = 3;

export default function App() {
  // Game Setup & Mode
  const [gameMode, setGameMode] = useState<GameMode>('VS_AI_AS_US');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [gamePhase, setGamePhase] = useState<GamePhase>('ACTION');
  const [activePlayer, setActivePlayer] = useState<Faction>('US');
  const [consecutivePasses, setConsecutivePasses] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Player States
  const [usPlayer, setUsPlayer] = useState<PlayerState>({
    faction: 'US',
    name: 'US Forces',
    ammo: 5,
    hand: [],
    deck: [],
    discard: [],
    hasPassed: false,
    isAi: false,
  });

  const [nlfPlayer, setNlfPlayer] = useState<PlayerState>({
    faction: 'NLF',
    name: 'NLF Guerrilla',
    ammo: 5,
    hand: [],
    deck: [],
    discard: [],
    hasPassed: false,
    isAi: true,
  });

  // Zones State
  const [zones, setZones] = useState<Record<ZoneId, ZoneState>>({
    ZONE_A: {
      id: 'ZONE_A',
      name: 'Zone A: Hill 875',
      regionName: 'Central Highlands',
      terrain: 'Dense jungle ridges and entrenched bunker perimeters.',
      controller: null,
      usUnits: [],
      nlfUnits: [],
    },
    ZONE_B: {
      id: 'ZONE_B',
      name: 'Zone B: Iron Triangle',
      regionName: 'Bình Dương Sector',
      terrain: 'Vast underground complex covered in bamboo thickets.',
      controller: null,
      usUnits: [],
      nlfUnits: [],
    },
    ZONE_C: {
      id: 'ZONE_C',
      name: 'Zone C: Mekong Delta',
      regionName: 'Southern Waterways',
      terrain: 'Mangrove swamps, tidal canals, and river ambush corridors.',
      controller: null,
      usUnits: [],
      nlfUnits: [],
    },
  });

  // Score & History
  const [usZoneMarkers, setUsZoneMarkers] = useState<number>(0);
  const [nlfZoneMarkers, setNlfZoneMarkers] = useState<number>(0);
  const [roundHistory, setRoundHistory] = useState<
    Array<{ round: number; zoneWinners: Record<ZoneId, Faction | 'TIE'> }>
  >([]);

  // Logs & UI Modals
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [showRulebook, setShowRulebook] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showPassModal, setShowPassModal] = useState<boolean>(false);
  const [currentRoundResult, setCurrentRoundResult] = useState<RoundResult | null>(null);
  const [gameWinner, setGameWinner] = useState<Faction | 'TIE' | null>(null);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Card Selection & Interactive Targeting state
  const [selectedCard, setSelectedCard] = useState<CardDefinition | null>(null);
  const [playAsHidden, setPlayAsHidden] = useState<boolean>(false);
  const [pendingTargeting, setPendingTargeting] = useState<PendingTargeting | null>(null);

  const addLog = useCallback(
    (faction: Faction | 'SYSTEM', message: string, type: LogEntry['type'], highlight = false) => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const newEntry: LogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: timeStr,
        round: currentRound,
        faction,
        message,
        type,
        highlight,
      };
      setLogEntries((prev) => [...prev, newEntry]);
    },
    [currentRound]
  );

  // Initialize or Restart Match
  const initializeGame = useCallback(
    (mode: GameMode = gameMode) => {
      const usDeck = buildStartingDeck('US');
      const nlfDeck = buildStartingDeck('NLF');

      const usInitialHand = usDeck.slice(0, 4);
      const usDrawPile = usDeck.slice(4);

      const nlfInitialHand = nlfDeck.slice(0, 4);
      const nlfDrawPile = nlfDeck.slice(4);

      setGameMode(mode);
      setCurrentRound(1);
      setGamePhase('ACTION');
      setActivePlayer('US');
      setConsecutivePasses(0);
      setUsZoneMarkers(0);
      setNlfZoneMarkers(0);
      setRoundHistory([]);
      setCurrentRoundResult(null);
      setGameWinner(null);
      setSelectedCard(null);
      setPendingTargeting(null);
      setShowPassModal(false);

      const isUsAi = mode === 'VS_AI_AS_NLF';
      const isNlfAi = mode === 'VS_AI_AS_US';

      setUsPlayer({
        faction: 'US',
        name: isUsAi ? 'US AI Commander' : 'US Forces (You)',
        ammo: 5,
        hand: usInitialHand,
        deck: usDrawPile,
        discard: [],
        hasPassed: false,
        isAi: isUsAi,
      });

      setNlfPlayer({
        faction: 'NLF',
        name: isNlfAi ? 'NLF AI Cell' : 'NLF Guerrilla (You)',
        ammo: 5,
        hand: nlfInitialHand,
        deck: nlfDrawPile,
        discard: [],
        hasPassed: false,
        isAi: isNlfAi,
      });

      const initialZones: Record<ZoneId, ZoneState> = {
        ZONE_A: {
          id: 'ZONE_A',
          name: 'Zone A: Hill 875',
          regionName: 'Central Highlands',
          terrain: 'Dense jungle ridges and entrenched bunker perimeters.',
          controller: null,
          usUnits: [],
          nlfUnits: [],
        },
        ZONE_B: {
          id: 'ZONE_B',
          name: 'Zone B: Iron Triangle',
          regionName: 'Bình Dương Sector',
          terrain: 'Vast underground complex covered in bamboo thickets.',
          controller: null,
          usUnits: [],
          nlfUnits: [],
        },
        ZONE_C: {
          id: 'ZONE_C',
          name: 'Zone C: Mekong Delta',
          regionName: 'Southern Waterways',
          terrain: 'Mangrove swamps, tidal canals, and river ambush corridors.',
          controller: null,
          usUnits: [],
          nlfUnits: [],
        },
      };
      setZones(initialZones);

      setLogEntries([
        {
          id: 'init-1',
          timestamp: new Date().toTimeString().split(' ')[0],
          round: 1,
          faction: 'SYSTEM',
          message: 'Match initialized: 1968 Vietnam War Theatre. Round 1 Action Phase active.',
          type: 'ZONE_CLAIM',
          highlight: true,
        },
        {
          id: 'init-2',
          timestamp: new Date().toTimeString().split(' ')[0],
          round: 1,
          faction: 'US',
          message: 'US Forces hold initial initiative. 5 Ammo Tokens allocated per commander.',
          type: 'AMMO',
        },
      ]);
    },
    [gameMode]
  );

  // Initialize on mount
  useEffect(() => {
    initializeGame();
  }, []);

  // Pass Turn handler
  const handlePassTurn = useCallback(() => {
    soundManager.playTurnChime();
    const currentFaction = activePlayer;
    const nextFaction: Faction = currentFaction === 'US' ? 'NLF' : 'US';
    const nextConsecutive = consecutivePasses + 1;

    addLog(
      currentFaction,
      `${currentFaction === 'US' ? 'US Forces' : 'NLF Guerrilla'} passed action.`,
      'PASS'
    );

    if (currentFaction === 'US') {
      setUsPlayer((prev) => ({ ...prev, hasPassed: true }));
    } else {
      setNlfPlayer((prev) => ({ ...prev, hasPassed: true }));
    }

    if (nextConsecutive >= 2) {
      // Both passed consecutively! End Action Phase -> Trigger Combat Phase
      addLog(
        'SYSTEM',
        'Both commanders have passed consecutively. Action Phase closed. Initiating Phase 2: Combat Phase!',
        'COMBAT',
        true
      );
      triggerCombatPhase();
    } else {
      setConsecutivePasses(nextConsecutive);
      setActivePlayer(nextFaction);

      if (gameMode === 'PASS_AND_PLAY') {
        setShowPassModal(true);
      }
    }
  }, [activePlayer, consecutivePasses, gameMode, addLog]);

  // Execute End-of-Round Combat Phase
  const triggerCombatPhase = useCallback(() => {
    setGamePhase('COMBAT_REVEAL');
    soundManager.playArtilleryExplosion();

    // 1. Reveal all hidden NLF units & calculate RPG bonuses
    let updatedZones = { ...zones };
    const rpgBonusUnits: string[] = [];

    (Object.keys(updatedZones) as ZoneId[]).forEach((zId) => {
      const zone = updatedZones[zId];
      const revealedNlf = zone.nlfUnits.map((u) => {
        if (u.isHidden) {
          if (u.cardDefId === 'nlf_rpg') {
            rpgBonusUnits.push(u.instanceId);
            return {
              ...u,
              isHidden: false,
              revealedInCombat: true,
            };
          }
          return {
            ...u,
            isHidden: false,
          };
        }
        return u;
      });
      updatedZones[zId] = { ...zone, nlfUnits: revealedNlf };
    });

    setZones(updatedZones);

    // 2. Compute Attack Power per Zone
    const usAttack: Record<ZoneId, number> = { ZONE_A: 0, ZONE_B: 0, ZONE_C: 0 };
    const nlfAttack: Record<ZoneId, number> = { ZONE_A: 0, ZONE_B: 0, ZONE_C: 0 };
    const zoneWinners: Record<ZoneId, Faction | 'TIE'> = {
      ZONE_A: 'TIE',
      ZONE_B: 'TIE',
      ZONE_C: 'TIE',
    };

    let roundUsWins = 0;
    let roundNlfWins = 0;

    (Object.keys(updatedZones) as ZoneId[]).forEach((zId) => {
      const zone = updatedZones[zId];
      const usPwr = zone.usUnits.reduce((sum, u) => {
        const def = CARD_DEFINITIONS[u.cardDefId];
        return sum + (def?.attack || 0);
      }, 0);

      const nlfPwr = zone.nlfUnits.reduce((sum, u) => {
        const def = CARD_DEFINITIONS[u.cardDefId];
        let pwr = def?.attack || 0;
        if (u.revealedInCombat && u.cardDefId === 'nlf_rpg') {
          pwr += 2; // +2 RPG ambush bonus
        }
        return sum + pwr;
      }, 0);

      usAttack[zId] = usPwr;
      nlfAttack[zId] = nlfPwr;

      if (usPwr > nlfPwr) {
        zoneWinners[zId] = 'US';
        roundUsWins++;
        updatedZones[zId] = { ...zone, controller: 'US' };
      } else if (nlfPwr > usPwr) {
        zoneWinners[zId] = 'NLF';
        roundNlfWins++;
        updatedZones[zId] = { ...zone, controller: 'NLF' };
      } else {
        zoneWinners[zId] = 'TIE';
      }
    });

    const newUsScore = usZoneMarkers + roundUsWins;
    const newNlfScore = nlfZoneMarkers + roundNlfWins;

    setUsZoneMarkers(newUsScore);
    setNlfZoneMarkers(newNlfScore);

    const roundRes: RoundResult = {
      roundNumber: currentRound,
      zoneWinners,
      usAttack,
      nlfAttack,
      rpgBonusUnits,
    };

    setCurrentRoundResult(roundRes);
    setRoundHistory((prev) => [...prev, { round: currentRound, zoneWinners }]);

    // Check Win Condition:
    // First player to collect 3 Zone Control Markers (or most zones after 3 rounds)
    // If scores are equal when targets/rounds complete -> DRAW / STALEMATE
    let winner: Faction | 'TIE' | null = null;
    const isTargetReached = newUsScore >= TARGET_ZONE_MARKERS || newNlfScore >= TARGET_ZONE_MARKERS;
    const isMaxRoundsReached = currentRound >= MAX_ROUNDS;

    if (isTargetReached || isMaxRoundsReached) {
      if (newUsScore > newNlfScore) {
        winner = 'US';
      } else if (newNlfScore > newUsScore) {
        winner = 'NLF';
      } else {
        winner = 'TIE';
      }
    }

    if (winner) {
      setGameWinner(winner);
      setGamePhase('GAME_OVER');
      addLog(
        'SYSTEM',
        `Campaign concludes! ${
          winner === 'US'
            ? 'US Forces Victory!'
            : winner === 'NLF'
            ? 'NLF Guerrilla Victory!'
            : 'Draw — Operational Stalemate with equal campaign standings!'
        }`,
        'ZONE_CLAIM',
        true
      );
    } else {
      setGamePhase('ROUND_RESOLVED');
    }
  }, [zones, currentRound, usZoneMarkers, nlfZoneMarkers, addLog]);

  // Advance to Next Round or Final Campaign Outcome
  const proceedToNextRound = useCallback(() => {
    if (gameWinner || currentRound >= MAX_ROUNDS || gamePhase === 'GAME_OVER') {
      soundManager.playVictoryFanfare();
      setGamePhase('GAME_OVER');
      setCurrentRoundResult(null);
      setSelectedCard(null);
      setPendingTargeting(null);
      return;
    }

    const nextRoundNumber = currentRound + 1;
    setCurrentRound(nextRoundNumber);
    setGamePhase('ACTION');
    setActivePlayer('US');
    setConsecutivePasses(0);
    setCurrentRoundResult(null);
    setSelectedCard(null);
    setPendingTargeting(null);

    // Reset board units to discard piles
    const discardedUs: CardDefinition[] = [];
    const discardedNlf: CardDefinition[] = [];

    (Object.values(zones) as ZoneState[]).forEach((z) => {
      z.usUnits.forEach((u) => {
        const def = CARD_DEFINITIONS[u.cardDefId];
        if (def) discardedUs.push(def);
      });
      z.nlfUnits.forEach((u) => {
        const def = CARD_DEFINITIONS[u.cardDefId];
        if (def) discardedNlf.push(def);
      });
    });

    // Clear board units
    setZones((prev) => {
      const nextZones = { ...prev };
      (Object.keys(nextZones) as ZoneId[]).forEach((zId) => {
        nextZones[zId] = {
          ...nextZones[zId],
          usUnits: [],
          nlfUnits: [],
        };
      });
      return nextZones;
    });

    // Draw 3 cards each & Replenish Ammo to 5
    setUsPlayer((prev) => {
      let currentDeck = [...prev.deck];
      let currentDiscard = [...prev.discard, ...discardedUs];

      if (currentDeck.length < 3) {
        currentDeck = [...currentDeck, ...shuffleDeck(currentDiscard)];
        currentDiscard = [];
      }

      const drawn = currentDeck.slice(0, 3);
      const remainingDeck = currentDeck.slice(3);

      return {
        ...prev,
        ammo: 5,
        hand: [...prev.hand, ...drawn],
        deck: remainingDeck,
        discard: currentDiscard,
        hasPassed: false,
      };
    });

    setNlfPlayer((prev) => {
      let currentDeck = [...prev.deck];
      let currentDiscard = [...prev.discard, ...discardedNlf];

      if (currentDeck.length < 3) {
        currentDeck = [...currentDeck, ...shuffleDeck(currentDiscard)];
        currentDiscard = [];
      }

      const drawn = currentDeck.slice(0, 3);
      const remainingDeck = currentDeck.slice(3);

      return {
        ...prev,
        ammo: 5,
        hand: [...prev.hand, ...drawn],
        deck: remainingDeck,
        discard: currentDiscard,
        hasPassed: false,
      };
    });

    addLog(
      'SYSTEM',
      `--- Round ${nextRoundNumber} Commencing! Commanders drew 3 cards and replenished to 5 Ammo Tokens. ---`,
      'AMMO',
      true
    );
  }, [gameWinner, currentRound, zones, addLog]);

  // Card Deployment & Tactic Execution Engine
  const executeDeployUnit = useCallback(
    (
      faction: Faction,
      cardDef: CardDefinition,
      targetZoneId: ZoneId,
      hidden: boolean,
      reconTargetInstanceId?: string
    ) => {
      // 1. Check & Deduct Ammo
      if (faction === 'US') {
        if (usPlayer.ammo < cardDef.ammoCost) return;
        setUsPlayer((prev) => ({
          ...prev,
          ammo: prev.ammo - cardDef.ammoCost,
          hand: prev.hand.filter((c, i) => i !== prev.hand.findIndex((item) => item.id === cardDef.id)),
        }));
      } else {
        if (nlfPlayer.ammo < cardDef.ammoCost) return;
        setNlfPlayer((prev) => ({
          ...prev,
          ammo: prev.ammo - cardDef.ammoCost,
          hand: prev.hand.filter((c, i) => i !== prev.hand.findIndex((item) => item.id === cardDef.id)),
        }));
      }

      soundManager.playCardDeploy();

      const newUnit: BoardCard = {
        instanceId: `unit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        cardDefId: cardDef.id,
        faction,
        isHidden: hidden,
        enteredThisTurn: true,
      };

      // Check Punji Trap Trigger:
      // If a US unit enters a zone containing an active NLF Punji Trap, trap triggers instantly!
      if (faction === 'US') {
        const zoneNlfUnits = zones[targetZoneId].nlfUnits;
        const punjiIndex = zoneNlfUnits.findIndex(
          (u) => u.cardDefId === 'nlf_punji' && u.isHidden
        );

        if (punjiIndex !== -1) {
          const punjiUnit = zoneNlfUnits[punjiIndex];
          soundManager.playTrapSnap();

          // Destroy both entering US unit and the Punji Trap
          setZones((prev) => {
            const z = prev[targetZoneId];
            return {
              ...prev,
              [targetZoneId]: {
                ...z,
                nlfUnits: z.nlfUnits.filter((u) => u.instanceId !== punjiUnit.instanceId),
              },
            };
          });

          // Place into discards
          setUsPlayer((prev) => ({ ...prev, discard: [...prev.discard, cardDef] }));
          setNlfPlayer((prev) => ({
            ...prev,
            discard: [...prev.discard, CARD_DEFINITIONS['nlf_punji']],
          }));

          addLog(
            'NLF',
            `PUNJI TRAP TRIGGERED in ${zones[targetZoneId].name}! Concealed sharpened bamboo spikes destroy incoming ${cardDef.name}!`,
            'TRAP',
            true
          );

          finishActionTurn(faction);
          return;
        }
      }

      // Add unit to zone
      setZones((prev) => {
        const z = prev[targetZoneId];
        return {
          ...prev,
          [targetZoneId]: {
            ...z,
            usUnits: faction === 'US' ? [...z.usUnits, newUnit] : z.usUnits,
            nlfUnits: faction === 'NLF' ? [...z.nlfUnits, newUnit] : z.nlfUnits,
          },
        };
      });

      addLog(
        faction,
        `${faction === 'US' ? 'US Forces' : 'NLF Guerrilla'} deployed ${
          hidden ? 'Concealed Unit (Hidden)' : cardDef.name
        } into ${zones[targetZoneId].name}.`,
        'DEPLOY'
      );

      // Special Case: Huey Chopper Recon effect
      if (cardDef.id === 'us_huey') {
        soundManager.playHueyChopper();
        if (reconTargetInstanceId) {
          // Flip the targeted hidden card
          revealHiddenCardByInstanceId(reconTargetInstanceId);
        }
      }

      finishActionTurn(faction);
    },
    [usPlayer.ammo, nlfPlayer.ammo, zones, addLog]
  );

  // Helper to reveal a specific hidden card by instanceId (used by Huey Chopper)
  const revealHiddenCardByInstanceId = useCallback(
    (targetInstanceId: string) => {
      let scoutedCardName = 'Enemy Unit';
      setZones((prev) => {
        const nextZones = { ...prev };
        (Object.keys(nextZones) as ZoneId[]).forEach((zId) => {
          const z = nextZones[zId];
          const unit = z.nlfUnits.find((u) => u.instanceId === targetInstanceId);
          if (unit) {
            scoutedCardName = CARD_DEFINITIONS[unit.cardDefId]?.name || 'Guerrilla Unit';
          }
          nextZones[zId] = {
            ...z,
            nlfUnits: z.nlfUnits.map((u) =>
              u.instanceId === targetInstanceId
                ? { ...u, isHidden: false, wasScoutedByHuey: true }
                : u
            ),
          };
        });
        return nextZones;
      });

      soundManager.playRevealCard();
      addLog(
        'US',
        `Huey Chopper Reconnaissance spotted and exposed: [${scoutedCardName}]! Ambush negated.`,
        'RECON',
        true
      );
    },
    [addLog]
  );

  // Execute Tactic Card
  const executeTacticCard = useCallback(
    (
      faction: Faction,
      cardDef: CardDefinition,
      extraParams?: {
        targetFaceUpCardId?: string;
        tunnelSourceZone?: ZoneId;
        tunnelCardId?: string;
        tunnelDestZone?: ZoneId;
      }
    ) => {
      // Deduct ammo & remove from hand
      if (faction === 'US') {
        if (usPlayer.ammo < cardDef.ammoCost) return;
        setUsPlayer((prev) => ({
          ...prev,
          ammo: prev.ammo - cardDef.ammoCost,
          hand: prev.hand.filter((c, i) => i !== prev.hand.findIndex((item) => item.id === cardDef.id)),
          discard: [...prev.discard, cardDef],
        }));
      } else {
        if (nlfPlayer.ammo < cardDef.ammoCost) return;
        setNlfPlayer((prev) => ({
          ...prev,
          ammo: prev.ammo - cardDef.ammoCost,
          hand: prev.hand.filter((c, i) => i !== prev.hand.findIndex((item) => item.id === cardDef.id)),
          discard: [...prev.discard, cardDef],
        }));
      }

      // Handle individual Tactic types
      switch (cardDef.id) {
        case 'us_supply': {
          // Immediately gain +1 Ammo Token
          soundManager.playAmmoClink();
          setUsPlayer((prev) => ({
            ...prev,
            ammo: Math.min(prev.ammo + 1, 10),
          }));
          addLog(
            'US',
            'C-130 Supply Drop delivered: US Forces gained +1 Ammo Token!',
            'TACTIC',
            true
          );
          break;
        }

        case 'us_artillery': {
          // Target and destroy 1 face-up enemy unit in any zone
          if (extraParams?.targetFaceUpCardId) {
            soundManager.playArtilleryExplosion();
            let destroyedName = 'Enemy Unit';

            setZones((prev) => {
              const nextZones = { ...prev };
              (Object.keys(nextZones) as ZoneId[]).forEach((zId) => {
                const z = nextZones[zId];
                const unit = z.nlfUnits.find((u) => u.instanceId === extraParams.targetFaceUpCardId);
                if (unit) {
                  destroyedName = CARD_DEFINITIONS[unit.cardDefId]?.name || 'Enemy Unit';
                }
                nextZones[zId] = {
                  ...z,
                  nlfUnits: z.nlfUnits.filter((u) => u.instanceId !== extraParams.targetFaceUpCardId),
                };
              });
              return nextZones;
            });

            addLog(
              'US',
              `Artillery Strike obliterated enemy [${destroyedName}]!`,
              'TACTIC',
              true
            );
          }
          break;
        }

        case 'nlf_ambush': {
          // Force US player to immediately discard 2 Ammo Tokens
          soundManager.playGunfireBurst();
          setUsPlayer((prev) => {
            const newAmmo = Math.max(0, prev.ammo - 2);
            return { ...prev, ammo: newAmmo };
          });
          addLog(
            'NLF',
            'NLF Ambush executed on US supply line: US player lost 2 Ammo Tokens!',
            'TACTIC',
            true
          );
          break;
        }

        case 'nlf_tunnel': {
          // Relocate 1 of your deployed units to any other zone instantly
          if (
            extraParams?.tunnelSourceZone &&
            extraParams?.tunnelCardId &&
            extraParams?.tunnelDestZone
          ) {
            soundManager.playTunnelSwoosh();
            const sourceZone = extraParams.tunnelSourceZone;
            const destZone = extraParams.tunnelDestZone;
            const unitId = extraParams.tunnelCardId;

            setZones((prev) => {
              const src = prev[sourceZone];
              const dst = prev[destZone];
              const movingUnit = src.nlfUnits.find((u) => u.instanceId === unitId);
              if (!movingUnit) return prev;

              return {
                ...prev,
                [sourceZone]: {
                  ...src,
                  nlfUnits: src.nlfUnits.filter((u) => u.instanceId !== unitId),
                },
                [destZone]: {
                  ...dst,
                  nlfUnits: [...dst.nlfUnits, movingUnit],
                },
              };
            });

            addLog(
              'NLF',
              `Tunnel Network used: Guerrilla unit relocated underground from ${zones[sourceZone].name} to ${zones[destZone].name}.`,
              'TACTIC',
              true
            );
          }
          break;
        }
      }

      finishActionTurn(faction);
    },
    [usPlayer.ammo, nlfPlayer.ammo, zones, addLog]
  );

  // Switch Turn After Action
  const finishActionTurn = (currentFaction: Faction) => {
    setConsecutivePasses(0); // Reset consecutive passes because an action was made!
    setSelectedCard(null);
    setPendingTargeting(null);

    const nextFaction: Faction = currentFaction === 'US' ? 'NLF' : 'US';
    setActivePlayer(nextFaction);

    if (gameMode === 'PASS_AND_PLAY') {
      setShowPassModal(true);
    }
  };

  // AI Turn Loop Trigger
  useEffect(() => {
    if (gamePhase !== 'ACTION') return;

    const isCurrentPlayerAi =
      (activePlayer === 'US' && usPlayer.isAi) || (activePlayer === 'NLF' && nlfPlayer.isAi);

    if (!isCurrentPlayerAi) return;

    setIsAiThinking(true);
    const timer = setTimeout(() => {
      const currentAiPlayer = activePlayer === 'US' ? usPlayer : nlfPlayer;
      const opponentPlayer = activePlayer === 'US' ? nlfPlayer : usPlayer;

      const aiDecision = computeAiMove(
        activePlayer,
        currentAiPlayer.ammo,
        currentAiPlayer.hand,
        zones,
        opponentPlayer.ammo
      );

      setIsAiThinking(false);

      if (aiDecision.actionType === 'PASS') {
        handlePassTurn();
      } else if (aiDecision.actionType === 'PLAY_UNIT' && aiDecision.cardDef && aiDecision.targetZone) {
        executeDeployUnit(
          activePlayer,
          aiDecision.cardDef,
          aiDecision.targetZone,
          aiDecision.playHidden || false,
          aiDecision.targetHiddenCardInstanceId
        );
      } else if (aiDecision.actionType === 'PLAY_TACTIC' && aiDecision.cardDef) {
        executeTacticCard(activePlayer, aiDecision.cardDef, {
          targetFaceUpCardId: aiDecision.targetFaceUpCardInstanceId,
          tunnelSourceZone: aiDecision.tunnelSourceZone,
          tunnelCardId: aiDecision.tunnelCardInstanceId,
          tunnelDestZone: aiDecision.tunnelDestZone,
        });
      }
    }, 1100);

    return () => clearTimeout(timer);
  }, [
    activePlayer,
    gamePhase,
    usPlayer.isAi,
    nlfPlayer.isAi,
    usPlayer.ammo,
    nlfPlayer.ammo,
    usPlayer.hand,
    nlfPlayer.hand,
    zones,
    handlePassTurn,
    executeDeployUnit,
    executeTacticCard,
  ]);

  // User UI Interactions: Select Card from Hand
  const handleSelectCardFromHand = (card: CardDefinition, hidden = false) => {
    setSelectedCard(card);
    setPlayAsHidden(hidden);

    // If it's a tactic requiring targeting:
    if (card.id === 'us_artillery') {
      // Find if there are face-up enemy units to target
      const hasFaceUpTarget = (Object.values(zones) as ZoneState[]).some((z) =>
        z.nlfUnits.some((u) => !u.isHidden)
      );

      if (!hasFaceUpTarget) {
        addLog('SYSTEM', 'Artillery Strike requires at least 1 face-up enemy unit on the board.', 'TACTIC');
        setSelectedCard(null);
        return;
      }

      setPendingTargeting({
        type: 'ARTILLERY_TARGET',
        cardDef: card,
        promptText: 'Select 1 face-up enemy unit to destroy with Artillery bombardment:',
      });
      return;
    }

    if (card.id === 'nlf_tunnel') {
      // Check if NLF has any units on board
      const hasUnits = (Object.values(zones) as ZoneState[]).some((z) => z.nlfUnits.length > 0);
      if (!hasUnits) {
        addLog('SYSTEM', 'Tunnel Network requires at least 1 deployed guerrilla unit to relocate.', 'TACTIC');
        setSelectedCard(null);
        return;
      }

      setPendingTargeting({
        type: 'TUNNEL_SELECT_UNIT',
        cardDef: card,
        promptText: 'Select 1 of your deployed guerrilla units to enter the tunnel system:',
      });
      return;
    }

    if (card.id === 'us_supply' || card.id === 'nlf_ambush') {
      // Instant tactics with no board targeting
      executeTacticCard(activePlayer, card);
      return;
    }

    // Otherwise it's a unit card to deploy into a zone
    if (card.id === 'us_huey') {
      // Check if there are hidden NLF cards anywhere
      const hasHiddenCards = (Object.values(zones) as ZoneState[]).some((z) =>
        z.nlfUnits.some((u) => u.isHidden)
      );

      if (hasHiddenCards) {
        setPendingTargeting({
          type: 'HUEY_TARGET',
          cardDef: card,
          promptText: 'Deploy Huey: First click on 1 Hidden NLF unit on the board to scout it, or click a zone to deploy directly!',
        });
      }
    }
  };

  // User UI Interactions: Click on Zone to Deploy or Relocate
  const handleDeployToZone = (targetZoneId: ZoneId) => {
    if (!selectedCard) return;

    if (pendingTargeting?.type === 'TUNNEL_SELECT_DEST') {
      // Finish Tunnel Network relocation
      executeTacticCard(activePlayer, selectedCard, {
        tunnelSourceZone: pendingTargeting.sourceZone,
        tunnelCardId: pendingTargeting.selectedUnitId,
        tunnelDestZone: targetZoneId,
      });
      return;
    }

    // Standard Unit Deployment
    executeDeployUnit(
      activePlayer,
      selectedCard,
      targetZoneId,
      playAsHidden,
      pendingTargeting?.selectedUnitId
    );
  };

  // User UI Interactions: Click on a Card on the Board (for targeting)
  const handleCardClick = (card: BoardCard, zoneId: ZoneId) => {
    if (!pendingTargeting) return;

    if (pendingTargeting.type === 'ARTILLERY_TARGET' && card.faction === 'NLF' && !card.isHidden) {
      if (selectedCard) {
        executeTacticCard('US', selectedCard, { targetFaceUpCardId: card.instanceId });
      }
      return;
    }

    if (pendingTargeting.type === 'HUEY_TARGET' && card.faction === 'NLF' && card.isHidden) {
      // Set scout target and prompt user for zone deployment
      setPendingTargeting({
        type: 'HUEY_TARGET',
        cardDef: selectedCard || undefined,
        selectedUnitId: card.instanceId,
        promptText: 'Scout locked on target! Now select a Zone to deploy the Huey Chopper.',
      });
      return;
    }

    if (pendingTargeting.type === 'TUNNEL_SELECT_UNIT' && card.faction === 'NLF') {
      setPendingTargeting({
        type: 'TUNNEL_SELECT_DEST',
        cardDef: selectedCard || undefined,
        sourceZone: zoneId,
        selectedUnitId: card.instanceId,
        promptText: `Selected guerrilla unit in ${zones[zoneId].name}. Now click 'Tunnel Here' on the destination zone.`,
      });
      return;
    }
  };

  // Compute Targetable Card Instance IDs for UI glowing borders
  const getTargetableCardIds = (): string[] => {
    if (!pendingTargeting) return [];

    if (pendingTargeting.type === 'ARTILLERY_TARGET') {
      const ids: string[] = [];
      (Object.values(zones) as ZoneState[]).forEach((z) => {
        z.nlfUnits.forEach((u) => {
          if (!u.isHidden) ids.push(u.instanceId);
        });
      });
      return ids;
    }

    if (pendingTargeting.type === 'HUEY_TARGET') {
      const ids: string[] = [];
      (Object.values(zones) as ZoneState[]).forEach((z) => {
        z.nlfUnits.forEach((u) => {
          if (u.isHidden) ids.push(u.instanceId);
        });
      });
      return ids;
    }

    if (pendingTargeting.type === 'TUNNEL_SELECT_UNIT') {
      const ids: string[] = [];
      (Object.values(zones) as ZoneState[]).forEach((z) => {
        z.nlfUnits.forEach((u) => {
          ids.push(u.instanceId);
        });
      });
      return ids;
    }

    return [];
  };

  const targetableCardIds = getTargetableCardIds();
  const isHumanTurn =
    (activePlayer === 'US' && !usPlayer.isAi) || (activePlayer === 'NLF' && !nlfPlayer.isAi);

  const activePlayerData = activePlayer === 'US' ? usPlayer : nlfPlayer;

  return (
    <div className="min-h-screen bg-[#0c0d0c] text-[#d1d5db] flex flex-col font-sans selection:bg-emerald-900 selection:text-white border-2 sm:border-4 border-[#1a1c1a]">
      {/* Top Header */}
      <Header
        currentRound={currentRound}
        maxRounds={MAX_ROUNDS}
        activePlayer={activePlayer}
        gameMode={gameMode}
        usZoneMarkers={usZoneMarkers}
        nlfZoneMarkers={nlfZoneMarkers}
        targetMarkers={TARGET_ZONE_MARKERS}
        onSelectGameMode={(mode) => initializeGame(mode)}
        onOpenRulebook={() => setShowRulebook(true)}
        onOpenHistory={() => setShowHistory(true)}
        onResetGame={() => initializeGame()}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          soundManager.enabled = !soundEnabled;
          setSoundEnabled(!soundEnabled);
        }}
        isAiThinking={isAiThinking}
      />

      {/* Main Tactical Map View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* Battle Zones Grid (Zone A, Zone B, Zone C) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {(['ZONE_A', 'ZONE_B', 'ZONE_C'] as ZoneId[]).map((zId) => {
            const isDeployTarget =
              Boolean(selectedCard) &&
              selectedCard?.type !== 'TACTIC' &&
              pendingTargeting?.type !== 'TUNNEL_SELECT_DEST';

            const isTunnelDest =
              pendingTargeting?.type === 'TUNNEL_SELECT_DEST' &&
              pendingTargeting.sourceZone !== zId;

            return (
              <ZoneColumn
                key={zId}
                zone={zones[zId]}
                activePlayer={activePlayer}
                isDeployTarget={isDeployTarget && isHumanTurn}
                isTunnelSource={pendingTargeting?.sourceZone === zId}
                isTunnelDest={isTunnelDest}
                isArtilleryTargetZone={pendingTargeting?.type === 'ARTILLERY_TARGET'}
                isHueyTargetZone={pendingTargeting?.type === 'HUEY_TARGET'}
                selectedCardInHand={selectedCard}
                viewerFaction={
                  gameMode === 'VS_AI_AS_US' ? 'US' : gameMode === 'VS_AI_AS_NLF' ? 'NLF' : activePlayer
                }
                onDeployToZone={handleDeployToZone}
                onCardClick={handleCardClick}
                onSelectZoneForAction={handleDeployToZone}
                targetableCards={targetableCardIds}
              />
            );
          })}
        </div>

        {/* Lower Command Deck: Active Hand + Telemetry Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Active Player Hand Deck */}
          <div className="lg:col-span-8">
            <PlayerHand
              faction={activePlayer}
              playerName={activePlayerData.name}
              hand={activePlayerData.hand}
              ammo={activePlayerData.ammo}
              deckCount={activePlayerData.deck.length}
              discardCount={activePlayerData.discard.length}
              selectedCard={selectedCard}
              playAsHidden={playAsHidden}
              onSelectCard={handleSelectCardFromHand}
              onCancelSelection={() => {
                setSelectedCard(null);
                setPendingTargeting(null);
              }}
              onPassTurn={handlePassTurn}
              isCurrentTurn={true}
              isAiTurn={activePlayerData.isAi}
              pendingTargetingText={pendingTargeting?.promptText}
            />
          </div>

          {/* Real-time Dispatch Telemetry Log */}
          <div className="lg:col-span-4">
            <ActionLog entries={logEntries} />
          </div>
        </div>
      </main>

      {/* Footer bar styled after design HTML */}
      <footer className="w-full bg-[#0c0d0c] border-t border-white/10 px-4 sm:px-6 py-3 mt-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-blue-950/40 border border-blue-500/30 rounded text-[10px] font-mono uppercase tracking-tight text-blue-300">
              Steel Blue Deck: 10 Cards
            </span>
            <span className="px-2.5 py-1 bg-green-950/40 border border-green-500/30 rounded text-[10px] font-mono uppercase tracking-tight text-green-300">
              Jungle Green Deck: 10 Cards
            </span>
          </div>
          <p className="text-[10px] text-white/40 uppercase font-mono tracking-wider">
            Tactical Asymmetry Engine &copy; 1965-1975 Digital Interface
          </p>
        </div>
      </footer>

      {/* Modals & Overlays */}
      {/* 1. Rulebook Modal */}
      {showRulebook && <RulebookModal onClose={() => setShowRulebook(false)} />}

      {/* 2. Historical Dossier Modal */}
      {showHistory && <HistoricalDossierModal onClose={() => setShowHistory(false)} />}

      {/* 3. Pass Device Security Screen (2P Pass & Play) */}
      {showPassModal && (
        <PassDeviceModal
          nextPlayerFaction={activePlayer}
          onConfirmReady={() => setShowPassModal(false)}
        />
      )}

      {/* 4. Combat Resolution Modal */}
      {currentRoundResult && (
        <CombatResolutionModal
          roundResult={currentRoundResult}
          zones={zones}
          usScore={usZoneMarkers}
          nlfScore={nlfZoneMarkers}
          targetMarkers={TARGET_ZONE_MARKERS}
          currentRound={currentRound}
          maxRounds={MAX_ROUNDS}
          isGameOver={gamePhase === 'GAME_OVER' || Boolean(gameWinner) || currentRound >= MAX_ROUNDS}
          gameWinner={gameWinner}
          onProceedNextRound={proceedToNextRound}
        />
      )}

      {/* 5. Game Over Final Victory Modal */}
      {gamePhase === 'GAME_OVER' && !currentRoundResult && (
        <GameOverModal
          winner={gameWinner || 'TIE'}
          usScore={usZoneMarkers}
          nlfScore={nlfZoneMarkers}
          roundsPlayed={currentRound}
          roundHistory={roundHistory}
          zones={zones}
          onRestart={() => initializeGame()}
          onSelectGameMode={(mode) => initializeGame(mode)}
        />
      )}
    </div>
  );
}
