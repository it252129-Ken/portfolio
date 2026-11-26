
/* =========================
   CHRONICLES OF FOURIA
   スキル管理クラス
========================= */

export default class SkillSystem {

    constructor() {

        // スキル情報
        this.skills = {

            // 魔法使いの攻撃魔法
            fire: {
                id: "fire",
                name: "ファイア",
                type: "attack",
                mpCost: 15,
                power: 40
            },

            flameBurst: {
                id: "flameBurst",
                name: "フレイムバースト",
                type: "attack",
                mpCost: 30,
                power: 80
            },

            // 僧侶の回復魔法
            heal: {
                id: "heal",
                name: "ヒール",
                type: "heal",
                mpCost: 15,
                power: 50
            },

            holyHeal: {
                id: "holyHeal",
                name: "ホーリーヒール",
                type: "heal",
                mpCost: 30,
                power: 100
            }
        };
    }


    /* =========================
       スキル一覧取得
    ========================= */

    getSkills(characterId) {

        if (characterId === "mage") {

            return [
                this.skills.fire,
                this.skills.flameBurst
            ];
        }

        if (characterId === "priest") {

            return [
                this.skills.heal,
                this.skills.holyHeal
            ];
        }

        return [];
    }


    /* =========================
       スキル取得
    ========================= */

    getSkill(skillId) {

        return this.skills[skillId] ?? null;
    }


    /* =========================
       スキル使用
    ========================= */

    useSkill(skillId, user, target) {

        const skill = this.getSkill(skillId);

        // スキルが存在しない
        if (!skill) {
            return {
                success: false,
                message: "スキルが存在しません。"
            };
        }

        // 使用者が存在しない
        if (!user || !user.isAlive()) {
            return {
                success: false,
                message: "スキルを使用できません。"
            };
        }

        // MP不足
        if (user.mp < skill.mpCost) {
            return {
                success: false,
                message: "MPが足りません。"
            };
        }

        // 攻撃魔法
        if (skill.type === "attack") {

            if (!target || !target.isAlive()) {
                return {
                    success: false,
                    message: "攻撃対象がいません。"
                };
            }

            if (user.id !== "mage") {
                return {
                    success: false,
                    message: "このキャラクターは使用できません。"
                };
            }

            user.useMp(skill.mpCost);

            const damage = Math.max(
                1,
                skill.power + user.attack - target.defense
            );

            target.hp = Math.max(
                0,
                target.hp - damage
            );

            return {
                success: true,
                skill: skill.name,
                damage: damage,
                heal: 0,
                message:
                    `${user.name}は${skill.name}を使用！ ${target.name}に${damage}ダメージ！`
            };
        }


        // 回復魔法
        if (skill.type === "heal") {

            if (!target || !target.isAlive()) {
                return {
                    success: false,
                    message: "回復対象がいません。"
                };
            }

            if (user.id !== "priest") {
                return {
                    success: false,
                    message: "このキャラクターは使用できません。"
                };
            }

            user.useMp(skill.mpCost);

            const actualHeal = target.heal(
                skill.power
            );

            return {
                success: true,
                skill: skill.name,
                damage: 0,
                heal: actualHeal,
                message:
                    `${user.name}は${skill.name}を使用！ ${target.name}のHPが${actualHeal}回復！`
            };
        }


        return {
            success: false,
            message: "スキルを使用できません。"
        };
    }
}

