/* ===========================================================
   data/sprites.js —— 像素图数据
   以结构化数据描述立绘/场景配色，由 core/sprite.js 与
   core/scene.js 读取后用 Canvas 程序化绘制。
   =========================================================== */

/* ---- 调色板 ---- */
const PALETTE = {
  rose: '#8b1e3f', roseLight: '#c0395e', roseDark: '#5e1429',
  ink: '#1a1a2e', ink2: '#16213e',
  parchment: '#e8dcc4', parchment2: '#d4c4a0',
  moon: '#c8d6e5', cyan: '#00e5ff', gold: '#f1c40f',
  skin: '#f0c8a0', skin2: '#d9a878',
  hair: '#2a1a2e', silver: '#c0c8d4',
  green: '#4a7c3a', green2: '#2e5220',
  brown: '#6b4423', brown2: '#4a2e18',
  steel: '#8a8a9a', steel2: '#5a5a6a',
  red: '#e74c3c', white: '#ffffff', black: '#000000'
};

/* ---- 角色立绘定义 ----
   每个角色用简单的几何描述绘制半身像。
   expression: normal / smile / serious / surprised / sad
*/
const CHARACTERS = {
  // 主角：艾瑟·塔柳斯·卡瑞娜
  talius: {
    name: '艾瑟·塔柳斯·卡瑞娜',
    short: '塔柳斯',
    skin: PALETTE.skin,
    hair: PALETTE.hair,
    // 左眼是玫瑰（暗红），右眼正常
    leftEye: PALETTE.rose,
    rightEye: PALETTE.moon,
    outfit: {
      base: PALETTE.ink,      // 黑色骑士装
      trim: PALETTE.rose,     // 暗红滚边
      shirt: PALETTE.white
    },
    desc: '左眼绽放着玫瑰的暗红，齐肩黑发，一身利落的黑色骑士装。',
    tags: ['月之神', '浪漫之神', '战争之神', '魔女之子', '艾瑟公爵']
  },

  // 管家：薇拉·安瑟尔
  vera: {
    name: '薇拉·安瑟尔',
    short: '薇拉',
    skin: PALETTE.skin,
    hair: PALETTE.silver,    // 银灰长发
    leftEye: PALETTE.moon,
    rightEye: PALETTE.moon,
    outfit: {
      base: PALETTE.ink2,    // 深蓝黑管家服
      trim: PALETTE.parchment,
      shirt: PALETTE.white
    },
    desc: '银灰长发束于身后，禁欲冷静的管家服下藏着不为人知的力量。',
    tags: ['管家', '实力者', '守护者']
  }
};

/* ---- 场景配色方案（由 scene.js 绘制） ----
   type: mediterranean(中世纪暖) / modern(现代冷霓虹) / dusk / night
*/
const SCENES = {
  title:    { type: 'night',     sky: ['#1a0a14', '#2a0a18'], accent: PALETTE.rose },
  manor:    { type: 'mediterranean', sky: ['#3a2818', '#5a3a20'], ground: PALETTE.brown, accent: PALETTE.gold },
  town:     { type: 'mediterranean', sky: ['#4a3828', '#7a5a38'], ground: PALETTE.brown2, accent: PALETTE.parchment },
  forest:   { type: 'mediterranean', sky: ['#1a2818', '#2e4220'], ground: PALETTE.green2, accent: PALETTE.green },
  castle:   { type: 'night',     sky: ['#10101e', '#1a1a2e'], ground: PALETTE.ink2, accent: PALETTE.moon },
  rift:     { type: 'modern',    sky: ['#0a0a1e', '#1a0a2e'], ground: PALETTE.ink, accent: PALETTE.cyan },
  modern_city:{ type: 'modern',  sky: ['#0a0a1e', '#2a0a3e'], ground: PALETTE.ink2, accent: PALETTE.cyan },
  tower:    { type: 'night',     sky: ['#0a0a1e', '#2a1a3e'], ground: PALETTE.ink2, accent: PALETTE.roseLight },
  farm:     { type: 'mediterranean', sky: ['#5a6a38', '#8a9a58'], ground: PALETTE.green, accent: PALETTE.gold },
  house:    { type: 'mediterranean', sky: ['#4a3828', '#6a4a30'], ground: PALETTE.brown, accent: PALETTE.gold },
  ending:   { type: 'night',     sky: ['#0a0a14', '#1a0a1e'], accent: PALETTE.rose }
};
