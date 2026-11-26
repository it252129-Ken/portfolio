
/* =========================
   CHRONICLES OF FOURIA
   UI管理クラス
========================= */

export default class UIManager {

    constructor() {

        // 画面要素
        this.screens = {
            title: document.getElementById("title-screen"),
            map: document.getElementById("map-screen"),
            battle: document.getElementById("battle-screen"),
            result: document.getElementById("result-screen")
        };
    }


    /* =========================
       画面切り替え
    ========================= */

    showScreen(screenName) {

        // すべての画面を非表示
        Object.values(this.screens).forEach(screen => {

            if (screen) {
                screen.classList.add("hidden");
            }
        });

        // 指定された画面を表示
        const targetScreen = this.screens[screenName];

        if (targetScreen) {
            targetScreen.classList.remove("hidden");
        }
    }


    /* =========================
       タイトル画面
    ========================= */

    showTitleScreen() {

        this.showScreen("title");
    }


    /* =========================
       マップ選択画面
    ========================= */

    showMapScreen() {

        this.showScreen("map");
    }


    /* =========================
       戦闘画面
    ========================= */

    showBattleScreen() {

        this.showScreen("battle");
    }


    /* =========================
       結果画面
    ========================= */

    showResultScreen() {

        this.showScreen("result");
    }


    /* =========================
       マップ名表示
    ========================= */

    updateMapName(mapName) {

        const element = document.getElementById(
            "battle-map-name"
        );

        if (element) {
            element.textContent = mapName;
        }
    }


    /* =========================
       パーティー情報更新
    ========================= */

    updatePartyStatus(party) {

        if (!party) return;

        party.forEach(character => {

            const hpElement = document.getElementById(
                `${character.id}-hp`
            );

            const mpElement = document.getElementById(
                `${character.id}-mp`
            );

            const statusElement = document.getElementById(
                `${character.id}-status`
            );

            if (hpElement) {

                hpElement.textContent =
                    `${character.hp}/${character.maxHp}`;
            }

            if (mpElement) {

                mpElement.textContent =
                    `${character.mp}/${character.maxMp}`;
            }

            // 戦闘不能の表示
            if (statusElement) {

                statusElement.classList.toggle(
                    "dead",
                    !character.isAlive()
                );
            }
        });
    }


    /* =========================
       敵情報更新
    ========================= */

    updateEnemyStatus(enemy) {

        const element = document.getElementById(
            "enemy-status"
        );

        if (!element || !enemy) return;

        element.innerHTML = `
            <h3>${this.escapeHTML(enemy.name)}</h3>
            <p>HP：${enemy.hp} / ${enemy.maxHp}</p>
        `;
    }


    /* =========================
       行動キャラクター表示
    ========================= */

    updateCurrentCharacter(character) {

        // 全員の強調表示を解除
        const statusElements = document.querySelectorAll(
            ".character-status"
        );

        statusElements.forEach(element => {

            element.classList.remove("active-turn");
        });

        if (!character) return;

        // 現在行動するキャラクターを強調
        const currentElement = document.getElementById(
            `${character.id}-status`
        );

        if (currentElement) {

            currentElement.classList.add("active-turn");
        }
    }


    /* =========================
       戦闘ログ更新
    ========================= */

    updateBattleLog(logs) {

        const element = document.getElementById(
            "battle-log"
        );

        if (!element || !logs) return;

        element.innerHTML = "";

        logs.forEach(message => {

            const logItem = document.createElement("p");

            logItem.textContent = message;

            element.appendChild(logItem);
        });

        // 最新ログまでスクロール
        element.scrollTop = element.scrollHeight;
    }


    /* =========================
       戦闘メッセージ
    ========================= */

    updateBattleMessage(message) {

        const element = document.getElementById(
            "battle-message"
        );

        if (element) {

            element.textContent = message;
        }
    }


    /* =========================
       結果画面更新
    ========================= */

    updateResult(result, mapName) {

        const titleElement = document.getElementById(
            "result-title"
        );

        const descriptionElement = document.getElementById(
            "result-description"
        );

        if (result === "victory") {

            if (titleElement) {
                titleElement.textContent = "VICTORY!";
            }

            if (descriptionElement) {

                descriptionElement.textContent =
                    `${mapName}の戦いに勝利しました！`;
            }

        } else {

            if (titleElement) {
                titleElement.textContent = "GAME OVER";
            }

            if (descriptionElement) {

                descriptionElement.textContent =
                    `${mapName}で敗北しました……`;
            }
        }
    }


    /* =========================
       戦闘画面全体更新
    ========================= */

    updateBattleUI(battleSystem, player) {

        if (!battleSystem || !player) return;

        // パーティー情報
        this.updatePartyStatus(
            player.getParty()
        );

        // 敵情報
        if (battleSystem.enemy) {

            this.updateEnemyStatus(
                battleSystem.enemy
            );
        }

        // 現在の行動キャラクター
        this.updateCurrentCharacter(
            battleSystem.getCurrentCharacter()
        );

        // 戦闘ログ
        this.updateBattleLog(
            battleSystem.getBattleLog()
        );
    }


    /* =========================
       HTML文字列の安全な表示
    ========================= */

    escapeHTML(value) {

        return String(value).replace(
            /[&<>"']/g,
            character => {

                const entities = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"
                };

                return entities[character];
            }
        );
    }
}

