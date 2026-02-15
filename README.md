# Our Story

A Mario-style side-scrolling game built as a love letter — collect 7 hearts across themed levels to relive beautiful memories together.

## Play

The game is hosted on GitHub Pages. Open `index.html` in any browser or visit the deployed URL.

## How to Play

- **Desktop:** Arrow keys to move left/right, Space to jump.
- **Mobile:** On-screen left/right buttons to move, JUMP button to jump. Touch controls appear automatically on touch devices.

## Levels

| # | Level | Theme |
|---|-------|-------|
| 1 | College Days | Where it all began |
| 2 | Our First Date | Park by the lake |
| 3 | Pariah Night | A magical connection |
| 4 | Lake Talks | Deep conversations |
| 5 | Ooty Adventure | Mountains & mist |
| 6 | Goa Beach Race | Freedom & joy |
| 7 | Horror Movie Nights | Safe in your arms |

Collect the heart in each level by hitting the `?` block from below, then touch the heart to unlock a memory. Reach the flagpole at the end to complete the game.

## Running Locally

```bash
# Any static file server works
python3 -m http.server
```

Then open [http://localhost:8000](http://localhost:8000).

## Project Structure

```
index.html    — Game HTML, CSS, and main inline script
drawing.js    — Canvas rendering functions (backgrounds, sprites)
game.js       — Legacy game logic module (unused; logic is inline)
assets/       — Sprite sheets (mario.png, bricks.png, tiles.png)
```

## Tech

Pure HTML5 Canvas + vanilla JavaScript. No frameworks or build tools. Uses the "Press Start 2P" pixel font from Google Fonts.
