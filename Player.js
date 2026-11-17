

class Player {
    constructor() {
        // 城の情報
        this.castleHp = 300;
        this.maxCastleHp = 300;

        // 所持素材
        this.materials = {
            scale: 0,
            fillet: 0,
            fin: 0
        };

        // 生産した味方キャラクター
        this.characters = [];

        // 城の状態
        this.isCastleDestroyed = false;
    }

    // 城がダメージを受ける
    takeCastleDamage(damage) {
        this.castleHp -= damage;

        if (this.castleHp <= 0) {
            this.castleHp = 0;
            this.isCastleDestroyed = true;
        }
    }

    // 素材を獲得する
    addMaterial(materialName, amount) {
        if (this.materials[materialName] === undefined) {
            console.warn("存在しない素材です:", materialName);
            return;
        }

        this.materials[materialName] += amount;
    }

    // 素材を消費する
    useMaterial(materialName, amount) {
        if (this.materials[materialName] === undefined) {
            return false;
        }

        if (this.materials[materialName] < amount) {
            return false;
        }

        this.materials[materialName] -= amount;
        return true;
    }

    // 素材をまとめて消費する
    useMaterials(cost) {
        // すべての素材が足りているか確認
        for (const materialName in cost) {
            if (
                this.materials[materialName] === undefined ||
                this.materials[materialName] < cost[materialName]
            ) {
                return false;
            }
        }

        // 素材を消費
        for (const materialName in cost) {
            this.materials[materialName] -= cost[materialName];
        }

        return true;
    }

    // 城が破壊されたか確認
    isDefeated() {
        return this.isCastleDestroyed;
    }

    // 城のHP割合を取得
    getCastleHpRate() {
        return this.castleHp / this.maxCastleHp;
    }
}
