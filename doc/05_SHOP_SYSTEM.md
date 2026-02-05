# 05. ショップ機能

## 概要

ゴールドを使ってアイテムや装備を購入できるショップシステムを実装する。

## 目的

- ゴールドの使い道を作る
- 回復アイテムで戦闘の幅を広げる
- 装備システムへの導線

## ショップの種類

| ショップ | 取扱商品 | 解放条件 |
|----------|----------|----------|
| 雑貨店 | 回復アイテム、素材 | 初期から利用可能 |
| 武器店 | 武器、防具 | レベル5以上 |
| 魔法店 | 魔法触媒、スキル書 | レベル10以上 |

## データ構造

### 商品データ
```javascript
const shopItem = {
  id: "potion_hp_small",
  name: "小さなポーション",
  description: "HPを30回復する。",
  category: "consumable",  // consumable | equipment | material
  price: 50,
  sellPrice: 25,           // 売却価格
  
  // 消費アイテムの場合
  effect: {
    type: "heal",
    stat: "hp",
    value: 30
  },
  
  // 装備の場合
  equipment: {
    slot: "weapon",
    stats: { atk: 5 }
  },
  
  // 購入制限
  maxStack: 99,            // 最大所持数
  levelRequired: 1         // 必要レベル
};
```

### プレイヤーインベントリ
```javascript
const inventory = {
  items: [
    { itemId: "potion_hp_small", quantity: 5 },
    { itemId: "potion_mp_small", quantity: 3 }
  ],
  maxSlots: 50
};
```

## 商品データ一覧

### 雑貨店

```javascript
const generalShopItems = [
  // 回復アイテム
  {
    id: "potion_hp_small",
    name: "小さなポーション",
    description: "HPを30回復する。",
    category: "consumable",
    price: 50,
    sellPrice: 25,
    effect: { type: "heal", stat: "hp", value: 30 },
    maxStack: 99,
    levelRequired: 1
  },
  {
    id: "potion_hp_medium",
    name: "ポーション",
    description: "HPを80回復する。",
    category: "consumable",
    price: 150,
    sellPrice: 75,
    effect: { type: "heal", stat: "hp", value: 80 },
    maxStack: 99,
    levelRequired: 5
  },
  {
    id: "potion_hp_large",
    name: "大きなポーション",
    description: "HPを200回復する。",
    category: "consumable",
    price: 400,
    sellPrice: 200,
    effect: { type: "heal", stat: "hp", value: 200 },
    maxStack: 99,
    levelRequired: 10
  },
  {
    id: "potion_mp_small",
    name: "小さなエーテル",
    description: "MPを15回復する。",
    category: "consumable",
    price: 80,
    sellPrice: 40,
    effect: { type: "heal", stat: "mp", value: 15 },
    maxStack: 99,
    levelRequired: 1
  },
  {
    id: "potion_mp_medium",
    name: "エーテル",
    description: "MPを40回復する。",
    category: "consumable",
    price: 250,
    sellPrice: 125,
    effect: { type: "heal", stat: "mp", value: 40 },
    maxStack: 99,
    levelRequired: 5
  },
  {
    id: "antidote",
    name: "解毒剤",
    description: "毒状態を治療する。",
    category: "consumable",
    price: 30,
    sellPrice: 15,
    effect: { type: "cure", status: "poison" },
    maxStack: 99,
    levelRequired: 1
  },
  {
    id: "escape_smoke",
    name: "煙玉",
    description: "戦闘から確実に逃走できる。",
    category: "consumable",
    price: 100,
    sellPrice: 50,
    effect: { type: "escape", guaranteed: true },
    maxStack: 20,
    levelRequired: 3
  }
];
```

### 武器店

```javascript
const weaponShopItems = [
  // 武器
  {
    id: "sword_iron",
    name: "鉄の剣",
    description: "一般的な鉄製の剣。",
    category: "equipment",
    price: 300,
    sellPrice: 150,
    equipment: { slot: "weapon", stats: { atk: 8 } },
    levelRequired: 1
  },
  {
    id: "sword_steel",
    name: "鋼の剣",
    description: "より硬い鋼で作られた剣。",
    category: "equipment",
    price: 800,
    sellPrice: 400,
    equipment: { slot: "weapon", stats: { atk: 15 } },
    levelRequired: 5
  },
  {
    id: "sword_silver",
    name: "白銀の剣",
    description: "魔物に効果的な銀製の剣。",
    category: "equipment",
    price: 2000,
    sellPrice: 1000,
    equipment: { slot: "weapon", stats: { atk: 25, magicPower: 5 } },
    levelRequired: 10
  },
  
  // 防具
  {
    id: "armor_leather",
    name: "革の鎧",
    description: "軽くて動きやすい革鎧。",
    category: "equipment",
    price: 200,
    sellPrice: 100,
    equipment: { slot: "armor", stats: { def: 5, hp: 20 } },
    levelRequired: 1
  },
  {
    id: "armor_chain",
    name: "チェインメイル",
    description: "鎖を編んで作られた鎧。",
    category: "equipment",
    price: 600,
    sellPrice: 300,
    equipment: { slot: "armor", stats: { def: 12, hp: 50 } },
    levelRequired: 5
  },
  {
    id: "armor_plate",
    name: "プレートアーマー",
    description: "重厚な金属製の鎧。",
    category: "equipment",
    price: 1500,
    sellPrice: 750,
    equipment: { slot: "armor", stats: { def: 22, hp: 100 } },
    levelRequired: 10
  },
  
  // アクセサリ
  {
    id: "ring_power",
    name: "力の指輪",
    description: "攻撃力を高める魔法の指輪。",
    category: "equipment",
    price: 500,
    sellPrice: 250,
    equipment: { slot: "accessory", stats: { atk: 5 } },
    levelRequired: 3
  },
  {
    id: "ring_guard",
    name: "守りの指輪",
    description: "防御力を高める魔法の指輪。",
    category: "equipment",
    price: 500,
    sellPrice: 250,
    equipment: { slot: "accessory", stats: { def: 5 } },
    levelRequired: 3
  }
];
```

### 魔法店

```javascript
const magicShopItems = [
  {
    id: "catalyst_fire",
    name: "火炎触媒",
    description: "炎属性スキルの効果を高める触媒。",
    category: "material",
    price: 400,
    sellPrice: 200,
    maxStack: 50,
    levelRequired: 10
  },
  {
    id: "catalyst_ice",
    name: "氷結触媒",
    description: "氷属性スキルの効果を高める触媒。",
    category: "material",
    price: 400,
    sellPrice: 200,
    maxStack: 50,
    levelRequired: 10
  },
  {
    id: "skillbook_heal",
    name: "スキル書:ヒール",
    description: "支援系統スキルの解放に必要な古文書。",
    category: "consumable",
    price: 800,
    sellPrice: 400,
    effect: { type: "unlock_skill", skillId: "support-1-1" },
    maxStack: 5,
    levelRequired: 12
  },
  {
    id: "skillbook_fire",
    name: "スキル書:ファイア",
    description: "元素魔法スキルの解放に必要な古文書。",
    category: "consumable",
    price: 900,
    sellPrice: 450,
    effect: { type: "unlock_skill", skillId: "magic-1-1" },
    maxStack: 5,
    levelRequired: 12
  }
];
```

## 実装タスク

### Task 5.1: ショップデータモジュール
**ファイル**: `js/shop.js`（新規作成）

```javascript
const allShopItems = [
  ...generalShopItems,
  ...weaponShopItems,
  ...magicShopItems
];

// IDでアイテム取得
function getItemById(id) {
  return allShopItems.find(item => item.id === id);
}

// ショップの商品リスト取得（レベルフィルタ適用）
function getAvailableItems(shopType, playerLevel) {
  let items;
  switch (shopType) {
    case "general":
      items = generalShopItems;
      break;
    case "weapon":
      items = weaponShopItems;
      break;
    case "magic":
      items = magicShopItems;
      break;
    default:
      items = [];
  }
  
  return items.filter(item => item.levelRequired <= playerLevel);
}
```

### Task 5.2: 購入機能

```javascript
function buyItem(itemId, quantity = 1) {
  const item = getItemById(itemId);
  if (!item) {
    logMessage("アイテムが見つかりません。");
    return false;
  }
  
  const totalPrice = item.price * quantity;
  
  // 所持金チェック
  if (player.gold < totalPrice) {
    logMessage("ゴールドが足りません。");
    return false;
  }
  
  // レベルチェック
  if (player.level < item.levelRequired) {
    logMessage(`レベル${item.levelRequired}以上が必要です。`);
    return false;
  }
  
  // 所持数チェック
  const currentQuantity = getItemQuantity(itemId);
  if (currentQuantity + quantity > item.maxStack) {
    logMessage("これ以上持てません。");
    return false;
  }
  
  // 購入処理
  player.gold -= totalPrice;
  addItemToInventory(itemId, quantity);
  
  logMessage(`${item.name} を${quantity}個購入した。(-${totalPrice}G)`);
  updateStatus();
  saveOnAction();
  
  return true;
}
```

### Task 5.3: 売却機能

```javascript
function sellItem(itemId, quantity = 1) {
  const item = getItemById(itemId);
  if (!item) return false;
  
  const currentQuantity = getItemQuantity(itemId);
  if (currentQuantity < quantity) {
    logMessage("アイテムが足りません。");
    return false;
  }
  
  const totalPrice = item.sellPrice * quantity;
  
  // 売却処理
  removeItemFromInventory(itemId, quantity);
  player.gold += totalPrice;
  
  logMessage(`${item.name} を${quantity}個売却した。(+${totalPrice}G)`);
  updateStatus();
  saveOnAction();
  
  return true;
}
```

### Task 5.4: インベントリ管理

```javascript
const inventory = {
  items: [],
  maxSlots: 50
};

function getItemQuantity(itemId) {
  const slot = inventory.items.find(i => i.itemId === itemId);
  return slot ? slot.quantity : 0;
}

function addItemToInventory(itemId, quantity) {
  const slot = inventory.items.find(i => i.itemId === itemId);
  
  if (slot) {
    slot.quantity += quantity;
  } else {
    if (inventory.items.length >= inventory.maxSlots) {
      logMessage("インベントリがいっぱいです。");
      return false;
    }
    inventory.items.push({ itemId, quantity });
  }
  
  return true;
}

function removeItemFromInventory(itemId, quantity) {
  const slotIndex = inventory.items.findIndex(i => i.itemId === itemId);
  if (slotIndex === -1) return false;
  
  const slot = inventory.items[slotIndex];
  slot.quantity -= quantity;
  
  if (slot.quantity <= 0) {
    inventory.items.splice(slotIndex, 1);
  }
  
  return true;
}
```

### Task 5.5: アイテム使用

```javascript
function useItem(itemId) {
  const item = getItemById(itemId);
  if (!item || item.category !== "consumable") {
    return false;
  }
  
  if (getItemQuantity(itemId) < 1) {
    logMessage("アイテムがありません。");
    return false;
  }
  
  // 効果発動
  applyItemEffect(item.effect);
  
  // 消費
  removeItemFromInventory(itemId, 1);
  
  logMessage(`${item.name} を使用した。`);
  updateStatus();
  
  return true;
}

function applyItemEffect(effect) {
  const stats = getEffectiveStats();
  
  switch (effect.type) {
    case "heal":
      if (effect.stat === "hp") {
        player.currentHp = Math.min(stats.hp, player.currentHp + effect.value);
        logMessage(`HPが${effect.value}回復した。`);
      } else if (effect.stat === "mp") {
        player.currentMp = Math.min(stats.mp, player.currentMp + effect.value);
        logMessage(`MPが${effect.value}回復した。`);
      }
      break;
      
    case "cure":
      // 状態異常治療（将来実装）
      break;
      
    case "escape":
      if (battleState.active && effect.guaranteed) {
        endBattle(false);
        logMessage("煙玉で逃走に成功した！");
      }
      break;
  }
}
```

### Task 5.6: ショップUI

```html
<!-- index.html に追加 -->
<div id="shop-overlay" class="shop-overlay hidden">
  <div class="shop-container">
    <div class="shop-header">
      <h2>🏪 ショップ</h2>
      <span id="shop-gold">所持金: 0G</span>
      <button id="close-shop" class="ghost">✕</button>
    </div>
    
    <div class="shop-tabs">
      <button class="tab active" data-shop="general">雑貨店</button>
      <button class="tab" data-shop="weapon">武器店</button>
      <button class="tab" data-shop="sell">売却</button>
    </div>
    
    <div class="shop-content">
      <div id="shop-items" class="shop-items"></div>
    </div>
    
    <!-- アイテム詳細 -->
    <div id="shop-detail" class="shop-detail hidden">
      <h3 id="shop-detail-name"></h3>
      <p id="shop-detail-desc"></p>
      <p id="shop-detail-stats"></p>
      <div class="shop-detail-actions">
        <input type="number" id="shop-quantity" value="1" min="1" max="99">
        <button id="shop-buy">購入</button>
      </div>
    </div>
  </div>
</div>
```

### Task 5.7: ショップUIロジック

```javascript
let currentShopTab = "general";
let selectedShopItem = null;

function openShop() {
  document.getElementById("shop-overlay").classList.remove("hidden");
  updateShopGold();
  renderShopItems();
}

function closeShop() {
  document.getElementById("shop-overlay").classList.add("hidden");
}

function updateShopGold() {
  document.getElementById("shop-gold").textContent = `所持金: ${player.gold}G`;
}

function renderShopItems() {
  const container = document.getElementById("shop-items");
  container.innerHTML = "";
  
  let items;
  if (currentShopTab === "sell") {
    // インベントリを表示
    items = inventory.items.map(slot => ({
      ...getItemById(slot.itemId),
      owned: slot.quantity
    }));
  } else {
    items = getAvailableItems(currentShopTab, player.level);
  }
  
  items.forEach(item => {
    const card = document.createElement("button");
    card.className = "shop-item-card";
    card.innerHTML = `
      <strong>${item.name}</strong>
      <span class="price">${currentShopTab === "sell" ? item.sellPrice : item.price}G</span>
      ${item.owned ? `<span class="owned">所持: ${item.owned}</span>` : ""}
    `;
    card.addEventListener("click", () => selectShopItem(item));
    container.appendChild(card);
  });
}

function selectShopItem(item) {
  selectedShopItem = item;
  
  const detail = document.getElementById("shop-detail");
  detail.classList.remove("hidden");
  
  document.getElementById("shop-detail-name").textContent = item.name;
  document.getElementById("shop-detail-desc").textContent = item.description;
  
  // ステータス効果を表示
  let statsText = "";
  if (item.effect) {
    statsText = `効果: ${item.effect.stat?.toUpperCase() || ""} +${item.effect.value || ""}`;
  } else if (item.equipment) {
    statsText = Object.entries(item.equipment.stats)
      .map(([k, v]) => `${k.toUpperCase()}+${v}`)
      .join(", ");
  }
  document.getElementById("shop-detail-stats").textContent = statsText;
  
  // ボタンテキスト
  document.getElementById("shop-buy").textContent = 
    currentShopTab === "sell" ? "売却" : "購入";
}

// イベントリスナー
document.getElementById("shop-buy").addEventListener("click", () => {
  const quantity = parseInt(document.getElementById("shop-quantity").value);
  
  if (currentShopTab === "sell") {
    sellItem(selectedShopItem.id, quantity);
  } else {
    buyItem(selectedShopItem.id, quantity);
  }
  
  updateShopGold();
  renderShopItems();
});
```

## 追加CSS

```css
.shop-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.shop-overlay.hidden {
  display: none;
}

.shop-container {
  background: #121826;
  border-radius: 20px;
  padding: 24px;
  width: min(90vw, 600px);
  max-height: 85vh;
  overflow-y: auto;
}

.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.shop-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.shop-tabs .tab {
  flex: 1;
  padding: 10px;
  background: #1e293b;
  border: none;
  border-radius: 8px;
  color: #94a3b8;
  cursor: pointer;
}

.shop-tabs .tab.active {
  background: #4f46e5;
  color: white;
}

.shop-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.shop-item-card {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 12px;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s;
}

.shop-item-card:hover {
  border-color: #4f46e5;
}

.shop-item-card strong {
  display: block;
  margin-bottom: 4px;
}

.shop-item-card .price {
  color: #f59e0b;
  font-size: 14px;
}

.shop-item-card .owned {
  display: block;
  font-size: 12px;
  color: #64748b;
}

.shop-detail {
  background: #0f172a;
  border-radius: 12px;
  padding: 16px;
}

.shop-detail-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.shop-detail-actions input {
  width: 80px;
}
```

## テスト項目

- [ ] ショップが開閉できる
- [ ] 商品一覧が表示される
- [ ] 購入でゴールドが減りアイテムが増える
- [ ] 売却でアイテムが減りゴールドが増える
- [ ] 所持金不足で購入できない
- [ ] レベル制限が機能する
- [ ] 最大所持数制限が機能する

## 完了条件

1. 雑貨店・武器店が機能する
2. 購入・売却が正常に動作する
3. インベントリとの連携ができている
4. セーブ/ロードでアイテムが保持される
