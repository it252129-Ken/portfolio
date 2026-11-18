
class MaterialSystem {
    constructor() {
        // 素材の初期所持数
        this.materials = {
            scale: 4,
            fillet: 2,
            fin: 2
        };
    }

    // 素材を追加する
    addMaterial(materialName, amount) {
        if (this.materials[materialName] === undefined) {
            console.warn("存在しない素材です:", materialName);
            return;
        }

        this.materials[materialName] += amount;

        console.log(
            `${materialName} を ${amount} 個獲得しました！`
        );
    }

    // 敵を倒したときに素材を獲得する
    collectEnemyDrop(enemy) {
        const drops = enemy.getMaterialDrop();

        for (const materialName in drops) {
            this.addMaterial(materialName, drops[materialName]);
        }
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

    // 複数の素材を消費する
    useMaterials(cost) {
        // 素材が足りているか確認
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

    // 現在の素材数を取得
    getMaterials() {
        return { ...this.materials };
    }
}


