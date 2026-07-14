# Slots 求职 Demo 实施计划

## 1. 工作原则

先做可玩的核心循环，再做表现和讲解层。

实现优先级：

1. 循环正确。
2. 状态可解释。
3. UI 清晰。
4. 动效适度。
5. 代码便于讲解。

不追求完整商业游戏的内容量，而追求一个面试官能快速理解、能运行、能追问技术细节的 demo。

## 2. 阶段拆分

### Phase 0：项目初始化

目标：建立可运行项目。

任务：

- 检查当前工作区。
- 初始化 Web 项目。
- 配置 TypeScript。
- 建立基础目录结构。
- 建立基础样式变量。

交付：

- 本地开发服务器可启动。
- 页面显示基础应用框架。

验证：

- `npm run dev` 可启动。
- `npm run build` 可通过。

### Phase 1：核心状态与随机奖励

目标：完成最小可玩 Spin 循环。

任务：

- 定义 `GameState`。
- 实现能量、金币、倍率、护盾状态。
- 实现奖励表。
- 实现 `spin()`。
- 实现结果事件流。
- 实现基础指标统计。

交付：

- 点击 Spin 会消耗能量。
- 随机产出 coins、attack、raid、shield、combo。
- UI 能显示资源和事件。

验证：

- 能量不会变成负数。
- 护盾不会超过上限。
- 指标能正确累计。

### Phase 2：建造与关卡进度

目标：完成金币 sink 和长期目标。

任务：

- 定义 5 个建筑。
- 定义建筑等级和成本公式。
- 实现升级逻辑。
- 实现关卡完成检测。
- 实现进入下一关后的成本和奖励提升。

交付：

- 玩家可以把金币投入建筑。
- 完成 5 个建筑后进入下一关。
- 进度条和建筑状态清晰可见。

验证：

- 金币不足时不能升级。
- 建筑等级不能超过上限。
- 关卡完成后状态重置合理。

### Phase 3：Attack / Raid / Shield

目标：加入 T3-MCA 的社交冲突层。

任务：

- 创建模拟对手数据。
- 实现 Attack 选择界面。
- 实现攻击命中、护盾抵挡、安慰奖。
- 实现 Raid 揭示小游戏。
- 实现被攻击 / 被掠夺模拟事件。
- 实现 Revenge 状态。

交付：

- Attack 和 Raid 不再只是文本结果，而是有轻量交互。
- 事件流能显示社交冲突。
- Revenge 可以触发付费窗口标注。

验证：

- 攻击不会让目标进度无限下降。
- 掠夺不会造成过大损失。
- 失败仍有奖励。

### Phase 4：LiveOps 与付费窗口识别

目标：让 demo 展示商业化设计理解。

任务：

- 实现 Flash Tournament。
- 实现模拟排行榜。
- 实现 Reward Rush。
- 实现 paypoint detector。
- 识别 Near Goal、Event Rush、Revenge、Out of Energy。
- 在 UI 中解释当前窗口。

交付：

- 活动倒计时可见。
- 排行榜会变化。
- 付费窗口出现时有明确标注。
- 指标记录触发次数。

验证：

- 活动结束后能结算。
- 能量不足时按钮状态正确。
- 付费窗口不会一直误报。

### Phase 5：作品集级 UI 打磨

目标：把可玩系统包装成求职可展示作品。

任务：

- 优化布局。
- 增强主按钮反馈。
- 增加奖励结果动效。
- 优化建筑和事件流表现。
- 增加设计观察面板。
- 确保桌面和移动端不重叠、不溢出。

交付：

- 首屏就是可玩 demo。
- 面试官不需要读说明即可操作。
- 设计标注能帮助理解系统。

验证：

- 桌面视口检查。
- 移动视口检查。
- 文本不溢出。
- 关键状态都可见。

### Phase 6：工程整理与面试讲解材料

目标：让项目便于提交和讲解。

任务：

- 整理 README。
- 添加系统架构图。
- 添加核心参数表。
- 添加可调设计说明。
- 清理未使用代码。
- 运行最终构建。

交付：

- README 说明项目目的、运行方式、系统拆解。
- 代码目录清晰。
- 最终 build 通过。

验证：

- 新环境按 README 可运行。
- `npm run build` 通过。
- 没有明显控制台错误。

## 3. 建议文件结构

```text
F:\p\demo slots\
  docs\
    slots-demo-requirements.md
    slots-demo-implementation-plan.md
  package.json
  index.html
  src\
    App.tsx
    main.tsx
    styles.css
    data\
      buildings.ts
      liveops.ts
      opponents.ts
      rewards.ts
    simulation\
      attacks.ts
      economy.ts
      paypoints.ts
      progression.ts
      raids.ts
      rng.ts
      state.ts
    ui\
      components\
        ResourceBar.tsx
        SpinButton.tsx
        BuildingBoard.tsx
        EventLog.tsx
        MetricsPanel.tsx
      panels\
        AttackPanel.tsx
        RaidPanel.tsx
        LiveOpsPanel.tsx
        DesignNotesPanel.tsx
```

## 4. 核心数据模型草案

```ts
type RewardType =
  | "smallCoins"
  | "bigCoins"
  | "attack"
  | "raid"
  | "shield"
  | "combo";

type PaypointType =
  | "nearGoal"
  | "eventRush"
  | "revenge"
  | "outOfEnergy";

interface GameState {
  energy: number;
  coins: number;
  shields: number;
  multiplier: 1 | 2 | 5 | 10;
  island: number;
  buildings: BuildingState[];
  opponents: OpponentState[];
  liveOps: LiveOpsState;
  metrics: SessionMetrics;
  events: GameEvent[];
  activePaypoints: PaypointSignal[];
}
```

## 5. 关键算法计划

### 5.1 奖励抽取

使用加权随机：

```text
roll = random(0, totalWeight)
按权重区间返回 RewardType
```

后续可加入调参：

- 低能量时提高 shield 或 smallCoins。
- 活动中提高 raid 价值。
- 新手前 10 次 spin 提高 bigCoins。

### 5.2 建筑成本

```text
cost = round(baseCost * buildingWeight * levelFactor * islandFactor)
```

目标：

- 前 2 分钟内能完成 1 个建筑。
- 3-5 分钟内有机会完成 1 个岛屿。
- 始终制造“差一点够”的状态。

### 5.3 付费窗口检测

每次状态变化后执行：

```text
detectPaypoints(state):
  if energy < multiplier:
    outOfEnergy
  if nearestUpgradeCost - coins <= nearestUpgradeCost * 0.2 and energy < 10:
    nearGoal
  if liveOps.rewardRushActive and energy < 12:
    eventRush
  if revengeTarget exists and energy < multiplier:
    revenge
```

检测结果只做标注和模拟补充，不接真实支付。

## 6. UI 组件计划

### ResourceBar

显示：

- Coins
- Energy
- Shields
- Multiplier
- Island

### SpinButton

职责：

- 触发 Spin。
- 显示能量不足状态。
- 显示最近一次奖励。

### BuildingBoard

职责：

- 显示 5 个建筑。
- 显示等级、升级成本、可升级状态。
- 处理升级点击。

### AttackPanel

职责：

- 在 Attack 结果触发后出现。
- 展示可选目标。
- 展示命中 / 护盾 / 暴击结果。

### RaidPanel

职责：

- 在 Raid 结果触发后出现。
- 展示可揭示格子。
- 汇总掠夺收益。

### LiveOpsPanel

职责：

- 显示活动倒计时。
- 显示排行榜。
- 显示 Reward Rush 状态。

### DesignNotesPanel

职责：

- 显示当前循环阶段。
- 显示触发的付费窗口。
- 用短句解释设计意图。

## 7. 风险与处理

| 风险 | 处理 |
| --- | --- |
| 看起来像真钱赌博 | 使用作品集/系统设计风格，避免真钱价格和赌场写实 |
| 系统过复杂导致做不完 | 先实现 Spin + Build + Paypoint，再扩展 Attack/Raid |
| UI 信息太多 | 首屏只保留主循环，设计解释放右侧 |
| 随机结果难调 | 奖励表集中在 `rewards.ts` |
| 面试讲不清 | README 和 DesignNotesPanel 同步解释系统 |

## 8. Coding 开始前检查清单

- [ ] 用户确认需求方向。
- [ ] 确认使用 Vite + React + TypeScript，或选择无依赖单页方案。
- [ ] 确认 demo 名称。
- [ ] 确认视觉方向：作品集系统面板风，非赌场风。
- [ ] 确认是否需要中英双语 UI。

## 9. 推荐下一步

下一步进入 Phase 0 和 Phase 1：

1. 初始化项目。
2. 创建 TypeScript 状态模型。
3. 实现 Spin、资源、奖励表、事件流。
4. 跑通第一个可玩循环。

