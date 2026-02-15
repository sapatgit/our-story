// ===========================================================================
// MUTABLE GAME STATE — shared by physics, renderer, and main modules.
// Uses `export let` with setter functions for values reassigned externally.
// ES module imports are live bindings, so all importers see updates.
// ===========================================================================
import {
    PLAYER_MIN_X, CHAR_DISPLAY_W, CHAR_DISPLAY_H,
    HEART_PLATFORMS, TILE_W, HEART_W, HEART_H, HEART_RELEASE_GAP
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

// ---- Input state ----
export const keys = { left: false, right: false };

// ===========================================================================
// INITIALIZATION
// ===========================================================================

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
