/* ===========================================================
   systems/combat.js —— 回合制战斗
   Combat.start(enemyId) -> Promise<{win:boolean}>
   =========================================================== */

const Combat = {
  async start(enemyId) {
    const dun = Dungeon._currentDungeon;
    const enemyDef = (dun && dun.enemies && dun.enemies[enemyId]) || { name:enemyId, hp:50, atk:10, def:2, exp:20, gold:10, drop:{} };
    const enemy = { ...enemyDef, maxHp: enemyDef.hp };

    Game.state.mode = 'combat';
    const layer = document.getElementById('combat-layer');
    layer.classList.remove('hidden');
    document.getElementById('action-menu').classList.add('hidden');
    Scene.render(Dungeon._currentSceneKey || 'forest');

    // 敌人立绘
    const enemyArea = document.getElementById('combat-enemy');
    enemyArea.innerHTML = '';
    const nameEl = document.createElement('div'); nameEl.className = 'enemy-name'; nameEl.textContent = enemy.name;
    const hpBar = document.createElement('div'); hpBar.className = 'enemy-hp-bar';
    const hpFill = document.createElement('div'); hpFill.className = 'enemy-hp-fill'; hpFill.style.width = '100%';
    hpBar.appendChild(hpFill);
    const cv = document.createElement('canvas'); cv.width = 200; cv.height = 200;
    Sprite.drawEnemy(cv, enemyId);
    enemyArea.appendChild(nameEl);
    enemyArea.appendChild(hpBar);
    enemyArea.appendChild(cv);

    const logEl = document.getElementById('combat-log');
    logEl.innerHTML = '';
    this._log(`【${enemy.name} 出现！】`, 'sys');

    let defending = false;
    const p = Game.state.player;

    return new Promise(resolve => {
      const playerTurn = async (action) => {
        document.querySelectorAll('#combat-actions .pixel-btn').forEach(b => b.style.pointerEvents = 'none');
        defending = false;
        if (action === 'attack') {
          const dmg = Math.max(1, p.atk - enemy.def + Math.floor(Math.random()*4) - 2);
          enemy.hp -= dmg;
          this._log(`塔柳斯挥剑，造成 ${dmg} 伤害。`, 'dmg');
        } else if (action === 'skill') {
          if (p.mp < 10) { this._log('魔力不足！', 'sys'); }
          else {
            p.mp -= 10;
            const dmg = Math.max(1, Math.floor(p.atk * 1.8) - enemy.def);
            enemy.hp -= dmg;
            this._log(`塔柳斯释放「玫瑰之刺」！造成 ${dmg} 伤害。`, 'dmg');
            Game.updateTopbar();
          }
        } else if (action === 'defend') {
          defending = true;
          this._log('塔柳斯举剑防御。', 'log');
        } else if (action === 'item') {
          const opts = Object.keys(Game.state.inventory)
            .filter(id => ITEMS[id] && ITEMS[id].type === 'consumable' && Game.state.inventory[id] > 0)
            .map(id => ({ text:`${ITEMS[id].name} x${Game.state.inventory[id]}`, value:id }));
          opts.push({ text:'返回', value:'back' });
          const pick = await Dialogue._choicesInCombat(opts);
          if (pick && pick !== 'back') {
            await Inventory.use(pick);
          }
        }
        hpFill.style.width = Math.max(0, enemy.hp / enemy.maxHp * 100) + '%';

        if (enemy.hp <= 0) {
          this._log(`击败 ${enemy.name}！`, 'heal');
          setTimeout(() => this._end(true, enemy, resolve), 600);
          return;
        }

        // 敌人回合
        setTimeout(() => {
          let edmg = Math.max(1, enemy.atk - p.def + Math.floor(Math.random()*4) - 2);
          if (defending) edmg = Math.floor(edmg / 2);
          p.hp -= edmg;
          this._log(`${enemy.name} 反击，造成 ${edmg} 伤害。`, 'dmg');
          Game.updateTopbar();
          if (p.hp <= 0) {
            p.hp = 0; Game.updateTopbar();
            this._log('塔柳斯倒下了……', 'sys');
            setTimeout(() => this._end(false, enemy, resolve), 800);
            return;
          }
          document.querySelectorAll('#combat-actions .pixel-btn').forEach(b => b.style.pointerEvents = 'auto');
        }, 500);
      };

      document.querySelectorAll('#combat-actions .pixel-btn').forEach(btn => {
        btn.onclick = () => playerTurn(btn.dataset.combat);
      });
    });
  },

  _log(text, type) {
    const logEl = document.getElementById('combat-log');
    const line = document.createElement('div');
    line.className = 'log-line ' + (type === 'dmg' ? 'log-dmg' : type === 'heal' ? 'log-heal' : type === 'sys' ? 'log-sys' : '');
    line.textContent = text;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  },

  _end(win, enemy, resolve) {
    const layer = document.getElementById('combat-layer');
    layer.classList.add('hidden');
    if (win) {
      Game.gainExp(enemy.exp || 20);
      Game.state.player.gold += enemy.gold || 0;
      if (enemy.drop && Math.random() < (enemy.drop.rate || 0.5)) {
        const dropId = Object.keys(enemy.drop).find(k => k !== 'rate');
        if (dropId) { Inventory.add(dropId, enemy.drop[dropId]); Toast.show(`获得 ${ITEMS[dropId].name}`); }
      }
      Game.updateTopbar();
    } else {
      // 失败：回到枢纽，扣一半金币，恢复HP
      Toast.show('战斗失败，被薇拉救回公爵府');
      Game.state.player.hp = Math.floor(Game.state.player.maxHp * 0.5);
      Game.state.player.mp = Math.floor(Game.state.player.maxMp * 0.5);
      Game.state.player.gold = Math.floor(Game.state.player.gold / 2);
      Game.updateTopbar();
    }
    Game.state.mode = 'dungeon';
    resolve({ win });
  }
};
