// 접현 일기토 (一騎討): 라이벌 함선에 배를 붙이면 선장끼리 갑판에서 칼을 맞댄다.
//   1. 접현 알림   배를 나란히 붙이면 화면에 "⚔ 일기토 [E]" 가 뜬다
//   2. 접현 메뉴   일기토 신청 / 항복 권유 / 그냥 지나가기. 메뉴가 열리면 경주가 멈춘다
//   3. 일기토 화면 경주와 따로 도는 전용 화면. 차례마다 세 수 가운데 하나를 고른다
//        ⚔ 베기  > 💥 찌르기  (빠른 칼이 큰 동작을 끊는다)
//        💥 찌르기 > 🛡 막기   (온몸을 실은 찌르기가 막기를 뚫는다)
//        🛡 막기  > ⚔ 베기    (흘려 받고 되받아친다)
//      상대의 자세를 보고 다음 수를 읽는다. 다만 노련한 상대는 자세로 속이기도 한다.
//      두 번 내리 이기면 기세가 올라 다음 일격이 1.5배.
// 결과는 main.js 가 경주에 반영한다 (이기면 상대 배가 멈추고, 지면 내 배가 멈춘다).
import { LANG } from './i18n.js?v=20261005i';
import { portraitSrc } from './figures.js?v=20261005i';
import { drawFighter, drawTrail, costumeOf, poseAt, IMPACT_T } from './duel-figure.js?v=20261005i';

const en = () => LANG === 'en';
const T = (ko, enText) => (en() ? enText : ko);

// 라이벌 이름(ships.js AI_NAMES 순서) → 인물 id. 카보토는 초상이 없다.
export const DUEL_FIG = ['dias', 'magellan', 'zhenghe', 'drake', 'yi', 'columbus', 'dagama', 'henry', 'albuquerque', null, 'vespucci', 'barbarossa'];
// 검술과 성향. aggr: 찌르기를 좋아함, guard: 막기를 좋아함
const FIGHTERS = {
  dias:        { sword: 58, aggr: 0.33, guard: 0.34 },
  magellan:    { sword: 66, aggr: 0.36, guard: 0.30 },
  zhenghe:     { sword: 64, aggr: 0.28, guard: 0.40 },
  drake:       { sword: 78, aggr: 0.42, guard: 0.24 },
  yi:          { sword: 82, aggr: 0.26, guard: 0.44 },
  columbus:    { sword: 55, aggr: 0.34, guard: 0.32 },
  dagama:      { sword: 70, aggr: 0.40, guard: 0.28 },
  henry:       { sword: 40, aggr: 0.25, guard: 0.45 },
  albuquerque: { sword: 74, aggr: 0.40, guard: 0.30 },
  vespucci:    { sword: 50, aggr: 0.30, guard: 0.36 },
  barbarossa:  { sword: 86, aggr: 0.46, guard: 0.22 },
};
export const fighterOf = (figId) => FIGHTERS[figId] || { sword: 60, aggr: 0.34, guard: 0.33 };

const MOVES = ['slash', 'parry', 'lunge'];
const BEATS = { slash: 'lunge', lunge: 'parry', parry: 'slash' };   // 키 가 값 을 이긴다
const BASE = { slash: 22, parry: 18, lunge: 30 };                   // 이겼을 때 입히는 기본 피해 (막기는 반격)
const MOVE_UI = {
  slash: { icon: '⚔', ko: '베기', en: 'Slash', key: '1' },
  parry: { icon: '🛡', ko: '막기', en: 'Parry', key: '2' },
  lunge: { icon: '💥', ko: '찌르기', en: 'Lunge', key: '3' },
};
// 상대 자세 (다음 수의 낌새)
const TELLS = {
  slash: { ko: '상대가 칼을 높이 치켜든다…', en: 'They raise the blade high…' },
  parry: { ko: '상대가 칼을 비스듬히 세우고 기다린다…', en: 'They angle the blade and wait…' },
  lunge: { ko: '상대가 칼끝을 낮추고 몸을 웅크린다…', en: 'They lower the point and crouch…' },
  none:  { ko: '상대의 눈빛을 읽을 수 없다.', en: 'You cannot read their eyes.' },
};
const ROUND_TIME = 7;   // 수를 고르는 제한 시간 (넘기면 막기)
const CLASH_TIME = 1.15;

const $ = (id) => document.getElementById(id);
function el(tag, attrs = {}, html = '') { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (html) e.innerHTML = html; return e; }

export class Boarding {
  constructor({ audio } = {}) {
    this.audio = audio;
    this.state = 'off';       // off | menu | choose | clash | end
    this._buildDom();
  }

  // ---------- DOM ----------
  _buildDom() {
    // 접현 알림 (경주 화면 위)
    this.prompt = el('button', { id: 'board-prompt', class: 'hidden', type: 'button' });
    document.body.appendChild(this.prompt);
    this.prompt.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); this.onPromptClick && this.onPromptClick(); });

    // 접현 메뉴
    this.menu = el('div', { id: 'board-menu', class: 'hidden' }, `
      <div class="bm-card">
        <div class="bm-head"><div class="bm-portrait" id="bm-portrait"></div>
          <div><div class="bm-kicker">${T('⚓ 접현 · 갈고리를 걸었다', '⚓ Boarding · grappling hooks away')}</div>
          <div class="bm-name" id="bm-name"></div><div class="bm-ship" id="bm-ship"></div></div></div>
        <p class="bm-text" id="bm-text"></p>
        <div class="bm-opts">
          <button type="button" data-c="duel"><b>⚔ ${T('일기토를 신청한다', 'Challenge to a duel')}</b><span>${T('선장끼리 칼을 맞댄다. 이기면 상대 배를 나포하거나 버리고, 지면 내 배가 나포된다', 'Captain against captain. Win and you take or scuttle her; lose and your ship is taken')}</span><i>1</i></button>
          <button type="button" data-c="demand"><b>🏴 ${T('항복을 권한다', 'Demand surrender')}</b><span id="bm-demand"></span><i>2</i></button>
          <button type="button" data-c="leave"><b>⛵ ${T('그냥 지나간다', 'Cast off and sail on')}</b><span>${T('갈고리를 풀고 경주로 돌아간다', 'Release the hooks and get back to the race')}</span><i>3</i></button>
        </div>
      </div>`);
    document.body.appendChild(this.menu);
    for (const b of this.menu.querySelectorAll('button')) b.addEventListener('click', (e) => { e.stopPropagation(); this._menuPick(b.dataset.c); });

    // 전리품: 이긴 뒤 진 배를 나포할지 버릴지
    this.spoils = el('div', { id: 'spoils-menu', class: 'hidden' }, `
      <div class="bm-card spoils">
        <div class="bm-head"><div class="bm-portrait" id="sp-portrait"></div>
          <div><div class="bm-kicker">${T('🏴 항복 · 진 배를 어떻게 할까', '🏴 Surrender · what of the beaten ship?')}</div>
          <div class="bm-name" id="sp-name"></div><div class="bm-ship" id="sp-ship"></div></div></div>
        <p class="bm-text">${T('상대 선원들이 무기를 내려놓았다. 어느 쪽이든 이 배는 더는 경주하지 못한다.', 'Their crew lays down arms. Either way, this ship races no more.')}</p>
        <div class="bm-opts">
          <button type="button" data-c="capture"><b>⚓ ${T('나포한다 — 전리품을 챙긴다', 'Take her — claim the spoils')}</b><span id="sp-loot"></span><i>1</i></button>
          <button type="button" data-c="scuttle"><b>🔥 ${T('버린다 — 배를 가라앉히고 곧장 떠난다', 'Scuttle her — sink the ship and sail on')}</b><span>${T('전리품은 없다. 대신 짐 없이 바로 전속으로 출발한다', 'No spoils, but you leave at once at full speed')}</span><i>2</i></button>
        </div>
      </div>`);
    document.body.appendChild(this.spoils);
    for (const b of this.spoils.querySelectorAll('button')) b.addEventListener('click', (e) => { e.stopPropagation(); this._spoilsPick(b.dataset.c); });

    // 일기토 화면
    const cmd = (m) => `<button type="button" class="dc-btn" data-m="${m}"><b>${MOVE_UI[m].icon}</b><span>${T(MOVE_UI[m].ko, MOVE_UI[m].en)}</span><i>${MOVE_UI[m].key}</i></button>`;
    this.screen = el('div', { id: 'duel-screen', class: 'hidden' }, `
      <canvas id="duel-canvas" width="960" height="540"></canvas>
      <div class="duel-title">${T('일 기 토', 'D U E L')}<small id="duel-round"></small></div>
      <div class="duel-side left"><div class="ds-portrait" id="ds-p-img"></div><div class="ds-info"><div class="ds-name" id="ds-p-name"></div>
        <div class="ds-hp"><div class="ds-hp-fill" id="ds-p-hp"></div><span id="ds-p-hpn"></span></div><div class="ds-ki" id="ds-p-ki"></div></div></div>
      <div class="duel-side right"><div class="ds-portrait" id="ds-r-img"></div><div class="ds-info"><div class="ds-name" id="ds-r-name"></div>
        <div class="ds-hp"><div class="ds-hp-fill" id="ds-r-hp"></div><span id="ds-r-hpn"></span></div><div class="ds-ki" id="ds-r-ki"></div></div></div>
      <div class="duel-tell" id="duel-tell"></div>
      <div class="duel-log" id="duel-log"></div>
      <div class="duel-bottom">
        <div class="duel-timer"><div id="duel-timer-fill"></div></div>
        <div class="duel-cmds">${cmd('slash')}${cmd('parry')}${cmd('lunge')}<button type="button" class="dc-btn flee" data-m="retreat"><b>🏳</b><span>${T('물러난다', 'Retreat')}</span><i>4</i></button></div>
        <div class="duel-rule">${T('⚔ 베기 → 💥 찌르기를 끊고 · 💥 찌르기 → 🛡 막기를 뚫고 · 🛡 막기 → ⚔ 베기를 받아친다', '⚔ Slash cuts off 💥 Lunge · 💥 Lunge breaks 🛡 Parry · 🛡 Parry turns ⚔ Slash')}</div>
      </div>
      <div class="duel-result hidden" id="duel-result"><div class="dr-title" id="dr-title"></div><div class="dr-sub" id="dr-sub"></div>
        <button type="button" id="dr-btn">${T('⛵ 항해로 돌아가기', '⛵ Back to the race')}</button></div>`);
    document.body.appendChild(this.screen);
    for (const b of this.screen.querySelectorAll('.dc-btn')) b.addEventListener('click', (e) => { e.stopPropagation(); this.pick(b.dataset.m); });
    $('dr-btn').addEventListener('click', (e) => { e.stopPropagation(); this._finish(); });
    this.cv = $('duel-canvas'); this.ctx = this.cv.getContext('2d');
  }

  get active() { return this.state !== 'off'; }

  // ---------- 접현 알림 ----------
  showPrompt(rival) {
    const key = rival.name;
    if (this._promptKey !== key) {
      this._promptKey = key;
      this.prompt.innerHTML = `⚔ <b>${rival.name}</b>${T('의 배에 접현!', ' — alongside!')} <span>${T('일기토', 'Duel')} <kbd>E</kbd></span>`;
    }
    this.prompt.classList.remove('hidden');
  }
  hidePrompt() { if (this._promptKey !== null) { this._promptKey = null; this.prompt.classList.add('hidden'); } }

  // ---------- 접현 메뉴 ----------
  // info: { player: {name, figId, sword}, rival: {name, figId, ship, sword, rank}, demandChance }
  openMenu(info, onChoice) {
    this.info = info; this.onChoice = onChoice; this.state = 'menu';
    this.hidePrompt();
    const r = info.rival;
    $('bm-portrait').innerHTML = r.figId ? `<img src="${portraitSrc(r.figId)}" alt="">` : '<span>🏴‍☠️</span>';
    $('bm-name').textContent = r.name;
    $('bm-ship').textContent = `${r.ship} · ${T('검술', 'Swordsmanship')} ${'★'.repeat(Math.round(r.sword / 20))}${'☆'.repeat(5 - Math.round(r.sword / 20))}`;
    $('bm-text').textContent = T(`${r.name}의 배에 갈고리를 걸었다. 상대 선장이 갑판으로 나와 칼을 뽑는다.`, `Your hooks bite into ${r.name}'s rail. Their captain steps onto the deck and draws.`);
    $('bm-demand').textContent = T(`성공 확률 약 ${Math.round(info.demandChance * 100)}% · 순위와 검술 차이로 정해진다`, `About ${Math.round(info.demandChance * 100)}% · depends on rank and swordsmanship`);
    this.menu.classList.remove('hidden');
  }
  _menuPick(c) {
    if (this.state !== 'menu') return;
    this.menu.classList.add('hidden');
    if (c === 'duel') { this.onStart && this.onStart(); this._start(); }
    else { this.state = 'off'; this.onChoice && this.onChoice(c); }
  }

  // ---------- 전리품 ----------
  // info: { name, figId, ship, loot: { gold, supply, powder } }  (main.js 가 배에 따라 정한다)
  openSpoils(info, onPick) {
    this.state = 'spoils'; this.onSpoils = onPick;
    this.hidePrompt();
    $('sp-portrait').innerHTML = info.figId ? `<img src="${portraitSrc(info.figId)}" alt="">` : '<span>🏴‍☠️</span>';
    $('sp-name').textContent = info.name;
    $('sp-ship').textContent = info.ship;
    const L = info.loot;
    $('sp-loot').textContent = T(`💰 금화 ${L.gold.toLocaleString('ko-KR')} · 🍋 보급 (전속 항해 가득) · 💣 화약 (포 즉시 장전) — 옮겨 싣는 동안 ${L.time}초 멈춘다`,
      `💰 ${L.gold.toLocaleString('en-US')} gold · 🍋 supplies (full sail gauge) · 💣 powder (guns loaded) — you lie still ${L.time} s while loading`);
    this.spoils.classList.remove('hidden');
  }
  _spoilsPick(c) {
    if (this.state !== 'spoils') return;
    this.spoils.classList.add('hidden');
    this.state = 'off';
    const cb = this.onSpoils; this.onSpoils = null;
    cb && cb(c);
  }

  // ---------- 일기토 ----------
  _start() {
    const { player, rival } = this.info;
    this.P = { name: player.name, figId: player.figId, sword: player.sword, hp: 100, ki: 0, pose: 'idle', poseT: 0, x: 330, hurt: 0 };
    this.R = { name: rival.name, figId: rival.figId, sword: rival.sword, hp: 100, ki: 0, pose: 'idle', poseT: 0, x: 630, hurt: 0, style: fighterOf(rival.figId), color: rival.color || '#c0392b' };
    this.P.costume = costumeOf(player.figId, true); this.R.costume = costumeOf(rival.figId, false);
    this.pending = [];
    this.round = 0; this.history = []; this.sparks = []; this.floats = []; this.shake = 0; this.flash = 0; this.t = 0;
    const img = (f) => (f ? `<img src="${portraitSrc(f, true)}" alt="">` : '<span>🏴‍☠️</span>');
    $('ds-p-img').innerHTML = img(player.figId); $('ds-r-img').innerHTML = img(rival.figId);
    $('ds-p-name').textContent = player.name; $('ds-r-name').textContent = rival.name;
    $('duel-result').classList.add('hidden');
    this.screen.classList.remove('hidden');
    this._log(T(`${rival.name}: "덤벼라!"`, `${rival.name}: "Come, then!"`));
    this.audio && this.audio.hit && this.audio.hit(0.5);
    this._nextRound();
  }

  _nextRound() {
    this.round++;
    this.state = 'choose'; this.timer = ROUND_TIME;
    this.rPlan = this._aiPick();
    // 자세 보여 주기: 대개는 정직하게, 노련한 상대는 가끔 속인다
    const s = this.R.sword, roll = Math.random();
    const honest = 0.72 - s / 400, feint = 0.08 + s / 600;
    this.tell = roll < honest ? this.rPlan : roll < honest + feint ? MOVES.filter((m) => m !== this.rPlan)[Math.floor(Math.random() * 2)] : 'none';
    $('duel-round').textContent = T(` 제${this.round}합`, ` round ${this.round}`);
    $('duel-tell').textContent = `👁 ${T(TELLS[this.tell].ko, TELLS[this.tell].en)}`;
    $('duel-tell').classList.toggle('blank', this.tell === 'none');
    this._setButtons(true);
    this._hud();
  }

  // 상대의 수: 성향 + 내 버릇 읽기
  _aiPick() {
    const st = this.R.style;
    let w = { slash: 1 - st.aggr - st.guard, parry: st.guard, lunge: st.aggr };
    // 내가 자주 낸 수를 이기는 수에 가중치 (검술이 높을수록 잘 읽는다)
    const recent = this.history.slice(-4);
    if (recent.length >= 2) {
      const cnt = { slash: 0, parry: 0, lunge: 0 }; for (const m of recent) cnt[m]++;
      const fav = MOVES.reduce((a, b) => (cnt[a] >= cnt[b] ? a : b));
      const counter = MOVES.find((m) => BEATS[m] === fav);
      w[counter] += (cnt[fav] / recent.length) * (this.R.sword / 110);
    }
    // 기세가 오른 상대는 크게 노린다
    if (this.R.ki >= 2) w.lunge += 0.25;
    const sum = w.slash + w.parry + w.lunge; let r = Math.random() * sum;
    for (const m of MOVES) { r -= w[m]; if (r <= 0) return m; }
    return 'slash';
  }

  pick(m) {
    if (this.state !== 'choose') return;
    if (m === 'retreat') { this._end('retreat'); return; }
    this.history.push(m);
    this._resolve(m, this.rPlan);
  }

  _resolve(pm, rm) {
    this.state = 'clash'; this.clashT = 0; this._setButtons(false);
    const P = this.P, R = this.R;
    P.pose = pm; R.pose = rm; P.poseT = R.poseT = 0; P.trail = []; R.trail = [];
    const dmg = (atk, def, move) => {
      const base = BASE[move] * (0.75 + atk.sword / 200) * (1.1 - def.sword / 500);
      const k = atk.ki >= 2 ? 1.5 : 1;
      return Math.round(base * k * (0.9 + Math.random() * 0.2));
    };
    const name = (m) => T(MOVE_UI[m].ko, MOVE_UI[m].en);
    // 승패와 피해는 지금 정하고, 화면에는 칼이 닿는 순간에 보여 준다
    const at = (fn) => this.pending.push({ t: IMPACT_T, fn });
    const mid = () => [((P.tip?.[0] ?? 480) + (R.tip?.[0] ?? 480)) / 2, ((P.tip?.[1] ?? 300) + (R.tip?.[1] ?? 300)) / 2];
    if (pm === rm) {
      // 같은 수: 칼이 맞부딪힌다. 둘 다 조금씩 밀린다
      const a = 3 + Math.floor(Math.random() * 3), b = 3 + Math.floor(Math.random() * 3);
      P.hp = Math.max(0, P.hp - a); R.hp = Math.max(0, R.hp - b); P.ki = 0; R.ki = 0;
      at(() => {
        const [x, y] = mid(); this._hit(x, y, 0.45, '#ffe08a'); this._float(P.x, -a, '#ffb0a0'); this._float(R.x, -b, '#ffb0a0');
        this._log(T(`${name(pm)}와 ${name(rm)}! 칼날이 맞부딪혀 불꽃이 튄다.`, `${name(pm)} meets ${name(rm)}! Steel rings and sparks fly.`));
        this._sfx(0.5); this._hud();
      });
    } else {
      const win = BEATS[pm] === rm, A = win ? P : R, D = win ? R : P, move = win ? pm : rm;
      const d = dmg(A, D, move), big = A.ki >= 2;
      D.hp = Math.max(0, D.hp - d); A.ki = big ? 0 : A.ki + 1; D.ki = 0;
      at(() => {
        D.hurt = 1;
        // 막기로 이긴 쪽은 칼을 흘려 받은 자리에서, 공격으로 이긴 쪽은 칼끝에서 불꽃
        const [x, y] = move === 'parry' ? mid() : (A.tip || [D.x, 300]);
        this._hit(x, y, big ? 1 : 0.7, win ? (big ? '#ffd54f' : '#ffffff') : '#ff6a4a');
        this._float(D.x, -d, win ? (big ? '#ffd54f' : '#ff7a5a') : '#ff6a4a', big);
        this._log(win
          ? (big ? T('🔥 기세를 실은 일격! ', '🔥 A blow with full momentum! ') : '') + T(`내 ${name(pm)}가 상대의 ${name(rm)}를 이겼다. ${d}의 피해!`, `Your ${name(pm)} beats their ${name(rm)}: ${d} damage!`)
          : (big ? T('🔥 상대가 기세를 실었다! ', '🔥 They strike with full momentum! ') : '') + T(`상대의 ${name(rm)}에 내 ${name(pm)}가 졌다. ${d}의 피해…`, `Their ${name(rm)} beats your ${name(pm)}: ${d} damage…`));
        this._sfx(big ? 1 : 0.7, win); this._hud();
      });
    }
  }

  _end(result) {
    this.state = 'end'; this.result = result; this._setButtons(false);
    const R = this.R;
    if (result === 'win') { R.pose = 'down'; this.P.pose = 'victory'; }
    else if (result === 'lose') { this.P.pose = 'down'; R.pose = 'victory'; }
    else { this.P.pose = 'idle'; }
    this.P.poseT = R.poseT = 0;
    const title = { win: T('승 리', 'VICTORY'), lose: T('패 배', 'DEFEAT'), retreat: T('후 퇴', 'RETREAT') }[result];
    const sub = {
      win: T(`${R.name}이(가) 칼을 내려놓았다. 이제 저 배를 나포할지 버릴지 정한다.`, `${R.name} lowers the blade. Now decide: take the ship, or scuttle her.`),
      lose: T(`갑판에 쓰러졌다. 상대 선원들이 내 배에 올라 돛을 내린다. 항해는 여기서 끝난다.`, `You fall on the deck. Their crew swarms aboard and strikes your sails. Your voyage ends here.`),
      retreat: T('갈고리를 끊고 물러났다. 잃은 것도 얻은 것도 없다.', 'You cut the hooks and pull away. Nothing lost, nothing gained.'),
    }[result];
    $('dr-title').textContent = title; $('dr-sub').textContent = sub;
    $('duel-result').className = `duel-result ${result}`;
    $('duel-tell').textContent = '';
    if (result === 'win' && this.audio && this.audio.perfect) this.audio.perfect();
  }

  _finish() {
    if (this.state !== 'end') return;
    const res = { result: this.result, rounds: this.round, hp: this.P.hp };
    this.close();
    this.onChoice && this.onChoice('duel', res);
  }

  close() {
    this.state = 'off';
    this.menu.classList.add('hidden'); this.screen.classList.add('hidden'); this.spoils.classList.add('hidden'); this.hidePrompt();
    this.onSpoils = null;
  }

  // 키보드: main.js 가 접현 메뉴/일기토 중에 넘겨준다. 처리했으면 true
  key(code) {
    if (this.state === 'spoils') {
      const c = { Digit1: 'capture', Numpad1: 'capture', Enter: 'capture', Digit2: 'scuttle', Numpad2: 'scuttle' }[code];
      if (c) this._spoilsPick(c);
      return true;
    }
    if (this.state === 'menu') {
      const c = { Digit1: 'duel', Numpad1: 'duel', KeyE: 'duel', Enter: 'duel', Digit2: 'demand', Numpad2: 'demand', Digit3: 'leave', Numpad3: 'leave', Escape: 'leave' }[code];
      if (c) this._menuPick(c);
      return true;
    }
    if (this.state === 'choose') {
      const m = { Digit1: 'slash', Numpad1: 'slash', KeyA: 'slash', Digit2: 'parry', Numpad2: 'parry', KeyS: 'parry', Digit3: 'lunge', Numpad3: 'lunge', KeyD: 'lunge', Digit4: 'retreat', Escape: 'retreat' }[code];
      if (m) this.pick(m);
      return true;
    }
    if (this.state === 'end') { if (code === 'Enter' || code === 'Space' || code === 'KeyE' || code === 'Escape') this._finish(); return true; }
    return this.state !== 'off';
  }

  // ---------- 매 프레임 ----------
  update(dt) {
    // 결투 화면이 아닐 때(꺼짐·접현 메뉴·전리품 선택)는 그릴 것이 없다. 기싸움으로 이긴 뒤의 전리품 선택에는 결투 선장(P, R)이 없다.
    if (this.state !== 'choose' && this.state !== 'clash' && this.state !== 'end') return;
    if (!this.P || !this.R) return;
    this.t += dt;
    const P = this.P, R = this.R;
    P.poseT += dt; R.poseT += dt;
    P.hurt = Math.max(0, P.hurt - dt * 1.8); R.hurt = Math.max(0, R.hurt - dt * 1.8);
    this.shake = Math.max(0, this.shake - dt * 2.2); this.flash = Math.max(0, this.flash - dt * 3);
    for (const e of this.pending) { e.t -= dt; if (e.t <= 0) e.fn(); }
    this.pending = this.pending.filter((e) => e.t > 0);
    if (this.state === 'choose') {
      this.timer -= dt;
      $('duel-timer-fill').style.width = `${Math.max(0, this.timer / ROUND_TIME) * 100}%`;
      if (this.timer <= 0) { this._log(T('머뭇거리다 칼을 세워 막는다.', 'You hesitate and raise a guard.')); this.pick('parry'); }
    } else if (this.state === 'clash') {
      this.clashT += dt;
      if (this.clashT >= CLASH_TIME) {
        P.pose = P.hp > 0 ? 'idle' : P.pose; R.pose = R.hp > 0 ? 'idle' : R.pose;
        if (R.hp <= 0) this._end('win');
        else if (P.hp <= 0) this._end('lose');
        else this._nextRound();
      }
    }
    for (const s of this.sparks) { s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 600 * dt; s.life -= dt; }
    this.sparks = this.sparks.filter((s) => s.life > 0);
    for (const f of this.floats) { f.y -= 40 * dt; f.life -= dt; }
    this.floats = this.floats.filter((f) => f.life > 0);
    this._draw();
  }

  // ---------- 그리기 ----------
  _draw() {
    const c = this.ctx, W = 960, H = 540, t = this.t;
    c.save();
    if (this.shake > 0) c.translate((Math.random() - 0.5) * this.shake * 18, (Math.random() - 0.5) * this.shake * 12);
    // 하늘과 바다
    const sky = c.createLinearGradient(0, 0, 0, 300); sky.addColorStop(0, '#2a1d5a'); sky.addColorStop(0.6, '#c8604a'); sky.addColorStop(1, '#f2a65a');
    c.fillStyle = sky; c.fillRect(-20, -20, W + 40, 320);
    c.fillStyle = 'rgba(255,220,140,0.85)'; c.beginPath(); c.arc(760, 250, 46, 0, Math.PI * 2); c.fill();
    const sea = c.createLinearGradient(0, 280, 0, 360); sea.addColorStop(0, '#1d3f6a'); sea.addColorStop(1, '#0b1f38');
    c.fillStyle = sea; c.fillRect(-20, 280, W + 40, 100);
    c.strokeStyle = 'rgba(255,200,140,0.35)'; c.lineWidth = 2;
    for (let i = 0; i < 9; i++) { const y = 292 + i * 8, o = (t * 30 + i * 47) % 120; c.beginPath(); for (let x = -o; x < W; x += 120) { c.moveTo(x, y); c.lineTo(x + 50, y); } c.stroke(); }
    // 상대 배의 뱃전 (오른쪽 뒤)
    c.fillStyle = '#3a2416'; c.beginPath(); c.moveTo(560, 330); c.lineTo(980, 300); c.lineTo(980, 360); c.lineTo(600, 372); c.closePath(); c.fill();
    // 돛대와 밧줄
    c.fillStyle = '#4a2e1a'; c.fillRect(470, 20, 18, 330);
    c.fillStyle = '#efe4c8'; c.beginPath(); c.moveTo(488, 40); c.quadraticCurveTo(600 + Math.sin(t) * 10, 110, 488, 200); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(40,24,10,0.8)'; c.lineWidth = 2;
    for (const [x1, x2] of [[479, 40], [479, 920], [479, 160], [479, 800]]) { c.beginPath(); c.moveTo(x1, 30); c.lineTo(x2, 360); c.stroke(); }
    // 갑판
    const deck = c.createLinearGradient(0, 350, 0, H); deck.addColorStop(0, '#8a5a32'); deck.addColorStop(1, '#4a2c16');
    c.fillStyle = deck; c.fillRect(-20, 350, W + 40, H - 330);
    c.strokeStyle = 'rgba(30,16,6,0.55)'; c.lineWidth = 2;
    for (let i = 0; i < 9; i++) { const y = 360 + i * i * 2.6; c.beginPath(); c.moveTo(-20, y); c.lineTo(W + 20, y); c.stroke(); }
    for (let i = -6; i < 14; i++) { c.beginPath(); c.moveTo(480 + i * 18, 350); c.lineTo(480 + i * 110, H); c.stroke(); }
    // 난간
    c.fillStyle = '#5a3a20'; c.fillRect(-20, 336, W + 40, 14);
    for (let x = 10; x < W; x += 46) c.fillRect(x, 318, 8, 22);
    c.fillRect(-20, 312, W + 40, 8);

    // 두 선장
    // 둘이 동시에 달려들면 몸이 겹치지 않도록 내딛는 거리를 줄인다
    const pdx = Math.max(0, poseAt(this.P, t).dx), rdx = Math.max(0, poseAt(this.R, t).dx), room = this.R.x - this.P.x - 150;
    const mul = pdx + rdx > room ? Math.max(0, room / (pdx + rdx)) : 1;
    this.P.dxMul = this.R.dxMul = mul;
    // 두 선장. 공격하는 쪽을 앞에 그린다
    const pf = [[this.R, -1], [this.P, 1]];
    if (this.R.pose === 'slash' || this.R.pose === 'lunge') pf.reverse();
    for (const [F, dir] of pf) drawFighter(c, F, dir, F.costume, t);
    drawTrail(c, this.P); drawTrail(c, this.R);

    // 불꽃과 숫자
    for (const s of this.sparks) { c.fillStyle = s.col; c.globalAlpha = Math.min(1, s.life * 3); c.fillRect(s.x, s.y, 3, 3); }
    c.globalAlpha = 1;
    c.textAlign = 'center'; c.font = '900 34px "Noto Sans KR", sans-serif';
    for (const f of this.floats) {
      c.globalAlpha = Math.min(1, f.life * 2); c.fillStyle = f.col; c.strokeStyle = '#000'; c.lineWidth = 4;
      c.font = `900 ${f.big ? 48 : 34}px "Noto Sans KR", sans-serif`;
      c.strokeText(f.text, f.x, f.y); c.fillText(f.text, f.x, f.y);
    }
    c.globalAlpha = 1;
    c.restore();
    if (this.flash > 0) { c.fillStyle = `rgba(255,255,255,${this.flash * 0.5})`; c.fillRect(0, 0, W, H); }
  }

  _hit(x, y, power, col) {
    this.shake = Math.max(this.shake, power); this.flash = Math.max(this.flash, power * 0.6);
    for (let i = 0; i < 26 * power + 6; i++) {
      const a = Math.random() * Math.PI * 2, s = 120 + Math.random() * 320 * power;
      this.sparks.push({ x, y: y + (Math.random() - 0.5) * 30, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120, life: 0.4 + Math.random() * 0.5, col: Math.random() < 0.5 ? col : '#ffd27a' });
    }
  }
  _float(x, n, col, big = false) { this.floats.push({ x, y: 300, text: String(n), col, big, life: 1.3 }); }
  _sfx(v, good = false) { const a = this.audio; if (!a) return; a.hit && a.hit(v); if (good && a.combo) a.combo(3); }
  _log(line) {
    const box = $('duel-log');
    const p = el('div', {}, ''); p.textContent = line; box.prepend(p);
    while (box.children.length > 3) box.lastChild.remove();
  }
  _setButtons(on) { for (const b of this.screen.querySelectorAll('.dc-btn')) b.disabled = !on; }
  _hud() {
    const P = this.P, R = this.R;
    $('ds-p-hp').style.width = `${P.hp}%`; $('ds-r-hp').style.width = `${R.hp}%`;
    $('ds-p-hpn').textContent = P.hp; $('ds-r-hpn').textContent = R.hp;
    const ki = (n) => `${T('기세', 'Momentum')} ${'🔥'.repeat(Math.min(2, n))}${'·'.repeat(2 - Math.min(2, n))}`;
    $('ds-p-ki').textContent = ki(P.ki); $('ds-r-ki').textContent = ki(R.ki);
  }
}
