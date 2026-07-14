import { BASE_BUILDING_COST, MAX_BUILDING_LEVEL } from "../data/buildings";
import type { BuildingState, GameState } from "./types";

export function islandFactor(island: number): number {
  return 1 + (island - 1) * 0.28;
}

export function rewardFactor(state: GameState): number {
  const rush = state.liveOps.rewardRushRemaining > 0 ? 1.5 : 1;
  return state.multiplier * islandFactor(state.island) * rush;
}

export function buildingCost(building: BuildingState, island: number): number {
  if (building.level >= MAX_BUILDING_LEVEL) return 0;
  const levelFactor = 1 + building.level * 0.7;
  return Math.round(BASE_BUILDING_COST * building.weight * levelFactor * islandFactor(island));
}

export function nearestUpgrade(state: GameState) {
  const candidates = state.buildings
    .filter((building) => building.level < MAX_BUILDING_LEVEL)
    .map((building) => ({ building, cost: buildingCost(building, state.island) }))
    .sort((a, b) => a.cost - b.cost);
  return candidates[0] ?? null;
}

export function progressPercent(buildings: BuildingState[]): number {
  const totalLevels = buildings.length * MAX_BUILDING_LEVEL;
  const currentLevels = buildings.reduce((sum, building) => sum + building.level, 0);
  return Math.round((currentLevels / totalLevels) * 100);
}
