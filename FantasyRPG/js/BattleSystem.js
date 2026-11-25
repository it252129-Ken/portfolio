
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

        // 経験値を獲得済みの敵
        this.rewardedEnemyIds = new Set();

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

        // 戦闘状態を初期化
        this.isActive = false;

        this.battleLog = [];

        this.rewardedEnemyIds.clear();

        // 敵を生成
        this.gameManager.initializeEnemies();

        // 敵が生成されたか確認
        if (
            !this.gameManager.enemies ||
            this.gameManager.enemies.length === 0
        ) {

            console.warn("敵が生成されませんでした。");

            return false;
        }

        // 戦闘開始
        this.isActive = true;

        this.addLog("戦闘開始！");

        this.addLog(
            `${this.gameManager.currentMap.name}に敵が現れた！`
        );

        this.updateUI();

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

        if (!this.gameManager.party.includes(attacker)) {
            return false;
        }

        if (!target || !target.isAlive()) {
            return false;
        }

        // 敵以外への攻撃を防止
        if (!this.gameManager.enemies.includes(target)) {
            return false;
        }

        // ダメージ計算
        const damage = Math.max(
            1,
            attacker.attack - target.defense
        );

        // 実際に与えたダメージ
        const actualDamage = target.takeDamage(damage);

        this.addLog(
            `${attacker.name}の攻撃！ ${target.name}に${actualDamage}ダメージ！`
        );

        // 敵を倒した場合
        if (!target.isAlive()) {

            this.addLog(
                `${target.name}を倒した！`
            );

            this.rewardEnemy(target);
        }

        // 勝敗判定
        this.checkBattleResult();

        // 画面更新
        this.updateUI();

        return actualDamage;
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

        // 敵以外からの攻撃を防止
        if (!this.gameManager.enemies.includes(attacker)) {
            return false;
        }

        // 味方以外への攻撃を防止
        if (!this.gameManager.party.includes(target)) {
            return false;
        }

        // ダメージ計算
        const damage = Math.max(
            1,
            attacker.attack - target.defense
        );

        // 実際に受けたダメージ
        const actualDamage = target.takeDamage(damage);

        this.addLog(
            `${attacker.name}の攻撃！ ${target.name}は${actualDamage}ダメージを受けた！`
        );

        // 味方が戦闘不能になった場合
        if (!target.isAlive()) {

            this.addLog(
                `${target.name}は戦闘不能になった！`
            );
        }

        // 勝敗判定
        this.checkBattleResult();

        // 画面更新
        this.updateUI();

        return actualDamage;
    }


    /* =========================
       敵撃破時の報酬
    ========================= */

    rewardEnemy(enemy) {

        if (!enemy || !enemy.id) {
            return;
        }

        // 同じ敵から二重に報酬を獲得しない
        if (this.rewardedEnemyIds.has(enemy.id)) {
            return;
        }

        this.rewardedEnemyIds.add(enemy.id);

        const exp = Math.max(
            0,
            Math.floor(enemy.exp || 0)
        );

        if (exp > 0 && this.gameManager.player) {

            this.gameManager.player.gainExp(exp);

            this.addLog(
                `${exp}の経験値を獲得！`
            );
        }
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

        if (!this.gameManager.party.includes(healer)) {
            return false;
        }

        if (!target || !target.isAlive()) {
            return false;
        }

        // 味方以外への回復を防止
        if (!this.gameManager.party.includes(target)) {
            return false;
        }

        // すでにHPが満タンの場合
        if (target.hp >= target.maxHp) {

            this.addLog("このキャラクターのHPは満タンです！");

            return false;
        }

        // MPが足りない場合
        if (healer.mp < mpCost) {

            this.addLog("MPが足りません！");

            return false;
        }

        // MP消費
        if (!healer.useMp(mpCost)) {
            return false;
        }

        // 回復前のHP
        const beforeHp = target.hp;

        // HP回復
        target.heal(amount);

        // 実際の回復量
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

        if (!this.gameManager.party.includes(character)) {
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

        // 生存している敵
        const enemies = this.gameManager.enemies.filter(
            enemy => enemy.isAlive()
        );

        // 敵がいない場合
        if (enemies.length === 0) {

            this.checkBattleResult();

            return false;
        }

        // 敵が順番に攻撃
        for (const enemy of enemies) {

            // 戦闘が終了したら中断
            if (!this.isActive) {
                break;
            }

            // 攻撃する敵が倒されていた場合
            if (!enemy.isAlive()) {
                continue;
            }

            // 生存している味方を再取得
            const aliveParty = this.gameManager.party.filter(
                character => character.isAlive()
            );

            // 味方が全滅している場合
            if (aliveParty.length === 0) {

                this.checkBattleResult();

                break;
            }

            // 攻撃対象をランダムに選択
            const target = aliveParty[
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

        // 味方の生存確認
        const partyAlive = this.gameManager.party.some(
            character => character.isAlive()
        );

        // 敵の生存確認
        const enemiesAlive = this.gameManager.enemies.some(
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

        if (result !== "victory" && result !== "defeat") {
            return;
        }

        // 戦闘終了
        this.isActive = false;

        if (result === "victory") {

            this.addLog("敵をすべて倒した！勝利！");

        } else {

            this.addLog("パーティーは全滅した……");

        }

        // GameManagerに結果を通知
        this.gameManager.finishBattle(result);

        // UI更新
        this.updateUI();
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
