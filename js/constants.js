// ===========================================================================
// CONSTANTS — Physics, Dimensions, Layout, Colors, and Visual Parameters
// Pure values only. No imports.
// ===========================================================================

// ---- Physics & Movement ----
/** Downward acceleration applied to the player each frame */
export const GRAVITY = 0.6;
/** Initial upward velocity when the player jumps (negative = upward) */
export const JUMP_STRENGTH = -12;
/** Horizontal pixels moved per frame when an arrow key is held */
export const SCROLL_SPEED = 4;
/** Pixels the flag slides down per frame during the flagpole animation */
export const FLAG_SLIDE_SPEED = 6;

// ---- Core Tile & Character Dimensions (pixels) ----
export const TILE_W = 40;
export const TILE_H = 40;
/** Rendered width of the player character on screen */
export const CHAR_DISPLAY_W = 32;
/** Rendered height of the player character on screen */
export const CHAR_DISPLAY_H = 48;
/** Width of a collectible heart's collision / display box */
export const HEART_W = 32;
/** Height of a collectible heart's collision / display box */
export const HEART_H = 32;

// ---- Canvas / Ground ----
/** Height of the ground strip from the bottom of the canvas */
export const GROUND_STRIP_HEIGHT = 80;

// ---- Ground Sprite Source Detection ----
// The ground sprite (bricks.png) may be 80 px wide (two 16×16 tiles
// side-by-side). We detect this to pick the correct source rect.
export const GROUND_SPRITE_DOUBLE_WIDTH = 80;
export const GROUND_SPRITE_TILE_SIZE = 16;

// ---- Mario Sprite Sheet ----
// Frame rects from Unity .meta file (row y = 341): [sx, sy, sw, sh].
const MARIO_SHEET_Y = 341;
export const MARIO_RUN_FRAMES = [
    [142, MARIO_SHEET_Y, 16, 16],
    [161, MARIO_SHEET_Y, 13, 16],
    [177, MARIO_SHEET_Y, 15, 16],
    [195, MARIO_SHEET_Y, 11, 16]
];

// ---- Fallback Character Sheet ----
export const FALLBACK_SHEET_WIDTH = 160;   // canvas width for generated sprite sheet
export const FALLBACK_SHEET_HEIGHT = 48;   // canvas height for generated sprite sheet
export const FALLBACK_FRAME_COUNT = 5;     // number of animation frames
export const FALLBACK_FRAME_SIZE = 32;     // pixel width of each frame cell

// ---- Heart Sprite (Pixel Art) ----
export const HEART_SPRITE_W = 13;              // source pixel-art width
export const HEART_SPRITE_H = 12;              // source pixel-art height
export const HEART_SPRITE_SCALE = 3;           // integer scale for crisp rendering
export const HEART_DISPLAY_W = HEART_SPRITE_W * HEART_SPRITE_SCALE; // 39
export const HEART_DISPLAY_H = HEART_SPRITE_H * HEART_SPRITE_SCALE; // 36

// ---- Generated Ground Tile ----
export const GEN_TILE_OUTLINE_WIDTH = 2;       // stroke width for brick outline
export const GEN_TILE_PIT_SIZE = 4;            // size of dark "pit" accent squares
export const GEN_TILE_PIT_INSET = 6;           // inset of pit squares from tile edge
export const GEN_TILE_PIT_FAR = 30;            // far-side inset for pit squares

// ---- Background Hills (purely decorative, slow parallax) ----
/** Parallax factor for background hills — much slower than foreground */
export const HILL_PARALLAX = 0.15;
/** Draw scale for hill sprites (3x because source sprites are small) */
export const HILL_SCALE = 3;
// tiles.png sprite regions — row 1 scenery (pixel-perfect from analysis)
/** Large green mountain with dark green body and lighter peak */
export const TILES_HILL_LARGE = { sx: 86, sy: 5, sw: 80, sh: 35 };
/** Smaller green mountain */
export const TILES_HILL_SMALL = { sx: 169, sy: 21, sw: 48, sh: 19 };
/** Flat olive / yellow-green hill */
export const TILES_HILL_FLAT  = { sx: 220, sy: 24, sw: 64, sh: 16 };
/** Fraction of drawn height that sinks below GROUND_Y (base hidden by ground tiles) */
export const HILL_GROUND_OVERLAP = 0.3;
/** World X positions and types for background hills */
export const BG_HILLS = [
    { sprite: 'large', x: 0 },
    { sprite: 'small', x: 500 },
    { sprite: 'flat',  x: 900 },
    { sprite: 'large', x: 1400 },
    { sprite: 'small', x: 1850 },
    { sprite: 'flat',  x: 2250 },
    { sprite: 'large', x: 2700 },
    { sprite: 'small', x: 3150 },
    { sprite: 'flat',  x: 3600 }
];
// Fallback hill colors when tiles.png hasn't loaded
export const COLOR_HILL_GREEN = '#4CAF50';
export const COLOR_HILL_OLIVE = '#8DB600';


// ---- Cloud Rendering ----
/** Parallax speed factor — clouds scroll at this fraction of foreground speed */
export const CLOUD_PARALLAX = 0.3;
/** Scale multiplier when drawing cloud sprites from tiles.png */
export const CLOUD_SPRITE_SCALE = 2;
/** World X positions where clouds are placed */
export const CLOUD_POSITIONS = [100, 500, 900, 1400, 2000, 2600, 3200, 3800, 4500];
/** Y position for sprite-based clouds */
export const CLOUD_Y_SPRITE = 60;
/** Y position for fallback (circle-based) clouds */
export const CLOUD_Y_FALLBACK = 70;
// Cloud tile source rects from tiles.png
export const CLOUD_SRC_LEFT  = { sx: 211, sy: 69, sw: 8,  sh: 24 };
export const CLOUD_SRC_MID   = { sx: 219, sy: 69, sw: 16, sh: 24 };
export const CLOUD_SRC_RIGHT = { sx: 235, sy: 69, sw: 8,  sh: 24 };
// Fallback cloud geometry
export const CLOUD_ARC_SMALL = 18;         // radius of the small side arcs
export const CLOUD_ARC_LARGE = 22;         // radius of the large center arc
export const CLOUD_FALLBACK_RECT_W = 72;   // rectangular base width
export const CLOUD_FALLBACK_RECT_H = 14;   // rectangular base height

// ---- Pipe Layout & Rendering ----
// Each pipe uses a complete sprite from tiles.png row 5 (no stacking needed).
// Three sizes available: 'short' (32×32), 'medium' (32×48), 'tall' (32×64).
/** Complete pipe sprite regions — each is a single image with rim + body */
export const PIPE_SPRITES = {
    short:  { sx: 309, sy: 417, sw: 32, sh: 32 },
    medium: { sx: 271, sy: 401, sw: 32, sh: 48 },
    tall:   { sx: 230, sy: 385, sw: 32, sh: 64 }
};
export const PIPES = [
    { x: 500,  type: 'medium' },   // near start
    { x: 1300, type: 'short' },
    { x: 1600, type: 'tall' },
    { x: 2500, type: 'short' },
    { x: 3000, type: 'tall' },
    { x: 3950, type: 'medium' },
    { x: 4600, type: 'medium' },
    { x: 5800, type: 'short' },
    { x: 6200, type: 'tall' },
    { x: 7200, type: 'medium' }
];
export const PIPE_W = 48;
/** Scale multiplier for drawing pipe sprites from tiles.png */
export const PIPE_SPRITE_SCALE = 2;
/** Returns the drawn height of a pipe given its type string */
export function pipeHeight(type) {
    return PIPE_SPRITES[type].sh * PIPE_SPRITE_SCALE;
}
/** How much the fallback pipe rim extends beyond the body on each side */
export const PIPE_RIM_OVERHANG = 4;
/** Height of the fallback pipe rim cap */
export const PIPE_RIM_CAP_HEIGHT = 10;
/** Total extra width added to each side of the fallback pipe rim */
export const PIPE_RIM_EXTRA_WIDTH = 8;
/** Vertical offset of the fallback pipe rim above the pipe top */
export const PIPE_RIM_Y_OFFSET = 6;

// ---- Brick Platforms (decorative, non-heart-bearing) ----
// yOff = vertical offset from GROUND_Y; negative = above ground
export const BRICK_PLATFORMS = [
    { x: 950,  yOff: -112, w: 120, h: 24 },
    { x: 2100, yOff: -136, w: 120, h: 24 },
    { x: 3700, yOff: -120, w: 140, h: 24 },
    { x: 5300, yOff: -104, w: 120, h: 24 }
];

// ---- Heart (Question-Block) Platforms ----
// Each entry: x, yOff (from GROUND_Y), numBlocks (TILE_W-wide tiles),
// heartIndex = which block is the "?" question block.
// Max jump ~= 114 px; heart released above platform.
// Safe yOff range: roughly -82 to -146.
export const HEART_PLATFORMS = [
    { x: 670,  yOff: -108, numBlocks: 5, heartIndex: 2 },
    { x: 1870, yOff: -118, numBlocks: 5, heartIndex: 2 },
    { x: 3120, yOff: -126, numBlocks: 5, heartIndex: 2 },
    { x: 4320, yOff: -134, numBlocks: 5, heartIndex: 2 },
    { x: 5520, yOff: -140, numBlocks: 5, heartIndex: 2 },
    { x: 6820, yOff: -130, numBlocks: 5, heartIndex: 2 },
    { x: 8120, yOff: -118, numBlocks: 5, heartIndex: 2 }
];
/** Gap in pixels between the platform top edge and the heart hovering above it */
export const HEART_RELEASE_GAP = 8;

// ---- Question-Block Visual ----
/** Font size of the "?" character as a fraction of TILE_H */
export const Q_MARK_FONT_SIZE_FACTOR = 0.5;
/** Vertical text-baseline offset factor for centering "?" in the block */
export const Q_MARK_Y_FACTOR = 0.72;

// ---- Triangle Mountain (end-of-level staircase) ----
/** World X of the left edge of the triangular mountain */
export const TRIANGLE_MOUNTAIN_LEFT = 8600;
/** Number of blocks in the bottom row */
export const TRIANGLE_MOUNTAIN_BASE_BLOCKS = 11;
/** Number of stacked rows */
export const TRIANGLE_MOUNTAIN_ROWS = 6;

// ---- Flagpole ----
/** World X position of the flagpole */
export const FLAGPOLE_X = 9240;
/** Rendered height of the flagpole on screen */
export const FLAGPOLE_H = 380;
/** Rendered width of the flag graphic */
export const FLAG_DISPLAY_W = 56;
/** Rendered height of the flag graphic */
export const FLAG_DISPLAY_H = 44;
/** Height of the flagpole sprite in tiles.png (used for scale calc) */
export const FLAGPOLE_SPRITE_H = 168;
/** Width of the flagpole sprite in tiles.png */
export const FLAGPOLE_SPRITE_W = 24;
/** X offset of the pole shaft within the sprite (for alignment) */
export const FLAGPOLE_SHAFT_OFFSET_X = 14;
/** Collision width of the pole itself */
export const FLAGPOLE_COLLISION_W = 16;
/** Extra pixels past the pole that still trigger the flag-reach sequence */
export const FLAGPOLE_HITBOX_EXTEND = 24;
/** Horizontal offset of the player from FLAGPOLE_X during the slide */
export const FLAGPOLE_PLAYER_OFFSET_X = 6;
/** Vertical offset applied to the player during the flag slide */
export const FLAGPOLE_PLAYER_OFFSET_Y = 10;
/** Total number of flag animation frames */
export const FLAGPOLE_ANIM_FRAME_COUNT = 5;
/** Pole width for the fallback drawing when tiles.png is unavailable */
export const FLAGPOLE_FALLBACK_WIDTH = 8;
/** Ball radius at the top of the fallback flagpole */
export const FLAGPOLE_FALLBACK_BALL_R = 10;
// 5 flagpole animation frames from tiles.png (flag slides top -> bottom)
export const FLAGPOLE_FRAMES = [
    { sx: 249, sy: 594, sw: 24, sh: 168 }, // frame 0: flag at top
    { sx: 216, sy: 594, sw: 24, sh: 168 }, // frame 1: flag upper-mid
    { sx: 182, sy: 594, sw: 24, sh: 168 }, // frame 2: flag middle
    { sx: 149, sy: 594, sw: 24, sh: 168 }, // frame 3: flag lower-mid
    { sx: 117, sy: 594, sw: 23, sh: 168 }, // frame 4: flag at bottom
];

// ---- Castle ----
/** World X position of the castle */
export const CASTLE_X = 9500;
/** Rendered width of the castle */
export const CASTLE_W = 560;
/** Rendered height of the castle */
export const CASTLE_H = 500;
/** Vertical gap between the castle bottom and GROUND_Y */
export const CASTLE_BASE_OFFSET = 24;
/** Extra pixels added to off-screen culling checks for the castle */
export const CASTLE_OFFSCREEN_BUFFER = 50;
/** Fallback door width (drawn when tiles.png is unavailable) */
export const CASTLE_DOOR_W = 72;
/** Fallback door height */
export const CASTLE_DOOR_H = 80;
/** Door bottom margin above the castle base */
export const CASTLE_DOOR_MARGIN = 24;
/** Alpha for the darkening overlay on fallback castle bricks */
export const CASTLE_OVERLAY_ALPHA = 0.45;
// tiles.png (411x949) sprite region for the castle
export const TILES_CASTLE = { sx: 79, sy: 767, sw: 148, sh: 176 };
/** Expected width of the tiles.png sprite sheet */
export const TILES_IMAGE_W = 411;
/** Expected height of the tiles.png sprite sheet */
export const TILES_IMAGE_H = 949;


// ---- Heartbeat Animation ----
/** Angular speed of the heartbeat oscillation */
export const HEARTBEAT_SPEED = 0.08;
/** Radian window for the first (stronger) pulse */
export const HEARTBEAT_FIRST_WINDOW = 0.5;
/** Scale amplitude of the first pulse */
export const HEARTBEAT_FIRST_AMP = 0.22;
/** Radian offset where the second pulse ends */
export const HEARTBEAT_SECOND_END = 1.2;
/** Radian duration of the second pulse */
export const HEARTBEAT_SECOND_DURATION = 0.7;
/** Scale amplitude of the second pulse */
export const HEARTBEAT_SECOND_AMP = 0.13;
/** Base radius of the pulsing glow behind each heart */
export const HEART_GLOW_BASE_R = 24;
/** Inner gradient radius for the heart glow */
export const HEART_GLOW_INNER_R = 4;

// ---- Animation & Camera ----
/** Number of game frames per character animation frame */
export const ANIM_FRAME_DIVISOR = 8;
/** Player is kept this many pixels from the left canvas edge (camera lead) */
export const CAMERA_LEAD_OFFSET = 200;
/** Leftmost world X the player can reach */
export const PLAYER_MIN_X = 100;

// ---- Collision Detection Thresholds ----
/** Max horizontal distance (px) between player and heart centers for pickup */
export const HEART_COLLECT_DX = 28;
/** Max vertical distance (px) between player and heart centers for pickup */
export const HEART_COLLECT_DY = 32;
/** Pixels above platform top that still count as "landing on it" */
export const LAND_TOLERANCE_ABOVE = 4;
/** Pixels below platform top that still count as "landing on it" */
export const LAND_TOLERANCE_BELOW = 20;
/** Max distance (px) between player's head and block bottom for a head-bump */
export const HEAD_HIT_TOLERANCE = 36;
/** Pixels the player is pushed down after head-bumping a question block */
export const HEAD_BOUNCE_PUSH = 2;

// ---- Firework Burst Parameters ----
/** Downward acceleration applied to each firework particle per frame */
export const FW_GRAVITY = 0.06;
/** Velocity damping multiplier per frame for firework particles */
export const FW_DRAG = 0.98;
/** Frames between consecutive firework bursts */
export const FW_SPAWN_INTERVAL = 30;
/** Minimum number of particles per burst */
export const FW_MIN_PARTICLES = 30;
/** Additional random particles (0 .. N-1) per burst */
export const FW_EXTRA_PARTICLES = 25;
/** Minimum outward speed of a particle */
export const FW_MIN_SPEED = 2;
/** Additional random speed per particle */
export const FW_EXTRA_SPEED = 4;
/** Minimum lifetime (frames) of a particle */
export const FW_MIN_LIFE = 60;
/** Additional random lifetime (frames) per particle */
export const FW_EXTRA_LIFE = 40;
/** Maximum possible lifetime (for brightness ratio calculation) */
export const FW_MAX_LIFE = 100;
/** Minimum particle dot radius */
export const FW_MIN_SIZE = 2;
/** Additional random dot radius per particle */
export const FW_EXTRA_SIZE = 2;
/** Random hue spread (+/-half) around the burst's base hue */
export const FW_HUE_SPREAD = 40;
/** Angular jitter applied to each particle's direction */
export const FW_ANGLE_JITTER = 0.4;
/** Leftmost fraction of CASTLE_W for burst origin X */
export const FW_X_MIN_FRAC = 0.2;
/** Width-fraction range for burst origin X */
export const FW_X_RANGE_FRAC = 0.6;
/** Minimum height (px) above castle top for burst origin */
export const FW_Y_MIN_OFFSET = 40;
/** Additional random height above castle top for burst origin */
export const FW_Y_EXTRA_OFFSET = 200;
/** Off-screen pixel buffer for skipping particle rendering */
export const FW_OFFSCREEN_BUFFER = 20;
/** Minimum alpha of a firework particle (when brightness = 0) */
export const FW_ALPHA_MIN = 0.1;
/** Alpha range scaled by brightness (min + range * bright = 1.0 at full) */
export const FW_ALPHA_RANGE = 0.9;
/** Alpha multiplier for the glow trail behind each particle */
export const FW_GLOW_ALPHA = 0.3;
/** Size multiplier for the glow trail circle relative to the dot */
export const FW_GLOW_SIZE = 2.5;
/** Base HSL lightness percentage for firework particles */
export const FW_BASE_LIGHTNESS = 50;
/** Additional HSL lightness scaled by brightness */
export const FW_BRIGHT_LIGHTNESS = 30;

// ---- Sky Gradient Colors ----
export const SKY_COLOR_TOP = '#5C94E3';
export const SKY_COLOR_BOTTOM = '#B4D8F7';

// ---- Reusable Colors ----
export const COLOR_BRICK = '#C87838';
export const COLOR_BRICK_OUTLINE = '#8B4513';
export const COLOR_BRICK_PIT = '#A06020';
export const COLOR_HIT_BLOCK = '#8B6914';          // question block after being hit
export const COLOR_HIT_BLOCK_STROKE = '#5C4033';   // hit block outline
export const COLOR_MOUNTAIN = '#8B7355';
export const COLOR_MOUNTAIN_OUTLINE = '#5C4033';
export const COLOR_CASTLE_BRICK = '#4A4A4A';
export const COLOR_CASTLE_DOOR = '#0D0D0D';
export const COLOR_FLAGPOLE_GREEN = '#6B8E23';
export const COLOR_FLAGPOLE_BALL = '#228B22';
export const COLOR_PIPE_GREEN = '#00A800';
export const COLOR_PIPE_GREEN_DARK = '#006000';
export const COLOR_PIPE_GREY = '#6A6A6A';
export const COLOR_PIPE_GREY_DARK = '#4A4A4A';
export const COLOR_WHITE = '#FFFFFF';
export const COLOR_BLACK = '#000000';

// ---- Fallback Character Colors ----
export const COLOR_CAP_RED = '#E52521';
export const COLOR_SKIN = '#F8C898';
export const COLOR_OVERALL_BLUE = '#0165B3';
export const COLOR_SHOE_BROWN = '#8B4513';
export const COLOR_HAIR_BROWN = '#5C3317';

// ---- Heart Glow Colors ----
export const HEART_GLOW_CENTER = 'rgba(255,50,80,0.3)';
export const HEART_GLOW_MID = 'rgba(255,50,80,0.1)';
export const HEART_GLOW_EDGE = 'rgba(255,50,80,0)';

// ---- Ambient Birds ----
/** Number of decorative birds placed across the level */
export const BIRD_COUNT = 14;
/** Parallax factor for birds (between clouds 0.3 and foreground 1.0) */
export const BIRD_PARALLAX = 0.5;
/** Minimum Y position (below clouds) */
export const BIRD_Y_MIN = 110;
/** Y range for random placement (max Y = BIRD_Y_MIN + BIRD_Y_RANGE) */
export const BIRD_Y_RANGE = 160;
/** Minimum horizontal drift speed (px per frame, world-relative) */
export const BIRD_DRIFT_MIN = 0.2;
/** Additional random drift speed */
export const BIRD_DRIFT_EXTRA = 0.5;
/** Minimum wing-flap angular speed (radians per frame) */
export const BIRD_FLAP_MIN = 0.06;
/** Additional random flap speed */
export const BIRD_FLAP_EXTRA = 0.08;
/** Minimum vertical bobbing amplitude (px) */
export const BIRD_BOB_AMP_MIN = 2;
/** Additional random bobbing amplitude */
export const BIRD_BOB_AMP_EXTRA = 5;
/** Vertical bobbing frequency (radians per frame) */
export const BIRD_BOB_FREQ = 0.02;
/** Body radius of the smallest bird */
export const BIRD_SIZE_MIN = 2;
/** Additional random body radius */
export const BIRD_SIZE_EXTRA = 2;
/** Stroke width for bird wings */
export const BIRD_STROKE_WIDTH = 1.5;
/** Bird body / wing color (dark silhouette) */
export const BIRD_COLOR = '#2C3E50';
/** Horizontal spacing between birds across the level */
export const BIRD_SPACING = 700;

// ---- Number of sprites to load before enabling the start button ----
export const TOTAL_SPRITES_TO_LOAD = 4;

// ---- Memory / Story Content ----
export const MEMORIES = [
    { title: "College Days \u{1F4DA}", text: "Project group partners who became inseparable best friends! From late-night assignments to endless conversations, you were someone special. \u{1F4DA}\u2728" },
    { title: "Our First Date \u{1F95F}", text: "Remember that beautiful day at the park by the lake? The sun reflected off the water, and we couldn't stop talking. Those delicious momos at momo.i.am changed everything. \u{1F95F}\u{1F495}" },
    { title: "Pariah Night \u{1F3B5}", text: "First time you tasted 'bhaang' with me on Holi... Steven Wilson's 'Pariah' playing... That magical connection we felt \u{1F3B5}\u{1F319}" },
    { title: "Lake Talks \u{1F305}", text: "All those walks around college, deep conversations by the lake and the endless tea breaks. Hours felt like minutes with you. We talked about dreams and fears. I fell so in love with you. \u{1F305}\u{1F4AD}\u{1F305}\u{1F4AD}" },
    { title: "Ooty Adventure \u{1F3D4}\uFE0F", text: "Our first trip together! Mountains, mist, and making memories that would last forever. Exploring together, laughing freely. That trip showed me adventures are better with you. \u{1F3D4}\uFE0F\u2764\uFE0F"},
    { title: "Goa Beach Race \u{1F3D6}\uFE0F", text: "Racing on the beach just for fun, feeling free and alive. The sand beneath our feet, the ocean breeze. Pure joy in the simplest moments. That's when I realized love is these perfect little moments. \u{1F3D6}\uFE0F\u{1F3C3}" },
    { title: "Horror Movie Nights \u{1F3AC}", text: "Our favorite thing - getting scared together watching horror movies, holding each other close sipping wine. Your hand in mine, your head on my shoulder. Those weren't just movies - they were moments where I keep getting reminded just how much I love you. \u{1F3AC}\u{1F47B}" }
];
