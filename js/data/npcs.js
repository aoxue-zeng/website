/* ===========================================================
   data/npcs.js —— NPC、对话与副线委托
   affinity: 好感度 0~100
   =========================================================== */

const NPCS = {
  vera: {
    id: 'vera',
    name: '薇拉·安瑟尔',
    role: '管家',
    location: 'manor',
    affinity: 60,
    greeting: [
      { speaker:'薇拉', text:'塔柳斯大人，一切已为您准备妥当。需要什么尽管吩咐。' },
      { speaker:'薇拉', text:'……无论您要去多危险的地方，我都会在您身后。' }
    ],
    quests: ['q_vera_memory']
  },

  elen: {
    id: 'elen',
    name: '艾伦',
    role: '杂货商',
    location: 'town',
    affinity: 20,
    greeting: [
      { speaker:'艾伦', text:'哟，塔柳斯大人！小店新到了一批种子，要不要瞧瞧？' }
    ],
    shop: ['wheat_seed','herb_seed','rose_seed','hp_potion','mp_potion','iron_blade','knight_armor','table_oak','bed_basic'],
    quests: ['q_elen_harvest']
  },

  mira: {
    id: 'mira',
    name: '米拉',
    role: '占卜师',
    location: 'town',
    affinity: 30,
    greeting: [
      { speaker:'米拉', text:'我看到了……裂缝深处，有一朵倒悬的玫瑰。塔柳斯大人，您与那东西，本是一体。' }
    ],
    quests: ['q_mira_rift']
  },

  kael: {
    id: 'kael',
    name: '凯尔',
    role: '流浪剑客',
    location: 'town',
    affinity: 25,
    greeting: [
      { speaker:'凯尔', text:'又见面了，公爵大人。你的剑……比上次更锋利了。' }
    ],
    quests: ['q_kael_duel']
  }
};

/* ---- 副线任务 ---- */
const QUESTS = {
  q_vera_memory: {
    id:'q_vera_memory', giver:'vera', title:'旧日回声',
    desc:'薇拉似乎想对你说起关于你母亲的往事。回公爵府与她深谈一次。',
    type:'talk', target:'vera_deep', reward:{gold:0, items:['mother_diary'], affinity:{vera:15}},
    done:false
  },
  q_elen_harvest: {
    id:'q_elen_harvest', giver:'elen', title:'金黄的丰收',
    desc:'艾伦想要 5 份小麦来酿酒。在农场种植并收获后交给他。',
    type:'deliver', need:{wheat:5}, reward:{gold:80, items:['rose_seed'], affinity:{elen:10}},
    done:false
  },
  q_mira_rift: {
    id:'q_mira_rift', giver:'mira', title:'倒悬之玫瑰',
    desc:'米拉预言裂缝中有"倒悬玫瑰"。在副本中寻得它带回。',
    type:'collect', need:{rift_shard:1}, reward:{gold:150, items:['rose_essence'], affinity:{mira:15}},
    done:false
  },
  q_kael_duel: {
    id:'q_kael_duel', giver:'kael', title:'剑客的挑战',
    desc:'凯尔想与你切磋。在小镇广场击败他。',
    type:'battle', target:'kael', reward:{gold:60, items:['iron_blade'], affinity:{kael:20}},
    done:false
  }
};
