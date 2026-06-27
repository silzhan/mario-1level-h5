function generateLevelMap(level = 1) {
    if (level === 3) {
        return generateLevel3Map();
    }
    if (level === 2) {
        return generateLevel2Map();
    }
    return generateLevel1Map();
}

function generateLevel1Map() {
    const W = 210;
    const H = 15;
    const level = Array(H).fill(null).map(() => Array(W).fill(0));
    const Q = 3;    // question block
    const B = 2;    // brick
    const HIDE = 14; // hidden block

    const fill = (r1, c1, r2, c2, type) => {
        for (let r = r1; r <= r2; r++)
            for (let c = c1; c <= c2; c++)
                if (r >= 0 && r < H && c >= 0 && c < W) level[r][c] = type;
    };

    const pipe = (topRow, col) => {
        level[topRow][col] = 4; level[topRow][col + 1] = 5;
        for (let r = topRow + 1; r < 12; r++) {
            level[r][col] = 6; level[r][col + 1] = 7;
        }
    };

    // === GROUND (rows 12-14) ===
    fill(12, 0, 14, W - 1, 1);

    // === PITS (3 pits, 2 cols each — jumpable) ===
    const pits = [[69,70],[86,87],[153,154]];
    for (const [s, e] of pits) {
        for (let c = s; c <= e; c++) {
            level[12][c] = 0; level[13][c] = 0; level[14][c] = 0;
        }
    }

    // === SECTION 1: Tutorial area (cols 0-25) ===
    // First question block — teaches "hit from below"
    level[9][16] = Q;
    // Brick + question row — teaches brick vs question
    level[9][20] = B; level[9][21] = Q; level[9][22] = B; level[9][23] = Q; level[9][24] = B;
    // Hidden 1UP block above the question blocks
    level[5][22] = HIDE;

    // === SECTION 2: First pipe + blocks (cols 26-50) ===
    pipe(9, 28);  // 3-tile pipe
    // Elevated bricks with question block
    level[9][38] = Q;
    level[5][38] = Q;  // high question block (star)
    fill(8, 40, 8, 43, B);
    level[8][41] = Q;

    // Second pipe — slightly taller feel but still 3 tiles
    pipe(9, 48);

    // === SECTION 3: Running section (cols 52-68) ===
    level[9][54] = Q; level[9][55] = B; level[9][56] = B;
    level[5][55] = Q;  // high question block (fire flower)
    // Brick row overhead
    fill(9, 60, 9, 63, B);
    level[9][61] = Q;

    // === SECTION 4: Pit zone (cols 69-88) ===
    // Pit at 69-70
    // Platform over pit area
    fill(10, 72, 10, 75, B);
    level[10][73] = Q;
    // Pit at 86-87
    fill(9, 78, 9, 80, B);
    level[9][79] = Q;
    level[9][83] = B; level[9][84] = Q; level[9][85] = B;

    // === SECTION 5: Brick maze (cols 89-120) ===
    // Third pipe
    pipe(9, 90);

    // Brick corridor with questions
    fill(9, 94, 9, 100, B);
    level[9][95] = Q; level[9][97] = Q; level[9][99] = Q;
    // Upper brick row
    fill(6, 96, 6, 99, B);
    level[6][97] = HIDE;  // hidden block with star

    level[9][105] = B; level[9][106] = Q; level[9][107] = B;
    fill(9, 110, 9, 115, B);
    level[9][112] = Q; level[9][114] = Q;

    // === SECTION 6: Open run (cols 121-150) ===
    level[9][125] = Q;
    fill(9, 128, 9, 130, B);
    level[9][129] = Q;
    level[9][135] = B; level[9][136] = Q; level[9][137] = B;
    // Pit at 153-154
    fill(9, 140, 9, 143, B);
    level[9][141] = Q; level[9][142] = Q;
    fill(9, 147, 9, 150, B);
    level[9][148] = Q;

    // === SECTION 7: 8-step staircase + flagpole (cols 160-180) ===
    for (let s = 0; s < 8; s++) {
        for (let r = 11 - s; r < 12; r++) {
            if (r >= 0) level[r][160 + s] = B;
        }
    }

    // Flagpole at col 170
    for (let row = 4; row < 12; row++) {
        level[row][170] = 9;
    }

    // === Castle (cols 175-183) ===
    fill(8, 175, 11, 183, B);
    for (let c = 175; c <= 183; c += 2) {
        level[7][c] = B;
    }
    fill(6, 177, 6, 181, B);
    // Castle door
    level[11][178] = 0; level[11][179] = 0;
    level[10][178] = 0; level[10][179] = 0;

    return level;
}

// Level 2: Underground - tunnel layout with ceiling, platforms, pipes, elevators
function generateLevel2Map() {
    const W = 240;
    const H = 15;
    const level = Array(H).fill(null).map(() => Array(W).fill(0));
    const UG = 11;
    const UB = 12;
    const CEIL = 13;
    const HIDE = 14;
    const MULTI = 15;

    const fill = (r1, c1, r2, c2, type) => {
        for (let r = r1; r <= r2; r++)
            for (let c = c1; c <= c2; c++)
                if (r >= 0 && r < H && c >= 0 && c < W) level[r][c] = type;
    };

    const pipe = (topRow, col, bottomRow) => {
        level[topRow][col] = 4; level[topRow][col + 1] = 5;
        for (let r = topRow + 1; r <= bottomRow; r++) {
            level[r][col] = 6; level[r][col + 1] = 7;
        }
    };

    const stairs = (startCol, steps, dir) => {
        for (let s = 0; s < steps; s++) {
            const col = dir > 0 ? startCol + s : startCol - s;
            for (let r = 11 - s; r < 12; r++) {
                if (r >= 0) level[r][col] = UB;
            }
        }
    };

    // === CEILING (rows 0-1) ===
    fill(0, 0, 1, W - 1, CEIL);

    // === GROUND (rows 12-14) ===
    fill(12, 0, 14, W - 1, UG);

    // === PITS (6 pits) - 2 cols wide each, jumpable (max jump ~146px) ===
    const pits = [[22,23],[51,52],[85,86],[119,120],[159,160],[193,194]];
    for (const [s, e] of pits) {
        for (let c = s; c <= e; c++) {
            level[12][c] = 0; level[13][c] = 0; level[14][c] = 0;
        }
    }

    // === SECTION 1: Entrance (cols 0-20) ===
    level[9][8] = 3; level[9][10] = 3; level[9][12] = 3;
    level[9][14] = UB; level[9][15] = UB; level[9][16] = UB;
    pipe(9, 18, 11);

    // === SECTION 2: First platforms (cols 26-48) ===
    fill(9, 28, 9, 32, UB);
    level[9][30] = 3;
    fill(7, 34, 7, 38, UB);
    level[7][36] = 3;
    fill(9, 40, 9, 44, UB);
    level[9][42] = MULTI;
    fill(6, 43, 6, 46, UB);
    level[6][44] = 3; level[6][45] = 3;
    level[9][38] = HIDE;
    level[7][27] = HIDE;
    pipe(9, 47, 11);

    // === SECTION 3: Brick corridor (cols 55-82) ===
    fill(10, 55, 10, 80, UB);
    fill(9, 56, 9, 58, UB);
    level[9][57] = 3;
    fill(9, 62, 9, 64, UB);
    level[9][63] = 3;
    fill(7, 66, 7, 69, UB);
    level[7][67] = 3; level[7][68] = 3;
    fill(9, 72, 9, 74, UB);
    level[9][73] = MULTI;
    fill(5, 75, 5, 78, UB);
    level[5][76] = 3; level[5][77] = 3;
    level[9][60] = HIDE;
    level[7][71] = HIDE;
    level[6][65] = HIDE;
    pipe(8, 59, 11);
    pipe(7, 80, 11);

    // === SECTION 4: Elevator zone (cols 89-115) ===
    fill(4, 90, 4, 93, UB);
    fill(4, 96, 4, 99, UB);
    fill(4, 102, 4, 105, UB);
    fill(7, 92, 7, 95, UB);
    fill(7, 100, 7, 103, UB);
    fill(10, 107, 10, 112, UB);
    level[10][109] = 3;
    level[6][94] = HIDE;
    pipe(10, 114, 11);

    // === SECTION 5: Dense section (cols 123-155) ===
    fill(10, 123, 10, 150, UB);
    fill(9, 125, 9, 128, UB);
    level[9][126] = 3; level[9][127] = 3;
    fill(7, 130, 7, 133, UB);
    level[7][131] = 3; level[7][132] = 3;
    fill(9, 135, 9, 138, UB);
    level[9][136] = MULTI;
    fill(6, 139, 6, 142, UB);
    level[6][140] = 3;
    fill(9, 144, 9, 147, UB);
    level[9][145] = 3; level[9][146] = 3;
    fill(7, 148, 7, 151, UB);
    level[7][149] = HIDE;
    pipe(9, 124, 11);
    pipe(8, 142, 11);
    pipe(9, 153, 11);

    // === SECTION 6: Final challenge (cols 163-190) ===
    fill(10, 163, 10, 170, UB);
    fill(8, 166, 8, 170, UB);
    level[8][168] = 3;
    fill(6, 172, 6, 176, UB);
    level[6][174] = 3;
    fill(10, 178, 10, 182, UB);
    fill(8, 180, 8, 184, UB);
    level[8][182] = MULTI;
    level[8][165] = HIDE;
    pipe(9, 187, 11);

    // === SECTION 7: Run-up + exit (cols 197-239) ===
    fill(10, 197, 10, 210, UB);
    level[10][200] = 3; level[10][203] = 3;
    level[9][205] = 3;
    fill(10, 212, 10, 215, UB);
    level[10][213] = 3;

    // Ascending staircase
    for (let s = 0; s < 8; s++) {
        for (let c = 218 + s; c <= 218 + s; c++) {
            for (let r = 11 - s; r < 12; r++) {
                if (r >= 0) level[r][c] = UB;
            }
        }
    }

    // Flagpole
    for (let row = 2; row < 12; row++) {
        level[row][228] = 9;
    }

    // Castle
    for (let c = 232; c <= 239; c++) {
        for (let r = 8; r < 12; r++) {
            level[r][c] = UB;
        }
    }
    for (let c = 232; c <= 239; c += 2) {
        level[7][c] = UB;
    }
    fill(6, 234, 6, 238, UB);
    // Castle door
    level[11][235] = 0; level[11][236] = 0;
    level[10][235] = 0; level[10][236] = 0;

    return level;
}

// Level 3: Sky / Athletic — tree crowns, bridges, no continuous ground
function generateLevel3Map() {
    const W = 250;
    const H = 15;
    const level = Array(H).fill(null).map(() => Array(W).fill(0));
    const TC = 16;   // tree crown
    const BR = 17;   // bridge plank
    const Q = 3;     // question block
    const B = 2;     // brick
    const HIDE = 14; // hidden block

    const fill = (r1, c1, r2, c2, type) => {
        for (let r = r1; r <= r2; r++)
            for (let c = c1; c <= c2; c++)
                if (r >= 0 && r < H && c >= 0 && c < W) level[r][c] = type;
    };

    const pipe = (topRow, col) => {
        level[topRow][col] = 4; level[topRow][col + 1] = 5;
        for (let r = topRow + 1; r < 12; r++) {
            level[r][col] = 6; level[r][col + 1] = 7;
        }
    };

    // === SECTION 1: Entrance / Tutorial (cols 0-30) ===
    fill(11, 0, 11, 8, TC);
    fill(11, 11, 11, 15, BR);
    fill(10, 18, 10, 23, TC);
    level[7][19] = Q; level[7][21] = Q;
    fill(9, 26, 9, 30, TC);

    // === SECTION 2: Bridge Zone (cols 30-65) ===
    fill(11, 33, 11, 40, BR);
    fill(11, 43, 11, 50, BR);
    fill(11, 53, 11, 60, BR);
    level[9][36] = Q; level[9][46] = Q; level[9][56] = Q;
    fill(7, 34, 7, 37, TC);
    fill(7, 44, 7, 47, TC);
    fill(7, 54, 7, 57, TC);
    level[7][45] = HIDE;
    fill(10, 42, 10, 43, B); level[10][42] = Q;
    fill(10, 52, 10, 53, B); level[10][52] = Q;
    pipe(9, 62);

    // === SECTION 3: Springboard Zone (cols 65-100) ===
    fill(11, 65, 11, 70, TC);
    fill(11, 73, 11, 77, TC);
    fill(9, 80, 9, 84, TC);
    fill(11, 87, 11, 92, TC);
    fill(9, 95, 9, 99, TC);
    fill(7, 88, 7, 92, B); level[7][90] = Q;
    level[9][74] = Q; level[9][81] = Q;
    fill(10, 68, 10, 69, B); level[10][68] = Q;
    fill(6, 96, 6, 98, B); level[6][97] = HIDE;

    // === SECTION 4: Moving Platform Crossing (cols 100-145) ===
    fill(11, 100, 11, 104, TC);
    fill(10, 110, 10, 113, TC);
    fill(9, 126, 9, 129, TC);
    fill(11, 140, 11, 144, TC);
    fill(8, 116, 8, 119, B); level[8][117] = Q;

    // === SECTION 5: Falling Platform Gauntlet (cols 145-180) ===
    fill(11, 145, 11, 149, TC);
    fill(11, 155, 11, 158, TC);
    fill(11, 164, 11, 168, TC);
    fill(10, 173, 10, 178, TC);
    fill(9, 150, 9, 152, B); level[9][151] = Q;
    fill(9, 160, 9, 162, B); level[9][161] = Q;
    pipe(9, 170);

    // === SECTION 6: High/Low Route Split (cols 180-215) ===
    fill(11, 182, 11, 190, BR);
    fill(11, 194, 11, 200, TC);
    fill(11, 204, 11, 212, BR);
    fill(7, 182, 7, 185, TC);
    fill(6, 195, 6, 198, TC);
    fill(5, 205, 5, 208, TC);
    level[5][206] = Q;
    fill(7, 189, 7, 192, B); level[7][190] = Q;
    level[7][183] = HIDE;
    fill(10, 198, 10, 199, B); level[10][198] = Q;

    // === SECTION 7: Staircase + Flagpole (cols 215-250) ===
    fill(11, 215, 11, 220, TC);
    for (let s = 0; s < 8; s++) {
        for (let r = 11 - s; r < 12; r++) {
            if (r >= 0) level[r][222 + s] = B;
        }
    }
    for (let row = 3; row < 12; row++) {
        level[row][232] = 9;
    }
    fill(8, 237, 11, 245, B);
    for (let c = 237; c <= 245; c += 2) {
        level[7][c] = B;
    }
    fill(6, 239, 6, 243, B);
    level[11][240] = 0; level[11][241] = 0;
    level[10][240] = 0; level[10][241] = 0;
    for (let c = 229; c <= 235; c++) {
        for (let r = 12; r < 14; r++) level[r][c] = B;
    }

    return level;
}
