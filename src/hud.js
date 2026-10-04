// HUD 및 미니맵, 점수/콤보, 기항지 카드(세계지도), 폭풍 경고, 스피드 라인
import { TRACK_HALF_WIDTH } from './track.js?v=20261004a';
import { WorldMap, WORLD_ROUTE } from './worldmap.js?v=20261004a';
import { PORTS } from './history.js?v=20261004a';
import { t, LANG, ordinal } from './i18n.js?v=20261004a';
import { portraitSrc, findFigure, figName } from './figures.js?v=20261004a';
import { MISSION_TYPES } from './campaign.js?v=20261004a';

const $ = (id) => document.getElementById(id);

export class HUD {
  constructor() {
    this.el = {
      hud: $('hud'), posNum: $('pos-num'), posSuffix: $('pos-suffix'), posTotal: $('pos-total'), lapCur: $('lap-cur'), lapTotal: $('lap-total'), time: $('hud-time'),
      windArrow: $('wind-arrow'), shipMarker: $('ship-marker'), windStrength: $('wind-strength'), speed: $('speed-val'), windEffect: $('wind-effect'),
      boostFill: $('boost-fill'), cannonFill: $('cannon-fill'), minimap: $('minimap'), center: $('center-msg'), event: $('event-msg'),
      off: $('offcourse-warn'), lock: $('tracklock-msg'), standings: $('standings'),
      score: $('score-val'), combo: $('combo-box'), comboNum: $('combo-num'), comboBar: $('combo-fill'), comboPop: $('combo-pop'),
      port: $('port-card'), portName: $('port-name'), portYear: $('port-year'), portFact: $('port-fact'), portLap: $('port-lap'),
      storm: $('storm-warn'), draft: $('draft-label'), music: $('music-label'),
      admiralName: $('admiral-name'), admiralShip: $('admiral-ship'), admiralPortrait: $('admiral-portrait'),
      tapFill: $('tap-fill'), tapLabel: $('tap-label'), tapHint: $('tap-hint'), wrongWay: $('wrong-way'),
      kc: $('knowledge-card'), kcKind: $('kc-kind'), kcDate: $('kc-date'), kcTitle: $('kc-title'), kcText: $('kc-text'), kcFill: $('kc-fill'),
      // 함대 패널 / 명령 / 미션 목표
      fleet: $('fleet-panel'), fpForm: $('fp-form'), fpCoh: $('fp-cohesion'), fpFill: $('fp-fill'), fpBonus: $('fp-bonus'), fpShips: $('fp-ships'),
      orders: $('fleet-orders'),
      mt: $('mission-tracker'), mtIcon: $('mt-icon'), mtGoal: $('mt-goal'), mtFill: $('mt-fill'), mtProg: $('mt-prog'),
      // 교감 / 스트레스 / 만조 (부캉이의 바다)
      bond: $('bond-panel'), bpLabel: $('bp-label'), bpNote: $('bp-note'), bpFill: $('bp-fill'),
      tideRow: $('tide-row'), tideFill: $('tide-fill'), tideState: $('tide-state'),
    };
    this.orderBtns = [...document.querySelectorAll('#fleet-orders .order-btn')];
    this._fpBuilt = 0;
    this.kq = []; this.kcTimer = 0; this.kcDur = 1; this.kcVisible = false;
    this.ctx = this.el.minimap.getContext('2d');
    this.vignette = document.createElement('div'); this.vignette.className = 'boost-vignette'; document.body.appendChild(this.vignette);
    this.flash = document.createElement('div'); this.flash.className = 'hit-flash'; document.body.appendChild(this.flash);
    this.speedLines = document.createElement('div'); this.speedLines.className = 'speed-lines'; document.body.appendChild(this.speedLines);
    this.lightning = document.createElement('div'); this.lightning.className = 'lightning-flash'; document.body.appendChild(this.lightning);
    this.rainOverlay = document.createElement('div'); this.rainOverlay.className = 'rain-overlay'; document.body.appendChild(this.rainOverlay);
    this._eventTimer = null; this._popTimer = null; this._portTimer = null;
    this.mapCache = null;
    this.route = WORLD_ROUTE;
    this.worldMap = new WorldMap($('world-map'), this.route);
    this.portVisible = false; this.portIdx = 0;
    this._shownScore = 0;
  }
  show() { this.el.hud.classList.remove('hidden'); document.body.classList.add('racing'); }
  hide() {
    this.el.hud.classList.add('hidden'); document.body.classList.remove('racing'); this.vignette.classList.remove('on');
    this.speedLines.style.opacity = 0; this.rainOverlay.style.opacity = 0; this.lightning.style.opacity = 0;
    this.hidePort(); this.el.storm.classList.add('hidden');
    this.clearKnowledge(); this.el.tapHint.classList.add('hidden'); this.el.wrongWay.classList.add('hidden');
    this.el.fleet.classList.add('hidden'); this.el.orders.classList.add('hidden'); this.el.mt.classList.add('hidden');
    if (this.el.bond) this.el.bond.classList.add('hidden');
  }

  // ---- 교감 / 스트레스 게이지 + 만조 ----
  // spec = null 이면 감춘다.
  // { mode: 'bond'|'stress', value: 0~1, note: '', tide: 0~1|null, tideHigh: bool }
  setBond(spec) {
    const e = this.el.bond; if (!e) return;
    e.classList.toggle('hidden', !spec);
    if (!spec) return;
    const stress = spec.mode === 'stress';
    e.classList.toggle('stress', stress);
    e.classList.toggle('full', !stress && spec.value >= 1);
    this.el.bpLabel.textContent = stress ? '🦈 스트레스' : '🦈 교감';
    this.el.bpNote.textContent = spec.note || '';
    this.el.bpFill.style.width = Math.max(0, Math.min(1, spec.value)) * 100 + '%';
    const showTide = spec.tide != null;
    this.el.tideRow.classList.toggle('hidden', !showTide);
    if (showTide) {
      this.el.tideRow.classList.toggle('high', !!spec.tideHigh);
      this.el.tideFill.style.width = Math.max(0, Math.min(1, spec.tide)) * 100 + '%';
      this.el.tideState.textContent = spec.tideHigh ? '만조' : '간조';
    }
  }

  // ---- 연대기 / 인물 / 발견 카드 ----
  // card: { kind: 'event'|'figure'|'discovery', label, date, title, text, dur }
  knowledge(card, priority = false) {
    if (priority) { this.kq.unshift(card); this._showKnowledge(); }
    else { this.kq.push(card); if (!this.kcVisible) this._showKnowledge(); }
  }
  _showKnowledge() {
    const card = this.kq.shift(); if (!card) return;
    const e = this.el.kc;
    e.className = card.kind;
    this.el.kcKind.textContent = card.label; this.el.kcDate.textContent = card.date || '';
    this.el.kcTitle.textContent = card.title; this.el.kcText.textContent = card.text;
    e.classList.remove('hidden', 'out'); void e.offsetWidth;
    this.kcVisible = true; this.kcDur = card.dur || 7; this.kcTimer = this.kcDur;
    // 말씀 암송: 빈칸이 뚫린 본문을 먼저 띄우고, 잠시 뒤 채워 준다
    this.kcReveal = card.reveal || null;
    this.kcRevealAt = card.revealAt ?? 0;
    this.kcRevealed = false;
  }
  updateKnowledge(dt) {
    if (!this.kcVisible) { if (this.kq.length) this._showKnowledge(); return; }
    this.kcTimer -= dt;
    // 빈칸 채우기: 남은 시간이 기준을 지나면 답을 드러낸다
    if (this.kcReveal && !this.kcRevealed && this.kcDur - this.kcTimer >= this.kcRevealAt) {
      this.kcRevealed = true;
      this.el.kcText.innerHTML = this.kcReveal;
      this.el.kc.classList.add('revealed');
      setTimeout(() => this.el.kc.classList.remove('revealed'), 600);
    }
    this.el.kcFill.style.width = Math.max(0, this.kcTimer / this.kcDur) * 100 + '%';
    if (this.kcTimer <= 0) {
      this.kcVisible = false;
      const e = this.el.kc; e.classList.add('out');
      setTimeout(() => { if (!this.kcVisible) e.classList.add('hidden'); }, 420);
    }
  }
  clearKnowledge() { this.kq = []; this.kcVisible = false; this.el.kc.classList.add('hidden'); }

  // ---- 점수 / 콤보 ----
  setScore(score, combo, comboFrac) {
    // 숫자가 굴러 올라가는 연출
    if (this._shownScore < score) this._shownScore = Math.min(score, this._shownScore + Math.max(1, Math.ceil((score - this._shownScore) * 0.18)));
    else this._shownScore = score;
    this.el.score.textContent = this._shownScore.toLocaleString('ko-KR');
    this.el.combo.classList.toggle('hidden', combo < 2);
    if (combo >= 2) { this.el.comboNum.textContent = '×' + combo; this.el.comboBar.style.width = (comboFrac * 100) + '%'; }
  }
  resetScoreDisplay() { this._shownScore = 0; this.el.score.textContent = '0'; this.el.combo.classList.add('hidden'); }
  comboPop(text, sub, color = '#ffe08a') {
    const e = this.el.comboPop;
    e.innerHTML = `<div class="pop-main" style="color:${color}">${text}</div>${sub ? `<div class="pop-sub">${sub}</div>` : ''}`;
    e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop');
  }
  comboBreak() {
    const e = this.el.combo; e.classList.remove('break'); void e.offsetWidth; e.classList.add('break');
    setTimeout(() => e.classList.add('hidden'), 500);
  }

  // ---- 기항지 카드 (우측 상단 세계지도) ----
  setRoute(route) { this.route = route; this.worldMap.setRoute(route); }
  showPort(idx, lap, lapTotal, dur = 5200) {
    const p = this.route.ports[idx];
    const en = LANG === 'en';
    this.portIdx = idx; this.portVisible = true;
    this.el.portName.textContent = (en && p.en) ? p.en : p.name;
    this.el.portYear.textContent = `${p.year} · ${(en && p.regionEn) ? p.regionEn : p.region}`;
    this.el.portFact.textContent = (en && p.factEn) ? p.factEn : p.fact;
    this.el.portLap.textContent = t('port.lap', { lap: Math.min(lap + 1, lapTotal), i: idx + 1, n: this.route.ports.length });
    this.el.port.classList.remove('hidden', 'out');
    clearTimeout(this._portTimer);
    this._portTimer = setTimeout(() => this.hidePort(), dur);
  }
  hidePort() {
    if (!this.portVisible) return;
    this.portVisible = false;
    const e = this.el.port; e.classList.add('out');
    setTimeout(() => { if (!this.portVisible) e.classList.add('hidden'); }, 450);
  }
  updatePortCard(frac, t) { if (this.portVisible) this.worldMap.draw(this.portIdx, frac, t); }

  // ---- 폭풍 / 번개 / 비 ----
  setStorm(level, flash, warn) {
    this.rainOverlay.style.opacity = level * 0.5;
    this.lightning.style.opacity = flash * 0.85;
    this.el.storm.classList.toggle('hidden', !warn);
  }
  // ---- 스피드 라인 (0~1) ----
  setSpeedLines(v) { this.speedLines.style.opacity = Math.max(0, Math.min(1, v)); }
  setDraft(on, charged) { this.el.draft.classList.toggle('hidden', !on); this.el.draft.classList.toggle('charged', charged); }
  setWrongWay(on) { this.el.wrongWay.classList.toggle('hidden', !on); }
  setTap(meter, hint) {
    this.el.tapFill.style.width = (Math.min(1, meter) * 100) + '%';
    this.el.tapFill.classList.toggle('hot', meter > 0.75);
    this.el.tapLabel.classList.toggle('pulse', meter > 0.75);
    this.el.tapHint.classList.toggle('hidden', !hint);
  }
  setAdmiral(name, ship, figureId) {
    this.el.admiralName.textContent = name; this.el.admiralShip.textContent = ship;
    if (figureId) this.el.admiralPortrait.src = portraitSrc(figureId, true);
  }
  setMusic(name) { this.el.music.textContent = name ? '♪ ' + name : ''; }

  // ---- 함대 패널 ----
  // fleet이 없거나 동료함이 없으면 숨긴다
  setFleet(fleet) {
    const on = !!(fleet && fleet.size);
    this.el.fleet.classList.toggle('hidden', !on);
    this.el.orders.classList.toggle('hidden', !on);
    if (!on) return;
    const f = fleet.formation;
    this.el.fpForm.textContent = `${f.icon} ${LANG === 'en' ? f.en : f.name}`;
    this.el.fpCoh.textContent = t('fleet.cohesion', { p: Math.round(fleet.cohesion * 100) });
    this.el.fpCoh.classList.toggle('good', fleet.cohesion > 0.65);
    this.el.fpFill.style.width = (fleet.meter * 100) + '%';
    this.el.fleet.classList.toggle('many', fleet.size > 5); // 6척 이상이면 줄을 더 줄인다
    this.el.fpFill.classList.toggle('full', fleet.meter > 0.95);
    this.el.fpBonus.textContent = fleet.bonus > 1.005 ? `+${Math.round((fleet.bonus - 1) * 100)}%` : '';
    // 동료함 칸은 한 번만 만들고 이후에는 값만 갱신
    if (this._fpBuilt !== fleet.consorts.length || this._fpKey !== fleet.consorts.map((b) => b.consort.officer).join()) {
      this._fpBuilt = fleet.consorts.length;
      this._fpKey = fleet.consorts.map((b) => b.consort.officer).join();
      this.el.fpShips.innerHTML = fleet.consorts.map((b) => {
        const o = b.consort.officer ? findFigure(b.consort.officer) : null;
        return `<div class="fp-ship"><img src="${o ? portraitSrc(o.id, true) : ''}" alt=""><div class="fp-info"><span class="fp-name">${o ? figName(o) : b.name}</span><span class="fp-hp"><i></i></span></div></div>`;
      }).join('');
      this._fpRows = [...this.el.fpShips.children];
    }
    fleet.consorts.forEach((b, i) => {
      const row = this._fpRows[i]; if (!row) return;
      const c = b.consort;
      row.classList.toggle('sunk', c.sunk);
      row.classList.toggle('hurt', c.flash > 0);
      row.querySelector('.fp-hp i').style.width = Math.max(0, (c.hp / c.maxHp) * 100) + '%';
    });
  }

  // 명령 버튼 재사용 대기 표시
  setOrders(fleet) {
    if (!fleet || !fleet.size) return;
    for (const btn of this.orderBtns) {
      const id = btn.dataset.order;
      const cd = fleet.cd[id] || 0;
      const active = fleet.order === id;
      btn.classList.toggle('active', active);
      btn.classList.toggle('cooling', cd > 0);
      btn.querySelector('.ocd').style.height = cd > 0 ? Math.min(100, (cd / 24) * 100) + '%' : '0%';
    }
  }

  // ---- 미션 목표 추적 ----
  // spec: { type, label, cur, max } / null이면 숨김
  setMission(spec) {
    this.el.mt.classList.toggle('hidden', !spec);
    if (!spec) return;
    const T = MISSION_TYPES[spec.type] || MISSION_TYPES.race;
    this.el.mtIcon.textContent = T.icon;
    this.el.mt.style.setProperty('--mt-color', T.color);
    this.el.mtGoal.textContent = spec.label;
    const frac = spec.max > 0 ? Math.max(0, Math.min(1, spec.cur / spec.max)) : 0;
    this.el.mtFill.style.width = (frac * 100) + '%';
    this.el.mt.classList.toggle('done', frac >= 1);
    this.el.mtProg.textContent = spec.text || '';
  }

  setRace(rank, total, lap, lapTotal, time) {
    this.el.posNum.textContent = rank;
    if (LANG === 'en') this.el.posSuffix.textContent = ordinal(rank).replace(String(rank), '');
    this.el.posTotal.textContent = '/ ' + total;
    this.el.lapCur.textContent = Math.min(lap, lapTotal); this.el.lapTotal.textContent = lapTotal;
    this.el.time.textContent = formatTime(time);
    this.el.posNum.style.color = rank === 1 ? '#ffe08a' : rank <= 3 ? '#fff3d6' : '#c8b89a';
  }
  setShip(boat, wind) {
    const kn = Math.round(Math.abs(boat.speed) * 1.1);
    this.el.speed.textContent = kn;
    // 나침반: 화면 위 = 북(-z). 바람 화살표는 바람이 부는 방향
    this.el.windArrow.style.transform = `rotate(${(-wind.dir * 180) / Math.PI + 180}deg)`;
    this.el.shipMarker.style.transform = `rotate(${(-boat.heading * 180) / Math.PI + 180}deg)`;
    this.el.windStrength.textContent = Math.round(wind.strength * 30);
    const pct = Math.round(boat.windEffect * 100);
    this.el.windEffect.textContent = (pct >= 0 ? t('hud.tailwind') : t('hud.headwind')) + pct + '%';
    this.el.windEffect.classList.toggle('bad', pct < -3);
    this.el.boostFill.style.width = (boat.boost * 100) + '%';
    this.el.boostFill.classList.toggle('active', boat.boosting);
    const cd = Math.max(0, 1 - boat.cannonCd / (boat.cannonMax || boat.phys.cannonCooldown));
    this.el.cannonFill.style.width = (cd * 100) + '%';
    this.vignette.classList.toggle('on', boat.boosting);
    this.el.off.classList.toggle('hidden', !boat.offCourse);
    // 트랙마스터: 항로 유지 장치가 작동 중이면 알려 준다
    if (this.el.lock) this.el.lock.classList.toggle('hidden', !(boat.lockOn > 0.05));
  }
  centerMsg(text, color) {
    const e = this.el.center; e.textContent = text; e.style.color = color || '#ffe08a';
    e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop');
  }
  event(text, dur = 2200) {
    const e = this.el.event; e.textContent = text; e.classList.add('show');
    clearTimeout(this._eventTimer);
    this._eventTimer = setTimeout(() => e.classList.remove('show'), dur);
  }
  hitFlash() { const f = this.flash; f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); }
  standings(boats) {
    const sorted = [...boats].sort((a, b) => a.rank - b.rank);
    this.el.standings.innerHTML = sorted.map((b) => `<div class="${b.isPlayer ? 'me' : b.consort ? 'ally' : ''}"><span style="color:${b.color}">${b.consort ? '▣' : '■'}</span> ${b.rank}. ${b.name} <small>(${b.def.name})</small>${b.consort?.sunk ? ' ✖' : b.finished ? ' ✔' : ''}</div>`).join('');
  }

  drawMinimap(track, boats, player, kraken, foresight = false) {
    const c = this.el.minimap, ctx = this.ctx, W = c.width, H = c.height;
    if (!this.mapCache) {
      // 좌표 변환 계산
      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      for (const p of track.samples) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); }
      const pad = 60;
      const sx = (W - 30) / (maxX - minX + pad * 2), sz = (H - 30) / (maxZ - minZ + pad * 2);
      const s = Math.min(sx, sz);
      const ox = W / 2 - ((minX + maxX) / 2) * s, oz = H / 2 - ((minZ + maxZ) / 2) * s;
      this.mapCache = { s, ox, oz };
      const off = document.createElement('canvas'); off.width = W; off.height = H;
      const o = off.getContext('2d');
      // 섬
      for (const isl of track.islands) { o.fillStyle = '#5a8a4a'; o.beginPath(); o.arc(isl.x * s + ox, isl.z * s + oz, Math.max(2, isl.r * s), 0, Math.PI * 2); o.fill(); }
      // 항로
      o.strokeStyle = 'rgba(143,212,255,0.5)'; o.lineWidth = Math.max(3, TRACK_HALF_WIDTH * 2 * s); o.lineCap = 'round'; o.lineJoin = 'round';
      o.beginPath();
      track.samples.forEach((p, i) => { const x = p.x * s + ox, y = p.z * s + oz; if (i === 0) o.moveTo(x, y); else o.lineTo(x, y); });
      o.closePath(); o.stroke();
      o.strokeStyle = 'rgba(255,255,255,0.25)'; o.lineWidth = 1; o.stroke();
      // 소용돌이
      for (const w of track.whirlpools) { o.fillStyle = '#6fd6ff'; o.beginPath(); o.arc(w.x * s + ox, w.z * s + oz, 3, 0, Math.PI * 2); o.fill(); }
      // 출발선
      const p0 = track.pointAt(0), n0 = track.normalAt(0);
      o.strokeStyle = '#fff'; o.lineWidth = 2; o.beginPath();
      o.moveTo((p0.x - n0.x * TRACK_HALF_WIDTH) * s + ox, (p0.z - n0.z * TRACK_HALF_WIDTH) * s + oz);
      o.lineTo((p0.x + n0.x * TRACK_HALF_WIDTH) * s + ox, (p0.z + n0.z * TRACK_HALF_WIDTH) * s + oz); o.stroke();
      this.mapImg = off;
    }
    const { s, ox, oz } = this.mapCache;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(this.mapImg, 0, 0);
    // 해도(메르카토르·피리 레이스 특성): 아직 나타나지 않은 암초까지 미리 표시
    if (foresight) {
      ctx.strokeStyle = 'rgba(255,138,138,0.75)'; ctx.lineWidth = 1;
      for (const o of track.obstacles) {
        if (o.type !== 'rock') continue;
        ctx.beginPath(); ctx.arc(o.x * s + ox, o.z * s + oz, 2.6, 0, Math.PI * 2);
        o.active === false ? ctx.stroke() : (ctx.fillStyle = '#ff8a8a', ctx.fill());
      }
    }
    // 크라켄
    if (kraken) { ctx.fillStyle = '#c04ad8'; ctx.beginPath(); ctx.arc(track.kraken.x * s + ox, track.kraken.z * s + oz, 5, 0, Math.PI * 2); ctx.fill(); }
    // 배: 동료함은 사각형, 라이벌은 원
    for (const b of boats) {
      if (b === player) continue;
      const x = b.pos.x * s + ox, y = b.pos.z * s + oz;
      if (b.consort) {
        ctx.fillStyle = b.consort.sunk ? '#5a5a5a' : '#7bed9f';
        ctx.fillRect(x - 3, y - 3, 6, 6);
        ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 1; ctx.strokeRect(x - 3, y - 3, 6, 6);
      } else {
        ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.save();
    ctx.translate(player.pos.x * s + ox, player.pos.z * s + oz);
    ctx.rotate(-player.heading + Math.PI);
    ctx.fillStyle = '#ffe08a'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(5, 6); ctx.lineTo(0, 3); ctx.lineTo(-5, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
}

export function formatTime(t) {
  const m = Math.floor(t / 60), s = Math.floor(t % 60), cs = Math.floor((t * 100) % 100);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}
