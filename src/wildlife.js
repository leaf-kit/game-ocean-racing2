// 부캉이의 바다에 사는 동물들.
//
// 설계 원칙 셋.
//  1. 동물을 해치는 길은 만들지 않는다. 포격은 이 맵에서 동물에 닿지 않고(main.js),
//     부딪혀도 벌은 가볍고 동물이 놀라 달아날 뿐이다.
//  2. 종마다 게임플레이 역할이 다르다. 구경거리만 하는 종은 갈매기 하나뿐이다.
//  3. 전부 인스턴싱 + 거리 컬링. 상한은 아래 LIMITS 로 한 자리에서 조절한다.
//
// 좌표는 항로 곡선을 따라 돈다(idx = 곡선 샘플 번호, lane = 좌우 치우침).
// 그래야 플레이어 근처에만 동물이 있고, 먼 바다에 낭비되는 개체가 없다.

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { waveHeight } from './ocean.js?v=20261005104532';
import { TRACK_HALF_WIDTH } from './track.js?v=20261005104532';

// ---------- 성능 상한 (여기만 고치면 전체가 바뀐다) ----------
export const LIMITS = {
  porpoise: 14,   // 상괭이 — 떼로 다닌다
  dolphin: 6,     // 남방큰돌고래
  turtle: 7,      // 바다거북
  manta: 10,      // 만타가오리
  sardine: 160,   // 정어리 (작은 조각이라 많아도 싸다)
  jelly: 18,      // 노무라입깃해파리
  drawDist: 420,  // 이 거리 밖의 개체는 행렬 갱신도 하지 않는다
  lodDist: 220,   // 이 거리 밖은 꼬리 흔들기 같은 미세 동작을 끈다
};

// ---------- 도감 ----------
// 짧고, 확인된 것만. 확신이 없으면 쓰지 않는다.
export const ANIMALS = {
  bukhang: {
    emoji: '🦈', name: '부캉이', en: 'Bukhang', species: '무태상어 · 3.5m',
    text: '2026년 가을 부산 북항 친수공원 수로에 들어와 머문 상어. 시민들이 "부캉이"라는 이름을 붙였고 부산시 명예 홍보대사로 위촉했다. 무태상어는 바닷물뿐 아니라 하구와 기수, 민물에서도 발견되는 것으로 알려져 있다. 수로 안까지 들어올 수 있었던 까닭이다. 이 사건은 현재진행형이다.',
    textEn: 'A shark that entered the waterway of the Bukhang waterfront park in Busan in the autumn of 2026 and stayed. Citizens named it "Bukhang" and the city made it an honorary ambassador. Bull sharks are known to be found in estuaries, brackish water and fresh water as well as the sea, which is how one could swim this far up a canal. The story is still unfolding.',
  },
  porpoise: {
    emoji: '🐬', name: '상괭이', en: 'Finless porpoise', species: '한국 연안의 토종 쇠돌고래',
    text: '한국 연안에 사는 작은 토종 고래류다. 등지느러미가 없어 물 위로 드러나는 선이 매끈하다.',
    textEn: 'A small cetacean native to Korean coastal waters. It has no dorsal fin, so its back breaks the surface as a smooth line.',
  },
  dolphin: {
    emoji: '🐬', name: '남방큰돌고래', en: 'Indo-Pacific bottlenose dolphin', species: '제주 연안에 사는 돌고래',
    text: '제주 연안에 무리를 이루어 사는 돌고래. 배 옆에서 뱃머리 파도를 타는 습성이 있다.',
    textEn: 'Dolphins that live in pods off Jeju. They are known for riding the bow waves of boats.',
  },
  turtle: {
    emoji: '🐢', name: '바다거북', en: 'Sea turtle', species: '느리게 떠다니는 손님',
    text: '한국 바다에서도 관찰되는 바다거북. 숨을 쉬러 수면으로 올라왔다가 다시 천천히 내려간다.',
    textEn: 'Sea turtles are seen in Korean waters too. They surface for air, then sink slowly back down.',
  },
  manta: {
    emoji: '🪽', name: '만타가오리', en: 'Manta ray', species: '수면 아래를 활공한다',
    text: '넓은 가슴지느러미를 날개처럼 움직여 활공하듯 헤엄친다. 여럿이 줄지어 도는 모습이 군무처럼 보인다.',
    textEn: 'It beats its broad pectoral fins like wings and glides rather than swims. A line of them circling looks like a dance.',
  },
  sardine: {
    emoji: '🐟', name: '정어리 떼', en: 'Sardine shoal', species: '수면을 끓게 만든다',
    text: '수만 마리가 한 덩어리처럼 방향을 바꾼다. 떼가 몰리면 수면이 바글바글 끓는 것처럼 보인다.',
    textEn: 'Tens of thousands turn as one body. When a shoal balls up, the surface looks like it is boiling.',
  },
  jelly: {
    emoji: '🪼', name: '노무라입깃해파리', en: 'Nomura\'s jellyfish', species: '대형 해파리',
    text: '여름과 가을 한국 연안에 나타나는 대형 해파리. 쏘이면 아프고 어망을 망가뜨려 어민에게 피해를 준다.',
    textEn: 'A giant jellyfish that appears off Korea in summer and autumn. Its sting hurts, and it ruins fishing nets.',
  },
  gull: {
    emoji: '🕊', name: '갈매기', en: 'Seagull', species: '부산의 새',
    text: '부산의 시조(市鳥)다. 다리 난간과 크레인 위에 앉아 있다가 배가 지나면 한꺼번에 날아오른다.',
    textEn: 'The city bird of Busan. They perch on bridge rails and cranes, then lift off together as a boat passes.',
  },
  graywhale: {
    emoji: '🐋', name: '귀신고래', en: 'Gray whale', species: '울산 앞바다의 전설',
    text: '한국 연안을 지나던 고래. 1962년 "울산 극경 회유해면"이 천연기념물로 지정됐으나, 그 뒤 한국 해역에서 확인된 목격 기록은 거의 없다.',
    textEn: 'A whale that once migrated along the Korean coast. The waters off Ulsan were designated a natural monument in 1962, but there have been almost no confirmed sightings in Korean waters since.',
  },
};

// ---------- 몸체 만들기 (전부 코드 생성) ----------
function torpedo(len, rad, tail = 0.45) {
  // 돌고래류 몸통: 구를 늘여 어뢰꼴로 만들고 꼬리 쪽을 좁힌다
  const g = new THREE.SphereGeometry(rad, 10, 8);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const z = p.getZ(i) / rad;              // -1 .. 1
    const squeeze = z < 0 ? 1 - Math.abs(z) * tail : 1 - z * 0.15;
    p.setX(i, p.getX(i) * squeeze);
    p.setY(i, p.getY(i) * squeeze * 0.85);
    p.setZ(i, z * len * 0.5);
  }
  g.computeVertexNormals();
  return g;
}
function fluke(w, h) {
  const g = new THREE.ConeGeometry(w, h, 3);
  g.rotateX(Math.PI / 2);
  return g;
}

function porpoiseGeo() {
  // 상괭이: 등지느러미가 없다. 그게 이 동물의 생김새다.
  const body = torpedo(5.2, 1.0);
  const tail = fluke(1.5, 1.2); tail.translate(0, 0, -2.9);
  return mergeGeometries([body, tail]);
}
function dolphinGeo() {
  const body = torpedo(6.4, 1.1);
  const dorsal = new THREE.ConeGeometry(0.55, 1.5, 4); dorsal.translate(0, 1.0, 0.1);
  const tail = fluke(1.9, 1.4); tail.translate(0, 0, -3.6);
  const beak = new THREE.ConeGeometry(0.45, 1.3, 6); beak.rotateX(-Math.PI / 2); beak.translate(0, -0.1, 3.4);
  return mergeGeometries([body, dorsal, tail, beak]);
}
function turtleGeo() {
  const shell = new THREE.SphereGeometry(2.0, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  shell.scale(1, 0.5, 1.25);
  const belly = new THREE.CylinderGeometry(1.9, 1.9, 0.4, 10); belly.translate(0, -0.1, 0);
  const head = new THREE.SphereGeometry(0.6, 8, 6); head.translate(0, 0.1, 2.6);
  const parts = [shell, belly, head];
  for (const [sx, sz, rot] of [[-1, 1, 0.5], [1, 1, -0.5], [-1, -1, 1.0], [1, -1, -1.0]]) {
    const f = new THREE.ConeGeometry(0.5, 2.4, 4);
    f.rotateZ(Math.PI / 2 * sx); f.rotateY(rot);
    f.translate(sx * 2.0, 0, sz * 1.1);
    parts.push(f);
  }
  return mergeGeometries(parts);
}
function mantaGeo() {
  // 넓은 마름모 날개 + 가는 꼬리. 삼각형을 직접 엮는다.
  const v = [], idx = [];
  const W = 5.2, L = 4.0;
  v.push(0, 0, L * 0.55);        // 0 머리
  v.push(-W, 0, 0); v.push(W, 0, 0);  // 1,2 날개 끝
  v.push(-W * 0.35, 0.5, 0); v.push(W * 0.35, 0.5, 0); // 3,4 등
  v.push(0, 0, -L * 0.5);        // 5 꼬리 밑동
  v.push(0, 0, -L * 1.6);        // 6 꼬리 끝
  idx.push(0, 3, 1, 0, 2, 4, 0, 4, 3, 3, 5, 1, 4, 2, 5, 3, 4, 5, 5, 6, 5);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array((v.length / 3) * 2).fill(0.5), 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
function jellyGeo() {
  const bell = new THREE.SphereGeometry(2.2, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55);
  bell.scale(1, 1.1, 1);
  const parts = [bell];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const t = new THREE.CylinderGeometry(0.18, 0.05, 4.5, 4);
    t.translate(Math.cos(a) * 1.3, -2.4, Math.sin(a) * 1.3);
    parts.push(t);
  }
  return mergeGeometries(parts);
}
function sardineGeo() {
  const g = new THREE.ConeGeometry(0.22, 1.1, 4);
  g.rotateX(-Math.PI / 2);
  return g;
}

// ---------- 무리 하나 ----------
class Pod {
  constructor(kind, mesh, count) {
    this.kind = kind; this.mesh = mesh; this.items = [];
    this.count = count;
  }
}

export class Wildlife {
  // track: Track, canal: [시작 진행률, 끝 진행률] — 수로 구간
  constructor(scene, track, canal = [0.4, 0.72]) {
    this.scene = scene; this.track = track; this.canal = canal;
    this.t = 0;
    this.pods = {};
    this.met = new Set();     // 이번 항해에서 만난 종
    this._m = new THREE.Matrix4();
    this._q = new THREE.Quaternion();
    this._v = new THREE.Vector3();
    this._s = new THREE.Vector3(1, 1, 1);
    this._e = new THREE.Euler();

    const mk = (kind, geo, mat, n) => {
      const mesh = new THREE.InstancedMesh(geo, mat, n);
      mesh.frustumCulled = false;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(mesh);
      const pod = new Pod(kind, mesh, n);
      this.pods[kind] = pod;
      return pod;
    };

    const skin = (c, opts = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0.05, ...opts });

    this._build(mk, skin);
  }

  _build(mk, skin) {
    const T = this.track, N = T.sampleCount;
    const at = (u) => Math.floor(((u % 1) + 1) % 1 * N);

    // 상괭이 — 길잡이. 수로 입구 쪽에 두 떼.
    const porp = mk('porpoise', porpoiseGeo(), skin(0x9fb4c0), LIMITS.porpoise);
    [0.30, 0.52].forEach((u, p) => {
      for (let i = 0; i < 7; i++) {
        porp.items.push({
          idx: at(u) + i * 5, lane: ((i % 2 ? 1 : -1) * (0.25 + (i % 3) * 0.12)), y: 0.2,
          phase: i * 0.7, podId: p, speed: 11, lead: i === 0,
        });
      }
    });

    // 남방큰돌고래 — 점프 보너스. 점프대 근처에 붙인다.
    const dol = mk('dolphin', dolphinGeo(), skin(0x6d8494), LIMITS.dolphin);
    const rampIdx = T.ramps.map((r) => T.distToCurve(r.x, r.z).idx);
    for (let i = 0; i < LIMITS.dolphin; i++) {
      const base = rampIdx.length ? rampIdx[i % rampIdx.length] : at(0.2 + i * 0.15);
      dol.items.push({ idx: base - 26 + (i % 2) * 10, lane: i % 2 ? 0.62 : -0.62, y: 0.1, phase: i * 1.3, speed: 15, jumpT: i * 0.8 });
    }

    // 바다거북 — 느린 장애물 + 보너스. 등딱지 위 금화는 main.js 가 준다.
    const tur = mk('turtle', turtleGeo(), skin(0x4e7a4a), LIMITS.turtle);
    for (let i = 0; i < LIMITS.turtle; i++) {
      tur.items.push({ idx: at(0.08 + i * 0.13), lane: (i % 3 - 1) * 0.42, y: 0.3, phase: i * 2.1, speed: 2.2, r: 4.5, dive: 0 });
    }

    // 만타가오리 — 수면 아래 군무. 위를 지나면 발견 구슬.
    const man = mk('manta', mantaGeo(), skin(0x2b3f55, { transparent: true, opacity: 0.85, side: THREE.DoubleSide }), LIMITS.manta);
    [0.16, 0.63].forEach((u, p) => {
      for (let i = 0; i < 5; i++) {
        man.items.push({ idx: at(u) + i * 9, lane: (i - 2) * 0.22, y: -3.2 - (i % 2) * 1.2, phase: i * 1.1, podId: p, speed: 7, r: 9 });
      }
    });

    // 정어리 떼 — 부캉이를 끌고 다니는 미끼. 한 덩어리로 움직인다.
    const sar = mk('sardine', sardineGeo(), skin(0xc9d6e2, { emissive: 0x2a3b4a, emissiveIntensity: 0.25 }), LIMITS.sardine);
    this.shoal = { idx: at(0.44), lane: 0, spread: 7, scatter: 0, towed: false };
    for (let i = 0; i < LIMITS.sardine; i++) {
      const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random());
      sar.items.push({ ox: Math.cos(a) * d, oz: Math.sin(a) * d, oy: Math.random(), phase: Math.random() * 6.28 });
    }

    // 노무라입깃해파리 — 이 맵의 위협. 수로 안쪽에 군집.
    const jel = mk('jelly', jellyGeo(), skin(0xe6b9c8, { transparent: true, opacity: 0.72, emissive: 0x7a3550, emissiveIntensity: 0.25 }), LIMITS.jelly);
    const [c0, c1] = this.canal;
    for (let i = 0; i < LIMITS.jelly; i++) {
      const u = c0 + ((i + 0.5) / LIMITS.jelly) * (c1 - c0);
      jel.items.push({ idx: at(u), lane: ((i * 0.37) % 1 - 0.5) * 1.5, y: -0.6, phase: i * 0.9, speed: 0.6, r: 6 });
    }

    // 귀신고래 — 아주 낮은 확률의 이스터에그. 한 마리만, 외해 멀리.
    const whaleGeo = torpedo(46, 7.5, 0.6);
    this.whale = new THREE.Mesh(whaleGeo, new THREE.MeshStandardMaterial({ color: 0x33414e, roughness: 0.9, transparent: true, opacity: 0.55 }));
    this.whale.visible = false;
    this.scene.add(this.whale);
    this.whaleState = { on: false, t: 0, timer: 35 + Math.random() * 60 };

    for (const k in this.pods) this.pods[k].mesh.count = this.pods[k].items.length;
  }

  // ---------- 갱신 ----------
  update(dt, t, player) {
    this.t = t;
    const px = player ? player.pos.x : 0, pz = player ? player.pos.z : 0;
    this._porpoise(dt, t, px, pz, player);
    this._dolphin(dt, t, px, pz);
    this._turtle(dt, t, px, pz);
    this._manta(dt, t, px, pz);
    this._sardine(dt, t, px, pz);
    this._jelly(dt, t, px, pz);
    this._whale(dt, t, player);
  }

  // 항로 좌표 → 월드 좌표
  _place(it, out) {
    const T = this.track;
    const p = T.pointAt(Math.round(it.idx)), n = T.normalAt(Math.round(it.idx));
    out.set(p.x + n.x * it.lane * TRACK_HALF_WIDTH, 0, p.z + n.z * it.lane * TRACK_HALF_WIDTH);
    return out;
  }
  _heading(idx) { const tg = this.track.tangentAt(Math.round(idx)); return Math.atan2(tg.x, tg.z); }
  _far(x, z, px, pz) { const dx = x - px, dz = z - pz; return dx * dx + dz * dz > LIMITS.drawDist * LIMITS.drawDist; }

  _set(mesh, i, x, y, z, ry, rx = 0, rz = 0, s = 1) {
    this._e.set(rx, ry, rz); this._q.setFromEuler(this._e);
    this._v.set(x, y, z); this._s.setScalar(s);
    this._m.compose(this._v, this._q, this._s);
    mesh.setMatrixAt(i, this._m);
  }
  _hide(mesh, i) { this._m.makeScale(0, 0, 0); mesh.setMatrixAt(i, this._m); }

  _porpoise(dt, t, px, pz, player) {
    const pod = this.pods.porpoise, T = this.track, v = new THREE.Vector3();
    // 떼마다 선두가 있고 나머지는 선두를 따른다. 플레이어가 가까우면 뱃머리 앞을 내준다.
    const leadIdx = {};
    for (const it of pod.items) if (it.lead) leadIdx[it.podId] = it.idx;
    let guiding = false;
    for (let i = 0; i < pod.items.length; i++) {
      const it = pod.items[i];
      const near = player && Math.hypot(this._place(it, v).x - px, v.z - pz) < 90;
      it.idx += (it.speed * (near ? 1.5 : 1)) * dt / (T.totalLength / T.sampleCount);
      this._place(it, v);
      if (this._far(v.x, v.z, px, pz)) { this._hide(pod.mesh, i); continue; }
      if (near) { guiding = true; this.met.add('porpoise'); }
      const bob = Math.sin(t * 2.6 + it.phase) * 0.45;
      const y = waveHeight(v.x, v.z, t) + it.y + bob;
      const roll = Math.sin(t * 3.2 + it.phase) * 0.18;
      this._set(pod.mesh, i, v.x, y, v.z, this._heading(it.idx), roll * 0.4, roll);
    }
    pod.mesh.instanceMatrix.needsUpdate = true;
    this.guiding = guiding;   // main.js 가 순풍 보너스에 쓴다
  }

  _dolphin(dt, t, px, pz) {
    const pod = this.pods.dolphin, T = this.track, v = new THREE.Vector3();
    const step = T.totalLength / T.sampleCount;
    this.jumpingDolphin = null;
    for (let i = 0; i < pod.items.length; i++) {
      const it = pod.items[i];
      it.idx += it.speed * dt / step;
      it.jumpT += dt;
      const cycle = 4.2;
      const u = (it.jumpT % cycle) / cycle;           // 0~1, 앞쪽 0.4 구간이 도약
      const air = u < 0.4 ? Math.sin((u / 0.4) * Math.PI) : 0;
      this._place(it, v);
      if (this._far(v.x, v.z, px, pz)) { this._hide(pod.mesh, i); continue; }
      if (Math.hypot(v.x - px, v.z - pz) < 70) this.met.add('dolphin');
      const y = waveHeight(v.x, v.z, t) + it.y + air * 6.5;
      const pitch = air > 0 ? (u < 0.2 ? -0.7 : 0.7) * air : Math.sin(t * 3 + it.phase) * 0.12;
      this._set(pod.mesh, i, v.x, y, v.z, this._heading(it.idx), pitch);
      if (air > 0.75 && Math.hypot(v.x - px, v.z - pz) < 60) this.jumpingDolphin = { x: v.x, z: v.z, y };
    }
    pod.mesh.instanceMatrix.needsUpdate = true;
  }

  _turtle(dt, t, px, pz) {
    const pod = this.pods.turtle, T = this.track, v = new THREE.Vector3();
    const step = T.totalLength / T.sampleCount;
    for (let i = 0; i < pod.items.length; i++) {
      const it = pod.items[i];
      it.idx += it.speed * dt / step;
      it.lane += Math.sin(t * 0.3 + it.phase) * dt * 0.04;
      this._place(it, v);
      it.x = v.x; it.z = v.z;
      if (this._far(v.x, v.z, px, pz)) { this._hide(pod.mesh, i); continue; }
      if (Math.hypot(v.x - px, v.z - pz) < 60) this.met.add('turtle');
      // 숨을 쉬러 떠올랐다 천천히 내려간다
      const breathe = Math.sin(t * 0.55 + it.phase);
      const y = waveHeight(v.x, v.z, t) + it.y + breathe * 0.7 - 0.4;
      it.y3 = y;
      this._set(pod.mesh, i, v.x, y, v.z, this._heading(it.idx), Math.sin(t * 1.1 + it.phase) * 0.1);
    }
    pod.mesh.instanceMatrix.needsUpdate = true;
  }

  _manta(dt, t, px, pz) {
    const pod = this.pods.manta, T = this.track, v = new THREE.Vector3();
    const step = T.totalLength / T.sampleCount;
    for (let i = 0; i < pod.items.length; i++) {
      const it = pod.items[i];
      it.idx += it.speed * dt / step;
      it.lane = Math.sin(t * 0.35 + it.phase) * 0.45;   // 군무하듯 좌우로 크게 돈다
      this._place(it, v);
      it.x = v.x; it.z = v.z;
      if (this._far(v.x, v.z, px, pz)) { this._hide(pod.mesh, i); continue; }
      if (Math.hypot(v.x - px, v.z - pz) < 70) this.met.add('manta');
      const flap = Math.sin(t * 1.8 + it.phase);
      const y = waveHeight(v.x, v.z, t) + it.y + flap * 0.5;
      it.y3 = y;
      this._set(pod.mesh, i, v.x, y, v.z, this._heading(it.idx), 0, flap * 0.35);
    }
    pod.mesh.instanceMatrix.needsUpdate = true;
  }

  // 정어리 떼: 한 덩어리로 항로를 따라 흐르고, 배가 지나면 갈라졌다 다시 모인다.
  _sardine(dt, t, px, pz) {
    const pod = this.pods.sardine, T = this.track, v = new THREE.Vector3();
    const step = T.totalLength / T.sampleCount;
    const sh = this.shoal;
    sh.idx += (sh.towed ? 9 : 4) * dt / step;
    this._place(sh, v);
    sh.x = v.x; sh.z = v.z;
    const d = Math.hypot(v.x - px, v.z - pz);
    if (d < 70) this.met.add('sardine');
    // 배가 뚫고 지나가면 흩어진다
    sh.scatter = Math.max(0, sh.scatter - dt * 0.8);
    if (d < 26) sh.scatter = 1;
    const spread = sh.spread * (1 + sh.scatter * 2.2);
    if (this._far(v.x, v.z, px, pz)) {
      for (let i = 0; i < pod.items.length; i++) this._hide(pod.mesh, i);
      pod.mesh.instanceMatrix.needsUpdate = true;
      return;
    }
    const base = waveHeight(v.x, v.z, t);
    const head = this._heading(sh.idx);
    for (let i = 0; i < pod.items.length; i++) {
      const it = pod.items[i];
      const wob = Math.sin(t * 5 + it.phase) * 0.35;
      const x = v.x + it.ox * spread + wob;
      const z = v.z + it.oz * spread + Math.cos(t * 4 + it.phase) * 0.35;
      const y = base + 0.1 - it.oy * 1.6 + Math.sin(t * 6 + it.phase) * 0.12;
      this._set(pod.mesh, i, x, y, z, head + Math.sin(t * 3 + it.phase) * 0.5);
    }
    pod.mesh.instanceMatrix.needsUpdate = true;
  }

  _jelly(dt, t, px, pz) {
    const pod = this.pods.jelly, T = this.track, v = new THREE.Vector3();
    const step = T.totalLength / T.sampleCount;
    for (let i = 0; i < pod.items.length; i++) {
      const it = pod.items[i];
      it.idx += it.speed * dt / step;
      this._place(it, v);
      it.x = v.x; it.z = v.z;
      if (this._far(v.x, v.z, px, pz)) { this._hide(pod.mesh, i); continue; }
      if (Math.hypot(v.x - px, v.z - pz) < 60) this.met.add('jelly');
      // 맥동: 종이 오므라들었다 펴지며 위아래로 떠다닌다
      const pulse = Math.sin(t * 1.4 + it.phase);
      const y = waveHeight(v.x, v.z, t) + it.y + pulse * 0.6;
      it.y3 = y;
      this._set(pod.mesh, i, v.x, y, v.z, 0, 0, 0, 1 + pulse * 0.1);
    }
    pod.mesh.instanceMatrix.needsUpdate = true;
  }

  // 귀신고래: 아주 낮은 확률로 외해 멀리를 지나간다. 지나가면 도감에 남는다.
  _whale(dt, t, player) {
    const w = this.whaleState;
    if (!w.on) {
      w.timer -= dt;
      if (w.timer > 0 || !player) return;
      w.timer = 90 + Math.random() * 120;
      if (Math.random() > 0.12) return;               // 12%
      const T = this.track;
      const idx = Math.round(player.curveIdx + 120);
      const p = T.pointAt(idx), n = T.normalAt(idx);
      const side = Math.random() < 0.5 ? -1 : 1;
      w.on = true; w.t = 0;
      w.sx = p.x + n.x * side * 260; w.sz = p.z + n.z * side * 260;
      w.dir = this._heading(idx) + (Math.random() - 0.5) * 0.6;
      this.whale.visible = true;
      this.whaleSighted = true;                        // main.js 가 한 번 읽고 지운다
      return;
    }
    w.t += dt;
    const spd = 16;
    w.sx += Math.sin(w.dir) * spd * dt; w.sz += Math.cos(w.dir) * spd * dt;
    const y = waveHeight(w.sx, w.sz, t) - 5 + Math.sin(w.t * 0.5) * 2.5;
    this.whale.position.set(w.sx, y, w.sz);
    this.whale.rotation.set(Math.sin(w.t * 0.4) * 0.06, w.dir, Math.sin(w.t * 0.3) * 0.05);
    if (w.t > 26) { w.on = false; this.whale.visible = false; }
  }

  // ---------- 질의 (main.js 가 쓴다) ----------
  // 플레이어와 겹친 해파리 하나를 돌려준다
  hitJelly(x, z) {
    for (const it of this.pods.jelly.items) {
      if (it.x === undefined) continue;
      if ((it.x - x) ** 2 + (it.z - z) ** 2 < it.r * it.r) return it;
    }
    return null;
  }
  // 거북 근처를 스치면 {turtle, grazed} — 부딪힌 게 아니라 '피해서 지나감'을 본다
  nearTurtle(x, z) {
    for (const it of this.pods.turtle.items) {
      if (it.x === undefined) continue;
      const d2 = (it.x - x) ** 2 + (it.z - z) ** 2;
      if (d2 < it.r * it.r) return { it, hit: true };
      if (d2 < 18 * 18) return { it, hit: false };
    }
    return null;
  }
  overManta(x, z) {
    for (const it of this.pods.manta.items) {
      if (it.x === undefined || it.taken) continue;
      if ((it.x - x) ** 2 + (it.z - z) ** 2 < it.r * it.r) return it;
    }
    return null;
  }
  shoalPos() { return this.shoal; }

  dispose() {
    for (const k in this.pods) {
      const m = this.pods[k].mesh;
      this.scene.remove(m); m.geometry.dispose(); m.material.dispose();
    }
    this.scene.remove(this.whale); this.whale.geometry.dispose(); this.whale.material.dispose();
  }
}
