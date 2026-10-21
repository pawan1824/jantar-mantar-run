/**
 * ============================================================================
 * 🎮 THE JANTAR MANTAR RUN — CHARACTER & GAME CONFIGURATION
 * ============================================================================
 * 
 * 🇮🇳 हिंदी निर्देश (HINDI INSTRUCTIONS):
 * आप इस फ़ाइल में किसी भी व्यक्ति (Character) का नाम (Name), बायो (Tag), 
 * शर्ट का रंग (Top), स्पीड (Speed) या फोटो (Image) आसानी से बदल सकते हैं!
 * 
 * बदलाव करने के बाद बस फ़ाइल को Save कर लें और ब्राउज़र रिफ्रेश करें।
 * 
 * ============================================================================
 * 📋 CHARACTER FIELDS GUIDE:
 * - id: Unique ID (e.g. "abhijit", "rahul", "dhruv", "custom_1")
 * - name: Name shown in the game (e.g. "Abhijit (deepke)")
 * - tag: Subtitle / tagline (e.g. "Topper. Carries receipts.")
 * - image: Photo shown on the character card, e.g. "assets/faces/abhijit.jpg"
 * - headImage: Photo used as the runner's head while running (falls back to image)
 * - Every playable character carries a tiranga flag automatically
 * - speed: Running speed (0.7 = normal, 1.0 = fast, 1.2 = super fast)
 * - top: Shirt / Outfit color (Hex code like "#3a86ff", "#1d4ed8", "#2d6a4f")
 * - bottom: Pants color (Hex code like "#3d405b", "#1e293b")
 * - skin: Skin color (Hex code like "#b97a50", "#c68a5a")
 * - hair: Hair color (Hex code like "#2b1d14", "#1a1a1a")
 * - hairStyle: "curly" | "short" | "braid" | "bucket" | "side" | "bald"
 * - expr: Expression: "happy" | "shout" | "nervous"
 * - extra: Accessories array: ["glasses", "backpack", "stubble", "mic", "shades", "hoodie", "selfie", "dupatta", "jhola", "sash", "flag"]
 * - wheelchair: true | false (activates wheelchair)
 * ============================================================================
 */

window.GAME_CONFIG = {
  // Destination settings
  destination: {
    nameHindi: "संसद भवन",
    nameEnglish: "PARLIAMENT",
    distanceMeters: 1108
  },

  // 🎵 Background music: Spotify embed (tap the 🎵 button) + optional local mp3
  music: {
    spotifyTrackId: "1NT0G4gcwljQk6o71vupty",
    file: "assets/music.mp3" // drop your own mp3 here; it loops once the game starts
  },

  // Creator credit
  creator: {
    name: "PAWAN",
    role: "PAWAN",
    linkedin: "https://www.linkedin.com/in/pawan-kumar-a09062437"
  },

  // 🏃 LIST OF CHARACTERS (Edit names, tags, colors, photos here!):
  characters: [
    {
      id: "abhijit",
      name: "Abhijit Deepke",
      tag: "Topper. Carries receipts.",
      bg: "#8ecae6",
      skin: "#b97a50",
      hair: "#2b1d14",
      hairStyle: "curly",
      top: "#3a86ff",
      bottom: "#3d405b",
      shoe: "#222222",
      expr: "happy",
      extra: ["glasses", "backpack", "stubble"],
      accent: "#9d0208",
      speed: 2.02,
      image: "assets/faces/abhijit.jpg",
      headImage: "assets/faces/abhijit_head.jpg"
    },
    {
      id: "rahul",
      name: "Rahul Gandhi",
      tag: "Youth for change. Frontline rapid sprinter.",
      bg: "#a2d2ff",
      skin: "#c68a5a",
      hair: "#140f0f",
      hairStyle: "side",
      top: "#1d4ed8",
      bottom: "#1e293b",
      shoe: "#ffffff",
      expr: "happy",
      extra: ["stubble"],
      accent: "#3b82f6",
      speed: 1.12,
      image: "assets/faces/rahul.jpg",
      headImage: "assets/faces/rahul_head.jpg"
    },
    {
      id: "dhruv",
      name: "Dhruv Rathee",
      tag: "Facts, logic, debunker. Mic ready.",
      bg: "#caffbf",
      skin: "#b97a50",
      hair: "#1a1a1a",
      hairStyle: "short",
      top: "#2d6a4f",
      bottom: "#1b4332",
      shoe: "#222222",
      expr: "happy",
      extra: ["beard", "mic"],
      accent: "#40916c",
      speed: 1.04,
      image: "assets/faces/dhruv.jpg",
      headImage: "assets/faces/dhruv_head.jpg"
    },
    {
      id: "neha",
      name: "Neha",
      tag: "Loudest slogan in Delhi.",
      bg: "#ffb703",
      skin: "#c98b62",
      hair: "#1b1220",
      hairStyle: "braid",
      top: "#f4a259",
      bottom: "#7b2d26",
      shoe: "#5a2a1a",
      expr: "shout",
      extra: ["dupatta", "jhola"],
      accent: "#d62828",
      speed: 1.0,
      long: true,
      image: "assets/faces/neha.jpg",
      headImage: "assets/faces/neha_head.jpg"
    },
    {
      id: "wheels",
      name: "Protester (Wheelchair)",
      tag: "Ramp ya na ho, aa raha hai.",
      bg: "#bde0fe",
      skin: "#c68650",
      hair: "#2a1a12",
      hairStyle: "short",
      top: "#e63946",
      bottom: "#2f3e46",
      shoe: "#222222",
      expr: "happy",
      extra: [],
      accent: "#1e6fd9",
      speed: 0.9,
      grinFace: true,
      wheelchair: true,
      image: "assets/faces/wheels.jpg",
      headImage: "assets/faces/wheels_head.jpg"
    },
    {
      id: "genz",
      name: "GenZ",
      tag: "Going live. No cap.",
      bg: "#ffdfba",
      skin: "#d9a066",
      hair: "#7b2cbf",
      hairStyle: "bucket",
      top: "#ff7a00",
      bottom: "#6c757d",
      shoe: "#ffffff",
      expr: "happy",
      extra: ["shades", "hoodie", "selfie"],
      accent: "#ffafcc",
      speed: 1.06,
      image: ""
    },
    {
      id: "minister",
      name: "Ex Minister",
      tag: "Lost his convoy. Here to clarify.",
      bg: "#ffd6a5",
      skin: "#c48a5e",
      hair: "#bdbdbd",
      hairStyle: "bald",
      top: "#fbfaf5",
      bottom: "#fbfaf5",
      shoe: "#3e2723",
      expr: "nervous",
      extra: ["jacket", "garland", "specs", "mustache", "files"],
      accent: "#6d6875",
      speed: 0.35,
      long: true,
      build: 1.28,
      short: true,
      image: ""
    }
  ]
};
