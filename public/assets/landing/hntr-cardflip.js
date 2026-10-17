function __asset(p){var e=document.querySelector('img[data-asset="'+p+'"]');return e?e.src:p}
// <hntr-cardflip> — hologram NFT card: dotted container, real image + text. Fade in → Buy → press → double flip (10→11 ETH) → slide right → Sell + confetti. Loop 13s.
const CF_T = { fadeIn: [0, 0.55], buyIn: [0.9, 1.25], press: [1.7, 1.95], buyOut: [2.05, 2.3], flip: [2.35, 4.75], slide: [2.35, 4.75], sellIn: [4.85, 5.15], confetti: 4.9, fadeOut: [7.6, 8.05], loop: 8.4 };
const cfE = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const cfP = (t, [a, b]) => Math.max(0, Math.min(1, (t - a) / (b - a)));
class HntrCardflip extends HTMLElement {
  connectedCallback() {
    if (this._c) return;
    this.style.cssText += ';display:block;position:absolute;inset:0;width:100%;height:100%';
    const c = this._c = document.createElement('canvas');
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    this.appendChild(c);
    this.g = c.getContext('2d');
    this.l1 = document.createElement('canvas'); this.l2 = document.createElement('canvas');
    this.t0 = performance.now(); this.visible = true;
    this.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.cards = [
      { src: __asset('about/card-art-bayc.avif'), name: 'Bored Ape Yacht Club', id: '#9452', buy: '20', sold: '22', profit: '2' },
      { src: __asset('about/card-art-punk.avif'), name: 'CryptoPunks', id: '#8498', buy: '100', sold: '110', profit: '10', pixel: true },
      { src: __asset('about/card-art-pudgy.avif'), name: 'Pudgy Penguins', id: '#4390', buy: '15', sold: '16.5', profit: '1.5' },
      { src: __asset('about/card-art-mayc.avif'), name: 'Mutant Ape Yacht Club', id: '#28271', buy: '4', sold: '4.4', profit: '0.4' }
    ];
    this.cards.forEach((c, i) => { c.img = new Image(); if (!i) c.img.onload = () => this.layout(); c.img.src = c.src; });
    this.img = this.cards[0].img;
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(this);
    this.io = new IntersectionObserver(e => { const v = e[0].isIntersecting; if (v && !this.visible) this.t0 = performance.now(); this.visible = v; }); this.io.observe(this);
    const loop = () => { this.raf = requestAnimationFrame(loop); if (this.visible && this.ready) this.draw(); };
    loop();
  }
  disconnectedCallback() { cancelAnimationFrame(this.raf); this.ro.disconnect(); this.io.disconnect(); }
  resize() {
    const b = this.getBoundingClientRect(), d = this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.w = b.width; this.h = b.height;
    [this._c, this.l1, this.l2].forEach(c => { c.width = Math.max(1, b.width * d); c.height = Math.max(1, b.height * d); });
    this.layout();
  }
  dot(x, y, r, c, a) { return { x, y, r, c, a, s: Math.random(), dx: Math.random() - .5, dy: Math.random() - .5 }; }
  layout() {
    if (!this.w || !this.img.complete || !this.img.naturalWidth) return;
    const d = this.dpr, H = this.h * d, W = this.w * d;
    const ch = this.w <= 720 ? Math.min(H * 0.86, W * 1.05) : Math.min(H * 0.5, W * 0.5);
    const cw = ch / 1.32, pad = cw * 0.06, img = cw - pad * 2;
    Object.assign(this, { cw, ch, pad, imgS: img });
    const top = -ch / 2, left = -cw / 2, step = cw / 54, cyan = [138, 255, 228], rr = cw * 0.05;
    const card = [];
    const ring = (inset, pitch, r, a) => {
      const w = cw - inset * 2, h = ch - inset * 2, l = left + inset, t = top + inset, per = 2 * (w + h), n = Math.round(per / pitch), rad = Math.max(0, rr - inset);
      for (let k = 0; k < n; k++) {
        let u = k / n * per, x, y;
        if (u < w) { x = l + u; y = t; } else if ((u -= w) < h) { x = l + w; y = t + u; } else if ((u -= h) < w) { x = l + w - u; y = t + h; } else { u -= w; x = l; y = t + h - u; }
        const cx = Math.max(l + rad, Math.min(l + w - rad, x)), cy = Math.max(t + rad, Math.min(t + h - rad, y)), vx = x - cx, vy = y - cy, vl = Math.hypot(vx, vy);
        if (vl > rad) { x = cx + vx / vl * rad; y = cy + vy / vl * rad; }
        card.push(this.dot(x, y, r, cyan, a));
      }
    };
    ring(0, step * 0.9, step * 0.28, 0.95);
    ring(step * 1.2, step * 1.6, step * 0.16, 0.35);
    // dotted frame around the image + divider
    const it = top + pad, il = left + pad;
    for (let k = 0; k <= img / step; k++) {
      const u = k * step;
      card.push(this.dot(il + u, it - step * 0.6, step * 0.14, cyan, 0.4), this.dot(il + u, it + img + step * 0.6, step * 0.14, cyan, 0.4));
      card.push(this.dot(il - step * 0.6, it + u, step * 0.14, cyan, 0.4), this.dot(il + img + step * 0.6, it + u, step * 0.14, cyan, 0.4));
    }
    const dy = it + img + cw * 0.215;
    for (let x = il; x < il + img; x += step * 0.8) card.push(this.dot(x, dy, step * 0.12, cyan, 0.3));
    // interior dot field (faint)
    for (let y = it + img + step * 2; y < top + ch - step * 2; y += step * 1.4) for (let x = il; x < il + img; x += step * 1.4) if (Math.random() < 0.35) card.push(this.dot(x, y, step * 0.1, cyan, 0.12));
    this.card = card;
    const btn = col => {
      const bw = cw * 0.46, bh = cw * 0.15, out = [], bs = step * 0.7;
      for (let y = -bh / 2; y <= bh / 2 + 0.01; y += bs) for (let x = -bw / 2; x <= bw / 2 + 0.01; x += bs) {
        const edge = Math.abs(y) > bh / 2 - bs || Math.abs(x) > bw / 2 - bs;
        out.push(this.dot(x, y, bs * (edge ? 0.34 : 0.24), col, edge ? 1 : 0.38));
      }
      return out;
    };
    this.buy = btn(cyan); this.sell = btn([70, 230, 120]);
    this.ready = true;
  }
  pos() { const W = this.w * this.dpr, H = this.h * this.dpr, wide = this.w > 900; const mob = this.w <= 720; return { y: H * (mob ? 0.5 : 0.4), cx: W * (wide ? 0.66 : 0.5), rx: W * (wide ? 0.84 : mob ? 0.5 : 0.72) }; }
  put(g, arr, alpha, ox, oy, sx, sy, spread, now) {
    if (alpha <= 0.004) return;
    for (const p of arr) {
      const sh = 0.78 + 0.22 * Math.sin(now * 2.2 + p.s * 40);
      const x = ox + (p.x + p.dx * spread * this.cw * 1.1) * sx, y = oy + (p.y + p.dy * spread * this.cw * 1.1) * sy;
      g.globalAlpha = Math.min(1, p.a * alpha * sh);
      g.fillStyle = `rgb(${p.c[0]},${p.c[1]},${p.c[2]})`;
      const r = p.r * (0.6 + 0.4 * Math.abs(sx));
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }
  bloom(m, src, W, H) {
    const d = this.dpr;
    if (this.light) {
      m.globalCompositeOperation = 'source-over';
      m.filter = `invert(1) hue-rotate(180deg) blur(${5 * d}px)`; m.globalAlpha = 0.25; m.drawImage(src, 0, 0);
      m.filter = 'invert(1) hue-rotate(180deg)'; m.globalAlpha = 1; m.drawImage(src, 0, 0);
      m.filter = 'none'; return;
    }
    m.globalCompositeOperation = 'lighter';
    m.filter = `blur(${7 * d}px)`; m.globalAlpha = 0.9; m.drawImage(src, 0, 0);
    m.filter = 'none'; m.globalAlpha = 1; m.drawImage(src, 0, 0);
    m.globalCompositeOperation = 'source-over';
  }
  edgePt(u) {
    const w = this.cw, h = this.ch, per = 2 * (w + h); let s = ((u % 1) + 1) % 1 * per;
    if (s < w) return [-w / 2 + s, -h / 2]; s -= w; if (s < h) return [w / 2, -h / 2 + s]; s -= h; if (s < w) return [w / 2 - s, h / 2]; s -= w; return [-w / 2, h / 2 - s];
  }
  comet(g, cx, cy, sx, p, a, d) {
    const len = 0.16, n = 40;
    g.lineWidth = 1.4 * d; g.lineCap = 'round';
    for (const base of [0.125, 0.625]) {
      const head = base + p * 0.5;
      for (let i = 0; i < n; i++) {
        const u1 = head - len * i / n, u2 = head - len * (i + 1) / n, [x1, y1] = this.edgePt(u1), [x2, y2] = this.edgePt(u2);
        g.globalAlpha = a * (1 - i / n) * 0.9; g.strokeStyle = 'rgb(200,255,248)';
        g.beginPath(); g.moveTo(cx + x1 * sx, cy + y1); g.lineTo(cx + x2 * sx, cy + y2); g.stroke();
      }
    }
  }
  bolt(g, cx, cy, sx, zap, d) {
    const u = Math.random(), len = 0.04 + Math.random() * 0.12, segs = 10, amp = this.cw * 0.035 * (0.5 + zap);
    g.beginPath();
    for (let i = 0; i <= segs; i++) {
      const [x, y] = this.edgePt(u + len * i / segs), off = i && i < segs ? (Math.random() - 0.5) * amp * 2 : 0;
      const nx = Math.abs(x) >= this.cw / 2 - 0.5 ? Math.sign(x) : 0, ny = nx ? 0 : Math.sign(y);
      const px = cx + (x + (nx ? off : (Math.random() - 0.5) * amp * 0.4)) * sx, py = cy + y + (ny ? off : (Math.random() - 0.5) * amp * 0.4);
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.globalAlpha = Math.min(1, 0.5 + zap); g.strokeStyle = Math.random() < 0.5 ? 'rgb(200,255,250)' : 'rgb(138,255,228)'; g.lineWidth = (0.8 + Math.random() * 1.2) * d; g.lineJoin = 'miter'; g.stroke();
  }
  eth(m, x, y, h) {
    const w = h * 0.6;
    m.fillStyle = '#ffffff';
    m.beginPath(); m.moveTo(x, y - h / 2); m.lineTo(x + w / 2, y + h * 0.04); m.lineTo(x, y + h * 0.2); m.lineTo(x - w / 2, y + h * 0.04); m.closePath(); m.fill();
    m.beginPath(); m.moveTo(x - w / 2, y + h * 0.14); m.lineTo(x, y + h * 0.3); m.lineTo(x + w / 2, y + h * 0.14); m.lineTo(x, y + h / 2); m.closePath(); m.fill();
    return w;
  }
  price(m, x, y, parts, measure) {
    const x0 = x; m.textAlign = 'left'; m.textBaseline = 'middle';
    for (const p of parts) {
      if (p.gap) { x += p.gap; continue; }
      if (p.eth) { const h = p.z * 1.15, sp = p.z * 0.18; x += sp; if (!measure) this.eth(m, x + h * 0.3, y, h); x += h * 0.6; continue; }
      m.font = `${p.f} ${p.z}px 'Space Grotesk',sans-serif`; if (!measure) { m.fillStyle = p.c; m.fillText(p.s, x, y); } x += m.measureText(p.s).width;
    }
    return x - x0;
  }
  label(m, str, px, x, y, color, alpha, sx, sy, cx, cy) {
    m.save(); m.globalAlpha = alpha; m.translate(cx, cy); m.scale(sx, sy);
    m.font = `700 ${px}px 'Space Grotesk',sans-serif`; m.textAlign = 'center'; m.textBaseline = 'middle'; m.fillStyle = color;
    m.fillText(str, x, y); m.restore();
  }
  draw() {
    const d = this.dpr, W = this.w * d, H = this.h * d, m = this.g;
    const L = this.light = document.documentElement.getAttribute('data-theme') === 'light';
    const t = this.reduce ? 7.0 : ((performance.now() - this.t0) / 1000 * 1.2) % CF_T.loop;
    const P = this.pos();
    const cyc = this.reduce ? 0 : Math.floor((performance.now() - this.t0) / 1000 * 1.2 / CF_T.loop), card = this.cards[cyc % this.cards.length];
    const fin = cfE(cfP(t, CF_T.fadeIn)), fout = cfE(cfP(t, CF_T.fadeOut));
    const trans = (fin < 1 && fin > 0) || (fout > 0 && fout < 1);
    const flick = 1;
    const vis = fin * (1 - fout) * flick, spread = 0;
    const jit = 0;
    const cfQ = x => x < .5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
    const fl = cfQ(cfP(t, CF_T.flip)), ang = fl * Math.PI * 4, cs = Math.cos(ang);
    const sl = cfQ(cfP(t, CF_T.slide)), cx = P.cx + (P.rx - P.cx) * sl + jit, cy = P.y;
    const shade = 0.35 + 0.65 * Math.abs(cs);
    // layer 1: dotted container
    const g1 = this.l1.getContext('2d'); g1.clearRect(0, 0, W, H); g1.globalCompositeOperation = 'lighter';
    this.put(g1, this.card, vis * shade, cx, cy, cs, 1, spread, t);
    m.clearRect(0, 0, W, H);
    this.bloom(m, this.l1, W, H);
    // real image + text
    const cv = cfP(t, [CF_T.fadeIn[0] + 0.15, CF_T.fadeIn[1]]) * (1 - cfP(t, [CF_T.fadeOut[0] - 0.05, CF_T.fadeOut[1] - 0.15])) * flick;
    if (cv > 0.002) {
      const { cw, ch, pad, imgS } = this, left = -cw / 2, top = -ch / 2;
      m.save(); m.translate(cx, cy); m.scale(cs, 1);
      m.globalAlpha = cv * (0.55 + 0.45 * Math.abs(cs));
      const rad = cw * 0.02;
      m.beginPath(); m.roundRect ? m.roundRect(left + pad, top + pad, imgS, imgS, rad) : m.rect(left + pad, top + pad, imgS, imgS); m.save(); m.clip();
      if (card.img.complete && card.img.naturalWidth) { m.imageSmoothingEnabled = !card.pixel; m.drawImage(card.img, left + pad, top + pad, imgS, imgS); m.imageSmoothingEnabled = true; }
      m.restore();
      const ty = top + pad + imgS, tx = left + pad;
      m.textAlign = 'left'; m.textBaseline = 'middle';
      m.font = `500 ${cw * 0.06}px 'Space Grotesk',sans-serif`; m.fillStyle = L ? '#55636b' : '#9fb3bf'; m.fillText(card.name, tx, ty + cw * 0.075);
      { const tw = m.measureText(card.name).width, r = cw * 0.026, bx = tx + tw + r + cw * 0.018, by = ty + cw * 0.075;
        m.fillStyle = '#2081e2'; m.beginPath(); m.arc(bx, by, r, 0, 7); m.fill();
        m.strokeStyle = '#fff'; m.lineWidth = r * 0.28; m.lineCap = 'round'; m.lineJoin = 'round';
        m.beginPath(); m.moveTo(bx - r * 0.45, by + r * 0.02); m.lineTo(bx - r * 0.1, by + r * 0.38); m.lineTo(bx + r * 0.48, by - r * 0.35); m.stroke(); }
      m.font = `700 ${cw * 0.085}px 'Space Grotesk',sans-serif`; m.fillStyle = L ? '#0b0c0f' : '#f2fdff'; m.fillText(card.id, tx, ty + cw * 0.16);
      const swapped = ang >= Math.PI * 2.5;
      const px = cw * 0.07, py = ty + cw * 0.285, G = L ? '#14943f' : '#46e678';
      const parts = swapped
        ? [{ s: card.sold + ' ETH', c: G, f: 700, z: px }]
        : [{ s: card.buy + ' ETH', c: L ? '#0b8a74' : '#8affe4', f: 700, z: px }];
      this.price(m, tx, py, parts);
      if (swapped) {
        const pp = [{ s: 'Profit: +' + card.profit + ' ETH', c: G, f: 600, z: px * 0.78 }];
        this.price(m, tx + imgS - this.price(m, 0, 0, pp, true), py, pp);
      }
      m.restore();
    }
    // layer 2: buttons, ripple, confetti
    const g2 = this.l2.getContext('2d'); g2.clearRect(0, 0, W, H); g2.globalCompositeOperation = 'lighter';
    const bIn = cfE(cfP(t, CF_T.buyIn)), bOut = cfE(cfP(t, CF_T.buyOut)), pr = cfP(t, CF_T.press);
    const press = 1 - 0.1 * Math.sin(pr * Math.PI);
    let buyA = 0, buyS = 1;
    if (bIn > 0 && bOut < 1) {
      buyS = (0.9 + 0.1 * bIn) * press * (1 + 0.15 * bOut); buyA = bIn * (1 - bOut);
      this.put(g2, this.buy, buyA * (1 + 0.6 * Math.sin(pr * Math.PI)), cx, cy, buyS, buyS, 0, t);
      const rp = cfP(t, [CF_T.press[0], CF_T.press[1] + 0.6]);
      if (rp > 0 && rp < 1) {
        g2.globalAlpha = 0.5 * (1 - rp); g2.strokeStyle = 'rgb(138,255,228)'; g2.lineWidth = 1.5 * d;
        g2.setLineDash([1.5 * d, 4 * d]); g2.beginPath(); g2.ellipse(cx, cy, this.cw * (0.25 + 0.4 * rp), this.cw * (0.1 + 0.25 * rp), 0, 0, 7); g2.stroke(); g2.setLineDash([]);
      }
    }
    const pulse = (a, b) => t > a && t < b ? 1 - (t - a) / (b - a) : 0;
    const trace = (a, b) => { if (t > a && t < b) { const p = cfE((t - a) / (b - a)); this.comet(g2, cx, cy, cs, p, Math.sin(p * Math.PI), d); } };
    trace(0, 0.9); trace(CF_T.flip[1] - 0.05, CF_T.flip[1] + 0.85);
    const sIn = cfE(cfP(t, CF_T.sellIn)), sellA = sIn * (1 - fout), sellS = 0.9 + 0.1 * sIn;
    if (sIn > 0) this.put(g2, this.sell, sellA, cx, cy, sellS, sellS, 0, t);
    const ct = t - CF_T.confetti;
    if (ct > 0 && ct < 1.8) {
      if (!this.conf || this.confT !== cyc) {
        this.confT = cyc;
        const cols = [[70, 230, 120], [138, 255, 228], [255, 255, 255], [170, 255, 190]];
        this.conf = Array.from({ length: 110 }, () => { const a = Math.random() * Math.PI * 2, v = (0.35 + Math.random() * 0.65) * this.cw * 0.9; return { vx: Math.cos(a) * v, vy: Math.sin(a) * v - this.cw * 0.25, c: cols[(Math.random() * 4) | 0], r: (1 + Math.random() * 1.6) * d }; });
      }
      const k = 1 - Math.exp(-ct * 2.6), grav = this.cw * 0.35 * ct * ct;
      for (const q of this.conf) { g2.globalAlpha = Math.max(0, 1 - ct / 1.8); g2.fillStyle = `rgb(${q.c})`; g2.fillRect(cx + q.vx * k - q.r, cy + q.vy * k + grav - q.r, q.r * 2, q.r * 2); }
    }
    // dark backing under buttons so labels read over the image
    const back = (a, s) => { if (a <= 0) return; const bw = this.cw * 0.46 * s, bh = this.cw * 0.15 * s; m.save(); m.globalAlpha = a * 0.72; m.fillStyle = '#000'; m.beginPath(); m.roundRect ? m.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, bh * 0.2) : m.rect(cx - bw / 2, cy - bh / 2, bw, bh); m.fill(); m.restore(); };
    back(buyA, buyS); back(sellA, sellS);
    this.bloom(m, this.l2, W, H);
    if (buyA > 0) this.label(m, 'Buy', this.cw * 0.075, 0, 0, '#ffffff', buyA, buyS, buyS, cx, cy);
    if (sellA > 0) this.label(m, 'Sold', this.cw * 0.075, 0, 0, '#ffffff', sellA, sellS, sellS, cx, cy);
  }
}
if (!customElements.get('hntr-cardflip')) customElements.define('hntr-cardflip', HntrCardflip);
