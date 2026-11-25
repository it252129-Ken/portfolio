
/* =========================
   CHRONICLES OF FOURIA
   ゲーム起動・画面管理
========================= */

import GameManager from "./js/GameManager.js";

let gameManager = null;

// マップ選択状態
let selectedMapId = null;

// 行動済みキャラクター
let actedCharacterIds = new Set();

// ポーションの所持数
let potionCount = 3;


/* =========================
   ゲーム初期化
========================= */

function initializeGame() {

    gameManager = new GameManager();

    selectedMapId = null;

    actedCharacterIds.clear();

    potionCount = 3;

    gameManager.uiManager.showTitleScreen();
}


/* =========================
   タイトルからマップ画面へ
========================= */

function startGame() {

    gameManager.uiManager.showMapScreen();

    selectedMapId = null;

    const decisionButton =
        document.getElementById("map-decision-button");

    if (decisionButton) {
        decisionButton.remove();
    }
}


/* =========================
   マップ選択
========================= */

function selectMap(mapId) {

    const result = gameManager.selectMap(mapId);

    if (!result) {
        return;
    }

    selectedMapId = mapId;

    document.querySelectorAll(".map-card").forEach(card => {

        card.classList.toggle(
            "selected",
            card.dataset.map === mapId
        );

    });

    let decisionButton =
        document.getElementById("map-decision-button");

    if (!decisionButton) {

        decisionButton = document.createElement("button");

        decisionButton.id = "map-decision-button";

        decisionButton.textContent = "このマップに挑戦する";

        document
            .getElementById("map-container")
            .appendChild(decisionButton);

        decisionButton.addEventListener("click", startBattle);
    }
}


/* =========================
   戦闘開始
========================= */

function startBattle() {

    if (!selectedMapId) {
        return;
    }

    actedCharacterIds.clear();

    const result = gameManager.startBattle();

    if (result === false) {
        return;
    }

    gameManager.uiManager.showBattleScreen();

    gameManager.uiManager.updateMapName();

    gameManager.uiManager.updateStatus();

    showCurrentCharacter();
}


/* =========================
   現在の行動キャラクター
========================= */

function showCurrentCharacter() {

    if (!gameManager.isBattleActive) {
        return;
    }

    const character = gameManager.getCurrentCharacter();

    if (!character) {
        return;
    }

    gameManager.uiManager.updateBattleMessage(
        `${character.name}の行動です。コマンドを選択してください。`
    );

    // 行動中のキャラクターを強調表示
    document.querySelectorAll(".party-member").forEach(card => {
        card.classList.remove("active-turn");
    });

    const activeCard =
        document.getElementById(`${character.id}-status`);

    if (activeCard) {
        activeCard.classList.add("active-turn");
    }
}


/* =========================
   行動後のターン進行
========================= */

function advanceAfterAction(character) {

    if (!gameManager.isBattleActive) {
        return;
    }

    // 行動済みにする
    actedCharacterIds.add(character.id);

    gameManager.uiManager.updateStatus();

    // 生存している味方
    const livingParty = gameManager.party.filter(member => {
        return member.isAlive();
    });

    // 全員が行動したか確認
    const allActed = livingParty.every(member => {
        return actedCharacterIds.has(member.id);
    });

    if (allActed) {

        actedCharacterIds.clear();

        gameManager.uiManager.updateBattleMessage(
            "敵のターンです！"
        );

        // 敵のターン
        gameManager.endPlayerTurn();

        if (!gameManager.isBattleActive) {
            return;
        }

        gameManager.currentCharacterIndex = 0;

        showCurrentCharacter();

        return;
    }

    // 次に行動できる味方を探す
    const currentIndex = gameManager.party.indexOf(character);

    for (let i = 1; i <= gameManager.party.length; i++) {

        const nextIndex =
            (currentIndex + i) % gameManager.party.length;

        const nextCharacter = gameManager.party[nextIndex];

        if (
            nextCharacter.isAlive() &&
            !actedCharacterIds.has(nextCharacter.id)
        ) {

            gameManager.currentCharacterIndex = nextIndex;

            showCurrentCharacter();

            return;
        }
    }
}


/* =========================
   敵の選択
========================= */

function chooseEnemy() {

    const livingEnemies = gameManager.enemies.filter(enemy => {
        return enemy.isAlive();
    });

    if (livingEnemies.length === 0) {
        return null;
    }

    const message = livingEnemies
        .map((enemy, index) => {
            return `${index + 1}. ${enemy.name} HP:${enemy.hp}`;
        })
        .join("\n");

    const answer = prompt(
        "攻撃する敵を選択してください。\n\n" +
        message
    );

    if (answer === null) {
        return null;
    }

    const index = Number(answer) - 1;

    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= livingEnemies.length
    ) {

        alert("正しい番号を入力してください。");

        return null;
    }

    return livingEnemies[index];
}


/* =========================
   味方の選択
========================= */

function chooseAlly() {

    const livingParty = gameManager.party.filter(member => {
        return member.isAlive();
    });

    if (livingParty.length === 0) {
        return null;
    }

    const message = livingParty
        .map((member, index) => {
            return `${index + 1}. ${member.name} HP:${member.hp}`;
        })
        .join("\n");

    const answer = prompt(
        "回復する味方を選択してください。\n\n" +
        message
    );

    if (answer === null) {
        return null;
    }

    const index = Number(answer) - 1;

    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= livingParty.length
    ) {

        alert("正しい番号を入力してください。");

        return null;
    }

    return livingParty[index];
}


/* =========================
   攻撃コマンド
========================= */

function attackCommand() {

    if (!gameManager.isBattleActive) {
        return;
    }

    const character = gameManager.getCurrentCharacter();

    if (!character) {
        return;
    }

    const target = chooseEnemy();

    if (!target) {
        return;
    }

    const success =
        gameManager.battleSystem.playerAttack(character, target);

    if (success !== false) {
        advanceAfterAction(character);
    }
}


/* =========================
   スキルコマンド
========================= */

function skillCommand() {

    if (!gameManager.isBattleActive) {
        return;
    }

    const character = gameManager.getCurrentCharacter();

    if (!character) {
        return;
    }

    let skillId = null;
    let target = null;

    // 魔法使い
    if (character.id === "mage") {

        const answer = prompt(
            "使用するスキルを選択してください。\n\n" +
            "1. ファイア（敵単体に攻撃）\n" +
            "2. フレイムバースト（敵全体に攻撃）"
        );

        if (answer === null) {
            return;
        }

        if (answer === "1") {
            skillId = "fire";
            target = chooseEnemy();
        }
        else if (answer === "2") {
            skillId = "flameBurst";
        }
        else {
            alert("正しい番号を入力してください。");
            return;
        }
    }

    // 僧侶
    else if (character.id === "priest") {

        const answer = prompt(
            "使用するスキルを選択してください。\n\n" +
            "1. ヒール（味方単体を回復）\n" +
            "2. ホーリーヒール（味方全体を回復）"
        );

        if (answer === null) {
            return;
        }

        if (answer === "1") {
            skillId = "heal";
            target = chooseAlly();
        }
        else if (answer === "2") {
            skillId = "holyHeal";
        }
        else {
            alert("正しい番号を入力してください。");
            return;
        }
    }

    else {

        alert(
            "このキャラクターはスキルを使用できません。"
        );

        return;
    }

    // 対象が必要なスキルで対象が選ばれていない場合
    if (
        (skillId === "fire" || skillId === "heal") &&
        !target
    ) {
        return;
    }

    const success =
        gameManager.skillSystem.useSkill(
            character,
            skillId,
            target
        );

    if (success) {
        advanceAfterAction(character);
    }
}


/* =========================
   防御コマンド
========================= */

function defendCommand() {

    if (!gameManager.isBattleActive) {
        return;
    }

    const character = gameManager.getCurrentCharacter();

    if (!character) {
        return;
    }

    gameManager.battleSystem.defendCharacter(character);

    advanceAfterAction(character);
}


/* =========================
   アイテムコマンド
========================= */

function itemCommand() {

    if (!gameManager.isBattleActive) {
        return;
    }

    const character = gameManager.getCurrentCharacter();

    if (!character) {
        return;
    }

    if (potionCount <= 0) {

        alert("ポーションを持っていません。");

        return;
    }

    if (character.hp >= character.maxHp) {

        alert("このキャラクターはHPが満タンです。");

        return;
    }

    const answer = confirm(
        `${character.name}にポーションを使用しますか？\n` +
        "HPを50回復します。\n\n" +
        `残り個数：${potionCount}`
    );

    if (!answer) {
        return;
    }

    character.heal(50);

    potionCount--;

    gameManager.battleSystem.addLog(
        `${character.name}はポーションを使用した！`
    );

    gameManager.battleSystem.addLog(
        "HPが50回復した！"
    );

    advanceAfterAction(character);
}


/* =========================
   マップ画面に戻る
========================= */

function returnToMap() {

    actedCharacterIds.clear();

    // 次の戦闘に備えて味方を回復
    gameManager.party.forEach(character => {

        character.heal(character.maxHp);

        if (typeof character.recoverMp === "function") {
            character.recoverMp(character.maxMp);
        }
    });

    gameManager.currentMap = null;

    gameManager.enemies = [];

    gameManager.isBattleActive = false;

    gameManager.battleSystem.isActive = false;

    gameManager.currentCharacterIndex = 0;

    selectedMapId = null;

    document.querySelectorAll(".map-card").forEach(card => {
        card.classList.remove("selected");
    });

    const decisionButton =
        document.getElementById("map-decision-button");

    if (decisionButton) {
        decisionButton.remove();
    }

    gameManager.uiManager.showMapScreen();
}


/* =========================
   タイトル画面に戻る
========================= */

function returnToTitle() {

    initializeGame();
}


/* =========================
   イベント設定
========================= */

function setupEventListeners() {

    // ゲーム開始
    document
        .getElementById("start-button")
        .addEventListener("click", startGame);

    // マップ選択
    document.querySelectorAll(".map-card").forEach(card => {

        card.addEventListener("click", () => {

            selectMap(card.dataset.map);

        });

    });

    // マップ選択画面から戻る
    document
        .getElementById("map-back-button")
        .addEventListener("click", returnToTitle);

    // 戦闘コマンド
    document
        .getElementById("attack-button")
        .addEventListener("click", attackCommand);

    document
        .getElementById("skill-button")
        .addEventListener("click", skillCommand);

    document
        .getElementById("defend-button")
        .addEventListener("click", defendCommand);

    document
        .getElementById("item-button")
        .addEventListener("click", itemCommand);

    // 戦闘結果画面
    document
        .getElementById("result-map-button")
        .addEventListener("click", returnToMap);

    document
        .getElementById("result-title-button")
        .addEventListener("click", returnToTitle);
}


/* =========================
   ゲーム起動
========================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeGame();

    setupEventListeners();

});
