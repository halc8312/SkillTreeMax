# 08. 実績システム

## 概要

プレイヤーの達成を記録し、報酬を与える実績（アチーブメント）システムを実装する。

## 目的

- 長期的なモチベーション維持
- 様々なプレイスタイルへの報酬
- 収集・コンプリート要素の追加

## 実績カテゴリ

| カテゴリ | 説明 | 例 |
|----------|------|-----|
| 戦闘 | 戦闘に関する実績 | 100体撃破 |
| スキル | スキルツリー関連 | 100スキル解放 |
| 成長 | レベル・ステータス | レベル10到達 |
| 探索 | クエスト・発見 | 全ボス撃破 |
| 収集 | アイテム・装備 | レア装備入手 |
| 経済 | ゴールド関連 | 10000G貯金 |

## データ構造

### 実績定義
```javascript
const achievement = {
  id: "ach_first_blood",
  name: "初陣",
  description: "はじめて敵を倒した",
  category: "battle",
  icon: "⚔️",
  
  // 解除条件
  condition: {
    type: "stat",
    stat: "enemiesDefeated",
    value: 1
  },
  
  // 報酬
  rewards: {
    gold: 50,
    skillPoints: 0,
    title: null
  },
  
  // 隠し実績
  hidden: false,
  
  // レアリティ
  rarity: "common"  // common | uncommon | rare | epic | legendary
};
```

### プレイヤー統計
```javascript
const playerStats = {
  // 戦闘
  enemiesDefeated: 0,
  bossesDefeated: 0,
  damageDealt: 0,
  damageTaken: 0,
  battleWins: 0,
  battleLosses: 0,
  criticalHits: 0,
  
  // スキル
  skillsUnlocked: 0,
  skillPointsSpent: 0,
  
  // 成長
  maxLevelReached: 1,
  totalExpGained: 0,
  
  // 経済
  totalGoldEarned: 0,
  totalGoldSpent: 0,
  itemsPurchased: 0,
  itemsSold: 0,
  
  // クエスト
  questsCompleted: 0,
  dailyQuestsCompleted: 0,
  
  // その他
  totalPlayTime: 0,
  sessionsPlayed: 0,
  itemsUsed: 0
};
```

## 実績データ一覧

### 戦闘カテゴリ

```javascript
const battleAchievements = [
  // 撃破数
  {
    id: "ach_first_blood",
    name: "初陣",
    description: "はじめて敵を倒した",
    category: "battle",
    icon: "⚔️",
    condition: { type: "stat", stat: "enemiesDefeated", value: 1 },
    rewards: { gold: 50 },
    rarity: "common"
  },
  {
    id: "ach_slayer_10",
    name: "駆け出しの戦士",
    description: "敵を10体倒した",
    category: "battle",
    icon: "⚔️",
    condition: { type: "stat", stat: "enemiesDefeated", value: 10 },
    rewards: { gold: 100 },
    rarity: "common"
  },
  {
    id: "ach_slayer_100",
    name: "百人斬り",
    description: "敵を100体倒した",
    category: "battle",
    icon: "⚔️",
    condition: { type: "stat", stat: "enemiesDefeated", value: 100 },
    rewards: { gold: 500, skillPoints: 2 },
    rarity: "uncommon"
  },
  {
    id: "ach_slayer_1000",
    name: "千人斬り",
    description: "敵を1000体倒した",
    category: "battle",
    icon: "⚔️",
    condition: { type: "stat", stat: "enemiesDefeated", value: 1000 },
    rewards: { gold: 2000, skillPoints: 5, title: "殺戮者" },
    rarity: "rare"
  },
  
  // ボス
  {
    id: "ach_boss_first",
    name: "ボスハンター",
    description: "はじめてボスを倒した",
    category: "battle",
    icon: "👹",
    condition: { type: "stat", stat: "bossesDefeated", value: 1 },
    rewards: { gold: 200, skillPoints: 1 },
    rarity: "uncommon"
  },
  {
    id: "ach_boss_all",
    name: "伝説の勇者",
    description: "全てのボスを倒した",
    category: "battle",
    icon: "👹",
    condition: { type: "custom", check: "allBossesDefeated" },
    rewards: { gold: 5000, skillPoints: 10, title: "伝説の勇者" },
    rarity: "legendary"
  },
  
  // クリティカル
  {
    id: "ach_crit_100",
    name: "急所の達人",
    description: "クリティカルを100回出した",
    category: "battle",
    icon: "💥",
    condition: { type: "stat", stat: "criticalHits", value: 100 },
    rewards: { gold: 300 },
    rarity: "uncommon"
  }
];
```

### スキルカテゴリ

```javascript
const skillAchievements = [
  {
    id: "ach_skill_first",
    name: "スキル習得",
    description: "はじめてスキルを解放した",
    category: "skill",
    icon: "✨",
    condition: { type: "stat", stat: "skillsUnlocked", value: 1 },
    rewards: { gold: 30 },
    rarity: "common"
  },
  {
    id: "ach_skill_50",
    name: "研鑽の道",
    description: "スキルを50個解放した",
    category: "skill",
    icon: "✨",
    condition: { type: "stat", stat: "skillsUnlocked", value: 50 },
    rewards: { gold: 500, skillPoints: 3 },
    rarity: "uncommon"
  },
  {
    id: "ach_skill_500",
    name: "スキルマスター",
    description: "スキルを500個解放した",
    category: "skill",
    icon: "✨",
    condition: { type: "stat", stat: "skillsUnlocked", value: 500 },
    rewards: { gold: 2000, skillPoints: 10 },
    rarity: "rare"
  },
  {
    id: "ach_skill_all",
    name: "全知全能",
    description: "全てのスキルを解放した",
    category: "skill",
    icon: "✨",
    condition: { type: "custom", check: "allSkillsUnlocked" },
    rewards: { gold: 10000, skillPoints: 50, title: "全知全能" },
    rarity: "legendary",
    hidden: true
  },
  
  // 系統別
  {
    id: "ach_branch_sword",
    name: "剣聖",
    description: "剣術系統を全て解放した",
    category: "skill",
    icon: "🗡️",
    condition: { type: "custom", check: "branchComplete", branch: "sword" },
    rewards: { gold: 1000, title: "剣聖" },
    rarity: "epic"
  },
  {
    id: "ach_branch_magic",
    name: "大魔導士",
    description: "元素魔法を全て解放した",
    category: "skill",
    icon: "🔮",
    condition: { type: "custom", check: "branchComplete", branch: "magic" },
    rewards: { gold: 1000, title: "大魔導士" },
    rarity: "epic"
  }
];
```

### 成長カテゴリ

```javascript
const growthAchievements = [
  {
    id: "ach_level_5",
    name: "冒険者への道",
    description: "レベル5に到達した",
    category: "growth",
    icon: "📈",
    condition: { type: "stat", stat: "maxLevelReached", value: 5 },
    rewards: { gold: 100 },
    rarity: "common"
  },
  {
    id: "ach_level_10",
    name: "一人前の冒険者",
    description: "レベル10に到達した",
    category: "growth",
    icon: "📈",
    condition: { type: "stat", stat: "maxLevelReached", value: 10 },
    rewards: { gold: 500, skillPoints: 2 },
    rarity: "uncommon"
  },
  {
    id: "ach_level_25",
    name: "ベテラン",
    description: "レベル25に到達した",
    category: "growth",
    icon: "📈",
    condition: { type: "stat", stat: "maxLevelReached", value: 25 },
    rewards: { gold: 2000, skillPoints: 5 },
    rarity: "rare"
  },
  {
    id: "ach_level_50",
    name: "英雄の境地",
    description: "レベル50に到達した",
    category: "growth",
    icon: "📈",
    condition: { type: "stat", stat: "maxLevelReached", value: 50 },
    rewards: { gold: 10000, skillPoints: 15, title: "英雄" },
    rarity: "epic"
  }
];
```

### 経済カテゴリ

```javascript
const economyAchievements = [
  {
    id: "ach_gold_1000",
    name: "貯金箱",
    description: "累計1000ゴールドを稼いだ",
    category: "economy",
    icon: "💰",
    condition: { type: "stat", stat: "totalGoldEarned", value: 1000 },
    rewards: { gold: 100 },
    rarity: "common"
  },
  {
    id: "ach_gold_10000",
    name: "財テク",
    description: "累計10000ゴールドを稼いだ",
    category: "economy",
    icon: "💰",
    condition: { type: "stat", stat: "totalGoldEarned", value: 10000 },
    rewards: { gold: 500 },
    rarity: "uncommon"
  },
  {
    id: "ach_gold_100000",
    name: "大富豪",
    description: "累計100000ゴールドを稼いだ",
    category: "economy",
    icon: "💰",
    condition: { type: "stat", stat: "totalGoldEarned", value: 100000 },
    rewards: { gold: 5000, title: "大富豪" },
    rarity: "rare"
  },
  {
    id: "ach_shopper",
    name: "お得意様",
    description: "アイテムを50個購入した",
    category: "economy",
    icon: "🛒",
    condition: { type: "stat", stat: "itemsPurchased", value: 50 },
    rewards: { gold: 300 },
    rarity: "uncommon"
  }
];
```

### 探索カテゴリ

```javascript
const explorationAchievements = [
  {
    id: "ach_quest_first",
    name: "冒険のはじまり",
    description: "はじめてクエストを完了した",
    category: "exploration",
    icon: "📜",
    condition: { type: "stat", stat: "questsCompleted", value: 1 },
    rewards: { gold: 50 },
    rarity: "common"
  },
  {
    id: "ach_quest_50",
    name: "依頼人の友",
    description: "クエストを50回完了した",
    category: "exploration",
    icon: "📜",
    condition: { type: "stat", stat: "questsCompleted", value: 50 },
    rewards: { gold: 1000, skillPoints: 3 },
    rarity: "uncommon"
  },
  {
    id: "ach_daily_30",
    name: "日課の達人",
    description: "デイリークエストを30回完了した",
    category: "exploration",
    icon: "📅",
    condition: { type: "stat", stat: "dailyQuestsCompleted", value: 30 },
    rewards: { gold: 500, skillPoints: 2 },
    rarity: "uncommon"
  }
];
```

## 実装タスク

### Task 8.1: 実績・統計モジュール
**ファイル**: `js/achievements.js`（新規作成）

```javascript
const allAchievements = [
  ...battleAchievements,
  ...skillAchievements,
  ...growthAchievements,
  ...economyAchievements,
  ...explorationAchievements
];

const playerStats = {
  enemiesDefeated: 0,
  bossesDefeated: 0,
  criticalHits: 0,
  skillsUnlocked: 0,
  maxLevelReached: 1,
  totalGoldEarned: 0,
  questsCompleted: 0,
  dailyQuestsCompleted: 0,
  itemsPurchased: 0
  // ...その他
};

const unlockedAchievements = [];

// 実績取得
function getAchievementById(id) {
  return allAchievements.find(a => a.id === id);
}

// カテゴリ別取得
function getAchievementsByCategory(category) {
  return allAchievements.filter(a => a.category === category);
}

// 解除済みか確認
function isAchievementUnlocked(id) {
  return unlockedAchievements.includes(id);
}
```

### Task 8.2: 統計更新

```javascript
function updateStat(stat, value = 1) {
  if (!(stat in playerStats)) {
    console.warn(`Unknown stat: ${stat}`);
    return;
  }
  
  playerStats[stat] += value;
  
  // 最大値を記録する統計
  if (stat === "maxLevelReached") {
    playerStats[stat] = Math.max(playerStats[stat], value);
  }
  
  // 実績チェック
  checkAchievements();
  
  saveOnAction();
}

// 各イベントで統計を更新
function onEnemyDefeated(enemy) {
  updateStat("enemiesDefeated");
  
  if (enemy.category === "boss") {
    updateStat("bossesDefeated");
  }
}

function onSkillUnlocked() {
  updateStat("skillsUnlocked");
}

function onLevelUp(newLevel) {
  updateStat("maxLevelReached", newLevel);
}

function onGoldEarned(amount) {
  updateStat("totalGoldEarned", amount);
}

function onQuestCompleted(quest) {
  updateStat("questsCompleted");
  
  if (quest.type === "daily") {
    updateStat("dailyQuestsCompleted");
  }
}
```

### Task 8.3: 実績チェック・解除

```javascript
function checkAchievements() {
  allAchievements.forEach(achievement => {
    if (isAchievementUnlocked(achievement.id)) {
      return;
    }
    
    if (checkAchievementCondition(achievement)) {
      unlockAchievement(achievement);
    }
  });
}

function checkAchievementCondition(achievement) {
  const condition = achievement.condition;
  
  switch (condition.type) {
    case "stat":
      return playerStats[condition.stat] >= condition.value;
      
    case "custom":
      return checkCustomCondition(condition);
      
    default:
      return false;
  }
}

function checkCustomCondition(condition) {
  switch (condition.check) {
    case "allBossesDefeated":
      const bossIds = bosses.map(b => b.id);
      return bossIds.every(id => defeatedBosses.includes(id));
      
    case "allSkillsUnlocked":
      return skillTree.every(s => s.unlocked);
      
    case "branchComplete":
      return skillTree
        .filter(s => s.branch === condition.branch)
        .every(s => s.unlocked);
      
    default:
      return false;
  }
}

function unlockAchievement(achievement) {
  unlockedAchievements.push(achievement.id);
  
  // 報酬付与
  grantAchievementRewards(achievement);
  
  // 通知表示
  showAchievementNotification(achievement);
  
  logMessage(`🏆 実績解除: ${achievement.name}`);
  
  saveOnAction();
}

function grantAchievementRewards(achievement) {
  const rewards = achievement.rewards;
  
  if (rewards.gold) {
    player.gold += rewards.gold;
  }
  
  if (rewards.skillPoints) {
    player.skillPoints += rewards.skillPoints;
  }
  
  if (rewards.title) {
    player.title = rewards.title;
  }
  
  updateStatus();
  updateHeader();
}
```

### Task 8.4: 実績通知

```javascript
function showAchievementNotification(achievement) {
  const notification = document.createElement("div");
  notification.className = `achievement-notification ${achievement.rarity}`;
  
  notification.innerHTML = `
    <div class="achievement-icon">${achievement.icon}</div>
    <div class="achievement-info">
      <span class="achievement-label">実績解除</span>
      <strong class="achievement-name">${achievement.name}</strong>
      <p class="achievement-desc">${achievement.description}</p>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // アニメーション
  setTimeout(() => notification.classList.add("show"), 100);
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 500);
  }, 4000);
}
```

### Task 8.5: 実績UI

```html
<!-- index.html に追加 -->
<section class="panel">
  <h2>🏆 実績</h2>
  <div class="achievement-summary">
    <span id="achievement-count">0 / 0</span>
    <span>解除済み</span>
  </div>
  <button id="open-achievements" class="ghost">実績一覧を見る</button>
</section>

<!-- 実績モーダル -->
<div id="achievement-modal" class="modal hidden">
  <div class="modal-content large">
    <div class="modal-header">
      <h2>🏆 実績</h2>
      <button id="close-achievements" class="ghost">✕</button>
    </div>
    
    <div class="achievement-tabs">
      <button class="tab active" data-category="all">すべて</button>
      <button class="tab" data-category="battle">戦闘</button>
      <button class="tab" data-category="skill">スキル</button>
      <button class="tab" data-category="growth">成長</button>
      <button class="tab" data-category="economy">経済</button>
      <button class="tab" data-category="exploration">探索</button>
    </div>
    
    <div id="achievement-list" class="achievement-list"></div>
  </div>
</div>
```

### Task 8.6: 実績一覧UI

```javascript
let currentAchievementCategory = "all";

function openAchievementModal() {
  document.getElementById("achievement-modal").classList.remove("hidden");
  renderAchievementList();
}

function closeAchievementModal() {
  document.getElementById("achievement-modal").classList.add("hidden");
}

function renderAchievementList() {
  const container = document.getElementById("achievement-list");
  container.innerHTML = "";
  
  let achievements = currentAchievementCategory === "all"
    ? allAchievements
    : getAchievementsByCategory(currentAchievementCategory);
  
  // 解除済みを上に、未解除の隠し実績は非表示
  achievements = achievements
    .filter(a => !a.hidden || isAchievementUnlocked(a.id))
    .sort((a, b) => {
      const aUnlocked = isAchievementUnlocked(a.id);
      const bUnlocked = isAchievementUnlocked(b.id);
      if (aUnlocked && !bUnlocked) return -1;
      if (!aUnlocked && bUnlocked) return 1;
      return 0;
    });
  
  achievements.forEach(achievement => {
    const unlocked = isAchievementUnlocked(achievement.id);
    const card = createAchievementCard(achievement, unlocked);
    container.appendChild(card);
  });
  
  // サマリー更新
  const total = allAchievements.filter(a => !a.hidden || isAchievementUnlocked(a.id)).length;
  document.getElementById("achievement-count").textContent = 
    `${unlockedAchievements.length} / ${total}`;
}

function createAchievementCard(achievement, unlocked) {
  const card = document.createElement("div");
  card.className = `achievement-card ${achievement.rarity} ${unlocked ? "unlocked" : "locked"}`;
  
  // 進捗計算
  let progress = "";
  if (!unlocked && achievement.condition.type === "stat") {
    const current = playerStats[achievement.condition.stat] || 0;
    const target = achievement.condition.value;
    const percent = Math.min(100, Math.floor((current / target) * 100));
    progress = `
      <div class="achievement-progress">
        <div class="progress-bar" style="width: ${percent}%"></div>
        <span>${current} / ${target}</span>
      </div>
    `;
  }
  
  card.innerHTML = `
    <div class="achievement-icon">${unlocked ? achievement.icon : "🔒"}</div>
    <div class="achievement-content">
      <h4>${achievement.name}</h4>
      <p>${achievement.description}</p>
      ${progress}
      <div class="achievement-rewards">
        ${achievement.rewards.gold ? `<span>💰 ${achievement.rewards.gold}</span>` : ""}
        ${achievement.rewards.skillPoints ? `<span>⭐ ${achievement.rewards.skillPoints}SP</span>` : ""}
        ${achievement.rewards.title ? `<span>🎖️ ${achievement.rewards.title}</span>` : ""}
      </div>
    </div>
  `;
  
  return card;
}

// イベントリスナー
document.getElementById("open-achievements").addEventListener("click", openAchievementModal);
document.getElementById("close-achievements").addEventListener("click", closeAchievementModal);

document.querySelectorAll(".achievement-tabs .tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelector(".achievement-tabs .tab.active").classList.remove("active");
    tab.classList.add("active");
    currentAchievementCategory = tab.dataset.category;
    renderAchievementList();
  });
});
```

## 追加CSS

```css
/* 実績通知 */
.achievement-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #121826;
  border: 2px solid #22c55e;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  z-index: 2000;
  transform: translateX(120%);
  transition: transform 0.3s ease;
  max-width: 320px;
}

.achievement-notification.show {
  transform: translateX(0);
}

.achievement-notification.rare {
  border-color: #3b82f6;
}

.achievement-notification.epic {
  border-color: #a855f7;
}

.achievement-notification.legendary {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #121826, #2d2410);
}

.achievement-icon {
  font-size: 32px;
}

.achievement-label {
  font-size: 11px;
  color: #22c55e;
  text-transform: uppercase;
}

.achievement-name {
  display: block;
  font-size: 16px;
}

.achievement-desc {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

/* 実績一覧 */
.achievement-summary {
  text-align: center;
  margin-bottom: 12px;
}

.achievement-summary span:first-child {
  font-size: 24px;
  font-weight: bold;
  display: block;
}

.achievement-list {
  display: grid;
  gap: 12px;
  max-height: 60vh;
  overflow-y: auto;
}

.achievement-card {
  display: flex;
  gap: 12px;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 12px;
}

.achievement-card.locked {
  opacity: 0.6;
}

.achievement-card.locked .achievement-icon {
  filter: grayscale(100%);
}

.achievement-card.rare {
  border-left: 3px solid #3b82f6;
}

.achievement-card.epic {
  border-left: 3px solid #a855f7;
}

.achievement-card.legendary {
  border-left: 3px solid #f59e0b;
  background: linear-gradient(135deg, #0f172a, #1d1710);
}

.achievement-content h4 {
  margin: 0 0 4px 0;
}

.achievement-content p {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #94a3b8;
}

.achievement-progress {
  position: relative;
  height: 20px;
  background: #1e293b;
  border-radius: 4px;
  margin-bottom: 8px;
  overflow: hidden;
}

.achievement-progress .progress-bar {
  height: 100%;
  background: #4f46e5;
}

.achievement-progress span {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.achievement-rewards {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #64748b;
}
```

## テスト項目

- [ ] 統計が正しく記録される
- [ ] 条件達成で実績が解除される
- [ ] 報酬が正しく付与される
- [ ] 通知が表示される
- [ ] 一覧で進捗が確認できる
- [ ] 隠し実績が正しく動作する
- [ ] セーブ/ロードで状態が保持される

## 完了条件

1. 各カテゴリに5つ以上の実績がある
2. 統計トラッキングが正確
3. 解除通知が表示される
4. 進捗が確認できる
