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
  // ORIGINALES MEJORADOS
  {w: 'BRAD PITT', h: 'Esculpido'}, {w: 'SCARLETT JOHANSSON', h: 'Rusa'}, {w: 'TOM CRUISE', h: 'Arnés'}, 
  {w: 'WILL SMITH', h: 'Bofetada'}, {w: 'LEONARDO DICAPRIO', h: 'Tótem'}, {w: 'MERYL STREEP', h: 'Acento'}, 
  {w: 'JOHNNY DEPP', h: 'Maquillaje'}, {w: 'ROBERT DE NIRO', h: 'Gesto'}, {w: 'PENÉLOPE CRUZ', h: 'Alcobendas'}, 
  {w: 'ANTONIO BANDERAS', h: 'Málaga'}, {w: 'TOM HANKS', h: 'Voleibol'}, {w: 'JULIA ROBERTS', h: 'Sonrisa'}, 
  {w: 'MORGAN FREEMAN', h: 'Narrador'}, {w: 'NATALIE PORTMAN', h: 'Tutú'}, {w: 'AL PACINO', h: 'Rugido'}, 
  {w: 'JAVIER BARDEM', h: 'Peinado'}, {w: 'HARRISON FORD', h: 'Halcón'}, {w: 'MARILYN MONROE', h: 'Lunar'}, 
  {w: 'ANGELINA JOLIE', h: 'Labios'}, {w: 'KEANU REEVES', h: 'Píldora'}, {w: 'DWAYNE JOHNSON', h: 'Gimnasio'}, 
  {w: 'MARGOT ROBBIE', h: 'Patines'}, {w: 'RYAN GOSLING', h: 'Silencio'}, {w: 'EMMA STONE', h: 'Ojos'}, 
  {w: 'SAMUEL L JACKSON', h: 'Ezequiel'}, {w: 'NICOLE KIDMAN', h: 'Pálida'}, {w: 'ARNOLD SCHWARZENEGGER', h: 'Gobernador'}, 
  {w: 'SYLVESTER STALLONE', h: 'Guantes'}, {w: 'JACK NICHOLSON', h: 'Hacha'}, {w: 'ANTHONY HOPKINS', h: 'Bozal'}, 
  {w: 'BEN AFFLECK', h: 'Mentón'}, {w: 'MATT DAMON', h: 'Marte'}, {w: 'JENNIFER LAWRENCE', h: 'Arquería'}, 
  {w: 'VIOLA DAVIS', h: 'Lágrima'}, {w: 'DANIEL DAY LEWIS', h: 'Metódico'}, {w: 'CATE BLANCHETT', h: 'Regia'}, 
  {w: 'CHRISTIAN BALE', h: 'Transformación'}, {w: 'AMY ADAMS', h: 'Pelirroja'}, {w: 'HUGH JACKMAN', h: 'Musical'}, 
  {w: 'ANNE HATHAWAY', h: 'Diabólica'}, {w: 'DENZEL WASHINGTON', h: 'Justiciero'}, {w: 'CHARLIZE THERON', h: 'Sudafricana'}, 
  {w: 'EDDIE MURPHY', h: 'Burro'}, {w: 'JIM CARREY', h: 'Mueca'}, {w: 'ADAM SANDLER', h: 'Vacacional'}, 
  {w: 'SANDRA BULLOCK', h: 'Gravedad'}, {w: 'GEORGE CLOONEY', h: 'Elegancia'}, {w: 'BRADLEY COOPER', h: 'Director'}, 
  {w: 'CILLIAN MURPHY', h: 'Iris'}, {w: 'TOM HARDY', h: 'Bozal'}, {w: 'ZENDAYA', h: 'Euforia'}, 
  {w: 'TIMOTHÉE CHALAMET', h: 'Especia'}, {w: 'FLORENCE PUGH', h: 'Grito'}, {w: 'JENNA ORTEGA', h: 'Tétrica'}, 
  {w: 'PEDRO PASCAL', h: 'Protector'}, {w: 'ÚRSULA CORBERÓ', h: 'Resistencia'}, {w: 'ELSA PATAKY', h: 'Fitness'}, 
  {w: 'MARIO CASAS', h: 'Hormona'}, {w: 'BLANCA SUÁREZ', h: 'Telefónica'}, {w: 'AARON TAYLOR JOHNSON', h: 'Velocidad'}, 
  {w: 'AUSTIN BUTLER', h: 'Tupé'}, {w: 'ANA DE ARMAS', h: 'Cuchillos'}, {w: 'BENEDICT CUMBERBATCH', h: 'Lógica'}, 
  {w: 'ROBERT DOWNEY JR', h: 'Genio'}, {w: 'CHRIS EVANS', h: 'Patriota'}, {w: 'CHRIS HEMSWORTH', h: 'Rayo'}, 
  {w: 'MARK RUFFALO', h: 'Ira'}, {w: 'JEREMY RENNER', h: 'Puntería'}, {w: 'ELIZABETH OLSEN', h: 'Hechizo'}, 
  {w: 'PAUL RUDD', h: 'Diminuto'},
  {w: 'JOAQUIN PHOENIX', h: 'Risa'}, {w: 'HEATH LEDGER', h: 'Caos'}, {w: 'HENRY CAVILL', h: 'Capa'}, 
  {w: 'GAL GADOT', h: 'Lazo'}, {w: 'JASON MOMOA', h: 'Tridente'}, {w: 'RYAN REYNOLDS', h: 'Sarcasmo'}, 
  {w: 'EMILY BLUNT', h: 'Silencio'}, {w: 'GARY OLDMAN', h: 'Disfraz'}, {w: 'HELENA BONHAM CARTER', h: 'Gótica'}, 
  {w: 'DANIEL RADCLIFFE', h: 'Cicatriz'}, {w: 'EMMA WATSON', h: 'Biblioteca'}, {w: 'ROBERT PATTINSON', h: 'Brillo'}, 
  {w: 'KRISTEN STEWART', h: 'Inexpresiva'}, {w: 'JACKIE CHAN', h: 'Acrobacia'}, {w: 'BRUCE WILLIS', h: 'Duro'}, 
  {w: 'VIN DIESEL', h: 'Familia'}, {w: 'MILLIE BOBBY BROWN', h: 'Telequinesis'}, {w: 'TOM HOLLAND', h: 'Revelación'}, 
  {w: 'ANYA TAYLOR-JOY', h: 'Ajedrez'}, {w: 'ANDREW GARFIELD', h: 'Red'}, {w: 'JAKE GYLLENHAAL', h: 'Montaña'}, 
  {w: 'JARED LETO', h: 'Banda'}, {w: 'MATTHEW MCCONAUGHEY', h: 'Acento'}, {w: 'OLIVIA COLMAN', h: 'Reina'}, 
  {w: 'JAMIE FOXX', h: 'Ciego'}, {w: 'RAMI MALEK', h: 'Dientes'}, {w: 'REESE WITHERSPOON', h: 'Legal'}, 
  {w: 'CAMERON DIAZ', h: 'Ángel'}, {w: 'DREW BARRYMORE', h: 'Flor'}, {w: 'ADAM DRIVER', h: 'Sable'}, 
  {w: 'OSCAR ISAAC', h: 'Piloto'}, {w: 'LUPITA NYONG\'O', h: 'Espejo'}, {w: 'LUIS TOSAR', h: 'Cejas'}, 
  {w: 'JOSE CORONADO', h: 'Yogur'}, {w: 'ESTER EXPÓSITO', h: 'Marquesa'}, {w: 'MIGUEL ÁNGEL SILVESTRE', h: 'Duque'}, 
  {w: 'NAJWA NIMRI', h: 'Cárcel'}, {w: 'MAGGIE SMITH', h: 'Sombrero'}, {w: 'IAN MCKELLEN', h: 'Mago'}, 
  {w: 'PATRICK STEWART', h: 'Mente'}, {w: 'BRIE LARSON', h: 'Capitana'}, {w: 'CHRIS PRATT', h: 'Galaxia'}, 
  {w: 'ZOE SALDAÑA', h: 'Azul'}, {w: 'KATE WINSLET', h: 'Puerta'}, {w: 'JAMES FRANCO', h: 'Duende'}, 
  {w: 'SETH ROGEN', h: 'Risa'}, {w: 'TILDA SWINTON', h: 'Andrógina'}, {w: 'IDRIS ELBA', h: 'Portentoso'}, 
  {w: 'JESSICA CHASTAIN', h: 'Interestelar'}, {w: 'VICTORIA ABRIL', h: 'Tacones'}
]
    ,
    futbolistas: [
  // ORIGINALES MEJORADOS (Pistas más difíciles)
  {w: 'LEO MESSI', h: 'Rosario'}, {w: 'CRISTIANO RONALDO', h: 'Disciplina'}, {w: 'MARADONA', h: 'Cebollita'}, 
  {w: 'MBAPPÉ', h: 'Bondy'}, {w: 'PELE', h: 'Santos'}, {w: 'ZIDANE', h: 'Marsella'}, 
  {w: 'RONALDINHO', h: 'Dientes'}, {w: 'NEYMAR', h: 'Mohicano'}, {w: 'HAALAND', h: 'Androide'}, 
  {w: 'MODRIC', h: 'Eterno'}, {w: 'BENZEMA', h: 'Vendaje'}, {w: 'INIESTA', h: 'Pálido'}, 
  {w: 'XAVI', h: 'Metrónomo'}, {w: 'CASILLAS', h: 'Móstoles'}, {w: 'SERGIO RAMOS', h: 'Cabezazo'}, 
  {w: 'PUYOL', h: 'Melena'}, {w: 'RAÚL', h: 'Anillo'}, {w: 'BUTRAGUEÑO', h: 'Quinta'}, 
  {w: 'VINICIUS', h: 'Baile'}, {w: 'BELLINGHAM', h: 'Celebración'}, {w: 'LEWANDOWSKI', h: 'Múnich'}, 
  {w: 'KROOS', h: 'Blanco'}, {w: 'COURTOIS', h: 'Jirafa'}, {w: 'YAMAL', h: 'Juvenil'}, 
  {w: 'GAVI', h: 'Coraje'}, {w: 'PEDRI', h: 'Tegueste'}, {w: 'GRIEZMANN', h: 'Mate'}, 
  {w: 'SUÁREZ', h: 'Mordisco'}, {w: 'KANE', h: 'Tottenham'}, {w: 'SALAH', h: 'Faraón'}, 
  {w: 'DE BRUYNE', h: 'Asistente'}, {w: 'RODRI', h: 'Pivote'}, {w: 'VALVERDE', h: 'Halcón'}, 
  {w: 'JOAO FELIX', h: 'Talento'}, {w: 'FIGO', h: 'Traición'}, {w: 'RONALDO NAZARIO', h: 'Dentadura'}, 
  {w: 'BECKHAM', h: 'Efecto'}, {w: 'PIRLO', h: 'Vino'}, {w: 'BUFFON', h: 'Longevidad'}, 
  {w: 'IBRAHIMOVIC', h: 'Zlatan'}, {w: 'ETO O', h: 'Indomable'}, {w: 'FORLÁN', h: 'Melena'}, 
  {w: 'AGÜERO', h: 'Streamer'}, {w: 'DI MARIA', h: 'Rosarino'}, {w: 'DYBALA', h: 'Máscara'}, 
  {w: 'SALA', h: 'Vuelo'}, {w: 'ALISSON', h: 'Barba'}, {w: 'VAN DIJK', h: 'Coloso'}, 
  {w: 'SAKA', h: 'Londres'}, {w: 'FODEN', h: 'Stockport'}, {w: 'MUSIALA', h: 'Bambi'}, 
  {w: 'WIRTZ', h: 'Aspirina'}, {w: 'CARVAJAL', h: 'Leganés'}, {w: 'MARCELO', h: 'Afro'}, 
  {w: 'ALVES', h: 'Laurel'}, {w: 'PICAULT', h: 'Veloz'}, {w: 'CHIESA', h: 'Turín'}, 
  {w: 'DONNARUMMA', h: 'Gigante'}, {w: 'OBLAK', h: 'Muro'}, {w: 'MORATA', h: 'Errante'}, 
  {w: 'ASENSIO', h: 'Mallorca'}, {w: 'ISCO', h: 'Magia'}, {w: 'BALE', h: 'Hoyo'}, 
  {w: 'GUTI', h: 'Tacón'}, {w: 'VICENTE', h: 'Puñal'}, {w: 'JOAQUÍN', h: 'Finta'}, 
  {w: 'NAVAS', h: 'Duende'}, {w: 'TORRES', h: 'Atlético'}, {w: 'VILLA', h: 'Siete'},

  // 50 NUEVOS AÑADIDOS
  {w: 'JOHAN CRUYFF', h: 'Naranja'}, {w: 'FRANZ BECKENBAUER', h: 'Káiser'}, {w: 'LEV YASHIN', h: 'Araña'}, 
  {w: 'PAOLO MALDINI', h: 'Lealtad'}, {w: 'ROBERTO CARLOS', h: 'Muslo'}, {w: 'THIERRY HENRY', h: 'Zancada'}, 
  {w: 'KAKÁ', h: 'Esmóquin'}, {w: 'MANUEL NEUER', h: 'Líbero'}, {w: 'SERGIO BUSQUETS', h: 'Ancla'}, 
  {w: 'XABI ALONSO', h: 'Pasador'}, {w: 'FRANK LAMPARD', h: 'Llegada'}, {w: 'STEVEN GERRARD', h: 'Fidelidad'}, 
  {w: 'WAYNE ROONEY', h: 'Boxeador'}, {w: 'LUIS FIGO', h: 'Cochinillo'}, {w: 'SAMUEL ETO O', h: 'Rugido'}, 
  {w: 'DIDIER DROGBA', h: 'Paz'}, {w: 'HARRISON REED', h: 'Rubio'}, {w: 'ROMARIO', h: 'Área'}, 
  {w: 'GARRINCHA', h: 'Torcido'}, {w: 'EUSEBIO', h: 'Pantera'}, {w: 'MARCO VAN BASTEN', h: 'Volea'}, 
  {w: 'DENNIS BERGKAMP', h: 'Control'}, {w: 'ERIC CANTONA', h: 'Cuello'}, {w: 'GABRIEL BATISTUTA', h: 'Metralleta'}, 
  {w: 'PAVEL NEDVED', h: 'León'}, {w: 'ANDRIY SHEVCHENKO', h: 'Kiev'}, {w: 'FRANCESCO TOTTI', h: 'Gladiador'}, 
  {w: 'ALESSANDRO DEL PIERO', h: 'Pinturicchio'}, {w: 'LUKA MODRIC', h: 'Guerra'}, {w: 'SON HEUNG-MIN', h: 'Corea'}, 
  {w: 'LAUTARO MARTINEZ', h: 'Toro'}, {w: 'JULIAN ALVAREZ', h: 'Arácnido'}, {w: 'JOSHUA KIMMICH', h: 'Polivalente'}, 
  {w: 'DAVID ALABA', h: 'Silla'}, {w: 'BERNARDO SILVA', h: 'Zurda'}, {w: 'BRUNO FERNANDES', h: 'Penalti'}, 
  {w: 'MARCUS RASHFORD', h: 'Activista'}, {w: 'VICTOR OSIMHEN', h: 'Antifaz'}, {w: 'RAFAEL LEAO', h: 'Sonriente'}, 
  {w: 'DECLAN RICE', h: 'Martillo'}, {w: 'RODRYGO GOES', h: 'Rayo'}, {w: 'DAVID DE GEA', h: 'Reflejos'}, 
  {w: 'CECH', h: 'Casco'}, {w: 'PUYOL', h: 'Tarzán'}, {w: 'PEPE', h: 'Agresivo'}, 
  {w: 'ALEXIS SANCHEZ', h: 'Maravilla'}, {w: 'ARTURO VIDAL', h: 'Cresta'}, {w: 'KEYLOR NAVAS', h: 'Fe'}, 
  {w: 'CHICHARITO', h: 'Olfato'}, {w: 'JAMES RODRIGUEZ', h: 'Zurdazo'}
],
futbolistas: [
  // ORIGINALES MEJORADOS (Pistas más difíciles)
  {w: 'LEO MESSI', h: 'Rosario'}, {w: 'CRISTIANO RONALDO', h: 'Disciplina'}, {w: 'MARADONA', h: 'Cebollita'}, 
  {w: 'MBAPPÉ', h: 'Bondy'}, {w: 'PELE', h: 'Santos'}, {w: 'ZIDANE', h: 'Marsella'}, 
  {w: 'RONALDINHO', h: 'Dientes'}, {w: 'NEYMAR', h: 'Mohicano'}, {w: 'HAALAND', h: 'Androide'}, 
  {w: 'MODRIC', h: 'Eterno'}, {w: 'BENZEMA', h: 'Vendaje'}, {w: 'INIESTA', h: 'Pálido'}, 
  {w: 'XAVI', h: 'Metrónomo'}, {w: 'CASILLAS', h: 'Móstoles'}, {w: 'SERGIO RAMOS', h: 'Cabezazo'}, 
  {w: 'PUYOL', h: 'Melena'}, {w: 'RAÚL', h: 'Anillo'}, {w: 'BUTRAGUEÑO', h: 'Quinta'}, 
  {w: 'VINICIUS', h: 'Baile'}, {w: 'BELLINGHAM', h: 'Celebración'}, {w: 'LEWANDOWSKI', h: 'Múnich'}, 
  {w: 'KROOS', h: 'Blanco'}, {w: 'COURTOIS', h: 'Jirafa'}, {w: 'YAMAL', h: 'Juvenil'}, 
  {w: 'GAVI', h: 'Coraje'}, {w: 'PEDRI', h: 'Tegueste'}, {w: 'GRIEZMANN', h: 'Mate'}, 
  {w: 'SUÁREZ', h: 'Mordisco'}, {w: 'KANE', h: 'Tottenham'}, {w: 'SALAH', h: 'Faraón'}, 
  {w: 'DE BRUYNE', h: 'Asistente'}, {w: 'RODRI', h: 'Pivote'}, {w: 'VALVERDE', h: 'Halcón'}, 
  {w: 'JOAO FELIX', h: 'Talento'}, {w: 'FIGO', h: 'Traición'}, {w: 'RONALDO NAZARIO', h: 'Dentadura'}, 
  {w: 'BECKHAM', h: 'Efecto'}, {w: 'PIRLO', h: 'Vino'}, {w: 'BUFFON', h: 'Longevidad'}, 
  {w: 'IBRAHIMOVIC', h: 'Zlatan'}, {w: 'ETO O', h: 'Indomable'}, {w: 'FORLÁN', h: 'Melena'}, 
  {w: 'AGÜERO', h: 'Streamer'}, {w: 'DI MARIA', h: 'Rosarino'}, {w: 'DYBALA', h: 'Máscara'}, 
  {w: 'SALA', h: 'Vuelo'}, {w: 'ALISSON', h: 'Barba'}, {w: 'VAN DIJK', h: 'Coloso'}, 
  {w: 'SAKA', h: 'Londres'}, {w: 'FODEN', h: 'Stockport'}, {w: 'MUSIALA', h: 'Bambi'}, 
  {w: 'WIRTZ', h: 'Aspirina'}, {w: 'CARVAJAL', h: 'Leganés'}, {w: 'MARCELO', h: 'Afro'}, 
  {w: 'ALVES', h: 'Laurel'}, {w: 'PICAULT', h: 'Veloz'}, {w: 'CHIESA', h: 'Turín'}, 
  {w: 'DONNARUMMA', h: 'Gigante'}, {w: 'OBLAK', h: 'Muro'}, {w: 'MORATA', h: 'Errante'}, 
  {w: 'ASENSIO', h: 'Mallorca'}, {w: 'ISCO', h: 'Magia'}, {w: 'BALE', h: 'Hoyo'}, 
  {w: 'GUTI', h: 'Tacón'}, {w: 'VICENTE', h: 'Puñal'}, {w: 'JOAQUÍN', h: 'Finta'}, 
  {w: 'NAVAS', h: 'Duende'}, {w: 'TORRES', h: 'Atlético'}, {w: 'VILLA', h: 'Siete'},
  {w: 'JOHAN CRUYFF', h: 'Naranja'}, {w: 'FRANZ BECKENBAUER', h: 'Káiser'}, {w: 'LEV YASHIN', h: 'Araña'}, 
  {w: 'PAOLO MALDINI', h: 'Lealtad'}, {w: 'ROBERTO CARLOS', h: 'Muslo'}, {w: 'THIERRY HENRY', h: 'Zancada'}, 
  {w: 'KAKÁ', h: 'Esmóquin'}, {w: 'MANUEL NEUER', h: 'Líbero'}, {w: 'SERGIO BUSQUETS', h: 'Ancla'}, 
  {w: 'XABI ALONSO', h: 'Pasador'}, {w: 'FRANK LAMPARD', h: 'Llegada'}, {w: 'STEVEN GERRARD', h: 'Fidelidad'}, 
  {w: 'WAYNE ROONEY', h: 'Boxeador'}, {w: 'LUIS FIGO', h: 'Cochinillo'}, {w: 'SAMUEL ETO O', h: 'Rugido'}, 
  {w: 'DIDIER DROGBA', h: 'Paz'}, {w: 'HARRISON REED', h: 'Rubio'}, {w: 'ROMARIO', h: 'Área'}, 
  {w: 'GARRINCHA', h: 'Torcido'}, {w: 'EUSEBIO', h: 'Pantera'}, {w: 'MARCO VAN BASTEN', h: 'Volea'}, 
  {w: 'DENNIS BERGKAMP', h: 'Control'}, {w: 'ERIC CANTONA', h: 'Cuello'}, {w: 'GABRIEL BATISTUTA', h: 'Metralleta'}, 
  {w: 'PAVEL NEDVED', h: 'León'}, {w: 'ANDRIY SHEVCHENKO', h: 'Kiev'}, {w: 'FRANCESCO TOTTI', h: 'Gladiador'}, 
  {w: 'ALESSANDRO DEL PIERO', h: 'Pinturicchio'}, {w: 'LUKA MODRIC', h: 'Guerra'}, {w: 'SON HEUNG-MIN', h: 'Corea'}, 
  {w: 'LAUTARO MARTINEZ', h: 'Toro'}, {w: 'JULIAN ALVAREZ', h: 'Arácnido'}, {w: 'JOSHUA KIMMICH', h: 'Polivalente'}, 
  {w: 'DAVID ALABA', h: 'Silla'}, {w: 'BERNARDO SILVA', h: 'Zurda'}, {w: 'BRUNO FERNANDES', h: 'Penalti'}, 
  {w: 'MARCUS RASHFORD', h: 'Activista'}, {w: 'VICTOR OSIMHEN', h: 'Antifaz'}, {w: 'RAFAEL LEAO', h: 'Sonriente'}, 
  {w: 'DECLAN RICE', h: 'Martillo'}, {w: 'RODRYGO GOES', h: 'Rayo'}, {w: 'DAVID DE GEA', h: 'Reflejos'}, 
  {w: 'CECH', h: 'Casco'}, {w: 'PUYOL', h: 'Tarzán'}, {w: 'PEPE', h: 'Agresivo'}, 
  {w: 'ALEXIS SANCHEZ', h: 'Maravilla'}, {w: 'ARTURO VIDAL', h: 'Cresta'}, {w: 'KEYLOR NAVAS', h: 'Fe'}, 
  {w: 'CHICHARITO', h: 'Olfato'}, {w: 'JAMES RODRIGUEZ', h: 'Zurdazo'}
],
    animales: [
  // ORIGINALES MEJORADOS (Más sutiles)
  {w: 'TIBURÓN', h: 'Cartílago'}, {w: 'CAMALEÓN', h: 'Mimetismo'}, {w: 'ÁGUILA', h: 'Rapaz'}, 
  {w: 'ORNITORRINCO', h: 'Anómalo'}, {w: 'ELEFANTE', h: 'Memoria'}, {w: 'JIRAFA', h: 'Acacia'}, 
  {w: 'CANGURO', h: 'Marsupial'}, {w: 'KOALA', h: 'Somnoliento'}, {w: 'LEÓN', h: 'Orgullo'}, 
  {w: 'TIGRE', h: 'Selva'}, {w: 'CEBRA', h: 'Pijama'}, {w: 'PANDA', h: 'Oriente'}, 
  {w: 'GORILA', h: 'Lomo'}, {w: 'CHIMPANCÉ', h: 'Primate'}, {w: 'DELFÍN', h: 'Sonar'}, 
  {w: 'BALLENA', h: 'Plancton'}, {w: 'PINGÜINO', h: 'Antártida'}, {w: 'AVESTRUZ', h: 'Arena'}, 
  {w: 'FLAMENCO', h: 'Zancuda'}, {w: 'HIPOPÓTAMO', h: 'Territorial'}, {w: 'COCODRILO', h: 'Prehistórico'}, 
  {w: 'SERPIENTE', h: 'Reptar'}, {w: 'LOBO', h: 'Aullido'}, {w: 'ZORRO', h: 'Caza'}, 
  {w: 'OSO POLAR', h: 'Ártico'}, {w: 'RINOCERONTE', h: 'Blindado'}, {w: 'GUEPARDO', h: 'Sprint'}, 
  {w: 'PULPO', h: 'Cefalópodo'}, {w: 'MEDUSA', h: 'Urticante'}, {w: 'CABALLITO DE MAR', h: 'Hipocampo'}, 
  {w: 'MURCIÉLAGO', h: 'Radar'}, {w: 'BÚHO', h: 'Sabiduría'}, {w: 'LORO', h: 'Repetir'}, 
  {w: 'TUCÁN', h: 'Trópico'}, {w: 'COLIBRÍ', h: 'Aleteo'}, {w: 'ABEJA', h: 'Polen'}, 
  {w: 'MARIPOSA', h: 'Metamorfosis'}, {w: 'HORMIGA', h: 'Colonia'}, {w: 'ARAÑA', h: 'Tejer'}, 
  {w: 'ESCORPIÓN', h: 'Pinzas'}, {w: 'CAMELLO', h: 'Resistencia'}, {w: 'BURRO', h: 'Carga'}, 
  {w: 'CABALLO', h: 'Equino'}, {w: 'VACA', h: 'Rumiante'}, {w: 'OVEJA', h: 'Rebaño'}, 
  {w: 'CERDO', h: 'Bellota'}, {w: 'GALLINA', h: 'Corral'}, {w: 'GALLO', h: 'Canto'}, 
  {w: 'CONEJO', h: 'Madriguera'}, {w: 'RATA', h: 'Peste'}, {w: 'RATÓN', h: 'Laboratorio'}, 
  {w: 'ARDILLA', h: 'Árbol'}, {w: 'CASTOR', h: 'Arquitecto'}, {w: 'ERIZO', h: 'Bola'}, 
  {w: 'TOPO', h: 'Ciego'}, {w: 'LINCE', h: 'Pinceles'}, {w: 'PANTERA', h: 'Sigilo'}, 
  {w: 'HIENA', h: 'Carroñera'}, {w: 'BUITRE', h: 'Planeador'}, {w: 'CISNE', h: 'Elegancia'}, 
  {w: 'PELÍCANO', h: 'Pesca'}, {w: 'FOCA', h: 'Hielo'}, {w: 'MORSA', h: 'Marfil'}, 
  {w: 'CALAMAR', h: 'Profundidad'}, {w: 'MANATÍ', h: 'Herbívoro'}, {w: 'ALCE', h: 'Canadá'}, 
  {w: 'RENO', h: 'Laponia'}, {w: 'YAK', h: 'Tíbet'}, {w: 'LEMUR', h: 'Madagascar'},

  // 50 NUEVOS AÑADIDOS
  {w: 'TARÁNTULA', h: 'Peluda'}, {w: 'PIRAÑA', h: 'Mordisco'}, {w: 'LLAMA', h: 'Andes'}, 
  {w: 'PAVO REAL', h: 'Abanico'}, {w: 'MANTIS', h: 'Religiosa'}, {w: 'ORCA', h: 'Asesina'}, 
  {w: 'PUERCOESPÍN', h: 'Espinas'}, {w: 'LUCIÉRNAGA', h: 'Fósforo'}, {w: 'ESCARABAJO', h: 'Egipto'}, 
  {w: 'HALCÓN', h: 'Picado'}, {w: 'SALAMANDRA', h: 'Anfibio'}, {w: 'SAPO', h: 'Charca'}, 
  {w: 'GRILLO', h: 'Chirrido'}, {w: 'MAPACHE', h: 'Antifaz'}, {w: 'TEJÓN', h: 'Agresivo'}, 
  {w: 'SURICATA', h: 'Centinela'}, {w: 'ARMADILLO', h: 'Caparazón'}, {w: 'PEREZOSO', h: 'Lento'}, 
  {w: 'HORMIGUERO', h: 'Lengua'}, {w: 'WOMBAT', h: 'Cúbico'}, {w: 'NUTRIA', h: 'Río'}, 
  {w: 'LOBO MARINO', h: 'Aleta'}, {w: 'JABALÍ', h: 'Colmillo'}, {w: 'CIERVO', h: 'Cornamenta'}, 
  {w: 'CIGÜEÑA', h: 'Campanario'}, {w: 'CUERVO', h: 'Negro'}, {w: 'ALBATROS', h: 'Océano'}, 
  {w: 'PEZ GLOBO', h: 'Inflar'}, {w: 'MANTARRAYA', h: 'Gigante'}, {w: 'LANGOSTA', h: 'Pinza'}, 
  {w: 'CANGREJO', h: 'Lateral'}, {w: 'CARACOL', h: 'Baba'}, {w: 'SANGUIJUELA', h: 'Sangre'}, 
  {w: 'PULGA', h: 'Salto'}, {w: 'MOSQUITO', h: 'Sangre'}, {w: 'AVISPA', h: 'Aguijón'}, 
  {w: 'LIBÉLULA', h: 'Vuelo'}, {w: 'TERMITA', h: 'Madera'}, {w: 'POLILLA', h: 'Luz'}, 
  {w: 'GUSANO DE SEDA', h: 'Capullo'}, {w: 'IGUANA', h: 'Escama'}, {w: 'ÑU', h: 'Migración'}, 
  {w: 'GACELA', h: 'Huida'}, {w: 'BÚFALO', h: 'Estampida'}, {w: 'COYOTE', h: 'Desierto'}, 
  {w: 'DINGO', h: 'Australia'}, {w: 'NARVAL', h: 'Unicornio'}, {w: 'OKAPI', h: 'Mitad'}, 
  {w: 'KAKAPO', h: 'Verde'}, {w: 'MULA', h: 'Híbrido'}
],
    palabras_alea: [
  // ORIGINALES MEJORADOS (Pistas más estratégicas)
  {w: 'INTERNET', h: 'Global'}, {w: 'PIRÁMIDE', h: 'Triángulo'}, {w: 'TELÉFONO', h: 'Dígitos'}, 
  {w: 'ASTRONAUTA', h: 'Cosmos'}, {w: 'DICCIONARIO', h: 'Orden'}, {w: 'BICICLETA', h: 'Equilibrio'}, 
  {w: 'GUITARRA', h: 'Traste'}, {w: 'RELOJ', h: 'Tic-tac'}, {w: 'ESPEJO', h: 'Narciso'}, 
  {w: 'CÁMARA', h: 'Enfoque'}, {w: 'MARTILLO', h: 'Inercia'}, {w: 'TELESCOPIO', h: 'Óptica'}, 
  {w: 'BRÚJULA', h: 'Aguja'}, {w: 'AVIÓN', h: 'Turbina'}, {w: 'SUBMARINO', h: 'Sonar'}, 
  {w: 'ZAPATO', h: 'Suela'}, {w: 'PARAGUAS', h: 'Varillas'}, {w: 'LINTERNA', h: 'Haz'}, 
  {w: 'LÁPIZ', h: 'Grafito'}, {w: 'TIJERAS', h: 'Eje'}, {w: 'PUENTE', h: 'Viaducto'}, 
  {w: 'CASTILLO', h: 'Almena'}, {w: 'BIBLIOTECA', h: 'Estante'}, {w: 'HOSPITAL', h: 'Suero'}, 
  {w: 'ESCUELA', h: 'Pupitre'}, {w: 'IGLESIA', h: 'Liturgia'}, {w: 'MUSEO', h: 'Vitrina'}, 
  {w: 'TEATRO', h: 'Telón'}, {w: 'CINE', h: 'Séptimo'}, {w: 'ESTADIO', h: 'Grada'}, 
  {w: 'PARQUE', h: 'Recreo'}, {w: 'PLAYA', h: 'Salitre'}, {w: 'MONTAÑA', h: 'Ladera'}, 
  {w: 'DESIERTO', h: 'Mirage'}, {w: 'VOLCÁN', h: 'Magma'}, {w: 'CASCADA', h: 'Salto'}, 
  {w: 'TERREMOTO', h: 'Seísmo'}, {w: 'TORNADO', h: 'Embudo'}, {w: 'TORMENTA', h: 'Borrasca'}, 
  {w: 'NIEVE', h: 'Manto'}, {w: 'ARCOÍRIS', h: 'Prisma'}, {w: 'FUEGO', h: 'Combustión'}, 
  {w: 'HIELO', h: 'Glaciar'}, {w: 'DINERO', h: 'Liquidez'}, {w: 'TRABAJO', h: 'Oficio'}, 
  {w: 'VIAJE', h: 'Destino'}, {w: 'SUEÑO', h: 'Onírico'}, {w: 'MÚSICA', h: 'Pentagrama'}, 
  {w: 'BAILE', h: 'Coreografía'}, {w: 'DEPORTE', h: 'Esfuerzo'}, {w: 'AMISTAD', h: 'Vínculo'}, 
  {w: 'FAMILIA', h: 'Linaje'}, {w: 'AMOR', h: 'Afecto'}, {w: 'TIEMPO', h: 'Relativo'}, 
  {w: 'LIBERTAD', h: 'Alas'}, {w: 'JUSTICIA', h: 'Balanza'}, {w: 'GUERRA', h: 'Trinchera'}, 
  {w: 'PAZ', h: 'Tregua'}, {w: 'VIDA', h: 'Existencia'}, {w: 'MUERTE', h: 'Inerte'}, 
  {w: 'CIENCIA', h: 'Empírico'}, {w: 'HISTORIA', h: 'Crónica'}, {w: 'POLÍTICA', h: 'Discurso'}, 
  {w: 'RELIGIÓN', h: 'Sagrado'}, {w: 'MAGIA', h: 'Ilusión'}, {w: 'SUERTE', h: 'Azar'}, 
  {w: 'PELIGRO', h: 'Riesgo'}, {w: 'ÉXITO', h: 'Triunfo'}, {w: 'ERROR', h: 'Humano'}, 
  {w: 'MISTERIO', h: 'Enigma'},
  {w: 'REVOLUCIÓN', h: 'Cambio'}, {w: 'CRIPTOMONEDA', h: 'Cadena'}, {w: 'CAFÉ', h: 'Grano'}, 
  {w: 'EXAMEN', h: 'Nervios'}, {w: 'VACACIONES', h: 'Relax'}, {w: 'ROBOT', h: 'Chip'}, 
  {w: 'INFANCIA', h: 'Recuerdo'}, {w: 'CIRCO', h: 'Carpa'}, {w: 'LABORATORIO', h: 'Probeta'}, 
  {w: 'AJEDREZ', h: 'Jaque'}, {w: 'KARATE', h: 'Cinturón'}, {w: 'JARDÍN', h: 'Abono'}, 
  {w: 'FERROCARRIL', h: 'Raíl'}, {w: 'GASOLINA', h: 'Octanaje'}, {w: 'DIAMANTE', h: 'Dureza'}, 
  {w: 'ORO', h: 'Quilates'}, {w: 'MADERA', h: 'Veta'}, {w: 'CEREBRO', h: 'Sinapsis'}, 
  {w: 'CORAZÓN', h: 'Latido'}, {w: 'PULMÓN', h: 'Oxígeno'}, {w: 'ESTÓMAGO', h: 'Ácido'}, 
  {w: 'HUESO', h: 'Calcio'}, {w: 'PIEL', h: 'Poro'}, {w: 'SANGRE', h: 'Plasma'}, 
  {w: 'VENENO', h: 'Antídoto'}, {w: 'CÁRCEL', h: 'Celda'}, {w: 'BANCO', h: 'Interés'}, 
  {w: 'AEROPUERTO', h: 'Escala'}, {w: 'CEMENTERIO', h: 'Lápida'}, {w: 'COLEGIO', h: 'Recreo'}, 
  {w: 'SUPERMERCADO', h: 'Carrito'}, {w: 'PANADERÍA', h: 'Levadura'}, {w: 'FARMACIA', h: 'Receta'}, 
  {w: 'DISCOTECA', h: 'Neon'}, {w: 'GIMNASIO', h: 'Pesas'}, {w: 'HOTEL', h: 'Recepción'}, 
  {w: 'ISLA', h: 'Náufrago'}, {w: 'SELVA', h: 'Humedad'}, {w: 'BOSQUE', h: 'Musgo'}, 
  {w: 'CIUDAD', h: 'Asfalto'}, {w: 'PUEBLO', h: 'Plaza'}, {w: 'ESPACIO', h: 'Vacío'}, 
  {w: 'GALAXIA', h: 'Espiral'}, {w: 'SATÉLITE', h: 'Órbita'}, {w: 'PLANETA', h: 'Esfera'}, 
  {w: 'SOL', h: 'Helios'}, {w: 'LUNA', h: 'Creciente'}, {w: 'ESTRELLA', h: 'Centello'}, 
  {w: 'COMETA', h: 'Estela'}, {w: 'UNIVERSO', h: 'Infinito'}
],
    series_peliculas: [
  // ORIGINALES MEJORADOS (Pistas una sola palabra)
  {w: 'TITANIC', h: 'Iceberg'}, {w: 'STAR WARS', h: 'Linaje'}, {w: 'LA CASA DE PAPEL', h: 'Dalí'}, 
  {w: 'BREAKING BAD', h: 'Pureza'}, {w: 'STRANGER THINGS', h: 'Revés'}, {w: 'JUEGO DE TRONOS', h: 'Invierno'}, 
  {w: 'HARRY POTTER', h: 'Cicatriz'}, {w: 'EL SEÑOR DE LOS ANILLOS', h: 'Precioso'}, {w: 'AVENGERS', h: 'Chasquido'}, 
  {w: 'JURASSIC PARK', h: 'Ámbar'}, {w: 'THE WALKING DEAD', h: 'Supervivencia'}, {w: 'LOS SIMPSON', h: 'Donas'}, 
  {w: 'FRIENDS', h: 'Fuente'}, {w: 'EL PADRINO', h: 'Respeto'}, {w: 'BATMAN', h: 'Huérfano'}, 
  {w: 'SPIDERMAN', h: 'Responsabilidad'}, {w: 'EL REY LEÓN', h: 'Ciclo'}, {w: 'TOY STORY', h: 'Mudanza'}, 
  {w: 'SHREK', h: 'Cebolla'}, {w: 'EL CABALLERO OSCURO', h: 'Moneda'}, {w: 'INCEPTION', h: 'Tótem'}, 
  {w: 'PULP FICTION', h: 'Inyección'}, {w: 'MATRIX', h: 'Simulación'}, {w: 'GLADIATOR', h: 'Trigo'}, 
  {w: 'BRAVEHEART', h: 'Pintura'}, {w: 'FORREST GUMP', h: 'Banco'}, {w: 'EL SHOW DE TRUMAN', h: 'Domo'}, 
  {w: 'PARÁSITOS', h: 'Olor'}, {w: 'EL JUEGO DEL CALAMAR', h: 'Deuda'}, {w: 'ELITE', h: 'Uniforme'}, 
  {w: 'NARCOS', h: 'Patrón'}, {w: 'PEAKY BLINDERS', h: 'Cuchillas'}, {w: 'THE CROWN', h: 'Palacio'}, 
  {w: 'DARK', h: 'Cueva'}, {w: 'LOST', h: 'Números'}, {w: 'PRISON BREAK', h: 'Tatuaje'}, 
  {w: 'GREY S ANATOMY', h: 'Ascensor'}, {w: 'BLACK MIRROR', h: 'Distopía'}, {w: 'COBRA KAI', h: 'Dojo'}, 
  {w: 'THE MANDALORIAN', h: 'Credo'}, {w: 'THE BOYS', h: 'Compuesto'}, {w: 'TED LASSO', h: 'Creer'}, 
  {w: 'SUCCESSION', h: 'Herencia'}, {w: 'THE BEAR', h: 'Chef'}, {w: 'EUPHORIA', h: 'Purpurina'}, 
  {w: 'SEX EDUCATION', h: 'Terapia'}, {w: 'SQUID GAME', h: 'Infancia'}, {w: 'BRIDGERTON', h: 'Cotilleo'}, 
  {w: 'THE WITCHER', h: 'Brujo'}, {w: 'YOU', h: 'Jaula'}, {w: 'THE LAST OF US', h: 'Cordyceps'}, 
  {w: 'FALLOUT', h: 'Átomo'}, {w: 'THE OFFICE', h: 'Taza'}, {w: 'SEINFELD', h: 'Nada'}, 
  {w: 'HOW I MET YOUR MOTHER', h: 'Trompa'}, {w: 'THE BIG BANG THEORY', h: 'Cooper'}, 
  {w: 'MODERN FAMILY', h: 'Armario'}, {w: 'BROOKLYN NINE NINE', h: 'Comisaría'}, 
  {w: 'MALCOLM IN THE MIDDLE', h: 'Genio'}, {w: 'DR HOUSE', h: 'Lupus'}, 
  {w: 'SHERLOCK', h: 'Deducción'}, {w: 'SUPERNATURAL', h: 'Sal'}, {w: 'VIKINGOS', h: 'Valhalla'}, 
  {w: 'CHERNOBYL', h: 'Radiación'}, {w: 'AVATAR', h: 'Trenza'}, {w: 'MAD MAX', h: 'V8'}, 
  {w: 'INTERSTELLAR', h: 'Agujero'}, {w: 'DJANGO', h: 'Recompensa'}, {w: 'SCREAM', h: 'Llamada'}, 
  {w: 'IT', h: 'Alcantarilla'},
  {w: 'JOHN WICK', h: 'Perro'}, {w: 'FIGHT CLUB', h: 'Jabón'}, {w: 'SAW', h: 'Triciclo'}, 
  {w: 'THE SHINING', h: 'Hacha'}, {w: 'JOKER', h: 'Maquillaje'}, {w: 'SCARFACE', h: 'Cicatriz'}, 
  {w: 'BACK TO THE FUTURE', h: 'Rayo'}, {w: 'INDIANA JONES', h: 'Látigo'}, {w: 'KILL BILL', h: 'Katana'}, 
  {w: 'SEXTO SENTIDO', h: 'Niño'}, {w: 'PSYCHO', h: 'Ducha'}, {w: 'AMERICAN PSYCHO', h: 'Tarjeta'}, 
  {w: 'THE WOLF OF WALL STREET', h: 'Yate'}, {w: 'BETTER CALL SAUL', h: 'Abogado'}, {w: 'THE HANDMAID\'S TALE', h: 'Cofia'}, 
  {w: 'TWIN PEAKS', h: 'Café'}, {w: 'THE SOPRANOS', h: 'Terapia'}, {w: 'THE WIRE', h: 'Escucha'}, 
  {w: 'MAD MEN', h: 'Whisky'}, {w: 'FUTURAMA', h: 'Criogenia'}, {w: 'DRAGON BALL', h: 'Esferas'}, 
  {w: 'POKÉMON', h: 'Evolución'}, {w: 'ONE PIECE', h: 'Tesoro'}, {w: 'EVANGELION', h: 'Ángel'}, 
  {w: 'GOSSIP GIRL', h: 'Élite'}, {w: 'DOWNTON ABBEY', h: 'Servicio'}, {w: 'BLADE RUNNER', h: 'Replicante'}, 
  {w: 'DUNE', h: 'Especia'}, {w: 'TOP GUN', h: 'Piloto'}, {w: 'MISSION IMPOSSIBLE', h: 'Máscara'}, 
  {w: 'JAMES BOND', h: 'Martini'}, {w: 'ROCKY', h: 'Escaleras'}, {w: 'TERMINATOR', h: 'Futuro'}, 
  {w: 'ALIEN', h: 'Pasajero'}, {w: 'PREDATOR', h: 'Selva'}, {w: 'HOME ALONE', h: 'Trampa'}, 
  {w: 'THE MASK', h: 'Verde'}, {w: 'COCO', h: 'Guitarra'}, {w: 'UP', h: 'Globos'}, 
  {w: 'RATATOUILLE', h: 'Rata'}, {w: 'CARS', h: 'Rayo'}, {w: 'FINDING NEMO', h: 'Pecera'}, 
  {w: 'IRON MAN', h: 'Reactor'}, {w: 'DEADPOOL', h: 'Regeneración'}, {w: 'THE UMBRELLA ACADEMY', h: 'Familia'}, 
  {w: 'WEDNESDAY', h: 'Trenzas'}, {w: 'THE QUEEN\'S GAMBIT', h: 'Tablero'}, {w: 'SONS OF ANARCHY', h: 'Moto'}, 
  {w: 'MR. ROBOT', h: 'Hacker'}, {w: 'LA NARANJA MECÁNICA', h: 'Ojo'}
],
    comida: [
  // ORIGINALES MEJORADOS (Pistas una sola palabra)
  {w: 'PIZZA', h: 'Porción'}, {w: 'SUSHI', h: 'Alga'}, {w: 'HAMBURGUESA', h: 'Sésamo'}, 
  {w: 'PAELLA', h: 'Azafrán'}, {w: 'TACOS', h: 'Maíz'}, {w: 'PASTA', h: 'Al-dente'}, 
  {w: 'LASAÑA', h: 'Gratén'}, {w: 'ENSALADA', h: 'Aliño'}, {w: 'SOPA', h: 'Caldo'}, 
  {w: 'FILETE', h: 'Plancha'}, {w: 'POLLO ASADO', h: 'Rostizado'}, {w: 'PESCADO', h: 'Escamas'}, 
  {w: 'ARROZ', h: 'Cereal'}, {w: 'LENTEJAS', h: 'Legumbre'}, {w: 'GARBANZOS', h: 'Remojo'}, 
  {w: 'HUEVOS', h: 'Yema'}, {w: 'PATATAS FRITAS', h: 'Tubérculo'}, {w: 'TORTILLA', h: 'Vuelta'}, 
  {w: 'CROQUETAS', h: 'Rebozado'}, {w: 'JAMÓN', h: 'Ibérico'}, {w: 'QUESO', h: 'Fermento'}, 
  {w: 'PAN', h: 'Levadura'}, {w: 'MANZANA', h: 'Newton'}, {w: 'PLÁTANO', h: 'Potasio'}, 
  {w: 'NARANJA', h: 'Cítrico'}, {w: 'FRESA', h: 'Aquenio'}, {w: 'UVA', h: 'Vid'}, 
  {w: 'SANDÍA', h: 'Corteza'}, {w: 'PIÑA', h: 'Tropical'}, {w: 'CHOCOLATE', h: 'Tableta'}, 
  {w: 'HELADO', h: 'Cucurucho'}, {w: 'TARTA', h: 'Repostería'}, {w: 'GALLETAS', h: 'Horneado'}, 
  {w: 'CAFÉ', h: 'Cafeína'}, {w: 'TÉ', h: 'Infusión'}, {w: 'CERVEZA', h: 'Lúpulo'}, 
  {w: 'VINO', h: 'Cosecha'}, {w: 'REFRESCO', h: 'Burbuja'}, {w: 'AGUA', h: 'Hidratación'}, 
  {w: 'LECHE', h: 'Lactosa'}, {w: 'YOGUR', h: 'Bífidus'}, {w: 'MANTEQUILLA', h: 'Lípido'}, 
  {w: 'ACEITE', h: 'Almazara'}, {w: 'SAL', h: 'Sodio'}, {w: 'AZÚCAR', h: 'Glucosa'}, 
  {w: 'PIMIENTA', h: 'Especia'}, {w: 'CEBOLLA', h: 'Capas'}, {w: 'AJO', h: 'Bulbo'}, 
  {w: 'TOMATE', h: 'Licopeno'}, {w: 'LECHUGA', h: 'Hortaliza'}, {w: 'ZANAHORIA', h: 'Betacaroteno'}, 
  {w: 'PEPINO', h: 'Encurtido'}, {w: 'CALABACÍN', h: 'Alargado'}, {w: 'BERENJENA', h: 'Rellena'}, 
  {w: 'PIMIENTO', h: 'Huerta'}, {w: 'CHAMPIÑÓN', h: 'Espora'}, {w: 'GAMBAS', h: 'Crustáceo'}, 
  {w: 'CALAMARES', h: 'Cefalópodo'}, {w: 'PULPO', h: 'Ventosa'}, {w: 'MEJILLONES', h: 'Molusco'}, 
  {w: 'BACON', h: 'Ahumado'}, {w: 'SALCHICHA', h: 'Embutido'}, {w: 'CHURROS', h: 'Masa'}, 
  {w: 'DONUTS', h: 'Glaseado'}, {w: 'CROISSANT', h: 'Hojaldre'}, {w: 'FLAN', h: 'Baño-maría'}, 
  {w: 'NATILLAS', h: 'Vainilla'}, {w: 'GUACAMOLE', h: 'Untable'}, {w: 'HUMMUS', h: 'Puré'}, 
  {w: 'RAMEN', h: 'Fideos'},
  {w: 'BURRITO', h: 'Enrollado'}, {w: 'NACHOS', h: 'Totopo'}, {w: 'CEVICHE', h: 'Lima'}, 
  {w: 'FALAFEL', h: 'Árabe'}, {w: 'KIMCHI', h: 'Coreano'}, {w: 'GAZPACHO', h: 'Frío'}, 
  {w: 'SALMOREJO', h: 'Espeso'}, {w: 'SASHIMI', h: 'Corte'}, {w: 'RISOTTO', h: 'Cremoso'}, 
  {w: 'GNOCCHI', h: 'Patata'}, {w: 'TIRAMISÚ', h: 'Mascarpone'}, {w: 'BROWNIE', h: 'Nuez'}, 
  {w: 'CHEESECAKE', h: 'Queso'}, {w: 'KEBAB', h: 'Torno'}, {w: 'QUICHE', h: 'Francia'}, 
  {w: 'CURRY', h: 'India'}, {w: 'RATATOUILLE', h: 'Verdura'}, {w: 'POKE', h: 'Bol'}, 
  {w: 'DIM SUM', h: 'Vapor'}, {w: 'TEMPURA', h: 'Fritura'}, {w: 'FONDUE', h: 'Pinchado'}, 
  {w: 'ROQUEFORT', h: 'Moho'}, {w: 'TRUFA', h: 'Hongo'}, {w: 'FOIE', h: 'Hígado'}, 
  {w: 'ENSALADILLA', h: 'Mayonesa'}, {w: 'TORTITAS', h: 'Jarabe'}, {w: 'GOFRE', h: 'Cuadrícula'}, 
  {w: 'MOCHI', h: 'Pegajoso'}, {w: 'POPCORN', h: 'Explosión'}, {w: 'PISTACHO', h: 'Cáscara'}, 
  {w: 'NUECES', h: 'Cerebro'}, {w: 'ALMENDRAS', h: 'Fruto'}, {w: 'CEREZA', h: 'Rabo'}, 
  {w: 'LIMÓN', h: 'Ácido'}, {w: 'MANGO', h: 'Exótico'}, {w: 'AGUACATE', h: 'Hueso'}, 
  {w: 'COCO', h: 'Palmera'}, {w: 'KIWI', h: 'Pelo'}, {w: 'MELOCOTÓN', h: 'Terciopelo'}, 
  {w: 'PERA', h: 'Agua'}, {w: 'MELÓN', h: 'Verano'}, {w: 'POLLO', h: 'Ave'}, 
  {w: 'CORDERO', h: 'Lechal'}, {w: 'COSTILLAS', h: 'Barbacoa'}, {w: 'ALBÓNDIGAS', h: 'Bola'}, 
  {w: 'CANELONES', h: 'Tubo'}, {w: 'EMPANADA', h: 'Relleno'}, {w: 'SÁNDWICH', h: 'Mixto'}, 
  {w: 'MOZZARELLA', h: 'Búfala'}, {w: 'PUDING', h: 'Textura'}
],
   objetos: [
  // ORIGINALES CON PISTAS DIVERTIDAS/SUTILES
  {w: 'MARTILLO', h: 'Golpe'}, {w: 'TIJERAS', h: 'Sastre'}, {w: 'LÁPIZ', h: 'Mina'}, 
  {w: 'RELOJ', h: 'Pulso'}, {w: 'ESPEJO', h: 'Vanidad'}, {w: 'CÁMARA', h: 'Flash'}, 
  {w: 'LINTERNA', h: 'Apagón'}, {w: 'PARAGUAS', h: 'Seco'}, {w: 'ZAPATO', h: 'Pasos'}, 
  {w: 'GAFAS', h: 'Montura'}, {w: 'BOLÍGRAFO', h: 'Firma'}, {w: 'CUADERNO', h: 'Apuntes'}, 
  {w: 'LLAVE', h: 'Giro'}, {w: 'CANDADO', h: 'Cierre'}, {w: 'CARTERA', h: 'Bolsillo'}, 
  {w: 'MOCHILA', h: 'Peso'}, {w: 'TELÉFONO', h: 'Vibrar'}, {w: 'AURICULARES', h: 'Ruido'}, 
  {w: 'PEINE', h: 'Enredo'}, {w: 'CEPILLO', h: 'Pasta'}, {w: 'TOALLA', h: 'Húmedo'}, 
  {w: 'JABÓN', h: 'Resbala'}, {w: 'PLATO', h: 'Cena'}, {w: 'VASO', h: 'Sed'}, 
  {w: 'TENEDOR', h: 'Pinchazo'}, {w: 'CUCHILLO', h: 'Filo'}, {w: 'CUCHARA', h: 'Caldo'}, 
  {w: 'SARTÉN', h: 'Mango'}, {w: 'OLLA', h: 'Presión'}, {w: 'PLANCHA', h: 'Vapor'}, 
  {w: 'ASPIRADORA', h: 'Succión'}, {w: 'ESCOBA', h: 'Volar'}, {w: 'CUBO', h: 'Pozo'}, 
  {w: 'PERCHA', h: 'Colgar'}, {w: 'ALMOHADA', h: 'Blando'}, {w: 'SÁBANA', h: 'Fantasma'}, 
  {w: 'MANTA', h: 'Sofá'}, {w: 'CORTINA', h: 'Teatro'}, {w: 'ALFOMBRA', h: 'Aladino'}, 
  {w: 'CUADRO', h: 'Marco'}, {w: 'LÁMPARA', h: 'Genio'}, {w: 'SILLA', h: 'Respaldo'}, 
  {w: 'MESA', h: 'Pata'}, {w: 'SOFÁ', h: 'Siesta'}, {w: 'TELEVISIÓN', h: 'Canal'}, 
  {w: 'ORDENADOR', h: 'Pantalla'}, {w: 'RATÓN', h: 'Click'}, {w: 'IMPRESORA', h: 'Copia'}, 
  {w: 'CALCULADORA', h: 'Cuentas'}, {w: 'MANDO', h: 'Distancia'}, {w: 'PILAS', h: 'Energía'}, 
  {w: 'BATERÍA', h: 'Porcentaje'}, {w: 'ENCHUFE', h: 'Corriente'}, {w: 'CABLE', h: 'Enredo'}, 
  {w: 'MALETA', h: 'Vacaciones'}, {w: 'BOLSA', h: 'Plástico'}, {w: 'BOTELLA', h: 'Mensaje'}, 
  {w: 'LATA', h: 'Conservas'}, {w: 'CAJA', h: 'Sorpresa'}, {w: 'PAPEL', h: 'Reciclar'}, 
  {w: 'SOBRE', h: 'Carta'}, {w: 'SELLO', h: 'Lamer'}, {w: 'MONEDA', h: 'Cara'}, 
  {w: 'BILLETE', h: 'Cajero'}, {w: 'TARJETA', h: 'PIN'}, {w: 'PASAPORTE', h: 'Sello'}, 
  {w: 'RELOJ DE ARENA', h: 'Desierto'}, {w: 'BRÚJULA', h: 'Perdido'}, {w: 'TELESCOPIO', h: 'Cielo'}, 
  {w: 'MICROSCOPIO', h: 'Invisible'},
  {w: 'DADO', h: 'Azar'}, {w: 'BARAJA', h: 'Truco'}, {w: 'SILBATO', h: 'Árbitro'}, 
  {w: 'BOMBA', h: 'Mecha'}, {w: 'ESCUDO', h: 'Defensa'}, {w: 'CASCO', h: 'Seguridad'}, 
  {w: 'CINTURÓN', h: 'Hebilla'}, {w: 'BOTÓN', h: 'Ojal'}, {w: 'AGUJA', h: 'Pinchazo'}, 
  {w: 'DEDAL', h: 'Costura'}, {w: 'ANILLO', h: 'Dedo'}, {w: 'COLLAR', h: 'Cuello'}, 
  {w: 'PENDIENTES', h: 'Oreja'}, {w: 'PULSERA', h: 'Muñeca'}, {w: 'ABANICO', h: 'Aire'}, 
  {w: 'MASCARILLA', h: 'Protección'}, {w: 'GUANTES', h: 'Frío'}, {w: 'BUFANDA', h: 'Nudo'}, 
  {w: 'SOMBRERO', h: 'Cabeza'}, {w: 'CORBATA', h: 'Elegante'}, {w: 'LUPA', h: 'Detalle'}, 
  {w: 'MAPA', h: 'Tesoro'}, {w: 'EXTINTOR', h: 'Humo'}, {w: 'MANGUERA', h: 'Jardín'}, 
  {w: 'TIJERAS', h: 'Filo'}, {w: 'PALA', h: 'Enterrar'}, {w: 'ESCALERA', h: 'Altura'}, 
  {w: 'TALADRO', h: 'Ruido'}, {w: 'CINTA MÉTRICA', h: 'Distancia'}, {w: 'PEGAMENTO', h: 'Unir'}, 
  {w: 'GRAPADORA', h: 'Papeles'}, {w: 'CHINCHETA', h: 'Pared'}, {w: 'CLIP', h: 'Juntar'}, 
  {w: 'LIMA', h: 'Uñas'}, {w: 'PINZAS', h: 'Sujetar'}, {w: 'PERIÓDICO', h: 'Noticia'}, 
  {w: 'REVISTA', h: 'Portada'}, {w: 'DICCIONARIO', h: 'Definición'}, {w: 'AGENDA', h: 'Citas'}, 
  {w: 'MALETÍN', h: 'Negocios'}, {w: 'BARRIL', h: 'Pirata'}, {w: 'ANCLA', h: 'Barco'}, 
  {w: 'REMO', h: 'Bote'}, {w: 'VELA', h: 'Cera'}, {w: 'FÓSFORO', h: 'Fuego'}, 
  {w: 'MECHERO', h: 'Gas'}, {w: 'INCENSO', h: 'Olor'}, {w: 'FLORERO', h: 'Agua'}, 
  {w: 'ESTATUA', h: 'Piedra'}, {w: 'MONEDERO', h: 'Cambio'}
],
  marcas: [
  // ORIGINALES MEJORADOS (Pistas con más "chispa")
  {w: 'APPLE', h: 'Estatus'}, {w: 'SAMSUNG', h: 'Coreano'}, {w: 'GOOGLE', h: 'Respuesta'}, 
  {w: 'MICROSOFT', h: 'Oficina'}, {w: 'AMAZON', h: 'Paquete'}, {w: 'SONY', h: 'Mando'}, 
  {w: 'NINTENDO', h: 'Fontanero'}, {w: 'TESLA', h: 'Voltio'}, {w: 'FERRARI', h: 'Circuito'}, 
  {w: 'TOYOTA', h: 'Híbrido'}, {w: 'FORD', h: 'Cadena'}, {w: 'BMW', h: 'Conducir'}, 
  {w: 'AUDI', h: 'Aros'}, {w: 'MERCEDES', h: 'Chofer'}, {w: 'VOLKSWAGEN', h: 'Escarabajo'}, 
  {w: 'NIKE', h: 'Victoria'}, {w: 'ADIDAS', h: 'Trifolio'}, {w: 'PUMA', h: 'Zarpa'}, 
  {w: 'REEBOK', h: 'Gimnasio'}, {w: 'ZARA', h: 'Percha'}, {w: 'GUCCI', h: 'Pasarela'}, 
  {w: 'LOUIS VUITTON', h: 'Monograma'}, {w: 'ROLEX', h: 'Herencia'}, {w: 'COCA COLA', h: 'Navidad'}, 
  {w: 'PEPSI', h: 'Generación'}, {w: 'STARBUCKS', h: 'Nombre'}, {w: 'MCDONALDS', h: 'Payaso'}, 
  {w: 'BURGER KING', h: 'Parrilla'}, {w: 'NESTLÉ', h: 'Nido'}, {w: 'DANONE', h: 'Cuchara'}, 
  {w: 'KELLOGGS', h: 'Cereal'}, {w: 'DISNEY', h: 'Castillo'}, {w: 'NETFLIX', h: 'Maratón'}, 
  {w: 'YOUTUBE', h: 'Directo'}, {w: 'FACEBOOK', h: 'Muro'}, {w: 'INSTAGRAM', h: 'Filtro'}, 
  {w: 'TWITTER', h: 'Hilo'}, {w: 'TIKTOK', h: 'Scroll'}, {w: 'WHATSAPP', h: 'Audio'}, 
  {w: 'VISA', h: 'Crédito'}, {w: 'MASTERCARD', h: 'Incalculable'}, {w: 'IKEA', h: 'Laberinto'}, 
  {w: 'LEROY MERLIN', h: 'Brico'}, {w: 'DECATHLON', h: 'Azul'}, {w: 'H&M', h: 'Básico'}, 
  {w: 'PRADA', h: 'Diablo'}, {w: 'CHANEL', h: 'Número'}, {w: 'LEGO', h: 'Ladrillo'}, 
  {w: 'BARBIE', h: 'Plástico'}, {w: 'HOT WHEELS', h: 'Pista'}, {w: 'REDBULL', h: 'Volar'}, 
  {w: 'MONSTER', h: 'Energía'}, {w: 'HEINEKEN', h: 'Verde'}, {w: 'CORONA', h: 'Playa'}, 
  {w: 'NESPRESSO', h: 'What else?'}, {w: 'OREO', h: 'Giro'}, {w: 'KINDER', h: 'Sorpresa'}, 
  {w: 'NUTELLA', h: 'Untar'}, {w: 'PAMPERS', h: 'Pañal'}, {w: 'COLGATE', h: 'Sonrisa'}, 
  {w: 'GILLETTE', h: 'Apurado'}, {w: 'DOVE', h: 'Suave'}, {w: 'PANTENE', h: 'Brillo'}, 
  {w: 'L OREAL', h: 'Mereces'}, {w: 'NIVEA', h: 'Lata'}, {w: 'CANON', h: 'Enfoque'}, 
  {w: 'NIKON', h: 'Disparo'}, {w: 'HP', h: 'Imprimir'}, {w: 'DELL', h: 'Teclado'}, 
  {w: 'SHELL', h: 'Gasolinera'},
  {w: 'LAMBORGHINI', h: 'Toro'}, {w: 'PORSCHE', h: 'Stuttgart'}, {w: 'JEEP', h: 'Barro'}, 
  {w: 'VOLVO', h: 'Seguridad'}, {w: 'HARLEY DAVIDSON', h: 'Cuero'}, {w: 'LEVIS', h: 'Vaquero'}, 
  {w: 'LACOSTE', h: 'Lagarto'}, {w: 'CALVIN KLEIN', h: 'Ropa interior'}, {w: 'SUPREME', h: 'Logo'}, 
  {w: 'CONVERSE', h: 'Estrella'}, {w: 'VANS', h: 'Skaters'}, {w: 'ROLEX', h: 'Precisión'}, 
  {w: 'CASIO', h: 'Calculadora'}, {w: 'SWATCH', h: 'Color'}, {w: 'SPOTIFY', h: 'Playlist'}, 
  {w: 'AIRBNB', h: 'Anfitrión'}, {w: 'UBER', h: 'Trayecto'}, {w: 'PLAYSTATION', h: 'DualShock'}, 
  {w: 'XBOX', h: 'Verde'}, {w: 'MARVEL', h: 'Héroes'}, {w: 'NINTENDO', h: 'Switch'}, 
  {w: 'SEGA', h: 'Erizo'}, {w: 'XIAOMI', h: 'Chino'}, {w: 'HUAWEI', h: 'Antena'}, 
  {w: 'PAMPERS', h: 'Bebé'}, {w: 'DUREX', h: 'Látex'}, {w: 'KLEENEX', h: 'Moco'}, 
  {w: 'POST-IT', h: 'Nota'}, {w: 'BIC', h: 'Capuchón'}, {w: 'STABILO', h: 'Subrayar'}, 
  {w: 'NESCAFÉ', h: 'Despertar'}, {w: 'RED BULL', h: 'Toro'}, {w: 'GATORADE', h: 'Sudor'}, 
  {w: 'KELLOGGS', h: 'Tigre'}, {w: 'PRINGLES', h: 'Tubo'}, {w: 'KIT KAT', h: 'Respiro'}, 
  {w: 'MAGNUM', h: 'Palo'}, {w: 'MILKA', h: 'Vaca'}, {w: 'FERRERO ROCHER', h: 'Embajador'}, 
  {w: 'HEINZ', h: 'Ketchup'}, {w: 'TABASCO', h: 'Picante'}, {w: 'JACK DANIELS', h: 'Tennessee'}, 
  {w: 'BACARDI', h: 'Murciélago'}, {w: 'ABSOLUT', h: 'Botella'}, {w: 'MOËT & CHANDON', h: 'Burbujas'}, 
  {w: 'RAY-BAN', h: 'Aviador'}, {w: 'SWAROVSKI', h: 'Cristal'}, {w: 'TIFFANY', h: 'Azul'}, 
  {w: 'DIOR', h: 'Lujo'}, {w: 'HERMÈS', h: 'Naranja'}
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

  // --- LÓGICA DEL POP-UP JUGADOR INICIAL ---
  if (G.alive.length > 0) {
    const randomIndex = Math.floor(Math.random() * G.alive.length);
    const starterName = G.alive[randomIndex];
    
    const popup = document.getElementById('starter-popup');
    const nameEl = document.getElementById('starter-name-popup');
    
    // Configurar y mostrar pop-up
    nameEl.textContent = starterName.toUpperCase();
    popup.style.display = 'flex';
    popup.classList.remove('fade-out-starter');

    // Programar desaparición a los 5 segundos
    setTimeout(() => {
      popup.classList.add('fade-out-starter');
      setTimeout(() => {
        popup.style.display = 'none';
      }, 800); // Espera a que termine la animación de fadeOut
    }, 5000);
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