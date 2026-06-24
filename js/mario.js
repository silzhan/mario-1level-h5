class Mario {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 28;
        this.height = 30;
        this.hitboxWidth = 16;
        this.velX = 0;
        this.velY = 0;
        this.onGround = false;
        this.facingRight = true;
        this.alive = true;
        this.score = 0;
        this.coins = 0;
        this.isBig = false;
        this.jumpWasPressed = false;
        this.wasOnGround = true;
        this.isJumping = false;
        this.jumpKeyReleased = true;
        this.hitTile = null;
    }

    update(keys, tiles) {
        if (!this.alive) {
            this.velY += CONFIG.GRAVITY * 0.6;
            if (this.velY > CONFIG.MAX_FALL_SPEED) this.velY = CONFIG.MAX_FALL_SPEED;
            this.y += this.velY;
            return;
        }

        this.hitTile = null;

        if (!keys.jump && this.jumpWasPressed) {
            this.jumpWasPressed = false;
        }

        if (keys.left) {
            this.velX = -CONFIG.PLAYER_SPEED;
            this.facingRight = false;
        } else if (keys.right) {
            this.velX = CONFIG.PLAYER_SPEED;
            this.facingRight = true;
        } else {
            this.velX *= CONFIG.FRICTION;
            if (Math.abs(this.velX) < 0.1) this.velX = 0;
        }

        const justPressed = keys.jump && !this.jumpWasPressed;

        if (justPressed && this.onGround) {
            this.velY = CONFIG.JUMP_FORCE;
            this.onGround = false;
            this.jumpWasPressed = true;
        }

        if (!justPressed) {
            this.jumpWasPressed = keys.jump;
        }

        this.onGround = false;

        this.velY += CONFIG.GRAVITY;
        if (this.velY > CONFIG.MAX_FALL_SPEED) this.velY = CONFIG.MAX_FALL_SPEED;

        this.x += this.velX;
        this.resolveTileCollisionX(tiles);

        this.y += this.velY;
        this.resolveTileCollisionY(tiles);

        let postCheckFired = false;
        if (this.isJumping && this.onGround && keys.jump && this.jumpKeyReleased) {
            this.velY = CONFIG.JUMP_FORCE;
            this.onGround = false;
            this.jumpWasPressed = true;
            this.jumpKeyReleased = false;
            this.isJumping = false;
            postCheckFired = true;
        }

        this.wasOnGround = this.onGround;
        if (!postCheckFired) {
            if (this.onGround && this.velY <= 0) {
                this.isJumping = false;
            } else if (!this.onGround) {
                this.isJumping = true;
            }
        }

        if (this.x < 0) this.x = 0;
    }

    resolveTileCollisionX(tiles) {
        for (const tile of tiles) {
            if (!this.isSolid(tile.type)) continue;
            const bounds = this.getBounds();
            if (!this.collides(bounds, tile)) continue;

            const hw = (this.width + this.hitboxWidth) / 2;
            const feetY = this.y + this.height;
            const stepHeight = feetY - tile.y;
            const hOverlap = bounds.x < tile.x + tile.width && bounds.x + bounds.width > tile.x;
            const canStepUp = hOverlap && stepHeight >= 0 && stepHeight <= 2 && this.velY >= 0;

            if (canStepUp) {
                this.y = tile.y - this.height;
                this.velY = 0;
                this.onGround = true;
            } else {
                if (this.velX > 0) {
                    this.x = tile.x - hw;
                } else if (this.velX < 0) {
                    this.x = tile.x + tile.width - (this.width - hw);
                }
                this.velX = 0;
            }
        }
    }

    resolveTileCollisionY(tiles) {
        const bounds = this.getBounds();
        for (const tile of tiles) {
            if (!this.isSolid(tile.type)) continue;

            const feetY = this.y + this.height;
            const prevFeetY = feetY - this.velY;
            const hOverlap = bounds.x < tile.x + tile.width && bounds.x + bounds.width > tile.x;

            // Landing: feet crossed into or onto tile surface from above
            if (hOverlap && this.velY >= 0 && prevFeetY <= tile.y + 1 && feetY >= tile.y) {
                this.y = tile.y - this.height;
                this.velY = 0;
                this.onGround = true;
                continue;
            }

            if (this.collides(bounds, tile)) {
                if (this.velY > 0) {
                    this.y = tile.y - this.height;
                    this.velY = 0;
                    this.onGround = true;
                } else if (this.velY < 0) {
                    if (bounds.y <= tile.y + tile.height + 2) {
                        this.y = tile.y + tile.height;
                    }
                    this.velY = 0;
                    if (tile.type === 3) {
                        this.hitTile = tile;
                    }
                }
            }
        }
    }

    isSolid(tileType) {
        return [1, 2, 3, 4, 5, 6, 7, 8, 10].includes(tileType);
    }

    collides(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    getBounds() {
        const hw = this.hitboxWidth / 2;
        const cx = this.x + this.width / 2;
        return {
            x: cx - hw,
            y: this.y,
            width: this.hitboxWidth,
            height: this.height
        };
    }
}
