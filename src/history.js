// 세계 일주 항로의 기항지와 역사 해설, 세계지도 대륙 윤곽 (경도, 위도)
// 체크포인트 14개 = 기항지 14곳. 리스본에서 출발해 아프리카 → 인도양 → 동아시아 → 태평양 → 카리브해 → 대서양으로 돌아온다.

export const PORTS = [
  { name: '리스본', lon: -9.1, lat: 38.7, year: '1497', region: '포르투갈',
    fact: '바스코 다 가마가 이곳에서 출항해 인도 항로를 열었다. 엔히크 항해왕자가 후원한 항해 연구가 대항해시대의 문을 열었다.' },
  { name: '카나리아 제도', lon: -15.4, lat: 28.1, year: '1492', region: '스페인령',
    fact: '콜럼버스가 대서양 횡단 전 마지막으로 물과 식량을 채운 곳. 북동 무역풍을 타고 서쪽으로 향했다.' },
  { name: '카보베르데', lon: -23.5, lat: 15.0, year: '1494', region: '포르투갈령',
    fact: '토르데시야스 조약은 이 섬 서쪽 370레구아에 선을 그어 스페인과 포르투갈이 세계를 나눠 갖게 했다.' },
  { name: '엘미나', lon: -1.35, lat: 5.1, year: '1482', region: '황금 해안',
    fact: '포르투갈이 사하라 이남에 세운 최초의 유럽 요새 상조르즈 다 미나. 황금 무역의 거점이었으나 뒤에는 노예 무역의 비극이 이어졌다.' },
  { name: '희망봉', lon: 18.5, lat: -34.4, year: '1488', region: '아프리카 남단',
    fact: '바르톨로메우 디아스가 처음 돌았을 때는 "폭풍의 곶"이라 불렀다. 주앙 2세가 인도로 가는 희망을 담아 "희망봉"으로 고쳐 불렀다.' },
  { name: '모잠비크', lon: 40.7, lat: -15.0, year: '1498', region: '스와힐리 해안',
    fact: '다 가마 함대가 정박해 스와힐리 무역 도시와 처음 접촉했다. 이후 말린디에서 얻은 아랍 항해사의 안내로 인도양을 건넜다.' },
  { name: '캘리컷', lon: 75.8, lat: 11.3, year: '1498', region: '인도 말라바르',
    fact: '1498년 5월 다 가마가 도착해 유럽과 인도를 잇는 해상 항로가 완성됐다. 후추와 향신료 무역의 심장부였다.' },
  { name: '말라카', lon: 102.2, lat: 2.2, year: '1511', region: '말레이 반도',
    fact: '향신료 항로의 관문. 정화의 대함대가 기지로 삼았고, 1511년 알부케르크가 점령해 포르투갈의 동방 거점이 됐다.' },
  { name: '나가사키', lon: 129.9, lat: 32.7, year: '1571', region: '일본',
    fact: '포르투갈 무역선에 개항하며 남만 무역이 시작됐다. 조총, 카스텔라, 기독교가 이 항구를 통해 일본에 전해졌다.' },
  { name: '마닐라', lon: 121.0, lat: 14.6, year: '1571', region: '필리핀',
    fact: '스페인이 세운 아시아 거점. 마닐라 갤리온이 250년간 멕시코의 은과 중국의 비단·도자기를 실어 날랐다.' },
  { name: '아카풀코', lon: -99.9, lat: 16.9, year: '1565', region: '누에바에스파냐',
    fact: '우르다네타가 쿠로시오 해류와 편서풍을 이용한 태평양 동향 항로를 찾아내 마닐라 갤리온 무역이 시작됐다.' },
  { name: '카르타헤나', lon: -75.5, lat: 10.4, year: '1533', region: '카리브해',
    fact: '신대륙의 은이 모이던 스페인 보물선단의 요새 항구. 드레이크 같은 사략선의 표적이 되어 거대한 성벽을 쌓았다.' },
  { name: '아바나', lon: -82.4, lat: 23.1, year: '1519', region: '쿠바',
    fact: '보물선단이 대서양 횡단 전 집결하던 항구. 멕시코 만류를 타고 북상한 뒤 편서풍으로 유럽에 돌아갔다.' },
  { name: '아조레스', lon: -25.7, lat: 37.7, year: '1427', region: '대서양 한가운데',
    fact: '귀항하는 인도 함대와 보물선단의 중계지. 바람을 크게 돌아 귀환하는 "볼타 두 마르" 항법의 핵심이었다.' },
];

// 랩 완료 시 보여주는 짧은 역사 상식
export const TRIVIA = [
  '마젤란 원정대(1519~1522)는 5척 약 270명이 출발해 빅토리아호 1척 18명만이 세계 일주를 마치고 돌아왔다.',
  '정화의 보선은 길이 100m가 넘었다고 전해진다. 콜럼버스의 산타마리아호는 약 20m였다.',
  '괴혈병은 대항해시대 선원의 최대 적이었다. 원인이 비타민C 부족임이 밝혀진 것은 18세기에 이르러서다.',
  '경도를 정확히 재는 크로노미터가 나오기 전까지, 배는 위도만 알고 동서 위치는 추측항법으로 짐작해야 했다.',
  '이순신 장군의 거북선은 1592년 사천 해전에서 처음 실전에 투입되었다.',
  '향신료 후추는 한때 같은 무게의 은과 맞바꿀 만큼 귀했다. 인도 항로는 곧 후추 항로였다.',
  '콜럼버스는 죽을 때까지 자신이 도착한 곳을 아시아라고 믿었다.',
  '드레이크는 1577~1580년 두 번째로 세계 일주를 마쳤고, 영국 여왕에게 기사 작위를 받았다.',
];

// 대륙 윤곽 (매우 단순화한 폴리곤, [경도, 위도])
export const CONTINENTS = [
  // 유라시아
  [[-9.5,43],[-2,43.5],[0,46],[-4.5,48.5],[-1.5,49.5],[2,51],[5,53.5],[8.5,54],[8,57],[10.5,57.7],[12,56],[10.5,59],[5,59],[5,62],[13,65.5],[17,69],[24,71],[30,70.5],[41,68],[44,66],[38,65],[43,68.5],[54,69],[60,69],[68,73],[73,68],[80,73],[90,75],[105,77.5],[115,73.5],[130,71.5],[140,72],[160,70],[180,69],[180,65],[170,60],[162,59],[157,52],[162,56],[156,50],[143,53],[140,54],[135,48],[131,43],[129,36],[126,34],[125,38],[122,40],[118,39],[121,36],[120,32],[122,30],[119,25],[113,22],[108,21],[106,18],[109,12],[105,8.5],[100,13],[98,10],[100,4],[104,1.5],[103,8],[99,15],[96,17],[94,21],[91,22],[87,21],[80,15],[77,8],[73,20],[67,24],[57,25],[56,22],[59,22.5],[52,17],[45,13],[43,12.5],[39,21],[35,28],[32,31],[34,36],[30,36.5],[27,40],[26,41],[23,37],[22,40],[19,42],[13,45],[12,42],[16,38],[15,38.5],[16,40],[13,44],[9,44],[6,43],[3,43],[3,42],[-1,37],[-6,36],[-9,37]],
  // 아프리카
  [[-6,35.5],[-10,32],[-17,21],[-17,15],[-15,11],[-8,4.5],[0,5],[8,4.5],[9,0],[13,-8],[12,-17],[15,-27],[18,-34.5],[27,-33.5],[33,-28],[36,-19],[41,-15],[40,-3],[42,3],[51,11],[43,12],[39,15],[37,20],[33,27],[32,31],[25,32],[19,31],[10,34],[10,37],[0,36]],
  // 마다가스카르
  [[44,-25],[47,-25],[50,-16],[49,-12],[46,-16],[44,-20]],
  // 북아메리카
  [[-168,66],[-162,59],[-152,60],[-146,61],[-134,58],[-130,54],[-124,48],[-124,40],[-118,34],[-110,23],[-105,20],[-97,16],[-92,15],[-88,13],[-84,10],[-80,8],[-77,8],[-83,14],[-88,16],[-87,21],[-90,21],[-91,18],[-97,19],[-97,27],[-90,29],[-84,30],[-81,25],[-80,32],[-76,35],[-74,40],[-70,42],[-67,45],[-60,46],[-66,50],[-59,55],[-64,60],[-78,62],[-82,55],[-95,59],[-92,64],[-80,69],[-95,73],[-115,73],[-128,70],[-140,70],[-156,71]],
  // 남아메리카
  [[-77,8],[-72,12],[-62,10],[-52,4],[-50,0],[-44,-2],[-35,-6],[-38,-13],[-41,-22],[-48,-26],[-53,-34],[-58,-38],[-65,-42],[-68,-52],[-68,-55],[-73,-50],[-74,-40],[-71,-30],[-70,-18],[-76,-14],[-81,-5],[-80,0],[-77,4]],
  // 오스트레일리아
  [[114,-22],[114,-34],[118,-35],[124,-33],[134,-32],[138,-35],[141,-38],[147,-39],[150,-37],[153,-31],[153,-25],[146,-19],[142,-11],[137,-12],[136,-15],[130,-12],[127,-14],[122,-17]],
  // 그린란드
  [[-45,60],[-40,65],[-22,70],[-18,77],[-30,83],[-60,82],[-70,78],[-55,70],[-50,64]],
  // 영국 / 아일랜드 / 아이슬란드
  [[-5,50],[1.5,51],[1.5,53],[-1.5,56],[-3,58.5],[-6,58],[-5,55],[-3,54]],
  [[-10,52],[-6,52],[-6,55],[-10,54]],
  [[-24,65],[-14,65],[-14,66.5],[-22,66.5]],
  // 일본
  [[130,31],[132,34],[136,35],[140,36],[141,41],[140,45],[145,44],[142,42],[141,38],[137,34],[133,33]],
  // 보르네오 / 수마트라 / 자바 / 필리핀 / 뉴기니 / 스리랑카 / 뉴질랜드
  [[109,1],[113,3],[117,7],[119,5],[117,0],[114,-3],[110,-2]],
  [[95,5.5],[98,4],[104,-2],[106,-6],[103,-5],[100,-1],[96,3]],
  [[105,-6.5],[114,-7.5],[114,-8.5],[106,-7.5]],
  [[120,18],[122,18],[124,13],[126,8],[125,6],[122,8],[120,15]],
  [[131,-1],[141,-2],[150,-6],[147,-10],[140,-8],[135,-4]],
  [[80,10],[82,8],[81,6],[80,7]],
  [[166,-46],[171,-44],[175,-41],[178,-38],[174,-36],[172,-40]],
  // 남극 대륙
  [[-60,-63],[-45,-70],[-20,-72],[0,-70],[20,-70],[45,-67],[70,-68],[90,-66],[110,-66],[140,-67],[160,-70],[170,-75],[180,-78],[180,-90],[-180,-90],[-180,-78],[-150,-77],[-120,-74],[-100,-73],[-80,-73],[-70,-68]],
  // 쿠바 / 히스파니올라
  [[-85,22.5],[-78,22],[-74,20],[-77,20],[-84,21.5]],
  [[-74,19.5],[-68.5,19],[-69,18],[-74,18.5]],
];

// ---------- 연대기: 항해 중 우측에 연월일 순서로 흐르는 역사 사건 ----------
export const EVENTS = [
  { date: '1415.08.21', title: '세우타 점령', text: '포르투갈이 북아프리카 세우타를 점령하며 대항해시대의 서막이 오른다.' },
  { date: '1419', title: '사그레스의 항해 연구', text: '엔히크 항해왕자가 지도 제작자·조선공·천문학자를 모아 탐험을 후원하기 시작한다.' },
  { date: '1434', title: '보자도르 곶 돌파', text: '질 이아네스가 "돌아올 수 없는 곶"이라 불리던 보자도르 곶을 넘어 공포를 깼다.' },
  { date: '1456', title: '카보베르데 제도 발견', text: '베네치아 출신 카다모스토가 포르투갈 왕실을 위해 카보베르데 제도를 발견한다.' },
  { date: '1488.02.03', title: '희망봉 도달', text: '바르톨로메우 디아스가 아프리카 남단을 돌아 모셀만에 상륙. 인도양이 열렸다.' },
  { date: '1492.08.03', title: '콜럼버스 출항', text: '산타마리아·핀타·니냐 3척이 스페인 팔로스 항을 떠나 서쪽으로 향한다.' },
  { date: '1492.10.12', title: '신대륙 상륙', text: '콜럼버스가 바하마의 과나하니(산살바도르)에 상륙한다. 그는 그곳을 인도라 믿었다.' },
  { date: '1494.06.07', title: '토르데시야스 조약', text: '스페인과 포르투갈이 카보베르데 서쪽 370레구아 선을 기준으로 세계를 둘로 나눈다.' },
  { date: '1497.07.08', title: '다 가마 출항', text: '바스코 다 가마가 4척을 이끌고 리스본을 떠나 인도를 향한다.' },
  { date: '1498.05.20', title: '캘리컷 도착', text: '다 가마가 인도 캘리컷에 닿아 유럽-인도 해상 항로가 완성된다.' },
  { date: '1500.04.22', title: '브라질 발견', text: '카브랄이 인도로 가던 중 서쪽으로 크게 돌다 브라질 해안에 닿는다.' },
  { date: '1507.04.25', title: '"아메리카"라는 이름', text: '발트제뮐러의 세계지도가 신대륙에 아메리고 베스푸치의 이름을 붙인다.' },
  { date: '1510.11.25', title: '고아 점령', text: '알부케르크가 인도 고아를 점령해 포르투갈 동방 제국의 수도로 삼는다.' },
  { date: '1511.08.24', title: '말라카 점령', text: '알부케르크가 향신료 항로의 관문 말라카를 손에 넣는다.' },
  { date: '1513.09.25', title: '태평양 발견', text: '발보아가 파나마 지협을 넘어 유럽인 최초로 태평양을 본다.' },
  { date: '1519.09.20', title: '마젤란 출항', text: '5척 약 270명이 스페인 산루카르를 떠나 서쪽 향신료 항로를 찾아 나선다.' },
  { date: '1520.11.28', title: '마젤란 해협 통과', text: '남아메리카 끝의 해협을 빠져나온 바다가 잔잔해 "태평양(Mar Pacífico)"이라 이름 짓는다.' },
  { date: '1521.04.27', title: '마젤란 전사', text: '필리핀 막탄섬에서 라푸라푸의 전사들과 싸우다 마젤란이 목숨을 잃는다.' },
  { date: '1522.09.06', title: '최초의 세계 일주', text: '엘카노가 이끄는 빅토리아호가 18명만 태운 채 스페인으로 돌아온다.' },
  { date: '1543.08.25', title: '조총 전래', text: '포르투갈인이 탄 배가 일본 다네가시마에 표착해 조총을 전한다.' },
  { date: '1565.06.01', title: '태평양 귀환 항로', text: '우르다네타가 쿠로시오와 편서풍을 타고 필리핀에서 멕시코로 돌아가는 길을 찾는다.' },
  { date: '1571.10.07', title: '레판토 해전', text: '신성동맹 갤리 함대가 오스만 함대를 격파. 갤리선 시대 최후의 대해전.' },
  { date: '1577.12.13', title: '드레이크 출항', text: '드레이크가 골든하인드호로 세계 일주 겸 스페인 보물선 사냥에 나선다.' },
  { date: '1588.08.08', title: '무적함대 패배', text: '그라블린 해전에서 영국이 스페인 아르마다를 물리친다.' },
  { date: '1592.07.08', title: '한산도 대첩', text: '이순신이 학익진으로 일본 수군을 대파. 거북선이 선봉에 섰다.' },
  { date: '1597.09.16', title: '명량 해전', text: '이순신이 13척으로 130여 척의 일본 함대를 울돌목에서 막아낸다.' },
  { date: '1600.12.31', title: '영국 동인도회사 설립', text: '엘리자베스 1세가 동인도 무역 독점권을 부여한다.' },
  { date: '1602.03.20', title: '네덜란드 동인도회사(VOC)', text: '세계 최초의 주식회사가 세워져 향신료 무역을 장악한다.' },
  { date: '1606.02.26', title: '오스트레일리아 상륙', text: '얀스존의 다위프컨호가 유럽인 최초로 오스트레일리아 해안에 닿는다.' },
  { date: '1620.11.21', title: '메이플라워호 도착', text: '필그림들이 66일 항해 끝에 케이프코드에 닻을 내린다.' },
  { date: '1642.12.13', title: '뉴질랜드 발견', text: '아벨 타스만이 태즈메이니아에 이어 뉴질랜드를 발견한다.' },
  { date: '1761.11.18', title: '크로노미터 시험 항해', text: '해리슨의 H4 시계가 자메이카까지 경도를 오차 몇 km로 맞춘다. 경도 문제가 풀렸다.' },
];

// ---------- 역사 인물 (두루마리 아이템으로 발견) ----------
export const FIGURES = [
  { name: '엔히크 항해왕자', years: '1394~1460', text: '포르투갈 왕자. 직접 항해하지 않았지만 아프리카 서해안 탐험을 40년간 후원해 대항해시대를 열었다.' },
  { name: '바르톨로메우 디아스', years: '1450?~1500', text: '1488년 희망봉을 처음 돌았다. 훗날 카브랄 함대에 합류했다가 바로 그 희망봉 앞바다 폭풍에서 실종됐다.' },
  { name: '크리스토퍼 콜럼버스', years: '1451~1506', text: '제노바 출신. 지구 둘레를 실제보다 작게 계산해 서쪽으로 인도에 갈 수 있다고 믿었고, 대신 아메리카에 닿았다.' },
  { name: '바스코 다 가마', years: '1460?~1524', text: '1498년 인도 항로를 열었다. 항해 거리는 콜럼버스 1차 항해의 4배가 넘는 약 4만 km였다.' },
  { name: '아메리고 베스푸치', years: '1454~1512', text: '신대륙이 아시아가 아닌 별개의 대륙임을 주장했다. 그 이름이 "아메리카"가 되었다.' },
  { name: '페르디난드 마젤란', years: '1480~1521', text: '포르투갈인이지만 스페인 왕의 후원으로 세계 일주 항해를 이끌었다. 필리핀에서 전사해 일주를 완성하지는 못했다.' },
  { name: '후안 세바스티안 엘카노', years: '1476~1526', text: '마젤란 사후 빅토리아호를 지휘해 1522년 최초의 세계 일주를 완성했다. 문장에 "네가 나를 처음 일주했다"는 글귀를 받았다.' },
  { name: '정화(鄭和)', years: '1371~1433', text: '명나라 환관 제독. 1405~1433년 일곱 차례 대함대를 이끌고 동남아·인도·아라비아·동아프리카까지 항해했다.' },
  { name: '이순신', years: '1545~1598', text: '조선 수군 장군. 임진왜란 23전 전승. 거북선과 학익진으로 일본 수군을 막아냈다.' },
  { name: '프랜시스 드레이크', years: '1540?~1596', text: '영국의 사략선장. 스페인 보물선을 털며 세계를 일주했고, 무적함대 격파에 공을 세웠다.' },
  { name: '아폰수 드 알부케르크', years: '1453~1515', text: '고아·말라카·호르무즈를 점령해 포르투갈의 인도양 제국을 세운 "동방의 사자".' },
  { name: '하이레딘 바르바로사', years: '1478?~1546', text: '오스만 제국의 대제독. 지중해를 갤리 함대로 지배한 바르바리 해적 출신.' },
  { name: '피리 레이스', years: '1465?~1553', text: '오스만 제독이자 지도 제작자. 1513년 지도에 남아메리카 해안이 놀랍도록 정확히 그려져 있다.' },
  { name: '게라르두스 메르카토르', years: '1512~1594', text: '1569년 항해용 도법을 발표했다. 나침반 방위를 직선으로 그릴 수 있는 이 지도는 지금도 쓰인다.' },
  { name: '안드레스 데 우르다네타', years: '1498~1568', text: '수도사이자 항해사. 태평양을 동쪽으로 건너는 귀환 항로를 찾아 마닐라 갤리온 무역을 가능하게 했다.' },
  { name: '페드루 알바르스 카브랄', years: '1467?~1520', text: '인도로 가던 길에 브라질을 발견했다. 함대에는 희망봉의 디아스도 타고 있었다.' },
  { name: '바스코 누녜스 데 발보아', years: '1475~1519', text: '파나마 지협을 걸어 넘어 유럽인 최초로 태평양을 본 탐험가.' },
  { name: '존 해리슨', years: '1693~1776', text: '시계 장인. 흔들리는 배에서도 정확한 크로노미터를 만들어 바다 위 경도 측정을 가능하게 했다.' },
  { name: '장보고', years: '?~846', text: '완도에 청해진을 세우고 신라·당·일본을 잇는 바닷길을 쥐었다. 해적을 눌러 항로를 열고 그 길로 교역했다.' },
  { name: '최부', years: '1454~1504', text: '제주에서 표류해 중국 저장성에 닿았고, 걸어서 북경을 거쳐 돌아왔다. 그 여정을 『표해록』에 적었다.' },
  { name: '정약전', years: '1758~1816', text: '흑산도 유배 중에 바다 생물을 조사해 『자산어보』를 썼다. 이름과 생김새, 맛과 쓰임을 함께 적은 책이다.' },
];

// ---------- 발견: 현상 / 사물 / 사건 (발견 구슬 아이템) ----------
// effect: aurora 하늘 오로라 / elmo 돛대 불빛 / tradewind 순풍 / current 해류 가속 / citrus 게이지 충전 / bonus 점수 2배
export const DISCOVERIES = [
  { kind: '자연현상', name: '오로라', text: '고위도 밤하늘의 빛의 장막. 태양풍의 입자가 대기와 부딪혀 빛난다. 북방 항로의 선원들이 신의 징조로 여겼다.', effect: 'aurora', color: '#7bffb0' },
  { kind: '자연현상', name: '세인트 엘모의 불', text: '폭풍 전후 돛대 끝에 푸른 불꽃이 맺히는 현상. 대기 전기의 코로나 방전이다. 마젤란 함대는 이를 수호성인의 가호로 믿었다.', effect: 'elmo', color: '#8fd4ff' },
  { kind: '자연현상', name: '무역풍', text: '적도 양쪽에서 늘 같은 방향으로 부는 바람. 콜럼버스는 이 바람을 타고 서쪽으로 갔다. 영어 trade는 "일정한 길"이란 옛 뜻이다.', effect: 'tradewind', color: '#ffe08a' },
  { kind: '자연현상', name: '쿠로시오 해류', text: '필리핀에서 일본을 지나 북태평양을 도는 검푸른 난류. 우르다네타는 이 흐름을 타고 멕시코로 돌아갔다.', effect: 'current', color: '#5cc8ff' },
  { kind: '자연현상', name: '편서풍', text: '중위도에서 서쪽에서 동쪽으로 부는 바람. 유럽으로 돌아오는 배들은 북쪽으로 올라가 이 바람을 탔다.', effect: 'tradewind', color: '#ffe08a' },
  { kind: '자연현상', name: '적도 무풍대', text: '적도 부근에서 바람이 죽는 지대. 몇 주씩 갇힌 배에서는 물과 식량이 떨어졌다. 영어로 doldrums, "우울"이란 뜻이 됐다.', effect: 'bonus', color: '#c8b89a' },
  { kind: '자연현상', name: '사르가소 해', text: '대서양 한가운데 해초가 떠다니는 바다. 콜럼버스 선원들은 육지가 가까운 줄 알았으나 수천 km의 바다였다.', effect: 'bonus', color: '#8fbf6a' },
  { kind: '사물', name: '아스트롤라베', text: '태양이나 별의 고도를 재서 위도를 구하는 도구. 흔들리는 갑판 위에서는 오차가 컸다.', effect: 'bonus', color: '#d4af37' },
  { kind: '사물', name: '나침반', text: '중국에서 발명되어 아랍을 거쳐 유럽에 전해졌다. 흐린 날에도 방위를 알 수 있게 되자 겨울 항해가 가능해졌다.', effect: 'bonus', color: '#d4af37' },
  { kind: '사물', name: '포르톨라노 해도', text: '항구 사이를 잇는 방위선이 그물처럼 그려진 중세 해도. 지중해 항해의 필수품이었다.', effect: 'bonus', color: '#d4af37' },
  { kind: '사물', name: '감귤 상자', text: '괴혈병은 비타민C 부족으로 잇몸이 무너지는 병. 1747년 린드가 감귤로 낫는다는 것을 실험으로 증명했다.', effect: 'citrus', color: '#ffb347' },
  { kind: '사물', name: '후추 자루', text: '한때 같은 무게의 은과 맞바꿀 만큼 비쌌다. 인도 항로는 곧 후추 항로였다.', effect: 'bonus', color: '#ff9a3c' },
  { kind: '사물', name: '포토시 은', text: '볼리비아 포토시 은광의 은이 마닐라 갤리온을 타고 중국까지 흘러 세계 화폐가 되었다.', effect: 'bonus', color: '#e0e0e0' },
  { kind: '사물', name: '명나라 청화백자', text: '유럽 왕실이 열광한 중국 도자기. 갤리온과 카락의 선창에 짚에 싸여 실려 왔다.', effect: 'bonus', color: '#8fd4ff' },
  { kind: '사물', name: '건빵과 소금절임', text: '항해 식량은 벌레 먹은 건빵과 소금에 절인 고기였다. 신선한 물은 며칠 만에 상했다.', effect: 'citrus', color: '#c8b89a' },
  { kind: '사건', name: '적도 통과 의식', text: '처음 적도를 넘는 선원을 바닷물에 빠뜨리는 전통. "넵튠 왕"이 심판을 맡았다.', effect: 'bonus', color: '#5cc8ff' },
  { kind: '사건', name: '괴혈병 창궐', text: '다 가마의 첫 항해에서 선원 170명 중 100명 이상이 괴혈병으로 죽었다.', effect: 'citrus', color: '#ffb347' },
  { kind: '사건', name: '선상 반란', text: '마젤란은 파타고니아에서 반란을 진압했다. 규율은 목숨과 직결된 문제였다.', effect: 'bonus', color: '#ff6b6b' },
  { kind: '사건', name: '조선통신사', text: '1607년부터 1811년까지 열두 차례, 조선이 일본에 보낸 사절단. 400~500명이 부산에서 배를 타고 쓰시마를 거쳐 에도까지 갔다.', effect: 'bonus', color: '#e8c35a' },
  { kind: '사물', name: '초량왜관', text: '조선 후기 부산에 둔 일본과의 교역 거류지. 1678년 초량으로 옮겼다. 조선에서 일본인이 머물 수 있는 유일한 곳이었다.', effect: 'bonus', color: '#c8a06a' },
  { kind: '사물', name: '자산어보', text: '정약전이 흑산도 유배 중에 쓴 해양생물 기록. 물고기와 조개와 해초의 이름, 생김새, 맛과 쓰임을 적었다.', effect: 'bonus', color: '#5fe0d8' },
  { kind: '사물', name: '오륙도', text: '부산 앞바다의 바위섬. 보는 방향과 물때에 따라 다섯으로도 여섯으로도 보인다 하여 붙은 이름이다.', effect: 'bonus', color: '#8fbf6a' },
  { kind: '자연현상', name: '대마난류', text: '쿠로시오에서 갈라져 대한해협으로 올라오는 따뜻한 해류. 남쪽 바다의 물고기를 한국 연안까지 실어 온다.', effect: 'current', color: '#5cc8ff' },
];

// ---------- 맵별 항로 (우측 상단 지도용): 각 14곳, 체크포인트와 1:1 ----------
// bounds: [경도 최소, 경도 최대, 위도 최소, 위도 최대]
export const MAP_ROUTES = {
  pacific: { bounds: [95, 215, -25, 40], center: 155, ports: [
    { name: '마닐라', en: 'Manila', lon: 121.0, lat: 14.6, year: '1571', region: '필리핀', regionEn: 'Philippines', fact: '마닐라 갤리온이 250년간 태평양을 오간 출발점.', factEn: 'Where the Manila galleons set out across the Pacific for 250 years.' },
    { name: '괌', en: 'Guam', lon: 144.8, lat: 13.5, year: '1521', region: '마리아나 제도', regionEn: 'Marianas', fact: '마젤란 함대가 태평양 횡단 후 처음 상륙한 섬.', factEn: 'The first island Magellan\'s fleet touched after crossing the Pacific.' },
    { name: '팔라우', en: 'Palau', lon: 134.5, lat: 7.5, year: '1543', region: '미크로네시아', regionEn: 'Micronesia', fact: '스페인 탐험가 비야로보스가 처음 기록한 산호섬.', factEn: 'Coral islands first recorded by the Spanish explorer Villalobos.' },
    { name: '라바울', en: 'Rabaul', lon: 152.2, lat: -4.2, year: '1700', region: '뉴기니', regionEn: 'New Guinea', fact: '화산 칼데라 속의 천연 항구. 댐피어가 뉴브리튼을 발견했다.', factEn: 'A natural harbour inside a volcanic caldera; Dampier discovered New Britain here.' },
    { name: '과달카날', en: 'Guadalcanal', lon: 160.0, lat: -9.6, year: '1568', region: '솔로몬 제도', regionEn: 'Solomon Islands', fact: '멘다냐가 "솔로몬의 황금"을 찾아 이름 붙인 섬.', factEn: 'Named by Mendaña, who came looking for the gold of Solomon.' },
    { name: '수바', en: 'Suva', lon: 178.4, lat: -18.1, year: '1643', region: '피지', regionEn: 'Fiji', fact: '타스만이 지나간 뒤 쿡이 다시 찾은 남태평양의 관문.', factEn: 'Passed by Tasman, revisited by Cook: the gateway to the South Pacific.' },
    { name: '아피아', en: 'Apia', lon: -171.8, lat: -13.8, year: '1722', region: '사모아', regionEn: 'Samoa', fact: '네덜란드의 로헤베인이 유럽인 최초로 사모아를 보았다.', factEn: 'Roggeveen was the first European to sight Samoa.' },
    { name: '파페에테', en: 'Papeete', lon: -149.6, lat: -17.5, year: '1767', region: '타히티', regionEn: 'Tahiti', fact: '월리스와 쿡이 금성 관측을 위해 찾은 낙원의 섬.', factEn: 'Wallis and Cook came here to observe the transit of Venus.' },
    { name: '호놀룰루', en: 'Honolulu', lon: -157.9, lat: 21.3, year: '1778', region: '하와이', regionEn: 'Hawaii', fact: '쿡 선장이 "샌드위치 제도"라 부른 태평양의 십자로.', factEn: 'Cook named these the Sandwich Islands: the crossroads of the Pacific.' },
    { name: '미드웨이', en: 'Midway', lon: -177.4, lat: 28.2, year: '1859', region: '북태평양', regionEn: 'North Pacific', fact: '태평양 한가운데의 환초. 이름 그대로 아시아와 아메리카의 중간.', factEn: 'An atoll in mid-ocean, halfway between Asia and America as its name says.' },
    { name: '웨이크섬', en: 'Wake Island', lon: 166.6, lat: 19.3, year: '1568', region: '북태평양', regionEn: 'North Pacific', fact: '멘다냐가 발견한 외딴 환초. 훗날 태평양 횡단 비행의 중계지.', factEn: 'A lonely atoll found by Mendaña, later a stop for trans-Pacific flights.' },
    { name: '사이판', en: 'Saipan', lon: 145.7, lat: 15.2, year: '1565', region: '마리아나 제도', regionEn: 'Marianas', fact: '레가스피가 스페인령으로 선언한 마리아나의 섬.', factEn: 'Claimed for Spain by Legazpi.' },
    { name: '나하', en: 'Naha', lon: 127.7, lat: 26.2, year: '1429', region: '류큐', regionEn: 'Ryukyu', fact: '류큐 왕국의 항구. 명·조선·일본·동남아를 잇는 중계 무역으로 번영했다.', factEn: 'Port of the Ryukyu Kingdom, rich on trade linking China, Korea, Japan and Southeast Asia.' },
    { name: '타이난', en: 'Tainan', lon: 120.2, lat: 23.0, year: '1624', region: '타이완', regionEn: 'Taiwan', fact: '네덜란드가 질란디아 요새를 세운 타이완의 첫 관문.', factEn: 'Where the Dutch built Fort Zeelandia, Taiwan\'s first gateway.' },
  ] },
  mediterranean: { bounds: [-10, 38, 29, 47], coasts: 'mediterranean', ports: [
    { name: '지브롤터', en: 'Gibraltar', lon: -5.35, lat: 36.1, year: '1462', region: '헤라클레스의 기둥', regionEn: 'Pillars of Hercules', fact: '지중해의 문. 고대에는 여기가 세상의 끝이었다.', factEn: 'The gate of the Mediterranean; in antiquity, the edge of the world.' },
    { name: '발렌시아', en: 'Valencia', lon: -0.38, lat: 39.5, year: '1238', region: '아라곤', regionEn: 'Aragon', fact: '비단과 도자기의 항구. 아라곤 왕국의 지중해 무역 거점.', factEn: 'Port of silk and ceramics, Aragon\'s Mediterranean trading base.' },
    { name: '마요르카', en: 'Mallorca', lon: 2.65, lat: 39.6, year: '1375', region: '발레아레스', regionEn: 'Balearics', fact: '카탈루냐 지도의 고향. 유대인 지도 제작자들이 세계를 그렸다.', factEn: 'Home of the Catalan Atlas, where Jewish cartographers mapped the world.' },
    { name: '마르세유', en: 'Marseille', lon: 5.37, lat: 43.3, year: '-600', region: '프로방스', regionEn: 'Provence', fact: '그리스인이 세운 프랑스 최고(最古)의 항구.', factEn: 'France\'s oldest port, founded by Greek settlers.' },
    { name: '제노바', en: 'Genoa', lon: 8.93, lat: 44.4, year: '1451', region: '리구리아', regionEn: 'Liguria', fact: '콜럼버스의 고향. 베네치아와 지중해 무역을 다툰 해양 공화국.', factEn: 'Columbus\'s birthplace, a maritime republic that rivalled Venice.' },
    { name: '나폴리', en: 'Naples', lon: 14.25, lat: 40.8, year: '1442', region: '캄파니아', regionEn: 'Campania', fact: '베수비오 아래의 대항구. 아라곤과 스페인의 남이탈리아 수도.', factEn: 'Great harbour under Vesuvius, capital of Aragonese and Spanish southern Italy.' },
    { name: '팔레르모', en: 'Palermo', lon: 13.36, lat: 38.1, year: '1072', region: '시칠리아', regionEn: 'Sicily', fact: '아랍·노르만·스페인 문화가 겹겹이 쌓인 시칠리아의 수도.', factEn: 'Sicily\'s capital, layered with Arab, Norman and Spanish culture.' },
    { name: '몰타', en: 'Malta', lon: 14.5, lat: 35.9, year: '1565', region: '몰타 기사단', regionEn: 'Knights of Malta', fact: '기사단이 오스만의 대포위를 막아낸 지중해의 요새.', factEn: 'The fortress island where the Knights withstood the Great Siege of 1565.' },
    { name: '알렉산드리아', en: 'Alexandria', lon: 29.9, lat: 31.2, year: '-331', region: '이집트', regionEn: 'Egypt', fact: '대등대와 대도서관의 도시. 향신료가 인도양에서 지중해로 넘어오던 길목.', factEn: 'City of the Lighthouse and the Library, where spices passed from the Indian Ocean to the Mediterranean.' },
    { name: '로도스', en: 'Rhodes', lon: 28.2, lat: 36.4, year: '1522', region: '도데카니사', regionEn: 'Dodecanese', fact: '거상이 서 있던 섬. 기사단이 쫓겨나 몰타로 옮겨갔다.', factEn: 'Island of the Colossus; the Knights were driven out and moved to Malta.' },
    { name: '이라클리온', en: 'Heraklion', lon: 25.1, lat: 35.3, year: '1204', region: '크레타', regionEn: 'Crete', fact: '베네치아의 "칸디아". 400년간 동지중해 함대의 기지였다.', factEn: 'Venetian "Candia", base of the eastern fleet for 400 years.' },
    { name: '이스탄불', en: 'Istanbul', lon: 28.97, lat: 41.0, year: '1453', region: '오스만', regionEn: 'Ottoman', fact: '두 대륙을 잇는 제국의 수도. 오스만 갤리 함대의 심장.', factEn: 'Imperial capital bridging two continents, heart of the Ottoman galley fleet.' },
    { name: '베네치아', en: 'Venice', lon: 12.34, lat: 45.4, year: '1571', region: '베네토', regionEn: 'Veneto', fact: '바다의 공화국. 갤리어스로 레판토를 승리로 이끌었다.', factEn: 'Republic of the sea; its galleasses won the day at Lepanto.' },
    { name: '튀니스', en: 'Tunis', lon: 10.2, lat: 36.8, year: '1535', region: '바르바리', regionEn: 'Barbary', fact: '바르바로사의 해적 기지를 카를 5세가 점령한 카르타고의 땅.', factEn: 'Land of Carthage, where Charles V took Barbarossa\'s corsair base.' },
  ] },
  arctic: { bounds: [-180, 180, 55, 85], ports: [
    { name: '베르겐', en: 'Bergen', lon: 5.3, lat: 60.4, year: '1360', region: '노르웨이', regionEn: 'Norway', fact: '한자 동맹의 말린 대구 무역 거점.', factEn: 'Hanseatic base of the stockfish trade.' },
    { name: '트롬쇠', en: 'Tromsø', lon: 18.95, lat: 69.6, year: '1794', region: '노르웨이', regionEn: 'Norway', fact: '북극 탐험대의 출발 항구. "북극의 문".', factEn: 'Gateway to the Arctic, where polar expeditions set out.' },
    { name: '스발바르', en: 'Svalbard', lon: 15.6, lat: 78.2, year: '1596', region: '북극해', regionEn: 'Arctic', fact: '바렌츠가 북동항로를 찾다 발견한 얼음의 섬.', factEn: 'Found by Barentsz while seeking the Northeast Passage.' },
    { name: '무르만스크', en: 'Murmansk', lon: 33.1, lat: 69.0, year: '1916', region: '러시아', regionEn: 'Russia', fact: '멕시코 만류 덕에 얼지 않는 북극권의 항구.', factEn: 'An Arctic port kept ice-free by the Gulf Stream.' },
    { name: '아르한겔스크', en: 'Arkhangelsk', lon: 40.5, lat: 64.5, year: '1553', region: '러시아', regionEn: 'Russia', fact: '챈슬러가 북쪽 바다로 러시아에 닿아 영국-러시아 무역이 열렸다.', factEn: 'Chancellor reached Russia by the northern sea, opening English trade.' },
    { name: '노바야제믈랴', en: 'Novaya Zemlya', lon: 56.0, lat: 74.0, year: '1597', region: '북극해', regionEn: 'Arctic', fact: '바렌츠 일행이 얼음에 갇혀 겨울을 난 곳.', factEn: 'Where Barentsz\'s crew wintered trapped in the ice.' },
    { name: '딕손', en: 'Dikson', lon: 80.5, lat: 73.5, year: '1875', region: '시베리아', regionEn: 'Siberia', fact: '노르덴셸드가 북동항로 최초 통과 때 들른 카라해의 항구.', factEn: 'Kara Sea harbour on Nordenskiöld\'s first passage of the Northeast route.' },
    { name: '틱시', en: 'Tiksi', lon: 128.9, lat: 71.6, year: '1739', region: '시베리아', regionEn: 'Siberia', fact: '레나강 하구. 대북방 탐험대가 해안선을 그렸다.', factEn: 'Mouth of the Lena, charted by the Great Northern Expedition.' },
    { name: '베링 해협', en: 'Bering Strait', lon: -169, lat: 65.8, year: '1728', region: '아시아·아메리카 사이', regionEn: 'Between Asia and America', fact: '베링이 두 대륙이 떨어져 있음을 확인한 해협.', factEn: 'Where Bering proved that Asia and America are separate.' },
    { name: '우트키아그빅', en: 'Utqiagvik', lon: -156.8, lat: 71.3, year: '1826', region: '알래스카', regionEn: 'Alaska', fact: '미국 최북단. 비치가 북서항로를 찾아 닿은 곶.', factEn: 'The northernmost point of the USA, reached by Beechey seeking the Northwest Passage.' },
    { name: '레졸루트', en: 'Resolute', lon: -94.9, lat: 74.7, year: '1850', region: '캐나다 북극', regionEn: 'Canadian Arctic', fact: '실종된 프랭클린 탐험대를 찾던 배들의 겨울 기지.', factEn: 'Winter base of the ships searching for Franklin\'s lost expedition.' },
    { name: '누크', en: 'Nuuk', lon: -51.7, lat: 64.2, year: '1721', region: '그린란드', regionEn: 'Greenland', fact: '바이킹이 500년 살다 사라진 땅에 한스 에게데가 다시 세운 마을.', factEn: 'Refounded by Hans Egede where Vikings had lived and vanished.' },
    { name: '레이캬비크', en: 'Reykjavík', lon: -21.9, lat: 64.1, year: '874', region: '아이슬란드', regionEn: 'Iceland', fact: '잉골푸르가 정착한 "연기의 만". 북대서양 항해의 중계지.', factEn: '"Smoky Bay" settled by Ingólfur, a way station of North Atlantic voyages.' },
    { name: '토르스하운', en: 'Tórshavn', lon: -6.8, lat: 62.0, year: '1000', region: '페로 제도', regionEn: 'Faroes', fact: '바이킹의 의회가 열리던 섬. 노르웨이와 아이슬란드 사이의 징검다리.', factEn: 'Island of the Viking assembly, stepping stone between Norway and Iceland.' },
  ] },
  antarctic: { bounds: [-180, 180, -80, -45], ports: [
    { name: '우수아이아', en: 'Ushuaia', lon: -68.3, lat: -54.8, year: '1520', region: '티에라델푸에고', regionEn: 'Tierra del Fuego', fact: '세계 최남단 도시. 마젤란이 본 "불의 땅".', factEn: 'The world\'s southernmost city, on Magellan\'s "Land of Fire".' },
    { name: '케이프혼', en: 'Cape Horn', lon: -67.3, lat: -55.9, year: '1616', region: '드레이크 해협', regionEn: 'Drake Passage', fact: '스하우턴이 돌아 이름 붙인 남아메리카의 끝. 선원의 무덤.', factEn: 'Rounded and named by Schouten; the sailors\' graveyard.' },
    { name: '킹조지섬', en: 'King George Island', lon: -58.3, lat: -62.0, year: '1819', region: '사우스셰틀랜드', regionEn: 'South Shetlands', fact: '스미스가 발견한 남극권 최초의 땅. 세종기지가 여기 있다.', factEn: 'First land found south of the Antarctic Convergence; home of Korea\'s King Sejong Station.' },
    { name: '파머 기지', en: 'Palmer Station', lon: -64.1, lat: -64.8, year: '1820', region: '남극반도', regionEn: 'Antarctic Peninsula', fact: '물개잡이 파머가 남극 대륙을 본 곳.', factEn: 'Where sealer Nathaniel Palmer sighted the Antarctic mainland.' },
    { name: '웨들해', en: 'Weddell Sea', lon: -45.0, lat: -70.0, year: '1823', region: '남극', regionEn: 'Antarctica', fact: '섀클턴의 인듀어런스호가 얼음에 갇혀 부서진 바다.', factEn: 'Where Shackleton\'s Endurance was crushed in the ice.' },
    { name: '사우스조지아', en: 'South Georgia', lon: -36.5, lat: -54.3, year: '1775', region: '남대서양', regionEn: 'South Atlantic', fact: '쿡이 상륙한 섬. 섀클턴의 구조 행군이 끝난 곳.', factEn: 'Landed by Cook; the end of Shackleton\'s rescue march.' },
    { name: '부베섬', en: 'Bouvet Island', lon: 3.4, lat: -54.4, year: '1739', region: '남대서양', regionEn: 'South Atlantic', fact: '세상에서 가장 외딴 섬.', factEn: 'The most remote island on Earth.' },
    { name: '케르겔렌', en: 'Kerguelen', lon: 69.3, lat: -49.3, year: '1772', region: '남인도양', regionEn: 'Southern Indian Ocean', fact: '쿡이 "황량한 섬"이라 부른 폭풍의 군도.', factEn: 'Cook called them the Desolation Islands.' },
    { name: '매쿼리섬', en: 'Macquarie Island', lon: 158.9, lat: -54.6, year: '1810', region: '남태평양', regionEn: 'Southern Pacific', fact: '모슨 남극 탐험대의 무선 중계 기지.', factEn: 'Radio relay base of Mawson\'s Antarctic expedition.' },
    { name: '맥머도', en: 'McMurdo', lon: 166.7, lat: -77.8, year: '1841', region: '로스해', regionEn: 'Ross Sea', fact: '로스가 발견한 만. 스콧과 아문센의 남극점 경쟁이 시작된 곳.', factEn: 'Found by Ross; where the race to the Pole between Scott and Amundsen began.' },
    { name: '아문센해', en: 'Amundsen Sea', lon: -110, lat: -73.0, year: '1929', region: '남극', regionEn: 'Antarctica', fact: '최초로 남극점에 선 아문센의 이름을 딴 바다.', factEn: 'Named for Amundsen, first to stand at the South Pole.' },
    { name: '피터 1세 섬', en: 'Peter I Island', lon: -90.6, lat: -68.8, year: '1821', region: '벨링스하우젠해', regionEn: 'Bellingshausen Sea', fact: '벨링스하우젠이 남극권에서 처음 발견한 섬.', factEn: 'First island found within the Antarctic Circle, by Bellingshausen.' },
    { name: '스탠리', en: 'Stanley', lon: -57.9, lat: -51.7, year: '1690', region: '포클랜드', regionEn: 'Falklands', fact: '케이프혼을 도는 배들의 마지막 보급항.', factEn: 'Last supply port for ships rounding the Horn.' },
    { name: '푼타아레나스', en: 'Punta Arenas', lon: -70.9, lat: -53.2, year: '1848', region: '마젤란 해협', regionEn: 'Strait of Magellan', fact: '마젤란 해협의 항구. 남극 탐험대의 출발지.', factEn: 'Port on the Strait of Magellan, departure point of Antarctic expeditions.' },
  ] },
  strait: { bounds: [124, 133, 31.5, 37.5], coasts: 'strait', ports: [
    { name: '부산', en: 'Busan', lon: 129.04, lat: 35.1, year: '1407', region: '경상도', regionEn: 'Gyeongsang', fact: '왜관이 열린 조선의 관문. 임진왜란 첫 격전지.', factEn: 'Joseon\'s gateway with its Japanese trading post; first battleground of the Imjin War.' },
    { name: '거제', en: 'Geoje', lon: 128.6, lat: 34.8, year: '1592', region: '경상도', regionEn: 'Gyeongsang', fact: '옥포 해전. 이순신의 첫 승리가 여기서 시작됐다.', factEn: 'Battle of Okpo, Yi Sun-sin\'s first victory.' },
    { name: '한산도', en: 'Hansando', lon: 128.45, lat: 34.75, year: '1592', region: '통영', regionEn: 'Tongyeong', fact: '학익진으로 왜 수군을 섬멸한 한산도 대첩의 바다.', factEn: 'Sea of the Hansando victory, won with the crane-wing formation.' },
    { name: '여수', en: 'Yeosu', lon: 127.7, lat: 34.75, year: '1591', region: '전라좌수영', regionEn: 'Jeolla Left Navy', fact: '전라좌수영 본영. 거북선이 이곳에서 건조됐다.', factEn: 'Headquarters of the Jeolla Left Navy, where the turtle ship was built.' },
    { name: '명량', en: 'Myeongnyang', lon: 126.3, lat: 34.57, year: '1597', region: '울돌목', regionEn: 'Uldolmok', fact: '13척으로 130여 척을 막은 울돌목의 소용돌이.', factEn: 'The whirling strait where 13 ships held off 130.' },
    { name: '목포', en: 'Mokpo', lon: 126.4, lat: 34.8, year: '1597', region: '전라도', regionEn: 'Jeolla', fact: '명량 뒤 이순신이 고하도에 진을 친 서남해의 항구.', factEn: 'Southwestern port where Yi camped at Gohado after Myeongnyang.' },
    { name: '제주', en: 'Jeju', lon: 126.5, lat: 33.5, year: '1653', region: '탐라', regionEn: 'Tamna', fact: '하멜 일행이 표류해 조선을 서양에 처음 알린 섬.', factEn: 'Where Hamel\'s crew was shipwrecked and first told the West about Korea.' },
    { name: '나가사키', en: 'Nagasaki', lon: 129.9, lat: 32.7, year: '1571', region: '규슈', regionEn: 'Kyushu', fact: '남만 무역의 항구. 데지마의 네덜란드 상관.', factEn: 'Port of the Nanban trade and the Dutch post at Dejima.' },
    { name: '히라도', en: 'Hirado', lon: 129.55, lat: 33.4, year: '1609', region: '규슈', regionEn: 'Kyushu', fact: '네덜란드·영국 상관이 처음 들어선 일본의 창.', factEn: 'Japan\'s first window to the Dutch and English trading posts.' },
    { name: '하카타', en: 'Hakata', lon: 130.4, lat: 33.6, year: '1274', region: '규슈', regionEn: 'Kyushu', fact: '여몽 연합군이 상륙한 항구. "가미카제"의 전설이 태어났다.', factEn: 'Where the Mongol-Goryeo fleet landed; birthplace of the "kamikaze" legend.' },
    { name: '시모노세키', en: 'Shimonoseki', lon: 130.95, lat: 33.95, year: '1185', region: '간몬 해협', regionEn: 'Kanmon Strait', fact: '단노우라 해전. 헤이케가 바다에 가라앉은 좁은 해협.', factEn: 'Battle of Dan-no-ura, where the Heike sank in the narrow strait.' },
    { name: '이키', en: 'Iki', lon: 129.7, lat: 33.8, year: '1281', region: '쓰시마 해협', regionEn: 'Tsushima Strait', fact: '몽골 원정군의 길목이 된 작은 섬.', factEn: 'Small island on the path of the Mongol invasions.' },
    { name: '쓰시마', en: 'Tsushima', lon: 129.3, lat: 34.4, year: '1419', region: '대마도', regionEn: 'Tsushima', fact: '조선과 일본 사이의 다리. 이종무의 정벌과 통신사가 오간 섬.', factEn: 'Bridge between Korea and Japan: Yi Jong-mu\'s expedition and the Joseon envoys passed here.' },
    { name: '울산', en: 'Ulsan', lon: 129.4, lat: 35.5, year: '1598', region: '경상도', regionEn: 'Gyeongsang', fact: '정유재란 울산성 전투의 항구. 오늘날 조선(造船)의 도시.', factEn: 'Port of the siege of Ulsan; today a city of shipbuilding.' },
  ] },
  // 부캉이의 바다 — 부산 한 도시 안을 돈다. 기항지 열넷이 전부 부산의 바다다.
  bukhang: { bounds: [128.78, 129.24, 34.98, 35.22], coasts: 'busan', ports: [
    { name: '북항', en: 'Bukhang', lon: 129.045, lat: 35.112, year: '1876', region: '부산항', regionEn: 'Port of Busan', fact: '1876년 조일수호조규로 조선에서 가장 먼저 열린 개항장.', factEn: 'The first port Joseon opened to foreign trade, in 1876.' },
    { name: '초량왜관', en: 'Choryang Waegwan', lon: 129.038, lat: 35.118, year: '1678', region: '동구', regionEn: 'Dong-gu', fact: '조선 후기 일본과의 교역 거류지. 1678년 초량으로 옮겨 왔다.', factEn: 'The late-Joseon Japanese trading quarter, moved to Choryang in 1678.' },
    { name: '영도대교', en: 'Yeongdo Bridge', lon: 129.035, lat: 35.096, year: '1934', region: '영도', regionEn: 'Yeongdo', fact: '1934년에 놓인 들어 올리는 다리. 섬의 옛 이름은 절영도다.', factEn: 'A bascule bridge opened in 1934. The island was once called Jeollyeongdo.' },
    { name: '자갈치', en: 'Jagalchi', lon: 129.031, lat: 35.097, year: '1924', region: '중구', regionEn: 'Jung-gu', fact: '자갈이 깔린 바닷가라는 이름에서 왔다. 부산을 대표하는 어시장.', factEn: 'Named for its pebbled shore; the fish market that stands for Busan.' },
    { name: '송도', en: 'Songdo', lon: 129.016, lat: 35.075, year: '1913', region: '서구', regionEn: 'Seo-gu', fact: '1913년에 문을 연 한국 최초의 공설 해수욕장.', factEn: 'Korea\'s first public bathing beach, opened in 1913.' },
    { name: '다대포', en: 'Dadaepo', lon: 128.966, lat: 35.046, year: '1592', region: '사하구', regionEn: 'Saha-gu', fact: '임진왜란 개전 직후 윤흥신이 지키다 전사한 수군 진이 있던 곳.', factEn: 'Site of the naval garrison where Yun Heung-sin fell at the outbreak of the Imjin War.' },
    { name: '몰운대', en: 'Morundae', lon: 128.963, lat: 35.038, year: '1592', region: '다대포', regionEn: 'Dadaepo', fact: '부산포 해전에서 전사한 정운 장군을 기리는 비가 서 있다.', factEn: 'A stele here honours General Jeong Un, killed at the Battle of Busanpo.' },
    { name: '가덕도', en: 'Gadeokdo', lon: 128.82, lat: 35.02, year: '1544', region: '강서구', regionEn: 'Gangseo-gu', fact: '왜구를 막으려 가덕진과 천성진을 둔 섬. 부산 서쪽 바다의 문이다.', factEn: 'Island fortified against pirate raids; the western gate of Busan\'s waters.' },
    { name: '태종대', en: 'Taejongdae', lon: 129.087, lat: 35.052, year: '전설', region: '영도', regionEn: 'Yeongdo', fact: '신라 태종무열왕이 활을 쏜 곳이라는 전설에서 이름을 얻었다.', factEn: 'Named from a legend that King Taejong Muyeol of Silla shot arrows here.' },
    { name: '오륙도', en: 'Oryukdo', lon: 129.125, lat: 35.095, year: '1972', region: '남구', regionEn: 'Nam-gu', fact: '보는 방향과 물때에 따라 다섯으로도 여섯으로도 보인다. 부산의 관문.', factEn: 'Five islets or six, depending on the tide and where you stand. The gateway to Busan.' },
    { name: '이기대', en: 'Igidae', lon: 129.125, lat: 35.125, year: '1592', region: '남구', regionEn: 'Nam-gu', fact: '두 기생이 왜장을 안고 바다로 떨어졌다는 전설이 전하는 해안 절벽.', factEn: 'A coastal cliff carrying a legend of two gisaeng who leapt into the sea with a Japanese general.' },
    { name: '광안리', en: 'Gwangalli', lon: 129.118, lat: 35.153, year: '2003', region: '수영구', regionEn: 'Suyeong-gu', fact: '2003년 광안대교가 개통하며 바다 위에 다리 하나가 더 생겼다.', factEn: 'The Gwangan Bridge opened across this bay in 2003.' },
    { name: '동백섬', en: 'Dongbaekseom', lon: 129.148, lat: 35.153, year: '신라', region: '해운대', regionEn: 'Haeundae', fact: '본래 섬이었다가 모래가 쌓여 뭍과 이어졌다. 동백나무가 많아 붙은 이름.', factEn: 'Once an island, joined to the shore by silt. Named for its camellias.' },
    { name: '해운대', en: 'Haeundae', lon: 129.16, lat: 35.158, year: '9세기', region: '해운대구', regionEn: 'Haeundae-gu', fact: '최치원이 자신의 호 "해운"을 바위에 새겼다는 데서 이름이 왔다고 전한다.', factEn: 'Said to be named after Choe Chi-won, who carved his pen name "Haeun" on a rock here.' },
  ] },
  // ---------- 강 ----------
  // 서울 한강 — 기항지 열넷이 전부 한강의 나루와 다리다.
  hangang: { bounds: [126.76, 127.17, 37.46, 37.60], coasts: 'hangang', ports: [
    { name: '광나루', en: 'Gwangnaru', lon: 127.117, lat: 37.545, year: '1395', region: '광진구', regionEn: 'Gwangjin-gu', fact: '한강 상류의 큰 나루. 강원도 뗏목과 소금배가 닿던 자리다.', factEn: 'The great upriver ferry, where rafts from Gangwon and salt boats tied up.' },
    { name: '뚝섬', en: 'Ttukseom', lon: 127.070, lat: 37.529, year: '1392', region: '성동구', regionEn: 'Seongdong-gu', fact: '조선 임금이 둑을 세우고 군사를 사열한 들판. 섬이 아니라 강가의 벌이었다.', factEn: 'The riverside field where Joseon kings raised a banner and reviewed their troops.' },
    { name: '잠실', en: 'Jamsil', lon: 127.098, lat: 37.513, year: '1472', region: '송파구', regionEn: 'Songpa-gu', fact: '누에를 치던 곳이라 잠실이다. 본래 강 가운데 섬이었다가 1970년에 뭍이 되었다.', factEn: 'Named for its silkworm farms; an island until the river was closed off in 1970.' },
    { name: '압구정', en: 'Apgujeong', lon: 127.028, lat: 37.524, year: '1476', region: '강남구', regionEn: 'Gangnam-gu', fact: '한명회의 정자 압구정에서 온 이름. 갈매기와 벗한다는 뜻이다.', factEn: 'Named for Han Myeong-hoe\'s pavilion, "the place that befriends the gulls".' },
    { name: '한강대교', en: 'Hangang Bridge', lon: 126.959, lat: 37.517, year: '1917', region: '용산·동작', regionEn: 'Yongsan-Dongjak', fact: '한강에 처음 놓인 사람과 수레의 다리. 1950년에 끊겼다가 다시 이어졌다.', factEn: 'The first road bridge over the Han, blown up in 1950 and rebuilt.' },
    { name: '노량진', en: 'Noryangjin', lon: 126.943, lat: 37.513, year: '1398', region: '동작구', regionEn: 'Dongjak-gu', fact: '임금이 능으로 갈 때 배를 이어 건넜던 나루. 사육신의 묘가 언덕에 있다.', factEn: 'Ferry where kings crossed on a bridge of boats; the Six Martyrs lie on the hill above.' },
    { name: '여의도', en: 'Yeouido', lon: 126.930, lat: 37.527, year: '1916', region: '영등포구', regionEn: 'Yeongdeungpo-gu', fact: '모래벌판에 한국 최초의 비행장이 섰고, 지금은 국회와 증권가가 있다.', factEn: 'Korea\'s first airfield stood on this sandflat; now the National Assembly and the banks.' },
    { name: '밤섬', en: 'Bamseom', lon: 126.937, lat: 37.520, year: '1968', region: '영등포구', regionEn: 'Yeongdeungpo-gu', fact: '개발로 폭파했는데 모래가 다시 쌓여 되살아났다. 지금은 철새 보호구역이다.', factEn: 'Dynamited for development, rebuilt by its own silt, now a migratory bird sanctuary.' },
    { name: '마포', en: 'Mapo', lon: 126.945, lat: 37.539, year: '1413', region: '마포구', regionEn: 'Mapo-gu', fact: '삼남의 세곡과 새우젓이 올라온 포구. "마포 새우젓 장수"라는 말이 남았다.', factEn: 'Port where grain tax and salted shrimp came upriver; the shrimp-sellers became a byword.' },
    { name: '양화진', en: 'Yanghwajin', lon: 126.901, lat: 37.546, year: '1866', region: '마포구', regionEn: 'Mapo-gu', fact: '병인양요 때 프랑스 함대가 거슬러 오른 곳. 외국인 선교사 묘원이 있다.', factEn: 'Where the French squadron came upriver in 1866; a foreign missionary cemetery stands here.' },
    { name: '선유도', en: 'Seonyudo', lon: 126.898, lat: 37.543, year: '1978', region: '영등포구', regionEn: 'Yeongdeungpo-gu', fact: '신선이 놀던 봉우리였다가 채석장과 정수장을 거쳐 공원이 되었다.', factEn: 'A peak where immortals played, then a quarry, then a waterworks, now a park.' },
    { name: '난지도', en: 'Nanjido', lon: 126.878, lat: 37.568, year: '1978', region: '마포구', regionEn: 'Mapo-gu', fact: '난초와 지초가 자라던 섬. 15년간 서울의 쓰레기를 받았고 지금은 하늘공원이다.', factEn: 'Island of orchids that took Seoul\'s refuse for fifteen years; now Haneul Park.' },
    { name: '행주', en: 'Haengju', lon: 126.820, lat: 37.593, year: '1593', region: '고양', regionEn: 'Goyang', fact: '권율이 왜군을 막아낸 행주산성이 강을 내려다본다.', factEn: 'Haengju fortress, where Gwon Yul held off the Japanese, looks down on the river.' },
    { name: '김포 하구', en: 'Gimpo Estuary', lon: 126.780, lat: 37.580, year: '1627', region: '김포', regionEn: 'Gimpo', fact: '한강이 임진강과 만나 서해로 나가는 목. 조운선이 모두 이 길로 올라왔다.', factEn: 'Where the Han meets the Imjin and runs to the Yellow Sea; every tax barge came this way.' },
  ] },
  // 아마존강 — 안데스에서 대서양까지
  amazon: { bounds: [-74, -46, -9, 3], coasts: 'amazon', ports: [
    { name: '이키토스', en: 'Iquitos', lon: -73.25, lat: -3.75, year: '1864', region: '페루', regionEn: 'Peru', fact: '길이 없고 배로만 닿는 세계 최대의 도시. 고무 호황이 만들었다.', factEn: 'The largest city on Earth unreachable by road; the rubber boom built it.' },
    { name: '레티시아', en: 'Leticia', lon: -69.94, lat: -4.21, year: '1867', region: '콜롬비아', regionEn: 'Colombia', fact: '페루·콜롬비아·브라질 세 나라가 강 하나에서 만나는 지점.', factEn: 'Where Peru, Colombia and Brazil meet on one river.' },
    { name: '테페', en: 'Tefé', lon: -64.71, lat: -3.37, year: '1759', region: '아마조나스', regionEn: 'Amazonas', fact: '맑은 물의 테페강이 흐려진 본류로 흘러드는 합수머리.', factEn: 'Where the clear Tefé joins the muddy main stem.' },
    { name: '마나우스', en: 'Manaus', lon: -60.02, lat: -3.12, year: '1669', region: '아마조나스', regionEn: 'Amazonas', fact: '고무로 벌어 정글 속에 오페라 극장을 세운 도시.', factEn: 'Rubber money built an opera house in the middle of the jungle.' },
    { name: '물의 만남', en: 'Meeting of Waters', lon: -59.93, lat: -3.14, year: '1768', region: '아마조나스', regionEn: 'Amazonas', fact: '검은 네그루강과 누런 솔리몽이스강이 수 km를 섞이지 않고 나란히 흐른다.', factEn: 'The black Negro and the tawny Solimões run side by side for kilometres without mixing.' },
    { name: '파린칭스', en: 'Parintins', lon: -56.74, lat: -2.63, year: '1796', region: '아마조나스', regionEn: 'Amazonas', fact: '강 가운데 섬에서 해마다 소 축제가 열린다.', factEn: 'An island town that holds a great ox festival every year.' },
    { name: '산타렝', en: 'Santarém', lon: -54.70, lat: -2.44, year: '1661', region: '파라', regionEn: 'Pará', fact: '타파조스강이 합치는 곳. 포드가 고무 농장 도시를 세우려 한 강이다.', factEn: 'Where the Tapajós joins; Ford tried to build a rubber town up this river.' },
    { name: '알터두샹', en: 'Alter do Chão', lon: -54.95, lat: -2.51, year: '1626', region: '파라', regionEn: 'Pará', fact: '건기에 흰 모래밭이 드러나 "아마존의 카리브"라 불린다.', factEn: 'White sandbars surface in the dry season: the "Caribbean of the Amazon".' },
    { name: '모나르치', en: 'Monte Alegre', lon: -54.07, lat: -2.00, year: '1 만년 전', region: '파라', regionEn: 'Pará', fact: '만 년 전 사람이 바위에 그림을 남긴 언덕. 아마존 최초의 인적이다.', factEn: 'Hills where people painted the rock ten thousand years ago: the Amazon\'s first trace of humans.' },
    { name: '알메이링', en: 'Almeirim', lon: -52.58, lat: -1.52, year: '1639', region: '파라', regionEn: 'Pará', fact: '포르투갈이 네덜란드·영국을 막으려 요새를 세운 하류의 관문.', factEn: 'Portugal fortified this lower gate against the Dutch and English.' },
    { name: '마라조섬', en: 'Marajó', lon: -49.70, lat: -0.90, year: '400', region: '파라', regionEn: 'Pará', fact: '스위스만큼 넓은 강 가운데 섬. 토기 문명이 천 년을 이어졌다.', factEn: 'A river island the size of Switzerland, home to a pottery culture for a thousand years.' },
    { name: '벨렝', en: 'Belém', lon: -48.50, lat: -1.46, year: '1616', region: '파라', regionEn: 'Pará', fact: '아마존의 바다 문. 고무와 브라질너트가 세계로 나간 항구.', factEn: 'The Amazon\'s sea gate, where rubber and Brazil nuts left for the world.' },
    { name: '포칭야', en: 'Ponta de Pedras', lon: -48.87, lat: -1.39, year: '1690', region: '파라', regionEn: 'Pará', fact: '보름마다 조수가 강을 거슬러 벽처럼 밀려드는 포로로카가 인다.', factEn: 'Twice a month the pororoca tidal bore rolls upriver like a wall.' },
    { name: '마카파', en: 'Macapá', lon: -51.07, lat: 0.03, year: '1758', region: '아마파', regionEn: 'Amapá', fact: '적도가 도시를 반으로 가른다. 아마존 북쪽 하구의 요새 도시.', factEn: 'The equator cuts the city in half; a fortress town on the northern mouth.' },
  ] },
  // 나일강 — 아스완에서 지중해까지
  nile: { bounds: [28.5, 35.5, 21.5, 32.0], coasts: 'nile', ports: [
    { name: '아부심벨', en: 'Abu Simbel', lon: 31.63, lat: 22.34, year: '-1264', region: '누비아', regionEn: 'Nubia', fact: '람세스 2세의 암굴 신전. 댐에 잠기지 않게 돌을 잘라 옮겼다.', factEn: 'Ramesses II\'s rock temple, cut apart and moved stone by stone above the dam.' },
    { name: '아스완', en: 'Aswan', lon: 32.90, lat: 24.09, year: '-2600', region: '상이집트', regionEn: 'Upper Egypt', fact: '오벨리스크를 캐낸 화강암 채석장. 첫 급류가 배를 막던 곳이다.', factEn: 'Granite quarries of the obelisks, where the First Cataract stopped the boats.' },
    { name: '필레', en: 'Philae', lon: 32.88, lat: 24.01, year: '-380', region: '아스완', regionEn: 'Aswan', fact: '이시스 신전의 섬. 이집트에서 상형문자가 마지막까지 쓰인 자리다.', factEn: 'Island of the Isis temple, where hieroglyphs were written last.' },
    { name: '콤옴보', en: 'Kom Ombo', lon: 32.93, lat: 24.45, year: '-180', region: '상이집트', regionEn: 'Upper Egypt', fact: '악어신 소베크의 신전. 미라가 된 악어 수백 마리가 함께 묻혔다.', factEn: 'Temple of the crocodile god Sobek, with hundreds of mummified crocodiles.' },
    { name: '에드푸', en: 'Edfu', lon: 32.87, lat: 24.98, year: '-237', region: '상이집트', regionEn: 'Upper Egypt', fact: '이집트에서 가장 온전히 남은 호루스 신전.', factEn: 'The best-preserved temple in Egypt, dedicated to Horus.' },
    { name: '룩소르', en: 'Luxor', lon: 32.64, lat: 25.70, year: '-2055', region: '테베', regionEn: 'Thebes', fact: '고대 테베. 카르나크 신전의 기둥 숲이 강 동안에 서 있다.', factEn: 'Ancient Thebes; the pillared forest of Karnak stands on the east bank.' },
    { name: '왕들의 골짜기', en: 'Valley of the Kings', lon: 32.60, lat: 25.74, year: '-1539', region: '룩소르 서안', regionEn: 'West Bank', fact: '해가 지는 서쪽 언덕에 파라오들의 무덤이 있다. 투탕카멘도 여기 있었다.', factEn: 'Pharaohs lie in the western hills where the sun sets; Tutankhamun among them.' },
    { name: '덴데라', en: 'Dendera', lon: 32.67, lat: 26.14, year: '-54', region: '케나', regionEn: 'Qena', fact: '하토르 신전 천장에 별자리 지도가 그려져 있다.', factEn: 'A star map is painted on the ceiling of the Hathor temple.' },
    { name: '아비도스', en: 'Abydos', lon: 31.92, lat: 26.18, year: '-3100', region: '소하그', regionEn: 'Sohag', fact: '오시리스의 성소. 왕 이름을 줄줄이 새긴 명단이 남아 있다.', factEn: 'Sanctuary of Osiris, with a king list carved in a single long row.' },
    { name: '아마르나', en: 'Amarna', lon: 30.90, lat: 27.65, year: '-1346', region: '미니아', regionEn: 'Minya', fact: '아크나톤이 태양신 하나만 섬기려 세우고 버린 도시.', factEn: 'The city Akhenaten built for one sun god, then abandoned.' },
    { name: '파이윰', en: 'Faiyum', lon: 30.84, lat: 29.31, year: '-1800', region: '파이윰', regionEn: 'Faiyum', fact: '나일의 물을 끌어 만든 오아시스. 운하와 물레방아의 땅이다.', factEn: 'An oasis fed by a canal from the Nile, a land of waterwheels.' },
    { name: '기자', en: 'Giza', lon: 31.13, lat: 29.98, year: '-2560', region: '카이로', regionEn: 'Cairo', fact: '쿠푸의 대피라미드. 석재를 나일의 배로 실어 왔다.', factEn: 'Khufu\'s Great Pyramid; its stone came by boat on the Nile.' },
    { name: '카이로', en: 'Cairo', lon: 31.24, lat: 30.04, year: '969', region: '이집트', regionEn: 'Egypt', fact: '나일이 삼각주로 갈라지는 목에 선 도시. 나일로미터로 홍수를 재었다.', factEn: 'City at the head of the delta, where a nilometer measured the flood.' },
    { name: '로제타', en: 'Rosetta', lon: 30.42, lat: 31.40, year: '1799', region: '삼각주', regionEn: 'Delta', fact: '세 글자가 함께 새겨진 비석이 나와 상형문자를 읽게 되었다.', factEn: 'A stone in three scripts was found here, and hieroglyphs could be read again.' },
  ] },
  // 다뉴브강 — 검은 숲에서 흑해까지
  danube: { bounds: [7, 31, 41.5, 50.5], coasts: 'danube', ports: [
    { name: '도나우에싱겐', en: 'Donaueschingen', lon: 8.50, lat: 47.95, year: '1283', region: '검은 숲', regionEn: 'Black Forest', fact: '성의 뜰에 다뉴브의 샘이 있다. 2850km가 여기서 시작한다.', factEn: 'A spring in a castle courtyard begins 2,850 km of river.' },
    { name: '울름', en: 'Ulm', lon: 9.99, lat: 48.40, year: '1377', region: '슈바벤', regionEn: 'Swabia', fact: '세계에서 가장 높은 교회 첨탑. 이민자들이 "울름 상자배"로 강을 내려갔다.', factEn: 'The world\'s tallest church spire; emigrants floated down in flat "Ulm boxes".' },
    { name: '레겐스부르크', en: 'Regensburg', lon: 12.10, lat: 49.02, year: '1146', region: '바이에른', regionEn: 'Bavaria', fact: '1146년에 놓인 돌다리. 십자군이 이 다리로 강을 건넜다.', factEn: 'A stone bridge of 1146; crusaders crossed the river on it.' },
    { name: '린츠', en: 'Linz', lon: 14.29, lat: 48.31, year: '1490', region: '오버외스터라이히', regionEn: 'Upper Austria', fact: '케플러가 행성 운동의 셋째 법칙을 여기서 찾아냈다.', factEn: 'Kepler found his third law of planetary motion here.' },
    { name: '바하우', en: 'Wachau', lon: 15.42, lat: 48.37, year: '830', region: '오스트리아', regionEn: 'Austria', fact: '포도밭과 수도원이 늘어선 협곡. 사자왕 리처드가 갇힌 성이 있다.', factEn: 'A gorge of vineyards and abbeys, with the castle where Richard the Lionheart was held.' },
    { name: '빈', en: 'Vienna', lon: 16.37, lat: 48.21, year: '1137', region: '오스트리아', regionEn: 'Austria', fact: '합스부르크의 수도. 요한 슈트라우스가 "아름답고 푸른 도나우"를 썼다.', factEn: 'Habsburg capital, where Johann Strauss wrote "The Blue Danube".' },
    { name: '브라티슬라바', en: 'Bratislava', lon: 17.11, lat: 48.14, year: '907', region: '슬로바키아', regionEn: 'Slovakia', fact: '강 위 성에서 헝가리 왕들이 300년간 즉위했다.', factEn: 'Hungarian kings were crowned for 300 years in the castle above the river.' },
    { name: '부다페스트', en: 'Budapest', lon: 19.04, lat: 47.50, year: '1849', region: '헝가리', regionEn: 'Hungary', fact: '사슬교가 부다와 페스트를 하나로 묶었다. 다뉴브의 진주라 불린다.', factEn: 'The Chain Bridge bound Buda to Pest; the pearl of the Danube.' },
    { name: '모하치', en: 'Mohács', lon: 18.68, lat: 45.99, year: '1526', region: '헝가리', regionEn: 'Hungary', fact: '오스만이 헝가리 왕국을 무너뜨린 평원. 왕이 강에서 죽었다.', factEn: 'Plain where the Ottomans broke Hungary; the king drowned in the river.' },
    { name: '베오그라드', en: 'Belgrade', lon: 20.46, lat: 44.82, year: '1521', region: '세르비아', regionEn: 'Serbia', fact: '사바강과 만나는 절벽 위의 요새. 마흔 번 공격받고 서른여덟 번 무너졌다.', factEn: 'A fortress on the cliff where the Sava joins; besieged forty times, fallen thirty-eight.' },
    { name: '철문', en: 'Iron Gate', lon: 22.53, lat: 44.67, year: '101', region: '세르비아·루마니아', regionEn: 'Serbia-Romania', fact: '카르파티아를 가르는 좁은 협곡. 트라야누스가 강벽에 길을 새겼다.', factEn: 'A narrow gorge through the Carpathians, where Trajan carved a road in the rock.' },
    { name: '루세', en: 'Ruse', lon: 25.95, lat: 43.85, year: '70', region: '불가리아', regionEn: 'Bulgaria', fact: '로마가 다뉴브 함대를 두었던 하류의 큰 항구.', factEn: 'Rome kept its Danube fleet at this great downriver port.' },
    { name: '브러일라', en: 'Brăila', lon: 27.97, lat: 45.27, year: '1368', region: '루마니아', regionEn: 'Romania', fact: '바다 배가 거슬러 올라오는 마지막 항구. 밀을 유럽으로 실었다.', factEn: 'The last port seagoing ships reach, shipping wheat to Europe.' },
    { name: '술리나', en: 'Sulina', lon: 29.65, lat: 45.15, year: '1856', region: '다뉴브 삼각주', regionEn: 'Danube Delta', fact: '강이 흑해로 들어가는 끝. 삼각주는 지금도 해마다 넓어진다.', factEn: 'Where the river enters the Black Sea; the delta still grows each year.' },
  ] },
  // 양쯔강 — 삼협에서 동해로
  yangtze: { bounds: [103, 123, 27.5, 33.5], coasts: 'yangtze', ports: [
    { name: '충칭', en: 'Chongqing', lon: 106.55, lat: 29.56, year: '-316', region: '쓰촨', regionEn: 'Sichuan', fact: '산을 깎아 올린 안개의 도시. 삼협으로 들어가는 상류의 관문이다.', factEn: 'A city of fog cut into hillsides, the upriver gate to the Three Gorges.' },
    { name: '펑두', en: 'Fengdu', lon: 107.73, lat: 29.86, year: '-200', region: '충칭', regionEn: 'Chongqing', fact: '저승의 도시라 불린 산. 댐 때문에 아랫마을이 잠겼다.', factEn: 'The hill called the city of ghosts; the town below it is under water.' },
    { name: '바이디청', en: 'Baidicheng', lon: 109.57, lat: 31.05, year: '-25', region: '취탕협', regionEn: 'Qutang Gorge', fact: '삼국지의 백제성. 이백이 "천 리를 하루에 간다"고 노래한 물목이다.', factEn: 'The White Emperor City of the Three Kingdoms, where Li Bai sang of a thousand li in a day.' },
    { name: '우샤', en: 'Wu Gorge', lon: 110.20, lat: 31.05, year: '-300', region: '삼협', regionEn: 'Three Gorges', fact: '열두 봉우리가 구름에 잠겨 있다. 삼협 가운데 가장 깊다.', factEn: 'Twelve peaks in cloud: the deepest of the three gorges.' },
    { name: '싼더우핑', en: 'Sandouping', lon: 111.00, lat: 30.82, year: '1994', region: '후베이', regionEn: 'Hubei', fact: '세계에서 가장 큰 댐. 배는 다섯 단 갑문을 거쳐 오른다.', factEn: 'The largest dam on Earth; ships climb through five lock chambers.' },
    { name: '이창', en: 'Yichang', lon: 111.29, lat: 30.69, year: '-278', region: '후베이', regionEn: 'Hubei', fact: '협곡이 끝나고 평원이 시작되는 자리. 옛 배는 여기서 짐을 바꿔 실었다.', factEn: 'Where the gorges end and the plain begins; cargo changed boats here.' },
    { name: '징저우', en: 'Jingzhou', lon: 112.24, lat: 30.33, year: '-689', region: '후베이', regionEn: 'Hubei', fact: '관우가 지킨 성. 삼국지에서 가장 자주 다툰 강변 요지다.', factEn: 'The walled city Guan Yu held, the most contested river town in the Three Kingdoms.' },
    { name: '적벽', en: 'Chibi', lon: 113.60, lat: 29.72, year: '208', region: '후베이', regionEn: 'Hubei', fact: '조조의 함대가 불에 타 가라앉은 적벽대전의 강.', factEn: 'The river of Red Cliffs, where Cao Cao\'s fleet burned.' },
    { name: '우한', en: 'Wuhan', lon: 114.31, lat: 30.59, year: '223', region: '후베이', regionEn: 'Hubei', fact: '한수가 합치는 세 도시. 1957년에 양쯔 최초의 다리가 놓였다.', factEn: 'Three cities where the Han joins; the first bridge over the Yangtze opened here in 1957.' },
    { name: '주장', en: 'Jiujiang', lon: 115.99, lat: 29.71, year: '-200', region: '장시', regionEn: 'Jiangxi', fact: '포양호가 강으로 빠지는 목. 루산의 구름이 내려다본다.', factEn: 'Where Poyang Lake drains to the river, under the clouds of Lushan.' },
    { name: '안칭', en: 'Anqing', lon: 117.05, lat: 30.51, year: '1260', region: '안후이', regionEn: 'Anhui', fact: '강변에 선 진풍탑이 뱃사람의 길잡이가 되었다.', factEn: 'The riverside Zhenfeng pagoda guided the boatmen.' },
    { name: '난징', en: 'Nanjing', lon: 118.80, lat: 32.06, year: '229', region: '장쑤', regionEn: 'Jiangsu', fact: '여섯 왕조의 도읍. 정화의 함대가 이 강가 조선소에서 만들어졌다.', factEn: 'Capital of six dynasties; Zheng He\'s fleet was built in the yards on this bank.' },
    { name: '전장', en: 'Zhenjiang', lon: 119.45, lat: 32.19, year: '605', region: '장쑤', regionEn: 'Jiangsu', fact: '대운하가 양쯔와 만나는 십자로. 남북의 곡식이 여기서 갈렸다.', factEn: 'Crossroads where the Grand Canal meets the Yangtze; the grain of north and south parted here.' },
    { name: '상하이', en: 'Shanghai', lon: 121.47, lat: 31.23, year: '1842', region: '장쑤', regionEn: 'Jiangsu', fact: '양쯔가 바다로 나가는 하구. 강의 흙이 해마다 섬을 넓힌다.', factEn: 'The river\'s mouth to the sea; its silt widens the islands every year.' },
  ] },
  // 미시시피강 — 미네소타에서 멕시코 만까지
  mississippi: { bounds: [-95, -83, 28.5, 48], coasts: 'mississippi', ports: [
    { name: '이타스카호', en: 'Lake Itasca', lon: -95.21, lat: 47.24, year: '1832', region: '미네소타', regionEn: 'Minnesota', fact: '스쿨크래프트가 찾아낸 미시시피의 발원 호수. 걸어서 건널 만큼 좁다.', factEn: 'The source lake found by Schoolcraft, narrow enough to step across.' },
    { name: '미니애폴리스', en: 'Minneapolis', lon: -93.26, lat: 44.98, year: '1680', region: '미네소타', regionEn: 'Minnesota', fact: '세인트앤서니 폭포. 강에 하나뿐인 큰 폭포가 제분소를 돌렸다.', factEn: 'Saint Anthony Falls, the river\'s only great waterfall, turned the flour mills.' },
    { name: '라크로스', en: 'La Crosse', lon: -91.24, lat: 43.80, year: '1841', region: '위스콘신', regionEn: 'Wisconsin', fact: '깎인 절벽이 강을 끼고 섰다. 빙하가 비켜 간 땅이다.', factEn: 'Bluffs line the river here, in land the glaciers passed by.' },
    { name: '더뷰크', en: 'Dubuque', lon: -90.66, lat: 42.50, year: '1788', region: '아이오와', regionEn: 'Iowa', fact: '납 광산으로 생긴 아이오와 최초의 도시.', factEn: 'Iowa\'s first city, raised on lead mines.' },
    { name: '한니발', en: 'Hannibal', lon: -91.36, lat: 39.71, year: '1819', region: '미주리', regionEn: 'Missouri', fact: '마크 트웨인이 자란 마을. 톰 소여와 허클베리 핀의 강이다.', factEn: 'Mark Twain\'s boyhood town: the river of Tom Sawyer and Huckleberry Finn.' },
    { name: '세인트루이스', en: 'St. Louis', lon: -90.20, lat: 38.63, year: '1764', region: '미주리', regionEn: 'Missouri', fact: '미주리강이 합치는 곳. 루이스와 클라크가 서부로 떠난 문이다.', factEn: 'Where the Missouri joins; the gate Lewis and Clark went west through.' },
    { name: '케이로', en: 'Cairo', lon: -89.18, lat: 37.00, year: '1818', region: '일리노이', regionEn: 'Illinois', fact: '오하이오강이 합쳐 강폭이 두 배가 되는 삼각 꼭지.', factEn: 'The point where the Ohio joins and the river doubles.' },
    { name: '뉴마드리드', en: 'New Madrid', lon: -89.53, lat: 36.59, year: '1811', region: '미주리', regionEn: 'Missouri', fact: '대지진으로 강이 한동안 거꾸로 흘렀다고 전한다.', factEn: 'A great earthquake is said to have run the river backwards for a time.' },
    { name: '멤피스', en: 'Memphis', lon: -90.05, lat: 35.15, year: '1819', region: '테네시', regionEn: 'Tennessee', fact: '목화를 실어 내던 강변 도시. 빌 스트리트에서 블루스가 태어났다.', factEn: 'The cotton port on the bluff, where the blues came up on Beale Street.' },
    { name: '헬레나', en: 'Helena', lon: -90.59, lat: 34.53, year: '1833', region: '아칸소', regionEn: 'Arkansas', fact: '강이 크게 굽어 도는 자리. 홍수 때마다 물길이 바뀌었다.', factEn: 'A great bend where the channel shifted with every flood.' },
    { name: '빅스버그', en: 'Vicksburg', lon: -90.88, lat: 32.35, year: '1863', region: '미시시피', regionEn: 'Mississippi', fact: '남북전쟁에서 강을 통째로 가른 요새. 함락되자 강이 열렸다.', factEn: 'The fortress that split the river in the Civil War; its fall opened the Mississippi.' },
    { name: '나체즈', en: 'Natchez', lon: -91.40, lat: 31.56, year: '1716', region: '미시시피', regionEn: 'Mississippi', fact: '외륜선 시대의 부유한 강변 도시. 언덕 위와 아래가 전혀 달랐다.', factEn: 'A rich steamboat town, utterly different above the bluff and below it.' },
    { name: '배턴루지', en: 'Baton Rouge', lon: -91.19, lat: 30.45, year: '1699', region: '루이지애나', regionEn: 'Louisiana', fact: '바다 배가 올라올 수 있는 가장 먼 항구. 붉은 막대라는 뜻이다.', factEn: 'The farthest port seagoing ships can reach; the name means "red stick".' },
    { name: '뉴올리언스', en: 'New Orleans', lon: -90.07, lat: 29.95, year: '1718', region: '루이지애나', regionEn: 'Louisiana', fact: '초승달처럼 굽은 강에 안긴 하구의 항구. 재즈가 태어난 도시다.', factEn: 'The crescent port at the river\'s mouth, where jazz was born.' },
  ] },
};

// ---------- 확대 지도용 상세 해안선 (지중해, 한일해협) ----------
export const REGION_COASTS = {
  // ---------- 강 (중심선에서 양쪽 강안을 떠 땅 두 장으로 닫았다) ----------
  hangang: [
    [[126.759,37.589],[126.8,37.596],[126.846,37.589],[126.88,37.571],[126.901,37.549],[126.923,37.537],[126.947,37.526],[126.96,37.521],[126.985,37.519],[127.011,37.525],[127.039,37.532],[127.071,37.533],[127.095,37.521],[127.109,37.531],[127.133,37.552],[127.169,37.562],[123.324,51.019],[120.703,49.983],[118.536,48.594],[127.428,51.513],[129.816,51.257],[125.127,51.397],[123.792,51.146],[125.931,51.475],[129.372,51.307],[132.378,50.425],[133.288,50.001],[135.736,48.404],[135.176,48.844],[130.962,50.966],[126.8,51.592],[124.347,51.375]],
    [[126.761,37.581],[126.8,37.588],[126.844,37.581],[126.876,37.565],[126.895,37.543],[126.919,37.529],[126.943,37.518],[126.958,37.513],[126.985,37.511],[127.013,37.517],[127.041,37.524],[127.069,37.525],[127.095,37.513],[127.115,37.525],[127.137,37.544],[127.171,37.554],[131.016,24.097],[133.567,25.113],[135.688,26.462],[126.762,23.521],[124.324,23.801],[128.953,23.659],[130.232,23.896],[128.039,23.555],[124.546,23.727],[121.512,24.619],[120.554,25.065],[118.06,26.688],[118.58,26.292],[122.728,24.204],[126.8,23.592],[129.173,23.795]],
  ],
  amazon: [
    [[-73.941,-3.306],[-73.191,-3.456],[-71.459,-3.803],[-69.951,-3.91],[-67.546,-3.654],[-66.061,-3.306],[-64.736,-3.071],[-62.516,-3.0],[-60.056,-2.822],[-58.044,-2.453],[-56.774,-2.332],[-55.428,-2.151],[-54.76,-2.146],[-53.289,-1.714],[-52.075,-1.31],[-50.549,-1.004],[-49.046,-0.804],[-46.049,-0.304],[-48.302,13.21],[-51.152,12.734],[-52.802,12.51],[-55.513,11.952],[-57.359,11.368],[-57.506,11.276],[-56.698,11.49],[-58.345,11.278],[-60.069,11.096],[-61.718,10.777],[-63.245,10.68],[-65.906,10.579],[-68.849,10.107],[-69.642,9.885],[-70.465,9.78],[-69.573,9.767],[-70.504,9.978],[-71.254,10.128]],
    [[-74.059,-3.894],[-73.309,-4.044],[-71.541,-4.397],[-69.929,-4.51],[-67.454,-4.246],[-65.939,-3.894],[-64.684,-3.669],[-62.484,-3.6],[-59.984,-3.418],[-57.956,-3.047],[-56.706,-2.928],[-55.372,-2.749],[-54.64,-2.734],[-53.111,-2.286],[-51.925,-1.89],[-50.451,-1.596],[-48.954,-1.396],[-45.951,-0.896],[-43.698,-14.41],[-46.848,-14.934],[-48.198,-15.11],[-48.487,-15.152],[-49.041,-15.368],[-51.894,-16.156],[-54.102,-16.39],[-55.135,-16.538],[-55.931,-16.596],[-58.322,-17.017],[-61.755,-17.28],[-63.514,-17.319],[-63.151,-17.307],[-65.358,-17.785],[-69.415,-18.2],[-73.427,-17.967],[-75.996,-17.478],[-76.746,-17.328]],
  ],
  nile: [
    [[31.465,21.508],[31.552,22.373],[32.232,23.351],[32.807,24.054],[32.815,24.307],[32.845,24.596],[32.787,24.96],[32.639,25.424],[32.555,25.694],[32.614,26.076],[31.899,26.232],[31.333,27.048],[30.82,27.622],[30.866,28.409],[30.996,29.31],[31.046,29.995],[31.158,30.179],[30.881,30.651],[30.532,31.049],[30.337,31.382],[30.315,31.997],[16.408,31.534],[16.753,28.363],[19.438,22.649],[19.541,22.587],[17.658,26.805],[17.346,32.43],[17.17,30.885],[17.033,29.918],[17.67,23.07],[20.349,18.505],[23.508,15.132],[23.483,15.576],[18.677,24.688],[19.384,21.19],[19.279,21.622],[18.944,23.983],[18.95,25.482],[20.875,31.213],[21.092,31.689],[18.707,27.725],[17.613,22.827]],
    [[31.635,21.492],[31.708,22.307],[32.368,23.249],[32.953,23.966],[32.985,24.293],[33.015,24.604],[32.953,25.0],[32.801,25.476],[32.725,25.706],[32.726,26.204],[32.001,26.368],[31.467,27.152],[30.98,27.678],[31.034,28.391],[31.164,29.29],[31.214,29.965],[31.322,30.221],[31.019,30.749],[30.668,31.151],[30.503,31.418],[30.485,32.003],[44.392,32.466],[44.087,34.437],[41.762,39.551],[42.359,38.813],[44.822,33.595],[44.914,27.53],[44.99,27.715],[44.867,26.882],[44.13,32.23],[42.451,35.695],[40.392,37.468],[41.857,36.704],[46.603,26.712],[46.056,29.71],[46.461,28.338],[46.916,25.217],[46.85,23.118],[44.885,16.807],[43.508,14.911],[44.553,16.955],[45.487,20.173]],
  ],
  danube: [
    [[7.495,48.01],[8.478,48.058],[9.956,48.505],[10.969,48.856],[12.109,49.13],[13.434,48.655],[14.3,48.42],[15.425,48.48],[16.385,48.319],[17.134,48.247],[18.235,47.904],[19.135,47.555],[19.007,46.574],[18.785,46.021],[19.36,45.342],[20.487,44.927],[21.508,44.81],[22.565,44.774],[23.638,44.103],[25.007,43.86],[25.926,43.957],[26.937,44.29],[27.921,45.368],[29.008,45.31],[29.655,45.26],[31.004,45.21],[31.518,59.09],[30.349,59.133],[29.997,59.164],[21.709,57.792],[18.949,55.653],[22.877,57.509],[25.892,57.722],[28.487,57.119],[26.957,57.952],[22.512,58.663],[23.855,58.402],[26.99,56.949],[32.103,49.967],[32.518,43.353],[31.133,54.554],[22.607,61.088],[20.171,61.801],[18.258,62.082],[16.092,62.354],[15.533,62.255],[17.718,61.868],[13.263,62.972],[7.053,62.182],[5.723,61.734],[5.744,61.676],[6.801,61.883]],
    [[7.505,47.79],[8.522,47.842],[10.024,48.295],[11.031,48.644],[12.091,48.91],[13.366,48.445],[14.28,48.2],[15.415,48.26],[16.355,48.101],[17.086,48.033],[18.165,47.696],[18.945,47.445],[18.793,46.626],[18.575,45.959],[19.24,45.158],[20.433,44.713],[21.492,44.59],[22.495,44.566],[23.562,43.897],[24.993,43.64],[25.974,43.743],[27.063,44.11],[28.019,45.172],[28.992,45.09],[29.645,45.04],[30.996,44.99],[30.482,31.11],[28.951,31.167],[28.003,31.236],[34.231,32.748],[35.051,32.747],[29.023,30.191],[24.108,29.778],[18.713,30.881],[18.103,31.388],[20.488,30.737],[17.065,31.238],[11.61,33.551],[5.257,42.013],[5.282,49.847],[6.947,40.446],[13.793,34.512],[14.049,34.479],[14.482,34.338],[14.748,34.386],[13.047,34.365],[9.082,35.232],[10.937,35.068],[14.947,35.318],[14.257,35.066],[11.256,34.224],[8.199,33.917]],
  ],
  yangtze: [
    [[103.491,29.33],[104.985,29.429],[106.524,29.687],[107.673,29.977],[108.629,30.709],[109.533,31.175],[110.221,31.178],[111.041,30.943],[111.338,30.811],[112.289,30.451],[113.053,30.119],[113.547,29.839],[114.295,30.719],[115.26,30.015],[115.949,29.833],[116.969,30.612],[117.914,31.397],[118.732,32.171],[119.462,32.319],[120.556,32.017],[121.5,31.356],[122.994,31.43],[122.36,45.285],[124.737,44.843],[126.509,44.545],[120.762,46.128],[111.476,43.992],[108.718,41.78],[108.364,41.49],[111.606,43.006],[121.696,42.302],[112.745,44.502],[107.851,42.485],[118.729,42.774],[117.479,43.313],[116.435,43.71],[115.391,44.114],[112.423,44.872],[105.547,44.46],[101.097,42.356],[101.634,42.463],[103.737,43.274],[103.359,43.203],[102.569,43.169]],
    [[103.509,29.07],[105.015,29.171],[106.576,29.433],[107.787,29.743],[108.771,30.491],[109.607,30.925],[110.179,30.922],[110.959,30.697],[111.242,30.569],[112.191,30.209],[112.947,29.881],[113.653,29.601],[114.325,30.461],[115.14,29.785],[116.031,29.587],[117.131,30.408],[118.086,31.203],[118.868,31.949],[119.438,32.061],[120.444,31.783],[121.44,31.104],[123.006,31.17],[123.64,17.315],[118.203,17.617],[114.491,19.255],[118.138,18.252],[126.124,20.128],[127.282,20.82],[125.736,19.53],[120.374,16.414],[108.704,17.498],[115.875,16.678],[119.349,16.955],[107.271,17.226],[107.001,17.347],[106.145,17.67],[106.609,17.526],[107.977,17.228],[113.593,17.64],[116.303,18.844],[113.826,17.257],[109.363,15.846],[106.641,15.397],[104.431,15.231]],
  ],
  mississippi: [
    [[-95.098,47.324],[-94.394,46.391],[-93.166,45.083],[-92.129,44.321],[-91.136,43.894],[-90.522,42.52],[-90.762,41.478],[-90.864,40.365],[-91.224,39.741],[-90.605,39.202],[-90.084,38.708],[-89.781,37.974],[-89.045,37.038],[-89.403,36.53],[-89.926,35.086],[-90.471,34.457],[-90.861,33.582],[-90.743,32.323],[-91.262,31.537],[-91.059,30.5],[-90.743,30.128],[-89.998,30.07],[-89.196,29.194],[-78.924,38.499],[-82.867,41.955],[-85.093,42.784],[-78.123,35.476],[-77.583,29.306],[-77.142,29.656],[-77.122,31.754],[-78.654,27.214],[-77.601,28.744],[-76.861,30.632],[-75.707,40.805],[-78.032,45.327],[-78.551,46.396],[-81.16,49.347],[-77.719,42.858],[-77.441,36.915],[-77.08,39.262],[-76.811,44.547],[-80.864,53.199],[-85.138,56.289],[-83.82,55.319],[-83.9,55.446],[-84.039,55.678]],
    [[-95.322,47.156],[-94.606,46.209],[-93.354,44.877],[-92.271,44.079],[-91.344,43.706],[-90.798,42.48],[-91.038,41.522],[-91.136,40.435],[-91.496,39.679],[-90.795,38.998],[-90.316,38.552],[-90.019,37.826],[-89.315,36.962],[-89.657,36.65],[-90.174,35.214],[-90.709,34.603],[-91.139,33.618],[-91.017,32.377],[-91.538,31.583],[-91.321,30.4],[-90.857,29.872],[-90.142,29.83],[-89.404,29.006],[-99.676,19.701],[-97.273,17.945],[-96.507,17.216],[-104.257,25.424],[-105.217,33.814],[-104.618,35.044],[-104.878,35.446],[-102.526,41.846],[-102.499,41.556],[-102.199,42.548],[-102.653,33.195],[-101.768,30.473],[-101.849,30.864],[-100.24,28.853],[-105.001,36.562],[-104.559,43.885],[-104.72,43.738],[-104.509,40.453],[-101.616,34.401],[-99.262,32.111],[-102.7,34.641],[-105.1,37.154],[-106.381,38.802]],
  ],
  mediterranean: [
    // 유럽 남해안 (이베리아 → 프랑스 → 이탈리아 반도 → 발칸 → 아나톨리아)
    [[-10,47],[-10,44],[-9.5,36.5],[-6,36],[-2,36.7],[0,38.5],[0.5,40.5],[3,42],[3.5,43.3],[5,43.2],[7.5,43.7],[9,44.4],[10,44],[10.5,43],[11.2,42.4],[12.2,41.7],[14,40.8],[15.6,40],[16.2,38.9],[15.6,38],[16.5,38.4],[17.2,39.4],[18.5,40],[16,41.5],[15.9,41.9],[14,42.7],[13.5,43.6],[12.3,44.5],[12.3,45.4],[13.7,45.6],[14.5,45],[15.5,43.9],[17,43],[19,42],[19.5,40.8],[20.2,39.5],[21.5,38.4],[22.5,37],[23,37.8],[24,38],[23.5,39],[22.5,40.5],[24,40.8],[26,40.7],[26.2,41.5],[28,41.2],[29,41],[29.5,40.5],[27,40.3],[26.5,39.5],[26.8,38.4],[27.5,37],[28.5,36.7],[30,36.3],[32.5,36.1],[35,36.6],[36,36.3],[36,37.5],[38,38],[38,47]],
    // 아프리카 북해안 + 레반트
    [[-10,29],[-10,35.8],[-5.9,35.8],[-2,35.1],[0,35.8],[3,36.8],[8,36.9],[10.3,37.3],[11,36.8],[10.5,35.5],[11,34],[13,32.9],[15.5,32.4],[19,30.3],[20,32.2],[23,32.8],[25,31.6],[29,30.9],[31,31.5],[33,31.1],[34.3,31.3],[35,33],[35.9,34.6],[36,36.3],[38,36],[38,29]],
    // 시칠리아 / 사르데냐 / 코르시카 / 크레타 / 키프로스 / 마요르카 / 몰타
    [[12.4,38],[15.6,38.2],[15.1,36.7],[12.5,37.5]], [[8.2,41],[9.7,41],[9.6,39],[8.4,39]], [[8.6,43],[9.5,42.8],[9.2,41.4],[8.7,41.6]],
    [[23.5,35.3],[26.3,35.3],[26,35],[24,35]], [[32.3,35],[34.6,35.6],[34,34.6],[32.5,34.7]], [[2.4,39.6],[3.4,39.9],[3.1,39.3],[2.5,39.5]], [[14.3,36],[14.6,36],[14.5,35.8]],
  ],
  busan: [
    // 부산 해안선 — 낙동강 하구에서 해운대까지
    [[128.78,35.22],[128.80,35.08],[128.85,35.02],[128.92,35.00],[128.96,35.04],[128.99,35.06],[129.00,35.09],[129.03,35.10],[129.06,35.12],[129.08,35.15],[129.11,35.14],[129.13,35.13],[129.14,35.16],[129.19,35.17],[129.24,35.19],[129.24,35.22]],
    // 영도
    [[129.02,35.10],[129.09,35.09],[129.09,35.05],[129.04,35.05],[129.02,35.08]],
    // 가덕도
    [[128.80,35.05],[128.85,35.05],[128.85,34.99],[128.80,35.00]],
    // 오륙도
    [[129.12,35.10],[129.13,35.10],[129.13,35.09],[129.12,35.09]],
  ],
  strait: [
    // 한반도 남부
    [[124,38.5],[124,38],[126,37.3],[126.6,36.7],[126.3,35.9],[126.3,34.8],[126.5,34.3],[127.4,34.6],[128,34.8],[128.6,34.7],[129.2,35.1],[129.4,35.6],[129.5,37],[131,38.5]],
    // 제주
    [[126.2,33.5],[126.9,33.5],[126.9,33.3],[126.3,33.25]],
    // 규슈
    [[129.7,33.9],[130.4,33.9],[131,33.9],[131.9,33.3],[131.9,32],[131.3,31.3],[130.6,31],[130.2,31.6],[130.2,32.6],[129.8,32.7],[129.7,33.3]],
    // 혼슈 서단
    [[130.9,34],[131.5,34.4],[132.5,34.3],[133,34.5],[133,35.6],[132,35.5],[130.9,34.4]],
    // 쓰시마 / 이키
    [[129.2,34.1],[129.5,34.15],[129.45,34.7],[129.2,34.65]], [[129.65,33.75],[129.8,33.75],[129.8,33.85],[129.65,33.85]],
  ],
};
