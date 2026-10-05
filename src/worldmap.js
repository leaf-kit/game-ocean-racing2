// 양피지 풍 세계지도: 항로, 기항지, 현재 위치 표시
import { PORTS, CONTINENTS, REGION_COASTS } from './history.js?v=20261005i';

export const WORLD_ROUTE = { ports: PORTS, bounds: [-180, 180, -58, 78] };

export class WorldMap {
  constructor(canvas, route = WORLD_ROUTE) {
    this.c = canvas; this.ctx = canvas.getContext('2d');
    this.W = canvas.width; this.H = canvas.height;
    this.setRoute(route);
  }
  // 맵마다 다른 항로/범위로 지도를 다시 그린다
  setRoute(route) {
    this.route = route; this.ports = route.ports;
    [this.LON_MIN, this.LON_MAX, this.LAT_MIN, this.LAT_MAX] = route.bounds;
    this.center = route.center ?? null; // 태평양처럼 날짜변경선을 가운데 두는 지도
    this.base = this._drawBase();
  }
  // 경도 정규화: center 가 있으면 center±180 범위로
  _lon(lon) { if (this.center != null) { while (lon < this.center - 180) lon += 360; while (lon > this.center + 180) lon -= 360; } return lon; }
  _xyRaw(lon, lat) { return [((lon - this.LON_MIN) / (this.LON_MAX - this.LON_MIN)) * this.W, ((this.LAT_MAX - lat) / (this.LAT_MAX - this.LAT_MIN)) * this.H]; }
  // 경위도 -> 캔버스 좌표
  xy(lon, lat) {
    lon = this._lon(lon);
    return [((lon - this.LON_MIN) / (this.LON_MAX - this.LON_MIN)) * this.W, ((this.LAT_MAX - lat) / (this.LAT_MAX - this.LAT_MIN)) * this.H];
  }

  _drawBase() {
    if (this.route.space) return this._drawSpaceBase();
    const off = document.createElement('canvas'); off.width = this.W; off.height = this.H;
    const o = off.getContext('2d'), W = this.W, H = this.H;
    // 양피지 배경
    const g = o.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W * 0.7);
    g.addColorStop(0, '#e9d9ae'); g.addColorStop(1, '#c9ad70');
    o.fillStyle = g; o.fillRect(0, 0, W, H);
    // 얼룩
    for (let i = 0; i < 40; i++) {
      o.fillStyle = `rgba(120,80,30,${0.03 + Math.random() * 0.05})`;
      o.beginPath(); o.arc(Math.random() * W, Math.random() * H, 6 + Math.random() * 30, 0, Math.PI * 2); o.fill();
    }
    // 위경도 격자
    o.strokeStyle = 'rgba(90,60,20,0.18)'; o.lineWidth = 1;
    const gStep = (this.LON_MAX - this.LON_MIN) > 200 ? 30 : (this.LON_MAX - this.LON_MIN) > 40 ? 10 : 2;
    for (let lon = -540; lon <= 540; lon += gStep) { const [x] = this.xy(lon, 0); if (x < 0 || x > W) continue; o.beginPath(); o.moveTo(x, 0); o.lineTo(x, H); o.stroke(); }
    for (let lat = -90; lat <= 90; lat += gStep) { const [, y] = this.xy(this.LON_MIN, lat); if (y < 0 || y > H) continue; o.beginPath(); o.moveTo(0, y); o.lineTo(W, y); o.stroke(); }
    // 강 중심선만 있는 맵: 온통 뭍으로 칠한 뒤 강을 굵게 파낸다
    if (this.route.river) {
      o.fillStyle = '#b89a62'; o.fillRect(0, 0, W, H);
      o.lineCap = 'round'; o.lineJoin = 'round';
      const line = (w, c) => { o.strokeStyle = c; o.lineWidth = w; o.beginPath(); this.route.river.forEach(([lon, lat], i) => { const [x, y] = this.xy(lon, lat); if (i === 0) o.moveTo(x, y); else o.lineTo(x, y); }); o.stroke(); };
      line(15, '#5a3d18'); line(12, '#dcc792');
    }
    // 대륙 (날짜변경선 양쪽으로 복사해 어느 범위든 이어지게)
    const polys = this.route.river ? [] : this.route.coasts ? REGION_COASTS[this.route.coasts] : CONTINENTS;
    for (const shift of (this.route.coasts ? [0] : [0, 360, -360])) for (const poly of polys) {
      o.beginPath();
      poly.forEach(([lon, lat], i) => { const [x, y] = this._xyRaw(lon + shift, lat); if (i === 0) o.moveTo(x, y); else o.lineTo(x, y); });
      o.closePath();
      o.fillStyle = '#b89a62'; o.fill();
      o.strokeStyle = '#5a3d18'; o.lineWidth = 1.2; o.stroke();
    }
    // 항로 (점선)
    o.setLineDash([4, 3]); o.strokeStyle = 'rgba(140,30,20,0.75)'; o.lineWidth = 1.6;
    for (let i = 0; i < this.ports.length; i++) this._routeSegment(o, this.ports[i], this.ports[(i + 1) % this.ports.length]);
    o.setLineDash([]);
    // 기항지 점
    for (const p of this.ports) { const [x, y] = this.xy(p.lon, p.lat); o.fillStyle = '#7a1f14'; o.beginPath(); o.arc(x, y, 2.6, 0, Math.PI * 2); o.fill(); }
    // 나침반 장식
    const cx = W - 26, cy = H - 26;
    o.strokeStyle = 'rgba(90,60,20,0.7)'; o.lineWidth = 1; o.beginPath(); o.arc(cx, cy, 12, 0, Math.PI * 2); o.stroke();
    o.fillStyle = '#7a1f14'; o.beginPath(); o.moveTo(cx, cy - 14); o.lineTo(cx + 4, cy); o.lineTo(cx, cy + 4); o.lineTo(cx - 4, cy); o.closePath(); o.fill();
    // 테두리
    o.strokeStyle = '#5a3d18'; o.lineWidth = 3; o.strokeRect(1.5, 1.5, W - 3, H - 3);
    return off;
  }

  // 우주 항로: 양피지 대신 태양계 그림. 기항지 자리는 경위도가 아니라 그림 위 좌표다.
  _drawSpaceBase() {
    const off = document.createElement('canvas'); off.width = this.W; off.height = this.H;
    const o = off.getContext('2d'), W = this.W, H = this.H;
    const g = o.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#05041a'); g.addColorStop(1, '#1a0b3a');
    o.fillStyle = g; o.fillRect(0, 0, W, H);
    for (let i = 0; i < 160; i++) { o.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.7})`; o.fillRect(Math.random() * W, Math.random() * H, Math.random() < 0.1 ? 2 : 1, Math.random() < 0.1 ? 2 : 1); }
    // 태양 (왼쪽 밖) 과 궤도
    const [sx, sy] = [-W * 0.12, H * 0.55];
    const sg = o.createRadialGradient(sx, sy, 2, sx, sy, W * 0.2); sg.addColorStop(0, 'rgba(255,230,140,1)'); sg.addColorStop(0.4, 'rgba(255,170,60,0.55)'); sg.addColorStop(1, 'rgba(255,120,40,0)');
    o.fillStyle = sg; o.fillRect(0, 0, W, H);
    o.strokeStyle = 'rgba(160,180,255,0.18)'; o.lineWidth = 1;
    const PLANET = { earth: ['#3a8ae0', 5], moon: ['#cfcfcf', 2.6], mars: ['#d0603a', 4], ceres: ['#9a948a', 2.4], jupiter: ['#d8b088', 8], saturn: ['#e2cc8a', 6.5] };
    for (const p of this.ports) if (p.planet && p.planet !== 'moon') {
      const [x, y] = this.xy(p.lon, p.lat);
      o.beginPath(); o.arc(sx, sy, Math.hypot(x - sx, y - sy), -0.9, 0.9); o.stroke();
    }
    // 항로 (점선)
    o.setLineDash([4, 3]); o.strokeStyle = 'rgba(143,212,255,0.7)'; o.lineWidth = 1.4;
    for (let i = 0; i < this.ports.length; i++) this._routeSegment(o, this.ports[i], this.ports[(i + 1) % this.ports.length]);
    o.setLineDash([]);
    // 행성과 기항지
    for (const p of this.ports) {
      const [x, y] = this.xy(p.lon, p.lat);
      const pl = PLANET[p.planet];
      if (pl) {
        const pg = o.createRadialGradient(x - pl[1] * 0.4, y - pl[1] * 0.4, 0.5, x, y, pl[1]);
        pg.addColorStop(0, '#ffffff'); pg.addColorStop(0.25, pl[0]); pg.addColorStop(1, '#101020');
        o.fillStyle = pg; o.beginPath(); o.arc(x, y, pl[1], 0, Math.PI * 2); o.fill();
        if (p.planet === 'saturn') { o.strokeStyle = 'rgba(240,220,160,0.85)'; o.lineWidth = 1.4; o.beginPath(); o.ellipse(x, y, pl[1] * 1.9, pl[1] * 0.55, -0.35, 0, Math.PI * 2); o.stroke(); }
        if (p.planet === 'jupiter') { o.strokeStyle = 'rgba(150,90,50,0.6)'; o.lineWidth = 1; for (const dy of [-2.5, 1, 3.5]) { o.beginPath(); o.moveTo(x - pl[1] * 0.9, y + dy); o.lineTo(x + pl[1] * 0.9, y + dy); o.stroke(); } }
      } else { o.fillStyle = '#8fd4ff'; o.beginPath(); o.arc(x, y, 2.2, 0, Math.PI * 2); o.fill(); }
    }
    o.strokeStyle = '#8fd4ff'; o.lineWidth = 3; o.strokeRect(1.5, 1.5, W - 3, H - 3);
    return off;
  }

  // 날짜변경선을 넘는 구간은 두 조각으로 나눠 그린다
  _routeSegment(o, a, b) {
    let lonB = b.lon;
    if (lonB - a.lon > 180) lonB -= 360; else if (lonB - a.lon < -180) lonB += 360;
    const pts = [];
    for (let k = 0; k <= 24; k++) {
      const t = k / 24;
      // 살짝 휘어진 항적
      const bend = -(this.LON_MAX - this.LON_MIN) / 70;
      const lon = a.lon + (lonB - a.lon) * t, lat = a.lat + (b.lat - a.lat) * t + Math.sin(t * Math.PI) * bend;
      pts.push([lon, lat]);
    }
    const draw = (shift) => {
      o.beginPath();
      pts.forEach(([lon, lat], i) => { const [x, y] = this.xy(lon + shift, lat); if (i === 0) o.moveTo(x, y); else o.lineTo(x, y); });
      o.stroke();
    };
    draw(0);
    if (lonB > 180) draw(-360); else if (lonB < -180) draw(360);
  }

  // 랩 진행률(0~1)을 항로 위 경위도로
  routePos(frac) {
    const n = this.ports.length;
    const f = ((frac % 1) + 1) % 1;
    const i = Math.floor(f * n), t = f * n - i;
    const a = this.ports[i], b = this.ports[(i + 1) % n];
    let lonB = b.lon;
    if (lonB - a.lon > 180) lonB -= 360; else if (lonB - a.lon < -180) lonB += 360;
    let lon = a.lon + (lonB - a.lon) * t;
    if (lon > 180) lon -= 360; if (lon < -180) lon += 360;
    const bend = -(this.LON_MAX - this.LON_MIN) / 70;
    return [lon, a.lat + (b.lat - a.lat) * t + Math.sin(t * Math.PI) * bend];
  }

  // 매 프레임 호출: 현재 기항지 강조 + 배 위치
  draw(portIdx, frac, t) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.drawImage(this.base, 0, 0);
    // 지나온 항로 강조
    ctx.strokeStyle = 'rgba(200,40,20,0.9)'; ctx.lineWidth = 2.2;
    for (let i = 0; i < portIdx; i++) this._routeSegment(ctx, this.ports[i], this.ports[(i + 1) % this.ports.length]);
    // 현재 기항지
    const p = this.ports[portIdx]; const [px, py] = this.xy(p.lon, p.lat);
    ctx.strokeStyle = '#ffe08a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, 6 + Math.sin(t * 5) * 1.5, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#ff4d2e'; ctx.beginPath(); ctx.arc(px, py, 3.2, 0, Math.PI * 2); ctx.fill();
    // 배 마커
    const [lon, lat] = this.routePos(frac); const [sx, sy] = this.xy(lon, lat);
    ctx.fillStyle = '#1a1206'; ctx.beginPath(); ctx.moveTo(sx, sy - 5); ctx.lineTo(sx + 4, sy + 3); ctx.lineTo(sx - 4, sy + 3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.moveTo(sx, sy - 3.5); ctx.lineTo(sx + 2.5, sy + 2); ctx.lineTo(sx - 2.5, sy + 2); ctx.closePath(); ctx.fill();
  }
}
