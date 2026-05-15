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

#### テンプレートを使う（推奨）

以下のテンプレートを複製すると、必要なプロパティがすべて揃った状態で始められます。

[📋 Vocability Notion テンプレートを開く](https://eminent-clerk-721.notion.site/3618b26f29e680c09525cb7070bfd7d9?v=3618b26f29e681bcb97e000c574140c4&source=copy_link)

右上の「Duplicate」をクリックして自分のワークスペースに複製してください。

#### 手動でセットアップする場合

Notion DB に以下のプロパティを追加してください（型に注意）:

| プロパティ名 | 型 |
|---|---|
| Vocabulary | Title |
| POS | Select |
| Meaning | Rich Text |
| JapaneseMeaning | Rich Text |
| CoreImage | Rich Text |
| Example | Rich Text |
| Memo | Rich Text |
| Casualness | Select |
| EmotionTags | Multi-select |
| Usage | Multi-select |
| NativeFrequency | Select |
| IPA_US | Rich Text |
| IPA_UK | Rich Text |
| YouGlish | URL |
| Synonyms | Rich Text |
| Paraphrases | Rich Text |
| RelatedExpressions | Rich Text |
| SimilarSpelling | Rich Text |
| PronunciationConfusions | Rich Text |
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
5. （任意）Persona Context を入力 → AIの例文生成をあなたのプロフィールに合わせる
6. 「Save Settings」をクリック

### Persona Context について

自分の英語学習背景や目的を自由に記述します。設定すると、AIが生成する例文や語感の説明がそのプロフィールに合ったものになります。

例:
```
Japanese software engineer, mid-level English proficiency, preparing for business meetings in the US.
```

---

## 使い方

### Add Vocabulary

1. 単語をテキストエリアに入力（1行1単語、またはカンマ区切り）
2. または `.txt` ファイルをアップロード
3. 「Generate with AI」をクリック → GPT-4oが全プロパティを自動生成
   - 多義語は**意味ごとに別エントリ**として分割される
4. 内容を確認・編集（カードを展開すると全フィールドを編集可能）
5. 「Save all to Notion」でNotionDBに保存

### Quiz

- タイトル（Vocabulary）が空のカードは出題されない
- 当日分（sm2_dueDate <= 今日）のカードを自動ロード
- カードをタップで答えを表示
- 0〜5の6段階で評価 → SM-2アルゴリズムで次回出題日を自動計算
- 不正解（0〜2）は当日セッション内で再出題

### SM-2 評価基準

| スコア | ラベル | 意味 |
|---|---|---|
| 0 | Blackout | 完全に忘れた |
| 1 | Wrong | 間違えたが答えを見て思い出した |
| 2 | Hard | 間違えたが答えを見れば簡単だった |
| 3 | Good | 正解、かなり難しかった |
| 4 | Easy | 正解、少し迷った |
| 5 | Perfect | 完璧 |

---

## 生成されるメタデータ一覧

| フィールド | 内容 |
|---|---|
| Vocabulary | 単語・フレーズ |
| POS | 品詞（Noun / Verb / PhrasalVerb / Idiom など14種） |
| Meaning | 英語での簡潔な意味説明（20語以内） |
| JapaneseMeaning | 日本語の意味 |
| CoreImage | ネイティブの概念イメージ（日本語） |
| Example | 例文（英語 + 日本語訳） |
| Casualness | 丁寧さ（VeryFormal / Formal / Neutral / Casual / VeryCasual / Slang） |
| EmotionTags | 感情・トーン（Positive / Humorous / Sarcastic など、0〜3個） |
| Usage | 使用場面（Spoken / Written / Online / Business / Academic / Literary） |
| NativeFrequency | 使用頻度（VeryCommon / Common / Uncommon / Rare） |
| IPA_US | 米国英語発音記号 |
| IPA_UK | 英国英語発音記号 |
| YouGlish | Youglish 発音ページURL |
| Synonyms | 類義語・近似語（カンマ区切り） |
| Paraphrases | 言い換え表現（改行区切り） |
| RelatedExpressions | 関連表現（改行区切り） |
| SimilarSpelling | スペルが混同されやすい単語 |
| PronunciationConfusions | 発音が混同されやすい単語・同音異義語 |
