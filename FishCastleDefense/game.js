
/* =========================
   FISH CASTLE DEFENSE
   ゲーム起動処理
========================= */

// ゲーム管理クラス
let gameManager = null;

// 前回のフレーム時間
let lastTime = 0;

// ゲームが動作中か
let isRunning = false;


/* =========================
   ゲーム開始
========================= */

function startGame() {

    console.log("FISH CASTLE DEFENSE START!");

    // ゲーム管理クラスを作成
    gameManager = new GameManager();

    // ゲーム開始
    gameManager.start();

    // ゲームループ開始
    isRunning = true;

    lastTime = performance.now();

    requestAnimationFrame(gameLoop);
}


/* =========================
   ゲームループ
========================= */

function gameLoop(currentTime) {

    if (!isRunning) {
        return;
    }

    // 経過時間を計算（秒）
    const deltaTime = (currentTime - lastTime) / 1000;

    lastTime = currentTime;

    // ゲーム更新
    if (gameManager && !gameManager.isGameOver) {

        gameManager.update(deltaTime);

    } else {

        isRunning = false;

        console.log("GAME OVER");
        return;
    }

    // 次のフレーム
    requestAnimationFrame(gameLoop);
}


/* =========================
   ユニット生産ボタン
========================= */

function setupProductionButtons() {

    const fishermanButton =
        document.getElementById("produce-fisherman");

    const spearmanButton =
        document.getElementById("produce-spearman");

    const archerButton =
        document.getElementById("produce-archer");


    // 漁師
    fishermanButton.addEventListener("click", () => {

        gameManager.produceCharacter("fisherman");

    });


    // 槍兵
    spearmanButton.addEventListener("click", () => {

        gameManager.produceCharacter("spearman");

    });


    // 海の弓兵
    archerButton.addEventListener("click", () => {

        gameManager.produceCharacter("archer");

    });

}


/* =========================
   ページ読み込み完了
========================= */

window.addEventListener("DOMContentLoaded", () => {

    // ボタン設定
    setupProductionButtons();

    // ゲーム開始
    startGame();

});


