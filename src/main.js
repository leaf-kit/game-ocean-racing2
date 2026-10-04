// 대항해시대 레이싱 - 메인 게임 루프
import * as THREE from 'three';
import { SHIPS, SHIP_CATEGORIES, AI_NAMES, buildShipMesh, renderShipPreview, pickAiName } from './ships.js?v=20261004a';
import { Environment, TIME_PRESETS, waveHeight, SEA } from './ocean.js?v=20261004a';
import { Track, TRACK_HALF_WIDTH, GUARD_OFFSET, CHECKPOINT_COUNT } from './track.js?v=20261004a';
import { Boat } from './boat.js?v=20261004a';
import { aiControl, difficultyParams } from './ai.js?v=20261004a';
import { HUD, formatTime } from './hud.js?v=20261004a';
import { Particles, Seagulls, Wakes } from './effects.js?v=20261004a';
import { AudioManager } from './audio.js?v=20261004a';
import { PORTS, TRIVIA, EVENTS, FIGURES as HIST_FIGURES, DISCOVERIES, MAP_ROUTES } from './history.js?v=20261004a';
import { WORLD_ROUTE } from './worldmap.js?v=20261004a';
import { t, LANG, setLang, applyStaticI18n, applyEnglishData, ordinal } from './i18n.js?v=20261004a';
import { MAPS, DEFAULT_MAP, findMap } from './maps.js?v=20261004a';
import { FIGURES, TRAITS, findFigure, portraitSrc, figName } from './figures.js?v=20261004a';
import { Fleet, FORMATION_LIST, findFormation, SPACING_LIST, findSpacing, formationDepth, MAX_CONSORTS, ORDERS, applyOfficerTraits, freshTraits } from './fleet.js?v=20261004a';
import { CHAPTERS, findChapter, chapterCount, MISSION_TYPES, goalText, meets, gradeOf, GRADE_COLOR } from './campaign.js?v=20261004a';
import { SAVE, persist, addFame, recordChapter, markSeen, meetVerse, recordBond, grantTitle } from './save.js?v=20261004a';
import { VERSES, findVerse, stageOf, blankOut, MEMORIZED_AT } from './scripture.js?v=20261004a';
import { Cutscene } from './story.js?v=20261004a';
import { Wildlife, ANIMALS } from './wildlife.js?v=20261004a';
import { Bukhang, BOND_FULL } from './bukhang.js?v=20261004a';

applyEnglishData();
applyStaticI18n();
document.getElementById('lang-select').addEventListener('change', (e) => setLang(e.target.value));

const $ = (id) => document.getElementById(id);
const AI_COLORS = ['#ff6b6b', '#6bcBff', '#7bed9f', '#f8a5ff', '#ffa94d', '#c3b1ff'];

// ---------- 렌더러/씬 ----------
const app = $('app');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
} catch (err) {
  window.showLoadError?.('WebGL 컨텍스트를 만들 수 없습니다. 브라우저의 하드웨어 가속(WebGL)을 켜거나 다른 브라우저로 시도하세요. (' + err.message + ')');
  throw err;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
app.appendChild(renderer.domElement);

let scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.5, 6000);
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const hud = new HUD();
const audio = new AudioManager();
audio.onTrackChange = (name) => { hud.setMusic(name || t('music.synthName')); const el = $('music-hint-name'); if (el && name) el.textContent = '♪ ' + name + ' · ' + t('music.ext', { n: audio.tracks.length }); updateMusicWidget(); };
// ---------- 플레이리스트 위젯 ----------
function updateMusicWidget() {
  const w = $('music-widget'); if (!audio.hasExternalMusic) { w.classList.add('hidden'); return; }
  w.classList.remove('hidden');
  const names = audio.trackNames();
  $('music-cur').textContent = audio.trackName || names[0] || '';
  const ul = $('music-items');
  if (ul.children.length !== names.length) {
    ul.innerHTML = '';
    names.forEach((n, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${n}</span>${i === audio.mainIdx ? `<span class="tag">★ ${t('music.main')}</span>` : ''}`;
      li.addEventListener('click', (e) => { e.stopPropagation(); audio.init(); audio.playIndex(i); updateMusicWidget(); }); // 목록은 열어 둔 채 현재 곡 표시만 갱신
      ul.appendChild(li);
    });
  }
  [...ul.children].forEach((li, i) => li.classList.toggle('current', i === audio.trackIdx && !!audio.trackName));
}
$('music-toggle').addEventListener('click', (e) => { e.stopPropagation(); $('music-list').classList.toggle('hidden'); updateMusicWidget(); });
window.addEventListener('pointerdown', (e) => { if (!e.target.closest('#music-widget')) $('music-list').classList.add('hidden'); });
audio.ready.then(updateMusicWidget);
// 인트로 영상이 끝난 뒤에 배경음악을 시작한다 (영상 소리와 겹치지 않도록).
// 브라우저가 자동재생을 막으면 '클릭하여 입장' 안내를 띄우고, 첫 클릭에 곧바로 메인 테마를 튼다
(window.introDone || Promise.resolve()).then(() => audio.autoplay()).then((ok) => {
  const gate = $('enter-gate');
  if (ok || !audio.hasExternalMusic) { gate.classList.add('hidden'); return; }
  gate.classList.remove('hidden');
  const enter = () => { gate.classList.add('hidden'); window.removeEventListener('keydown', enter); };
  gate.addEventListener('pointerdown', enter, { once: true });
  window.addEventListener('keydown', enter);
});
const clock = new THREE.Clock();

// ---------- 게임 상태 ----------
const G = {
  state: 'title', // title | select | countdown | racing | finished | result
  mode: 'campaign', // campaign | free
  chapter: null,    // 캠페인 중인 장
  fleet: null,      // 함대 (기함 + 동료함)
  mission: null,    // 미션 진행 상황
  selectedShip: SHIPS[0],
  laps: 3, difficulty: 'normal', timeOfDay: 'random',
  env: null, track: null, particles: null, gulls: null,
  boats: [], player: null, projectiles: [],
  wind: { dir: 0, strength: 0.7, gustTimer: 25, gust: 0, targetDir: 0 },
  raceTime: 0, countdown: 0, t: 0, camMode: 0, camShake: 0, finishTimer: 0,
  keys: {}, previewDisposers: [], whirlCooldown: 0, krakenActive: false, doubleShotTimer: 0,
  lastLapTime: 0,
  // 점수 / 콤보 / 통계
  score: 0, combo: 0, comboTimer: 0,
  stats: null,
  // 슬립스트림
  draft: { t: 0, awarded: false, off: 0 },
  // 폭풍
  storm: { state: 'calm', level: 0, timer: 0, lightning: 0, flash: 0, hitDuring: false, warned: false },
  // 퍼펙트 스타트
  throttleKeyTime: -1, goTime: 0,
  // 추월 판정 (pending: 남은 확인 시간, confirmed: 마지막으로 확정된 순위)
  overtake: { pending: -1, confirmed: 6 },
  // 역사 학습: 연대기 진행, 발견한 인물/현상
  eventIdx: 0, eventTimer: 6, learned: { figures: [], discoveries: [], verses: [], memorized: [], events: 0 },
  // 발견 효과 남은 시간
  fx: { aurora: 0, elmo: 0, tradeWind: 0, current: 0, doubleScore: 0 },
  cycle: false, phase: 0,
  camOff: new THREE.Vector3(), camOffInit: false,
  map: DEFAULT_MAP,
  // SHIFT 연타: 게이지(0~1), 마지막 탭 시각, 안내 타이머
  tap: { meter: 0, last: -10, hintT: 0, hintOn: false, taps: 0, bursts: 0 },
  // 부캉이의 바다
  wildlife: null, shark: null,
  animalsMet: [], animalsNew: [],         // 이번 항해에서 본 종 / 도감에 처음 올린 종
  tide: { phase: 0, level: 0, high: false },
  guide: { stress: 0, led: 0, done: false, slowT: 0 },
};
const COMBO_WINDOW = 4.0;
const cutscene = new Cutscene();

function freshStats() { return { nearMiss: 0, overtakes: 0, coins: 0, chests: 0, slipstreams: 0, perfectStart: false, maxCombo: 0, bestLap: Infinity, storms: 0, rankPts: 0, jumps: 0, loops: 0, warps: 0, fleetTime: 0, orders: 0 }; }
// 미션 진행 상황. gradeOf()가 이 모양을 읽는다.
function freshMission() { return { hits: 0, treasure: 0, aliveConsorts: 0, survived: false, surviveT: 0, rank: 9, time: 0, finished: false, crashes: 0, failed: false, failReason: '',
  guided: false, maxStress: 0, companions: 0 }; }

// ---------- 입력 ----------
window.addEventListener('keydown', (e) => {
  if (e.target && e.target.closest && e.target.closest('input, textarea, select')) return; // 이름 입력 중에는 단축키 무시
  // 컷씬 중에는 스페이스/엔터로 다음 줄, ESC로 건너뛰기
  if (cutscene.active) {
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); cutscene.advance(); }
    else if (e.code === 'Escape') cutscene.finish();
    return;
  }
  // 함대 명령 1 · 2 · 3
  if (G.state === 'racing' && G.fleet && G.fleet.size) {
    const ord = { Digit1: 'charge', Digit2: 'screen', Digit3: 'gather' }[e.code];
    if (ord) { orderFleet(ord); return; }
  }
  if (!G.keys[e.code] && (e.code === 'KeyW' || e.code === 'ArrowUp') && G.state === 'countdown') G.throttleKeyTime = G.t;
  if (!G.keys[e.code] && (e.code === 'ShiftLeft' || e.code === 'ShiftRight') && G.state === 'racing') onShiftTap();
  G.keys[e.code] = true;
  if (e.code === 'KeyC' && G.state === 'racing') G.camMode = (G.camMode + 1) % 3;
  if (e.code === 'Space') e.preventDefault();
  if (e.code === 'KeyM' && audio.enabled) { audio.musicOn = !audio.musicOn; audio.setMusicVolume(audio.musicOn ? audio.MUSIC_VOL : 0); hud.event(audio.musicOn ? t('ev.music.on') : t('ev.music.off'), 1200); }
  if (e.code === 'Escape' && ['racing', 'finished', 'countdown', 'result'].includes(G.state)) { endRace(); showFleetScreen(); }
});
window.addEventListener('keyup', (e) => { G.keys[e.code] = false; });
window.addEventListener('blur', () => { G.keys = {}; });

// ---------- 마우스 / 터치 조작 ----------
// 누른 채 좌우로 끌면 조타 + 전진, 빠르게 두드리면 연타 부스트, 우클릭/두 손가락은 전속 항해
const PTR = { down: false, id: null, steer: 0, boost: false, fingers: new Set(), lastDown: -10 };
// 가상 패드 (모바일): 버튼을 누르는 동안 해당 키가 눌린 것으로 취급
const VK = { left: false, right: false, up: false, down: false, boost: false };
for (const btn of document.querySelectorAll('#touch-pad .pad-btn')) {
  const k = btn.dataset.vk;
  const press = (e) => { e.preventDefault(); e.stopPropagation(); btn.classList.add('on'); try { btn.setPointerCapture(e.pointerId); } catch (_) { /* 무시 */ }
    if (k === 'fire') { if (G.state === 'racing' && G.player && !G.player.finished) fireCannon(G.player); return; }
    VK[k] = true; if (k === 'boost' && G.state === 'racing') onShiftTap(); };
  const release = (e) => { e.preventDefault(); btn.classList.remove('on'); if (k !== 'fire') VK[k] = false; };
  btn.addEventListener('pointerdown', press); btn.addEventListener('pointerup', release); btn.addEventListener('pointercancel', release); btn.addEventListener('lostpointercapture', release);
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
}
const isUiTarget = (el) => !!(el && el.closest && el.closest('#fleet-screen, #chapter-screen, #codex-screen, #result-screen, #title-screen, #cutscene, #lang-bar, #music-widget, #top-menu, #touch-pad, #btn-fire, #fleet-orders, #enter-gate, select, button, input'));
function ptrSteerFrom(x) {
  const w = window.innerWidth, c = w / 2, dead = w * 0.06;
  const d = x - c;
  if (Math.abs(d) < dead) return 0;
  return -Math.max(-1, Math.min(1, (d - Math.sign(d) * dead) / (w * 0.28))); // 오른쪽으로 끌면 오른쪽 조타 (steer 음수)
}
window.addEventListener('pointerdown', (e) => {
  if (isUiTarget(e.target)) return;
  if (G.state !== 'racing' && G.state !== 'countdown') return;
  e.preventDefault();
  PTR.fingers.add(e.pointerId);
  if (e.pointerType === 'mouse' && e.button === 2) { PTR.boost = true; return; }
  if (PTR.fingers.size >= 2) { PTR.boost = true; return; } // 두 번째 손가락 = 전속 항해
  PTR.down = true; PTR.id = e.pointerId; PTR.steer = ptrSteerFrom(e.clientX);
  if (G.state === 'racing') onShiftTap(); // 두드리기 = 연타 부스트 게이지
  if (G.state === 'countdown') G.throttleKeyTime = G.t;
});
window.addEventListener('pointermove', (e) => { if (PTR.down && e.pointerId === PTR.id) PTR.steer = ptrSteerFrom(e.clientX); });
const ptrUp = (e) => {
  PTR.fingers.delete(e.pointerId);
  if (e.pointerType === 'mouse' && e.button === 2) PTR.boost = false;
  if (e.pointerId === PTR.id) { PTR.down = false; PTR.id = null; PTR.steer = 0; }
  if (PTR.fingers.size < 2 && e.pointerType !== 'mouse') PTR.boost = false;
  if (PTR.fingers.size === 0) { PTR.down = false; PTR.boost = false; PTR.steer = 0; }
};
window.addEventListener('pointerup', ptrUp); window.addEventListener('pointercancel', ptrUp);
window.addEventListener('contextmenu', (e) => { if (!isUiTarget(e.target)) e.preventDefault(); });
$('btn-fire').addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); if (G.state === 'racing' && G.player && !G.player.finished) fireCannon(G.player); });

// ---------- 화면 전환 ----------
const SCREENS = ['title-screen', 'chapter-screen', 'fleet-screen', 'codex-screen', 'result-screen'];
function showScreen(id) {
  // 출항 준비를 떠나면 기함 미리보기 렌더링을 멈춘다 (보이지 않는 캔버스를 계속 그리지 않도록)
  if (id !== 'fleet-screen' && shipPreviewStop) { shipPreviewStop(); shipPreviewStop = null; }
  for (const s of SCREENS) $(s).classList.toggle('hidden', s !== id);
  $('lang-bar').classList.toggle('hidden', !id);
  // 메뉴 화면에는 뒤로 버튼이 있으므로 항해 중에만 ☰ 메뉴를 띄운다 (좌상단에서 겹치지 않게)
  $('top-menu').classList.toggle('hidden', !!id);
  document.body.classList.toggle('in-menu', !!id);
}

$('btn-campaign').addEventListener('click', () => { audio.init(); showChapters(); });
$('btn-freeplay').addEventListener('click', () => { audio.init(); G.mode = 'free'; G.chapter = null; showFleetScreen(); });
$('btn-codex').addEventListener('click', () => { audio.init(); showCodex(); });
$('btn-race').addEventListener('click', () => { audio.init(); beginChapter(); });
$('btn-retry').addEventListener('click', () => { $('result-screen').classList.add('hidden'); startRace(); });
$('btn-select').addEventListener('click', () => { showFleetScreen(); });
$('btn-tolog').addEventListener('click', () => { G.mode === 'free' ? goHome() : showChapters(); });
$('btn-next').addEventListener('click', () => {
  const nxt = findChapter(Math.min(chapterCount - 1, (G.chapter ? G.chapter.id : -1) + 1));
  G.mode = 'campaign'; G.chapter = nxt; showFleetScreen();
});
for (const b of document.querySelectorAll('.btn-back')) {
  b.addEventListener('click', () => { const to = b.dataset.back; to === 'title' ? goHome() : showChapters(); });
}

// 타이틀에 배경음악 상태 표시 (assets/music 폴더 탐색이 끝난 뒤)
audio.ready.then(() => {
  const el = $('music-hint-name');
  if (el && !audio.trackName) el.textContent = audio.hasExternalMusic ? t('music.ext', { n: audio.tracks.length }) : t('music.synth');
});

// ---------- 맵 선택 (자유 항해) ----------
G.map = findMap(SAVE.freeMap);
// 자유 항해는 모래상자다. 함선·인물과 마찬가지로 맵도 전부 열려 있다.
function buildMapOptions() {
  const sel = $('opt-map'); if (sel.options.length) return;
  for (const m of MAPS) { const o = document.createElement('option'); o.value = m.id; o.textContent = LANG === 'en' ? m.en : m.name; sel.appendChild(o); }
  sel.value = G.map.id;
  sel.addEventListener('change', () => { G.map = findMap(sel.value); SAVE.freeMap = G.map.id; persist(); });
  const ml = $('menu-maps');
  for (const m of MAPS) {
    const li = document.createElement('li'); li.dataset.id = m.id;
    li.textContent = LANG === 'en' ? m.en : m.name;
    li.addEventListener('click', (e) => {
      e.stopPropagation();
      G.mode = 'free'; G.chapter = null; G.map = m; sel.value = m.id; SAVE.freeMap = m.id; persist();
      $('top-menu-list').classList.add('hidden'); $('result-screen').classList.add('hidden'); startRace();
    });
    ml.appendChild(li);
  }
}
$('menu-toggle').addEventListener('click', (e) => { e.stopPropagation(); $('top-menu-list').classList.toggle('hidden'); [...$('menu-maps').children].forEach((li) => li.classList.toggle('current', li.dataset.id === G.map.id)); });
$('menu-home').addEventListener('click', (e) => { e.stopPropagation(); $('top-menu-list').classList.add('hidden'); goHome(); });
$('menu-fleet').addEventListener('click', (e) => { e.stopPropagation(); $('top-menu-list').classList.add('hidden'); endRace(); showFleetScreen(); });
$('menu-chapters').addEventListener('click', (e) => { e.stopPropagation(); $('top-menu-list').classList.add('hidden'); endRace(); showChapters(); });
$('menu-restart').addEventListener('click', (e) => { e.stopPropagation(); $('top-menu-list').classList.add('hidden'); startRace(); });
window.addEventListener('pointerdown', (e) => { if (!e.target.closest('#top-menu')) $('top-menu-list').classList.add('hidden'); });

function goHome() {
  endRace();
  showScreen('title-screen');
  G.state = 'title'; G.attract = false;
  refreshTitle();
  if (audio.enabled) audio.playTheme();
}

// ---------- 타이틀 ----------
function refreshTitle() {
  const done = SAVE.chapter;
  const label = $('campaign-label'), sub = $('campaign-sub');
  if (done === 0) { label.textContent = t('title.campaign'); sub.textContent = t('title.campaignNew'); }
  else if (done >= chapterCount) { label.textContent = t('title.campaignDone'); sub.textContent = t('title.campaignAll', { n: chapterCount }); }
  else { label.textContent = t('title.campaignGo'); sub.textContent = findChapter(done).act + ' · ' + findChapter(done).title; }
  // 타이틀 아래 초상 띠: 이미 만난 인물은 또렷하게, 아직 못 만난 인물은 어둡게
  const row = $('title-portraits');
  if (!row.children.length) {
    row.innerHTML = FIGURES.slice(0, 12).map((f) =>
      `<img src="${portraitSrc(f.id, true)}" alt="${f.name}" title="${f.name}" data-fid="${f.id}">`).join('');
  }
  for (const img of row.children) img.classList.toggle('dim', !SAVE.seenFigures.includes(img.dataset.fid) && !ownedOfficers().includes(img.dataset.fid));
}

// ---------- 항해일지 (챕터 선택) ----------
function showChapters() {
  G.state = 'select'; G.mode = 'campaign'; G.attract = false;
  hud.hide();
  showScreen('chapter-screen');
  if (audio.enabled) audio.playTheme();
  updateFame();
  const list = $('chapter-list');
  list.innerHTML = '';
  for (const ch of CHAPTERS) {
    const locked = ch.id > SAVE.chapter;
    const grade = SAVE.bestRank[ch.id];
    const T = MISSION_TYPES[ch.type];
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'chapter-card' + (locked ? ' locked' : '') + (ch.id === SAVE.chapter ? ' current' : '');
    const figId = ch.intro?.find((l) => l.who && l.who !== 'me')?.who;
    el.innerHTML = `
      <div class="ch-portrait">${figId && !locked ? `<img src="${portraitSrc(figId, true)}" alt="">` : '<span>🔒</span>'}</div>
      <div class="ch-main">
        <div class="ch-act">${ch.act}<span class="ch-mission" style="color:${T.color}">${T.icon} ${T.name}</span></div>
        <div class="ch-title">${locked ? '???' : ch.title}</div>
        <div class="ch-sub">${locked ? t('chapter.locked') : ch.subtitle}</div>
        ${locked ? '' : `<div class="ch-goal">${goalText(ch)}</div>`}
      </div>
      <div class="ch-side">
        ${grade ? `<div class="ch-grade" style="color:${GRADE_COLOR[grade]}">${grade}</div>` : ''}
        ${SAVE.bestTime[ch.id] ? `<div class="ch-time">${formatTime(SAVE.bestTime[ch.id])}</div>` : ''}
        <div class="ch-fame">⚜ ${ch.fame}</div>
      </div>`;
    if (!locked) el.addEventListener('click', () => { G.chapter = ch; audio.pickup(); showFleetScreen(); });
    list.appendChild(el);
  }
}

function updateFame() {
  for (const id of ['fame-val', 'fame-val2', 'fame-val3']) { const e = $(id); if (e) e.textContent = SAVE.fame.toLocaleString('ko-KR'); }
}

// 인물 개방 판정. 자유 항해는 모래상자이므로 함선과 마찬가지로 전원 개방한다.
// 캠페인에서만 명성으로 잠긴다(해금이 곧 보상이므로).
function figureUnlocked(f) {
  const fig = typeof f === 'string' ? findFigure(f) : f;
  return G.mode !== 'campaign' || SAVE.fame >= fig.fame;
}
function ownedOfficers() { return FIGURES.filter(figureUnlocked).map((f) => f.id); }

// ---------- 인물 도감 ----------
let codexBuilt = false;
function showCodex() {
  G.state = 'select'; G.attract = false;
  hud.hide(); showScreen('codex-screen');
  updateFame();
  buildAnimalCodex();
  const grid = $('codex-grid');
  grid.innerHTML = FIGURES.map((f) => {
    const owned = SAVE.fame >= f.fame; // 도감은 캠페인 기준 해금 상태를 보여 준다
    const tr = TRAITS[f.trait];
    return `<article class="codex-card${owned ? '' : ' locked'}">
      <img src="${portraitSrc(f.id)}" alt="${figName(f)}" loading="lazy">
      <div class="cx-body">
        <h3>${figName(f)}<small>${LANG === 'en' ? f.name : f.en}</small></h3>
        <div class="cx-meta">${f.nation} · ${f.years} · <b>${f.role}</b></div>
        <p class="cx-bio">${f.bio}</p>
        <blockquote>“${f.line}”</blockquote>
        <div class="cx-trait">${tr.icon} <b>${tr.name}</b> — ${tr.desc}</div>
        <div class="cx-fame">${owned ? t('codex.joined') : t('codex.needs', { n: f.fame.toLocaleString('ko-KR') })}</div>
      </div>
    </article>`;
  }).join('');
  if (!codexBuilt) { codexBuilt = true; }
  buildVerseCodex();
  loadCredits();
}

// 도감의 말씀 절: 만난 구절을 다시 읽어 보며 외울 수 있게 한다.
// 아직 암송 전인 구절은 빈칸이 뚫린 채로 나오고, 눌러야 답이 보인다.
function buildVerseCodex() {
  const wrap = $('codex-verses');
  const memo = VERSES.filter((v) => (SAVE.verses[v.id] || 0) >= MEMORIZED_AT).length;
  const met = VERSES.filter((v) => SAVE.verses[v.id]).length;
  wrap.innerHTML = `<h3>${t('codex.verses')} <small>${t('codex.verseCount', { m: memo, s: met, all: VERSES.length })}</small></h3>
    <p class="codex-note">${t('codex.verseNote')}</p>
    <div class="verse-grid">` + VERSES.map((v) => {
      const n = SAVE.verses[v.id] || 0;
      const body = LANG === 'en' ? v.en : v.ko;
      const ref = LANG === 'en' ? v.refEn : v.ref;
      if (!n) return `<article class="verse-card locked"><b>${ref}</b><p>${t('codex.verseLocked')}</p></article>`;
      const done = n >= MEMORIZED_AT;
      const { masked, filled } = blankOut(body, done ? 0 : Math.min(3, Math.ceil(n / 2)));
      return `<article class="verse-card${done ? ' done' : ''}" data-full="${filled.replace(/"/g, '&quot;')}">
        <b>${ref}${done ? ' <span class="vc-done">✔ 암송</span>' : ''}</b>
        <p class="vc-body">${masked}</p>
        <span class="vc-prog"><i style="width:${Math.min(100, (n / MEMORIZED_AT) * 100)}%"></i></span>
      </article>`;
    }).join('') + '</div>';
  // 누르면 답이 보인다
  for (const card of wrap.querySelectorAll('.verse-card[data-full]')) {
    card.addEventListener('click', () => {
      card.querySelector('.vc-body').innerHTML = card.dataset.full;
      card.classList.add('shown');
    });
  }
}
// 초상 출처·저작권 표시 (assets/portraits/credits.json)
// 도감을 열자마자 보이도록 파일은 미리 받아 둔다.
const creditsReq = fetch('./assets/portraits/credits.json').then((r) => r.json()).catch(() => null);
function loadCredits() {
  creditsReq.then((cr) => {
    if (!cr) { $('codex-credit').textContent = ''; return; }
    const rows = FIGURES.map((f) => {
      const c = cr[f.id]; if (!c) return '';
      return `<li><b>${figName(f)}</b> — <a href="${c.page}" target="_blank" rel="noopener">${c.file}</a> · ${c.license}${c.artist ? ' · ' + c.artist : ''}</li>`;
    }).join('');
    $('codex-credit').innerHTML = `<h4>${t('codex.credits')}</h4><ul>${rows}</ul>`;
  }).catch(() => { $('codex-credit').textContent = ''; });
}

// ---------- 출항 준비 (함대 편성) ----------
$('opt-name').addEventListener('change', () => { SAVE.name = $('opt-name').value.trim().slice(0, 12); persist(); });
// 등장 연출 on/off (저사양·접근성). 끄면 부캉이가 조용히 나타난다.
(() => {
  const el = $('opt-cine'); if (!el) return;
  el.value = SAVE.cinematics === false ? '0' : '1';
  el.addEventListener('change', () => { SAVE.cinematics = el.value === '1'; persist(); });
})();
$('opt-name').value = SAVE.name || '';
function admiralName() { return ($('opt-name').value || '').trim().slice(0, 12) || t('name.default'); }

// 선택 상태
// 부제독은 명성에 따라 최대 5명. 동료함은 최대 9척(부제독이 없는 배는 '동료함 N호').
const MAX_OFFICERS = 5;
const SEL = {
  admiral: SAVE.admiral || 'henry',
  officers: [...(SAVE.officers || [])],
  formation: SAVE.fleetForm || 'line',
  spacing: SAVE.fleetSpacing || 'normal',
};
while (SEL.officers.length < MAX_OFFICERS) SEL.officers.push(null);
SEL.officers.length = MAX_OFFICERS;

// 명성으로 열리는 부제독 자리 수. 자유 항해는 전부 열어 둔다.
function maxOfficerSlots() {
  if (G.mode !== 'campaign') return MAX_OFFICERS;
  const f = SAVE.fame;
  return f >= 2800 ? 5 : f >= 1600 ? 4 : f >= 800 ? 3 : f >= 300 ? 2 : 1;
}
// 저장본이 어긋나 있을 수 있다: 기함 제독이 부제독 자리에도 들어가 있거나, 같은 인물이 두 칸에 있거나,
// 명성이 모자란 인물이 남아 있는 경우를 여기서 정리한다 (초상 중복의 원인).
(() => {
  const seen = new Set();
  SEL.officers = SEL.officers.map((id) => {
    if (!id || id === SEL.admiral || seen.has(id)) return null;
    seen.add(id); return id;
  });
  SAVE.officers = [...SEL.officers]; SAVE.admiral = SEL.admiral; persist();
})();

function showFleetScreen() {
  G.state = 'select'; G.attract = false;
  hud.hide(); showScreen('fleet-screen');
  if (audio.enabled) audio.playTheme();
  updateFame();
  buildMapOptions();

  const ch = G.mode === 'campaign' ? (G.chapter || findChapter(Math.min(SAVE.chapter, chapterCount - 1))) : null;
  G.chapter = ch;
  // 모드가 바뀌면 지금 모드에서 잠긴 인물은 자리에서 내린다 (자유 항해 ↔ 캠페인)
  SEL.officers = SEL.officers.map((id) => (id && figureUnlocked(id) ? id : null));
  if (!figureUnlocked(SEL.admiral)) SEL.admiral = FIGURES[0].id;
  saveOfficers(); SAVE.admiral = SEL.admiral; persist();
  $('free-options').classList.toggle('hidden', !!ch);
  $('fleet-chapter-act').textContent = ch ? ch.act : '';
  $('fleet-chapter-title').textContent = ch ? ch.title : t('fleet.freeTitle');

  // 미션 브리핑
  const brief = $('mission-brief');
  brief.classList.toggle('hidden', !ch);
  if (ch) {
    const T = MISSION_TYPES[ch.type];
    $('mb-icon').textContent = T.icon; $('mb-name').textContent = T.name;
    brief.style.setProperty('--mb-color', T.color);
    $('mb-goal').innerHTML = `<span class="mb-k">${t('fleet.goal')}</span> ${goalText(ch)}`;
    $('mb-sgoal').innerHTML = `<span class="mb-k s">${t('fleet.sgoal')}</span> ${goalText(ch, ch.sGoal)}`;
    $('mb-tip').innerHTML = ch.tip ? `<span class="mb-k">${t('fleet.tip')}</span> ${ch.tip}` : '';
    const m = findMap(ch.map);
    $('mb-map').innerHTML = `<b>${LANG === 'en' ? m.en : m.name}</b><span>${t('fleet.laps', { n: ch.laps })}</span><span>${t('time.' + ch.time)}</span>`;
    if (ch.map) G.map = m;
  }

  rebuildPeople(ch);
  buildFormationRow();
  buildSpacingRow();
  buildShipStrip(ch);
}

// 인물은 화면 어디에도 두 번 나오지 않는다.
//   기함 제독 → ① 큰 초상 한 장
//   부제독    → ② 슬롯
//   나머지    → ③ 목록
// 셋 중 하나가 바뀌면 세 영역을 함께 다시 그린다.
function rebuildPeople(ch) { buildAdmiralCard(ch); buildOfficerUI(ch); }

// ① 기함 제독: 지금 고른 인물 한 명만 크게 보여 준다
function buildAdmiralCard() {
  const f = findFigure(SEL.admiral);
  const tr = TRAITS[f.trait];
  $('admiral-card').innerHTML =
    `<img src="${portraitSrc(f.id)}" alt="${figName(f)}">
     <div class="ac-info">
       <b>${figName(f)}</b>
       <span class="ac-meta">${f.nation} · ${f.years}</span>
       <span class="ac-trait">${tr.icon} ${tr.name}</span>
     </div>`;
}

function buildOfficerUI(ch) {
  const consorts = ch ? (ch.consorts ?? 0) : parseInt($('opt-consorts').value, 10);
  // 부제독을 둘 수 있는 자리 = 동료함 수와 명성 한도 중 작은 쪽
  const maxSlots = Math.min(consorts, maxOfficerSlots());
  // 자리가 줄어들면 넘치는 배치는 비운다
  for (let i = maxSlots; i < SEL.officers.length; i++) SEL.officers[i] = null;

  // ② 부제독 슬롯
  const slots = $('officer-slots');
  slots.innerHTML = '';
  const fameCap = maxOfficerSlots();
  for (let i = 0; i < MAX_OFFICERS; i++) {
    const on = i < maxSlots;
    const id = on ? SEL.officers[i] : null;
    const f = id ? findFigure(id) : null;
    const tr = f ? TRAITS[f.trait] : null;
    // 자리가 닫힌 이유를 구분해서 알려 준다: 동료함이 모자라서인지, 명성이 모자라서인지
    const why = i >= fameCap ? t('fleet.needFame') : ch ? t('fleet.noSlot') : t('fleet.needConsort');
    const el = document.createElement('div');
    el.className = 'off-slot' + (on ? '' : ' off') + (f ? ' filled' : '');
    el.innerHTML = on
      ? (f ? `<img src="${portraitSrc(f.id, true)}" alt=""><div class="os-info"><b>${figName(f)}</b><span>${tr.icon} ${tr.name}</span></div><button class="os-x" type="button" title="${t('fleet.remove')}">✕</button>`
           : `<div class="os-empty">＋<span>${t('fleet.empty')}</span></div>`)
      : `<div class="os-empty locked">—<span>${why}</span></div>`;
    if (f) el.querySelector('.os-x').addEventListener('click', () => { SEL.officers[i] = null; saveOfficers(); rebuildPeople(ch); audio.pickup(); });
    slots.appendChild(el);
  }
  $('officer-count').textContent = `${SEL.officers.filter((x, i) => x && i < maxSlots).length}/${maxSlots}`
    + (consorts > maxSlots ? t('fleet.plusPlain', { n: consorts - maxSlots }) : '');

  // ③ 인물 목록: 기함 제독과 이미 배치한 부제독은 빼고 보여 준다 (초상 중복 방지)
  const placed = new Set([SEL.admiral, ...SEL.officers.filter(Boolean)]);
  const pool = $('officer-pool');
  const rest = FIGURES.filter((f) => !placed.has(f.id));
  pool.innerHTML = rest.map((f) => {
    const owned = figureUnlocked(f);
    const tr = TRAITS[f.trait];
    return `<div class="pt-card off${owned ? '' : ' locked'}" data-id="${f.id}">
      <img src="${portraitSrc(f.id)}" alt="${figName(f)}" loading="lazy">
      <span class="pt-name">${figName(f)}</span>
      <span class="pt-trait">${tr.icon} ${tr.name}</span>
      ${owned ? `<button class="pt-crown" type="button" data-crown="${f.id}" title="${t('fleet.makeAdmiral')}">👑</button>`
              : `<span class="pt-lock">⚜ ${f.fame.toLocaleString('ko-KR')}</span>`}
    </div>`;
  }).join('');

  for (const card of pool.children) {
    const id = card.dataset.id;
    const owned = figureUnlocked(id);
    // 👑 = 기함 제독으로. 지금 제독은 목록으로 돌아온다.
    const crown = card.querySelector('.pt-crown');
    if (crown) crown.addEventListener('click', (e) => {
      e.stopPropagation();
      const at = SEL.officers.indexOf(id);
      if (at >= 0) SEL.officers[at] = null;   // 부제독이었으면 자리를 비우고 승진
      SEL.admiral = id; SAVE.admiral = id; saveOfficers(); persist();
      const inp = $('opt-name');
      if (!inp.value.trim()) { inp.value = figName(findFigure(id)).slice(0, 12); inp.dispatchEvent(new Event('change')); }
      rebuildPeople(ch); audio.pickup();
    });
    // 카드 본문 = 부제독으로 배치
    if (!owned) continue;
    card.addEventListener('click', () => {
      if (maxSlots <= 0) return;
      const free = SEL.officers.findIndex((x, i) => !x && i < maxSlots);
      if (free < 0) { flashSlots(); return; }
      SEL.officers[free] = id;
      saveOfficers(); rebuildPeople(ch); audio.pickup();
    });
  }
}

// 자리가 꽉 찼을 때 슬롯을 한 번 흔들어 알려 준다 (레이스 중이 아니라 HUD 메시지를 못 쓴다)
function flashSlots() {
  const el = $('officer-slots');
  el.classList.remove('full'); void el.offsetWidth; el.classList.add('full');
  audio.hit(0.15);
}

function saveOfficers() { SAVE.officers = [...SEL.officers]; persist(); }

function buildSpacingRow() {
  const row = $('spacing-row');
  row.innerHTML = SPACING_LIST.map((sp) =>
    `<button type="button" class="space-btn${sp.id === SEL.spacing ? ' selected' : ''}" data-id="${sp.id}">${LANG === 'en' ? sp.en : sp.name}</button>`).join('');
  const desc = $('spacing-desc');
  const show = (id) => { desc.textContent = findSpacing(id).desc; };
  show(SEL.spacing);
  for (const b of row.children) {
    b.addEventListener('click', () => {
      SEL.spacing = b.dataset.id; SAVE.fleetSpacing = SEL.spacing; persist();
      [...row.children].forEach((c) => c.classList.toggle('selected', c === b));
      show(SEL.spacing); audio.pickup();
    });
    b.addEventListener('mouseenter', () => show(b.dataset.id));
    b.addEventListener('mouseleave', () => show(SEL.spacing));
  }
}

function buildFormationRow() {
  const row = $('formation-row');
  row.innerHTML = FORMATION_LIST.map((f) =>
    `<button type="button" class="form-btn${f.id === SEL.formation ? ' selected' : ''}" data-id="${f.id}"><b>${f.icon}</b><span>${LANG === 'en' ? f.en : f.name}</span></button>`).join('');
  const desc = $('formation-desc');
  const show = (id) => { const f = findFormation(id); desc.textContent = f.desc; };
  show(SEL.formation);
  for (const b of row.children) {
    b.addEventListener('click', () => {
      SEL.formation = b.dataset.id; SAVE.fleetForm = SEL.formation; persist();
      [...row.children].forEach((c) => c.classList.toggle('selected', c === b));
      show(SEL.formation); audio.pickup();
    });
    b.addEventListener('mouseenter', () => show(b.dataset.id));
    b.addEventListener('mouseleave', () => show(SEL.formation));
  }
}

// 해금한 함선: 클리어한 장의 보상 + 처음부터 열려 있는 기본 함선
function unlockedShips() {
  // 자유 항해는 모래상자다. 1편처럼 처음부터 모든 함선을 고를 수 있다.
  if (G.mode !== 'campaign') return SHIPS;
  // 캠페인은 해금이 곧 보상이므로 진행에 따라 열린다. 다만 시작 폭을 1편만큼 넉넉히 잡는다.
  const base = ['balsa', 'tarette', 'dhow', 'caravel_latina', 'caravel_redonda', 'nao', 'sloop',
                'carrack', 'light_galley', 'galley', 'lareale', 'xebec'];
  const rewards = CHAPTERS.filter((c) => c.id < SAVE.chapter).map((c) => c.reward?.ship).filter(Boolean);
  const set = new Set([...base, ...rewards]);
  return SHIPS.filter((s) => set.has(s.id) || SAVE.fame >= 2000); // 명성 2000을 넘기면 전 함선 개방
}

// 선택한 기함을 3D로 천천히 돌려 보여 준다. 배를 바꾸면 이전 미리보기는 정리한다.
let shipPreviewStop = null;
function showShipPreview(def) {
  if (shipPreviewStop) { shipPreviewStop(); shipPreviewStop = null; }
  shipPreviewStop = renderShipPreview($('ship-preview-canvas'), def);
  $('ship-preview-name').innerHTML =
    `<b>${def.name}</b><span>${def.en} · ${def.nation}</span>`;
}

function buildShipStrip(ch) {
  const strip = $('ship-strip');
  const list = ch && ch.lockShip ? SHIPS.filter((s) => s.id === ch.ship) : unlockedShips();
  if (!list.length) list.push(SHIPS[0]);
  // 저장해 둔 기함이 이 목록에 있으면 그것을, 없으면 현재 선택을 유지하되 목록 밖이면 첫 배로
  const saved = list.find((s) => s.id === SAVE.ship);
  if (saved) G.selectedShip = saved;
  else if (!list.includes(G.selectedShip)) G.selectedShip = list[0];
  strip.innerHTML = list.map((d) => {
    const s = d.stats;
    return `<button type="button" class="ship-chip${d === G.selectedShip ? ' selected' : ''}${d.legend ? ' legend' : ''}" data-id="${d.id}">
      <b>${d.name}</b><small>${d.nation}</small>
      <span class="chip-stats"><i style="--v:${s.speed * 10}%"></i><i style="--v:${s.accel * 10}%"></i><i style="--v:${s.handling * 10}%"></i><i style="--v:${s.durability * 10}%"></i></span>
    </button>`;
  }).join('');
  const info = document.createElement('div');
  info.className = 'ship-info';
  strip.appendChild(info);
  const show = (d) => { info.innerHTML = `<p>${d.desc}</p><p class="ship-special">${d.special}</p>`; showShipPreview(d); };
  show(G.selectedShip);
  for (const b of strip.querySelectorAll('.ship-chip')) {
    const d = SHIPS.find((x) => x.id === b.dataset.id);
    b.addEventListener('click', () => {
      G.selectedShip = d; SAVE.ship = d.id; persist();
      strip.querySelectorAll('.ship-chip').forEach((c) => c.classList.toggle('selected', c === b));
      show(d); audio.pickup();
    });
    b.addEventListener('mouseenter', () => show(d));
    b.addEventListener('mouseleave', () => show(G.selectedShip));
  }
}
$('opt-consorts').addEventListener('change', () => rebuildPeople(null));

// 출항: 캠페인이면 도입 컷씬을 먼저 보여 준다
async function beginChapter() {
  const ch = G.chapter;
  if (G.mode === 'campaign' && ch) {
    await cutscene.show(ch.intro, ch, admiralName(), SEL.admiral);
  }
  startRace();
}

// ---------- 함대 명령 ----------
function orderFleet(id) {
  const F = G.fleet;
  if (!F || !F.size || G.state !== 'racing') return;
  if (!F.command(id)) { audio.hit(0.15); return; }
  G.stats.orders++;
  const O = ORDERS[id];
  hud.event(`${O.icon} ${t('order.' + id)} — ${O.desc}`, 1800);
  hud.comboPop(`${O.icon} ${t('order.' + id)}`, t('order.sub'), '#7bed9f');
  audio.bell?.() || audio.pickup();
  addQuiet(30);
}
for (const btn of document.querySelectorAll('#fleet-orders .order-btn')) {
  btn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); orderFleet(btn.dataset.order); });
}

// ---------- 레이스 준비 ----------
function clearScene() {
  scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
  scene = new THREE.Scene();
}

function resetStorm() {
  // 장에 지정된 폭풍 배수가 있으면 맵 기본값 위에 곱한다
  const sf = 1 / (((G.map && G.map.storm) || 1) * (G.stormMul || 1));
  G.storm = { state: 'calm', level: 0, timer: (22 + Math.random() * 12) * sf, lightning: 0, flash: 0, hitDuring: false, warned: false };
  SEA.storm = 0; SEA.flash = 0;
}

function buildWorld(tod, map = G.map) {
  clearScene();
  G.env = new Environment(scene, tod, 5000, map);
  G.track = new Track(scene, map);
  // 섬 둘레에 얕은 여울을 깐다. 항구 맵은 섬이 없으므로 부두와 방파제를 같은 자리에 넣는다.
  G.env.setShallows(G.track.islands.length ? G.track.islands : G.track.structures);
  G.particles = new Particles(scene);
  G.wakes = new Wakes(scene);
  G.gulls = new Seagulls(scene, new THREE.Vector3(250, 0, 200), 12);
  // 부캉이의 바다에만 사는 것들. 다른 맵에서는 만들지 않는다.
  if (map.wildlife) {
    G.wildlife = new Wildlife(scene, G.track, map.canal);
    G.shark = new Bukhang(scene, G.track);
  } else { G.wildlife = null; G.shark = null; }
  G.projectiles = [];
  G.boats = [];
  hud.mapCache = null;
  resetStorm();
}

function startRace() {
  showScreen(null);
  const ch = G.mode === 'campaign' ? G.chapter : null;
  // 캠페인이면 장의 설정을, 자유 항해면 화면의 옵션을 쓴다
  if (ch) {
    G.map = findMap(ch.map);
    G.laps = ch.laps;
    G.difficulty = ch.id < 3 ? 'easy' : ch.id < 7 ? 'normal' : 'hard';
    if (ch.lockShip && ch.ship) G.selectedShip = SHIPS.find((s) => s.id === ch.ship) || G.selectedShip;
    if (ch.formation) SEL.formation = ch.formation;
  } else {
    G.laps = parseInt($('opt-laps').value, 10);
    G.difficulty = $('opt-difficulty').value;
  }
  let tod = ch ? ch.time : $('opt-time').value;
  if (tod === 'random') tod = ['day', 'sunset', 'night'][Math.floor(Math.random() * 3)];
  G.timeOfDay = tod;
  G.cycle = tod === 'cycle'; G.phase = 0;

  buildWorld(tod);
  G.attract = false;
  G.eventIdx = Math.floor(Math.random() * 4); G.eventTimer = 7; G.learned = { figures: [], discoveries: [], verses: [], memorized: [], events: 0 };
  G.fx = { aurora: 0, elmo: 0, tradeWind: 0, current: 0, doubleScore: 0 };

  const nConsorts = Math.min(MAX_CONSORTS, ch ? (ch.consorts ?? 0) : parseInt($('opt-consorts').value, 10));
  const officers = SEL.officers.slice(0, Math.min(nConsorts, maxOfficerSlots())).filter((id) => id && figureUnlocked(id));
  const nRivals = ch ? ch.rivals : 5;
  const total = 1 + nConsorts + nRivals;

  // 함선 배치: 기함 → 동료함 → 라이벌
  const rivalPool = shuffle(SHIPS.filter((s) => s !== G.selectedShip && !s.aiExclude));
  // 동료함은 기함과 성능이 비슷한 배로 고른다 (너무 느린 배를 붙이면 진형이 무너진다)
  const mySpeed = G.selectedShip.stats.speed;
  const consortPool = SHIPS.filter((s) => !s.aiExclude && !s.legend)
    .sort((a, c) => Math.abs(a.stats.speed - mySpeed) - Math.abs(c.stats.speed - mySpeed));
  const starts = G.track.startPositions(total);
  const diff = difficultyParams(G.difficulty);
  const myName = admiralName();
  const nameOrder = shuffle(AI_NAMES.map((_, i) => i).filter((i) => AI_NAMES[i] !== myName));

  const mkBoat = (def, opts) => {
    const mesh = buildShipMesh(def, { flagColor: opts.flagColor });
    scene.add(mesh);
    mesh.userData.lantern.intensity = (TIME_PRESETS[tod]?.lantern ?? 0) * 30;
    const b = new Boat(def, mesh, opts);
    G.wakes.add(b, opts.isPlayer ? 0xfff0c8 : opts.flagColor === 0x7bed9f ? 0xd8ffe8 : 0xdff2ff);
    G.boats.push(b);
    return b;
  };

  // 기함
  const flag = mkBoat(G.selectedShip, { isPlayer: true, name: myName, color: '#ffe08a', skill: 1, flagColor: 0xffe08a });
  G.player = flag;
  applyOfficerTraits(flag, officers);

  // 동료함: 부제독이 지휘한다
  const consorts = [];
  for (let i = 0; i < nConsorts; i++) {
    const off = officers[i] ? findFigure(officers[i]) : null;
    const def = consortPool[i % consortPool.length];
    const b = mkBoat(def, { name: off ? figName(off) : t('fleet.consortN', { n: i + 1 }), color: '#7bed9f', skill: 0.95, flagColor: 0x7bed9f });
    consorts.push(b);
  }

  // 라이벌
  for (let i = 0; i < nRivals; i++) {
    mkBoat(rivalPool[i % rivalPool.length], { name: pickAiName(nameOrder[i % nameOrder.length]), color: AI_COLORS[i % AI_COLORS.length], skill: diff.skill });
  }

  G.fleet = new Fleet(flag, consorts, officers, SEL.formation, SEL.spacing);
  // 부제독 특성은 동료함에도 같이 적용된다 (조선술은 이미 내구로 반영)
  for (const b of consorts) applyOfficerTraits(b, officers);

  // 출발 배치: 기함과 동료함은 출발 그리드에서 나란히 붙여 두고(그래야 곧장 진형을 잡는다),
  // 라이벌은 남은 자리에 무작위로 넣는다.
  const fleetSize = 1 + consorts.length;
  const base = Math.floor(Math.random() * (total - fleetSize + 1));
  const fleetSlots = Array.from({ length: fleetSize }, (_, i) => base + i);
  const restSlots = shuffle([...Array(total).keys()].filter((i) => !fleetSlots.includes(i)));
  G.boats.forEach((b, i) => {
    const st = starts[i < fleetSize ? fleetSlots[i] : restSlots[i - fleetSize]];
    b.setStart(st.pos, st.heading);
  });

  // 바람 초기화
  G.wind.dir = Math.random() * Math.PI * 2; G.wind.targetDir = G.wind.dir; G.wind.strength = 0.7; G.wind.gust = 0; G.wind.gustTimer = 18 + Math.random() * 10;

  // 맵 전용 음악 (부캉이의 바다에는 전용 테마가 있다)
  audio.setMap(G.map.id);
  G.animalsMet = []; G.animalsNew = [];
  G.tide = { phase: Math.random() * Math.PI * 2, level: 0, high: false };
  G.guide = { stress: 0, led: 0, done: false, slowT: 0 };
  if (G.shark) G.shark.reset(true);
  G.raceTime = 0; G.countdown = 3.6; G.state = 'countdown'; G.camMode = 0; G.finishTimer = 0; G.krakenActive = false; G.lastLapTime = 0;
  G.countStep = 4;
  G.score = 0; G.combo = 0; G.comboTimer = 0; G.stats = freshStats();
  G.mission = freshMission(); G.mission.aliveConsorts = nConsorts;
  G.draft = { t: 0, awarded: false, off: 0 };
  G.overtake = { pending: -1, confirmed: total };
  G.tap = { meter: 0, last: -10, hintT: 0.5, hintOn: false, taps: 0, bursts: 0 };
  G.camOffInit = false;
  G.throttleKeyTime = -1;
  // 장의 폭풍 배수 (없으면 맵 기본값)
  G.stormMul = ch?.storm ?? 1;
  for (const o of G.track.obstacles) o.nearT = -10;
  for (const b of G.boats) b.padCd = 0;
  G.track.setDifficultyProgress(0);
  hud.setRoute(MAP_ROUTES[G.map.id] || WORLD_ROUTE); // 맵마다 다른 지역 지도와 기항지
  hud.resetScoreDisplay();
  hud.setAdmiral(myName, G.selectedShip.name, SEL.admiral);
  hud.setFleet(G.fleet);
  hud.show();
  if (ch) {
    hud.event(`${ch.act} · ${ch.title} — ${goalText(ch)}`, 4500);
    hud.knowledge({ kind: 'event', label: `${MISSION_TYPES[ch.type].icon} ${MISSION_TYPES[ch.type].name}`, date: ch.subtitle, title: ch.title, text: ch.tip || goalText(ch), dur: 8 });
  } else {
    hud.event((LANG === 'en' ? G.map.en : G.map.name) + ' · ' + t('ev.start', { label: t('time.' + tod), laps: G.laps, diff: t('diff.' + G.difficulty) }), 3500);
    hud.knowledge({ kind: 'event', label: t('kc.guide'), date: t('kc.guideDate', { n: G.laps }), title: t('kc.guideTitle'), text: t('kc.guideText'), dur: 8 });
  }
  hud.showPort(0, 0, G.laps, 6000);
  updateMissionHud();
  audio.setMusicVolume(audio.musicOn ? audio.MUSIC_VOL : 0);
  audio.startMusic();
}

// ---------- 미션 진행 ----------
// 화면 왼쪽 위의 목표 카드를 갱신한다
function updateMissionHud() {
  const ch = G.chapter;
  if (!ch || G.mode !== 'campaign') { hud.setMission(null); return; }
  const m = G.mission, g = ch.goal;
  let cur = 0, max = 1, text = '';
  switch (ch.type) {
    case 'pursuit': case 'duel':
      cur = m.hits; max = g.hits; text = `${m.hits} / ${g.hits}`; break;
    case 'treasure':
      cur = m.treasure; max = g.treasure; text = `${m.treasure.toLocaleString('ko-KR')} / ${g.treasure.toLocaleString('ko-KR')}`; break;
    case 'survive':
      cur = Math.min(m.surviveT, g.survive); max = g.survive;
      text = m.survived ? t('mission.surviveDone') : `${Math.ceil(g.survive - m.surviveT)}${t('mission.sec')}`; break;
    case 'escort':
      cur = m.aliveConsorts; max = Math.max(1, G.fleet ? G.fleet.size : 1);
      text = t('mission.alive', { n: m.aliveConsorts, all: G.fleet ? G.fleet.size : 0 }); break;
    case 'guide': {
      // 부캉이가 외해 표지에 얼마나 가까워졌는가
      const sk = G.shark, mk = G.track?.seaMark;
      const far = 900;
      const d = sk && mk ? Math.hypot(sk.x - mk.x, sk.z - mk.z) : far;
      cur = Math.max(0, far - Math.min(far, d)); max = far;
      text = m.guided ? t('pop.guided') : Math.round(Math.min(far, d)) + 'm';
      break;
    }
    default: {
      const tr = G.track;
      cur = tr ? G.player.progress : 0; max = tr ? G.laps * tr.totalLength : 1;
      text = t('mission.rankNow', { r: ordinal(G.player.rank), g: g.rank }); break;
    }
  }
  hud.setMission({ type: ch.type, label: goalText(ch), cur, max, text });
}

// 매 프레임 미션 상태를 갱신하고, 실패가 확정되면 알린다
function updateMission(dt) {
  const ch = G.chapter, m = G.mission;
  if (!ch || G.mode !== 'campaign' || !m) return;
  m.time = G.raceTime;
  m.rank = G.player.rank;
  m.aliveConsorts = G.fleet ? G.fleet.alive.length : 0;
  if (ch.type === 'survive' && !m.survived) {
    m.surviveT += dt;
    if (m.surviveT >= ch.goal.survive) {
      m.survived = true;
      hud.comboPop(t('mission.surviveClear'), t('mission.nowFinish'), '#7bed9f');
      award(400, t('mission.survived'), '#7bed9f', () => audio.perfect());
    }
  }
  // 호위 실패: 지켜야 할 수 아래로 떨어지면 즉시 실패
  if (ch.type === 'escort' && ch.goal.alive != null && m.aliveConsorts < ch.goal.alive && !m.failed) {
    m.failed = true; m.failReason = t('mission.failEscort');
    hud.centerMsg(t('mission.failed'), '#ff6b6b');
    hud.event(m.failReason, 3000);
    G.state = 'finished'; G.finishTimer = 2.4;
  }
  // 결투 제한 시간
  if (ch.type === 'duel' && ch.sGoal?.time && m.hits < ch.goal.hits && G.raceTime > ch.sGoal.time * 1.6 && !m.failed) {
    m.failed = true; m.failReason = t('mission.failTime');
    G.state = 'finished'; G.finishTimer = 2.4;
  }
  updateMissionHud();
}

// 포격이 라이벌에 명중했을 때 추격/결투 진행
function missionHit() {
  const ch = G.chapter, m = G.mission;
  if (!ch || G.mode !== 'campaign' || !m) return;
  if (ch.type !== 'pursuit' && ch.type !== 'duel') return;
  m.hits++;
  updateMissionHud();
  if (m.hits === ch.goal.hits) {
    hud.comboPop(t('mission.hitsClear'), t('mission.goalDone'), '#ffd54f');
    award(500, t('mission.goalDone'), '#ffd54f', () => audio.perfect());
    // 목표를 채웠으면 굳이 완주하지 않아도 된다 — 잠시 뒤 결과로
    if (!G.player.finished) { G.state = 'finished'; G.finishTimer = 3.2; m.finished = true; }
  }
}

// 보물/금화를 거뒀을 때
function missionTreasure(points) {
  const m = G.mission;
  if (!m || G.mode !== 'campaign' || G.chapter?.type !== 'treasure') return;
  m.treasure += points;
  updateMissionHud();
}

function endRace() {
  G.state = 'select'; hud.hide(); audio.setSpeed(0, false); resetStorm();
  G.fleet = null; G.mission = null;
  if (G.env) { G.env.setStorm(0, 0); G.env.setAurora(0); }
}

// 타이틀/선택 화면 뒤에서 AI 함선들이 항해하는 배경 장면
function startAttract() {
  const tod = ['day', 'sunset', 'night'][Math.floor(Math.random() * 3)];
  G.fleet = null; G.mission = null; G.stormMul = 1;
  buildWorld(tod, MAPS[Math.floor(Math.random() * MAPS.length)]);
  const starts = G.track.startPositions(6);
  const lineup = shuffle(SHIPS.filter((s) => !s.aiExclude)).slice(0, 4);
  lineup.forEach((def, i) => {
    const mesh = buildShipMesh(def);
    scene.add(mesh);
    const boat = new Boat(def, mesh, { name: def.name, color: AI_COLORS[i], skill: 0.9 });
    G.wakes.add(boat);
    boat.setStart(starts[i].pos, starts[i].heading);
    mesh.userData.lantern.intensity = TIME_PRESETS[tod].lantern * 30;
    G.boats.push(boat);
  });
  G.player = G.boats[0];
  G.wind.dir = Math.random() * Math.PI * 2; G.wind.targetDir = G.wind.dir;
  G.attract = true;
}

function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ---------- SHIFT 연타 가속 ----------
// 연타: 누를 때마다 게이지가 크게 참 → 가득 차면 급가속 버스트. 꾹: 천천히 차며 기존 전속 항해.
function onShiftTap() {
  const T = G.tap, p = G.player;
  if (!p || p.finished) return;
  const quick = G.t - T.last < 0.45; // 리듬 있게 연타하면 보너스
  T.last = G.t; T.taps++;
  T.meter = Math.min(1.2, T.meter + (quick ? 0.16 : 0.1));
  audio.coin(Math.floor(T.meter * 10));
  if (T.meter >= 1) {
    T.meter = 0; T.bursts++;
    p.turbo = Math.max(p.turbo, 2.2);
    G.camShake = Math.max(G.camShake, 0.3);
    addQuiet(40);
    hud.comboPop(t('pop.tapBurst'), t('pop.tapSub'), '#ffb347');
    audio.boost();
    const f = p.forward();
    G.particles.burst(p.pos.x - f.x * p.phys.radius, 1, p.pos.z - f.z * p.phys.radius, 30, { speed: 8, up: 6, life: 0.8, size: 4, color: 0xffb347, grav: -6 });
  }
}
function updateTap(dt) {
  const T = G.tap, p = G.player, k = G.keys;
  if (G.state !== 'racing' || p.finished) { p.rowMul = 1; hud.setTap(0, false); return; }
  const held = !!(k.ShiftLeft || k.ShiftRight || VK.boost || PTR.boost);
  if (held && G.t - T.last > 0.35) T.meter = Math.min(1, T.meter + dt * 0.12); // 꾹: 천천히
  else if (!held && G.t - T.last > 0.5) T.meter = Math.max(0, T.meter - dt * 0.3); // 놓으면 서서히 감소
  p.rowMul = 1 + T.meter * 0.22;
  // 안내: 레이스 시작 후 12초, 이후 45초마다 4초씩
  T.hintT -= dt;
  if (T.hintT <= 0) { T.hintOn = !T.hintOn; T.hintT = T.hintOn ? (G.raceTime < 15 ? 12 : 4) : 45; }
  hud.setTap(T.meter, T.hintOn);
}

// ---------- 역방향 감지 ----------
function updateWrongWay(dt) {
  const p = G.player;
  if (G.state !== 'racing' || p.finished) { G.wrongT = 0; hud.setWrongWay(false); return; }
  const tng = G.track.tangentAt(p.curveIdx);
  const dot = Math.sin(p.heading) * tng.x + Math.cos(p.heading) * tng.z;
  G.wrongT = (dot < -0.3 && p.speed > 5) ? (G.wrongT || 0) + dt : 0;
  hud.setWrongWay(G.wrongT > 0.6);
}

// ---------- 점수 / 콤보 ----------
function award(points, label, color, sound) {
  if (G.state !== 'racing') return;
  G.combo += 1; G.comboTimer = COMBO_WINDOW;
  const mult = Math.min(G.combo, 10) * (G.fx.doubleScore > 0 ? 2 : 1);
  const got = Math.round(points * mult * (G.player?.tr.score ?? 1));
  G.score += got;
  G.stats.maxCombo = Math.max(G.stats.maxCombo, G.combo);
  hud.comboPop(label, `+${got.toLocaleString('ko-KR')}` + (mult > 1 ? ` (×${mult})` : ''), color);
  if (sound) sound(); else audio.combo(G.combo);
}
function addQuiet(points) { const mult = Math.min(Math.max(1, G.combo), 10); G.score += Math.round(points * mult * (G.player?.tr.score ?? 1)); }
function breakCombo() {
  if (G.combo >= 2) { hud.comboBreak(); hud.event(t('ev.comboBreak', { n: G.combo }), 1200); }
  G.combo = 0; G.comboTimer = 0;
}

// ---------- 레이스 진행 ----------
function updateWind(dt) {
  const w = G.wind;
  w.gustTimer -= dt;
  if (w.gustTimer <= 0) {
    w.gustTimer = 20 + Math.random() * 15;
    w.gust = 6;
    w.targetDir += (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.9);
    if (G.state === 'racing') hud.event(t('ev.gust'), 3000);
  }
  if (w.gust > 0) w.gust -= dt;
  w.targetDir += (Math.random() - 0.5) * 0.02 * dt;
  if (G.fx.tradeWind > 0 && G.player) w.targetDir = G.player.heading; // 무역풍: 내 진행 방향의 순풍
  let d = w.targetDir - w.dir; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
  w.dir += d * Math.min(1, dt * 0.5);
  const base = 0.62 + Math.sin(G.t * 0.11) * 0.15 + G.storm.level * 0.5 + (G.fx.tradeWind > 0 ? 0.35 : 0);
  w.strength += ((w.gust > 0 ? base + 0.45 : base) - w.strength) * Math.min(1, dt * 0.8);
}

// ---------- 폭풍 ----------
function updateStorm(dt) {
  const S = G.storm;
  const racing = G.state === 'racing' || G.state === 'finished';
  S.timer -= dt;
  if (S.state === 'calm') {
    if (racing && S.timer <= 0) { S.state = 'warn'; S.timer = 3.2; hud.setStorm(0, 0, true); hud.event(t('ev.stormWarn'), 3000); audio.stormWarn(); }
  } else if (S.state === 'warn') {
    if (S.timer <= 0) { S.state = 'rising'; S.timer = 3; hud.setStorm(0, 0, false); S.hitDuring = false; S.lightning = 1.5; }
  } else if (S.state === 'rising') {
    S.level = Math.min(1, S.level + dt / 3);
    if (S.timer <= 0) { S.state = 'active'; S.timer = 11 + Math.random() * 5; hud.event(t('ev.stormIn'), 2500); }
  } else if (S.state === 'active') {
    S.level = 1;
    if (S.timer <= 0 || !racing) { S.state = 'fading'; S.timer = 4; }
  } else if (S.state === 'fading') {
    S.level = Math.max(0, S.level - dt / 4);
    if (S.level <= 0) {
      S.state = 'calm'; S.timer = (30 + Math.random() * 20) / (((G.map && G.map.storm) || 1) * (G.stormMul || 1));
      if (racing && G.state === 'racing') {
        G.stats.storms++;
        if (!S.hitDuring) award(250, t('pop.storm'), '#8fd4ff', () => audio.perfect());
        else hud.event(t('ev.stormOut'), 2000);
      }
    }
  }
  // 번개
  S.flash = Math.max(0, S.flash - dt * 6);
  if (S.level > 0.5 && racing) {
    S.lightning -= dt;
    if (S.lightning <= 0) {
      S.lightning = 1.8 + Math.random() * 3.5;
      S.flash = 1;
      G.camShake = Math.max(G.camShake, 0.45);
      setTimeout(() => audio.thunder(), 250 + Math.random() * 600);
    }
  }
  SEA.storm = S.level; SEA.flash = S.flash;
  G.env.setStorm(S.level, S.flash);
  hud.setStorm(S.level, S.flash, S.state === 'warn');
  // ----- 폭풍 연출 -----
  if (S.level > 0.05) {
    const f = _f; camera.getWorldDirection(f);
    const wx = Math.sin(G.wind.dir), wz = Math.cos(G.wind.dir);
    const gust = 1 + Math.sin(G.t * 1.7) * 0.35 + Math.sin(G.t * 0.43) * 0.25; // 돌풍이 몰아쳤다 잦아든다
    // 비: 바람에 비스듬히 날리는 가는 빗줄기. 얇고 많아야 비처럼 보인다.
    const rain = Math.floor(S.level * 64 * gust);
    for (let i = 0; i < rain; i++) {
      const x = camera.position.x + f.x * (14 + Math.random() * 75) + (Math.random() - 0.5) * 120;
      const z = camera.position.z + f.z * (14 + Math.random() * 75) + (Math.random() - 0.5) * 120;
      G.particles.spawn(x, camera.position.y + 14 + Math.random() * 30, z,
        wx * 34 * gust, -98, wz * 34 * gust, 0.45, 0.8 + Math.random() * 0.5, 0xcfe8ff, -1);
    }
    // 물보라: 파도 마루에서 바람에 찢겨 수평으로 날아가는 잔 물안개.
    // 카메라 바로 앞에서 터지면 덩어리로 뭉쳐 시야를 가리므로 조금 떨어진 곳에만 띄운다.
    const spray = Math.floor(S.level * 11 * gust);
    for (let i = 0; i < spray; i++) {
      const a = Math.random() * Math.PI * 2, r = 28 + Math.random() * 60;
      const x = camera.position.x + Math.cos(a) * r, z = camera.position.z + Math.sin(a) * r;
      const h = waveHeight(x, z, G.t);
      if (h < 1.2) continue; // 마루에서만
      G.particles.spawn(x, h + 0.4, z,
        wx * (24 + Math.random() * 18) * gust, 1.5 + Math.random() * 3.5, wz * (24 + Math.random() * 18) * gust,
        0.75 + Math.random() * 0.4, 1.5 + Math.random() * 1.4, 0xe8f4ff, 4);
    }
    // 뱃머리가 파도를 때릴 때 튀는 물기둥
    const p = G.player;
    if (p && Math.abs(p.speed) > 12 && Math.random() < S.level * 0.35) {
      const fw = p.forward();
      const bx = p.pos.x + fw.x * p.phys.radius, bz = p.pos.z + fw.z * p.phys.radius;
      G.particles.burst(bx, waveHeight(bx, bz, G.t) + 1, bz, Math.floor(5 + S.level * 9),
        { speed: 6 + S.level * 8, up: 8 + S.level * 9, life: 0.9, size: 2.6, color: 0xffffff, grav: -13, spread: 2 });
    }
    // 배가 파도에 흔들리는 만큼 화면도 흔들린다
    G.camShake = Math.max(G.camShake, S.level * 0.22 * gust);
  }
}

// ---------- 역사 학습: 연대기, 인물, 발견 ----------
function updateChronicle(dt) {
  if (G.state !== 'racing') return;
  G.eventTimer -= dt;
  if (G.eventTimer <= 0) {
    const e = EVENTS[G.eventIdx % EVENTS.length]; G.eventIdx++; G.learned.events++;
    hud.knowledge({ kind: 'event', label: t('kc.event'), date: e.date, title: e.title, text: e.text, dur: 7.5 });
    G.eventTimer = 10.5;
  }
}
function pickUnseen(list, seen) {
  const cand = list.filter((x) => !seen.includes(x.name));
  const pool = cand.length ? cand : list;
  return pool[Math.floor(Math.random() * pool.length)];
}
function foundFigure() {
  const f = pickUnseen(HIST_FIGURES, G.learned.figures);
  G.learned.figures.push(f.name);
  markSeen('figure', f.name);
  hud.knowledge({ kind: 'figure', label: t('kc.figure'), date: f.years, title: f.name, text: f.text, dur: 9 }, true);
  award(150, t('pop.figure'), '#ffe08a', () => audio.treasure());
}
function foundDiscovery() {
  const d = pickUnseen(DISCOVERIES, G.learned.discoveries);
  G.learned.discoveries.push(d.name);
  markSeen('discovery', d.name);
  const eff = t('eff.' + d.effect);
  hud.knowledge({ kind: 'discovery', label: t('kc.discovery', { kind: d.kind }), date: eff, title: d.name, text: d.text, dur: 9 }, true);
  const F = G.fx, p = G.player;
  if (d.effect === 'aurora') F.aurora = 25;
  else if (d.effect === 'elmo') F.elmo = 12;
  else if (d.effect === 'tradewind') F.tradeWind = 12;
  else if (d.effect === 'current') F.current = 10;
  else if (d.effect === 'citrus') p.boost = 1;
  else if (d.effect === 'bonus') F.doubleScore = 15;
  award(150, `🔮 ${d.name}!`, d.color, () => audio.perfect());
}
// ---------- 말씀 ----------
// 같은 구절을 여러 번 만나며 자연스럽게 외워지도록,
// 만난 횟수에 따라 본문에 빈칸을 늘려 가며 보여 주고 잠시 뒤 채워 준다.
function pickVerse() {
  // 이번 항해에서 아직 안 만난 것 중, 덜 만난 구절을 먼저 (고르게 반복되도록)
  const fresh = VERSES.filter((v) => !G.learned.verses.includes(v.id));
  const pool = fresh.length ? fresh : VERSES;
  let best = pool[0], bestN = Infinity;
  for (const v of pool) {
    const n = SAVE.verses[v.id] || 0;
    if (n < bestN) { bestN = n; best = v; }
  }
  return best;
}

function foundVerse() {
  const v = pickVerse();
  const count = meetVerse(v.id);          // 저장본의 만난 횟수를 올린다
  const seenBefore = count - 1;
  const st = stageOf(seenBefore);
  const body = LANG === 'en' ? v.en : v.ko;
  const ref = LANG === 'en' ? v.refEn : v.ref;
  G.learned.verses.push(v.id);
  const memorized = count >= MEMORIZED_AT;
  if (memorized && seenBefore < MEMORIZED_AT) G.learned.memorized.push(v.id);

  let card;
  if (st.kind === 'first') {
    card = { kind: 'verse', label: t('kc.verse'), date: ref, title: t('kc.verseFirst'), text: body, dur: 11 };
  } else if (st.kind === 'recite') {
    // 암송 단계: 장절만 먼저 띄우고 곧 본문을 보여 준다 — 스스로 떠올려 볼 틈을 준다
    card = { kind: 'verse', label: t('kc.verseMemo'), date: ref, title: t('kc.verseRecite'),
             text: '…', reveal: body, revealAt: 2.6, dur: 11 };
  } else {
    const { masked, filled } = blankOut(body, st.blanks);
    card = { kind: 'verse', label: t('kc.verse', { n: count }), date: ref, title: t('kc.verseFill'),
             text: masked, reveal: filled, revealAt: 3.2, dur: 12 };
  }
  hud.knowledge(card, true);
  award(memorized ? 300 : 180, memorized ? t('pop.verseMemo') : t('pop.verse'), '#ffe9a8',
    () => { audio.treasure(); if (memorized) audio.perfect(); });
  if (memorized) hud.event(t('ev.verseMemo', { ref }), 2600);
}

const _elmoLight = new THREE.PointLight(0x7fd4ff, 0, 40);
function updateEffects(dt) {
  const F = G.fx, p = G.player;
  for (const k of Object.keys(F)) if (F[k] > 0) F[k] -= dt;
  // 오로라: 서서히 켜지고 꺼짐
  let auroraT = Math.max(0, Math.min(1, F.aurora / 3, (25 - F.aurora) / 3));
  if (G.map && G.map.aurora) auroraT = Math.max(auroraT, Math.max(0, (G.phase - 0.55) * 1.6) * 0.7); // 극지 맵: 밤이면 오로라
  G.env.setAurora(auroraT);
  // 세인트 엘모의 불: 돛대 끝 푸른 빛 + 불꽃 입자
  if (F.elmo > 0) {
    if (!_elmoLight.parent) { p.mesh.userData.inner.add(_elmoLight); }
    const fl = p.mesh.userData.flag; _elmoLight.position.copy(fl.position); _elmoLight.intensity = 30 + Math.random() * 20;
    if (Math.random() < 0.6) {
      const wp = fl.getWorldPosition(_f);
      G.particles.spawn(wp.x + (Math.random() - 0.5), wp.y + 0.5, wp.z + (Math.random() - 0.5), (Math.random() - 0.5) * 2, 1 + Math.random() * 2, (Math.random() - 0.5) * 2, 0.5, 2.5, 0x9fe4ff, 0);
    }
  } else if (_elmoLight.parent) { _elmoLight.parent.remove(_elmoLight); _elmoLight.intensity = 0; }
  // 해류: 진행 방향으로 밀어줌 + 물결 입자
  if (F.current > 0 && !p.finished) {
    p.draftMul = Math.max(p.draftMul, 1.22);
    if (Math.random() < 0.7) { const f = p.forward(); G.particles.spawn(p.pos.x + (Math.random() - 0.5) * 20, 0.6, p.pos.z + (Math.random() - 0.5) * 20, f.x * 30, 0, f.z * 30, 0.6, 2, 0x5cc8ff, 0); }
  }
  // 장애물 점진 등장: 레이스 진행률에 따라 하나씩
  if (G.state === 'racing' && G.track) {
    const frac = Math.max(0, Math.min(1, p.progress / (G.laps * G.track.totalLength)));
    const added = G.track.setDifficultyProgress(frac);
    if (added.includes('kraken')) hud.event(t('ev.newKraken'), 3000);
    else if (added.includes('whirl')) hud.event(t('ev.newWhirl'), 2500);
    else if (added.includes('rock') && Math.random() < 0.5) hud.event(t('ev.newRock'), 1800);
  }
  // 낮 → 밤 진행
  if (G.cycle && G.track) {
    const target = Math.max(0, Math.min(1, p.progress / (G.laps * G.track.totalLength)));
    G.phase += (target - G.phase) * Math.min(1, dt * 0.5);
    const lantern = G.env.setPhase(G.phase);
    for (const b of G.boats) b.mesh.userData.lantern.intensity = lantern * 30;
  }
}

// 트랙마스터의 항로 유지 장치.
// 항로 가장자리에 다가가면 유도 암이 부표선을 읽어 배를 안쪽으로 밀고 뱃머리를 항로 방향으로 되돌린다.
// 조타를 완전히 빼앗지는 않는다 — 가장자리에서만, 벗어난 만큼만 개입한다.
function applyTrackLock(b, dt) {
  const tr = G.track;
  if (!tr || b.airborne || b.loop) return;
  const { dist, idx } = tr.distToCurve(b.pos.x, b.pos.z, b.curveIdx);
  // 이 배는 애초에 '항로 이탈' 상태가 되지 않는다
  b.offCourse = false; b.offDist = 0;
  const edge = TRACK_HALF_WIDTH * 0.55;   // 여기부터 유도 암이 개입한다
  const limit = TRACK_HALF_WIDTH * 0.96;  // 여기를 넘어가지는 못한다
  b.lockOn = 0;
  if (dist <= edge) return;
  const c = tr.pointAt(idx), n = tr.normalAt(idx);
  const side = ((b.pos.x - c.x) * n.x + (b.pos.z - c.z) * n.z) >= 0 ? 1 : -1;
  const over = Math.min(1.6, (dist - edge) / (limit - edge));
  b.lockOn = over;
  // 안쪽으로 밀기 (속도가 빠를수록 세게 — 안 그러면 고속에서 밀려 나간다)
  const push = (34 + Math.abs(b.speed) * 0.5) * over;
  b.slide.x -= n.x * side * push * dt;
  b.slide.z -= n.z * side * push * dt;
  // 뱃머리를 항로 방향으로 되돌리기
  const tg = tr.tangentAt(idx);
  let d = Math.atan2(tg.x, tg.z) - b.heading;
  while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
  b.heading += d * Math.min(1, over * 3.0 * dt);
  // 마지막 방어선: 항로 밖으로는 아예 나가지 못하게 위치를 되돌린다
  if (dist > limit) {
    const ux = (b.pos.x - c.x) / dist, uz = (b.pos.z - c.z) / dist;
    const back = dist - limit;
    b.pos.x -= ux * back; b.pos.z -= uz * back;
    b.lockOn = 1;
  }
  // 유도 레일이 작동하는 것을 눈으로 보이게
  if (b.isPlayer && Math.random() < over * 0.8) {
    G.particles.spawn(b.pos.x - n.x * side * 2, 1.2, b.pos.z - n.z * side * 2,
      -n.x * side * 14, 2, -n.z * side * 14, 0.45, 2.2, 0x2ee6a8, 0);
  }
}

function updateProgress(boat) {
  const tr = G.track;
  const { dist, idx } = tr.distToCurve(boat.pos.x, boat.pos.z, boat.curveIdx);
  boat.curveIdx = idx;
  boat.offDist = Math.max(0, dist - TRACK_HALF_WIDTH);
  // 가드레일: 로프 밖으로 나가면 안쪽으로 밀어 넣는다 (부드러운 벽)
  if (boat.railCd > 0) boat.railCd -= 1 / 60;
  if (dist > GUARD_OFFSET - 2 && dist < 400) {
    const c = tr.pointAt(idx);
    const dx = (boat.pos.x - c.x) / dist, dz = (boat.pos.z - c.z) / dist;
    const over = dist - (GUARD_OFFSET - 2);
    boat.pos.x -= dx * over; boat.pos.z -= dz * over;
    // 레일을 따라 미끄러지되 안쪽으로 튕김
    const inward = 14 + Math.min(20, over * 3);
    boat.slide.x -= dx * inward; boat.slide.z -= dz * inward;
    if (!(boat.railCd > 0)) {
      boat.railCd = 1.2;
      boat.speed *= 0.82;
      const tg = tr.tangentAt(idx);
      boat.heading += (Math.atan2(tg.x, tg.z) - boat.heading) * 0.25;
      G.particles.burst(boat.pos.x, 0.8, boat.pos.z, 18, { speed: 5, up: 6, life: 0.8, size: 3, color: 0xffffff });
      if (boat.isPlayer) { audio.hit(0.35); G.camShake = Math.max(G.camShake, 0.25); hud.event(t('ev.rail'), 1200); }
    }
    boat.offCourse = false; boat.offDist = 0;
    return updateProgressCore(boat, idx, dist);
  }
  const wasOff = boat.offCourse;
  boat.offCourse = dist > TRACK_HALF_WIDTH + 22;
  if (boat.isPlayer && boat.offCourse && !wasOff) { hud.event(t('ev.offcourse'), 2000); breakCombo(); }
  return updateProgressCore(boat, idx, dist);
}
function updateProgressCore(boat, idx, dist) {
  const tr = G.track;
  if (boat.finished) return;
  // 체크포인트
  const N = tr.sampleCount;
  const cpIdx = tr.checkpoints[boat.nextCp];
  const passed = ((idx - cpIdx) % N + N) % N;
  if (passed < 60 && dist < TRACK_HALF_WIDTH * 3) {
    const reached = boat.nextCp;
    boat.nextCp = (boat.nextCp + 1) % CHECKPOINT_COUNT;
    if (boat.nextCp === 1) {
      // 출발선 통과 = 랩 완료
      boat.lap++;
      if (boat.isPlayer) {
        if (boat.lap >= G.laps) finishBoat(boat);
        else {
          const lapT = G.raceTime - G.lastLapTime; G.lastLapTime = G.raceTime;
          G.stats.bestLap = Math.min(G.stats.bestLap, lapT);
          hud.centerMsg(boat.lap === G.laps - 1 ? t('center.final') : t('center.lap', { n: boat.lap + 1 }), boat.lap === G.laps - 1 ? '#ff8b6b' : '#ffe08a');
          award(500, t('pop.lap'), '#ffe08a', () => audio.lap());
          setTimeout(() => { if (G.state === 'racing') hud.event(`📜 ${TRIVIA[Math.floor(Math.random() * TRIVIA.length)]}`, 6000); }, 1200);
          hud.showPort(0, boat.lap, G.laps);
        }
      } else if (boat.lap >= G.laps) finishBoat(boat);
    } else if (boat.isPlayer && G.state === 'racing') {
      // 기항지 도착: 우측 상단 세계지도 + 역사 해설
      hud.showPort(reached, boat.lap, G.laps);
      addQuiet(40);
    }
  }
  let cum = tr.cum[idx];
  if (boat.nextCp !== 0) { const cpCum = tr.cum[tr.checkpoints[boat.nextCp]]; if (cum > cpCum + 250) cum = cpCum; }
  boat.progress = boat.lap * tr.totalLength + cum;
}

function finishBoat(boat) {
  boat.finished = true; boat.finishTime = G.raceTime;
  if (boat.isPlayer) {
    G.state = 'finished'; G.finishTimer = 3.0;
    if (G.mission) { G.mission.finished = true; G.mission.time = G.raceTime; G.mission.rank = boat.rank; }
    const r = boat.rank;
    G.stats.rankPts = [0, 3000, 2000, 1200, 700, 400, 200][r] || 0;
    G.score += G.stats.rankPts;
    hud.centerMsg(r === 1 ? t('center.win') : t('center.rank', { r: ordinal(r) }), r === 1 ? '#ffe08a' : '#fff3d6');
    hud.setDraft(false, false); hud.setSpeedLines(0);
    audio.finish(r === 1); audio.bell();
    G.particles.burst(boat.pos.x, 6, boat.pos.z, 200, { speed: 20, up: 25, life: 2.2, size: 5, color: r === 1 ? 0xffe08a : 0x8fd4ff, grav: -10, spread: 10 });
  } else if (G.state === 'racing') {
    hud.event(t('ev.finished', { name: boat.name, ship: boat.def.name }), 2000);
  }
}

function updateRanks() {
  const sorted = [...G.boats].sort((a, b) => {
    if (a.finished && b.finished) return a.finishTime - b.finishTime;
    if (a.finished) return -1; if (b.finished) return 1;
    return b.progress - a.progress;
  });
  const prevRank = G.player.rank;
  sorted.forEach((b, i) => { b.rank = i + 1; });
  const p = G.player, O = G.overtake;
  if (G.state === 'racing' && G.raceTime > 4) {
    if (p.rank < prevRank && O.pending < 0) O.pending = 1.2; // 추월 후보: 1.2초 동안 순위를 지키면 인정
    if (p.rank > prevRank) {
      if (O.pending >= 0) O.pending = -1; // 바로 되추월당함 → 취소
      else if (p.rank > O.confirmed) hud.event(t('ev.overtaken', { r: ordinal(p.rank) }), 1500);
      O.confirmed = Math.max(O.confirmed, p.rank);
    }
  }
}
function updateOvertake(dt) {
  const p = G.player, O = G.overtake;
  if (O.pending >= 0) {
    O.pending -= dt;
    if (O.pending < 0) {
      if (p.rank < O.confirmed) {
        G.stats.overtakes++;
        award(200, p.rank === 1 ? t('pop.lead') : t('pop.overtake'), '#7bed9f', () => audio.overtake());
      }
      O.confirmed = p.rank; O.pending = -1;
    }
  }
}

// 동료함 피해. 내구가 다하면 대파하고, 호위 미션이면 실패로 이어질 수 있다.
function damageConsort(b, amount, reason) {
  const F = G.fleet;
  if (!F || G.state !== 'racing' && G.state !== 'finished') return;
  const sunk = F.damage(b, amount);
  audio.hit(0.5);
  G.particles.burst(b.pos.x, 2, b.pos.z, sunk ? 90 : 25, { speed: sunk ? 10 : 5, up: sunk ? 12 : 6, life: 1.2, size: 4, color: sunk ? 0x555555 : 0xff9800, grav: sunk ? 1 : -4 });
  if (sunk) {
    // 대파: 돛을 내리고 항로에 남는다
    for (const s of b.mesh.userData.sails) s.visible = false;
    b.mesh.userData.fire.visible = false;
    b.color = '#7a7a7a';
    hud.centerMsg(t('fleet.sunk', { name: b.name }), '#ff6b6b');
    hud.event(t('fleet.sunkMsg', { name: b.name, why: reason }), 3000);
    audio.kraken?.(); G.camShake = Math.max(G.camShake, 0.6);
    breakCombo();
  } else if (b.pos.distanceTo(G.player.pos) < 160) {
    hud.event(t('fleet.damaged', { name: b.name, why: reason, hp: Math.round((b.consort.hp / b.consort.maxHp) * 100) }), 1600);
  }
}

function handleCollisions(dt) {
  const tr = G.track;
  for (const b of G.boats) {
    const R = b.phys.radius * 0.6;
    const fast = Math.abs(b.speed) > b.phys.maxSpeed * 0.55;
    // 장애물
    for (const o of tr.obstacles) {
      if (o.active === false || b.airborne || b.loop) continue;
      const dx = b.pos.x - o.x, dz = b.pos.z - o.z; const d = Math.hypot(dx, dz);
      if (d < o.r + R) {
        const nx = dx / (d || 1), nz = dz / (d || 1);
        b.pos.x = o.x + nx * (o.r + R + 0.5); b.pos.z = o.z + nz * (o.r + R + 0.5);
        const strength = o.type === 'rock' ? 0.8 : 1.1;
        const spd = Math.abs(b.speed);
        b.hitObstacle(nx, nz, strength);
        G.particles.burst(b.pos.x - nx * R, 1, b.pos.z - nz * R, 25, { speed: 6, up: 8, life: 0.9, size: 3, color: 0xffffff });
        if (b.isPlayer) { audio.hit(Math.min(1, spd / 30)); hud.hitFlash(); G.camShake = 0.6; hud.event(o.type === 'rock' ? t('ev.rock') : o.type === 'structure' ? t('ev.structure') : t('ev.island'), 1500); breakCombo(); G.storm.hitDuring = true; o.nearT = G.t; if (G.mission) G.mission.crashes++; }
        else if (b.consort) { damageConsort(b, 0.22 * Math.min(1.6, spd / 22), o.type === 'rock' ? t('fleet.hitRock') : t('fleet.hitIsland')); }
        else if (b.pos.distanceTo(G.player.pos) < 120) audio.hit(0.4);
      } else if (b.isPlayer && fast && d < o.r + R + 9 && G.t - (o.nearT ?? -10) > 3 && G.state === 'racing') {
        // 니어미스: 빠른 속도로 스치듯 통과
        o.nearT = G.t; G.stats.nearMiss++;
        award(100, t('pop.near'), '#ff9a3c', () => { audio.whoosh(); audio.combo(G.combo); });
        G.camShake = Math.max(G.camShake, 0.15);
      }
    }
    // 소용돌이
    for (const w of tr.whirlpools) {
      if (w.active === false || b.airborne || b.loop) continue;
      const dx = w.x - b.pos.x, dz = w.z - b.pos.z; const d = Math.hypot(dx, dz);
      if (d < w.r + 6 && b.whirlImmune <= 0 && !b.def.whirlImmune) {
        if (b.whirl <= 0 && b.isPlayer) { hud.event(t('ev.whirl'), 1800); audio.whirl(); G.camShake = 0.3; breakCombo(); }
        b.whirl = 0.3; b.whirlTime += dt;
        const pull = (0.4 + (1 - d / (w.r + 6)) * 0.6) * 26;
        b.slide.x += (dx / (d || 1)) * pull * dt; b.slide.z += (dz / (d || 1)) * pull * dt;
        b.spin = (Math.PI * 2) / 2.2; // 2.2초 동안 딱 한 바퀴 (어지러운 정도)
        if (b.whirlTime > 2.2) {
          const tg = G.track.tangentAt(b.curveIdx + 20);
          b.slide.x += tg.x * 45 - (dx / (d || 1)) * 30; b.slide.z += tg.z * 45 - (dz / (d || 1)) * 30;
          b.whirlImmune = 3; b.whirl = 0; b.whirlTime = 0;
          // 방향을 확 바꾸지 않고, 남은 각도만큼 짧게 돌아 항로 방향으로 정렬
          let dA = Math.atan2(tg.x, tg.z) - b.heading; while (dA > Math.PI) dA -= Math.PI * 2; while (dA < -Math.PI) dA += Math.PI * 2;
          b.spin = dA * 2.5;
          G.particles.burst(b.pos.x, 1, b.pos.z, 40, { speed: 10, up: 12, life: 1.2, size: 4, color: 0xdff6ff });
          if (b.isPlayer) { hud.event(t('ev.whirlOut'), 1500); audio.splash(); G.camShake = 0.5; }
        }
      } else if (b.isPlayer && fast && d < w.r + 14 && G.t - (w.nearT ?? -10) > 4 && G.state === 'racing') {
        w.nearT = G.t; G.stats.nearMiss++;
        award(120, t('pop.whirlNear'), '#8fd4ff', () => { audio.whoosh(); audio.combo(G.combo); });
      }
    }
    // 보급 통 (망루 부제독이 있으면 반경이 넓어진다)
    const pickR = (b.def.pickupRadius ?? 1) * b.tr.pickup;
    for (const p of tr.pickups) {
      if (!p.active) continue;
      if (Math.hypot(p.x - b.pos.x, p.z - b.pos.z) < (p.r + R * 0.6) * pickR) {
        tr.collectPickup(p);
        b.boost = Math.min(1, b.boost + 0.35 * (b.def.pickupBonus ?? 1));
        G.particles.burst(p.x, 2, p.z, 30, { speed: 5, up: 7, life: 1.0, size: 3, color: 0xffe08a, grav: -6 });
        b.turbo = Math.max(b.turbo, 1.6);
        if (b.isPlayer) { audio.boost(); addQuiet(50); hud.event(t('ev.supply'), 1500); G.camShake = Math.max(G.camShake, 0.2); }
        // 동료함이 주우면 보급을 기함에 넘긴다
        else if (b.consort && !b.consort.sunk && G.state === 'racing') {
          G.player.boost = Math.min(1, G.player.boost + 0.2);
          addQuiet(50); audio.coin(3);
          hud.event(t('fleet.gotSupply', { name: b.name }), 1200);
        }
      }
    }
    // 부스터 패드 (모든 배)
    if (b.padCd > 0) b.padCd -= dt;
    for (const pad of tr.boostPads) {
      if (b.padCd > 0) break;
      if (Math.hypot(pad.x - b.pos.x, pad.z - b.pos.z) < pad.r + R * 0.4) {
        b.turbo = Math.max(b.turbo, 3); b.padCd = 4;
        const f = b.forward();
        G.particles.burst(b.pos.x - f.x * R, 1, b.pos.z - f.z * R, 30, { speed: 8, up: 6, life: 0.8, size: 4, color: 0xff9a3c, grav: -6 });
        if (b.isPlayer && G.state === 'racing') { award(80, t('pop.pad'), '#ff9a3c', () => audio.boost()); G.camShake = Math.max(G.camShake, 0.35); }
        else if (b.isPlayer) audio.boost();
      }
    }
    // 블랙홀 관문: 입구로 들어가면 항로 앞쪽 출구로 빨려 나온다.
    // 동료함은 스스로 들어가지 않는다 — 기함을 따라 함께 통과한다(아래).
    if (!b.airborne && !b.loop && !b.consort && b.warpCd <= 0) {
      for (const w of tr.warps) {
        if (!w.active) continue;
        const fx = Math.sin(b.heading), fz = Math.cos(b.heading);
        if (Math.hypot(w.x - b.pos.x, w.z - b.pos.z) < w.r && fx * (w.outX - w.x) + fz * (w.outZ - w.z) > -0.1) {
          G.particles.burst(w.x, 5, w.z, 60, { speed: 12, up: 4, life: 0.9, size: 4, color: 0x9a6aff, grav: 0, spread: 4 });
          b.warpTo(w.outX, w.outZ, w.outTx, w.outTz);
          b.curveIdx = w.outIdx; // 진행도 계산이 항로를 되짚지 않도록 함께 옮긴다
          // 기함이 통과하면 함대도 같이 빨려 나온다. 안 그러면 동료함만 항로에 남아 대열이 무너진다.
          if (b.isPlayer && G.fleet) {
            for (const c of G.fleet.alive) {
              const sp = G.fleet.slotPos(c.consort.slot, new THREE.Vector3());
              c.warpTo(sp.x, sp.z, w.outTx, w.outTz);
              c.curveIdx = w.outIdx;
              c.consort.lostT = 0; c.consort.rejoining = false;
              G.particles.burst(sp.x, 4, sp.z, 24, { speed: 10, up: 5, life: 0.8, size: 4, color: 0xffb347, grav: -3 });
            }
          }
          G.particles.burst(w.outX, 5, w.outZ, 80, { speed: 16, up: 8, life: 1.1, size: 5, color: 0xffb347, grav: -4, spread: 5 });
          if (b.isPlayer && G.state === 'racing') {
            award(260, t('pop.warp'), '#9a6aff', () => { audio.whoosh(); audio.boost(); });
            G.camShake = Math.max(G.camShake, 0.7); G.camOffInit = false; hud.hitFlash();
            hud.event(t('ev.warp'), 2000);
          } else if (b.isPlayer) audio.whoosh();
          break;
        }
      }
    }
    // 360도 코스터: 고리 정면으로 충분한 속도로 들어가면 한 바퀴 돈다
    if (!b.airborne && !b.loop && !b.consort && b.rampCd <= 0) {
      for (const lp of tr.loops) {
        if (!lp.active) continue;
        const fx = Math.sin(b.heading), fz = Math.cos(b.heading);
        if (Math.hypot(lp.x - b.pos.x, lp.z - b.pos.z) < lp.r && fx * lp.tx + fz * lp.tz > 0.62 && Math.abs(b.speed) > 14) {
          if (b.startLoop(b.pos.x, b.pos.z, lp.tx, lp.tz, lp.R)) {
            G.particles.burst(b.pos.x, 1, b.pos.z, 40, { speed: 9, up: 10, life: 1, size: 4, color: 0xffb347, grav: -6 });
            if (b.isPlayer && G.state === 'racing') {
              award(320, t('pop.loop'), '#ffb347', () => { audio.whoosh(); audio.boost(); });
              G.camShake = Math.max(G.camShake, 0.35);
              hud.event(t('ev.loop'), 2000);
            } else if (b.isPlayer) audio.whoosh();
          }
          break;
        }
      }
    }
    // 코스터를 막 빠져나옴: 물보라 + 보너스
    if (b.justLooped) {
      b.justLooped = false;
      G.particles.burst(b.pos.x, 1, b.pos.z, 70, { speed: 13, up: 10, life: 1.2, size: 5, color: 0xffffff, grav: -10, spread: 5 });
      if (b.isPlayer) {
        audio.splash(); G.camShake = Math.max(G.camShake, 0.5);
        if (G.state === 'racing') { G.stats.loops++; award(400, t('pop.loopOut'), '#ffd54f', () => audio.perfect()); }
      }
    }
    // 점프대: 진행 방향으로 밟으면 발사. 동료함은 대열을 지켜야 하므로 타지 않는다.
    if (!b.airborne && !b.loop && !b.consort && b.rampCd <= 0) {
      const fx = Math.sin(b.heading), fz = Math.cos(b.heading);
      for (const rp of tr.ramps) {
        if (Math.hypot(rp.x - b.pos.x, rp.z - b.pos.z) < rp.r && fx * rp.tx + fz * rp.tz > 0.5 && Math.abs(b.speed) > 8) {
          if (b.launch()) {
            const f = b.forward();
            G.particles.burst(b.pos.x - f.x * R, 1, b.pos.z - f.z * R, 40, { speed: 9, up: 10, life: 1, size: 4, color: 0xdff6ff, grav: -8 });
            if (b.isPlayer && G.state === 'racing') { award(120, t('pop.jump'), '#8fd4ff', () => { audio.whoosh(); audio.boost(); }); G.camShake = Math.max(G.camShake, 0.3); }
            else if (b.isPlayer) audio.whoosh();
          }
          break;
        }
      }
    }
    // 착수: 물보라 + 체공 보너스
    if (b.justLanded) {
      b.justLanded = false;
      G.particles.burst(b.pos.x, 0.5, b.pos.z, 70, { speed: 12, up: 12, life: 1.3, size: 5, color: 0xffffff, grav: -12, spread: 6 });
      if (b.isPlayer) {
        audio.splash(); G.camShake = Math.max(G.camShake, 0.5);
        if (G.state === 'racing') { G.stats.jumps++; award(Math.round(60 + b.airTime * 60), t('pop.land', { s: b.airTime.toFixed(1) }), '#ffe08a', () => audio.combo(G.combo)); }
      } else if (b.pos.distanceTo(G.player.pos) < 150) audio.splash();
    }
    // 역사 인물 두루마리 / 발견 구슬 (플레이어만)
    if (b.isPlayer && G.state === 'racing') {
      for (const sc of tr.scrolls) {
        if (!sc.active) continue;
        if (Math.hypot(sc.x - b.pos.x, sc.z - b.pos.z) < (sc.r + R * 0.5) * pickR) {
          tr.collectScroll(sc); foundFigure();
          G.particles.burst(sc.x, 2, sc.z, 40, { speed: 5, up: 9, life: 1.2, size: 3.5, color: 0xffe08a, grav: -6 });
        }
      }
      for (const vs of tr.verses) {
        if (!vs.active) continue;
        if (Math.hypot(vs.x - b.pos.x, vs.z - b.pos.z) < (vs.r + R * 0.5) * pickR) {
          tr.collectVerse(vs); foundVerse();
          G.particles.burst(vs.x, 2, vs.z, 50, { speed: 6, up: 10, life: 1.4, size: 4, color: 0xffe9a8, grav: -5, spread: 2 });
        }
      }
      for (const dc of tr.discoveries) {
        if (!dc.active) continue;
        if (Math.hypot(dc.x - b.pos.x, dc.z - b.pos.z) < (dc.r + R * 0.5) * pickR) {
          tr.collectDiscovery(dc); foundDiscovery();
          G.particles.burst(dc.x, 2, dc.z, 60, { speed: 7, up: 10, life: 1.4, size: 4, color: 0x8fd4ff, grav: -5, spread: 3 });
        }
      }
    }
    // 금화 / 보물 상자: 기함이 직접 줍거나, 동료함이 거둬 기함에 넘긴다
    if ((b.isPlayer || (b.consort && !b.consort.sunk)) && G.state === 'racing') {
      const ally = !b.isPlayer;
      for (const c of tr.coins) {
        if (!c.active) continue;
        if (Math.hypot(c.x - b.pos.x, c.z - b.pos.z) < (c.r + R * 0.5) * pickR) {
          tr.collectCoin(c);
          G.stats.coins++; G.combo += 1; G.comboTimer = COMBO_WINDOW; G.stats.maxCombo = Math.max(G.stats.maxCombo, G.combo);
          addQuiet(20); missionTreasure(20 * Math.min(Math.max(1, G.combo), 10)); audio.coin(G.combo);
          if (ally) { G.fleet && G.fleet.gathered++; b.consort.gatherT = 0.5; }
          G.particles.burst(c.x, 2.5, c.z, 10, { speed: 3, up: 5, life: 0.7, size: 2.5, color: ally ? 0x7bed9f : 0xffd54f, grav: -8 });
          if (G.combo % 5 === 0) hud.comboPop(t('pop.coinCombo'), `×${G.combo}`, '#ffd54f');
        }
      }
      for (const c of tr.chests) {
        if (!c.active) continue;
        if (Math.hypot(c.x - b.pos.x, c.z - b.pos.z) < (c.r + R * 0.6) * pickR) {
          tr.collectChest(c);
          G.player.boost = 1; G.stats.chests++;
          award(300, ally ? t('fleet.gotChest', { name: b.name }) : t('pop.chest'), '#ffd54f', () => audio.treasure());
          missionTreasure(300 * Math.min(Math.max(1, G.combo), 10));
          G.particles.burst(c.x, 2, c.z, 80, { speed: 9, up: 14, life: 1.6, size: 4, color: 0xffd54f, grav: -10, spread: 4 });
        }
      }
    }
    // 크라켄
    if (G.krakenActive && !b.loop) {
      for (const tt of tr.kraken.tentacles) {
        const dx = b.pos.x - tt.x, dz = b.pos.z - tt.z; const d = Math.hypot(dx, dz);
        if (d < tt.r + R) {
          const nx = dx / (d || 1), nz = dz / (d || 1);
          b.pos.x = tt.x + nx * (tt.r + R + 0.5); b.pos.z = tt.z + nz * (tt.r + R + 0.5);
          b.hitObstacle(nx, nz, 1.1); b.spin += 0.7;
          G.particles.burst(b.pos.x, 1, b.pos.z, 30, { speed: 8, up: 10, life: 1, size: 3, color: 0xd08ad8 });
          if (b.isPlayer) { audio.hit(1); hud.hitFlash(); G.camShake = 1; hud.event(t('ev.kraken'), 2000); breakCombo(); G.storm.hitDuring = true; if (G.mission) G.mission.crashes++; }
          else if (b.consort) damageConsort(b, 0.28, t('fleet.hitKraken'));
        } else if (b.isPlayer && fast && d < tt.r + R + 8 && G.t - (tt.nearT ?? -10) > 3 && G.state === 'racing') {
          tt.nearT = G.t; G.stats.nearMiss++;
          award(150, t('pop.tentacle'), '#d08ad8', () => { audio.whoosh(); audio.combo(G.combo); });
        }
      }
    }
  }
  // 배끼리 충돌
  for (let i = 0; i < G.boats.length; i++) for (let j = i + 1; j < G.boats.length; j++) {
    const a = G.boats[i], b = G.boats[j];
    if (a.airborne || b.airborne || a.loop || b.loop) continue;
    const ra = a.phys.radius * 0.55, rb = b.phys.radius * 0.55;
    const dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z; const d = Math.hypot(dx, dz);
    if (d < ra + rb && d > 0.001) {
      const nx = dx / d, nz = dz / d, overlap = ra + rb - d;
      const ma = a.phys.mass, mb = b.phys.mass, tot = ma + mb;
      a.pos.x -= nx * overlap * (mb / tot); a.pos.z -= nz * overlap * (mb / tot);
      b.pos.x += nx * overlap * (ma / tot); b.pos.z += nz * overlap * (ma / tot);
      const relSpeed = Math.abs(a.speed - b.speed) + 4;
      const k = Math.min(1, relSpeed / 40);
      a.hitObstacle(-nx, -nz, 0.35 * k * (mb / tot) * 2);
      b.hitObstacle(nx, nz, 0.35 * k * (ma / tot) * 2);
      G.particles.burst((a.pos.x + b.pos.x) / 2, 1.5, (a.pos.z + b.pos.z) / 2, 18, { speed: 5, up: 6, life: 0.8, size: 2.5, color: 0xffffff });
      if (a.isPlayer || b.isPlayer) { audio.hit(0.6 * k); G.camShake = Math.max(G.camShake, 0.35); const other = a.isPlayer ? b : a; if (Math.random() < 0.5) hud.event(t('ev.collide', { name: other.name, ship: other.def.name }), 1200); }
    }
  }
}

// ---------- 슬립스트림 (앞 배의 바람 그늘) ----------
function updateSlipstream(dt) {
  const p = G.player;
  if (p.finished || G.state !== 'racing') { p.draftMul = 1; hud.setDraft(false, false); return; }
  const fx = Math.sin(p.heading), fz = Math.cos(p.heading);
  let drafting = false;
  for (const b of G.boats) {
    if (b === p) continue;
    const dx = b.pos.x - p.pos.x, dz = b.pos.z - p.pos.z;
    const ahead = dx * fx + dz * fz, lateral = Math.abs(dx * fz - dz * fx);
    if (ahead > p.phys.radius && ahead < 48 && lateral < 7.5) { drafting = true; break; }
  }
  const D = G.draft;
  if (drafting) {
    D.t += dt; D.off = 0;
    p.draftMul = 1.14;
    p.boost = Math.min(1, p.boost + dt * 0.09);
    if (D.t > 1.3 && !D.awarded) { D.awarded = true; G.stats.slipstreams++; award(150, t('pop.draft'), '#8fd4ff'); }
    // 항적 파티클을 조금 더
    if (Math.random() < 0.5) G.particles.spawn(p.pos.x + fx * 6 + (Math.random() - 0.5) * 6, 2 + Math.random() * 3, p.pos.z + fz * 6 + (Math.random() - 0.5) * 6, -fx * 25, 0, -fz * 25, 0.4, 2, 0xbfe6ff, 0);
  } else {
    D.off += dt;
    if (D.off > 0.6) { D.t = 0; D.awarded = false; }
    p.draftMul = 1;
  }
  hud.setDraft(drafting, D.awarded);
}

// ---------- 포격 ----------
const ballGeo = new THREE.SphereGeometry(0.7, 8, 8);
const ballMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.7, roughness: 0.4 });
function fireCannon(boat) {
  // 유도 미션에서는 포문을 닫는다. 소리만으로도 부캉이가 놀란다.
  if (G.chapter?.type === 'guide' && G.mode === 'campaign') return;
  if (boat.cannonCd > 0 || boat.finished) return;
  if (boat.consort?.sunk) return;
  // 포술 부제독이 있으면 재장전이 빨라진다. HUD 게이지는 cannonMax를 기준으로 그린다.
  boat.cannonMax = boat.phys.cannonCooldown * boat.tr.cannonCd;
  boat.cannonCd = boat.cannonMax;
  spawnBall(boat);
  if (boat.phys.doubleShot) setTimeout(() => { if (G.state === 'racing' || G.state === 'finished') spawnBall(boat); }, 220);
  if (boat.isPlayer) audio.cannon(); else if (boat.pos.distanceTo(G.player.pos) < 150) audio.cannon();
  G.particles.burst(boat.pos.x + Math.sin(boat.heading) * boat.phys.radius, 2.5, boat.pos.z + Math.cos(boat.heading) * boat.phys.radius, 14, { speed: 3, up: 3, life: 0.9, size: 5, color: 0x999999, grav: 1 });
}
function spawnBall(boat) {
  const f = boat.forward();
  const mesh = new THREE.Mesh(ballGeo, ballMat);
  const pos = boat.pos.clone().addScaledVector(f, boat.phys.radius + 1).setY(3);
  mesh.position.copy(pos);
  scene.add(mesh);
  const vel = f.clone().multiplyScalar(95 + boat.speed * 0.6).setY(9);
  G.projectiles.push({ mesh, pos, vel, owner: boat, life: 3 });
}
function updateProjectiles(dt) {
  for (let i = G.projectiles.length - 1; i >= 0; i--) {
    const p = G.projectiles[i];
    p.life -= dt; p.vel.y -= 18 * dt;
    p.pos.addScaledVector(p.vel, dt); p.mesh.position.copy(p.pos);
    let remove = p.life <= 0;
    if (p.pos.y < waveHeight(p.pos.x, p.pos.z, G.t)) {
      remove = true;
      G.particles.burst(p.pos.x, 0.5, p.pos.z, 16, { speed: 3, up: 9, life: 0.9, size: 3, color: 0xffffff });
      if (p.pos.distanceTo(G.player.pos) < 100) audio.splash();
    }
    if (!remove) for (const b of G.boats) {
      if (b === p.owner) continue;
      if (b.consort?.sunk) continue;
      // 아군 오사 방지: 기함과 동료함끼리는 맞지 않는다
      const sameFleet = (x, y) => (x.isPlayer || x.consort) && (y.isPlayer || y.consort);
      if (sameFleet(p.owner, b)) continue;
      if (Math.hypot(b.pos.x - p.pos.x, b.pos.z - p.pos.z) < b.phys.radius * 0.7 && p.pos.y < 6) {
        const d = p.vel.clone().setY(0).normalize();
        b.hitByCannon(d.x, d.z); b.lastHitBy = p.owner;
        // 사략 특성 / 자벡: 명중하면 전속 항해 게이지가 찬다
        const plunder = (p.owner.def.plunder ? 0.3 : 0) + (p.owner.tr?.plunder ?? 0);
        if (plunder > 0) p.owner.boost = Math.min(1, p.owner.boost + plunder);
        G.particles.burst(p.pos.x, 3, p.pos.z, 40, { speed: 9, up: 8, life: 1.1, size: 4, color: 0xff9800, grav: -8 });
        G.particles.burst(p.pos.x, 3, p.pos.z, 20, { speed: 4, up: 4, life: 1.6, size: 6, color: 0x444444, grav: 2 });
        if (b.isPlayer) { audio.hit(1); hud.hitFlash(); G.camShake = 0.9; hud.event(t('ev.hitBy', { name: p.owner.name }), 1800); breakCombo(); G.storm.hitDuring = true; G.mission && G.mission.crashes++; }
        else if (b.consort) { damageConsort(b, 0.3 * (p.owner.tr?.cannonDmg ?? 1), t('fleet.hitBy', { name: p.owner.name })); }
        else if (p.owner.isPlayer) { award(Math.round(180 * p.owner.tr.cannonDmg), p.owner.def.plunder ? t('pop.plunder') : t('pop.hit'), '#ff9800', () => { audio.hit(0.7); audio.combo(G.combo); }); missionHit(); }
        else if (p.owner.consort) { hud.event(t('fleet.allyHit', { name: p.owner.name, target: b.name }), 1400); addQuiet(60); missionHit(); }
        remove = true; break;
      }
    }
    if (remove) { scene.remove(p.mesh); G.projectiles.splice(i, 1); }
  }
}

// ---------- 카메라 ----------
const camTarget = new THREE.Vector3(), camPos = new THREE.Vector3(), _f = new THREE.Vector3(), _camOff = new THREE.Vector3();
function updateCamera(dt) {
  const p = G.player;
  p.forward(_f);
  const h = waveHeight(p.pos.x, p.pos.z, G.t);
  if (G.state === 'countdown') {
    const u = 1 - Math.max(0, G.countdown - 1) / 2.6; // 0 -> 1
    const ang = p.heading + Math.PI * 0.8 - u * Math.PI * 0.8;
    const r = 58 - u * 14;
    camPos.set(p.pos.x + Math.sin(ang) * r, 18 + (1 - u) * 8, p.pos.z + Math.cos(ang) * r);
    camTarget.set(p.pos.x, h + 6, p.pos.z);
    camera.position.lerp(camPos, Math.min(1, dt * 4));
    camera.lookAt(camTarget);
    camera.fov += (72 - camera.fov) * Math.min(1, dt * 3); camera.updateProjectionMatrix();
    return;
  }
  const speedRatio = Math.abs(p.speed) / p.phys.maxSpeed;
  const rush = Math.max(0, speedRatio - 0.75) * 4; // 고속 구간 0~1
  const turbo = p.turbo > 0 ? Math.min(1, p.turbo) : 0;
  const air = p.airborne ? Math.min(1, p.airY / 25) : 0;
  let dist, height, lookAhead, fovT;
  let targetY;
  // 추적 카메라: 속도가 붙어도 배가 작아지지 않도록 거리는 거의 고정, 배는 화면 아래쪽 1/3에 오도록 시선을 앞·위로
  // 표준 추적 카메라: 배 뒤 약간 위에서 내려다보며, 배는 화면 아래쪽 1/3
  // 함대를 거느리면 대열이 한 화면에 들어오도록 카메라를 뒤·위로 물린다.
  // 진형이 실제로 얼마나 깊은지로 계산하되, 기함이 점처럼 작아지지 않게 상한을 둔다.
  const fleetDepth = G.fleet && G.fleet.size
    ? formationDepth(G.fleet.formation.id, G.fleet.size, G.fleet.spacing.id) : 0;
  const fleetPull = THREE.MathUtils.clamp(fleetDepth * 0.62, 0, 34);
  if (G.camMode === 0) { dist = 31 + fleetPull + speedRatio * 2 + turbo * 2; height = 16 + fleetPull * 0.42 - rush * 1; lookAhead = 30 + rush * 4; targetY = 5; fovT = 68 + Math.min(8, fleetPull * 0.28) + speedRatio * 6 + (p.boosting ? 6 : 0) + turbo * 10; }
  else if (G.camMode === 1) { dist = 60; height = 30; lookAhead = 50; targetY = 8; fovT = 66 + (p.boosting ? 8 : 0); }
  else { dist = -p.phys.radius * 0.9; height = 4.2; lookAhead = 90; targetY = 5; fovT = 80 + (p.boosting ? 12 : 0); }
  if (G.state === 'finished' || G.state === 'result') { const a = G.t * 0.4; camPos.set(p.pos.x + Math.sin(a) * 40, 16, p.pos.z + Math.cos(a) * 40); camTarget.set(p.pos.x, h + 3, p.pos.z); camera.position.lerp(camPos, Math.min(1, dt * 2)); camera.lookAt(camTarget); return; }
  camPos.set(p.pos.x - _f.x * (dist + air * 10), h * 0.5 + height + p.airY * 0.7 + air * 6, p.pos.z - _f.z * (dist + air * 10));
  camTarget.set(p.pos.x + _f.x * lookAhead, h + targetY + p.airY * 0.8, p.pos.z + _f.z * lookAhead);
  // 느린 숨결 같은 흔들림 (낭만적인 항해 느낌)
  camPos.y += Math.sin(G.t * 0.5) * 0.8; camPos.x += Math.sin(G.t * 0.33) * 0.6;
  // 배 기준 오프셋을 보간: 배가 아무리 빨라도 카메라가 뒤처져 멀어지지 않는다
  const lerp = G.camMode === 2 ? 1 : Math.min(1, dt * 4);
  _camOff.subVectors(camPos, p.pos);
  if (!G.camOffInit) { G.camOff.copy(_camOff); G.camOffInit = true; }
  G.camOff.lerp(_camOff, lerp);
  camera.position.copy(p.pos).add(G.camOff);
  const shake = G.camShake * 0.7 + SEA.storm * 0.05 + (p.boosting ? 0.03 : 0) + rush * 0.02;
  if (G.camShake > 0) G.camShake = Math.max(0, G.camShake - dt * 2.5);
  if (shake > 0) {
    camera.position.x += (Math.random() - 0.5) * shake * 2; camera.position.y += (Math.random() - 0.5) * shake * 1.5;
  }
  camera.lookAt(camTarget);
  // 선체 기울기에 맞춰 카메라도 아주 살짝 롤
  camera.rotateZ(-p.heel * 0.18);
  // 부캉이 선회 중에는 화각이 아주 살짝 좁아졌다 풀린다
  if (G.fovNudge) { fovT += G.fovNudge; G.fovNudge *= Math.max(0, 1 - dt * 1.2); if (Math.abs(G.fovNudge) < 0.05) G.fovNudge = 0; }
  camera.fov += (fovT - camera.fov) * Math.min(1, dt * 2.5); camera.updateProjectionMatrix();
  hud.setSpeedLines(rush * 0.45 + (p.boosting ? 0.45 : 0) + (p.draftMul > 1 ? 0.2 : 0) + turbo * 0.8 + air * 0.4);
}

// ---------- 결과 ----------
function showResults() {
  G.state = 'result';
  if (audio.enabled) audio.playTheme();
  hud.hide();
  const sorted = [...G.boats].sort((a, b) => a.rank - b.rank);
  const me = G.player, st = G.stats, ch = G.mode === 'campaign' ? G.chapter : null;
  const m = G.mission || freshMission();
  m.rank = me.rank; m.time = me.finished ? me.finishTime : G.raceTime;
  m.aliveConsorts = G.fleet ? G.fleet.alive.length : 0;

  // 등급 / 클리어 판정
  const grade = ch ? (m.failed ? 'C' : gradeOf(ch, m)) : null;
  const cleared = !!(ch && grade !== 'C');

  const gEl = $('result-grade');
  if (ch) {
    gEl.classList.remove('hidden');
    gEl.textContent = grade;
    gEl.style.color = GRADE_COLOR[grade];
    gEl.classList.remove('pop'); void gEl.offsetWidth; gEl.classList.add('pop');
  } else gEl.classList.add('hidden');

  $('result-title').textContent = ch
    ? (cleared ? t('res.chapterClear', { act: ch.act }) : t('res.chapterFail'))
    : (me.rank === 1 ? t('res.first') : me.rank <= 3 ? t('res.honor') : t('res.end'));
  $('result-rank-big').textContent = me.rank === 1 ? t('res.rank1') : t('res.rank', { r: ordinal(me.rank) });
  $('result-portrait').src = portraitSrc(SEL.admiral);
  $('result-admiral-name').textContent = me.name;

  // 미션 결과 줄
  const mi = $('result-mission');
  if (ch) {
    const T = MISSION_TYPES[ch.type];
    mi.innerHTML = `<div class="rm-head" style="color:${T.color}">${T.icon} ${ch.act} · ${ch.title}</div>
      <div class="rm-row ${meets(ch, ch.goal, m) && !m.failed ? 'ok' : 'no'}">${meets(ch, ch.goal, m) && !m.failed ? '✔' : '✖'} ${goalText(ch)}</div>
      <div class="rm-row ${meets(ch, ch.sGoal, m) && !m.failed ? 'ok' : 'dim'}">${meets(ch, ch.sGoal, m) && !m.failed ? '★' : '☆'} ${t('res.sgoal')} ${goalText(ch, ch.sGoal)}</div>
      ${m.failReason ? `<div class="rm-row no">${m.failReason}</div>` : ''}`;
  } else mi.innerHTML = '';

  // 명성 / 해금
  const fameEl = $('result-fame'), unlockEl = $('result-unlock');
  let gained = 0, unlocks = [];
  if (ch) {
    const base = cleared ? ch.fame : Math.round(ch.fame * 0.25);
    const gradeMul = { S: 1.5, A: 1.2, B: 1, C: 1 }[grade];
    gained = Math.round(base * gradeMul * me.tr.fame);
    const beforeOwned = ownedOfficers();
    const wasChapter = SAVE.chapter;
    addFame(gained);
    recordChapter(ch.id, grade, m.finished ? m.time : 0, cleared);
    fameEl.innerHTML = `<span class="rf-gain">⚜ +${gained.toLocaleString('ko-KR')}</span> <span class="rf-total">${t('res.fameTotal', { n: SAVE.fame.toLocaleString('ko-KR') })}</span>`;
    // 이번 판으로 새로 열린 것들
    if (cleared && ch.reward?.figure) {
      const f = findFigure(ch.reward.figure);
      unlocks.push(`<div class="ul-row"><img src="${portraitSrc(f.id, true)}" alt=""><div><b>${figName(f)}</b><span>${t('res.joined')} · ${TRAITS[f.trait].icon} ${TRAITS[f.trait].name}</span></div></div>`);
      if (!SEL.officers.includes(f.id)) {
        const free = SEL.officers.indexOf(null);
        if (free >= 0 && SAVE.fame >= f.fame) { SEL.officers[free] = f.id; saveOfficers(); }
      }
    }
    if (cleared && ch.reward?.ship) {
      const s = SHIPS.find((x) => x.id === ch.reward.ship);
      if (s) unlocks.push(`<div class="ul-row ship"><b>⛵ ${s.name}</b><span>${t('res.shipUnlock')}</span></div>`);
    }
    for (const f of FIGURES) {
      if (!beforeOwned.includes(f.id) && SAVE.fame >= f.fame && f.id !== ch.reward?.figure)
        unlocks.push(`<div class="ul-row"><img src="${portraitSrc(f.id, true)}" alt=""><div><b>${figName(f)}</b><span>${t('res.fameJoin')}</span></div></div>`);
    }
    if (cleared && ch.reward?.crown) unlocks.push(`<div class="ul-row crown"><b>👑 ${t('res.crown')}</b><span>${t('res.crownSub')}</span></div>`);
    if (wasChapter === 0 && cleared) { SAVE.freeplay = true; persist(); unlocks.push(`<div class="ul-row"><b>🗺 ${t('res.freeplay')}</b><span>${t('res.freeplaySub')}</span></div>`); }
    unlockEl.innerHTML = unlocks.length ? `<h4>${t('res.unlocked')}</h4>${unlocks.join('')}` : '';
  } else {
    // 자유 항해: 순위와 점수로 소액의 명성
    gained = Math.round((G.score / 60 + (me.rank === 1 ? 120 : me.rank <= 3 ? 60 : 20)) * me.tr.fame);
    addFame(gained);
    fameEl.innerHTML = `<span class="rf-gain">⚜ +${gained.toLocaleString('ko-KR')}</span> <span class="rf-total">${t('res.fameTotal', { n: SAVE.fame.toLocaleString('ko-KR') })}</span>`;
    unlockEl.innerHTML = '';
  }
  // 도감에 처음 올린 동물은 명성이 붙는다. 박물 특성이 있으면 두 배.
  if (G.animalsNew.length) {
    const mul = (me.tr.codexFame || 1) * (me.tr.fame || 1);
    addFame(Math.round(ANIMAL_FAME * G.animalsNew.length * mul));
  }
  // 11장 보상 칭호
  if (ch && cleared && ch.reward?.title && grantTitle(ch.reward.title)) {
    unlockEl.innerHTML += `<div class="ul-row crown"><b>🎖 ${ch.reward.title}</b><span>${t('res.titleGot')}</span></div>`;
  }
  updateFame();

  const item = (label, v) => `<span>${label}<b>${v}</b></span>`;
  $('result-score').innerHTML = `<div class="total">${t('res.score', { s: G.score.toLocaleString() })}</div>` +
    item(t('res.rankPts'), st.rankPts.toLocaleString()) + item(t('res.maxCombo'), '×' + st.maxCombo) + item(t('res.near'), st.nearMiss) + item(t('res.overtake'), st.overtakes) +
    item(t('res.draft'), st.slipstreams) + item(t('res.tap'), G.tap.bursts) + item(t('res.coins'), st.coins) + item(t('res.chests'), st.chests) + item(t('res.storms'), st.storms) + item(t('res.jumps'), st.jumps) + (st.loops ? item(t('res.loops'), st.loops) : '') +
    (G.fleet && G.fleet.size ? item(t('res.fleetTime'), Math.round(st.fleetTime) + 's') + item(t('res.orders'), st.orders) + item(t('res.alive'), `${m.aliveConsorts}/${G.fleet.size}`) : '') +
    (st.perfectStart ? item(t('res.perfect'), '✔') : '') + (st.bestLap < Infinity ? item(t('res.bestLap'), formatTime(st.bestLap)) : '');

  const L = G.learned;
  const tags = (arr, cls) => arr.map((n) => `<span class="tag ${cls}">${n}</span>`).join('');
  // 이번 항해에서 만난 말씀: 장절과 지금까지 만난 횟수를 함께 보여 준다
  const verseRows = [...new Set(L.verses)].map((id) => {
    const v = findVerse(id), n = SAVE.verses[id] || 0;
    const done = n >= MEMORIZED_AT;
    return `<div class="vs-row${done ? ' done' : ''}">
      <span class="vs-ref">${LANG === 'en' ? v.refEn : v.ref}</span>
      <span class="vs-bar"><i style="width:${Math.min(100, (n / MEMORIZED_AT) * 100)}%"></i></span>
      <span class="vs-n">${done ? t('res.verseDone') : `${n}/${MEMORIZED_AT}`}</span>
    </div>`;
  }).join('');
  const allMemo = VERSES.filter((v) => (SAVE.verses[v.id] || 0) >= MEMORIZED_AT).length;
  $('result-learned').innerHTML = `<h4>${t('res.learned')}</h4>` +
    `<div>${t('res.learnedLine', { e: L.events, f: L.figures.length, d: L.discoveries.length })}</div>` +
    (L.figures.length ? `<div style="margin-top:6px">${tags(L.figures, 'f')}</div>` : '') +
    (L.discoveries.length ? `<div style="margin-top:4px">${tags(L.discoveries, 'd')}</div>` : '') +
    (verseRows ? `<h4 style="margin-top:10px">${t('res.verses', { m: allMemo, all: VERSES.length })}</h4><div class="vs-list">${verseRows}</div>` : '') +
    (G.animalsMet.length ? `<h4 style="margin-top:10px">${t('res.animals')}</h4><div class="met-animals">` +
      G.animalsMet.map((k) => {
        const a = ANIMALS[k], isNew = G.animalsNew.includes(k);
        return `<span class="${isNew ? 'fresh' : ''}">${a.emoji} ${LANG === 'en' ? a.en : a.name}${isNew ? ' · ' + t('res.animalNew') : ''}</span>`;
      }).join('') + '</div>' : '');
  $('result-table').innerHTML = sorted.map((b) => `<tr class="${b.isPlayer ? 'me' : b.consort ? 'ally' : ''}"><td class="rank">${b.rank}</td><td><span style="color:${b.color}">${b.consort ? '▣' : '■'}</span> ${b.name}</td><td>${b.def.name}</td><td>${b.consort?.sunk ? t('res.sunk') : b.finished ? formatTime(b.finishTime) : t('res.sailing')}</td></tr>`).join('');

  // 다음 장 버튼은 클리어했고 다음 장이 남아 있을 때만
  const hasNext = !!(ch && cleared && ch.id + 1 < chapterCount);
  $('btn-next').classList.toggle('hidden', !hasNext);
  $('btn-tolog').textContent = G.mode === 'free' ? t('res.home') : t('res.log');

  $('result-screen').classList.remove('hidden');
  document.body.classList.add('in-menu');
  $('lang-bar').classList.remove('hidden');

  // 마무리 컷씬: 클리어하면 아웃트로, 실패하면 격려 대사
  if (ch) {
    const lines = cleared ? ch.outro : ch.fail;
    if (lines && lines.length) setTimeout(() => { if (G.state === 'result') cutscene.show(lines, ch, me.name, SEL.admiral); }, 900);
  }
}

// 도감의 "해양 생물" 칸. 만난 종만 펼쳐 보여 준다.
function buildAnimalCodex() {
  const el = $('codex-animals'); if (!el) return;
  const keys = Object.keys(ANIMALS);
  const seen = SAVE.seenAnimals || [];
  el.innerHTML = `<h4>${t('codex.animals')} <small>${seen.length} / ${keys.length}</small></h4>` +
    '<div class="animal-grid">' + keys.map((k) => {
      const a = ANIMALS[k], known = seen.includes(k);
      if (!known) return `<article class="animal-card locked"><div class="an-emoji">？</div><div><b>???</b><span>${t('codex.animalLocked')}</span></div></article>`;
      return `<article class="animal-card"><div class="an-emoji">${a.emoji}</div><div>
        <b>${LANG === 'en' ? a.en : a.name}</b><span>${a.species}</span>
        <p>${LANG === 'en' ? a.textEn : a.text}</p></div></article>`;
    }).join('') + '</div>';
}

// ---------- 부캉이의 바다 ----------
// 동물은 해치는 대상이 아니다. 여기 있는 모든 상호작용은 피하거나, 따라가거나, 곁에 있는 것이다.

const ANIMAL_FAME = 40;        // 도감에 처음 올린 종 하나당 명성
// 부캉이가 놀라기 시작하는 속도. 배마다 최고 속도가 다르므로 비율로 잡는다.
// 느린 배를 골랐다고 쉬워지고 빠른 배를 골랐다고 불가능해지면 안 된다.
const GUIDE_SPEED_FRAC = 0.7;
function guideLimit(p) { return p.phys.maxSpeed * GUIDE_SPEED_FRAC; }

// 종을 처음 만났다. 도감 카드를 띄우고 이번 항해의 목록에 넣는다.
function meetAnimal(key) {
  const a = ANIMALS[key];
  if (!a || G.animalsMet.includes(key)) return;
  G.animalsMet.push(key);
  const fresh = !SAVE.seenAnimals.includes(key);
  if (fresh) { markSeen('animal', key); G.animalsNew.push(key); }
  hud.knowledge({
    kind: 'animal', label: t('kc.animal'), date: a.species,
    title: a.emoji + ' ' + (LANG === 'en' ? a.en : a.name),
    text: LANG === 'en' ? a.textEn : a.text, dur: fresh ? 9 : 5,
  }, fresh);
  award(fresh ? 240 : 60, a.emoji + ' ' + (LANG === 'en' ? a.en : a.name), '#5fe0d8', () => audio.treasure());
}

// 만조와 간조. 주기적으로 물이 들고 난다.
function updateTide(dt) {
  const T = G.tide;
  T.phase += dt * 0.085;                    // 한 주기 약 74초
  T.level = (Math.sin(T.phase) + 1) / 2;
  const wasHigh = T.high;
  T.high = T.level > 0.72;
  if (T.high && !wasHigh && G.chapter?.type === 'guide') hud.event(t('ev.highTide'), 2600);
}

// 동물 상호작용. 매 프레임 한 번.
function updateWildlife(dt) {
  const W = G.wildlife, p = G.player;
  if (!W || !p) return;
  G.track.setFocus(p.pos.x, p.pos.z);
  W.update(dt, G.t, p);
  for (const k of W.met) meetAnimal(k);

  if (W.whaleSighted) {
    W.whaleSighted = false;
    meetAnimal('graywhale');
    hud.event(t('ev.whale'), 3600);
    G.camShake = Math.max(G.camShake, 0.4);
  }
  if (G.state !== 'racing' || p.finished) return;

  // 상괭이 길잡이 — 떼를 따라가면 순풍 구간으로 안내한다
  if (W.guiding) {
    p.draftMul = Math.max(p.draftMul, 1.15);
    G.guide.companionT = (G.guide.companionT || 0) + dt;
  }

  // 남방큰돌고래 — 같이 날아오르면 체공 보너스
  if (W.jumpingDolphin && p.airborne && !G.guide.dolphinAwarded) {
    G.guide.dolphinAwarded = true;
    p.airVy = Math.max(p.airVy, 10);
    award(320, t('pop.dolphinJump'), '#8fd4ff', () => audio.perfect());
    setTimeout(() => { G.guide.dolphinAwarded = false; }, 4000);
  }

  // 바다거북 — 부딪히지 않고 지나가면 점수, 등딱지 위 금화
  const tn = W.nearTurtle(p.pos.x, p.pos.z);
  if (tn) {
    if (tn.hit) {
      if ((tn.it.cd || 0) <= 0) {
        tn.it.cd = 3;
        p.speed *= 0.82;
        hud.event(t('ev.turtleBump'), 1800);
        bumpStress(0.06);
      }
    } else if (!tn.it.passed) {
      tn.it.passed = true;
      award(180, t('pop.turtlePass'), '#7bed9f', () => audio.coin());
    }
  }
  for (const it of W.pods.turtle.items) if (it.cd > 0) it.cd -= dt;

  // 만타가오리 — 위를 지나면 발견 구슬이 떨어진다
  const mt = W.overManta(p.pos.x, p.pos.z);
  if (mt) { mt.taken = true; foundDiscovery(); }

  // 노무라입깃해파리 — 이 맵의 위협. 스치면 감속과 조타 둔화.
  const jl = W.hitJelly(p.pos.x, p.pos.z);
  if (jl && (jl.cd || 0) <= 0) {
    jl.cd = 2.8;
    p.speed *= 0.7;
    p.sting = Math.max(p.sting, 2.2);
    hud.hitFlash();
    hud.event(t('ev.jelly'), 2000);
    breakCombo();
    bumpStress(0.14);
    audio.hit(0.5);
  }
  for (const it of W.pods.jelly.items) if (it.cd > 0) it.cd -= dt;

  // 정어리 떼 — 천천히 앞서 달리면 떼가 따라붙는다. 유도 미션의 핵심.
  const sh = W.shoalPos();
  const d = Math.hypot(sh.x - p.pos.x, sh.z - p.pos.z);
  sh.towed = d < 55 && Math.abs(p.speed) < guideLimit(p);

  updateShark(dt);
}

// 스트레스를 올린다. 유도 미션에서만 뜻이 있다.
function bumpStress(v) {
  if (G.chapter?.type !== 'guide' || G.mode !== 'campaign') return;
  G.guide.stress = Math.min(1, G.guide.stress + v);
  G.mission.maxStress = Math.max(G.mission.maxStress, G.guide.stress);
}

// 부캉이: 상태머신 갱신 + 연출 + 교감
function updateShark(dt) {
  const sk = G.shark, p = G.player, W = G.wildlife;
  if (!sk || !p) return;
  const cinematics = SAVE.cinematics !== false;
  const api = {
    cinematics,
    event: (text, dur) => hud.event(text, dur),
    sound: (kind) => { if (kind === 'omen') audio.kraken(); else audio.boost(); },
    shake: (v) => { G.camShake = Math.max(G.camShake, v); },
    fov: (delta) => { G.fovNudge = delta; },
    title: (name, caption) => {
      hud.comboPop(name, caption, '#5fe0d8');
      hud.knowledge({ kind: 'animal', label: t('kc.animal'), date: ANIMALS.bukhang.species,
        title: '🦈 ' + (LANG === 'en' ? ANIMALS.bukhang.en : ANIMALS.bukhang.name),
        text: LANG === 'en' ? ANIMALS.bukhang.textEn : ANIMALS.bukhang.text, dur: 10 }, true);
    },
    met: () => meetAnimal('bukhang'),
    companion: () => {
      p.turbo = Math.max(p.turbo, 10);
      G.fx.doubleScore = Math.max(G.fx.doubleScore, 10);
      hud.comboPop(t('pop.companion'), t('pop.companionSub'), '#ffe08a');
      award(600, t('pop.companion'), '#ffe08a', () => audio.perfect());
      G.camShake = Math.max(G.camShake, 0.25);
      recordBond(1);
    },
  };
  // 전조: 갈매기가 날아오르고 정어리가 몰린다
  if (sk.state === 'omen' && !sk._omenFx) {
    sk._omenFx = true;
    G.track.spookGulls?.();
    if (W) W.shoal.scatter = 1;
  }
  if (sk.state === 'hidden') sk._omenFx = false;

  sk.update(dt, G.t, p, api);

  // 동행 중에는 항적이 반짝인다
  if (sk.companionActive && Math.random() < 0.8) {
    const f = p.forward();
    G.particles.spawn(p.pos.x - f.x * p.phys.radius, 0.8, p.pos.z - f.z * p.phys.radius,
      (Math.random() - 0.5) * 6, 2 + Math.random() * 3, (Math.random() - 0.5) * 6, 0.9, 2.4, 0xffe08a, 0);
  }
  if (sk.bond > 0) recordBond(sk.bond);

  // 유도 미션 진행
  if (G.chapter?.type === 'guide' && G.mode === 'campaign' && !G.guide.done) {
    const m = G.mission;
    // 너무 빠르면 놀란다. 한 번 넘겼다고 바로 실패하지는 않고, 10초쯤 계속 몰아붙여야 게이지가 찬다.
    const lim = guideLimit(p);
    if (Math.abs(p.speed) > lim && sk.visibleNow) bumpStress(dt * 0.08);
    else G.guide.stress = Math.max(0, G.guide.stress - dt * 0.12);
    // 상괭이와 나란히 달린 시간 5초마다 한 마리씩 동행으로 친다
    m.companions = Math.min(7, Math.floor((G.guide.companionT || 0) / 5));
    // 만조에는 부캉이가 구조물을 넘어 되돌아갈 수 있다 — 길을 비워 줘야 한다
    if (G.tide.high && Math.abs(p.speed) > lim * 0.8) bumpStress(dt * 0.06);
    // 외해 표지까지 데려왔는가.
    // 그냥 표지 옆을 지나쳤다고 성공이 아니다. 부캉이가 마음을 열어 나란히 붙었고(beside),
    // 그 상태로 10초 넘게 따라왔고, 플레이어도 함께 표지에 있어야 한다.
    if (sk.state === 'beside' && sk.close) G.guide.led += dt;
    const mark = G.track.seaMark;
    if (mark && sk.state === 'beside' && G.guide.led > 10) {
      const dd = Math.hypot(sk.x - mark.x, sk.z - mark.z);
      const pd = Math.hypot(p.pos.x - mark.x, p.pos.z - mark.z);
      if (dd < mark.r + 40 && pd < mark.r + 90) {
        G.guide.done = true; m.guided = true;
        hud.comboPop(t('pop.guided'), t('pop.guidedSub'), '#5fe0d8');
        award(900, t('pop.guided'), '#5fe0d8', () => audio.perfect());
        if (!p.finished) { G.state = 'finished'; G.finishTimer = 3.4; m.finished = true; }
      }
    }
    if (G.guide.stress >= 1 && !m.failed) {
      m.failed = true; m.failReason = t('mission.failStress');
      hud.centerMsg(t('mission.failed'), '#ff6b6b');
      hud.event(m.failReason, 3000);
      G.state = 'finished'; G.finishTimer = 2.4;
    }
  }

  // 게이지 표시
  const guiding = G.chapter?.type === 'guide' && G.mode === 'campaign';
  hud.setBond({
    mode: guiding ? 'stress' : 'bond',
    value: guiding ? G.guide.stress : sk.bond,
    note: sk.companionActive ? t('hud.companionOn', { n: Math.ceil(sk.companion) })
        : sk.visibleNow ? t('hud.bondNear') : t('hud.bondFar'),
    tide: guiding ? G.tide.level : null,
    tideHigh: G.tide.high,
  });
}

// ---------- 메인 루프 ----------
function loop() {
  requestAnimationFrame(loop);
  step();
}
function step() {
  const dt = G.fixedDt ?? Math.min(clock.getDelta(), 0.05);
  G.t += dt;
  cutscene.update(dt); // 대사 한 글자씩 드러내기
  const st = G.state;
  if (st === 'title' || st === 'select') {
    if (!G.attract) startAttract();
    const tr = G.track;
    G.env.update(G.t, camera.position);
    tr.update(dt, G.t); G.gulls.update(G.t); G.particles.update(dt); G.wakes.update(dt, waveHeight, G.t); updateWind(dt); tr.updateKraken(dt);
    const diff = difficultyParams('normal');
    for (const b of G.boats) {
      aiControl(b, tr, G.boats, G.boats[0], G.wind, dt, diff, false);
      b.boosting = false;
      b.update(dt, G.wind, G.t);
      const sr = Math.abs(b.speed) / b.phys.maxSpeed;
      if (sr > 0.2) { const f = b.forward(); G.particles.spawn(b.pos.x - f.x * b.phys.radius * 0.8 + (Math.random() - 0.5) * 3, 0.4, b.pos.z - f.z * b.phys.radius * 0.8, (Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 4, 1.5, 3 + sr * 3, 0xe8f6ff, 0); }
    }
    handleCollisions(dt);
    for (const b of G.boats) updateProgress(b);
    const lead = G.boats[0];
    const a = G.t * 0.25;
    const h = waveHeight(lead.pos.x, lead.pos.z, G.t);
    camPos.set(lead.pos.x + Math.sin(a) * 45, h + 14 + Math.sin(G.t * 0.5) * 3, lead.pos.z + Math.cos(a) * 45);
    camera.position.lerp(camPos, Math.min(1, dt * 2));
    camTarget.set(lead.pos.x, h + 3, lead.pos.z);
    camera.lookAt(camTarget);
    renderer.render(scene, camera);
    return;
  }

  const tr = G.track;
  G.env.update(G.t, camera.position);
  tr.update(dt, G.t);
  G.gulls.update(G.t);
  G.particles.update(dt);
  G.wakes.update(dt, waveHeight, G.t);
  updateWind(dt);
  updateStorm(dt);
  updateEffects(dt);
  updateChronicle(dt);
  hud.updateKnowledge(dt);

  // 크라켄
  const kr = tr.updateKraken(dt);
  G.krakenActive = kr.active;
  if (kr.rose && (st === 'racing') && Math.hypot(G.player.pos.x - tr.kraken.x, G.player.pos.z - tr.kraken.z) < 320) { hud.event(t('ev.krakenRise'), 2500); audio.kraken(); G.camShake = 0.5; }

  // 카운트다운
  if (st === 'countdown') {
    G.countdown -= dt;
    const step = Math.ceil(G.countdown);
    if (step !== G.countStep && step <= 3) {
      G.countStep = step;
      if (step >= 1) { hud.centerMsg(String(step)); audio.countdown(); }
    }
    if (G.countdown <= 0) {
      G.state = 'racing'; G.goTime = G.t; hud.centerMsg(t('center.go'), '#7bed9f'); audio.go();
      G.overtake = { pending: -1, confirmed: G.player.rank };
      // 퍼펙트 스타트: GO 직전 0.45초 안에 전진 키를 눌렀으면 보너스
      const k = G.keys, p = G.player;
      const held = k.KeyW || k.ArrowUp || PTR.down || VK.up;
      if (held && G.throttleKeyTime >= 0 && G.t - G.throttleKeyTime < 0.45) {
        p.speed = p.phys.maxSpeed * 0.6; G.stats.perfectStart = true;
        setTimeout(() => { award(300, t('pop.perfect'), '#7bed9f', () => audio.perfect()); }, 350);
        G.particles.burst(p.pos.x, 1, p.pos.z, 50, { speed: 12, up: 6, life: 1, size: 3, color: 0x7bed9f });
      } else if (held) hud.event(t('ev.earlyStart'), 2500);
    }
    for (const b of G.boats) { b.throttle = 0; b.steer = 0; b.update(dt, G.wind, G.t); }
    updateCamera(dt);
    hud.setRace(G.player.rank, G.boats.length, 1, G.laps, 0);
    hud.setShip(G.player, G.wind);
    hud.updatePortCard(0, G.t);
    hud.setFleet(G.fleet);
    hud.setOrders(G.fleet);
    hud.drawMinimap(tr, G.boats, G.player, G.krakenActive, G.player.tr.foresight);
    renderer.render(scene, camera);
    return;
  }

  if (st === 'racing' || st === 'finished') {
    if (st === 'racing') G.raceTime += dt;
    const diff = difficultyParams(G.difficulty);
    const p = G.player;
    // 콤보 타이머
    if (G.comboTimer > 0) { G.comboTimer -= dt; if (G.comboTimer <= 0) { G.combo = 0; hud.el.combo.classList.add('hidden'); } }
    // 플레이어 입력
    if (G.autoPlayer && !p.finished) { if (aiControl(p, tr, G.boats, p, G.wind, dt, diff, G.krakenActive)) fireCannon(p); }
    else if (!p.finished) {
      const k = G.keys;
      p.throttle = (k.KeyW || k.ArrowUp || VK.up || PTR.down) ? 1 : (k.KeyS || k.ArrowDown || VK.down) ? -0.3 : 0.35;
      const keySteer = ((k.KeyA || k.ArrowLeft || VK.left) ? 1 : 0) - ((k.KeyD || k.ArrowRight || VK.right) ? 1 : 0);
      p.steer = keySteer !== 0 ? keySteer : PTR.steer;
      const wantBoost = !!(k.ShiftLeft || k.ShiftRight || PTR.boost || VK.boost);
      if (wantBoost && !p.boosting && p.boost > 0.08) { p.boosting = true; audio.boost(); }
      if (!wantBoost) p.boosting = false;
      if (k.Space) fireCannon(p);
    } else { p.throttle = 0.4; p.steer = 0; p.boosting = false; }

    updateSlipstream(dt);
    updateTap(dt);
    updateWrongWay(dt);

    // 함대: 동료함 조타 + 함대 항진 보너스
    if (G.fleet && G.fleet.size) {
      const bonus = G.fleet.update(dt, tr, G.boats, G.wind, G.krakenActive);
      p.fleetMul = p.finished ? 1 : bonus;
      if (st === 'racing' && G.fleet.cohesion > 0.6) G.stats.fleetTime += dt;
      // 게이지가 가득 차면 한 번 크게 터뜨리고 비운다
      const quiet = G.chapter?.type === 'guide' && G.mode === 'campaign';
      if (quiet && G.fleet.meter >= 1) G.fleet.meter = 0.9;   // 조용한 호위: 항진은 터지지 않는다
      if (G.fleet.meter >= 1 && st === 'racing' && !quiet) {
        G.fleet.meter = 0;
        p.turbo = Math.max(p.turbo, 2.4);
        for (const c of G.fleet.alive) c.turbo = Math.max(c.turbo, 2.4);
        G.camShake = Math.max(G.camShake, 0.35);
        award(350, t('fleet.surge'), '#7bed9f', () => audio.boost());
      }
      for (const c of G.fleet.consorts) {
        if (c.consort.wantFire && !c.consort.sunk) { c.consort.wantFire = false; fireCannon(c); }
        // 멀리 뒤처졌다가 대열에 합류: 물보라로 합류를 알린다
        if (c.consort.justRejoined) {
          c.consort.justRejoined = false;
          G.particles.burst(c.pos.x, 1.5, c.pos.z, 34, { speed: 9, up: 7, life: 1, size: 4, color: 0xd8ffe8, grav: -6, spread: 3 });
          hud.event(t('fleet.rejoined', { name: c.name }), 1400);
        }
      }
    } else p.fleetMul = 1;

    for (const b of G.boats) {
      if (b.consort) { /* 조타는 Fleet.update가 이미 정했다 */ }
      else if (!b.isPlayer) {
        if (b.finished) { b.throttle = 0.5; b.steer = 0; b.boosting = false; }
        else if (aiControl(b, tr, G.boats, p, G.wind, dt, diff, G.krakenActive)) fireCannon(b);
      }
      b.update(dt, G.wind, G.t);
      // 항적 파티클
      const sr = Math.abs(b.speed) / b.phys.maxSpeed;
      if (sr > 0.1) {
        const n = Math.floor(sr * 3 + Math.random());
        for (let i = 0; i < n; i++) {
          const f = b.forward(); const R = b.phys.radius;
          G.particles.spawn(b.pos.x - f.x * R * 0.8 + (Math.random() - 0.5) * 3, 0.4, b.pos.z - f.z * R * 0.8 + (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 6 - f.x * 3, 0, (Math.random() - 0.5) * 6 - f.z * 3, 1.2 + Math.random(), 2.2 + sr * 2.5, b.boosting ? 0xffe08a : 0xe8f6ff, 0);
          if (sr > 0.5 && Math.random() < 0.6 + SEA.storm * 0.4) G.particles.spawn(b.pos.x + f.x * R * 0.9, 1.5, b.pos.z + f.z * R * 0.9, (Math.random() - 0.5) * 8, 4 + Math.random() * 3 + SEA.storm * 5, (Math.random() - 0.5) * 8, 0.7, 2.5 + SEA.storm * 2, 0xffffff, -14);
        }
      }
      if (b.boosting && b.def.turtle) { const f = b.forward(); G.particles.spawn(b.pos.x + f.x * (b.phys.radius + 2), 2, b.pos.z + f.z * (b.phys.radius + 2), f.x * 20 + (Math.random() - 0.5) * 6, 2, f.z * 20 + (Math.random() - 0.5) * 6, 0.5, 5, 0xff7043, 0); }
    }
    updateTide(dt);
    updateWildlife(dt);
    handleCollisions(dt);
    for (const b of G.boats) { updateProgress(b); if (b.def.trackLock) applyTrackLock(b, dt); }
    updateRanks();
    updateOvertake(dt);
    updateProjectiles(dt);
    updateMission(dt);
    updateCamera(dt);

    audio.setSpeed(Math.abs(p.speed) / p.phys.maxSpeed + SEA.storm * 0.4, p.boosting);
    hud.setRace(p.rank, G.boats.length, p.lap + 1, G.laps, p.finished ? p.finishTime : G.raceTime);
    hud.setShip(p, G.wind);
    hud.setScore(G.score, G.combo, G.comboTimer / COMBO_WINDOW);
    hud.standings(G.boats);
    hud.setFleet(G.fleet);
    hud.setOrders(G.fleet);
    hud.updatePortCard(p.curveIdx / tr.sampleCount, G.t);
    hud.drawMinimap(tr, G.boats, p, G.krakenActive, p.tr.foresight);

    if (st === 'finished') {
      G.finishTimer -= dt;
      const allDone = G.boats.every((b) => b.finished || b.consort?.sunk); // 대파한 동료함은 완주를 기다리지 않는다
      if (G.finishTimer <= 0 || allDone) { showResults(); }
    }
  } else if (st === 'result') {
    for (const b of G.boats) { b.throttle = 0; b.update(dt, G.wind, G.t); }
    updateCamera(dt);
  }
  renderer.render(scene, camera);
}
refreshTitle();
window.__camera = camera; // 디버그용 (테스트에서 화면 투영 확인)
window.__G = G; // 디버그용
window.__dbg = { award, finishBoat, showResults, breakCombo, step, renderer, audio, SAVE, SEL, orderFleet, startRace, showChapters, showFleetScreen, cutscene, waveHeight, HALF: TRACK_HALF_WIDTH }; // 테스트용 훅
loop();
