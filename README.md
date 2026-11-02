# My NOW Guide (Fire TV)

A companion browser for NOW that only shows what you can actually watch.

- Pick your passes on first run (Entertainment, Cinema, Sports, HBO Max, Kids). Anything else is hidden everywhere.
- Channels across the top; Left/Right to move, Down for genre rows, OK to select.
- **Top 10** and **All** views, filtered to your passes.
- "Open in NOW" hands off to NOW (playback stays in the official app; this app does not play video).

## Run on your computer
    npm install
    npm run dev

## Run on the Fire Stick
Host the built site (`npm run build`, then publish `dist/`, e.g. GitHub Pages) and open the URL in the Silk browser, or sideload it later as an APK wrapper.

## Editing the lineup
- `src/data/config.js`: tiers, channels, deep-link URL.
- `src/data/catalogue.js`: the titles. **This is sample data**: replace it with the real lineup.
