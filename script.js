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

  // 1. TU CLAVE (Ponla aquí entre las comillas)
  const API_KEY = "oE1UFMr66HFM5mZcafuYAep3vJv4NpN1"; 
  
  // 2. EL PROXY (Esto es obligatorio para que funcione desde el navegador)
  const PROXY_URL = "https://corsproxy.io/?";
  const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";

  const promptInput = `Responde con un JSON puro: {"word": "PALABRA", "hint": "PISTA"}. 
  Tema: ${themeDesc}. No uses: ${listToAvoid}. Palabra en español, mayúsculas.`;

  try {
    // Llamamos a través del proxy
    const response = await fetch(PROXY_URL + encodeURIComponent(MISTRAL_URL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "open-mistral-7b",
        messages: [{ role: "user", content: promptInput }],
        temperature: 0.8
      })
    });

    if (!response.ok) throw new Error("Mistral rechazó la clave o el proxy falló");

    const data = await response.json();
    
    // Mistral a veces devuelve el JSON con texto extra, intentamos limpiarlo
    let contentRaw = data.choices[0].message.content;
    const content = JSON.parse(contentRaw.substring(contentRaw.indexOf('{'), contentRaw.lastIndexOf('}') + 1));

    G.word = content.word.toUpperCase().trim();
    G.hint = content.hint.trim().split(/\s+/)[0].toLowerCase(); 

    console.log("IA activada correctamente:", G.word);
    return true;

  } catch (e) {
    console.error("Fallo directo de IA:", e.message);
    // Si falla, tira del respaldo para que el juego no se rompa
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
function useFallback() {
  const fallbacks = {
    actores: [
      {w: 'BRAD PITT', h: 'Troya'}, {w: 'SCARLETT JOHANSSON', h: 'Viuda'}, {w: 'TOM CRUISE', h: 'Misión'}, 
      {w: 'WILL SMITH', h: 'Príncipe'}, {w: 'LEONARDO DICAPRIO', h: 'Titanic'}, {w: 'MERYL STREEP', h: 'Oscar'}, 
      {w: 'JOHNNY DEPP', h: 'Pirata'}, {w: 'ROBERT DE NIRO', h: 'Taxi'}, {w: 'PENÉLOPE CRUZ', h: 'Volver'}, 
      {w: 'ANTONIO BANDERAS', h: 'Zorro'}, {w: 'TOM HANKS', h: 'Forrest'}, {w: 'JULIA ROBERTS', h: 'Pretty'}, 
      {w: 'MORGAN FREEMAN', h: 'Voz'}, {w: 'NATALIE PORTMAN', h: 'Cisne'}, {w: 'AL PACINO', h: 'Padrino'}, 
      {w: 'JAVIER BARDEM', h: 'No es país'}, {w: 'HARRISON FORD', h: 'Indy'}, {w: 'MARILYN MONROE', h: 'Rubia'}, 
      {w: 'ANGELINA JOLIE', h: 'Lara'}, {w: 'KEANU REEVES', h: 'Matrix'}, {w: 'DWAYNE JOHNSON', h: 'Roca'}, 
      {w: 'MARGOT ROBBIE', h: 'Barbie'}, {w: 'RYAN GOSLING', h: 'Driver'}, {w: 'EMMA STONE', h: 'La La'}, 
      {w: 'SAMUEL L JACKSON', h: 'Pulp'}, {w: 'NICOLE KIDMAN', h: 'Otros'}, {w: 'ARNOLD SCHWARZENEGGER', h: 'Terminator'}, 
      {w: 'SYLVESTER STALLONE', h: 'Rocky'}, {w: 'JACK NICHOLSON', h: 'Resplandor'}, {w: 'ANTHONY HOPKINS', h: 'Hannibal'}, 
      {w: 'BEN AFFLECK', h: 'Batman'}, {w: 'MATT DAMON', h: 'Bourne'}, {w: 'JENNIFER LAWRENCE', h: 'Sinsajo'}, 
      {w: 'VIOLA DAVIS', h: 'Criadas'}, {w: 'DANIEL DAY LEWIS', h: 'Petróleo'}, {w: 'CATE BLANCHETT', h: 'Elfa'}, 
      {w: 'CHRISTIAN BALE', h: 'Psicópata'}, {w: 'AMY ADAMS', h: 'Llegada'}, {w: 'HUGH JACKMAN', h: 'Garra'}, 
      {w: 'ANNE HATHAWAY', h: 'Princesa'}, {w: 'DENZEL WASHINGTON', h: 'Día'}, {w: 'CHARLIZE THERON', h: 'Furiosa'}, 
      {w: 'EDDIE MURPHY', h: 'Detective'}, {w: 'JIM CARREY', h: 'Máscara'}, {w: 'ADAM SANDLER', h: 'Click'}, 
      {w: 'SANDRA BULLOCK', h: 'Bus'}, {w: 'GEORGE CLOONEY', h: 'Nespresso'}, {w: 'BRADLEY COOPER', h: 'Resacón'}, 
      {w: 'CILLIAN MURPHY', h: 'Gorra'}, {w: 'TOM HARDY', h: 'Venom'}, {w: 'ZENDAYA', h: 'Duna'}, 
      {w: 'TIMOTHÉE CHALAMET', h: 'Chocolate'}, {w: 'FLORENCE PUGH', h: 'Viuda'}, {w: 'JENNA ORTEGA', h: 'Miércoles'}, 
      {w: 'PEDRO PASCAL', h: 'Casco'}, {w: 'ÚRSULA CORBERÓ', h: 'Tokio'}, {w: 'ELSA PATAKY', h: 'Rápida'}, 
      {w: 'MARIO CASAS', h: 'Barco'}, {w: 'BLANCA SUÁREZ', h: 'Cable'}, {w: 'AARON TAYLOR JOHNSON', h: 'Bond'}, 
      {w: 'AUSTIN BUTLER', h: 'Elvis'}, {w: 'ANA DE ARMAS', h: 'Rubia'}, {w: 'BENEDICT CUMBERBATCH', h: 'Sherlock'}, 
      {w: 'ROBERT DOWNEY JR', h: 'Hierro'}, {w: 'CHRIS EVANS', h: 'Escudo'}, {w: 'CHRIS HEMSWORTH', h: 'Martillo'}, 
      {w: 'MARK RUFFALO', h: 'Verde'}, {w: 'JEREMY RENNER', h: 'Arco'}, {w: 'ELIZABETH OLSEN', h: 'Bruja'}, 
      {w: 'PAUL RUDD', h: 'Hormiga'}
    ],
    futbolistas: [
      {w: 'LEO MESSI', h: 'Pulga'}, {w: 'CRISTIANO RONALDO', h: 'Bicho'}, {w: 'MARADONA', h: 'Mano'}, 
      {w: 'MBAPPÉ', h: 'Tortuga'}, {w: 'PELE', h: 'Rey'}, {w: 'ZIDANE', h: 'Cabezazo'}, 
      {w: 'RONALDINHO', h: 'Sonrisa'}, {w: 'NEYMAR', h: 'Santos'}, {w: 'HAALAND', h: 'Cyborg'}, 
      {w: 'MODRIC', h: 'Croata'}, {w: 'BENZEMA', h: 'Gato'}, {w: 'INIESTA', h: 'Fuentealbilla'}, 
      {w: 'XAVI', h: 'Motor'}, {w: 'CASILLAS', h: 'Santo'}, {w: 'SERGIO RAMOS', h: 'Minuto 93'}, 
      {w: 'PUYOL', h: 'Tiburón'}, {w: 'RAÚL', h: 'Ángel'}, {w: 'BUTRAGUEÑO', h: 'Buitre'}, 
      {w: 'VINICIUS', h: 'Baila'}, {w: 'BELLINGHAM', h: 'Brazos'}, {w: 'LEWANDOWSKI', h: 'Goles'}, 
      {w: 'KROOS', h: 'Precisión'}, {w: 'COURTOIS', h: 'Muro'}, {w: 'YAMAL', h: 'Niño'}, 
      {w: 'GAVI', h: 'Pelea'}, {w: 'PEDRI', h: 'Mago'}, {w: 'GRIEZMANN', h: 'Principito'}, 
      {w: 'SUÁREZ', h: 'Pistolero'}, {w: 'KANE', h: 'Huracán'}, {w: 'SALAH', h: 'Egipto'}, 
      {w: 'DE BRUYNE', h: 'Pases'}, {w: 'RODRI', h: 'Balón'}, {w: 'VALVERDE', h: 'Pajarito'}, 
      {w: 'JOAO FELIX', h: 'Menino'}, {w: 'FIGO', h: 'Cochinillo'}, {w: 'RONALDO NAZARIO', h: 'Fenómeno'}, 
      {w: 'BECKHAM', h: 'Faltas'}, {w: 'PIRLO', h: 'Maestro'}, {w: 'BUFFON', h: 'Guantes'}, 
      {w: 'IBRAHIMOVIC', h: 'Dios'}, {w: 'ETO O', h: 'León'}, {w: 'FORLÁN', h: 'Cacha'}, 
      {w: 'AGÜERO', h: 'Kun'}, {w: 'DI MARIA', h: 'Fideo'}, {w: 'DYBALA', h: 'Joya'}, 
      {w: 'SALA', h: 'Tragedia'}, {w: 'ALISSON', h: 'Portero'}, {w: 'VAN DIJK', h: 'Central'}, 
      {w: 'SAKA', h: 'Cañón'}, {w: 'FODEN', h: 'City'}, {w: 'MUSIALA', h: 'Regate'}, 
      {w: 'WIRTZ', h: 'Bayer'}, {w: 'CARVAJAL', h: 'Lateral'}, {w: 'MARCELO', h: 'Pelo'}, 
      {w: 'ALVES', h: 'Copas'}, {w: 'PICAULT', h: 'Haití'}, {w: 'CHIESA', h: 'Italia'}, 
      {w: 'DONNARUMMA', h: 'Paradas'}, {w: 'OBLAK', h: 'Atleti'}, {w: 'MORATA', h: '9'}, 
      {w: 'ASENSIO', h: 'Zurda'}, {w: 'ISCO', h: 'Magia'}, {w: 'BALE', h: 'Golf'}, 
      {w: 'GUTI', h: 'Tacón'}, {w: 'VICENTE', h: 'Banda'}, {w: 'JOAQUÍN', h: 'Chiste'}, 
      {w: 'NAVAS', h: 'Duende'}, {w: 'TORRES', h: 'Niño'}, {w: 'VILLA', h: 'Guaje'}
    ],
    animales: [
      {w: 'TIBURÓN', h: 'Aletas'}, {w: 'CAMALEÓN', h: 'Lengua'}, {w: 'ÁGUILA', h: 'Pico'}, 
      {w: 'ORNITORRINCO', h: 'Pico de pato'}, {w: 'ELEFANTE', h: 'Trompa'}, {w: 'JIRAFA', h: 'Cuello'}, 
      {w: 'CANGURO', h: 'Bolsa'}, {w: 'KOALA', h: 'Eucalipto'}, {w: 'LEÓN', h: 'Melena'}, 
      {w: 'TIGRE', h: 'Rayas'}, {w: 'CEBRA', h: 'Blanco y negro'}, {w: 'PANDA', h: 'Bambú'}, 
      {w: 'GORILA', h: 'Pecho'}, {w: 'CHIMPANCÉ', h: 'Banana'}, {w: 'DELFÍN', h: 'Inteligente'}, 
      {w: 'BALLENA', h: 'Chorro'}, {w: 'PINGÜINO', h: 'Hielo'}, {w: 'AVESTRUZ', h: 'Corredora'}, 
      {w: 'FLAMENCO', h: 'Rosa'}, {w: 'HIPOPÓTAMO', h: 'Lodo'}, {w: 'COCODRILO', h: 'Río'}, 
      {w: 'SERPIENTE', h: 'Escamas'}, {w: 'LOBO', h: 'Manada'}, {w: 'ZORRO', h: 'Astuto'}, 
      {w: 'OSO POLAR', h: 'Nieve'}, {w: 'RINCERONTE', h: 'Cuerno'}, {w: 'GUEPARDO', h: 'Veloz'}, 
      {w: 'PULPO', h: 'Tentáculos'}, {w: 'MEDUSA', h: 'Picadura'}, {w: 'CABALLITO DE MAR', h: 'Cola'}, 
      {w: 'MURCIÉLAGO', h: 'Cueva'}, {w: 'BÚHO', h: 'Noche'}, {w: 'LORO', h: 'Habla'}, 
      {w: 'TUCÁN', h: 'Frutas'}, {w: 'COLIBRÍ', h: 'Flores'}, {w: 'ABEJA', h: 'Miel'}, 
      {w: 'MARIPOSA', h: 'Alas'}, {w: 'HORMIGA', h: 'Fuerte'}, {w: 'ARAÑA', h: 'Red'}, 
      {w: 'ESCORPIÓN', h: 'Veneno'}, {w: 'CAMELLO', h: 'Desierto'}, {w: 'BURRO', h: 'Orejas'}, 
      {w: 'CABALLO', h: 'Galope'}, {w: 'VACA', h: 'Leche'}, {w: 'OVEJA', h: 'Lana'}, 
      {w: 'CERDO', h: 'Barro'}, {w: 'GALLINA', h: 'Huevos'}, {w: 'GALLO', h: 'Amanecer'}, 
      {w: 'CONEJO', h: 'Zanahoria'}, {w: 'RATA', h: 'Alcantarilla'}, {w: 'RATÓN', h: 'Queso'}, 
      {w: 'ARDILLA', h: 'Nueces'}, {w: 'CASTOR', h: 'Presa'}, {w: 'ERIZO', h: 'Púas'}, 
      {w: 'TOPO', h: 'Túnel'}, {w: 'LINCE', h: 'Ojos'}, {w: 'PANTERA', h: 'Negra'}, 
      {w: 'HIENA', h: 'Risa'}, {w: 'BUITRE', h: 'Carroña'}, {w: 'CISNE', h: 'Lago'}, 
      {w: 'PELÍCANO', h: 'Bolsa'}, {w: 'FOCA', h: 'Playa'}, {w: 'MORSA', h: 'Colmillos'}, 
      {w: 'CALAMAR', h: 'Tinta'}, {w: 'MANATÍ', h: 'Sirena'}, {w: 'ALCE', h: 'Astas'}, 
      {w: 'RENO', h: 'Trineo'}, {w: 'YAK', h: 'Pelo'}, {w: 'LEMUR', h: 'Cola'}
    ],
    palabras_alea: [
      {w: 'INTERNET', h: 'Red'}, {w: 'PIRÁMIDE', h: 'Egipto'}, {w: 'TELÉFONO', h: 'Llamada'}, 
      {w: 'ASTRONAUTA', h: 'Luna'}, {w: 'DICCIONARIO', h: 'Letras'}, {w: 'BICICLETA', h: 'Pedales'}, 
      {w: 'GUITARRA', h: 'Cuerdas'}, {w: 'RELOJ', h: 'Hora'}, {w: 'ESPEJO', h: 'Reflejo'}, 
      {w: 'CÁMARA', h: 'Foto'}, {w: 'MARTILLO', h: 'Clavo'}, {w: 'TELESCOPIO', h: 'Estrellas'}, 
      {w: 'BRÚJULA', h: 'Norte'}, {w: 'AVIÓN', h: 'Vuelo'}, {w: 'SUBMARINO', h: 'Hundido'}, 
      {w: 'ZAPATO', h: 'Pie'}, {w: 'PARAGUAS', h: 'Lluvia'}, {w: 'LINTERNA', h: 'Luz'}, 
      {w: 'LÁPIZ', h: 'Escribir'}, {w: 'TIJERAS', h: 'Cortar'}, {w: 'PUENTE', h: 'Cruzar'}, 
      {w: 'CASTILLO', h: 'Rey'}, {w: 'BIBLIOTECA', h: 'Libros'}, {w: 'HOSPITAL', h: 'Médico'}, 
      {w: 'ESCUELA', h: 'Profesor'}, {w: 'IGLESIA', h: 'Campana'}, {w: 'MUSEO', h: 'Arte'}, 
      {w: 'TEATRO', h: 'Escena'}, {w: 'CINE', h: 'Pantalla'}, {w: 'ESTADIO', h: 'Grito'}, 
      {w: 'PARQUE', h: 'Árboles'}, {w: 'PLAYA', h: 'Arena'}, {w: 'MONTAÑA', h: 'Cima'}, 
      {w: 'DESIERTO', h: 'Calor'}, {w: 'VOLCÁN', h: 'Lava'}, {w: 'CASCADA', h: 'Agua'}, 
      {w: 'TERREMOTO', h: 'Grieta'}, {w: 'TORNADO', h: 'Viento'}, {w: 'TORMENTA', h: 'Rayo'}, 
      {w: 'NIEVE', h: 'Frío'}, {w: 'ARCOÍRIS', h: 'Colores'}, {w: 'FUEGO', h: 'Quema'}, 
      {w: 'HIELO', h: 'Derretido'}, {w: 'DINERO', h: 'Banco'}, {w: 'TRABAJO', h: 'Sueldo'}, 
      {w: 'VIAJE', h: 'Maleta'}, {w: 'SUEÑO', h: 'Cama'}, {w: 'MÚSICA', h: 'Oído'}, 
      {w: 'BAILE', h: 'Cuerpo'}, {w: 'DEPORTE', h: 'Sudor'}, {w: 'AMISTAD', h: 'Abrazo'}, 
      {w: 'FAMILIA', h: 'Casa'}, {w: 'AMOR', h: 'Corazón'}, {w: 'TIEMPO', h: 'Pasado'}, 
      {w: 'LIBERTAD', h: 'Volar'}, {w: 'JUSTICIA', h: 'Ley'}, {w: 'GUERRA', h: 'Pelea'}, 
      {w: 'PAZ', h: 'Blanca'}, {w: 'VIDA', h: 'Nacer'}, {w: 'MUERTE', h: 'Final'}, 
      {w: 'CIENCIA', h: 'Prueba'}, {w: 'HISTORIA', h: 'Ayer'}, {w: 'POLÍTICA', h: 'Voto'}, 
      {w: 'RELIGIÓN', h: 'Fe'}, {w: 'MAGIA', h: 'Truco'}, {w: 'SUERTE', h: 'Trébol'}, 
      {w: 'PELIGRO', h: 'Rojo'}, {w: 'ÉXITO', h: 'Meta'}, {w: 'ERROR', h: 'Fallo'}, 
      {w: 'MISTERIO', h: 'Duda'}
    ],
    series_peliculas: [
      {w: 'TITANIC', h: 'Barco'}, {w: 'STAR WARS', h: 'Sable'}, {w: 'LA CASA DE PAPEL', h: 'Máscara'}, 
      {w: 'BREAKING BAD', h: 'Cristal'}, {w: 'STRANGER THINGS', h: 'Luces'}, {w: 'JUEGO DE TRONOS', h: 'Silla'}, 
      {w: 'HARRY POTTER', h: 'Varita'}, {w: 'EL SEÑOR DE LOS ANILLOS', h: 'Joyita'}, {w: 'AVENGERS', h: 'Guante'}, 
      {w: 'JURASSIC PARK', h: 'Dino'}, {w: 'THE WALKING DEAD', h: 'Zombi'}, {w: 'LOS SIMPSON', h: 'Amarillo'}, 
      {w: 'FRIENDS', h: 'Sofá'}, {w: 'EL PADRINO', h: 'Oferta'}, {w: 'BATMAN', h: 'Capa'}, 
      {w: 'SPIDERMAN', h: 'Telaraña'}, {w: 'EL REY LEÓN', h: 'Roca'}, {w: 'TOY STORY', h: 'Vaquero'}, 
      {w: 'SHREK', h: 'Ogro'}, {w: 'EL CABALLERO OSCURO', h: 'Caos'}, {w: 'INCEPTION', h: 'Peonza'}, 
      {w: 'PULP FICTION', h: 'Maletín'}, {w: 'MATRIX', h: 'Pastilla'}, {w: 'GLADIATOR', h: 'Arena'}, 
      {w: 'BRAVEHEART', h: 'Libertad'}, {w: 'FOREST GUMP', h: 'Caja'}, {w: 'EL SHOW DE TRUMAN', h: 'Cámara'}, 
      {w: 'PARÁSITOS', h: 'Sótano'}, {w: 'EL JUEGO DEL CALAMAR', h: 'Muñeca'}, {w: 'ELITE', h: 'Colegio'}, 
      {w: 'NARCOS', h: 'Plata'}, {w: 'PEAKY BLINDERS', h: 'Gorra'}, {w: 'THE CROWN', h: 'Reina'}, 
      {w: 'DARK', h: 'Tiempo'}, {w: 'LOST', h: 'Isla'}, {w: 'PRISON BREAK', h: 'Mapa'}, 
      {w: 'GREY S ANATOMY', h: 'Bisturí'}, {w: 'BLACK MIRROR', h: 'Pantalla'}, {w: 'COBRA KAI', h: 'Patada'}, 
      {w: 'THE MANDALORIAN', h: 'Camino'}, {w: 'THE BOYS', h: 'Leche'}, {w: 'TED LASSO', h: 'Fútbol'}, 
      {w: 'SUCCESION', h: 'Empresa'}, {w: 'THE BEAR', h: 'Cocina'}, {w: 'EUPHORIA', h: 'Brillo'}, 
      {w: 'SEX EDUCATION', h: 'Clínica'}, {w: 'SQUID GAME', h: 'Juego'}, {w: 'BRIDGERTON', h: 'Carta'}, 
      {w: 'THE WITCHER', h: 'Monstruo'}, {w: 'YOU', h: 'Libro'}, {w: 'THE LAST OF US', h: 'Hongo'}, 
      {w: 'FALLOUT', h: 'Refugio'}, {w: 'THE OFFICE', h: 'Papel'}, {w: 'SINFELD', h: 'Nada'}, 
      {w: 'HOW I MET YOUR MOTHER', h: 'Paraguas'}, {w: 'THE BIG BANG THEORY', h: 'Átomo'}, 
      {w: 'MODERN FAMILY', h: 'Entrevista'}, {w: 'BROOKLYN NINE NINE', h: 'Placa'}, 
      {w: 'MALCOLM IN THE MIDDLE', h: 'Hermanos'}, {w: 'DR HOUSE', h: 'Bastón'}, 
      {w: 'SHERLOCK', h: 'Lupa'}, {w: 'SUPERNATURAL', h: 'Coche'}, {w: 'VIKINGOS', h: 'Hacha'}, 
      {w: 'CHERNOBYL', h: 'Núcleo'}, {w: 'AVATAR', h: 'Azul'}, {w: 'MAD MAX', h: 'Gasolina'}, 
      {w: 'INTERSTELLAR', h: 'Reloj'}, {w: 'DJANGO', h: 'Cadena'}, {w: 'Scream', h: 'Máscara'}, 
      {w: 'IT', h: 'Globo'}
    ],
    comida: [
      {w: 'PIZZA', h: 'Italia'}, {w: 'SUSHI', h: 'Japón'}, {w: 'HAMBURGUESA', h: 'EEUU'}, 
      {w: 'PAELLA', h: 'España'}, {w: 'TACOS', h: 'México'}, {w: 'PASTA', h: 'Trigo'}, 
      {w: 'LASAÑA', h: 'Capas'}, {w: 'ENSALADA', h: 'Verde'}, {w: 'SOPA', h: 'Cuchara'}, 
      {w: 'FILETE', h: 'Carne'}, {w: 'POLLO ASADO', h: 'Horno'}, {w: 'PESCADO', h: 'Mar'}, 
      {w: 'ARROZ', h: 'Grano'}, {w: 'LENTEJAS', h: 'Hierro'}, {w: 'GARBANZOS', h: 'Cocido'}, 
      {w: 'HUEVOS', h: 'Gallina'}, {w: 'PATATAS FRITAS', h: 'Aceite'}, {w: 'TORTILLA', h: 'Huevo'}, 
      {w: 'CROQUETAS', h: 'Bechamel'}, {w: 'JAMÓN', h: 'Pata'}, {w: 'QUESO', h: 'Vaca'}, 
      {w: 'PAN', h: 'Harina'}, {w: 'MANZANA', h: 'Roja'}, {w: 'PLÁTANO', h: 'Amarillo'}, 
      {w: 'NARANJA', h: 'Zumo'}, {w: 'FRESA', h: 'Dulce'}, {w: 'UVA', h: 'Vino'}, 
      {w: 'SANDÍA', h: 'Verano'}, {w: 'PIÑA', h: 'Escamas'}, {w: 'CHOCOLATE', h: 'Cacao'}, 
      {w: 'HELADO', h: 'Frío'}, {w: 'TARTA', h: 'Cumpleaños'}, {w: 'GALLETAS', h: 'Leche'}, 
      {w: 'CAFÉ', h: 'Taza'}, {w: 'TÉ', h: 'Bolsa'}, {w: 'CERVEZA', h: 'Espuma'}, 
      {w: 'VINO', h: 'Copa'}, {w: 'REFRESCO', h: 'Gas'}, {w: 'AGUA', h: 'Sed'}, 
      {w: 'LECHE', h: 'Blanca'}, {w: 'YOGUR', h: 'Cuchara'}, {w: 'MANTEQUILLA', h: 'Untar'}, 
      {w: 'ACEITE', h: 'Oliva'}, {w: 'SAL', h: 'Mar'}, {w: 'AZÚCAR', h: 'Dulce'}, 
      {w: 'PIMIENTA', h: 'Pica'}, {w: 'CEBOLLA', h: 'Llorar'}, {w: 'AJO', h: 'Olor'}, 
      {w: 'TOMATE', h: 'Salsa'}, {w: 'LECHUGA', h: 'Hoja'}, {w: 'ZANAHORIA', h: 'Conejo'}, 
      {w: 'PEPINO', h: 'Agua'}, {w: 'CALABACÍN', h: 'Verde'}, {w: 'BERENJENA', h: 'Morada'}, 
      {w: 'PIMIENTO', h: 'Rojo'}, {w: 'CHAMPIÑÓN', h: 'Seta'}, {w: 'GAMBAS', h: 'Marisco'}, 
      {w: 'CALAMARES', h: 'Anillos'}, {w: 'PULPO', h: 'Gallega'}, {w: 'MEJILLONES', h: 'Roca'}, 
      {w: 'BACON', h: 'Grasa'}, {w: 'SALCHICHA', h: 'Perro'}, {w: 'CHURROS', h: 'Mañana'}, 
      {w: 'DONUTS', h: 'Agujero'}, {w: 'CROISSANT', h: 'Media'}, {w: 'FLAN', h: 'Huevo'}, 
      {w: 'NATILLAS', h: 'Canela'}, {w: 'GUACAMOLE', h: 'Aguacate'}, {w: 'HUMMUS', h: 'Garbanzo'}, 
      {w: 'RAMEN', h: 'Fideos'}
    ],
    objetos: [
      {w: 'MARTILLO', h: 'Herramienta'}, {w: 'TIJERAS', h: 'Cortar'}, {w: 'LÁPIZ', h: 'Escribir'}, 
      {w: 'RELOJ', h: 'Hora'}, {w: 'ESPEJO', h: 'Reflejo'}, {w: 'CÁMARA', h: 'Lente'}, 
      {w: 'LINTERNA', h: 'Luz'}, {w: 'PARAGUAS', h: 'Lluvia'}, {w: 'ZAPATO', h: 'Suelo'}, 
      {w: 'GAFAS', h: 'Ver'}, {w: 'BOLÍGRAFO', h: 'Tinta'}, {w: 'CUADERNO', h: 'Hojas'}, 
      {w: 'LLAVE', h: 'Cerradura'}, {w: 'CANDADO', h: 'Seguridad'}, {w: 'CARTERA', h: 'Dinero'}, 
      {w: 'MOCHILA', h: 'Espalda'}, {w: 'TELÉFONO', h: 'Pantalla'}, {w: 'AURICULARES', h: 'Música'}, 
      {w: 'PEINE', h: 'Pelo'}, {w: 'CEPILLO', h: 'Dientes'}, {w: 'TOALLA', h: 'Ducha'}, 
      {w: 'JABÓN', h: 'Burbujas'}, {w: 'PLATO', h: 'Comida'}, {w: 'VASO', h: 'Cristal'}, 
      {w: 'TENEDOR', h: 'Pinchos'}, {w: 'CUCHILLO', h: 'Filo'}, {w: 'CUCHARA', h: 'Sopa'}, 
      {w: 'SARTÉN', h: 'Fuego'}, {w: 'OLLA', h: 'Caliente'}, {w: 'PLANCHA', h: 'Arruga'}, 
      {w: 'ASPIRADORA', h: 'Polvo'}, {w: 'ESCOBA', h: 'Barrer'}, {w: 'CUBO', h: 'Agua'}, 
      {w: 'PERCHA', h: 'Armario'}, {w: 'ALMOHADA', h: 'Sueño'}, {w: 'SÁBANA', h: 'Cama'}, 
      {w: 'MANTA', h: 'Frío'}, {w: 'CORTINA', h: 'Ventana'}, {w: 'ALFOMBRA', h: 'Pies'}, 
      {w: 'CUADRO', h: 'Pared'}, {w: 'LÁMPARA', h: 'Bombilla'}, {w: 'SILLA', h: 'Sentado'}, 
      {w: 'MESA', h: 'Apoyo'}, {w: 'SOFÁ', h: 'Descanso'}, {w: 'TELEVISIÓN', h: 'Mando'}, 
      {w: 'ORDENADOR', h: 'Teclado'}, {w: 'RATÓN', h: 'Click'}, {w: 'IMPRESORA', h: 'Tinta'}, 
      {w: 'CALCULADORA', h: 'Números'}, {w: 'MANDO', h: 'Botones'}, {w: 'PILAS', h: 'Energía'}, 
      {w: 'BATERÍA', h: 'Carga'}, {w: 'ENCHUFE', h: 'Pared'}, {w: 'CABLE', h: 'Corriente'}, 
      {w: 'MALETA', h: 'Viaje'}, {w: 'BOLSA', h: 'Compra'}, {w: 'BOTELLA', h: 'Plástico'}, 
      {w: 'LATA', h: 'Metal'}, {w: 'CAJA', h: 'Cartón'}, {w: 'PAPEL', h: 'Blanco'}, 
      {w: 'SOBRE', h: 'Carta'}, {w: 'SELLO', h: 'Correo'}, {w: 'MONEDA', h: 'Metal'}, 
      {w: 'BILLETE', h: 'Papel'}, {w: 'TARJETA', h: 'Plástico'}, {w: 'PASAPORTE', h: 'Avión'}, 
      {w: 'RELOJ DE ARENA', h: 'Tiempo'}, {w: 'BRÚJULA', h: 'Norte'}, {w: 'TELESCOPIO', h: 'Estrellas'}, 
      {w: 'MICROSCOPIO', h: 'Pequeño'}
    ],
    marcas: [
      {w: 'APPLE', h: 'Manzana'}, {w: 'SAMSUNG', h: 'Galaxia'}, {w: 'GOOGLE', h: 'Buscador'}, 
      {w: 'MICROSOFT', h: 'Ventanas'}, {w: 'AMAZON', h: 'Flecha'}, {w: 'SONY', h: 'Jugar'}, 
      {w: 'NINTENDO', h: 'Mario'}, {w: 'TESLA', h: 'Eléctrico'}, {w: 'FERRARI', h: 'Caballo'}, 
      {w: 'TOYOTA', h: 'Japón'}, {w: 'FORD', h: 'Coche'}, {w: 'BMW', h: 'Círculo'}, 
      {w: 'AUDI', h: 'Anillos'}, {w: 'MERCEDES', h: 'Estrella'}, {w: 'VOLKSWAGEN', h: 'Pueblo'}, 
      {w: 'NIKE', h: 'Ala'}, {w: 'ADIDAS', h: 'Rayas'}, {w: 'PUMA', h: 'Felino'}, 
      {w: 'REEBOK', h: 'Deporte'}, {w: 'ZARA', h: 'Ropa'}, {w: 'GUCCI', h: 'Lujo'}, 
      {w: 'LOUIS VUITTON', h: 'Maletas'}, {w: 'ROLEX', h: 'Reloj'}, {w: 'COCA COLA', h: 'Rojo'}, 
      {w: 'PEPSI', h: 'Azul'}, {w: 'STARBUCKS', h: 'Sirena'}, {w: 'MCDONALDS', h: 'M'}, 
      {w: 'BURGER KING', h: 'Corona'}, {w: 'NESTLÉ', h: 'Nido'}, {w: 'DANONE', h: 'Yogur'}, 
      {w: 'KELLOGGS', h: 'Gallo'}, {w: 'DISNEY', h: 'Ratón'}, {w: 'NETFLIX', h: 'Serie'}, 
      {w: 'YOUTUBE', h: 'Vídeo'}, {w: 'FACEBOOK', h: 'Azul'}, {w: 'INSTAGRAM', h: 'Foto'}, 
      {w: 'TWITTER', h: 'Pájaro'}, {w: 'TIKTOK', h: 'Música'}, {w: 'WHATSAPP', h: 'Verde'}, 
      {w: 'VISA', h: 'Pago'}, {w: 'MASTERCARD', h: 'Círculos'}, {w: 'IKEA', h: 'Muebles'}, 
      {w: 'LEROY MERLIN', h: 'Casa'}, {w: 'DECATHLON', h: 'Deporte'}, {w: 'H&M', h: 'Moda'}, 
      {w: 'PRADA', h: 'Zapatos'}, {w: 'CHANEL', h: 'Perfume'}, {w: 'LEGO', h: 'Piezas'}, 
      {w: 'BARBIE', h: 'Rosa'}, {w: 'HOT WHEELS', h: 'Coches'}, {w: 'REDBULL', h: 'Alas'}, 
      {w: 'MONSTER', h: 'Garra'}, {w: 'HEINEKEN', h: 'Estrella'}, {w: 'CORONA', h: 'Limón'}, 
      {w: 'NESPRESSO', h: 'Cápsula'}, {w: 'OREO', h: 'Galleta'}, {w: 'KINDER', h: 'Huevo'}, 
      {w: 'NUTELLA', h: 'Cacao'}, {w: 'PAMPERS', h: 'Bebé'}, {w: 'COLGATE', h: 'Dientes'}, 
      {w: 'GILLETTE', h: 'Barba'}, {w: 'DOVE', h: 'Jabón'}, {w: 'PANTENE', h: 'Pelo'}, 
      {w: 'L OREAL', h: 'París'}, {w: 'NIVEA', h: 'Crema'}, {w: 'CANON', h: 'Foto'}, 
      {w: 'NIKON', h: 'Lente'}, {w: 'HP', h: 'Tinta'}, {w: 'DELL', h: 'Portátil'}, 
      {w: 'SHELL', h: 'Concha'}
    ]
  };

  // Obtener lista del tema actual o una por defecto
  const list = fallbacks[G.theme] || fallbacks['palabras_alea'];
  
  // Elegir una al azar
  const pick = list[Math.floor(Math.random() * list.length)];

  // ASIGNAR CORRECTAMENTE
  G.word = pick.w.toUpperCase();
  G.hint = pick.h; 
  
  console.log("🎲 PALABRA SELECCIONADA (Local):", G.word);
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
  
  // --- NUEVA LÓGICA: ELEGIR QUIÉN EMPIEZA ---
  if (G.alive.length > 0) {
    const randomIndex = Math.floor(Math.random() * G.alive.length);
    const starterName = G.alive[randomIndex];
    document.getElementById('starter-name').textContent = starterName.toUpperCase();
  }
  // -----------------------------------------

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