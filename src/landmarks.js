// 기항지 명소: 환영 간판 뒤에 세우는 랜드마크.
// 전부 기본 도형으로 만든다. 외부 모델 파일은 쓰지 않는다.
// 크기는 배 길이(10~20)를 기준으로 멀리서도 알아볼 만큼 크게 잡았다. 높이 60~140 정도.
import * as THREE from 'three';

const _mats = new Map();
// 같은 색 재질은 한 번만 만든다
function mat(color, opt = {}) {
  const key = color + JSON.stringify(opt);
  if (!_mats.has(key)) _mats.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...opt }));
  return _mats.get(key);
}
function glow(color) {
  const key = 'glow' + color;
  if (!_mats.has(key)) _mats.set(key, new THREE.MeshBasicMaterial({ color }));
  return _mats.get(key);
}
function add(g, geo, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const mesh = new THREE.Mesh(geo, m);
  mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, rz);
  g.add(mesh); return mesh;
}
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);
const cone = (r, h, s = 10) => new THREE.ConeGeometry(r, h, s);
const sph = (r, ws = 14, hs = 10, ...rest) => new THREE.SphereGeometry(r, ws, hs, ...rest);

const B = {
  // 등대: 흰 몸통에 붉은 띠, 꼭대기 등불
  lighthouse(g) {
    add(g, cyl(9, 11, 6, 12), mat(0x7a7266), 0, 1);
    for (let k = 0; k < 5; k++) add(g, cyl(5.2 - k * 0.45, 5.6 - k * 0.45, 9, 12), mat(k % 2 ? 0xc0392b : 0xf4f1ea), 0, 8.5 + k * 9);
    add(g, cyl(3.4, 3.4, 5, 10), glow(0xfff2a8), 0, 55);
    add(g, cone(4.4, 5, 10), mat(0x2b2b2b), 0, 60);
  },
  // 에펠탑: 네모난 철골 세 단 + 첨탑
  eiffel(g) {
    const iron = mat(0x6b4a32, { roughness: 0.6, metalness: 0.3 });
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(g, cyl(1.6, 3, 34, 4), iron, sx * 11, 16, sz * 11, sz * 0.33, 0, -sx * 0.33);
    add(g, box(22, 2.4, 22), iron, 0, 32);
    add(g, cyl(4, 9, 40, 4), iron, 0, 53, 0, 0, Math.PI / 4);
    add(g, box(9, 1.6, 9), iron, 0, 73);
    add(g, cyl(1.2, 3.4, 34, 4), iron, 0, 90, 0, 0, Math.PI / 4);
    add(g, cyl(0.3, 0.6, 10, 5), iron, 0, 112);
  },
  // 자유의 여신상: 별 모양 받침 + 초록 몸 + 횃불
  liberty(g) {
    add(g, cyl(16, 18, 6, 11), mat(0x9a9284), 0, 1);
    add(g, box(14, 26, 14), mat(0xb8ae9a), 0, 17);
    const cu = mat(0x6fb39a, { roughness: 0.7 });
    add(g, cone(7, 34, 12), cu, 0, 47);
    add(g, sph(3.6), cu, 0, 66);
    for (let k = 0; k < 7; k++) add(g, cone(0.7, 4, 4), cu, Math.cos(k / 7 * Math.PI) * 3.4, 69, Math.sin(k / 7 * Math.PI) * 0.6, 0, 0, Math.cos(k / 7 * Math.PI) * -0.9);
    add(g, cyl(1.1, 1.3, 16, 6), cu, 4.5, 66, 0, 0, 0, -0.25);
    add(g, cone(1.8, 4, 8), glow(0xffc84a), 6.6, 75.5, 0);
  },
  // 빅벤: 사각 탑 + 시계판 + 뾰족 지붕
  bigben(g) {
    const st = mat(0xc8b27a);
    add(g, box(30, 18, 14), st, -16, 9);
    add(g, box(10, 62, 10), st, 0, 31);
    add(g, box(12, 12, 12), st, 0, 68);
    for (const [x, z, ry] of [[0, 6.1, 0], [0, -6.1, 0], [6.1, 0, Math.PI / 2], [-6.1, 0, Math.PI / 2]]) add(g, cyl(4.2, 4.2, 0.4, 20), glow(0xfff6d8), x, 68, z, Math.PI / 2, 0, ry ? Math.PI / 2 : 0);
    add(g, cone(8.4, 22, 4), mat(0x3d4a3a), 0, 85, 0, 0, Math.PI / 4);
  },
  // 시드니 오페라하우스: 흰 조개껍데기 지붕들
  opera(g) {
    add(g, box(70, 6, 30), mat(0xc49a72), 0, 2);
    const shell = mat(0xf6f2ea, { roughness: 0.35 });
    [[-22, 22], [-6, 30], [10, 26], [26, 18]].forEach(([x, h]) => {
      const m = add(g, sph(h, 16, 10, 0, Math.PI, 0, Math.PI / 2), shell, x, 5, 0, 0, Math.PI / 2, 0);
      m.scale.set(0.55, 1, 0.9); m.rotation.z = -0.25;
    });
  },
  // 산마르코 종탑 + 바실리카 돔 (베네치아)
  campanile(g) {
    add(g, box(10, 70, 10), mat(0xa0533c), 0, 35);
    add(g, box(11, 10, 11), mat(0xf0e8d8), 0, 75);
    add(g, cone(8, 18, 4), mat(0x5f9a7a), 0, 89, 0, 0, Math.PI / 4);
    add(g, cone(0.9, 6, 6), glow(0xffd76a), 0, 100);
    add(g, box(40, 18, 26), mat(0xe2d6c0), -30, 9);
    for (const x of [-42, -30, -18]) add(g, sph(6.4, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x8aa08c), x, 18);
  },
  // 콜로세움: 아치가 뚫린 타원 고리
  colosseum(g) {
    const ring = add(g, new THREE.CylinderGeometry(32, 34, 26, 28, 1, true), mat(0xc9b08a, { side: THREE.DoubleSide }), 0, 13); ring.scale.z = 0.8;
    const floor = add(g, cyl(32, 32, 3, 28), mat(0x8a7a5e), 0, 1.5); floor.scale.z = 0.8;
    for (let row = 0; row < 3; row++) for (let k = 0; k < 20; k++) {
      const a = (k / 20) * Math.PI * 2;
      add(g, box(3, 4.8, 1), mat(0x4a3c2c), Math.cos(a) * 34.2, 5 + row * 8, Math.sin(a) * 34.2 * 0.8, 0, -a + Math.PI / 2, 0);
    }
  },
  pyramid(g) {
    add(g, cone(42, 40, 4), mat(0xd9be82, { flatShading: true }), 0, 20, 0, 0, Math.PI / 4);
    add(g, cone(28, 27, 4), mat(0xcfb276, { flatShading: true }), 62, 13.5, -30, 0, Math.PI / 4);
  },
  // 탑: 지붕이 다섯 겹 (동아시아)
  pagoda(g) {
    for (let k = 0; k < 5; k++) {
      const s = 1 - k * 0.14;
      add(g, box(16 * s, 9, 16 * s), mat(0xb0412e), 0, 5 + k * 12);
      add(g, cone(15 * s, 4, 4), mat(0x2f3a3a), 0, 11 + k * 12, 0, 0, Math.PI / 4);
    }
    add(g, cyl(0.5, 0.8, 14, 6), mat(0xc9a55a, { metalness: 0.6 }), 0, 70);
  },
  torii(g) {
    const red = mat(0xd13a24);
    for (const x of [-12, 12]) add(g, cyl(1.5, 1.8, 30, 10), red, x, 15);
    add(g, box(34, 2.2, 3), mat(0x222222), 0, 31);
    add(g, box(30, 1.6, 2.4), red, 0, 25);
  },
  // 리우의 구세주 그리스도상: 산 위 십자 모양
  christ(g) {
    add(g, cone(36, 70, 9), mat(0x3f6b3a, { flatShading: true }), 0, 35);
    const w = mat(0xece6dc);
    add(g, box(4, 18, 4), w, 0, 78);
    add(g, box(22, 2.6, 3), w, 0, 84);
    add(g, sph(2), w, 0, 89);
  },
  // 돔과 미너렛 (아야 소피아·타지마할 계열)
  dome(g, opt = {}) {
    const c = opt.white ? 0xf2efe8 : 0xd8b48a;
    add(g, box(36, 18, 36), mat(c), 0, 9);
    add(g, sph(15, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat(opt.white ? 0xf6f4ee : 0x8a9aa0), 0, 18);
    add(g, cone(1, 7, 6), mat(0xc9a55a, { metalness: 0.6 }), 0, 36);
    for (const [x, z] of [[-24, -24], [24, -24], [-24, 24], [24, 24]]) {
      add(g, cyl(1.8, 2.2, 44, 10), mat(c), x, 22, z);
      add(g, cone(2.4, 6, 10), mat(0x8a9aa0), x, 47, z);
    }
  },
  tajmahal(g) { B.dome(g, { white: true }); },
  // 풍차 (암스테르담)
  windmill(g) {
    add(g, cyl(6, 9, 26, 8), mat(0x6a4a34), 0, 13);
    add(g, cone(7, 8, 8), mat(0x3a3a3a), 0, 30);
    const blade = mat(0xf0ead8);
    for (let k = 0; k < 4; k++) {
      add(g, box(2.6, 24, 0.5).translate(0, 12, 0), blade, 0, 26, 8, 0, 0, k * Math.PI / 2 + 0.3);
    }
  },
  // 부르즈 할리파: 은빛으로 가늘어지는 탑
  burj(g) {
    const glass = mat(0xb8c8d8, { roughness: 0.25, metalness: 0.6 });
    for (let k = 0; k < 7; k++) add(g, cyl(9 - k * 1.2, 10 - k * 1.2, 22, 6), glass, 0, 11 + k * 20);
    add(g, cyl(0.4, 1.4, 34, 6), glass, 0, 165);
  },
  // 마천루 숲 (맨해튼·홍콩·싱가포르)
  skyline(g, opt = {}) {
    const cols = [0x7a8592, 0x9aa6b4, 0x5e6876, 0xb4bcc6];
    for (let k = 0; k < 11; k++) {
      const h = 30 + ((k * 37) % 80) + (k === 5 ? 50 : 0), w = 9 + (k % 3) * 3;
      add(g, box(w, h, w), mat(cols[k % 4], { roughness: 0.4, metalness: 0.3 }), (k - 5) * 11, h / 2, (k % 2) * 10 - 5);
      if (k === 5) add(g, cyl(0.4, 1, 18, 5), mat(0xcccccc), (k - 5) * 11, h + 9, 0);
    }
    if (opt.sails) { // 마리나 베이 샌즈: 세 탑 위에 배 모양 지붕
      for (const x of [-20, 0, 20]) add(g, box(8, 60, 12), mat(0xd8dde2), x, 30, 30);
      add(g, box(62, 3, 12), mat(0x9aa4ac), 0, 61.5, 30);
    }
  },
  marina(g) { B.skyline(g, { sails: true }); },
  // 금문교: 붉은 주탑 둘과 늘어진 케이블
  goldengate(g) {
    const red = mat(0xc0442a);
    for (const x of [-34, 34]) {
      for (const z of [-3, 3]) add(g, box(3, 74, 3), red, x, 37, z);
      add(g, box(3, 3, 9), red, x, 60, 0); add(g, box(3, 3, 9), red, x, 72, 0);
    }
    add(g, box(110, 2.6, 9), red, 0, 26);
    const pts = []; for (let k = 0; k <= 20; k++) { const t = k / 20; pts.push(new THREE.Vector3(-34 + t * 68, 72 - Math.sin(t * Math.PI) * 42, 0)); }
    add(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.6, 5, false), red);
  },
  // 성 (노이슈반슈타인·부다 성 계열)
  castle(g) {
    const st = mat(0xe4ddd0);
    add(g, box(40, 22, 20), st, 0, 11);
    for (const [x, h] of [[-20, 46], [20, 38], [4, 58]]) {
      add(g, cyl(5, 5, h, 10), st, x, h / 2);
      add(g, cone(6.4, 14, 10), mat(0x4a5a7a), x, h + 7);
    }
  },
  // 남산·N서울타워 계열의 전망탑
  tower(g) {
    add(g, cone(30, 26, 9), mat(0x3f6b3a, { flatShading: true }), 0, 13);
    add(g, cyl(2.4, 3.6, 60, 10), mat(0xe8e8e8), 0, 52);
    add(g, cyl(7, 6, 8, 14), mat(0x9aa4ae), 0, 76);
    add(g, cyl(0.5, 1.2, 22, 6), mat(0xd0d0d0), 0, 91);
    add(g, sph(1.4), glow(0xff4a3a), 0, 103);
  },
  // 하롱베이 돌기둥
  karst(g) {
    const st = mat(0x8a9a86, { flatShading: true });
    for (const [x, z, r, h] of [[0, 0, 12, 70], [22, 10, 8, 46], [-18, 14, 9, 52]]) {
      add(g, cyl(r * 0.7, r, h, 7), st, x, h / 2, z);
      add(g, sph(r * 0.8, 8, 6), mat(0x4a7a3a), x, h, z);
    }
  },
  // 산토리니: 흰 집과 파란 돔
  santorini(g) {
    add(g, cone(46, 40, 8), mat(0x8a6e5a, { flatShading: true }), 0, 18);
    const white = mat(0xffffff, { roughness: 0.6 });
    for (let k = 0; k < 12; k++) {
      const a = k * 0.55, r = 18 + (k % 3) * 6;
      add(g, box(7, 6, 7), white, Math.cos(a) * r * 0.6, 26 + (k % 4) * 4, Math.sin(a) * r * 0.6 - 6);
    }
    add(g, sph(5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x2f62c8), 0, 41, -6);
    add(g, box(9, 8, 9), white, 0, 37, -6);
  },
  // ---------- 우주 ----------
  rocket(g) {
    add(g, box(24, 4, 24), mat(0x6a6a6a), 0, 2);
    add(g, box(4, 70, 4), mat(0xc0442a), -14, 35);
    add(g, cyl(4.2, 4.2, 50, 14), mat(0xf2f2f2, { roughness: 0.4 }), 0, 30);
    for (const x of [-7, 7]) add(g, cyl(2, 2, 34, 10), mat(0xe8e2d4), x, 22);
    add(g, cone(4.2, 12, 14), mat(0x2b2b2b), 0, 61);
  },
  iss(g) {
    const panel = mat(0x2a3f8a, { roughness: 0.3, metalness: 0.6 });
    add(g, cyl(3, 3, 40, 10), mat(0xd8d8d8), 0, 60, 0, 0, 0, Math.PI / 2);
    for (const x of [-26, 26]) for (const z of [-10, 10]) add(g, box(10, 0.4, 16), panel, x, 60, z);
    add(g, box(60, 1, 1), mat(0xb0b0b0), 0, 60, 0);
    add(g, cyl(0.6, 0.6, 56, 6), mat(0x888888), 0, 30);
  },
  moonbase(g) {
    const dome = mat(0xe8eef4, { roughness: 0.3 });
    for (const [x, z, r] of [[0, 0, 14], [24, 8, 9], [-20, 12, 8]]) add(g, sph(r, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), dome, x, 0, z);
    add(g, cyl(0.3, 0.3, 18, 5), mat(0xcccccc), 10, 9, -16);
    add(g, box(8, 5, 0.2), mat(0xffffff), 14, 15.5, -16);
    add(g, sph(8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x9a9a9a), -6, 10, -22, Math.PI * 0.6);
  },
  rover(g) {
    add(g, box(18, 5, 12), mat(0xd8d0c0), 0, 7);
    for (const x of [-7, 0, 7]) for (const z of [-7, 7]) add(g, cyl(2.4, 2.4, 2, 12), mat(0x333333), x, 2.4, z, Math.PI / 2);
    add(g, cyl(0.6, 0.6, 12, 6), mat(0xcccccc), 6, 15, 0);
    add(g, box(5, 4, 4), mat(0x666666), 6, 22, 0);
  },
  // 올림푸스 산: 넓고 완만한 방패 화산 + 꼭대기 칼데라
  olympus(g) {
    add(g, cyl(14, 70, 26, 14), mat(0xb2563a, { flatShading: true }), 0, 13);
    add(g, cyl(10, 14, 2, 14), mat(0x7a3424), 0, 26.5);
  },
  // 제임스 웹 망원경: 금빛 육각 거울 + 은빛 차양
  jwst(g) {
    const gold = mat(0xe8b830, { roughness: 0.25, metalness: 0.9 });
    for (let k = 0; k < 18; k++) {
      const ring = k < 6 ? 1 : 2, a = (k % (ring === 1 ? 6 : 12)) / (ring === 1 ? 6 : 12) * Math.PI * 2;
      add(g, cyl(3.4, 3.4, 0.6, 6), gold, Math.cos(a) * ring * 6.2, 40 + Math.sin(a) * ring * 6.2, 0, Math.PI / 2, 0, 0);
    }
    add(g, cyl(3.4, 3.4, 0.6, 6), gold, 0, 40, 0, Math.PI / 2);
    for (let k = 0; k < 5; k++) add(g, box(52 - k * 3, 0.3, 30 - k * 2), mat(0xc8b8e8, { metalness: 0.7, roughness: 0.3 }), 0, 18 + k * 1.4, 10);
    add(g, cyl(0.5, 0.5, 18, 6), mat(0xcccccc), 0, 9, 10);
  },
  // 고딕 대성당: 쌍탑 정면 + 본당 (노트르담 계열)
  cathedral(g) {
    const st = mat(0xd8ccb2);
    add(g, box(22, 30, 50), st, 0, 15, 22);
    add(g, cone(15.5, 12, 4), mat(0x6a6e78), 0, 36, 22, 0, Math.PI / 4).scale.set(1, 1, 2.3);
    for (const x of [-9, 9]) add(g, box(10, 48, 10), st, x, 24, -4);
    add(g, box(8, 20, 1), st, 0, 26, -9);
    add(g, cyl(5, 5, 0.6, 18), mat(0x4a5a9a), 0, 32, -9.4, Math.PI / 2);
    add(g, cone(2, 22, 6), mat(0x5a5e66), 0, 41, 30);
  },
  // 그리스 신전: 기단 + 기둥 열 + 박공
  parthenon(g) {
    const m = mat(0xece4d0);
    add(g, cone(40, 22, 9), mat(0x8a7a5a, { flatShading: true }), 0, 11);
    add(g, box(44, 3, 22), m, 0, 23.5);
    for (let k = 0; k < 8; k++) for (const z of [-9, 9]) add(g, cyl(1.3, 1.5, 15, 10), m, -19 + k * 5.4, 32.5, z);
    add(g, box(46, 2.6, 23), m, 0, 41.3);
    const sh = new THREE.Shape(); sh.moveTo(-23, 0); sh.lineTo(23, 0); sh.lineTo(0, 6); sh.closePath();
    add(g, new THREE.ExtrudeGeometry(sh, { depth: 23, bevelEnabled: false }).translate(0, 0, -11.5), m, 0, 42.6, 0);
  },
  obelisk(g) {
    add(g, box(10, 6, 10), mat(0x8a8478), 0, 3);
    add(g, cyl(2.4, 3.6, 46, 4), mat(0xc8a878, { flatShading: true }), 0, 29, 0, 0, Math.PI / 4);
    add(g, cone(2.6, 5, 4), glow(0xffd76a), 0, 54.5, 0, 0, Math.PI / 4);
  },
  // 루브르: ㄷ자 궁전 + 유리 피라미드
  louvre(g) {
    const st = mat(0xd8ccb0);
    add(g, box(90, 20, 14), st, 0, 10, 30);
    for (const x of [-38, 38]) add(g, box(14, 20, 60), st, x, 10, 0);
    add(g, cone(18, 18, 4), mat(0x9ad0e8, { transparent: true, opacity: 0.75, roughness: 0.1, metalness: 0.4 }), 0, 9, 0, 0, Math.PI / 4);
  },
  // 브루클린 다리: 고딕 아치 돌탑 둘과 케이블
  brooklyn(g) {
    const st = mat(0xb8a888);
    for (const x of [-36, 36]) {
      add(g, box(10, 60, 14), st, x, 30);
      for (const z of [-3.4, 3.4]) add(g, box(10.4, 18, 3.4), mat(0x3a3226), x, 40, z);
    }
    add(g, box(120, 2.6, 12), mat(0x8a8478), 0, 24);
    const steel = mat(0x6a6a6a);
    for (const z of [-5, 5]) {
      const pts = []; for (let k = 0; k <= 20; k++) { const t = k / 20; pts.push(new THREE.Vector3(-36 + t * 72, 58 - Math.sin(t * Math.PI) * 32, z)); }
      add(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.45, 5, false), steel);
    }
  },
  // 세인트루이스 게이트웨이 아치
  arch(g) {
    const pts = []; for (let k = 0; k <= 24; k++) { const t = k / 24, a = (t - 0.5) * Math.PI; pts.push(new THREE.Vector3(Math.sin(a) * 34, Math.cos(a) * 92, 0)); }
    add(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 2.6, 6, false), mat(0xd8dde2, { metalness: 0.8, roughness: 0.25 }));
  },
  dish(g) {
    add(g, cyl(1.4, 2, 24, 8), mat(0xcccccc), 0, 12);
    add(g, sph(18, 20, 8, 0, Math.PI * 2, 0, Math.PI / 3.2), mat(0xf0f0f0, { side: THREE.DoubleSide }), 0, 40, 0, Math.PI * 0.85);
  },
};
export const LANDMARKS = Object.keys(B);

// 이름으로 명소를 만든다. 없는 이름이면 null.
export function buildLandmark(kind) {
  const fn = B[kind];
  if (!fn) return null;
  const g = new THREE.Group();
  fn(g);
  return g;
}

// 장면을 새로 만들 때마다 재질 캐시를 비운다 (이전 장면의 재질은 clearScene 에서 dispose 된다)
export function resetLandmarkCache() { _mats.clear(); }
