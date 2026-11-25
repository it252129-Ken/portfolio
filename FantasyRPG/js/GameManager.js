
/* =========================
   CHRONICLES OF FOURIA
   ゲーム管理クラス
========================= */

export default class GameManager {

    constructor() {

        // ゲームの状態
        this.gameState = "title";

        // 現在のマップ
        this.currentMap = null;

      // マップ情報
this.maps = {
    grassland: {
        id: "grassland",
        name: "緑の平原",
        difficulty: 1
    },

    volcano: {
        id: "volcano",
        name: "灼熱の火山",
        difficulty: 2
    },

    snow: {
        id: "snow",
        name: "氷結の雪山",
        difficulty: 3
    },

    castle: {
        id: "castle",
        name: "暗黒の古城",
        difficulty: 4
    }
};


        // プレイヤーのパーティー
        this.party = [];

      // パーティーの初期化
　　　 this.initializeParty();

        // 敵キャラクター
        this.enemies = [];

        // 現在のターン数
        this.turnCount = 1;

        // 現在行動を選択しているキャラクター
        this.currentCharacterIndex = 0;

        // 戦闘中かどうか
        this.isBattleActive = false;
　　　// 戦闘結果
      this.battleResult = null;

        console.log("GameManager initialized");
    }


/* =========================
   パーティー初期化
========================= */

initializeParty() {

    this.party = [

        {
            id: "swordsman",
            name: "剣士",
            maxHp: 150,
            hp: 150,
            maxMp: 30,
            mp: 30,
            attack: 25,
            defense: 15,
            alive: true
        },

        {
            id: "mage",
            name: "魔法使い",
            maxHp: 90,
            hp: 90,
            maxMp: 80,
            mp: 80,
            attack: 35,
            defense: 8,
            alive: true
        },

        {
            id: "priest",
            name: "僧侶",
            maxHp: 110,
            hp: 110,
            maxMp: 70,
            mp: 70,
            attack: 15,
            defense: 12,
            alive: true
        },

        {
            id: "archer",
            name: "弓使い",
            maxHp: 100,
            hp: 100,
            maxMp: 40,
            mp: 40,
            attack: 30,
            defense: 10,
            alive: true
        }

    ];

    console.log("Party initialized:", this.party);
}


  /* =========================
   マップ選択
========================= */

selectMap(mapId) {

    // 指定されたマップが存在するか確認
    if (!this.maps[mapId]) {
        console.error("存在しないマップです:", mapId);
        return false;
    }

    // 選択したマップを保存
    this.currentMap = this.maps[mapId];

    // ゲーム状態を更新
    this.gameState = "map";

    console.log("Map selected:", this.currentMap.name);

    return true;
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

   // 敵キャラクターを生成
this.initializeEnemies();
   
   // 敵が生成されなかった場合
if (this.enemies.length === 0) {
    console.error("敵キャラクターを生成できませんでした。");
    return false;
}

    // ターン数を初期化
    this.turnCount = 1;

    // 行動選択キャラクターを初期化
    this.currentCharacterIndex = 0;

    // 戦闘状態に変更
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
                hp: 60,
                attack: 12,
                defense: 5
            },
            {
                id: "wolf",
                name: "フォレストウルフ",
                maxHp: 90,
                hp: 90,
                attack: 18,
                defense: 8
            }
        ],

        volcano: [
            {
                id: "fire_lizard",
                name: "ファイアリザード",
                maxHp: 120,
                hp: 120,
                attack: 25,
                defense: 12
            },
            {
                id: "lava_golem",
                name: "マグマゴーレム",
                maxHp: 180,
                hp: 180,
                attack: 30,
                defense: 20
            }
        ],

        snow: [
            {
                id: "ice_wolf",
                name: "アイスウルフ",
                maxHp: 150,
                hp: 150,
                attack: 28,
                defense: 15
            },
            {
                id: "frost_golem",
                name: "フロストゴーレム",
                maxHp: 220,
                hp: 220,
                attack: 35,
                defense: 25
            }
        ],

        castle: [
            {
                id: "dark_knight",
                name: "ダークナイト",
                maxHp: 250,
                hp: 250,
                attack: 40,
                defense: 30
            },
            {
                id: "demon",
                name: "デーモン",
                maxHp: 300,
                hp: 300,
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

    // 敵を登録
    this.enemies = selectedEnemies.map(enemy => ({
        ...enemy,
        alive: true
    }));

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

    // 生存している味方を確認
    const aliveParty = this.party.filter(
        character => character.hp > 0 && character.alive
    );

    // 生存している敵を確認
    const aliveEnemies = this.enemies.filter(
        enemy => enemy.hp > 0 && enemy.alive
    );

    // 味方が全滅した場合
    if (aliveParty.length === 0) {

        this.finishBattle("defeat");

        return "defeat";
    }

    // 敵を全滅させた場合
    if (aliveEnemies.length === 0) {

        this.finishBattle("victory");

        return "victory";
    }

    // 戦闘継続
    return "continue";
}


  /* =========================
   戦闘終了
========================= */

finishBattle(result) {

    // 戦闘終了
    this.isBattleActive = false;

    // 勝敗結果を保存
    this.battleResult = result;

    // ゲーム状態を変更
    this.gameState = "result";

    // 結果メッセージ
    if (result === "victory") {

        console.log("戦闘勝利！");

    } else if (result === "defeat") {

        console.log("戦闘敗北……");

    }

    return result;
}

  

}

