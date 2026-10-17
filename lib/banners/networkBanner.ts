/**
 * V2 "MY NETWORK" banner: a holographic dotted globe (real land mass from the
 * world-atlas topojson) with orbit rings, drifting network nodes / HNTR marks
 * that react to the cursor, and a scanline sweep. Ported from the V2 prototype.
 */

type HoloCanvas = HTMLCanvasElement & { __holo?: boolean };

type Node = { x: number; dy: number; vx: number; vy: number; ph: number; logo: boolean; s: number; ox: number; oy: number };
type Orbit = { k: number; sp: number; ph: number; n: number };
type Star = { x: number; y: number; r: number; p: number };

type Topology = {
  transform?: { scale: [number, number]; translate: [number, number] };
  arcs: number[][][];
  objects: { land: { type: string; geometries?: Array<{ type: string; arcs: number[][] | number[][][] }>; arcs?: unknown } };
};

const LAND_URL = "/assets/v2/land-50m.json";
const LAND_CDN = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-50m.json";

export function initNetworkBanner(cv: HTMLCanvasElement | null): (() => void) | undefined {
  if (!cv) return undefined;
  const canvas = cv as HoloCanvas;
  if (canvas.__holo) return undefined;
  canvas.__holo = true;
  const maybeCtx = canvas.getContext("2d");
  if (!maybeCtx) return undefined;
  const ctx: CanvasRenderingContext2D = maybeCtx;

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const TILT = 0.58;
  const ca = Math.cos(TILT);
  const sa = Math.sin(TILT);
  let W = 0;
  let H = 0;
  let R = 0;
  let CX = 0;
  let CY = 0;
  let t = 0;
  let rot = 0.35;
  let LX: Float32Array | null = null;
  let LY: Float32Array = new Float32Array();
  let LZ: Float32Array = new Float32Array();
  let LC: Uint8Array = new Uint8Array();
  let LN = 0;
  let nodes: Node[] = [];
  let stars: Star[] = [];
  let orb: Orbit[] = [];
  let scan: HTMLCanvasElement | null = null;
  const M = { x: 0, y: 0, on: false, a: 0 };
  let raf = 0;
  let alive = true;
  const hero = canvas.parentElement;

  const onMove = (e: MouseEvent) => {
    const r = canvas.getBoundingClientRect();
    M.x = e.clientX - r.left;
    M.y = e.clientY - r.top;
    M.on = true;
  };
  const onLeave = () => {
    M.on = false;
  };
  hero?.addEventListener("mousemove", onMove);
  hero?.addEventListener("mouseleave", onLeave);

  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  const sprite = (sz: number, fn: (g: CanvasRenderingContext2D, s: number) => void) => {
    const c = document.createElement("canvas");
    c.width = c.height = sz;
    const g = c.getContext("2d");
    if (g) fn(g, sz);
    return c;
  };

  const dotSpr = sprite(64, (g, s) => {
    const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    r.addColorStop(0, "rgba(255,255,255,1)");
    r.addColorStop(0.12, "rgba(170,225,255,.95)");
    r.addColorStop(0.35, "rgba(60,160,255,.35)");
    r.addColorStop(1, "rgba(30,110,255,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, s, s);
  });

  let logoSpr: HTMLCanvasElement | null = null;
  const logo = new Image();
  logo.onload = () => {
    const m = sprite(64, (g, s) => {
      g.drawImage(logo, 8, 8, s - 16, s - 16);
      g.globalCompositeOperation = "source-in";
      g.fillStyle = "#bfe6ff";
      g.fillRect(0, 0, s, s);
    });
    logoSpr = sprite(128, (g, s) => {
      const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      r.addColorStop(0, "rgba(90,180,255,.55)");
      r.addColorStop(0.4, "rgba(40,130,255,.18)");
      r.addColorStop(1, "rgba(30,110,255,0)");
      g.fillStyle = r;
      g.fillRect(0, 0, s, s);
      g.filter = "blur(5px)";
      g.drawImage(m, 32, 32, 64, 64);
      g.filter = "none";
      g.drawImage(m, 36, 36, 56, 56);
    });
  };
  logo.src = "/assets/v2/hntr-logos/hntr-mark-white.png";

  function buildLand(mask: (x: number, y: number) => boolean, mw: number, mh: number) {
    const xs: number[] = [];
    const ys: number[] = [];
    const zs: number[] = [];
    const cs: number[] = [];
    const step = 0.42;
    for (let lat = -46; lat <= 80; lat += step) {
      const cl = Math.cos((lat * Math.PI) / 180);
      const ls = step / Math.max(cl, 0.25);
      const py = Math.round(((90 - lat) / 180) * (mh - 1));
      for (let lon = -180; lon < 180; lon += ls) {
        const px = Math.round(((lon + 180) / 360) * (mw - 1));
        if (!mask(px, py)) continue;
        const la = (lat * Math.PI) / 180;
        const lo = (lon * Math.PI) / 180;
        xs.push(Math.cos(la) * Math.sin(lo));
        ys.push(Math.sin(la));
        zs.push(Math.cos(la) * Math.cos(lo));
        cs.push(Math.random() < 0.07 ? (Math.random() < 0.5 ? 2 : 1) : 0);
      }
    }
    LN = xs.length;
    LX = new Float32Array(xs);
    LY = new Float32Array(ys);
    LZ = new Float32Array(zs);
    LC = new Uint8Array(cs);
  }

  void (async () => {
    const mw = 1440;
    const mh = 720;
    try {
      let topo: Topology;
      try {
        topo = await (await fetch(LAND_URL)).json();
      } catch {
        topo = await (await fetch(LAND_CDN)).json();
      }
      const tr = topo.transform;
      const arcs = topo.arcs.map((a) => {
        let x = 0;
        let y = 0;
        return a.map((p) => {
          x += p[0];
          y += p[1];
          return tr ? [x * tr.scale[0] + tr.translate[0], y * tr.scale[1] + tr.translate[1]] : p;
        });
      });
      const o = topo.objects.land;
      const gs = o.type === "GeometryCollection" ? o.geometries ?? [] : [o as unknown as { type: string; arcs: number[][] | number[][][] }];
      const m = document.createElement("canvas");
      m.width = mw;
      m.height = mh;
      const g = m.getContext("2d");
      if (!g) throw new Error("no ctx");
      g.beginPath();
      gs.forEach((gm) => {
        const polys = (gm.type === "Polygon" ? [gm.arcs] : gm.type === "MultiPolygon" ? gm.arcs : []) as number[][][];
        polys.forEach((poly) => {
          poly.forEach((ids) => {
            let first = true;
            ids.forEach((i) => {
              const a = i >= 0 ? arcs[i] : arcs[~i].slice().reverse();
              a.forEach((q) => {
                const X = ((q[0] + 180) / 360) * mw;
                const Y = ((90 - q[1]) / 180) * mh;
                if (first) {
                  g.moveTo(X, Y);
                  first = false;
                } else g.lineTo(X, Y);
              });
            });
            g.closePath();
          });
        });
      });
      g.fillStyle = "#fff";
      g.fill("evenodd");
      const d = g.getImageData(0, 0, mw, mh).data;
      if (alive) buildLand((x, y) => d[(y * mw + x) * 4] > 128, mw, mh);
    } catch {
      if (alive)
        buildLand(
          (x, y) => {
            const u = (x / mw) * 12;
            const v = (y / mh) * 6;
            return Math.sin(u) * Math.cos(v * 1.3) + Math.sin(u * 2.3 + v) * 0.5 > 0.45;
          },
          mw,
          mh,
        );
    }
  })();

  const limbY = (x: number) => {
    const dx = x - CX;
    return Math.abs(dx) >= R ? 1e9 : CY - Math.sqrt(R * R - dx * dx);
  };

  function init() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return false;
    if (w === W && h === H) return true;
    W = w;
    H = h;
    canvas.width = Math.round(w * DPR);
    canvas.height = Math.round(h * DPR);
    R = Math.max(W * 0.78, H * 1.7);
    CX = W * 0.6;
    CY = H * 0.3 + R;
    const n = Math.max(30, Math.min(84, Math.round(W / 16)));
    nodes = [];
    for (let i = 0; i < n; i++) {
      const sky = Math.random() < 0.3;
      nodes.push({
        x: rnd(-20, W + 20),
        dy: sky ? -rnd(8, H * 0.28) : rnd(8, H * 0.95),
        vx: -rnd(0.14, 0.46),
        vy: rnd(-0.04, 0.04),
        ph: rnd(0, 6.28),
        logo: Math.random() < 0.28,
        s: sky ? rnd(0.55, 0.85) : rnd(0.75, 1.2),
        ox: 0,
        oy: 0,
      });
    }
    orb = [];
    for (let k = 0; k < 3; k++) orb.push({ k: 1.04 + k * 0.05, sp: (k % 2 ? -1 : 1) * rnd(0.05, 0.09), ph: rnd(0, 6.28), n: 6 + k * 3 });
    stars = [];
    for (let k = 0; k < Math.round((W * H) / 2200); k++) stars.push({ x: rnd(0, W), y: rnd(0, H * 0.6), r: rnd(0.3, 1.1), p: rnd(0, 6.28) });
    scan = sprite(4, (g) => {
      g.fillStyle = "rgba(140,200,255,.05)";
      g.fillRect(0, 0, 4, 1);
    });
    return true;
  }

  const bx: number[][] = [[], [], [], []];
  const by: number[][] = [[], [], [], []];
  const cx2: number[] = [];
  const cy2: number[] = [];
  const ct2: number[] = [];

  function frame() {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (canvas.offsetParent === null) return;
    if (!init()) return;
    t += 1 / 60;
    rot += 0.0009;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#01040d");
    bg.addColorStop(1, "#030b22");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    for (const st of stars) {
      const a = 0.25 + 0.35 * Math.sin(t * 1.4 + st.p);
      if (st.y > limbY(st.x) - 4) continue;
      ctx.globalAlpha = a;
      ctx.fillStyle = "#cfe4ff";
      ctx.fillRect(st.x, st.y, st.r, st.r);
    }
    ctx.globalAlpha = 1;

    const ag = ctx.createRadialGradient(CX, CY, R * 0.96, CX, CY, R * 1.12);
    ag.addColorStop(0, "rgba(40,140,255,.0)");
    ag.addColorStop(0.25, "rgba(60,160,255,.42)");
    ag.addColorStop(0.45, "rgba(30,110,255,.16)");
    ag.addColorStop(1, "rgba(10,40,120,0)");
    ctx.fillStyle = ag;
    ctx.beginPath();
    ctx.arc(CX, CY, R * 1.12, 0, 6.2832);
    ctx.fill();
    const og = ctx.createRadialGradient(CX, CY - R * 0.2, R * 0.5, CX, CY, R);
    og.addColorStop(0, "#04153d");
    og.addColorStop(0.85, "#06214f");
    og.addColorStop(1, "#0b3a86");
    ctx.fillStyle = og;
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, 6.2832);
    ctx.fill();

    if (LX) {
      const cr = Math.cos(rot);
      const sr = Math.sin(rot);
      for (let b = 0; b < 4; b++) {
        bx[b].length = 0;
        by[b].length = 0;
      }
      cx2.length = 0;
      cy2.length = 0;
      ct2.length = 0;
      for (let i = 0; i < LN; i++) {
        const x = LX[i];
        const y = LY[i];
        const z = LZ[i];
        const x1 = x * cr + z * sr;
        const z1 = -x * sr + z * cr;
        const y2 = y * ca + z1 * sa;
        const z2 = z1 * ca - y * sa;
        if (z2 < 0.01) continue;
        const sx = CX + x1 * R;
        const sy = CY - y2 * R;
        if (sx < -3 || sx > W + 3 || sy < -3 || sy > H + 3) continue;
        if (LC[i]) {
          cx2.push(sx);
          cy2.push(sy);
          ct2.push(LC[i] * 7 + i);
          continue;
        }
        const bk = z2 > 0.55 ? 3 : z2 > 0.3 ? 2 : z2 > 0.12 ? 1 : 0;
        bx[bk].push(sx);
        by[bk].push(sy);
      }
      const al = [0.22, 0.4, 0.6, 0.8];
      const ds = Math.max(1.3, R / 560);
      for (let b = 0; b < 4; b++) {
        ctx.fillStyle = `rgba(70,150,255,${al[b]})`;
        ctx.beginPath();
        const X = bx[b];
        const Y = by[b];
        for (let j = 0; j < X.length; j++) ctx.rect(X[j] - ds / 2, Y[j] - ds / 2, ds, ds);
        ctx.fill();
      }
      for (let j = 0; j < cx2.length; j++) {
        const tw = 0.55 + 0.45 * Math.sin(t * 2 + ct2[j]);
        ctx.fillStyle = ct2[j] % 2 ? `rgba(255,226,170,${0.55 * tw + 0.3})` : `rgba(200,235,255,${0.5 * tw + 0.3})`;
        ctx.fillRect(cx2[j] - ds * 0.6, cy2[j] - ds * 0.6, ds * 1.2, ds * 1.2);
      }
    }

    ctx.save();
    ctx.shadowColor = "rgba(110,190,255,.9)";
    ctx.shadowBlur = 14;
    ctx.strokeStyle = "rgba(150,210,255,.75)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(CX, CY, R, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.setLineDash([2, 6]);
    for (let k = 0; k < orb.length; k++) {
      const o = orb[k];
      const rr = R * o.k;
      ctx.lineDashOffset = -t * 20 * (o.sp > 0 ? 1 : -1);
      ctx.strokeStyle = `rgba(120,190,255,${0.28 - k * 0.06})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(CX, CY, rr, Math.PI, Math.PI * 2);
      ctx.stroke();
      for (let j = 0; j < o.n; j++) {
        const an = Math.PI * 1.5 + Math.sin(o.ph + j * (6.2832 / o.n) + t * o.sp) * 0.9 + (j / o.n - 0.5) * 0.4;
        const ex = CX + Math.cos(an) * rr;
        const ey = CY + Math.sin(an) * rr;
        if (ey > H + 20 || ex < -20 || ex > W + 20) continue;
        if (j % 4 === 0 && logoSpr) {
          ctx.globalAlpha = 0.75;
          ctx.drawImage(logoSpr, ex - 16, ey - 16, 32, 32);
        } else {
          ctx.globalAlpha = 0.8;
          ctx.drawImage(dotSpr, ex - 6, ey - 6, 12, 12);
        }
      }
    }
    ctx.restore();
    ctx.globalAlpha = 1;
    M.a += ((M.on ? 1 : 0) - M.a) * 0.08;

    const D = Math.max(80, Math.min(180, W * 0.14));
    const Rc = Math.max(140, Math.min(240, W * 0.2));
    const P: { x: number; y: number; n: Node }[] = [];
    for (const n of nodes) {
      n.x += n.vx;
      n.dy += n.vy + Math.sin(t * 0.7 + n.ph) * 0.04;
      if (n.dy < -H * 0.3) {
        n.dy = -H * 0.3;
        n.vy = Math.abs(n.vy);
      }
      if (n.dy > H) {
        n.dy = H;
        n.vy = -Math.abs(n.vy);
      }
      if (n.x < -40) {
        n.x = W + 40;
        n.ox = n.oy = 0;
      }
      let ly = limbY(n.x);
      if (ly > 1e8) ly = H * 2;
      const bxp = n.x;
      const byp = ly + n.dy;
      let tx = 0;
      let ty = 0;
      if (M.on) {
        const mx = M.x - bxp;
        const my = M.y - byp;
        const md = Math.sqrt(mx * mx + my * my);
        if (md < Rc) {
          const f = 1 - md / Rc;
          tx = mx * f * 0.45;
          ty = my * f * 0.45;
          if (md < 40) {
            tx -= mx * 0.6;
            ty -= my * 0.6;
          }
        }
      }
      n.ox += (tx - n.ox) * 0.07;
      n.oy += (ty - n.oy) * 0.07;
      P.push({ x: bxp + n.ox, y: byp + n.oy, n });
    }
    ctx.lineWidth = 0.8;
    for (let i = 0; i < P.length; i++)
      for (let j = i + 1; j < P.length; j++) {
        const a = P[i];
        const c = P[j];
        const dx = a.x - c.x;
        const dy = a.y - c.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > D) continue;
        const f = 1 - d / D;
        ctx.strokeStyle = `rgba(170,215,255,${(f * 0.6).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();
        if ((i + j) % 3 === 0) {
          const q = (t * 0.35 + i * 0.13 + j * 0.07) % 1;
          ctx.globalAlpha = f;
          ctx.drawImage(dotSpr, a.x + (c.x - a.x) * q - 5, a.y + (c.y - a.y) * q - 5, 10, 10);
          ctx.globalAlpha = 1;
        }
      }
    if (M.a > 0.02) {
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        const dx = p.x - M.x;
        const dy = p.y - M.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > Rc) continue;
        const f = (1 - d / Rc) * M.a;
        ctx.strokeStyle = `rgba(150,215,255,${(f * 0.8).toFixed(3)})`;
        ctx.lineWidth = 0.6 + f;
        ctx.beginPath();
        ctx.moveTo(M.x, M.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        const q = (t * 0.9 + i * 0.17) % 1;
        ctx.globalAlpha = f;
        ctx.drawImage(dotSpr, M.x + (p.x - M.x) * q - 4, M.y + (p.y - M.y) * q - 4, 8, 8);
        ctx.globalAlpha = 1;
      }
      const cg = ctx.createRadialGradient(M.x, M.y, 0, M.x, M.y, 90);
      cg.addColorStop(0, `rgba(90,180,255,${0.28 * M.a})`);
      cg.addColorStop(1, "rgba(40,120,255,0)");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(M.x, M.y, 90, 0, 6.2832);
      ctx.fill();
      if (logoSpr) {
        ctx.globalAlpha = 0.9 * M.a;
        ctx.drawImage(logoSpr, M.x - 20, M.y - 20, 40, 40);
        ctx.globalAlpha = 1;
      }
    }
    for (const p of P) {
      const n = p.n;
      const pu = 0.5 + 0.5 * Math.sin(t * 2.2 + n.ph);
      if (p.y > H + 30 || p.x < -30 || p.x > W + 30) continue;
      if (n.logo && logoSpr) {
        const s = (30 + pu * 4) * n.s;
        ctx.globalAlpha = 0.85 + 0.15 * pu;
        ctx.drawImage(logoSpr, p.x - s, p.y - s, s * 2, s * 2);
      } else {
        const s = (9 + pu * 5) * n.s;
        ctx.globalAlpha = 0.9;
        ctx.drawImage(dotSpr, p.x - s, p.y - s, s * 2, s * 2);
        ctx.globalAlpha = (1 - pu) * 0.5;
        ctx.strokeStyle = "#8fd0ff";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4 + pu * 12 * n.s, 0, 6.2832);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    if (scan) {
      const pat = ctx.createPattern(scan, "repeat");
      if (pat) {
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, W, H);
      }
    }
    const sy = (((t * 0.18) % 1.3) - 0.15) * H;
    const sg = ctx.createLinearGradient(0, sy - 40, 0, sy + 40);
    sg.addColorStop(0, "rgba(120,200,255,0)");
    sg.addColorStop(0.5, "rgba(120,200,255,.07)");
    sg.addColorStop(1, "rgba(120,200,255,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(0, sy - 40, W, 80);
    if (Math.random() < 0.015) {
      ctx.fillStyle = "rgba(150,210,255,.035)";
      ctx.fillRect(0, 0, W, H);
    }
  }

  raf = requestAnimationFrame(frame);

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    hero?.removeEventListener("mousemove", onMove);
    hero?.removeEventListener("mouseleave", onLeave);
    delete canvas.__holo;
  };
}
