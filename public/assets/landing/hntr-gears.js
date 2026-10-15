(function () {
  if (customElements.get('hntr-gears')) return;
  var THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
  var R = Math.random, PI = Math.PI, TAU = PI * 2, cos = Math.cos, sin = Math.sin;
  var PITCH = 0.072;

  function circ(r, a0, a1, seg) { a0 = a0 || 0; a1 = a1 == null ? TAU : a1; seg = seg || Math.max(24, Math.round(r * 160)); var p = []; for (var i = 0; i <= seg; i++) { var a = a0 + (a1 - a0) * i / seg; p.push([r * cos(a), r * sin(a)]); } return p; }
  function teethPath(r, n, h) {
    var p = [], ro = r + h * 0.5, ri = r - h * 0.5;
    for (var k = 0; k < n; k++) {
      var a = TAU * k / n, s = TAU / n;
      [[ri, -0.5], [ri, -0.3], [ro, -0.17], [ro, 0.17], [ri, 0.3]].forEach(function (v) { var b = a + v[1] * s; p.push([v[0] * cos(b), v[0] * sin(b)]); });
    }
    p.push(p[0]); return p;
  }
  function spiral(r0, r1, turns) { var p = [], seg = Math.round(turns * 90); for (var i = 0; i <= seg; i++) { var t = i / seg, a = t * turns * TAU, r = r0 + (r1 - r0) * t; p.push([r * cos(a), r * sin(a)]); } return p; }

  function gear(g) {
    var L = [], r = g.r, h = Math.min(0.05, r * 0.16), rim = r - h * 0.5 - Math.max(0.045, r * 0.12);
    L.push([teethPath(r, g.n, h), 1]);
    if (g.spokes) {
      L.push([circ(rim), 0.8]);
      var hub = Math.max(0.05, r * 0.2), w = Math.max(0.018, r * 0.07);
      L.push([circ(hub), 0.9]); L.push([circ(hub * 0.45), 0.9]);
      for (var k = 0; k < g.spokes; k++) {
        var a = TAU * k / g.spokes + 0.3, ca = cos(a), sa = sin(a), nx = -sa * w, ny = ca * w;
        [-1, 1].forEach(function (sg) { L.push([[[ca * hub + nx * sg, sa * hub + ny * sg], [ca * rim + nx * sg, sa * rim + ny * sg]], 0.75]); });
      }
      if (g.inner) { L.push([circ(rim * 0.62), 0.45]); L.push([teethPath(rim * 0.42, Math.max(10, Math.round(g.n * 0.3)), 0.025), 0.6]); }
    } else {
      L.push([circ(r * 0.55), 0.8]); L.push([circ(r * 0.22), 0.9]);
    }
    return L;
  }

  function build(N) {
    var G = [
      { id: 0, c: [0, -0.2], r: 0.66, spokes: 5, inner: 1, w: 0.22 },
      { id: 1, p: 0, a: 2.35, r: 0.44, spokes: 6, inner: 1 },
      { id: 2, p: 0, a: 1.22, r: 0.15 },
      { id: 3, p: 0, a: -0.3, r: 0.32, spokes: 4 },
      { id: 4, p: 3, a: -1.25, r: 0.2, spokes: 0 },
      { id: 5, p: 1, a: 3.6, r: 0.11 },
      { id: 6, p: 2, a: 0.55, r: 0.26, spokes: 5 },
      { id: 7, p: 4, a: -0.45, r: 0.38, spokes: 6 }
    ];
    G.forEach(function (g) {
      g.n = Math.max(8, Math.round(TAU * g.r / PITCH)); g.r = g.n * PITCH / TAU;
      if (g.p == null) { g.ph = 0; return; }
      var P = G[g.p], d = P.r + g.r;
      g.c = [P.c[0] + cos(g.a) * d, P.c[1] + sin(g.a) * d];
      g.w = -P.w * P.n / g.n;
      g.ph = g.a + PI + ((g.a - P.ph) * P.n - PI) / g.n;
    });
    var E = [];
    G.forEach(function (g) { gear(g).forEach(function (l) { E.push({ pts: l[0], b: l[1], c: g.c, w: g.w, ph: g.ph, osc: 0 }); }); });
    var bc = [1.05, 0.95];
    E.push({ pts: circ(0.36), b: 1, c: bc, w: 0, ph: 0, osc: 0.9 });
    E.push({ pts: circ(0.31), b: 0.6, c: bc, w: 0, ph: 0, osc: 0.9 });
    E.push({ pts: spiral(0.05, 0.27, 7), b: 0.85, c: bc, w: 0, ph: 0, osc: 0.35 });
    for (var k = 0; k < 3; k++) { var a = TAU * k / 3; E.push({ pts: [[0.05 * cos(a), 0.05 * sin(a)], [0.31 * cos(a), 0.31 * sin(a)]], b: 0.7, c: bc, w: 0, ph: 0, osc: 0.9 }); }
    [[[-0.55, -1.2], 0.12], [[1.45, -0.55], 0.1], [[0.62, 0.42], 0.06], [[-1.25, 0.15], 0.08]].forEach(function (s) {
      var r = s[1];
      E.push({ pts: circ(r), b: 0.9, c: s[0], w: 0, ph: 0, osc: 0 });
      E.push({ pts: circ(r * 0.82), b: 0.5, c: s[0], w: 0, ph: 0, osc: 0 });
      [-1, 1].forEach(function (sg) { E.push({ pts: [[-r * 0.8, sg * r * 0.12], [r * 0.8, sg * r * 0.12]], b: 0.8, c: s[0], w: 0, ph: 0.7, osc: 0 }); });
    });
    E.push({ pts: teethPath(1.35, Math.round(TAU * 1.35 / PITCH), 0.05), b: 0.35, c: [-1.75, 1.2], w: 0.04, ph: 0, osc: 0 });
    E.push({ pts: circ(1.2), b: 0.2, c: [-1.75, 1.2], w: 0.04, ph: 0, osc: 0 });

    var tot = 0;
    E.forEach(function (e) { e.cum = [0]; for (var i = 1; i < e.pts.length; i++) { var dx = e.pts[i][0] - e.pts[i - 1][0], dy = e.pts[i][1] - e.pts[i - 1][1]; e.cum.push(e.cum[i - 1] + Math.sqrt(dx * dx + dy * dy)); } e.len = e.cum[e.cum.length - 1]; tot += e.len; });
    var pos = new Float32Array(N * 3), aG = new Float32Array(N * 4), aO = new Float32Array(N * 4), i = 0;
    E.forEach(function (e, ei) {
      var cnt = ei === E.length - 1 ? N - i : Math.round(N * e.len / tot);
      for (var q = 0; q < cnt && i < N; q++, i++) {
        var s = R() * e.len, j = 1; while (j < e.cum.length - 1 && e.cum[j] < s) j++;
        var t = (s - e.cum[j - 1]) / Math.max(1e-6, e.cum[j] - e.cum[j - 1]), A = e.pts[j - 1], B = e.pts[j];
        pos[i * 3] = A[0] + (B[0] - A[0]) * t + (R() - 0.5) * 0.006; pos[i * 3 + 1] = A[1] + (B[1] - A[1]) * t + (R() - 0.5) * 0.006; pos[i * 3 + 2] = 0;
        aG[i * 4] = e.c[0]; aG[i * 4 + 1] = e.c[1]; aG[i * 4 + 2] = e.w; aG[i * 4 + 3] = e.ph;
        aO[i * 4] = e.osc; aO[i * 4 + 1] = e.b * (0.7 + R() * 0.3); aO[i * 4 + 2] = R(); aO[i * 4 + 3] = R();
      }
    });
    return { pos: pos, aG: aG, aO: aO };
  }

  var VS = [
    'attribute vec4 aG;attribute vec4 aO;uniform float uT;uniform float uTime;uniform float uPx;uniform float uAlpha;uniform float uScale;',
    'uniform vec2 uOff;uniform vec2 uMouse;uniform vec2 uRes;varying vec3 vCol;varying float vA;',
    'void main(){',
    ' float a=aG.w+aG.z*uT+aO.x*sin(uTime*2.2);float c=cos(a),s=sin(a);',
    ' vec2 p=vec2(c*position.x-s*position.y,s*position.x+c*position.y)+aG.xy;',
    ' vec2 w=p*uScale+uOff;',
    ' vec4 cp=projectionMatrix*modelViewMatrix*vec4(w,0.0,1.0);',
    ' float g=clamp(p.y*0.38+0.5,0.0,1.0);',
    ' vec3 mint=vec3(0.541,1.0,0.894);vec3 cyan=vec3(0.24,0.82,1.0);vec3 cob=vec3(0.227,0.427,1.0);vec3 vio=vec3(0.427,0.302,1.0);',
    ' vec3 col=g>0.5?mix(cyan,mint,smoothstep(0.5,0.9,g)):(g>0.25?mix(cob,cyan,(g-0.25)*4.0):mix(vio,cob,g*4.0));',
    ' vec2 sp=(cp.xy*0.5+0.5)*uRes;vec2 d=sp-uMouse;float dl=length(d);float inf=smoothstep(150.0*uPx,0.0,dl);',
    ' cp.xy+=(d/(dl+0.001))*inf*6.0*uPx/uRes*2.0;',
    ' float tw=0.78+0.22*sin(uTime*1.4+aO.w*60.0);',
    ' vCol=col;vA=uAlpha*aO.y*tw*(1.0+inf*1.6);',
    ' gl_PointSize=(1.3+aO.z*1.1)*uPx;gl_Position=cp;}'
  ].join('\n');
  var FS = 'precision mediump float;varying vec3 vCol;varying float vA;void main(){float d=length(gl_PointCoord-0.5);gl_FragColor=vec4(vCol,smoothstep(0.5,0.0,d)*vA);}';

  class HntrGears extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      this.style.cssText += ';display:block;position:absolute;inset:0;background:#07080d;overflow:hidden;pointer-events:none';
      var cv = document.createElement('canvas'); cv.style.cssText = 'display:block;width:100%;height:100%'; this.appendChild(cv); this.cv = cv;
      (window.THREE?Promise.resolve(window.THREE):import(THREE_URL)).then(T => this.start(T)).catch(e => console.warn('three load failed', e));
    }
    disconnectedCallback() { this._dead = true; cancelAnimationFrame(this.raf); this.ro && this.ro.disconnect(); this.io && this.io.disconnect(); window.removeEventListener('pointermove', this.pm); }
    start(T) {
      if (this._dead) return;
      var self = this;
      var mob = Math.min(window.innerWidth, screen.width || 9999) < 768, cores = navigator.hardwareConcurrency || 8;
      var N = mob ? 18000 : cores <= 4 ? 26000 : 40000;
      var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      var renderer = new T.WebGLRenderer({ canvas: this.cv, antialias: false, alpha: false, powerPreference: 'high-performance' });
      var pr = Math.min(window.devicePixelRatio || 1, mob ? 1.5 : 2);
      renderer.setPixelRatio(pr); renderer.setClearColor(0x07080d, 1);
      var scene = new T.Scene(), cam = new T.OrthographicCamera(-1, 1, 1, -1, -1, 1);
      var D = build(N), g = new T.BufferGeometry();
      g.setAttribute('position', new T.BufferAttribute(D.pos, 3)); g.setAttribute('aG', new T.BufferAttribute(D.aG, 4)); g.setAttribute('aO', new T.BufferAttribute(D.aO, 4));
      g.boundingSphere = new T.Sphere(new T.Vector3(), 50);
      var U = { uT: { value: 0 }, uTime: { value: 0 }, uPx: { value: pr }, uAlpha: { value: 0.55 }, uScale: { value: 1 }, uOff: { value: new T.Vector2() }, uMouse: { value: new T.Vector2(-9999, -9999) }, uRes: { value: new T.Vector2(1, 1) } };
      var pts = new T.Points(g, new T.ShaderMaterial({ uniforms: U, vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, depthTest: false, blending: T.AdditiveBlending }));
      pts.frustumCulled = false; scene.add(pts);

      function resize() {
        var r = self.getBoundingClientRect(), W = Math.max(1, r.width), H = Math.max(1, r.height), asp = W / H, wide = W >= 900;
        renderer.setSize(W, H, false); cam.left = -asp; cam.right = asp; cam.updateProjectionMatrix();
        U.uRes.value.set(W * pr, H * pr);
        U.uScale.value = wide ? 0.95 : Math.min(0.8, asp * 0.9);
        U.uOff.value.set(wide ? asp - 1.15 : 0.15, wide ? 0 : -0.1);
        U.uAlpha.value = wide ? 0.55 : 0.32;
      }
      this.ro = new ResizeObserver(resize); this.ro.observe(this); resize();
      this.pm = function (e) { var r = self.getBoundingClientRect(); U.uMouse.value.set((e.clientX - r.left) * pr, (r.height - (e.clientY - r.top)) * pr); };
      window.addEventListener('pointermove', this.pm, { passive: true });
      var visible = true; this.io = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }); this.io.observe(this);

      var last = performance.now(), t0 = last, clock = 0, sc = null;
      function frame(now) {
        self.raf = requestAnimationFrame(frame);
        var dt = Math.min(0.05, (now - last) / 1000); last = now;
        if (!visible || document.hidden) return;
        var r = self.getBoundingClientRect(), s = -r.top / Math.max(1, window.innerHeight);
        if (sc === null) sc = s; sc += (s - sc) * Math.min(1, dt * 5);
        if (!reduce) clock += dt;
        U.uT.value = reduce ? 0 : clock * 0.35 + sc * 1.4;
        U.uTime.value = reduce ? 0 : (now - t0) / 1000;
        renderer.render(scene, cam);
      }
      this.raf = requestAnimationFrame(frame);
    }
  }
  customElements.define('hntr-gears', HntrGears);
})();
