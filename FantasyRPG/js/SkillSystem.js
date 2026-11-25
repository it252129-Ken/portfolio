
/* =========================
   CHRONICLES OF FOURIA
   スキル管理クラス
========================= */

export default class SkillSystem {

    constructor(battleSystem) {

        this.battleSystem = battleSystem;

        this.gameManager = battleSystem.gameManager;

        // スキルデータ
        this.skills = {

            fire: {
                id: "fire",
                name: "ファイア",
                type: "attack",
                target: "single",
                mpCost: 10,
                power: 40
            },

            flameBurst: {
                id: "flameBurst",
                name: "フレイムバースト",
                type: "attack",
                target: "all",
                mpCost: 25,
                power: 30
            },

            heal: {
                id: "heal",
                name: "ヒール",
                type: "heal",
                target: "single",
                mpCost: 10,
                power: 40
            },

            holyHeal: {
                id: "holyHeal",
                name: "ホーリーヒール",
                type: "heal",
                target: "all",
                mpCost: 25,
                power: 30
            }

        };

        console.log("SkillSystem initialized");
    }


    /* =========================
       スキル使用
    ========================= */

    useSkill(user, skillId, target = null) {

        const skill = this.skills[skillId];

        // スキルの存在確認
        if (!skill) {

            this.battleSystem.addLog(
                "そのスキルは存在しません。"
            );

            return false;
        }

        // 戦闘中か確認
        if (!this.battleSystem.isActive) {

            return false;
        }

        // 使用者の確認
        if (!user || !user.isAlive()) {

            return false;
        }

        // MP確認
        if (user.mp < skill.mpCost) {

            this.battleSystem.addLog(
                "MPが足りません！"
            );

            return false;
        }

        // 対象確認
        if (skill.target === "single") {

            if (!target || !target.isAlive()) {

                this.battleSystem.addLog(
                    "対象を選択してください。"
                );

                return false;
            }

            // 攻撃魔法の対象
            if (
                skill.type === "attack" &&
                !this.gameManager.enemies.includes(target)
            ) {

                return false;
            }

            // 回復魔法の対象
            if (
                skill.type === "heal" &&
                !this.gameManager.party.includes(target)
            ) {

                return false;
            }

        }

        // MP消費
        if (!user.useMp(skill.mpCost)) {

            return false;
        }

        this.battleSystem.addLog(
            `${user.name}は${skill.name}を唱えた！`
        );

        let result = false;

        // 攻撃魔法
        if (skill.type === "attack") {

            result = this.executeAttackSkill(
                user,
                skill,
                target
            );

        }

        // 回復魔法
        else if (skill.type === "heal") {

            result = this.executeHealSkill(
                user,
                skill,
                target
            );

        }

        this.battleSystem.updateUI();

        return result;
    }


    /* =========================
       攻撃スキル
    ========================= */

    executeAttackSkill(user, skill, target) {

        let targets = [];

        if (skill.target === "all") {

            targets = this.gameManager.enemies.filter(
                enemy => enemy.isAlive()
            );

        } else {

            targets = [target];

        }

        if (targets.length === 0) {

            this.battleSystem.addLog(
                "攻撃できる敵がいません。"
            );

            return false;
        }

        // 各対象にダメージ
        targets.forEach(enemy => {

            const damage = Math.max(
                1,
                user.attack + skill.power - enemy.defense
            );

            enemy.takeDamage(damage);

            this.battleSystem.addLog(
                `${enemy.name}に${damage}ダメージ！`
            );

            if (!enemy.isAlive()) {

                this.battleSystem.addLog(
                    `${enemy.name}を倒した！`
                );

            }

        });

        // 勝敗判定
        this.battleSystem.checkBattleResult();

        return true;
    }


    /* =========================
       回復スキル
    ========================= */

    executeHealSkill(user, skill, target) {

        let targets = [];

        if (skill.target === "all") {

            targets = this.gameManager.party.filter(
                character => character.isAlive()
            );

        } else {

            targets = [target];

        }

        if (targets.length === 0) {

            this.battleSystem.addLog(
                "回復できる味方がいません。"
            );

            return false;
        }

        // 各対象を回復
        targets.forEach(character => {

            const beforeHp = character.hp;

            character.heal(skill.power);

            const recovered =
                character.hp - beforeHp;

            this.battleSystem.addLog(
                `${character.name}のHPが${recovered}回復した！`
            );

        });

        return true;
    }


    /* =========================
       スキル一覧取得
    ========================= */

    getSkills() {

        return Object.values(this.skills);
    }


    /* =========================
       スキル個別取得
    ========================= */

    getSkill(skillId) {

        return this.skills[skillId] || null;
    }

}
