// 레이스 코스: 항로, 체크포인트, 섬, 암초, 소용돌이, 보급품, 크라켄
import * as THREE from 'three';
import { waveHeight } from './ocean.js?v=20261005104532';
import { DEFAULT_MAP } from './maps.js?v=20261005104532';

// 시드 난수
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// 항로 제어점과 스케일은 맵(maps.js)에서 온다

// 한 바퀴 돌려 버리는 장치는 적게 둔다. 자주 나오면 항해의 흐름이 끊긴다.
// 둘 다 한 랩에 많아야 두 번 만나도록 자리 수를 줄였다.
export const LOOP_SPOTS = [0.33];          // 360도 코스터
export const WHIRL_SPOTS = [0.33, 0.72];   // 소용돌이 (맵의 whirl 값이 등장 시점을 정한다)

export const TRACK_HALF_WIDTH = 38;
export const GUARD_OFFSET = TRACK_HALF_WIDTH + 12; // 가드레일(로프) 위치: 이보다 밖으로는 못 나감
export const CHECKPOINT_COUNT = 14;

export class Track {
  constructor(scene, map = DEFAULT_MAP) {
    this.scene = scene;
    this.map = map;
    const TRACK_SCALE = map.scale; this.scale = TRACK_SCALE;
    const CONTROL_POINTS = map.points.map(([x, z]) => [x * TRACK_SCALE, z * TRACK_SCALE]);
    this.group = new THREE.Group();
    scene.add(this.group);
    const rand = rng(20240912);
    this.rand = rand;

    // 항로 곡선
    const pts = CONTROL_POINTS.map(([x, z]) => new THREE.Vector3(x, 0, z));
    this.curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.6);
    this.sampleCount = 800;
    this.samples = this.curve.getSpacedPoints(this.sampleCount);
    this.samples.pop(); // 마지막은 첫점과 동일
    this.cum = new Float32Array(this.sampleCount);
    let acc = 0;
    for (let i = 0; i < this.sampleCount; i++) {
      this.cum[i] = acc;
      const a = this.samples[i], b = this.samples[(i + 1) % this.sampleCount];
      acc += a.distanceTo(b);
    }
    this.totalLength = acc;
    this.tangents = this.samples.map((p, i) => {
      const n = this.samples[(i + 1) % this.sampleCount];
      return new THREE.Vector3().subVectors(n, p).normalize();
    });

    // 체크포인트 인덱스
    this.checkpoints = [];
    for (let c = 0; c < CHECKPOINT_COUNT; c++) this.checkpoints.push(Math.floor((c / CHECKPOINT_COUNT) * this.sampleCount));

    this.obstacles = []; // {x,z,r,type}
    this.islands = [];
    this.whirlpools = [];
    this.pickups = [];
    this.coins = [];
    this.chests = [];
    this.boostPads = [];    // 부스터 패드
    this.ramps = [];        // 점프대
    this.loops = [];        // 360도 코스터 고리
    this.warps = [];        // 블랙홀 관문 (입구 → 출구 순간이동)
    this.scrolls = [];      // 역사 인물 두루마리
    this.discoveries = [];  // 발견 구슬 (현상/사물/사건)
    this.verses = [];       // 말씀 (펼쳐진 책)
    this.buoys = [];
    this.animated = [];
    this.bridges = [];      // 보도교 (부캉이의 바다)
    this.structures = [];   // 부두·방파제 등 물 위 구조물 {x,z,r}
    this.seaMark = null;    // 외해 표지 (유도 미션의 목표 지점)

    this._buildBuoys();
    this._buildStartGate();
    this._buildRaceLine();
    this._buildIslands();
    // 항구 맵은 암초 대신 방파제·컨테이너·정박선이, 강 맵은 호안과 교각이 장애물 노릇을 한다
    if (map.style === 'harbor') this._buildHarbor();
    else if (map.style === 'river') this._buildRiver();
    else this._buildRocks();
    this._buildWhirlpools();
    this._buildPickups();
    this._buildCoins();
    this._buildChests();
    this._buildKnowledgeItems();
    this._buildVerses();
    this._buildBoostPads();
    this._buildJumpRamps();
    this._buildLoops();
    this._buildWarpGates();
    this._buildKraken();
    this._assignUnlocks();
    this.setDifficultyProgress(1);
  }

  // ----- 난이도 점진: 장애물마다 해금 진행률(0~1)을 부여 -----
  _assignUnlocks() {
    const rocks = this.obstacles.filter((o) => o.type === 'rock');
    // 장애물 최소화: 암초는 처음엔 없고 진행률 15%~90% 사이에 최대 6개만 하나씩 등장, 나머지는 영구 비활성
    const MAX_ROCKS = 6;
    const shuffled = [...rocks].sort(() => this.rand() - 0.5);
    shuffled.forEach((o, i) => { o.unlock = i < MAX_ROCKS ? 0.15 + (i / Math.max(1, MAX_ROCKS - 1)) * 0.75 : 2; });
    for (const o of this.obstacles) if (o.type !== 'rock') o.unlock = 0;
    this.whirlpools.forEach((w, i) => { w.unlock = this.map.whirl[i] ?? 2; }); // 맵마다 소용돌이 등장 시점이 다름
    this.kraken.unlock = this.map.kraken ?? 0.9;
    this.progressFrac = -1;
  }
  // 진행률에 따라 장애물을 켠다. 새로 켜진 장애물 종류 목록을 돌려준다.
  setDifficultyProgress(frac) {
    if (frac === this.progressFrac) return [];
    this.progressFrac = frac;
    const added = [];
    for (const o of this.obstacles) {
      const on = o.unlock <= frac;
      if (o.active !== on) { o.active = on; if (on && o.type === 'rock') added.push('rock'); }
      if (o.type === 'rock' && o.inst !== undefined) {
        for (let j = 0; j < 3; j++) { const k = o.inst + j; this.rockMesh.setMatrixAt(k, on ? this.rockMatrices[k] : _ZERO); }
      }
    }
    if (this.rockMesh) this.rockMesh.instanceMatrix.needsUpdate = true;
    for (const w of this.whirlpools) { const on = w.unlock <= frac; if (w.active !== on) { w.active = on; w.mesh.visible = on; if (on) added.push('whirl'); } }
    const kOn = this.kraken.unlock <= frac;
    if (this.kraken.enabled !== kOn) { this.kraken.enabled = kOn; this.krakenSign.visible = kOn; if (kOn) added.push('kraken'); }
    return added;
  }

  // ----- 유틸 -----
  distToCurve(x, z, hintIdx = -1) {
    let best = Infinity, bi = 0;
    const check = (i) => {
      const p = this.samples[i];
      const d = (p.x - x) ** 2 + (p.z - z) ** 2;
      if (d < best) { best = d; bi = i; }
    };
    if (hintIdx >= 0) {
      for (let k = -40; k <= 40; k++) check((hintIdx + k + this.sampleCount) % this.sampleCount);
      // 힌트 근처 결과가 너무 멀면 전역 탐색
      if (best > 200 * 200) { best = Infinity; for (let i = 0; i < this.sampleCount; i += 2) check(i); }
    } else {
      for (let i = 0; i < this.sampleCount; i += 2) check(i);
    }
    return { dist: Math.sqrt(best), idx: bi };
  }
  pointAt(idx) { return this.samples[((idx % this.sampleCount) + this.sampleCount) % this.sampleCount]; }
  tangentAt(idx) { return this.tangents[((idx % this.sampleCount) + this.sampleCount) % this.sampleCount]; }
  normalAt(idx) { const t = this.tangentAt(idx); return new THREE.Vector3(-t.z, 0, t.x); }

  // 출발 그리드 위치 (출발선 뒤쪽)
  startPositions(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / 2), col = i % 2;
      const idx = (this.sampleCount - 8 - row * 14 + this.sampleCount) % this.sampleCount;
      const p = this.pointAt(idx).clone();
      const nrm = this.normalAt(idx);
      p.addScaledVector(nrm, (col === 0 ? -1 : 1) * 19);
      const t = this.tangentAt(idx);
      out.push({ pos: p, heading: Math.atan2(t.x, t.z) });
    }
    return out;
  }

  // ----- 부표 -----
  _buildBuoys() {
    const redMat = new THREE.MeshStandardMaterial({ color: 0xe53935, roughness: 0.6 });
    const greenMat = new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.6 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffc107, emissive: 0x7a5000, emissiveIntensity: 0.3, roughness: 0.5 });
    const buoyGeo = new THREE.ConeGeometry(1.6, 4, 8);
    const poleGeo = new THREE.CylinderGeometry(0.15, 0.15, 5, 6);
    const flagGeo = new THREE.PlaneGeometry(2.2, 1.4);
    const flagMat = new THREE.MeshStandardMaterial({ color: 0xffe08a, side: THREE.DoubleSide });
    const step = 12;
    const smallBuoys = new THREE.InstancedMesh(buoyGeo, redMat, Math.ceil(this.sampleCount / step) + 2);
    const smallBuoysG = new THREE.InstancedMesh(buoyGeo, greenMat, Math.ceil(this.sampleCount / step) + 2);
    let ri = 0, gi = 0;
    const m = new THREE.Matrix4();
    for (let i = 0; i < this.sampleCount; i += step) {
      const p = this.pointAt(i), n = this.normalAt(i);
      const l = p.clone().addScaledVector(n, -TRACK_HALF_WIDTH);
      const r = p.clone().addScaledVector(n, TRACK_HALF_WIDTH);
      m.makeTranslation(l.x, 1.2, l.z); smallBuoys.setMatrixAt(ri++, m);
      m.makeTranslation(r.x, 1.2, r.z); smallBuoysG.setMatrixAt(gi++, m);
      this.buoys.push({ x: l.x, z: l.z, mesh: smallBuoys, i: ri - 1 }, { x: r.x, z: r.z, mesh: smallBuoysG, i: gi - 1 });
    }
    smallBuoys.count = ri; smallBuoysG.count = gi;
    this.group.add(smallBuoys, smallBuoysG);
    this.buoyMeshes = [smallBuoys, smallBuoysG];

    // 체크포인트 게이트 (큰 금색 부표 + 깃발)
    this.gateMeshes = [];
    this.checkpoints.forEach((idx, c) => {
      if (c === 0) return; // 출발선은 아치로
      const p = this.pointAt(idx), n = this.normalAt(idx);
      for (const s of [-1, 1]) {
        const g = new THREE.Group();
        const base = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.8, 2.2, 10), goldMat);
        const pole = new THREE.Mesh(poleGeo, new THREE.MeshStandardMaterial({ color: 0x3e2a14 }));
        pole.position.y = 3.2;
        const flag = new THREE.Mesh(flagGeo, flagMat); flag.position.set(1.1, 5.0, 0);
        g.add(base, pole, flag);
        const pos = p.clone().addScaledVector(n, s * (TRACK_HALF_WIDTH + 2));
        g.position.set(pos.x, 0, pos.z);
        g.userData.flag = flag;
        this.group.add(g);
        this.gateMeshes.push(g);
      }
    });
  }

  _buildStartGate() {
    const p = this.pointAt(0), n = this.normalAt(0), t = this.tangentAt(0);
    const g = new THREE.Group();
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x5b3a1a });
    for (const s of [-1, 1]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 26, 10), poleMat);
      pole.position.set(s * (TRACK_HALF_WIDTH + 4), 12, 0);
      g.add(pole);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 3, 12), new THREE.MeshStandardMaterial({ color: 0x8d6e63 }));
      base.position.set(s * (TRACK_HALF_WIDTH + 4), 0.5, 0);
      g.add(base);
    }
    const banner = new THREE.Mesh(new THREE.BoxGeometry((TRACK_HALF_WIDTH + 4) * 2, 5, 0.4), new THREE.MeshStandardMaterial({ color: 0xc0392b }));
    banner.position.y = 23;
    g.add(banner);
    // 체크무늬 깃발 띠
    const checker = makeCheckerTexture();
    const strip = new THREE.Mesh(new THREE.PlaneGeometry((TRACK_HALF_WIDTH + 4) * 2, 1.6), new THREE.MeshBasicMaterial({ map: checker, side: THREE.DoubleSide }));
    strip.position.set(0, 19.8, 0);
    g.add(strip);
    // 작은 삼각 깃발들
    for (let i = -6; i <= 6; i++) {
      const f = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.4, 3), new THREE.MeshStandardMaterial({ color: i % 2 ? 0xffe08a : 0x3498db, side: THREE.DoubleSide }));
      f.position.set(i * 6, 24.5 + Math.abs(i) * 0.1, 0); f.rotation.x = Math.PI; f.rotation.z = Math.PI;
      f.rotation.set(0, 0, Math.PI);
      f.position.y = 26.8;
      g.add(f);
    }
    g.position.set(p.x, 0, p.z);
    g.rotation.y = Math.atan2(t.x, t.z); // 기둥·현수막이 항로를 가로지르도록 (접선의 법선 방향)
    this.group.add(g);
    this.startGate = g;
  }

  // ----- 레이싱 라인: 중앙 화살표 리본 + 좌우 경계선 -----
  _buildRaceLine() {
    const N = this.sampleCount;
    const makeRibbon = (offset, halfW, mat, uRepeat) => {
      const pos = new Float32Array((N + 1) * 2 * 3), uv = new Float32Array((N + 1) * 2 * 2), idx = [];
      for (let i = 0; i <= N; i++) {
        const p = this.pointAt(i), n = this.normalAt(i);
        const cx = p.x + n.x * offset, cz = p.z + n.z * offset;
        pos.set([cx - n.x * halfW, 0, cz - n.z * halfW, cx + n.x * halfW, 0, cz + n.z * halfW], i * 6);
        const u = (i / N) * uRepeat;
        uv.set([u, 0, u, 1], i * 4);
        if (i < N) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      geo.setIndex(idx);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false; mesh.renderOrder = 2;
      this.group.add(mesh);
      return { mesh, geo, offset };
    };
    const chevron = makeChevronTexture();
    const centerMat = new THREE.MeshBasicMaterial({ map: chevron, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: true });
    // 좌우 경계선: 끊김 없는 실선 (길이 분명히 보이도록)
    const leftMat = new THREE.MeshBasicMaterial({ color: 0xff5a4a, transparent: true, opacity: 0.95, depthWrite: false, side: THREE.DoubleSide, fog: true });
    const rightMat = new THREE.MeshBasicMaterial({ color: 0x5cff8a, transparent: true, opacity: 0.95, depthWrite: false, side: THREE.DoubleSide, fog: true });
    const ropeMat = new THREE.MeshBasicMaterial({ map: makeRopeTexture(), transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide, fog: true });
    this.raceLines = [
      makeRibbon(0, 3.2, centerMat, Math.round(this.totalLength / 14)),
      makeRibbon(-TRACK_HALF_WIDTH, 1.6, leftMat, 1),
      makeRibbon(TRACK_HALF_WIDTH, 1.6, rightMat, 1),
      // 가드레일: 항로 바깥 로프 (부표 사이를 잇는 밧줄)
      makeRibbon(-GUARD_OFFSET, 0.9, ropeMat, Math.round(this.totalLength / 6)),
      makeRibbon(GUARD_OFFSET, 0.9, ropeMat, Math.round(this.totalLength / 6)),
    ];
    // 가드레일 말뚝 부표
    const postGeo = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e6, roughness: 0.8 });
    const posts = new THREE.InstancedMesh(postGeo, postMat, Math.ceil(this.sampleCount / 20) * 2 + 2);
    const pm = new THREE.Matrix4(); let pi = 0;
    for (let i = 0; i < this.sampleCount; i += 20) {
      const p = this.pointAt(i), n = this.normalAt(i);
      for (const sd of [-1, 1]) { pm.makeTranslation(p.x + n.x * sd * GUARD_OFFSET, 1.5, p.z + n.z * sd * GUARD_OFFSET); posts.setMatrixAt(pi++, pm); }
    }
    posts.count = pi; this.group.add(posts); this.guardPosts = posts;
    this.raceLineScroll = 0;
  }

  // ----- 금화 (점수 + 콤보) -----
  _buildCoins() {
    const geo = new THREE.CylinderGeometry(1.5, 1.5, 0.35, 14);
    geo.rotateX(Math.PI / 2);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffd54f, emissive: 0xff9f00, emissiveIntensity: 0.7, metalness: 0.8, roughness: 0.25 });
    const groups = 16, per = 5, gap = 9;
    const mesh = new THREE.InstancedMesh(geo, mat, groups * per);
    const m = new THREE.Matrix4();
    let k = 0;
    for (let g = 0; g < groups; g++) {
      const baseIdx = Math.floor(((g + 0.25) / groups) * this.sampleCount) + 12;
      const lane = [-0.55, 0.55, 0, -0.3, 0.3][g % 5] * TRACK_HALF_WIDTH * 0.8;
      for (let j = 0; j < per; j++) {
        const idx = baseIdx + Math.round((j * gap) / (this.totalLength / this.sampleCount));
        const p = this.pointAt(idx), n = this.normalAt(idx);
        const x = p.x + n.x * lane, z = p.z + n.z * lane;
        m.makeTranslation(x, 2, z); mesh.setMatrixAt(k, m);
        this.coins.push({ x, z, r: 4.5, i: k, active: true, timer: 0, idx });
        k++;
      }
    }
    mesh.count = k;
    this.group.add(mesh);
    this.coinMesh = mesh;
    this._m4 = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._v = new THREE.Vector3(); this._s = new THREE.Vector3(1, 1, 1);
  }

  // ----- 보물 상자 (희귀: 부스트 풀 + 큰 점수) -----
  _buildChests() {
    const wood = new THREE.MeshStandardMaterial({ color: 0x6b3f1d, roughness: 0.8 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xffc107, emissive: 0xff8f00, emissiveIntensity: 0.6, metalness: 0.7, roughness: 0.3 });
    for (const u of [0.22, 0.66]) {
      const idx = Math.floor(u * this.sampleCount);
      const p = this.pointAt(idx), n = this.normalAt(idx);
      const side = u < 0.5 ? 1 : -1;
      const x = p.x + n.x * side * TRACK_HALF_WIDTH * 0.85, z = p.z + n.z * side * TRACK_HALF_WIDTH * 0.85;
      const g = new THREE.Group();
      const box = new THREE.Mesh(new THREE.BoxGeometry(4, 2.4, 3), wood);
      const lid = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1, 3.2), gold); lid.position.y = 1.7;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.22, 6, 28), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.8 }));
      ring.rotation.x = Math.PI / 2; ring.position.y = -0.8;
      g.add(box, lid, ring);
      g.position.set(x, 1.5, z);
      this.group.add(g);
      this.chests.push({ x, z, r: 6.5, mesh: g, active: true, timer: 0 });
    }
  }

  // ----- 부스터 패드: 밟으면 초고속 -----
  _buildBoostPads() {
    const tex = makeChevronTexture();
    for (let i = 0; i < 7; i++) {
      const idx = Math.floor(((i + 0.5) / 7) * this.sampleCount) + 60;
      const p = this.pointAt(idx), n = this.normalAt(idx), t = this.tangentAt(idx);
      const lane = [0, -0.4, 0.4][i % 3] * TRACK_HALF_WIDTH;
      const x = p.x + n.x * lane, z = p.z + n.z * lane;
      const geo = new THREE.PlaneGeometry(16, 9, 1, 1); geo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({ map: tex.clone(), color: 0xff9a3c, transparent: true, opacity: 0.95, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
      mat.map.wrapS = THREE.RepeatWrapping; mat.map.repeat.set(2, 1); mat.map.needsUpdate = true;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, 0.6, z); mesh.rotation.y = Math.atan2(t.x, t.z) - Math.PI / 2;
      mesh.renderOrder = 3;
      const ring = new THREE.Mesh(new THREE.RingGeometry(7, 8.2, 24), new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.55, z);
      this.group.add(mesh, ring);
      this.boostPads.push({ x, z, r: 8, mesh, ring, mat });
    }
  }

  // ----- 점프대: 밟으면 하늘로 날아올라 초고속 -----
  _buildJumpRamps() {
    const plank = new THREE.MeshStandardMaterial({ map: woodRampTexture(), roughness: 0.85 });
    const glow = new THREE.MeshBasicMaterial({ color: 0x8fd4ff, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false });
    const post = new THREE.MeshStandardMaterial({ color: 0x3e2a14, roughness: 0.9 });
    const chevron = makeChevronTexture();
    for (const u of [0.18, 0.46, 0.7, 0.9]) {
      const idx = Math.floor(u * this.sampleCount);
      const p = this.pointAt(idx), n = this.normalAt(idx), t = this.tangentAt(idx);
      const x = p.x, z = p.z;
      const g = new THREE.Group();
      const L = 24, W = 14, tilt = 0.32;
      const deck = new THREE.Mesh(new THREE.BoxGeometry(W, 0.8, L), plank);
      deck.position.set(0, Math.sin(tilt) * L * 0.5 + 0.6, 0); deck.rotation.x = -tilt;
      g.add(deck);
      // 발광 테두리 + 화살표
      for (const sd of [-1, 1]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, L), glow);
        rail.position.set(sd * (W / 2 - 0.3), Math.sin(tilt) * L * 0.5 + 1.2, 0); rail.rotation.x = -tilt; g.add(rail);
      }
      const arrowMat = new THREE.MeshBasicMaterial({ map: chevron.clone(), color: 0xffe08a, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
      arrowMat.map.wrapS = THREE.RepeatWrapping; arrowMat.map.repeat.set(3, 1); arrowMat.map.needsUpdate = true;
      const arrow = new THREE.Mesh(new THREE.PlaneGeometry(L * 0.9, W * 0.5), arrowMat);
      arrow.rotation.x = -Math.PI / 2 - tilt; arrow.rotation.z = Math.PI / 2; arrow.position.set(0, Math.sin(tilt) * L * 0.5 + 1.15, 0);
      g.add(arrow);
      // 지지 기둥
      for (const sd of [-1, 1]) for (const k of [0.3, 0.9]) {
        const h = Math.sin(tilt) * L * (k - 0.5) + Math.sin(tilt) * L * 0.5 + 0.6;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, Math.max(1, h + 2), 8), post);
        pole.position.set(sd * (W / 2 - 1.2), h / 2 - 1, -L / 2 + k * L); g.add(pole);
      }
      g.position.set(x, 0, z);
      g.rotation.y = Math.atan2(t.x, t.z);
      this.group.add(g);
      this.ramps.push({ x, z, r: 9, heading: Math.atan2(t.x, t.z), mesh: g, arrowMat, tx: t.x, tz: t.z });
    }
  }
  // ----- 360도 코스터: 물 위에 세운 나무 고리. 정면으로 들어가면 한 바퀴 돌고 튀어나간다 -----
  // 한 바퀴 도는 동안 조타가 멈추므로 자주 나오면 항해의 흐름이 끊긴다.
  // 한 랩에 한 번만 만나도록 한 곳만 둔다.
  _buildLoops() {
    const wood = new THREE.MeshStandardMaterial({ map: woodRampTexture(), roughness: 0.8 });
    const glow = new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    const post = new THREE.MeshStandardMaterial({ color: 0x3e2a14, roughness: 0.9 });
    for (const u of LOOP_SPOTS) {
      const idx = Math.floor(u * this.sampleCount);
      const p = this.pointAt(idx), t = this.tangentAt(idx), n = this.normalAt(idx);
      const R = 17, W = 15;
      const g = new THREE.Group();
      // 좌우 두 줄의 레일이 수직 원을 그린다
      for (const sd of [-1, 1]) {
        const rail = new THREE.Mesh(new THREE.TorusGeometry(R, 0.7, 8, 40), wood);
        rail.position.set(sd * W / 2, R, 0);
        g.add(rail);
        const neon = new THREE.Mesh(new THREE.TorusGeometry(R, 0.28, 6, 40), glow);
        neon.position.set(sd * W / 2, R, 0);
        g.add(neon);
      }
      // 레일을 잇는 가로대
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const tie = new THREE.Mesh(new THREE.BoxGeometry(W, 0.35, 0.9), wood);
        tie.position.set(0, R + Math.cos(a) * R, Math.sin(a) * R);
        tie.rotation.x = -a;
        g.add(tie);
      }
      // 물에 박힌 지지 기둥
      for (const sd of [-1, 1]) for (const dz of [-R * 0.8, R * 0.8]) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 7, 8), post);
        pole.position.set(sd * (W / 2 + 1.2), 1.5, dz);
        g.add(pole);
      }
      // 진입을 알리는 발광 문틀
      const gate = new THREE.Mesh(new THREE.TorusGeometry(R * 0.55, 0.5, 6, 28), glow);
      gate.position.set(0, R * 0.55, -R * 0.75);
      g.add(gate);
      g.position.set(p.x, 0, p.z);
      g.rotation.y = Math.atan2(t.x, t.z);
      this.group.add(g);
      this.loops.push({ x: p.x, z: p.z, r: 11, R, tx: t.x, tz: t.z, mesh: g, glow, active: true });
    }
  }

  // ----- 블랙홀 관문: 입구로 들어가면 항로 앞쪽 출구로 빨려 나온다 -----
  _buildWarpGates() {
    const texIn = makeSwirlTexture('#6a3ad8', '#1a0a3a');
    const texOut = makeSwirlTexture('#ff9a3c', '#3a1a05');
    // 입구 진행률 u 에서 들어가면 u + 0.12 지점으로 나온다
    for (const u of [0.24, 0.62]) {
      const iIn = Math.floor(u * this.sampleCount);
      const iOut = Math.floor(((u + 0.12) % 1) * this.sampleCount);
      const pin = this.pointAt(iIn), tin = this.tangentAt(iIn);
      const pout = this.pointAt(iOut), tout = this.tangentAt(iOut);
      const gateIn = this._warpGateMesh(texIn, 0x9a6aff);
      gateIn.position.set(pin.x, 0, pin.z); gateIn.rotation.y = Math.atan2(tin.x, tin.z);
      const gateOut = this._warpGateMesh(texOut, 0xffb347);
      gateOut.position.set(pout.x, 0, pout.z); gateOut.rotation.y = Math.atan2(tout.x, tout.z);
      this.group.add(gateIn, gateOut);
      this.warps.push({
        x: pin.x, z: pin.z, r: 10,
        outX: pout.x, outZ: pout.z, outTx: tout.x, outTz: tout.z, outIdx: iOut,
        meshIn: gateIn, meshOut: gateOut,
        discIn: gateIn.userData.disc, discOut: gateOut.userData.disc,
        active: true,
      });
    }
  }
  // 관문 하나: 서 있는 고리 + 그 안에서 도는 소용돌이 원반
  _warpGateMesh(tex, color) {
    const g = new THREE.Group();
    const R = 11;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.9, 10, 32),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.7, roughness: 0.4, metalness: 0.5 }));
    ring.position.y = R * 0.62; g.add(ring);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(R - 0.6, 40),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.92, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    disc.position.y = R * 0.62; g.add(disc);
    const light = new THREE.PointLight(color, 40, 70); light.position.y = R * 0.62; g.add(light);
    g.userData.disc = disc;
    return g;
  }

  updateRamps(dt) {
    for (const r of this.ramps) r.arrowMat.map.offset.x -= dt * 1.2;
    // 코스터 네온이 숨 쉬듯 밝아졌다 어두워진다
    this._loopT = (this._loopT ?? 0) + dt;
    for (const l of this.loops) l.glow.opacity = 0.6 + Math.sin(this._loopT * 2.2) * 0.25;
    // 관문 소용돌이는 계속 돈다
    for (const w of this.warps) { w.discIn.rotation.z -= dt * 1.6; w.discOut.rotation.z += dt * 1.6; }
  }

  // ----- 역사 인물 두루마리 / 발견 구슬 -----
  _buildKnowledgeItems() {
    const parch = new THREE.MeshStandardMaterial({ color: 0xf1e2b8, roughness: 0.9 });
    const ribbon = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.6 });
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.75 });
    const ringGeo = new THREE.TorusGeometry(3.2, 0.2, 6, 26);
    // 두루마리 8개: 항로 좌우 가장자리 쪽
    for (let i = 0; i < 8; i++) {
      const idx = Math.floor(((i + 0.6) / 8) * this.sampleCount) + 45;
      const p = this.pointAt(idx), n = this.normalAt(idx);
      const side = i % 2 ? 1 : -1;
      const x = p.x + n.x * side * TRACK_HALF_WIDTH * 0.7, z = p.z + n.z * side * TRACK_HALF_WIDTH * 0.7;
      const g = new THREE.Group();
      const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 4.2, 12), parch); roll.rotation.z = Math.PI / 2;
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.18, 6, 16), ribbon); band.rotation.y = Math.PI / 2;
      const ring = new THREE.Mesh(ringGeo, ringMat); ring.rotation.x = Math.PI / 2; ring.position.y = -0.6;
      g.add(roll, band, ring);
      g.position.set(x, 2, z);
      this.group.add(g);
      this.scrolls.push({ x, z, r: 5.5, mesh: g, active: true, timer: 0 });
    }
    // 발견 구슬 12개: 항로 안쪽 여러 차선
    const orbMat = new THREE.MeshStandardMaterial({ color: 0x9fe8ff, emissive: 0x2fb8ff, emissiveIntensity: 1.1, roughness: 0.2, metalness: 0.2, transparent: true, opacity: 0.9 });
    const orbRing = new THREE.MeshBasicMaterial({ color: 0x8fd4ff, transparent: true, opacity: 0.7 });
    for (let i = 0; i < 12; i++) {
      const idx = Math.floor(((i + 0.3) / 12) * this.sampleCount) + 20;
      const p = this.pointAt(idx), n = this.normalAt(idx);
      const lane = [-0.35, 0.35, 0][i % 3] * TRACK_HALF_WIDTH;
      const x = p.x + n.x * lane, z = p.z + n.z * lane;
      const g = new THREE.Group();
      const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 1), orbMat);
      const ring = new THREE.Mesh(ringGeo, orbRing); ring.rotation.x = Math.PI / 2; ring.position.y = -0.6;
      const light = new THREE.PointLight(0x5cc8ff, 6, 22);
      g.add(orb, ring, light);
      g.position.set(x, 2.2, z);
      this.group.add(g);
      this.discoveries.push({ x, z, r: 5.5, mesh: g, active: true, timer: 0, orb });
    }
  }

  // ----- 말씀: 항로 한가운데에 놓인 펼쳐진 책. 지나가면 구절이 뜬다 -----
  _buildVerses() {
    const page = new THREE.MeshStandardMaterial({ color: 0xfdf6e3, roughness: 0.85, emissive: 0xfff0c0, emissiveIntensity: 0.25, side: THREE.DoubleSide });
    const cover = new THREE.MeshStandardMaterial({ color: 0x6b1f2a, roughness: 0.6 });
    const halo = new THREE.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
    const haloGeo = new THREE.TorusGeometry(3.4, 0.18, 6, 28);
    for (let i = 0; i < 10; i++) {
      const idx = Math.floor(((i + 0.15) / 10) * this.sampleCount) + 30;
      const p = this.pointAt(idx), n = this.normalAt(idx);
      const lane = [0, -0.2, 0.2][i % 3] * TRACK_HALF_WIDTH;
      const x = p.x + n.x * lane, z = p.z + n.z * lane;
      const g = new THREE.Group();
      // 펼쳐진 책: 양쪽으로 기울인 두 면 + 아래 표지
      for (const sd of [-1, 1]) {
        const leaf = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.6), page);
        leaf.position.set(sd * 1.0, 0.25, 0); leaf.rotation.x = -Math.PI / 2; leaf.rotation.y = sd * 0.22;
        g.add(leaf);
      }
      const spine = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 2.7), cover); spine.position.y = 0.02; g.add(spine);
      const ring = new THREE.Mesh(haloGeo, halo); ring.rotation.x = Math.PI / 2; ring.position.y = -0.5; g.add(ring);
      const light = new THREE.PointLight(0xffd27a, 7, 24); light.position.y = 1.2; g.add(light);
      g.position.set(x, 2.1, z);
      this.group.add(g);
      this.verses.push({ x, z, r: 6, mesh: g, active: true, timer: 0 });
    }
  }
  collectVerse(v) { v.active = false; v.mesh.visible = false; v.timer = 40; }

  // ----- 섬 -----
  _buildIslands() {
    if (this.map.style === 'harbor' || this.map.style === 'river') return; // 항구와 강은 섬 대신 호안·부두를 세운다 (_buildHarbor / _buildRiver)
    const rand = this.rand;
    const sandMat = new THREE.MeshStandardMaterial({ color: 0xe8d59a, roughness: 1 });
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x4f9a3a, roughness: 1 });
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x6d6a5e, roughness: 1 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x7b5a2e });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e8b3a, side: THREE.DoubleSide });

    // 고정 배치 (항로 안쪽/바깥쪽에 지형감을 줌) + 랜덤
    const fixed = [
      [300, 250, 95], [-250, 300, 120], [-50, 380, 60], [880, 200, 110], [-780, 500, 90], [-820, 100, 100],
      [150, -220, 80], [500, 750, 90], [-100, 900, 70], [-500, -300, 100], [700, -150, 70], [-400, 120, 45],
      [400, 40, 26], [-700, 320, 30],
    ];
    const TRACK_SCALE = this.scale, style = this.map.style;
    const candidates = fixed.map(([x, z, r]) => [x * TRACK_SCALE, z * TRACK_SCALE, r * TRACK_SCALE]);
    const ringN = style === 'atoll' ? 28 : style === 'coast' ? 56 : style === 'karst' ? 90 : style === 'space' ? 60 : 40;
    for (let i = 0; i < ringN; i++) {
      const a = rand() * Math.PI * 2, r = (style === 'coast' || style === 'karst' ? 520 + rand() * 700 : 700 + rand() * 900) * TRACK_SCALE;
      candidates.push([Math.cos(a) * r + 50, Math.sin(a) * r + 250, (style === 'atoll' ? 70 : style === 'karst' ? 18 : 40) + rand() * (style === 'karst' ? 50 : 120)]);
    }
    // 하롱베이: 항로 가까이에도 돌기둥을 촘촘히 세워 그 사이를 빠져나가게 한다
    if (style === 'karst') for (let i = 0; i < 70; i++) {
      const idx = Math.floor(rand() * this.sampleCount), p = this.pointAt(idx), n = this.normalAt(idx);
      const r = 10 + rand() * 22, d = (rand() < 0.5 ? -1 : 1) * (TRACK_HALF_WIDTH + 14 + r + rand() * 120);
      candidates.push([p.x + n.x * d, p.z + n.z * d, r]);
    }
    const iceMat = new THREE.MeshStandardMaterial({ color: 0xeaf6ff, roughness: 0.55, metalness: 0.05 });
    const iceBase = new THREE.MeshStandardMaterial({ color: 0x9fdcf5, roughness: 0.4, transparent: true, opacity: 0.9 });
    const cliffMat = new THREE.MeshStandardMaterial({ color: 0x7a7266, roughness: 1, flatShading: true });
    const darkGreen = new THREE.MeshStandardMaterial({ color: 0x2f6b3a, roughness: 1 });
    const lagoonMat = new THREE.MeshBasicMaterial({ color: 0x5fe0d8, transparent: true, opacity: 0.8 });
    const karstMat = new THREE.MeshStandardMaterial({ color: 0x8a958a, roughness: 1, flatShading: true });
    const karstTop = new THREE.MeshStandardMaterial({ color: 0x3f6e3a, roughness: 1, flatShading: true });
    const asteroidMat = new THREE.MeshStandardMaterial({ color: 0x7a7480, roughness: 1, flatShading: true });
    const asteroidRed = new THREE.MeshStandardMaterial({ color: 0x8a5a48, roughness: 1, flatShading: true });
    const craterMat = new THREE.MeshBasicMaterial({ color: 0x3a3640 });
    const domeMat = new THREE.MeshStandardMaterial({ color: 0xe8f0ff, roughness: 0.2, metalness: 0.3, emissive: 0x223355 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
    const blueDome = new THREE.MeshStandardMaterial({ color: 0x2f62c8, roughness: 0.5 });
    for (const [x, z, r0] of candidates) {
      const r = this.map.bigIce && style === 'ice' ? r0 * 1.3 : r0;
      const { dist } = this.distToCurve(x, z);
      if (dist < r + TRACK_HALF_WIDTH + 8) continue;
      const g = new THREE.Group();
      if (style === 'karst') {
        // 석회 돌기둥: 물에서 곧게 솟은 회녹색 기둥 1~3개, 꼭대기는 숲
        const n = r > 30 ? 2 + Math.floor(rand() * 2) : 1;
        for (let k = 0; k < n; k++) {
          const pr = k === 0 ? r * 0.8 : r * (0.35 + rand() * 0.3), ph = pr * (2.2 + rand() * 1.8);
          const a = rand() * Math.PI * 2, d = k === 0 ? 0 : r * 0.5;
          const pillar = new THREE.Mesh(new THREE.CylinderGeometry(pr * 0.62, pr, ph, 7), karstMat);
          pillar.position.set(Math.cos(a) * d, ph / 2 - 2, Math.sin(a) * d); pillar.rotation.y = rand() * 3; g.add(pillar);
          const cap = new THREE.Mesh(new THREE.SphereGeometry(pr * 0.7, 7, 5), karstTop);
          cap.scale.set(1, 0.55, 1); cap.position.set(pillar.position.x, ph - 2, pillar.position.z); g.add(cap);
        }
        g.position.set(x, 0, z); this.group.add(g);
        this.islands.push({ x, z, r }); this.obstacles.push({ x, z, r: r * 0.85, type: 'island' });
        continue;
      }
      if (style === 'space') {
        // 소행성: 울퉁불퉁한 바위 덩어리가 물 위에 반쯤 떠 있다. 큰 것에는 달 기지 돔.
        const geo = new THREE.IcosahedronGeometry(r * 0.75, 1);
        const pos = geo.attributes.position;
        for (let v = 0; v < pos.count; v++) { const k = 0.78 + rand() * 0.4; pos.setXYZ(v, pos.getX(v) * k, pos.getY(v) * k * 0.7, pos.getZ(v) * k); }
        geo.computeVertexNormals();
        const rock = new THREE.Mesh(geo, rand() < 0.3 ? asteroidRed : asteroidMat);
        rock.position.y = r * 0.12; rock.rotation.set(rand() * 0.4, rand() * 3, rand() * 0.4); g.add(rock);
        for (let k = 0; k < 3; k++) {
          const cr = r * (0.12 + rand() * 0.1), a = rand() * Math.PI * 2;
          const crater = new THREE.Mesh(new THREE.CircleGeometry(cr, 12), craterMat);
          crater.position.set(Math.cos(a) * r * 0.3, r * 0.12 + r * 0.5, Math.sin(a) * r * 0.3); crater.rotation.x = -Math.PI / 2; g.add(crater);
        }
        if (r > 90) {
          const dome = new THREE.Mesh(new THREE.SphereGeometry(r * 0.16, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
          dome.position.y = r * 0.12 + r * 0.5; g.add(dome);
        }
        g.position.set(x, 0, z); this.group.add(g);
        this.islands.push({ x, z, r }); this.obstacles.push({ x, z, r: r * 0.85, type: 'island' });
        continue;
      }
      if (style === 'ice') {
        // 빙산: 푸른 밑동 + 하얀 각진 봉우리들
        const base = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.2, 4, 7), iceBase); base.position.y = -1; g.add(base);
        const peaks = 1 + Math.floor(rand() * 3);
        for (let h = 0; h < peaks; h++) {
          const hr = r * (0.35 + rand() * 0.45), hh = hr * (0.6 + rand() * 1.2);
          const peak = new THREE.Mesh(new THREE.ConeGeometry(hr, hh, 5 + Math.floor(rand() * 3)), iceMat);
          const a = rand() * Math.PI * 2, d = rand() * r * 0.4;
          peak.position.set(Math.cos(a) * d, hh / 2 - 0.5, Math.sin(a) * d); peak.rotation.y = rand() * Math.PI; peak.rotation.z = (rand() - 0.5) * 0.15;
          g.add(peak);
        }
        g.position.set(x, 0, z); this.group.add(g);
        this.islands.push({ x, z, r }); this.obstacles.push({ x, z, r: r * 0.92, type: 'island' });
        continue;
      }
      if (style === 'atoll') {
        // 환초: 얕은 산호초 고리 + 라군 + 작은 모래섬
        const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.85, r * 0.15, 6, 24), sandMat); ring.rotation.x = Math.PI / 2; ring.position.y = 0.3; g.add(ring);
        const lagoon = new THREE.Mesh(new THREE.CircleGeometry(r * 0.75, 24), lagoonMat); lagoon.rotation.x = -Math.PI / 2; lagoon.position.y = 0.35; g.add(lagoon);
        const n = 2 + Math.floor(rand() * 3);
        for (let k = 0; k < n; k++) {
          const a = rand() * Math.PI * 2, d = r * 0.85, ir = r * (0.12 + rand() * 0.12);
          const isle = new THREE.Mesh(new THREE.CylinderGeometry(ir, ir * 1.2, 2.5, 10), sandMat); isle.position.set(Math.cos(a) * d, 0.6, Math.sin(a) * d); g.add(isle);
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 7, 5), trunkMat); trunk.position.set(isle.position.x, 4.5, isle.position.z); g.add(trunk);
          for (let l = 0; l < 5; l++) { const leaf = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.2), leafMat); leaf.position.set(trunk.position.x, 8, trunk.position.z); leaf.rotation.y = (l / 5) * Math.PI * 2; leaf.rotation.z = -0.5; leaf.geometry.translate(2, 0, 0); g.add(leaf); }
        }
        g.position.set(x, 0, z); this.group.add(g);
        this.islands.push({ x, z, r }); this.obstacles.push({ x, z, r: r * 0.95, type: 'island' });
        continue;
      }
      if (style === 'rocky' || style === 'coast') {
        // 절벽섬/해안: 각진 회색 절벽 + 초록 정상, 검은 사이프러스
        const cliff = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.85, r * 1.05, style === 'coast' ? 14 : 8, 7), cliffMat); cliff.position.y = style === 'coast' ? 6 : 3; g.add(cliff);
        const top = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.8, r * 0.86, 1.5, 7), darkGreen); top.position.y = style === 'coast' ? 13.5 : 7.5; g.add(top);
        const hills = 1 + Math.floor(rand() * 2);
        for (let h = 0; h < hills; h++) {
          const hr = r * (0.3 + rand() * 0.35), hh = hr * (0.6 + rand() * 0.9);
          const hill = new THREE.Mesh(new THREE.ConeGeometry(hr, hh, 8), h === 0 && r > 80 ? cliffMat : darkGreen);
          const a = rand() * Math.PI * 2, d = rand() * r * 0.35;
          hill.position.set(Math.cos(a) * d, top.position.y + hh / 2, Math.sin(a) * d); g.add(hill);
        }
        if (this.map.village && r > 34) {
          // 에게해: 정상에 하얀 집들과 파란 돔 하나
          const houses = 4 + Math.floor(r / 14);
          for (let h = 0; h < houses; h++) {
            const a = rand() * Math.PI * 2, d = r * (0.2 + rand() * 0.5), w = 4 + rand() * 4;
            const house = new THREE.Mesh(new THREE.BoxGeometry(w, w * 0.8, w), whiteMat);
            house.position.set(Math.cos(a) * d, top.position.y + 0.75 + w * 0.4, Math.sin(a) * d); house.rotation.y = rand() * 3; g.add(house);
          }
          const dome = new THREE.Mesh(new THREE.SphereGeometry(4.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), blueDome);
          dome.position.set(0, top.position.y + 7, 0); g.add(dome);
          const base = new THREE.Mesh(new THREE.BoxGeometry(9, 6, 9), whiteMat); base.position.set(0, top.position.y + 3.75, 0); g.add(base);
        }
        const trees = Math.floor(r / 22);
        for (let t = 0; t < trees; t++) {
          const a = rand() * Math.PI * 2, d = r * (0.4 + rand() * 0.4);
          const tree = new THREE.Mesh(new THREE.ConeGeometry(1.2, 6 + rand() * 4, 6), darkGreen); tree.position.set(Math.cos(a) * d, top.position.y + 3.5, Math.sin(a) * d); g.add(tree);
        }
        g.position.set(x, 0, z); this.group.add(g);
        this.islands.push({ x, z, r }); this.obstacles.push({ x, z, r: r * 0.95, type: 'island' });
        continue;
      }
      // 모래 기반
      const base = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.15, 3, 18), sandMat);
      base.position.y = -0.5;
      g.add(base);
      // 언덕
      const hills = 1 + Math.floor(rand() * 3);
      for (let h = 0; h < hills; h++) {
        const hr = r * (0.35 + rand() * 0.4), hh = hr * (0.5 + rand() * 0.9);
        const hill = new THREE.Mesh(new THREE.ConeGeometry(hr, hh, 9), h === 0 && r > 80 ? rockMat : grassMat);
        const a = rand() * Math.PI * 2, d = rand() * r * 0.45;
        hill.position.set(Math.cos(a) * d, hh / 2 - 0.5, Math.sin(a) * d);
        hill.rotation.y = rand() * Math.PI;
        g.add(hill);
        if (r > 80 && h === 0) {
          const snow = new THREE.Mesh(new THREE.ConeGeometry(hr * 0.3, hh * 0.3, 9), new THREE.MeshStandardMaterial({ color: 0xffffff }));
          snow.position.set(hill.position.x, hh - hh * 0.15 - 0.5, hill.position.z);
          g.add(snow);
        }
      }
      // 야자수
      const palms = Math.floor(r / 18);
      for (let t = 0; t < palms; t++) {
        const a = rand() * Math.PI * 2, d = r * (0.55 + rand() * 0.35);
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 7, 5), trunkMat);
        trunk.position.set(Math.cos(a) * d, 3.5, Math.sin(a) * d);
        trunk.rotation.z = (rand() - 0.5) * 0.3; trunk.rotation.x = (rand() - 0.5) * 0.3;
        g.add(trunk);
        for (let l = 0; l < 5; l++) {
          const leaf = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.2), leafMat);
          leaf.position.set(trunk.position.x, 7, trunk.position.z);
          leaf.rotation.y = (l / 5) * Math.PI * 2; leaf.rotation.z = -0.5;
          leaf.geometry.translate(2, 0, 0);
          g.add(leaf);
        }
      }
      g.position.set(x, 0, z);
      this.group.add(g);
      this.islands.push({ x, z, r });
      this.obstacles.push({ x, z, r: r * 0.92, type: 'island' });
    }
  }

  // ----- 부캉이의 바다: 항구 지형 -----
  // 방파제, 테트라포드, 크레인, 컨테이너, 정박선, 보도교 여섯, 오륙도.
  // 전부 코드로 만든다. 외부 모델이나 텍스처 파일은 쓰지 않는다.
  _buildHarbor() {
    const rand = this.rand, N = this.sampleCount;
    const [c0, c1] = this.map.canal || [0.4, 0.74];
    const at = (u) => Math.floor((((u % 1) + 1) % 1) * N);
    const G = GUARD_OFFSET;

    const concrete = new THREE.MeshStandardMaterial({ color: 0x9a9a92, roughness: 1 });
    const concreteDark = new THREE.MeshStandardMaterial({ color: 0x6f6f68, roughness: 1 });
    const steel = new THREE.MeshStandardMaterial({ color: 0xc8ccd2, roughness: 0.5, metalness: 0.55 });
    const steelRed = new THREE.MeshStandardMaterial({ color: 0xc0564a, roughness: 0.5, metalness: 0.4 });
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x2d3b4a, roughness: 0.7 });
    const deckMat = new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: 0.85 });

    const addStruct = (x, z, r) => { this.structures.push({ x, z, r }); this.obstacles.push({ x, z, r, type: 'structure' }); };

    // ---------- 1. 방파제와 테트라포드 ----------
    // 수로 구간 바깥쪽을 따라 낮은 콘크리트 벽을 세운다. 폭이 좁아 보이게 하는 장치다.
    const wallGeo = new THREE.BoxGeometry(10, 7, 26);
    const wall = new THREE.InstancedMesh(wallGeo, concrete, 260);
    const tetraGeo = new THREE.TetrahedronGeometry(3.2);
    const tetra = new THREE.InstancedMesh(tetraGeo, concreteDark, 420);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1), pv = new THREE.Vector3();
    let wi = 0, ti = 0;
    const canalSpan = Math.round(((c1 - c0 + 1) % 1) * N);  // 수로 구간의 샘플 수
    const STEP = 10;
    for (let s = 0; s <= canalSpan && wi < 258; s += STEP) {
      const i = (at(c0) + s) % N;
      const p = this.pointAt(i), n = this.normalAt(i), tg = this.tangentAt(i);
      const head = Math.atan2(tg.x, tg.z);
      for (const sd of [-1, 1]) {
        const wx = p.x + n.x * sd * (G + 9), wz = p.z + n.z * sd * (G + 9);
        q.setFromEuler(new THREE.Euler(0, head, 0));
        pv.set(wx, 2.2, wz); m.compose(pv, q, sc);
        wall.setMatrixAt(wi++, m);
        addStruct(wx, wz, 8);
        // 벽 앞에 테트라포드 몇 개
        for (let k = 0; k < 2 && ti < 420; k++) {
          const tx = wx - n.x * sd * (5 + rand() * 3) + (rand() - 0.5) * 8;
          const tz = wz - n.z * sd * (5 + rand() * 3) + (rand() - 0.5) * 8;
          q.setFromEuler(new THREE.Euler(rand() * 3, rand() * 3, rand() * 3));
          pv.set(tx, 1.2 + rand(), tz); m.compose(pv, q, sc);
          tetra.setMatrixAt(ti++, m);
        }
      }
    }
    wall.count = wi; tetra.count = ti;
    this.group.add(wall, tetra);

    // ---------- 2. 보도교 여섯 ----------
    // 지나갈 때 위에서 구경하는 사람과 스마트폰 플래시가 터진다.
    const DECK_Y = 31;
    const personGeo = new THREE.CapsuleGeometry(0.55, 1.5, 3, 6);
    const personMat = new THREE.MeshStandardMaterial({ color: 0x2a3038, roughness: 0.9 });
    const flashGeo = new THREE.PlaneGeometry(2.6, 2.6);
    for (let b = 0; b < 6; b++) {
      const u = c0 + ((b + 0.5) / 6) * (c1 - c0);
      const i = at(u);
      const p = this.pointAt(i), tg = this.tangentAt(i);
      const g = new THREE.Group();
      const span = (G + 16) * 2;
      // 상판
      const deck = new THREE.Mesh(new THREE.BoxGeometry(span, 1.6, 9), deckMat);
      deck.position.y = DECK_Y; g.add(deck);
      // 난간
      for (const sd of [-1, 1]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(span, 0.3, 0.3), steel);
        rail.position.set(0, DECK_Y + 2.2, sd * 4.2); g.add(rail);
        for (let r = 0; r < 18; r++) {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 0.2), steel);
          post.position.set(-span / 2 + (r / 17) * span, DECK_Y + 1.6, sd * 4.2); g.add(post);
        }
      }
      // 아치 (부산항대교를 닮은 붉은 강재 아치)
      const archPts = [];
      for (let k = 0; k <= 14; k++) { const tt = k / 14; archPts.push(new THREE.Vector3(-span / 2 + tt * span, DECK_Y + Math.sin(tt * Math.PI) * 17, 0)); }
      const arch = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(archPts), 24, 0.8, 6, false), b % 2 ? steelRed : steel);
      g.add(arch);
      for (let k = 1; k < 7; k++) {
        const tt = k / 7;
        const h = Math.sin(tt * Math.PI) * 17;
        const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, h, 4), steel);
        cable.position.set(-span / 2 + tt * span, DECK_Y + h / 2, 0); g.add(cable);
      }
      // 교각 (항로 밖)
      for (const sd of [-1, 1]) {
        const pier = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 4.2, DECK_Y + 2, 8), concrete);
        pier.position.set(sd * (G + 13), (DECK_Y + 2) / 2 - 2, 0); g.add(pier);
      }
      // 구경하는 사람들
      const people = new THREE.InstancedMesh(personGeo, personMat, 22);
      for (let k = 0; k < 22; k++) {
        const x = -span / 2 + 6 + (k / 21) * (span - 12) + (rand() - 0.5) * 3;
        pv.set(x, DECK_Y + 1.9, (rand() - 0.5) * 5);
        q.setFromEuler(new THREE.Euler(0, rand() * 6.28, 0));
        m.compose(pv, q, sc); people.setMatrixAt(k, m);
      }
      g.add(people);
      // 플래시 (더해지는 블렌딩. 보일 때만 켠다)
      const flashes = [];
      for (let k = 0; k < 7; k++) {
        const f = new THREE.Mesh(flashGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
        f.position.set(-span / 2 + 10 + rand() * (span - 20), DECK_Y + 3.2, (rand() - 0.5) * 4);
        g.add(f); flashes.push({ mesh: f, t: rand() * 3 });
      }
      g.position.set(p.x, 0, p.z);
      g.rotation.y = Math.atan2(tg.x, tg.z);
      this.group.add(g);
      this.bridges.push({ x: p.x, z: p.z, idx: i, mesh: g, flashes, no: b + 1 });
    }

    // ---------- 3. 크레인과 컨테이너 ----------
    const boxGeo = new THREE.BoxGeometry(12, 6, 6);
    const colors = [0xd04a3a, 0x2f7fc0, 0xe0a63c, 0x3f9a5c, 0xb0b4bb];
    for (let c = 0; c < 5; c++) {
      const u = c0 - 0.06 + (c / 5) * (c1 - c0 + 0.12);
      const i = at(u);
      const p = this.pointAt(i), n = this.normalAt(i), tg = this.tangentAt(i);
      const sd = c % 2 ? 1 : -1;
      const bx = p.x + n.x * sd * (G + 34), bz = p.z + n.z * sd * (G + 34);
      // 컨테이너 더미
      const stack = new THREE.Group();
      for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) {
        const box = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: colors[(r + k + c) % colors.length], roughness: 0.85 }));
        box.position.set((k - 1) * 13, 3.2 + r * 6.2, (r % 2) * 1.5);
        stack.add(box);
      }
      stack.position.set(bx, 0, bz); stack.rotation.y = Math.atan2(tg.x, tg.z);
      this.group.add(stack);
      addStruct(bx, bz, 22);
      // 갠트리 크레인
      if (c % 2 === 0) {
        const cr = new THREE.Group();
        for (const lx of [-14, 14]) for (const lz of [-9, 9]) {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(2, 44, 2), steelRed);
          leg.position.set(lx, 22, lz); cr.add(leg);
        }
        const beam = new THREE.Mesh(new THREE.BoxGeometry(34, 3, 4), steelRed); beam.position.y = 45; cr.add(beam);
        const boom = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.6, 58), steelRed); boom.position.set(0, 47, -18); cr.add(boom);
        const cab = new THREE.Mesh(new THREE.BoxGeometry(4, 3.4, 5), steel); cab.position.set(0, 42, -8); cr.add(cab);
        const cx = p.x + n.x * sd * (G + 66), cz = p.z + n.z * sd * (G + 66);
        cr.position.set(cx, 0, cz); cr.rotation.y = Math.atan2(tg.x, tg.z);
        this.group.add(cr);
      }
    }

    // ---------- 4. 정박한 대형 선박 ----------
    for (const [u, sd, len] of [[c0 + 0.04, -1, 82], [c1 - 0.06, 1, 96]]) {
      const i = at(u);
      const p = this.pointAt(i), n = this.normalAt(i), tg = this.tangentAt(i);
      const sx = p.x + n.x * sd * (G + 20), sz = p.z + n.z * sd * (G + 20);
      const ship = new THREE.Group();
      const hull = new THREE.Mesh(new THREE.BoxGeometry(14, 11, len), hullMat); hull.position.y = 4;
      const band = new THREE.Mesh(new THREE.BoxGeometry(14.4, 1.4, len), new THREE.MeshStandardMaterial({ color: 0xc0564a })); band.position.y = 8.6;
      const house = new THREE.Mesh(new THREE.BoxGeometry(13, 13, 16), deckMat); house.position.set(0, 16, -len * 0.3);
      const funnel = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.8, 8, 10), new THREE.MeshStandardMaterial({ color: 0x2f4f6f })); funnel.position.set(0, 26, -len * 0.33);
      ship.add(hull, band, house, funnel);
      for (let k = 0; k < 4; k++) {
        const cont = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: colors[k % colors.length], roughness: 0.85 }));
        cont.position.set(0, 13, len * 0.25 - k * 13); cont.rotation.y = Math.PI / 2; ship.add(cont);
      }
      ship.position.set(sx, 0, sz); ship.rotation.y = Math.atan2(tg.x, tg.z);
      this.group.add(ship);
      addStruct(sx, sz, 16);
    }

    // ---------- 5. 오륙도 — 외해로 나가는 표지 ----------
    // 유도 미션은 부캉이를 여기까지 데려오는 것이 목표다.
    const markIdx = at(0.06);
    const mp = this.pointAt(markIdx), mn = this.normalAt(markIdx);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x6a6b63, roughness: 1, flatShading: true });
    const greenTop = new THREE.MeshStandardMaterial({ color: 0x3c6b3f, roughness: 1 });
    const group56 = new THREE.Group();
    for (let k = 0; k < 6; k++) {
      const r = 11 + rand() * 9, h = 16 + rand() * 20;
      const rock = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r, h, 6), rockMat);
      rock.position.set(k * 30 - 75 + (rand() - 0.5) * 8, h / 2 - 3, (rand() - 0.5) * 26);
      rock.rotation.y = rand() * Math.PI;
      group56.add(rock);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.5, r * 0.56, 1.6, 6), greenTop);
      cap.position.set(rock.position.x, h - 3.2, rock.position.z);
      group56.add(cap);
    }
    const mx = mp.x + mn.x * (G + 95), mz = mp.z + mn.z * (G + 95);
    group56.position.set(mx, 0, mz);
    this.group.add(group56);
    addStruct(mx, mz, 70);
    this.seaMark = { x: mp.x, z: mp.z, idx: markIdx, r: 60 };

    // ---------- 6. 도시 실루엣 ----------
    // 멀리 둘러선 건물과 크루즈선. 장애물이 아니라 배경이다.
    const cityMat = new THREE.MeshStandardMaterial({ color: 0x5c6670, roughness: 0.9 });
    const cityGeo = new THREE.BoxGeometry(1, 1, 1);
    const city = new THREE.InstancedMesh(cityGeo, cityMat, 150);
    for (let k = 0; k < 150; k++) {
      const a = rand() * Math.PI * 2, d = (1050 + rand() * 900) * this.scale;
      const w = 26 + rand() * 40, h = 40 + rand() * 170;
      pv.set(Math.cos(a) * d, h / 2 - 4, Math.sin(a) * d + 330 * this.scale);
      q.setFromEuler(new THREE.Euler(0, rand() * 1.6, 0));
      sc.set(w, h, w * (0.7 + rand() * 0.6));
      m.compose(pv, q, sc); city.setMatrixAt(k, m);
    }
    sc.set(1, 1, 1);
    this.group.add(city);
  }

  // 전조 연출: 다리와 크레인 위의 갈매기가 한꺼번에 날아오른다
  spookGulls() { this._gullSpook = 1; }

  // 다리 위 스마트폰 플래시. 가까운 다리에서만 터뜨려서 값을 아낀다.
  _updateBridges(dt, t, px = this._px ?? 0, pz = this._pz ?? 0) {
    for (const br of this.bridges) {
      const near = (br.x - px) ** 2 + (br.z - pz) ** 2 < 320 * 320;
      for (const f of br.flashes) {
        if (!near) { if (f.mesh.material.opacity) f.mesh.material.opacity = 0; continue; }
        f.t -= dt;
        if (f.t <= 0) { f.t = 0.35 + Math.random() * 1.9; f.on = 0.12; }
        f.on = Math.max(0, (f.on || 0) - dt);
        f.mesh.material.opacity = f.on > 0 ? 0.85 : 0;
      }
    }
  }
  // 플레이어 위치를 알려 주면 다리 플래시와 컬링이 그 기준으로 돈다
  setFocus(x, z) { this._px = x; this._pz = z; }

  // ----- 강 (style: 'river') -----
  // 바다 맵과 결정적으로 다른 점: 양쪽이 끝까지 뭍이다.
  // 그래서 섬을 흩뿌리는 대신 항로 양옆을 따라 호안을 한 줄씩 깔고, 그 위에 지역색을 세운다.
  // 다리는 항로를 가로지르고, 교각만 항로 밖에 둬서 지나갈 수는 있게 한다.
  _buildRiver() {
    const rand = this.rand, N = this.sampleCount, G = GUARD_OFFSET;
    const B = this.map.banks || 'city';
    const at = (u) => Math.floor((((u % 1) + 1) % 1) * N);
    const addStruct = (x, z, r) => { this.structures.push({ x, z, r }); this.obstacles.push({ x, z, r, type: 'structure' }); };

    // 지역색: 호안 색, 뭍 색, 뭍에 세울 것, 호안 높이
    const LOOK = {
      city:   { quay: 0x9a9a92, land: 0x5f6b4a, prop: 'tower',  quayH: 9,  propEvery: 2 },
      jungle: { quay: 0x6b5634, land: 0x2d5a2a, prop: 'palm',   quayH: 5,  propEvery: 1 },
      desert: { quay: 0xc9b183, land: 0xd8c48f, prop: 'palm',   quayH: 4,  propEvery: 2 },
      castle: { quay: 0x8e8578, land: 0x6a7350, prop: 'spire',  quayH: 11, propEvery: 2 },
      gorge:  { quay: 0x6a6b63, land: 0x4a5540, prop: 'cliff',  quayH: 46, propEvery: 1 },
      swamp:  { quay: 0x5a5436, land: 0x44512f, prop: 'cypress', quayH: 3, propEvery: 1 },
      venice: { quay: 0xd8ccb0, land: 0xb89a7a, prop: 'palazzo', quayH: 3, propEvery: 1 },
      paris:  { quay: 0xcfc4a8, land: 0x7a8a5a, prop: 'spire',  quayH: 8,  propEvery: 1, stone: 0xe4dac0, roof: 0x5c6a78 },
      metro:  { quay: 0x8a8a86, land: 0x4f5a48, prop: 'tower',  quayH: 7,  propEvery: 1, towerH: 2.2 },
    }[B] || { quay: 0x8a8a82, land: 0x5a6b45, prop: 'palm', quayH: 6, propEvery: 2 };

    this.quayH = LOOK.quayH;   // 이정표를 호안 위에 세울 때 쓴다
    const quayMat = new THREE.MeshStandardMaterial({ color: LOOK.quay, roughness: 1, flatShading: B === 'gorge' });
    const landMat = new THREE.MeshStandardMaterial({ color: LOOK.land, roughness: 1 });
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1), pv = new THREE.Vector3();

    // ---------- 1. 호안 ----------
    // 항로 양옆을 따라 한 바퀴. STEP 을 키우면 블록이 드문드문해지고 틈이 보인다.
    const STEP = 8;
    const slots = Math.floor(N / STEP) * 2 + 4;
    const quayGeo = new THREE.BoxGeometry(12, LOOK.quayH, 26);
    const quay = new THREE.InstancedMesh(quayGeo, quayMat, slots);
    const landGeo = new THREE.BoxGeometry(120, Math.max(2, LOOK.quayH * 0.6), 30);
    const land = new THREE.InstancedMesh(landGeo, landMat, slots);
    let qi = 0, li = 0;
    for (let i = 0; i < N; i += STEP) {
      const p = this.pointAt(i), n = this.normalAt(i), tg = this.tangentAt(i);
      const head = Math.atan2(tg.x, tg.z);
      q.setFromEuler(new THREE.Euler(0, head, 0));
      for (const sd of [-1, 1]) {
        const wx = p.x + n.x * sd * (G + 7), wz = p.z + n.z * sd * (G + 7);
        pv.set(wx, LOOK.quayH / 2 - 2.2, wz); m.compose(pv, q, sc);
        if (qi < slots) quay.setMatrixAt(qi++, m);
        addStruct(wx, wz, 8);   // 가드 로프(GUARD_OFFSET)보다 안쪽으로 파고들지 않을 만큼만
        // 호안 뒤로 이어지는 뭍. 멀리까지 땅이 있다는 느낌만 주면 된다.
        const lx = p.x + n.x * sd * (G + 72), lz = p.z + n.z * sd * (G + 72);
        pv.set(lx, LOOK.quayH * 0.3 - 2.4, lz); m.compose(pv, q, sc);
        if (li < slots) land.setMatrixAt(li++, m);
      }
    }
    quay.count = qi; land.count = li;
    this.group.add(quay, land);

    // ---------- 2. 뭍 위의 것들 ----------
    this._buildRiverProps(LOOK, STEP);

    // ---------- 3. 다리 ----------
    const nBridge = this.map.bridges ?? 4;
    for (let b = 0; b < nBridge; b++) this._addRiverBridge((b + 0.5) / nBridge, b);

    // ---------- 4. 모래퉁이 ----------
    // 강의 장애물은 암초가 아니라 가라앉은 모래다. 항로 가장자리에 낮게 눕힌다.
    const sandMat = new THREE.MeshStandardMaterial({ color: B === 'desert' ? 0xd0bb8a : 0x8a7c52, roughness: 1 });
    for (let k = 0; k < 10; k++) {
      const i = at(0.08 + (k / 10) * 0.84);
      const p = this.pointAt(i), n = this.normalAt(i);
      const sd = k % 2 ? 1 : -1;
      const r = 9 + rand() * 7;
      const sx = p.x + n.x * sd * (G - 14 - rand() * 8), sz = p.z + n.z * sd * (G - 14 - rand() * 8);
      const bar = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), sandMat);
      bar.scale.set(1, 0.22, 1.5); bar.position.set(sx, -1.2, sz); bar.rotation.y = rand() * Math.PI;
      this.group.add(bar);
      this.obstacles.push({ x: sx, z: sz, r: r * 0.8, type: 'rock' });
    }

    // ---------- 5. 강 가운데 섬 ----------
    // 한강의 밤섬·여의도처럼 항로가 갈라지는 자리. 부딪히는 섬이라 항로 밖에 둔다.
    const islandMat = new THREE.MeshStandardMaterial({ color: LOOK.land, roughness: 1 });
    for (const [u, sd, r] of [[0.19, 1, 52], [0.52, -1, 64], [0.81, 1, 40]]) {
      const i = at(u);
      const p = this.pointAt(i), n = this.normalAt(i);
      const ix = p.x + n.x * sd * (G + 40), iz = p.z + n.z * sd * (G + 40);
      const isl = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), islandMat);
      isl.scale.set(1, 0.14, 0.7); isl.position.set(ix, -1.5, iz);
      this.group.add(isl);
      addStruct(ix, iz, r * 0.6);
      this.islands.push({ x: ix, z: iz, r: r * 0.6 });
    }

    // ---------- 6. 정박한 배 ----------
    // 미시시피는 외륜선, 그 밖에는 바지선. 배경이면서 부딪히는 구조물이다.
    const hullMat = new THREE.MeshStandardMaterial({ color: B === 'swamp' ? 0xe8e2d2 : 0x3f4a56, roughness: 0.8 });
    const deckMat2 = new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: 0.85 });
    if (B === 'venice') {
      // 베네치아: 바지선 대신 호안에 매어 둔 검은 곤돌라들 (가드 로프 바깥이라 부딪히지 않는다)
      const gondolaMat = new THREE.MeshStandardMaterial({ color: 0x15151a, roughness: 0.4 });
      for (let k = 0; k < 24; k++) {
        const i = at(0.03 + k / 24), p = this.pointAt(i), n = this.normalAt(i), tg = this.tangentAt(i);
        const sd = k % 2 ? 1 : -1, gx = p.x + n.x * sd * (G - 1.5), gz = p.z + n.z * sd * (G - 1.5);
        const gon = new THREE.Group();
        const hull = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 15), gondolaMat); hull.position.y = 0.4; gon.add(hull);
        for (const e of [-1, 1]) { const tip = new THREE.Mesh(new THREE.ConeGeometry(0.9, 4, 5), gondolaMat); tip.rotation.x = e * -1.1; tip.position.set(0, 1.6, e * 8.2); gon.add(tip); }
        gon.position.set(gx, 0, gz); gon.rotation.y = Math.atan2(tg.x, tg.z) + (rand() - 0.5) * 0.2;
        this.group.add(gon);
      }
      return;
    }
    for (const [u, sd] of [[0.3, -1], [0.66, 1]]) {
      const i = at(u);
      const p = this.pointAt(i), n = this.normalAt(i), tg = this.tangentAt(i);
      const sx = p.x + n.x * sd * (G + 17), sz = p.z + n.z * sd * (G + 17);
      const ship = new THREE.Group();
      const rhull = new THREE.Mesh(new THREE.BoxGeometry(11, 7, 54), hullMat); rhull.position.y = 2.5; ship.add(rhull);
      const rhouse = new THREE.Mesh(new THREE.BoxGeometry(10, 9, 20), deckMat2); rhouse.position.set(0, 10, -6); ship.add(rhouse);
      if (B === 'swamp') {
        // 외륜: 선미에 세워 둔 큰 바퀴
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 9, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0xc0564a, roughness: 0.8, side: THREE.DoubleSide }));
        wheel.rotation.z = Math.PI / 2; wheel.position.set(0, 3, -30); ship.add(wheel);
      }
      ship.position.set(sx, 0, sz); ship.rotation.y = Math.atan2(tg.x, tg.z);
      this.group.add(ship);
      addStruct(sx, sz, 14);
    }
  }

  // 뭍 위에 세우는 것들. 지역마다 다르다.
  // 여기서 세운 건물은 clearable 로 표시해 둔다. 기항지 명소를 세울 때 그 둘레를 비운다 (signs.js).
  _buildRiverProps(LOOK, STEP) {
    const before = this.group.children.length;
    this._buildRiverPropsInner(LOOK, STEP);
    for (const c of this.group.children.slice(before)) if (c.isInstancedMesh) c.userData.clearable = true;
  }
  _buildRiverPropsInner(LOOK, STEP) {
    const rand = this.rand, N = this.sampleCount, G = GUARD_OFFSET;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1), pv = new THREE.Vector3();
    const every = STEP * (LOOK.propEvery || 2);
    const spots = [];
    for (let i = 0; i < N; i += every) for (const sd of [-1, 1]) {
      const p = this.pointAt(i), n = this.normalAt(i);
      const d = G + 34 + rand() * 90;
      spots.push([p.x + n.x * sd * d, p.z + n.z * sd * d]);
    }

    if (LOOK.prop === 'cliff') {
      // 협곡: 호안 바로 뒤에 높은 암벽을 세워 하늘을 좁힌다
      const mat = new THREE.MeshStandardMaterial({ color: 0x5e6058, roughness: 1, flatShading: true });
      const geo = new THREE.CylinderGeometry(26, 40, 150, 6);
      const inst = new THREE.InstancedMesh(geo, mat, spots.length);
      spots.forEach(([x, z], k) => {
        q.setFromEuler(new THREE.Euler(0, rand() * Math.PI, 0));
        sc.set(1, 0.6 + rand() * 0.9, 1);
        pv.set(x, 150 * sc.y / 2 - 20, z); m.compose(pv, q, sc); inst.setMatrixAt(k, m);
      });
      sc.set(1, 1, 1); this.group.add(inst);
      return;
    }

    if (LOOK.prop === 'tower') {
      // 도시: 호안 뒤로 늘어선 건물. 배경이므로 충돌은 두지 않는다.
      const tall = LOOK.towerH || 1;
      const mat = new THREE.MeshStandardMaterial({ color: tall > 1 ? 0x8a96a4 : 0x6b737c, roughness: tall > 1 ? 0.45 : 0.9, metalness: tall > 1 ? 0.35 : 0 });
      const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, spots.length);
      spots.forEach(([x, z], k) => {
        const w = 16 + rand() * 26, h = (30 + rand() * 120) * (tall > 1 ? 0.6 + rand() * tall : 1);
        q.setFromEuler(new THREE.Euler(0, rand() * 1.6, 0));
        sc.set(w, h, w * (0.7 + rand() * 0.6));
        pv.set(x, h / 2 - 3, z); m.compose(pv, q, sc); inst.setMatrixAt(k, m);
      });
      sc.set(1, 1, 1); this.group.add(inst);
      return;
    }

    if (LOOK.prop === 'palazzo') {
      // 베네치아: 물가에 바로 선 색색의 궁전. 호안 바로 뒤부터 빽빽하게.
      const cols = [0xd89a6a, 0xe8c890, 0xc8705a, 0xf0e0c8, 0xe0a8a0, 0xd8b070, 0xb8604a].map((c) => new THREE.Color(c));
      const near = [];
      for (let i = 0; i < N; i += STEP) for (const sd of [-1, 1]) {
        const p = this.pointAt(i), n = this.normalAt(i);
        for (const d of [G + 18, G + 44]) near.push([p.x + n.x * sd * d, p.z + n.z * sd * d, Math.atan2(this.tangentAt(i).x, this.tangentAt(i).z)]);
      }
      const body = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }), near.length);
      const roofs = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xa04a34, roughness: 0.9 }), near.length);
      near.forEach(([x, z, head], k) => {
        const h = 14 + rand() * 16, w = 18 + rand() * 10;
        q.setFromEuler(new THREE.Euler(0, head, 0));
        sc.set(22, h, w); pv.set(x, h / 2 - 1, z); m.compose(pv, q, sc); body.setMatrixAt(k, m); body.setColorAt(k, cols[k % cols.length]);
        sc.set(23, 1.4, w + 1); pv.set(x, h, z); m.compose(pv, q, sc); roofs.setMatrixAt(k, m);
      });
      sc.set(1, 1, 1); this.group.add(body, roofs);
      // 곤돌라 말뚝(팔리나): 호안 앞 물속에 줄무늬 기둥
      const pole = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.35, 0.35, 9, 6), new THREE.MeshStandardMaterial({ color: 0x2a4aa8 }), 80);
      let pk = 0;
      for (let i = 4; i < N && pk < 80; i += 20) for (const sd of [-1, 1]) {
        const p = this.pointAt(i), n = this.normalAt(i);
        pv.set(p.x + n.x * sd * (G - 3), 2.5, p.z + n.z * sd * (G - 3)); q.identity(); m.compose(pv, q, sc);
        if (pk < 80) pole.setMatrixAt(pk++, m);
      }
      pole.count = pk; this.group.add(pole);
      return;
    }

    if (LOOK.prop === 'spire') {
      // 유럽 구시가: 낮은 석조 건물 위로 교회 첨탑이 솟는다
      const stone = new THREE.MeshStandardMaterial({ color: LOOK.stone ?? 0xa89c86, roughness: 0.95 });
      const roof = new THREE.MeshStandardMaterial({ color: LOOK.roof ?? 0x8a4a3a, roughness: 0.9 });
      const body = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), stone, spots.length);
      const spire = new THREE.InstancedMesh(new THREE.ConeGeometry(4.5, 26, 6), roof, spots.length);
      let si = 0;
      spots.forEach(([x, z], k) => {
        const w = 18 + rand() * 18, h = 16 + rand() * 26;
        q.setFromEuler(new THREE.Euler(0, rand() * 1.6, 0));
        sc.set(w, h, w * 0.8); pv.set(x, h / 2 - 3, z); m.compose(pv, q, sc); body.setMatrixAt(k, m);
        sc.set(1, 1, 1);
        if (k % 3 === 0) { q.identity(); pv.set(x, h + 10, z); m.compose(pv, q, sc); spire.setMatrixAt(si++, m); }
      });
      spire.count = si; sc.set(1, 1, 1);
      this.group.add(body, spire);
      return;
    }

    // 나무 (정글 야자 / 사막 야자 / 늪 낙우송)
    const isCypress = LOOK.prop === 'cypress';
    const trunkMat = new THREE.MeshStandardMaterial({ color: isCypress ? 0x4a3a28 : 0x6b4f28, roughness: 1 });
    const leafMat = new THREE.MeshStandardMaterial({ color: isCypress ? 0x3f5a33 : 0x2f7a3a, roughness: 0.9 });
    const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.9, 1.6, 18, 6), trunkMat, spots.length);
    const leaf = new THREE.InstancedMesh(isCypress ? new THREE.ConeGeometry(7, 20, 7) : new THREE.SphereGeometry(6.5, 8, 6), leafMat, spots.length);
    spots.forEach(([x, z], k) => {
      const hs = 0.7 + rand() * 0.9;
      q.setFromEuler(new THREE.Euler(0, rand() * Math.PI, (rand() - 0.5) * 0.12));
      sc.set(1, hs, 1); pv.set(x, 18 * hs / 2 - 3, z); m.compose(pv, q, sc); trunk.setMatrixAt(k, m);
      sc.set(1, 1, 1); pv.set(x, 18 * hs - 3 + (isCypress ? 8 : 2), z); m.compose(pv, q, sc); leaf.setMatrixAt(k, m);
    });
    sc.set(1, 1, 1);
    this.group.add(trunk, leaf);
  }

  // 강을 가로지르는 다리. 상판은 항로 위를 지나고 교각은 항로 밖에만 세운다.
  _addRiverBridge(u, no) {
    const rand = this.rand, N = this.sampleCount, G = GUARD_OFFSET;
    const B = this.map.banks || 'city';
    const i = Math.floor((((u % 1) + 1) % 1) * N);
    const p = this.pointAt(i), tg = this.tangentAt(i);
    const g = new THREE.Group();
    const span = (G + 60) * 2;
    const DECK_Y = B === 'gorge' ? 54 : B === 'venice' ? 20 : 27;

    const concrete = new THREE.MeshStandardMaterial({ color: 0x9a9a92, roughness: 1 });
    const steel = new THREE.MeshStandardMaterial({ color: 0xc8ccd2, roughness: 0.5, metalness: 0.55 });
    const accent = new THREE.MeshStandardMaterial({ color: B === 'castle' ? 0x7a8a6a : B === 'venice' || B === 'paris' ? 0xe2d8c0 : 0xc0564a, roughness: 0.5, metalness: B === 'venice' || B === 'paris' ? 0 : 0.4 });
    const deckMat = new THREE.MeshStandardMaterial({ color: B === 'jungle' || B === 'swamp' ? 0x7a6a4a : 0xd0ccc0, roughness: 0.9 });

    // 상판
    const deck = new THREE.Mesh(new THREE.BoxGeometry(span, 1.8, 12), deckMat);
    deck.position.y = DECK_Y; g.add(deck);
    // 난간
    for (const sd of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(span, 0.34, 0.34), steel);
      rail.position.set(0, DECK_Y + 2.3, sd * 5.6); g.add(rail);
    }
    // 교각: 항로 바깥에만. 가운데를 비워 둬야 배가 지나간다.
    for (const sd of [-1, 1]) for (const off of [G + 16, G + 46]) {
      const pier = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 4.6, DECK_Y + 2, 8), concrete);
      pier.position.set(sd * off, (DECK_Y + 2) / 2 - 2, 0); g.add(pier);
      const px = p.x + this.normalAt(i).x * sd * off, pz = p.z + this.normalAt(i).z * sd * off;
      this.structures.push({ x: px, z: pz, r: 5 });
      this.obstacles.push({ x: px, z: pz, r: 5, type: 'structure' });
    }

    // 상부 구조: 도시는 사장교 주탑, 유럽은 사슬, 그 밖에는 트러스 아치
    if ((B === 'city' || B === 'metro') && no % 2 === 0) {
      for (const sd of [-1, 1]) {
        const tower = new THREE.Mesh(new THREE.BoxGeometry(3.4, 46, 3.4), steel);
        tower.position.set(sd * (G + 16), DECK_Y + 23, 0); g.add(tower);
        for (let k = 1; k <= 5; k++) {
          const dx = sd * (G + 16) - sd * k * 9;
          const len = Math.hypot(46 - k * 2, k * 9);
          const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, len, 4), steel);
          cable.position.set((sd * (G + 16) + dx) / 2, DECK_Y + (46 - k * 2) / 2 + 1, 0);
          cable.rotation.z = Math.atan2(k * 9, 46 - k * 2) * sd;
          g.add(cable);
        }
      }
    } else if (B === 'castle') {
      for (const sd of [-1, 1]) {
        const tower = new THREE.Mesh(new THREE.BoxGeometry(6, 34, 8), accent);
        tower.position.set(sd * (G + 16), DECK_Y + 17, 0); g.add(tower);
      }
      const pts = [];
      for (let k = 0; k <= 16; k++) { const tt = k / 16; pts.push(new THREE.Vector3(-(G + 16) + tt * (G + 16) * 2, DECK_Y + 30 - Math.sin(tt * Math.PI) * 24, 0)); }
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.5, 5, false), steel));
    } else if (B !== 'gorge') {
      const arch = [];
      for (let k = 0; k <= 14; k++) { const tt = k / 14; arch.push(new THREE.Vector3(-span / 2 + tt * span, DECK_Y + Math.sin(tt * Math.PI) * 19, 0)); }
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arch), 24, 0.9, 6, false), accent));
    }

    g.position.set(p.x, 0, p.z);
    g.rotation.y = Math.atan2(tg.x, tg.z);
    this.group.add(g);
    this.bridges.push({ x: p.x, z: p.z, idx: i, mesh: g, flashes: [], no: no + 1 });
  }

  // ----- 암초 (항로 가장자리 근처) -----
  _buildRocks() {
    const rand = this.rand;
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x4a4a48, roughness: 1, flatShading: true });
    const geo = new THREE.DodecahedronGeometry(1, 0);
    const count = 34;
    const mesh = new THREE.InstancedMesh(geo, rockMat, count * 3);
    this.rockMatrices = [];
    let k = 0;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pos = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(rand() * this.sampleCount);
      // 출발 구간 근처는 피함
      if (idx < 60 || idx > this.sampleCount - 40) continue;
      const p = this.pointAt(idx), n = this.normalAt(idx);
      const side = rand() < 0.5 ? -1 : 1;
      const off = side * (TRACK_HALF_WIDTH * (0.45 + rand() * 0.5));
      const cx = p.x + n.x * off, cz = p.z + n.z * off;
      const r = 4 + rand() * 4;
      const inst = k;
      for (let j = 0; j < 3; j++) {
        pos.set(cx + (rand() - 0.5) * r, 0.5 + rand() * 1.5, cz + (rand() - 0.5) * r);
        q.setFromEuler(new THREE.Euler(rand() * 3, rand() * 3, rand() * 3));
        const sc = r * (0.35 + rand() * 0.4);
        s.set(sc, sc * (0.6 + rand() * 0.8), sc);
        m.compose(pos, q, s);
        mesh.setMatrixAt(k, m); this.rockMatrices[k] = m.clone(); k++;
      }
      this.obstacles.push({ x: cx, z: cz, r: r * 0.9, type: 'rock', inst });
    }
    mesh.count = k;
    this.group.add(mesh);
    this.rockMesh = mesh;
  }

  // ----- 소용돌이 -----
  _buildWhirlpools() {
    const baseTex = makeWhirlTexture();
    for (const u of WHIRL_SPOTS) {
      const tex = baseTex.clone(); tex.needsUpdate = true;
      const idx = Math.floor(u * this.sampleCount);
      const p = this.pointAt(idx), n = this.normalAt(idx);
      const off = (this.rand() - 0.5) * TRACK_HALF_WIDTH * 0.8;
      const x = p.x + n.x * off, z = p.z + n.z * off, r = 16;
      const geo = new THREE.PlaneGeometry(r * 2.2, r * 2.2, 12, 12);
      geo.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.9, depthWrite: false }));
      mesh.position.set(x, 0, z);
      this.group.add(mesh);
      this.whirlpools.push({ x, z, r, mesh, geo, uvRot: 0 });
    }
  }

  // ----- 보급 통 (부스트 게이지) -----
  _buildPickups() {
    const geo = new THREE.CylinderGeometry(1.4, 1.4, 2.6, 10);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffc107, emissive: 0xff9800, emissiveIntensity: 0.5, metalness: 0.5, roughness: 0.3 });
    const ringGeo = new THREE.TorusGeometry(2.6, 0.18, 6, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.7 });
    const n = 22;
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(((i + 0.5) / n) * this.sampleCount) + 30;
      const p = this.pointAt(idx), nrm = this.normalAt(idx);
      const lane = [-0.6, 0, 0.6][i % 3] * TRACK_HALF_WIDTH * 0.8;
      const x = p.x + nrm.x * lane, z = p.z + nrm.z * lane;
      const g = new THREE.Group();
      const barrel = new THREE.Mesh(geo, mat);
      barrel.rotation.z = Math.PI / 2;
      const ring = new THREE.Mesh(ringGeo, ringMat); ring.rotation.x = Math.PI / 2; ring.position.y = -0.4;
      g.add(barrel, ring);
      g.position.set(x, 1.5, z);
      this.group.add(g);
      this.pickups.push({ x, z, r: 6, mesh: g, active: true, timer: 0 });
    }
  }

  // ----- 크라켄 -----
  _buildKraken() {
    const idx = Math.floor(0.88 * this.sampleCount);
    const p = this.pointAt(idx);
    const mat = new THREE.MeshStandardMaterial({ color: 0x5c2a6e, roughness: 0.7 });
    const suckerMat = new THREE.MeshStandardMaterial({ color: 0xd08ad8 });
    const tentacles = [];
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.3;
      const d = 22 + (i % 2) * 16;
      const x = p.x + Math.cos(a) * d, z = p.z + Math.sin(a) * d;
      const pts = [];
      for (let k = 0; k <= 6; k++) {
        const t = k / 6;
        pts.push(new THREE.Vector3(Math.sin(t * 2.2) * 6 * t, t * 26, Math.cos(t * 1.7) * 4 * t));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const geo = new THREE.TubeGeometry(curve, 16, 2.4, 8, false);
      // 끝으로 갈수록 얇게
      const posAttr = geo.attributes.position;
      for (let v = 0; v < posAttr.count; v++) {
        const y = posAttr.getY(v);
        const t = y / 26;
        const cp = curve.getPoint(Math.min(1, Math.max(0, t)));
        const sx = posAttr.getX(v) - cp.x, sz = posAttr.getZ(v) - cp.z;
        const sc = 1 - t * 0.75;
        posAttr.setX(v, cp.x + sx * sc); posAttr.setZ(v, cp.z + sz * sc);
      }
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, mat);
      for (let s = 0; s < 6; s++) {
        const sp = curve.getPoint(0.2 + s * 0.13);
        const sucker = new THREE.Mesh(new THREE.SphereGeometry(0.7 - s * 0.07, 6, 6), suckerMat);
        sucker.position.set(sp.x - 2.0, sp.y, sp.z);
        mesh.add(sucker);
      }
      mesh.position.set(x, -30, z);
      mesh.rotation.y = Math.random() * Math.PI * 2;
      this.group.add(mesh);
      tentacles.push({ mesh, x, z, r: 6, phase: i * 0.15 });
    }
    this.kraken = { x: p.x, z: p.z, tentacles, timer: 5, state: 'hidden', t: 0, warned: false, zoneR: 90 };
    // 크라켄 경고 표지 (해골 부표)
    const sign = new THREE.Mesh(new THREE.OctahedronGeometry(3), new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0x550000, emissiveIntensity: 0.6 }));
    sign.position.set(p.x, 2.5, p.z);
    this.group.add(sign);
    this.krakenSign = sign;
  }

  // 크라켄 상태 갱신 - 촉수가 나와있으면 true
  updateKraken(dt) {
    const k = this.kraken;
    if (k.enabled === false) { k.state = 'hidden'; k.timer = 3; for (const t of k.tentacles) t.mesh.position.y = -32; return { active: false, rose: false }; }
    k.timer -= dt;
    if (k.state === 'hidden' && k.timer <= 0) { k.state = 'rising'; k.timer = 1.2; k.justRose = true; }
    else if (k.state === 'rising' && k.timer <= 0) { k.state = 'up'; k.timer = 5; }
    else if (k.state === 'up' && k.timer <= 0) { k.state = 'sinking'; k.timer = 1.5; }
    else if (k.state === 'sinking' && k.timer <= 0) { k.state = 'hidden'; k.timer = 6 + Math.random() * 4; }
    k.t += dt;
    let h;
    if (k.state === 'hidden') h = -32;
    else if (k.state === 'rising') h = -32 + (1 - k.timer / 1.2) * 30;
    else if (k.state === 'up') h = -2 + Math.sin(k.t * 2) * 1.5;
    else h = -2 - (1 - k.timer / 1.5) * 30;
    for (const t of k.tentacles) {
      t.mesh.position.y = h + Math.sin(k.t * 1.5 + t.phase * 6) * 0.8;
      t.mesh.rotation.z = Math.sin(k.t * 1.2 + t.phase * 4) * 0.25;
      t.mesh.rotation.x = Math.cos(k.t * 0.9 + t.phase * 3) * 0.2;
    }
    this.krakenSign.rotation.y += dt;
    this.krakenSign.position.y = 2.5 + waveHeight(this.krakenSign.position.x, this.krakenSign.position.z, k.t);
    const rose = k.justRose; k.justRose = false;
    return { active: k.state === 'up' || k.state === 'rising', rose };
  }

  update(dt, t) {
    // 부표/게이트 흔들림
    for (const g of this.gateMeshes) {
      g.position.y = waveHeight(g.position.x, g.position.z, t) * 0.8;
      g.rotation.z = Math.sin(t * 1.3 + g.position.x) * 0.06;
      g.userData.flag.rotation.y = Math.sin(t * 4 + g.position.z) * 0.3;
    }
    // 소용돌이: 텍스처 회전 + 정점이 파도 높이를 따라감
    for (const w of this.whirlpools) {
      w.uvRot -= dt * 2.2;
      const tex = w.mesh.material.map; tex.center.set(0.5, 0.5); tex.rotation = w.uvRot;
      const pos = w.geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const wx = w.x + pos.getX(i), wz = w.z + pos.getZ(i);
        pos.setY(i, waveHeight(wx, wz, t) + 0.45);
      }
      pos.needsUpdate = true;
    }
    // 보급 통 회전/재생성
    for (const p of this.pickups) {
      if (!p.active) { p.timer -= dt; if (p.timer <= 0) { p.active = true; p.mesh.visible = true; } continue; }
      p.mesh.rotation.y += dt * 1.5;
      p.mesh.position.y = 1.5 + waveHeight(p.x, p.z, t) + Math.sin(t * 3 + p.x) * 0.3;
    }
    this.startGate.position.y = waveHeight(this.startGate.position.x, this.startGate.position.z, t) * 0.3;

    // 레이싱 라인: 파도 위에 떠 있게 + 화살표 흐름
    this.raceLineScroll -= dt * 0.9;
    const N = this.sampleCount;
    for (const rl of this.raceLines) {
      const pos = rl.geo.attributes.position;
      for (let i = 0; i <= N; i++) {
        const p = this.pointAt(i), n = this.normalAt(i);
        const cx = p.x + n.x * rl.offset, cz = p.z + n.z * rl.offset;
        const h = waveHeight(cx, cz, t) + 0.5;
        pos.setY(i * 2, h); pos.setY(i * 2 + 1, h);
      }
      pos.needsUpdate = true;
    }
    const cm = this.raceLines[0].mesh.material.map; cm.offset.x = this.raceLineScroll;
    this.updateBoostPads(dt, t);
    this.updateRamps(dt);
    // 금화 회전/재생성
    for (const c of this.coins) {
      if (!c.active) { c.timer -= dt; if (c.timer <= 0) { c.active = true; } else continue; }
      this._v.set(c.x, 2 + waveHeight(c.x, c.z, t) + Math.sin(t * 4 + c.x * 0.1) * 0.25, c.z);
      this._q.setFromAxisAngle(_Y, t * 3 + c.i * 0.4);
      this._m4.compose(this._v, this._q, this._s);
      this.coinMesh.setMatrixAt(c.i, this._m4);
    }
    this.coinMesh.instanceMatrix.needsUpdate = true;
    for (const c of this.chests) {
      if (!c.active) { c.timer -= dt; if (c.timer <= 0) { c.active = true; c.mesh.visible = true; } continue; }
      c.mesh.rotation.y += dt * 0.8;
      c.mesh.position.y = 1.5 + waveHeight(c.x, c.z, t) + Math.sin(t * 2.5 + c.x) * 0.3;
    }
    for (const s of this.scrolls) {
      if (!s.active) { s.timer -= dt; if (s.timer <= 0) { s.active = true; s.mesh.visible = true; } continue; }
      s.mesh.rotation.y += dt * 1.2;
      s.mesh.position.y = 2 + waveHeight(s.x, s.z, t) + Math.sin(t * 3 + s.z) * 0.3;
    }
    for (const v of this.verses) {
      if (!v.active) { v.timer -= dt; if (v.timer <= 0) { v.active = true; v.mesh.visible = true; } continue; }
      v.mesh.rotation.y += dt * 0.5;
      v.mesh.position.y = 2.1 + waveHeight(v.x, v.z, t) + Math.sin(t * 1.8 + v.x) * 0.25;
    }
    // 다리 위 스마트폰 플래시. 가까이 가면 더 자주 터진다.
    if (this.bridges.length) this._updateBridges(dt, t);
    for (const d of this.discoveries) {
      if (!d.active) { d.timer -= dt; if (d.timer <= 0) { d.active = true; d.mesh.visible = true; } continue; }
      d.orb.rotation.y += dt * 1.5; d.orb.rotation.x += dt * 0.7;
      d.mesh.position.y = 2.2 + waveHeight(d.x, d.z, t) + Math.sin(t * 2.2 + d.x) * 0.4;
      d.orb.scale.setScalar(1 + Math.sin(t * 4 + d.z) * 0.12);
    }
  }
  collectScroll(s) { s.active = false; s.mesh.visible = false; s.timer = 45; }
  updateBoostPads(dt, t) {
    for (const b of this.boostPads) {
      b.mat.map.offset.x -= dt * 1.6;
      const h = waveHeight(b.x, b.z, t);
      b.mesh.position.y = h + 0.6; b.ring.position.y = h + 0.55;
      b.ring.scale.setScalar(1 + Math.sin(t * 5) * 0.06);
    }
  }
  collectDiscovery(d) { d.active = false; d.mesh.visible = false; d.timer = 35; }

  collectPickup(p) { p.active = false; p.mesh.visible = false; p.timer = 9; }
  collectCoin(c) {
    c.active = false; c.timer = 14;
    this._m4.makeScale(0, 0, 0); this.coinMesh.setMatrixAt(c.i, this._m4); this.coinMesh.instanceMatrix.needsUpdate = true;
  }
  collectChest(c) { c.active = false; c.mesh.visible = false; c.timer = 40; }
}
const _Y = new THREE.Vector3(0, 1, 0);
const _ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

function makeChevronTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 32;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 64, 32);
  // 진행 방향(+u) 화살표
  ctx.fillStyle = 'rgba(120,220,255,0.95)';
  ctx.beginPath(); ctx.moveTo(8, 2); ctx.lineTo(30, 16); ctx.lineTo(8, 30); ctx.lineTo(20, 30); ctx.lineTo(42, 16); ctx.lineTo(20, 2); ctx.closePath(); ctx.fill();
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}
// 블랙홀 관문의 소용돌이 원반. 가운데로 빨려 드는 나선.
function makeSwirlTexture(bright, dark) {
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, S, S);
  const cx = S / 2, cy = S / 2;
  // 바깥은 어둡고 중심은 밝은 깔때기
  const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, S / 2);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.18, bright); g.addColorStop(0.72, dark); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, S / 2, 0, Math.PI * 2); ctx.fill();
  // 나선 팔 4개
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = bright; ctx.lineCap = 'round';
  for (let arm = 0; arm < 4; arm++) {
    ctx.beginPath();
    for (let i = 0; i <= 90; i++) {
      const tt = i / 90;
      const a = arm * Math.PI / 2 + tt * 4.2;
      const r = 6 + tt * (S / 2 - 12);
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.lineWidth = 7; ctx.globalAlpha = 0.55; ctx.stroke();
    ctx.lineWidth = 2.5; ctx.globalAlpha = 0.9; ctx.stroke();
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function makeRopeTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 8;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 64, 8);
  for (let x = 0; x < 64; x += 8) { ctx.fillStyle = (x / 8) % 2 ? '#e8dcc0' : '#8a6a48'; ctx.fillRect(x, 2, 8, 4); }
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping;
  return t;
}
function woodRampTexture() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#9a6a3a'; ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? 'rgba(0,0,0,0.12)' : 'rgba(255,220,160,0.1)'; ctx.fillRect(0, i * 16, 128, 16); ctx.fillStyle = '#4a3016'; ctx.fillRect(0, i * 16, 128, 1.5); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 3); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function makeDashTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 8;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 64, 8); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 40, 8);
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping;
  return t;
}

function makeCheckerTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 32;
  const ctx = c.getContext('2d');
  for (let x = 0; x < 16; x++) for (let y = 0; y < 2; y++) { ctx.fillStyle = (x + y) % 2 ? '#111' : '#fff'; ctx.fillRect(x * 16, y * 16, 16, 16); }
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.repeat.x = 2;
  return t;
}
function makeWhirlTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const ctx = c.getContext('2d');
  ctx.translate(128, 128);
  for (let arm = 0; arm < 3; arm++) {
    ctx.beginPath();
    for (let i = 0; i < 200; i++) {
      const t = i / 200, a = t * Math.PI * 5 + (arm / 3) * Math.PI * 2, r = t * 120;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(230,245,255,0.85)'; ctx.lineWidth = 7; ctx.stroke();
  }
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 128);
  g.addColorStop(0, 'rgba(10,30,60,0.9)'); g.addColorStop(0.5, 'rgba(20,60,100,0.5)'); g.addColorStop(1, 'rgba(20,60,100,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 128, 0, Math.PI * 2); ctx.fill();
  return new THREE.CanvasTexture(c);
}
