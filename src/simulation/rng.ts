import type { RewardDefinition } from "./types";

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickWeighted<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

export function pickReward(table: RewardDefinition[]) {
  return pickWeighted(table).type;
}

export function sampleIds<T extends { id: string }>(items: T[], count: number): string[] {
  return [...items]
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map((item) => item.id);
}
