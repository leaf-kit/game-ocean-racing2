// 함대: 기함 + 동료함 최대 3척. 진형을 유지하면 함대 항진 보너스가 쌓이고,
// 1·2·3 키로 돌격 / 방패 / 산개 명령을 내린다. 동료함은 내구가 닳고, 0이 되면 대파한다.
import * as THREE from 'three';
import { TRACK_HALF_WIDTH } from './track.js?v=20261004a';
import { TRAITS, findFigure } from './figures.js?v=20261004a';

// 진형: 기함 기준 오프셋. back 양수 = 뒤, side 양수 = 우현.
// 동료함이 최대 9척까지 늘어나므로 자리를 고정 목록이 아니라 계산으로 만든다.
// 기준은 추적 카메라(기함 뒤 약 31m + 함대 크기만큼 더 뒤)다. 너무 뒤로 밀면 화면에서 사라진다.
export const MAX_CONSORTS = 9;

// 간격 프리셋: 진형 전체를 한꺼번에 좁히거나 넓힌다
export const SPACINGS = {
  tight:  { id: 'tight',  name: '가깝게', en: 'Tight',  mul: 0.68, desc: '바짝 붙는다. 진형이 잘 흐트러지지 않고 함대 항진이 빨리 차지만, 서로 부딪히기 쉽다.' },
  normal: { id: 'normal', name: '보통',   en: 'Normal', mul: 1.0,  desc: '기본 간격. 대열 유지와 기동성이 균형 잡힌다.' },
  loose:  { id: 'loose',  name: '멀게',   en: 'Loose',  mul: 1.45, desc: '널찍이 펼친다. 금화를 넓게 훑고 암초에 함께 걸리지 않지만, 대열을 지키기 어렵다.' },
};
export const SPACING_LIST = Object.values(SPACINGS);
export const findSpacing = (id) => SPACINGS[id] || SPACINGS.normal;

// 진형별 i번째 자리 (0-based). n은 전체 동료함 수.
// 함대가 커질수록 열을 늘려 앞뒤로 길게 늘어지지 않게 한다 — 그래야 대열이 화면에 들어온다.
function slotOf(formId, i, n = 3) {
  switch (formId) {
    case 'abreast': {           // 옆으로 나란히. 많으면 뒷줄로 넘긴다
      const cols = Math.min(5, Math.max(2, n));
      const row = Math.floor(i / cols), col = i % cols;
      return { back: 1 + row * 15, side: (col - (cols - 1) / 2) * 15 };
    }
    case 'crane': {             // 뒤로 벌어지는 V (학익)
      const sd = i % 2 ? 1 : -1, k = Math.floor(i / 2) + 1;
      return { back: 4 + k * 6, side: sd * (11 + k * 6) };
    }
    case 'wedge': {             // 앞으로 벌어지는 V (쐐기)
      const sd = i % 2 ? 1 : -1, k = Math.floor(i / 2) + 1;
      return { back: -(4 + k * 6), side: sd * (7 + k * 5) };
    }
    default: {                  // 종렬진: 엇갈린 종대. 7척부터는 3열로 접는다
      const cols = n > 6 ? 3 : 2;
      const row = Math.floor(i / cols), col = i % cols;
      return { back: 15 + row * 13, side: (col - (cols - 1) / 2) * (cols === 3 ? 10 : 16) };
    }
  }
}

// 이 진형·간격으로 n척을 세웠을 때 가장 뒤 배가 기함에서 얼마나 떨어지는가 (카메라 거리 산정용)
export function formationDepth(formId, n, spacingId) {
  let d = 0;
  for (let i = 0; i < n; i++) d = Math.max(d, slotOf(formId, i, n).back);
  return d * findSpacing(spacingId).mul;
}

export const FORMATIONS = {
  line:    { id: 'line',    name: '종렬진', en: 'Line Astern',  icon: '≡', desc: '좌우로 엇갈린 2열 종대로 뒤따른다. 바람 그늘이 깊어 함대 항진이 가장 빠르게 찬다.',
             cohesion: 1.35, shield: 0.6, reach: 0.8 },
  abreast: { id: 'abreast', name: '횡렬진', en: 'Line Abreast', icon: '⋯', desc: '옆으로 나란히 펼친다. 금화와 보급품을 넓게 훑는다.',
             cohesion: 0.85, shield: 0.7, reach: 1.9 },
  crane:   { id: 'crane',   name: '학익진', en: 'Crane Wing',   icon: '⋎', desc: '이순신의 포위 진형. 뒤로 날개를 펴 라이벌을 가두고 포격이 매서워진다.',
             cohesion: 1.0, shield: 0.8, reach: 1.3, gunnery: 1.5 },
  wedge:   { id: 'wedge',   name: '쐐기진', en: 'Wedge',        icon: '⋏', desc: '동료함이 앞서 길을 튼다. 암초와 포탄을 대신 맞아 준다.',
             cohesion: 0.9, shield: 1.8, reach: 1.0 },
};
export const FORMATION_LIST = Object.values(FORMATIONS);
export const findFormation = (id) => FORMATIONS[id] || FORMATIONS.line;
// 진형 + 간격을 합친 최종 자리
export function formationSlot(formId, i, spacingId, n = 3) {
  const s = slotOf(formId, i, n), m = findSpacing(spacingId).mul;
  return { back: s.back * m, side: s.side * m };
}

// 함대 명령: 지속 시간과 재사용 대기
export const ORDERS = {
  follow: { id: 'follow', name: '진형 유지', icon: '⚓', dur: 0, cd: 0, desc: '진형을 지키며 따라온다' },
  charge: { id: 'charge', name: '돌격',     icon: '⚔', dur: 9, cd: 22, desc: '앞선 라이벌에게 달려들어 포격한다' },
  screen: { id: 'screen', name: '방패',     icon: '🛡', dur: 9, cd: 20, desc: '기함 앞을 가려 암초와 포탄을 대신 맞는다' },
  gather: { id: 'gather', name: '산개',     icon: '🪙', dur: 9, cd: 24, desc: '흩어져 금화와 보급품을 거둬 기함에 넘긴다' },
};

const _v = new THREE.Vector3();
const _rejoin = new THREE.Vector3();
const angleDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };

// 함선에 특성 배수 칸을 만든다 (없으면 기본값 1)
export function freshTraits() {
  return { headwind: 1, tailwind: 1, boostRegen: 1, storm: 1, collision: 1, offCourse: 1,
           pickup: 1, cannonCd: 1, cannonDmg: 1, score: 1, fame: 1, cohesion: 1, plunder: 0, whirlOut: 1, foresight: false,
           codexFame: 1, bond: 1 };
}

// 부제독 특성을 기함(과 동료함)에 반영한다. officers = 인물 id 배열
export function applyOfficerTraits(boat, officerIds) {
  const tr = freshTraits();
  for (const id of officerIds) {
    if (!id) continue;
    switch (findFigure(id).trait) {
      case 'windward':      tr.headwind *= 0.6; break;
      case 'tailwind':      tr.tailwind *= 1.3; break;
      case 'gunnery':       tr.cannonCd *= 0.65; tr.cannonDmg *= 1.35; break;
      case 'navigator':     tr.offCourse *= 0.5; tr.whirlOut *= 0.6; break;
      case 'lookout':       tr.pickup *= 1.7; break;
      case 'shipwright':    tr.collision *= 0.5; break;
      case 'quartermaster': tr.boostRegen *= 1.5; break;
      case 'stormrider':    tr.storm *= 0.4; break;
      case 'formation':     tr.cohesion *= 2; break;
      case 'patron':        tr.fame *= 1.3; break;
      case 'cartographer':  tr.score *= 1.15; tr.foresight = true; break;
      case 'corsair':       tr.plunder += 0.35; break;
      case 'trader':        tr.score *= 1.35; break;
      case 'naturalist':    tr.codexFame = (tr.codexFame || 1) * 2; tr.bond = (tr.bond || 1) * 1.4; break;
    }
  }
  boat.tr = tr;
  return tr;
}

export class Fleet {
  // consorts: Boat 배열 (동료함). officers: 각 동료함을 맡은 인물 id
  constructor(flagship, consorts, officerIds, formationId, spacingId = 'normal') {
    this.flagship = flagship;
    this.consorts = consorts;
    this.formation = findFormation(formationId);
    this.spacing = findSpacing(spacingId);
    this.order = 'follow';
    this.orderT = 0;
    this.cd = { charge: 0, screen: 0, gather: 0 };
    this.cohesion = 0;      // 0~1, 진형 유지도
    this.meter = 0;         // 0~1, 함대 항진 게이지
    this.bonus = 1;         // 기함 속도 배수
    this.lost = 0;          // 대파한 동료함 수
    this.gathered = 0;      // 산개 명령으로 거둔 금화
    consorts.forEach((b, i) => {
      const off = officerIds[i];
      b.consort = { slot: i, officer: off, hp: 1, maxHp: 1, flash: 0, sunk: false, gatherT: 0 };
      b.tr = freshTraits();
      if (off && findFigure(off).trait === 'shipwright') b.consort.maxHp = 1.4;
      b.consort.hp = b.consort.maxHp;
    });
  }

  get alive() { return this.consorts.filter((b) => !b.consort.sunk); }
  get size() { return this.consorts.length; }

  // 슬롯의 목표 지점 (기함 기준)
  slotPos(i, out = _v) {
    const p = this.flagship;
    const s = formationSlot(this.formation.id, i, this.spacing.id, this.size);
    const fx = Math.sin(p.heading), fz = Math.cos(p.heading);
    // 산개 중에는 좌우로 더 넓게 벌린다
    const spread = this.order === 'gather' ? 2.6 : 1;
    const side = s.side * spread;
    return out.set(p.pos.x - fx * s.back + fz * side, 0, p.pos.z - fz * s.back - fx * side);
  }

  command(id) {
    if (!ORDERS[id] || id === 'follow') return false;
    if (this.cd[id] > 0 || !this.alive.length) return false;
    this.order = id; this.orderT = ORDERS[id].dur; this.cd[id] = ORDERS[id].cd;
    return true;
  }

  // 동료함 피해. amount 1 = 대파
  damage(boat, amount) {
    const c = boat.consort;
    if (!c || c.sunk) return false;
    c.hp -= amount; c.flash = 0.35;
    if (c.hp <= 0) { c.hp = 0; c.sunk = true; this.lost++; return true; } // 대파
    return false;
  }

  update(dt, track, boats, wind, krakenActive) {
    for (const k of Object.keys(this.cd)) if (this.cd[k] > 0) this.cd[k] -= dt;
    if (this.orderT > 0) { this.orderT -= dt; if (this.orderT <= 0) this.order = 'follow'; }

    const alive = this.alive;
    let inForm = 0;
    for (const b of alive) {
      const c = b.consort;
      if (c.flash > 0) c.flash -= dt;
      const d = this.steerConsort(b, dt, track, boats, krakenActive);
      // 진형 유지도는 0/1이 아니라 거리에 따라 점수를 준다. 완전히 맞물리지 않아도 게이지가 조금씩 찬다.
      // 동료함은 암초를 피하느라 늘 ±수십 미터 흔들리므로 판정 창을 넉넉히 둔다 (30m 이내 만점, 120m에서 0점).
      // 판정 창은 간격에 따라 늘리되 절반만 반영한다 (멀게를 골랐다고 늘 만점이 되면 의미가 없다)
      const win = 0.5 + 0.5 * this.spacing.mul;
      inForm += THREE.MathUtils.clamp(1 - (d - 30 * win) / (90 * win), 0, 1);
      // 대파한 배는 돛을 내리고 멈춘다 (아래 sink 처리)
    }
    for (const b of this.consorts) if (b.consort.sunk) { b.throttle = 0; b.steer = 0; b.boosting = false; b.skill = 0.2; }

    const n = alive.length;
    const target = n ? inForm / n : 0;
    this.cohesion += (target - this.cohesion) * Math.min(1, dt * 2);
    // 함대 항진: 진형이 유지될수록 게이지가 차고, 흐트러지면 빠지게
    const rate = this.formation.cohesion * (this.flagship.tr?.cohesion ?? 1) * 0.2;
    if (this.cohesion > 0.35 && n > 0) this.meter = Math.min(1, this.meter + dt * rate * this.cohesion);
    else this.meter = Math.max(0, this.meter - dt * 0.18);
    // 보너스: 동료함 수와 게이지에 비례 (최대 +18%)
    this.bonus = 1 + this.meter * (0.06 + Math.min(n, 9) * 0.022); // 9척이어도 최대 +26%
    return this.bonus;
  }

  // 동료함 조타. 진형 지점(또는 명령 목표)을 향해 간다. 반환값 = 목표까지 거리
  steerConsort(b, dt, track, boats, krakenActive) {
    const c = b.consort;
    const p = this.flagship;
    let tx, tz, throttleCap = 1;

    // 기함에서 너무 멀어지면 명령을 잠시 접고 진형으로 복귀한다 (목줄).
    // 그래도 한참 낙오하면 '전속 복귀' — 잠깐 초고속을 줘서 대열에 다시 붙인다.
    const toFlag = Math.hypot(b.pos.x - p.pos.x, b.pos.z - p.pos.z);
    c.lostT = toFlag > 250 ? (c.lostT ?? 0) + dt : 0;
    if (c.lostT > 2.5 && !b.airborne) { b.turbo = Math.max(b.turbo, 0.6); c.rejoining = true; }
    if (toFlag < 110) c.rejoining = false;
    // 암초에 걸려 멈춘 사이 기함이 터보로 달아나면 수백 m가 벌어진다. 그때는 헤엄쳐 따라오게 두지 않고
    // 수평선 너머에서 합류한 것으로 보고 대열에 붙인다 (레이싱 게임의 고무줄 복귀).
    if (toFlag > 380 && c.lostT > 4 && !b.airborne && !b.loop) {
      const sp = this.slotPos(c.slot, _rejoin);
      b.pos.x = sp.x; b.pos.z = sp.z;
      b.heading = p.heading; b.steerS = 0; b.spin = 0; b.slide.set(0, 0, 0);
      b.speed = Math.abs(p.speed) * 0.85;
      b.curveIdx = p.curveIdx;
      c.lostT = 0; c.rejoining = false; c.justRejoined = true;
    }
    const leash = toFlag > 200;
    if (leash) { const s = this.slotPos(c.slot); tx = s.x; tz = s.z; }
    else if (this.order === 'charge') {
      // 앞선 라이벌 중 가장 가까운 배를 노린다
      let best = null, bd = 1e9;
      for (const o of boats) {
        if (o === b || o === p || o.consort) continue;
        const d = Math.hypot(o.pos.x - b.pos.x, o.pos.z - b.pos.z);
        if (d < 240 && d < bd) { bd = d; best = o; }
      }
      if (best) { tx = best.pos.x + Math.sin(best.heading) * 8; tz = best.pos.z + Math.cos(best.heading) * 8; }
      else { const s = this.slotPos(c.slot); tx = s.x; tz = s.z; }
    } else if (this.order === 'screen') {
      // 기함 바로 앞을 가린다
      const fx = Math.sin(p.heading), fz = Math.cos(p.heading);
      const lane = (c.slot - (this.size - 1) / 2) * 9 * this.spacing.mul;
      tx = p.pos.x + fx * (16 + c.slot * 5) + fz * lane;
      tz = p.pos.z + fz * (16 + c.slot * 5) - fx * lane;
      throttleCap = 1.05;
    } else if (this.order === 'gather') {
      // 가까운 금화/보급품을 주우러 간다. 기함에서 멀리 떨어진 것은 쫓지 않는다 (함대가 흩어지지 않게)
      let best = null, bd = 1e9;
      const scan = (list) => { for (const it of list) { if (!it.active) continue;
        if (Math.hypot(it.x - p.pos.x, it.z - p.pos.z) > 150) continue;
        const d = Math.hypot(it.x - b.pos.x, it.z - b.pos.z); if (d < 160 && d < bd) { bd = d; best = it; } } };
      scan(track.coins); scan(track.pickups); scan(track.chests);
      if (best) { tx = best.x; tz = best.z; }
      else { const s = this.slotPos(c.slot); tx = s.x; tz = s.z; }
    } else {
      const s = this.slotPos(c.slot); tx = s.x; tz = s.z;
    }

    // 진형 지점까지의 실제 오차 (속도 계산과 진형 유지 판정에 쓴다)
    const gap = Math.hypot(tx - b.pos.x, tz - b.pos.z);
    const fwdX = Math.sin(p.heading), fwdZ = Math.cos(p.heading);
    const along = (b.pos.x - tx) * fwdX + (b.pos.z - tz) * fwdZ; // 양수 = 진형 지점보다 앞서 있다

    // 목표가 멀고 '뒤처져 있을 때만' 직선 대신 항로를 따라 쫓는다.
    // (섬과 암초를 straight로 뚫으려다 걸리는 것을 피한다)
    // 이미 앞서 있는데 항로를 따라 더 나아가면 오히려 기함에서 멀어지므로, 그때는 진형 지점을 그대로 본다.
    if (gap > 60 && along < 0) {
      const sampleLen = track.totalLength / track.sampleCount;
      const q = track.pointAt(b.curveIdx + Math.round((40 + Math.abs(b.speed) * 1.2) / sampleLen));
      tx = q.x; tz = q.z;
    }

    // 항로를 크게 벗어나지 않도록 목표를 항로 폭 안으로 당긴다
    const { dist, idx } = track.distToCurve(tx, tz, b.curveIdx);
    if (dist > TRACK_HALF_WIDTH * 0.9) {
      const cp = track.pointAt(idx);
      const k = (TRACK_HALF_WIDTH * 0.9) / dist;
      tx = cp.x + (tx - cp.x) * k; tz = cp.z + (tz - cp.z) * k;
    }

    // 장애물 회피
    const fx = Math.sin(b.heading), fz = Math.cos(b.heading);
    let ax = 0, az = 0;
    const consider = (ox, oz, r, w) => {
      const dx = ox - b.pos.x, dz = oz - b.pos.z;
      const dd = Math.hypot(dx, dz);
      const ahead = dx * fx + dz * fz;
      if (ahead < 0 || dd > r + 60) return;
      const lat = dx * fz - dz * fx;
      if (Math.abs(lat) > r + b.phys.radius + 9) return;
      const push = (r + b.phys.radius + 11 - Math.abs(lat)) * w * (1 - ahead / (r + 60));
      const side = lat > 0 ? -1 : 1;
      ax += fz * side * push; az += -fx * side * push;
    };
    for (const o of track.obstacles) if (o.active !== false) consider(o.x, o.z, o.r, 1.2);
    for (const w of track.whirlpools) if (w.active !== false) consider(w.x, w.z, w.r + 6, 1.8);
    if (krakenActive) for (const tt of track.kraken.tentacles) consider(tt.x, tt.z, tt.r + 3, 1.2);
    // 곡예 장치는 기함만 쓴다. 동료함은 빙 둘러 간다.
    for (const lp of track.loops) consider(lp.x, lp.z, lp.r + 4, 1.4);
    for (const rp of track.ramps) consider(rp.x, rp.z, rp.r + 3, 1.2);
    for (const o of boats) {
      if (o === b) continue;
      // 같은 함대끼리는 살짝만 피한다 (세게 피하면 대열이 계속 밀려나 자리를 못 잡는다)
      const ally = o === p || !!o.consort;
      consider(o.pos.x, o.pos.z, o.phys.radius * (ally ? 0.7 : 1), ally ? 0.12 : 0.5);
    }
    tx += ax; tz += az;

    const desired = Math.atan2(tx - b.pos.x, tz - b.pos.z);
    const da = angleDiff(desired, b.heading);
    b.steer = THREE.MathUtils.clamp(da * 2.6, -1, 1);

    // 속도 맞추기.
    // 동료함은 기함보다 느린 배일 수도 있으므로, "기함 속도를 내려면 필요한 배수"를 먼저 구하고
    // 진형 지점보다 뒤처진 만큼 더 얹는다. 지점을 지나쳤으면 반대로 늦춘다. (고무줄 추격)
    const needed = Math.abs(p.speed) / Math.max(1, b.phys.maxSpeed);
    let chase;
    if (along > 4) chase = needed * THREE.MathUtils.clamp(1 - (along - 4) / 30, 0.12, 1);
    else chase = needed * (1 + THREE.MathUtils.clamp((gap - 12) / 45, 0, 1)) + 0.06;
    // 기함보다 지나치게 빨라지면 대열을 앞질러 달아나 버린다. 따라붙는 속도에 상한을 둔다.
    const ceiling = needed * (c.rejoining ? 1.7 : 1.42) + 0.25;
    chase = THREE.MathUtils.clamp(chase, 0.25, Math.min(ceiling, 3.2));
    b.skill += (chase - b.skill) * Math.min(1, dt * 3); // 급격한 속도 변화를 눌러 준다

    // 앞질렀으면 돛을 접고 기함을 기다린다. 계단식으로 끊지 않고 비례해서 줄여야 대열이 출렁이지 않는다.
    let th = throttleCap * THREE.MathUtils.clamp(1 - (along - 6) / 26, 0, 1);
    if (Math.abs(da) > 1.0) th *= 0.6;
    b.throttle = THREE.MathUtils.clamp(th, 0, 1.05);
    // 크게 뒤처지면 전속 항해로 따라붙는다
    b.boosting = along < 0 && gap > 45 && b.boost > 0.15 && Math.abs(da) < 0.5;
    if (b.boosting && b.boost <= 0.03) b.boosting = false;

    // 포격: 돌격/학익진일 때 적극적으로
    c.fireT = (c.fireT ?? 0) - dt;
    let fire = false;
    const aggressive = this.order === 'charge' || this.formation.gunnery;
    if (b.cannonCd <= 0 && c.fireT <= 0 && b.time > 6) {
      for (const o of boats) {
        if (o === b || o === p || o.consort) continue;
        const ox = o.pos.x - b.pos.x, oz = o.pos.z - b.pos.z;
        const d = Math.hypot(ox, oz);
        if (d > 18 && d < 110) {
          const a = Math.abs(angleDiff(Math.atan2(ox, oz), b.heading));
          if (a < 0.32 && Math.random() < (aggressive ? 0.9 : 0.4)) { fire = true; break; }
        }
      }
      c.fireT = aggressive ? 1.1 : 2.2;
    }
    c.wantFire = fire;
    return gap;
  }
}

// 특성 설명 문자열 (선택 화면용)
export function traitLabel(id) {
  const t = TRAITS[id];
  return t ? `${t.icon} ${t.name} — ${t.desc}` : '';
}
