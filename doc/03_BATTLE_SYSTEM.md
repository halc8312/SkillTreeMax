# 03. 戦闘システム

## 概要

ターン制の戦闘システムを実装し、スキルの活用場面を作る。

## 目的

- ゲームの核となる戦闘体験を提供
- スキルを使う意味を作る
- HP/MPの消費・回復サイクルを確立

## 戦闘フロー

```
┌─────────────────────────────────────────┐
│              戦闘開始                    │
│         敵の情報を表示                   │
└─────────────────┬───────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│           プレイヤーターン               │
│  ┌─────────────────────────────────┐    │
│  │ アクション選択                   │    │
│  │ • 攻撃（通常攻撃）              │    │
│  │ • スキル（解放済みアクティブ）   │    │
│  │ • 防御（ダメージ50%軽減）       │    │
│  │ • アイテム（将来実装）          │    │
│  │ • 逃走（確率で成功）            │    │
│  └─────────────────────────────────┘    │
└─────────────────┬───────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│             敵ターン                     │
│         敵がアクションを実行             │
└─────────────────┬───────────────────────┘
                  ▼
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│  敵HP <= 0    │   │ プレイヤー    │
│    勝利！     │   │  HP <= 0      │
│  報酬獲得     │   │   敗北...     │
└───────────────┘   └───────────────┘
```

## データ構造

### 戦闘状態
```javascript
const battleState = {
  active: false,
  turn: 0,
  phase: "player", // "player" | "enemy" | "result"
  
  enemy: null,
  enemyCurrentHp: 0,
  
  playerDefending: false,
  playerBuffs: [],    // { stat, value, turnsLeft }
  enemyDebuffs: [],
  
  log: []
};
```

### 戦闘アクション
```javascript
const battleActions = {
  attack: {
    name: "攻撃",
    description: "通常攻撃を行う",
    execute: (attacker, defender) => {
      const damage = calculateDamage(attacker.atk, defender.def);
      return { type: "damage", value: damage };
    }
  },
  
  defend: {
    name: "防御",
    description: "防御態勢を取り、受けるダメージを半減",
    execute: () => {
      battleState.playerDefending = true;
      return { type: "defend" };
    }
  },
  
  escape: {
    name: "逃走",
    description: "戦闘から逃げる（成功率は敵により変動）",
    execute: (player, enemy) => {
      const baseRate = 50;
      const levelDiff = player.level - enemy.level;
      const successRate = Math.min(95, Math.max(5, baseRate + levelDiff * 10));
      const success = Math.random() * 100 < successRate;
      return { type: "escape", success };
    }
  }
};
```

## 実装タスク

### Task 3.1: 戦闘状態管理
**ファイル**: `js/battle.js`（新規作成）

```javascript
const battleState = {
  active: false,
  turn: 0,
  phase: "player",
  enemy: null,
  enemyCurrentHp: 0,
  playerDefending: false,
  playerBuffs: [],
  enemyDebuffs: []
};

function startBattle(enemy) {
  battleState.active = true;
  battleState.turn = 1;
  battleState.phase = "player";
  battleState.enemy = enemy;
  battleState.enemyCurrentHp = enemy.hp;
  battleState.playerDefending = false;
  battleState.playerBuffs = [];
  battleState.enemyDebuffs = [];
  
  showBattleUI();
  battleLog(`${enemy.name} が現れた！`);
}

function endBattle(victory) {
  battleState.active = false;
  
  if (victory) {
    grantBattleRewards();
  } else {
    handleDefeat();
  }
  
  hideBattleUI();
}
```

### Task 3.2: ダメージ計算

```javascript
function calculateDamage(attackerAtk, defenderDef, skillPower = 100) {
  // 基本ダメージ = 攻撃力 × (スキル威力/100) - 防御力/2
  const baseDamage = attackerAtk * (skillPower / 100) - defenderDef / 2;
  
  // 最低ダメージ保証
  const minDamage = Math.max(1, Math.floor(attackerAtk * 0.1));
  
  // ランダム変動（90%〜110%）
  const variance = 0.9 + Math.random() * 0.2;
  
  return Math.max(minDamage, Math.floor(baseDamage * variance));
}

function calculateCritical(critRate, critDamage) {
  const isCrit = Math.random() * 100 < critRate;
  return {
    isCrit,
    multiplier: isCrit ? critDamage / 100 : 1
  };
}

function applyDamage(target, damage, isCrit) {
  // 防御中はダメージ半減
  if (target === "player" && battleState.playerDefending) {
    damage = Math.floor(damage / 2);
    battleLog("防御でダメージを軽減！");
  }
  
  if (target === "player") {
    player.currentHp = Math.max(0, player.currentHp - damage);
  } else {
    battleState.enemyCurrentHp = Math.max(0, battleState.enemyCurrentHp - damage);
  }
  
  const critText = isCrit ? "クリティカル！" : "";
  return { damage, critText };
}
```

### Task 3.3: プレイヤーアクション

```javascript
function playerAttack() {
  const stats = getEffectiveStats();
  const { isCrit, multiplier } = calculateCritical(stats.critRate, stats.critDamage);
  const damage = calculateDamage(stats.atk, battleState.enemy.def) * multiplier;
  
  const result = applyDamage("enemy", Math.floor(damage), isCrit);
  battleLog(`${result.critText}${battleState.enemy.name}に${result.damage}ダメージ！`);
  
  checkBattleEnd();
  if (battleState.active) {
    nextPhase();
  }
}

function playerDefend() {
  battleState.playerDefending = true;
  battleLog("防御態勢を取った。");
  nextPhase();
}

function playerUseSkill(skill) {
  const effect = getSkillEffect(skill);
  if (!effect.active) return;
  
  if (player.currentMp < effect.active.mpCost) {
    battleLog("MPが足りない！");
    return;
  }
  
  player.currentMp -= effect.active.mpCost;
  
  switch (effect.active.type) {
    case "attack":
      executeAttackSkill(skill, effect.active);
      break;
    case "heal":
      executeHealSkill(skill, effect.active);
      break;
    case "buff":
      executeBuffSkill(skill, effect.active);
      break;
  }
  
  updateBattleUI();
  checkBattleEnd();
  if (battleState.active) {
    nextPhase();
  }
}

function executeAttackSkill(skill, active) {
  const stats = getEffectiveStats();
  const damage = calculateDamage(stats.atk, battleState.enemy.def, active.power);
  
  applyDamage("enemy", damage, false);
  battleLog(`${skill.name}！${battleState.enemy.name}に${damage}ダメージ！`);
}

function executeHealSkill(skill, active) {
  const stats = getEffectiveStats();
  const healAmount = active.power + Math.floor(stats.healBonus || 0);
  
  player.currentHp = Math.min(stats.hp, player.currentHp + healAmount);
  battleLog(`${skill.name}！HPが${healAmount}回復した！`);
}
```

### Task 3.4: 敵ターン処理

```javascript
function enemyTurn() {
  battleState.playerDefending = false;
  
  const enemy = battleState.enemy;
  const action = selectEnemyAction(enemy);
  
  switch (action.type) {
    case "attack":
      const damage = calculateDamage(enemy.atk, getEffectiveStats().def);
      applyDamage("player", damage, false);
      battleLog(`${enemy.name}の攻撃！${damage}ダメージを受けた！`);
      break;
      
    case "skill":
      executeEnemySkill(enemy, action.skill);
      break;
  }
  
  updateBattleUI();
  checkBattleEnd();
  
  if (battleState.active) {
    battleState.turn += 1;
    battleState.phase = "player";
    updateBuffDurations();
  }
}

function selectEnemyAction(enemy) {
  // シンプルなAI: 基本は通常攻撃
  // HPが低いと強力なスキルを使う確率UP
  const hpRatio = battleState.enemyCurrentHp / enemy.hp;
  
  if (enemy.skills && enemy.skills.length > 0 && hpRatio < 0.5) {
    if (Math.random() < 0.4) {
      return { type: "skill", skill: enemy.skills[0] };
    }
  }
  
  return { type: "attack" };
}
```

### Task 3.5: 戦闘UI

```html
<!-- index.html に追加 -->
<div id="battle-overlay" class="battle-overlay hidden">
  <div class="battle-container">
    <div class="battle-header">
      <h2>⚔️ 戦闘</h2>
      <span id="battle-turn">ターン 1</span>
    </div>
    
    <div class="battle-field">
      <!-- 敵情報 -->
      <div class="combatant enemy-side">
        <h3 id="enemy-name">スライム</h3>
        <div class="hp-bar">
          <div id="enemy-hp-fill" class="hp-fill"></div>
        </div>
        <span id="enemy-hp-text">30 / 30</span>
      </div>
      
      <!-- プレイヤー情報 -->
      <div class="combatant player-side">
        <h3>あなた</h3>
        <div class="hp-bar">
          <div id="player-hp-fill" class="hp-fill"></div>
        </div>
        <span id="player-hp-text">100 / 100</span>
        <div class="mp-bar">
          <div id="player-mp-fill" class="mp-fill"></div>
        </div>
        <span id="player-mp-text">50 / 50</span>
      </div>
    </div>
    
    <!-- 戦闘ログ -->
    <div id="battle-log" class="battle-log"></div>
    
    <!-- アクションボタン -->
    <div id="battle-actions" class="battle-actions">
      <button id="btn-attack">⚔️ 攻撃</button>
      <button id="btn-skill">✨ スキル</button>
      <button id="btn-defend">🛡️ 防御</button>
      <button id="btn-escape">🏃 逃走</button>
    </div>
    
    <!-- スキル選択パネル -->
    <div id="skill-select-panel" class="skill-select-panel hidden">
      <h4>スキルを選択</h4>
      <div id="skill-select-list"></div>
      <button id="skill-cancel" class="ghost">キャンセル</button>
    </div>
  </div>
</div>
```

### Task 3.6: 戦闘UI更新

```javascript
function showBattleUI() {
  document.getElementById("battle-overlay").classList.remove("hidden");
  updateBattleUI();
}

function hideBattleUI() {
  document.getElementById("battle-overlay").classList.add("hidden");
}

function updateBattleUI() {
  const stats = getEffectiveStats();
  const enemy = battleState.enemy;
  
  // ターン表示
  document.getElementById("battle-turn").textContent = `ターン ${battleState.turn}`;
  
  // 敵HP
  document.getElementById("enemy-name").textContent = enemy.name;
  document.getElementById("enemy-hp-text").textContent = 
    `${battleState.enemyCurrentHp} / ${enemy.hp}`;
  document.getElementById("enemy-hp-fill").style.width = 
    `${(battleState.enemyCurrentHp / enemy.hp) * 100}%`;
  
  // プレイヤーHP/MP
  document.getElementById("player-hp-text").textContent = 
    `${player.currentHp} / ${stats.hp}`;
  document.getElementById("player-hp-fill").style.width = 
    `${(player.currentHp / stats.hp) * 100}%`;
  
  document.getElementById("player-mp-text").textContent = 
    `${player.currentMp} / ${stats.mp}`;
  document.getElementById("player-mp-fill").style.width = 
    `${(player.currentMp / stats.mp) * 100}%`;
}

function battleLog(message) {
  const log = document.getElementById("battle-log");
  const line = document.createElement("p");
  line.textContent = message;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}
```

### Task 3.7: 報酬と敗北処理

```javascript
function grantBattleRewards() {
  const enemy = battleState.enemy;
  const stats = getEffectiveStats();
  
  // 経験値（ボーナス込み）
  const expGain = Math.floor(enemy.expReward * (1 + stats.expBonus / 100));
  player.exp += expGain;
  
  // ゴールド（ボーナス込み）
  const goldGain = Math.floor(enemy.goldReward * (1 + stats.goldBonus / 100));
  player.gold += goldGain;
  
  battleLog(`勝利！経験値+${expGain}、ゴールド+${goldGain}を獲得！`);
  
  // レベルアップチェック
  checkLevelUp();
  
  // ドロップアイテム（将来実装）
  if (enemy.drops) {
    checkItemDrop(enemy.drops);
  }
  
  updateStatus();
  saveOnAction();
}

function handleDefeat() {
  // ゴールドの10%を失う
  const goldLoss = Math.floor(player.gold * 0.1);
  player.gold -= goldLoss;
  
  // HPを1に
  player.currentHp = 1;
  
  battleLog(`敗北...ゴールドを${goldLoss}失った。`);
  logMessage("戦闘に敗北した...キャンプに戻された。");
  
  updateStatus();
  saveOnAction();
}
```

## 追加CSS

```css
.battle-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.battle-overlay.hidden {
  display: none;
}

.battle-container {
  background: #121826;
  border-radius: 20px;
  padding: 24px;
  width: min(90vw, 500px);
  max-height: 90vh;
  overflow-y: auto;
}

.battle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.battle-field {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.combatant {
  background: #0f172a;
  padding: 16px;
  border-radius: 12px;
}

.hp-bar, .mp-bar {
  height: 12px;
  background: #1e293b;
  border-radius: 6px;
  overflow: hidden;
  margin: 8px 0 4px;
}

.hp-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #16a34a);
  transition: width 0.3s ease;
}

.mp-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  transition: width 0.3s ease;
}

.battle-log {
  background: #0f172a;
  border-radius: 8px;
  padding: 12px;
  min-height: 100px;
  max-height: 150px;
  overflow-y: auto;
  margin-bottom: 16px;
  font-size: 14px;
}

.battle-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.skill-select-panel {
  margin-top: 16px;
  padding: 16px;
  background: #0f172a;
  border-radius: 12px;
}

.skill-select-panel.hidden {
  display: none;
}
```

## テスト項目

- [ ] 戦闘開始で敵情報が表示される
- [ ] 通常攻撃でダメージを与えられる
- [ ] スキル使用でMP消費・効果発動する
- [ ] 防御でダメージ軽減される
- [ ] 逃走が確率で成功/失敗する
- [ ] 敵を倒すと報酬がもらえる
- [ ] HP0で敗北処理される
- [ ] 戦闘終了でUIが閉じる

## 完了条件

1. ターン制戦闘が機能する
2. 4種類のアクション（攻撃/スキル/防御/逃走）が使える
3. 敵AIが動作する
4. 勝敗で適切な結果処理がされる
