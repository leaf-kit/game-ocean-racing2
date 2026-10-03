// 말씀 아이템 데이터와 암송 로직.
//
// 한국어 본문은 저작권 문제가 없도록 이 저장소에서 직접 평이하게 옮긴 것이고,
// 영어 본문은 퍼블릭 도메인인 흠정역(KJV)이다.
// 쓰고 싶은 번역본이 따로 있으면 아래 VERSES 의 ko / en 만 바꾸면 된다. 다른 코드는 손댈 필요가 없다.
//
// 고른 구절은 모두 바다·바람·폭풍·길·담대함에 관한 것이라 항해와 맞물린다.

export const VERSES = [
  { id: 'ps107-23', ref: '시편 107:23-24', refEn: 'Psalm 107:23-24',
    ko: '배를 타고 바다로 나가 큰 물에서 일하는 자들은 여호와께서 하시는 일과 그 깊은 곳에서 행하시는 기이한 일을 보나니',
    en: 'They that go down to the sea in ships, that do business in great waters; these see the works of the LORD, and his wonders in the deep.' },
  { id: 'ps107-29', ref: '시편 107:29', refEn: 'Psalm 107:29',
    ko: '광풍을 잠잠하게 하시매 물결도 그치는도다',
    en: 'He maketh the storm a calm, so that the waves thereof are still.' },
  { id: 'mk4-39', ref: '마가복음 4:39', refEn: 'Mark 4:39',
    ko: '바람을 꾸짖으시며 바다더러 이르시되 잠잠하라 고요하라 하시니 바람이 그치고 아주 잔잔하여지더라',
    en: 'He rebuked the wind, and said unto the sea, Peace, be still. And the wind ceased, and there was a great calm.' },
  { id: 'isa43-2', ref: '이사야 43:2', refEn: 'Isaiah 43:2',
    ko: '네가 물 가운데로 지날 때에 내가 너와 함께 할 것이라 강을 건널 때에 물이 너를 침몰하지 못할 것이며',
    en: 'When thou passest through the waters, I will be with thee; and through the rivers, they shall not overflow thee.' },
  { id: 'pr3-5', ref: '잠언 3:5-6', refEn: 'Proverbs 3:5-6',
    ko: '너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라 너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라',
    en: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.' },
  { id: 'ps119-105', ref: '시편 119:105', refEn: 'Psalm 119:105',
    ko: '주의 말씀은 내 발에 등이요 내 길에 빛이니이다',
    en: 'Thy word is a lamp unto my feet, and a light unto my path.' },
  { id: 'jos1-9', ref: '여호수아 1:9', refEn: 'Joshua 1:9',
    ko: '강하고 담대하라 두려워하지 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 함께 하느니라',
    en: 'Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.' },
  { id: 'mt14-27', ref: '마태복음 14:27', refEn: 'Matthew 14:27',
    ko: '안심하라 나니 두려워하지 말라',
    en: 'Be of good cheer; it is I; be not afraid.' },
  { id: 'ps121-8', ref: '시편 121:8', refEn: 'Psalm 121:8',
    ko: '여호와께서 너의 출입을 지금부터 영원까지 지키시리로다',
    en: 'The LORD shall preserve thy going out and thy coming in from this time forth, and even for evermore.' },
  { id: 'isa40-31', ref: '이사야 40:31', refEn: 'Isaiah 40:31',
    ko: '오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요 달음박질하여도 곤비하지 아니하겠고',
    en: 'They that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary.' },
  { id: 'ps139-9', ref: '시편 139:9-10', refEn: 'Psalm 139:9-10',
    ko: '내가 새벽 날개를 치며 바다 끝에 가서 거주할지라도 거기서도 주의 손이 나를 인도하시며 주의 오른손이 나를 붙드시리이다',
    en: 'If I take the wings of the morning, and dwell in the uttermost parts of the sea; even there shall thy hand lead me, and thy right hand shall hold me.' },
  { id: 'ps46-1', ref: '시편 46:1', refEn: 'Psalm 46:1',
    ko: '하나님은 우리의 피난처시요 힘이시니 환난 중에 만날 큰 도움이시라',
    en: 'God is our refuge and strength, a very present help in trouble.' },
  { id: 'pr16-9', ref: '잠언 16:9', refEn: 'Proverbs 16:9',
    ko: '사람이 마음으로 자기의 길을 계획할지라도 그의 걸음을 인도하시는 이는 여호와시니라',
    en: "A man's heart deviseth his way: but the LORD directeth his steps." },
  { id: 'php4-13', ref: '빌립보서 4:13', refEn: 'Philippians 4:13',
    ko: '내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라',
    en: 'I can do all things through Christ which strengtheneth me.' },
  { id: 'ps27-1', ref: '시편 27:1', refEn: 'Psalm 27:1',
    ko: '여호와는 나의 빛이요 나의 구원이시니 내가 누구를 두려워하리요',
    en: 'The LORD is my light and my salvation; whom shall I fear?' },
  { id: 'ps23-1', ref: '시편 23:1', refEn: 'Psalm 23:1',
    ko: '여호와는 나의 목자시니 내게 부족함이 없으리로다',
    en: 'The LORD is my shepherd; I shall not want.' },
  { id: 'jn8-12', ref: '요한복음 8:12', refEn: 'John 8:12',
    ko: '나는 세상의 빛이니 나를 따르는 자는 어둠에 다니지 아니하고 생명의 빛을 얻으리라',
    en: 'I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life.' },
  { id: 'rom8-28', ref: '로마서 8:28', refEn: 'Romans 8:28',
    ko: '하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라',
    en: 'All things work together for good to them that love God, to them who are the called according to his purpose.' },
];

export const VERSE_MAP = Object.fromEntries(VERSES.map((v) => [v.id, v]));
export const findVerse = (id) => VERSE_MAP[id] || VERSES[0];

// 몇 번 만나야 '암송'으로 치는가
export const MEMORIZED_AT = 6;

// 만난 횟수에 따른 단계.
//   0    처음 — 본문을 그대로 보여 준다
//   1~2  한 칸 비우고 잠시 뒤 채워 준다
//   3~4  두 칸
//   5    세 칸
//   6+   암송 — 장절만 먼저 띄우고 곧 본문 전체를 보여 준다
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
