import type { BuildingDefinition } from "../simulation/types";

export const BUILDING_DEFINITIONS: BuildingDefinition[] = [
  { id: "gate", name: "Gate", weight: 0.92, icon: "G" },
  { id: "market", name: "Market", weight: 1.08, icon: "M" },
  { id: "workshop", name: "Workshop", weight: 1.16, icon: "W" },
  { id: "tower", name: "Tower", weight: 1.28, icon: "T" },
  { id: "shrine", name: "Shrine", weight: 1.44, icon: "S" },
];

export const MAX_BUILDING_LEVEL = 3;
export const BASE_BUILDING_COST = 720;
