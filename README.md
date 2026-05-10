# Vocability

英単語学習Webアプリ。NotionDB連携 + SM-2スペースド・リピティション + OpenAI自動メタデータ生成。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開く。

---

## Notion の準備

### A. Integration Token の取得

1. https://www.notion.so/my-integrations にアクセス
2. 「New integration」をクリック
3. 名前を設定し「Submit」→ **Internal Integration Token** をコピー

### B. データベースの準備

Notion DBに以下のプロパティを追加してください（型に注意）:

| プロパティ名 | 型 |
|---|---|
| Vocabulary | Title |
| Meaning | Rich Text |
| Example | Rich Text |
| Memo | Rich Text |
| CoreImage | Rich Text |
| Phonetic | Rich Text |
| SimilarSpelling | Rich Text |
| Paraphrase | Rich Text |
| AudioURL | URL |
| Difficulty | Select |
| POS | Select |
| Usage | Select |
| CasualLevel | Select |
| Frequency | Select |
| Type | Multi-select |
| Emotion/Tone | Multi-select |
| sm2_interval | Number |
| sm2_repetition | Number |
| sm2_easeFactor | Number |
| sm2_dueDate | Date |

### C. Integration をDBに接続

データベースページ右上「...」→「Connections」→ 作成したIntegrationを追加。

### D. Database ID の取得

DBのURLから取得:
```
https://www.notion.so/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...
                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                      これがDatabase ID
```

---

## アプリの設定

1. アプリを開き「Settings」ページへ
2. Notion Integration Token を入力
3. Notion Database ID を入力
4. OpenAI API Key を入力
5. 「Save Settings」をクリック

---

## 使い方

### Add Vocabulary

1. 単語をテキストエリアに入力（1行1単語、またはカンマ区切り）
2. または `.txt` ファイルをアップロード
3. 「Generate with AI」をクリック → GPT-4oが全プロパティを自動生成
4. 内容を確認・編集
5. 「Save all to Notion」でNotionDBに保存

### Quiz

- 当日分（sm2_dueDate <= 今日）のカードを自動ロード
- カードをタップで答えを表示
- 0〜5の6段階で評価 → SM-2アルゴリズムで次回出題日を自動計算
- 不正解（0-2）は当日セッション内で再出題

## SM-2 評価基準

| スコア | 意味 |
|---|---|
| 0 | 完全に忘れた |
| 1 | 間違えたが答えを見て思い出した |
| 2 | 間違えたが答えを見れば簡単だった |
| 3 | 正解、かなり難しかった |
| 4 | 正解、少し迷った |
| 5 | 完璧 |
