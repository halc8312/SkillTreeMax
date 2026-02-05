# 07. クエストシステム拡張

## 概要

多様なクエストタイプと報酬を追加し、ゲームの進行に目標を与える。

## 目的

- 単調なゲームプレイを解消
- 明確な目標と達成感
- ストーリー的な進行要素

## クエストの種類

| タイプ | 説明 | 報酬 |
|--------|------|------|
| 通常クエスト | ランダム敵と戦闘 | 経験値、ゴールド |
| 討伐クエスト | 特定の敵を倒す | 高報酬、レアアイテム |
| ボスクエスト | ボス戦 | 大量報酬、称号 |
| 採集クエスト | アイテム収集 | 素材、ゴールド |
| デイリークエスト | 日替わり目標 | ボーナス報酬 |

## データ構造

### クエスト定義
```javascript
const quest = {
  id: "quest_goblin_hunt",
  name: "ゴブリン討伐",
  description: "村を襲うゴブリンを5体倒せ。",
  type: "subjugation",     // battle | subjugation | boss | gather | daily
  
  // 条件
  requirements: {
    level: 3,              // 必要レベル
    prerequisite: null     // 前提クエストID
  },
  
  // 目標
  objectives: [
    {
      type: "defeat",
      target: "goblin_01",
      count: 5,
      current: 0           // 進捗
    }
  ],
  
  // 報酬
  rewards: {
    exp: 100,
    gold: 150,
    items: [
      { itemId: "potion_hp_small", quantity: 3 }
    ],
    skillPoints: 0
  },
  
  // 状態
  status: "available",     // locked | available | active | completed
  
  // 繰り返し
  repeatable: false,
  cooldown: 0              // 再挑戦までの時間（秒）
};
```

### プレイヤークエスト進捗
```javascript
const questProgress = {
  activeQuests: [],        // 受注中クエストID
  completedQuests: [],     // 完了済みクエストID
  dailyReset: null,        // デイリーリセット時刻
  
  // 目標進捗
  objectives: {
    "quest_goblin_hunt": {
      "goblin_01": 3       // 3体討伐済み
    }
  }
};
```

## クエストデータ一覧

### メインクエスト（ストーリー進行）

```javascript
const mainQuests = [
  {
    id: "main_01_first_battle",
    name: "はじめての戦い",
    description: "街道に出没するスライムを倒し、戦闘の基本を学べ。",
    type: "battle",
    requirements: { level: 1 },
    objectives: [
      { type: "defeat", target: "slime_01", count: 1 }
    ],
    rewards: {
      exp: 50,
      gold: 30,
      items: [{ itemId: "potion_hp_small", quantity: 2 }]
    },
    status: "available"
  },
  {
    id: "main_02_goblin_threat",
    name: "ゴブリンの脅威",
    description: "村人を襲うゴブリンを討伐せよ。",
    type: "subjugation",
    requirements: { level: 2, prerequisite: "main_01_first_battle" },
    objectives: [
      { type: "defeat", target: "goblin_01", count: 5 }
    ],
    rewards: {
      exp: 150,
      gold: 100,
      items: [{ itemId: "sword_iron", quantity: 1 }]
    }
  },
  {
    id: "main_03_goblin_king",
    name: "ゴブリンの王",
    description: "ゴブリンキングを倒し、村に平和を取り戻せ。",
    type: "boss",
    requirements: { level: 5, prerequisite: "main_02_goblin_threat" },
    objectives: [
      { type: "defeat_boss", target: "boss_goblin_king", count: 1 }
    ],
    rewards: {
      exp: 500,
      gold: 500,
      skillPoints: 3,
      title: "ゴブリンスレイヤー"
    }
  },
  {
    id: "main_04_dragon_rumor",
    name: "竜の噂",
    description: "山に住む古代竜の調査を開始せよ。",
    type: "battle",
    requirements: { level: 8, prerequisite: "main_03_goblin_king" },
    objectives: [
      { type: "defeat", target: "wyvern_01", count: 3 }
    ],
    rewards: {
      exp: 400,
      gold: 350
    }
  },
  {
    id: "main_05_dragon_fight",
    name: "古代竜との決戦",
    description: "伝説の古代竜ヴォルガノスに挑め。",
    type: "boss",
    requirements: { level: 10, prerequisite: "main_04_dragon_rumor" },
    objectives: [
      { type: "defeat_boss", target: "boss_dragon", count: 1 }
    ],
    rewards: {
      exp: 1500,
      gold: 2000,
      skillPoints: 5,
      items: [{ itemId: "sword_dragon", quantity: 1 }],
      title: "竜殺しの英雄"
    }
  }
];
```

### サブクエスト

```javascript
const sideQuests = [
  {
    id: "side_wolf_pelts",
    name: "狼の毛皮集め",
    description: "商人のために狼の毛皮を集めろ。",
    type: "subjugation",
    requirements: { level: 3 },
    objectives: [
      { type: "defeat", target: "wolf_01", count: 10 }
    ],
    rewards: {
      exp: 100,
      gold: 200
    },
    repeatable: true,
    cooldown: 3600  // 1時間
  },
  {
    id: "side_skeleton_purge",
    name: "骸骨の浄化",
    description: "墓地に蔓延るスケルトンを排除せよ。",
    type: "subjugation",
    requirements: { level: 7 },
    objectives: [
      { type: "defeat", target: "skeleton_01", count: 15 }
    ],
    rewards: {
      exp: 200,
      gold: 250,
      items: [{ itemId: "ring_guard", quantity: 1 }]
    }
  },
  {
    id: "side_elite_hunter",
    name: "強敵ハンター",
    description: "強力なモンスターを討伐せよ。",
    type: "subjugation",
    requirements: { level: 10 },
    objectives: [
      { type: "defeat_elite", count: 5 }
    ],
    rewards: {
      exp: 500,
      gold: 400,
      skillPoints: 2
    },
    repeatable: true,
    cooldown: 7200
  }
];
```

### デイリークエスト

```javascript
const dailyQuests = [
  {
    id: "daily_battle_10",
    name: "日課：戦闘訓練",
    description: "任意のモンスターを10体倒せ。",
    type: "daily",
    objectives: [
      { type: "defeat_any", count: 10 }
    ],
    rewards: {
      exp: 100,
      gold: 100
    }
  },
  {
    id: "daily_skill_unlock",
    name: "日課：スキル習得",
    description: "スキルを1つ解放せよ。",
    type: "daily",
    objectives: [
      { type: "unlock_skill", count: 1 }
    ],
    rewards: {
      exp: 50,
      skillPoints: 1
    }
  },
  {
    id: "daily_gold_earn",
    name: "日課：金策",
    description: "ゴールドを500以上稼げ。",
    type: "daily",
    objectives: [
      { type: "earn_gold", count: 500 }
    ],
    rewards: {
      exp: 80,
      gold: 200
    }
  }
];
```

## 実装タスク

### Task 7.1: クエストデータモジュール
**ファイル**: `js/quests.js`（新規作成）

```javascript
const allQuests = [...mainQuests, ...sideQuests, ...dailyQuests];

const questProgress = {
  activeQuests: [],
  completedQuests: [],
  dailyReset: null,
  objectives: {}
};

// IDでクエスト取得
function getQuestById(id) {
  return allQuests.find(q => q.id === id);
}

// 利用可能なクエスト取得
function getAvailableQuests() {
  return allQuests.filter(quest => {
    // 完了済み（繰り返し不可）
    if (!quest.repeatable && questProgress.completedQuests.includes(quest.id)) {
      return false;
    }
    
    // レベル不足
    if (quest.requirements.level > player.level) {
      return false;
    }
    
    // 前提クエスト未完了
    if (quest.requirements.prerequisite && 
        !questProgress.completedQuests.includes(quest.requirements.prerequisite)) {
      return false;
    }
    
    // 既にアクティブ
    if (questProgress.activeQuests.includes(quest.id)) {
      return false;
    }
    
    return true;
  });
}
```

### Task 7.2: クエスト受注・完了

```javascript
function acceptQuest(questId) {
  const quest = getQuestById(questId);
  if (!quest) return false;
  
  // 受注上限チェック（最大5つ）
  if (questProgress.activeQuests.length >= 5) {
    logMessage("これ以上クエストを受けられません。");
    return false;
  }
  
  // 受注
  questProgress.activeQuests.push(questId);
  questProgress.objectives[questId] = {};
  
  // 目標を初期化
  quest.objectives.forEach(obj => {
    const key = obj.target || obj.type;
    questProgress.objectives[questId][key] = 0;
  });
  
  logMessage(`クエスト「${quest.name}」を受注した。`);
  saveOnAction();
  
  return true;
}

function completeQuest(questId) {
  const quest = getQuestById(questId);
  if (!quest) return false;
  
  // 完了条件チェック
  if (!isQuestComplete(questId)) {
    logMessage("クエストの目標が達成されていません。");
    return false;
  }
  
  // 報酬付与
  grantQuestRewards(quest);
  
  // 状態更新
  questProgress.activeQuests = questProgress.activeQuests.filter(id => id !== questId);
  
  if (!quest.repeatable) {
    questProgress.completedQuests.push(questId);
  }
  
  delete questProgress.objectives[questId];
  
  logMessage(`クエスト「${quest.name}」を完了した！`);
  saveOnAction();
  
  return true;
}

function grantQuestRewards(quest) {
  const rewards = quest.rewards;
  const stats = getEffectiveStats();
  
  if (rewards.exp) {
    const exp = Math.floor(rewards.exp * (1 + stats.expBonus / 100));
    player.exp += exp;
    logMessage(`経験値 +${exp}`);
    checkLevelUp();
  }
  
  if (rewards.gold) {
    const gold = Math.floor(rewards.gold * (1 + stats.goldBonus / 100));
    player.gold += gold;
    logMessage(`ゴールド +${gold}`);
  }
  
  if (rewards.skillPoints) {
    player.skillPoints += rewards.skillPoints;
    logMessage(`スキルポイント +${rewards.skillPoints}`);
  }
  
  if (rewards.items) {
    rewards.items.forEach(item => {
      addItemToInventory(item.itemId, item.quantity);
      const itemData = getItemById(item.itemId);
      logMessage(`${itemData.name} ×${item.quantity} を入手`);
    });
  }
  
  if (rewards.title) {
    player.title = rewards.title;
    logMessage(`称号「${rewards.title}」を獲得！`);
  }
  
  updateStatus();
  updateHeader();
}
```

### Task 7.3: 進捗トラッキング

```javascript
// 戦闘終了時に呼び出す
function updateQuestProgress(event, data) {
  questProgress.activeQuests.forEach(questId => {
    const quest = getQuestById(questId);
    if (!quest) return;
    
    quest.objectives.forEach(obj => {
      const key = obj.target || obj.type;
      
      switch (obj.type) {
        case "defeat":
          if (event === "enemy_defeated" && data.enemyId === obj.target) {
            questProgress.objectives[questId][key] = 
              (questProgress.objectives[questId][key] || 0) + 1;
          }
          break;
          
        case "defeat_any":
          if (event === "enemy_defeated") {
            questProgress.objectives[questId][key] = 
              (questProgress.objectives[questId][key] || 0) + 1;
          }
          break;
          
        case "defeat_elite":
          if (event === "enemy_defeated" && data.category === "elite") {
            questProgress.objectives[questId][key] = 
              (questProgress.objectives[questId][key] || 0) + 1;
          }
          break;
          
        case "defeat_boss":
          if (event === "boss_defeated" && data.enemyId === obj.target) {
            questProgress.objectives[questId][key] = 1;
          }
          break;
          
        case "earn_gold":
          if (event === "gold_earned") {
            questProgress.objectives[questId][key] = 
              (questProgress.objectives[questId][key] || 0) + data.amount;
          }
          break;
          
        case "unlock_skill":
          if (event === "skill_unlocked") {
            questProgress.objectives[questId][key] = 
              (questProgress.objectives[questId][key] || 0) + 1;
          }
          break;
      }
    });
  });
  
  // 完了可能なクエストをチェック
  checkQuestCompletion();
}

function isQuestComplete(questId) {
  const quest = getQuestById(questId);
  if (!quest) return false;
  
  return quest.objectives.every(obj => {
    const key = obj.target || obj.type;
    const current = questProgress.objectives[questId]?.[key] || 0;
    return current >= obj.count;
  });
}

function checkQuestCompletion() {
  questProgress.activeQuests.forEach(questId => {
    if (isQuestComplete(questId)) {
      // 完了可能通知
      showQuestCompleteNotification(questId);
    }
  });
}
```

### Task 7.4: デイリーリセット

```javascript
function checkDailyReset() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  if (!questProgress.dailyReset || questProgress.dailyReset < today) {
    // デイリークエストをリセット
    resetDailyQuests();
    questProgress.dailyReset = today;
    saveOnAction();
  }
}

function resetDailyQuests() {
  // デイリークエストを完了済みから削除
  const dailyIds = dailyQuests.map(q => q.id);
  questProgress.completedQuests = questProgress.completedQuests.filter(
    id => !dailyIds.includes(id)
  );
  
  // アクティブなデイリーも削除
  questProgress.activeQuests = questProgress.activeQuests.filter(
    id => !dailyIds.includes(id)
  );
  
  logMessage("デイリークエストがリセットされました。");
}
```

### Task 7.5: クエストUI

```html
<!-- index.html に追加 -->
<section class="panel">
  <h2>クエスト</h2>
  <div class="quest-tabs">
    <button class="tab active" data-tab="active">受注中</button>
    <button class="tab" data-tab="available">受注可能</button>
    <button class="tab" data-tab="completed">完了済</button>
  </div>
  <div id="quest-list" class="quest-list"></div>
</section>

<!-- クエスト詳細モーダル -->
<div id="quest-detail-modal" class="modal hidden">
  <div class="modal-content">
    <h3 id="quest-detail-name"></h3>
    <p id="quest-detail-desc"></p>
    
    <div class="quest-objectives">
      <h4>目標</h4>
      <ul id="quest-objectives-list"></ul>
    </div>
    
    <div class="quest-rewards">
      <h4>報酬</h4>
      <ul id="quest-rewards-list"></ul>
    </div>
    
    <div class="quest-actions">
      <button id="quest-accept">受注</button>
      <button id="quest-complete">完了報告</button>
      <button id="quest-abandon" class="ghost danger">破棄</button>
      <button id="quest-close" class="ghost">閉じる</button>
    </div>
  </div>
</div>
```

### Task 7.6: クエストUI実装

```javascript
let currentQuestTab = "active";

function renderQuestList() {
  const container = document.getElementById("quest-list");
  container.innerHTML = "";
  
  let quests;
  switch (currentQuestTab) {
    case "active":
      quests = questProgress.activeQuests.map(getQuestById);
      break;
    case "available":
      quests = getAvailableQuests();
      break;
    case "completed":
      quests = questProgress.completedQuests.map(getQuestById).slice(-20);
      break;
  }
  
  if (quests.length === 0) {
    container.innerHTML = `<p class="empty">クエストがありません。</p>`;
    return;
  }
  
  quests.forEach(quest => {
    const card = createQuestCard(quest);
    container.appendChild(card);
  });
}

function createQuestCard(quest) {
  const card = document.createElement("div");
  card.className = `quest-card ${quest.type}`;
  
  const isActive = questProgress.activeQuests.includes(quest.id);
  const isComplete = isActive && isQuestComplete(quest.id);
  
  let progressHtml = "";
  if (isActive) {
    progressHtml = `
      <div class="quest-progress">
        ${quest.objectives.map(obj => {
          const key = obj.target || obj.type;
          const current = questProgress.objectives[quest.id]?.[key] || 0;
          return `<span>${current}/${obj.count}</span>`;
        }).join(" ")}
      </div>
    `;
  }
  
  card.innerHTML = `
    <div class="quest-header">
      <span class="quest-type">${getQuestTypeLabel(quest.type)}</span>
      ${isComplete ? '<span class="quest-complete-badge">完了可能</span>' : ''}
    </div>
    <h4>${quest.name}</h4>
    <p>${quest.description}</p>
    ${progressHtml}
  `;
  
  card.addEventListener("click", () => openQuestDetail(quest));
  
  return card;
}

function getQuestTypeLabel(type) {
  const labels = {
    battle: "戦闘",
    subjugation: "討伐",
    boss: "ボス",
    gather: "採集",
    daily: "デイリー"
  };
  return labels[type] || type;
}
```

## 追加CSS

```css
.quest-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.quest-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.quest-card {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-left: 4px solid #64748b;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.quest-card:hover {
  border-color: #4f46e5;
}

.quest-card.boss {
  border-left-color: #ef4444;
}

.quest-card.daily {
  border-left-color: #22c55e;
}

.quest-card.subjugation {
  border-left-color: #f59e0b;
}

.quest-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.quest-type {
  font-size: 11px;
  padding: 2px 6px;
  background: #1e293b;
  border-radius: 4px;
  color: #94a3b8;
}

.quest-complete-badge {
  font-size: 11px;
  padding: 2px 6px;
  background: #22c55e;
  border-radius: 4px;
  color: white;
}

.quest-card h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.quest-card p {
  margin: 0;
  font-size: 13px;
  color: #94a3b8;
}

.quest-progress {
  margin-top: 8px;
  font-size: 13px;
  color: #3b82f6;
}

.quest-objectives,
.quest-rewards {
  margin: 16px 0;
}

.quest-objectives h4,
.quest-rewards h4 {
  font-size: 14px;
  margin-bottom: 8px;
  color: #94a3b8;
}
```

## テスト項目

- [ ] 利用可能なクエストが表示される
- [ ] クエストを受注できる
- [ ] 戦闘で進捗が更新される
- [ ] 目標達成で完了報告できる
- [ ] 報酬が正しく付与される
- [ ] 前提クエストが機能する
- [ ] デイリーリセットが機能する
- [ ] セーブ/ロードで進捗が保持される

## 完了条件

1. メインクエスト5つ以上が機能する
2. サブクエスト・デイリーが機能する
3. 進捗トラッキングが正確
4. UIで進捗が確認できる
