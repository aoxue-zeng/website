/* ===========================================================
   core/game.js —— 全局状态机与流程调度
   状态: title / hub / story / dungeon / combat / farm / house / ending
   =========================================================== */

const Game = {
  state: {
    mode: 'title',          // 当前模式
    chapter: 0,             // 0=序章未开始, 1/2/3=章, 4=通关
    currentScene: 'title',
    // 玩家属性
    player: {
      name: '艾瑟·塔柳斯·卡瑞娜',
      short: '塔柳斯',
      lv: 1, exp: 0, expNext: 100,
      hp: 80, maxHp: 80,
      mp: 40, maxMp: 40,
      atk: 14, def: 6,
      gold: 100,
      equipment: { weapon: 'rose_rapier', armor: null }
    },
    inventory: { hp_potion: 3, mp_potion: 1 },
    flags: {},              // 剧情标志
    npcAffinity: { vera:60, elen:20, mira:30, kael:25 },
    quests: {},             // questId -> {done, progress}
    farm: { plots: [] },
    house: { furniture: [] },
    day: 1
  },

  /* ---- 新游戏 ---- */

  init() {
    Scene.init();
    Input.init();
    this._bindTitle();
    this._renderTitle();
  },

  _renderTitle() {
    document.getElementById('title-screen').classList.remove('hidden');
    document.getElementById('topbar').classList.add('hidden');
    Scene.render('title');
    Scene.startPetals();
  },

  _bindTitle() {
    document.querySelectorAll('#title-screen .pixel-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        if (action === 'new-game') this.newGame();
        else if (action === 'load-game') this.loadMenu();
        else if (action === 'about') this.showAbout();
      });
    });
  },

  /* ---- 新游戏 ---- */
  async newGame() {
    Scene.stopPetals();
    this.state = this._freshState();
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('topbar').classList.remove('hidden');
    this.updateTopbar();
    // 序章
    await this.runStoryNode('prologue');
    this.enterHub();
  },

  _freshState() {
    return {
      mode: 'story',
      chapter: 0,
      currentScene: 'manor',
      player: {
        name: '艾瑟·塔柳斯·卡瑞娜', short: '塔柳斯',
        lv: 1, exp: 0, expNext: 100,
        hp: 80, maxHp: 80, mp: 40, maxMp: 40,
        atk: 14, def: 6, gold: 100,
        equipment: { weapon: 'rose_rapier', armor: null }
      },
      inventory: { hp_potion: 3, mp_potion: 1 },
      flags: {},
      npcAffinity: { vera:60, elen:20, mira:30, kael:25 },
      quests: {},
      farm: { plots: [] },
      house: { furniture: [] },
      day: 1
    };
  },

  /* ---- 读档菜单 ---- */
  loadMenu() {
    const all = Save.list();
    const has = all.some(s => s !== null);
    if (!has) {
      Toast.show('暂无存档');
      return;
    }
    // 简易：读第一个有存档的槽
    const slot = all.findIndex(s => s !== null);
    this.loadSlot(slot);
  },

  loadSlot(slot) {
    const data = Save.load(slot);
    if (!data) { Toast.show('存档为空'); return; }
    Scene.stopPetals();
    this.state = data.state || data;
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('topbar').classList.remove('hidden');
    this.updateTopbar();
    // 恢复到小镇枢纽
    this.enterHub();
  },

  async showAbout() {
    await Dialogue.show([
      { speaker:'', text:'《月蚀·玫瑰残响》', portrait:null, scene:'title' },
      { speaker:'关于', text:'一款剧情向像素网页游戏。主角艾瑟·塔柳斯·卡瑞娜——艾瑟公爵、卡瑞娜魔女之子、月·浪漫·战争之神——被卷入副本系统，逐步揭开系统与双世界的真相。', portrait:null },
      { speaker:'操作', text:'鼠标点击 / Enter 推进对话；方向键或 WASD 选择选项；探索时点击行动按钮。系统面板可随时查看状态、背包、任务。', portrait:null }
    ]);
  },

  /* ---- 运行剧情节点 ---- */
  async runStoryNode(nodeId) {
    const node = STORY[nodeId];
    if (!node) return;
    this.state.mode = 'story';
    if (node.scene) { this.state.currentScene = node.scene; Scene.render(node.scene); }

    if (node.free) {
      // 自由探索枢纽
      this.enterHub();
      return;
    }

    if (node.dialogue) {
      await Dialogue.show(node.dialogue);
    }
    if (node.next) {
      if (node.next.startsWith('dungeon:')) {
        const dunId = node.next.split(':')[1];
        await Dungeon.enter(dunId);
      } else {
        await this.runStoryNode(node.next);
      }
    }
  },

  /* ---- 小镇枢纽（自由探索） ---- */
  enterHub() {
    this.state.mode = 'hub';
    this.state.currentScene = 'town';
    Scene.render('town');
    this.updateTopbar();
    this._showHubMenu();
  },

  _showHubMenu() {
    const menu = document.getElementById('action-menu');
    menu.innerHTML = '';
    menu.classList.remove('hidden');

    const actions = this._hubActions();
    actions.forEach(a => {
      const btn = document.createElement('button');
      btn.className = 'pixel-btn';
      btn.textContent = a.label;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.add('hidden');
        a.action();
      });
      menu.appendChild(btn);
    });
  },

  _hubActions() {
    const ch = this.state.chapter;
    const acts = [
      { label:'与薇拉交谈', action:()=>this._talkNpc('vera') },
      { label:'探访小镇', action:()=>this._townMenu() },
      { label:'前往农场', action:()=>Farm.enter() },
      { label:'回公爵府装修', action:()=>House.enter() },
      { label:'系统面板', action:()=>SystemPanel.open() },
      { label:'存档', action:()=>this.saveMenu() }
    ];
    // 主线入口
    if (ch === 0) acts.push({ label:'★ 进入迷雾森林（第一章）', action:()=>this.startChapter(1) });
    else if (ch === 1) acts.push({ label:'★ 进入古堡迷踪（第二章）', action:()=>this.startChapter(2) });
    else if (ch === 2) acts.push({ label:'★ 进入时空塔（终章）', action:()=>this.startChapter(3) });
    return acts;
  },

  async startChapter(n) {
    this.state.chapter = n;
    if (n === 1) {
      await this.runStoryNode('enter_ch1');
      await this.runStoryNode('after_ch1');
      this.state.chapter = 1;
      this.enterHub();
    } else if (n === 2) {
      await this.runStoryNode('enter_ch2');
      await this.runStoryNode('after_ch2');
      this.state.chapter = 2;
      this.enterHub();
    } else if (n === 3) {
      await this.runStoryNode('enter_ch3');
      // 终章副本内含结局
    }
  },

  /* ---- NPC 交谈 ---- */
  async _talkNpc(npcId) {
    const npc = NPCS[npcId];
    if (!npc) return;
    Scene.render(npc.location);
    const aff = this.state.npcAffinity[npcId] || 0;
    const lines = npc.greeting.map(l => ({ ...l, portrait: l.speaker === '塔柳斯' ? 'talius' : npcId }));
    await Dialogue.show(lines);

    // 子菜单
    const opts = [];
    if (npc.shop) opts.push({ text:'看看商品', value:'shop' });
    npc.quests.forEach(qid => {
      const q = QUESTS[qid];
      if (!this.state.quests[qid] || !this.state.quests[qid].done) {
        opts.push({ text:`接受委托：${q.title}`, value:'quest:'+qid });
      }
    });
    if (npcId === 'vera' && this.state.flags.ch1_took_diary) {
      opts.push({ text:'询问母亲的往事', value:'vera_deep' });
    }
    opts.push({ text:'告别', value:'leave' });

    const pick = await Dialogue.choices(opts);
    if (pick === 'shop') await this._shop(npc);
    else if (pick.startsWith('quest:')) await Quest.accept(pick.split(':')[1]);
    else if (pick === 'vera_deep') await this._veraDeep();
    this.enterHub();
  },

  async _veraDeep() {
    await Dialogue.show([
      { speaker:'薇拉', text:'您母亲卡瑞娜……是上一任观察者。她发现了系统的真相后，选择了把自己献祭成裂缝，为您留一条生路。', portrait:'vera', scene:'manor' },
      { speaker:'薇拉', text:'我奉她之命守护您，直到您足够强大，去直面系统的意志。', portrait:'vera' },
      { speaker:'塔柳斯', text:'……谢谢你，薇拉。一直瞒着我，辛苦了。', portrait:'talius' },
      { speaker:'薇拉', text:'（微微一笑）这是我的职责，也是我的荣幸，塔柳斯大人。', portrait:'vera' }
    ]);
    Inventory.add('mother_diary', 1);
    this.state.npcAffinity.vera = (this.state.npcAffinity.vera||0) + 15;
    if (this.state.quests.q_vera_memory) this.state.quests.q_vera_memory.done = true;
    Toast.show('获得：母亲日记残页  ·  薇拉好感+15');
  },

  async _townMenu() {
    const opts = [
      { text:'找杂货商艾伦', value:'npc:elen' },
      { text:'找占卜师米拉', value:'npc:mira' },
      { text:'找流浪剑客凯尔', value:'npc:kael' },
      { text:'返回', value:'back' }
    ];
    const pick = await Dialogue.choices(opts);
    if (pick.startsWith('npc:')) await this._talkNpc(pick.split(':')[1]);
    this.enterHub();
  },

  async _shop(npc) {
    let browsing = true;
    while (browsing) {
      const opts = npc.shop.map(id => {
        const it = ITEMS[id];
        return { text:`${it.name}  ${it.price}金`, value:'buy:'+id };
      });
      opts.push({ text:'离开', value:'leave' });
      const pick = await Dialogue.choices(opts);
      if (pick === 'leave') browsing = false;
      else if (pick.startsWith('buy:')) {
        const id = pick.split(':')[1];
        const it = ITEMS[id];
        if (this.state.player.gold >= it.price) {
          this.state.player.gold -= it.price;
          Inventory.add(id, 1);
          Toast.show(`购入 ${it.name}`);
        } else {
          Toast.show('金币不足');
        }
      }
    }
  },

  /* ---- 存档菜单 ---- */
  saveMenu() {
    const all = Save.list();
    let html = '<h3>存档</h3><p style="color:#d4c4a0;margin-bottom:10px;">选择存档位：</p>';
    for (let i = 0; i < Save.slots; i++) {
      const s = all[i];
      html += `<div class="quest-card"><div class="q-title">槽位 ${i+1}</div><div class="q-desc">${s ? `第${s._chapter||1}章 · ${s._time||''}` : '空'}</div></div>`;
    }
    html += '<div id="save-btns" style="display:flex;gap:8px;margin-top:10px;"></div>';
    const panel = SystemPanel;
    panel._showHtml(html);
    const btns = document.getElementById('save-btns');
    for (let i = 0; i < Save.slots; i++) {
      const b = document.createElement('button');
      b.className = 'pixel-btn'; b.textContent = `存入槽${i+1}`;
      b.addEventListener('click', () => {
        Save.save(i, { state: this.state });
        Toast.show('已存档');
        panel.close();
        this._showHubMenu();
      });
      btns.appendChild(b);
    }
    const back = document.createElement('button');
    back.className = 'pixel-btn'; back.textContent = '返回';
    back.addEventListener('click', () => { panel.close(); this._showHubMenu(); });
    btns.appendChild(back);
  },

  /* ---- 战斗后回到副本 ---- */
  onCombatEnd(result) {
    // 由 Combat 调用，result = {win, enemy}
  },

  /* ---- 结局 ---- */
  async ending(flag) {
    this.state.mode = 'ending';
    this.state.flags.ending = flag;
    const e = ENDINGS[flag] || ENDINGS.ending_C;
    Scene.render('ending');
    document.getElementById('action-menu').classList.add('hidden');
    await Dialogue.show([
      { speaker:'', text:e.title, portrait:null, scene:'ending' },
      { speaker:'旁白', text:e.desc, portrait:null }
    ]);
    // 回到标题
    document.getElementById('topbar').classList.add('hidden');
    this._renderTitle();
  },

  /* ---- 顶部状态条 ---- */
  updateTopbar() {
    const p = this.state.player;
    document.getElementById('topbar-name').textContent = `塔柳斯 Lv.${p.lv}`;
    document.getElementById('topbar-hp').textContent = `HP ${p.hp}/${p.maxHp}`;
    document.getElementById('topbar-mp').textContent = `MP ${p.mp}/${p.maxMp}`;
    document.getElementById('topbar-gold').textContent = `金 ${p.gold}`;
    document.getElementById('topbar-time').textContent = `第${this.state.day}日`;
  },

  /* ---- 经验/升级 ---- */
  gainExp(amount) {
    const p = this.state.player;
    p.exp += amount;
    while (p.exp >= p.expNext) {
      p.exp -= p.expNext;
      p.lv++;
      p.expNext = Math.floor(p.expNext * 1.4);
      p.maxHp += 15; p.hp = p.maxHp;
      p.maxMp += 8; p.mp = p.maxMp;
      p.atk += 3; p.def += 2;
      Toast.show(`升级！Lv.${p.lv}`);
    }
    this.updateTopbar();
  }
};

/* ---- 全局 toast ---- */
const Toast = {
  _timer: null,
  show(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    el.classList.add('show');
    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      el.classList.remove('show');
      el.classList.add('hidden');
    }, 1800);
  }
};
