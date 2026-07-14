import { INITIAL_OPPONENTS } from "../data/opponents";
import { REWARD_TABLE } from "../data/rewards";
import { resolveAttack } from "./attacks";
import { createRaidTiles, revealRaidTile } from "./raids";
import { buildingCost, progressPercent, rewardFactor } from "./economy";
import { createBuildings, isIslandComplete } from "./progression";
import { pickReward, randomInt, sampleIds } from "./rng";
import { detectPaypoints } from "./paypoints";
import type { GameState, PaypointSignal } from "./types";

export type GameAction =
  | { type: "spin" }
  | { type: "setMultiplier"; multiplier: 1 | 2 | 5 | 10 }
  | { type: "upgrade"; buildingId: string }
  | { type: "resolveAttack"; targetId: string }
  | { type: "revealRaid"; tileId: string }
  | { type: "closeEncounter" }
  | { type: "refillEnergy" }
  | { type: "tick" };

export function createInitialState(): GameState {
  return withPaypoints({
    energy: 50,
    coins: 1800,
    shields: 1,
    multiplier: 1,
    island: 1,
    buildings: createBuildings(),
    opponents: INITIAL_OPPONENTS,
    liveOps: {
      tournamentRemaining: 300,
      rewardRushRemaining: 75,
      tournamentScore: 1180,
    },
    metrics: {
      spins: 0,
      coinsEarned: 0,
      coinsSpent: 0,
      energySpent: 0,
      attacks: 0,
      raids: 0,
      shieldsUsed: 0,
      paypointSignals: 0,
    },
    events: [
      { id: 1, tone: "system", text: "Demo Slots starts inside the playable loop. No landing page, no waiting." },
      { id: 2, tone: "system", text: "Reward Rush is live for the opening minute to expose the event pressure." },
    ],
    activePaypoints: [],
    encounter: null,
    lastReward: null,
    revengeTargetId: null,
    eventSeq: 2,
  });
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "spin":
      return withPaypoints(spin(state));
    case "setMultiplier":
      return withPaypoints({ ...state, multiplier: action.multiplier });
    case "upgrade":
      return withPaypoints(upgradeBuilding(state, action.buildingId));
    case "resolveAttack":
      return withPaypoints(resolveAttack(state, action.targetId));
    case "revealRaid":
      return withPaypoints(revealRaidTile(state, action.tileId));
    case "closeEncounter":
      return withPaypoints({ ...state, encounter: null });
    case "refillEnergy":
      return withPaypoints(addEvent({
        ...state,
        energy: state.energy + 50,
        metrics: {
          ...state.metrics,
          paypointSignals: state.metrics.paypointSignals + Math.max(1, state.activePaypoints.length),
        },
      }, "system", "Demo refill used: +50 energy. This marks the monetization window without real payment."));
    case "tick":
      return withPaypoints(tick(state));
    default:
      return state;
  }
}

function spin(state: GameState): GameState {
  if (state.encounter) {
    return addEvent(state, "risk", "Resolve the active bonus event before spinning again.");
  }

  if (state.energy < state.multiplier) {
    return addEvent(state, "risk", "Energy is blocking the core loop. This is a high-intent paypoint.");
  }

  const reward = pickReward(REWARD_TABLE);
  const factor = rewardFactor(state);
  let next: GameState = {
    ...state,
    energy: state.energy - state.multiplier,
    lastReward: reward,
    metrics: {
      ...state.metrics,
      spins: state.metrics.spins + 1,
      energySpent: state.metrics.energySpent + state.multiplier,
    },
  };

  if (reward === "smallCoins") {
    const coins = Math.round(randomInt(180, 310) * factor);
    next = earnCoins(next, coins, "Small coin hit keeps the strike rate high.");
  }

  if (reward === "bigCoins") {
    const coins = Math.round(randomInt(680, 980) * factor);
    next = earnCoins(next, coins, "Big coin result creates a visible reward peak.");
  }

  if (reward === "combo") {
    const coins = Math.round(randomInt(520, 760) * factor);
    next = earnCoins(next, coins, "Combo chains coins into event points for a stronger session beat.");
    next = { ...next, liveOps: { ...next.liveOps, tournamentScore: next.liveOps.tournamentScore + 90 * next.multiplier } };
  }

  if (reward === "shield") {
    if (next.shields >= 3) {
      next = earnCoins(next, Math.round(240 * factor), "Shield cap converted protection into coins.");
    } else {
      next = addEvent({ ...next, shields: next.shields + 1 }, "win", "Shield gained. Defense becomes part of the reward loop.");
    }
  }

  if (reward === "attack") {
    next = addEvent({
      ...next,
      encounter: { type: "attack", targetIds: sampleIds(next.opponents, 3), resolved: false },
    }, "social", "Attack triggered. The player gets agency, while damage stays capped.");
  }

  if (reward === "raid") {
    const targetId = sampleIds(next.opponents, 1)[0];
    next = addEvent({
      ...next,
      encounter: {
        type: "raid",
        targetId,
        picksLeft: 3,
        tiles: createRaidTiles(next.multiplier),
        resolved: false,
      },
    }, "social", "Raid triggered. Highest excitement event, with controlled steal limits.");
  }

  return maybeIncomingAttack(next);
}

function earnCoins(state: GameState, coins: number, text: string): GameState {
  return addEvent({
    ...state,
    coins: state.coins + coins,
    metrics: {
      ...state.metrics,
      coinsEarned: state.metrics.coinsEarned + coins,
    },
    liveOps: {
      ...state.liveOps,
      tournamentScore: state.liveOps.tournamentScore + Math.round(coins / 18),
    },
  }, "win", `${text} +${coins} coins.`);
}

function upgradeBuilding(state: GameState, buildingId: string): GameState {
  const target = state.buildings.find((building) => building.id === buildingId);
  if (!target) return state;
  const cost = buildingCost(target, state.island);
  if (cost <= 0) return addEvent(state, "system", `${target.name} is already complete.`);
  if (state.coins < cost) return addEvent(state, "risk", `${target.name} needs ${cost - state.coins} more coins.`);

  const buildings = state.buildings.map((building) =>
    building.id === buildingId
      ? { ...building, level: building.level + 1, damaged: false }
      : building,
  );

  let next = addEvent({
    ...state,
    coins: state.coins - cost,
    buildings,
    metrics: {
      ...state.metrics,
      coinsSpent: state.metrics.coinsSpent + cost,
    },
  }, "system", `${target.name} upgraded. Coins turn into durable progress.`);

  if (isIslandComplete(buildings)) {
    next = addEvent({
      ...next,
      island: next.island + 1,
      buildings: createBuildings(),
      energy: next.energy + 18,
      liveOps: {
        ...next.liveOps,
        rewardRushRemaining: Math.max(next.liveOps.rewardRushRemaining, 60),
      },
    }, "win", `Island ${state.island} completed. New reward tier unlocked, +18 energy.`);
  }

  return next;
}

function tick(state: GameState): GameState {
  const tournamentRemaining = Math.max(0, state.liveOps.tournamentRemaining - 1);
  const rewardRushRemaining = Math.max(0, state.liveOps.rewardRushRemaining - 1);
  const energy = state.energy < 50 && state.liveOps.tournamentRemaining % 18 === 0 ? state.energy + 1 : state.energy;
  const opponents = state.opponents.map((opponent) => ({
    ...opponent,
    score: opponent.score + randomInt(0, tournamentRemaining > 0 ? 12 : 2),
  }));

  let next: GameState = {
    ...state,
    energy,
    opponents,
    liveOps: {
      ...state.liveOps,
      tournamentRemaining,
      rewardRushRemaining,
    },
  };

  if (state.liveOps.tournamentRemaining === 1) {
    next = addEvent(next, "system", "Flash Tournament ended. Ranking pressure resets in the real product.");
  }

  return next;
}

function maybeIncomingAttack(state: GameState): GameState {
  if (state.metrics.spins < 3 || Math.random() > 0.16) return state;
  const attacker = state.opponents[randomInt(0, state.opponents.length - 1)];
  if (state.shields > 0) {
    return addEvent({
      ...state,
      shields: state.shields - 1,
      metrics: {
        ...state.metrics,
        shieldsUsed: state.metrics.shieldsUsed + 1,
      },
      revengeTargetId: attacker.id,
    }, "social", `${attacker.name} attacked, but a shield absorbed it. Revenge intent is now fresh.`);
  }

  const candidates = state.buildings.filter((building) => building.level > 0);
  if (candidates.length === 0) {
    return addEvent({ ...state, revengeTargetId: attacker.id }, "social", `${attacker.name} scouted your island. No progress was lost.`);
  }

  const damaged = candidates[randomInt(0, candidates.length - 1)];
  const buildings = state.buildings.map((building) =>
    building.id === damaged.id ? { ...building, damaged: true } : building,
  );
  return addEvent({ ...state, buildings, revengeTargetId: attacker.id }, "social", `${attacker.name} damaged your ${damaged.name}. Loss feels personal but stays bounded.`);
}

function withPaypoints(state: GameState): GameState {
  const activePaypoints: PaypointSignal[] = detectPaypoints(state);
  return { ...state, activePaypoints };
}

function addEvent(state: GameState, tone: "win" | "risk" | "social" | "system", text: string): GameState {
  return {
    ...state,
    eventSeq: state.eventSeq + 1,
    events: [{ id: state.eventSeq + 1, tone, text }, ...state.events].slice(0, 12),
  };
}

export function getRankedPlayers(state: GameState) {
  return [
    { id: "you", name: "You", score: state.liveOps.tournamentScore, current: true },
    ...state.opponents.map((opponent) => ({
      id: opponent.id,
      name: opponent.name,
      score: opponent.score,
      current: false,
    })),
  ].sort((a, b) => b.score - a.score);
}

export function getLoopStage(state: GameState): string {
  if (state.encounter?.type === "attack") return "MCA attack choice";
  if (state.encounter?.type === "raid") return "Raid reveal spike";
  if (state.activePaypoints.length > 0) return "Paypoint signal";
  if (progressPercent(state.buildings) > 70) return "Near island completion";
  return "Spin-build loop";
}
