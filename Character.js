
class Character {
    constructor(name, hp, attack, attackInterval, productionCost) {

        // キャラクター情報
        this.name = name;

        // ステータス
        this.maxHp = hp;
        this.hp = hp;
        this.attack = attack;

        // 攻撃間隔
        this.attackInterval = attackInterval;
        this.attackTimer = 0;

        // 生産に必要な素材
        this.productionCost = productionCost;

        // 位置と移動
        this.x = 0;
        this.y = 0;
        this.speed = 50;

        // 画像
        this.imagePath = this.getImagePath(name);

        // 状態
        this.isDead = false;
        this.isAttacking = false;
    }

    // キャラクター画像のパスを取得
    getImagePath(name) {

        const imagePaths = {
            "漁師": "Resource/魚屋さん.png",
            "槍兵": "Resource/赤の金魚.png",
            "弓兵": "Resource/黒い金魚.png"
        };

        return imagePaths[name] || "";
    }

    // ダメージを受ける
    takeDamage(damage) {

        this.hp -= damage;

        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
        }
    }

    // 攻撃できるか確認
    canAttack(deltaTime) {

        this.attackTimer += deltaTime;

        if (this.attackTimer >= this.attackInterval) {
            this.attackTimer = 0;
            return true;
        }

        return false;
    }

    // 生存確認
    isAlive() {
        return !this.isDead;
    }
}
