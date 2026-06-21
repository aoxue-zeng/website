/* ===========================================================
   core/sprite.js —— 像素立绘/角色绘制
   程序化 Canvas 绘制半身像，支持表情
   =========================================================== */

const Sprite = {
  /* 在指定 canvas 上绘制角色半身像
     charId: CHARACTERS 的 key
     expression: normal / smile / serious / surprised / sad
  */
  drawPortrait(canvas, charId, expression = 'normal') {
    const c = CHARACTERS[charId];
    if (!c) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);

    // 像素块大小（绘制为放大像素）
    const px = 6;
    const cx = W / 2;
    const baseY = H; // 半身像底部对齐画布底

    // ---- 身体（骑士装/西装） ----
    ctx.fillStyle = c.outfit.base;
    ctx.fillRect(cx - px*8, baseY - px*16, px*16, px*16);   // 躯干
    ctx.fillStyle = c.outfit.trim;
    ctx.fillRect(cx - px*1, baseY - px*16, px*2, px*16);     // 中线滚边
    ctx.fillStyle = c.outfit.shirt;
    ctx.fillRect(cx - px*3, baseY - px*14, px*6, px*4);      // 领口

    // ---- 脖子 ----
    ctx.fillStyle = c.skin2;
    ctx.fillRect(cx - px*2, baseY - px*19, px*4, px*3);

    // ---- 头部 ----
    const headCY = baseY - px*24;
    ctx.fillStyle = c.skin;
    ctx.fillRect(cx - px*6, headCY - px*6, px*12, px*12);

    // ---- 头发（齐肩、散齐刘海） ----
    ctx.fillStyle = c.hair;
    // 刘海
    ctx.fillRect(cx - px*6, headCY - px*7, px*12, px*3);
    // 两侧到肩
    ctx.fillRect(cx - px*7, headCY - px*6, px*2, px*12);
    ctx.fillRect(cx + px*5, headCY - px*6, px*2, px*12);
    // 顶部
    ctx.fillRect(cx - px*6, headCY - px*7, px*12, px*2);

    // ---- 眼睛 ----
    const eyeY = headCY - px*1;
    // 左眼（塔柳斯为玫瑰色）
    const leftColor = c.leftEye || PALETTE.ink;
    ctx.fillStyle = leftColor;
    ctx.fillRect(cx - px*4, eyeY, px*2, px*2);
    // 右眼
    const rightColor = c.rightEye || PALETTE.ink;
    ctx.fillStyle = rightColor;
    ctx.fillRect(cx + px*2, eyeY, px*2, px*2);

    // 表情：通过眉毛与嘴
    ctx.fillStyle = c.hair;
    // 眉毛
    if (expression === 'serious' || expression === 'sad') {
      ctx.fillRect(cx - px*5, headCY - px*4, px*3, px*1);
      ctx.fillRect(cx + px*2, headCY - px*4, px*3, px*1);
    } else {
      ctx.fillRect(cx - px*5, headCY - px*5, px*3, px*1);
      ctx.fillRect(cx + px*2, headCY - px*5, px*3, px*1);
    }
    // 嘴
    ctx.fillStyle = PALETTE.roseDark;
    if (expression === 'smile') {
      ctx.fillRect(cx - px*2, headCY + px*3, px*4, px*1);
      ctx.fillRect(cx - px*3, headCY + px*2, px*1, px*1);
      ctx.fillRect(cx + px*2, headCY + px*2, px*1, px*1);
    } else if (expression === 'sad') {
      ctx.fillRect(cx - px*2, headCY + px*3, px*4, px*1);
      ctx.fillRect(cx - px*3, headCY + px*4, px*1, px*1);
      ctx.fillRect(cx + px*2, headCY + px*4, px*1, px*1);
    } else if (expression === 'surprised') {
      ctx.fillRect(cx - px*1, headCY + px*3, px*2, px*2);
    } else {
      // normal
      ctx.fillRect(cx - px*2, headCY + px*3, px*4, px*1);
    }

    // ---- 塔柳斯特效：左眼玫瑰光晕 ----
    if (charId === 'talius') {
      ctx.fillStyle = 'rgba(139,30,63,0.35)';
      ctx.beginPath();
      ctx.arc(cx - px*3, eyeY + px*1, px*3, 0, Math.PI * 2);
      ctx.fill();
    }

    // ---- 微妙的暗角 ----
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(0,0,0,0.5)');
    grad.addColorStop(0.3, 'rgba(0,0,0,0)');
    grad.addColorStop(0.75, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  },

  /* 绘制小尺寸敌人/物品图标（用于战斗） */
  drawEnemy(canvas, enemyId) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);
    const px = 8, cx = W/2, cy = H/2;

    if (enemyId === 'rift_wolf') {
      // 狼形
      ctx.fillStyle = PALETTE.ink;
      ctx.fillRect(cx-px*3, cy-px*1, px*6, px*3);     // 身
      ctx.fillRect(cx-px*4, cy-px*2, px*2, px*2);     // 头
      ctx.fillRect(cx-px*5, cy-px*3, px*1, px*2);     // 耳
      ctx.fillRect(cx+px*2, cy, px*1, px*2);          // 尾
      ctx.fillStyle = PALETTE.rose;
      ctx.fillRect(cx-px*4, cy-px*1, px*1, px*1);     // 眼
      ctx.fillStyle = PALETTE.roseDark;
      ctx.fillRect(cx-px*2, cy+px*2, px*4, px*1);     // 腿
    } else if (enemyId === 'guard_golem') {
      // 石质守卫
      ctx.fillStyle = PALETTE.steel2;
      ctx.fillRect(cx-px*3, cy-px*3, px*6, px*6);
      ctx.fillStyle = PALETTE.steel;
      ctx.fillRect(cx-px*2, cy-px*2, px*4, px*2);
      ctx.fillStyle = PALETTE.rose;
      ctx.fillRect(cx-px*1, cy-px*1, px*2, px*1);     // 核心
      ctx.fillStyle = PALETTE.ink2;
      ctx.fillRect(cx-px*3, cy+px*3, px*6, px*1);     // 底座
    } else if (enemyId === 'system_will') {
      // 系统意志：与塔柳斯镜像
      ctx.fillStyle = PALETTE.roseDark;
      ctx.fillRect(cx-px*2, cy-px*4, px*4, px*3);     // 头
      ctx.fillStyle = PALETTE.rose;
      ctx.fillRect(cx-px*2, cy-px*3, px*1, px*1);     // 左眼
      ctx.fillRect(cx+px*1, cy-px*3, px*1, px*1);
      ctx.fillStyle = PALETTE.ink;
      ctx.fillRect(cx-px*3, cy-px*1, px*6, px*5);     // 身
      // 数据流
      ctx.fillStyle = PALETTE.cyan;
      for (let i=0;i<3;i++) ctx.fillRect(cx-px*4+ i*px*3, cy+px*4, px*1, px*1);
    } else {
      ctx.fillStyle = PALETTE.rose;
      ctx.fillRect(cx-px*2, cy-px*2, px*4, px*4);
    }
  }
};
