
/* =========================
   CHRONICLES OF FOURIA
   戦闘管理クラス
========================= */

export default class BattleSystem {

    constructor(gameManager) {

        // ゲーム管理クラス
        this.gameManager = gameManager;

        // 戦闘ログ
        this.battleLog = [];

        // 戦闘中かどうか
        this.isActive = false;
    }


    /* =========================
       戦闘開始
    ========================= */

    startBattle() {

        if (!this.gameManager.currentMap) {
            return false;
        }

        // 敵を初期化
        this.gameManager.initializeEnemies();

        if (this.gameManager.enemies.length === 0) {
            return false;
        }

        // 戦闘状態を初期化
        this.battleLog = [];
        this.isActive = true;

        console.log("戦闘開始！");

        this.addLog("戦闘開始！");

        return true;
    }


    /* =========================
       味方の通常攻撃
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

        // 敵にダメージ
        target.takeDamage(damage);

        const message =
            `${attacker.name} の攻撃！ ${target.name} に ${damage} のダメージ！`;

        console.log(message);
        this.addLog(message);

        // 戦闘結果を確認
        this.checkBattleResult();

        return damage;
    }


/* =========================
   敵の通常攻撃
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

    // 味方にダメージ
    target.takeDamage(damage);

    // 攻撃メッセージ
    const message =
        `${attacker.name} の攻撃！ ${target.name} に ${damage} のダメージ！`;

    console.log(message);
    this.addLog(message);

    // 戦闘結果を確認
    this.checkBattleResult();

    return damage;
}


    /* =========================
       味方の回復
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

        // MP消費
        if (!healer.useMp(mpCost)) {
            this.addLog(`${healer.name} はMPが足りない！`);
            return false;
        }

        // HP回復
        const beforeHp = target.hp;

        target.heal(amount);

        const recovered = target.hp - beforeHp;

        const message =
            `${healer.name} の回復！ ${target.name} のHPが ${recovered} 回復！`;

        console.log(message);
        this.addLog(message);

        return recovered;
    }


    /* =========================
       味方の防御
    ========================= */

    defendCharacter(character) {

        if (!this.isActive) {
            return false;
        }

        if (!character || !character.isAlive()) {
            return false;
        }

        character.defend();

        const message = `${character.name} は身を守っている！`;

        console.log(message);
        this.addLog(message);

        return true;
    }


    /* =========================
       敵の行動
    ========================= */

    executeEnemyTurn() {

        if (!this.isActive) {
            return false;
        }

        const aliveEnemies = this.gameManager.enemies.filter(
            enemy => enemy.alive && enemy.hp > 0
        );

        const aliveParty = this.gameManager.party.filter(
            character => character.isAlive()
        );

        if (aliveEnemies.length === 0 || aliveParty.length === 0) {
            this.checkBattleResult();
            return false;
        }

        // 生存している敵が順番に攻撃
        for (const enemy of aliveEnemies) {

            const targets = this.gameManager.party.filter(
                character => character.isAlive()
            );

            if (targets.length === 0) {
                break;
            }

            // 現時点では先頭の生存メンバーを狙う
            const target = targets[0];

            this.enemyAttack(enemy, target);

            if (!this.isActive) {
                break;
            }
        }

        // 防御状態を解除
        for (const character of this.gameManager.party) {
            character.resetDefending();
        }

        return true;
    }


    /* =========================
       戦闘結果を確認
    ========================= */

    checkBattleResult() {

        const aliveParty = this.gameManager.party.some(
            character => character.isAlive()
        );

        const aliveEnemies = this.gameManager.enemies.some(
            enemy => enemy.alive && enemy.hp > 0
        );

        if (!aliveParty) {
            this.finishBattle("defeat");
            return "defeat";
        }

        if (!aliveEnemies) {
            this.finishBattle("victory");
            return "victory";
        }

        return "continue";
    }


    /* =========================
       戦闘終了
    ========================= */

    finishBattle(result) {

        this.isActive = false;

        this.gameManager.finishBattle(result);

        if (result === "victory") {
            this.addLog("勝利！敵をすべて倒した！");
        } else {
            this.addLog("敗北……パーティーは全滅した。");
        }

        return result;
    }


    /* =========================
   戦闘ログを追加
========================= */

addLog(message) {

    this.battleLog.push(message);

    // ログは最新20件まで保持
    if (this.battleLog.length > 20) {
        this.battleLog.shift();
    }

    // 画面を更新
    this.updateUI();
}


/* =========================
   戦闘画面を更新
========================= */

updateUI() {

    // UIManagerが存在する場合
    if (this.gameManager.uiManager) {

        // ステータスを更新
        this.gameManager.uiManager.updateStatus();

        // 戦闘ログを更新
        this.gameManager.uiManager.updateBattleLog(
            this.battleLog
        );
    }
}


    /* =========================
       戦闘ログを取得
    ========================= */

    getBattleLog() {

        return [...this.battleLog];
    }

}
