class Podoboo {
    constructor(x, lavaY, maxHeight) {
        this.x = x;
        this.lavaY = lavaY;
        this.startY = lavaY;
        this.y = lavaY;
        this.width = 24;
        this.height = 24;
        this.velY = 0;
        this.alive = true;
        this.animTimer = 0;
        this.cooldown = 0;
        this.cooldownMax = 90 + Math.floor(Math.random() * 30); // 1.5-2 sec at 60fps
        this.launchSpeed = -7;
        this.maxHeight = maxHeight || (lavaY - 160); // how high it goes above lava
        this.state = 'waiting'; // waiting, rising, falling, sinking
        this.sinkTimer = 0;
    }

    update() {
        if (!this.alive) return false;
        this.animTimer++;

        switch (this.state) {
            case 'waiting':
                this.cooldown--;
                if (this.cooldown <= 0) {
                    this.state = 'rising';
                    this.velY = this.launchSpeed;
                    this.y = this.startY - this.height;
                    if (window.music && typeof music.podobooLaunch === 'function') {
                        music.podobooLaunch();
                    }
                }
                break;

            case 'rising':
                this.velY += 0.15; // gravity (lighter than normal for higher arc)
                this.y += this.velY;
                if (this.velY >= 0) {
                    this.state = 'falling';
                }
                break;

            case 'falling':
                this.velY += 0.2;
                this.y += this.velY;
                if (this.y >= this.startY - this.height) {
                    this.y = this.startY - this.height;
                    this.state = 'sinking';
                    this.sinkTimer = 20;
                }
                break;

            case 'sinking':
                this.sinkTimer--;
                if (this.sinkTimer <= 0) {
                    this.state = 'waiting';
                    this.cooldown = this.cooldownMax;
                }
                break;
        }

        return true;
    }

    getBounds() {
        if (this.state === 'waiting' || this.state === 'sinking') {
            // partially hidden in lava, smaller hitbox
            const visibleRatio = this.state === 'sinking' ? this.sinkTimer / 20 : 0;
            return {
                x: this.x + 4,
                y: this.y + this.height * (1 - visibleRatio) * 0.5,
                width: this.width - 8,
                height: this.height * visibleRatio * 0.5
            };
        }
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}
