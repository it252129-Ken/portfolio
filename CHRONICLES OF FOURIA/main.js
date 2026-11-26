

/* =========================
   CHRONICLES OF FOURIA
   ゲーム起動・操作管理
========================= */

// ゲーム管理クラス
import GameManager from "./js/GameManager.js";

// ゲーム管理インスタンス
let gameManager = null;


/* =========================
   ゲーム初期化
========================= */

function initializeGame() {

    gameManager = new GameManager();

    setupTitleButtons();

    setupMapButtons();

    setupBattleButtons();

    setupResultButtons();

    // タイトル画面を表示
    gameManager.uiManager.showTitleScreen();

    console.log("CHRONICLES OF FOURIA READY!");
}


/* =========================
   タイトル画面のボタン
========================= */

function setupTitleButtons() {

    const startButton = document.getElementById(
        "start-button"
    );

    if (!startButton) return;

    startButton.addEventListener("click", () => {

        gameManager.startGame();

        console.log("GAME START");
    });
}


/* =========================
   マップ選択ボタン
========================= */

function setupMapButtons() {

    const mapCards = document.querySelectorAll(
        ".map-card"
    );

    const mapContainer = document.getElementById(
        "map-container"
    );

    if (!mapContainer) return;

    // マップ決定ボタンを作成
    let decisionButton = document.getElementById(
        "map-decision-button"
    );

    if (!decisionButton) {

        decisionButton = document.createElement("button");

        decisionButton.id = "map-decision-button";

        decisionButton.textContent = "このマップに挑戦する";

        decisionButton.disabled = true;

        mapContainer.appendChild(decisionButton);
    }

    // 現在選択されているマップ
    let selectedMapId = null;

    // マップカードのクリック処理
    mapCards.forEach(card => {

        card.addEventListener("click", () => {

            const mapId = card.dataset.map;

            const success = gameManager.selectMap(mapId);

            if (!success) return;

            selectedMapId = mapId;

            // 選択状態を更新
            mapCards.forEach(item => {

                item.classList.remove("selected");
            });

            card.classList.add("selected");

            // 決定ボタンを有効化
            decisionButton.disabled = false;

            console.log("SELECTED MAP:", mapId);
        });
    });

    // マップ決定
    decisionButton.addEventListener("click", () => {

        if (!selectedMapId) return;

        gameManager.startBattle();
    });


    // マップ選択画面から戻る
    const backButton = document.getElementById(
        "map-back-button"
    );

    if (backButton) {

        backButton.addEventListener("click", () => {

            gameManager.returnToTitle();
        });
    }
}


/* =========================
   戦闘ボタン
========================= */

function setupBattleButtons() {

    // 通常攻撃
    const attackButton = document.getElementById(
        "attack-button"
    );

    if (attackButton) {

        attackButton.addEventListener("click", () => {

            gameManager.executeAttack();
        });
    }


    // スキル
    const skillButton = document.getElementById(
        "skill-button"
    );

    if (skillButton) {

        skillButton.addEventListener("click", () => {

            useSkillFromMenu();
        });
    }


    // 防御
    const defendButton = document.getElementById(
        "defend-button"
    );

    if (defendButton) {

        defendButton.addEventListener("click", () => {

            gameManager.executeDefend();
        });
    }


    // アイテム
    const itemButton = document.getElementById(
        "item-button"
    );

    if (itemButton) {

        itemButton.addEventListener("click", () => {

            gameManager.uiManager.updateBattleMessage(
                "アイテム機能は今後実装予定です。"
            );
        });
    }
}


/* =========================
   スキル選択
========================= */

function useSkillFromMenu() {

    const battleSystem = gameManager.battleSystem;

    if (!battleSystem || battleSystem.isBattleOver) {
        return;
    }

    const character =
        battleSystem.getCurrentCharacter();

    if (!character) return;

    // 使用可能なスキル一覧
    const skills = gameManager.skillSystem.getSkills(
        character.id
    );

    if (skills.length === 0) {

        gameManager.uiManager.updateBattleMessage(
            `${character.name}は使用できるスキルがありません。`
        );

        return;
    }

    // スキル一覧を表示
    const skillMessage = skills.map(
        (skill, index) => {

            return `${index + 1}. ${skill.name} (MP ${skill.mpCost})`;
        }
    ).join("\n");

    const answer = window.prompt(
        `${character.name}のスキル\n\n${skillMessage}\n\n番号を入力してください。`
    );

    // キャンセル
    if (answer === null) return;

    const skillIndex = Number(answer) - 1;

    if (
        !Number.isInteger(skillIndex) ||
        skillIndex < 0 ||
        skillIndex >= skills.length
    ) {

        gameManager.uiManager.updateBattleMessage(
            "正しいスキル番号を入力してください。"
        );

        return;
    }

    const selectedSkill = skills[skillIndex];

    // 回復魔法の場合
    if (selectedSkill.type === "heal") {

        const party = gameManager.player.getParty();

        const partyMessage = party.map(
            (member, index) => {

                return `${index + 1}. ${member.name} HP ${member.hp}/${member.maxHp}`;
            }
        ).join("\n");

        const targetAnswer = window.prompt(
            `${selectedSkill.name}\n\n回復する味方を選択してください。\n\n${partyMessage}\n\n番号を入力してください。`
        );

        if (targetAnswer === null) return;

        const targetIndex = Number(targetAnswer) - 1;

        if (
            !Number.isInteger(targetIndex) ||
            targetIndex < 0 ||
            targetIndex >= party.length
        ) {

            gameManager.uiManager.updateBattleMessage(
                "正しい対象番号を入力してください。"
            );

            return;
        }

        gameManager.executeSkill(
            selectedSkill.id,
            party[targetIndex].id
        );

        return;
    }

    // 攻撃魔法
    gameManager.executeSkill(
        selectedSkill.id
    );
}


/* =========================
   結果画面のボタン
========================= */

function setupResultButtons() {

    // マップ選択・次のマップへ
    const mapButton = document.getElementById(
        "result-map-button"
    );

    if (mapButton) {

        mapButton.addEventListener("click", () => {

            // 勝利した場合は次のマップへ
            if (
                gameManager.battleResult === "victory"
            ) {

                const moved = gameManager.goToNextMap();

                // 最後のマップをクリアした場合
                if (!moved) {

                    gameManager.returnToMap();
                }

            } else {

                // 敗北した場合はマップ選択に戻る
                gameManager.returnToMap();
            }
        });
    }


    // タイトルへ戻る
    const titleButton = document.getElementById(
        "result-title-button"
    );

    if (titleButton) {

        titleButton.addEventListener("click", () => {

            gameManager.returnToTitle();
        });
    }
}


/* =========================
   ゲーム起動
========================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeGame
);
