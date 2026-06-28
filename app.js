const VARIANTS = ["All", "Base", "Gold", "Gummy", "Galaxy", "Gem", "Holofoil", "Cube", "Quack"];
const BASES = [
  ["Water Sprite","Creature_Sprite_Water_Unvault_Ch7S3"],
  ["Earth Sprite","Creature_Sprite_Earth"],
  ["Fire Sprite","Creature_Sprite_Fire"],
  ["Duck Sprite","BR_Duck"],
  ["Ghost Sprite","Creature_Sprite_Ghost"],
  ["Dream Sprite","Creature_Sprite_Dream"],
  ["Demon Sprite","Creature_Sprite_Demon"],
  ["Punk Sprite","Creature_Sprite_Punk"],
  ["King Sprite","Creature_Sprite_King"],
  ["Burnt Peanut","Creature_Sprite_BurntPeanut"],
  ["Zero Point Sprite","Creature_Sprite_ZeroPoint"],
  ["Fishy Sprite","Creature_Sprite_Fishy"],
  ["Striker Sprite","Creature_Sprite_Striker"],
  ["Aura Sprite","Creature_Sprite_Aura"],
  ["Boss Sprite","Creature_Sprite_Boss"],
  ["Grim Sprite","Creature_Sprite_Grim"]
];
const variantSet = {
  "Water Sprite":["Base","Gold","Gummy","Galaxy"],
  "Earth Sprite":["Base","Gold","Gummy","Galaxy"],
  "Fire Sprite":["Base","Gold","Gummy","Galaxy"],
  "Duck Sprite":["Base","Gold","Gummy","Galaxy"],
  "Ghost Sprite":["Base","Gold","Gummy","Galaxy"],
  "Dream Sprite":["Base","Gold","Gummy","Galaxy"],
  "Demon Sprite":["Base","Gold","Gummy","Galaxy"],
  "Punk Sprite":["Base","Gold","Gummy","Galaxy"],
  "King Sprite":["Base","Gold","Gummy","Galaxy"],
  "Burnt Peanut":["Base"],
  "Zero Point Sprite":["Base","Gold","Gummy","Galaxy"],
  "Fishy Sprite":["Base","Gold","Gummy","Galaxy"],
  "Striker Sprite":["Base","Gold","Gummy","Galaxy"],
  "Aura Sprite":["Base","Gold","Gummy","Galaxy"],
  "Boss Sprite":["Base","Gold","Gummy","Galaxy"],
  "Grim Sprite":["Base","Gold","Gummy","Galaxy"]
};
const sprites = BASES.flatMap(([base, token]) => variantSet[base].map(v => ({
  id: `${v}:${base}`,
  name: v === "Base" ? base : `${v} ${base}`,
  base, token, variant: v,
  image: v === "Base" ? `https://fortnite.gg/img/x/sprites/icons/T_Icon_${token}_ui_L.webp` : `https://fortnite.gg/img/x/sprites/icons/T_Icon_${token}_${v}_ui_L.webp`
})));
const storeKey = "spritedex-v2";
let state = JSON.parse(localStorage.getItem(storeKey) || "{}");
let activeVariant = "All";
const grid = document.getElementById("grid");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const variantChips = document.getElementById("variantChips");
function save(){ localStorage.setItem(storeKey, JSON.stringify(state)); }
function pct(n,d){ return d ? Math.round((n/d)*100) : 0; }
function variantClass(v){ return v.toLowerCase(); }
function makeChips(){
  variantChips.innerHTML = VARIANTS.map(v => `<button class="chip ${v===activeVariant?'active':''}" data-v="${v}">${v}</button>`).join("");
  variantChips.querySelectorAll("button").forEach(btn => btn.onclick = () => { activeVariant = btn.dataset.v; render(); });
}
function card(sprite){
  const s = state[sprite.id] || {};
  const el = document.createElement("article");
  el.className = "card";
  el.innerHTML = `
    <div class="art">
      <span class="badge ${variantClass(sprite.variant)}">${sprite.variant}</span>
      <img src="${sprite.image}" alt="${sprite.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block'" />
      <div class="fallback">${sprite.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
    </div>
    <div class="name">${sprite.name}</div>
    <div class="toggles">
      <label class="toggle">Owned <input data-kind="owned" type="checkbox" ${s.owned ? "checked" : ""}></label>
      <label class="toggle">Mastered <input data-kind="mastered" type="checkbox" ${s.mastered ? "checked" : ""}></label>
    </div>`;
  el.querySelectorAll("input").forEach(input => input.onchange = e => {
    const kind = e.target.dataset.kind;
    state[sprite.id] = state[sprite.id] || {};
    state[sprite.id][kind] = e.target.checked;
    if(kind === "mastered" && e.target.checked) state[sprite.id].owned = true;
    if(kind === "owned" && !e.target.checked) state[sprite.id].mastered = false;
    save(); render();
  });
  return el;
}
function render(){
  makeChips();
  const q = searchInput.value.trim().toLowerCase();
  const f = filterSelect.value;
  const owned = sprites.filter(x => state[x.id]?.owned).length;
  const mastered = sprites.filter(x => state[x.id]?.mastered).length;
  const op = pct(owned, sprites.length), mp = pct(mastered, sprites.length);
  ownedPct.textContent = `${op}%`; masteredPct.textContent = `${mp}%`;
  ownedCount.textContent = `${owned} / ${sprites.length}`; masteredCount.textContent = `${mastered} / ${sprites.length}`;
  ownedBar.style.width = `${op}%`; masteredBar.style.width = `${mp}%`;
  const filtered = sprites.filter(x => {
    const s = state[x.id] || {};
    if(activeVariant !== "All" && x.variant !== activeVariant) return false;
    if(q && !`${x.name} ${x.base} ${x.variant}`.toLowerCase().includes(q)) return false;
    if(f === "missing") return !s.owned;
    if(f === "owned") return s.owned;
    if(f === "mastered") return s.mastered;
    return true;
  });
  grid.innerHTML = "";
  filtered.forEach(x => grid.appendChild(card(x)));
}
resetBtn.onclick = () => { if(confirm("Clear all owned and mastered tracking?")){ state = {}; save(); render(); } };
searchInput.oninput = render;
filterSelect.onchange = render;
render();
