# 01. セーブ/ロード機能

## 概要

LocalStorageを使用してゲームの進行状況を保存・復元する機能を実装する。

## 目的

- プレイヤーの進捗を永続化
- ブラウザを閉じても続きから遊べる
- 複数セーブスロット対応（将来拡張）

## 保存対象データ

### プレイヤーデータ
```javascript
const saveData = {
  version: "1.0.0",           // セーブデータバージョン
  timestamp: Date.now(),       // 保存日時
  player: {
    level: 1,
    exp: 0,
    expToNext: 100,
    hp: 120,
    maxHp: 120,               // 追加: 最大HP
    mp: 60,
    maxMp: 60,                // 追加: 最大MP
    atk: 14,
    def: 10,
    gold: 120,
    skillPoints: 4,
    title: "芽吹く探究者"
  },
  unlockedSkills: ["sword-1-1", "magic-1-1"],  // 解放済みスキルIDの配列
  statistics: {               // 統計情報（将来拡張）
    totalPlayTime: 0,
    questsCompleted: 0,
    enemiesDefeated: 0
  }
};
```

## 実装タスク

### Task 1.1: セーブ機能の実装
**ファイル**: `js/save.js`（新規作成）

```javascript
const SAVE_KEY = "skilltreemax_save";
const SAVE_VERSION = "1.0.0";

function createSaveData() {
  return {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    player: { ...player },
    unlockedSkills: skillTree
      .filter(s => s.unlocked)
      .map(s => s.id),
    statistics: { ...statistics }
  };
}

function saveGame() {
  try {
    const data = createSaveData();
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    logMessage("ゲームをセーブしました。");
    return true;
  } catch (e) {
    logMessage("セーブに失敗しました。");
    console.error(e);
    return false;
  }
}
```

### Task 1.2: ロード機能の実装

```javascript
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      logMessage("セーブデータがありません。");
      return false;
    }
    
    const data = JSON.parse(raw);
    
    // バージョンチェック（将来のマイグレーション用）
    if (data.version !== SAVE_VERSION) {
      data = migrateData(data);
    }
    
    // プレイヤーデータ復元
    Object.assign(player, data.player);
    
    // スキル解放状態復元
    skillTree.forEach(skill => {
      skill.unlocked = data.unlockedSkills.includes(skill.id);
    });
    
    // UI更新
    updateStatus();
    updateHeader();
    renderSkillTree("", "all");
    
    logMessage("セーブデータをロードしました。");
    return true;
  } catch (e) {
    logMessage("ロードに失敗しました。");
    console.error(e);
    return false;
  }
}
```

### Task 1.3: 自動セーブの実装

```javascript
const AUTO_SAVE_INTERVAL = 60000; // 1分ごと

function startAutoSave() {
  setInterval(() => {
    saveGame();
    console.log("Auto-saved at", new Date().toLocaleTimeString());
  }, AUTO_SAVE_INTERVAL);
}

// 重要なアクション時にも自動セーブ
function saveOnAction() {
  // デバウンス処理で頻繁なセーブを防ぐ
  clearTimeout(saveOnAction.timer);
  saveOnAction.timer = setTimeout(saveGame, 2000);
}
```

### Task 1.4: UIへのセーブ/ロードボタン追加
**ファイル**: `index.html`

```html
<!-- ステータスパネルのactions内に追加 -->
<div class="actions">
  <button id="adventure-button">クエストに挑戦</button>
  <button id="rest-button" class="ghost">キャンプで休息</button>
</div>
<div class="actions save-actions">
  <button id="save-button" class="ghost">💾 セーブ</button>
  <button id="load-button" class="ghost">📂 ロード</button>
  <button id="reset-button" class="ghost danger">🗑️ リセット</button>
</div>
```

### Task 1.5: セーブデータ削除（リセット）機能

```javascript
function resetGame() {
  if (!confirm("本当にセーブデータを削除しますか？この操作は取り消せません。")) {
    return;
  }
  
  localStorage.removeItem(SAVE_KEY);
  location.reload(); // ページをリロードして初期状態に
}
```

### Task 1.6: 初期化時の自動ロード
**ファイル**: `app.js` の `init()` 関数を修正

```javascript
function init() {
  createSkillTree();
  populateFilters();
  
  // セーブデータがあれば自動ロード
  if (localStorage.getItem(SAVE_KEY)) {
    loadGame();
  } else {
    updateStatus();
    updateHeader();
    renderSkillTree("", "all");
    logMessage("冒険の準備が整った。巨大なスキルツリーを解放しよう。");
  }
  
  // 自動セーブ開始
  startAutoSave();
  
  // イベントリスナー設定...
}
```

## テスト項目

- [ ] 手動セーブが正常に動作する
- [ ] ロードでプレイヤーステータスが復元される
- [ ] ロードでスキル解放状態が復元される
- [ ] 自動セーブが1分ごとに動作する
- [ ] リセットでセーブデータが削除される
- [ ] セーブデータがない状態で新規開始できる
- [ ] LocalStorageが使えない環境でエラーハンドリングされる

## 追加CSS

```css
.save-actions {
  margin-top: 8px;
  border-top: 1px solid #1e293b;
  padding-top: 12px;
}

button.danger {
  border-color: #ef4444;
  color: #ef4444;
}

button.danger:hover {
  background: #ef4444;
  color: white;
}
```

## 完了条件

1. セーブボタンでデータが保存される
2. ロードボタンで状態が復元される
3. ページリロード後も続きから遊べる
4. リセットで初期状態に戻せる
