function generateLevelMap() {
    const W = 210;
    const H = 15;
    const level = Array(H).fill(null).map(() => Array(W).fill(0));

    for (let col = 0; col < W; col++) {
        for (let row = 12; row < 15; row++) {
            level[row][col] = 1;
        }
    }

    level[9][16] = 3;
    level[9][20] = 3;
    level[9][22] = 3;

    level[9][18] = 2;
    level[9][19] = 2;
    level[9][21] = 2;

    level[9][26] = 4;
    level[9][27] = 5;
    level[10][26] = 6;
    level[10][27] = 7;
    level[11][26] = 6;
    level[11][27] = 7;

    level[9][31] = 3;

    level[8][32] = 2;
    level[8][33] = 2;
    level[8][34] = 2;
    level[8][35] = 2;

    level[8][48] = 4;
    level[8][49] = 5;
    level[9][48] = 6;
    level[9][49] = 7;
    level[10][48] = 6;
    level[10][49] = 7;
    level[11][48] = 6;
    level[11][49] = 7;

    level[9][54] = 3;
    level[9][55] = 2;
    level[9][56] = 2;
    level[9][57] = 2;

    level[9][61] = 3;
    level[9][62] = 3;
    level[9][63] = 3;

    level[8][68] = 4;
    level[8][69] = 5;
    level[9][68] = 6;
    level[9][69] = 7;
    level[10][68] = 6;
    level[10][69] = 7;
    level[11][68] = 6;
    level[11][69] = 7;

    for (let step = 0; step < 4; step++) {
        const stepCol = 91 + step * 3;
        const stepHeight = step + 1;
        for (let c = stepCol; c < stepCol + 2; c++) {
            for (let r = 12 - stepHeight; r < 12; r++) {
                if (r >= 0) level[r][c] = 2;
            }
        }
    }

    level[7][106] = 4;
    level[7][107] = 5;
    for (let r = 8; r < 12; r++) {
        level[r][106] = 6;
        level[r][107] = 7;
    }
    level[11][106] = 6;
    level[11][107] = 7;

    level[9][112] = 3;
    level[9][113] = 2;
    level[9][114] = 2;
    level[9][115] = 2;

    level[9][118] = 2;
    level[9][119] = 2;
    level[9][120] = 2;

    // Ascending stairs before flagpole (cols 141-148)
    for (let step = 0; step < 4; step++) {
        const stepCol = 141 + step * 2;
        const stepHeight = step + 1;
        for (let c = stepCol; c < stepCol + 1; c++) {
            for (let r = 12 - stepHeight; r < 12; r++) {
                if (r >= 0) level[r][c] = 2;
            }
        }
    }

    for (let row = 4; row < 12; row++) {
        level[row][155] = 9;
    }

    // Castle (cols 160-168)
    for (let c = 160; c <= 168; c++) {
        for (let r = 8; r < 12; r++) {
            level[r][c] = 2;
        }
    }
    for (let c = 160; c <= 168; c += 2) {
        level[7][c] = 2;
    }
    level[6][162] = 2;
    level[6][163] = 2;
    level[6][164] = 2;
    level[6][165] = 2;
    level[6][166] = 2;

    const fillRow11Between = (fromCol, toCol) => {
        for (let c = fromCol; c <= toCol; c++) {
            if (c >= 0 && c < W) level[11][c] = 1;
        }
    };
    fillRow11Between(28, 47);
    fillRow11Between(50, 67);
    fillRow11Between(70, 105);
    fillRow11Between(108, 209);

    // Castle door (after ground fill to avoid overwrite)
    level[11][163] = 0;
    level[11][164] = 0;
    level[10][163] = 0;
    level[10][164] = 0;

    return level;
}
