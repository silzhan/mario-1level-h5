function generateLevelMap(level = 1) {
    if (level === 2) {
        return generateLevel2Map();
    }
    return generateLevel1Map();
}

function generateLevel1Map() {
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

// Level 2: Underground - darker theme, more pits, more enemies
function generateLevel2Map() {
    const W = 240;
    const H = 15;
    const level = Array(H).fill(null).map(() => Array(W).fill(0));

    // Ground with more gaps (pits)
    for (let col = 0; col < W; col++) {
        for (let row = 12; row < 15; row++) {
            level[row][col] = 1;
        }
    }

    // Remove ground for pits
    for (let c = 20; c < 25; c++) {
        level[12][c] = 0; level[13][c] = 0; level[14][c] = 0;
    }
    for (let c = 45; c < 50; c++) {
        level[12][c] = 0; level[13][c] = 0; level[14][c] = 0;
    }
    for (let c = 75; c < 82; c++) {
        level[12][c] = 0; level[13][c] = 0; level[14][c] = 0;
    }
    for (let c = 110; c < 118; c++) {
        level[12][c] = 0; level[13][c] = 0; level[14][c] = 0;
    }
    for (let c = 155; c < 162; c++) {
        level[12][c] = 0; level[13][c] = 0; level[14][c] = 0;
    }
    for (let c = 190; c < 196; c++) {
        level[12][c] = 0; level[13][c] = 0; level[14][c] = 0;
    }
    for (let c = 215; c < 220; c++) {
        level[12][c] = 0; level[13][c] = 0; level[14][c] = 0;
    }

    // Underground platforms and blocks
    level[9][10] = 3; level[9][11] = 3; level[9][12] = 3;
    level[9][15] = 2; level[9][16] = 2; level[9][17] = 2;

    // Pipe at col 28-29
    level[9][28] = 4; level[9][29] = 5;
    level[10][28] = 6; level[10][29] = 7;
    level[11][28] = 6; level[11][29] = 7;

    // Staircase after first pit
    for (let step = 0; step < 5; step++) {
        const stepCol = 35 + step * 2;
        const stepHeight = step + 1;
        for (let c = stepCol; c < stepCol + 1; c++) {
            for (let r = 12 - stepHeight; r < 12; r++) {
                if (r >= 0) level[r][c] = 2;
            }
        }
    }

    // Question blocks at height 6
    level[6][55] = 3;
    level[6][56] = 3;
    level[6][57] = 2;
    level[6][58] = 2;

    // High platform
    level[5][62] = 2; level[5][63] = 2; level[5][64] = 2;
    level[4][65] = 3; level[4][66] = 3;

    // Tall pipe
    level[7][72] = 4; level[7][73] = 5;
    for (let r = 8; r < 12; r++) {
        level[r][72] = 6; level[r][73] = 7;
    }

    // Staircase down then up
    for (let step = 0; step < 3; step++) {
        for (let c = 85 + step; c < 85 + step + 1; c++) {
            for (let r = 12 - (step + 1); r < 12; r++) {
                if (r >= 0) level[r][c] = 2;
            }
        }
    }
    for (let step = 0; step < 3; step++) {
        for (let c = 90 + step; c < 90 + step + 1; c++) {
            for (let r = 9 + step; r < 12; r++) {
                if (r >= 0) level[r][c] = 2;
            }
        }
    }

    // Question blocks row
    level[9][95] = 3; level[9][96] = 2; level[9][97] = 3;
    level[9][98] = 2; level[9][99] = 3;

    // Brick staircase before flagpole
    for (let step = 0; step < 8; step++) {
        const stepCol = 130 + step * 2;
        const stepHeight = step + 1;
        for (let c = stepCol; c < stepCol + 1; c++) {
            for (let r = 12 - stepHeight; r < 12; r++) {
                if (r >= 0) level[r][c] = 2;
            }
        }
    }

    // Flagpole
    for (let row = 3; row < 12; row++) {
        level[row][148] = 9;
    }

    // Castle
    for (let c = 153; c <= 161; c++) {
        for (let r = 8; r < 12; r++) {
            level[r][c] = 2;
        }
    }
    for (let c = 153; c <= 161; c += 2) {
        level[7][c] = 2;
    }
    level[6][155] = 2; level[6][156] = 2;
    level[6][157] = 2; level[6][158] = 2;
    level[6][159] = 2;

    // Ground fill (avoiding pits)
    const fillBetween = (fromCol, toCol) => {
        for (let c = fromCol; c <= toCol; c++) {
            if (c >= 0 && c < W) level[11][c] = 1;
        }
    };
    fillBetween(0, 14);
    fillBetween(18, 27);
    fillBetween(30, 40);
    fillBetween(50, 70);
    fillBetween(74, 84);
    fillBetween(100, 109);
    fillBetween(118, 145);
    fillBetween(162, 189);
    fillBetween(197, 209);
    fillBetween(221, 239);

    // Castle door
    level[11][156] = 0; level[11][157] = 0;
    level[10][156] = 0; level[10][157] = 0;

    return level;
}
