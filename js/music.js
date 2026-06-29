class Music {
    constructor() {
        this.ctx = null;
        this.playing = false;
        this.gainNode = null;
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.value = 0.3;
        this.gainNode.connect(this.ctx.destination);
    }

    // 简单的方波音符
    playNote(freq, startTime, duration, type = 'square') {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(this.gainNode);
        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    // 超级马里奥主题旋律（简化版）
    playOverworld() {
        this.init();
        if (this.playing) return;
        this.playing = true;

        const bpm = 200;
        const beat = 60 / bpm;

        // E5 E5 R E5 R C5 E5 R G5 R R R G4 R R R
        const melody = [
            [659.25, beat], [659.25, beat], [0, beat], [659.25, beat],
            [0, beat], [523.25, beat], [659.25, beat], [0, beat],
            [783.99, beat*2], [0, beat], [392, beat*2],
            [0, beat*2],

            // C5 R R G4 R R E4 R R A4 R B4 R Bb4 A4 R
            [523.25, beat], [0, beat], [392, beat*2],
            [0, beat], [329.63, beat*2],
            [0, beat], [440, beat], [0, beat],
            [493.88, beat], [0, beat/2], [466.16, beat/2], [440, beat],
            [0, beat],

            // E5 R G5 A5 R F5 G5 R E5 R C5 D5 B4 R R R
            [659.25, beat], [0, beat], [783.99, beat], [880, beat],
            [0, beat], [698.46, beat], [783.99, beat], [0, beat],
            [659.25, beat], [0, beat], [523.25, beat], [587.33, beat],
            [493.88, beat*2],
            [0, beat*2],
        ];

        let t = this.ctx.currentTime + 0.1;
        melody.forEach(([freq, dur]) => {
            if (freq > 0) {
                this.playNote(freq, t, dur * 0.9);
            }
            t += dur;
        });

        // 循环播放
        const totalDuration = melody.reduce((sum, [, dur]) => sum + dur, 0);
        this.currentTrack = 'playOverworld';
        this.loopDuration = totalDuration * 1000;
        this.loopScheduledAt = performance.now() + this.loopDuration;
        this.loopTimer = setTimeout(() => {
            this.playing = false;
            this.playOverworld();
        }, totalDuration * 1000);
    }

    playUnderground() {
        this.init();
        if (this.playing) return;
        this.playing = true;

        const bpm = 140;
        const beat = 60 / bpm;

        const melody = [
            [329.63, beat], [0, beat/2], [392, beat], [0, beat/2],
            [329.63, beat], [0, beat/2], [293.66, beat], [0, beat/2],
            [261.63, beat*2], [0, beat],
            [293.66, beat], [0, beat/2], [329.63, beat], [0, beat/2],
            [293.66, beat], [0, beat/2], [261.63, beat], [0, beat/2],
            [246.94, beat*2], [0, beat],

            [329.63, beat], [0, beat/2], [392, beat], [0, beat/2],
            [440, beat], [0, beat/2], [493.88, beat], [0, beat/2],
            [523.25, beat*2], [0, beat],
            [493.88, beat], [0, beat/2], [440, beat], [0, beat/2],
            [392, beat], [0, beat/2], [329.63, beat], [0, beat/2],
            [261.63, beat*2], [0, beat],
        ];

        let t = this.ctx.currentTime + 0.1;
        melody.forEach(([freq, dur]) => {
            if (freq > 0) {
                this.playNote(freq, t, dur * 0.85, 'triangle');
            }
            t += dur;
        });

        const totalDuration = melody.reduce((sum, [, dur]) => sum + dur, 0);
        this.currentTrack = 'playUnderground';
        this.loopDuration = totalDuration * 1000;
        this.loopScheduledAt = performance.now() + this.loopDuration;
        this.loopTimer = setTimeout(() => {
            this.playing = false;
            this.playUnderground();
        }, totalDuration * 1000);
    }

    playAthletic() {
        this.init();
        if (this.playing) return;
        this.playing = true;

        const bpm = 180;
        const beat = 60 / bpm;

        const melody = [
            [659.25, beat / 2], [783.99, beat / 2], [880, beat], [0, beat / 2],
            [783.99, beat / 2], [659.25, beat], [0, beat / 2],
            [523.25, beat / 2], [587.33, beat / 2], [659.25, beat], [0, beat / 2],
            [587.33, beat / 2], [523.25, beat], [493.88, beat], [0, beat],

            [523.25, beat / 2], [659.25, beat / 2], [783.99, beat], [0, beat / 2],
            [880, beat / 2], [987.77, beat], [880, beat / 2], [783.99, beat / 2],
            [659.25, beat * 1.5], [0, beat / 2],
            [659.25, beat / 2], [783.99, beat], [0, beat],

            [880, beat], [783.99, beat / 2], [659.25, beat / 2], [587.33, beat], [0, beat / 2],
            [659.25, beat / 2], [783.99, beat / 2], [880, beat], [0, beat / 2],
            [987.77, beat], [880, beat / 2], [783.99, beat / 2], [659.25, beat * 2],
            [0, beat],
        ];

        let t = this.ctx.currentTime + 0.1;
        melody.forEach(([freq, dur]) => {
            if (freq > 0) {
                this.playNote(freq, t, dur * 0.9, 'square');
            }
            t += dur;
        });

        const totalDuration = melody.reduce((sum, [, dur]) => sum + dur, 0);
        this.currentTrack = 'playAthletic';
        this.loopDuration = totalDuration * 1000;
        this.loopScheduledAt = performance.now() + this.loopDuration;
        this.loopTimer = setTimeout(() => {
            this.playing = false;
            this.playAthletic();
        }, totalDuration * 1000);
    }

    playCastle() {
        this.init();
        if (this.playing) return;
        this.playing = true;

        const bpm = 160;
        const beat = 60 / bpm;

        // Dark, ominous castle melody — Koopa's Castle style
        const melody = [
            // Low ominous intro
            [196, beat], [0, beat/2], [185, beat], [0, beat/2],
            [174.61, beat*2], [0, beat],
            [164.81, beat], [0, beat/2], [174.61, beat], [0, beat/2],
            [185, beat*2], [0, beat],

            // Tense rising section
            [220, beat], [0, beat/2], [207.65, beat], [0, beat/2],
            [196, beat], [0, beat/2], [185, beat], [0, beat/2],
            [174.61, beat*2], [0, beat],
            [196, beat], [0, beat/2], [220, beat], [0, beat/2],
            [261.63, beat*2], [0, beat],

            // Descending dread
            [246.94, beat], [0, beat/4], [233.08, beat], [0, beat/4],
            [220, beat], [0, beat/4], [196, beat], [0, beat/4],
            [174.61, beat*2], [0, beat],
            [164.81, beat], [0, beat/2], [174.61, beat], [0, beat/2],
            [196, beat*2], [0, beat*2],
        ];

        let t = this.ctx.currentTime + 0.1;
        melody.forEach(([freq, dur]) => {
            if (freq > 0) {
                this.playNote(freq, t, dur * 0.85, 'triangle');
                // Add bass drone
                this.playNote(freq / 2, t, dur * 0.9, 'sawtooth');
            }
            t += dur;
        });

        const totalDuration = melody.reduce((sum, [, dur]) => sum + dur, 0);
        this.currentTrack = 'playCastle';
        this.loopDuration = totalDuration * 1000;
        this.loopScheduledAt = performance.now() + this.loopDuration;
        this.loopTimer = setTimeout(() => {
            this.playing = false;
            this.playCastle();
        }, totalDuration * 1000);
    }

    playBoss() {
        this.init();
        if (this.playing) return;
        this.playing = true;

        const bpm = 200;
        const beat = 60 / bpm;

        // Fast, urgent boss music
        const melody = [
            [330, beat/2], [330, beat/2], [0, beat/4], [330, beat/2], [0, beat/4],
            [262, beat/2], [330, beat/2], [0, beat/4], [392, beat], [0, beat/2],

            [196, beat], [0, beat/2],
            [262, beat/2], [0, beat/4], [330, beat/2], [0, beat/4],
            [392, beat/2], [0, beat/4], [523, beat], [0, beat/2],

            [392, beat/2], [0, beat/4], [349.23, beat/2], [0, beat/4],
            [330, beat/2], [0, beat/4], [262, beat/2], [0, beat/4],
            [220, beat], [0, beat/2],
            [246.94, beat/2], [0, beat/4], [277.18, beat/2], [0, beat/4],
            [311.13, beat], [0, beat],

            [330, beat/2], [0, beat/4], [330, beat/2], [0, beat/4],
            [330, beat/2], [0, beat/4], [262, beat/2], [0, beat/4],
            [392, beat/2], [0, beat/4], [392, beat/2], [0, beat/4],
            [440, beat/2], [0, beat/4], [392, beat/2], [0, beat/4],
            [330, beat], [0, beat],
        ];

        let t = this.ctx.currentTime + 0.1;
        melody.forEach(([freq, dur]) => {
            if (freq > 0) {
                this.playNote(freq, t, dur * 0.8, 'square');
                this.playNote(freq * 0.5, t, dur * 0.9, 'sawtooth');
            }
            t += dur;
        });

        const totalDuration = melody.reduce((sum, [, dur]) => sum + dur, 0);
        this.currentTrack = 'playBoss';
        this.loopDuration = totalDuration * 1000;
        this.loopScheduledAt = performance.now() + this.loopDuration;
        this.loopTimer = setTimeout(() => {
            this.playing = false;
            this.playBoss();
        }, totalDuration * 1000);
    }

    // 跳跃音效
    jump() {
        this.init();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.1);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(this.gainNode);
        osc.start(t);
        osc.stop(t + 0.15);
    }

    // 弹簧音效
    spring() {
        this.init();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(900, t + 0.2);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain);
        gain.connect(this.gainNode);
        osc.start(t);
        osc.stop(t + 0.25);
    }

    // 吃金币音效
    coin() {
        this.init();
        const t = this.ctx.currentTime;
        [987.77, 1318.51].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.15, t + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.1);
            osc.connect(gain);
            gain.connect(this.gainNode);
            osc.start(t + i * 0.08);
            osc.stop(t + i * 0.08 + 0.1);
        });
    }

    // 吃蘑菇音效
    powerup() {
        this.init();
        const t = this.ctx.currentTime;
        [523, 659, 784, 1047].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.15, t + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.15);
            osc.connect(gain);
            gain.connect(this.gainNode);
            osc.start(t + i * 0.1);
            osc.stop(t + i * 0.1 + 0.15);
        });
    }

    // 受伤音效
    hurt() {
        this.init();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.3);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.connect(gain);
        gain.connect(this.gainNode);
        osc.start(t);
        osc.stop(t + 0.3);
    }

    // 死亡音效
    die() {
        this.init();
        if (this.loopTimer) {
            clearTimeout(this.loopTimer);
            this.loopTimer = null;
        }
        this.playing = false;
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        const t = this.ctx.currentTime;
        [494, 440, 370, 330, 262].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.35, t + i * 0.18);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.18 + 0.25);
            osc.connect(gain);
            gain.connect(this.gainNode);
            osc.start(t + i * 0.18);
            osc.stop(t + i * 0.18 + 0.25);
        });
    }

    // 过关音效
    levelClear() {
        this.init();
        const t = this.ctx.currentTime;
        [523, 659, 784, 1047, 784, 1047].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.15, t + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.2);
            osc.connect(gain);
            gain.connect(this.gainNode);
            osc.start(t + i * 0.12);
            osc.stop(t + i * 0.12 + 0.2);
        });
    }

    pipeEnter() {
        this.init();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.linearRampToValueAtTime(200, t + 0.3);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(this.gainNode);
        osc.start(t);
        osc.stop(t + 0.35);
    }

    pipeExit() {
        this.init();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.linearRampToValueAtTime(600, t + 0.3);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(this.gainNode);
        osc.start(t);
        osc.stop(t + 0.35);
    }

    fireball() {
        this.init();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(900, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.08);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.connect(gain);
        gain.connect(this.gainNode);
        osc.start(t);
        osc.stop(t + 0.1);
    }

    oneUp() {
        this.init();
        const t = this.ctx.currentTime;
        [330, 392, 523, 659, 784].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.15, t + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.12);
            osc.connect(gain);
            gain.connect(this.gainNode);
            osc.start(t + i * 0.08);
            osc.stop(t + i * 0.08 + 0.12);
        });
    }

    playStar() {
        this.init();
        const t = this.ctx.currentTime;
        const melody = [784, 880, 988, 1047, 988, 880, 784, 880];
        melody.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.1, t + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.12);
            osc.connect(gain);
            gain.connect(this.gainNode);
            osc.start(t + i * 0.1);
            osc.stop(t + i * 0.1 + 0.12);
        });
    }

    bridgeBreak() {
        this.init();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.3);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(this.gainNode);
        osc.start(t);
        osc.stop(t + 0.35);
    }

    axeGrab() {
        this.init();
        const t = this.ctx.currentTime;
        [880, 1175, 1320].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.18, t + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.12);
            osc.connect(gain);
            gain.connect(this.gainNode);
            osc.start(t + i * 0.06);
            osc.stop(t + i * 0.06 + 0.12);
        });
    }

    bowserFall() {
        this.init();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.8);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
        osc.connect(gain);
        gain.connect(this.gainNode);
        osc.start(t);
        osc.stop(t + 0.9);
    }

    podobooLaunch() {
        this.init();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain);
        gain.connect(this.gainNode);
        osc.start(t);
        osc.stop(t + 0.12);
    }

    stop() {
        if (this.loopTimer) {
            clearTimeout(this.loopTimer);
            this.loopTimer = null;
        }
        this.playing = false;
        this.currentTrack = null;
        this.loopScheduledAt = 0;
        this.loopDuration = 0;
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    pause() {
        if (!this.ctx || !this.playing) return;
        if (this.loopTimer) {
            clearTimeout(this.loopTimer);
            this.loopTimer = null;
        }
        const now = performance.now();
        this.remainingToLoop = Math.max(0, this.loopScheduledAt + this.loopDuration - now);
        if (this.ctx.state === 'running') {
            this.ctx.suspend().catch(() => {});
        }
    }

    resume() {
        if (!this.ctx || !this.playing) return;
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        if (this.currentTrack && !this.loopTimer) {
            const delay = this.remainingToLoop > 0 ? this.remainingToLoop : 0;
            this.loopScheduledAt = performance.now() + delay;
            const trackName = this.currentTrack;
            this.loopTimer = setTimeout(() => {
                this.playing = false;
                this[trackName]();
            }, delay);
        }
    }
}

window.music = new Music();
