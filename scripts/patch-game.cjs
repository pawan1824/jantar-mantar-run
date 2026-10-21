const fs = require('fs');
let src = fs.readFileSync('public/assets/game.283c5e1184.js', 'utf8');

// 1. Replace CHARS export with dynamic config loader
src = src.replace(
  'CHARS:ie,',
  'CHARS:(function(){try{var s=localStorage.getItem("cjm_custom_characters");if(s){var p=JSON.parse(s);if(Array.isArray(p)&&p.length>0)return p;}}catch(e){}if(window.GAME_CONFIG&&Array.isArray(window.GAME_CONFIG.characters)&&window.GAME_CONFIG.characters.length>0)return window.GAME_CONFIG.characters;return ie;})(),'
);

// 2. Replace finish banner
src = src.replace(
  'E(t,"\\u091C\\u0902\\u0924\\u0930 \\u092E\\u0902\\u0924\\u0930",o/2,92,104,"#ffd166",N,k),E(t,"JANTAR MANTAR",o/2,178,44,"#fff",G,k)',
  'E(t,"\\u0938\\u0902\\u0938\\u0926 \\u092D\\u0935\\u0928",o/2,92,104,"#ffd166",N,k),E(t,"PARLIAMENT HOUSE",o/2,178,44,"#fff",G,k)'
);

// 3. Replace DTC bus destination
src = src.replace('"966  JANTAR MANTAR"', '"966  PARLIAMENT"');

// 4. Replace win message
src = src.replace('Jantar Mantar pahunch gaya', 'Jantar Mantar se Parliament pahunch gaya');

// 5. Replace card HTML in St() to support custom image
const oldCardHtml = 'x.innerHTML=`<canvas></canvas><b>${p.name}</b><small>${p.tag}</small><span class="spd">SPEED <i style="--s:${p.speed}"></i></span>`';
const newCardHtml = 'x.innerHTML=`${p.image?`<img src="${p.image}" alt="${p.name}" style="width:108px;height:140px;object-fit:cover;border-radius:10px;margin:8px auto;display:block;border:3px solid var(--ink);box-shadow:3px 3px 0 var(--ink);">`:`<canvas></canvas>`}<b>${p.name}</b><small>${p.tag}</small><span class="spd">SPEED <i style="--s:${p.speed}"></i></span>`';

if (src.includes(oldCardHtml)) {
  src = src.replace(oldCardHtml, newCardHtml);
  console.log("Card image support added!");
}

// 6. Safeguard yt() if canvas is null for custom image
src = src.replace(
  'st.forEach((p,c)=>k.portrait(p,k.CHARS[c],xe*(r===c?9:3)+c,r===c?"walk":"idle",1.18))',
  'st.forEach((p,c)=>{if(p)k.portrait(p,k.CHARS[c],xe*(r===c?9:3)+c,r===c?"walk":"idle",1.18)})'
);

// 7. Remove remote tracker
src = src.replace('https://abacus.jasoncameron.dev', 'https://example.com');

fs.writeFileSync('public/assets/game.283c5e1184.js', src, 'utf8');
console.log('Successfully patched public/assets/game.283c5e1184.js!');
