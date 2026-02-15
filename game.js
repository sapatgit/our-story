(function() {
    'use strict';

    // ===========================================================================
    // CANVAS SETUP
    // ===========================================================================
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // ===========================================================================
    // CONSTANTS — Physics, Dimensions, Layout, Colors, and Visual Parameters
    // ===========================================================================

    // ---- Physics & Movement ----
    /** Downward acceleration applied to the player each frame */
    const GRAVITY = 0.6;
    /** Initial upward velocity when the player jumps (negative = upward) */
    const JUMP_STRENGTH = -12;
    /** Horizontal pixels moved per frame when an arrow key is held */
    const SCROLL_SPEED = 4;
    /** Pixels the flag slides down per frame during the flagpole animation */
    const FLAG_SLIDE_SPEED = 6;

    // ---- Core Tile & Character Dimensions (pixels) ----
    const TILE_W = 40;
    const TILE_H = 40;
    /** Rendered width of the player character on screen */
    const CHAR_DISPLAY_W = 32;
    /** Rendered height of the player character on screen */
    const CHAR_DISPLAY_H = 48;
    /** Width of a collectible heart's collision / display box */
    const HEART_W = 32;
    /** Height of a collectible heart's collision / display box */
    const HEART_H = 32;

    // ---- Ground Sprite Source Detection ----
    // The ground sprite (bricks.png) may be 80 px wide (two 16×16 tiles
    // side-by-side). We detect this to pick the correct source rect.
    const GROUND_SPRITE_DOUBLE_WIDTH = 80;
    const GROUND_SPRITE_TILE_SIZE = 16;

    // ---- Mario Sprite Sheet ----
    // Frame rects from Unity .meta file (row y = 341): [sx, sy, sw, sh].
    // NOTE: MARIO_JUMP_FRAME was removed — it was defined but never used.
    const MARIO_SHEET_Y = 341;
    const MARIO_RUN_FRAMES = [
        [142, MARIO_SHEET_Y, 16, 16],
        [161, MARIO_SHEET_Y, 13, 16],
        [177, MARIO_SHEET_Y, 15, 16],
        [195, MARIO_SHEET_Y, 11, 16]
    ];

    // ---- Fallback Character Sheet ----
    const FALLBACK_SHEET_WIDTH = 160;   // canvas width for generated sprite sheet
    const FALLBACK_SHEET_HEIGHT = 48;   // canvas height for generated sprite sheet
    const FALLBACK_FRAME_COUNT = 5;     // number of animation frames
    const FALLBACK_FRAME_SIZE = 32;     // pixel width of each frame cell

    // ---- Heart Sprite (Pixel Art) ----
    const HEART_SPRITE_W = 13;              // source pixel-art width
    const HEART_SPRITE_H = 12;              // source pixel-art height
    const HEART_SPRITE_SCALE = 3;           // integer scale for crisp rendering
    const HEART_DISPLAY_W = HEART_SPRITE_W * HEART_SPRITE_SCALE; // 39
    const HEART_DISPLAY_H = HEART_SPRITE_H * HEART_SPRITE_SCALE; // 36

    // ---- Generated Ground Tile ----
    const GEN_TILE_OUTLINE_WIDTH = 2;       // stroke width for brick outline
    const GEN_TILE_PIT_SIZE = 4;            // size of dark "pit" accent squares
    const GEN_TILE_PIT_INSET = 6;           // inset of pit squares from tile edge
    const GEN_TILE_PIT_FAR = 30;            // far-side inset for pit squares

    // ---- Cloud Rendering ----
    /** Parallax speed factor — clouds scroll at this fraction of foreground speed */
    const CLOUD_PARALLAX = 0.3;
    /** Scale multiplier when drawing cloud sprites from tiles.png */
    const CLOUD_SPRITE_SCALE = 2;
    /** World X positions where clouds are placed */
    const CLOUD_POSITIONS = [100, 500, 900, 1400, 2000, 2600, 3200, 3800, 4500];
    /** Y position for sprite-based clouds */
    const CLOUD_Y_SPRITE = 60;
    /** Y position for fallback (circle-based) clouds */
    const CLOUD_Y_FALLBACK = 70;
    // Cloud tile source rects from tiles.png
    const CLOUD_SRC_LEFT  = { sx: 211, sy: 69, sw: 8,  sh: 24 };
    const CLOUD_SRC_MID   = { sx: 219, sy: 69, sw: 16, sh: 24 };
    const CLOUD_SRC_RIGHT = { sx: 235, sy: 69, sw: 8,  sh: 24 };
    // Fallback cloud geometry
    const CLOUD_ARC_SMALL = 18;         // radius of the small side arcs
    const CLOUD_ARC_LARGE = 22;         // radius of the large center arc
    const CLOUD_FALLBACK_RECT_W = 72;   // rectangular base width
    const CLOUD_FALLBACK_RECT_H = 14;   // rectangular base height

    // ---- Pipe Layout & Rendering ----
    /** World X positions of pipes rising from the ground */
    const PIPE_XS = [500, 1600, 3000, 4600, 6200];
    const PIPE_W = 48;
    const PIPE_H = 96;
    /** Scale multiplier for drawing pipe sprites from tiles.png */
    const PIPE_SPRITE_SCALE = 2;
    /** Vertical offset of the first pipe body segment below the rim */
    const PIPE_BODY_OFFSET_1 = 32;
    /** Vertical offset of the second pipe body segment below the rim */
    const PIPE_BODY_OFFSET_2 = 64;
    /** How much the fallback pipe rim extends beyond the body on each side */
    const PIPE_RIM_OVERHANG = 4;
    /** Height of the fallback pipe rim cap */
    const PIPE_RIM_CAP_HEIGHT = 10;
    /** Total extra width added to each side of the fallback pipe rim */
    const PIPE_RIM_EXTRA_WIDTH = 8;
    /** Vertical offset of the fallback pipe rim above the pipe top */
    const PIPE_RIM_Y_OFFSET = 6;

    // ---- Brick Platforms (decorative, non-heart-bearing) ----
    // yOff = vertical offset from GROUND_Y; negative = above ground
    const BRICK_PLATFORMS = [
        { x: 950,  yOff: -112, w: 120, h: 24 },
        { x: 2100, yOff: -136, w: 120, h: 24 },
        { x: 3700, yOff: -120, w: 140, h: 24 },
        { x: 5300, yOff: -104, w: 120, h: 24 }
    ];

    // ---- Heart (Question-Block) Platforms ----
    // Each entry: x, yOff (from GROUND_Y), numBlocks (TILE_W-wide tiles),
    // heartIndex = which block is the "?" question block.
    // Max jump ≈ 114 px; heart released above platform.
    // Safe yOff range: roughly −82 to −146.
    const HEART_PLATFORMS = [
        { x: 670,  yOff: -108, numBlocks: 5, heartIndex: 2 },
        { x: 1870, yOff: -118, numBlocks: 5, heartIndex: 2 },
        { x: 3120, yOff: -126, numBlocks: 5, heartIndex: 2 },
        { x: 4320, yOff: -134, numBlocks: 5, heartIndex: 2 },
        { x: 5520, yOff: -140, numBlocks: 5, heartIndex: 2 },
        { x: 6820, yOff: -130, numBlocks: 5, heartIndex: 2 },
        { x: 8120, yOff: -118, numBlocks: 5, heartIndex: 2 }
    ];
    /** Gap in pixels between the platform top edge and the heart hovering above it */
    const HEART_RELEASE_GAP = 8;

    // ---- Question-Block Visual ----
    /** Font size of the "?" character as a fraction of TILE_H */
    const Q_MARK_FONT_SIZE_FACTOR = 0.5;
    /** Vertical text-baseline offset factor for centering "?" in the block */
    const Q_MARK_Y_FACTOR = 0.72;

    // ---- Triangle Mountain (end-of-level staircase) ----
    /** World X of the left edge of the triangular mountain */
    const TRIANGLE_MOUNTAIN_LEFT = 8600;
    /** Number of blocks in the bottom row */
    const TRIANGLE_MOUNTAIN_BASE_BLOCKS = 11;
    /** Number of stacked rows */
    const TRIANGLE_MOUNTAIN_ROWS = 6;

    // ---- Flagpole ----
    /** World X position of the flagpole */
    const FLAGPOLE_X = 9240;
    /** Rendered height of the flagpole on screen */
    const FLAGPOLE_H = 380;
    /** Rendered width of the flag graphic */
    const FLAG_DISPLAY_W = 56;
    /** Rendered height of the flag graphic */
    const FLAG_DISPLAY_H = 44;
    /** Height of the flagpole sprite in tiles.png (used for scale calc) */
    const FLAGPOLE_SPRITE_H = 168;
    /** Width of the flagpole sprite in tiles.png */
    const FLAGPOLE_SPRITE_W = 24;
    /** X offset of the pole shaft within the sprite (for alignment) */
    const FLAGPOLE_SHAFT_OFFSET_X = 14;
    /** Collision width of the pole itself */
    const FLAGPOLE_COLLISION_W = 16;
    /** Extra pixels past the pole that still trigger the flag-reach sequence */
    const FLAGPOLE_HITBOX_EXTEND = 24;
    /** Horizontal offset of the player from FLAGPOLE_X during the slide */
    const FLAGPOLE_PLAYER_OFFSET_X = 6;
    /** Vertical offset applied to the player during the flag slide */
    const FLAGPOLE_PLAYER_OFFSET_Y = 10;
    /** Total number of flag animation frames */
    const FLAGPOLE_ANIM_FRAME_COUNT = 5;
    /** Pole width for the fallback drawing when tiles.png is unavailable */
    const FLAGPOLE_FALLBACK_WIDTH = 8;
    /** Ball radius at the top of the fallback flagpole */
    const FLAGPOLE_FALLBACK_BALL_R = 10;
    // 5 flagpole animation frames from tiles.png (flag slides top → bottom)
    const FLAGPOLE_FRAMES = [
        { sx: 249, sy: 594, sw: 24, sh: 168 }, // frame 0: flag at top
        { sx: 216, sy: 594, sw: 24, sh: 168 }, // frame 1: flag upper-mid
        { sx: 182, sy: 594, sw: 24, sh: 168 }, // frame 2: flag middle
        { sx: 149, sy: 594, sw: 24, sh: 168 }, // frame 3: flag lower-mid
        { sx: 117, sy: 594, sw: 23, sh: 168 }, // frame 4: flag at bottom
    ];

    // ---- Castle ----
    /** World X position of the castle */
    const CASTLE_X = 9500;
    /** Rendered width of the castle */
    const CASTLE_W = 560;
    /** Rendered height of the castle */
    const CASTLE_H = 500;
    /** Vertical gap between the castle bottom and GROUND_Y */
    const CASTLE_BASE_OFFSET = 24;
    /** Extra pixels added to off-screen culling checks for the castle */
    const CASTLE_OFFSCREEN_BUFFER = 50;
    /** Fallback door width (drawn when tiles.png is unavailable) */
    const CASTLE_DOOR_W = 72;
    /** Fallback door height */
    const CASTLE_DOOR_H = 80;
    /** Door bottom margin above the castle base */
    const CASTLE_DOOR_MARGIN = 24;
    /** Alpha for the darkening overlay on fallback castle bricks */
    const CASTLE_OVERLAY_ALPHA = 0.45;
    // tiles.png (411×949) sprite region for the castle
    const TILES_CASTLE = { sx: 79, sy: 767, sw: 148, sh: 176 };
    /** Expected width of the tiles.png sprite sheet */
    const TILES_IMAGE_W = 411;
    /** Expected height of the tiles.png sprite sheet */
    const TILES_IMAGE_H = 949;
    // tiles.png pipe sprite regions
    const TILES_PIPE_RIM  = { sx: 309, sy: 417, sw: 32, sh: 16 };
    const TILES_PIPE_BODY = { sx: 309, sy: 433, sw: 32, sh: 15 };

    // ---- Heartbeat Animation ----
    /** Angular speed of the heartbeat oscillation */
    const HEARTBEAT_SPEED = 0.08;
    /** Radian window for the first (stronger) pulse */
    const HEARTBEAT_FIRST_WINDOW = 0.5;
    /** Scale amplitude of the first pulse */
    const HEARTBEAT_FIRST_AMP = 0.22;
    /** Radian offset where the second pulse ends */
    const HEARTBEAT_SECOND_END = 1.2;
    /** Radian duration of the second pulse */
    const HEARTBEAT_SECOND_DURATION = 0.7;
    /** Scale amplitude of the second pulse */
    const HEARTBEAT_SECOND_AMP = 0.13;
    /** Base radius of the pulsing glow behind each heart */
    const HEART_GLOW_BASE_R = 24;
    /** Inner gradient radius for the heart glow */
    const HEART_GLOW_INNER_R = 4;

    // ---- Animation & Camera ----
    /** Number of game frames per character animation frame */
    const ANIM_FRAME_DIVISOR = 8;
    /** Player is kept this many pixels from the left canvas edge (camera lead) */
    const CAMERA_LEAD_OFFSET = 200;
    /** Leftmost world X the player can reach */
    const PLAYER_MIN_X = 100;

    // ---- Collision Detection Thresholds ----
    /** Max horizontal distance (px) between player and heart centers for pickup */
    const HEART_COLLECT_DX = 28;
    /** Max vertical distance (px) between player and heart centers for pickup */
    const HEART_COLLECT_DY = 32;
    /** Pixels above platform top that still count as "landing on it" */
    const LAND_TOLERANCE_ABOVE = 4;
    /** Pixels below platform top that still count as "landing on it" */
    const LAND_TOLERANCE_BELOW = 20;
    /** Max distance (px) between player's head and block bottom for a head-bump */
    const HEAD_HIT_TOLERANCE = 36;
    /** Pixels the player is pushed down after head-bumping a question block */
    const HEAD_BOUNCE_PUSH = 2;

    // ---- Firework Burst Parameters ----
    /** Downward acceleration applied to each firework particle per frame */
    const FW_GRAVITY = 0.06;
    /** Velocity damping multiplier per frame for firework particles */
    const FW_DRAG = 0.98;
    /** Frames between consecutive firework bursts */
    const FW_SPAWN_INTERVAL = 30;
    /** Minimum number of particles per burst */
    const FW_MIN_PARTICLES = 30;
    /** Additional random particles (0 .. N−1) per burst */
    const FW_EXTRA_PARTICLES = 25;
    /** Minimum outward speed of a particle */
    const FW_MIN_SPEED = 2;
    /** Additional random speed per particle */
    const FW_EXTRA_SPEED = 4;
    /** Minimum lifetime (frames) of a particle */
    const FW_MIN_LIFE = 60;
    /** Additional random lifetime (frames) per particle */
    const FW_EXTRA_LIFE = 40;
    /** Maximum possible lifetime (for brightness ratio calculation) */
    const FW_MAX_LIFE = 100;
    /** Minimum particle dot radius */
    const FW_MIN_SIZE = 2;
    /** Additional random dot radius per particle */
    const FW_EXTRA_SIZE = 2;
    /** Random hue spread (±half) around the burst's base hue */
    const FW_HUE_SPREAD = 40;
    /** Angular jitter applied to each particle's direction */
    const FW_ANGLE_JITTER = 0.4;
    /** Leftmost fraction of CASTLE_W for burst origin X */
    const FW_X_MIN_FRAC = 0.2;
    /** Width-fraction range for burst origin X */
    const FW_X_RANGE_FRAC = 0.6;
    /** Minimum height (px) above castle top for burst origin */
    const FW_Y_MIN_OFFSET = 40;
    /** Additional random height above castle top for burst origin */
    const FW_Y_EXTRA_OFFSET = 200;
    /** Off-screen pixel buffer for skipping particle rendering */
    const FW_OFFSCREEN_BUFFER = 20;
    /** Minimum alpha of a firework particle (when brightness = 0) */
    const FW_ALPHA_MIN = 0.1;
    /** Alpha range scaled by brightness (min + range * bright = 1.0 at full) */
    const FW_ALPHA_RANGE = 0.9;
    /** Alpha multiplier for the glow trail behind each particle */
    const FW_GLOW_ALPHA = 0.3;
    /** Size multiplier for the glow trail circle relative to the dot */
    const FW_GLOW_SIZE = 2.5;
    /** Base HSL lightness percentage for firework particles */
    const FW_BASE_LIGHTNESS = 50;
    /** Additional HSL lightness scaled by brightness */
    const FW_BRIGHT_LIGHTNESS = 30;

    // ---- Sky Gradient Colors ----
    const SKY_COLOR_TOP = '#5C94E3';
    const SKY_COLOR_BOTTOM = '#B4D8F7';

    // ---- Reusable Colors ----
    const COLOR_BRICK = '#C87838';
    const COLOR_BRICK_OUTLINE = '#8B4513';
    const COLOR_BRICK_PIT = '#A06020';
    const COLOR_HIT_BLOCK = '#8B6914';          // question block after being hit
    const COLOR_HIT_BLOCK_STROKE = '#5C4033';   // hit block outline
    const COLOR_MOUNTAIN = '#8B7355';
    const COLOR_MOUNTAIN_OUTLINE = '#5C4033';
    const COLOR_CASTLE_BRICK = '#4A4A4A';
    const COLOR_CASTLE_DOOR = '#0D0D0D';
    const COLOR_FLAGPOLE_GREEN = '#6B8E23';
    const COLOR_FLAGPOLE_BALL = '#228B22';
    const COLOR_PIPE_GREEN = '#00A800';
    const COLOR_PIPE_GREEN_DARK = '#006000';
    const COLOR_PIPE_GREY = '#6A6A6A';
    const COLOR_PIPE_GREY_DARK = '#4A4A4A';
    const COLOR_WHITE = '#FFFFFF';
    const COLOR_BLACK = '#000000';

    // ---- Fallback Character Colors ----
    const COLOR_CAP_RED = '#E52521';
    const COLOR_SKIN = '#F8C898';
    const COLOR_OVERALL_BLUE = '#0165B3';
    const COLOR_SHOE_BROWN = '#8B4513';
    const COLOR_HAIR_BROWN = '#5C3317';

    // ---- Heart Glow Colors ----
    const HEART_GLOW_CENTER = 'rgba(255,50,80,0.3)';
    const HEART_GLOW_MID = 'rgba(255,50,80,0.1)';
    const HEART_GLOW_EDGE = 'rgba(255,50,80,0)';

    // ---- Number of sprites to load before enabling the start button ----
    const TOTAL_SPRITES_TO_LOAD = 4;

    // ---- Memory / Story Content ----
    const MEMORIES = [
        { title: "College Days 📚", text: "Project group partners who became inseparable best friends! From late-night assignments to endless conversations, you were someone special. 📚✨" },
        { title: "Our First Date 🥟", text: "Remember that beautiful day at the park by the lake? The sun reflected off the water, and we couldn't stop talking. Those delicious momos at momo.i.am changed everything. 🥟💕" },
        { title: "Pariah Night 🎵", text: "First time you tasted 'bhaang' with me on Holi... Steven Wilson's 'Pariah' playing... That magical connection we felt 🎵🌙" },
        { title: "Lake Talks 🌅", text: "All those walks around college, deep conversations by the lake and the endless tea breaks. Hours felt like minutes with you. We talked about dreams and fears. I fell so in love with you. 🌅💭🌅💭" },
        { title: "Ooty Adventure 🏔️", text: "Our first trip together! Mountains, mist, and making memories that would last forever. Exploring together, laughing freely. That trip showed me adventures are better with you. 🏔️❤️"},
        { title: "Goa Beach Race 🏖️", text: "Racing on the beach just for fun, feeling free and alive. The sand beneath our feet, the ocean breeze. Pure joy in the simplest moments. That's when I realized love is these perfect little moments. 🏖️🏃" },
        { title: "Horror Movie Nights 🎬", text: "Our favorite thing - getting scared together watching horror movies, holding each other close sipping wine. Your hand in mine, your head on my shoulder. Those weren't just movies - they were moments where I keep getting reminded just how much I love you. 🎬👻" }
    ];

    // ===========================================================================
    // HELPER — Ground sprite source-rect size
    // bricks.png may be 80 px wide (two 16×16 tiles) or TILE_W (fallback).
    // This helper returns the correct source dimension for drawImage calls.
    // ===========================================================================
    function groundSourceSize(img) {
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
     * Generates a 13×12 pixel-art heart sprite, drawn on a tiny canvas
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
    // SPRITE LOADING — Mario, bricks (ground), tiles (clouds/pipes), heart
    // ===========================================================================
    const sprites = { character: null, ground: null, tiles: null, heart: null };
    let useFallbackCharacter = false;
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

    // ===========================================================================
    // GAME STATE
    // ===========================================================================

    /** Y-coordinate of the ground surface; set by resizeCanvas */
    let GROUND_Y;

    let gameState = {
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

    /** Array of active firework particles */
    let fireworks = [];

    let player = {
        x: PLAYER_MIN_X,
        y: 0,
        width: CHAR_DISPLAY_W,
        height: CHAR_DISPLAY_H,
        velocityY: 0,
        jumping: false,
        facing: 1
    };

    let hearts = [];
    /** One boolean per heart platform: true after the question block is hit from below */
    let questionBlockHit = [];
    let gameLoopId = null;

    // ===========================================================================
    // CANVAS RESIZE
    // ===========================================================================

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        GROUND_Y = canvas.height - 80;
        if (typeof player !== 'undefined' && player.y === 0) player.y = GROUND_Y;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('load', resizeCanvas);

    // ===========================================================================
    // INITIALIZATION
    // ===========================================================================

    function initHearts() {
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

    // ===========================================================================
    // DRAWING FUNCTIONS
    // ===========================================================================

    function drawSky() {
        const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
        g.addColorStop(0, SKY_COLOR_TOP);
        g.addColorStop(1, SKY_COLOR_BOTTOM);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawClouds() {
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

    function drawPipes() {
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

    function drawCastle() {
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

    function drawBrickPlatforms() {
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

    function drawHeartPlatforms() {
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

    function drawTriangleMountain() {
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

    function drawFlagpole() {
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

    function updateFireworks() {
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

    function drawFireworks() {
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

    function drawGroundTiles() {
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

    function drawHearts() {
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

    function drawPlayer() {
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

    // ===========================================================================
    // GAME LOGIC — physics, collision, and state updates
    // ===========================================================================

    const keys = { left: false, right: false };

    function updatePlayer() {
        const poleTopY = GROUND_Y - FLAGPOLE_H;

        // ---- Flag-slide animation (after reaching the flagpole) ----
        if (gameState.flagSliding) {
            gameState.flagY += FLAG_SLIDE_SPEED;
            player.x = FLAGPOLE_X - FLAGPOLE_PLAYER_OFFSET_X;
            player.y = gameState.flagY - player.height + FLAGPOLE_PLAYER_OFFSET_Y;
            if (gameState.flagY >= GROUND_Y - FLAG_DISPLAY_H) {
                gameState.flagSliding = false;
                gameState.running = false;
                document.getElementById('endScreen').classList.remove('hidden');
            }
            gameState.scrollOffset = Math.max(0, player.x - CAMERA_LEAD_OFFSET);
            gameState.animTime++;
            return;
        }

        if (gameState.flagReached) {
            gameState.scrollOffset = Math.max(0, player.x - CAMERA_LEAD_OFFSET);
            gameState.animTime++;
            return;
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
            return;
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
            PIPE_XS.forEach(function(px) {
                list.push({ x: px, y: GROUND_Y - PIPE_H, w: PIPE_W, h: 0 });
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
        PIPE_XS.forEach(function(px) {
            const pipeLeft = px;
            const pipeRight = px + PIPE_W;
            if (right > pipeLeft && left < pipeRight) {
                const pipeTop = GROUND_Y - PIPE_H;
                if (footY > pipeTop && headY < GROUND_Y) {
                    if (player.x + player.width * 0.5 < px + PIPE_W * 0.5) {
                        player.x = px - player.width;
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
    }

    function checkHeartCollision() {
        hearts.forEach(function(heart) {
            if (heart.collected || !heart.released) return;
            const dx = (player.x + player.width / 2) - (heart.x + heart.width / 2);
            const dy = (player.y - player.height / 2) - (heart.y + heart.height / 2);
            if (Math.abs(dx) < HEART_COLLECT_DX && Math.abs(dy) < HEART_COLLECT_DY) {
                heart.collected = true;
                gameState.heartsCollected++;
                document.getElementById('heartCount').textContent = gameState.heartsCollected;
                showMemory(heart.memoryId);
                gameState.paused = true;
                document.getElementById('instructions').style.display = 'none';
            }
        });
    }

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

    function gameLoop() {
        drawSky();
        drawClouds();
        drawPipes();
        drawCastle();
        drawBrickPlatforms();
        drawGroundTiles();
        drawTriangleMountain();
        drawHeartPlatforms();
        drawHearts();
        if (gameState.running && !gameState.paused) {
            updatePlayer();
            checkHeartCollision();
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
        fireworks = [];
        document.getElementById('heartCount').textContent = '0';
        player.x = PLAYER_MIN_X;
        player.y = GROUND_Y;
        player.velocityY = 0;
        player.jumping = false;
        initHearts();
        document.getElementById('instructions').style.display = 'block';
        gameLoop();
    };

    window.closeMemory = closeMemory;

    window.restartGame = function() {
        document.getElementById('endScreen').classList.add('hidden');
        document.getElementById('startScreen').classList.remove('hidden');
    };

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
})();
