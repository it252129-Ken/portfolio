
/* =========================
   CHRONICLES OF FOURIA
   プレイヤー管理クラス
========================= */

// キャラクター管理クラス
import Character from "./Character.js";

export default class Player {

    constructor() {

        // パーティーメンバー
        this.party = [];

        // プレイヤー情報
        this.level = 1;
        this.exp = 0;
        this.gold = 0;

        // 次のレベルまでに必要な経験値
        this.nextLevelExp = 100;

        // パーティーを初期作成
        this.createParty();
    }


    /* =========================
       パーティー作成
    ========================= */

    createParty() {

        // 剣士
        const swordsman = new Character(
            "swordsman",
            "剣士",
            180,
            30,
            35,
            15
        );

        // 魔法使い
        const mage = new Character(
            "mage",
            "魔法使い",
            100,
            100,
            25,
            8
        );

        // 僧侶
        const priest = new Character(
            "priest",
            "僧侶",
            120,
            80,
            20,
            12
        );

        // 弓使い
        const archer = new Character(
            "archer",
            "弓使い",
            130,
            50,
            30,
            10
        );

        // パーティーに追加
        this.party = [
            swordsman,
            mage,
            priest,
            archer
        ];
    }


    /* =========================
       パーティー取得
    ========================= */

    getParty() {
        return this.party;
    }


    /* =========================
       生存キャラクター取得
    ========================= */

    getAliveParty() {

        return this.party.filter(
            character => character.isAlive()
        );
    }


    /* =========================
       全滅判定
    ========================= */

    isPartyDefeated() {

        return this.getAliveParty().length === 0;
    }


    /* =========================
       経験値獲得
    ========================= */

    gainExp(amount) {

        this.exp += amount;

        // レベルアップ判定
        while (this.exp >= this.nextLevelExp) {

            this.exp -= this.nextLevelExp;

            this.levelUp();
        }
    }


    /* =========================
       レベルアップ
    ========================= */

    levelUp() {

        this.level++;

        // 次のレベルに必要な経験値
        this.nextLevelExp = Math.floor(
            this.nextLevelExp * 1.5
        );

        // パーティー全員の能力上昇
        this.party.forEach(character => {

            character.maxHp += 20;
            character.maxMp += 10;

            character.attack += 5;
            character.defense += 3;

            // レベルアップ時に回復
            character.fullRecover();
        });
    }


    /* =========================
       ゴールド獲得
    ========================= */

    addGold(amount) {

        this.gold += amount;
    }


    /* =========================
       ゴールド消費
    ========================= */

    spendGold(amount) {

        if (this.gold < amount) {
            return false;
        }

        this.gold -= amount;

        return true;
    }


    /* =========================
       パーティー全回復
    ========================= */

    fullRecover() {

        this.party.forEach(character => {

            character.fullRecover();
        });
    }


    /* =========================
       プレイヤー情報取得
    ========================= */

    getStatus() {

        return {
            level: this.level,
            exp: this.exp,
            nextLevelExp: this.nextLevelExp,
            gold: this.gold,
            party: this.party.map(
                character => character.getStatus()
            )
        };
    }
}

