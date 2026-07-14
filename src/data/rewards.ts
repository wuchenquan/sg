import type { RewardDefinition } from "../simulation/types";

export const REWARD_TABLE: RewardDefinition[] = [
  { type: "smallCoins", label: "Small Coins", weight: 38 },
  { type: "bigCoins", label: "Big Coins", weight: 14 },
  { type: "attack", label: "Attack", weight: 18 },
  { type: "raid", label: "Raid", weight: 12 },
  { type: "shield", label: "Shield", weight: 10 },
  { type: "combo", label: "Combo", weight: 8 },
];
