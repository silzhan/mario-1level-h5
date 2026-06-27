class Elevator {
    constructor(x, minY, maxY, widthTiles, speed) {
        this.x = x;
        this.width = widthTiles * CONFIG.TILE_SIZE;
        this.height = 12;
        this.minY = minY;
        this.maxY = maxY;
        this.speed = speed;
        this.direction = 1;
        this.y = minY;
        this.prevY = minY;
    }

    update() {
        this.prevY = this.y;
        this.y += this.speed * this.direction;

        if (this.y >= this.maxY) {
            this.y = this.maxY;
            this.direction = -1;
        } else if (this.y <= this.minY) {
            this.y = this.minY;
            this.direction = 1;
        }
    }

    getDeltaY() {
        return this.y - this.prevY;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    isPlayerOnTop(player) {
        const pb = player.getBounds();
        const eb = this.getBounds();
        const playerFeet = player.y + player.height;
        return (
            pb.x + pb.width > eb.x &&
            pb.x < eb.x + eb.width &&
            playerFeet >= eb.y - 4 &&
            playerFeet <= eb.y + 6 &&
            player.velY >= 0
        );
    }

    wouldCrush(player, tiles) {
        if (this.direction !== -1) return false;
        const playerTop = player.y;
        for (const tile of tiles) {
            if (!isSolidTile(tile.type)) continue;
            if (tile.y + tile.height <= playerTop + 2 &&
                tile.y + tile.height >= playerTop - 20 &&
                player.x + player.width > tile.x &&
                player.x < tile.x + tile.width) {
                const gap = playerTop - (tile.y + tile.height);
                if (gap < 5) return true;
            }
        }
        return false;
    }
}
