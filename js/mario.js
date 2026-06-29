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
        this.isDucking = false;
        this.isInvincible = false;
        this.invincibleTimer = 0;
        this.isFire = false;
        this.isStar = false;
        this.starTimer = 0;
        this.fireballCooldown = 0;
        this.prevY = y;  // 上一帧Y位置（用于踩踏判断）
        this.jumpWasPressed = false;
        this.wasOnGround = true;
        this.isJumping = false;
        this.jumpKeyReleased = true;
        this.hitTile = null;
    }

    becomeBig() {
        if (this.isBig) return;
        this.isBig = true;
        this.prevHeight = this.height; // 保存旧高度
        this.y -= 15; // 上移 15px，脚保持在地面
        this.height = 45;
        this.isInvincible = true;
        this.invincibleTimer = 60;
    }

    shrink() {
        if (!this.isBig) return;
        this.isBig = false;
        this.isDucking = false;
        this.isFire = false;
        this.height = 30;
        this.y += 15;
        this.isInvincible = true;
        this.invincibleTimer = 120;
    }

    becomeFire() {
        if (!this.isBig) {
            this.becomeBig();
        }
        this.isFire = true;
    }

    becomeStar() {
        this.isStar = true;
        this.starTimer = 600;
    }

    update(keys, tiles) {
        if (!this.alive) {
            this.velY += CONFIG.GRAVITY * 0.6;
            if (this.velY > CONFIG.MAX_FALL_SPEED) this.velY = CONFIG.MAX_FALL_SPEED;
            this.y += this.velY;
            return;
        }

        this.hitTile = null;
        this.prevY = this.y;
        this.prevHeight = this.height;

        if (this.isStar) {
            this.starTimer--;
            if (this.starTimer <= 0) {
                this.isStar = false;
            }
        }

        if (this.fireballCooldown > 0) this.fireballCooldown--;

        if (!keys.jump && this.jumpWasPressed) {
            this.jumpWasPressed = false;
            if (this.velY < -4) {
                this.velY = -4;
            }
        }

        // Ducking (big Mario only)
        if (keys.down && this.onGround && this.isBig && !this.isDucking) {
            this.isDucking = true;
            this.height = 30;
            this.y += 15;
        } else if (this.isDucking && (!keys.down || !this.onGround)) {
            this.isDucking = false;
            this.height = 45;
            this.y -= 15;
        }

        if (this.isDucking) {
            this.velX = 0;
        } else if (keys.left) {
            const speed = keys.run ? CONFIG.RUN_SPEED : CONFIG.PLAYER_SPEED;
            this.velX = -speed;
            this.facingRight = false;
        } else if (keys.right) {
            const speed = keys.run ? CONFIG.RUN_SPEED : CONFIG.PLAYER_SPEED;
            this.velX = speed;
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
            if (window.music) music.jump();
        }

        if (!justPressed) {
            this.jumpWasPressed = keys.jump;
        }

        this.onGround = false;

        if (!this.wasOnGround) {
            this.velY += CONFIG.GRAVITY;
            if (this.velY > CONFIG.MAX_FALL_SPEED) this.velY = CONFIG.MAX_FALL_SPEED;
        }

        this.prevX = this.x;
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

        // 保存上一帧位置（供踩踏判断使用）
        this.prevY = this.y - this.velY;
    }

    resolveTileCollisionX(tiles) {
        const offsetX = (this.width - 24) / 2;
        const bounds = {
            x: this.x + offsetX,
            y: this.y,
            width: 24,
            height: this.height
        };
        const prevOffsetX = (this.width - 24) / 2;
        const prevBoundsX = this.prevX + prevOffsetX;

        for (const tile of tiles) {
            if (!this.isSolid(tile.type)) continue;
            if (!this.collides(bounds, tile)) continue;

            // Skip X collision for ceiling tiles: if the previous-frame hitbox
            // already overlapped this tile, Mario entered from below (head-bump
            // scenario) and X collision should not push him sideways.
            const prevHOverlap = prevBoundsX < tile.x + tile.width &&
                                prevBoundsX + 24 > tile.x;
            if (prevHOverlap) continue;

            const feetY = this.y + this.height;
            const stepHeight = feetY - tile.y;

            let canStepUp = stepHeight > 0 && stepHeight <= 6 && this.velY <= 0;
            if (canStepUp) {
                for (const other of tiles) {
                    if (!this.isSolid(other.type)) continue;
                    if (other.x === tile.x && Math.abs(other.y - (tile.y - CONFIG.TILE_SIZE)) < 1) {
                        canStepUp = false;
                        break;
                    }
                }
            }
            if (canStepUp) {
                const newY = tile.y - this.height;
                const checkBounds = { x: bounds.x, y: newY, width: bounds.width, height: this.height };
                for (const other of tiles) {
                    if (!this.isSolid(other.type)) continue;
                    if (this.collides(checkBounds, other)) {
                        canStepUp = false;
                        break;
                    }
                }
            }

            if (canStepUp) {
                this.y = tile.y - this.height;
                this.velY = 0;
                this.onGround = true;
            } else {
                if (this.velX > 0) {
                    this.x = tile.x - this.width;
                } else if (this.velX < 0) {
                    this.x = tile.x + tile.width;
                }
                this.velX = 0;
            }
        }
    }

    resolveTileCollisionY(tiles) {
        // Pre-check: detect standing-on before the main loop.
        // This prevents onGround oscillation when feet are exactly at tile top.
        const bounds = this.getBounds();
        const feetY = this.y + this.height;
        if (this.velY >= 0) {
            for (const tile of tiles) {
                if (!this.isSolid(tile.type)) continue;
                const hOverlap = bounds.x < tile.x + tile.width &&
                                 bounds.x + bounds.width > tile.x;
                if (hOverlap && Math.abs(feetY - tile.y) < 2) {
                    this.onGround = true;
                    break;
                }
            }
        }

        for (const tile of tiles) {
            if (!this.isSolid(tile.type)) continue;

            let tileBounds = this.getBounds();
            const hitBounds = this.collides(tileBounds, tile);
            if (!hitBounds) continue;

            const curFeetY = this.y + this.height;
            const prevFeetY = curFeetY - this.velY;
            const prevTopY = this.y - this.velY;
            const hOverlap = tileBounds.x < tile.x + tile.width && tileBounds.x + tileBounds.width > tile.x;
            const landedFromFall = hOverlap && this.velY > 0 && prevFeetY < tile.y && curFeetY >= tile.y;
            const standingOn = hOverlap && this.velY === 0 && Math.abs(curFeetY - tile.y) < 0.5;
            if (landedFromFall || standingOn) {
                this.y = tile.y - this.height;
                this.velY = 0;
                this.onGround = true;
                continue;
            }

            // Head-bump: Mario rising into a tile from below.
            const feetBelowTileBottom = prevFeetY >= tile.y + tile.height;
            if (this.velY < 0 && prevTopY >= tile.y + tile.height - 2 && feetBelowTileBottom) {
                const prevBoundsX = tileBounds.x - this.velX;
                const wasHOverlap = prevBoundsX < tile.x + tile.width &&
                                    prevBoundsX + tileBounds.width > tile.x;
                if (wasHOverlap) {
                    this.velY = 0;
                    this.onGround = false;
                    if (tile.type === 3 || tile.type === 2 || tile.type === 14 || tile.type === 15) {
                        this.hitTile = tile;
                    }
                    continue;
                }
            }

            if (this.velY > 0) {
                const penetration = curFeetY - tile.y;
                if (penetration <= 4) {
                    // Only land on top if Mario's head is above the tile
                    if (this.y < tile.y) {
                        this.y = tile.y - this.height;
                        this.velY = 0;
                        this.onGround = true;
                    }
                }
            } else if (this.velY === 0 && this.y < tile.y) {
                // Mario on top of tile with zero velocity — confirm landing
                this.y = tile.y - this.height;
                this.onGround = true;
            }
        }
    }

    isSolid(tileType) {
        return isSolidTile(tileType);
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
