// 진행 저장: 명성, 해금한 함선·인물, 캠페인 진행, 설정
// localStorage 한 칸(aos2_save)에 JSON으로 저장한다. 실패해도 게임은 그대로 돌아간다.

const KEY = 'aos2_save';

const DEFAULTS = {
  v: 2,
  name: '',            // 제독 이름
  admiral: 'henry',    // 기함 제독으로 고른 인물
  fame: 0,             // 누적 명성
  chapter: 0,          // 클리어한 챕터 수 (0 = 아직 프롤로그 전)
  bestRank: {},        // 챕터별 최고 등급 { chapterId: 'S'|'A'|'B'|'C' }
  bestTime: {},        // 챕터별 최고 기록 (초)
  officers: [],        // 함대에 배치한 부제독 id (명성에 따라 최대 5칸)
  ship: 'caravel_latina',
  fleetForm: 'line',   // 진형
  fleetSpacing: 'normal', // 진형 간격 (tight/normal/loose)
  verses: {},          // 말씀별 만난 횟수 { verseId: n }
  seenFigures: [],     // 도감에서 본 인물
  seenDiscoveries: [],
  lang: 'ko',
  freeplay: false,     // 자유 항해 해금 (프롤로그 클리어 시)
  freeMap: 'caribbean',// 자유 항해에서 마지막으로 고른 맵
  // --- v2: 부캉이의 바다 ---
  seenAnimals: [],     // 동물 도감에 등록된 종 (wildlife.js 의 ANIMALS 키)
  bestBond: 0,         // 교감 게이지 최고 기록 (0~1)
  titles: [],          // 얻은 칭호
  cinematics: true,    // 등장 연출 재생 여부 (저사양·접근성용)
};

// 구버전 세이브 올리기.
// v1 에는 위의 v2 칸들이 없다. read() 가 DEFAULTS 와 병합하므로 값은 이미 채워지지만,
// 배열과 객체는 참조를 나눠 쓰지 않도록 여기서 한 번 더 복사한다.
function migrate(d) {
  if (!Array.isArray(d.seenAnimals)) d.seenAnimals = [];
  if (!Array.isArray(d.titles)) d.titles = [];
  if (typeof d.bestBond !== 'number') d.bestBond = 0;
  if (typeof d.cinematics !== 'boolean') d.cinematics = true;
  d.v = DEFAULTS.v;
  return d;
}

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const d = JSON.parse(raw);
    return migrate({ ...DEFAULTS, ...d, bestRank: { ...d.bestRank }, bestTime: { ...d.bestTime }, verses: { ...d.verses } });
  } catch (_) { return { ...DEFAULTS }; }
}

export const SAVE = read();

export function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(SAVE)); } catch (_) { /* 시크릿 모드 등: 무시 */ }
}

export function addFame(n) {
  SAVE.fame = Math.max(0, Math.round(SAVE.fame + n));
  persist();
  return SAVE.fame;
}

// 챕터 결과 기록. 더 좋은 등급/기록일 때만 갱신하고, 갱신되었는지 돌려준다.
const RANK_ORDER = { S: 4, A: 3, B: 2, C: 1 };
export function recordChapter(id, rank, time, cleared) {
  let improved = false;
  const prev = SAVE.bestRank[id];
  if (!prev || RANK_ORDER[rank] > RANK_ORDER[prev]) { SAVE.bestRank[id] = rank; improved = true; }
  if (time > 0 && (!SAVE.bestTime[id] || time < SAVE.bestTime[id])) { SAVE.bestTime[id] = time; improved = true; }
  if (cleared) SAVE.chapter = Math.max(SAVE.chapter, id + 1);
  persist();
  return improved;
}

export function isUnlocked(fameCost) { return SAVE.fame >= fameCost; }

export function markSeen(kind, name) {
  const list = kind === 'figure' ? SAVE.seenFigures : kind === 'animal' ? SAVE.seenAnimals : SAVE.seenDiscoveries;
  if (!list.includes(name)) { list.push(name); persist(); return true; }
  return false;
}

// 말씀을 한 번 더 만났다. 갱신된 횟수를 돌려준다.
export function meetVerse(id) {
  SAVE.verses[id] = (SAVE.verses[id] || 0) + 1;
  persist();
  return SAVE.verses[id];
}

// 교감 최고 기록. 갱신됐으면 true.
export function recordBond(v) {
  if (v <= SAVE.bestBond) return false;
  SAVE.bestBond = v; persist(); return true;
}

// 칭호를 얻는다. 처음 얻은 것이면 true.
export function grantTitle(name) {
  if (!name || SAVE.titles.includes(name)) return false;
  SAVE.titles.push(name); persist(); return true;
}

export function resetSave() {
  try { localStorage.removeItem(KEY); } catch (_) { /* 무시 */ }
  Object.assign(SAVE, DEFAULTS, { bestRank: {}, bestTime: {}, officers: [], verses: {}, seenFigures: [], seenDiscoveries: [], seenAnimals: [], titles: [] });
}
