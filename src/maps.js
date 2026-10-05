// 맵 정의: 항로 모양, 섬 스타일, 물빛, 폭풍 빈도, 소용돌이 등장 시점
// whirl: 소용돌이 두 곳의 등장 진행률. 1 보다 크면 그 판에서는 나오지 않는다.
// points: 항로 제어점 [x, z] (스케일 적용 전). style: tropical 열대섬 / atoll 환초 / rocky 절벽섬 / ice 빙산 / coast 해안 절벽 / harbor 항구 수로 / river 강
//   karst 석회 돌기둥섬(하롱베이) / space 우주(소행성, 하늘에 행성)
// 강 맵(style: 'river')은 양쪽이 모두 뭍이다. banks 가 그 뭍의 모습을, bridges 가 건너는 다리 수를 정한다.
//   banks: city 도시 호안 / jungle 정글 / desert 사막 / castle 유럽 구시가 / gorge 협곡 / swamp 늪
//          venice 물가에 바로 선 색색의 궁전 / paris 크림빛 석조 건물과 회청색 지붕 / metro 마천루
// village: 절벽섬 위에 흰 집과 파란 돔을 얹는다 (에게해)
// tour: 관광 명소·도시 맵. space: 우주 맵 (시간대는 늘 밤, 구름 대신 행성)
// 강에는 크라켄이 없고(kraken: 2) 폭풍도 거의 없다. 대신 좁은 폭과 교각, 모래퉁이 위협이 된다.
export const MAPS = [
  {
    id: 'caribbean', name: '카리브 군도', en: 'Caribbean Isles',
    desc: '열대 섬과 산호초가 흩어진 따뜻한 바다. 기본 항로.', descEn: 'Warm waters dotted with tropical islands and reefs. The classic route.',
    scale: 0.82, style: 'tropical', storm: 1.0, whirl: [0.75, 2], kraken: 0.9,
    points: [[0, 0], [360, 0], [640, 90], [740, 350], [580, 570], [310, 480], [130, 650], [-170, 720], [-470, 580], [-640, 300], [-560, 40], [-360, -120], [-200, -60], [-100, -10]],
  },
  {
    id: 'pacific', name: '태평양', en: 'Pacific Ocean',
    desc: '끝없이 넓은 대양. 긴 직선 구간과 큰 너울, 잦은 폭풍.', descEn: 'The endless ocean. Long straights, great swells and frequent storms.',
    scale: 0.9, style: 'atoll', storm: 1.7, whirl: [0.6, 2], kraken: 0.85, tint: { deep: 0x0538a8, shallow: 0x1cb4ea },
    points: [[0, 0], [500, -40], [900, 60], [1050, 320], [900, 620], [500, 720], [80, 700], [-380, 640], [-720, 420], [-760, 120], [-560, -120], [-260, -110]],
  },
  {
    id: 'mediterranean', name: '지중해', en: 'Mediterranean',
    desc: '섬 사이를 누비는 굽이진 항로. 잔잔한 바다, 절벽과 올리브빛 언덕.', descEn: 'A winding course threading between islands. Calm seas, cliffs and olive hills.',
    scale: 0.78, style: 'rocky', storm: 0.5, whirl: [0.5, 0.8], kraken: 0.9, tint: { deep: 0x0a4a90, shallow: 0x2fb8cc },
    points: [[0, 0], [300, -60], [520, 120], [420, 320], [640, 470], [520, 680], [220, 600], [40, 760], [-260, 700], [-380, 460], [-620, 380], [-640, 120], [-420, -60], [-180, 40]],
  },
  {
    id: 'arctic', name: '북극해', en: 'Arctic Ocean',
    desc: '빙산 사이의 차가운 바다. 밤이면 오로라가 하늘을 덮는다.', descEn: 'Cold water between icebergs. At night the aurora fills the sky.',
    scale: 0.82, style: 'ice', storm: 1.2, whirl: [2, 2], kraken: 2, aurora: true, tint: { deep: 0x0a3462, shallow: 0x6fd0ee }, fog: 0.8,
    points: [[0, 0], [380, 40], [560, 260], [760, 380], [640, 620], [300, 560], [40, 700], [-300, 640], [-560, 440], [-700, 180], [-520, -60], [-240, -80]],
  },
  {
    id: 'antarctic', name: '남극해', en: 'Southern Ocean',
    desc: '빙붕과 거대한 빙산, 세계에서 가장 거친 파도가 이는 바다.', descEn: 'Ice shelves, giant bergs and the roughest waves on Earth.',
    scale: 0.86, style: 'ice', storm: 2.2, whirl: [0.7, 2], kraken: 0.8, aurora: true, tint: { deep: 0x0a2a4e, shallow: 0x58bfe0 }, fog: 0.75, bigIce: true,
    points: [[0, 0], [420, -30], [760, 120], [820, 420], [600, 640], [260, 560], [-60, 720], [-420, 660], [-700, 420], [-660, 100], [-380, -100], [-160, -40]],
  },
  {
    id: 'strait', name: '한일해협', en: 'Korea Strait',
    desc: '명량의 물살처럼 소용돌이가 도는 좁은 해협. 절벽 해안 사이를 달린다.', descEn: 'A narrow strait of racing tides and whirlpools, like Myeongnyang. Cliffs on both sides.',
    scale: 0.8, style: 'coast', storm: 0.9, whirl: [0.15, 0.55], kraken: 0.9, tint: { deep: 0x0b3556, shallow: 0x2d95bd },
    points: [[0, 0], [340, 20], [520, 200], [700, 260], [820, 480], [600, 620], [320, 520], [60, 640], [-240, 720], [-520, 560], [-620, 300], [-460, 60], [-260, -120], [-120, -40]],
  },
  {
    id: 'bukhang', name: '부캉이의 바다', en: 'Bukhang Waterway',
    desc: '수로 위 다리 밑을 달린다. 수면 아래엔 누군가 있다.',
    descEn: 'Race under six footbridges. Something is moving below the surface.',
    // 항구는 폭풍이 거의 없고(방파제 안쪽), 크라켄도 없다. 이 맵의 위협은 해파리다.
    scale: 0.8, style: 'harbor', storm: 0.3, whirl: [0.5, 2], kraken: 2,
    tint: { deep: 0x0b3b46, shallow: 0x2a9ea0 },   // 항구의 탁한 청록
    fog: 0.9, city: true, wildlife: true,
    // canal: 좁은 경관수로 구간 (진행률). 다리 여섯과 해파리가 이 안에 있다.
    canal: [0.40, 0.74],
    // 외해 → 방파제 → 북항 입구 → 수로(직선에 가깝다) → 광장 호수 → 외해로 복귀
    points: [
      [0, 0], [330, -50], [640, 30], [860, 250],
      [930, 520], [800, 720],
      [540, 800], [270, 820], [0, 820], [-270, 810],
      [-540, 770], [-760, 640],
      [-880, 400], [-840, 140], [-650, -70], [-350, -140], [-140, -70],
    ],
  },
  // ---------- 강 ----------
  // 바다가 아니라 강이다. 한 바퀴는 강을 거슬러 올라갔다가 되짚어 내려오는 왕복 코스다.
  {
    id: 'hangang', name: '서울 한강', en: 'Han River, Seoul',
    desc: '다리 스물이 걸린 도시의 강. 밤섬과 여의도를 돌아 거슬러 오른다.',
    descEn: 'A city river spanned by a score of bridges. Up past Bamseom and Yeouido, and back down.',
    scale: 0.78, style: 'river', banks: 'city', bridges: 8, storm: 0.2, whirl: [0.55, 2], kraken: 2,
    tint: { deep: 0x15506b, shallow: 0x3fa8b4 }, fog: 0.7, city: true,
    points: [
      [0, 0], [320, -40], [650, -70], [930, -30], [1150, 70], [1230, 240],
      [1100, 390], [820, 450], [500, 430], [170, 455], [-160, 490],
      [-490, 465], [-780, 400], [-1000, 270], [-1060, 90], [-920, -70],
      [-610, -120], [-300, -80], [-120, -30],
    ],
  },
  {
    id: 'amazon', name: '아마존강', en: 'Amazon River',
    desc: '세상에서 물이 가장 많이 흐르는 강. 정글이 양쪽에서 수면까지 내려온다.',
    descEn: 'The greatest river on Earth by volume. Jungle crowds down to the waterline on both sides.',
    scale: 0.84, style: 'river', banks: 'jungle', bridges: 2, storm: 0.6, whirl: [0.4, 0.82], kraken: 2,
    tint: { deep: 0x3c3a1c, shallow: 0x8a7a3a }, fog: 0.85,
    points: [
      [0, 0], [340, -70], [700, -50], [1010, 60], [1180, 280], [1060, 470],
      [760, 540], [420, 500], [90, 540], [-250, 580], [-580, 540],
      [-860, 440], [-1040, 250], [-1020, 50], [-830, -90], [-520, -140],
      [-230, -90], [-90, -30],
    ],
  },
  {
    id: 'nile', name: '나일강', en: 'Nile River',
    desc: '사막을 가르는 초록 띠. 강 양쪽에 신전과 피라미드가 서 있다.',
    descEn: 'A green ribbon through the desert, with temples and pyramids on either bank.',
    scale: 0.8, style: 'river', banks: 'desert', bridges: 3, storm: 0.25, whirl: [0.62, 2], kraken: 2,
    tint: { deep: 0x1e5a6e, shallow: 0x59b6b0 }, fog: 0.6,
    points: [
      [0, 0], [300, -50], [620, -90], [900, -40], [1090, 110], [1140, 300],
      [980, 440], [680, 480], [360, 450], [40, 480], [-290, 520],
      [-610, 490], [-880, 390], [-1050, 220], [-1040, 40], [-860, -100],
      [-560, -140], [-270, -90], [-110, -30],
    ],
  },
  {
    id: 'danube', name: '다뉴브강', en: 'Danube River',
    desc: '열 나라를 지나는 유럽의 강. 돌로 쌓은 호안과 성, 사슬 다리 사이를 달린다.',
    descEn: "Europe's river through ten countries: stone quays, castles and chain bridges.",
    scale: 0.78, style: 'river', banks: 'castle', bridges: 7, storm: 0.35, whirl: [0.48, 0.86], kraken: 2,
    tint: { deep: 0x1b4a62, shallow: 0x4aa4a8 }, fog: 0.75,
    points: [
      [0, 0], [310, -60], [640, -80], [920, -10], [1120, 150], [1170, 340],
      [1010, 470], [700, 500], [380, 460], [60, 490], [-270, 530],
      [-600, 500], [-870, 400], [-1040, 230], [-1030, 50], [-850, -100],
      [-550, -150], [-260, -100], [-110, -40],
    ],
  },
  {
    id: 'yangtze', name: '양쯔강', en: 'Yangtze River',
    desc: '삼협의 절벽이 하늘을 좁히는 중국의 큰 강. 물살이 빠르고 소용돌이가 많다.',
    descEn: "China's great river, where the Three Gorges narrow the sky. Fast water and many whirlpools.",
    scale: 0.76, style: 'river', banks: 'gorge', bridges: 4, storm: 0.5, whirl: [0.22, 0.6], kraken: 2,
    tint: { deep: 0x2b4038, shallow: 0x6a9a72 }, fog: 0.9,
    points: [
      [0, 0], [300, -70], [600, -100], [880, -30], [1070, 130], [1110, 320],
      [950, 450], [650, 490], [340, 450], [20, 480], [-300, 520],
      [-620, 490], [-880, 390], [-1040, 220], [-1030, 40], [-850, -110],
      [-550, -150], [-260, -100], [-110, -40],
    ],
  },
  {
    id: 'mississippi', name: '미시시피강', en: 'Mississippi River',
    desc: '외륜선이 오르던 미국의 큰 강. 늪과 모래퉁이 사이를 굽이쳐 흐른다.',
    descEn: 'The great American river of paddle steamers, winding between swamps and sandbars.',
    scale: 0.82, style: 'river', banks: 'swamp', bridges: 5, storm: 0.7, whirl: [0.5, 0.88], kraken: 2,
    tint: { deep: 0x2f3524, shallow: 0x7d7c48 }, fog: 0.8,
    points: [
      [0, 0], [330, -60], [660, -90], [950, -20], [1150, 140], [1200, 330],
      [1040, 470], [730, 510], [400, 470], [70, 500], [-260, 540],
      [-590, 510], [-870, 410], [-1050, 240], [-1040, 50], [-860, -100],
      [-560, -150], [-270, -100], [-110, -40],
    ],
  },
  // ---------- 명소와 도시 ----------
  // 기항지마다 그 땅의 명소(에펠탑, 자유의 여신상, 오페라하우스…)가 환영 간판 뒤에 선다.
  {
    id: 'worldtour', name: '세계 명소 크루즈', en: 'World Landmarks Cruise', tour: true,
    desc: '베네치아에서 출항해 이스탄불·두바이·싱가포르·부산·시드니·리우·뉴욕을 거쳐 돌아오는 세계 일주 유람선 항로.',
    descEn: 'A round-the-world cruise from Venice via Istanbul, Dubai, Singapore, Busan, Sydney, Rio and New York.',
    scale: 0.92, style: 'tropical', storm: 0.8, whirl: [0.68, 2], kraken: 0.92, tint: { deep: 0x0646a0, shallow: 0x22b8e0 },
    points: [[0, 0], [420, -60], [800, 20], [1000, 260], [920, 560], [620, 700], [300, 620], [60, 760], [-300, 760], [-620, 600], [-820, 340], [-760, 60], [-520, -120], [-240, -90]],
  },
  {
    id: 'venice', name: '베네치아 운하', en: 'Venice Canals', tour: true,
    desc: '물가에 바로 선 색색의 궁전 사이로 대운하를 내려가 산마르코 광장과 석호의 섬들을 돈다. 곤돌라를 조심하라.',
    descEn: 'Down the Grand Canal between palaces rising straight from the water, to San Marco and the lagoon islands. Mind the gondolas.',
    scale: 0.76, style: 'river', banks: 'venice', bridges: 4, storm: 0.25, whirl: [0.58, 2], kraken: 2,
    tint: { deep: 0x1d5a5a, shallow: 0x4cb4a6 }, fog: 0.75, city: true,
    points: [
      [0, 0], [300, -80], [620, -60], [900, 40], [1080, 220], [1020, 430],
      [760, 520], [430, 470], [120, 520], [-200, 600], [-520, 560],
      [-800, 430], [-980, 230], [-960, 20], [-760, -120], [-460, -150],
      [-200, -80], [-80, -20],
    ],
  },
  {
    id: 'seine', name: '파리 센강', en: 'Seine, Paris', tour: true,
    desc: '노트르담과 루브르, 에펠탑 아래를 지나는 센강. 다리 아래를 빠르게 꿰어 나가라.',
    descEn: 'Past Notre-Dame, the Louvre and under the Eiffel Tower. Thread the bridges at speed.',
    scale: 0.78, style: 'river', banks: 'paris', bridges: 7, storm: 0.3, whirl: [0.5, 2], kraken: 2,
    tint: { deep: 0x234a5a, shallow: 0x5a9aa0 }, fog: 0.75, city: true,
    points: [
      [0, 0], [320, -50], [640, -110], [940, -60], [1140, 100], [1180, 300],
      [1020, 450], [700, 470], [380, 420], [60, 470], [-260, 520],
      [-590, 500], [-870, 400], [-1040, 230], [-1030, 50], [-850, -100],
      [-550, -150], [-260, -100], [-110, -40],
    ],
  },
  {
    id: 'newyork', name: '뉴욕 맨해튼 일주', en: 'Around Manhattan', tour: true,
    desc: '자유의 여신상을 돌아 허드슨강을 오르고, 할렘강과 이스트강으로 맨해튼을 한 바퀴 돈다. 마천루 숲 사이의 강.',
    descEn: 'Round the Statue of Liberty, up the Hudson and back down the Harlem and East Rivers: a full lap of Manhattan.',
    scale: 0.8, style: 'river', banks: 'metro', bridges: 6, storm: 0.45, whirl: [0.62, 2], kraken: 2,
    tint: { deep: 0x1a3c52, shallow: 0x4a8aa0 }, fog: 0.8, city: true,
    points: [
      [0, 0], [330, -40], [660, -40], [950, 40], [1160, 200], [1220, 400],
      [1060, 540], [740, 560], [420, 500], [100, 520], [-230, 560],
      [-560, 520], [-850, 420], [-1030, 250], [-1020, 60], [-840, -90],
      [-540, -140], [-260, -90], [-110, -30],
    ],
  },
  {
    id: 'aegean', name: '에게해 · 산토리니', en: 'Aegean · Santorini', tour: true,
    desc: '아테네에서 미코노스, 산토리니, 크레타, 로도스로. 절벽 위에 하얀 집과 파란 돔이 얹힌 섬 사이를 달린다.',
    descEn: 'From Athens to Mykonos, Santorini, Crete and Rhodes, between islands crowned with white houses and blue domes.',
    scale: 0.8, style: 'rocky', village: true, storm: 0.6, whirl: [0.55, 2], kraken: 0.9, tint: { deep: 0x0a4aa8, shallow: 0x30c4e0 },
    points: [[0, 0], [320, -70], [600, 40], [560, 300], [780, 460], [640, 700], [340, 640], [120, 780], [-200, 740], [-360, 500], [-640, 420], [-680, 140], [-460, -60], [-200, 20]],
  },
  {
    id: 'halong', name: '하롱베이', en: 'Ha Long Bay', tour: true,
    desc: '에메랄드빛 바다에 석회 돌기둥섬 수백 개가 솟은 베트남의 세계유산. 돌기둥 사이를 굽이굽이 빠져나간다.',
    descEn: 'Vietnam\'s World Heritage bay, where hundreds of limestone pillars rise from emerald water. Weave between them.',
    scale: 0.8, style: 'karst', storm: 0.7, whirl: [0.4, 0.8], kraken: 0.88, tint: { deep: 0x0e5a5a, shallow: 0x3ccab0 }, fog: 0.8,
    points: [[0, 0], [300, 30], [520, 200], [700, 260], [820, 480], [600, 620], [320, 520], [60, 640], [-240, 720], [-520, 560], [-620, 300], [-460, 60], [-260, -120], [-120, -40]],
  },
  // ---------- 우주 ----------
  // 물이 아니라 허공이다. 파도가 없고, 바닥 아래로 별과 성운이 깊이별로 펼쳐진다. 하늘에는 지구·달·화성·목성·토성이 뜨고, 섬 대신 소행성이 떠 있다.
  {
    id: 'space', name: '우주 항로', en: 'Space Route', space: true,
    desc: '발사대를 떠나 우주정거장, 달, 제임스 웹 망원경, 화성, 소행성대, 목성과 토성을 지나 창백한 푸른 점까지. 바다가 아니라 허공이다 — 발밑으로 별이 끝없이 펼쳐진다.',
    descEn: 'From the launch pad past the ISS, the Moon, Webb, Mars, the asteroid belt, Jupiter and Saturn to the Pale Blue Dot.',
    scale: 0.9, style: 'space', storm: 0.5, whirl: [0.45, 0.82], kraken: 2, aurora: true,
    tint: { deep: 0x0a0628, shallow: 0x4a2aa0 }, fog: 1.5,
    points: [[0, 0], [460, -60], [860, 40], [1040, 300], [880, 600], [520, 700], [140, 640], [-200, 760], [-560, 640], [-780, 380], [-740, 100], [-520, -120], [-240, -100]],
  },
];
export const DEFAULT_MAP = MAPS[0];
export function findMap(id) { return MAPS.find((m) => m.id === id) || DEFAULT_MAP; }
