
/* =========================
   CHRONICLES OF FOURIA
   敵キャラクター管理クラス
========================= */

import Character from "./Character.js";

export default class Enemy extends Character {

    constructor(
        id,
        name,
        maxHp,
        maxMp,
        attack,
        defense,
        expReward = 0,
        goldReward = 0
    ) {

        // 基本キャラクター情報
        super(
            id,
            name,
            maxHp,
            maxMp,
            attack,
            defense
        );

        // 敵の報酬
        this.expReward = expReward;
        this.goldReward = goldReward;

        // 敵専用情報
        this.isEnemy = true;

    }


    /* =========================
       敵の攻撃
    ========================= */

    attackTarget(target) {

        // 敵が倒れている場合
        if (!this.isAlive()) {
            return 0;
        }

        // 攻撃対象が存在しない場合
        if (!target || !target.isAlive()) {
            return 0;
        }

        // 攻撃ダメージ計算
        const damage = Math.max(
            1,
            this.attack - target.defense
        );

        // 対象にダメージ
        return target.takeDamage(damage);

    }


    /* =========================
       報酬取得
    ========================= */

    getReward() {

        return {

            exp: this.expReward,
            gold: this.goldReward

        };

    }


    /* =========================
       敵情報取得
    ========================= */

    getEnemyStatus() {

        return {

            ...this.getStatus(),

            expReward: this.expReward,
            goldReward: this.goldReward,

            isEnemy: this.isEnemy

        };

    }

}

