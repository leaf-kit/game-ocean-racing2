// 명언 아이템 데이터와 암송 로직.
//
// 항해와 바다에 관한 말들이다. 뱃사람이 직접 한 말, 바다를 쓴 사람의 글,
// 그리고 비문과 사서에 남은 기록에서 골랐다.
//
// 고르는 규칙 셋.
//  1. 출처가 확인되는 것만 쓴다. 인터넷에 떠돌지만 출처가 없는 말은 넣지 않는다.
//     "교회는 지구가 평평하다 하지만 나는 둥근 것을 보았다" 같은 마젤란 어록은
//     그가 한 말이라는 근거가 없다. 그래서 여기 없다.
//  2. 저작권이 풀린 것만 쓴다. 전부 1928년 이전이거나 사서, 비문이다.
//  3. 한국어는 이 저장소에서 직접 옮겼다. 원문의 결을 살리되 읽기 쉽게 풀었다.
//     한문과 라틴어는 원문을 ref 에 함께 적어 둔다.

export const QUOTES = [
  { id: 'yi-twelve', ref: '이순신 · 1597년 장계', refEn: 'Yi Sun-sin, memorial to the king, 1597',
    ko: '지금 신에게는 아직 열두 척의 배가 남아 있사옵니다',
    en: 'Your Majesty, I still have twelve ships left.' },
  { id: 'yi-death', ref: '이순신 · 1598년 노량', refEn: 'Yi Sun-sin, Noryang, 1598',
    ko: '싸움이 급하다. 나의 죽음을 말하지 마라',
    en: 'The battle is at its height. Do not announce my death.' },
  { id: 'yi-hansan', ref: '이순신 · 「한산도가」', refEn: 'Yi Sun-sin, "Song of Hansando"',
    ko: '한산섬 달 밝은 밤에 수루에 혼자 앉아 큰 칼 옆에 차고 깊은 시름 하는 적에',
    en: 'On Hansan isle, under a bright moon, I sit alone in the watchtower, a long sword at my side, sunk deep in worry.' },
  { id: 'jang-cheonghae', ref: '장보고 · 『삼국사기』', refEn: 'Jang Bogo, History of the Three Kingdoms',
    ko: '중국 어디를 가나 우리나라 사람을 종으로 부리고 있습니다. 청해에 진을 두어 도적이 사람을 붙잡아 가지 못하게 하소서',
    en: 'Everywhere in China our people are kept as slaves. Let me set a garrison at Cheonghae so that raiders can no longer carry them off.' },
  { id: 'zhenghe-stele', ref: '정화 함대 비문 · 1431년 복건 장락', refEn: 'Zheng He fleet stele, Changle, 1431',
    ko: '미친 파도가 산처럼 솟았으나, 우리는 넓은 길을 걷듯 건너갔다',
    en: 'We crossed wild waves rising like mountains as if we walked a broad road.' },
  { id: 'elcano-primus', ref: '엘카노의 문장 · 1523년', refEn: 'Coat of arms granted to Elcano, 1523',
    ko: '네가 나를 처음 일주했다',
    en: 'You were the first to go around me.' },
  { id: 'pompey-navigare', ref: '폼페이우스 · 플루타르코스 『영웅전』', refEn: 'Pompey, in Plutarch\'s Lives',
    ko: '항해는 해야 한다. 사는 것은 꼭 해야 할 일이 아니다',
    en: 'To sail is necessary. To live is not necessary.' },
  { id: 'drake-glory', ref: '프랜시스 드레이크 · 1587년 편지', refEn: 'Francis Drake, letter, 1587',
    ko: '큰일에는 시작이 있어야 한다. 그러나 참된 영광은 끝까지 이어 가 온전히 마치는 데서 나온다',
    en: 'There must be a beginning of any great matter, but the continuing unto the end until it be thoroughly finished yields the true glory.' },
  { id: 'cook-farther', ref: '제임스 쿡 · 항해일지', refEn: 'James Cook, journals',
    ko: '나는 누구보다 멀리 가고 싶었을 뿐 아니라, 사람이 갈 수 있는 끝까지 가고 싶었다',
    en: 'I had ambition not only to go farther than any one had been before, but as far as it was possible for man to go.' },
  { id: 'camoes-lusiadas', ref: '카몽이스 · 『우스 루지아다스』 1572년', refEn: 'Camões, The Lusiads, 1572',
    ko: '서쪽 루지타니아 바닷가를 떠나, 일찍이 아무도 가 본 적 없는 바다를 건너간 이들을 노래하노라',
    en: 'I sing of those who left the western shore of Lusitania and sailed through seas no man had sailed before.' },
  { id: 'masefield-fever', ref: '존 메이스필드 · 「바다 열병」 1902년', refEn: 'John Masefield, "Sea-Fever", 1902',
    ko: '나는 다시 바다로 내려가야 한다. 외로운 바다와 하늘로. 내가 바라는 것은 큰 배 한 척과, 그 배를 이끌 별 하나뿐이다',
    en: 'I must go down to the seas again, to the lonely sea and the sky, and all I ask is a tall ship and a star to steer her by.' },
  { id: 'conrad-mirror', ref: '조지프 콘래드 · 『바다의 거울』 1906년', refEn: 'Joseph Conrad, The Mirror of the Sea, 1906',
    ko: '바다는 한 번도 사람에게 다정한 적이 없다. 기껏해야 사람의 들뜸에 공범이 되어 주었을 뿐이다',
    en: 'The sea has never been friendly to man. At most it has been the accomplice of human restlessness.' },
  { id: 'melville-grim', ref: '허먼 멜빌 · 『모비딕』 1851년', refEn: 'Herman Melville, Moby-Dick, 1851',
    ko: '입가가 굳어지는 때가 오면, 나는 되도록 빨리 바다로 나갈 때가 되었다고 여긴다',
    en: 'Whenever I find myself growing grim about the mouth, I account it high time to get to sea as soon as I can.' },
  { id: 'coleridge-water', ref: '콜리지 · 「늙은 수부의 노래」 1798년', refEn: 'Coleridge, "The Rime of the Ancient Mariner", 1798',
    ko: '물, 사방이 물인데, 마실 물은 한 방울도 없구나',
    en: 'Water, water, every where, nor any drop to drink.' },
  { id: 'verne-sea', ref: '쥘 베른 · 『해저 2만리』 1870년', refEn: 'Jules Verne, Twenty Thousand Leagues Under the Sea, 1870',
    ko: '바다가 전부다. 바다는 땅을 덮고, 숨 쉬며, 그 자체로 살아 있다',
    en: 'The sea is everything. It covers the earth, it breathes, it is alive in itself.' },
  { id: 'shakespeare-tide', ref: '셰익스피어 · 『율리우스 카이사르』', refEn: 'Shakespeare, Julius Caesar',
    ko: '사람의 일에도 물때가 있다. 밀물에 올라타면 행운에 닿는다',
    en: 'There is a tide in the affairs of men, which, taken at the flood, leads on to fortune.' },
  { id: 'shedd-harbor', ref: '존 A. 셰드 · 1928년', refEn: 'John A. Shedd, 1928',
    ko: '항구에 있는 배는 안전하다. 그러나 배는 그러라고 만든 것이 아니다',
    en: 'A ship in harbor is safe, but that is not what ships are built for.' },
];

export const QUOTE_MAP = Object.fromEntries(QUOTES.map((v) => [v.id, v]));
export const findQuote = (id) => QUOTE_MAP[id] || QUOTES[0];

// 몇 번 만나야 '외웠다'고 치는가
export const MEMORIZED_AT = 6;

// 만난 횟수에 따른 단계.
//   0    처음 — 본문을 그대로 보여 준다
//   1~2  한 칸 비우고 잠시 뒤 채워 준다
//   3~4  두 칸
//   5    세 칸
//   6+   암송 — 누가 한 말인지만 먼저 띄우고 곧 본문 전체를 보여 준다
export function stageOf(count) {
  if (count <= 0) return { blanks: 0, kind: 'first' };
  if (count <= 2) return { blanks: 1, kind: 'fill' };
  if (count <= 4) return { blanks: 2, kind: 'fill' };
  if (count < MEMORIZED_AT) return { blanks: 3, kind: 'fill' };
  return { blanks: 0, kind: 'recite' };
}

// 본문에서 빈칸으로 만들 낱말을 고른다.
// 조사만 남기고 긴 낱말부터 지워야 문장이 읽히면서도 떠올릴 거리가 생긴다.
function pickBlanks(text, n) {
  const words = text.split(/\s+/);
  const idx = words
    .map((w, i) => ({ i, len: w.replace(/[^\p{L}\p{N}]/gu, '').length }))
    .filter((w) => w.len >= 2)
    .sort((a, b) => b.len - a.len || a.i - b.i)
    .slice(0, n)
    .map((w) => w.i)
    .sort((a, b) => a - b);
  return new Set(idx);
}

// 빈칸이 뚫린 본문과, 채워진 본문을 함께 돌려준다.
// 채워진 쪽은 빈칸이던 낱말을 <b>로 감싸 어디가 비었었는지 눈에 남게 한다.
export function blankOut(text, n) {
  if (n <= 0) return { masked: text, filled: text };
  const words = text.split(/\s+/);
  const picks = pickBlanks(text, n);
  const masked = words.map((w, i) => (picks.has(i) ? '○'.repeat(Math.max(2, w.replace(/[^\p{L}\p{N}]/gu, '').length)) : w)).join(' ');
  const filled = words.map((w, i) => (picks.has(i) ? `<b>${w}</b>` : w)).join(' ');
  return { masked, filled };
}
