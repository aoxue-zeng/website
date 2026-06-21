/* ===========================================================
   systems/quest.js —— 任务/好感度
   =========================================================== */

const Quest = {
  /* 接受任务 */
  async accept(qid) {
    const q = QUESTS[qid];
    if (!q) return;
    Game.state.quests[qid] = { done: false, progress: 0 };
    await Dialogue.show([
      { speaker: NPCS[q.giver].name, text:`「${q.title}」\n${q.desc}`, portrait: q.giver }
    ]);
    Toast.show(`已接受委托：${q.title}`);
  },

  /* 检查并完成可交付的任务（在小镇/NPC 处调用） */
  async tryComplete(qid) {
    const q = QUESTS[qid];
    const st = Game.state.quests[qid];
    if (!q || !st || st.done) return false;

    if (q.type === 'deliver' && q.need) {
      for (const [item, n] of Object.entries(q.need)) {
        if (!Inventory.has(item, n)) { Toast.show(`需要 ${ITEMS[item].name} x${n}`); return false; }
      }
      for (const [item, n] of Object.entries(q.need)) Inventory.remove(item, n);
    } else if (q.type === 'collect' && q.need) {
      for (const [item, n] of Object.entries(q.need)) {
        if (!Inventory.has(item, n)) { Toast.show(`需要 ${ITEMS[item].name} x${n}`); return false; }
      }
      for (const [item, n] of Object.entries(q.need)) Inventory.remove(item, n);
    } else if (q.type === 'battle') {
      // 由战斗系统触发
    }

    st.done = true;
    this._grantReward(q);
    await Dialogue.show([
      { speaker: NPCS[q.giver].name, text:`辛苦了，${q.title} 已完成。这是给你的谢礼。`, portrait: q.giver }
    ]);
    Toast.show(`委托完成：${q.title}`);
    return true;
  },

  _grantReward(q) {
    const r = q.reward || {};
    if (r.gold) Game.state.player.gold += r.gold;
    if (r.items) r.items.forEach(id => Inventory.add(id, 1));
    if (r.affinity) {
      for (const [npc, v] of Object.entries(r.affinity)) {
        Game.state.npcAffinity[npc] = (Game.state.npcAffinity[npc] || 0) + v;
      }
    }
    Game.updateTopbar();
  },

  /* 好感度查询 */
  affinity(npcId) {
    return Game.state.npcAffinity[npcId] || 0;
  }
};
