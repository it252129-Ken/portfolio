
/* =========================
   CHRONICLES OF FOURIA
   ゲーム管理クラス
========================= */

// キャラクター管理
import Character from "./Character.js";

// 敵キャラクター管理
import Enemy from "./Enemy.js";

// プレイヤー管理
import Player from "./Player.js";

// 戦闘管理
import BattleSystem from "./BattleSystem.js";

// スキル管理
import SkillSystem from "./SkillSystem.js";

// マップ管理
import MapManager from "./MapManager.js";

// UI管理
import UIManager from "./UIManager.js";


export default class GameManager {

    constructor() {

        // ゲームの状態
        this.gameState = "title";

        // 現在のマップ
        this.currentMap = null;

        // プレイヤー
        this.player = new Player();

        // 味方パーティー
        this.party = [];

        this.initializeParty();


        // 敵キャラクター
        this.enemies = [];


        // ターン管理
        this.turnCount = 1;

        this.currentCharacterIndex = 0;

        this.currentTurn = "player";


        // 戦闘状態
        this.isBattleActive = false;

        this.battleResult = null;


        // 各管理クラス
        this.mapManager = new MapManager(this);

        this.maps = this.mapManager.maps;

        this.battleSystem = new BattleSystem(this);

        this.skillSystem = new SkillSystem(this.battleSystem);

        this.uiManager = new UIManager(this);


        console.log("GameManager initialized");
    }


    /* =========================
       味方パーティー初期化
    ========================= */

    initializeParty() {

        this.party = [];

        const characters = [

            new Character({
                id: "swordsman",
                name: "剣士",
                maxHp: 150,
                maxMp: 30,
                attack: 25,
                defense: 15
            }),

            new Character({
                id: "mage",
                name: "魔法使い",
                maxHp: 90,
                maxMp: 80,
                attack: 35,
                defense: 8
            }),

            new Character({
                id: "priest",
                name: "僧侶",
                maxHp: 110,
                maxMp: 70,
                attack: 15,
                defense: 12
            }),

            new Character({
                id: "archer",
                name: "弓使い",
                maxHp: 100,
                maxMp: 40,
                attack: 30,
                defense: 10
            })

        ];


        characters.forEach(character => {

            this.player.addMember(character);

        });


        this.party = this.player.party;
    }


    /* =========================
       マップ選択
    ========================= */

    selectMap(mapId) {

        const selected =
            this.mapManager.selectMap(mapId);

        if (!selected) {

            console.warn("マップが見つかりません:", mapId);

            return false;
        }

        this.currentMap = selected;

        this.gameState = "map";

        console.log("Selected Map:", selected.name);

        return true;
    }


    /* =========================
       戦闘開始
    ========================= */

    startBattle() {

        if (!this.currentMap) {

            console.warn("マップが選択されていません。");

            return false;
        }

        // パーティーが全滅していないか確認
        if (this.player.isPartyDefeated()) {

            console.warn("味方が全滅しています。");

            return false;
        }


        // ターン情報を初期化
        this.turnCount = 1;

        this.currentCharacterIndex = 0;

        this.currentTurn = "player";


        // 戦闘結果をリセット
        this.battleResult = null;


        // 戦闘開始
        const success =
            this.battleSystem.startBattle();

        if (!success) {

            return false;
        }


        this.isBattleActive = true;

        this.gameState = "battle";


        // UI更新
        this.uiManager.updateStatus();


        console.log("Battle Started:", this.currentMap.name);

        return true;
    }


    /* =========================
       敵キャラクター生成
    ========================= */

    initializeEnemies() {

        this.enemies = [];


        // マップごとの敵情報
        const enemyData = {

            grassland: [

                {
                    id: "slime",
                    name: "スライム",
                    hp: 60,
                    attack: 12,
                    defense: 5,
                    exp: 20
                },

                {
                    id: "wolf",
                    name: "ウルフ",
                    hp: 90,
                    attack: 18,
                    defense: 8,
                    exp: 35
                }

            ],


            volcano: [

                {
                    id: "fire_lizard",
                    name: "ファイアリザード",
                    hp: 120,
                    attack: 25,
                    defense: 12,
                    exp: 50
                },

                {
                    id: "lava_golem",
                    name: "ラーヴァゴーレム",
                    hp: 180,
                    attack: 30,
                    defense: 20,
                    exp: 80
                }

            ],


            snow: [

                {
                    id: "ice_wolf",
                    name: "アイスウルフ",
                    hp: 150,
                    attack: 28,
                    defense: 15,
                    exp: 70
                },

                {
                    id: "frost_golem",
                    name: "フロストゴーレム",
                    hp: 220,
                    attack: 35,
                    defense: 25,
                    exp: 110
                }

            ],


            castle: [

                {
                    id: "dark_knight",
                    name: "ダークナイト",
                    hp: 250,
                    attack: 40,
                    defense: 30,
                    exp: 150
                },

                {
                    id: "demon",
                    name: "デーモン",
                    hp: 300,
                    attack: 45,
                    defense: 25,
                    exp: 200
                }

            ]

        };


        const data = enemyData[this.currentMap.id];

        if (!data) {

            console.error("敵データがありません。");

            return;
        }


        // 敵を生成
        data.forEach(enemy => {

            this.enemies.push(

                new Enemy(
                    enemy.id,
                    enemy.name,
                    enemy.hp,
                    enemy.attack,
                    enemy.defense,
                    enemy.exp
                )

            );

        });


        console.log("Enemies Initialized:", this.enemies);
    }


    /* =========================
       現在の行動キャラクター
    ========================= */

    getCurrentCharacter() {

        if (this.currentTurn !== "player") {

            return null;
        }

        const party = this.party;

        if (party.length === 0) {

            return null;
        }


        // 現在位置から生存キャラクターを探す
        for (let i = 0; i < party.length; i++) {

            const index =
                (this.currentCharacterIndex + i) % party.length;

            const character = party[index];

            if (character.isAlive()) {

                this.currentCharacterIndex = index;

                return character;
            }

        }

        return null;
    }


    /* =========================
       次の味方へ
    ========================= */

    nextCharacter() {

        if (!this.isBattleActive) {

            return false;
        }

        const party = this.party;

        if (party.length === 0) {

            return false;
        }


        // 次の生存キャラクターを探す
        for (let i = 1; i <= party.length; i++) {

            const index =
                (this.currentCharacterIndex + i) % party.length;

            if (party[index].isAlive()) {

                this.currentCharacterIndex = index;

                return true;
            }

        }

        return false;
    }


    /* =========================
       味方ターン終了
    ========================= */

    endPlayerTurn() {

        if (!this.isBattleActive) {

            return;
        }

        this.currentTurn = "enemy";

        this.gameState = "enemyTurn";

        console.log("Enemy Turn");


        // 敵の行動
        this.battleSystem.executeEnemyTurn();


        // 戦闘が終了していなければ次のターンへ
        if (this.isBattleActive) {

            this.endEnemyTurn();
        }
    }


    /* =========================
       敵ターン終了
    ========================= */

    endEnemyTurn() {

        if (!this.isBattleActive) {

            return;
        }

        this.turnCount++;

        this.currentCharacterIndex = 0;

        this.currentTurn = "player";

        this.gameState = "battle";


        this.battleSystem.addLog(
            `ターン ${this.turnCount} 開始！`
        );


        this.uiManager.updateStatus();

        console.log("Player Turn:", this.turnCount);
    }


    /* =========================
       戦闘結果確認
    ========================= */

    checkBattleResult() {

        return this.battleSystem.checkBattleResult();
    }


    /* =========================
       戦闘終了
    ========================= */

    finishBattle(result) {

        if (!this.isBattleActive) {

            return;
        }

        this.isBattleActive = false;

        this.battleSystem.isActive = false;

        this.battleResult = result;

        this.gameState = "result";


        if (result === "victory") {

            console.log("VICTORY!");

        } else {

            console.log("GAME OVER");

        }


        // 結果画面を表示
        this.uiManager.showResultScreen(result);
    }


    /* =========================
       ゲームをタイトルに戻す
    ========================= */

    resetGame() {

        this.gameState = "title";

        this.currentMap = null;

        this.enemies = [];

        this.turnCount = 1;

        this.currentCharacterIndex = 0;

        this.currentTurn = "player";

        this.isBattleActive = false;

        this.battleResult = null;

        // 味方のHP・MPも初期状態に戻す
        this.player = new Player();

        this.initializeParty();

        // 戦闘状態をリセット
        this.battleSystem.isActive = false;

        this.battleSystem.battleLog = [];

        console.log("Game Reset");
    }

}
