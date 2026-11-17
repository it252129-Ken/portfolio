
class Enemy {
    constructor(name, hp, attack, speed, materialDrop) {
        // 敵の名前
        this.name = name;

        // ステータス
        this.maxHp = hp;
        this.hp = hp;
        this.attack = attack;
        this.speed = speed;

        // 素材ドロップ情報
        this.materialDrop = materialDrop;

        // 位置
        this.x = 0;
        this.y = 0;

        // 攻撃関連
        this.attackInterval = 1.0;
        this.attackTimer = 0;

        // 状態管理
        this.isDead = false;
        this.isAttacking = false;
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

    // 倒されたときのドロップ素材を取得
    getMaterialDrop() {
        return { ...this.materialDrop };
    }
}

