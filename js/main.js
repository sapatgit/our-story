// ===========================================================================
// MAIN — entry point. Game loop, input handling, UI, and canvas resize.
// ===========================================================================
import { canvas } from './canvas.js';
import { sprites } from './sprites.js';   // imported so sprites.js evaluates & loads images
import {
    GROUND_Y, setGroundY,
    gameState, player, keys,
    initHearts, initBirds, resetFireworks
} from './state.js';
import {
    drawSky, drawHills, drawClouds, drawBirds, updateBirds,
    drawPipes, drawCastle,
    drawBrickPlatforms, drawGroundTiles, drawTriangleMountain,
    drawHeartPlatforms, drawHearts, drawPlayer,
    drawFlagpole, drawFireworks
} from './renderer.js';
import { updatePlayer, checkHeartCollision, updateFireworks } from './physics.js';
import {
    JUMP_STRENGTH, PLAYER_MIN_X, GROUND_STRIP_HEIGHT, MEMORIES
} from './constants.js';

// ===========================================================================
// CANVAS RESIZE
// ===========================================================================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    setGroundY(canvas.height - GROUND_STRIP_HEIGHT);
    if (player.y === 0) player.y = GROUND_Y;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', resizeCanvas);

// ===========================================================================
// UI — memory screen and close
// ===========================================================================

function showMemory(memoryId) {
    const m = MEMORIES[memoryId];
    document.getElementById('memoryTitle').textContent = m.title;
    document.getElementById('memoryText').textContent = m.text;
    document.getElementById('memoryScreen').classList.remove('hidden');
}

function closeMemory() {
    document.getElementById('memoryScreen').classList.add('hidden');
    gameState.paused = false;
    document.getElementById('instructions').style.display = 'block';
    // Let the player continue to the flagpole — the flag-sliding
    // logic in updatePlayer() will show the end screen when they arrive.
}

// ===========================================================================
// GAME LOOP
// ===========================================================================

let gameLoopId = null;

function gameLoop() {
    drawSky();
    drawHills();
    drawClouds();
    updateBirds();
    drawBirds();
    drawPipes();
    drawCastle();
    drawBrickPlatforms();
    drawGroundTiles();
    drawTriangleMountain();
    drawHeartPlatforms();
    drawHearts();
    if (gameState.running && !gameState.paused) {
        const levelComplete = updatePlayer();
        if (levelComplete) {
            document.getElementById('endScreen').classList.remove('hidden');
        }
        const collectedId = checkHeartCollision();
        if (collectedId !== null) {
            document.getElementById('heartCount').textContent = gameState.heartsCollected;
            showMemory(collectedId);
            gameState.paused = true;
            document.getElementById('instructions').style.display = 'none';
        }
    }
    updateFireworks();
    drawPlayer();
    drawFlagpole();
    drawFireworks();
    if (gameState.running || gameState.fireworksActive) gameLoopId = requestAnimationFrame(gameLoop);
    else gameLoopId = null;
}

// ===========================================================================
// INPUT HANDLING
// ===========================================================================

function handleJump() {
    if (player.jumping || gameState.paused || !gameState.running) return;
    player.velocityY = JUMP_STRENGTH;
    player.jumping = true;
}

// ===========================================================================
// START / RESTART
// ===========================================================================

window.startGame = function() {
    // Cancel any previously running game loop to prevent stacking
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
    document.getElementById('startScreen').classList.add('hidden');
    gameState.running = true;
    gameState.paused = false;
    gameState.heartsCollected = 0;
    gameState.scrollOffset = 0;
    gameState.animTime = 0;
    gameState.flagReached = false;
    gameState.flagSliding = false;
    gameState.flagY = 0;
    gameState.fireworksActive = false;
    gameState.fireworkTimer = 0;
    resetFireworks();
    document.getElementById('heartCount').textContent = '0';
    player.x = PLAYER_MIN_X;
    player.y = GROUND_Y;
    player.velocityY = 0;
    player.jumping = false;
    initHearts();
    initBirds();
    document.getElementById('instructions').style.display = 'block';
    gameLoop();
};

window.closeMemory = closeMemory;

window.restartGame = function() {
    document.getElementById('endScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
};

// ===========================================================================
// EVENT LISTENERS
// ===========================================================================

canvas.addEventListener('click', handleJump);

// Gate canvas touchstart so it doesn't fire jump when a touch-control button is tapped
canvas.addEventListener('touchstart', function(e) {
    const target = e.target;
    if (target && (target.id === 'btnLeft' || target.id === 'btnRight' || target.id === 'btnJump')) return;
    e.preventDefault();
    handleJump();
}, { passive: false });

// ---- Mobile touch controls ----
const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');
const btnJump = document.getElementById('btnJump');

function addTouchControl(btn, onDown, onUp) {
    btn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.add('active');
        onDown();
    }, { passive: false });
    btn.addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.remove('active');
        onUp();
    }, { passive: false });
    btn.addEventListener('touchcancel', function(e) {
        e.preventDefault();
        btn.classList.remove('active');
        onUp();
    }, { passive: false });
    // Prevent click from bubbling to canvas (which would trigger handleJump)
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

addTouchControl(btnLeft,
    function() { keys.left = true; },
    function() { keys.left = false; }
);
addTouchControl(btnRight,
    function() { keys.right = true; },
    function() { keys.right = false; }
);
addTouchControl(btnJump,
    function() { handleJump(); },
    function() { /* nothing on release */ }
);

window.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        const startEl = document.getElementById('startScreen');
        const memoryEl = document.getElementById('memoryScreen');
        const endEl = document.getElementById('endScreen');
        if (!startEl.classList.contains('hidden') && !document.getElementById('startBtn').disabled) {
            startGame();
        } else if (!memoryEl.classList.contains('hidden')) {
            closeMemory();
        } else if (endEl && !endEl.classList.contains('hidden')) {
            restartGame();
        } else {
            handleJump();
        }
    }
    if (e.code === 'ArrowLeft') { e.preventDefault(); keys.left = true; }
    if (e.code === 'ArrowRight') { e.preventDefault(); keys.right = true; }
});
window.addEventListener('keyup', function(e) {
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowRight') keys.right = false;
});
