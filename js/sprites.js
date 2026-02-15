// ===========================================================================
// SPRITE GENERATION, LOADING, AND HELPERS
// ===========================================================================
import {
    FALLBACK_SHEET_WIDTH, FALLBACK_SHEET_HEIGHT, FALLBACK_FRAME_COUNT, FALLBACK_FRAME_SIZE,
    TILE_W, TILE_H,
    GEN_TILE_OUTLINE_WIDTH, GEN_TILE_PIT_SIZE, GEN_TILE_PIT_INSET, GEN_TILE_PIT_FAR,
    HEART_SPRITE_W, HEART_SPRITE_H,
    GROUND_SPRITE_DOUBLE_WIDTH, GROUND_SPRITE_TILE_SIZE,
    TOTAL_SPRITES_TO_LOAD,
    COLOR_CAP_RED, COLOR_SKIN, COLOR_OVERALL_BLUE, COLOR_SHOE_BROWN,
    COLOR_WHITE, COLOR_BLACK, COLOR_HAIR_BROWN,
    COLOR_BRICK, COLOR_BRICK_OUTLINE, COLOR_BRICK_PIT
} from './constants.js';

// ===========================================================================
// Exported state
// ===========================================================================
export const sprites = { character: null, ground: null, tiles: null, heart: null };
export let useFallbackCharacter = false;

// ===========================================================================
// Ground sprite source-rect size helper
// bricks.png may be 80 px wide (two 16x16 tiles) or TILE_W (fallback).
// Returns the correct source dimension for drawImage calls.
// ===========================================================================
export function groundSourceSize(img) {
    if (img && img.complete && img.naturalWidth === GROUND_SPRITE_DOUBLE_WIDTH) {
        return GROUND_SPRITE_TILE_SIZE;
    }
    return TILE_W;
}

// ===========================================================================
// SPRITE GENERATION — procedural fallbacks when PNGs fail to load
// ===========================================================================

/**
 * Generates a fallback Mario-style character sprite sheet on a canvas.
 * Each of the FALLBACK_FRAME_COUNT frames is drawn procedurally with
 * pixel-art rectangles. Coordinates below are pixel-art layout data.
 */
function generateCharacterSheetFallback() {
    const c = document.createElement('canvas');
    c.width = FALLBACK_SHEET_WIDTH;
    c.height = FALLBACK_SHEET_HEIGHT;
    const cctx = c.getContext('2d');

    for (let frame = 0; frame < FALLBACK_FRAME_COUNT; frame++) {
        const ox = frame * FALLBACK_FRAME_SIZE;
        const legOffset = frame % 2 === 0 ? 0 : 2;

        // Cap
        cctx.fillStyle = COLOR_CAP_RED;
        cctx.fillRect(ox + 4, 2, 24, 8);
        cctx.fillRect(ox + 8, 0, 16, 4);

        // Cap visor / white patch
        cctx.fillStyle = COLOR_WHITE;
        cctx.fillRect(ox + 4, 4, 10, 3);
        cctx.fillRect(ox + 12, 2, 6, 5);

        // Hair
        cctx.fillStyle = COLOR_HAIR_BROWN;
        cctx.fillRect(ox + 20, 4, 8, 4);

        // Face (skin)
        cctx.fillStyle = COLOR_SKIN;
        cctx.fillRect(ox + 6, 10, 20, 14);

        // Eyes & mouth
        cctx.fillStyle = COLOR_BLACK;
        cctx.fillRect(ox + 8, 12, 3, 3);
        cctx.fillRect(ox + 19, 12, 3, 3);
        cctx.fillRect(ox + 6, 18, 6, 2);
        cctx.fillRect(ox + 20, 18, 6, 2);

        // Shirt
        cctx.fillStyle = COLOR_CAP_RED;
        cctx.fillRect(ox + 6, 24, 20, 12);

        // Overalls
        cctx.fillStyle = COLOR_OVERALL_BLUE;
        cctx.fillRect(ox + 8, 24, 16, 10);
        cctx.fillRect(ox + 10, 24, 4, 12);
        cctx.fillRect(ox + 18, 24, 4, 12);

        // Overall buttons
        cctx.fillStyle = COLOR_WHITE;
        cctx.fillRect(ox + 12, 26, 2, 2);
        cctx.fillRect(ox + 18, 26, 2, 2);

        // Arms (skin)
        cctx.fillStyle = COLOR_SKIN;
        cctx.fillRect(ox + 2, 26, 5, 10);
        cctx.fillRect(ox + 25, 26, 5, 10);

        // Gloves
        cctx.fillStyle = COLOR_WHITE;
        cctx.fillRect(ox + 2, 34, 5, 5);
        cctx.fillRect(ox + 25, 34, 5, 5);

        // Legs (overalls)
        cctx.fillStyle = COLOR_OVERALL_BLUE;
        cctx.fillRect(ox + 6 + legOffset, 36, 8, 12);
        cctx.fillRect(ox + 18 - legOffset, 36, 8, 12);

        // Shoes
        cctx.fillStyle = COLOR_SHOE_BROWN;
        cctx.fillRect(ox + 6 + legOffset, 46, 8, 2);
        cctx.fillRect(ox + 18 - legOffset, 46, 8, 2);
    }
    return c.toDataURL('image/png');
}

/**
 * Generates a Mario-style brick ground tile.
 */
function generateGroundTile() {
    const c = document.createElement('canvas');
    c.width = TILE_W;
    c.height = TILE_H;
    const cctx = c.getContext('2d');

    // Main brick fill
    cctx.fillStyle = COLOR_BRICK;
    cctx.fillRect(0, 0, TILE_W, TILE_H);

    // Dark outline
    cctx.strokeStyle = COLOR_BRICK_OUTLINE;
    cctx.lineWidth = GEN_TILE_OUTLINE_WIDTH;
    cctx.strokeRect(1, 1, TILE_W - GEN_TILE_OUTLINE_WIDTH, TILE_H - GEN_TILE_OUTLINE_WIDTH);

    // Corner pit accents
    cctx.fillStyle = COLOR_BRICK_PIT;
    cctx.fillRect(GEN_TILE_PIT_INSET, GEN_TILE_PIT_INSET, GEN_TILE_PIT_SIZE, GEN_TILE_PIT_SIZE);
    cctx.fillRect(GEN_TILE_PIT_FAR, GEN_TILE_PIT_INSET, GEN_TILE_PIT_SIZE, GEN_TILE_PIT_SIZE);
    cctx.fillRect(GEN_TILE_PIT_INSET, GEN_TILE_PIT_FAR, GEN_TILE_PIT_SIZE, GEN_TILE_PIT_SIZE);
    cctx.fillRect(GEN_TILE_PIT_FAR, GEN_TILE_PIT_FAR, GEN_TILE_PIT_SIZE, GEN_TILE_PIT_SIZE);

    return c.toDataURL('image/png');
}

/**
 * Generates a 13x12 pixel-art heart sprite, drawn on a tiny canvas
 * and scaled up at draw time. Pixel coordinates below are the heart's
 * outline, fill, shadow, highlight, and specular data.
 */
function generateHeartSprite() {
    const c = document.createElement('canvas');
    c.width = HEART_SPRITE_W;
    c.height = HEART_SPRITE_H;
    const cctx = c.getContext('2d');
    const px = function(x, y) { cctx.fillRect(x, y, 1, 1); };

    // Outline (black)
    cctx.fillStyle = '#000';
    // row 0
    px(1,0);px(2,0);px(3,0);               px(9,0);px(10,0);px(11,0);
    // row 1
    px(0,1);                px(4,1); px(8,1);                px(12,1);
    // row 2
    px(0,2);                                                  px(12,2);
    // row 3
    px(0,3);                                                  px(12,3);
    // row 4
    px(1,4);                                                px(11,4);
    // row 5
    px(2,5);                                          px(10,5);
    // row 6
    px(3,6);                                    px(9,6);
    // row 7
    px(4,7);                              px(8,7);
    // row 8
    px(5,8);                        px(7,8);
    // row 9
    px(6,9);

    // Main red fill
    cctx.fillStyle = '#E52521';
    px(1,1);px(2,1);px(3,1);  px(9,1);px(10,1);px(11,1);
    px(1,2);px(2,2);px(3,2);px(4,2);px(5,2);px(6,2);px(7,2);px(8,2);px(9,2);px(10,2);px(11,2);
    px(1,3);px(2,3);px(3,3);px(4,3);px(5,3);px(6,3);px(7,3);px(8,3);px(9,3);px(10,3);px(11,3);
    px(2,4);px(3,4);px(4,4);px(5,4);px(6,4);px(7,4);px(8,4);px(9,4);px(10,4);
    px(3,5);px(4,5);px(5,5);px(6,5);px(7,5);px(8,5);px(9,5);
    px(4,6);px(5,6);px(6,6);px(7,6);px(8,6);
    px(5,7);px(6,7);px(7,7);
    px(6,8);

    // Dark red shadow (bottom-right inner edge)
    cctx.fillStyle = '#A01010';
    px(10,3);px(11,3);  px(9,4);px(10,4);  px(8,5);px(9,5);  px(7,6);px(8,6);  px(7,7);

    // Highlight (top-left lobes)
    cctx.fillStyle = '#FF6B6B';
    px(2,1);px(3,1);  px(10,1);px(11,1);
    px(1,2);px(2,2);  px(10,2);px(11,2);

    // White specular
    cctx.fillStyle = '#FFC0C0';
    px(2,1); px(10,1);

    return c.toDataURL('image/png');
}

// ===========================================================================
// SPRITE LOADING — runs at module evaluation time
// ===========================================================================
let loadPending = TOTAL_SPRITES_TO_LOAD;

function onSpriteLoad() {
    loadPending--;
    if (loadPending === 0) {
        document.getElementById('loadingText').textContent = '';
        document.getElementById('startBtn').disabled = false;
    }
}

(function loadSprites() {
    const mario = new Image();
    mario.onload = function() { sprites.character = mario; useFallbackCharacter = false; onSpriteLoad(); };
    mario.onerror = function() {
        useFallbackCharacter = true;
        const fallback = new Image();
        fallback.onload = function() { sprites.character = fallback; onSpriteLoad(); };
        fallback.src = generateCharacterSheetFallback();
    };
    mario.src = 'assets/mario.png';

    const groundImg = new Image();
    groundImg.onload = function() { sprites.ground = groundImg; onSpriteLoad(); };
    groundImg.onerror = function() {
        const fb = new Image();
        fb.onload = function() { sprites.ground = fb; onSpriteLoad(); };
        fb.src = generateGroundTile();
    };
    groundImg.src = 'assets/bricks.png';

    const tilesImg = new Image();
    tilesImg.onload = function() { sprites.tiles = tilesImg; onSpriteLoad(); };
    tilesImg.onerror = function() { sprites.tiles = null; onSpriteLoad(); };
    tilesImg.src = 'assets/tiles.png';

    const heartImg = new Image();
    heartImg.onload = function() { sprites.heart = heartImg; onSpriteLoad(); };
    heartImg.src = generateHeartSprite();
})();
