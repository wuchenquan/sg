import type { GameState, RaidTile } from "./types";
import { randomInt } from "./rng";

export function createRaidTiles(multiplier: number): RaidTile[] {
  const values = [
    { label: "Cache", value: 420 },
    { label: "Vault", value: 920 },
    { label: "Empty", value: 80 },
    { label: "Bonus", value: 1280 },
    { label: "Chest", value: 640 },
    { label: "Trap", value: 120 },
  ].sort(() => Math.random() - 0.5);

  return values.map((tile, index) => ({
    id: `tile-${index}`,
    label: tile.label,
    value: tile.value * multiplier,
    revealed: false,
  }));
}

export function revealRaidTile(state: GameState, tileId: string): GameState {
  if (!state.encounter || state.encounter.type !== "raid" || state.encounter.resolved) return state;
  const encounter = state.encounter;
  const tile = encounter.tiles.find((item) => item.id === tileId);
  if (!tile || tile.revealed) return state;

  const tiles = encounter.tiles.map((item) => (item.id === tileId ? { ...item, revealed: true } : item));
  const picksLeft = encounter.picksLeft - 1;
  const target = state.opponents.find((opponent) => opponent.id === encounter.targetId);
  const gain = Math.round(tile.value);
  const finalPick = picksLeft <= 0;
  const stealCap = target ? Math.round(target.coins * 0.08) : 0;
  const visibleSteal = Math.min(gain, stealCap || gain);

  const opponents = state.opponents.map((opponent) => {
    if (opponent.id !== encounter.targetId || !finalPick) return opponent;
    return { ...opponent, coins: Math.max(1200, opponent.coins - visibleSteal) };
  });

  return {
    ...state,
    coins: state.coins + gain,
    opponents,
    encounter: { ...encounter, tiles, picksLeft, resolved: finalPick },
    metrics: {
      ...state.metrics,
      raids: finalPick ? state.metrics.raids + 1 : state.metrics.raids,
      coinsEarned: state.metrics.coinsEarned + gain,
    },
    liveOps: {
      ...state.liveOps,
      tournamentScore: state.liveOps.tournamentScore + randomInt(45, 110),
    },
    events: [
      {
        id: state.eventSeq + 1,
        tone: "social" as const,
        text: `${tile.label} revealed in ${target?.name ?? "rival"}'s raid. +${gain} coins.`,
      },
      ...state.events,
    ].slice(0, 12),
    eventSeq: state.eventSeq + 1,
  };
}
