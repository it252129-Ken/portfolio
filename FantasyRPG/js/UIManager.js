
/* =========================
   CHRONICLES OF FOURIA
   画面・UI管理クラス
========================= */

export default class UIManager {

    constructor(gameManager) {

        this.gameManager = gameManager;

        // 画面
        this.titleScreen = document.getElementById("title-screen");
        this.mapScreen = document.getElementById("map-screen");
        this.battleScreen = document.getElementById("battle-screen");
        this.resultScreen = document.getElementById("result-screen");

        // マップ
        this.mapContainer = document.getElementById("map-container");

        // 戦闘画面
        this.battleMapName = document.getElementById("battle-map-name");
        this.battleMessage = document.getElementById("battle-message");

        // ステータス
        this.partyStatus = document.getElementById("party-status");
        this.enemyStatus = document.getElementById("enemy-status");

        // 戦闘ログ
        this.battleLog = document.getElementById("battle-log");

        // 結果画面
        this.resultTitle = document.getElementById("result-title");
        this.resultDescription = document.getElementById("result-description");

        console.log("UIManager initialized");
    }


    /* =========================
       全画面を非表示
    ========================= */

    hideAllScreens() {

        this.titleScreen.classList.add("hidden");
        this.mapScreen.classList.add("hidden");
        this.battleScreen.classList.add("hidden");
        this.resultScreen.classList.add("hidden");
    }


    /* =========================
       タイトル画面
    ========================= */

    showTitleScreen() {

        this.hideAllScreens();

        this.titleScreen.classList.remove("hidden");
    }


    /* =========================
       マップ選択画面
    ========================= */

    showMapScreen() {

        this.hideAllScreens();

        this.mapScreen.classList.remove("hidden");
    }


    /* =========================
       戦闘画面
    ========================= */

    showBattleScreen() {

        this.hideAllScreens();

        this.battleScreen.classList.remove("hidden");

        this.updateStatus();
    }


    /* =========================
       結果画面
    ========================= */

    showResultScreen(result) {

        this.hideAllScreens();

        this.resultScreen.classList.remove("hidden");

        if (result === "victory") {

            this.resultTitle.textContent = "VICTORY!";

            this.resultDescription.textContent =
                "敵をすべて倒しました！";

        } else {

            this.resultTitle.textContent = "GAME OVER";

            this.resultDescription.textContent =
                "パーティーは全滅してしまった……";
        }
    }


    /* =========================
       マップ名の更新
    ========================= */

    updateMapName() {

        if (!this.gameManager.currentMap) {
            return;
        }

        this.battleMapName.textContent =
            this.gameManager.currentMap.name;
    }


    /* =========================
       ステータス更新
    ========================= */

    updateStatus() {

        this.updatePartyStatus();

        this.updateEnemyStatus();
    }


    /* =========================
       味方ステータス更新
    ========================= */

    updatePartyStatus() {

        const party = this.gameManager.party;

        if (!party) {
            return;
        }

        const statusIds = {

            swordsman: {
                hp: "swordsman-hp",
                mp: "swordsman-mp"
            },

            mage: {
                hp: "mage-hp",
                mp: "mage-mp"
            },

            priest: {
                hp: "priest-hp",
                mp: "priest-mp"
            },

            archer: {
                hp: "archer-hp",
                mp: "archer-mp"
            }
        };


        party.forEach(character => {

            const ids = statusIds[character.id];

            if (!ids) {
                return;
            }

            const hpElement =
                document.getElementById(ids.hp);

            const mpElement =
                document.getElementById(ids.mp);

            if (hpElement) {

                hpElement.textContent =
                    character.hp;
            }

            if (mpElement) {

                mpElement.textContent =
                    character.mp;
            }

            // 戦闘不能のキャラクターを表示
            const statusElement =
                document.getElementById(
                    `${character.id}-status`
                );

            if (statusElement) {

                statusElement.classList.toggle(
                    "dead",
                    !character.isAlive()
                );
            }

        });
    }


    /* =========================
       敵ステータス更新
    ========================= */

    updateEnemyStatus() {

        const enemies = this.gameManager.enemies;

        if (!this.enemyStatus || !enemies) {
            return;
        }

        this.enemyStatus.innerHTML = "";

        const aliveEnemies = enemies.filter(
            enemy => enemy.isAlive()
        );

        if (aliveEnemies.length === 0) {

            const message = document.createElement("p");

            message.textContent = "敵はいません。";

            this.enemyStatus.appendChild(message);

            return;
        }


        aliveEnemies.forEach(enemy => {

            const enemyElement =
                document.createElement("div");

            enemyElement.className = "enemy-status-card";


            const name = document.createElement("h3");

            name.textContent = enemy.name;


            const hp = document.createElement("p");

            hp.textContent =
                `HP：${enemy.hp} / ${enemy.maxHp}`;


            enemyElement.appendChild(name);

            enemyElement.appendChild(hp);

            this.enemyStatus.appendChild(enemyElement);

        });
    }


    /* =========================
       戦闘メッセージ更新
    ========================= */

    updateBattleMessage(message) {

        if (!this.battleMessage) {
            return;
        }

        this.battleMessage.textContent = message;
    }


    /* =========================
       戦闘ログ更新
    ========================= */

    updateBattleLog(logs) {

        if (!this.battleLog) {
            return;
        }

        this.battleLog.innerHTML = "";

        logs.forEach(message => {

            const logElement =
                document.createElement("p");

            logElement.textContent = message;

            this.battleLog.appendChild(logElement);

        });

        // 最新のログが見えるようにする
        this.battleLog.scrollTop =
            this.battleLog.scrollHeight;
    }


    /* =========================
       UI全体の更新
    ========================= */

    update() {

        this.updateStatus();
    }

}
