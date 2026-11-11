
"use strict";

// =========================
// キャンバス
// =========================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// =========================
// シーン
// =========================

const Scene = {
    TITLE: 0,
    PLAY: 1,
    RESULT: 2
};

let scene = Scene.TITLE;

// =========================
// ゲーム設定
// =========================

const WIN_SCORE = 5;

const paddleWidth = 12;
const paddleHeight = 90;

const player = {
    x: 35,
    y: HEIGHT / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 6,
    score: 0
};

const cpu = {
    x: WIDTH - 35 - paddleWidth,
    y: HEIGHT / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 4.2,
    score: 0
};

const ball = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    radius: 9,
    speedX: 5,
    speedY: 3
};

// =========================
// 入力
// =========================

const keys = {};

window.addEventListener("keydown", (event) => {
    keys[event.code] = true;

    if (
        ["ArrowUp", "ArrowDown", "Space"].includes(event.code)
    ) {
        event.preventDefault();
    }

    if (event.repeat) return;

    if (scene === Scene.TITLE && event.code === "Enter") {
        startGame();
    }

    if (scene === Scene.RESULT && event.code === "KeyR") {
        startGame();
    }

    if (
        (scene === Scene.RESULT || scene === Scene.PLAY) &&
        event.code === "Escape"
    ) {
        returnToTitle();
    }
});

window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
});

window.addEventListener("blur", () => {
    for (const key in keys) {
        keys[key] = false;
    }
});

// =========================
// タッチ操作
// =========================

function setupTouchButton(id, key) {
    const button = document.getElementById(id);

    button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        keys[key] = true;
    });

    function release() {
        keys[key] = false;
    }

    button.addEventListener("pointerup", release);
    button.addEventListener("pointerleave", release);
    button.addEventListener("pointercancel", release);
}

setupTouchButton("upButton", "ArrowUp");
setupTouchButton("downButton", "ArrowDown");

// =========================
// ボール初期化
// =========================

function resetBall(direction) {
    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;

    ball.speedX = 5 * direction;
    ball.speedY = (Math.random() * 4) - 2;

    if (Math.abs(ball.speedY) < 1) {
        ball.speedY = 2;
    }
}

// =========================
// ゲーム開始
// =========================

function startGame() {
    player.score = 0;
    cpu.score = 0;

    player.y = HEIGHT / 2 - paddleHeight / 2;
    cpu.y = HEIGHT / 2 - paddleHeight / 2;

    resetBall(Math.random() < 0.5 ? -1 : 1);

    scene = Scene.PLAY;

    updateButtons();
}

// =========================
// タイトルへ戻る
// =========================

function returnToTitle() {
    scene = Scene.TITLE;
    updateButtons();
}

// =========================
// ボタン表示
// =========================

function updateButtons() {
    document.getElementById("startButton").hidden =
        scene !== Scene.TITLE;

    document.getElementById("retryButton").hidden =
        scene !== Scene.RESULT;

    document.getElementById("titleButton").hidden =
        scene === Scene.TITLE;
}

// =========================
// プレイヤー移動
// =========================

function updatePlayer() {
    if (keys["KeyW"] || keys["ArrowUp"]) {
        player.y -= player.speed;
    }

    if (keys["KeyS"] || keys["ArrowDown"]) {
        player.y += player.speed;
    }

    player.y = Math.max(
        0,
        Math.min(HEIGHT - player.height, player.y)
    );
}

// =========================
// CPU移動
// =========================

function updateCPU() {
    const targetY = ball.y - cpu.height / 2;

    if (cpu.y + cpu.height / 2 < ball.y - 10) {
        cpu.y += cpu.speed;
    } else if (cpu.y + cpu.height / 2 > ball.y + 10) {
        cpu.y -= cpu.speed;
    }

    cpu.y = Math.max(
        0,
        Math.min(HEIGHT - cpu.height, cpu.y)
    );
}

// =========================
// ボール移動
// =========================

function updateBall() {
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // 上下の壁
    if (
        ball.y - ball.radius <= 0 ||
        ball.y + ball.radius >= HEIGHT
    ) {
        ball.speedY *= -1;
    }

    // プレイヤーとの衝突
    if (
        ball.speedX < 0 &&
        ball.x - ball.radius <= player.x + player.width &&
        ball.x + ball.radius >= player.x &&
        ball.y + ball.radius >= player.y &&
        ball.y - ball.radius <= player.y + player.height
    ) {
        ball.x = player.x + player.width + ball.radius;

        ball.speedX = Math.abs(ball.speedX) + 0.3;

        const hitPosition =
            (ball.y - (player.y + player.height / 2)) /
            (player.height / 2);

        ball.speedY = hitPosition * 5;
    }

    // CPUとの衝突
    if (
        ball.speedX > 0 &&
        ball.x + ball.radius >= cpu.x &&
        ball.x - ball.radius <= cpu.x + cpu.width &&
        ball.y + ball.radius >= cpu.y &&
        ball.y - ball.radius <= cpu.y + cpu.height
    ) {
        ball.x = cpu.x - ball.radius;

        ball.speedX = -(Math.abs(ball.speedX) + 0.3);

        const hitPosition =
            (ball.y - (cpu.y + cpu.height / 2)) /
            (cpu.height / 2);

        ball.speedY = hitPosition * 5;
    }

    // CPU側にボールが到達
    if (ball.x + ball.radius < 0) {
        cpu.score++;
        checkScore();
        resetBall(-1);
    }

    // プレイヤー側にボールが到達
    if (ball.x - ball.radius > WIDTH) {
        player.score++;
        checkScore();
        resetBall(1);
    }
}

// =========================
// 勝敗判定
// =========================

function checkScore() {
    if (
        player.score >= WIN_SCORE ||
        cpu.score >= WIN_SCORE
    ) {
        scene = Scene.RESULT;
        updateButtons();
    }
}

// =========================
// ゲーム更新
// =========================

function update() {
    if (scene !== Scene.PLAY) return;

    updatePlayer();
    updateCPU();
    updateBall();
}

// =========================
// 描画：背景
// =========================

function drawBackground() {
    ctx.fillStyle = "#050914";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 中央線
    ctx.strokeStyle = "#315174";
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 12]);

    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();

    ctx.setLineDash([]);
}

// =========================
// 描画：ゲーム
// =========================

function drawGame() {
    drawBackground();

    ctx.fillStyle = "#70caff";

    // パドル
    ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );

    ctx.fillRect(
        cpu.x,
        cpu.y,
        cpu.width,
        cpu.height
    );

    // ボール
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // スコア
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";

    ctx.fillText(player.score, WIDTH / 2 - 70, 65);
    ctx.fillText(cpu.score, WIDTH / 2 + 70, 65);
}

// =========================
// 描画：タイトル
// =========================

function drawTitle() {
    drawBackground();

    ctx.textAlign = "center";

    ctx.fillStyle = "#70caff";
    ctx.font = "bold 76px Arial";
    ctx.fillText("PONG", WIDTH / 2, 160);

    ctx.fillStyle = "#ffffff";
    ctx.font = "24px sans-serif";
    ctx.fillText("CPUとの対戦ゲーム", WIDTH / 2, 220);

    ctx.font = "20px sans-serif";
    ctx.fillText("先に5点取った方が勝利！", WIDTH / 2, 285);

    ctx.fillStyle = "#9fd8ff";
    ctx.fillText("ENTER または GAME START", WIDTH / 2, 355);
}

// =========================
// 描画：結果
// =========================

function drawResult() {
    drawBackground();

    ctx.textAlign = "center";

    const playerWon = player.score >= WIN_SCORE;

    ctx.fillStyle = playerWon ? "#70caff" : "#ff8585";
    ctx.font = "bold 55px sans-serif";

    ctx.fillText(
        playerWon ? "YOU WIN!" : "YOU LOSE...",
        WIDTH / 2,
        170
    );

    ctx.fillStyle = "#ffffff";
    ctx.font = "30px Arial";

    ctx.fillText(
        `${player.score} - ${cpu.score}`,
        WIDTH / 2,
        240
    );

    ctx.font = "20px sans-serif";
    ctx.fillText("RETRY または Rキーで再挑戦", WIDTH / 2, 320);
}

// =========================
// 描画
// =========================

function draw() {
    if (scene === Scene.TITLE) {
        drawTitle();
    } else if (scene === Scene.PLAY) {
        drawGame();
    } else if (scene === Scene.RESULT) {
        drawResult();
    }
}

// =========================
// ボタン操作
// =========================

document.getElementById("startButton").addEventListener(
    "click",
    startGame
);

document.getElementById("retryButton").addEventListener(
    "click",
    startGame
);

document.getElementById("titleButton").addEventListener(
    "click",
    returnToTitle
);

// =========================
// メインループ
// =========================

function gameLoop() {
    update();
    draw();

    requestAnimationFrame(gameLoop);
}

updateButtons();
gameLoop();

