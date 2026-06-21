/* ===========================================================
   data/dungeons.js —— 副本定义
   副本游戏系统：每个副本有 主题/场景序列/规则/敌人/奖励
   scene 结构: { id, type, text, choices:[{text, next, tag}] }
   tag: combat / investigate / story / exit
   =========================================================== */

const DUNGEONS = {
  /* ============ 第一章：迷雾森林（含现代露营地片段） ============ */
  ch1_forest: {
    id:'ch1_forest',
    title:'第一章 · 迷雾森林',
    intro:'系统提示：欢迎进入副本【迷雾森林】。任务目标：穿越森林，抵达裂缝核心。失败惩罚：抹除。',
    sceneKey:'forest',
    recommendedLv:1,
    reward:{ exp:100, gold:50, items:['rift_shard'] },
    scenes: {
      start: {
        text:'浓雾将森林裹成一座灰白的迷宫。系统面板在视野角落亮起：\n「目标：寻找裂缝核心。当前副本存活者：1/1」\n你握紧玫瑰刺剑，向林中深处望去。',
        choices:[
          { text:'沿小径深入', next:'path' },
          { text:'先调查脚边的残骸', next:'wreck', tag:'investigate' }
        ]
      },
      wreck: {
        text:'残骸是一截……金属车厢？没有马，没有轮辐，通体银白，表面印着你看不懂的文字。\n这不属于这个世界。你捡起一块锋利的碎片。',
        onEnter:{ give:['rift_shard'] },
        choices:[ { text:'继续前进', next:'path' } ]
      },
      path: {
        text:'雾里传来低吼。一团扭曲的黑影从树后扑来——是受裂缝侵蚀的野兽。',
        choices:[
          { text:'迎战', next:'combat_wolf', tag:'combat' },
          { text:'以魔力震慑它', next:'path_magic', tag:'combat', condition:'mp>=15' }
        ]
      },
      path_magic: {
        text:'你抬手，掌心绽出暗红的玫瑰光纹。野兽哀鸣着退入雾中。\n「系统提示：副本存活者 1/1。你的存在……异常稳定。」',
        onEnter:{ cost:{mp:15}, exp:60 },
        choices:[ { text:'走向林间空地', next:'camp' } ]
      },
      combat_wolf: {
        enemy:'rift_wolf',
        text:'侵蚀之狼扑了上来！',
        choices:[ { text:'战斗', next:'after_wolf', tag:'combat' } ]
      },
      after_wolf: {
        text:'狼化作黑雾散去。你擦去剑上的血迹，前方雾气渐散，露出一片不该存在的空地。',
        choices:[ { text:'进入空地', next:'camp' } ]
      },
      camp: {
        text:'空地中央是一顶现代帐篷，旁边是熄灭的篝火和一只塑料水壶。\n帐篷里有一本日记，字迹潦草：「……第七次循环。系统说这是游戏。可我记得每一次死……」\n你的玫瑰左眼刺痛了一下。',
        onEnter:{ give:['vera_letter'], exp:40 },
        choices:[
          { text:'带走日记残页', next:'camp_take' },
          { text:'就地销毁，免得扰乱', next:'camp_burn' }
        ]
      },
      camp_take: {
        text:'你收起残页。一阵电流般的震颤穿过身体——「系统提示：检测到记忆载体。该玩家……已记录。」',
        onEnter:{ flag:'ch1_took_diary' },
        choices:[ { text:'走向裂缝核心', next:'core' } ]
      },
      camp_burn: {
        text:'你点燃日记。火焰是冷蓝色的，不像这个世界该有的火。\n「系统提示：异常数据已清除。恭喜，你很……干净。」',
        choices:[ { text:'走向裂缝核心', next:'core' } ]
      },
      core: {
        text:'林尽头，一道竖直的裂缝悬浮半空，裂缝另一侧是霓虹闪烁的现代都市夜景。\n裂缝中央悬着一朵倒悬的玫瑰，与你左眼遥相呼应。\n系统提示：「核心已激活。选择：触碰 / 摧毁 / 凝视。」',
        choices:[
          { text:'触碰玫瑰', next:'end_touch', tag:'story' },
          { text:'摧毁核心', next:'end_destroy', tag:'story' },
          { text:'只是凝视', next:'end_gaze', tag:'story' }
        ]
      },
      end_touch: {
        text:'指尖触上花瓣的刹那，无数画面涌入：一座塔、一个戴面具的人、一行不断滚动的代码……\n你的神格深处有什么醒了过来。\n「系统提示：第一章通过。玩家评级——异常。」',
        onEnter:{ flag:'ch1_touch', exp:100, give:['system_core'] },
        choices:[ { text:'离开副本', next:'__EXIT__' } ]
      },
      end_destroy: {
        text:'你挥剑斩向玫瑰。它碎成万千光点，又在你剑刃上重新凝聚。\n「系统提示：核心不可摧毁。但你……很努力。」',
        onEnter:{ flag:'ch1_destroy', exp:80 },
        choices:[ { text:'离开副本', next:'__EXIT__' } ]
      },
      end_gaze: {
        text:'你与那朵倒悬的玫瑰对视良久。它仿佛也在凝视你。\n末了，它轻轻点了点头——像在确认什么。\n「系统提示：第一章通过。观察者已记录。」',
        onEnter:{ flag:'ch1_gaze', exp:90 },
        choices:[ { text:'离开副本', next:'__EXIT__' } ]
      }
    },
    enemies: {
      rift_wolf: { name:'侵蚀之狼', hp:45, atk:11, def:3, exp:40, gold:20, drop:{ rift_shard:1, rate:0.5 } }
    }
  },

  /* ============ 第二章：古堡迷踪（含现代实验室片段） ============ */
  ch2_castle: {
    id:'ch2_castle',
    title:'第二章 · 古堡迷踪',
    intro:'系统提示：欢迎进入副本【古堡迷踪】。任务目标：探明古堡地下室的真相。',
    sceneKey:'castle',
    recommendedLv:4,
    reward:{ exp:200, gold:120, items:['rift_shard'] },
    scenes: {
      start: {
        text:'古堡大门在身后无声合拢。月光透过彩色玻璃，在地面投下破碎的纹章。\n系统面板：「目标：地下实验室。注意：本副本存在伪装者。」',
        choices:[
          { text:'沿主楼梯下行', next:'stairs' },
          { text:'检查走廊尽头的画', next:'portrait', tag:'investigate' }
        ]
      },
      portrait: {
        text:'画中是一位戴玫瑰面具的人，与你身形相仿。画框铭牌刻着：「观察者 · 第七号」。\n当你转身，画中人的眼睛似乎也跟着转了过来。',
        onEnter:{ flag:'ch2_portrait' },
        choices:[ { text:'快步下楼', next:'stairs' } ]
      },
      stairs: {
        text:'楼梯尽头是一扇金属门，门上没有锁孔，只有一个发着冷光的掌纹面板。\n这种东西不该出现在中世纪古堡里。',
        choices:[
          { text:'用玫瑰左眼贴近', next:'door_eye' },
          { text:'强行破门', next:'door_break', tag:'combat' }
        ]
      },
      door_eye: {
        text:'面板扫过你的左眼，亮起一行字：「观察者原型，已识别。欢迎回家。」\n门滑开了。门后是铺满白瓷砖的——现代实验室。',
        onEnter:{ flag:'ch2_eye', exp:50 },
        choices:[ { text:'进入实验室', next:'lab' } ]
      },
      door_break: {
        enemy:'guard_golem',
        text:'你一剑斩向门板，金属门后涌出一具石质守卫。',
        choices:[ { text:'战斗', next:'after_golem', tag:'combat' } ]
      },
      after_golem: {
        text:'守卫崩塌，金属门也被撞开一条缝。你侧身挤了进去。',
        onEnter:{ exp:60 },
        choices:[ { text:'进入实验室', next:'lab' } ]
      },
      lab: {
        text:'实验室中央是一座玻璃舱，舱内漂浮着与你一模一样的少女——只是左眼是空的。\n舱壁贴满记录：「实验体 07 · 塔柳斯。神格移植：成功。记忆回溯：失败。备注：她不该醒来。」\n你的手在抖。系统面板亮起：「伪装者已现身。请识别并处置。」',
        onEnter:{ give:['mother_diary'], exp:80 },
        choices:[
          { text:'击碎玻璃舱', next:'lab_smash', tag:'story' },
          { text:'读取全部记录', next:'lab_read', tag:'story' },
          { text:'什么也不做', next:'lab_wait', tag:'story' }
        ]
      },
      lab_smash: {
        text:'玻璃碎裂，舱中少女睁眼，用你母亲的声音说：「……孩子，快走。」随即化作光点消散。\n你的神格剧烈震颤。系统提示：「异常。异常。异常。第二章通过——勉强。」',
        onEnter:{ flag:'ch2_smash', exp:200, give:['system_core'] },
        choices:[ { text:'离开副本', next:'__EXIT__' } ]
      },
      lab_read: {
        text:'记录显示：这个世界的"神格"是被制造出来的，而副本系统是培养皿。\n你，塔柳斯，是编号 07 的"原型"。其余编号都已失败。\n系统提示：「观察者权限不足。第二章通过。」',
        onEnter:{ flag:'ch2_read', exp:220, give:['system_core'] },
        choices:[ { text:'离开副本', next:'__EXIT__' } ]
      },
      lab_wait: {
        text:'你就站在那里。玻璃舱中的少女也静静看着你，像在等你做一个她没能做的决定。\n良久，系统提示：「……你选择了沉默。第二章通过。观察者对此表示敬意。」',
        onEnter:{ flag:'ch2_wait', exp:180 },
        choices:[ { text:'离开副本', next:'__EXIT__' } ]
      }
    },
    enemies: {
      guard_golem: { name:'古堡守卫', hp:90, atk:16, def:8, exp:70, gold:40, drop:{ knight_armor:1, rate:0.3 } }
    }
  },

  /* ============ 第三章：时空塔（终章 · 系统真相） ============ */
  ch3_tower: {
    id:'ch3_tower',
    title:'第三章 · 时空塔（终章）',
    intro:'系统提示：欢迎进入最终副本【时空塔】。任务目标：抵达塔顶，直面系统的意志。\n警告：本副本无存档点。',
    sceneKey:'tower',
    recommendedLv:8,
    reward:{ exp:500, gold:0, items:[] },
    scenes: {
      start: {
        text:'塔内没有楼梯，只有不断上升的悬浮平台。每一层都倒映着不同的世界——\n有的是你熟悉的公爵府，有的是霓虹都市，有的……是你从未见过的、纯白的数据空间。',
        choices:[
          { text:'登上第一层：记忆', next:'f1' },
          { text:'先整理装备', next:'start', tag:'menu' }
        ]
      },
      f1: {
        text:'第一层重现了你幼时的房间。薇拉正俯身哄你入睡，但她的脸是模糊的。\n"塔柳斯大人，"她的声音却清晰，"有些事，我本想永远瞒着您。"',
        choices:[
          { text:'听她说完', next:'f1_listen', tag:'story' },
          { text:'打断她，继续向上', next:'f2', tag:'story' }
        ]
      },
      f1_listen: {
        text:'薇拉缓缓道来：你的母亲卡瑞娜，是上一任"观察者"。她发现了系统的真相，\n于是把自己献祭成了裂缝，只为给你留一条生路。薇拉奉命守护你，直到你足够强大。\n"而现在，您该去见她了。"',
        onEnter:{ flag:'ch3_truth', exp:100, give:['mother_diary'] },
        choices:[ { text:'登上第二层：真相', next:'f2' } ]
      },
      f2: {
        text:'第二层是纯白的数据空间。无数屏幕滚动着同一段代码，中央站着一个戴玫瑰面具的人。\n"欢迎，编号 07。"TA摘下面具——那是一张与你一模一样的脸，\n"我是系统的意志，也是你的……另一个可能。"',
        choices:[
          { text:'质问系统的目的', next:'f2_ask', tag:'story' },
          { text:'直接拔剑', next:'f2_fight', tag:'combat' }
        ]
      },
      f2_ask: {
        text:'TA平静地说："这个世界的神格会枯竭。系统培育新的神格容器，从中收割力量以维系世界。\n你是唯一成功的原型。母亲为你逃走，薇拉为你隐瞒——而我，一直在等你回来，\n接管这一切。"TA伸出手："成为新的系统，还是毁掉它？"',
        choices:[
          { text:'接管——成为新系统（结局A）', next:'end_A', tag:'story' },
          { text:'摧毁系统（结局B）', next:'end_B', tag:'story' },
          { text:'与TA融合，让世界与系统共存（结局C）', next:'end_C', tag:'story' }
        ]
      },
      f2_fight: {
        enemy:'system_will',
        text:'系统意志化作一道与你镜像般的人影，拔出另一柄玫瑰刺剑。',
        choices:[ { text:'最终战', next:'after_final', tag:'combat' } ]
      },
      after_final: {
        text:'TA单膝跪地，嘴角带笑："你比所有编号都强……去塔顶吧，选择权在你。"',
        onEnter:{ exp:300 },
        choices:[
          { text:'塔顶：接管系统（结局A）', next:'end_A', tag:'story' },
          { text:'塔顶：摧毁系统（结局B）', next:'end_B', tag:'story' },
          { text:'塔顶：融合共存（结局C）', next:'end_C', tag:'story' }
        ]
      },
      end_A: {
        text:'【结局A · 神座】你接过TA的手。数据从指尖蔓延，将你包裹成新的系统意志。\n世界依旧运转，副本依旧开启，只是再无人被抹除。\n薇拉在塔下仰望，轻声说："恭喜您，塔柳斯大人。您终于……自由了。"\n而你，第一次感到孤独。',
        onEnter:{ flag:'ending_A' },
        choices:[ { text:'—— 全文完 ——', next:'__ENDING__' } ]
      },
      end_B: {
        text:'【结局B · 余烬】你挥剑斩碎塔顶的核心。系统崩塌，裂缝消失，\n现代与中世纪两个世界从此再无法往来。薇拉抱住摇摇欲坠的你："没关系，回家了。"\n你的左眼玫瑰渐渐熄灭，神格归于沉睡。你终于只是——塔柳斯。',
        onEnter:{ flag:'ending_B' },
        choices:[ { text:'—— 全文完 ——', next:'__ENDING__' } ]
      },
      end_C: {
        text:'【结局C · 残响】你拥抱了TA。两道身影融为一束玫瑰色的光，注入塔顶。\n系统不再收割，裂缝化作两界往来的门扉。你既在塔顶，也在公爵府的玫瑰园里。\n薇拉端来红茶，对着空气轻笑："大人，今天的月色真好。"\n——而你，终于听见了母亲的回声。',
        onEnter:{ flag:'ending_C' },
        choices:[ { text:'—— 全文完 ——', next:'__ENDING__' } ]
      }
    },
    enemies: {
      system_will: { name:'系统意志', hp:160, atk:22, def:10, exp:300, gold:0, drop:{} }
    }
  }
};
