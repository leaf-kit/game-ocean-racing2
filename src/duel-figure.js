// 일기토 화면의 선장 그림.
// 관절이 있는 뼈대(엉덩이·무릎·발목, 어깨·팔꿈치·손목, 목)를 동작 키프레임 사이로 부드럽게 옮기고,
// 그 위에 인물마다 다른 옷·모자·수염·칼을 입힌다. 빛은 화면 오른쪽 위(석양)에서 온다.
//
// 각도 규칙: 0 = 아래, +π/2 = 앞(얼굴 쪽), -π/2 = 뒤, π = 위. 벡터 = (sin a, cos a)
// 모든 좌표는 '앞 = +x' 인 몸 기준으로 계산하고, 왼쪽을 보는 선장은 그릴 때 좌우를 뒤집는다.

const TH = 48, SH = 47, TORSO = 72, UA = 36, FA = 33, NECK = 9, HEAD_R = 15;
export const GROUND = 432;
const BLADE = { rapier: 104, cutlass: 80, kilij: 92, hwando: 96, jian: 98 };

// ---------- 인물별 차림 ----------
// body: coat 프록코트 / doublet 더블릿과 부푼 반바지 / robe 발목까지 오는 관복 / kaftan 카프탄 / armor 두정갑
export const COSTUMES = {
  player:      { body: 'coat',    coat: '#1d3566', trim: '#d9b04a', pants: '#e6dcc4', boots: '#1c140c', hat: 'tricorn', hatCol: '#16110c', hair: '#3b2616', beard: 'stubble', beardCol: '#3b2616', skin: '#e2b48c', weapon: 'rapier' },
  dias:        { body: 'doublet', coat: '#5a3a22', trim: '#c8a060', pants: '#3a2a1c', boots: '#2a1c10', hat: 'morion',  hatCol: '#a8aeb4', hair: '#4a3020', beard: 'full', beardCol: '#4a3020', skin: '#dcae86', weapon: 'rapier' },
  magellan:    { body: 'doublet', coat: '#262626', trim: '#b8b8b8', pants: '#4a3a2a', boots: '#1a120a', hat: 'morion',  hatCol: '#b4bac0', hair: '#2a1a10', beard: 'full', beardCol: '#2a1a10', skin: '#d8a880', weapon: 'rapier' },
  zhenghe:     { body: 'robe',    coat: '#9a2a22', trim: '#e0b84a', pants: '#2a1a14', boots: '#141010', hat: 'ming',    hatCol: '#141414', hair: '#141010', beard: 'none', beardCol: '#141010', skin: '#e0b48a', weapon: 'jian', badge: true },
  drake:       { body: 'doublet', coat: '#3a2340', trim: '#d6b24a', pants: '#2a1a30', boots: '#1a120a', hat: 'cap',     hatCol: '#1a1a1a', hair: '#9a5a2a', beard: 'goatee', beardCol: '#a0602a', skin: '#e8bc96', weapon: 'rapier', ruff: true, plume: '#f2f2f2' },
  yi:          { body: 'armor',   coat: '#7a1a18', trim: '#c9a24a', pants: '#3a2a20', boots: '#141010', hat: 'joseon',  hatCol: '#2b2b30', hair: '#141010', beard: 'long', beardCol: '#1a1410', skin: '#d8ae86', weapon: 'hwando', armorCol: '#2b2d34' },
  columbus:    { body: 'doublet', coat: '#6a2228', trim: '#c8a060', pants: '#2a2a3a', boots: '#1a120a', hat: 'beret',   hatCol: '#241818', hair: '#d8d0c0', beard: 'none', beardCol: '#d8d0c0', skin: '#e8c09a', weapon: 'rapier', longHair: true },
  dagama:      { body: 'doublet', coat: '#1a1a1a', trim: '#c9a24a', pants: '#3a1a1a', boots: '#120c08', hat: 'beret',   hatCol: '#1a1a1a', hair: '#2a1a10', beard: 'full', beardCol: '#2a1a10', skin: '#d8a880', weapon: 'cutlass', plume: '#c9a24a' },
  henry:       { body: 'doublet', coat: '#141414', trim: '#7a7a7a', pants: '#141414', boots: '#0c0a08', hat: 'chaperon', hatCol: '#101010', hair: '#3a2a1a', beard: 'mustache', beardCol: '#3a2a1a', skin: '#e2b896', weapon: 'rapier' },
  albuquerque: { body: 'doublet', coat: '#4a1a1a', trim: '#c9a24a', pants: '#2a1a1a', boots: '#120c08', hat: 'beret',   hatCol: '#1a1010', hair: '#e8e4dc', beard: 'long', beardCol: '#ece8e0', skin: '#e0b490', weapon: 'cutlass' },
  vespucci:    { body: 'doublet', coat: '#2a4a3a', trim: '#c8b070', pants: '#3a3020', boots: '#1a120a', hat: 'cap',     hatCol: '#3a1a1a', hair: '#4a3020', beard: 'none', beardCol: '#4a3020', skin: '#e6bc94', weapon: 'rapier', longHair: true },
  barbarossa:  { body: 'kaftan',  coat: '#1f5a3a', trim: '#d9b04a', pants: '#d8d0bc', boots: '#6a1a14', hat: 'turban',  hatCol: '#f2ece0', hair: '#b8401a', beard: 'full', beardCol: '#c0441a', skin: '#d8a47c', weapon: 'kilij', sash: '#b8282a' },
  default:     { body: 'coat',    coat: '#5a2a1a', trim: '#c8a060', pants: '#3a2a1a', boots: '#1a120a', hat: 'tricorn', hatCol: '#1a120a', hair: '#3a2416', beard: 'full', beardCol: '#3a2416', skin: '#dcae86', weapon: 'cutlass' },
};
export const costumeOf = (figId, isPlayer) => (isPlayer ? COSTUMES.player : COSTUMES[figId] || COSTUMES.default);

// ---------- 동작 키프레임 ----------
// dx: 앞으로 나간 거리. lean: 상체 기울기. 다리 f/b = 앞·뒷다리 (허벅지, 정강이). 팔 s = 칼 든 팔, o = 빈 팔. sw = 칼 각도
const K = {
  // 펜싱의 앙가르드: 옆으로 서서 무릎을 굽히고, 칼끝은 상대 눈높이, 빈 팔은 뒤로 들어 균형
  idle:    { dx: 0,   lean: 0.06,  head: 0,     fT: 0.48, fS: 0.04,  bT: -0.42, bS: -0.30, sU: 1.05, sF: 1.55, sw: 1.72, oU: -0.85, oF: -2.35 },
  // 베기: 칼을 머리 뒤로 젖혔다가 대각선으로 내려친다
  slash1:  { dx: -6,  lean: -0.12, head: -0.08, fT: 0.40, fS: 0.10,  bT: -0.38, bS: -0.25, sU: 2.75, sF: 3.30, sw: 3.85, oU: 0.30,  oF: 1.20 },
  slash2:  { dx: 64,  lean: 0.32,  head: 0.12,  fT: 0.95, fS: 0.18,  bT: -0.70, bS: -0.85, sU: 1.45, sF: 1.10, sw: 0.85, oU: -1.10, oF: -1.60 },
  // 찌르기: 앞발을 길게 내딛고 뒷다리를 쭉 펴며 팔과 칼을 일직선으로
  lunge1:  { dx: -10, lean: -0.04, head: 0,     fT: 0.40, fS: 0.10,  bT: -0.30, bS: -0.45, sU: 0.95, sF: 1.25, sw: 1.45, oU: -0.90, oF: -2.50 },
  lunge2:  { dx: 118, lean: 0.34,  head: 0.05,  fT: 1.15, fS: 0.30,  bT: -0.95, bS: -1.15, sU: 1.58, sF: 1.58, sw: 1.62, oU: -1.40, oF: -1.55 },
  // 막기: 몸을 살짝 빼고 칼을 세워 머리와 몸통을 가린다
  parry1:  { dx: 4,   lean: -0.14, head: -0.10, fT: 0.42, fS: -0.02, bT: -0.48, bS: -0.40, sU: 1.55, sF: 2.65, sw: 3.05, oU: -0.70, oF: -2.10 },
  parry2:  { dx: 14,  lean: -0.06, head: -0.04, fT: 0.52, fS: 0.04,  bT: -0.50, bS: -0.42, sU: 1.70, sF: 2.30, sw: 2.70, oU: -0.80, oF: -2.20 },
  // 맞았을 때 뒤로 젖혀진다
  hit:     { dx: -34, lean: -0.42, head: -0.40, fT: 0.70, fS: 0.30,  bT: -0.10, bS: -0.10, sU: 0.40,  sF: 0.90, sw: 1.10, oU: -1.60, oF: -1.10 },
  // 무릎 꿇음: 뒷무릎이 갑판에 닿고 칼이 내려간다
  down:    { dx: 0,   lean: 0.55,  head: 0.65,  fT: 1.35, fS: 0.05,  bT: 0.35,  bS: -1.57, sU: 0.15,  sF: 0.35, sw: 1.45, oU: 0.40,  oF: 0.60 },
  // 승리: 칼을 높이 들고 빈 손은 허리에
  victory: { dx: 0,   lean: -0.04, head: -0.12, fT: 0.36, fS: 0.02,  bT: -0.32, bS: -0.18, sU: 2.95, sF: 3.05, sw: 3.12, oU: -0.35, oF: 0.85 },
};
const KEYS = Object.keys(K.idle);
const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
const mix = (a, b, k) => { const o = {}; for (const key of KEYS) o[key] = a[key] + (b[key] - a[key]) * k; return o; };
// 동작 시간표: [시작, 끝, 키프레임]. 끝난 뒤에는 마지막 키프레임에서 앙가르드로 돌아온다.
const TRACKS = {
  slash: [[0, 0.26, 'slash1'], [0.26, 0.38, 'slash2']],
  lunge: [[0, 0.22, 'lunge1'], [0.22, 0.36, 'lunge2']],
  parry: [[0, 0.20, 'parry1'], [0.28, 0.40, 'parry2']],
};
export const IMPACT_T = 0.36;   // 칼이 닿는 순간 (duel.js 가 이때 피해를 준다)

export function poseAt(F, t) {
  let p;
  if (F.pose === 'down' || F.pose === 'victory') p = mix(K.idle, K[F.pose], ease(Math.min(1, F.poseT / 0.6)));
  else if (TRACKS[F.pose]) {
    const tr = TRACKS[F.pose]; let prev = K.idle; p = K.idle;
    for (const [a, b, key] of tr) {
      if (F.poseT < a) break;
      p = mix(prev, K[key], ease(Math.min(1, (F.poseT - a) / (b - a)))); prev = K[key];
    }
    const end = tr[tr.length - 1][1];
    if (F.poseT > end + 0.25) p = mix(K[tr[tr.length - 1][2]], K.idle, ease(Math.min(1, (F.poseT - end - 0.25) / 0.45)));
  } else {
    // 앙가르드: 숨 쉬며 칼끝이 조금씩 흔들리고, 가볍게 발을 고른다
    const b = Math.sin(t * 2.2 + F.x), s = Math.sin(t * 1.3 + F.x * 0.3);
    p = { ...K.idle, lean: K.idle.lean + b * 0.02, fT: K.idle.fT + s * 0.04, bT: K.idle.bT - s * 0.03, sw: K.idle.sw + Math.sin(t * 3.1) * 0.05, sF: K.idle.sF + b * 0.03, dx: s * 3 };
  }
  if (F.hurt > 0) p = mix(p, K.hit, ease(Math.min(1, F.hurt)));
  return p;
}

// ---------- 색 ----------
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (k >= 0) { r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; } else { r *= 1 + k; g *= 1 + k; b *= 1 + k; }
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}
const v = (a, L) => [Math.sin(a) * L, Math.cos(a) * L];
const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
const lerp2 = (p, q, k) => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];

// ---------- 뼈대 ----------
export function skeleton(p) {
  const fHip = [5, 0], bHip = [-5, 0];
  const fKnee = add(fHip, v(p.fT, TH)), fAnk = add(fKnee, v(p.fS, SH));
  const bKnee = add(bHip, v(p.bT, TH)), bAnk = add(bKnee, v(p.bS, SH));
  const up = [Math.sin(p.lean), -Math.cos(p.lean)];
  const sh = [up[0] * TORSO, up[1] * TORSO];
  const sShoulder = add(sh, [Math.cos(p.lean) * 7, Math.sin(p.lean) * 7]), oShoulder = add(sh, [-Math.cos(p.lean) * 6, -Math.sin(p.lean) * 6]);
  const sElbow = add(sShoulder, v(p.sU, UA)), sHand = add(sElbow, v(p.sF, FA));
  const oElbow = add(oShoulder, v(p.oU, UA)), oHand = add(oElbow, v(p.oF, FA));
  const ha = p.lean + p.head;
  const neckTop = add(sh, [Math.sin(ha) * NECK, -Math.cos(ha) * NECK]);
  const headC = add(neckTop, [Math.sin(ha) * (HEAD_R - 2), -Math.cos(ha) * (HEAD_R - 2)]);
  // 발이 갑판에 닿도록 엉덩이 높이를 정한다 (무릎을 꿇으면 무릎이 닿는다)
  const low = Math.max(fAnk[1], bAnk[1], fKnee[1] - 6, bKnee[1] - 6) + 7;
  return { fHip, bHip, fKnee, fAnk, bKnee, bAnk, sh, sShoulder, oShoulder, sElbow, sHand, oElbow, oHand, neckTop, headC, ha, hipY: GROUND - low };
}

// ---------- 그리기 도구 ----------
// 빛: 화면 오른쪽 위. 왼쪽을 보는 선장은 몸 기준으로 빛이 뒤에서 온다.
function limb(c, a, b, w1, w2, col, lit) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), nx = -Math.sin(ang), ny = Math.cos(ang);
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, w = Math.max(w1, w2);
  // 빛을 받는 쪽 법선
  const s = (nx * lit[0] + ny * lit[1]) > 0 ? 1 : -1;
  const g = c.createLinearGradient(mx - nx * w * s, my - ny * w * s, mx + nx * w * s, my + ny * w * s);
  g.addColorStop(0, shade(col, -0.45)); g.addColorStop(0.55, col); g.addColorStop(1, shade(col, 0.28));
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(a[0] + nx * w1 / 2, a[1] + ny * w1 / 2); c.lineTo(b[0] + nx * w2 / 2, b[1] + ny * w2 / 2);
  c.arc(b[0], b[1], w2 / 2, ang + Math.PI / 2, ang - Math.PI / 2, true);
  c.lineTo(a[0] - nx * w1 / 2, a[1] - ny * w1 / 2);
  c.arc(a[0], a[1], w1 / 2, ang - Math.PI / 2, ang + Math.PI / 2, true);
  c.closePath(); c.fill();
  c.strokeStyle = shade(col, -0.6); c.lineWidth = 1; c.stroke();
}
function poly(c, pts, fill, stroke) {
  c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath();
  c.fillStyle = fill; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1; c.stroke(); }
}
function ell(c, x, y, rx, ry, fill, rot = 0) { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); }
function metal(c, x0, y0, x1, y1, base) {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, shade(base, -0.5)); g.addColorStop(0.45, shade(base, 0.35)); g.addColorStop(0.55, shade(base, 0.7)); g.addColorStop(1, shade(base, -0.3));
  return g;
}

// 장화: 발목에서 앞쪽으로
function boot(c, ank, shinAng, C, lit) {
  // 발은 갑판에 평평하게 둔다. 무릎을 꿇어 정강이가 눕혀졌을 때만 발끝이 바닥을 짚는다.
  const fa = shinAng < -1.2 ? shinAng + Math.PI / 2 : Math.PI / 2 + Math.max(-0.35, Math.min(0.35, shinAng * 0.3));
  const toe = add(ank, v(fa, 17)), heel = add(ank, v(fa, -6));
  const sole = [0, 7];
  poly(c, [add(heel, [0, -5]), add(ank, [-1, -9]), add(toe, [-2, -4]), add(toe, sole), add(heel, sole)], C.boots, shade(C.boots, -0.5));
  c.fillStyle = shade(C.boots, 0.25); c.fillRect(toe[0] - 6, toe[1] - 3, 5, 2);
}

// ---------- 칼 ----------
// 손에서 칼끝 방향(+x)으로 그린다
function weapon(c, kind, t, F) {
  const L = BLADE[kind];
  const steel = '#d8dee6';
  // 손잡이와 폼멜
  c.fillStyle = kind === 'hwando' || kind === 'jian' ? '#2a1a14' : '#4a2e1a';
  c.fillRect(-14, -2.6, 16, 5.2);
  c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 1; for (let i = -12; i < 2; i += 3) { c.beginPath(); c.moveTo(i, -2.6); c.lineTo(i + 2, 2.6); c.stroke(); }
  ell(c, -15, 0, 3.6, 3.6, '#c9a24a');
  // 날
  c.beginPath();
  if (kind === 'rapier') { c.moveTo(4, -1.8); c.lineTo(L, -0.4); c.lineTo(L + 3, 0); c.lineTo(L, 0.4); c.lineTo(4, 1.8); }
  else if (kind === 'cutlass') { c.moveTo(4, -3.5); c.quadraticCurveTo(L * 0.6, -6, L, -2); c.lineTo(L - 6, 2.5); c.quadraticCurveTo(L * 0.5, 1, 4, 3); }
  else if (kind === 'kilij') { c.moveTo(4, -3); c.quadraticCurveTo(L * 0.55, -9, L * 0.78, -9); c.lineTo(L, -5); c.lineTo(L * 0.8, -1); c.quadraticCurveTo(L * 0.5, -1, 4, 3); }
  else if (kind === 'hwando') { c.moveTo(4, -3); c.quadraticCurveTo(L * 0.6, -6, L, -4); c.lineTo(L - 5, 0); c.quadraticCurveTo(L * 0.6, -1.5, 4, 3); }
  else { c.moveTo(4, -3.2); c.lineTo(L - 6, -2.6); c.lineTo(L + 2, 0); c.lineTo(L - 6, 2.6); c.lineTo(4, 3.2); }
  c.closePath();
  c.fillStyle = metal(c, 0, -5, 0, 4, steel); c.fill();
  c.strokeStyle = 'rgba(40,46,56,0.7)'; c.lineWidth = 0.8; c.stroke();
  // 날의 능선과 반짝임
  c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(8, kind === 'kilij' ? -2 : -0.6); c.lineTo(L * 0.9, kind === 'kilij' ? -6 : kind === 'rapier' ? -0.2 : -1.6); c.stroke();
  const glint = (Math.sin(t * 2.3 + F.x) + 1) / 2;
  if (glint > 0.93) { c.fillStyle = `rgba(255,255,240,${(glint - 0.93) * 12})`; c.beginPath(); c.arc(L * 0.75, -1, 5, 0, Math.PI * 2); c.fill(); }
  // 코등이
  if (kind === 'rapier') {
    // 컵과 휘어진 퀼론
    c.fillStyle = metal(c, 0, -10, 0, 10, '#c9a24a'); c.beginPath(); c.ellipse(3, 0, 3.5, 9, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#a8862a'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(3, -9); c.quadraticCurveTo(-4, -16, -10, -12); c.moveTo(3, 9); c.quadraticCurveTo(10, 14, 12, 8); c.stroke();
    c.beginPath(); c.moveTo(2, -4); c.quadraticCurveTo(-8, -10, -14, -3); c.stroke();          // 손을 감싸는 고리
  } else if (kind === 'cutlass') {
    c.fillStyle = metal(c, 0, -8, 0, 8, '#9aa2aa'); c.beginPath(); c.moveTo(4, -6); c.quadraticCurveTo(-6, -12, -14, -5); c.lineTo(-14, 5); c.quadraticCurveTo(-6, 12, 4, 6); c.closePath(); c.globalAlpha = 0.85; c.fill(); c.globalAlpha = 1;
  } else if (kind === 'kilij') {
    c.fillStyle = '#c9a24a'; c.fillRect(1, -7, 4, 14); ell(c, 3, -8, 2.5, 2.5, '#c9a24a'); ell(c, 3, 8, 2.5, 2.5, '#c9a24a');
  } else if (kind === 'hwando') {
    ell(c, 3, 0, 3, 8, metal(c, 0, -8, 0, 8, '#8a7a5a'));
    // 칼자루 끝 붉은 매듭과 술
    const sw = Math.sin(t * 4 + F.x) * 4;
    c.strokeStyle = '#b82222'; c.lineWidth = 2; c.beginPath(); c.moveTo(-16, 0); c.quadraticCurveTo(-22, 8, -20 + sw, 18); c.stroke();
    ell(c, -20 + sw, 20, 2.5, 5, '#d02a2a');
  } else {
    c.fillStyle = '#c9a24a'; poly(c, [[1, -8], [6, -4], [6, 4], [1, 8], [-1, 0]], '#c9a24a');
    const sw = Math.sin(t * 4 + F.x) * 4;
    c.strokeStyle = '#d0a020'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-16, 0); c.quadraticCurveTo(-24, 10, -22 + sw, 22); c.stroke();
    ell(c, -22 + sw, 24, 2.5, 6, '#e8b830');
  }
}

// ---------- 머리 ----------
function head(c, C, F, attacking) {
  const skin = C.skin;
  // 뒷머리
  if (C.hat !== 'turban' && C.hat !== 'joseon') {
    ell(c, -5, -1, 12, 14, C.hair);
    if (C.longHair) { poly(c, [[-14, -4], [-4, -6], [-2, 18], [-14, 16]], C.hair); }
    if (C.hat === 'ming' || C.hat === 'joseon') ell(c, -8, -6, 5, 5, C.hair);
  }
  // 귀
  ell(c, -3, 1, 3.5, 5, shade(skin, -0.15));
  // 얼굴 (옆얼굴)
  const g = c.createRadialGradient(6, -4, 2, 2, 0, 18);
  g.addColorStop(0, shade(skin, 0.15)); g.addColorStop(0.7, skin); g.addColorStop(1, shade(skin, -0.3));
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(-4, -13); c.quadraticCurveTo(10, -16, 12, -6);     // 이마
  c.lineTo(12.5, -3); c.lineTo(17, 4); c.lineTo(12.5, 5.5);    // 코
  c.lineTo(13, 8); c.quadraticCurveTo(12, 13, 9, 14.5);        // 입과 턱
  c.quadraticCurveTo(2, 16, -2, 10); c.quadraticCurveTo(-7, 2, -4, -13);
  c.closePath(); c.fill();
  c.strokeStyle = shade(skin, -0.45); c.lineWidth = 1; c.stroke();
  // 눈과 눈썹
  if (F.hurt > 0.3 || F.pose === 'down') { c.strokeStyle = '#2a1a10'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(5, -3); c.lineTo(10, -2); c.stroke(); }
  else {
    ell(c, 8, -3, 2.8, 1.8, '#f4efe6'); ell(c, 9, -3, 1.4, 1.5, '#2a1a10');
    c.strokeStyle = shade(skin, -0.5); c.lineWidth = 0.8; c.beginPath(); c.moveTo(5.2, -4.5); c.quadraticCurveTo(8, -5.6, 11, -4); c.stroke();
  }
  c.strokeStyle = C.beard === 'none' || C.beard === 'stubble' ? shade(C.hair, 0.1) : C.beardCol; c.lineWidth = 2;
  c.beginPath(); c.moveTo(4.5, attacking ? -8.5 : -7.5); c.lineTo(11.5, -7); c.stroke();
  // 입: 공격할 때는 기합을 지른다
  if (attacking) ell(c, 11, 10, 2.2, 1.8, '#4a1a14');
  else { c.strokeStyle = shade(skin, -0.5); c.lineWidth = 1; c.beginPath(); c.moveTo(9, 9.5); c.lineTo(12.5, 9); c.stroke(); }
  // 볼 그늘
  ell(c, 3, 5, 5, 4, 'rgba(160,70,50,0.12)');
  // 수염
  const bc = C.beardCol;
  if (C.beard === 'stubble') { c.fillStyle = 'rgba(40,26,16,0.28)'; c.beginPath(); c.moveTo(-1, 6); c.quadraticCurveTo(4, 16, 10, 14.5); c.lineTo(13, 8); c.lineTo(9, 7); c.closePath(); c.fill(); }
  if (C.beard === 'mustache' || C.beard === 'goatee' || C.beard === 'full' || C.beard === 'long') {
    poly(c, [[8, 7], [15, 7.2], [14, 9.5], [10, 8.6]], bc);                                   // 콧수염
  }
  if (C.beard === 'goatee') poly(c, [[9, 12], [13, 11.5], [11, 22], [8, 16]], bc);
  if (C.beard === 'full' || C.beard === 'long') {
    const len = C.beard === 'long' ? 34 : 20;
    c.fillStyle = bc; c.beginPath();
    c.moveTo(-2, 2); c.quadraticCurveTo(0, 12, 6, 13); c.lineTo(13, 10); c.quadraticCurveTo(15, 14, 12, len * 0.6);
    c.quadraticCurveTo(9, len, 4, len); c.quadraticCurveTo(-4, len * 0.6, -3, 4); c.closePath(); c.fill();
    c.strokeStyle = shade(bc, 0.25); c.lineWidth = 0.7;
    for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(1 + i * 2.2, 13); c.quadraticCurveTo(2 + i * 2, len * 0.7, 3 + i * 1.4, len - 3); c.stroke(); }
  }
  hat(c, C);
}

function hat(c, C) {
  const h = C.hatCol;
  switch (C.hat) {
    case 'tricorn': {
      // 세 귀를 접어 올린 삼각모: 옆에서 보면 앞뒤로 뾰족한 챙과 둥근 몸통
      poly(c, [[-22, -11], [-10, -15], [6, -16], [20, -13], [25, -7], [8, -9], [-8, -8], [-20, -6]], h, '#000');
      c.beginPath(); c.moveTo(-14, -13); c.quadraticCurveTo(0, -32, 16, -13); c.closePath(); c.fillStyle = shade(h, 0.08); c.fill();
      c.strokeStyle = '#d9b04a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-22, -11); c.lineTo(-10, -15); c.lineTo(6, -16); c.lineTo(20, -13); c.lineTo(25, -7); c.stroke();
      ell(c, 12, -15, 3, 3, '#f2ece0'); ell(c, 12, -15, 1.2, 1.2, '#b82222');    // 모표
      break;
    }
    case 'morion': {
      // 스페인 모리온 투구: 볏이 선 둥근 철모와 앞뒤로 휘어 올라간 챙
      const g = metal(c, -16, -30, 16, -6, h);
      c.fillStyle = g; c.beginPath(); c.moveTo(-26, -6); c.quadraticCurveTo(-18, -12, -12, -12); c.lineTo(12, -12); c.quadraticCurveTo(20, -12, 26, -5); c.quadraticCurveTo(18, -16, 0, -15); c.quadraticCurveTo(-18, -16, -26, -6); c.fill();
      c.beginPath(); c.ellipse(0, -14, 13, 13, 0, Math.PI, 0); c.fill();
      c.beginPath(); c.moveTo(-10, -22); c.quadraticCurveTo(0, -36, 10, -22); c.quadraticCurveTo(0, -26, -10, -22); c.fill();      // 볏
      c.strokeStyle = shade(h, -0.6); c.lineWidth = 1; c.stroke();
      for (const x of [-9, -3, 3, 9]) ell(c, x, -13.5, 0.9, 0.9, '#e8d8a0');                                                        // 리벳
      break;
    }
    case 'beret': case 'cap': {
      const big = C.hat === 'beret' ? 1.25 : 1;
      ell(c, -1, -13, 17 * big, 6 * big, h, -0.12);
      ell(c, 1, -16, 12 * big, 6 * big, shade(h, 0.1), -0.12);
      c.strokeStyle = shade(h, -0.6); c.lineWidth = 1; c.beginPath(); c.ellipse(-1, -13, 17 * big, 6 * big, -0.12, 0, Math.PI * 2); c.stroke();
      if (C.plume) { c.strokeStyle = C.plume; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(-6, -17); c.quadraticCurveTo(-20, -28, -30, -18); c.stroke(); c.lineCap = 'butt'; }
      break;
    }
    case 'chaperon': {
      // 엔히크 왕자 초상의 크고 검은 샤프롱
      c.fillStyle = h; c.beginPath(); c.moveTo(-18, -4); c.quadraticCurveTo(-24, -22, -6, -28); c.quadraticCurveTo(18, -32, 20, -14); c.quadraticCurveTo(16, -10, 10, -12); c.quadraticCurveTo(-4, -14, -10, -2); c.closePath(); c.fill();
      c.strokeStyle = '#3a3a3a'; c.lineWidth = 1; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-14 + i * 7, -26 + i); c.quadraticCurveTo(-10 + i * 7, -18, -12 + i * 7, -10); c.stroke(); }
      break;
    }
    case 'turban': {
      // 터번: 여러 겹 감은 흰 천과 붉은 꼭지
      ell(c, 0, -27, 6, 7, '#b8282a');
      for (let i = 0; i < 4; i++) { ell(c, 0, -12 - i * 4.2, 19 - i * 2.4, 7.5, shade(h, -0.05 * i)); c.strokeStyle = shade(h, -0.25); c.lineWidth = 1; c.beginPath(); c.ellipse(0, -12 - i * 4.2, 19 - i * 2.4, 7.5, 0.25 * (i % 2 ? 1 : -1), 0.2, Math.PI - 0.2); c.stroke(); }
      ell(c, 13, -17, 3, 3.5, '#2a8a5a'); ell(c, 13, -17, 1.2, 1.2, '#d9f0e0');
      break;
    }
    case 'joseon': {
      // 조선 투구: 세로 철판을 이은 둥근 투구, 위로 솟은 삼지창 꼭지와 붉은 상모, 목을 덮는 드림
      poly(c, [[-15, -6], [-20, 14], [-6, 16], [-4, 2]], '#7a1a18', '#3a0a0a');                                   // 뒷드림
      for (let i = 0; i < 4; i++) { c.strokeStyle = '#c9a24a'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-17, -2 + i * 4.5); c.lineTo(-6, i * 4.5); c.stroke(); }
      c.fillStyle = metal(c, -14, -28, 14, -6, h); c.beginPath(); c.ellipse(0, -11, 15, 15, 0, Math.PI, 0); c.fill();
      c.strokeStyle = '#c9a24a'; c.lineWidth = 1; for (const x of [-9, -3, 3, 9]) { c.beginPath(); c.moveTo(x * 0.6, -25); c.quadraticCurveTo(x * 1.1, -18, x * 1.5, -11); c.stroke(); }
      c.fillStyle = '#c9a24a'; c.fillRect(-16, -12, 32, 3);                                                         // 이마 띠
      c.fillRect(-1.2, -40, 2.4, 15); poly(c, [[-5, -38], [0, -46], [5, -38], [0, -41]], '#c9a24a');               // 꼭지
      ell(c, 0, -30, 4.5, 3, '#d02a2a');                                                                           // 상모
      poly(c, [[10, -9], [22, -7], [10, -6]], h);                                                                  // 차양
      break;
    }
    case 'ming': {
      // 명나라 관리의 오사모: 검고 둥근 모자와 뒤로 뻗은 두 날개
      ell(c, -2, -14, 14, 10, h); ell(c, -4, -22, 9, 7, shade(h, 0.08));
      poly(c, [[-12, -16], [-34, -20], [-34, -14], [-12, -12]], h);
      c.strokeStyle = '#3a3a3a'; c.lineWidth = 1; c.beginPath(); c.moveTo(-14, -10); c.lineTo(12, -10); c.stroke();
      break;
    }
  }
}

// ---------- 한 사람 ----------
// F: { x, pose, poseT, hurt }, dir: 1 = 오른쪽을 본다
export function drawFighter(c, F, dir, C, t) {
  const p = poseAt(F, t), S = skeleton(p);
  const attacking = (F.pose === 'slash' || F.pose === 'lunge') && F.poseT > 0.15 && F.poseT < 0.7;
  const x = F.x + p.dx * (p.dx > 0 ? (F.dxMul ?? 1) : 1) * dir;   // dxMul: 둘이 함께 달려들 때 몸이 겹치지 않게
  const lit = [0.55 * dir, -0.83];           // 몸 기준 빛 방향
  // 그림자: 발밑, 그리고 석양(오른쪽 뒤)이 왼쪽으로 길게 늘인 그림자
  ell(c, x, GROUND + 4, 58, 9, 'rgba(10,4,0,0.35)');
  ell(c, x - 80, GROUND + 7, 80, 6, 'rgba(10,4,0,0.16)');
  c.save();
  c.translate(x, S.hipY); c.scale(dir, 1);

  const coatDark = shade(C.coat, -0.25);
  const long = C.body === 'robe' ? 0.98 : C.body === 'kaftan' ? 0.82 : C.body === 'coat' ? 0.62 : C.body === 'armor' ? 0.64 : 0;
  // 뒷다리
  limb(c, S.bHip, S.bKnee, 15, 12, shade(C.pants, -0.2), lit);
  limb(c, S.bKnee, S.bAnk, 12, 10, shade(C.boots, -0.1), lit);
  boot(c, S.bAnk, p.bS, { boots: shade(C.boots, -0.15) }, lit);
  // 빈 팔 (몸 뒤)
  const sleeve = C.body === 'robe' || C.body === 'kaftan';
  limb(c, S.oShoulder, S.oElbow, 12, 10, coatDark, lit);
  limb(c, S.oElbow, S.oHand, sleeve ? 14 : 10, sleeve ? 16 : 8, coatDark, lit);
  ell(c, S.oHand[0], S.oHand[1], 5, 5, shade(C.skin, -0.12));
  // 앞다리
  limb(c, S.fHip, S.fKnee, 16, 12, C.pants, lit);
  limb(c, S.fKnee, S.fAnk, 12, 10, C.boots, lit);
  // 장화 목 (접힌 가죽)
  if (C.body !== 'robe') { const cuff = lerp2(S.fKnee, S.fAnk, 0.12); limb(c, add(cuff, [-1, -2]), add(cuff, [1, 4]), 16, 16, shade(C.boots, 0.12), lit); }
  boot(c, S.fAnk, p.fS, C, lit);
  // 더블릿의 부푼 반바지
  if (C.body === 'doublet') {
    for (const [hp, kn, sd] of [[S.bHip, S.bKnee, -0.15], [S.fHip, S.fKnee, 0]]) {
      const m = lerp2(hp, kn, 0.35);
      c.save(); c.translate(m[0], m[1]); c.rotate(Math.atan2(kn[1] - hp[1], kn[0] - hp[0]));
      const g = c.createLinearGradient(0, -12, 0, 12); g.addColorStop(0, shade(C.coat, sd - 0.3)); g.addColorStop(0.5, shade(C.coat, sd + 0.1)); g.addColorStop(1, shade(C.coat, sd - 0.4));
      ell(c, 0, 0, 17, 12, g);
      c.strokeStyle = C.trim; c.lineWidth = 1.2; for (const yy of [-6, 0, 6]) { c.beginPath(); c.moveTo(-14, yy); c.quadraticCurveTo(0, yy + 2, 14, yy); c.stroke(); }
      c.restore();
    }
  }

  // ---------- 몸통과 옷자락 ----------
  // 옷자락은 두 무릎(또는 발목) 쪽으로 펼쳐져 자세를 따라간다
  if (long > 0) {
    const sway = Math.sin(t * 3 + F.x) * 2 + (F.pose === 'lunge' || F.pose === 'slash' ? -6 : 0);
    const ft = long > 0.9 ? lerp2(S.fKnee, S.fAnk, 0.85) : lerp2([0, 0], S.fKnee, long * 1.6);
    const bk = long > 0.9 ? lerp2(S.bKnee, S.bAnk, 0.85) : lerp2([0, 0], S.bKnee, long * 1.6);
    const g = c.createLinearGradient(-20, 0, 24, 0); g.addColorStop(0, shade(C.coat, -0.35)); g.addColorStop(0.6, C.coat); g.addColorStop(1, shade(C.coat, 0.18 * dir));
    c.fillStyle = g; c.beginPath();
    c.moveTo(-14, -6); c.lineTo(15, -6);
    c.quadraticCurveTo(ft[0] + 12, ft[1] * 0.5, ft[0] + 10, ft[1] + 4);
    c.quadraticCurveTo((ft[0] + bk[0]) / 2, Math.max(ft[1], bk[1]) + 10, bk[0] - 12 + sway, bk[1] + 4);
    c.quadraticCurveTo(-20 + sway * 0.5, bk[1] * 0.4, -14, -6);
    c.closePath(); c.fill(); c.strokeStyle = shade(C.coat, -0.55); c.lineWidth = 1; c.stroke();
    // 단 장식과 주름
    c.strokeStyle = C.trim; c.lineWidth = 2;
    c.beginPath(); c.moveTo(ft[0] + 10, ft[1] + 4); c.quadraticCurveTo((ft[0] + bk[0]) / 2, Math.max(ft[1], bk[1]) + 10, bk[0] - 12 + sway, bk[1] + 4); c.stroke();
    c.strokeStyle = 'rgba(0,0,0,0.22)'; c.lineWidth = 1.2;
    for (const k of [0.3, 0.55, 0.8]) { const a = lerp2([0, -4], lerp2(ft, bk, k), 0.2), b = lerp2([0, -4], lerp2(ft, bk, k), 0.95); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
    // 두정갑 아랫단: 비늘 줄
    if (C.body === 'armor') {
      c.save(); c.clip();
      for (let row = 0; row < 6; row++) for (let i = -4; i < 6; i++) { c.fillStyle = (row + i) % 2 ? shade(C.armorCol, 0.1) : C.armorCol; c.fillRect(i * 8 - 4 + (row % 2) * 4, 4 + row * 9, 7, 7); ell(c, i * 8 + (row % 2) * 4, 7.5 + row * 9, 0.9, 0.9, C.trim); }
      c.restore();
    }
  }
  c.save(); c.rotate(p.lean);
  // 상체 (엉덩이 = 0,0 에서 어깨 = 0,-TORSO)
  const tg = c.createLinearGradient(-18, 0, 22, 0);
  const body = C.body === 'armor' ? C.armorCol : C.coat;
  tg.addColorStop(0, shade(body, -0.4)); tg.addColorStop(0.6, body); tg.addColorStop(1, shade(body, 0.2 * dir));
  c.fillStyle = tg; c.beginPath();
  c.moveTo(-15, -TORSO + 4); c.quadraticCurveTo(-4, -TORSO - 2, 14, -TORSO + 3);
  c.quadraticCurveTo(24, -TORSO + 26, 19, -30);                     // 가슴
  c.quadraticCurveTo(C.body === 'doublet' ? 24 : 16, -10, 14, -2);  // 배 (더블릿은 볼록한 '완두 배')
  c.lineTo(-14, -2); c.quadraticCurveTo(-19, -TORSO * 0.5, -15, -TORSO + 4);
  c.closePath(); c.fill(); c.strokeStyle = shade(body, -0.6); c.lineWidth = 1; c.stroke();
  if (C.body === 'armor') {
    // 두정갑: 둥근 못이 박힌 비늘판 줄, 어깨 견갑
    c.save(); c.clip();
    for (let row = 0; row < 9; row++) for (let i = -3; i < 4; i++) { c.fillStyle = (row + i) % 2 ? shade(C.armorCol, 0.12) : shade(C.armorCol, -0.05); c.fillRect(i * 8 - 2 + (row % 2) * 4, -TORSO + 4 + row * 8, 7, 7); ell(c, i * 8 + 1.5 + (row % 2) * 4, -TORSO + 7.5 + row * 8, 1, 1, C.trim); }
    c.restore();
    c.fillStyle = C.coat; c.fillRect(-15, -TORSO + 1, 30, 6);           // 붉은 깃
  } else if (C.body === 'coat') {
    poly(c, [[6, -TORSO + 3], [16, -TORSO + 6], [10, -36], [4, -40]], C.trim);                    // 라펠
    ell(c, 9, -TORSO + 6, 5, 8, '#f2ece0');                                                        // 크라바트
    for (let i = 0; i < 5; i++) ell(c, 13 - i * 0.6, -50 + i * 9, 1.5, 1.5, C.trim);              // 단추
  } else if (C.body === 'doublet') {
    c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 1; for (const xx of [-6, 2, 10]) { c.beginPath(); c.moveTo(xx, -TORSO + 6); c.quadraticCurveTo(xx + 4, -30, xx + 2, -4); c.stroke(); }
    for (let i = 0; i < 7; i++) ell(c, 17 - (i > 3 ? (i - 3) * 1.2 : 0), -TORSO + 10 + i * 9, 1.3, 1.3, C.trim);
  } else if (C.body === 'kaftan') {
    c.strokeStyle = C.trim; c.lineWidth = 1.6; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(6, -56 + i * 9); c.lineTo(18, -56 + i * 9); c.stroke(); ell(c, 18, -56 + i * 9, 1.6, 1.6, C.trim); }
  } else if (C.body === 'robe') {
    c.strokeStyle = C.trim; c.lineWidth = 2; c.beginPath(); c.moveTo(-6, -TORSO + 2); c.quadraticCurveTo(8, -48, 16, -30); c.stroke();   // 섶
    if (C.badge) { c.fillStyle = C.trim; c.fillRect(-4, -48, 16, 16); c.strokeStyle = '#7a1a10'; c.lineWidth = 1; c.strokeRect(-2, -46, 12, 12); ell(c, 4, -40, 3.5, 2.5, '#2a6a8a'); } // 흉배
  }
  // 허리: 띠 · 장식띠 · 버클
  if (C.sash) { c.fillStyle = C.sash; c.fillRect(-16, -14, 34, 11); poly(c, [[-14, -6], [-22, 16], [-16, 18], [-10, -4]], shade(C.sash, -0.15)); }
  else {
    c.fillStyle = C.body === 'robe' ? C.trim : '#2a1a10'; c.fillRect(-15, -10, 32, 6);
    if (C.body !== 'robe') { c.strokeStyle = '#d9b04a'; c.lineWidth = 1.6; c.strokeRect(10, -11, 6, 8); }
  }
  if (C.ruff) { for (let i = 0; i < 9; i++) ell(c, -8 + i * 2.6, -TORSO - 2 + Math.sin(i) * 1.5, 3.4, 5.5, i % 2 ? '#f6f2ea' : '#e2dccf'); }
  else if (C.body === 'doublet') { c.fillStyle = '#f2ece0'; c.fillRect(-5, -TORSO - 3, 14, 4); }
  c.restore();

  // ---------- 목과 머리 ----------
  limb(c, S.sh, S.neckTop, 11, 10, shade(C.skin, -0.1), lit);
  c.save(); c.translate(S.headC[0], S.headC[1]); c.rotate(S.ha);
  head(c, C, F, attacking);
  c.restore();

  // ---------- 칼 든 팔 ----------
  limb(c, S.sShoulder, S.sElbow, 13, 11, C.body === 'armor' ? C.coat : C.coat, lit);
  if (C.body === 'armor') { c.save(); c.translate(S.sShoulder[0], S.sShoulder[1]); c.rotate(-p.sU + Math.PI / 2); c.fillStyle = metal(c, -10, -10, 10, 10, C.armorCol); c.beginPath(); c.ellipse(4, 0, 12, 9, 0, 0, Math.PI * 2); c.fill(); c.restore(); }
  limb(c, S.sElbow, S.sHand, sleeve ? 14 : 11, sleeve ? 17 : 9, C.coat, lit);
  // 소맷부리 (흰 셔츠 또는 금테)
  const cuffP = lerp2(S.sElbow, S.sHand, 0.82);
  ell(c, cuffP[0], cuffP[1], 6, 6, C.body === 'coat' || C.body === 'doublet' ? '#f2ece0' : C.trim);
  // 칼
  c.save(); c.translate(S.sHand[0], S.sHand[1]); c.rotate(Math.PI / 2 - p.sw);
  weapon(c, C.weapon, t, F);
  c.restore();
  // 칼자루를 쥔 손 (칼 위에)
  ell(c, S.sHand[0], S.sHand[1], 5.5, 5.5, C.skin); ell(c, S.sHand[0] + 1.5, S.sHand[1] - 1.5, 2.5, 2, shade(C.skin, 0.2));
  c.restore();

  // 칼끝 (화면 좌표) — 궤적과 불꽃 위치에 쓴다
  const tip = add(S.sHand, v(p.sw, BLADE[C.weapon]));
  F.tip = [x + tip[0] * dir, S.hipY + tip[1]];
  F.hand = [x + S.sHand[0] * dir, S.hipY + S.sHand[1]];
}

// 빠르게 휘두를 때 칼끝이 남기는 잔상
export function drawTrail(c, F) {
  const tr = F.trail || (F.trail = []);
  if (F.tip) tr.push([F.tip[0], F.tip[1], F.hand[0], F.hand[1]]);
  while (tr.length > 7) tr.shift();
  const moving = F.pose === 'slash' || F.pose === 'lunge';
  if (!moving || F.poseT > 0.55 || tr.length < 3) return;
  c.save();
  for (let i = 1; i < tr.length; i++) {
    const a = tr[i - 1], b = tr[i], k = i / tr.length;
    c.fillStyle = `rgba(235,245,255,${0.28 * k})`;
    c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(b[2] * 0.3 + b[0] * 0.7, b[3] * 0.3 + b[1] * 0.7); c.lineTo(a[2] * 0.3 + a[0] * 0.7, a[3] * 0.3 + a[1] * 0.7); c.closePath(); c.fill();
  }
  c.restore();
}
