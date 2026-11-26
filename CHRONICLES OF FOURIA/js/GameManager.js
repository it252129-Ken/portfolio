
/* =========================
   CHRONICLES OF FOURIA
   ゲーム管理クラス
========================= */

// 各種クラス
import Player from "./Player.js";
import Enemy from "./Enemy.js";
import BattleSystem from "./BattleSystem.js";
import SkillSystem from "./SkillSystem.js";
import MapManager from "./MapManager.js";
import UIManager from "./UIManager.js";


export default class GameManager {

    constructor() {

        // ゲームの状態
        this.gameState = "title";

        // プレイヤー管理
        this.player = new Player();

        // マップ管理
        this.mapManager = new MapManager();

        // UI管理
        this.uiManager = new UIManager();

        // スキル管理
        this.skillSystem = new SkillSystem();

        // 戦闘管理
        this.battleSystem = null;

        // 現在の敵
        this.currentEnemy = null;

        // 戦闘結果
        this.battleResult = null;
    }


    /* =========================
       ゲーム開始
    ========================= */

    startGame() {

        this.gameState = "map";

        this.uiManager.showMapScreen();
    }


    /* =========================
       マップ選択
    ========================= */

    selectMap(mapId) {

        if (this.gameState !== "map") {
            return false;
        }

        const success = this.mapManager.selectMap(mapId);

        if (!success) {
            return false;
        }

        return true;
    }


    /* =========================
       戦闘開始
    ========================= */

    startBattle() {

        const map = this.mapManager.getCurrentMap();

        if (!map) {
            return false;
        }

        if (
            this.gameState !== "map" &&
            this.gameState !== "result"
        ) {
            return false;
        }

        // 前回の戦闘状態を初期化
        this.player.fullRecover();

        // マップに対応した敵を作成
        this.currentEnemy = this.createEnemy(map.id);

        // 戦闘システムを作成
        this.battleSystem = new BattleSystem(
            this.player,
            this
        );

        // 戦闘開始
        this.battleSystem.startBattle(
            this.currentEnemy
        );

        this.gameState = "battle";

        // 戦闘画面を表示
        this.uiManager.showBattleScreen();

        // マップ名を表示
        this.uiManager.updateMapName(map.name);

        // 戦闘画面を更新
        this.updateBattleUI();

        this.uiManager.updateBattleMessage(
            `${this.currentEnemy.name}が現れた！`
        );

        return true;
    }


    /* =========================
       敵キャラクター作成
    ========================= */

    createEnemy(mapId) {

        const enemies = {

            // 緑の平原
            grassland: {
                id: "slime",
                name: "グリーンスライム",
                hp: 150,
                attack: 15,
                defense: 5,
                exp: 50,
                gold: 30
            },

            // 灼熱の火山
            volcano: {
                id: "fireDrake",
                name: "ファイアドレイク",
                hp: 300,
                attack: 30,
                defense: 12,
                exp: 120,
                gold: 80
            },

            // 氷結の雪山
            snow: {
                id: "iceGolem",
                name: "アイスゴーレム",
                hp: 450,
                attack: 40,
                defense: 18,
                exp: 200,
                gold: 150
            },

            // 暗黒の古城
            castle: {
                id: "darkLord",
                name: "ダークロード",
                hp: 700,
                attack: 55,
                defense: 25,
                exp: 500,
                gold: 300
            }
        };

        const data = enemies[mapId];

        if (!data) {
            return new Enemy(
                "unknown",
                "謎のモンスター",
                100,
                0,
                10,
                5,
                10,
                10
            );
        }

        return new Enemy(
            data.id,
            data.name,
            data.hp,
            0,
            data.attack,
            data.defense,
            data.exp,
            data.gold
        );
    }


    /* =========================
       通常攻撃
    ========================= */

    executeAttack() {

        if (this.gameState !== "battle") {
            return false;
        }

        const success = this.battleSystem.attack();

        this.updateBattleUI();

        return success;
    }


    /* =========================
       防御
    ========================= */

    executeDefend() {

        if (this.gameState !== "battle") {
            return false;
        }

        const success = this.battleSystem.defend();

        this.updateBattleUI();

        return success;
    }


    /* =========================
       スキル使用
    ========================= */

    executeSkill(skillId, targetId = null) {

        if (this.gameState !== "battle") {
            return false;
        }

        const character =
            this.battleSystem.getCurrentCharacter();

        if (!character) {
            return false;
        }

        const skill = this.skillSystem.getSkill(skillId);

        if (!skill) {
            return false;
        }

        // 攻撃魔法の対象は敵
        let target = null;

        if (skill.type === "attack") {

            target = this.currentEnemy;

        } else {

            // 回復魔法の対象は味方
            target = this.player.getParty().find(
                member => member.id === targetId
            );

            if (!target) {
                target = character;
            }
        }

        // スキル使用
        const result = this.skillSystem.useSkill(
            skillId,
            character,
            target
        );

        if (!result.success) {

            this.uiManager.updateBattleMessage(
                result.message
            );

            return false;
        }

        // 戦闘ログに追加
        this.battleSystem.addLog(
            result.message
        );

        // 勝敗判定
        if (!this.battleSystem.checkBattleEnd()) {

            // 次のキャラクターへ
            this.battleSystem.nextCharacter();
        }

        this.updateBattleUI();

        return true;
    }


    /* =========================
       戦闘終了時の処理
    ========================= */

    onBattleEnd(result) {

        if (this.gameState !== "battle") {
            return;
        }

        this.gameState = "result";

        this.battleResult = result;

        const map = this.mapManager.getCurrentMap();

        // 勝利
        if (result === "victory") {

            this.mapManager.clearCurrentMap();

            this.uiManager.updateBattleMessage(
                "VICTORY!"
            );

        }

        // 敗北
        else {

            this.uiManager.updateBattleMessage(
                "GAME OVER"
            );
        }

        // 結果画面を表示
        this.uiManager.showResultScreen();

        this.uiManager.updateResult(
            result,
            map ? map.name : ""
        );
    }


    /* =========================
       次のマップへ
    ========================= */

    goToNextMap() {

        if (
            this.gameState !== "result" ||
            this.battleResult !== "victory"
        ) {
            return false;
        }

        const nextMap = this.mapManager.getNextMap();

        if (!nextMap) {

            this.uiManager.updateResult(
                "victory",
                "すべての冒険"
            );

            return false;
        }

        this.mapManager.selectMap(nextMap.id);

        this.startBattle();

        return true;
    }


    /* =========================
       マップ選択画面へ戻る
    ========================= */

    returnToMap() {

        if (this.gameState !== "result") {
            return;
        }

        this.battleSystem = null;

        this.currentEnemy = null;

        this.gameState = "map";

        this.uiManager.showMapScreen();
    }


    /* =========================
       タイトル画面へ戻る
    ========================= */

    returnToTitle() {

        this.gameState = "title";

        this.battleSystem = null;

        this.currentEnemy = null;

        this.battleResult = null;

        this.player = new Player();

        this.mapManager = new MapManager();

        this.uiManager.showTitleScreen();
    }


    /* =========================
       戦闘画面更新
    ========================= */

    updateBattleUI() {

        if (!this.battleSystem) {
            return;
        }

        this.uiManager.updateBattleUI(
            this.battleSystem,
            this.player
        );
    }


    /* =========================
       ゲーム情報取得
    ========================= */

    getGameStatus() {

        return {

            gameState: this.gameState,

            player: this.player.getStatus(),

            currentMap:
                this.mapManager.getCurrentMap(),

            enemy:
                this.currentEnemy
                    ? this.currentEnemy.getEnemyStatus()
                    : null,

            battleResult: this.battleResult
        };
    }
}

