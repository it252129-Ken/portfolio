
/* =========================
   CHRONICLES OF FOURIA
   プレイヤー管理クラス
========================= */

export default class Player {

    constructor() {

        // パーティーメンバー
        this.party = [];

        // パーティー人数の上限
        this.maxPartySize = 4;

        // プレイヤー情報
        this.level = 1;
        this.exp = 0;
        this.gold = 0;

        // 次のレベルまでに必要な経験値
        this.nextLevelExp = 100;
    }


    /* =========================
       パーティーに仲間を追加
    ========================= */

    addMember(character) {

        // 仲間が存在しない場合
        if (!character || !character.id) {
            return false;
        }

        // 人数上限の確認
        if (this.party.length >= this.maxPartySize) {
            return false;
        }

        // 同じ仲間がすでにいるか確認
        const alreadyExists = this.party.some(
            member => member.id === character.id
        );

        if (alreadyExists) {
            return false;
        }

        // パーティーに追加
        this.party.push(character);

        console.log(`${character.name} が仲間に加わりました！`);

        return true;
    }


    /* =========================
       パーティーから仲間を削除
    ========================= */

    removeMember(characterId) {

        const index = this.party.findIndex(
            member => member.id === characterId
        );

        if (index === -1) {
            return false;
        }

        const removedMember = this.party.splice(index, 1)[0];

        console.log(`${removedMember.name} がパーティーから離脱しました。`);

        return true;
    }


    /* =========================
       経験値を獲得
    ========================= */

    gainExp(amount) {

        // 不正な数値を確認
        if (!Number.isFinite(amount) || amount <= 0) {
            return false;
        }

        amount = Math.floor(amount);

        if (amount === 0) {
            return false;
        }

        this.exp += amount;

        console.log(`${amount}の経験値を獲得！`);

        // レベルアップ判定
        while (this.exp >= this.nextLevelExp) {
            this.levelUp();
        }

        return true;
    }


    /* =========================
       レベルアップ
    ========================= */

    levelUp() {

        if (this.exp < this.nextLevelExp) {
            return false;
        }

        // 必要経験値を消費
        this.exp -= this.nextLevelExp;

        // レベル上昇
        this.level++;

        // 次のレベルに必要な経験値を増やす
        this.nextLevelExp = this.level * 100;

        console.log(
            `レベルアップ！ 現在のレベル：${this.level}`
        );

        return true;
    }


    /* =========================
       お金を獲得
    ========================= */

    gainGold(amount) {

        if (!Number.isFinite(amount) || amount <= 0) {
            return false;
        }

        amount = Math.floor(amount);

        if (amount === 0) {
            return false;
        }

        this.gold += amount;

        console.log(`${amount}ゴールドを獲得！`);

        return true;
    }


    /* =========================
       お金を消費
    ========================= */

    spendGold(amount) {

        if (!Number.isFinite(amount) || amount <= 0) {
            return false;
        }

        amount = Math.floor(amount);

        // 所持金が足りない場合
        if (this.gold < amount) {
            console.log("ゴールドが足りません。");
            return false;
        }

        this.gold -= amount;

        console.log(`${amount}ゴールドを消費しました。`);

        return true;
    }


    /* =========================
       生存している仲間を取得
    ========================= */

    getAliveMembers() {

        return this.party.filter(
            member => member.isAlive()
        );
    }


    /* =========================
       戦闘不能の仲間を取得
    ========================= */

    getDefeatedMembers() {

        return this.party.filter(
            member => !member.isAlive()
        );
    }


    /* =========================
       全滅判定
    ========================= */

    isPartyDefeated() {

        return this.getAliveMembers().length === 0;
    }


    /* =========================
       パーティー全員を回復
    ========================= */

    restoreParty() {

        this.party.forEach(character => {

            if (typeof character.restore === "function") {

                character.restore();

            }
            else {

                character.heal(character.maxHp);
                character.recoverMp(character.maxMp);
                character.resetDefending();

            }

        });

        console.log("パーティー全員の体力が回復しました！");
    }


    /* =========================
       パーティーのステータス取得
    ========================= */

    getPartyStatus() {

        return this.party.map(character => {

            return {
                id: character.id,
                name: character.name,

                hp: character.hp,
                maxHp: character.maxHp,

                mp: character.mp,
                maxMp: character.maxMp,

                alive: character.isAlive()
            };

        });
    }


    /* =========================
       プレイヤー情報を取得
    ========================= */

    getStatus() {

        return {

            level: this.level,

            exp: this.exp,

            nextLevelExp: this.nextLevelExp,

            gold: this.gold,

            partyCount: this.party.length,

            aliveCount: this.getAliveMembers().length

        };
    }

}
