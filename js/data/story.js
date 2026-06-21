/* ===========================================================
   data/story.js —— 主线剧情脚本
   节点式：每个节点有 speaker/text/portrait/scene/choices
   choice.next 指向下一节点 id；特殊节点用 __ 前缀
   =========================================================== */

const STORY = {
  /* ===== 序章 ===== */
  prologue: {
    scene:'title',
    dialogue:[
      { speaker:'', text:'—— 月隐于云，玫瑰在左眼盛放。 ——', portrait:null },
      { speaker:'旁白', text:'艾瑟公爵府，深夜。', portrait:null, scene:'manor' },
      { speaker:'薇拉', text:'塔柳斯大人，您又失眠了。', portrait:'vera' },
      { speaker:'塔柳斯', text:'薇拉……我左眼的玫瑰又在跳。像有什么在呼唤我。', portrait:'talius' },
      { speaker:'薇拉', text:'……是裂缝。最近王国各地都出现了那种东西——会涌出异界造物的竖直裂缝。', portrait:'vera' },
      { speaker:'薇拉', text:'人们被卷入其中，称之为"副本系统"。有人活着回来，带着叫"系统面板"的东西；有人……再没回来。', portrait:'vera' },
      { speaker:'塔柳斯', text:'我的母亲，也是消失在裂缝里的，对吗？', portrait:'talius' },
      { speaker:'薇拉', text:'……大人，今夜风大。有些事，时候到了我自然会说。', portrait:'vera' },
      { speaker:'旁白', text:'就在此时，公爵府的窗外亮起一道竖直的、玫瑰色的光。', portrait:null },
      { speaker:'系统', text:'【检测到候选者 · 编号07。副本【迷雾森林】已为您开启。】', portrait:null, sys:true },
      { speaker:'塔柳斯', text:'……它来找我。', portrait:'talius' },
      { speaker:'薇拉', text:'塔柳斯大人！如果您执意要去——请带上这柄剑，和我的祝福。', portrait:'vera' },
      { speaker:'系统', text:'【请前往：迷雾森林副本入口。】', portrait:null, sys:true }
    ],
    next:'hub_town'
  },

  /* ===== 小镇枢纽（副本间隙） ===== */
  hub_town: {
    scene:'town',
    onEnter:'hub',
    free:true   // 自由探索节点
  },

  /* ===== 第一章入口 ===== */
  enter_ch1: {
    scene:'forest',
    dialogue:[
      { speaker:'系统', text:'【欢迎进入副本 · 迷雾森林。任务目标：穿越森林，抵达裂缝核心。失败惩罚：抹除。】', portrait:null, sys:true }
    ],
    next:'dungeon:ch1_forest'
  },

  /* ===== 第一章后 ===== */
  after_ch1: {
    scene:'manor',
    dialogue:[
      { speaker:'旁白', text:'你从迷雾森林带回了一块冰冷的残片。', portrait:null },
      { speaker:'薇拉', text:'塔柳斯大人……您的左眼，比以前更红了。', portrait:'vera' },
      { speaker:'塔柳斯', text:'薇拉，我在副本里看到了不该存在的东西——金属车厢、塑料、还有一本写着"循环"的日记。', portrait:'talius' },
      { speaker:'薇拉', text:'……那是"另一个世界"的造物。裂缝连接着两个世界，塔柳斯大人。而我们这边，是中世纪。', portrait:'vera' },
      { speaker:'塔柳斯', text:'系统为什么只挑中我？', portrait:'talius' },
      { speaker:'薇拉', text:'（沉默良久）时候未到，大人。但请您……务必变强。古堡的方向，又有新的裂缝亮起了。', portrait:'vera' },
      { speaker:'系统', text:'【第二章副本 · 古堡迷踪 已解锁。】', portrait:null, sys:true }
    ],
    next:'hub_town'
  },

  /* ===== 第二章入口 ===== */
  enter_ch2: {
    scene:'castle',
    dialogue:[
      { speaker:'系统', text:'【欢迎进入副本 · 古堡迷踪。任务目标：探明古堡地下室的真相。注意：本副本存在伪装者。】', portrait:null, sys:true }
    ],
    next:'dungeon:ch2_castle'
  },

  /* ===== 第二章后 ===== */
  after_ch2: {
    scene:'manor',
    dialogue:[
      { speaker:'旁白', text:'古堡的真相如冰水浇下。你在实验室里看见了自己的"原型"。', portrait:null },
      { speaker:'塔柳斯', text:'薇拉！我要你现在就告诉我——我是不是被制造出来的？我母亲到底做了什么？', portrait:'talius' },
      { speaker:'薇拉', text:'……大人。您是您母亲用生命换来的、唯一的真实。您不是容器，您是她的孩子。', portrait:'vera' },
      { speaker:'薇拉', text:'至于系统的真相……它就在时空塔的顶端。这一条路，我陪您走到底。', portrait:'vera' },
      { speaker:'系统', text:'【最终副本 · 时空塔 已解锁。警告：本副本无存档点。】', portrait:null, sys:true }
    ],
    next:'hub_town'
  },

  /* ===== 第三章入口 ===== */
  enter_ch3: {
    scene:'tower',
    dialogue:[
      { speaker:'旁白', text:'你与薇拉立于时空塔下。塔身高不见顶，每一层都倒映着不同的世界。', portrait:null },
      { speaker:'薇拉', text:'塔柳斯大人，进去之后，无论您看见什么、听见什么——请记得，您是您自己。', portrait:'vera' },
      { speaker:'塔柳斯', text:'……走吧，薇拉。该结束了。', portrait:'talius' },
      { speaker:'系统', text:'【欢迎进入最终副本 · 时空塔。】', portrait:null, sys:true }
    ],
    next:'dungeon:ch3_tower'
  }
};

/* 结局文案映射 */
const ENDINGS = {
  ending_A: { title:'结局A · 神座', desc:'你接管了系统，成为新的意志。世界得以延续，却再无人能与你并肩。' },
  ending_B: { title:'结局B · 余烬', desc:'你摧毁了系统。两界断绝往来，神格归于沉睡，你终于只是塔柳斯。' },
  ending_C: { title:'结局C · 残响', desc:'你与系统意志融合。裂缝化作门扉，你在塔顶也在玫瑰园，听见了母亲的回声。' }
};
