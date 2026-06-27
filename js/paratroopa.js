class Paratroopa {
    constructor(x, y, color, flyType) {
        this.type = 'paratroopa';
        this.x = x;
        this.y = y;
        this.width = 28;
        this.height = 38;
        this.color = color || 'green';
        this.flyType = flyType || 'vertical';
        this.alive = true;
        this.hasWings = true;

        this.originX = x;
        this.originY = y;
        this.flyTimer = 0;
        this.flySpeed = 0.04;
        this.flyAmplitudeX = 64;
        this.flyAmplitudeY = 48;

        this.velX = -1.2;
        this.velY = 0;
        this.onGround = false;
        this.facingRight = false;

        this.isShell = false;
        this.shellMoving = false;
        this.shellSpeed = 8;
        this.shellTimer = 0;
    }

    update(tiles) {
        if (!this.alive) return false;

        if (this.hasWings) {
            this.flyTimer += this.flySpeed;
            if (this.flyType === 'vertical') {
                this.y = this.originY + Math.sin(this.flyTimer) * this.flyAmplitudeY;
            } else {
                this.x = this.originX + Math.cos(this.flyTimer * 0.7) * this.flyAmplitudeX;
                this.y = this.originY + Math.sin(this.flyTimer) * (this.flyAmplitudeY * 0.5);
                this.facingRight = Math.cos(this.flyTimer * 0.7) > 0 ? false : true;
            }
            return true;
        }

        if (this.isShell && !this.shellMoving) {
            this.shellTimer++;
            if (this.shellTimer >= 300) {
                this.isShell = false;
                this.velX = -1.2;
                this.height = 38;
            }
            this.velY += CONFIG.GRAVITY;
            if (this.velY > CONFIG.MAX_FALL_SPEED) this.velY = CONFIG.MAX_FALL_SPEED;
            this.y += this.velY;
            this.resolveTileCollisionY(tiles);
            if (this.y > 15 * CONFIG.TILE_SIZE + 64) return false;
            return true;
        }

        if (this.isShell && this.shellMoving) {
            this.x += this.velX;
            this.resolveTileCollisionX(tiles);
        } else {
            this.x += this.velX;
            this.resolveTileCollisionX(tiles);
            if (this.color === 'red' && this.onGround && this.isOnEdge(tiles)) {
                this.velX = -this.velX;
                this.x += this.velX * 2;
            }
        }

        this.velY += CONFIG.GRAVITY;
        if (this.velY > CONFIG.MAX_FALL_SPEED) this.velY = CONFIG.MAX_FALL_SPEED;
        this.y += this.velY;
        this.resolveTileCollisionY(tiles);

        this.facingRight = this.velX > 0;

        if (this.y > 15 * CONFIG.TILE_SIZE + 64) return false;
        return true;
    }

    squish() {
        if (this.hasWings) {
            this.hasWings = false;
            this.velX = -1.2;
            this.velY = 0;
            this.flyTimer = 0;
            return 'wings';
        }
        if (!this.isShell) {
            this.isShell = true;
            this.shellMoving = false;
            this.shellTimer = 0;
            this.height = 24;
            this.velX = 0;
            return 'shell';
        }
        if (!this.shellMoving) {
            return 'shell';
        }
        this.shellMoving = false;
        this.velX = 0;
        this.shellTimer = 0;
        return 'shell';
    }

    kick(fromLeft) {
        this.shellMoving = true;
        this.shellTimer = 0;
        this.velX = fromLeft ? this.shellSpeed : -this.shellSpeed;
    }

    isOnEdge(tiles) {
        const checkX = this.velX > 0 ? this.x + this.width + 2 : this.x - 2;
        const checkY = this.y + this.height + 4;
        for (const tile of tiles) {
            if (isSolidTile(tile.type) &&
                checkX >= tile.x && checkX < tile.x + tile.width &&
                checkY >= tile.y && checkY < tile.y + tile.height) {
                return false;
            }
        }
        return true;
    }

    resolveTileCollisionX(tiles) {
        const bounds = this.getBounds();
        for (const tile of tiles) {
            if (!isSolidTile(tile.type)) continue;
            if (this.collides(bounds, tile)) {
                if (this.velX > 0) {
                    this.x = tile.x - this.width;
                } else if (this.velX < 0) {
                    this.x = tile.x + tile.width;
                }
                this.velX = -this.velX;
                bounds.x = this.x;
            }
        }
    }

    resolveTileCollisionY(tiles) {
        const bounds = this.getBounds();
        this.onGround = false;
        for (const tile of tiles) {
            if (!isSolidTile(tile.type)) continue;
            if (this.collides(bounds, tile)) {
                if (this.velY > 0) {
                    this.y = tile.y - this.height;
                    this.onGround = true;
                } else if (this.velY < 0) {
                    this.y = tile.y + tile.height;
                }
                this.velY = 0;
                bounds.y = this.y;
            }
        }
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    collides(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }
}
