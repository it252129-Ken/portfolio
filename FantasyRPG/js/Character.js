
/* =========================
   CHRONICLES OF FOURIA
   キャラクター管理クラス
========================= */

export default class Character {

    constructor({
        id,
        name,
        maxHp,
        maxMp = 0,
        attack,
        defense
    }) {

        // キャラクター情報
        this.id = id;
        this.name = name;

        // HP・MP
        this.maxHp = maxHp;
        this.hp = maxHp;

        this.maxMp = maxMp;
        this.mp = maxMp;

        // 攻撃力・防御力
        this.attack = attack;
        this.defense = defense;

        // 生存状態
        this.alive = true;

        // 防御状態
        this.isDefending = false;
    }


    /* =========================
       ダメージを受ける
    ========================= */

    takeDamage(damage) {

        // 防御中ならダメージを半減
        if (this.isDefending) {
            damage = Math.floor(damage / 2);
        }

        // HPを減らす
        this.hp -= damage;

        // HPが0未満にならないようにする
        if (this.hp < 0) {
            this.hp = 0;
        }

        // 戦闘不能判定
        if (this.hp <= 0) {
            this.alive = false;
        }

        return damage;
    }


    /* =========================
       HPを回復する
    ========================= */

    heal(amount) {

        // HPを回復
        this.hp += amount;

        // 最大HPを超えないようにする
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }

        return this.hp;
    }


    /* =========================
       MPを消費する
    ========================= */

    useMp(amount) {

        // MPが足りない場合
        if (this.mp < amount) {
            return false;
        }

        // MPを消費
        this.mp -= amount;

        return true;
    }


    /* =========================
       MPを回復する
    ========================= */

    recoverMp(amount) {

        // MPを回復
        this.mp += amount;

        // 最大MPを超えないようにする
        if (this.mp > this.maxMp) {
            this.mp = this.maxMp;
        }

        return this.mp;
    }


    /* =========================
       生存確認
    ========================= */

    isAlive() {

        return this.alive && this.hp > 0;
    }


    /* =========================
       防御状態を変更
    ========================= */

    defend() {

        this.isDefending = true;
    }


    /* =========================
       防御状態を解除
    ========================= */

    resetDefending() {

        this.isDefending = false;
    }

}

