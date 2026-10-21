# द जंतर मंतर रन — The Jantar Mantar Run: To Parliament

A comic arcade protest run through Delhi. Dodge the cops, jump the barricades, reach Parliament from Jantar Mantar!

Created by **PAWAN** (https://www.linkedin.com/in/pawan-kumar-a09062437).

## 🚀 How to Run Locally

### Option 1: Double-click & Play (Standalone)
Serve the `dist/` folder with any static server (e.g. `npx serve dist` or `python3 -m http.server -d dist`) and open it in Chrome / Firefox / Safari / Edge.

### Option 2: Run with Node.js / Vite
```bash
# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev
```
Open `http://localhost:3000` in your browser.

### Option 3: Deploy to Vercel / Netlify / GitHub Pages
Upload this folder to GitHub and deploy to Vercel with 1 click. Build command: `npm run build`, output directory: `dist`.

---

## 🎮 Controls
- **Desktop Keyboard**:
  - `Space` / `↑`: Jump over barricades & police vans
  - `←` `→`: Lane switch & move
  - `↓`: Slow down / Duck
- **Mobile / Touch**:
  - Virtual analog joystick: Drag to move & sprint
  - Tap `JUMP` button to leap

## 🚩 Destination
- **Start**: Jantar Mantar (0m)
- **Route**: Sansad Marg (Parliament Street)
- **Destination**: Indian Parliament House (संसद भवन) (1108m)

---

## 📸 Photos & 🚩 Flags
- Character photos live in `public/assets/faces/` (`<name>.jpg` for the card, `<name>_head.jpg` for the runner's head).
- They are wired up in `public/characters.js` (`image` / `headImage`). Swap a file or change the path to update a face.
- Every playable character runs with a tiranga flag in hand.

## 🎵 Background music
- Tap the 🎵 button (top-right) to open the Spotify player for the configured track (`music.spotifyTrackId` in `public/characters.js`). Press play inside it.
- Want it to start automatically with the game? Drop your own `music.mp3` into `public/assets/` — it loops once PLAY is pressed and follows the ♪ mute button.
