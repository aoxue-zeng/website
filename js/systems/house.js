/* ===========================================================
   systems/house.js —— 房屋装修（网格化摆放家具，影响舒适度）
   网格 6x4，家具占 size[w,h]
   =========================================================== */

const House = {
  GRID_W: 6,
  GRID_H: 4,

  init() {
    if (!Game.state.house) Game.state.house = { furniture: [] };
    // furniture: [{ itemId, x, y }]
    if (!Array.isArray(Game.state.house.furniture)) Game.state.house.furniture = [];
  },

  async enter() {
    this.init();
    Game.state.mode = 'house';
    Game.state.currentScene = 'house';
    Scene.render('house');
    document.getElementById('action-menu').classList.add('hidden');
    await this._menu();
  },

  async _menu() {
    await Dialogue.show([
      { speaker:'', text:'你回到公爵府内自己的小屋。墙上挂着薇拉整理的玫瑰标本。', portrait:null, scene:'house' }
    ]);
    await this._mainLoop();
  },

  async _mainLoop() {
    let loop = true;
    while (loop) {
      this._render();
      const opts = [
        { text:'摆放家具', value:'place' },
        { text:'移除家具', value:'remove' },
        { text:'查看舒适度', value:'comfort' },
        { text:'返回小镇', value:'leave' }
      ];
      const pick = await Dialogue.choices(opts);
      if (pick === 'place') await this._place();
      else if (pick === 'remove') await this._remove();
      else if (pick === 'comfort') this._showComfort();
      else loop = false;
    }
    Game.enterHub();
  },

  _render() {
    const f = Game.state.house.furniture;
    const grid = this._gridSnapshot();
    let lines = [];
    for (let y = 0; y < this.GRID_H; y++) {
      let row = '';
      for (let x = 0; x < this.GRID_W; x++) {
        row += grid[y][x] ? '■' : '·';
      }
      lines.push(row);
    }
    Toast.show(lines.join('\n').replace(/\n/g,'  '));
  },

  _gridSnapshot() {
    const grid = [];
    for (let y = 0; y < this.GRID_H; y++) grid.push(new Array(this.GRID_W).fill(null));
    Game.state.house.furniture.forEach(fur => {
      const it = ITEMS[fur.itemId];
      if (!it) return;
      for (let dy = 0; dy < it.size[1]; dy++) {
        for (let dx = 0; dx < it.size[0]; dx++) {
          const gx = fur.x + dx, gy = fur.y + dy;
          if (grid[gy] && gx < this.GRID_W) grid[gy][gx] = fur.itemId;
        }
      }
    });
    return grid;
  },

  _canPlace(itemId, x, y) {
    const it = ITEMS[itemId];
    if (!it) return false;
    const grid = this._gridSnapshot();
    for (let dy = 0; dy < it.size[1]; dy++) {
      for (let dx = 0; dx < it.size[0]; dx++) {
        const gx = x + dx, gy = y + dy;
        if (gx >= this.GRID_W || gy >= this.GRID_H) return false;
        if (grid[gy][gx]) return false;
      }
    }
    return true;
  },

  async _place() {
    const owned = Object.keys(Game.state.inventory)
      .filter(id => ITEMS[id] && ITEMS[id].type === 'furniture' && Game.state.inventory[id] > 0);
    if (!owned.length) { Toast.show('没有可摆放的家具'); return; }
    const opts = owned.map(id => ({ text:`${ITEMS[id].name} x${Game.state.inventory[id]}`, value:id }));
    opts.push({ text:'取消', value:'cancel' });
    const pick = await Dialogue.choices(opts);
    if (pick === 'cancel' || !pick) return;

    // 选择位置：列出可用坐标
    const spots = [];
    for (let y = 0; y < this.GRID_H; y++) {
      for (let x = 0; x < this.GRID_W; x++) {
        if (this._canPlace(pick, x, y)) spots.push({ x, y });
      }
    }
    if (!spots.length) { Toast.show('没有空位放置'); return; }
    const posOpts = spots.map(s => ({ text:`位置 (${s.x+1},${s.y+1})`, value:`${s.x},${s.y}` }));
    posOpts.push({ text:'取消', value:'cancel' });
    const posPick = await Dialogue.choices(posOpts);
    if (posPick === 'cancel' || !posPick) return;
    const [x, y] = posPick.split(',').map(Number);
    Inventory.remove(pick, 1);
    Game.state.house.furniture.push({ itemId: pick, x, y });
    Toast.show(`摆放了 ${ITEMS[pick].name}`);
  },

  async _remove() {
    const f = Game.state.house.furniture;
    if (!f.length) { Toast.show('屋内没有家具'); return; }
    const opts = f.map((fur, i) => ({ text:`${ITEMS[fur.itemId].name} @(${fur.x+1},${fur.y+1})`, value:String(i) }));
    opts.push({ text:'取消', value:'cancel' });
    const pick = await Dialogue.choices(opts);
    if (pick === 'cancel' || pick === undefined) return;
    const idx = parseInt(pick, 10);
    const fur = f[idx];
    Inventory.add(fur.itemId, 1);
    f.splice(idx, 1);
    Toast.show(`收回 ${ITEMS[fur.itemId].name}`);
  },

  _comfort() {
    let c = 0;
    Game.state.house.furniture.forEach(fur => {
      c += (ITEMS[fur.itemId].comfort || 0);
    });
    return c;
  },

  _showComfort() {
    Toast.show(`舒适度：${this._comfort()}`);
  }
};
