
/* =========================
   CHRONICLES OF FOURIA
   スキル管理クラス
========================= */

export default class SkillSystem {

    constructor(battleSystem) {

        // 戦闘管理クラス
        this.battleSystem = battleSystem;

        // スキル一覧
        this.skills = {

            fire: {
                id: "fire",
                name: "ファイア",
                mpCost: 10,
                power: 40,
                type: "attack",
                target: "single"
            },

            flameBurst: {
                id: "flameBurst",
                name: "フレイムバースト",
                mpCost: 25,
                power: 30,
                type: "attack",
                target: "all"
            },

            heal: {
                id: "heal",
                name: "ヒール",
                mpCost: 10,
                power: 40,
                type: "heal",
                target: "single"
            },

            holyHeal: {
                id: "holyHeal",
                name: "ホーリーヒール",
                mpCost: 25,
                power: 30,
                type: "heal",
                target: "all"
            }
        };
    }


    /* =========================
       スキルを使用
    ========================= */

    useSkill(skillId, user, target = null) {

        // スキルを取得
        const skill = this.skills[skillId];

        if (!skill) {
            return false;
        }

        // 戦闘中か確認
        if (!this.battleSystem.isActive) {
            return false;
        }

        // 使用者の生存確認
        if (!user || !user.isAlive()) {
            return false;
        }

        // MPが足りるか確認
        if (user.mp < skill.mpCost) {
            this.battleSystem.addLog("MPが足りない！");
            return false;
        }

        // MPを消費
        if (!user.useMp(skill.mpCost)) {
            return false;
        }

        // スキルの種類によって処理を分ける
        if (skill.type === "attack") {

            return this.executeAttackSkill(
                skill,
                user,
                target
            );

        }

        if (skill.type === "heal") {

            return this.executeHealSkill(
                skill,
                user,
                target
            );

        }

        return false;
    }


    /* =========================
       攻撃スキル
    ========================= */

    executeAttackSkill(skill, user, target) {

        const enemies = this.battleSystem.gameManager.enemies;

        // 攻撃対象を決定
        const targets = skill.target === "all"
            ? enemies.filter(enemy => enemy.alive && enemy.hp > 0)
            : [target];

        if (
            targets.length === 0 ||
            targets.some(enemy => !enemy || !enemy.isAlive())
        ) {
            return false;
        }

        // 敵にダメージ
        for (const enemy of targets) {

            const damage = Math.max(
                1,
                user.attack + skill.power - enemy.defense
            );

            enemy.takeDamage(damage);

            const message =
                `${user.name} は ${skill.name} を使用！ ${enemy.name} に ${damage} のダメージ！`;

            console.log(message);
            this.battleSystem.addLog(message);
        }

        // 戦闘結果を確認
        this.battleSystem.checkBattleResult();

        return true;
    }


    /* =========================
       回復スキル
    ========================= */

    executeHealSkill(skill, user, target) {

        const party = this.battleSystem.gameManager.party;

        // 回復対象を決定
        const targets = skill.target === "all"
            ? party.filter(character => character.isAlive())
            : [target];

        if (
            targets.length === 0 ||
            targets.some(character => !character || !character.isAlive())
        ) {
            return false;
        }

        // HPを回復
        for (const character of targets) {

            const beforeHp = character.hp;

            character.heal(skill.power);

            const recovered = character.hp - beforeHp;

            const message =
                `${user.name} は ${skill.name} を使用！ ${character.name} のHPが ${recovered} 回復！`;

            console.log(message);
            this.battleSystem.addLog(message);
        }

        return true;
    }


    /* =========================
       スキル一覧を取得
    ========================= */

    getSkills() {

        return Object.values(this.skills);
    }


    /* =========================
       指定したスキルを取得
    ========================= */

    getSkill(skillId) {

        return this.skills[skillId] || null;
    }

}

