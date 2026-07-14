import { nearestUpgrade } from "./economy";
import type { GameState, PaypointSignal } from "./types";

export function detectPaypoints(state: GameState): PaypointSignal[] {
  const signals: PaypointSignal[] = [];
  const nearest = nearestUpgrade(state);

  if (state.energy < state.multiplier) {
    signals.push({
      type: "outOfEnergy",
      title: "Out of Energy",
      reason: "The player has intent, but the core loop is blocked.",
    });
  }

  if (nearest && state.coins < nearest.cost && nearest.cost - state.coins <= nearest.cost * 0.2 && state.energy < 10) {
    signals.push({
      type: "nearGoal",
      title: "Near Goal",
      reason: `${nearest.building.name} is close, but energy is low.`,
    });
  }

  if (state.liveOps.rewardRushRemaining > 0 && state.energy < 12) {
    signals.push({
      type: "eventRush",
      title: "Event Rush",
      reason: "A timed value boost is active while the player is running out of spins.",
    });
  }

  if (state.revengeTargetId && state.energy < state.multiplier) {
    const target = state.opponents.find((opponent) => opponent.id === state.revengeTargetId);
    signals.push({
      type: "revenge",
      title: "Revenge",
      reason: `${target?.name ?? "A rival"} just attacked. The social motivation is fresh.`,
    });
  }

  return signals;
}
