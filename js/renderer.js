class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.sprites = {};
        this.loaded = false;
        this.animTimer = 0;
        this.currentLevel = 1;
    }

    async loadSprites() {
        const spriteList = {
            'mario-idle': 'img/mario-idle.png',
            'mario-walk': 'img/mario-walk.png',
            'mario-jump': 'img/mario-jump.png',
            'goomba': 'img/goomba.png',
            'coin': 'img/coin.png',
            'ground': 'img/ground.png',
            'brick': 'img/brick.png',
            'stair': 'img/stair.png',
            'question': 'img/question-block.png',
            'used': 'img/used-block.png',
            'pipe': 'img/pipe.png',
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
    }

    setLevel(level) {
        this.currentLevel = level;
    }

    clear() {
        if (this.currentLevel === 2) {
            // Underground theme - dark blue/black
            this.ctx.fillStyle = '#1a0a2e';
            this.ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);

            // Add some underground atmosphere
            this.ctx.fillStyle = 'rgba(0, 0, 30, 0.3)';
            for (let i = 0; i < 5; i++) {
                const x = (this.animTimer * 0.2 + i * 200) % (CONFIG.SCREEN_WIDTH + 100) - 50;
                const y = 100 + i * 120;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 30, 0, Math.PI * 2);
                this.ctx.fill();
            }
        } else {
            // Day theme
            this.ctx.fillStyle = '#5c94fc';
            this.ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);

            // Clouds
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let i = 0; i < 3; i++) {
                const cloudX = ((this.animTimer * 0.3 + i * 300) % (CONFIG.SCREEN_WIDTH + 200)) - 100;
                const cloudY = 80 + i * 60;
                this.ctx.beginPath();
                this.ctx.arc(cloudX, cloudY, 20, 0, Math.PI * 2);
                this.ctx.arc(cloudX + 25, cloudY - 5, 25, 0, Math.PI * 2);
                this.ctx.arc(cloudX + 50, cloudY, 20, 0, Math.PI * 2);
                this.ctx.fill();
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

                const x = col * CONFIG.TILE_SIZE - cameraX;
                const y = row * CONFIG.TILE_SIZE;
                const T = CONFIG.TILE_SIZE;

                switch (tile) {
                    case 1:
                        if (row === 0 || levelMap[row - 1][col] === 0) {
                            this.ctx.fillStyle = '#4cad4c';
                            this.ctx.fillRect(x, y, T, T);
                            this.ctx.fillStyle = '#5cbf5c';
                            this.ctx.fillRect(x, y, T, 6);
                            this.ctx.fillStyle = '#3d8b3d';
                            for (let gx = x + 2; gx < x + T; gx += 6) {
                                this.ctx.fillRect(gx, y + 6, 2, 4);
                            }
                            this.ctx.fillStyle = '#c8641e';
                            this.ctx.fillRect(x, y + 14, T, T - 14);
                        } else {
                            this.ctx.fillStyle = '#c8641e';
                            this.ctx.fillRect(x, y, T, T);
                            this.ctx.fillStyle = '#b5571a';
                            this.ctx.fillRect(x + 4, y + 4, 8, 8);
                            this.ctx.fillRect(x + 18, y + 16, 10, 8);
                        }
                        break;

                    case 2:
                        this.ctx.fillStyle = '#c84c0c';
                        this.ctx.fillRect(x, y, T, T);
                        this.ctx.fillStyle = '#e09050';
                        this.ctx.fillRect(x, y, T, 2);
                        this.ctx.fillRect(x, y, 2, T / 2);
                        this.ctx.fillRect(x + T / 2, y + T / 2, 2, T / 2);
                        this.ctx.fillStyle = '#983808';
                        this.ctx.fillRect(x, y + T / 2 - 1, T, 2);
                        this.ctx.fillRect(x + T / 2 - 1, y, 2, T / 2);
                        this.ctx.fillRect(x + T - 1, y + T / 2, 1, T / 2);
                        this.ctx.fillRect(x - 1, y + T / 2, 1, T / 2);
                        break;

                    case 3:
                        const pulse = Math.sin(this.animTimer * 0.08) * 0.1 + 0.9;
                        this.ctx.fillStyle = `rgb(${Math.floor(255 * pulse)}, ${Math.floor(200 * pulse)}, 0)`;
                        this.ctx.fillRect(x, y, T, T);
                        this.ctx.fillStyle = '#b8860b';
                        this.ctx.fillRect(x, y, T, 2);
                        this.ctx.fillRect(x, y, 2, T);
                        this.ctx.fillRect(x + T - 2, y, 2, T);
                        this.ctx.fillRect(x, y + T - 2, T, 2);
                        this.ctx.fillStyle = '#fff';
                        this.ctx.font = 'bold 18px monospace';
                        this.ctx.textAlign = 'center';
                        this.ctx.textBaseline = 'middle';
                        this.ctx.fillText('?', x + T / 2, y + T / 2 + 1);
                        this.ctx.fillStyle = '#8b6914';
                        this.ctx.fillRect(x + 4, y + 4, 3, 3);
                        this.ctx.fillRect(x + T - 7, y + 4, 3, 3);
                        this.ctx.fillRect(x + 4, y + T - 7, 3, 3);
                        this.ctx.fillRect(x + T - 7, y + T - 7, 3, 3);
                        break;

                    case 4:
                        this.ctx.fillStyle = '#2e8b2e';
                        this.ctx.fillRect(x, y + 8, T * 2, T * 2 - 8);
                        this.ctx.fillStyle = '#3cb43c';
                        this.ctx.fillRect(x + 4, y + 8, 8, T * 2 - 8);
                        this.ctx.fillStyle = '#1a6b1a';
                        this.ctx.fillRect(x + T * 2 - 6, y + 8, 6, T * 2 - 8);
                        this.ctx.fillStyle = '#2e8b2e';
                        this.ctx.fillRect(x - 4, y, T * 2 + 8, 12);
                        this.ctx.fillStyle = '#3cb43c';
                        this.ctx.fillRect(x - 4, y, T * 2 + 8, 3);
                        this.ctx.fillStyle = '#1a6b1a';
                        this.ctx.fillRect(x - 4, y + 9, T * 2 + 8, 3);
                        break;
                    case 5:
                        break;
                    case 6:
                        this.ctx.fillStyle = '#2e8b2e';
                        this.ctx.fillRect(x, y, T, T);
                        this.ctx.fillStyle = '#3cb43c';
                        this.ctx.fillRect(x + 4, y, 8, T);
                        this.ctx.fillStyle = '#1a6b1a';
                        this.ctx.fillRect(x + T - 4, y, 4, T);
                        break;
                    case 7:
                        this.ctx.fillStyle = '#2e8b2e';
                        this.ctx.fillRect(x, y, T, T);
                        this.ctx.fillStyle = '#1a6b1a';
                        this.ctx.fillRect(x, y, 4, T);
                        this.ctx.fillStyle = '#3cb43c';
                        this.ctx.fillRect(x + T - 12, y, 8, T);
                        break;

                    case 8:
                        this.ctx.fillStyle = '#8b7355';
                        this.ctx.fillRect(x, y, T, T);
                        this.ctx.fillStyle = '#6b5335';
                        this.ctx.fillRect(x, y, T, 2);
                        this.ctx.fillRect(x, y, 2, T);
                        this.ctx.fillRect(x + T - 2, y, 2, T);
                        this.ctx.fillRect(x, y + T - 2, T, 2);
                        this.ctx.fillStyle = '#a08060';
                        this.ctx.fillRect(x + 4, y + 4, T - 8, T - 8);
                        break;

                    case 9:
                        this.ctx.fillStyle = '#aaaaaa';
                        this.ctx.fillRect(x + 14, y, 4, T);
                        if (row === 4) {
                            this.ctx.fillStyle = '#ffd700';
                            this.ctx.beginPath();
                            this.ctx.arc(x + 16, y + 4, 4, 0, Math.PI * 2);
                            this.ctx.fill();
                        }
                        break;
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
        // 无敌闪烁效果
        if (player.isInvincible && player.invincibleTimer > 0) {
            if (Math.floor(player.invincibleTimer / 4) % 2 === 0) {
                return; // 跳过这一帧，产生闪烁
            }
        }

        const x = player.x - cameraX;
        const y = player.y;
        const T = CONFIG.TILE_SIZE;

        let sprite;
        if (!player.onGround) {
            sprite = this.sprites['mario-jump'];
        } else if (Math.abs(player.velX) > 0.5) {
            const walkFrame = Math.floor(this.animTimer / 8) % 2;
            sprite = walkFrame === 0 ? this.sprites['mario-walk'] : this.sprites['mario-idle'];
        } else {
            sprite = this.sprites['mario-idle'];
        }

        if (!sprite) {
            // Fallback: 绘制像素马里奥
            this.ctx.fillStyle = COLORS.MARIO_RED;
            this.ctx.fillRect(x, y, player.width, player.height);
            this.ctx.fillStyle = COLORS.MARIO_SKIN;
            this.ctx.fillRect(x + 4, y + 4, player.width - 8, 10);
            this.ctx.fillStyle = COLORS.MARIO_BLUE;
            this.ctx.fillRect(x + 2, y + 14, player.width - 4, 12);
            return;
        }

        this.ctx.save();
        if (!player.facingRight) {
            this.ctx.translate(x + player.width / 2, 0);
            this.ctx.scale(-1, 1);
            this.ctx.translate(-(x + player.width / 2), 0);
        }

        if (player.isBig) {
            // 大马里奥：整体放大 + 绘制身体下半部分
            const scale = player.height / T; // 56/32 = 1.75
            const bigW = T * scale;
            const bigH = player.height;
            // 放大绘制上半身
            this.ctx.drawImage(sprite, x - 4, y - 4, bigW, bigH * 0.55);
            // 绘制裤腿
            this.ctx.fillStyle = COLORS.MARIO_BLUE;
            this.ctx.fillRect(x + 2, y + bigH * 0.5, bigW - 4, bigH * 0.35);
            // 鞋子
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(x, y + bigH - 6, 10, 6);
            this.ctx.fillRect(x + bigW - 10, y + bigH - 6, 10, 6);
        } else {
            this.ctx.drawImage(sprite, x - 2, y - 2, T, T);
        }

        this.ctx.restore();
    }

    drawMushroom(mushroom, cameraX) {
        if (!mushroom.alive) return;

        const x = mushroom.x - cameraX;
        const y = mushroom.y;
        const T = CONFIG.TILE_SIZE;
        const mw = mushroom.width;
        const mh = mushroom.height;

        // 蘑菇伞盖 (半圆)
        this.ctx.fillStyle = '#e52521';
        this.ctx.beginPath();
        this.ctx.ellipse(x + mw / 2, y + 8, mw / 2 + 1, mh / 2 - 2, 0, Math.PI, 0);
        this.ctx.fill();

        // 白色斑点
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(x + mw / 2 - 5, y + 5, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x + mw / 2 + 5, y + 5, 3, 0, Math.PI * 2);
        this.ctx.fill();

        // 蘑菇柄
        this.ctx.fillStyle = '#f5d6a8';
        this.ctx.fillRect(x + 5, y + 10, mw - 10, mh - 12);

        // 眼睛
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(x + 9, y + 16, 2, 0, Math.PI * 2);
        this.ctx.arc(x + mw - 9, y + 16, 2, 0, Math.PI * 2);
        this.ctx.fill();

        // 脚
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x + 6, y + mh - 4, 3, 4);
        this.ctx.fillRect(x + mw - 9, y + mh - 4, 3, 4);
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
