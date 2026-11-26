
/* =========================
   CHRONICLES OF FOURIA
   マップ管理クラス
========================= */

export default class MapManager {

    constructor() {

        // マップ情報
        this.maps = {

            grassland: {
                id: "grassland",
                name: "緑の平原",
                image: "Resource/Map1.png",
                difficulty: 1,
                description:
                    "冒険の始まりとなる穏やかな草原。"
            },

            volcano: {
                id: "volcano",
                name: "灼熱の火山",
                image: "Resource/Map2.png",
                difficulty: 2,
                description:
                    "灼熱の溶岩が流れる危険な火山。"
            },

            snow: {
                id: "snow",
                name: "氷結の雪山",
                image: "Resource/Map3.png",
                difficulty: 3,
                description:
                    "凍てつく雪と氷に覆われた山岳地帯。"
            },

            castle: {
                id: "castle",
                name: "暗黒の古城",
                image: "Resource/Map4.png",
                difficulty: 4,
                description:
                    "強大な敵が待ち受ける暗黒の古城。"
            }
        };

        // 現在選択されているマップ
        this.currentMap = null;

        // クリア済みマップ
        this.clearedMaps = [];
    }


    /* =========================
       マップ一覧取得
    ========================= */

    getMaps() {

        return Object.values(this.maps);
    }


    /* =========================
       マップ取得
    ========================= */

    getMap(mapId) {

        return this.maps[mapId] ?? null;
    }


    /* =========================
       マップ選択
    ========================= */

    selectMap(mapId) {

        const map = this.getMap(mapId);

        if (!map) {
            return false;
        }

        this.currentMap = map;

        return true;
    }


    /* =========================
       現在のマップ取得
    ========================= */

    getCurrentMap() {

        return this.currentMap;
    }


    /* =========================
       マップクリア
    ========================= */

    clearCurrentMap() {

        if (!this.currentMap) {
            return false;
        }

        const mapId = this.currentMap.id;

        if (!this.clearedMaps.includes(mapId)) {

            this.clearedMaps.push(mapId);
        }

        return true;
    }


    /* =========================
       クリア済み判定
    ========================= */

    isMapCleared(mapId) {

        return this.clearedMaps.includes(mapId);
    }


    /* =========================
       クリア済みマップ取得
    ========================= */

    getClearedMaps() {

        return [...this.clearedMaps];
    }


    /* =========================
       次のマップ取得
    ========================= */

    getNextMap() {

        const mapList = this.getMaps();

        if (!this.currentMap) {
            return mapList[0];
        }

        const currentIndex = mapList.findIndex(
            map => map.id === this.currentMap.id
        );

        if (
            currentIndex === -1 ||
            currentIndex >= mapList.length - 1
        ) {
            return null;
        }

        return mapList[currentIndex + 1];
    }


    /* =========================
       マップ進行状況取得
    ========================= */

    getProgress() {

        return {
            total: Object.keys(this.maps).length,
            cleared: this.clearedMaps.length,
            remaining:
                Object.keys(this.maps).length -
                this.clearedMaps.length
        };
    }
}

