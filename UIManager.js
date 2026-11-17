
class UIManager {
    constructor() {
        // ゲームの状態
        this.gameState = "playing";

        // 表示するメッセージ
        this.message = "";

        // メッセージ表示時間
        this.messageTimer = 0;
    }

    // ゲーム画面の情報を更新
    update(player, enemyCastleHp, enemies, characters, deltaTime) {
        // 城のHP表示
        this.updateText("player-hp", player.castleHp);
        this.updateText("enemy-hp", enemyCastleHp);

        // 素材の所持数表示
        this.updateText("scale-count", player.materials.scale);
        this.updateText("fillet-count", player.materials.fillet);
        this.updateText("fin-count", player.materials.fin);

        // キャラクターと敵の数
        this.updateText("character-count", characters.length);
        this.updateText("enemy-count", enemies.length);

        // メッセージ表示時間
        if (this.messageTimer > 0) {
            this.messageTimer -= deltaTime;

            if (this.messageTimer <= 0) {
                this.message = "";
            }
        }
    }

    // HTML要素のテキストを更新
    updateText(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }

    // メッセージを表示
    showMessage(message, duration = 2) {
        this.message = message;
        this.messageTimer = duration;

        const element = document.getElementById("game-message");

        if (element) {
            element.textContent = message;
        }
    }

    // 勝利画面
    showVictory() {
        this.gameState = "victory";

        const element = document.getElementById("result-screen");

        if (element) {
            element.textContent = "VICTORY!";
            element.style.display = "block";
        }
    }

    // 敗北画面
    showDefeat() {
        this.gameState = "defeat";

        const element = document.getElementById("result-screen");

        if (element) {
            element.textContent = "DEFEAT...";
            element.style.display = "block";
        }
    }

    // 結果画面を非表示
    hideResult() {
        const element = document.getElementById("result-screen");

        if (element) {
            element.style.display = "none";
        }

        this.gameState = "playing";
    }
}

