class GameState {
    constructor() {
        this.PLAYING = 0;
        this.WIN = 1;
        this.DEAD = 2;
        this.FLAGPOLE = 3;
        this.LEVEL_TRANSITION = 4;
        this.state = this.PLAYING;

        this.currentLevel = 1;
        this.totalLevels = 2;
        this.levelScore = 0;
    }
}
