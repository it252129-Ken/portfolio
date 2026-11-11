
// ============================================================
// ナビ - ポートフォリオ案内アシスタント
// ============================================================

"use strict";

// チャット画面の要素
const assistantInput = document.getElementById("assistant-input");
const assistantSend = document.getElementById("assistant-send");
const assistantMessages = document.getElementById("assistant-messages");

// データが読み込まれているか確認
if (typeof portfolioData === "undefined") {
    console.error("games-data.js が読み込まれていません。");
}

// ============================================================
// メッセージ表示
// ============================================================

function addMessage(message, type) {

    if (!assistantMessages) return;

    const messageElement = document.createElement("div");
    messageElement.classList.add("message", type);

    messageElement.textContent = message;

    assistantMessages.appendChild(messageElement);

    // 最新メッセージまでスクロール
    assistantMessages.scrollTop = assistantMessages.scrollHeight;
}

// ============================================================
// 質問の判定
// ============================================================

function getAnswer(question) {

    const text = question.toLowerCase();

    // ゲーム名から検索
    const game = portfolioData.games.find(game => {

        const names = [game.name, ...game.aliases];

        return names.some(name =>
            text.includes(name.toLowerCase())
        );
    });

    // 特定のゲームについて質問された場合
    if (game) {

        if (text.includes("操作") ||
            text.includes("キー") ||
            text.includes("遊び方")) {

            return `${game.name}の操作方法です。\n\n${game.controls.join("\n")}`;
        }

        if (text.includes("技術") ||
            text.includes("言語") ||
            text.includes("開発環境")) {

            return `${game.name}で使用している技術です。\n\n${game.technology.join("、")}`;
        }

        if (text.includes("特徴") ||
            text.includes("機能")) {

            return `${game.name}の主な特徴です。\n\n${game.features.join("\n")}`;
        }

        return `${game.name}についてご紹介します。\n\nジャンル：${game.genre}\n\n${game.description}`;
    }

    // よくある質問から検索
    for (const faq of portfolioData.faqs) {

        const matched = faq.keywords.some(keyword =>
            text.includes(keyword)
        );

        if (matched) {
            return faq.answer;
        }
    }

    // プロフィール関連
    if (text.includes("興味")) {
        return `興味のある分野はこちらです。\n\n${portfolioData.profile.interests.join("、")}`;
    }

    // 該当する回答がない場合
    return portfolioData.assistant.unknown;
}

// ============================================================
// 質問を送信
// ============================================================

function sendMessage() {

    if (!assistantInput || !assistantMessages) return;

    const question = assistantInput.value.trim();

    // 空欄なら何もしない
    if (question === "") return;

    // ユーザーの質問を表示
    addMessage(question, "user-message");

    // ナビの回答を取得
    const answer = getAnswer(question);

    // ナビの回答を表示
    addMessage(answer, "assistant-message");

    // 入力欄を空にする
    assistantInput.value = "";

    assistantInput.focus();
}

// ============================================================
// イベント設定
// ============================================================

if (assistantSend) {
    assistantSend.addEventListener("click", sendMessage);
}

if (assistantInput) {

    assistantInput.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            sendMessage();
        }

    });

}

// ============================================================
// 初期メッセージ
// ============================================================

if (assistantMessages && typeof portfolioData !== "undefined") {
    addMessage(portfolioData.assistant.greeting, "assistant-message");
}

console.log("ナビのアシスタントが起動しました！");
