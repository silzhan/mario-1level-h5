class FireBar {
    constructor(centerX, centerY, numBalls, radius, speed, clockwise) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.numBalls = numBalls || 5;
        this.radius = radius || (this.numBalls * 20); // spacing between balls
        this.speed = speed || 0.03; // radians per frame
        this.clockwise = clockwise !== false;
        this.angle = 0;
        this.alive = true;
        this.animTimer = 0;
        this.ballSize = 14;
    }

    update() {
        if (!this.alive) return false;
        this.animTimer++;
        this.angle += this.clockwise ? this.speed : -this.speed;
        return true;
    }

    getBallBounds(index) {
        const ballAngle = this.angle + (index * (Math.PI / (this.numBalls > 1 ? this.numBalls - 1 : 1)));
        const bx = this.centerX + Math.cos(ballAngle) * this.radius;
        const by = this.centerY + Math.sin(ballAngle) * this.radius;
        return {
            x: bx - this.ballSize / 2,
            y: by - this.ballSize / 2,
            width: this.ballSize,
            height: this.ballSize
        };
    }

    getCenterX() { return this.centerX; }
    getCenterY() { return this.centerY; }
}
