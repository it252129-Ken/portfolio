// ============================================================
// Beyond the goal
// ブラウザ版 JavaScript
// ============================================================

"use strict";

// ============================================================
// Canvas
// ============================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const SCREEN_WIDTH = canvas.width;
const SCREEN_HEIGHT = canvas.height;

// 元ゲームのワールドサイズ
const WORLD_WIDTH = 800;
const WORLD_HEIGHT = 600;

// 描画倍率
const SCALE_X = SCREEN_WIDTH / WORLD_WIDTH;
const SCALE_Y = SCREEN_HEIGHT / WORLD_HEIGHT;

// ============================================================
// ゲーム状態
// ============================================================

const SCENE_TITLE = 0;
const SCENE_GAME = 1;
const SCENE_CLEAR = 2;

let currentScene = SCENE_TITLE;

let stage = 1;
let gameClear = false;
let changingStage = false;

let clearEffect = false;
let clearBrightness = 0;
let clearTimer = 0;

let cameraReverse = false;

let lastTime = 0;

// ============================================================
// キー入力
// ============================================================

const keys = {};
const previousKeys = {};

window.addEventListener("keydown", (event) => {

    keys[event.code] = true;

    // ゲーム中のブラウザスクロール防止
    if (
        event.code === "Space" ||
        event.code === "ArrowUp" ||
        event.code === "ArrowDown" ||
        event.code === "ArrowLeft" ||
        event.code === "ArrowRight"
    ) {
        event.preventDefault();
    }

    // タイトル
    if (currentScene === SCENE_TITLE && event.code === "KeyF") {
        startGame();
    }

    // クリア
    if (currentScene === SCENE_CLEAR) {

        if (event.code === "KeyR") {
            startGame();
        }

        if (event.code === "Escape") {
            currentScene = SCENE_TITLE;
        }
    }

    // Escで終了
    if (currentScene === SCENE_GAME && event.code === "Escape") {
        currentScene = SCENE_TITLE;
    }
});

window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
});

function isKeyPressed(code) {
    return keys[code] && !previousKeys[code];
}

// ============================================================
// 音声
// ============================================================

const audio = {
    titleBGM: new Audio("Release/Title.wav"),
    gameBGM: new Audio("Release/GamePlay.wav"),
    falling: new Audio("Release/falling.wav"),
    button: new Audio("Release/Button.wav"),
    walk: new Audio("Release/Walk.wav"),
    open: new Audio("Release/Open.wav"),
    doorOpen: new Audio("Release/DoorOpen.wav"),
    state: new Audio("Release/State.wav")
};

audio.titleBGM.loop = true;
audio.gameBGM.loop = true;

audio.titleBGM.volume = 0.5;
audio.gameBGM.volume = 0.5;
audio.walk.loop = true;

function playSound(sound) {

    try {
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
    catch (e) {
    }
}

function stopSound(sound) {

    try {
        sound.pause();
        sound.currentTime = 0;
    }
    catch (e) {
    }
}

function stopAllBGM() {

    stopSound(audio.titleBGM);
    stopSound(audio.gameBGM);
}

// ============================================================
// 画像
// ============================================================

const images = {};

function loadImage(name, path) {

    const image = new Image();

    image.src = path;

    images[name] = image;

    return image;
}

loadImage("title", "Release/Title.png");
loadImage("clear", "Release/Clear.png");
loadImage("star", "Release/Star.png");
loadImage("moon", "Release/Moon.png");
loadImage("sparkle", "Release/Sparkle.png");
loadImage("white", "Release/White.png");
loadImage("glow", "Release/Glow.png");

// ============================================================
// Vector3
// ============================================================

class Vector3 {

    constructor(x = 0, y = 0, z = 0) {

        this.x = x;
        this.y = y;
        this.z = z;
    }
}

// ============================================================
// Player
// ============================================================

class Player {

    constructor() {

        this.position = new Vector3(-20, -1.5, 0);

        this.velocityY = 0;

        this.speed = 8;

        this.isGrounded = true;
    }

    reset(position) {

        this.position = new Vector3(
            position.x,
            position.y,
            position.z
        );

        this.velocityY = 0;
        this.isGrounded = false;
    }

    update(dt) {

        let moveSpeed = this.speed;

        // Wで速度アップ
        if (keys["KeyW"]) {
            moveSpeed *= 2;
        }

        // X方向
        if (keys["KeyD"]) {
            this.position.x += moveSpeed * dt;
        }

        if (keys["KeyA"]) {
            this.position.x -= moveSpeed * dt;
        }

        // Z方向
        if (keys["KeyS"]) {
            this.position.z += moveSpeed * dt;
        }

        if (keys["KeyW"]) {
            // Wは速度アップとして使用
            // Z移動はS/D/A方式に合わせる
        }

        // Spaceジャンプ
        if (
            isKeyPressed("Space") &&
            this.isGrounded
        ) {

            this.velocityY = 10;

            this.isGrounded = false;
        }

        // 重力
        this.velocityY -= 25 * dt;

        this.position.y += this.velocityY * dt;
    }

    land(y) {

        this.position.y = y + 1.5;

        this.velocityY = 0;

        this.isGrounded = true;
    }

    draw() {

        const screen = worldToScreen(
            this.position.x,
            this.position.y,
            this.position.z
        );

        ctx.save();

        ctx.fillStyle = "white";

        ctx.fillRect(
            screen.x - 10,
            screen.y - 15,
            20,
            20
        );

        ctx.restore();
    }
}

// ============================================================
// Switch
// ============================================================

class SwitchObject {

    constructor(x, y, z) {

        this.position = new Vector3(x, y, z);

        this.pressed = false;
    }

    press() {

        this.pressed = true;

        playSound(audio.button);
    }

    reset() {

        this.pressed = false;
    }

    draw() {

        const screen = worldToScreen(
            this.position.x,
            this.position.y,
            this.position.z
        );

        ctx.save();

        ctx.fillStyle = this.pressed
            ? "#00ff66"
            : "#ffff00";

        ctx.fillRect(
            screen.x - 8,
            screen.y - 5,
            16,
            10
        );

        ctx.restore();
    }
}

// ============================================================
// Door
// ============================================================

class Door {

    constructor() {

        this.position = new Vector3(90, -1, 0);

        this.openAmount = 0;

        this.isOpening = false;

        this.openSpeed = 1.5;
    }

    setPosition(position) {

        this.position = new Vector3(
            position.x,
            position.y,
            position.z
        );

        this.openAmount = 0;

        this.isOpening = false;
    }

    open() {

        if (!this.isOpening) {

            this.isOpening = true;

            playSound(audio.doorOpen);
        }
    }

    update(dt) {

        if (!this.isOpening) {
            return;
        }

        this.openAmount += this.openSpeed * dt;

        if (this.openAmount >= 1) {

            this.openAmount = 1;

            this.isOpening = false;
        }
    }

    isOpen() {

        return this.openAmount >= 1;
    }

    draw() {

        const screen = worldToScreen(
            this.position.x,
            this.position.y,
            this.position.z
        );

        const offsetZ =
            this.openAmount * 20;

        ctx.save();

        ctx.fillStyle = "#8B4513";

        ctx.fillRect(
            screen.x - 15,
            screen.y - 50,
            30,
            80
        );

        // ドアが開いたように見せる
        if (this.openAmount > 0) {

            ctx.fillStyle = "#654321";

            ctx.fillRect(
                screen.x - 15 + offsetZ,
                screen.y - 50,
                30,
                80
            );
        }

        ctx.restore();
    }
}

// ============================================================
// MovingObstacle
// ============================================================

class MovingObstacle {

    constructor(x, y, z, reverse = false) {

        this.position = new Vector3(x, y, z);

        this.startZ = z;

        this.range = 5;

        this.speed = 5;

        this.direction = reverse ? -1 : 1;
    }

    update(dt) {

        this.position.z +=
            this.speed *
            this.direction *
            dt;

        if (
            this.position.z >
            this.startZ + this.range
        ) {

            this.position.z =
                this.startZ + this.range;

            this.direction = -1;
        }

        if (
            this.position.z <
            this.startZ - this.range
        ) {

            this.position.z =
                this.startZ - this.range;

            this.direction = 1;
        }
    }

    draw() {

        const screen = worldToScreen(
            this.position.x,
            this.position.y,
            this.position.z
        );

        ctx.save();

        ctx.fillStyle = "black";

        // 本体
        ctx.fillRect(
            screen.x - 10,
            screen.y - 10,
            20,
            20
        );

        // トゲ
        ctx.beginPath();

        ctx.moveTo(
            screen.x - 15,
            screen.y
        );

        ctx.lineTo(
            screen.x,
            screen.y - 25
        );

        ctx.lineTo(
            screen.x + 15,
            screen.y
        );

        ctx.closePath();

        ctx.fill();

        ctx.restore();
    }
}

// ============================================================
// Meteor
// ============================================================

class Meteor {

    constructor(x, y, z) {

        this.startPosition =
            new Vector3(x, y, z);

        this.position =
            new Vector3(x, y, z);

        this.fallSpeed = 12;
    }

    reset() {

        this.position =
            new Vector3(
                this.startPosition.x,
                this.startPosition.y,
                this.startPosition.z
            );
    }

    update(dt) {

        this.position.y -=
            this.fallSpeed * dt;

        this.position.x +=
            24 * dt;

        if (this.position.y < -10) {
            this.reset();
        }
    }

    draw() {

        const screen = worldToScreen(
            this.position.x,
            this.position.y,
            this.position.z
        );

        ctx.save();

        ctx.fillStyle = "red";

        ctx.beginPath();

        ctx.arc(
            screen.x,
            screen.y,
            8,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }
}

// ============================================================
// Ground
// ============================================================

const ground = {

    stage3Removed: [false, false, false],

    stage1Platform4Removed: false,

    stage2WallRemoved: false,

    stage5WallRemoved: false,

    stage5Time: 0
};

function getPlatforms(stageNumber) {

    switch (stageNumber) {

        case 1:

            return [

                [-16, -3, 0, 20, 8],
                [10, -3, 0, 34, 8],
                [22, -3, 0, 44, 8],

                [65, -3, 0, 40, 8],

                [90, -3, 0, 14, 24],

                [40, -3, 0, 10, 24],

                [64, -3, 11, 40, 2],
                [64, -3, -11, 40, 2]
            ];

        case 2:

            return [

                [-20, -3, 0, 20, 8],
                [0, -3, 0, 20, 8],
                [20, -3, 0, 20, 8],
                [40, -3, 0, 20, 8],

                [-40, -3, 0, 20, 8],
                [-60, -3, 0, 20, 8],
                [-80, -3, 0, 20, 8],

                [-100, -3, 0, 20, 40],
                [-140, -3, 0, 20, 40],

                [-120, -3, 0, 30, 10]
            ];

        case 3:

            return [

                [-20, -3, 0, 10, 10],
                [0, -3, 0, 18, 18],
                [0, -3, 16, 8, 18],

                [13, -3, 8, 16, 8],
                [13, -3, -8, 16, 8],
                [-13, -3, -8, 16, 8]
            ];

        case 4:

            return [

                [-25, -3, -8, 18, 8],
                [-15, -3, 2, 18, 8],
                [-3, -3, 9, 18, 8],
                [10, -3, 12, 18, 8],
                [23, -3, 8, 18, 8],
                [35, -3, 0, 18, 8],
                [45, -3, -8, 18, 8]
            ];

        case 5:

            return [

                [-20, -3, 0, 20, 8],

                [-5, -3, -6, 10, 4],

                [5, -3, -6, 10, 4],

                [15, -3, -6, 20, 4],

                [25, -2.5, 0, 4, 16],

                [15, -2, 6, 20, 4],

                [5, -1.5, 10, 20, 4],

                [-5, -1.5, 6, 4, 12],

                [-5, -1, 14, 20, 4],

                [15, -0.5, 14, 30, 4],

                [30, 0, 8, 4, 16],

                [40, 0.5, 0, 20, 4],

                [50, 1, 0, 20, 6]
            ];

        default:

            return [];
    }
}

// ============================================================
// Ground drawing
// ============================================================

function drawGround() {

    const platforms = getPlatforms(stage);

    ground.stage5Time += 0.016;

    for (let i = 0; i < platforms.length; i++) {

        let p = platforms[i];

        let x = p[0];
        let y = p[1];
        let z = p[2];

        const width = p[3];
        const depth = p[4];

        // Stage 3 removable platforms
        if (
            stage === 3 &&
            i >= 3 &&
            i <= 5
        ) {

            const removeIndex = i - 3;

            if (ground.stage3Removed[removeIndex]) {
                continue;
            }
        }

        // Stage 1 platform 4
        if (
            stage === 1 &&
            i === 3 &&
            ground.stage1Platform4Removed
        ) {
            continue;
        }

        // Stage 5 moving platforms
        if (stage === 5) {

            if (i === 1) {

                z =
                    8 +
                    Math.sin(ground.stage5Time) * 5;
            }

            if (i === 3) {

                z =
                    8 +
                    Math.sin(
                        ground.stage5Time +
                        Math.PI
                    ) * 5;
            }
        }

        drawPlatform(
            x,
            y,
            z,
            width,
            depth
        );
    }

    // Stage 1 wall
    if (stage === 1) {

        if (!ground.stage2WallRemoved) {

            drawWall(
                22,
                -1,
                0,
                2,
                5,
                8,
                "#8b0000"
            );
        }
    }

    // Stage 2 wall
    if (
        stage === 2 &&
        !ground.stage2WallRemoved
    ) {

        drawWall(
            30,
            -1,
            0,
            2,
            5,
            8,
            "#8b0000"
        );
    }

    // Stage 3 wall
    if (stage === 3) {

        drawWall(
            0,
            -1,
            0,
            3,
            5,
            9,
            "#550000"
        );
    }

    // Stage 5 wall
    if (
        stage === 5 &&
        !ground.stage5WallRemoved
    ) {

        drawWall(
            25,
            0,
            8,
            2,
            5,
            8,
            "#550000"
        );
    }
}

function drawPlatform(
    x,
    y,
    z,
    width,
    depth
) {

    const screen = worldToScreen(
        x,
        y,
        z
    );

    const w =
        Math.max(
            10,
            width * 2
        );

    const h =
        Math.max(
            8,
            depth * 1.2
        );

    ctx.save();

    ctx.fillStyle = "#666666";

    ctx.fillRect(
        screen.x - w / 2,
        screen.y - h / 2,
        w,
        h
    );

    ctx.strokeStyle = "#888888";

    ctx.strokeRect(
        screen.x - w / 2,
        screen.y - h / 2,
        w,
        h
    );

    ctx.restore();
}

function drawWall(
    x,
    y,
    z,
    width,
    height,
    depth,
    color
) {

    const screen = worldToScreen(
        x,
        y,
        z
    );

    ctx.save();

    ctx.fillStyle = color;

    ctx.fillRect(
        screen.x - width * 2,
        screen.y - height * 5,
        width * 4,
        height * 10
    );

    ctx.restore();
}

// ============================================================
// World → Screen
// ============================================================

function worldToScreen(x, y, z) {

    // 3D風の簡易投影
    const centerX = SCREEN_WIDTH / 2;
    const centerY = SCREEN_HEIGHT / 2;

    let cameraX = player.position.x;
    let cameraZ = player.position.z;

    let dx = x - cameraX;
    let dz = z - cameraZ;

    if (cameraReverse) {
        dx *= -1;
        dz *= -1;
    }

    const screenX =
        centerX +
        dx * 8;

    const screenY =
        centerY -
        (y * 8) -
        dz * 3;

    return {
        x: screenX,
        y: screenY
    };
}

// ============================================================
// プレイヤー
// ============================================================

const player = new Player();

// ============================================================
// ドア
// ============================================================

const door = new Door();

// ============================================================
// スイッチ
// ============================================================

const switches = [

    new SwitchObject(5, -1.5, 0),

    new SwitchObject(-137, -1.5, 18),

    new SwitchObject(-137, -1.5, -18),

    new SwitchObject(-95, -1.5, -18),

    new SwitchObject(-95, -1.5, 18)
];

const stage5Switch =
    new SwitchObject(5, -1, 14);

// ============================================================
// スイッチ順番
// ============================================================

let switchOrder = 0;

// ============================================================
// Moving Obstacles
// ============================================================

const movingObstacles = [

    new MovingObstacle(
        -30,
        -1,
        0,
        false
    ),

    new MovingObstacle(
        -50,
        -1,
        0,
        true
    ),

    new MovingObstacle(
        25,
        -1,
        0,
        true
    ),

    new MovingObstacle(
        -100,
        -1,
        0,
        false
    ),

    new MovingObstacle(
        15,
        -1,
        0,
        true
    ),

    new MovingObstacle(
        -75,
        -1,
        0,
        false
    )
];

// ============================================================
// Meteors
// ============================================================

const meteors = [

    new Meteor(-20, 15, -8),

    new Meteor(-5, 20, 2),

    new Meteor(10, 18, 9),

    new Meteor(25, 23, 12),

    new Meteor(40, 17, -5)
];

// ============================================================
// Stage 3
// ============================================================

let stage3DoorMoveCount = 0;

let stage3DoorEscapeTimer = 0;

let stage3GoalMoveCount = 0;

// ============================================================
// Game Start
// ============================================================

function startGame() {

    stopAllBGM();

    playSound(audio.state);

    currentScene = SCENE_GAME;

    stage = 1;

    gameClear = false;

    changingStage = false;

    clearEffect = false;

    clearBrightness = 0;

    clearTimer = 0;

    cameraReverse = false;

    switchOrder = 0;

    stage3DoorMoveCount = 0;

    stage3DoorEscapeTimer = 0;

    stage3GoalMoveCount = 0;

    ground.stage3Removed = [
        false,
        false,
        false
    ];

    ground.stage1Platform4Removed = false;

    ground.stage2WallRemoved = false;

    ground.stage5WallRemoved = false;

    for (const sw of switches) {
        sw.reset();
    }

    stage5Switch.reset();

    player.reset(
        new Vector3(
            -20,
            -1.5,
            0
        )
    );

    door.setPosition(
        new Vector3(
            90,
            -1,
            0
        )
    );

    try {

        audio.gameBGM.currentTime = 0;

        audio.gameBGM.play().catch(() => {});

    }
    catch (e) {
    }
}

// ============================================================
// Stage Change
// ============================================================

function changeStage(nextStage) {

    stage = nextStage;

    changingStage = false;

    switchOrder = 0;

    for (const sw of switches) {
        sw.reset();
    }

    stage3DoorMoveCount = 0;

    stage3DoorEscapeTimer = 0;

    if (stage === 2) {

        player.reset(
            new Vector3(
                -20,
                -1.5,
                0
            )
        );

        door.setPosition(
            new Vector3(
                40,
                -1,
                0
            )
        );
    }

    else if (stage === 3) {

        ground.stage3Removed = [
            false,
            false,
            false
        ];

        player.reset(
            new Vector3(
                -20,
                -1.5,
                0
            )
        );

        door.setPosition(
            new Vector3(
                0,
                -1,
                8
            )
        );
    }

    else if (stage === 4) {

        player.reset(
            new Vector3(
                -20,
                -1.5,
                0
            )
        );

        door.setPosition(
            new Vector3(
                44,
                -1,
                -8
            )
        );
    }

    else if (stage === 5) {

        player.reset(
            new Vector3(
                -20,
                -1.5,
                0
            )
        );

        door.setPosition(
            new Vector3(
                -20,
                -1,
                0
            )
        );

        ground.stage5WallRemoved = false;

        stage5Switch.reset();
    }
}

// ============================================================
// Distance
// ============================================================

function distance3D(a, b) {

    const dx =
        a.x - b.x;

    const dy =
        a.y - b.y;

    const dz =
        a.z - b.z;

    return Math.sqrt(
        dx * dx +
        dy * dy +
        dz * dz
    );
}

// ============================================================
// Collision
// ============================================================

function checkPlatformCollision() {

    const platforms =
        getPlatforms(stage);

    for (let i = 0; i < platforms.length; i++) {

        const p = platforms[i];

        // Stage 3 removable
        if (
            stage === 3 &&
            i >= 3 &&
            i <= 5
        ) {

            if (
                ground.stage3Removed[i - 3]
            ) {
                continue;
            }
        }

        // Stage 1 removed platform
        if (
            stage === 1 &&
            i === 3 &&
            ground.stage1Platform4Removed
        ) {
            continue;
        }

        let x = p[0];
        let y = p[1];
        let z = p[2];

        const width = p[3];
        const depth = p[4];

        if (stage === 5) {

            if (i === 1) {

                z =
                    8 +
                    Math.sin(
                        ground.stage5Time
                    ) * 5;
            }

            if (i === 3) {

                z =
                    8 +
                    Math.sin(
                        ground.stage5Time +
                        Math.PI
                    ) * 5;
            }
        }

        const insideX =
            Math.abs(
                player.position.x - x
            ) <= width / 2;

        const insideZ =
            Math.abs(
                player.position.z - z
            ) <= depth / 2;

        if (!insideX || !insideZ) {
            continue;
        }

        const topY =
            y + 1.5;

        if (
            player.velocityY <= 0 &&
            player.position.y >= y - 5 &&
            player.position.y <= y + 2
        ) {

            player.land(y);

            return true;
        }
    }

    return false;
}

// ============================================================
// Wall collision
// ============================================================

function checkWallCollision() {

    // Stage 1
    if (stage === 1) {

        if (!ground.stage2WallRemoved) {

            if (
                Math.abs(
                    player.position.x - 22
                ) < 2 &&
                Math.abs(
                    player.position.z
                ) < 4.5 &&
                player.position.y < 1.5
            ) {

                if (
                    player.position.x > 22
                ) {
                    player.position.x = 24;
                }
                else {
                    player.position.x = 20;
                }
            }
        }
    }

    // Stage 2
    if (stage === 2) {

        if (!ground.stage2WallRemoved) {

            if (
                Math.abs(
                    player.position.x - 30
                ) < 2 &&
                Math.abs(
                    player.position.z
                ) < 4
            ) {

                if (
                    player.position.x > 30
                ) {
                    player.position.x = 32;
                }
                else {
                    player.position.x = 28;
                }
            }
        }
    }

    // Stage 3
    if (stage === 3) {

        if (
            stage3DoorMoveCount < 3
        ) {

            if (
                Math.abs(player.position.x) < 1.5 &&
                Math.abs(player.position.z) < 4.5 &&
                player.position.y < 3
            ) {

                if (player.position.x > 0) {
                    player.position.x = 2;
                }
                else {
                    player.position.x = -2;
                }
            }
        }
    }
}

// ============================================================
// Moving obstacle collision
// ============================================================

function checkObstacleCollision() {

    if (stage !== 2) {
        return;
    }

    for (const obstacle of movingObstacles) {

        const dx =
            player.position.x -
            obstacle.position.x;

        const dz =
            player.position.z -
            obstacle.position.z;

        const distance =
            Math.sqrt(
                dx * dx +
                dz * dz
            );

        if (distance < 2.5) {

            playSound(audio.falling);

            player.reset(
                new Vector3(
                    -20,
                    -1.5,
                    0
                )
            );
        }
    }
}

// ============================================================
// Fall
// ============================================================

function checkFall() {

    if (player.position.y >= -10) {
        return;
    }

    playSound(audio.falling);

    if (stage === 1) {

        player.reset(
            new Vector3(
                4,
                -1.5,
                0
            )
        );
    }
    else {

        player.reset(
            new Vector3(
                -20,
                -1.5,
                0
            )
        );
    }
}

// ============================================================
// Switch
// ============================================================

function updateSwitches() {

    // Stage 1 switch
    if (stage === 1) {

        if (
            distance3D(
                player.position,
                switches[0].position
            ) < 2.5 &&
            isKeyPressed("KeyQ") &&
            !switches[0].pressed
        ) {

            switches[0].press();

            ground.stage2WallRemoved = true;

            playSound(audio.open);
        }
    }

    // Stage 2 switches
    if (stage === 2) {

        for (let i = 0; i < 5; i++) {

            const sw = switches[i];

            if (
                distance3D(
                    player.position,
                    sw.position
                ) < 2.5 &&
                isKeyPressed("KeyQ") &&
                !sw.pressed
            ) {

                if (i === switchOrder) {

                    sw.press();

                    switchOrder++;

                }
                else {

                    switchOrder = 0;

                    for (const s of switches) {
                        s.reset();
                    }

                    playSound(audio.button);
                }

                if (switchOrder >= 5) {

                    ground.stage2WallRemoved = true;

                    playSound(audio.open);
                }
            }
        }
    }

    // Stage 5 switch
    if (stage === 5) {

        if (
            !ground.stage5WallRemoved &&
            distance3D(
                player.position,
                stage5Switch.position
            ) < 2.5 &&
            isKeyPressed("KeyQ")
        ) {

            stage5Switch.press();

            ground.stage5WallRemoved = true;

            playSound(audio.open);
        }
    }
}

// ============================================================
// Door
// ============================================================

function updateDoor(dt) {

    door.update(dt);

    // Stage 3 special door
    if (stage === 3) {

        if (
            distance3D(
                player.position,
                door.position
            ) < 5
        ) {

            stage3DoorEscapeTimer += dt;

            if (
                stage3DoorEscapeTimer >= 0.5
            ) {

                stage3DoorEscapeTimer = 0;

                if (
                    stage3DoorMoveCount < 3
                ) {

                    const positions = [

                        new Vector3(
                            13,
                            -1,
                            8
                        ),

                        new Vector3(
                            13,
                            -1,
                            -8
                        ),

                        new Vector3(
                            -13,
                            -1,
                            -8
                        )
                    ];

                    door.setPosition(
                        positions[
                            stage3DoorMoveCount
                        ]
                    );

                    stage3DoorMoveCount++;
                }
            }
        }
    }

    // Eでドアを開く
    if (
        distance3D(
            player.position,
            door.position
        ) < 2.5 &&
        isKeyPressed("KeyE") &&
        !changingStage
    ) {

        // Stage 3特殊処理
        if (
            stage === 3 &&
            stage3DoorMoveCount >= 3
        ) {

            changeStage(4);

            return;
        }

        door.open();

        changingStage = true;
    }

    // ドアが開いた
    if (
        changingStage &&
        door.isOpen()
    ) {

        if (stage === 1) {

            changeStage(2);
        }

        else if (stage === 2) {

            changeStage(3);
        }

        else if (stage === 3) {

            changeStage(4);
        }

        else if (stage === 4) {

            changeStage(5);
        }
    }
}

// ============================================================
// Goal
// ============================================================

function updateGoal() {

    if (stage !== 5) {
        return;
    }

    const goalPosition =
        new Vector3(
            58,
            3.5,
            0
        );

    if (
        distance3D(
            player.position,
            goalPosition
        ) < 2.5 &&
        !clearEffect
    ) {

        clearEffect = true;

        clearBrightness = 0;

        clearTimer = 0;
    }
}

// ============================================================
// Clear effect
// ============================================================

function updateClearEffect(dt) {

    if (!clearEffect) {
        return false;
    }

    clearBrightness +=
        dt * 0.8;

    if (clearBrightness >= 1) {

        clearBrightness = 1;

        clearTimer += dt;

        if (clearTimer >= 1) {

            gameClear = true;

            currentScene = SCENE_CLEAR;

            stopSound(audio.gameBGM);

            return true;
        }
    }

    return true;
}

// ============================================================
// Stage 3 platform removal
// ============================================================

function updateStage3Platforms() {

    if (stage !== 3) {
        return;
    }

    // 落下した場合、ランダムに足場を消す
    if (
        player.position.y < -10
    ) {

        const index =
            Math.floor(
                Math.random() * 3
            );

        ground.stage3Removed[index] = true;
    }
}

// ============================================================
// Stage 1 platform removal
// ============================================================

function updateStage1Platform() {

    if (stage !== 1) {
        return;
    }

    if (
        player.position.x >= 58 &&
        player.position.x <= 72 &&
        player.position.y < -5
    ) {

        ground.stage1Platform4Removed = true;
    }
}

// ============================================================
// Update Game
// ============================================================

function updateGame(dt) {

    if (updateClearEffect(dt)) {
        return;
    }

    // カメラ反転
    if (isKeyPressed("KeyR")) {

        cameraReverse =
            !cameraReverse;
    }

    // Player
    player.update(dt);

    // Ground
    checkPlatformCollision();

    // Wall
    checkWallCollision();

    // Stage 2 obstacle
    if (stage === 2) {

        for (const obstacle of movingObstacles) {
            obstacle.update(dt);
        }

        checkObstacleCollision();
    }

    // Stage 4 meteor
    if (stage === 4) {

        for (const meteor of meteors) {
            meteor.update(dt);
        }
    }

    // Fall
    checkFall();

    // Stage platform logic
    updateStage3Platforms();

    updateStage1Platform();

    // Switch
    updateSwitches();

    // Door
    updateDoor(dt);

    // Goal
    updateGoal();

    // Walking sound
    const moving =
        keys["KeyA"] ||
        keys["KeyD"] ||
        keys["KeyS"] ||
        keys["KeyW"];

    if (moving) {

        if (
            audio.walk.paused
        ) {

            playSound(audio.walk);
        }
    }
    else {

        stopSound(audio.walk);
    }
}

// ============================================================
// Draw Title
// ============================================================

function drawTitle() {

    ctx.clearRect(
        0,
        0,
        SCREEN_WIDTH,
        SCREEN_HEIGHT
    );

    // 背景
    ctx.fillStyle = "#10182f";

    ctx.fillRect(
        0,
        0,
        SCREEN_WIDTH,
        SCREEN_HEIGHT
    );

    // タイトル画像
    if (
        images.title.complete &&
        images.title.naturalWidth > 0
    ) {

        ctx.drawImage(
            images.title,
            0,
            0,
            SCREEN_WIDTH,
            SCREEN_HEIGHT
        );
    }

    else {

        ctx.fillStyle = "white";

        ctx.textAlign = "center";

        ctx.font =
            "bold 42px sans-serif";

        ctx.fillText(
            "ゴールのその先へ",
            SCREEN_WIDTH / 2,
            180
        );
    }

    // Sparkle
    drawSparkles();

    // Fキー
    ctx.textAlign = "center";

    ctx.fillStyle = "white";

    ctx.font =
        "bold 24px sans-serif";

    ctx.fillText(
        "Fキーでスタート",
        SCREEN_WIDTH / 2,
        SCREEN_HEIGHT - 80
    );
}

// ============================================================
// Sparkles
// ============================================================

let sparkleTime = 0;

const sparklePositions = [

    [150, 100],
    [300, 250],
    [500, 120],
    [700, 300],
    [820, 150]
];

function drawSparkles() {

    sparkleTime += 0.016;

    for (
        let i = 0;
        i < sparklePositions.length;
        i++
    ) {

        const pos =
            sparklePositions[i];

        const alpha =
            0.3 +
            0.7 *
            (
                0.5 +
                0.5 *
                Math.sin(
                    sparkleTime * 2 + i
                )
            );

        const y =
            pos[1] +
            Math.sin(
                sparkleTime + i
            ) * 10;

        ctx.save();

        ctx.globalAlpha = alpha;

        if (
            images.sparkle.complete &&
            images.sparkle.naturalWidth > 0
        ) {

            ctx.drawImage(
                images.sparkle,
                pos[0] - 15,
                y - 15,
                30,
                30
            );
        }
        else {

            ctx.fillStyle = "white";

            ctx.fillRect(
                pos[0] - 2,
                y - 10,
                4,
                20
            );

            ctx.fillRect(
                pos[0] - 10,
                y - 2,
                20,
                4
            );
        }

        ctx.restore();
    }
}

// ============================================================
// Draw Game
// ============================================================

function drawGame() {

    // 背景
    ctx.fillStyle = "#061020";

    ctx.fillRect(
        0,
        0,
        SCREEN_WIDTH,
        SCREEN_HEIGHT
    );

    // Stage背景
    drawStageBackground();

    // Ground
    drawGround();

    // Stage 2 obstacles
    if (stage === 2) {

        for (const obstacle of movingObstacles) {
            obstacle.draw();
        }
    }

    // Stage 4 meteor
    if (stage === 4) {

        for (const meteor of meteors) {
            meteor.draw();
        }
    }

    // Switches
    if (stage === 1) {

        switches[0].draw();
    }

    if (stage === 2) {

        for (const sw of switches) {
            sw.draw();
        }
    }

    if (stage === 5) {

        drawGoal();

        stage5Switch.draw();
    }

    // Door
    door.draw();

    // Player
    player.draw();

    // Darkness
    drawDarkness();

    // HUD
    drawHUD();
}

// ============================================================
// Background
// ============================================================

function drawStageBackground() {

    let gradient;

    if (stage === 1) {

        gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                SCREEN_HEIGHT
            );

        gradient.addColorStop(
            0,
            "#315b85"
        );

        gradient.addColorStop(
            1,
            "#111827"
        );
    }

    else if (stage === 2) {

        gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                SCREEN_HEIGHT
            );

        gradient.addColorStop(
            0,
            "#1d3557"
        );

        gradient.addColorStop(
            1,
            "#090d18"
        );
    }

    else if (stage === 3) {

        gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                SCREEN_HEIGHT
            );

        gradient.addColorStop(
            0,
            "#111827"
        );

        gradient.addColorStop(
            1,
            "#020617"
        );
    }

    else if (stage === 4) {

        gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                SCREEN_HEIGHT
            );

        gradient.addColorStop(
            0,
            "#090b1a"
        );

        gradient.addColorStop(
            1,
            "#02020a"
        );
    }

    else {

        gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                SCREEN_HEIGHT
            );

        gradient.addColorStop(
            0,
            "#02030a"
        );

        gradient.addColorStop(
            1,
            "#000000"
        );
    }

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        SCREEN_WIDTH,
        SCREEN_HEIGHT
    );

    // Moon
    if (
        stage >= 3 &&
        images.moon.complete &&
        images.moon.naturalWidth > 0
    ) {

        ctx.globalAlpha = 0.9;

        ctx.drawImage(
            images.moon,
            SCREEN_WIDTH - 150,
            20,
            100,
            100
        );

        ctx.globalAlpha = 1;
    }

    // 星
    if (stage >= 3) {

        drawStars();
    }
}

// ============================================================
// Stars
// ============================================================

function drawStars() {

    const stars = [

        [70, 50],
        [180, 100],
        [300, 40],
        [430, 90],
        [560, 50],
        [690, 120],
        [800, 60],
        [150, 220],
        [480, 200],
        [650, 250]
    ];

    for (const star of stars) {

        if (
            images.star.complete &&
            images.star.naturalWidth > 0
        ) {

            ctx.drawImage(
                images.star,
                star[0],
                star[1],
                18,
                18
            );
        }
        else {

            ctx.fillStyle = "white";

            ctx.fillRect(
                star[0],
                star[1],
                3,
                3
            );
        }
    }
}

// ============================================================
// Goal
// ============================================================

function drawGoal() {

    const position =
        new Vector3(
            58,
            3.5,
            0
        );

    const screen =
        worldToScreen(
            position.x,
            position.y,
            position.z
        );

    ctx.save();

    ctx.fillStyle = "gold";

    ctx.fillRect(
        screen.x - 15,
        screen.y - 30,
        30,
        60
    );

    ctx.fillStyle = "#fff7a0";

    ctx.fillRect(
        screen.x - 8,
        screen.y - 23,
        16,
        46
    );

    ctx.restore();
}

// ============================================================
// Darkness
// ============================================================

function drawDarkness() {

    let darkness = 0;

    switch (stage) {

        case 1:
            darkness = 0;
            break;

        case 2:
            darkness = 0.2;
            break;

        case 3:
            darkness = 0.5;
            break;

        case 4:
            darkness = 0.7;
            break;

        case 5:
            darkness =
                0.85 +
                clearBrightness;

            if (darkness > 1) {
                darkness = 1;
            }

            break;
    }

    if (darkness <= 0) {
        return;
    }

    ctx.save();

    ctx.fillStyle =
        `rgba(0,0,0,${darkness})`;

    ctx.fillRect(
        0,
        0,
        SCREEN_WIDTH,
        SCREEN_HEIGHT
    );

    ctx.restore();
}

// ============================================================
// HUD
// ============================================================

function drawHUD() {

    ctx.save();

    ctx.fillStyle =
        "rgba(0,0,0,0.5)";

    ctx.fillRect(
        10,
        10,
        160,
        40
    );

    ctx.fillStyle = "white";

    ctx.font =
        "bold 20px sans-serif";

    ctx.textAlign = "left";

    ctx.fillText(
        `STAGE ${stage}`,
        25,
        37
    );

    ctx.restore();
}

// ============================================================
// Game Clear
// ============================================================

function drawClear() {

    ctx.clearRect(
        0,
        0,
        SCREEN_WIDTH,
        SCREEN_HEIGHT
    );

    if (
        images.clear.complete &&
        images.clear.naturalWidth > 0
    ) {

        ctx.drawImage(
            images.clear,
            0,
            0,
            SCREEN_WIDTH,
            SCREEN_HEIGHT
        );

        return;
    }

    // Clear.pngがない場合
    ctx.fillStyle = "#101827";

    ctx.fillRect(
        0,
        0,
        SCREEN_WIDTH,
        SCREEN_HEIGHT
    );

    ctx.textAlign = "center";

    ctx.fillStyle = "white";

    ctx.font =
        "bold 50px sans-serif";

    ctx.fillText(
        "ゲームクリア！",
        SCREEN_WIDTH / 2,
        SCREEN_HEIGHT / 2 - 20
    );

    ctx.font =
        "bold 24px sans-serif";

    ctx.fillText(
        "Rキーでリトライ",
        SCREEN_WIDTH / 2,
        SCREEN_HEIGHT / 2 + 40
    );

    ctx.fillText(
        "Escキーでタイトルへ",
        SCREEN_WIDTH / 2,
        SCREEN_HEIGHT / 2 + 80
    );
}

// ============================================================
// Main Update
// ============================================================

function update(dt) {

    if (currentScene === SCENE_GAME) {

        updateGame(dt);
    }

    // previousKeys更新
    for (const code in keys) {

        previousKeys[code] =
            keys[code];
    }
}

// ============================================================
// Main Draw
// ============================================================

function draw() {

    if (currentScene === SCENE_TITLE) {

        drawTitle();
    }

    else if (currentScene === SCENE_GAME) {

        drawGame();
    }

    else if (currentScene === SCENE_CLEAR) {

        drawClear();
    }
}

// ============================================================
// Main Loop
// ============================================================

function gameLoop(timestamp) {

    if (!lastTime) {
        lastTime = timestamp;
    }

    let dt =
        (timestamp - lastTime) / 1000;

    lastTime = timestamp;

    // 異常に大きいdtを防ぐ
    if (dt > 0.05) {
        dt = 0.05;
    }

    update(dt);

    draw();

    requestAnimationFrame(gameLoop);
}

// ============================================================
// 初期状態
// ============================================================

currentScene = SCENE_TITLE;

requestAnimationFrame(gameLoop);
