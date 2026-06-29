const CONFIG = {
    TILE_SIZE: 32,
    SCREEN_WIDTH: 800,
    SCREEN_HEIGHT: 600,
    GRAVITY: 0.55,
    PLAYER_SPEED: 3.5,
    RUN_SPEED: 5.5,
    JUMP_FORCE: -11.5,
    MAX_FALL_SPEED: 15,
    FRICTION: 0.82,
    FPS: 40
};

const SOLID_TILES = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21];

const LAVA_TILES = [18];

function isSolidTile(type) {
    return SOLID_TILES.includes(type);
}

function isLavaTile(type) {
    return LAVA_TILES.includes(type);
}

const COLORS = {
    SKY: '#5c94fc',
    GROUND: '#c8641e',
    GROUND_TOP: '#32cd32',
    BRICK: '#b8860b',
    QUESTION: '#ffd700',
    USED: '#8b7355',
    PIPE: '#32cd32',
    MARIO_RED: '#dc3232',
    MARIO_SKIN: '#fac8a8',
    MARIO_BLUE: '#3232dc',
    GOOMBA: '#b4641e',
    COIN: '#ffd700',
    WHITE: '#ffffff',
    BLACK: '#000000',
    UG_BG: '#000000',
    UG_GROUND: '#6b4c2a',
    UG_GROUND_DARK: '#5a3d20',
    UG_BRICK: '#4a8cad',
    UG_BRICK_LIGHT: '#5ea8c8',
    UG_BRICK_DARK: '#356a85',
    UG_CEILING: '#3a3a3a',
    UG_CEILING_LIGHT: '#4a4a4a',
    SKY_BG: '#87CEEB',
    TREE_GREEN: '#2d8b2d',
    TREE_GREEN_LIGHT: '#3da83d',
    TREE_TRUNK: '#8B4513',
    BRIDGE: '#a0522d',
    BRIDGE_DARK: '#6b3410',
    BRIDGE_NAIL: '#888888',
    CASTLE_BG: '#000000',
    CASTLE_BRICK: '#606060',
    CASTLE_BRICK_LIGHT: '#787878',
    CASTLE_BRICK_DARK: '#484848',
    CASTLE_UNBREAKABLE: '#3a3a3a',
    CASTLE_UNBREAKABLE_LIGHT: '#505050',
    CASTLE_LAVA: '#e03000',
    CASTLE_LAVA_LIGHT: '#ff6600',
    CASTLE_LAVA_BRIGHT: '#ffaa00',
    CASTLE_BRIDGE: '#8b5e3c',
    CASTLE_BRIDGE_DARK: '#6b3e1c',
    CASTLE_TORCH: '#ff8800',
    CASTLE_TORCH_BRIGHT: '#ffcc00',
    CASTLE_AXE_METAL: '#c0c0c0',
    CASTLE_AXE_HANDLE: '#8b4513'
};
