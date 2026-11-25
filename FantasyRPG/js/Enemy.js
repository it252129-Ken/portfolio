
/* =========================
   CHRONICLES OF FOURIA
   敵キャラクター管理クラス
========================= */

import Character from "./Character.js";

export default class Enemy extends Character {

    constructor({
        id,
        name,
        maxHp,
        attack,
        defense,
        exp = 0
    }) {

        // 共通ステータスを設定
        super({
            id,
            name,
            maxHp,
            maxMp: 0,
            attack,
            defense
        });

        // 敵固有の情報
        this.exp = exp;

        // 敵の行動状態
        this.action = "attack";
    }


    /* =========================
       プレイヤーを攻撃する
    ========================= */

    attackTarget(target) {

        // 自分が戦闘不能なら攻撃しない
        if (!this.isAlive()) {
            return 0;
        }

        // 攻撃対象がいない場合
        if (!target || !target.isAlive()) {
            return 0;
        }

        // 防御力を考慮したダメージ
        let damage = this.attack - target.defense;

        // 最低ダメージは1
        damage = Math.max(1, damage);

        // 対象にダメージを与える
        target.takeDamage(damage);

        console.log(
            `${this.name} の攻撃！ ${target.name} に ${damage} のダメージ！`
        );

        return damage;
    }


    /* =========================
       敵の行動を決定する
    ========================= */

    decideAction() {

        // 戦闘不能なら行動しない
        if (!this.isAlive()) {
            return null;
        }

        // 現時点では通常攻撃のみ
        this.action = "attack";

        return this.action;
    }


    /* =========================
       敵の情報を取得する
    ========================= */

    getStatus() {

        return {
            id: this.id,
            name: this.name,
            hp: this.hp,
            maxHp: this.maxHp,
            attack: this.attack,
            defense: this.defense,
            alive: this.isAlive()
        };
    }

}

