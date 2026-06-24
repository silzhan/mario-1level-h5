class Goomba {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.velX = -1.5;
        this.velY = 0;
        this.alive = true;
        this.squished = false;
        this.squishTimer = 0;
    }

    update(tiles) {
        if (!this.alive) {
            if (this.squished) {
                this.squishTimer++;
                return this.squishTimer > 30;
            }
            return false;
        }

        this.onGround = false;

        this.velY += CONFIG.GRAVITY;
        if (this.velY > CONFIG.MAX_FALL_SPEED) this.velY = CONFIG.MAX_FALL_SPEED;

        this.x += this.velX;
        this.resolveTileCollisionX(tiles);

        this.y += this.velY;
        this.resolveTileCollisionY(tiles);

        return true;
    }

    resolveTileCollisionX(tiles) {
        for (const tile of tiles) {
            if (!this.isSolid(tile.type)) continue;
            if (this.collides(this.getBounds(), tile)) {
                if (this.velX > 0) {
                    this.x = tile.x - this.width;
                } else if (this.velX < 0) {
                    this.x = tile.x + tile.width;
                }
                this.velX = -this.velX;
            }
        }
    }

    resolveTileCollisionY(tiles) {
        const bounds = this.getBounds();
        for (const tile of tiles) {
            if (!this.isSolid(tile.type)) continue;
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

    isSolid(tileType) {
        return [1, 2, 3, 4, 5, 6, 7, 8, 10].includes(tileType);
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

    squish() {
        this.squished = true;
        this.alive = false;
        this.velX = 0;
    }
}
