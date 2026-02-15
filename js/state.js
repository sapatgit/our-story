// ===========================================================================
// MUTABLE GAME STATE — shared by physics, renderer, and main modules.
// Uses `export let` with setter functions for values reassigned externally.
// ES module imports are live bindings, so all importers see updates.
// ===========================================================================
import {
    PLAYER_MIN_X, CHAR_DISPLAY_W, CHAR_DISPLAY_H,
    HEART_PLATFORMS, TILE_W, HEART_W, HEART_H, HEART_RELEASE_GAP,
    BIRD_COUNT, BIRD_Y_MIN, BIRD_Y_RANGE,
    BIRD_DRIFT_MIN, BIRD_DRIFT_EXTRA,
    BIRD_FLAP_MIN, BIRD_FLAP_EXTRA,
    BIRD_BOB_AMP_MIN, BIRD_BOB_AMP_EXTRA, BIRD_BOB_FREQ,
    BIRD_SIZE_MIN, BIRD_SIZE_EXTRA, BIRD_SPACING
} from './constants.js';

// ---- Ground Y (set by resizeCanvas in main.js) ----
/** Y-coordinate of the ground surface; updated on canvas resize */
export let GROUND_Y = 0;
export function setGroundY(v) { GROUND_Y = v; }

// ---- Core game state ----
export const gameState = {
    running: false,
    paused: false,
    heartsCollected: 0,
    scrollOffset: 0,
    animTime: 0,
    flagReached: false,
    flagSliding: false,
    flagY: 0,
    fireworksActive: false,
    fireworkTimer: 0
};

// ---- Player ----
export const player = {
    x: PLAYER_MIN_X,
    y: 0,
    width: CHAR_DISPLAY_W,
    height: CHAR_DISPLAY_H,
    velocityY: 0,
    jumping: false,
    facing: 1
};

// ---- Hearts & question-block tracking ----
export let hearts = [];
/** One boolean per heart platform: true after the question block is hit from below */
export let questionBlockHit = [];

// ---- Firework particles ----
/** Array of active firework particles */
export let fireworks = [];
/** Clears all firework particles (called from startGame in main.js) */
export function resetFireworks() { fireworks.length = 0; }

// ---- Ambient birds ----
/** Array of decorative bird objects for the background */
export let birds = [];

// ---- Input state ----
export const keys = { left: false, right: false };

// ===========================================================================
// INITIALIZATION
// ===========================================================================

/** Creates the flock of decorative birds spread across the level */
export function initBirds() {
    birds = [];
    for (let i = 0; i < BIRD_COUNT; i++) {
        const direction = Math.random() < 0.5 ? 1 : -1;
        birds.push({
            worldX: i * BIRD_SPACING + Math.random() * BIRD_SPACING * 0.6,
            baseY: BIRD_Y_MIN + Math.random() * BIRD_Y_RANGE,
            speed: (BIRD_DRIFT_MIN + Math.random() * BIRD_DRIFT_EXTRA) * direction,
            flapRate: BIRD_FLAP_MIN + Math.random() * BIRD_FLAP_EXTRA,
            flapPhase: Math.random() * Math.PI * 2,
            bobAmp: BIRD_BOB_AMP_MIN + Math.random() * BIRD_BOB_AMP_EXTRA,
            bobPhase: Math.random() * Math.PI * 2,
            size: BIRD_SIZE_MIN + Math.random() * BIRD_SIZE_EXTRA
        });
    }
}

/** Sets up hearts and question-block-hit arrays based on HEART_PLATFORMS layout */
export function initHearts() {
    questionBlockHit = HEART_PLATFORMS.map(function() { return false; });
    hearts = HEART_PLATFORMS.map(function(plat, i) {
        const blockCenterX = plat.x + plat.heartIndex * TILE_W + TILE_W / 2;
        return {
            memoryId: i,
            x: blockCenterX - HEART_W / 2,
            y: GROUND_Y + plat.yOff - HEART_H - HEART_RELEASE_GAP,
            width: HEART_W,
            height: HEART_H,
            collected: false,
            released: false,
            angle: Math.random() * Math.PI * 2
        };
    });
}
