
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

        // 戦闘不能ならダメージを受けない
        if (!this.isAlive()) {
            return 0;
        }

        // ダメージを0以上の整数にする
        damage = Math.max(0, Math.floor(damage));

        // 防御中ならダメージを半減
        if (this.isDefending) {
            damage = Math.floor(damage / 2);
        }

        // HPを減らす
        this.hp -= damage;

        // HPが0未満にならないようにする
        this.hp = Math.max(0, this.hp);

        // 戦闘不能判定
        if (this.hp <= 0) {
            this.alive = false;
            this.isDefending = false;
        }

        return damage;
    }


    /* =========================
       HPを回復する
    ========================= */

    heal(amount) {

        // 回復量を0以上の整数にする
        amount = Math.max(0, Math.floor(amount));

        // 戦闘不能でも回復可能
        this.hp += amount;

        // 最大HPを超えないようにする
        this.hp = Math.min(this.hp, this.maxHp);

        // HPが1以上なら復活
        if (this.hp > 0) {
            this.alive = true;
        }

        return this.hp;
    }


    /* =========================
       MPを消費する
    ========================= */

    useMp(amount) {

        amount = Math.max(0, Math.floor(amount));

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

        amount = Math.max(0, Math.floor(amount));

        // MPを回復
        this.mp += amount;

        // 最大MPを超えないようにする
        this.mp = Math.min(this.mp, this.maxMp);

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

        if (this.isAlive()) {
            this.isDefending = true;
        }
    }


    /* =========================
       防御状態を解除
    ========================= */

    resetDefending() {

        this.isDefending = false;
    }


    /* =========================
       HP・MPを全回復
    ========================= */

    restore() {

        this.hp = this.maxHp;
        this.mp = this.maxMp;

        this.alive = true;
        this.isDefending = false;
    }

}
