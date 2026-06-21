/* ===========================================================
   core/system-panel.js —— 系统面板（状态/背包/任务/副本记录）
   =========================================================== */

const SystemPanel = {
  open() {
    const panel = document.getElementById('system-panel');
    panel.classList.remove('hidden');
    this._bindTabs();
    this._showStatus();
    document.getElementById('action-menu').classList.add('hidden');
  },

  close() {
    document.getElementById('system-panel').classList.add('hidden');
    if (Game.state.mode === 'hub') Game._showHubMenu();
  },

  _bindTabs() {
    document.querySelectorAll('.panel-tab').forEach(tab => {
      if (tab.dataset.action === 'close-panel') {
        tab.onclick = () => this.close();
        return;
      }
      tab.onclick = () => {
        document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.panel-page').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const page = document.querySelector(`.panel-page[data-page="${tab.dataset.tab}"]`);
        page.classList.add('active');
        if (tab.dataset.tab === 'status') this._showStatus();
        else if (tab.dataset.tab === 'inventory') this._showInventory();
        else if (tab.dataset.tab === 'quest') this._showQuest();
        else if (tab.dataset.tab === 'dossier') this._showDossier();
      };
    });
  },

  _page(name) {
    return document.querySelector(`.panel-page[data-page="${name}"]`);
  },

  _showHtml(html) {
    // 渲染到 status 页（复用）
    document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel-page').forEach(p => p.classList.remove('active'));
    const statusTab = document.querySelector('.panel-tab[data-tab="status"]');
    if (statusTab) statusTab.classList.add('active');
    this._page('status').classList.add('active');
    this._page('status').innerHTML = html;
  },

  _showStatus() {
    const p = Game.state.player;
    const eq = p.equipment;
    const wName = eq.weapon ? ITEMS[eq.weapon].name : '无';
    const aName = eq.armor ? ITEMS[eq.armor].name : '无';
    const flags = Object.keys(Game.state.flags).filter(f => f.startsWith('ch'));
    let html = '<h3>艾瑟·塔柳斯·卡瑞娜</h3>';
    html += `<div class="stat-row"><span class="label">等级</span><span class="value">Lv.${p.lv}</span></div>`;
    html += `<div class="stat-row"><span class="label">经验</span><span class="value">${p.exp}/${p.expNext}</span></div>`;
    html += `<div class="stat-row"><span class="label">生命</span><span class="value">${p.hp}/${p.maxHp}</span></div>`;
    html += `<div class="stat-row"><span class="label">魔力</span><span class="value">${p.mp}/${p.maxMp}</span></div>`;
    html += `<div class="stat-row"><span class="label">攻击</span><span class="value">${p.atk}</span></div>`;
    html += `<div class="stat-row"><span class="label">防御</span><span class="value">${p.def}</span></div>`;
    html += `<div class="stat-row"><span class="label">金币</span><span class="value">${p.gold}</span></div>`;
    html += `<div class="stat-row"><span class="label">武器</span><span class="value">${wName}</span></div>`;
    html += `<div class="stat-row"><span class="label">防具</span><span class="value">${aName}</span></div>`;
    html += `<div class="stat-row"><span class="label">日数</span><span class="value">第 ${Game.state.day} 日</span></div>`;
    html += '<h3 style="margin-top:16px;">身份</h3>';
    html += '<p style="color:#d4c4a0;line-height:1.7;">艾瑟公爵 · 卡瑞娜魔女之子 · 月·浪漫·战争之神</p>';
    if (flags.length) {
      html += '<h3 style="margin-top:16px;">已达成</h3>';
      flags.forEach(f => { html += `<p style="color:#c8d6e5;">◆ ${f}</p>`; });
    }
    this._page('status').innerHTML = html;
  },

  _showInventory() {
    const inv = Game.state.inventory;
    let html = '<h3>背包</h3>';
    const ids = Object.keys(inv).filter(id => inv[id] > 0);
    if (!ids.length) html += '<p style="color:#d4c4a0;">空空如也。</p>';
    ids.forEach(id => {
      const it = ITEMS[id];
      if (!it) return;
      html += `<div class="inv-item"><span>${it.name} <span style="color:#8a8a9a;font-size:12px;">[${this._typeLabel(it.type)}]</span></span><span class="qty">x${inv[id]}</span></div>`;
      html += `<div style="font-size:12px;color:#8a8a9a;padding:0 8px 6px;">${it.desc}</div>`;
    });
    html += '<h3 style="margin-top:16px;">装备操作</h3>';
    // 装备武器/防具
    const p = Game.state.player;
    const weaps = ids.filter(id => ITEMS[id].type === 'equipment' && ITEMS[id].slot === 'weapon');
    const arms = ids.filter(id => ITEMS[id].type === 'equipment' && ITEMS[id].slot === 'armor');
    html += '<div id="equip-area"></div>';
    this._page('inventory').innerHTML = html;
    const area = document.getElementById('equip-area');
    weaps.forEach(id => {
      const it = ITEMS[id];
      const btn = document.createElement('button');
      btn.className = 'pixel-btn'; btn.style.fontSize='13px'; btn.style.margin='4px';
      btn.textContent = `装备 ${it.name}(atk+${it.atk})`;
      btn.onclick = () => {
        if (p.equipment.weapon) Inventory.add(p.equipment.weapon, 1);
        Inventory.remove(id, 1);
        p.equipment.weapon = id;
        this._recalcStats();
        this._showInventory();
        Toast.show(`装备 ${it.name}`);
      };
      area.appendChild(btn);
    });
    arms.forEach(id => {
      const it = ITEMS[id];
      const btn = document.createElement('button');
      btn.className = 'pixel-btn'; btn.style.fontSize='13px'; btn.style.margin='4px';
      btn.textContent = `装备 ${it.name}(def+${it.def})`;
      btn.onclick = () => {
        if (p.equipment.armor) Inventory.add(p.equipment.armor, 1);
        Inventory.remove(id, 1);
        p.equipment.armor = id;
        this._recalcStats();
        this._showInventory();
        Toast.show(`装备 ${it.name}`);
      };
      area.appendChild(btn);
    });
  },

  _typeLabel(t) {
    return { consumable:'消耗', equipment:'装备', seed:'种子', furniture:'家具', material:'材料', key:'关键' }[t] || t;
  },

  _recalcStats() {
    const p = Game.state.player;
    // 基础值随等级
    let atk = 14 + (p.lv - 1) * 3;
    let def = 6 + (p.lv - 1) * 2;
    if (p.equipment.weapon) atk += ITEMS[p.equipment.weapon].atk || 0;
    if (p.equipment.armor) def += ITEMS[p.equipment.armor].def || 0;
    p.atk = atk; p.def = def;
    Game.updateTopbar();
  },

  _showQuest() {
    let html = '<h3>任务</h3>';
    const qids = Object.keys(QUESTS);
    if (!qids.length) html += '<p style="color:#d4c4a0;">暂无任务。</p>';
    qids.forEach(qid => {
      const q = QUESTS[qid];
      const st = Game.state.quests[qid];
      const done = st && st.done;
      const npc = NPCS[q.giver];
      html += `<div class="quest-card ${done?'done':''}">`;
      html += `<div class="q-title">${q.title} ${done?'✓':''}</div>`;
      html += `<div class="q-desc">委托人：${npc ? npc.name : '？'}<br>${q.desc}</div>`;
      if (q.reward) {
        let r = [];
        if (q.reward.gold) r.push(`${q.reward.gold}金`);
        if (q.reward.items) r.push(q.reward.items.map(i=>ITEMS[i].name).join('、'));
        if (q.reward.affinity) r.push(Object.entries(q.reward.affinity).map(([k,v])=>`${NPCS[k].name}好感+${v}`).join('、'));
        html += `<div style="color:#f1c40f;margin-top:6px;font-size:13px;">奖励：${r.join(' / ')}</div>`;
      }
      html += '</div>';
    });
    this._page('quest').innerHTML = html;
  },

  _showDossier() {
    let html = '<h3>副本记录</h3>';
    const ch = Game.state.chapter;
    const list = [
      { id:'ch1_forest', title:'第一章 · 迷雾森林', desc:'系统最初的试炼。森林深处藏着不该存在的现代残骸。' },
      { id:'ch2_castle', title:'第二章 · 古堡迷踪', desc:'古堡地下室藏着一座现代实验室，以及你的"原型"。' },
      { id:'ch3_tower', title:'第三章 · 时空塔（终章）', desc:'直面系统的意志，做出最终抉择。' }
    ];
    list.forEach((d, i) => {
      const cleared = Game.state.flags[`ch${i+1}_clear`];
      html += `<div class="quest-card ${cleared?'done':''}">`;
      html += `<div class="q-title">${d.title} ${cleared?'✓ 已通过':(ch>=i+1?'进行中':'未开启')}</div>`;
      html += `<div class="q-desc">${d.desc}</div>`;
      html += '</div>';
    });
    html += '<h3 style="margin-top:16px;">已收集残片</h3>';
    const shards = Game.state.inventory.rift_shard || 0;
    html += `<p style="color:#c8d6e5;">裂缝残片 x${shards}</p>`;
    this._page('dossier').innerHTML = html;
  }
};
