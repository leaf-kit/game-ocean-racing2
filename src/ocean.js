// 바다, 하늘, 조명 및 파도 높이 계산
import * as THREE from 'three';

// 파도 정의 (JS와 셰이더가 동일한 수식을 사용)
// 진폭을 키워 파도가 눈에 보이고 배가 실제로 출렁이게 한다.
// 셰이더(oceanVert)의 A1~A3 상수와 반드시 같은 값이어야 배의 부유 위치가 수면과 맞는다.
export const WAVES = [
  { dx: 1.0, dz: 0.3, amp: 1.55, len: 60, speed: 1.1 },
  { dx: -0.4, dz: 1.0, amp: 0.92, len: 34, speed: 1.6 },
  { dx: 0.7, dz: -0.8, amp: 0.44, len: 18, speed: 2.4 },
];
for (const w of WAVES) { const l = Math.hypot(w.dx, w.dz); w.dx /= l; w.dz /= l; }

// 바다 전역 상태: storm 0~1 (파도 증폭), flash 0~1 (번개 섬광)
export const SEA = { storm: 0, flash: 0 };
const STORM_K = (Math.PI * 2) / 110;

export function waveHeight(x, z, t) {
  let h = 0;
  const m = 1 + SEA.storm * 2.0;
  for (const w of WAVES) {
    const k = (Math.PI * 2) / w.len;
    h += w.amp * m * Math.sin((x * w.dx + z * w.dz) * k + t * w.speed);
  }
  // 폭풍의 너울 (긴 파장의 큰 파도)
  if (SEA.storm > 0) h += SEA.storm * 4.6 * Math.sin((x * WAVES[0].dx + z * WAVES[0].dz) * STORM_K + t * 0.9);
  return h;
}
export function waveNormal(x, z, t, out) {
  const e = 0.5;
  const hx = waveHeight(x + e, z, t) - waveHeight(x - e, z, t);
  const hz = waveHeight(x, z + e, t) - waveHeight(x, z - e, t);
  out.set(-hx / (2 * e), 1, -hz / (2 * e)).normalize();
  return out;
}

export const TIME_PRESETS = {
  day: {
    skyTop: 0x1a6fe0, skyHorizon: 0xb8e2ff, sunColor: 0xfff4d6, sunIntensity: 2.5, ambient: 0.8,
    deep: 0x0642a8, shallow: 0x1ea9e8, fog: 0xb8e2ff, fogNear: 320, fogFar: 1900, stars: 0, lantern: 0,
    sunPos: new THREE.Vector3(0.5, 0.7, 0.4), sunDisc: 0xfff9e0, sunSize: 70, hemiGround: 0x1467b0, label: '한낮',
  },
  sunset: {
    skyTop: 0x241d6a, skyHorizon: 0xff9c5a, sunColor: 0xffb070, sunIntensity: 2.0, ambient: 0.55,
    deep: 0x0c2f78, shallow: 0x2f6fbd, fog: 0xf0a078, fogNear: 280, fogFar: 1600, stars: 0.25, lantern: 0.5,
    sunPos: new THREE.Vector3(-0.8, 0.12, 0.4), sunDisc: 0xffd28a, sunSize: 140, hemiGround: 0x3a3a70, label: '석양',
  },
  night: {
    skyTop: 0x02051a, skyHorizon: 0x0b2a58, sunColor: 0xa8c4ff, sunIntensity: 1.2, ambient: 0.4,
    deep: 0x031a48, shallow: 0x0c4d9a, fog: 0x081c3a, fogNear: 220, fogFar: 1400, stars: 1, lantern: 1.6,
    sunPos: new THREE.Vector3(0.3, 0.6, -0.6), sunDisc: 0xe8f0ff, sunSize: 60, hemiGround: 0x061a34, label: '달밤',
  },
  cycle: { label: '낮→밤' },
};
// 시간대 순환: u 0 = 한낮, 0.5 = 석양, 1 = 달밤 (프리셋을 선형 보간)
const _c1 = new THREE.Color(), _c2 = new THREE.Color();
function lerpPreset(u) {
  const a = u < 0.5 ? TIME_PRESETS.day : TIME_PRESETS.sunset, b = u < 0.5 ? TIME_PRESETS.sunset : TIME_PRESETS.night;
  const t = THREE.MathUtils.smoothstep(u < 0.5 ? u * 2 : (u - 0.5) * 2, 0, 1);
  const col = (k) => _c1.set(a[k]).lerp(_c2.set(b[k]), t).getHex();
  const num = (k) => a[k] + (b[k] - a[k]) * t;
  return {
    skyTop: col('skyTop'), skyHorizon: col('skyHorizon'), sunColor: col('sunColor'), deep: col('deep'), shallow: col('shallow'), fog: col('fog'), sunDisc: col('sunDisc'), hemiGround: col('hemiGround'),
    sunIntensity: num('sunIntensity'), ambient: num('ambient'), fogNear: num('fogNear'), fogFar: num('fogFar'), stars: num('stars'), lantern: num('lantern'), sunSize: num('sunSize'),
    sunPos: a.sunPos.clone().lerp(b.sunPos, t).normalize(), label: u < 0.35 ? '한낮' : u < 0.7 ? '석양' : '달밤',
  };
}

// 얕은 바다(섬 주변 여울) 개수 상한. 반지름이 큰 섬부터 채운다.
export const SHALLOW_MAX = 40;

const oceanVert = /* glsl */`
  uniform float uTime, uStorm;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vHeight;
  varying float vSteep;
  const float PI2 = 6.28318530718;
  // 파도 상수 (WAVES와 동일)
  const vec2 D1 = normalize(vec2(1.0, 0.3));   const float A1 = 1.55;  const float L1 = 60.0; const float S1 = 1.1;
  const vec2 D2 = normalize(vec2(-0.4, 1.0));  const float A2 = 0.92; const float L2 = 34.0; const float S2 = 1.6;
  const vec2 D3 = normalize(vec2(0.7, -0.8));  const float A3 = 0.44;  const float L3 = 18.0; const float S3 = 2.4;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vec2 p = wp.xz;
    float k1 = PI2 / L1, k2 = PI2 / L2, k3 = PI2 / L3;
    float ph1 = dot(p, D1) * k1 + uTime * S1;
    float ph2 = dot(p, D2) * k2 + uTime * S2;
    float ph3 = dot(p, D3) * k3 + uTime * S3;
    float m = 1.0 + uStorm * 2.0;
    float h = (A1 * sin(ph1) + A2 * sin(ph2) + A3 * sin(ph3)) * m;
    // 폭풍 너울 (JS waveHeight와 동일)
    float kS = PI2 / 110.0;
    float phS = dot(p, D1) * kS + uTime * 0.9;
    h += uStorm * 4.6 * sin(phS);
    // 작은 잔물결 + 촘촘한 잔파도 (시각 전용)
    h += (0.12 + uStorm * 0.25) * sin(p.x * 0.9 + uTime * 3.0) * sin(p.y * 0.8 - uTime * 2.3);
    vec2 D4 = normalize(vec2(0.3, -1.0)); float k4 = PI2 / 9.0; float ph4 = dot(p, D4) * k4 + uTime * 3.4;
    vec2 D5 = normalize(vec2(-0.9, -0.5)); float k5 = PI2 / 5.5; float ph5 = dot(p, D5) * k5 + uTime * 4.1;
    h += 0.09 * sin(ph4) + 0.05 * sin(ph5);
    // 게르스트너 수평 변위: 물이 마루 쪽으로 쏠려 마루는 뾰족하고 골은 넓게 퍼진다.
    // 셋째 파까지 변위를 주면 잔파도 마루도 날이 서서 유리판 같은 느낌이 사라진다.
    float steep = 0.34 + uStorm * 0.34;
    wp.xz += D1 * (steep * A1 * m * cos(ph1)) + D2 * (steep * A2 * m * cos(ph2)) + D3 * (steep * 0.7 * A3 * m * cos(ph3));
    vec2 grad = (D1 * (A1 * k1 * cos(ph1)) + D2 * (A2 * k2 * cos(ph2)) + D3 * (A3 * k3 * cos(ph3))) * m + D1 * (uStorm * 4.6 * kS * cos(phS))
      + D4 * (0.09 * k4 * cos(ph4)) + D5 * (0.05 * k5 * cos(ph5));
    wp.y += h;
    vWorldPos = wp.xyz;
    vNormal = normalize(vec3(-grad.x, 1.0, -grad.y));
    vHeight = h;
    // 파면의 가파른 정도. 실제 바다에서 흰 물마루는 높은 곳이 아니라 '가팔라져 무너지는' 곳에 생긴다.
    // 마루 쪽(sin이 양수)에서 기울기가 클수록 값이 커진다.
    float crestSide = max(0.0, A1 * sin(ph1) + A2 * sin(ph2)) / max(0.001, A1 + A2);
    vSteep = clamp(length(grad) * (0.9 + uStorm * 1.1) * (0.35 + crestSide), 0.0, 1.0);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const oceanFrag = /* glsl */`
  uniform vec3 uDeep, uShallow, uSky, uSkyTop, uFog, uSunColor, uSunDir, uReef;
  uniform float uFogNear, uFogFar, uTime, uSpecPow, uStorm, uFlash;
  uniform int uShallowN;
  uniform vec3 uShallows[SHALLOW_MAX];   // xz = 섬 중심, z = 여울이 끝나는 반지름
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vHeight;
  varying float vSteep;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  // 하늘 반사색: 반사 벡터가 위를 볼수록 천정색, 수평에 가까울수록 지평선색
  vec3 skyColor(vec3 r) {
    float h = clamp(r.y, 0.0, 1.0);
    return mix(uSky, uSkyTop, pow(h, 0.6));
  }
  void main() {
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 L = normalize(uSunDir);
    vec2 p = vWorldPos.xz;
    float dist = length(cameraPosition - vWorldPos);
    // 멀수록 잔물결 노멀을 눌러 반짝임이 들끓는 것(에일리어싱)을 막는다
    float detail = 1.0 - smoothstep(60.0, 700.0, dist);
    // 잔물결 디테일 노멀: 서로 다른 방향의 작은 물결 3겹 + 노이즈 결 2겹
    float r1 = sin(p.x * 0.9 + p.y * 0.4 + uTime * 2.2), r2 = sin(p.x * -0.5 + p.y * 1.1 - uTime * 1.7), r3 = sin(p.x * 1.7 - p.y * 1.3 + uTime * 3.1);
    float r4 = sin(p.x * 3.1 + p.y * 2.6 - uTime * 4.4);
    float nz1 = noise(p * 0.35 + uTime * 0.25), nz2 = noise(p * 0.35 + vec2(1.7, 0.0) + uTime * 0.25);
    float nz3 = noise(p * 1.2 - uTime * 0.6), nz4 = noise(p * 1.2 + vec2(3.3, 0.0) - uTime * 0.6);
    vec3 N = normalize(vNormal + detail * vec3(
      r1 * 0.06 + r3 * 0.03 + r4 * 0.02 + (nz1 - 0.5) * 0.12 + (nz3 - 0.5) * 0.06, 0.0,
      r2 * 0.06 - r3 * 0.03 + r4 * 0.02 + (nz2 - 0.5) * 0.12 + (nz4 - 0.5) * 0.06));
    // 슐릭 근사 프레넬 (물 F0 = 0.02)
    float ndv = max(dot(N, V), 0.0);
    float fres = 0.02 + 0.98 * pow(1.0 - ndv, 5.0);
    float t = smoothstep(-2.0 - uStorm * 3.2, 2.6 + uStorm * 4.0, vHeight);
    // 깊이감: 내려다볼수록 짙은 물, 비스듬히 볼수록 하늘빛. 큰 노이즈로 물빛 얼룩
    float blotch = noise(p * 0.02 + uTime * 0.02) * 0.5 + noise(p * 0.06 - uTime * 0.03) * 0.5;
    vec3 base = mix(uDeep, uShallow, t * 0.75 + blotch * 0.35);
    base *= 0.9 + blotch * 0.2;
    // 섬 둘레의 여울: 물이 얕아질수록 바닥의 모래가 비쳐 에메랄드빛이 된다.
    // 가장 가까운 섬까지의 거리로 0~1 얕음(shoal)을 구한다.
    float shoal = 0.0;
    for (int i = 0; i < SHALLOW_MAX; i++) {
      if (i >= uShallowN) break;
      vec3 s = uShallows[i];
      float d = distance(p, s.xy);
      shoal = max(shoal, 1.0 - smoothstep(s.z * 0.45, s.z, d));
    }
    // 가장자리를 노이즈로 흐트러뜨려 산호초처럼 얼룩덜룩하게
    shoal = clamp(shoal * (0.75 + 0.45 * noise(p * 0.08)), 0.0, 1.0);
    base = mix(base, uReef, shoal * 0.85);
    // 물가에 가장 가까운 띠는 모래가 비쳐 거의 흰빛에 가깝다
    base = mix(base, mix(uReef, vec3(0.93, 0.89, 0.74), 0.55), smoothstep(0.72, 1.0, shoal) * 0.7);
    // 파도 마루 뒤로 빛이 비치는 투명한 물빛 (역광 산란). 마루가 얇을수록 더 밝게 비친다
    float sss = pow(max(dot(V, -L), 0.0), 3.0) * smoothstep(0.2, 1.0, t);
    sss += pow(max(dot(V, -L), 0.0), 8.0) * smoothstep(0.55, 1.0, t) * 0.8;
    base += uShallow * sss * 0.8 + uSunColor * sss * 0.12;
    base = mix(base, vec3(0.13, 0.17, 0.2), uStorm * 0.65);
    float diff = max(dot(N, L), 0.0) * 0.4 + 0.6;
    vec3 col = base * diff;
    // 하늘 반사: 반사 벡터로 하늘색을 뽑아 프레넬만큼 섞는다
    vec3 R = reflect(-V, N);
    vec3 refl = skyColor(R);
    col = mix(col, refl, clamp(fres * 1.1, 0.0, 0.85));
    // 태양 반사: 넓은 광택 + 날카로운 반짝임(글리터). 글리터는 가까울 때만
    // 태양을 향한 쪽으로 길게 늘어지는 윤슬(glitter path). 물결이 잘게 흔들려 반짝임이 띠를 이룬다.
    vec3 H = normalize(L + V);
    float ndh = max(dot(N, H), 0.0);
    float specBroad = pow(ndh, uSpecPow * 0.25) * 0.4;
    float glitter = pow(ndh, uSpecPow * 2.0) * (0.6 + 0.8 * noise(p * 2.5 + uTime * 1.5)) * detail;
    // 시선과 태양이 같은 방위에 있을수록(역광) 윤슬이 강해진다
    vec2 sunAz = normalize(L.xz + vec2(1e-4));
    vec2 viewAz = normalize(-V.xz + vec2(1e-4));
    float path = pow(max(dot(sunAz, viewAz), 0.0), 3.0);
    col += uSunColor * (specBroad + glitter * 1.8) * (0.4 + fres * 2.0);
    col += uSunColor * path * glitter * 1.6 * (1.0 - uStorm * 0.7);
    // 거품: 마루의 흰 거품 + 바람 방향으로 길게 늘어진 거품 줄무늬
    vec2 wdir = normalize(vec2(1.0, 0.3));
    vec2 sp = vec2(dot(p, wdir), dot(p, vec2(-wdir.y, wdir.x)));
    float foamN = noise(p * 0.25 + uTime * 0.3) * noise(p * 0.07 - uTime * 0.1);
    float streak = noise(vec2(sp.x * 0.05 - uTime * 0.15, sp.y * 0.6)) * noise(vec2(sp.x * 0.12 + uTime * 0.1, sp.y * 1.4));
    float crest = smoothstep(0.55 - uStorm * 0.2, 1.0, t);
    float foam = crest * smoothstep(0.25 - uStorm * 0.15, 0.6, foamN);
    foam += smoothstep(0.3, 0.75, t) * smoothstep(0.42, 0.7, streak) * (0.35 + uStorm * 0.5);
    // 무너지는 마루의 흰 물결: 높이가 아니라 '가파른 정도'로 생긴다. 바다가 거칠수록 넓게 번진다.
    // 잔 노이즈를 곱해 페인트를 칠한 듯 뭉치지 않고 물보라처럼 흩어지게 한다.
    float breaking = smoothstep(0.38 - uStorm * 0.18, 0.78, vSteep);
    float spray = noise(p * 1.6 + uTime * 0.7) * 0.6 + noise(p * 4.5 - uTime * 1.3) * 0.4;
    foam += breaking * (0.30 + uStorm * 0.26) * smoothstep(0.2, 0.75, spray);
    // 여울에서는 파도가 바닥에 걸려 먼저 부서진다
    foam += shoal * crest * 0.45;
    // 거품 가장자리는 잔거품으로 흩어짐
    float speck = step(0.9, noise(p * 3.0 + uTime * 0.8)) * crest * 0.5 * detail;
    foam = clamp(foam + speck, 0.0, 1.0);
    // 거품도 빛을 받는다: 햇빛 쪽이 밝고 그늘은 푸르스름
    vec3 foamCol = mix(vec3(0.72, 0.80, 0.88), vec3(0.98, 1.0, 1.0), max(dot(N, L), 0.0));
    col = mix(col, foamCol, foam * (0.65 + uStorm * 0.3));
    // 마루 뒤쪽 그늘: 물결에 입체감
    col *= 1.0 - (1.0 - t) * 0.12;
    // 거리: 멀수록 하늘빛이 섞이고 안개
    col = mix(col, uSky, smoothstep(150.0, 1200.0, dist) * 0.3);
    float fog = smoothstep(uFogNear, uFogFar, dist);
    col = mix(col, uFog, fog);
    col += vec3(uFlash * 0.5);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const skyVert = /* glsl */`
  varying vec3 vDir;
  void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const skyFrag = /* glsl */`
  uniform vec3 uTop, uHorizon, uSunDir, uSunDisc;
  uniform float uSunSize, uStars, uStorm, uFlash, uAurora, uTime;
  varying vec3 vDir;
  float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453); }
  void main() {
    float h = clamp(vDir.y, 0.0, 1.0);
    vec3 col = mix(uHorizon, uTop, pow(h, 0.55));
    float sd = max(dot(vDir, normalize(uSunDir)), 0.0);
    float disc = smoothstep(1.0 - uSunSize * 0.00004, 1.0 - uSunSize * 0.00001, sd);
    float glow = pow(sd, 18.0) * 0.5 + pow(sd, 3.0) * 0.12;
    col += uSunDisc * (disc + glow);
    if (uStars > 0.01 && vDir.y > 0.0) {
      // 별: 격자 해시 + 반짝임
      vec3 g = floor(vDir * 220.0);
      float s = hash(g);
      float tw = 0.65 + 0.35 * sin(uTime * (2.0 + hash(g + 3.0) * 4.0) + hash(g + 7.0) * 6.28);
      float star = step(0.982, s) * smoothstep(0.0, 0.2, vDir.y) * tw;
      vec3 g2 = floor(vDir * 90.0);
      float big = step(0.993, hash(g2 + 11.0)) * smoothstep(0.0, 0.2, vDir.y) * (0.7 + 0.3 * sin(uTime * 1.5 + hash(g2) * 6.28));
      col += (vec3(star) * (0.6 + 0.4 * hash(g + 1.0)) + vec3(0.9, 0.95, 1.0) * big * 1.4) * uStars;
      // 은하수: 비스듬한 띠에 노이즈 구름
      vec3 mwN = normalize(vec3(0.55, 0.35, -0.75));
      float d = dot(vDir, mwN);
      float band = exp(-d * d * 28.0);
      vec3 q = vDir * 6.0;
      float n1 = hash(floor(q)) * 0.5 + hash(floor(q * 2.3 + 5.0)) * 0.3 + hash(floor(q * 5.1 + 9.0)) * 0.2;
      float n2 = hash(floor(q * 1.7 + 2.0));
      float mw = band * (0.35 + 0.65 * n1) * smoothstep(0.0, 0.25, vDir.y);
      col += mix(vec3(0.5, 0.6, 0.95), vec3(0.95, 0.85, 0.9), n2) * mw * 0.55 * uStars;
      col += vec3(star) * band * 0.8 * uStars;
    }
    // 수평선 아래는 안개색
    if (vDir.y < 0.0) col = uHorizon;
    // 오로라: 지평선 위에 물결치는 초록-보라 빛의 장막
    if (uAurora > 0.001 && vDir.y > 0.02) {
      float ang = atan(vDir.z, vDir.x);
      float band = sin(ang * 5.0 + uTime * 0.35 + sin(ang * 3.0 - uTime * 0.2) * 1.4) * 0.5 + 0.5;
      float band2 = sin(ang * 9.0 - uTime * 0.5) * 0.5 + 0.5;
      float curtain = smoothstep(0.35, 0.95, band * 0.7 + band2 * 0.3);
      float alt = smoothstep(0.03, 0.22, vDir.y) * (1.0 - smoothstep(0.35, 0.75, vDir.y));
      vec3 ac = mix(vec3(0.15, 0.95, 0.45), vec3(0.6, 0.25, 0.95), smoothstep(0.1, 0.6, vDir.y));
      col += ac * curtain * alt * uAurora * 0.9;
    }
    // 폭풍: 먹구름 색으로, 번개 섬광
    vec3 stormCol = mix(vec3(0.3, 0.32, 0.36), vec3(0.12, 0.13, 0.17), pow(h, 0.5));
    col = mix(col, stormCol, uStorm * 0.9);
    col += vec3(uFlash) * (0.9 + 0.4 * h);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export class Environment {
  constructor(scene, presetName = 'day', size = 5000, map = null) {
    this.scene = scene;
    this.map = map;
    this.tint = map && map.tint ? { deep: new THREE.Color(map.tint.deep), shallow: new THREE.Color(map.tint.shallow) } : null;
    this.fogMul = map && map.fog ? map.fog : 1;
    this.preset = (presetName === 'cycle' ? lerpPreset(0) : TIME_PRESETS[presetName]) || TIME_PRESETS.day;
    const p = this.preset;

    // 바다
    this.oceanUniforms = {
      uTime: { value: 0 },
      uDeep: { value: this._tintDeep(p.deep) }, uShallow: { value: this._tintShallow(p.shallow) },
      uSky: { value: new THREE.Color(p.skyHorizon) }, uSkyTop: { value: new THREE.Color(p.skyTop) }, uFog: { value: new THREE.Color(p.fog) },
      uSunColor: { value: new THREE.Color(p.sunColor) }, uSunDir: { value: p.sunPos.clone().normalize() },
      uFogNear: { value: p.fogNear * this.fogMul }, uFogFar: { value: p.fogFar * this.fogMul }, uSpecPow: { value: presetName === 'sunset' ? 60 : 140 },
      uStorm: { value: 0 }, uFlash: { value: 0 },
      // 섬 둘레 여울: xz = 중심, z 성분 = 여울 바깥 반지름
      uReef: { value: this._reefColor(map) },
      uShallowN: { value: 0 },
      uShallows: { value: Array.from({ length: SHALLOW_MAX }, () => new THREE.Vector3()) },
    };
    const oceanGeo = new THREE.PlaneGeometry(size, size, 360, 360);
    oceanGeo.rotateX(-Math.PI / 2);
    const oceanMat = new THREE.ShaderMaterial({
      uniforms: this.oceanUniforms, vertexShader: oceanVert,
      fragmentShader: oceanFrag.replace(/SHALLOW_MAX/g, String(SHALLOW_MAX)),
    });
    this.ocean = new THREE.Mesh(oceanGeo, oceanMat);
    this.ocean.frustumCulled = false;
    scene.add(this.ocean);

    // 하늘
    const skyGeo = new THREE.SphereGeometry(2400, 32, 16);
    this.skyUniforms = {
      uTop: { value: new THREE.Color(p.skyTop) }, uHorizon: { value: new THREE.Color(p.skyHorizon) },
      uSunDir: { value: p.sunPos.clone().normalize() }, uSunDisc: { value: new THREE.Color(p.sunDisc) },
      uSunSize: { value: p.sunSize }, uStars: { value: +p.stars || 0 }, uStorm: { value: 0 }, uFlash: { value: 0 }, uAurora: { value: 0 }, uTime: { value: 0 },
    };
    const skyMat = new THREE.ShaderMaterial({ uniforms: this.skyUniforms, vertexShader: skyVert, fragmentShader: skyFrag, side: THREE.BackSide, depthWrite: false });
    this.sky = new THREE.Mesh(skyGeo, skyMat);
    this.sky.frustumCulled = false;
    scene.add(this.sky);

    // 조명
    this.sun = new THREE.DirectionalLight(p.sunColor, p.sunIntensity);
    this.sun.position.copy(p.sunPos).multiplyScalar(500);
    scene.add(this.sun);
    this.hemi = new THREE.HemisphereLight(p.skyHorizon, p.hemiGround, p.ambient);
    scene.add(this.hemi);
    scene.fog = new THREE.Fog(p.fog, p.fogNear * this.fogMul, p.fogFar * this.fogMul);

    // 구름 (스프라이트)
    this.clouds = new THREE.Group();
    const cloudTex = makeCloudTexture();
    const cloudColor = presetName === 'night' ? 0x2a3a55 : presetName === 'sunset' ? 0xffc4a0 : 0xffffff;
    for (let i = 0; i < 40; i++) {
      const m = new THREE.SpriteMaterial({ map: cloudTex, color: cloudColor, transparent: true, opacity: presetName === 'night' ? 0.5 : 0.85, depthWrite: false, fog: true });
      const s = new THREE.Sprite(m);
      const a = Math.random() * Math.PI * 2, r = 700 + Math.random() * 1200;
      s.position.set(Math.cos(a) * r, 120 + Math.random() * 160, Math.sin(a) * r);
      const sc = 180 + Math.random() * 260;
      s.scale.set(sc, sc * 0.45, 1);
      s.userData.baseColor = new THREE.Color(cloudColor);
      this.clouds.add(s);
    }
    scene.add(this.clouds);
    this._stormCloud = new THREE.Color(0x2a2d33);
    this._stormFog = new THREE.Color(0x3a3f47);
    this._stormSky = new THREE.Color(0x232830);
    this._baseFog = new THREE.Color(p.fog);
    this._baseSkyTop = new THREE.Color(p.skyTop);
    this._baseSkyHor = new THREE.Color(p.skyHorizon);
    this._tmp = new THREE.Color();
  }

  // 폭풍 강도(0~1)와 번개 섬광(0~1)을 조명/안개/셰이더에 반영
  setStorm(storm, flash) {
    const p = this.preset;
    this.oceanUniforms.uStorm.value = storm; this.oceanUniforms.uFlash.value = flash;
    this.skyUniforms.uStorm.value = storm; this.skyUniforms.uFlash.value = flash;
    this.sun.intensity = p.sunIntensity * (1 - storm * 0.65) + flash * 5;
    this.hemi.intensity = p.ambient * (1 - storm * 0.4) + flash * 1.5;
    this.scene.fog.near = p.fogNear * this.fogMul * (1 - storm * 0.55);
    this.scene.fog.far = p.fogFar * this.fogMul * (1 - storm * 0.5);
    this._tmp.copy(this._baseFog).lerp(this._stormFog, storm);
    this.scene.fog.color.copy(this._tmp);
    this.oceanUniforms.uFog.value.copy(this._tmp);
    // 물에 비치는 하늘도 함께 어두워진다
    this.oceanUniforms.uSkyTop.value.copy(this._baseSkyTop).lerp(this._stormSky, storm * 0.9);
    this.oceanUniforms.uSky.value.copy(this._baseSkyHor).lerp(this._stormSky, storm * 0.8);
    for (const c of this.clouds.children) c.material.color.copy(c.userData.baseColor).lerp(this._stormCloud, storm);
  }

  setAurora(v) { this.skyUniforms.uAurora.value = v; }

  // 맵마다 다른 여울 색. 열대는 에메랄드, 극지는 옅은 하늘빛, 바위섬은 청록빛.
  _reefColor(map) {
    const byStyle = { tropical: 0x3fe0c8, atoll: 0x4fe8d0, rocky: 0x2fc0c4, ice: 0x9fe8f5, coast: 0x35b8c0, harbor: 0x3aa8a0, river: 0x7fc47a };
    return new THREE.Color(byStyle[map && map.style] || 0x3fd8c8);
  }

  // 섬 둘레에 얕은 바다를 깐다. 큰 섬부터 SHALLOW_MAX개까지.
  setShallows(islands) {
    const list = [...(islands || [])].sort((a, b) => b.r - a.r).slice(0, SHALLOW_MAX);
    const arr = this.oceanUniforms.uShallows.value;
    list.forEach((isl, i) => arr[i].set(isl.x, isl.z, isl.r * 2.1)); // 반지름의 2.1배까지 여울
    this.oceanUniforms.uShallowN.value = list.length;
  }
  // 맵 물빛: 프리셋 색과 맵 색을 섞는다
  _tintDeep(c) { const col = new THREE.Color(c); return this.tint ? col.lerp(this.tint.deep, 0.55) : col; }
  _tintShallow(c) { const col = new THREE.Color(c); return this.tint ? col.lerp(this.tint.shallow, 0.55) : col; }

  // 낮→밤 순환: u 0~1. 반환값은 현재 랜턴 밝기(0~1.6)
  setPhase(u) {
    const p = lerpPreset(u);
    this.preset = p; // 폭풍 계산의 기준값도 함께 이동
    this._baseFog.set(p.fog);
    this._baseSkyTop.set(p.skyTop); this._baseSkyHor.set(p.skyHorizon);
    const O = this.oceanUniforms, S = this.skyUniforms;
    O.uDeep.value.copy(this._tintDeep(p.deep)); O.uShallow.value.copy(this._tintShallow(p.shallow)); O.uSky.value.set(p.skyHorizon); O.uSkyTop.value.set(p.skyTop); O.uFog.value.set(p.fog);
    O.uSunColor.value.set(p.sunColor); O.uSunDir.value.copy(p.sunPos); O.uFogNear.value = p.fogNear * this.fogMul; O.uFogFar.value = p.fogFar * this.fogMul;
    O.uSpecPow.value = 140 - Math.sin(u * Math.PI) * 80;
    S.uTop.value.set(p.skyTop); S.uHorizon.value.set(p.skyHorizon); S.uSunDir.value.copy(p.sunPos); S.uSunDisc.value.set(p.sunDisc);
    S.uSunSize.value = p.sunSize; S.uStars.value = p.stars;
    this.sun.color.set(p.sunColor); this.sun.position.copy(p.sunPos).multiplyScalar(500);
    this.hemi.color.set(p.skyHorizon); this.hemi.groundColor.set(p.hemiGround);
    const cc = _c1.set(0xffffff).lerp(_c2.set(0xffc4a0), Math.min(1, u * 2)).lerp(_c2.set(0x2a3a55), Math.max(0, u * 2 - 1));
    for (const c of this.clouds.children) { c.userData.baseColor.copy(cc); c.material.opacity = 0.85 - Math.max(0, u * 2 - 1) * 0.35; }
    return p.lantern;
  }

  update(t, cameraPos) {
    this.oceanUniforms.uTime.value = t;
    this.skyUniforms.uTime.value = t;
    // 바다와 하늘은 카메라를 따라다님 (무한 바다 효과)
    this.ocean.position.x = Math.round(cameraPos.x / 20) * 20;
    this.ocean.position.z = Math.round(cameraPos.z / 20) * 20;
    this.sky.position.copy(cameraPos);
    this.clouds.position.x = cameraPos.x * 0.9;
    this.clouds.position.z = cameraPos.z * 0.9;
  }
}

function makeCloudTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 256, 128);
  for (let i = 0; i < 14; i++) {
    const x = 40 + Math.random() * 176, y = 50 + Math.random() * 40, r = 25 + Math.random() * 35;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  return tex;
}
