
class BattleSystem {
    constructor() {
        this.attackRange = 40;
    }

    // 味方と敵が接触しているか確認
    isInRange(character, enemy) {
        const distance = Math.abs(character.x - enemy.x);
        return distance <= this.attackRange;
    }

    // 戦闘処理
    update(characters, enemies, deltaTime) {
        for (const character of characters) {

            if (!character.isAlive()) {
                continue;
            }

            // 攻撃対象を探す
            const target = enemies.find(enemy =>
                enemy.isAlive() &&
                this.isInRange(character, enemy)
            );

            if (!target) {
                character.isAttacking = false;
                continue;
            }

            // 攻撃開始
            character.isAttacking = true;

            if (character.canAttack(deltaTime)) {
                target.takeDamage(character.attack);

                console.log(
                    `${character.name} が ${target.name} に ${character.attack} ダメージ！`
                );

                if (!target.isAlive()) {
                    console.log(`${target.name} を撃破しました！`);
                }
            }
        }

        // 敵側の攻撃
        for (const enemy of enemies) {

            if (!enemy.isAlive()) {
                continue;
            }

            // 攻撃対象を探す
            const target = characters.find(character =>
                character.isAlive() &&
                this.isInRange(character, enemy)
            );

            if (!target) {
                enemy.isAttacking = false;
                continue;
            }

            // 攻撃開始
            enemy.isAttacking = true;

            if (enemy.canAttack(deltaTime)) {
                target.takeDamage(enemy.attack);

                console.log(
                    `${enemy.name} が ${target.name} に ${enemy.attack} ダメージ！`
                );

                if (!target.isAlive()) {
                    console.log(`${target.name} が倒されました！`);
                }
            }
        }
    }
}


