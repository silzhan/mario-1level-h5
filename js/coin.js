class Coin {
    constructor(x, y, isPopCoin = false) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 30;
        this.collected = false;
        this.animFrame = 0;
        this.animTimer = 0;
        this.bobOffset = 0;

        this.isPopCoin = isPopCoin;
        this.popVelY = 0;
        this.popLife = 0;
        this.popMaxLife = 45;
        if (isPopCoin) {
            this.popVelY = -8;
        }
    }

    update() {
        if (this.isPopCoin) {
            this.popVelY += 0.3;
            this.y += this.popVelY;
            this.popLife++;
            if (this.popLife >= this.popMaxLife) {
                this.collected = true;
                this.isPopCoin = false;
            }
            this.animTimer++;
            if (this.animTimer > 4) {
                this.animTimer = 0;
                this.animFrame = (this.animFrame + 1) % 4;
            }
            return;
        }

        if (this.collected) return;

        this.animTimer++;
        if (this.animTimer > 8) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }

        this.bobOffset = Math.sin(Date.now() * 0.003) * 3;
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}
