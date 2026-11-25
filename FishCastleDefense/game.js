
/* =========================
   FISH CASTLE DEFENSE
   ゲーム起動処理
========================= */

let gameManager = null;
let lastTime = 0;
let isRunning = false;

// ゲーム中のBGM
const gameBGM = new Audio("Resource/Gamebgm.wav");

// BGMをループ再生
gameBGM.loop = true;

// 音量（0.0～1.0）
gameBGM.volume = 0.4;

// タイトル画面を表示中か
let isTitleScreen = true;


/* =========================
   ゲーム開始
========================= */

function startGame() {

    // 二重起動を防止
    if (isRunning) {
        return;
    }

    console.log("FISH CASTLE DEFENSE START!");

    // タイトル画面を隠す
    document.getElementById("title-screen").style.display = "none";

    // ゲーム画面を表示
    document.getElementById("game-container").style.display = "block";

    isTitleScreen = false;

    // ゲーム管理クラスを作成
    gameManager = new GameManager();

    // ゲーム開始
    gameManager.start();
   
   // ゲームのBGM
   gameBGM.currentTime = 0;
   gameBGM.play();

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

    const deltaTime = (currentTime - lastTime) / 1000;

    lastTime = currentTime;

    if (gameManager && !gameManager.isGameOver) {

        gameManager.update(deltaTime);

    } else {

        isRunning = false;
       
       // BGMを停止
    gameBGM.pause();
    gameBGM.currentTime = 0;

        console.log("GAME OVER");
        return;
    }

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

        if (gameManager && isRunning) {
            gameManager.produceCharacter("fisherman");
        }

    });


    // 槍兵
    spearmanButton.addEventListener("click", () => {

        if (gameManager && isRunning) {
            gameManager.produceCharacter("spearman");
        }

    });


    // 海の弓兵
    archerButton.addEventListener("click", () => {

        if (gameManager && isRunning) {
            gameManager.produceCharacter("archer");
        }

    });

}


/* =========================
   キーボード操作
========================= */

function setupKeyboard() {

    window.addEventListener("keydown", (event) => {

        // タイトル画面でSキーを押す
        if (
            isTitleScreen &&
            event.key.toLowerCase() === "s"
        ) {

            startGame();

        }

    });

}


/* =========================
   ページ読み込み完了
========================= */

window.addEventListener("DOMContentLoaded", () => {

    // 生産ボタン設定
    setupProductionButtons();

    // キーボード設定
    setupKeyboard();

});
