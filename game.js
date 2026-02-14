// Game constants
const GRAVITY = 0.6;
const JUMP_STRENGTH = -12;
const GROUND_Y = canvas.height - 80;
const SCROLL_SPEED = 5;

// Level data
const LEVELS = [
    {
        id: 0,
        title: "College Days 📚",
        subtitle: "Where It All Began",
        description: "Project group partners who became inseparable best friends for 4 amazing years! From late-night assignments to endless conversations, you were someone special. 📚✨",
        difficulty: "Easy",
        theme: 'college',
        hazardCount: 0
    },
    {
        id: 1,
        title: "Our First Date 🥟",
        subtitle: "Park By The Lake",
        description: "Remember that beautiful day at the park by the lake? The sun reflected off the water, and we couldn't stop talking. Those delicious momos at momo.i.am changed everything. 🥟💕",
        difficulty: "Easy",
        theme: 'park',
        hazardCount: 3
    },
    {
        id: 2,
        title: "Pariah Night 🎵",
        subtitle: "A Magical Connection",
        description: "Your first time getting high with me... Steven Wilson's 'Pariah' playing softly. That magical connection we felt. That night, I realized you were my soulmate. 🎵🌙",
        difficulty: "Medium",
        theme: 'night',
        hazardCount: 4
    },
    {
        id: 3,
        title: "Lake Talks 🌅",
        subtitle: "Deep Conversations",
        description: "All those walks around college, deep conversations by the lake at dawn. Hours felt like minutes with you. We talked about dreams and fears. I fell in love with your mind first. 🌅💭",
        difficulty: "Medium",
        theme: 'dawn',
        hazardCount: 4
    },
    {
        id: 4,
        title: "Ooty Adventure 🏔️",
        subtitle: "Mountains & Mist",
        description: "Our first trip together! Mountains, mist, and making memories that would last forever. Exploring together, laughing freely. That trip showed me adventures are better with you. 🏔️❤️",
        difficulty: "Hard",
        theme: 'mountain',
        hazardCount: 5
    },
    {
        id: 5,
        title: "Goa Beach Race 🏖️",
        subtitle: "Freedom & Joy",
        description: "Racing on the beach just for fun, feeling free and alive. The sand beneath our feet, the ocean breeze. Pure joy in the simplest moments. That's when I realized love is these perfect little moments. 🏖️🏃",
        difficulty: "Hard",
        theme: 'beach',
        hazardCount: 5
    },
    {
        id: 6,
        title: "Horror Movie Nights 🎬",
        subtitle: "Safe in Your Arms",
        description: "Our favorite thing - getting scared together during horror movies, holding each other close. Your hand in mine, your head on my shoulder. Those weren't just movies - they were moments where I felt completely safe. 🎬👻",
        difficulty: "Hard",
        theme: 'dark',
        hazardCount: 6
    }
];

// Game state
let gameState = {
    running: false,
    paused: false,
    currentLevel: 0,
    heartsCollected: 0,
    totalHearts: 7,
    scrollOffset: 0,
    levelStarted: false
};

let gameLoopId = null;

// Player object
let player = {
    x: 100,
    y: GROUND_Y,
    width: 32,
    height: 48,
    velocityY: 0,
    jumping: false,
    direction: 1,
    isAirborne: false
};

// Game objects
let hearts = [];
let hazards = [];
let particles = [];

// Create level hazards
function createHazards() {
    const level = LEVELS[gameState.currentLevel];
    hazards = [];

    for (let i = 0; i < level.hazardCount; i++) {
        const x = 600 + i * 900;
        const type = i % 2 === 0 ? 'spike' : 'gap';
        
        if (type === 'spike') {
            hazards.push({
                type: 'spike',
                x: x,
                y: GROUND_Y,
                width: 40,
                height: 50
            });
        } else {
            hazards.push({
                type: 'gap',
                x: x,
                y: GROUND_Y + 40,
                width: 120,
                height: 40
            });
        }
    }
}

// Create heart
function createHearts() {
    hearts = [];
    const level = LEVELS[gameState.currentLevel];
    
    // Single heart per level - place it where player can easily reach it
    let x;
    if (gameState.currentLevel === 0) {
        x = 800; // Level 1: Very close
    } else {
        x = 1000 + level.hazardCount * 600; // Other levels
    }
    
    hearts.push({
        id: level.id,
        x: x,
        y: GROUND_Y - 150,
        width: 32,
        height: 32,
        collected: false,
        angle: 0,
        level: gameState.currentLevel
    });
    console.log(`Level ${gameState.currentLevel}: Heart placed at x=${x}, Player starts at x=100`);
}

// Game logic
function updatePlayer() {
    // Auto-run
    player.x += 4;

    // Apply gravity
    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    // Check if airborne
    player.isAirborne = player.y < GROUND_Y;

    // Ground collision
    if (player.y >= GROUND_Y) {
        player.y = GROUND_Y;
        player.velocityY = 0;
        player.jumping = false;
    }

    // Hazard collision
    hazards.forEach(hazard => {
        if (hazard.type === 'spike') {
            if (checkCollision(player, hazard)) {
                resetLevel();
            }
        } else if (hazard.type === 'gap') {
            if (player.y >= GROUND_Y && checkCollision(player, hazard)) {
                resetLevel();
            }
        }
    });

    // Update scroll
    gameState.scrollOffset = Math.max(0, player.x - 200);
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function checkHeartCollision() {
    hearts.forEach(heart => {
        if (!heart.collected) {
            const dx = player.x - heart.x;
            const dy = player.y - heart.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 40) {
                console.log('Heart collected!');
                heart.collected = true;
                gameState.heartsCollected++;
                document.getElementById('heartCount').textContent = gameState.heartsCollected;

                const level = LEVELS[gameState.currentLevel];
                showMemory(level);
                pauseGame();
            }
        }
    });
}

function resetLevel() {
    player.x = 100;
    player.y = GROUND_Y;
    player.velocityY = 0;
    gameState.scrollOffset = 0;
}

// Input handling
function handleJump() {
    if (!player.jumping && !gameState.paused && gameState.running) {
        player.velocityY = JUMP_STRENGTH;
        player.jumping = true;
    }
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        handleJump();
    }
});

canvas.addEventListener('click', handleJump);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleJump();
});

// Screen management
function showMemory(level) {
    document.getElementById('memoryTitle').textContent = level.title;
    document.getElementById('memoryText').textContent = level.description;
    document.getElementById('memoryScreen').classList.remove('hidden');
}

function closeMemory() {
    document.getElementById('memoryScreen').classList.add('hidden');
    // Small delay to ensure game loop stops
    setTimeout(() => {
        completeLevelScreen();
    }, 100);
}

function completeLevelScreen() {
    const nextLevelNum = gameState.currentLevel + 1;
    if (nextLevelNum < LEVELS.length) {
        document.getElementById('levelCompleteText').textContent = 
            `You collected a heart! ${gameState.heartsCollected}/${gameState.totalHearts}`;
        document.getElementById('levelCompleteScreen').classList.remove('hidden');
    } else {
        showEndScreen();
    }
}

function nextLevel() {
    document.getElementById('levelCompleteScreen').classList.add('hidden');
    gameState.currentLevel++;
    gameState.running = false;
    gameState.paused = false;
    
    if (gameState.currentLevel >= LEVELS.length) {
        showEndScreen();
    } else {
        showLevelScreen();
    }
}

function pauseGame() {
    gameState.paused = true;
    document.getElementById('instructions').style.display = 'none';
}

function resumeGame() {
    gameState.paused = false;
    document.getElementById('instructions').style.display = 'block';
}

function showLevelScreen() {
    const level = LEVELS[gameState.currentLevel];
    document.getElementById('levelTitle').textContent = level.title;
    document.getElementById('levelSubtitle').textContent = `Difficulty: ${level.difficulty}`;
    document.getElementById('levelDescription').textContent = level.description;
    document.getElementById('levelNumber').textContent = gameState.currentLevel + 1;
    document.getElementById('levelScreen').classList.remove('hidden');
}

function startLevel() {
    document.getElementById('levelScreen').classList.add('hidden');
    gameState.running = true;
    gameState.paused = false;
    gameState.levelStarted = true;
    createHazards();
    createHearts();
    resetLevel();
    gameLoop();
}

function showEndScreen() {
    gameState.running = false;
    document.getElementById('endScreen').classList.remove('hidden');
}

function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    gameState.currentLevel = 0;
    showLevelScreen();
}

function restartGame() {
    document.getElementById('endScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    gameState = {
        running: false,
        paused: false,
        currentLevel: 0,
        heartsCollected: 0,
        totalHearts: 7,
        scrollOffset: 0,
        levelStarted: false
    };
    document.getElementById('heartCount').textContent = '0';
    document.getElementById('levelNumber').textContent = '1';
}

// Main game loop
function gameLoop() {
    // Always draw the background and objects
    drawBackground(gameState.currentLevel);
    hazards.forEach(hazard => drawHazard(hazard));
    hearts.forEach(heart => drawHeart(heart));

    // Only update game logic if not paused
    if (gameState.running && !gameState.paused) {
        updatePlayer();
        checkHeartCollision();
    }

    drawPlayer();

    // Always request next frame if running
    if (gameState.running) {
        gameLoopId = requestAnimationFrame(gameLoop);
    } else {
        gameLoopId = null;
    }
}

console.log('Game ready! Click START GAME to begin.');
