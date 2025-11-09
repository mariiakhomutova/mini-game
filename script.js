// Мини-игра: собери камеру Revere Cine Zoom Eye Matic 8mm (Model 114)

const PARTS = [
  {
    id: 'body',
    title: 'Корпус',
    svg: () => svgBody()
  },
  {
    id: 'lens',
    title: 'Объектив',
    svg: () => svgLens()
  },
  {
    id: 'viewfinder',
    title: 'Видоискатель',
    svg: () => svgViewfinder()
  },
  {
    id: 'zoomRing',
    title: 'Кольцо зума',
    svg: () => svgZoomRing()
  },
  {
    id: 'grip',
    title: 'Рукоять',
    svg: () => svgGrip()
  },
  {
    id: 'trigger',
    title: 'Спуск',
    svg: () => svgTrigger()
  }
];

const board = document.getElementById('board');
const tray = document.getElementById('tray');
const hintBtn = document.getElementById('hintBtn');
const win = document.getElementById('win');
const playAgain = document.getElementById('playAgain');

let placedCount = 0;
const Z_INDEX_BY_PART = { body: 1, zoomRing: 3, grip: 4, trigger: 6, viewfinder: 7, lens: 8 };

function init() {
  // На всякий случай скрываем оверлей выигрыша при старте
  win.hidden = true;
  tray.innerHTML = '';
  document.querySelectorAll('.slot').forEach(s => s.classList.remove('filled'));
  placedCount = 0;

  // Создаём элементы-плитки
  PARTS.forEach(part => {
    const el = document.createElement('div');
    el.className = 'piece';
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', `Деталь: ${part.title}`);
    el.dataset.part = part.id;
    el.innerHTML = `${part.svg()}<span class="label">${part.title}</span>`;
    tray.appendChild(el);
    makeDraggable(el);
  });
}

function makeDraggable(el) {
  let startX = 0, startY = 0, originX = 0, originY = 0;
  let dragging = false;

  const onDown = (e) => {
    if (el.classList.contains('placed')) return;
    dragging = true;
    el.classList.add('inAir');
    const p = getPoint(e);
    const r = el.getBoundingClientRect();
    startX = p.x; startY = p.y; originX = r.left; originY = r.top;
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp, { once: true });
  };

  const onMove = (e) => {
    if (!dragging) return;
    const p = getPoint(e);
    const dx = p.x - startX; const dy = p.y - startY;
    el.style.position = 'fixed';
    el.style.left = `${originX + dx}px`;
    el.style.top = `${originY + dy}px`;
    highlightTarget(el);
  };

  const onUp = () => {
    document.removeEventListener('pointermove', onMove);
    const slot = getMatchingSlot(el);
    if (slot) {
      snapToSlot(el, slot);
      el.classList.remove('inAir');
      el.classList.add('placed');
      slot.classList.add('filled');
      clearTargetHighlights();
      placedCount += 1;
      if (placedCount === PARTS.length) showWin();
    } else {
      // Вернуть на место
      el.style.position = '';
      el.style.left = '';
      el.style.top = '';
      el.classList.remove('inAir');
      clearTargetHighlights();
    }
    dragging = false;
  };

  el.addEventListener('pointerdown', onDown);
}

function highlightTarget(el) {
  clearTargetHighlights();
  const slot = closestSlotCenter(el, 80);
  if (slot) slot.classList.add('targeted');
}

function clearTargetHighlights() {
  document.querySelectorAll('.slot.targeted').forEach(s => s.classList.remove('targeted'));
}

function getMatchingSlot(el) {
  const near = closestSlotCenter(el, 80);
  if (!near) return null;
  return near.dataset.slot === el.dataset.part ? near : null;
}

function closestSlotCenter(el, maxDist) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;
  const slots = [...document.querySelectorAll('.slot:not(.filled)')];
  let best = null, bestD = Infinity;
  slots.forEach(s => {
    const r = s.getBoundingClientRect();
    const sx = r.left + r.width/2; const sy = r.top + r.height/2;
    const d = Math.hypot(sx - cx, sy - cy);
    if (d < bestD) { bestD = d; best = s; }
  });
  return bestD <= maxDist ? best : null;
}

function snapToSlot(piece, slot) {
  const boardRect = board.getBoundingClientRect();
  const r = slot.getBoundingClientRect();
  // Переносим деталь внутрь игрового поля, чтобы она занимала слот и не перекрывала другие
  if (piece.parentElement !== board) board.appendChild(piece);
  piece.style.position = 'absolute';
  piece.style.left = `${r.left - boardRect.left}px`;
  piece.style.top = `${r.top - boardRect.top}px`;
  piece.style.width = `${r.width}px`;
  piece.style.height = `${r.height}px`;
  piece.style.zIndex = String(Z_INDEX_BY_PART[piece.dataset.part] || 1);
  // Сохраняем круглую форму для круглых деталей
  if (piece.dataset.part === 'lens' || piece.dataset.part === 'zoomRing') {
    piece.style.borderRadius = '50%';
  }
}

function showWin() {
  win.hidden = false;
}

hintBtn.addEventListener('click', () => {
  document.querySelectorAll('.slot').forEach(s => s.classList.toggle('hint'));
});
playAgain.addEventListener('click', () => {
  win.hidden = true;
});

function getPoint(e) { return { x: e.clientX, y: e.clientY }; }

// ========= SVG Helpers =========
function svgBody() {
  return `
<svg viewBox="0 0 400 220" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
  <defs>
    <linearGradient id="bodyGrad" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="#6b5435"/>
      <stop offset="50%" stop-color="#5a4a3a"/>
      <stop offset="100%" stop-color="#4a3a2a"/>
    </linearGradient>
    <linearGradient id="panelGrad" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#6b5435"/>
      <stop offset="100%" stop-color="#4a3a2a"/>
    </linearGradient>
    <pattern id="gripPattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="0.5" fill="#3a2a1a" opacity="0.3"/>
    </pattern>
  </defs>
  <!-- Фон, заполняющий всю область -->
  <rect x="0" y="0" width="400" height="220" fill="url(#bodyGrad)"/>
  <!-- Основной корпус камеры -->
  <rect x="15" y="25" width="370" height="170" rx="8" fill="url(#bodyGrad)" stroke="#3a2a1a" stroke-width="2"/>
  <!-- Верхняя панель с логотипом -->
  <rect x="20" y="15" width="120" height="45" rx="4" fill="url(#panelGrad)" stroke="#3a2a1a" stroke-width="1"/>
  <text x="25" y="35" font-size="14" fill="#d4a574" font-weight="bold" font-family="serif">Beaulieu</text>
  <text x="25" y="48" font-size="10" fill="#b8956a" font-family="monospace">4008 ZM II</text>
  <text x="25" y="58" font-size="7" fill="#8b6f47" font-style="italic">MADE IN FRANCE</text>
  <!-- Текстурированная область рукоятки -->
  <rect x="20" y="70" width="100" height="80" rx="4" fill="#3a2a1a" fill-opacity="0.8"/>
  <rect x="20" y="70" width="100" height="80" rx="4" fill="url(#gripPattern)"/>
  <!-- Циферблат в области рукоятки -->
  <circle cx="70" cy="110" r="18" fill="#4a3a2a" stroke="#6b5435" stroke-width="2"/>
  <circle cx="70" cy="110" r="15" fill="#3a2a1a"/>
  <line x1="70" y1="110" x2="70" y2="98" stroke="#d4a574" stroke-width="1.5"/>
  <!-- Дополнительные элементы управления -->
  <circle cx="100" cy="95" r="4" fill="#4a3a2a" stroke="#6b5435" stroke-width="1"/>
  <circle cx="100" cy="125" r="4" fill="#4a3a2a" stroke="#6b5435" stroke-width="1"/>
  <!-- Нижняя часть с основанием -->
  <rect x="15" y="190" width="370" height="25" rx="4" fill="#3a2a1a" stroke="#2a1f14" stroke-width="1"/>
</svg>`;
}

function svgLens() {
  return `
<svg viewBox="0 0 220 220" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <defs>
    <linearGradient id="lensGrad" x1="0" x2="1">
      <stop offset="0%" stop-color="#4a3a2a"/>
      <stop offset="50%" stop-color="#3a2a1a"/>
      <stop offset="100%" stop-color="#2a1f14"/>
    </linearGradient>
    <radialGradient id="lensGlass" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#6b5435" stop-opacity="0.6"/>
      <stop offset="70%" stop-color="#3a2a1a" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#2a1f14" stop-opacity="1"/>
    </radialGradient>
  </defs>
  <!-- Фон, заполняющий всю область -->
  <circle cx="110" cy="110" r="110" fill="url(#lensGrad)"/>
  <!-- Внешнее кольцо объектива -->
  <circle cx="110" cy="110" r="90" fill="url(#lensGrad)" stroke="#2a1f14" stroke-width="3"/>
  <!-- Среднее кольцо -->
  <circle cx="110" cy="110" r="75" fill="#3a2a1a" stroke="#4a3a2a" stroke-width="2"/>
  <!-- Внутреннее стекло -->
  <circle cx="110" cy="110" r="60" fill="url(#lensGlass)" stroke="#3a2a1a" stroke-width="2"/>
  <!-- Центральное отражение -->
  <ellipse cx="110" cy="100" rx="25" ry="15" fill="#8b6f47" opacity="0.3"/>
  <!-- Маркировки на объективе -->
  <text x="110" y="50" font-size="8" fill="#b8956a" text-anchor="middle" font-family="monospace">f=8-64mm</text>
  <text x="110" y="62" font-size="7" fill="#8b6f47" text-anchor="middle" font-family="monospace">1:1.9</text>
</svg>`;
}

function svgViewfinder() {
  return `
<svg viewBox="0 0 120 70" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <defs>
    <linearGradient id="viewfinderGrad" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#5a4a3a"/>
      <stop offset="100%" stop-color="#3a2a1a"/>
    </linearGradient>
  </defs>
  <!-- Фон, заполняющий всю область -->
  <rect x="0" y="0" width="120" height="70" fill="#3a2a1a"/>
  <!-- Серебряное кольцо видоискателя (коричнево-золотистое) -->
  <rect x="8" y="8" width="104" height="52" rx="8" fill="#c9a882" stroke="#b8956a" stroke-width="2"/>
  <!-- Ребристое кольцо -->
  <rect x="10" y="10" width="100" height="48" rx="6" fill="url(#viewfinderGrad)"/>
  <g stroke="#4a3a2a" stroke-width="0.5" opacity="0.5">
    <line x1="15" y1="15" x2="15" y2="57"/>
    <line x1="25" y1="15" x2="25" y2="57"/>
    <line x1="35" y1="15" x2="35" y2="57"/>
    <line x1="45" y1="15" x2="45" y2="57"/>
    <line x1="55" y1="15" x2="55" y2="57"/>
    <line x1="65" y1="15" x2="65" y2="57"/>
    <line x1="75" y1="15" x2="75" y2="57"/>
    <line x1="85" y1="15" x2="85" y2="57"/>
    <line x1="95" y1="15" x2="95" y2="57"/>
    <line x1="105" y1="15" x2="105" y2="57"/>
  </g>
  <!-- Черный окуляр -->
  <rect x="20" y="20" width="80" height="28" rx="4" fill="#2a1f14"/>
  <!-- Резиновый наглазник (внешний) -->
  <ellipse cx="60" cy="12" rx="50" ry="8" fill="#3a2a1a" opacity="0.8"/>
</svg>`;
}

function svgZoomRing() {
  return `
<svg viewBox="0 0 250 250" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <defs>
    <linearGradient id="ringGrad" x1="0" x2="1">
      <stop offset="0%" stop-color="#d4a574"/>
      <stop offset="50%" stop-color="#c9a882"/>
      <stop offset="100%" stop-color="#b8956a"/>
    </linearGradient>
    <pattern id="flutePattern" x="0" y="0" width="4" height="250" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="2" height="250" fill="#e5c494"/>
      <rect x="2" y="0" width="2" height="250" fill="#b8956a"/>
    </pattern>
  </defs>
  <!-- Фон, заполняющий всю область -->
  <circle cx="125" cy="125" r="125" fill="url(#ringGrad)"/>
  <!-- Большой серебряный фланцевый диск (коричнево-золотистый) -->
  <circle cx="125" cy="125" r="110" fill="url(#ringGrad)" stroke="#8b6f47" stroke-width="2"/>
  <!-- Ребристый край (фланцы) -->
  <circle cx="125" cy="125" r="110" fill="url(#flutePattern)" opacity="0.6"/>
  <!-- Центральная часть -->
  <circle cx="125" cy="125" r="80" fill="#c9a882" stroke="#b8956a" stroke-width="1"/>
  <!-- Внутренняя часть -->
  <circle cx="125" cy="125" r="60" fill="#d4a574"/>
  <!-- Маркировки -->
  <circle cx="125" cy="125" r="95" fill="none" stroke="#8b6f47" stroke-width="0.5" opacity="0.5"/>
</svg>`;
}

function svgGrip() {
  return `
<svg viewBox="0 0 80 180" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <defs>
    <linearGradient id="gripGrad" x1="0" x2="1">
      <stop offset="0%" stop-color="#3a2a1a"/>
      <stop offset="100%" stop-color="#2a1f14"/>
    </linearGradient>
    <pattern id="gripTexture" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="0.3" fill="#4a3a2a" opacity="0.4"/>
    </pattern>
  </defs>
  <!-- Фон, заполняющий всю область -->
  <rect x="0" y="0" width="80" height="180" fill="url(#gripGrad)"/>
  <!-- Основная рукоять -->
  <rect x="12" y="10" width="56" height="160" rx="12" fill="url(#gripGrad)" stroke="#2a1f14" stroke-width="2"/>
  <!-- Текстурированная поверхность -->
  <rect x="12" y="10" width="56" height="160" rx="12" fill="url(#gripTexture)"/>
  <!-- Серебряное основание (коричнево-золотистое) -->
  <rect x="8" y="165" width="64" height="12" rx="4" fill="#c9a882" stroke="#b8956a" stroke-width="1"/>
  <!-- Дополнительные элементы на рукояти -->
  <rect x="20" y="30" width="40" height="20" rx="4" fill="#4a3a2a" opacity="0.6"/>
  <rect x="20" y="130" width="40" height="25" rx="4" fill="#4a3a2a" opacity="0.6"/>
</svg>`;
}

function svgTrigger() {
  return `
<svg viewBox="0 0 200 60" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <defs>
    <linearGradient id="triggerGrad" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#5a4a3a"/>
      <stop offset="100%" stop-color="#3a2a1a"/>
    </linearGradient>
  </defs>
  <!-- Фон, заполняющий всю область -->
  <rect x="0" y="0" width="200" height="60" fill="url(#triggerGrad)"/>
  <!-- Кнопка спуска -->
  <rect x="12" y="20" width="176" height="20" rx="6" fill="url(#triggerGrad)" stroke="#2a1f14" stroke-width="2"/>
  <!-- Индикатор спуска (красная точка) -->
  <circle cx="35" cy="30" r="6" fill="#cc0000" stroke="#990000" stroke-width="1"/>
  <!-- Текстура кнопки -->
  <rect x="15" y="22" width="170" height="16" rx="4" fill="#4a3a2a" opacity="0.3"/>
</svg>`;
}

// Инициализация
init();


