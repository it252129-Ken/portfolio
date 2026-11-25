
class ProductionSystem {
    constructor(materialSystem, characters) {
        // 素材管理システム
        this.materialSystem = materialSystem;

        // 生産した味方を管理する配列
        this.characters = characters;

        // 味方の最大数
        this.maxCharacters = 10;

        // キャラクターの生産データ
        this.characterData = {
            fisherman: {
                name: "漁師",
                hp: 100,
                attack: 15,
                attackInterval: 1.0,
                speed: 50,
                cost: {
                    scale: 2
                }
            },

            spearman: {
                name: "槍兵",
                hp: 180,
                attack: 25,
                attackInterval: 1.5,
                speed: 40,
                cost: {
                    fillet: 2
                }
            },

            archer: {
                name: "弓兵",
                hp: 80,
                attack: 35,
                attackInterval: 1.2,
                speed: 45,
                cost: {
                    fin: 2
                }
            }
        };
    }

    // キャラクターを生産する
    produceCharacter(type) {
        const data = this.characterData[type];

        // 存在しないキャラクター
        if (!data) {
            console.warn("存在しないキャラクターです:", type);
            return false;
        }

        // 最大数の確認
        if (this.characters.length >= this.maxCharacters) {
            console.log("味方の最大生産数に達しています！");
            return false;
        }

        // 素材を消費
        if (!this.materialSystem.useMaterials(data.cost)) {
            console.log("素材が足りません！");
            return false;
        }

        // キャラクターを生成
        const character = new Character(
            data.name,
            data.hp,
            data.attack,
            data.attackInterval,
            data.cost
        );

        // 移動速度を設定
        character.speed = data.speed;

        // 初期位置
        character.x = 100;
        character.y = 0;

        // 配列に追加
        this.characters.push(character);

        console.log(`${data.name} を生産しました！`);

        return true;
    }

    // 生産可能か確認する
    canProduce(type) {
        const data = this.characterData[type];

        if (!data) {
            return false;
        }

        if (this.characters.length >= this.maxCharacters) {
            return false;
        }

        const materials = this.materialSystem.getMaterials();

        for (const materialName in data.cost) {
            if (materials[materialName] < data.cost[materialName]) {
                return false;
            }
        }

        return true;
    }

    // 生存している味方の数を取得
    getAliveCharacterCount() {
        return this.characters.filter(
            character => character.isAlive()
        ).length;
    }
}


