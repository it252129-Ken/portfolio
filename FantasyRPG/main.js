
/* =========================
   CHRONICLES OF FOURIA
   ゲーム起動・画面管理
========================= */


/* =========================
   画面要素の取得
========================= */

const titleScreen = document.getElementById("title-screen");
const mapScreen = document.getElementById("map-screen");
const battleScreen = document.getElementById("battle-screen");

const startButton = document.getElementById("start-button");
const mapBackButton = document.getElementById("map-back-button");

const mapCards = document.querySelectorAll(".map-card");

const battleMapName = document.getElementById("battle-map-name");
const battleMessage = document.getElementById("battle-message");


/* =========================
   マップ情報
========================= */

const maps = {

    grassland: {
        name: "緑の平原"
    },

    volcano: {
        name: "灼熱の火山"
    },

    snow: {
        name: "氷結の雪山"
    },

    castle: {
        name: "暗黒の古城"
    }

};


/* =========================
   選択中のマップ
========================= */

let selectedMap = null;


/* =========================
   画面切り替え
========================= */

function changeScreen(screenName) {

    titleScreen.classList.add("hidden");
    mapScreen.classList.add("hidden");
    battleScreen.classList.add("hidden");

    if (screenName === "title") {

        titleScreen.classList.remove("hidden");

    }

    else if (screenName === "map") {

        mapScreen.classList.remove("hidden");

    }

    else if (screenName === "battle") {

        battleScreen.classList.remove("hidden");

    }

}


/* =========================
   ゲームスタート
========================= */

startButton.addEventListener("click", () => {

    console.log("GAME START");

    changeScreen("map");

});


/* =========================
   マップ選択
========================= */

mapCards.forEach(card => {

    card.addEventListener("click", () => {

        // 選択状態をリセット
        mapCards.forEach(otherCard => {

            otherCard.classList.remove("selected");

        });

        // クリックしたマップを選択
        card.classList.add("selected");

        selectedMap = card.dataset.map;

        console.log("選択したマップ：", maps[selectedMap].name);

        // 決定ボタンを表示
        showMapDecisionButton();

    });

});


/* =========================
   マップ決定ボタン
========================= */

function showMapDecisionButton() {

    let decisionButton = document.getElementById("map-decision-button");

    if (decisionButton) {
        return;
    }

    decisionButton = document.createElement("button");

    decisionButton.id = "map-decision-button";
    decisionButton.textContent = "このエリアに進む";

    decisionButton.style.marginTop = "15px";
    decisionButton.style.padding = "14px 35px";
    decisionButton.style.border = "2px solid #e8c879";
    decisionButton.style.borderRadius = "6px";
    decisionButton.style.background = "#80602c";
    decisionButton.style.color = "#fff2cc";
    decisionButton.style.fontSize = "18px";

    mapScreen.appendChild(decisionButton);

    decisionButton.addEventListener("click", startBattle);

}


/* =========================
   戦闘開始
========================= */

function startBattle() {

    if (!selectedMap) {
        return;
    }

    const mapData = maps[selectedMap];

    console.log(mapData.name + "の冒険を開始します！");

    battleMapName.textContent = mapData.name;

    battleMessage.textContent =
        mapData.name + "の冒険が始まった！";

    changeScreen("battle");

}


/* =========================
   マップ画面へ戻る
========================= */

mapBackButton.addEventListener("click", () => {

    changeScreen("title");

});


/* =========================
   初期画面
========================= */

changeScreen("title");

console.log("CHRONICLES OF FOURIA 起動完了！");
