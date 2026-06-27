class HammerBro {
    constructor(x, y) {
        this.type = 'hammerbro';
        this.x = x;
        this.y = y;
        this.width = 28;
        this.height = 44;
        this.velX = 0;
        this.velY = 0;
        this.alive = true;
        this.onGround = false;
        this.facingRight = false;
        this.throwTimer = 0;
        this.throwInterval = 90 + Math.floor(Math.random() * 40);
        this.jumpTimer = 0;
        this.jumpInterval = 100 + Math.floor(Math.random() * 80);
        this.animTimer = 0;
        this.pendingHammer = null;
    }

    update(tiles) {
        if (!this.alive) return false;
        this.animTimer++;

        this.velY += CONFIG.GRAVITY;
        if (this.velY > CONFIG.MAX_FALL_SPEED) this.velY = CONFIG.MAX_FALL_SPEED;
        this.y += this.velY;
        this.resolveTileCollisionY(tiles);

        if (this.onGround) {
            this.jumpTimer++;
            if (this.jumpTimer >= this.jumpInterval) {
                this.velY = -7;
                this.onGround = false;
                this.jumpTimer = 0;
                this.jumpInterval = 100 + Math.floor(Math.random() * 80);
            }
        }

        this.throwTimer++;
        if (this.throwTimer >= this.throwInterval) {
            this.throwTimer = 0;
            this.throwInterval = 90 + Math.floor(Math.random() * 40);
            const dir = this.facingRight ? 1 : -1;
            this.pendingHammer = new Hammer(
                this.x + (this.facingRight ? this.width : -12),
                this.y - 8,
                dir
            );
        }

        if (this.y > 15 * CONFIG.TILE_SIZE + 64) return false;
        return true;
    }

    setFacing(playerX) {
        this.facingRight = playerX > this.x;
    }

    squish() {
        this.alive = false;
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

class Hammer {
    constructor(x, y, dirX) {
        this.x = x;
        this.y = y;
        this.width = 14;
        this.height = 14;
        this.velX = dirX * 3.5;
        this.velY = -7;
        this.alive = true;
        this.animTimer = 0;
        this.lifetime = 0;
    }

    update() {
        if (!this.alive) return false;
        this.velY += CONFIG.GRAVITY * 0.7;
        this.x += this.velX;
        this.y += this.velY;
        this.animTimer++;
        this.lifetime++;
        if (this.y > 15 * CONFIG.TILE_SIZE + 32) this.alive = false;
        if (this.lifetime > 180) this.alive = false;
        return this.alive;
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}
