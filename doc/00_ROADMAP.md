# SkillTreeMax 機能拡張ロードマップ

## 概要

本ドキュメントは、SkillTreeMaxをゲームとして完成させるための機能拡張計画をまとめたものです。

## 現状の課題

| カテゴリ | 問題点 |
|----------|--------|
| データ永続化 | セーブ機能がなく、リロードで進捗消失 |
| スキルシステム | 4,608個のスキルに実効果がない |
| 戦闘システム | 敵が存在せず、戦闘の概念がない |
| 経済システム | ゴールドの使い道がない |
| 進行システム | クエストが単調、目標がない |

## 実装フェーズ

### Phase 1: 基盤整備（必須）
- [01_SAVE_SYSTEM.md](./01_SAVE_SYSTEM.md) - セーブ/ロード機能
- [02_SKILL_EFFECTS.md](./02_SKILL_EFFECTS.md) - スキル効果システム

### Phase 2: コアゲームプレイ（重要）
- [03_BATTLE_SYSTEM.md](./03_BATTLE_SYSTEM.md) - 戦闘システム
- [04_ENEMY_DATA.md](./04_ENEMY_DATA.md) - 敵・モンスターデータ

### Phase 3: 経済・成長（拡張）
- [05_SHOP_SYSTEM.md](./05_SHOP_SYSTEM.md) - ショップ機能
- [06_EQUIPMENT_SYSTEM.md](./06_EQUIPMENT_SYSTEM.md) - 装備システム

### Phase 4: コンテンツ（追加要素）
- [07_QUEST_SYSTEM.md](./07_QUEST_SYSTEM.md) - クエスト拡張
- [08_ACHIEVEMENT_SYSTEM.md](./08_ACHIEVEMENT_SYSTEM.md) - 実績システム

## 実装優先度マトリクス

```
重要度 高
    │
    │  [セーブ機能]    [戦闘システム]
    │  [スキル効果]    [敵データ]
    │
    │  [ショップ]      [クエスト拡張]
    │  [装備]          [実績]
    │
重要度 低 ─────────────────────────────
         実装難易度 低    実装難易度 高
```

## 技術方針

- **フレームワーク**: 引き続きVanilla JSを使用
- **データ保存**: LocalStorage API
- **モジュール化**: 機能ごとにファイル分割を検討
- **後方互換性**: 既存のUI/UXを維持しつつ拡張

## ファイル構成（実装後の想定）

```
SkillTreeMax/
├── index.html
├── style.css
├── app.js              # メインエントリ
├── js/
│   ├── save.js         # セーブ/ロード
│   ├── skills.js       # スキル効果
│   ├── battle.js       # 戦闘ロジック
│   ├── enemies.js      # 敵データ
│   ├── shop.js         # ショップ
│   └── quests.js       # クエスト
└── doc/
    └── （本ドキュメント群）
```
