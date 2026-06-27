class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = new GameState();
        this.renderer = new Renderer(this.ctx);

        this.scoreElement = document.getElementById('score');
        this.coinsElement = document.getElementById('coins');
        this.worldElement = document.getElementById('world');
        this.timeElement = document.getElementById('time');
        this.livesElement = document.getElementById('lives');
        this.worldTitle = document.getElementById('worldTitle');
        this.overlay = document.getElementById('overlay');
        this.overlayText = document.getElementById('overlayText');
        this.subText = document.getElementById('subText');

        this.input = new InputHandler(this.canvas);

        this.cameraX = 0;
        this.levelWidth = 210 * CONFIG.TILE_SIZE;

        this.titleScreen = document.getElementById('titleScreen');
        this.started = false;
        this.paused = false;
        this.selectedLevel = 1;

        this.init();
    }

    async init() {
        await this.renderer.loadSprites();

        // Level selection buttons
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectedLevel = parseInt(btn.dataset.level);
                this.updateTitleWorld();
                this.startGame();
            });
        });

        // Also start with START button if it exists (backward compat)
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        document.addEventListener('keydown', (e) => {
            if (!this.started && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                this.startGame();
            }

            // Level selection with number keys on title screen
            if (!this.started) {
                if (e.key === '1') {
                    this.selectedLevel = 1;
                    this.updateTitleWorld();
                    this.startGame();
                } else if (e.key === '2') {
                    this.selectedLevel = 2;
                    this.updateTitleWorld();
                    this.startGame();
                } else if (e.key === '3') {
                    this.selectedLevel = 3;
                    this.updateTitleWorld();
                    this.startGame();
                }
            }

            if (e.key === 'p' || e.key === 'P') {
                if (this.started) this.togglePause();
                e.preventDefault();
            }
        });

        this.renderer.clear();
    }

    updateTitleWorld() {
        if (this.worldTitle) {
            this.worldTitle.textContent = `WORLD 1-${this.selectedLevel}`;
        }
    }

    startGame() {
        if (this.started) return;
        this.started = true;
        this.titleScreen.style.display = 'none';
        this.state.currentLevel = this.selectedLevel;
        this.reset();
        this.gameLoop();
        if (window.music) {
            if (this.state.currentLevel === 2) {
                music.playUnderground();
            } else if (this.state.currentLevel === 3 && typeof music.playAthletic === 'function') {
                music.playAthletic();
            } else {
                music.playOverworld();
            }
        }
    }

    reset() {
        this.state.state = this.state.PLAYING;
        this.paused = false;
        this.overlay.style.display = 'none';

        this.player = new Mario(3 * CONFIG.TILE_SIZE, 11 * CONFIG.TILE_SIZE);
        this.player.isInvincible = true;
        this.player.invincibleTimer = 180;
        this.input.setPlayer(this.player);
        this.input.setResetCallback(() => this.reset());

        this.enemies = [];
        this.coins = [];
        this.mushrooms = [];
        this.fireballs = [];
        this.fireworks = [];
        this.hammers = [];
        this.multiCoinHits = {};
        this.timeLeft = this.state.currentLevel === 3 ? 450 * 60 : 400 * 60;
        if (this.lives === undefined) this.lives = 3;
        this.activatedHiddenBlocks = new Set();
        this.pipeSystem = new PipeSystem();
        this.elevators = [];
        this.piranhaPlants = [];
        this.movingPlatforms = [];
        this.fallingPlatforms = [];
        this.springboards = [];

        this.buildLevel();
        this.pipeSystem.setup(this.state.currentLevel);
        this.setupElevators();
        this.setupMovingPlatforms();
        this.setupFallingPlatforms();
        this.setupSpringboards();
        this.spawnEnemies();
        this.spawnPiranhaPlants();
        this.spawnCoins();

        this.cameraX = 0;
        this.updateWorldDisplay();
    }

    nextLevel() {
        if (this.state.currentLevel >= this.state.totalLevels) {
            this.showOverlay('YOU WIN!', `Final Score: ${this.player.score}`, true);
            if (window.music) music.stop();
            return;
        }

        this.state.currentLevel++;
        this.state.state = this.state.LEVEL_TRANSITION;
        this.showOverlay(
            `WORLD 1-${this.state.currentLevel}`,
            'Get Ready!',
            false
        );
        if (window.music) music.stop();

        setTimeout(() => {
            this.hideOverlay();
            this.reset();
            if (window.music) {
                if (this.state.currentLevel === 2) {
                    music.playUnderground();
                } else if (this.state.currentLevel === 3 && typeof music.playAthletic === 'function') {
                    music.playAthletic();
                } else {
                    music.playOverworld();
                }
            }
        }, 2000);
    }

    playAgain() {
        this.lives = 3;
        this.reset();
        if (window.music) {
            music.stop();
            if (this.state.currentLevel === 2) {
                music.playUnderground();
            } else if (this.state.currentLevel === 3 && typeof music.playAthletic === 'function') {
                music.playAthletic();
            } else {
                music.playOverworld();
            }
        }
    }

    togglePause() {
        if (this.state.state === this.state.LEVEL_TRANSITION) return;
        this.paused = !this.paused;
        if (this.paused) {
            if (window.music) music.pause();
        } else {
            if (window.music) music.resume();
        }
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
        this.updatePowerDisplay();
    }

    updatePowerDisplay() {
        const powerEl = document.getElementById('power');
        if (powerEl) {
            if (this.player && this.player.isFire) {
                powerEl.textContent = '● FIRE';
                powerEl.style.color = '#ff8800';
            } else if (this.player && this.player.isStar) {
                powerEl.textContent = '★ STAR';
                powerEl.style.color = '#ffee00';
            } else if (this.player && this.player.isBig) {
                powerEl.textContent = '● SUPER';
                powerEl.style.color = '#ff6b6b';
            } else {
                powerEl.textContent = '';
            }
        }
    }

    spawnEnemies() {
        const level = this.state.currentLevel;
        let enemyPositions;

        if (level === 2) {
            const goombaPositions = [
                12, 16,
                32, 35, 42,
                57, 62, 65, 74,
                108, 110,
                128, 132, 137, 145, 148,
                167, 170, 175, 180, 185,
                200, 205, 210
            ];
            goombaPositions.forEach(col => {
                this.enemies.push(new Goomba(col * CONFIG.TILE_SIZE, 11 * CONFIG.TILE_SIZE));
            });

            const greenKoopaPositions = [38, 68, 135, 172, 198];
            greenKoopaPositions.forEach(col => {
                this.enemies.push(new Koopa(col * CONFIG.TILE_SIZE, 10 * CONFIG.TILE_SIZE, 'green'));
            });

            const redKoopaPositions = [55, 142, 188];
            redKoopaPositions.forEach(col => {
                this.enemies.push(new Koopa(col * CONFIG.TILE_SIZE, 10 * CONFIG.TILE_SIZE, 'red'));
            });
        } else if (level === 1) {
            enemyPositions = [22, 35, 36, 50, 58, 59, 70, 78, 80, 95, 96, 108, 109, 125, 126, 135, 148];
            enemyPositions.forEach(col => {
                this.enemies.push(new Goomba(col * CONFIG.TILE_SIZE, 11 * CONFIG.TILE_SIZE));
            });

            const greenKoopaPositions = [30, 65, 100, 130];
            greenKoopaPositions.forEach(col => {
                this.enemies.push(new Koopa(col * CONFIG.TILE_SIZE, 10 * CONFIG.TILE_SIZE, 'green'));
            });

            const redKoopaPositions = [45, 115];
            redKoopaPositions.forEach(col => {
                this.enemies.push(new Koopa(col * CONFIG.TILE_SIZE, 10 * CONFIG.TILE_SIZE, 'red'));
            });
        } else if (level === 3) {
            const T = CONFIG.TILE_SIZE;
            [35, 37, 46, 56, 60, 80, 88, 184, 188, 206].forEach(col => {
                this.enemies.push(new Goomba(col * T, 10 * T));
            });
            [36, 47, 57, 196].forEach(col => {
                this.enemies.push(new Koopa(col * T, 9 * T, 'green'));
            });
            this.enemies.push(new Paratroopa(110 * T, 6 * T, 'green', 'vertical'));
            this.enemies.push(new Paratroopa(135 * T, 5 * T, 'green', 'vertical'));
            this.enemies.push(new Paratroopa(210 * T, 4 * T, 'green', 'vertical'));
            this.enemies.push(new Paratroopa(82 * T, 6 * T, 'red', 'horizontal'));
            this.enemies.push(new Paratroopa(165 * T, 6 * T, 'red', 'horizontal'));
            this.enemies.push(new Paratroopa(208 * T, 3 * T, 'red', 'horizontal'));
            this.enemies.push(new HammerBro(151 * T, 7 * T));
            this.enemies.push(new HammerBro(176 * T, 9 * T));
        }
    }

    spawnCoins() {
        const T = CONFIG.TILE_SIZE;
        const level = this.state.currentLevel;

        if (level === 1) {
            const coinPositions = [
                [8, 18], [8, 19], [8, 20],
                [7, 41], [7, 42], [7, 43],
                [8, 54], [8, 55], [8, 56],
                [8, 61], [8, 62], [8, 63],
                [8, 95], [8, 97], [8, 99],
                [7, 112], [7, 113], [7, 114],
                [8, 129], [8, 130],
                [8, 141], [8, 142]
            ];
            coinPositions.forEach(([r, c]) => {
                this.coins.push(new Coin(c * T + 8, r * T + 4, false));
            });
        } else if (level === 2) {
            const coinPositions = [
                [8, 29], [8, 30], [8, 31],
                [6, 35], [6, 36], [6, 37],
                [8, 57], [8, 63],
                [6, 67], [6, 68],
                [9, 91], [9, 92], [9, 93],
                [9, 97], [9, 98], [9, 99],
                [8, 126], [8, 127],
                [6, 131], [6, 132],
                [8, 145], [8, 146],
                [7, 167], [7, 168], [7, 169]
            ];
            coinPositions.forEach(([r, c]) => {
                this.coins.push(new Coin(c * T + 8, r * T + 4, false));
            });
        } else if (level === 3) {
            const coinPositions = [
                [10, 12], [10, 13], [10, 14],
                [9, 34], [9, 35], [9, 36], [9, 37],
                [9, 44], [9, 45], [9, 46], [9, 47],
                [9, 54], [9, 55], [9, 56], [9, 57],
                [6, 34], [6, 35], [6, 36], [6, 37],
                [10, 74], [10, 75], [10, 76],
                [8, 81], [8, 82], [8, 83],
                [8, 96], [8, 97], [8, 98],
                [9, 111], [9, 112], [9, 113],
                [8, 117],
                [8, 127], [8, 128],
                [10, 146], [10, 147], [10, 148],
                [10, 156], [10, 157],
                [10, 165], [10, 166], [10, 167],
                [9, 174], [9, 175], [9, 176],
                [10, 184], [10, 185], [10, 186],
                [6, 183], [6, 184], [6, 185],
                [10, 196], [10, 197],
                [5, 206], [5, 207],
                [4, 217], [4, 218],
                [3, 223], [3, 224]
            ];
            coinPositions.forEach(([r, c]) => {
                this.coins.push(new Coin(c * T + 8, r * T + 4, false));
            });
        }
    }

    setupElevators() {
        if (this.state.currentLevel === 2) {
            const T = CONFIG.TILE_SIZE;
            this.elevators.push(new Elevator(89 * T, 4 * T, 10 * T, 3, 1.0));
            this.elevators.push(new Elevator(96 * T, 3 * T, 9 * T, 3, 1.2));
            this.elevators.push(new Elevator(103 * T, 5 * T, 11 * T, 3, 0.8));
        }
    }

    setupMovingPlatforms() {
        if (this.state.currentLevel !== 3) return;
        const T = CONFIG.TILE_SIZE;
        this.movingPlatforms.push(new MovingPlatform(108 * T, 8 * T, 4, 'horizontal', { minX: 106 * T, maxX: 118 * T, speed: 1.2 }));
        this.movingPlatforms.push(new MovingPlatform(115 * T, 6 * T, 3, 'horizontal', { minX: 112 * T, maxX: 122 * T, speed: 1.5 }));
        this.movingPlatforms.push(new MovingPlatform(123 * T, 9 * T, 3, 'vertical', { minY: 5 * T, maxY: 10 * T, speed: 1.0 }));
        this.movingPlatforms.push(new MovingPlatform(130 * T, 7 * T, 4, 'vertical', { minY: 4 * T, maxY: 10 * T, speed: 1.3 }));
        this.movingPlatforms.push(new MovingPlatform(192 * T, 9 * T, 3, 'vertical', { minY: 5 * T, maxY: 10 * T, speed: 1.0 }));
        this.movingPlatforms.push(new MovingPlatform(198 * T, 5 * T, 3, 'horizontal', { minX: 196 * T, maxX: 206 * T, speed: 1.5 }));
    }

    setupFallingPlatforms() {
        if (this.state.currentLevel !== 3) return;
        const T = CONFIG.TILE_SIZE;
        this.fallingPlatforms.push(new FallingPlatform(148 * T, 8 * T, 3));
        this.fallingPlatforms.push(new FallingPlatform(154 * T, 7 * T, 3));
        this.fallingPlatforms.push(new FallingPlatform(160 * T, 8 * T, 3));
        this.fallingPlatforms.push(new FallingPlatform(166 * T, 7 * T, 3));
    }

    setupSpringboards() {
        if (this.state.currentLevel !== 3) return;
        const T = CONFIG.TILE_SIZE;
        this.springboards.push(new Springboard(70 * T, 12 * T, -18));
        this.springboards.push(new Springboard(78 * T, 10 * T, -18));
        this.springboards.push(new Springboard(86 * T, 12 * T, -18));
        this.springboards.push(new Springboard(200 * T, 11 * T, -18));
    }

    spawnPiranhaPlants() {
        if (this.state.currentLevel === 2) {
            this.piranhaPlants.push(new PiranhaPlant(18, 9));
            this.piranhaPlants.push(new PiranhaPlant(59, 8));
            this.piranhaPlants.push(new PiranhaPlant(124, 9));
            this.piranhaPlants.push(new PiranhaPlant(187, 9));
        } else if (this.state.currentLevel === 1) {
            this.piranhaPlants.push(new PiranhaPlant(28, 9));
            this.piranhaPlants.push(new PiranhaPlant(48, 9));
            this.piranhaPlants.push(new PiranhaPlant(90, 9));
        } else if (this.state.currentLevel === 3) {
            this.piranhaPlants.push(new PiranhaPlant(62, 9));
            this.piranhaPlants.push(new PiranhaPlant(170, 9));
        }
    }

    getPowerUpType(row, col) {
        const level = this.state.currentLevel;
        if (level === 2) {
            const fireBlocks = [[7, 36], [7, 67], [5, 76], [6, 140]];
            const starBlocks = [[6, 44], [5, 77]];
            const oneUpBlocks = [[9, 8], [9, 126]];
            for (const [r, c] of fireBlocks) if (row === r && col === c) return 'fire';
            for (const [r, c] of starBlocks) if (row === r && col === c) return 'star';
            for (const [r, c] of oneUpBlocks) if (row === r && col === c) return '1up';
            return 'super';
        } else if (level === 1) {
            const oneUpBlocks = [[5, 22]];
            const starBlocks = [[5, 38], [6, 97]];
            const fireBlocks = [[5, 55]];
            for (const [r, c] of oneUpBlocks) if (row === r && col === c) return '1up';
            for (const [r, c] of starBlocks) if (row === r && col === c) return 'star';
            for (const [r, c] of fireBlocks) if (row === r && col === c) return 'fire';
            return 'super';
        } else {
            const oneUpBlocks = [[10, 68], [7, 190]];
            const starBlocks = [[9, 151], [5, 206]];
            const fireBlocks = [[7, 90], [9, 161]];
            for (const [r, c] of oneUpBlocks) if (row === r && col === c) return '1up';
            for (const [r, c] of starBlocks) if (row === r && col === c) return 'star';
            for (const [r, c] of fireBlocks) if (row === r && col === c) return 'fire';
            return 'super';
        }
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
            this.updatePowerDisplay();
            if (this.player.y > this.levelMap.length * CONFIG.TILE_SIZE + 100) {
                this.lives--;
                if (this.lives > 0) {
                    this.reset();
                } else {
                    this.state.state = -1;
                    this.showOverlay('GAME OVER', `Final Score: ${this.player.score}`, true);
                    if (window.music) music.stop();
                }
            }
            return;
        }

        if (this.state.state === this.state.FLAGPOLE) {
            const fa = this.flagAnim;
            if (fa.phase === 'slide') {
                fa.timer++;
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
                this.player.velX = 2;
                this.player.x += 2;
                this.player.y = fa.groundY;
                this.player.onGround = true;
                this.player.facingRight = true;
                if (this.player.x >= fa.castleX) {
                    fa.phase = 'fireworks';
                    fa.timer = 180;
                    this.player.velX = 0;
                    if (window.music) music.levelClear();
                }
            } else if (fa.phase === 'fireworks') {
                fa.timer--;
                if (fa.timer % 30 === 0 && fa.timer > 0) {
                    this.spawnFirework(fa.castleX - 100 + (fa.timer * 7) % 200, 150 + (fa.timer * 3) % 100);
                }
                for (const fw of this.fireworks) {
                    for (const p of fw.particles) {
                        p.x += p.vx;
                        p.y += p.vy;
                        p.vy += 0.05;
                        p.life--;
                    }
                    fw.particles = fw.particles.filter(p => p.life > 0);
                }
                this.fireworks = this.fireworks.filter(fw => fw.particles.length > 0);
                if (fa.timer <= 0) {
                    this.nextLevel();
                }
            }
            this.updateCamera();
            this.scoreElement.textContent = this.player.score;
            this.coinsElement.textContent = this.player.coins;
            this.updatePowerDisplay();
            return;
        }

        if (this.state.state !== this.state.PLAYING) return;

        // Pipe system check
        this.pipeSystem.checkEntry(this.player, this.input.keys);
        if (this.pipeSystem.isActive()) {
            this.pipeSystem.update(this.player);
            this.updateCamera();
            this.scoreElement.textContent = this.player.score;
            this.coinsElement.textContent = this.player.coins;
            return;
        }

        this.player.update(this.input.keys, this.tiles);
        this.updateCamera();

        // Elevator update
        for (const elev of this.elevators) {
            if (elev.wouldCrush(this.player, this.tiles)) {
                elev.direction = 1;
            } else {
                elev.update();
            }
            if (elev.isPlayerOnTop(this.player)) {
                this.player.y = elev.y - this.player.height;
                this.player.velY = 0;
                this.player.onGround = true;
            }
        }

        for (const plat of this.movingPlatforms) {
            plat.update();
            if (plat.isPlayerOnTop(this.player)) {
                this.player.y = plat.y - this.player.height;
                this.player.x += plat.getDeltaX();
                this.player.y += plat.getDeltaY();
                this.player.velY = 0;
                this.player.onGround = true;
            }
        }

        this.fallingPlatforms = this.fallingPlatforms.filter(fp => {
            if (fp.isPlayerOnTop(this.player) && fp.state === 'idle') {
                fp.triggerShake();
            }
            const alive = fp.update();
            if (fp.state === 'shaking' && fp.isPlayerOnTop(this.player)) {
                this.player.y = fp.y - this.player.height;
                this.player.velY = 0;
                this.player.onGround = true;
            } else if (fp.state === 'falling' && fp.isPlayerOnTop(this.player)) {
                this.player.y = fp.y - this.player.height;
                this.player.velY = fp.velY;
                this.player.onGround = false;
            }
            return alive;
        });

        for (const sb of this.springboards) {
            if (sb.isPlayerOnTop(this.player) && !sb.compressed) {
                sb.compress();
            }
            sb.update();
            if (sb.justLaunched) {
                this.player.velY = sb.launchForce;
                this.player.onGround = false;
                sb.justLaunched = false;
                if (window.music && typeof music.spring === 'function') music.spring();
            }
        }

        // 无敌时间递减
        if (this.player.invincibleTimer > 0) {
            this.player.invincibleTimer--;
        } else {
            this.player.isInvincible = false;
        }

        // Process block hit
        if (this.player.hitTile) {
            const tile = this.player.hitTile;
            const row = Math.floor(tile.y / CONFIG.TILE_SIZE);
            const col = Math.floor(tile.x / CONFIG.TILE_SIZE);
            const key = `${row}-${col}`;
            const originalType = tile.type;

            // Type 2: brick block
            if (originalType === 2) {
                if (this.player.isBig) {
                    tile.type = 0;
                    this.levelMap[row][col] = 0;
                    this.player.score += 50;
                    if (window.music) music.coin();
                }
                // Small Mario: just bounce, no effect
            }
            // Type 14: hidden block - reveal on first hit
            else if (originalType === 14) {
                this.activatedHiddenBlocks.add(key);
                tile.type = 8;
                this.levelMap[row][col] = 8;
                this.coins.push(new Coin(tile.x + 4, tile.y - 30, true));
                this.player.coins++;
                this.player.score += 200;
                if (window.music) music.coin();
                const powerType = this.getPowerUpType(row, col);
                if (powerType) {
                    this.mushrooms.push(new Mushroom(tile.x, tile.y, powerType));
                }
            }
            // Type 15: multi-coin brick - multiple hits then become used
            else if (originalType === 15) {
                if (!this.multiCoinHits[key]) this.multiCoinHits[key] = 0;
                this.multiCoinHits[key]++;
                this.coins.push(new Coin(tile.x + 4, tile.y - 30, true));
                this.player.coins++;
                this.player.score += 200;
                if (window.music) music.coin();
                if (this.multiCoinHits[key] >= 8) {
                    tile.type = 8;
                    this.levelMap[row][col] = 8;
                }
            }
            // Type 3: question block
            else if (originalType === 3) {
                tile.type = 8;
                this.levelMap[row][col] = 8;
                this.coins.push(new Coin(tile.x + 4, tile.y - 30, true));
                this.player.coins++;
                this.player.score += 200;
                if (window.music) music.coin();
                const powerType = this.getPowerUpType(row, col);
                if (powerType) {
                    this.mushrooms.push(new Mushroom(tile.x, tile.y, powerType));
                }
            }
        }

        // Fireball shooting
        if (this.player.isFire && this.input.keys.run && this.player.fireballCooldown <= 0 && this.fireballs.length < 2) {
            const fbX = this.player.facingRight ? this.player.x + this.player.width : this.player.x - 10;
            this.fireballs.push(new Fireball(fbX, this.player.y + 10, this.player.facingRight));
            this.player.fireballCooldown = 15;
            if (window.music) music.fireball();
        }

        this.fireballs = this.fireballs.filter(fb => fb.update(this.tiles));

        const playerBounds = this.player.getBounds();

        this.enemies = this.enemies.filter(enemy => {
            if (enemy.type === 'hammerbro' && enemy.setFacing) enemy.setFacing(this.player.x);
            const alive = enemy.update(this.tiles);
            if (alive && enemy.pendingHammer) {
                this.hammers.push(enemy.pendingHammer);
                enemy.pendingHammer = null;
            }
            return alive;
        });

        this.hammers = this.hammers.filter(h => h.update());
        for (const h of this.hammers) {
            if (this.collides(playerBounds, h.getBounds()) && !this.player.isInvincible && !this.player.isStar) {
                if (this.player.isBig) {
                    this.player.shrink();
                    this.player.invincibleTimer = 120;
                    if (window.music) music.hurt();
                } else {
                    this.player.alive = false;
                    this.player.velY = -10;
                    this.state.state = this.state.DEAD;
                    if (window.music) { music.stop(); music.die(); }
                }
                h.alive = false;
                break;
            }
        }


        this.piranhaPlants.forEach(p => p.update(this.player.x, this.player.y));

        this.mushrooms = this.mushrooms.filter(mushroom => mushroom.update(this.tiles));

        this.coins.forEach(coin => coin.update());
        this.coins = this.coins.filter(coin => !coin.collected || coin.isPopCoin);

        // Mushroom collection
        this.mushrooms.forEach(mushroom => {
            if (!mushroom.alive || mushroom.emerging) return;
            if (this.collides(playerBounds, mushroom.getBounds())) {
                mushroom.alive = false;
                if (mushroom.type === '1up') {
                    if (window.music) music.oneUp();
                    this.lives++;
                } else if (mushroom.type === 'fire') {
                    this.player.becomeFire();
                    if (window.music) music.powerup();
                    this.player.score += 1000;
                } else if (mushroom.type === 'star') {
                    this.player.becomeStar();
                    if (window.music) music.powerup();
                    this.player.score += 1000;
                } else {
                    if (!this.player.isBig) {
                        this.player.becomeBig();
                        if (window.music) music.powerup();
                    } else {
                        if (window.music) music.coin();
                    }
                    this.player.score += 1000;
                }
            }
        });

        this.coins.forEach(coin => {
            if (!coin.collected && !coin.isPopCoin && this.collides(playerBounds, coin.getBounds())) {
                coin.collected = true;
                this.player.coins++;
                this.player.score += 100;
                if (window.music) music.coin();
            }
        });

        // Enemy collision with power-up logic
        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;

            const enemyBounds = {
                x: enemy.x,
                y: enemy.y,
                width: enemy.width,
                height: enemy.height
            };

            if (this.collides(playerBounds, enemyBounds)) {
                const prevH = this.player.prevHeight || this.player.height;
                const prevFeet = this.player.prevY + prevH;
                const enemyMid = enemyBounds.y + enemyBounds.height * 0.35;

                // Koopa shell: stomp to kick or stop
                if (enemy.type === 'koopa' && enemy.isShell) {
                    if (this.player.velY > 0 && prevFeet <= enemyMid) {
                        if (enemy.shellMoving) {
                            enemy.shellMoving = false;
                            enemy.velX = 0;
                            enemy.shellTimer = 0;
                        } else {
                            enemy.kick(this.player.x < enemy.x);
                        }
                        this.player.velY = -8;
                        this.player.score += 200;
                        if (window.music) music.coin();
                    } else if (enemy.shellMoving && !this.player.isInvincible && !this.player.isStar) {
                        if (this.player.isBig) {
                            this.player.shrink();
                            this.player.invincibleTimer = 120;
                            if (window.music) music.hurt();
                        } else {
                            this.player.alive = false;
                            this.player.velY = -10;
                            this.state.state = this.state.DEAD;
                            if (window.music) { music.stop(); music.die(); }
                        }
                    }
                    return;
                }

                if (this.player.velY > 0 && prevFeet <= enemyMid) {
                    const result = enemy.squish();
                    this.player.velY = -8;
                    this.player.score += 200;
                    if (window.music) music.coin();
                } else if (!this.player.isInvincible && !this.player.isStar) {
                    if (this.player.isBig) {
                        this.player.shrink();
                        this.player.invincibleTimer = 120;
                        if (window.music) music.hurt();
                    } else {
                        this.player.alive = false;
                        this.player.velY = -10;
                        this.state.state = this.state.DEAD;
                        if (window.music) { music.stop(); music.die(); }
                    }
                }
            }
        });

        // Shell-vs-enemy collision: moving shells kill other enemies
        this.enemies.forEach(shell => {
            if (!shell.alive || shell.type !== 'koopa' || !shell.isShell || !shell.shellMoving) return;
            const shellBounds = { x: shell.x, y: shell.y, width: shell.width, height: shell.height };
            this.enemies.forEach(other => {
                if (other === shell || !other.alive) return;
                if (other.type === 'koopa' && other.isShell) return;
                const otherBounds = { x: other.x, y: other.y, width: other.width, height: other.height };
                if (this.collides(shellBounds, otherBounds)) {
                    other.alive = false;
                    this.player.score += 200;
                }
            });
        });

        // Fireball-enemy collision
        this.fireballs.forEach(fb => {
            if (!fb.alive) return;
            const fbBounds = fb.getBounds();
            this.enemies.forEach(enemy => {
                if (!enemy.alive) return;
                if (enemy.type === 'koopa' && enemy.isShell && !enemy.shellMoving) return;
                const enemyBounds = { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height };
                if (this.collides(fbBounds, enemyBounds)) {
                    if (enemy.type === 'koopa' && !enemy.isShell) {
                        enemy.squish();
                    } else if (enemy.squish) {
                        enemy.squish();
                    }
                    enemy.alive = false;
                    fb.alive = false;
                    this.player.score += 200;
                }
            });
        });

        // Star power: player kills enemies on contact
        if (this.player.isStar) {
            this.enemies.forEach(enemy => {
                if (!enemy.alive) return;
                const enemyBounds = { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height };
                if (this.collides(playerBounds, enemyBounds)) {
                    enemy.alive = false;
                    this.player.score += 200;
                }
            });
        }

        // Piranha plant collision
        this.piranhaPlants.forEach(plant => {
            const pb = plant.getBounds();
            if (!pb) return;
            if (this.collides(playerBounds, pb)) {
                if (this.player.isStar) {
                    plant.alive = false;
                    this.player.score += 200;
                } else if (!this.player.isInvincible) {
                    if (this.player.isBig) {
                        this.player.shrink();
                        this.player.invincibleTimer = 120;
                        if (window.music) music.hurt();
                    } else {
                        this.player.alive = false;
                        this.player.velY = -10;
                        this.state.state = this.state.DEAD;
                        if (window.music) { music.stop(); music.die(); }
                    }
                }
            }
        });

        if (this.player.y > this.levelMap.length * CONFIG.TILE_SIZE && this.state.state === this.state.PLAYING) {
            this.player.alive = false;
            this.player.velY = -10;
            this.state.state = this.state.DEAD;
            if (window.music) { music.stop(); music.die(); }
        }

        // Flagpole collision
        if (this.state.state === this.state.PLAYING) {
            const pb = this.player.getBounds();
            for (const tile of this.tiles) {
                if (tile.type === 9 && this.collides(pb, tile)) {
                    const T = CONFIG.TILE_SIZE;
                    const flagCol = Math.floor(tile.x / T);
                    const heightBonus = Math.max(0, Math.floor((12 * T - this.player.y) / T) * 100);
                    const timeBonus = Math.ceil(this.timeLeft / 60) * 50;
                    this.player.score += heightBonus + 1000 + timeBonus;
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
                        castleX: (flagCol + 8) * T,
                        heightBonus: heightBonus
                    };
                    this.state.state = this.state.FLAGPOLE;
                    break;
                }
            }
        }

        this.scoreElement.textContent = this.player.score;
        this.coinsElement.textContent = this.player.coins;

        this.timeLeft--;
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.player.alive = false;
            this.player.velY = -10;
            this.state.state = this.state.DEAD;
            if (window.music) { music.stop(); music.die(); }
        }
        this.timeElement.textContent = Math.ceil(this.timeLeft / 60);
        this.livesElement.textContent = this.lives;

        this.updatePowerDisplay();
    }

    draw() {
        this.renderer.clear(this.cameraX);
        const flagY = this.flagAnim ? this.flagAnim.flagCurrentY : 4 * CONFIG.TILE_SIZE;
        this.renderer.drawTiles(this.levelMap, this.cameraX, flagY);
        this.coins.forEach(coin => this.renderer.drawCoin(coin, this.cameraX));
        this.mushrooms.forEach(mushroom => this.renderer.drawMushroom(mushroom, this.cameraX));
        this.enemies.forEach(enemy => {
            if (enemy.type === 'koopa') {
                this.renderer.drawKoopa(enemy, this.cameraX);
            } else if (enemy.type === 'paratroopa') {
                this.renderer.drawParatroopa(enemy, this.cameraX);
            } else if (enemy.type === 'hammerbro') {
                this.renderer.drawHammerBro(enemy, this.cameraX);
            } else {
                this.renderer.drawGoomba(enemy, this.cameraX);
            }
        });
        this.hammers.forEach(h => this.renderer.drawHammer(h, this.cameraX));
        this.elevators.forEach(elev => this.renderer.drawElevator(elev, this.cameraX));
        this.movingPlatforms.forEach(plat => this.renderer.drawMovingPlatform(plat, this.cameraX));
        this.fallingPlatforms.forEach(fp => this.renderer.drawFallingPlatform(fp, this.cameraX));
        this.springboards.forEach(sb => this.renderer.drawSpringboard(sb, this.cameraX));
        this.piranhaPlants.forEach(p => this.renderer.drawPiranhaPlant(p, this.cameraX));
        this.fireballs.forEach(fb => this.renderer.drawFireball(fb, this.cameraX));
        this.renderer.drawMario(this.player, this.cameraX);

        for (const fw of this.fireworks) {
            for (const p of fw.particles) {
                const px = p.x - this.cameraX;
                const alpha = p.life / 60;
                this.ctx.globalAlpha = Math.max(0, alpha);
                this.ctx.fillStyle = p.color;
                const size = 3 + alpha * 3;
                this.ctx.fillRect(px - size / 2, p.y - size / 2, size, size);
            }
        }
        this.ctx.globalAlpha = 1;

        if (this.paused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
            this.ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 48px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2 - 10);
            this.ctx.font = '18px monospace';
            this.ctx.fillStyle = '#dddddd';
            this.ctx.fillText('Press P to resume', CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2 + 24);
            this.ctx.textAlign = 'left';
        }
    }

    spawnFirework(x, y) {
        const particles = [];
        const colors = ['#ff0000', '#ffff00', '#00ff00', '#ff8800', '#ffffff', '#ff69b4'];
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const speed = 2 + (i % 3);
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: colors[i % colors.length],
                life: 50 + (i % 3) * 10
            });
        }
        this.fireworks.push({ particles });
    }

    showOverlay(text, subText, showButton) {
        this.overlayText.textContent = text;
        this.subText.textContent = subText;
        this.overlay.style.display = 'flex';
        const btn = document.getElementById('playAgainBtn');
        if (btn) btn.style.display = showButton ? 'inline-block' : 'none';
    }

    gameLoop() {
        const renderInterval = 1000 / CONFIG.FPS;
        const physicsStep = 1000 / 60;
        let accumulator = 0;
        let lastTime = 0;
        let lastRender = 0;

        const loop = (timestamp) => {
            if (lastTime === 0) lastTime = timestamp;
            if (this.paused) {
                accumulator = 0;
                lastTime = timestamp;
            } else {
                accumulator += timestamp - lastTime;
                lastTime = timestamp;

                while (accumulator >= physicsStep) {
                    this.update();
                    accumulator -= physicsStep;
                }
            }

            if (timestamp - lastRender >= renderInterval) {
                lastRender = timestamp;
                this.draw();
            }

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
    console.log('Super Mario World 1-1 - HTML5 Edition Loaded!');
    console.log('Use arrow keys or WASD to move, SPACE to jump');
});
