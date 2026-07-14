import { BUILDING_DEFINITIONS, MAX_BUILDING_LEVEL } from "../data/buildings";
import type { BuildingState } from "./types";

export function createBuildings(): BuildingState[] {
  return BUILDING_DEFINITIONS.map((building) => ({
    ...building,
    level: 0,
    damaged: false,
  }));
}

export function isIslandComplete(buildings: BuildingState[]): boolean {
  return buildings.every((building) => building.level >= MAX_BUILDING_LEVEL);
}
