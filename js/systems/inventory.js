/* ===========================================================
   systems/inventory.js —— 背包操作
   =========================================================== */

const Inventory = {
  add(itemId, qty = 1) {
    if (!ITEMS[itemId]) return;
    Game.state.inventory[itemId] = (Game.state.inventory[itemId] || 0) + qty;
  },

  remove(itemId, qty = 1) {
    if (!Game.state.inventory[itemId]) return;
    Game.state.inventory[itemId] -= qty;
    if (Game.state.inventory[itemId] <= 0) delete Game.state.inventory[itemId];
  },

  has(itemId, qty = 1) {
    return (Game.state.inventory[itemId] || 0) >= qty;
  },

  count(itemId) {
    return Game.state.inventory[itemId] || 0;
  },

  /* 使用消耗品 */
  async use(itemId) {
    const it = ITEMS[itemId];
    if (!it || it.type !== 'consumable') {
      Toast.show('该物品无法使用');
      return false;
    }
    if (!this.has(itemId)) { Toast.show('数量不足'); return false; }
    const p = Game.state.player;
    if (it.effect.hp) p.hp = Math.min(p.maxHp, p.hp + it.effect.hp);
    if (it.effect.mp) p.mp = Math.min(p.maxMp, p.mp + it.effect.mp);
    this.remove(itemId, 1);
    Game.updateTopbar();
    Toast.show(`使用了 ${it.name}`);
    return true;
  }
};
