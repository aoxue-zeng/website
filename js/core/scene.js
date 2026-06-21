/* ===========================================================
   core/scene.js —— 像素场景渲染
   根据 SCENES 配色程序化绘制背景（天空/地面/装饰）
   =========================================================== */

const Scene = {
  canvas: null,
  ctx: null,
  _animId: null,
  _particles: [],
  _petalCanvas: null,
  _petalCtx: null,
  _petalId: null,
  _petals: [],

  init() {
    this.canvas = document.getElementById('scene-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
  },

  /* 渲染指定场景
     sceneKey: SCENES 的 key
     opts: { modern:false } 现代场景加霓虹粒子
  */
  render(sceneKey, opts = {}) {
    if (!this.ctx) this.init();
    const cfg = SCENES[sceneKey] || SCENES.title;
    const ctx = this.ctx;
    const W = this.canvas.width, H = this.canvas.height;
    ctx.imageSmoothingEnabled = false;

    // 停止旧动画
    if (this._animId) cancelAnimationFrame(this._animId);
    this._particles = [];

    // ---- 天空渐变 ----
    const sky = cfg.sky || ['#000', '#111'];
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, sky[0]);
    grad.addColorStop(1, sky[1] || sky[0]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // ---- 地平线 ----
    const horizon = Math.floor(H * 0.62);

    // 按类型绘制
    if (cfg.type === 'mediterranean') {
      this._drawMed(cfg, horizon);
    } else if (cfg.type === 'modern') {
      this._drawModern(cfg, horizon);
    } else {
      this._drawNight(cfg, horizon, sceneKey);
    }

    // ---- 场景特定装饰 ----
    this._drawDecor(sceneKey, horizon);

    // ---- 现代场景：霓虹粒子飘动 ----
    if (cfg.type === 'modern') {
      this._spawnParticles(W, H, cfg.accent, 30);
      this._animateParticles();
    }

    // ---- 裂缝场景：竖直光带 ----
    if (sceneKey === 'rift' || sceneKey === 'tower') {
      this._drawRift(W, H, cfg.accent);
    }
  },

  _drawMed(cfg, horizon) {
    const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    // 远山
    ctx.fillStyle = this._shade(cfg.ground, -0.4);
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    for (let x = 0; x <= W; x += 80) {
      ctx.lineTo(x, horizon - 40 - Math.sin(x * 0.01) * 30);
    }
    ctx.lineTo(W, horizon); ctx.lineTo(0, horizon); ctx.fill();
    // 地面
    ctx.fillStyle = cfg.ground;
    ctx.fillRect(0, horizon, W, H - horizon);
    // 地面纹理
    ctx.fillStyle = this._shade(cfg.ground, -0.15);
    for (let x = 0; x < W; x += 24) {
      ctx.fillRect(x, horizon + 30, 16, 4);
    }
  },

  _drawModern(cfg, horizon) {
    const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    // 远处建筑剪影
    ctx.fillStyle = '#05050f';
    for (let i = 0; i < 12; i++) {
      const x = i * 90;
      const bh = 80 + (i * 37) % 120;
      ctx.fillRect(x, horizon - bh, 70, bh);
      // 窗户霓虹
      ctx.fillStyle = cfg.accent;
      for (let wy = horizon - bh + 10; wy < horizon - 10; wy += 18) {
        for (let wx = x + 8; wx < x + 62; wx += 16) {
          if ((wx + wy) % 3 === 0) ctx.fillRect(wx, wy, 6, 8);
        }
      }
      ctx.fillStyle = '#05050f';
    }
    // 地面（反光湿地）
    ctx.fillStyle = '#0a0a18';
    ctx.fillRect(0, horizon, W, H - horizon);
    ctx.fillStyle = 'rgba(0,229,255,0.08)';
    ctx.fillRect(0, horizon, W, H - horizon);
  },

  _drawNight(cfg, horizon, sceneKey) {
    const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    // 月亮
    ctx.fillStyle = PALETTE.moon;
    ctx.beginPath();
    ctx.arc(W * 0.78, H * 0.2, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = sky0(cfg);
    ctx.beginPath();
    ctx.arc(W * 0.82, H * 0.18, 36, 0, Math.PI * 2);
    ctx.fill();
    // 星星
    ctx.fillStyle = PALETTE.parchment;
    for (let i = 0; i < 40; i++) {
      const x = (i * 137) % W;
      const y = (i * 89) % (horizon - 20);
      ctx.fillRect(x, y, 2, 2);
    }
    // 地面
    if (cfg.ground) {
      ctx.fillStyle = cfg.ground;
      ctx.fillRect(0, horizon, W, H - horizon);
    }
  },

  _drawDecor(sceneKey, horizon) {
    const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    const px = 8;
    if (sceneKey === 'forest') {
      // 树
      ctx.fillStyle = PALETTE.green2;
      for (let i = 0; i < 6; i++) {
        const x = 60 + i * 150;
        ctx.fillRect(x, horizon - 120, px, 120);
        ctx.fillStyle = PALETTE.green;
        ctx.beginPath();
        ctx.arc(x + px/2, horizon - 120, 36, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = PALETTE.green2;
      }
    } else if (sceneKey === 'manor' || sceneKey === 'house') {
      // 公爵府轮廓
      ctx.fillStyle = PALETTE.ink2;
      ctx.fillRect(W*0.3, horizon-140, W*0.4, 140);
      ctx.fillStyle = PALETTE.gold;
      ctx.fillRect(W*0.3, horizon-140, W*0.4, 6); // 屋檐灯
      // 窗
      ctx.fillStyle = PALETTE.gold;
      for (let i=0;i<4;i++) ctx.fillRect(W*0.34 + i*60, horizon-110, 20, 30);
    } else if (sceneKey === 'town') {
      // 小屋
      ctx.fillStyle = PALETTE.brown2;
      for (let i=0;i<3;i++){
        const x = 80 + i*300;
        ctx.fillRect(x, horizon-90, 120, 90);
        ctx.fillStyle = PALETTE.brown;
        ctx.beginPath();
        ctx.moveTo(x-10, horizon-90); ctx.lineTo(x+60, horizon-130); ctx.lineTo(x+130, horizon-90);
        ctx.fill();
        ctx.fillStyle = PALETTE.brown2;
      }
    } else if (sceneKey === 'farm') {
      // 田垄
      ctx.fillStyle = PALETTE.brown;
      for (let r=0;r<4;r++){
        const y = horizon + 20 + r*40;
        ctx.fillRect(60, y, W-120, 24);
        ctx.fillStyle = PALETTE.green;
        for(let c=0;c<10;c++) ctx.fillRect(80+c*80, y+4, 40, 16);
        ctx.fillStyle = PALETTE.brown;
      }
    } else if (sceneKey === 'castle') {
      // 古堡塔楼
      ctx.fillStyle = PALETTE.ink2;
      ctx.fillRect(W*0.2, horizon-200, 80, 200);
      ctx.fillRect(W*0.6, horizon-220, 80, 220);
      ctx.fillRect(W*0.4, horizon-160, 120, 160);
      // 城垛
      ctx.fillStyle = PALETTE.ink;
      for(let i=0;i<4;i++) ctx.fillRect(W*0.2+i*22, horizon-210, 16, 16);
    } else if (sceneKey === 'tower') {
      // 时空塔：高耸 + 光带
      ctx.fillStyle = PALETTE.ink2;
      ctx.fillRect(W*0.42, horizon-340, W*0.16, 340);
      ctx.fillStyle = PALETTE.roseLight;
      for(let i=0;i<6;i++) ctx.fillRect(W*0.42, horizon-320+i*55, W*0.16, 4);
    } else if (sceneKey === 'title' || sceneKey === 'ending') {
      this._drawTitleArt(ctx, W, H);
    }
  },

  /* 标题页精致美术：弦月、星空、山影、倒悬玫瑰 */
  _drawTitleArt(ctx, W, H) {
    // 深空渐变底（覆盖默认天空，做出夜空层次）
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#080612');
    sky.addColorStop(0.5, '#150a1c');
    sky.addColorStop(1, '#2a0e1e');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // 远处地平线暖光
    const glow = ctx.createRadialGradient(W*0.5, H*0.95, 10, W*0.5, H*0.95, W*0.6);
    glow.addColorStop(0, 'rgba(139,30,63,0.35)');
    glow.addColorStop(1, 'rgba(139,30,63,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // 星空（多层闪烁）
    for (let i = 0; i < 120; i++) {
      const x = (i * 137.508) % W;
      const y = (i * 89.317) % (H * 0.72);
      const big = i % 7 === 0;
      const s = big ? 2 : 1;
      ctx.globalAlpha = 0.25 + (i % 9) * 0.08;
      ctx.fillStyle = big ? PALETTE.cyan : PALETTE.parchment;
      ctx.fillRect(x, y, s, s);
      if (big) {
        // 十字星芒
        ctx.globalAlpha = 0.4;
        ctx.fillRect(x-1, y, 3, 1);
        ctx.fillRect(x, y-1, 1, 3);
      }
    }
    ctx.globalAlpha = 1;

    // 弦月（左上）—— 双圆相减
    const mx = W * 0.78, my = H * 0.24, mr = 38;
    const moonGrad = ctx.createRadialGradient(mx-6, my-6, 4, mx, my, mr);
    moonGrad.addColorStop(0, '#ffffff');
    moonGrad.addColorStop(0.7, PALETTE.moon);
    moonGrad.addColorStop(1, '#7a8aa0');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();
    // 月坑
    ctx.fillStyle = 'rgba(122,138,160,0.5)';
    ctx.beginPath(); ctx.arc(mx-10, my-8, 5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(mx+8, my+6, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(mx-4, my+12, 3, 0, Math.PI*2); ctx.fill();
    // 月光晕
    const mhalo = ctx.createRadialGradient(mx, my, mr, mx, my, mr*2.4);
    mhalo.addColorStop(0, 'rgba(200,214,229,0.25)');
    mhalo.addColorStop(1, 'rgba(200,214,229,0)');
    ctx.fillStyle = mhalo;
    ctx.beginPath(); ctx.arc(mx, my, mr*2.4, 0, Math.PI*2); ctx.fill();

    // 远山剪影（两层）
    ctx.fillStyle = '#0d0712';
    ctx.beginPath();
    ctx.moveTo(0, H*0.82);
    for (let x = 0; x <= W; x += 40) {
      ctx.lineTo(x, H*0.82 - Math.sin(x*0.012)*22 - 18);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
    ctx.fillStyle = '#160a16';
    ctx.beginPath();
    ctx.moveTo(0, H*0.88);
    for (let x = 0; x <= W; x += 30) {
      ctx.lineTo(x, H*0.88 - Math.sin(x*0.02+1)*14);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();

    // 倒悬玫瑰（中央，发光）
    const rcx = W / 2, rcy = H * 0.46;
    // 光晕
    const rhalo = ctx.createRadialGradient(rcx, rcy, 6, rcx, rcy, 95);
    rhalo.addColorStop(0, 'rgba(192,57,94,0.55)');
    rhalo.addColorStop(0.5, 'rgba(139,30,63,0.25)');
    rhalo.addColorStop(1, 'rgba(139,30,63,0)');
    ctx.fillStyle = rhalo;
    ctx.beginPath(); ctx.arc(rcx, rcy, 95, 0, Math.PI*2); ctx.fill();

    // 茎与叶（向下，倒悬）
    ctx.strokeStyle = '#3a2428';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(rcx, rcy + 24);
    ctx.quadraticCurveTo(rcx+6, rcy+70, rcx-2, rcy+110);
    ctx.stroke();
    // 叶
    ctx.fillStyle = '#4a2a30';
    this._leaf(ctx, rcx-14, rcy+60, 12, -0.5);
    this._leaf(ctx, rcx+12, rcy+82, 12, 0.5);

    // 玫瑰花头：多层螺旋花瓣
    this._drawRose(ctx, rcx, rcy, 30);
  },

  /* 画一片叶 */
  _leaf(ctx, x, y, len, ang) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len*0.5, -len*0.4, len, 0);
    ctx.quadraticCurveTo(len*0.5, len*0.4, 0, 0);
    ctx.fill();
    ctx.restore();
  },

  /* 画一朵精致玫瑰：多层花瓣螺旋 */
  _drawRose(ctx, cx, cy, r) {
    // 外层暗色底
    ctx.fillStyle = PALETTE.roseDark;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.fill();
    // 螺旋花瓣层
    const layers = [
      { n: 6, rad: r*0.95, color: PALETTE.rose, off: 0 },
      { n: 6, rad: r*0.78, color: PALETTE.roseLight, off: 0.3 },
      { n: 5, rad: r*0.58, color: PALETTE.rose, off: 0.6 },
      { n: 4, rad: r*0.38, color: PALETTE.roseDark, off: 0.9 }
    ];
    layers.forEach(L => {
      for (let i = 0; i < L.n; i++) {
        const a = (i / L.n) * Math.PI*2 + L.off;
        const px = cx + Math.cos(a) * L.rad * 0.55;
        const py = cy + Math.sin(a) * L.rad * 0.55;
        ctx.fillStyle = L.color;
        ctx.beginPath();
        ctx.ellipse(px, py, L.rad*0.5, L.rad*0.38, a, 0, Math.PI*2);
        ctx.fill();
      }
    });
    // 中心高光
    ctx.fillStyle = '#f0a8b8';
    ctx.beginPath();
    ctx.arc(cx-2, cy-3, 4, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(cx-3, cy-4, 1.5, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
  },

  _drawRift(W, H, accent) {
    const ctx = this.ctx;
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(W*0.48, H*0.15, 6, H*0.5);
    ctx.globalAlpha = 0.3;
    ctx.fillRect(W*0.47, H*0.15, 10, H*0.5);
    ctx.globalAlpha = 1;
  },

  _spawnParticles(W, H, color, n) {
    for (let i = 0; i < n; i++) {
      this._particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vy: -0.3 - Math.random() * 0.5,
        size: 1 + Math.random() * 2,
        color, life: 1
      });
    }
  },

  _animateParticles() {
    const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    const loop = () => {
      // 只重绘粒子层会复杂，这里轻量重绘粒子（叠加在静态背景上）
      this._particles.forEach(p => {
        p.y += p.vy;
        if (p.y < 0) { p.y = H; p.x = Math.random() * W; }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      ctx.globalAlpha = 1;
      this._animId = requestAnimationFrame(loop);
    };
    loop();
  },

  /* ---- 飘落玫瑰花瓣（标题页用） ---- */
  startPetals() {
    this._petalCanvas = document.getElementById('petal-canvas');
    if (!this._petalCanvas) return;
    this._petalCanvas.width = 960;
    this._petalCanvas.height = 540;
    this._petalCtx = this._petalCanvas.getContext('2d');
    this._petals = [];
    const colors = [PALETTE.rose, PALETTE.roseLight, PALETTE.roseDark];
    for (let i = 0; i < 32; i++) {
      this._petals.push(this._newPetal(colors));
    }
    if (this._petalId) cancelAnimationFrame(this._petalId);
    const loop = () => {
      const ctx = this._petalCtx, W = 960, H = 540;
      ctx.clearRect(0, 0, W, H);
      this._petals.forEach(p => {
        p.y += p.vy;
        p.x += Math.sin(p.y * 0.02 + p.phase) * 0.9;
        p.rot += p.vr;
        if (p.y > H + 10) { Object.assign(p, this._newPetal(colors)); p.y = -10; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha;
        // 花瓣形：水滴 + 渐变
        const g = ctx.createLinearGradient(0, -p.size, 0, p.size);
        g.addColorStop(0, p.color);
        g.addColorStop(1, PALETTE.roseDark);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size*0.7, -p.size*0.6, p.size*0.7, p.size*0.6, 0, p.size);
        ctx.bezierCurveTo(-p.size*0.7, p.size*0.6, -p.size*0.7, -p.size*0.6, 0, -p.size);
        ctx.fill();
        // 中脉
        ctx.strokeStyle = 'rgba(94,20,41,0.4)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, -p.size*0.8); ctx.lineTo(0, p.size*0.8);
        ctx.stroke();
        ctx.restore();
      });
      ctx.globalAlpha = 1;
      this._petalId = requestAnimationFrame(loop);
    };
    loop();
  },

  _newPetal(colors) {
    return {
      x: Math.random() * 960,
      y: Math.random() * 540 - 100,
      vy: 0.5 + Math.random() * 1.0,
      size: 4 + Math.random() * 5,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.06,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.4 + Math.random() * 0.45,
      color: colors[(Math.random() * colors.length) | 0]
    };
  },

  stopPetals() {
    if (this._petalId) { cancelAnimationFrame(this._petalId); this._petalId = null; }
    if (this._petalCtx) this._petalCtx.clearRect(0, 0, 960, 540);
  },

  _shade(hex, amt) {
    // 简易调暗/调亮
    const c = hex.replace('#','');
    let r = parseInt(c.substr(0,2),16), g = parseInt(c.substr(2,2),16), b = parseInt(c.substr(4,2),16);
    r = Math.max(0, Math.min(255, r + r*amt));
    g = Math.max(0, Math.min(255, g + g*amt));
    b = Math.max(0, Math.min(255, b + b*amt));
    return `rgb(${r|0},${g|0},${b|0})`;
  }
};

function sky0(cfg){ return cfg.sky ? cfg.sky[0] : '#000'; }
