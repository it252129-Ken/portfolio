
/* =========================
   CHRONICLES OF FOURIA
   戦闘管理クラス
========================= */

export default class BattleSystem {

    constructor(gameManager) {

        this.gameManager = gameManager;

        // 戦闘ログ
        this.battleLog = [];

        // 戦闘中かどうか
        this.isActive = false;

        console.log("BattleSystem initialized");
    }


    /* =========================
       戦闘開始
    ========================= */

    startBattle() {

        if (!this.gameManager.currentMap) {

            console.warn("マップが選択されていません。");

            return false;
        }

        // 敵を生成
        this.gameManager.initializeEnemies();

        if (this.gameManager.enemies.length === 0) {

            console.warn("敵が生成されませんでした。");

            return false;
        }

        // 戦闘ログを初期化
        this.battleLog = [];

        this.isActive = true;

        // 戦闘開始ログ
        this.addLog("戦闘開始！");

        this.addLog(
            `${this.gameManager.currentMap.name}に敵が現れた！`
        );

        return true;
    }


    /* =========================
       通常攻撃
    ========================= */

    playerAttack(attacker, target) {

        if (!this.isActive) {
            return false;
        }

        if (!attacker || !attacker.isAlive()) {
            return false;
        }

        if (!target || !target.isAlive()) {
            return false;
        }

        // ダメージ計算
        const damage = Math.max(
            1,
            attacker.attack - target.defense
        );

        target.takeDamage(damage);

        this.addLog(
            `${attacker.name}の攻撃！ ${target.name}に${damage}ダメージ！`
        );

        if (!target.isAlive()) {

            this.addLog(
                `${target.name}を倒した！`
            );

        }

        // 勝敗判定
        this.checkBattleResult();

        // 画面更新
        this.updateUI();

        return damage;
    }


    /* =========================
       敵の攻撃
    ========================= */

    enemyAttack(attacker, target) {

        if (!this.isActive) {
            return false;
        }

        if (!attacker || !attacker.isAlive()) {
            return false;
        }

        if (!target || !target.isAlive()) {
            return false;
        }

        // ダメージ計算
        const damage = Math.max(
            1,
            attacker.attack - target.defense
        );

        target.takeDamage(damage);

        this.addLog(
            `${attacker.name}の攻撃！ ${target.name}は${damage}ダメージを受けた！`
        );

        if (!target.isAlive()) {

            this.addLog(
                `${target.name}は戦闘不能になった！`
            );

        }

        // 勝敗判定
        this.checkBattleResult();

        // 画面更新
        this.updateUI();

        return damage;
    }


    /* =========================
       回復
    ========================= */

    healCharacter(healer, target, amount, mpCost = 10) {

        if (!this.isActive) {
            return false;
        }

        if (!healer || !healer.isAlive()) {
            return false;
        }

        if (!target || !target.isAlive()) {
            return false;
        }

        if (healer.mp < mpCost) {

            this.addLog("MPが足りません！");

            return false;
        }

        // MP消費
        if (!healer.useMp(mpCost)) {
            return false;
        }

        // 回復量
        const beforeHp = target.hp;

        target.heal(amount);

        const recovered = target.hp - beforeHp;

        this.addLog(
            `${healer.name}は${target.name}を${recovered}回復した！`
        );

        this.updateUI();

        return recovered;
    }


    /* =========================
       防御
    ========================= */

    defendCharacter(character) {

        if (!this.isActive) {
            return false;
        }

        if (!character || !character.isAlive()) {
            return false;
        }

        character.defend();

        this.addLog(
            `${character.name}は身を守っている！`
        );

        this.updateUI();

        return true;
    }


    /* =========================
       敵ターン
    ========================= */

    executeEnemyTurn() {

        if (!this.isActive) {
            return false;
        }

        this.addLog("敵のターン！");


        const enemies =
            this.gameManager.enemies.filter(
                enemy => enemy.isAlive()
            );

        const party =
            this.gameManager.party.filter(
                character => character.isAlive()
            );


        // 敵がいない場合
        if (enemies.length === 0) {

            this.checkBattleResult();

            return false;
        }


        // 味方がいない場合
        if (party.length === 0) {

            this.checkBattleResult();

            return false;
        }


        // 生存している敵が順番に攻撃
        for (const enemy of enemies) {

            if (!this.isActive) {
                break;
            }

            const aliveParty =
                this.gameManager.party.filter(
                    character => character.isAlive()
                );

            if (aliveParty.length === 0) {
                break;
            }

            // 生存している味方から対象を選ぶ
            const target =
                aliveParty[
                    Math.floor(Math.random() * aliveParty.length)
                ];

            this.enemyAttack(enemy, target);

        }


        // 防御状態を解除
        this.gameManager.party.forEach(character => {

            character.resetDefending();

        });


        // UI更新
        this.updateUI();

        return true;
    }


    /* =========================
       勝敗判定
    ========================= */

    checkBattleResult() {

        if (!this.isActive) {
            return false;
        }

        const partyAlive =
            this.gameManager.party.some(
                character => character.isAlive()
            );

        const enemiesAlive =
            this.gameManager.enemies.some(
                enemy => enemy.isAlive()
            );


        // 味方が全滅
        if (!partyAlive) {

            this.finishBattle("defeat");

            return "defeat";
        }


        // 敵を全滅
        if (!enemiesAlive) {

            this.finishBattle("victory");

            return "victory";
        }

        return false;
    }


    /* =========================
       戦闘終了
    ========================= */

    finishBattle(result) {

        if (!this.isActive) {
            return;
        }

        this.isActive = false;

        if (result === "victory") {

            this.addLog("敵をすべて倒した！勝利！");

        } else {

            this.addLog("パーティーは全滅した……");

        }

        this.gameManager.finishBattle(result);
    }


    /* =========================
       戦闘ログ追加
    ========================= */

    addLog(message) {

        this.battleLog.push(message);

        // ログは最大30件
        if (this.battleLog.length > 30) {

            this.battleLog.shift();

        }

        this.updateBattleLog();
    }


    /* =========================
       戦闘ログ更新
    ========================= */

    updateBattleLog() {

        if (!this.gameManager.uiManager) {
            return;
        }

        this.gameManager.uiManager.updateBattleLog(
            this.battleLog
        );
    }


    /* =========================
       UI更新
    ========================= */

    updateUI() {

        if (!this.gameManager.uiManager) {
            return;
        }

        this.gameManager.uiManager.updateStatus();

    }


    /* =========================
       ログ取得
    ========================= */

    getBattleLog() {

        return [...this.battleLog];
    }

}
