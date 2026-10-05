// 항로 위 이정표와 간판.
// 기항지(체크포인트) 하나마다 세 가지를 세운다.
//   1. 환영 간판  기항지를 막 지난 자리. 지금 어디에 왔는지 알려 주고, 뒤로 그 땅의 명소가 선다.
//   2. 이정표      구간 한가운데. 다음 기항지까지 몇 km, 어느 쪽인지, 지나온 곳은 몇 km 뒤인지.
//   3. 거리 표지   다음 기항지 직전. 입항까지 남은 거리와 이번 바퀴에 남은 전체 거리.
// 표지는 모두 가드 로프 바깥에 서므로 배가 부딪힐 일은 없다.
import * as THREE from 'three';
import { LANG } from './i18n.js?v=20261005h';
import { buildLandmark, resetLandmarkCache } from './landmarks.js?v=20261005h';

const en = () => LANG === 'en';
export const portName = (p) => (en() && p.en) ? p.en : p.name;
export const portRegion = (p) => (en() && p.regionEn) ? p.regionEn : p.region;

// ---------- 거리 ----------
// 두 기항지 사이 거리(km). 기항지에 km 가 적혀 있으면(우주 항로처럼 경위도로 잴 수 없는 곳) 그 값을 쓴다.
export function haversineKm(a, b) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
// i 번 기항지에서 다음 기항지까지
export function legKm(route, i) {
  const n = route.ports.length;
  const a = route.ports[((i % n) + n) % n], b = route.ports[(((i + 1) % n) + n) % n];
  if (b.km != null) return b.km;
  // 강과 운하는 물길이 굽이치므로 직선 거리보다 길다
  return haversineKm(a, b) * (route.wind ?? 1);
}
// i 번 기항지부터 출발점(0번)으로 돌아올 때까지 남은 전체 거리
export function lapRemainKm(route, i, frac = 0) {
  const n = route.ports.length;
  let km = legKm(route, i) * (1 - frac);
  for (let k = i + 1; k < n; k++) km += legKm(route, k);
  return km;
}

// 거리 표기. 한국어는 만·억 단위, 영어는 M·B 단위.
export function fmtKm(km) {
  if (km < 1) return `${Math.max(10, Math.round(km * 100) * 10)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  if (en()) {
    if (km >= 1e9) return `${(km / 1e9).toFixed(2)}B km`;
    if (km >= 1e6) return `${(km / 1e6).toFixed(1)}M km`;
    return `${Math.round(km).toLocaleString('en-US')} km`;
  }
  if (km >= 1e8) return `${(km / 1e8).toFixed(1).replace(/\.0$/, '')}억 km`;
  if (km >= 1e4) {
    const man = km / 1e4;
    return `${man >= 100 ? Math.round(man).toLocaleString('ko-KR') : man.toFixed(1).replace(/\.0$/, '')}만 km`;
  }
  return `${Math.round(km).toLocaleString('ko-KR')} km`;
}

// 실제 지도 위 방위 (8방위)
const DIR_KO = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
const DIR_EN = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const DIR_ARROW = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
export function bearing(a, b) {
  const rad = Math.PI / 180;
  const y = Math.sin((b.lon - a.lon) * rad) * Math.cos(b.lat * rad);
  const x = Math.cos(a.lat * rad) * Math.sin(b.lat * rad) - Math.sin(a.lat * rad) * Math.cos(b.lat * rad) * Math.cos((b.lon - a.lon) * rad);
  const deg = (Math.atan2(y, x) / rad + 360) % 360;
  const k = Math.round(deg / 45) % 8;
  return { deg, arrow: DIR_ARROW[k], name: en() ? DIR_EN[k] : DIR_KO[k] + (en() ? '' : '쪽') };
}

// ---------- 그림 (캔버스 텍스처) ----------
const FONT = '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", "Segoe UI", sans-serif';
const SERIF = '"Noto Serif KR", "Cinzel", Georgia, serif';
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
// 글자가 칸을 넘으면 줄여서 맞춘다
function fit(ctx, text, maxW, size, weight = 900, family = FONT) {
  let s = size;
  do { ctx.font = `${weight} ${s}px ${family}`; s -= 2; } while (ctx.measureText(text).width > maxW && s > 10);
}
// 굵은 화살표. ang 0 = 위(곧장), 양수 = 오른쪽으로 꺾임
function arrow(ctx, cx, cy, size, ang, color) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
  ctx.fillStyle = color; ctx.beginPath();
  const s = size;
  ctx.moveTo(0, -s); ctx.lineTo(s * 0.72, -s * 0.12); ctx.lineTo(s * 0.26, -s * 0.12); ctx.lineTo(s * 0.26, s);
  ctx.lineTo(-s * 0.26, s); ctx.lineTo(-s * 0.26, -s * 0.12); ctx.lineTo(-s * 0.72, -s * 0.12); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function stars(ctx, w, h, n = 60) {
  for (let i = 0; i < n; i++) { ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`; ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
}
function texture(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

// 1. 환영 간판
function drawWelcome(p, idx, n, space, river) {
  const [c, x] = canvas(768, 384);
  if (space) {
    const g = x.createLinearGradient(0, 0, 0, 384); g.addColorStop(0, '#0b0a2a'); g.addColorStop(1, '#2b1460');
    x.fillStyle = g; x.fillRect(0, 0, 768, 384); stars(x, 768, 384, 90);
    x.strokeStyle = '#8fd4ff'; x.lineWidth = 10; rr(x, 8, 8, 752, 368, 26); x.stroke();
  } else {
    x.fillStyle = river ? '#f3ead2' : '#f6e9c8'; x.fillRect(0, 0, 768, 384);
    x.strokeStyle = '#8a2a1a'; x.lineWidth = 16; rr(x, 10, 10, 748, 364, 22); x.stroke();
    x.strokeStyle = '#c9a55a'; x.lineWidth = 4; rr(x, 30, 30, 708, 324, 14); x.stroke();
  }
  const ink = space ? '#ffffff' : '#3a1a0a', accent = space ? '#8fd4ff' : '#8a2a1a';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = accent; x.font = `800 30px ${FONT}`;
  x.fillText(idx === 0 ? (en() ? '— START · FINISH —' : '— 출발 · 도착 —') : (en() ? '— WELCOME TO —' : '— 어서 오십시오 —'), 384, 78);
  x.fillStyle = ink; fit(x, portName(p), 660, 110, 900, SERIF); x.fillText(portName(p), 384, 172);
  const sub = `${portRegion(p) || ''}${p.year ? ' · ' + p.year : ''}`;
  x.fillStyle = space ? '#c9d8ff' : '#5a3d18'; fit(x, sub, 640, 38, 700); x.fillText(sub, 384, 258);
  // 아래쪽: 영문(또는 한글) 병기와 기항지 번호
  const alt = en() ? p.name : (p.en || '');
  x.fillStyle = accent; x.font = `700 28px ${FONT}`;
  x.fillText(`${alt ? alt + '  ·  ' : ''}${idx + 1} / ${n}`, 384, 322);
  return c;
}

// 2. 이정표 (도로 표지판 풍): 다음 기항지, 방향, 거리 / 지나온 곳 / 현재 구간
function drawSignpost(route, i, turn, space) {
  const n = route.ports.length;
  const a = route.ports[i], b = route.ports[(i + 1) % n];
  const leg = legKm(route, i);
  const [c, x] = canvas(768, 432);
  const bg = space ? '#1b2a6b' : '#13633f';
  x.fillStyle = bg; rr(x, 0, 0, 768, 432, 30); x.fill();
  x.strokeStyle = '#ffffff'; x.lineWidth = 8; rr(x, 12, 12, 744, 408, 22); x.stroke();
  x.textBaseline = 'middle';
  // 위: 다음 기항지
  arrow(x, 94, 120, 62, turn, '#ffffff');
  x.fillStyle = '#ffffff'; x.textAlign = 'left';
  fit(x, portName(b), 400, 84, 900); x.fillText(portName(b), 178, 104);
  x.textAlign = 'right'; x.fillStyle = '#ffe08a'; fit(x, fmtKm(leg / 2), 230, 64, 900); x.fillText(fmtKm(leg / 2), 736, 104);
  x.textAlign = 'left'; x.fillStyle = '#cfe8d8';
  const dir = space ? (en() ? 'Deep-space course' : '심우주 항로') : `${bearing(a, b).arrow} ${bearing(a, b).name}${portRegion(b) ? ' · ' + portRegion(b) : ''}`;
  fit(x, dir, 540, 34, 700); x.fillText(dir, 180, 170);
  // 가운데 줄
  x.fillStyle = 'rgba(255,255,255,0.85)'; x.fillRect(36, 212, 696, 4);
  // 아래: 지나온 곳
  x.save(); x.translate(94, 270); x.rotate(Math.PI); arrow(x, 0, 0, 30, 0, 'rgba(255,255,255,0.8)'); x.restore();
  x.fillStyle = 'rgba(255,255,255,0.9)'; x.textAlign = 'left';
  fit(x, portName(a), 400, 46, 800); x.fillText(portName(a), 178, 266);
  x.textAlign = 'right'; fit(x, fmtKm(leg / 2), 230, 40, 800); x.fillText(fmtKm(leg / 2), 736, 266);
  // 맨 아래: 현재 위치 띠
  x.fillStyle = space ? '#f0b44a' : '#7a4a1a'; rr(x, 30, 330, 708, 74, 14); x.fill();
  x.fillStyle = '#ffffff'; x.textAlign = 'center';
  const here = en() ? `YOU ARE HERE · between ${portName(a)} and ${portName(b)}` : `현재 위치 · ${portName(a)} ↔ ${portName(b)} 사이`;
  fit(x, here, 680, 36, 800); x.fillText(here, 384, 368);
  return c;
}

// 3. 거리 표지 (작은 파란 말뚝)
function drawMilestone(route, i, frac, space) {
  const n = route.ports.length;
  const b = route.ports[(i + 1) % n];
  const rest = legKm(route, i) * (1 - frac);
  const lap = lapRemainKm(route, i, frac);
  const [c, x] = canvas(384, 384);
  x.fillStyle = space ? '#3b1a6a' : '#1c4f9c'; rr(x, 0, 0, 384, 384, 30); x.fill();
  x.strokeStyle = '#ffffff'; x.lineWidth = 8; rr(x, 12, 12, 360, 360, 22); x.stroke();
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#ffffff';
  fit(x, portName(b), 320, 62, 900); x.fillText(portName(b), 192, 92);
  x.fillStyle = '#ffe08a'; fit(x, fmtKm(rest), 330, 76, 900); x.fillText(fmtKm(rest), 192, 186);
  x.fillStyle = 'rgba(255,255,255,0.85)'; x.fillRect(40, 248, 304, 3);
  x.fillStyle = '#cfe0ff';
  const t1 = (i + 1) % n === 0 ? (en() ? 'to the finish line' : '결승선까지') : (en() ? 'voyage left this lap' : '이번 바퀴 남은 항해');
  fit(x, t1, 320, 30, 700); x.fillText(t1, 192, 284);
  x.fillStyle = '#ffffff'; fit(x, fmtKm(lap), 320, 40, 900); x.fillText(fmtKm(lap), 192, 332);
  return c;
}

// ---------- 3D ----------
const woodMat = () => new THREE.MeshStandardMaterial({ color: 0x5a3d22, roughness: 0.9 });
const metalMat = () => new THREE.MeshStandardMaterial({ color: 0x9aa2aa, roughness: 0.5, metalness: 0.5 });
// 판(앞면만 그림) + 기둥 두 개. 판의 +z 면이 앞이다.
function board(tex, w, h, postH, metal, texList) {
  const g = new THREE.Group();
  const side = metal ? metalMat() : woodMat();
  const front = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
  texList.push(tex);
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.8), [side, side, side, side, front, side]);
  b.position.y = postH + h / 2; g.add(b);
  for (const sx of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, postH + h * 0.9, 8), side);
    post.position.set(sx * w * 0.36, (postH + h * 0.9) / 2, -0.7); g.add(post);
  }
  return g;
}
// 물 위에 띄우는 받침 (바다 맵)
function pontoon(r, space) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.1, 3, 16), new THREE.MeshStandardMaterial({ color: space ? 0x6a6a7a : 0xd8b23a, roughness: 0.7, metalness: space ? 0.5 : 0 }));
  m.position.y = -0.4; g.add(m);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.02, r * 1.02, 0.8, 16), new THREE.MeshStandardMaterial({ color: space ? 0x8fd4ff : 0x2b2b2b, emissive: space ? 0x2a6a9a : 0 }));
  band.position.y = 0.7; g.add(band);
  return g;
}

// 기항지별 명소. 기항지 데이터에 mark 가 없으면 바다는 등대, 강은 없음.
function markFor(p, map) {
  if (p.mark) return p.mark;
  if (map.style === 'river' || map.style === 'harbor') return null;
  return map.style === 'space' ? 'dish' : 'lighthouse';
}

// 트랙에 표지를 세운다. route 는 맵의 기항지 목록 (체크포인트와 1:1).
export function buildSigns(track, route) {
  resetLandmarkCache();
  const map = track.map, N = track.sampleCount;
  const n = Math.min(route.ports.length, track.checkpoints.length);
  const space = map.style === 'space', river = map.style === 'river', G = 50;
  const group = new THREE.Group(); group.name = 'signs';
  track.group.add(group);
  const texList = [];
  track.signTextures = texList;
  track.signs = [];
  const quayTop = river ? (track.quayH ?? 6) - 2.2 : 0;   // 강은 호안 위에 세운다

  // 이 자리에 세워도 되는가: 항로의 다른 구간과 섬을 피한다
  const free = (x, z, r) => {
    if (track.distToCurve(x, z).dist < G + r * 0.4) return false;
    for (const isl of track.islands) if (Math.hypot(isl.x - x, isl.z - z) < isl.r + r) return false;
    return true;
  };
  // 항로 idx 의 옆(sd: +1 오른쪽, -1 왼쪽) off 거리 지점. 막혀 있으면 반대편, 그래도 막히면 더 바깥.
  const spot = (idx, off, r, prefer = 1) => {
    const p = track.pointAt(idx), nr = track.normalAt(idx);
    for (const extra of [0, 18, 40]) for (const sd of [prefer, -prefer]) {
      const x = p.x + nr.x * sd * (off + extra), z = p.z + nr.z * sd * (off + extra);
      if (free(x, z, r)) return { x, z, sd, idx };
    }
    return null;
  };
  // 다가오는 배를 보도록 돌린다 (조금 항로 쪽으로 틀어 읽기 쉽게)
  const face = (obj, s) => {
    const t = track.tangentAt(s.idx), nr = track.normalAt(s.idx);
    const fx = -t.x - nr.x * s.sd * 0.55, fz = -t.z - nr.z * s.sd * 0.55;
    obj.rotation.y = Math.atan2(fx, fz);
  };
  // 이 자리부터 앞으로 꺾이는 방향 (0 = 곧장, + = 오른쪽)
  const turnAt = (idx) => {
    const p = track.pointAt(idx), t = track.tangentAt(idx), nr = track.normalAt(idx);
    const q = track.pointAt(idx + Math.round(N * 0.05));
    const dx = q.x - p.x, dz = q.z - p.z;
    const a = Math.atan2(dx * nr.x + dz * nr.z, dx * t.x + dz * t.z);
    return Math.max(-1.5, Math.min(1.5, a));
  };
  const put = (obj, s, y) => { obj.position.set(s.x, y, s.z); face(obj, s); group.add(obj); };
  // 강가 건물 가운데 명소를 가리는 것들을 치운다 (크기 0 으로)
  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _zero = new THREE.Matrix4().makeScale(0, 0, 0);
  const clearAround = (x, z, r) => {
    for (const inst of track.group.children) {
      if (!inst.userData.clearable) continue;
      let hit = false;
      for (let k = 0; k < inst.count; k++) {
        inst.getMatrixAt(k, _m); _p.setFromMatrixPosition(_m);
        if (Math.hypot(_p.x - x, _p.z - z) < r) { inst.setMatrixAt(k, _zero); hit = true; }
      }
      if (hit) inst.instanceMatrix.needsUpdate = true;
    }
  };

  for (let c = 0; c < n; c++) {
    const i0 = track.checkpoints[c], i1 = c + 1 < track.checkpoints.length ? track.checkpoints[c + 1] : N;
    const seg = i1 - i0;
    const at = (f) => (i0 + Math.round(seg * f)) % N;
    const p = route.ports[c];

    // 1. 환영 간판 + 명소
    const s1 = spot(at(c === 0 ? 0.2 : 0.1), G + 10, 12, 1);
    if (s1) {
      const sign = board(texture(drawWelcome(p, c, n, space, river)), 32, 16, 10, space, texList);
      if (!river) sign.add(pontoon(9, space));
      put(sign, s1, quayTop);
      const kind = markFor(p, map);
      const lm = kind && buildLandmark(kind);
      if (lm) {
        // 간판 너머, 같은 쪽 바깥. 간판을 지나며 앞쪽에 보이도록 구간 앞부분에 세운다.
        lm.scale.setScalar(1.25);
        const s = spot(at(c === 0 ? 0.45 : 0.38), G + 70, 46, s1.sd);
        if (s) {
          if (!river) {
            // 바다에는 명소가 설 땅을 깐다
            const ground = new THREE.Mesh(new THREE.CylinderGeometry(46, 52, 5, 22), new THREE.MeshStandardMaterial({ color: space ? 0x8a8a8a : map.style === 'ice' ? 0xeaf6ff : 0xc9b48a, roughness: 1 }));
            ground.position.set(s.x, -1.2, s.z); group.add(ground);
            track.islands.push({ x: s.x, z: s.z, r: 40, landmark: true });
          }
          if (river) clearAround(s.x, s.z, 70);
          put(lm, s, river ? quayTop + 1 : 1.2);
          lm.rotation.y += Math.PI; // 명소의 앞(-z)이 항로를 보게
        }
      }
      track.signs.push({ kind: 'welcome', port: c, x: s1.x, z: s1.z });
    }

    // 2. 이정표 (구간 한가운데)
    const s2 = spot(at(0.5), G + 8, 12, 1);
    if (s2) {
      const sign = board(texture(drawSignpost(route, c, turnAt(s2.idx), space)), 28, 15.75, 8, true, texList);
      if (!river) sign.add(pontoon(8, space));
      put(sign, s2, quayTop);
      track.signs.push({ kind: 'signpost', port: c, x: s2.x, z: s2.z });
    }

    // 3. 거리 표지 (다음 기항지 직전)
    const s3 = spot(at(0.8), G + 6, 6, -1);
    if (s3) {
      const sign = board(texture(drawMilestone(route, c, 0.8, space)), 11, 11, 5, true, texList);
      if (!river) sign.add(pontoon(4.5, space));
      put(sign, s3, quayTop);
      track.signs.push({ kind: 'milestone', port: c, x: s3.x, z: s3.z });
    }
  }
}

// 매 프레임: 지금 어느 구간인지, 다음 기항지까지 몇 km 남았는지
export function locationAt(track, route, curveIdx) {
  const N = track.sampleCount, cps = track.checkpoints, n = Math.min(route.ports.length, cps.length);
  const idx = ((curveIdx % N) + N) % N;
  let c = n - 1;
  for (let k = 0; k < n; k++) if (idx >= cps[k] && (k + 1 >= n || idx < cps[k + 1])) { c = k; break; }
  const s0 = track.cum[cps[c]], s1 = c + 1 < n ? track.cum[cps[c + 1]] : track.totalLength;
  const frac = Math.max(0, Math.min(1, (track.cum[idx] - s0) / Math.max(1, s1 - s0)));
  const a = route.ports[c], b = route.ports[(c + 1) % route.ports.length];
  return { from: a, to: b, fromIdx: c, frac, km: legKm(route, c) * (1 - frac), lapKm: lapRemainKm(route, c, frac) };
}
