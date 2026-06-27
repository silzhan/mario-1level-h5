class Koopa {
    constructor(x, y, color) {
        this.type = 'koopa';
        this.color = color || 'green';
        this.x = x;
        this.y = y;
        this.width = 28;
        this.height = 38;
        this.velX = -1.2;
        this.velY = 0;
        this.alive = true;
        this.facingRight = false;

        this.isShell = false;
        this.shellMoving = false;
        this.shellSpeed = 8;
        this.shellTimer = 0;
        this.animTimer = 0;
    }

    update(tiles) {
        if (!this.alive) return false;

        this.animTimer++;
        this.onGround = false;
        this.velY += CONFIG.GRAVITY;
        if (this.velY > CONFIG.MAX_FALL_SPEED) this.velY = CONFIG.MAX_FALL_SPEED;

        this.x += this.velX;
        this.resolveTileCollisionX(tiles);

        this.y += this.velY;
        this.resolveTileCollisionY(tiles);

        if (this.isShell && !this.shellMoving) {
            this.shellTimer++;
        }

        if (this.color === 'red' && !this.isShell && this.onGround) {
            if (this.isOnEdge(tiles)) {
                this.velX = -this.velX;
                this.facingRight = this.velX > 0;
            }
        }

        if (this.y > 15 * CONFIG.TILE_SIZE + 64) return false;
        return true;
    }

    isOnEdge(tiles) {
        const checkX = this.velX > 0 ? this.x + this.width + 2 : this.x - 2;
        const checkY = this.y + this.height + 4;
        for (const tile of tiles) {
            if (!isSolidTile(tile.type)) continue;
            if (checkX < tile.x + tile.width && checkX + 4 > tile.x &&
                checkY < tile.y + tile.height && checkY + 4 > tile.y) {
                return false;
            }
        }
        return true;
    }

    squish() {
        if (this.isShell) {
            if (this.shellMoving) {
                this.shellMoving = false;
                this.velX = 0;
                this.shellTimer = 0;
            } else {
                this.shellMoving = true;
                this.velX = this.shellSpeed;
                this.shellTimer = 0;
            }
            return 'shell';
        }
        this.isShell = true;
        this.velX = 0;
        this.height = 24;
        this.y += 14;
        this.shellTimer = 0;
        return 'shell';
    }

    kick(fromLeft) {
        this.shellMoving = true;
        this.velX = fromLeft ? this.shellSpeed : -this.shellSpeed;
    }

    resolveTileCollisionX(tiles) {
        for (const tile of tiles) {
            if (!isSolidTile(tile.type)) continue;
            if (this.collides(this.getBounds(), tile)) {
                if (this.velX > 0) {
                    this.x = tile.x - this.width;
                } else if (this.velX < 0) {
                    this.x = tile.x + tile.width;
                }
                if (this.isShell && this.shellMoving) {
                    this.velX = -this.velX;
                } else {
                    this.velX = -this.velX;
                    this.facingRight = this.velX > 0;
                }
            }
        }
    }

    resolveTileCollisionY(tiles) {
        const bounds = this.getBounds();
        for (const tile of tiles) {
            if (!isSolidTile(tile.type)) continue;
            if (this.collides(bounds, tile)) {
                if (this.velY > 0) {
                    this.y = tile.y - this.height;
                    this.velY = 0;
                    this.onGround = true;
                } else if (this.velY < 0) {
                    this.y = tile.y + tile.height;
                    this.velY = 0;
                }
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
