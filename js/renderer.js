// ===========================================================================
// RENDERER — all drawing functions for the game world.
// ===========================================================================
import { canvas, ctx } from './canvas.js';
import { sprites, useFallbackCharacter, groundSourceSize } from './sprites.js';
import { GROUND_Y, gameState, player, hearts, questionBlockHit, fireworks } from './state.js';
import {
    // Dimensions
    TILE_W, TILE_H, CHAR_DISPLAY_W, HEART_W, HEART_H,
    HEART_DISPLAY_W, HEART_DISPLAY_H, HEART_SPRITE_W, HEART_SPRITE_H,
    FALLBACK_FRAME_SIZE, FALLBACK_SHEET_HEIGHT,
    MARIO_RUN_FRAMES, ANIM_FRAME_DIVISOR,
    // Sky
    SKY_COLOR_TOP, SKY_COLOR_BOTTOM,
    // Clouds
    CLOUD_PARALLAX, CLOUD_SPRITE_SCALE, CLOUD_POSITIONS,
    CLOUD_Y_SPRITE, CLOUD_Y_FALLBACK,
    CLOUD_SRC_LEFT, CLOUD_SRC_MID, CLOUD_SRC_RIGHT,
    CLOUD_ARC_SMALL, CLOUD_ARC_LARGE,
    CLOUD_FALLBACK_RECT_W, CLOUD_FALLBACK_RECT_H,
    // Pipes
    PIPE_XS, PIPE_W, PIPE_H, PIPE_SPRITE_SCALE,
    PIPE_BODY_OFFSET_1, PIPE_BODY_OFFSET_2,
    PIPE_RIM_OVERHANG, PIPE_RIM_CAP_HEIGHT, PIPE_RIM_EXTRA_WIDTH, PIPE_RIM_Y_OFFSET,
    TILES_PIPE_RIM, TILES_PIPE_BODY,
    COLOR_PIPE_GREEN, COLOR_PIPE_GREEN_DARK, COLOR_PIPE_GREY, COLOR_PIPE_GREY_DARK,
    // Castle
    CASTLE_X, CASTLE_W, CASTLE_H, CASTLE_BASE_OFFSET, CASTLE_OFFSCREEN_BUFFER,
    CASTLE_DOOR_W, CASTLE_DOOR_H, CASTLE_DOOR_MARGIN, CASTLE_OVERLAY_ALPHA,
    TILES_CASTLE, TILES_IMAGE_W, TILES_IMAGE_H,
    COLOR_CASTLE_BRICK, COLOR_CASTLE_DOOR,
    // Brick / Heart Platforms
    BRICK_PLATFORMS, HEART_PLATFORMS,
    COLOR_BRICK, COLOR_BRICK_OUTLINE, GEN_TILE_OUTLINE_WIDTH,
    COLOR_HIT_BLOCK, COLOR_HIT_BLOCK_STROKE, COLOR_BLACK,
    Q_MARK_FONT_SIZE_FACTOR, Q_MARK_Y_FACTOR,
    // Mountain
    TRIANGLE_MOUNTAIN_LEFT, TRIANGLE_MOUNTAIN_BASE_BLOCKS, TRIANGLE_MOUNTAIN_ROWS,
    COLOR_MOUNTAIN, COLOR_MOUNTAIN_OUTLINE,
    // Flagpole
    FLAGPOLE_X, FLAGPOLE_H, FLAG_DISPLAY_H,
    FLAGPOLE_SPRITE_H, FLAGPOLE_SPRITE_W, FLAGPOLE_SHAFT_OFFSET_X,
    FLAGPOLE_ANIM_FRAME_COUNT, FLAGPOLE_FRAMES,
    FLAGPOLE_FALLBACK_WIDTH, FLAGPOLE_FALLBACK_BALL_R,
    COLOR_FLAGPOLE_GREEN, COLOR_FLAGPOLE_BALL,
    // Fireworks
    FW_OFFSCREEN_BUFFER, FW_ALPHA_MIN, FW_ALPHA_RANGE,
    FW_BASE_LIGHTNESS, FW_BRIGHT_LIGHTNESS,
    FW_GLOW_ALPHA, FW_GLOW_SIZE,
    // Heartbeat
    HEARTBEAT_SPEED, HEARTBEAT_FIRST_WINDOW, HEARTBEAT_FIRST_AMP,
    HEARTBEAT_SECOND_END, HEARTBEAT_SECOND_DURATION, HEARTBEAT_SECOND_AMP,
    HEART_GLOW_BASE_R, HEART_GLOW_INNER_R,
    HEART_GLOW_CENTER, HEART_GLOW_MID, HEART_GLOW_EDGE,
    // Misc
    COLOR_WHITE
} from './constants.js';

// ===========================================================================
// Drawing functions
// ===========================================================================

export function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, SKY_COLOR_TOP);
    g.addColorStop(1, SKY_COLOR_BOTTOM);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function drawClouds() {
    const t = sprites.tiles;
    const s = CLOUD_SPRITE_SCALE;

    if (t && t.complete) {
        CLOUD_POSITIONS.forEach(function(baseX) {
            const x = baseX - gameState.scrollOffset * CLOUD_PARALLAX;
            const y = CLOUD_Y_SPRITE;
            const cl = CLOUD_SRC_LEFT, cm = CLOUD_SRC_MID, cr = CLOUD_SRC_RIGHT;
            ctx.drawImage(t, cl.sx, cl.sy, cl.sw, cl.sh, x, y, cl.sw * s, cl.sh * s);
            ctx.drawImage(t, cm.sx, cm.sy, cm.sw, cm.sh, x + cl.sw * s, y, cm.sw * s, cm.sh * s);
            ctx.drawImage(t, cm.sx, cm.sy, cm.sw, cm.sh, x + (cl.sw + cm.sw) * s, y, cm.sw * s, cm.sh * s);
            ctx.drawImage(t, cr.sx, cr.sy, cr.sw, cr.sh, x + (cl.sw + cm.sw * 2) * s, y, cr.sw * s, cr.sh * s);
        });
    } else {
        ctx.fillStyle = COLOR_WHITE;
        CLOUD_POSITIONS.forEach(function(baseX) {
            const x = baseX - gameState.scrollOffset * CLOUD_PARALLAX;
            const y = CLOUD_Y_FALLBACK;
            ctx.beginPath();
            ctx.arc(x, y + 5, CLOUD_ARC_SMALL, 0, Math.PI * 2);
            ctx.arc(x + 22, y, CLOUD_ARC_LARGE, 0, Math.PI * 2);
            ctx.arc(x + 48, y + 5, CLOUD_ARC_SMALL, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(x - 8, y + 2, CLOUD_FALLBACK_RECT_W, CLOUD_FALLBACK_RECT_H);
        });
    }
}

export function drawPipes() {
    const t = sprites.tiles;
    const s = PIPE_SPRITE_SCALE;

    PIPE_XS.forEach(function(worldX, idx) {
        const x = worldX - gameState.scrollOffset;
        if (x + PIPE_W * s < 0 || x > canvas.width) return;

        if (t && t.complete) {
            const rim = TILES_PIPE_RIM;
            const body = TILES_PIPE_BODY;
            const prevSmooth = ctx.imageSmoothingEnabled;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(t, rim.sx, rim.sy, rim.sw, rim.sh, x, GROUND_Y - PIPE_H, rim.sw * s, rim.sh * s);
            ctx.drawImage(t, body.sx, body.sy, body.sw, body.sh, x, GROUND_Y - PIPE_H + PIPE_BODY_OFFSET_1, body.sw * s, body.sh * s);
            ctx.drawImage(t, body.sx, body.sy, body.sw, body.sh, x, GROUND_Y - PIPE_H + PIPE_BODY_OFFSET_2, body.sw * s, body.sh * s);
            ctx.imageSmoothingEnabled = prevSmooth;
        } else {
            const fill = idx % 2 === 0 ? COLOR_PIPE_GREEN : COLOR_PIPE_GREY;
            const dark = idx % 2 === 0 ? COLOR_PIPE_GREEN_DARK : COLOR_PIPE_GREY_DARK;
            ctx.fillStyle = fill;
            ctx.fillRect(x, GROUND_Y - PIPE_H, PIPE_W, PIPE_H);
            ctx.fillStyle = dark;
            ctx.fillRect(x - PIPE_RIM_OVERHANG, GROUND_Y - PIPE_H - PIPE_RIM_Y_OFFSET, PIPE_W + PIPE_RIM_EXTRA_WIDTH, PIPE_RIM_CAP_HEIGHT);
            ctx.fillStyle = fill;
        }
    });
}

export function drawCastle() {
    const dx = CASTLE_X - gameState.scrollOffset;
    if (dx + CASTLE_W < 0 || dx > canvas.width + CASTLE_OFFSCREEN_BUFFER) return;
    const baseY = GROUND_Y - CASTLE_H + CASTLE_BASE_OFFSET;
    const t = sprites.tiles;

    if (t && t.complete) {
        const r = TILES_CASTLE;
        const imgW = t.naturalWidth || TILES_IMAGE_W;
        const imgH = t.naturalHeight || TILES_IMAGE_H;
        const sx = Math.max(0, r.sx);
        const sy = Math.max(0, r.sy);
        const sw = Math.min(r.sw, imgW - sx);
        const sh = Math.min(r.sh, imgH - sy);
        if (sw > 0 && sh > 0) {
            const prevSmooth = ctx.imageSmoothingEnabled;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(t, sx, sy, sw, sh, dx, baseY, CASTLE_W, CASTLE_H);
            ctx.imageSmoothingEnabled = prevSmooth;
        }
    } else {
        const img = sprites.ground;
        const srcSize = groundSourceSize(img);
        for (let cx = 0; cx < CASTLE_W; cx += TILE_W) {
            for (let cy = 0; cy < CASTLE_H; cy += TILE_H) {
                if (img && img.complete) {
                    ctx.drawImage(img, 0, 0, srcSize, srcSize, dx + cx, baseY + cy, TILE_W, TILE_H);
                    ctx.fillStyle = 'rgba(0,0,0,' + CASTLE_OVERLAY_ALPHA + ')';
                    ctx.fillRect(dx + cx, baseY + cy, TILE_W, TILE_H);
                } else {
                    ctx.fillStyle = COLOR_CASTLE_BRICK;
                    ctx.fillRect(dx + cx, baseY + cy, TILE_W, TILE_H);
                }
            }
        }
        const doorX = dx + (CASTLE_W - CASTLE_DOOR_W) / 2;
        const doorY = baseY + CASTLE_H - CASTLE_DOOR_H - CASTLE_DOOR_MARGIN;
        ctx.fillStyle = COLOR_CASTLE_DOOR;
        ctx.fillRect(doorX, doorY, CASTLE_DOOR_W, CASTLE_DOOR_H);
    }
}

export function drawBrickPlatforms() {
    const img = sprites.ground;
    const srcSize = groundSourceSize(img);

    function drawPlatform(x, y, w, h) {
        x = x - gameState.scrollOffset;
        if (x + w < 0 || x > canvas.width) return;
        if (!img || !img.complete) {
            ctx.fillStyle = COLOR_BRICK;
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = COLOR_BRICK_OUTLINE;
            ctx.lineWidth = GEN_TILE_OUTLINE_WIDTH;
            ctx.strokeRect(x, y, w, h);
        } else {
            for (let cx = 0; cx < w; cx += TILE_W) {
                for (let cy = 0; cy < h; cy += TILE_H) {
                    ctx.drawImage(img, 0, 0, srcSize, srcSize, x + cx, y + cy, TILE_W, TILE_H);
                }
            }
        }
    }
    BRICK_PLATFORMS.forEach(function(p) {
        drawPlatform(p.x, GROUND_Y + p.yOff, p.w, p.h);
    });
}

export function drawHeartPlatforms() {
    const img = sprites.ground;
    const srcSize = groundSourceSize(img);

    HEART_PLATFORMS.forEach(function(plat, i) {
        const baseX = plat.x - gameState.scrollOffset;
        if (baseX + plat.numBlocks * TILE_W < 0 || baseX > canvas.width) return;
        const y = GROUND_Y + plat.yOff;

        for (let col = 0; col < plat.numBlocks; col++) {
            const x = baseX + col * TILE_W;
            if (x + TILE_W < 0 || x > canvas.width) continue;
            const isHeartBlock = col === plat.heartIndex;
            const hit = isHeartBlock && questionBlockHit[i];

            if (isHeartBlock) {
                if (hit) {
                    ctx.fillStyle = COLOR_HIT_BLOCK;
                    ctx.fillRect(x, y, TILE_W, TILE_H);
                    ctx.strokeStyle = COLOR_HIT_BLOCK_STROKE;
                } else {
                    ctx.fillStyle = COLOR_BRICK;
                    ctx.fillRect(x, y, TILE_W, TILE_H);
                    ctx.strokeStyle = COLOR_BRICK_OUTLINE;
                    ctx.fillStyle = COLOR_BLACK;
                    ctx.font = 'bold ' + (TILE_H * Q_MARK_FONT_SIZE_FACTOR) + 'px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('?', x + TILE_W / 2, y + TILE_H * Q_MARK_Y_FACTOR);
                    ctx.textAlign = 'left';
                }
                ctx.lineWidth = GEN_TILE_OUTLINE_WIDTH;
                ctx.strokeRect(x, y, TILE_W, TILE_H);
            } else {
                if (img && img.complete) {
                    ctx.drawImage(img, 0, 0, srcSize, srcSize, x, y, TILE_W, TILE_H);
                } else {
                    ctx.fillStyle = COLOR_BRICK;
                    ctx.fillRect(x, y, TILE_W, TILE_H);
                    ctx.strokeStyle = COLOR_BRICK_OUTLINE;
                    ctx.lineWidth = GEN_TILE_OUTLINE_WIDTH;
                    ctx.strokeRect(x, y, TILE_W, TILE_H);
                }
            }
        }
    });
}

export function drawTriangleMountain() {
    const img = sprites.ground;
    const baseLeft = TRIANGLE_MOUNTAIN_LEFT - gameState.scrollOffset;
    if (baseLeft + TRIANGLE_MOUNTAIN_BASE_BLOCKS * TILE_W < 0 || baseLeft > canvas.width) return;
    const srcSize = groundSourceSize(img);
    const centerX = baseLeft + (TRIANGLE_MOUNTAIN_BASE_BLOCKS * TILE_W) / 2;

    for (let row = 0; row < TRIANGLE_MOUNTAIN_ROWS; row++) {
        const blocksInRow = TRIANGLE_MOUNTAIN_BASE_BLOCKS - 2 * row;
        if (blocksInRow < 1) break;
        const rowY = GROUND_Y - (row + 1) * TILE_H;
        const rowLeft = centerX - (blocksInRow * TILE_W) / 2;

        for (let col = 0; col < blocksInRow; col++) {
            const tx = rowLeft + col * TILE_W;
            if (tx + TILE_W < 0 || tx > canvas.width) continue;

            if (img && img.complete) {
                ctx.drawImage(img, 0, 0, srcSize, srcSize, tx, rowY, TILE_W, TILE_H);
            } else {
                ctx.fillStyle = COLOR_MOUNTAIN;
                ctx.fillRect(tx, rowY, TILE_W, TILE_H);
                ctx.strokeStyle = COLOR_MOUNTAIN_OUTLINE;
                ctx.strokeRect(tx, rowY, TILE_W, TILE_H);
            }
        }
    }
}

export function drawFlagpole() {
    const scale = FLAGPOLE_H / FLAGPOLE_SPRITE_H;
    const displayW = Math.round(FLAGPOLE_SPRITE_W * scale);
    const screenX = FLAGPOLE_X - gameState.scrollOffset;
    const drawX = screenX - Math.round(FLAGPOLE_SHAFT_OFFSET_X * scale);
    const drawY = GROUND_Y - FLAGPOLE_H;

    if (drawX + displayW < 0 || drawX > canvas.width) return;

    const t = sprites.tiles;
    if (t && t.complete) {
        // Pick animation frame based on flag slide progress
        let frameIdx = 0; // flag at top
        if (gameState.flagSliding || (gameState.flagReached && !gameState.flagSliding)) {
            const poleTop = GROUND_Y - FLAGPOLE_H;
            const slideEnd = GROUND_Y - FLAG_DISPLAY_H;
            let progress = (gameState.flagY - poleTop) / (slideEnd - poleTop);
            progress = Math.max(0, Math.min(1, progress));
            frameIdx = Math.min(FLAGPOLE_ANIM_FRAME_COUNT - 1, Math.floor(progress * FLAGPOLE_ANIM_FRAME_COUNT));
        }
        const frame = FLAGPOLE_FRAMES[frameIdx];
        const prevSmooth = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(t, frame.sx, frame.sy, frame.sw, frame.sh,
                      drawX, drawY, displayW, FLAGPOLE_H);
        ctx.imageSmoothingEnabled = prevSmooth;
    } else {
        // Minimal fallback when tiles.png fails to load
        ctx.fillStyle = COLOR_FLAGPOLE_GREEN;
        ctx.fillRect(screenX - FLAGPOLE_FALLBACK_WIDTH / 2, drawY, FLAGPOLE_FALLBACK_WIDTH, FLAGPOLE_H);
        ctx.fillStyle = COLOR_FLAGPOLE_BALL;
        ctx.beginPath();
        ctx.arc(screenX, drawY, FLAGPOLE_FALLBACK_BALL_R, 0, Math.PI * 2);
        ctx.fill();
    }
}

export function drawGroundTiles() {
    if (!sprites.ground || !sprites.ground.complete) return;
    const img = sprites.ground;
    const srcSize = groundSourceSize(img);
    const startCol = Math.floor(gameState.scrollOffset / TILE_W);
    const numCols = Math.ceil(canvas.width / TILE_W) + 2;
    const rows = Math.ceil((canvas.height - GROUND_Y) / TILE_H) + 1;

    for (let col = -1; col <= numCols; col++) {
        for (let row = 0; row < rows; row++) {
            const tileX = (startCol + col) * TILE_W - gameState.scrollOffset;
            const tileY = GROUND_Y + row * TILE_H;
            if (tileX + TILE_W < 0 || tileX > canvas.width) continue;
            ctx.drawImage(img, 0, 0, srcSize, srcSize, tileX, tileY, TILE_W, TILE_H);
        }
    }
}

export function drawHearts() {
    if (!sprites.heart || !sprites.heart.complete) return;
    const img = sprites.heart;
    const sw = img.naturalWidth || HEART_SPRITE_W;
    const sh = img.naturalHeight || HEART_SPRITE_H;

    hearts.forEach(function(heart) {
        if (heart.collected || !heart.released) return;
        const x = heart.x - gameState.scrollOffset;
        if (x + HEART_DISPLAY_W < 0 || x > canvas.width) return;

        // Heartbeat rhythm: quick double-thump then pause
        heart.angle += HEARTBEAT_SPEED;
        const t = heart.angle % (Math.PI * 2);
        let beat = 0;
        if (t < HEARTBEAT_FIRST_WINDOW) {
            beat = Math.sin(t * Math.PI / HEARTBEAT_FIRST_WINDOW) * HEARTBEAT_FIRST_AMP;
        } else if (t < HEARTBEAT_SECOND_END) {
            beat = Math.sin((t - HEARTBEAT_FIRST_WINDOW) * Math.PI / HEARTBEAT_SECOND_DURATION) * HEARTBEAT_SECOND_AMP;
        }
        const scale = 1 + beat;

        const cx = x + HEART_W / 2;
        const cy = heart.y + HEART_H / 2;

        // Pulsing glow
        const glowR = HEART_GLOW_BASE_R * (1 + beat * 2);
        const glow = ctx.createRadialGradient(cx, cy, HEART_GLOW_INNER_R, cx, cy, glowR);
        glow.addColorStop(0, HEART_GLOW_CENTER);
        glow.addColorStop(0.6, HEART_GLOW_MID);
        glow.addColorStop(1, HEART_GLOW_EDGE);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Pixel-perfect heart sprite
        const prevSmooth = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, sw, sh, -HEART_DISPLAY_W / 2, -HEART_DISPLAY_H / 2, HEART_DISPLAY_W, HEART_DISPLAY_H);
        ctx.restore();
        ctx.imageSmoothingEnabled = prevSmooth;
    });
}

export function drawPlayer() {
    if (!sprites.character || !sprites.character.complete) return;
    const screenX = player.x - gameState.scrollOffset;
    if (screenX + CHAR_DISPLAY_W < 0 || screenX > canvas.width) return;

    const img = sprites.character;
    const faceRight = player.facing === 1;

    if (useFallbackCharacter) {
        const frame = Math.floor(gameState.animTime / ANIM_FRAME_DIVISOR) % 4;
        const w = FALLBACK_FRAME_SIZE;
        const h = FALLBACK_SHEET_HEIGHT;
        const drawY = player.y - h;

        if (faceRight) {
            ctx.save();
            ctx.translate(screenX + w / 2, drawY + h / 2);
            ctx.scale(-1, 1);
            ctx.translate(-(screenX + w / 2), -(drawY + h / 2));
            ctx.drawImage(img, frame * FALLBACK_FRAME_SIZE, 0, w, h, screenX, drawY, w, h);
            ctx.restore();
        } else {
            ctx.drawImage(img, frame * FALLBACK_FRAME_SIZE, 0, w, h, screenX, drawY, w, h);
        }
        return;
    }

    const r = MARIO_RUN_FRAMES[Math.floor(gameState.animTime / ANIM_FRAME_DIVISOR) % MARIO_RUN_FRAMES.length];
    const dw = CHAR_DISPLAY_W;
    const dh = r[3] * (CHAR_DISPLAY_W / r[2]);
    const dy = player.y - dh;
    const sy = img.naturalHeight - r[1] - r[3];

    if (faceRight) {
        ctx.save();
        ctx.translate(screenX + dw / 2, dy + dh / 2);
        ctx.scale(-1, 1);
        ctx.translate(-(screenX + dw / 2), -(dy + dh / 2));
        ctx.drawImage(img, r[0], sy, r[2], r[3], screenX, dy, dw, dh);
        ctx.restore();
    } else {
        ctx.drawImage(img, r[0], sy, r[2], r[3], screenX, dy, dw, dh);
    }
}

export function drawFireworks() {
    if (fireworks.length === 0) return;
    for (let i = 0; i < fireworks.length; i++) {
        const p = fireworks[i];
        const sx = p.x - gameState.scrollOffset;
        if (sx < -FW_OFFSCREEN_BUFFER || sx > canvas.width + FW_OFFSCREEN_BUFFER) continue;
        const alpha = p.bright * FW_ALPHA_RANGE + FW_ALPHA_MIN;
        const lightness = Math.round(FW_BASE_LIGHTNESS + p.bright * FW_BRIGHT_LIGHTNESS);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'hsl(' + p.hue + ',100%,' + lightness + '%)';
        ctx.beginPath();
        ctx.arc(sx, p.y, p.size * p.bright, 0, Math.PI * 2);
        ctx.fill();

        // Glow trail
        ctx.globalAlpha = alpha * FW_GLOW_ALPHA;
        ctx.beginPath();
        ctx.arc(sx, p.y, p.size * p.bright * FW_GLOW_SIZE, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}
