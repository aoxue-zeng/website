/* ===========================================================
   systems/dungeon.js —— 副本探索流程
   Dungeon.enter(dungeonId) -> 进入副本，按 scenes 流程推进
   =========================================================== */

const Dungeon = {
  _currentDungeon: null,
  _currentSceneKey: null,
  _currentSceneId: null,

  async enter(dungeonId) {
    const dun = DUNGEONS[dungeonId];
    if (!dun) return;
    this._currentDungeon = dun;
    this._currentSceneKey = dun.sceneKey;
    Game.state.mode = 'dungeon';
    Scene.render(dun.sceneKey);

    // 副本开场提示
    await Dialogue.show([
      { speaker:'系统', text:dun.intro, portrait:null, sys:true, scene:dun.sceneKey }
    ]);

    // 从 start 场景开始
    await this._goto('start');
  },

  async _goto(sceneId) {
    if (sceneId === '__EXIT__') {
      await this._exit();
      return;
    }
    if (sceneId === '__ENDING__') {
      // 结局处理
      const flag = Object.keys(Game.state.flags).find(f => f.startsWith('ending_'));
      await Game.ending(flag || 'ending_C');
      return;
    }

    const dun = this._currentDungeon;
    const scene = dun.scenes[sceneId];
    if (!scene) { console.warn('未知场景:', sceneId); return; }
    this._currentSceneId = sceneId;

    // onEnter 效果
    if (scene.onEnter) this._applyOnEnter(scene.onEnter);

    // 渲染场景文本
    const lines = [{ speaker:'', text:scene.text, portrait:null, scene:this._currentSceneKey }];
    await Dialogue.show(lines);

    // 战斗场景
    const combatChoice = scene.choices && scene.choices.find(c => c.tag === 'combat');
    if (scene.enemy && combatChoice) {
      const result = await Combat.start(scene.enemy);
      if (!result.win) {
        // 失败已由 combat 处理（送回枢纽）
        return;
      }
      // 战斗胜利后进入 combat 选项的 next
      await this._goto(combatChoice.next);
      return;
    }

    // 普通选项
    if (!scene.choices || !scene.choices.length) return;
    const opts = scene.choices.map((c, i) => {
      // 处理 condition
      let enabled = true;
      if (c.condition) enabled = this._checkCond(c.condition);
      return { text: (enabled ? '' : '【条件不足】') + c.text, value: enabled ? c.next : '__DISABLED__' + i, enabled };
    });
    let pick = await Dialogue.choices(opts);
    while (pick && pick.startsWith('__DISABLED__')) {
      Toast.show('条件不足，无法选择');
      pick = await Dialogue.choices(opts);
    }

    // 标签为 menu 的选项：打开系统面板后返回当前场景
    const chosen = scene.choices.find(c => c.next === pick);
    if (chosen && chosen.tag === 'menu') {
      SystemPanel.open();
      // 面板关闭后重新进入当前场景
      const waitClose = () => {
        if (!document.getElementById('system-panel').classList.contains('hidden')) {
          setTimeout(waitClose, 200);
        } else {
          this._goto(sceneId);
        }
      };
      setTimeout(waitClose, 300);
      return;
    }

    await this._goto(pick);
  },

  _applyOnEnter(effect) {
    if (effect.give) effect.give.forEach(id => { Inventory.add(id, 1); Toast.show(`获得 ${ITEMS[id].name}`); });
    if (effect.cost) {
      if (effect.cost.mp) Game.state.player.mp = Math.max(0, Game.state.player.mp - effect.cost.mp);
    }
    if (effect.exp) Game.gainExp(effect.exp);
    if (effect.flag) Game.state.flags[effect.flag] = true;
    Game.updateTopbar();
  },

  _checkCond(cond) {
    // 形如 'mp>=15'
    const m = cond.match(/(\w+)(>=|<=|>|<|==)(\d+)/);
    if (!m) return true;
    const [, key, op, val] = m;
    const v = Game.state.player[key] || 0;
    const n = parseInt(val, 10);
    switch (op) {
      case '>=': return v >= n;
      case '<=': return v <= n;
      case '>': return v > n;
      case '<': return v < n;
      case '==': return v == n;
    }
    return true;
  },

  async _exit() {
    const dun = this._currentDungeon;
    // 标记该章通关
    const chMap = { ch1_forest:1, ch2_castle:2, ch3_tower:3 };
    const ch = chMap[dun.id];
    if (ch) Game.state.flags[`ch${ch}_clear`] = true;
    // 奖励
    if (dun.reward) {
      if (dun.reward.exp) Game.gainExp(dun.reward.exp);
      if (dun.reward.gold) { Game.state.player.gold += dun.reward.gold; }
      if (dun.reward.items) dun.reward.items.forEach(id => { if (ITEMS[id]) { Inventory.add(id,1); } });
    }
    Game.updateTopbar();
    Toast.show(`副本通关：${dun.title}`);

    this._currentDungeon = null;
    // 终章副本结束后，结局已在 __ENDING__ 处理；这里返回枢纽
    if (ch === 3) {
      // 终章不应走到这里（结局在副本内）
      return;
    }
    // 其余章回：由 Game.startChapter 继续播放 after_chN
  }
};
