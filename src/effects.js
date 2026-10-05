// 파티클 시스템 및 잡다한 연출 (항적, 물보라, 갈매기)
import * as THREE from 'three';

const MAX = 7000;
const pVert = /* glsl */`
  attribute float aSize; attribute float aAlpha; attribute vec3 aColor;
  varying float vAlpha; varying vec3 vColor;
  void main() {
    vAlpha = aAlpha; vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const pFrag = /* glsl */`
  uniform sampler2D uTex; varying float vAlpha; varying vec3 vColor;
  void main() {
    vec4 t = texture2D(uTex, gl_PointCoord);
    gl_FragColor = vec4(vColor, t.a * vAlpha);
  }
`;

function softTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export class Particles {
  constructor(scene) {
    this.geo = new THREE.BufferGeometry();
    this.pos = new Float32Array(MAX * 3);
    this.col = new Float32Array(MAX * 3);
    this.size = new Float32Array(MAX);
    this.alpha = new Float32Array(MAX);
    this.vel = new Float32Array(MAX * 3);
    this.life = new Float32Array(MAX);
    this.maxLife = new Float32Array(MAX);
    this.grav = new Float32Array(MAX);
    this.grow = new Float32Array(MAX);   // 초당 커지는 크기 (연기가 퍼진다)
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.geo.setAttribute('aColor', new THREE.BufferAttribute(this.col, 3));
    this.geo.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
    this.geo.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTex: { value: softTexture() } }, vertexShader: pVert, fragmentShader: pFrag,
      transparent: true, depthWrite: false, blending: THREE.NormalBlending,
    });
    this.points = new THREE.Points(this.geo, mat);
    this.points.frustumCulled = false;
    scene.add(this.points);
    this.next = 0;
    this._c = new THREE.Color();
  }

  spawn(x, y, z, vx, vy, vz, life, size, color, grav = 0, grow = 0) {
    const i = this.next; this.next = (this.next + 1) % MAX;
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.vel[i * 3] = vx; this.vel[i * 3 + 1] = vy; this.vel[i * 3 + 2] = vz;
    this.life[i] = life; this.maxLife[i] = life; this.size[i] = size; this.grav[i] = grav; this.grow[i] = grow;
    this._c.set(color);
    this.col[i * 3] = this._c.r; this.col[i * 3 + 1] = this._c.g; this.col[i * 3 + 2] = this._c.b;
    this.alpha[i] = 1;
  }

  burst(x, y, z, count, opts = {}) {
    const { speed = 8, up = 6, life = 1.0, size = 3, color = 0xffffff, grav = -12, spread = 1 } = opts;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.random() * speed;
      this.spawn(x + (Math.random() - 0.5) * spread, y, z + (Math.random() - 0.5) * spread,
        Math.cos(a) * r, up * (0.5 + Math.random()), Math.sin(a) * r,
        life * (0.6 + Math.random() * 0.6), size * (0.6 + Math.random() * 0.8), color, grav);
    }
  }

  update(dt) {
    for (let i = 0; i < MAX; i++) {
      if (this.life[i] <= 0) { this.alpha[i] = 0; continue; }
      this.life[i] -= dt;
      this.vel[i * 3 + 1] += this.grav[i] * dt;
      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      if (this.grow[i]) this.size[i] += this.grow[i] * dt;
      if (this.pos[i * 3 + 1] < -0.5 && this.grav[i] < 0) { this.life[i] = 0; }
      this.alpha[i] = Math.max(0, this.life[i] / this.maxLife[i]) * 0.7;
    }
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.aAlpha.needsUpdate = true;
    this.geo.attributes.aSize.needsUpdate = true;
    this.geo.attributes.aColor.needsUpdate = true;
  }
}

// 갈매기 무리
export class Seagulls {
  constructor(scene, center, count = 10) {
    this.group = new THREE.Group();
    this.birds = [];
    const mat = new THREE.MeshBasicMaterial({ color: 0xf5f5f5, side: THREE.DoubleSide });
    for (let i = 0; i < count; i++) {
      const b = new THREE.Group();
      const lw = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.5), mat);
      const rw = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.5), mat);
      lw.position.x = -1.1; rw.position.x = 1.1;
      lw.geometry.translate(1.1, 0, 0); rw.geometry.translate(-1.1, 0, 0);
      lw.position.x = 0; rw.position.x = 0;
      lw.rotation.x = -Math.PI / 2; rw.rotation.x = -Math.PI / 2;
      lw.scale.x = -1;
      b.add(lw, rw);
      b.userData = { lw, rw, phase: Math.random() * 10, r: 30 + Math.random() * 60, h: 25 + Math.random() * 25, speed: 0.3 + Math.random() * 0.3, offset: Math.random() * Math.PI * 2 };
      this.birds.push(b);
      this.group.add(b);
    }
    this.center = center.clone();
    scene.add(this.group);
  }
  update(t) {
    for (const b of this.birds) {
      const u = b.userData;
      const a = t * u.speed + u.offset;
      b.position.set(this.center.x + Math.cos(a) * u.r, u.h + Math.sin(t * 0.7 + u.phase) * 3, this.center.z + Math.sin(a) * u.r);
      b.rotation.y = -a;
      const flap = Math.sin(t * 9 + u.phase) * 0.6;
      u.lw.rotation.y = flap; u.rw.rotation.y = -flap;
    }
  }
}

// ----- 항적(Wake): 배 뒤로 남는 V자 거품 자국 -----
// 배마다 최근 지나온 자리를 점으로 기록해 두고, 그 선을 따라 폭이 벌어지는 리본을 만든다.
// 배가 돌면 자국도 따라 휘고, 시간이 지나면 폭이 넓어지며 옅어진다 — 실제 항적과 같은 움직임.
const WAKE_PTS = 26;       // 배 한 척이 남기는 자국 점 개수
const WAKE_STEP = 0.07;    // 점을 찍는 간격(초)

const wakeVert = /* glsl */`
  attribute float aAge;    // 0 = 방금, 1 = 사라질 때
  varying float vAge;
  varying vec2 vUv;
  void main() {
    vAge = aAge; vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const wakeFrag = /* glsl */`
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAge;
  varying vec2 vUv;
  void main() {
    // 가장자리는 옅고 가운데가 진하다. 오래된 쪽일수록 전체가 옅어진다.
    float edge = 1.0 - abs(vUv.x * 2.0 - 1.0);
    float a = pow(edge, 0.7) * (1.0 - vAge) * uOpacity;
    // 바깥쪽 가장자리에 거품 테두리를 한 줄 얹는다
    a += smoothstep(0.82, 1.0, 1.0 - edge) * (1.0 - vAge) * uOpacity * 0.5;
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

export class Wakes {
  constructor(scene) {
    this.scene = scene;
    this.entries = [];
  }

  // 배 한 척을 등록한다. color는 거품 색(기본 흰색)
  add(boat, color = 0xdff2ff) {
    const n = WAKE_PTS;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 2 * 3);
    const uv = new Float32Array(n * 2 * 2);
    const age = new Float32Array(n * 2);
    const idx = [];
    for (let i = 0; i < n; i++) {
      uv[i * 4 + 0] = 0; uv[i * 4 + 1] = i / (n - 1);
      uv[i * 4 + 2] = 1; uv[i * 4 + 3] = i / (n - 1);
      if (i < n - 1) {
        const a = i * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setAttribute('aAge', new THREE.BufferAttribute(age, 1));
    geo.setIndex(idx);
    const mat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: 0 } },
      vertexShader: wakeVert, fragmentShader: wakeFrag,
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = 2;
    this.scene.add(mesh);
    this.entries.push({ boat, mesh, geo, mat, pts: [], timer: 0 });
  }

  update(dt, waveHeightFn, t) {
    for (const e of this.entries) {
      const b = e.boat;
      const speedRatio = Math.min(1, Math.abs(b.speed) / Math.max(1, b.phys.maxSpeed));
      // 공중이거나 멈춰 있으면 새 자국을 남기지 않고 있던 것만 지운다
      const laying = !b.airborne && !b.loop && speedRatio > 0.08;
      e.timer -= dt;
      if (e.timer <= 0) {
        e.timer = WAKE_STEP;
        if (laying) {
          const fx = Math.sin(b.heading), fz = Math.cos(b.heading);
          const R = b.phys.radius;
          e.pts.unshift({ x: b.pos.x - fx * R * 0.9, z: b.pos.z - fz * R * 0.9, nx: fz, nz: -fx, w: R * 0.34 + speedRatio * R * 0.28, age: 0 });
        }
        while (e.pts.length > WAKE_PTS) e.pts.pop();
      }
      // 나이 먹이기: 오래될수록 폭이 벌어지고 옅어진다
      for (const q of e.pts) q.age += dt / (WAKE_PTS * WAKE_STEP);
      while (e.pts.length && e.pts[e.pts.length - 1].age >= 1) e.pts.pop();

      const pos = e.geo.attributes.position.array;
      const age = e.geo.attributes.aAge.array;
      const n = WAKE_PTS;
      if (e.pts.length < 2) { e.mat.uniforms.uOpacity.value = 0; continue; }
      for (let i = 0; i < n; i++) {
        const q = e.pts[Math.min(i, e.pts.length - 1)];
        const spread = q.w * (1 + q.age * 1.8);          // 뒤로 갈수록 V자로 벌어진다
        const y = waveHeightFn(q.x, q.z, t) + 0.12;       // 파도 위에 얹는다
        const a = i * 6;
        pos[a + 0] = q.x + q.nx * spread; pos[a + 1] = y; pos[a + 2] = q.z + q.nz * spread;
        pos[a + 3] = q.x - q.nx * spread; pos[a + 4] = y; pos[a + 5] = q.z - q.nz * spread;
        age[i * 2] = age[i * 2 + 1] = Math.min(1, q.age);
      }
      e.geo.attributes.position.needsUpdate = true;
      e.geo.attributes.aAge.needsUpdate = true;
      e.mat.uniforms.uOpacity.value = 0.55 + speedRatio * 0.45;
    }
  }

  dispose() {
    for (const e of this.entries) { this.scene.remove(e.mesh); e.geo.dispose(); e.mat.dispose(); }
    this.entries.length = 0;
  }
}
