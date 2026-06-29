class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.sprites = {};
        this.loaded = false;
        this.animTimer = 0;
        this.currentLevel = 1;
        this.groundedFrames = 0;
        this.mushroomSprite = null;
        this.greenMushroomSprite = null;
    }

    async loadSprites() {
        const spriteList = {
            'mario-idle': 'img/mario-idle.png',
            'mario-walk': 'img/mario-walk.png',
            'mario-jump': 'img/mario-jump.png',
            'mario-duck': 'img/mario-duck.png',
            'mario-dead': 'img/mario-dead.png',
            'mario-big-idle': 'img/mario-big-idle.png',
            'mario-big-walk': 'img/mario-big-walk.png',
            'mario-big-jump': 'img/mario-big-jump.png',
            'mario-big-duck': 'img/mario-big-duck.png',
            'goomba': 'img/goomba.png',
            'coin': 'img/coin.png',
            'ground': 'img/ground.png',
            'brick': 'img/brick.png',
            'stair': 'img/stair.png',
            'question': 'img/question-block.png',
            'used': 'img/used-block.png',
            'pipe': 'img/pipe.png',
            'mushroom-super': 'img/mushroom-super.svg',
            'mushroom-1up': 'img/mushroom-1up.svg',
        };

        const promises = Object.entries(spriteList).map(([name, src]) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => { this.sprites[name] = img; resolve(); };
                img.onerror = () => { console.warn('Failed to load sprite:', src); resolve(); };
                img.src = src;
            });
        });

        await Promise.all(promises);
        this.loaded = true;
        this.mushroomSprite = this.generateMushroomSprite();
    }

    generateMushroomSprite() {
        const c = document.createElement('canvas');
        c.width = 16;
        c.height = 16;
        const g = c.getContext('2d');

        const R = '#e52521';
        const W = '#fff';
        const S = '#f8d8b0';
        const B = '#000';

        // row 0
        g.fillStyle = R;
        g.fillRect(4, 0, 8, 1);
        // row 1
        g.fillRect(2, 1, 12, 1);
        // row 2: W spots
        g.fillRect(1, 2, 14, 1);
        g.fillStyle = W; g.fillRect(2, 2, 3, 1); g.fillRect(11, 2, 3, 1);
        // row 3
        g.fillStyle = R; g.fillRect(1, 3, 14, 1);
        g.fillStyle = W; g.fillRect(1, 3, 4, 1); g.fillRect(11, 3, 4, 1);
        // row 4
        g.fillStyle = R; g.fillRect(0, 4, 16, 1);
        g.fillStyle = W; g.fillRect(0, 4, 4, 1); g.fillRect(12, 4, 4, 1);
        // row 5
        g.fillStyle = R; g.fillRect(0, 5, 16, 1);
        g.fillStyle = W; g.fillRect(0, 5, 3, 1); g.fillRect(13, 5, 3, 1);
        // row 6
        g.fillStyle = R; g.fillRect(0, 6, 16, 1);
        // row 7
        g.fillRect(1, 7, 14, 1);
        // row 8: face
        g.fillStyle = S; g.fillRect(3, 8, 10, 1);
        // row 9: eyes
        g.fillStyle = S; g.fillRect(3, 9, 10, 1);
        g.fillStyle = B; g.fillRect(5, 9, 2, 1); g.fillRect(9, 9, 2, 1);
        // row 10: face
        g.fillStyle = S; g.fillRect(3, 10, 10, 1);
        // row 11: face bottom
        g.fillStyle = S; g.fillRect(4, 11, 8, 1);
        // row 12-14: stem
        g.fillStyle = W;
        g.fillRect(4, 12, 8, 1);
        g.fillRect(3, 13, 10, 1);
        g.fillRect(3, 14, 10, 1);
        // row 15: feet
        g.fillStyle = R;
        g.fillRect(2, 15, 5, 1); g.fillRect(9, 15, 5, 1);

        return c;
    }

    setLevel(level) {
        this.currentLevel = level;
        if (level === 2) {
            this.theme = {
                ground: '#6b4c2a',
                groundDark: '#5a3d20',
                groundHighlight: '#7d5c38',
                brick: '#4a8cad',
                brickLight: '#5ea8c8',
                brickDark: '#356a85',
                brickMortar: '#2c5a70'
            };
        } else if (level === 3) {
            this.theme = {
                treeCrown: '#2d8b2d',
                treeCrownLight: '#3da83d',
                treeTrunk: '#8B4513',
                bridge: '#a0522d',
                bridgeDark: '#6b3410',
                bridgeNail: '#888'
            };
        } else if (level === 4) {
            this.theme = {
                castleBrick: '#606060',
                castleBrickLight: '#787878',
                castleBrickDark: '#484848',
                unbreakable: '#3a3a3a',
                unbreakableLight: '#505050'
            };
        } else {
            this.theme = null;
        }
    }

    clear(cameraX) {
        if (this.currentLevel === 4) {
            // Castle: pure black background with subtle lava glow at bottom
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
            // Subtle red glow from lava at bottom
            const gradient = this.ctx.createLinearGradient(0, CONFIG.SCREEN_HEIGHT - 120, 0, CONFIG.SCREEN_HEIGHT);
            gradient.addColorStop(0, 'rgba(200, 30, 0, 0)');
            gradient.addColorStop(1, 'rgba(200, 30, 0, 0.15)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, CONFIG.SCREEN_HEIGHT - 120, CONFIG.SCREEN_WIDTH, 120);
            // Animated torch flickers on walls
            if (cameraX !== undefined) {
                const torchSpacing = 200;
                for (let i = 0; i < 6; i++) {
                    const tx = i * torchSpacing - (cameraX % torchSpacing) + 80;
                    const ty = 60;
                    const flicker = Math.sin(this.animTimer * 0.2 + i * 1.5) * 3;
                    this.ctx.fillStyle = 'rgba(255, 136, 0, 0.08)';
                    this.ctx.beginPath();
                    this.ctx.arc(tx, ty + flicker, 30, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        } else if (this.currentLevel === 2) {
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
            this.ctx.fillStyle = 'rgba(30, 30, 50, 0.15)';
            for (let i = 0; i < 3; i++) {
                const px = (this.animTimer * 0.1 + i * 280) % (CONFIG.SCREEN_WIDTH + 100) - 50;
                const py = 150 + i * 150;
                this.ctx.beginPath();
                this.ctx.arc(px, py, 20, 0, Math.PI * 2);
                this.ctx.fill();
            }
        } else if (this.currentLevel === 3) {
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
            this.ctx.fillStyle = '#b0e0ff';
            this.ctx.fillRect(0, CONFIG.SCREEN_HEIGHT * 0.6, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT * 0.4);

            if (cameraX !== undefined) {
                const cloudParallax = cameraX * 0.15;
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                for (let i = 0; i < 5; i++) {
                    const cx = i * 400 - (cloudParallax % 400) + 50;
                    const cy = 60 + (i % 3) * 50;
                    this.ctx.beginPath();
                    this.ctx.arc(cx, cy, 30, 0, Math.PI * 2);
                    this.ctx.arc(cx + 35, cy - 8, 35, 0, Math.PI * 2);
                    this.ctx.arc(cx + 70, cy, 28, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                const hillParallax = cameraX * 0.1;
                this.ctx.fillStyle = 'rgba(144, 210, 144, 0.4)';
                for (let i = 0; i < 6; i++) {
                    const hx = i * 350 - (hillParallax % 350);
                    const hy = CONFIG.SCREEN_HEIGHT - 40;
                    this.ctx.beginPath();
                    this.ctx.arc(hx + 50, hy, 60, Math.PI, 0);
                    this.ctx.arc(hx + 120, hy, 45, Math.PI, 0);
                    this.ctx.fill();
                }
            }

            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            for (let i = 0; i < 3; i++) {
                const cx2 = ((this.animTimer * 0.2 + i * 350) % (CONFIG.SCREEN_WIDTH + 300)) - 150;
                const cy2 = 120 + i * 80;
                this.ctx.beginPath();
                this.ctx.arc(cx2, cy2, 15, 0, Math.PI * 2);
                this.ctx.arc(cx2 + 20, cy2 - 4, 18, 0, Math.PI * 2);
                this.ctx.arc(cx2 + 40, cy2, 14, 0, Math.PI * 2);
                this.ctx.fill();
            }
        } else {
            this.ctx.fillStyle = '#5c94fc';
            this.ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);

            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let i = 0; i < 3; i++) {
                const cx2 = ((this.animTimer * 0.3 + i * 300) % (CONFIG.SCREEN_WIDTH + 200)) - 100;
                const cy2 = 80 + i * 60;
                this.ctx.beginPath();
                this.ctx.arc(cx2, cy2, 20, 0, Math.PI * 2);
                this.ctx.arc(cx2 + 25, cy2 - 5, 25, 0, Math.PI * 2);
                this.ctx.arc(cx2 + 50, cy2, 20, 0, Math.PI * 2);
                this.ctx.fill();
            }

            if (cameraX !== undefined) {
                const parallax = cameraX * 0.3;

                for (let i = 0; i < 5; i++) {
                    const mx = i * 480 - (parallax % 480);
                    const my = CONFIG.SCREEN_HEIGHT - 120;
                    this.ctx.fillStyle = '#4a8c4a';
                    this.ctx.beginPath();
                    this.ctx.moveTo(mx, my + 40);
                    this.ctx.lineTo(mx + 60, my - 40);
                    this.ctx.lineTo(mx + 120, my + 40);
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.fillStyle = '#3a7c3a';
                    this.ctx.beginPath();
                    this.ctx.moveTo(mx + 20, my + 40);
                    this.ctx.lineTo(mx + 60, my - 40);
                    this.ctx.lineTo(mx + 60, my + 40);
                    this.ctx.closePath();
                    this.ctx.fill();
                }

                for (let i = 0; i < 8; i++) {
                    const hx = i * 300 - (parallax % 300) + 80;
                    const hy = CONFIG.SCREEN_HEIGHT - 96;
                    this.ctx.fillStyle = '#5cb85c';
                    this.ctx.beginPath();
                    this.ctx.arc(hx, hy + 16, 32, Math.PI, 0);
                    this.ctx.arc(hx + 40, hy + 16, 24, Math.PI, 0);
                    this.ctx.fill();
                    this.ctx.fillRect(hx - 32, hy + 16, 96, 10);
                }

                const bushParallax = cameraX * 0.5;
                for (let i = 0; i < 10; i++) {
                    const bx = i * 220 - (bushParallax % 220) + 50;
                    const by = CONFIG.SCREEN_HEIGHT - 88;
                    this.ctx.fillStyle = '#2e8b2e';
                    this.ctx.beginPath();
                    this.ctx.arc(bx, by, 12, Math.PI, 0);
                    this.ctx.arc(bx + 16, by - 2, 10, Math.PI, 0);
                    this.ctx.arc(bx + 30, by, 12, Math.PI, 0);
                    this.ctx.fill();
                    this.ctx.fillRect(bx - 12, by, 54, 6);
                }
            }
        }
    }

    drawTiles(levelMap, cameraX, flagY) {
        this.animTimer++;
        const startCol = Math.max(0, Math.floor(cameraX / CONFIG.TILE_SIZE));
        const endCol = Math.min(levelMap[0].length,
            Math.ceil((cameraX + CONFIG.SCREEN_WIDTH) / CONFIG.TILE_SIZE) + 1);

        let flagpoleCol = -1;

        for (let row = 0; row < levelMap.length; row++) {
            for (let col = startCol; col < endCol; col++) {
                const tile = levelMap[row][col];
                if (tile === 0) continue;
                if (tile === 9) flagpoleCol = col;

                const tx = col * CONFIG.TILE_SIZE - cameraX;
                const ty = row * CONFIG.TILE_SIZE;
                const T = CONFIG.TILE_SIZE;

                switch (tile) {
                    case 1: {
                        const th = this.theme;
                        if (row === 0 || levelMap[row - 1][col] === 0) {
                            if (th) {
                                this.ctx.fillStyle = th.ground;
                                this.ctx.fillRect(tx, ty, T, T);
                                this.ctx.fillStyle = th.groundHighlight;
                                this.ctx.fillRect(tx, ty, T, 4);
                                this.ctx.fillStyle = th.groundDark;
                                this.ctx.fillRect(tx + 4, ty + 8, 8, 6);
                                this.ctx.fillRect(tx + 18, ty + 18, 10, 6);
                            } else {
                                this.ctx.fillStyle = '#4cad4c';
                                this.ctx.fillRect(tx, ty, T, T);
                                this.ctx.fillStyle = '#5cbf5c';
                                this.ctx.fillRect(tx, ty, T, 6);
                                this.ctx.fillStyle = '#3d8b3d';
                                for (let gx = tx + 2; gx < tx + T; gx += 6) {
                                    this.ctx.fillRect(gx, ty + 6, 2, 4);
                                }
                                this.ctx.fillStyle = '#c8641e';
                                this.ctx.fillRect(tx, ty + 14, T, T - 14);
                            }
                        } else {
                            if (th) {
                                this.ctx.fillStyle = th.ground;
                                this.ctx.fillRect(tx, ty, T, T);
                                this.ctx.fillStyle = th.groundDark;
                                this.ctx.fillRect(tx + 4, ty + 4, 8, 8);
                                this.ctx.fillRect(tx + 18, ty + 16, 10, 8);
                            } else {
                                this.ctx.fillStyle = '#c8641e';
                                this.ctx.fillRect(tx, ty, T, T);
                                this.ctx.fillStyle = '#b5571a';
                                this.ctx.fillRect(tx + 4, ty + 4, 8, 8);
                                this.ctx.fillRect(tx + 18, ty + 16, 10, 8);
                            }
                        }
                        break;
                    }

                    case 2: {
                        const th = this.theme;
                        const base = th ? th.brick : '#c84c0c';
                        const light = th ? th.brickLight : '#e09050';
                        const dark = th ? th.brickDark : '#983808';
                        this.ctx.fillStyle = base;
                        this.ctx.fillRect(tx, ty, T, T);
                        this.ctx.fillStyle = light;
                        this.ctx.fillRect(tx, ty, T, 2);
                        this.ctx.fillRect(tx, ty, 2, T / 2);
                        this.ctx.fillRect(tx + T / 2, ty + T / 2, 2, T / 2);
                        this.ctx.fillStyle = dark;
                        this.ctx.fillRect(tx, ty + T / 2 - 1, T, 2);
                        this.ctx.fillRect(tx + T / 2 - 1, ty, 2, T / 2);
                        this.ctx.fillRect(tx + T - 1, ty + T / 2, 1, T / 2);
                        this.ctx.fillRect(tx - 1, ty + T / 2, 1, T / 2);
                        break;
                    }

                    case 3: {
                        const pulse = Math.sin(this.animTimer * 0.08) * 0.1 + 0.9;
                        this.ctx.fillStyle = `rgb(${Math.floor(255 * pulse)}, ${Math.floor(200 * pulse)}, 0)`;
                        this.ctx.fillRect(tx, ty, T, T);
                        this.ctx.fillStyle = '#b8860b';
                        this.ctx.fillRect(tx, ty, T, 2);
                        this.ctx.fillRect(tx, ty, 2, T);
                        this.ctx.fillRect(tx + T - 2, ty, 2, T);
                        this.ctx.fillRect(tx, ty + T - 2, T, 2);
                        this.ctx.fillStyle = '#fff';
                        this.ctx.font = 'bold 18px monospace';
                        this.ctx.textAlign = 'center';
                        this.ctx.textBaseline = 'middle';
                        this.ctx.fillText('?', tx + T / 2, ty + T / 2 + 1);
                        this.ctx.fillStyle = '#8b6914';
                        this.ctx.fillRect(tx + 4, ty + 4, 3, 3);
                        this.ctx.fillRect(tx + T - 7, ty + 4, 3, 3);
                        this.ctx.fillRect(tx + 4, ty + T - 7, 3, 3);
                        this.ctx.fillRect(tx + T - 7, ty + T - 7, 3, 3);
                        break;
                    }

                    case 4:
                        this.ctx.fillStyle = '#2e8b2e';
                        this.ctx.fillRect(tx, ty + 8, T * 2, T * 2 - 8);
                        this.ctx.fillStyle = '#3cb43c';
                        this.ctx.fillRect(tx + 4, ty + 8, 8, T * 2 - 8);
                        this.ctx.fillStyle = '#1a6b1a';
                        this.ctx.fillRect(tx + T * 2 - 6, ty + 8, 6, T * 2 - 8);
                        this.ctx.fillStyle = '#2e8b2e';
                        this.ctx.fillRect(tx - 4, ty, T * 2 + 8, 12);
                        this.ctx.fillStyle = '#3cb43c';
                        this.ctx.fillRect(tx - 4, ty, T * 2 + 8, 3);
                        this.ctx.fillStyle = '#1a6b1a';
                        this.ctx.fillRect(tx - 4, ty + 9, T * 2 + 8, 3);
                        break;
                    case 5:
                        break;
                    case 6:
                        this.ctx.fillStyle = '#2e8b2e';
                        this.ctx.fillRect(tx, ty, T, T);
                        this.ctx.fillStyle = '#3cb43c';
                        this.ctx.fillRect(tx + 4, ty, 8, T);
                        this.ctx.fillStyle = '#1a6b1a';
                        this.ctx.fillRect(tx + T - 4, ty, 4, T);
                        break;
                    case 7:
                        this.ctx.fillStyle = '#2e8b2e';
                        this.ctx.fillRect(tx, ty, T, T);
                        this.ctx.fillStyle = '#1a6b1a';
                        this.ctx.fillRect(tx, ty, 4, T);
                        this.ctx.fillStyle = '#3cb43c';
                        this.ctx.fillRect(tx + T - 12, ty, 8, T);
                        break;

                    case 8:
                        this.ctx.fillStyle = '#8b7355';
                        this.ctx.fillRect(tx, ty, T, T);
                        this.ctx.fillStyle = '#6b5335';
                        this.ctx.fillRect(tx, ty, T, 2);
                        this.ctx.fillRect(tx, ty, 2, T);
                        this.ctx.fillRect(tx + T - 2, ty, 2, T);
                        this.ctx.fillRect(tx, ty + T - 2, T, 2);
                        this.ctx.fillStyle = '#a08060';
                        this.ctx.fillRect(tx + 4, ty + 4, T - 8, T - 8);
                        break;

                    case 9:
                        this.ctx.fillStyle = '#aaaaaa';
                        this.ctx.fillRect(tx + 14, ty, 4, T);
                        if (row === 4) {
                            this.ctx.fillStyle = '#ffd700';
                            this.ctx.beginPath();
                            this.ctx.arc(tx + 16, ty + 4, 4, 0, Math.PI * 2);
                            this.ctx.fill();
                        }
                        break;

                    case 11:
                        this.ctx.fillStyle = '#6b4c2a';
                        this.ctx.fillRect(tx, ty, T, T);
                        if (row === 0 || levelMap[row - 1][col] === 0) {
                            this.ctx.fillStyle = '#7d5c38';
                            this.ctx.fillRect(tx, ty, T, 4);
                        }
                        this.ctx.fillStyle = '#5a3d20';
                        this.ctx.fillRect(tx + 6, ty + 8, 6, 6);
                        this.ctx.fillRect(tx + 20, ty + 20, 8, 6);
                        break;

                    case 12:
                        this.ctx.fillStyle = '#4a8cad';
                        this.ctx.fillRect(tx, ty, T, T);
                        this.ctx.fillStyle = '#5ea8c8';
                        this.ctx.fillRect(tx, ty, T, 2);
                        this.ctx.fillRect(tx, ty, 2, T / 2);
                        this.ctx.fillRect(tx + T / 2, ty + T / 2, 2, T / 2);
                        this.ctx.fillStyle = '#356a85';
                        this.ctx.fillRect(tx, ty + T / 2 - 1, T, 2);
                        this.ctx.fillRect(tx + T / 2 - 1, ty, 2, T / 2);
                        this.ctx.fillRect(tx + T - 1, ty + T / 2, 1, T / 2);
                        this.ctx.fillRect(tx - 1, ty + T / 2, 1, T / 2);
                        break;

                    case 13:
                        this.ctx.fillStyle = '#3a3a3a';
                        this.ctx.fillRect(tx, ty, T, T);
                        this.ctx.fillStyle = '#4a4a4a';
                        this.ctx.fillRect(tx, ty + T - 4, T, 4);
                        this.ctx.fillStyle = '#2a2a2a';
                        this.ctx.fillRect(tx, ty, T, 2);
                        this.ctx.fillRect(tx + 8, ty + 6, 6, 4);
                        this.ctx.fillRect(tx + 20, ty + 18, 8, 4);
                        break;

                    case 14:
                        break;

                    case 15: {
                        const bBase = this.theme ? this.theme.brick : '#c84c0c';
                        const bLight = this.theme ? this.theme.brickLight : '#e09050';
                        const bDark = this.theme ? this.theme.brickDark : '#983808';
                        this.ctx.fillStyle = bBase;
                        this.ctx.fillRect(tx, ty, T, T);
                        this.ctx.fillStyle = bLight;
                        this.ctx.fillRect(tx, ty, T, 2);
                        this.ctx.fillRect(tx, ty, 2, T / 2);
                        this.ctx.fillRect(tx + T / 2, ty + T / 2, 2, T / 2);
                        this.ctx.fillStyle = bDark;
                        this.ctx.fillRect(tx, ty + T / 2 - 1, T, 2);
                        this.ctx.fillRect(tx + T / 2 - 1, ty, 2, T / 2);
                        const shimmer = Math.sin(this.animTimer * 0.06) * 0.15 + 0.15;
                        this.ctx.fillStyle = `rgba(255, 215, 0, ${shimmer})`;
                        this.ctx.fillRect(tx + 4, ty + 4, T - 8, T - 8);
                        break;
                    }

                    case 16: {
                        const tg = this.theme ? this.theme.treeCrown : '#228b22';
                        const tgL = this.theme ? this.theme.treeCrownLight : '#32cd32';
                        const trunk = this.theme ? this.theme.treeTrunk : '#8b4513';
                        this.ctx.fillStyle = tg;
                        this.ctx.fillRect(tx, ty + T / 2, T, T / 2);
                        this.ctx.fillRect(tx + 4, ty + T / 4, T - 8, T / 4);
                        this.ctx.fillRect(tx + 10, ty + 4, T - 20, T / 4);
                        this.ctx.fillStyle = tgL;
                        this.ctx.fillRect(tx + 6, ty + T / 4 + 2, 6, 4);
                        this.ctx.fillRect(tx + 14, ty + 8, 6, 4);
                        this.ctx.fillRect(tx + 4, ty + T / 2 + 4, 8, 4);
                        this.ctx.fillStyle = trunk;
                        this.ctx.fillRect(tx + T / 2 - 3, ty + T - 6, 6, 6);
                        break;
                    }

                    case 17: {
                        const br = this.theme ? this.theme.bridge : '#a0522d';
                        const brD = this.theme ? this.theme.bridgeDark : '#6b3410';
                        const nail = this.theme ? this.theme.bridgeNail : '#c0c0c0';
                        this.ctx.fillStyle = br;
                        this.ctx.fillRect(tx, ty, T, T);
                        this.ctx.fillStyle = brD;
                        this.ctx.fillRect(tx, ty + T / 2 - 1, T, 2);
                        this.ctx.fillRect(tx, ty, T, 2);
                        this.ctx.fillRect(tx, ty + T - 2, T, 2);
                        this.ctx.fillRect(tx + 8, ty + 4, 1, T / 2 - 6);
                        this.ctx.fillRect(tx + 20, ty + 4, 1, T / 2 - 6);
                        this.ctx.fillRect(tx + 14, ty + T / 2 + 2, 1, T / 2 - 4);
                        this.ctx.fillRect(tx + 26, ty + T / 2 + 2, 1, T / 2 - 4);
                        this.ctx.fillStyle = nail;
                        this.ctx.fillRect(tx + 2, ty + 4, 2, 2);
                        this.ctx.fillRect(tx + T - 4, ty + 4, 2, 2);
                        this.ctx.fillRect(tx + 2, ty + T - 6, 2, 2);
                        this.ctx.fillRect(tx + T - 4, ty + T - 6, 2, 2);
                        break;
                    }

                    // === CASTLE TILES ===

                    case 18: { // Lava
                        const wave = Math.sin(this.animTimer * 0.08 + col * 0.5) * 3;
                        const r = 200 + Math.floor(Math.sin(this.animTimer * 0.05 + col) * 30);
                        const g = 40 + Math.floor(Math.sin(this.animTimer * 0.07 + col * 0.3) * 20);
                        this.ctx.fillStyle = `rgb(${r}, ${g}, 0)`;
                        this.ctx.fillRect(tx, ty, T, T);
                        // Bright lava surface (only top row of lava)
                        if (row === 12 || levelMap[row - 1][col] !== 18) {
                            this.ctx.fillStyle = '#ff6600';
                            this.ctx.fillRect(tx, ty + wave, T, 6);
                            this.ctx.fillStyle = '#ffaa00';
                            this.ctx.fillRect(tx + 4, ty + wave + 1, T - 8, 3);
                        }
                        // Darker depth below
                        if (row === 14) {
                            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                            this.ctx.fillRect(tx, ty, T, T);
                        }
                        break;
                    }

                    case 19: { // Castle brick
                        this.ctx.fillStyle = '#606060';
                        this.ctx.fillRect(tx, ty, T, T);
                        this.ctx.fillStyle = '#787878';
                        this.ctx.fillRect(tx, ty, T, 2);
                        this.ctx.fillRect(tx, ty, 2, T / 2);
                        this.ctx.fillRect(tx + T / 2, ty + T / 2, 2, T / 2);
                        this.ctx.fillStyle = '#484848';
                        this.ctx.fillRect(tx, ty + T / 2 - 1, T, 2);
                        this.ctx.fillRect(tx + T / 2 - 1, ty, 2, T / 2);
                        this.ctx.fillRect(tx + T - 1, ty + T / 2, 1, T / 2);
                        // Subtle dark red accent on some bricks
                        if ((col + row) % 7 === 0) {
                            this.ctx.fillStyle = 'rgba(180, 40, 20, 0.15)';
                            this.ctx.fillRect(tx + 4, ty + 4, T - 8, T - 8);
                        }
                        break;
                    }

                    case 20: { // Unbreakable brick
                        this.ctx.fillStyle = '#3a3a3a';
                        this.ctx.fillRect(tx, ty, T, T);
                        this.ctx.fillStyle = '#505050';
                        this.ctx.fillRect(tx, ty, T, 2);
                        this.ctx.fillRect(tx, ty, 2, T);
                        this.ctx.fillStyle = '#2a2a2a';
                        this.ctx.fillRect(tx + T - 2, ty, 2, T);
                        this.ctx.fillRect(tx, ty + T - 2, T, 2);
                        // Cross-hatch pattern
                        this.ctx.fillStyle = '#454545';
                        for (let d = 0; d < T; d += 8) {
                            this.ctx.fillRect(tx + d, ty + d, 2, 2);
                        }
                        break;
                    }

                    case 21: { // Bridge plank
                        this.ctx.fillStyle = '#8b5e3c';
                        this.ctx.fillRect(tx, ty, T, T);
                        this.ctx.fillStyle = '#a07050';
                        this.ctx.fillRect(tx, ty, T, 3);
                        this.ctx.fillStyle = '#6b3e1c';
                        this.ctx.fillRect(tx, ty + T - 2, T, 2);
                        // Wood grain lines
                        this.ctx.fillStyle = '#7a5030';
                        this.ctx.fillRect(tx + 10, ty + 4, 1, T - 6);
                        this.ctx.fillRect(tx + 22, ty + 4, 1, T - 6);
                        // Nails
                        this.ctx.fillStyle = '#888';
                        this.ctx.fillRect(tx + 2, ty + 4, 2, 2);
                        this.ctx.fillRect(tx + T - 4, ty + 4, 2, 2);
                        break;
                    }

                    case 22: { // Axe
                        // Stone pedestal
                        this.ctx.fillStyle = '#666';
                        this.ctx.fillRect(tx + 8, ty + T - 8, T - 16, 8);
                        this.ctx.fillStyle = '#888';
                        this.ctx.fillRect(tx + 10, ty + T - 8, T - 20, 2);
                        // Axe handle
                        this.ctx.fillStyle = '#8b4513';
                        this.ctx.fillRect(tx + T / 2 - 2, ty + 4, 4, T - 12);
                        // Axe blade
                        this.ctx.fillStyle = '#c0c0c0';
                        this.ctx.fillRect(tx + T / 2 - 10, ty + 2, 20, 8);
                        this.ctx.fillStyle = '#e0e0e0';
                        this.ctx.fillRect(tx + T / 2 - 8, ty + 3, 16, 3);
                        this.ctx.fillStyle = '#999';
                        this.ctx.fillRect(tx + T / 2 - 10, ty + 8, 20, 2);
                        // Glint animation
                        const glint = Math.sin(this.animTimer * 0.1) * 0.3 + 0.3;
                        this.ctx.fillStyle = `rgba(255, 255, 255, ${glint})`;
                        this.ctx.fillRect(tx + T / 2 - 6, ty + 4, 4, 2);
                        break;
                    }

                    case 23: { // Torch
                        // Wall bracket
                        this.ctx.fillStyle = '#666';
                        this.ctx.fillRect(tx + T / 2 - 3, ty + T / 2, 6, T / 2);
                        this.ctx.fillStyle = '#888';
                        this.ctx.fillRect(tx + T / 2 - 2, ty + T / 2, 4, 2);
                        // Flame (animated)
                        const flameFrame = Math.floor(this.animTimer / 6) % 3;
                        const flameH = 8 + flameFrame * 2;
                        const flameW = 6 - flameFrame;
                        this.ctx.fillStyle = '#ff8800';
                        this.ctx.fillRect(tx + T / 2 - flameW / 2, ty + T / 2 - flameH, flameW, flameH);
                        this.ctx.fillStyle = '#ffcc00';
                        this.ctx.fillRect(tx + T / 2 - 1, ty + T / 2 - flameH + 2, 2, flameH - 4);
                        // Glow
                        this.ctx.fillStyle = 'rgba(255, 136, 0, 0.15)';
                        this.ctx.beginPath();
                        this.ctx.arc(tx + T / 2, ty + T / 2 - flameH / 2, 12, 0, Math.PI * 2);
                        this.ctx.fill();
                        break;
                    }
                }
            }
        }

        if (flagY !== undefined && flagpoleCol >= 0) {
            const poleX = flagpoleCol * CONFIG.TILE_SIZE - cameraX;
            if (poleX > -CONFIG.TILE_SIZE && poleX < CONFIG.SCREEN_WIDTH + CONFIG.TILE_SIZE) {
                this.ctx.fillStyle = '#228b22';
                this.ctx.beginPath();
                this.ctx.moveTo(poleX + 18, flagY + 2);
                this.ctx.lineTo(poleX + 30, flagY + 10);
                this.ctx.lineTo(poleX + 18, flagY + 18);
                this.ctx.closePath();
                this.ctx.fill();
            }
        }
    }

    drawMario(player, cameraX) {
        if (player.isInvincible && player.invincibleTimer > 0 && !player.isStar) {
            if (Math.floor(player.invincibleTimer / 4) % 2 === 0) return;
        }

        const x = player.x - cameraX;
        const y = player.y;

        if (!player.alive) {
            if (this.sprites['mario-dead']) {
                this.ctx.imageSmoothingEnabled = false;
                const drawW = player.isBig ? 32 : 28;
                const drawH = player.isBig ? 48 : 32;
                this.ctx.drawImage(this.sprites['mario-dead'], x - 2, y, drawW, drawH);
                this.ctx.imageSmoothingEnabled = true;
            }
            return;
        }

        this.ctx.save();
        if (!player.facingRight) {
            const flipX = player.isBig ? x + 14 : x + player.width / 2;
            this.ctx.translate(flipX, 0);
            this.ctx.scale(-1, 1);
            this.ctx.translate(-flipX, 0);
        }

        let sprite;
        if (player.onGround) {
            this.groundedFrames++;
        } else {
            this.groundedFrames = 0;
        }

        if (!player.onGround || this.groundedFrames < 3) {
            sprite = player.isBig ? this.sprites['mario-big-jump'] : this.sprites['mario-jump'];
        } else if (Math.abs(player.velX) > 0.5) {
            const walkFrame = Math.floor(this.animTimer / 8) % 2;
            if (player.isBig) {
                sprite = walkFrame === 0 ? this.sprites['mario-big-walk'] : this.sprites['mario-big-idle'];
            } else {
                sprite = walkFrame === 0 ? this.sprites['mario-walk'] : this.sprites['mario-idle'];
            }
        } else {
            sprite = player.isBig ? this.sprites['mario-big-idle'] : this.sprites['mario-idle'];
        }

        this.ctx.imageSmoothingEnabled = false;

        if (player.isBig) {
            if (player.isDucking) {
                sprite = this.sprites['mario-big-duck'] || this.sprites['mario-big-idle'];
                if (sprite) this.ctx.drawImage(sprite, x - 8, y, 36, 32);
            } else {
                if (sprite) this.ctx.drawImage(sprite, x - 8, y - 16, 36, 54);
            }
        } else {
            if (player.isDucking) {
                sprite = this.sprites['mario-duck'] || this.sprites['mario-idle'];
                if (sprite) this.ctx.drawImage(sprite, x - 2, y, 28, 24);
            } else {
                if (sprite) this.ctx.drawImage(sprite, x - 2, y, 28, 32);
            }
        }

        this.ctx.imageSmoothingEnabled = true;

        if (player.isStar) {
            const starColors = ['#ff0000', '#00ff00', '#0088ff', '#ffff00', '#ff00ff'];
            const colorIdx = Math.floor(this.animTimer / 4) % starColors.length;
            this.ctx.globalCompositeOperation = 'source-atop';
            this.ctx.fillStyle = starColors[colorIdx];
            this.ctx.globalAlpha = 0.4;
            this.ctx.fillRect(x - 10, y - 5, player.width + 20, player.height + 10);
            this.ctx.globalAlpha = 1;
            this.ctx.globalCompositeOperation = 'source-over';
        } else if (player.isFire) {
            const pulse = Math.sin(this.animTimer * 0.15) * 0.05 + 0.2;
            this.ctx.globalCompositeOperation = 'source-atop';
            this.ctx.fillStyle = '#ff6600';
            this.ctx.globalAlpha = pulse;
            this.ctx.fillRect(x - 10, y - 5, player.width + 20, player.height + 10);
            this.ctx.globalAlpha = 1;
            this.ctx.globalCompositeOperation = 'source-over';
        }

        this.ctx.restore();
    }

    drawElevator(elev, cameraX) {
        const x = elev.x - cameraX;
        const y = elev.y;
        const w = elev.width;
        const h = elev.height;
        this.ctx.fillStyle = '#8a8a8a';
        this.ctx.fillRect(x, y, w, h);
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.fillRect(x, y, w, 3);
        this.ctx.fillStyle = '#6a6a6a';
        this.ctx.fillRect(x, y + h - 2, w, 2);
        this.ctx.fillStyle = '#555';
        for (let rx = x + 8; rx < x + w - 8; rx += 16) {
            this.ctx.fillRect(rx, y + 4, 4, 4);
        }
        this.ctx.fillStyle = '#444';
        this.ctx.fillRect(x + w / 2 - 1, 0, 2, y);
    }

    drawMovingPlatform(plat, cameraX) {
        const x = plat.x - cameraX;
        const y = plat.y;
        const w = plat.width;
        const h = plat.height;
        this.ctx.fillStyle = '#d4a020';
        this.ctx.fillRect(x, y, w, h);
        this.ctx.fillStyle = '#ffcc44';
        this.ctx.fillRect(x, y, w, 3);
        this.ctx.fillStyle = '#8a6010';
        this.ctx.fillRect(x, y + h - 2, w, 2);
        this.ctx.fillStyle = '#aa7818';
        const arrowY = y + h / 2 - 1;
        if (plat.moveType === 'horizontal' || plat.moveType === 'diagonal') {
            this.ctx.fillRect(x + 4, arrowY, 4, 2);
            this.ctx.fillRect(x + w - 8, arrowY, 4, 2);
        }
        if (plat.moveType === 'vertical' || plat.moveType === 'diagonal') {
            this.ctx.fillRect(x + w / 2 - 1, y + 2, 2, 4);
            this.ctx.fillRect(x + w / 2 - 1, y + h - 6, 2, 4);
        }
    }

    drawFallingPlatform(fp, cameraX) {
        const x = fp.x - cameraX + (fp.shakeOffsetX || 0);
        const y = fp.y;
        const w = fp.width;
        const h = fp.height;
        const falling = fp.state === 'falling';
        this.ctx.fillStyle = falling ? '#c04020' : '#e07030';
        this.ctx.fillRect(x, y, w, h);
        this.ctx.fillStyle = falling ? '#e08060' : '#f09060';
        this.ctx.fillRect(x, y, w, 3);
        this.ctx.fillStyle = '#802818';
        this.ctx.fillRect(x, y + h - 2, w, 2);
        this.ctx.fillStyle = '#601810';
        for (let cx = x + 8; cx < x + w - 6; cx += 14) {
            this.ctx.fillRect(cx, y + 4, 1, h - 6);
            this.ctx.fillRect(cx + 2, y + 5, 1, h - 8);
        }
    }

    drawSpringboard(sb, cameraX) {
        const x = sb.x - cameraX;
        const y = sb.y;
        const w = sb.width;
        const h = sb.height;
        this.ctx.fillStyle = '#444';
        this.ctx.fillRect(x + 2, y + h - 4, w - 4, 4);
        this.ctx.fillStyle = '#dc3232';
        const coils = h > 14 ? 4 : 2;
        const coilH = (h - 6) / coils;
        for (let i = 0; i < coils; i++) {
            const cy = y + 2 + i * coilH;
            this.ctx.fillRect(x + 4, cy, w - 8, Math.max(2, coilH - 2));
        }
        this.ctx.fillStyle = '#ff6060';
        this.ctx.fillRect(x + 4, y + 2, w - 8, 2);
        this.ctx.fillStyle = '#a01818';
        this.ctx.fillRect(x + 4, y + h - 6, w - 8, 2);
    }

    drawPiranhaPlant(plant, cameraX) {
        if (!plant.alive || plant.state === 'hidden') return;

        const x = plant.x - cameraX;
        const y = plant.y;
        const w = plant.width;
        const h = plant.height;
        const clipY = plant.pipeTopY;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(x - 4, 0, w + 8, clipY + 4);
        this.ctx.clip();

        // Stem
        const stemW = 10;
        const stemX = x + (w - stemW) / 2;
        this.ctx.fillStyle = '#00a800';
        this.ctx.fillRect(stemX, y + 12, stemW, h - 12);
        this.ctx.fillStyle = '#00e800';
        this.ctx.fillRect(stemX + 2, y + 12, 3, h - 12);

        // Head
        const headW = 24;
        const headH = 14;
        const headX = x;
        const headY = y;
        this.ctx.fillStyle = '#e80000';
        this.ctx.fillRect(headX, headY, headW, headH);
        this.ctx.fillStyle = '#ff4848';
        this.ctx.fillRect(headX + 2, headY + 2, headW - 4, 4);

        // White spots
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(headX + 3, headY + 3, 3, 3);
        this.ctx.fillRect(headX + headW - 6, headY + 3, 3, 3);
        this.ctx.fillRect(headX + 3, headY + headH - 5, 3, 3);
        this.ctx.fillRect(headX + headW - 6, headY + headH - 5, 3, 3);

        // Lips
        this.ctx.fillStyle = '#e80000';
        this.ctx.fillRect(headX - 2, headY + headH - 3, headW + 4, 4);
        this.ctx.fillStyle = '#a00000';
        this.ctx.fillRect(headX, headY + headH, headW, 2);

        this.ctx.restore();
    }

    drawMushroom(mushroom, cameraX) {
        if (!mushroom.alive) return;

        const x = mushroom.x - cameraX;
        const y = mushroom.y;

        if (mushroom.type === '1up') {
            this.ctx.imageSmoothingEnabled = false;
            if (this.sprites['mushroom-1up']) {
                this.ctx.drawImage(this.sprites['mushroom-1up'], x, y, 28, 28);
            } else if (!this.greenMushroomSprite) {
                const c = document.createElement('canvas');
                c.width = 16; c.height = 16;
                const g = c.getContext('2d');
                const G = '#00a800', W = '#fff', S = '#f8d8b0', B = '#000';
                g.fillStyle = G;
                g.fillRect(4,0,8,1); g.fillRect(2,1,12,1);
                g.fillRect(1,2,14,1); g.fillRect(1,3,14,1);
                g.fillRect(0,4,16,1); g.fillRect(0,5,16,1);
                g.fillRect(0,6,16,1); g.fillRect(1,7,14,1);
                g.fillStyle = W;
                g.fillRect(2,2,3,1); g.fillRect(11,2,3,1);
                g.fillRect(1,3,4,1); g.fillRect(11,3,4,1);
                g.fillRect(0,4,4,1); g.fillRect(12,4,4,1);
                g.fillRect(0,5,3,1); g.fillRect(13,5,3,1);
                g.fillStyle = S;
                g.fillRect(3,8,10,1); g.fillRect(3,9,10,1);
                g.fillRect(3,10,10,1); g.fillRect(4,11,8,1);
                g.fillStyle = B;
                g.fillRect(5,9,2,1); g.fillRect(9,9,2,1);
                g.fillStyle = W;
                g.fillRect(4,12,8,1); g.fillRect(3,13,10,1); g.fillRect(3,14,10,1);
                g.fillStyle = G;
                g.fillRect(2,15,5,1); g.fillRect(9,15,5,1);
                this.greenMushroomSprite = c;
            }
            if (!this.sprites['mushroom-1up'] && this.greenMushroomSprite) {
                this.ctx.drawImage(this.greenMushroomSprite, x, y, 28, 28);
            }
            this.ctx.imageSmoothingEnabled = true;
        } else if (mushroom.type === 'fire') {
            const petalColor = (Math.floor(this.animTimer / 8) % 2 === 0) ? '#ff8800' : '#ffcc00';
            this.ctx.fillStyle = '#00a800';
            this.ctx.fillRect(x + 11, y + 14, 6, 14);
            this.ctx.fillStyle = petalColor;
            this.ctx.fillRect(x + 4, y, 6, 6);
            this.ctx.fillRect(x + 18, y, 6, 6);
            this.ctx.fillRect(x + 4, y + 8, 6, 6);
            this.ctx.fillRect(x + 18, y + 8, 6, 6);
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(x + 10, y + 4, 8, 8);
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(x + 11, y + 6, 2, 2);
            this.ctx.fillRect(x + 15, y + 6, 2, 2);
        } else if (mushroom.type === 'star') {
            const flash = Math.floor(this.animTimer / 4) % 2 === 0;
            this.ctx.fillStyle = flash ? '#ffee00' : '#ff8800';
            this.ctx.fillRect(x + 10, y, 8, 4);
            this.ctx.fillRect(x + 6, y + 4, 16, 4);
            this.ctx.fillRect(x + 2, y + 8, 24, 6);
            this.ctx.fillRect(x + 6, y + 14, 16, 4);
            this.ctx.fillRect(x + 4, y + 18, 6, 6);
            this.ctx.fillRect(x + 18, y + 18, 6, 6);
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(x + 10, y + 10, 2, 2);
            this.ctx.fillRect(x + 16, y + 10, 2, 2);
        } else if (this.sprites['mushroom-super']) {
            this.ctx.imageSmoothingEnabled = false;
            this.ctx.drawImage(this.sprites['mushroom-super'], x, y, 28, 28);
            this.ctx.imageSmoothingEnabled = true;
        } else if (this.mushroomSprite) {
            this.ctx.imageSmoothingEnabled = false;
            this.ctx.drawImage(this.mushroomSprite, x, y, 28, 28);
            this.ctx.imageSmoothingEnabled = true;
        } else {
            this.ctx.fillStyle = '#e52521';
            this.ctx.fillRect(x + 4, y, 20, 14);
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(x + 4, y + 2, 6, 6);
            this.ctx.fillRect(x + 18, y + 2, 6, 6);
            this.ctx.fillStyle = '#f8d8b0';
            this.ctx.fillRect(x + 5, y + 14, 18, 8);
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(x + 8, y + 16, 3, 3);
            this.ctx.fillRect(x + 17, y + 16, 3, 3);
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(x + 5, y + 22, 18, 6);
        }
    }

    drawGoomba(enemy, cameraX) {
        if (!enemy.alive && !enemy.squished) return;

        const x = enemy.x - cameraX;
        const y = enemy.y;

        if (!this.sprites.goomba) {
            this.ctx.fillStyle = COLORS.GOOMBA;
            this.ctx.fillRect(x, y, enemy.width, enemy.height);
            return;
        }

        this.ctx.save();
        if (enemy.squished) {
            this.ctx.drawImage(this.sprites.goomba,
                x - 1, y + enemy.height - 10, enemy.width + 2, 10);
        } else {
            const wobble = Math.sin(this.animTimer * 0.15) * 1;
            this.ctx.drawImage(this.sprites.goomba,
                x - 1, y + wobble, enemy.width + 2, enemy.height);
        }
        this.ctx.restore();
    }

    drawKoopa(enemy, cameraX) {
        if (!enemy.alive) return;

        const x = enemy.x - cameraX;
        const y = enemy.y;
        const isRed = enemy.color === 'red';

        if (enemy.isShell) {
            const shellColor = isRed ? '#e80000' : '#00a800';
            const shellLight = isRed ? '#ff4848' : '#00e800';
            const shellDark = isRed ? '#a00000' : '#006800';

            this.ctx.fillStyle = shellColor;
            this.ctx.fillRect(x + 2, y + 2, 24, 20);
            this.ctx.fillStyle = shellLight;
            this.ctx.fillRect(x + 4, y + 4, 8, 6);
            this.ctx.fillRect(x + 14, y + 4, 8, 6);
            this.ctx.fillStyle = shellDark;
            this.ctx.fillRect(x + 2, y + 16, 24, 4);

            this.ctx.fillStyle = '#f8d870';
            this.ctx.fillRect(x + 6, y + 18, 16, 4);

            if (enemy.shellMoving) {
                const spinOffset = Math.floor(this.animTimer / 2) % 4;
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(x + 6 + spinOffset * 4, y + 8, 3, 3);
            }
        } else {
            this.ctx.save();
            const facingRight = enemy.velX > 0;
            if (facingRight) {
                this.ctx.translate(x + enemy.width / 2, 0);
                this.ctx.scale(-1, 1);
                this.ctx.translate(-(x + enemy.width / 2), 0);
            }

            const shellColor = isRed ? '#e80000' : '#00a800';
            const shellLight = isRed ? '#ff4848' : '#00e800';
            const skinColor = '#f8d870';

            this.ctx.fillStyle = shellColor;
            this.ctx.fillRect(x + 4, y + 10, 20, 16);
            this.ctx.fillStyle = shellLight;
            this.ctx.fillRect(x + 6, y + 12, 6, 5);
            this.ctx.fillRect(x + 14, y + 12, 6, 5);

            this.ctx.fillStyle = skinColor;
            this.ctx.fillRect(x + 2, y, 14, 12);
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(x + 4, y + 3, 3, 3);

            this.ctx.fillStyle = skinColor;
            const walkFrame = Math.floor(this.animTimer / 10) % 2;
            if (walkFrame === 0) {
                this.ctx.fillRect(x + 6, y + 28, 6, 8);
                this.ctx.fillRect(x + 16, y + 30, 6, 6);
            } else {
                this.ctx.fillRect(x + 6, y + 30, 6, 6);
                this.ctx.fillRect(x + 16, y + 28, 6, 8);
            }

            this.ctx.restore();
        }
    }

    drawParatroopa(enemy, cameraX) {
        if (!enemy.alive) return;
        if (!enemy.hasWings) {
            this.drawKoopa(enemy, cameraX);
            return;
        }
        const x = enemy.x - cameraX;
        const y = enemy.y;
        const isRed = enemy.color === 'red';
        const shellColor = isRed ? '#e80000' : '#00a800';
        const shellLight = isRed ? '#ff4848' : '#00e800';
        const skinColor = '#f8d870';

        const flap = Math.floor(this.animTimer / 4) % 2 === 0;
        this.ctx.fillStyle = '#fff';
        if (flap) {
            this.ctx.fillRect(x - 4, y + 6, 8, 12);
            this.ctx.fillRect(x + enemy.width - 4, y + 6, 8, 12);
        } else {
            this.ctx.fillRect(x - 2, y + 10, 6, 8);
            this.ctx.fillRect(x + enemy.width - 4, y + 10, 6, 8);
        }
        this.ctx.fillStyle = '#ccc';
        this.ctx.fillRect(x - 2, y + 8, 4, 2);
        this.ctx.fillRect(x + enemy.width - 2, y + 8, 4, 2);

        this.ctx.fillStyle = shellColor;
        this.ctx.fillRect(x + 4, y + 14, 20, 16);
        this.ctx.fillStyle = shellLight;
        this.ctx.fillRect(x + 6, y + 16, 6, 5);
        this.ctx.fillRect(x + 14, y + 16, 6, 5);

        this.ctx.fillStyle = skinColor;
        this.ctx.fillRect(x + 2, y + 2, 14, 12);
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x + 4, y + 5, 3, 3);

        this.ctx.fillStyle = skinColor;
        this.ctx.fillRect(x + 6, y + 32, 6, 6);
        this.ctx.fillRect(x + 16, y + 32, 6, 6);
    }

    drawHammerBro(enemy, cameraX) {
        if (!enemy.alive) return;
        const x = enemy.x - cameraX;
        const y = enemy.y;

        this.ctx.save();
        if (enemy.facingRight) {
            this.ctx.translate(x + enemy.width / 2, 0);
            this.ctx.scale(-1, 1);
            this.ctx.translate(-(x + enemy.width / 2), 0);
        }

        this.ctx.fillStyle = '#00a800';
        this.ctx.fillRect(x + 4, y + 16, 20, 18);
        this.ctx.fillStyle = '#00e800';
        this.ctx.fillRect(x + 6, y + 18, 6, 6);
        this.ctx.fillRect(x + 14, y + 18, 6, 6);
        this.ctx.fillStyle = '#006800';
        this.ctx.fillRect(x + 4, y + 30, 20, 4);

        this.ctx.fillStyle = '#f8d870';
        this.ctx.fillRect(x + 2, y + 4, 18, 14);
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x + 5, y + 7, 3, 4);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(x + 2, y + 14, 14, 4);

        this.ctx.fillStyle = '#f8d870';
        this.ctx.fillRect(x, y + 18, 6, 10);
        this.ctx.fillRect(x + 22, y + 18, 6, 10);

        this.ctx.fillStyle = '#8b4513';
        const walkFrame = Math.floor(this.animTimer / 12) % 2;
        this.ctx.fillRect(x + 6, y + 36, 6, 8 - walkFrame * 2);
        this.ctx.fillRect(x + 16, y + 36, 6, 6 + walkFrame * 2);

        this.ctx.restore();
    }

    drawHammer(h, cameraX) {
        if (!h.alive) return;
        const x = h.x - cameraX;
        const y = h.y;
        this.ctx.save();
        this.ctx.translate(x + h.width / 2, y + h.height / 2);
        this.ctx.rotate((h.animTimer * 0.4) % (Math.PI * 2));
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(-2, -2, 4, 12);
        this.ctx.fillStyle = '#888';
        this.ctx.fillRect(-7, -7, 14, 8);
        this.ctx.fillStyle = '#aaa';
        this.ctx.fillRect(-7, -7, 14, 2);
        this.ctx.fillStyle = '#555';
        this.ctx.fillRect(-7, -1, 14, 2);
        this.ctx.restore();
    }

    drawFireball(fb, cameraX) {
        if (!fb.alive) return;
        const x = fb.x - cameraX;
        const y = fb.y;
        const frame = Math.floor(fb.animTimer / 4) % 2;
        this.ctx.fillStyle = frame === 0 ? '#ff8800' : '#ffee00';
        this.ctx.fillRect(x, y, 10, 10);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(x + 3, y + 3, 4, 4);
    }

    drawPodoboo(pod, cameraX) {
        if (!pod.alive) return;
        const x = pod.x - cameraX;
        const y = pod.y;
        if (pod.state === 'waiting') return; // hidden in lava

        const frame = Math.floor(pod.animTimer / 4) % 2;
        // Fire ball body
        this.ctx.fillStyle = frame === 0 ? '#ff4400' : '#ff8800';
        this.ctx.fillRect(x + 2, y + 2, pod.width - 4, pod.height - 4);
        this.ctx.fillStyle = frame === 0 ? '#ff8800' : '#ffcc00';
        this.ctx.fillRect(x + 6, y + 4, pod.width - 12, pod.height - 8);
        // Eyes
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(x + 6, y + 8, 4, 4);
        this.ctx.fillRect(x + 14, y + 8, 4, 4);
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x + 7, y + 9, 2, 2);
        this.ctx.fillRect(x + 15, y + 9, 2, 2);
        // Glow
        this.ctx.fillStyle = `rgba(255, 100, 0, ${0.2 + frame * 0.1})`;
        this.ctx.beginPath();
        this.ctx.arc(x + pod.width / 2, y + pod.height / 2, 18, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawFireBar(fb, cameraX) {
        if (!fb.alive) return;
        const cx = fb.getCenterX() - cameraX;
        const cy = fb.getCenterY();

        // Center pivot
        this.ctx.fillStyle = '#888';
        this.ctx.fillRect(cx - 4, cy - 4, 8, 8);
        this.ctx.fillStyle = '#aaa';
        this.ctx.fillRect(cx - 3, cy - 3, 6, 2);

        // Fireballs
        for (let i = 0; i < fb.numBalls; i++) {
            const bounds = fb.getBallBounds(i);
            const bx = bounds.x - cameraX;
            const by = bounds.y;
            const frame = Math.floor(fb.animTimer / 3 + i) % 2;
            this.ctx.fillStyle = frame === 0 ? '#ff6600' : '#ffaa00';
            this.ctx.fillRect(bx, by, fb.ballSize, fb.ballSize);
            this.ctx.fillStyle = '#ffee00';
            this.ctx.fillRect(bx + 3, by + 3, fb.ballSize - 6, fb.ballSize - 6);
            // Glow
            this.ctx.fillStyle = 'rgba(255, 100, 0, 0.15)';
            this.ctx.beginPath();
            this.ctx.arc(bx + fb.ballSize / 2, by + fb.ballSize / 2, 10, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawBowser(bowser, cameraX) {
        if (!bowser.alive) return;
        const x = bowser.x - cameraX;
        const y = bowser.y;

        this.ctx.save();
        if (bowser.facingRight) {
            this.ctx.translate(x + bowser.width / 2, 0);
            this.ctx.scale(-1, 1);
            this.ctx.translate(-(x + bowser.width / 2), 0);
        }

        // Body (green)
        this.ctx.fillStyle = '#2d8b2d';
        this.ctx.fillRect(x + 8, y + 20, 48, 36);
        // Shell (dark green with spikes)
        this.ctx.fillStyle = '#1a6b1a';
        this.ctx.fillRect(x + 12, y + 16, 40, 28);
        // Spikes
        this.ctx.fillStyle = '#ff8800';
        for (let i = 0; i < 4; i++) {
            const sx = x + 16 + i * 10;
            this.ctx.fillRect(sx, y + 10, 6, 8);
            this.ctx.fillStyle = '#ffaa00';
            this.ctx.fillRect(sx + 1, y + 11, 4, 4);
            this.ctx.fillStyle = '#ff8800';
        }

        // Head
        this.ctx.fillStyle = '#2d8b2d';
        this.ctx.fillRect(x + 2, y + 2, 28, 22);
        this.ctx.fillStyle = '#3da83d';
        this.ctx.fillRect(x + 4, y + 4, 24, 6);

        // Horns
        this.ctx.fillStyle = '#ff8800';
        this.ctx.fillRect(x + 2, y - 2, 6, 8);
        this.ctx.fillRect(x + 16, y - 2, 6, 8);
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.fillRect(x + 3, y - 1, 4, 4);
        this.ctx.fillRect(x + 17, y - 1, 4, 4);

        // Eyes
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(x + 6, y + 8, 8, 6);
        this.ctx.fillRect(x + 18, y + 8, 8, 6);
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x + 9, y + 9, 4, 4);
        this.ctx.fillRect(x + 21, y + 9, 4, 4);

        // Mouth
        this.ctx.fillStyle = '#a00';
        this.ctx.fillRect(x + 4, y + 16, 24, 4);
        // Teeth
        this.ctx.fillStyle = '#fff';
        for (let t = 0; t < 5; t++) {
            this.ctx.fillRect(x + 5 + t * 5, y + 16, 3, 3);
        }

        // Belly
        this.ctx.fillStyle = '#f8d870';
        this.ctx.fillRect(x + 16, y + 34, 24, 16);
        this.ctx.fillStyle = '#e8c860';
        this.ctx.fillRect(x + 18, y + 36, 20, 12);

        // Arms
        this.ctx.fillStyle = '#2d8b2d';
        this.ctx.fillRect(x - 2, y + 24, 10, 14);
        this.ctx.fillRect(x + 56, y + 24, 10, 14);
        // Claws
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(x - 2, y + 36, 4, 4);
        this.ctx.fillRect(x + 58, y + 36, 4, 4);

        // Legs/feet
        const walkFrame = Math.floor(this.animTimer / 10) % 2;
        this.ctx.fillStyle = '#2d8b2d';
        this.ctx.fillRect(x + 12, y + 52, 12, 12 - walkFrame * 2);
        this.ctx.fillRect(x + 40, y + 52, 12, 10 + walkFrame * 2);
        // Feet claws
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(x + 10, y + 60, 4, 4);
        this.ctx.fillRect(x + 50, y + 60, 4, 4);

        this.ctx.restore();

        // Draw Bowser's fireballs
        for (const fb of bowser.fireballs) {
            if (!fb.alive) continue;
            const fbx = fb.x - cameraX;
            const fby = fb.y;
            const frame = Math.floor(fb.animTimer / 3) % 2;
            this.ctx.fillStyle = frame === 0 ? '#ff4400' : '#ff8800';
            this.ctx.fillRect(fbx, fby, fb.width, fb.height);
            this.ctx.fillStyle = '#ffcc00';
            this.ctx.fillRect(fbx + 3, fby + 2, fb.width - 6, fb.height - 4);
            this.ctx.fillStyle = 'rgba(255, 100, 0, 0.2)';
            this.ctx.beginPath();
            this.ctx.arc(fbx + fb.width / 2, fby + fb.height / 2, 12, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawCoin(coin, cameraX) {
        if (coin.collected && !coin.isPopCoin) return;

        const x = coin.x - cameraX;
        const y = coin.y + (coin.isPopCoin ? 0 : coin.bobOffset);
        const w = coin.width;
        const h = coin.height;

        this.ctx.save();

        if (coin.isPopCoin) {
            this.ctx.globalAlpha = Math.max(0, 1 - coin.popLife / coin.popMaxLife);
        }

        const scaleX = Math.cos(this.animTimer * 0.15);
        const cx = x + w / 2;
        const cy = y + h / 2;

        this.ctx.translate(cx, 0);
        this.ctx.scale(scaleX, 1);
        this.ctx.translate(-cx, 0);

        this.ctx.fillStyle = '#ffd700';
        this.ctx.beginPath();
        this.ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = '#b8860b';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.fillStyle = '#fff5a0';
        this.ctx.beginPath();
        this.ctx.ellipse(cx - 2, cy - 3, w / 5, h / 4, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }
}
