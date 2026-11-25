
/* =========================
   CHRONICLES OF FOURIA
   ゲーム起動・画面管理
========================= */

// ゲーム管理クラス
import GameManager from "./js/GameManager.js";


/* =========================
   ゲーム管理オブジェクト
========================= */

let gameManager = null;


/* =========================
   画面要素の取得
========================= */

const startButton =
    document.getElementById("start-button");

const mapBackButton =
    document.getElementById("map-back-button");

const mapCards =
    document.querySelectorAll(".map-card");

const attackButton =
    document.getElementById("attack-button");

const skillButton =
    document.getElementById("skill-button");

const defendButton =
    document.getElementById("defend-button");

const itemButton =
    document.getElementById("item-button");

const resultMapButton =
    document.getElementById("result-map-button");

const resultTitleButton =
    document.getElementById("result-title-button");


/* =========================
   選択中のマップ
========================= */

let selectedMap = null;


/* =========================
   ゲーム初期化
========================= */

function initializeGame() {

    gameManager = new GameManager();

    gameManager.uiManager.showTitleScreen();

    console.log("CHRONICLES OF FOURIA START");
}


/* =========================
   ゲーム開始
========================= */

function startGame() {

    selectedMap = null;

    gameManager.uiManager.showMapScreen();

}


/* =========================
   マップ選択
========================= */

function selectMap(mapId) {

    selectedMap = mapId;

    // 選択状態を更新
    mapCards.forEach(card => {

        card.classList.remove("selected");

        if (card.dataset.map === mapId) {

            card.classList.add("selected");
        }

    });

    console.log("Selected Map:", mapId);

    // 選択したマップをGameManagerに渡す
    gameManager.selectMap(mapId);

    // マップ決定ボタンを表示
    showMapDecisionButton();
}


/* =========================
   マップ決定ボタン
========================= */

function showMapDecisionButton() {

    let decisionButton =
        document.getElementById("map-decision-button");

    if (!decisionButton) {

        decisionButton =
            document.createElement("button");

        decisionButton.id = "map-decision-button";

        decisionButton.textContent = "このマップで冒険する";

        document.getElementById("map-screen")
            .appendChild(decisionButton);

        decisionButton.addEventListener(
            "click",
            startBattle
        );
    }

    decisionButton.style.display = "block";
}


/* =========================
   戦闘開始
========================= */

function startBattle() {

    if (!selectedMap) {

        alert("マップを選択してください。");

        return;
    }

    // GameManager側で戦闘を開始
    const success = gameManager.startBattle();

    if (!success) {

        alert("戦闘を開始できませんでした。");

        return;
    }

    // 戦闘画面の表示
    gameManager.uiManager.showBattleScreen();

    // マップ名の表示
    gameManager.uiManager.updateMapName();

    // 戦闘メッセージ
    gameManager.uiManager.updateBattleMessage(
        "敵が現れた！戦闘開始！"
    );

    // 戦闘ログ
    gameManager.uiManager.updateStatus();

    console.log("Battle Started!");
}


/* =========================
   マップ選択へ戻る
========================= */

function returnToMap() {

    selectedMap = null;

    mapCards.forEach(card => {

        card.classList.remove("selected");

    });

    const decisionButton =
        document.getElementById("map-decision-button");

    if (decisionButton) {

        decisionButton.style.display = "none";
    }

    gameManager.uiManager.showMapScreen();
}


/* =========================
   タイトルへ戻る
========================= */

function returnToTitle() {

    selectedMap = null;

    mapCards.forEach(card => {

        card.classList.remove("selected");

    });

    const decisionButton =
        document.getElementById("map-decision-button");

    if (decisionButton) {

        decisionButton.style.display = "none";
    }

    initializeGame();
}


/* =========================
   ボタンイベント設定
========================= */

// ゲーム開始
startButton.addEventListener(
    "click",
    startGame
);


// マップ選択
mapCards.forEach(card => {

    card.addEventListener("click", () => {

        selectMap(card.dataset.map);

    });

});


// マップ選択画面から戻る
mapBackButton.addEventListener(
    "click",
    () => {

        gameManager.uiManager.showTitleScreen();

    }
);


// 結果画面からマップ選択へ
resultMapButton.addEventListener(
    "click",
    returnToMap
);


// 結果画面からタイトルへ
resultTitleButton.addEventListener(
    "click",
    returnToTitle
);


/* =========================
   戦闘コマンド
========================= */

// 現在は次の手順で実装予定
// GameManagerとBattleSystemの修正後に接続する

attackButton.addEventListener("click", () => {

    console.log("Attack command selected");

});


skillButton.addEventListener("click", () => {

    console.log("Skill command selected");

});


defendButton.addEventListener("click", () => {

    console.log("Defend command selected");

});


itemButton.addEventListener("click", () => {

    console.log("Item command selected");

});


/* =========================
   起動
========================= */

initializeGame();
