
"use strict";

// =========================
// 感想投稿機能
// =========================

const reviewName = document.getElementById("review-name");
const reviewComment = document.getElementById("review-comment");
const reviewSubmit = document.getElementById("review-submit");
const reviewContainer = document.getElementById("review-container");

// 保存データの名前
const REVIEW_STORAGE_KEY = "portfolioReviews";

// =========================
// 保存データを取得
// =========================

function getReviews() {
    try {
        const data = localStorage.getItem(REVIEW_STORAGE_KEY);
        const reviews = data ? JSON.parse(data) : [];

        return Array.isArray(reviews) ? reviews : [];
    } catch (error) {
        console.error("感想データの読み込みに失敗しました:", error);
        return [];
    }
}

// =========================
// 感想を保存
// =========================

function saveReviews(reviews) {
    try {
        localStorage.setItem(
            REVIEW_STORAGE_KEY,
            JSON.stringify(reviews)
        );
        return true;
    } catch (error) {
        console.error("感想データの保存に失敗しました:", error);
        alert("保存できませんでした。ブラウザの保存容量などを確認してください。");
        return false;
    }
}

// =========================
// 感想を画面に表示
// =========================

function displayReviews() {
    const reviews = getReviews();

    reviewContainer.replaceChildren();

    if (reviews.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "review-empty";
        emptyMessage.textContent = "まだ感想はありません。最初の感想を投稿してみましょう！";

        reviewContainer.appendChild(emptyMessage);
        return;
    }

    // 新しい投稿を上に表示
    reviews.slice().reverse().forEach((review, index) => {
        const card = document.createElement("div");
        card.className = "review-card";

        const name = document.createElement("h4");
        name.textContent = review.name;

        const date = document.createElement("p");
        date.className = "review-date";
        date.textContent = review.date;

        const comment = document.createElement("p");
        comment.className = "review-comment";
        comment.textContent = review.comment;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "削除";
        deleteButton.className = "review-delete";

        deleteButton.addEventListener("click", () => {
            deleteReview(reviews.length - 1 - index);
        });

        card.appendChild(name);
        card.appendChild(date);
        card.appendChild(comment);
        card.appendChild(deleteButton);

        reviewContainer.appendChild(card);
    });
}

// =========================
// 感想を投稿
// =========================

function addReview() {
    const name = reviewName.value.trim();
    const comment = reviewComment.value.trim();

    if (name === "") {
        alert("ニックネームを入力してください。");
        return;
    }

    if (comment === "") {
        alert("感想を入力してください。");
        return;
    }

    const reviews = getReviews();

    const newReview = {
        name: name,
        comment: comment,
        date: new Date().toLocaleString("ja-JP")
    };

    reviews.push(newReview);

    if (!saveReviews(reviews)) {
        return;
    }

    reviewName.value = "";
    reviewComment.value = "";

    displayReviews();

    alert("感想を投稿しました！");
}

// =========================
// 感想を削除
// =========================

function deleteReview(index) {
    const reviews = getReviews();

    if (!confirm("この感想を削除しますか？")) {
        return;
    }

    reviews.splice(index, 1);

    if (!saveReviews(reviews)) {
        return;
    }

    displayReviews();
}

// =========================
// ボタンのイベント
// =========================

reviewSubmit.addEventListener("click", addReview);

// Enterキーではなくボタンで投稿する
reviewComment.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        addReview();
    }
});

// 最初の表示
displayReviews();

