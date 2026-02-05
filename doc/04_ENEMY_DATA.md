# 04. 敵・モンスターデータ

## 概要

戦闘システムで使用する敵キャラクターのデータを定義する。

## 目的

- 多様な戦闘体験を提供
- プレイヤーレベルに応じた難易度
- ボス戦の実装基盤

## 敵のカテゴリ

| カテゴリ | 説明 | 出現条件 |
|----------|------|----------|
| 通常モンスター | 一般的な敵 | 通常クエスト |
| 強敵 | ステータスが高い | 特定クエスト |
| ボス | 大幅に強化、特殊スキル持ち | ボスクエスト |

## データ構造

### 敵の基本構造
```javascript
const enemy = {
  id: "slime_01",
  name: "スライム",
  category: "normal",      // normal | elite | boss
  level: 1,
  
  // ステータス
  hp: 30,
  atk: 8,
  def: 2,
  
  // 報酬
  expReward: 15,
  goldReward: 10,
  
  // ドロップアイテム（将来実装）
  drops: [
    { itemId: "slime_gel", rate: 30 }
  ],
  
  // 特殊スキル
  skills: [],
  
  // 行動AI設定
  ai: {
    skillUseThreshold: 0.5,  // HP50%以下でスキル使用
    patternWeights: {
      attack: 80,
      skill: 20
    }
  },
  
  // フレーバー
  description: "どこにでもいる最弱のモンスター。"
};
```

## 敵データ一覧

### レベル1〜5: 初心者エリア

```javascript
const enemies_tier1 = [
  {
    id: "slime_01",
    name: "スライム",
    category: "normal",
    level: 1,
    hp: 30,
    atk: 8,
    def: 2,
    expReward: 15,
    goldReward: 10,
    description: "どこにでもいる最弱のモンスター。"
  },
  {
    id: "goblin_01",
    name: "ゴブリン",
    category: "normal",
    level: 2,
    hp: 45,
    atk: 12,
    def: 4,
    expReward: 22,
    goldReward: 18,
    description: "小柄だが凶暴な亜人。集団で現れることも。"
  },
  {
    id: "wolf_01",
    name: "野生の狼",
    category: "normal",
    level: 3,
    hp: 55,
    atk: 16,
    def: 5,
    expReward: 30,
    goldReward: 22,
    description: "森に生息する肉食獣。素早い攻撃が特徴。"
  },
  {
    id: "bat_01",
    name: "洞窟コウモリ",
    category: "normal",
    level: 2,
    hp: 25,
    atk: 10,
    def: 2,
    expReward: 18,
    goldReward: 12,
    description: "暗闘を好む夜行性のモンスター。"
  },
  {
    id: "mushroom_01",
    name: "毒キノコ",
    category: "normal",
    level: 3,
    hp: 40,
    atk: 8,
    def: 8,
    expReward: 25,
    goldReward: 20,
    skills: [{ id: "poison_spore", name: "毒胞子", power: 5, type: "dot" }],
    description: "毒の胞子を撒き散らすキノコモンスター。"
  }
];
```

### レベル6〜10: 中級エリア

```javascript
const enemies_tier2 = [
  {
    id: "orc_01",
    name: "オーク戦士",
    category: "normal",
    level: 6,
    hp: 120,
    atk: 28,
    def: 12,
    expReward: 55,
    goldReward: 45,
    description: "重装備のオーク。力任せの攻撃を仕掛けてくる。"
  },
  {
    id: "skeleton_01",
    name: "スケルトン",
    category: "normal",
    level: 7,
    hp: 80,
    atk: 32,
    def: 8,
    expReward: 60,
    goldReward: 50,
    description: "蘇った骸骨の兵士。物理攻撃への耐性がある。"
  },
  {
    id: "harpy_01",
    name: "ハーピー",
    category: "normal",
    level: 8,
    hp: 90,
    atk: 35,
    def: 10,
    expReward: 70,
    goldReward: 55,
    skills: [{ id: "wind_slash", name: "風の刃", power: 130, type: "attack" }],
    description: "鳥の翼を持つ女性型モンスター。風魔法を操る。"
  },
  {
    id: "golem_01",
    name: "ストーンゴーレム",
    category: "elite",
    level: 9,
    hp: 200,
    atk: 40,
    def: 25,
    expReward: 100,
    goldReward: 80,
    description: "岩で構成された人造兵。非常に硬い。"
  },
  {
    id: "mage_01",
    name: "闇の魔術師",
    category: "elite",
    level: 10,
    hp: 100,
    atk: 50,
    def: 8,
    expReward: 120,
    goldReward: 100,
    skills: [
      { id: "dark_bolt", name: "闇の矢", power: 150, type: "attack" },
      { id: "life_drain", name: "生命吸収", power: 80, type: "drain" }
    ],
    description: "禁術を操る危険な魔術師。"
  }
];
```

### レベル11〜15: 上級エリア

```javascript
const enemies_tier3 = [
  {
    id: "knight_01",
    name: "堕落した騎士",
    category: "normal",
    level: 11,
    hp: 180,
    atk: 55,
    def: 30,
    expReward: 140,
    goldReward: 110,
    description: "かつて名誉ある騎士だった者の成れの果て。"
  },
  {
    id: "wyvern_01",
    name: "ワイバーン",
    category: "elite",
    level: 13,
    hp: 250,
    atk: 65,
    def: 20,
    expReward: 200,
    goldReward: 160,
    skills: [{ id: "breath", name: "ブレス", power: 140, type: "attack" }],
    description: "翼を持つ竜の亜種。空からの攻撃を得意とする。"
  },
  {
    id: "demon_01",
    name: "下級デーモン",
    category: "elite",
    level: 14,
    hp: 280,
    atk: 70,
    def: 25,
    expReward: 240,
    goldReward: 200,
    skills: [
      { id: "hell_fire", name: "獄炎", power: 160, type: "attack" },
      { id: "terror", name: "恐怖", power: 0, type: "debuff", stat: "atk", value: -20 }
    ],
    description: "魔界からの侵入者。"
  }
];
```

### ボスモンスター

```javascript
const bosses = [
  {
    id: "boss_goblin_king",
    name: "ゴブリンキング",
    category: "boss",
    level: 5,
    hp: 300,
    atk: 25,
    def: 15,
    expReward: 200,
    goldReward: 300,
    skills: [
      { id: "rally", name: "号令", power: 0, type: "buff", stat: "atk", value: 30, duration: 3 },
      { id: "heavy_strike", name: "強打", power: 150, type: "attack" }
    ],
    ai: {
      skillUseThreshold: 0.7,
      patternWeights: { attack: 50, skill: 50 }
    },
    description: "ゴブリンたちの王。残忍で狡猾。"
  },
  {
    id: "boss_dragon",
    name: "古代竜ヴォルガノス",
    category: "boss",
    level: 10,
    hp: 800,
    atk: 60,
    def: 35,
    expReward: 500,
    goldReward: 800,
    skills: [
      { id: "fire_breath", name: "業火のブレス", power: 180, type: "attack" },
      { id: "tail_sweep", name: "尾撃", power: 120, type: "attack" },
      { id: "roar", name: "咆哮", power: 0, type: "debuff", stat: "def", value: -30, duration: 2 }
    ],
    ai: {
      skillUseThreshold: 0.5,
      patternWeights: { attack: 30, skill: 70 },
      phases: [
        { hpThreshold: 0.5, pattern: "enraged" }
      ]
    },
    description: "伝説に語られる古の竜。その炎はすべてを焼き尽くす。"
  },
  {
    id: "boss_lich",
    name: "不死王リッチ",
    category: "boss",
    level: 15,
    hp: 600,
    atk: 80,
    def: 20,
    expReward: 800,
    goldReward: 1200,
    skills: [
      { id: "death_coil", name: "死の螺旋", power: 200, type: "attack" },
      { id: "summon", name: "骸骨召喚", type: "summon", summonId: "skeleton_01" },
      { id: "curse", name: "呪い", type: "debuff", stat: "all", value: -15, duration: 3 }
    ],
    description: "死を超越した魔術師の成れの果て。"
  }
];
```

## 実装タスク

### Task 4.1: 敵データモジュール
**ファイル**: `js/enemies.js`（新規作成）

```javascript
// 全敵データを統合
const allEnemies = [
  ...enemies_tier1,
  ...enemies_tier2,
  ...enemies_tier3,
  ...bosses
];

// IDで敵を取得
function getEnemyById(id) {
  return allEnemies.find(e => e.id === id);
}

// レベル範囲で敵をフィルタ
function getEnemiesByLevelRange(minLevel, maxLevel, category = null) {
  return allEnemies.filter(e => {
    const levelMatch = e.level >= minLevel && e.level <= maxLevel;
    const categoryMatch = !category || e.category === category;
    return levelMatch && categoryMatch;
  });
}

// プレイヤーレベルに適した敵をランダム選択
function selectRandomEnemy(playerLevel) {
  const minLevel = Math.max(1, playerLevel - 2);
  const maxLevel = playerLevel + 1;
  
  const candidates = getEnemiesByLevelRange(minLevel, maxLevel, "normal");
  
  if (candidates.length === 0) {
    return allEnemies[0]; // フォールバック
  }
  
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// 敵インスタンスを生成（ステータスに変動を加える）
function createEnemyInstance(enemyData) {
  const variance = 0.9 + Math.random() * 0.2; // 90%〜110%
  
  return {
    ...enemyData,
    hp: Math.floor(enemyData.hp * variance),
    atk: Math.floor(enemyData.atk * variance),
    def: Math.floor(enemyData.def * variance)
  };
}
```

### Task 4.2: クエストと敵の紐付け

```javascript
// クエスト定義（07_QUEST_SYSTEMで詳細化）
const questTypes = {
  normal: {
    name: "通常クエスト",
    getEnemy: (playerLevel) => {
      return createEnemyInstance(selectRandomEnemy(playerLevel));
    }
  },
  elite: {
    name: "強敵討伐",
    getEnemy: (playerLevel) => {
      const elites = getEnemiesByLevelRange(playerLevel - 1, playerLevel + 2, "elite");
      const enemy = elites[Math.floor(Math.random() * elites.length)] || allEnemies[0];
      return createEnemyInstance(enemy);
    }
  },
  boss: {
    name: "ボス戦",
    getEnemy: (bossId) => {
      return createEnemyInstance(getEnemyById(bossId));
    }
  }
};
```

### Task 4.3: 敵スキル実行

```javascript
function executeEnemySkill(enemy, skill) {
  switch (skill.type) {
    case "attack":
      const damage = calculateDamage(enemy.atk, getEffectiveStats().def, skill.power);
      applyDamage("player", damage, false);
      battleLog(`${enemy.name}の${skill.name}！${damage}ダメージ！`);
      break;
      
    case "buff":
      // 敵自身を強化
      battleState.enemyBuffs = battleState.enemyBuffs || [];
      battleState.enemyBuffs.push({
        stat: skill.stat,
        value: skill.value,
        turnsLeft: skill.duration
      });
      battleLog(`${enemy.name}の${skill.name}！${skill.stat}が上昇！`);
      break;
      
    case "debuff":
      // プレイヤーを弱体化
      battleState.playerDebuffs = battleState.playerDebuffs || [];
      battleState.playerDebuffs.push({
        stat: skill.stat,
        value: skill.value,
        turnsLeft: skill.duration
      });
      battleLog(`${enemy.name}の${skill.name}！${skill.stat}が低下！`);
      break;
      
    case "drain":
      const drainDamage = calculateDamage(enemy.atk, getEffectiveStats().def, skill.power);
      applyDamage("player", drainDamage, false);
      battleState.enemyCurrentHp = Math.min(
        enemy.hp,
        battleState.enemyCurrentHp + Math.floor(drainDamage / 2)
      );
      battleLog(`${enemy.name}の${skill.name}！${drainDamage}ダメージ、HPを吸収！`);
      break;
  }
}
```

### Task 4.4: 敵表示コンポーネント

```javascript
function renderEnemyInfo(enemy) {
  return `
    <div class="enemy-card ${enemy.category}">
      <div class="enemy-header">
        <span class="enemy-level">Lv.${enemy.level}</span>
        <h3 class="enemy-name">${enemy.name}</h3>
        ${enemy.category !== 'normal' ? `<span class="enemy-badge">${enemy.category}</span>` : ''}
      </div>
      <p class="enemy-desc">${enemy.description}</p>
      <div class="enemy-stats">
        <span>HP: ${enemy.hp}</span>
        <span>ATK: ${enemy.atk}</span>
        <span>DEF: ${enemy.def}</span>
      </div>
    </div>
  `;
}
```

## 追加CSS

```css
.enemy-card {
  background: #1e293b;
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid #64748b;
}

.enemy-card.elite {
  border-left-color: #f59e0b;
  background: linear-gradient(135deg, #1e293b, #2d1f1f);
}

.enemy-card.boss {
  border-left-color: #ef4444;
  background: linear-gradient(135deg, #1e293b, #2d1f2f);
}

.enemy-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.enemy-level {
  background: #334155;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.enemy-badge {
  background: #ef4444;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  text-transform: uppercase;
}

.enemy-card.elite .enemy-badge {
  background: #f59e0b;
}

.enemy-desc {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 12px;
}

.enemy-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
}
```

## 敵追加のガイドライン

新しい敵を追加する際は以下を考慮:

1. **レベルバランス**: 同レベル帯の敵とステータスを比較
2. **ユニークさ**: スキルや特徴で差別化
3. **報酬設計**: 難易度に見合った報酬
4. **世界観**: ゲームの雰囲気に合った名前・説明

## テスト項目

- [ ] 全敵データが正常に読み込まれる
- [ ] レベル範囲フィルタが機能する
- [ ] ランダム選択が適切に動作する
- [ ] 敵スキルが正常に発動する
- [ ] ボス戦が特別な挙動をする

## 完了条件

1. 最低15種類の通常敵が定義されている
2. 最低3種類のボスが定義されている
3. 戦闘システムと正常に連携する
4. レベルに応じた敵選出が機能する
