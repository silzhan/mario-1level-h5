class PipeSystem {
    constructor() {
        this.connections = [];
        this.state = 'idle';
        this.activeConnection = null;
        this.timer = 0;
        this.startY = 0;
        this.travelTime = 30;
    }

    setup(level) {
        this.state = 'idle';
        this.connections = [];
        if (level === 2) {
            this.connections = [
                { entryCol: 18, entryRow: 9, exitCol: 47, exitRow: 9 },
                { entryCol: 59, entryRow: 8, exitCol: 80, exitRow: 7 },
                { entryCol: 124, entryRow: 9, exitCol: 153, exitRow: 9 },
                { entryCol: 142, entryRow: 8, exitCol: 187, exitRow: 9 }
            ];
        } else if (level === 4) {
            this.connections = [
                { entryCol: 140, entryRow: 10, exitCol: 150, exitRow: 11 }
            ];
        }
    }

    checkEntry(player, keys) {
        if (this.state !== 'idle') return;
        if (!keys.down || !player.onGround) return;

        for (const conn of this.connections) {
            const pipeTopX = conn.entryCol * CONFIG.TILE_SIZE;
            const pipeTopY = conn.entryRow * CONFIG.TILE_SIZE;
            const playerRight = player.x + player.width;
            const pipeRight = pipeTopX + CONFIG.TILE_SIZE * 2;

            if (playerRight > pipeTopX + 4 && player.x < pipeRight - 4 &&
                Math.abs((player.y + player.height) - pipeTopY) < 4) {
                this.enterPipe(player, conn);
                return;
            }
        }
    }

    enterPipe(player, conn) {
        this.state = 'entering';
        this.activeConnection = conn;
        this.timer = 0;
        this.startY = player.y;
        player.velX = 0;
        player.velY = 0;
        player.x = conn.entryCol * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE - player.width / 2;
        if (window.music) music.pipeEnter();
    }

    update(player) {
        if (this.state === 'idle') return;

        this.timer++;
        const T = CONFIG.TILE_SIZE;

        if (this.state === 'entering') {
            player.y += 2;
            player.velX = 0;
            player.velY = 0;

            if (this.timer >= this.travelTime) {
                this.state = 'teleporting';
                this.timer = 0;
            }
        } else if (this.state === 'teleporting') {
            const conn = this.activeConnection;
            player.x = conn.exitCol * T + T - player.width / 2;
            player.y = (conn.exitRow + 1) * T - player.height;
            this.state = 'exiting';
        } else if (this.state === 'exiting') {
            const conn = this.activeConnection;
            const targetY = (conn.exitRow - 1) * T;
            const startY = (conn.exitRow + 1) * T - player.height;
            const progress = this.timer / this.travelTime;

            player.y = startY + (targetY - startY) * Math.min(1, progress);
            player.velX = 0;
            player.velY = 0;

            if (this.timer >= this.travelTime) {
                player.y = targetY;
                player.onGround = true;
                this.state = 'idle';
                this.activeConnection = null;
                if (window.music) music.pipeExit();
            }
        }
    }

    isActive() {
        return this.state !== 'idle';
    }
}
