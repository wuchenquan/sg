import type { GameState } from "./types";
import { randomInt } from "./rng";

export function resolveAttack(state: GameState, targetId: string): GameState {
  const target = state.opponents.find((opponent) => opponent.id === targetId);
  if (!target) return state;

  const blocked = target.shields > 0 && Math.random() < 0.48;
  const critical = !blocked && Math.random() < 0.22;
  const payout = blocked ? 260 * state.multiplier : (critical ? 980 : 620) * state.multiplier;
  const score = blocked ? 25 : critical ? 120 : 75;

  const opponents = state.opponents.map((opponent) => {
    if (opponent.id !== targetId) return opponent;
    return {
      ...opponent,
      shields: blocked ? Math.max(0, opponent.shields - 1) : opponent.shields,
      progress: blocked ? opponent.progress : Math.max(8, opponent.progress - randomInt(6, critical ? 18 : 12)),
    };
  });

  const text = blocked
    ? `${target.name}'s shield blocked the hit. Consolation coins kept the loop positive.`
    : critical
      ? `Critical attack on ${target.name}. Big emotion spike, controlled damage.`
      : `Attack landed on ${target.name}. Progress loss is capped.`;

  return {
    ...state,
    eventSeq: state.eventSeq + 1,
    coins: state.coins + payout,
    opponents,
    encounter: null,
    metrics: {
      ...state.metrics,
      attacks: state.metrics.attacks + 1,
      coinsEarned: state.metrics.coinsEarned + payout,
    },
    liveOps: {
      ...state.liveOps,
      tournamentScore: state.liveOps.tournamentScore + score,
    },
    events: addEvent(state, "social", `${text} +${Math.round(payout)} coins.`),
  };
}

function addEvent(state: GameState, tone: "win" | "risk" | "social" | "system", text: string) {
  return [{ id: state.eventSeq + 1, tone, text }, ...state.events].slice(0, 12);
}
