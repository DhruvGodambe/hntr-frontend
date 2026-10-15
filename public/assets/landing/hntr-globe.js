class HntrGlobe extends HTMLElement {
  connectedCallback() {
    if (this._c) return;
    this.style.cssText += ';display:block;position:absolute;inset:0;width:100%;height:100%';
    const c = this._c = document.createElement('canvas');
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    this.appendChild(c);
    this.ctx = c.getContext('2d');
    this.rot = 2.2; this.t = 0; this.visible = true;
    const N = 11000, ga = Math.PI * (3 - Math.sqrt(5));
    this.pts = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i;
      const x = Math.cos(th) * r, z = Math.sin(th) * r;
      this.pts.push({ x, y, z, lat: Math.asin(y) * 180 / Math.PI, lon: Math.atan2(x, z) * 180 / Math.PI, land: false });
    }
    this.arcs = [];
    this.loadLand();
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(this); this.resize();
    this.io = new IntersectionObserver(e => { this.visible = e[0].isIntersecting; }); this.io.observe(this);
    const loop = () => { this.raf = requestAnimationFrame(loop); if (this.visible) this.draw(); };
    loop();
  }
  disconnectedCallback() { cancelAnimationFrame(this.raf); this.ro && this.ro.disconnect(); this.io && this.io.disconnect(); }
  resize() {
    const d = Math.min(devicePixelRatio || 1, 2), b = this.getBoundingClientRect();
    this.w = b.width; this.h = b.height; this.dpr = d;
    this._c.width = Math.max(1, b.width * d); this._c.height = Math.max(1, b.height * d);
  }
  async loadLand() {
    try {
      const topo = window.__LAND110 || await (await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json')).json();
      const t = topo.transform;
      const arcs = topo.arcs.map(a => { let x = 0, y = 0; return a.map(p => { x += p[0]; y += p[1]; return t ? [x * t.scale[0] + t.translate[0], y * t.scale[1] + t.translate[1]] : p; }); });
      let o = topo.objects.land, geoms = o.type === 'GeometryCollection' ? o.geometries : [o];
      const rings = [];
      const ring = ids => { let out = []; ids.forEach((i, k) => { let a = i >= 0 ? arcs[i] : arcs[~i].slice().reverse(); out = out.concat(k ? a.slice(1) : a); }); return out; };
      geoms.forEach(g => { const polys = g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : []; polys.forEach(p => p.forEach(r => rings.push(ring(r)))); });
      const rb = rings.map(r => { let a = 1e9, b = -1e9, c = 1e9, d = -1e9; r.forEach(p => { a = Math.min(a, p[0]); b = Math.max(b, p[0]); c = Math.min(c, p[1]); d = Math.max(d, p[1]); }); return [a, b, c, d]; });
      const inside = (lon, lat) => {
        let ins = false;
        for (let k = 0; k < rings.length; k++) {
          const bb = rb[k]; if (lon < bb[0] || lon > bb[1] || lat < bb[2] || lat > bb[3]) continue;
          const r = rings[k];
          for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
            const xi = r[i][0], yi = r[i][1], xj = r[j][0], yj = r[j][1];
            if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) ins = !ins;
          }
        }
        return ins;
      };
      this.pts.forEach(p => { p.land = inside(p.lon, p.lat); });
    } catch (e) { this.pts.forEach(p => { p.land = Math.random() < 0.3; }); }
    const land = this.pts.filter(p => p.land);
    for (let i = 0; i < 14; i++) {
      const a = land[(Math.random() * land.length) | 0], b = land[(Math.random() * land.length) | 0];
      if (a && b) this.arcs.push({ a, b, off: Math.random(), sp: 0.12 + Math.random() * 0.12 });
    }
    this.cities = land.filter(() => Math.random() < 0.012);
  }
  proj(x, y, z, R, cx, cy) {
    const cr = Math.cos(this.rot), sr = Math.sin(this.rot), tl = -0.38, ct = Math.cos(tl), st = Math.sin(tl);
    const x1 = x * cr - z * sr, z1 = x * sr + z * cr;
    const y2 = y * ct - z1 * st, z2 = y * st + z1 * ct;
    return [cx + x1 * R, cy - y2 * R, z2];
  }
  draw() {
    const g = this.ctx, d = this.dpr, W = this.w * d, H = this.h * d;
    if (!W || !H) return;
    this.t += 1 / 60; this.rot += 0.0016;
    g.clearRect(0, 0, W, H);
    const R = Math.min(W, H) * 0.36, cx = W * 0.5, cy = H * 0.5;
    let gr = g.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.35);
    gr.addColorStop(0, 'rgba(20,140,200,.18)'); gr.addColorStop(0.75, 'rgba(30,180,255,.10)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R * 1.35, 0, 7); g.fill();
    g.save(); g.lineDashOffset = -this.t * 20 * d;
    [[1.55, .3, -.32, .35], [1.8, .42, .18, .18]].forEach(([rx, ry, a, al], k) => {
      g.setLineDash([1.5 * d, 4 * d]); g.strokeStyle = `rgba(90,220,255,${al})`; g.lineWidth = 1.6 * d;
      g.beginPath(); g.ellipse(cx, cy, R * rx, R * ry, a, k ? Math.PI : 0, k ? Math.PI * 2 : Math.PI); g.stroke();
    });
    g.restore();
    const sz = 1.7 * d;
    for (const p of this.pts) {
      const [sx, sy, z] = this.proj(p.x, p.y, p.z, R, cx, cy);
      if (p.land) {
        if (z < 0) { g.globalAlpha = 0.07; g.fillStyle = '#4fd8ff'; }
        else { g.globalAlpha = 0.35 + 0.65 * z; g.fillStyle = z > 0.55 ? '#bff4ff' : '#4fd8ff'; }
        g.fillRect(sx - sz / 2, sy - sz / 2, sz, sz);
      } else if (z > 0) {
        g.globalAlpha = 0.06 + 0.08 * z; g.fillStyle = '#2aa8e0'; g.fillRect(sx - sz / 3, sy - sz / 3, sz * 0.66, sz * 0.66);
      }
    }
    g.globalAlpha = 1;
    if (this.cities) for (const p of this.cities) {
      const [sx, sy, z] = this.proj(p.x, p.y, p.z, R, cx, cy); if (z < 0.1) continue;
      const pulse = 0.5 + 0.5 * Math.sin(this.t * 3 + p.lon);
      g.fillStyle = `rgba(220,250,255,${0.5 + 0.5 * pulse})`; g.beginPath(); g.arc(sx, sy, (1.4 + pulse) * d, 0, 7); g.fill();
    }
    g.lineWidth = 1.4 * d; g.lineCap = 'round';
    for (const a of this.arcs) {
      const prog = (this.t * a.sp + a.off) % 1.4, dot = a.a.x * a.b.x + a.a.y * a.b.y + a.a.z * a.b.z, om = Math.acos(Math.max(-1, Math.min(1, dot)));
      if (om < 0.2) continue;
      const so = Math.sin(om), S = 40, head = Math.min(prog, 1), tail = Math.max(0, prog - 0.4);
      let prev = null;
      for (let i = 0; i <= S; i++) {
        const f = tail + (head - tail) * i / S, k1 = Math.sin((1 - f) * om) / so, k2 = Math.sin(f * om) / so, h = 1 + 0.22 * om / Math.PI * 2 * Math.sin(Math.PI * f);
        const q = this.proj((a.a.x * k1 + a.b.x * k2) * h, (a.a.y * k1 + a.b.y * k2) * h, (a.a.z * k1 + a.b.z * k2) * h, R, cx, cy);
        if (prev && q[2] > -0.15 && prev[2] > -0.15) { g.strokeStyle = `rgba(140,240,255,${0.15 + 0.75 * i / S})`; g.beginPath(); g.moveTo(prev[0], prev[1]); g.lineTo(q[0], q[1]); g.stroke(); }
        prev = q;
      }
    }
    g.strokeStyle = 'rgba(100,225,255,.45)'; g.lineWidth = 1.2 * d; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();
    g.setLineDash([1 * d, 3 * d]); g.strokeStyle = 'rgba(100,225,255,.22)'; g.beginPath(); g.arc(cx, cy, R * 1.1, 0, 7); g.stroke(); g.setLineDash([]);
    gr = g.createLinearGradient(0, cy - R, 0, cy + R);
    const sy = cy - R + ((this.t * 0.25) % 1) * 2 * R;
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.clip();
    const sg = g.createLinearGradient(0, sy - 30 * d, 0, sy + 30 * d);
    sg.addColorStop(0, 'rgba(120,240,255,0)'); sg.addColorStop(.5, 'rgba(120,240,255,.12)'); sg.addColorStop(1, 'rgba(120,240,255,0)');
    g.fillStyle = sg; g.fillRect(cx - R, sy - 30 * d, 2 * R, 60 * d); g.restore();
  }
}
if (!customElements.get('hntr-globe')) customElements.define('hntr-globe', HntrGlobe);
