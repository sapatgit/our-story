// ===========================================================================
// PHYSICS — player movement, collision detection, and firework update logic.
// No DOM manipulation; returns signals for main.js to act on.
// ===========================================================================
import {
    GROUND_Y, gameState, player, hearts, questionBlockHit, fireworks, keys
} from './state.js';
import {
    GRAVITY, SCROLL_SPEED, FLAG_SLIDE_SPEED,
    TILE_W, TILE_H, HEART_W, HEART_H, HEART_RELEASE_GAP,
    PIPES, PIPE_W, pipeHeight,
    BRICK_PLATFORMS, HEART_PLATFORMS,
    TRIANGLE_MOUNTAIN_LEFT, TRIANGLE_MOUNTAIN_BASE_BLOCKS, TRIANGLE_MOUNTAIN_ROWS,
    FLAGPOLE_X, FLAGPOLE_H, FLAG_DISPLAY_H,
    FLAGPOLE_COLLISION_W, FLAGPOLE_HITBOX_EXTEND,
    FLAGPOLE_PLAYER_OFFSET_X, FLAGPOLE_PLAYER_OFFSET_Y,
    CAMERA_LEAD_OFFSET, PLAYER_MIN_X,
    HEART_COLLECT_DX, HEART_COLLECT_DY,
    LAND_TOLERANCE_ABOVE, LAND_TOLERANCE_BELOW,
    HEAD_HIT_TOLERANCE, HEAD_BOUNCE_PUSH,
    CASTLE_X, CASTLE_W, CASTLE_H,
    FW_GRAVITY, FW_DRAG, FW_SPAWN_INTERVAL,
    FW_MIN_PARTICLES, FW_EXTRA_PARTICLES,
    FW_MIN_SPEED, FW_EXTRA_SPEED,
    FW_MIN_LIFE, FW_EXTRA_LIFE, FW_MAX_LIFE,
    FW_MIN_SIZE, FW_EXTRA_SIZE,
    FW_HUE_SPREAD, FW_ANGLE_JITTER,
    FW_X_MIN_FRAC, FW_X_RANGE_FRAC,
    FW_Y_MIN_OFFSET, FW_Y_EXTRA_OFFSET
} from './constants.js';

// ===========================================================================
// Player update — returns true when the level is complete (flag slide done)
// ===========================================================================

export function updatePlayer() {
    const poleTopY = GROUND_Y - FLAGPOLE_H;

    // ---- Flag-slide animation (after reaching the flagpole) ----
    if (gameState.flagSliding) {
        gameState.flagY += FLAG_SLIDE_SPEED;
        player.x = FLAGPOLE_X - FLAGPOLE_PLAYER_OFFSET_X;
        player.y = gameState.flagY - player.height + FLAGPOLE_PLAYER_OFFSET_Y;
        if (gameState.flagY >= GROUND_Y - FLAG_DISPLAY_H) {
            gameState.flagSliding = false;
            gameState.running = false;
            gameState.scrollOffset = Math.max(0, player.x - CAMERA_LEAD_OFFSET);
            gameState.animTime++;
            return true; // level complete — main.js shows end screen
        }
        gameState.scrollOffset = Math.max(0, player.x - CAMERA_LEAD_OFFSET);
        gameState.animTime++;
        return false;
    }

    if (gameState.flagReached) {
        gameState.scrollOffset = Math.max(0, player.x - CAMERA_LEAD_OFFSET);
        gameState.animTime++;
        return false;
    }

    // ---- Check if the player just reached the flagpole ----
    if (!gameState.flagReached &&
        player.x + player.width >= FLAGPOLE_X &&
        player.x <= FLAGPOLE_X + FLAGPOLE_COLLISION_W + FLAGPOLE_HITBOX_EXTEND) {
        gameState.flagReached = true;
        gameState.flagSliding = true;
        gameState.flagY = poleTopY;
        gameState.fireworksActive = true;
        gameState.fireworkTimer = 0;
        player.x = FLAGPOLE_X - FLAGPOLE_PLAYER_OFFSET_X;
        player.velocityY = 0;
        gameState.scrollOffset = Math.max(0, player.x - CAMERA_LEAD_OFFSET);
        gameState.animTime++;
        return false;
    }

    // ---- Horizontal movement ----
    if (keys.right && !keys.left) {
        player.x += SCROLL_SPEED;
        player.facing = 1;
    } else if (keys.left && !keys.right) {
        player.x -= SCROLL_SPEED;
        player.facing = -1;
    }
    player.x = Math.max(PLAYER_MIN_X, player.x);

    // ---- Gravity ----
    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    const footY = player.y;
    const headY = player.y - player.height;
    const left = player.x;
    const right = player.x + player.width;

    // ---- Build lists of collidable geometry ----

    function getTriangleMountainPlatforms() {
        const list = [];
        const centerWorld = TRIANGLE_MOUNTAIN_LEFT + (TRIANGLE_MOUNTAIN_BASE_BLOCKS * TILE_W) / 2;
        for (let row = 0; row < TRIANGLE_MOUNTAIN_ROWS; row++) {
            const blocksInRow = TRIANGLE_MOUNTAIN_BASE_BLOCKS - 2 * row;
            if (blocksInRow < 1) break;
            const rowY = GROUND_Y - (row + 1) * TILE_H;
            const rowLeftWorld = centerWorld - (blocksInRow * TILE_W) / 2;
            for (let col = 0; col < blocksInRow; col++) {
                list.push({ x: rowLeftWorld + col * TILE_W, y: rowY, w: TILE_W, h: TILE_H });
            }
        }
        return list;
    }

    function getPlatforms() {
        const list = [];
        BRICK_PLATFORMS.forEach(function(p) {
            list.push({ x: p.x, y: GROUND_Y + p.yOff, w: p.w, h: p.h });
        });
        HEART_PLATFORMS.forEach(function(p) {
            list.push({ x: p.x, y: GROUND_Y + p.yOff, w: p.numBlocks * TILE_W, h: TILE_H });
        });
        getTriangleMountainPlatforms().forEach(function(p) {
            list.push(p);
        });
        PIPES.forEach(function(pipe) {
            list.push({ x: pipe.x, y: GROUND_Y - pipeHeight(pipe.type), w: PIPE_W, h: 0 });
        });
        return list;
    }

    // ---- Landing / platform collision (falling downward) ----
    if (player.velocityY >= 0) {
        const platforms = getPlatforms();
        let onGround = false;

        if (footY >= GROUND_Y) {
            player.y = GROUND_Y;
            player.velocityY = 0;
            player.jumping = false;
            onGround = true;
        }
        if (!onGround) {
            platforms.forEach(function(plat) {
                const platTop = plat.y;
                if (right > plat.x && left < plat.x + plat.w &&
                    headY < platTop + (plat.h || 1) &&
                    footY >= platTop - LAND_TOLERANCE_ABOVE &&
                    footY <= platTop + LAND_TOLERANCE_BELOW) {
                    player.y = platTop;
                    player.velocityY = 0;
                    player.jumping = false;
                    onGround = true;
                }
            });
        }
    }

    // ---- Horizontal pipe collision ----
    PIPES.forEach(function(pipe) {
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + PIPE_W;
        if (right > pipeLeft && left < pipeRight) {
            const pipeTop = GROUND_Y - pipeHeight(pipe.type);
            if (footY > pipeTop && headY < GROUND_Y) {
                if (player.x + player.width * 0.5 < pipe.x + PIPE_W * 0.5) {
                    player.x = pipe.x - player.width;
                } else {
                    player.x = pipeRight;
                }
            }
        }
    });

    // ---- Horizontal mountain-block collision ----
    getTriangleMountainPlatforms().forEach(function(block) {
        const blockLeft = block.x;
        const blockRight = block.x + block.w;
        const blockTop = block.y;
        const blockBottom = block.y + block.h;
        const overlapping = right > blockLeft && left < blockRight && headY < blockBottom && footY > blockTop;
        const standingOnBlock = footY >= blockTop - LAND_TOLERANCE_ABOVE && footY <= blockTop + LAND_TOLERANCE_BELOW;
        if (overlapping && !standingOnBlock) {
            if (player.x + player.width * 0.5 < blockLeft + block.w * 0.5) {
                player.x = blockLeft - player.width;
            } else {
                player.x = blockRight;
            }
        }
    });

    // ---- Head-bump detection on question blocks (rising upward) ----
    if (player.velocityY < 0) {
        HEART_PLATFORMS.forEach(function(plat, i) {
            if (questionBlockHit[i]) return;
            const qx = plat.x + plat.heartIndex * TILE_W;
            const blockTop = GROUND_Y + plat.yOff;
            const blockBottom = blockTop + TILE_H;
            if (headY <= blockBottom && headY >= blockBottom - HEAD_HIT_TOLERANCE &&
                right > qx && left < qx + TILE_W) {
                player.y = blockBottom + player.height + HEAD_BOUNCE_PUSH;
                player.velocityY = 0;
                questionBlockHit[i] = true;
                hearts[i].released = true;
                hearts[i].y = blockTop - HEART_H - HEART_RELEASE_GAP;
            }
        });
    }

    gameState.scrollOffset = Math.max(0, player.x - CAMERA_LEAD_OFFSET);
    gameState.animTime++;
    return false;
}

// ===========================================================================
// Heart collision — returns collected memoryId (number) or null
// ===========================================================================

export function checkHeartCollision() {
    let collectedMemoryId = null;
    hearts.forEach(function(heart) {
        if (heart.collected || !heart.released) return;
        const dx = (player.x + player.width / 2) - (heart.x + heart.width / 2);
        const dy = (player.y - player.height / 2) - (heart.y + heart.height / 2);
        if (Math.abs(dx) < HEART_COLLECT_DX && Math.abs(dy) < HEART_COLLECT_DY) {
            heart.collected = true;
            gameState.heartsCollected++;
            collectedMemoryId = heart.memoryId;
        }
    });
    return collectedMemoryId;
}

// ===========================================================================
// Firework burst & update
// ===========================================================================

function spawnFireworkBurst() {
    // Burst origin above the castle (world coords)
    const cx = CASTLE_X + CASTLE_W * (FW_X_MIN_FRAC + Math.random() * FW_X_RANGE_FRAC);
    const cy = GROUND_Y - CASTLE_H - FW_Y_MIN_OFFSET - Math.random() * FW_Y_EXTRA_OFFSET;
    const count = FW_MIN_PARTICLES + Math.floor(Math.random() * FW_EXTRA_PARTICLES);
    const hue = Math.floor(Math.random() * 360);

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * FW_ANGLE_JITTER;
        const speed = FW_MIN_SPEED + Math.random() * FW_EXTRA_SPEED;
        fireworks.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: FW_MIN_LIFE + Math.floor(Math.random() * FW_EXTRA_LIFE),
            maxLife: FW_MAX_LIFE,
            size: FW_MIN_SIZE + Math.random() * FW_EXTRA_SIZE,
            hue: hue + Math.floor(Math.random() * FW_HUE_SPREAD - FW_HUE_SPREAD / 2),
            bright: 1
        });
    }
}

export function updateFireworks() {
    if (!gameState.fireworksActive) return;
    gameState.fireworkTimer++;

    // Spawn a new burst every FW_SPAWN_INTERVAL frames
    if (gameState.fireworkTimer % FW_SPAWN_INTERVAL === 0 || gameState.fireworkTimer === 1) {
        spawnFireworkBurst();
    }
    for (let i = fireworks.length - 1; i >= 0; i--) {
        const p = fireworks[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += FW_GRAVITY;
        p.vx *= FW_DRAG;
        p.vy *= FW_DRAG;
        p.life--;
        p.bright = Math.max(0, p.life / p.maxLife);
        if (p.life <= 0) fireworks.splice(i, 1);
    }
}
