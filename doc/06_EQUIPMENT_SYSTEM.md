# 06. 装備システム

## 概要

武器・防具・アクセサリを装備してステータスを強化するシステムを実装する。

## 目的

- プレイヤーのカスタマイズ性向上
- ショップで購入した装備の活用
- ビルドの多様性を提供

## 装備スロット

| スロット | 説明 | 影響ステータス |
|----------|------|----------------|
| 武器 (weapon) | 攻撃力を上げるメイン装備 | ATK, クリティカル |
| 防具 (armor) | 防御力とHPを上げる | DEF, HP |
| アクセサリ (accessory) | 様々な効果を持つ | 各種ステータス |
| 盾 (shield) | 防御特化 | DEF, ブロック率 |

## データ構造

### 装備データ
```javascript
const equipment = {
  id: "sword_flame",
  name: "炎の剣",
  description: "炎を纏った魔法の剣。攻撃時に追加ダメージ。",
  slot: "weapon",
  rarity: "rare",          // common | uncommon | rare | epic | legendary
  levelRequired: 10,
  
  // 基本ステータス
  stats: {
    atk: 30,
    critRate: 5
  },
  
  // 特殊効果
  effects: [
    {
      type: "onHit",
      effect: "fire_damage",
      value: 10,
      description: "攻撃時に10の炎ダメージを追加"
    }
  ],
  
  // セット効果（将来拡張）
  setId: "flame_set"
};
```

### プレイヤー装備状態
```javascript
const playerEquipment = {
  weapon: null,      // 装備中のアイテムID
  armor: null,
  accessory: null,
  shield: null
};
```

## レアリティ定義

```javascript
const rarityConfig = {
  common: {
    name: "コモン",
    color: "#9ca3af",
    statMultiplier: 1.0
  },
  uncommon: {
    name: "アンコモン",
    color: "#22c55e",
    statMultiplier: 1.15
  },
  rare: {
    name: "レア",
    color: "#3b82f6",
    statMultiplier: 1.35
  },
  epic: {
    name: "エピック",
    color: "#a855f7",
    statMultiplier: 1.6
  },
  legendary: {
    name: "レジェンダリー",
    color: "#f59e0b",
    statMultiplier: 2.0
  }
};
```

## 装備データ一覧

### 武器

```javascript
const weapons = [
  // コモン
  {
    id: "sword_wood",
    name: "木の剣",
    description: "訓練用の木製の剣。",
    slot: "weapon",
    rarity: "common",
    levelRequired: 1,
    stats: { atk: 3 }
  },
  {
    id: "sword_iron",
    name: "鉄の剣",
    description: "一般的な鉄製の剣。",
    slot: "weapon",
    rarity: "common",
    levelRequired: 1,
    stats: { atk: 8 }
  },
  
  // アンコモン
  {
    id: "sword_steel",
    name: "鋼の剣",
    description: "より硬い鋼で作られた剣。",
    slot: "weapon",
    rarity: "uncommon",
    levelRequired: 5,
    stats: { atk: 15, critRate: 2 }
  },
  {
    id: "axe_battle",
    name: "バトルアックス",
    description: "重量のある戦斧。クリティカルダメージが高い。",
    slot: "weapon",
    rarity: "uncommon",
    levelRequired: 6,
    stats: { atk: 18, critDamage: 20 }
  },
  
  // レア
  {
    id: "sword_silver",
    name: "白銀の剣",
    description: "魔物に効果的な銀製の剣。",
    slot: "weapon",
    rarity: "rare",
    levelRequired: 10,
    stats: { atk: 25, magicPower: 5 }
  },
  {
    id: "sword_flame",
    name: "炎の剣",
    description: "炎を纏った魔法の剣。",
    slot: "weapon",
    rarity: "rare",
    levelRequired: 12,
    stats: { atk: 28, critRate: 5 },
    effects: [{ type: "onHit", effect: "fire_damage", value: 10 }]
  },
  
  // エピック
  {
    id: "sword_dragon",
    name: "竜殺しの剣",
    description: "古代の竜を倒すために鍛えられた伝説の剣。",
    slot: "weapon",
    rarity: "epic",
    levelRequired: 15,
    stats: { atk: 45, critRate: 8, critDamage: 30 }
  }
];
```

### 防具

```javascript
const armors = [
  // コモン
  {
    id: "armor_cloth",
    name: "布の服",
    description: "一般的な布製の服。",
    slot: "armor",
    rarity: "common",
    levelRequired: 1,
    stats: { def: 2, hp: 10 }
  },
  {
    id: "armor_leather",
    name: "革の鎧",
    description: "軽くて動きやすい革鎧。",
    slot: "armor",
    rarity: "common",
    levelRequired: 1,
    stats: { def: 5, hp: 20 }
  },
  
  // アンコモン
  {
    id: "armor_chain",
    name: "チェインメイル",
    description: "鎖を編んで作られた鎧。",
    slot: "armor",
    rarity: "uncommon",
    levelRequired: 5,
    stats: { def: 12, hp: 50 }
  },
  
  // レア
  {
    id: "armor_plate",
    name: "プレートアーマー",
    description: "重厚な金属製の鎧。",
    slot: "armor",
    rarity: "rare",
    levelRequired: 10,
    stats: { def: 22, hp: 100 }
  },
  {
    id: "armor_mage",
    name: "魔導師のローブ",
    description: "魔力を高める特殊なローブ。",
    slot: "armor",
    rarity: "rare",
    levelRequired: 10,
    stats: { def: 10, mp: 50, magicPower: 10 }
  }
];
```

### アクセサリ

```javascript
const accessories = [
  {
    id: "ring_power",
    name: "力の指輪",
    description: "攻撃力を高める魔法の指輪。",
    slot: "accessory",
    rarity: "uncommon",
    levelRequired: 3,
    stats: { atk: 5 }
  },
  {
    id: "ring_guard",
    name: "守りの指輪",
    description: "防御力を高める魔法の指輪。",
    slot: "accessory",
    rarity: "uncommon",
    levelRequired: 3,
    stats: { def: 5 }
  },
  {
    id: "amulet_life",
    name: "生命のアミュレット",
    description: "最大HPを大幅に増加させる。",
    slot: "accessory",
    rarity: "rare",
    levelRequired: 8,
    stats: { hp: 80, hpRegen: 2 }
  },
  {
    id: "ring_critical",
    name: "会心の指輪",
    description: "クリティカル率を高める。",
    slot: "accessory",
    rarity: "rare",
    levelRequired: 10,
    stats: { critRate: 10, critDamage: 15 }
  }
];
```

## 実装タスク

### Task 6.1: 装備管理モジュール
**ファイル**: `js/equipment.js`（新規作成）

```javascript
const playerEquipment = {
  weapon: null,
  armor: null,
  accessory: null,
  shield: null
};

// 全装備データを統合
const allEquipment = [...weapons, ...armors, ...accessories, ...shields];

// IDで装備取得
function getEquipmentById(id) {
  return allEquipment.find(e => e.id === id);
}

// スロットで装備取得
function getEquipmentBySlot(slot) {
  return allEquipment.filter(e => e.slot === slot);
}

// 装備中のアイテム取得
function getEquippedItem(slot) {
  const id = playerEquipment[slot];
  return id ? getEquipmentById(id) : null;
}
```

### Task 6.2: 装備・解除機能

```javascript
function equipItem(itemId) {
  const item = getEquipmentById(itemId);
  if (!item) {
    logMessage("装備が見つかりません。");
    return false;
  }
  
  // インベントリにあるか確認
  if (getItemQuantity(itemId) < 1) {
    logMessage("アイテムを所持していません。");
    return false;
  }
  
  // レベルチェック
  if (player.level < item.levelRequired) {
    logMessage(`レベル${item.levelRequired}以上が必要です。`);
    return false;
  }
  
  // 既存装備を外す
  const currentEquipped = playerEquipment[item.slot];
  if (currentEquipped) {
    unequipItem(item.slot);
  }
  
  // 装備
  playerEquipment[item.slot] = itemId;
  removeItemFromInventory(itemId, 1);
  
  logMessage(`${item.name} を装備した。`);
  updateStatus();
  saveOnAction();
  
  return true;
}

function unequipItem(slot) {
  const currentId = playerEquipment[slot];
  if (!currentId) {
    logMessage("何も装備していません。");
    return false;
  }
  
  const item = getEquipmentById(currentId);
  
  // インベントリに戻す
  if (!addItemToInventory(currentId, 1)) {
    logMessage("インベントリがいっぱいです。");
    return false;
  }
  
  playerEquipment[slot] = null;
  
  logMessage(`${item.name} を外した。`);
  updateStatus();
  saveOnAction();
  
  return true;
}
```

### Task 6.3: 装備ステータス計算

```javascript
// スキル効果計算に装備効果を追加
function calculateEffectiveStats() {
  // 基礎ステータス
  const stats = {
    hp: player.baseHp,
    mp: player.baseMp,
    atk: player.baseAtk,
    def: player.baseDef,
    critRate: 5,
    critDamage: 150,
    // ...その他
  };
  
  // 装備効果を適用
  for (const slot of Object.keys(playerEquipment)) {
    const equipped = getEquippedItem(slot);
    if (equipped && equipped.stats) {
      for (const [stat, value] of Object.entries(equipped.stats)) {
        if (stat in stats) {
          stats[stat] += value;
        }
      }
    }
  }
  
  // スキル効果を適用
  const unlockedSkills = skillTree.filter(s => s.unlocked);
  unlockedSkills.forEach(skill => {
    const effect = getSkillEffect(skill);
    if (effect.passive) {
      applyPassiveEffect(stats, effect.passive);
    }
  });
  
  // %ボーナスを適用
  // ...
  
  return stats;
}
```

### Task 6.4: 装備特殊効果

```javascript
const equipmentEffects = {
  // 攻撃時効果
  fire_damage: {
    trigger: "onHit",
    execute: (value, target) => {
      const damage = value;
      applyDamage(target, damage, false);
      battleLog(`炎の追加ダメージ！${damage}！`);
    }
  },
  
  life_steal: {
    trigger: "onHit",
    execute: (value, target, damageDealt) => {
      const heal = Math.floor(damageDealt * value / 100);
      player.currentHp = Math.min(getEffectiveStats().hp, player.currentHp + heal);
      battleLog(`生命吸収！HP${heal}回復！`);
    }
  },
  
  // ダメージ軽減効果
  damage_reduce: {
    trigger: "onHurt",
    execute: (value, damage) => {
      return Math.floor(damage * (100 - value) / 100);
    }
  }
};

// 攻撃時に装備効果を発動
function triggerEquipmentEffects(trigger, ...args) {
  for (const slot of Object.keys(playerEquipment)) {
    const equipped = getEquippedItem(slot);
    if (!equipped || !equipped.effects) continue;
    
    for (const effect of equipped.effects) {
      if (effect.type === trigger && equipmentEffects[effect.effect]) {
        equipmentEffects[effect.effect].execute(effect.value, ...args);
      }
    }
  }
}
```

### Task 6.5: 装備UI

```html
<!-- index.html に追加 -->
<section class="panel">
  <h2>装備</h2>
  <div class="equipment-slots">
    <div class="equipment-slot" data-slot="weapon">
      <span class="slot-label">武器</span>
      <div id="slot-weapon" class="slot-content">
        <span class="empty">未装備</span>
      </div>
    </div>
    <div class="equipment-slot" data-slot="armor">
      <span class="slot-label">防具</span>
      <div id="slot-armor" class="slot-content">
        <span class="empty">未装備</span>
      </div>
    </div>
    <div class="equipment-slot" data-slot="accessory">
      <span class="slot-label">アクセサリ</span>
      <div id="slot-accessory" class="slot-content">
        <span class="empty">未装備</span>
      </div>
    </div>
    <div class="equipment-slot" data-slot="shield">
      <span class="slot-label">盾</span>
      <div id="slot-shield" class="slot-content">
        <span class="empty">未装備</span>
      </div>
    </div>
  </div>
  <button id="open-equipment" class="ghost">装備変更</button>
</section>
```

### Task 6.6: 装備変更UI

```javascript
function renderEquipmentSlots() {
  for (const slot of ["weapon", "armor", "accessory", "shield"]) {
    const container = document.getElementById(`slot-${slot}`);
    const equipped = getEquippedItem(slot);
    
    if (equipped) {
      const rarity = rarityConfig[equipped.rarity];
      container.innerHTML = `
        <span class="equipped-name" style="color: ${rarity.color}">
          ${equipped.name}
        </span>
        <button class="unequip-btn" data-slot="${slot}">外す</button>
      `;
    } else {
      container.innerHTML = `<span class="empty">未装備</span>`;
    }
  }
}

function openEquipmentPanel(slot) {
  // 装備可能なアイテム一覧を表示
  const available = inventory.items
    .map(i => getItemById(i.itemId))
    .filter(item => item && item.category === "equipment" && item.equipment?.slot === slot);
  
  // UIに表示...
}
```

## 追加CSS

```css
.equipment-slots {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.equipment-slot {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 12px;
}

.slot-label {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
}

.slot-content {
  min-height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slot-content .empty {
  color: #475569;
  font-style: italic;
}

.equipped-name {
  font-weight: 600;
}

.unequip-btn {
  padding: 4px 8px;
  font-size: 12px;
  background: transparent;
  border: 1px solid #475569;
  color: #94a3b8;
}

/* レアリティ別の装備カード */
.equipment-card {
  border-left: 3px solid #9ca3af;
}

.equipment-card.uncommon {
  border-left-color: #22c55e;
}

.equipment-card.rare {
  border-left-color: #3b82f6;
}

.equipment-card.epic {
  border-left-color: #a855f7;
}

.equipment-card.legendary {
  border-left-color: #f59e0b;
  background: linear-gradient(135deg, #1e293b, #2d2410);
}
```

## テスト項目

- [ ] 装備を装着できる
- [ ] 装備を外せる
- [ ] 装備でステータスが反映される
- [ ] レベル制限が機能する
- [ ] 装備中アイテムはインベントリから減る
- [ ] 装備を外すとインベントリに戻る
- [ ] 特殊効果が戦闘で発動する
- [ ] セーブ/ロードで装備状態が保持される

## 完了条件

1. 4スロットの装備システムが機能する
2. 装備でステータスが変化する
3. レアリティによる視覚的な区別がある
4. 戦闘システムと連携する
