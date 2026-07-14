# Demo Slots

Demo Slots is a portfolio prototype for breaking down T3-MCA style slots games: a one-button reward loop, light city progression, asynchronous attack and raid beats, LiveOps pressure, and simulated paypoint signals.

The project does not include real-money payment, real gambling, accounts, or backend services. Paypoint windows are shown as design-analysis signals only.

## Run

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173/
```

## Build

```bash
npm run build
```

## What The Demo Shows

- Spin loop: energy spend, high-frequency rewards, multiplier pacing.
- Economy loop: coins convert into five building upgrades and island completion.
- T3-MCA layer: attack choices and raid reveals add agency and social emotion.
- LiveOps layer: flash tournament, ranking pressure, and Reward Rush timer.
- Paypoint readout: Out of Energy, Near Goal, Event Rush, and Revenge signals.
- Telemetry: spins, coins earned/spent, energy spent, attacks, raids, shields used, progress, and paypoint signals.

## Key Files

```text
src/simulation/state.ts       Main reducer and loop orchestration
src/simulation/economy.ts     Reward and building cost formulas
src/simulation/paypoints.ts   Paypoint detector
src/simulation/attacks.ts     Attack resolution
src/simulation/raids.ts       Raid reveal logic
src/App.tsx                   UI composition
src/styles.css                Responsive portfolio UI
docs/                         Product requirements and implementation plan
```

## Interview Talk Track

1. Spin a few times to show the high strike-rate core loop.
2. Upgrade buildings to show how coins become durable progress.
3. Trigger Attack or Raid to show the social conflict layer.
4. Let energy drop or use a high multiplier to expose paypoint signals.
5. Point to `src/simulation` to explain how parameters drive the player journey.
