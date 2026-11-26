
/* =========================
   CHRONICLES OF FOURIA
   キャラクター管理クラス
========================= */

export default class Character {

    constructor(id, name, maxHp, maxMp, attack, defense) {

        // キャラクター情報
        this.id = id;
        this.name = name;

        // 最大HP・最大MP
        this.maxHp = maxHp;
        this.maxMp = maxMp;

        // 現在HP・現在MP
        this.hp = maxHp;
        this.mp = maxMp;

        // 戦闘能力
        this.attack = attack;
        this.defense = defense;

        // 防御状態
        this.isDefending = false;

    }


    /* =========================
       生存確認
    ========================= */

    isAlive() {

        return this.hp > 0;

    }


    /* =========================
       ダメージ処理
    ========================= */

    takeDamage(damage) {

        if (!this.isAlive()) {
            return 0;
        }

        // 防御状態ならダメージを軽減
        if (this.isDefending) {

            damage = Math.floor(damage / 2);

        }

        // 防御力を考慮
        const actualDamage = Math.max(
            1,
            Math.floor(damage - this.defense)
        );

        // HPを減少
        this.hp = Math.max(
            0,
            this.hp - actualDamage
        );

        // 防御状態解除
        this.isDefending = false;

        return actualDamage;

    }


    /* =========================
       HP回復
    ========================= */

    heal(amount) {

        if (!this.isAlive()) {
            return 0;
        }

        // 回復量を計算
        const actualHeal = Math.min(
            amount,
            this.maxHp - this.hp
        );

        // HP回復
        this.hp += actualHeal;

        return actualHeal;

    }


    /* =========================
       MP消費
    ========================= */

    useMp(amount) {

        if (this.mp < amount) {
            return false;
        }

        this.mp -= amount;

        return true;

    }


    /* =========================
       MP回復
    ========================= */

    restoreMp(amount) {

        const actualRestore = Math.min(
            amount,
            this.maxMp - this.mp
        );

        this.mp += actualRestore;

        return actualRestore;

    }


    /* =========================
       防御
    ========================= */

    defend() {

        if (!this.isAlive()) {
            return false;
        }

        this.isDefending = true;

        return true;

    }


    /* =========================
       HP・MP完全回復
    ========================= */

    fullRecover() {

        this.hp = this.maxHp;
        this.mp = this.maxMp;

        this.isDefending = false;

    }


    /* =========================
       キャラクター情報取得
    ========================= */

    getStatus() {

        return {

            id: this.id,
            name: this.name,

            hp: this.hp,
            maxHp: this.maxHp,

            mp: this.mp,
            maxMp: this.maxMp,

            attack: this.attack,
            defense: this.defense,

            alive: this.isAlive()

        };

    }

}

