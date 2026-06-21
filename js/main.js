/* ===========================================================
   main.js —— 入口：初始化全局状态与启动游戏
   =========================================================== */

(function () {
  // 等待 DOM 就绪
  function boot() {
    // 初始化各系统
    Farm.init();
    House.init();

    // 给 hub_actions 中的薇拉深度对话等留出钩子
    // 启动游戏 → 显示标题
    Game.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
