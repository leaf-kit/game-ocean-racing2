// 함선 정의 및 3D 모델 생성
import * as THREE from 'three';

// 분류 설명 (선택 화면 헤더)
export const SHIP_CATEGORIES = {
  sail: { name: '범선 (Sailing Ships)', desc: '노 없이 바람의 힘으로만 항해하는 선박. 원양 항해와 교역에 적합하며 순풍을 타면 빠르다.' },
  galley: { name: '갤리선 (Galleys)', desc: '노를 저어 움직여 바람이 없거나 역풍인 지중해 같은 곳에서도 기동성이 좋다. 가속과 선회에 강하다.' },
  special: { name: '특수선 (Special Craft)', desc: '거북선에서 대한민국 해군, 그리고 현대의 초고속정까지. 규격 밖의 성능으로 항로를 지배한다. AI 상대는 타지 않는다.' },
};

// 스탯 1~10. 특성 훅:
//  windSens 바람 민감도 / tailwindMul 순풍 배수 / headwindMul 역풍 배수 / boostRegen 게이지 충전 / boostDrain 부스트 소모 배수
//  cannonCooldown 재장전 / doubleShot 2연발 / stormResist 폭풍 밀림 배수 / pickupRadius 획득 반경 배수 / plunder 명중 시 게이지 충전
//  모델: masts 돛대 수, length 길이, lateen 삼각돛, oars 노, junk 정크 돛, turtle 거북선, sternH 선미루 높이
export const SHIPS = [
  // ---------------- 범선 ----------------
  {
    id: 'balsa', cat: 'sail', name: '발사', en: 'Balsa', nation: '포르투갈',
    desc: '초보 항해사가 처음 잡는 소형선. 가볍고 잘 돌지만 파도 한 번에 크게 휘청인다.',
    special: '특성: 깃털 선체 — 전속 항해 게이지 충전 최고, 충돌에 매우 약함',
    stats: { speed: 4, accel: 9, handling: 9, durability: 2 },
    windSens: 0.38, boostRegen: 2.2, cannonCooldown: 6, hullColor: 0x9c6b3c, sailColor: 0xf3ead6, masts: 1, length: 9, stripe: 0x3d6b9a, lateen: true,
  },
  {
    id: 'tarette', cat: 'sail', name: '타렛테', en: 'Tarette', nation: '이탈리아',
    desc: '지중해 연안 무역에 쓰인 소형 범선. 작은 항구 사이를 잽싸게 오갔다.',
    special: '특성: 연안 항해 — 항로 이탈 시 감속이 절반',
    stats: { speed: 5, accel: 8, handling: 8, durability: 4 },
    windSens: 0.36, boostRegen: 1.5, cannonCooldown: 5.5, hullColor: 0x7d5a35, sailColor: 0xf7f0dc, masts: 2, length: 10, stripe: 0xc0392b, lateen: true, offCourseMul: 0.5,
  },
  {
    id: 'dhow', cat: 'sail', name: '다우', en: 'Dhow', nation: '아라비아',
    desc: '인도양의 계절풍을 타고 아프리카와 인도를 오간 아랍 선박. 큰 삼각돛 하나로 바람을 움켜쥔다.',
    special: '특성: 계절풍의 아이 — 순풍 보너스 1.4배',
    stats: { speed: 6, accel: 7, handling: 8, durability: 4 },
    windSens: 0.42, boostRegen: 1.3, cannonCooldown: 5.5, hullColor: 0x8a6a48, sailColor: 0xf1e3c2, masts: 1, length: 11, stripe: 0x2e8b57, lateen: true, tailwindMul: 1.4,
  },
  {
    id: 'caravel_latina', cat: 'sail', name: '카라벨 라티나', en: 'Caravel Latina', nation: '포르투갈',
    desc: '삼각 돛을 단 탐험선. 디아스가 희망봉을 돌 때 탄 배가 이 형식이다. 역풍을 거슬러 오를 수 있었다.',
    special: '특성: 삼각돛 — 역풍 페널티 절반, 조타 우수',
    stats: { speed: 6, accel: 8, handling: 9, durability: 4 },
    windSens: 0.36, boostRegen: 1.5, cannonCooldown: 5, hullColor: 0x8b5a2b, sailColor: 0xf5efe0, masts: 2, length: 12, stripe: 0xc0392b, lateen: true, headwindMul: 0.5,
  },
  {
    id: 'caravel_redonda', cat: 'sail', name: '카라벨 레돈다', en: 'Caravel Redonda', nation: '포르투갈',
    desc: '사각 돛을 단 카라벨 개량형. 콜럼버스의 니냐호가 항해 중 이 형식으로 개조되었다.',
    special: '특성: 바람 적응 — 전속 항해 게이지가 빠르게 충전됨',
    stats: { speed: 7, accel: 8, handling: 7, durability: 5 },
    windSens: 0.36, boostRegen: 1.7, cannonCooldown: 5, hullColor: 0x8b5a2b, sailColor: 0xf5efe0, masts: 3, length: 12, stripe: 0xc0392b,
  },
  {
    id: 'nao', cat: 'sail', name: '나오', en: 'Nao', nation: '스페인',
    desc: '어디서나 구할 수 있는 대표적 범선. 콜럼버스의 기함 산타마리아호가 나오였다.',
    special: '특성: 만능 — 보급품 효과 1.5배',
    stats: { speed: 6, accel: 6, handling: 6, durability: 6 },
    windSens: 0.32, boostRegen: 1.1, cannonCooldown: 5, hullColor: 0x6e4a26, sailColor: 0xfff5df, masts: 3, length: 13, stripe: 0xd4af37, pickupBonus: 1.5,
  },
  {
    id: 'sloop', cat: 'sail', name: '슬루프', en: 'Sloop', nation: '영국',
    desc: '돛대 하나에 큰 돛을 단 최고의 탐험용 소형선. 얕은 해안과 좁은 수로를 자유자재로 누빈다.',
    special: '특성: 탐험가의 배 — 선회 최강, 순풍 보너스 1.3배',
    stats: { speed: 8, accel: 9, handling: 10, durability: 3 },
    windSens: 0.4, boostRegen: 1.3, cannonCooldown: 5, hullColor: 0x2f4f6f, sailColor: 0xffffff, masts: 1, length: 10, stripe: 0xecf0f1, lateen: true, tailwindMul: 1.3,
  },
  {
    id: 'carrack', cat: 'sail', name: '카락', en: 'Carrack', nation: '포르투갈',
    desc: '원양 항해를 위해 만들어진 중형 범선. 마젤란의 빅토리아호, 다 가마의 상가브리엘호가 카락이었다.',
    special: '특성: 원양 항해 — 폭풍 파도에 밀리는 정도 절반',
    stats: { speed: 7, accel: 5, handling: 5, durability: 8 },
    windSens: 0.3, boostRegen: 1.0, cannonCooldown: 5, hullColor: 0x5a3a1a, sailColor: 0xfff8e7, masts: 3, length: 15, stripe: 0x8e44ad, sternH: 1.4, stormResist: 0.5,
  },
  {
    id: 'galleon', cat: 'sail', name: '갤리온', en: 'Galleon', nation: '스페인',
    desc: '보물을 실어 나르던 거함. 전투와 교역 모두 뛰어난 다목적 범선. 무겁지만 부딪히면 상대가 날아간다.',
    special: '특성: 철벽 선체 — 충돌 시 상대를 강하게 밀어내고 자신은 거의 감속하지 않음',
    stats: { speed: 8, accel: 5, handling: 4, durability: 9 },
    windSens: 0.3, boostRegen: 1.0, cannonCooldown: 5, hullColor: 0x5e3a1a, sailColor: 0xfff8e7, masts: 3, length: 16, stripe: 0xd4af37, sternH: 1.6,
  },
  {
    id: 'ship', cat: 'sail', name: '쉽', en: 'Ship', nation: '영국',
    desc: '최대의 적재량과 선원을 자랑하는 최강의 대형 범선. 느리게 출발하지만 한번 속도가 붙으면 멈추지 않는다.',
    special: '특성: 거함 — 최고 속도 최상급, 전속 항해가 1.5배 오래 지속',
    stats: { speed: 10, accel: 3, handling: 3, durability: 10 },
    windSens: 0.28, boostRegen: 0.9, boostDrain: 0.65, cannonCooldown: 4.5, hullColor: 0x3b2a18, sailColor: 0xf5f0e6, masts: 3, length: 18, stripe: 0xc9a55a, sternH: 1.8,
  },
  {
    id: 'fluyt', cat: 'sail', name: '플루트', en: 'Fluyt', nation: '네덜란드',
    desc: '적은 선원으로 많은 짐을 나르도록 설계된 네덜란드 무역선. 17세기 해상 무역을 제패했다.',
    special: '특성: 상인의 눈 — 금화·보급품 획득 반경 1.6배',
    stats: { speed: 7, accel: 6, handling: 5, durability: 7 },
    windSens: 0.32, boostRegen: 1.0, cannonCooldown: 5, hullColor: 0x6b4423, sailColor: 0xf0e6d2, masts: 3, length: 14, stripe: 0xe67e22, pickupRadius: 1.6,
  },
  {
    id: 'frigate', cat: 'sail', name: '프리깃', en: 'Frigate', nation: '네덜란드',
    desc: '해상 무역을 지배한 전투 함선. 빠른 재장전으로 앞선 배를 저격하라.',
    special: '특성: 속사포 — 포격 재장전 2배 빠름, 2연발 발사',
    stats: { speed: 8, accel: 7, handling: 6, durability: 7 },
    windSens: 0.34, boostRegen: 1.0, cannonCooldown: 2.5, doubleShot: true, hullColor: 0x6b4423, sailColor: 0xf0e6d2, masts: 3, length: 14, stripe: 0xe67e22, sternH: 1.0,
  },
  {
    id: 'clipper', cat: 'sail', name: '클리퍼', en: 'Clipper', nation: '영국',
    desc: '바다 위의 준마. 순풍을 타면 누구도 따라올 수 없다. 단, 선체는 약하다.',
    special: '특성: 질주 — 최고 속도 최강, 순풍 보너스 1.5배, 충돌에 취약',
    stats: { speed: 10, accel: 6, handling: 6, durability: 3 },
    windSens: 0.5, boostRegen: 1.0, cannonCooldown: 5, hullColor: 0x2c3e50, sailColor: 0xffffff, masts: 3, length: 15, stripe: 0xecf0f1, tailwindMul: 1.5, jib: true,
  },
  {
    id: 'junk', cat: 'sail', name: '정크선', en: 'Junk', nation: '명나라',
    desc: '정화의 대함대를 이끈 동양의 명선. 대나무살 돛으로 역풍에도 흔들리지 않는 안정성.',
    special: '특성: 역풍 무시 — 맞바람 페널티 절반, 회전이 매우 민첩',
    stats: { speed: 6, accel: 9, handling: 9, durability: 6 },
    windSens: 0.22, boostRegen: 1.2, cannonCooldown: 5, hullColor: 0x7b3f00, sailColor: 0xc0392b, masts: 3, length: 12, stripe: 0xf1c40f, junk: true, headwindMul: 0.5,
  },
  {
    id: 'cog', cat: 'sail', name: '코그', en: 'Cog', nation: '한자동맹',
    desc: '북해와 발트해를 오간 한자동맹의 화물선. 돛대 하나에 사각돛 한 장, 앞뒤로 높은 성루를 얹었다. 느리지만 좀처럼 부서지지 않는다.',
    special: '특성: 통널 선체 — 충돌해도 거의 흔들리지 않음, 항로 이탈 감속 절반',
    stats: { speed: 4, accel: 4, handling: 4, durability: 9 },
    windSens: 0.34, boostRegen: 0.9, cannonCooldown: 6, hullColor: 0x6b4a2a, sailColor: 0xe8d9b8, masts: 1, length: 11, stripe: 0x8b2b2b, sternH: 1.2, spinResist: 0.4, offCourseMul: 0.5,
  },
  {
    id: 'pinnace', cat: 'sail', name: '피너스', en: 'Pinnace', nation: '네덜란드',
    desc: '함대에 딸려 다니며 연락과 정찰을 맡은 소형 쾌속선. 큰 배가 못 들어가는 얕은 만까지 들어갔다.',
    special: '특성: 전령선 — 선회 최상급, 보급품 획득 반경 1.5배',
    stats: { speed: 6, accel: 9, handling: 10, durability: 2 },
    windSens: 0.4, boostRegen: 2.0, cannonCooldown: 6, hullColor: 0x8a6a42, sailColor: 0xf5efe0, masts: 2, length: 9, stripe: 0x2e8b57, pickupRadius: 1.5,
  },
  {
    id: 'brigantine', cat: 'sail', name: '브리간틴', en: 'Brigantine', nation: '카리브',
    desc: '앞돛은 사각, 뒷돛은 종범을 단 2돛대 범선. 빠르고 잘 돌아 카리브의 사략선들이 가장 좋아한 배다.',
    special: '특성: 사략 — 포격 명중 시 전속 항해 게이지가 찬다, 빠른 재장전',
    stats: { speed: 8, accel: 8, handling: 8, durability: 4 },
    windSens: 0.34, boostRegen: 1.4, cannonCooldown: 3.5, hullColor: 0x2b2b2b, sailColor: 0xefe6cf, masts: 2, length: 12, stripe: 0xc0392b, plunder: true,
  },
  {
    id: 'schooner', cat: 'sail', name: '스쿠너', en: 'Schooner', nation: '미국',
    desc: '돛을 배의 앞뒤 방향으로 단 종범선. 사각돛 배가 못 가는 각도까지 바람을 거슬러 오를 수 있다.',
    special: '특성: 종범 — 역풍 페널티 60% 감소, 조타 우수',
    stats: { speed: 8, accel: 7, handling: 9, durability: 4 },
    windSens: 0.36, boostRegen: 1.3, cannonCooldown: 4.5, hullColor: 0x1a3a4a, sailColor: 0xfffaf0, masts: 2, length: 13, stripe: 0xe8dcc0, lateen: true, headwindMul: 0.4,
  },
  {
    id: 'barque', cat: 'sail', name: '바크', en: 'Barque', nation: '영국',
    desc: '앞의 두 돛대는 사각돛, 맨 뒤는 종범. 적은 선원으로 장거리를 끌고 갈 수 있어 19세기 원양 화물선의 표준이 되었다.',
    special: '특성: 원양 화물 — 순풍 보너스 1.3배, 보급품 효과 1.5배',
    stats: { speed: 8, accel: 5, handling: 5, durability: 8 },
    windSens: 0.36, boostRegen: 1.1, cannonCooldown: 5, hullColor: 0x4a3524, sailColor: 0xf7f0dc, masts: 3, length: 16, stripe: 0xd4af37, sternH: 1.0, tailwindMul: 1.3, pickupBonus: 1.5,
  },
  {
    id: 'panokseon', cat: 'sail', name: '판옥선', en: 'Panokseon', nation: '조선',
    desc: '조선 수군의 주력 전선. 바닥이 평평해 제자리에서 배를 돌릴 수 있었고, 2층 갑판 위에서 활과 총통을 쏘았다. 한산도에서 학익진을 이룬 배가 이것이다.',
    special: '특성: 평저선 — 제자리 선회, 충돌 회전 저항 최상, 2연발 포격',
    stats: { speed: 6, accel: 6, handling: 9, durability: 9 },
    windSens: 0.2, boostRegen: 1.2, cannonCooldown: 4.5, hullColor: 0x6b4423, sailColor: 0xd8cbb0, masts: 2, length: 14, stripe: 0x1f4e7a, sternH: 1.1, spinResist: 0.3, doubleShot: true,
  },
  {
    id: 'baochuan', cat: 'sail', name: '보선', en: 'Treasure Ship', nation: '명나라',
    desc: '정화의 대함대 기함. 기록대로라면 길이 120m가 넘는, 당대 세계에서 가장 큰 목선이었다. 아홉 개의 돛대에 대나무살 돛을 달았다.',
    special: '특성: 거함 — 내구 최상, 역풍 무시, 부딪히면 상대가 날아간다',
    stats: { speed: 7, accel: 3, handling: 3, durability: 10 },
    windSens: 0.24, boostRegen: 0.9, cannonCooldown: 5.5, hullColor: 0x8b3a1a, sailColor: 0xc0392b, masts: 4, length: 20, stripe: 0xf1c40f, junk: true, sternH: 1.4, headwindMul: 0.5, spinResist: 0.25,
  },
  {
    id: 'atakebune', cat: 'sail', name: '아타케부네', en: 'Atakebune', nation: '일본',
    desc: '일본 수군의 대형 군선. 갑판 위에 나무 누각을 올려 총과 활을 쏘았다. 임진왜란에서 판옥선·거북선과 맞붙었다.',
    special: '특성: 누각 — 포격 재장전이 빠르고 피해가 크다, 다만 무거워 잘 안 돈다',
    stats: { speed: 6, accel: 5, handling: 4, durability: 8 },
    windSens: 0.26, boostRegen: 1.0, cannonCooldown: 3.2, hullColor: 0x3a2a1a, sailColor: 0xf0e6d2, masts: 1, length: 15, stripe: 0xc0392b, sternH: 1.5,
  },
  // ---------------- 갤리선 ----------------
  {
    id: 'light_galley', cat: 'galley', name: '경갤리', en: 'Light Galley', nation: '베네치아',
    desc: '가장 기초적인 소형 갤리선. 노꾼들의 힘으로 바람이 죽은 바다에서도 튀어나간다.',
    special: '특성: 노 젓기 — 바람 영향 거의 없음, 가속 최강',
    stats: { speed: 5, accel: 10, handling: 9, durability: 3 },
    windSens: 0.05, boostRegen: 1.4, cannonCooldown: 6, hullColor: 0x8a5a2a, sailColor: 0xf7f0dc, masts: 1, length: 11, stripe: 0x1f77b4, lateen: true, oars: true,
  },
  {
    id: 'galley', cat: 'galley', name: '갤리', en: 'Galley', nation: '오스만',
    desc: '지중해의 표준 갤리선. 레판토 해전에서 양측 수백 척이 노를 저어 맞붙었다.',
    special: '특성: 노 젓기 — 바람 영향 거의 없음, 충돌 시 회전이 적음',
    stats: { speed: 6, accel: 9, handling: 7, durability: 5 },
    windSens: 0.08, boostRegen: 1.2, cannonCooldown: 5, hullColor: 0x6e4a26, sailColor: 0xf3e6c8, masts: 2, length: 13, stripe: 0xc0392b, lateen: true, oars: true, spinResist: 0.5,
  },
  {
    id: 'lareale', cat: 'galley', name: '라레아르', en: 'La Réale', nation: '프랑스',
    desc: '프랑스 왕실의 기함급 고급 갤리선. 기동성과 속도를 모두 갖춘 탐험용 갤리.',
    special: '특성: 왕실 노꾼 — 바람 영향 적음, 게이지 충전 빠름, 선회 우수',
    stats: { speed: 8, accel: 9, handling: 8, durability: 4 },
    windSens: 0.1, boostRegen: 1.5, cannonCooldown: 5, hullColor: 0x2a3d6b, sailColor: 0xfff3d6, masts: 2, length: 14, stripe: 0xd4af37, lateen: true, oars: true,
  },
  {
    id: 'galleass', cat: 'galley', name: '베네치안 갤리어스', en: 'Venetian Galleass', nation: '베네치아',
    desc: '범선과 갤리선의 장점을 합친 강력한 전투함. 레판토에서 포화로 오스만 함대를 무너뜨렸다.',
    special: '특성: 포열 — 2연발 포격, 노로 역풍 무시, 튼튼한 선체',
    stats: { speed: 7, accel: 7, handling: 5, durability: 9 },
    windSens: 0.15, boostRegen: 1.0, cannonCooldown: 3.5, doubleShot: true, hullColor: 0x4a2f16, sailColor: 0xf3e6c8, masts: 3, length: 16, stripe: 0xc0392b, lateen: true, oars: true, sternH: 1.2,
  },
  {
    id: 'xebec', cat: 'galley', name: '자벡', en: 'Xebec', nation: '바르바리',
    desc: '바르바리 해적이 애용한 삼각돛 쾌속선. 돛과 노를 함께 써서 상선을 덮쳤다.',
    special: '특성: 해적 — 포격 명중 시 전속 항해 게이지 +30%, 빠른 재장전',
    stats: { speed: 8, accel: 8, handling: 8, durability: 4 },
    windSens: 0.2, boostRegen: 1.1, cannonCooldown: 3, hullColor: 0x1f1f1f, sailColor: 0xe8dcc0, masts: 3, length: 13, stripe: 0xc0392b, lateen: true, oars: true, plunder: true,
  },
  {
    id: 'drakkar', cat: 'galley', name: '드라카르', en: 'Drakkar', nation: '노르드',
    desc: '바이킹의 롱십. 바닥이 얕아 강까지 거슬러 올라갔고, 바람이 없으면 노를 저었다. 뱃머리의 용 조각이 이름의 유래다.',
    special: '특성: 얕은 흘수 — 항로를 벗어나도 거의 느려지지 않음, 가속 최상급',
    stats: { speed: 7, accel: 10, handling: 9, durability: 3 },
    windSens: 0.14, boostRegen: 1.8, cannonCooldown: 6, hullColor: 0x4a3018, sailColor: 0xc0392b, masts: 1, length: 12, stripe: 0xe8dcc0, oars: true, offCourseMul: 0.25,
  },
  {
    id: 'trireme', cat: 'galley', name: '트리렘', en: 'Trireme', nation: '지중해',
    desc: '노를 3단으로 겹쳐 앉힌 고대의 전투 갤리. 뱃머리 청동 충각으로 적선의 옆구리를 들이받는 것이 전술의 전부였다.',
    special: '특성: 충각 — 충돌 시 상대를 크게 밀어내고 자신은 거의 감속하지 않음, 바람 영향 없음',
    stats: { speed: 7, accel: 9, handling: 7, durability: 6 },
    windSens: 0.06, boostRegen: 1.5, cannonCooldown: 5.5, hullColor: 0x2a2a2a, sailColor: 0xf5efe0, masts: 1, length: 14, stripe: 0xc9a55a, oars: true, spinResist: 0.3,
  },
  {
    id: 'tongsinsa', cat: 'sail', name: '조선통신사선', en: 'Joseon Envoy Ship', nation: '조선',
    desc: '조선이 일본에 보낸 사절단이 타던 배. 1607년부터 1811년까지 열두 차례, 부산에서 쓰시마를 거쳐 에도까지 갔다. 가장 큰 정사기선은 사람 백여 명을 실었다.',
    special: '특성: 사행길 — 보급품 효과 1.6배, 항로 이탈 감속 절반, 순풍 보너스 1.2배',
    stats: { speed: 7, accel: 6, handling: 7, durability: 8 },
    windSens: 0.33, boostRegen: 1.3, cannonCooldown: 5.5, hullColor: 0x6b4423, sailColor: 0xf2e6cb, masts: 2, length: 15, stripe: 0x1f5f8b,
    pickupBonus: 1.6, offCourseMul: 0.5, tailwindMul: 1.2,
  },
  // ---------------- 특수선: 거북선 · 대한민국 함대 · 현대 초고속정 ----------------
  {
    id: 'bukhang', cat: 'special', name: '부캉이', en: 'Bukhang', nation: '부산', legend: true, aiExclude: true,
    desc: '★ 배가 아니다. 부산 북항 수로에 들어왔던 그 상어를 직접 탄다. 돛도 노도 없이 꼬리로만 나아간다. 바람을 타지 않고, 바람에 밀리지도 않는다.',
    special: '특성: 상어 — X 잠수(장애물 밑으로 통과), SPACE 브리치(공중으로 도약). 포는 없다',
    stats: { speed: 13, accel: 9, handling: 10, durability: 7 },
    windSens: 0, boostRegen: 1.8, cannonCooldown: 3.5, stormResist: 0.35,
    hullColor: 0x53657a, sailColor: 0xd8dfe6, masts: 0, length: 11, stripe: 0xd8dfe6,
    shark: true, noCannon: true, canDive: true, freeJump: true,
  },
  {
    id: 'turtle', cat: 'special', name: '거북선', en: 'Turtle Ship', nation: '조선', legend: true, aiExclude: true,
    desc: '★ 스페셜 함선. 이순신 장군의 철갑 거북선. 모든 능력치 100 — 속도·가속·조타·내구 어느 하나 빠지지 않는 최강의 함선.',
    special: '특성: 전설의 철갑 — 바람 무시, 충돌 시 무적, 2연발 속사포, 폭풍에도 끄떡없음, 용머리 화염 부스트',
    stats: { speed: 10, accel: 10, handling: 10, durability: 10 },
    windSens: 0.05, boostRegen: 1.6, cannonCooldown: 3, doubleShot: true, stormResist: 0.5, hullColor: 0x4a3520, sailColor: 0xe8dcc0, masts: 1, length: 12, stripe: 0xc9a55a, turtle: true,
  },
  {
    id: 'sejong', cat: 'special', name: '세종대왕함', en: 'ROKS Sejong the Great', nation: '대한민국', legend: true, aiExclude: true,
    desc: '★ 대한민국 해군의 이지스 구축함. 강철 선체와 위상배열 레이더. 속도 160에 내구 100 — 무엇에 부딪혀도 흔들리지 않는다.',
    special: '특성: 이지스 — 내구 100, 2연발 함포, 폭풍 영향 없음, 충돌 시 상대를 밀어냄',
    stats: { speed: 16, accel: 5, handling: 4, durability: 10 },
    windSens: 0.02, boostRegen: 1.0, cannonCooldown: 2.5, doubleShot: true, stormResist: 0.2, hullColor: 0x8a9199, sailColor: 0x5c6670, masts: 0, length: 20, stripe: 0x2c3e50, modern: 'destroyer',
  },
  {
    id: 'dokdo', cat: 'special', name: '독도함', en: 'ROKS Dokdo', nation: '대한민국', legend: true, aiExclude: true,
    desc: '★ 헬기가 뜨고 내리는 넓은 비행갑판을 가진 대형 수송함. 속도 120이지만 내구 100의 거함. 부딪히는 쪽이 튕겨 나간다.',
    special: '특성: 거함 — 내구 100, 충돌 시 상대를 강하게 밀어냄, 보급품 효과 2배',
    stats: { speed: 12, accel: 4, handling: 3, durability: 10 },
    windSens: 0.02, boostRegen: 0.9, boostDrain: 0.6, cannonCooldown: 4, stormResist: 0.2, pickupBonus: 2, hullColor: 0x8a9199, sailColor: 0x5c6670, masts: 0, length: 22, stripe: 0x2c3e50, modern: 'carrier',
  },
  {
    id: 'chamsuri', cat: 'special', name: '참수리 고속정', en: 'Chamsuri-class Patrol Boat', nation: '대한민국', legend: true, aiExclude: true,
    desc: '★ 서해를 지키는 고속 경비정. 속도 200에 민첩한 선회. 작지만 앞선 배를 빠르게 따라잡는다.',
    special: '특성: 고속 경비 — 속도 200, 조타 우수, 포격 재장전 빠름',
    stats: { speed: 20, accel: 9, handling: 9, durability: 5 },
    windSens: 0.03, boostRegen: 1.4, cannonCooldown: 3, hullColor: 0x8a9199, sailColor: 0x5c6670, masts: 0, length: 12, stripe: 0xc0392b, modern: 'patrol',
  },
  {
    id: 'jangbogo', cat: 'special', name: '장보고함', en: 'ROKS Jang Bogo', nation: '대한민국', legend: true, aiExclude: true,
    desc: '★ 부상 항해 중인 잠수함. 해상왕 장보고의 이름을 받았다. 속도 150, 낮고 매끈해 파도와 바람을 거의 타지 않는다.',
    special: '특성: 잠항 선체 — 속도 150, 바람·파도 영향 없음, 소용돌이 면역',
    stats: { speed: 15, accel: 6, handling: 6, durability: 9 },
    windSens: 0.01, boostRegen: 1.2, cannonCooldown: 4, stormResist: 0.1, whirlImmune: true, hullColor: 0x1f2a36, sailColor: 0x1f2a36, masts: 0, length: 16, stripe: 0x1f2a36, modern: 'sub',
  },
  {
    id: 'trackmaster', cat: 'special', name: '트랙마스터', en: 'Track Master', nation: '미래', legend: true, aiExclude: true,
    desc: '★ 항로 유지 장치를 단 배. 양현의 유도 암이 부표선을 읽어 뱃머리를 스스로 되돌린다. 속도 200 — 아무리 험한 항로라도 코스를 벗어나지 않는다.',
    special: '특성: 항로 유지 장치 — 항로를 벗어나지 않는다(이탈 감속 없음), 속도 200, 바람·파도 영향 거의 없음',
    stats: { speed: 20, accel: 9, handling: 8, durability: 6 },
    windSens: 0.03, boostRegen: 1.4, cannonCooldown: 4, stormResist: 0.35,
    hullColor: 0x1b2836, sailColor: 0x2ee6a8, masts: 0, length: 15, stripe: 0x2ee6a8,
    modern: 'rail', trackLock: true, offCourseMul: 0,
  },
  {
    id: 'wig', cat: 'special', name: '위그선', en: 'WIG Craft', nation: '미래', legend: true, aiExclude: true,
    desc: '★ 세계에서 가장 빠른 배. 날개로 수면 위 공기를 눌러 파도 위를 날아가는 수면비행선(Wing-In-Ground). 속도 300 — 돛도 노도 없이 바다를 가른다.',
    special: '특성: 지면효과 비행 — 속도 300, 파도·바람의 영향을 거의 받지 않음, 항상 수면 위를 낮게 비행',
    stats: { speed: 30, accel: 8, handling: 6, durability: 5 },
    windSens: 0.02, boostRegen: 1.2, cannonCooldown: 4, stormResist: 0.3, hullColor: 0xe8eef5, sailColor: 0x1f3a5c, masts: 0, length: 13, stripe: 0x1f77b4, wig: true, hover: 1.4,
  },
  {
    id: 'hydrofoil', cat: 'special', name: '수중익선', en: 'Hydrofoil', nation: '현대', legend: true, aiExclude: true,
    desc: '★ 수면 아래 날개(수중익)로 선체를 들어 올려 물의 저항을 벗어난 쾌속선. 속도 200. 파도 위를 미끄러지듯 달린다.',
    special: '특성: 수중익 — 속도 200, 파도 흔들림 거의 없음, 폭풍 영향 절반',
    stats: { speed: 20, accel: 8, handling: 7, durability: 5 },
    windSens: 0.03, boostRegen: 1.2, cannonCooldown: 4, stormResist: 0.5, hullColor: 0xf2f4f7, sailColor: 0x1f3a5c, masts: 0, length: 13, stripe: 0xc0392b, modern: 'foil', hover: 1.1,
  },
  {
    id: 'hovercraft', cat: 'special', name: '호버크라프트', en: 'Hovercraft', nation: '현대', legend: true, aiExclude: true,
    desc: '★ 거대한 팬으로 공기 쿠션을 만들어 물 위를 떠서 달리는 배. 속도 180. 선회가 자유롭고 가속이 폭발적이다.',
    special: '특성: 공기 쿠션 — 속도 180, 가속·선회 최상급, 파도 영향 없음',
    stats: { speed: 18, accel: 9, handling: 9, durability: 4 },
    windSens: 0.06, boostRegen: 1.4, cannonCooldown: 5, stormResist: 0.3, hullColor: 0xffb347, sailColor: 0x2c3e50, masts: 0, length: 12, stripe: 0x2c3e50, modern: 'hover', hover: 0.9,
  },
  {
    id: 'jetboat', cat: 'special', name: '제트보트', en: 'Jet Boat', nation: '현대', legend: true, aiExclude: true,
    desc: '★ 워터제트로 물을 뿜어 튀어나가는 초소형 고속정. 속도 220. 가장 민첩하지만 선체는 가볍다.',
    special: '특성: 워터제트 — 속도 220, 가속·조타 100, 충돌에 약함',
    stats: { speed: 22, accel: 10, handling: 10, durability: 3 },
    windSens: 0.04, boostRegen: 1.6, cannonCooldown: 5, hullColor: 0xe53935, sailColor: 0x1a1a1a, masts: 0, length: 10, stripe: 0xffffff, modern: 'jet', hover: 0.2,
  },
  {
    id: 'catamaran', cat: 'special', name: '파워 카타마란', en: 'Power Catamaran', nation: '현대', legend: true, aiExclude: true,
    desc: '★ 두 개의 선체가 파도를 가르는 고속 쌍동선. 속도 240. 넓고 안정적이어서 고속에서도 흔들리지 않는다.',
    special: '특성: 쌍동 선체 — 속도 240, 내구 우수, 폭풍 영향 절반',
    stats: { speed: 24, accel: 7, handling: 6, durability: 6 },
    windSens: 0.04, boostRegen: 1.1, cannonCooldown: 4, stormResist: 0.5, hullColor: 0x1f77b4, sailColor: 0xf2f4f7, masts: 0, length: 14, stripe: 0xf2f4f7, modern: 'cat', hover: 0.4,
  },
];

// 배 묘사 배율: 배 위치와 형태가 잘 보이도록 크게 (물리 반경도 함께 커짐)
export const SHIP_SCALE = 1.3;

// 스탯 -> 물리 파라미터 변환
export function derivePhysics(def) {
  const s = def.stats;
  return {
    maxSpeed: 48 + s.speed * 3.8,        // 최고 속도 (unit/s) - 속도감 강화
    accel: 0.2 + s.accel * 0.06,         // 가속 lerp 계수
    turnRate: 0.9 + s.handling * 0.14,   // rad/s
    mass: 1 + s.durability * 0.3,
    collisionLoss: 0.65 - s.durability * 0.045, // 충돌 시 속도 손실 비율 (0~0.6)
    windSens: def.windSens,
    boostRegen: def.boostRegen,
    boostDrain: def.boostDrain ?? 1,
    cannonCooldown: def.cannonCooldown,
    doubleShot: !!def.doubleShot,
    radius: def.length * 0.5 * SHIP_SCALE,
  };
}

export const AI_NAMES = ['바르톨로뮤', '마젤란', '정화 제독', '드레이크', '이순신', '콜럼버스', '바스코 다 가마', '헨리 왕자', '알부케르크', '카보토', '베스푸치', '하이레딘'];
export function pickAiName(i) { return AI_NAMES[i % AI_NAMES.length]; }

// ---------- 모델 생성 ----------
// 절차적 텍스처 (판자 나무결, 돛 천, 갑판) - 한 번만 만들어 공유
const TEX = {};
function woodTexture(key, base, dark, planks = 8, grain = 0.35, size = 256) {
  if (TEX[key]) return TEX[key];
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  const ph = size / planks;
  for (let i = 0; i < planks; i++) {
    const y = i * ph;
    // 판자마다 색 차이
    const shade = (Math.random() - 0.5) * 0.18;
    ctx.fillStyle = `rgba(${shade > 0 ? 255 : 0},${shade > 0 ? 235 : 0},${shade > 0 ? 200 : 0},${Math.abs(shade)})`;
    ctx.fillRect(0, y, size, ph);
    // 나무결
    for (let k = 0; k < 14; k++) {
      ctx.strokeStyle = `rgba(0,0,0,${0.05 + Math.random() * grain * 0.3})`; ctx.lineWidth = 0.6 + Math.random();
      ctx.beginPath(); const yy = y + Math.random() * ph;
      ctx.moveTo(0, yy);
      for (let x = 0; x <= size; x += 16) ctx.lineTo(x, yy + Math.sin(x * 0.05 + k) * 1.5 + (Math.random() - 0.5));
      ctx.stroke();
    }
    // 판자 이음새 + 못
    ctx.fillStyle = dark; ctx.fillRect(0, y, size, 1.5);
    const seam = Math.floor(Math.random() * size);
    ctx.fillRect(seam, y, 1.5, ph);
    ctx.fillStyle = 'rgba(30,20,10,0.8)';
    for (let n = 0; n < 3; n++) { ctx.beginPath(); ctx.arc((seam + 10 + n * size / 3) % size, y + ph * 0.5, 1.4, 0, Math.PI * 2); ctx.fill(); }
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  TEX[key] = t; return t;
}
function sailTexture(color) {
  const key = 'sail' + color; if (TEX[key]) return TEX[key];
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const col = new THREE.Color(color);
  ctx.fillStyle = `rgb(${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)})`; ctx.fillRect(0, 0, 256, 256);
  // 직물 짜임
  for (let y = 0; y < 256; y += 3) { ctx.fillStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.03})`; ctx.fillRect(0, y, 256, 1); }
  for (let x = 0; x < 256; x += 3) { ctx.fillStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.03})`; ctx.fillRect(x, 0, 1, 256); }
  // 세로 이음선(돛폭)과 보강 띠
  for (let x = 0; x < 256; x += 32) { ctx.fillStyle = 'rgba(80,60,30,0.28)'; ctx.fillRect(x, 0, 2, 256); }
  for (let y = 60; y < 256; y += 70) { ctx.fillStyle = 'rgba(80,60,30,0.18)'; ctx.fillRect(0, y, 256, 4); }
  // 얼룩/해짐
  for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(90,70,40,${0.03 + Math.random() * 0.05})`; ctx.beginPath(); ctx.arc(Math.random() * 256, Math.random() * 256, 4 + Math.random() * 18, 0, Math.PI * 2); ctx.fill(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  TEX[key] = t; return t;
}
const MAT = {};
function mat(key, make) { return MAT[key] || (MAT[key] = make()); }
const ropeMat = () => mat('rope', () => new THREE.LineBasicMaterial({ color: 0x3a2a16, transparent: true, opacity: 0.9 }));
const ironMat = () => mat('iron', () => new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.8, roughness: 0.35 }));
const brassMat = () => mat('brass', () => new THREE.MeshStandardMaterial({ color: 0xc9a55a, metalness: 0.9, roughness: 0.3 }));
const darkWoodMat = () => mat('dark', () => new THREE.MeshStandardMaterial({ map: woodTexture('dark', '#4a3418', '#241708', 6, 0.5), roughness: 0.9 }));
const deckMat = () => mat('deck', () => { const m = new THREE.MeshStandardMaterial({ map: woodTexture('deck', '#b8874a', '#6b4a22', 12, 0.4), roughness: 0.85 }); m.map.repeat.set(3, 1); return m; });
const barrelMat = () => mat('barrel', () => new THREE.MeshStandardMaterial({ map: woodTexture('barrel', '#8a5a2a', '#3a2410', 10, 0.5), roughness: 0.9 }));

function hullGeometry(length, width, height) {
  const L = length / 2, W = width / 2;
  const shape = new THREE.Shape();
  shape.moveTo(L, 0);
  shape.bezierCurveTo(L * 0.7, W * 0.9, -L * 0.3, W, -L * 0.85, W * 0.85);
  shape.quadraticCurveTo(-L, W * 0.5, -L, 0);
  shape.quadraticCurveTo(-L, -W * 0.5, -L * 0.85, -W * 0.85);
  shape.bezierCurveTo(-L * 0.3, -W, L * 0.7, -W * 0.9, L, 0);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: height, bevelEnabled: true, bevelThickness: height * 0.6, bevelSize: width * 0.28, bevelSegments: 4, steps: 1,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -height * 0.4, 0);
  geo.computeVertexNormals();
  // 판자 텍스처가 선체 길이를 따라 감기도록 UV 재계산 (x: 길이, y: 높이)
  const pos = geo.attributes.position; const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) { uv[i * 2] = (pos.getX(i) / length) * 4; uv[i * 2 + 1] = (pos.getY(i) / height) * 1.2 + pos.getZ(i) * 0.02; }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
}

function makeSail(w, h, color, opts = {}) {
  const geo = new THREE.PlaneGeometry(w, h, 12, 12);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const u = (x / w + 0.5), v = (y / h + 0.5);
    let bulge = Math.sin(u * Math.PI) * Math.sin(v * Math.PI) * w * 0.28;
    if (opts.junk) { pos.setX(i, x * (0.6 + v * 0.5)); bulge *= 0.4; }
    pos.setZ(i, -bulge);
  }
  geo.computeVertexNormals();
  const m = new THREE.MeshStandardMaterial({ map: sailTexture(color), side: THREE.DoubleSide, roughness: 0.95, metalness: 0 });
  const mesh = new THREE.Mesh(geo, m);
  if (opts.junk) {
    const batten = new THREE.Group();
    for (let i = 1; i < 6; i++) {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, w * (0.6 + (i / 6) * 0.5), 5), darkWoodMat());
      b.rotation.z = Math.PI / 2; b.position.y = -h / 2 + (h * i) / 6; b.position.z = 0.06;
      batten.add(b);
    }
    mesh.add(batten);
  } else {
    // 돛 아래 모서리 밧줄(시트) 느낌의 가장자리 보강 띠
    const edge = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, 0.08), darkWoodMat());
    edge.position.y = -h / 2; mesh.add(edge);
  }
  return mesh;
}

// 삼각돛 (라틴 세일)
function makeLateenSail(w, h, color) {
  const geo = new THREE.PlaneGeometry(w, h, 12, 12);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const u = x / w + 0.5, v = y / h + 0.5;
    pos.setX(i, -w * 0.5 + (x + w * 0.5) * (1 - v));
    pos.setZ(i, -Math.sin(u * Math.PI) * Math.sin(v * Math.PI) * w * 0.22);
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: sailTexture(color), side: THREE.DoubleSide, roughness: 0.95 }));
}

// 밧줄: 점 목록을 잇는 선
function rope(points) {
  const geo = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(...p)));
  return new THREE.Line(geo, ropeMat());
}
// 그물 사다리(래트라인): 돛대에서 좌우 뱃전으로 내려가는 밧줄 다발
function shrouds(mx, top, W, L, side) {
  const pts = [];
  for (let i = -1; i <= 1; i++) pts.push([mx + i * L * 0.04, 0.6, side * W * 0.46], [mx, top, side * 0.2]);
  const g = new THREE.Group();
  const geo = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(...p)));
  g.add(new THREE.LineSegments(geo, ropeMat()));
  // 가로 밧줄
  const hpts = [];
  for (let k = 1; k <= 5; k++) { const t = k / 6; hpts.push([mx - L * 0.04 * (1 - t), 0.6 + (top - 0.6) * t, side * (W * 0.46 * (1 - t) + 0.2 * t)], [mx + L * 0.04 * (1 - t), 0.6 + (top - 0.6) * t, side * (W * 0.46 * (1 - t) + 0.2 * t)]); }
  g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(hpts.map((p) => new THREE.Vector3(...p))), ropeMat()));
  return g;
}

// 현대 선박 상부 구조 (수중익선/호버크라프트/제트보트/카타마란/구축함/수송함/고속정/잠수함)
function buildModern(def, g, L, W, H) {
  const grey = new THREE.MeshStandardMaterial({ color: 0x9aa3ab, roughness: 0.5, metalness: 0.4 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x3a4149, roughness: 0.5, metalness: 0.5 });
  const paint = new THREE.MeshStandardMaterial({ color: def.hullColor, roughness: 0.45, metalness: 0.35 });
  const accent = new THREE.MeshStandardMaterial({ color: def.stripe, roughness: 0.5, metalness: 0.3 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x9fd4ff, roughness: 0.1, metalness: 0.6, transparent: true, opacity: 0.85 });
  const box = (w, h, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); g.add(b); return b; };
  const cyl = (r1, r2, h, m, x, y, z, rz = 0) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 12), m); c.position.set(x, y, z); c.rotation.z = rz; g.add(c); return c; };
  box(L * 0.9, 0.15, W * 0.9, dark, 0, 0.12, 0); // 매끈한 갑판
  switch (def.modern) {
    case 'foil': // 수중익선: 선체 아래 지주 + 날개, 위에 유선형 객실
      for (const x of [L * 0.3, -L * 0.3]) { for (const sd of [-1, 1]) cyl(0.12, 0.12, 2.6, dark, x, -1.2, sd * W * 0.4); box(0.3, 0.12, W * 1.4, dark, x, -2.4, 0); }
      box(L * 0.55, 1.4, W * 0.8, paint, 0, 0.9, 0); box(L * 0.3, 0.9, W * 0.7, glass, L * 0.15, 2.0, 0); box(L * 0.55, 0.08, W * 0.85, accent, 0, 1.65, 0);
      break;
    case 'hover': { // 호버크라프트: 둥근 스커트 + 뒤쪽 큰 팬
      const skirt = new THREE.Mesh(new THREE.CylinderGeometry(W * 0.75, W * 0.85, 1.2, 20), dark); skirt.scale.x = L * 0.55 / (W * 0.75); skirt.position.y = -0.3; g.add(skirt);
      box(L * 0.45, 1.2, W * 0.9, paint, L * 0.05, 0.85, 0); box(L * 0.2, 0.8, W * 0.7, glass, L * 0.22, 1.85, 0);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(W * 0.5, 0.15, 8, 20), dark); ring.rotation.y = Math.PI / 2; ring.position.set(-L * 0.36, W * 0.5 + 0.6, 0); g.add(ring);
      for (let i = 0; i < 3; i++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.1, W * 0.9, 0.5), grey); bl.position.set(-L * 0.36, W * 0.5 + 0.6, 0); bl.rotation.x = (i / 3) * Math.PI; g.add(bl); }
      break; }
    case 'jet': // 제트보트: 낮은 윈드실드 + 좌석 + 제트 노즐
      box(L * 0.25, 0.5, W * 0.6, glass, L * 0.15, 0.55, 0); box(L * 0.3, 0.35, W * 0.5, dark, -L * 0.1, 0.4, 0);
      cyl(0.35, 0.45, 1.2, dark, -L * 0.5, 0.1, 0, Math.PI / 2); box(L * 0.8, 0.06, 0.5, accent, 0, 0.22, 0);
      break;
    case 'cat': // 파워 카타마란: 두 선체 + 다리 갑판 + 조타실
      for (const sd of [-1, 1]) box(L * 0.95, 1.2, W * 0.35, paint, 0, -0.2, sd * W * 0.55);
      box(L * 0.7, 0.3, W * 1.3, dark, 0, 0.5, 0); box(L * 0.35, 1.2, W * 0.9, accent, L * 0.05, 1.2, 0); box(L * 0.25, 0.7, W * 0.8, glass, L * 0.15, 2.1, 0);
      break;
    case 'rail': { // 트랙마스터: 낮은 선체 + 양현으로 뻗은 유도 암 + 항로를 읽는 발광 레일
      const neon = new THREE.MeshBasicMaterial({ color: def.stripe, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
      box(L * 0.7, 0.9, W * 0.7, paint, 0, 0.6, 0);                       // 선체 상부
      box(L * 0.3, 0.7, W * 0.6, glass, L * 0.16, 1.5, 0);                // 조타실
      box(L * 0.85, 0.08, 0.35, accent, 0, 1.12, 0);                      // 중앙 줄무늬
      for (const sd of [-1, 1]) {
        // 유도 암: 옆으로 뻗어 항로 부표선을 읽는다
        const arm = new THREE.Mesh(new THREE.BoxGeometry(L * 0.16, 0.16, W * 0.95), grey);
        arm.position.set(L * 0.04, 0.55, sd * W * 0.72); g.add(arm);
        const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, 1.0, 10), dark);
        pod.position.set(L * 0.04, 0.35, sd * W * 1.18); g.add(pod);
        // 유도 레일: 배 길이만큼 이어진 발광 띠
        const rail = new THREE.Mesh(new THREE.BoxGeometry(L * 0.9, 0.12, 0.2), neon);
        rail.position.set(0, 0.34, sd * W * 0.52); g.add(rail);
        const beam = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, W * 0.5), neon);
        beam.position.set(L * 0.04, 0.3, sd * W * 0.95); g.add(beam);
      }
      // 뱃머리 센서 링 + 선미 워터제트
      const ring = new THREE.Mesh(new THREE.TorusGeometry(W * 0.28, 0.1, 8, 20), neon);
      ring.rotation.y = Math.PI / 2; ring.position.set(L * 0.42, 0.9, 0); g.add(ring);
      for (const sd of [-1, 1]) cyl(0.3, 0.4, 1.1, dark, -L * 0.46, 0.15, sd * W * 0.28, Math.PI / 2);
      break; }
    case 'destroyer': // 이지스 구축함: 상부 구조물 + 레이더면 + 마스트 + 함포 + 헬기갑판
      box(L * 0.45, 2.2, W * 0.8, grey, -L * 0.02, 1.25, 0); box(L * 0.2, 1.4, W * 0.7, grey, L * 0.08, 3.0, 0);
      for (const sd of [-1, 1]) box(0.1, 1.0, 1.0, dark, L * 0.19, 3.0, sd * W * 0.36);
      cyl(0.1, 0.16, 4.5, dark, -L * 0.08, 5.5, 0); cyl(0.9, 1.1, 0.9, grey, L * 0.32, 0.65, 0); cyl(0.08, 0.08, 2.4, dark, L * 0.42, 0.9, 0, Math.PI / 2);
      box(L * 0.2, 0.1, W * 0.7, dark, -L * 0.36, 0.25, 0); cyl(0.5, 0.5, 0.5, accent, L * 0.08, 3.95, 0);
      break;
    case 'carrier': // 대형 수송함: 넓은 비행갑판 + 우측 함교
      box(L * 0.95, 0.25, W * 1.15, grey, 0, 0.9, 0); box(L * 0.2, 2.6, W * 0.25, grey, -L * 0.05, 2.3, W * 0.42); cyl(0.08, 0.12, 3.5, dark, -L * 0.05, 5.0, W * 0.42);
      for (let i = 0; i < 3; i++) { const h = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.75, 16), accent); h.rotation.x = -Math.PI / 2; h.position.set(-L * 0.3 + i * L * 0.3, 1.04, -W * 0.15); g.add(h); }
      break;
    case 'patrol': // 고속정: 함교 + 앞 기관포 + 마스트
      box(L * 0.3, 1.3, W * 0.75, grey, -L * 0.05, 0.85, 0); box(L * 0.18, 0.7, W * 0.65, glass, L * 0.02, 1.85, 0);
      cyl(0.35, 0.4, 0.6, dark, L * 0.3, 0.5, 0); cyl(0.05, 0.05, 1.6, dark, L * 0.38, 0.7, 0, Math.PI / 2); cyl(0.06, 0.08, 2.6, dark, -L * 0.12, 2.9, 0); box(L * 0.9, 0.06, 0.4, accent, 0, 0.2, 0);
      break;
    case 'sub': { // 잠수함: 원통 선체 + 세일(함교탑) + 잠망경 + 꼬리 조종면
      const hull = new THREE.Mesh(new THREE.CylinderGeometry(W * 0.42, W * 0.42, L * 0.8, 16), paint); hull.rotation.z = Math.PI / 2; hull.position.y = -0.1; g.add(hull);
      const nose = new THREE.Mesh(new THREE.SphereGeometry(W * 0.42, 16, 10), paint); nose.position.set(L * 0.4, -0.1, 0); g.add(nose);
      const tailc = new THREE.Mesh(new THREE.ConeGeometry(W * 0.42, L * 0.2, 16), paint); tailc.rotation.z = Math.PI / 2; tailc.position.set(-L * 0.5, -0.1, 0); g.add(tailc);
      box(L * 0.16, 2.6, W * 0.35, paint, L * 0.05, 1.2, 0); cyl(0.05, 0.05, 1.6, dark, L * 0.08, 3.2, 0); for (const sd of [-1, 1]) box(1.2, 0.12, 0.6, paint, L * 0.05, 1.6, sd * W * 0.45);
      for (const sd of [-1, 1]) box(1.0, 0.12, W * 0.5, paint, -L * 0.45, -0.1, sd * W * 0.35); box(1.0, W * 0.9, 0.12, paint, -L * 0.45, -0.1, 0);
      break; }
  }
}

// 부캉이: 배가 아니라 상어다. 돛도 노도 없으니 선체 만드는 길을 통째로 비껴간다.
// 바깥(main.js, boat.js)이 기대하는 userData 모양은 그대로 맞춘다.
function buildSharkMesh(def, opts = {}) {
  const g = new THREE.Group();
  const swim = new THREE.Group();   // 헤엄치는 몸. 깃발과 등불은 여기 넣지 않는다.
  g.add(swim);
  const L = def.length;
  const skin = new THREE.MeshStandardMaterial({ color: def.hullColor, roughness: 0.6, metalness: 0.05 });
  const belly = new THREE.MeshStandardMaterial({ color: def.sailColor, roughness: 0.7 });

  // 몸통: 구를 늘여 어뢰꼴로 만들고 꼬리 쪽을 좁힌다 (배 기준 +x 가 뱃머리)
  const body = new THREE.SphereGeometry(1, 14, 10);
  const pa = body.attributes.position;
  for (let i = 0; i < pa.count; i++) {
    const x = pa.getX(i);
    const squeeze = x < 0 ? 1 - Math.abs(x) * 0.55 : 1 - x * 0.22;
    pa.setX(i, x * L * 0.5);
    pa.setY(i, pa.getY(i) * squeeze * L * 0.17);
    pa.setZ(i, pa.getZ(i) * squeeze * L * 0.15);
  }
  body.computeVertexNormals();
  const hull = new THREE.Mesh(body, skin);
  swim.add(hull);

  // 흰 배
  const bl = new THREE.SphereGeometry(1, 12, 7, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45);
  bl.scale(L * 0.46, L * 0.15, L * 0.13);
  const blm = new THREE.Mesh(bl, belly); blm.position.y = -0.12; swim.add(blm);

  // 주둥이
  const snout = new THREE.ConeGeometry(L * 0.11, L * 0.2, 8);
  snout.rotateZ(-Math.PI / 2); snout.translate(L * 0.56, -0.1, 0);
  swim.add(new THREE.Mesh(snout, skin));

  // 등지느러미 — 수면을 가르는 그 지느러미
  const shape = new THREE.Shape();
  shape.moveTo(0, 0); shape.lineTo(-L * 0.17, 0); shape.lineTo(-L * 0.04, L * 0.26); shape.lineTo(L * 0.06, L * 0.02);
  const dorsal = new THREE.ExtrudeGeometry(shape, { depth: L * 0.03, bevelEnabled: false });
  dorsal.translate(L * 0.06, L * 0.12, -L * 0.015);
  const fin = new THREE.Mesh(dorsal, skin);
  swim.add(fin);

  // 가슴지느러미 둘. 날개처럼 아주 조금 움직인다.
  const pecs = [];
  for (const sd of [-1, 1]) {
    const pec = new THREE.ConeGeometry(L * 0.07, L * 0.3, 3);
    pec.rotateX(Math.PI / 2 * sd); pec.rotateZ(sd * -0.35); pec.scale(1, 1, 0.22);
    pec.translate(0, 0, sd * L * 0.04);
    const mesh = new THREE.Mesh(pec, skin);
    mesh.position.set(L * 0.14, -L * 0.07, sd * L * 0.13);
    mesh.userData.side = sd;
    swim.add(mesh); pecs.push(mesh);
  }

  // 꼬리: 두 마디다. 꼬리자루(stem)가 먼저 돌고 꼬리지느러미(fluke)가 한 박자 늦게 따라온다.
  // 한 덩어리로 흔들면 막대기를 젓는 것처럼 보인다.
  const tail = new THREE.Group();
  tail.position.x = -L * 0.4;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(L * 0.045, L * 0.03, L * 0.17, 6), skin);
  stem.rotation.z = Math.PI / 2; stem.position.x = -L * 0.085;
  tail.add(stem);
  const fluke = new THREE.Group();
  fluke.position.x = -L * 0.17;
  const up = new THREE.ConeGeometry(L * 0.08, L * 0.34, 3); up.rotateZ(-0.5); up.scale(1, 1, 0.3); up.translate(-L * 0.07, L * 0.13, 0);
  const dn = new THREE.ConeGeometry(L * 0.06, L * 0.2, 3); dn.rotateZ(Math.PI + 0.4); dn.scale(1, 1, 0.3); dn.translate(-L * 0.05, -L * 0.09, 0);
  fluke.add(new THREE.Mesh(up, skin), new THREE.Mesh(dn, skin));
  tail.add(fluke);
  swim.add(tail);

  // 등지느러미 끝의 작은 깃발. 제독 색이 보여야 다른 배와 구분된다.
  const flagMat = new THREE.MeshStandardMaterial({ color: opts.flagColor ?? 0xffe08a, side: THREE.DoubleSide, roughness: 0.7 });
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(L * 0.16, L * 0.1), flagMat);
  flag.position.set(-L * 0.02, L * 0.42, 0);
  g.add(flag);

  const lantern = new THREE.PointLight(0xffb85c, 0, 30);
  lantern.position.set(-L * 0.1, L * 0.3, 0);
  g.add(lantern);

  // 브리치 때 터지는 물보라 자리
  const fire = new THREE.Mesh(new THREE.ConeGeometry(0.7, 3.2, 8), new THREE.MeshBasicMaterial({ color: 0x8fd4ff, transparent: true, opacity: 0.8 }));
  fire.position.set(-L * 0.55, 0, 0); fire.rotation.z = Math.PI / 2; fire.visible = false;
  g.add(fire);

  const outer = new THREE.Group();
  // 다른 배와 같은 규칙: +x 로 만들고 -90도 돌려 뱃머리가 +z(전진 방향)를 보게 한다.
  g.rotation.y = -Math.PI / 2;
  g.scale.setScalar(SHIP_SCALE);
  outer.add(g);
  outer.userData = { sails: [], oars: [], flag, lantern, fire, hull, length: L, inner: g, swim, tail, fluke, pecs };
  return outer;
}

// ---------- 거북선 ----------
// 『이충무공전서』(1795)의 귀선도를 따른다.
//   판옥선 선체 위에 포혈(砲穴)을 뚫은 방패벽을 두르고, 그 위를 거북 등처럼 둥근 지붕으로 덮었다.
//   지붕은 육각 철판을 이어 붙이고 송곳(철첨)을 촘촘히 박았으며, 가운데에 십자로 좁은 길을 냈다.
//   뱃머리에는 유황 연기를 뿜는 용머리(龍頭)를, 그 아래에는 귀면(鬼面)을 달았다. 돛대는 둘.
// 돌려주는 것: 부스트 때 켤 불꽃 묶음 (용머리 입김 + 선미 분사구 둘), 연기·불티를 뿜을 자리
function turtleShellTexture() {
  if (TEX.turtleShell) return TEX.turtleShell;
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#2a2a2c'; x.fillRect(0, 0, 256, 256);
  const R = 22, hx = R * Math.sqrt(3);
  for (let row = -1; row < 9; row++) for (let col = -1; col < 8; col++) {
    const cx = col * hx + (row % 2 ? hx / 2 : 0), cy = row * R * 1.5;
    const shade = 78 + ((row * 7 + col * 13) % 5) * 10;   // 철판마다 조금씩 다른 빛
    x.beginPath();
    for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; x.lineTo(cx + Math.cos(a) * (R - 2), cy + Math.sin(a) * (R - 2)); }
    x.closePath();
    const g = x.createRadialGradient(cx - 5, cy - 6, 2, cx, cy, R);
    g.addColorStop(0, `rgb(${shade + 40},${shade + 38},${shade + 34})`); g.addColorStop(1, `rgb(${shade},${shade - 2},${shade - 6})`);
    x.fillStyle = g; x.fill();
    x.strokeStyle = '#141416'; x.lineWidth = 3.5; x.stroke();
    x.fillStyle = '#8a8478'; for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; x.fillRect(cx + Math.cos(a) * (R - 7) - 1, cy + Math.sin(a) * (R - 7) - 1, 2.5, 2.5); }   // 리벳
    if ((row + col) % 4 === 0) { x.fillStyle = 'rgba(140,70,30,0.35)'; x.beginPath(); x.arc(cx + 4, cy + 5, 6, 0, Math.PI * 2); x.fill(); }   // 녹
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 2); t.colorSpace = THREE.SRGBColorSpace;
  return (TEX.turtleShell = t);
}
function ghostFaceTexture() {
  if (TEX.ghostFace) return TEX.ghostFace;
  const c = document.createElement('canvas'); c.width = 256; c.height = 160;
  const x = c.getContext('2d');
  x.fillStyle = '#7a1e14'; x.fillRect(0, 0, 256, 160);
  x.strokeStyle = '#d9b04a'; x.lineWidth = 6; x.strokeRect(4, 4, 248, 152);
  x.fillStyle = '#2a5a3a'; x.beginPath(); x.ellipse(128, 82, 96, 64, 0, 0, Math.PI * 2); x.fill();   // 얼굴
  x.fillStyle = '#d9b04a';
  for (const sx of [-1, 1]) {                                                                       // 뿔
    x.beginPath(); x.moveTo(128 + sx * 52, 30); x.lineTo(128 + sx * 86, 6); x.lineTo(128 + sx * 70, 40); x.fill();
    x.fillStyle = '#f2ece0'; x.beginPath(); x.ellipse(128 + sx * 40, 66, 22, 15, 0, 0, Math.PI * 2); x.fill();   // 눈
    x.fillStyle = '#c0392b'; x.beginPath(); x.arc(128 + sx * 40, 66, 9, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#111'; x.beginPath(); x.arc(128 + sx * 40, 66, 4, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#d9b04a';
    x.strokeStyle = '#111'; x.lineWidth = 5; x.beginPath(); x.moveTo(128 + sx * 16, 46); x.lineTo(128 + sx * 64, 42); x.stroke();   // 눈썹
  }
  x.fillStyle = '#111'; x.beginPath(); x.ellipse(128, 118, 50, 20, 0, 0, Math.PI * 2); x.fill();    // 입
  x.fillStyle = '#f2ece0'; for (let k = -4; k <= 4; k++) { x.beginPath(); x.moveTo(128 + k * 11 - 5, 100); x.lineTo(128 + k * 11, 113); x.lineTo(128 + k * 11 + 5, 100); x.fill(); }
  for (const sx of [-1, 1]) { x.beginPath(); x.moveTo(128 + sx * 30, 104); x.lineTo(128 + sx * 36, 136); x.lineTo(128 + sx * 42, 104); x.fill(); }   // 송곳니
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return (TEX.ghostFace = t);
}
// 불꽃 한 줄기: 바깥은 주황, 속은 흰 노랑. 더해 그리기(additive)로 빛나게. 길이 축은 core 의 +y.
function makeFlame(len, rad) {
  const flame = new THREE.Group(), core = new THREE.Group();
  const mk = (r, h, col, op) => {
    const geo = new THREE.ConeGeometry(r, h, 12, 1, true); geo.translate(0, h / 2, 0);   // 넓은 밑동이 원점(분사구), 뾰족한 끝이 +y
    return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  };
  core.add(mk(rad, len, 0xff5a12, 0.75), mk(rad * 0.62, len * 0.72, 0xffa53a, 0.8), mk(rad * 0.32, len * 0.42, 0xfff3c0, 0.95));
  flame.add(core); flame.userData.core = core;
  return flame;
}
function buildTurtle(g, def, L, W, mastH, mastMat, sails, mastTops, hullMat) {
  const painted = new THREE.MeshStandardMaterial({ map: woodTexture('turtleWall', '#8a3e24', '#3a1a0c', 9, 0.4), roughness: 0.8 });   // 붉게 칠한 방패벽
  const iron = new THREE.MeshStandardMaterial({ color: 0x2a2a2c, roughness: 0.5, metalness: 0.7 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xc9a24a, roughness: 0.35, metalness: 0.75 });
  const dragonGreen = new THREE.MeshStandardMaterial({ color: 0x2f6b3a, roughness: 0.45, metalness: 0.25 });
  const red = new THREE.MeshStandardMaterial({ color: 0xa8241a, roughness: 0.55 });
  const ivory = new THREE.MeshStandardMaterial({ color: 0xf2ece0, roughness: 0.4 });

  // 1. 포혈을 뚫은 방패벽 (판옥)
  const WALL_H = 1.35, WALL_Y = 0.2 + WALL_H / 2, WL = L * 0.8, WX = -L * 0.02, WZ = W * 0.56;   // 방패벽은 뱃전 바깥까지 덮는다
  const wall = new THREE.Mesh(new THREE.BoxGeometry(WL, WALL_H, WZ * 2), painted); wall.position.set(WX, WALL_Y, 0); g.add(wall);
  const band = new THREE.Mesh(new THREE.BoxGeometry(WL + 0.1, 0.12, WZ * 2 + 0.06), gold); band.position.set(WX, WALL_Y + WALL_H / 2, 0); g.add(band);
  const portGeo = new THREE.BoxGeometry(0.36, 0.32, 0.08), rimGeo = new THREE.BoxGeometry(0.46, 0.42, 0.04);
  const portMat = new THREE.MeshStandardMaterial({ color: 0x0a0806, roughness: 1 });
  for (const sd of [-1, 1]) for (let i = 0; i < 7; i++) {
    const px = WX - WL * 0.42 + (i / 6) * WL * 0.84;
    const rim = new THREE.Mesh(rimGeo, gold); rim.position.set(px, WALL_Y, sd * (WZ + 0.01)); g.add(rim);
    const hole = new THREE.Mesh(portGeo, portMat); hole.position.set(px, WALL_Y, sd * (WZ + 0.03)); g.add(hole);
    const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.35, 8), iron); muzzle.rotation.x = Math.PI / 2; muzzle.position.set(px, WALL_Y, sd * (WZ + 0.15)); g.add(muzzle);
  }
  // 2. 거북 등 지붕: 반원통 + 앞뒤 둥근 마구리, 육각 철판
  const RZ = WZ * 0.98, RY = 1.6, RL = WL * 0.9, ROOF_Y = WALL_Y + WALL_H / 2;
  const shellMat = new THREE.MeshStandardMaterial({ map: turtleShellTexture(), roughness: 0.5, metalness: 0.35 });
  const roofGeo = new THREE.CylinderGeometry(RZ, RZ, RL, 32, 1, true, 0, Math.PI); roofGeo.rotateZ(Math.PI / 2);
  const roof = new THREE.Mesh(roofGeo, shellMat); roof.scale.y = RY / RZ; roof.position.set(WX, ROOF_Y, 0); g.add(roof);
  for (const end of [-1, 1]) {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(RZ, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), shellMat);
    cap.scale.set((end > 0 ? 1.2 : 0.95) / RZ, RY / RZ, 1); cap.position.set(WX + end * RL / 2, ROOF_Y, 0); g.add(cap);
  }
  // 십자 통로: 등마루를 따라 한 줄, 가운데에서 가로로 한 줄
  const walkMat = new THREE.MeshStandardMaterial({ map: woodTexture('turtleWalk', '#6a4a2a', '#2a1a0a', 6, 0.4), roughness: 0.9 });
  const spine = new THREE.Mesh(new THREE.BoxGeometry(RL * 1.02, 0.08, 0.5), walkMat); spine.position.set(WX, ROOF_Y + RY + 0.02, 0); g.add(spine);
  const cross = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, RZ * 1.1), walkMat); cross.position.set(WX, ROOF_Y + RY - 0.12, 0); cross.rotation.x = 0; g.add(cross);
  // 3. 송곳(철첨): 지붕 면을 따라 줄지어, 통로는 비운다
  const spikeGeo = new THREE.ConeGeometry(0.07, 0.42, 5); spikeGeo.translate(0, 0.21, 0);
  const spikeMat = new THREE.MeshStandardMaterial({ color: 0xb8bcc2, metalness: 0.85, roughness: 0.3 });
  const rows = 11, rings = [0.22, 0.42, 0.62, 0.8, 1.2, 1.38, 1.58, 1.78, 1.98, 2.2, 2.4, 2.6, 2.78, 2.92];
  const spikes = new THREE.InstancedMesh(spikeGeo, spikeMat, rows * rings.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), nrm = new THREE.Vector3(), pos = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
  let si = 0;
  for (let r = 0; r < rows; r++) for (const phi of rings) {
    if (Math.abs(phi - Math.PI / 2) < 0.3) continue;                 // 등마루 통로
    const x = WX - RL * 0.46 + (r / (rows - 1)) * RL * 0.92 + (rings.indexOf(phi) % 2 ? 0.18 : 0);
    if (Math.abs(x - WX) < 0.35) continue;                           // 가로 통로
    pos.set(x, ROOF_Y + Math.sin(phi) * RY, Math.cos(phi) * RZ);
    nrm.set(0, Math.sin(phi) / RY, Math.cos(phi) / RZ).normalize();
    q.setFromUnitVectors(up, nrm); m4.compose(pos, q, one); spikes.setMatrixAt(si++, m4);
  }
  spikes.count = si; g.add(spikes);

  // 4. 귀면: 뱃머리 앞판에 그린 도깨비 얼굴
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.95), new THREE.MeshStandardMaterial({ map: ghostFaceTexture(), roughness: 0.7 }));
  face.position.set(WX + WL / 2 + 0.02, WALL_Y - 0.05, 0); face.rotation.y = Math.PI / 2; g.add(face);

  // 5. 용머리: 목을 들어 앞을 노려보고, 벌린 입에서 유황 연기와 불을 뿜는다
  const neckBase = new THREE.Vector3(WX + RL / 2 + 0.2, ROOF_Y + 0.3, 0);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.52, 1.7, 12), dragonGreen);
  neck.position.set(neckBase.x + 0.45, neckBase.y + 0.6, 0); neck.rotation.z = -0.55; g.add(neck);
  for (let k = 0; k < 5; k++) {                                       // 붉은 갈기
    const mane = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.6, 4), red);
    mane.position.set(neckBase.x + 0.05 + k * 0.22, neckBase.y + 0.55 + k * 0.32, 0); mane.rotation.z = 1.2; g.add(mane);
  }
  const head = new THREE.Group(); head.position.set(neckBase.x + 1.05, neckBase.y + 1.45, 0); head.rotation.z = -0.12; g.add(head);
  const skull = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.78, 0.9), dragonGreen); head.add(skull);
  const brow = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.96), gold); brow.position.set(0.25, 0.36, 0); head.add(brow);
  const upperJaw = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.34, 0.74), dragonGreen); upperJaw.position.set(0.95, 0.05, 0); upperJaw.rotation.z = 0.12; head.add(upperJaw);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), dragonGreen); nose.scale.set(1, 0.8, 1.3); nose.position.set(1.52, 0.12, 0); head.add(nose);
  const lowerJaw = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.18, 0.62), dragonGreen); lowerJaw.position.set(0.85, -0.42, 0); lowerJaw.rotation.z = -0.32; head.add(lowerJaw);
  const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.36), red); tongue.position.set(0.85, -0.25, 0); tongue.rotation.z = -0.15; head.add(tongue);
  const mouthIn = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.5), new THREE.MeshBasicMaterial({ color: 0x3a0a06 })); mouthIn.position.set(0.7, -0.18, 0); head.add(mouthIn);
  const toothGeo = new THREE.ConeGeometry(0.05, 0.16, 4);
  for (const sd of [-1, 1]) for (let k = 0; k < 4; k++) {
    const tu = new THREE.Mesh(toothGeo, ivory); tu.position.set(0.55 + k * 0.26, -0.16, sd * 0.3); tu.rotation.z = Math.PI; head.add(tu);
    const tl = new THREE.Mesh(toothGeo, ivory); tl.position.set(0.5 + k * 0.24, -0.4 - k * 0.07, sd * 0.24); head.add(tl);
  }
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, emissive: 0xff9a00, emissiveIntensity: 0.9 });
  for (const sd of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), eyeMat); eye.position.set(0.35, 0.22, sd * 0.42); head.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0x111111 })); pupil.position.set(0.44, 0.22, sd * 0.5); head.add(pupil);
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.9, 6), gold); horn.position.set(-0.35, 0.65, sd * 0.28); horn.rotation.z = 1.0; horn.rotation.x = sd * 0.25; head.add(horn);
    const whisker = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.012, 1.1, 4), gold); whisker.position.set(1.4, -0.05, sd * 0.45); whisker.rotation.z = 1.3; whisker.rotation.x = sd * -0.6; head.add(whisker);
  }
  const mouth = new THREE.Object3D(); mouth.position.set(1.45, -0.18, 0); head.add(mouth);

  // 6. 꼬리와 선미 분사구 (부스트 때 불기둥을 뒤로 뿜는다)
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.1, 6), dragonGreen); tail.position.set(WX - RL / 2 - 0.55, ROOF_Y + 0.15, 0); tail.rotation.z = 1.05; g.add(tail);
  const jets = [];
  for (const sd of [-1, 1]) {
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.34, 0.6, 12, 1, true), iron);
    nozzle.rotation.z = Math.PI / 2; nozzle.position.set(WX - WL / 2 - 0.25, WALL_Y - 0.1, sd * W * 0.26); g.add(nozzle);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 6, 14), gold); ring.rotation.y = Math.PI / 2; ring.position.set(WX - WL / 2 - 0.55, WALL_Y - 0.1, sd * W * 0.26); g.add(ring);
    const jet = new THREE.Object3D(); jet.position.set(WX - WL / 2 - 0.6, WALL_Y - 0.1, sd * W * 0.26); g.add(jet); jets.push(jet);
  }

  // 7. 돛대 둘과 대나무 살을 댄 돛 (지붕을 뚫고 선다)
  for (const [mx, hk] of [[L * 0.14, 0.62], [-L * 0.2, 0.52]]) {
    const h = mastH * hk;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, h, 8), mastMat); mast.position.set(mx, ROOF_Y + h / 2, 0); g.add(mast);
    const sail = makeSail(L * 0.3, h * 0.6, def.sailColor, { junk: true });
    sail.position.set(mx - 0.15, ROOF_Y + h * 0.55, 0); sail.rotation.y = Math.PI / 2; g.add(sail); sails.push(sail);
    mastTops.push([mx, ROOF_Y + h]);
  }

  // 8. 불꽃 묶음: 용머리 입김(앞) + 분사구 불기둥 둘(뒤) + 선체를 비추는 주황 불빛
  const group = new THREE.Group();
  const breath = makeFlame(3.2, 0.5); breath.rotation.z = -Math.PI / 2; mouth.add(breath);
  const flames = [breath];
  for (const jet of jets) { const col = makeFlame(5.5, 0.42); col.rotation.z = Math.PI / 2; jet.add(col); flames.push(col); }
  const light = new THREE.PointLight(0xff7a2a, 0, 26, 1.6); light.position.set(WX - WL / 2 - 1.5, WALL_Y + 0.5, 0); g.add(light);
  for (const f of flames) f.visible = false;   // 켜고 끄기는 boat.js 가 불꽃마다 한다
  return { group, flames, light, mouth, jets };
}

export function buildShipMesh(def, opts = {}) {
  if (def.shark) return buildSharkMesh(def, opts);
  const g = new THREE.Group();
  const L = def.length, W = L * (def.oars ? 0.26 : 0.32), H = L * (def.oars ? 0.11 : 0.16);
  const isModern = !!(def.modern || def.wig);
  const hullMat = isModern ? new THREE.MeshStandardMaterial({ color: def.hullColor, roughness: 0.45, metalness: 0.35 }) : new THREE.MeshStandardMaterial({ map: woodTexture('hull' + def.hullColor, '#' + new THREE.Color(def.hullColor).getHexString(), '#1d1208', 7, 0.5), roughness: 0.85, metalness: 0.05 });
  const woodMat = deckMat();
  const darkWood = darkWoodMat();
  const stripeMat = new THREE.MeshStandardMaterial({ color: def.stripe, roughness: 0.6, metalness: 0.1 });

  // 선체 + 흘수선 띠 + 방현재(가로 나무 띠)
  const hull = new THREE.Mesh(hullGeometry(L, W, H), hullMat);
  g.add(hull);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(L * 0.86, H * 0.18, W * 1.02), stripeMat);
  stripe.position.y = -H * 0.12; g.add(stripe);
  if (!isModern) { const wale = new THREE.Mesh(new THREE.BoxGeometry(L * 0.8, 0.18, W * 1.06), darkWood); wale.position.y = 0.05; g.add(wale); }
  if (!isModern) {
  // 갑판 (판자 텍스처)
  const deck = new THREE.Mesh(new THREE.BoxGeometry(L * 0.9, 0.2, W * 0.86), woodMat);
  deck.position.y = 0.1; g.add(deck);
  // 난간 + 난간 기둥
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(L * 0.85, 0.12, 0.14), darkWood);
    rail.position.set(-L * 0.02, 0.75, side * W * 0.44); g.add(rail);
    const nPosts = Math.max(5, Math.round(L / 2));
    for (let i = 0; i < nPosts; i++) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.12), darkWood);
      post.position.set(-L * 0.44 + (i / (nPosts - 1)) * L * 0.84, 0.45, side * W * 0.44); g.add(post);
    }
    // 포문 (갤리선·소형선 제외)
    if (!def.oars && L >= 12) {
      const ports = Math.round(L / 4);
      for (let i = 0; i < ports; i++) {
        const port = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.2), ironMat());
        port.position.set(-L * 0.3 + (i / Math.max(1, ports - 1)) * L * 0.55, -0.15, side * W * 0.5);
        g.add(port);
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.9, 6), ironMat());
        barrel.rotation.x = Math.PI / 2; barrel.position.set(port.position.x, -0.15, side * (W * 0.5 + 0.35)); g.add(barrel);
      }
    }
  }
  }
  // 갑판 소품: 해치, 통, 캡스턴, 키(타륜/키손잡이)
  if (!isModern) {
  const hatch = new THREE.Mesh(new THREE.BoxGeometry(L * 0.14, 0.25, W * 0.35), darkWood);
  hatch.position.set(L * 0.05, 0.3, 0); g.add(hatch);
  const bGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.9, 10);
  for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(bGeo, barrelMat()); b.position.set(-L * 0.12 + i * 0.95, 0.65, W * 0.28 * (i % 2 ? -1 : 1)); g.add(b); }
  const capstan = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.8, 8), darkWood);
  capstan.position.set(L * 0.28, 0.6, 0); g.add(capstan);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 6, 12), darkWood);
  wheel.position.set(-L * 0.3, 1.0, 0); wheel.rotation.y = Math.PI / 2; g.add(wheel);
  for (let i = 0; i < 4; i++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.2, 0.06), darkWood); sp.position.copy(wheel.position); sp.rotation.x = (i / 4) * Math.PI; g.add(sp); }

  // 뱃머리 좌현에 걸어 둔 닻 (자루 + 가로대 + 갈고리)
  const anchorG = new THREE.Group();
  const shank = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.7, 6), ironMat()); anchorG.add(shank);
  const stock = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 5), darkWood);
  stock.rotation.z = Math.PI / 2; stock.position.y = 0.72; anchorG.add(stock);
  for (const sd of [-1, 1]) {
    const fluke = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.6, 5), ironMat());
    fluke.position.set(sd * 0.36, -0.78, 0); fluke.rotation.z = sd * -0.9; anchorG.add(fluke);
  }
  anchorG.position.set(L * 0.36, 0.25, -W * 0.5); anchorG.rotation.x = Math.PI / 2; anchorG.rotation.z = 0.15;
  g.add(anchorG);

  // 갑판에 엎어 둔 구명정
  const boat = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), woodMat);
  boat.scale.set(L * 0.1, 0.45, W * 0.16); boat.position.set(-L * 0.06, 0.62, 0); g.add(boat);

  // 갑판 위의 선원 — 작은 실루엣이지만 배 크기를 가늠하게 해 준다
  const crewBody = mat('crew', () => new THREE.MeshStandardMaterial({ color: 0x3a4a5e, roughness: 0.9 }));
  const crewSkin = mat('crewskin', () => new THREE.MeshStandardMaterial({ color: 0xd9a877, roughness: 0.9 }));
  const nCrew = Math.max(2, Math.round(L / 5));
  for (let i = 0; i < nCrew; i++) {
    const cx = -L * 0.22 + (i / Math.max(1, nCrew - 1)) * L * 0.5;
    const cz = ((i % 3) - 1) * W * 0.26;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.85, 6), crewBody);
    body.position.set(cx, 0.65, cz); g.add(body);
    const headM = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6), crewSkin);
    headM.position.set(cx, 1.2, cz); g.add(headM);
  }
  }

  // 선미루 + 선미 창문
  const sternH = def.sternH ?? (def.oars ? 0.5 : 0.7);
  if (!isModern) {
  const stern = new THREE.Mesh(new THREE.BoxGeometry(L * 0.22, sternH, W * 0.8), hullMat);
  stern.position.set(-L * 0.36, sternH / 2 + 0.1, 0); g.add(stern);
  const sternTop = new THREE.Mesh(new THREE.BoxGeometry(L * 0.24, 0.15, W * 0.86), woodMat);
  sternTop.position.set(-L * 0.36, sternH + 0.18, 0); g.add(sternTop);
  }
  if (sternH >= 1.0 && !isModern) {
    const winMat = mat('win', () => new THREE.MeshStandardMaterial({ color: 0xffe08a, emissive: 0xffb347, emissiveIntensity: 0.6 }));
    for (let i = -1; i <= 1; i++) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.5), winMat); w.position.set(-L * 0.475, sternH * 0.55, i * W * 0.22); g.add(w); }
    const gilt = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, W * 0.8), brassMat()); gilt.position.set(-L * 0.478, sternH * 0.9, 0); g.add(gilt);
  }

  // 바우스프릿 / 갤리선 충각 + 뱃머리 장식
  if (!def.turtle && !isModern) {
    const bow = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, L * 0.32, 6), darkWood);
    bow.rotation.z = def.oars ? -Math.PI / 2 + 0.05 : -Math.PI / 2 + 0.35;
    bow.position.set(L * 0.58, def.oars ? 0.1 : 0.6, 0);
    g.add(bow);
    if (def.oars) { const ram = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.6, 6), brassMat()); ram.rotation.z = -Math.PI / 2; ram.position.set(L * 0.72, -0.1, 0); g.add(ram); }
    else { const figure = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), brassMat()); figure.position.set(L * 0.52, 0.5, 0); g.add(figure); }
  }
  // 노 (갤리선/거북선): 손잡이 + 넓적한 날
  // 노는 뱃전의 노걸이(pivot)에 걸린다. 노걸이를 돌려서 젓고, 노 자체는 그 안에 매달린다.
  // 이렇게 둘로 나눠 두면 boat.js 가 노걸이만 돌려도 손잡이는 안쪽, 날은 바깥쪽으로 함께 움직인다.
  const oars = [];
  if (def.oars || def.turtle) {
    const n = def.turtle ? 6 : Math.max(5, Math.round(L * 0.7));
    const span = L * 0.62;
    const bladeGeo = new THREE.BoxGeometry(0.1, 0.5, 1.1);
    const rowerBody = mat('rower', () => new THREE.MeshStandardMaterial({ color: 0x4a3b2c, roughness: 0.95 }));
    for (let i = 0; i < n; i++) for (const s of [-1, 1]) {
      const ox = -L * 0.33 + (i / Math.max(1, n - 1)) * span;
      // 노걸이: 뱃전 위. 여기가 노가 도는 중심이다.
      const pivot = new THREE.Group();
      pivot.position.set(ox, 0.3, s * (W * 0.5 + 0.1));
      const oar = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.8, 5), darkWood);
      shaft.rotation.x = Math.PI / 2; oar.add(shaft);
      const blade = new THREE.Mesh(bladeGeo, woodMat); blade.position.z = 2.1; oar.add(blade);
      oar.position.z = 1.0;                     // 손잡이는 뱃전 안쪽, 날은 바깥쪽으로
      oar.rotation.x = s * 0.45; oar.rotation.y = s > 0 ? 0 : Math.PI;
      pivot.add(oar);
      // 노걸이 받침 (움직이지 않는다)
      if (!def.turtle) {
        const lock = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.34, 5), darkWood);
        lock.position.set(ox, 0.16, s * (W * 0.5 + 0.1)); g.add(lock);
      }
      // 노 젓는 사람: 거북선은 갑판이 덮여 있어 보이지 않는다
      if (!def.turtle && !isModern) {
        const rower = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.7, 6), rowerBody);
        rower.position.set(ox, 0.5, s * W * 0.26); g.add(rower);
      }
      g.add(pivot);
      // lag: 노마다 위상을 조금씩 늦춰 한 덩어리로 보이지 않게 한다 (뱃머리부터 물결처럼)
      oars.push({ pivot, s, lag: (i / Math.max(1, n)) * 0.5 });
    }
  }

  const sails = [];
  let turtleFx = null;     // 거북선: 용머리·꼬리 분사구와 불꽃
  const mastH = L * (def.oars ? 0.7 : 0.75);
  const mastMat = darkWood;
  const mastTops = [];
  if (def.modern) {
    buildModern(def, g, L, W, H);
    mastTops.push([-L * 0.3, L * 0.3]);
  } else if (def.wig) {
    // 수면비행선: 매끈한 흰 동체 + 짧고 넓은 날개 + T자 꼬리날개 + 엔진 포드
    const white = new THREE.MeshStandardMaterial({ color: 0xe8eef5, roughness: 0.35, metalness: 0.3 });
    const blue = new THREE.MeshStandardMaterial({ color: 0x1f77b4, roughness: 0.4, metalness: 0.3 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x9fd4ff, roughness: 0.1, metalness: 0.6, transparent: true, opacity: 0.85 });
    const wingGeo = new THREE.BoxGeometry(L * 0.5, 0.25, W * 2.6);
    const wing = new THREE.Mesh(wingGeo, white); wing.position.set(-L * 0.05, 0.9, 0); g.add(wing);
    for (const sd of [-1, 1]) { const tip = new THREE.Mesh(new THREE.BoxGeometry(L * 0.3, 1.6, 0.25), blue); tip.position.set(-L * 0.08, 1.6, sd * W * 1.3); g.add(tip); }
    const stripeW = new THREE.Mesh(new THREE.BoxGeometry(L * 0.5, 0.05, 0.6), blue); stripeW.position.set(-L * 0.05, 1.05, 0); g.add(stripeW);
    const fin = new THREE.Mesh(new THREE.BoxGeometry(L * 0.18, L * 0.34, 0.3), blue); fin.position.set(-L * 0.4, L * 0.17 + 0.8, 0); g.add(fin);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(L * 0.16, 0.2, W * 1.6), white); tail.position.set(-L * 0.42, L * 0.34 + 0.8, 0); g.add(tail);
    const cockpit = new THREE.Mesh(new THREE.SphereGeometry(W * 0.36, 12, 8), glass); cockpit.scale.set(1.8, 0.7, 1); cockpit.position.set(L * 0.2, 1.4, 0); g.add(cockpit);
    for (const sd of [-1, 1]) {
      const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 3.2, 10), ironMat()); pod.rotation.z = Math.PI / 2; pod.position.set(L * 0.28, 2.2, sd * W * 0.55); g.add(pod);
      const prop = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.3), ironMat()); prop.position.set(L * 0.28 + 1.7, 2.2, sd * W * 0.55); g.add(prop);
    }
    mastTops.push([-L * 0.4, L * 0.34 + 0.9]);
  } else if (def.turtle) {
    turtleFx = buildTurtle(g, def, L, W, mastH, mastMat, sails, mastTops, hullMat);
  } else {
    const mastCount = def.masts;
    const positions = mastCount === 3 ? [L * 0.25, -L * 0.02, -L * 0.27]
      : mastCount === 2 ? [L * 0.2, -L * 0.18]
      : mastCount >= 4 ? Array.from({ length: mastCount }, (_, i) => L * (0.3 - (i / (mastCount - 1)) * 0.62))
      : [0];
    positions.forEach((mx, i) => {
      const h = mastH * (i === 1 ? 1.0 : mastCount === 1 ? 1.0 : 0.85);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.24, h, 8), mastMat);
      mast.position.set(mx, h / 2, 0); g.add(mast);
      // 돛대 밑동 쇠고리
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 6, 12), ironMat()); ring.rotation.x = Math.PI / 2; ring.position.set(mx, 0.35, 0); g.add(ring);
      mastTops.push([mx, h]);
      if (def.junk) {
        const sail = makeSail(L * 0.42, h * 0.72, def.sailColor, { junk: true });
        sail.position.set(mx - 0.25, h * 0.52, 0); sail.rotation.y = Math.PI / 2;
        g.add(sail); sails.push(sail);
      } else if (def.lateen) {
        const yardLen = h * 1.15;
        const yard = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, yardLen, 6), mastMat);
        yard.position.set(mx + h * 0.05, h * 0.6, 0); yard.rotation.z = Math.PI / 2 - 0.95; g.add(yard);
        const sail = makeLateenSail(W * 2.2, h * 0.8, def.sailColor);
        sail.position.set(mx - W * 0.2, h * 0.5, 0); sail.rotation.y = Math.PI / 2;
        g.add(sail); sails.push(sail);
        // 활대 밧줄
        g.add(rope([[mx + h * 0.05 + Math.cos(0.95) * yardLen * 0.5, h * 0.6 + Math.sin(0.95) * yardLen * 0.5, 0], [L * 0.45, 0.8, 0]]));
      } else {
        const yard1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, W * 1.9, 6), mastMat);
        yard1.rotation.x = Math.PI / 2; yard1.position.set(mx, h * 0.78, 0); g.add(yard1);
        const s1 = makeSail(W * 1.8, h * 0.36, def.sailColor);
        s1.position.set(mx - 0.2, h * 0.58, 0); s1.rotation.y = Math.PI / 2; g.add(s1); sails.push(s1);
        const yard2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, W * 1.5, 6), mastMat);
        yard2.rotation.x = Math.PI / 2; yard2.position.set(mx, h * 0.38, 0); g.add(yard2);
        const s2 = makeSail(W * 1.4, h * 0.3, def.sailColor);
        s2.position.set(mx - 0.2, h * 0.22, 0); s2.rotation.y = Math.PI / 2; g.add(s2); sails.push(s2);
        // 톱갤런트: 가장 높은 곳에 작은 돛 한 장을 더 올려 돛폭을 키운다
        if (h > L * 0.6) {
          const yard3 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, W * 1.05, 6), mastMat);
          yard3.rotation.x = Math.PI / 2; yard3.position.set(mx, h * 0.96, 0); g.add(yard3);
          const s3 = makeSail(W * 1.0, h * 0.2, def.sailColor);
          s3.position.set(mx - 0.18, h * 0.86, 0); s3.rotation.y = Math.PI / 2; g.add(s3); sails.push(s3);
        }
        // 활대 양끝에서 갑판으로 내려오는 밧줄(브레이스/시트)
        for (const sd of [-1, 1]) {
          g.add(rope([[mx, h * 0.78, sd * W * 0.95], [mx - L * 0.12, 0.7, sd * W * 0.44]]));
          g.add(rope([[mx, h * 0.38, sd * W * 0.75], [mx - L * 0.1, 0.7, sd * W * 0.44]]));
        }
        if ((def.id === 'galleon' || def.id === 'carrack' || def.id === 'nao') && i === 1) {
          const crossMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, side: THREE.DoubleSide });
          const c1 = new THREE.Mesh(new THREE.PlaneGeometry(0.35, h * 0.28), crossMat);
          const c2 = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.1, 0.35), crossMat);
          c1.position.set(mx - 0.2 - 0.9, h * 0.58, 0); c1.rotation.y = Math.PI / 2;
          c2.position.copy(c1.position); c2.rotation.y = Math.PI / 2;
          g.add(c1, c2);
        }
      }
      // 망대 + 돛대 꼭대기 장식
      if (i === (mastCount >= 3 ? 1 : 0) && !def.lateen) {
        const crow = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.4, 0.5, 8), darkWood);
        crow.position.set(mx, h * 0.92, 0); g.add(crow);
      }
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6), brassMat()); knob.position.set(mx, h + 0.1, 0); g.add(knob);
      // 좌우 슈라우드(그물 사다리)
      for (const sd of [-1, 1]) g.add(shrouds(mx, h * 0.8, W, L, sd));
    });
    // 스테이(돛대 사이/뱃머리로 가는 밧줄)
    for (let i = 0; i < mastTops.length; i++) {
      const [mx, h] = mastTops[i];
      const next = mastTops[i + 1];
      if (next) g.add(rope([[mx, h, 0], [next[0], next[1] * 0.9, 0]]));
    }
    const [fx, fh] = mastTops[0];
    g.add(rope([[fx, fh, 0], [L * 0.62, 0.9, 0]]));
    g.add(rope([[mastTops[mastTops.length - 1][0], mastTops[mastTops.length - 1][1], 0], [-L * 0.47, sternH + 0.3, 0]]));
    // 삼각 앞돛(지브). 정크·삼각돛 배는 원래 달지 않으므로 제외한다.
    if (!def.junk && !def.lateen) {
      const [jx, jh] = mastTops[0];
      const jibGeo = new THREE.BufferGeometry();
      jibGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
        L * 0.62, 0.9, 0, jx, jh * 0.82, 0, jx, 1.0, 0]), 3));
      jibGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 1, 1, 0]), 2));
      jibGeo.computeVertexNormals();
      const jib = new THREE.Mesh(jibGeo, new THREE.MeshStandardMaterial({ map: sailTexture(def.sailColor), side: THREE.DoubleSide }));
      g.add(jib);
    }
  }

  // 깃발
  const flagMat = new THREE.MeshStandardMaterial({ color: opts.flagColor ?? def.stripe, side: THREE.DoubleSide });
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.9, 6, 1), flagMat);
  const topMast = def.modern ? mastTops[0][1] : def.wig ? L * 0.34 + 0.9 : def.turtle ? mastTops[0][1] : mastH;
  const topX = def.modern ? mastTops[0][0] : def.wig ? -L * 0.4 : def.turtle ? mastTops[0][0] : (def.masts === 3 ? -L * 0.02 : def.masts === 2 ? L * 0.2 : 0);
  flag.position.set(topX - 0.8, topMast + 0.5, 0);
  flag.geometry.translate(-0.8, 0, 0);
  flag.position.x += 0.8;
  g.add(flag);

  // 선미 랜턴 (놋쇠 등)
  const lantern = new THREE.PointLight(0xffb85c, 0, 30);
  lantern.position.set(-L * 0.4, sternH + 1, 0);
  g.add(lantern);
  const lanternMesh = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xffa000, emissiveIntensity: 1.2 }));
  lanternMesh.position.copy(lantern.position); g.add(lanternMesh);
  const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.6, 6, 1, true), brassMat()); cage.material = brassMat(); cage.position.copy(lantern.position); g.add(cage);
  const lanternPost = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 5), darkWood); lanternPost.position.set(-L * 0.4, sternH + 0.5, 0); g.add(lanternPost);

  // 부스트 화염
  const fire = turtleFx ? turtleFx.group : new THREE.Mesh(new THREE.ConeGeometry(0.7, 3.5, 8), new THREE.MeshBasicMaterial({ color: 0xffa726, transparent: true, opacity: 0.85 }));
  if (turtleFx) { /* 거북선의 불꽃은 buildTurtle 이 용머리와 꼬리 분사구에 달아 두었다 */ }
  else if (isModern) { fire.position.set(-L * 0.6, 1.0, 0); fire.rotation.z = Math.PI / 2; }
  else { fire.position.set(-L * 0.55, -0.1, 0); fire.rotation.z = Math.PI / 2; }
  fire.visible = false;
  g.add(fire);

  const outer = new THREE.Group();
  g.rotation.y = -Math.PI / 2;
  g.scale.setScalar(SHIP_SCALE);
  outer.add(g);
  outer.userData = { sails, flag, lantern, fire, hull, length: L, inner: g, oars, turtleFx };
  return outer;
}

// ---------- 카드 미리보기: WebGL 컨텍스트 하나를 공유해 여러 캔버스에 그린다 ----------
const PREVIEW_W = 440, PREVIEW_H = 184;
let previewShared = null;
function getPreviewShared() {
  if (previewShared) return previewShared;
  const canvas = document.createElement('canvas'); canvas.width = PREVIEW_W; canvas.height = PREVIEW_H;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(PREVIEW_W, PREVIEW_H, false);
  previewShared = { renderer, canvas, entries: [], raf: 0, cursor: 0 };
  const tick = () => {
    previewShared.raf = requestAnimationFrame(tick);
    const E = previewShared.entries;
    if (!E.length) return;
    // 프레임당 몇 장만 갱신 (20장이면 각 카드가 초당 ~15회 갱신)
    const per = Math.min(E.length, 5);
    for (let k = 0; k < per; k++) {
      const e = E[previewShared.cursor % E.length]; previewShared.cursor++;
      if (!e.target.isConnected) continue;
      e.t += 0.012 * (E.length / per);
      e.ship.rotation.y = e.t; e.ship.position.y = Math.sin(e.t * 3) * 0.2; e.ship.rotation.z = Math.sin(e.t * 2) * 0.05;
      // 부캉이: 미리보기에서도 꼬리를 젓는다. 멈춰 있으면 박제로 보인다.
      const ud = e.ship.userData;
      if (ud.swim) {
        const ph = e.t * 9;
        ud.swim.rotation.y = Math.sin(ph) * 0.09;
        ud.tail.rotation.y = Math.sin(ph - 0.7) * 0.32;
        ud.fluke.rotation.y = Math.sin(ph - 1.5) * 0.26;
        ud.swim.rotation.z = Math.cos(ph) * 0.04;
        for (const f of ud.pecs) f.rotation.x = Math.sin(ph - 1.0) * 0.1;
      }
      renderer.render(e.scene, e.cam);
      e.ctx.clearRect(0, 0, PREVIEW_W, PREVIEW_H);
      e.ctx.drawImage(canvas, 0, 0);
    }
  };
  tick();
  return previewShared;
}

export function renderShipPreview(canvas, def) {
  const shared = getPreviewShared();
  canvas.width = PREVIEW_W; canvas.height = PREVIEW_H;
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(35, PREVIEW_W / PREVIEW_H, 0.1, 200);
  cam.position.set(def.length * 1.4 * SHIP_SCALE, def.length * 0.8 * SHIP_SCALE, def.length * 1.5 * SHIP_SCALE);
  cam.lookAt(0, def.length * 0.25 * SHIP_SCALE, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x335577, 1.2));
  const sun = new THREE.DirectionalLight(0xfff2d0, 2.0); sun.position.set(5, 10, 6); scene.add(sun);
  const ship = buildShipMesh(def);
  scene.add(ship);
  const entry = { scene, cam, ship, ctx: canvas.getContext('2d'), target: canvas, t: Math.random() * 6 };
  shared.entries.push(entry);
  return () => { const i = shared.entries.indexOf(entry); if (i >= 0) shared.entries.splice(i, 1); };
}
