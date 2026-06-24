class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = new GameState();
        this.renderer = new Renderer(this.ctx);

        this.scoreElement = document.getElementById('score');
        this.coinsElement = document.getElementById('coins');
        this.worldElement = document.getElementById('world');
        this.overlay = document.getElementById('overlay');
        this.overlayText = document.getElementById('overlayText');
        this.subText = document.getElementById('subText');

        this.input = new InputHandler(this.canvas);

        this.cameraX = 0;
        this.levelWidth = 210 * CONFIG.TILE_SIZE;

        this.titleScreen = document.getElementById('titleScreen');
        this.started = false;

        this.init();
    }

    async init() {
        await this.renderer.loadSprites();

        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.addEventListener('keydown', (e) => {
            if (!this.started && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                this.startGame();
            }
        });

        this.renderer.clear();
    }

    startGame() {
        if (this.started) return;
        this.started = true;
        this.titleScreen.style.display = 'none';
        this.reset();
        this.gameLoop();
    }

    reset() {
        this.state.state = this.state.PLAYING;
        this.overlay.style.display = 'none';

        this.player = new Mario(3 * CONFIG.TILE_SIZE, 11 * CONFIG.TILE_SIZE);
        this.input.setPlayer(this.player);
        this.input.setResetCallback(() => this.reset());

        this.enemies = [];
        this.coins = [];

        this.buildLevel();
        this.spawnEnemies();
        this.spawnCoins();

        this.cameraX = 0;
        this.updateWorldDisplay();
    }

    nextLevel() {
        if (this.state.currentLevel >= this.state.totalLevels) {
            this.showOverlay('YOU WIN!', `Final Score: ${this.player.score}`);
            return;
        }

        this.state.currentLevel++;
        this.state.state = this.state.LEVEL_TRANSITION;
        this.showOverlay(
            `WORLD 1-${this.state.currentLevel}`,
            'Get Ready!'
        );

        setTimeout(() => {
            this.hideOverlay();
            this.reset();
        }, 2000);
    }

    resetToLevel1() {
        this.state.currentLevel = 1;
        this.reset();
    }

    buildLevel() {
        this.tiles = [];
        this.levelMap = generateLevelMap(this.state.currentLevel);
        this.levelWidth = this.levelMap[0].length * CONFIG.TILE_SIZE;
        this.renderer.setLevel(this.state.currentLevel);

        for (let row = 0; row < this.levelMap.length; row++) {
            for (let col = 0; col < this.levelMap[row].length; col++) {
                const tile = this.levelMap[row][col];
                if (tile !== 0) {
                    this.tiles.push({
                        x: col * CONFIG.TILE_SIZE,
                        y: row * CONFIG.TILE_SIZE,
                        width: CONFIG.TILE_SIZE,
                        height: CONFIG.TILE_SIZE,
                        type: tile
                    });
                }
            }
        }
    }

    updateWorldDisplay() {
        if (this.worldElement) {
            this.worldElement.textContent = `WORLD 1-${this.state.currentLevel}`;
        }
    }

    spawnEnemies() {
        const level = this.state.currentLevel;
        let enemyPositions;

        if (level === 2) {
            // Level 2: More enemies, spread across longer level
            enemyPositions = [
                15, 18, 19, 30, 31, 33, 40, 41,
                52, 53, 55, 60, 61, 63, 65,
                78, 79, 82, 83, 88, 89,
                100, 101, 105, 106,
                115, 116, 120, 121,
                130, 131, 135, 136,
                145, 146, 150, 151,
                160, 165, 166,
                175, 176, 180, 185, 186
            ];
        } else {
            enemyPositions = [22, 35, 36, 50, 58, 59, 70, 78, 80, 95, 96, 108, 109, 125, 126, 135, 148];
        }

        enemyPositions.forEach(col => {
            this.enemies.push(new Goomba(col * CONFIG.TILE_SIZE, 11 * CONFIG.TILE_SIZE));
        });
    }

    spawnCoins() {
    }

    collides(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    updateCamera() {
        const targetX = this.player.x - CONFIG.SCREEN_WIDTH / 3;
        this.cameraX += (targetX - this.cameraX) * 0.1;
        if (this.cameraX < 0) this.cameraX = 0;
        if (this.cameraX > this.levelWidth - CONFIG.SCREEN_WIDTH) {
            this.cameraX = this.levelWidth - CONFIG.SCREEN_WIDTH;
        }
    }

    update() {
        if (this.state.state === this.state.LEVEL_TRANSITION) {
            this.updateCamera();
            return;
        }

        if (this.state.state === this.state.DEAD) {
            this.player.update(this.input.keys, this.tiles);
            if (this.player.y > this.levelMap.length * CONFIG.TILE_SIZE + 100) {
                this.state.state = -1;
                this.showOverlay('GAME OVER', `Score: ${this.player.score}`);
            }
            return;
        }

        if (this.state.state === this.state.FLAGPOLE) {
            const fa = this.flagAnim;
            fa.timer++;
            if (fa.phase === 'slide') {
                this.player.y += 3;
                const slideRange = fa.flagEndY - 4 * CONFIG.TILE_SIZE;
                const groundRange = fa.groundY - (4 * CONFIG.TILE_SIZE);
                const progress = Math.min(1, (this.player.y - 4 * CONFIG.TILE_SIZE) / groundRange);
                fa.flagCurrentY = 4 * CONFIG.TILE_SIZE + slideRange * progress;
                if (this.player.y >= fa.groundY) {
                    this.player.y = fa.groundY;
                    this.player.onGround = true;
                    fa.phase = 'walk';
                    fa.timer = 0;
                }
            } else if (fa.phase === 'walk') {
                this.player.x += 2;
                this.player.facingRight = true;
                if (this.player.x >= fa.castleX) {
                    fa.phase = 'done';
                    this.state.state = this.state.WIN;
                    this.nextLevel();
                }
            }
            this.updateCamera();
            this.scoreElement.textContent = this.player.score;
            this.coinsElement.textContent = this.player.coins;
            return;
        }

        if (this.state.state !== this.state.PLAYING) return;

        this.player.update(this.input.keys, this.tiles);
        this.updateCamera();

        // Process question block hit
        if (this.player.hitTile) {
            const tile = this.player.hitTile;
            tile.type = 8;
            const row = Math.floor(tile.y / CONFIG.TILE_SIZE);
            const col = Math.floor(tile.x / CONFIG.TILE_SIZE);
            this.levelMap[row][col] = 8;
            this.coins.push(new Coin(tile.x + 4, tile.y - 30, true));
            this.player.coins++;
            this.player.score += 200;
        }

        this.enemies = this.enemies.filter(enemy => enemy.update(this.tiles));

        this.coins.forEach(coin => coin.update());
        this.coins = this.coins.filter(coin => !coin.collected || coin.isPopCoin);

        const playerBounds = this.player.getBounds();
        this.coins.forEach(coin => {
            if (!coin.collected && !coin.isPopCoin && this.collides(playerBounds, coin.getBounds())) {
                coin.collected = true;
                this.player.coins++;
                this.player.score += 100;
            }
        });

        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;

            const enemyBounds = {
                x: enemy.x,
                y: enemy.y,
                width: enemy.width,
                height: enemy.height
            };

            if (this.collides(playerBounds, enemyBounds)) {
                if (this.player.velY > 0 && playerBounds.y + playerBounds.height < enemyBounds.y + enemyBounds.height / 2 + 5) {
                    enemy.squish();
                    this.player.velY = -8;
                    this.player.score += 200;
                } else {
                    this.player.alive = false;
                    this.player.velY = -10;
                    this.state.state = this.state.DEAD;
                }
            }
        });

        if (this.player.y > this.levelMap.length * CONFIG.TILE_SIZE) {
            if (this.player.alive) {
                this.player.alive = false;
                this.player.velY = -10;
            }
            this.state.state = this.state.DEAD;
        }

        // Flagpole collision
        if (this.state.state === this.state.PLAYING) {
            const pb = this.player.getBounds();
            for (const tile of this.tiles) {
                if (tile.type === 9 && this.collides(pb, tile)) {
                    const T = CONFIG.TILE_SIZE;
                    const flagCol = Math.floor(tile.x / T);
                    const heightBonus = Math.max(0, Math.floor((12 * T - this.player.y) / T) * 100);
                    this.player.score += heightBonus + 1000;
                    this.player.velX = 0;
                    this.player.velY = 0;
                    this.player.x = flagCol * T + 2;
                    this.player.facingRight = true;
                    this.flagAnim = {
                        phase: 'slide',
                        timer: 0,
                        flagCurrentY: 4 * T,
                        flagEndY: 11 * T,
                        groundY: 12 * T - this.player.height,
                        castleX: (flagCol + 5) * T,
                        heightBonus: heightBonus
                    };
                    this.state.state = this.state.FLAGPOLE;
                    break;
                }
            }
        }

        this.scoreElement.textContent = this.player.score;
        this.coinsElement.textContent = this.player.coins;
    }

    draw() {
        this.renderer.clear();
        const flagY = this.flagAnim ? this.flagAnim.flagCurrentY : 4 * CONFIG.TILE_SIZE;
        this.renderer.drawTiles(this.levelMap, this.cameraX, flagY);
        this.coins.forEach(coin => this.renderer.drawCoin(coin, this.cameraX));
        this.enemies.forEach(enemy => this.renderer.drawGoomba(enemy, this.cameraX));
        this.renderer.drawMario(this.player, this.cameraX);
    }

    showOverlay(text, subText) {
        this.overlayText.textContent = text;
        this.subText.textContent = subText;
        this.overlay.style.display = 'flex';
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
    console.log('Super Mario World 1-1 - HTML5 Edition Loaded!');
    console.log('Use arrow keys or WASD to move, SPACE to jump');
});
