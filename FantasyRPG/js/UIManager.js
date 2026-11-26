
/* =========================
   CHRONICLES OF FOURIA
   画面・UI管理クラス
========================= */

export default class UIManager {

    constructor(gameManager) {

        // ゲーム管理クラス
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

        const screens = [
            this.titleScreen,
            this.mapScreen,
            this.battleScreen,
            this.resultScreen
        ];

        screens.forEach(screen => {

            if (screen) {
                screen.classList.add("hidden");
            }

        });
    }


    /* =========================
       タイトル画面
    ========================= */

    showTitleScreen() {

        this.hideAllScreens();

        if (this.titleScreen) {
            this.titleScreen.classList.remove("hidden");
        }
    }


    /* =========================
       マップ選択画面
    ========================= */

    showMapScreen() {

        this.hideAllScreens();

        if (this.mapScreen) {
            this.mapScreen.classList.remove("hidden");
        }
    }


    /* =========================
       戦闘画面
    ========================= */

    showBattleScreen() {

        this.hideAllScreens();

        if (this.battleScreen) {
            this.battleScreen.classList.remove("hidden");
        }

        this.updateMapName();

        this.updateStatus();
    }


    /* =========================
       結果画面
    ========================= */

    showResultScreen(result) {

        this.hideAllScreens();

        if (this.resultScreen) {
            this.resultScreen.classList.remove("hidden");
        }

        if (!this.resultTitle || !this.resultDescription) {
            return;
        }

        if (result === "victory") {

            this.resultTitle.textContent = "VICTORY!";

            this.resultDescription.textContent =
                "敵をすべて倒しました！";

        }
        else if (result === "defeat") {

            this.resultTitle.textContent = "GAME OVER";

            this.resultDescription.textContent =
                "パーティーは全滅してしまった……";

        }
        else {

            this.resultTitle.textContent = "RESULT";

            this.resultDescription.textContent =
                "戦闘が終了しました。";
        }
    }


    /* =========================
       マップ名の更新
    ========================= */

    updateMapName() {

        if (!this.battleMapName) {
            return;
        }

        const currentMap = this.gameManager.currentMap;

        if (!currentMap) {

            this.battleMapName.textContent = "マップ未選択";

            return;
        }

        this.battleMapName.textContent =
            currentMap.name;
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

        if (!party || !Array.isArray(party)) {
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

            // HP表示
            const hpElement =
                document.getElementById(ids.hp);

            if (hpElement) {

                hpElement.textContent =
                    character.hp;
            }


            // MP表示
            const mpElement =
                document.getElementById(ids.mp);

            if (mpElement) {

                mpElement.textContent =
                    character.mp;
            }


            // キャラクターカード
            const statusElement =
                document.getElementById(
                    `${character.id}-status`
                );

            if (statusElement) {

                statusElement.classList.toggle(
                    "dead",
                    !character.isAlive()
                );

                statusElement.classList.toggle(
                    "active-turn",
                    character.id ===
                    this.gameManager.currentCharacter?.id
                );
            }

        });
    }


    /* =========================
       敵ステータス更新
    ========================= */

    updateEnemyStatus() {

        const enemies = this.gameManager.enemies;

        if (!this.enemyStatus || !Array.isArray(enemies)) {
            return;
        }

        // 表示を初期化
        this.enemyStatus.innerHTML = "";

        // 生存している敵
        const aliveEnemies = enemies.filter(
            enemy => enemy.isAlive()
        );


        // 敵が存在しない場合
        if (aliveEnemies.length === 0) {

            const message = document.createElement("p");

            message.textContent = "敵はいません。";

            this.enemyStatus.appendChild(message);

            return;
        }


        // 敵を表示
        aliveEnemies.forEach(enemy => {

            const enemyElement =
                document.createElement("div");

            enemyElement.className = "enemy-status-card";


            // 敵の名前
            const name = document.createElement("h3");

            name.textContent = enemy.name;


            // HP
            const hp = document.createElement("p");

            hp.textContent =
                `HP：${enemy.hp} / ${enemy.maxHp}`;


            // 表示を追加
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

        this.battleMessage.textContent =
            message ?? "";
    }


    /* =========================
       戦闘ログ更新
    ========================= */

    updateBattleLog(logs) {

        if (!this.battleLog) {
            return;
        }

        // ログを初期化
        this.battleLog.innerHTML = "";

        if (!Array.isArray(logs)) {
            return;
        }


        // ログを表示
        logs.forEach(message => {

            const logElement =
                document.createElement("p");

            logElement.textContent =
                String(message);

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

        this.updateMapName();

        this.updateStatus();
    }

}
