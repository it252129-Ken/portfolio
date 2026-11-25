
/* =========================
   CHRONICLES OF FOURIA
   画面管理クラス
========================= */

export default class UIManager {

    constructor(gameManager) {

        // ゲーム管理クラス
        this.gameManager = gameManager;

        // 画面表示用の要素
        this.elements = {

            title: document.getElementById("title-screen"),

            map: document.getElementById("map-screen"),

            battle: document.getElementById("battle-screen"),

            result: document.getElementById("result-screen"),

            mapList: document.getElementById("map-list"),

            partyStatus: document.getElementById("party-status"),

            enemyStatus: document.getElementById("enemy-status"),

            battleLog: document.getElementById("battle-log"),

            resultTitle: document.getElementById("result-title"),

            resultDescription: document.getElementById("result-description")
        };
    }


    /* =========================
       すべての画面を非表示
    ========================= */

    hideAllScreens() {

        const screens = [
            this.elements.title,
            this.elements.map,
            this.elements.battle,
            this.elements.result
        ];

        for (const screen of screens) {

            if (screen) {
                screen.style.display = "none";
            }
        }
    }


    /* =========================
       タイトル画面
    ========================= */

    showTitleScreen() {

        this.hideAllScreens();

        if (this.elements.title) {
            this.elements.title.style.display = "flex";
        }
    }


    /* =========================
       マップ選択画面
    ========================= */

    showMapScreen() {

        this.hideAllScreens();

        if (this.elements.map) {
            this.elements.map.style.display = "block";
        }

        this.updateMapList();
    }


    /* =========================
       戦闘画面
    ========================= */

    showBattleScreen() {

        this.hideAllScreens();

        if (this.elements.battle) {
            this.elements.battle.style.display = "block";
        }

        this.updateStatus();
    }


    /* =========================
       結果画面
    ========================= */

    showResultScreen(result) {

        this.hideAllScreens();

        if (this.elements.result) {
            this.elements.result.style.display = "flex";
        }

        if (result === "victory") {

            this.elements.resultTitle.textContent = "VICTORY!";

            this.elements.resultDescription.textContent =
                "敵をすべて倒した！冒険の勝利だ！";

        } else {

            this.elements.resultTitle.textContent = "GAME OVER";

            this.elements.resultDescription.textContent =
                "パーティーは全滅してしまった……";
        }
    }


    /* =========================
       マップ一覧を更新
    ========================= */

    updateMapList() {

        const container = this.elements.mapList;

        if (!container) {
            return;
        }

        container.innerHTML = "";

        for (const map of Object.values(this.gameManager.maps)) {

            const button = document.createElement("button");

            button.textContent =
                `${map.name}（難易度 ${map.difficulty}）`;

            button.addEventListener("click", () => {

                this.gameManager.selectMap(map.id);
            });

            container.appendChild(button);
        }
    }


    /* =========================
       ステータスを更新
    ========================= */

    updateStatus() {

        this.updatePartyStatus();

        this.updateEnemyStatus();
    }


    /* =========================
       味方ステータスを更新
    ========================= */

    updatePartyStatus() {

        const container = this.elements.partyStatus;

        if (!container) {
            return;
        }

        container.innerHTML = "";

        for (const character of this.gameManager.party) {

            const div = document.createElement("div");

            div.className = "status-item";

            div.textContent =
                `${character.name} HP: ${character.hp}/${character.maxHp} MP: ${character.mp}/${character.maxMp}`;

            if (!character.isAlive()) {
                div.textContent += "（戦闘不能）";
            }

            container.appendChild(div);
        }
    }


    /* =========================
       敵ステータスを更新
    ========================= */

    updateEnemyStatus() {

        const container = this.elements.enemyStatus;

        if (!container) {
            return;
        }

        container.innerHTML = "";

        for (const enemy of this.gameManager.enemies) {

            const div = document.createElement("div");

            div.className = "status-item";

            div.textContent =
                `${enemy.name} HP: ${enemy.hp}/${enemy.maxHp}`;

            if (!enemy.alive || enemy.hp <= 0) {
                div.textContent += "（撃破）";
            }

            container.appendChild(div);
        }
    }


    /* =========================
       戦闘ログを更新
    ========================= */

    updateBattleLog(logs) {

        const container = this.elements.battleLog;

        if (!container) {
            return;
        }

        container.innerHTML = "";

        for (const message of logs) {

            const div = document.createElement("div");

            div.textContent = message;

            container.appendChild(div);
        }

        // 最新ログが見える位置へ移動
        container.scrollTop = container.scrollHeight;
    }


    /* =========================
       画面を更新
    ========================= */

    update() {

        this.updateStatus();
    }

}
