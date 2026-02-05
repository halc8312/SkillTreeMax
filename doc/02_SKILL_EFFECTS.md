# 02. スキル効果システム

## 概要

解放したスキルがプレイヤーのステータスや戦闘に実際の効果を与える仕組みを実装する。

## 目的

- スキル解放に意味を持たせる
- ステータス上昇・特殊効果の付与
- 戦闘システムとの連携基盤

## 効果の種類

### 1. パッシブ効果（常時発動）
スキル解放時に自動でステータスに反映される。

| 効果タイプ | 説明 | 例 |
|------------|------|-----|
| `stat_boost` | ステータス上昇 | ATK+5, DEF+3 |
| `percent_boost` | 割合上昇 | HP+10% |
| `regen` | 自動回復 | 毎ターンHP+5 |

### 2. アクティブ効果（戦闘で使用）
戦闘中に選択して発動する。

| 効果タイプ | 説明 | 例 |
|------------|------|-----|
| `attack` | 攻撃スキル | 敵に150%ダメージ |
| `heal` | 回復スキル | HP30回復 |
| `buff` | 強化 | 3ターンATK+50% |
| `debuff` | 弱体化 | 敵DEF-30% |

## データ構造

### スキル効果の定義
```javascript
const skillEffects = {
  // 剣術系統
  "sword": {
    passive: {
      atk: 2,           // 基本ATK上昇
      atkPercent: 0,    // ATK%上昇
    },
    active: {
      type: "attack",
      power: 120,       // 攻撃力の120%
      mpCost: 5,
      description: "鋭い斬撃で敵を攻撃"
    }
  },
  
  // 元素魔法系統
  "magic": {
    passive: {
      mp: 5,
      magicPower: 3
    },
    active: {
      type: "attack",
      power: 150,
      mpCost: 12,
      element: "fire",
      description: "炎の魔法で敵を焼く"
    }
  },
  
  // 支援・回復系統
  "support": {
    passive: {
      hp: 10,
      healBonus: 5
    },
    active: {
      type: "heal",
      power: 30,        // 固定回復量
      mpCost: 8,
      description: "HPを回復する"
    }
  },
  
  // 守護・防衛系統
  "tank": {
    passive: {
      def: 3,
      hp: 15
    },
    active: {
      type: "buff",
      stat: "def",
      value: 50,        // DEF+50%
      duration: 3,
      mpCost: 10,
      description: "防御力を一時的に上昇"
    }
  },
  
  // 鍛冶・錬金系統
  "craft": {
    passive: {
      goldBonus: 10,    // ゴールド獲得+10%
      itemFind: 5       // アイテム発見率+5%
    },
    active: null        // アクティブスキルなし
  },
  
  // 探索術系統
  "explore": {
    passive: {
      expBonus: 5,      // 経験値+5%
      encounterReduce: 3 // エンカウント率-3%
    },
    active: {
      type: "escape",
      successRate: 80,
      mpCost: 3,
      description: "戦闘から逃走を試みる"
    }
  },
  
  // 戦術・指揮系統
  "tactics": {
    passive: {
      critRate: 2,      // クリティカル率+2%
      critDamage: 10    // クリティカルダメージ+10%
    },
    active: {
      type: "buff",
      stat: "atk",
      value: 30,
      duration: 2,
      mpCost: 15,
      description: "攻撃力を一時的に上昇"
    }
  },
  
  // 深淵魔導系統
  "arcane": {
    passive: {
      mp: 10,
      allStats: 1       // 全ステータス+1
    },
    active: {
      type: "attack",
      power: 200,
      mpCost: 25,
      piercing: true,   // 防御無視
      description: "防御を貫通する禁断の魔法"
    }
  }
};
```

### 階層による効果スケーリング
```javascript
function getSkillEffect(skill) {
  const base = skillEffects[skill.branch];
  const tierMultiplier = 1 + (skill.tier - 1) * 0.1; // 階層ごとに10%増加
  
  return {
    passive: scalePassive(base.passive, tierMultiplier),
    active: scaleActive(base.active, tierMultiplier)
  };
}

function scalePassive(passive, multiplier) {
  if (!passive) return null;
  const scaled = {};
  for (const [key, value] of Object.entries(passive)) {
    scaled[key] = Math.floor(value * multiplier);
  }
  return scaled;
}
```

## 実装タスク

### Task 2.1: 効果計算エンジン
**ファイル**: `js/skills.js`（新規作成）

```javascript
// プレイヤーの実効ステータスを計算
function calculateEffectiveStats() {
  // 基礎ステータス
  const stats = {
    hp: player.baseHp,
    mp: player.baseMp,
    atk: player.baseAtk,
    def: player.baseDef,
    critRate: 5,
    critDamage: 150,
    expBonus: 0,
    goldBonus: 0
  };
  
  // 解放済みスキルの効果を集計
  const unlockedSkills = skillTree.filter(s => s.unlocked);
  
  unlockedSkills.forEach(skill => {
    const effect = getSkillEffect(skill);
    if (effect.passive) {
      applyPassiveEffect(stats, effect.passive);
    }
  });
  
  // %ボーナスを適用
  stats.hp = Math.floor(stats.hp * (1 + stats.hpPercent / 100));
  stats.atk = Math.floor(stats.atk * (1 + stats.atkPercent / 100));
  stats.def = Math.floor(stats.def * (1 + stats.defPercent / 100));
  
  return stats;
}

function applyPassiveEffect(stats, passive) {
  for (const [key, value] of Object.entries(passive)) {
    if (key in stats) {
      stats[key] += value;
    }
  }
}
```

### Task 2.2: スキル解放時の効果適用

```javascript
function unlockSkill(skill) {
  if (skill.unlocked || player.skillPoints < skill.cost) {
    return;
  }
  
  player.skillPoints -= skill.cost;
  skill.unlocked = true;
  
  // 効果を適用
  const effect = getSkillEffect(skill);
  if (effect.passive) {
    applySkillEffect(effect.passive);
    logEffectGain(effect.passive);
  }
  
  logMessage(`${skill.name} を解放した！`);
  updateHeader();
  updateStatus();
  renderSkillTree(...);
  selectSkill(skill);
  
  // 自動セーブ
  saveOnAction();
}

function logEffectGain(passive) {
  const effects = [];
  if (passive.atk) effects.push(`ATK+${passive.atk}`);
  if (passive.def) effects.push(`DEF+${passive.def}`);
  if (passive.hp) effects.push(`HP+${passive.hp}`);
  if (passive.mp) effects.push(`MP+${passive.mp}`);
  
  if (effects.length > 0) {
    logMessage(`効果: ${effects.join(', ')}`);
  }
}
```

### Task 2.3: UI - スキル詳細に効果表示

```html
<!-- index.html のスキル詳細部分を拡張 -->
<div class="detail-content hidden">
  <h3 id="detail-name"></h3>
  <p id="detail-desc"></p>
  <p class="detail-meta">
    <span>系統: <strong id="detail-branch"></strong></span>
    <span>階層: <strong id="detail-tier"></strong></span>
    <span>コスト: <strong id="detail-cost"></strong>pt</span>
  </p>
  
  <!-- 効果表示を追加 -->
  <div class="skill-effects">
    <h4>パッシブ効果</h4>
    <ul id="detail-passive"></ul>
    
    <h4>アクティブスキル</h4>
    <div id="detail-active"></div>
  </div>
  
  <button id="unlock-skill">スキル解放</button>
</div>
```

### Task 2.4: 効果表示の実装

```javascript
function selectSkill(skill) {
  // ...既存コード...
  
  // 効果を表示
  const effect = getSkillEffect(skill);
  displayPassiveEffects(effect.passive);
  displayActiveSkill(effect.active);
}

function displayPassiveEffects(passive) {
  const list = document.getElementById("detail-passive");
  list.innerHTML = "";
  
  if (!passive) {
    list.innerHTML = "<li>なし</li>";
    return;
  }
  
  const labels = {
    atk: "攻撃力",
    def: "防御力",
    hp: "最大HP",
    mp: "最大MP",
    critRate: "クリティカル率",
    expBonus: "経験値ボーナス",
    goldBonus: "ゴールドボーナス"
  };
  
  for (const [key, value] of Object.entries(passive)) {
    if (value > 0) {
      const li = document.createElement("li");
      const label = labels[key] || key;
      const suffix = key.includes("Percent") || key.includes("Bonus") || key.includes("Rate") ? "%" : "";
      li.textContent = `${label} +${value}${suffix}`;
      list.appendChild(li);
    }
  }
}

function displayActiveSkill(active) {
  const container = document.getElementById("detail-active");
  
  if (!active) {
    container.innerHTML = "<p>なし</p>";
    return;
  }
  
  container.innerHTML = `
    <p class="active-desc">${active.description}</p>
    <p class="active-meta">
      <span>消費MP: ${active.mpCost}</span>
      <span>威力: ${active.power || "-"}</span>
    </p>
  `;
}
```

### Task 2.5: プレイヤーステータスの分離

```javascript
// app.js のplayer構造を変更
const player = {
  level: 1,
  exp: 0,
  expToNext: 100,
  
  // 基礎値（レベルアップで増加）
  baseHp: 100,
  baseMp: 50,
  baseAtk: 10,
  baseDef: 8,
  
  // 現在値
  currentHp: 100,
  currentMp: 50,
  
  gold: 120,
  skillPoints: 4,
  title: "芽吹く探究者",
};

// 実効値を取得
function getEffectiveStats() {
  return calculateEffectiveStats();
}
```

## 追加CSS

```css
.skill-effects {
  margin: 16px 0;
  padding: 12px;
  background: #0f172a;
  border-radius: 8px;
}

.skill-effects h4 {
  font-size: 14px;
  color: #94a3b8;
  margin: 0 0 8px 0;
}

.skill-effects ul {
  margin: 0 0 16px 0;
  padding-left: 20px;
}

.skill-effects li {
  color: #22c55e;
  font-size: 14px;
  line-height: 1.6;
}

.active-desc {
  margin: 0 0 8px 0;
  color: #e2e8f0;
}

.active-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #94a3b8;
}

.active-meta span {
  background: #1e293b;
  padding: 4px 8px;
  border-radius: 4px;
}
```

## テスト項目

- [ ] スキル解放でステータスが上昇する
- [ ] 階層が高いほど効果が大きい
- [ ] 効果がスキル詳細パネルに表示される
- [ ] 複数スキル解放で効果が累積する
- [ ] セーブ/ロードで効果が維持される

## 完了条件

1. 全8系統にパッシブ効果が定義されている
2. スキル解放時にステータスが反映される
3. UIに効果が表示される
4. 戦闘システムと連携できる準備ができている
