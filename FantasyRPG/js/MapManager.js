
/* =========================
   CHRONICLES OF FOURIA
   マップ管理クラス
========================= */

export default class MapManager {

    constructor(gameManager) {

        // ゲーム管理クラス
        this.gameManager = gameManager;

        // 現在選択されているマップ
        this.currentMap = null;

        // マップ情報
        this.maps = {

            grassland: {
                id: "grassland",
                name: "緑の平原",
                description: "穏やかな草原。冒険の始まりの地。",
                difficulty: 1,
                background: "Resource/Maps/grassland.png"
            },

            volcano: {
                id: "volcano",
                name: "灼熱の火山",
                description: "溶岩が流れる灼熱の大地。",
                difficulty: 2,
                background: "Resource/Maps/volcano.png"
            },

            snow: {
                id: "snow",
                name: "氷結の雪山",
                description: "猛吹雪が吹き荒れる極寒の山。",
                difficulty: 3,
                background: "Resource/Maps/snow.png"
            },

            castle: {
                id: "castle",
                name: "暗黒の古城",
                description: "強大な魔物が待ち受ける最後の城。",
                difficulty: 4,
                background: "Resource/Maps/castle.png"
            }
        };
    }


    /* =========================
       マップを取得
    ========================= */

    getMap(mapId) {

        return this.maps[mapId] || null;
    }


    /* =========================
       全マップを取得
    ========================= */

    getAllMaps() {

        return Object.values(this.maps);
    }


    /* =========================
       マップを選択
    ========================= */

    selectMap(mapId) {

        const map = this.getMap(mapId);

        if (!map) {

            console.error(
                "指定されたマップが見つかりません。",
                mapId
            );

            return false;
        }

        // 選択中のマップを設定
        this.currentMap = map;

        // GameManagerにも設定
        this.gameManager.currentMap = map;

        // ゲーム状態を更新
        this.gameManager.gameState = "map";

        console.log(`${map.name} を選択しました！`);

        return true;
    }


    /* =========================
       現在のマップを取得
    ========================= */

    getCurrentMap() {

        return this.currentMap;
    }


    /* =========================
       次のマップを取得
    ========================= */

    getNextMap(mapId) {

        const mapList = Object.keys(this.maps);

        const currentIndex = mapList.indexOf(mapId);

        if (currentIndex === -1) {
            return null;
        }

        const nextIndex = currentIndex + 1;

        if (nextIndex >= mapList.length) {
            return null;
        }

        return this.getMap(mapList[nextIndex]);
    }


    /* =========================
       前のマップを取得
    ========================= */

    getPreviousMap(mapId) {

        const mapList = Object.keys(this.maps);

        const currentIndex = mapList.indexOf(mapId);

        if (currentIndex <= 0) {
            return null;
        }

        return this.getMap(mapList[currentIndex - 1]);
    }


    /* =========================
       マップの難易度を取得
    ========================= */

    getDifficulty(mapId) {

        const map = this.getMap(mapId);

        if (!map) {
            return null;
        }

        return map.difficulty;
    }


    /* =========================
       マップの背景画像を取得
    ========================= */

    getBackground(mapId) {

        const map = this.getMap(mapId);

        if (!map) {
            return null;
        }

        return map.background;
    }


    /* =========================
       マップの選択を解除
    ========================= */

    clearCurrentMap() {

        this.currentMap = null;

        this.gameManager.currentMap = null;
    }

}
