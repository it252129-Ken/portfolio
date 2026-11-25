
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
        this.exp = Number.isFinite(exp)
            ? Math.max(0, Math.floor(exp))
            : 0;

        // 敵の行動状態
        this.action = "attack";
    }


    /* =========================
       味方を攻撃する
    ========================= */

    attackTarget(target) {

        // 自分が戦闘不能なら攻撃しない
        if (!this.isAlive()) {
            return 0;
        }

        // 攻撃対象が存在しない場合
        if (!target || typeof target.isAlive !== "function") {
            return 0;
        }

        // 攻撃対象が戦闘不能なら攻撃しない
        if (!target.isAlive()) {
            return 0;
        }

        // 防御力を考慮したダメージ
        const damage = Math.max(
            1,
            this.attack - target.defense
        );

        // 実際に与えたダメージ
        const actualDamage = target.takeDamage(damage);

        console.log(`${this.name}の攻撃！`);

        console.log(
            `${target.name}に${actualDamage}のダメージ！`
        );

        // 対象が戦闘不能になった場合
        if (!target.isAlive()) {
            console.log(`${target.name}は戦闘不能になった！`);
        }

        return actualDamage;
    }


    /* =========================
       敵の行動を決定する
    ========================= */

    decideAction() {

        // 戦闘不能なら行動しない
        if (!this.isAlive()) {
            this.action = null;
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

            mp: this.mp,
            maxMp: this.maxMp,

            attack: this.attack,
            defense: this.defense,

            exp: this.exp,

            alive: this.isAlive(),

            action: this.action

        };
    }

}
