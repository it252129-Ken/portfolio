
/* =========================
   CHRONICLES OF FOURIA
   戦闘管理クラス
========================= */

export default class BattleSystem {

    constructor(player, gameManager) {

        // プレイヤー管理
        this.player = player;

        // ゲーム管理
        this.gameManager = gameManager;

        // 現在の敵
        this.enemy = null;

        // 現在行動するキャラクター
        this.currentCharacterIndex = 0;

        // 戦闘状態
        this.isBattleOver = false;

        // 戦闘ログ
        this.battleLog = [];
    }


    /* =========================
       戦闘開始
    ========================= */

    startBattle(enemy) {

        this.enemy = enemy;

        this.currentCharacterIndex = 0;

        this.isBattleOver = false;

        this.battleLog = [];

        this.addLog(
            `${enemy.name}が現れた！`
        );

        this.skipDeadCharacters();

        return true;
    }


    /* =========================
       現在のキャラクター取得
    ========================= */

    getCurrentCharacter() {

        if (this.isBattleOver) {
            return null;
        }

        const party = this.player.getParty();

        if (party.length === 0) {
            return null;
        }

        return party[this.currentCharacterIndex];
    }


    /* =========================
       キャラクターの順番を進める
    ========================= */

    nextCharacter() {

        const party = this.player.getParty();

        if (party.length === 0) {
            return;
        }

        this.currentCharacterIndex++;

        // パーティー全員の行動後に次のラウンド
        if (this.currentCharacterIndex >= party.length) {

            this.currentCharacterIndex = 0;

            this.enemyTurn();

            if (this.checkBattleEnd()) {
                return;
            }
        }

        this.skipDeadCharacters();
    }


    /* =========================
       倒れているキャラクターをスキップ
    ========================= */

    skipDeadCharacters() {

        const party = this.player.getParty();

        let count = 0;

        while (
            party.length > 0 &&
            !party[this.currentCharacterIndex].isAlive() &&
            count < party.length
        ) {

            this.currentCharacterIndex++;

            if (this.currentCharacterIndex >= party.length) {

                this.currentCharacterIndex = 0;

                this.enemyTurn();

                if (this.checkBattleEnd()) {
                    return;
                }
            }

            count++;
        }

        this.checkBattleEnd();
    }


    /* =========================
       通常攻撃
    ========================= */

    attack() {

        if (this.isBattleOver) {
            return false;
        }

        const character = this.getCurrentCharacter();

        if (!character || !character.isAlive()) {
            return false;
        }

        if (!this.enemy || !this.enemy.isAlive()) {
            return false;
        }

        // ダメージ計算
        const damage = Math.max(
            1,
            character.attack - this.enemy.defense
        );

        // 敵にダメージ
        this.enemy.hp = Math.max(
            0,
            this.enemy.hp - damage
        );

        this.addLog(
            `${character.name}の攻撃！ ${this.enemy.name}に${damage}ダメージ！`
        );

        // 勝敗判定
        if (this.checkBattleEnd()) {
            return true;
        }

        // 行動順を進める
        this.nextCharacter();

        return true;
    }


    /* =========================
       防御
    ========================= */

    defend() {

        if (this.isBattleOver) {
            return false;
        }

        const character = this.getCurrentCharacter();

        if (!character || !character.isAlive()) {
            return false;
        }

        character.defend();

        this.addLog(
            `${character.name}は防御の構えを取った！`
        );

        this.nextCharacter();

        return true;
    }


    /* =========================
       敵のターン
    ========================= */

    enemyTurn() {

        if (this.isBattleOver) {
            return;
        }

        if (!this.enemy || !this.enemy.isAlive()) {
            return;
        }

        const aliveParty = this.player.getAliveParty();

        if (aliveParty.length === 0) {
            this.checkBattleEnd();
            return;
        }

        // 生存しているパーティーから攻撃対象を選択
        const target = aliveParty[
            Math.floor(Math.random() * aliveParty.length)
        ];

        // 敵の攻撃
        const damage = target.takeDamage(
            this.enemy.attack
        );

        this.addLog(
            `${this.enemy.name}の攻撃！ ${target.name}に${damage}ダメージ！`
        );

        // 勝敗判定
        this.checkBattleEnd();
    }


    /* =========================
       勝敗判定
    ========================= */

    checkBattleEnd() {

        if (this.isBattleOver) {
            return true;
        }

        // 敵撃破
        if (this.enemy && !this.enemy.isAlive()) {

            this.isBattleOver = true;

            this.addLog(
                `${this.enemy.name}を倒した！`
            );

            this.rewardPlayer();

            if (this.gameManager) {
                this.gameManager.onBattleEnd("victory");
            }

            return true;
        }

        // パーティー全滅
        if (this.player.isPartyDefeated()) {

            this.isBattleOver = true;

            this.addLog("パーティーは全滅した……");

            if (this.gameManager) {
                this.gameManager.onBattleEnd("defeat");
            }

            return true;
        }

        return false;
    }


    /* =========================
       報酬獲得
    ========================= */

    rewardPlayer() {

        if (!this.enemy) {
            return;
        }

        const reward = this.enemy.getReward();

        // 経験値獲得
        this.player.gainExp(reward.exp);

        // ゴールド獲得
        this.player.addGold(reward.gold);

        this.addLog(
            `${reward.exp} EXP と ${reward.gold} Gを獲得！`
        );
    }


    /* =========================
       戦闘ログ追加
    ========================= */

    addLog(message) {

        this.battleLog.push(message);

        // ログは最大50件まで
        if (this.battleLog.length > 50) {
            this.battleLog.shift();
        }
    }


    /* =========================
       ログ取得
    ========================= */

    getBattleLog() {

        return [...this.battleLog];
    }


    /* =========================
       戦闘状態取得
    ========================= */

    getBattleStatus() {

        return {

            battleOver: this.isBattleOver,

            currentCharacter:
                this.getCurrentCharacter()?.getStatus() ?? null,

            enemy:
                this.enemy?.getEnemyStatus() ?? null,

            party:
                this.player.getParty().map(
                    character => character.getStatus()
                ),

            log:
                this.getBattleLog()
        };
    }
}

