class Springboard {
    constructor(x, y, launchForce) {
        this.x = x;
        this.baseY = y;
        this.y = y;
        this.width = CONFIG.TILE_SIZE;
        this.height = 24;
        this.launchForce = launchForce || -18;
        this.compressed = false;
        this.compressionTimer = 0;
        this.justLaunched = false;
    }

    compress() {
        this.compressed = true;
        this.compressionTimer = 0;
        this.height = 8;
        this.y = this.baseY + 16;
    }

    update() {
        if (this.compressed) {
            this.compressionTimer++;
            if (this.compressionTimer >= 6) {
                this.justLaunched = true;
                this.compressed = false;
                this.height = 24;
                this.y = this.baseY;
            }
        }
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    isPlayerOnTop(player) {
        const pb = player.getBounds();
        const platTop = this.y;
        const playerBottom = pb.y + pb.height;
        return pb.x + pb.width > this.x + 2 &&
               pb.x < this.x + this.width - 2 &&
               playerBottom >= platTop - 4 &&
               playerBottom <= platTop + 6 &&
               player.velY >= 0;
    }
}
