/* ===========================================================
   core/save.js —— 存档系统（localStorage，3 存档位）
   =========================================================== */

const SAVE_KEY = 'yuese_save_v1';
const SAVE_SLOTS = 3;

const Save = {
  /* 读取全部存档槽 */
  list() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : [null, null, null];
    } catch (e) {
      return [null, null, null];
    }
  },

  /* 存档到指定槽位 */
  save(slot, data) {
    if (slot < 0 || slot >= SAVE_SLOTS) return false;
    const all = this.list();
    all[slot] = {
      ...data,
      _time: new Date().toLocaleString('zh-CN'),
      _chapter: Game.state.chapter,
      _scene: Game.state.currentScene
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(all));
      return true;
    } catch (e) {
      console.error('存档失败', e);
      return false;
    }
  },

  /* 读档 */
  load(slot) {
    const all = this.list();
    return all[slot] || null;
  },

  /* 删除存档 */
  erase(slot) {
    const all = this.list();
    all[slot] = null;
    localStorage.setItem(SAVE_KEY, JSON.stringify(all));
  },

  /* 是否有任意存档 */
  hasAny() {
    return this.list().some(s => s !== null);
  },

  slots: SAVE_SLOTS
};
