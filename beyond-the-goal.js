// ============================================================
// Beyond the goal - 2D横スクロール版
// 操作：Fスタート / A・D移動 / SPACEジャンプ / Qスイッチ
//       Eドア / Rリトライ / ESCタイトル
// ============================================================

"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const SCREEN_WIDTH = canvas.width;
const SCREEN_HEIGHT = canvas.height;

// ------------------------------
// シーン・ゲーム状態
// ------------------------------
const SCENE_TITLE = 0;
const SCENE_GAME = 1;
const SCENE_CLEAR = 2;

let currentScene = SCENE_TITLE;
let stage = 1;
let cameraX = 0;
let lastTime = 0;
let clearTimer = 0;
let clearEffect = false;
let clearBrightness = 0;
let sparkleTime = 0;
let stageTime = 0;
let switchOrder = 0;
let changingStage = false;

const keys = Object.create(null);
const previousKeys = Object.create(null);

function isKeyPressed(code) {
    return !!keys[code] && !previousKeys[code];
}

window.addEventListener("keydown", (event) => {
    keys[event.code] = true;
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
        event.preventDefault();
    }

    if (event.repeat) return;

    if (currentScene === SCENE_TITLE && event.code === "KeyF") {
        startGame();
    } else if (currentScene === SCENE_CLEAR) {
        if (event.code === "KeyR") startGame();
        if (event.code === "Escape") returnToTitle();
    } else if (currentScene === SCENE_GAME) {
        if (event.code === "Escape") returnToTitle();
        if (event.code === "KeyR") restartStage();
    }
});

window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
});

/* ------------------------------
   スマートフォン用タッチ操作
   ------------------------------ */
function setupTouchControls() {
    // 左右移動は押している間だけ入力する
    [["touchLeft", "KeyA"], ["touchRight", "KeyD"]].forEach(([id, code]) => {
        const button = document.getElementById(id);
        if (!button) return;

        const release = () => {
            keys[code] = false;
            button.classList.remove("is-pressed");
        };

        button.addEventListener("pointerdown", event => {
            event.preventDefault();
            keys[code] = true;
            button.classList.add("is-pressed");
            try { button.setPointerCapture(event.pointerId); } catch (_) {}
        });
        button.addEventListener("pointerup", release);
        button.addEventListener("pointercancel", release);
        button.addEventListener("lostpointercapture", release);
        button.addEventListener("contextmenu", event => event.preventDefault());
    });

    // ジャンプ・スイッチ・ドアはキー入力を短く送る
    function tapKey(code) {
        keys[code] = true;
        window.setTimeout(() => { keys[code] = false; }, 120);
    }

    [["touchJump", "Space"], ["touchSwitch", "KeyQ"], ["touchDoor", "KeyE"]]
        .forEach(([id, code]) => {
            const button = document.getElementById(id);
            if (!button) return;
            button.addEventListener("pointerdown", event => {
                event.preventDefault();
                tapKey(code);
                button.classList.add("is-pressed");
            });
            const release = () => button.classList.remove("is-pressed");
            button.addEventListener("pointerup", release);
            button.addEventListener("pointercancel", release);
            button.addEventListener("contextmenu", event => event.preventDefault());
        });

    const startButton = document.getElementById("touchStart");
    if (startButton) startButton.addEventListener("click", () => {
        if (currentScene === SCENE_TITLE) startGame();
    });

    const retryButton = document.getElementById("touchRetry");
    if (retryButton) retryButton.addEventListener("click", () => {
        if (currentScene === SCENE_CLEAR) startGame();
        else if (currentScene === SCENE_GAME) restartStage();
    });

    const titleButton = document.getElementById("touchTitle");
    if (titleButton) titleButton.addEventListener("click", () => {
        if (currentScene !== SCENE_TITLE) returnToTitle();
    });
}

function updateTouchSceneButtons() {
    const startButton = document.getElementById("touchStart");
    const retryButton = document.getElementById("touchRetry");
    const titleButton = document.getElementById("touchTitle");
    if (startButton) startButton.hidden = currentScene !== SCENE_TITLE;
    if (retryButton) retryButton.hidden = currentScene === SCENE_TITLE;
    if (titleButton) titleButton.hidden = currentScene === SCENE_TITLE;
}

setupTouchControls();

// ------------------------------
// 画像・音声
// ------------------------------
const images = {};
function loadImage(name, path) {
    const img = new Image();
    img.src = path;
    images[name] = img;
    return img;
}

loadImage("title", "Release/Title.png");
loadImage("clear", "Release/Clear.png");
loadImage("star", "Release/Star.png");
loadImage("moon", "Release/Moon.png");
loadImage("sparkle", "Release/Sparkle.png");

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
audio.walk.loop = true;
audio.titleBGM.volume = 0.45;
audio.gameBGM.volume = 0.45;

function playSound(sound) {
    if (!sound) return;
    try {
        sound.currentTime = 0;
        const promise = sound.play();
        if (promise && promise.catch) promise.catch(() => {});
    } catch (_) {}
}

function stopSound(sound) {
    if (!sound) return;
    try {
        sound.pause();
        sound.currentTime = 0;
    } catch (_) {}
}

function stopAllAudio() {
    Object.values(audio).forEach(stopSound);
}

// ------------------------------
// ステージデータ（すべて2D）
// x,yは足場左上のワールド座標
// ------------------------------
const FLOOR_Y = 420;

const stageData = {
    1: {
        width: 1900,
        spawn: { x: 70, y: FLOOR_Y - 42 },
        platforms: [
            [0, FLOOR_Y, 430, 80],
            [500, 370, 150, 24],
            [700, 320, 150, 24],
            [900, FLOOR_Y, 340, 80],
            [1320, 365, 150, 24],
            [1530, 315, 160, 24],
            [1740, FLOOR_Y, 160, 80]
        ],
        switch: { x: 270, y: FLOOR_Y - 30 },
        door: { x: 1780, y: FLOOR_Y - 76 },
        wall: { x: 430, y: 300, w: 28, h: 120 },
        hazards: []
    },
    2: {
        width: 2200,
        spawn: { x: 70, y: FLOOR_Y - 42 },
        platforms: [
            [0, FLOOR_Y, 300, 80], [350, 370, 150, 24],
            [560, 330, 150, 24], [770, 370, 150, 24],
            [980, FLOOR_Y, 300, 80], [1330, 370, 150, 24],
            [1540, 330, 150, 24], [1750, 370, 150, 24],
            [1970, FLOOR_Y, 230, 80]
        ],
        switches: [
            { x: 180, y: FLOOR_Y - 30 },
            { x: 420, y: 340 },
            { x: 630, y: 300 },
            { x: 840, y: 340 },
            { x: 1120, y: FLOOR_Y - 30 }
        ],
        door: { x: 2070, y: FLOOR_Y - 76 },
        wall: { x: 1280, y: 285, w: 28, h: 135 },
        hazards: [
            { x: 520, y: 380, min: 300, max: 500, speed: 100, dir: 1 },
            { x: 1450, y: 380, min: 1350, max: 1660, speed: 125, dir: -1 }
        ]
    },
    3: {
        width: 1850,
        spawn: { x: 70, y: FLOOR_Y - 42 },
        platforms: [
            [0, FLOOR_Y, 250, 80], [310, 365, 125, 22],
            [500, 315, 125, 22], [690, 265, 125, 22],
            [880, 315, 125, 22], [1070, 365, 125, 22],
            [1260, 315, 125, 22], [1450, FLOOR_Y, 400, 80],
            [1550, FLOOR_Y, 400, 80]
        ],
        door: { x: 1650, y: FLOOR_Y - 76 },
        disappearing: [1, 2, 3, 4, 5, 6],
        hazards: []
    },
    4: {
        width: 2100,
        spawn: { x: 70, y: FLOOR_Y - 42 },
        platforms: [
            [0, FLOOR_Y, 330, 80], [390, 365, 150, 24],
            [600, 320, 150, 24], [810, 365, 150, 24],
            [1020, FLOOR_Y, 300, 80], [1370, 365, 150, 24],
            [1580, 320, 150, 24], [1790, FLOOR_Y, 310, 80]
        ],
        door: { x: 1950, y: FLOOR_Y - 76 },
        hazards: [],
        meteors: true
    },
    5: {
        width: 1900,
        spawn: { x: 70, y: FLOOR_Y - 42 },
        platforms: [
            [0, FLOOR_Y, 280, 80], [340, 370, 130, 24],
            [520, 325, 130, 24], [700, 280, 130, 24],
            [880, 325, 130, 24], [1060, 370, 130, 24],
            [1240, FLOOR_Y, 250, 80], [1530, 360, 140, 24],
            [1720, FLOOR_Y, 180, 80]
        ],
        switch: { x: 1320, y: FLOOR_Y - 30 },
        wall: { x: 1490, y: 280, w: 28, h: 140 },
        goal: { x: 1815, y: FLOOR_Y - 90 },
        hazards: []
    }
};

let player;
let door;
let switches = [];
let obstacles = [];
let meteors = [];
let removedPlatforms = new Set();
let platformRespawnTimers = new Map();
let wallOpen = false;
let platformTimer = 0;
const PLATFORM_RESPAWN_TIME = 5;

class Player {
    constructor() {
        this.width = 28;
        this.height = 42;
        this.speed = 260;
        this.jumpPower = 610;
        this.x = 70;
        this.y = FLOOR_Y - this.height;
        this.vx = 0;
        this.vy = 0;
        this.grounded = false;
        this.facing = 1;
        this.previousY = this.y;
    }

    reset(position) {
        this.x = position.x;
        this.y = position.y;
        this.vx = 0;
        this.vy = 0;

    this.grounded = false;
        this.previousY = this.y;
        this.facing = 1;
    }

    update(dt) {
        this.previousY = this.y;
        this.vx = 0;

        if (keys["KeyA"] || keys["ArrowLeft"]) {
            this.vx = -this.speed;
            this.facing = -1;
        }
        if (keys["KeyD"] || keys["ArrowRight"]) {
            this.vx = this.speed;
            this.facing = 1;
        }

        if ((isKeyPressed("Space") || isKeyPressed("ArrowUp")) && this.grounded) {
            this.vy = -this.jumpPower;
            this.grounded = false;
            playSound(audio.button);
        }

        this.x += this.vx * dt;
        this.x = Math.max(0, Math.min(stageData[stage].width - this.width, this.x));

        this.vy += 1550 * dt;
        this.y += this.vy * dt;
    }

    draw() {
        const sx = this.x - cameraX;
        const sy = this.y;

        ctx.save();
        // 影
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.ellipse(sx + this.width / 2, sy + this.height + 3, 17, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // プレイヤー本体
        ctx.fillStyle = "#f3f7ff";
        ctx.fillRect(sx + 4, sy + 8, this.width - 8, this.height - 8);
        ctx.fillStyle = "#39d6c8";
        ctx.fillRect(sx + 2, sy + 18, this.width - 4, 12);
        ctx.fillStyle = "#142b3b";
        const eyeX = this.facing > 0 ? sx + 19 : sx + 7;
        ctx.fillRect(eyeX, sy + 13, 4, 4);
        ctx.restore();
    }
}

class SwitchObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.pressed = false;
    }
    reset() { this.pressed = false; }
    press() {
        this.pressed = true;
        playSound(audio.button);
    }
    draw() {
        const sx = this.x - cameraX;
        ctx.save();
        ctx.fillStyle = this.pressed ? "#42ff91" : "#ffe45c";
        ctx.fillRect(sx - 13, this.y - 8, 26, 16);
        ctx.fillStyle = "#fff8c2";
        ctx.fillRect(sx - 7, this.y - 5, 14, 5);
        ctx.restore();
    }
}

class Door {
    constructor(x, y) {
        this.setPosition(x, y);
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.openAmount = 0;
        this.opening = false;
    }
    open() {
        if (!this.opening && this.openAmount < 1) {
            this.opening = true;
            playSound(audio.doorOpen);
        }
    }
    update(dt) {
        if (!this.opening) return;
        this.openAmount = Math.min(1, this.openAmount + dt * 1.8);
    }
    isOpen() { return this.openAmount >= 1; }
    draw() {
        const sx = this.x - cameraX;
        ctx.save();
        ctx.fillStyle = "#58351f";
        ctx.fillRect(sx - 20, this.y, 40, 76);
        ctx.fillStyle = "#b77b3d";
        ctx.fillRect(sx - 15 + this.openAmount * 27, this.y + 5, 30, 66);
        ctx.fillStyle = "#ffe18a";
        ctx.beginPath();
        ctx.arc(sx + 8, this.y + 39, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function createStageObjects() {
    const data = stageData[stage];
    player = new Player();
    player.reset(data.spawn);
    const doorPosition = data.door || { x: data.width - 90, y: FLOOR_Y - 76 };
    door = new Door(doorPosition.x, doorPosition.y);
    switches = [];
    if (data.switch) switches.push(new SwitchObject(data.switch.x, data.switch.y));
    if (data.switches) {
        data.switches.forEach(s => switches.push(new SwitchObject(s.x, s.y)));
    }
    obstacles = (data.hazards || []).map(h => ({ ...h }));
    meteors = [];
    if (data.meteors) {
        for (let i = 0; i < 7; i++) {
            meteors.push({
                x: 300 + i * 250,
                y: -100 - Math.random() * 500,
                speed: 280 + Math.random() * 180,
                radius: 9 + Math.random() * 5
            });
        }
    }
    removedPlatforms = new Set();
    wallOpen = false;
    switchOrder = 0;
    changingStage = false;
    platformTimer = 0;
    stageTime = 0;
    cameraX = 0;
    platformRespawnTimers = new Map();
}

function startGame() {
    stopAllAudio();
    playSound(audio.state);
    currentScene = SCENE_GAME;
    stage = 1;
    clearEffect = false;
    clearBrightness = 0;
    clearTimer = 0;
    createStageObjects();
    playSound(audio.gameBGM);
}

function restartStage() {
    stopSound(audio.walk);
    createStageObjects();
    playSound(audio.gameBGM);
}

function returnToTitle() {
    stopAllAudio();
    currentScene = SCENE_TITLE;
    playSound(audio.titleBGM);
}

function changeStage(nextStage) {
    if (nextStage > 5) {
        currentScene = SCENE_CLEAR;
        stopSound(audio.gameBGM);
        stopSound(audio.walk);
        return;
    }
    stage = nextStage;
    createStageObjects();
}

function distanceToObject(x, y) {
    const px = player.x + player.width / 2;
    const py = player.y + player.height / 2;
    return Math.hypot(px - x, py - y);
}

// ------------------------------
// 当たり判定
// ------------------------------
function getActivePlatforms() {
    return stageData[stage].platforms
        .map((p, index) => ({ x: p[0], y: p[1], w: p[2], h: p[3], index }))
        .filter(p => !removedPlatforms.has(p.index));
}

function checkPlatformCollision() {
    player.grounded = false;
    const oldBottom = player.previousY + player.height;
    const newBottom = player.y + player.height;

    for (const p of getActivePlatforms()) {
        const overlapsX = player.x + player.width > p.x && player.x < p.x + p.w;
        const crossedTop = oldBottom <= p.y + 8 && newBottom >= p.y && player.vy >= 0;
        if (overlapsX && crossedTop) {
            player.y = p.y - player.height;
            player.vy = 0;
            player.grounded = true;
            break;
        }
    }
}

function checkWallCollision() {
    const wall = stageData[stage].wall;
    if (!wall || wallOpen) return;

    const overlaps = player.x + player.width > wall.x &&
        player.x < wall.x + wall.w &&
        player.y + player.height > wall.y &&
        player.y < wall.y + wall.h;

    if (overlaps) {
        if (player.vx > 0) player.x = wall.x - player.width;
        else if (player.vx < 0) player.x = wall.x + wall.w;
    }
}

function respawn() {
    playSound(audio.falling);
    player.reset(stageData[stage].spawn);
}

function checkHazardCollisions() {
    for (const h of obstacles) {
        if (Math.abs((player.x + player.width / 2) - h.x) < 24 &&
            Math.abs((player.y + player.height) - h.y) < 30) {
            respawn();
        }
    }

    for (const m of meteors) {
        if (Math.hypot(player.x + player.width / 2 - m.x, player.y + player.height / 2 - m.y) < m.radius + 17) {
            respawn();
            m.y = -100;
        }
    }
}

// ------------------------------
// スイッチ・ドア・ゴール
// ------------------------------
function updateSwitches() {
    if (!isKeyPressed("KeyQ")) return;

    if (stage === 1 && switches[0] && !switches[0].pressed &&
        distanceToObject(switches[0].x, switches[0].y) < 65) {
        switches[0].press();
        wallOpen = true;
        playSound(audio.open);
    }

    if (stage === 2) {
        for (let i = 0; i < switches.length; i++) {
            const sw = switches[i];
            if (!sw.pressed && distanceToObject(sw.x, sw.y) < 65) {
                if (i === switchOrder) {
                    sw.press();
                    switchOrder++;
                    if (switchOrder === switches.length) {
                        wallOpen = true;
                        playSound(audio.open);
                    }
                } else {
                    switchOrder = 0;
                    switches.forEach(s => s.reset());
                    playSound(audio.button);
                }
                break;
            }
        }
    }

    if (stage === 5 && switches[0] && !switches[0].pressed &&
        distanceToObject(switches[0].x, switches[0].y) < 65) {
        switches[0].press();
        wallOpen = true;
        playSound(audio.open);
    }
}


function updateDoor(dt) {
    if (stage === 5) return;

    door.update(dt);

    if (
        distanceToObject(door.x, door.y + 38) < 75 &&
        isKeyPressed("KeyE") &&
        !changingStage
    ) {
        if ((stage === 1 || stage === 2) && !wallOpen) {
            playSound(audio.button);
            return;
        }

        door.open();
        changingStage = true;
    }

    if (changingStage && door.isOpen()) {
        changingStage = false;
        changeStage(stage + 1);
    }
}

// ------------------------------
// ステージごとのギミック更新
// ------------------------------
function updateStageMechanics(dt) {
    stageTime += dt;

    // ステージ3：消える足場と5秒後の復活
    if (stage === 3) {

        // 消えた足場の復活タイマーを更新
        for (const [index, timer] of platformRespawnTimers) {
            const newTimer = timer - dt;

            if (newTimer <= 0) {
                removedPlatforms.delete(index);
                platformRespawnTimers.delete(index);
            } else {
                platformRespawnTimers.set(index, newTimer);
            }
        }

        // 2.5秒ごとに足場をランダムで消す
        platformTimer += dt;

        if (platformTimer >= 2.5) {
            platformTimer = 0;

            const candidates = stageData[3].disappearing;

            // 現在表示されている足場だけを選ぶ
            const available = candidates.filter(index =>
                !removedPlatforms.has(index)
            );

            if (available.length > 0) {
                const index = available[
                    Math.floor(Math.random() * available.length)
                ];

                removedPlatforms.add(index);

                // 5秒後に復活するタイマーを設定
                platformRespawnTimers.set(
                    index,
                    PLATFORM_RESPAWN_TIME
                );
            }
        }
    }

    // 敵の移動
    for (const h of obstacles) {
        h.x += h.speed * h.dir * dt;

        if (h.x < h.min || h.x > h.max) {
            h.dir *= -1;
        }
    }

    // 隕石の移動
    for (const m of meteors) {
        m.y += m.speed * dt;

        if (m.y > SCREEN_HEIGHT + 40) {
            m.y = -30 - Math.random() * 300;
            m.x = cameraX + Math.random() * SCREEN_WIDTH;
        }
    }
}


// ------------------------------
// 更新
// ------------------------------
function updateGame(dt) {
    if (clearEffect) {
        clearBrightness = Math.min(1, clearBrightness + dt * 0.8);
        if (clearBrightness >= 1) {
            clearTimer += dt;
            if (clearTimer > 1.1) {
                currentScene = SCENE_CLEAR;
                stopSound(audio.gameBGM);
                stopSound(audio.walk);
            }
        }
        return;
    }

    player.update(dt);
    checkPlatformCollision();
    checkWallCollision();

    if (player.y > SCREEN_HEIGHT + 250) respawn();

    updateStageMechanics(dt);
    checkHazardCollisions();
    updateSwitches();
    updateDoor(dt);
    updateGoal();

    const targetCamera = player.x + player.width / 2 - SCREEN_WIDTH * 0.38;
    cameraX += (targetCamera - cameraX) * Math.min(1, dt * 6);
    cameraX = Math.max(0, Math.min(stageData[stage].width - SCREEN_WIDTH, cameraX));

    if (Math.abs(player.vx) > 0 && player.grounded) {
        if (audio.walk.paused) playSound(audio.walk);
    } else {
        stopSound(audio.walk);
    }
}

// ------------------------------
// 描画
// ------------------------------
function drawBackground() {
    const colors = {
        1: ["#315b85", "#111827"],
        2: ["#1d3557", "#090d18"],
        3: ["#111827", "#020617"],
        4: ["#090b1a", "#02020a"],
        5: ["#02030a", "#000000"]
    };
    const gradient = ctx.createLinearGradient(0, 0, 0, SCREEN_HEIGHT);
    gradient.addColorStop(0, colors[stage][0]);
    gradient.addColorStop(1, colors[stage][1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 遠景の星
    if (stage >= 3) {
        for (let i = 0; i < 45; i++) {
            const x = ((i * 173 - cameraX * 0.15) % (SCREEN_WIDTH + 40) + SCREEN_WIDTH + 40) % (SCREEN_WIDTH + 40);
            const y = (i * 67) % 260;
            ctx.globalAlpha = 0.35 + 0.45 * Math.sin(stageTime * 2 + i);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x, y, 2, 2);
        }
        ctx.globalAlpha = 1;
    }

    if (stage >= 3 && images.moon && images.moon.complete && images.moon.naturalWidth > 0) {
        ctx.globalAlpha = 0.8;
        ctx.drawImage(images.moon, SCREEN_WIDTH - 145, 28, 95, 95);
        ctx.globalAlpha = 1;
    }

    // 背景の遠い山
    ctx.fillStyle = "rgba(5,12,28,0.35)";
    ctx.beginPath();
    ctx.moveTo(0, 390);
    for (let x = 0; x <= SCREEN_WIDTH + 100; x += 100) {
        ctx.lineTo(x, 300 + Math.sin((x + cameraX * 0.2) * 0.008) * 35);
    }
    ctx.lineTo(SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.lineTo(0, SCREEN_HEIGHT);
    ctx.closePath();
    ctx.fill();
}

function drawPlatforms() {
    for (const p of getActivePlatforms()) {
        const x = p.x - cameraX;
        if (x + p.w < -20 || x > SCREEN_WIDTH + 20) continue;

        ctx.fillStyle = "#394b60";
        ctx.fillRect(x, p.y, p.w, p.h);
        ctx.fillStyle = "#39d6c8";
        ctx.fillRect(x, p.y, p.w, 6);
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillRect(x + 8, p.y + 12, Math.max(0, p.w - 16), 3);
    }
}

function drawWall() {
    const wall = stageData[stage].wall;
    if (!wall || wallOpen) return;
    const x = wall.x - cameraX;
    ctx.fillStyle = "#7d2832";
    ctx.fillRect(x, wall.y, wall.w, wall.h);
    ctx.fillStyle = "#e05b62";
    ctx.fillRect(x + 5, wall.y, 5, wall.h);
}

function drawHazards() {
    for (const h of obstacles) {
        const x = h.x - cameraX;
        ctx.fillStyle = "#16191f";
        ctx.fillRect(x - 18, h.y - 18, 36, 18);
        ctx.fillStyle = "#ff4c5b";
        ctx.beginPath();
        ctx.moveTo(x - 22, h.y - 18);
        ctx.lineTo(x, h.y - 42);
        ctx.lineTo(x + 22, h.y - 18);
        ctx.closePath();
        ctx.fill();
    }

    for (const m of meteors) {
        const x = m.x - cameraX;
        ctx.fillStyle = "rgba(255,100,45,0.2)";
        ctx.beginPath();
        ctx.arc(x, m.y, m.radius * 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff673d";
        ctx.beginPath();
        ctx.arc(x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawSwitches() {
    switches.forEach(sw => sw.draw());
}

function drawGoal() {
    const goal = stageData[5].goal;
    const x = goal.x - cameraX;
    const y = goal.y;
    ctx.save();
    ctx.shadowColor = "#ffe66d";
    ctx.shadowBlur = 22;
    ctx.fillStyle = "#ffe66d";
    ctx.fillRect(x - 22, y, 44, 90);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fff8c7";
    ctx.fillRect(x - 11, y + 10, 22, 70);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("GOAL", x, y - 12);
    ctx.restore();
}

function drawHUD() {
    ctx.fillStyle = "rgba(0,0,0,0.48)";
    ctx.fillRect(14, 14, 155, 42);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`STAGE ${stage} / 5`, 27, 42);

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.textAlign = "right";
    ctx.fillText("A/D:移動  SPACE:ジャンプ  Q:スイッチ  E:ドア  R:リトライ", SCREEN_WIDTH - 18, 28);
}

function drawDarkness() {
    const darkness = [0, 0.08, 0.16, 0.25, 0.32, 0.38][stage];
    if (darkness <= 0) return;
    ctx.fillStyle = `rgba(0,0,0,${darkness})`;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

function drawGame() {
    drawBackground();
    drawPlatforms();
    drawWall();
    drawHazards();
    drawSwitches();
    if (stage !== 5) door.draw();
    if (stage === 5) drawGoal();
    player.draw();
    drawDarkness();
    if (clearEffect) {
        ctx.fillStyle = `rgba(255,255,255,${clearBrightness})`;
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }
    drawHUD();
}

function drawSparkles() {
    sparkleTime += 0.016;
    const positions = [[130, 100], [300, 260], [520, 120], [740, 300], [850, 160]];
    positions.forEach((p, i) => {
        const alpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(sparkleTime * 2 + i));
        ctx.globalAlpha = alpha;
        if (images.sparkle && images.sparkle.complete && images.sparkle.naturalWidth > 0) {
            ctx.drawImage(images.sparkle, p[0] - 15, p[1] - 15, 30, 30);
        } else {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(p[0] - 2, p[1] - 10, 4, 20);
            ctx.fillRect(p[0] - 10, p[1] - 2, 20, 4);
        }
    });
    ctx.globalAlpha = 1;
}

function drawTitle() {
    ctx.fillStyle = "#10182f";
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    if (images.title && images.title.complete && images.title.naturalWidth > 0) {
        ctx.drawImage(images.title, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    } else {
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.font = "bold 48px sans-serif";
        ctx.fillText("ゴールのその先へ", SCREEN_WIDTH / 2, 190);
        ctx.font = "22px sans-serif";
        ctx.fillText("Beyond the goal", SCREEN_WIDTH / 2, 235);
    }
    drawSparkles();
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 25px sans-serif";
    ctx.fillText("Fキーでスタート", SCREEN_WIDTH / 2, SCREEN_HEIGHT - 75);
}

function drawClear() {
    if (images.clear && images.clear.complete && images.clear.naturalWidth > 0) {
        ctx.drawImage(images.clear, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    } else {
        ctx.fillStyle = "#101827";
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 52px sans-serif";
        ctx.fillText("ゲームクリア！", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 25);
        ctx.font = "24px sans-serif";
        ctx.fillText("Rキーで最初からプレイ", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 35);
        ctx.fillText("Escキーでタイトルへ", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 78);
    }
}

// ------------------------------
// メインループ
// ------------------------------
function update(dt) {
    if (currentScene === SCENE_GAME) updateGame(dt);
    updateTouchSceneButtons();
    for (const code in keys) previousKeys[code] = keys[code];
}

function draw() {
    if (currentScene === SCENE_TITLE) drawTitle();
    else if (currentScene === SCENE_GAME) drawGame();
    else if (currentScene === SCENE_CLEAR) drawClear();
}

function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    let dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    dt = Math.min(dt, 0.05);
    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
}

// 初期画面
currentScene = SCENE_TITLE;
playSound(audio.titleBGM);
requestAnimationFrame(gameLoop);
