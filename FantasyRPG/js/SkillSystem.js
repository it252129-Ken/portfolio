
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

            // 魔法使い：単体攻撃
            fire: {
                id: "fire",
                name: "ファイア",
                type: "attack",
                target: "single",
                mpCost: 10,
                power: 40
            },

            // 魔法使い：全体攻撃
            flameBurst: {
                id: "flameBurst",
                name: "フレイムバースト",
                type: "attack",
                target: "all",
                mpCost: 25,
                power: 30
            },

            // 僧侶：単体回復
            heal: {
                id: "heal",
                name: "ヒール",
                type: "heal",
                target: "single",
                mpCost: 10,
                power: 40
            },

            // 僧侶：全体回復
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

        // 味方以外はスキルを使用できない
        if (!this.gameManager.party.includes(user)) {
            return false;
        }

        // 使用者の職業を確認
        if (
            skill.type === "attack" &&
            user.id !== "mage"
        ) {

            this.battleSystem.addLog(
                "このキャラクターは攻撃魔法を使用できません。"
            );

            return false;
        }

        if (
            skill.type === "heal" &&
            user.id !== "priest"
        ) {

            this.battleSystem.addLog(
                "このキャラクターは回復魔法を使用できません。"
            );

            return false;
        }

        // MP確認
        if (user.mp < skill.mpCost) {

            this.battleSystem.addLog(
                "MPが足りません！"
            );

            return false;
        }

        // 対象を取得
        let targets = [];

        if (skill.type === "attack") {

            if (skill.target === "all") {

                targets = this.gameManager.enemies.filter(
                    enemy => enemy.isAlive()
                );

            } else {

                if (
                    !target ||
                    !target.isAlive() ||
                    !this.gameManager.enemies.includes(target)
                ) {

                    this.battleSystem.addLog(
                        "攻撃する敵を選択してください。"
                    );

                    return false;
                }

                targets = [target];
            }
        }

        else if (skill.type === "heal") {

            if (skill.target === "all") {

                targets = this.gameManager.party.filter(
                    character => character.isAlive()
                );

            } else {

                if (
                    !target ||
                    !target.isAlive() ||
                    !this.gameManager.party.includes(target)
                ) {

                    this.battleSystem.addLog(
                        "回復する味方を選択してください。"
                    );

                    return false;
                }

                targets = [target];
            }
        }

        else {
            return false;
        }

        // 対象がいない場合
        if (targets.length === 0) {

            this.battleSystem.addLog(
                "スキルの対象がいません。"
            );

            return false;
        }

        // 回復対象が全員満タンの場合
        if (
            skill.type === "heal" &&
            targets.every(character => {
                return character.hp >= character.maxHp;
            })
        ) {

            this.battleSystem.addLog(
                "回復する必要のある仲間がいません。"
            );

            return false;
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
                targets
            );

        }

        // 回復魔法
        else if (skill.type === "heal") {

            result = this.executeHealSkill(
                user,
                skill,
                targets
            );

        }

        // UI更新
        this.battleSystem.updateUI();

        return result;
    }


    /* =========================
       攻撃スキル
    ========================= */

    executeAttackSkill(user, skill, targets) {

        // 各対象にダメージ
        for (const enemy of targets) {

            const damage = Math.max(
                1,
                user.attack + skill.power - enemy.defense
            );

            // 実際に与えたダメージ
            const actualDamage = enemy.takeDamage(damage);

            this.battleSystem.addLog(
                `${enemy.name}に${actualDamage}ダメージ！`
            );

            // 敵を倒した場合
            if (!enemy.isAlive()) {

                this.battleSystem.addLog(
                    `${enemy.name}を倒した！`
                );

                // 経験値を獲得
                this.battleSystem.rewardEnemy(enemy);
            }
        }

        // 勝敗判定
        this.battleSystem.checkBattleResult();

        return true;
    }


    /* =========================
       回復スキル
    ========================= */

    executeHealSkill(user, skill, targets) {

        // 各対象を回復
        for (const character of targets) {

            const beforeHp = character.hp;

            character.heal(skill.power);

            const recovered =
                character.hp - beforeHp;

            this.battleSystem.addLog(
                `${character.name}のHPが${recovered}回復した！`
            );
        }

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


    /* =========================
       使用可能なスキル取得
    ========================= */

    getAvailableSkills(user) {

        if (!user || !user.isAlive()) {
            return [];
        }

        return this.getSkills().filter(skill => {

            if (skill.type === "attack") {
                return user.id === "mage";
            }

            if (skill.type === "heal") {
                return user.id === "priest";
            }

            return false;
        });
    }

}
