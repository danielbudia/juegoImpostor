// ══════════════════════════════════════════════════════
// EL IMPOSTOR — script.js  (versión optimizada)
// ══════════════════════════════════════════════════════

// ── ESTADO GLOBAL ──────────────────────────────────────
const G = {
  playerCount: 4,
  playerNames: [],
  impostorCount: 1,
  hintEnabled: false,
  rounds: 3,
  duration: 3,
  theme: null,
  word: '',
  hint: '',
  impostors: [],
  currentReveal: 0,
  revealed: false,
  currentRound: 1,
  timerInterval: null,
  timerSeconds: 0,
  eliminated: [],
  alive: [],
  // Anti-repetición: historial de palabras usadas por tema
  usedWords: {},
  // Jugador pendiente de confirmar voto
  pendingVote: null,
};

// ── TEMAS ─────────────────────────────────────────────
const THEMES = [
  { id: 'actores',          label: 'Actores',            icon: 'actor' },
  { id: 'futbolistas',      label: 'Futbolistas',        icon: 'futbol' },
  { id: 'animales',         label: 'Animales',           icon: 'animal' },
  { id: 'palabras_alea',    label: 'Aleatorio',          icon: 'random' },
  { id: 'series_peliculas', label: 'Cine & Series',      icon: 'cinema' },
  { id: 'objetos',          label: 'Objetos',            icon: 'objeto' },
  { id: 'marcas',           label: 'Marcas',             icon: 'marca' },
  { id: 'comida',           label: 'Comida',             icon: 'comida' },
];

// SVG icons profesionales por tema (sin emojis)
const THEME_ICONS = {
  actor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    <path d="M8 8c0 0 .5 2 4 2s4-2 4-2" stroke-width="1"/>
  </svg>`,
  futbol: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 3l2.5 3.5L12 9.5 9.5 6.5z"/><path d="M3.5 9.5L7 8l2 3.5-2 3-3.5-.5z"/>
    <path d="M5 17.5l2.5-2 3 1.5v3.5"/><path d="M19 17.5l-2.5-2-3 1.5v3.5"/>
    <path d="M20.5 9.5L17 8l-2 3.5 2 3 3.5-.5z"/>
  </svg>`,
  animal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 3c0 1.5-1.5 3-3 3S3 7.5 3 9c0 3 2 5 4 5"/><path d="M16 3c0 1.5 1.5 3 3 3s2 1.5 2 3c0 3-2 5-4 5"/>
    <path d="M7 14c0 3.3 2.2 6 5 6s5-2.7 5-6c0-2-1-4-3-5h-4c-2 1-3 3-3 5z"/>
    <circle cx="9.5" cy="15.5" r="1" fill="currentColor"/><circle cx="14.5" cy="15.5" r="1" fill="currentColor"/>
  </svg>`,
  random: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3"/>
    <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor"/>
    <circle cx="8.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/>
    <circle cx="12" cy="12" r="1.2" fill="currentColor"/>
  </svg>`,
  cinema: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M7 4v16M17 4v16M2 8h5M17 8h5M2 12h20M2 16h5M17 16h5"/>
  </svg>`,
  objeto: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>`,
  marca: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>`,
  comida: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
  </svg>`,
};

// Prompts específicos por tema para la API
const THEME_PROMPTS = {
  actores:          'actores o actrices internacionales de cualquier época, evita los 5 más famosos y que siempre sean diferentes',
  futbolistas:      'futbolistas internacionales, pueden ser retirados o actuales y que siempre sean diferentes',
  animales:         'animales del mundo famosos y que siempre sean diferentes',
  palabras_alea:    'objetos, profesiones o conceptos cotidianos muy variados y que siempre sean diferentes',
  series_peliculas: 'títulos de películas o series populares de cualquier género y que siempre sean diferentes',
  objetos:          'objetos físicos que podrías encontrar en cualquier lado y que siempre sean diferentes',
  marcas:           'marcas famosas de tecnología, moda, coches o alimentación y que siempre sean diferentes',
  comida:           'platos de cocina, ingredientes o bebidas de cualquier parte del mundo y que siempre sean diferentes'
};

// ── NAVEGACIÓN ────────────────────────────────────────
function goTo(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  el.classList.add('active');
  el.style.animation = 'none';
  requestAnimationFrame(() => { el.style.animation = ''; });
  window.scrollTo(0, 0);
}

// ── SCREEN 2: JUGADORES ───────────────────────────────
function renderPlayerInputs() {
  const c = document.getElementById('player-inputs');
  c.innerHTML = '';
  for (let i = 0; i < G.playerCount; i++) {
    const div = document.createElement('div');
    div.className = 'player-item';
    div.innerHTML = `
      <span class="player-num">${String(i + 1).padStart(2, '0')}</span>
      <input type="text" id="pname-${i}" placeholder="Jugador ${i + 1}"
        value="${G.playerNames[i] || ''}"
        oninput="G.playerNames[${i}]=this.value">`;
    c.appendChild(div);
  }
  document.getElementById('player-count-val').textContent = G.playerCount;
}

function changePlayerCount(d) {
  G.playerCount = Math.max(3, Math.min(20, G.playerCount + d));
  renderPlayerInputs();
  clampImpostors();
}

function goToConfig() {
  const names = [];
  for (let i = 0; i < G.playerCount; i++) {
    const v = (document.getElementById(`pname-${i}`)?.value || '').trim();
    if (!v) { alert(`Introduce el nombre del jugador ${i + 1}`); return; }
    names.push(v);
  }
  G.playerNames = names;
  G.alive = [...G.playerNames];
  clampImpostors();
  goTo('s-config');
}

renderPlayerInputs();

// ── SCREEN 3: CONFIG ──────────────────────────────────
function clampImpostors() {
  const max = Math.floor(G.playerCount / 2);
  G.impostorCount = Math.max(1, Math.min(max, G.impostorCount));
  const el = document.getElementById('impostor-count-val');
  if (el) el.textContent = G.impostorCount;
}

function changeImpostors(d) {
  const max = Math.floor(G.playerCount / 2);
  G.impostorCount = Math.max(1, Math.min(max, G.impostorCount + d));
  document.getElementById('impostor-count-val').textContent = G.impostorCount;
  document.getElementById('impostor-hint').textContent = `Máximo ${max} para ${G.playerCount} jugadores`;
}

function changeRounds(d) {
  G.rounds = Math.max(1, Math.min(10, G.rounds + d));
  document.getElementById('rounds-val').textContent = G.rounds;
}

function changeDuration(d) {
  G.duration = Math.max(1, Math.min(15, G.duration + d));
  document.getElementById('duration-val').textContent = G.duration;
}

// ── SCREEN 4: TEMA ────────────────────────────────────
(function buildThemes() {
  const g = document.getElementById('theme-grid');
  THEMES.forEach(t => {
    const div = document.createElement('div');
    div.className = 'theme-card';
    div.id = 'theme-' + t.id;
    div.innerHTML = `
      <div class="theme-icon">${THEME_ICONS[t.icon] || ''}</div>
      <div class="theme-name">${t.label}</div>`;
    div.onclick = () => selectTheme(t.id);
    g.appendChild(div);
  });
})();

function selectTheme(id) {
  document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('theme-' + id).classList.add('selected');
  G.theme = id;
}

// ── GENERACIÓN DE PALABRA VÍA API ─────────────────────
// ── GENERACIÓN DE PALABRA VÍA GOOGLE GEMINI API ─────────────────────
// ── GENERACIÓN DE PALABRA VÍA GEMINI ─────────────────────
// SUSTITUYE ESTA PARTE EN TU script.js
async function generateWord() {
  if (!G.theme) { alert('Selecciona un tema primero'); return false; }

  const themeDesc = THEME_PROMPTS[G.theme] || G.theme;
  const used = G.usedWords[G.theme] || [];
  const listToAvoid = used.slice(-50).join(', ');

  const promptInput = `TEMA: ${themeDesc}. 
  LISTA NEGRA: [${listToAvoid}].
  REGLAS: Palabra difícil en español y MAYÚSCULAS. Pista (hint) de una sola palabra relacionada.
  RESPUESTA: JSON {"word": "...", "hint": "..."}`;

  try {
    // LLAMAMOS A NUESTRA PROPIA API EN VERCEL
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptInput })
    });

    if (!response.ok) throw new Error("Fallo en la comunicación con la API");

    const data = await response.json();
    
    // Mistral devuelve la respuesta en choices[0].message.content
    const content = JSON.parse(data.choices[0].message.content);

    G.word = content.word.toUpperCase().trim();
    G.hint = content.hint.trim().split(/\s+/)[0].toLowerCase(); 

    if (!G.usedWords[G.theme]) G.usedWords[G.theme] = [];
    G.usedWords[G.theme].push(G.word);

    console.log("🎲 Palabra de Mistral recibida:", G.word);
    return true;

  } catch (e) {
    console.warn("🔌 Error en IA, tirando de respaldo:", e.message);
    return useFallback(); 
  }
}
// Función de respaldo con Groq usando el modelo más potente
async function fetchFromGroq(themeDesc, used) {
  const API_KEY = 'TU_API_KEY_GROQ';
  const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
  const PROXY = 'https://corsproxy.io/?';

  try {
    const res = await fetch(PROXY + ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile', // <--- Cambiado de 8b a 70b
        messages: [{ role: 'user', content: `Tema: ${themeDesc}. No uses: ${used}. Solo JSON: {"word": "...", "hint": "..."}` }],
        response_format: { type: "json_object" }
      })
    });
    const data = await res.json();
    const content = JSON.parse(data.choices[0].message.content);
    G.word = content.word.toUpperCase().trim();
    G.hint = content.hint.trim().split(' ')[0].toLowerCase();
    return true;
  } catch (e) {
    return useFallback(); // Tu función de palabras locales si todo falla
  }
}
// Fallback local si falla la API
function useFallback() {
  const fallbacks = {
    actores: [
      {w: 'BRAD PITT', h: 'guapo'},
      {w: 'SCARLETT JOHANSSON', h: 'cachonda'},
      {w: 'TOM CRUISE', h: 'propio doble'},
      {w: 'WILL SMITH', h: 'guantazo'}
    ],
    futbolistas: [
      {w: 'LEO MESSI', h: 'zurdo'},
      {w: 'CRISTIANO RONALDO', h: 'guapo'},
      {w: 'MARADONA', h: 'cocainomano'},
      {w: 'MBAPPÉ', h: 'Lgeneral'}
    ],
    animales: [
      {w: 'TIBURÓN', h: 'dientes'},
      {w: 'CAMALEÓN', h: 'color'},
      {w: 'ÁGUILA', h: 'ratones'},
      {w: 'ORNITORRINCO', h: 'raro'}
    ],
    palabras_alea: [
      {w: 'INTERNET', h: 'red'},
      {w: 'PIRÁMIDE', h: 'aliens'},
      {w: 'TELÉFONO', h: 'droga'}
    ],
    series_peliculas: [
      {w: 'TITANIC', h: 'hielo'},
      {w: 'STAR WARS', h: 'espada'},
      {w: 'LA CASA DE PAPEL', h: 'rojos'}
    ],
    comida: [
      {w: 'PIZZA', h: 'franquicia'},
      {w: 'SUSHI', h: 'moda'},
      {w: 'HAMBURGUESA', h: 'USA'}
    ]
  };

  // Obtener lista del tema actual o una por defecto
  const list = fallbacks[G.theme] || fallbacks['palabras_alea'];
  
  // Elegir una al azar
  const pick = list[Math.floor(Math.random() * list.length)];

  // ASIGNAR CORRECTAMENTE
  G.word = pick.w.toUpperCase();
  G.hint = pick.h; 
  
  console.log("🔌 MODO OFFLINE ACTIVADO > Usando palabra local:", G.word);
  return true;
}

// ── SCREEN 5: REVEAL ──────────────────────────────────
async function startWordReveal() {
  if (!G.theme) { alert('Selecciona un tema'); return; }

  goTo('s-reveal');

  // Asignar impostores aleatoriamente
  const indices = [...Array(G.playerCount).keys()];
  G.impostors = [];
  const pool = [...indices];
  while (G.impostors.length < G.impostorCount) {
    const pick = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    G.impostors.push(pick);
  }
  G.currentReveal = 0;
  G.revealed = false;
  G.alive = [...G.playerNames];
  G.eliminated = [];

  // Estado de carga
  const wordEl = document.getElementById('reveal-word');
  wordEl.className = 'word-big hidden-word';
  wordEl.innerHTML = '<div class="spinner"></div><div class="loading-text">Generando palabra con IA...</div>';
  document.getElementById('reveal-tag').innerHTML = '';
  document.getElementById('reveal-hint-box').style.display = 'none';
  document.getElementById('reveal-btn').style.display = 'none';
  document.getElementById('reveal-nav').style.display = 'none';
  document.getElementById('reveal-start').style.display = 'none';
  document.getElementById('reveal-player-name').textContent = '...';
  document.getElementById('reveal-dots').innerHTML = '';

  const ok = await generateWord();
  if (!ok) return;

  buildRevealDots();
  showRevealPlayer();
}

function buildRevealDots() {
  const d = document.getElementById('reveal-dots');
  d.innerHTML = '';
  G.playerNames.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.id = `rdot-${i}`;
    d.appendChild(dot);
  });
}

function showRevealPlayer() {
  const i = G.currentReveal;
  const name = G.playerNames[i];
  const isImpostor = G.impostors.includes(i);

  document.getElementById('reveal-player-sub').textContent = `JUGADOR ${i + 1} DE ${G.playerCount}`;
  document.getElementById('reveal-player-name').textContent = name.toUpperCase();

  const wordEl = document.getElementById('reveal-word');
  wordEl.className = 'word-big hidden-word';
  wordEl.textContent = isImpostor ? 'IMPOSTOR' : G.word;

  document.getElementById('reveal-tag').innerHTML = '';
  document.getElementById('reveal-hint-box').style.display = 'none';
  document.getElementById('reveal-nav').style.display = 'none';
  document.getElementById('reveal-start').style.display = 'none';

  const btn = document.getElementById('reveal-btn');
  btn.style.display = 'block';
  btn.textContent = '👁 MANTÉN PARA VER TU PALABRA';
  btn.className = 'reveal-btn';

  // Actualizar dots
  document.querySelectorAll('.dot').forEach((d, idx) => {
    d.className = 'dot' + (idx < i ? ' done' : idx === i ? ' active' : '');
  });

  G.revealed = false;

  // Press & hold para revelar (funciona en mobile y desktop)
  let holdTimer;
  const startHold = () => { holdTimer = setTimeout(() => revealWord(isImpostor), 350); };
  const cancelHold = () => clearTimeout(holdTimer);

  btn.onmousedown = startHold;
  btn.ontouchstart = (e) => { e.preventDefault(); startHold(); };
  btn.onmouseup = cancelHold;
  btn.onmouseleave = cancelHold;
  btn.ontouchend = cancelHold;
  btn.ontouchcancel = cancelHold;
}

function revealWord(isImpostor) {
  if (G.revealed) return;
  G.revealed = true;

  const wordEl = document.getElementById('reveal-word');
  wordEl.className = 'word-big' + (isImpostor ? ' impostor' : '');
  wordEl.textContent = isImpostor ? 'IMPOSTOR' : G.word;

  const tagEl = document.getElementById('reveal-tag');
  const hintBox = document.getElementById('reveal-hint-box');

  if (isImpostor) {
    tagEl.innerHTML = '<span class="word-tag impostor-tag">⚠ Eres el Impostor</span>';
    
    // Solo mostrar si se activó en configuración y hay una pista
    if (G.hintEnabled && G.hint) {
      hintBox.style.display = 'block';
      hintBox.innerHTML = `
        <div class="hint-box">
          <div class="hint-label">Pista del sistema</div>
          <div class="hint-text">"${G.hint}"</div>
        </div>`;
    } else {
      hintBox.style.display = 'none';
    }
  } else {
    tagEl.innerHTML = '<span class="word-tag citizen-tag">✓ Ciudadano</span>';
    hintBox.style.display = 'none';
  }

  const btn = document.getElementById('reveal-btn');
  btn.textContent = '✓ Palabra vista — Pasa el teléfono';
  btn.className = 'reveal-btn seen';
  
  btn.onmousedown = null;
  btn.ontouchstart = null;

  const isLast = G.currentReveal === G.playerCount - 1;
  document.getElementById('reveal-nav').style.display = isLast ? 'none' : 'block';
  document.getElementById('reveal-start').style.display = isLast ? 'block' : 'none';
}

function nextReveal() {
  G.currentReveal++;
  G.revealed = false;
  showPassScreen();
}

// ── PANTALLA DE TRANSICIÓN "PASA EL TELÉFONO" ─────────
function showPassScreen() {
  const nextName = G.playerNames[G.currentReveal];

  // 1. Cambiamos a la pantalla de pase
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const passScreen = document.getElementById('s-pass');
  passScreen.classList.add('active');
  window.scrollTo(0, 0);

  const nameEl    = document.getElementById('pass-name');
  const countEl   = document.getElementById('pass-countdown');
  const progressEl = document.getElementById('pass-progress-bar');

  nameEl.textContent = nextName.toUpperCase();

  // 2. Lógica de la cuenta atrás
  function showCount(n) {
    countEl.className = 'pass-count';
    void countEl.offsetWidth; // Forzar reflow para reiniciar animación
    countEl.textContent = String(n);
    countEl.classList.add('count-pulse');

    if (n > 1) {
      setTimeout(() => showCount(n - 1), 1000);
    } else {
      // AQUÍ ESTABA EL FALLO: Después del "1", esperamos y VOLVEMOS a la pantalla de revelación
      setTimeout(() => {
        goTo('s-reveal'); // <--- ESTA LÍNEA ES LA QUE FALTA
        showRevealPlayer();
      }, 1000);
    }
  }

  // 3. Reiniciar y arrancar la barra de progreso
  progressEl.style.transition = 'none';
  progressEl.style.width = '100%';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      progressEl.style.transition = 'width 3s linear';
      progressEl.style.width = '0%';
    });
  });

  showCount(3);
}

// ── SCREEN 6: JUEGO ───────────────────────────────────
function startGame() {
  G.currentRound = 1;
  G.eliminated = [];
  G.alive = [...G.playerNames];
  startRound();
}

function startRound() {
  goTo('s-game');
  document.getElementById('game-round-display').textContent = String(G.currentRound).padStart(2, '0');
  G.timerSeconds = G.duration * 60;
  updateTimerDisplay();
  buildPlayersStrip();
  buildVoteGrid();
  clearInterval(G.timerInterval);
  G.timerInterval = setInterval(tickTimer, 1000);
}

function tickTimer() {
  G.timerSeconds--;
  updateTimerDisplay();
  if (G.timerSeconds <= 0) {
    clearInterval(G.timerInterval);
    endRound();
  }
}

function updateTimerDisplay() {
  const m = Math.floor(G.timerSeconds / 60);
  const s = G.timerSeconds % 60;
  const el = document.getElementById('game-timer');
  el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  el.className = 'timer-big' + (G.timerSeconds <= 30 ? ' danger' : '');
}

function buildPlayersStrip() {
  const c = document.getElementById('players-strip');
  c.innerHTML = '';
  G.playerNames.forEach(name => {
    const div = document.createElement('div');
    const dead = G.eliminated.find(e => e.name === name);
    div.className = 'player-chip' + (dead ? ' dead-chip' : '');
    div.textContent = name.toUpperCase();
    c.appendChild(div);
  });
}

function buildVoteGrid() {
  const c = document.getElementById('vote-grid');
  c.innerHTML = '';
  G.alive.forEach(name => {
    const btn = document.createElement('button');
    btn.className = 'vote-btn';
    btn.innerHTML = `<div class="player-dot"></div>${name}`;
    btn.onclick = () => initiateVote(name);
    c.appendChild(btn);
  });
}

// ── SCREEN 6b: CONFIRMAR VOTO ─────────────────────────
function initiateVote(name) {
  clearInterval(G.timerInterval);
  G.pendingVote = name;
  document.getElementById('confirm-name').textContent = name.toUpperCase();
  goTo('s-vote-confirm');
}

function confirmVote() {
  const name = G.pendingVote;
  if (!name) return;
  G.pendingVote = null;

  const idx = G.playerNames.indexOf(name);
  const isImpostor = G.impostors.includes(idx);
  G.eliminated.push({ name, isImpostor });
  G.alive = G.alive.filter(n => n !== name);

  document.getElementById('voted-name').textContent = name.toUpperCase();
  if (isImpostor) {
    document.getElementById('voted-verdict').textContent = '¡CULPABLE!';
    document.getElementById('voted-verdict').className = 'result-verdict guilty';
    document.getElementById('voted-role-desc').textContent = 'ERA EL IMPOSTOR';
  } else {
    document.getElementById('voted-verdict').textContent = 'INOCENTE';
    document.getElementById('voted-verdict').className = 'result-verdict innocent';
    document.getElementById('voted-role-desc').textContent = 'ERA UN CIUDADANO';
  }
  goTo('s-vote-result');
}

function cancelVote() {
  G.pendingVote = null;
  // Volver al juego y reanudar el timer
  goTo('s-game');
  G.timerInterval = setInterval(tickTimer, 1000);
}

// ── TRAS EL VOTO ──────────────────────────────────────
function afterVote() {
  const aliveImpostors = G.impostors.filter(idx =>
    !G.eliminated.find(e => e.name === G.playerNames[idx])
  ).length;
  const aliveCitizens = G.alive.length - aliveImpostors;

  if (aliveImpostors === 0) { endGame('ciudadanos'); return; }
  if (aliveImpostors >= aliveCitizens) { endGame('impostores'); return; }

  // Continuar ronda — reanudar timer
  goTo('s-game');
  buildVoteGrid();
  buildPlayersStrip();
  G.timerInterval = setInterval(tickTimer, 1000);
}

function endRoundEarly() {
  clearInterval(G.timerInterval);
  endRound();
}

function endRound() {
  const aliveImpostors = G.impostors.filter(idx =>
    !G.eliminated.find(e => e.name === G.playerNames[idx])
  ).length;

  document.getElementById('re-round').textContent = `${G.currentRound} / ${G.rounds}`;
  document.getElementById('re-alive').textContent = G.alive.length;
  document.getElementById('re-impostors').textContent = aliveImpostors;

  const nextBtn = document.getElementById('re-next-btn');
  if (G.currentRound >= G.rounds) {
    nextBtn.textContent = 'VER RESULTADO FINAL';
    nextBtn.onclick = () => endGame('rondas');
  } else {
    nextBtn.textContent = `INICIAR RONDA ${G.currentRound + 1}`;
    nextBtn.onclick = nextRound;
  }
  goTo('s-round-end');
}

function nextRound() {
  G.currentRound++;
  startRound();
}

function revealImpostors() {
  const names = G.impostors.map(i => G.playerNames[i]).join(', ');
  alert(`Los impostores son: ${names}`);
}

// ── FIN DEL JUEGO ─────────────────────────────────────
function endGame(reason) {
  clearInterval(G.timerInterval);

  const aliveImpostors = G.impostors.filter(idx =>
    !G.eliminated.find(e => e.name === G.playerNames[idx])
  ).length;
  const caughtImpostors = G.impostors.length - aliveImpostors;

  const ciudadanosGanan = aliveImpostors === 0;
  const verdict = ciudadanosGanan ? '¡VICTORIA!' : 'DERROTA';
  document.getElementById('final-verdict').textContent = verdict;
  document.getElementById('final-verdict').className = 'result-verdict' + (ciudadanosGanan ? ' guilty' : ' innocent');
  document.getElementById('final-impostors').textContent = G.impostors.map(i => G.playerNames[i]).join(' · ');
  document.getElementById('final-rounds').textContent = G.currentRound;
  document.getElementById('final-eliminated').textContent = G.eliminated.length;
  document.getElementById('final-caught').textContent = caughtImpostors;

  goTo('s-final');
}

// ── OPCIONES AL FINAL ─────────────────────────────────

// Seguir jugando: mantiene jugadores y config, solo elige nuevo tema
function continueGame() {
  // Resetear solo lo necesario para una nueva partida
  G.impostors = [];
  G.currentReveal = 0;
  G.revealed = false;
  G.currentRound = 1;
  G.timerInterval = null;
  G.timerSeconds = 0;
  G.eliminated = [];
  G.alive = [...G.playerNames];
  G.word = '';
  G.hint = '';
  G.theme = null;

  // Desmarcar tema seleccionado
  document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));

  goTo('s-theme');
}

// Nueva partida: reset completo
function resetGame() {
  clearInterval(G.timerInterval);
  Object.assign(G, {
    playerCount: 4, playerNames: [], impostorCount: 1, hintEnabled: false,
    rounds: 3, duration: 3, theme: null, word: '', hint: '',
    impostors: [], currentReveal: 0, revealed: false,
    currentRound: 1, timerInterval: null, timerSeconds: 0,
    eliminated: [], alive: [],
    // Mantenemos usedWords entre sesiones para máxima variedad
  });
  document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('hint-toggle').checked = false;
  document.getElementById('impostor-count-val').textContent = G.impostorCount;
  document.getElementById('rounds-val').textContent = G.rounds;
  document.getElementById('duration-val').textContent = G.duration;
  renderPlayerInputs();
  goTo('s-intro');
}


// ── PANTALLA DE CARGA INICIAL ─────────────────────────
(function initLoadingScreen() {
  const messages = [
    'INICIALIZANDO SISTEMA',
    'CARGANDO PROTOCOLOS',
    'ASIGNANDO IMPOSTORES',
    'ENCRIPTANDO PALABRAS',
    'CALIBRANDO SOSPECHAS',
    'SISTEMA LISTO',
  ];
  const bar = document.getElementById('loading-bar');
  const status = document.getElementById('loading-status');
  const titleEl = document.getElementById('loading-title-el');
  let step = 0;
  const totalSteps = messages.length;
  const stepDuration = 280;

  function tick() {
    if (step >= totalSteps) {
      // Animación final: glitch + reveal
      titleEl.closest('.loading-glitch-wrap').classList.add('glitch-active');
      setTimeout(() => {
        document.getElementById('s-loading').classList.remove('active');
        const intro = document.getElementById('s-intro');
        intro.classList.add('active');
        intro.style.animation = 'none';
        requestAnimationFrame(() => { intro.style.animation = ''; });
      }, 600);
      return;
    }
    status.textContent = messages[step];
    status.classList.remove('status-flash');
    void status.offsetWidth;
    status.classList.add('status-flash');
    bar.style.width = ((step + 1) / totalSteps * 100) + '%';
    step++;
    setTimeout(tick, stepDuration);
  }

  setTimeout(tick, 400);
})();

// ── SYNC TOGGLE ───────────────────────────────────────
document.getElementById('hint-toggle').addEventListener('change', function () {
  G.hintEnabled = this.checked;
});