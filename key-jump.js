const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


// =========================
// シーン
// =========================

const Scene = {
    Title: 0,
    GamePlay: 1,
    GameClear: 2
};

let scene = Scene.Title;


// =========================
// マップ
// =========================

const MAP_WIDTH = 48;
const MAP_HEIGHT = 25;

const TILE_SIZE = 40;

const mapData = [];


// =========================
// プレイヤー
// =========================

const player = {

    position: {
        x: 60,
        y: 850
    },

    width: 30,
    height: 30,

    speed: 300,

    velocityY: 0,

    isGround: false

};


// =========================
// 敵
// =========================

const ENEMY_COUNT = 4;

const enemies = [

    {
        position: { x: 400, y: 930 },
        width: 30,
        height: 30,
        speed: 160,
        direction: -1
    },

    {
        position: { x: 900, y: 930 },
        width: 30,
        height: 30,
        speed: 180,
        direction: -1
    },

    {
        position: { x: 1400, y: 570 },
        width: 30,
        height: 30,
        speed: 140,
        direction: 1
    },

    {
        position: { x: 1400, y: 210 },
        width: 30,
        height: 30,
        speed: 140,
        direction: -1
    }

];


// =========================
// キー入力
// =========================

const keys = {};

let spacePressedLastFrame = false;


document.addEventListener("keydown", (event) => {

    keys[event.code] = true;

});


document.addEventListener("keyup", (event) => {

    keys[event.code] = false;

});


// =========================
// マップ初期化
// =========================

function initializeMap() {

    for (let y = 0; y < MAP_HEIGHT; y++) {

        mapData[y] = [];

        for (let x = 0; x < MAP_WIDTH; x++) {

            mapData[y][x] =
                (x === 0 ||
                 x === MAP_WIDTH - 1 ||
                 y === 0)
                    ? 1
                    : 0;

        }

    }


    // ゴール

    mapData[5][46] = 3;


    // 地面

    for (let x = 1; x < MAP_WIDTH - 1; x++) {

        if (
            (x >= 10 && x <= 12) ||
            (x >= 25 && x <= 27) ||
            (x >= 35 && x <= 38)
        ) {

            continue;

        }

        mapData[24][x] = 1;

    }


    // 小さい足場

    mapData[21][41] = 1;
    mapData[21][42] = 1;
    mapData[21][43] = 1;

    mapData[18][41] = 1;
    mapData[18][42] = 1;
    mapData[18][43] = 1;

    mapData[15][41] = 1;
    mapData[15][42] = 1;
    mapData[15][43] = 1;

    mapData[15][35] = 1;
    mapData[15][36] = 1;
    mapData[15][37] = 1;

    mapData[15][12] = 1;
    mapData[15][13] = 1;
    mapData[15][14] = 1;

    mapData[15][18] = 1;
    mapData[15][19] = 1;
    mapData[15][20] = 1;

    mapData[15][24] = 1;
    mapData[15][25] = 1;
    mapData[15][26] = 1;

    mapData[15][29] = 1;
    mapData[15][30] = 1;
    mapData[15][31] = 1;

    mapData[15][7] = 1;
    mapData[15][8] = 1;

    mapData[13][2] = 1;
    mapData[13][3] = 1;
    mapData[13][4] = 1;

    mapData[10][6] = 1;
    mapData[10][7] = 1;
    mapData[10][8] = 1;

    mapData[8][10] = 1;
    mapData[8][11] = 1;
    mapData[8][12] = 1;

    mapData[6][15] = 1;
    mapData[6][16] = 1;
    mapData[6][17] = 1;

    mapData[6][20] = 1;
    mapData[6][21] = 1;
    mapData[6][22] = 1;

    mapData[6][25] = 1;
    mapData[6][26] = 1;
    mapData[6][27] = 1;

    mapData[6][31] = 1;
    mapData[6][32] = 1;
    mapData[6][33] = 1;

    mapData[6][37] = 1;
    mapData[6][38] = 1;
    mapData[6][39] = 1;

    mapData[6][44] = 1;
    mapData[6][45] = 1;
    mapData[6][46] = 1;

}


// =========================
// 初期化
// =========================

initializeMap();


// =========================
// C++版と同じQキー開始
// =========================

function updateTitle() {

    if (keys["KeyQ"]) {

        scene = Scene.GamePlay;

    }

}


// =========================
// ゲームクリア
// =========================

function updateGameClear() {

    if (keys["KeyT"]) {

        scene = Scene.Title;

        player.position.x = 60;
        player.position.y = 850;

        player.velocityY = 0;

    }


// =========================
// 壁判定
// C++版 IsWall() と同じ
// =========================

function isWall(x, y) {

    const tx = Math.floor(x / TILE_SIZE);
    const ty = Math.floor(y / TILE_SIZE);

    // マップ内
    if (
        tx >= 0 &&
        tx < MAP_WIDTH &&
        ty >= 0 &&
        ty < MAP_HEIGHT
    ) {

        return mapData[ty][tx] === 1;

    }

    // マップ下まで行った場合は壁ではない
    if (ty >= MAP_HEIGHT) {

        return false;

    }

    // マップ外は壁
    return true;

}


// =========================
// 安全地帯判定
// C++版 SafeTile() と同じ
// =========================

function isSafeTile(x, y) {

    const tx = Math.floor(x / TILE_SIZE);
    const ty = Math.floor(y / TILE_SIZE);

    if (
        tx >= 0 &&
        tx < MAP_WIDTH &&
        ty >= 0 &&
        ty < MAP_HEIGHT
    ) {

        return mapData[ty][tx] === 3;

    }

    return false;

}


// =========================
// プレイヤーを初期位置へ戻す
// =========================

function resetPlayer() {

    player.position.x = 60;
    player.position.y = 850;

    player.velocityY = 0;
    player.isGround = false;

}


// =========================
// プレイヤー移動
// =========================

function updatePlayer(deltaTime) {

    // C++版と同じ
    let moveSpeed = player.speed;

    // Wで速度2倍
    if (keys["KeyW"]) {

        moveSpeed *= 2.0;

    }


    // =========================
    // 横移動
    // =========================

    let moveX = 0;

    if (keys["ArrowLeft"]) {

        moveX -= moveSpeed * deltaTime;

    }

    if (keys["ArrowRight"]) {

        moveX += moveSpeed * deltaTime;

    }


    const oldX = player.position.x;

    player.position.x += moveX;


    // プレイヤー4隅で壁判定

    if (
        isWall(player.position.x, player.position.y) ||
        isWall(
            player.position.x + player.width,
            player.position.y
        ) ||
        isWall(
            player.position.x,
            player.position.y + player.height
        ) ||
        isWall(
            player.position.x + player.width,
            player.position.y + player.height
        )
    ) {

        player.position.x = oldX;

    }


    // =========================
    // ジャンプ
    // =========================

    const spacePressed =
        keys["Space"] === true;

    if (
        spacePressed &&
        !spacePressedLastFrame &&
        player.isGround
    ) {

        player.velocityY = -500;

        player.isGround = false;

    }


    spacePressedLastFrame = spacePressed;


    // =========================
    // 重力
    // =========================

    const gravity = 900;

    player.velocityY += gravity * deltaTime;


    const oldY = player.position.y;

    player.position.y +=
        player.velocityY * deltaTime;


    // =========================
    // 縦方向の壁判定
    // =========================

    if (
        isWall(player.position.x, player.position.y) ||
        isWall(
            player.position.x + player.width,
            player.position.y
        ) ||
        isWall(
            player.position.x,
            player.position.y + player.height
        ) ||
        isWall(
            player.position.x + player.width,
            player.position.y + player.height
        )
    ) {

        // 落下中なら地面に着地
        if (player.velocityY > 0) {

            player.isGround = true;

        }

        player.position.y = oldY;

        player.velocityY = 0;

    }
    else {

        player.isGround = false;

    }


    // =========================
    // ゴール判定
    // =========================

    const centerX =
        player.position.x + player.width / 2;

    const centerY =
        player.position.y + player.height / 2;

    if (isSafeTile(centerX, centerY)) {

        scene = Scene.GameClear;

    }


    // =========================
    // 落下判定
    // =========================

    if (player.position.y > 1200) {

        resetPlayer();

    }

}


// =========================
// 敵の更新
// =========================

function updateEnemies(deltaTime) {

    for (let i = 0; i < ENEMY_COUNT; i++) {

        const enemy = enemies[i];

        const oldX = enemy.position.x;


        // 敵を横に移動

        enemy.position.x +=
            enemy.speed *
            enemy.direction *
            deltaTime;


        // 敵自身の4隅をチェック

        if (
            isWall(
                enemy.position.x,
                enemy.position.y
            ) ||
            isWall(
                enemy.position.x + enemy.width,
                enemy.position.y
            ) ||
            isWall(
                enemy.position.x,
                enemy.position.y + enemy.height
            ) ||
            isWall(
                enemy.position.x + enemy.width,
                enemy.position.y + enemy.height
            )
        ) {

            // 元の位置へ戻す

            enemy.position.x = oldX;

            // 方向反転

            enemy.direction *= -1;

        }

    }

}


// =========================
// AABB当たり判定
// =========================

function checkCollision(a, b) {

    return (
        a.position.x <
            b.position.x + b.width &&

        a.position.x + a.width >
            b.position.x &&

        a.position.y <
            b.position.y + b.height &&

        a.position.y + a.height >
            b.position.y
    );

}


// =========================
// プレイヤーと敵
// =========================

function checkEnemyCollision() {

    for (let i = 0; i < ENEMY_COUNT; i++) {

        const enemy = enemies[i];

        if (checkCollision(player, enemy)) {

            resetPlayer();

            return;

        }

    }

}


// =========================
// ゲーム全体の更新
// =========================

function update(deltaTime) {

    switch (scene) {

        case Scene.Title:

            updateTitle();

            break;


        case Scene.GamePlay:

            updatePlayer(deltaTime);

            updateEnemies(deltaTime);

            checkEnemyCollision();

            break;


        case Scene.GameClear:

            updateGameClear();

            break;

    }

}


// =========================
// マップ描画
// =========================

function drawMap(scale) {

    for (let y = 0; y < MAP_HEIGHT; y++) {

        for (let x = 0; x < MAP_WIDTH; x++) {

            const tile = mapData[y][x];

            if (tile === 0) {
                continue;
            }


            if (tile === 1) {

                ctx.fillStyle = "#808080";

            }
            else if (tile === 2) {

                ctx.fillStyle = "#ffff00";

            }
            else if (tile === 3) {

                ctx.fillStyle = "#00ff00";

            }


            ctx.fillRect(
                x * TILE_SIZE * scale,
                y * TILE_SIZE * scale,
                TILE_SIZE * scale,
                TILE_SIZE * scale
            );

        }

    }

}


// =========================
// プレイヤー描画
// =========================

function drawPlayer(scale) {

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
        player.position.x * scale,
        player.position.y * scale,
        player.width * scale,
        player.height * scale
    );

}


// =========================
// 敵描画
// =========================

function drawEnemies(scale) {

    for (let i = 0; i < ENEMY_COUNT; i++) {

        const enemy = enemies[i];


        if (i === 0) {

            ctx.fillStyle = "#ff0000";

        }
        else if (i === 1) {

            // C++版では透明
            ctx.fillStyle = "rgba(255,255,0,0)";

        }
        else if (i === 2) {

            ctx.fillStyle = "#0000ff";

        }
        else {

            ctx.fillStyle = "#ff00ff";

        }


        ctx.fillRect(
            enemy.position.x * scale,
            enemy.position.y * scale,
            enemy.width * scale,
            enemy.height * scale
        );

    }

}


// =========================
// タイトル描画
// =========================

function drawTitle() {

    ctx.fillStyle = "#061b35";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.fillStyle = "#ffff00";

    ctx.font = "bold 70px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
        "KEY JUMP",
        canvas.width / 2,
        180
    );


    ctx.font = "bold 40px Arial";

    ctx.fillText(
        "START",
        canvas.width / 2,
        300
    );


    ctx.font = "bold 30px Arial";

    ctx.fillText(
        "Q",
        canvas.width / 2,
        370
    );


    ctx.font = "20px Arial";

    ctx.fillText(
        "Qキーでスタート",
        canvas.width / 2,
        430
    );

}


// =========================
// クリア画面
// =========================

function drawGameClear() {

    ctx.fillStyle = "#000000";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.fillStyle = "#ffff00";

    ctx.textAlign = "center";


    ctx.font = "bold 80px Arial";

    ctx.fillText(
        "CLEAR",
        canvas.width / 2,
        200
    );


    ctx.font = "bold 45px Arial";

    ctx.fillText(
        "TITLE",
        canvas.width / 2,
        310
    );


    ctx.font = "bold 35px Arial";

    ctx.fillText(
        "T",
        canvas.width / 2,
        370
    );


    ctx.font = "20px Arial";

    ctx.fillText(
        "Tキーでタイトルへ",
        canvas.width / 2,
        430
    );

}


// =========================
// 描画
// =========================

function render() {

    const scale = 0.5;


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    if (scene === Scene.Title) {

        drawTitle();

    }
    else if (scene === Scene.GamePlay) {

        ctx.fillStyle = "#000000";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        drawMap(scale);

        drawPlayer(scale);

        drawEnemies(scale);

    }
    else if (scene === Scene.GameClear) {

        drawGameClear();

    }

}


// =========================
// ゲームループ
// =========================

let lastTime = performance.now();


function gameLoop(currentTime) {

    let deltaTime =
        (currentTime - lastTime) / 1000;

    lastTime = currentTime;


    // 暴走防止
    if (deltaTime > 0.05) {

        deltaTime = 0.05;

    }


    update(deltaTime);

    render();


    requestAnimationFrame(gameLoop);

}


requestAnimationFrame(gameLoop);
