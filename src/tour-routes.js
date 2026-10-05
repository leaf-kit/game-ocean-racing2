// 관광 명소·도시·우주 맵의 기항지와 지역 지도.
// 형식은 history.js 의 MAP_ROUTES 와 같다 (각 14곳, 체크포인트와 1:1).
//   mark: 환영 간판 뒤에 세울 명소 (landmarks.js)
//   km:   앞 기항지에서 이곳까지의 거리. 경위도로 잴 수 없는 우주 항로에서 쓴다.
//   river: 강 맵 지역 지도에 그릴 강 중심선 [경도, 위도]
//   wind: 물길이 굽이치는 정도. 직선 거리에 곱해 이정표 거리로 쓴다.

export const TOUR_ROUTES = {
  // ---------- 세계 명소 크루즈 ----------
  worldtour: { bounds: [-180, 180, -58, 78], ports: [
    { name: '베네치아', en: 'Venice', lon: 12.34, lat: 45.44, year: '697', region: '이탈리아', regionEn: 'Italy', mark: 'campanile',
      fact: '118개 섬을 400여 개 다리로 이은 물의 도시. 천 년 동안 지중해 무역을 쥔 해양 공화국이었다.', factEn: 'A city of 118 islets joined by some 400 bridges, and for a thousand years a maritime republic ruling Mediterranean trade.' },
    { name: '로마', en: 'Rome', lon: 11.8, lat: 42.09, year: '80', region: '치비타베키아 항', regionEn: 'Port of Civitavecchia', mark: 'colosseum',
      fact: '크루즈선은 치비타베키아에 닿는다. 서기 80년에 문을 연 콜로세움은 5만 명이 들어가던 원형 경기장이다.', factEn: 'Cruise ships dock at Civitavecchia. The Colosseum, opened in AD 80, held some 50,000 spectators.' },
    { name: '산토리니', en: 'Santorini', lon: 25.43, lat: 36.42, year: '-1600', region: '그리스 키클라데스', regionEn: 'Cyclades, Greece', mark: 'santorini',
      fact: '기원전 1600년 무렵 화산 폭발로 가운데가 무너져 내린 칼데라 섬. 절벽 위 하얀 집과 파란 돔으로 유명하다.', factEn: 'A caldera left when a volcano collapsed around 1600 BC, famous for white houses and blue domes on the cliffs.' },
    { name: '이스탄불', en: 'Istanbul', lon: 28.98, lat: 41.01, year: '537', region: '보스포루스 해협', regionEn: 'Bosphorus', mark: 'dome',
      fact: '유럽과 아시아가 바다 하나를 사이에 둔 도시. 537년에 지은 아야 소피아의 돔은 천 년 가까이 세계에서 가장 컸다.', factEn: 'Europe and Asia face each other across one strait. Hagia Sophia\'s dome of 537 was the world\'s largest for nearly a millennium.' },
    { name: '두바이', en: 'Dubai', lon: 55.27, lat: 25.2, year: '2010', region: '아랍에미리트', regionEn: 'UAE', mark: 'burj',
      fact: '진주 잡이 포구가 반세기 만에 마천루의 도시가 됐다. 부르즈 할리파는 828m로 세계에서 가장 높은 건물이다.', factEn: 'A pearl-diving creek turned skyscraper city in fifty years. The Burj Khalifa, at 828 m, is the tallest building on Earth.' },
    { name: '뭄바이', en: 'Mumbai', lon: 72.83, lat: 18.92, year: '1903', region: '인도 서해안', regionEn: 'West coast of India', mark: 'tajmahal',
      fact: '일곱 섬을 메워 이은 인도 최대 항구. 바다를 마주한 타지마할 팰리스 호텔과 인도문이 뱃사람을 맞는다.', factEn: 'India\'s greatest port, built by joining seven islands. The Taj Mahal Palace hotel and the Gateway of India greet arriving ships.' },
    { name: '싱가포르', en: 'Singapore', lon: 103.85, lat: 1.28, year: '1819', region: '말라카 해협 끝', regionEn: 'Tip of the Malacca Strait', mark: 'marina',
      fact: '세계에서 가장 바쁜 환적항 가운데 하나. 세 개의 탑 위에 배를 얹은 마리나 베이 샌즈가 항구를 내려다본다.', factEn: 'One of the busiest transshipment ports on Earth, overlooked by Marina Bay Sands with its ship laid across three towers.' },
    { name: '홍콩', en: 'Hong Kong', lon: 114.17, lat: 22.3, year: '1841', region: '빅토리아 항', regionEn: 'Victoria Harbour', mark: 'skyline',
      fact: '"향기로운 항구"라는 이름의 도시. 빅토리아 항을 사이에 두고 마천루 숲이 밤마다 빛을 쏜다.', factEn: 'The "Fragrant Harbour". Across Victoria Harbour its forest of towers lights up every night.' },
    { name: '부산', en: 'Busan', lon: 129.04, lat: 35.1, year: '1876', region: '대한민국', regionEn: 'Korea', mark: 'tower',
      fact: '한국 최대의 항구 도시. 용두산의 부산타워에 오르면 북항과 영도가 한눈에 들어온다.', factEn: 'Korea\'s largest port city. From Busan Tower on Yongdusan you can see the North Port and Yeongdo at a glance.' },
    { name: '도쿄', en: 'Tokyo', lon: 139.77, lat: 35.62, year: '645', region: '일본', regionEn: 'Japan', mark: 'pagoda',
      fact: '에도라 불리던 어촌이 세계 최대의 도시권이 됐다. 아사쿠사 센소지의 오층탑은 도쿄에서 가장 오래된 절에 선다.', factEn: 'The fishing village of Edo became the world\'s largest metropolis. Senso-ji\'s five-storey pagoda stands at Tokyo\'s oldest temple.' },
    { name: '시드니', en: 'Sydney', lon: 151.21, lat: -33.86, year: '1973', region: '오스트레일리아', regionEn: 'Australia', mark: 'opera',
      fact: '조개껍데기를 겹친 듯한 오페라하우스는 덴마크 건축가 웃손의 설계로 1973년에 문을 열었다.', factEn: 'The shell-roofed Opera House, designed by the Dane Jørn Utzon, opened in 1973.' },
    { name: '샌프란시스코', en: 'San Francisco', lon: -122.48, lat: 37.82, year: '1937', region: '미국 서해안', regionEn: 'US West Coast', mark: 'goldengate',
      fact: '안개 낀 해협 위의 금문교는 1937년 개통 당시 세계에서 가장 긴 현수교였다.', factEn: 'When the Golden Gate Bridge opened over the foggy strait in 1937 it was the longest suspension bridge in the world.' },
    { name: '리우데자네이루', en: 'Rio de Janeiro', lon: -43.21, lat: -22.95, year: '1931', region: '브라질', regionEn: 'Brazil', mark: 'christ',
      fact: '"1월의 강"이라는 이름의 항구. 코르코바두 산 위에서 구세주 그리스도상이 팔을 벌리고 만을 내려다본다.', factEn: 'The "River of January". Christ the Redeemer spreads his arms over the bay from the top of Corcovado.' },
    { name: '뉴욕', en: 'New York', lon: -74.04, lat: 40.69, year: '1886', region: '미국 동해안', regionEn: 'US East Coast', mark: 'liberty',
      fact: '1886년 프랑스가 선물한 자유의 여신상은 대서양을 건너온 이민선이 가장 먼저 보는 뭍이었다.', factEn: 'The Statue of Liberty, a gift from France in 1886, was the first sight of land for immigrant ships crossing the Atlantic.' },
  ] },

  // ---------- 베네치아 운하 ----------
  // 산타루치아 역에서 대운하를 따라 산마르코까지 내려간 뒤 석호의 섬들을 돌아 돌아온다
  venice: { bounds: [12.3, 12.43, 45.4, 45.49], coasts: 'venice', wind: 1.3, ports: [
    { name: '산타루치아 역', en: 'Santa Lucia Station', lon: 12.3215, lat: 45.441, year: '1861', region: '대운하 입구', regionEn: 'Head of the Grand Canal',
      fact: '본토와 이어진 다리를 건너온 기차가 멈추는 곳. 역 계단을 내려오면 바로 대운하다.', factEn: 'Trains end here after crossing the causeway; walk down the station steps and you are on the Grand Canal.' },
    { name: '카 페사로', en: 'Ca\' Pesaro', lon: 12.331, lat: 45.4415, year: '1710', region: '산타 크로체', regionEn: 'Santa Croce', mark: 'castle',
      fact: '바로크 궁전이 지금은 근대 미술관이다. 대운하의 궁전들은 모두 배로 드나들도록 물 쪽에 정문을 냈다.', factEn: 'A Baroque palace, now a modern-art museum. Every Grand Canal palace has its front door on the water.' },
    { name: '카 도로', en: 'Ca\' d\'Oro', lon: 12.3346, lat: 45.4405, year: '1430', region: '카나레조', regionEn: 'Cannaregio',
      fact: '"황금의 집". 지을 때 정면을 금박으로 덮었다. 베네치아 고딕 양식의 대표작이다.', factEn: 'The "Golden House", its façade once gilded: a masterpiece of Venetian Gothic.' },
    { name: '리알토 다리', en: 'Rialto Bridge', lon: 12.3359, lat: 45.438, year: '1591', region: '대운하 한가운데', regionEn: 'Midpoint of the Grand Canal', mark: 'castle',
      fact: '대운하에 처음 놓인 돌다리. 다리 위에 상점이 늘어서 있고, 그 옆 리알토 시장은 천 년 된 장터다.', factEn: 'The first stone bridge over the Grand Canal, lined with shops; the Rialto market beside it is a thousand years old.' },
    { name: '카 포스카리', en: 'Ca\' Foscari', lon: 12.3265, lat: 45.4343, year: '1453', region: '도르소두로', regionEn: 'Dorsoduro',
      fact: '대운하가 크게 꺾이는 굽이에 선 궁전. 해마다 9월 곤돌라 경주 레가타 스토리카의 결승점이 이 앞이다.', factEn: 'The palace at the Grand Canal\'s great bend; the finish of September\'s Regata Storica gondola race is right outside.' },
    { name: '아카데미아 다리', en: 'Accademia Bridge', lon: 12.3285, lat: 45.4318, year: '1933', region: '도르소두로', regionEn: 'Dorsoduro',
      fact: '나무로 놓은 아치 다리. 다리 위에서 보는 살루테 성당 쪽 풍경이 베네치아 엽서의 단골이다.', factEn: 'A wooden arch bridge; the view from it toward the Salute is a Venice postcard staple.' },
    { name: '살루테 성당', en: 'Santa Maria della Salute', lon: 12.3347, lat: 45.4307, year: '1687', region: '대운하 어귀', regionEn: 'Mouth of the Grand Canal', mark: 'dome',
      fact: '1630년 흑사병이 물러간 것을 감사하며 지은 성당. 지금도 11월이면 임시 다리를 놓고 순례를 간다.', factEn: 'Built in thanks for the end of the 1630 plague; every November a temporary bridge is laid for the pilgrimage.' },
    { name: '산마르코 광장', en: 'Piazza San Marco', lon: 12.3388, lat: 45.4337, year: '1094', region: '산마르코', regionEn: 'San Marco', mark: 'campanile',
      fact: '나폴레옹이 "유럽의 응접실"이라 부른 광장. 98.6m 종탑은 1902년 무너졌다가 똑같이 다시 세웠다.', factEn: 'Napoleon\'s "drawing room of Europe". The 98.6 m campanile collapsed in 1902 and was rebuilt exactly as before.' },
    { name: '탄식의 다리', en: 'Bridge of Sighs', lon: 12.3408, lat: 45.434, year: '1603', region: '두칼레 궁전 옆', regionEn: 'Beside the Doge\'s Palace',
      fact: '재판정에서 감옥으로 건너가는 죄수가 창밖 바다를 마지막으로 보며 한숨지었다고 붙은 이름이다.', factEn: 'Named for the sigh of prisoners taking a last look at the lagoon on their way from court to the cells.' },
    { name: '산조르조 마조레', en: 'San Giorgio Maggiore', lon: 12.3436, lat: 45.4291, year: '1610', region: '석호 남쪽', regionEn: 'South lagoon', mark: 'campanile',
      fact: '팔라디오가 설계한 흰 성당이 산마르코 맞은편 섬에 선다. 종탑에 오르면 베네치아 전체가 보인다.', factEn: 'Palladio\'s white church faces San Marco from its own island; its bell tower overlooks all of Venice.' },
    { name: '리도', en: 'Lido', lon: 12.3678, lat: 45.412, year: '1932', region: '석호의 방파 섬', regionEn: 'Barrier island', mark: 'lighthouse',
      fact: '석호와 아드리아해를 가르는 긴 모래섬. 1932년 세계 최초의 영화제가 여기서 열렸다.', factEn: 'The long sand island between lagoon and Adriatic, where the world\'s first film festival opened in 1932.' },
    { name: '부라노', en: 'Burano', lon: 12.417, lat: 45.485, year: '1500', region: '북쪽 석호', regionEn: 'North lagoon', mark: 'santorini',
      fact: '집집마다 다른 원색으로 칠한 어촌. 안개 속에서도 제집을 찾으려고 칠했다는 이야기가 전한다. 레이스 공예로도 이름났다.', factEn: 'A fishing village painted house by house in bright colours, they say so fishermen could find home in the fog. Famous for lace.' },
    { name: '무라노', en: 'Murano', lon: 12.353, lat: 45.458, year: '1291', region: '유리 공방 섬', regionEn: 'Glassmakers\' island', mark: 'dome',
      fact: '1291년 화재를 막으려고 유리 공방을 모두 이 섬으로 옮겼다. 유리공은 비법이 새지 않도록 섬을 떠날 수 없었다.', factEn: 'In 1291 all glass furnaces were moved here against fire, and glassmakers were forbidden to leave lest the secrets escape.' },
    { name: '카나레조', en: 'Cannaregio', lon: 12.329, lat: 45.444, year: '1516', region: '북쪽 운하', regionEn: 'Northern canals',
      fact: '1516년 세계 최초의 "게토"가 이곳에 생겼다. 지금은 주민이 가장 많이 사는 조용한 운하 동네다.', factEn: 'Site of the world\'s first "ghetto" in 1516, now the quiet canal quarter where most Venetians live.' },
  ] },

  // ---------- 파리 센강 ----------
  seine: { bounds: [2.235, 2.405, 48.828, 48.872], wind: 1.15,
    river: [[2.392, 48.832], [2.383, 48.835], [2.366, 48.843], [2.357, 48.850], [2.350, 48.853], [2.341, 48.857], [2.333, 48.860], [2.321, 48.864], [2.312, 48.865], [2.300, 48.862], [2.291, 48.857], [2.283, 48.852], [2.274, 48.847], [2.262, 48.842], [2.248, 48.846], [2.240, 48.858]],
    ports: [
    { name: '베르시', en: 'Bercy', lon: 2.383, lat: 48.835, year: '1840', region: '12구', regionEn: '12th arr.',
      fact: '센강이 파리로 들어오는 동쪽 관문. 옛 포도주 창고 거리가 지금은 공원과 상점가다.', factEn: 'The Seine\'s eastern gate into Paris; the old wine warehouses are now parks and shops.' },
    { name: '파리 식물원', en: 'Jardin des Plantes', lon: 2.36, lat: 48.844, year: '1635', region: '5구', regionEn: '5th arr.',
      fact: '루이 13세의 약초원에서 시작한 식물원. 자연사 박물관과 동물원이 함께 있다.', factEn: 'Begun as Louis XIII\'s herb garden; the natural history museum and a zoo share the grounds.' },
    { name: '생루이섬', en: 'Île Saint-Louis', lon: 2.356, lat: 48.8515, year: '1614', region: '센강의 섬', regionEn: 'Island in the Seine',
      fact: '17세기에 두 섬을 이어 만든 주거 섬. 지하철역이 하나도 없는 조용한 동네다.', factEn: 'Two islets joined in the 17th century into a residential island without a single métro station.' },
    { name: '노트르담 대성당', en: 'Notre-Dame', lon: 2.35, lat: 48.853, year: '1163', region: '시테섬', regionEn: 'Île de la Cité', mark: 'cathedral',
      fact: '1163년에 짓기 시작한 고딕 성당. 2019년 화재로 첨탑이 무너졌고, 2024년 12월 다시 문을 열었다.', factEn: 'Gothic cathedral begun in 1163; its spire fell in the 2019 fire and it reopened in December 2024.' },
    { name: '퐁뇌프', en: 'Pont Neuf', lon: 2.341, lat: 48.857, year: '1607', region: '시테섬 끝', regionEn: 'Tip of the Cité',
      fact: '이름은 "새 다리"지만 지금 남은 파리의 다리 가운데 가장 오래됐다.', factEn: 'Its name means "New Bridge", yet it is the oldest standing bridge in Paris.' },
    { name: '루브르 박물관', en: 'The Louvre', lon: 2.336, lat: 48.861, year: '1793', region: '1구', regionEn: '1st arr.', mark: 'louvre',
      fact: '왕궁이 1793년 박물관이 됐다. 1989년에 유리 피라미드 입구가 생겼고, 모나리자가 여기 있다.', factEn: 'A royal palace turned museum in 1793; the glass pyramid entrance came in 1989. The Mona Lisa lives here.' },
    { name: '오르세 미술관', en: 'Musée d\'Orsay', lon: 2.3266, lat: 48.86, year: '1986', region: '7구', regionEn: '7th arr.',
      fact: '1900년 만국박람회 때 지은 기차역을 미술관으로 바꿨다. 인상파 그림이 가장 많이 모인 곳이다.', factEn: 'A railway station built for the 1900 World\'s Fair, now home to the world\'s greatest Impressionist collection.' },
    { name: '콩코르드 광장', en: 'Place de la Concorde', lon: 2.321, lat: 48.8656, year: '1836', region: '8구', regionEn: '8th arr.', mark: 'obelisk',
      fact: '이집트 룩소르 신전에서 가져온 3300년 된 오벨리스크가 1836년부터 광장 한가운데 서 있다.', factEn: 'A 3,300-year-old obelisk from Luxor Temple has stood at its centre since 1836.' },
    { name: '알렉상드르 3세 다리', en: 'Pont Alexandre III', lon: 2.3136, lat: 48.8639, year: '1900', region: '8구·7구', regionEn: '8th / 7th arr.',
      fact: '금빛 날개 달린 말 조각이 네 귀퉁이에 선 다리. 프랑스와 러시아의 우호를 기념해 놓았다.', factEn: 'Gilded winged horses guard its four corners; it celebrates Franco-Russian friendship.' },
    { name: '앵발리드', en: 'Les Invalides', lon: 2.3125, lat: 48.8566, year: '1706', region: '7구', regionEn: '7th arr.', mark: 'dome',
      fact: '루이 14세가 세운 상이군인 요양소. 금빛 돔 아래 나폴레옹이 잠들어 있다.', factEn: 'Louis XIV\'s home for wounded soldiers; Napoleon lies beneath its golden dome.' },
    { name: '에펠탑', en: 'Eiffel Tower', lon: 2.2945, lat: 48.8584, year: '1889', region: '샹드마르스', regionEn: 'Champ de Mars', mark: 'eiffel',
      fact: '1889년 만국박람회 때 세운 330m 철탑. 20년 뒤 헐 예정이었지만 무선 안테나로 쓰이며 살아남았다.', factEn: 'The 330 m iron tower of the 1889 World\'s Fair, meant to come down after 20 years but saved as a radio mast.' },
    { name: '비르아켐 다리', en: 'Pont de Bir-Hakeim', lon: 2.2877, lat: 48.8557, year: '1905', region: '15구·16구', regionEn: '15th / 16th arr.',
      fact: '위층은 지하철, 아래층은 차와 사람이 다니는 2층 철교. 영화 「인셉션」에 나온다.', factEn: 'A two-deck steel bridge, métro above and road below, seen in the film Inception.' },
    { name: '백조의 섬', en: 'Île aux Cygnes', lon: 2.2795, lat: 48.85, year: '1889', region: '그르넬 다리', regionEn: 'Pont de Grenelle', mark: 'liberty',
      fact: '센강 위의 좁고 긴 인공 섬. 끝에는 뉴욕 자유의 여신상의 4분의 1 크기 복제품이 서쪽을 바라본다.', factEn: 'A narrow man-made island; at its tip a quarter-size Statue of Liberty gazes west toward New York.' },
    { name: '불로뉴 숲', en: 'Bois de Boulogne', lon: 2.248, lat: 48.846, year: '1852', region: '16구', regionEn: '16th arr.',
      fact: '나폴레옹 3세가 런던 하이드파크를 본떠 만든 숲. 롤랑가로스 테니스장이 이 숲 가장자리에 있다.', factEn: 'Napoleon III\'s answer to Hyde Park; the Roland-Garros tennis stadium sits on its edge.' },
  ] },

  // ---------- 뉴욕 맨해튼 일주 ----------
  // 허드슨강을 거슬러 올라가 할렘강으로 돌아 이스트강으로 내려온다
  newyork: { bounds: [-74.08, -73.89, 40.675, 40.865], coasts: 'newyork', wind: 1.05, ports: [
    { name: '배터리 공원', en: 'The Battery', lon: -74.017, lat: 40.703, year: '1625', region: '맨해튼 남단', regionEn: 'Tip of Manhattan', mark: 'castle',
      fact: '네덜란드인이 뉴암스테르담 요새를 세운 자리. 자유의 여신상으로 가는 배가 여기서 뜬다.', factEn: 'Where the Dutch built the fort of New Amsterdam; ferries to the Statue of Liberty leave from here.' },
    { name: '자유의 여신상', en: 'Statue of Liberty', lon: -74.0445, lat: 40.6892, year: '1886', region: '리버티섬', regionEn: 'Liberty Island', mark: 'liberty',
      fact: '높이 93m(받침 포함). 구리 껍질이 녹슬어 지금의 초록빛이 됐다. 오른손 횃불은 1916년부터 올라갈 수 없다.', factEn: '93 m with its pedestal; the copper skin weathered to green. The torch has been closed to visitors since 1916.' },
    { name: '엘리스섬', en: 'Ellis Island', lon: -74.0396, lat: 40.6995, year: '1892', region: '뉴욕항', regionEn: 'New York Harbor',
      fact: '1892~1954년 1200만 명이 넘는 이민자가 이 섬의 심사대를 거쳐 미국에 들어왔다.', factEn: 'From 1892 to 1954 more than 12 million immigrants passed through its inspection hall.' },
    { name: '원 월드트레이드센터', en: 'One World Trade Center', lon: -74.0134, lat: 40.7127, year: '2014', region: '로어 맨해튼', regionEn: 'Lower Manhattan', mark: 'skyline',
      fact: '높이 1776피트(541m). 미국 독립선언의 해를 높이에 새겼다.', factEn: '1,776 feet (541 m) tall, its height a nod to the year of American independence.' },
    { name: '첼시 피어', en: 'Chelsea Piers', lon: -74.0089, lat: 40.7466, year: '1910', region: '허드슨강', regionEn: 'Hudson River',
      fact: '대서양 정기선이 닿던 부두. 타이태닉호가 1912년 도착할 예정이던 곳이다.', factEn: 'The transatlantic liner piers where the Titanic was due to arrive in 1912.' },
    { name: '인트레피드 박물관', en: 'Intrepid Museum', lon: -74.0, lat: 40.7645, year: '1982', region: '86번 부두', regionEn: 'Pier 86',
      fact: '2차 대전 항공모함 인트레피드호를 통째로 띄워 둔 박물관. 갑판에 우주왕복선 엔터프라이즈호가 있다.', factEn: 'The WWII carrier Intrepid, afloat as a museum, with the Space Shuttle Enterprise on deck.' },
    { name: '리버사이드 공원', en: 'Riverside Park', lon: -73.983, lat: 40.795, year: '1875', region: '어퍼 웨스트사이드', regionEn: 'Upper West Side',
      fact: '센트럴파크를 설계한 옴스테드가 허드슨강을 따라 길게 낸 공원.', factEn: 'Laid out along the Hudson by Olmsted, who also designed Central Park.' },
    { name: '조지워싱턴 다리', en: 'George Washington Bridge', lon: -73.953, lat: 40.851, year: '1931', region: '허드슨강 상류', regionEn: 'Upper Hudson', mark: 'goldengate',
      fact: '뉴저지와 맨해튼을 잇는 현수교. 하루 통행량으로 세계에서 가장 바쁜 다리다.', factEn: 'The suspension bridge between New Jersey and Manhattan, the world\'s busiest by daily traffic.' },
    { name: '할렘강', en: 'Harlem River', lon: -73.932, lat: 40.83, year: '1895', region: '맨해튼·브롱크스', regionEn: 'Manhattan / Bronx',
      fact: '맨해튼을 섬으로 만드는 좁은 물길. 뱃길을 내려고 1895년에 굽이를 펴서 팠다.', factEn: 'The narrow channel that makes Manhattan an island, straightened for shipping in 1895.' },
    { name: '랜들스섬', en: 'Randalls Island', lon: -73.926, lat: 40.793, year: '1936', region: '헬게이트', regionEn: 'Hell Gate',
      fact: '세 물길이 만나는 "헬게이트" 옆 섬. 물살이 거세 수백 척이 이 앞에서 좌초했다.', factEn: 'Beside Hell Gate, where three waterways meet; hundreds of ships wrecked in its currents.' },
    { name: '루스벨트섬', en: 'Roosevelt Island', lon: -73.95, lat: 40.762, year: '1976', region: '이스트강', regionEn: 'East River',
      fact: '맨해튼과 공중 케이블카로 이어진 길쭉한 섬.', factEn: 'A long thin island tied to Manhattan by an aerial tramway.' },
    { name: '유엔 본부', en: 'United Nations HQ', lon: -73.968, lat: 40.749, year: '1952', region: '터틀 베이', regionEn: 'Turtle Bay', mark: 'skyline',
      fact: '뉴욕 한가운데 있지만 유엔이 관리하는 구역이다. 193개 회원국 국기가 강변을 따라 걸린다.', factEn: 'In the middle of New York, yet administered by the UN; the flags of 193 member states line the river.' },
    { name: '윌리엄스버그 다리', en: 'Williamsburg Bridge', lon: -73.9722, lat: 40.7137, year: '1903', region: '이스트강', regionEn: 'East River',
      fact: '1903년 개통 당시 세계에서 가장 긴 현수교. 강철 탑을 쓴 첫 대형 현수교였다.', factEn: 'The world\'s longest suspension bridge when it opened in 1903, and the first big one with steel towers.' },
    { name: '브루클린 다리', en: 'Brooklyn Bridge', lon: -73.9969, lat: 40.7061, year: '1883', region: '이스트강 하구', regionEn: 'Lower East River', mark: 'brooklyn',
      fact: '고딕 아치 돌탑 두 개에 강철 케이블을 건 다리. 1883년 개통 때 걸어서 건너려는 사람이 15만 명 몰렸다.', factEn: 'Steel cables hung from twin Gothic stone towers; 150,000 people walked across on opening day in 1883.' },
  ] },

  // ---------- 에게해 ----------
  aegean: { bounds: [22.5, 29.5, 34.8, 40.0], coasts: 'aegean', ports: [
    { name: '피레우스', en: 'Piraeus', lon: 23.64, lat: 37.94, year: '-447', region: '아테네의 항구', regionEn: 'Port of Athens', mark: 'parthenon',
      fact: '고대부터 아테네의 항구. 언덕 위 파르테논 신전은 기원전 447년에 짓기 시작했다.', factEn: 'Athens\' harbour since antiquity; the Parthenon on the hill was begun in 447 BC.' },
    { name: '수니온 곶', en: 'Cape Sounion', lon: 24.026, lat: 37.65, year: '-440', region: '아티카 남단', regionEn: 'Tip of Attica', mark: 'parthenon',
      fact: '바다의 신 포세이돈 신전이 곶 끝 절벽에 선다. 바이런이 기둥에 이름을 새겼다.', factEn: 'The Temple of Poseidon crowns the cliff; Byron carved his name on a column.' },
    { name: '시로스', en: 'Syros', lon: 24.94, lat: 37.44, year: '1820', region: '키클라데스', regionEn: 'Cyclades',
      fact: '키클라데스 제도의 행정 중심지. 19세기 그리스 최대의 항구였다.', factEn: 'Capital of the Cyclades and Greece\'s busiest port in the 19th century.' },
    { name: '미코노스', en: 'Mykonos', lon: 25.33, lat: 37.45, year: '1500', region: '키클라데스', regionEn: 'Cyclades', mark: 'windmill',
      fact: '언덕 위에 줄지어 선 하얀 풍차가 섬의 상징. 바람을 받아 밀을 빻던 것들이다.', factEn: 'Its row of white windmills, once grinding wheat in the steady wind, is the island\'s emblem.' },
    { name: '델로스', en: 'Delos', lon: 25.268, lat: 37.396, year: '-900', region: '아폴론의 섬', regionEn: 'Apollo\'s island', mark: 'parthenon',
      fact: '아폴론이 태어났다는 신성한 섬. 섬 전체가 유적이라 지금은 아무도 살지 않는다.', factEn: 'The sacred birthplace of Apollo; the whole island is ruins and no one lives there now.' },
    { name: '낙소스', en: 'Naxos', lon: 25.376, lat: 37.106, year: '-530', region: '키클라데스', regionEn: 'Cyclades', mark: 'torii',
      fact: '항구 앞 바위섬에 끝내 완성되지 못한 아폴론 신전의 거대한 대리석 문 "포르타라"만 서 있다.', factEn: 'On an islet by the harbour stands the Portara, the giant marble doorway of an Apollo temple never finished.' },
    { name: '파로스', en: 'Paros', lon: 25.15, lat: 37.085, year: '-500', region: '대리석의 섬', regionEn: 'Island of marble',
      fact: '밀로의 비너스를 깎은 흰 대리석이 이 섬에서 나왔다.', factEn: 'The white marble of the Venus de Milo was quarried on this island.' },
    { name: '산토리니', en: 'Santorini', lon: 25.43, lat: 36.42, year: '-1600', region: '칼데라', regionEn: 'The caldera', mark: 'santorini',
      fact: '화산이 무너져 생긴 칼데라 안으로 배가 들어간다. 이아 마을의 해넘이가 세계에서 가장 유명한 해넘이 가운데 하나다.', factEn: 'Ships sail right into the collapsed caldera; sunset at Oia is among the most famous on Earth.' },
    { name: '이라클리온', en: 'Heraklion', lon: 25.14, lat: 35.34, year: '-1900', region: '크레타', regionEn: 'Crete', mark: 'castle',
      fact: '미궁 전설의 크노소스 궁전 바로 옆 항구. 베네치아가 쌓은 쿨레스 요새가 방파제를 지킨다.', factEn: 'The port beside Knossos, palace of the Labyrinth legend; the Venetian Koules fortress guards the mole.' },
    { name: '로도스', en: 'Rhodes', lon: 28.227, lat: 36.45, year: '-280', region: '도데카니사', regionEn: 'Dodecanese', mark: 'lighthouse',
      fact: '세계 7대 불가사의 거상이 항구 어귀에 섰던 섬. 성 요한 기사단의 성벽 도시가 고스란히 남았다.', factEn: 'Where the Colossus, a Wonder of the World, stood at the harbour mouth; the Knights\' walled town survives intact.' },
    { name: '코스', en: 'Kos', lon: 27.29, lat: 36.89, year: '-460', region: '도데카니사', regionEn: 'Dodecanese',
      fact: '의학의 아버지 히포크라테스의 고향. 그가 가르쳤다는 플라타너스 나무가 광장에 있다.', factEn: 'Birthplace of Hippocrates; the plane tree he is said to have taught under still stands.' },
    { name: '보드룸', en: 'Bodrum', lon: 27.43, lat: 37.03, year: '1402', region: '튀르키예', regionEn: 'Türkiye', mark: 'castle',
      fact: '고대 할리카르나소스. 마우솔로스 영묘가 있던 곳이며, 성 베드로 성에는 수중고고학 박물관이 있다.', factEn: 'Ancient Halicarnassus, home of the Mausoleum; St Peter\'s Castle holds a museum of underwater archaeology.' },
    { name: '파트모스', en: 'Patmos', lon: 26.548, lat: 37.31, year: '1088', region: '도데카니사', regionEn: 'Dodecanese', mark: 'castle',
      fact: '요한계시록이 쓰였다는 동굴과 요새 같은 성 요한 수도원이 있는 섬.', factEn: 'The island of the Cave of the Apocalypse and the fortress-like Monastery of St John.' },
    { name: '쿠샤다스', en: 'Kuşadası', lon: 27.26, lat: 37.86, year: '-250', region: '에페소스 입구', regionEn: 'Gateway to Ephesus', mark: 'colosseum',
      fact: '고대 도시 에페소스로 가는 항구. 2만 5천 명이 들어가던 대극장이 남아 있다.', factEn: 'The port for ancient Ephesus, whose great theatre once seated 25,000.' },
  ] },

  // ---------- 하롱베이 ----------
  halong: { bounds: [106.95, 107.42, 20.68, 21.02], coasts: 'halong', wind: 1.2, ports: [
    { name: '뚜언쩌우 항', en: 'Tuan Chau Harbour', lon: 107.03, lat: 20.93, year: '1999', region: '꽝닌성', regionEn: 'Quảng Ninh',
      fact: '하롱베이 유람선 대부분이 출항하는 섬 항구.', factEn: 'The island harbour where most Ha Long cruises set out.' },
    { name: '바이짜이 다리', en: 'Bai Chay Bridge', lon: 107.07, lat: 20.955, year: '2006', region: '하롱시', regionEn: 'Ha Long City', mark: 'goldengate',
      fact: '하롱시의 두 동네를 잇는 사장교. 큰 배가 지나가도록 높이 놓았다.', factEn: 'A cable-stayed bridge joining the two halves of Ha Long City, built high for shipping.' },
    { name: '투계 바위', en: 'Fighting Cock Islet', lon: 107.08, lat: 20.88, year: '1994', region: '하롱베이', regionEn: 'Ha Long Bay', mark: 'karst',
      fact: '두 바위가 마주 선 모습이 싸우는 닭 같다. 하롱베이의 상징으로 지폐에도 실렸다.', factEn: 'Two rocks facing off like fighting cocks: the bay\'s emblem, printed on banknotes.' },
    { name: '띠똡섬', en: 'Ti Top Island', lon: 107.09, lat: 20.86, year: '1962', region: '하롱베이', regionEn: 'Ha Long Bay', mark: 'tower',
      fact: '1962년 호찌민과 함께 온 소련 우주비행사 티토프의 이름을 땄다. 꼭대기 전망대에서 섬 수백 개가 보인다.', factEn: 'Named for the Soviet cosmonaut Titov, who visited with Ho Chi Minh in 1962; hundreds of islands are visible from the summit.' },
    { name: '승솟 동굴', en: 'Sung Sot Cave', lon: 107.085, lat: 20.84, year: '1901', region: '보혼섬', regionEn: 'Bo Hon Island', mark: 'karst',
      fact: '"놀라움의 동굴". 1901년 프랑스인이 찾아낸 하롱베이 최대의 석회 동굴이다.', factEn: 'The "Cave of Surprises", the largest in the bay, found by the French in 1901.' },
    { name: '루온 동굴', en: 'Luon Cave', lon: 107.11, lat: 20.835, year: '1994', region: '보혼섬', regionEn: 'Bo Hon Island', mark: 'karst',
      fact: '바위 굴을 지나면 사방이 절벽으로 막힌 호수가 나온다. 대나무 배를 타고 들어간다.', factEn: 'Row a bamboo boat through the rock tunnel into a lagoon walled in by cliffs.' },
    { name: '끄어반 어촌', en: 'Cua Van Village', lon: 107.14, lat: 20.82, year: '1800', region: '하롱베이', regionEn: 'Ha Long Bay',
      fact: '집이 모두 물 위에 떠 있는 수상 어촌. 아이들은 배를 타고 학교에 간다.', factEn: 'A floating fishing village where every house is afloat and children row to school.' },
    { name: '바이뜨롱 만', en: 'Bai Tu Long Bay', lon: 107.3, lat: 20.88, year: '2001', region: '하롱베이 동쪽', regionEn: 'East of Ha Long', mark: 'karst',
      fact: '하롱베이 동쪽 이웃 바다. 섬 모양은 같지만 배가 적어 고요하다.', factEn: 'Ha Long\'s eastern neighbour: the same islands, far fewer boats.' },
    { name: '꽌란섬', en: 'Quan Lan Island', lon: 107.39, lat: 20.88, year: '1149', region: '반돈 무역항', regionEn: 'Van Don trading port',
      fact: '1149년 리 왕조가 연 베트남 최초의 국제 무역항 반돈이 이 근처에 있었다.', factEn: 'Near Van Don, Vietnam\'s first international trading port, opened by the Ly dynasty in 1149.' },
    { name: '하롱베이 핵심 구역', en: 'Ha Long Core Zone', lon: 107.25, lat: 20.79, year: '1994', region: '세계유산', regionEn: 'World Heritage Site', mark: 'karst',
      fact: '1994년 하롱베이는 1600개 가까운 석회 섬으로 유네스코 세계유산이 됐다.', factEn: 'In 1994 Ha Long Bay, with nearly 1,600 limestone islands, became a UNESCO World Heritage Site.' },
    { name: '란하 만', en: 'Lan Ha Bay', lon: 107.08, lat: 20.76, year: '2023', region: '깟바 군도', regionEn: 'Cat Ba archipelago', mark: 'karst',
      fact: '하얀 모래 해변이 숨어 있는 작은 만. 2023년 하롱베이와 함께 세계유산이 됐다.', factEn: 'A small bay of hidden white beaches, added to the World Heritage listing with Ha Long in 2023.' },
    { name: '깟바섬', en: 'Cat Ba Island', lon: 107.04, lat: 20.725, year: '1986', region: '하이퐁', regionEn: 'Hai Phong', mark: 'lighthouse',
      fact: '하롱베이에서 가장 큰 섬. 섬 절반이 국립공원이고 세계에서 가장 귀한 원숭이 깟바랑구르가 산다.', factEn: 'The largest island in the area, half national park, home to the critically rare Cat Ba langur.' },
    { name: '다우고 동굴', en: 'Dau Go Cave', lon: 107.0, lat: 20.86, year: '1288', region: '바익당 어귀', regionEn: 'Bach Dang estuary', mark: 'karst',
      fact: '1288년 쩐흥다오 장군이 강바닥에 나무 말뚝을 박아 원나라 함대를 무너뜨릴 때 말뚝을 숨겨 둔 동굴이라 전한다.', factEn: 'Said to have hidden the stakes General Tran Hung Dao drove into the riverbed to wreck the Yuan fleet in 1288.' },
    { name: '하롱 야시장', en: 'Ha Long Night Market', lon: 107.045, lat: 20.95, year: '2000', region: '바이짜이', regionEn: 'Bai Chay',
      fact: '유람선이 돌아오는 저녁이면 해변을 따라 노점과 불빛이 늘어선다.', factEn: 'Stalls and lights line the shore each evening as the cruise boats return.' },
  ] },

  // ---------- 우주 항로 ----------
  // 경위도가 아니라 태양계 그림 위의 자리(0~100, 0~60)다. 거리는 km 로 직접 적었다(앞 기항지에서의 거리).
  // 실제 거리는 행성 배치에 따라 크게 달라지므로 가까울 때 기준의 대략값이다.
  space: { bounds: [0, 100, 0, 60], space: true, ports: [
    { name: '지구 · 발사대', en: 'Earth · Launch Pad', lon: 8, lat: 30, year: '1969', region: '케네디 우주센터', regionEn: 'Kennedy Space Center', mark: 'rocket', planet: 'earth', km: 6_000_000_000,
      fact: '1969년 7월 16일 새턴 V 로켓이 아폴로 11호를 싣고 여기서 달로 떠났다.', factEn: 'On 16 July 1969 a Saturn V lifted Apollo 11 from this pad toward the Moon.' },
    { name: '국제우주정거장', en: 'International Space Station', lon: 12, lat: 37, year: '1998', region: '지구 저궤도', regionEn: 'Low Earth orbit', mark: 'iss', km: 400,
      fact: '고도 약 400km에서 90분마다 지구를 한 바퀴 돈다. 우주인은 하루에 해돋이를 16번 본다.', factEn: 'Orbits about 400 km up every 90 minutes; its crew sees 16 sunrises a day.' },
    { name: '정지궤도', en: 'Geostationary Orbit', lon: 15, lat: 23, year: '1964', region: '고도 35,786km', regionEn: 'Altitude 35,786 km', mark: 'dish', km: 35_786,
      fact: '이 높이에서는 위성이 지구 자전과 같은 속도로 돌아 하늘의 한 점에 멈춘 듯 보인다. 방송·기상 위성의 자리다.', factEn: 'Here a satellite circles as fast as Earth turns and seems to hang still in the sky: home of TV and weather satellites.' },
    { name: '달 · 고요의 바다', en: 'Moon · Sea of Tranquility', lon: 24, lat: 34, year: '1969', region: '아폴로 11호 착륙지', regionEn: 'Apollo 11 landing site', mark: 'moonbase', planet: 'moon', km: 384_400,
      fact: '"한 인간에게는 작은 한 걸음이지만 인류에게는 위대한 도약이다." 암스트롱의 발자국은 바람이 없어 지금도 남아 있다.', factEn: '"One small step for man, one giant leap for mankind." With no wind, Armstrong\'s footprints are still there.' },
    { name: '달 뒷면', en: 'Far Side of the Moon', lon: 29, lat: 27, year: '2019', region: '폰 카르만 크레이터', regionEn: 'Von Kármán crater', mark: 'rover', km: 3_500,
      fact: '지구에서는 영원히 볼 수 없는 쪽. 2019년 중국의 창어 4호가 처음 내려앉았다.', factEn: 'The side never seen from Earth; China\'s Chang\'e 4 made the first landing here in 2019.' },
    { name: '라그랑주 L2', en: 'Lagrange Point L2', lon: 35, lat: 41, year: '2022', region: '제임스 웹 우주망원경', regionEn: 'James Webb Space Telescope', mark: 'jwst', km: 1_500_000,
      fact: '태양과 지구의 중력이 맞물려 머물기 좋은 자리. 제임스 웹 망원경이 금빛 거울을 펴고 우주의 첫 은하를 본다.', factEn: 'A balance point of Sun and Earth gravity, where Webb spreads its golden mirror toward the first galaxies.' },
    { name: '화성 전이궤도', en: 'Mars Transfer Orbit', lon: 44, lat: 31, year: '1925', region: '호만 궤도', regionEn: 'Hohmann orbit', km: 50_000_000,
      fact: '연료를 가장 적게 쓰는 길. 화성으로 가는 창은 26개월마다 한 번 열린다.', factEn: 'The cheapest path in fuel. A launch window to Mars opens once every 26 months.' },
    { name: '포보스', en: 'Phobos', lon: 52, lat: 24, year: '1877', region: '화성의 위성', regionEn: 'Moon of Mars', km: 5_000_000,
      fact: '"공포"라는 이름의 감자 모양 위성. 화성에 조금씩 끌려 내려가 언젠가 부서져 고리가 될 것이다.', factEn: 'The potato-shaped moon named "Fear", slowly spiralling in to break up into a ring one day.' },
    { name: '화성 · 예제로 크레이터', en: 'Mars · Jezero Crater', lon: 57, lat: 30, year: '2021', region: '퍼서비어런스 착륙지', regionEn: 'Perseverance landing site', mark: 'rover', planet: 'mars', km: 6_000,
      fact: '옛날 강이 흘러들던 호수 자리. 퍼서비어런스가 생명의 흔적을 찾고, 헬리콥터 인저뉴어티가 다른 행성에서 처음 날았다.', factEn: 'An ancient lake bed. Perseverance searches it for signs of life, and Ingenuity made the first flight on another world.' },
    { name: '화성 · 올림푸스 산', en: 'Mars · Olympus Mons', lon: 60, lat: 37, year: '1971', region: '태양계 최대의 화산', regionEn: 'Largest volcano in the Solar System', mark: 'olympus', km: 2_000,
      fact: '높이 약 22km로 에베레스트의 두 배가 넘는다. 1971년 마리너 9호가 모래폭풍이 걷힌 뒤 처음 찍었다.', factEn: 'About 22 km high, over twice Everest. Mariner 9 first photographed it in 1971 when a dust storm cleared.' },
    { name: '소행성대 · 세레스', en: 'Asteroid Belt · Ceres', lon: 69, lat: 22, year: '1801', region: '화성과 목성 사이', regionEn: 'Between Mars and Jupiter', planet: 'ceres', km: 260_000_000,
      fact: '소행성대에서 가장 큰 천체. 1801년 발견됐고, 2015년 탐사선 돈이 하얗게 빛나는 소금 지대를 찍었다.', factEn: 'The largest body in the belt, found in 1801; in 2015 the Dawn probe photographed its bright salt deposits.' },
    { name: '목성 · 유로파', en: 'Jupiter · Europa', lon: 79, lat: 35, year: '1610', region: '갈릴레이 위성', regionEn: 'Galilean moon', mark: 'dish', planet: 'jupiter', km: 550_000_000,
      fact: '1610년 갈릴레이가 망원경으로 찾았다. 얼음 껍질 아래 지구보다 많은 바닷물이 숨어 있을지 모른다.', factEn: 'Found by Galileo in 1610. Under its ice shell may lie more seawater than on Earth.' },
    { name: '토성 · 고리', en: 'Saturn · The Rings', lon: 89, lat: 25, year: '2004', region: '카시니 탐사선', regionEn: 'Cassini probe', planet: 'saturn', km: 650_000_000,
      fact: '고리는 폭이 수십만 km지만 두께는 대개 10m 남짓이다. 카시니호는 13년 동안 토성을 돈 뒤 스스로 뛰어들었다.', factEn: 'The rings span hundreds of thousands of km yet are mostly only about 10 m thick. Cassini orbited 13 years, then dived in.' },
    { name: '창백한 푸른 점', en: 'Pale Blue Dot', lon: 96, lat: 49, year: '1990', region: '보이저 1호', regionEn: 'Voyager 1', mark: 'dish', km: 4_600_000_000,
      fact: '1990년 보이저 1호가 60억 km 밖에서 뒤돌아 찍은 지구는 0.12픽셀짜리 점이었다. 이제 집으로 돌아간다.', factEn: 'In 1990 Voyager 1 turned back from 6 billion km and photographed Earth as a dot 0.12 pixels wide. Time to head home.' },
  ] },
};

// 지역 지도 해안선 (대략). [경도, 위도] 다각형 = 뭍
export const TOUR_COASTS = {
  venice: [
    [[12.3, 45.49], [12.3, 45.455], [12.312, 45.462], [12.326, 45.472], [12.345, 45.482], [12.37, 45.49]],             // 메스트레 쪽 본토
    [[12.309, 45.437], [12.318, 45.444], [12.33, 45.447], [12.343, 45.444], [12.356, 45.437], [12.362, 45.433], [12.356, 45.428], [12.345, 45.4305], [12.333, 45.4295], [12.322, 45.4305], [12.312, 45.432]], // 베네치아 본섬
    [[12.312, 45.4265], [12.335, 45.4275], [12.336, 45.4245], [12.313, 45.4235]],                                         // 주데카
    [[12.341, 45.4295], [12.347, 45.4298], [12.347, 45.4275], [12.341, 45.4275]],                                         // 산조르조
    [[12.352, 45.432], [12.372, 45.418], [12.392, 45.4], [12.384, 45.4], [12.362, 45.414], [12.348, 45.426]],             // 리도
    [[12.346, 45.461], [12.36, 45.462], [12.362, 45.455], [12.348, 45.453]],                                              // 무라노
    [[12.412, 45.488], [12.421, 45.489], [12.422, 45.482], [12.413, 45.481]],                                             // 부라노
  ],
  newyork: [
    [[-74.019, 40.7], [-74.012, 40.752], [-73.947, 40.851], [-73.928, 40.877], [-73.91, 40.873], [-73.933, 40.8], [-73.943, 40.775], [-73.972, 40.745], [-73.971, 40.711], [-74.0, 40.704]], // 맨해튼
    [[-74.08, 40.865], [-73.962, 40.865], [-74.023, 40.76], [-74.034, 40.722], [-74.06, 40.69], [-74.08, 40.675]],     // 뉴저지
    [[-73.89, 40.675], [-74.02, 40.675], [-74.0, 40.694], [-73.978, 40.704], [-73.962, 40.738], [-73.937, 40.772], [-73.918, 40.785], [-73.89, 40.79]], // 브루클린·퀸스
    [[-73.92, 40.865], [-73.89, 40.865], [-73.89, 40.802], [-73.915, 40.805], [-73.928, 40.835]],                        // 브롱크스
    [[-74.047, 40.69], [-74.043, 40.6905], [-74.0435, 40.688], [-74.0475, 40.6885]],                                      // 리버티섬
    [[-73.958, 40.753], [-73.94, 40.773], [-73.945, 40.775], [-73.961, 40.755]],                                          // 루스벨트섬
    [[-73.935, 40.785], [-73.918, 40.786], [-73.913, 40.8], [-73.93, 40.802]],                                            // 랜들스섬
  ],
  aegean: [
    [[22.5, 40.0], [22.5, 36.4], [22.9, 36.5], [23.1, 37.2], [23.5, 37.9], [24.03, 37.65], [24.0, 38.2], [23.6, 38.6], [23.2, 39.0], [22.9, 39.4], [23.3, 40.0]], // 그리스 본토
    [[23.3, 38.95], [24.1, 38.6], [24.6, 37.98], [24.4, 38.05], [23.6, 38.6]],                                           // 에우보이아
    [[26.2, 40.0], [26.6, 39.3], [26.8, 38.4], [26.2, 38.3], [27.2, 37.9], [27.0, 37.6], [27.5, 37.0], [27.3, 36.7], [28.0, 36.8], [28.6, 36.2], [29.5, 36.2], [29.5, 40.0]], // 튀르키예
    [[23.5, 35.6], [24.1, 35.5], [25.0, 35.4], [25.8, 35.3], [26.3, 35.2], [26.2, 35.0], [25.0, 35.0], [24.2, 35.2], [23.5, 35.2]], // 크레타
    [[27.7, 36.25], [28.0, 36.45], [28.25, 36.45], [28.2, 36.1], [27.85, 35.95]],                                         // 로도스
    [[24.9, 37.5], [24.95, 37.4], [24.88, 37.38]], [[25.25, 37.48], [25.45, 37.47], [25.4, 37.4], [25.3, 37.42]],         // 시로스, 미코노스
    [[25.35, 37.18], [25.55, 37.15], [25.5, 36.98], [25.38, 37.0]], [[25.1, 37.15], [25.25, 37.1], [25.2, 36.98], [25.08, 37.02]], // 낙소스, 파로스
    [[25.37, 36.47], [25.45, 36.45], [25.48, 36.35], [25.4, 36.36]],                                                       // 산토리니
    [[26.9, 36.9], [27.35, 36.92], [27.3, 36.75], [26.95, 36.75]], [[26.52, 37.35], [26.6, 37.32], [26.55, 37.28]],        // 코스, 파트모스
    [[26.3, 39.4], [26.6, 39.35], [26.4, 39.0], [25.85, 39.2]], [[25.8, 38.55], [26.15, 38.55], [26.0, 38.2]],             // 레스보스, 키오스
  ],
  halong: [
    [[106.95, 21.02], [106.95, 20.88], [106.99, 20.9], [107.02, 20.95], [107.06, 20.96], [107.1, 20.98], [107.2, 20.99], [107.32, 21.02]], // 본토 (하롱시)
    [[107.02, 20.94], [107.04, 20.94], [107.04, 20.92], [107.02, 20.92]],                                                  // 뚜언쩌우
    [[106.98, 20.82], [107.08, 20.79], [107.12, 20.74], [107.06, 20.69], [106.99, 20.71], [106.97, 20.77]],                // 깟바
    [[107.33, 20.93], [107.45, 20.86], [107.43, 20.84], [107.31, 20.91]],                                                  // 꽌란
    ...[[107.08, 20.88], [107.1, 20.86], [107.12, 20.83], [107.15, 20.85], [107.18, 20.9], [107.22, 20.86], [107.26, 20.8], [107.06, 20.83], [107.2, 20.93], [107.28, 20.9]]
      .map(([x, y]) => [[x - 0.008, y], [x, y + 0.008], [x + 0.008, y], [x, y - 0.008]]),                                 // 석회 섬들
  ],
};

// 원래 있던 맵의 기항지에도 명소를 붙인다 (이름으로 찾는다)
export const EXTRA_MARKS = {
  '리스본': 'castle', '나가사키': 'torii', '마닐라': 'castle', '아바나': 'castle', '카르타헤나': 'castle', '말라카': 'castle',
  '이스탄불': 'dome', '베네치아': 'campanile', '알렉산드리아': 'lighthouse', '로도스': 'castle', '마르세유': 'cathedral', '제노바': 'lighthouse',
  '나하': 'pagoda', '타이난': 'castle', '부산': 'tower', '해운대': 'skyline', '광안리': 'skyline', '한산도': 'pagoda',
  '잠실': 'burj', '여의도': 'skyline', '마포': 'skyline',
  '기자': 'pyramid', '룩소르': 'parthenon', '아부심벨': 'pyramid', '카이로': 'dome', '왕들의 골짜기': 'pyramid',
  '빈': 'cathedral', '레겐스부르크': 'cathedral', '바하우': 'castle', '부다페스트': 'dome', '베오그라드': 'castle',
  '상하이': 'tower', '난징': 'pagoda', '우한': 'pagoda', '충칭': 'skyline',
  '세인트루이스': 'arch', '뉴올리언스': 'cathedral', '멤피스': 'pyramid', '마나우스': 'dome', '벨렝': 'castle',
};
