class PiranhaPlant {
    constructor(pipeCol, pipeRow) {
        this.pipeX = pipeCol * CONFIG.TILE_SIZE + 20;
        this.pipeTopY = pipeRow * CONFIG.TILE_SIZE;
        this.width = 24;
        this.height = 32;
        this.x = this.pipeX;
        this.y = this.pipeTopY + CONFIG.TILE_SIZE;
        this.alive = true;
        this.state = 'hidden';
        this.stateTimer = 0;
        this.hiddenDuration = 120;
        this.stayDuration = 90;
        this.riseSpeed = 0.8;
        this.maxY = this.pipeTopY - this.height + 8;
    }

    update(playerX, playerY) {
        if (!this.alive) return true;

        const playerNear = Math.abs(playerX + 14 - (this.pipeX + 12)) < CONFIG.TILE_SIZE &&
            playerY + 30 <= this.pipeTopY + 4;

        if (this.state === 'hidden') {
            if (playerNear) {
                this.stateTimer = 0;
                return false;
            }
            this.stateTimer++;
            if (this.stateTimer >= this.hiddenDuration) {
                this.state = 'rising';
                this.stateTimer = 0;
            }
        } else if (this.state === 'rising') {
            this.y -= this.riseSpeed;
            if (this.y <= this.maxY) {
                this.y = this.maxY;
                this.state = 'staying';
                this.stateTimer = 0;
            }
        } else if (this.state === 'staying') {
            this.stateTimer++;
            if (this.stateTimer >= this.stayDuration) {
                this.state = 'descending';
            }
        } else if (this.state === 'descending') {
            this.y += this.riseSpeed;
            if (this.y >= this.pipeTopY + CONFIG.TILE_SIZE) {
                this.y = this.pipeTopY + CONFIG.TILE_SIZE;
                this.state = 'hidden';
                this.stateTimer = 0;
            }
        }
        return false;
    }

    getBounds() {
        if (this.state === 'hidden') return null;
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}
