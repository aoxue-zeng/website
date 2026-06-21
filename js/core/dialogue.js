/* ===========================================================
   core/dialogue.js —— 对话/打字机/选项
   Dialogue.show([{speaker,text,portrait,scene,sys}])
   Dialogue.choices([{text, value}]) -> Promise<value>
   =========================================================== */

const Dialogue = {
  _typing: false,
  _waitingChoice: false,
  _fullText: '',
  _timer: null,
  _resolveChoice: null,
  _selected: 0,

  /* 展示一段对话序列（数组），逐条推进 */
  async show(lines) {
    const layer = document.getElementById('dialogue-layer');
    layer.classList.remove('hidden');
    for (const line of lines) {
      await this._showOne(line);
    }
    layer.classList.add('hidden');
    this._clearPortrait();
  },

  async _showOne(line) {
    // 切换场景
    if (line.scene) Scene.render(line.scene);
    // 立绘
    this._setPortrait(line.portrait, line.sys);
    // 说话者
    const nameEl = document.getElementById('speaker-name');
    nameEl.textContent = line.speaker || '';
    nameEl.style.color = line.sys ? PALETTE.cyan : (line.speaker === '塔柳斯' ? PALETTE.roseLight : PALETTE.moon);

    // 单一 confirm 处理器：第一次点击=跳过打字机，第二次点击=进入下一条
    await new Promise(resolve => {
      const el = document.getElementById('dialogue-text');
      const arrow = document.getElementById('text-arrow');
      const text = line.text || '';
      el.textContent = '';
      arrow.style.visibility = 'hidden';

      let i = 0;
      this._typing = true;
      this._timer = setInterval(() => {
        if (i < text.length) {
          el.textContent += text[i++];
        } else {
          clearInterval(this._timer);
          this._typing = false;
          arrow.style.visibility = 'visible';
        }
      }, 28);

      // 提前注册处理器：点击时若仍在打字则跳过，否则推进
      const cb = () => {
        if (this._waitingChoice) { return; } // 选项期间不抢
        if (this._typing) {
          clearInterval(this._timer);
          el.textContent = text;
          this._typing = false;
          arrow.style.visibility = 'visible';
        } else {
          Input.off(cb);
          resolve();
        }
      };
      Input.on('confirm', cb);
    });
  },

  _type(text) { return Promise.resolve(); },   // 已并入 _showOne，保留占位避免外部引用报错
  _waitConfirm() { return Promise.resolve(); },

  /* 展示选项，返回所选 value */
  choices(options) {
    return new Promise(resolve => {
      this._waitingChoice = true;
      const list = document.getElementById('choice-list');
      list.innerHTML = '';
      this._selected = 0;
      this._resolveChoice = resolve;
      const arrow = document.getElementById('text-arrow');
      arrow.style.visibility = 'hidden';

      options.forEach((opt, idx) => {
        const item = document.createElement('button');
        item.className = 'choice-item' + (idx === 0 ? ' selected' : '');
        item.textContent = opt.text;
        item.dataset.idx = idx;
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          this._pick(idx, options);
        });
        list.appendChild(item);
      });

      // 键盘选择
      const upCb = () => { this._moveSel(-1); };
      const downCb = () => { this._moveSel(1); };
      const confirmCb = () => { this._pick(this._selected, options); };
      Input.on('up', upCb);
      Input.on('down', downCb);
      Input.on('confirm', confirmCb);
      this._choiceCbs = [upCb, downCb, confirmCb];
    });
  },

  _moveSel(dir) {
    const items = document.querySelectorAll('.choice-item');
    if (!items.length) return;
    this._selected = (this._selected + dir + items.length) % items.length;
    items.forEach((it, i) => it.classList.toggle('selected', i === this._selected));
  },

  _pick(idx, options) {
    // 取消已选择项的 click 监听冲突
    if (this._choiceCbs) {
      this._choiceCbs.forEach(cb => Input.off(cb));
      this._choiceCbs = null;
    }
    this._waitingChoice = false;
    const list = document.getElementById('choice-list');
    list.innerHTML = '';
    const arrow = document.getElementById('text-arrow');
    arrow.style.visibility = 'visible';
    const resolve = this._resolveChoice;
    this._resolveChoice = null;
    if (resolve) resolve(options[idx].value !== undefined ? options[idx].value : idx);
  },

  /* 战斗中使用的轻量选项：弹出在战斗层内，不触碰对话层
     返回所选 value（无选项时返回 null） */
  async _choicesInCombat(options) {
    if (!options || !options.length) return null;
    return new Promise(resolve => {
      const logEl = document.getElementById('combat-log');
      const box = document.createElement('div');
      box.style.cssText = 'margin-top:8px;display:flex;flex-direction:column;gap:4px;';
      options.forEach((opt) => {
        const b = document.createElement('button');
        b.className = 'choice-item';
        b.style.cssText = 'pointer-events:auto;background:rgba(0,0,0,0.5);border:1px solid #c8d6e5;';
        b.textContent = opt.text;
        b.onclick = () => { box.remove(); resolve(opt.value); };
        box.appendChild(b);
      });
      logEl.appendChild(box);
      logEl.scrollTop = logEl.scrollHeight;
    });
  },

  _setPortrait(charId, sys) {
    const area = document.getElementById('portrait-area');
    if (!charId || sys) {
      this._clearPortrait();
      return;
    }
    let canvas = area.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = 320; canvas.height = 380;
      area.appendChild(canvas);
    }
    Sprite.drawPortrait(canvas, charId, 'normal');
    area.classList.add('portrait-show');
    area.style.display = 'block';
  },

  _clearPortrait() {
    const area = document.getElementById('portrait-area');
    area.style.display = 'none';
    area.innerHTML = '';
  }
};
