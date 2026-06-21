/* ===========================================================
   core/input.js —— 输入管理
   键盘 + 鼠标点击统一处理，供 dialogue/dungeon 等订阅
   =========================================================== */

const Input = {
  _listeners: [],   // {key, cb}
  _clickCb: null,

  init() {
    document.addEventListener('keydown', (e) => {
      const k = e.key;
      // Enter / Space 推进
      if (k === 'Enter' || k === ' ' || k === 'Spacebar') {
        e.preventDefault();
        this._fire('confirm');
      } else if (k === 'Escape') {
        this._fire('cancel');
      } else if (k === 'ArrowUp' || k === 'w' || k === 'W') {
        this._fire('up');
      } else if (k === 'ArrowDown' || k === 's' || k === 'S') {
        this._fire('down');
      } else if (k === 'ArrowLeft' || k === 'a' || k === 'A') {
        this._fire('left');
      } else if (k === 'ArrowRight' || k === 'd' || k === 'D') {
        this._fire('right');
      } else {
        this._fire(k);
      }
    });

    // 整个游戏舞台点击 = confirm
    document.getElementById('game-frame').addEventListener('click', (e) => {
      // 让按钮自己处理点击，这里只处理非按钮区域
      if (e.target.closest('button')) return;
      this._fire('confirm');
    });
  },

  on(key, cb) {
    this._listeners.push({ key, cb });
  },

  off(cb) {
    this._listeners = this._listeners.filter(l => l.cb !== cb);
  },

  _fire(key) {
    // 后注册的先响应（便于临时覆盖）
    for (let i = this._listeners.length - 1; i >= 0; i--) {
      const l = this._listeners[i];
      if (l.key === key) {
        l.cb(key);
        break;
      }
    }
  }
};
