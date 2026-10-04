// 스토리 캠페인: 10장. 각 장은 맵·미션·목표·대사·보상으로 이루어진다.
// 미션 타입
//   race     상위 n위 안에 들어 완주
//   escort   동료함을 n척 이상 살려서 완주
//   survive  제한 시간 동안 대파당하지 않고 버틴 뒤 완주
//   pursuit  목표 함선을 n번 명중시키기
//   treasure 금화·보물을 n점어치 거두고 완주
//   duel     일대일. 상대를 n번 명중시켜 무력화
//   guide    유도. 겁주지 않고 동물을 목표 지점까지 데려온다 (포격 비활성)

export const MISSION_TYPES = {
  race:     { icon: '🏁', name: '경주',   color: '#ffe08a' },
  escort:   { icon: '🛡', name: '호위',   color: '#8fd4ff' },
  survive:  { icon: '⛈', name: '생존',   color: '#ff8b6b' },
  pursuit:  { icon: '🎯', name: '추격',   color: '#ff9a3c' },
  treasure: { icon: '🪙', name: '보물',   color: '#ffd54f' },
  duel:     { icon: '⚔', name: '결투',   color: '#d08ad8' },
  guide:    { icon: '🦈', name: '유도',   color: '#5fe0d8' },
};

// line: { who: 인물 id | 'me' | null, text }
export const CHAPTERS = [
  {
    id: 0, act: '제1장', title: '리스본, 새벽 항구', subtitle: '1497년 7월 · 테주 강 어귀',
    map: 'caribbean', laps: 1, time: 'day', type: 'race',
    goal: { rank: 3 }, sGoal: { rank: 1 }, rivals: 3, consorts: 0,
    ship: 'caravel_latina', lockShip: true, fame: 150,
    reward: { figure: 'dias', ship: 'caravel_redonda' },
    intro: [
      { who: 'henry', text: '이 해도를 보게. 아프리카 서해안까지는 내가 40년을 들여 채웠네. 그 아래는 비어 있지.' },
      { who: 'henry', text: '나는 늙었고, 이 여백을 채울 사람은 내가 아니야. 오늘 아침 테주 강에 뜬 배 중 하나가 그 일을 할 걸세.' },
      { who: 'me', text: '…제 배입니다.' },
      { who: 'henry', text: '그렇다면 증명하게. 강어귀의 세 척보다 먼저 외해에 나가 보게. 그것이 시작이네.' },
    ],
    outro: [
      { who: 'henry', text: '잘했네. 해도의 첫 장을 자네에게 주겠네.' },
      { who: 'henry', text: '남쪽으로 가게. 희망봉에서 누군가 기다리고 있을 걸세. 아니, 기다린다기보다… 아직 돌아오지 못한 사람이지.' },
    ],
    fail: [{ who: 'henry', text: '바람을 읽지 못했군. 서두르지 말게. 다시 해 보게.' }],
    tip: 'W로 전진, A·D로 조타. SHIFT를 리듬 있게 연타하면 노꾼들이 배를 밀어낸다.',
  },
  {
    id: 1, act: '제2장', title: '폭풍의 곶', subtitle: '1500년 5월 · 아프리카 남단',
    map: 'antarctic', laps: 1, time: 'sunset', type: 'survive',
    goal: { survive: 55 }, sGoal: { survive: 55, hits: 0 }, rivals: 4, consorts: 0,
    ship: null, fame: 260, storm: 2.4,
    reward: { figure: 'columbus', ship: 'carrack' },
    intro: [
      { who: 'dias', text: '여기까지 왔군. 나는 이 곶을 처음 돌았고, 12년 뒤 바로 여기서 배와 함께 가라앉았소.' },
      { who: 'dias', text: '내가 폭풍의 곶이라 부른 이유를 곧 알게 될 거요. 왕은 희망봉이라 고쳐 불렀지만, 바다는 이름을 따르지 않소.' },
      { who: 'me', text: '돌아가라는 말씀입니까.' },
      { who: 'dias', text: '아니. 버티라는 말이오. 폭풍이 지나갈 때까지 암초를 피하고, 배를 잃지 마시오. 그게 전부요.' },
    ],
    outro: [
      { who: 'dias', text: '살아남았군. 내가 못 한 걸 했소.' },
      { who: 'dias', text: '이 앞은 인도양이오. 후추 냄새가 나기 시작할 거요. 가시오.' },
    ],
    fail: [{ who: 'dias', text: '보시오. 바다는 이래서 무서운 거요. 다시 오시오.' }],
    tip: '파도 마루에서는 배가 밀린다. 폭풍 구간에서는 속도보다 항로 유지가 먼저다.',
  },
  {
    id: 2, act: '제3장', title: '인도 항로', subtitle: '1498년 5월 · 캘리컷 앞바다',
    map: 'pacific', laps: 1, time: 'day', type: 'escort',
    goal: { alive: 1, rank: 4 }, sGoal: { alive: 2, rank: 1 }, rivals: 4, consorts: 2,
    ship: null, fame: 340,
    reward: { figure: 'dagama', ship: 'nao' },
    intro: [
      { who: 'dagama', text: '혼자 왔소? 그럼 절반만 온 거요.' },
      { who: 'dagama', text: '나는 네 척으로 떠나 두 척으로 돌아왔소. 사람은 170명 중 55명만 살았지. 그래도 항로는 열렸소.' },
      { who: 'me', text: '배 두 척을 붙여 주신다고요.' },
      { who: 'dagama', text: '붙여 주는 게 아니라 맡기는 거요. 진형을 지키면 뒷배가 앞배의 바람 그늘에 들어가 함대 전체가 빨라지오. 흩어지면 하나씩 가라앉고.' },
    ],
    outro: [
      { who: 'dagama', text: '동료를 데리고 돌아왔군. 그게 제독이오.' },
      { who: 'dagama', text: '다음은 말라카요. 향신료가 지나가는 문이지. 그 문에는 문지기가 있소.' },
    ],
    fail: [{ who: 'dagama', text: '배를 다 잃고 도착하는 건 도착이 아니오. 함대를 지키시오.' }],
    tip: '진형을 유지하면 함대 항진 게이지가 찬다. 2번 키(방패)로 동료함을 앞세워 암초를 막아라.',
  },
  {
    id: 3, act: '제4장', title: '말라카의 길목', subtitle: '1511년 8월 · 말라카 해협',
    map: 'mediterranean', laps: 1, time: 'sunset', type: 'pursuit',
    goal: { hits: 3 }, sGoal: { hits: 5, rank: 1 }, rivals: 5, consorts: 2,
    ship: null, fame: 420,
    reward: { figure: 'albuquerque', ship: 'galleon' },
    intro: [
      { who: 'albuquerque', text: '바다는 넓지만 길목은 세 군데뿐이오. 호르무즈, 고아, 그리고 여기 말라카.' },
      { who: 'albuquerque', text: '세 곳을 쥐면 인도양 전체를 쥐는 거요. 나는 그렇게 했소.' },
      { who: 'me', text: '앞의 저 배들은.' },
      { who: 'albuquerque', text: '해협의 주인들이지. 포문을 열고 세 발을 맞히시오. 그러면 당신도 길목을 아는 사람이 되는 거요.' },
    ],
    outro: [
      { who: 'albuquerque', text: '포술을 아는군. 내 포수들을 붙여 주겠소.' },
      { who: 'albuquerque', text: '북쪽으로 가시오. 조선의 좁은 해협에 당신이 꼭 봐야 할 사람이 있소.' },
    ],
    fail: [{ who: 'albuquerque', text: '거리를 좁히시오. 포탄은 정직해서, 멀면 안 맞소.' }],
    tip: 'SPACE로 포격. 상대의 바로 뒤 30~80미터에서 뱃머리를 맞추면 명중률이 높다. 1번 키(돌격)로 동료함을 붙여라.',
  },
  {
    id: 4, act: '제5장', title: '울돌목', subtitle: '1597년 9월 16일 · 명량',
    map: 'strait', laps: 1, time: 'day', type: 'survive',
    goal: { survive: 70 }, sGoal: { survive: 70, alive: 4, rank: 1 }, rivals: 5, consorts: 5,
    ship: null, fame: 600, storm: 1.2, formation: 'crane',
    reward: { figure: 'yi', ship: 'turtle' },
    intro: [
      { who: 'yi', text: '물길이 하루에 네 번 뒤집히오. 좁은 데서 빠른 물살은 배 백 척보다 무섭소.' },
      { who: 'me', text: '저쪽은 몇 척입니까.' },
      { who: 'yi', text: '세어서 무엇 하겠소. 우리 쪽이 몇인지가 중요하지.' },
      { who: 'yi', text: '학익진으로 가겠소. 날개를 펴고, 물살이 저들을 가둘 때까지 버티시오. 아직 우리에게는 배가 남아 있소.' },
    ],
    outro: [
      { who: 'yi', text: '살아남았소. 오늘은 그것으로 충분하오.' },
      { who: 'yi', text: '거북선의 도면을 드리겠소. 철갑은 무겁지만, 무거운 것이 가라앉지 않을 때가 있소.' },
    ],
    fail: [{ who: 'yi', text: '물살을 거스르지 마시오. 소용돌이는 기다렸다 빠져나오는 것이오.' }],
    tip: '소용돌이에 걸리면 조타로 저항하지 말고 한 바퀴 돌아 탈출 순간에 항로 방향으로 튕겨 나가라.',
  },
  {
    id: 5, act: '제6장', title: '보선(寶船)의 그림자', subtitle: '1433년 · 남중국해',
    map: 'pacific', laps: 2, time: 'cycle', type: 'race',
    goal: { rank: 3 }, sGoal: { rank: 1 }, rivals: 5, consorts: 6,
    ship: null, fame: 700,
    reward: { figure: 'zhenghe', ship: 'junk' },
    intro: [
      { who: 'zhenghe', text: '내 함대는 삼백 척이었소. 가장 큰 보선은 길이가 백 걸음이 넘었지.' },
      { who: 'zhenghe', text: '당신들이 바다에 나오기 아흔 해 전 일이오. 우리는 아프리카 동해안까지 갔다가, 조정의 명으로 배를 모두 태웠소.' },
      { who: 'me', text: '…왜 태웠습니까.' },
      { who: 'zhenghe', text: '그건 바다의 일이 아니오. 자, 두 바퀴 돌아 보시오. 한 척으로 가면 배지만, 함대로 가면 나라라오.' },
    ],
    outro: [
      { who: 'zhenghe', text: '함대를 다룰 줄 아는군.' },
      { who: 'zhenghe', text: '정크 돛의 도면을 주겠소. 대나무살은 역풍에도 접히지 않소. 동쪽으로 가시오 — 아무도 돌아온 적 없는 바다요.' },
    ],
    fail: [{ who: 'zhenghe', text: '함대는 속도가 아니라 대열이오. 다시 해 보시오.' }],
    tip: '진형을 바꿔 보라. 종렬진은 함대 항진이 빨리 차고, 횡렬진은 금화를 넓게 훑는다.',
  },
  {
    id: 6, act: '제7장', title: '아무도 돌아온 적 없는 바다', subtitle: '1565년 6월 · 북태평양',
    map: 'pacific', laps: 1, time: 'night', type: 'treasure',
    goal: { treasure: 1400 }, sGoal: { treasure: 2600, rank: 1 }, rivals: 4, consorts: 3,
    ship: null, fame: 780,
    reward: { figure: 'urdaneta', ship: 'fluyt' },
    intro: [
      { who: 'urdaneta', text: '마닐라에서 아카풀코로. 서쪽으로 가는 배는 많았지만, 동쪽으로 돌아온 배는 없었소.' },
      { who: 'urdaneta', text: '나는 북쪽으로 크게 올라갔소. 쿠로시오 해류와 편서풍을 타려고. 넉 달 걸렸고, 선원 절반이 죽었지만 도착은 했소.' },
      { who: 'me', text: '이 어둠 속에서 무엇을 찾습니까.' },
      { who: 'urdaneta', text: '은이오. 포토시의 은이 이 항로를 타고 중국까지 가오. 산개해서 거두시오 — 이 바다에서는 혼자 다 주울 수 없소.' },
    ],
    outro: [
      { who: 'urdaneta', text: '귀환 항로가 열렸소. 이제 세계는 둥글 뿐 아니라, 돌아올 수 있는 곳이 되었소.' },
    ],
    fail: [{ who: 'urdaneta', text: '은이 모자라오. 3번 키로 함대를 산개시키시오.' }],
    tip: '3번 키(산개)를 쓰면 동료함이 흩어져 금화를 거둬 기함에 넘긴다. 발견 구슬의 점수 2배 효과와 겹치면 크다.',
  },
  {
    id: 7, act: '제8장', title: '보물선단', subtitle: '1579년 3월 · 카리브해',
    map: 'caribbean', laps: 2, time: 'sunset', type: 'pursuit',
    goal: { hits: 5 }, sGoal: { hits: 8, rank: 1 }, rivals: 5, consorts: 4,
    ship: null, fame: 860,
    reward: { figure: 'drake', ship: 'frigate' },
    intro: [
      { who: 'drake', text: '스페인 은은 바다에서 주인이 바뀌는 법이오.' },
      { who: 'drake', text: '카카푸에고호를 털었을 때 은을 옮기는 데만 엿새가 걸렸소. 여왕께서는 그 절반을 받으시고 내 어깨에 칼을 얹으셨지.' },
      { who: 'me', text: '해적이군요.' },
      { who: 'drake', text: '허가받은 해적이오. 그게 전부 다른 얘기요. 앞의 선단을 따라잡아 다섯 발을 넣으시오.' },
    ],
    outro: [
      { who: 'drake', text: '나쁘지 않군. 내 프리깃을 가져가시오 — 재장전이 두 배 빠르오.' },
      { who: 'drake', text: '동쪽에 붉은 수염이 기다리고 있소. 그자는 나보다 오래된 해적이지.' },
    ],
    fail: [{ who: 'drake', text: '따라붙지 못하면 털 것도 없소. 슬립스트림을 쓰시오.' }],
    tip: '앞 배 바로 뒤에 붙으면 슬립스트림으로 가속된다. 붙은 채로 포격하면 명중이 쉽다.',
  },
  {
    id: 8, act: '제9장', title: '붉은 수염', subtitle: '1538년 9월 · 프레베자',
    map: 'mediterranean', laps: 1, time: 'sunset', type: 'duel',
    goal: { hits: 6 }, sGoal: { hits: 6, time: 170, rank: 1 }, rivals: 1, consorts: 2,
    ship: null, fame: 950, formation: 'crane',
    reward: { figure: 'barbarossa', ship: 'xebec' },
    intro: [
      { who: 'barbarossa', text: '당신 배는 바람을 기다리지. 내 배는 기다리지 않소. 노가 있으니까.' },
      { who: 'barbarossa', text: '프레베자에서 나는 신성동맹의 배 백삼십 척을 상대했소. 바람이 죽었고, 그들은 그 자리에 멈춰 섰지.' },
      { who: 'me', text: '오늘도 바람이 없습니까.' },
      { who: 'barbarossa', text: '있소. 그래서 공평하오. 여섯 발이오. 먼저 여섯 발을 넣는 쪽이 지중해를 갖소.' },
    ],
    outro: [
      { who: 'barbarossa', text: '…좋소. 노와 돛을 함께 쓰는 자벡을 주겠소. 바르바리의 배요.' },
      { who: 'barbarossa', text: '이제 남은 건 하나뿐이군. 세계를 한 바퀴 도는 일.' },
    ],
    fail: [{ who: 'barbarossa', text: '노를 저으시오. 바람만 믿으면 이 바다에서는 못 이기오.' }],
    tip: '학익진으로 상대를 가두면 동료함이 대신 포격한다. 회피보다 각을 잡는 것이 중요하다.',
  },
  {
    id: 9, act: '제10장', title: '세계 일주', subtitle: '1522년 9월 6일 · 산루카르로 돌아가는 길',
    map: 'arctic', laps: 3, time: 'cycle', type: 'race',
    goal: { rank: 2 }, sGoal: { rank: 1 }, rivals: 5, consorts: 5,
    ship: null, fame: 1500,
    reward: { figure: 'elcano', ship: 'clipper', crown: true },
    intro: [
      { who: 'elcano', text: '우리는 다섯 척 이백칠십 명으로 떠났소. 돌아온 건 한 척, 열여덟 명이오.' },
      { who: 'elcano', text: '마젤란은 막탄에서 죽었고, 나는 남은 배의 키를 잡았을 뿐이오. 영웅적인 건 하나도 없었소. 그냥 돌아가야 했으니까.' },
      { who: 'me', text: '황제께서 문장에 뭐라고 새겨 주셨습니까.' },
      { who: 'elcano', text: '"Primus circumdedisti me" — 네가 나를 처음 일주했다. 지구가 한 말이오.' },
      { who: 'elcano', text: '세 바퀴요. 마지막이오. 가시오.' },
    ],
    outro: [
      { who: 'elcano', text: '돌아왔군.' },
      { who: 'elcano', text: '이제 해도에 빈칸이 없소. 엔히크 왕자가 남긴 여백을 당신이 다 채웠소.' },
      { who: 'henry', text: '내가 사그레스에서 기다린 사람이 자네였군. 바다의 왕관은 자네 것이네.' },
    ],
    fail: [{ who: 'elcano', text: '한 바퀴가 아니라 세 바퀴요. 체력을 남겨 두시오.' }],
    tip: '긴 승부다. 전속 항해 게이지를 아꼈다가 마지막 랩 직선에서 몰아 써라.',
  },
  {
    id: 10, act: '제11장', title: '부캉이', subtitle: '2026년 가을 · 부산 북항 친수공원',
    map: 'bukhang', laps: 1, time: 'sunset', type: 'guide',
    goal: { guided: 1 }, sGoal: { guided: 1, stress: 0.4, companions: 3, time: 260 },
    rivals: 0, consorts: 4,
    ship: null, fame: 1100,
    reward: { figure: 'jeongyakjeon', ship: 'tongsinsa', title: '부산 명예 홍보대사' },
    intro: [
      { who: 'yi', text: '이 물길은 내가 알던 바다가 아니오. 다리가 여섯이고 쇠로 된 산이 서 있군.' },
      { who: 'yi', text: '그런데 사람들이 전부 난간에 붙어 아래를 보고 있소. 무엇이 있소?' },
      { who: 'me', text: '상어입니다. 보름이 넘도록 저 수로를 안 떠나고 있습니다.' },
      { who: 'yi', text: '…쫓지 마시오. 물줄기로 밀고 그물로 몰면 겁을 먹고 더 깊이 들어가오.' },
      { who: 'yi', text: '정어리를 끌고 앞서 가시오. 천천히. 따라오게 하는 것이지 몰아내는 것이 아니오.' },
    ],
    outro: [
      { who: 'yi', text: '나갔소. 제 발로.' },
      { who: 'jeongyakjeon', text: '잘 보셨소. 이제 적으시오 — 언제, 어디서, 어떻게 생긴 것을 보았는지.' },
      { who: 'jeongyakjeon', text: '나는 흑산도에서 열다섯 해 동안 그것만 했소. 이름을 붙여 적어 두지 않으면, 본 것도 못 본 것이 되오.' },
      { who: 'me', text: '…도감을 주시는 겁니까.' },
      { who: 'jeongyakjeon', text: '자산어보라 하오. 당신이 이어 쓰시오.' },
    ],
    fail: [{ who: 'yi', text: '서둘렀소. 저 녀석은 뒤에서 미는 배를 믿지 않소. 다시 하시오.' }],
    tip: '속도를 낮게 유지하라. 빠르면 부캉이가 놀라 수로 안쪽으로 되돌아간다. 해파리와 충돌은 스트레스를 올린다. 포격은 이 미션에서 꺼져 있다.',
  },
];

export const chapterCount = CHAPTERS.length;
export const findChapter = (id) => CHAPTERS.find((c) => c.id === id) || CHAPTERS[0];

// 목표를 사람이 읽는 문장으로
export function goalText(ch, goal = ch.goal) {
  const g = goal;
  switch (ch.type) {
    case 'race':     return `${g.rank}위 안으로 완주`;
    case 'escort':   return `동료함 ${g.alive}척 이상을 지키고 ${g.rank}위 안으로 완주`;
    case 'survive':  return `${g.survive}초를 버틴 뒤 완주${g.alive ? ` · 동료함 ${g.alive}척 생존` : ''}`;
    case 'pursuit':  return `라이벌 함선에 ${g.hits}발 명중`;
    case 'treasure': return `보물 ${g.treasure.toLocaleString('ko-KR')}점 수집 후 완주`;
    case 'duel':     return `상대에게 ${g.hits}발 명중${g.time ? ` · ${g.time}초 안에` : ''}`;
    case 'guide':    return g.companions
      ? `부캉이를 외해 표지까지 유도 · 스트레스 ${Math.round(g.stress * 100)}% 이하 · 상괭이 ${g.companions}마리 동행`
      : '부캉이를 겁주지 말고 외해 표지까지 유도';
    default:         return '완주';
  }
}

// 미션 달성 여부. m = 진행 상황 { hits, treasure, aliveConsorts, survived, rank, time, finished,
//                              guided, maxStress, companions }
export function meets(ch, g, m) {
  if (!g) return false;
  // 유도 미션: 완주가 아니라 '데려다 놓았는가'로 판정한다
  if (g.guided != null) {
    if (!m.guided) return false;
    if (g.stress != null && m.maxStress > g.stress) return false;
    if (g.companions != null && m.companions < g.companions) return false;
    if (g.time != null && m.time > g.time) return false;
    return true;
  }
  if (g.rank != null && !(m.finished && m.rank <= g.rank)) return false;
  if (g.alive != null && m.aliveConsorts < g.alive) return false;
  if (g.hits != null && m.hits < g.hits) return false;
  if (g.treasure != null && (m.treasure < g.treasure || !m.finished)) return false;
  if (g.survive != null && (!m.survived || !m.finished)) return false;
  if (g.time != null && m.time > g.time) return false;
  // 결투/추격은 완주하지 않아도 명중 수만 채우면 된다
  if (ch.type === 'pursuit' || ch.type === 'duel') return true;
  if (g.rank == null && g.treasure == null && g.survive == null) return !!m.finished;
  return true;
}

// 등급: S(특별 목표) / A(목표 + 무사고) / B(목표) / C(실패)
export function gradeOf(ch, m) {
  if (!meets(ch, ch.goal, m)) return 'C';
  if (meets(ch, ch.sGoal, m)) return 'S';
  return m.crashes <= 2 ? 'A' : 'B';
}

export const GRADE_COLOR = { S: '#ffd54f', A: '#7bed9f', B: '#8fd4ff', C: '#ff8b6b' };
