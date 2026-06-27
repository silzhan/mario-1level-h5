class MovingPlatform {
    constructor(x, y, widthTiles, moveType, params) {
        this.width = widthTiles * CONFIG.TILE_SIZE;
        this.height = 12;
        this.moveType = moveType;
        this.speed = params.speed || 1;
        this.direction = 1;
        this.prevX = x;
        this.prevY = y;
        this.x = x;
        this.y = y;

        if (moveType === 'diagonal') {
            this.startX = params.startX;
            this.startY = params.startY;
            this.endX = params.endX;
            this.endY = params.endY;
            const dx = this.endX - this.startX;
            const dy = this.endY - this.startY;
            this.totalDist = Math.sqrt(dx * dx + dy * dy);
            this.progress = 0;
            this.x = this.startX;
            this.y = this.startY;
        } else {
            this.minX = params.minX !== undefined ? params.minX : x;
            this.maxX = params.maxX !== undefined ? params.maxX : x;
            this.minY = params.minY !== undefined ? params.minY : y;
            this.maxY = params.maxY !== undefined ? params.maxY : y;
        }
    }

    update() {
        this.prevX = this.x;
        this.prevY = this.y;

        if (this.moveType === 'diagonal') {
            this.progress += (this.speed / this.totalDist) * this.direction;
            if (this.progress >= 1) { this.progress = 1; this.direction = -1; }
            if (this.progress <= 0) { this.progress = 0; this.direction = 1; }
            this.x = this.startX + (this.endX - this.startX) * this.progress;
            this.y = this.startY + (this.endY - this.startY) * this.progress;
            return;
        }

        if (this.moveType === 'horizontal') {
            this.x += this.speed * this.direction;
            if (this.x >= this.maxX) { this.x = this.maxX; this.direction = -1; }
            if (this.x <= this.minX) { this.x = this.minX; this.direction = 1; }
        } else {
            this.y += this.speed * this.direction;
            if (this.y >= this.maxY) { this.y = this.maxY; this.direction = -1; }
            if (this.y <= this.minY) { this.y = this.minY; this.direction = 1; }
        }
    }

    getDeltaX() { return this.x - this.prevX; }
    getDeltaY() { return this.y - this.prevY; }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    isPlayerOnTop(player) {
        const pb = player.getBounds();
        const platTop = this.y;
        const playerBottom = pb.y + pb.height;
        return pb.x + pb.width > this.x + 2 &&
               pb.x < this.x + this.width - 2 &&
               playerBottom >= platTop - 4 &&
               playerBottom <= platTop + 6 &&
               player.velY >= 0;
    }
}
