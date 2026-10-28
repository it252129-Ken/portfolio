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

}
