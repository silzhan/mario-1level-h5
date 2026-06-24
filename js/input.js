class InputHandler {
    constructor(canvas) {
        this.keys = {
            left: false,
            right: false,
            jump: false
        };
        this._canvas = canvas;
        this._player = null;
        this._onReset = null;
        this.setupListeners();
    }

    setPlayer(player) {
        this._player = player;
    }

    setResetCallback(fn) {
        this._onReset = fn;
    }

    setupListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keys.left = true;
                e.preventDefault();
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keys.right = true;
                e.preventDefault();
            }
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                this.keys.jump = true;
                e.preventDefault();
            }
            if (e.key === 'r' || e.key === 'R') {
                if (this._onReset) this._onReset();
                e.preventDefault();
            }
            if (e.key === 'Escape') {
                window.close();
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keys.left = false;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keys.right = false;
            }
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                this.keys.jump = false;
                if (this._player) {
                    this._player.jumpWasPressed = false;
                    this._player.jumpKeyReleased = true;
                }
            }
        });

        this._canvas.addEventListener('click', () => {
            this._canvas.focus();
        });

        this._canvas.tabIndex = 0;
        this._canvas.focus();

        document.addEventListener('contextmenu', e => e.preventDefault());
    }
}
