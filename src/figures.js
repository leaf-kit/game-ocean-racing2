// 역사 인물 22명: 실제 초상화(위키미디어 공용)와 함대 특성
import { LANG } from './i18n.js?v=20261005i';
// portrait: assets/portraits/<id>.jpg (320px), <id>_s.jpg (96px 배지용)
// trait: 함대에 배치했을 때 적용되는 특성. 자세한 계산은 fleet.js의 applyOfficerTraits 참고.
// rank: 영입에 필요한 명성 (0이면 처음부터 사용 가능)

export const TRAITS = {
  windward:     { icon: '⛵', name: '역풍 돌파', desc: '맞바람 감속이 40% 줄어든다' },
  tailwind:     { icon: '💨', name: '순풍 포착', desc: '순풍 보너스가 30% 늘어난다' },
  gunnery:      { icon: '💣', name: '포술', desc: '포격 재장전이 35% 빨라지고 명중 피해가 커진다' },
  navigator:    { icon: '🧭', name: '항해술', desc: '항로 이탈 감속이 절반, 소용돌이 탈출이 빠르다' },
  lookout:      { icon: '🔭', name: '망루', desc: '금화·보급품·두루마리 획득 반경 70% 증가' },
  shipwright:   { icon: '🔨', name: '조선술', desc: '충돌 감속이 절반, 동료함 내구 +40%' },
  quartermaster:{ icon: '🍋', name: '보급', desc: '전속 항해 게이지 충전 50% 빠름' },
  stormrider:   { icon: '⛈', name: '폭풍 항해', desc: '폭풍에 밀리는 힘이 60% 줄어든다' },
  formation:    { icon: '🪶', name: '진형 지휘', desc: '함대 항진 보너스가 두 배가 된다' },
  patron:       { icon: '👑', name: '후원', desc: '명성 획득이 30% 늘어난다' },
  cartographer: { icon: '🗺', name: '해도', desc: '미니맵에 장애물이 미리 표시되고 점수 +15%' },
  corsair:      { icon: '🏴', name: '사략', desc: '포격 명중 시 전속 항해 게이지가 크게 찬다' },
  trader:       { icon: '🏮', name: '교역', desc: '금화와 보물의 점수가 35% 늘어난다' },
  naturalist:   { icon: '🐟', name: '박물', desc: '동물 도감 등록 명성 2배, 교감 게이지가 40% 빨리 찬다' },
};

// role: 게임 안에서의 역할 이름 (표시용)
export const FIGURES = [
  {
    id: 'henry', name: '엔히크 항해왕자', en: 'Prince Henry the Navigator', nation: '포르투갈', years: '1394~1460',
    role: '후원자', trait: 'patron', fame: 0,
    bio: '직접 바다에 나간 적은 없다. 대신 사그레스에 지도 제작자와 조선공과 천문학자를 모아 40년간 아프리카 서해안 탐험을 후원했다. 대항해시대의 문은 그의 서재에서 열렸다.',
    line: '바다는 두려움의 끝이 아니라, 지도의 여백일 뿐이다.',
  },
  {
    id: 'dias', name: '바르톨로메우 디아스', en: 'Bartolomeu Dias', nation: '포르투갈', years: '1450?~1500',
    role: '선봉', trait: 'stormrider', fame: 0,
    bio: '1488년 아프리카 남단을 처음 돌았다. 그가 "폭풍의 곶"이라 이름 붙인 그곳을, 주앙 2세는 "희망봉"으로 고쳐 불렀다. 12년 뒤 그는 바로 그 앞바다의 폭풍에서 사라졌다.',
    line: '나는 그 곶을 폭풍의 곶이라 불렀소. 왕께서는 희망봉이라 하셨지.',
  },
  {
    id: 'columbus', name: '크리스토퍼 콜럼버스', en: 'Christopher Columbus', nation: '제노바', years: '1451~1506',
    role: '항해장', trait: 'tailwind', fame: 0,
    bio: '지구 둘레를 실제보다 훨씬 작게 계산했다. 그 착오 덕에 서쪽으로 배를 돌릴 용기를 냈고, 인도 대신 아메리카에 닿았다. 그는 죽을 때까지 그곳을 인도라 믿었다.',
    line: '서풍을 믿으시오. 바다는 생각보다 좁소.',
  },
  {
    id: 'dagama', name: '바스코 다 가마', en: 'Vasco da Gama', nation: '포르투갈', years: '1460?~1524',
    role: '제독', trait: 'navigator', fame: 600,
    bio: '1497년 리스본을 떠나 희망봉을 돌고 인도 캘리컷에 닿았다. 항해 거리 약 4만 km — 콜럼버스 1차 항해의 네 배였다. 유럽과 아시아를 잇는 바닷길이 그때 열렸다.',
    line: '후추 한 자루가 은 한 자루와 같은 값이오. 항로만 열면 되오.',
  },
  {
    id: 'vespucci', name: '아메리고 베스푸치', en: 'Amerigo Vespucci', nation: '피렌체', years: '1454~1512',
    role: '관측사', trait: 'cartographer', fame: 800,
    bio: '남아메리카 해안을 따라 항해하며, 이곳이 아시아가 아니라 전혀 새로운 대륙이라고 주장했다. 1507년 발트제뮐러의 세계지도가 그 대륙에 그의 이름을 붙였다 — 아메리카.',
    line: '이건 인도가 아니오. 아무도 모르는 땅이오.',
  },
  {
    id: 'magellan', name: '페르디난드 마젤란', en: 'Ferdinand Magellan', nation: '포르투갈', years: '1480~1521',
    role: '원정대장', trait: 'windward', fame: 1200,
    bio: '포르투갈 사람이면서 스페인 왕의 후원으로 세계 일주 원정을 이끌었다. 남아메리카 끝의 해협을 빠져나와 만난 잔잔한 바다에 "태평양"이라 이름 붙였고, 필리핀 막탄에서 전사했다.',
    line: '해협은 있소. 없다면 만들어서라도 지나가겠소.',
  },
  {
    id: 'elcano', name: '후안 세바스티안 엘카노', en: 'Juan Sebastián Elcano', nation: '스페인', years: '1476~1526',
    role: '부제독', trait: 'quartermaster', fame: 1600,
    bio: '마젤란이 죽은 뒤 빅토리아호의 키를 잡고 1522년 스페인으로 돌아왔다. 출항 270명 중 살아 돌아온 사람은 18명. 황제는 그의 문장에 지구를 그리고 이렇게 새겼다 — "네가 나를 처음 일주했다."',
    line: '돌아가는 것도 항해요. 오히려 그쪽이 더 어렵소.',
  },
  {
    id: 'zhenghe', name: '정화', en: 'Zheng He', nation: '명나라', years: '1371~1433',
    role: '대함대 제독', trait: 'formation', fame: 2200,
    bio: '명나라 환관 제독. 1405년부터 일곱 차례, 3백 척 2만 7천 명의 대함대를 이끌고 동남아시아·인도·아라비아·동아프리카까지 항해했다. 콜럼버스보다 90년 앞선 원양 항해였다.',
    line: '한 척으로 가면 배요, 백 척으로 가면 나라요.',
  },
  {
    id: 'yi', name: '이순신', en: 'Yi Sun-sin', nation: '조선', years: '1545~1598',
    role: '수군통제사', trait: 'shipwright', fame: 3000,
    bio: '임진왜란 23전 23승. 한산도에서 학익진으로 일본 수군을 포위해 무너뜨렸고, 명량에서는 13척으로 130여 척을 울돌목의 물살 속에 가두었다. 철갑을 두른 거북선이 언제나 선봉에 섰다.',
    line: '아직 신에게는 열두 척의 배가 남아 있사옵니다.',
  },
  {
    id: 'drake', name: '프랜시스 드레이크', en: 'Francis Drake', nation: '잉글랜드', years: '1540?~1596',
    role: '사략선장', trait: 'corsair', fame: 1800,
    bio: '여왕의 허가를 받은 해적. 골든하인드호로 스페인 보물선을 털며 세계를 일주했고, 돌아온 갑판 위에서 기사 작위를 받았다. 1588년 무적함대를 무너뜨린 함대에도 그가 있었다.',
    line: '스페인 은은 바다에서 주인이 바뀌는 법이오.',
  },
  {
    id: 'albuquerque', name: '아폰수 드 알부케르크', en: 'Afonso de Albuquerque', nation: '포르투갈', years: '1453~1515',
    role: '총독', trait: 'gunnery', fame: 2000,
    bio: '고아·말라카·호르무즈를 차례로 점령해 인도양의 길목을 모두 포르투갈의 것으로 만들었다. "동방의 사자"라 불렸다. 그가 세운 해상 제국은 대포 위에 서 있었다.',
    line: '바다는 넓지만, 길목은 세 군데뿐이오.',
  },
  {
    id: 'barbarossa', name: '하이레딘 바르바로사', en: 'Hayreddin Barbarossa', nation: '오스만', years: '1478?~1546',
    role: '카푸단 파샤', trait: 'corsair', fame: 2400,
    bio: '붉은 수염의 바르바리 해적에서 오스만 제국의 대제독이 되었다. 갤리 함대로 지중해를 손에 넣었고, 프레베자에서 신성동맹의 연합 함대를 격파했다.',
    line: '노는 바람을 기다리지 않소.',
  },
  {
    id: 'piri', name: '피리 레이스', en: 'Piri Reis', nation: '오스만', years: '1465?~1553',
    role: '해도 제작자', trait: 'cartographer', fame: 1400,
    bio: '오스만 제독이자 지도 제작자. 1513년에 그린 지도에는 남아메리카 해안선이 놀랍도록 정확히 담겨 있다. 항해 안내서 『바흐리예』에 지중해의 모든 항구를 기록했다.',
    line: '가보지 않은 바다도, 남의 해도를 읽으면 절반은 간 것이오.',
  },
  {
    id: 'mercator', name: '게라르두스 메르카토르', en: 'Gerardus Mercator', nation: '플랑드르', years: '1512~1594',
    role: '지도학자', trait: 'navigator', fame: 1000,
    bio: '1569년, 나침반 방위를 직선으로 그릴 수 있는 새 도법을 발표했다. 극지방은 터무니없이 부풀었지만 항해사에게는 그게 중요하지 않았다. 그의 도법은 450년이 지난 지금도 쓰인다.',
    line: '땅을 정확히 그리는 것과, 뱃길을 정확히 그리는 것은 다른 일이오.',
  },
  {
    id: 'urdaneta', name: '안드레스 데 우르다네타', en: 'Andrés de Urdaneta', nation: '스페인', years: '1498~1568',
    role: '수도사·항해사', trait: 'tailwind', fame: 1600,
    bio: '수도사이면서 항해사였다. 1565년 필리핀에서 북쪽으로 크게 올라가 쿠로시오 해류와 편서풍을 타면 아메리카로 돌아갈 수 있다는 것을 증명했다. 마닐라 갤리온 무역 250년이 여기서 시작됐다.',
    line: '가는 길과 오는 길이 같을 이유는 없소.',
  },
  {
    id: 'cabral', name: '페드루 알바르스 카브랄', en: 'Pedro Álvares Cabral', nation: '포르투갈', years: '1467?~1520',
    role: '함대장', trait: 'lookout', fame: 900,
    bio: '1500년 인도로 향하던 중 무역풍을 피해 서쪽으로 크게 돌다가 브라질 해안에 닿았다. 함대에는 희망봉을 처음 돈 디아스도 타고 있었고, 그는 그 항해에서 돌아오지 못했다.',
    line: '길을 잃는 것과 길을 찾는 것은 종이 한 장 차이요.',
  },
  {
    id: 'balboa', name: '바스코 누녜스 데 발보아', en: 'Vasco Núñez de Balboa', nation: '스페인', years: '1475~1519',
    role: '탐험가', trait: 'lookout', fame: 700,
    bio: '1513년 파나마 지협의 밀림을 걸어 넘어, 유럽인 가운데 처음으로 태평양을 보았다. 그는 그 바다를 "남쪽 바다"라 불렀다.',
    line: '산을 넘으면 또 바다가 있소. 그게 이 세상의 구조요.',
  },
  {
    id: 'catalina', name: '카탈리나 데 에라우소', en: 'Catalina de Erauso', nation: '스페인', years: '1592~1650',
    role: '기수', trait: 'gunnery', fame: 1100,
    bio: '열다섯에 수녀원을 탈출해 남자 옷을 입고 배에 올랐다. 신대륙에서 군인·상인·도박사로 살며 몇 번이나 죽을 고비를 넘겼고, 교황에게 직접 그 삶을 인정받았다. 실존 인물이다.',
    line: '이름은 바꿀 수 있소. 항로는 못 바꾸오.',
  },
  {
    id: 'tasman', name: '아벨 타스만', en: 'Abel Tasman', nation: '네덜란드', years: '1603~1659',
    role: '탐험 선장', trait: 'windward', fame: 1300,
    bio: '네덜란드 동인도회사의 명으로 남쪽 대륙을 찾아 나섰다. 태즈메이니아와 뉴질랜드, 피지에 닿았지만 정작 오스트레일리아 본토는 지나쳤다. 회사는 그 항해를 실패로 평가했다.',
    line: '아무것도 못 찾았다고? 나는 세 개의 섬을 찾았소.',
  },
  {
    id: 'raleigh', name: '월터 롤리', en: 'Sir Walter Raleigh', nation: '잉글랜드', years: '1552?~1618',
    role: '사략 제독', trait: 'patron', fame: 1500,
    bio: '엘리자베스 1세의 총신이자 탐험가. 북아메리카에 식민지를 세우려 했고, 남아메리카의 황금도시 엘도라도를 두 번 찾아 나섰다. 끝내 찾지 못했고, 탑에 갇혀 세계사를 썼다.',
    line: '황금은 못 찾았소. 대신 이야기를 가져왔지.',
  },
  {
    id: 'harrison', name: '존 해리슨', en: 'John Harrison', nation: '잉글랜드', years: '1693~1776',
    role: '시계 장인', trait: 'cartographer', fame: 2600,
    bio: '배 위에서는 시계가 맞지 않아 경도를 알 수 없었고, 그 때문에 수천 명이 바다에서 죽었다. 목수 출신의 시계공이 40년을 매달려 H4를 만들었다. 자메이카까지 가는 동안 오차는 단 5초였다.',
    line: '바다에서 길을 잃는 건 방향이 아니라 시간 때문이오.',
  },
  {
    id: 'isabella', name: '이사벨 1세', en: 'Isabella I of Castile', nation: '카스티야', years: '1451~1504',
    role: '군주', trait: 'patron', fame: 2800,
    bio: '콜럼버스의 제안을 거절했던 궁정 학자들을 물리치고 세 척의 배를 내주었다. 그 결정 하나로 스페인은 한 세기 동안 세계에서 가장 부유한 나라가 되었다.',
    line: '가서 보고 오시오. 배는 내가 내겠소.',
  },
  // ---- 부캉이의 바다와 함께 들어온 세 사람 ----
  // 셋 다 전해지는 초상이 없다. 얼굴을 지어내지 않고 실루엣 배지를 쓴다.
  {
    id: 'jangbogo', name: '장보고', en: 'Jang Bogo', nation: '신라', years: '?~846',
    role: '해상왕', trait: 'trader', fame: 1700, noPortrait: true,
    bio: '완도에 청해진을 세우고 신라와 당과 일본을 잇는 바닷길을 쥐었다. 해적을 눌러 항로를 열고 그 길로 교역을 했다. 부산 앞바다에서 가장 오래된 뱃사람이다. 전해지는 초상은 없다.',
    line: '바다를 지키는 자가 바다로 먹고산다.',
  },
  {
    id: 'choebu', name: '최부', en: 'Choe Bu', nation: '조선', years: '1454~1504',
    role: '표류자', trait: 'navigator', fame: 2300, noPortrait: true,
    bio: '제주에서 배를 탔다가 풍랑에 밀려 중국 저장성에 닿았다. 걸어서 북경을 거쳐 조선으로 돌아오는 데 여섯 달이 걸렸고, 그 여정을 『표해록』에 적었다. 전해지는 초상은 없다.',
    line: '바다가 데려다 놓은 곳에서부터 걸어서 돌아왔소.',
  },
  {
    id: 'jeongyakjeon', name: '정약전', en: 'Jeong Yak-jeon', nation: '조선', years: '1758~1816',
    role: '박물학자', trait: 'naturalist', fame: 3200, noPortrait: true,
    bio: '흑산도로 유배되어 거기서 생을 마쳤다. 섬사람들에게 묻고 직접 보아 바다 생물을 정리한 『자산어보』를 남겼다. 이름과 생김새와 맛과 쓰임을 함께 적은 책이다. 전해지는 초상은 없다.',
    line: '이름을 붙여 적어 두지 않으면, 본 것도 못 본 것이 되오.',
  },
];

export const FIGURE_MAP = Object.fromEntries(FIGURES.map((f) => [f.id, f]));
export const findFigure = (id) => FIGURE_MAP[id] || FIGURES[0];

// 표시용 이름. 영어를 고르면 원어 이름으로 보여 준다.
// (전기와 캠페인 대사는 한국어로만 쓰여 있다)
export const figName = (f) => (LANG === 'en' ? f.en : f.name);

// 초상 이미지 경로 (big: 320px 카드용, small: 96px 배지용)
// 전해지는 초상이 없는 인물은 얼굴 없는 실루엣 배지를 쓴다. 없는 얼굴을 지어내지 않는다.
export const portraitSrc = (id, small = false) => {
  const f = FIGURE_MAP[id];
  if (f && f.noPortrait) return `./assets/portraits/${id}.svg`;
  return `./assets/portraits/${id}${small ? '_s' : ''}.jpg`;
};

// 명성으로 해금되는 인물 목록 (명성 오름차순)
export const byFame = () => [...FIGURES].sort((a, b) => a.fame - b.fame);
