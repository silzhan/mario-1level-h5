class FallingPlatform {
    constructor(x, y, widthTiles) {
        this.x = x;
        this.originalY = y;
        this.y = y;
        this.width = widthTiles * CONFIG.TILE_SIZE;
        this.height = 12;
        this.state = 'idle';
        this.shakeTimer = 0;
        this.shakeOffsetX = 0;
        this.velY = 0;
        this.active = true;
    }

    triggerShake() {
        if (this.state === 'idle') {
            this.state = 'shaking';
            this.shakeTimer = 0;
        }
    }

    update() {
        if (this.state === 'idle') return true;

        if (this.state === 'shaking') {
            this.shakeTimer++;
            this.shakeOffsetX = (Math.random() - 0.5) * 4;
            if (this.shakeTimer >= 18) {
                this.state = 'falling';
                this.velY = 0;
                this.shakeOffsetX = 0;
            }
            return true;
        }

        if (this.state === 'falling') {
            this.velY += CONFIG.GRAVITY;
            this.y += this.velY;
            if (this.y > 15 * CONFIG.TILE_SIZE + 64) {
                this.state = 'gone';
                this.active = false;
                return false;
            }
            return true;
        }

        return false;
    }

    getBounds() {
        return {
            x: this.x + this.shakeOffsetX,
            y: this.y,
            width: this.width,
            height: this.height
        };
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
