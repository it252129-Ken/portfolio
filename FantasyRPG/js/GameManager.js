
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

// 画面管理
import UIManager from "./UIManager.js";


export default class GameManager {

constructor() {

    // ゲームの状態
    this.gameState = "title";

    // 現在のマップ
    this.currentMap = null;

    // プレイヤー管理
    this.player = new Player();

    // パーティー初期化
    this.initializeParty();

    // パーティーの参照
    this.party = this.player.party;

    // 敵キャラクター
    this.enemies = [];

    // ターン管理
    this.turnCount = 1;
    this.currentCharacterIndex = 0;

    // 戦闘状態
    this.isBattleActive = false;
    this.battleResult = null;

    // マップ管理
    this.mapManager = new MapManager(this);

   // マップ情報を共有
　　this.maps = this.mapManager.maps;

    // 戦闘管理
    this.battleSystem = new BattleSystem(this);

    // スキル管理
    this.skillSystem = new SkillSystem(this.battleSystem);

    // 画面管理
    this.uiManager = new UIManager(this);

    console.log("GameManager initialized");
}

   




/* =========================
   パーティー初期化
========================= */

initializeParty() {

    // 剣士
    const swordsman = new Character({
        id: "swordsman",
        name: "剣士",
        maxHp: 150,
        maxMp: 30,
        attack: 25,
        defense: 15
    });

    // 魔法使い
    const mage = new Character({
        id: "mage",
        name: "魔法使い",
        maxHp: 90,
        maxMp: 80,
        attack: 35,
        defense: 8
    });

    // 僧侶
    const priest = new Character({
        id: "priest",
        name: "僧侶",
        maxHp: 110,
        maxMp: 70,
        attack: 15,
        defense: 12
    });

    // 弓使い
    const archer = new Character({
        id: "archer",
        name: "弓使い",
        maxHp: 100,
        maxMp: 40,
        attack: 30,
        defense: 10
    });

    // パーティーに登録
    this.player.addMember(swordsman);
    this.player.addMember(mage);
    this.player.addMember(priest);
    this.player.addMember(archer);

    // パーティーを参照
    this.party = this.player.party;

    console.log("Party initialized:", this.party);
}





/* =========================
   マップ選択
========================= */

selectMap(mapId) {

    // マップ管理クラスに処理を委任
    return this.mapManager.selectMap(mapId);
}



/* =========================
   戦闘開始
========================= */

startBattle() {

    // マップが選択されているか確認
    if (!this.currentMap) {
        console.error("マップが選択されていません。");
        return false;
    }

    // BattleSystemに戦闘開始を依頼
    if (!this.battleSystem.startBattle()) {
        console.error("戦闘を開始できませんでした。");
        return false;
    }

    // ターン数を初期化
    this.turnCount = 1;

    // 行動キャラクターを初期化
    this.currentCharacterIndex = 0;

    // ゲーム状態を変更
    this.gameState = "battle";
    this.isBattleActive = true;

    console.log(
        this.currentMap.name + " の戦闘を開始します！"
    );

    return true;
}

  



/* =========================
   敵キャラクター生成
========================= */

initializeEnemies() {

    // マップが選択されているか確認
    if (!this.currentMap) {
        console.error("マップが選択されていません。");
        return;
    }

    // 敵を初期化
    this.enemies = [];

    // マップごとの敵データ
    const enemyData = {

        grassland: [
            {
                id: "slime",
                name: "グリーンスライム",
                maxHp: 60,
                attack: 12,
                defense: 5
            },
            {
                id: "wolf",
                name: "フォレストウルフ",
                maxHp: 90,
                attack: 18,
                defense: 8
            }
        ],

        volcano: [
            {
                id: "fire_lizard",
                name: "ファイアリザード",
                maxHp: 120,
                attack: 25,
                defense: 12
            },
            {
                id: "lava_golem",
                name: "マグマゴーレム",
                maxHp: 180,
                attack: 30,
                defense: 20
            }
        ],

        snow: [
            {
                id: "ice_wolf",
                name: "アイスウルフ",
                maxHp: 150,
                attack: 28,
                defense: 15
            },
            {
                id: "frost_golem",
                name: "フロストゴーレム",
                maxHp: 220,
                attack: 35,
                defense: 25
            }
        ],

        castle: [
            {
                id: "dark_knight",
                name: "ダークナイト",
                maxHp: 250,
                attack: 40,
                defense: 30
            },
            {
                id: "demon",
                name: "デーモン",
                maxHp: 300,
                attack: 45,
                defense: 25
            }
        ]
    };

    // 現在のマップに対応した敵を取得
    const selectedEnemies = enemyData[this.currentMap.id];

    if (!selectedEnemies) {
        console.error("このマップの敵データがありません。");
        return;
    }

    // Enemyクラスから敵を生成
    this.enemies = selectedEnemies.map(enemyData => {

        return new Enemy({
            id: enemyData.id,
            name: enemyData.name,
            maxHp: enemyData.maxHp,
            attack: enemyData.attack,
            defense: enemyData.defense
        });
    });

    console.log("Enemies initialized:", this.enemies);
}






   



/* =========================
   次の行動キャラクターを取得
========================= */

getCurrentCharacter() {

    // 現在の位置から生存している味方を探す
    for (
        let i = this.currentCharacterIndex;
        i < this.party.length;
        i++
    ) {

        const character = this.party[i];

        if (character.alive && character.hp > 0) {

            this.currentCharacterIndex = i;

            return character;
        }
    }

    // 行動できる味方がいない場合
    return null;
}

/* =========================
   次の味方へ進む
========================= */

nextCharacter() {

    // 現在のキャラクターの次から探す
    for (
        let i = this.currentCharacterIndex + 1;
        i < this.party.length;
        i++
    ) {

        const character = this.party[i];

        if (character.alive && character.hp > 0) {

            this.currentCharacterIndex = i;

            return true;
        }
    }

    // 全員の行動選択が終了
    this.currentCharacterIndex = 0;

    return false;
}


/* =========================
   味方ターン終了
========================= */

endPlayerTurn() {

    // 戦闘中でなければ終了
    if (!this.isBattleActive) {
        return false;
    }

    // 味方の行動選択を初期化
    this.currentCharacterIndex = 0;

    // ゲーム状態を敵ターンに変更
    this.gameState = "enemyTurn";

    console.log("敵のターン開始！");

    // 敵の行動を実行
    this.battleSystem.executeEnemyTurn();

    // 戦闘が終了していない場合
    if (this.isBattleActive) {

        // 敵ターンを終了して次のターンへ
        this.endEnemyTurn();
    }

    return true;
}


/* =========================
   敵ターン終了
========================= */

endEnemyTurn() {

    // 戦闘中でなければ終了
    if (!this.isBattleActive) {
        return false;
    }

    // 次のターンへ
    this.turnCount++;

    // ゲーム状態を味方ターンに変更
    this.gameState = "playerTurn";

    // 味方の行動選択を初期化
    this.currentCharacterIndex = 0;

    console.log(
        "ターン " + this.turnCount + " 開始！"
    );

    return true;
}

/* =========================
   戦闘の勝敗判定
========================= */

checkBattleResult() {

    // BattleSystemに勝敗判定を委任
    return this.battleSystem.checkBattleResult();
}


  /* =========================
   戦闘終了
========================= */

finishBattle(result) {

    // 戦闘状態を終了
    this.isBattleActive = false;

    // BattleSystemの戦闘状態も終了
    this.battleSystem.isActive = false;

    // 勝敗結果を保存
    this.battleResult = result;

    // ゲーム状態を変更
    this.gameState = "result";

    // 結果画面を表示
    this.uiManager.showResultScreen(result);

    // 結果メッセージ
    if (result === "victory") {
        console.log("戦闘勝利！");
    } else if (result === "defeat") {
        console.log("戦闘敗北……");
    }

    return result;
}

  

}

