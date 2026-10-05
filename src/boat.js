// 함선 상태 및 물리
import * as THREE from 'three';
import { derivePhysics } from './ships.js?v=20261005i';
import { waveHeight, waveNormal, SEA } from './ocean.js?v=20261005i';

// 잠수 (부캉이)
const DIVE_DEPTH = 4.2;      // 수면 아래로 내려가는 깊이
const DIVE_SECONDS = 7;      // 숨이 다 떨어지기까지
const BREATH_RECOVER = 5;    // 수면에서 숨을 다 채우기까지

const _n = new THREE.Vector3();

export class Boat {
  constructor(def, mesh, opts = {}) {
    this.def = def;
    this.mesh = mesh;
    this.phys = derivePhysics(def);
    this.isPlayer = !!opts.isPlayer;
    this.name = opts.name || def.name;
    this.color = opts.color || '#ffe08a';
    this.skill = opts.skill ?? 1;

    this.pos = new THREE.Vector3();
    this.heading = 0;
    this.speed = 0;
    this.slide = new THREE.Vector3();
    this.throttle = 0; this.steer = 0; this.boosting = false;
    this.boost = 0.3;
    this.cannonCd = 0;
    this.cannonMax = this.phys.cannonCooldown; // 실제로 쓰인 재장전 시간 (HUD 게이지 기준)
    this.stun = 0;       // 피격/충돌 후 감속
    this.sting = 0;      // 해파리에 쏘인 뒤 조타가 둔해지는 시간
    this.whirl = 0;      // 소용돌이 영향
    this.whirlTime = 0;  // 소용돌이 체류 시간
    this.whirlImmune = 0; // 탈출 직후 면역
    this.spin = 0;       // 강제 회전 속도
    this.offCourse = false;
    this.offDist = 0;

    this.lap = 0; this.nextCp = 1; this.progress = 0; this.curveIdx = 0; this.rank = 1;
    this.finished = false; this.finishTime = 0;
    this.time = 0;
    this.ai = { laneOffset: 0, laneTimer: 0, fireTimer: 0 };
    this.heel = 0; this.pitch = 0;
    this.windEffect = 0;
    this.lastHitBy = null;
    this.draftMul = 1;   // 슬립스트림 가속 배수 (main에서 설정)
    this.steerS = 0;     // 부드럽게 보간된 조타 입력
    this.turbo = 0;      // 부스터 패드/아이템의 초고속 남은 시간
    this.rowMul = 1;     // SHIFT 연타 게이지에 따른 가속 배수 (main에서 설정)
    this.airborne = false; this.airY = 0; this.airVy = 0; this.airTime = 0; this.rampCd = 0; // 점프대 비행 상태
    // 잠수 (부캉이 전용). diveY 는 수면 아래 깊이(음수), breath 는 숨(0~1)
    this.diving = false; this.diveY = 0; this.breath = 1; this.breachCd = 0;
    // 360도 코스터: 수직 원을 한 바퀴 도는 동안은 물리를 멈추고 정해진 궤도를 탄다
    this.loop = null;
    this.warpCd = 0; // 블랙홀 관문 재진입 대기
    this.crest = 0;      // 폭풍 파도 마루 감지용
    this.fleetMul = 1;   // 함대 항진 보너스 (fleet.js에서 설정)
    this.consort = null; // 동료함이면 { slot, officer, hp, ... }
    // 부제독 특성 배수. fleet.js의 freshTraits()와 같은 모양이며, 기본값은 모두 1이다.
    this.tr = { headwind: 1, tailwind: 1, boostRegen: 1, storm: 1, collision: 1, offCourse: 1,
                pickup: 1, cannonCd: 1, cannonDmg: 1, score: 1, fame: 1, cohesion: 1, plunder: 0, whirlOut: 1, foresight: false };
  }

  setStart(pos, heading) {
    this.pos.copy(pos); this.heading = heading; this.speed = 0; this.slide.set(0, 0, 0);
    this.mesh.position.copy(pos); this.mesh.rotation.set(0, heading, 0);
    this.curveIdx = 0;
  }

  forward(out = new THREE.Vector3()) { return out.set(Math.sin(this.heading), 0, Math.cos(this.heading)); }

  // 360도 코스터 진입. cx,cz = 고리 바닥 중심, tx,tz = 진행 방향(단위), R = 고리 반지름
  startLoop(cx, cz, tx, tz, R) {
    if (this.loop || this.airborne || this.def.hover) return false;
    this.loop = {
      t: 0,
      dur: Math.max(1.1, 2.3 - Math.abs(this.speed) / this.phys.maxSpeed * 0.9), // 빠를수록 빨리 돈다
      x0: cx, z0: cz, tx, tz, R,
      heading: Math.atan2(tx, tz),
      entrySpeed: Math.abs(this.speed),
    };
    this.rampCd = 4;
    return true;
  }

  // 코스터 궤도 갱신. 한 바퀴를 다 돌면 true를 돌려주고 상태를 푼다.
  _updateLoop(dt, t) {
    const L = this.loop;
    L.t += dt / L.dur;
    const done = L.t >= 1;
    const th = Math.min(1, L.t) * Math.PI * 2;
    // 수직 원: 진행 방향으로 R·sin(θ), 위로 R·(1-cos(θ))
    this.pos.x = L.x0 + L.tx * (L.R * Math.sin(th));
    this.pos.z = L.z0 + L.tz * (L.R * Math.sin(th));
    this.airY = L.R * (1 - Math.cos(th));
    this.heading = L.heading;
    this.speed = Math.max(L.entrySpeed, this.phys.maxSpeed * 0.9);
    this.slide.set(0, 0, 0); this.spin = 0; this.steerS = 0;
    const h = waveHeight(this.pos.x, this.pos.z, t);
    this.mesh.position.set(this.pos.x, h * 0.2 + 0.25 + this.airY, this.pos.z);
    this.mesh.rotation.set(0, 0, 0);
    this.mesh.rotateY(this.heading);
    this.mesh.rotateX(-th);           // 뱃머리가 들렸다가 뒤집혔다가 다시 돌아온다
    this.heel = 0; this.pitch = -th;
    // 돛은 부풀린 채로, 깃발은 휘날리게
    const ud = this.mesh.userData;
    for (const s of ud.sails) s.scale.z += (1.1 - s.scale.z) * Math.min(1, 3 * dt);
    ud.flag.rotation.y = Math.PI + Math.sin(t * 10) * 0.3;
    ud.fire.visible = true;
    if (ud.turtleFx) for (const f of ud.turtleFx.flames) f.visible = true;
    if (done) {
      this.loop = null; this.airY = 0; this.pitch = 0;
      this.turbo = Math.max(this.turbo, 3.2);
      this.speed = Math.max(this.speed, this.phys.maxSpeed * 1.5);
      this.justLooped = true;
    }
    return done;
  }

  update(dt, wind, t) {
    // 버려진 배: 가라앉는 모습은 main.js 가 그린다. 물리를 돌리면 배가 다시 일어선다.
    if (this.scuttled) return;
    // 나포: 돛을 내렸으니 더 나아가지 못한다. 조타 입력을 모두 지우고 흘러가게 둔다.
    if (this.captured) { this.throttle = 0; this.steer = 0; this.boosting = false; this.turbo = 0; this.diving = false; }
    const P = this.phys;
    this.time += dt;
    if (this.cannonCd > 0) this.cannonCd -= dt;
    if (this.stun > 0) this.stun -= dt;
    if (this.sting > 0) this.sting -= dt;
    if (this.warpCd > 0) this.warpCd -= dt;
    // 코스터를 도는 동안에는 물리 대신 정해진 궤도를 탄다
    if (this.loop) { if (this.rampCd > 0) this.rampCd -= dt; this._updateLoop(dt, t); return; }
    this.whirl = Math.max(0, this.whirl - dt);
    if (this.whirl <= 0) this.whirlTime = 0;
    if (this.whirlImmune > 0) this.whirlImmune -= dt;

    // 바람 영향 (순풍 +, 역풍 -)
    const rel = Math.cos(this.heading - wind.dir);
    let effect = rel * P.windSens * wind.strength;
    // 부제독 특성: 순풍/역풍 보정
    if (effect > 0) effect *= (this.def.tailwindMul ?? 1) * this.tr.tailwind;
    else effect *= (this.def.headwindMul ?? 1) * this.tr.headwind;
    this.windEffect = effect;

    // 부스트
    if (this.boosting && this.boost > 0) { this.boost = Math.max(0, this.boost - dt * P.boostDrain / 2.8); }
    else this.boosting = false;
    this.boost = Math.min(1, this.boost + dt * 0.022 * P.boostRegen * this.tr.boostRegen);

    let envMul = 1;
    if (this.stun > 0) envMul *= 0.55;
    if (this.whirl > 0) envMul *= 0.75;
    if (this.offCourse) { const pen = this.offDist > 100 ? 0.7 : 0.45; envMul *= 1 - pen * (this.def.offCourseMul ?? 1) * this.tr.offCourse; }

    if (this.turbo > 0) this.turbo -= dt;
    if (this.rampCd > 0) this.rampCd -= dt;
    const boostMul = this.turbo > 0 ? 2.1 : this.boosting ? 1.7 : 1;
    const target = P.maxSpeed * this.skill * Math.max(-0.3, this.throttle) * (1 + effect) * boostMul * envMul * this.draftMul * this.rowMul * this.fleetMul;
    if (this.turbo > 0) this.speed = Math.max(this.speed, target * 0.9); // 부스터: 즉시 초고속
    if (target > this.speed) this.speed += (target - this.speed) * Math.min(1, P.accel * dt);
    else this.speed += (target - this.speed) * Math.min(1, (P.accel * 1.8 + 0.5) * dt * (this.turbo > 0 ? 0.3 : 1));

    // 조타 (속도가 있어야 잘 돔)
    const turnEff = THREE.MathUtils.clamp(Math.abs(this.speed) / (P.maxSpeed * 0.3), 0.2, 1);
    // 키 입력(0/1)을 완만하게 보간해 뱃머리가 스르르 돌아가게
    // 해파리에 쏘이면 키가 늦게 먹는다
    this.steerS += (this.steer - this.steerS) * Math.min(1, (this.sting > 0 ? 1.7 : 5) * dt);
    const turn = this.steerS * P.turnRate * turnEff;
    this.heading += (turn + this.spin) * dt;
    this.spin *= Math.exp(-2.5 * dt);
    if (Math.abs(this.steerS) > 0.1) this.speed *= 1 - Math.abs(this.steerS) * 0.07 * dt * turnEff;

    // 이동
    const f = this.forward(_n);
    this.pos.x += f.x * this.speed * dt + this.slide.x * dt;
    this.pos.z += f.z * this.speed * dt + this.slide.z * dt;
    this.slide.multiplyScalar(Math.exp(-2.6 * dt));

    // 시각 갱신: 파도 위 부유
    const h = waveHeight(this.pos.x, this.pos.z, t);
    const wn = waveNormal(this.pos.x, this.pos.z, t, _n);
    // 점프대 비행: 포물선으로 날다가 수면에 닿으면 착수
    if (this.airborne) {
      this.airTime += dt; this.airVy -= 26 * dt; this.airY += this.airVy * dt;
      if (this.airY <= 0) { this.airY = 0; this.airborne = false; this.justLanded = true; this.airVy = 0; }
    }
    // 폭풍: 파도 경사면을 따라 배가 밀린다 (거북선은 절반)
    if (SEA.storm > 0.05 && !this.airborne && !this.def.hover) {
      const push = SEA.storm * (this.def.turtle ? 9 : 18) * (this.def.stormResist ?? 1) * this.tr.storm;
      this.slide.x += wn.x * push * dt; this.slide.z += wn.z * push * dt;
    }
    // 잠수: 물속으로 내려간다. 숨이 다하면 저절로 떠오른다.
    if (this.def.canDive) {
      if (this.breachCd > 0) this.breachCd -= dt;
      // 숨이 바닥나면 떠오르고, 어느 정도 차기 전까지는 다시 못 내려간다.
      // 그래야 X 를 누른 채로 수면에서 깜빡거리지 않는다.
      if (this.breath <= 0) this.noDive = true;
      if (this.breath > 0.2) this.noDive = false;
      const wantDive = this.diving && !this.airborne && !this.noDive && this.breath > 0;
      this.diveY += ((wantDive ? -DIVE_DEPTH : 0) - this.diveY) * Math.min(1, dt * 3.2);
      if (wantDive) {
        this.breath = Math.max(0, this.breath - dt / DIVE_SECONDS);
        if (this.breath <= 0) this.diving = false;          // 숨이 다하면 올라온다
      } else {
        this.breath = Math.min(1, this.breath + dt / BREATH_RECOVER);
      }
    }
    this.submerged = this.diveY < -DIVE_DEPTH * 0.55;        // 이만큼 내려가면 '물속'으로 친다
    this.crest = h;
    const hover = this.def.hover ?? 0; // 위그선: 항상 수면 위를 낮게 비행
    this.mesh.position.set(this.pos.x, h * (hover ? 0.4 : 0.85) + 0.25 + hover + this.airY + this.diveY, this.pos.z);
    const rock = (0.8 + SEA.storm * 0.9) * (this.def.hover ? 0.3 : 1);
    const targetHeel = -this.steerS * turnEff * 0.26 * (this.speed / P.maxSpeed) + (wn.x * Math.cos(this.heading) * 0.5 - wn.z * Math.sin(this.heading) * 0.5) * rock + effect * 0.3;
    let targetPitch = -(this.speed / P.maxSpeed) * 0.06 + (wn.x * Math.sin(this.heading) + wn.z * Math.cos(this.heading)) * 0.55 * rock;
    if (this.airborne) targetPitch = -THREE.MathUtils.clamp(this.airVy * 0.025, -0.45, 0.35); // 상승 시 뱃머리 들림, 하강 시 숙임
    this.heel += (targetHeel - this.heel) * Math.min(1, 2 * dt);
    this.pitch += (targetPitch - this.pitch) * Math.min(1, 2 * dt);
    this.mesh.rotation.set(0, 0, 0);
    this.mesh.rotateY(this.heading);
    this.mesh.rotateX(this.pitch);
    this.mesh.rotateZ(this.heel);

    // 돛 부풀림/깃발
    const ud = this.mesh.userData;
    // 나포된 배는 돛을 내린 채 파도에만 떠 있다
    const fill = this.captured ? 0.05
      : THREE.MathUtils.clamp(0.35 + rel * 0.65 * wind.strength + this.speed / P.maxSpeed * 0.3, 0.2, 1.2);
    for (const s of ud.sails) s.scale.z += (fill - s.scale.z) * Math.min(1, 2 * dt);
    // 노 젓기 (갤리선·갤리어스·거북선). 한 주기는 두 단계다.
    //  끌기  : 날이 물에 잠긴 채 뱃머리 → 선미로 쓸어 넘긴다
    //  되돌림: 날을 물 밖으로 들어 올려 다시 뱃머리로 가져온다
    // cos 로 앞뒤 휘두름을, -sin 의 양수 구간으로 들어 올림을 만들면 둘이 자연히 반주기씩 엇갈린다.
    if (ud.oars && ud.oars.length) {
      const sr = Math.min(1, Math.abs(this.speed) / P.maxSpeed);
      const freq = 1.5 + sr * 5.4;            // 빠를수록 자주 젓는다
      const amp = 0.14 + sr * 0.46;           // 빠를수록 크게 젓는다
      this.rowPh = (this.rowPh ?? 0) + freq * dt * (this.speed < 0 ? -1 : 1); // 후진하면 거꾸로 젓는다
      for (const o of ud.oars) {
        const ph = this.rowPh - o.lag;
        const lift = Math.max(0, -Math.sin(ph)) * (0.2 + sr * 0.24);
        // 좌·우현은 뱃전 반대쪽에 달려 있어 같은 방향으로 보이려면 부호를 뒤집어야 한다
        o.pivot.rotation.y = Math.cos(ph) * amp * o.s;
        o.pivot.rotation.x = -lift * o.s;
      }
    }
    // 부캉이는 돛이 없다. 꼬리를 저어 나아간다.
    // 몸 → 꼬리자루 → 꼬리지느러미 순으로 파동이 뒤로 흘러가게 위상을 늦춘다.
    // 한 덩어리로 흔들면 막대기를 젓는 것처럼 보인다.
    if (ud.swim) {
      const sr = Math.abs(this.speed) / P.maxSpeed;
      const freq = 2.6 + sr * 7;                       // 빠를수록 자주 젓는다
      const amp = 0.14 + sr * 0.42;                    // 빠를수록 크게 젓는다
      this.swimPh = (this.swimPh ?? 0) + freq * dt;
      const ph = this.swimPh;
      ud.swim.rotation.y = Math.sin(ph) * amp * 0.28;               // 몸통이 살짝 쏠린다
      ud.tail.rotation.y = Math.sin(ph - 0.7) * amp;                // 꼬리자루가 늦게 따라온다
      if (ud.fluke) ud.fluke.rotation.y = Math.sin(ph - 1.5) * amp * 0.8; // 꼬리지느러미는 더 늦게
      ud.swim.rotation.z = Math.cos(ph) * amp * 0.12;               // 젓는 쪽으로 몸이 기운다
      // 가슴지느러미: 방향을 틀 때 바깥쪽을 세워 균형을 잡는다
      for (const f of ud.pecs) {
        const want = -this.steerS * 0.35 * f.userData.side + Math.sin(ph - 1.0) * 0.08;
        f.rotation.x += (want - f.rotation.x) * Math.min(1, dt * 6);
      }
    }
    ud.flag.rotation.y = (wind.dir - this.heading) + Math.PI + Math.sin(t * 8) * 0.15;
    const burning = this.boosting || this.turbo > 0;
    if (ud.turtleFx) {
      // 거북선: 용머리 입김과 선미 불기둥이 저마다 일렁인다. 터보(부스터 패드)일 때 더 길게 뿜는다.
      const fx = ud.turtleFx, k = this.turbo > 0 ? 1.45 : 1;
      for (const f of fx.flames) {
        f.visible = burning;
        if (burning) f.userData.core.scale.set(0.85 + Math.random() * 0.35, k * (0.75 + Math.random() * 0.55), 0.85 + Math.random() * 0.35);
      }
      fx.light.intensity = burning ? (22 + Math.random() * 14) * k : 0;
    } else {
      ud.fire.visible = burning;
      if (burning) { ud.fire.scale.set(1 + Math.random() * 0.3, 1 + Math.random() * 0.5, 1 + Math.random() * 0.3); }
    }
  }

  // 점프대 발사: 속도가 빠를수록 높이·멀리 난다. 공중에서는 터보로 초고속
  launch() {
    if (this.airborne || this.rampCd > 0) return false;
    const P = this.phys;
    const ratio = Math.max(0.35, Math.abs(this.speed) / P.maxSpeed);
    this.airborne = true; this.airTime = 0; this.airY = 0.5; this.airVy = 16 + ratio * 14;
    this.turbo = Math.max(this.turbo, 3.6); this.rampCd = 5;
    this.speed = Math.max(this.speed, P.maxSpeed * 1.4);
    return true;
  }

  // 브리치: 부캉이가 제 힘으로 수면 위로 솟아오른다. 점프대가 필요 없다.
  // 공중에서는 아무것도 부딪히지 않으므로 장애물을 넘는 수단이 된다.
  breach() {
    if (!this.def.freeJump || this.airborne || this.breachCd > 0) return false;
    const P = this.phys;
    const ratio = Math.max(0.3, Math.abs(this.speed) / P.maxSpeed);
    this.diving = false; this.diveY = 0;
    this.airborne = true; this.airTime = 0; this.airY = 0.5; this.airVy = 15 + ratio * 13;
    this.turbo = Math.max(this.turbo, 1.6);
    this.speed = Math.max(this.speed, P.maxSpeed * 0.9);
    this.breachCd = this.def.cannonCooldown ?? 3.5;
    return true;
  }

  // 블랙홀 관문 통과: 출구로 순간이동하고 그 지점의 항로 방향으로 정렬한다
  warpTo(x, z, tx, tz) {
    this.pos.x = x; this.pos.z = z;
    this.heading = Math.atan2(tx, tz);
    this.steerS = 0; this.spin = 0; this.slide.set(0, 0, 0);
    this.speed = Math.max(this.speed, this.phys.maxSpeed * 1.1);
    this.turbo = Math.max(this.turbo, 2.4);
    this.warpCd = 3.5;
    this.mesh.position.set(x, 0.25, z);
  }

  // 충돌 반응
  hitObstacle(nx, nz, strength = 1) {
    const P = this.phys;
    const loss = P.collisionLoss * strength * this.tr.collision;
    this.speed *= 1 - Math.max(0, loss);
    this.slide.x += nx * 18 * strength; this.slide.z += nz * 18 * strength;
    this.stun = Math.max(this.stun, 0.5 * strength * (1.1 - P.mass / 4));
    this.spin += (Math.random() - 0.5) * 0.3 * strength * (this.def.turtle ? 0.2 : (this.def.spinResist ?? 1));
  }
  hitByCannon(dirx, dirz) {
    if (this.def.turtle) { this.slide.x += dirx * 6; this.slide.z += dirz * 6; this.stun = Math.max(this.stun, 0.5); return; }
    this.speed *= 0.6;
    this.slide.x += dirx * 12; this.slide.z += dirz * 12;
    this.stun = Math.max(this.stun, 1.2);
    this.spin += (Math.random() - 0.5) * 0.6;
  }
}
