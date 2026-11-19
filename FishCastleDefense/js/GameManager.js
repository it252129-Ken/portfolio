
class GameManager {
    constructor() {
        // プレイヤー
        this.player = new Player();

        // 素材管理
        this.materialSystem = new MaterialSystem();

        // 味方と敵
        this.characters = [];
        this.enemies = [];
        
        // 画面に表示する画像要素
　　　　this.unitElements = new Map();

        // 戦闘管理
        this.battleSystem = new BattleSystem();

        // 生産管理
        this.productionSystem = new ProductionSystem(
            this.materialSystem,
            this.characters
        );

        // UI管理
        this.uiManager = new UIManager();

        // 敵の城
        this.enemyCastleHp = 300;
        this.maxEnemyCastleHp = 300;

        // 敵の出現管理
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 5;

        // ゲーム時間
        this.gameTime = 0;

        // ゲーム状態
        this.isGameOver = false;
    }

    // ゲーム開始
    start() {
        console.log("FISH CASTLE DEFENSE START!");

        this.isGameOver = false;
        this.gameTime = 0;
    }

    // 毎フレームの更新
    update(deltaTime) {
        if (this.isGameOver) {
            return;
        }

        this.gameTime += deltaTime;

        // 敵を出現させる
        this.updateEnemySpawn(deltaTime);

        // キャラクターの移動
        this.updateMovement(deltaTime);

        // キャラクターと敵の画像を更新
　　　　　this.updateUnitDisplay();

        // 自動戦闘
        this.battleSystem.update(
            this.characters,
            this.enemies,
            deltaTime
        );

        // 死亡した敵から素材を獲得
        this.collectDefeatedEnemies();

        // 死亡したキャラクターを削除
        this.removeDefeatedCharacters();

        // 城への攻撃
        this.updateCastleBattle();

        // UI更新
        this.updateUI(deltaTime);

        // 勝敗判定
        this.checkGameResult();
    }

    // 敵の出現
    updateEnemySpawn(deltaTime) {
        this.enemySpawnTimer += deltaTime;

        if (this.enemySpawnTimer < this.enemySpawnInterval) {
            return;
        }

        this.enemySpawnTimer = 0;

        const enemy = this.createEnemy();

        // 敵を右側の城付近に出現させる
　　　　　enemy.x = 850;

　　　　// 敵を追加する
        this.enemies.push(enemy);
    }

    // 敵を生成
    createEnemy() {
        const time = this.gameTime;

        if (time >= 90) {
            return new Enemy(
                "サメ",
                400,
                35,
                20,
                { fin: 2, scale: 3 }
            );
        }

        if (time >= 60) {
            return new Enemy(
                "ピラニア",
                90,
                15,
                55,
                { fillet: 1 }
            );
        }

        if (time >= 30) {
            const isPiranha = Math.random() < 0.5;

            if (isPiranha) {
                return new Enemy(
                    "ピラニア",
                    90,
                    15,
                    55,
                    { fillet: 1 }
                );
            }
        }

        return new Enemy(
            "小魚",
            50,
            5,
            35,
            { scale: 1 }
        );
    }

    // キャラクターと敵の移動
  
    // キャラクターと敵の移動
    updateMovement(deltaTime) {

        // 味方の移動
        for (const character of this.characters) {

            if (!character.isAlive()) {
                continue;
            }

            // 攻撃中は移動しない
            if (character.isAttacking) {
                continue;
            }

            // 歩行アニメーションにする
            character.setAnimation("walk");

            // 移動
            character.x += character.speed * deltaTime;
        }

        // 敵の移動
        for (const enemy of this.enemies) {

            if (!enemy.isAlive() || enemy.isAttacking) {
                continue;
            }

            enemy.x -= enemy.speed * deltaTime;
        }
    }


    // 倒された敵の素材を獲得
collectDefeatedEnemies() {
    for (const enemy of this.enemies) {
        if (enemy.isDead && !enemy.dropCollected) {

            // 素材を獲得
            this.materialSystem.collectEnemyDrop(enemy);

            enemy.dropCollected = true;
        }
    }

    this.enemies = this.enemies.filter(
        enemy => !enemy.isDead
    );
}

    // 倒された味方を削除
removeDefeatedCharacters() {

    for (let i = this.characters.length - 1; i >= 0; i--) {

        if (!this.characters[i].isAlive()) {
            this.characters.splice(i, 1);
        }

    }

}

    // 城に到達した敵・味方を処理
    updateCastleBattle() {
        // 敵がプレイヤーの城に到達
        for (const enemy of this.enemies) {
            if (enemy.x <= 0) {
                this.player.takeCastleDamage(enemy.attack);
                enemy.isDead = true;
            }
        }

        // 味方が敵の城に到達
        for (const character of this.characters) {
            if (character.x >= 900) {
                this.enemyCastleHp -= character.attack;
                character.isDead = true;

                if (this.enemyCastleHp < 0) {
                    this.enemyCastleHp = 0;
                }
            }
        }

        // 到達した敵を削除
        this.enemies = this.enemies.filter(
            enemy => !enemy.isDead
        );

    }

    updateUI(deltaTime) {
    this.uiManager.update(
        this.player,
        this.enemyCastleHp,
        this.enemies,
        this.characters,
        deltaTime,
        this.materialSystem.getMaterials()
    );
}

    // 勝敗判定
    checkGameResult() {
        if (this.enemyCastleHp <= 0) {
            this.isGameOver = true;
            this.uiManager.showVictory();
            console.log("VICTORY!");
        }
        else if (this.player.isDefeated()) {
            this.isGameOver = true;
            this.uiManager.showDefeat();
            console.log("DEFEAT...");
        }
    }

    // 味方を生産
    produceCharacter(type) {
        return this.productionSystem.produceCharacter(type);
    }



// キャラクターと敵の画像を表示・更新
updateUnitDisplay() {

    const layer = document.getElementById("character-layer");

    if (!layer) {
        return;
    }

    // 味方と敵をまとめる
    const units = [
        ...this.characters.map(unit => ({
            unit: unit,
            type: "ally"
        })),

        ...this.enemies.map(unit => ({
            unit: unit,
            type: "enemy"
        }))
    ];

    const activeUnits = new Set();

    for (const data of units) {

        const unit = data.unit;

        activeUnits.add(unit);

        // 画像要素を取得
        let image = this.unitElements.get(unit);

        // まだ画像がない場合は作成
        if (!image) {

            image = document.createElement("img");

            image.className = "unit-sprite " + data.type;

            image.src = unit.imagePath;

            image.alt = unit.name;

            layer.appendChild(image);

            this.unitElements.set(unit, image);
        }

        // 画像の位置を更新
        image.style.left = unit.x + "px";
        image.style.bottom = "0px";
    }

    // 倒されたキャラクターなどの画像を削除
    for (const [unit, image] of this.unitElements) {

        if (!activeUnits.has(unit)) {

            image.remove();

            this.unitElements.delete(unit);
        }
    }
}

    
}


