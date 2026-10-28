
function checkPlatformCollision() {

    const platforms = getPlatforms(stage);

    for (let i = 0; i < platforms.length; i++) {

        const p = platforms[i];

        // 消えた足場は判定しない
        if (
            stage === 3 &&
            i >= 3 &&
            i <= 5 &&
            ground.stage3Removed[i - 3]
        ) {
            continue;
        }

        if (
            stage === 1 &&
            i === 3 &&
            ground.stage1Platform4Removed
        ) {
            continue;
        }

        let x = p[0];
        const y = p[1];
        let z = p[2];

        const width = p[3];
        const depth = p[4];

        // ステージ5の移動足場
        if (stage === 5) {
            if (i === 1) {
                z = 8 + Math.sin(ground.stage5Time) * 5;
            }

            if (i === 3) {
                z = 8 + Math.sin(
                    ground.stage5Time + Math.PI
                ) * 5;
            }
        }

        const insideX =
            Math.abs(player.position.x - x) <= width / 2;

        const insideZ =
            Math.abs(player.position.z - z) <= depth / 2;

        if (!insideX || !insideZ) {
            continue;
        }

        // 足場の上面
        const platformTop = y + 1.5;

        // 前フレームでは上面より上にいて、
        // 今フレームで上面以下に降りてきた場合に着地
        const crossedPlatform =
            player.previousY >= platformTop &&
            player.position.y <= platformTop;

        if (
            player.velocityY <= 0 &&
            crossedPlatform
        ) {
            player.land(y);
            return true;
        }
    }

    return false;
}
