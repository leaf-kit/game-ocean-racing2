// 일기토 — 앞서 가는 배를 붙잡아 일대일로 승부를 가린다.
//
// 포격은 스쳐 지나가며 깎는 싸움이고, 일기토는 멈춰 서서 끝을 보는 싸움이다.
// 그래서 값이 비싸다. 붙는 동안 두 배 모두 멈추므로 나머지 함대가 앞서 나간다.
//   이기면 상대를 나포한다 — 돛을 내리고, 그 배는 그 판에서 더는 달리지 못한다.
//   지면 전복된다 — 내 항해가 거기서 끝난다.
//
// 승부는 기싸움이다. 연타로 저울을 내 쪽으로 밀고, 상대는 꾸준히 되밀어 온다.
// 상대의 힘은 시간이 갈수록 커지므로(지침), 손을 놓으면 반드시 진다. 무승부는 없다.

// 손놀림만으로 결판나면 함선을 고른 보람이 없다. 그래서 연타에 천장을 둔다.
// 아무리 빨리 두드려도 노를 젓는 속도에는 한계가 있다(TAP_MIN_GAP).
// 천장에 닿은 뒤부터는 '완력비'가 승패를, 연타 속도가 걸리는 시간을 정한다.
const START_METER = 0.45;   // 저울의 시작점. 절반보다 조금 불리하게 둔다.
const TAP_STEP = 0.040;     // 연타 한 번이 미는 양
const TAP_RATE = 9;         // 노를 젓는 속도의 한계. 초당 이만큼까지만 저울에 실린다.
const TAP_QUEUE = 3;        // 쌓아 둘 수 있는 연타. 손이 빠른 건 봐주되 몰아 치기는 막는다.
const PUSH_BASE = 0.21;     // 완력이 같을 때 상대가 되밀어 오는 힘 (초당)
const FATIGUE = 0.008;      // 1초마다 이만큼 더 세게 밀어 온다 — 손을 놓으면 반드시 진다
const SURGE_EVERY = 3.0;    // 상대가 한 번씩 크게 밀어붙이는 주기
const SURGE_TIME = 0.7;
const SURGE_MUL = 1.8;
const RATIO_MIN = 0.5, RATIO_MAX = 2;   // 완력비는 이 범위로 묶는다 (무의미한 학살 방지)

export const DUEL_RANGE = 180;    // 이 거리 안에 있어야 도전할 수 있다
export const DUEL_LEAD_MIN = 6;   // 나보다 이만큼은 앞서 있어야 한다 (진행 거리)
export const DUEL_FOV = 1.15;     // 뱃머리에서 이 각도 안에 보여야 한다

function angleDiff(a, b) { let d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; }

// 배의 일기토 완력. 내구가 절반, 속도와 조타가 나머지를 이룬다.
// ships.js 의 stats 는 0~10 눈금이고 내구의 키 이름은 durability 다.
// 결과는 대략 0.3(소형선) ~ 1.0(거함) 사이로 떨어진다.
export function duelStrength(def) {
  const s = def.stats || {};
  const base = ((s.durability ?? 5) * 2 + (s.handling ?? 5) + (s.speed ?? 5)) / 40;
  return base * (def.legend ? 1.2 : 1) * (def.turtle ? 1.1 : 1);
}

export class Duel {
  constructor() { this.reset(); }

  reset() {
    this.state = 'off';   // off | prompt | clash | won | lost
    this.foe = null;
    this.me = null;
    this.meter = START_METER;
    this.t = 0;
    this.taps = 0;
    this.pending = 0; this.release = 1;
    this.surgeT = SURGE_EVERY;
    this.surge = 0;
    this.foePush = 0;
    this.cooldown = 0;     // 물러난 직후 다시 도전하기까지
  }

  get busy() { return this.state === 'prompt' || this.state === 'clash'; }
  get clashing() { return this.state === 'clash'; }

  // 지금 도전할 수 있는 배들. 가까운 순서로 돌려준다.
  // 조건: 나보다 앞서 있고, 사거리 안이고, 뱃머리 쪽에 보이고, 아직 멀쩡한 라이벌.
  candidates(boats, player) {
    if (this.busy || this.cooldown > 0 || player.finished || player.captured) return [];
    const fx = Math.sin(player.heading), fz = Math.cos(player.heading);
    const out = [];
    for (const b of boats) {
      if (b === player || b.isPlayer) continue;
      if (b.consort) continue;                    // 내 동료함에게는 걸지 않는다
      if (b.finished || b.captured) continue;
      if (b.progress - player.progress < DUEL_LEAD_MIN) continue;
      const dx = b.pos.x - player.pos.x, dz = b.pos.z - player.pos.z;
      const dist = Math.hypot(dx, dz);
      if (dist > DUEL_RANGE) continue;
      if (Math.abs(angleDiff(Math.atan2(dx, dz), player.heading)) > DUEL_FOV) continue;
      if (dx * fx + dz * fz < 0) continue;        // 등 뒤는 제외
      out.push({ boat: b, dist });
    }
    return out.sort((a, b) => a.dist - b.dist);
  }

  // 표찰을 눌렀다 — 받을지 물러날지 묻는 단계
  open(foe) {
    if (this.busy || this.cooldown > 0) return false;
    this.state = 'prompt'; this.foe = foe;
    return true;
  }

  cancel() {
    if (this.state !== 'prompt') return;
    this.state = 'off'; this.foe = null; this.cooldown = 2.5;
  }

  // 완력비. 1 보다 크면 상대가 세다. 승패를 사실상 이 값이 정한다.
  ratio(player, foe) {
    const mine = Math.max(0.05, duelStrength(player.def));
    const theirs = duelStrength(foe.def) * (foe.skill ?? 1);
    return Math.max(RATIO_MIN, Math.min(RATIO_MAX, theirs / mine));
  }

  // 걸기 전에 보여 줄 전망. 지면 항해가 끝나므로 눈을 가린 채 고르게 두지 않는다.
  odds(player, foe) {
    const r = this.ratio(player, foe);
    return r < 0.85 ? 'good' : r > 1.15 ? 'bad' : 'even';
  }

  // 받았다 — 기싸움 시작
  begin(player) {
    if (this.state !== 'prompt' || !this.foe) return false;
    this.me = player;
    this.state = 'clash';
    this.meter = START_METER;
    this.t = 0; this.taps = 0;
    this.pending = 0; this.release = 1;
    this.surgeT = SURGE_EVERY; this.surge = 0;
    this.tapStep = TAP_STEP;
    this.foeRatio = this.ratio(player, this.foe);
    return true;
  }

  // 연타. 바로 저울에 싣지 않고 줄에 세운다.
  // 간격이 좁은 입력을 그냥 버리면, 상한을 조금 넘는 속도가 오히려 반으로 깎여
  // 빨리 두드린 쪽이 손해를 보는 뒤집힌 승부가 된다. 그래서 쌓아 두고 상한 속도로 푼다.
  tap() {
    if (this.state !== 'clash') return false;
    if (this.pending >= TAP_QUEUE) return false;   // 줄이 다 찼다 — 더 두드려도 쌓이지 않는다
    this.pending++; this.taps++;
    return true;
  }

  // 한 프레임. 결판이 나면 'win' 또는 'lose' 를 돌려준다. 그 밖에는 null.
  update(dt) {
    if (this.cooldown > 0) this.cooldown = Math.max(0, this.cooldown - dt);
    if (this.state !== 'clash') return null;
    this.t += dt;

    // 줄에 선 연타를 노 젓는 속도의 한계까지만 풀어 준다
    this.release += TAP_RATE * dt;
    while (this.pending > 0 && this.release >= 1) { this.pending--; this.release -= 1; this.meter += this.tapStep; }
    if (this.pending === 0) this.release = Math.min(this.release, 1);   // 쉬는 동안 쌓아 두지 않는다

    // 상대가 한 번씩 크게 밀어붙인다
    this.surgeT -= dt;
    if (this.surgeT <= 0) { this.surgeT = SURGE_EVERY + Math.random() * 1.2; this.surge = SURGE_TIME; }
    if (this.surge > 0) this.surge = Math.max(0, this.surge - dt);

    // 상대의 힘: 완력비에 비례한다. 거기에 지침이 쌓이고, 한 번씩 크게 밀어붙인다.
    this.foePush = (PUSH_BASE + this.t * FATIGUE) * this.foeRatio * (this.surge > 0 ? SURGE_MUL : 1);
    this.meter -= this.foePush * dt;

    // 저울을 1 에서 자르지 않는다 — 자르면 바로 아래 밀어내기에 깎여 meter >= 1 이 성립하지 않는다
    if (this.meter >= 1) { this.state = 'won'; return 'win'; }
    if (this.meter <= 0) { this.meter = 0; this.state = 'lost'; return 'lose'; }
    return null;
  }

  finish() { const foe = this.foe; this.reset(); this.cooldown = 3.5; return foe; }
}
