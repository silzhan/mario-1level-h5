class Fireball {
    constructor(x, y, facingRight) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.velX = facingRight ? 6 : -6;
        this.velY = 0;
        this.alive = true;
        this.bounceCount = 0;
        this.animTimer = 0;
    }

    update(tiles) {
        if (!this.alive) return false;

        this.animTimer++;
        this.velY += CONFIG.GRAVITY;
        if (this.velY > CONFIG.MAX_FALL_SPEED) this.velY = CONFIG.MAX_FALL_SPEED;

        this.x += this.velX;
        this.y += this.velY;

        for (const tile of tiles) {
            if (!isSolidTile(tile.type)) continue;
            if (this.collides(this.getBounds(), tile)) {
                if (this.velY > 0 && this.y + this.height > tile.y && this.y < tile.y) {
                    this.y = tile.y - this.height;
                    this.velY = -6;
                    this.bounceCount++;
                    if (this.bounceCount > 4) {
                        this.alive = false;
                        return false;
                    }
                } else if (this.velX > 0) {
                    this.alive = false;
                    return false;
                } else if (this.velX < 0) {
                    this.alive = false;
                    return false;
                }
            }
        }

        if (this.y > 15 * CONFIG.TILE_SIZE + 32) return false;
        if (this.x < -32 || this.x > 10000) return false;
        return true;
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
