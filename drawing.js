// Drawing module - accessed by game.js
// This file contains all rendering functions

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvas setup
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function setGameReferences(gs, p, h, hz) {
    gameState = gs;
    player = p;
    hearts = h;
    hazards = hz;
}

function drawBackground(levelIndex) {
    const LEVELS = [
        { theme: 'college' },
        { theme: 'park' },
        { theme: 'night' },
        { theme: 'dawn' },
        { theme: 'mountain' },
        { theme: 'beach' },
        { theme: 'dark' }
    ];

    const level = LEVELS[levelIndex];
    
    switch(level.theme) {
        case 'college':
            drawCollegeBg();
            break;
        case 'park':
            drawParkBg();
            break;
        case 'night':
            drawNightBg();
            break;
        case 'dawn':
            drawDawnBg();
            break;
        case 'mountain':
            drawMountainBg();
            break;
        case 'beach':
            drawBeachBg();
            break;
        case 'dark':
            drawDarkBg();
            break;
    }
}

function drawCollegeBg() {
    // Mushroom Kingdom - Grassland
    // Sky gradient (blue)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#5C94E3');
    gradient.addColorStop(1, '#B4D8F7');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // White clouds (Mario clouds)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    const cloudPositions = [100, 400, 700, 1100, 1600, 2100, 2700, 3300];
    
    cloudPositions.forEach(baseX => {
        const x = baseX - gameState.scrollOffset * 0.3;
        const y = 80;
        // Cloud body
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 20, y, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 40, y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Cloud bumps
        ctx.fillRect(x - 15, y - 5, 70, 15);
    });

    // Green pipes
    ctx.fillStyle = '#00AA00';
    for (let i = 0; i < 3; i++) {
        const pipeX = 300 + i * 1000 - gameState.scrollOffset * 0.4;
        // Pipe
        ctx.fillRect(pipeX, GROUND_Y - 80, 50, 80);
        // Pipe rim (darker green)
        ctx.fillStyle = '#007700';
        ctx.fillRect(pipeX - 5, GROUND_Y - 85, 60, 8);
        ctx.fillStyle = '#00AA00';
    }

    // Question mark blocks
    ctx.fillStyle = '#FFFF00';
    for (let i = 0; i < 2; i++) {
        const blockX = 500 + i * 1200 - gameState.scrollOffset * 0.35;
        ctx.fillRect(blockX, GROUND_Y - 120, 30, 30);
        // Block border
        ctx.strokeStyle = '#CC8800';
        ctx.lineWidth = 2;
        ctx.strokeRect(blockX, GROUND_Y - 120, 30, 30);
        // Question mark
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('?', blockX + 8, GROUND_Y - 100);
        ctx.fillStyle = '#FFFF00';
    }

    drawGround();
}

function drawParkBg() {
    // Underground cavern level
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#3D2817');
    gradient.addColorStop(0.5, '#5C3D2E');
    gradient.addColorStop(1, '#2D1810');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Lava pools
    const GROUND_Y = canvas.height - 80;
    ctx.fillStyle = '#FF6600';
    for (let i = 0; i < 3; i++) {
        const lavaX = 200 + i * 1000 - gameState.scrollOffset * 0.4;
        const lavaY = GROUND_Y - 150;
        
        // Lava waves
        ctx.beginPath();
        for (let px = lavaX; px < lavaX + 200; px += 5) {
            const wave = Math.sin((px + gameState.scrollOffset) * 0.02) * 8;
            if (px === lavaX) ctx.moveTo(px, lavaY + wave);
            else ctx.lineTo(px, lavaY + wave);
        }
        ctx.lineTo(lavaX + 200, canvas.height);
        ctx.lineTo(lavaX, canvas.height);
        ctx.closePath();
        ctx.fill();
        
        // Lava glow
        ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
        ctx.fillRect(lavaX - 10, lavaY - 30, 220, 40);
        ctx.fillStyle = '#FF6600';
    }

    // Stalagmites and stalactites
    ctx.fillStyle = '#4A4A4A';
    for (let i = 0; i < 4; i++) {
        const stalaX = 300 + i * 800 - gameState.scrollOffset * 0.35;
        // Stalactites (hanging from top)
        ctx.beginPath();
        ctx.moveTo(stalaX, 0);
        ctx.lineTo(stalaX - 15, 80);
        ctx.lineTo(stalaX + 15, 80);
        ctx.closePath();
        ctx.fill();
        
        // Stalagmites (coming from bottom)
        ctx.beginPath();
        ctx.moveTo(stalaX + 100, GROUND_Y);
        ctx.lineTo(stalaX + 85, GROUND_Y - 80);
        ctx.lineTo(stalaX + 115, GROUND_Y - 80);
        ctx.closePath();
        ctx.fill();
    }

    drawClouds();
    drawGround();
}

function drawNightBg() {
    // Bowser's Castle
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1A1A2E');
    gradient.addColorStop(1, '#0F0F1E');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Red moon
    ctx.fillStyle = '#CC2200';
    ctx.beginPath();
    ctx.arc(canvas.width - 150 - gameState.scrollOffset * 0.1, 120, 80, 0, Math.PI * 2);
    ctx.fill();

    // Castle towers
    const GROUND_Y = canvas.height - 80;
    ctx.fillStyle = '#4A4A4A';
    for (let i = 0; i < 3; i++) {
        const castleX = 200 + i * 1200 - gameState.scrollOffset * 0.3;
        // Main castle body
        ctx.fillRect(castleX, GROUND_Y - 200, 150, 200);
        
        // Towers
        ctx.fillRect(castleX + 10, GROUND_Y - 250, 30, 50);
        ctx.fillRect(castleX + 110, GROUND_Y - 250, 30, 50);
        
        // Flags
        ctx.fillStyle = '#CC0000';
        ctx.fillRect(castleX + 15, GROUND_Y - 260, 20, 15);
        ctx.fillRect(castleX + 115, GROUND_Y - 260, 20, 15);
        ctx.fillStyle = '#4A4A4A';
        
        // Windows (lit red)
        ctx.fillStyle = '#FF4400';
        for (let j = 0; j < 3; j++) {
            for (let k = 0; k < 3; k++) {
                ctx.fillRect(castleX + 30 + j * 40, GROUND_Y - 170 + k * 40, 20, 20);
            }
        }
        ctx.fillStyle = '#4A4A4A';
    }

    // Flying obstacles (bats?)
    ctx.fillStyle = '#222222';
    for (let i = 0; i < 3; i++) {
        const batX = 400 + i * 1000 - gameState.scrollOffset * 0.2;
        const batY = 150 + Math.sin(gameState.scrollOffset * 0.02 + i) * 30;
        ctx.beginPath();
        ctx.arc(batX, batY, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    drawGround();
}

function drawDawnBg() {
    // Water level
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.4, '#B0E0E6');
    gradient.addColorStop(1, '#4A90E2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const GROUND_Y = canvas.height - 80;
    
    // Water surface
    ctx.fillStyle = '#3366CC';
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        for (let x = -gameState.scrollOffset; x < canvas.width + 200; x += 10) {
            const wave = Math.sin((x + gameState.scrollOffset * 0.05) * 0.05 + i * 0.5) * 10;
            const y = GROUND_Y - 150 + i * 30 + wave;
            if (x === -gameState.scrollOffset) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width + 200, canvas.height);
        ctx.lineTo(-gameState.scrollOffset, canvas.height);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(51, 102, 204, 0.8)';
    }

    // Lily pads
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < 5; i++) {
        const lilyX = 300 + i * 600 - gameState.scrollOffset * 0.35;
        const lilyY = GROUND_Y - 160 + Math.sin(gameState.scrollOffset * 0.01 + i) * 5;
        ctx.beginPath();
        ctx.ellipse(lilyX, lilyY, 30, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Flower on lily pad
        ctx.fillStyle = '#FF6EC7';
        ctx.beginPath();
        ctx.arc(lilyX, lilyY - 15, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#228B22';
    }

    // Underwater rocks
    ctx.fillStyle = '#8B7355';
    for (let i = 0; i < 3; i++) {
        const rockX = 400 + i * 900 - gameState.scrollOffset * 0.4;
        ctx.beginPath();
        ctx.ellipse(rockX, GROUND_Y - 50, 40, 30, 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawGround();
}

function drawMountainBg() {
    // Peach's Castle
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const GROUND_Y = canvas.height - 80;

    // Mountains in background
    ctx.fillStyle = 'rgba(139, 115, 85, 0.5)';
    ctx.beginPath();
    ctx.moveTo(0 - gameState.scrollOffset * 0.5, GROUND_Y);
    ctx.lineTo(200 - gameState.scrollOffset * 0.5, GROUND_Y - 200);
    ctx.lineTo(400 - gameState.scrollOffset * 0.5, GROUND_Y);
    ctx.fill();

    // Peach's Castle
    ctx.fillStyle = '#FFB6C1';
    const castleX = 400 - gameState.scrollOffset * 0.3;
    
    // Main castle body
    ctx.fillRect(castleX, GROUND_Y - 200, 250, 200);
    
    // Roof (triangles)
    ctx.fillStyle = '#CC1493';
    ctx.beginPath();
    ctx.moveTo(castleX + 50, GROUND_Y - 200);
    ctx.lineTo(castleX + 100, GROUND_Y - 260);
    ctx.lineTo(castleX + 150, GROUND_Y - 200);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(castleX + 150, GROUND_Y - 200);
    ctx.lineTo(castleX + 200, GROUND_Y - 260);
    ctx.lineTo(castleX + 250, GROUND_Y - 200);
    ctx.fill();
    
    // Castle towers
    ctx.fillStyle = '#FFB6C1';
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(castleX + 30 + i * 100, GROUND_Y - 250, 30, 50);
    }
    
    // Tower roofs
    ctx.fillStyle = '#CC1493';
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(castleX + 30 + i * 100, GROUND_Y - 250);
        ctx.lineTo(castleX + 45 + i * 100, GROUND_Y - 270);
        ctx.lineTo(castleX + 60 + i * 100, GROUND_Y - 250);
        ctx.fill();
    }
    
    // Flags
    ctx.fillStyle = '#FFFF00';
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(castleX + 38 + i * 100, GROUND_Y - 275, 15, 20);
    }
    
    // Windows
    ctx.fillStyle = '#FFD700';
    for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 2; k++) {
            ctx.fillRect(castleX + 50 + j * 50, GROUND_Y - 180 + k * 50, 20, 20);
        }
    }

    drawGround();
}

function drawBeachBg() {
    // Ice/Snow World
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#E0F6FF');
    gradient.addColorStop(0.5, '#B0E0E6');
    gradient.addColorStop(1, '#87CEEB');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const GROUND_Y = canvas.height - 80;

    // Icicles hanging from top
    ctx.fillStyle = '#B0E0E6';
    for (let i = 0; i < 6; i++) {
        const icicleX = 200 + i * 600 - gameState.scrollOffset * 0.3;
        ctx.beginPath();
        ctx.moveTo(icicleX, 0);
        ctx.lineTo(icicleX - 8, 50);
        ctx.lineTo(icicleX + 8, 50);
        ctx.closePath();
        ctx.fill();
    }

    // Ice platforms
    ctx.fillStyle = '#E0FFFF';
    for (let i = 0; i < 4; i++) {
        const platformX = 300 + i * 1000 - gameState.scrollOffset * 0.35;
        ctx.fillRect(platformX, GROUND_Y - 150, 150, 30);
        // Ice shine
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(platformX, GROUND_Y - 150, 150, 30);
    }

    // Snowballs (enemies)
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 3; i++) {
        const snowballX = 400 + i * 800 - gameState.scrollOffset * 0.4;
        const snowballY = GROUND_Y - 200 + Math.sin(gameState.scrollOffset * 0.01 + i) * 20;
        ctx.beginPath();
        ctx.arc(snowballX, snowballY, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(snowballX - 8, snowballY - 10, 4, 4);
        ctx.fillRect(snowballX + 4, snowballY - 10, 4, 4);
        
        // Smile
        ctx.beginPath();
        ctx.arc(snowballX, snowballY, 8, 0, Math.PI);
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
    }

    drawGround();
}

function drawDarkBg() {
    // Bowser's Lava World - Final Level
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1A0033');
    gradient.addColorStop(0.5, '#330033');
    gradient.addColorStop(1, '#1A0000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const GROUND_Y = canvas.height - 80;

    // Massive lava lake
    ctx.fillStyle = '#FF4400';
    ctx.fillRect(0, GROUND_Y - 100, canvas.width, 100);
    
    // Lava waves/bubbles
    for (let i = 0; i < 8; i++) {
        const bubbleX = 200 + i * 400 - gameState.scrollOffset * 0.2;
        const bubbleY = GROUND_Y - 80 + Math.sin(gameState.scrollOffset * 0.02 + i) * 15;
        const bubbleSize = 10 + Math.sin(gameState.scrollOffset * 0.01 + i * 0.5) * 5;
        
        ctx.fillStyle = 'rgba(255, 100, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
        ctx.fill();
    }

    // Lava glow
    ctx.fillStyle = 'rgba(255, 69, 0, 0.3)';
    ctx.fillRect(0, GROUND_Y - 200, canvas.width, 200);

    // Floating rocks/islands
    ctx.fillStyle = '#4A4A4A';
    for (let i = 0; i < 5; i++) {
        const rockX = 300 + i * 700 - gameState.scrollOffset * 0.3;
        const rockY = GROUND_Y - 150;
        
        // Rock shape
        ctx.beginPath();
        ctx.ellipse(rockX, rockY, 50, 30, 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Rock highlight
        ctx.fillStyle = '#666666';
        ctx.beginPath();
        ctx.ellipse(rockX - 15, rockY - 15, 15, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4A4A4A';
    }

    // Flying Bowser Jr balls
    ctx.fillStyle = '#CC0000';
    for (let i = 0; i < 3; i++) {
        const ballX = 400 + i * 600 - gameState.scrollOffset * 0.25;
        const ballY = 200 + Math.sin(gameState.scrollOffset * 0.03 + i) * 50;
        ctx.beginPath();
        ctx.arc(ballX, ballY, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(ballX - 10, ballY - 8, 6, 6);
        ctx.fillRect(ballX + 4, ballY - 8, 6, 6);
        ctx.fillStyle = '#CC0000';
    }

    drawGround();
}

function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const cloudPositions = [200, 600, 1100, 1700, 2300, 3000, 3700, 4400, 5200];
    
    cloudPositions.forEach(baseX => {
        const x = baseX - gameState.scrollOffset * 0.3;
        const y = 100 + Math.sin((gameState.scrollOffset + baseX) * 0.01) * 20;
        
        // Draw cloud with multiple circles
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.arc(x + i * 20, y, 18, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawGround() {
    const GROUND_Y = canvas.height - 80;
    
    // Main ground color (brick brown)
    ctx.fillStyle = '#CC6633';
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

    // Mario-style brick pattern
    ctx.fillStyle = '#DD7744';
    ctx.strokeStyle = '#663300';
    ctx.lineWidth = 2;
    
    for (let i = -1; i < canvas.width / 40 + 2; i++) {
        for (let j = 0; j < 3; j++) {
            const x = (i * 40 - gameState.scrollOffset % 40);
            const y = GROUND_Y + j * 40;
            
            // Brick
            ctx.fillRect(x, y, 40, 40);
            ctx.strokeRect(x, y, 40, 40);
            
            // Brick spots/pits
            ctx.fillStyle = '#BB5522';
            ctx.fillRect(x + 8, y + 8, 5, 5);
            ctx.fillRect(x + 27, y + 8, 5, 5);
            ctx.fillRect(x + 8, y + 27, 5, 5);
            ctx.fillRect(x + 27, y + 27, 5, 5);
            ctx.fillStyle = '#DD7744';
        }
    }
}

function drawPlayer() {
    const x = player.x - gameState.scrollOffset;
    const GROUND_Y = canvas.height - 80;
    
    // Mario sprite - pixelated style
    // Head (skin color)
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(x + 6, player.y - 40, 20, 12);
    
    // Eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 9, player.y - 38, 3, 3);
    ctx.fillRect(x + 18, player.y - 38, 3, 3);
    
    // Nose
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 14, player.y - 35, 2, 2);
    
    // Mustache (iconic Mario mustache)
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 8, player.y - 34, 3, 2);
    ctx.fillRect(x + 19, player.y - 34, 3, 2);
    
    // Red cap
    ctx.fillStyle = '#DD0000';
    ctx.fillRect(x + 5, player.y - 44, 22, 5);
    ctx.fillRect(x + 9, player.y - 45, 14, 1);
    
    // Cap M
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 13, player.y - 43, 2, 2);
    
    // Body (red shirt)
    ctx.fillStyle = '#DD0000';
    ctx.fillRect(x + 6, player.y - 28, 20, 12);
    
    // Shirt buttons
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(x + 10, player.y - 24, 3, 3);
    ctx.fillRect(x + 21, player.y - 24, 3, 3);
    
    // Arms (skin color)
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(x + 2, player.y - 26, 4, 10);
    ctx.fillRect(x + 28, player.y - 26, 4, 10);
    
    // Gloves (white)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 2, player.y - 16, 4, 4);
    ctx.fillRect(x + 28, player.y - 16, 4, 4);
    
    // Pants (blue)
    ctx.fillStyle = '#0033CC';
    ctx.fillRect(x + 8, player.y - 16, 16, 10);
    
    // Shoes (red)
    ctx.fillStyle = '#DD0000';
    ctx.fillRect(x + 6, player.y - 6, 8, 7);
    ctx.fillRect(x + 20, player.y - 6, 8, 7);
    
    // Shoe soles (black)
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 6, player.y - 1, 8, 2);
    ctx.fillRect(x + 20, player.y - 1, 8, 2);

    // Glow when jumping with stars
    if (player.isAirborne) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
        const starSize = 3 + Math.sin(gameState.scrollOffset * 0.1) * 1;
        ctx.fillRect(x - 8, player.y - 20, starSize, starSize);
        ctx.fillRect(x + 36, player.y - 15, starSize, starSize);
    }
}

function drawHeart(heart) {
    const x = heart.x - gameState.scrollOffset;
    const y = heart.y;

    if (heart.collected) return;

    // Pulsing effect
    heart.angle += 0.05;
    const scale = 1 + Math.sin(heart.angle) * 0.15;
    const glowSize = 20 + Math.sin(heart.angle * 2) * 5;

    ctx.save();
    ctx.translate(x + 16, y + 16);
    ctx.scale(scale, scale);

    // Glow
    ctx.fillStyle = 'rgba(255, 20, 147, 0.3)';
    ctx.beginPath();
    ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
    ctx.fill();

    // Heart shape
    ctx.fillStyle = '#FF1493';
    ctx.shadowColor = 'rgba(255, 20, 147, 1)';
    ctx.shadowBlur = 15;

    const size = 12;
    ctx.beginPath();
    ctx.moveTo(0, -size + 2);
    ctx.bezierCurveTo(-size, -size, -size - 2, -size + 4, -size - 2, -size + 4);
    ctx.bezierCurveTo(-size - 2, -size + 8, -size / 2, -size / 2, 0, size);
    ctx.bezierCurveTo(size / 2, -size / 2, size + 2, -size + 8, size + 2, -size + 4);
    ctx.bezierCurveTo(size + 2, -size + 4, size, -size, 0, -size + 2);
    ctx.fill();

    // Inner shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(-3, -3, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawHazard(hazard) {
    const x = hazard.x - gameState.scrollOffset;
    const y = hazard.y;

    if (hazard.type === 'spike') {
        // Draw spikes
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 10, y - 30);
        ctx.lineTo(x + 20, y);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x + 20, y);
        ctx.lineTo(x + 30, y - 30);
        ctx.lineTo(x + 40, y);
        ctx.fill();

        // Glow
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 5, y - 35, 50, 40);
    } else if (hazard.type === 'gap') {
        // Draw gap (dark hole)
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, hazard.width, 40);
        ctx.strokeStyle = '#4A4A4A';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, hazard.width, 40);
    }
}
