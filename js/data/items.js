/* ===========================================================
   data/items.js —— 物品/装备/种子/家具
   type: consumable / equipment / seed / furniture / key
   =========================================================== */

const ITEMS = {
  /* ---- 消耗品 ---- */
  hp_potion:    { id:'hp_potion', name:'生命药剂', type:'consumable', desc:'恢复 50 点生命。', effect:{hp:50}, price:30 },
  mp_potion:    { id:'mp_potion', name:'魔力药剂', type:'consumable', desc:'恢复 30 点魔力。', effect:{mp:30}, price:40 },
  rose_essence: { id:'rose_essence', name:'玫瑰精魄', type:'consumable', desc:'恢复全部生命与魔力。稀有。', effect:{hp:999,mp:999}, price:200 },

  /* ---- 装备 ---- */
  iron_blade:   { id:'iron_blade', name:'寒铁刃', type:'equipment', slot:'weapon', atk:8, desc:'公爵府武库中的制式长刃。', price:120 },
  rose_rapier:  { id:'rose_rapier', name:'玫瑰刺剑', type:'equipment', slot:'weapon', atk:16, desc:'剑柄镶嵌暗红宝石，似与你的玫瑰共鸣。', price:0 },
  moon_dagger:  { id:'moon_dagger', name:'月牙匕首', type:'equipment', slot:'weapon', atk:12, desc:'裂缝深处拾得，泛着冷光。', price:0 },
  knight_armor: { id:'knight_armor', name:'骑士轻甲', type:'equipment', slot:'armor', def:6, desc:'黑色轻甲，行动自如。', price:150 },
  rose_cloak:   { id:'rose_cloak', name:'玫瑰斗篷', type:'equipment', slot:'armor', def:10, desc:'暗红衬里的黑斗篷。', price:0 },

  /* ---- 种子（农场用） ---- */
  wheat_seed:   { id:'wheat_seed', name:'麦种', type:'seed', growDays:3, yield:'wheat', desc:'3 日成熟，朴实的主食。', price:5 },
  herb_seed:    { id:'herb_seed', name:'药草种', type:'seed', growDays:4, yield:'herb', desc:'4 日成熟，可入药。', price:8 },
  rose_seed:    { id:'rose_seed', name:'玫瑰种', type:'seed', growDays:6, yield:'rose_petals', desc:'6 日成熟，稀有花卉。', price:25 },
  moon_seed:    { id:'moon_seed', name:'月华种', type:'seed', growDays:8, yield:'moon_leaf', desc:'8 日成熟，蕴含魔力。', price:40 },

  /* ---- 农作物产物（出售/材料） ---- */
  wheat:        { id:'wheat', name:'小麦', type:'material', desc:'金黄的麦穗。', price:12 },
  herb:         { id:'herb', name:'药草', type:'material', desc:'可炼制药剂。', price:20 },
  rose_petals:  { id:'rose_petals', name:'玫瑰花瓣', type:'material', desc:'暗红的花瓣，散发幽香。', price:55 },
  moon_leaf:    { id:'moon_leaf', name:'月华叶', type:'material', desc:'叶脉流转着月光。', price:90 },

  /* ---- 家具（房屋装修用） ---- */
  bed_basic:    { id:'bed_basic', name:'简朴小床', type:'furniture', size:[2,3], comfort:5, desc:'能睡就好。', price:80 },
  bed_rose:     { id:'bed_rose', name:'玫瑰大床', type:'furniture', size:[3,4], comfort:15, desc:'暗红帷幔的华贵大床。', price:300 },
  table_oak:    { id:'table_oak', name:'橡木桌', type:'furniture', size:[2,2], comfort:3, desc:'结实的橡木方桌。', price:50 },
  shelf:        { id:'shelf', name:'书架', type:'furniture', size:[1,3], comfort:4, desc:'陈列书籍与玫瑰标本。', price:70 },
  rug_rose:     { id:'rug_rose', name:'玫瑰地毯', type:'furniture', size:[3,2], comfort:6, desc:'暗红花纹的柔软地毯。', price:120 },
  lamp_moon:    { id:'lamp_moon', name:'月华灯', type:'furniture', size:[1,1], comfort:8, desc:'散发柔和月光，魔力驱动。', price:180 },

  /* ---- 关键道具 ---- */
  rift_shard:   { id:'rift_shard', name:'裂缝残片', type:'key', desc:'从副本中带回的时空碎片，冰冷而锋利。', price:0 },
  vera_letter:  { id:'vera_letter', name:'薇拉的信', type:'key', desc:'管家薇拉留给你的字条，字迹清隽。', price:0 },
  mother_diary: { id:'mother_diary', name:'母亲日记残页', type:'key', desc:'魔女卡瑞娜留下的只言片语。', price:0 },
  system_core:  { id:'system_core', name:'系统核心', type:'key', desc:'副本系统的中枢碎片，触碰它会嗡鸣。', price:0 }
};

/* 装备列表（便于系统面板展示） */
const EQUIPMENT_SLOTS = ['weapon', 'armor'];
