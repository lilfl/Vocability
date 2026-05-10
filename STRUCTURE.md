# Vocability — ファイル構成・役割一覧

英語単語学習アプリ。Notion データベースを語彙ストア、OpenAI (GPT-4o) をメタデータ生成、SM-2 アルゴリズムを間隔反復学習に用いる。

---

## ルート直下

| ファイル | 役割 |
|---|---|
| `index.html` | React アプリのエントリー HTML。Google Fonts (DM Serif / Sans / Mono) を読み込む |
| `package.json` | 依存関係・スクリプト定義。主要ライブラリ: React 18、React Router 6、Framer Motion、OpenAI SDK、Vite |
| `vite.config.js` | Vite ビルド設定。`/notion-api` と `/openai-api` のプロキシを定義し CORS を回避する |
| `README.md` | セットアップ手順・使い方ドキュメント（日本語）。Notion DB スキーマや SM-2 評価基準を記載 |

---

## `src/`

| ファイル | 役割 |
|---|---|
| `main.jsx` | React アプリのエントリーポイント。`BrowserRouter` と `SettingsProvider` でアプリをラップし DOM にマウント |
| `App.jsx` | ルーティング定義。`/`・`/quiz`・`/add`・`/settings` の 4 ルートを `Navbar` と組み合わせて構成 |

### `src/styles/`

| ファイル | 役割 |
|---|---|
| `global.css` | グローバルデザインシステム。CSS 変数でカラーパレット (ink / paper / accent / teal / gold)、タイポグラフィ、スペーシング、難易度・品詞タグのベーススタイルを定義 |

---

### `src/lib/` — ロジック・ユーティリティ

| ファイル | 役割 |
|---|---|
| `SettingsContext.jsx` | API 認証情報 (Notion Token / DB ID / OpenAI Key) を `localStorage` で管理する React Context と `useSettings()` フックを提供 |
| `notion.js` | Notion API クライアントラッパー。DB クエリ・ページ作成・更新・プロパティのパース／ビルド関数を集約 |
| `openai.js` | OpenAI 連携。`generateVocabMetadata()` が GPT-4o を呼び出し、単語リストから 21 項目の語彙メタデータ (意味・例文・品詞・難易度・音声 URL・感情トーンなど) を JSON で生成 |
| `sm2.js` | SM-2 間隔反復アルゴリズム実装。`sm2()` で次回復習間隔を計算、`isDue()` で当日復習対象を判定、`daysUntilDue()` で残日数を返す |

---

### `src/components/layout/` — 共通 UI

| ファイル | 役割 |
|---|---|
| `Navbar.jsx` | スティッキーヘッダー。ロゴ + Home / Quiz / Add / Settings へのナビリンクをアクティブ状態付きで表示 |
| `Navbar.module.css` | Navbar のスタイル。スティッキー配置・アクティブリンクの濃色背景・ホバーアニメーション |

---

### `src/pages/` — 各画面

| ファイル | 役割 |
|---|---|
| `HomePage.jsx` | トップページ。Notion から全語彙を取得してクイズ実施数・追加数・統計 (総単語数・本日分・新規・習得済み) を表示。未設定時はセットアップ誘導バナーを出す |
| `HomePage.module.css` | ヒーローバナー・アクションカード・統計グリッドのレイアウトとスタイル |
| `QuizPage.jsx` | 間隔反復クイズ画面。カードのフリップアニメーション (表: 単語/音声、裏: 意味/例文/タグ)、0〜5 の品質評価ボタン、SM-2 計算後 Notion 更新、不正解カードの再キュー、セッション進捗バーを実装 |
| `QuizPage.module.css` | カードの 3D フリップ・進捗バー・品質ボタンのカラーテーマ・完了画面のスタイル |
| `AddPage.jsx` | 語彙追加画面。テキスト入力または `.txt` ファイルアップロード → AI でメタデータ生成 → カード展開して編集 → Notion に一括保存。SM-2 の初期値もここで設定 |
| `AddPage.module.css` | テキストエリア・AI 生成ボタン・展開カード・マルチ選択チップ・保存ボタンのスタイル |
| `SettingsPage.jsx` | 設定画面。Notion Token / DB ID / OpenAI API Key の入力フォーム。パスワード表示トグル付き。`SettingsContext` 経由で `localStorage` に保存 |
| `SettingsPage.module.css` | 設定フォームのレイアウト・入力欄・保存成功アニメーションのスタイル |

---

## ファイルツリー

```
vocability/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── styles/
    │   └── global.css
    ├── lib/
    │   ├── SettingsContext.jsx
    │   ├── notion.js
    │   ├── openai.js
    │   └── sm2.js
    ├── components/
    │   └── layout/
    │       ├── Navbar.jsx
    │       └── Navbar.module.css
    └── pages/
        ├── HomePage.jsx
        ├── HomePage.module.css
        ├── QuizPage.jsx
        ├── QuizPage.module.css
        ├── AddPage.jsx
        ├── AddPage.module.css
        ├── SettingsPage.jsx
        └── SettingsPage.module.css
```
