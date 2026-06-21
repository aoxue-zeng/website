/* ===========================================================
   systems/farm.js —— 农场种植（星露谷式）
   plots: [{ itemId, day, mature }...] 网格 3x3
   =========================================================== */

const Farm = {
  PLOT_COLS: 3,
  PLOT_ROWS: 3,
  PLOT_COUNT: 9,

  init() {
    if (!Game.state.farm || !Game.state.farm.plots) {
      Game.state.farm = { plots: new Array(this.PLOT_COUNT).fill(null) };
    }
    if (!Array.isArray(Game.state.farm.plots) || Game.state.farm.plots.length < this.PLOT_COUNT) {
      const p = Game.state.farm.plots || [];
      while (p.length < this.PLOT_COUNT) p.push(null);
      Game.state.farm.plots = p;
    }
  },

  async enter() {
    this.init();
    Game.state.mode = 'farm';
    Game.state.currentScene = 'farm';
    Scene.render('farm');
    document.getElementById('action-menu').classList.add('hidden');
    await this._menu();
  },

  async _menu() {
    await Dialogue.show([
      { speaker:'', text:'你来到公爵府外的私属田地。阳光洒在翻好的褐色土壤上。', portrait:null, scene:'farm' }
    ]);
    await this._mainLoop();
  },

  async _mainLoop() {
    let loop = true;
    while (loop) {
      this._renderPlots();
      const opts = [
        { text:'种植', value:'plant' },
        { text:'浇水', value:'water' },
        { text:'收获', value:'harvest' },
        { text:'前往下一日', value:'nextday' },
        { text:'返回小镇', value:'leave' }
      ];
      const pick = await Dialogue.choices(opts);
      if (pick === 'plant') await this._plant();
      else if (pick === 'water') await this._water();
      else if (pick === 'harvest') await this._harvest();
      else if (pick === 'nextday') this._nextDay();
      else loop = false;
    }
    Game.enterHub();
  },

  _renderPlots() {
    // 用 toast 简要显示田地状态
    const plots = Game.state.farm.plots;
    const lines = plots.map((p, i) => {
      if (!p) return `[${i+1}] 空地`;
      const seed = ITEMS[p.itemId];
      const left = seed.growDays - p.day;
      if (left <= 0) return `[${i+1}] ${seed.name.replace('种','')} ✦成熟`;
      return `[${i+1}] ${seed.name}（${left}日）`;
    });
    Toast.show(lines.join('  '));
  },

  async _plant() {
    const seeds = Object.keys(Game.state.inventory)
      .filter(id => ITEMS[id] && ITEMS[id].type === 'seed' && Game.state.inventory[id] > 0);
    const empty = Game.state.farm.plots.findIndex(p => !p);
    if (empty === -1) { Toast.show('田地已满'); return; }
    if (!seeds.length) { Toast.show('没有种子'); return; }
    const opts = seeds.map(id => ({ text:`${ITEMS[id].name} x${Game.state.inventory[id]}`, value:id }));
    opts.push({ text:'取消', value:'cancel' });
    const pick = await Dialogue.choices(opts);
    if (pick === 'cancel' || !pick) return;
    Inventory.remove(pick, 1);
    Game.state.farm.plots[empty] = { itemId: pick, day: 0, watered: false };
    Toast.show(`种下 ${ITEMS[pick].name}`);
  },

  async _water() {
    let watered = 0;
    Game.state.farm.plots.forEach(p => {
      if (p && !p.watered) { p.watered = true; watered++; }
    });
    Toast.show(watered ? `浇灌了 ${watered} 块田` : '无需浇水');
  },

  async _harvest() {
    let gained = [];
    Game.state.farm.plots.forEach((p, i) => {
      if (!p) return;
      const seed = ITEMS[p.itemId];
      if (p.day >= seed.growDays) {
        Inventory.add(seed.yield, 1);
        gained.push(ITEMS[seed.yield].name);
        Game.state.farm.plots[i] = null;
      }
    });
    if (gained.length) Toast.show(`收获：${gained.join('、')}`);
    else Toast.show('没有可收获的作物');

    // 触发交付类任务检查
    this._checkDeliverQuests();
  },

  _checkDeliverQuests() {
    Object.keys(QUESTS).forEach(qid => {
      const q = QUESTS[qid];
      if (q.type === 'deliver' && Game.state.quests[qid] && !Game.state.quests[qid].done) {
        // 仅提示，交付在 NPC 处完成
      }
    });
  },

  _nextDay() {
    Game.state.day++;
    Game.state.farm.plots.forEach(p => {
      if (p && p.watered) { p.day++; p.watered = false; }
    });
    // 回复少量 HP/MP（休息）
    Game.state.player.hp = Math.min(Game.state.player.maxHp, Game.state.player.hp + 10);
    Game.state.player.mp = Math.min(Game.state.player.maxMp, Game.state.player.mp + 8);
    Game.updateTopbar();
    Toast.show(`第 ${Game.state.day} 日`);
  }
};
