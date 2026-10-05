// 부캉이 — 이 맵의 주인공 동물.
//
// 상태머신: 숨어있음 → 접근(그림자) → 호기심 선회 → 나란히 헤엄 → 브리치 → 떠남
// 매 판 같은 자리에 나오면 재미가 없다. 아래 ZONES 안에서 무작위로 고르고,
// 등장 구간도 판마다 달라진다.
//
// 이 파일에는 부캉이를 해치는 길이 없다. 부딪히면 부캉이가 놀라 달아나고
// 플레이어는 조금 느려질 뿐이다. 그게 이 맵의 규칙이다.

import * as THREE from 'three';
import { waveHeight } from './ocean.js?v=20261005104532';
import { TRACK_HALF_WIDTH } from './track.js?v=20261005104532';

// 등장할 수 있는 항로 구간 (진행률). 수로 안과 입구 언저리.
const ZONES = [[0.18, 0.30], [0.42, 0.56], [0.64, 0.78]];

export const BOND_FULL = 1;          // 교감 게이지 최대
const BOND_RANGE = 44;               // 이 거리 안에서 나란히 달리면 찬다
const BOND_GAIN = 0.19;              // 초당
const BOND_LOSS = 0.42;              // 부딪혔을 때 깎이는 양
const COMPANION_TIME = 10;           // 동행 지속 (초)

// ---------- 모델 ----------
function sharkGroup() {
  const g = new THREE.Group();
  const skinTop = new THREE.MeshStandardMaterial({ color: 0x53657a, roughness: 0.6, metalness: 0.05 });
  const skinBelly = new THREE.MeshStandardMaterial({ color: 0xd8dfe6, roughness: 0.7 });

  // 몸통: 구를 늘여 어뢰꼴로
  const body = new THREE.SphereGeometry(1, 12, 9);
  const p = body.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const z = p.getZ(i);
    const squeeze = z < 0 ? 1 - Math.abs(z) * 0.55 : 1 - z * 0.25;
    p.setX(i, p.getX(i) * squeeze * 0.72);
    p.setY(i, p.getY(i) * squeeze * 0.80);
    p.setZ(i, z * 4.6);
  }
  body.computeVertexNormals();
  const hull = new THREE.Mesh(body, skinTop);
  g.add(hull);

  // 흰 배
  const belly = new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45);
  belly.scale(0.68, 0.74, 4.2);
  const bellyM = new THREE.Mesh(belly, skinBelly); bellyM.position.y = -0.08;
  g.add(bellyM);

  // 주둥이
  const snout = new THREE.ConeGeometry(0.62, 1.8, 7);
  snout.rotateX(-Math.PI / 2); snout.translate(0, -0.08, 5.0);
  g.add(new THREE.Mesh(snout, skinTop));

  // 등지느러미 — 수면을 가르는 그 지느러미
  const dorsalShape = new THREE.Shape();
  dorsalShape.moveTo(0, 0); dorsalShape.lineTo(-1.5, 0); dorsalShape.lineTo(-0.35, 2.1); dorsalShape.lineTo(0.55, 0.15);
  const dorsal = new THREE.ExtrudeGeometry(dorsalShape, { depth: 0.22, bevelEnabled: false });
  dorsal.rotateY(Math.PI / 2); dorsal.translate(-0.11, 0.62, 0.5);
  const fin = new THREE.Mesh(dorsal, skinTop);
  g.add(fin);
  g.userData.dorsal = fin;

  // 가슴지느러미 둘
  for (const s of [-1, 1]) {
    const pec = new THREE.ConeGeometry(0.42, 2.4, 3);
    pec.rotateZ(Math.PI / 2 * s); pec.rotateY(s * 0.5); pec.scale(1, 0.22, 1);
    pec.translate(s * 1.1, -0.3, 1.6);
    g.add(new THREE.Mesh(pec, skinTop));
  }

  // 꼬리: 따로 묶어서 좌우로 흔든다
  const tail = new THREE.Group();
  const upper = new THREE.ConeGeometry(0.5, 2.6, 3); upper.scale(0.3, 1, 1); upper.rotateX(0.5); upper.translate(0, 1.0, -0.6);
  const lower = new THREE.ConeGeometry(0.4, 1.6, 3); lower.scale(0.3, 1, 1); lower.rotateX(Math.PI - 0.4); lower.translate(0, -0.7, -0.4);
  tail.add(new THREE.Mesh(upper, skinTop), new THREE.Mesh(lower, skinTop));
  tail.position.z = -4.3;
  g.add(tail);
  g.userData.tail = tail;

  g.scale.setScalar(1.15);   // 3.5m 급이지만 레이싱 화면에서 보이려면 이 정도
  return g;
}

// 수면을 가르는 V자 항적
function wakeMesh() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  const grd = ctx.createLinearGradient(0, 0, 0, 128);
  grd.addColorStop(0, 'rgba(255,255,255,0.0)'); grd.addColorStop(1, 'rgba(255,255,255,0.75)');
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.moveTo(64, 0); ctx.lineTo(126, 128); ctx.lineTo(96, 128); ctx.lineTo(64, 26);
  ctx.lineTo(32, 128); ctx.lineTo(2, 128); ctx.closePath(); ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  const geo = new THREE.PlaneGeometry(14, 22); geo.rotateX(-Math.PI / 2); geo.translate(0, 0, -11);
  return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.0, depthWrite: false }));
}

export class Bukhang {
  constructor(scene, track) {
    this.scene = scene; this.track = track;
    this.mesh = sharkGroup();
    this.mesh.visible = false;
    scene.add(this.mesh);
    this.wake = wakeMesh();
    this.wake.visible = false;
    scene.add(this.wake);

    // 수면 아래 그림자 (멀리서는 이것만 보인다)
    const shGeo = new THREE.PlaneGeometry(13, 5); shGeo.rotateX(-Math.PI / 2);
    this.shadow = new THREE.Mesh(shGeo, new THREE.MeshBasicMaterial({ color: 0x0a1a28, transparent: true, opacity: 0.0, depthWrite: false }));
    this.shadow.visible = false;
    scene.add(this.shadow);

    this.reset();
  }

  reset(firstTime = true) {
    const T = this.track;
    const [a, b] = ZONES[Math.floor(Math.random() * ZONES.length)];
    const u = a + Math.random() * (b - a);
    this.idx = Math.floor(u * T.sampleCount);
    this.lane = Math.random() < 0.5 ? -0.75 : 0.75;
    this.state = 'hidden';
    this.t = 0;
    this.timer = firstTime ? 10 + Math.random() * 14 : 22 + Math.random() * 20;
    this.bond = 0;
    this.companion = 0;
    this.firstTime = firstTime;
    this.introStep = 0;
    this.seen = false;
    this.depth = -7;
    this.x = 0; this.z = 0; this.y = -7;
    this.mesh.visible = false; this.wake.visible = false; this.shadow.visible = false;
    this.cine = null;          // main.js 가 읽는 연출 신호
    this.spooked = 0;
  }

  // 부딪혔다. 벌은 가볍게, 부캉이는 놀라 달아난다.
  startle() {
    if (this.state === 'hidden' || this.state === 'gone') return false;
    this.bond = Math.max(0, this.bond - BOND_LOSS);
    this.spooked = 1.6;
    return true;
  }

  get visibleNow() { return this.state !== 'hidden' && this.state !== 'gone'; }
  get companionActive() { return this.companion > 0; }

  // api: { event(text,dur), title(name,caption), shake(v), sound(kind), cinematics:boolean }
  update(dt, t, player, api) {
    this.t += dt;
    const T = this.track;
    const step = T.totalLength / T.sampleCount;
    if (this.companion > 0) this.companion = Math.max(0, this.companion - dt);
    if (this.spooked > 0) this.spooked -= dt;

    switch (this.state) {
      case 'hidden': {
        this.timer -= dt;
        if (this.timer <= 0) {
          // 플레이어보다 앞쪽에 자리를 잡고 접근을 시작한다
          this.idx = Math.round(player.curveIdx + 70 + Math.random() * 60);
          this.lane = Math.random() < 0.5 ? -0.8 : 0.8;
          this.state = 'omen'; this.t = 0;
          if (this.firstTime && api.cinematics) { api.event('⚠ 수면 아래 무언가 있다…', 3200); api.sound('omen'); }
        }
        break;
      }
      case 'omen': {   // 전조: 아직 안 보인다. 갈매기와 정어리가 먼저 반응한다(main.js)
        this.depth = -9;
        if (this.t > (this.firstTime ? 2.6 : 0.8)) { this.state = 'shadow'; this.t = 0; }
        break;
      }
      case 'shadow': { // 그림자가 배 뒤에서 앞으로 천천히 지나간다
        this.idx += 17 * dt / step;
        this.depth = THREE.MathUtils.lerp(this.depth, -4.2, dt * 0.8);
        if (this.t > (this.firstTime ? 4.2 : 1.6)) { this.state = 'circle'; this.t = 0; }
        break;
      }
      case 'circle': { // 호기심 선회: 배 주위를 한 바퀴 돈다. 등지느러미가 수면을 가른다.
        const target = player.curveIdx + Math.cos(this.t * 1.1) * 26;
        this.idx += (target - this.idx) * Math.min(1, dt * 1.4);
        this.lane = Math.sin(this.t * 1.1) * 0.95;
        this.depth = THREE.MathUtils.lerp(this.depth, -0.35, dt * 1.6);
        if (this.firstTime && api.cinematics) api.fov(this.t < 2 ? -3.5 : 0);
        if (this.t > (this.firstTime ? 5.4 : 2.6)) { this.state = 'breach'; this.t = 0; api.sound('breach'); }
        break;
      }
      case 'breach': { // 솟아올랐다 착수. 정체 공개.
        this.idx += 22 * dt / step;
        this.lane += (0.55 * Math.sign(this.lane || 1) - this.lane) * dt * 2;
        const u = Math.min(1, this.t / 1.5);
        this.depth = -0.3 + Math.sin(u * Math.PI) * 5.2;
        if (!this.seen && this.t > 0.45) {
          this.seen = true;
          if (api.cinematics) { api.title('🦈 부캉이 등장!', '무태상어 · 3.5m'); api.shake(0.35); }
          api.met();
        }
        if (this.t > 1.9) { this.state = 'beside'; this.t = 0; this.timer = 26 + Math.random() * 16; }
        break;
      }
      case 'beside': { // 나란히 헤엄. 여기서 교감 게이지가 찬다.
        const want = player.curveIdx + 6;
        this.idx += (want - this.idx) * Math.min(1, dt * 2.2);
        const side = Math.sign(this.lane || 1);
        const goal = this.spooked > 0 ? side * 1.9 : side * 0.5;
        this.lane += (goal - this.lane) * Math.min(1, dt * 1.5);
        this.depth = THREE.MathUtils.lerp(this.depth, this.spooked > 0 ? -2.4 : -0.3, dt * 2);
        this.timer -= dt;
        if (this.timer <= 0) { this.state = 'leaving'; this.t = 0; }
        break;
      }
      case 'leaving': {
        this.idx += 34 * dt / step;
        this.lane += Math.sign(this.lane || 1) * dt * 0.8;
        this.depth = THREE.MathUtils.lerp(this.depth, -8, dt * 0.7);
        if (this.t > 5) { this.reset(false); this.firstTime = false; }
        break;
      }
    }

    // ---------- 위치와 자세 ----------
    const i = Math.round(this.idx);
    const p = T.pointAt(i), n = T.normalAt(i), tg = T.tangentAt(i);
    this.x = p.x + n.x * this.lane * TRACK_HALF_WIDTH;
    this.z = p.z + n.z * this.lane * TRACK_HALF_WIDTH;
    const surf = waveHeight(this.x, this.z, t);
    this.y = surf + this.depth;
    const heading = Math.atan2(tg.x, tg.z);

    const show = this.visibleNow;
    this.mesh.visible = show;
    if (show) {
      this.mesh.position.set(this.x, this.y, this.z);
      this.mesh.rotation.set(this.state === 'breach' ? Math.cos(Math.min(1, this.t / 1.5) * Math.PI) * 0.55 : Math.sin(t * 1.2) * 0.05, heading, Math.sin(t * 1.6) * 0.09);
      // 꼬리 흔들기 — 빠를수록 세게
      const wag = this.spooked > 0 ? 7 : 3.4;
      this.mesh.userData.tail.rotation.y = Math.sin(t * wag) * 0.5;
      // 깊을수록 흐리게, 가까울수록 선명하게
      const near = 1 - Math.min(1, Math.max(0, (-this.depth - 0.4) / 7));
      this.mesh.traverse((o) => { if (o.material) { o.material.transparent = near < 0.98; o.material.opacity = 0.25 + near * 0.75; } });
    }

    // 그림자: 수면 아래에 있을 때만
    const underwater = this.depth < -0.6 && show;
    this.shadow.visible = underwater;
    if (underwater) {
      this.shadow.position.set(this.x, surf + 0.15, this.z);
      this.shadow.rotation.y = heading;
      this.shadow.material.opacity = 0.42 * Math.min(1, Math.max(0, (-this.depth) / 5)) * Math.min(1, (-this.depth > 7 ? 0 : 1));
      this.shadow.scale.setScalar(1 + Math.max(0, -this.depth) * 0.08);
    }

    // V자 항적: 등지느러미가 수면을 가를 때만
    const cutting = show && this.depth > -0.9 && this.depth < 0.6;
    this.wake.visible = cutting;
    if (cutting) {
      this.wake.position.set(this.x, surf + 0.25, this.z);
      this.wake.rotation.y = heading;
      this.wake.material.opacity = 0.55;
    }

    // ---------- 교감 ----------
    const d = Math.hypot(this.x - player.pos.x, this.z - player.pos.z);
    this.close = show && this.depth > -2.5 && d < BOND_RANGE;
    if (this.close && this.spooked <= 0 && this.state === 'beside') {
      this.bond = Math.min(BOND_FULL, this.bond + BOND_GAIN * dt);
      if (this.bond >= BOND_FULL && this.companion <= 0) {
        this.companion = COMPANION_TIME;
        this.bond = 0;
        api.companion();
      }
    } else if (this.bond > 0 && !this.close) {
      this.bond = Math.max(0, this.bond - dt * 0.07);
    }
    return this.close;
  }

  dispose() {
    for (const m of [this.mesh, this.wake, this.shadow]) {
      this.scene.remove(m);
      m.traverse?.((o) => { o.geometry?.dispose(); o.material?.dispose(); });
      m.geometry?.dispose(); m.material?.dispose();
    }
  }
}
