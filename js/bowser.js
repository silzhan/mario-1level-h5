class Bowser {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 64;
        this.height = 64;
        this.velX = -1.2; // starts walking left
        this.velY = 0;
        this.alive = true;
        this.animTimer = 0;
        this.facingRight = false;
        this.onGround = true;
        this.jumpTimer = 0;
        this.jumpInterval = 150; // ~2.5 sec
        this.fireTimer = 0;
        this.fireInterval = 180; // ~3 sec
        this.fireballs = [];
        this.type = 'bowser';
        this.walkRange = { min: 0, max: 0 }; // set by game.js based on bridge
        this.falling = false;
    }

    setBridgeRange(minX, maxX) {
        this.walkRange.min = minX;
        this.walkRange.max = maxX - this.width;
    }

    update(tiles) {
        if (!this.alive) return false;
        this.animTimer++;

        if (this.falling) {
            this.velY += CONFIG.GRAVITY;
            this.y += this.velY;
            return this.y < 20 * CONFIG.TILE_SIZE; // gone when off screen
        }

        // Gravity
        this.velY += CONFIG.GRAVITY;
        if (this.velY > CONFIG.MAX_FALL_SPEED) this.velY = CONFIG.MAX_FALL_SPEED;

        // Horizontal movement
        this.x += this.velX;
        this.facingRight = this.velX > 0;

        // Bounce off bridge edges
        if (this.x <= this.walkRange.min) {
            this.x = this.walkRange.min;
            this.velX = Math.abs(this.velX);
        } else if (this.x >= this.walkRange.max) {
            this.x = this.walkRange.max;
            this.velX = -Math.abs(this.velX);
        }

        // Jumping
        this.jumpTimer++;
        if (this.jumpTimer >= this.jumpInterval && this.onGround) {
            this.velY = -10;
            this.onGround = false;
            this.jumpTimer = 0;
            this.jumpInterval = 120 + Math.floor(Math.random() * 60);
        }

        // Vertical movement + ground check
        this.y += this.velY;
        this.onGround = false;
        for (const tile of tiles) {
            if (!isSolidTile(tile.type)) continue;
            const bounds = this.getBounds();
            if (this.collides(bounds, tile)) {
                if (this.velY > 0) {
                    this.y = tile.y - this.height;
                    this.velY = 0;
                    this.onGround = true;
                }
            }
        }

        // Fire breathing
        this.fireTimer++;
        if (this.fireTimer >= this.fireInterval) {
            this.fireTimer = 0;
            this.fireInterval = 150 + Math.floor(Math.random() * 60);
            const fbX = this.facingRight ? this.x + this.width : this.x - 16;
            const fbY = this.y + this.height / 2 - 6;
            this.fireballs.push(new BowserFireball(fbX, fbY, this.facingRight));
        }

        // Update fireballs
        this.fireballs = this.fireballs.filter(fb => fb.update(tiles));

        return true;
    }

    getBounds() {
        return { x: this.x + 4, y: this.y + 4, width: this.width - 8, height: this.height - 4 };
    }

    collides(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    startFalling() {
        this.falling = true;
        this.velX = 0;
        this.velY = 0;
    }
}

class BowserFireball {
    constructor(x, y, facingRight) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 12;
        this.velX = facingRight ? 4 : -4;
        this.velY = 0;
        this.alive = true;
        this.animTimer = 0;
    }

    update(tiles) {
        if (!this.alive) return false;
        this.animTimer++;
        this.x += this.velX;

        // Check tile collisions
        for (const tile of tiles) {
            if (!isSolidTile(tile.type)) continue;
            if (this.collides(this.getBounds(), tile)) {
                this.alive = false;
                return false;
            }
        }

        // Off screen
        if (this.x < -50 || this.x > 10000) {
            this.alive = false;
            return false;
        }

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
